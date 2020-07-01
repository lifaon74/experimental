/**
 * a === b ?
 * equiv of : DigitsCompare(a, b) === 0
 */
export function DigitsEqual(a: Uint8Array, b: Uint8Array): boolean {
  const length_a: number = a.length;
  const length_b: number = b.length;
  const minLength: number = Math.min(length_a, length_b);

  let i: number = 0;
  for (; i < minLength; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  for (; i < length_a; i++) {
    if (a[i] !== 0) {
      return false;
    }
  }

  for (; i < length_b; i++) {
    if (b[i] !== 0) {
      return false;
    }
  }

  return true;
}
