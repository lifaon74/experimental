import { Event } from './Event';
import { IEvents } from '../interface';
import { ConstructClassWithPrivateMembers } from '@lifaon/class-factory';
import { IsObject } from '../../../misc/helpers/is/IsObject';

type IProgressEvent = InstanceType<IEvents['ProgressEvent']>;

export const PROGRESS_EVENT_PRIVATE = Symbol('progress-event-private');

export interface IProgressEventPrivate {
  lengthComputable: boolean;
  loaded: number;
  total: number;
}

export interface IProgressEventInternal extends IProgressEvent {
  [PROGRESS_EVENT_PRIVATE]: IProgressEventPrivate;
}

export function ConstructProgressEvent(
  instance: IProgressEvent,
  init: ProgressEventInit = {}
): void {
  ConstructClassWithPrivateMembers(instance, PROGRESS_EVENT_PRIVATE);
  const privates: IProgressEventPrivate = (instance as IProgressEventInternal)[PROGRESS_EVENT_PRIVATE];

  if (IsObject(init)) {
    privates.lengthComputable = Boolean(init.lengthComputable);
    privates.loaded = (init.loaded === void 0) ? 0 : init.loaded;
    privates.total = (init.total === void 0) ? 0 : init.total;
  } else {
    throw new TypeError(`Expected object or void as init`);
  }
}


export class ProgressEvent extends Event {
  constructor(type: string, init?: ProgressEventInit) {
    super(type, init);
    ConstructProgressEvent(this, init);
  }

  get lengthComputable(): boolean {
    return ((this as unknown) as IProgressEventInternal)[PROGRESS_EVENT_PRIVATE].lengthComputable;
  }

  get loaded(): number {
    return ((this as unknown) as IProgressEventInternal)[PROGRESS_EVENT_PRIVATE].loaded;
  }

  get total(): number {
    return ((this as unknown) as IProgressEventInternal)[PROGRESS_EVENT_PRIVATE].total;
  }
}
