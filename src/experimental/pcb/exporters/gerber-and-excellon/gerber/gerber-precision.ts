export interface IGerberCoordinates {
  x?: number;
  y?: number;
  i?: number;
  j?: number;
}

export class GerberPrecision {
  public readonly int: number;
  public readonly decimal: number;

  constructor(
    int: number,
    decimal: number,
  ) {
    this.int = int;
    this.decimal = decimal;
  }

  toGerberFormatSpecification(): string {
    const _precision: string = `${ this.int.toString(10) }${ this.decimal.toString(10) }`;
    return `%FSLAX${ _precision }Y${ _precision }*%`;
  }

  toGerberCoordinates(coordinates: IGerberCoordinates): string {
    let _coordinates: string = '';
    if (coordinates.x !== void 0) {
      _coordinates += `X${ this.formatNumber(coordinates.x) }`;
    }
    if (coordinates.y !== void 0) {
      _coordinates += `Y${ this.formatNumber(coordinates.y) }`;
    }
    if (coordinates.i !== void 0) {
      _coordinates += `I${ this.formatNumber(coordinates.i) }`;
    }
    if (coordinates.j !== void 0) {
      _coordinates += `J${ this.formatNumber(coordinates.j) }`;
    }
    return _coordinates;
  }

  formatNumber(value: number): string {
    const absoluteValue: number = Math.abs(value);

    const intString: string = Math.trunc(absoluteValue) // keep only integer part
        .toString(10) // convert to string
      /*.padStart(this.int, '0')*/;

    const decimalString: string = (absoluteValue % 1) // keep only decimal part
      .toFixed(this.decimal) // convert to string with a rounder maximum 'decimal' digits
      .slice(2) // remove '0.'
      .padEnd(this.decimal, '0'); // add trailing zeros

    if (intString.length > this.int) {
      throw new Error(`Integer part of the value (${ value }) is greater than the integer precision`);
    }

    return ((value < 0) ? '-' : '')
      + intString
      + decimalString;
  }
}
