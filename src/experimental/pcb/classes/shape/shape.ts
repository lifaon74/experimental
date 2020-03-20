import { ShapePath } from './shape-path/shape-path';
import { mat3 } from 'gl-matrix';
import { IObject2DOptions } from '../objects-tree/2d/object-2d/interfaces';
import { Object2D } from '../objects-tree/2d/object-2d/implementation';
import { CloneProperty } from '../../misc/cloneable';


/** SHAPE **/

export type TShapeMode = 'add' | 'sub';

export interface IShapeOptions extends IObject2DOptions {
  path: ShapePath;
  mode?: TShapeMode; // (default: 'add')
}

export abstract class Shape extends Object2D implements IShapeOptions {
  static circle(radius: number, transform?: mat3): IShapeOptions {
    const result = ShapePath.circle(radius);
    return {
      path: result.path,
      modelMatrix: (
        (transform === void 0)
          ? result.transform
          : mat3.multiply(mat3.create(), result.transform, transform)
        // : mat3.multiply(mat3.create(), transform, result.transform)
      ),
    };
  }

  public readonly path: ShapePath;
  public readonly mode: TShapeMode;

  protected constructor(options: IShapeOptions) {
    super(options);
    this.path = options.path;
    this.mode = (options.mode === void 0)
      ? 'add'
      : options.mode;
  }

  cloneAsOptions(override?: IShapeOptions): Required<IShapeOptions> {
    return {
      ...super.cloneAsOptions(override),
      path: CloneProperty<'path', ShapePath>(this, override, 'path'),
      mode: CloneProperty<'mode', TShapeMode>(this, override, 'mode'),
    };
  }

  abstract clone(override?: IShapeOptions): Shape;
}


