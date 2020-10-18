import { VoxelOctree } from '../octree';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';

//
// export interface IVoxelOctree {
//
// }
//
// export function RayTraceVoxelOctrees(
//
// ) {
//
// }




/*------------*/

export interface ILight {
  color: vec3;
  intensity: number;
}


export interface IVoxelOctreeForRayTrace {
  voxelOctree: VoxelOctree;
  matrix: mat4;
}

export interface ILightForRayTrace {
  light: ILight;
  matrix: mat4;
}

// http://learnwebgl.brown37.net/08_projections/projections_perspective.html#:~:text=Typical%20values%20for%20near%20and,A%20perspective%20projection%20demo.

// https://learnopengl.com/Getting-started/Coordinate-Systems
// https://www.3dgep.com/understanding-the-view-matrix/#:~:text=The%20view%20matrix%20on%20the,space%20in%20the%20vertex%20program.
// MVP=P∗V∗M
// v′=MVP∗v
// mvp put us in the normal space [-1, 1]

export function raytrace(
  rayColor: vec4, // [r, g, b, a = 1 - energy] in [0, 1]
  x: number,
  y: number,
  voxelOctrees: readonly IVoxelOctreeForRayTrace[],
  lights: readonly ILightForRayTrace[],
  ambientLightColor: vec3,
) {
  const origin: vec4 = [x, y, 0, 1];
  const vector: vec4 = [0, 0, -1, 0];

  const voxel = voxelOctrees[0];

  console.log(vec4.transformMat4(vec4.create(), origin, voxel.matrix));

  /// TODO continue here
}







/*--*/

export function hitCubeInUnrolled(
  out: vec3,
  origin: vec3,
  vector: vec3,
  side: number,
): vec3 {
  let oz = origin[2];
  let vz = vector[2];
  // XY plane, static Z
  if ((vz > 0) && (oz <= 0)) {
    const _x: number = (((-oz) * vector[0]) / vz) + origin[0];
    if ((0 <= _x) && (_x < side)) {
      const _y: number = (((-oz) * vector[1]) / vz) + origin[1];
      if ((0 <= _y) && (_y < side)) {
        out[0] = _x;
        out[1] = _y;
        out[2] = 0;
        return out;
      }
    }
  } else if ((vz < 0) && (oz >= side)) {
    const _x: number = (((-oz + side) * vector[0]) / vz) + origin[0];
    if ((0 <= _x) && (_x < side)) {
      const _y: number = (((-oz + side) * vector[1]) / vz) + origin[1];
      if ((0 <= _y) && (_y < side)) {
        out[0] = _x;
        out[1] = _y;
        out[2] = side;
        return out;
      }
    }
  }

  oz = origin[0];
  vz = vector[0];
  // XY plane, static Z
  if ((vz > 0) && (oz <= 0)) {
    const _x: number = (((-oz) * vector[1]) / vz) + origin[1];
    if ((0 <= _x) && (_x < side)) {
      const _y: number = (((-oz) * vector[2]) / vz) + origin[2];
      if ((0 <= _y) && (_y < side)) {
        out[1] = _x;
        out[2] = _y;
        out[0] = 0;
        return out;
      }
    }
  } else if ((vz < 0) && (oz >= side)) {
    const _x: number = (((-oz + side) * vector[1]) / vz) + origin[1];
    if ((0 <= _x) && (_x < side)) {
      const _y: number = (((-oz + side) * vector[2]) / vz) + origin[2];
      if ((0 <= _y) && (_y < side)) {
        out[1] = _x;
        out[2] = _y;
        out[0] = side;
        return out;
      }
    }
  }

  oz = origin[1];
  vz = vector[1];
  // XY plane, static Z
  if ((vz > 0) && (oz <= 0)) {
    const _x: number = (((-oz) * vector[2]) / vz) + origin[2];
    if ((0 <= _x) && (_x < side)) {
      const _y: number = (((-oz) * vector[0]) / vz) + origin[0];
      if ((0 <= _y) && (_y < side)) {
        out[2] = _x;
        out[0] = _y;
        out[1] = 0;
        return out;
      }
    }
  } else if ((vz < 0) && (oz >= side)) {
    const _x: number = (((-oz + side) * vector[2]) / vz) + origin[2];
    if ((0 <= _x) && (_x < side)) {
      const _y: number = (((-oz + side) * vector[0]) / vz) + origin[0];
      if ((0 <= _y) && (_y < side)) {
        out[2] = _x;
        out[0] = _y;
        out[1] = side;
        return out;
      }
    }
  }

  out[0] = Number.NaN;
  return out;
}

export function hitXAxisSegmentUnrolled(
  originX: number,
  originY: number,
  vectorX: number,
  vectorY: number,
  length: number,
): number {
  // const x: number = intersectXAxisUnrolled(originX, originY, vectorX, vectorY);
  const x: number = (((-originY) * vectorX) / vectorY) + originX;
  return ((0 <= x) && (x < length))
    ? x
    : Number.NaN;
}

export function intersectXAxisUnrolled(
  originX: number,
  originY: number,
  vectorX: number,
  vectorY: number,
): number {
  return (((-originY) * vectorX) / vectorY) + originX;
}


/*------*/




