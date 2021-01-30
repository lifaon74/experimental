import { ADDRESS_BYTES_PER_ELEMENT } from './memory-address';
import { vec3 } from 'gl-matrix';

/**
 * Converts a 3d (x, y, z) position and a <voxelOctreeDepth>,
 * into a <voxelOctreeChildIndex>
 * INFO: floats are supported (due to JS), but should be used with extreme precaution
 */
export function convert3DPositionToVoxelOctreeChildIndex(
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

export function convertVec3PositionToVoxelOctreeChildIndex(
  voxelOctreeDepth: number,
  position: vec3,
) {
  return (
    ((position[0] >> voxelOctreeDepth) & 0x1)
    | (((position[1] >> voxelOctreeDepth) & 0x1) << 1)
    | (((position[2] >> voxelOctreeDepth) & 0x1) << 2)
  ) >>> 0;
}

export function convertIntVec3PositionToVoxelOctreeChildIndex(
  voxelOctreeDepth: number,
  position: Uint8Array,
) {
  return (
    ((position[0] >> voxelOctreeDepth) & 0x1)
    | (((position[1] >> voxelOctreeDepth) & 0x1) << 1)
    | (((position[2] >> voxelOctreeDepth) & 0x1) << 2)
  ) >>> 0;
}

/**
 * Returns a number different of 0 (may be compared to 'true') if the <voxelOctreeChildAddress> at <voxelOctreeChildIndex> is a <voxelOctreeAddress> instead of a <voxelMaterialAddress>
 */
export function isVoxelOctreeChildIndexAVoxelOctreeAddress(
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
export function isVoxelOctreeComposedOfMaterialsOnly(
  memory: Uint8Array,
  voxelOctreeAddress: number,
): boolean {
  return (memory[voxelOctreeAddress] === 0b1111111);
}

export function setVoxelOctreeChildAsVoxelOctreeUsingIndex(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeChildIndex: number,
): void {
  memory[voxelOctreeAddress] |= (0x1 << voxelOctreeChildIndex);
}

export function setVoxelOctreeChildAsVoxelMaterialUsingIndex(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeChildIndex: number,
): void {
  memory[voxelOctreeAddress] &= ~(0x1 << voxelOctreeChildIndex);
}


/**
 * Returns the offset to apply to a <voxelOctreeAddress> knowing <voxelOctreeChildIndex> to reach the <voxelOctreeChildAddressAddress>
 */
export function convertVoxelOctreeChildIndexToMemoryAddressOffset(
  voxelOctreeChildIndex: number,
): number {
  return 1 + voxelOctreeChildIndex * ADDRESS_BYTES_PER_ELEMENT;
}

/**
 * Returns the <voxelOctreeChildAddressAddress> from <voxelOctreeAddress> knowing <voxelOctreeChildIndex>
 */
export function convertVoxelOctreeChildIndexToVoxelOctreeChildAddressAddressUsingIndex(
  voxelOctreeAddress: number,
  voxelOctreeChildIndex: number,
): number {
  return voxelOctreeAddress + convertVoxelOctreeChildIndexToMemoryAddressOffset(voxelOctreeChildIndex);
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

