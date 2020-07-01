import { TFloatDigits } from './BigFloat';
import { DigitsNull } from './DigitsComparision';



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
export function FloatDigitsCompare( // TODO
  [a_digits, a_shift]: TFloatDigits,
  [b_digits, b_shift]: TFloatDigits,
): number {
  let i: number = 0;
  const a_length: number = a_digits.length;
  const b_length: number = b_digits.length;
  const min_shift: number = Math.min(a_shift, b_shift);
  const a_start: number = a_shift - min_shift;
  const a_end: number = a_start + a_length;
  const b_start: number = b_shift - min_shift;
  const b_end: number = b_start + b_length;
  const end: number = Math.min(a_end, b_end);

  // if (b_shift > a_shift) {
  //   const _end: number = Math.min(a_length, b_start);
  //   for (; i < _end; i++) {
  //     if (a_digits[i] !== 0) {
  //       return false;
  //     }
  //   }
  //   i = b_start;
  // } else {
  //   const _end: number = Math.min(b_length, a_start);
  //   for (; i < _end; i++) {
  //     if (b_digits[i] !== 0) {
  //       return false;
  //     }
  //   }
  //   i = a_start;
  // }

  // const length_a: number = a.length;
  // const length_b: number = b.length;
  //
  // let i: number;
  //
  // if (length_a > length_b) {
  //   i = length_a - 1;
  //   for (; i >= length_b; i--) {
  //     if (a[i] !== 0) {
  //       return 1;
  //     }
  //   }
  // } else {
  //   i = length_b - 1;
  //   for (; i >= length_a; i--) {
  //     if (b[i] !== 0) {
  //       return -1;
  //     }
  //   }
  // }
  //
  // for (; i >= 0; i--) {
  //   if (a[i] > b[i]) {
  //     return 1;
  //   } else if (a[i] < b[i]) {
  //     return -1;
  //   }
  // }

  return 0;
}


/**
 * a === b ?
 * equiv of : FloatDigitsCompare(a, b) === 0
 * @param {TFloatDigits} a
 * @param {TFloatDigits} b
 * @return {boolean}
 * @constructor
 */
export function FloatDigitsEqual(
  [a_digits, a_shift]: TFloatDigits,
  [b_digits, b_shift]: TFloatDigits,
): boolean {
  let i: number = 0;
  const a_length: number = a_digits.length;
  const b_length: number = b_digits.length;
  const min_shift: number = Math.min(a_shift, b_shift);
  const a_start: number = a_shift - min_shift;
  const a_end: number = a_start + a_length;
  const b_start: number = b_shift - min_shift;
  const b_end: number = b_start + b_length;
  const end: number = Math.min(a_end, b_end);

  if (b_shift > a_shift) {
    const _end: number = Math.min(a_length, b_start);
    for (; i < _end; i++) {
      if (a_digits[i] !== 0) {
        return false;
      }
    }
    i = b_start;
  } else {
    const _end: number = Math.min(b_length, a_start);
    for (; i < _end; i++) {
      if (b_digits[i] !== 0) {
        return false;
      }
    }
    i = a_start;
  }


  for (; i < end; i++) {
    if (a_digits[i - a_start] !== b_digits[i - b_start]) {
      return false;
    }
  }

  for (; i < a_end; i++) {
    if (a_digits[i - a_start] !== 0) {
      return false;
    }
  }

  for (; i < b_end; i++) {
    if (b_digits[i - b_start] !== 0) {
      return false;
    }
  }

  return true;
}



/***
 * input === 0 ?
 * @param {TFloatDigits} input
 * @return {boolean}
 * @constructor
 */
export function FloatDigitsNull([digits]: TFloatDigits): boolean {
  return DigitsNull(digits);
}

