import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  name: 'Lisboa',
  latitude: 38.7167,
  longitude: -9.1333,
  timezone: 'Europe/Lisbon',
};

function createForecastPayload() {
  return {
    timezone: 'Europe/Lisbon',
    current: {
      temperature_2m: 18.4,
      apparent_temperature: 18,
      relative_humidity_2m: 63,
      precipitation: 0,
      weather_code: 2,
      wind_speed_10m: 12.6,
      surface_pressure: 1013.2,
    },
    daily: {
      time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
      weather_code: [2, 3, 61, 3, 1],
      temperature_2m_min: [14.2, 13.8, 15.1, 12.7, 13],
      temperature_2m_max: [21, 20.4, 19.2, 18.8, 20.1],
      precipitation_probability_max: [10, 20, 70, 15, 5],
    },
  };
}

function mockJsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('getWeather', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('requests current and daily fields and maps five forecast days', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(mockJsonResponse(createForecastPayload()));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);
    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);

    expect(requestUrl.origin).toBe('https://api.open-meteo.com');
    expect(requestUrl.pathname).toBe('/v1/forecast');
    expect(requestUrl.searchParams.get('current')).toContain('surface_pressure');
    expect(requestUrl.searchParams.get('daily')).toContain('temperature_2m_min');
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
    expect(result.city.timezone).toBe('Europe/Lisbon');
    expect(result.current.surfacePressureHpa).toBe(1013.2);
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0]).toEqual({
      date: '2026-10-29',
      weatherCode: 2,
      minTemperatureC: 14.2,
      maxTemperatureC: 21,
      precipitationProbabilityMaxPercent: 10,
    });
  });

  it.each([
    'current',
    'daily',
  ])('throws WeatherServiceError when %s is absent', async (missingKey) => {
    const payload = createForecastPayload();
    delete payload[missingKey as keyof typeof payload];
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(mockJsonResponse(payload)));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: WeatherServiceError.name,
      kind: 'invalid-response',
    });
  });

  it('throws WeatherServiceError for a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(mockJsonResponse({}, 503)));

    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'api', status: 503 });
  });

  it('throws WeatherServiceError for invalid forecast JSON', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response('{ invalid json')));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: WeatherServiceError.name,
      kind: 'invalid-response',
    });
  });

  it('throws WeatherServiceError when daily has fewer than five dates', async () => {
    const payload = createForecastPayload();
    const daily = payload.daily as Record<string, unknown>;
    daily.time = ['2026-10-29', '2026-10-30'];
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(mockJsonResponse(payload)));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: WeatherServiceError.name,
      kind: 'invalid-response',
    });
  });

  it('maps absent individual values to null when current and daily objects exist', async () => {
    const payload = createForecastPayload();
    const current = payload.current as Record<string, unknown>;
    current.temperature_2m = null;
    current.precipitation = null;
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(mockJsonResponse(payload)));

    const result = await getWeather(city);

    expect(result.current.temperatureC).toBeNull();
    expect(result.current.precipitationMm).toBe(0);
    expect(result.forecast).toHaveLength(5);
  });

  it('preserves available values and maps omitted current/daily fields to null', async () => {
    const payload = createForecastPayload();
    const current = payload.current as Record<string, unknown>;
    const daily = payload.daily as Record<string, unknown>;
    delete current.apparent_temperature;
    delete current.relative_humidity_2m;
    daily.temperature_2m_max = [21, 20.4, 19.2, 18.8];
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(mockJsonResponse(payload)));

    const result = await getWeather(city);

    expect(result.current.temperatureC).toBe(18.4);
    expect(result.current.apparentTemperatureC).toBeNull();
    expect(result.current.relativeHumidityPercent).toBeNull();
    expect(result.forecast[0].maxTemperatureC).toBe(21);
    expect(result.forecast[4].maxTemperatureC).toBeNull();
    expect(result.forecast).toHaveLength(5);
  });

  it('converts an AbortError to the timeout service error and clears the timer', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>((_input, init) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => reject(new DOMException('Aborted', 'AbortError')),
          { once: true },
        );
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = getWeather(city);
    const rejectionAssertion = expect(request).rejects.toMatchObject({
      name: WeatherServiceError.name,
      kind: 'timeout',
      message: 'A requisição demorou demais.',
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await rejectionAssertion;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('converts a network failure to the requested service error and clears the timer', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed')));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: WeatherServiceError.name,
      kind: 'network',
      message: 'Falha de rede.',
    });
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('searchCities', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an empty list without calling the network for blank input', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes the trimmed name and maps geocoding results to City', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      mockJsonResponse({
        results: [
          {
            id: 2267057,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const cities = await searchCities('  São Paulo  ');
    const requestUrl = fetchMock.mock.calls[0][0] as string;

    expect(requestUrl).toContain('name=S%C3%A3o%20Paulo');
    expect(cities).toEqual([
      {
        id: 2267057,
        name: 'São Paulo',
        admin1: 'São Paulo',
        country: 'Brasil',
        latitude: -23.55,
        longitude: -46.63,
        timezone: 'America/Sao_Paulo',
      },
    ]);
  });

  it('preserves special characters in the geocoding query', async () => {
    const name = "L'Haÿ-les-Roses";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(mockJsonResponse({ results: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await searchCities(name);

    const requestUrl = fetchMock.mock.calls[0][0] as string;
    expect(new URL(requestUrl).searchParams.get('name')).toBe(name);
  });

  it('returns an empty list when geocoding has no results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(mockJsonResponse({ results: null })),
    );

    await expect(searchCities('Cidade inexistente')).resolves.toEqual([]);
  });

  it('returns an empty list when the geocoding response omits results', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(mockJsonResponse({})));

    await expect(searchCities('Cidade inexistente')).resolves.toEqual([]);
  });

  it('throws WeatherServiceError for a non-OK geocoding response', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(mockJsonResponse({}, 503)));

    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      name: WeatherServiceError.name,
      kind: 'api',
      status: 503,
    });
  });

  it('throws WeatherServiceError when geocoding is offline', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed')));

    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      name: WeatherServiceError.name,
      kind: 'network',
      message: 'Falha de rede.',
    });
  });

  it('preserves homonymous geocoding results as distinct cities', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        mockJsonResponse({
          results: [
            {
              name: 'Santiago',
              admin1: 'Região A',
              country: 'País',
              latitude: 1,
              longitude: 2,
              timezone: 'UTC',
            },
            {
              name: 'Santiago',
              admin1: 'Região B',
              country: 'País',
              latitude: 3,
              longitude: 4,
              timezone: 'UTC',
            },
          ],
        }),
      ),
    );

    const results = await searchCities('Santiago');

    expect(results).toHaveLength(2);
    expect(results.map((result) => result.admin1)).toEqual(['Região A', 'Região B']);
  });

  it('throws WeatherServiceError when a result lacks required City fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(mockJsonResponse({ results: [{ name: 'Lisboa' }] })),
    );

    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      name: WeatherServiceError.name,
      kind: 'invalid-response',
    });
  });
});
