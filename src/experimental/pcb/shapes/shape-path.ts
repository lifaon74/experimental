import { mat3, vec2 } from 'gl-matrix';

/** SHAPES PATH & SEGMENTS **/

export interface IShapePathSegmentOptions {

}

export abstract class ShapePathSegment implements IShapePathSegmentOptions {
  protected constructor(options: IShapePathSegmentOptions) {
  }
}


export interface IShapePathLineToOptions extends IShapePathSegmentOptions {
  end: vec2;
}

export class ShapePathLineTo extends ShapePathSegment implements IShapePathLineToOptions {
  public readonly end: vec2;

  constructor(options: IShapePathLineToOptions) {
    super(options);
    this.end = options.end;
  }
}


export interface IShapePathArcToOptions extends IShapePathSegmentOptions {
  center: vec2;
  angle: number;
}

export class ShapePathArcTo extends ShapePathSegment implements IShapePathArcToOptions {
  public readonly center: vec2;
  public readonly angle: number;

  constructor(options: IShapePathArcToOptions) {
    super(options);
    this.center = options.center;
    this.angle = options.angle;
  }
}


export interface IShapePathOptions {
  origin: vec2;
  segments: Iterable<ShapePathSegment>;
}

export class ShapePath implements IShapePathOptions {

  static lines(points: Iterable<number>): ShapePath {
    const _points: Float32Array = (points instanceof Float32Array)
      ? points
      : new Float32Array(points);

    const length: number = _points.length;
    if (length < 4) {
      throw new Error(`List of points must contain at least 4 values`);
    } else if ((length % 2) !== 0) {
      throw new Error(`List of points must contain an even number of values`);
    }

    const segments: ShapePathLineTo[] = [];

    for (let i = 2; i < length; i += 2) {
      segments.push(new ShapePathLineTo({ end: _points.subarray(i, i + 2) }));
    }

    return new ShapePath({
      origin: _points.subarray(0, 2),
      segments: segments
    });
  }

  static rectangle(width: number, height: number): ShapePath {
    return this.lines(
      new Float32Array([
        0, 0,
        width, 0,
        width, height,
        0, height,
      ])
    );
  }

  static square(side: number): ShapePath {
    return this.rectangle(side, side);
  }

  static circle(center: vec2, radius: number): ShapePath {
    return new ShapePath({
      origin: vec2.fromValues(center[0] + radius, center[1]),
      segments: [
        new ShapePathArcTo({
          center,
          angle: Math.PI * 2
        })
      ]
    });
  }

  public readonly origin: vec2;
  public readonly segments: ShapePathSegment[];

  constructor(options: IShapePathOptions) {
    this.origin = options.origin;
    this.segments = Array.from(options.segments);
  }

  applyTransform(transform: mat3): ShapePath {
    throw 'TODO';
  }
}
