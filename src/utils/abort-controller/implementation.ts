import { EXECUTION_CONTEXT } from '../context';
import { globalThis } from '../globalThis';
import { IAbortController } from './interface';


function loadAbortController(): IAbortController {
  switch (EXECUTION_CONTEXT) {
    case 'nodejs':
      const $AbortController = require('abort-controller');
      return {
        AbortController: $AbortController.AbortController,
        AbortSignal: $AbortController.AbortSignal,
      };
    case 'browser':
      return {
        AbortController: globalThis.AbortController,
        AbortSignal: globalThis.AbortSignal,
      };
    default:
      throw new Error(`Unknown execution context`);
  }
}

const $exports = loadAbortController();

export const AbortController = $exports.AbortController;
export const AbortSignal = $exports.AbortSignal;

export function saveGlobalAbortController() {
  Object.assign(globalThis, $exports);
}

