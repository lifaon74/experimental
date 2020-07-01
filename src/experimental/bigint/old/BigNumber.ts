

/**
 * Ensures than 'base' is an integer in range [1, 256],
 * and, if 'digits' is provided, than all its values are in the range [0, base[
 * @param {number} base
 * @param {Uint8Array} digits
 * @return {number}
 * @constructor
 */
export function NormalizeBase(base: number, digits?: Uint8Array): number {
  base = Number(base);
  if (Number.isNaN(base)) {
    throw new TypeError(`Expected number as base`);
  } else if (base < 1) {
    throw new RangeError(`Expected base greater or equals to 1`);
  } else if (base > 256) {
    throw new RangeError(`Expected base lower or equals to 256`);
  } else {
    base = Math.floor(base);
    if (digits !== void 0) {
      for (let i = 0, l = digits.length; i < l; i++) {
        if (digits[i] >= base) {
          throw new RangeError(`Expected base greater than digits[${i}] = ${digits[i]}`);
        }
      }
    }
    return base;
  }
}

/**
 * Ensures than 'digits' is an Uint8Array, and all its values are in the range [0, base[
 * @param {Uint8Array} digits
 * @param {number} base
 * @return {Uint8Array}
 * @constructor
 */
export function NormalizeDigits(digits: Uint8Array, base: number): Uint8Array {
  if (digits instanceof Uint8Array) {
    const length: number = digits.length;
    if (length < 1) {
      throw new TypeError(`Expected a minimal length of 1 for digits`);
    } else {
      for (let i = 0; i < length; i++) {
        if (digits[i] >= base) {
          throw new RangeError(`Expected number lower to ${base} as digits[${i}]`);
        }
      }
      return digits;
    }
  } else {
    throw new TypeError(`Expected number[] as digits`);
  }
}


export let DISCARD_BIG_NUMBER_INIT: boolean = false;
export function CreateBigNumber<T extends BigNumber>(ctor: new (...args:any[]) => T): T {
  DISCARD_BIG_NUMBER_INIT = true;
  const output: T = new ctor();
  DISCARD_BIG_NUMBER_INIT = false;
  return output;
}

export abstract class BigNumber {
  protected _digits: Uint8Array;
  protected _negative: boolean;
  protected _base: number;

  protected constructor(digits: Uint8Array = new Uint8Array(1), negative: boolean = false, base: number = 10) {
    if (!DISCARD_BIG_NUMBER_INIT) {
      this.negative = negative;
      this._base = NormalizeBase(base);
      this._digits = NormalizeDigits(digits, this._base);
    }
  }

  get digits(): Uint8Array {
    return this._digits.slice();
  }

  set digits(input: Uint8Array) {
    this._digits = NormalizeDigits(input, this._base);
  }


  get base(): number {
    return this._base;
  }

  set base(input: number) {
    this._base = NormalizeBase(input, this._digits);
  }


  get negative(): boolean {
    return this._negative;
  }

  set negative(input: boolean) {
    this._negative = Boolean(input);
  }


  abstract get sign(): number;


  /**
   * COMPARISION
   */

  abstract isNull(): boolean;

  abstract compare(input: BigNumber): number;

  abstract equals(input: BigNumber): boolean;

  abstract greaterThan(input: BigNumber): boolean;

  abstract lowerThan(input: BigNumber): boolean;

  abstract greaterThanOrEquals(input: BigNumber): boolean;

  abstract lowerThanOrEquals(input: BigNumber): boolean;


  /**
   * ARITHMETIC
   */

  abstract add(input: BigNumber): BigNumber;

  abstract subtract(input: BigNumber): BigNumber;

  abstract multiply(input: BigNumber): BigNumber;

  abstract divide(input: BigNumber): BigNumber;

  abstract remainder(input: BigNumber): BigNumber;


  abstract negate(): BigNumber;


  /**
   * CONVERSION
   */

  abstract toBase(base: number): BigNumber;

  valueOf(): number {
    return this.toNumber();
  }

  abstract toNumber(): number;
  abstract toString(numberToChar?: string[]): string;

  /**
   * SYMBOLS
   */

  get [Symbol.toStringTag]() {
    return 'BigNumber';
  }

  [Symbol.toPrimitive](type: string) {
    switch (type) {
      case 'number':
        return this.toNumber();
      case 'string':
        return this.toString();
      default:
        return this; // maybe toNumber ?
    }
  }

}

