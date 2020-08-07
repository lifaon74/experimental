import { IUnitConvertersBank } from '../../unit-bank';

/**
 * SI length uses 'metre' or 'meter'
 */
export function AddSILengthUnitsToBank(bank: IUnitConvertersBank): void {
  bank.unitBank.registerUnit('metre', ['m']);
  bank.deriveUnitSIPrefixes('metre');
  bank.registerUnitAliases('metre', ['meter']);
}
