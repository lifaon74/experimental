import { CreateFloatDigitsBuffer, TFloatDigits } from './BigFloat';
import { CreateRandomUint8Array } from './BigInteger';
import { Add2DigitsBufferSafeSize, Add2FloatDigits } from './FloatDigitsArithmetic';
import { FloatDigitsEqual } from './FloatDigitsComparision';
import { FloatDigitsToString } from './FloatDigitsConversion';

function CreateRandomFloatDigits(size: number, base: number, shift: number = size): TFloatDigits {
  return [CreateRandomUint8Array(size, base), Math.floor((Math.random() - 0.5) * shift)];
}




async function testFloatDigitsComparision(helper: any) {

  function testDigitsCompare() {
  }

  function testDigitsEqual() {
    if (!FloatDigitsEqual([new Uint8Array([3, 2, 1]), 0], [new Uint8Array([3, 2, 1]), 0])) {
      throw new Error(`FloatDigitsEqual([new Uint8Array([3, 2, 1]), 0], [new Uint8Array([3, 2, 1]), 0])`);
    }

    // 1.23
    if (!FloatDigitsEqual([new Uint8Array([3, 2, 1]), -2], [new Uint8Array([0, 0, 3, 2, 1]), -4])) {
      throw new Error(`FloatDigitsEqual([new Uint8Array([3, 2, 1]), -2], [new Uint8Array([0, 0, 3, 2, 1]), -4])`);
    }

    // 1.23
    if (!FloatDigitsEqual([new Uint8Array([0, 0, 3, 2, 1]), -4], [new Uint8Array([3, 2, 1, 0, 0]), -2])) {
      throw new Error(`FloatDigitsEqual([new Uint8Array([0, 0, 3, 2, 1]), -4], [new Uint8Array([3, 2, 1, 0, 0]), -2])`);
    }

    if (FloatDigitsEqual([new Uint8Array([3, 2, 1]), 0], [new Uint8Array([3, 3, 1]), 0])) {
      throw new Error(`FloatDigitsEqual([new Uint8Array([3, 2, 1]), 0], [new Uint8Array([3, 3, 1]), 0])`);
    }

    // 12.3 !== 123
    if (FloatDigitsEqual([new Uint8Array([3, 2, 1]), -1], [new Uint8Array([3, 2, 1]), 0])) {
      throw new Error(`FloatDigitsEqual([new Uint8Array([3, 2, 1]), -1], [new Uint8Array([3, 2, 1]), 0])`);
    }

    if (FloatDigitsEqual([new Uint8Array([3, 2, 1]), -2], [new Uint8Array([0, 0, 3, 2, 1]), -3])) {
      throw new Error(`FloatDigitsEqual([new Uint8Array([3, 2, 1]), -2], [new Uint8Array([0, 0, 3, 2, 1]), -3])`);
    }
  }

  function testDigitsGreater() {

  }

  function testDigitsGreaterOrEqual() {

  }

  function testDigitsLower() {

  }

  function testRandom() {
  }


  testDigitsCompare();
  testDigitsEqual();
  testDigitsGreater();
  testDigitsGreaterOrEqual();
  testDigitsLower();

  testRandom();

}


async function testDigitsArithmetic(helper: any) {

  function testDigitsAdd() {
    let a: TFloatDigits = [new Uint8Array([2, 1]), 1] /* 120 */;
    let b: TFloatDigits = [new Uint8Array([4, 3]), -3] /* 0.034 */;

    if (
      !FloatDigitsEqual(
        Add2FloatDigits(
          CreateFloatDigitsBuffer(Add2DigitsBufferSafeSize(a, b)),
          a, b, 10
        ),
        [new Uint8Array([4, 3, 0, 0, 2, 1]), -3]
      )
    ) {
      throw new Error(`FloatDigitsEqual: 120 + 0.034 !== 120.034`);
    }


    a = [new Uint8Array([4, 3, 2, 1]), -1] /* 123.4 */;
    b = [new Uint8Array([8, 7, 6, 5]), -3] /* 5.678 */;

    if (
      !FloatDigitsEqual(
        Add2FloatDigits(
          CreateFloatDigitsBuffer(Add2DigitsBufferSafeSize(a, b)),
          a, b, 10
        ),
        [new Uint8Array([8, 7, 0, 9, 2, 1]), -3]
      )
    ) {
      throw new Error(`FloatDigitsEqual: 123.4 + 5.678 !== 129.078`);
    }
  }

  testDigitsAdd();

}




function speedTest(): void {
  const buffer: any = [new Uint8Array(1000), 0];
  let j: number = 0;

  console.time('speed-test');
  for (let i = 0; i < 1e6; i++) {
    const a: TFloatDigits = CreateRandomFloatDigits(100, 10);
    const b: TFloatDigits = CreateRandomFloatDigits(100, 10);
    j += Add2FloatDigits(
      buffer,
      a, b, 10
    )[0].length;
  }
  console.timeEnd('speed-test');
  console.log(j);
}




export async function test(helper: any) {
  await testFloatDigitsComparision(helper);
  await testDigitsArithmetic(helper);

  // speedTest();


  // console.log(ReduceFloatDigits(new Uint8Array([0, 3, 2, 1, 0]), -2));
// console.log(NumberToFloatDigits(new Uint8Array(10), 17.5, 10));

  // const a: TFloatDigits = [new Uint8Array([2, 1]), 1] /* 120 */;
  // const b: TFloatDigits = [new Uint8Array([4, 3]), -3] /* 0.034 */;

  const a: TFloatDigits = [new Uint8Array([4, 3, 2, 1]), -1] /* 123.4 */;
  const b: TFloatDigits = [new Uint8Array([8, 7, 6, 5]), -3] /* 5.678 */;
  // 123.4+5.678 = 129.078;

// console.log(
//   Add2FloatDigits(
//     CreateFloatDigitsBuffer(Add2DigitsBufferSafeSize(a, b)),
//     a, b, 10
//   )
// );

  // console.log(FloatDigitsToString([new Uint8Array([3, 2]), 0], 10));
  // console.log(FloatDigitsToString([new Uint8Array([2, 1]), 1], 10));
  // console.log(FloatDigitsToString([new Uint8Array([5, 4, 3, 2, 1]), 1], 10));
  // console.log(FloatDigitsToString([new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2, 1]), 5], 10)); // 1.23456789e+13
  // console.log(FloatDigitsToString([new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2, 1]), -1], 10)); // 1.23456789e+7
  // console.log(FloatDigitsToString([new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2, 1]), -8], 10)); // 1.23456789
  // console.log(FloatDigitsToString([new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2, 1]), -18], 10)); // 1.23456789e-10
  // console.log(FloatDigitsToString([new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2, 1]), -18], 16)); // 1.23456789e-10 (b16)
  // console.log(FloatDigitsToString([new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2, 1]), -18], 10, { maxStandardDigits: Number.POSITIVE_INFINITY })); // 0.000000000123456789 = 1.23456789e-10
  // console.log(FloatDigitsToString([new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2, 1]), -18], 10, { maxStandardDigits: 18 })); // 0.000000000123456789 = 1.23456789e-10


// console.log(NumberToFloatDigits(new Uint8Array(10), 12.3, 10));
}

setTimeout(() => {
  // test(TestHelper).catch(_ => console.log(_));
}, 500);

