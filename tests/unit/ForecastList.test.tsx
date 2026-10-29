import { render, screen, within } from '@testing-library/react';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/mocks/weatherData';

describe('ForecastList', () => {
  it('renders five forecast cards in date order', () => {
    render(<ForecastList forecast={mockWeatherData.forecast} unit="celsius" />);

    const list = screen.getByRole('list', { name: 'Previsão dos próximos cinco dias' });
    const cards = within(list).getAllByRole('article');

    expect(cards).toHaveLength(5);
    expect(within(cards[0]).getByRole('heading', { name: /29/ })).toBeInTheDocument();
    expect(within(cards[4]).getByRole('heading', { name: /02/ })).toBeInTheDocument();
  });

  it('shows condition, temperatures in the selected unit, and precipitation probability', () => {
    render(<ForecastList forecast={mockWeatherData.forecast} unit="fahrenheit" />);

    expect(screen.getAllByRole('img')[0]).toHaveAccessibleName('Parcialmente nublado');
    expect(screen.getByText('70 °F')).toBeInTheDocument();
    expect(screen.getByText('58 °F')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('shows unavailable for missing forecast values', () => {
    const forecast = [
      {
        ...mockWeatherData.forecast[0],
        minTemperatureC: null,
        maxTemperatureC: null,
        precipitationProbabilityMaxPercent: null,
      },
    ];

    render(<ForecastList forecast={forecast} unit="celsius" />);

    expect(screen.getAllByText('Indisponível')).toHaveLength(3);
  });
});
