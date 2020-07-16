import { IEvents } from '../interface';
import { EVENT_PRIVATE, IEventInternal, IEventPrivate } from './Event';
import { ConstructClassWithPrivateMembers } from '@lifaon/class-factory';
import { IsObject } from '../../../misc/helpers/is/IsObject';

type IEvent = InstanceType<IEvents['Event']>;
type IEventTarget = InstanceType<IEvents['EventTarget']>;

// https://dom.spec.whatwg.org/#eventtarget
// export type EventListenerCallback = (event: Event) => void;

// export interface EventListenerStructure {
//   handleEvent: EventListenerCallback;
// }

/**
 * Normalized structure of arguments provided by addEventListener and removeEventListener
 */
interface IEventListenerEntry {
  type: string;
  callback: EventListener | null;
  capture: boolean;
  passive: boolean;
  once: boolean;
}

/**
 * Represents an entry in an array of EventListenerEntry
 */
interface IEventListenerEntryPosition {
  index: number;
  array: IEventListenerEntry[];
}


// export type EventListener = EventListenerCallback | EventListenerStructure;
//
// export interface EventListenerOptions {
//   capture?: boolean;
// }
//
// export interface AddEventListenerOptions extends EventListenerOptions {
//   passive?: boolean;
//   once?: boolean;
// }


export const EVENT_TARGET_PRIVATE = Symbol('event-target-private');

export interface IEventTargetPrivate {
  eventListeners: Map<string, IEventListenerEntry[]>;
}

export interface IEventTargetInternal extends IEventTarget {
  [EVENT_TARGET_PRIVATE]: IEventTargetPrivate;
}

export function ConstructEventTarget(
  instance: IEventTarget,
): void {
  ConstructClassWithPrivateMembers(instance, EVENT_TARGET_PRIVATE);
  const privates: IEventTargetPrivate = (instance as IEventTargetInternal)[EVENT_TARGET_PRIVATE];
  privates.eventListeners = new Map<string, IEventListenerEntry[]>();
}

export function EventTargetAddEventListener(
  instance: IEventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject | null,
  options?: boolean | AddEventListenerOptions,
): void {
  EventTargetAppendEventListenerEntry(instance, EventTargetBuildEventListenerEntry(type, listener, options));
}


export function EventTargetRemoveEventListener(
  instance: IEventTarget,
  type: string,
  callback: EventListenerOrEventListenerObject | null,
  options?: EventListenerOptions | boolean
): void {
  EventTargetRemoveEventListenerEntry(instance, EventTargetBuildEventListenerEntry(type, callback, options));
}

export function EventTargetDispatchEvent(instance: IEventTarget, event: IEvent): boolean {
  const eventPrivates: IEventPrivate = (event as IEventInternal)[EVENT_PRIVATE];

  if (eventPrivates.target === null) {
    eventPrivates.target = instance;
  } else {
    throw new Error(`Event has already been dispatched`);
  }

  const privates: IEventTargetPrivate = (instance as IEventTargetInternal)[EVENT_TARGET_PRIVATE];
  const entries: IEventListenerEntry[] | void = privates.eventListeners.get(event.type);
  if (entries !== void 0) {
    let entry: IEventListenerEntry;
    for (let i = 0; i < entries.length; i++) {
      entry = entries[i];
      if (entry.callback !== null) {
        entry.callback(event);
      }
      if (entry.once) {
        entries.splice(i, 1);
        i--;
      }
    }
  }

  return !eventPrivates.prevented;
}


/**
 * Normalizes the list of arguments provided in addEventListener and removeEventListener
 */
function EventTargetBuildEventListenerEntry(
  type: string,
  listener: EventListenerOrEventListenerObject | null,
  options: boolean | AddEventListenerOptions = false
): IEventListenerEntry {
  const entry: IEventListenerEntry = {} as any;
  entry.type = String(type);

  if (listener === null) {
    entry.callback = null;
  } else if (typeof listener === 'object') {
    if (typeof (listener as EventListenerObject).handleEvent === 'function') {
      entry.callback = (listener as EventListenerObject).handleEvent;
    } else {
      throw new TypeError(`EventListenerObject.handleEvent must be a function`);
    }
  } else {
    if (typeof listener === 'function') {
      entry.callback = listener;
    } else {
      throw new TypeError(`listener must be a function`);
    }
  }

  if (typeof options === 'boolean') {
    entry.capture = options;
    entry.passive = false;
    entry.once = false;
  } else if (IsObject(options)) {
    entry.capture = (options.capture === void 0) ? false : Boolean(entry.capture);
    entry.passive = (options.passive === void 0) ? false : Boolean(entry.passive);
    entry.once = (options.once === void 0) ? false : Boolean(entry.once);
  } else {
    throw new TypeError(`Expected boolean or object as options`);
  }

  return entry;
}

/**
 * Searches for a similar entry in th registered event's listeners
 */
function EventTargetFindEventListenerEntry(
  instance: IEventTarget,
  eventListenerEntry: IEventListenerEntry
): IEventListenerEntryPosition | null {
  const privates: IEventTargetPrivate = (instance as IEventTargetInternal)[EVENT_TARGET_PRIVATE];
  const entries: IEventListenerEntry[] | undefined = privates.eventListeners.get(eventListenerEntry.type);
  if (entries !== void 0) {
    let entry: IEventListenerEntry;
    for (let i = 0, l = entries.length; i < l; i++) {
      entry = entries[i];
      if (
        (entry.callback === eventListenerEntry.callback)
        && (entry.capture === eventListenerEntry.capture)
      ) {
        return {
          index: i,
          array: entries,
        };
      }
    }
  }
  return null;
}

/**
 * Registers an event's listener
 */
function EventTargetAppendEventListenerEntry(
  instance: IEventTarget,
  eventListenerEntry: IEventListenerEntry
): void {
  const privates: IEventTargetPrivate = (instance as IEventTargetInternal)[EVENT_TARGET_PRIVATE];
  const eventListenerEntryPosition: IEventListenerEntryPosition | null = EventTargetFindEventListenerEntry(instance, eventListenerEntry);
  if (eventListenerEntryPosition === null) { // new entry
    if (!privates.eventListeners.has(eventListenerEntry.type)) {
      privates.eventListeners.set(eventListenerEntry.type, []);
    }
    (privates.eventListeners.get(eventListenerEntry.type) as IEventListenerEntry[]).push(eventListenerEntry);
  }
}

/**
 * Unregisters an event's listener
 */
function EventTargetRemoveEventListenerEntry(
  instance: IEventTarget,
  eventListenerEntry: IEventListenerEntry
): void {
  const privates: IEventTargetPrivate = (instance as IEventTargetInternal)[EVENT_TARGET_PRIVATE];
  const eventListenerEntryPosition: IEventListenerEntryPosition | null = EventTargetFindEventListenerEntry(instance, eventListenerEntry);
  if (eventListenerEntryPosition !== null) { // entry exists
    eventListenerEntryPosition.array.splice(eventListenerEntryPosition.index, 1);
    if (eventListenerEntryPosition.array.length === 0) {
      privates.eventListeners.delete(eventListenerEntry.type);
    }
  }
}


export class EventTarget implements IEventTarget {
  constructor() {
    ConstructEventTarget(this);
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
    return EventTargetAddEventListener(this, type, listener, options);
  }

  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void {
    return EventTargetRemoveEventListener(this, type, callback, options);
  }

  dispatchEvent(event: IEvent): boolean {
    return EventTargetDispatchEvent(this, event);
  }
}

