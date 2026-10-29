import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | null, unit: string): string {
  if (value === null) {
    return 'Indisponível';
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(value);

  return `${formattedValue} ${unit}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const condition = getWeatherCondition(current.weatherCode);
  const cityDetails = [city.admin1, city.country].filter(Boolean).join(' · ');
  const metrics = [
    { label: 'Umidade', value: formatMetric(current.relativeHumidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, 'km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm, 'mm') },
    { label: 'Pressão', value: formatMetric(current.surfacePressureHpa, 'hPa') },
  ];

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl backdrop-blur-md sm:p-8"
    >
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
        <div className="flex items-center gap-5">
          <span role="img" aria-label={condition.description} className="shrink-0 text-6xl">
            {condition.icon}
          </span>
          <div className="min-w-0">
            <h2 id="current-weather-title" className="truncate text-2xl font-semibold">
              {city.name}
            </h2>
            {cityDetails.length > 0 && <p className="mt-1 text-sm text-white/65">{cityDetails}</p>}
            <p className="mt-3 text-sm text-white/80">{condition.description}</p>
          </div>
        </div>

        <div className="md:text-right">
          <p className="text-sm font-medium text-white/65">Clima atual</p>
          <p className="mt-1 text-5xl font-semibold leading-none text-sun">
            {formatTemperature(current.temperatureC, unit)}
          </p>
          <p className="mt-3 text-sm text-white/70">
            Sensação térmica: {formatTemperature(current.apparentTemperatureC, unit)}
          </p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="text-sm text-white/60">{metric.label}</dt>
            <dd className="mt-1 text-lg font-medium text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
