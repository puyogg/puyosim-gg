import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';

export class NextTool extends Sprite {
  constructor(texture: PIXI.Texture) {
    super(texture);

    this.scale.set(0.8);
    this.anchor.set(0.5);
  }
}
