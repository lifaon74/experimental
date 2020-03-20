import { IObjects2DTransformer } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../../../misc/helpers/ClassWithPrivateMembers';
import {
  IObjects2DTransformerInternal, IObjects2DTransformerPrivate, OBJECTS_2D_TRANSFORMER_PRIVATE
} from './privates';
import { IsObject } from '../../../../../../misc/helpers/is/is-object';
import { IObject2D } from '../object-2d/interfaces';
import { IsObject2D } from '../object-2d/constructor';

/** CONSTRUCTOR **/

export function ConstructObjects2DTransformer<TObjects extends IObject2D>(
  instance: IObjects2DTransformer<TObjects>,
  objects: Iterable<TObjects>,
): void {
  ConstructClassWithPrivateMembers(instance, OBJECTS_2D_TRANSFORMER_PRIVATE);
  const privates: IObjects2DTransformerPrivate<TObjects> = (instance as IObjects2DTransformerInternal<TObjects>)[OBJECTS_2D_TRANSFORMER_PRIVATE];
  privates.objects = Object.freeze(Array.from(objects));
  const length: number = privates.objects.length;

  if (length < 1) {
    throw new TypeError(`Expected at lest one Object2D in objects`);
  } else {
    for (let i = 0; i < length; i++) {
      if (!IsObject2D(privates.objects[i])) {
        throw new TypeError(`Expected Object2D at index ${ i } of Objects2DTransformer.objects`);
      }
    }
  }
}

export function IsObjects2DTransformer<TObjects extends IObject2D>(value: any): value is IObjects2DTransformer<TObjects> {
  return IsObject(value)
    && value.hasOwnProperty(OBJECTS_2D_TRANSFORMER_PRIVATE as symbol);
}

