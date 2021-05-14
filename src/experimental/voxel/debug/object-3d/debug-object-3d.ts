import { mat4, vec3 } from 'gl-matrix';
import { ILightSpectrum } from '../../raytrace/raytrace';
import {
  createMulticastReplayLastSource, createMulticastSource, createNotification, IEmitFunction, IGenericNotification,
  IMulticastReplayLastSource, IMulticastSource,
  ISubscribeFunction,
  IUnsubscribeFunction
} from '@lifaon/rx-js-light';

interface IConstructor<GInstance = any, GArguments extends any[] = any[]> {
  new(...args: GArguments): GInstance;
}


/*----------*/

export class Object3D<GData = any> {
  data?: GData;

  parent: Object3D | null;
  children: Set<Object3D>;

  modelMatrix: mat4;

  events: IMulticastSource<any>;

  constructor(data?: GData) {
    this.data = data;
    this.parent = null;
    this.children = new Set<Object3D>();
    this.modelMatrix = mat4.create();
    this.events = createMulticastSource<any>();
  }

  dispatch(
    notification: IGenericNotification,
    bubbles: number = Number.POSITIVE_INFINITY,
  ): void {
    this.events.emit(notification);
    if ((bubbles > 0) && (this.parent !== null)) {
      this.parent.dispatch(notification, bubbles - 1);
    }
  }

  detach(): void {
    if (this.parent !== null) {
      this.parent.children.delete(this);
      this.parent = null;
      this.dispatch(createNotification('detach', this));
    }
  }

  attach<GChild extends Object3D>(
    child: GChild,
  ): GChild {
    if (child.parent !== this) {
      child.detach();
      this.children.add(child);
      child.parent = this;
      this.dispatch(createNotification('attach', child));
    }
    return child;
  }
}


/*---------------------*/

interface ILight {
  spectrum: ILightSpectrum;
}

/*---------------------*/


export async function debugObject3d() {
  const scene = new Object3D();
  const light1 = new Object3D();
  const light2 = new Object3D();
}
