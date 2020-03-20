import { IObject2D } from '../object-2d/interfaces';
import { mat3, vec2 } from 'gl-matrix';

/** INTERFACES **/

export interface IObjects2DTransformerConstructor {
  new<TObjects extends IObject2D>(objects: Iterable<TObjects>): IObjects2DTransformer<TObjects>;
}

/**
 * Helps to apply some transformations to a list of objects.
 */
export interface IObjects2DTransformer<TObjects extends IObject2D> {
  readonly objects: ReadonlyArray<TObjects>;

  /**
   * Resets the transformations all its objects.
   */
  reset(): this;

  /**
   * Applies some transformations from a matrix.
   * Useful to commit multiple transformations at once.
   */
  transform(callback: (matrix: mat3) => mat3): this;


  /**
   * Translates the objects.
   */
  translate(vector: vec2 | number[]): this;

  /**
   * Rotates the objects with a angle of 'rad'
   */
  rotate(rad: number): this;


  scale(vector: vec2 | number[]): this;

  uniformScale(scale: number): this;
}

