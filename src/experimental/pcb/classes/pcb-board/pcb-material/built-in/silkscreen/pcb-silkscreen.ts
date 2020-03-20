import {
  IPCBMaterialWithLayerOptions, PCBMaterialWithLayer, VerifyPCBLayerIsExternal
} from '../../pcb-material-with-layer';

/** SILKSCREEN **/

export interface IPCBSilkscreenOptions extends IPCBMaterialWithLayerOptions {
}

export class PCBSilkscreen extends PCBMaterialWithLayer implements IPCBSilkscreenOptions {
  constructor(options: IPCBSilkscreenOptions) {
    super(options);
    VerifyPCBLayerIsExternal(this.layer);
  }

  cloneAsOptions(override?: IPCBSilkscreenOptions): Required<Omit<IPCBSilkscreenOptions, 'shapes'>> {
    return super.cloneAsOptions(override);
  }

  clone(override?: IPCBSilkscreenOptions): PCBSilkscreen {
    return new PCBSilkscreen(this.cloneAsOptions(override));
  }
}
