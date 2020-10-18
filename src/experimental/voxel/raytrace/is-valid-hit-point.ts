import { vec3 } from "gl-matrix";



export function isValidHitPoint(
  point: vec3,
): boolean {
  return !Number.isNaN(point[0]);
}

/*---- TESTS ----*/

// export function isValidHitPoint1(
//   point: vec3,
// ): boolean {
//   return Number.isFinite(point[0])
//     && Number.isFinite(point[1])
//     && Number.isFinite(point[2]);
// }
