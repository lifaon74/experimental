/**
 * Returns a compliant size for ShiftDigits.
 * INFO: Expects 'shift' non decimal
 * @param {Uint8Array} input
 * @param {number} shift
 * @return {number}
 * @constructor
 */
export function ShiftDigitsBufferSafeSize(input: Uint8Array, shift: number): number {
  return (shift > 0)
    ? ShiftLeftDigitsBufferSafeSize(input, shift)
    : ShiftRightDigitsBufferSafeSize(input, -shift);
}

/**
 * Shifts digits in input on the left or the right according to the sign of 'shift'.
 * INFO: Expects 'shift' non decimal
 * @param {Uint8Array} buffer
 * @param {Uint8Array} input
 * @param {number} shift
 * @return {Uint8Array}
 * @constructor
 */
export function ShiftDigits(buffer: Uint8Array, input: Uint8Array, shift: number): Uint8Array {
  return (shift > 0)
    ? ShiftLeftDigits(buffer, input, shift)
    : ShiftRightDigits(buffer, input, -shift);
}

/**
 * Shortcut to ShiftDigits with auto generated buffer.
 * @param {Uint8Array} input
 * @param {number} shift
 * @return {Uint8Array}
 */
export function $ShiftDigits(input: Uint8Array, shift: number): Uint8Array {
  return ShiftDigits(new Uint8Array(ShiftDigitsBufferSafeSize(input, shift)), input, shift);
}


/**
 * Returns a compliant size for ShiftLeftDigits
 * INFO: Expects 'shift' positive and non decimal
 * @param {Uint8Array} input
 * @param {number} shift
 * @return {number}
 * @constructor
 */
export function ShiftLeftDigitsBufferSafeSize(input: Uint8Array, shift: number): number {
  return input.length + shift;
}

/**
 * Shifts digits in input on the left.
 * INFO: Expects 'shift' positive and non decimal
 * @Example: ([1, 2, 3], 1) => [1, 2, 3, 0]
 * @param {Uint8Array} buffer
 * @param {Uint8Array} input
 * @param {number} shift
 * @return {Uint8Array}
 * @constructor
 */
export function ShiftLeftDigits(buffer: Uint8Array, input: Uint8Array, shift: number): Uint8Array {
  for (let i = input.length - 1; i >= 0; i--) {
    buffer[i + shift] = input[i];
  }

  for (let i = 0; i < shift; i++) {
    buffer[i] = 0;
  }

  return buffer.subarray(0, input.length + shift);
}

/**
 * Shortcut to ShiftLeftDigits with auto generated buffer.
 * @param {Uint8Array} input
 * @param {number} shift
 * @return {Uint8Array}
 */
export function $ShiftLeftDigits(input: Uint8Array, shift: number): Uint8Array {
  return ShiftLeftDigits(new Uint8Array(ShiftLeftDigitsBufferSafeSize(input, shift)), input, shift);
}


/**
 * Returns a compliant size for ShiftRightDigits
 * INFO: Expects 'shift' positive and non decimal
 * @param {Uint8Array} input
 * @param {number} shift
 * @return {number}
 * @constructor
 */
export function ShiftRightDigitsBufferSafeSize(input: Uint8Array, shift: number): number {
  return input.length - shift;
}

/**
 * Shifts digits in input on the right.
 * INFO: Expects 'shift' positive and non decimal
 * @Example: ([1, 2, 3], 1) => [1, 2]
 * @param {Uint8Array} buffer
 * @param {Uint8Array} input
 * @param {number} shift
 * @return {Uint8Array}
 * @constructor
 */
export function ShiftRightDigits(buffer: Uint8Array, input: Uint8Array, shift: number): Uint8Array {
  const length: number = input.length - shift;
  for (let i = 0; i < length; i++) {
    buffer[i] = input[i + shift];
  }
  return buffer.subarray(0, length);
}

/**
 * Shortcut to ShiftRightDigits with auto generated buffer.
 * @param {Uint8Array} input
 * @param {number} shift
 * @return {Uint8Array}
 */
export function $ShiftRightDigits(input: Uint8Array, shift: number): Uint8Array {
  return ShiftRightDigits(new Uint8Array(ShiftRightDigitsBufferSafeSize(input, shift)), input, shift);
}
