import { CloneProperty } from '../../../../misc/cloneable';
import { IShapeOptions, Shape } from '../../shape';

/** AREA **/

export interface IAreaShapeOptions extends IShapeOptions {
  sharpness?: number;
}

export class AreaShape extends Shape implements IAreaShapeOptions {
  public readonly sharpness: number;

  constructor(options: IAreaShapeOptions) {
    super(options);
    this.sharpness = (options.sharpness === void 0)
      ? 0
      : options.sharpness;
  }

  cloneAsOptions(override?: IAreaShapeOptions): Required<IAreaShapeOptions> {
    return {
      ...super.cloneAsOptions(override),
      sharpness: CloneProperty<'sharpness', number>(this, override, 'sharpness'),
    };
  }

  clone(override?: IAreaShapeOptions): AreaShape {
    return new AreaShape(this.cloneAsOptions(override));
  }
}
