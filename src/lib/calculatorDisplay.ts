import { formatNumber } from './calculator.ts';

const superscripts: Record<string, string> = {
  '-': '⁻', '+': '⁺', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};
function scientificDisplay(mantissa: string, exponent: string): string {
  const power = Number(exponent).toString().split('').map(char => superscripts[char]).join('');
  return `${mantissa} × 10${power}`;
}

export function formatCalculatorResult(value: number): string {
  const normal = formatNumber(value);
  if (value === 0) return normal;
  // Preserve the existing 12 significant figure result presentation. The
  // underlying Number is retained separately for subsequent calculations.
  if (Math.abs(value) >= 1e12 || Math.abs(value) < 1e-6 || normal.length > 16) {
    const [mantissa, exponent] = Number(value.toPrecision(12)).toExponential().split('e');
    return scientificDisplay(mantissa, exponent);
  }
  return normal;
}

export function formatCalculatorExpression(expression: string): string {
  return expression.replace(/sqrt\(/g, '√(').replace(/((?:\d+\.?\d*|\.\d+))e([+-]?\d+)/g,
    (_, mantissa: string, exponent: string) => scientificDisplay(mantissa, exponent));
}
