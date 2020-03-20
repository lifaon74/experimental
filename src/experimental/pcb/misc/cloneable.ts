import { IsObject } from '../../../misc/helpers/is/is-object';
//
// export interface ICloneable<TOptions extends object> {
//   clone(override?: TOptions): this;
// }
//
// export interface ICloneableByOptions<TOptions extends object> {
//   cloneAsOptions(override?: TOptions): TOptions;
// }
//
// export interface ICloneableByConstructor<TInstance extends ICloneableByOptions<any>> {
//   new(options: Partial<TInstance>/*, ...args: any[]*/): TInstance;
// }
//
// // export function AutoCloneOptions<TInstance extends object>(instance: TInstance, properties: keyof TInstance = Object.keys(instance) as unknown as keyof TInstance): TInstance {
// //   return new (instance.constructor as TClass)(instance.cloneOptions({
// //
// //   }));
// // }
//
// // export function AutoClone<TInstance extends object>(instance: TInstance): TInstance {
// //   if (Array.isArray(instance)) {
// //
// //   }
// // }
//
//
// export function AutoClone<TClass extends ICloneableByConstructor<any>>(instance: InstanceType<TClass>, override?: Partial<InstanceType<TClass>>): InstanceType<TClass> {
//   return new (instance.constructor as TClass)(instance.cloneOptions(override));
// }
//
// export interface ISuperCloneable<TOptions extends object> extends ICloneable<TOptions>, ICloneableByOptions<TOptions> {
// }
//
// export function Cloneable<TBase extends Constructor, TOptions extends Record<keyof InstanceType<TBase>, any>>(baseClass: TBase) {
//   return class extends baseClass implements ISuperCloneable<TOptions> {
//     constructor(...args: any[]) {
//       super(...args);
//     }
//
//     cloneAsOptions(override?: TOptions): TOptions {
//       return {
//         ...this as TOptions
//       };
//       // throw new Error(`Missing cloneOptions implementation`);
//     }
//
//     clone(override?: TOptions): this {
//       return new (this.constructor as any)(this.cloneAsOptions(override)) as this;
//     }
//   };
// }
//
//
// export class StaticCloneable<TOptions extends object> {
//   cloneAsOptions(override?: TOptions): this {
//     return {
//       ...this,
//       ...override,
//     };
//   }
//
//   clone(override?: TOptions): this {
//     return new (this.constructor as any)(this.cloneAsOptions(override)) as this;
//   }
// }
//

export function DefaultCloneCallback<TValue>(value: TValue): TValue {
  if (IsObject(value)) {
    if (typeof value['clone'] === 'function') {
      return value['clone']();
    } else {
      throw new Error(`Missing clone function`);
    }
  } else {
    return value;
  }
}

export function CloneProperty<TKey extends string, TInstanceValue, TOverrideValue = TInstanceValue>(
  instance: Record<TKey, TInstanceValue>,
  override: Partial<Record<TKey, TOverrideValue>> | undefined,
  propertyKey: TKey,
  clone: (value: TInstanceValue) => TOverrideValue = DefaultCloneCallback as any
): TOverrideValue {
  return ((override === void 0) || (override[propertyKey] === void 0))
    ? clone(instance[propertyKey])
    : override[propertyKey] as TOverrideValue;
}

export function CloneArrayProperty<TKey extends string, TItem>(
  instance: Record<TKey, Pick<ReadonlyArray<TItem>, 'map'>>,
  override: Partial<Record<TKey, Iterable<TItem>>> | undefined,
  propertyKey: TKey,
  clone: (value: TItem) => TItem = DefaultCloneCallback as any
): Iterable<TItem> {
  return CloneProperty<TKey, Pick<ReadonlyArray<TItem>, 'map'>, Iterable<TItem>>(instance, override, propertyKey, (items: Pick<ReadonlyArray<TItem>, 'map'>) => {
    return items.map((item: TItem) => {
      return clone(item);
    });
  });
}
