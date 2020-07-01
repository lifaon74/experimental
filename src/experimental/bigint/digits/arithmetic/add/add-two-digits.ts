/**
 * Returns a compliant size for AddTwoDigits
 */
export function GetAddTwoDigitsBufferSafeSize(a: Uint8Array, b: Uint8Array): number {
  return Math.max(a.length, b.length) + 1;
}

/**
 * Adds two digits
 */
export function AddTwoDigits(
  buffer: Uint8Array,
  a: Uint8Array,
  b: Uint8Array,
  base: number,
): Uint8Array {
  let number: number = 0;

  const length_a: number = a.length;
  const length_b: number = b.length;
  const minLength: number = Math.min(length_a, length_b);

  let i: number = 0;

  for (; i < minLength; i++) {
    number += a[i] + b[i];
    if (number < base) {
      buffer[i] = number;
      number = 0;
    } else {
      buffer[i] = number - base;
      number = 1;
    }
  }

  for (; i < length_a; i++) {
    number += a[i];
    if (number < base) {
      buffer[i] = number;
      number = 0;
    } else {
      buffer[i] = number - base;
      number = 1;
    }
  }

  for (; i < length_b; i++) {
    number += b[i];
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

  return buffer.subarray(0, i);
}

// export function Add2Digits2(
//   buffer: Uint8Array,
//   a: Uint8Array,
//   b: Uint8Array,
//   base: number,
// ): Uint8Array {
//   if (buffer !== a) {
//     if (buffer === b) {
//       [a, b] = [b, a];
//     } else {
//       if (b.length > a.length) {
//         [a, b] = [b, a];
//       }
//       buffer.set(a);
//     }
//   }
//   // at this point, buffer's content equals a
//
//   let remainder: number = 0;
//   const length_b: number = b.length;
//   let i: number = 0;
//
//   for (; i < length_b; i++) {
//     buffer[i] += b[i] + remainder;
//     if (buffer[i] < base) {
//       remainder = 0;
//     } else {
//       buffer[i] -= base;
//       remainder = 1;
//     }
//   }
//
//   while (remainder !== 0) {
//     buffer[i] += remainder;
//     if (buffer[i] < base) {
//       remainder = 0;
//     } else {
//       buffer[i] -= base;
//       remainder = 1;
//     }
//     i++;
//   }
//
//   return buffer.subarray(0, Math.max(a.length, i));
// }
