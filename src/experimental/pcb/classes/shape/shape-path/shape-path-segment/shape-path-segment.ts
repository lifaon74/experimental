import { mat3, vec2 } from 'gl-matrix';

/**
 * A ShapePathSegment represents a segment of a 2D path, like an arc or a line
 *  - the origin of a ShapePathSegment is always (0, 0)
 *  - we may apply some transforms (for example the last segment's end position) to these segments, meaning that the origin may virtually change
 */

export interface IShapePathSegmentOptions {

}

export abstract class ShapePathSegment implements IShapePathSegmentOptions {
  protected constructor(options: IShapePathSegmentOptions) {
  }

  /**
   * Returns true if this segment is null (has no impact on the path)
   */
  abstract isNull(): boolean;

  /**
   * Returns the position of the final point after applying this segment
   */
  abstract getEndPoint(out: vec2): vec2;


  cloneAsOptions(override?: IShapePathSegmentOptions): Required<IShapePathSegmentOptions> {
    return {};
  }

  abstract clone(override?: IShapePathSegmentOptions): ShapePathSegment;
}
