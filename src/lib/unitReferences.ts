import { categories, convertUnit } from './conversions.ts';

type Reference = {
  value: number;
  from: string;
  to: string;
  approximate?: true;
  exactResult?: string;
  fromLabel?: string;
  toLabel?: string;
};

// Standard definitions: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9
// Only non-terminating decimal results are approximate. Exact decimal strings
// preserve definitions that exceed JavaScript Number's display precision.
const references: Record<string, Reference[]> = {
  length: [
    { value: 1, from: 'km', to: 'm' },
    { value: 1, from: 'mi', to: 'km', fromLabel: 'mile' },
    { value: 1, from: 'ft', to: 'in', fromLabel: 'foot', toLabel: 'inches' },
  ],
  area: [
    { value: 1, from: 'acre', to: 'ft2', fromLabel: 'acre', toLabel: 'sq ft' },
    { value: 1, from: 'ha', to: 'm2', fromLabel: 'hectare' },
    { value: 1, from: 'km2', to: 'ha', toLabel: 'hectares' },
  ],
  mass: [
    { value: 1, from: 'kg', to: 'g' },
    { value: 1, from: 'lb', to: 'g' },
    { value: 1, from: 'lb', to: 'oz' },
  ],
  volume: [
    { value: 1, from: 'l', to: 'ml' },
    { value: 1, from: 'gal-us', to: 'l' },
    { value: 1, from: 'gal-uk', to: 'l' },
  ],
  temperature: [
    { value: 0, from: 'c', to: 'f' },
    { value: 100, from: 'c', to: 'f' },
    { value: 0, from: 'c', to: 'k' },
  ],
  speed: [
    { value: 1, from: 'ms', to: 'kmh' },
    { value: 1, from: 'mph', to: 'kmh' },
    { value: 1, from: 'knot', to: 'kmh' },
  ],
  time: [
    { value: 1, from: 'min', to: 's' },
    { value: 1, from: 'h', to: 'min' },
    { value: 1, from: 'day', to: 'h', fromLabel: 'day' },
  ],
  energy: [
    { value: 1, from: 'kj', to: 'j' },
    { value: 1, from: 'cal', to: 'j', fromLabel: 'cal (thermochemical)' },
    { value: 1, from: 'kwh', to: 'kj' },
  ],
  force: [
    { value: 1, from: 'kn', to: 'n' },
    { value: 1, from: 'lbf', to: 'n' },
    { value: 1, from: 'n', to: 'lbf', approximate: true },
  ],
  power: [
    { value: 1, from: 'kw', to: 'w' },
    { value: 1, from: 'gw', to: 'kw' },
    { value: 1, from: 'hp', to: 'w', exactResult: '745.69987158227022', fromLabel: 'hp (mechanical)' },
  ],
  pressure: [
    { value: 1, from: 'bar', to: 'kpa' },
    { value: 1, from: 'atm', to: 'kpa' },
    { value: 1, from: 'mmhg', to: 'pa' },
  ],
  fuel: [
    { value: 10, from: 'kml', to: 'l100' },
    { value: 30, from: 'mpg-us', to: 'l100', approximate: true },
    { value: 30, from: 'mpg-uk', to: 'l100', approximate: true },
  ],
  data: [
    { value: 1, from: 'gb', to: 'mb' },
    { value: 1, from: 'mb', to: 'kb' },
    { value: 1, from: 'kb', to: 'b' },
  ],
};

export function getUnitReferences(categoryId: string): string[] {
  const category = categories.find(item => item.id === categoryId);
  if (!category) return [];
  return references[categoryId].map(reference => {
    const from = category.units.find(unit => unit.id === reference.from)!;
    const to = category.units.find(unit => unit.id === reference.to)!;
    const result = convertUnit(reference.value, categoryId, from.id, to.id);
    // Exact examples fit in 15 significant digits except explicit overrides.
    // Repeating decimals retain 12 significant digits, rather than 2–3 places.
    const decimal = reference.exactResult ?? Number(result.toPrecision(reference.approximate ? 12 : 15)).toString();
    const [whole, fraction] = decimal.split('.');
    const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (fraction ? `.${fraction}` : '');
    return `${reference.value} ${reference.fromLabel ?? from.symbol} ${reference.approximate ? '≈' : '='} ${formatted} ${reference.toLabel ?? to.symbol}`;
  });
}
