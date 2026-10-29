import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import useWeather from './hooks/useWeather';
import type { Unit } from './types/weather';

function readSavedUnit(): Unit {
  try {
    return window.localStorage.getItem('weather-unit') === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  } catch {
    return 'celsius';
  }
}

export default function App() {
  const [unit, setUnit] = useState<Unit>(readSavedUnit);
  const { status, data, error, search, retry } = useWeather();

  function handleUnitChange(nextUnit: Unit) {
    setUnit(nextUnit);

    try {
      window.localStorage.setItem('weather-unit', nextUnit);
    } catch {
      // The current selection remains active in React state if storage is unavailable.
    }
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-900/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <a
            href="#main"
            className="flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-xl bg-accent-500 font-bold text-night-900"
            >
              C
            </span>
            <span>
              <span className="block text-xl font-semibold">Clima</span>
              <span className="block text-sm text-white/60">Previsão para sua cidade</span>
            </span>
          </a>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:max-w-3xl">
            <div className="min-w-0 flex-1">
              <SearchBar onSearch={search} disabled={status === 'loading'} />
            </div>
            <UnitToggle unit={unit} onChange={handleUnitChange} />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:py-10">
        {status === 'idle' && (
          <EmptyState
            title="Consulte o clima da sua cidade"
            tip="Busque uma cidade para ver as condições atuais e a previsão dos próximos cinco dias."
          />
        )}

        {status === 'loading' && <LoadingState message="Buscando clima..." />}

        {status === 'empty' && (
          <EmptyState
            title="Cidade não encontrada"
            tip="Confira a grafia do nome e tente buscar novamente."
          />
        )}

        {status === 'error' && (
          <ErrorState
            message={error?.message ?? 'Não foi possível carregar os dados meteorológicos.'}
            onRetry={retry}
          />
        )}

        {status === 'success' && data && (
          <div className="space-y-8">
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <ForecastList forecast={data.forecast} unit={unit} />
          </div>
        )}
      </main>
    </div>
  );
}
