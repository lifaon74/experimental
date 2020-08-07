import { AddLengthUnitsToBank } from './length/all';
import { IUnitConvertersBank } from '../unit-bank';
import { AddTimeUnitsToBank } from './time/all';
import { AddMassUnitsToBank } from './mass/all';

export function AddAllUnitsToBank(bank: IUnitConvertersBank): void {
  AddLengthUnitsToBank(bank);
  AddTimeUnitsToBank(bank);
  AddMassUnitsToBank(bank);
}
