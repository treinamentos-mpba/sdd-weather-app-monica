import type { City, CurrentWeather, DailyForecast, WeatherData } from '../types/weather';

export type WeatherServiceErrorKind = 'network' | 'api' | 'timeout' | 'invalid-response';

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly kind: WeatherServiceErrorKind,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REQUEST_TIMEOUT_MS = 10_000;
const FORECAST_DAYS = 5;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readArrayNumber(value: unknown, index: number): number | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return readNumber(value[index]);
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
}

async function fetchWithTimeout(url: string | URL): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw new WeatherServiceError('A requisição demorou demais.', 'timeout');
    }

    throw new WeatherServiceError('Falha de rede.', 'network');
  } finally {
    clearTimeout(timeoutId);
  }
}

function mapCityResult(value: unknown): City {
  if (
    !isRecord(value) ||
    typeof value.name !== 'string' ||
    typeof value.latitude !== 'number' ||
    !Number.isFinite(value.latitude) ||
    typeof value.longitude !== 'number' ||
    !Number.isFinite(value.longitude) ||
    typeof value.timezone !== 'string'
  ) {
    throw new WeatherServiceError(
      'Um resultado de geocoding não contém os campos obrigatórios.',
      'invalid-response',
    );
  }

  return {
    ...(typeof value.id === 'number' ? { id: value.id } : {}),
    name: value.name,
    ...(typeof value.admin1 === 'string' ? { admin1: value.admin1 } : {}),
    ...(typeof value.country === 'string' ? { country: value.country } : {}),
    latitude: value.latitude,
    longitude: value.longitude,
    timezone: value.timezone,
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const normalizedName = name.trim();

  if (normalizedName.length === 0) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(normalizedName)}&count=10&language=pt&format=json`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      `O serviço de busca de cidades respondeu com HTTP ${response.status}.`,
      'api',
      response.status,
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new WeatherServiceError(
      'A resposta de geocoding não contém JSON válido.',
      'invalid-response',
    );
  }

  if (!isRecord(payload)) {
    throw new WeatherServiceError(
      'A resposta de geocoding não é um objeto JSON.',
      'invalid-response',
    );
  }

  if (!('results' in payload) || payload.results === null) {
    return [];
  }

  if (!Array.isArray(payload.results)) {
    throw new WeatherServiceError(
      'O campo results de geocoding não é uma lista.',
      'invalid-response',
    );
  }

  return payload.results.map(mapCityResult);
}

export async function getWeather(city: City): Promise<WeatherData> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', String(city.latitude));
  url.searchParams.set('longitude', String(city.longitude));
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'surface_pressure',
    ].join(','),
  );
  url.searchParams.set(
    'daily',
    [
      'weather_code',
      'temperature_2m_min',
      'temperature_2m_max',
      'precipitation_probability_max',
    ].join(','),
  );
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('wind_speed_unit', 'kmh');
  url.searchParams.set('precipitation_unit', 'mm');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', String(FORECAST_DAYS));

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      `O serviço meteorológico respondeu com HTTP ${response.status}.`,
      'api',
      response.status,
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new WeatherServiceError(
      'A resposta do serviço meteorológico não contém JSON válido.',
      'invalid-response',
    );
  }

  if (!isRecord(payload) || !isRecord(payload.current) || !isRecord(payload.daily)) {
    throw new WeatherServiceError(
      'A resposta do serviço meteorológico não contém current e daily.',
      'invalid-response',
    );
  }

  const currentResponse = payload.current;
  const dailyResponse = payload.daily;
  const dates = dailyResponse.time;

  if (
    !Array.isArray(dates) ||
    dates.length !== FORECAST_DAYS ||
    dates.some((date) => typeof date !== 'string')
  ) {
    throw new WeatherServiceError(
      'A resposta do serviço meteorológico não contém cinco datas válidas em daily.time.',
      'invalid-response',
    );
  }

  const current: CurrentWeather = {
    weatherCode: readNumber(currentResponse.weather_code),
    temperatureC: readNumber(currentResponse.temperature_2m),
    apparentTemperatureC: readNumber(currentResponse.apparent_temperature),
    relativeHumidityPercent: readNumber(currentResponse.relative_humidity_2m),
    precipitationMm:
      currentResponse.precipitation === null ? 0 : readNumber(currentResponse.precipitation),
    windSpeedKmh: readNumber(currentResponse.wind_speed_10m),
    surfacePressureHpa: readNumber(currentResponse.surface_pressure),
  };

  const forecast: DailyForecast[] = dates.map((date, index) => ({
    date,
    weatherCode: readArrayNumber(dailyResponse.weather_code, index),
    minTemperatureC: readArrayNumber(dailyResponse.temperature_2m_min, index),
    maxTemperatureC: readArrayNumber(dailyResponse.temperature_2m_max, index),
    precipitationProbabilityMaxPercent: readArrayNumber(
      dailyResponse.precipitation_probability_max,
      index,
    ),
  }));

  return {
    city: {
      ...city,
      timezone: typeof payload.timezone === 'string' ? payload.timezone : city.timezone,
    },
    current,
    forecast,
  };
}
