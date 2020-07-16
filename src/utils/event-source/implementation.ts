import { EXECUTION_CONTEXT } from '../context';
import { globalThis } from '../globalThis';
import { EventSourceConstructor } from './interfaces';


function loadEventSource(): EventSourceConstructor {
  switch (EXECUTION_CONTEXT) {
    case 'nodejs':
      return require('eventsource');
    case 'browser':
      return globalThis.EventSource;
    default:
      throw new Error(`Unknown execution context`);
  }
}

export const EventSource = loadEventSource();

export function saveGlobalEventSource() {
  globalThis.EventSource = EventSource;
}
