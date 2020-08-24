import * as PIXI from 'pixi.js';
import { SimContainer } from '../container';
import { PositionMatrix } from '../position';
import { NumField, PuyoField, BoolField } from '../../solver/field';
import { Chainsim } from '..';

/** Abstract class for the Puyo, Shadow, Arrow, Cursor, and Number fields */
abstract class Layer extends SimContainer {
  public rows: number;
  public cols: number;
  public hrows: number;
  public cellWidth: number;
  public cellHeight: number;
  public cellPos: PositionMatrix;
  public sprites: PIXI.Sprite[];

  /** Remember to call init at the end of the extended class's constructor function. */
  constructor(chainsim: Chainsim) {
    super(chainsim);
    this.rows = this.chainsim.state.simSettings.rows;
    this.cols = this.chainsim.state.simSettings.cols;
    this.hrows = this.chainsim.state.simSettings.hrows;
    this.cellWidth = this.chainsim.state.pxSizing.cellWidth;
    this.cellHeight = this.chainsim.state.pxSizing.cellHeight;
    this.cellPos = new PositionMatrix(this.rows, this.cols, this.cellWidth, this.cellHeight);
    this.sprites = [];
  }

  public abstract init(): void;

  public abstract refreshSprites(field: PuyoField | BoolField | NumField): void;

  /** Set the interaction value for all the sprites */
  public setInteraction(bool: boolean): void {
    this.sprites.forEach((sprite) => {
      sprite.interactive = bool;
      sprite.buttonMode = bool;
    });
  }
}

export { Layer };
