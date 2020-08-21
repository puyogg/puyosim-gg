import { Sprite } from 'pixi.js';

export class AxisPuyo extends Sprite {
  private normalTexture: PIXI.Texture;
  private flashTexture: PIXI.Texture;

  private _isFlashing: boolean;

  constructor(normal: PIXI.Texture, flash: PIXI.Texture) {
    super(normal);

    this.normalTexture = normal;
    this.flashTexture = flash;
    this._isFlashing = false;
    this.texture = normal;
  }

  set isFlashing(bool: boolean) {
    this._isFlashing = bool;
    this.texture = bool ? this.flashTexture : this.normalTexture;
  }

  get isFlashing(): boolean {
    return this._isFlashing;
  }
}
