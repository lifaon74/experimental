import { vec2 } from 'gl-matrix';


/**
 * LINKS:
 *  http://support.seeedstudio.com/knowledgebase/articles/493833-what-is-gerber-file
 *
 Extension                       Layer
 pcbname.GTL                 Top Copper
 pcbname.GTS                 Top Soldermask
 pcbname.GTO                 Top Silkscreen

 pcbname.GBL                 Bottom copper
 pcbname.GBS                 Bottom Soldermask:
 pcbname.GBO                 Bottom Silkscreen:
 pcbname.TXT                  Drills
 pcbname.GML/GKO        *Board Outline:

 4 layer board also need
 pcbname.GL2                   Inner Layer2
 pcbname.GL3                   Inner Layer3


 RS-274X format

 https://www.ucamco.com/files/downloads/file/81/The_Gerber_File_Format_specification.pdf?dd1347f8978ee2fb4532ef5613d36e70

 */



/**
 * TODO add support for complex shapes:
 *  - many areas / perimeters (sub-shapes)
 *  - possibility to add a transform for each sub shape
 *  - possibility to mark shape as additive or subtractive
 */


export class Aperture {
  public readonly origin: vec2;
}

export class GerberImage {

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

  toGerberCoordinates(
    x: number | undefined,
    y: number | undefined,
  ): string {
    let coordinates: string = '';
    if (x !== void 0) {
      coordinates += `X${ this.formatNumber(x) }`;
    }
    if (y !== void 0) {
      coordinates += `Y${ this.formatNumber(y) }`;
    }
    return coordinates;
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

/** OPERATIONS **/

// export function GenerateGerberOperation(precision: ): string {
//   return `%AD${ GenerateGerberApertureDCode(id) }${ template }*%`;
// }

/** GERBER **/

export function GenerateGerber() {
  const precision = new GerberPrecision(3, 3);
  // console.log(precision.formatNumber(123.456789));
  // console.log(precision.formatNumber(2.5));

  const lines: string[] = [
    precision.toGerberFormatSpecification(),
    GenerateGerberUsedUnit('mm'),
    GenerateGerberApertureDefinition(GeFreeApertureID(), GenerateGerberApertureCircleTemplate(0.5)),
  ];

  console.log(precision.toGerberCoordinates(2.5, 2.5));

  console.log(lines.join('\n'));
}


/** SHAPES **/

export interface IShapeOptions {

}

export abstract class Shape implements IShapeOptions {
  protected constructor(options: IShapeOptions) {
  }

  abstract toGerber(): string[];
}

export interface IRectangleOptions extends IShapeOptions {
  size: vec2;
}

export class Rectangle extends Shape implements IRectangleOptions {
  public readonly size: vec2;

  constructor(options: IRectangleOptions) {
    super(options);
  }

  get width(): number {
    return this.size[0];
  }

  get height(): number {
    return this.size[1];
  }

  toGerber(): string[] {
    return [];
  }
}

/** RUN **/

export function debugPCB() {
  GenerateGerber();

}



