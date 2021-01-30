import { IAllocFunction } from './memory-address';

export class AbstractMemory {
  public readonly buffer: ArrayBuffer;

  private writeIndex: number;

  constructor(
    sizeOrBuffer: number /* size */ | ArrayBuffer /* buffer */,
  ) {
    this.buffer = (typeof sizeOrBuffer === 'number')
      ? new ArrayBuffer(sizeOrBuffer)
      : sizeOrBuffer;
    this.writeIndex = 0;
  }

  get bytesUsed(): number {
    return this.writeIndex;
  }

  alloc(size: number): number {
    const index: number = this.writeIndex;
    this.writeIndex += size;
    if (this.writeIndex > this.buffer.byteLength) {
      throw new Error(`Alloc failed: not enough memory`);
    }
    return index;
  }

  reset(): void {
    this.writeIndex = 0;
  }

  log(message: string): void {
    console.log(message, this.toSmallestUint8Array());
  }

  toUint8Array(
    byteOffset: number = 0,
    byteLength: number = this.buffer.byteLength,
  ): Uint8Array {
    return new Uint8Array(this.buffer, byteOffset, byteLength);
  }

  toSmallestUint8Array(
    byteOffset: number = 0
  ): Uint8Array {
    return this.toUint8Array(byteOffset, this.writeIndex);
  }

  toAllocFunction(): IAllocFunction {
    return (size: number) => {
      return this.alloc(size);
    };
  }
}

export function allocBiggestBuffer(): ArrayBuffer {
  let min: number = 0;
  let max: number = 2 ** 48;
  let buffer: ArrayBuffer;

  while ((max - min) > 1) {
    const mean = Math.floor((max + min) / 2);
    // console.log('mean', mean);
    try {
      buffer = new ArrayBuffer(mean);
      min = mean;
    } catch {
      max = mean;
    }
  }

  // @ts-ignore
  return buffer;
}

export function logMemory(
  message: string,
  memory: Uint8Array,
  alloc: IAllocFunction
) {
  console.log(message, memory.slice(0, alloc(0)));
}

