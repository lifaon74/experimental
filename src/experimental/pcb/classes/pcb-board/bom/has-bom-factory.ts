import { Constructor } from '../../../../../classes/class-helpers/types';
import { BOM } from './bom';
import { CloneProperty } from '../../../misc/cloneable';

export interface IHasBOMOptions {
  bom?: BOM;
  comment?: string;
}

export interface IHasBOM {
  bom: BOM | undefined;
  comment: string | undefined;
}

export function HasBOMFactory<TBase extends Constructor>(baseClass: TBase) {
  return class extends baseClass implements IHasBOM {
    public bom: BOM | undefined;
    public comment: string | undefined;

    constructor(...args: any[]) {
      const options: IHasBOMOptions = args[0];
      super(...args);
      this.bom = options.bom;
      this.comment = options.comment;
    }

    setBom(bom: BOM | undefined): this {
      this.bom = bom;
      return this;
    }

    setComment(comment: string | undefined): this {
      this.comment = comment;
      return this;
    }

    cloneAsOptions(override?: IHasBOMOptions): Required<IHasBOMOptions> {
      const cloned: IHasBOMOptions = {};

      if (typeof baseClass.prototype.cloneAsOptions === 'function') {
        Object.assign(cloned, baseClass.prototype.cloneAsOptions.call(this, override));
      }

      cloned.bom = CloneProperty<'bom', BOM | undefined>(this, override, 'bom');
      cloned.comment = CloneProperty<'comment', string | undefined>(this, override, 'comment');

      return cloned as Required<IHasBOMOptions>;
    }
  };
}
