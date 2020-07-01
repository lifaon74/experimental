import { IBigNumber, IBigNumberConstructor } from './interfaces';
import { ConstructClassWithPrivateMembers, HasFactoryWaterMark } from '@lifaon/class-factory';
import { BIG_NUMBER_PRIVATE, IBigNumberInternal, IBigNumberPrivate } from './privates';
import { IsObject } from '../../../misc/helpers/is/is-object';
import { NormalizeBase, NormalizeDigits } from './functions';

/** CONSTRUCTOR **/

export function ConstructBigNumber(
  instance: IBigNumber,
  digits: Uint8Array = new Uint8Array(1),
  negative: boolean = false,
  base: number = 10,
): void {
  ConstructClassWithPrivateMembers(instance, BIG_NUMBER_PRIVATE);
  const privates: IBigNumberPrivate = (instance as IBigNumberInternal)[BIG_NUMBER_PRIVATE];

  if (!DISCARD_BIG_NUMBER_INIT) {
    instance.negative = negative;
    privates.base = NormalizeBase(base);
    privates.digits = NormalizeDigits(digits, privates.base);
  }

}

export function IsBigNumber(value: any): value is IBigNumber {
  return IsObject(value)
    && value.hasOwnProperty(BIG_NUMBER_PRIVATE as symbol);
}

export const IS_BIG_NUMBER_CONSTRUCTOR = Symbol('is-big-number-constructor');

/**
 * Returns true if value is a BigNumber's constructor
 */
export function IsBigNumberConstructor(value: any, direct?: boolean): value is IBigNumberConstructor {
  return (typeof value === 'function')
    && HasFactoryWaterMark(value, IS_BIG_NUMBER_CONSTRUCTOR, direct);
}



export let DISCARD_BIG_NUMBER_INIT: boolean = false;
export function ConstructUninitializedBigNumber<T extends IBigNumber>(ctor: new (...args:any[]) => T): T {
  DISCARD_BIG_NUMBER_INIT = true;
  const output: T = new ctor();
  DISCARD_BIG_NUMBER_INIT = false;
  return output;
}
