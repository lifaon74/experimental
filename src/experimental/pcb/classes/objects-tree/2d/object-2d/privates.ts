import { mat3 } from 'gl-matrix';
import { IObject2D } from './interfaces';
import { IObject2DGroup } from '../object-2d-group/interfaces';

/** PRIVATES **/

export const OBJECT_2D_PRIVATE = Symbol('object-2d-private');

export interface IObject2DPrivate {
  modelMatrix: mat3;
  worldMatrix: mat3; // cached
  parent: IObject2DGroup<IObject2D> | null;

  updateWorldMatrix(force?: boolean): void;
}

export interface IObject2DPrivatesInternal {
  [OBJECT_2D_PRIVATE]: IObject2DPrivate;
}

export interface IObject2DInternal extends IObject2DPrivatesInternal, IObject2D {
}

