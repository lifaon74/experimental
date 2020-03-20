import { Constructor } from '../../../../../classes/class-helpers/types';
import { BOM } from './bom';
import { CloneProperty } from '../../../misc/cloneable';

export interface IHasBOMOptions {
  bom?: BOM;
}

export interface IHasBOM {
  bom: BOM | undefined;
}

export function HasBOMFactory<TBase extends Constructor>(baseClass: TBase) {
  return class extends baseClass implements IHasBOM {
    public bom: BOM | undefined;

    constructor(...args: any[]) {
      const [options]: [IHasBOMOptions] = args[0];
      super(...args);
      this.bom = options.bom;
    }

    setBom(bom: BOM | undefined): this {
      this.bom = bom;
      return this;
    }

    cloneAsOptions(override?: IHasBOMOptions): Required<IHasBOMOptions> {
      const cloned: IHasBOMOptions = {};

      if (typeof baseClass.prototype.cloneAsOptions === 'function') {
        Object.assign(cloned, baseClass.prototype.cloneAsOptions.call(this, override));
      }

      cloned.bom = CloneProperty<'bom', BOM | undefined>(this, override, 'bom');

      return cloned as Required<IHasBOMOptions>;
    }
  };
}
