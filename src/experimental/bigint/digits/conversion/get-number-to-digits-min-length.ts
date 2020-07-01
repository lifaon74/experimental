/**
 * Returns the min number of digits to store 'number'
 */
export function GetNumberToDigitsMinLength(number: number, base: number): number {
  return Math.ceil(Math.log(number + 1) / Math.log(base));
}
