/**
 * Removes front zeros from digits
 */
export function RemoveDigitsLeadingZeroes(input: Uint8Array): Uint8Array {
  let i: number = input.length - 1;
  // for (; i > 0; i--) { // strictly greater than 0 because we want at least one digit
  //   if (input[i] !== 0) {
  //     break;
  //   }
  // }
  while ((i > 0) && (input[i] === 0)) {
    i--;
  }
  return input.subarray(0, i + 1);
}
