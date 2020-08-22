import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { ASSET_PATH } from '../constants';

export class Number3Digit extends SimContainer {
  private numTextures: PIXI.ITextureDictionary;

  private offset: number;
  private align: string;

  // private current: number;
  private numbers: Sprite[];

  constructor(chainsim: Chainsim, offset: number, align: 'left' | 'middle' | 'right') {
    super(chainsim);

    this.numTextures = this.resources[`${ASSET_PATH}/scoreFont.json`].textures as PIXI.ITextureDictionary;
    this.offset = offset;
    this.align = align;

    // Set 3 digits
    this.numbers = [];
    for (let i = 0; i < 3; i++) {
      this.numbers[i] = new Sprite(this.numTextures['score_0.png']);
      const number = this.numbers[i];
      number.anchor.set(0.5);
      this.addChild(number);
    }

    this.refreshSprites(0);
  }

  private refreshSprites(num: number): void {
    const int = Math.floor(num) % 1000;
    const intString = int.toString();
    const hide = 3 - intString.length;

    for (let i = 0; i < hide; i++) {
      this.numbers[i].visible = false;
    }

    const range = (intString.length - 1) * this.numbers[0].width * 0.85;
    const offsetX = this.align === 'middle' ? range / intString.length : this.align === 'right' ? range : 0;

    for (let i = 0; i < intString.length; i++) {
      const idx = hide + i;
      this.numbers[idx].texture = this.numTextures[`score_${intString[i]}.png`];
      this.numbers[idx].visible = true;
      this.numbers[idx].x = this.numbers[idx].width * 0.85 * i - offsetX;
    }
  }

  public setNumber(num: number): void {
    this.refreshSprites(num);
  }
}
