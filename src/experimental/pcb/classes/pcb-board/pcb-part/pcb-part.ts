import { HasBOMFactory, IHasBOMOptions } from '../bom/has-bom-factory';
import { Object2DWithTransformsFactory } from '../../objects-tree/2d/objects-2d-transformer/factory';
import {
  IObject2DGroup, IObject2DGroupOptions, IObject2DGroupTypedConstructor
} from '../../objects-tree/2d/object-2d-group/interfaces';
import { PCBMaterial } from '../pcb-material/pcb-material';
import { Object2DGroup } from '../../objects-tree/2d/object-2d-group/implementation';

/** PCB PART **/

export interface IPCBPartOptions extends IObject2DGroupOptions<PCBMaterial>, IHasBOMOptions {
  materials?: IObject2DGroupOptions<PCBMaterial>['children'];
}

export class PCBPart extends HasBOMFactory(Object2DWithTransformsFactory<IObject2DGroupTypedConstructor<PCBMaterial>>(Object2DGroup)) implements IPCBPartOptions {
  constructor(options: IPCBPartOptions) {
    if (options.materials !== void 0) {
      if (options.children === void 0) {
        options.children = options.materials;
      } else {
        throw new Error(`Cannot have simultaneously options.children and options.materials`);
      }
    }
    super(options);
  }

  get materials(): IObject2DGroup<PCBMaterial>['children'] {
    return this.children;
  }

  cloneAsOptions(override?: IPCBPartOptions): Required<Omit<IPCBPartOptions, 'materials'>> {
    return super.cloneAsOptions.call(this, override);
  }

  clone(override?: IPCBPartOptions): PCBPart {
    return new PCBPart(this.cloneAsOptions(override));
  }
}
