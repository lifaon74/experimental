import { convertVoxelOctreeDepthToSide, VoxelOctree } from '../octree';
import { mat4, vec3, vec4 } from 'gl-matrix';
import { NO_MATERIAL } from '../material';
import {
  convertIntVec3PositionToVoxelOctreeChildIndex, convertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex,
  isVoxelOctreeChildIndexAVoxelOctreeAddress
} from '../octree-children';
import { readAddress } from '../memory-address';
import { isValidHitPoint } from './collide/is-valid-hit-point';
import { isPointOnCubeSurfaceOrOut } from './collide/is-point-on-cube-surface';
import { nextHitCubeOut } from './collide/next-hit-cube-out';
import { nextHitCubeIn } from './collide/next-hit-cube-in';



function getHitPositionFocVoxelOctree(
  rayVector: vec3,
  hitPosition: vec3,
  intHitPosition: Uint8Array,
): void {
  // intHitPosition[0] = hitPosition[0] - ((rayVector[0] < 0) ? Number.EPSILON : 0);
  // intHitPosition[1] = hitPosition[1] - ((rayVector[1] < 0) ? Number.EPSILON : 0);
  // intHitPosition[2] = hitPosition[2] - ((rayVector[2] < 0) ? Number.EPSILON : 0);
  for (let i = 0; i < 3; i++) {
    // intHitPosition[i] = hitPosition[i] - ((rayVector[i] < 0) ? Number.EPSILON : 0); // not working
    intHitPosition[i] = hitPosition[i];
    if ((rayVector[i] < 0) && (intHitPosition[i] === hitPosition[i])) {
      intHitPosition[i]--;
    }
  }
}

function getRayPositionForVoxelOctreeChild(
  rayVector: vec3,
  side: number,
  hitPosition: vec3,
  rayPositionForVoxelOctreeChild: vec3,
): void {
  // rayPositionForVoxelOctreeChild[0] = hitPosition[0] % side;
  // rayPositionForVoxelOctreeChild[1] = hitPosition[1] % side;
  // rayPositionForVoxelOctreeChild[2] = hitPosition[2] % side;
  for (let i = 0; i < 3; i++) {
    rayPositionForVoxelOctreeChild[i] = hitPosition[i] % side;
    if ((rayVector[i] < 0) && (rayPositionForVoxelOctreeChild[i] === 0)) {
      rayPositionForVoxelOctreeChild[i] += side;
    }
  }
}


function updateHitPositionFromHitPositionOutAndRayPositionForVoxelOctreeChild(
  hitPosition: vec3,
  hitPositionOut: vec3,
  rayPositionForVoxelOctreeChild: vec3,
): void {
  hitPosition[0] += hitPositionOut[0] - rayPositionForVoxelOctreeChild[0];
  hitPosition[1] += hitPositionOut[1] - rayPositionForVoxelOctreeChild[1];
  hitPosition[2] += hitPositionOut[2] - rayPositionForVoxelOctreeChild[2];
}

const HIT_POSITION_FOR_VOXEL_OCTREE: Uint8Array = new Uint8Array(3);
const HIT_POSITION_OUT: vec3 = vec3.create();
const RAY_POSITION_FOR_VOXEL_OCTREE_CHILD: vec3 = vec3.create();

export function voxelOctreeRaytrace(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  rayPosition: vec3,
  rayVector: vec3,
  hitPosition: vec3,
): number { // hitVoxelMaterialAddress

  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);
  nextHitCubeIn(rayPosition, rayVector, side, hitPosition);

  let i: number = 0;
  if (isValidHitPoint(hitPosition)) {
    while (i++ < side) {
      // console.log('hitPosition', hitPosition.join(', '));

      getHitPositionFocVoxelOctree(rayVector, hitPosition, HIT_POSITION_FOR_VOXEL_OCTREE);
      // console.log('intHitPosition', HIT_POSITION_FOR_VOXEL_OCTREE.join(', '));

      let localVoxelOctreeAddress: number = voxelOctreeAddress;
      let localVoxelOctreeDepth: number = voxelOctreeDepth;

      while (localVoxelOctreeDepth >= 0) {
        const voxelOctreeChildIndex: number = convertIntVec3PositionToVoxelOctreeChildIndex(localVoxelOctreeDepth, HIT_POSITION_FOR_VOXEL_OCTREE);
        const voxelOctreeChildAddress: number = readAddress(memory, convertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex(localVoxelOctreeAddress, voxelOctreeChildIndex));
        if (isVoxelOctreeChildIndexAVoxelOctreeAddress(memory, localVoxelOctreeAddress, voxelOctreeChildIndex)) {
          localVoxelOctreeAddress = voxelOctreeChildAddress;
          localVoxelOctreeDepth--;
        } else {
          if (voxelOctreeChildAddress === NO_MATERIAL) {
            const localSide: number = convertVoxelOctreeDepthToSide(localVoxelOctreeDepth);
            getRayPositionForVoxelOctreeChild(rayVector, localSide, hitPosition, RAY_POSITION_FOR_VOXEL_OCTREE_CHILD);
            // console.log('side', localSide, RAY_POSITION_FOR_VOXEL_OCTREE_CHILD);
            nextHitCubeOut(RAY_POSITION_FOR_VOXEL_OCTREE_CHILD, rayVector, localSide, HIT_POSITION_OUT);

            if (!isValidHitPoint(HIT_POSITION_OUT)) {
              // debugger;
              // console.log('failed');
              return NO_MATERIAL;
            }

            updateHitPositionFromHitPositionOutAndRayPositionForVoxelOctreeChild(hitPosition, HIT_POSITION_OUT, RAY_POSITION_FOR_VOXEL_OCTREE_CHILD);

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

