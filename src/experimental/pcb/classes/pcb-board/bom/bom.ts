import { CloneProperty } from '../../../misc/cloneable';


export interface IBOMOptions {
  id: string;
  comment: string;
  footprint?: string;
  url?: string;
}

export class BOM implements IBOMOptions {
  public id: string;
  public comment: string;
  public footprint: string | undefined;
  public url: string | undefined;

  constructor(options: IBOMOptions) {
    this.id = options.id;
    this.comment = options.comment;
    this.footprint = options.footprint;
    this.url = options.url;
  }

  cloneAsOptions(override?: IBOMOptions): IBOMOptions {
    return {
      id: CloneProperty<'id', string>(this, override, 'id'),
      comment: CloneProperty<'comment', string>(this, override, 'comment'),
      footprint: CloneProperty<'footprint', string | undefined>(this, override, 'footprint'),
      url: CloneProperty<'url', string | undefined>(this, override, 'url'),
    };
  }

  clone(override?: IBOMOptions): BOM {
    return new BOM(this.cloneAsOptions(override));
  }
}


