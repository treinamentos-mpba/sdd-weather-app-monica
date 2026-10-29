export interface WeatherCondition {
  icon: string;
  description: string;
}

const weatherConditions: Record<number, WeatherCondition> = {
  0: { icon: '☀️', description: 'Céu limpo' },
  1: { icon: '🌤️', description: 'Predominantemente limpo' },
  2: { icon: '⛅', description: 'Parcialmente nublado' },
  3: { icon: '☁️', description: 'Nublado' },
  45: { icon: '🌫️', description: 'Nevoeiro' },
  48: { icon: '🌫️', description: 'Nevoeiro com geada' },
  51: { icon: '🌦️', description: 'Garoa fraca' },
  53: { icon: '🌦️', description: 'Garoa moderada' },
  55: { icon: '🌧️', description: 'Garoa intensa' },
  56: { icon: '🌧️', description: 'Garoa congelante fraca' },
  57: { icon: '🌧️', description: 'Garoa congelante intensa' },
  61: { icon: '🌧️', description: 'Chuva fraca' },
  63: { icon: '🌧️', description: 'Chuva moderada' },
  65: { icon: '🌧️', description: 'Chuva intensa' },
  66: { icon: '🌧️', description: 'Chuva congelante fraca' },
  67: { icon: '🌧️', description: 'Chuva congelante intensa' },
  71: { icon: '🌨️', description: 'Neve fraca' },
  73: { icon: '🌨️', description: 'Neve moderada' },
  75: { icon: '❄️', description: 'Neve intensa' },
  77: { icon: '🌨️', description: 'Grãos de neve' },
  80: { icon: '🌦️', description: 'Pancadas de chuva fracas' },
  81: { icon: '🌧️', description: 'Pancadas de chuva moderadas' },
  82: { icon: '⛈️', description: 'Pancadas de chuva violentas' },
  85: { icon: '🌨️', description: 'Pancadas de neve fracas' },
  86: { icon: '❄️', description: 'Pancadas de neve intensas' },
  95: { icon: '⛈️', description: 'Trovoada' },
  96: { icon: '⛈️', description: 'Trovoada com granizo fraco' },
  99: { icon: '⛈️', description: 'Trovoada com granizo intenso' },
};

export function getWeatherCondition(weatherCode: number | null): WeatherCondition {
  if (weatherCode === null) {
    return { icon: '❔', description: 'Condição indisponível' };
  }

  return (
    weatherConditions[weatherCode] ?? {
      icon: '❔',
      description: 'Condição desconhecida',
    }
  );
}
