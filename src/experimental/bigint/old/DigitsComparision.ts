/**
 * Compares 2 digits:
 *  - a > b = 1
 *  - a < b = -1
 *  - a === b = 0
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @return {number}
 * @constructor
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

/**
 * a === b ?
 * equiv of : DigitsCompare(a, b) === 0
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @return {boolean}
 * @constructor
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

/**
 * a > b ?
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @return {boolean}
 * @constructor
 */
export function DigitsGreater(a: Uint8Array, b: Uint8Array): boolean {
  return DigitsCompare(a, b) === 1;
}

/**
 * a < b ?
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @return {boolean}
 * @constructor
 */
export function DigitsLower(a: Uint8Array, b: Uint8Array): boolean {
  return DigitsCompare(a, b) === -1;
}

/**
 * a >= b ?
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @return {boolean}
 * @constructor
 */
export function DigitsGreaterOrEqual(a: Uint8Array, b: Uint8Array): boolean {
  return DigitsCompare(a, b) !== -1; // !DigitsLower(a, b);
}

/**
 * a <= b ?
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @return {boolean}
 * @constructor
 */
export function DigitsLowerOrEqual(a: Uint8Array, b: Uint8Array): boolean {
  return DigitsCompare(a, b) !== 1; // !DigitsGreater(a, b);
}

/***
 * input === 0 ?
 * @param {Uint8Array} input
 * @return {boolean}
 * @constructor
 */
export function DigitsNull(input: Uint8Array): boolean {
  for (let i = 0, l = input.length; i < l; i++) {
    if (input[i] !== 0) {
      return false;
    }
  }
  return true;
}
