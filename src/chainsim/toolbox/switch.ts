import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';

export class Switch extends Sprite {
  private upTexture: PIXI.Texture;
  private dnTexture: PIXI.Texture;
  private _down: boolean;

  constructor(up: PIXI.Texture, down: PIXI.Texture) {
    super(up);

    this.upTexture = up;
    this.dnTexture = down;
    this._down = false;
    this.interactive = true;
    this.buttonMode = true;

    this.on('pointerdown', () => {
      this.down = true;
    });
  }

  public set down(bool: boolean) {
    this._down = bool;
    this.texture = bool ? this.dnTexture : this.upTexture;
  }

  public get down(): boolean {
    return this._down;
  }
}
