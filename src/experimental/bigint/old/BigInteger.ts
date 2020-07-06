
// function ArrayChunkCopy(
//   input: number[],
//   start: number = 0,
//   end: number = input.length,
//   offset: number = 0,
//   output: number[] = []
// ) {
//   if (output === input) {
//     const length: number = input.length;
//     output.length = length;
//     for (let i = 0; i < length; i++) {
//       output[i] = input[i];
//     }
//   } else {
//     output.length = offset + end - start;
//     let j: number = offset;
//     for (let i = start; i < end; i++, j++) {
//       output[j] = input[i];
//     }
//   }
//   return output;
// }


import { DigitsCompare, DigitsEqual, DigitsLower, DigitsNull } from './DigitsComparision';
import { Add2Digits, Add2DigitsBufferSafeSize, Div2Digits, Div2DigitsQuotientBufferSafeSize, Div2DigitsRemainderBufferSafeSize, Mul2Digits, Mul2DigitsBufferSafeSize, Sub2DigitsBufferSafeSize, Sub2DigitsOrdered } from './DigitsArithmetic';
import { DigitsToNumberOverflow, DigitsToString, NumberSize, NumberToDigits, ReduceDigits, StringToDigits } from './DigitsConversion';
import { $ChangeBaseOfDigits } from './DigitsBase';
import { $ShiftDigits } from './DigitsShift';
import { BigNumber, CreateBigNumber, NormalizeBase } from './BigNumber';

/**
 * https://v8project.blogspot.com/2018/05/bigint.html
 *
 * to test if number if positive including +-0
 * https://stackoverflow.com/questions/7037669/how-to-check-the-value-given-is-a-positive-or-negative-integer
 */

export function CreateBigInteger(): BigInteger {
  return CreateBigNumber<BigInteger>(BigInteger);
}

// let DISCARD_BIG_INTEGER_INIT: boolean = false;
// export function CreateBigInteger(): BigInteger {
//   DISCARD_BIG_INTEGER_INIT = true;
//   const output: BigInteger = new BigInteger();
//   DISCARD_BIG_INTEGER_INIT = false;
//   return output;
// }

export function CreateRandomUint8Array(size: number, max: number): Uint8Array {
  const output: Uint8Array = new Uint8Array(size);
  for (let i = 0; i < size; i++)  {
    output[i] = Math.random() * max;
  }
  return output;
}




/**
 * OTHER
 */


// WARN Experimental
export function CastToUintArray(fnc: (buffer: Uint8Array, ...args: any[]) => number): (buffer: Uint8Array, ...args: any[]) => Uint8Array {
  return function(...args: any[]) {
    return args[0].subarray(0, fnc.apply(fnc, args));
  };
}

// WARN Experimental
export function AutoBuffer(
  bufferCreate: (...args: any[]) => Uint8Array,
  fnc: (buffer: Uint8Array, ...args: any[]) => Uint8Array
): (...args: any[]) => Uint8Array {
  return function(...args: any[]) {
    return fnc.apply(fnc, [bufferCreate.apply(bufferCreate, args), args]);
  };
}


function DifferentBaseError(base_0: number, base_1: number): Error {
  return new Error(`Numbers must have the same base: ${base_0} !== ${base_1}`);
}



export class BigInteger extends BigNumber {

  /**
   * Converts a number to a BigInteger
   * @param {number} input
   * @param {number} base
   * @return {BigInteger}
   */
  static fromNumber(input: number, base?: number): BigInteger {
    const output: BigInteger = CreateBigInteger();

    output._negative = input < 0;
    output._base = (base === void 0) ? 10 : NormalizeBase(base);

    input = Math.floor(Math.abs(input)); // cast input to unsigned integer
    output._digits = NumberToDigits(
      new Uint8Array(NumberSize(input, output._base)),
      input,
      output._base
    );

    return output;
  }

  /**
   * Converts a string to a BigInteger
   * @param {string} input
   * @param {number} base
   * @param {{[p: string]: number}} charToNumber
   * @return {BigInteger}
   */
  static fromString(input: string, base: number = 10, charToNumber?: { [key: string]: number }): BigInteger {
    const output: BigInteger = CreateBigInteger();

    if (input.startsWith('-')) {
      output._negative = true;
      input = input.substring(1);
    } else {
      output._negative = false;
    }

    output._base = NormalizeBase(base);
    output._digits = StringToDigits(new Uint8Array(input.length), input, output._base, charToNumber);

    return output;
  }


  /**
   * Creates a BigInteger filled with random numbers
   * @param {number} size
   * @param {number} base
   * @return {BigInteger}
   */
  static random(size: number, base: number = 10): BigInteger {
    const output: BigInteger = CreateBigInteger();

    output._negative = false;
    output._base = NormalizeBase(base);
    output._digits = new Uint8Array(size);

    for (let i = 0; i < size; i++)  {
      output._digits[i] = Math.random() * output._base;
    }

    return output;
  }



  protected static Clone(output: BigInteger, input: BigInteger, shallow: boolean = false): BigInteger {
    if (input !== output) { // for better performances
      output._negative = input._negative;
      output._base = input._base;
      output._digits = shallow ? input._digits.subarray(0) : input._digits.slice();
    }
    return output;
  }

  protected static Shift(output: BigInteger, input: BigInteger, shift: number): BigInteger {
    output._negative = input._negative;
    output._base = input._base;
    output._digits = $ShiftDigits(input._digits, shift); // TODO may optimize if input === output ?
    return output;
  }

  protected static Negate(output: BigInteger, input: BigInteger, shallow: boolean = false): BigInteger {
    output._negative = !input._negative;
    if (input !== output) { // for better performances
      output._base = input._base;
      output._digits = shallow ? input._digits.subarray(0) : input._digits.slice();
    }
    return output;
  }

  protected static Add2BigInteger(output: BigInteger, a: BigInteger, b: BigInteger): BigInteger {
    output._base = a._base;

    if (a._negative === b._negative) { // same sign: +, + or -, -
      output._digits = Add2Digits(new Uint8Array(Add2DigitsBufferSafeSize(a._digits, b._digits)), a._digits, b._digits, a._base);
      output._negative = a._negative;
    } else { // different sign: +, - or -, +
      if (DigitsLower(a._digits, b._digits)) { // |a| < |b| => |b| - |a|
        output._digits = Sub2DigitsOrdered(new Uint8Array(Sub2DigitsBufferSafeSize(b._digits, a._digits)), b._digits, a._digits, a._base);
        output._negative = b._negative; // or !a._negative
      } else { // |a| >= |b| => |a| - |b|
        output._digits = Sub2DigitsOrdered(new Uint8Array(Sub2DigitsBufferSafeSize(a._digits, b._digits)), a._digits, b._digits, a._base);
        output._negative = a._negative;
      }
    }

    return output;
  }

  protected static Sub2BigInteger(output: BigInteger, a: BigInteger, b: BigInteger): BigInteger {
    output._base = a._base;

    if (a._negative === b._negative) { // same sign: +, + or -, -
      if (DigitsLower(a._digits, b._digits)) { // |a| < |b| => |b| - |a|
        output._digits = Sub2DigitsOrdered(new Uint8Array(Sub2DigitsBufferSafeSize(b._digits, a._digits)), b._digits, a._digits, a._base);
        output._negative = !a._negative;
      } else { // |a| >= |b| => |a| - |b|
        output._digits = Sub2DigitsOrdered(new Uint8Array(Sub2DigitsBufferSafeSize(a._digits, b._digits)), a._digits, b._digits, a._base);
        output._negative = a._negative;
      }
    } else { // different sign: +, - or -, +
      output._digits = Add2Digits(new Uint8Array(Add2DigitsBufferSafeSize(a._digits, b._digits)), a._digits, b._digits, a._base);
      output._negative = a._negative;
    }

    return output;
  }

  protected static Mul2BigInteger(output: BigInteger, a: BigInteger, b: BigInteger): BigInteger {
    output._base = a._base;

    output._digits = Mul2Digits(new Uint8Array(Mul2DigitsBufferSafeSize(a._digits, b._digits)), a._digits, b._digits, a._base);
    output._negative = (a._negative !== b._negative);

    return output;
  }

  protected static Div2BigInteger(output: BigInteger, a: BigInteger, b: BigInteger): BigInteger {
    output._base = a._base;

    output._digits = Div2Digits(
      new Uint8Array(Div2DigitsQuotientBufferSafeSize(a._digits)),
      new Uint8Array(Div2DigitsRemainderBufferSafeSize(a._digits)),
      a._digits,
      b._digits,
      a._base
    )[0];

    output._negative = (a._negative !== b._negative);

    return output;
  }

  protected static Mod2BigInteger(output: BigInteger, a: BigInteger, b: BigInteger): BigInteger {
    output._base = a._base;

    output._digits = Div2Digits(
      new Uint8Array(Div2DigitsQuotientBufferSafeSize(a._digits)),
      new Uint8Array(Div2DigitsRemainderBufferSafeSize(a._digits)),
      a._digits,
      b._digits,
      a._base
    )[1];

    output._negative = a._negative;

    return output;
  }


  protected static ToBase(output: BigInteger, input: BigInteger, base: number): BigInteger {
    output._base = NormalizeBase(base);

    if (output._base === input._base) {
      output._digits = input._digits.slice();
    } else {
      output._digits = $ChangeBaseOfDigits(
        input._digits,
        input._base,
        output._base,
      );
    }

    output._negative = input._negative;

    return output;
  }


  constructor(digits?: Uint8Array, negative?: boolean, base?: number) {
    super(digits, negative, base);
  }

  get sign(): number {
    const a: number = (this.isNull() ? 0 : 1);
    return this._negative ? -a : a;
  }


  clone(): BigInteger {
    return BigInteger.Clone(CreateBigInteger(), this);
  }

  shift(value: number): BigInteger {
    return BigInteger.Shift(CreateBigInteger(), this, value);
  }


  /**
   * COMPARISION
   */

  isNull(): boolean {
    return DigitsNull(this._digits);
  }

  compare(input: BigInteger): number {
    if (this.isNull() && input.isNull()) {
      return 0;
    } else {
      if (this._negative) {
        if (input._negative) { // -, -
          return -DigitsCompare(this._digits, input._digits);
        } else { // -, +
          return -1;
        }
      } else {
        if (input._negative) { // +, -
          return 1;
        } else { // +, +
          return DigitsCompare(this._digits, input._digits);
        }
      }
    }
  }

  equals(input: BigInteger): boolean {
    return (this.isNull() && input.isNull())
      || ((this._negative === input._negative) && DigitsEqual(this._digits, input._digits));
  }

  greaterThan(input: BigInteger): boolean {
    return this.compare(input) === 1;
  }

  lowerThan(input: BigInteger): boolean {
    return this.compare(input) === -1;
  }

  greaterThanOrEquals(input: BigInteger): boolean {
    return this.compare(input) !== -1;
  }

  lowerThanOrEquals(input: BigInteger): boolean {
    return this.compare(input) !== 1;
  }


  /**
   * ARITHMETIC
   */

  add(input: BigInteger): BigInteger {
    if (this._base === input._base) {
      return BigInteger.Add2BigInteger(CreateBigInteger(), this, input);
    } else {
      throw DifferentBaseError(this._base, input._base);
    }
  }

  subtract(input: BigInteger): BigInteger {
    if (this._base === input._base) {
      return BigInteger.Sub2BigInteger(CreateBigInteger(), this, input);
    } else {
      throw DifferentBaseError(this._base, input._base);
    }
  }

  multiply(input: BigInteger): BigInteger {
    if (this._base === input._base) {
      return BigInteger.Mul2BigInteger(CreateBigInteger(), this, input);
    } else {
      throw DifferentBaseError(this._base, input._base);
    }
  }

  divide(input: BigInteger): BigInteger {
    if (this._base === input._base) {
      return BigInteger.Div2BigInteger(CreateBigInteger(), this, input);
    } else {
      throw DifferentBaseError(this._base, input._base);
    }
  }

  remainder(input: BigInteger): BigInteger {
    if (this._base === input._base) {
      return BigInteger.Mod2BigInteger(CreateBigInteger(), this, input);
    } else {
      throw DifferentBaseError(this._base, input._base);
    }
  }


  negate(): BigInteger {
    return BigInteger.Negate(CreateBigInteger(), this);
  }

  // TODO
  // pow(): BigInteger {
  //   return BigInteger.Negate(CreateBigInteger(), this);
  // }

  /**
   * CONVERSION
   */

  toBase(base: number): BigInteger {
    return BigInteger.ToBase(CreateBigInteger(), this, base);
  }

  toNumber(): number {
    return this._negative
      ? -DigitsToNumberOverflow(this._digits, this._base)
      : DigitsToNumberOverflow(this._digits, this._base);
  }

  toString(numberToCharMap?: TNumberToCharMap): string {
    return this._negative
      ? '-' + DigitsToString(this._digits, numberToChar)
      : DigitsToString(this._digits, numberToChar);
  }


  /**
   * SYMBOLS
   */

  get [Symbol.toStringTag]() {
    return 'BigInteger';
  }
}

