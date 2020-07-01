import { BigInteger, CreateRandomUint8Array } from './BigInteger';
import { DigitsCompare, DigitsEqual, DigitsGreater, DigitsGreaterOrEqual, DigitsLower } from './DigitsComparision';
import { Add2Digits, Add2DigitsBufferSafeSize, AddPrimitiveNumberToDigits, AddPrimitiveNumberToDigitsBufferSafeSize, Div2Digits, Div2DigitsQuotientBufferSafeSize, Div2DigitsRemainderBufferSafeSize, DivDigitsByPrimitiveNumber, DivDigitsByPrimitiveNumberBufferSafeSize, Mul2Digits, Mul2DigitsBufferSafeSize, MulDigitsByPrimitiveNumber, MulDigitsByPrimitiveNumberBufferSafeSize, Sub2DigitsBufferSafeSize, Sub2DigitsOrdered } from './DigitsArithmetic';
import { DigitsToNumber, NumberSize, NumberToDigits } from './DigitsConversion';


async function testBigIntConversion(helper: any) {

  function testNumber() {
    if (!helper.fail(() => BigInteger.fromNumber(10, -1))) {
      throw new Error(`fail - BigInteger.fromNumber(10, -1)`);
    }

    if (!helper.compareAny(BigInteger.fromNumber(10, 2).digits, new Uint8Array([0, 1, 0, 1]))) {
      throw new Error(`BigInteger.fromNumber(10, 2).digits !== [0, 1, 0, 1]`);
    }

    if (new BigInteger(new Uint8Array([3, 2, 1])).toNumber() !== 123) {
      throw new Error(`new BigInteger([3, 2, 1]).toNumber() !== 123`);
    }

    if (new BigInteger(new Uint8Array([3, 2, 1]), true).toNumber() !== -123) {
      throw new Error(`new BigInteger([3, 2, 1], true).toNumber() !== -123`);
    }

    if (BigInteger.fromNumber(123).toNumber() !== 123) {
      throw new Error(`BigInteger.fromNumber(123).toNumber() !== 123`);
    }

    if (BigInteger.fromNumber(-123).toNumber() !== -123) {
      throw new Error(`BigInteger.fromNumber(-123).toNumber() !== -123`);
    }
  }

  function testString() {
    if (!helper.fail(() => BigInteger.fromString('10', -1))) {
      throw new Error(`fail - BigInteger.fromString('10', -1)`);
    }

    if (!helper.fail(() => BigInteger.fromString('24', 2))) {
      throw new Error(`fail - BigInteger.fromString('24', 2)`);
    }


    if (!helper.compareAny(BigInteger.fromString('1010', 2).digits, new Uint8Array([0, 1, 0, 1]))) {
      throw new Error(`BigInteger.fromString('1010', 2).digits !== [0, 1, 0, 1]`);
    }

    if (new BigInteger(new Uint8Array([2, 1])).toString() !== '12') {
      throw new Error(`new BigInteger([2, 1]).toString() !== '12'`);
    }

    if (new BigInteger(new Uint8Array([3, 2, 1]), true).toString() !== '-123') {
      throw new Error(`new BigInteger([3, 2, 1]).toString() !== '-123'`);
    }
  }

  function testRandom() {
    for (let i = 0; i < 1000; i++) {
      const a: number =  Math.floor(Math.random() * 1e3) * (((Math.random() * 2) < 1) ? 1 : -1);

      if (BigInteger.fromNumber(a).toNumber() !== a) {
        throw new Error(`BigInteger.fromNumber(${a}).toNumber() !== ${a}`);
      }

      const b: string = String(a);
      if (BigInteger.fromString(b).toString() !== b) {
        throw new Error(`BigInteger.fromString('${b}').toString() !== '${b}'`);
      }
    }
  }

  testNumber();
  testString();
  testRandom();
}

async function testBigIntShift(helper: any) {
  if (new BigInteger(new Uint8Array([3, 2, 1])).shift(2).toString() !== '12300') {
    throw new Error(`new BigInteger([3, 2, 1]).shift(2).toString() !== '12300'`);
  }

  if (new BigInteger(new Uint8Array([5, 4, 3, 2, 1])).shift(-2).toString() !== '123') {
    throw new Error(`new BigInteger([5, 4, 3, 2, 1]).shift(-2).toString() !== '123'`);
  }
}

async function testDigitsComparision(helper: any) {

  function testDigitsCompare() {
    if (DigitsCompare(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1])) !== 0) {
      throw new Error(`DigitsCompare(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1])) !== 0`);
    }

    if (DigitsCompare(new Uint8Array([2, 2, 1]), new Uint8Array([3, 2, 1])) !== -1) {
      throw new Error(`DigitsCompare(new Uint8Array([2, 2, 1]), new Uint8Array([3, 2, 1])) !== -1`);
    }

    if (DigitsCompare(new Uint8Array([4, 2, 1]), new Uint8Array([3, 2, 1])) !== 1) {
      throw new Error(`DigitsCompare(new Uint8Array([4, 2, 1]), new Uint8Array([3, 2, 1])) !== 1`);
    }

  }

  function testDigitsEqual() {
    if (!DigitsEqual(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsEqual(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (DigitsEqual(new Uint8Array([3, 2, 1]), new Uint8Array([3, 3, 1]))) {
      throw new Error(`DigitsEqual(new Uint8Array([3, 2, 1]), new Uint8Array([3, 3, 1]))`);
    }
  }

  function testDigitsGreater() {
    if (DigitsGreater(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreater(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (DigitsGreater(new Uint8Array([3, 1, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreater(new Uint8Array([3, 1, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (!DigitsGreater(new Uint8Array([3, 3, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreater(new Uint8Array([3, 3, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (DigitsGreater(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 1]))) {
      throw new Error(`DigitsGreater(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 1]))`);
    }

    if (!DigitsGreater(new Uint8Array([3, 2, 1, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreater(new Uint8Array([3, 2, 1, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (DigitsGreater(new Uint8Array([3, 2, 1, 0]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreater(new Uint8Array([3, 2, 1, 0]), new Uint8Array([3, 2, 1]))`);
    }

    if (DigitsGreater(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 0]))) {
      throw new Error(`DigitsGreater(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 0]))`);
    }

    if (!DigitsGreater(new Uint8Array([3, 3, 1, 0]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreater(new Uint8Array([3, 3, 1, 0]), new Uint8Array([3, 2, 1]))`);
    }

    if (!DigitsGreater(new Uint8Array([3, 3, 1, 0]), new Uint8Array([3, 2, 1, 0]))) {
      throw new Error(`DigitsGreater(new Uint8Array([3, 3, 1, 0]), new Uint8Array([3, 2, 1, 0]))`);
    }
  }

  function testDigitsGreaterOrEqual() {
    if (!DigitsGreaterOrEqual(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreaterOrEqual(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (DigitsGreaterOrEqual(new Uint8Array([3, 1, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreaterOrEqual(new Uint8Array([3, 1, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (!DigitsGreaterOrEqual(new Uint8Array([3, 3, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreaterOrEqual(new Uint8Array([3, 3, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (DigitsGreaterOrEqual(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 1]))) {
      throw new Error(`DigitsGreaterOrEqual(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 1]))`);
    }

    if (!DigitsGreaterOrEqual(new Uint8Array([3, 2, 1, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreaterOrEqual(new Uint8Array([3, 2, 1, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (!DigitsGreaterOrEqual(new Uint8Array([3, 2, 1, 0]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreaterOrEqual(new Uint8Array([3, 2, 1, 0]), new Uint8Array([3, 2, 1]))`);
    }

    if (!DigitsGreaterOrEqual(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 0]))) {
      throw new Error(`DigitsGreaterOrEqual(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 0]))`);
    }

    if (!DigitsGreaterOrEqual(new Uint8Array([3, 3, 1, 0]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsGreaterOrEqual(new Uint8Array([3, 3, 1, 0]), new Uint8Array([3, 2, 1]))`);
    }

    if (!DigitsGreaterOrEqual(new Uint8Array([3, 3, 1, 0]), new Uint8Array([3, 2, 1, 0]))) {
      throw new Error(`DigitsGreaterOrEqual(new Uint8Array([3, 3, 1, 0]), new Uint8Array([3, 2, 1, 0]))`);
    }
  }

  function testDigitsLower() {
    if (DigitsLower(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsLower(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (!DigitsLower(new Uint8Array([3, 1, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsLower(new Uint8Array([3, 1, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (DigitsLower(new Uint8Array([3, 3, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsLower(new Uint8Array([3, 3, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (!DigitsLower(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 1]))) {
      throw new Error(`DigitsLower(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 1]))`);
    }

    if (DigitsLower(new Uint8Array([3, 2, 1, 1]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsLower(new Uint8Array([3, 2, 1, 1]), new Uint8Array([3, 2, 1]))`);
    }

    if (DigitsLower(new Uint8Array([3, 2, 1, 0]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsLower(new Uint8Array([3, 2, 1, 0]), new Uint8Array([3, 2, 1]))`);
    }

    if (DigitsLower(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 0]))) {
      throw new Error(`DigitsLower(new Uint8Array([3, 2, 1]), new Uint8Array([3, 2, 1, 0]))`);
    }

    if (!DigitsLower(new Uint8Array([3, 1, 1, 0]), new Uint8Array([3, 2, 1]))) {
      throw new Error(`DigitsLower(new Uint8Array([3, 1, 1, 0]), new Uint8Array([3, 2, 1]))`);
    }

    if (!DigitsLower(new Uint8Array([3, 1, 1, 0]), new Uint8Array([3, 2, 1, 0]))) {
      throw new Error(`DigitsLower(new Uint8Array([3, 1, 1, 0]), new Uint8Array([3, 2, 1, 0]))`);
    }
  }

  function testRandom() {
    for (let i = 0; i < 1000; i++) {
      const a: number = Math.floor(Math.random() * 1e3); // [0, 1000]
      const b: number = ((Math.random() * 10) < 9) ? Math.floor(Math.random() * 1e3) : a; // [0, 1000] (90%), a (10%)
      const _a: Uint8Array = NumberToDigits(new Uint8Array(NumberSize(a, 10)), a, 10);
      const _b: Uint8Array = NumberToDigits(new Uint8Array(NumberSize(b, 10)), b, 10);

      if (a > b) {
        if (!DigitsGreater(_a, _b)) {
          throw new Error(`[${_a.join(', ')}] (${a}) !> [${_b.join(', ')}] (${b})`);
        }
        if (DigitsLower(_a, _b)) {
          throw new Error(`[${_a.join(', ')}] (${a}) < [${_b.join(', ')}] (${b})`);
        }
      } else if (a < b) {
        if (DigitsGreater(_a, _b)) {
          throw new Error(`[${_a.join(', ')}] (${a}) > [${_b.join(', ')}] (${b})`);
        }
        if (!DigitsLower(_a, _b)) {
          throw new Error(`[${_a.join(', ')}] (${a}) !< [${_b.join(', ')}] (${b})`);
        }
      } else {
        if (!DigitsEqual(_a, _b)) {
          throw new Error(`[${_a.join(', ')}] (${a}) !== [${_b.join(', ')}] (${b})`);
        }
      }
    }
  }


  testDigitsCompare();
  testDigitsEqual();
  testDigitsGreater();
  testDigitsGreaterOrEqual();
  testDigitsLower();

  testRandom();

}

async function testBigIntComparision(helper: any) {

  function testRandom() {
    for (let i = 0; i < 1000; i++) {
      const a: number = Math.floor(Math.random() * 1e3) * (((Math.random() * 2) < 1) ? 1 : -1); // [-1000, 1000]
      const b: number = (((Math.random() * 10) < 9) ? Math.floor(Math.random() * 1e3) : a) * (((Math.random() * 2) < 1) ? 1 : -1); // [-1000, 1000] (90%), a or -a (10%)
      const _a: BigInteger = BigInteger.fromNumber(a, 10);
      const _b: BigInteger = BigInteger.fromNumber(b, 10);

      if (a > b) {
        if (_a.compare(_b) !== 1) {
          console.log(_a, _b);
          throw new Error(`${a} !> ${b}`);
        }
      } else if (a < b) {
        if (_a.compare(_b) !== -1) {
          console.log(_a, _b);
          throw new Error(`${a} !< ${b}`);
        }
      } else {
        if (_a.compare(_b) !== 0) {
          console.log(_a, _b);
          throw new Error(`${a} !== ${b}`);
        }

        if (!_a.equals(_b)) {
          console.log(_a, _b);
          throw new Error(`${a} !== ${b}`);
        }
      }
    }
  }

  testRandom();
}


async function testDigitsArithmetic(helper: any) {
  // let a: number = 603;
  // let b: number = 462;
  // let _a: Uint8Array = NumberToDigits(new Uint8Array(NumberSize(a, 10)), a, 10);
  // let _b: Uint8Array = NumberToDigits(new Uint8Array(NumberSize(b, 10)), b, 10);
  // // console.log(Multiply2Digits(new Uint8Array(Multiply2DigitsSafeSize(_a, _b)), _a, _b, 10));
  // console.log(MulPrimitiveNumberToDigits(new Uint8Array(MulPrimitiveNumberToDigitsSafeSize(_a, 10, b)), _a, 10, b));
  // return;

  function testRandom() {
    for (let i = 0; i < 1000; i++) {
      let a: number = Math.floor(Math.random() * 1e3); // [0, 1000]
      let b: number = ((Math.random() * 10) < 9) ? Math.floor(Math.random() * 1e3) : a; // [0, 1000] (90%), a (10%)
      let c: number = Math.floor(a / (Math.random() * 1e1));
      let _a: Uint8Array = NumberToDigits(new Uint8Array(NumberSize(a, 10)), a, 10);
      let _b: Uint8Array = NumberToDigits(new Uint8Array(NumberSize(b, 10)), b, 10);
      let _c: Uint8Array = NumberToDigits(new Uint8Array(NumberSize(c, 10)), c, 10);

      if (DigitsToNumber(AddPrimitiveNumberToDigits(new Uint8Array(AddPrimitiveNumberToDigitsBufferSafeSize(_a, 10, b)), _a, 10, b), 10) !== (a + b)) {
        throw new Error(`[${_a.join(', ')}] (${a}) + ${b}`);
      }

      if (DigitsToNumber(MulDigitsByPrimitiveNumber(new Uint8Array(MulDigitsByPrimitiveNumberBufferSafeSize(_a, 10, b)), _a, 10, b), 10) !== (a * b)) {
        throw new Error(`[${_a.join(', ')}] (${a}) * ${b}`);
      }

      if (c !== 0) {
        const r = DivDigitsByPrimitiveNumber(new Uint8Array(DivDigitsByPrimitiveNumberBufferSafeSize(_a, 10, c)), _a, 10, c);
        if (DigitsToNumber(r[0], 10) !== Math.floor(a / c)) {
          throw new Error(`[${_a.join(', ')}] (${a}) / ${c}`);
        }

        if (r[1] !== (a % c)) {
          throw new Error(`[${_a.join(', ')}] (${a}) % ${c}`);
        }
      }



      if (DigitsToNumber(Add2Digits(new Uint8Array(Add2DigitsBufferSafeSize(_a, _b)), _a, _b, 10), 10) !== (a + b)) {
        throw new Error(`[${_a.join(', ')}] (${a}) + [${_b.join(', ')}] (${b})`);
      }

      if (a < b) {
        [a, b] = [b, a];
        [_a, _b] = [_b, _a];
      }

      if (DigitsToNumber(Sub2DigitsOrdered(new Uint8Array(Sub2DigitsBufferSafeSize(_a, _b)), _a, _b, 10), 10) !== (a - b)) {
        throw new Error(`[${_a.join(', ')}] (${a}) - [${_b.join(', ')}] (${b})`);
      }


      if (DigitsToNumber(Mul2Digits(new Uint8Array(Mul2DigitsBufferSafeSize(_a, _b)), _a, _b, 10), 10) !== (a * b)) {
        throw new Error(`[${_a.join(', ')}] (${a}) * [${_b.join(', ')}] (${b})`);
      }

      if (c !== 0) {
        const r = Div2Digits(
          new Uint8Array(Div2DigitsQuotientBufferSafeSize(_a)),
          new Uint8Array(Div2DigitsRemainderBufferSafeSize(_a)),
          _a,
          _c,
          10
        );

        if (DigitsToNumber(r[0], 10) !== Math.floor(a / c)) {
          throw new Error(`[${_a.join(', ')}] (${a}) / ${c}`);
        }

        if (DigitsToNumber(r[1], 10) !== (a % c)) {
          throw new Error(`[${_a.join(', ')}] (${a}) % ${c}`);
        }
      }

    }
  }

  testRandom();
}

async function testBigIntArithmetic(helper: any) {

  function testAddition() {
    if (!BigInteger.fromNumber(-11).add(BigInteger.fromNumber(-22)).equals(BigInteger.fromNumber(-33))) {
      throw new Error(`-11 + -22 === -33`);
    }

    if (!BigInteger.fromNumber(-11).add(BigInteger.fromNumber(22)).equals(BigInteger.fromNumber(11))) {
      throw new Error(`-11 + 22 === 11`);
    }

    if (!BigInteger.fromNumber(-22).add(BigInteger.fromNumber(11)).equals(BigInteger.fromNumber(-11))) {
      throw new Error(`-22 + 11 === -11`);
    }


    if (!BigInteger.fromNumber(11).add(BigInteger.fromNumber(22)).equals(BigInteger.fromNumber(33))) {
      throw new Error(`11 + 22 === 33`);
    }

    if (!BigInteger.fromNumber(11).add(BigInteger.fromNumber(-22)).equals(BigInteger.fromNumber(-11))) {
      throw new Error(`11 + -22 === -11`);
    }

    if (!BigInteger.fromNumber(22).add(BigInteger.fromNumber(-11)).equals(BigInteger.fromNumber(11))) {
      throw new Error(`22 + -11 === -11`);
    }
  }

  function testSubtraction() {
    if (!BigInteger.fromNumber(-11).subtract(BigInteger.fromNumber(-22)).equals(BigInteger.fromNumber(11))) {
      throw new Error(`-11 - -22 === 11`);
    }

    if (!BigInteger.fromNumber(-11).subtract(BigInteger.fromNumber(22)).equals(BigInteger.fromNumber(-33))) {
      throw new Error(`-11 - 22 === -33`);
    }

    if (!BigInteger.fromNumber(-22).subtract(BigInteger.fromNumber(11)).equals(BigInteger.fromNumber(-33))) {
      throw new Error(`-22 - 11 === -33`);
    }


    if (!BigInteger.fromNumber(11).subtract(BigInteger.fromNumber(22)).equals(BigInteger.fromNumber(-11))) {
      throw new Error(`11 - 22 === -11`);
    }

    if (!BigInteger.fromNumber(11).subtract(BigInteger.fromNumber(-22)).equals(BigInteger.fromNumber(33))) {
      throw new Error(`11 - -22 === 33`);
    }

    if (!BigInteger.fromNumber(22).subtract(BigInteger.fromNumber(-11)).equals(BigInteger.fromNumber(33))) {
      throw new Error(`22 - -11 === 33`);
    }
  }

  function testMultiplication() {
    if (!BigInteger.fromNumber(-11).multiply(BigInteger.fromNumber(-22)).equals(BigInteger.fromNumber(242))) {
      throw new Error(`-11 * -22 === 242`);
    }

    if (!BigInteger.fromNumber(-11).multiply(BigInteger.fromNumber(22)).equals(BigInteger.fromNumber(-242))) {
      throw new Error(`-11 * 22 === -242`);
    }

    if (!BigInteger.fromNumber(-22).multiply(BigInteger.fromNumber(11)).equals(BigInteger.fromNumber(-242))) {
      throw new Error(`-22 * 11 === -242`);
    }


    if (!BigInteger.fromNumber(11).multiply(BigInteger.fromNumber(22)).equals(BigInteger.fromNumber(242))) {
      throw new Error(`11 * 22 === -242`);
    }

    if (!BigInteger.fromNumber(11).multiply(BigInteger.fromNumber(-22)).equals(BigInteger.fromNumber(-242))) {
      throw new Error(`11 * -22 === 242`);
    }

    if (!BigInteger.fromNumber(22).multiply(BigInteger.fromNumber(-11)).equals(BigInteger.fromNumber(-242))) {
      throw new Error(`22 * -11 === 242`);
    }
  }

  function testDivision() {
    if (!BigInteger.fromNumber(-1234).divide(BigInteger.fromNumber(-13)).equals(BigInteger.fromNumber(94))) {
      throw new Error(`-1234 / -13 === 94`);
    }

    if (!BigInteger.fromNumber(-1234).divide(BigInteger.fromNumber(13)).equals(BigInteger.fromNumber(-94))) {
      throw new Error(`-1234 / 13 === -94`);
    }

    if (!BigInteger.fromNumber(-13).divide(BigInteger.fromNumber(1234)).equals(BigInteger.fromNumber(0))) {
      throw new Error(`-13 / 1234 === 0`);
    }


    if (!BigInteger.fromNumber(1234).divide(BigInteger.fromNumber(13)).equals(BigInteger.fromNumber(94))) {
      throw new Error(`1234 / 13 === -94`);
    }

    if (!BigInteger.fromNumber(1234).divide(BigInteger.fromNumber(-13)).equals(BigInteger.fromNumber(-94))) {
      throw new Error(`1234 / -13 === 94`);
    }

    if (!BigInteger.fromNumber(13).divide(BigInteger.fromNumber(-1234)).equals(BigInteger.fromNumber(0))) {
      throw new Error(`13 / -1234 === 0`);
    }

    if (!BigInteger.fromNumber(1234).remainder(BigInteger.fromNumber(13)).equals(BigInteger.fromNumber(12))) {
      throw new Error(`1234 % 13 === 12`);
    }

    if (!BigInteger.fromNumber(162).remainder(BigInteger.fromNumber(18)).equals(BigInteger.fromNumber(0))) {
      throw new Error(`162 % 18 === 0`);
    }
  }

  function testRandom() {
    for (let i = 0; i < 1000; i++) {
      const a: number = Math.floor(Math.random() * 1e3) * (((Math.random() * 2) < 1) ? 1 : -1); // [-1000, 1000]
      const b: number = (((Math.random() * 10) < 9) ? Math.floor(Math.random() * 1e3) : a) * (((Math.random() * 2) < 1) ? 1 : -1); // [-1000, 1000] (90%), a or -a (10%)
      const _a: BigInteger = BigInteger.fromNumber(a, 10);
      const _b: BigInteger = BigInteger.fromNumber(b, 10);

      if (_a.add(_b).toNumber() !== (a + b)) {
        console.log(_a, _b);
        throw new Error(`${a} + ${b} === ${a + b}`);
      }

      if (_a.subtract(_b).toNumber() !== (a - b)) {
        console.log(_a, _b);
        throw new Error(`${a} - ${b} === ${a - b}`);
      }

      if (_a.multiply(_b).toNumber() !== (a * b)) {
        console.log(_a, _b);
        throw new Error(`${a} * ${b} === ${a * b}`);
      }
    }

    for (let i = 0; i < 10; i++) {
      const a: number = Math.floor(Math.random() * 1e3) * (((Math.random() * 2) < 1) ? 1 : -1); // [-1000, 1000]
      const b: number = (((Math.random() * 10) < 9) ? Math.floor(Math.random() * 1e3) : a) * (((Math.random() * 2) < 1) ? 1 : -1); // [-1000, 1000] (90%), a or -a (10%)
      const _a: BigInteger = BigInteger.fromNumber(a, 10);
      const _b: BigInteger = BigInteger.fromNumber(b, 10);

      if (_a.divide(_b).toNumber() !== Math.trunc(a / b)) {
        console.log(_a, _b);
        throw new Error(`${a} / ${b} === ${Math.trunc(a / b)}`);
      }

      if (_a.remainder(_b).toNumber() !== Math.trunc(a % b)) {
        console.log(_a, _b);
        throw new Error(`${a} % ${b} === ${Math.trunc(a % b)}`);
      }
    }
  }

  testAddition();
  testSubtraction();
  testMultiplication();
  testDivision();
  testRandom();
}


async function testBigIntBaseConversion(helper: any) {
  function testRandom() {

    for (let i = 0; i < 1e2; i++) {
      const a: number = Math.floor(Math.random() * 1e9);

      for (let base1 = 2; base1 < 36; base1++) {
        const _a: BigInteger = BigInteger.fromNumber(a, base1);

        for (let base2 = 2; base2 < 36; base2++) {
          if (!_a.toBase(base2).equals(BigInteger.fromNumber(a, base2))) {
            throw new Error(`${a}: b${base1} to b${base2} failed`);
          }
        }
      }

      for (let base = 2; base < 36; base++) {
        if (BigInteger.fromNumber(a, 10).toBase(base).toString() !== a.toString(base)) {
          throw new Error(`${a}: b${base} to b${base} failed`);
        }
      }
    }

    for (let i = 0; i < 1e1; i++) {
      for (let base1 = 2; base1 < 10; base1++) {
        const _a: BigInteger = BigInteger.random(100, base1);

        for (let base2 = 2; base2 < 10; base2++) {
          if (!_a.toBase(base2).toBase(base1).equals(_a)) {
            throw new Error(`${a}: b${base1} to b${base2} failed`);
          }
        }
      }
    }
  }

  testRandom();
}


function speedTest(): void {
  const buffer = new Uint8Array(1000);
  let a: number = 0;

  // const base: number = 10;
  // const input: Uint8Array = CreateRandomUint8Array(100, base);
  // const newBase: number = 20;
  // const baseShift: Uint8Array = ChangeBaseOfDigitsCreateBaseShift(input, base, newBase);
  // const baseShiftBuffer: Uint8Array = ChangeBaseOfDigitsCreateBaseShiftBufferFromBaseShift(baseShift, base, newBase);
  // const sumBuffer: Uint32Array = ChangeBaseOfDigitsCreateSumBufferFromBaseShift(baseShift);
  // const buffer: Uint8Array = new Uint8Array(ChangeBaseOfDigitsBufferSafeSizeFromBaseShiftBuffer(input, baseShiftBuffer, newBase));

  console.time('speed-test');
  for (let i = 0; i < 1e6; i++) {
    // a += Math.log(Math.random());
    a += Add2Digits(buffer, CreateRandomUint8Array(100, 10), CreateRandomUint8Array(100, 10), 10).length;
    // a += AddDigits(buffer, [CreateRandomUint8Array(100, 10), CreateRandomUint8Array(100, 10)], 10).length;
    // a += $ChangeBaseOfDigits(CreateRandomUint8Array(100, 10), 10, 20).length;
    // baseShift.fill(0);
    // baseShift[0] = 1;
    // baseShiftBuffer.fill(0);
    // // sumBuffer.fill(0);
    // a += ChangeBaseOfDigitsOptimized(
    //   buffer,
    //   CreateRandomUint8Array(100, base),
    //   base,
    //   newBase,
    //   baseShift,
    //   baseShiftBuffer,
    //   sumBuffer,
    // ).length;
  }
  console.timeEnd('speed-test');
  console.log(a);
}

export async function test(helper: any) {

  // const _a = BigInteger.fromNumber(785518714, 3);
  // const _b = BigInteger.fromNumber(785518714, 2);
  // if (!_a.toBase(2).equals(_b)) {
  //   debugger;
  // }

  // $ChangeBaseOfDigits(new Uint8Array([1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1]), 2, 3);
  // console.log($ChangeBaseOfDigits(BigInteger.fromNumber(450510972, 2).digits, 2, 2));

  // console.time('test');
  await testBigIntConversion(helper);
  await testBigIntShift(helper);
  await testDigitsComparision(helper);
  await testBigIntComparision(helper);
  await testDigitsArithmetic(helper);
  await testBigIntArithmetic(helper);
  await testBigIntBaseConversion(helper);
  // console.timeEnd('test');

  // console.log(
  //   Div2Digits(
  //     new Uint8Array(20),
  //     new Uint8Array(20),
  //     new Uint8Array([0, 5, 4, 3, 4, 8]), // 843450
  //     new Uint8Array([5, 8]), // 85
  //     10
  //   )
  // ); // => 94, 12

  // speedTest(); // 325
}


// setTimeout(() => {
//   test(TestHelper).catch(_ => console.log(_));
// }, 500);

// import { test as test1 } from './BigFloat.test';
//
// console.log(test1);
