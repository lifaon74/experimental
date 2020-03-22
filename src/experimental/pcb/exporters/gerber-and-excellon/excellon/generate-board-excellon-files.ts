import { PCBBoard } from '../../../classes/pcb-board/pcb-board';
import { GenerateExcellon } from './functions';
import { PCBMaterial } from '../../../classes/pcb-board/pcb-material/pcb-material';

export function GenerateBoardExcellonFiles(
  board: PCBBoard,
  name: string,
): [string, string][] { // [file name, content]
  return [
    [
      `${name}.txt`,
      GenerateExcellonFileContentFromMaterials(board.getDrill()).join('\n')
    ]
  ];
}

export function GenerateExcellonFileContentFromMaterials(
  materials: PCBMaterial[],
): string[] {
  return GenerateExcellon(
    materials
      .map((material: PCBMaterial) => {
        return material.shapes;
      })
      .flat(),
    GetExcellonBoardLayerHeaders(),
  );
}

export function GetExcellonBoardLayerHeaders(): [string, string][] {
  return [
    [`Format`, `XNC`],
    [`Generated Date`, new Date().toUTCString()],
    // [`Created Using`, `PCBTS`],
  ];
}


