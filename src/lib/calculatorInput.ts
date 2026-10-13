import { INPUT_LIMIT } from './calculator.ts';

const arithmetic = /^[+\-−×÷*/^]$/;
export const SIGNIFICANT_DIGIT_LIMIT = 16;

export function significantDigits(number: string): number {
  const mantissa = number.split(/e/i)[0].replace(/[^\d]/g, '');
  return mantissa.replace(/^0+/, '').length;
}

export function toggleCurrentNumber(expression: string): string {
  const number = expression.match(/(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?%*$/);
  if (!number) {
    // Allow a negative number to be started before its first digit is entered.
    if (!expression || /[+\-−×÷*/^(]$/.test(expression)) {
      const last = expression.at(-1);
      const previous = expression.at(-2);
      const unary = (last === '-' || last === '−') && (!previous || /[+\-−×÷*/^(]/.test(previous));
      return unary ? expression.slice(0, -1) : expression + '-';
    }
    return expression;
  }
  const prefix = expression.slice(0, number.index);
  const last = prefix.at(-1);
  const previous = prefix.at(-2);
  if (last === '-' || last === '−') {
    const unary = !previous || /[+\-−×÷*/^(]/.test(previous);
    return prefix.slice(0, -1) + (unary ? '' : '+') + number[0];
  }
  if (last === '+') return prefix.slice(0, -1) + '−' + number[0];
  return prefix + '-' + number[0];
}

export function appendCalculatorInput(expression: string, value: string): string {
  if (/^\d$/.test(value)) {
    const current = expression.match(/(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/)?.[0] ?? '';
    if (significantDigits(current + value) > SIGNIFICANT_DIGIT_LIMIT) return expression;
  }
  // A sign after a power belongs to the exponent, rather than replacing ^.
  if (/^[+\-−]$/.test(value) && /\^[+\-−]?$/.test(expression)) {
    return expression.replace(/[+\-−]$/, '') + value;
  }
  if (arithmetic.test(value) && /[+\-−×÷*/^]$/.test(expression)) {
    return expression.replace(/[+\-−×÷*/^]+$/, value);
  }
  return expression + value;
}

export function editCalculatorExpression(expression: string, start: number, end: number, value: string) {
  const inserted = value.replace(/sqrt\(/g, '√(').replace(/\*/g, '×').replace(/\//g, '÷');
  const before = expression.slice(0, start);
  const after = expression.slice(end);
  // Use the existing operator and decimal rules at the insertion point.
  let prefix = before;
  if (inserted === '.' && !/\d$/.test(prefix)) prefix += '0';
  const nextPrefix = inserted.length === 1 ? appendCalculatorInput(prefix, inserted) : prefix + inserted;
  const candidate = nextPrefix + after;
  const caret = nextPrefix.length;
  if (candidate.length > INPUT_LIMIT) return { expression, caret: start };
  if (inserted) {
    for (const match of candidate.matchAll(/(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/g)) {
      if (match.index < caret && match.index + match[0].length > Math.max(0, caret - inserted.length)) {
        if (significantDigits(match[0]) > SIGNIFICANT_DIGIT_LIMIT) return { expression, caret: start };
      }
    }
    // Reject a second decimal within the operand, including middle edits.
    const localNumber = candidate.slice(0, caret).match(/[\d.]+$/)?.[0] ?? '';
    const tailNumber = candidate.slice(caret).match(/^[\d.]+/)?.[0] ?? '';
    if ((localNumber + tailNumber).split('.').length > 2) return { expression, caret: start };
  }
  return { expression: candidate, caret };
}
