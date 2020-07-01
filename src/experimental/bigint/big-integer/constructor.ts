import { IBigInteger, IBigIntegerConstructor } from './interfaces';
import { ConstructClassWithPrivateMembers, HasFactoryWaterMark } from '@lifaon/class-factory';
import { BIG_INTEGER_PRIVATE } from './privates';
import { IsObject } from '../../../misc/helpers/is/is-object';


/** CONSTRUCTOR **/

export function ConstructBigInteger(
  instance: IBigInteger,
  // digits: Uint8Array = new Uint8Array(1),
  // negative: boolean = false,
  // base: number = 10,
): void {
  ConstructClassWithPrivateMembers(instance, BIG_INTEGER_PRIVATE);
}

export function IsBigInteger(value: any): value is IBigInteger {
  return IsObject(value)
    && value.hasOwnProperty(BIG_INTEGER_PRIVATE as symbol);
}

export const IS_BIG_INTEGER_CONSTRUCTOR = Symbol('is-big-integer-constructor');

/**
 * Returns true if value is a BigInteger's constructor
 */
export function IsBigIntegerConstructor(value: any, direct?: boolean): value is IBigIntegerConstructor {
  return (typeof value === 'function')
    && HasFactoryWaterMark(value, IS_BIG_INTEGER_CONSTRUCTOR, direct);
}


