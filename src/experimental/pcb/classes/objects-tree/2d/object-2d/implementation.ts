import { mat3 } from 'gl-matrix';
import { IObject2D, IObject2DOptions } from './interfaces';
import { ConstructObject2D } from './constructor';
import { IObject2DGroup } from '../object-2d-group/interfaces';
import { IObject2DInternal, IObject2DPrivate, OBJECT_2D_PRIVATE } from './privates';
import { CloneProperty } from '../../../../misc/cloneable';

/** METHODS **/

/* GETTERS/SETTERS */

export function Object2DGetModelMatrix(instance: IObject2D): mat3 {
  return (instance as IObject2DInternal)[OBJECT_2D_PRIVATE].modelMatrix;
}

export function Object2DGetWorldMatrix(instance: IObject2D): mat3 {
  if (instance.worldMatrixNeedsUpdate) {
    Object2DUpdateWorldMatrix(instance);
  }
  return (instance as IObject2DInternal)[OBJECT_2D_PRIVATE].worldMatrix;
}

export function Object2DGetParent(instance: IObject2D): IObject2DGroup<IObject2D> | null {
  return (instance as IObject2DInternal)[OBJECT_2D_PRIVATE].parent;
}

export function Object2DSetParent(instance: IObject2D, value: IObject2DGroup<IObject2D> | null): void {
  const privates: IObject2DPrivate = (instance as IObject2DInternal)[OBJECT_2D_PRIVATE];
  const parent: IObject2DGroup<IObject2D> | null = privates.parent;

  if (parent !== value) {
    if (parent !== null) {
      const children: IObject2D[] = parent.children as IObject2D[];
      for (let i = 0, l = children.length; i < l; i++) {
        if (children[i] === instance) {
          children.splice(i, 1);
          break;
        }
      }
    }

    privates.parent = value;
    instance.worldMatrixNeedsUpdate = true;

    if (value !== null) {
      (value.children as IObject2D[]).push(instance);
    }
  }
}

/* METHODS */

export function Object2DUpdateWorldMatrix(instance: IObject2D, force: boolean = false): boolean {
  if (instance.worldMatrixNeedsUpdate || force) {
    const privates: IObject2DPrivate = (instance as IObject2DInternal)[OBJECT_2D_PRIVATE];
    const parent: IObject2DGroup<IObject2D> | null = privates.parent;
    if (parent === null) {
      mat3.copy(privates.worldMatrix, privates.modelMatrix);
    } else {
      mat3.multiply(privates.worldMatrix, parent.worldMatrix, privates.modelMatrix);
    }
    instance.worldMatrixNeedsUpdate = false;
    return true;
  } else {
    return false;
  }
}


/** CLASS **/

export class Object2D implements IObject2D {
  public worldMatrixNeedsUpdate: boolean;

  constructor(options?: IObject2DOptions, shallow?: boolean) {
    ConstructObject2D(this, options, shallow);
  }

  get modelMatrix(): mat3 {
    return Object2DGetModelMatrix(this);
  }

  get worldMatrix(): mat3 {
    return Object2DGetWorldMatrix(this);
  }

  get parent(): IObject2DGroup<IObject2D> | null {
    return Object2DGetParent(this);
  }

  set parent(value: IObject2DGroup<IObject2D> | null) {
    Object2DSetParent(this, value);
  }

  updateWorldMatrix(force?: boolean): boolean {
    return Object2DUpdateWorldMatrix(this, force);
  }

  cloneAsOptions(override?: IObject2DOptions): Required<IObject2DOptions> {
    return {
      modelMatrix: CloneProperty<'modelMatrix', mat3>(this, override, 'modelMatrix', mat3.clone),
    };
  }

  clone(override?: IObject2DOptions): IObject2D {
    return new Object2D(this.cloneAsOptions(override));
  }
}
