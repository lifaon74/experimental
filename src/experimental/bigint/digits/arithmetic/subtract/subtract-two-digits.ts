import { DigitsLowerThan } from '../../comparision/digits-lower-than';


/**
 * Returns a compliant size for SubtractTwoDigits
 *
 */
export function GetSubtractTwoDigitsBufferSafeSize(a: Uint8Array, b: Uint8Array): number {
  return Math.max(a.length, b.length);
}

/**
 * Subtracts two digits
 */
export function SubtractTwoDigits(
  buffer: Uint8Array,
  a: Uint8Array,
  b: Uint8Array,
  base: number,
): [Uint8Array, boolean] {
  return DigitsLowerThan(a, b)
    ? [SubtractTwoDigitsOrdered(buffer, b, a, base), true]
    : [SubtractTwoDigitsOrdered(buffer, a, b, base), false];
}

/**
 * Subtracts two digits where a >= b
 * INFO: expects a >= b
 */
export function SubtractTwoDigitsOrdered(
  buffer: Uint8Array,
  a: Uint8Array,
  b: Uint8Array,
  base: number,
): Uint8Array {
  let number: number = 0;

  const length_a: number = a.length;
  const length_b: number = b.length;

  let i: number = 0;

  for (; i < length_b; i++) {
    number += a[i] - b[i];
    if (number < 0) {
      buffer[i] = number + base;
      number = -1;
    } else {
      buffer[i] = number;
      number = 0;
    }
  }

  for (; i < length_a; i++) {
    number += a[i];
    if (number < 0) {
      buffer[i] = number + base;
      number = -1;
    } else {
      buffer[i] = number;
      number = 0;
    }
  }

  return buffer.subarray(0, i);
}
