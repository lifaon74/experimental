import { vec3 } from 'gl-matrix';


/**
 * Returns the position of a ray hitting a cube (last surface to hit => leave the cube)
 * INFO: The ray must leave the cube to be valid
 * INFO: if the ray doesn't hit the cube, hitPosition[0] = NaN; @see isValidHitPoint
 */
export function nextHitCubeOut(
  rayPosition: vec3,
  rayVector: vec3,
  side: number,
  hitPosition: vec3,
): vec3 {
  let a: number, b: number, c: number;

  for (a = 0; a < 3; a++) {
    b = (a + 1) % 3;
    c = (a + 2) % 3;

    if (rayVector[a] !== 0) {
      if (rayVector[a] > 0) {
        if (rayPosition[a] >= side) { // point after exit surface
          break;
        } else {
          hitPosition[a] = side;
        }
      } else { // if (rayVector[a] < 0)
        if (rayPosition[a] <= 0) { // point after exit surface
          break;
        } else {
          hitPosition[a] = 0;
        }
      }

      hitPosition[b] = rayPosition[b] - (((rayPosition[a] - hitPosition[a]) * rayVector[b]) / rayVector[a]); // thales
      if (
        // TODO (rayVector[b] <= 0)  equality or not?
        ((hitPosition[b] > 0) || ((hitPosition[b] === 0) && (rayVector[b] < 0))) // hitPosition[b] inside or next step inside
        && ((hitPosition[b] < side) || ((hitPosition[b] === side) && (rayVector[b] >= 0)))
      ) {
        hitPosition[c] = rayPosition[c] - (((rayPosition[a] - hitPosition[a]) * rayVector[c]) / rayVector[a]);  // thales
        if (
          ((hitPosition[c] > 0) || ((hitPosition[c] === 0) && (rayVector[c] < 0))) // hitPosition[c] inside or next step inside
          && ((hitPosition[c] < side) || ((hitPosition[c] === side) && (rayVector[c] >= 0)))
        ) {
          return hitPosition;
        }
      }
    }
  }

  hitPosition[0] = Number.NaN;
  return hitPosition;
}

// export function nextHitCubeOut(
//   rayPosition: vec3,
//   rayVector: vec3,
//   side: number,
//   hitPosition: vec3,
// ): vec3 {
//   let a: number, b: number, c: number;
//
//   for (a = 0; a < 3; a++) {
//     b = (a + 1) % 3;
//     c = (a + 2) % 3;
//
//     if (rayVector[a] !== 0) {
//       if (rayVector[a] > 0) {
//         if (rayPosition[a] >= side) { // point after exit surface
//           break;
//         } else {
//           hitPosition[a] = side;
//         }
//       } else { // if (rayVector[a] < 0)
//         if (rayPosition[a] <= 0) { // point after exit surface
//           break;
//         } else {
//           hitPosition[a] = 0;
//         }
//       }
//
//       hitPosition[b] = rayPosition[b] - (((rayPosition[a] - hitPosition[a]) * rayVector[b]) / rayVector[a]); // thales
//       if (
//         ((hitPosition[b] > 0) || ((hitPosition[b] === 0) && (rayVector[b] >= 0))) // hitPosition[b] inside or next step inside
//         && ((hitPosition[b] < side) || ((hitPosition[b] === side) && (rayVector[b] < 0)))
//       ) {
//         hitPosition[c] = rayPosition[c] - (((rayPosition[a] - hitPosition[a]) * rayVector[c]) / rayVector[a]);  // thales
//         if (
//           ((hitPosition[c] > 0) || ((hitPosition[c] === 0) && (rayVector[c] >= 0))) // hitPosition[c] inside or next step inside
//           && ((hitPosition[c] < side) || ((hitPosition[c] === side) && (rayVector[c] < 0)))
//         ) {
//           return hitPosition;
//         }
//       }
//     }
//   }
//
//   hitPosition[0] = Number.NaN;
//   return hitPosition;
// }
