import { DigitsLowerThanOrEqual } from '../../comparision/digits-lower-than-or-equal';
import { SubtractTwoDigitsOrdered } from '../subtract/subtract-two-digits';
import { RemoveDigitsLeadingZeroes } from '../../others/remove-digits-leading-zeroes';
import { IQuotientAndRemainder } from '../../../types';

export function DivideTwoDigitsQuotientBufferSafeSize(numerator: Uint8Array): number {
  return numerator.length;
}

export function DivideTwoDigitsRemainderBufferSafeSize(numerator: Uint8Array): number {
  return numerator.length;
}

/**
 * Divides two digits.
 *   https://en.wikipedia.org/wiki/Division_algorithm
 * ~O(N**2)
 */
// https://en.wikipedia.org/wiki/Division_algorithm
export function DivideTwoDigits(
  quotientBuffer: Uint8Array,
  remainderBuffer: Uint8Array,
  numerator: Uint8Array,
  denominator: Uint8Array,
  base: number
): IQuotientAndRemainder<Uint8Array, Uint8Array> {
  const length_a: number = numerator.length;
  let quotientBufferLengthMinusOne: number = quotientBuffer.length - 1;
  let i: number = quotientBufferLengthMinusOne;

  let remainder: Uint8Array;
  let remainderBufferIndex: number = remainderBuffer.length - 1;

  for (let j = length_a - 1; j >= 0; j--) {
    remainderBuffer[remainderBufferIndex--] = numerator[j];
    remainder = remainderBuffer.subarray(remainderBufferIndex + 1);

    // console.log('remainder', remainder);

    let k: number = 0;
    while (DigitsLowerThanOrEqual(denominator, remainder)) {
      SubtractTwoDigitsOrdered(remainder, remainder, denominator, base);
      k++;
    }

    if (k === 0) {
      if (i < quotientBufferLengthMinusOne) {
        quotientBuffer[i--] = 0;
      }
    } else {
      quotientBuffer[i--] = k;
    }

    // console.log('k', k, 'r', remainder, denominator);
  }

  return {
    quotient: quotientBuffer.subarray(i + 1),
    remainder: RemoveDigitsLeadingZeroes(remainderBuffer.subarray(remainderBufferIndex + 1))
  };
}
