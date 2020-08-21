import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { ASSET_PATH } from '../constants';
import { Next } from './next';

export class Window extends SimContainer {
  private layoutTextures: PIXI.ITextureDictionary;

  private border: Sprite;
  private background: Sprite;
  // private windowMask: PIXI.Graphics;
  private nextPuyos: Next;
  private windowMask: Sprite;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.layoutTextures = this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;

    const container = new PIXI.Container();
    this.addChild(container);
    this.background = new Sprite(this.layoutTextures['next_background_1p.png']);
    this.nextPuyos = new Next(chainsim);
    this.windowMask = new Sprite(this.layoutTextures['next_background_1p_mask.png']);
    container.addChild(this.background, this.nextPuyos, this.windowMask);
    container.mask = this.windowMask;

    this.border = new Sprite(this.layoutTextures['next_border_1p.png']);
    this.addChild(this.border);
  }
}
