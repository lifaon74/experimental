import { IShapePathSegmentOptions, ShapePathSegment } from '../../shape-path-segment';
import { mat3, vec2 } from 'gl-matrix';
import { CloneProperty } from '../../../../../../misc/cloneable';

/**
 * A ShapePathLineTo represents a line from (0, 0) to 'end'
 */
export interface IShapePathLineToOptions extends IShapePathSegmentOptions {
  end: vec2;
}

export class ShapePathLineTo extends ShapePathSegment implements IShapePathLineToOptions {
  public readonly end: vec2;

  constructor(options: IShapePathLineToOptions) {
    super(options);
    this.end = options.end;
  }

  isNull(): boolean {
    return (
      (this.end[0] === 0)
      && (this.end[1] === 0)
    );
  }

  endPointTransform(out: mat3, transform: mat3): mat3 {
    return mat3.translate(out, transform, this.end);
  }

  cloneAsOptions(override?: IShapePathLineToOptions): Required<IShapePathLineToOptions> {
    return {
      ...super.cloneAsOptions(override),
      end: CloneProperty<'end', vec2>(this, override, 'end', vec2.clone),
    };
  }

  clone(override?: IShapePathLineToOptions): ShapePathLineTo {
    return new ShapePathLineTo(this.cloneAsOptions(override));
  }
}
