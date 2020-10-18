
export function eq(a: any, b: any): boolean {
  return Object.is(a, b)
    || (JSON.stringify(a) === JSON.stringify(b));
}

export function fails(cb: () => any | Promise<any>): Promise<boolean> {
  return new Promise<boolean>(resolve => resolve(cb()))
    .then(() => false, () => true);
}


export function assert(cb: () => boolean | Promise<boolean>, message: string = cb.toString()): Promise<void> {
  return new Promise<boolean>(resolve => resolve(cb()))
    .then((result: boolean) => {
      if (!result) {
        throw new Error(`Assert failed: ${ message }`);
      }
    });
}

export function assertFails(cb: () => any | Promise<any>, message: string = cb.toString()): Promise<void> {
  return assert(() => fails(cb), `expected to fail - ${ message }`);
}
