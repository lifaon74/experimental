import { Path } from '@lifaon/path';
import { ShapePath } from './classes/shape/shape-path/shape-path';
import { Shape } from './classes/shape/shape';
import { mat3, vec2 } from 'gl-matrix';
import { GerberPrecision } from './exporters/gerber-and-excellon/gerber/gerber-precision';
import { PCBBoard } from './classes/pcb-board/pcb-board';
import { GenerateGerber } from './exporters/gerber-and-excellon/gerber/generate/functions';
import { Object2DGroup } from './classes/objects-tree/2d/object-2d-group/implementation';
import { IObject2DGroup } from './classes/objects-tree/2d/object-2d-group/interfaces';
import { AreaShape } from './classes/shape/build-in/area/area-shape';
import { PerimeterShape } from './classes/shape/build-in/perimeter/perimeter-shape';
import { PCBPart } from './classes/pcb-board/pcb-part/pcb-part';
import {
  NormalizePCBLayer, TPCBLayer, VerifyPCBLayerIsExternal
} from './classes/pcb-board/pcb-material/pcb-material-with-layer';
import { PCBCopper } from './classes/pcb-board/pcb-material/built-in/copper/pcb-copper';
import { PCBSilkscreen } from './classes/pcb-board/pcb-material/built-in/silkscreen/pcb-silkscreen';
import { ExportBoardToGerberAndExcellon } from './exporters/gerber-and-excellon/export-board-to-gerber-and-excellon';


/**
 * LINKS:
 *  http://support.seeedstudio.com/knowledgebase/articles/493833-what-is-gerber-file
 *
 Extension                       Layer
 pcbname.GTL                 Top Copper
 pcbname.GTS                 Top Soldermask
 pcbname.GTO                 Top Silkscreen

 pcbname.GBL                 Bottom copper
 pcbname.GBS                 Bottom Soldermask:
 pcbname.GBO                 Bottom Silkscreen:
 pcbname.TXT                  Drills
 pcbname.GML/GKO        *Board Outline:

 4 layer board also need
 pcbname.GL2                   Inner Layer2
 pcbname.GL3                   Inner Layer3


 RS-274X format

 https://www.ucamco.com/files/downloads/file/81/The_Gerber_File_Format_specification.pdf?dd1347f8978ee2fb4532ef5613d36e70

 */

const ROOT = Path.process();
const DIST = ROOT.concat('dist');
const TMP = DIST.concat('tmp');


/*--------------*/

// https://en.wikipedia.org/wiki/Quad_Flat_Package

export function pad(layer: TPCBLayer, width: number, height: number): PCBPart {
  VerifyPCBLayerIsExternal(NormalizePCBLayer(layer));
  return new PCBPart({
    materials: [
      new PCBCopper({
        layer,
        shapes: [
          new AreaShape({
            path: ShapePath.rectangle(width, height),
            sharpness: 0,
          })
        ]
      })
    ]
  });
}

export function icSilkScreen(layer: TPCBLayer, width: number, height: number): PCBPart {
  const thickness: number = 0.2;
  const markSpacing: number = 0.2;
  const markRadius: number = 0.3;
  const markOffset: number = thickness + markSpacing + markRadius;

  return new PCBPart({
    materials: [
      new PCBSilkscreen({
        layer: layer,
        shapes: [
          new PerimeterShape({
            modelMatrix: mat3.fromTranslation(mat3.create(), vec2.fromValues(thickness / 2, thickness / 2)),
            path: ShapePath.rectangle(width - thickness, height - thickness),
            thickness,
          })
        ]
      }),
      new PCBSilkscreen({
        layer: layer,
        shapes: [
          new AreaShape(AreaShape.circle(markRadius, mat3.fromTranslation(mat3.create(), vec2.fromValues(markOffset, height - markOffset))))
        ]
      })
    ]
  });
}

export function soic(layer: TPCBLayer, pinCount: number): IObject2DGroup<PCBPart> {
  VerifyPCBLayerIsExternal(NormalizePCBLayer(layer));

  const padWidth: number = 2.2;
  const padHeight: number = 0.6;
  const padSpacing: number = 3.0;
  const padXDistance: number = padWidth + padSpacing;
  const padYDistance: number = 1.27;
  const silkScreenSpacing: number = 0.1;

  return new Object2DGroup<PCBPart>({
    children: [
      ...Array.from<void, PCBPart>({ length: pinCount }, (v: any, index: number) => {
        return pad(layer, padWidth, padHeight)
          .translate([(index % 2) * padXDistance, Math.floor(index / 2) * padYDistance]);
      }),
      icSilkScreen(layer, padSpacing - (silkScreenSpacing * 2), padYDistance * Math.ceil(pinCount / 2))
        .translate([padWidth + silkScreenSpacing, -(padYDistance / 4)]),
    ]
  });
}


/** GERBER **/


/*---*/

async function __storeGerberFile(content: string) {
  const GERBER = TMP.concat('file.gbr');
  const $fs = require('fs').promises;

  await $fs.mkdir(TMP.toString(), { recursive: true });
  await $fs.writeFile(GERBER.toString(), content);
}


/** RUN **/

export async function debugPCB1() {
  const precision = new GerberPrecision(3, 3);

  /* SHAPE */
  // const isPerimeter: boolean = true;
  const isPerimeter: boolean = false;


  const shapeTransform = mat3.fromTranslation(mat3.create(), vec2.fromValues(2.5, 2.5));
  const shapePath = ShapePath.rectangle(5, 5);

  // const shapeTransform = mat3.fromTranslation(mat3.create(), vec2.fromValues(5, 7.5));
  // const shapePath = ShapePath.arc(vec2.fromValues(0, -2.5), -Math.PI / 2);

  const shape =
    isPerimeter
      ? new PerimeterShape({
        thickness: 0.3,
        path: shapePath,
        modelMatrix: shapeTransform
      })
      : new AreaShape({
        path: shapePath,
        modelMatrix: shapeTransform
      });


  const shapes: Shape[] = [shape];
  const lines: string[] = GenerateGerber(shapes, precision);

  const content = lines.join('\n');
  console.log(content);
  await __storeGerberFile(content);
}

export async function debugPCB2() {
  const precision = new GerberPrecision(3, 3);

  const shapes: Shape[] = [
    new AreaShape({
      path: ShapePath.rectangle(5, 5),
      modelMatrix: mat3.fromTranslation(mat3.create(), vec2.fromValues(2.5, 2.5))
    }),
    // new AreaShape({
    //   mode: 'sub',
    //   path: ShapePath.rectangle(2, 2),
    //   modelMatrix: mat3.fromTranslation(mat3.create(), vec2.fromValues(4, 4))
    // }),
    new AreaShape({
      mode: 'sub',
      ...Shape.circle(2, mat3.fromTranslation(mat3.create(), vec2.fromValues(5, 5)))
    }),
  ];

  const lines: string[] = GenerateGerber(shapes, precision);

  const content = lines.join('\n');
  console.log(content);
  await __storeGerberFile(content);
}


export async function debugPCB3() {
  const precision = new GerberPrecision(3, 3);

  const board = new PCBBoard({
    shape: ShapePath.rectangle(50, 50),
    layers: 2,
    children: [
      soic(0, 8),
      // pad(0, 10, 10)
      //   .rotate(Math.PI / 4)
      //   .translate([5, 5]),
    ]
  });

  await ExportBoardToGerberAndExcellon({
    board,
    precision,
    output: {
      dir: TMP,
      name: 'board'
    }
  });
}


export async function debugPCB() {
  // await debugPCB1();
  // await debugPCB2();
  await debugPCB3();
}








