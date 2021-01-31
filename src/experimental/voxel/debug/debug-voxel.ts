import { readAddress, writeAddress } from '../memory-address';
import { AbstractMemory } from '../abstract-memory';
import { VOXEL_MATERIAL_BYTES_PER_ELEMENT, VoxelMaterial, writeNewVoxelMaterial } from '../material';
import {
  cloneVoxelOctreesOnDifferentMemory, convertVoxelOctreeDepthToSide, convertVoxelOctreeSideToDepth,
  getAmountOfMemoryUsedByVoxelOctree, getMaximumAmountOfMemoryUsedByAVoxelOctreeExcludingItsVoxelMaterialsFromDepth,
  getMaximumAmountOfMemoryUsedByAVoxelOctreeFromDepth,
  getMaximumAmountOfMemoryUsedByTheVoxelMaterialsOfAVoxelOctreeFromDepth,
  readVoxelMaterialAddressOfVoxelOctreeAtPosition, VOXEL_OCTREE_BYTES_PER_ELEMENT, VoxelOctree,
  writeNewVoxelOctreeInMemory, writeVoxelOctreeMaterialAddress,
} from '../octree';
import {
  displayVoxelOctreeSlice, drawEmptyCubeForOctree, drawRainbowCubeForOctree, drawRainbowSphereForOctree,
  drawUniformRedCubeForOctree,
  drawUniformRedSphereForOctree,
  drawVoxelsToDebugUnreachableVoxels, sliceOctreeUsingReadVoxel, sliceVoxelOctreeUsingRaytrace,
} from '../draw/draw';
import { CompactVoxelOctreesOnNewMemory, RemoveUnreachableVoxelsOfVoxelOctree } from '../compact';
import { IVoxelOctreeForRayTrace, voxelOctreeRaytrace, } from '../raytrace/raytrace';
import { assert } from '../../assert/assert';
import { mat4, vec2, vec3 } from 'gl-matrix';
import { mat4_display } from '../matrix-helpers';
import { hitCubeIn } from '../raytrace/collide/hit-cube-in';
import { isValidHitPoint } from '../raytrace/collide/is-valid-hit-point';
import { isNextPointInCube } from '../raytrace/collide/is-next-point-in-cube';
import { arrayEquals } from '../../assert/array-equals';
import { hitCubeOut } from '../raytrace/collide/hit-cube-out';
import { debugVoxelRayTrace } from './debug-voxel-ray-trace';
import { formatSize } from '../misc/format-size';
import { debugVoxelCollide } from './debug-voxel-collide';


function speedTest(): void {
  const MEMORY = new Uint8Array((2 ** 31) - 1);
  console.time('speed');
  for (let i = 0; i < 1e8; i++) {
    writeAddress(MEMORY, i, 123456789);
  }
  console.timeEnd('speed');

  let j = 0;
  for (let i = 0; i < 1e8; i++) {
    j += readAddress(MEMORY, i);
  }
  console.log('j', j);
}


function debugVoxel1() {
  const MEMORY = new AbstractMemory((2 ** 31) - 1);
  const MEMORY_VIEW = new Uint8Array(MEMORY.buffer);


  const materials: VoxelMaterial[] = [];
  const voxels: VoxelOctree[] = [];
  let index: number;

  index = MEMORY.alloc(VOXEL_MATERIAL_BYTES_PER_ELEMENT);
  writeNewVoxelMaterial(MEMORY_VIEW, index, 255, 0, 0);
  materials.push(new VoxelMaterial(MEMORY_VIEW, index));

  index = MEMORY.alloc(VOXEL_MATERIAL_BYTES_PER_ELEMENT);
  writeNewVoxelMaterial(MEMORY_VIEW, index, 0, 255, 0);
  materials.push(new VoxelMaterial(MEMORY_VIEW, index));

  index = MEMORY.alloc(VOXEL_OCTREE_BYTES_PER_ELEMENT);
  writeNewVoxelOctreeInMemory(MEMORY_VIEW, index, 0);
  voxels.push(new VoxelOctree(MEMORY_VIEW, index, convertVoxelOctreeSideToDepth(2)));

  // console.log(ReadVoxelOctreeMaterialAddress());

  console.log(MEMORY_VIEW);
}



// 32 -> 318313 ≃ 318K
// 64 -> 2546537 ≃ 2.5M
// 128 -> 20372329 ≃ 20.4M
// 256 -> 162978665 ≃ 163M
// 512 -> 1303829353 ≃ 1.3G
// 1024 -> 10430634857 ≃ 10.4G
// 2048 -> 83445078889 ≃ 83.4G
// 4096 -> 667560631145 ≃ 667G

/*
FOR material size: 3
depth: 0 (2) => 24B (material) + 33B (octree) = 57B
depth: 1 (4) => 192B (material) + 297B (octree) = 489B
depth: 2 (8) => 2KB (material) + 2KB (octree) = 4KB
depth: 3 (16) => 12KB (material) + 19KB (octree) = 31KB
depth: 4 (32) => 96KB (material) + 151KB (octree) = 247KB
depth: 5 (64) => 768KB (material) + 1MB (octree) = 2MB
depth: 6 (128) => 6MB (material) + 9MB (octree) = 15MB
depth: 7 (256) => 48MB (material) + 75MB (octree) = 123MB
depth: 8 (512) => 384MB (material) + 603MB (octree) = 987MB
depth: 9 (1024) => 3GB (material) + 5GB (octree) = 8GB
depth: 10 (2048) => 12GB (material) + 38GB (octree) = 50GB
depth: 11 (4096) => 12GB (material) + 302GB (octree) = 314GB
 */

function displayVoxelMaxMemorySize() {
  const lines: string[] = [];
  for (let depth = 0; depth < 12; depth++) {
    const materialSize: number = getMaximumAmountOfMemoryUsedByTheVoxelMaterialsOfAVoxelOctreeFromDepth(depth);
    const octreeSize: number = getMaximumAmountOfMemoryUsedByAVoxelOctreeExcludingItsVoxelMaterialsFromDepth(depth);

    lines.push(`depth: ${ depth } (${ convertVoxelOctreeDepthToSide(depth) }) => ${ formatSize(materialSize) } (material) + ${ formatSize(octreeSize) } (octree) = ${ formatSize(materialSize + octreeSize) }`);
  }
  console.log(lines.join('\n'));
}

function debugVoxelCompactMaterials() {
  // displayVoxelMaxMemorySize();

  const voxelDepth: number = convertVoxelOctreeSideToDepth(8);
  const voxelMaxMemorySize: number = getMaximumAmountOfMemoryUsedByAVoxelOctreeFromDepth(voxelDepth)
    + 1000; // extra for materials

  const MEMORY = new AbstractMemory(voxelMaxMemorySize);
  const MEMORY_VIEW = MEMORY.toUint8Array();
  const alloc = MEMORY.toAllocFunction();

  const redMaterial = VoxelMaterial.create(MEMORY_VIEW, alloc, 255, 0, 0);
  const material1 = VoxelMaterial.create(MEMORY_VIEW, alloc, 123, 0, 0);
  const material2 = VoxelMaterial.create(MEMORY_VIEW, alloc, 123, 0, 0);
  const material3 = VoxelMaterial.create(MEMORY_VIEW, alloc, 0, 42, 0);
  const material4 = VoxelMaterial.create(MEMORY_VIEW, alloc, 0, 0, 0);

  const voxel = VoxelOctree.create(MEMORY_VIEW, alloc, voxelDepth);


  const writeVoxel = (x: number, y: number, z: number, material: VoxelMaterial) => {
    writeVoxelOctreeMaterialAddress(voxel.memory, voxel.address, alloc, voxel.depth, x, y, z, material.address);
  };

  const readVoxel = (x: number, y: number, z: number) => {
    return readVoxelMaterialAddressOfVoxelOctreeAtPosition(voxel.memory, voxel.address, voxel.depth, x, y, z);
  };

  const drawDuplicateMaterials = () => {
    writeVoxel(0, 0, 0, material1);
    writeVoxel(0, 1, 0, material1);
    writeVoxel(1, 0, 0, material2);
    writeVoxel(2, 0, 0, material2);
    writeVoxel(3, 0, 0, material3);
    writeVoxel(0, 0, 1, material4);
  };

  const drawUniformMaterials = () => {
    drawUniformRedCubeForOctree(voxel.memory, voxel.address, voxel.depth, alloc);
  };

  const drawDuplicateVoxels = () => {
    writeVoxel(0, 0, 0, material1);
    writeVoxel(2, 0, 0, material1);
  };

  const drawEmptyCube = () => {
    drawEmptyCubeForOctree(voxel.memory, voxel.address, voxel.depth, alloc, redMaterial.address);
  };

  const drawRainbowCube = () => {
    drawRainbowCubeForOctree(voxel.memory, voxel.address, voxel.depth, alloc);
  };

  const drawToDebugUnreachableVoxels = () => {
    drawVoxelsToDebugUnreachableVoxels(voxel.memory, voxel.address, voxel.depth, alloc);
  };

  // drawDuplicateMaterials();
  // drawUniformMaterials();
  // drawDuplicateVoxels();
  // drawEmptyCube();
  // drawRainbowCube();
  drawToDebugUnreachableVoxels();


  MEMORY.log('memory');
  displayVoxelOctreeSlice(voxel, sliceOctreeUsingReadVoxel(2));


  function debugOctreeSize() {
    const octreeSize: number = getAmountOfMemoryUsedByVoxelOctree(
      voxel.memory,
      voxel.address,
      new Uint8Array(voxel.memory.length),
    );
    console.log('octreeSize', octreeSize);
  }

  function debugOctreeCopy() {
    const NEW_MEMORY = new AbstractMemory(2 ** 16);
    const NEW_MEMORY_VIEW = NEW_MEMORY.toUint8Array();
    const alloc = NEW_MEMORY.toAllocFunction();

    const octrees = cloneVoxelOctreesOnDifferentMemory(
      voxel.memory,
      [voxel],
      NEW_MEMORY_VIEW,
      alloc
    );

    console.log(octrees);

    NEW_MEMORY.log('copied');
  }

  function debugOctreeCompact() {
    const NEW_MEMORY = new AbstractMemory(MEMORY.bytesUsed);
    const NEW_MEMORY_VIEW = NEW_MEMORY.toUint8Array();
    const newMemoryAlloc = NEW_MEMORY.toAllocFunction();
    CompactVoxelOctreesOnNewMemory(MEMORY_VIEW, [voxel], NEW_MEMORY_VIEW, newMemoryAlloc);

    NEW_MEMORY.log('compacted memory');
  }

  function debugOctreeRemoveUnreachable() {
    console.log('replaced', RemoveUnreachableVoxelsOfVoxelOctree(
      voxel.memory,
      voxel.address,
      alloc,
      voxel.depth,
    ));
    displayVoxelOctreeSlice(voxel, sliceOctreeUsingReadVoxel(2));
  }

  // debugOctreeSize();
  // debugOctreeCopy();
  // debugOctreeCompact();
  debugOctreeRemoveUnreachable();
}





/*--------------------------*/

export async function debugVoxel() {
  // displayVoxelMaxMemorySize();
  // debugVoxelCompactMaterials();
  // await debugVoxelCollide();
  await debugVoxelRayTrace();
}
