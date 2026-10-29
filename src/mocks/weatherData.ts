import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 2267057,
    name: 'Lisboa',
    admin1: 'Lisboa',
    country: 'Portugal',
    latitude: 38.7167,
    longitude: -9.1333,
    timezone: 'Europe/Lisbon',
  },
  current: {
    weatherCode: 2,
    temperatureC: 18.4,
    apparentTemperatureC: 18,
    relativeHumidityPercent: 63,
    precipitationMm: 0,
    windSpeedKmh: 12.6,
    surfacePressureHpa: 1013.2,
  },
  forecast: [
    {
      date: '2026-10-29',
      weatherCode: 2,
      minTemperatureC: 14.2,
      maxTemperatureC: 21,
      precipitationProbabilityMaxPercent: 10,
    },
    {
      date: '2026-10-30',
      weatherCode: 3,
      minTemperatureC: 13.8,
      maxTemperatureC: 20.4,
      precipitationProbabilityMaxPercent: 20,
    },
    {
      date: '2026-10-31',
      weatherCode: 61,
      minTemperatureC: 15.1,
      maxTemperatureC: 19.2,
      precipitationProbabilityMaxPercent: 70,
    },
    {
      date: '2026-11-01',
      weatherCode: 3,
      minTemperatureC: 12.7,
      maxTemperatureC: 18.8,
      precipitationProbabilityMaxPercent: 15,
    },
    {
      date: '2026-11-02',
      weatherCode: 1,
      minTemperatureC: 13,
      maxTemperatureC: 20.1,
      precipitationProbabilityMaxPercent: 5,
    },
  ],
};
