import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';

export class Button extends Sprite {
  public upTexture: PIXI.Texture;
  public dnTexture: PIXI.Texture;

  constructor(up: PIXI.Texture, down: PIXI.Texture) {
    super(up);

    this.upTexture = up;
    this.dnTexture = down;
    this.interactive = true;
    this.buttonMode = true;

    this.addListener('pointerup', () => {
      this.down = false;
    });

    this.addListener('pointerupoutside', () => {
      this.down = false;
    });

    this.addListener('pointerdown', () => {
      this.down = true;
    });
  }

  set down(bool: boolean) {
    this.texture = bool ? this.dnTexture : this.upTexture;
  }

  get down(): boolean {
    return this.texture === this.dnTexture;
  }
}
