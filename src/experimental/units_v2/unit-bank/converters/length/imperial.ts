import { IUnitConvertersBank } from '../../unit-bank';

export interface IImperialLengthUnit {
  name: string;
  symbols: string[];
  metres: number;
  feet?: number;
}

export const IMPERIAL_LENGTH_UNITS: IImperialLengthUnit[] = [
  {
    name: 'thou',
    symbols: ['th'],
    feet: 1 / 12e3,
    metres: 2.54e-5,
  }, {
    name: 'inch',
    symbols: ['in', '"'],
    feet: 1 / 12,
    metres: 2.54e-2,
  }, {
    name: 'foot',
    symbols: ['ft'],
    feet: 1,
    metres: 0.3048,
  }, {
    name: 'yard',
    symbols: ['yd'],
    feet: 3,
    metres: 0.9144,
  }, {
    name: 'chain',
    symbols: ['ch'],
    feet: 66,
    metres: 20.1168,
  }, {
    name: 'furlong',
    symbols: ['fur'],
    feet: 660,
    metres: 201.168,
  }, {
    name: 'mile',
    symbols: ['mi'],
    feet: 5280,
    metres: 1609.344,
  }, {
    name: 'league',
    symbols: ['lea'],
    feet: 15840,
    metres: 4828.032,
  }, /* maritime units */ {
    name: 'fathom',
    symbols: ['ftm'],
    feet: 6.0761,
    metres: 1.852,
  }, {
    name: 'cable',
    symbols: [],
    feet: 607.61,
    metres: 185.2,
  }, {
    name: 'nautical mile',
    symbols: [],
    feet: 6076.1,
    metres: 1852,
  }, {
    name: 'link',
    symbols: [],
    feet: 66 / 100,
    metres: 0.201168,
  }, {
    name: 'rod',
    symbols: [],
    feet: 66 / 4,
    metres: 5.0292,
  }
];

export function AddImperialLengthUnitsToBank(
  bank: IUnitConvertersBank,
  meterUnit: string = 'metre'
): void {
  IMPERIAL_LENGTH_UNITS.forEach((unit: IImperialLengthUnit) => {
    bank.unitBank.registerUnit(unit.name, unit.symbols);
    bank.registerMultiplierConverter(unit.name, meterUnit, unit.metres);
  });
}


