import { currencies } from './conversions.ts';

export function formatCurrencyAmount(value: number, code: string): string {
  const currency = currencies.find(item => item.id === code);
  if (!currency) return `${value} ${code}`;
  // Keep the demo display consistent across browser locale-data versions.
  const digits = code === 'JPY' ? 0 : 2;
  const amount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(value);
  const spacing = /\p{Letter}$/u.test(currency.symbol) ? ' ' : '';
  return `${currency.symbol}${spacing}${amount}`;
}
