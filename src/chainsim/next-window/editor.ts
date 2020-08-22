import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { ASSET_PATH } from '../constants';
import { WinState } from '.';

export class NextEditor extends SimContainer {
  private toolTextures: PIXI.ITextureDictionary;
  private puyoTextures: PIXI.ITextureDictionary;
  private layoutTextures: PIXI.ITextureDictionary;

  private winState: WinState;

  private container: Sprite;

  constructor(chainsim: Chainsim, winState: WinState) {
    super(chainsim);

    this.winState = winState;

    this.puyoTextures = this.resources[`${ASSET_PATH}/puyo.json`].textures as PIXI.ITextureDictionary;
    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;
    this.layoutTextures = this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;

    this.container = new Sprite(this.layoutTextures['next_color_picker_container.png']);
    this.addChild(this.container);
  }
}