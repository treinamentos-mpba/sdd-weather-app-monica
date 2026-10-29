import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {},
}));

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(searchCities).mockReset();
    vi.mocked(getWeather).mockReset();
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
  });

  it('starts in the idle state with search and unit controls', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Consulte o clima da sua cidade' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows loading and then the mock weather for Lisboa', async () => {
    const user = userEvent.setup();
    let resolveSearch: ((cities: City[]) => void) | undefined;
    vi.mocked(searchCities).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSearch = resolve;
        }),
    );
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(screen.getByRole('status')).toHaveTextContent('Buscando clima...');
    await act(async () => {
      resolveSearch?.([mockWeatherData.city]);
    });
    expect(await screen.findByRole('heading', { name: 'Lisboa' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('shows the empty state when the search does not match the mock city', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValueOnce([]);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Porto');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByRole('heading', { name: 'Cidade não encontrada' }),
    ).toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('keeps unit as UI state and persists the selection without a new forecast', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByRole('heading', { name: 'Lisboa' });

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('65 °F')).toBeInTheDocument();
    expect(window.localStorage.getItem('weather-unit')).toBe('fahrenheit');
  });

  it('passes retry from ErrorState to the hook', async () => {
    const user = userEvent.setup();
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new Error('Falha de rede.'))
      .mockResolvedValueOnce(mockWeatherData);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Lisboa' })).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(2);
  });
});
