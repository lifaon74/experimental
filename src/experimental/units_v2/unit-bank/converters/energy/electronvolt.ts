import { IUnitConvertersBank } from '../../unit-bank';

/**
 * https://en.wikipedia.org/wiki/Electronvolt
 */
export function AddElectronVoltUnitToBank(bank: IUnitConvertersBank): void {
  bank.unitBank.registerUnit('electronvolt', ['eV']);
  bank.deriveUnitSIPrefixes('electronvolt');
}
