//
// export class Aperture {
//   public readonly origin: vec2;
// }
//
// export class GerberImage {
//
// }



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
    const intString: string = Math.trunc(value) // keep only integer part
        .toString(10) // convert to string
      /*.padStart(this.int, '0')*/;

    const decimalString: string = (value % 1) // keep only decimal part
      .toFixed(this.decimal) // convert to string with a rounder maximum 'decimal' digits
      .slice(2) // remove '0.'
      .padEnd(this.decimal, '0'); // add trailing zeros

    if (intString.length > this.int) {
      throw new Error(`Integer part of the value (${ value }) is greater than the integer precision`);
    }

    return intString + decimalString;
  }
}



export function GenerateGerberUsedUnit(unit: 'mm' | 'inch'): string {
  return `%MO${ (unit === 'mm') ? 'MM' : 'IN' }*%`;
}

export function GenerateGerberEndOfFile(): string {
  return `M02*`;
}


/** APERTURE **/

let APERTURE_ID: number = 10;
export function GeFreeApertureID(): number {
  return APERTURE_ID++;
}

export function GenerateGerberApertureCircleTemplate(diameter: number, hole?: number): string {
  return `C,${ diameter.toString(10) }${ (hole === void 0) ? '' : `X${ hole.toString(10) }` }`;
}

export function GenerateGerberApertureRectangleTemplate(width: number, height: number, hole?: number): string {
  return `R,${ width.toString(10) }X${ height.toString(10) }${ (hole === void 0) ? '' : `X${ hole.toString(10) }` }`;
}

export function GenerateGerberApertureObroundTemplate(width: number, height: number, hole?: number): string {
  return `O,${ width.toString(10) }X${ height.toString(10) }${ (hole === void 0) ? '' : `X${ hole.toString(10) }` }`;
}

export function GenerateGerberAperturePolygonTemplate(
  outerDiameter: number,
  numberOfVertices: number,
  rotation?: number,
  hole?: number
): string {
  return `P,${ outerDiameter.toString(10) }X${ numberOfVertices.toString(10) }${ (rotation === void 0) ? '' : `X${ rotation.toString(10) }` }${ ((rotation === void 0) || (hole === void 0)) ? '' : `X${ hole.toString(10) }` }`;
}

export function GenerateGerberApertureDCode(id: number): string {
  return `D${ id.toString(10) }`;
}

export function GenerateGerberApertureDefinition(id: number, template: string): string {
  return `%AD${ GenerateGerberApertureDCode(id) }${ template }*%`;
}

export function GenerateGerberSetCurrentAperture(id: number): string {
  return `${ GenerateGerberApertureDCode(id) }*`;
}

/** OPERATIONS **/

// export function GenerateGerberOperation(precision: ): string {
//   return `%AD${ GenerateGerberApertureDCode(id) }${ template }*%`;
// }

