import { Path } from '@lifaon/path';
import { ShapePath } from './shapes/shape-path';
import { AreaShape, PerimeterShape } from './shapes/shape';
import { GenerateGerberEndOfFile, GenerateGerberUsedUnit, GerberPrecision } from './gerber/generate-functions';


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



/**
 * TODO add support for complex shapes:
 *  - many areas / perimeters (sub-shapes)
 *  - possibility to add a transform for each sub shape
 *  - possibility to mark shape as additive or subtractive
 */


/** GERBER **/


export async function GenerateGerber() {
  const precision = new GerberPrecision(3, 3);
  // console.log(precision.formatNumber(123.456789));
  // console.log(precision.formatNumber(2.5));

  const lines: string[] = [
    precision.toGerberFormatSpecification(),
    GenerateGerberUsedUnit('mm'),
    // GenerateGerberApertureDefinition(GeFreeApertureID(), GenerateGerberApertureCircleTemplate(0.5)),
  ];

  // console.log(precision.toGerberCoordinates({ x: 2.5, y: 2.5 }));

  /* SHAPE */
  const isPerimeter: boolean = true;

  const shapePath = ShapePath.rectangle(50, 50);

  const shape =
    isPerimeter
      ? new PerimeterShape({
        thickness: 0.3,
        path: shapePath
      })
      : new AreaShape({
        path: shapePath
      });


  lines.push(
    ...shape.toGerber({
      precision
    })
  );

  lines.push(GenerateGerberEndOfFile());

  const content = lines.join('\n');
  console.log(content);
  await __storeGerberFile(content);
}

async function __storeGerberFile(content: string) {
  const ROOT = Path.process();
  const DIST = ROOT.concat('dist');
  const TMP = DIST.concat('tmp');
  const GERBER = TMP.concat('file.gbr');
  const $fs = require('fs').promises;

  await $fs.mkdir(TMP.toString(), { recursive: true });
  await $fs.writeFile(GERBER.toString(), content);
}


/** RUN **/

export async function debugPCB() {
  await GenerateGerber();
}


/**
 * Samples:
 */


/*

rectangle at 2.5x2.5, with a size of 5x5

%ADD11R,.178X.178*%
G36*
G01*
X2500Y7500D02*
X7500D01*
Y2500D01*
X2500D01*
Y7500D01*

*/

/*
line at 2.5x5, ending at 7.5x5, with a thickness of 0.3

%ADD10C,.3*%
D10*
G01*
X2500Y5000D02*
X7500D01*

 */







