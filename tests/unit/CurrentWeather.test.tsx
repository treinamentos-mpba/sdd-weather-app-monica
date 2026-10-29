import { render, screen } from '@testing-library/react';
import CurrentWeather from '../../src/components/CurrentWeather';
import { mockWeatherData } from '../../src/mocks/weatherData';

describe('CurrentWeather', () => {
  it('renders the city, condition, and current metrics', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current}
        unit="celsius"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Lisboa' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Parcialmente nublado' })).toBeInTheDocument();
    expect(screen.getByText('Umidade')).toBeInTheDocument();
    expect(screen.getByText('63 %')).toBeInTheDocument();
    expect(screen.getByText('12,6 km/h')).toBeInTheDocument();
    expect(screen.getByText('0 mm')).toBeInTheDocument();
    expect(screen.getByText('1.013,2 hPa')).toBeInTheDocument();
  });

  it('derives displayed temperatures in the selected unit', () => {
    const { rerender } = render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current}
        unit="celsius"
      />,
    );

    expect(screen.getByText('18 °C')).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: 18 °C')).toBeInTheDocument();

    rerender(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current}
        unit="fahrenheit"
      />,
    );

    expect(screen.getByText('65 °F')).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: 64 °F')).toBeInTheDocument();
  });

  it('shows unavailable for missing current weather metrics', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={{
          weatherCode: null,
          temperatureC: null,
          apparentTemperatureC: null,
          relativeHumidityPercent: null,
          precipitationMm: null,
          windSpeedKmh: null,
          surfacePressureHpa: null,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getByRole('img', { name: 'Condição indisponível' })).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(5);
    expect(screen.getByText('Sensação térmica: Indisponível')).toBeInTheDocument();
  });

  it('keeps available metrics visible when only part of the current data is missing', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={{
          ...mockWeatherData.current,
          apparentTemperatureC: null,
          relativeHumidityPercent: null,
          surfacePressureHpa: null,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getByText('18 °C')).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: Indisponível')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(2);
    expect(screen.getByText('12,6 km/h')).toBeInTheDocument();
    expect(screen.getByText('0 mm')).toBeInTheDocument();
  });
});
