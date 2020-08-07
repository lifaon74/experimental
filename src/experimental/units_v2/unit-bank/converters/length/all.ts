import { AddSILengthUnitsToBank } from './si';
import { AddImperialLengthUnitsToBank } from './imperial';
import { IUnitConvertersBank } from '../../unit-bank';

export function AddLengthUnitsToBank(bank: IUnitConvertersBank): void {
  AddSILengthUnitsToBank(bank);
  AddImperialLengthUnitsToBank(bank);
}
