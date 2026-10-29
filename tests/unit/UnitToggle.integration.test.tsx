import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../../src/types/weather';

const city: City = {
  name: 'Temperatura de teste',
  latitude: 0,
  longitude: 0,
  timezone: 'UTC',
};

const current: CurrentWeatherData = {
  weatherCode: 0,
  temperatureC: 0,
  apparentTemperatureC: 0,
  relativeHumidityPercent: 50,
  precipitationMm: 0,
  windSpeedKmh: 0,
  surfacePressureHpa: 1013,
};

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={city} current={current} unit={unit} />
    </>
  );
}

describe('UnitToggle with CurrentWeather', () => {
  it('updates the displayed 0 °C to 32 °F when Fahrenheit is selected', async () => {
    const user = userEvent.setup();

    render(<WeatherWithUnitToggle />);

    expect(screen.getByText('0 °C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('32 °F')).toBeInTheDocument();
  });
});
