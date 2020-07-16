
// function ArrayChunkCopy(
//   input: number[],
//   start: number = 0,
//   end: number = input.length,
//   offset: number = 0,
//   output: number[] = []
// ) {
//   if (output === input) {
//     const length: number = input.length;
//     output.length = length;
//     for (let i = 0; i < length; i++) {
//       output[i] = input[i];
//     }
//   } else {
//     output.length = offset + end - start;
//     let j: number = offset;
//     for (let i = start; i < end; i++, j++) {
//       output[j] = input[i];
//     }
//   }
//   return output;
// }


export class DigitsOperations {

  static numberToChar: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  static charToNumber: { [key: string]: number } = (() => {
    const output: { [key: string]: number } = Object.create(null);
    for (let i = 0, l = DigitsOperations.numberToChar.length; i < l; i++) {
      output[DigitsOperations.numberToChar[i]] = i;
    }
    return output;
  })();


  /* NORMALIZATION */

  static normalizeBase(base: number, max: number = 256, digits: number[] = []): number {
    base = Number(base);
    if (Number.isNaN(base)) {
      throw new TypeError(`Expected number as base`);
    } else if (base < 1) {
      throw new RangeError(`Expected base greater or equals to 1`);
    } else if (base > max) {
      throw new RangeError(`Expected base lower or equals to ${max}`);
    } else {
      base = Math.floor(base);
      let digit: number;
      for (let i = 0, l = digits.length; i < l; i++) {
        digit = digits[i];
        if (digit >= base) {
          throw new RangeError(`Expected base greater than digits[${i}] = ${digit}`);
        }
      }
      return base;
    }
  }

  static normalizeDigits(digits: number[], base: number): number[] {
    if (Array.isArray(digits)) {
      const length: number = digits.length;
      if (length < 1) {
        throw new TypeError(`Expected a minimal length of 1 for digits`);
      } else {
        let digit: number;
        for (let i = 0; i < length; i++) {
          digit = Number(digits[i]);
          if (Number.isNaN(digit)) {
            throw new TypeError(`Expected number as digits[${i}]`);
          } else if (digit < 0) {
            throw new RangeError(`Expected number greater or equals to 0 as digits[${i}]`);
          } else if (digit >= base) {
            throw new RangeError(`Expected number lower to ${base} as digits[${i}]`);
          } else {
            digits[i] = Math.floor(digit);
          }
        }
        return digits;
      }
    } else {
      throw new TypeError(`Expected number[] as digits`);
    }
  }


  /* INITIALIZATION */

  static random(size: number, base: number, output: Uint8Array = new Uint8Array(size)): Uint8Array {
    for (let i = 0; i < size; i++)  {
      output[i] = Math.floor(Math.random() * base);
    }
    return output;
  }



  /* CONVERSION */

  /**
   * Converts an integer number to a list of digits according to a specific base
   * @param {number} input - positive integer
   * @param {number} base - positive integer, min 1
   * @param {number[]} output
   * @return {number[]}
   */
  static numberToDigits(input: number, base: number, output: Uint8Array = new Uint8Array()): number[] {
    output.length = 0;
    do {
      output.push(input % base);
      input = Math.floor(input / base);
    } while (input !== 0);
    return output;
  }

  /**
   * Converts a list of digits to an integer number
   * @param {number[]} input
   * @param {number} base
   * @return {number}
   */
  static digitsToNumber(input: number[], base: number): number {
    let number: number = 0;
    for (let i = 0, l = input.length; i < l; i++) {
      number += input[i] * Math.pow(base, i);
    }
    return number;
  }


  /**
   * Converts a string to a list of digits
   * @param {string} input
   * @param {object} digits
   * @param {number[]} output
   * @return {number[]}
   */
  static stringToDigits(
    input: string,
    digits: { [key: string]: number } = DigitsOperations.charToNumber,
    output: number[] = []
  ): number[] {
    const parts: string[] = Array.from(input);
    output.length = 0;
    for (let i = parts.length - 1; i >= 0; i--) {
      output.push(digits[parts[i]]);
    }
    return output;
  }

  /**
   * Converts a list of digits to a string
   * @param {number[]} input
   * @param {string[]} digits
   * @return {string}
   */
  static digitsToString(input: number[], digits: string[] = DigitsOperations.numberToChar): string {
    let output: string = '';
    for (let i = input.length - 1; i >= 0; i--) {
      output += digits[input[i]];
    }
    return output;
  }



  /**
   * Puts input's digits into output
   * @param {number[]} input
   * @param {number[]} output
   * @return {number[]}
   */
  static setDigits(input: number[], output: number[] = []): number[] {
    if (output !== input) {
      const length: number = input.length;
      output.length = length;
      for (let i = 0; i < length; i++) {
        output[i] = input[i];
      }
    }
    return output;
  }


  /* COMPARISION */

  /**
   * Returns true if digits are all null
   * @param {number[]} input
   * @return {boolean}
   */
  static areDigitsNull(input: number[]): boolean {
    for (let i = 0, l = input.length; i < l; i++) {
      if (input[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns true if digits are equal
   * @param {number[]} a
   * @param {number[]} b
   * @return {boolean}
   */
  static digitsEqual(a: number[], b:  number[]): boolean {
    const la: number = a.length;
    const lb: number = b.length;
    const minLength: number = Math.min(la, lb);

    let i: number = 0;
    for (; i < minLength; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    for (; i < la; i++) {
      if (a[i] !== 0) {
        return false;
      }
    }

    for (; i < lb; i++) {
      if (b[i] !== 0) {
        return false;
      }
    }

    return true;
  }



  /**
   * Removes unnecessary zeros
   * @param {number[]} input
   * @param {number[]} output
   * @return {number[]}
   */
  static reduceDigits(input: number[], output:  number[] = []): number[] {
    let i: number = input.length - 1;
    for (; i > 0; i--) { // strictly greater than 0 because we want at least one digit
      if (input[i] !== 0) {
        break;
      }
    }
    i++; // the reduced length

    if (input === output) {
      output.length = i;
    } else {
      for (let j = 0; j < i; j++) {
        output[j] = input[j];
      }
      output.length = i;
    }
    return output;
  }


  /* BITWISE OPERATIONS */

  /**
   * Shifts input's digits by 'offset'
   * @param {number[]} input
   * @param {number} offset
   * @param {number[]} output
   * @return {number[]}
   */
  static shiftDigits(input: number[], offset: number, output: number[] = []): number[] {
    if (offset > 0) {
      for (let i = input.length - 1; i >= 0; i--) {
        output[i + offset] = input[i];
      }

      for (let i = 0; i < offset; i++) {
        output[i] = 0;
      }
      output.length = input.length + offset;
    } else {
      const absOffset: number = Math.abs(offset);
      const length: number = input.length - absOffset;
      for (let i = 0; i < length; i++) {
        output[i] = input[i + absOffset];
      }
      output.length = length;
    }
    return output;
  }


  /* ARITHMETIC OPERATIONS */

  static addNumber(input: number[], base: number, number: number, offset: number = 0, output: number[] = []): number[] {
    const length: number = input.length;
    do {
      if (offset < length) {
        number += input[offset];
      }
      output[offset++] = number % base;
      number = Math.floor(number / base);
    } while (number !== 0);

    // TODO => add missing value if output !== input
    return output;
  }

  static uaddNumber(
    input: Uint8Array,
    base: number,
    number: number,
    offset: number = 0,
    output: Uint8Array = new Uint8Array(Math.max(offset, input.length) + Math.round(Math.log(number) / Math.log(base)))
  ): Uint8Array {
    if (output !== input) {
      output.set(input);
    }
    const length: number = input.length;
    do {
      if (offset < length) {
        number += input[offset];
      }
      output[offset++] = number % base;
      number = Math.floor(number / base);
    } while (number !== 0);

    return output.subarray(0, Math.max(offset, input.length));
  }

  static addDigits(inputs: number[][], base: number, output: number[] = []): number[] {
    let number: number = 0;
    let index: number = 0;
    const length: number = inputs.length;
    const lengths: number[] = new Array(length);

    for (let i = 0; i < length; i++) {
      lengths[i] = inputs[i].length;
    }

    loop: do {
      for (let i = 0; i < length; i++) {
        if (index < lengths[i]) {
          number += inputs[i][index];
        }
      }
      output[index++] = number % base;
      number = Math.floor(number / base);

      for (let i = 0; i < length; i++) {
        if (index < lengths[i]) {
          continue loop;
        }
      }
      break;
    } while (true);

    while (number !== 0) {
      output[index++] = number % base;
      number = Math.floor(number / base);
    }

    output.length = index;

    return output;
  }


  // DEPRECATED ?
  /**
   * Does the sum of two positive digit numbers.
   * @param {number[]} a
   * @param {number[]} b
   * @param {number} base
   * @param {number[]} output
   * @return {number[]}
   */
  static addTwoDigits(a: number[], b: number[], base: number, output: number[] = []): number[] {
    const length_a: number = a.length;
    const length_b: number = b.length;

    let remainder: number = 0;
    let index: number = 0;

    // let hasDigits: boolean;
    //
    // do {
    //   hasDigits = false;
    //   if (index < length_a) {
    //     remainder += a[index];
    //     hasDigits = true;
    //   }
    //   if (index < length_b) {
    //     remainder += b[index];
    //     hasDigits = true;
    //   }
    //
    //   if (remainder >= base) {
    //     output[index++] = remainder - base;
    //     remainder = 1;
    //   } else {
    //     output[index++] = remainder;
    //     remainder = 0;
    //   }
    //
    //   // remainder += ((index < length_a) ? a[index] : 0)
    //   //   + ((index < length_b) ? b[index] : 0);
    //
    // } while (hasDigits);
    //
    // if (remainder !== 0) {
    //   output[index++] = remainder;
    // }

    // do {
    //   remainder += ((index < length_a) ? a[index] : 0)
    //     + ((index < length_b) ? b[index] : 0);
    //
    //   if (remainder >= base) {
    //     output[index] = remainder - base;
    //     remainder = 1;
    //   } else {
    //     output[index] = remainder;
    //     remainder = 0;
    //   }
    //   index++;
    // } while ((remainder !== 0) || (index < length_a) || (index < length_b));

    do {
      let digit: number = ((index < length_a) ? a[index] : 0)
        + ((index < length_b) ? b[index] : 0)
        + remainder;

      if (digit >= base) {
        digit -= base;
        remainder = 1;
      } else {
        remainder = 0;
      }

      output[index++] = digit;
    } while ((index < length_a) || (index < length_b) || (remainder !== 0));

    output.length = index;

    return output;
  }

  /**
   * Multiplies two positive digit numbers.
   * @param {number[]} a
   * @param {number[]} b
   * @param {number} base
   * @param {number[]} output
   * @return {number[]}
   */
  static multiplyTwoDigits(a: number[], b: number[], base: number, output: number[] = []): number[] {
    // limits => max digits of b = uint32 / base. Ex: (2**32) / 10
    const length_a: number = a.length;
    const length_b: number = b.length;

    if (a === output) {
      a = a.slice();
    } else if (b === output) {
      b = b.slice();
    }

    output.length = 0;

    for (let index_b = 0; index_b < length_b; index_b++) { // for each digits in b
      const value_b: number = b[index_b];
      for (let index_a = 0; index_a < length_a; index_a++) { // for each digits in a
        let index: number = index_a + index_b;
        output[index] = (output[index] || 0) + (value_b * a[index_a]);
        // this.addNumber(output, base, value_b * a[index_a], index_a + index_b, output);
      }
    }

    let number: number = 0;
    let i: number = 0;
    const length: number = output.length;
    while (i < length) {
      number += output[i]/* || 0*/;
      output[i++] = number % base;
      number = Math.floor(number / base);
    }

    while (number !== 0) {
      output[i++] = number % base;
      number = Math.floor(number / base);
    }

    return output;
  }


  static umultiplyTwoDigits(a: Uint8Array, b: Uint8Array, base: number, output?: Uint8Array): Uint8Array {
    // limits => max digits of b = uint32 / base. Ex: (2**32) / 10
    const length_a: number = a.length;
    const length_b: number = b.length;
    const maxLength: number = length_a + length_b;

    let buffer: Uint32Array;
    if (output === void 0) {
      buffer = new Uint32Array(maxLength);
      output = new Uint8Array(maxLength);
    } else {
      // if (output.length < maxLength) {
      //   throw new TypeError(`Expected min length of ${maxLength} for output`);
      // }
      buffer = new Uint32Array(output);
    }


    for (let index_b = 0; index_b < length_b; index_b++) { // for each digits in b
      const value_b: number = b[index_b];
      for (let index_a = 0; index_a < length_a; index_a++) { // for each digits in a
        let index: number = index_a + index_b;
        buffer[index] += (value_b * a[index_a]);
      }
    }

    const length: number = maxLength - 1;
    let number: number = 0;
    let i: number = 0;
    while (i < length) {
      number += buffer[i];
      output[i++] = number % base;
      number = Math.floor(number / base);
    }

    while (number !== 0) {
      output[i++] = number % base;
      number = Math.floor(number / base);
    }

    return output.subarray(0, i);
  }

  static multiplyTwoDigits_old2(a: number[], b: number[], base: number, output: number[] = []): number[] {
    const length_a: number = a.length;
    const length_b: number = b.length;

    if (a === output) {
      a = a.slice();
    } else if (b === output) {
      b = b.slice();
    }

    output.length = 0;

    for (let index_b = 0; index_b < length_b; index_b++) { // for each digits in b
      const value_b: number = b[index_b];

      for (let index_a = 0; index_a < length_a; index_a++) { // for each digits in a
        this.addNumber(output, base, value_b * a[index_a], index_a + index_b, output);
      }
    }

    return output;
  }

  // DEPRECATED
  /**
   * Multiplies two positive digit numbers.
   * @param {number[]} a
   * @param {number[]} b
   * @param {number} base
   * @param {number[]} output
   * @return {number[]}
   */
  static multiplyTwoDigits_old1(a: number[], b: number[], base: number, output: number[] = []): number[] {
    const length_a: number = a.length;
    const length_b: number = b.length;

    // if (length_b > length_a) { // for faster computation
    //   return this.multiplyTwoDigits(b, a, base, output);
    // } else {

      if (a === output) {
        a = a.slice();
      } else if (b === output) {
        b = b.slice();
      }

      output.length = 0;

      for (let index_b = 0; index_b < length_b; index_b++) { // for each digits in b

        let remainder: number = 0;
        const value_b: number = b[index_b];
        const line: number[] = [];

        for (let index_a = 0; index_a < index_b; index_a++) { // offset digits of line by index_b
          line.push(0);
        }

        for (let index_a = 0; index_a < length_a; index_a++) { // for each digits in a
          let digit: number = value_b * a[index_a] + remainder;
          if (digit >= base) {
            digit -= base;
            remainder = 1;
          } else {
            remainder = 0;
          }
          line.push(digit);
        }

        if (remainder !== 0) {
          line.push(remainder);
        }

        // this.addDigits([output, line], base, output);
        this.addTwoDigits(output, line, base, output);
      }

      return output;
    // }
  }

  /**
   * Changes the base of a digits number
   * @param {number[]} input
   * @param {number} base
   * @param {number} newBase
   * @param {number[]} output
   * @return {number[]}
   */
  static changeBaseOfDigits(input: number[], base: number, newBase: number, output: number[] = []): number[] {
    if (input === output) {
      input = input.slice();
    }
    output.length = 0;

    const digits_factor: number[] = [1];
    const digits_base: number[] = this.numberToDigits(base, newBase);

    for (let i = 0, l = input.length; i < l; i++) {
      // console.log(`${input[i]} x ${base}^${i} = ${input[i] * (base ** i)}`);
      // console.log('digits_factor', digits_factor.join(', '));
      this.addTwoDigits(output, this.multiplyTwoDigits([input[i]], digits_factor, newBase), newBase, output);
      // console.log('output', output.join(', '), );
      this.multiplyTwoDigits(digits_factor, digits_base, newBase, digits_factor); // update digits_factor
    }

    return output;
  }


  /**
   * Sets values of input into output
   * @param {BigInteger} input
   * @param {BigInteger} output
   * @return {BigInteger}
   */
  static set(input: BigInteger, output: BigInteger = new BigInteger()): BigInteger {
    (output as any)._digits = (input as any)._digits.slice();
    (output as any)._negative = (input as any)._negative;
    (output as any)._base = (input as any)._base;
    return output;
  }

  static add(inputs: BigInteger[]): BigInteger {  // TODO handle negative
    if (inputs.length < 2) {
      throw new Error(`Expected at least 2 inputs`);
    }

    const output: BigInteger = inputs[0].clone();
    const base: number = (output as any)._base;

    for (let i = 1, l = inputs.length; i < l; i++) {
      const input: BigInteger = inputs[i];
      if ((input as any)._base !== base) {
        throw new Error(`Numbers must have the same base: ${(input as any)._base} !== ${base}`);
      }

      let remainder: number = 0;
      let j: number = 0;
      const l1: number = (output as any)._digits.length;
      const l2: number = (input as any)._digits.length;

      while ((remainder !== 0) || (j < l1) || (j < l2)) {
        let digit: number = ((j < l1) ? (output as any)._digits[j] : 0)
          + ((j < l2) ? (input as any)._digits[j] : 0)
          + remainder;

        if (digit >= base) {
          digit -= base;
          remainder = 1;
        } else {
          remainder = 0;
        }

        (output as any)._digits[j] = digit;
        j++;
      }
    }

    return output;
  }

  /**
   * Multiplies N BigIntegers together
   * @param {BigInteger[]} inputs
   * @param {BigInteger} output
   * @return {BigInteger}
   */
  static multiply(inputs: BigInteger[], output: BigInteger = new BigInteger()): BigInteger {
    if (inputs.length < 1) {
      throw new Error(`Expected at least 1 inputs`);
    }

    this.set(inputs[0], output);

    for (let i = 1, l = inputs.length; i < l; i++) {
      this.multiplyTwo(output, inputs[i], output);
    }
    return output;
  }

  /**
   * Multiplies two BigIntegers
   * @param {BigInteger} a
   * @param {BigInteger} b
   * @param {BigInteger} output
   * @return {BigInteger}
   */
  static multiplyTwo(a: BigInteger, b: BigInteger, output: BigInteger = new BigInteger()): BigInteger {
    if ((a as any)._base !== (b as any)._base) {
      throw new Error(`Numbers must have the same base: ${(a as any)._base} !== ${(b as any)._base}`);
    }

    this.multiplyTwoDigits((a as any)._digits, (b as any)._digits, (a as any)._base, (output as any)._digits);
    (output as any)._negative = (a as any)._negative !== (b as any)._negative;
    (output as any)._base = (a as any)._base;

    return output;
  }


  static pow(a: BigInteger, b: number): BigInteger {
    // console.log(new Array(b).fill(a).length);
    if (b === 0) {
      return new BigInteger([1], false, (a as any)._base);
    } else if (b === 1) {
      return a.clone();
    } else {
      return this.multiply(new Array(b).fill(a));
    }
  }

  /***
   * Changes the base of a BigInteger
   * https://mathbits.com/MathBits/CompSci/Introduction/tobase10.htm
   *
   * @param {BigInteger} input
   * @param {number} base
   * @param {BigInteger} output
   * @return {BigInteger}
   */
  static toBase(input: BigInteger, base: number, output: BigInteger = new BigInteger()): BigInteger { // TODO continue here
    (output as any)._base = base;
    (output as any)._negative = (input as any)._negative;
    this.changeBaseOfDigits((input as any)._digits, (input as any)._base, base, (output as any)._digits);
    return output;
  }
}


export class BigInteger {
  static maxBase: number = 256;

  /**
   * Converts a number to a BigInteger
   * @param {number} input
   * @param {number} base
   * @param {BigInteger} output
   * @return {BigInteger}
   */
  static fromNumber(input: number, base: number = 10, output: BigInteger = new BigInteger()): BigInteger {
    output._negative = input < 0;
    output._base = DigitsOperations.normalizeBase(base, BigInteger.maxBase);
    DigitsOperations.numberToDigits(Math.floor(Math.abs(input)), base, output._digits);
    return output;
  }

  /**
   * Converts a string to a BigInteger
   * @param {string} input
   * @param {number} base
   * @param {BigInteger} output
   * @return {BigInteger}
   */
  static fromString(input: string, base: number = 10, output: BigInteger = new BigInteger()): BigInteger {
    if (input.startsWith('-')) {
      output._negative = true;
      input = input.substring(1);
    } else {
      output._negative = true;
    }
    output._base = DigitsOperations.normalizeBase(base, BigInteger.maxBase);
    output._digits = DigitsOperations.normalizeDigits(DigitsOperations.stringToDigits(input), output._base);
    return output;
  }


  static random(size: number, base: number = 10, output: BigInteger = new BigInteger()): BigInteger {
    output._base = DigitsOperations.normalizeBase(base, BigInteger.maxBase);
    DigitsOperations.random(size, output._base, output._digits);
    return output;
  }


  static clone(input: BigInteger, output: BigInteger = new BigInteger()): BigInteger {
    output._negative = input._negative;
    output._base = input._base;
    DigitsOperations.setDigits(input._digits, output._digits);
    return output;
  }

  static equals(a: BigInteger, b: BigInteger): boolean {
    if (a._base !== b._base) {
      throw new Error(`Numbers must have the same base: ${a._base} !== ${b._base}`);
    }

    return DigitsOperations.digitsEqual(a._digits, b._digits);
  }

  static shift(input: BigInteger, offset: number, output: BigInteger = new BigInteger()): BigInteger {
    if (input._base !== output._base) {
      throw new Error(`Numbers must have the same base: ${input._base} !== ${output._base}`);
    }

    DigitsOperations.shiftDigits(input._digits, offset, output._digits);
    return output;
  }


  protected _digits: number[];
  protected _negative: boolean;
  protected _base: number;

  constructor(digits: number[] = [0], negative: boolean = false, base: number = 10) {
    this.negative = negative;
    this._base = DigitsOperations.normalizeBase(base, BigInteger.maxBase);
    this._digits = DigitsOperations.normalizeDigits(digits, this._base);
  }

  get digits(): number[] {
    return this._digits.slice();
  }

  set digits(input: number[]) {
    this._digits = DigitsOperations.normalizeDigits(input, this._base);
  }


  get base(): number {
    return this._base;
  }

  set base(input: number) {
    this._base = DigitsOperations.normalizeBase(input, BigInteger.maxBase, this._digits);
  }


  get negative(): boolean {
    return this._negative;
  }

  set negative(input: boolean) {
    this._negative = Boolean(input);
  }

  get sign(): number {
    return this._negative ? -(this.isNull() ? 0 : 1) : (this.isNull() ? 0 : 1);
  }


  isNull(): boolean {
    return DigitsOperations.areDigitsNull(this._digits);
  }

  reduce(): this {
    DigitsOperations.reduceDigits(this._digits, this._digits);
    return this;
  }

  clone(output?: BigInteger): BigInteger {
    return BigInteger.clone(this, output);
  }

  equals(input: BigInteger): boolean {
    return BigInteger.equals(this, input);
  }

  shift(offset: number, output?: BigInteger): BigInteger {
    return BigInteger.shift(this, offset, output);
  }


  // TODO
  plus(...inputs: BigInteger[]): BigInteger {
    return BigInteger.add([this as BigInteger].concat(inputs));
  }

  // TODO
  times(...inputs: BigInteger[]): BigInteger {
    return BigInteger.multiply([this as BigInteger].concat(inputs));
  }

  // experimental, accept only positive integer
  pow(input: number): BigInteger {
    return BigInteger.pow(this, input);
  }


  // TODO
  toBase(base: number): BigInteger {
    return BigInteger.toBase(this, base);
  }


  toNumber(): number {
    const number: number = DigitsOperations.digitsToNumber(this._digits, this._base);
    return this._negative ? -number : number;
  }

  toString(digits?: string[]): string {
    const output: string = DigitsOperations.digitsToString(this._digits, digits);
    return this._negative ? ('-' + output) : output;
  }

}

