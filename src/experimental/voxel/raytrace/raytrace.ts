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

/*

LINKS:

clipping volume (NDC): http://learnwebgl.brown37.net/08_projections/projections_introduction.html
best tutorial: http://learnwebgl.brown37.net/08_projections/projections_perspective.html#:~:text=Typical%20values%20for%20near%20and,A%20perspective%20projection%20demo.

MVP=P∗V∗M


 */

// http://learnwebgl.brown37.net/08_projections/projections_perspective.html#:~:text=Typical%20values%20for%20near%20and,A%20perspective%20projection%20demo.

// https://learnopengl.com/Getting-started/Coordinate-Systems
// https://www.3dgep.com/understanding-the-view-matrix/#:~:text=The%20view%20matrix%20on%20the,space%20in%20the%20vertex%20program.
// MVP=P∗V∗M
// v′=MVP∗v
// mvp put us in the normal space [-1, 1]


// export function raytrace(
//   rayColor: vec4, // [r, g, b, a = 1 - energy] in [0, 1]
//   x: number,
//   y: number,
//   voxelOctrees: readonly IVoxelOctreeForRayTrace[],
//   lights: readonly ILightForRayTrace[],
//   ambientLightColor: vec3,
// ) {
//   const origin: vec4 = [x, y, 0, 1];
//   const vector: vec4 = [0, 0, -1, 0];
//
//   const voxel = voxelOctrees[0];
//
//   console.log(vec4.transformMat4(vec4.create(), origin, voxel.matrix));
//
//   /// TODO continue here
// }
//
//

