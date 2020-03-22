import { IPCBMaterialOptions, PCBMaterial } from '../../pcb-material';

/** DRILL **/

export interface IPCBDrillOptions extends IPCBMaterialOptions {
}

export class PCBDrill extends PCBMaterial implements IPCBDrillOptions {
  constructor(options: IPCBDrillOptions) {
    super(options);
  }

  cloneAsOptions(override?: IPCBDrillOptions): Required<Omit<IPCBDrillOptions, 'shapes'>> {
    return super.cloneAsOptions(override);
  }

  clone(override?: IPCBDrillOptions): PCBDrill {
    return new PCBDrill(this.cloneAsOptions(override));
  }
}
