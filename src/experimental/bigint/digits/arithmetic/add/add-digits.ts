import { GetNumberToDigitsMinLength } from '../../conversion/get-number-to-digits-min-length';

/**
 * Returns a compliant size for AddDigits
 */
export function GetAddDigitsBufferSafeSize(inputs: Uint8Array[], base: number): number {
  const length: number = inputs.length;
  let _length: number = 0;
  for (let i = 0; i < length; i++) {
    _length = Math.max(_length, inputs[i].length);
  }

  return _length + GetNumberToDigitsMinLength(length, base);
}

/**
 * Adds many digits together
 */
export function AddDigits(
  buffer: Uint8Array,
  inputs: Uint8Array[],
  base: number,
): Uint8Array {
  let number: number = 0;
  let index: number = 0;
  const inputsCount: number = inputs.length;
  const lengths: Uint32Array = new Uint32Array(inputsCount);
  let maxLength: number = 0;

  for (let i = 0; i < inputsCount; i++) {
    const length: number = inputs[i].length;
    lengths[i] = length;
    if (length > maxLength) {
      maxLength = length;
    }
  }

  do {
    for (let i = 0; i < inputsCount; i++) {
      if (index < lengths[i]) {
        number += inputs[i][index];
      }
    }
    buffer[index++] = number % base;
    number = Math.floor(number / base);
  } while (index < maxLength);

  while (number !== 0) {
    buffer[index++] = number % base;
    number = Math.floor(number / base);
  }

  return buffer.subarray(0, index);
}
