import * as PIXI from 'pixi.js';
import { AppState } from './state';
import { Chainsim } from '.';

/** Extension of a PIXI.Container with a reference back to the Chainsim instance. */
class SimContainer extends PIXI.Container {
  public simState: AppState;
  public resources: PIXI.IResourceDictionary;
  public chainsim: Chainsim;

  /**
   * Creates a new SimContainer for holding PIXI Sprites
   * @param chainsim A reference to the main controller
   */
  constructor(chainsim: Chainsim) {
    super();
    this.simState = chainsim.state;
    this.resources = chainsim.resources;
    this.chainsim = chainsim;
  }
}

export { SimContainer };
