import { HasBOMFactory, IHasBOMOptions } from '../bom/has-bom-factory';
import { Object2DWithTransformsFactory } from '../../objects-tree/2d/objects-2d-transformer/factory';
import {
  IObject2DGroupOptions, IObject2DGroupTypedConstructor
} from '../../objects-tree/2d/object-2d-group/interfaces';
import { PCBPart } from '../pcb-part/pcb-part';
import { Object2DGroup } from '../../objects-tree/2d/object-2d-group/implementation';

/** PCB PART GROUP **/

export interface IPCBPartGroupOptions extends IObject2DGroupOptions<PCBPart>, IHasBOMOptions {
}

export class PCBPartGroup extends HasBOMFactory(Object2DWithTransformsFactory<IObject2DGroupTypedConstructor<PCBPart>>(Object2DGroup)) implements IPCBPartGroupOptions {
  constructor(options: IPCBPartGroupOptions) {
    super(options);
  }

  cloneAsOptions(override?: IPCBPartGroupOptions): Required<IPCBPartGroupOptions> {
    return super.cloneAsOptions.call(this, override);
  }

  clone(override?: IPCBPartGroupOptions): PCBPartGroup {
    return new PCBPartGroup(this.cloneAsOptions(override));
  }
}
