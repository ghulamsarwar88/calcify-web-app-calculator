import { currencies, convertCurrency } from './conversions.ts';
import { formatNumber } from './calculator.ts';

// Keep the selected pair first, followed by familiar alternatives. All values
// come from the same fixed demo dataset used for the main conversion result.
export function getCurrencyReferences(from: string, to: string): string[] {
  const targets = [...new Set([to, 'USD', 'EUR', 'GBP', 'PKR'])]
    .filter(id => id !== from && currencies.some(currency => currency.id === id))
    .slice(0, 3);
  return targets.map(target => {
    const rate = convertCurrency(1, from, target);
    const displayed = formatNumber(rate);
    const approximate = Math.abs(Number(displayed) - rate) > Number.EPSILON * Math.max(1, Math.abs(rate));
    return `1 ${from} ${approximate ? '≈' : '='} ${displayed} ${target}`;
  });
}
