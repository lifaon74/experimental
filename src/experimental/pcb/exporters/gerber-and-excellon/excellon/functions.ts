import { Shape } from '../../../classes/shape/shape';
import { FormatSimpleHeaders } from '../../misc/pad-column';
import { mat3, vec2 } from 'gl-matrix';
import { ShapePathArcTo } from '../../../classes/shape/shape-path/shape-path-segment/built-in/arc-to/shape-path-arc-to';
import { MATH_PHI } from '../../../classes/objects-tree/2d/constants';
import { float_equals, float_to_fixed, mat3_get_scaling } from '../../../classes/objects-tree/2d/objects-2d-transformer/functions';

const TMP_VEC2: vec2 = vec2.create();


/** EXCELLON FUNCTIONS **/

/**
 * Also knows as XNC
 * https://www.ucamco.com/files/downloads/file/305/the_xnc_file_format_specification.pdf
 */

export function GenerateExcellon(shapes: Shape[], headers: Iterable<[string, string]> = []): string [] {
  const drillHolesPerShape: TDrillHoleOrNull[] = DetectDrillHolesFromShapes(shapes);

  const drillHoles: IDrillHole[] = drillHolesPerShape.filter((drillHole: TDrillHoleOrNull): drillHole is IDrillHole => {
    return (drillHole !== null);
  });

  const routingShapes: Shape[] = shapes.filter((shape: Shape, index: number) => {
    return (drillHolesPerShape[index] === null);
  });

  if (routingShapes.length > 0) {
    throw new Error(`Routing shape are currently not supported`);
  }

  const groupedDrillHoles: Map<number, vec2[]> = GroupDrillHolesByDiameter(drillHoles);
  const drillToolsAndCoords: IDrillToolAndCoords = GenerateExcellonTools(groupedDrillHoles);

  // console.log(drillToolsAndCoords);

  return [
    ...GenerateExcellonHeaderBlock([
      ...GenerateExcellonCommentHeaders(headers),
      // GenerateExcellonFormatMode(2),
      GenerateExcellonUsedUnit('mm'),
      ...drillToolsAndCoords.lines,
    ]),
    ...GenerateExcellonDrillHoles(drillToolsAndCoords.toolIdToCoorsMap),
    GenerateExcellonEndOfFile()
  ];
}


export function GenerateExcellonStartOfHeader(): string {
  return `M48`;
}

export function GenerateExcellonEndOfHeader(): string {
  return `%`;
}

export function GenerateExcellonHeaderBlock(lines: string[]): string[] {
  return [
    GenerateExcellonStartOfHeader(),
    ...lines,
    GenerateExcellonEndOfHeader(),
  ];
}


export function GenerateExcellonUsedUnit(unit: 'mm' | 'inch'): string {
  return `${ (unit === 'mm') ? 'METRIC' : 'INCH' }`;
}

export function GenerateExcellonFormatMode(mode: 1 | 2 = 2): string {
  return `FMAT,${ mode.toString(10) }`;
}

export function GenerateExcellonEndOfFile(): string {
  return `M30`;
}

export function GenerateExcellonComment(comment: string): string {
  return `; ${ comment }`;
}

export function GenerateExcellonCommentHeaders(headers: Iterable<[string, string]>): string[] {
  return FormatSimpleHeaders(headers)
    .map(GenerateExcellonComment);
}


export function GenerateExcellonDrillMode(): string {
  return `G05`;
}


export function GenerateExcellonDrillHoles(toolIdToCoorsMap: Map<number, vec2[]>): string[] {
  return Array.from<[number, vec2[]], string[]>(toolIdToCoorsMap.entries(), ([toolId, coords]: [number, vec2[]]) => {
    return GenerateExcellonDrillHolesWithSpecificTool(toolId, coords);
  }).flat();
}

export function GenerateExcellonDrillHolesWithSpecificTool(toolId: number, coords: vec2[]): string[] {
  return [
    GenerateExcellonDrillMode(),
    GenerateExcellonSelectTool(toolId),
    ...coords.map((position: vec2) => {
      return GenerateExcellonDrillHole(position);
    }),
  ];
}

export function GenerateExcellonDrillHole(position: vec2, precision: number = 4): string {
  return `X${ FormatExcellonNumber(position[0], precision) }Y${ FormatExcellonNumber(position[1], precision) }`;
}

export function FormatExcellonNumber(value: number, precision: number = 4): string {
  return value.toFixed(precision);
}


/** HOLES **/

export interface IDrillHole {
  center: vec2;
  radius: number;
}

export type TDrillHoleOrNull = IDrillHole | null;

export function DetectDrillHoleFromShape(shape: Shape): TDrillHoleOrNull {
  let circle: ShapePathArcTo;
  const worldMatrix: mat3 = shape.worldMatrix;
  const scale: vec2 = mat3_get_scaling(TMP_VEC2, worldMatrix);
  if (
    (shape.mode === 'add')
    && float_equals(scale[0], scale[1]) // same scaling
    && (shape.path.segments.length === 1)
    && ((circle = shape.path.segments[0] as ShapePathArcTo) instanceof ShapePathArcTo)
    && (circle.angle >= MATH_PHI)
  ) {
    const center: vec2 = vec2.add(vec2.create(), circle.center, shape.path.origin);
    vec2.transformMat3(center, center, worldMatrix);
    return {
      center,
      radius: circle.radius * scale[0],
    };
  } else {
    return null;
  }
}

export function DetectDrillHolesFromShapes(shapes: Shape[]): TDrillHoleOrNull[] {
  return shapes.map(DetectDrillHoleFromShape);
}

export function GroupDrillHolesByDiameter(drillHoles: IDrillHole[]): Map<number, vec2[]> { // [radius, coords]
  const groupedDrillHoles: Map<number, vec2[]> = new Map<number, vec2[]>();
  for (let i = 0, l = drillHoles.length; i < l; i++) {
    const drillHole: IDrillHole = drillHoles[i];
    let coords: vec2[];
    if (groupedDrillHoles.has(drillHole.radius)) {
      coords = groupedDrillHoles.get(drillHole.radius) as vec2[];
    } else {
      coords = [];
      groupedDrillHoles.set(drillHole.radius, coords);
    }
    coords.push(drillHole.center);
  }
  return groupedDrillHoles;
}

export interface IDrillToolAndCoords {
  toolIdToCoorsMap: Map<number, vec2[]>; // [tool id, coords]
  lines: string[];
}

/** TOOL **/

export function GenerateExcellonTools(groupedDrillHoles: Map<number, vec2[]>): IDrillToolAndCoords {
  const toolIdToCoorsMap: Map<number, vec2[]> = new Map<number, vec2[]>();
  const lines: string[] = [];
  let toolId: number = 1;
  const iterator: Iterator<[number, vec2[]]> = groupedDrillHoles.entries();
  let result: IteratorResult<[number, vec2[]]>;
  while (!(result = iterator.next()).done) {
    const [radius, coords]: [number, vec2[]] = result.value;
    lines.push(GenerateExcellonToolDefinition(toolId, radius * 2));
    toolIdToCoorsMap.set(toolId, coords);
    toolId++;
  }
  return {
    toolIdToCoorsMap,
    lines
  };
}

export function GenerateExcellonToolDefinition(id: number, diameter: number): string {
  return `T${ id.toString(10)/*.padStart(2, '0')*/ }C${ FormatExcellonNumber(diameter) }`;
}

export function GenerateExcellonSelectTool(id: number): string {
  return `T${ id.toString(10)/*.padStart(2, '0')*/ }`;
}


