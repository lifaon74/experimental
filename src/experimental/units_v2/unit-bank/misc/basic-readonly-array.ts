export interface IBasicReadonlyArray<G> {
  readonly length: number;

  item(index: number): G;

  [Symbol.iterator](): IterableIterator<G>;
}

export class BasicReadonlyArray<G> implements IBasicReadonlyArray<G> {
  protected _items: G[];

  constructor(items: Iterable<G>) {
    this._items = Array.isArray(items)
      ? items
      : Array.from(items);
  }

  get length(): number {
    return this._items.length;
  }

  item(index: number): G {
    if ((0 <= index) && (index < this._items.length)) {
      return this._items[index];
    } else {
      throw new RangeError(`Index out of range`);
    }
  }

  [Symbol.iterator]() {
    return this._items[Symbol.iterator]();
  }
}
