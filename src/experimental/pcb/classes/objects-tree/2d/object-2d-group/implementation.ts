import { IObject2DGroup, IObject2DGroupOptions, TObject2DOrObject2DGroup } from './interfaces';
import { ConstructObject2DGroup } from './constructor';
import { IObject2DGroupInternal, IObject2DGroupPrivate, OBJECT_2D_GROUP_PRIVATE } from './privates';
import { IObject2D } from '../object-2d/interfaces';
import { Object2D, Object2DUpdateWorldMatrix } from '../object-2d/implementation';
import { CloneArrayProperty } from '../../../../misc/cloneable';

/** METHODS **/

/* GETTERS/SETTERS */

export function Object2DGroupGetChildren<TChild extends IObject2D>(instance: IObject2DGroup<TChild>): ReadonlyArray<TObject2DOrObject2DGroup<TChild>> {
  return (instance as IObject2DGroupInternal<TChild>)[OBJECT_2D_GROUP_PRIVATE].children;
}


/* METHODS */

export function Object2DGroupUpdateWorldMatrix<TChild extends IObject2D>(instance: IObject2DGroup<TChild>, force?: boolean): boolean {
  if (Object2DUpdateWorldMatrix(instance, force)) {
    const privates: IObject2DGroupPrivate<TChild> = (instance as IObject2DGroupInternal<TChild>)[OBJECT_2D_GROUP_PRIVATE];
    for (let i = 0, l = privates.children.length; i < l; i++) {
      privates.children[i].updateWorldMatrix(true);
    }
    return true;
  } else {
    return false;
  }
}

export function Object2DGroupAdd<TChild extends IObject2D>(instance: IObject2DGroup<TChild>, children: TObject2DOrObject2DGroup<TChild>[]): void {
  for (let i = 0, l = children.length; i < l; i++) {
    children[i].parent = instance;
  }
}

export function Object2DGroupRemove<TChild extends IObject2D>(instance: IObject2DGroup<TChild>, children: TObject2DOrObject2DGroup<TChild>[]): void {
  let child: TObject2DOrObject2DGroup<TChild>;
  for (let i = 0, l = children.length; i < l; i++) {
    child = children[i];
    if (child.parent === instance) {
      child.parent = null;
    } else {
      throw new Error(`Object at index ${ i } is not a child of this.`);
    }
  }
}

// export function Object2DGroupForEachChildren<TChild extends IObject2D>(instance: IObject2DGroup<TChild>, callback: TObject2DGroupForEachChildrenCallback<TChild>): void {
//   const children: TObject2DOrObject2DGroup<TChild>[] = (instance as IObject2DGroupInternal<TChild>)[OBJECT_2D_GROUP_PRIVATE].children;
//   let child: TObject2DOrObject2DGroup<TChild>;
//   for (let i = 0, l = children.length; i < l; i++) {
//     child = children[i];
//     callback(child);
//     if (IsObject2DGroup<TChild>(child)) {
//       Object2DGroupForEachChildren<TChild>(child, callback);
//     }
//   }
// }
//
// export function Object2DGroupSearchChildren<TChild extends IObject2D, T extends TChild>(instance: IObject2DGroup<TChild>, predicate: TObject2DGroupSearchChildrenCallback<TChild, T>): T[] {
//   const objects: T[] = [];
//   Object2DGroupForEachChildren<TChild>(instance, (child: IObject2D) => {
//     if (predicate(child)) {
//       objects.push(child as T);
//     }
//   });
//   return objects;
// }


/** CLASS **/

export class Object2DGroup<TChild extends IObject2D> extends Object2D implements IObject2DGroup<TChild> {

  constructor(options?: IObject2DGroupOptions<TChild>, shallow?: boolean) {
    super(options, shallow);
    ConstructObject2DGroup<TChild>(this, options);
  }

  get children(): ReadonlyArray<TObject2DOrObject2DGroup<TChild>> {
    return Object2DGroupGetChildren<TChild>(this);
  }

  updateWorldMatrix(force?: boolean): boolean {
    return Object2DGroupUpdateWorldMatrix<TChild>(this, force);
  }


  add(...children: TObject2DOrObject2DGroup<TChild>[]): this {
    Object2DGroupAdd<TChild>(this, children);
    return this;
  }

  remove(...children: TObject2DOrObject2DGroup<TChild>[]): this {
    Object2DGroupRemove<TChild>(this, children);
    return this;
  }


  cloneAsOptions(override?: IObject2DGroupOptions<TChild>): Required<IObject2DGroupOptions<TChild>> {
    return {
      ...super.cloneAsOptions(override),
      children: CloneArrayProperty<'children', TObject2DOrObject2DGroup<TChild>>(this, override, 'children'),
    };
  }

  clone(override?: IObject2DGroupOptions<TChild>): IObject2DGroup<TChild> {
    return new Object2DGroup<TChild>(this.cloneAsOptions(override));
  }
}
