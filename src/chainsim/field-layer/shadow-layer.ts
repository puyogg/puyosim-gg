import * as PIXI from 'pixi.js';
import { Layer, LayerSettings } from './layer';
import { PUYONAME, PUYOTYPE } from '../../solver/constants';
import { FieldState, Pos } from '../../solver';
import { colorPop } from '../animation/color-pop';
import { garbagePop } from '../animation/garbage-pop';
import { getSplitGroups, getStaggerValues } from '../animation/popping-stagger';
import { StateContainer } from '../container';
import { PuyoField } from '../../solver/field';

class ShadowLayer extends Layer {
  constructor(parent: StateContainer, fieldSettings: LayerSettings) {
    super(parent, fieldSettings);
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
        sprite.alpha = 0.5;
        sprite.interactive = false;

        this.addChild(sprite);
      }
    }
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
  }

  public update(delta: number): void {
    //
  }
}

export { ShadowLayer };
