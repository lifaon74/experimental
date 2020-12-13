// import { testUnit } from './experimental/units/unit';
// import { debugPCB } from './experimental/pcb/debug';
// import { debugBigInt } from './experimental/bigint/debug';
// import { debugUnitV2 } from './experimental/units_v2/debug';
// import { debugVoxel } from './experimental/voxel/debug-voxel';
import { debugAdvancedCSS } from './experimental/advanced-css/debug-advanced-css';

export async function run() {
  // await debugVoxel();
  await debugAdvancedCSS();
  // await debugPCB();
  // await debugBigInt();
  // await debugUnitV2();
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





