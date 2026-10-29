function parseCalendarDate(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const calendarDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));

  if (
    calendarDate.getUTCFullYear() !== Number(year) ||
    calendarDate.getUTCMonth() !== Number(month) - 1 ||
    calendarDate.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return calendarDate;
}

export function getDayLabel(index: number, date: string): string {
  if (index === 0) {
    return 'Hoje';
  }

  if (index === 1) {
    return 'Amanhã';
  }

  const calendarDate = parseCalendarDate(date);

  if (!calendarDate) {
    return date;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(calendarDate);
}

export function getShortDate(date: string): string {
  const calendarDate = parseCalendarDate(date);

  if (!calendarDate) {
    return date;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(calendarDate);
}

export function formatDayLabel(date: string): string {
  const calendarDate = parseCalendarDate(date);

  if (!calendarDate) {
    return date;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(calendarDate);
}

export function formatPrecipitationProbability(value: number | null): string {
  if (value === null) {
    return 'Indisponível';
  }

  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value)}%`;
}
