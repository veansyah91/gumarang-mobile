export function formatDateID(value: string | number | Date | null | undefined) {
  if (value == null || value === '') {
    return '-';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
}

export function isDateAfter(start: string, end: string) {
  if (!isValidDateInput(start) || !isValidDateInput(end)) {
    return false;
  }

  return new Date(`${end}T00:00:00`).getTime() < new Date(`${start}T00:00:00`).getTime();
}
