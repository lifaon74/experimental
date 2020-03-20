import { CloneProperty } from '../../../misc/cloneable';


export interface IBOMOptions {
  id: string;
  component: string;
  url?: string;
}

export class BOM implements IBOMOptions {
  public id: string;
  public component: string;
  public url: string | undefined;

  constructor(options: IBOMOptions) {
    this.id = options.id;
    this.component = options.component;
    this.url = options.url;
  }

  cloneAsOptions(override?: IBOMOptions): IBOMOptions {
    return {
      id: CloneProperty<'id', string>(this, override, 'id'),
      component: CloneProperty<'component', string>(this, override, 'component'),
      url: CloneProperty<'url', string | undefined>(this, override, 'url'),
    };
  }

  clone(override?: IBOMOptions): BOM {
    return new BOM(this.cloneAsOptions(override));
  }
}


