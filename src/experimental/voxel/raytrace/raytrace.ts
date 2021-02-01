import { convertVoxelOctreeDepthToSide, VoxelOctree } from '../octree';
import { mat4, vec3, vec4 } from 'gl-matrix';
import { NO_MATERIAL } from '../material';
import {
  convertVoxelOctreeCoordinatesToVoxelOctreeChildIndex,
  convertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex,
  isVoxelOctreeChildIndexAVoxelOctreeAddress, IVoxelOctreeCoordinates, convertVec3PositionToVoxelOctreeChildIndex
} from '../octree-children';
import { readAddress } from '../memory-address';
import { isValidHitPoint } from './collide/is-valid-hit-point';
import { isPointOnCubeSurfaceOrOut } from './collide/is-point-on-cube-surface';
import { hitCubeOut } from './collide/hit-cube-out';
import { hitCubeIn } from './collide/hit-cube-in';


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

export function voxelOctreeRaytrace(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  rayPosition: vec3,
  rayVector: vec3,
  hitPosition: vec3,
): number { // hitVoxelMaterialAddress

  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);
  hitCubeIn(rayPosition, rayVector, side, hitPosition);

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

export interface IVoxelOctreeRaytraceManyReturn {
  voxelOctree: VoxelOctree;
  voxelMaterialAddress: number;
  hitPosition: vec3;
}

// const POINT_A_IN_CLIPPING_SPACE: vec3 = vec3.fromValues(0, 0, -1);
// const POINT_B_IN_CLIPPING_SPACE: vec3 = vec3.fromValues(0, 0, 1);
const POINT_A_IN_MODEL_SPACE: vec3 = vec3.create();
const POINT_B_IN_MODEL_SPACE: vec3 = vec3.create();
const RAY_VECTOR: vec3 = vec3.create();

// TODO continue here
export function voxelOctreeRaytraceMany(
  voxelOctrees: IObject3DVoxelOctree[],
  pointAInClippingSpace: vec3,
  pointBInClippingSpace: vec3,
  hitPosition: vec3,
): IVoxelOctreeRaytraceManyReturn | null {
  for (let i = 0, l = voxelOctrees.length; i < l; i++) {
    const voxelOctree: IObject3DVoxelOctree = voxelOctrees[i];
    vec3.transformMat4(POINT_A_IN_MODEL_SPACE, pointAInClippingSpace, voxelOctree.mvpi);
    vec3.transformMat4(POINT_B_IN_MODEL_SPACE, pointBInClippingSpace, voxelOctree.mvpi);
    vec3.sub(RAY_VECTOR, POINT_B_IN_MODEL_SPACE, POINT_A_IN_MODEL_SPACE);
    const voxelMaterialAddress: number = voxelOctreeObjectRaytrace(voxelOctree.voxelOctree, POINT_A_IN_MODEL_SPACE, RAY_VECTOR, hitPosition);
    // return voxelMaterialAddress;
  }

  return null;
}
