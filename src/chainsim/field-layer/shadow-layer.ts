import * as PIXI from 'pixi.js';
import { Layer, LayerSettings } from './layer';
import { PUYONAME, PUYOTYPE } from '../../solver/constants';
import { FieldState, Pos } from '../../solver';
import { colorPop } from '../animation/color-pop';
import { garbagePop } from '../animation/garbage-pop';
import { getSplitGroups, getStaggerValues } from '../animation/popping-stagger';
import { StateContainer } from '../container';

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
        this.sprites[i] = new PIXI.Sprite(this.puyoTextures[`none_0.png`]);
        const sprite = this.sprites[i];

        sprite.anchor.set(0.5);
        const { x, y } = this.cellPos.get(r, c);
        sprite.x = x;
        sprite.y = y;
        sprite.interactive = false;

        this.addChild(sprite);
      }
    }
  }
}

export { ShadowLayer };
