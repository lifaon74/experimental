import { vec3 } from 'gl-matrix';

/**
 * Returns true if a point is inside a cube
 * INFO: The ray must enter the cube to return true
 */
export function isNextPointInCube(
  point: vec3,
  vector: vec3,
  side: number,
): boolean {
  return (
    (vector[0] >= 0)
      ? ((0 <= point[0]) && (point[0] < side))
      : ((0 < point[0]) && (point[0] <= side))
  ) && (
    (vector[1] >= 0)
      ? ((0 <= point[1]) && (point[1] < side))
      : ((0 < point[1]) && (point[1] <= side))
  ) && (
    (vector[2] >= 0)
      ? ((0 <= point[2]) && (point[2] < side))
      : ((0 < point[2]) && (point[2] <= side))
  );
}

