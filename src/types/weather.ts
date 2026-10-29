export type Unit = 'celsius' | 'fahrenheit';

export type TemperatureUnit = Unit;

export interface City {
  id?: number; // Identificador Open-Meteo, quando disponível.
  name: string; // Nome da cidade.
  admin1?: string; // Região administrativa, como estado ou província.
  country?: string; // Nome do país.
  latitude: number; // Latitude usada nas consultas meteorológicas.
  longitude: number; // Longitude usada nas consultas meteorológicas.
  timezone: string; // Fuso horário IANA da cidade.
}

export interface CurrentWeather {
  weatherCode: number | null; // Código WMO da condição atual.
  temperatureC: number | null; // Temperatura atual em Celsius.
  apparentTemperatureC: number | null; // Sensação térmica em Celsius.
  relativeHumidityPercent: number | null; // Umidade relativa em porcentagem.
  precipitationMm: number | null; // Precipitação em milímetros.
  windSpeedKmh: number | null; // Velocidade do vento em km/h.
  surfacePressureHpa: number | null; // Pressão atmosférica ao nível da superfície em hPa.
}

export interface ForecastDay {
  date: string; // Data local no formato YYYY-MM-DD.
  weatherCode: number | null; // Código WMO da condição prevista.
  minTemperatureC: number | null; // Temperatura mínima em Celsius.
  maxTemperatureC: number | null; // Temperatura máxima em Celsius.
  precipitationProbabilityMaxPercent: number | null; // Probabilidade máxima de precipitação em porcentagem.
}

export type DailyForecast = ForecastDay;

export interface WeatherData {
  city: City; // Localidade consultada.
  current: CurrentWeather; // Condições meteorológicas atuais.
  forecast: ForecastDay[]; // Previsão diária; o MVP usa cinco dias.
}

export type WeatherSnapshot = WeatherData;
