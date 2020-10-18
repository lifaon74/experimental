import {
  ADDRESS_BYTES_PER_ELEMENT, CreateMemoryMap, MemoryView, NOT_MAPPED, ReadAddress, TAllocFunction, TMemoryMap,
  WriteAddress,
} from './memory-address';
import { CopyVoxelMaterial, NO_MATERIAL, VOXEL_MATERIAL_BYTES_PER_ELEMENT } from './material';
import {
  Convert3DPositionToVoxelOctreeChildIndex, IsVoxelOctreeChildIndexAVoxelOctreeAddress,
  ConvertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex, SetVoxelOctreeChildAsVoxelOctreeUsingIndex,
} from './octree-children';
import { VoxelOctreeOnSharedMemory } from './compact';

export const VOXEL_OCTREE_BYTES_PER_ELEMENT = 1 + ADDRESS_BYTES_PER_ELEMENT * 8;

/**
 * Represents a Voxel Octree: it is used to represent a shape composed of many voxels in a performing structure
 *  - [is-child-voxel-octree: 0b{#0, #1, #2, ...}, child address0 (32b), child address1 (32b), ...]
 */
export class VoxelOctree extends MemoryView {
  static BYTES_PER_ELEMENT: number = VOXEL_OCTREE_BYTES_PER_ELEMENT;

  static create(
    memory: Uint8Array,
    alloc: TAllocFunction,
    voxelOctreeDepth: number,
    materialAddress?: number,
  ): VoxelOctree {
    const voxelOctree = new VoxelOctree(memory, alloc(VOXEL_OCTREE_BYTES_PER_ELEMENT), voxelOctreeDepth);
    WriteNewVoxelOctreeInMemory(voxelOctree.memory, voxelOctree.address, materialAddress);
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
    return ConvertVoxelOctreeDepthToSide(this.depth);
  }
}


/*--------------------------*/

/**
 * Converts <voxelOctreeSide> to <voxelOctreeDepth>
 */
export function ConvertVoxelOctreeSideToDepth(voxelOctreeSide: number): number {
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
export function ConvertVoxelOctreeDepthToSide(voxelOctreeDepth: number): number {
  return 2 << voxelOctreeDepth;
}

/**
 * Returns the maximum amount of memory used by a <voxelOctree> with a specific <voxelOctreeDepth>, excluding the memory used by its <voxelMaterial>s
 */
export function GetMaximumAmountOfMemoryUsedByAVoxelOctreeExcludingItsVoxelMaterialsFromDepth(voxelOctreeDepth: number): number {
  return (voxelOctreeDepth === 0)
    ? VOXEL_OCTREE_BYTES_PER_ELEMENT
    : (VOXEL_OCTREE_BYTES_PER_ELEMENT + (8 * GetMaximumAmountOfMemoryUsedByAVoxelOctreeExcludingItsVoxelMaterialsFromDepth(voxelOctreeDepth - 1)));
}

/**
 * Returns the maximum number of <voxelMaterial>s that a <voxelOctree> with a specific <voxelOctreeDepth> may have
 */
export function GetMaximumNumberOfVoxelMaterialsUsedByAVoxelOctreeFromDepth(voxelOctreeDepth: number): number {
  return ConvertVoxelOctreeDepthToSide(voxelOctreeDepth) ** 3;
}

/**
 * Returns the maximum amount of memory used by the <voxelMaterial>s of a <voxelOctree> with a specific <voxelOctreeDepth>
 */
export function GetMaximumAmountOfMemoryUsedByTheVoxelMaterialsOfAVoxelOctreeFromDepth(voxelOctreeDepth: number): number {
  return GetMaximumNumberOfVoxelMaterialsUsedByAVoxelOctreeFromDepth(voxelOctreeDepth) * VOXEL_MATERIAL_BYTES_PER_ELEMENT;
}

/**
 * Returns the maximum amount of memory used by a <voxelOctree> with a specific <voxelOctreeDepth>
 */
export function GetMaximumAmountOfMemoryUsedByAVoxelOctreeFromDepth(voxelOctreeDepth: number): number {
  return GetMaximumAmountOfMemoryUsedByAVoxelOctreeExcludingItsVoxelMaterialsFromDepth(voxelOctreeDepth)
    + GetMaximumAmountOfMemoryUsedByTheVoxelMaterialsOfAVoxelOctreeFromDepth(voxelOctreeDepth);
}

/*--------------------------*/

/** SUPERFICIAL OPERATIONS **/

/**
 * Writes a new a <voxelOctree> into 'memory'
 */
export function WriteNewVoxelOctreeInMemory(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelMaterialAddress: number = NO_MATERIAL,
): void {
  memory[voxelOctreeAddress++] = 0b00000000;
  for (let i = 0; i < 8; i++) {
    WriteAddress(memory, voxelOctreeAddress, voxelMaterialAddress);
    voxelOctreeAddress += ADDRESS_BYTES_PER_ELEMENT;
  }
}

/**
 * Returns true if the <voxelOctree>s at addresses 'voxelOctreeAddressA' and 'voxelOctreeAddressB' of 'memory' are identical
 */
export function AreIdenticalVoxelOctreesOnSameMemory(
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
export function ReadVoxelMaterialAddressOfVoxelOctreeAtPosition(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  x: number,
  y: number,
  z: number,
): number {
  let voxelOctreeChildIndex: number;
  let voxelOctreeChildAddress: number;

  while (voxelOctreeDepth >= 0) {
    voxelOctreeChildIndex = Convert3DPositionToVoxelOctreeChildIndex(voxelOctreeDepth, x, y, z);
    voxelOctreeChildAddress = ReadAddress(memory, ConvertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex(voxelOctreeAddress, voxelOctreeChildIndex));
    if (IsVoxelOctreeChildIndexAVoxelOctreeAddress(memory, voxelOctreeAddress, voxelOctreeChildIndex)) {
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
export function WriteVoxelOctreeMaterialAddress(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  alloc: TAllocFunction,
  voxelOctreeDepth: number,
  x: number,
  y: number,
  z: number,
  voxelMaterialAddress: number,
): void {
  let voxelOctreeChildIndex: number;
  let voxelOctreeChildAddressAddress: number;
  let voxelOctreeChildAddress: number;

  // insert <voxelMaterialAddress> at proper place
  while (voxelOctreeDepth >= 0) {
    voxelOctreeChildIndex = Convert3DPositionToVoxelOctreeChildIndex(voxelOctreeDepth, x, y, z);
    voxelOctreeChildAddressAddress = ConvertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex(voxelOctreeAddress, voxelOctreeChildIndex);

    if (voxelOctreeDepth === 0) {
      // for depth === 0 mask should be equals to <voxelMaterialAddress> by default
      WriteAddress(memory, voxelOctreeChildAddressAddress, voxelMaterialAddress);
      break;
    } else {
      voxelOctreeChildAddress = ReadAddress(memory, voxelOctreeChildAddressAddress);
      if (IsVoxelOctreeChildIndexAVoxelOctreeAddress(memory, voxelOctreeAddress, voxelOctreeChildIndex)) { // is <voxelOctreeAddress>
        voxelOctreeAddress = voxelOctreeChildAddress;
      } else { // is <voxelMaterialAddress>
        if (voxelOctreeChildAddress === voxelMaterialAddress) { // same values
          break; // here we are not at the deepest lvl, <voxelMaterialAddress>es are the same and the <voxelOctree> should already be optimized => touch nothing
        } else { // <voxelMaterialAddress>es are different => must split current <voxelMaterialAddress> into another <voxelOctree>
          const newVoxelOctreeAddress: number = alloc(VOXEL_OCTREE_BYTES_PER_ELEMENT); // allocates memory for a new <voxelOctree>
          WriteNewVoxelOctreeInMemory(memory, newVoxelOctreeAddress, voxelOctreeChildAddress); // initialize the new <voxelOctree> with <voxelMaterialAddress>

          // update mask to <voxelOctreeAddress> type
          SetVoxelOctreeChildAsVoxelOctreeUsingIndex(memory, voxelOctreeAddress, voxelOctreeChildIndex);

          // replace the old <voxelMaterialAddress> with the new <voxelOctreeAddress>
          WriteAddress(memory, voxelOctreeChildAddressAddress, newVoxelOctreeAddress);

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
export function GetAmountOfMemoryUsedByVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  exploredOctreeAddresses: Uint8Array,
): number {
  if (exploredOctreeAddresses[voxelOctreeAddress] === 0) {
    exploredOctreeAddresses[voxelOctreeAddress] = 1;
    let size: number = VOXEL_OCTREE_BYTES_PER_ELEMENT;
    let voxelOctreeChildAddressAddress: number = voxelOctreeAddress + 1;
    let voxelOctreeChildAddress: number;
    for (let i = 0; i < 8; i++) {
      voxelOctreeChildAddress = ReadAddress(memory, voxelOctreeChildAddressAddress);
      if (IsVoxelOctreeChildIndexAVoxelOctreeAddress(memory, voxelOctreeAddress, i)) {
        size += GetAmountOfMemoryUsedByVoxelOctree(memory, voxelOctreeChildAddress, exploredOctreeAddresses);
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
export function CloneVoxelMaterialOnDifferentMemory(
  sourceMemory: Uint8Array,
  sourceVoxelMaterialAddress: number,
  destinationMemory: Uint8Array,
  destinationAlloc: TAllocFunction,
  memoryMap: TMemoryMap,
): number {
  let destinationVoxelMaterialAddress: number = memoryMap[sourceVoxelMaterialAddress];

  if (destinationVoxelMaterialAddress === NOT_MAPPED) { // first time we encounter this <voxelMaterialAddress>
    destinationVoxelMaterialAddress = destinationAlloc(VOXEL_MATERIAL_BYTES_PER_ELEMENT);
    memoryMap[sourceVoxelMaterialAddress] = destinationVoxelMaterialAddress;
    CopyVoxelMaterial(sourceMemory, sourceVoxelMaterialAddress, destinationMemory, destinationVoxelMaterialAddress);
  }

  return destinationVoxelMaterialAddress;
}

/**
 * Clones a <voxelOctree> from one memory to another:
 *  - uses a memoryMap and an alloc function
 */
export function CloneVoxelOctreeOnDifferentMemory(
  sourceMemory: Uint8Array,
  sourceVoxelOctreeAddress: number,
  destinationMemory: Uint8Array,
  destinationAlloc: TAllocFunction,
  memoryMap: TMemoryMap,
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
      voxelOctreeChildAddress = ReadAddress(sourceMemory, sourceVoxelOctreeChildAddressAddress);

      if (IsVoxelOctreeChildIndexAVoxelOctreeAddress(sourceMemory, sourceVoxelOctreeAddress, i)) {
        newVoxelOctreeChildAddress = CloneVoxelOctreeOnDifferentMemory(sourceMemory, voxelOctreeChildAddress, destinationMemory, destinationAlloc, memoryMap);
      } else if (voxelOctreeChildAddress === NO_MATERIAL) {
        newVoxelOctreeChildAddress = NO_MATERIAL;
      } else {
        newVoxelOctreeChildAddress = CloneVoxelMaterialOnDifferentMemory(sourceMemory, voxelOctreeChildAddress, destinationMemory, destinationAlloc, memoryMap);
      }

      WriteAddress(destinationMemory, destinationVoxelOctreeChildAddressAddress, newVoxelOctreeChildAddress);

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
export function CloneVoxelOctreesOnDifferentMemory(
  sourceMemory: Uint8Array,
  octrees: VoxelOctreeOnSharedMemory[],
  destinationMemory: Uint8Array,
  destinationAlloc: TAllocFunction,
  memoryMap: TMemoryMap = CreateMemoryMap(sourceMemory.length),
): VoxelOctreeOnSharedMemory[] {
  return octrees.map((octree: VoxelOctreeOnSharedMemory) => {
    const destinationVoxelOctreeAddress: number = CloneVoxelOctreeOnDifferentMemory(sourceMemory, octree.address, destinationMemory, destinationAlloc, memoryMap);
    return {
      address: destinationVoxelOctreeAddress,
      depth: octree.depth,
    }
  });
}
