import { formatDayLabel, formatPrecipitationProbability } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const condition = getWeatherCondition(day.weatherCode);
  const headingId = `forecast-day-${day.date}`;

  return (
    <li className="min-w-0 list-none">
      <article
        aria-labelledby={headingId}
        className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-lg backdrop-blur-md"
      >
        <h3 id={headingId} className="text-sm font-semibold capitalize text-white/85">
          {formatDayLabel(day.date)}
        </h3>

        <div className="mt-4 flex flex-1 flex-col items-center justify-center text-center">
          <span role="img" aria-label={condition.description} className="text-4xl">
            {condition.icon}
          </span>
          <p className="mt-2 min-h-10 text-sm text-white/75">{condition.description}</p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-xl font-semibold text-sun">
              {formatTemperature(day.maxTemperatureC, unit)}
            </span>
            <span className="text-sm text-white/60">
              {formatTemperature(day.minTemperatureC, unit)}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3 text-center">
          <p className="text-xs text-white/60">Chuva</p>
          <p className="mt-1 text-sm font-medium text-white">
            {formatPrecipitationProbability(day.precipitationProbabilityMaxPercent)}
          </p>
        </div>
      </article>
    </li>
  );
}
