import { IBigNumber } from '../big-number/interfaces';
import { IBigInteger, IBigIntegerConstructor} from './interfaces';
import { ConstructUninitializedBigNumber } from '../big-number/constructor';
import { ConstructBigInteger } from './constructor';
import { BIG_NUMBER_PRIVATE, IBigNumberInternal, IBigNumberPrivate } from '../big-number/privates';
import { IBigIntegerInternal } from './privates';
import { GetNumberToDigitsMinLength } from '../digits/conversion/get-number-to-digits-min-length';
import { TCharToNumberMap } from '../digits/conversion/constants';
import { NormalizeBase } from '../big-number/functions';
import { NumberToDigits } from '../digits/conversion/number-to-digits';
import { BigNumber } from '../big-number/implementation';
import { StringToDigits } from '../digits/conversion/string-to-digits';
import { DigitsNull } from '../digits/comparision/digits-null';
import { DigitsCompare } from '../digits/comparision/digits-compare';
import { DigitsEqual } from '../digits/comparision/digits-equal';
import { CreateBigInteger } from '../old/BigInteger';
import { DigitsToNumberOverflow } from '../old/DigitsConversion';
import { GetSubtractTwoDigitsBufferSafeSize, SubtractTwoDigitsOrdered } from '../digits/arithmetic/subtract/subtract-two-digits';
import { AddTwoDigits, GetAddTwoDigitsBufferSafeSize } from '../digits/arithmetic/add/add-two-digits';
import { DigitsLowerThan } from '../digits/comparision/digits-lower-than';

/** FUNCTIONS **/

export function ConstructUninitializedBigInteger(): IBigInteger {
  return ConstructUninitializedBigNumber<IBigInteger>(BigInteger);
}

export function CreateDifferentBaseError(base_0: number, base_1: number): Error {
  return new Error(`Numbers must have the same base: ${base_0} !== ${base_1}`);
}


/** METHODS **/

/* STATIC */

export function BigIntegerStaticFromNumber(
  ctor: IBigIntegerConstructor,
  input: number,
  base?: number,
): IBigInteger {
  const instance: IBigInteger = ConstructUninitializedBigInteger();
  const privates: IBigNumberPrivate = (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];

  privates.negative = input < 0;
  privates.base = (base === void 0) ? 10 : NormalizeBase(base);

  input = Math.floor(Math.abs(input)); // cast input to unsigned integer
  privates.digits = NumberToDigits(
    new Uint8Array(GetNumberToDigitsMinLength(input, privates.base)),
    input,
    privates.base
  );

  return instance;
}

export function BigIntegerStaticFromString(
  ctor: IBigIntegerConstructor,
  input: string,
  base: number = 10,
  charToNumber?: TCharToNumberMap,
): IBigInteger {
  const instance: IBigInteger = ConstructUninitializedBigInteger();
  const privates: IBigNumberPrivate = (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];

  if (input.startsWith('-')) {
    privates.negative = true;
    input = input.substring(1);
  } else {
    privates.negative = false;
  }

  privates.base = NormalizeBase(base);
  privates.digits = StringToDigits(new Uint8Array(input.length), input, privates.base, charToNumber);


  return instance;
}


/* GETTERS/SETTERS */

export function BigIntegerGetSign(instance: IBigInteger): number {
  const a: number = (BigIntegerIsNull(instance) ? 0 : 1);
  return (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE].negative ? -a : a;
}

/* METHODS */

  // COMPARISION

export function BigIntegerIsNull(instance: IBigInteger): boolean {
  return DigitsNull((instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE].digits);
}

export function BigIntegerCompare(instance: IBigInteger, input: IBigInteger): number {
  if (BigIntegerIsNull(instance) && BigIntegerIsNull(input)) {
    return 0;
  } else {
    const privatesInstance: IBigNumberPrivate = (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
    const privatesInput: IBigNumberPrivate = (input as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
    if (privatesInstance.negative) {
      if (privatesInput.negative) { // -, -
        return -DigitsCompare(privatesInstance.digits, privatesInput.digits);
      } else { // -, +
        return -1;
      }
    } else {
      if (privatesInput.negative) { // +, -
        return 1;
      } else { // +, +
        return DigitsCompare(privatesInstance.digits, privatesInput.digits);
      }
    }
  }
}

export function BigIntegerEquals(instance: IBigInteger, input: IBigInteger): boolean {
  const privatesInstance: IBigNumberPrivate = (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesInput: IBigNumberPrivate = (input as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  return (BigIntegerIsNull(instance) && BigIntegerIsNull(input))
    || ((privatesInstance.negative === privatesInput.negative) && DigitsEqual(privatesInstance.digits, privatesInput.digits));
}


  // ARITHMETIC

export function BigIntegerAdd(instance: IBigInteger, input: IBigInteger): IBigInteger {
  const instanceBase: number = (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE].base;
  const inputBase: number = (input as IBigIntegerInternal)[BIG_NUMBER_PRIVATE].base;

  if (instanceBase === inputBase) {
    return AddTwoBigIntegers(ConstructUninitializedBigInteger(), instance, input);
  } else {
    throw CreateDifferentBaseError(instanceBase, inputBase);
  }
}

export function AddTwoBigIntegers(output: IBigInteger, a: IBigInteger, b: IBigInteger): IBigInteger {
  const privatesOutput: IBigNumberPrivate = (output as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesA: IBigNumberPrivate = (a as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesB: IBigNumberPrivate = (b as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  
  privatesOutput.base = privatesA.base;

  if (privatesA.negative === privatesB.negative) { // same sign: +, + or -, -
    privatesOutput.digits = AddTwoDigits(new Uint8Array(GetAddTwoDigitsBufferSafeSize(privatesA.digits, privatesB.digits)), privatesA.digits, privatesB.digits, privatesA.base);
    privatesOutput.negative = privatesA.negative;
  } else { // different sign: +, - or -, +
    if (DigitsLowerThan(privatesA.digits, privatesB.digits)) { // |a| < |b| => |b| - |a|
      privatesOutput.digits = SubtractTwoDigitsOrdered(
        new Uint8Array(GetSubtractTwoDigitsBufferSafeSize(privatesB.digits, privatesA.digits)),
        privatesB.digits,
        privatesA.digits,
        privatesA.base
      );
      privatesOutput.negative = privatesB.negative; // or !privatesA.negative
    } else { // |a| >= |b| => |a| - |b|
      privatesOutput.digits = SubtractTwoDigitsOrdered(
        new Uint8Array(GetSubtractTwoDigitsBufferSafeSize(privatesA.digits, privatesB.digits)),
        privatesA.digits,
        privatesB.digits,
        privatesA.base
      );
      privatesOutput.negative = privatesA.negative;
    }
  }

  return output;
}


export function BigIntegerSubtract(instance: IBigInteger, input: IBigInteger): IBigInteger {
  const instanceBase: number = (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE].base;
  const inputBase: number = (input as IBigIntegerInternal)[BIG_NUMBER_PRIVATE].base;
  
  if (instanceBase === inputBase) {
    return SubtractTwoBigInteger(ConstructUninitializedBigInteger(), instance, input);
  } else {
    throw CreateDifferentBaseError(instanceBase, inputBase);
  }
}

export function SubtractTwoBigInteger(output: IBigInteger, a: IBigInteger, b: IBigInteger): IBigInteger {
  const privatesOutput: IBigNumberPrivate = (output as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesA: IBigNumberPrivate = (a as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesB: IBigNumberPrivate = (b as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  
  privatesOutput.base = privatesA.base;

  if (privatesA.negative === privatesB.negative) { // same sign: +, + or -, -
    if (DigitsLowerThan(privatesA.digits, privatesB.digits)) { // |a| < |b| => |b| - |a|
      privatesOutput.digits = SubtractTwoDigitsOrdered(
        new Uint8Array(GetSubtractTwoDigitsBufferSafeSize(privatesB.digits, privatesA.digits)),
        privatesB.digits,
        privatesA.digits,
        privatesA.base
      );
      privatesOutput.negative = !privatesA.negative;
    } else { // |a| >= |b| => |a| - |b|
      privatesOutput.digits = SubtractTwoDigitsOrdered(
        new Uint8Array(GetSubtractTwoDigitsBufferSafeSize(privatesA.digits, privatesB.digits)),
        privatesA.digits,
        privatesB.digits,
        privatesA.base
      );
      privatesOutput.negative = privatesA.negative;
    }
  } else { // different sign: +, - or -, +
    privatesOutput.digits = AddTwoDigits(new Uint8Array(GetAddTwoDigitsBufferSafeSize(privatesA.digits, privatesB.digits)), privatesA.digits, privatesB.digits, privatesA.base);
    privatesOutput.negative = privatesA.negative;
  }

  return output;
}


export function BigIntegerNegate(instance: IBigInteger): IBigInteger {
  return NegateBigInteger(ConstructUninitializedBigInteger(), instance);
}

export function NegateBigInteger(output: IBigInteger, input: IBigInteger, shallow: boolean = false): IBigInteger {
  const privatesOutput: IBigNumberPrivate = (output as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesInput: IBigNumberPrivate = (input as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];

  privatesOutput.negative = !privatesInput.negative;
  if (input !== output) { // for better performances
    privatesOutput.base = privatesInput.base;
    privatesOutput.digits = shallow
      ? privatesInput.digits.subarray(0)
      : privatesInput.digits.slice();
  }

  return output;
}


/** CLASS **/


export class BigInteger extends BigNumber implements IBigNumber {


  static fromNumber(input: number, base?: number): IBigInteger {
    return BigIntegerStaticFromNumber(this, input, base);
  }


  static fromString(input: string, base?: number, charToNumber?: TCharToNumberMap): IBigInteger {
    return BigIntegerStaticFromString(this, input, base, charToNumber);
  }

  // /**
  //  * Creates a BigInteger filled with random numbers
  //  * @param {number} size
  //  * @param {number} base
  //  * @return {BigInteger}
  //  */
  // static random(size: number, base: number = 10): IBigInteger {
  //   const output: IBigInteger = CreateBigInteger();
  //
  //   privatesOutput.negative = false;
  //   privatesOutput.base = NormalizeBase(base);
  //   privatesOutput.digits = new Uint8Array(size);
  //
  //   for (let i = 0; i < size; i++)  {
  //     privatesOutput.digits[i] = Math.random() * privatesOutput.base;
  //   }
  //
  //   return output;
  // }
  //
  //
  //
  // protected static Clone(output: IBigInteger, input: IBigInteger, shallow: boolean = false): IBigInteger {
  //   if (input !== output) { // for better performances
  //     privatesOutput.negative = privatesInput.negative;
  //     privatesOutput.base = privatesInput.base;
  //     privatesOutput.digits = shallow ? privatesInput.digits.subarray(0) : privatesInput.digits.slice();
  //   }
  //   return output;
  // }
  //
  // protected static Shift(output: IBigInteger, input: IBigInteger, shift: number): IBigInteger {
  //   privatesOutput.negative = privatesInput.negative;
  //   privatesOutput.base = privatesInput.base;
  //   privatesOutput.digits = $ShiftDigits(privatesInput.digits, shift); // TODO may optimize if input === output ?
  //   return output;
  // }
  //
  // protected static Negate(output: IBigInteger, input: IBigInteger, shallow: boolean = false): IBigInteger {
  //   privatesOutput.negative = !privatesInput.negative;
  //   if (input !== output) { // for better performances
  //     privatesOutput.base = privatesInput.base;
  //     privatesOutput.digits = shallow ? privatesInput.digits.subarray(0) : privatesInput.digits.slice();
  //   }
  //   return output;
  // }
  //
  // protected static Mul2BigInteger(output: IBigInteger, a: IBigInteger, b: IBigInteger): IBigInteger {
  //   privatesOutput.base = privatesA.base;
  //
  //   privatesOutput.digits = Mul2Digits(new Uint8Array(Mul2DigitsBufferSafeSize(privatesA.digits, privatesB.digits)), privatesA.digits, privatesB.digits, privatesA.base);
  //   privatesOutput.negative = (privatesA.negative !== privatesB.negative);
  //
  //   return output;
  // }
  //
  // protected static Div2BigInteger(output: IBigInteger, a: IBigInteger, b: IBigInteger): IBigInteger {
  //   privatesOutput.base = privatesA.base;
  //
  //   privatesOutput.digits = Div2Digits(
  //     new Uint8Array(Div2DigitsQuotientBufferSafeSize(privatesA.digits)),
  //     new Uint8Array(Div2DigitsRemainderBufferSafeSize(privatesA.digits)),
  //     privatesA.digits,
  //     privatesB.digits,
  //     privatesA.base
  //   )[0];
  //
  //   privatesOutput.negative = (privatesA.negative !== privatesB.negative);
  //
  //   return output;
  // }
  //
  // protected static Mod2BigInteger(output: IBigInteger, a: IBigInteger, b: IBigInteger): IBigInteger {
  //   privatesOutput.base = privatesA.base;
  //
  //   privatesOutput.digits = Div2Digits(
  //     new Uint8Array(Div2DigitsQuotientBufferSafeSize(privatesA.digits)),
  //     new Uint8Array(Div2DigitsRemainderBufferSafeSize(privatesA.digits)),
  //     privatesA.digits,
  //     privatesB.digits,
  //     privatesA.base
  //   )[1];
  //
  //   privatesOutput.negative = privatesA.negative;
  //
  //   return output;
  // }
  //
  //
  // protected static ToBase(output: IBigInteger, input: IBigInteger, base: number): IBigInteger {
  //   privatesOutput.base = NormalizeBase(base);
  //
  //   if (privatesOutput.base === privatesInput.base) {
  //     privatesOutput.digits = privatesInput.digits.slice();
  //   } else {
  //     privatesOutput.digits = $ChangeBaseOfDigits(
  //       privatesInput.digits,
  //       privatesInput.base,
  //       privatesOutput.base,
  //     );
  //   }
  //
  //   privatesOutput.negative = privatesInput.negative;
  //
  //   return output;
  // }


  constructor(digits?: Uint8Array, negative?: boolean, base?: number) {
    super(digits, negative, base);
    ConstructBigInteger(this);
  }

  get sign(): number {
    return BigIntegerGetSign(this);
  }


  // clone(): IBigInteger {
  //   return BigInteger.Clone(CreateBigInteger(), this);
  // }
  //
  // shift(value: number): IBigInteger {
  //   return BigInteger.Shift(CreateBigInteger(), this, value);
  // }


  /**
   * COMPARISION
   */

  isNull(): boolean {
    return BigIntegerIsNull(this);
  }

  compare(input: IBigInteger): number {
    return BigIntegerCompare(this, input);
  }

  equals(input: IBigInteger): boolean {
    return BigIntegerEquals(this, input);
  }

  greaterThan(input: IBigInteger): boolean {
    return this.compare(input) === 1;
  }

  lowerThan(input: IBigInteger): boolean {
    return this.compare(input) === -1;
  }

  greaterThanOrEquals(input: IBigInteger): boolean {
    return this.compare(input) !== -1;
  }

  lowerThanOrEquals(input: IBigInteger): boolean {
    return this.compare(input) !== 1;
  }


  /**
   * ARITHMETIC
   */

  add(input: IBigInteger): IBigInteger {
    return BigIntegerAdd(this, input);
  }

  subtract(input: IBigInteger): IBigInteger {
    return BigIntegerSubtract(this, input);
  }

  // TODO continue here

  multiply(input: IBigInteger): IBigInteger {
    if (privates.base === privatesInput.base) {
      return BigInteger.Mul2BigInteger(CreateBigInteger(), this, input);
    } else {
      throw CreateDifferentBaseError(privates.base, privatesInput.base);
    }
  }

  divide(input: IBigInteger): IBigInteger {
    if (privates.base === privatesInput.base) {
      return BigInteger.Div2BigInteger(CreateBigInteger(), this, input);
    } else {
      throw CreateDifferentBaseError(privates.base, privatesInput.base);
    }
  }

  remainder(input: IBigInteger): IBigInteger {
    if (privates.base === privatesInput.base) {
      return BigInteger.Mod2BigInteger(CreateBigInteger(), this, input);
    } else {
      throw CreateDifferentBaseError(privates.base, privatesInput.base);
    }
  }


  negate(): IBigInteger {
    return BigIntegerNegate(this);
  }

  // TODO
  // pow(): IBigInteger {
  //   return BigInteger.Negate(CreateBigInteger(), this);
  // }

  /**
   * CONVERSION
   */

  toBase(base: number): IBigInteger {
    return BigInteger.ToBase(CreateBigInteger(), this, base);
  }

  toNumber(): number {
    return privates.negative
      ? -DigitsToNumberOverflow(privates.digits, privates.base)
      : DigitsToNumberOverflow(privates.digits, privates.base);
  }

  toString(numberToChar?: string[]): string {
    return privates.negative
      ? '-' + DigitsToString(privates.digits, numberToChar)
      : DigitsToString(privates.digits, numberToChar);
  }


  /**
   * SYMBOLS
   */

  get [Symbol.toStringTag]() {
    return 'BigInteger';
  }
}
