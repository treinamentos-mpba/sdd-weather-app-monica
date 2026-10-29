import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converts %i °C to %i °F', (temperatureC, expectedFahrenheit) => {
    expect(convertTemperature(temperatureC, 'fahrenheit')).toBe(expectedFahrenheit);
  });

  it('returns the original value for Celsius and null for missing temperature', () => {
    expect(convertTemperature(18.4, 'celsius')).toBe(18.4);
    expect(convertTemperature(null, 'celsius')).toBeNull();
    expect(convertTemperature(null, 'fahrenheit')).toBeNull();
  });
});

describe('formatTemperature', () => {
  it('rounds the displayed value and appends the Celsius symbol', () => {
    expect(formatTemperature(18.4, 'celsius')).toBe('18 °C');
  });

  it('converts, rounds, and appends the Fahrenheit symbol', () => {
    expect(formatTemperature(10.5, 'fahrenheit')).toBe('51 °F');
  });

  it('formats a missing temperature as unavailable', () => {
    expect(formatTemperature(null, 'fahrenheit')).toBe('Indisponível');
  });
});

describe('unitLabel', () => {
  it('returns the symbol for each unit', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
