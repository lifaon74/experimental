import { mat3, vec2 } from 'gl-matrix';
import { MATH_PHI } from '../../objects-tree/2d/constants';
import { CloneArrayProperty } from '../../../misc/cloneable';
import { ShapePathSegment } from './shape-path-segment/shape-path-segment';
import { ShapePathLineTo } from './shape-path-segment/built-in/line-to/shape-path-line-to';
import { ShapePathArcTo } from './shape-path-segment/built-in/arc-to/shape-path-arc-to';


/** SHAPES PATH SEGMENT **/


/** SHAPES PATH LINE TO **/


/** SHAPES PATH ARC TO **/


/** SHAPES PATH **/

/**
 * A ShapePath represents a complete path composed of many segments
 */
export interface IShapePathOptions {
  segments: Iterable<ShapePathSegment>;
}

export class ShapePath implements IShapePathOptions {

  static lines(points: Iterable<number>): ShapePath {
    const _points: Float32Array = (points instanceof Float32Array)
      ? points
      : new Float32Array(points);

    const length: number = _points.length;
    if (length < 2) {
      throw new Error(`List of points must contain at least 2 values`);
    } else if ((length % 2) !== 0) {
      throw new Error(`List of points must contain an even number of values`);
    }

    const segments: ShapePathLineTo[] = [];

    for (let i = 0; i < length; i += 2) {
      segments.push(new ShapePathLineTo({ end: _points.subarray(i, i + 2) }));
    }

    return new ShapePath({
      segments: segments
    });
  }

  static rectangle(width: number, height: number): ShapePath {
    return this.lines(
      new Float32Array([
        width, 0,
        0, height,
        -width, 0,
        0, -height,
      ])
    );
  }

  static square(side: number): ShapePath {
    return this.rectangle(side, side);
  }

  static arc(center: vec2, angle: number): ShapePath {
    return new ShapePath({
      segments: [
        new ShapePathArcTo({
          center,
          angle
        })
      ]
    });
  }

  static circle(radius: number): { transform: mat3, path: ShapePath } {
    return {
      transform: mat3.fromTranslation(mat3.create(), vec2.fromValues(radius, 0)),
      path: new ShapePath({
        segments: [
          new ShapePathArcTo({
            center: vec2.fromValues(-radius, 0),
            angle: MATH_PHI
          })
        ]
      })
    };
  }

  public readonly segments: ShapePathSegment[];

  constructor(options: IShapePathOptions) {
    this.segments = Array.from(options.segments)
      .filter((segment: ShapePathSegment) => {
        return !segment.isNull();
      });
  }

  cloneAsOptions(override?: IShapePathOptions): Required<IShapePathOptions> {
    return {
      segments: CloneArrayProperty<'segments', ShapePathSegment>(this, override, 'segments'),
    };
  }

  clone(override?: IShapePathOptions): ShapePath {
    return new ShapePath(this.cloneAsOptions(override));
  }
}
