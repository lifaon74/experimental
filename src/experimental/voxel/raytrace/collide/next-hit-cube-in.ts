import { vec3 } from 'gl-matrix';


/**
 * Returns the position of a ray hitting a cube (first surface to hit => enter the cube)
 * INFO: The ray must enter the cube to be valid
 * INFO: if the ray doesn't hit the cube, hitPosition[0] = NaN; @see isValidHitPoint
 */
export function nextHitCubeIn(
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
          hitPosition[a] = (rayPosition[a] > 0)
            ? rayPosition[a] // in the cube
            : 0;
        }
      } else { // if (rayVector[a] < 0)
        if (rayPosition[a] <= 0) { // point after exit surface
          break;
        } else {
          hitPosition[a] = (rayPosition[a] < side)
            ? rayPosition[a] // in the cube
            : side;
        }
      }

      hitPosition[b] = rayPosition[b] - (((rayPosition[a] - hitPosition[a]) * rayVector[b]) / rayVector[a]); // thales
      if (
        ((hitPosition[b] > 0) || ((hitPosition[b] === 0) && (rayVector[b] >= 0))) // hitPosition[b] inside or next step inside
        && ((hitPosition[b] < side) || ((hitPosition[b] === side) && (rayVector[b] < 0)))
      ) {
        hitPosition[c] = rayPosition[c] - (((rayPosition[a] - hitPosition[a]) * rayVector[c]) / rayVector[a]);  // thales
        if (
          ((hitPosition[c] > 0) || ((hitPosition[c] === 0) && (rayVector[c] >= 0))) // hitPosition[c] inside or next step inside
          && ((hitPosition[c] < side) || ((hitPosition[c] === side) && (rayVector[c] < 0)))
        ) {
          return hitPosition;
        }
      }
    }
  }

  hitPosition[0] = Number.NaN;
  return hitPosition;
}


/*---- TESTS ----*/

// export function hitCubeIn1(
//   out: vec3,
//   origin: vec3,
//   vector: vec3,
//   side: number,
// ): vec3 {
//   // FOR DEBUG
//   // out[0] = Number.NaN;
//   // out[1] = Number.NaN;
//   // out[2] = Number.NaN;
//
//   let y: number = 1;
//   let z: number = 2;
//
//   for (let x = 0; x < 3; x++) {
//     // XY plane, static Z
//     if ((vector[z] > 0) && (origin[z] <= 0)) {
//       // @ts-ignore
//       [out[x], out[y]] = hitSquareXYSurface([origin[x], origin[y], origin[z]], [vector[x], vector[y], vector[z]], side);
//       out[z] = 0;
//     } else if ((vector[z] < 0) && (origin[z] >= side)) {
//       // @ts-ignore
//       [out[x], out[y]] = hitSquareXYSurface([origin[x], origin[y], origin[z] - side], [vector[x], vector[y], vector[z]], side);
//       out[z] = side;
//     } else {
//       out[x] = Number.NaN;
//       out[y] = Number.NaN;
//       out[z] = Number.NaN;
//     }
//
//     if (isValidHitPoint1(out)) {
//       break;
//     }
//     y = (y + 1) % 3;
//     z = (z + 1) % 3;
//   }
//
//   return out;
// }
//
//
// export function hitSquareXYSurface(
//   origin: vec3,
//   vector: vec3,
//   side: number
// ): vec2 {
//   return [
//     hitXAxisSegment([origin[0], origin[2]], [vector[0], vector[2]], side),
//     hitXAxisSegment([origin[1], origin[2]], [vector[1], vector[2]], side)
//   ];
// }
//
// export function hitXAxisSegment(
//   origin: vec2,
//   vector: vec2,
//   length: number,
// ): number {
//   const x: number = intersectXAxis(origin, vector);
//   return ((0 <= x) && (x < length))
//     ? x
//     : Number.NaN;
// }

// /**
//  * Math: Thales => (vectorX / vectorY) = (vectorOriginX / vectorOriginY)
//  */
// export function intersectXAxis(
//   origin: vec2,
//   vector: vec2,
// ): number {
//   return (((-origin[1]) * vector[0]) / vector[1]) + origin[0];
// }


