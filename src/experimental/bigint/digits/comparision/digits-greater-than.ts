import { DigitsCompare } from './digits-compare';

/**
 * a > b ?
 */
export function DigitsGreaterThan(a: Uint8Array, b: Uint8Array): boolean {
  return DigitsCompare(a, b) === 1;
}
