import { IEvents } from '../interface';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { ConstructClassWithPrivateMembers } from '@lifaon/class-factory';

type IEvent = InstanceType<IEvents['Event']>;
type IEventTarget = InstanceType<IEvents['EventTarget']>;


export const EVENT_PRIVATE = Symbol('event-private');

export interface IEventPrivate {
  type: string;
  target: EventTarget | null;
  timeStamp: number;
  prevented: boolean;

  bubbles: boolean;
  cancelable: boolean;
  composed: boolean;
}

export interface IEventInternal extends IEvent {
  [EVENT_PRIVATE]: IEventPrivate;
}

export function ConstructEvent(
  instance: IEvent,
  type: string,
  init: EventInit = {}
): void {
  ConstructClassWithPrivateMembers(instance, EVENT_PRIVATE);
  const privates: IEventPrivate = (instance as IEventInternal)[EVENT_PRIVATE];

  if (IsObject(init)) {

    privates.type = type;
    privates.target = null;
    privates.timeStamp = Date.now();
    privates.prevented = false;

    privates.bubbles = Boolean(init.bubbles);
    privates.cancelable = Boolean(init.cancelable);
    privates.composed = Boolean(init.composed);
  } else {
    throw new TypeError(`Expected object or void as init`);
  }
}


export function EventPreventDefault(
  instance: IEvent,
): void {
  const privates: IEventPrivate = (instance as IEventInternal)[EVENT_PRIVATE];
  privates.prevented = true;
}


// https://dom.spec.whatwg.org/#event TODO
export class Event implements IEvent {
  static get NONE(): number {
    return 0;
  }

  static get CAPTURING_PHASE(): number {
    return 1;
  }

  static get AT_TARGET(): number {
    return 2;
  }

  static get BUBBLING_PHASE(): number {
    return 3;
  }

  cancelBubble: boolean;
  returnValue: boolean;

  constructor(type: string, init?: EventInit) {
    ConstructEvent(this, type, init);
    this.cancelBubble = false;
    this.returnValue = false;
  }

  get type(): string {
    return ((this as unknown) as IEventInternal)[EVENT_PRIVATE].type;
  }

  get target(): IEventTarget | null {
    return ((this as unknown) as IEventInternal)[EVENT_PRIVATE].target;
  }


  get NONE(): number {
    return Event.NONE;
  }

  get CAPTURING_PHASE(): number {
    return Event.CAPTURING_PHASE;
  }

  get AT_TARGET(): number {
    return Event.AT_TARGET;
  }

  get BUBBLING_PHASE(): number {
    return Event.BUBBLING_PHASE;
  }

  get bubbles(): boolean {
    return ((this as unknown) as IEventInternal)[EVENT_PRIVATE].bubbles;
  }

  get cancelable(): boolean {
    return ((this as unknown) as IEventInternal)[EVENT_PRIVATE].cancelable;
  }

  get composed(): boolean {
    return ((this as unknown) as IEventInternal)[EVENT_PRIVATE].composed;
  }

  get defaultPrevented(): boolean {
    throw new Error('Event.defaultPrevented not implemented');
  }


  get timeStamp(): number {
    return ((this as unknown) as IEventInternal)[EVENT_PRIVATE].timeStamp;
  }

  get isTrusted(): boolean {
    throw new Error('Event.isTrusted not implemented');
  }

  get currentTarget(): IEventTarget | null {
    throw new Error('Event.currentTarget not implemented');
  }

  get eventPhase(): number {
    throw new Error('Event.eventPhase not implemented');
  }

  get srcElement(): EventTarget | null {
    throw new Error('Event.srcElement not implemented');
  }

  initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {
    throw new Error('Event.initEvent not implemented');
  }

  stopPropagation(): void {
    throw new Error('Event.stopPropagation not implemented');
  }

  stopImmediatePropagation(): void {
    throw new Error('Event.stopPropagation not implemented');
  }

  preventDefault(): void {
    EventPreventDefault(this);
  }

  composedPath(): IEventTarget[] {
    throw new Error('Event.composedPath not implemented');
  }
}




