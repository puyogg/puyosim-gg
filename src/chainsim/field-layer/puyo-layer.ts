import * as PIXI from 'pixi.js';
import { Layer } from './layer';
import { PUYONAME, PUYOTYPE } from '../../solver/constants';
import { isColored, isBlock, isNone } from '../../solver/helper';
import { NumField, PuyoField } from '../../solver/field';
import { FieldState, Pos } from '../../solver';
import { colorPop } from '../animation/color-pop';
import { garbagePop } from '../animation/garbage-pop';
import { getSplitGroups, getStaggerValues } from '../animation/popping-stagger';
import { Chainsim } from '..';

const shortBounce = ['h', '0', 'v', 'v', '0', '0', 'h', 'h', '0', 'v', 'v', '0', '0', '0'];

class PuyoLayer extends Layer {
  private startingField: PuyoField;
  private dropDists: NumField;
  private connectivity: NumField;
  private targetY: NumField;
  private dropAnimationTickers: NumField;
  private dropFinishDelay: number;
  private popAnimationTicker: number;
  private poppingGroups: Pos[][];
  private poppingGarbage: Pos[];
  private poppingStagger: number[][];
  private garbageAdjacency: number[];

  public tempField: PuyoField;
  public runningPopAnimation: boolean; // Need to track this for the score display
  public runningBurstAnimation: boolean; // Need to track this for garbage tray & chain counter

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.dropDists = new NumField(this.rows, this.cols);
    this.connectivity = new NumField(this.rows, this.cols);
    this.targetY = new NumField(this.rows, this.cols);
    this.startingField = new PuyoField(this.rows, this.cols);
    this.tempField = new PuyoField(this.rows, this.cols);
    this.dropAnimationTickers = new NumField(this.rows, this.cols);
    this.popAnimationTicker = 0;
    this.poppingGroups = [];
    this.poppingStagger = [];
    this.poppingGarbage = [];
    this.garbageAdjacency = [];
    this.dropFinishDelay = 0;
    this.runningPopAnimation = false;
    this.runningBurstAnimation = false;

    this.init();
    // Set interaction handlers
    this.setEventHandlers();
  }

  public init(): void {
    // Initialize sprites
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const i = r * this.cols + c;
        this.sprites[i] = new PIXI.Sprite(this.puyoTextures[`spacer_0.png`]);
        const sprite = this.sprites[i];

        sprite.anchor.set(0.5);
        const { x, y } = this.cellPos.get(r, c);
        sprite.x = x;
        sprite.y = y;
        sprite.interactive = false;

        this.addChild(sprite);
      }
    }

    this.refreshSprites(this.simState.slides[this.simState.slidePos].puyo);
  }

  public refreshSprites(field: PuyoField): void {
    this.setDropDists(field);

    // Loop over each Puyo...
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const puyo = field.get(r, c);
        const name = PUYONAME[puyo];
        const sprite = this.sprites[r * this.cols + c];
        // sprite.addListener('pointerdown', () => console.log('one'));
        // sprite.addListener('pointerdown', () => console.log('two'));
        sprite.on('pointerdown', () => console.log('yeah?'));
        sprite.on('pointerdown', () => console.log('hm'));
        sprite.removeAllListeners();
        sprite.interactive = true;

        // Update the x, y, connectivity, alpha back to normal.
        sprite.x = this.cellPos.get(r, c).x;
        sprite.y = this.cellPos.get(r, c).y;
        this.connectivity.set(r, c, 0);
        sprite.alpha = 1;
        sprite.visible = true;

        // If the cell isn't a Puyo, or is empty, just have to set its type + _0.png
        if (!isColored(puyo)) {
          sprite.texture = this.puyoTextures[`${name}_0.png`];
          continue;
        }

        // Now for the colored Puyos...
        // Don't need to set connections for Puyos in the hidden rows
        if (r < this.hrows) {
          sprite.texture = this.puyoTextures[`${name}_0.png`];
          continue;
        }

        // Don't need to set connections for Puyos that are dropping
        const dist = this.dropDists.get(r, c);
        if (dist > 0) {
          sprite.texture = this.puyoTextures[`${name}_0.png`];
          continue;
        }

        // Otherwise, gotta check up down left and right for a matching Puyo
        // Check down. Down = 1
        const [dn, up, rt, lf] = [1, 2, 4, 8];
        let connection = 0;

        if (r < this.rows - 1 && field.get(r + 1, c) === puyo && this.dropDists.get(r + 1, c) === 0) connection += dn;
        if (r > this.hrows && field.get(r - 1, c) === puyo && this.dropDists.get(r - 1, c) === 0) connection += up;
        if (c < this.cols - 1 && field.get(r, c + 1) === puyo && this.dropDists.get(r, c + 1) === 0) connection += rt;
        if (c > 0 && field.get(r, c - 1) === puyo && this.dropDists.get(r, c - 1) === 0) connection += lf;

        // Update connectivity matrix
        this.connectivity.set(r, c, connection);

        sprite.texture = this.puyoTextures[`${name}_${connection}.png`];
      }
    }
  }

  private setDropDists(field: PuyoField): void {
    const rows = this.simState.simSettings.rows;
    const cols = this.simState.simSettings.cols;
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
    const rows = this.simState.simSettings.rows;
    const cols = this.simState.simSettings.cols;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dist = this.dropDists.get(r, c) * this.simState.pxSizing.cellHeight;
        const target = this.cellPos.get(r, c).y + dist;
        this.targetY.set(r, c, target);
      }
    }
  }

  public prepAnimateChainDrops(startingField: PuyoField): void {
    // 1. Run refreshSprites(startingField) to disconnect falling Puyos
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

    // console.log(get2d<number>(this.rows, this.cols, this.dropDists.data));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public animateChainDrops(delta: number): boolean {
    for (let r = this.rows - 1; r >= 0; r--) {
      for (let c = 0; c < this.cols; c++) {
        // If this Puyo never needed to drop, skip
        const cellDist = this.dropDists.get(r, c);
        if (cellDist === 0) continue;

        // If the Puyo hasn't reached its target position yet, add more y
        const target = this.targetY.get(r, c);
        const sprite = this.sprites[r * this.cols + c];
        if (sprite.y < target) {
          sprite.y += this.simState.puyoMovement.dropSpeedDuringChain;
          continue;
        }

        // If script reaches this point, then (sprite.y >= target)
        sprite.y = target;

        // If the cell IS colored, then swap around its sprites for the animation.
        const t = this.dropAnimationTickers.get(r, c);
        if (t < shortBounce.length) {
          const puyo = this.startingField.get(r, c);
          const name = PUYONAME[puyo];

          if (isColored(this.startingField.get(r, c))) {
            sprite.texture = this.puyoTextures[`${name}_${shortBounce[t]}.png`];
          }
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
          this.sprites[r * this.cols + c].x = this.cellPos.get(r, c).x;
          this.sprites[r * this.cols + c].y = this.cellPos.get(r, c).y;
          this.sprites[r * this.cols + c].texture = this.puyoTextures['spacer_0.png'];
          this.connectivity.set(r, c, 0);

          // If this was a colored Puyo, update the new puyo's connectivity, along with its neighbors.
          if (isColored(puyo)) {
            let connection = 0;
            // Check down
            if (
              newR < this.rows - 1 &&
              puyo === this.tempField.get(newR + 1, c) &&
              this.dropDists.get(newR + 1, c) === 0
            ) {
              // const [dn, up, rt, lf] = [1, 2, 4, 8];
              connection += 1;
              const nConnection = this.connectivity.addAt(newR + 1, c, 2);
              const nPuyo = this.tempField.get(newR + 1, c);
              const nName = PUYONAME[nPuyo];
              this.sprites[(newR + 1) * this.cols + c].texture = this.puyoTextures[`${nName}_${nConnection}.png`];
            }
            // Check up
            if (
              newR > this.hrows &&
              puyo === this.tempField.get(newR - 1, c) &&
              this.dropDists.get(newR - 1, c) === 0
            ) {
              connection += 2;
              const nConnection = this.connectivity.addAt(newR - 1, c, 1);
              const nPuyo = this.tempField.get(newR - 1, c);
              const nName = PUYONAME[nPuyo];
              this.sprites[(newR - 1) * this.cols + c].texture = this.puyoTextures[`${nName}_${nConnection}.png`];
            }
            // check right
            if (
              c < this.cols - 1 &&
              puyo === this.tempField.get(newR, c + 1) &&
              this.dropDists.get(newR, c + 1) === 0
            ) {
              connection += 4;
              const nConnection = this.connectivity.addAt(newR, c + 1, 8);
              const nPuyo = this.tempField.get(newR, c + 1);
              const nName = PUYONAME[nPuyo];
              this.sprites[newR * this.cols + c + 1].texture = this.puyoTextures[`${nName}_${nConnection}.png`];
            }
            // check left
            if (c > 0 && puyo === this.tempField.get(newR, c - 1) && this.dropDists.get(newR, c - 1) === 0) {
              connection += 8;
              const nConnection = this.connectivity.addAt(newR, c - 1, 4);
              const nPuyo = this.tempField.get(newR, c - 1);
              const nName = PUYONAME[nPuyo];
              this.sprites[newR * this.cols + c - 1].texture = this.puyoTextures[`${nName}_${nConnection}.png`];
            }
            this.sprites[newR * this.cols + c].texture = this.puyoTextures[`${PUYONAME[puyo]}_${connection}.png`];
            console.log(r, newR, c, connection);
            this.connectivity.set(newR, c, connection);
          } else {
            this.sprites[newR * this.cols + c].texture = this.puyoTextures[`${PUYONAME[puyo]}_0.png`];
            this.connectivity.set(newR, c, 0);
          }

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
    this.poppingGroups = getSplitGroups(fieldState.poppingGroups);
    this.poppingStagger = getStaggerValues(this.poppingGroups);
    this.poppingGarbage = [];
    this.garbageAdjacency = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const adjValue = fieldState.garbageAdjacency.get(r, c);
        if (adjValue > 0) {
          this.poppingGarbage.push({ row: r, col: c });
          this.garbageAdjacency.push(adjValue);
        }
      }
    }

    this.tempField.copyFrom(fieldState.puyoField);
    this.popAnimationTicker = 0;
  }

  public animateChainPops(): boolean {
    const popState: boolean[] = [];
    for (let g = 0; g < this.poppingGroups.length; g++) {
      for (let h = 0; h < this.poppingGroups[g].length; h++) {
        const { row: r, col: c } = this.poppingGroups[g][h];
        const color = this.tempField.get(r, c);
        const sprite = this.sprites[r * this.cols + c];
        const stagger = this.poppingStagger[g][h];
        const finished = colorPop(sprite, color, this.popAnimationTicker, stagger, this.puyoTextures);
        popState.push(finished);
      }
    }

    const garbageState: boolean[] = [];
    for (let i = 0; i < this.poppingGarbage.length; i++) {
      const { row: r, col: c } = this.poppingGarbage[i];
      const color = this.tempField.get(r, c);
      const sprite = this.sprites[r * this.cols + c];
      const adjValue = this.garbageAdjacency[i];
      const finished = garbagePop(sprite, color, adjValue, this.popAnimationTicker, this.puyoTextures);
      garbageState.push(finished);
    }

    if (popState.every((s) => s) && garbageState.every((s) => s)) {
      this.runningPopAnimation = false;
      this.runningBurstAnimation = false;

      // Colored Puyos:
      for (let g = 0; g < this.poppingGroups.length; g++) {
        for (let h = 0; h < this.poppingGroups[g].length; h++) {
          const { row: r, col: c } = this.poppingGroups[g][h];
          this.tempField.set(r, c, PUYOTYPE.NONE);
        }
      }

      // Garbage Puyos
      for (let i = 0; i < this.poppingGarbage.length; i++) {
        const { row: r, col: c } = this.poppingGarbage[i];
        const adjValue = this.garbageAdjacency[i];
        const puyo = this.tempField.get(r, c);
        if (puyo === PUYOTYPE.HARD && adjValue === 1) {
          this.tempField.set(r, c, PUYOTYPE.GARBAGE);
        } else {
          this.tempField.set(r, c, PUYOTYPE.NONE);
        }
      }

      this.refreshSprites(this.tempField);
      return true;
    } else {
      this.runningPopAnimation = this.popAnimationTicker >= 8;
      this.runningBurstAnimation = this.popAnimationTicker >= 39;
    }

    this.popAnimationTicker += 1;

    return false;
  }

  private setEventHandlers() {
    // To be implemented
  }
}

export { PuyoLayer };
