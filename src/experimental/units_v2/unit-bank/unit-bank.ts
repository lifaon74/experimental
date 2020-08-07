import { AddAllUnitsToBank } from './converters/all';
import { BasicReadonlyArray, IBasicReadonlyArray } from './misc/basic-readonly-array';
import { NumberToExponent, TExponentNotation } from './misc/exponent-functions';

// export interface IUnitSymbol {
//   readonly value: string;
//   // readonly priority: number;
// }
//
// class UnitSymbol implements IUnitSymbol {
//   readonly value: string;
//   // readonly priority: number;
//
//   constructor(
//     value: string,
//     // priority: number = 0,
//   ) {
//     this.value = value;
//     // this.priority = priority;
//   }
//
//   toString(): string {
//     return this.value;
//   }
// }
//
//
// export interface IBaseUnit {
//   readonly name: string;
//   readonly symbols: ReadonlySet<UnitSymbol>;
// }
//
// class BaseUnit implements IBaseUnit {
//   readonly name: string;
//   readonly symbols: ReadonlySet<UnitSymbol>;
//
//   constructor(
//     name: string,
//     symbols: Iterable<UnitSymbol | string>
//   ) {
//     this.name = name;
//     this.symbols = new Set<UnitSymbol>(
//       Array.from(symbols, (item: UnitSymbol | string, index: number) => {
//         if (typeof item === 'string') {
//           return new UnitSymbol(item);
//         } else if (item instanceof UnitSymbol) {
//           return item;
//         } else {
//           throw new TypeError(`Expected string or UnitSymbol at index ${ index }`);
//         }
//       })
//     );
//   }
// }

/*------------*/




export interface IUnitBank {
  // readonly units: ReadonlyMap<string, ReadonlySet<string>>;

  registerUnit(name: string, symbols?: Iterable<string>): void;

  registerUnitSymbols(name: string, symbols: Iterable<string>): void;

  hasUnit(name: string): boolean;

  getUnitSymbols(name: string): ReadonlySet<string>;

  [Symbol.iterator](): IterableIterator<[string, Iterable<string>]>;
}

export class UnitBank implements IUnitBank {
  protected readonly _units: Map<string, Set<string>>;

  constructor(
    units?: Iterable<[string, Iterable<string>]>
  ) {
    this._units = new Map<string, Set<string>>();
    if (units !== void 0) {
      const iterator: Iterator<[string, Iterable<string>]> = units[Symbol.iterator]();
      let result: IteratorResult<[string, Iterable<string>]>;
      while (!(result = iterator.next()).done) {
        this.registerUnit(result.value[0], result.value[1]);
      }
    }
  }

  registerUnit(name: string, symbols?: Iterable<string>): void {
    if (this._units.has(name)) {
      console.warn(`Unit' ${ name }' already registered`);
    } else {
      this._units.set(name, new Set<string>(symbols));
    }
  }

  registerUnitSymbols(name: string, symbols: Iterable<string>): void {
    if (this._units.has(name)) {
      const set: Set<string> = this._units.get(name) as Set<string>;
      const iterator: Iterator<string> = symbols[Symbol.iterator]();
      let result: IteratorResult<string>;
      while (!(result = iterator.next()).done) {
        set.add(result.value);
      }
    } else {
      throw new Error(`Unit '${ name }' not registered`);
    }
  }

  hasUnit(name: string): boolean {
    return this._units.has(name);
  }

  getUnitSymbols(name: string): ReadonlySet<string> {
    if (this._units.has(name)) {
      return this._units.get(name) as ReadonlySet<string>;
    } else {
      throw new Error(`Unit '${ name }' not registered`);
    }
  }

  * [Symbol.iterator](): IterableIterator<[string, Iterable<string>]> {
    const iterator: Iterator<[string, Set<string>]> = this._units[Symbol.iterator]();
    let result: IteratorResult<[string, Set<string>]>;
    while (!(result = iterator.next()).done) {
      yield * result.value;
    }
  }
}


/*------------*/


export interface ISIPrefix {
  name: string;
  multiplier: number;
  symbols: string[];
}

export const SI_PREFIXES: ISIPrefix[] = [
  {
    name: 'deci',
    multiplier: 1e-1,
    symbols: ['d']
  }, {
    name: 'centi',
    multiplier: 1e-2,
    symbols: ['c']
  }, {
    name: 'milli',
    multiplier: 1e-3,
    symbols: ['m']
  }, {
    name: 'micro',
    multiplier: 1e-6,
    symbols: ['µ', 'u']
  }, {
    name: 'nano',
    multiplier: 1e-9,
    symbols: ['n']
  }, {
    name: 'pico',
    multiplier: 1e-12,
    symbols: ['p']
  }, {
    name: 'femto',
    multiplier: 1e-15,
    symbols: ['f']
  }, {
    name: 'atto',
    multiplier: 1e-18,
    symbols: ['a']
  }, {
    name: 'zepto',
    multiplier: 1e-21,
    symbols: ['z']
  }, {
    name: 'yocto',
    multiplier: 1e-24,
    symbols: ['y']
  }, {
    name: 'deca',
    multiplier: 1e1,
    symbols: ['da']
  }, {
    name: 'hecto',
    multiplier: 1e2,
    symbols: ['h']
  }, {
    name: 'kilo',
    multiplier: 1e3,
    symbols: ['k']
  }, {
    name: 'mega',
    multiplier: 1e6,
    symbols: ['M']
  }, {
    name: 'giga',
    multiplier: 1e9,
    symbols: ['G']
  }, {
    name: 'tera',
    multiplier: 1e12,
    symbols: ['T']
  }, {
    name: 'peta',
    multiplier: 1e15,
    symbols: ['P']
  }, {
    name: 'exa',
    multiplier: 1e18,
    symbols: ['E']
  }, {
    name: 'zetta',
    multiplier: 1e21,
    symbols: ['Z']
  }, {
    name: 'yotta',
    multiplier: 1e24,
    symbols: ['Y']
  }
];

export const PASS_THROUGH_CONVERTER = (value: number) => value;

/*------------*/

export type TUnitConverter = (value: number) => number;

export interface IUnitConverterAndPath {
  units: string[];
  converter: TUnitConverter;
}

export interface IUnitConvertersBank {
  readonly unitBank: IUnitBank;

  registerUnitConverter(from: string, to: string, converter: TUnitConverter): void;

  registerMultiplierConverter(unitA: string, unitB: string, multiplier: number): void;

  registerAdditionConverter(unitA: string, unitB: string, value: number): void;

  registerUnitAliases(unit: string, aliases: string[]): void

  deriveUnitSIPrefixes(name: string): void;

  getUnitConverter(from: string, to: string): TUnitConverter | undefined;

  inferUnitConverters(
    from: string,
    to: string,
    maxIntermediateSteps?: number,
  ): IUnitConverterAndPath[];

  inferUnitConverterOrThrow(from: string, to: string, maxIntermediateSteps?: number): TUnitConverter;
}

export function InferUnitConverter(
  converters: Map<string, Map<string, TUnitConverter>>,
  registerUnitConverter: (from: string, to: string, converter: TUnitConverter) => void,
  from: string,
  to: string,
  maxIntermediateSteps: number = 5,
  memory: Set<string> = new Set<string>()
): IUnitConverterAndPath[] {
  if (maxIntermediateSteps >= 0) {
    const key: string = `${ JSON.stringify(from) }-${ JSON.stringify(to) }`;
    if (memory.has(key)) {
      return [];
    } else {
      memory.add(key);
    }
    if (from === to) {
      return [{
        units: [from, to],
        converter: PASS_THROUGH_CONVERTER
      }];
    } else if (converters.has(from)) {
      const toMap: Map<string, TUnitConverter> = converters.get(from) as Map<string, TUnitConverter>;
      if (toMap.has(to)) {
        return [{
          units: [from, to],
          converter: toMap.get(to) as TUnitConverter
        }];
      } else {
        const list: IUnitConverterAndPath[] = [];
        const iterator: Iterator<[string, TUnitConverter]> = toMap.entries();
        let result: IteratorResult<[string, TUnitConverter]>;
        while (!(result = iterator.next()).done) {
          const [intermediateUnit, fromUnitToIntermediateUnitConverter] = result.value;
          list.push(
            ...InferUnitConverter(
              converters,
              registerUnitConverter,
              intermediateUnit,
              to,
              maxIntermediateSteps - 1,
              memory
            )
              .map((intermediateUnitToToUnitConverter: IUnitConverterAndPath) => {
                const _intermediateUnitToToUnitConverter: TUnitConverter = intermediateUnitToToUnitConverter.converter;
                const converter: TUnitConverter = (input: number): number => {
                  return _intermediateUnitToToUnitConverter(fromUnitToIntermediateUnitConverter(input));
                };
                return {
                  units: [from, ...intermediateUnitToToUnitConverter.units],
                  converter: converter,
                } as IUnitConverterAndPath;
              })
          );
        }
        if (list.length > 0) {
          list.sort((a: IUnitConverterAndPath, b: IUnitConverterAndPath) => {
            return a.units.length - b.units.length;
          });

          registerUnitConverter(from, to, list[0].converter);
        }

        return list;
      }
    } else {
      return [];
    }
  } else {
    return [];
  }
}


export class UnitConvertersBank implements IUnitConvertersBank {
  readonly unitBank: IUnitBank;

  protected readonly _converters: Map<string, Map<string, TUnitConverter>>;

  constructor(
    unitBank: IUnitBank = new UnitBank(),
    // converters: Iterable<[string, string, TUnitConverter]>
  ) {
    this.unitBank = unitBank;
    this._converters = new Map<string, Map<string, TUnitConverter>>();
  }

  registerUnitConverter(from: string, to: string, converter: TUnitConverter): void {
    if (this._converters.has(from)) {
      const toToConverterMap: Map<string, TUnitConverter> = this._converters.get(from) as Map<string, TUnitConverter>;
      if (toToConverterMap.has(to)) {
        throw new Error(`A converter already exists for: '${ from }' -> '${ to }'`);
      } else {
        toToConverterMap.set(to, converter);
      }
    } else {
      this._converters.set(from, new Map<string, TUnitConverter>([[to, converter]]));
    }
  }

  registerMultiplierConverter(unitA: string, unitB: string, multiplier: number): void {
    this.registerUnitConverter(unitA, unitB, (value: number): number => (value * multiplier));
    this.registerUnitConverter(unitB, unitA, (value: number): number => (value / multiplier));
  }

  registerAdditionConverter(unitA: string, unitB: string, value: number): void {
    this.registerUnitConverter(unitA, unitB, (value: number): number => (value + value));
    this.registerUnitConverter(unitB, unitA, (value: number): number => (value - value));
  }

  registerUnitAliases(name: string, aliases: string[]): void {
    const unitSymbols: string[] = Array.from(this.unitBank.getUnitSymbols(name));

    for (let i = 0, l = aliases.length; i < l; i++) {
      const alias: string = aliases[i];
      this.unitBank.registerUnit(alias, unitSymbols);
      this.registerUnitConverter(name, alias, PASS_THROUGH_CONVERTER);
      this.registerUnitConverter(alias, name, PASS_THROUGH_CONVERTER);
    }
  }

  deriveUnitSIPrefixes(name: string): void {
    const unitSymbols: string[] = Array.from(this.unitBank.getUnitSymbols(name));
    const unitSymbolsLength: number = unitSymbols.length;

    for (let i = 0, l1 = SI_PREFIXES.length; i < l1; i++) {
      const siPrefix: ISIPrefix = SI_PREFIXES[i];
      const multiplier: number = siPrefix.multiplier;
      const unitToPrefixedConverter = (value: number): number => (value / multiplier);
      const prefixedToUnitConverter = (value: number): number => (value * multiplier);

      const prefixesSymbols: string[] = [];
      for (let j = 0; j < unitSymbolsLength; j++) {
        const unitSymbol: string = unitSymbols[j];
        for (let k = 0, l3 = siPrefix.symbols.length; k < l3; k++) {
          prefixesSymbols.push(`${ siPrefix.symbols[k] }${ unitSymbol }`);
        }
      }

      const prefixedName: string = `${ siPrefix.name }${ name }`;
      this.unitBank.registerUnit(prefixedName, prefixesSymbols);
      this.registerUnitConverter(name, prefixedName, unitToPrefixedConverter);
      this.registerUnitConverter(prefixedName, name, prefixedToUnitConverter);
    }
  }


  getUnitConverter(from: string, to: string): TUnitConverter | undefined {
    if (from === to) {
      return PASS_THROUGH_CONVERTER;
    } else if (this._converters.has(from)) {
      return (this._converters.get(from) as Map<string, TUnitConverter>).get(to) as TUnitConverter | undefined;
    } else {
      return void 0;
    }
  }

  inferUnitConverters(
    from: string,
    to: string,
    maxIntermediateSteps?: number,
  ): IUnitConverterAndPath[] {
    return InferUnitConverter(
      this._converters,
      this.registerUnitConverter.bind(this),
      from,
      to,
      maxIntermediateSteps
    );
  }

  inferUnitConverterOrThrow(from: string, to: string, maxIntermediateSteps?: number): TUnitConverter {
    const converter: TUnitConverter | undefined = this.getUnitConverter(from, to);
    if (converter === void 0) {
      const converters: IUnitConverterAndPath[] = this.inferUnitConverters(from, to, maxIntermediateSteps);
      if (converters.length === 0) {
        throw new Error(`No converter found from '${ from }' to '${ to }'`);
      } else {
        return converters[0].converter;
      }
    } else {
      return converter;
    }
  }

}


/*------------*/




// export interface IUnit {
//   readonly name: string;
//   readonly exponent: number;
//
//   changeExponent(exponent: number): IUnit;
//
//   toString(options?: IUnitToStringOptions): string;
// }
//
// export interface IUnitToStringOptions {
//   exponentNotation?: TExponentNotation; // (default: 'sup')
// }
//
// export class Unit implements IUnit {
//   readonly name: string;
//   readonly exponent: number;
//
//   constructor(
//     name: string,
//     exponent: number = 1
//   ) {
//     this.name = name;
//     this.exponent = exponent;
//   }
//
//   changeExponent(exponent: number): IUnit {
//     return new Unit(
//       this.name,
//       exponent,
//     );
//   }
//
//   toString(options: IUnitToStringOptions = {}): string {
//     if (this.exponent === 0) {
//       return '';
//     } else {
//       const exponent: string = (this.exponent === 1)
//         ? ''
//         : NumberToExponent(this.exponent, options.exponentNotation);
//       return `${ this.name }${ exponent }`;
//     }
//   }
// }
//
//
// export type TUnitOrUnitComposition = IUnit | IUnitComposition;
//
// export interface IUnitComposition extends IBasicReadonlyArray<IUnit> {
//   invert(): IUnitComposition;
//
//   mul(...values: TUnitOrUnitComposition[]): IUnitComposition;
//
//   div(...values: TUnitOrUnitComposition[]): IUnitComposition;
// }
//
// export class UnitsComposition extends BasicReadonlyArray<IUnit> implements IUnitComposition {
//   constructor(
//     ...units: TUnitOrUnitComposition[]
//   ) {
//     const flattenUnits: IUnit[] = [];
//     for (let i = 0, l = units.length; i < l; i++) {
//       const unit: TUnitOrUnitComposition = units[i];
//       if (unit instanceof UnitsComposition) {
//         const unitsCompositionIterator: Iterator<IUnit> = unit[Symbol.iterator]();
//         let unitsCompositionResult: IteratorResult<IUnit>;
//         while (!(unitsCompositionResult = unitsCompositionIterator.next()).done) {
//           flattenUnits.push(unitsCompositionResult.value);
//         }
//       } else if (unit instanceof Unit) {
//         flattenUnits.push(unit);
//       } else {
//         throw new TypeError(`Expected TUnitOrUnitComposition`);
//       }
//     }
//     const groupedUnits: Map<string, IUnit> = new Map<string, IUnit>();
//     for (let i = 0, l = flattenUnits.length; i < l; i++) {
//       const unit: IUnit = flattenUnits[i];
//       if (groupedUnits.has(unit.name)) {
//         (groupedUnits.get(unit.name) as any).exponent += unit.exponent;
//       } else {
//         groupedUnits.set(unit.name, new Unit(unit.name, unit.exponent));
//       }
//     }
//     super(groupedUnits.values());
//   }
//
//   invert(): IUnitComposition {
//     return new UnitsComposition(
//       ...this._items.map((unit: IUnit) => {
//         return unit.changeExponent(-unit.exponent);
//       })
//     );
//   }
//
//   mul(...values: TUnitOrUnitComposition[]): IUnitComposition {
//     return new UnitsComposition(this, ...values);
//   }
//
//   div(...values: TUnitOrUnitComposition[]): IUnitComposition {
//     return new UnitsComposition(
//       this,
//       ((values.length === 1) && (values[0] instanceof UnitsComposition))
//         ? values[0].invert()
//         : new UnitsComposition(...values).invert()
//     );
//   }
//
//   toString(): string {
//     return this._items.join('⋅');
//   }
// }
//


export interface IAlgebraNode {
  simplify(): IAlgebraNode;
}

export abstract class AlgebraNode implements IAlgebraNode {
  abstract simplify(): IAlgebraNode;
}



export interface IAlgebraSymbol extends IAlgebraNode {
  readonly name: string;
}

export class AlgebraSymbol extends AlgebraNode implements IAlgebraSymbol {
  readonly name: string;

  constructor(
    name: string
  ) {
    super();
    this.name = name;
  }

  simplify(): IAlgebraNode {
    return this;
  }
}


export interface IAlgebraNumber extends IAlgebraNode {
  readonly value: number;
}

export class AlgebraNumber extends AlgebraNode implements IAlgebraNumber {
  readonly value: number;

  constructor(
    value: number
  ) {
    super();
    this.value = value;
  }

  simplify(): IAlgebraNode {
    return this;
  }
}



export interface IAlgebraFunction extends IAlgebraNode {
  readonly members: ReadonlyArray<IAlgebraNode>;
}

export abstract class AlgebraFunction extends AlgebraNode implements IAlgebraFunction {
  readonly members: ReadonlyArray<IAlgebraNode>;
}


export interface IAlgebraSum extends IAlgebraFunction {

}


/*------------*/

export async function debugUnitBank1() {
  const bank = new UnitConvertersBank();
  AddAllUnitsToBank(bank);
  (window as any).bank = bank;

  console.log(bank.inferUnitConverterOrThrow('kilometre', 'foot')(2));
  console.log(bank.inferUnitConverterOrThrow('hour', 'second')(2));
  console.log(bank.inferUnitConverterOrThrow('kilogram', 'gram')(2));
}

export async function debugUnitBank2() {
  const bank = new UnitConvertersBank();
  AddAllUnitsToBank(bank);
  (window as any).bank = bank;

  // Watt:
  // https://en.wikipedia.org/wiki/Watt#:~:text=The%20watt%20(symbol%3A%20W),the%20rate%20of%20energy%20transfer.
  // W = J/s
  // W = kg⋅m2⋅s−3
}

/*------------*/

export async function debugUnitBank() {
  await debugUnitBank1();
}
