import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';

export class Button extends Sprite {
  private upTexture: PIXI.Texture;
  private dnTexture: PIXI.Texture;

  constructor(up: PIXI.Texture, down: PIXI.Texture) {
    super(up);

    this.upTexture = up;
    this.dnTexture = down;
    this.interactive = true;
    this.buttonMode = true;

    this.addListener('pointerup', () => {
      this.texture = this.upTexture;
    });

    this.addListener('pointerdown', () => {
      this.texture = this.dnTexture;
    });
  }
}
