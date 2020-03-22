import { Path } from '@lifaon/path';
import { ShapePath } from './classes/shape/shape-path/shape-path';
import { Shape } from './classes/shape/shape';
import { mat3, vec2 } from 'gl-matrix';
import { GerberPrecision } from './exporters/gerber-and-excellon/gerber/gerber-precision';
import { PCBBoard } from './classes/pcb-board/pcb-board';
import { GenerateGerber } from './exporters/gerber-and-excellon/gerber/functions';
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
import { PCBSolderMask } from './classes/pcb-board/pcb-material/built-in/solder-mask/pcb-solder-mask';
import { PCBDrill } from './classes/pcb-board/pcb-material/built-in/drill/pcb-drill';
import { PCBPartGroup } from './classes/pcb-board/pcb-part-group/pcb-part-group';
import { BOM } from './classes/pcb-board/bom/bom';
import { DetectDrillHoleFromShape, GenerateExcellon } from './exporters/gerber-and-excellon/excellon/functions';


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

  const area: AreaShape = new AreaShape({
    path: ShapePath.rectangle(width, height),
    sharpness: 0,
  });

  return new PCBPart({
    materials: [
      new PCBCopper({
        layer,
        shapes: [
          area
        ]
      }),
      new PCBSolderMask({
        layer,
        shapes: [
          area.clone()
        ]
      })
    ]
  });
}

export function circular_pad(layer: TPCBLayer, radius: number): PCBPart {
  VerifyPCBLayerIsExternal(NormalizePCBLayer(layer));

  const area: AreaShape = new AreaShape({
    path: ShapePath.circle(radius)
  });

  return new PCBPart({
    materials: [
      new PCBCopper({
        layer,
        shapes: [
          area
        ]
      }),
      new PCBSolderMask({
        layer,
        shapes: [
          area.clone()
        ]
      })
    ]
  });
}

export function hole(radius: number): PCBPart {
  return new PCBPart({
    materials: [
      new PCBDrill({
        shapes: [
          new AreaShape({
            path: ShapePath.circle(radius)
          })
        ]
      })
    ]
  });
}

export function through_hole(innerRadius: number, border: number): PCBPartGroup {
  const outerRadius: number = innerRadius + border;
  return new PCBPartGroup({
    children: [
      circular_pad('top', outerRadius),
      circular_pad('bottom', outerRadius),
      hole(innerRadius),
    ]
  });
}

export function via(innerRadius: number = 0.1, border: number = 0.1): PCBPartGroup {
  return through_hole(innerRadius, border);
}

/**
 * Creates the silkscreen for an integrated circuit
 * - origin: bottom left corner
 * - mark: top left corner
 * - not inverted if bottom layer
 */
export function ic_silkscreen(layer: TPCBLayer, width: number, height: number): PCBPart {
  VerifyPCBLayerIsExternal(NormalizePCBLayer(layer));

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
          new AreaShape({
            modelMatrix: mat3.fromTranslation(mat3.create(), vec2.fromValues(markOffset, height - markOffset)),
            path: ShapePath.circle(markRadius),
          })
        ]
      })
    ]
  });
}

/**
 * Creates a SOIC footprint
 *  - origin: bottom left pad
 *  - mark: top left corner
 *  - not inverted if bottom layer
 */
export function soic(layer: TPCBLayer, pins: string[]): PCBPartGroup {
  VerifyPCBLayerIsExternal(NormalizePCBLayer(layer));

  const padWidth: number = 2.2;
  const padHeight: number = 0.6;
  const padXSpacing: number = 3.0;
  const padXOffset: number = padWidth + padXSpacing;
  const padYOffset: number = 1.27;
  const silkScreenSpacing: number = 0.1;

  return new PCBPartGroup({
    children: [
      ...pins.map((pinName: string, index: number) => {
        const x: number = Math.floor(index / 8);
        return pad(layer, padWidth, padHeight)
          .translate([
            x * padXOffset,
            (((x * -7) + index) % 8) * padYOffset
          ])
          .setComment(`Pin: ${ pinName }`)
      }),
      ic_silkscreen(layer, padXSpacing - (silkScreenSpacing * 2), padYOffset * Math.ceil(pins.length / 2))
        .translate([padWidth + silkScreenSpacing, -(padYOffset / 4)]),
    ]
  });
}

export function soic_74HC595(id: string, layer: TPCBLayer): PCBPartGroup {
  return soic(layer, [
    'Q1',
    'Q2',
    'Q3',
    'Q4',
    'Q5',
    'Q6',
    'Q7',
    'GND',

    'Q7"',
    'MR',
    'SH_CP',
    'ST_CP',
    'OE',
    'DS',
    'Q0',
    'VCC',
  ])
    .setBom(new BOM({
      id,
      comment: '74HC595',
      footprint: 'SOP-16'
    }));
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
      path: ShapePath.circle(2),
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
    edges: ShapePath.rectangle(10, 10),
    layers: 2,
    children: [
      // soic_74HC595('IC1', 0)
      //   .translate([10, 10]),
      through_hole(2, 3)
      // pad(0, 10, 10)
      // circular_pad(0, 10)
        .rotate(Math.PI / 2)
        // .uniformScale(2)
        .translate([5, 5])
      ,
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


export async function debugPCBText() {
  // https://www.w3.org/TR/SVG11/paths.html#PathData
  const path: string = `M512,800C321.184,800,160,697.408,160,576C160,567.168,167.168,560,176,560C184.832,560,192,567.168,192,576C192,678.272,341.536,768,512,768C520.8,768,528,775.168,528,784C528,792.832,520.832,800,512,800C512,800,512,800,512,800M512,960C229.216,960,0,788.064,0,576C0,443.936,88.928,327.488,224.256,258.368C224.256,257.504,224,256.928,224,256C224,198.624,181.152,136.864,162.304,104.448C162.336,104.448,162.368,104.448,162.368,104.448C160.864,100.928,160,97.056,160,92.992C160,76.992,172.96,64,188.992,64C192,64,197.28,64.8,197.152,64.448C297.152,80.832,391.36,172.704,413.248,199.328C445.216,194.624,478.176,192,512,192C794.72,192,1024,363.936,1024,576C1024,788.064,794.752,960,512,960C512,960,512,960,512,960M512,256C482.656,256,452.544,258.24,422.528,262.624C419.424,263.136,416.32,263.296,413.248,263.296C394.24,263.296,376.032,254.848,363.776,239.936C350.08,223.264,311.104,186.048,265.056,158.688C277.536,187.328,287.296,219.424,287.968,252.512C288.16,254.56,288.256,256.64,288.256,258.4C288.256,282.464,274.784,304.448,253.376,315.392C134.784,375.936,64,473.376,64,576C64,752.448,264.96,896,512,896C758.976,896,960,752.448,960,576C960,399.552,759.008,256,512,256C512,256,512,256,512,256`;
}

/**
 * TODO:
 *  - manage text
 *  - invert layer
 *  - pouring
 *  - holes
 */

export async function debugPCB() {
  // await debugPCB1();
  // await debugPCB2();
  await debugPCB3();
  // await debugPCBText();
}








