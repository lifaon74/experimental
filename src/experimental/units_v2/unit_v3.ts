export interface IBasicReadonlyArray<G> {
  readonly length: number;

  item(index: number): G;

  [Symbol.iterator](): IterableIterator<G>;
}

export class BasicReadonlyArray<G> implements IBasicReadonlyArray<G> {
  protected _items: G[];

  constructor(items: Iterable<G>) {
    this._items = Array.isArray(items)
      ? items
      : Array.from(items);
  }

  get length(): number {
    return this._items.length;
  }

  item(index: number): G {
    if ((0 <= index) && (index < this._items.length)) {
      return this._items[index];
    } else {
      throw new RangeError(`Index out of range`);
    }
  }

  [Symbol.iterator]() {
    return this._items[Symbol.iterator]();
  }
}


/*----*/

export const DIGITS_TO_SUPER_SCRIPT = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

export type TExponentNotation = 'sup' | '^' | '';

export function NumberToSuperScript(value: number): string {
  return Array.from(value.toString(10), (char: string) => {
    switch (char) {
      case '0':
        return '⁰';
      case '1':
        return '¹';
      case '2':
        return '²';
      case '3':
        return '³';
      case '4':
        return '⁴';
      case '5':
        return '⁵';
      case '6':
        return '⁶';
      case '7':
        return '⁷';
      case '8':
        return '⁸';
      case '9':
        return '⁹';
      case '-':
        return '⁻';
      case '.':
        return '\u22C5';
      default:
        throw new Error(`Unsupported conversion from char '${ char }' to superscript char`);
    }
  }).join('');
}

export function NumberToExponent(value: number, exponentNotation: TExponentNotation = 'sup'): string {
  switch (exponentNotation) {
    case 'sup':
      return NumberToSuperScript(value);
    case '^':
      return `^${ value.toString(10) }`;
    case '':
      return value.toString(10);
    default:
      throw new TypeError(`Invalid exponentNotation`);
  }
}


/*----*/


export interface IUnitSymbol {
  readonly value: string;
  readonly priority: number;

  toString(): string;
}


export class UnitSymbol implements IUnitSymbol {
  readonly value: string;
  readonly priority: number;

  constructor(
    value: string,
    priority: number = 0,
  ) {
    this.value = value;
    this.priority = priority;
  }

  toString(): string {
    return this.value;
  }
}


// https://en.wikipedia.org/wiki/Metric_prefix
export interface IUnitPrefix {
  readonly name: string;
  readonly multiplier: number;
  readonly symbols: ReadonlySet<IUnitSymbol>;

  toString(): string;
}

export class UnitPrefix implements IUnitPrefix {
  readonly name: string;
  readonly multiplier: number;
  readonly symbols: ReadonlySet<IUnitSymbol>;

  constructor(
    name: string,
    multiplier: number,
    symbols: Iterable<IUnitSymbol> = [],
  ) {
    this.name = name;
    this.multiplier = multiplier;
    this.symbols = new Set<IUnitSymbol>(symbols);
  }

  toString(): string {
    return (this.symbols.size === 0)
      ? this.name
      : this.symbols.values().next().value.toString();
  }
}

export const SI_UNIT_PREFIXES = [
  new UnitPrefix(
    'deci',
    1e-1,
    [new UnitSymbol('d')]
  ),
  new UnitPrefix(
    'centi',
    1e-2,
    [new UnitSymbol('c')]
  ),
  new UnitPrefix(
    'milli',
    1e-3,
    [new UnitSymbol('m')]
  ),
  new UnitPrefix(
    'micro',
    1e-6,
    [new UnitSymbol('µ'),
      new UnitSymbol('u')]
  ),
  new UnitPrefix(
    'nano',
    1e-9,
    [new UnitSymbol('n')]
  ),
  new UnitPrefix(
    'pico',
    1e-12,
    [new UnitSymbol('p')]
  ),
  new UnitPrefix(
    'femto',
    1e-15,
    [new UnitSymbol('f')]
  ),
  new UnitPrefix(
    'atto',
    1e-18,
    [new UnitSymbol('a')]
  ),
  new UnitPrefix(
    'zepto',
    1e-21,
    [new UnitSymbol('z')]
  ),
  new UnitPrefix(
    'yocto',
    1e-24,
    [new UnitSymbol('y')]
  ),
  new UnitPrefix(
    'deca',
    1e1,
    [new UnitSymbol('da')]
  ),
  new UnitPrefix(
    'hecto',
    1e2,
    [new UnitSymbol('h')]
  ),
  new UnitPrefix(
    'kilo',
    1e3,
    [new UnitSymbol('k')]
  ),
  new UnitPrefix(
    'mega',
    1e6,
    [new UnitSymbol('M')]
  ),
  new UnitPrefix(
    'giga',
    1e9,
    [new UnitSymbol('G')]
  ),
  new UnitPrefix(
    'tera',
    1e12,
    [new UnitSymbol('T')]
  ),
  new UnitPrefix(
    'peta',
    1e15,
    [new UnitSymbol('P')]
  ),
  new UnitPrefix(
    'exa',
    1e18,
    [new UnitSymbol('E')]
  ),
  new UnitPrefix(
    'zetta',
    1e21,
    [new UnitSymbol('Z')]
  ),
  new UnitPrefix(
    'yotta',
    1e24,
    [new UnitSymbol('Y')]
  )
];



export interface IUnit {
  readonly name: string;
  readonly symbols: Set<IUnitSymbol>;
  readonly exponent: number;

  equals(unit: IUnit): boolean;

  changeExponent(exponent: number): IUnit;

  toString(options?: IUnitToStringOptions): string;
}

export interface IUnitToStringOptions {
  exponentNotation?: TExponentNotation; // (default: 'sup')
}

export class Unit implements IUnit {
  readonly name: string;
  readonly symbols: Set<IUnitSymbol>;
  readonly exponent: number;

  constructor(
    name: string,
    symbols: Iterable<IUnitSymbol> = [],
    exponent: number = 1
  ) {
    this.name = name;
    this.symbols = new Set<IUnitSymbol>(symbols);
    this.exponent = exponent;
  }

  equals(unit: IUnit): boolean {
    return (this.name === unit.name)
      && (this.exponent === unit.exponent);
  }

  changeExponent(exponent: number): IUnit {
    return new Unit(
      this.name,
      this.symbols,
      exponent,
    );
  }

  toString(options: IUnitToStringOptions = {}): string {
    if (this.exponent === 0) {
      return '';
    } else {
      const symbol: string = (this.symbols.size === 0)
        ? this.name
        : this.symbols.values().next().value.toString();
      const exponent: string = (this.exponent === 1)
        ? ''
        : NumberToExponent(this.exponent, options.exponentNotation);
      return `${ symbol }${ exponent }`;
    }
  }
}


export type TUnitOrUnitComposition = IUnit | IUnitComposition;

export interface IUnitComposition extends IBasicReadonlyArray<IUnit> {
  invert(): IUnitComposition;

  mul(...values: TUnitOrUnitComposition[]): IUnitComposition;

  div(...values: TUnitOrUnitComposition[]): IUnitComposition;
}

export class UnitsComposition extends BasicReadonlyArray<IUnit> implements IUnitComposition {
  constructor(
    ...units: TUnitOrUnitComposition[]
  ) {
    const flattenUnits: IUnit[] = [];
    for (let i = 0, l = units.length; i < l; i++) {
      const unit: TUnitOrUnitComposition = units[i];
      if (unit instanceof UnitsComposition) {
        const unitsCompositionIterator: Iterator<IUnit> = unit[Symbol.iterator]();
        let unitsCompositionResult: IteratorResult<IUnit>;
        while (!(unitsCompositionResult = unitsCompositionIterator.next()).done) {
          flattenUnits.push(unitsCompositionResult.value);
        }
      } else if (unit instanceof Unit) {
        flattenUnits.push(unit);
      } else {
        throw new TypeError(`Expected TUnitOrUnitComposition`);
      }
    }
    const groupedUnits: Map<string, IUnit> = new Map<string, IUnit>();
    for (let i = 0, l = flattenUnits.length; i < l; i++) {
      const unit: IUnit = flattenUnits[i];
      if (groupedUnits.has(unit.name)) {
        (groupedUnits.get(unit.name) as any).exponent += unit.exponent;
      } else {
        groupedUnits.set(unit.name, new Unit(unit.name, unit.symbols, unit.exponent));
      }
    }
    super(groupedUnits.values());
  }

  invert(): IUnitComposition {
    return new UnitsComposition(
      ...this._items.map((unit: IUnit) => {
        return unit.changeExponent(-unit.exponent);
      })
    );
  }

  mul(...values: TUnitOrUnitComposition[]): IUnitComposition {
    return new UnitsComposition(this, ...values);
  }

  div(...values: TUnitOrUnitComposition[]): IUnitComposition {
    return new UnitsComposition(
      this,
      ((values.length === 0) && (values[0] instanceof UnitsComposition))
        ? values[0].invert()
        : new UnitsComposition(...values).invert()
    );
  }

  toString(): string {
    return this._items.join('⋅');
  }
}


export type TUnitConverter = (from: TUnitOrUnitComposition, to: TUnitOrUnitComposition) => TUnitOrUnitComposition;


// export type TUnitValueConverter = (input: number) => number;
// export type TUnitValueConverterFactory = (from: IUnit, to: IUnit) => TUnitValueConverter;

export interface IUnitValue {
  readonly value: number;
  readonly unit: TUnitOrUnitComposition;
}








/*--*/

/*
export type TNumberOrNumericValue = number | INumericValue;

export interface INumericValue extends IUnit {
  add(...values: TNumberOrNumericValue[]): INumericValue;

  // sub(...values: TNumberOrNumericValue[]): INumericValue;
  // mul(...values: TNumberOrNumericValue[]): INumericValue;
  // div(...values: TNumberOrNumericValue[]): INumericValue;
  //
  // equals(...values: TNumberOrNumericValue[]): boolean;
  // reduce(): INumericValue;
}

export function NumericValueAdd(instance: INumericValue, values: TNumberOrNumericValue[]): INumericValue {
  // if (instance instanceof )
  throw 'TODO';
}

export abstract class NumericValue extends Unit implements INumericValue {
  add(...values: TNumberOrNumericValue[]): INumericValue {
    return NumericValueAdd(this, values);
  }
}


export interface IUnitValue extends INumericValue {
  readonly value: number;
  readonly unit: IPrefixedUnit;
}

export class UnitValue extends NumericValue implements IUnitValue {
  readonly value: number;
  readonly unit: IPrefixedUnit;

  constructor(
    value: number,
    unit: IPrefixedUnit,
  ) {
    super();
    this.value = value;
    this.unit = unit;
  }

  toString(): string {
    return `${ this.value } ${ this.unit.toString() }`;
  }
}


export type TMathOperator =
  'sum'
  | 'product'
  | 'negate'
  | 'invert';

export interface INumericArray {
  readonly length: number;

  item(index: number): INumericValue;

  [Symbol.iterator](): IterableIterator<INumericValue>;
}

export class NumericArray implements INumericArray {
  protected _items: INumericValue[];

  constructor(items: Iterable<INumericValue>) {
    this._items = Array.isArray(items)
      ? items
      : Array.from(items);
  }

  get length(): number {
    return this._items.length;
  }

  item(index: number): INumericValue {
    if ((0 <= index) && (index < this._items.length)) {
      return this._items[index];
    } else {
      throw new RangeError(`Index out of range`);
    }
  }

  [Symbol.iterator]() {
    return this._items[Symbol.iterator]();
  }
}


export interface IMathValue extends INumericValue {
  readonly operator: TMathOperator;
}

export abstract class MathValue extends NumericValue implements IMathValue {
  readonly operator: TMathOperator;

  protected constructor(operator: TMathOperator) {
    super();
    this.operator = operator;
  }
}


export interface IMathSum extends IMathValue {
  readonly operator: 'sum';
  readonly values: INumericArray;
}

// export class MathSum extends MathValue implements IMathSum {
//   constructor(...values: INumericValue[]) {
//     super('sum');
//   }
// }

export interface IMathProduct extends IMathValue {
  readonly operator: 'product';
  readonly values: INumericArray;
}

export interface IMathNegate extends IMathValue {
  readonly operator: 'negate';
  readonly value: INumericValue;
}

export interface IMathInvert extends IMathValue {
  readonly operator: 'invert';
  readonly value: INumericValue;
}

*/

export async function debugUnitV3() {
  const second = new Unit('second', [new UnitSymbol('s')]);
  const meter = new Unit('meter',[new UnitSymbol('m')]);
  const gram = new Unit('gram', [new UnitSymbol('g')]);

  const squareMeter = meter.changeExponent(2);
  const kiloGram = new Unit('kilogram', [new UnitSymbol('kg')]);

  // W = kg⋅m2⋅s−3
  const watt = new UnitsComposition(kiloGram, squareMeter, second.changeExponent(-3)).mul(meter);

  // console.log(squareMeter.toString({ exponentAsSuperscript: true }));
  console.log(watt.toString());
}
