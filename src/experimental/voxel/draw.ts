import {
  ConvertVoxelOctreeDepthToSide, ReadVoxelMaterialAddressOfVoxelOctreeAtPosition, VoxelOctree, WriteVoxelOctreeMaterialAddress
} from './octree';
import { WriteNewVoxelMaterial, NO_MATERIAL, VOXEL_MATERIAL_BYTES_PER_ELEMENT, VoxelMaterial } from './material';
import { TAllocFunction } from './memory-address';

export type TDrawCallbackWithMaterial = (
  x: number,
  y: number,
  z: number,
  materialIndex: number,
) => void;

export type TDrawCallback = (
  x: number,
  y: number,
  z: number,
) => void;

export function ClampDraw(
  draw: TDrawCallback,
  x_min: number,
  y_min: number,
  z_min: number,
  x_max: number,
  y_max: number,
  z_max: number,
): TDrawCallback {
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
}

export function ClampDrawForOctree(
  draw: TDrawCallback,
  depth: number,
): TDrawCallback {
  const side: number = ConvertVoxelOctreeDepthToSide(depth);
  return ClampDraw(draw, 0, 0, 0, side, side, side);
}


export function TranslateDraw(
  draw: TDrawCallback,
  x: number,
  y: number,
  z: number,
): TDrawCallback {
  return (
    _x: number,
    _y: number,
    _z: number,
  ) => {
    draw(x + _x, y + _y, z + _z);
  };
}

export function DrawSphere(
  draw: TDrawCallback,
  radius: number,
): void {
  const offset: number = -0.5;

  for (let x = -radius + offset; x <= radius - offset; x++) {
    for (let y = -radius + offset; y <= radius- offset; y++) {
      for (let z = -radius + offset; z <= radius- offset; z++) {

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
}

export function DrawBox(
  draw: TDrawCallback,
  x_size: number,
  y_size: number,
  z_size: number,
): void {
  for (let x = 0; x < x_size; x++) {
    for (let y = 0; y < y_size; y++) {
      for (let z = 0; z < z_size; z++) {
        draw(x, y, z);
      }
    }
  }
}

export function DrawCube(
  draw: TDrawCallback,
  side: number,
): void {
  DrawBox(draw, side, side, side);
}


/*-------------- FOR DEBUG -------------*/

export function drawUniformRedCubeForOctree(
  memory: Uint8Array,
  address: number,
  depth: number,
  alloc: TAllocFunction,
) {
  const side: number = ConvertVoxelOctreeDepthToSide(depth);
  const material = VoxelMaterial.create(memory, alloc, 255, 0, 0, 255, 0);

  DrawCube(
    ClampDraw((
      x: number,
      y: number,
      z: number,
      ) => {
        WriteVoxelOctreeMaterialAddress(
          memory,
          address,
          alloc,
          depth,
          x,
          y,
          z,
          material.address,
        );
      },
      0, 0, 0, side, side, side
    ),
    side
  );
}

export function drawUniformSphereForOctree(
  memory: Uint8Array,
  address: number,
  depth: number,
  alloc: TAllocFunction,
  materialAddress: number,
) {
  const side: number = ConvertVoxelOctreeDepthToSide(depth);
  const radius: number = Math.floor(side / 2);

  const draw = (
    x: number,
    y: number,
    z: number,
  ) => {
    // console.log('write at', x, y, z);
    WriteVoxelOctreeMaterialAddress(
      memory,
      address,
      alloc,
      depth,
      x,
      y,
      z,
      materialAddress,
    );
  };

  DrawSphere(
    TranslateDraw(
      ClampDraw(
        draw,
        0, 0, 0, side, side, side
      ),
      radius, radius, radius
    ),
    radius
  );
}

export function drawUniformRedSphereForOctree(
  memory: Uint8Array,
  address: number,
  depth: number,
  alloc: TAllocFunction,
) {
  const material = VoxelMaterial.create(memory, alloc, 255, 0, 0, 255, 0);
  drawUniformSphereForOctree(
    memory,
    address,
    depth,
    alloc,
    material.address
  );
}

export function drawRandomCubeForOctree(
  memory: Uint8Array,
  address: number,
  depth: number,
  alloc: TAllocFunction,
  materials: number[]
) {
  const side: number = ConvertVoxelOctreeDepthToSide(depth);

  DrawCube(
    ClampDraw((
      x: number,
      y: number,
      z: number,
      ) => {
        WriteVoxelOctreeMaterialAddress(
          memory,
          address,
          alloc,
          depth,
          x,
          y,
          z,
          materials[Math.floor(Math.random() * materials.length)],
        );
      },
      0, 0, 0, side, side, side
    ),
    side
  );
}


export function drawRainbowCubeForOctree(
  memory: Uint8Array,
  address: number,
  depth: number,
  alloc: TAllocFunction,
) {
  const side: number = ConvertVoxelOctreeDepthToSide(depth);

  DrawCube(
    ClampDraw((
      x: number,
      y: number,
      z: number,
      ) => {
        const material = VoxelMaterial.create(
          memory,
          alloc,
          Math.floor(x / (side - 1) * 255),
          Math.floor(y / (side - 1) * 255),
          Math.floor(z / (side - 1) * 255),
          255,
          /*0*/123
        );

        WriteVoxelOctreeMaterialAddress(
          memory,
          address,
          alloc,
          depth,
          x,
          y,
          z,
          material.address,
        );
      },
      0, 0, 0, side, side, side
    ),
    side
  );
}

export function drawEmptyCubeForOctree(
  memory: Uint8Array,
  address: number,
  depth: number,
  alloc: TAllocFunction,
  materialAddress: number,
) {
  const side: number = ConvertVoxelOctreeDepthToSide(depth);

  DrawCube(
    ClampDraw((
      x: number,
      y: number,
      z: number,
      ) => {
        WriteVoxelOctreeMaterialAddress(
          memory,
          address,
          alloc,
          depth,
          x,
          y,
          z,
          materialAddress,
        );
      },
      0, 0, 0, side, side, side
    ),
    side
  );

  DrawCube(
    TranslateDraw(
      ClampDraw((
        x: number,
        y: number,
        z: number,
        ) => {
          WriteVoxelOctreeMaterialAddress(
            memory,
            address,
            alloc,
            depth,
            x,
            y,
            z,
            NO_MATERIAL,
          );
        },
        1, 1, 1, side - 1, side - 1, side - 1
      ),
      1,  1, 1
    ),
    side - 2
  );
}

export function drawVoxelsToDebugUnreachableVoxels(
  memory: Uint8Array,
  address: number,
  depth: number,
  alloc: TAllocFunction,
) {
  const side: number = ConvertVoxelOctreeDepthToSide(depth);
  const externalMaterial: VoxelMaterial = VoxelMaterial.create(memory, alloc, 255, 0, 0, 255, 0);
  const randomMaterials: VoxelMaterial[] = Array.from({ length: 4 }, () => VoxelMaterial.create(memory, alloc, 0, Math.floor(Math.random() * 256), 0, 255, 0));

  DrawCube(
    TranslateDraw(
      ClampDraw((
        x: number,
        y: number,
        z: number,
        ) => {
          WriteVoxelOctreeMaterialAddress(
            memory,
            address,
            alloc,
            depth,
            x,
            y,
            z,
            externalMaterial.address,
          );
        },
        1, 1, 1, side - 1, side - 1, side - 1
      ),
      1,  1, 1
    ),
    side - 2
  );

  DrawCube(
    TranslateDraw(
      ClampDraw((
        x: number,
        y: number,
        z: number,
        ) => {
          WriteVoxelOctreeMaterialAddress(
            memory,
            address,
            alloc,
            depth,
            x,
            y,
            z,
            randomMaterials[Math.floor(Math.random() * randomMaterials.length)].address,
          );
        },
        2, 2, 2, side - 2, side - 2, side - 2
      ),
      2,  2, 2
    ),
    side - 4
  );
}

/*---------------------------*/

export function sliceOctree(
  octree: VoxelOctree,
  z: number,
  cb: (x: number, y: number) => number = (x: number, y: number) => ReadVoxelMaterialAddressOfVoxelOctreeAtPosition(octree.memory, octree.address, octree.depth, x, y, z),
): ImageData {
  const side = ConvertVoxelOctreeDepthToSide(octree.depth);
  const img = new ImageData(side, side);

  let i = 0;
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const materialId: number = cb(x, y);
      if (materialId === NO_MATERIAL) {
        i += 4;
      } else {
        img.data[i++] = octree.memory[materialId];
        img.data[i++] = octree.memory[materialId + 1];
        img.data[i++] = octree.memory[materialId + 2];
        img.data[i++] = octree.memory[materialId + 3];
      }
    }
  }

  return img;
}

export function drawImageData(img: ImageData): HTMLCanvasElement {
  const ctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
  ctx.canvas.width = img.width;
  ctx.canvas.height = img.height;
  ctx.putImageData(img, 0, 0);
  document.body.appendChild(ctx.canvas);

  ctx.canvas.style.width = '512px';
  ctx.canvas.style.height = '512px';
  ctx.canvas.style.imageRendering = 'pixelated';
  ctx.canvas.style.border = '2px solid black';
  return ctx.canvas;
}

export function displayOctreeSlice(
  octree: VoxelOctree,
  z: number,
): HTMLCanvasElement {
  return drawImageData(sliceOctree(octree, z))
}
