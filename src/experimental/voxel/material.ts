import { MemoryView, IAllocFunction } from './memory-address';

export const VOXEL_MATERIAL_BYTES_PER_ELEMENT = 3;
// special address constants
export const NO_MATERIAL = 0xffffffff;
export const NON_UNIFORM_MATERIAL = 0xfffffffd;
export const UNDEFINED_MATERIAL = 0xfffffffc;

/**
 * Represents a Material: it is used to represent how the light will react with a shape
 *  - [r, g, b]
 */
export class VoxelMaterial extends MemoryView {
  static BYTES_PER_ELEMENT: number = VOXEL_MATERIAL_BYTES_PER_ELEMENT;

  static create(
    memory: Uint8Array,
    alloc: IAllocFunction,
    r: number,
    g: number,
    b: number,
  ): VoxelMaterial {
    const voxelMaterial = new VoxelMaterial(memory, alloc(VOXEL_MATERIAL_BYTES_PER_ELEMENT));
    writeNewVoxelMaterial(voxelMaterial.memory, voxelMaterial.address, r, g, b);
    return voxelMaterial;
  }

  constructor(
    memory: Uint8Array,
    address: number,
  ) {
    super(memory, address);
  }
}

/*-----------------*/

/**
 * Writes a new a <voxelMaterial> into 'memory'
 */
export function writeNewVoxelMaterial(
  memory: Uint8Array,
  voxelMaterialAddress: number,
  r: number,
  g: number,
  b: number,
): void {
  memory[voxelMaterialAddress] = r;
  memory[voxelMaterialAddress + 1] = g;
  memory[voxelMaterialAddress + 2] = b;
}

export function areIdenticalVoxelMaterialAddressesOnSameMemory(
  memory: Uint8Array,
  voxelMaterialAddressA: number,
  voxelMaterialAddressB: number,
): boolean {
  return ((voxelMaterialAddressA === NO_MATERIAL) && (voxelMaterialAddressB === NO_MATERIAL)) // both are NO_MATERIAL
    || areIdenticalVoxelMaterialOnSameMemory(memory, voxelMaterialAddressA, voxelMaterialAddressB); // or both are equal
}

export function areIdenticalVoxelMaterialOnSameMemory(
  memory: Uint8Array,
  voxelMaterialAddressA: number,
  voxelMaterialAddressB: number,
): boolean {
  for (let i = 0; i < VOXEL_MATERIAL_BYTES_PER_ELEMENT; i++) {
    if (memory[voxelMaterialAddressA + i] !== memory[voxelMaterialAddressB + i]) {
      return false;
    }
  }
  return true;
}


// export function AreSameMaterialsAssumingMemoriesAndAddressesDifferent(
//   memory1: Uint8Array,
//   address1: number,
//   memory2: Uint8Array,
//   address2: number,
// ): boolean {
//   for (let i = 0; i < VOXEL_MATERIAL_BYTES_PER_ELEMENT; i++) {
//     if (memory1[address1 + i] !== memory2[address2 + i]) {
//       return false;
//     }
//   }
//   return true;
// }
//
// export function AreSameMaterials(
//   memory1: Uint8Array,
//   address1: number,
//   memory2: Uint8Array,
//   address2: number,
// ): boolean {
//   return AreSameMemoriesAndAddresses(memory1, address1, memory2, address2)
//     ? true
//     : AreSameMaterialsAssumingMemoriesAndAddressesDifferent(memory1, address1, memory2, address2);
// }

/**
 * Fast copy of a <voxelMaterial> into another memory and address
 */
export function copyVoxelMaterial(
  sourceMemory: Uint8Array,
  sourceVoxelMaterialAddress: number,
  destinationMemory: Uint8Array,
  destinationVoxelMaterialAddress: number,
): void {
  for (let i = 0; i < VOXEL_MATERIAL_BYTES_PER_ELEMENT; i++) {
    destinationMemory[destinationVoxelMaterialAddress + i] = sourceMemory[sourceVoxelMaterialAddress + i];
  }
}

