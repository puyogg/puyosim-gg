import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { PositionMatrix, Coord } from '../position';
import { AxisPuyo } from './axis';
import { Pos } from '../../solver';
import { isNone, isColored } from '../../solver/helper';
import { PUYOTYPE, PUYONAME } from '../../solver/constants';

export class ActivePairContainer extends SimContainer {
  public cellPos: PositionMatrix;
  public rows: number;
  public cols: number;

  public axisPuyo: AxisPuyo;
  public freePuyo: Sprite;

  private targetPos: PositionMatrix;
  private axisBlip: Sprite;
  private freeBlip: Sprite;
  public validPlacement: boolean;
  // public axisTargetPos: Pos;
  // public freeTargetPos: Pos;

  public axisColor: PUYOTYPE;
  public freeColor: PUYOTYPE;

  private ticker: number;
  private flashDuration: number;

  private prevState: (delta: number) => void;
  private prevSlide: number;
  private poolChanged: boolean;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    // const graphics = new PIXI.Graphics();
    // graphics.beginFill(0x00ffff);
    // graphics.drawRect(0, 0, 64 * 6, 60 * 3);
    // graphics.endFill();
    // this.addChild(graphics);

    this.rows = 3;
    this.cols = this.simState.simSettings.cols;
    this.ticker = 0;
    this.flashDuration = 45;
    this.validPlacement = true;
    this.prevState = this.chainsim.animationState;
    this.poolChanged = false;
    this.prevSlide = 0;

    this.cellPos = new PositionMatrix(
      3,
      this.simState.simSettings.cols,
      this.simState.pxSizing.cellWidth,
      this.simState.pxSizing.cellHeight,
    );

    this.axisColor = PUYOTYPE.RED;
    this.freeColor = PUYOTYPE.BLUE;

    this.axisPuyo = new AxisPuyo(this.puyoTextures['spacer_0.png'], this.puyoTextures['spacer_0.png']);
    this.axisPuyo.anchor.set(0.5);
    this.axisPuyo.x = this.cellPos.get(1, 2).x;
    this.axisPuyo.y = this.cellPos.get(1, 2).y;
    this.axisPuyo.interactive = true;
    this.axisPuyo.buttonMode = true;

    this.freePuyo = new Sprite(this.puyoTextures['spacer_0.png']);
    this.freePuyo.x = this.cellPos.get(0, 2).x;
    this.freePuyo.y = this.cellPos.get(0, 2).y;
    this.freePuyo.anchor.set(0.5);
    this.freePuyo.interactive = true;
    this.freePuyo.buttonMode = true;
    this.addChild(this.axisPuyo, this.freePuyo);

    // Calculate target position matrix for the blips
    this.targetPos = new PositionMatrix(
      this.simState.simSettings.rows,
      this.simState.simSettings.cols,
      this.simState.pxSizing.cellWidth,
      this.simState.pxSizing.cellHeight,
    );
    this.targetPos.addToY(120);

    this.axisBlip = new Sprite(this.puyoTextures['red_blip.png']);
    this.axisBlip.anchor.set(0.5);
    this.freeBlip = new Sprite(this.puyoTextures['blue_blip.png']);
    this.freeBlip.anchor.set(0.5);
    this.addChild(this.axisBlip, this.freeBlip);

    // Color Editing
    this.axisPuyo.on('pointerdown', () => {
      if (this.simState.slidePos > 0 && this.chainsim.nextWindow?.drawer.visible) {
        const poolIdx = this.simState.poolPos - 2;
        const tool = this.chainsim.nextWindow?.winState.currentTool;
        const reset = this.chainsim.nextWindow?.winState.reset;
        if (reset) {
          this.simState.pool[poolIdx] = this.simState.origPool[poolIdx];
        } else {
          this.simState.pool[poolIdx] = tool;
        }
      }

      this.simState.poolChanged = !this.simState.poolChanged;
    });

    this.freePuyo.on('pointerdown', () => {
      if (this.simState.slidePos > 0 && this.chainsim.nextWindow?.drawer.visible) {
        const poolIdx = this.simState.poolPos - 1;
        const tool = this.chainsim.nextWindow?.winState.currentTool;
        const reset = this.chainsim.nextWindow?.winState.reset;
        if (reset) {
          this.simState.pool[poolIdx] = this.simState.origPool[poolIdx];
        } else {
          this.simState.pool[poolIdx] = tool;
        }
      }

      this.simState.poolChanged = !this.simState.poolChanged;
    });
  }

  public refreshSprites(): void {
    const pool = this.simState.pool;
    const poolPos = this.simState.poolPos;

    const axisPuyo = pool[(poolPos - 2 + pool.length) % pool.length] as PUYOTYPE;
    this.axisColor = axisPuyo;
    const axisName = PUYONAME[axisPuyo];
    this.axisPuyo.texture = this.puyoTextures[`${axisName}_0.png`];
    this.axisPuyo.normalTexture = this.puyoTextures[`${axisName}_0.png`];
    this.axisPuyo.flashTexture = isColored(axisPuyo)
      ? this.puyoTextures[`${axisName}_outlined.png`]
      : this.puyoTextures[`${axisName}_0.png`];

    // Need to update spritesheet to account for garbage blip
    this.axisBlip.texture = this.puyoTextures[`${axisName}_blip.png`];

    const freePuyo = pool[(poolPos - 1 + pool.length) % pool.length] as PUYOTYPE;
    this.freeColor = freePuyo;
    const freeName = PUYONAME[freePuyo];
    this.freePuyo.texture = this.puyoTextures[`${freeName}_0.png`];
    this.freeBlip.texture = this.puyoTextures[`${freeName}_blip.png`];
  }

  public update(delta: number): void {
    // If the game returned to its idle state... refreshSprites
    if (
      (this.prevState !== this.chainsim.idle && this.chainsim.animationState === this.chainsim.idle) ||
      this.poolChanged !== this.simState.poolChanged ||
      this.prevSlide !== this.simState.slidePos
    ) {
      this.refreshSprites();
    }

    // Decide whether to truly show the Puyos and blips.
    // Don't show it on Move 0, during editing mode, or while chains are happening.
    const slidePos = this.simState.slidePos;
    if (slidePos === 0) {
      this.visible = false;
      this.axisColor = PUYOTYPE.NONE;
      this.freeColor = PUYOTYPE.NONE;
    } else if (this.chainsim.animationState === this.chainsim.idle && this.simState.mode === 'game') {
      this.visible = true;
      this.axisPuyo.isFlashing = this.ticker < this.flashDuration;
      this.updateBlips();
    } else {
      // this.axisPuyo.isFlashing = false;
      this.visible = false;
    }

    this.prevState = this.chainsim.animationState;
    this.poolChanged = this.simState.poolChanged;
    this.prevSlide = this.simState.slidePos;
    this.ticker = (this.ticker + 1) % (this.flashDuration * 2);
  }

  public getAxisCell(): Pos {
    const r = Math.floor(this.axisPuyo.y / this.simState.pxSizing.cellHeight);
    const c = Math.floor(this.axisPuyo.x / this.simState.pxSizing.cellWidth);
    return { row: r, col: c };
  }

  public getFreeCell(): Pos {
    const r = Math.floor(this.freePuyo.y / this.simState.pxSizing.cellHeight);
    const c = Math.floor(this.freePuyo.x / this.simState.pxSizing.cellWidth);
    return { row: r, col: c };
  }

  public getOrientation(): 'up' | 'down' | 'left' | 'right' {
    const axisPos = this.getAxisCell();
    const freePos = this.getFreeCell();

    if (axisPos.col === freePos.col) {
      if (axisPos.row > freePos.row) {
        return 'up';
      } else {
        return 'down';
      }
    } else {
      if (axisPos.col > freePos.col) {
        return 'left';
      } else {
        return 'right';
      }
    }
  }

  public setAxisCell(row: number, col: number): void {
    this.axisPuyo.x = this.cellPos.get(row, col).x;
    this.axisPuyo.y = this.cellPos.get(row, col).y;
  }

  public setFreeCell(row: number, col: number): void {
    this.freePuyo.x = this.cellPos.get(row, col).x;
    this.freePuyo.y = this.cellPos.get(row, col).y;
  }

  public updateBlips(): void {
    const axisPos = this.getAxisCell();
    const freePos = this.getFreeCell();
    const axisOffset = axisPos.row < freePos.row ? -1 : 0;
    const freeOffset = freePos.row < axisPos.row ? -1 : 0;

    // Find the surface cells
    // Axis Puyo:
    let axisTarget = this.simState.simSettings.rows - 1;
    const field = this.simState.slides[this.simState.slidePos].puyo;
    for (let r = 0; r < this.simState.simSettings.rows; r++) {
      const cell = field.get(r, axisPos.col);
      if (!isNone(cell)) {
        axisTarget = r - 1;
        break;
      }
    }

    let freeTarget = this.simState.simSettings.rows - 1;
    for (let r = 0; r < this.simState.simSettings.rows; r++) {
      const cell = field.get(r, freePos.col);
      if (!isNone(cell)) {
        freeTarget = r - 1;
        break;
      }
    }

    // Apply offsets
    axisTarget += axisOffset;
    freeTarget += freeOffset;

    // Send blips to their coordinates
    if (axisTarget >= 0) {
      this.axisBlip.visible = true;
      this.axisBlip.x = this.axisPuyo.x;
      this.axisBlip.y = this.targetPos.get(axisTarget, axisPos.col).y;
    } else {
      this.axisBlip.visible = false;
    }

    if (freeTarget >= 0) {
      this.freeBlip.visible = true;
      this.freeBlip.x = this.freePuyo.x;
      this.freeBlip.y = this.targetPos.get(freeTarget, freePos.col).y;
    } else {
      this.freeBlip.visible = false;
    }

    this.validPlacement = this.axisBlip.visible && this.freeBlip.visible;
    // this.axisTargetPos = { row: axisPos.row, col: axisTarget };
    // this.freeTargetPos = { row: freePos.row, col: freeTarget };
  }
}
