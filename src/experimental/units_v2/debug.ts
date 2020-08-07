import { debugUnitV3 } from './unit_v3';
import { debugUnitBank } from './unit-bank/unit-bank';
import { debugAxiom } from './axiom';

export async function debugUnitV2() {
  // await debugUnitV3();
  // await debugUnitBank();
  await debugAxiom();
}
