import { GetBufferFromInput, NumberSize } from './DigitsConversion';
import { Add2Digits, MulDigitsByPrimitiveNumber, MulDigitsByPrimitiveNumberBufferSafeSize, MulDigitsByPrimitiveNumberOptimized } from './DigitsArithmetic';
import { ReduceDigits } from './DigitsConversion';

/**
 * Returns a compliant size for argument 'baseShift' of ChangeBaseOfDigitsOptimized
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} newBase
 * @return {number}
 * @constructor
 */
export function ChangeBaseOfDigitsBaseShiftSafeSize(input: Uint8Array, base: number, newBase: number): number {
  return Math.ceil(input.length * Math.log(base) / Math.log(newBase));
}

/**
 * Creates a digits list for argument 'baseShift' of ChangeBaseOfDigitsOptimized.
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} newBase
 * @return {Uint8Array}
 * @constructor
 */
export function ChangeBaseOfDigitsCreateBaseShift(input: Uint8Array, base: number, newBase: number): Uint8Array {
  const baseShift: Uint8Array = new Uint8Array(ChangeBaseOfDigitsBaseShiftSafeSize(input, base, newBase));
  baseShift[0] = 1;
  return baseShift;
}



/**
 * Returns a compliant size for argument 'baseShiftBuffer' of ChangeBaseOfDigitsOptimized
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} newBase
 * @return {number}
 * @constructor
 */
export function ChangeBaseOfDigitsBaseShiftBufferSafeSize(input: Uint8Array, base: number, newBase: number): number {
  return ChangeBaseOfDigitsBaseShiftSafeSize(input, base, newBase) + NumberSize(base, newBase);
}

/**
 * Returns a compliant size for argument 'baseShiftBuffer' of ChangeBaseOfDigitsOptimized
 * Equivalent of ChangeBaseOfDigitsBaseShiftBufferSafeSize but with 'baseShift' as first param
 * @param {Uint8Array} baseShift
 * @param {number} base
 * @param {number} newBase
 * @return {number}
 * @constructor
 */
export function ChangeBaseOfDigitsBaseShiftBufferSafeSizeFromBaseShift(baseShift: Uint8Array, base: number, newBase: number): number {
  return MulDigitsByPrimitiveNumberBufferSafeSize(baseShift, base, newBase);
}

/**
 * Creates a digits list for argument 'baseShiftBuffer' of ChangeBaseOfDigitsOptimized.
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} newBase
 * @return {Uint8Array}
 * @constructor
 */
export function ChangeBaseOfDigitsCreateBaseShiftBuffer(input: Uint8Array, base: number, newBase: number): Uint8Array {
  return new Uint8Array(ChangeBaseOfDigitsBaseShiftBufferSafeSize(input, base, newBase));
}

/**
 * Creates a digits list for argument 'baseShiftBuffer' of ChangeBaseOfDigitsOptimized.
 * Equivalent of ChangeBaseOfDigitsCreateBaseShiftBuffer but with 'baseShift' as first param
 * @param {Uint8Array} baseShift
 * @param {number} base
 * @param {number} newBase
 * @return {Uint8Array}
 * @constructor
 */
export function ChangeBaseOfDigitsCreateBaseShiftBufferFromBaseShift(baseShift: Uint8Array, base: number, newBase: number): Uint8Array {
  return new Uint8Array(ChangeBaseOfDigitsBaseShiftBufferSafeSizeFromBaseShift(baseShift, base, newBase));
  // return GetRecycledUint8Array('ChangeBaseOfDigitsCreateBaseShiftBufferFromBaseShift', ChangeBaseOfDigitsBaseShiftBufferSafeSizeFromBaseShift(baseShift, base, newBase));
}



/**
 * Returns a compliant size for argument 'sumBuffer' of ChangeBaseOfDigitsOptimized
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} newBase
 * @return {number}
 * @constructor
 */
export function ChangeBaseOfDigitsBaseSumBufferSafeSize(input: Uint8Array, base: number, newBase: number): number {
  return ChangeBaseOfDigitsBaseShiftBufferSafeSize(input, base, newBase);
}

/**
 * Returns a compliant size for argument 'sumBuffer' of ChangeBaseOfDigitsOptimized
 * Equivalent of ChangeBaseOfDigitsBaseSumBufferSafeSize but with 'baseShift' as first param
 * @param {Uint8Array} baseShift
 * @return {number}
 * @constructor
 */
export function ChangeBaseOfDigitsBaseSumBufferSafeSizeFromBaseShift(baseShift: Uint8Array): number {
  return baseShift.length;
}

/**
 * Creates a digits list for argument 'sumBuffer' of ChangeBaseOfDigitsOptimized.
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} newBase
 * @return {Uint32Array}
 * @constructor
 */
export function ChangeBaseOfDigitsCreateSumBuffer(input: Uint8Array, base: number, newBase: number): Uint32Array {
  return new Uint32Array(ChangeBaseOfDigitsBaseSumBufferSafeSize(input, base, newBase));
}

/**
 * Creates a digits list for argument 'sumBuffer' of ChangeBaseOfDigitsOptimized.
 * Equivalent of ChangeBaseOfDigitsCreateSumBuffer but with 'baseShift' as first param
 * @param {Uint8Array} baseShift
 * @return {Uint32Array}
 * @constructor
 */
export function ChangeBaseOfDigitsCreateSumBufferFromBaseShift(baseShift: Uint8Array): Uint32Array {
  return new Uint32Array(ChangeBaseOfDigitsBaseSumBufferSafeSizeFromBaseShift(baseShift));
}




/**
 * Returns a compliant size for argument 'buffer' of ChangeBaseOfDigitsOptimized
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} newBase
 * @return {number}
 * @constructor
 */
export function ChangeBaseOfDigitsBufferSafeSize(input: Uint8Array, base: number, newBase: number): number {
  return ChangeBaseOfDigitsBaseShiftBufferSafeSize(input, base, newBase) + NumberSize(input.length, newBase);
}



/**
 * Returns a compliant size for argument 'buffer' of ChangeBaseOfDigitsOptimized
 * Equivalent of ChangeBaseOfDigitsBufferSafeSize but with 'baseShiftBuffer' as second param
 * @param {Uint8Array} input
 * @param {Uint8Array} baseShiftBuffer
 * @param {number} newBase
 * @return {number}
 * @constructor
 */
export function ChangeBaseOfDigitsBufferSafeSizeFromBaseShiftBuffer(input: Uint8Array, baseShiftBuffer: Uint8Array, newBase: number): number {
  return MulDigitsByPrimitiveNumberBufferSafeSize(baseShiftBuffer, newBase, input.length);
}



// const memory: Map<string, [Uint8Array, any]> = new Map<string, [Uint8Array, any]>();
// export function GetRecycledUint8Array(key: string, size: number, period: number = 10000): Uint8Array {
//   if (memory.has(key)) {
//     const data = memory.get(key);
//     clearTimeout(data[1]);
//     data[1] = setTimeout(() => {
//       memory.delete(key);
//     }, period);
//
//     if (data[0].length >= size) {
//       return data[0].subarray(0, size);
//     } else {
//       data[0] = new Uint8Array(size);
//       return data[0];
//     }
//   } else {
//     const array: Uint8Array = new Uint8Array(size);
//     memory.set(key, [
//       array,
//       setTimeout(() => {
//         memory.delete(key);
//       }, period)
//     ]);
//     return array;
//   }
// }



/**
 * Changes a digits list from a base to another
 *
 * @param {Uint8Array} buffer
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} newBase
 * @return {Uint8Array}
 * @constructor
 */
export function ChangeBaseOfDigits(buffer: Uint8Array, input: Uint8Array, base: number, newBase: number): Uint8Array {
  if (base === newBase) {
    return GetBufferFromInput(buffer, input);
  } else {
    if (buffer === input) {
      input = input.slice();
    }

    buffer.fill(0);

    return ChangeBaseOfDigitsZeroed(
      buffer,
      input,
      base,
      newBase,
    );
  }
}


/**
 * Changes a digits list from a base to another
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} newBase
 * @return {Uint8Array}
 * @constructor
 */
export function $ChangeBaseOfDigits(input: Uint8Array, base: number, newBase: number): Uint8Array {
  if (base === newBase) {
    return input;
  } else {
    const baseShift: Uint8Array = ChangeBaseOfDigitsCreateBaseShift(input, base, newBase);
    const baseShiftBuffer: Uint8Array = ChangeBaseOfDigitsCreateBaseShiftBufferFromBaseShift(baseShift, base, newBase);
    const sumBuffer: Uint32Array = ChangeBaseOfDigitsCreateSumBufferFromBaseShift(baseShift);

    return ChangeBaseOfDigitsOptimized(
      new Uint8Array(ChangeBaseOfDigitsBufferSafeSizeFromBaseShiftBuffer(input, baseShiftBuffer, newBase)),
      input,
      base,
      newBase,
      baseShift,
      baseShiftBuffer,
      sumBuffer
    );
  }
}


export function ChangeBaseOfDigitsZeroed(buffer: Uint8Array, input: Uint8Array, base: number, newBase: number): Uint8Array {
  const baseShift: Uint8Array = ChangeBaseOfDigitsCreateBaseShift(input, base, newBase);
  const baseShiftBuffer: Uint8Array = ChangeBaseOfDigitsCreateBaseShiftBufferFromBaseShift(baseShift, base, newBase);
  const sumBuffer: Uint32Array = ChangeBaseOfDigitsCreateSumBufferFromBaseShift(baseShift);

  return ChangeBaseOfDigitsOptimized(
    buffer,
    input,
    base,
    newBase,
    baseShift,
    baseShiftBuffer,
    sumBuffer
  );
}


/**
 * Changes a digits list from a base to another
 * Used advanced parameters for better performances
 * INFO: expects zeroed buffer, and buffer !== input
 *
 * https://cs.stackexchange.com/questions/10318/the-math-behind-converting-from-any-base-to-any-base-without-going-through-base
 *
 * @param {Uint8Array} buffer
 * @param {Uint8Array} input
 * @param {number} base
 * @param {number} newBase
 * @param {Uint8Array} baseShift
 * @param {Uint8Array} baseShiftBuffer
 * @param {Uint32Array} sumBuffer
 * @return {Uint8Array}
 * @constructor
 */
export function ChangeBaseOfDigitsOptimized(
  buffer: Uint8Array,
  input: Uint8Array,
  base: number,
  newBase: number,
  // represents the power of 'base' at iteration 'i' with 'newBase' as base => digitsBase ** i (newBase),
  // it's initial value is 1
  baseShift: Uint8Array,
  // temp buffer to put data of baseShift * input[i]
  baseShiftBuffer: Uint8Array,
  // temp buffer to put data for MulDigitsByPrimitiveNumberOptimized
  sumBuffer: Uint32Array
): Uint8Array {
  const length: number = input.length;
  // to convert a number to a base: digitsNewBase = sum(digitsOldBase[i] * oldBase^i)
  // digitsNewBase = digitsOldBase[0] * oldBase^0 + digitsOldBase[i] * oldBase^i + ...

  for (let i = 0; i < length; i++) {
    if (input[i] !== 0) {
      // sumBuffer.fill(0);
       Add2Digits( // buffer += (base ** i) * input[i] (newBase)
        buffer,
        buffer,
        MulDigitsByPrimitiveNumberOptimized( // (base ** i) * input[i] (newBase)
          baseShiftBuffer,
          baseShift,
          newBase,
          input[i],
          sumBuffer
        ),
        newBase,
      );
    }

    // (equiv: base ** i) => factor = factor * base (newBase)
    // sumBuffer.fill(0);
    MulDigitsByPrimitiveNumberOptimized(
      baseShift,
      baseShift,
      newBase,
      base,
      sumBuffer,
    );
  }

  return ReduceDigits(buffer);
  // return buffer;
}
