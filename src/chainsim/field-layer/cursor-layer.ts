import * as PIXI from 'pixi.js';
import { Layer } from './layer';
import { BoolField } from '../../solver/field';
import { Chainsim } from '..';

class CursorLayer extends Layer {
  private slidePos: number;
  private ticker: number;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.slidePos = this.simState.slidePos;
    this.ticker = 0;
    this.init();
  }

  /** Set the sprites */
  public init(): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const i = r * this.cols + c;
        this.sprites[i] = new PIXI.Sprite(this.toolTextures['cursor.png']);
        const sprite = this.sprites[i];

        sprite.anchor.set(0.5);
        const { x, y } = this.cellPos.get(r, c);
        sprite.x = x;
        sprite.y = y;
        this.addChild(sprite);
      }
    }

    this.refreshSprites(this.simState.slides[this.simState.slidePos].cursor);
  }

  public refreshSprites(field: BoolField): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const sprite = this.sprites[r * this.cols + c];
        sprite.visible = field.get(r, c);
      }
    }
  }

  public update(delta: number): void {
    const slideChanged = this.slidePos !== this.simState.slidePos;
    const correctState = this.chainsim.animationState === this.chainsim.idle;

    if (slideChanged && correctState) {
      this.visible = true;
      this.slidePos = this.simState.slidePos;
      this.refreshSprites(this.simState.slides[this.simState.slidePos].cursor);
    } else if (correctState) {
      this.visible = true;
    } else {
      this.visible = false;
    }

    if (this.visible === true) this.animate(delta);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public animate(delta: number): void {
    const t = this.ticker;
    const d = 30; // half duration

    const scale = Math.cos((t / d) * Math.PI) >= 0 ? 1.0 : 0.9;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const sprite = this.sprites[r * this.cols + c];
        sprite.scale.set(scale);
      }
    }

    this.ticker = (this.ticker + 1) % (d * 2);
  }
}

export { CursorLayer };
