import { Shape } from '../../../../classes/shape/shape';
import { GerberPrecision } from '../gerber-precision';
import { GenerateGerberDrawFromShape } from './draw-shapes';


/** GERBER FUNCTIONS **/


export function GenerateGerber(shapes: Shape[], precision: GerberPrecision): string [] {
  return [
    precision.toGerberFormatSpecification(),
    GenerateGerberUsedUnit('mm'),
    ...shapes
      .map((shape: Shape) => {
        return GenerateGerberDrawFromShape(shape, precision);
      })
      .flat(),
    GenerateGerberEndOfFile()
  ];
}


export function GenerateGerberUsedUnit(unit: 'mm' | 'inch'): string {
  return `%MO${ (unit === 'mm') ? 'MM' : 'IN' }*%`;
}

export function GenerateGerberEndOfFile(): string {
  return `M02*`;
}


export function GenerateGerberComment(comment: string): string {
  return `G04 ${ comment }*`;
}

export function GenerateGerberHeaders(headers: Iterable<[string, string]>): string[] {
  const _headers: [string, string][] = Array.from(headers);
  const maxLength: number = _headers.reduce((maxLength: number, [key]) => {
    return Math.max(maxLength, key.length);
  }, 0);

  return _headers.map(([key, value]: [string, string]) => {
    return GenerateGerberComment(`${ key.padEnd(maxLength + 1, ' ') }:    ${ value }`);
  });
}


/* APERTURE */

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

/*--*/

export function GenerateGerberRegion(lines: string[]): string[] {
  return [
    `G36*`,
    ...lines,
    `G37*`,
  ];
}

export function GenerateGerberPolarity(add: boolean): string {
  return add
    ? `%LPD*%`
    : `%LPC*%`;
}

export function GenerateGerberArcDirection(clockwise: boolean): string {
  return clockwise
    ? `G02*` // clockwise;
    : `G03*`; // anti-clockwise
}


