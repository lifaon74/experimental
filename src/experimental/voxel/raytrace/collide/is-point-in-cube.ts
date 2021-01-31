import { vec3 } from 'gl-matrix';

export function isPointInCube(
  point: vec3,
  side: number,
): boolean {
  return (
    (0 <= point[0]) && (point[0] < side)
    && (0 <= point[1]) && (point[1] < side)
    && (0 <= point[2]) && (point[2] < side)
  );
}


