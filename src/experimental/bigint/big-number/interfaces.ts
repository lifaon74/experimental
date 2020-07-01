

/** INTERFACES **/

export interface IBigNumberConstructor {
  new(digits?: Uint8Array, negative?: boolean, base?: number): IBigNumber;
}

export interface IBigNumber {
  digits: Uint8Array;
  base: number;
  negative: boolean;
  readonly sign: number;


  /**
   * COMPARISION
   */

  isNull(): boolean;

  compare(input: IBigNumber): number;

  equals(input: IBigNumber): boolean;

  greaterThan(input: IBigNumber): boolean;

  lowerThan(input: IBigNumber): boolean;

  greaterThanOrEquals(input: IBigNumber): boolean;

  lowerThanOrEquals(input: IBigNumber): boolean;


  /**
   * ARITHMETIC
   */

  add(input: IBigNumber): IBigNumber;

  subtract(input: IBigNumber): IBigNumber;

  multiply(input: IBigNumber): IBigNumber;

  divide(input: IBigNumber): IBigNumber;

  remainder(input: IBigNumber): IBigNumber;


  negate(): IBigNumber;


  /**
   * CONVERSION
   */

  toBase(base: number): IBigNumber;

  valueOf(): number;

  toNumber(): number;

  toString(numberToChar?: string[]): string;
}
