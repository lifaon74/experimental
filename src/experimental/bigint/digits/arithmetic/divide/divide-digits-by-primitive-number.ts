import { GetBufferFromInput, NumberSize } from '../../../old/DigitsConversion';
import { IQuotientAndRemainder } from '../../../types';

export function DivideDigitsByPrimitiveNumberBufferSafeSize(
  input: Uint8Array,
  base: number,
  number: number,
): number {
  return Math.max(input.length - NumberSize(number, base) + 1, 0);
}

export function DivideDigitsByPrimitiveNumber(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
): IQuotientAndRemainder<Uint8Array, number> { // [quotient, remainder]
  if (input.length === 0) { // input === 0
    return {
      quotient: buffer.subarray(0, 0),
      remainder: 0,
    };
  } else if (number === 0) {
    throw new RangeError(`Division by zero`);
  } else if (number === 1) {
    return {
      quotient: GetBufferFromInput(buffer, input),
      remainder: 0,
    };
  } else {
    return DivideDigitsByPrimitiveNumberOptimized(buffer, input, base, number);
  }
}

export function DivideDigitsByPrimitiveNumberOptimized(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
): IQuotientAndRemainder<Uint8Array, number> {
  // limits => number must be lower than uint32 / (base + 1). Ex: (2**32) / (10 + 1) = 390451572
  //        => number must be different than 0
  const length: number = input.length;
  let remainder: number = 0;
  let bufferLengthMinusOne: number = buffer.length - 1;
  let i: number = bufferLengthMinusOne;

  for (let j = length - 1; j >= 0; j--) {
    remainder = (remainder * base) + input[j];
    if (remainder >= number) {
      buffer[i--] = Math.floor(remainder / number);
      remainder = remainder % number;
    } else if (i < bufferLengthMinusOne) {
      buffer[i--] = 0;
    }
  }

  return {
    quotient: buffer.subarray(i + 1),
    remainder,
  };
}
