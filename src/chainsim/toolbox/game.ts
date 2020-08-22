import { SimContainer } from '../container';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import { Button } from './button';
import { ActivePairContainer } from '../active-pair';
import { isNone } from '../../solver/helper';
import { Frame } from '../frame';
import { PuyoField } from '../../solver/field';

export class GameTools extends SimContainer {
  private toolTextures: PIXI.ITextureDictionary;
  private activePair: ActivePairContainer;

  private btnLeft: Button;
  private btnRight: Button;
  private btnDown: Button;
  private btnRotL: Button;
  private btnRotR: Button;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.activePair = this.chainsim.activePair as ActivePairContainer;

    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;

    this.btnRotL = new Button(this.toolTextures['btn_rotateleft.png'], this.toolTextures['btn_rotateleft_pressed.png']);
    this.btnRotL.anchor.set(0.5);
    this.btnRotL.position.set(0, 0);
    this.btnRotL.on('pointerdown', () => {
      this.rotL();
    });

    this.btnRotR = new Button(
      this.toolTextures['btn_rotateright.png'],
      this.toolTextures['btn_rotateright_pressed.png'],
    );
    this.btnRotR.anchor.set(0.5);
    this.btnRotR.position.set(80, 0);
    this.btnRotR.on('pointerdown', () => this.rotR());

    this.btnLeft = new Button(this.toolTextures['btn_left.png'], this.toolTextures['btn_left_pressed.png']);
    this.btnLeft.anchor.set(0.5);
    this.btnLeft.position.set(0, 72);
    this.btnLeft.on('pointerdown', () => {
      this.shiftL();
    });

    this.btnRight = new Button(this.toolTextures['btn_right.png'], this.toolTextures['btn_right_pressed.png']);
    this.btnRight.anchor.set(0.5);
    this.btnRight.position.set(80, 72);
    this.btnRight.on('pointerdown', () => {
      this.shiftR();
    });

    this.btnDown = new Button(this.toolTextures['btn_down.png'], this.toolTextures['btn_down_pressed.png']);
    this.btnDown.anchor.set(0.5);
    this.btnDown.position.set(40, 144);
    this.btnDown.on('pointerdown', () => this.down());

    this.addChild(this.btnRotL, this.btnRotR, this.btnLeft, this.btnRight, this.btnDown);
  }

  private shiftL(): void {
    const axisPos = this.activePair.getAxisCell();
    const freePos = this.activePair.getFreeCell();

    if (freePos.col === 0 || axisPos.col === 0) {
      return;
    } else {
      this.activePair.setAxisCell(axisPos.row, axisPos.col - 1);
      this.activePair.setFreeCell(freePos.row, freePos.col - 1);
    }
  }

  private shiftR(): void {
    const axisPos = this.activePair.getAxisCell();
    const freePos = this.activePair.getFreeCell();
    const cols = this.simState.simSettings.cols;

    if (freePos.col === cols - 1 || axisPos.col === cols - 1) {
      return;
    } else {
      this.activePair.setAxisCell(axisPos.row, axisPos.col + 1);
      this.activePair.setFreeCell(freePos.row, freePos.col + 1);
    }
  }

  private rotL(): void {
    const axisPos = this.activePair.getAxisCell();
    const freePos = this.activePair.getFreeCell();
    const orientation = this.activePair.getOrientation();
    const cols = this.simState.simSettings.cols;
    const field = this.simState.slides[this.simState.slidePos].puyo;

    if (orientation === 'up') {
      if (axisPos.col === 0) {
        // Push away from the wall
        this.activePair.setAxisCell(axisPos.row, axisPos.col + 1);
        this.activePair.setFreeCell(freePos.row + 1, freePos.col);
      } else {
        this.activePair.setAxisCell(axisPos.row, axisPos.col);
        this.activePair.setFreeCell(freePos.row + 1, freePos.col - 1);
      }
    } else if (orientation === 'down') {
      if (axisPos.col === cols - 1) {
        // Push away from the wall
        this.activePair.setAxisCell(axisPos.row, axisPos.col - 1);
        this.activePair.setFreeCell(freePos.row - 1, freePos.col);
      } else {
        this.activePair.setAxisCell(axisPos.row, axisPos.col);
        this.activePair.setFreeCell(freePos.row - 1, freePos.col + 1);
      }
    } else if (orientation === 'left') {
      if (axisPos.row === 1 && !isNone(field.get(0, axisPos.col))) {
        this.activePair.setAxisCell(axisPos.row - 1, axisPos.col);
        this.activePair.setFreeCell(freePos.row, freePos.col + 1);
      } else {
        this.activePair.setAxisCell(axisPos.row, axisPos.col);
        this.activePair.setFreeCell(freePos.row + 1, freePos.col + 1);
      }
    } else if (orientation === 'right') {
      if (axisPos.row === 0) {
        this.activePair.setAxisCell(axisPos.row + 1, axisPos.col);
        this.activePair.setFreeCell(freePos.row, freePos.col - 1);
      } else {
        this.activePair.setAxisCell(axisPos.row, axisPos.col);
        this.activePair.setFreeCell(freePos.row - 1, freePos.col - 1);
      }
    }
  }

  private rotR(): void {
    const axisPos = this.activePair.getAxisCell();
    const freePos = this.activePair.getFreeCell();
    const orientation = this.activePair.getOrientation();
    const cols = this.simState.simSettings.cols;
    const field = this.simState.slides[this.simState.slidePos].puyo;

    if (orientation === 'up') {
      if (axisPos.col === cols - 1) {
        this.activePair.setAxisCell(axisPos.row, axisPos.col - 1);
        this.activePair.setFreeCell(freePos.row + 1, freePos.col);
      } else {
        this.activePair.setAxisCell(axisPos.row, axisPos.col);
        this.activePair.setFreeCell(freePos.row + 1, freePos.col + 1);
      }
    } else if (orientation === 'down') {
      if (axisPos.col === 0) {
        this.activePair.setAxisCell(axisPos.row, axisPos.col + 1);
        this.activePair.setFreeCell(freePos.row - 1, freePos.col);
      } else {
        this.activePair.setAxisCell(axisPos.row, axisPos.col);
        this.activePair.setFreeCell(freePos.row - 1, freePos.col - 1);
      }
    } else if (orientation === 'left') {
      if (axisPos.row === 0) {
        this.activePair.setAxisCell(axisPos.row + 1, axisPos.col);
        this.activePair.setFreeCell(freePos.row, freePos.col + 1);
      } else {
        this.activePair.setAxisCell(axisPos.row, axisPos.col);
        this.activePair.setFreeCell(freePos.row - 1, freePos.col + 1);
      }
    } else if (orientation === 'right') {
      if (axisPos.row === 1 && !isNone(field.get(0, axisPos.col))) {
        this.activePair.setAxisCell(axisPos.row - 1, axisPos.col);
        this.activePair.setFreeCell(freePos.row, freePos.col - 1);
      } else {
        this.activePair.setAxisCell(axisPos.row, axisPos.col);
        this.activePair.setFreeCell(freePos.row + 1, freePos.col - 1);
      }
    }
  }

  private down(): void {
    if (!this.activePair.validPlacement) return;

    const { rows, cols } = this.simState.simSettings;
    const axisPos = this.activePair.getAxisCell();
    const freePos = this.activePair.getFreeCell();
    const field = this.simState.slides[this.simState.slidePos].puyo;
    const newField = new PuyoField(rows, cols, field.data);
    if (axisPos.col === freePos.col) {
      const col = axisPos.col;
      if (axisPos.row < freePos.row) {
        newField.set(0, col, this.activePair.axisColor);
        newField.set(1, col, this.activePair.freeColor);
      } else {
        newField.set(1, col, this.activePair.axisColor);
        newField.set(0, col, this.activePair.freeColor);
      }
    } else {
      newField.set(0, axisPos.col, this.activePair.axisColor);
      newField.set(0, freePos.col, this.activePair.freeColor);
    }

    // Put the active pairs back in the default position...
    this.activePair.setAxisCell(1, 2);
    this.activePair.setFreeCell(0, 2);
    this.chainsim.prepDropActivePair(newField);
  }
}
