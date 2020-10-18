

export function hitCubeOut(
  rayPosition: Float32Array,
  rayVector: Float32Array,
  cubePosition: Float32Array,
  side: number,
  hitPosition: Float32Array,
): Float32Array {
  let a: number, b: number, c: number;
  let rva: number, rpa: number, r: number;

  for (a = 0; a < 3; a++) {
    b = (a + 1) % 3;
    c = (a + 2) % 3;
    rva = rayVector[a];
    rpa = rayPosition[a];

    if (rva !== 0) {
      if (rva > 0) {
        if (rpa > (cubePosition[a] + side)) { // point over
          break;
        } else {
          hitPosition[a] = cubePosition[a] + side;
        }
      } else if (rva < 0) {
        if (rpa < cubePosition[a]) { // point under
          break;
        } else {
          hitPosition[a] = cubePosition[a];
        }
      }

      r = (rpa - hitPosition[a]) / rva;

      hitPosition[b] = rayPosition[b] - r * rayVector[b];
      if ((cubePosition[b] <= hitPosition[b]) && (hitPosition[b] <= (cubePosition[b] + side))) {
        hitPosition[c] = rayPosition[c] - r * rayVector[c];
        if ((cubePosition[c] <= hitPosition[c]) && (hitPosition[c] <= (cubePosition[c] + side))) {
          return hitPosition;
        }
      }
    }
  }

  hitPosition[0] = Number.NaN;
  return hitPosition;
}
