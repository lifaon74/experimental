import {
  convertVoxelOctreeDepthToSide, readVoxelMaterialAddressOfVoxelOctreeAtPosition, VoxelOctree,
  writeVoxelOctreeMaterialAddress
} from '../octree';
import { NO_MATERIAL, VOXEL_MATERIAL_BYTES_PER_ELEMENT, VoxelMaterial, writeNewVoxelMaterial } from '../material';
import { IAllocFunction } from '../memory-address';
import { vec3 } from 'gl-matrix';
import { voxelOctreeRaytrace } from '../raytrace/raytrace';
import { AbstractMemory } from '../abstract-memory';
import { CompactVoxelOctreesOnNewMemory } from '../compact';

export interface IDrawFunction {
  (
    x: number,
    y: number,
    z: number,
  ): void;
}

export interface IDrawLazy {
  (draw: IDrawFunction): void;
}

export interface IDrawPipe {
  (draw: IDrawFunction): IDrawFunction;
}


/*-- PIPING --*/

export function composeDraw(
  fns: IDrawPipe[],
): IDrawPipe {
  return (firstArg: IDrawFunction): IDrawFunction => {
    return fns.reduceRight((value: IDrawFunction, fnc: IDrawPipe) => fnc(value), firstArg);
  };
}

export function composeNowDraw(
  fns: IDrawPipe[],
  draw: IDrawFunction,
): IDrawFunction {
  return composeDraw(fns)(draw);
}


/*-- PIPES --*/

export function clampDrawPipe(
  x_min: number,
  y_min: number,
  z_min: number,
  x_max: number,
  y_max: number,
  z_max: number,
): IDrawPipe {
  return (draw: IDrawFunction): IDrawFunction => {
    return (
      x: number,
      y: number,
      z: number,
    ) => {
      if (
        ((x_min <= x) && (x < x_max))
        && ((y_min <= y) && (y < y_max))
        && ((z_min <= z) && (z < z_max))
      ) {
        draw(x, y, z);
      }
    };
  };
}

export function translateDrawPipe(
  x: number,
  y: number,
  z: number,
): IDrawPipe {
  return (draw: IDrawFunction): IDrawFunction => {
    return (
      _x: number,
      _y: number,
      _z: number,
    ) => {
      draw(x + _x, y + _y, z + _z);
    };
  };
}


/* SHAPES */

export function sphereDraw(
  radius: number,
): IDrawLazy {
  return (draw: IDrawFunction): void => {
    const offset: number = -0.5;

    for (let x = -radius + offset; x <= radius - offset; x++) {
      for (let y = -radius + offset; y <= radius - offset; y++) {
        for (let z = -radius + offset; z <= radius - offset; z++) {

          const d: number = Math.sqrt(
            Math.pow(x, 2)
            + Math.pow(y, 2)
            + Math.pow(z, 2)
          );

          if (d <= radius) {
            draw(x + offset, y + offset, z + offset);
          }
        }
      }
    }
  };
}

export function boxDraw(
  x_size: number,
  y_size: number,
  z_size: number,
): IDrawLazy {
  return (draw: IDrawFunction): void => {
    for (let x = 0; x < x_size; x++) {
      for (let y = 0; y < y_size; y++) {
        for (let z = 0; z < z_size; z++) {
          draw(x, y, z);
        }
      }
    }
  };
}

export function cubeDraw(
  side: number,
): IDrawLazy {
  return boxDraw(side, side, side);
}


/*-------------- FOR DEBUG -------------*/

export type ITexture3DData = [{ x: number; y: number; z: number }, Uint8Array];

export function drawTexture3DDataForVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
  texture: ITexture3DData,
) {
  const x_size: number = texture[0].x;
  const y_size: number = texture[0].y;
  const z_size: number = texture[0].z;
  const data: Uint8Array = texture[1];
  let materialAddress: number;

  for (let x = 0; x < x_size; x++) {
    for (let y = 0; y < y_size; y++) {
      for (let z = 0; z < z_size; z++) {
        const i: number = (x + (y * x_size) + (z * x_size * y_size)) * 4;

        if (data[i + 3] === 0) {
          materialAddress = NO_MATERIAL;
        } else {
          materialAddress = alloc(VOXEL_MATERIAL_BYTES_PER_ELEMENT);
          writeNewVoxelMaterial(memory, materialAddress, data[i], data[i + 1], data[i + 2]);
        }

        writeVoxelOctreeMaterialAddress(
          memory,
          voxelOctreeAddress,
          alloc,
          voxelOctreeDepth,
          x,
          y,
          z,
          materialAddress,
        );
      }
    }
  }
}

/*-------------- FOR DEBUG -------------*/

export function createDrawFunctionForVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
  materialAddress: number,
): IDrawFunction {
  return (
    x: number,
    y: number,
    z: number,
  ) => {
    // console.log('draw at', x, y, z);
    writeVoxelOctreeMaterialAddress(
      memory,
      voxelOctreeAddress,
      alloc,
      voxelOctreeDepth,
      x,
      y,
      z,
      materialAddress,
    );
  };
}

export function createRainbowDrawFunctionForVoxelOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
): IDrawFunction {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);
  const f: number = 255 / (side - 1);

  return (
    x: number,
    y: number,
    z: number,
  ) => {
    const material = VoxelMaterial.create(
      memory,
      alloc,
      Math.floor(x * f),
      Math.floor(y * f),
      Math.floor(z * f),
    );

    writeVoxelOctreeMaterialAddress(
      memory,
      voxelOctreeAddress,
      alloc,
      voxelOctreeDepth,
      x,
      y,
      z,
      material.address,
    );
  };
}


/**
 * Fills entirely a voxel with a cube
 */
export function drawUniformCubeForOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
  materialAddress: number,
) {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);

  const draw = createDrawFunctionForVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
    materialAddress
  );

  const cube = cubeDraw(side);

  cube(composeNowDraw([
    clampDrawPipe(0, 0, 0, side, side, side),
  ], draw));
}

/**
 * Fills entirely a voxel with a red cube
 */
export function drawUniformRedCubeForOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
) {
  const material = VoxelMaterial.create(memory, alloc, 255, 0, 0);
  drawUniformCubeForOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
    material.address
  );
}

/**
 * Fills a voxel with a red cube, and keeps 1vx all around
 */
export function drawUniformInnerRedCubeForOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
) {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);
  const material = VoxelMaterial.create(memory, alloc, 255, 0, 0);

  const draw = createDrawFunctionForVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
    material.address
  );

  const cubeEmpty = cubeDraw(side);

  cubeEmpty(composeNowDraw([
    translateDrawPipe(1, 1, 1),
    clampDrawPipe(1, 1, 1, side - 1, side - 1, side - 1),
  ], draw));
}

/**
 * Fills a voxel with a red cube, and keeps 1vx all around
 */
export function drawRainbowInnerCubeForOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
) {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);

  const draw = createRainbowDrawFunctionForVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
  );

  const cubeEmpty = cubeDraw(side);

  cubeEmpty(composeNowDraw([
    translateDrawPipe(1, 1, 1),
    clampDrawPipe(1, 1, 1, side - 1, side - 1, side - 1),
  ], draw));
}


/**
 * Fills entirely a voxel with axis
 */
export function drawAxisForOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
  lineWidth: number = 2,
) {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);
  const red = VoxelMaterial.create(memory, alloc, 255, 0, 0);
  const green = VoxelMaterial.create(memory, alloc, 0, 255, 0);
  const blue = VoxelMaterial.create(memory, alloc, 0, 0, 255);

  const drawRed = createDrawFunctionForVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
    red.address,
  );

  const drawGreen = createDrawFunctionForVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
    green.address,
  );

  const drawBlue = createDrawFunctionForVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
    blue.address,
  );

  const xAxis = boxDraw(side, lineWidth, lineWidth);
  const yAxis = boxDraw(lineWidth, side, lineWidth);
  const zAxis = boxDraw(lineWidth, lineWidth,side);

  xAxis(composeNowDraw([
    clampDrawPipe(0, 0, 0, side, side, side),
  ], drawRed));

  yAxis(composeNowDraw([
    clampDrawPipe(0, 0, 0, side, side, side),
  ], drawGreen));

  zAxis(composeNowDraw([
    clampDrawPipe(0, 0, 0, side, side, side),
  ], drawBlue));
}

/**
 * Fills entirely a voxel with a sphere
 */
export function drawUniformSphereForOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
  materialAddress: number,
) {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);
  const radius: number = Math.floor(side / 2);

  const draw = createDrawFunctionForVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
    materialAddress
  );

  const sphere = sphereDraw(radius);

  sphere(composeNowDraw([
    translateDrawPipe(radius, radius, radius),
    clampDrawPipe(0, 0, 0, side, side, side),
  ], draw));
}

/**
 * Fills entirely a voxel with a red sphere
 */
export function drawUniformRedSphereForOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
) {
  const material = VoxelMaterial.create(memory, alloc, 255, 0, 0);
  drawUniformSphereForOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
    material.address
  );
}


export function drawRandomCubeForOctree(
  memory: Uint8Array,
  address: number,
  depth: number,
  alloc: IAllocFunction,
  materials: number[]
) {
  const side: number = convertVoxelOctreeDepthToSide(depth);

  // drawCube(
  //   clampDraw((
  //     x: number,
  //     y: number,
  //     z: number,
  //     ) => {
  //       writeVoxelOctreeMaterialAddress(
  //         memory,
  //         address,
  //         alloc,
  //         depth,
  //         x,
  //         y,
  //         z,
  //         materials[Math.floor(Math.random() * materials.length)],
  //       );
  //     },
  //     0, 0, 0, side, side, side
  //   ),
  //   side
  // );
}

/**
 * Fills entirely a voxel with a rainbow cube (colors from 0-255 for each chanel)
 */
export function drawRainbowCubeForOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
) {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);

  const draw = createRainbowDrawFunctionForVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
  );

  const cube = cubeDraw(side);

  cube(composeNowDraw([
    clampDrawPipe(0, 0, 0, side, side, side),
  ], draw));
}

/**
 * Fills entirely a voxel with a rainbow sphere (colors from 0-255 for each chanel)
 */
export function drawRainbowSphereForOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
) {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);
  const radius: number = Math.floor(side / 2);

  const draw = createRainbowDrawFunctionForVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
  );

  const sphere = sphereDraw(radius);

  sphere(composeNowDraw([
    translateDrawPipe(radius, radius, radius),
    clampDrawPipe(0, 0, 0, side, side, side),
  ], draw));
}


/**
 * Fills entirely a voxel with the surfaces of a cube
 */
export function drawEmptyCubeForOctree(
  memory: Uint8Array,
  voxelOctreeAddress: number,
  voxelOctreeDepth: number,
  alloc: IAllocFunction,
  materialAddress: number,
) {
  const side: number = convertVoxelOctreeDepthToSide(voxelOctreeDepth);

  drawUniformCubeForOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
    materialAddress
  );

  const drawEmpty = createDrawFunctionForVoxelOctree(
    memory,
    voxelOctreeAddress,
    voxelOctreeDepth,
    alloc,
    NO_MATERIAL
  );

  const cubeEmpty = cubeDraw(side);

  cubeEmpty(composeNowDraw([
    translateDrawPipe(1, 1, 1),
    clampDrawPipe(1, 1, 1, side - 1, side - 1, side - 1),
  ], drawEmpty));
}

export function drawVoxelsToDebugUnreachableVoxels(
  memory: Uint8Array,
  address: number,
  depth: number,
  alloc: IAllocFunction,
) {
  const side: number = convertVoxelOctreeDepthToSide(depth);
  const externalMaterial: VoxelMaterial = VoxelMaterial.create(memory, alloc, 255, 0, 0);
  const randomMaterials: VoxelMaterial[] = Array.from({ length: 4 }, () => VoxelMaterial.create(memory, alloc, 0, Math.floor(Math.random() * 256), 0));

  // drawCube(
  //   translateDraw(
  //     clampDraw((
  //       x: number,
  //       y: number,
  //       z: number,
  //       ) => {
  //         writeVoxelOctreeMaterialAddress(
  //           memory,
  //           address,
  //           alloc,
  //           depth,
  //           x,
  //           y,
  //           z,
  //           externalMaterial.address,
  //         );
  //       },
  //       1, 1, 1, side - 1, side - 1, side - 1
  //     ),
  //     1, 1, 1
  //   ),
  //   side - 2
  // );
  //
  // drawCube(
  //   translateDraw(
  //     clampDraw((
  //       x: number,
  //       y: number,
  //       z: number,
  //       ) => {
  //         writeVoxelOctreeMaterialAddress(
  //           memory,
  //           address,
  //           alloc,
  //           depth,
  //           x,
  //           y,
  //           z,
  //           randomMaterials[Math.floor(Math.random() * randomMaterials.length)].address,
  //         );
  //       },
  //       2, 2, 2, side - 2, side - 2, side - 2
  //     ),
  //     2, 2, 2
  //   ),
  //   side - 4
  // );
}

/*---------------------------*/

export interface ISliceVoxelOctreeCallback {
  (voxelOctree: VoxelOctree, x: number, y: number): number;
}

export function sliceOctreeUsingReadVoxel(
  z: number,
): ISliceVoxelOctreeCallback {
  return (voxelOctree: VoxelOctree, x: number, y: number): number => {
    return readVoxelMaterialAddressOfVoxelOctreeAtPosition(voxelOctree.memory, voxelOctree.address, voxelOctree.depth, x, y, z);
  };
}

export function sliceVoxelOctreeUsingRaytrace(
  rayPosition: vec3 = vec3.fromValues(0, 0, -1),
  rayVector: vec3 = vec3.fromValues(0, 0, 1)
): ISliceVoxelOctreeCallback {
  const hitPosition: vec3 = vec3.create();
  return (voxelOctree: VoxelOctree, x: number, y: number): number => {
    rayPosition[0] = x + 0.5;
    rayPosition[1] = y + 0.5;
    return voxelOctreeRaytrace(voxelOctree.memory, voxelOctree.address, voxelOctree.depth, rayPosition, rayVector, hitPosition);
  };
}


export function sliceVoxelOctree(
  voxelOctree: VoxelOctree,
  getMaterial: ISliceVoxelOctreeCallback,
): ImageData {
  const side = convertVoxelOctreeDepthToSide(voxelOctree.depth);
  const img = new ImageData(side, side);

  let i = 0;
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const materialId: number = getMaterial(voxelOctree, x, y);
      if (materialId === NO_MATERIAL) {
        i += 4;
      } else {
        img.data[i++] = voxelOctree.memory[materialId];
        img.data[i++] = voxelOctree.memory[materialId + 1];
        img.data[i++] = voxelOctree.memory[materialId + 2];
        img.data[i++] = 255;
      }
    }
  }

  return img;
}

export function createCanvasContext(width: number, height: number): CanvasRenderingContext2D {
  const ctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  document.body.appendChild(ctx.canvas);

  ctx.canvas.style.width = '512px';
  ctx.canvas.style.height = '512px';
  ctx.canvas.style.imageRendering = 'pixelated';
  ctx.canvas.style.border = '2px solid black';
  // ctx.canvas.style.backgroundImage = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEX////MzMw46qqDAAAAEElEQVQImWNg+M+AFeEQBgB+vw/xfUUZkgAAAABJRU5ErkJggg==')`;
  ctx.canvas.style.backgroundColor = `black`;

  return ctx;
}

export function drawImageData(img: ImageData): HTMLCanvasElement {
  const ctx: CanvasRenderingContext2D = createCanvasContext(img.width, img.height);
  ctx.putImageData(img, 0, 0);
  return ctx.canvas;
}

export function displayVoxelOctreeSlice(
  voxelOctree: VoxelOctree,
  getMaterial: ISliceVoxelOctreeCallback,
): HTMLCanvasElement {
  return drawImageData(sliceVoxelOctree(voxelOctree, getMaterial));
}
