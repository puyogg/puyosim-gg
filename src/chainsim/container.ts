import * as PIXI from 'pixi.js';
import { AppState } from './state';

/** Extension of a PIXI.Container that can pass down the root game state. */
class StateContainer extends PIXI.Container {
  private _state: AppState | undefined;
  private _resources: PIXI.IResourceDictionary | undefined;

  constructor(parent?: StateContainer, state?: AppState, resources?: PIXI.IResourceDictionary) {
    super();
    if (parent) {
      parent.addChild(this);
    }
    this._state = state || undefined;
    this._resources = resources || undefined;
  }

  get state(): AppState {
    if (this._state) return this._state;

    const parent = this.parent as StateContainer;
    return parent.state;
  }

  get resources(): PIXI.IResourceDictionary {
    if (this._resources) return this._resources;

    const parent = this.parent as StateContainer;
    return parent.resources;
  }
}

export { StateContainer };
