import { formatDayLabel, getDayLabel, getShortDate } from '../../src/lib/format';

describe('getDayLabel', () => {
  it('labels index zero as today', () => {
    expect(getDayLabel(0, '2026-10-29')).toBe('Hoje');
  });

  it('labels index one as tomorrow', () => {
    expect(getDayLabel(1, '2026-10-30')).toBe('Amanhã');
  });

  it('returns the weekday for later forecast indices', () => {
    expect(getDayLabel(2, '2026-10-31')).toBe('sábado');
    expect(getDayLabel(4, '2026-11-02')).toBe('segunda-feira');
  });
});

describe('getShortDate', () => {
  it('formats an ISO calendar date as day/month in pt-BR', () => {
    expect(getShortDate('2026-10-29')).toBe('29/10');
  });

  it('returns the original value when the date is invalid', () => {
    expect(getShortDate('2026-02-30')).toBe('2026-02-30');
  });
});

describe('formatDayLabel', () => {
  it('keeps the existing weekday and date label behavior', () => {
    expect(formatDayLabel('2026-10-29')).toContain('29');
  });
});
