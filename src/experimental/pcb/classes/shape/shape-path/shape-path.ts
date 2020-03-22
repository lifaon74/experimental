import { mat3, vec2 } from 'gl-matrix';
import { MATH_PHI } from '../../objects-tree/2d/constants';
import { CloneArrayProperty, CloneProperty } from '../../../misc/cloneable';
import { ShapePathSegment } from './shape-path-segment/shape-path-segment';
import { ShapePathLineTo } from './shape-path-segment/built-in/line-to/shape-path-line-to';
import { ShapePathArcTo } from './shape-path-segment/built-in/arc-to/shape-path-arc-to';
import { mat3_pre_translate } from '../../objects-tree/2d/objects-2d-transformer/functions';



/** SHAPES PATH **/

/**
 * A ShapePath represents a complete path composed of many segments
 */
export interface IShapePathOptions {
  origin?: vec2;
  segments: Iterable<ShapePathSegment>;
}

export class ShapePath implements IShapePathOptions {

  /**
   * Creates a path base ony many lines
   *  - default origin (0, 0)
   */
  static lines(points: Iterable<number>, origin: vec2 = vec2.create()): ShapePath {
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
      origin,
      segments: segments,
    });
  }

  /**
   * Creates a rectangle:
   *  - default origin (0, 0) => bottom left corner
   */
  static rectangle(width: number, height: number, origin: vec2 | 'center' = vec2.create()): ShapePath {
    let _origin: vec2;
    if (origin === 'center') {
      _origin = vec2.fromValues(
        -(width / 2),
        -(height / 2),
      );
    } else if (ArrayBuffer.isView(origin)) {
      _origin = origin;
    } else {
      throw new TypeError(`Expected void, vec2 or 'center' as origin`);
    }

    return this.lines(
      new Float32Array([ // starts from bottom left
        width, 0,
        0, height,
        -width, 0,
        0, -height,
      ]),
      _origin
    );
  }

  /**
   * Creates a square:
   *  - default origin (0, 0) => bottom left corner
   */
  static square(side: number, origin?: vec2 | 'center'): ShapePath {
    return this.rectangle(side, side, origin);
  }

  /**
   * Creates an arc
   *  - default origin 'center' => centered around its center
   */
  static arc(center: vec2, angle: number, origin: vec2 | 'center' = 'center'): ShapePath {
    let _origin: vec2;
    if (origin === 'center') {
      _origin = vec2.negate(vec2.create(), center);
    } else if (ArrayBuffer.isView(origin)) {
      _origin = origin;
    } else {
      throw new TypeError(`Expected void, vec2 or 'center' as origin`);
    }
    return new ShapePath({
      origin: _origin,
      segments: [
        new ShapePathArcTo({
          center,
          angle
        })
      ]
    });
  }

  /**
   * Creates a circle
   *  - default origin 'center' => centered around its center
   */
  static circle(radius: number, origin?: vec2 | 'center'): ShapePath {
    return this.arc(vec2.fromValues(-radius, 0), MATH_PHI, origin);
  }

  public readonly origin: vec2; // where the path starts
  public readonly segments: ShapePathSegment[];

  constructor(options: IShapePathOptions) {
    this.origin = (options.origin === void 0)
      ? vec2.create()
      : options.origin;

    this.segments = Array.from(options.segments)
      .filter((segment: ShapePathSegment) => {
        return !segment.isNull();
      });
  }

  /**
   * Returns the position of the origin point
   */
  getStartPoint(out: vec2): vec2 {
    return vec2.copy(out, this.origin);
  }

  resolve(
    out: vec2,
    callback: (segment: ShapePathSegment | null, endPointPosition: vec2) => void,
  ): vec2 {
    return ShapePathResolve(this, out, callback);
  }

  cloneAsOptions(override?: IShapePathOptions): Required<IShapePathOptions> {
    return {
      segments: CloneArrayProperty<'segments', ShapePathSegment>(this, override, 'segments'),
      origin: CloneProperty<'origin', vec2>(this, override, 'origin', vec2.clone),
    };
  }

  clone(override?: IShapePathOptions): ShapePath {
    return new ShapePath(this.cloneAsOptions(override));
  }
}

const TMP_VEC: vec2 = vec2.create();

export function ShapePathResolve(
  instance: ShapePath,
  out: vec2,
  callback: (segment: ShapePathSegment | null, endPointPosition: vec2) => void,
): vec2 {
  instance.getStartPoint(out);
  callback(null, out);
  for (let i = 0, l = instance.segments.length; i < l; i++) {
    const segment = instance.segments[i];
    vec2.add(out, out, segment.getEndPoint(TMP_VEC));
    callback(segment, out);
  }
  return out;
}

