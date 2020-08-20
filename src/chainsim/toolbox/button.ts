import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';

class Button extends Sprite {
  private upTexture: PIXI.Texture;
  private dnTexture: PIXI.Texture;

  constructor(texture: PIXI.Texture) {
    super(texture);

    this.upTexture = texture;
    this.dnTexture = texture;
    this.interactive = true;
    this.buttonMode = true;

    this.addListener('pointerup', () => {
      this.texture = this.upTexture;
    });
  }

  set pressed(texture: PIXI.Texture) {
    this.dnTexture = texture;
    this.addListener('pointerdown', () => {
      this.texture = this.dnTexture;
    });
  }
}

export { Button };
