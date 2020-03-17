import { vec2 } from 'gl-matrix';


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


export class Aperture {
  public readonly origin: vec2;
}

export class GerberImage {

}




