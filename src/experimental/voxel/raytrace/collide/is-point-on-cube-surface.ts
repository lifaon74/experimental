import { vec3 } from 'gl-matrix';

export function isPointOnCubeSurface(
  point: vec3,
  side: number,
): boolean {
  return (
    ((point[0] === 0) || (point[0] === side))
    || ((point[1] === 0) || (point[1] === side))
    || ((point[2] === 0) || (point[2] === side))
  );
}


/**
 * Returns true if a point is on the surface of a cube or outside
 */
export function isPointOnCubeSurfaceOrOut(
  point: vec3,
  side: number,
): boolean {
  return (
    ((point[0] <= 0) || (point[0] >= side))
    || ((point[1] <= 0) || (point[1] >= side))
    || ((point[2] <= 0) || (point[2] >= side))
  );
}

