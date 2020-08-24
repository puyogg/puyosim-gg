import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { WinState } from '.';

export class NextEditor extends SimContainer {
  private winState: WinState;

  private container: Sprite;

  constructor(chainsim: Chainsim, winState: WinState) {
    super(chainsim);

    this.winState = winState;

    this.container = new Sprite(this.layoutTextures['next_color_picker_container.png']);
    this.addChild(this.container);
  }
}
