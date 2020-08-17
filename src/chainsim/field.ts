import * as PIXI from 'pixi.js';
import { StateContainer } from './container';
import { PositionMatrix } from './position';

interface FieldSettings {
  rows: number;
  hrows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
}

/** Extendable class for the Puyo, Shadow, Arrow, Cursor, and Number fields */
class Field extends StateContainer {
  private rows: number;
  private cols: number;
  private hrows: number;
  private cellWidth: number;
  private cellHeight: number;
  private textures: PIXI.ITextureDictionary;
  private cellPos: PositionMatrix;
  private sprites: PIXI.Sprite[];

  constructor(fieldSettings: FieldSettings, textures: PIXI.ITextureDictionary) {
    super();
    this.rows = fieldSettings.rows;
    this.cols = fieldSettings.cols;
    this.hrows = fieldSettings.hrows;
    this.cellWidth = fieldSettings.cellWidth;
    this.cellHeight = fieldSettings.cellHeight;

    this.textures = textures;
    this.cellPos = new PositionMatrix(this.rows, this.cols, this.cellWidth, this.cellHeight);
    this.sprites = [];

    // Place empty sprites onto the field
    this.init();
  }

  private init(): void {
    // Initialize sprites
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const i = r * this.cols + c;
        this.sprites[i] = new PIXI.Sprite(this.textures['red_n.png']);
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

class PuyoField extends Field {
  constructor(fieldSettings: FieldSettings, textures: PIXI.ITextureDictionary) {
    super(fieldSettings, textures);

    // Set interaction handlers
    this.setEventHandlers();
  }

  private setEventHandlers() {
    // To be implemented
  }
}

export { Field, FieldSettings };
