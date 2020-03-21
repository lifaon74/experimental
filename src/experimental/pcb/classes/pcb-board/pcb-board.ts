import { PCBMaterial } from './pcb-material/pcb-material';
import { ShapePath } from '../shape/shape-path/shape-path';
import { IObject2DGroup } from '../objects-tree/2d/object-2d-group/interfaces';
import { IObject2D } from '../objects-tree/2d/object-2d/interfaces';
import { IsObject2DGroup } from '../objects-tree/2d/object-2d-group/constructor';
import { CloneProperty } from '../../misc/cloneable';
import { IPCBPartGroupOptions, PCBPartGroup } from './pcb-part-group/pcb-part-group';
import {
  GetAbsolutePCBLayer, NormalizePCBLayer, PCBMaterialWithLayer, TPCBLayer, VerifyPCBLayerIsExternal
} from './pcb-material/pcb-material-with-layer';
import { PCBCopper } from './pcb-material/built-in/copper/pcb-copper';
import { PCBSilkscreen } from './pcb-material/built-in/silkscreen/pcb-silkscreen';
import { PCBSolderMask } from './pcb-material/built-in/solder-mask/pcb-solder-mask';
import { PCBHole } from './pcb-material/built-in/hole/pcb-hole';


/** PCB BOARD **/

export interface IPCBBoardOptions extends IPCBPartGroupOptions {
  edges: ShapePath;
  layers: number;
}

export class PCBBoard extends PCBPartGroup implements IPCBBoardOptions {
  public readonly edges: ShapePath;
  public readonly layers: number;

  constructor(options: IPCBBoardOptions) {
    super(options);
    this.edges = options.edges;

    if (options.layers < 2) {
      throw new RangeError(`PCBBoard must have at least 2 layers`);
    }

    this.layers = options.layers;
  }

  getCopper(layer: TPCBLayer): PCBCopper[] {
    return PCBBoardGetMaterialsAtLayer(this, NormalizePCBLayer(layer))
      .filter((material: PCBMaterialWithLayer): material is PCBCopper => {
        return (material instanceof PCBCopper)
      });
  }

  getSilkscreen(layer: TPCBLayer): PCBSilkscreen[] {
    const _layer: number = NormalizePCBLayer(layer);
    VerifyPCBLayerIsExternal(_layer, this.layers);
    return PCBBoardGetMaterialsAtLayer(this, NormalizePCBLayer(layer))
      .filter((material: PCBMaterialWithLayer): material is PCBSilkscreen => {
        return (material instanceof PCBSilkscreen)
      });
  }

  getSolderMask(layer: TPCBLayer): PCBSolderMask[] {
    const _layer: number = NormalizePCBLayer(layer);
    VerifyPCBLayerIsExternal(_layer, this.layers);
    return PCBBoardGetMaterialsAtLayer(this, NormalizePCBLayer(layer))
      .filter((material: PCBMaterialWithLayer): material is PCBSolderMask => {
        return (material instanceof PCBSolderMask)
      });
  }

  getHoles(): PCBHole[] {
    const holes: PCBHole[] = [];
    PCBBoardForEachPCBMaterial(this, (material: PCBMaterial) => {
      if (material instanceof PCBHole) {
        holes.push(material);
      }
    });
    return holes;
  }


  cloneAsOptions(override?: IPCBBoardOptions): Required<IPCBBoardOptions> {
    return {
      ...super.cloneAsOptions(override),
      edges: CloneProperty<'edges', ShapePath>(this, override, 'edges'),
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


export function PCBBoardGetMaterialsAtLayer(board: PCBBoard, layer: number): PCBMaterialWithLayer[] {
  const absoluteLayer: number = GetAbsolutePCBLayer(layer, board.layers);
  const materials: PCBMaterialWithLayer[] = [];
  PCBBoardForEachPCBMaterial(board, (material: PCBMaterial) => {
    if (
      (material instanceof PCBMaterialWithLayer)
      && (GetAbsolutePCBLayer(material.layer, board.layers) === absoluteLayer)
    ) {
      materials.push(material);
    }
  });
  return materials;
}
