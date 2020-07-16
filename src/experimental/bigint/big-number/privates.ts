import { IBigNumber } from './interfaces';

/** PRIVATES **/

export const BIG_NUMBER_PRIVATE = Symbol('big-number-private');

export interface IBigNumberPrivate {
  digits: Uint8Array;
  negative: boolean;
  base: number;
}

export interface IBigNumberPrivatesInternal {
  [BIG_NUMBER_PRIVATE]: IBigNumberPrivate;
}

export interface IBigNumberInternal extends IBigNumberPrivatesInternal, IBigNumber {
}
