import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { ASSET_PATH } from '../constants';
import { WinState } from '.';

export class NextNumber extends SimContainer {
  private numTextures: PIXI.ITextureDictionary;

  private winState: WinState;
  private offset: number;

  // private current: number;
  private numbers: Sprite[];

  constructor(chainsim: Chainsim, winState: WinState, offset: number) {
    super(chainsim);

    // Set reference to window editor state
    this.winState = winState;
    this.offset = offset;

    // Set texture reference
    this.numTextures = this.resources[`${ASSET_PATH}/scoreFont.json`].textures as PIXI.ITextureDictionary;

    // Set 3 digits
    this.numbers = [];
    for (let i = 0; i < 3; i++) {
      this.numbers[i] = new Sprite(this.numTextures['score_0.png']);
      const number = this.numbers[i];
      number.anchor.set(0.5);
      number.x = number.width * 0.85 * i;
      this.addChild(number);
    }

    this.refreshSprites();
  }

  public refreshSprites(): void {
    const num = ((Math.floor(this.simState.poolPos / 2) + this.offset) % 128) + 1;
    const numString = num.toString();
    const hide = 3 - numString.length;

    for (let i = 0; i < hide; i++) {
      this.numbers[i].visible = false;
    }

    for (let i = 0; i < numString.length; i++) {
      const idx = hide + i;
      this.numbers[idx].texture = this.numTextures[`score_${numString[i]}.png`];
      this.numbers[idx].visible = true;
      this.numbers[idx].x = this.numbers[idx].width * 0.85 * i;
    }
  }
}
