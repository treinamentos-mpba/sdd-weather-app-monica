import { useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation = { kind: 'search'; name: string } | { kind: 'select-city'; city: City };

function toWeatherServiceError(error: unknown): WeatherServiceError {
  if (error instanceof WeatherServiceError) {
    return error;
  }

  return new WeatherServiceError(
    error instanceof Error ? error.message : 'Falha inesperada ao carregar o clima.',
    'network',
  );
}

export default function useWeather() {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<WeatherServiceError | null>(null);
  const [query, setQuery] = useState('');
  const lastOperationRef = useRef<LastOperation | null>(null);
  const requestIdRef = useRef(0);

  async function execute(operation: LastOperation): Promise<void> {
    const requestId = ++requestIdRef.current;
    setStatus('loading');
    setError(null);
    setData(null);

    try {
      if (operation.kind === 'search') {
        const foundCities = await searchCities(operation.name);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setCities(foundCities);

        if (foundCities.length === 0) {
          setStatus('empty');
          return;
        }

        const weather = await getWeather(foundCities[0]);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setData(weather);
        setStatus('success');
        return;
      }

      const weather = await getWeather(operation.city);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setData(weather);
      setStatus('success');
    } catch (caughtError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(toWeatherServiceError(caughtError));
      setStatus('error');
    }
  }

  async function search(name: string): Promise<void> {
    const normalizedName = name.trim();
    setQuery(normalizedName);
    setCities([]);

    if (normalizedName.length === 0) {
      requestIdRef.current += 1;
      lastOperationRef.current = null;
      setData(null);
      setError(null);
      setStatus('empty');
      return;
    }

    const operation: LastOperation = { kind: 'search', name: normalizedName };
    lastOperationRef.current = operation;
    await execute(operation);
  }

  async function selectCity(city: City): Promise<void> {
    setQuery(city.name);
    setCities((currentCities) =>
      currentCities.some(
        (currentCity) =>
          currentCity.latitude === city.latitude && currentCity.longitude === city.longitude,
      )
        ? currentCities
        : [city],
    );

    const operation: LastOperation = { kind: 'select-city', city };
    lastOperationRef.current = operation;
    await execute(operation);
  }

  async function retry(): Promise<void> {
    const operation = lastOperationRef.current;

    if (operation) {
      await execute(operation);
    }
  }

  return { status, data, cities, error, query, search, selectCity, retry };
}
