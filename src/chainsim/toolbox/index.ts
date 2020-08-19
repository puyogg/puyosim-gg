import { SimContainer } from '../container';
import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';

class Toolbox extends SimContainer {
  private layoutTextures: PIXI.ITextureDictionary;
  private toolboxTextures: PIXI.ITextureDictionary;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.layoutTextures = this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;
    this.toolboxTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;
    const toolbox = new Sprite(this.layoutTextures['toolbox.png']);
    this.addChild(toolbox);
  }
}

export { Toolbox };
