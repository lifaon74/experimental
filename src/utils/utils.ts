export * from './base64/implementation';
export * from './globalThis';
export { EXECUTION_CONTEXT } from './context';
import { saveGlobalBase64 } from './base64/implementation';
import { saveGlobalThis } from './globalThis';

export function saveGlobal() {
  saveGlobalBase64();
  saveGlobalThis();
}

