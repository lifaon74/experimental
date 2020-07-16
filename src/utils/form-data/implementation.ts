import { EXECUTION_CONTEXT } from '../context';
import { globalThis } from '../globalThis';
import { FormDataConstructor } from './interfaces';


function loadFormData(): FormDataConstructor {
  switch (EXECUTION_CONTEXT) {
    case 'nodejs':
      // return require('form-data');
      return require('formdata-node');
    case 'browser':
      return globalThis.FormData;
    default:
      throw new Error(`Unknown execution context`);
  }
}

export const FormData = loadFormData();

export function saveGlobalFormData() {
  globalThis.FormData = FormData;
}
