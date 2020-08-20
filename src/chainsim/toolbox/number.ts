import { Page } from './page';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { Button } from './button';
import { ToolSprite, ToolNumber } from './tool';

export class PageNumber extends Page {
  private numTextures: PIXI.ITextureDictionary;
  private toolNumber: ToolNumber;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.numTextures = this.resources[`${ASSET_PATH}/scoreFont.json`].textures as PIXI.ITextureDictionary;
    this.toolNumber = new ToolNumber(this.numTextures, this.toolCursor);
    this.toolNumber.position.set(48 + 71, 120 + 71);
    this.addChild(this.toolNumber);
  }
}
