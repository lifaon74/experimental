import { vec3 } from 'gl-matrix';


export function hitCubeOut(
  rayPosition: vec3,
  rayVector: vec3,
  cubePosition: vec3,
  side: number,
  hitPosition: vec3,
): vec3 {
  let a: number, b: number, c: number;

  for (a = 0; a < 3; a++) {
    b = (a + 1) % 3;
    c = (a + 2) % 3;

    if (rayVector[a] !== 0) {
      if (rayVector[a] > 0) {
        if (rayPosition[a] > (cubePosition[a] + side)) { // point after exit surface
          break;
        } else {
          hitPosition[a] = cubePosition[a] + side;
        }
      } else { // if (rayVector[a] < 0)
        if (rayPosition[a] < cubePosition[a]) { // point after exit surface
          break;
        } else {
          hitPosition[a] = cubePosition[a];
        }
      }

      hitPosition[b] = rayPosition[b] + (((hitPosition[a] - rayPosition[a]) * rayVector[b]) / rayVector[a]); // thales
      if ((cubePosition[b] <= hitPosition[b]) && (hitPosition[b] <= (side + cubePosition[b]))) {
        hitPosition[c] = rayPosition[c] + (((hitPosition[a] - rayPosition[a]) * rayVector[c]) / rayVector[a]);  // thales
        if (
          (cubePosition[c] <= hitPosition[c]) && (hitPosition[c] <= (side + cubePosition[c]))
        ) {
          return hitPosition;
        }
      }
    }
  }

  hitPosition[0] = Number.NaN;
  return hitPosition;
}

