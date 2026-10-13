export type AngleMode = 'DEG' | 'RAD';
export const INPUT_LIMIT = 180;

// Grammar: sum → product → unary → power → postfix → primary.
// Powers are right-associative; unary minus binds after powers. Percent is /100.
export function evaluate(expression: string, angle: AngleMode = 'DEG'): number {
  if (!expression.trim()) throw new Error('Enter a calculation first.');
  if (expression.length > INPUT_LIMIT) throw new Error('This calculation is too long. Try a shorter expression.');
  const source = expression.replace(/√/g, 'sqrt').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'pi').replace(/\s/g, '');
  const tokens = source.match(/(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?|[a-z]+|[()+\-*/^%]/g) ?? [];
  if (tokens.join('') !== source) throw new Error('Check your calculation for an unsupported character.');
  let index = 0;
  const peek = () => tokens[index];
  const take = (token: string) => peek() === token ? (index++, true) : false;
  const checked = (value: number): number => {
    if (!Number.isFinite(value)) throw new Error('Result exceeds the calculator’s supported range.');
    return Object.is(value, -0) ? 0 : value;
  };
  function sum(): number {
    let value = product();
    while (peek() === '+' || peek() === '-') {
      const operation = tokens[index++];
      const right = product();
      value = checked(operation === '+' ? value + right : value - right);
    }
    return value;
  }
  function product(): number {
    let value = unary();
    while (peek() === '*' || peek() === '/' || peek() === '(' || peek() === 'pi' || /^(sin|cos|tan|sqrt|log|ln)$/.test(peek() ?? '')) {
      const implicit = peek() !== '*' && peek() !== '/';
      const operation = implicit ? '*' : tokens[index++];
      const right = unary();
      if (operation === '/' && right === 0) throw new Error('Cannot divide by zero. Try a different number.');
      value = checked(operation === '*' ? value * right : value / right);
    }
    return value;
  }
  function unary(): number {
    if (take('+')) return unary();
    if (take('-')) return -unary();
    return power();
  }
  function power(): number {
    const value = postfix();
    return take('^') ? checked(value ** unary()) : value;
  }
  function postfix(): number {
    let value = primary();
    while (take('%')) value /= 100;
    return value;
  }
  function primary(): number {
    if (take('(')) {
      const value = sum();
      if (!take(')')) throw new Error('Close the parenthesis to finish your calculation.');
      return value;
    }
    if (take('pi')) return Math.PI;
    const token = tokens[index++];
    if (token && /^(sin|cos|tan|sqrt|log|ln)$/.test(token)) {
      if (!take('(')) throw new Error('Add parentheses around the function’s value.');
      const value = sum();
      if (!take(')')) throw new Error('Close the parenthesis to finish your calculation.');
      const radians = angle === 'DEG' ? value * Math.PI / 180 : value;
      if (token === 'sqrt' && value < 0) throw new Error('Square root needs a value of zero or greater.');
      if ((token === 'ln' || token === 'log') && value <= 0) throw new Error('Logarithms need a value greater than zero.');
      if (token === 'tan' && Math.abs(Math.cos(radians)) < 1e-14) throw new Error('Tangent is undefined at this angle.');
      const result = token === 'sqrt' ? Math.sqrt(value) : token === 'ln' ? Math.log(value) : token === 'log' ? Math.log10(value) : token === 'sin' ? Math.sin(radians) : token === 'cos' ? Math.cos(radians) : Math.tan(radians);
      const trig = token === 'sin' || token === 'cos' || token === 'tan';
      return checked(trig && Math.abs(radians) > 1e-10 && Math.abs(result) < 1e-15 ? 0 : result);
    }
    if (!token || !/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/.test(token)) throw new Error('Complete your calculation with a number.');
    return checked(Number(token));
  }
  const result = checked(sum());
  if (index !== tokens.length) throw new Error('Check the numbers and parentheses in your calculation.');
  return result;
}

export function formatNumber(value: number): string {
  if (value === 0) return '0';
  return Number(value.toPrecision(12)).toString();
}
