import { SimContainer } from './container';
import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { ASSET_PATH } from './constants';
import { Chainsim } from '.';
import { Number3Digit } from './number';

export class SlideChanger extends SimContainer {
  private toolTextures: PIXI.ITextureDictionary;
  private numTextures: PIXI.ITextureDictionary;

  private slide: Sprite;
  private prevArrow: Sprite;
  private nextArrow: Sprite;
  private slideNum: Number3Digit;

  private prevNum: number;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    // Get references to textures
    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;
    this.numTextures = this.resources[`${ASSET_PATH}/scoreFont.json`].textures as PIXI.ITextureDictionary;

    this.slide = new Sprite(this.toolTextures['slide.png']);
    this.slide.position.set(-30, 0);
    this.slide.anchor.set(0.5);

    this.prevArrow = new Sprite(this.toolTextures['picker_arrow_left.png']);
    this.prevArrow.anchor.set(0.5);
    this.prevArrow.scale.set(0.8);
    this.prevArrow.position.set(-100, 0);
    this.prevArrow.on('pointerdown', () => this.prevSlide());
    this.prevArrow.interactive = true;
    this.prevArrow.buttonMode = true;

    this.nextArrow = new Sprite(this.toolTextures['picker_arrow_right.png']);
    this.nextArrow.anchor.set(0.5);
    this.nextArrow.scale.set(0.8);
    this.nextArrow.position.set(100, 0);
    this.nextArrow.on('pointerdown', () => this.nextSlide());
    this.nextArrow.interactive = true;
    this.nextArrow.buttonMode = true;

    this.slideNum = new Number3Digit(chainsim, 0, 'right');
    this.slideNum.scale.set(0.7);
    this.slideNum.position.set(60, -3);
    this.slideNum.setNumber(0);

    this.prevNum = 0;

    this.addChild(this.slide, this.prevArrow, this.nextArrow, this.slideNum);
  }

  public update(): void {
    if (this.prevNum !== this.simState.slidePos) {
      this.slideNum.setNumber(this.simState.slidePos);
    }
    this.prevNum = this.simState.slidePos;
  }

  private prevSlide(): void {
    this.chainsim.solverReset();
    this.simState.slidePos = Math.max(0, this.simState.slidePos - 1);
    this.simState.poolPos = Math.max(0, this.simState.poolPos - 2);

    // Add an extra thing to delete empty slides to save memory.
  }

  private nextSlide(): void {
    this.chainsim.solverReset();
    this.simState.slidePos += 1;
    this.simState.poolPos = (this.simState.poolPos + 2) % this.simState.pool.length;
    if (this.simState.slidePos >= this.simState.slides.length) {
      this.simState.addSlide(this.simState.slides[this.simState.slidePos - 1]);
    }
  }
}
