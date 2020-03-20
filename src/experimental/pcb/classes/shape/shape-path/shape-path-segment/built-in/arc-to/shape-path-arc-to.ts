import { IShapePathSegmentOptions, ShapePathSegment } from '../../shape-path-segment';
import { mat3, vec2 } from 'gl-matrix';
import { MATH_PHI, NULL_VEC2, TMP_VEC2 } from '../../../../../objects-tree/2d/constants';
import { CloneProperty } from '../../../../../../misc/cloneable';

/**
 * A ShapePathArcTo represents an arc starting at (0, 0) with a specific 'center' and an 'angle' (rad, counter-clockwise if positive)
 */
export interface IShapePathArcToOptions extends IShapePathSegmentOptions {
  center: vec2;
  angle: number;
}

export class ShapePathArcTo extends ShapePathSegment implements IShapePathArcToOptions {
  public readonly center: vec2;
  public readonly angle: number; // [-360deg, 360deg]

  constructor(options: IShapePathArcToOptions) {
    super(options);
    this.center = options.center;
    if (
      (-MATH_PHI <= options.angle)
      && (options.angle <= MATH_PHI)
    ) {
      this.angle = options.angle;
    } else {
      throw new RangeError(`Expected options.angle in the range [-360deg, 360deg]`);
    }
  }

  isNull(): boolean {
    return (this.angle === 0);
  }

  endPointTransform(out: mat3, transform: mat3): mat3 {
    const translation: vec2 = vec2.negate(TMP_VEC2, this.center);
    vec2.rotate(translation, translation, NULL_VEC2, this.angle);
    vec2.add(translation, translation, this.center);
    return mat3.translate(out, transform, translation);
  }

  cloneAsOptions(override?: IShapePathArcToOptions): Required<IShapePathArcToOptions> {
    return {
      ...super.cloneAsOptions(override),
      center: CloneProperty<'center', vec2>(this, override, 'center', vec2.clone),
      angle: CloneProperty<'angle', number>(this, override, 'angle'),
    };
  }

  clone(override?: IShapePathArcToOptions): ShapePathArcTo {
    return new ShapePathArcTo(this.cloneAsOptions(override));
  }
}
