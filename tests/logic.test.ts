import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, formatNumber, INPUT_LIMIT } from '../src/lib/calculator.ts';
import { categories, convertUnit, convertCurrency, parseValue } from '../src/lib/conversions.ts';
import { getUnitReferences } from '../src/lib/unitReferences.ts';
import { getCurrencyReferences } from '../src/lib/currencyReferences.ts';
import { formatCurrencyAmount } from '../src/lib/currencyDisplay.ts';
import { appendCalculatorInput, editCalculatorExpression, toggleCurrentNumber, significantDigits } from '../src/lib/calculatorInput.ts';
import { formatCalculatorResult, formatCalculatorExpression } from '../src/lib/calculatorDisplay.ts';
const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) <= Math.max(1, Math.abs(expected)) * 1e-10, `${actual} ≠ ${expected}`);

test('currency results use dataset symbols and customary decimal places', () => {
  assert.equal(formatCurrencyAmount(convertCurrency(1,'USD','EUR'),'EUR'),'€0.92');
  assert.equal(formatCurrencyAmount(convertCurrency(1,'EUR','USD'),'USD'),'$1.09');
  assert.equal(formatCurrencyAmount(convertCurrency(1,'USD','JPY'),'JPY'),'¥150');
  assert.equal(formatCurrencyAmount(1234.5,'CAD'),'CA$1,234.50');
  assert.equal(formatCurrencyAmount(278.5,'PKR'),'Rs 278.50');
  assert.equal(convertCurrency(1,'EUR','USD'),1/.92);
});

test('caret edits replace selections and retain the rest of the expression', () => {
  const replaced = editCalculatorExpression('76×94', 1, 2, '7');
  assert.deepEqual(replaced, { expression: '77×94', caret: 2 });
  assert.equal(evaluate(replaced.expression), 7238);
  const decimal = editCalculatorExpression('76×94', 2, 2, '.1');
  assert.deepEqual(decimal, { expression: '76.1×94', caret: 4 });
  near(evaluate(decimal.expression), 7153.4);
  const nested = editCalculatorExpression('sin(30)+√(9)', 4, 6, '90');
  assert.equal(nested.expression, 'sin(90)+√(9)');
  assert.equal(evaluate(nested.expression), 4);
  assert.equal(editCalculatorExpression('(12+34)×5', 2, 3, '').expression, '(1+34)×5');
  assert.equal(editCalculatorExpression('1234567890123456×2', 4, 4, '7').expression, '1234567890123456×2');
  assert.equal(editCalculatorExpression('12.3×4', 1, 1, '.').expression, '12.3×4');
  assert.equal(editCalculatorExpression('5+2', 2, 2, '×').expression, '5×2');
});

test('manual numbers stop at 16 significant digits per operand', () => {
  assert.equal('12345678901234567890'.split('').reduce(appendCalculatorInput, ''), '1234567890123456');
  assert.equal(appendCalculatorInput('5×1234567890123456', '7'), '5×1234567890123456');
  assert.equal(appendCalculatorInput('-1234567890123456', '7'), '-1234567890123456');
  assert.equal(appendCalculatorInput('0.0001234567890123456', '7'), '0.0001234567890123456');
  assert.equal(appendCalculatorInput('1234567890123456+', '7'), '1234567890123456+7');
  assert.equal(appendCalculatorInput('123456789012345', '0'), '1234567890123450');
  assert.equal(significantDigits('0.0000012'), 2);
  assert.equal(significantDigits('1.2000'), 5);
});

test('calculator display uses mathematical notation without changing evaluation', () => {
  assert.equal(formatCalculatorResult(1e-14), '1 × 10⁻¹⁴');
  assert.equal(formatCalculatorResult(1e20), '1 × 10²⁰');
  assert.equal(formatCalculatorResult(-1.234e-14), '-1.234 × 10⁻¹⁴');
  assert.equal(formatCalculatorResult(.001), '0.001');
  assert.equal(formatCalculatorResult(1234), '1234');
  assert.equal(formatCalculatorResult(0), '0');
  assert.equal(formatCalculatorResult(Number.MIN_VALUE), '5 × 10⁻³²⁴');
  assert.ok(!/Infinity|NaN/.test(formatCalculatorResult(Number.MAX_VALUE)));
  assert.equal(formatCalculatorExpression('sqrt(81)+1e-14'), '√(81)+1 × 10⁻¹⁴');
  assert.equal(evaluate('sqrt(81)'), 9);
  assert.throws(() => evaluate('10^999'), /Result exceeds the calculator’s supported range\./);
});

test('sign control toggles the current number without inserting parentheses', () => {
  assert.equal(toggleCurrentNumber('1234'), '-1234');
  assert.equal(toggleCurrentNumber('-1234'), '1234');
  for (const input of ['1234', '-1234', '12.34', '-0.5', '1e-7', '5×2', '5÷-2', 'sin(30', '2^3', '50%']) {
    assert.equal(toggleCurrentNumber(toggleCurrentNumber(input)), input);
  }
  assert.equal(toggleCurrentNumber('5+2'), '5−2');
  assert.equal(toggleCurrentNumber('5−2'), '5+2');
  assert.equal(toggleCurrentNumber(''), '-');
  assert.equal(toggleCurrentNumber('-'), '');
  assert.equal(appendCalculatorInput(toggleCurrentNumber('123'), '4'), '-1234');
  assert.equal(evaluate('5×-2'), -10);
});

test('latest arithmetic operator replaces a pending operator', () => {
  for (const previous of ['+', '−', '×', '÷']) {
    for (const next of ['+', '−', '×', '÷', '^']) {
      assert.equal(appendCalculatorInput(`5${previous}`, next), `5${next}`);
    }
  }
  const expression = ['5', '+', '×', '2'].reduce(appendCalculatorInput, '');
  assert.equal(expression, '5×2');
  assert.equal(evaluate(expression), 10);
  assert.equal(appendCalculatorInput('5×', '-'), '5-');
  assert.equal(appendCalculatorInput('5×-2', '+'), '5×-2+');
  const negativeExponent = ['1', '0', '^', '−', '1', '4'].reduce(appendCalculatorInput, '');
  assert.equal(negativeExponent, '10^−14');
  assert.equal(evaluate(negativeExponent), 1e-14);
  assert.throws(() => evaluate('0÷0'), /Cannot divide by zero/);
});

test('currency references use the demo dataset and follow the selected pair', () => {
  assert.deepEqual(getCurrencyReferences('USD', 'EUR'), ['1 USD = 0.92 EUR', '1 USD = 0.79 GBP', '1 USD = 278.5 PKR']);
  assert.equal(getCurrencyReferences('EUR', 'USD')[0], '1 EUR ≈ 1.08695652174 USD');
  assert.equal(getCurrencyReferences('USD', 'JPY')[0], '1 USD = 150 JPY');
  const sameCurrency = getCurrencyReferences('USD', 'USD');
  assert.equal(sameCurrency.length, 3);
  assert.ok(sameCurrency.every(line => !line.endsWith(' USD')));
});

test('quick references cover every category and distinguish rounding from exact values', () => {
  for (const category of categories) {
    const lines = getUnitReferences(category.id);
    assert.equal(lines.length, 3, category.name);
    assert.ok(lines.every(line => !/undefined|NaN|Infinity/.test(line)), category.name);
  }
  assert.deepEqual(getUnitReferences('length'), ['1 km = 1,000 m', '1 mile = 1.609344 km', '1 foot = 12 inches']);
  assert.deepEqual(getUnitReferences('area'), ['1 acre = 43,560 sq ft', '1 hectare = 10,000 m²', '1 km² = 100 hectares']);
  assert.deepEqual(getUnitReferences('temperature'), ['0 °C = 32 °F', '100 °C = 212 °F', '0 °C = 273.15 K']);
  assert.deepEqual(getUnitReferences('fuel'), ['10 km/L = 10 L/100 km', '30 US mpg ≈ 7.84048611111 L/100 km', '30 imp mpg ≈ 9.41603121106 L/100 km']);
  assert.deepEqual(getUnitReferences('volume'), ['1 L = 1,000 mL', '1 US gal = 3.785411784 L', '1 imp gal = 4.54609 L']);
  assert.equal(getUnitReferences('mass')[1], '1 lb = 453.59237 g');
  assert.equal(getUnitReferences('speed')[2], '1 kn = 1.852 km/h');
  assert.equal(getUnitReferences('force')[1], '1 lbf = 4.4482216152605 N');
  assert.equal(getUnitReferences('power')[2], '1 hp (mechanical) = 745.69987158227022 W');
  assert.deepEqual(getUnitReferences('data'), ['1 GB = 1,000 MB', '1 MB = 1,000 KB', '1 KB = 1,000 B']);
});

test('arithmetic, precedence, decimals, percentages and negative numbers', () => {
  assert.equal(evaluate('2+3×4'), 14);
  assert.equal(evaluate('(2+3)×4'), 20);
  near(evaluate('0.1+0.2'), .3);
  assert.equal(formatNumber(evaluate('0.1+0.2')), '0.3');
  assert.equal(evaluate('200×15%'), 30);
  assert.equal(evaluate('50+10%'), 50.1);
  assert.equal(evaluate('5+(-3)'), 2);
  assert.equal(evaluate('-2^2'), -4);
  assert.equal(evaluate('2^3^2'), 512);
  assert.equal(evaluate('2^-3'), .125);
  assert.equal(evaluate('1e+20×2'), 2e20);
});
test('scientific functions, implicit multiplication and angle modes', () => {
  near(evaluate('sin(30)'), .5);
  near(evaluate('sin(π/2)', 'RAD'), 1);
  assert.equal(evaluate('cos(90)'), 0);
  near(evaluate('tan(45)'), 1);
  assert.equal(evaluate('sqrt(81)+3^2'), 18);
  assert.equal(evaluate('log(100)'), 2);
  near(evaluate('ln(2)'), Math.log(2));
  near(evaluate('sqrt(1e-40)'), 1e-20);
  assert.ok(evaluate('sqrt(1e-40)') > 0);
  near(evaluate('2π'), 2*Math.PI);
  assert.equal(evaluate('2(3+4)'), 14);
});
test('invalid calculations return actionable errors', () => {
  for (const expression of ['1÷0','sqrt(-1)','log(0)','ln(-2)','tan(90)','2+','(2+3','2..4','2)3','alert(1)','10^999', '1'.repeat(INPUT_LIMIT + 1)]) {
    assert.throws(() => evaluate(expression), Error, expression);
  }
});
test('all categories round-trip; common conversions use correct scales', () => {
  assert.equal(categories.length, 13);
  for (const category of categories) {
    for (const unit of category.units) {
      const first = category.units[0].id;
      const result = convertUnit(42, category.id, first, unit.id);
      near(convertUnit(result, category.id, unit.id, first), 42);
    }
  }
  near(convertUnit(1,'length','mi','km'), 1.609344);
  near(convertUnit(1,'area','acre','m2'), 4046.8564224);
  near(convertUnit(1,'mass','lb','kg'), .45359237);
  near(convertUnit(1,'volume','gal-us','l'), 3.785411784);
  near(convertUnit(100,'temperature','c','f'), 212);
  near(convertUnit(32,'temperature','f','k'), 273.15);
  assert.equal(convertUnit(-273.15,'temperature','c','k'),0);
  near(convertUnit(5,'fuel','l100','kml'),20);
  assert.equal(convertUnit(1,'data','gb','mb'),1000);
});

test('power and energy units remain distinct, including gigawatts and horsepower', () => {
  const power = categories.find(category => category.id === 'power')!;
  assert.ok(['w','kw','gw','hp'].every(id => power.units.some(unit => unit.id === id)));
  assert.ok(!power.units.some(unit => unit.id === 'kwh'));
  assert.ok(categories.find(category => category.id === 'energy')!.units.some(unit => unit.id === 'kwh'));
  assert.equal(convertUnit(1,'power','kw','w'),1000);
  assert.equal(convertUnit(1,'power','gw','w'),1e9);
  assert.equal(convertUnit(1,'power','gw','kw'),1e6);
  near(convertUnit(1,'power','hp','w'),745.69987158227022);
  assert.equal(convertUnit(1,'energy','kwh','j'),3.6e6);
  assert.equal(getUnitReferences('power')[1],'1 GW = 1,000,000 kW');
});

test('pressure uses standard atmosphere and conventional mmHg factors', () => {
  assert.equal(convertUnit(1,'pressure','atm','pa'),101325);
  near(convertUnit(1,'pressure','mmhg','pa'),133.322387415);
  near(convertUnit(133.322387415,'pressure','pa','mmhg'),1);
  near(convertUnit(760,'pressure','mmhg','pa'),101325.0144354);
  assert.equal(getUnitReferences('pressure')[2],'1 mmHg = 133.322387415 Pa');
});

test('data sizes use decimal steps and consistent labels throughout', () => {
  const data = categories.find(category => category.id === 'data')!;
  for (const [larger, smaller] of [['kb','b'],['mb','kb'],['gb','mb'],['tb','gb'],['pb','tb']]) {
    assert.equal(convertUnit(1,'data',larger,smaller),1000);
    assert.equal(convertUnit(1000,'data',smaller,larger),1);
  }
  assert.equal(convertUnit(1,'data','kb','bit'),8000);
  assert.equal(data.units.find(unit => unit.id === 'kb')!.symbol,'KB');
  assert.ok(!data.units.some(unit => /binary|kib|mib|gib/i.test(`${unit.id} ${unit.name}`)));
});
test('conversion errors and parsing are explicit', () => {
  for (const input of ['', ' ', 'abc', '1,000', 'Infinity', '1e999']) assert.throws(() => parseValue(input));
  assert.equal(parseValue('-2.5'), -2.5);
  assert.equal(parseValue('1e3'),1000);
  assert.throws(() => convertUnit(-274,'temperature','c','f'));
  assert.throws(() => convertUnit(0,'fuel','l100','kml'));
  assert.throws(() => convertUnit(1,'length','bad','m'));
  assert.throws(() => convertCurrency(-1,'USD','EUR'));
  assert.throws(() => convertCurrency(Infinity,'USD','EUR'));
  near(convertCurrency(100,'USD','EUR'),92);
  near(convertCurrency(convertCurrency(100,'USD','PKR'),'PKR','USD'),100);
});
