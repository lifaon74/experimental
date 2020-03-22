import { PCBBoard } from '../../../classes/pcb-board/pcb-board';
import { GerberPrecision } from './gerber-precision';
import { GenerateGerber, GenerateGerberCommentHeaders } from './functions';
import { PCBMaterial } from '../../../classes/pcb-board/pcb-material/pcb-material';
import { PerimeterShape } from '../../../classes/shape/build-in/perimeter/perimeter-shape';
import { PCBSilkscreen } from '../../../classes/pcb-board/pcb-material/built-in/silkscreen/pcb-silkscreen';


export interface IGerberExtensionAndGenerator {
  extension: string;
  generator: (board: PCBBoard, precision: GerberPrecision) => string[],
}

export const GERBER_GENERATORS: IGerberExtensionAndGenerator[] = [
  {
    extension: 'gtl',
    generator: GenerateGerberBoardTopCopperLayer
  },
  {
    extension: 'gbl',
    generator: GenerateGerberBoardBottomCopperLayer
  },
  {
    extension: 'gto',
    generator: GenerateGerberBoardTopSilkscreenLayer
  },
  {
    extension: 'gbo',
    generator: GenerateGerberBoardBottomSilkscreenLayer
  },
  {
    extension: 'gts',
    generator: GenerateGerberBoardTopSolderMaskLayer
  },
  {
    extension: 'gbs',
    generator: GenerateGerberBoardBottomSolderMaskLayer
  },
  {
    extension: 'gml',
    generator: GenerateGerberBoardEdges
  },
];


export function GenerateBoardGerberFiles(
  board: PCBBoard,
  precision: GerberPrecision,
  name: string,
): [string, string][] { // [file name, content]

  const generate = (render: IGerberExtensionAndGenerator): [string, string] => {
    return [
      `${ name }.${ render.extension }`,
      render.generator(board, precision).join('\n')
    ];
  };

  const files: [string, string][] = GERBER_GENERATORS.map(generate);

  for (let i = 2; i < board.layers; i++) {
    files.push(generate({
      extension: `gl${ i }`,
      generator: (board: PCBBoard, precision: GerberPrecision): string[] => {
        return GenerateGerberBoardCopperLayer(board, 1, `CopperLayer${ i }`, precision);
      }
    }));
  }
  return files;
}


export function GenerateGerberBoardLayerHeaders(layerName: string): string[] {
  return GenerateGerberCommentHeaders([
    [`Format`, `Gerber RS-274X`],
    [`Layer`, layerName],
    [`Generated Date`, new Date().toUTCString()],
    // [`Created Using`, `PCBTS`],
  ] as Iterable<[string, string]>);
}


/** COPPER **/

export function GenerateGerberBoardTopCopperLayer(board: PCBBoard, precision: GerberPrecision): string[] {
  return GenerateGerberBoardCopperLayer(board, 0, `TopCopper`, precision);
}

export function GenerateGerberBoardBottomCopperLayer(board: PCBBoard, precision: GerberPrecision): string[] {
  return GenerateGerberBoardCopperLayer(board, -1, `BottomCopper`, precision);
}

export function GenerateGerberBoardCopperLayer(
  board: PCBBoard,
  layer: number,
  layerName: string,
  precision: GerberPrecision,
): string[] {
  return GenerateGerberLayerFileContentFromMaterials(board.getCopper(layer), layerName, precision);
}


/** SILKSCREEN **/

export function GenerateGerberBoardTopSilkscreenLayer(board: PCBBoard, precision: GerberPrecision): string[] {
  return GenerateGerberBoardSilkscreenLayer(board, 0, `TopSilkscreen`, precision);
}

export function GenerateGerberBoardBottomSilkscreenLayer(board: PCBBoard, precision: GerberPrecision): string[] {
  return GenerateGerberBoardSilkscreenLayer(board, -1, `BottomSilkscreen`, precision);
}

export function GenerateGerberBoardSilkscreenLayer(
  board: PCBBoard,
  layer: number,
  layerName: string,
  precision: GerberPrecision,
): string[] {
  const silkscreens: PCBSilkscreen[] = board.getSilkscreen(layer);
  if (layer === 0) {
    silkscreens.push(
      new PCBSilkscreen({
        layer: 0,
        shapes: [
          new PerimeterShape({
            thickness: 0.4,
            path: board.edges
          })
        ]
      })
    );
  }
  return GenerateGerberLayerFileContentFromMaterials(silkscreens, layerName, precision);
}


/** SOLDER MASK **/

export function GenerateGerberBoardTopSolderMaskLayer(board: PCBBoard, precision: GerberPrecision): string[] {
  return GenerateGerberBoardSolderMaskLayer(board, 0, `TopSolderMask`, precision);
}

export function GenerateGerberBoardBottomSolderMaskLayer(board: PCBBoard, precision: GerberPrecision): string[] {
  return GenerateGerberBoardSolderMaskLayer(board, -1, `BottomSolderMask`, precision);
}

export function GenerateGerberBoardSolderMaskLayer(
  board: PCBBoard,
  layer: number,
  layerName: string,
  precision: GerberPrecision,
): string[] {
  return GenerateGerberLayerFileContentFromMaterials(board.getSolderMask(layer), layerName, precision);
}


/** SOLDER MASK **/

export function GenerateGerberBoardEdges(board: PCBBoard, precision: GerberPrecision): string[] {
  return [
    ...GenerateGerberBoardLayerHeaders(`BoardEdges`),
    ...GenerateGerber(
      [
        new PerimeterShape({
          thickness: 0,
          path: board.edges
        })
      ],
      precision
    )
  ];
}


/** GENERIC **/

export function GenerateGerberLayerFileContentFromMaterials(
  materials: PCBMaterial[],
  layerName: string,
  precision: GerberPrecision,
): string[] {
  return [
    ...GenerateGerberBoardLayerHeaders(layerName),
    ...GenerateGerber(
      materials
        .map((material: PCBMaterial) => {
          return material.shapes;
        })
        .flat(),
      precision
    )
  ];
}
