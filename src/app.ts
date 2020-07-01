import { testUnit } from './experimental/units/unit';
import { debugPCB } from './experimental/pcb/debug';
import { debugBigInt } from './experimental/bigint/debug';

export async function run() {
  // await debugPCB();
  await debugBigInt();
}

export function start(mainCallBack: () => (Promise<any> | any)) {
  const ENVIRONMENT: 'browser' | 'nodejs' = ('window' in globalThis) ? 'browser' : 'nodejs';

  const run = () => {
    return new Promise<void>(resolve => resolve(mainCallBack()))
      .catch((error: any) => {
        switch (ENVIRONMENT) {
          case 'nodejs':
            if ('process' in globalThis) {
              (globalThis as any).process.stdout.write('\x1b[31m');
            }
            console.log(
              `[ERROR]`,
              (typeof error.toJSON === 'function')
                ? error.toJSON()
                : error
            );
            if ('process' in globalThis) {
              (globalThis as any).process.stdout.write('\x1b[0m');
            }
            break;
          case 'browser':
            console.error(error);
            break;
        }
      });
  };

  switch (ENVIRONMENT) {
    case 'browser':
      window.onload = run;
      break;
    case 'nodejs':
      run();
      break;
  }
}

start(run);





