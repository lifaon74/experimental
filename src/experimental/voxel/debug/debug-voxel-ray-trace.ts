import {
  convertVoxelOctreeSideToDepth, getMaximumAmountOfMemoryUsedByAVoxelOctreeFromDepth, VoxelOctree
} from '../octree';
import { AbstractMemory } from '../abstract-memory';
import {
  createCanvasContext,
  displayVoxelOctreeSlice, drawAxisForOctree, drawImageData, drawRainbowCubeForOctree, drawRainbowInnerCubeForOctree,
  drawRainbowSphereForOctree,
  drawUniformInnerRedCubeForOctree,
  drawUniformRedSphereForOctree,
  ISliceVoxelOctreeCallback, sliceOctreeUsingReadVoxel,
  sliceVoxelOctreeUsingRaytrace
} from '../draw/draw';
import { mat4, vec3, vec4 } from 'gl-matrix';
import {
  IObject3DVoxelOctree, IVoxelOctreeForRayTrace, voxelOctreeObjectRaytrace, voxelOctreeRaytrace, voxelOctreeRaytraceMany
} from '../raytrace/raytrace';
import { NO_MATERIAL, VOXEL_MATERIAL_BYTES_PER_ELEMENT } from '../material';
import { mat4_display } from '../matrix-helpers';
import { formatSize } from '../misc/format-size';
import { IAllocFunction } from '../memory-address';

const createEmptyVoxelOctree = (side: number) => {
  const voxelDepth: number = convertVoxelOctreeSideToDepth(side);
  const voxelMaxMemorySize: number = getMaximumAmountOfMemoryUsedByAVoxelOctreeFromDepth(voxelDepth);
  const MEMORY = new AbstractMemory(voxelMaxMemorySize);
  const MEMORY_VIEW = MEMORY.toUint8Array();
  const alloc = MEMORY.toAllocFunction();
  const voxel = VoxelOctree.create(MEMORY_VIEW, alloc, voxelDepth);

  return {
    voxel,
    alloc,
  };
};

const logSize = (alloc: IAllocFunction) => {
  console.log('size', formatSize(alloc(0)));
};

const createRainbowCubeVoxelOctree = (side: number) => {
  const { voxel, alloc } = createEmptyVoxelOctree(side);
  drawRainbowCubeForOctree(voxel.memory, voxel.address, voxel.depth, alloc);
  logSize(alloc);
  return voxel;
};

const createUniformRedSphereVoxelOctree = (side: number) => {
  const { voxel, alloc } = createEmptyVoxelOctree(side);
  drawUniformRedSphereForOctree(voxel.memory, voxel.address, voxel.depth, alloc);
  logSize(alloc);
  return voxel;
};

const createUniformInnerRedCubeVoxelOctree = (side: number) => {
  const { voxel, alloc } = createEmptyVoxelOctree(side);
  drawUniformInnerRedCubeForOctree(voxel.memory, voxel.address, voxel.depth, alloc);
  logSize(alloc);
  return voxel;
};

const creatRainbowInnerCubeVoxelOctree = (side: number) => {
  const { voxel, alloc } = createEmptyVoxelOctree(side);
  drawRainbowInnerCubeForOctree(voxel.memory, voxel.address, voxel.depth, alloc);
  logSize(alloc);
  return voxel;
};

const createRainbowSphereVoxelOctree = (side: number) => {
  const { voxel, alloc } = createEmptyVoxelOctree(side);
  drawRainbowSphereForOctree(voxel.memory, voxel.address, voxel.depth, alloc);
  logSize(alloc);
  return voxel;
};

const createAxisVoxelOctree = (side: number, lineWidth: number = Math.max(1, side / 16)) => {
  const { voxel, alloc } = createEmptyVoxelOctree(side);
  drawAxisForOctree(voxel.memory, voxel.address, voxel.depth, alloc, lineWidth);
  logSize(alloc);
  return voxel;
};



/*-----------------------*/

async function debugVoxelRayTrace1() {

  // const voxelOctree = createRainbowCubeVoxelOctree(8);
  // const voxelOctree = createUniformRedSphereVoxelOctree(8);
  // const voxelOctree = createRainbowSphereVoxelOctree(8);
  // const voxelOctree = createAxisVoxelOctree(8);
  // const voxelOctree = createUniformInnerRedCubeVoxelOctree(8);
  const voxelOctree = creatRainbowInnerCubeVoxelOctree(8);
  // displayVoxelOctreeSlice(voxelOctree, sliceOctreeUsingReadVoxel(4));

  /*--*/

  const rayPosition: vec3 = vec3.create();
  const rayVector: vec3 = vec3.create();
  const hitPosition: vec3 = vec3.create();

  // rayPosition[0] = 0.5;
  // rayPosition[1] = 0.5;
  // rayPosition[2] = -1;

  // rayPosition[0] = 2.5;
  // rayPosition[1] = 2.5;
  // rayPosition[2] = -1;

  // rayPosition[0] = 3.5;
  // rayPosition[1] = 0.5;
  // rayPosition[2] = -1;

  rayPosition[0] = 2.5;
  rayPosition[1] = 2.5;
  rayPosition[2] = 10;

  rayVector[0] = 0;
  rayVector[1] = 0;
  rayVector[2] = -1;

  const voxelMaterialAddress: number = voxelOctreeRaytrace(voxelOctree.memory, voxelOctree.address, voxelOctree.depth, rayPosition, rayVector, hitPosition);
  const color: Uint8Array = voxelOctree.memory.slice(voxelMaterialAddress, voxelMaterialAddress + VOXEL_MATERIAL_BYTES_PER_ELEMENT);
  console.log(voxelMaterialAddress, color, hitPosition);

  // displayVoxelOctreeSlice(voxelOctree, sliceVoxelOctreeUsingRaytrace());
  console.time('raycast');
  // displayVoxelOctreeSlice(voxelOctree, sliceVoxelOctreeUsingRaytrace(vec3.fromValues(0, 0, -1), vec3.fromValues(0, 0, 1)));
  displayVoxelOctreeSlice(voxelOctree, sliceVoxelOctreeUsingRaytrace(vec3.fromValues(0, 0, voxelOctree.side + 100), vec3.fromValues(0, 0, -1)));
  console.timeEnd('raycast');
}


/*-----------------------*/

const createSymmetricPerspectiveCamera = (
  out: mat4 = mat4.create(),
  width: number = window.innerWidth,
  height: number = window.innerHeight,
  depth: number = Math.max(width, height) / 2,
  near: number = depth,
  far: number = depth * 1000, // or depth * (3 / 2),
) => {
  return mat4.perspective(out, Math.atan2(height / 2, depth) * 2, width / height, near, far);
};

const createSymmetricOrthographicCamera = (
  out: mat4 = mat4.create(),
  width: number = window.innerWidth,
  height: number = window.innerHeight,
  depth: number = Math.max(width, height),
) => {
  const x: number = width / 2;
  const y: number = height / 2;
  return mat4.ortho(out, -x, x, -y, y, 0, depth);
};

const getMVPMatrix = (mpv: mat4, model: mat4, view: mat4, projection: mat4): mat4 => {
  return mat4.mul(mpv, mat4.mul(mpv, projection, view), model);
};


async function debugMatrix() {

  // equations: https://www.web-formulas.com/Math_Formulas/Linear_Algebra_Properties_of_Inverse_Matrices.aspx
  // invert(A * B) =  invert(B) * invert(A)
  // If A and B are matrices with AB=I then A and B are inverses of each other

  // // orthographic
  // // a projection matrix flips z axis
  // console.log(vec4.transformMat4(vec4.create(), [0, 0, 0, 0], mat4.ortho(mat4.create(), -1, 1, -1, 1, -1, 1))); // [0, 0, 0, 0]
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, 0.3, 0], mat4.ortho(mat4.create(), -1, 1, -1, 1, -1, 1))); // [0.1, 0.2, -0.3, 0]
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, 0.3, 1], mat4.ortho(mat4.create(), -1, 1, -1, 1, -1, 1))); // [0.1, 0.2, -0.3, 1]
  // // a projection matrix scales
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, 0.3, 0], mat4.ortho(mat4.create(), -2, 2, -2, 2, -2, 2))); // [0.05, 0.1, -0.15, 0]
  // // a projection matrix translates
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, 0.3, 0], mat4.ortho(mat4.create(), -1, 1, -1, 1, 0, 2))); // [0.1, 0.2, -0.3, 0]

  // // perspective
  // // x and y seems constant
  // console.log(vec4.transformMat4(vec4.create(), [0, 0, 0, 0], mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, Number.POSITIVE_INFINITY))); // [0, 0, 0, 0]
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, 0.3, 0], mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, Number.POSITIVE_INFINITY))); // [0.1, 0.2, -0.3, -0.3]
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, 0.3, 1], mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, Number.POSITIVE_INFINITY))); // [0.1, 0.2, -2.3, -0.3]
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, 10, 0], mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, Number.POSITIVE_INFINITY))); // [0.1, 0.2, -10, -10]
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, -10, 0], mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, Number.POSITIVE_INFINITY))); // [0.1, 0.2, 10, 10]
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, -10, 1], mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, Number.POSITIVE_INFINITY))); // [0.1, 0.2, 8, 10]
  // console.log(vec4.transformMat4(vec4.create(), [0, 0, -10, 1], mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, Number.POSITIVE_INFINITY))); // [0, 0, 8, 10]
  // // far not infinite
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, -10, 1], mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, 10))); // [0.1, 0.2, 10, 10]
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, -10, 0], mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, 10))); // [0.1, 0.2, 12.2, 10]
  // console.log(vec4.transformMat4(vec4.create(), [0.1, 0.2, -1.5, 1], mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, 2))); // [0.1, 0.2, 0.5, 1.5]

  // from clipping space to projection
  console.log(vec4.transformMat4(vec4.create(), [0, 0, -1, 0], mat4.invert(mat4.create(), mat4.ortho(mat4.create(), -2, 2, -2, 2, -2, 2)))); // [0, 0, 2, 0]
  console.log(vec4.transformMat4(vec4.create(), [0, 0, -1, 1], mat4.invert(mat4.create(), mat4.ortho(mat4.create(), -2, 2, -2, 2, -2, 2)))); // [0, 0, 2, 1]
}


interface IRefreshControlFunction {
  (
    out: mat4,
    view: mat4,
    translationSpeed?: number,
    rotationSpeed?: number,
  ): void;
}

function startCameraControl(): IRefreshControlFunction {
  let movementX: number = 0;
  let movementY: number = 0;
  const keyPressed: Set<string> = new Set<string>();

  // document.addEventListener('pointerlockchange', (event: MouseEvent) => {
  //   movementX += event.movementX;
  //   movementY += event.movementY;
  // });


  window.addEventListener('click', () => {
    if (document.pointerLockElement === null) {
      document.body.requestPointerLock();
    }
  });

  window.addEventListener('mousemove', (event: MouseEvent) => {
    movementX += event.movementX;
    movementY += event.movementY;
  });

  window.addEventListener('keydown', (event: KeyboardEvent) => {
    // console.log(event.code);
    keyPressed.add(event.code);
  });

  window.addEventListener('keyup', (event: KeyboardEvent) => {
    keyPressed.delete(event.code);
  });

  // const VEC3: vec3 = vec3.create();
  const transformMatrix: mat4 = mat4.create();

  return (
    out: mat4,
    view: mat4,
    translationSpeed: number = 1,
    rotationSpeed: number = 0.01,
  ): void => {
    mat4.identity(transformMatrix);
    if (keyPressed.has('KeyW')) {
      mat4.translate(transformMatrix, transformMatrix, [0, 0, translationSpeed]);
    }
    if (keyPressed.has('KeyS')) {
      mat4.translate(transformMatrix, transformMatrix, [0, 0, -translationSpeed]);
    }

    if (keyPressed.has('KeyA')) {
      mat4.translate(transformMatrix, transformMatrix, [translationSpeed, 0, 0]);
    }
    if (keyPressed.has('KeyD')) {
      mat4.translate(transformMatrix, transformMatrix, [-translationSpeed, 0, 0]);
    }

    if (document.pointerLockElement !== null) {
      mat4.rotateX(transformMatrix, transformMatrix, movementY * rotationSpeed);
      mat4.rotateY(transformMatrix, transformMatrix, movementX * rotationSpeed);
    }

    // mat4.mul(out, view, transformMatrix);
    mat4.mul(out, transformMatrix, view);
    movementX = 0;
    movementY = 0;
  };
}

function debugCanvasCoordinates(
  ratio: number = 1,
  canvas: HTMLCanvasElement = document.body.querySelector('canvas') as HTMLCanvasElement,
): void {
  canvas.addEventListener('click', (event: MouseEvent) => {
    const rect: DOMRect = canvas.getBoundingClientRect();
    console.log((event.clientX - rect.x) * ratio, (event.clientY - rect.y) * ratio);
  });
}

async function debugVoxelRayTrace2() {
  // await debugMatrix();
  const windowSize: number = 128;
  const side: number = 8;
  const side2: number = side / 2;

  // const projection = mat4.ortho(mat4.create(), -side2, side2, -side2, side2, -side2, side2);

  // const projection = mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, Number.POSITIVE_INFINITY); // perspective camera
  // const projection = mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, 1000); // perspective camera
  const projection = mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, 2); // far is not important (now) for raytracing

  // const view = mat4.lookAt(mat4.create(), [0.5, 0.5, -1], [0.5, 0.5, 0], [0, 1, 0]);

  const view = mat4.lookAt(mat4.create(), [0, 0, -side], [0, 0, 0], [0, 1, 0]); // camera is at [0, 0, -side], and look in direction [0, 0, 0] (up is Y axis)
  // const view = mat4.lookAt(mat4.create(), [0, 0, 0], [0, 0, 1], [0, 1, 0]); // camera is at [0, 0, 0], and look in direction [0, 0, 1] (up is Y axis)
  // const view = mat4.lookAt(mat4.create(), [0, 0, -1], [0, 0, 0], [0, 1, 0]); // camera is at [0, 0, -1], and look in direction [0, 0, 1] (up is Y axis)
  const model = mat4.fromTranslation(mat4.create(), [-side2, -side2, -side2]); // center the model
  const mvp = mat4.create();
  mat4.mul(mvp, mat4.mul(mvp, projection, view), model);
  const mvpi = mat4.invert(mat4.create(), mvp);

  // mat4_display('projection', projection);
  // mat4_display('view', view);
  // mat4_display('model', model);
  // mat4_display('mvp', mvp);
  // mat4_display('mvpi', mvpi);

  // const pointAInClippingSpace: vec3 = vec3.fromValues(0, 0, -1);
  // const pointBInClippingSpace: vec3 = vec3.fromValues(0, 0, 1);
  // const pointAInModelSpace: vec3 = vec3.transformMat4(vec3.create(), pointAInClippingSpace, mvpi);
  // const pointBInModelSpace: vec3 = vec3.transformMat4(vec3.create(), pointBInClippingSpace, mvpi);
  // console.log(pointAInModelSpace, pointBInModelSpace);


  /*--*/

  function draw() {
    // const voxelOctree = createRainbowCubeVoxelOctree(side);
    const voxelOctree = createRainbowSphereVoxelOctree(side);
    // const voxelOctree = createAxisVoxelOctree(side, side / 16);
    // const voxelOctree = createUniformInnerRedCubeVoxelOctree(side);
    // const voxelOctree = creatRainbowInnerCubeVoxelOctree(side);

    function render(imageData: ImageData): ImageData {
      const pointAInClippingSpace: vec3 = vec3.fromValues(0, 0, -1);
      const pointBInClippingSpace: vec3 = vec3.fromValues(0, 0, 1);
      const pointAInModelSpace: vec3 = vec3.create();
      const pointBInModelSpace: vec3 = vec3.create();
      const rayVector: vec3 = vec3.create();
      const hitPosition: vec3 = vec3.create();

      const width: number = imageData.width;
      const widthM1: number = width - 1;
      const height: number = imageData.height;
      const heightM1: number = height - 1;

      const drawDebug = (x: number, y: number) => {
        console.log('draw at', x, y);
        pointAInClippingSpace[0] = pointBInClippingSpace[0] = ((2 * x) - widthM1) / width;
        pointAInClippingSpace[1] = pointBInClippingSpace[1] = -(((2 * y) - heightM1) / height);

        vec3.transformMat4(pointAInModelSpace, pointAInClippingSpace, mvpi);
        vec3.transformMat4(pointBInModelSpace, pointBInClippingSpace, mvpi);
        vec3.sub(rayVector, pointBInModelSpace, pointAInModelSpace);

        console.log('pointAInClippingSpace', pointAInClippingSpace.join(', '));
        console.log('pointBInClippingSpace', pointBInClippingSpace.join(', '));
        console.log('pointAInModelSpace', pointAInModelSpace.join(', '));
        console.log('pointBInModelSpace', pointBInModelSpace.join(', '));
        console.log('--');
        console.log('rayPosition', pointAInModelSpace.join(', '));
        console.log('rayVector', rayVector.join(', '));
        debugger;
        const voxelMaterialAddress: number = voxelOctreeObjectRaytrace(voxelOctree, pointAInModelSpace, rayVector, hitPosition);
        console.log('voxelMaterialAddress', voxelMaterialAddress);

        const j = (x + y * width) * 4;
        imageData.data[j] = 0;
        imageData.data[j + 1] = 255;
        imageData.data[j + 1] = 0;
        imageData.data[j + 1] = 255;
      };

      let i = 0;
      for (let y = 0; y < height; y++) {
        pointAInClippingSpace[1] = pointBInClippingSpace[1] = -(((2 * y) - heightM1) / height); // negate because y axis of Image data is opposite of viewport
        // pointAInClippingSpace[1] = pointBInClippingSpace[1] = (((2 * y) - heightM1) / heightM1); // naive

        for (let x = 0; x < width; x++) {
          pointAInClippingSpace[0] = pointBInClippingSpace[0] = ((2 * x) - widthM1) / width;
          // pointAInClippingSpace[0] = pointBInClippingSpace[0] = ((2 * x) - widthM1) / widthM1; // naive

          vec3.transformMat4(pointAInModelSpace, pointAInClippingSpace, mvpi);
          vec3.transformMat4(pointBInModelSpace, pointBInClippingSpace, mvpi);
          vec3.sub(rayVector, pointBInModelSpace, pointAInModelSpace);

          const voxelMaterialAddress: number = voxelOctreeRaytrace(voxelOctree.memory, voxelOctree.address, voxelOctree.depth, pointAInModelSpace, rayVector, hitPosition);

          if (voxelMaterialAddress === NO_MATERIAL) {
            imageData.data[i + 3] = 0;
            i += 4;
          } else {
            imageData.data[i++] = voxelOctree.memory[voxelMaterialAddress];
            imageData.data[i++] = voxelOctree.memory[voxelMaterialAddress + 1];
            imageData.data[i++] = voxelOctree.memory[voxelMaterialAddress + 2];
            imageData.data[i++] = 255;
          }

        }
      }

      // drawDebug(39, 30);

      return imageData;
    }

    console.time('raycast');
    drawImageData(render(new ImageData(windowSize, windowSize)));
    console.timeEnd('raycast');
    debugCanvasCoordinates(windowSize / 512);


    /*----*/

    const imageData = new ImageData(windowSize, windowSize);
    const ctx: CanvasRenderingContext2D = createCanvasContext(imageData.width, imageData.height);

    const refresh = startCameraControl();
    const loop = () => {
      requestAnimationFrame(() => {
        refresh(view, view);
        mat4.mul(mvp, mat4.mul(mvp, projection, view), model);
        // mat4_display('mvp', mvp);
        mat4.invert(mvpi, mvp);
        ctx.putImageData(render(imageData), 0, 0);
        loop();
      });
    };
    loop();

  }

  draw();
}


async function debugVoxelRayTrace3() {
  const windowSize: number = 128;
  const side: number = 8;
  const side2: number = side / 2;

  const projection = mat4.perspective(mat4.create(), Math.PI / 2, 1, 1, 2); // far is not important (now) for raytracing

  const view = mat4.lookAt(mat4.create(), [0, 0, -side], [0, 0, 0], [0, 1, 0]); // camera is at [0, 0, -side], and look in direction [0, 0, 0] (up is Y axis)
  const view_projection = mat4.mul(mat4.create(), projection, view);

  // const model = mat4.fromTranslation(mat4.create(), [-side2, -side2, -side2]); // center the model
  // const mvp = mat4.create();
  // mat4.mul(mvp, mat4.mul(mvp, projection, view), model);
  // const mvpi = mat4.invert(mat4.create(), mvp);

  // mat4_display('projection', projection);
  // mat4_display('view', view);
  // mat4_display('model', model);
  // mat4_display('mvp', mvp);
  // mat4_display('mvpi', mvpi);

  // const pointAInClippingSpace: vec3 = vec3.fromValues(0, 0, -1);
  // const pointBInClippingSpace: vec3 = vec3.fromValues(0, 0, 1);
  // const pointAInModelSpace: vec3 = vec3.transformMat4(vec3.create(), pointAInClippingSpace, mvpi);
  // const pointBInModelSpace: vec3 = vec3.transformMat4(vec3.create(), pointBInClippingSpace, mvpi);
  // console.log(pointAInModelSpace, pointBInModelSpace);


  /*--*/

  function draw() {
    interface IObject3DVoxel {
      voxelOctree: VoxelOctree;
      modelMatrix: mat4;
    }

    const voxel1: IObject3DVoxel = {
      voxelOctree: createRainbowSphereVoxelOctree(side),
      modelMatrix: mat4.fromTranslation(mat4.create(), [-side2, -side2, -side2]),
    };

    const voxel2: IObject3DVoxel = {
      voxelOctree: createAxisVoxelOctree(side, side / 16),
      modelMatrix: mat4.fromTranslation(mat4.create(), [-side2, -side2, -side2]),
    };

    const voxels: IObject3DVoxel[] = [
      voxel1,
      voxel2,
    ];

    const _voxels: IObject3DVoxelOctree[] = voxels.map((voxel: IObject3DVoxel) => {
      const mvp: mat4 = mat4.mul(mat4.create(), view_projection, voxel.modelMatrix);
      const mvpi: mat4 =  mat4.invert(mat4.create(), mvp);
      return {
        voxelOctree: voxel.voxelOctree,
        mvp,
        mvpi,
      }
    });
    // const mvp: mat4[] = voxels.map(voxel => mat4.mul(mat4.create(), view_projection, voxel.modelMatrix));
    // const mvpi: mat4[] = mvp.map(mvp => mat4.invert(mat4.create(), mvp));

    function render(imageData: ImageData): ImageData {
      const pointAInClippingSpace: vec3 = vec3.fromValues(0, 0, -1);
      const pointBInClippingSpace: vec3 = vec3.fromValues(0, 0, 1);
      const pointAInModelSpace: vec3 = vec3.create();
      const pointBInModelSpace: vec3 = vec3.create();
      const rayVector: vec3 = vec3.create();
      const hitPosition: vec3 = vec3.create();

      const width: number = imageData.width;
      const widthM1: number = width - 1;
      const height: number = imageData.height;
      const heightM1: number = height - 1;

      let i = 0;
      for (let y = 0; y < height; y++) {
        pointAInClippingSpace[1] = pointBInClippingSpace[1] = -(((2 * y) - heightM1) / height); // negate because y axis of Image data is opposite of viewport
        // pointAInClippingSpace[1] = pointBInClippingSpace[1] = (((2 * y) - heightM1) / heightM1); // naive

        for (let x = 0; x < width; x++) {
          pointAInClippingSpace[0] = pointBInClippingSpace[0] = ((2 * x) - widthM1) / width;
          // pointAInClippingSpace[0] = pointBInClippingSpace[0] = ((2 * x) - widthM1) / widthM1; // naive

          const voxelMaterialAddress: number = voxelOctreeRaytraceMany(_voxels, pointAInModelSpace, pointBInClippingSpace, hitPosition);

          if (voxelMaterialAddress === NO_MATERIAL) {
            imageData.data[i + 3] = 0;
            i += 4;
          } else {
            imageData.data[i++] = voxelOctree.memory[voxelMaterialAddress];
            imageData.data[i++] = voxelOctree.memory[voxelMaterialAddress + 1];
            imageData.data[i++] = voxelOctree.memory[voxelMaterialAddress + 2];
            imageData.data[i++] = 255;
          }

        }
      }

      // drawDebug(39, 30);

      return imageData;
    }

    console.time('raycast');
    drawImageData(render(new ImageData(windowSize, windowSize)));
    console.timeEnd('raycast');
    debugCanvasCoordinates(windowSize / 512);


    /*----*/

    // const imageData = new ImageData(windowSize, windowSize);
    // const ctx: CanvasRenderingContext2D = createCanvasContext(imageData.width, imageData.height);
    //
    // const refresh = startCameraControl();
    // const loop = () => {
    //   requestAnimationFrame(() => {
    //     refresh(view, view);
    //     mat4.mul(mvp, mat4.mul(mvp, projection, view), model);
    //     // mat4_display('mvp', mvp);
    //     mat4.invert(mvpi, mvp);
    //     ctx.putImageData(render(imageData), 0, 0);
    //     loop();
    //   });
    // };
    // loop();

  }

  draw();
}


/*------------------*/

export async function debugVoxelRayTrace() {
  // await debugVoxelRayTrace1();
  // await debugVoxelRayTrace2();
  await debugVoxelRayTrace3();

}
