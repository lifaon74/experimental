import { EXECUTION_CONTEXT } from '../context';
import { IFetch } from './interface';
import { globalThis } from '../globalThis';


function loadFetch(): IFetch {
  switch (EXECUTION_CONTEXT) {
    case 'nodejs':
      const $fetch = require('node-fetch');
      return {
        fetch: $fetch,
        Headers: $fetch.Headers,
        Request: $fetch.Request,
        Response: $fetch.Response,
      };
    case 'browser':
      return {
        fetch: globalThis.fetch,
        Headers: globalThis.Headers,
        Request: globalThis.Request,
        Response: globalThis.Response,
      };
    default:
      throw new Error(`Unknown execution context`);
  }
}

const $exports = loadFetch();

export const fetch = $exports.fetch;
export const Headers = $exports.Headers;
export const Request = $exports.Request;
export const Response = $exports.Response;


export function saveGlobalFetch() {
  Object.assign(globalThis, $exports);
}
