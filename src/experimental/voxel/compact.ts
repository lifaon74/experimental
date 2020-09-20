import { ComputeVoxelOctreeMemorySize, VoxelOctree } from './octree';
import {
  AreSameMaterials,
  AreSameMaterialsAssumingMemoriesAndAddressesDifferent,
  NO_MATERIAL_ADDRESS,
  VOXEL_MATERIAL_BYTES_PER_ELEMENT,
  VoxelMaterial,
} from './material';
import {
  ADDRESS_BYTES_PER_ELEMENT,
  CreateMemoryMap,
  ReadAddress,
  TAllocFunction,
  WriteAddress,
} from './memory-address';
import { IsSubOctreeAddressIndexAVoxelOctreeAddress } from './sub-octree-adress-index';
import { AbstractMemory } from './abstract-memory';
import {
  IncreaseVoxelOctreeDynamicAddresses,
} from './octree-with-dynamic-address';

export interface CompactSizeOptions {
  compactTime?: number;
  originalSize?: number;
}


export interface VoxelOctreeOnSharedMemory {
  address: number;
  depth: number;
}


// export interface VoxelOctreesOnSharedMemory {
//   sharedMemory: Uint8Array;
//   octrees: VoxelOctreeOnSharedMemory[];
// }

/*--*/

export interface VoxelOctreeWithDynamicAddressOnSharedMemory extends VoxelOctreeOnSharedMemory {

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
    let groupedOctrees: VoxelOctree[]  | undefined = map.get(octree.memory)
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
  alloc: TAllocFunction,
): VoxelOctreeOnSharedMemory[] {
  if (AreOctreeOnSameMemory(octrees)) {
    const octree: VoxelOctree = octrees[0];
    alloc(octree.memory.length);
    sharedMemory.set(octree.memory);
    return octrees.map((octree: VoxelOctree) => {
      return {
        address: octree.address,
        depth: octree.depth,
      }
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


export function MakeOctreesDynamic(
  octrees: VoxelOctreeOnSharedMemory[],
  sharedMemory: Uint8Array,
  alloc: TAllocFunction,
): VoxelOctreeWithDynamicAddressOnSharedMemory[] {
  const memoryMap: Uint32Array = CreateMemoryMap(sharedMemory.length);
  for (let i = 0, l = octrees.length; i < l; i++) {
    const octree: VoxelOctreeOnSharedMemory = octrees[i];
    IncreaseVoxelOctreeDynamicAddresses(sharedMemory, octree.address, alloc, octree.depth, memoryMap);
  }
  return octrees;
}


/******* MATERIALS *******/

// /**
//  * Returns the list of all material addresses used by a VoxelOctree
//  */
// export function ListVoxelOctreeMaterialAddresses(
//   memory: Uint8Array,
//   address: number,
//   materials: Set<number> = new Set<number>()
// ): Set<number> {
//   let subOctreeAddress: number = address + 1;
//   let _address: number;
//   for (let i = 0; i < 8; i++) { // for each sub-tree
//     _address = ReadAddress(memory, subOctreeAddress);
//     if (IsSubOctreeAddressIndexAVoxelOctreeAddress(memory, address, i)) {
//       ListVoxelOctreeMaterialAddresses(memory, _address, materials);
//     } else if (_address !== NO_MATERIAL_ADDRESS) {
//       materials.add(_address);
//     }
//     subOctreeAddress += ADDRESS_BYTES_PER_ELEMENT;
//   }
//   return materials;
// }
//
// /**
//  * Returns the list of all material addresses used by many Voxel Octrees
//  */
// export function ListMultipleVoxelOctreeMaterialAddresses(
//   octreesOnSameMemory: VoxelOctreesOnSharedMemory
// ): Set<number> {
//   const materials: Set<number> = new Set<number>()
//   for (let i = 0, l = octreesOnSameMemory.octrees.length; i < l; i++) {
//     ListVoxelOctreeMaterialAddresses(octreesOnSameMemory.memory, octreesOnSameMemory.octrees[i].address, materials)
//   }
//   return materials;
// }

/*
New material address (never seen before):
- compare with all previously seen materials:
  - found duplicate => replace (in memory) with the correct address
- store in 'seen materials' => [this address, patched address]
Know material:
  - replace (in memory) with the correct address
 */

// export function RemoveDuplicateMaterialsFromOctree(
//   memory: Uint8Array,
//   address: number,
//   uniqMaterials: Uint8Array, // list all materials without any duplicates. [0] used to store the length of uniqMaterials
//   processedMaterials: Map<number, number>, // [processed address, patched address]
// ): void {
//   let subOctreeAddress: number = address + 1;
//   let _address: number;
//   for (let i = 0; i < 8; i++) { // for each sub-tree
//     _address = ReadAddress(memory, subOctreeAddress);
//     if (IsSubOctreeAddressIndexAVoxelOctreeAddress(memory, address, i)) {
//       RemoveDuplicateMaterialsFromOctree(memory, _address, uniqMaterials, processedMaterials);
//     } else if (_address !== NO_MATERIAL_ADDRESS) {
//       let patchedAddress: number | undefined = processedMaterials.get(_address);
//       if (patchedAddress === void 0) {
//         patchedAddress = _address;
//         const uniqMaterialsLengthPlusOne: number = uniqMaterials[0] + 1;
//         for (let j = 1; j < uniqMaterialsLengthPlusOne; j++) {
//           // console.log('comparing', _address, uniqMaterials[j]);
//           if (AreSameMaterialsAssumingMemoriesAndAddressesDifferent(memory, _address, memory, uniqMaterials[j])) {
//             patchedAddress = uniqMaterials[j];
//             WriteAddress(memory, subOctreeAddress, patchedAddress);
//             // console.log('duplicate detected', _address, ' -> ', patchedAddress);
//             break;
//           }
//         }
//         if (patchedAddress === _address) { // no duplicate
//           // console.log('set uniq', _address);
//           uniqMaterials[0]++;
//           uniqMaterials[uniqMaterialsLengthPlusOne] = _address;
//         }
//         processedMaterials.set(_address, patchedAddress);
//       } else {
//         if (_address !== patchedAddress) {
//           // console.log('duplicate patched');
//           WriteAddress(memory, subOctreeAddress, patchedAddress);
//         }
//       }
//     }
//     subOctreeAddress += ADDRESS_BYTES_PER_ELEMENT;
//   }
// }
//
// export function RemoveDuplicateMaterials(
//   octreesOnSameMemory: VoxelOctreesOnSharedMemory
// ): void {
//   const uniqMaterials: Uint8Array = new Uint8Array(octreesOnSameMemory.memory.length / VOXEL_MATERIAL_BYTES_PER_ELEMENT);
//   const processedMaterials: Map<number, number> = new Map<number, number>();
//
//   for (let i = 0, l = octreesOnSameMemory.octrees.length; i < l; i++) {
//     RemoveDuplicateMaterialsFromOctree(octreesOnSameMemory.memory, octreesOnSameMemory.octrees[i].address, uniqMaterials, processedMaterials);
//   }
// }

// export function RebuildOctrees(
//   octreesOnSameMemory: VoxelOctreesOnSharedMemory
// ): AbstractMemory {
//   const memory: AbstractMemory = new AbstractMemory(octreesOnSameMemory.memory.length);
//   const memoryView: Uint8Array = memory.toUint8Array();
//   const alloc: TAllocFunction = memory.toAllocFunction();
//
//   for (let i = 0, l = octreesOnSameMemory.octrees.length; i < l; i++) {
//     DeepCopyVoxelOctree(octreesOnSameMemory.memory, octreesOnSameMemory.octrees[i].address, memoryView, alloc);
//   }
//
//   return memory;
// }




export function CompactVoxelOctrees(
  octrees: VoxelOctree[],
  options: CompactSizeOptions = {},
): any {  // TODO type
  if (options.originalSize === void 0) {
    const sharedMemory: AbstractMemory = new AbstractMemory(2 ** 24); // TODO
    const sharedMemoryView: Uint8Array = sharedMemory.toUint8Array();
    const alloc: TAllocFunction = sharedMemory.toAllocFunction();

    const octreesOnSharedMemory: VoxelOctreeOnSharedMemory[] = CopyVoxelOctreesOnSharedMemory(octrees, sharedMemoryView, alloc);
    const octreesWithDynamicAddressOnSharedMemory: VoxelOctreeWithDynamicAddressOnSharedMemory[] = MakeOctreesDynamic(octreesOnSharedMemory, sharedMemoryView, alloc);
    console.log(octreesWithDynamicAddressOnSharedMemory);


    // TODO continue here:
    // 1 - compact octrees using dynamic addresses
    // 2 - remove dynamic addresses from compacted octree (decrease dyn addr)
    // 3 - regenerate octree, in the smallest possible memory

    // RemoveDuplicateMaterials(octreesWithDynamicAddressOnSharedMemory);


    // const memory = RebuildOctrees(octreesOnSameMemory);
    //
    // memory.log('compacted');

    throw 'TODO1';
  } else {
    const size_before: number = options.originalSize;
    const _options: CompactSizeOptions = Object.assign({}, options, { originalSize: void 0 });
    const t1: number = Date.now();
    const compactedOctrees: any = CompactVoxelOctrees(octrees, _options); // TODO type
    const t2: number = Date.now();
    const size_after: number = compactedOctrees.memory.length;
    const size_text3d: number = ((0x1 << (octrees[0].depth + 1)) ** 3) * VOXEL_MATERIAL_BYTES_PER_ELEMENT;

    console.log(
      `compact performance: ${ size_before } -> ${ size_after } (${ Math.round(size_after / size_before * 100) }%) in ${ t2 - t1 }ms`
      + `\n(text3d: ${ size_text3d } (${ Math.round(size_after / size_text3d * 100) }%))`
    );

    return compactedOctrees;
  }
}






