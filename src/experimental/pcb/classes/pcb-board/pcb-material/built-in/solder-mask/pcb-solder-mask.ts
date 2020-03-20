import {
  IPCBMaterialWithLayerOptions, PCBMaterialWithLayer, VerifyPCBLayerIsExternal
} from '../../pcb-material-with-layer';

/** SOLDER MASK **/

export interface IPCBSolderMaskOptions extends IPCBMaterialWithLayerOptions {
}

export class PCBSolderMask extends PCBMaterialWithLayer implements IPCBSolderMaskOptions {
  constructor(options: IPCBSolderMaskOptions) {
    super(options);
    VerifyPCBLayerIsExternal(this.layer);
  }

  cloneAsOptions(override?: IPCBSolderMaskOptions): Required<Omit<IPCBSolderMaskOptions, 'shapes'>> {
    return super.cloneAsOptions(override);
  }

  clone(override?: IPCBSolderMaskOptions): PCBSolderMask {
    return new PCBSolderMask(this.cloneAsOptions(override));
  }
}
