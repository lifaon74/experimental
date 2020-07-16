import { EXECUTION_CONTEXT } from '../context';
import { globalThis } from '../globalThis';
import { IEvents } from './interface';
import { EventTarget as NodeJSEventTarget } from './node-js/EventTarget';
import { Event as NodeJSEvent } from './node-js/Event';
import { CustomEvent as NodeJSCustomEvent } from './node-js/CustomEvent';
import { ProgressEvent as NodeJSCProgressEvent } from './node-js/ProgressEvent';


function loadEvents(): IEvents {
  switch (EXECUTION_CONTEXT) {
    case 'nodejs':
      return {
        EventTarget: NodeJSEventTarget,
        Event: NodeJSEvent,
        CustomEvent: NodeJSCustomEvent,
        ProgressEvent: NodeJSCProgressEvent,
      };
    case 'browser':
      return {
        EventTarget: globalThis.EventTarget,
        Event: globalThis.Event,
        CustomEvent: globalThis.CustomEvent,
        ProgressEvent: globalThis.ProgressEvent,
      };
    default:
      throw new Error(`Unknown execution context`);
  }
}

const $exports = loadEvents();

export const EventTarget = $exports.EventTarget;
export const Event = $exports.Event;
export const CustomEvent = $exports.CustomEvent;
export const ProgressEvent = $exports.ProgressEvent;

export function saveGlobalEvent() {
  Object.assign(globalThis, $exports);
}
