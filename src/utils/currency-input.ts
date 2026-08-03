export function formatCurrencyInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(digits));
}

export function parseCurrencyInput(formattedValue: string): string {
  return formattedValue.replace(/[^\d]/g, '');
}
