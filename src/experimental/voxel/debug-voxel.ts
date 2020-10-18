import { ReadAddress, WriteAddress } from './memory-address';
import { AbstractMemory } from './abstract-memory';
import { VOXEL_MATERIAL_BYTES_PER_ELEMENT, VoxelMaterial, WriteNewVoxelMaterial } from './material';
import {
  CloneVoxelOctreesOnDifferentMemory, ConvertVoxelOctreeDepthToSide, ConvertVoxelOctreeSideToDepth,
  GetAmountOfMemoryUsedByVoxelOctree, GetMaximumAmountOfMemoryUsedByAVoxelOctreeFromDepth,
  ReadVoxelMaterialAddressOfVoxelOctreeAtPosition, VOXEL_OCTREE_BYTES_PER_ELEMENT, VoxelOctree,
  WriteNewVoxelOctreeInMemory, WriteVoxelOctreeMaterialAddress,
} from './octree';
import {
  drawEmptyCubeForOctree, drawRainbowCubeForOctree, drawUniformRedCubeForOctree, drawVoxelsToDebugUnreachableVoxels,
} from './draw';
import { CompactVoxelOctreesOnNewMemory, RemoveUnreachableVoxelsOfVoxelOctree } from './compact';
import {
   IVoxelOctreeForRayTrace, raytrace,
} from './raytrace/raytrace';
import { assert } from '../assert/assert';
import { arrayEquals } from '../assert/array-equals';
import { mat4, vec2, vec3 } from 'gl-matrix';
import { mat4_display } from './matrix-helpers';
import { hitCubeIn } from './raytrace/hit-cube-in';
import { isValidHitPoint } from './raytrace/is-valid-hit-point';


function speedTest(): void {
  const MEMORY = new Uint8Array((2 ** 31) - 1);
  console.time('speed');
  for (let i = 0; i < 1e8; i++) {
    WriteAddress(MEMORY, i, 123456789);
  }
  console.timeEnd('speed');

  let j = 0;
  for (let i = 0; i < 1e8; i++) {
    j += ReadAddress(MEMORY, i);
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
  WriteNewVoxelMaterial(MEMORY_VIEW, index, 255, 0, 0, 255, 0);
  materials.push(new VoxelMaterial(MEMORY_VIEW, index));

  index = MEMORY.alloc(VOXEL_MATERIAL_BYTES_PER_ELEMENT);
  WriteNewVoxelMaterial(MEMORY_VIEW, index, 0, 255, 0, 255, 0);
  materials.push(new VoxelMaterial(MEMORY_VIEW, index));

  index = MEMORY.alloc(VOXEL_OCTREE_BYTES_PER_ELEMENT);
  WriteNewVoxelOctreeInMemory(MEMORY_VIEW, index, 0);
  voxels.push(new VoxelOctree(MEMORY_VIEW, index, ConvertVoxelOctreeSideToDepth(2)));

  // console.log(ReadVoxelOctreeMaterialAddress());

  console.log(MEMORY_VIEW);
}

const testHitCubeSpeed = (): void => {
  const getPosition = () => {
    // return (Math.random() < 0.5) ? -Math.random() : 1 + Math.random();
    return Math.random() + ((Math.random() < 0.5) ? -1 : +1);
  };
  const randomVector = () => {
    origin[0] = getPosition();
    origin[1] = getPosition();
    origin[2] = getPosition();
    vector[0] = Math.random();
    vector[1] = Math.random();
    vector[2] = Math.random();
  };
  const out3: vec2 = new Float32Array(3);
  const origin: vec3 = new Float32Array(3);
  const vector: vec3 = new Float32Array(3);
  let j = 0;
  console.time('speed');
  for (let i = 0; i < 1e7; i++) {
    randomVector(); // 2662.77783203125
    hitCubeIn(origin, vector, 1, out3); // 2807 => 150 own
    j += isValidHitPoint(out3) ? 1 : 0;
  }
  console.timeEnd('speed');
  console.log('j', j);
}

// 32 -> 318313 ≃ 318K
// 64 -> 2546537 ≃ 2.5M
// 128 -> 20372329 ≃ 20.4M
// 256 -> 162978665 ≃ 163M
// 512 -> 1303829353 ≃ 1.3G
// 1024 -> 10430634857 ≃ 10.4G
// 2048 -> 83445078889 ≃ 83.4G
// 4096 -> 667560631145 ≃ 667G

function displayVoxelMaxMemorySize() {
  for (let depth = 0;depth < 12; depth++) {
    console.log(`depth: ${ depth }, size: ${ ConvertVoxelOctreeDepthToSide(depth) } => ${ GetMaximumAmountOfMemoryUsedByAVoxelOctreeFromDepth(depth) }`);
  }
}

function debugVoxelCompactMaterials() {
  // displayVoxelMaxMemorySize();

  const voxelDepth: number = ConvertVoxelOctreeSideToDepth(8);
  const voxelMaxMemorySize: number = GetMaximumAmountOfMemoryUsedByAVoxelOctreeFromDepth(voxelDepth)
    + 1000; // extra for materials

  const MEMORY = new AbstractMemory(voxelMaxMemorySize);
  const MEMORY_VIEW = MEMORY.toUint8Array();
  const alloc = MEMORY.toAllocFunction();

  const redMaterial = VoxelMaterial.create(MEMORY_VIEW, alloc, 255, 0, 0, 255, 0);
  const material1 = VoxelMaterial.create(MEMORY_VIEW, alloc, 123, 0, 0, 255, 0);
  const material2 = VoxelMaterial.create(MEMORY_VIEW, alloc, 123, 0, 0, 255, 0);
  const material3 = VoxelMaterial.create(MEMORY_VIEW, alloc, 0, 42, 0, 255, 0);
  const material4 = VoxelMaterial.create(MEMORY_VIEW, alloc, 0, 0, 0, 0, 0);

  const voxel = VoxelOctree.create(MEMORY_VIEW, alloc, voxelDepth);


  const writeVoxel = (x: number, y: number, z: number, material: VoxelMaterial) => {
    WriteVoxelOctreeMaterialAddress(voxel.memory, voxel.address, alloc, voxel.depth, x, y, z, material.address);
  }

  const readVoxel = (x: number, y: number, z: number) => {
    return ReadVoxelMaterialAddressOfVoxelOctreeAtPosition(voxel.memory, voxel.address, voxel.depth, x, y, z);
  }

  const drawTransparentMaterials = () => {
    writeVoxel(0,0,1, material4);
    // writeVoxel(2,0,1, material4);
    // writeVoxel(0,1,1, material4);
  };

  const drawDuplicateMaterials = () => {
    writeVoxel(0,0,0, material1);
    writeVoxel(0,1,0, material1);
    writeVoxel(1,0,0, material2);
    writeVoxel(2,0,0, material2);
    writeVoxel(3,0,0, material3);
    writeVoxel(0,0,1, material4);
  };

  const drawUniformMaterials = () => {
    drawUniformRedCubeForOctree(voxel.memory, voxel.address, voxel.depth, alloc);
  }

  const drawDuplicateVoxels = () => {
    writeVoxel(0,0,0, material1);
    writeVoxel(2,0,0, material1);
  }

  const drawEmptyCube = () => {
    drawEmptyCubeForOctree(voxel.memory, voxel.address, voxel.depth, alloc, redMaterial.address);
  }

  const drawRainbowCube = () => {
    drawRainbowCubeForOctree(voxel.memory, voxel.address, voxel.depth, alloc);
  }

  const drawToDebugUnreachableVoxels = () => {
    drawVoxelsToDebugUnreachableVoxels(voxel.memory, voxel.address, voxel.depth, alloc);
  }

  // drawTransparentMaterials();
  // drawDuplicateMaterials();
  // drawUniformMaterials();
  // drawDuplicateVoxels();
  // drawEmptyCube();
  // drawRainbowCube();
  drawToDebugUnreachableVoxels();


  MEMORY.log('memory');
  // displayOctreeSlice(voxel, 2);


  function debugOctreeSize() {
    const octreeSize: number = GetAmountOfMemoryUsedByVoxelOctree(
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

    const octrees = CloneVoxelOctreesOnDifferentMemory(
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
    // displayOctreeSlice(voxel, 2);
  }

  // debugOctreeSize();
  // debugOctreeCopy();
  // debugOctreeCompact();
  debugOctreeRemoveUnreachable();
}

async function debugVoxelRayTrace1() {
  const out2: vec2 = new Float32Array(2);
  const out3: vec2 = new Float32Array(3);

  // console.log(hitSquareXYSurface(out2, [0.5, 0.5, 1], [0, 0, -1], side)); // [0.5, 0.5]
  // console.log(hitSquareXYSurface(out2, [0, 0.5, 1], [0, 0, -1], side)); // [0, 0.5]
  // console.log(hitSquareXYSurface(out2, [1, 0.5, 1], [0, 0, -1], side)); // [NaN, 0.5]
  // console.log(hitSquareXYSurface(out2, [0.5, 0.5, 1], [0, 0, 0], side)); // [NaN, NaN]
  // console.log(hitSquareXYSurface(out2, [0.5, 0.5, 0], [0, 0, -1], side)); // [0.5, 0.5]
  // console.log(hitSquareXYSurface(out2, [0.5, 0.5, 0], [1, 0, 0], side)); // [NaN, NaN]



  console.log(hitCubeIn([0.5, -1, 0.5], [0, 1, 0], 1, out3));

  // inside the cube
  // await assert(() => arrayEquals(hitCubeIn([0.5, 0.5, 0.5], [0, 0, 1], 1), [0.5, 0.5, 0.5])); // on center
  // await assert(() => arrayEquals(hitCubeIn([0, 0, 0], [0, 0, 1], 1), [0, 0, 0])); // on cube's origin (included edge)
  // await assert(() => !isHitPoint3D(hitCubeIn([1, 0, 0], [0, 0, 1], 1))); // on excluded edge
  // await assert(() => !isHitPoint3D(hitCubeIn([0, 1, 0], [0, 0, 1], 1)));
  // await assert(() => !isHitPoint3D(hitCubeIn([0, 0, 1], [0, 0, 1], 1)));

  // XY face (front)
  await assert(() => arrayEquals(hitCubeIn([0.5, 0.5, -1], [0, 0, 1], 1, out3), [0.5, 0.5, 0])); // on center
  await assert(() => arrayEquals(hitCubeIn([0, 0.5, -1], [0, 0, 1], 1, out3), [0, 0.5, 0])); // on included edge
  await assert(() => !isValidHitPoint(hitCubeIn([1, 0.5, -1], [0, 0, 1], 1, out3))); // on excluded edge

  // XY face (back)
  await assert(() => arrayEquals(hitCubeIn([0.5, 0.5, 2], [0, 0, -1], 1, out3), [0.5, 0.5, 1])); // on center
  await assert(() => arrayEquals(hitCubeIn([0, 0.5, 2], [0, 0, -1], 1, out3), [0, 0.5, 1])); // on included edge
  await assert(() => !isValidHitPoint(hitCubeIn([1, 0.5, 2], [0, 0, -1], 1, out3))); // on excluded edge


  // XY face (front)
  await assert(() => arrayEquals(hitCubeIn([0.5, -1, 0.5], [0, 1, 0], 1, out3), [0.5, 0, 0.5])); // on center

  testHitCubeSpeed();
}



async function debugVoxelRayTrace2() {
  const projection = mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, 2);
  // const projection = mat4.ortho(mat4.create(), -4, 4, -4, 4, -4, 4);
  // const projection = mat4.ortho(mat4.create(), -4, 4, -4, 4, 0, 4);
  // const view = mat4.lookAt(mat4.create(), [0.5, 0.5, -1], [0.5, 0.5, 0], [0, 1, 0]);
  const view = mat4.lookAt(mat4.create(), [0, 0, -1], [0, 0, 0], [0, 1, 0]); // camera is at [0, 0, -1], and look in direction [0, 0, 1]
  const model = mat4.create();
  const mvp = mat4.create();
  mat4.mul(mvp, mat4.mul(mvp, projection, view), model);

  mat4_display('projection', projection);
  mat4_display('view', view);
  mat4_display('model', model);
  mat4_display('mvp', mvp);

  const createSymmetricPerspectiveCamera = (
    out: mat4 = mat4.create(),
    width: number = window.innerWidth,
    height: number = window.innerHeight,
    depth: number = Math.max(width, height) / 2,
    near: number = depth,
    far: number = depth * 1000, // or depth * (3 / 2),
  ) => {
    return mat4.perspective(out, Math.atan2(height / 2, depth) * 2, width / height, near, far);
  }

  const createSymmetricOrthographicCamera = (
    out: mat4 = mat4.create(),
    width: number = window.innerWidth,
    height: number = window.innerHeight,
    depth: number = Math.max(width, height),
  ) => {
    const x: number = width / 2;
    const y: number = height / 2;
    return mat4.ortho(out, -x, x, -y, y, 0, depth);
  }

  const getMVPMatrix = (output: mat4, modelMatrix: mat4) => {
    return mat4.mul(output, mat4.mul(output, projection, view), modelMatrix);
  }

  const createEmptyVoxelOctree = (side: number) => {
    const voxelDepth: number = ConvertVoxelOctreeSideToDepth(side);
    const voxelMaxMemorySize: number = GetMaximumAmountOfMemoryUsedByAVoxelOctreeFromDepth(voxelDepth);
    const MEMORY = new AbstractMemory(voxelMaxMemorySize);
    const MEMORY_VIEW = MEMORY.toUint8Array();
    const alloc = MEMORY.toAllocFunction();
    const voxel = VoxelOctree.create(MEMORY_VIEW, alloc, voxelDepth);

    return {
      voxel,
      alloc,
    }
  }

  const createRainbowVoxelOctree = (side: number) => {
    const { voxel, alloc } = createEmptyVoxelOctree(side);
    drawRainbowCubeForOctree(voxel.memory, voxel.address, voxel.depth, alloc);
    return voxel;
  }

  const voxel1 = createRainbowVoxelOctree(8);
  const voxelModelMatrix = mat4.create();
  mat4.translate(voxelModelMatrix, voxelModelMatrix, vec3.fromValues(-4, 0, 0));

  const voxels: IVoxelOctreeForRayTrace[] = [
    {
      voxelOctree: voxel1,
      matrix: mat4.mul(mvp, mat4.mul(mvp, projection, view), voxelModelMatrix)
    }
  ]

  raytrace(
    [0, 0, 0, 1],
    0,
    0,
    voxels,
    []
  );

}

/*--------------------------*/

export async function debugVoxel() {
  // debugVoxelCompactMaterials();
  await debugVoxelRayTrace1();
  // await debugVoxelRayTrace2();
}
