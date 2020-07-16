/**
 * Stores the map from a number to a char
 * @type {string[]}
 */
export const _numberToChar: string[] = (() => {
  const output: string[] = [];
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
 * @type {{[p: string]: number}}
 */
export const _charToNumber: { [key: string]: number } = (() => {
  const output: { [key: string]: number } = Object.create(null);
  for (let i = 0, l = _numberToChar.length; i < l; i++) {
    output[_numberToChar[i]] = i;
  }
  return output;
})();

/**
 * Returns the min number of digits to store 'number'
 * @param {number} number
 * @param {number} base
 * @return {number}
 * @constructor
 */
export function NumberSize(number: number, base: number): number {
  return Math.ceil(Math.log(number + 1) / Math.log(base));
}

/**
 * Converts a number to a list of digits.
 * INFO: Expects number positive and non decimal
 * @param {Uint8Array} buffer
 * @param {number} number
 * @param {number} base
 * @return {Uint8Array}
 * @constructor
 */
export function NumberToDigits(
  buffer: Uint8Array,
  number: number,
  base: number,
): Uint8Array {
  let i: number = 0;
  while (number !== 0) {
    buffer[i++] = number % base;
    number = Math.floor(number / base);
  }
  // do {
  //   buffer[i++] = number % base;
  //   number = Math.floor(number / base);
  // } while (number !== 0);
  return buffer.subarray(0, i);
}


export function $NumberToDigits(
  number: number,
  base: number,
) {
  return NumberToDigits(new Uint8Array(NumberSize(number, base)), number, base);
}


/**
 * Converts a list of digits to a number
 * @param {Uint8Array} input
 * @param {number} base
 * @return {number}
 * @constructor
 */
export function DigitsToNumber(input: Uint8Array, base: number): number {
  let number: number = 0;
  for (let i = 0, l = input.length; i < l; i++) {
    number += input[i] * Math.pow(base, i);
  }
  return number;
}

/**
 * Converts a list of digits to a number, and verify than number is a safe integer.
 * @param {Uint8Array} input
 * @param {number} base
 * @return {number}
 * @constructor
 */
export function DigitsToNumberOverflow(input: Uint8Array, base: number): number {
  const number: number = DigitsToNumber(input, base);
  if (Number.isSafeInteger(number)) {
    return number;
  } else {
    throw new RangeError(`Number is too big to be an integer.`);
  }
}

/**
 * Converts a string to a list of digits
 * @param {Uint8Array} buffer
 * @param {string} string
 * @param {number} base
 * @param {{[p: string]: number}} charToNumber
 * @return {Uint8Array}
 * @constructor
 */
export function StringToDigits(
  buffer: Uint8Array,
  string: string,
  base: number,
  charToNumber: { [key: string]: number } = _charToNumber
): Uint8Array {
  const parts: string[] = Array.from(string);
  const length: number = parts.length;
  const lengthMinusOne: number = length - 1;
  let i: number = 0;

  for (; i < length; i++) {
    const char: string = parts[lengthMinusOne - i];
    if (char in charToNumber) {
      const digit: number = charToNumber[char];
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

/**
 * Converts a list of digits to a string
 * @param {Uint8Array} input
 * @param {string[]} numberToChar
 * @return {string}
 * @constructor
 */
export function DigitsToString(input: Uint8Array, numberToChar: string[] = _numberToChar): string {
  let string: string = '';
  let i = input.length - 1;
  while ((i > 0) && (input[i] === 0)) { // strictly greater than 0 because we want at least one digit
    i--;
  }
  for (; i >= 0; i--) {
    string += numberToChar[input[i]];
  }
  return string;
}

/**
 * Converts a list of digits to a string.
 * INFO: Expects reduced digits (no leading zeroes)
 * @param {Uint8Array} input
 * @param {string[]} numberToChar
 * @return {string}
 * @constructor
 */
export function DigitsToStringOptimized(input: Uint8Array, numberToChar: string[] = _numberToChar): string {
  let string: string = '';
  for (let i = input.length - 1; i >= 0; i--) {
    string += numberToChar[input[i]];
  }
  return string;
}



/**
 * Removes front zeros from digits
 * @param {Uint8Array} input
 * @return {Uint8Array}
 * @constructor
 */
export function ReduceDigits(input: Uint8Array): Uint8Array {
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


/**
 * Returns a buffer filled with input.
 * @param {Uint8Array} buffer
 * @param {Uint8Array} input
 * @return {Uint8Array}
 * @constructor
 */
export function GetBufferFromInput(buffer: Uint8Array, input: Uint8Array): Uint8Array {
  if (buffer === input) {
    return buffer;
  } else {
    buffer.set(input);
    return buffer.subarray(0, input.length);
  }
}

