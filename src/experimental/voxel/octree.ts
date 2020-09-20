import {
  ADDRESS_BYTES_PER_ELEMENT,
  MemoryView,
  NOT_MAPPED,
  ReadAddress,
  TAllocFunction,
  WriteAddress,
} from './memory-address';
import { NO_MATERIAL_ADDRESS, VOXEL_MATERIAL_BYTES_PER_ELEMENT } from './material';
import {
  Convert3DPositionToSubOctreeAddressIndex,
  IsSubOctreeAddressIndexAVoxelOctreeAddress,
  SubOctreeAddressIndexToMemoryAddress,
  WriteSubOctreeAddressIndexAsSubVoxelOctree,
} from './sub-octree-adress-index';

export const VOXEL_OCTREE_BYTES_PER_ELEMENT = 1 + ADDRESS_BYTES_PER_ELEMENT * 8;

/**
 * Represents a Voxel Octree: it is used to represent a square shape composed of many voxels in a performing manner
 *  - [is-sub-octree: 0b{#0, #1, #2, ...}, address0 (32b), address1 (32b), ...]
 */
export class VoxelOctree extends MemoryView {
  static BYTES_PER_ELEMENT: number = VOXEL_OCTREE_BYTES_PER_ELEMENT;

  static create(
    memory: Uint8Array,
    alloc: TAllocFunction,
    depth: number,
    materialAddress?: number,
  ): VoxelOctree {
    const voxelOctree = new VoxelOctree(memory, alloc(VOXEL_OCTREE_BYTES_PER_ELEMENT), depth);
    CreateVoxelOctree(voxelOctree.memory, voxelOctree.address, materialAddress);
    return voxelOctree;
  }

  readonly depth: number;

  constructor(
    memory: Uint8Array,
    address: number,
    depth: number,
  ) {
    super(memory, address);
    this.depth = depth;
  }

  get side(): number {
    return GetVoxelOctreeSideFromDepth(this.depth);
  }
}


/*--------------------------*/

/**
 * Returns the depth of a Voxel Octree from knowing its side
 */
export function GetVoxelOctreeDepthFromSide(side: number): number {
  let depth: number = -1;
  while ((side & 0x1) === 0) {
    side >>= 1;
    depth++;
  }

  if (side !== 0x1) {
    throw new Error(`Invalid side ${ side }: must be a power of 2`);
  }

  if (depth < 0) {
    throw new Error(`Invalid side ${ side }: must be greater than 2`);
  }

  return depth;
}

/**
 * Returns the side of a Voxel Octree knowing its depth
 */
export function GetVoxelOctreeSideFromDepth(depth: number): number {
  return 2 << depth;
}


/*--------------------------*/


/**
 * Creates a Voxel Octree into memory
 */
export function CreateVoxelOctree(
  memory: Uint8Array,
  address: number,
  materialAddress: number = NO_MATERIAL_ADDRESS,
): void {
  memory[address++] = 0b00000000;
  for (let i = 0; i < 8; i++) {
    WriteAddress(memory, address, materialAddress);
    address += ADDRESS_BYTES_PER_ELEMENT;
  }
}

/**
 * Fast copy of a Voxel Octree into another memory and address
 */
export function CopyVoxelOctree(
  sourceMemory: Uint8Array,
  sourceAddress: number,
  destinationMemory: Uint8Array,
  destinationAddress: number,
): void {
  for (let i = 0; i < VOXEL_OCTREE_BYTES_PER_ELEMENT; i++) {
    destinationMemory[destinationAddress + i] = sourceMemory[sourceAddress + i];
  }
}

export function ComputeVoxelOctreeMemorySize(
  memory: Uint8Array,
  address: number,
  depth: number,
  exploredAddresses: Uint8Array,
): number {
  let size: number = VOXEL_OCTREE_BYTES_PER_ELEMENT;
  let subOctreeAddress: number = address + 1;
  let _address: number;
  for (let i = 0; i < 8; i++) { // for each sub-tree
    _address = ReadAddress(memory, subOctreeAddress);
    if (exploredAddresses[_address] === 0) {
      exploredAddresses[_address] = 1;
      if (IsSubOctreeAddressIndexAVoxelOctreeAddress(memory, address, i)) {
        if (depth > 0) {
          size += ComputeVoxelOctreeMemorySize(memory, _address, depth - 1, exploredAddresses);
        } else {
          throw new Error(`Found child voxel octree at lowest depth`);
        }
      } else {
        size += VOXEL_MATERIAL_BYTES_PER_ELEMENT;
      }
    }
    subOctreeAddress += ADDRESS_BYTES_PER_ELEMENT;
  }
  return size;
}

/**
 * Returns the address of the material composing a Voxel Octree at position (x, y, z)
 */
export function ReadVoxelOctreeMaterialAddress(
  memory: Uint8Array,
  address: number,
  depth: number,
  x: number,
  y: number,
  z: number,
): number {
  let subOctreeAddressIndex: number;
  let _address: number; // temp address

  while (depth >= 0) {
    subOctreeAddressIndex = Convert3DPositionToSubOctreeAddressIndex(depth, x, y, z);
    _address = ReadAddress(memory, SubOctreeAddressIndexToMemoryAddress(address, subOctreeAddressIndex));
    if (IsSubOctreeAddressIndexAVoxelOctreeAddress(memory, address, subOctreeAddressIndex)) {
      address = _address;
      depth--;
    } else {
      return _address;
    }
  }

  throw new Error('Invalid coords');
}

/**
 * Writes a new material address (materialAddress) at position (x, y, z) in a Voxel Octree
 *  - creates new child octrees if required
 */
export function WriteVoxelOctreeMaterialAddress(
  memory: Uint8Array,
  address: number,
  alloc: TAllocFunction,
  depth: number,
  x: number,
  y: number,
  z: number,
  materialAddress: number,
): void {
  let subOctreeAddressIndex: number;
  let _subOctreeAddress: number; // temp address of a sub octree's address
  let _address: number; // temp address

  // insert materialAddress at proper place
  while (depth >= 0) {
    subOctreeAddressIndex = Convert3DPositionToSubOctreeAddressIndex(depth, x, y, z);
    _subOctreeAddress = SubOctreeAddressIndexToMemoryAddress(address, subOctreeAddressIndex);

    if (depth === 0) {
      // for depth === 0 mask should be equals to 'material' by default
      // WriteAddressSpotAsVoxelMaterial(memory, address, subOctreeAddressIndex)
      WriteAddress(memory, _subOctreeAddress, materialAddress);
      break;
    } else {
      _address = ReadAddress(memory, _subOctreeAddress);
      if (IsSubOctreeAddressIndexAVoxelOctreeAddress(memory, address, subOctreeAddressIndex)) { // is address type
        address = _address;
      } else {
        if (_address === materialAddress) { // same values
          break; // here we are not at the deepest lvl, material addresses are the same and octree should already be optimized => touch nothing
        } else { // material addresses are different => must split current materialAddress into another octree
          const newAddress: number = alloc(VOXEL_OCTREE_BYTES_PER_ELEMENT); // allocates memory for a new octree
          CreateVoxelOctree(memory, newAddress, _address); // put current material address as octree's materials

          // replace mask value by octree type
          WriteSubOctreeAddressIndexAsSubVoxelOctree(memory, address, subOctreeAddressIndex);

          // replace value by newAddress
          WriteAddress(memory, _subOctreeAddress, newAddress);

          address = newAddress;
        }
      }
    }

    depth--;
  }
}



