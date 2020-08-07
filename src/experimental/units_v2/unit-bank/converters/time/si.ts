import { IUnitConvertersBank } from '../../unit-bank';

export interface ISITimeUnit {
  name: string;
  symbols: string[];
  seconds: number;
}

export const SI_TIME_UNITS: ISITimeUnit[] = [
  {
    name: 'second',
    symbols: ['s'],
    seconds: 1,
  }, {
    name: 'minute',
    symbols: ['min'],
    seconds: 60,
  }, {
    name: 'hour',
    symbols: ['h'],
    seconds: 60 * 60,
  }, {
    name: 'day',
    symbols: ['d'],
    seconds: 60 * 60 * 24,
  }, {
    name: 'year',
    symbols: ['y'],
    seconds: 60 * 60 * 24 * 365,
  }, {
    name: 'century',
    symbols: [],
    seconds: 60 * 60 * 24 * 365 * 100,
  },
];

export function AddSITimeUnitsToBank(bank: IUnitConvertersBank): void {
  SI_TIME_UNITS.forEach((unit: ISITimeUnit) => {
    if (unit.name !== 'second') {
      bank.unitBank.registerUnit(unit.name, unit.symbols);
      bank.registerMultiplierConverter(unit.name, 'second', unit.seconds);
    }
  });
}
