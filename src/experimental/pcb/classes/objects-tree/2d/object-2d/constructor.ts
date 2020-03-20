import { mat3 } from 'gl-matrix';
import { IObject2D, IObject2DOptions } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../../../misc/helpers/ClassWithPrivateMembers';
import { IObject2DInternal, IObject2DPrivate, OBJECT_2D_PRIVATE } from './privates';
import { IsObject } from '../../../../../../misc/helpers/is/is-object';

/** CONSTRUCTOR **/

export function ConstructObject2D(
  instance: IObject2D,
  options: IObject2DOptions = {},
  shallow: boolean = !IsObject2D(options)
): void {
  ConstructClassWithPrivateMembers(instance, OBJECT_2D_PRIVATE);
  const privates: IObject2DPrivate = (instance as IObject2DInternal)[OBJECT_2D_PRIVATE];
  if (IsObject(options)) {
    privates.modelMatrix = (options.modelMatrix === void 0)
      ? mat3.create()
      : (
        shallow
          ? options.modelMatrix
          : mat3.clone(options.modelMatrix)
      );
    privates.worldMatrix = mat3.clone(privates.modelMatrix);
    instance.worldMatrixNeedsUpdate = false;

    privates.parent = null;
  } else {
    throw new TypeError(`Expected object or void as Object2D.options`);
  }
}

export function IsObject2D(value: any): value is IObject2D {
  return IsObject(value)
    && value.hasOwnProperty(OBJECT_2D_PRIVATE as symbol);
}

