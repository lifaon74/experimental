import { IUnitConvertersBank } from '../../unit-bank';

/**
 * https://en.wikipedia.org/wiki/Joule
 */
export function AddJouleUnitToBank(bank: IUnitConvertersBank): void {
  bank.unitBank.registerUnit('joule', ['J']);
  bank.deriveUnitSIPrefixes('joule');
}
