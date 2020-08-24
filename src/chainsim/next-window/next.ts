import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { Coord } from '../position';
import { PUYOTYPE, PUYONAME } from '../../solver/constants';
import { WinState } from '.';

export class Next extends SimContainer {
  private sprites: Sprite[];
  private coords: Coord[];
  private scaling: number;
  private targetCoords: Coord[];
  private ticker: number;

  private prevPos: number;
  private poolChanged: boolean;

  private winState: WinState;

  constructor(chainsim: Chainsim, winState: WinState) {
    super(chainsim);

    this.ticker = 0;
    this.prevPos = 0;
    this.poolChanged = false;
    this.winState = winState;

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
      sprite.interactive = true;
      sprite.buttonMode = true;
      sprite.on('pointerdown', () => {
        if (this.chainsim.nextWindow?.drawer.visible) {
          const poolIdx = (this.simState.poolPos + i) % this.simState.pool.length;
          const tool = this.winState.currentTool;
          const reset = this.winState.reset;
          if (reset) {
            this.simState.pool[poolIdx] = this.simState.origPool[poolIdx];
          } else {
            this.simState.pool[poolIdx] = tool;
          }
        }
        this.simState.poolChanged = !this.simState.poolChanged;
      });
      this.addChild(this.sprites[i]);
    }

    this.refreshSprites();
  }

  public refreshSprites(): void {
    const pool = this.simState.pool;
    const poolPos = this.simState.poolPos;

    for (let i = 0; i < 6; i++) {
      const name = PUYONAME[pool[(poolPos + i) % pool.length] as PUYOTYPE];
      const sprite = this.sprites[i];
      sprite.texture = this.puyoTextures[`${name}_0.png`];
      const { x, y } = this.coords[i];
      sprite.position.set(x, y);
      sprite.scale.set(i < 2 ? 1 : this.scaling);
    }
  }

  public update(): void {
    if (this.prevPos !== this.simState.poolPos || this.poolChanged !== this.simState.poolChanged) {
      this.refreshSprites();
    }
    this.prevPos = this.simState.poolPos;
    this.poolChanged = this.simState.poolChanged;
  }

  public animate(): boolean {
    const t = this.ticker + 1;
    const d = 8; // Duration

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

    const finished = t >= d;
    this.ticker += 1;

    if (finished) {
      // this.simState.slidePos += 1;
      // this.simState.poolPos = (this.simState.poolPos + 2) % this.simState.pool.length;
      this.ticker = 0;
      // this.refreshSprites();
    }
    return finished;
  }
}
