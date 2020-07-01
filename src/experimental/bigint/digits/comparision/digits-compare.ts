/**
 * Compares 2 digits:
 *  - a > b = 1
 *  - a < b = -1
 *  - a === b = 0
 */
export function DigitsCompare(a: Uint8Array, b: Uint8Array): number {
  const length_a: number = a.length;
  const length_b: number = b.length;

  let i: number;

  if (length_a > length_b) {
    i = length_a - 1;
    for (; i >= length_b; i--) {
      if (a[i] !== 0) {
        return 1;
      }
    }
  } else {
    i = length_b - 1;
    for (; i >= length_a; i--) {
      if (b[i] !== 0) {
        return -1;
      }
    }
  }

  for (; i >= 0; i--) {
    if (a[i] > b[i]) {
      return 1;
    } else if (a[i] < b[i]) {
      return -1;
    }
  }

  return 0;
}
