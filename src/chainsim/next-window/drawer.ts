import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { ASSET_PATH } from '../constants';

export class Drawer extends SimContainer {
  private puyoTextures: PIXI.ITextureDictionary;
  private toolTextures: PIXI.ITextureDictionary;
  private layoutTextures: PIXI.ITextureDictionary;

  private drawer: Sprite;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.puyoTextures = this.resources[`${ASSET_PATH}/puyo.json`].textures as PIXI.ITextureDictionary;
    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;
    this.layoutTextures = this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;

    this.drawer = new Sprite(this.layoutTextures['next_big_container.png']);
    this.addChild(this.drawer);
  }
}
