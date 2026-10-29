import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it('returns the icon and description for a known WMO code', () => {
    expect(getWeatherCondition(61)).toEqual({ icon: '🌧️', description: 'Chuva fraca' });
  });

  it('returns the fallback for an unknown WMO code', () => {
    expect(getWeatherCondition(999)).toEqual({
      icon: '❔',
      description: 'Condição desconhecida',
    });
  });
});
