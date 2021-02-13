import { convertVoxelOctreeDepthToSide, VoxelOctree } from '../octree';
import { mat4, vec3, vec4 } from 'gl-matrix';
import { NO_MATERIAL } from '../material';
import {
  convertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex,
  convertVoxelOctreeCoordinatesToVoxelOctreeChildIndex, isVoxelOctreeChildIndexAVoxelOctreeAddress,
  IVoxelOctreeCoordinates
} from '../octree-children';
import { readAddress } from '../memory-address';
import { isValidHitPoint } from './collide/is-valid-hit-point';
import { isPointOnCubeSurfaceOrOut } from './collide/is-point-on-cube-surface';
import { hitCubeOut } from './collide/hit-cube-out';
import { nextHitCubeIn } from './collide/next-hit-cube-in';

/*---------------*/

function vec3TransformMat4Z(a: vec3, m: mat4): number {
  // vec3.transformMat4(vec3.create(), a, m)[2];
  let x = a[0], y = a[1], z = a[2];
  let w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  return (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
}

function nullVec3TransformMat4(out: vec3, m: mat4): vec3 {
  const w = m[15] || 1.0;
  out[0] = m[12] / w;
  out[1] = m[13] / w;
  out[2] = m[14] / w;
  return out;
}

/*---------------*/

function convertHitPositionToVoxelOctreeCoordinates(
  rayVector: vec3,
  hitPosition: vec3,
  side: number,
  voxelOctreeCoordinates: IVoxelOctreeCoordinates,
): void {
  // intHitPosition[0] = hitPosition[0] - ((rayVector[0] < 0) ? Number.EPSILON : 0);
  // intHitPosition[1] = hitPosition[1] - ((rayVector[1] < 0) ? Number.EPSILON : 0);
  // intHitPosition[2] = hitPosition[2] - ((rayVector[2] < 0) ? Number.EPSILON : 0);
  for (let i = 0; i < 3; i++) {
    voxelOctreeCoordinates[i] = hitPosition[i];
    if ((rayVector[i] < 0) && (voxelOctreeCoordinates[i] === hitPosition[i])) {
      voxelOctreeCoordinates[i]--;
    }
  }
}

function convertVoxelOctreeCoordinatesToVoxelOctreeChildPosition(
  voxelOctreeCoordinates: IVoxelOctreeCoordinates,
  side: number,
  voxelOctreeChildCoordinates: vec3,
): void {
  for (let i = 0; i < 3; i++) {
    voxelOctreeChildCoordinates[i] = Math.floor(voxelOctreeCoordinates[i] / side) * side;
  }
  // const mask: number = ~(side - 1);
  // for (let i: number = 0; i < 3; i++) {
  //   voxelOctreeChildCoordinates[i] = voxelOctreeCoordinates[i] & mask;
  // }
}

const HIT_POSITION_VOXEL_OCTREE_COORDINATES: IVoxelOctreeCoordinates = new Uint16Array(3);
const VOXEL_OCTREE_CHILD_POSITION: vec3 = vec3.create();

/**
 * Computes the hit position and the material id of a ray on a <voxelOctree>
 */
export function voxelOctreeRaytrace(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  rayPosition: vec3,
  rayVector: vec3,
  hitPosition: vec3,
): number { // hitVoxelMaterialAddress

  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);
  // hitCubeIn(rayPosition, rayVector, side, hitPosition);
  nextHitCubeIn(rayPosition, rayVector, side, hitPosition);

  let i: number = 0;
  if (isValidHitPoint(hitPosition)) {
    while (i++ < side) {
      convertHitPositionToVoxelOctreeCoordinates(rayVector, hitPosition, side, HIT_POSITION_VOXEL_OCTREE_COORDINATES);

      let localVoxelOctreeAddress: number = voxelOctreeAddress;
      let localVoxelOctreeDepth: number = voxelOctreeDepth;

      while (localVoxelOctreeDepth >= 0) {
        const voxelOctreeChildIndex: number = convertVoxelOctreeCoordinatesToVoxelOctreeChildIndex(localVoxelOctreeDepth, HIT_POSITION_VOXEL_OCTREE_COORDINATES);
        const voxelOctreeChildAddress: number = readAddress(memory, convertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex(localVoxelOctreeAddress, voxelOctreeChildIndex));
        if (isVoxelOctreeChildIndexAVoxelOctreeAddress(memory, localVoxelOctreeAddress, voxelOctreeChildIndex)) {
          localVoxelOctreeAddress = voxelOctreeChildAddress;
          localVoxelOctreeDepth--;
        } else {
          if (voxelOctreeChildAddress === NO_MATERIAL) {
            const localSide: number = 1 << localVoxelOctreeDepth;
            convertVoxelOctreeCoordinatesToVoxelOctreeChildPosition(HIT_POSITION_VOXEL_OCTREE_COORDINATES, localSide, VOXEL_OCTREE_CHILD_POSITION);
            hitCubeOut(rayPosition, rayVector, VOXEL_OCTREE_CHILD_POSITION, localSide, hitPosition);

            if (!isValidHitPoint(hitPosition)) {
              debugger;
              hitCubeOut(rayPosition, rayVector, VOXEL_OCTREE_CHILD_POSITION, localSide, hitPosition);
              return NO_MATERIAL;
            }

            if (isPointOnCubeSurfaceOrOut(hitPosition, side)) {
              return NO_MATERIAL;
            } else {
              break;
            }
          } else {
            return voxelOctreeChildAddress;
          }
        }
      }
    }
  }

  return NO_MATERIAL;
}


/**
 * @see voxelOctreeRaytrace with different params
 */
export function voxelOctreeObjectRaytrace(
  voxelOctree: VoxelOctree,
  rayPosition: vec3,
  rayVector: vec3,
  hitPosition: vec3,
): number {
  return voxelOctreeRaytrace(
    voxelOctree.memory,
    voxelOctree.address,
    voxelOctree.depth,
    rayPosition,
    rayVector,
    hitPosition,
  );
}

/*----------------------------*/

export interface IObject3DVoxelOctree {
  voxelOctree: VoxelOctree;
  mvp: mat4;
  mvpi: mat4;
}

export interface IVoxelOctreeRaytraceManyResult {
  index: number;
  voxelMaterialAddress: number;
  hitPosition: vec3;
}

// const POINT_A_IN_CLIPPING_SPACE: vec3 = vec3.fromValues(0, 0, -1);
// const POINT_B_IN_CLIPPING_SPACE: vec3 = vec3.fromValues(0, 0, 1);
const POINT_A_IN_MODEL_SPACE: vec3 = vec3.create();
const POINT_B_IN_MODEL_SPACE: vec3 = vec3.create();
const RAY_VECTOR: vec3 = vec3.create();
const HIT_POSITION: vec3 = vec3.create();


/**
 * Computes the hit position and the material id of a ray on many <voxelOctree>
 */
export function voxelOctreeRaytraceMany(
  voxelOctrees: IObject3DVoxelOctree[],
  pointAInClippingSpace: vec3, // origin (start point) of the ray
  pointBInClippingSpace: vec3, // destination (end point) of the ray
  result: IVoxelOctreeRaytraceManyResult,
): void {
  result.index = -1;
  result.voxelMaterialAddress = NO_MATERIAL;
  // TODO: discard points where Z is outside of clipping space ?
  let hitPositionZInClippingSpace: number = Number.POSITIVE_INFINITY;

  for (let i = 0, l = voxelOctrees.length; i < l; i++) {
    const object3DVoxelOctree: IObject3DVoxelOctree = voxelOctrees[i];
    vec3.transformMat4(POINT_A_IN_MODEL_SPACE, pointAInClippingSpace, object3DVoxelOctree.mvpi);
    vec3.transformMat4(POINT_B_IN_MODEL_SPACE, pointBInClippingSpace, object3DVoxelOctree.mvpi);
    vec3.sub(RAY_VECTOR, POINT_B_IN_MODEL_SPACE, POINT_A_IN_MODEL_SPACE);
    const localVoxelMaterialAddress: number = voxelOctreeObjectRaytrace(object3DVoxelOctree.voxelOctree, POINT_A_IN_MODEL_SPACE, RAY_VECTOR, HIT_POSITION);
    if (localVoxelMaterialAddress !== NO_MATERIAL) {
      const z: number = vec3TransformMat4Z(HIT_POSITION, object3DVoxelOctree.mvp);

      if (z < hitPositionZInClippingSpace) {
        result.index = i;
        result.voxelMaterialAddress = localVoxelMaterialAddress;
        vec3.copy(result.hitPosition, HIT_POSITION);
        hitPositionZInClippingSpace = z;
      }
    }
  }
}


/*----------------------------*/

export type ILightSpectrum = vec3;

/*
surface area of a sphere: 4πr2
 */

// const PI_4 = Math.PI * 4;
//
// export function getSurfaceAreaOfASphere(
//   radius: number
// ): number {
//   return PI_4 * radius * radius;
// }

export function getLightIntensityInvertFromRadius(
  radius: number,
): number {
  return (radius * radius);
}

export function getRadiusFromLightIntensityInvert(
  intensity: number,
): number {
  return Math.sqrt(intensity);
}


export function getLightIntensityFromRadius(
  radius: number,
): number {
  return 1 / getLightIntensityInvertFromRadius(radius);
}

export function getRadiusFromLightIntensity(
  intensity: number,
): number {
  return 1 / getRadiusFromLightIntensityInvert(intensity);
}

// point at which the light is considered totally dark
export const DARK_THRESHOLD = 0.01;


export function normalizeLightSpectrumForRadius(
  spectrum: ILightSpectrum, // light intensity for this radius
  radius: number,
): vec3 {
  return vec3.scale(spectrum, spectrum, 2);
}

/*---*/

const RAY_VECTOR_FOR_LIGHT: vec3 = vec3.create();
const RAY_POSITION_IN_MODEL_SPACE: vec3 = vec3.create();
const LIGHT_POSITION_IN_MODEL_SPACE: vec3 = vec3.create();
const HIT_POSITION_FOR_LIGHT: vec3 = vec3.create();

export function voxelOctreeLightRaytrace(
  voxelOctrees: IObject3DVoxelOctree[],
  rayPositionInClippingSpace: vec3,
  lightPositionInClippingSpace: vec3,
  hitVoxelOctree: IObject3DVoxelOctree,
  hitPosition: vec3,
): boolean {
  for (let i = 0, l = voxelOctrees.length; i < l; i++) {
    const object3DVoxelOctree: IObject3DVoxelOctree = voxelOctrees[i];
    if (object3DVoxelOctree === hitVoxelOctree) {
      vec3.copy(RAY_POSITION_IN_MODEL_SPACE, hitPosition);
    } else {
      vec3.transformMat4(RAY_POSITION_IN_MODEL_SPACE, rayPositionInClippingSpace, object3DVoxelOctree.mvpi);
    }
    vec3.transformMat4(LIGHT_POSITION_IN_MODEL_SPACE, lightPositionInClippingSpace, object3DVoxelOctree.mvpi);
    vec3.sub(RAY_VECTOR_FOR_LIGHT, LIGHT_POSITION_IN_MODEL_SPACE, RAY_POSITION_IN_MODEL_SPACE);
    const localVoxelMaterialAddress: number = voxelOctreeObjectRaytrace(object3DVoxelOctree.voxelOctree, RAY_POSITION_IN_MODEL_SPACE, RAY_VECTOR_FOR_LIGHT, HIT_POSITION_FOR_LIGHT);
    if (localVoxelMaterialAddress !== NO_MATERIAL) {
      return true;
    }
  }
  return false;
}

// export function voxelOctreeLightRaytrace(
//   voxelOctrees: IObject3DVoxelOctree[],
//   rayPositionInClippingSpace: vec3,
//   lightPositionInClippingSpace: vec3,
// ): boolean {
//   for (let i = 0, l = voxelOctrees.length; i < l; i++) {
//     const object3DVoxelOctree: IObject3DVoxelOctree = voxelOctrees[i];
//     vec3.transformMat4(RAY_POSITION_IN_MODEL_SPACE, rayPositionInClippingSpace, object3DVoxelOctree.mvpi);
//     vec3.transformMat4(LIGHT_POSITION_IN_MODEL_SPACE, lightPositionInClippingSpace, object3DVoxelOctree.mvpi);
//     vec3.sub(RAY_VECTOR_FOR_LIGHT, LIGHT_POSITION_IN_MODEL_SPACE, RAY_POSITION_IN_MODEL_SPACE);
//     const localVoxelMaterialAddress: number = voxelOctreeObjectRaytrace(object3DVoxelOctree.voxelOctree, RAY_POSITION_IN_MODEL_SPACE, RAY_VECTOR_FOR_LIGHT, HIT_POSITION_FOR_LIGHT);
//     if (localVoxelMaterialAddress !== NO_MATERIAL) {
//       return true;
//     }
//   }
//   return false;
// }

/*---*/

function fillColorAsEmpty(
  color: vec4,
): void {
  color[0] = 0;
  color[1] = 0;
  color[2] = 0;
  color[3] = 0;
}


// export function generateLightColorForRadius(
//   light: ILightSpectrum, // light intensity for this radius
//   radius: number,
//   darkThreshold: number = DARK_THRESHOLD,
// ): vec3 {
//   return vec3.scale(light, light, 2);
// }

export interface IObject3DLight {
  spectrum: ILightSpectrum;
  mvp: mat4;
  mvpi: mat4;
}

// TODO continue here

const VOXEL_OCTREE_RAYTRACE_MANY_RESULT: IVoxelOctreeRaytraceManyResult = {
  index: -1,
  voxelMaterialAddress: NO_MATERIAL,
  hitPosition: vec3.create(),
};

const LIGHT_SPECTRUM: ILightSpectrum = vec3.create();
const HIT_POSITION_IN_CLIPPING_SPACE: vec3 = vec3.create();
const HIT_POSITION_IN_LIGHT_SPACE: vec3 = vec3.create();
// const LIGHT_POSITION_IN_LIGHT_SPACE: vec3 = vec3.create();
const LIGHT_POSITION_IN_CLIPPING_SPACE: vec3 = vec3.create();

export function voxelOctreeRaytraceWithLights(
  voxelOctrees: IObject3DVoxelOctree[],
  lights: IObject3DLight[],
  ambientLightSpectrum: ILightSpectrum,
  pointAInClippingSpace: vec3,
  pointBInClippingSpace: vec3,
  color: vec4,
): void {
  const result: IVoxelOctreeRaytraceManyResult = VOXEL_OCTREE_RAYTRACE_MANY_RESULT;

  voxelOctreeRaytraceMany(voxelOctrees, pointAInClippingSpace, pointBInClippingSpace, result);

  if ((result.index === -1) || (result.voxelMaterialAddress === NO_MATERIAL)) {
    fillColorAsEmpty(color);
  } else {
    const hitPosition: vec3 = result.hitPosition;
    const voxelMaterialAddress: number = result.voxelMaterialAddress;
    const voxelOctreeObject: IObject3DVoxelOctree = voxelOctrees[result.index];
    const mvp: mat4 = voxelOctreeObject.mvp;
    const voxelOctreeMemory: Uint8Array = voxelOctreeObject.voxelOctree.memory;

    vec3.copy(LIGHT_SPECTRUM, ambientLightSpectrum);

    vec3.transformMat4(HIT_POSITION_IN_CLIPPING_SPACE, hitPosition, mvp);
    // console.log(HIT_POSITION_IN_CLIPPING_SPACE, hitPosition);

    for (let i = 0, l = lights.length; i < l; i++) {
      const light: IObject3DLight = lights[i];
      // console.log(light);

      // accelerated because LIGHT_POSITION_IN_LIGHT_SPACE is static
      // vec3.transformMat4(LIGHT_POSITION_IN_CLIPPING_SPACE, LIGHT_POSITION_IN_LIGHT_SPACE, light.mvp);
      nullVec3TransformMat4(LIGHT_POSITION_IN_CLIPPING_SPACE, light.mvp);
      // console.log(LIGHT_POSITION_IN_CLIPPING_SPACE);

      const hit: boolean = voxelOctreeLightRaytrace(
        voxelOctrees,
        HIT_POSITION_IN_CLIPPING_SPACE,
        LIGHT_POSITION_IN_CLIPPING_SPACE,
        voxelOctreeObject,
        hitPosition,
      );

      if (!hit) {
        vec3.transformMat4(HIT_POSITION_IN_LIGHT_SPACE, HIT_POSITION_IN_CLIPPING_SPACE, light.mvpi);
        // console.log(HIT_POSITION_IN_LIGHT_SPACE);
        const distance: number = vec3.len(HIT_POSITION_IN_LIGHT_SPACE);
        vec3.scaleAndAdd(LIGHT_SPECTRUM, LIGHT_SPECTRUM, light.spectrum, getLightIntensityFromRadius(distance));
      }
    }


    color[0] = LIGHT_SPECTRUM[0] * (voxelOctreeMemory[voxelMaterialAddress] / 255);
    color[1] = LIGHT_SPECTRUM[1] * (voxelOctreeMemory[voxelMaterialAddress + 1] / 255);
    color[2] = LIGHT_SPECTRUM[2] * (voxelOctreeMemory[voxelMaterialAddress + 2] / 255);
    color[3] = 1;
  }

}

