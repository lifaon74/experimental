import {
  ADDRESS_BYTES_PER_ELEMENT, createMemoryMap, MemoryView, NOT_MAPPED, readAddress, IAllocFunction, IMemoryMap,
  writeAddress,
} from './memory-address';
import { copyVoxelMaterial, NO_MATERIAL, VOXEL_MATERIAL_BYTES_PER_ELEMENT } from './material';
import {
  convert3DPositionToVoxelOctreeChildIndex, convertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex,
  isVoxelOctreeChildIndexAVoxelOctreeAddress, setVoxelOctreeChildAsVoxelOctreeUsingIndex,
} from './octree-children';
import { VoxelOctreeOnSharedMemory } from './compact';

export const VOXEL_OCTREE_BYTES_PER_ELEMENT = 1 + ADDRESS_BYTES_PER_ELEMENT * 8;

/**
 * Represents a Voxel Octree: it is used to represent a shape composed of many voxels in a  <memory>
 *  - [is-child-voxel-octree: 0b{#0, #1, #2, ...}, child address0 (32b), child address1 (32b), ...]
 */
export class VoxelOctree extends MemoryView {
  static BYTES_PER_ELEMENT: number = VOXEL_OCTREE_BYTES_PER_ELEMENT;

  static create(
    memory: Uint8Array,
    alloc: IAllocFunction,
    voxelOctreeDepth: number,
    materialAddress?: number,
  ): VoxelOctree {
    const voxelOctree = new VoxelOctree(memory, alloc(VOXEL_OCTREE_BYTES_PER_ELEMENT), voxelOctreeDepth);
    writeNewVoxelOctreeInMemory(voxelOctree.memory, voxelOctree.address, materialAddress);
    return voxelOctree;
  }

  readonly depth: number;

  constructor(
    memory: Uint8Array,
    voxelOctreeAddress: number,
    voxelOctreeDepth: number,
  ) {
    super(memory, voxelOctreeAddress);
    this.depth = voxelOctreeDepth;
  }

  get side(): number {
    return convertVoxelOctreeDepthToSide(this.depth);
  }
}


/*--------------------------*/

/**
 * Converts <voxelOctreeSide> to <voxelOctreeDepth>
 */
export function convertVoxelOctreeSideToDepth(
  voxelOctreeSide: number,
): number {
  let depth: number = -1;
  while ((voxelOctreeSide & 0x1) === 0) {
    voxelOctreeSide >>= 1;
    depth++;
  }

  if (voxelOctreeSide !== 0x1) {
    throw new Error(`Invalid side ${ voxelOctreeSide }: must be a power of 2`);
  }

  if (depth < 0) {
    throw new Error(`Invalid side ${ voxelOctreeSide }: must be greater than 2`);
  }

  return depth;
}

/**
 * Converts <voxelOctreeDepth> to <voxelOctreeSide>
 */
export function convertVoxelOctreeDepthToSide(
  voxelOctreeDepth: number,
): number {
  return 2 << voxelOctreeDepth;
}

/**
 * Returns the maximum amount of memory used by a <voxelOctree> with a specific <voxelOctreeDepth>, excluding the memory used by its <voxelMaterial>s
 */
export function getMaximumAmountOfMemoryUsedByAVoxelOctreeExcludingItsVoxelMaterialsFromDepth(
  voxelOctreeDepth: number,
): number {
  return (voxelOctreeDepth === 0)
    ? VOXEL_OCTREE_BYTES_PER_ELEMENT
    : (VOXEL_OCTREE_BYTES_PER_ELEMENT + (8 * getMaximumAmountOfMemoryUsedByAVoxelOctreeExcludingItsVoxelMaterialsFromDepth(voxelOctreeDepth - 1)));
}

/**
 * Returns the maximum number of <voxelMaterial>s that a <voxelOctree> with a specific <voxelOctreeDepth> may have
 */
export function getMaximumNumberOfVoxelMaterialsUsedByAVoxelOctreeFromDepth(
  voxelOctreeDepth: number,
): number {
  return convertVoxelOctreeDepthToSide(voxelOctreeDepth) ** 3;
}

export function getMaximumNumberOfVoxelMaterialsUsedByAVoxelOctreeFromDepthClamped(
  voxelOctreeDepth: number,
): number {
  return Math.min(getMaximumNumberOfVoxelMaterialsUsedByAVoxelOctreeFromDepth(voxelOctreeDepth), (2 ** 8) ** ADDRESS_BYTES_PER_ELEMENT);
}

/**
 * Returns the maximum amount of memory used by the <voxelMaterial>s of a <voxelOctree> with a specific <voxelOctreeDepth>
 */
export function getMaximumAmountOfMemoryUsedByTheVoxelMaterialsOfAVoxelOctreeFromDepth(
  voxelOctreeDepth: number,
): number {
  return getMaximumNumberOfVoxelMaterialsUsedByAVoxelOctreeFromDepthClamped(voxelOctreeDepth) * VOXEL_MATERIAL_BYTES_PER_ELEMENT;
}

/**
 * Returns the maximum amount of memory used by a <voxelOctree> with a specific <voxelOctreeDepth>
 */
export function getMaximumAmountOfMemoryUsedByAVoxelOctreeFromDepth(
  voxelOctreeDepth: number,
): number {
  return getMaximumAmountOfMemoryUsedByAVoxelOctreeExcludingItsVoxelMaterialsFromDepth(voxelOctreeDepth)
    + getMaximumAmountOfMemoryUsedByTheVoxelMaterialsOfAVoxelOctreeFromDepth(voxelOctreeDepth);
}

/*--------------------------*/

/** SUPERFICIAL OPERATIONS **/

/**
 * Writes a new a <voxelOctree> into 'memory'
 */
export function writeNewVoxelOctreeInMemory(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelMaterialAddress: number = NO_MATERIAL,
): void {
  memory[voxelOctreeAddress++] = 0b00000000;
  for (let i = 0; i < 8; i++) {
    writeAddress(memory, voxelOctreeAddress, voxelMaterialAddress);
    voxelOctreeAddress += ADDRESS_BYTES_PER_ELEMENT;
  }
}

/**
 * Returns true if the <voxelOctree>s at addresses 'voxelOctreeAddressA' and 'voxelOctreeAddressB' of 'memory' are identical
 */
export function areIdenticalVoxelOctreesOnSameMemory(
  memory: Uint8Array,
  voxelOctreeAddressA: number,
  voxelOctreeAddressB: number,
): boolean {
  for (let i = 0; i < VOXEL_OCTREE_BYTES_PER_ELEMENT; i++) {
    if (memory[voxelOctreeAddressA + i] !== memory[voxelOctreeAddressB + i]) {
      return false;
    }
  }
  return true;
}


/** READ / WRITE **/

/**
 * Returns the <voxelMaterialAddress> at position (x, y, z) of <voxelOctree>
 */
export function readVoxelMaterialAddressOfVoxelOctreeAtPosition(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  x: number,
  y: number,
  z: number,
): number {
  while (voxelOctreeDepth >= 0) {
    const voxelOctreeChildIndex: number = convert3DPositionToVoxelOctreeChildIndex(voxelOctreeDepth, x, y, z);
    const voxelOctreeChildAddress: number = readAddress(memory, convertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex(voxelOctreeAddress, voxelOctreeChildIndex));
    if (isVoxelOctreeChildIndexAVoxelOctreeAddress(memory, voxelOctreeAddress, voxelOctreeChildIndex)) {
      voxelOctreeAddress = voxelOctreeChildAddress;
      voxelOctreeDepth--;
    } else {
      return voxelOctreeChildAddress;
    }
  }
  throw new Error('Invalid coords');
}


/**
 * Writes <voxelMaterialAddress> at position (x, y, z) of a <voxelOctree>
 *  - may create new <voxelOctree> if required
 */
export function writeVoxelOctreeMaterialAddress(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  alloc: IAllocFunction,
  voxelOctreeDepth: number,
  x: number,
  y: number,
  z: number,
  voxelMaterialAddress: number,
): void {
  // insert <voxelMaterialAddress> at proper place
  while (voxelOctreeDepth >= 0) {
    const voxelOctreeChildIndex: number = convert3DPositionToVoxelOctreeChildIndex(voxelOctreeDepth, x, y, z);
    const voxelOctreeChildAddressAddress: number = convertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex(voxelOctreeAddress, voxelOctreeChildIndex);

    if (voxelOctreeDepth === 0) {
      // for depth === 0 mask should be equals to <voxelMaterialAddress> by default
      writeAddress(memory, voxelOctreeChildAddressAddress, voxelMaterialAddress);
      break;
    } else {
      const voxelOctreeChildAddress: number = readAddress(memory, voxelOctreeChildAddressAddress);
      if (isVoxelOctreeChildIndexAVoxelOctreeAddress(memory, voxelOctreeAddress, voxelOctreeChildIndex)) { // is <voxelOctreeAddress>
        voxelOctreeAddress = voxelOctreeChildAddress;
      } else { // is <voxelMaterialAddress>
        if (voxelOctreeChildAddress === voxelMaterialAddress) { // same values
          break; // here we are not at the deepest lvl, <voxelMaterialAddress>es are the same and the <voxelOctree> should already be optimized => touch nothing
        } else { // <voxelMaterialAddress>es are different => must split current <voxelMaterialAddress> into another <voxelOctree>
          const newVoxelOctreeAddress: number = alloc(VOXEL_OCTREE_BYTES_PER_ELEMENT); // allocates memory for a new <voxelOctree>
          writeNewVoxelOctreeInMemory(memory, newVoxelOctreeAddress, voxelOctreeChildAddress); // initialize the new <voxelOctree> with <voxelMaterialAddress>

          // update mask to <voxelOctreeAddress> type
          setVoxelOctreeChildAsVoxelOctreeUsingIndex(memory, voxelOctreeAddress, voxelOctreeChildIndex);

          // replace the old <voxelMaterialAddress> with the new <voxelOctreeAddress>
          writeAddress(memory, voxelOctreeChildAddressAddress, newVoxelOctreeAddress);

          voxelOctreeAddress = newVoxelOctreeAddress;
        }
      }
    }

    voxelOctreeDepth--;
  }
}


/** EXPLORE **/

/**
 * Computes the size taken by a <voxelOctree> and all its children (<voxelOctree> and <voxelMaterial>)
 */
export function getAmountOfMemoryUsedByVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  exploredOctreeAddresses: Uint8Array,
): number {
  if (exploredOctreeAddresses[voxelOctreeAddress] === 0) {
    exploredOctreeAddresses[voxelOctreeAddress] = 1;
    let size: number = VOXEL_OCTREE_BYTES_PER_ELEMENT;
    let voxelOctreeChildAddressAddress: number = voxelOctreeAddress + 1;
    for (let i = 0; i < 8; i++) {
      const voxelOctreeChildAddress: number = readAddress(memory, voxelOctreeChildAddressAddress);
      if (isVoxelOctreeChildIndexAVoxelOctreeAddress(memory, voxelOctreeAddress, i)) {
        size += getAmountOfMemoryUsedByVoxelOctree(memory, voxelOctreeChildAddress, exploredOctreeAddresses);
      } else if (voxelOctreeAddress !== NO_MATERIAL) {
        size += VOXEL_MATERIAL_BYTES_PER_ELEMENT;
      }
      voxelOctreeChildAddressAddress += ADDRESS_BYTES_PER_ELEMENT;
    }
    return size;
  } else {
    return 0;
  }
}


/** CLONE **/

/**
 * Clones a <voxelMaterial> from one memory to another:
 *  - uses a memoryMap and an alloc function
 */
export function cloneVoxelMaterialOnDifferentMemory(
  sourceMemory: Uint8Array,
  sourceVoxelMaterialAddress: number,
  destinationMemory: Uint8Array,
  destinationAlloc: IAllocFunction,
  memoryMap: IMemoryMap,
): number {
  let destinationVoxelMaterialAddress: number = memoryMap[sourceVoxelMaterialAddress];

  if (destinationVoxelMaterialAddress === NOT_MAPPED) { // first time we encounter this <voxelMaterialAddress>
    destinationVoxelMaterialAddress = destinationAlloc(VOXEL_MATERIAL_BYTES_PER_ELEMENT);
    memoryMap[sourceVoxelMaterialAddress] = destinationVoxelMaterialAddress;
    copyVoxelMaterial(sourceMemory, sourceVoxelMaterialAddress, destinationMemory, destinationVoxelMaterialAddress);
  }

  return destinationVoxelMaterialAddress;
}

/**
 * Clones a <voxelOctree> from one memory to another:
 *  - uses a memoryMap and an alloc function
 */
export function cloneVoxelOctreeOnDifferentMemory(
  sourceMemory: Uint8Array,
  sourceVoxelOctreeAddress: number,
  destinationMemory: Uint8Array,
  destinationAlloc: IAllocFunction,
  memoryMap: IMemoryMap,
): number {
  let destinationVoxelOctreeAddress: number = memoryMap[sourceVoxelOctreeAddress];

  if (destinationVoxelOctreeAddress === NOT_MAPPED) { // first time we encounter this octree address
    destinationVoxelOctreeAddress = destinationAlloc(VOXEL_OCTREE_BYTES_PER_ELEMENT);
    memoryMap[sourceVoxelOctreeAddress] = destinationVoxelOctreeAddress;

    let sourceVoxelOctreeChildAddressAddress: number = sourceVoxelOctreeAddress + 1;
    let destinationVoxelOctreeChildAddressAddress: number = destinationVoxelOctreeAddress + 1;

    let voxelOctreeChildAddress: number;
    let newVoxelOctreeChildAddress: number;

    for (let i = 0; i < 8; i++) { // for each sub-tree
      voxelOctreeChildAddress = readAddress(sourceMemory, sourceVoxelOctreeChildAddressAddress);

      if (isVoxelOctreeChildIndexAVoxelOctreeAddress(sourceMemory, sourceVoxelOctreeAddress, i)) {
        newVoxelOctreeChildAddress = cloneVoxelOctreeOnDifferentMemory(sourceMemory, voxelOctreeChildAddress, destinationMemory, destinationAlloc, memoryMap);
      } else if (voxelOctreeChildAddress === NO_MATERIAL) {
        newVoxelOctreeChildAddress = NO_MATERIAL;
      } else {
        newVoxelOctreeChildAddress = cloneVoxelMaterialOnDifferentMemory(sourceMemory, voxelOctreeChildAddress, destinationMemory, destinationAlloc, memoryMap);
      }

      writeAddress(destinationMemory, destinationVoxelOctreeChildAddressAddress, newVoxelOctreeChildAddress);

      sourceVoxelOctreeChildAddressAddress += ADDRESS_BYTES_PER_ELEMENT;
      destinationVoxelOctreeChildAddressAddress += ADDRESS_BYTES_PER_ELEMENT;
    }
  }

  return destinationVoxelOctreeAddress;
}

/**
 * Clones a list of <voxelOctree>s from one memory to another:
 *  - uses an alloc function
 */
export function cloneVoxelOctreesOnDifferentMemory(
  sourceMemory: Uint8Array,
  octrees: VoxelOctreeOnSharedMemory[],
  destinationMemory: Uint8Array,
  destinationAlloc: IAllocFunction,
  memoryMap: IMemoryMap = createMemoryMap(sourceMemory.length),
): VoxelOctreeOnSharedMemory[] {
  return octrees.map((octree: VoxelOctreeOnSharedMemory) => {
    const destinationVoxelOctreeAddress: number = cloneVoxelOctreeOnDifferentMemory(sourceMemory, octree.address, destinationMemory, destinationAlloc, memoryMap);
    return {
      address: destinationVoxelOctreeAddress,
      depth: octree.depth,
    };
  });
}
