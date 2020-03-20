import { PCBMaterial } from './pcb-material/pcb-material';
import { ShapePath } from '../shape/shape-path/shape-path';
import { IObject2DGroup } from '../objects-tree/2d/object-2d-group/interfaces';
import { IObject2D } from '../objects-tree/2d/object-2d/interfaces';
import { IsObject2DGroup } from '../objects-tree/2d/object-2d-group/constructor';
import { CloneProperty } from '../../misc/cloneable';
import { IPCBPartGroupOptions, PCBPartGroup } from './pcb-part-group/pcb-part-group';
import { GetAbsolutePCBLayer, NormalizePCBLayer, TPCBLayer } from './pcb-material/pcb-material-with-layer';
import { PCBCopper } from './pcb-material/built-in/copper/pcb-copper';


/** PCB BOARD **/

export interface IPCBBoardOptions extends IPCBPartGroupOptions {
  shape: ShapePath;
  layers: number;
}

export class PCBBoard extends PCBPartGroup implements IPCBBoardOptions {
  public readonly shape: ShapePath;
  public readonly layers: number;

  constructor(options: IPCBBoardOptions) {
    super(options);
    this.shape = options.shape;
    this.layers = options.layers;
  }

  getCopper(layer: TPCBLayer): PCBCopper[] {
    const absoluteLayer: number = GetAbsolutePCBLayer(NormalizePCBLayer(layer), this.layers);
    const materials: PCBCopper[] = [];
    PCBBoardForEachPCBMaterial(this, (material: PCBMaterial) => {
      if (
        (material instanceof PCBCopper)
        && (GetAbsolutePCBLayer(material.layer, this.layers) === absoluteLayer)
      ) {
        materials.push(material);
      }
    });
    return materials;
  }

  cloneAsOptions(override?: IPCBBoardOptions): Required<IPCBBoardOptions> {
    return {
      ...super.cloneAsOptions(override),
      shape: CloneProperty<'shape', ShapePath>(this, override, 'shape'),
      layers: CloneProperty<'layers', number>(this, override, 'layers'),
    };
  }

  clone(override?: IPCBBoardOptions): PCBBoard {
    return new PCBBoard(this.cloneAsOptions(override));
  }
}

export function PCBBoardForEachPCBMaterial(instance: IObject2DGroup<IObject2D>, callback: (child: PCBMaterial) => void): void {
  const children: ReadonlyArray<IObject2D> = instance.children;
  let child: IObject2D;
  for (let i = 0, l = children.length; i < l; i++) {
    child = children[i];
    if (child instanceof PCBMaterial) {
      callback(child);
    } else if (IsObject2DGroup<IObject2D>(child)) {
      PCBBoardForEachPCBMaterial(child, callback);
    }
  }
}

