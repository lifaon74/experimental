import { MemoryView, readAddress, writeAddress } from './memory-address';


export class Texture3D extends MemoryView {
  readonly sizeX: number;
  readonly sizeY: number;
  readonly sizeZ: number;

  constructor(
    memory: Uint8Array,
    texture3DAddress: number,
    sizeX: number,
    sizeY: number,
    sizeZ: number,
  ) {
    super(memory, texture3DAddress);
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
  }
}


/*----------------*/

export function Convert3DPositionToTexture3DMemoryAddressOffset(
  sizeX: number,
  sizeY: number,
  sizeZ: number,
  x: number,
  y: number,
  z: number,
): number {
  return x + (y * sizeX) + (z * sizeX * sizeY);
}

export function WriteTexture3DMaterialAddress(
  memory: Uint8Array,
  texture3DAddress: number,
  sizeX: number,
  sizeY: number,
  sizeZ: number,
  x: number,
  y: number,
  z: number,
  voxelMaterialAddress: number,
): void {
  writeAddress(memory, texture3DAddress + Convert3DPositionToTexture3DMemoryAddressOffset(sizeX, sizeY, sizeZ, x, y, z), voxelMaterialAddress);
}

export function ReadTexture3DMaterialAddress(
  memory: Uint8Array,
  texture3DAddress: number,
  sizeX: number,
  sizeY: number,
  sizeZ: number,
  x: number,
  y: number,
  z: number,
): number {
  return readAddress(memory, texture3DAddress + Convert3DPositionToTexture3DMemoryAddressOffset(sizeX, sizeY, sizeZ, x, y, z));
}


export function VoxelOctreeToTexture3D(
  voxelOctreeMemory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
) {

}




