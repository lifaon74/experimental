import { IObject2DGroup, IObject2DGroupOptions, TObject2DOrObject2DGroup } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../../../misc/helpers/ClassWithPrivateMembers';
import { IObject2DGroupInternal, IObject2DGroupPrivate, OBJECT_2D_GROUP_PRIVATE } from './privates';
import { IsObject } from '../../../../../../misc/helpers/is/is-object';
import { IObject2D } from '../object-2d/interfaces';

/** CONSTRUCTOR **/

export function ConstructObject2DGroup<TChild extends IObject2D>(
  instance: IObject2DGroup<TChild>,
  options: IObject2DGroupOptions<TChild> = {},
): void {
  ConstructClassWithPrivateMembers(instance, OBJECT_2D_GROUP_PRIVATE);
  const privates: IObject2DGroupPrivate<TChild> = (instance as IObject2DGroupInternal<TChild>)[OBJECT_2D_GROUP_PRIVATE];
  if (IsObject(options)) {
    privates.children = [];

    if (options.children !== void 0) {
      instance.add(...Array.from<TObject2DOrObject2DGroup<TChild>>(options.children));
    }
  } else {
    throw new TypeError(`Expected object or void as Object2DGroup.options`);
  }
}

export function IsObject2DGroup<TChild extends IObject2D = IObject2D>(value: any): value is IObject2DGroup<TChild> {
  return IsObject(value)
    && value.hasOwnProperty(OBJECT_2D_GROUP_PRIVATE as symbol);
}

