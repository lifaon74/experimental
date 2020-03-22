import { mat3, vec2 } from 'gl-matrix';
import { IObjects2DTransformer } from './interfaces';
import { ConstructObjects2DTransformer } from './constructor';
import { IObjects2DTransformerInternal, OBJECTS_2D_TRANSFORMER_PRIVATE } from './privates';
import { IObject2D } from '../object-2d/interfaces';

const TMP_VEC2 = vec2.create();
const TMP_MAT3 = mat3.create();

/** METHODS **/

/* GETTERS/SETTERS */

export function Objects2DTransformerGetObjects<TObjects extends IObject2D>(instance: IObjects2DTransformer<TObjects>): ReadonlyArray<TObjects> {
  return (instance as IObjects2DTransformerInternal<TObjects>)[OBJECTS_2D_TRANSFORMER_PRIVATE].objects;
}

/* METHODS */

// export function Objects2DTransformerGetTranslation<TObjects extends IObject2D>(instance: IObjects2DTransformer<TObjects>, out: vec2 = vec2.create()): vec2 {
//   const modelMatrix: mat3 = (instance as IObjects2DTransformerInternal<TObjects>)[OBJECTS_2D_TRANSFORMER_PRIVATE].objects[0].modelMatrix;
//   out[0] = modelMatrix[6];
//   out[0] = modelMatrix[7];
//   return out;
// }
//
// export function Objects2DTransformerGetRotation<TObjects extends IObject2D>(instance: IObjects2DTransformer<TObjects>): number {
//   throw 'TODO';
// }
//
// // INFO not tested
// export function Objects2DTransformerGetScaling<TObjects extends IObject2D>(instance: IObjects2DTransformer<TObjects>, out: vec2 = vec2.create()): vec2 {
//   const modelMatrix: mat3 = (instance as IObjects2DTransformerInternal<TObjects>)[OBJECTS_2D_TRANSFORMER_PRIVATE].objects[0].modelMatrix;
//   out[0] = modelMatrix[0];
//   out[0] = modelMatrix[4];
//   return out;
// }

export function Objects2DTransformerReset<TObjects extends IObject2D>(instance: IObjects2DTransformer<TObjects>): void {
  const objects: ReadonlyArray<IObject2D> = (instance as IObjects2DTransformerInternal<TObjects>)[OBJECTS_2D_TRANSFORMER_PRIVATE].objects;
  for (let i = 0, l = objects.length; i < l; i++) {
    const object: IObject2D = objects[i];
    mat3.identity(object.modelMatrix);
    object.worldMatrixNeedsUpdate = true;
  }
}

export function Objects2DTransformerTransform<TObjects extends IObject2D>(instance: IObjects2DTransformer<TObjects>, callback: (matrix: mat3) => mat3): void {
  callback(mat3.identity(TMP_MAT3));
  Objects2DApplyMatrix<TObjects>(instance, TMP_MAT3);
}

export function Objects2DTransformerTranslate<TObjects extends IObject2D>(instance: IObjects2DTransformer<TObjects>, vector: vec2 | number[]): void {
  mat3.fromTranslation(TMP_MAT3, vector as vec2);
  // mat3.identity(TMP_MAT3);
  // mat3.translate(TMP_MAT3, TMP_MAT3, vector as vec2);
  Objects2DApplyMatrix<TObjects>(instance, TMP_MAT3);
}


export function Objects2DTransformerRotate<TObjects extends IObject2D>(instance: IObjects2DTransformer<TObjects>, rad: number): void {
  mat3.fromRotation(TMP_MAT3, rad);
  // mat3.identity(TMP_MAT3);
  // mat3.rotate(TMP_MAT3, TMP_MAT3, rad);
  Objects2DApplyMatrix<TObjects>(instance, TMP_MAT3);
}


export function Objects2DTransformerScale<TObjects extends IObject2D>(instance: IObjects2DTransformer<TObjects>, vector: vec2 | number[]): void {
  mat3.fromScaling(TMP_MAT3, vector as vec2);
  // mat3.identity(TMP_MAT3);
  // mat3.scale(TMP_MAT3, TMP_MAT3, vector as vec2);
  Objects2DApplyMatrix<TObjects>(instance, TMP_MAT3);
}

export function Objects2DTransformerUniformScale<TObjects extends IObject2D>(instance: IObjects2DTransformer<TObjects>, scale: number): void {
  TMP_VEC2.fill(scale);
  Objects2DTransformerScale<TObjects>(instance, TMP_VEC2);
}

/** FUNCTIONS **/

export function Objects2DApplyMatrix<TObjects extends IObject2D>(instance: IObjects2DTransformer<TObjects>, matrix: mat3): void {
  const objects: ReadonlyArray<TObjects> = (instance as IObjects2DTransformerInternal<TObjects>)[OBJECTS_2D_TRANSFORMER_PRIVATE].objects;
  for (let i = 0, l = objects.length; i < l; i++) {
    const object: TObjects = objects[i];
    mat3.multiply(object.modelMatrix, matrix, object.modelMatrix);
    object.worldMatrixNeedsUpdate = true;
  }
}

/** CLASS **/

export class Objects2DTransformer<TObjects extends IObject2D> implements IObjects2DTransformer<TObjects> {

  constructor(objects: Iterable<TObjects>) {
    ConstructObjects2DTransformer<TObjects>(this, objects);
  }

  get objects(): ReadonlyArray<TObjects> {
    return Objects2DTransformerGetObjects<TObjects>(this);
  }

  reset(): this {
    Objects2DTransformerReset<TObjects>(this);
    return this;
  }

  transform(callback: (matrix: mat3) => mat3): this {
    Objects2DTransformerTransform<TObjects>(this, callback);
    return this;
  }

  translate(vector: vec2 | number[]): this {
    Objects2DTransformerTranslate<TObjects>(this, vector);
    return this;
  }

  rotate(rad: number): this {
    Objects2DTransformerRotate<TObjects>(this, rad);
    return this;
  }


  scale(vector: vec2 | number[]): this {
    Objects2DTransformerScale<TObjects>(this, vector);
    return this;
  }

  uniformScale(scale: number): this {
    Objects2DTransformerUniformScale<TObjects>(this, scale);
    return this;
  }
}
