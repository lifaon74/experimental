import { IUnitConvertersBank } from '../../unit-bank';
import { AddSIMassUnitsToBank } from './si';

export function AddMassUnitsToBank(bank: IUnitConvertersBank): void {
  AddSIMassUnitsToBank(bank);
}
