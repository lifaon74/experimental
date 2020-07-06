/**
 * Returns a compliant size for Multiply2Digits
 */
export function GetMultiplyTwoDigitsBufferSafeSize(a: Uint8Array, b: Uint8Array): number {
  return (a.length + b.length);
}

/**
 * Multiplies two digits.
 *   limit => max digits of b = uint32 / base. Ex: (2**32) / 10
 *   https://en.wikipedia.org/wiki/Multiplication_algorithm
 * O(length_a * length_b)
 */
export function MultiplyTwoDigits(
  buffer: Uint8Array,
  a: Uint8Array,
  b: Uint8Array,
  base: number
): Uint8Array {
  // limits => max digits of b = uint32 / base. Ex: (2**32) / 10 = 429496729
  const length_a: number = a.length;
  const length_b: number = b.length;
  const length: number = length_a + length_b - 1;
  let i: number = 0;

  if (length > 0) {
    const _buffer: Uint32Array = new Uint32Array(length); // contains the additions of all the lines

    for (let index_b = 0; index_b < length_b; index_b++) { // for each digits in b
      const value_b: number = b[index_b];
      for (let index_a = 0; index_a < length_a; index_a++) { // for each digits in a
        _buffer[index_a + index_b] += (value_b * a[index_a]);
      }
    }

    let number: number = 0;
    while (i < length) {
      number += _buffer[i];
      buffer[i++] = number % base;
      number = Math.floor(number / base);
    }

    if (number !== 0) {
      buffer[i++] = number;
    }
  }

  return buffer.subarray(0, i);
}
