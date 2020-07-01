import { BigNumber } from './BigNumber';


export type TFloatDigits = [Uint8Array, number];

export function CreateFloatDigitsBuffer(size: number, shift: number = 0): TFloatDigits {
  return [new Uint8Array(size), shift];
}


export function ReduceFloatDigits([input, shift]: TFloatDigits): TFloatDigits {
  let end: number = input.length - 1;
  for (; end > 0; end--) { // strictly greater than 0 because we want at least one digit
    if (input[end] !== 0) {
      break;
    }
  }
  let start: number = 0;
  for (; start < end; start++) {
    if (input[start] !== 0) {
      break;
    }
  }
  return [input.subarray(start, end + 1), shift + start];
}






// export type BigFloatType = 'Infinity' | 'NaN' | 'Rational';
//  static readonly types: ReadonlyArray<BigFloatType> = Object.freeze<BigFloatType>(['Infinity', 'NaN', 'Rational']);

/**
 * Ensures shift is an integer
 * @param {number} shift
 * @return {number}
 * @constructor
 */
export function NormalizeShift(shift: number): number {
  shift = Number(shift);
  if (Number.isNaN(shift)) {
    throw new TypeError(`Expected number as shift`);
  } else {
    return Math.trunc(shift);
  }
}



export class BigFloat extends BigNumber {


  // static fromFloat(input: number, base?: number): BigFloat {
  // }

  protected _shift: number;

  constructor(digits?: Uint8Array, negative?: boolean, base?: number, shift: number = 0) {
    super(digits, negative, base);
  }


  get shift(): number {
    return this._shift;
  }

  set shift(input: number) {
    this._shift = NormalizeShift(input);
  }

}






