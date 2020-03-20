import { CloneProperty } from '../../../../misc/cloneable';
import { IShapeOptions, Shape } from '../../shape';

/** PERIMETER **/

export interface IPerimeterShapeOptions extends IShapeOptions {
  thickness: number;
}

export class PerimeterShape extends Shape implements IPerimeterShapeOptions {
  public readonly thickness: number;

  constructor(options: IPerimeterShapeOptions) {
    super(options);
    this.thickness = (options.thickness === void 0)
      ? 0
      : options.thickness;
  }

  cloneAsOptions(override?: IPerimeterShapeOptions): Required<IPerimeterShapeOptions> {
    return {
      ...super.cloneAsOptions(override),
      thickness: CloneProperty<'thickness', number>(this, override, 'thickness'),
    };
  }

  clone(override?: IPerimeterShapeOptions): PerimeterShape {
    return new PerimeterShape(this.cloneAsOptions(override));
  }
}
