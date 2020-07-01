/**
 * Returns a buffer filled with input.
 */
export function CopyBufferContent(buffer: Uint8Array, input: Uint8Array): Uint8Array {
  if (buffer === input) {
    return buffer;
  } else {
    buffer.set(input);
    return buffer.subarray(0, input.length);
  }
}

