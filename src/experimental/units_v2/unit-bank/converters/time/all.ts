import { IUnitConvertersBank } from '../../unit-bank';
import { AddSITimeUnitsToBank } from './si';

export function AddTimeUnitsToBank(bank: IUnitConvertersBank): void {
  AddSITimeUnitsToBank(bank);
}
