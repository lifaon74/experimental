import { CopyBufferContent } from '../../others/copy-buffer-content';
import { GetNumberToDigitsMinLength } from '../../conversion/get-number-to-digits-min-length';

/**
 * Returns a safe size for the buffer to provide to AddPrimitiveNumberToDigits
 * INFO: Expects number positive and non decimal
 */
export function GetAddPrimitiveNumberToDigitsBufferSafeSize(
  input: Uint8Array,
  base: number,
  number: number,
): number {
  return Math.max(input.length, GetNumberToDigitsMinLength(number, base)) + 1;
}

/**
 * Adds a primitive number to a list of digits
 * Does extra checks to fasten computation
 * INFO: Expects number positive and non decimal
 */
export function AddPrimitiveNumberToDigits(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
): Uint8Array {
  if (number === 0) {
    return CopyBufferContent(buffer, input);
  } else {
    return AddPrimitiveNumberToDigitsOptimized(
      buffer,
      input,
      base,
      number,
    );
  }
}


/**
 * Adds a primitive number to a list of digits
 * INFO: Expects number positive and non decimal
 * O(length)
 */
export function AddPrimitiveNumberToDigitsOptimized(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
): Uint8Array {
  if (buffer !== input) {
    buffer.set(input);
  }

  const length: number = input.length;
  let i: number = 0;

  for (; i < length; i++) {
    number += input[i];
    buffer[i] = number % base;
    number = Math.floor(number / base);
  }

  while (number !== 0) {
    buffer[i++] = number % base;
    number = Math.floor(number / base);
  }

  return buffer.subarray(0, Math.max(i, length));
}

