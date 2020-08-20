import { Page } from './page';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js';
import { ToolNumber } from './tool';

export class PageNumber extends Page {
  private numTextures: PIXI.ITextureDictionary;
  private toolNumber: ToolNumber;
  private minus: Sprite;
  private plus: Sprite;
  private numContainer: Container;
  public currentTool: number; // Narrow type to number
  public displayNum: number;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.name = 'number';
    this.numTextures = this.resources[`${ASSET_PATH}/scoreFont.json`].textures as PIXI.ITextureDictionary;

    // Wrapper container for better relative positioning
    this.numContainer = new Container();
    this.numContainer.position.set(48 + 71, 120 + 71);
    this.addChild(this.numContainer);

    this.toolNumber = new ToolNumber(this.numTextures, this.toolCursor);
    this.toolNumber.interactive = true;
    this.toolNumber.buttonMode = true;
    this.numContainer.addChild(this.toolNumber);

    this.minus = new Sprite(this.toolboxTextures[`picker_arrow_left.png`]);
    this.minus.anchor.set(0.5);
    this.minus.scale.set(0.9);
    this.minus.position.set(-80, 0);
    this.minus.interactive = true;
    this.minus.buttonMode = true;
    this.numContainer.addChild(this.minus);

    this.plus = new Sprite(this.toolboxTextures[`picker_arrow_right.png`]);
    this.plus.anchor.set(0.5);
    this.plus.scale.set(0.9);
    this.plus.position.set(80, 0);
    this.plus.interactive = true;
    this.plus.buttonMode = true;
    this.numContainer.addChild(this.plus);

    this.currentTool = 0;
    this.displayNum = 1;
    this.toolNumber.setNumber(this.displayNum);
    this.setCurrent();

    // Set interaction
    this.minus.on('pointerdown', () => {
      this.decrement();
    });

    this.plus.on('pointerdown', () => {
      this.increment();
    });

    this.toolNumber.on('pointerdown', () => {
      this.currentTool = this.displayNum;
      this.setCurrent();
    });
  }

  public setCurrent(): void {
    this.simState.currentTool = this.currentTool;

    if (this.currentTool === 0) {
      this.toolCursor.x = this.delete.x;
      this.toolCursor.y = this.delete.y;
    } else {
      this.displayNum = this.currentTool;
      this.toolCursor.x = this.numContainer.x;
      this.toolCursor.y = this.numContainer.y;
      this.toolNumber.setNumber(this.displayNum);
    }
  }

  public increment(): void {
    // Update local and global tool value
    this.displayNum = (this.displayNum + 1) % 100;
    this.displayNum = this.displayNum === 0 ? 1 : this.displayNum;
    this.currentTool = this.displayNum;
    this.simState.currentTool = this.currentTool;

    // Update sprites and cursor position
    this.toolCursor.x = this.numContainer.x;
    this.toolCursor.y = this.numContainer.y;
    this.toolNumber.setNumber(this.displayNum);
  }

  public decrement(): void {
    // Update local and global tool value
    this.displayNum = this.displayNum - 1;
    this.displayNum = this.displayNum === 0 ? 99 : this.displayNum;
    this.currentTool = this.displayNum;
    this.simState.currentTool = this.currentTool;

    // Update sprites and cursor position
    this.toolCursor.x = this.numContainer.x;
    this.toolCursor.y = this.numContainer.y;
    this.toolNumber.setNumber(this.displayNum);
  }
}
