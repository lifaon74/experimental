import { EXECUTION_CONTEXT } from '../context';
import { globalThis } from '../globalThis';
import { IBase64 } from './interface';


function loadBase64(): IBase64 {
  switch (EXECUTION_CONTEXT) {
    case 'nodejs':
      return {
        atob(encodedString: string): string {
          return Buffer.from(encodedString, 'base64').toString();
        },
        btoa(rawString: string): string {
          return Buffer.from(rawString).toString('base64');
        }
      };
    case 'browser':
      return {
        atob: globalThis.atob.bind(globalThis),
        btoa: globalThis.btoa.bind(globalThis),
      };
    default:
      throw new Error(`Unknown execution context`);
  }
}

const $exports = loadBase64();

export const atob = $exports.atob;
export const btoa = $exports.btoa;

export function saveGlobalBase64() {
  Object.assign(globalThis, $exports);
}

