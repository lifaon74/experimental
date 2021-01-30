import {
  areIdenticalVoxelOctreesOnSameMemory, cloneVoxelOctreesOnDifferentMemory, convertVoxelOctreeDepthToSide,
  readVoxelMaterialAddressOfVoxelOctreeAtPosition, VOXEL_OCTREE_BYTES_PER_ELEMENT, VoxelOctree,
  writeVoxelOctreeMaterialAddress
} from './octree';
import {
  areIdenticalVoxelMaterialAddressesOnSameMemory, areIdenticalVoxelMaterialOnSameMemory, NO_MATERIAL,
  NON_UNIFORM_MATERIAL, UNDEFINED_MATERIAL, VOXEL_MATERIAL_BYTES_PER_ELEMENT,
} from './material';
import {
  ADDRESS_BYTES_PER_ELEMENT, clearMemoryMap, NOT_MAPPED, readAddress, IAllocFunction, IMemoryMap, writeAddress
} from './memory-address';
import {
  isVoxelOctreeChildIndexAVoxelOctreeAddress, isVoxelOctreeComposedOfMaterialsOnly,
  setVoxelOctreeChildAsVoxelMaterialUsingIndex,
} from './octree-children';

export interface CompactSizeOptions {
  compactTime?: number;
  originalSize?: number;
}


export interface VoxelOctreeOnSharedMemory {
  address: number;
  depth: number;
}


// export interface VoxelOctreesWithDynamicAddressOnSharedMemory extends VoxelOctreesOnSharedMemory {
//   octrees: VoxelOctreeWithDynamicAddressOnSharedMemory[];
// }

// 1) merge all octrees on the same memory
// 2) remove duplicate materials
// 3) reduces octrees children complexity if uniform material
// 4) remove duplicate octrees


/******* MERGE OCTREES *******/


export function AreOctreeOnSameMemory(
  octrees: VoxelOctree[],
): boolean {
  let memory: Uint8Array = octrees[0].memory;
  for (let i = 1, l = octrees.length; i < l; i++) {
    if (octrees[i].memory !== memory) {
      return false;
    }
  }
  return true;
}

export function GroupOctreesByMemory(
  octrees: VoxelOctree[],
): Map<Uint8Array, VoxelOctree[]> {
  const map: Map<Uint8Array, VoxelOctree[]> = new Map<Uint8Array, VoxelOctree[]>();
  for (let i = 0, l = octrees.length; i < l; i++) {
    const octree: VoxelOctree = octrees[i];
    let groupedOctrees: VoxelOctree[] | undefined = map.get(octree.memory);
    if (groupedOctrees === void 0) {
      groupedOctrees = [];
      map.set(octree.memory, groupedOctrees);
    }
    groupedOctrees.push(octree);
  }
  return map;
}

/**
 * TODO: totally shitty => for faster development, it was not optimized at all
 */
export function CopyVoxelOctreesOnSharedMemory(
  octrees: VoxelOctree[],
  sharedMemory: Uint8Array,
  alloc: IAllocFunction,
): VoxelOctreeOnSharedMemory[] {
  if (AreOctreeOnSameMemory(octrees)) {
    const octree: VoxelOctree = octrees[0];
    alloc(octree.memory.length);
    sharedMemory.set(octree.memory);
    return octrees.map((octree: VoxelOctree) => {
      return {
        address: octree.address,
        depth: octree.depth,
      };
    });
  } else {
    // const grouped: Map<Uint8Array, VoxelOctree[]> = GroupOctreesByMemory(octrees);
    // let maxSize: number = 0;
    // const iterator: Iterator<Uint8Array> = grouped.keys();
    // let result: IteratorResult<Uint8Array>;
    // while (!(result = iterator.next()).done) {
    //   maxSize += result.value.length;
    // }
    // const memory = new Uint8Array(maxSize);
    // let allocated: number = 0;

    throw 'TODO';
  }
}


// export function MakeOctreesDynamic(
//   octrees: VoxelOctreeOnSharedMemory[],
//   sharedMemory: Uint8Array,
//   alloc: TAllocFunction,
// ): VoxelOctreeWithDynamicAddressOnSharedMemory[] {
//   const memoryMap: Uint32Array = CreateMemoryMap(sharedMemory.length);
//   for (let i = 0, l = octrees.length; i < l; i++) {
//     const octree: VoxelOctreeOnSharedMemory = octrees[i];
//     IncreaseVoxelOctreeDynamicAddresses(sharedMemory, octree.address, alloc, memoryMap);
//   }
//   return octrees;
// }

/******* REMOVE DUPLICATE OR INVISIBLE VOXEL MATERIALS *******/

export function RemoveDuplicateVoxelMaterialsOfVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  uniqVoxelMaterialAddresses: Uint32Array, // list of all seen <voxelMaterialAddress> without any duplicates. [0] used to store the length
  memoryMap: IMemoryMap,
): void {
  let voxelOctreeChildAddressAddress: number = voxelOctreeAddress + 1;
  let voxelOctreeChildAddress: number;
  for (let i = 0; i < 8; i++) {
    voxelOctreeChildAddress = readAddress(memory, voxelOctreeChildAddressAddress);
    if (isVoxelOctreeChildIndexAVoxelOctreeAddress(memory, voxelOctreeAddress, i)) {
      RemoveDuplicateVoxelMaterialsOfVoxelOctree(memory, voxelOctreeChildAddress, uniqVoxelMaterialAddresses, memoryMap);
    } else if (voxelOctreeChildAddress !== NO_MATERIAL) {
      let mappedVoxelMaterialAddress: number = memoryMap[voxelOctreeChildAddress];
      if (mappedVoxelMaterialAddress === NOT_MAPPED) { // first time we encounter this <voxelMaterial>
        mappedVoxelMaterialAddress = voxelOctreeChildAddress;
        const uniqVoxelMaterialAddressesLengthPlusOne: number = uniqVoxelMaterialAddresses[0] + 1;
        // compare it with all already seen <voxelMaterial>s
        for (let j = 1; j < uniqVoxelMaterialAddressesLengthPlusOne; j++) {
          // console.log('comparing', _address, uniqMaterials[j]);
          // if this <voxelMaterial> is the same as one present in uniqVoxelMaterialAddresses, replace current <voxelOctreeChildAddress> by uniqVoxelMaterialAddresses[j]
          if (areIdenticalVoxelMaterialOnSameMemory(memory, voxelOctreeChildAddress, uniqVoxelMaterialAddresses[j])) {
            mappedVoxelMaterialAddress = uniqVoxelMaterialAddresses[j];
            writeAddress(memory, voxelOctreeChildAddressAddress, mappedVoxelMaterialAddress);
            // console.log('duplicate detected', _address, ' -> ', mappedAddress);
            break;
          }
        }
        if (mappedVoxelMaterialAddress === voxelOctreeChildAddress) { // no duplicate
          // console.log('set uniq', _address);
          uniqVoxelMaterialAddresses[0] = uniqVoxelMaterialAddressesLengthPlusOne;
          uniqVoxelMaterialAddresses[uniqVoxelMaterialAddressesLengthPlusOne] = voxelOctreeChildAddress;
        }
        memoryMap[voxelOctreeChildAddress] = mappedVoxelMaterialAddress;
      } else {
        writeAddress(memory, voxelOctreeChildAddressAddress, mappedVoxelMaterialAddress);
      }
    }
    voxelOctreeChildAddressAddress += ADDRESS_BYTES_PER_ELEMENT;
  }
}

export function RemoveDuplicateVoxelMaterialsOfVoxelOctrees(
  memory: Uint8Array,
  octrees: VoxelOctreeOnSharedMemory[],
  memoryMap: IMemoryMap
): void {
  const uniqVoxelMaterialAddresses: Uint32Array = new Uint32Array(memory.length / VOXEL_MATERIAL_BYTES_PER_ELEMENT); // TODO may be optimized

  for (let i = 0, l = octrees.length; i < l; i++) {
    RemoveDuplicateVoxelMaterialsOfVoxelOctree(memory, octrees[i].address, uniqVoxelMaterialAddresses, memoryMap);
  }
}


/******* REMOVE UNIFORM CHILD VOXEL OCTREES *******/

export function RemoveUniformChildVoxelOctreesOfVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
): number {
  let voxelOctreeChildAddressAddress: number = voxelOctreeAddress + 1;
  let voxelOctreeChildAddress: number = 0;
  let commonVoxelMaterialAddress: number = UNDEFINED_MATERIAL;

  for (let i = 0; i < 8; i++) { // for each sub-tree
    voxelOctreeChildAddress = readAddress(memory, voxelOctreeChildAddressAddress);
    if (isVoxelOctreeChildIndexAVoxelOctreeAddress(memory, voxelOctreeAddress, i)) {
      voxelOctreeChildAddress = RemoveUniformChildVoxelOctreesOfVoxelOctree(memory, voxelOctreeChildAddress);

      if (commonVoxelMaterialAddress === UNDEFINED_MATERIAL) {
        commonVoxelMaterialAddress = voxelOctreeChildAddress;
      } else if (
        (commonVoxelMaterialAddress !== NON_UNIFORM_MATERIAL)
        && (
          (voxelOctreeChildAddress === NON_UNIFORM_MATERIAL)
          || !areIdenticalVoxelMaterialAddressesOnSameMemory(memory, commonVoxelMaterialAddress, voxelOctreeChildAddress)
        )
      ) {
        commonVoxelMaterialAddress = NON_UNIFORM_MATERIAL;
      }

      if (voxelOctreeChildAddress !== NON_UNIFORM_MATERIAL) {
        setVoxelOctreeChildAsVoxelMaterialUsingIndex(memory, voxelOctreeAddress, i);
        writeAddress(memory, voxelOctreeChildAddressAddress, voxelOctreeChildAddress);
      }
    } else {
      if (commonVoxelMaterialAddress === UNDEFINED_MATERIAL) {
        commonVoxelMaterialAddress = voxelOctreeChildAddress;
      } else if (
        (commonVoxelMaterialAddress !== NON_UNIFORM_MATERIAL)
        && !areIdenticalVoxelMaterialAddressesOnSameMemory(memory, commonVoxelMaterialAddress, voxelOctreeChildAddress)
      ) {
        commonVoxelMaterialAddress = NON_UNIFORM_MATERIAL;
      }
    }
    voxelOctreeChildAddressAddress += ADDRESS_BYTES_PER_ELEMENT;
  }
  return commonVoxelMaterialAddress;
}


export function RemoveUniformChildVoxelOctreesOfVoxelOctrees(
  memory: Uint8Array,
  octrees: VoxelOctreeOnSharedMemory[],
): void {
  for (let i = 0, l = octrees.length; i < l; i++) {
    RemoveUniformChildVoxelOctreesOfVoxelOctree(memory, octrees[i].address);
  }
}


/******* REMOVE DUPLICATE VOXEL OCTREES *******/


function DeduplicateVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  uniqVoxelOctreeAddresses: Uint32Array,
): number {
  let newAddress: number = voxelOctreeAddress;

  const uniqVoxelOctreeAddressesLengthPlusOne: number = uniqVoxelOctreeAddresses[0] + 1;

  // compare it with all already seen <voxelOctree>s
  for (let j = 1; j < uniqVoxelOctreeAddressesLengthPlusOne; j++) {
    if (areIdenticalVoxelOctreesOnSameMemory(memory, voxelOctreeAddress, uniqVoxelOctreeAddresses[j])) {
      newAddress = uniqVoxelOctreeAddresses[j];
      break;
    }
  }

  if (newAddress === voxelOctreeAddress) { // no duplicate
    uniqVoxelOctreeAddresses[0] = uniqVoxelOctreeAddressesLengthPlusOne;
    uniqVoxelOctreeAddresses[uniqVoxelOctreeAddressesLengthPlusOne] = voxelOctreeAddress;
  }

  return newAddress;
}

// TODO apply same logic for materials ?
export function RemoveDuplicateVoxelOctreesOfVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  uniqMaterialsOnlyVoxelOctreeAddresses: Uint32Array, // list of all seen <voxelOctreeAddress> having only materials without any duplicates. [0] used to store the length
  uniqOtherVoxelOctreeAddresses: Uint32Array, // list of all other <voxelOctreeAddress> having only materials without any duplicates. [0] used to store the length
  memoryMap: IMemoryMap,
): number {
  let newVoxelOctreeAddress: number = memoryMap[voxelOctreeAddress];

  if (newVoxelOctreeAddress === NOT_MAPPED) { // first time we encounter this <voxelOctreeAddress>
    if (isVoxelOctreeComposedOfMaterialsOnly(memory, voxelOctreeAddress)) {
      newVoxelOctreeAddress = DeduplicateVoxelOctree(memory, voxelOctreeAddress, uniqMaterialsOnlyVoxelOctreeAddresses);
    } else {
      let voxelOctreeChildAddressAddress: number = voxelOctreeAddress + 1;
      let voxelOctreeChildAddress: number;
      for (let i = 0; i < 8; i++) {
        voxelOctreeChildAddress = readAddress(memory, voxelOctreeChildAddressAddress);
        if (isVoxelOctreeChildIndexAVoxelOctreeAddress(memory, voxelOctreeAddress, i)) {
          writeAddress(
            memory,
            voxelOctreeChildAddressAddress,
            RemoveDuplicateVoxelOctreesOfVoxelOctree(
              memory,
              voxelOctreeChildAddress,
              uniqMaterialsOnlyVoxelOctreeAddresses,
              uniqOtherVoxelOctreeAddresses,
              memoryMap
            )
          );
          voxelOctreeChildAddressAddress += ADDRESS_BYTES_PER_ELEMENT;
        }

        newVoxelOctreeAddress = DeduplicateVoxelOctree(memory, voxelOctreeAddress, uniqOtherVoxelOctreeAddresses);
      }
    }
    memoryMap[voxelOctreeAddress] = newVoxelOctreeAddress;
  }
  return newVoxelOctreeAddress;
}


export function RemoveDuplicateVoxelOctreesOfVoxelOctrees(
  memory: Uint8Array,
  octrees: VoxelOctreeOnSharedMemory[],
  memoryMap: IMemoryMap
): void {
  const uniqMaterialsOnlyVoxelOctreeAddresses: Uint32Array = new Uint32Array(memory.length / VOXEL_OCTREE_BYTES_PER_ELEMENT); // TODO may be optimized
  const uniqOtherVoxelOctreeAddresses: Uint32Array = new Uint32Array(memory.length / VOXEL_OCTREE_BYTES_PER_ELEMENT); // TODO may be optimized

  for (let i = 0, l = octrees.length; i < l; i++) {
    octrees[i].address = RemoveDuplicateVoxelOctreesOfVoxelOctree(
      memory,
      octrees[i].address,
      uniqMaterialsOnlyVoxelOctreeAddresses,
      uniqOtherVoxelOctreeAddresses,
      memoryMap
    );
  }
}


/******* REMOVE UNREACHABLE VOXELS *******/



export function GetUnreachableVoxelsOfVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  exploredVoxels: Uint8Array
): void {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);
  const sideP2: number = side * side; // side power 2
  const sideMinusOne: number = side - 1;

  const voxelsToExploreMaxSize: number = sideP2 * 6;
  let voxelsToExploreX: Uint16Array = new Uint16Array(voxelsToExploreMaxSize);
  let voxelsToExploreY: Uint16Array = new Uint16Array(voxelsToExploreMaxSize);
  let voxelsToExploreZ: Uint16Array = new Uint16Array(voxelsToExploreMaxSize);
  let voxelsToExploreSize: number = 0;
  let nextVoxelsToExploreX: Uint16Array = new Uint16Array(voxelsToExploreMaxSize);
  let nextVoxelsToExploreY: Uint16Array = new Uint16Array(voxelsToExploreMaxSize);
  let nextVoxelsToExploreZ: Uint16Array = new Uint16Array(voxelsToExploreMaxSize);
  let nextVoxelsToExploreSize: number = 0;

  // let reached: number = 0;

  const writeIfReachable = (x: number, y: number, z: number) => {
    const i: number = x + y * side + z * sideP2;
    if (
      (exploredVoxels[i] === 0)
      && (
        readVoxelMaterialAddressOfVoxelOctreeAtPosition(
          memory,
          voxelOctreeAddress,
          voxelOctreeDepth,
          x,
          y,
          z
        ) === NO_MATERIAL
      )
    ) {
      // reached++;
      exploredVoxels[i] = 1;
      nextVoxelsToExploreX[nextVoxelsToExploreSize] = x;
      nextVoxelsToExploreY[nextVoxelsToExploreSize] = y;
      nextVoxelsToExploreZ[nextVoxelsToExploreSize] = z;
      nextVoxelsToExploreSize++;
    }
  };

  const writeIfReachableAndInCube = (x: number, y: number, z: number) => {
    if (
      ((0 <= x) && (x < side))
      && ((0 <= y) && (y < side))
      && ((0 <= z) && (z < side))
    ) {
      writeIfReachable(x, y, z);
    }
  };

  // 8^3 - 6^3= 296

  // mark external faces as <nextVoxelsToExplore>
  for (let x: number = 0; x < side; x++) {
    for (let y: number = 0; y < side; y++) {
      writeIfReachable(x, y, 0);
      writeIfReachable(x, y, sideMinusOne);
      writeIfReachable(x, 0, y);
      writeIfReachable(x, sideMinusOne, y);
      writeIfReachable(0, x, y);
      writeIfReachable(sideMinusOne, x, y);
    }
  }

  // console.log('black reached', reached);

  while (nextVoxelsToExploreSize > 0) {
    // swap <nextVoxelsToExplore> with <voxelsToExplore>
    [voxelsToExploreX, nextVoxelsToExploreX] = [nextVoxelsToExploreX, voxelsToExploreX];
    [voxelsToExploreY, nextVoxelsToExploreY] = [nextVoxelsToExploreY, voxelsToExploreY];
    [voxelsToExploreZ, nextVoxelsToExploreZ] = [nextVoxelsToExploreZ, voxelsToExploreZ];
    voxelsToExploreSize = nextVoxelsToExploreSize;
    nextVoxelsToExploreSize = 0;
    for (let i = 0; i < voxelsToExploreSize; i++) {
      const x: number = voxelsToExploreX[i];
      const y: number = voxelsToExploreY[i];
      const z: number = voxelsToExploreZ[i];

      writeIfReachableAndInCube(x - 1, y, z);
      writeIfReachableAndInCube(x + 1, y, z);
      writeIfReachableAndInCube(x, y - 1, z);
      writeIfReachableAndInCube(x, y + 1, z);
      writeIfReachableAndInCube(x, y, z - 1);
      writeIfReachableAndInCube(x, y, z + 1);
    }
  }

  // console.log('black reached', reached);
}


export function GetUnreachableEdgeVoxelsOfVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  exploredVoxels: Uint8Array
): void {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);
  const sideP2: number = side * side; // side power 2

  const isEdge = (x: number, y: number, z: number) => {
    return (
      ((0 <= x) && (x < side))
      && ((0 <= y) && (y < side))
      && ((0 <= z) && (z < side))
      && (exploredVoxels[x + y * side + z * sideP2] === 1)
    );
  };

  let i: number = 0;
  for (let z: number = 0; z < side; z++) {
    for (let y: number = 0; y < side; y++) {
      for (let x: number = 0; x < side; x++) {
        if (exploredVoxels[i /*x + y * side + z * sideP2*/] === 0) {
          for (let _x: number = -1; _x <= 1; _x++) {
            for (let _y: number = -1; _y <= 1; _y++) {
              for (let _z: number = -1; _z <= 1; _z++) {
                if (
                  (
                    (_x !== 0)
                    || (_y !== 0)
                    || (_z !== 0)
                  )
                  && isEdge(x + _x, y + _y, z + _z)
                ) {
                  exploredVoxels[i] = 2;
                }
              }
            }
          }
          // markAsGrey(x, y - 1, z - 1);
          // markAsGrey(x, y + 1, z - 1);
          // markAsGrey(x, y - 1, z + 1);
          // markAsGrey(x, y + 1, z + 1);
          //
          // markAsGrey(x - 1, y, z - 1);
          // markAsGrey(x + 1, y, z - 1);
          // markAsGrey(x - 1, y, z + 1);
          // markAsGrey(x + 1, y, z + 1);
          //
          // markAsGrey(x - 1, y - 1, z);
          // markAsGrey(x + 1, y - 1, z);
          // markAsGrey(x - 1, y + 1, z);
          // markAsGrey(x + 1, y + 1, z);
          //
          // markAsGrey(x - 1, y - 1, z - 1);
          // markAsGrey(x + 1, y - 1, z - 1);
          // markAsGrey(x - 1, y + 1, z - 1);
          // markAsGrey(x + 1, y + 1, z - 1);
          //
          // markAsGrey(x - 1, y - 1, z + 1);
          // markAsGrey(x + 1, y - 1, z + 1);
          // markAsGrey(x - 1, y + 1, z + 1);
          // markAsGrey(x + 1, y + 1, z + 1);
        }
        i++;
      }
    }
  }
}


export function ReplaceUnreachableEdgeVoxelsOfVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  exploredVoxels: Uint8Array,
  alloc: IAllocFunction,
  voxelMaterialAddress: number,
): number {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);

  let i: number = 0;
  let replaced: number = 0;
  for (let z: number = 0; z < side; z++) {
    for (let y: number = 0; y < side; y++) {
      for (let x: number = 0; x < side; x++) {
        if (exploredVoxels[i /*x + y * side + z * sideP2*/] === 0) {
          replaced++;
          // console.log('replace', x, y, z);
          writeVoxelOctreeMaterialAddress(
            memory,
            voxelOctreeAddress,
            alloc,
            voxelOctreeDepth,
            x,
            y,
            z,
            voxelMaterialAddress,
          );
        }
        i++;
      }
    }
  }

  return replaced;
}


/**
 * WARN: USE WITH CARE ! this function won't always resolve in a smaller or better <voxelOctree>
 *   -> for example:
 *    - if the <voxelOctree> is already uniform
 *    - if the children of the <voxelOctree> are shared or re-used
 */
export function RemoveUnreachableVoxelsOfVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  alloc: IAllocFunction,
  voxelOctreeDepth: number,
  voxelMaterialAddress: number = NO_MATERIAL
): number {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);
  const exploredVoxels: Uint8Array = new Uint8Array(side * side * side);

  GetUnreachableVoxelsOfVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    exploredVoxels,
  );

  GetUnreachableEdgeVoxelsOfVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    exploredVoxels,
  );

  return ReplaceUnreachableEdgeVoxelsOfVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    exploredVoxels,
    alloc,
    voxelMaterialAddress,
  );
}


/******* COMPACT VOXEL OCTREES *******/


export function CompactVoxelOctrees(
  memory: Uint8Array,
  octrees: VoxelOctreeOnSharedMemory[],
  memoryMap: IMemoryMap = new Uint32Array(memory.length),
): void {
  RemoveDuplicateVoxelMaterialsOfVoxelOctrees(memory, octrees, clearMemoryMap(memoryMap));
  RemoveUniformChildVoxelOctreesOfVoxelOctrees(memory, octrees);
  RemoveDuplicateVoxelOctreesOfVoxelOctrees(memory, octrees, clearMemoryMap(memoryMap));
}

export function CompactVoxelOctreesOnNewMemory(
  memory: Uint8Array,
  octrees: VoxelOctreeOnSharedMemory[],
  newMemory: Uint8Array,
  newMemoryAlloc: IAllocFunction,
): VoxelOctreeOnSharedMemory[] {
  const memoryMap: IMemoryMap = new Uint32Array(memory.length);
  CompactVoxelOctrees(memory, octrees, memoryMap);
  return cloneVoxelOctreesOnDifferentMemory(
    memory,
    octrees,
    newMemory,
    newMemoryAlloc,
    clearMemoryMap(memoryMap),
  );
}

/* NON DESTRUCTIVE */


// export function CompactVoxelOctreesOnDifferentMemories(
//   octrees: VoxelOctree[],
//   options: CompactSizeOptions = {},
// ): any {  // TODO type
//   if (options.originalSize === void 0) {
//     const sharedMemory: AbstractMemory = new AbstractMemory(2 ** 30); // TODO
//     const sharedMemoryView: Uint8Array = sharedMemory.toUint8Array();
//     const sharedMemoryAlloc: TAllocFunction = sharedMemory.toAllocFunction();
//
//     const octreesOnSharedMemory: VoxelOctreeOnSharedMemory[] = CopyVoxelOctreesOnSharedMemory(octrees, sharedMemoryView, sharedMemoryAlloc);
//     // console.log(octreesOnSharedMemory);
//
//     const memoryMap: TMemoryMap = new Uint32Array(sharedMemoryAlloc(0));
//
//     RemoveDuplicateVoxelMaterialsOfVoxelOctrees(sharedMemoryView, octreesOnSharedMemory, ClearMemoryMap(memoryMap));
//     RemoveUniformChildVoxelOctreesOfVoxelOctrees(sharedMemoryView, octreesOnSharedMemory);
//     RemoveDuplicateVoxelOctreesOfVoxelOctrees(sharedMemoryView, octreesOnSharedMemory, ClearMemoryMap(memoryMap));
//
//     // TODO continue here:
//     // 1 - compact octrees using dynamic addresses
//     // 2 - remove dynamic addresses from compacted octree (decrease dyn addr)
//     // 3 - regenerate octree, in the smallest possible memory
//
//     const NEW_MEMORY = new AbstractMemory(2 ** 16);
//     const NEW_MEMORY_VIEW = NEW_MEMORY.toUint8Array();
//     const newMemoryAlloc = NEW_MEMORY.toAllocFunction();
//
//     const _octrees = CloneVoxelOctreesOnDifferentMemory(
//       sharedMemoryView,
//       octreesOnSharedMemory,
//       NEW_MEMORY_VIEW,
//       newMemoryAlloc,
//       ClearMemoryMap(memoryMap),
//     );
//
//     console.log(_octrees);
//
//     NEW_MEMORY.log('copied');
//
//     return {
//       memory: NEW_MEMORY.toSmallestUint8Array(),
//       octrees: _octrees
//     }
//   } else {
//     const size_before: number = options.originalSize;
//     const _options: CompactSizeOptions = Object.assign({}, options, { originalSize: void 0 });
//     const t1: number = Date.now();
//     const compactedOctrees: any = CompactVoxelOctrees(octrees, _options); // TODO type
//     const t2: number = Date.now();
//     const size_after: number = compactedOctrees.memory.length;
//     const size_text3d: number = GetMaximumAmountOfMemoryUsedByTheVoxelMaterialsOfAVoxelOctreeFromDepth(octrees[0].depth + 1);
//
//     console.log(
//       `compact performance: ${ size_before } -> ${ size_after } (${ Math.round(size_after / size_before * 100) }%) in ${ t2 - t1 }ms`
//       + `\n(text3d: ${ size_text3d } (${ Math.round(size_after / size_text3d * 100) }%))`
//     );
//
//     return compactedOctrees;
//   }
// }






