/***
 * input === 0 ?
 */
export function DigitsNull(input: Uint8Array): boolean {
  for (let i: number = 0, l: number = input.length; i < l; i++) {
    if (input[i] !== 0) {
      return false;
    }
  }
  return true;
}
