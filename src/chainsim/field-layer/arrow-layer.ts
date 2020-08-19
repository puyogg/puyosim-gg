import * as PIXI from 'pixi.js';
import { Layer } from './layer';
import { NumField } from '../../solver/field';
import { Chainsim } from '..';

/** None=0, up=1, right=2, down=3, left=4 */
const DIR_ANGLE = [0, 0, (1 / 2) * Math.PI, Math.PI, (3 / 2) * Math.PI];

class ArrowLayer extends Layer {
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
        this.sprites[i] = new PIXI.Sprite(this.toolTextures['arrow.png']);
        const sprite = this.sprites[i];

        sprite.anchor.set(0.5);
        const { x, y } = this.cellPos.get(r, c);
        sprite.x = x;
        sprite.y = y;
        this.addChild(sprite);
      }
    }

    this.refreshSprites(this.simState.slides[this.simState.slidePos].arrow);
  }

  public refreshSprites(field: NumField): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const sprite = this.sprites[r * this.cols + c];
        const dir = field.get(r, c);
        if (dir === 0) {
          sprite.visible = false;
        } else {
          sprite.visible = true;
          sprite.rotation = DIR_ANGLE[dir];
        }
      }
    }
  }

  public update(delta: number): void {
    const slideChanged = this.slidePos !== this.simState.slidePos;
    const correctState = this.chainsim.animationState === this.chainsim.idle;

    if (slideChanged && correctState) {
      this.visible = true;
      this.slidePos = this.simState.slidePos;
      this.refreshSprites(this.simState.slides[this.simState.slidePos].arrow);
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
    const s = 4; // spread

    const field = this.simState.slides[this.simState.slidePos].arrow;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const sprite = this.sprites[r * this.cols + c];
        switch (field.get(r, c)) {
          case 1: // up
            sprite.y = this.cellPos.get(r, c).y - s * Math.cos((t / d) * Math.PI);
            break;
          case 2: // right
            sprite.x = this.cellPos.get(r, c).x + s * Math.cos((t / d) * Math.PI);
            break;
          case 3: // down
            sprite.y = this.cellPos.get(r, c).y + s * Math.cos((t / d) * Math.PI);
            break;
          case 4: // left
            sprite.x = this.cellPos.get(r, c).x - s * Math.cos((t / d) * Math.PI);
            break;
          default:
            break;
        }
      }
    }

    this.ticker = (this.ticker + 1) % (d * 2);
  }
}

export { ArrowLayer };
