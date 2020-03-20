import { mat3, vec2 } from 'gl-matrix';
import { Constructor } from '../../../../../../classes/class-helpers/types';
import { IObjects2DTransformer } from './interfaces';
import { IObject2D } from '../object-2d/interfaces';
import { Objects2DTransformer } from './implementation';


export interface IObject2DWithTransforms {
  readonly transformer: IObjects2DTransformer<IObject2D>;

  resetModelMatrix(): this;

  transform(callback: (matrix: mat3) => mat3): this;

  translate(vector: vec2 | number[]): this;

  rotate(rad: number): this;

  scale(vector: vec2 | number[]): this;

  uniformScale(scale: number): this;
}


export function Object2DWithTransformsFactory<TBase extends Constructor<IObject2D>>(baseClass: TBase) {
  return class extends baseClass implements IObject2DWithTransforms {
    protected _transformer: IObjects2DTransformer<this> | undefined;

    constructor(...args: any[]) {
      super(...args);
    }

    get transformer(): IObjects2DTransformer<this> {
      if (this._transformer === void 0) {
        this._transformer = new Objects2DTransformer<this>([this]);
      }
      return this._transformer;
    }

    resetModelMatrix(): this {
      this.transformer.reset();
      return this;
    }

    transform(callback: (matrix: mat3) => mat3): this {
      this.transformer.transform(callback);
      return this;
    }

    translate(vector: vec2 | number[]): this {
      this.transformer.translate(vector);
      return this;
    }

    rotate(rad: number): this {
      this.transformer.rotate(rad);
      return this;
    }

    scale(vector: vec2 | number[]): this {
      this.transformer.scale(vector);
      return this;
    }

    uniformScale(scale: number): this {
      this.transformer.uniformScale(scale);
      return this;
    }
  };
}
