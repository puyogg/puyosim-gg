import * as PIXI from 'pixi.js';
import { StateContainer } from '../container';
import { PositionMatrix } from '../position';
import { NumField, PuyoField, BoolField } from '../../solver/field';
import { ASSET_PATH } from '../constants';

interface LayerSettings {
  rows: number;
  hrows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
}

/** Abstract class for the Puyo, Shadow, Arrow, Cursor, and Number fields */
abstract class Layer extends StateContainer {
  public rows: number;
  public cols: number;
  public hrows: number;
  public cellWidth: number;
  public cellHeight: number;
  public cellPos: PositionMatrix;
  public puyoTextures: PIXI.ITextureDictionary;
  public toolTextures: PIXI.ITextureDictionary;
  public sprites: PIXI.Sprite[];

  constructor(parent: StateContainer, fieldSettings: LayerSettings) {
    super(parent);
    this.rows = fieldSettings.rows;
    this.cols = fieldSettings.cols;
    this.hrows = fieldSettings.hrows;
    this.cellWidth = fieldSettings.cellWidth;
    this.cellHeight = fieldSettings.cellHeight;
    this.puyoTextures = this.resources[`${ASSET_PATH}/puyo.json`].textures as PIXI.ITextureDictionary;
    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;
    this.cellPos = new PositionMatrix(this.rows, this.cols, this.cellWidth, this.cellHeight);
    this.sprites = [];

    // Place empty sprites onto the field
    this.init();
  }

  public abstract init(): void;

  public abstract refreshSprites(field: PuyoField | BoolField | NumField): void;
}

export { Layer, LayerSettings };
