import { Event } from './Event';
import { IEvents } from '../interface';
import { ConstructClassWithPrivateMembers } from '@lifaon/class-factory';
import { IsObject } from '../../../misc/helpers/is/IsObject';


type ICustomEvent<T> = InstanceType<IEvents['CustomEvent']>;

export const CUSTOM_EVENT_PRIVATE = Symbol('custom-event-private');

export interface ICustomEventPrivate<T> {
  detail: T;
}

export interface ICustomEventInternal<T> extends ICustomEvent<T> {
  [CUSTOM_EVENT_PRIVATE]: ICustomEventPrivate<T>;
}

export function ConstructCustomEvent<T>(
  instance: ICustomEvent<T>,
  init: CustomEventInit = {}
): void {
  ConstructClassWithPrivateMembers(instance, CUSTOM_EVENT_PRIVATE);
  const privates: ICustomEventPrivate<T> = (instance as ICustomEventInternal<T>)[CUSTOM_EVENT_PRIVATE];

  if (IsObject(init)) {
    privates.detail = init.detail;
  } else {
    throw new TypeError(`Expected object or void as init`);
  }
}

export class CustomEvent<T> extends Event implements ICustomEvent<T> {
  constructor(type: string, init?: CustomEventInit<T>) {
    super(type, init);
    ConstructCustomEvent<T>(this, init);
  }

  get detail(): T {
    return ((this as unknown) as ICustomEventInternal<T>)[CUSTOM_EVENT_PRIVATE].detail;
  }

  initCustomEvent(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, detailArg: T): void {
    throw new Error('CustomEvent.initEvent not implemented');
  }
}
