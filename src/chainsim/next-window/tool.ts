import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { PUYOTYPE } from '~/solver/constants';
import { WinState } from '.';

export class NextTool extends Sprite {
  private toolValue: PUYOTYPE | number;
  private reset: boolean;

  constructor(texture: PIXI.Texture, toolCursor: Sprite, toolValue: PUYOTYPE | number, winState: WinState) {
    super(texture);

    this.scale.set(0.8);
    this.anchor.set(0.5);

    this.interactive = true;
    this.buttonMode = true;
    this.toolValue = toolValue;
    this.reset = toolValue === -1;

    this.on('pointerdown', () => {
      toolCursor.x = this.x;
      toolCursor.y = this.y;
      winState.reset = this.reset;
      winState.currentTool = this.toolValue;
    });
  }
}
