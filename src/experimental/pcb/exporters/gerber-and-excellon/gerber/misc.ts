import { mat3, vec2 } from 'gl-matrix';
import { NULL_VEC2, TMP_VEC2 } from '../../../classes/objects-tree/2d/constants';
import { IGerberCoordinates } from './gerber-precision';

export function Mat3To2DPosition(
  out: vec2,
  mat: mat3
): vec2 {
  return vec2.transformMat3(out, NULL_VEC2, mat);
}

export function Mat3ToGerberCoordinatesOption(mat: mat3): IGerberCoordinates {
  const position: vec2 = Mat3To2DPosition(TMP_VEC2, mat);
  return {
    x: position[0],
    y: position[1]
  };
}

