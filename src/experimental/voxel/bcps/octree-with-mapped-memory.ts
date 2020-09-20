import { ResolveMappedAddress, TMappedMemories, TMappedMemoryAddresses } from './mapped-memory';
import { ADDRESS_BYTES_PER_ELEMENT, ReadAddress, WriteAddress } from '../memory-address';
import { NO_MATERIAL_ADDRESS } from '../material';

export function ReadMappedAddress(
  memory: Uint8Array,
  address: number,
  addressesMap: TMappedMemoryAddresses,
): number {
  return ResolveMappedAddress(ReadAddress(memory, address), addressesMap);
}

export function CopyRemappedAddress(
  sourceMemory: Uint8Array,
  sourceAddress: number,
  destinationMemory: Uint8Array,
  destinationAddress: number,
  addressesMap: TMappedMemoryAddresses,
): void {
  WriteAddress(destinationMemory, destinationAddress, ReadMappedAddress(sourceMemory, sourceAddress, addressesMap));
}

/**
 * Copies a Voxel Octree into another memory and address after applying a new memory mapping
 */
export function CopyRemappedVoxelOctree(
  sourceMemory: Uint8Array,
  sourceAddress: number,
  destinationMemory: Uint8Array,
  destinationAddress: number,
  addressesMap: TMappedMemoryAddresses,
): void {
  destinationMemory[destinationAddress++] = sourceMemory[sourceAddress++];
  for (let i = 0; i < 8; i++) {
    CopyRemappedAddress(sourceMemory, sourceAddress, destinationMemory, destinationAddress, addressesMap);
    sourceAddress += ADDRESS_BYTES_PER_ELEMENT;
    destinationAddress += ADDRESS_BYTES_PER_ELEMENT;
  }
}

/**
 * Returns true if resolved addresses are the same
 */
export function AreSameRemappedAddresses(
  memory1: Uint8Array,
  address1: number,
  memory2: Uint8Array,
  address2: number,
  memoriesMap: TMappedMemories
): boolean {
  const _address1: number = ReadAddress(memory1, address1);
  const _address2: number = ReadAddress(memory2, address2);
  let remappedAddress1: number | undefined;
  let remappedAddress2: number | undefined;

  if (_address1 !== NO_MATERIAL_ADDRESS) {
    if (memoriesMap.has(memory1)) {
      const subMap: TMappedMemoryAddresses = memoriesMap.get(memory1) as TMappedMemoryAddresses;
      if (subMap.has(_address1)) {
        remappedAddress1 = subMap.get(_address1) as number;
      }
    }
  }

  if (_address2 !== NO_MATERIAL_ADDRESS) {
    if (memoriesMap.has(memory2)) {
      const subMap: TMappedMemoryAddresses = memoriesMap.get(memory2) as TMappedMemoryAddresses;
      if (subMap.has(_address2)) {
        remappedAddress2 = subMap.get(_address2) as number;
      }
    }
  }

  if (remappedAddress1 === void 0) { // _address1 has not been remapped
    if (remappedAddress2 === void 0) { // _address2 has not been remapped
      if (_address1 === NO_MATERIAL_ADDRESS) { // _address1 has no material
        return (_address2 === NO_MATERIAL_ADDRESS); // returns true if _address2 has no material too
      } else if (_address2 === NO_MATERIAL_ADDRESS) { // _address1 is normal but _address2 has no material
        return false;
      } else if (memory1 === memory2) { // _address1 and _address2 are normal, ensures than both memory are the same
        return (_address1 === _address2); // returns true if both addresses are the same
      } else { // _address1 and _address2 are valid, but memories are different, so addresses can't compare
        return false;
      }
    } else if (remappedAddress2 === NO_MATERIAL_ADDRESS) { // _address2 has been remapped, and remappedAddress2 has no material
      return (_address1 === NO_MATERIAL_ADDRESS); // returns true if _address1 has no material too
    } else { // address2 has been remapped, and _address1 is a normal address => memories are different, so addresses can't compare
      return false;
    }
  } else if (remappedAddress1 === NO_MATERIAL_ADDRESS) { // _address1 has been remapped, and remappedAddress1 has no material
    if (remappedAddress2 === void 0) { // _address2 has not been remapped
      return (_address2 === NO_MATERIAL_ADDRESS);
    } else { // _address2 has been remapped
      return (remappedAddress2 === NO_MATERIAL_ADDRESS); // returns true if remappedAddress2 has no material too
    }
  } else { // _address1 has been remapped
    if (remappedAddress2 === void 0) { // _address2 has not been remapped => memories are different, so addresses can't compare
      return false;
    } else if (remappedAddress2 === NO_MATERIAL_ADDRESS) {
      return false;
    } else { // both addresses remapped
      return (remappedAddress1 === remappedAddress2);
    }
  }
}

/**
 * Returns true if both octrees are the same after their addresses are resolved
 */
export function AreSameRemappedVoxelOctrees(
  memory1: Uint8Array,
  address1: number,
  memory2: Uint8Array,
  address2: number,
  memoriesMap: TMappedMemories
): boolean {
  if (
    (memory1 === memory2)
    && (address1 === address2)
  ) {
    return true;
  } else {
    if (memory1[address1++] === memory2[address2++]) {
      for (let i = 0; i < 8; i++) {
        if (!AreSameRemappedAddresses(memory1, address1, memory2, address2, memoriesMap)) {
          return false;
        }
        address1 += ADDRESS_BYTES_PER_ELEMENT;
        address2 += ADDRESS_BYTES_PER_ELEMENT;
      }
      return true;
    } else {
      return false;
    }
  }
}
