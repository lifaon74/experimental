import { EXECUTION_CONTEXT } from '../context';
import { globalThis } from '../globalThis';
import { ICrypto } from './interface';

function AllObjectKeys(obj: any): Map<string, any> {
  const entries: Map<string, any> = new Map<string, any>();
  while ((obj !== null) && (obj !== Object.prototype)) {
    for (const key of Object.getOwnPropertyNames(obj)) {
      if (!entries.has(key)) {
        entries.set(key, obj[key]);
      }
    }
    obj = Object.getPrototypeOf(obj);
  }
  return entries;
}

function loadNodeJSCrypto(): ICrypto {
  const crypto: Crypto = new (require('node-webcrypto-ossl').Crypto)();
  return {
    crypto: crypto,
    Crypto: crypto.constructor as any,
    SubtleCrypto: crypto.subtle.constructor as any,
    CryptoKey: require('webcrypto-core/build/webcrypto-core.js').CryptoKey,
  };
}

function loadCrypto(): ICrypto {
  switch (EXECUTION_CONTEXT) {
    case 'nodejs':
      return loadNodeJSCrypto();
    case 'browser':
      return {
        crypto: globalThis.crypto,
        Crypto: globalThis.Crypto,
        SubtleCrypto: globalThis.SubtleCrypto,
        CryptoKey: globalThis.CryptoKey,
      };
    default:
      throw new Error(`Unknown execution context`);
  }
}

const $exports = loadCrypto();

export const crypto = $exports.crypto;
export const Crypto = $exports.Crypto;
export const SubtleCrypto = $exports.SubtleCrypto;
export const CryptoKey = $exports.CryptoKey;

export function saveGlobalCrypto() {
  Object.assign(globalThis, $exports);
}


