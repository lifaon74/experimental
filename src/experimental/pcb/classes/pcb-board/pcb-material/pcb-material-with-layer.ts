import { CloneProperty } from '../../../misc/cloneable';
import { IPCBMaterialOptions, PCBMaterial } from './pcb-material';

/** PCB MATERIAL WITH LAYER **/

export type TPCBLayer = number | 'top' | 'bottom';

export function NormalizePCBLayer(layer: TPCBLayer): number {
  if (layer === 'top') {
    return 0;
  } else if (layer === 'bottom') {
    return -1;
  } else {
    return layer;
  }
}

export function GetAbsolutePCBLayer(layer: number, layers: number): number {
  const absoluteLayer: number = (layer < 0)
    ? (layers - layer)
    : layer;

  if ((0 <= absoluteLayer) && (absoluteLayer < layers)) {
    return absoluteLayer;
  } else {
    throw new RangeError(`Layer is outside of the layers range [0, ${ layers }], found ${ layer } resolved as ${ absoluteLayer }`);
  }
}

export function VerifyPCBLayerIsExternal(layer: number): void {
  if (
    (layer !== 0)
    && (layer !== -1)
  ) {
    throw new Error(`PCB layer should be 'top' or 'bottom'`);
  }
}


/*--*/

export interface IPCBMaterialWithLayerOptions extends IPCBMaterialOptions {
  layer: TPCBLayer;
}

export abstract class PCBMaterialWithLayer extends PCBMaterial implements IPCBMaterialWithLayerOptions {
  public readonly layer: number;

  protected constructor(options: IPCBMaterialWithLayerOptions) {
    super(options);
    this.layer = NormalizePCBLayer(options.layer);
  }

  cloneAsOptions(override?: IPCBMaterialWithLayerOptions): Required<Omit<IPCBMaterialWithLayerOptions, 'shapes'>> {
    return {
      ...super.cloneAsOptions(override),
      layer: CloneProperty<'layer', number, TPCBLayer>(this, override, 'layer'),
    };
  }

  abstract clone(override?: IPCBMaterialWithLayerOptions): PCBMaterialWithLayer;
}
