/**
 * Converts a list of digits to a number
 * INFO: resulting number may loose precision if too big (!isSafeInteger)
 */
export function DigitsToNumber(digits: Uint8Array, base: number): number {
  let number: number = 0;
  for (let i: number = 0, l: number = digits.length; i < l; i++) {
    number += digits[i] * Math.pow(base, i);
  }
  return number;
}

/**
 * Converts a list of digits to a number, and verify than number is a safe integer.
 */
export function DigitsToSafeInteger(input: Uint8Array, base: number): number {
  const number: number = DigitsToNumber(input, base);
  if (Number.isSafeInteger(number)) {
    return number;
  } else {
    throw new RangeError(`Number is too big to be an integer.`);
  }
}
