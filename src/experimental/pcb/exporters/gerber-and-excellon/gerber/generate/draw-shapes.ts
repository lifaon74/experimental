import { Shape } from '../../../../classes/shape/shape';
import { GerberPrecision } from '../gerber-precision';
import { mat3 } from 'gl-matrix';
import { ShapePath } from '../../../../classes/shape/shape-path/shape-path';
import { Mat3ToGerberCoordinatesOption } from '../misc';
import {
  GeFreeApertureID, GenerateGerberApertureCircleTemplate, GenerateGerberApertureDefinition, GenerateGerberArcDirection,
  GenerateGerberPolarity, GenerateGerberRegion, GenerateGerberSetCurrentAperture
} from './functions';
import { AreaShape } from '../../../../classes/shape/build-in/area/area-shape';
import { PerimeterShape } from '../../../../classes/shape/build-in/perimeter/perimeter-shape';
import { ShapePathSegment } from '../../../../classes/shape/shape-path/shape-path-segment/shape-path-segment';
import { ShapePathLineTo } from '../../../../classes/shape/shape-path/shape-path-segment/built-in/line-to/shape-path-line-to';
import { ShapePathArcTo } from '../../../../classes/shape/shape-path/shape-path-segment/built-in/arc-to/shape-path-arc-to';

/** DRAW  SHAPES **/

export function GenerateGerberDrawFromShape(shape: Shape, precision: GerberPrecision): string[] {
  if (shape instanceof PerimeterShape) {
    const apertureId: number = GeFreeApertureID();
    return [
      GenerateGerberApertureDefinition(apertureId, GenerateGerberApertureCircleTemplate(shape.thickness)),
      GenerateGerberSetCurrentAperture(apertureId),
      ...GenerateGerberDrawFromAbstractShape(shape, precision, false),
    ];
  } else if (shape instanceof AreaShape) {
    const apertureId: number = GeFreeApertureID();
    return [
      GenerateGerberApertureDefinition(apertureId, GenerateGerberApertureCircleTemplate(shape.sharpness)),
      GenerateGerberSetCurrentAperture(apertureId),
      ...GenerateGerberDrawFromAbstractShape(shape, precision, true),
    ];
  } else {
    throw new Error(`Unsupported shape type`);
  }
}


export function GenerateGerberDrawFromAbstractShape(shape: Shape, precision: GerberPrecision, isArea: boolean): string[] {
  const draw: string[] = GenerateGerberDrawFromShapePath(shape.path, mat3.clone(shape.worldMatrix), precision);
  return [
    GenerateGerberPolarity(shape.mode === 'add'),
    ...(
      isArea
        ? GenerateGerberRegion(draw)
        : draw
    ),
  ];
}

/**
 * WARN: mutates 'worldMatrix'
 */
export function GenerateGerberDrawFromShapePath(path: ShapePath, worldMatrix: mat3, precision: GerberPrecision): string[] {
  return [
    `G01*`, // linear interpolation mode
    `${
      precision.toGerberCoordinates(Mat3ToGerberCoordinatesOption(worldMatrix))
    }D02*`, // move to currentPoint

    ...path.segments
      .map((segment: ShapePathSegment) => {
        return GenerateGerberDrawFromShapePathSegment(segment, worldMatrix, precision);
      })
      .flat()
  ];
}

/**
 * WARN: mutates 'worldMatrix'
 */
export function GenerateGerberDrawFromShapePathSegment(segment: ShapePathSegment, worldMatrix: mat3, precision: GerberPrecision): string[] {
  if (segment instanceof ShapePathLineTo) {
    segment.endPointTransform(worldMatrix, worldMatrix);
    return [
      `${
        precision.toGerberCoordinates(Mat3ToGerberCoordinatesOption(worldMatrix))
      }D01*`, // draw line
    ];
  } else if (segment instanceof ShapePathArcTo) {
    segment.endPointTransform(worldMatrix, worldMatrix);
    return [
      `G75*`, // multi-quadrant mode
      GenerateGerberArcDirection(segment.angle < 0),
      `${
        precision.toGerberCoordinates({
          ...Mat3ToGerberCoordinatesOption(worldMatrix),
          i: segment.center[0],
          j: segment.center[1],
        })
      }D01*`, // draw arc
    ];
  } else {
    throw new Error(`Unsupported ShapePathSegment type`);
  }
}
