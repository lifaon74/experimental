import { GetNumberToDigitsMinLength } from '../../conversion/get-number-to-digits-min-length';
import { CopyBufferContent } from '../../others/copy-buffer-content';

/**
 * Creates compliant buffer for MulDigitsByPrimitiveNumber
 * INFO: Expects number positive and non decimal
 */
export function GetMultiplyDigitsByPrimitiveNumberBufferSafeSize(
  input: Uint8Array,
  base: number,
  number: number,
): number {
  return input.length + GetNumberToDigitsMinLength(number, base);
}

/**
 * Multiplies a digits list by a primitive number.
 * Does extra checks to fasten computation
 * INFO: Expects number positive and non decimal
 */
export function MultiplyDigitsByPrimitiveNumber(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
): Uint8Array {
  const length: number = input.length;
  if ((length === 0) || (number === 0)) {
    return buffer.subarray(0, 0);
  } else if (number === 1) {
    return CopyBufferContent(buffer, input);
    // TODO shift if number equals base
  } else {
    return MultiplyDigitsByPrimitiveNumberOptimized(
      buffer,
      input,
      base,
      number,
      new Uint32Array(length),
    );
  }
}


export function MultiplyDigitsByPrimitiveNumberOptimizedSumBufferSafeSize(input: Uint8Array): number {
  return input.length;
}

export function MultiplyDigitsByPrimitiveNumberOptimizedCreateSumBuffer(input: Uint8Array): Uint32Array {
  return new Uint32Array(input.length);
}

/**
 * Multiplies a digits list by a primitive number
 * Use advanced params.
 * O(length)
 */
export function MultiplyDigitsByPrimitiveNumberOptimized(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
  sumBuffer: Uint32Array,
): Uint8Array {
  const length: number = input.length;
  let i: number = 0;

  for (let j = 0; j < length; j++) {
    sumBuffer[j] = (number * input[j]);
  }

  let _number: number = 0;
  while (i < length) {
    _number += sumBuffer[i];
    buffer[i++] = _number % base;
    _number = Math.floor(_number / base);
  }

  while (_number !== 0) {
    buffer[i++] = _number % base;
    _number = Math.floor(_number / base);
  }

  return buffer.subarray(0, i);
}
