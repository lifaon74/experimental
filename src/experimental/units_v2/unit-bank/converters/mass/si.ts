import { IUnitConvertersBank } from '../../unit-bank';

/**
 * SI mass uses 'gram'
 */
export function AddSIMassUnitsToBank(bank: IUnitConvertersBank): void {
  bank.unitBank.registerUnit('gram', ['g']);
  bank.deriveUnitSIPrefixes('gram');
}
