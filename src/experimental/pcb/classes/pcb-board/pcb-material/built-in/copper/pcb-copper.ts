import { IPCBMaterialWithLayerOptions, PCBMaterialWithLayer } from '../../pcb-material-with-layer';

/** COPPER **/

export interface IPCBCopperOptions extends IPCBMaterialWithLayerOptions {
}

export class PCBCopper extends PCBMaterialWithLayer implements IPCBCopperOptions {

  constructor(options: IPCBCopperOptions) {
    super(options);
  }

  cloneAsOptions(override?: IPCBCopperOptions): Required<Omit<IPCBCopperOptions, 'shapes'>> {
    return super.cloneAsOptions(override);
  }

  clone(override?: IPCBCopperOptions): PCBCopper {
    return new PCBCopper(this.cloneAsOptions(override));
  }

  // isOnLayer(layer: TPCBLayer, layers: number): boolean {
  //   return this.getAbsoluteLayer(layers) === GetAbsolutePCBLayer(NormalizePCBLayer(layer), layers);
  // }
  //
  // getAbsoluteLayer(layers: number): number {
  //   return GetAbsolutePCBLayer(this.layer, layers);
  // }
}
