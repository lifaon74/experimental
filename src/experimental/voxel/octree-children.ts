import { ADDRESS_BYTES_PER_ELEMENT } from './memory-address';

/**
 * Converts a 3d (x, y, z) position and a <voxelOctreeDepth>,
 * into a <voxelOctreeChildIndex>
 */
export function Convert3DPositionToVoxelOctreeChildIndex(
  voxelOctreeDepth: number,
  x: number,
  y: number,
  z: number,
) {
  return (
    ((x >> voxelOctreeDepth) & 0x1)
    | (((y >> voxelOctreeDepth) & 0x1) << 1)
    | (((z >> voxelOctreeDepth) & 0x1) << 2)
  ) >>> 0;
}

/**
 * Returns a number different of 0 (may be compared to 'true') if the <voxelOctreeChildAddress> at <voxelOctreeChildIndex> is a <voxelOctreeAddress> instead of a <voxelMaterialAddress>
 */
export function IsVoxelOctreeChildIndexAVoxelOctreeAddress(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeChildIndex: number,
): number {
  return ((memory[voxelOctreeAddress] >> voxelOctreeChildIndex) & 0x1);
}

// export function IsOctreeChildAddressIndexAVoxelOctreeAddressHavingAddressMask(
//   mask: number,
//   octreeChildAddressIndex: number,
// ): number {
//   return ((mask >> octreeChildAddressIndex) & 0x1);
// }

/**
 * Returns true if a <voxelOctree> has only <voxelMaterial>s as children
 */
export function IsVoxelOctreeComposedOfMaterialsOnly(
  memory: Uint8Array,
  voxelOctreeAddress: number,
): boolean {
  return (memory[voxelOctreeAddress] === 0b1111111);
}

export function SetVoxelOctreeChildAsVoxelOctreeUsingIndex(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeChildIndex: number,
): void {
  memory[voxelOctreeAddress] |= (0x1 << voxelOctreeChildIndex);
}

export function SetVoxelOctreeChildAsVoxelMaterialUsingIndex(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeChildIndex: number,
): void {
  memory[voxelOctreeAddress] &= ~(0x1 << voxelOctreeChildIndex);
}


/**
 * Returns the offset to apply to a <voxelOctreeAddress> knowing <voxelOctreeChildIndex> to reach the <voxelOctreeChildAddressAddress>
 */
export function ConvertVoxelOctreeChildIndexToMemoryAddressOffset(
  voxelOctreeChildIndex: number,
): number {
  return 1 + voxelOctreeChildIndex * ADDRESS_BYTES_PER_ELEMENT;
}

/**
 * Returns the <voxelOctreeChildAddressAddress> from <voxelOctreeAddress> knowing <voxelOctreeChildIndex>
 */
export function ConvertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex(
  voxelOctreeAddress: number,
  voxelOctreeChildIndex: number,
): number {
  return voxelOctreeAddress + ConvertVoxelOctreeChildIndexToMemoryAddressOffset(voxelOctreeChildIndex);
}

// export function FindSubOctreeAddressIndex(
//   memory: Uint8Array,
//   address: number,
//   addressToFind: number,
// ): number {
//   address++;
//   for (let i = 0; i < 8; i++) {
//     if (ReadAddress(memory, address) === addressToFind) {
//       return i;
//     }
//     address += ADDRESS_BYTES_PER_ELEMENT;
//   }
//   return -1;
// }
//
// export function FindSubOctreeAddressOffset(
//   memory: Uint8Array,
//   address: number,
//   addressToFind: number,
// ): number {
//   address++;
//   for (let i = 0; i < 8; i++) {
//     if (ReadAddress(memory, address) === addressToFind) {
//       return address;
//     }
//     address += ADDRESS_BYTES_PER_ELEMENT;
//   }
//   return -1;
// }

