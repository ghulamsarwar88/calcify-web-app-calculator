export type Unit = { id: string; name: string; symbol: string; factor: number };
export type Category = { id: string; name: string; icon: string; units: Unit[] };
const unit = (id: string, name: string, symbol: string, factor: number): Unit => ({ id, name, symbol, factor });
export const categories: Category[] = [
  { id: 'length', name: 'Length', icon: '↔', units: [unit('m','Metres','m',1),unit('km','Kilometres','km',1000),unit('cm','Centimetres','cm',.01),unit('mm','Millimetres','mm',.001),unit('in','Inches','in',.0254),unit('ft','Feet','ft',.3048),unit('yd','Yards','yd',.9144),unit('mi','Miles','mi',1609.344)] },
  { id: 'area', name: 'Area', icon: '▱', units: [unit('m2','Square metres','m²',1),unit('km2','Square kilometres','km²',1e6),unit('ft2','Square feet','ft²',.09290304),unit('acre','Acres','ac',4046.8564224),unit('ha','Hectares','ha',1e4)] },
  { id: 'mass', name: 'Mass', icon: '◇', units: [unit('kg','Kilograms','kg',1),unit('g','Grams','g',.001),unit('mg','Milligrams','mg',1e-6),unit('lb','Pounds','lb',.45359237),unit('oz','Ounces','oz',.028349523125),unit('t','Metric tonnes','t',1000)] },
  { id: 'volume', name: 'Volume', icon: '◒', units: [unit('l','Litres','L',1),unit('ml','Millilitres','mL',.001),unit('m3','Cubic metres','m³',1000),unit('gal-us','US gallons','US gal',3.785411784),unit('gal-uk','Imperial gallons','imp gal',4.54609),unit('cup','US cups','cup',.2365882365)] },
  { id: 'temperature', name: 'Temperature', icon: '♨', units: [unit('c','Celsius','°C',1),unit('f','Fahrenheit','°F',1),unit('k','Kelvin','K',1)] },
  { id: 'speed', name: 'Speed', icon: '↗', units: [unit('ms','Metres per second','m/s',1),unit('kmh','Kilometres per hour','km/h',1/3.6),unit('mph','Miles per hour','mph',.44704),unit('knot','Knots','kn',1852 / 3600)] },
  { id: 'time', name: 'Time', icon: '◷', units: [unit('s','Seconds','s',1),unit('min','Minutes','min',60),unit('h','Hours','h',3600),unit('day','Days','d',86400),unit('week','Weeks','wk',604800)] },
  { id: 'energy', name: 'Energy', icon: 'ϟ', units: [unit('j','Joules','J',1),unit('kj','Kilojoules','kJ',1000),unit('cal','Calories (thermochemical)','cal',4.184),unit('kcal','Kilocalories','kcal',4184),unit('kwh','Kilowatt-hours','kWh',3.6e6)] },
  { id: 'force', name: 'Force', icon: '↓', units: [unit('n','Newtons','N',1),unit('kn','Kilonewtons','kN',1000),unit('lbf','Pound-force','lbf',4.4482216152605)] },
  { id: 'power', name: 'Power', icon: '⌁', units: [unit('w','Watts','W',1),unit('kw','Kilowatts','kW',1000),unit('mw','Megawatts','MW',1e6),unit('gw','Gigawatts','GW',1e9),unit('hp','HP — Horsepower (mechanical)','hp',745.69987158227022)] },
  { id: 'pressure', name: 'Pressure', icon: '◎', units: [unit('pa','Pascals','Pa',1),unit('kpa','Kilopascals','kPa',1000),unit('bar','Bars','bar',1e5),unit('psi','Pounds per square inch','psi',4.4482216152605 / (.0254 ** 2)),unit('atm','Atmospheres (standard)','atm',101325),unit('mmhg','Millimetres of mercury (conventional)','mmHg',133.322387415)] },
  { id: 'fuel', name: 'Fuel Efficiency', icon: '◈', units: [unit('kml','Kilometres per litre','km/L',1),unit('l100','Litres per 100 km','L/100 km',1),unit('mpg-us','Miles per US gallon','US mpg',1.609344 / 3.785411784),unit('mpg-uk','Miles per imperial gallon','imp mpg',1.609344 / 4.54609)] },
  { id: 'data', name: 'Data Size', icon: '▤', units: [unit('b','Bytes','B',1),unit('bit','Bits','bit',.125),unit('kb','Kilobytes','KB',1e3),unit('mb','Megabytes','MB',1e6),unit('gb','Gigabytes','GB',1e9),unit('tb','Terabytes','TB',1e12),unit('pb','Petabytes','PB',1e15)] },
];
export function parseValue(input: string): number {
  if (!input.trim()) throw new Error('Enter a value to convert.');
  if (input.length > 40) throw new Error('Use a value with 40 characters or fewer.');
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(input.trim())) throw new Error('Enter a valid number.');
  const value = Number(input);
  if (!Number.isFinite(value)) throw new Error('This value is outside the supported number range.');
  return value;
}
export function convertUnit(value: number, categoryId: string, fromId: string, toId: string): number {
  if (!Number.isFinite(value)) throw new Error('Enter a finite number.');
  const category = categories.find(c => c.id === categoryId);
  const from = category?.units.find(u => u.id === fromId);
  const to = category?.units.find(u => u.id === toId);
  if (!category || !from || !to) throw new Error('Choose valid units.');
  let result: number;
  if (categoryId === 'temperature') {
    const celsius = fromId === 'f' ? (value - 32) * 5 / 9 : fromId === 'k' ? value - 273.15 : value;
    if (celsius < -273.15 - 1e-10) throw new Error('Temperature cannot be below absolute zero.');
    result = toId === 'f' ? celsius * 9 / 5 + 32 : toId === 'k' ? celsius + 273.15 : celsius;
  } else if (categoryId === 'fuel') {
    if (value <= 0) throw new Error('Fuel efficiency needs a value greater than zero.');
    const kml = fromId === 'l100' ? 100 / value : value * from.factor;
    result = toId === 'l100' ? 100 / kml : kml / to.factor;
  } else result = value * from.factor / to.factor;
  if (!Number.isFinite(result)) throw new Error('The conversion is outside the supported number range.');
  return Math.abs(result) < 1e-12 && categoryId === 'temperature' ? 0 : result;
}
// Illustrative fixed units per USD. No date or live-market accuracy is implied.
export const currencies = [
  { id: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { id: 'EUR', name: 'Euro', symbol: '€', rate: .92 },
  { id: 'GBP', name: 'British Pound', symbol: '£', rate: .79 },
  { id: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', rate: 278.5 },
  { id: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.1 },
  { id: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 150 },
  { id: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rate: 1.36 },
  { id: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
  { id: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.6725 },
];
export function convertCurrency(value: number, fromId: string, toId: string): number {
  const from = currencies.find(c => c.id === fromId);
  const to = currencies.find(c => c.id === toId);
  if (!from || !to) throw new Error('Choose valid currencies.');
  if (!Number.isFinite(value)) throw new Error('Enter a finite amount.');
  if (value < 0) throw new Error('Enter an amount of zero or greater.');
  const result = value / from.rate * to.rate;
  if (!Number.isFinite(result)) throw new Error('The conversion is outside the supported number range.');
  return result;
}


