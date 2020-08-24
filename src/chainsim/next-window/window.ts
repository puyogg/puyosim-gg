import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { Next } from './next';
import { WinState } from '.';

export class Window extends SimContainer {
  private border: Sprite;
  private background: Sprite;
  // private windowMask: PIXI.Graphics;
  public nextPuyos: Next;
  private windowMask: Sprite;

  constructor(chainsim: Chainsim, winState: WinState) {
    super(chainsim);

    const container = new PIXI.Container();
    this.addChild(container);
    this.background = new Sprite(this.layoutTextures['next_background_1p.png']);
    this.nextPuyos = new Next(chainsim, winState);
    this.windowMask = new Sprite(this.layoutTextures['next_background_1p_mask.png']);
    container.addChild(this.background, this.nextPuyos, this.windowMask);
    container.mask = this.windowMask;

    this.border = new Sprite(this.layoutTextures['next_border_1p.png']);
    this.addChild(this.border);
  }
}
