import { GetNumberToDigitsMinLength } from '../conversion/get-number-to-digits-min-length';
import { GetMultiplyDigitsByPrimitiveNumberBufferSafeSize, MultiplyDigitsByPrimitiveNumberOptimized } from '../arithmetic/multiply/multiply-digits-by-primitive-number';
import { CopyBufferContent } from '../others/copy-buffer-content';
import { AddTwoDigits } from '../arithmetic/add/add-two-digits';
import { RemoveDigitsLeadingZeroes } from '../others/remove-digits-leading-zeroes';


/**
 * Returns a compliant size for argument 'baseShift' of ChangeBaseOfDigitsOptimized
 */
export function GetChangeBaseOfDigitsOptimizedBaseShiftSafeSize(input: Uint8Array, base: number, newBase: number): number {
  return Math.ceil(input.length * Math.log(base) / Math.log(newBase));
}

/**
 * Creates a digits list for argument 'baseShift' of ChangeBaseOfDigitsOptimized.
 */
export function CreateBaseShiftForChangeBaseOfDigitsOptimized(input: Uint8Array, base: number, newBase: number): Uint8Array {
  const baseShift: Uint8Array = new Uint8Array(GetChangeBaseOfDigitsOptimizedBaseShiftSafeSize(input, base, newBase));
  baseShift[0] = 1;
  return baseShift;
}



/**
 * Returns a compliant size for argument 'baseShiftBuffer' of ChangeBaseOfDigitsOptimized
 */
export function GetChangeBaseOfDigitsOptimizedBaseShiftBufferSafeSize(input: Uint8Array, base: number, newBase: number): number {
  return GetChangeBaseOfDigitsOptimizedBaseShiftSafeSize(input, base, newBase) + GetNumberToDigitsMinLength(base, newBase);
}

/**
 * Returns a compliant size for argument 'baseShiftBuffer' of ChangeBaseOfDigitsOptimized
 * Equivalent of GetChangeBaseOfDigitsOptimizedBaseShiftBufferSafeSize but with 'baseShift' as first param
 */
export function GetChangeBaseOfDigitsOptimizedBaseShiftBufferSafeSizeFromBaseShift(baseShift: Uint8Array, base: number, newBase: number): number {
  return GetMultiplyDigitsByPrimitiveNumberBufferSafeSize(baseShift, base, newBase);
}

/**
 * Creates a digits list for argument 'baseShiftBuffer' of ChangeBaseOfDigitsOptimized.
 */
export function CreateBaseShiftBufferForChangeBaseOfDigitsOptimized(input: Uint8Array, base: number, newBase: number): Uint8Array {
  return new Uint8Array(GetChangeBaseOfDigitsOptimizedBaseShiftBufferSafeSize(input, base, newBase));
}

/**
 * Creates a digits list for argument 'baseShiftBuffer' of ChangeBaseOfDigitsOptimized.
 * Equivalent of CreateBaseShiftBufferForChangeBaseOfDigitsOptimized but with 'baseShift' as first param
 */
export function CreateBaseShiftBufferFromBaseShiftForChangeBaseOfDigitsOptimized(baseShift: Uint8Array, base: number, newBase: number): Uint8Array {
  return new Uint8Array(GetChangeBaseOfDigitsOptimizedBaseShiftBufferSafeSizeFromBaseShift(baseShift, base, newBase));
  // return GetRecycledUint8Array('ChangeBaseOfDigitsCreateBaseShiftBufferFromBaseShift', ChangeBaseOfDigitsBaseShiftBufferSafeSizeFromBaseShift(baseShift, base, newBase));
}



/**
 * Returns a compliant size for argument 'sumBuffer' of ChangeBaseOfDigitsOptimized
 */
export function GetChangeBaseOfDigitsOptimizedBaseSumBufferSafeSize(input: Uint8Array, base: number, newBase: number): number {
  return GetChangeBaseOfDigitsOptimizedBaseShiftBufferSafeSize(input, base, newBase);
}

/**
 * Returns a compliant size for argument 'sumBuffer' of ChangeBaseOfDigitsOptimized
 * Equivalent of GetChangeBaseOfDigitsOptimizedBaseSumBufferSafeSize but with 'baseShift' as first param
 */
export function GetChangeBaseOfDigitsOptimizedBaseSumBufferSafeSizeFromBaseShift(baseShift: Uint8Array): number {
  return baseShift.length;
}

/**
 * Creates a digits list for argument 'sumBuffer' of ChangeBaseOfDigitsOptimized.
 */
export function CreateSumBufferForChangeBaseOfDigitsOptimized(input: Uint8Array, base: number, newBase: number): Uint32Array {
  return new Uint32Array(GetChangeBaseOfDigitsOptimizedBaseSumBufferSafeSize(input, base, newBase));
}

/**
 * Creates a digits list for argument 'sumBuffer' of ChangeBaseOfDigitsOptimized.
 * Equivalent of CreateSumBufferForChangeBaseOfDigitsOptimized but with 'baseShift' as first param
 */
export function CreateSumBufferFromBaseShiftForChangeBaseOfDigitsOptimized(baseShift: Uint8Array): Uint32Array {
  return new Uint32Array(GetChangeBaseOfDigitsOptimizedBaseSumBufferSafeSizeFromBaseShift(baseShift));
}




/**
 * Returns a compliant size for argument 'buffer' of ChangeBaseOfDigitsOptimized
 */
export function GetChangeBaseOfDigitsOptimizedBufferSafeSize(input: Uint8Array, base: number, newBase: number): number {
  return GetChangeBaseOfDigitsOptimizedBaseShiftBufferSafeSize(input, base, newBase) + GetNumberToDigitsMinLength(input.length, newBase);
}


/**
 * Returns a compliant size for argument 'buffer' of ChangeBaseOfDigitsOptimized
 * Equivalent of GetChangeBaseOfDigitsOptimizedBufferSafeSize but with 'baseShiftBuffer' as second param
 */
export function ChangeBaseOfDigitsBufferSafeSizeFromBaseShiftBuffer(input: Uint8Array, baseShiftBuffer: Uint8Array, newBase: number): number {
  return GetMultiplyDigitsByPrimitiveNumberBufferSafeSize(baseShiftBuffer, newBase, input.length);
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
 */
export function ChangeBaseOfDigits(buffer: Uint8Array, input: Uint8Array, base: number, newBase: number): Uint8Array {
  if (base === newBase) {
    return CopyBufferContent(buffer, input);
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
 */
export function ChangeBaseOfDigitsWithAutoBuffer(input: Uint8Array, base: number, newBase: number): Uint8Array {
  if (base === newBase) {
    return input;
  } else {
    const baseShift: Uint8Array = CreateBaseShiftForChangeBaseOfDigitsOptimized(input, base, newBase);
    const baseShiftBuffer: Uint8Array = CreateBaseShiftBufferFromBaseShiftForChangeBaseOfDigitsOptimized(baseShift, base, newBase);
    const sumBuffer: Uint32Array = CreateSumBufferFromBaseShiftForChangeBaseOfDigitsOptimized(baseShift);

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
  const baseShift: Uint8Array = CreateBaseShiftForChangeBaseOfDigitsOptimized(input, base, newBase);
  const baseShiftBuffer: Uint8Array = CreateBaseShiftBufferFromBaseShiftForChangeBaseOfDigitsOptimized(baseShift, base, newBase);
  const sumBuffer: Uint32Array = CreateSumBufferFromBaseShiftForChangeBaseOfDigitsOptimized(baseShift);

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
 * ~O(N**2)
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
      AddTwoDigits( // buffer += (base ** i) * input[i] (newBase)
        buffer,
        buffer,
        MultiplyDigitsByPrimitiveNumberOptimized( // (base ** i) * input[i] (newBase)
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
    MultiplyDigitsByPrimitiveNumberOptimized(
      baseShift,
      baseShift,
      newBase,
      base,
      sumBuffer,
    );
  }

  return RemoveDigitsLeadingZeroes(buffer);
  // return buffer;
}
