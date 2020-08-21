import * as PIXI from 'pixi.js';
import { SimContainer } from '../container';
import { Graphics } from 'pixi.js';
import { Layer } from './layer';
import { Chainsim } from '..';
import { PuyoField, BoolField, NumField } from '../../solver/field';
import { PUYOTYPE } from '../../solver/constants';
import { get2d } from '../../solver/helper';

export class EditLayer extends SimContainer {
  private rect: Graphics;
  private layers: Layer[];

  private pointerOver: boolean;
  private pointerDown: boolean;

  private row: number;
  private col: number;

  public currentTool: PUYOTYPE | number | boolean;
  public currentLayer: number;

  constructor(chainsim: Chainsim, layers: Layer[]) {
    super(chainsim);

    this.layers = layers;
    this.currentTool = 0;
    this.currentLayer = 0;

    // Put a layer over the whole field
    this.rect = new Graphics();
    this.rect.beginFill(0x000000);
    this.rect.alpha = 0;
    this.rect.drawRect(0, 0, 64 * 6, 60 * 13);
    this.rect.endFill();
    this.addChild(this.rect);

    this.pointerOver = false;
    this.pointerDown = false;

    this.row = 0;
    this.col = 0;

    this.interactive = false;

    this.on('pointerover', () => (this.pointerOver = true));
    this.on('pointerdown', (event: PIXI.InteractionEvent) => {
      if (this.chainsim.animationState === this.chainsim.idle) {
        this.pointerDown = true;
        const pos = event.data.getLocalPosition(this);
        const { x, y } = pos;
        this.row = Math.floor(y / this.chainsim.state.pxSizing.cellHeight);
        this.col = Math.floor(x / this.chainsim.state.pxSizing.cellWidth);
        this.setCellData();
      }
    });
    this.on('pointermove', (event: PIXI.InteractionEvent) => {
      if (this.pointerOver && this.pointerDown && this.chainsim.animationState === this.chainsim.idle) {
        const pos = event.data.getLocalPosition(this);
        const { x, y } = pos;
        this.row = Math.floor(y / this.chainsim.state.pxSizing.cellHeight);
        this.col = Math.floor(x / this.chainsim.state.pxSizing.cellWidth);
        this.setCellData();
      }
    });

    this.on('pointerup', () => (this.pointerDown = false));
    this.on('pointerout', () => (this.pointerOver = false));
    this.on('pointerupoutside', () => (this.pointerOver = false));
  }

  public setCellData(): void {
    const slide = this.simState.slides[this.simState.slidePos];
    const slideFields = [slide.puyo, slide.shadow, slide.arrow, slide.cursor, slide.number];
    const targetField = slideFields[this.currentLayer];
    const targetLayer = this.layers[this.currentLayer];

    if (targetField instanceof PuyoField && typeof this.currentTool === 'number') {
      targetField.set(this.row, this.col, this.currentTool);
      targetLayer.refreshSprites(targetField);
    } else if (targetField instanceof BoolField) {
      targetField.set(this.row, this.col, !!this.currentTool);
      targetLayer.refreshSprites(targetField);
    } else if (targetField instanceof NumField && typeof this.currentTool === 'number') {
      targetField.set(this.row, this.col, this.currentTool);
      targetLayer.refreshSprites(targetField);
    }
  }

  public clearAllCells(): void {
    const slide = this.simState.slides[this.simState.slidePos];
    const slideFields = [slide.puyo, slide.shadow, slide.arrow, slide.cursor, slide.number];
    const targetField = slideFields[this.currentLayer];
    const targetLayer = this.layers[this.currentLayer];

    if (targetField instanceof PuyoField && typeof this.currentTool === 'number') {
      targetField.data.fill(0);
      targetLayer.refreshSprites(targetField);
    } else if (targetField instanceof BoolField) {
      targetField.data.fill(false);
      targetLayer.refreshSprites(targetField);
    } else if (targetField instanceof NumField && typeof this.currentTool === 'number') {
      targetField.data.fill(0);
      targetLayer.refreshSprites(targetField);
    }
  }
}
