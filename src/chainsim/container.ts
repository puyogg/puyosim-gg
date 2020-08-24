import * as PIXI from 'pixi.js';
import { AppState } from './state';
import { Chainsim } from '.';
import { ASSET_PATH } from './constants';

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

  get toolTextures(): PIXI.ITextureDictionary {
    return this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;
  }

  get numTextures(): PIXI.ITextureDictionary {
    return this.resources[`${ASSET_PATH}/scoreFont.json`].textures as PIXI.ITextureDictionary;
  }

  get puyoTextures(): PIXI.ITextureDictionary {
    return this.resources[`${ASSET_PATH}/puyo.json`].textures as PIXI.ITextureDictionary;
  }

  get trayTextures(): PIXI.ITextureDictionary {
    return this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;
  }

  get layoutTextures(): PIXI.ITextureDictionary {
    return this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;
  }

  get puyoExTextures(): PIXI.ITextureDictionary {
    return this.resources[`${ASSET_PATH}/puyotrim.json`].textures as PIXI.ITextureDictionary;
  }

  get chainFontTextures(): PIXI.ITextureDictionary {
    return this.resources[`${ASSET_PATH}/chain_font.json`].textures as PIXI.ITextureDictionary;
  }
}

export { SimContainer };
