
/** FUNCTIONS **/

/**
 * Ensures than 'base' is an integer in range [1, 256],
 * and, if 'digits' is provided, than all its values are in the range [0, base[
 */
export function NormalizeBase(base: number, digits?: Uint8Array): number {
  if (typeof base !== 'number') {
    throw new TypeError(`Expected number as base`);
  } else if (Number.isNaN(base)) {
    throw new TypeError(`Expected value different than NaN as base`);
  } else if (base < 1) {
    throw new RangeError(`Expected base greater or equals to 1`);
  } else if (base > 256) {
    throw new RangeError(`Expected base lower or equals to 256`);
  } else {
    base = Math.floor(base);
    if (digits !== void 0) {
      for (let i = 0, l = digits.length; i < l; i++) {
        if (digits[i] >= base) {
          throw new RangeError(`Expected base greater than digits[${i}] = ${digits[i]}`);
        }
      }
    }
    return base;
  }
}

/**
 * Ensures than 'digits' is an Uint8Array, and all its values are in the range [0, base[
 */
export function NormalizeDigits(digits: Uint8Array, base: number): Uint8Array {
  if (digits instanceof Uint8Array) {
    const length: number = digits.length;
    if (length < 1) {
      throw new TypeError(`Expected a minimal length of 1 for digits`);
    } else {
      for (let i = 0; i < length; i++) {
        if (digits[i] >= base) {
          throw new RangeError(`Expected number lower to ${base} as digits[${i}]`);
        }
      }
      return digits;
    }
  } else {
    throw new TypeError(`Expected number[] as digits`);
  }
}

