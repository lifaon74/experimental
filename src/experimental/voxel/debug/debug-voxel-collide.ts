import { vec2, vec3 } from 'gl-matrix';
import { assert } from '../../assert/assert';
import { isNextPointInCube } from '../raytrace/collide/is-next-point-in-cube';
import { arrayEquals } from '../../assert/array-equals';
import { hitCubeIn } from '../raytrace/collide/hit-cube-in';
import { isValidHitPoint } from '../raytrace/collide/is-valid-hit-point';
import { hitCubeOut } from '../raytrace/collide/hit-cube-out';

function runHitCubeSpeed() {
  const getPosition = () => {
    // return (Math.random() < 0.5) ? -Math.random() : 1 + Math.random();
    return Math.random() + ((Math.random() < 0.5) ? -1 : +1);
  };
  const randomVector = () => {
    origin[0] = getPosition();
    origin[1] = getPosition();
    origin[2] = getPosition();
    vector[0] = Math.random();
    vector[1] = Math.random();
    vector[2] = Math.random();
  };
  const out3: vec2 = new Float32Array(3);
  const origin: vec3 = new Float32Array(3);
  const vector: vec3 = new Float32Array(3);
  let j = 0;
  console.time('speed');
  for (let i = 0; i < 1e7; i++) {
    randomVector(); // 2662.77783203125
    hitCubeIn(origin, vector, 1, out3); // 2807 => 150 own
    j += isValidHitPoint(out3) ? 1 : 0;
  }
  console.timeEnd('speed');
  console.log('j', j);
}


async function testIsPointInCube() {

  const origin: vec3 = vec3.create();
  const vector: vec3 = vec3.create();
  let a: number, b: number, c: number;

  // const xor = (a: boolean, b: boolean) => a ? !b : b;
  const xor = (a: boolean, b: boolean) => a !== b;

  for (a = 0; a < 3; a++) {
    b = (a + 1) % 3;
    c = (a + 2) % 3;
    origin[b] = 0.5;
    origin[c] = 0.5;

    vector[b] = 0;
    vector[c] = 0;

    for (let i = -1; i <= 1; i += 2) {
      vector[a] = i;

      origin[a] = 0;
      await assert(() => xor(isNextPointInCube(origin, vector, 1), i < 0));  // on x = 0 edge ((i < 0) ? excluded : included)

      origin[a] = 0.5;
      await assert(() => isNextPointInCube(origin, vector, 1));  // on x = 0.5 (center)

      origin[a] = 1;
      await assert(() => xor(isNextPointInCube(origin, vector, 1), i > 0));  // on x = 1 edge (i > 0) ? excluded : included
    }
  }
}

async function testHitCubeIn() {
  const hitPoint: vec3 = vec3.create();
  console.log(hitCubeIn([0, 0.5, -1], [0, 0, 1], 1, hitPoint));
  // console.log(hitCubeIn([1, 0.5, -1], [0, 0, 1], 1, hitPoint));

  // console.log(hitCubeIn([0, 0.5, 2], [0, 0, -1], 1, hitPoint));
  // console.log(hitCubeIn([1, 0.5, 2], [0, 0, -1], 1, hitPoint));

  // console.log(hitCubeIn([0.5, 0.5, -1], [0, 0, 1], 1, hitPoint));
  // console.log(hitCubeIn([0.5, 0.5, 2], [0, 0, -1], 1, hitPoint));

  // console.log(hitCubeIn([-1, -1, -1], [1, 1, 1], 1, hitPoint));
  // console.log(nextHitCubeIn([2, 2, 2], [-1, -1, -1], 1, hitPoint));

  // XY face (front)
  await assert(() => arrayEquals(hitCubeIn([0.5, 0.5, -1] /* on center */, [0, 0, 1], 1, hitPoint), [0.5, 0.5, 0])); // on center
  await assert(() => arrayEquals(hitCubeIn([0, 0.5, -1] /* on x = 0 edge */, [0, 0, 1], 1, hitPoint), [0, 0.5, 0])); // on included edge
  await assert(() => !isValidHitPoint(hitCubeIn([1, 0.5, -1] /* on x = 1 edge */, [0, 0, 1], 1, hitPoint))); // on excluded edge

  // XY face (back)
  await assert(() => arrayEquals(hitCubeIn([0.5, 0.5, 2] /* on center */, [0, 0, -1], 1, hitPoint), [0.5, 0.5, 1])); // on center
  await assert(() => arrayEquals(hitCubeIn([0, 0.5, 2] /* on x = 0 edge */, [0, 0, -1], 1, hitPoint), [0, 0.5, 1])); // on included edge
  await assert(() => !isValidHitPoint(hitCubeIn([1, 0.5, 2] /* on x = 1 edge */, [0, 0, -1], 1, hitPoint))); // on excluded edge


  // XZ face (front)
  await assert(() => arrayEquals(hitCubeIn([0.5, -1, 0.5], [0, 1, 0], 1, hitPoint), [0.5, 0, 0.5])); // on center

  // critical edges
  await assert(() => arrayEquals(hitCubeIn([-1, -1, -1], [1, 1, 1], 1, hitPoint), [0, 0, 0]));
  await assert(() => arrayEquals(hitCubeIn([2, 2, 2], [-1, -1, -1], 1, hitPoint), [1, 1, 1]));
}

async function testHitCubeOut() {
  const hitPoint: vec3 = vec3.create();

  // console.log(hitCubeOut([0, 0.5, -1], [0, 0, 1], 1, hitPoint));
  // console.log(nextHitCubeOut([0, 0.5, 2], [0, 0, -1], 1, hitPoint));
  // console.log(nextHitCubeOut([-1, -1, -1], [1, 1, 1], 1, hitPoint));
  // console.log(nextHitCubeOut([2, 2, 2], [-1, -1, -1], 1, hitPoint));

  // // XY face (front) -> out on back
  // await assert(() => arrayEquals(nextHitCubeOut([0.5, 0.5, -1] /* on center */, [0, 0, 1], 1, hitPoint), [0.5, 0.5, 1])); // on center
  // await assert(() => arrayEquals(nextHitCubeOut([0, 0.5, -1] /* on x = 0 edge */, [0, 0, 1], 1, hitPoint), [0, 0.5, 1])); // on included edge
  // await assert(() => !isValidHitPoint(nextHitCubeOut([1, 0.5, -1] /* on x = 1 edge */, [0, 0, 1], 1, hitPoint))); // on excluded edge
  //
  // // XY face (back) -> out on front
  // await assert(() => arrayEquals(nextHitCubeOut([0.5, 0.5, 2] /* on center */, [0, 0, -1], 1, hitPoint), [0.5, 0.5, 0])); // on center
  // await assert(() => arrayEquals(nextHitCubeOut([0, 0.5, 2] /* on x = 0 edge */, [0, 0, -1], 1, hitPoint), [0, 0.5, 0])); // on included edge
  // await assert(() => !isValidHitPoint(nextHitCubeOut([1, 0.5, 2] /* on x = 1 edge */, [0, 0, -1], 1, hitPoint))); // on excluded edge
  //
  // // critical edges
  // await assert(() => arrayEquals(nextHitCubeOut([-1, -1, -1], [1, 1, 1], 1, hitPoint), [1, 1, 1]));
  // await assert(() => arrayEquals(nextHitCubeOut([2, 2, 2], [-1, -1, -1], 1, hitPoint), [0, 0, 0]));

}


async function debugHitCube() {
  const hitPoint: vec3 = vec3.create();
  console.log(hitCubeIn([3.5078125, 4.4921875, -3], [-0.4921875, 0.4921875, 1], 8, hitPoint)); // 2, 6, 0.0634920671582222

}

/*--------------*/

export async function debugVoxelCollide() {
  // await testIsPointInCube();
  await testHitCubeIn();
  await testHitCubeOut();
  await debugHitCube();

  // testHitCubeSpeed();
}


