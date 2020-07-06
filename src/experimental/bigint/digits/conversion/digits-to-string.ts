import { NUMBER_TO_CHAR_MAP, TNumberToCharMap } from './constants';

/**
 * Converts a list of digits to a string
 */
export function DigitsToString(input: Uint8Array, numberToCharMap: TNumberToCharMap = NUMBER_TO_CHAR_MAP): string {
  let string: string = '';
  let i = input.length - 1;
  while ((i > 0) && (input[i] === 0)) { // strictly greater than 0 because we want at least one digit
    i--;
  }
  for (; i >= 0; i--) {
    string += numberToCharMap[input[i]];
  }
  return string;
}


/**
 * Converts a list of digits to a string.
 * INFO: Expects reduced digits (no leading zeroes)
 */
export function DigitsToStringOptimized(input: Uint8Array, numberToCharMap: TNumberToCharMap = NUMBER_TO_CHAR_MAP): string {
  let string: string = '';
  for (let i = input.length - 1; i >= 0; i--) {
    string += numberToCharMap[input[i]];
  }
  return string;
}
