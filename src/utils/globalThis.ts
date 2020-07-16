declare const __magic__: any;

// https://mathiasbynens.be/notes/globalthis
export const globalThis: any = (function () {
  Object.defineProperty(Object.prototype, '__magic__', {
    get: function () {
      return this;
    },
    configurable: true // This makes it possible to `delete` the getter later.
  });
  const globalThis = __magic__;
  delete Object.prototype['__magic__'];
  return globalThis;
}());

export function saveGlobalThis() {
  (globalThis as any).globalThis = globalThis;
}
