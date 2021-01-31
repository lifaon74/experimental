import { vec3 } from 'gl-matrix';

export function hitCubeIn(
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

      hitPosition[b] = rayPosition[b] + (((hitPosition[a] - rayPosition[a]) * rayVector[b]) / rayVector[a]); // thales
      if ((0 <= hitPosition[b]) && (hitPosition[b] <= side)) {
        hitPosition[c] = rayPosition[c] + (((hitPosition[a] - rayPosition[a]) * rayVector[c]) / rayVector[a]);  // thales
        if (
          (0 <= hitPosition[c]) && (hitPosition[c] <= side)
        ) {
          return hitPosition;
        }
      }
    }
  }

  hitPosition[0] = Number.NaN;
  return hitPosition;
}


