import { Shape } from '../../../classes/shape/shape';
import { GerberPrecision } from './gerber-precision';
import { mat3, vec2 } from 'gl-matrix';
import { ShapePath } from '../../../classes/shape/shape-path/shape-path';
import {
  GenerateGerberAperture, GenerateGerberApertureCircleTemplate, GenerateGerberArcDirection,
  GenerateGerberPolarity, GenerateGerberRegion, GenerateGerberSetCurrentAperture, IGenerateGerberApertureResult
} from './functions';
import { AreaShape } from '../../../classes/shape/build-in/area/area-shape';
import { PerimeterShape } from '../../../classes/shape/build-in/perimeter/perimeter-shape';
import { ShapePathSegment } from '../../../classes/shape/shape-path/shape-path-segment/shape-path-segment';
import { ShapePathLineTo } from '../../../classes/shape/shape-path/shape-path-segment/built-in/line-to/shape-path-line-to';
import { ShapePathArcTo } from '../../../classes/shape/shape-path/shape-path-segment/built-in/arc-to/shape-path-arc-to';


/** DRAW  SHAPES **/

export function GenerateGerberDrawFromShape(shape: Shape, precision: GerberPrecision): string[] {
  if (shape instanceof PerimeterShape) {
    return GenerateGerberDrawFromAbstractShape(
      shape,
      GenerateGerberApertureCircleTemplate(shape.thickness),
      precision,
      false
    );
  } else if (shape instanceof AreaShape) {
    return GenerateGerberDrawFromAbstractShape(
      shape,
      GenerateGerberApertureCircleTemplate(shape.sharpness),
      precision,
      true
    );
  } else {
    throw new Error(`Unsupported shape type`);
  }
}


export function GenerateGerberDrawFromAbstractShape(
  shape: Shape,
  apertureTemplate: string,
  precision: GerberPrecision,
  isArea: boolean,
): string[] {
  const aperture: IGenerateGerberApertureResult = GenerateGerberAperture(apertureTemplate);
  const draw: string[] = GenerateGerberDrawFromShapePath(shape.path, shape.worldMatrix, precision);
  return [
    aperture.code,
    GenerateGerberSetCurrentAperture(aperture.id),
    GenerateGerberPolarity(shape.mode === 'add'),
    ...(
      isArea
        ? GenerateGerberRegion(draw)
        : draw
    ),
  ];
}


const TMP_VEC2_1: vec2 = vec2.create();
const TMP_VEC2_2: vec2 = vec2.create();
const TMP_VEC2_3: vec2 = vec2.create();


export function GenerateGerberDrawFromShapePath(path: ShapePath, worldMatrix: mat3, precision: GerberPrecision): string[] {
  const lines: string[] = [];
  path.resolve(
    TMP_VEC2_1,
    (segment: ShapePathSegment | null, endPointPosition: vec2) => {
      vec2.transformMat3(TMP_VEC2_2, endPointPosition, worldMatrix);

      if (segment === null) {
        lines.push(
          `G01*`, // linear interpolation mode
          `${
            precision.toGerberCoordinates({
              x: TMP_VEC2_2[0],
              y: TMP_VEC2_2[1]
            })
          }D02*`, // move to currentPoint
        );
      } else {
        if (segment instanceof ShapePathLineTo) {
          lines.push(
            `${
              precision.toGerberCoordinates({
                x: TMP_VEC2_2[0],
                y: TMP_VEC2_2[1]
              })
            }D01*`, // draw line
          );
        } else if (segment instanceof ShapePathArcTo) {
          vec2.sub(TMP_VEC2_3, vec2.transformMat3(TMP_VEC2_3, vec2.add(TMP_VEC2_3, endPointPosition, segment.center), worldMatrix), TMP_VEC2_2);
          lines.push(
            `G75*`, // multi-quadrant mode
            GenerateGerberArcDirection(segment.angle < 0),
            `${
              precision.toGerberCoordinates({
                x: TMP_VEC2_2[0],
                y: TMP_VEC2_2[1],
                i: TMP_VEC2_3[0],
                j: TMP_VEC2_3[1],
              })
            }D01*`, // draw arc
          );
        } else {
          throw new Error(`Unsupported ShapePathSegment type`);
        }
      }
    },
  );

  return lines;
}
