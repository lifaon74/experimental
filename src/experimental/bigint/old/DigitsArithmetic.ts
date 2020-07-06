import { DigitsLower, DigitsLowerOrEqual } from './DigitsComparision';
import { GetBufferFromInput, NumberSize } from './DigitsConversion';
import { ReduceDigits } from './DigitsConversion';

/** ADDITION **/

/**
 * Creates compliant buffer for AddPrimitiveNumberToDigits
 * INFO: Expects number positive and non decimal
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} number
 * @param {number} offset
 * @return {Uint8Array}
 * @constructor
 */
export function AddPrimitiveNumberToDigitsBufferSafeSize(
  input: Uint8Array,
  base: number,
  number: number,
): number {
  return Math.max(input.length, NumberSize(number, base)) + 1;
}

/**
 * Adds a primitive number to a list of digits
 * Does extra checks to fasten computation
 * INFO: Expects number positive and non decimal
 * @param {Uint8Array} buffer
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} number
 * @return {Uint8Array}
 * @constructor
 */
export function AddPrimitiveNumberToDigits(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
): Uint8Array {
   if (number === 0) {
     return GetBufferFromInput(buffer, input);
  } else {
    return AddPrimitiveNumberToDigitsOptimized(
      buffer,
      input,
      base,
      number,
    );
  }
}


/**
 * Adds a primitive number to a list of digits
 * INFO: Expects number positive and non decimal
 * @param {Uint8Array} buffer
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} number
 * @return {Uint8Array}
 * @constructor
 */
export function AddPrimitiveNumberToDigitsOptimized(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
): Uint8Array {
  if (buffer !== input) {
    buffer.set(input);
  }

  const length: number = input.length;
  let i: number = 0;

  for (; i < length; i++) {
    number += input[i];
    buffer[i] = number % base;
    number = Math.floor(number / base);
  }

  while (number !== 0) {
    buffer[i++] = number % base;
    number = Math.floor(number / base);
  }

  return buffer.subarray(0, Math.max(i, length));
}


/**
 * Returns a compliant size for Add2Digits
 */
export function Add2DigitsBufferSafeSize(a: Uint8Array, b: Uint8Array): number {
  return Math.max(a.length, b.length) + 1;
}

/**
 * Adds two digits
 */
export function Add2Digits(
  buffer: Uint8Array,
  a: Uint8Array,
  b: Uint8Array,
  base: number,
): Uint8Array {
  let number: number = 0;

  const length_a: number = a.length;
  const length_b: number = b.length;
  const minLength: number = Math.min(length_a, length_b);

  let i: number = 0;

  for (; i < minLength; i++) {
    number += a[i] + b[i];
    if (number < base) {
      buffer[i] = number;
      number = 0;
    } else {
      buffer[i] = number - base;
      number = 1;
    }
  }

  for (; i < length_a; i++) {
    number += a[i];
    if (number < base) {
      buffer[i] = number;
      number = 0;
    } else {
      buffer[i] = number - base;
      number = 1;
    }
  }

  for (; i < length_b; i++) {
    number += b[i];
    if (number < base) {
      buffer[i] = number;
      number = 0;
    } else {
      buffer[i] = number - base;
      number = 1;
    }
  }

  if (number !== 0) {
    buffer[i++] = number;
  }

  return buffer.subarray(0, i);
}

// export function Add2Digits2(
//   buffer: Uint8Array,
//   a: Uint8Array,
//   b: Uint8Array,
//   base: number,
// ): Uint8Array {
//   if (buffer !== a) {
//     if (buffer === b) {
//       [a, b] = [b, a];
//     } else {
//       if (b.length > a.length) {
//         [a, b] = [b, a];
//       }
//       buffer.set(a);
//     }
//   }
//   // at this point, buffer's content equals a
//
//   let remainder: number = 0;
//   const length_b: number = b.length;
//   let i: number = 0;
//
//   for (; i < length_b; i++) {
//     buffer[i] += b[i] + remainder;
//     if (buffer[i] < base) {
//       remainder = 0;
//     } else {
//       buffer[i] -= base;
//       remainder = 1;
//     }
//   }
//
//   while (remainder !== 0) {
//     buffer[i] += remainder;
//     if (buffer[i] < base) {
//       remainder = 0;
//     } else {
//       buffer[i] -= base;
//       remainder = 1;
//     }
//     i++;
//   }
//
//   return buffer.subarray(0, Math.max(a.length, i));
// }

/**
 * Returns a compliant size for AddDigits
 */
export function AddDigitsBufferSafeSize(inputs: Uint8Array[], base: number): number {
  const length: number = inputs.length;
  let _length: number = 0;
  for (let i = 0; i < length; i++) {
    _length = Math.max(_length, inputs[i].length);
  }

  return _length + NumberSize(length, base);
}

/**
 * Adds many digits together
 */
export function AddDigits(
  buffer: Uint8Array,
  inputs: Uint8Array[],
  base: number,
): Uint8Array {
  let number: number = 0;
  let index: number = 0;
  const inputsCount: number = inputs.length;
  const lengths: Uint32Array = new Uint32Array(inputsCount);
  let maxLength: number = 0;

  for (let i = 0; i < inputsCount; i++) {
    const length: number = inputs[i].length;
    lengths[i] = length;
    if (length > maxLength) {
      maxLength = length;
    }
  }

  do {
    for (let i = 0; i < inputsCount; i++) {
      if (index < lengths[i]) {
        number += inputs[i][index];
      }
    }
    buffer[index++] = number % base;
    number = Math.floor(number / base);
  } while (index < maxLength);

  while (number !== 0) {
    buffer[index++] = number % base;
    number = Math.floor(number / base);
  }

  return buffer.subarray(0, index);
}


/** SUBTRACTION **/

/**
 * Returns a compliant size for Sub2Digits
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @return {Uint8Array}
 * @constructor
 */
export function Sub2DigitsBufferSafeSize(a: Uint8Array, b: Uint8Array): number {
  return Math.max(a.length, b.length);
}

/**
 * Subtracts two digits
 * @param {Uint8Array} buffer
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @param {number} base
 * @return {[Uint8Array , boolean]} -> [digits, negative]
 * @constructor
 */
export function Sub2Digits(
  buffer: Uint8Array,
  a: Uint8Array,
  b: Uint8Array,
  base: number,
): [Uint8Array, boolean] {
  return DigitsLower(a, b)
    ? [Sub2DigitsOrdered(buffer, b, a, base), true]
    : [Sub2DigitsOrdered(buffer, a, b, base), false];
}

/**
 * Subtracts two digits where a >= b
 * @param {Uint8Array} buffer
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @param {number} base
 * @return {Uint8Array}
 * @constructor
 */
export function Sub2DigitsOrdered(
  buffer: Uint8Array,
  a: Uint8Array,
  b: Uint8Array,
  base: number,
): Uint8Array {
  let number: number = 0;

  const length_a: number = a.length;
  const length_b: number = b.length;

  let i: number = 0;

  for (; i < length_b; i++) {
    number += a[i] - b[i];
    if (number < 0) {
      buffer[i] = number + base;
      number = -1;
    } else {
      buffer[i] = number;
      number = 0;
    }
  }

  for (; i < length_a; i++) {
    number += a[i];
    if (number < 0) {
      buffer[i] = number + base;
      number = -1;
    } else {
      buffer[i] = number;
      number = 0;
    }
  }

  return buffer.subarray(0, i);
}


/** MULTIPLICATION **/


/**
 * Creates compliant buffer for MulDigitsByPrimitiveNumber
 * INFO: Expects number positive and non decimal
 */
export function MulDigitsByPrimitiveNumberBufferSafeSize(
  input: Uint8Array,
  base: number,
  number: number,
): number {
  return input.length + NumberSize(number, base);
}

/**
 * Multiplies a digits list by a primitive number.
 * Does extra checks to fasten computation
 * INFO: Expects number positive and non decimal
 */
export function MulDigitsByPrimitiveNumber(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
): Uint8Array {
  const length: number = input.length;
  if ((length === 0) || (number === 0)) {
    return buffer.subarray(0, 0);
  } else if (number === 1) {
    return GetBufferFromInput(buffer, input);
    // TODO shift if number equals base
  } else {
    return MulDigitsByPrimitiveNumberOptimized(
      buffer,
      input,
      base,
      number,
      new Uint32Array(length),
    );
  }
}


export function MulDigitsByPrimitiveNumberOptimizedSumBufferSafeSize(input: Uint8Array): number {
  return input.length;
}

export function MulDigitsByPrimitiveNumberOptimizedCreateSumBuffer(input: Uint8Array): Uint32Array {
  return new Uint32Array(input.length);
}

/**
 * Multiplies a digits list by a primitive number
 * Use advanced params.
 */
export function MulDigitsByPrimitiveNumberOptimized(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
  sumBuffer: Uint32Array,
): Uint8Array {
  const length: number = input.length;
  let i: number = 0;

  for (let j = 0; j < length; j++) {
    sumBuffer[j] = (number * input[j]);
  }

  let _number: number = 0;
  while (i < length) {
    _number += sumBuffer[i];
    buffer[i++] = _number % base;
    _number = Math.floor(_number / base);
  }

  while (_number !== 0) {
    buffer[i++] = _number % base;
    _number = Math.floor(_number / base);
  }

  return buffer.subarray(0, i);
}



/**
 * Returns a compliant size for Multiply2Digits
 */
export function Mul2DigitsBufferSafeSize(a: Uint8Array, b: Uint8Array): number {
  return (a.length + b.length);
}

/**
 * Multiplies two digits.
 *   limit => max digits of b = uint32 / base. Ex: (2**32) / 10
 *   https://en.wikipedia.org/wiki/Multiplication_algorithm
 * @param {Uint8Array} buffer
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @param {number} base
 * @return {Uint8Array}
 * @constructor
 */
export function Mul2Digits(
  buffer: Uint8Array,
  a: Uint8Array,
  b: Uint8Array,
  base: number
): Uint8Array {
  // limits => max digits of b = uint32 / base. Ex: (2**32) / 10 = 429496729
  const length_a: number = a.length;
  const length_b: number = b.length;
  const length: number = length_a + length_b - 1;
  let i: number = 0;

  if (length > 0) {
    const _buffer: Uint32Array = new Uint32Array(length); // contains the additions of all the lines

    for (let index_b = 0; index_b < length_b; index_b++) { // for each digits in b
      const value_b: number = b[index_b];
      for (let index_a = 0; index_a < length_a; index_a++) { // for each digits in a
        _buffer[index_a + index_b] += (value_b * a[index_a]);
      }
    }

    let number: number = 0;
    while (i < length) {
      number += _buffer[i];
      buffer[i++] = number % base;
      number = Math.floor(number / base);
    }

    if (number !== 0) {
      buffer[i++] = number;
    }
  }

  return buffer.subarray(0, i);
}

export function $Mul2Digits(
  a: Uint8Array,
  b: Uint8Array,
  base: number
): Uint8Array {
  return Mul2Digits(new Uint8Array(Mul2DigitsBufferSafeSize(a, b)), a, b, base);
}

/** DIVISION **/

export function DivDigitsByPrimitiveNumberBufferSafeSize(
  input: Uint8Array,
  base: number,
  number: number,
): number {
  return Math.max(input.length - NumberSize(number, base) + 1, 0);
}

export function DivDigitsByPrimitiveNumber(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
): [Uint8Array, number] {
  if (input.length === 0) { // input === 0
    return [buffer.subarray(0, 0), 0];
  } else if (number === 0) {
    throw new RangeError(`Division by zero`);
  } else if (number === 1) {
    return [GetBufferFromInput(buffer, input), 0];
  } else {
    return DivDigitsByPrimitiveNumberOptimized(buffer, input, base, number);
  }
}

export function DivDigitsByPrimitiveNumberOptimized(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  number: number,
): [Uint8Array, number] {
  // limits => number must be lower than uint32 / (base + 1). Ex: (2**32) / (10 + 1) = 390451572
  //        => number must be different than 0
  const length: number = input.length;
  let remainder: number = 0;
  let bufferLengthMinusOne: number = buffer.length - 1;
  let i: number = bufferLengthMinusOne;

  for (let j = length - 1; j >= 0; j--) {
    remainder = (remainder * base) + input[j];
    if (remainder >= number) {
      buffer[i--] = Math.floor(remainder / number);
      remainder = remainder % number;
    } else if (i < bufferLengthMinusOne) {
      buffer[i--] = 0;
    }
  }

  return [buffer.subarray(i + 1), remainder];
}




export function Div2DigitsQuotientBufferSafeSize(numerator: Uint8Array): number {
  return numerator.length;
}

export function Div2DigitsRemainderBufferSafeSize(numerator: Uint8Array): number {
  return numerator.length;
}

// https://en.wikipedia.org/wiki/Division_algorithm
export function Div2Digits(
  quotientBuffer: Uint8Array,
  remainderBuffer: Uint8Array,
  numerator: Uint8Array,
  denominator: Uint8Array,
  base: number
): [Uint8Array, Uint8Array] {
  const length_a: number = numerator.length;
  let quotientBufferLengthMinusOne: number = quotientBuffer.length - 1;
  let i: number = quotientBufferLengthMinusOne;

  let remainder: Uint8Array;
  let remainderBufferIndex: number = remainderBuffer.length - 1;

  for (let j = length_a - 1; j >= 0; j--) {
    remainderBuffer[remainderBufferIndex--] = numerator[j];
    remainder = remainderBuffer.subarray(remainderBufferIndex + 1);

    // console.log('remainder', remainder);

    let k: number = 0;
    while (DigitsLowerOrEqual(denominator, remainder)) {
      Sub2DigitsOrdered(remainder, remainder, denominator, base);
      k++;
    }

    if (k === 0) {
      if (i < quotientBufferLengthMinusOne) {
        quotientBuffer[i--] = 0;
      }
    } else {
      quotientBuffer[i--] = k;
    }

    // console.log('k', k, 'r', remainder, denominator);
  }

  return [quotientBuffer.subarray(i + 1), ReduceDigits(remainderBuffer.subarray(remainderBufferIndex + 1))];
}

export function $Div2Digits(
  numerator: Uint8Array,
  denominator: Uint8Array,
  base: number
): [Uint8Array, Uint8Array] {
  return Div2Digits(
    new Uint8Array(Div2DigitsQuotientBufferSafeSize(numerator)),
    new Uint8Array(Div2DigitsRemainderBufferSafeSize(numerator)),
    numerator,
    denominator,
    base,
  )
}
