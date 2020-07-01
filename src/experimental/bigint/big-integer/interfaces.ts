import { IBigNumber } from '../big-number/interfaces';
import { TCharToNumberMap } from '../digits/conversion/constants';


/** INTERFACES **/

export interface IBigIntegerStaticConstructor {
  /**
   * Converts a number to a BigInteger
   */
  fromNumber(input: number, base?: number): IBigInteger;

  /**
   * Converts a string to a BigInteger
   */
  fromString(input: string, base?: number, charToNumber?: TCharToNumberMap): IBigInteger;
}

export interface IBigIntegerConstructor extends IBigIntegerStaticConstructor {
  new(digits?: Uint8Array, negative?: boolean, base?: number): IBigInteger;

}

export interface IBigInteger extends IBigNumber {

}
