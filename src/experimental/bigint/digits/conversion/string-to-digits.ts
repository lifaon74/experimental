import { CHAR_TO_NUMBER_MAP, TCharToNumberMap } from './constants';

/**
 * Converts a string to a list of digits
 */
export function StringToDigits(
  buffer: Uint8Array,
  string: string,
  base: number,
  charToNumberMap: TCharToNumberMap = CHAR_TO_NUMBER_MAP
): Uint8Array {
  const parts: string[] = Array.from(string);
  const length: number = parts.length;
  const lengthMinusOne: number = length - 1;
  let i: number = 0;

  for (; i < length; i++) {
    const char: string = parts[lengthMinusOne - i];
    if (char in charToNumberMap) {
      const digit: number = charToNumberMap[char];
      if (digit < 0) {
        throw new RangeError(`Expected number greater or equals to 0 as digits[${i}]`);
      } else if (digit >= base) {
        throw new RangeError(`Expected number lower to ${base} as digits[${i}]`);
      } else {
        buffer[i] = digit;
      }
    } else {
      throw new RangeError(`Invalid char '${char}' at index ${lengthMinusOne - i}.`);
    }
  }

  return buffer.subarray(0, i);
}
