import { IBigNumber } from '../big-number/interfaces';
import { IBigInteger, IBigIntegerConstructor} from './interfaces';
import { ConstructUninitializedBigNumber } from '../big-number/constructor';
import { ConstructBigInteger } from './constructor';
import { BIG_NUMBER_PRIVATE, IBigNumberPrivate } from '../big-number/privates';
import { IBigIntegerInternal } from './privates';
import { GetNumberToDigitsMinLength } from '../digits/conversion/get-number-to-digits-min-length';
import { TCharToNumberMap, TNumberToCharMap } from '../digits/conversion/constants';
import { NormalizeBase } from '../big-number/functions';
import { NumberToDigits } from '../digits/conversion/number-to-digits';
import { BigNumber } from '../big-number/implementation';
import { StringToDigits } from '../digits/conversion/string-to-digits';
import { DigitsNull } from '../digits/comparision/digits-null';
import { DigitsCompare } from '../digits/comparision/digits-compare';
import { DigitsEqual } from '../digits/comparision/digits-equal';
import { GetSubtractTwoDigitsBufferSafeSize, SubtractTwoDigitsOrdered } from '../digits/arithmetic/subtract/subtract-two-digits';
import { AddTwoDigits, GetAddTwoDigitsBufferSafeSize } from '../digits/arithmetic/add/add-two-digits';
import { DigitsLowerThan } from '../digits/comparision/digits-lower-than';
import { GetMultiplyTwoDigitsBufferSafeSize, MultiplyTwoDigits } from '../digits/arithmetic/multiply/multiply-two-digits';
import { IQuotientAndRemainder } from '../types';
import { DivideTwoDigits, DivideTwoDigitsQuotientBufferSafeSize, DivideTwoDigitsRemainderBufferSafeSize } from '../digits/arithmetic/divide/divide-two-digits';
import { DigitsToSafeInteger } from '../digits/conversion/digits-to-number';
import { DigitsToString } from '../digits/conversion/digits-to-string';
import { ChangeBaseOfDigitsWithAutoBuffer } from '../digits/base/change-base-of-digits';

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

export function BigIntegerStaticRandom(
  ctor: IBigIntegerConstructor,
  size: number,
  base: number = 10
): IBigInteger {
  const output: IBigInteger = ConstructUninitializedBigInteger();
  const privatesOutput: IBigNumberPrivate = (output as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];

  privatesOutput.negative = false;
  privatesOutput.base = NormalizeBase(base);
  privatesOutput.digits = new Uint8Array(size);

  for (let i = 0; i < size; i++) {
    privatesOutput.digits[i] = Math.random() * privatesOutput.base;
  }

  return output;
}


/* GETTERS/SETTERS */

export function BigIntegerGetSign(instance: IBigInteger): number {
  const a: number = (BigIntegerIsNull(instance) ? 0 : 1);
  return (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE].negative ? -a : a;
}

/* METHODS */

export function BigIntegerClone(instance: IBigInteger): IBigInteger {
  return CloneBigInteger(ConstructUninitializedBigInteger(), instance);
}

function CloneBigInteger(output: IBigInteger, input: IBigInteger, shallow: boolean = false): IBigInteger {
  if (input !== output) { // for better performances
    const privatesOutput: IBigNumberPrivate = (output as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
    const privatesInput: IBigNumberPrivate = (input as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
    privatesOutput.negative = privatesInput.negative;
    privatesOutput.base = privatesInput.base;
    privatesOutput.digits = shallow
      ? privatesInput.digits.subarray(0)
      : privatesInput.digits.slice();
  }
  return output;
}

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

function AddTwoBigIntegers(output: IBigInteger, a: IBigInteger, b: IBigInteger): IBigInteger {
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

function SubtractTwoBigInteger(output: IBigInteger, a: IBigInteger, b: IBigInteger): IBigInteger {
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


export function BigIntegerMultiply(instance: IBigInteger, input: IBigInteger): IBigInteger {
  const instanceBase: number = (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE].base;
  const inputBase: number = (input as IBigIntegerInternal)[BIG_NUMBER_PRIVATE].base;

  if (instanceBase === inputBase) {
    return MultiplyTwoBigInteger(ConstructUninitializedBigInteger(), instance, input);
  } else {
    throw CreateDifferentBaseError(instanceBase, inputBase);
  }
}

function MultiplyTwoBigInteger(output: IBigInteger, a: IBigInteger, b: IBigInteger): IBigInteger {
  const privatesOutput: IBigNumberPrivate = (output as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesA: IBigNumberPrivate = (a as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesB: IBigNumberPrivate = (b as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];

  privatesOutput.base = privatesA.base;

  privatesOutput.digits = MultiplyTwoDigits(
    new Uint8Array(GetMultiplyTwoDigitsBufferSafeSize(privatesA.digits, privatesB.digits)),
    privatesA.digits,
    privatesB.digits,
    privatesA.base,
  );
  privatesOutput.negative = (privatesA.negative !== privatesB.negative);

  return output;
}


export function BigIntegerDivideWithRemainder(instance: IBigInteger, input: IBigInteger): IQuotientAndRemainder<IBigInteger, IBigInteger> {
  const instanceBase: number = (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE].base;
  const inputBase: number = (input as IBigIntegerInternal)[BIG_NUMBER_PRIVATE].base;

  if (instanceBase === inputBase) {
    return DivideTwoBigIntegerWithRemainder(
      ConstructUninitializedBigInteger(),
      ConstructUninitializedBigInteger(),
      instance,
      input,
    );
  } else {
    throw CreateDifferentBaseError(instanceBase, inputBase);
  }
}

function DivideTwoBigIntegerWithRemainder(
  outputQuotient: IBigInteger,
  outputRemainder: IBigInteger,
  a: IBigInteger,
  b: IBigInteger,
): IQuotientAndRemainder<IBigInteger, IBigInteger> {
  const privatesOutputQuotient: IBigNumberPrivate = (outputQuotient as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesOutputRemainder: IBigNumberPrivate = (outputRemainder as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesA: IBigNumberPrivate = (a as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesB: IBigNumberPrivate = (b as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];

  privatesOutputQuotient.base = privatesA.base;
  privatesOutputRemainder.base = privatesA.base;

  const quotientAndRemainder: IQuotientAndRemainder<Uint8Array, Uint8Array> = DivideTwoDigits(
    new Uint8Array(DivideTwoDigitsQuotientBufferSafeSize(privatesA.digits)),
    new Uint8Array(DivideTwoDigitsRemainderBufferSafeSize(privatesA.digits)),
    privatesA.digits,
    privatesB.digits,
    privatesA.base
  );

  privatesOutputQuotient.digits = quotientAndRemainder.quotient;
  privatesOutputRemainder.digits = quotientAndRemainder.remainder;

  privatesOutputQuotient.negative = (privatesA.negative !== privatesB.negative);
  privatesOutputRemainder.negative = privatesA.negative;

  return {
    quotient: outputQuotient,
    remainder: outputRemainder,
  };
}


export function BigIntegerNegate(instance: IBigInteger): IBigInteger {
  return NegateBigInteger(ConstructUninitializedBigInteger(), instance);
}

function NegateBigInteger(output: IBigInteger, input: IBigInteger, shallow: boolean = false): IBigInteger {
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


  // CONVERSION

export function BigIntegerToBase(instance: IBigInteger, base: number): IBigInteger {
  return ChangeBaseOfNegateBigInteger(ConstructUninitializedBigInteger(), instance, base);
}

function ChangeBaseOfNegateBigInteger(output: IBigInteger, input: IBigInteger, base: number): IBigInteger {
  const privatesOutput: IBigNumberPrivate = (output as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  const privatesInput: IBigNumberPrivate = (input as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  privatesOutput.base = NormalizeBase(base);

  if (privatesOutput.base === privatesInput.base) {
    privatesOutput.digits = privatesInput.digits.slice();
  } else {
    privatesOutput.digits = ChangeBaseOfDigitsWithAutoBuffer(
      privatesInput.digits,
      privatesInput.base,
      privatesOutput.base,
    );
  }

  privatesOutput.negative = privatesInput.negative;

  return output;
}


export function BigIntegerToNumber(instance: IBigInteger): number {
  const privates: IBigNumberPrivate = (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  return privates.negative
    ? -DigitsToSafeInteger(privates.digits, privates.base)
    : DigitsToSafeInteger(privates.digits, privates.base);
}

export function BigIntegerToString(instance: IBigInteger, numberToCharMap?: TNumberToCharMap): string {
  const privates: IBigNumberPrivate = (instance as IBigIntegerInternal)[BIG_NUMBER_PRIVATE];
  return privates.negative
    ? '-' + DigitsToString(privates.digits, numberToCharMap)
    : DigitsToString(privates.digits, numberToCharMap);
}



/** CLASS **/


export class BigInteger extends BigNumber implements IBigNumber {

  static fromNumber(input: number, base?: number): IBigInteger {
    return BigIntegerStaticFromNumber(this, input, base);
  }


  static fromString(input: string, base?: number, charToNumber?: TCharToNumberMap): IBigInteger {
    return BigIntegerStaticFromString(this, input, base, charToNumber);
  }

  static random(size: number, base?: number): IBigInteger {
    return BigIntegerStaticRandom(this, size, base);
  }

  // protected static Shift(output: IBigInteger, input: IBigInteger, shift: number): IBigInteger {
  //   privatesOutput.negative = privatesInput.negative;
  //   privatesOutput.base = privatesInput.base;
  //   privatesOutput.digits = $ShiftDigits(privatesInput.digits, shift); // TODO may optimize if input === output ?
  //   return output;
  // }


  constructor(digits?: Uint8Array, negative?: boolean, base?: number) {
    super(digits, negative, base);
    ConstructBigInteger(this);
  }

  get sign(): number {
    return BigIntegerGetSign(this);
  }

  clone(): IBigInteger {
    return BigIntegerClone(this);
  }

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

  multiply(input: IBigInteger): IBigInteger {
    return BigIntegerMultiply(this, input);
  }

  divideWithRemainder(input: IBigInteger): IQuotientAndRemainder<IBigInteger, IBigInteger> {
    return BigIntegerDivideWithRemainder(this, input);
  }


  negate(): IBigInteger {
    return BigIntegerNegate(this);
  }


  /**
   * CONVERSION
   */

  toBase(base: number): IBigInteger {
    return BigIntegerToBase(this, base);
  }

  toNumber(): number {
    return BigIntegerToNumber(this);
  }

  toString(numberToCharMap?: TNumberToCharMap): string {
    return BigIntegerToString(this);
  }


  /**
   * SYMBOLS
   */

  get [Symbol.toStringTag]() {
    return 'BigInteger';
  }
}
