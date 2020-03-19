import { ShapePath } from './shape-path';
import { mat3 } from 'gl-matrix';
import { GerberPrecision } from '../gerber/generate-functions';


/** SHAPES **/

export type TShapeMode = 'add' | 'sub';

export interface IShapeOptions {
  path: ShapePath;
  transform?: mat3;
  mode?: TShapeMode; // (default: 'add')
}

export interface IShapeToGerberOptions {
  precision: GerberPrecision;
}

export abstract class Shape implements IShapeOptions {
  public readonly path: ShapePath;
  public readonly transform: mat3;
  public readonly mode: TShapeMode;

  protected constructor(options: IShapeOptions) {
    this.path = options.path;

    this.transform = (options.transform === void 0)
      ? mat3.create()
      : options.transform;

    this.mode = (options.mode === void 0)
      ? 'add'
      : options.mode;
  }

  abstract toGerber(options: IShapeToGerberOptions): string[];
}


export interface IPerimeterShapeOptions extends IShapeOptions {
  thickness: number;
}

export class PerimeterShape extends Shape implements IPerimeterShapeOptions {
  public readonly thickness: number;

  constructor(options: IPerimeterShapeOptions) {
    super(options);
    this.thickness = (options.thickness === void 0)
      ? 0
      : options.thickness;
  }

  toGerber(options: IShapeToGerberOptions): string[] {
    // TODO
    return [
      `%ADD10C,.3*%`,
      `D10*`,
      `G01*`,
      `X2500Y5000D02*`,
      `X5000Y7500D01*`,
      `X7500Y5000D01*`,
      `X5000Y2500D01*`,
      `X2500Y5000D01*`,
    ];
  }
}


export interface IAreaShapeOptions extends IShapeOptions {
  sharpness?: number;
}

export class AreaShape extends Shape implements IAreaShapeOptions {
  public readonly sharpness: number;

  constructor(options: IAreaShapeOptions) {
    super(options);
    this.sharpness = (options.sharpness === void 0)
      ? 0
      : options.sharpness;
  }

  toGerber(options: IShapeToGerberOptions): string[] {
    throw 'TODO';
  }
}
