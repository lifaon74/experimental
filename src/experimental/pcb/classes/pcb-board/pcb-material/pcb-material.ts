import { Shape } from '../../shape/shape';
import { Object2DGroup } from '../../objects-tree/2d/object-2d-group/implementation';
import { IObject2DGroup, IObject2DGroupOptions } from '../../objects-tree/2d/object-2d-group/interfaces';

/** PCB MATERIAL **/

export interface IPCBMaterialOptions extends IObject2DGroupOptions<Shape> {
  shapes?: IObject2DGroupOptions<Shape>['children'];
}

export abstract class PCBMaterial extends Object2DGroup<Shape> implements IPCBMaterialOptions {

  protected constructor(options: IPCBMaterialOptions) {
    if (options.shapes !== void 0) {
      if (options.children === void 0) {
        options.children = options.shapes;
      } else {
        throw new Error(`Cannot have simultaneously options.children and options.shapes`);
      }
    }
    super(options);
  }

  get shapes(): IObject2DGroup<Shape>['children'] {
    return this.children;
  }

  cloneAsOptions(override?: IPCBMaterialOptions): Required<Omit<IPCBMaterialOptions, 'shapes'>> {
    return super.cloneAsOptions(override);
  }

  abstract clone(override?: IPCBMaterialOptions): PCBMaterial;
}



