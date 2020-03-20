import { PCBBoard } from '../../../../classes/pcb-board/pcb-board';
import { GerberPrecision } from '../gerber-precision';
import { GenerateGerber, GenerateGerberHeaders } from './functions';
import { PCBCopper } from '../../../../classes/pcb-board/pcb-material/built-in/copper/pcb-copper';


export interface IGerberExtensionAndGenerator {
  extension: string;
  generator: (board: PCBBoard, precision: GerberPrecision) => string[],
}

export const GERBER_GENERATORS: IGerberExtensionAndGenerator[] = [
  {
    extension: 'gtl',
    generator: GenerateGerberBoardTopLayer
  },
  {
    extension: 'gbl',
    generator: GenerateGerberBoardBottomLayer
  },
];


export function GenerateBoardGerberFiles(
  board: PCBBoard,
  precision: GerberPrecision,
  name: string,
): [string, string][] { // [file name, content]
  return GERBER_GENERATORS.map((render: IGerberExtensionAndGenerator) => {
    return [
      `${ name }.${ render.extension }`,
      GenerateGerberBoardTopLayer(board, precision).join('\n')
    ];
  });
}


export function GenerateGerberBoardLayerHeaders(layerName: string): string[] {
  return GenerateGerberHeaders([
    [`Format`, ` Gerber RS-274X`],
    [`Layer`, layerName],
    [`Generated Date`, new Date().toUTCString()],
    // [`Created Using`, `PCBTS`],
  ] as Iterable<[string, string]>);
}


export function GenerateGerberBoardTopLayer(board: PCBBoard, precision: GerberPrecision): string[] {
  return GenerateGerberBoardCopperLayer(board, 0, `TopCopper`, precision);
}

export function GenerateGerberBoardBottomLayer(board: PCBBoard, precision: GerberPrecision): string[] {
  return GenerateGerberBoardCopperLayer(board, -1, `BottomCopper`, precision);
}

export function GenerateGerberBoardCopperLayer(
  board: PCBBoard,
  layer: number,
  name: string,
  precision: GerberPrecision,
): string[] {
  return [
    ...GenerateGerberBoardLayerHeaders(name),
    ...GenerateGerber(
      board.getCopper(layer)
        .map((material: PCBCopper) => {
          return material.shapes;
        })
        .flat(),
      precision
    )
  ];
}
