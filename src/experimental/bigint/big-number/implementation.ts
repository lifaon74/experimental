import { NormalizeBase, NormalizeDigits } from './functions';
import { IBigNumber } from './interfaces';
import { ConstructBigNumber } from './constructor';
import { BIG_NUMBER_PRIVATE, IBigNumberInternal } from './privates';


/** METHODS **/

/* GETTERS/SETTERS */

export function BigNumberGetDigits(instance: IBigNumber): Uint8Array {
  return (instance as IBigNumberInternal)[BIG_NUMBER_PRIVATE].digits;
}

export function BigNumberSetDigits(instance: IBigNumber, digits: Uint8Array): void {
  (instance as IBigNumberInternal)[BIG_NUMBER_PRIVATE].digits = NormalizeDigits(digits, (instance as IBigNumberInternal)[BIG_NUMBER_PRIVATE].base);
}


export function BigNumberGetBase(instance: IBigNumber): number {
  return (instance as IBigNumberInternal)[BIG_NUMBER_PRIVATE].base;
}

export function BigNumberSetBase(instance: IBigNumber, base: number): void {
  (instance as IBigNumberInternal)[BIG_NUMBER_PRIVATE].base = NormalizeBase(base, (instance as IBigNumberInternal)[BIG_NUMBER_PRIVATE].digits);
}


export function BigNumberGetNegative(instance: IBigNumber): boolean {
  return (instance as IBigNumberInternal)[BIG_NUMBER_PRIVATE].negative;
}

export function BigNumberSetNegative(instance: IBigNumber, negative: boolean): void {
  (instance as IBigNumberInternal)[BIG_NUMBER_PRIVATE].negative = Boolean(negative);
}



/** ABSTRACT CLASS **/

export abstract class BigNumber implements IBigNumber {

  protected constructor(digits?: Uint8Array, negative?: boolean, base?: number) {
    ConstructBigNumber(this, digits, negative, base);
  }

  get digits(): Uint8Array {
    return BigNumberGetDigits(this);
  }

  set digits(input: Uint8Array) {
    BigNumberSetDigits(this, input);
  }


  get base(): number {
    return BigNumberGetBase(this);
  }

  set base(input: number) {
    BigNumberSetBase(this, input);
  }


  get negative(): boolean {
    return BigNumberGetNegative(this);
  }

  set negative(input: boolean) {
    BigNumberSetNegative(this, input);
  }


  abstract get sign(): number;


  /**
   * COMPARISION
   */

  abstract isNull(): boolean;

  abstract compare(input: IBigNumber): number;

  abstract equals(input: IBigNumber): boolean;

  abstract greaterThan(input: IBigNumber): boolean;

  abstract lowerThan(input: IBigNumber): boolean;

  abstract greaterThanOrEquals(input: IBigNumber): boolean;

  abstract lowerThanOrEquals(input: IBigNumber): boolean;


  /**
   * ARITHMETIC
   */

  abstract add(input: IBigNumber): IBigNumber;

  abstract subtract(input: IBigNumber): IBigNumber;

  abstract multiply(input: IBigNumber): IBigNumber;

  abstract divide(input: IBigNumber): IBigNumber;

  abstract remainder(input: IBigNumber): IBigNumber;


  abstract negate(): IBigNumber;


  /**
   * CONVERSION
   */

  abstract toBase(base: number): IBigNumber;

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

