import { $NumberToDigits, _numberToChar, DigitsToString, NumberSize, NumberToDigits } from './DigitsConversion';
import { TFloatDigits } from './BigFloat';
import { $Div2Digits } from './DigitsArithmetic';
import { $ChangeBaseOfDigits } from './DigitsBase';
import { $ShiftLeftDigits } from './DigitsShift';

/**
 * https://fr.wikipedia.org/wiki/IEEE_754
 * https://en.wikipedia.org/wiki/Double-precision_floating-point_format
 */

export function NumberToFloatDigits(
  buffer: Uint8Array,
  number: number,
  base: number,
): TFloatDigits {
  const bytes: Uint8Array = new Uint8Array(8); // new ArrayBuffer(8)
  const doubleBytes: DataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  doubleBytes.setFloat64(0, number, false);
  // [sign (63), exponent (62-52), mantissa (51-0)]
  // v = s * 2**e * m, where m = 1 + mantissa ([0-1])
  const mantissa: Uint8Array = new Uint8Array(53);
  for (let i = 0; i < 52; i++) {
    mantissa[i] = (bytes[7 - Math.floor(i / 8)] >> (i % 8)) & 0x1;
  }
  mantissa[52] = 1;

  let exponent: number = 0;
  // for (let i = 62; i >= 52; i--) {
  //   exponent = (exponent << 1) | ((bytes[7 - Math.floor(i / 8)] >> (i % 8)) & 0x1);
  // }
  for (let i = 52; i < 63; i++) {
    exponent |= ((bytes[7 - Math.floor(i / 8)] >> (i % 8)) & 0x1) << (i - 52);
  }

  // console.log(bytes);

  // shift from [-1023
  exponent -= 0x3ff; // (2 ** (63 - 52)) - 1
  console.log(exponent);

  const bits: Uint8Array = $ShiftLeftDigits(mantissa, exponent); // real representation of number in base 2
  let digits: Uint8Array = $ChangeBaseOfDigits(bits, 2, base);
  digits = $ShiftLeftDigits(digits, 1);

  console.log(mantissa, digits);

  const _div = 2 ** 52;
  const __div = NumberToDigits(new Uint8Array(NumberSize(_div, base)), _div, base);
  const _digits = $Div2Digits(digits, __div, base);
  console.log(_digits);

  console.log($Div2Digits($ShiftLeftDigits(_digits[1], 1), __div, base));


  const negative: boolean = (bytes[0] & 0b1000000) !== 0;

  // a * (0.1**Math.floor(Math.log10(a)))
  // a * (0.1**Math.floor(Math.log2(a)/Math.log10(a)))
  // let i: number = 0;
  // while (number !== 0) {
  //   buffer[i++] = number % base;
  //   number = Math.floor(number / base);
  // }
  // // do {
  // //   buffer[i++] = number % base;
  // //   number = Math.floor(number / base);
  // // } while (number !== 0);
  // return buffer.subarray(0, i);
}

export interface MaxStandardDigits {
  left: number;
  right: number;
}

export function NormalizeMaxStandardDigits(
  value?: MaxStandardDigits | number,
  defaultValue: MaxStandardDigits = { left: 10, right: 10 }
): MaxStandardDigits {
  if (value === void 0) {
    // return defaultValue;
    return {
      left: defaultValue.left,
      right: defaultValue.right
    };
  } else if ((typeof value === 'object') && (value !== null)) {
    value.left = Number(value.left);
    if (Number.isNaN(value.left)) {
      throw new TypeError(`Expected number as MaxStandardDigits.left`);
    }
    value.right = Number(value.right);
    if (Number.isNaN(value.right)) {
      throw new TypeError(`Expected number as MaxStandardDigits.right`);
    }
    return value;
  } else {
    value = Number(value);
    if (Number.isNaN(value as number)) {
      throw new TypeError(`Expected MaxStandardDigits as input`);
    } else {
      return {
        left: value,
        right: value,
      };
    }
  }

}

export interface FloatDigitsToStringOptions {
  maxStandardDigits?: number | MaxStandardDigits;
}

export interface FloatDigitsToStringOptionsNormalized {
  maxStandardDigits: MaxStandardDigits;
}

const DefaultFloatDigitsToStringOptions: FloatDigitsToStringOptionsNormalized = {
  maxStandardDigits: { left: 10, right: 10 },
};

export function NormalizeFloatDigitsToStringOptions(
  options: FloatDigitsToStringOptions = {},
  defaultOptions: FloatDigitsToStringOptionsNormalized = DefaultFloatDigitsToStringOptions
): FloatDigitsToStringOptionsNormalized {
  if (options.maxStandardDigits === void 0) {
    options.maxStandardDigits = defaultOptions.maxStandardDigits;
  } else {
    options.maxStandardDigits = NormalizeMaxStandardDigits(options.maxStandardDigits);
  }

  return options as FloatDigitsToStringOptionsNormalized;
}



export function FloatDigitsToString(
  [digits, shift]: TFloatDigits,
  base: number,
  options?: FloatDigitsToStringOptions,
  numberToChar: string[] = _numberToChar,
): string {
  const _options: FloatDigitsToStringOptionsNormalized = NormalizeFloatDigitsToStringOptions(options);
  let string: string = '';
  let i: number = digits.length - 1;

  if ((shift <= -_options.maxStandardDigits.right) || ((digits.length + shift) >= _options.maxStandardDigits.left)) { // scientific notation
    shift += i;
    string += numberToChar[digits[i]];
    i--;

    if (i >= 0) {
      string += '.';
      for (; i >= 0; i--) {
        string += numberToChar[digits[i]];
      }
    }

    if (shift !== 0) {
      string += ((base === 10) ? 'e' : ('x' + base.toString(10) + '^')) // ×
        + ((shift > 0) ? '+' : '-')
        + Math.abs(shift).toString(10);
    }
  } else {
    if (shift >= 0) {
      for (; i >= 0; i--) {
        string += numberToChar[digits[i]];
      }
      const zeroChar: string = numberToChar[0];
      for (let j: number = 0; j < shift; j++) {
        string += zeroChar;
      }
    } else {
      if (-shift < digits.length) {
        for (const end: number = -shift; i >= end; i--) {
          string += numberToChar[digits[i]];
        }
        string += '.';
      } else {
        const zeroChar: string = numberToChar[0];
        string += zeroChar + '.';
        for (let j: number = 0, end: number = -shift - digits.length; j < end; j++) {
          string += zeroChar;
        }
      }
      for (; i >= 0; i--) {
        string += numberToChar[digits[i]];
      }
    }
  }
  return string;
}

