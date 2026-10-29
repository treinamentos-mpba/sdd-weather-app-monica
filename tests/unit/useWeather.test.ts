import { act, renderHook } from '@testing-library/react';
import useWeather from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities } from '../../src/services/weatherService';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {
    constructor(
      message: string,
      public readonly kind: string,
      public readonly status?: number,
    ) {
      super(message);
      this.name = 'WeatherServiceError';
    }
  },
}));

const mockedSearchCities = vi.mocked(searchCities);
const mockedGetWeather = vi.mocked(getWeather);

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts idle and exposes the requested state and actions', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.query).toBe('');
    expect(result.current.search).toEqual(expect.any(Function));
    expect(result.current.selectCity).toEqual(expect.any(Function));
    expect(result.current.retry).toEqual(expect.any(Function));
  });

  it('searches and loads weather for the first returned city', async () => {
    mockedSearchCities.mockResolvedValue([mockWeatherData.city]);
    mockedGetWeather.mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('  Lisboa  ');
    });

    expect(mockedSearchCities).toHaveBeenCalledWith('Lisboa');
    expect(mockedGetWeather).toHaveBeenCalledWith(mockWeatherData.city);
    expect(result.current.status).toBe('success');
    expect(result.current.query).toBe('Lisboa');
    expect(result.current.cities).toEqual([mockWeatherData.city]);
    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.error).toBeNull();
  });

  it('sets empty when search returns no cities and does not request weather', async () => {
    mockedSearchCities.mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Porto');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
    expect(result.current.data).toBeNull();
    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it('sets empty without calling the service for a blank query', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('   ');
    });

    expect(result.current.status).toBe('empty');
    expect(mockedSearchCities).not.toHaveBeenCalled();
  });

  it('selects a city and retries the last select operation', async () => {
    mockedGetWeather
      .mockRejectedValueOnce(new Error('Falha de rede.'))
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(mockWeatherData.city);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Falha de rede.');

    await act(async () => {
      await result.current.retry();
    });

    expect(mockedGetWeather).toHaveBeenCalledTimes(2);
    expect(mockedGetWeather).toHaveBeenLastCalledWith(mockWeatherData.city);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(mockWeatherData);
  });
});
