import { IObjects2DTransformer } from './interfaces';
import { IObject2D } from '../object-2d/interfaces';

/** PRIVATES **/

export const OBJECTS_2D_TRANSFORMER_PRIVATE = Symbol('objects-2d-transformer-private');

export interface IObjects2DTransformerPrivate<TObjects extends IObject2D> {
  objects: ReadonlyArray<TObjects>;
}

export interface IObjects2DTransformerPrivatesInternal<TObjects extends IObject2D> {
  [OBJECTS_2D_TRANSFORMER_PRIVATE]: IObjects2DTransformerPrivate<TObjects>;
}

export interface IObjects2DTransformerInternal<TObjects extends IObject2D> extends IObjects2DTransformerPrivatesInternal<TObjects>, IObjects2DTransformer<TObjects> {
}

