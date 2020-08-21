import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { ASSET_PATH } from '../constants';
import { Coord } from '../position';

export class Next extends SimContainer {
  private puyoTextures: PIXI.ITextureDictionary;
  private sprites: Sprite[];
  private coords: Coord[];
  private scaling: number;
  private targetCoords: Coord[];
  private ticker: number;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.puyoTextures = this.resources[`${ASSET_PATH}/puyo.json`].textures as PIXI.ITextureDictionary;

    this.ticker = 0;

    this.coords = [
      { x: 54, y: 124 },
      { x: 54, y: 64 },
      { x: 100, y: 251 - 6 },
      { x: 100, y: 200 - 6 },
      { x: 100, y: 330 + 51 },
      { x: 100, y: 330 },
    ];

    this.targetCoords = [
      { x: 54, y: -40 },
      { x: 54, y: -100 },
      { x: 54, y: 124 },
      { x: 54, y: 64 },
      { x: 100, y: 251 - 6 },
      { x: 100, y: 200 - 6 },
    ];

    this.scaling = 0.85;

    this.sprites = [];
    for (let i = 0; i < 6; i++) {
      this.sprites[i] = new Sprite(this.puyoTextures['red_0.png']);
      const sprite = this.sprites[i];
      sprite.anchor.set(0.5);
      const { x, y } = this.coords[i];
      sprite.position.set(x, y);
      sprite.scale.set(i < 2 ? 1 : this.scaling);
      this.addChild(this.sprites[i]);
    }

    PIXI.Ticker.shared.add(() => this.animate());
  }

  public animate(): void {
    const t = this.ticker + 1;
    const d = 60; // Duration

    for (let i = 0; i < this.coords.length; i++) {
      const diff: Coord = {
        x: ((this.targetCoords[i].x - this.coords[i].x) / d) * t,
        y: ((this.targetCoords[i].y - this.coords[i].y) / d) * t,
      };

      this.sprites[i].x = this.coords[i].x + diff.x;
      this.sprites[i].y = this.coords[i].y + diff.y;

      if (i >= 2 && i < 4) {
        const scale = this.scaling + ((1 - this.scaling) / d) * t;
        this.sprites[i].scale.set(scale);
      }
    }

    this.ticker = (this.ticker + 1) % d;
  }
}
