export function normalizePhone(input: string): string {
  if (!input) return '';

  let digits = input.replace(/\D/g, '');

  if (digits.startsWith('62')) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }

  return digits;
}
