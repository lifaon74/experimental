import { IObject2D, IObject2DOptions } from '../object-2d/interfaces';

/** TYPES **/

export type TObject2DOrObject2DGroup<TChild extends IObject2D> = TChild | IObject2DGroup<TChild>;


export interface IObject2DGroupOptions<TChild extends IObject2D> extends IObject2DOptions {
  children?: Iterable<TObject2DOrObject2DGroup<TChild>>;
}

// export type TObject2DGroupForEachChildrenCallbackReturn =
//   'stop' // stops the exploration
//   | 'deep' // allowed to go deeper
//   | 'no-deep' // not-allowed to go deeper
//   | void // default to 'deep'
// ;

// export type TObject2DGroupForEachChildrenCallback<TChild extends IObject2D> = (child: IObject2D) => void;
// export type TObject2DGroupSearchChildrenCallback<TChild extends IObject2D, T extends TChild> = (child: IObject2D) => child is T;

/** INTERFACES **/


export interface IObject2DGroupConstructor {
  new<TChild extends IObject2D>(options?: IObject2DGroupOptions<TChild>, shallow?: boolean): IObject2DGroup<TChild>;
}

export interface IObject2DGroupTypedConstructor<TChild extends IObject2D> {
  new(options?: IObject2DGroupOptions<TChild>, shallow?: boolean): IObject2DGroup<TChild>;
}

/**
 * Represents a groups of Object2D.
 */
export interface IObject2DGroup<TChild extends IObject2D> extends IObject2D {
  readonly children: ReadonlyArray<TObject2DOrObject2DGroup<TChild>>;

  /**
   * Adds some children.
   */
  add(...children: TObject2DOrObject2DGroup<TChild>[]): this;

  /**
   * Removes some children.
   */
  remove(...children: TObject2DOrObject2DGroup<TChild>[]): this;

}

