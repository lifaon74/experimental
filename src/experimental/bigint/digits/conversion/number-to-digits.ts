import { NumberSize } from '../../old/DigitsConversion';

/**
 * Converts a number to a list of digits.
 * INFO: Expects number positive and non decimal
 */
export function NumberToDigits(
  buffer: Uint8Array,
  number: number,
  base: number,
): Uint8Array {
  let i: number = 0;
  while (number !== 0) {
    buffer[i++] = number % base;
    number = Math.floor(number / base);
  }
  // do {
  //   buffer[i++] = number % base;
  //   number = Math.floor(number / base);
  // } while (number !== 0);
  return buffer.subarray(0, i);
}

export function NumberToDigitsWithAutoBuffer(
  number: number,
  base: number,
) {
  return NumberToDigits(new Uint8Array(NumberSize(number, base)), number, base);
}
