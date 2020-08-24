import * as PIXI from 'pixi.js';
import { Layer } from './layer';
import { PUYONAME } from '../../solver/constants';
import { PuyoField } from '../../solver/field';
import { Chainsim } from '..';

class ShadowLayer extends Layer {
  private slidePos: number;
  public tempField: PuyoField;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.slidePos = this.simState.slidePos;
    this.tempField = new PuyoField(this.rows, this.cols);

    this.init();
  }

  /** Set the sprites */
  public init(): void {
    // Initialize sprites
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const i = r * this.cols + c;
        this.sprites[i] = new PIXI.Sprite(this.puyoTextures[`red_0.png`]);
        const sprite = this.sprites[i];

        sprite.anchor.set(0.5);
        const { x, y } = this.cellPos.get(r, c);
        sprite.x = x;
        sprite.y = y;
        sprite.alpha = 0.3;
        sprite.interactive = false;

        this.addChild(sprite);
      }
    }

    this.refreshSprites(this.simState.slides[this.simState.slidePos].shadow);
  }

  public refreshSprites(field: PuyoField): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const puyo = field.get(r, c);
        const name = PUYONAME[puyo];
        const sprite = this.sprites[r * this.cols + c];
        sprite.texture = this.puyoTextures[`${name}_0.png`];
      }
    }

    this.tempField.copyFrom(field);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(delta: number): void {
    const slideChanged = this.slidePos !== this.simState.slidePos;
    const correctState = this.chainsim.animationState === this.chainsim.idle;

    if (slideChanged && correctState) {
      this.visible = true;
      this.slidePos = this.simState.slidePos;
      this.refreshSprites(this.simState.slides[this.simState.slidePos].shadow);
    } else if (correctState) {
      this.visible = true;
    } else {
      this.visible = false;
    }
  }
}

export { ShadowLayer };
