import { TFloatDigits } from './BigFloat';

export function Add2DigitsBufferSafeSize(
  [a_digits, a_shift]: TFloatDigits,
  [b_digits, b_shift]: TFloatDigits,
): number {
  return Math.max(a_digits.length + a_shift, b_digits.length + b_shift) - Math.min(a_shift, b_shift) + 1;
}

export function Add2FloatDigits(
  output: TFloatDigits,
  [a_digits, a_shift]: TFloatDigits,
  [b_digits, b_shift]: TFloatDigits,
  base: number,
): TFloatDigits {
  const buffer: Uint8Array = output[0];
  const min_shift = Math.min(a_shift, b_shift);
  const a_start: number = a_shift - min_shift;
  const a_end: number = a_start + a_digits.length;
  const b_start: number = b_shift - min_shift;
  const b_end: number = b_start + b_digits.length;
  const end: number = Math.max(a_end, b_end);

  let number: number = 0;
  let i: number = 0;
  for (; i < end; i++) {
    if ((a_start <= i) && (i < a_end)) {
      number += a_digits[i - a_start];
    }
    if ((b_start <= i) && (i < b_end)) {
      number += b_digits[i - b_start];
    }
    if (number < base) {
      buffer[i] = number;
      number = 0;
    } else {
      buffer[i] = number - base;
      number = 1;
    }
  }

  if (number !== 0) {
    buffer[i++] = number;
  }

  output[0] = buffer.subarray(0, i);
  output[1] = min_shift;

  return output;
}

// export function Add2FloatDigits2(
//   output: TFloatDigits,
//   [a_digits, a_shift]: TFloatDigits,
//   [b_digits, b_shift]: TFloatDigits,
//   base: number,
// ): TFloatDigits {
//   if (a_shift > b_shift) {
//     [a_digits, b_digits] = [b_digits, a_digits];
//     [a_shift, b_shift] = [b_shift, a_shift];
//   }
//   // at this point, a bellow b
//   const buffer: Uint8Array = output[0];
//   const b_start: number = b_shift - a_shift;
//   if (buffer !== a_digits) {
//     buffer.set(a_digits.subarray(0, b_start)); // Math.min(a.length, b_start)
//   }
//
//   const a_end: number = a_digits.length;
//   const b_end: number = b_start + b_digits.length;
//   const a_b_end: number = Math.min(a_end, b_end);
//
//   let number: number = 0;
//   let i: number = b_start;
//
//   for (; i < a_b_end; i++) {
//     number += a_digits[i] + b_digits[i - b_start];
//     if (number < base) {
//       buffer[i] = number;
//       number = 0;
//     } else {
//       buffer[i] = number - base;
//       number = 1;
//     }
//   }
//
//   for (; i < a_end; i++) {
//     number += a_digits[i];
//     if (number < base) {
//       buffer[i] = number;
//       number = 0;
//     } else {
//       buffer[i] = number - base;
//       number = 1;
//     }
//   }
//
//   for (; i < b_end; i++) {
//     number += b_digits[i - b_start];
//     if (number < base) {
//       buffer[i] = number;
//       number = 0;
//     } else {
//       buffer[i] = number - base;
//       number = 1;
//     }
//   }
//
//   if (number !== 0) {
//     buffer[i++] = number;
//   }
//
//   output[0] = buffer.subarray(0, i);
//   output[1] = a_shift;
//
//   return output;
// }

// export function Add2FloatDigits3(
//   output: TFloatDigits,
//   [a_digits, a_shift]: TFloatDigits,
//   [b_digits, b_shift]: TFloatDigits,
//   base: number,
// ): TFloatDigits {
//   const buffer: Uint8Array = output[0];
//   let number: number = 0;
//
//   let i: number = 0;
//   const a_length: number = a_digits.length;
//   const b_length: number = b_digits.length;
//   const min_shift: number = Math.min(a_shift, b_shift);
//   const a_start: number = a_shift - min_shift;
//   const a_end: number = a_start + a_length;
//   const b_start: number = b_shift - min_shift;
//   const b_end: number = b_start + b_length;
//   const end: number = Math.min(a_end, b_end);
//
//   if (b_shift > a_shift) {
//     i = Math.min(a_length, b_start);
//     buffer.set(a_digits.subarray(0, i));
//     // const _end: number = Math.min(a_length, b_start);
//     // for (; i < _end; i++) {
//     //   buffer[i] = a_digits[i];
//     // }
//     buffer.fill(0, i, b_start);
//     i = b_start;
//     for (; i < b_start; i++) {
//       buffer[i] = 0;
//     }
//   } else {
//     i = Math.min(b_length, a_start);
//     buffer.set(b_digits.subarray(0, i));
//     // const _end: number = Math.min(b_length, a_start);
//     // for (; i < _end; i++) {
//     //   buffer[i] = b_digits[i];
//     // }
//     buffer.fill(0, i, a_start);
//     i = a_start;
//     // for (; i < a_start; i++) {
//     //   buffer[i] = 0;
//     // }
//   }
//
//   let a: number = i - a_start;
//   let b: number = i - b_start;
//
//   for (; i < end; i++) {
//     // number += a_digits[i - a_start] + b_digits[i - b_start];
//     number += a_digits[a++] + b_digits[b++];
//     if (number < base) {
//       buffer[i] = number;
//       number = 0;
//     } else {
//       buffer[i] = number - base;
//       number = 1;
//     }
//   }
//
//   for (; i < a_end; i++) {
//     // number += a_digits[i - a_start];
//     number += a_digits[a++];
//     if (number < base) {
//       buffer[i] = number;
//       number = 0;
//     } else {
//       buffer[i] = number - base;
//       number = 1;
//     }
//   }
//
//   for (; i < b_end; i++) {
//     // number += b_digits[i - b_start];
//     number += b_digits[b++];
//     if (number < base) {
//       buffer[i] = number;
//       number = 0;
//     } else {
//       buffer[i] = number - base;
//       number = 1;
//     }
//   }
//
//   if (number !== 0) {
//     buffer[i++] = number;
//   }
//
//   output[0] = buffer.subarray(0, i);
//   output[1] = min_shift;
//
//   return output;
// }



// export function Sub2DigitsOrdered(
//   output: TFloatDigits,
//   [a_digits, a_shift]: TFloatDigits,
//   [b_digits, b_shift]: TFloatDigits,
//   base: number,
// ): TFloatDigits {
//   let number: number = 0;
//
//   const length_a: number = a.length;
//   const length_b: number = b.length;
//
//   let i: number = 0;
//
//   for (; i < length_b; i++) {
//     number += a[i] - b[i];
//     if (number < 0) {
//       buffer[i] = number + base;
//       number = -1;
//     } else {
//       buffer[i] = number;
//       number = 0;
//     }
//   }
//
//   for (; i < length_a; i++) {
//     number += a[i];
//     if (number < 0) {
//       buffer[i] = number + base;
//       number = -1;
//     } else {
//       buffer[i] = number;
//       number = 0;
//     }
//   }
//
//   return buffer.subarray(0, i);
// }


