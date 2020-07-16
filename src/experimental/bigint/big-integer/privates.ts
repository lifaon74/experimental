import { IBigInteger } from './interfaces';
import { IBigNumberPrivatesInternal } from '../big-number/privates';

/** PRIVATES **/

export const BIG_INTEGER_PRIVATE = Symbol('big-integer-private');

export interface IBigIntegerPrivate {

}

export interface IBigIntegerPrivatesInternal {
  [BIG_INTEGER_PRIVATE]: IBigIntegerPrivate;
}

export interface IBigIntegerInternal extends IBigIntegerPrivatesInternal, IBigNumberPrivatesInternal, IBigInteger {
}
