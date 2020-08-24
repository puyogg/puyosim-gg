import { Sprite, Container } from 'pixi.js';
import { Layer } from './layer';
import { NumField } from '../../solver/field';
import { Chainsim } from '..';

class NumberLayer extends Layer {
  private slidePos: number;
  private numbers: Container[];
  private firstOffset: number;
  private secondOffset: number;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.slidePos = this.simState.slidePos;
    this.numbers = [];
    this.firstOffset = -12; // Offsets for showing two-digit numbers
    this.secondOffset = 12;
    this.init();
  }

  /** Set the sprites */
  public init(): void {
    // Initialize sprites
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const i = r * this.cols + c;
        const { x, y } = this.cellPos.get(r, c);

        const container = new Container();
        const first = new Sprite(this.numTextures['score_1.png']);
        const second = new Sprite(this.numTextures['score_8.png']);
        first.anchor.set(0.5);
        second.anchor.set(0.5);
        first.scale.set(0.7);
        second.scale.set(0.7);
        container.addChild(first);
        container.addChild(second);
        this.addChild(container);

        first.x = this.firstOffset;
        second.x = this.secondOffset;
        container.x = x;
        container.y = y;
        this.numbers[i] = container;
      }
    }

    this.refreshSprites(this.simState.slides[this.simState.slidePos].number);
  }

  public refreshSprites(field: NumField): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const i = r * this.cols + c;
        const num = this.numbers[i];
        const first = num.children[0] as Sprite;
        const second = num.children[1] as Sprite;
        const value = field.get(r, c);

        if (value === 0) {
          first.visible = false;
          second.visible = false;
        } else if (value < 10) {
          first.visible = true;
          second.visible = false;
          first.x = 0;
          first.texture = this.numTextures[`score_${value}.png`];
        } else {
          first.visible = true;
          second.visible = true;
          first.x = this.firstOffset;
          second.x = this.secondOffset;
          const numString = value.toString();
          first.texture = this.numTextures[`score_${numString[0]}.png`];
          second.texture = this.numTextures[`score_${numString[1]}.png`];
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(delta: number): void {
    const slideChanged = this.slidePos !== this.simState.slidePos;
    const correctState = this.chainsim.animationState === this.chainsim.idle;

    if (slideChanged && correctState) {
      this.visible = true;
      this.slidePos = this.simState.slidePos;
      this.refreshSprites(this.simState.slides[this.simState.slidePos].number);
    } else if (correctState) {
      this.visible = true;
    } else {
      this.visible = false;
    }
  }
}

export { NumberLayer };
