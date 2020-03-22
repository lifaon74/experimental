import { IPath, Path, TPathInput } from '@lifaon/path';
import { promises as $fs } from 'fs';
import { GenerateBoardGerberFiles } from './gerber/generate-board-gerber-files';
import { PCBBoard } from '../../classes/pcb-board/pcb-board';
import { GerberPrecision } from './gerber/gerber-precision';
import { GenerateZip } from '../misc/generate-zip';
import { GenerateBoardExcellonFiles } from './excellon/generate-board-excellon-files';


export interface IExportBoardToGerberAndExcellonOptions {
  board: PCBBoard;
  precision: GerberPrecision;
  output: {
    dir: TPathInput;
    name: string;
  };
}

export function ExportBoardToGerberAndExcellon(options: IExportBoardToGerberAndExcellonOptions): Promise<void> {
  const _outDir: IPath = Path.of(options.output.dir);

  return $fs.mkdir(_outDir.toString(), { recursive: true })
    .then(() => {
      const files: [string, string][] = GenerateBoardGerberAndExcellonFiles(options.board, options.precision, options.output.name);

      return Promise.all([
        GenerateZip(files)
          .then((content: Uint8Array) => {
            return $fs.writeFile(_outDir.concat(`${ options.output.name }.zip`).toString(), content);
          }),
        ...files.map(([fileName, content]: [string, string]) => {
          return $fs.writeFile(_outDir.concat(fileName).toString(), content);
        })
      ])
        .then(() => {
        });
    });
}


export function GenerateBoardGerberAndExcellonFiles(
  board: PCBBoard,
  precision: GerberPrecision,
  name: string,
): [string, string][] { // [file name, content]
  return [
    ...GenerateBoardGerberFiles(board, precision, name),
    ...GenerateBoardExcellonFiles(board, name),
  ];
}
