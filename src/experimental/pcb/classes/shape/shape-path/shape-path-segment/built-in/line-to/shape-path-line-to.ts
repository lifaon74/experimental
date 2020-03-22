import { IShapePathSegmentOptions, ShapePathSegment } from '../../shape-path-segment';
import { mat3, vec2 } from 'gl-matrix';
import { CloneProperty } from '../../../../../../misc/cloneable';
import { mat3_pre_translate } from '../../../../../objects-tree/2d/objects-2d-transformer/functions';


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

  getEndPoint(out: vec2): vec2 {
    return vec2.copy(out, this.end);
  }

  getEndPointMatrix(out: mat3, matrix: mat3): mat3 {
    return mat3_pre_translate(out, matrix, this.end);
    // return mat3.translate(out, transform, this.end);
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
