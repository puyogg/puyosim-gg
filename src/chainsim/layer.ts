import * as PIXI from 'pixi.js';
import { StateContainer } from './container';
import { PositionMatrix } from './position';
import { PUYONAME, PUYOTYPE } from '../solver/constants';
import { isColored, isBlock, isNone } from '../solver/helper';
import { NumField, PuyoField, BoolField } from '../solver/field';
import { FieldState } from '../solver';
import { get2d } from '../solver/helper';

interface LayerSettings {
  rows: number;
  hrows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
}

const shortBounce = ['h', '0', 'v', 'v', '0', '0', 'h', 'h', '0', 'v', 'v', '0', '0', '0'];

/** Abstract class for the Puyo, Shadow, Arrow, Cursor, and Number fields */
abstract class Layer extends StateContainer {
  public rows: number;
  public cols: number;
  public hrows: number;
  public cellWidth: number;
  public cellHeight: number;
  public cellPos: PositionMatrix;
  public textures: PIXI.ITextureDictionary;
  public sprites: PIXI.Sprite[];

  constructor(fieldSettings: LayerSettings, textures: PIXI.ITextureDictionary) {
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
        this.sprites[i] = new PIXI.Sprite(this.textures[`none_0.png`]);
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

  public abstract refreshSprites(field: PuyoField | BoolField | NumField): void;
}

class PuyoLayer extends Layer {
  private startingField: PuyoField;
  private dropDists: NumField;
  private toPop: BoolField;
  private connectivity: NumField;
  private targetY: NumField;
  private dropAnimationTickers: NumField;
  private dropFinishDelay: number;
  private popAnimationTicker: number;
  public tempField: PuyoField;

  constructor(fieldSettings: LayerSettings, textures: PIXI.ITextureDictionary) {
    super(fieldSettings, textures);

    this.dropDists = new NumField(fieldSettings.rows, fieldSettings.cols);
    this.toPop = new BoolField(fieldSettings.rows, fieldSettings.cols);
    this.connectivity = new NumField(fieldSettings.rows, fieldSettings.cols);
    this.targetY = new NumField(fieldSettings.rows, fieldSettings.cols);
    this.startingField = new PuyoField(fieldSettings.rows, fieldSettings.cols);
    this.tempField = new PuyoField(fieldSettings.rows, fieldSettings.cols);
    this.dropAnimationTickers = new NumField(fieldSettings.rows, fieldSettings.cols);
    this.popAnimationTicker = 0;
    this.dropFinishDelay = 0;

    // Set interaction handlers
    this.setEventHandlers();
  }

  public refreshSprites(field: PuyoField): void {
    const rows = this.state.simSettings.rows;
    const hrows = this.state.simSettings.hrows;
    const cols = this.state.simSettings.cols;

    this.setDropDists(field);

    // Loop over each Puyo...
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const puyo = field.get(r, c);
        const name = PUYONAME[puyo];
        const sprite = this.sprites[r * cols + c];

        // Update the x, y, connectivity, alpha back to normal.
        sprite.x = this.cellPos.get(r, c).x;
        sprite.y = this.cellPos.get(r, c).y;
        this.connectivity.set(r, c, 0);
        sprite.alpha = 1;
        sprite.visible = true;

        // If the cell isn't a Puyo, or is empty, just have to set its type + _0.png
        if (!isColored(puyo)) {
          sprite.texture = this.textures[`${name}_0.png`];
          continue;
        }

        // Now for the colored Puyos...
        // Don't need to set connections for Puyos in the hidden rows
        if (r < hrows) {
          sprite.texture = this.textures[`${name}_0.png`];
          continue;
        }

        // Don't need to set connections for Puyos that are dropping
        const dist = this.dropDists.get(r, c);
        if (dist > 0) {
          sprite.texture = this.textures[`${name}_0.png`];
          continue;
        }

        // Otherwise, gotta check up down left and right for a matching Puyo
        // Check down. Down = 1
        const [dn, up, rt, lf] = [1, 2, 4, 8];
        let connection = 0;

        if (r < rows - 1 && field.get(r + 1, c) === puyo && this.dropDists.get(r + 1, c) === 0) connection += dn;
        if (r > hrows && field.get(r - 1, c) === puyo && this.dropDists.get(r - 1, c) === 0) connection += up;
        if (c < cols - 1 && field.get(r, c + 1) === puyo && this.dropDists.get(r, c + 1) === 0) connection += rt;
        if (c > 0 && field.get(r, c - 1) === puyo && this.dropDists.get(r, c - 1) === 0) connection += lf;

        // Update connectivity matrix
        this.connectivity.set(r, c, connection);

        sprite.texture = this.textures[`${name}_${connection}.png`];
      }
    }
  }

  private setDropDists(field: PuyoField): void {
    const rows = this.state.simSettings.rows;
    const cols = this.state.simSettings.cols;
    // const slideInd = this.state.slidePos;
    // const field = this.state.slides[slideInd].puyo;

    this.dropDists.reset();
    for (let c = 0; c < cols; c++) {
      let toDrop = 0;
      for (let r = rows - 1; r >= 0; r--) {
        const puyo = field.get(r, c);
        if (isBlock(puyo)) {
          this.dropDists.set(r, c, 0);
          toDrop = 0;
        } else if (isNone(puyo)) {
          toDrop += 1;
        } else {
          this.dropDists.set(r, c, toDrop);
        }
      }
    }
  }

  /**
   * Calculate how far the Puyos need to drop, in pixels.
   * The calculation is based off of dropDists from the solver (not the one in this class).
   */
  private calculateTargetPosition(): void {
    const rows = this.state.simSettings.rows;
    const cols = this.state.simSettings.cols;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dist = this.dropDists.get(r, c) * this.state.pxSizing.cellHeight;
        const target = this.cellPos.get(r, c).y + dist;
        this.targetY.set(r, c, target);
      }
    }
  }

  public prepAnimateChainDrops(startingField: PuyoField): void {
    // 1. Run refreshSprites(startingField) to disconnect falling Puyos
    console.log(get2d<number>(this.rows, this.cols, startingField.data));
    this.refreshSprites(startingField);

    // 2. Copy startingField over to tempField
    //    Remove Puyos that have dropDist > 0.
    //    Updates tempField.
    this.startingField = startingField; // store reference to original
    this.tempField.copyFrom(startingField);
    // this.removeDroppingPuyos();

    // 3. Calculate target positions for cells with dropDist > 0
    //    Updates targetY.
    this.calculateTargetPosition();

    // 4. Reset Tickers
    this.dropAnimationTickers.reset();
    this.dropFinishDelay = 0;
  }

  public animateChainDrops(delta: number): boolean {
    const rows = this.state.simSettings.rows;
    const cols = this.state.simSettings.cols;
    const hrows = this.state.simSettings.hrows;

    for (let r = rows - 1; r >= 0; r--) {
      for (let c = 0; c < cols; c++) {
        // If this Puyo never needed to drop, skip
        const cellDist = this.dropDists.get(r, c);
        if (cellDist === 0) continue;

        // If the Puyo hasn't reached its target position yet, add more y
        const target = this.targetY.get(r, c);
        const sprite = this.sprites[r * cols + c];
        if (sprite.y < target) {
          sprite.y += this.state.puyoMovement.dropSpeedDuringChain;
          continue;
        }

        // If script reaches this point, then (sprite.y >= target)
        sprite.y = target;

        // Once the cell reaches its target position, play the bouncing animation
        // If the cell isn't colored, it doesn't need to play any animations.
        if (!isColored(this.startingField.get(r, c))) {
          this.dropAnimationTickers.increment(r, c);
          continue;
        }

        // If the cell IS colored, then swap around its sprites for the animation.
        const t = this.dropAnimationTickers.get(r, c);
        if (t < shortBounce.length) {
          const puyo = this.startingField.get(r, c);
          const name = PUYONAME[puyo];
          sprite.texture = this.textures[`${name}_${shortBounce[t]}.png`];
          this.dropAnimationTickers.increment(r, c);
          continue;
        }

        // If the cell is done with all its animations, then update
        // tempField and run refreshSprites using it.
        if (t >= shortBounce.length && cellDist > 0) {
          const puyo = this.startingField.get(r, c);
          const newR = r + cellDist;
          this.tempField.set(newR, c, puyo);
          this.tempField.set(r, c, 0);

          // put the sprite that fell back to its original position, empty
          this.sprites[r * cols + c].x = this.cellPos.get(r, c).x;
          this.sprites[r * cols + c].y = this.cellPos.get(r, c).y;
          this.sprites[r * cols + c].texture = this.textures['spacer_0.png'];
          this.connectivity.set(r, c, 0);

          // Update the new cell's connectivity, along with its neighbors.
          let connection = 0;
          // Check down
          if (newR < rows - 1 && puyo === this.tempField.get(newR + 1, c)) {
            // const [dn, up, rt, lf] = [1, 2, 4, 8];
            connection += 1;
            const nConnection = this.connectivity.addAt(newR + 1, c, 2);
            const nPuyo = this.tempField.get(newR + 1, c);
            const nName = PUYONAME[nPuyo];
            this.sprites[(newR + 1) * cols + c].texture = this.textures[`${nName}_${nConnection}.png`];
          }
          // Check up
          if (newR > hrows && puyo === this.tempField.get(newR - 1, c)) {
            connection += 2;
            const nConnection = this.connectivity.addAt(newR - 1, c, 1);
            const nPuyo = this.tempField.get(newR - 1, c);
            const nName = PUYONAME[nPuyo];
            this.sprites[(newR - 1) * cols + c].texture = this.textures[`${nName}_${nConnection}.png`];
          }
          // check right
          if (c < cols - 1 && puyo === this.tempField.get(newR, c + 1)) {
            connection += 4;
            const nConnection = this.connectivity.addAt(newR, c + 1, 8);
            const nPuyo = this.tempField.get(newR, c + 1);
            const nName = PUYONAME[nPuyo];
            this.sprites[newR * cols + c + 1].texture = this.textures[`${nName}_${nConnection}.png`];
          }
          // check left
          if (c > 0 && puyo === this.tempField.get(newR, c - 1)) {
            connection += 8;
            const nConnection = this.connectivity.addAt(newR, c - 1, 4);
            const nPuyo = this.tempField.get(newR, c - 1);
            const nName = PUYONAME[nPuyo];
            this.sprites[newR * cols + c - 1].texture = this.textures[`${nName}_${nConnection}.png`];
          }

          this.sprites[newR * cols + c].texture = this.textures[`${PUYONAME[puyo]}_${connection}.png`];
          this.connectivity.set(newR, c, connection);

          this.dropDists.set(r, c, 0);
          this.dropAnimationTickers.increment(r, c);
          continue;
        }
      }
    }

    if (this.dropDists.isAllZero()) {
      // Delay the end of the animation a little so there's time to see the full connection.
      if (this.dropFinishDelay === 0) {
        this.refreshSprites(this.tempField);
      }

      if (this.dropFinishDelay >= 3) {
        return true;
      }

      this.dropFinishDelay += 1;
    }
    return false;
  }

  public prepAnimatePops(fieldState: FieldState): void {
    this.toPop.copyFrom(fieldState.isPopping);
    this.tempField.copyFrom(fieldState.puyoField);
    this.popAnimationTicker = 0;
  }

  public animateChainPops(): boolean {
    // Do stuff

    if (this.popAnimationTicker < 60) {
      this.popAnimationTicker += 1;
    } else {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.toPop.get(r, c)) {
            this.tempField.set(r, c, 0);
          }
        }
      }
      this.refreshSprites(this.tempField);
      return true;
    }

    if (this.popAnimationTicker > 60) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.toPop.get(r, c)) {
            this.tempField.set(r, c, 0);
          }
        }
      }
      this.refreshSprites(this.tempField);
      return true;
    }

    return false;
  }

  private setEventHandlers() {
    // To be implemented
  }
}

export { Layer, LayerSettings, PuyoLayer };
