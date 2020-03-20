import { IPCBMaterialOptions, PCBMaterial } from '../../pcb-material';

/** HOLE **/

export interface IPCBHoleOptions extends IPCBMaterialOptions {
}

export class PCBHole extends PCBMaterial implements IPCBHoleOptions {
  constructor(options: IPCBHoleOptions) {
    super(options);
  }

  cloneAsOptions(override?: IPCBHoleOptions): Required<Omit<IPCBHoleOptions, 'shapes'>> {
    return super.cloneAsOptions(override);
  }

  clone(override?: IPCBHoleOptions): PCBHole {
    return new PCBHole(this.cloneAsOptions(override));
  }
}
