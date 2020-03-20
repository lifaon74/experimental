import { IObject2D } from '../object-2d/interfaces';
import { IObject2DGroup, TObject2DOrObject2DGroup } from './interfaces';

/** PRIVATES **/


export const OBJECT_2D_GROUP_PRIVATE = Symbol('object-2d-group-private');

export interface IObject2DGroupPrivate<TChild extends IObject2D> {
  children: TObject2DOrObject2DGroup<TChild>[];
}

export interface IObject2DGroupPrivatesInternal<TChild extends IObject2D> {
  [OBJECT_2D_GROUP_PRIVATE]: IObject2DGroupPrivate<TChild>;
}

export interface IObject2DGroupInternal<TChild extends IObject2D> extends IObject2DGroupPrivatesInternal<TChild>, IObject2DGroup<TChild> {
}

