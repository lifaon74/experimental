import {
  ADDRESS_BYTES_PER_ELEMENT, NOT_MAPPED,
  ReadAddress,
  ReadDynamicAddress,
  TAllocFunction,
  WriteAddress,
} from './memory-address';
import { IsSubOctreeAddressIndexAVoxelOctreeAddress } from './sub-octree-adress-index';
import { VOXEL_OCTREE_BYTES_PER_ELEMENT, VoxelOctree } from './octree';


export class VoxelOctreeWithDynamicAddress extends VoxelOctree {
  readonly addressDepth: number;

  constructor(
    memory: Uint8Array,
    address: number,
    depth: number,
    addressDepth: number,
  ) {
    super(memory, address, depth);
    this.addressDepth = addressDepth;
  }
}

/*-----------------------*/

// export function IncreaseVoxelOctreeDynamicAddresses(
//   memory: Uint8Array,
//   address: number,
//   alloc: TAllocFunction,
//   depth: number,
//   memoryMap: Map<number, number> = new Map<number, number>(),
//   recursive: boolean = true,
// ): Map<number, number> {
//   let subOctreeAddress: number = address + 1;
//   let _address: number;
//   for (let i = 0; i < 8; i++) { // for each sub-tree
//     _address = ReadAddress(memory, subOctreeAddress);
//     let mappedAddress: number | undefined = memoryMap.get(_address);
//     if (mappedAddress === void 0) {
//       mappedAddress = alloc(ADDRESS_BYTES_PER_ELEMENT);
//       WriteAddress(memory, mappedAddress, _address);
//       memoryMap.set(_address, mappedAddress);
//     }
//     WriteAddress(memory, subOctreeAddress, mappedAddress);
//
//     if (recursive && IsSubOctreeAddressIndexAVoxelOctreeAddress(memory, address, i) && (depth > 0)) {
//       IncreaseVoxelOctreeDynamicAddresses(memory, _address, alloc, depth - 1, memoryMap, true);
//     }
//
//     subOctreeAddress += ADDRESS_BYTES_PER_ELEMENT;
//   }
//   return memoryMap;
// }





export function IncreaseVoxelOctreeDynamicAddresses(
  memory: Uint8Array,
  address: number,
  alloc: TAllocFunction,
  depth: number,
  memoryMap: Uint32Array,
  recursive: boolean = true,
): void {
  let subOctreeAddress: number = address + 1;
  let _address: number;
  for (let i = 0; i < 8; i++) { // for each sub-tree
    _address = ReadAddress(memory, subOctreeAddress);
    let mappedAddress: number = memoryMap[_address];
    if (mappedAddress === NOT_MAPPED) {
      mappedAddress = alloc(ADDRESS_BYTES_PER_ELEMENT);
      WriteAddress(memory, mappedAddress, _address);
      memoryMap[_address] = mappedAddress;
    }
    WriteAddress(memory, subOctreeAddress, mappedAddress);

    if (recursive && IsSubOctreeAddressIndexAVoxelOctreeAddress(memory, address, i) && (depth > 0)) {
       IncreaseVoxelOctreeDynamicAddresses(memory, _address, alloc, depth - 1, memoryMap, true);
    }

    subOctreeAddress += ADDRESS_BYTES_PER_ELEMENT;
  }
}

export function DecreaseVoxelOctreeDynamicAddresses(
  memory: Uint8Array,
  address: number,
  alloc: TAllocFunction,
  depth: number,
  recursive: boolean = true,
): void {
  let subOctreeAddress: number = address + 1;
  let _address: number;
  for (let i = 0; i < 8; i++) { // for each sub-tree
    _address = ReadAddress(memory, subOctreeAddress);
    WriteAddress(memory, subOctreeAddress, ReadAddress(memory, _address));

    if (recursive && IsSubOctreeAddressIndexAVoxelOctreeAddress(memory, address, i) && (depth > 0)) {
      DecreaseVoxelOctreeDynamicAddresses(memory, _address, alloc, depth - 1, true);
    }

    subOctreeAddress += ADDRESS_BYTES_PER_ELEMENT;
  }
}

// export function IncreaseVoxelOctreeDynamicAddresses(
//   memory: Uint8Array,
//   address: number,
//   alloc: TAllocFunction,
//   currentOctreeAddressDepth: number,
//   targetOctreeAddressDepth: number,
//   memoryMap: Map<number, number> = new Map<number, number>(),
//   recursive: boolean = true,
// ): void {
//   let subOctreeAddress: number = address + 1;
//   let _address: number;
//   for (let i = 0; i < 8; i++) { // for each sub-tree
//     _address = ReadAddress(memory, subOctreeAddress);
//     let mappedAddress: number | undefined = memoryMap.get(_address);
//     if (mappedAddress === void 0) {
//       mappedAddress = alloc(ADDRESS_BYTES_PER_ELEMENT);
//       WriteAddress(memory, subOctreeAddress, mappedAddress);
//       memoryMap.set(_address, mappedAddress);
//     }
//     WriteAddress(memory, subOctreeAddress, mappedAddress);
//
//     if (recursive && IsSubOctreeAddressIndexAVoxelOctreeAddress(memory, address, i)) {
//       IncreaseVoxelOctreeDynamicAddresses(memory, address, alloc, currentOctreeAddressDepth, targetOctreeAddressDepth, memoryMap, true);
//     }
//   }
// }

