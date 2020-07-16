/** TYPES **/

export type TCharToNumberMap = { [key: string]: number };
export type TNumberToCharMap = string[];

/** CONSTANTS **/

/**
 * Stores the map from a number to a char
 */
export const NUMBER_TO_CHAR_MAP: TNumberToCharMap = (() => {
  const output: TNumberToCharMap = [];
  for (let i = 0; i < 10; i++) { // 0 - 9
    output.push(String.fromCharCode(48 + i));
  }
  for (let i = 0; i < 26; i++) { // a - z
    output.push(String.fromCharCode(97 + i));
  }
  return output;
})();

/**
 * Stores the map from a char to a number
 */
export const CHAR_TO_NUMBER_MAP: TCharToNumberMap = (() => {
  const output: { [key: string]: number } = Object.create(null);
  for (let i = 0, l = NUMBER_TO_CHAR_MAP.length; i < l; i++) {
    output[NUMBER_TO_CHAR_MAP[i]] = i;
  }
  return output;
})();
