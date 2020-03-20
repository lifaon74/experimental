import { mat3 } from 'gl-matrix';
import { IObject2DGroup } from '../object-2d-group/interfaces';

/** TYPES **/

export interface IObject2DOptions {
  modelMatrix?: mat3;
}

/** INTERFACES **/

export interface IObject2DConstructor {
  new(options?: IObject2DOptions, shallow?: boolean): IObject2D;
}

/**
 * Represents an object in a 2D scene.
 * It has:
 *  - a model matrix: defines its local position, rotation and scaling
 *  - a world matrix: defines its position, rotation and scaling in the scene
 *      => is updated automatically by calling 'updateWorldMatrix', avoid any manual modifications
 *  It may have a parent.
 */
export interface IObject2D extends IObject2DOptions {
  readonly modelMatrix: mat3;
  readonly worldMatrix: mat3; // cached
  worldMatrixNeedsUpdate: boolean;
  parent: IObject2DGroup<IObject2D> | null;

  /**
   * Updates the world matrix.
   * INFO: Must be called after this or parent's modelMatrix change
   * INFO: The renderer automatically calls this method before the rendering.
   */
  updateWorldMatrix(force?: boolean): boolean;
}

