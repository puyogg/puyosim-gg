import { SimContainer } from './container';
import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { ASSET_PATH } from './constants';
import { Chainsim } from '.';
import { PuyoLayer } from './field-layer';
import { countGarbageIcons } from './math/count-garbage-icons';

class GarbageTray extends SimContainer {
  // Access to other components
  private puyoLayer: PuyoLayer;

  private trayTextures: PIXI.ITextureDictionary;
  private puyoTextures: PIXI.ITextureDictionary;
  private numTextures: PIXI.ITextureDictionary;

  private icons: Sprite[];
  private numbers: Sprite[];
  private tray: Sprite;
  private count: number;
  private targetCoords: number[];
  private showCount: boolean;

  private prevState: (delta: number) => void;
  private solverPos: number;

  constructor(chainsim: Chainsim, puyoLayer: PuyoLayer) {
    super(chainsim);

    this.puyoLayer = puyoLayer;
    this.prevState = this.chainsim.idle;
    this.solverPos = 0;

    this.trayTextures = this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;
    this.puyoTextures = this.resources[`${ASSET_PATH}/puyo.json`].textures as PIXI.ITextureDictionary;
    this.numTextures = this.resources[`${ASSET_PATH}/scoreFont.json`].textures as PIXI.ITextureDictionary;

    // Garbage Tray
    this.tray = new Sprite(this.trayTextures['garbage_tray.png']);
    this.addChild(this.tray);
    this.count = 0;

    // Initialize garbage icons
    this.icons = [];
    this.targetCoords = [];
    const xo = 10;
    for (let i = 0; i < 6; i++) {
      this.icons[i] = new Sprite(this.puyoTextures['spacer_0.png']);
      this.addChild(this.icons[i]);
      this.icons[i].x = xo + this.icons[i].width * i;
      this.targetCoords[i] = xo + this.icons[i].width * i;
      this.icons[i].y = -6;
    }

    // Initialize garbage count numbers
    this.numbers = [];
    for (let i = 0; i < 8; i++) {
      this.numbers[i] = new Sprite(this.numTextures['score_0.png']);
      this.numbers[i].anchor.set(0.5);
      this.numbers[i].x = 120 + this.numbers[i].width * 0.9 * i;
      this.numbers[i].y = 24;
      this.numbers[i].visible = false;
      this.numbers[i].alpha = 0;
      this.addChild(this.numbers[i]);
    }

    // Toggle what's displayed
    this.interactive = true;
    this.on('pointertap', () => {
      this.toggleDisplay();
    });
    this.showCount = false;
  }

  public toggleDisplay(showCount?: boolean): void {
    if (showCount === undefined) {
      this.showCount = !this.showCount;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(delta: number): void {
    this.setVisibility();

    const showGarbageUpdate = this.count !== this.simState.solver.states[this.simState.solverStep].garbage;
    const puyoLayerBursting = this.puyoLayer.runningBurstAnimation;
    const correctState = this.chainsim.animationState === this.chainsim.animatePops;
    const popSkipped =
      this.prevState === this.chainsim.animatePops && this.chainsim.animationState === this.chainsim.chainPaused;
    const wentBack = this.solverPos > this.simState.solverStep;
    if ((puyoLayerBursting && correctState && showGarbageUpdate) || (showGarbageUpdate && popSkipped) || wentBack) {
      // console.log(showGarbageUpdate, puyoLayerBursting, correctState, popSkipped, wentBack);
      this.solverPos = this.simState.solverStep;
      this.count = this.simState.solver.states[this.simState.solverStep].garbage;
      this.prepGarbageAnimation();
      this.setNumbers();
    }
    // else if (showGarbageUpdate && this.simState.solver.states[this.simState.solverStep].garbage === 0) {
    //   console.log('Yeah');
    //   this.solverPos = this.simState.solverStep;
    //   this.count = this.simState.solver.states[this.simState.solverStep].garbage;
    //   this.prepGarbageAnimation();
    //   this.setNumbers();
    // }

    this.prevState = this.chainsim.animationState;
    this.animateGarbage();
  }

  public setVisibility(): void {
    if (this.showCount) {
      this.icons.forEach((icon) => (icon.visible = false));
      this.numbers.forEach((num) => (num.visible = true));
    } else {
      this.icons.forEach((icon) => (icon.visible = true));
      this.numbers.forEach((num) => (num.visible = false));
    }
  }

  private prepGarbageAnimation(): void {
    this.icons.forEach((icon) => {
      icon.alpha = 0;
    });

    const iconNames = countGarbageIcons(this.count);
    const centerX = (this.icons[2].x + this.icons[3].x) / 2;

    for (let i = 0; i < iconNames.length; i++) {
      this.icons[i].texture = this.puyoTextures[iconNames[i]];
      this.icons[i].alpha = 1;
      // this.icons[i].x = 10;
      this.icons[i].x = centerX;
    }
  }

  private setNumbers(): void {
    const countText = this.count.toString();

    for (let i = 0; i < this.numbers.length; i++) {
      if (i >= countText.length) {
        this.numbers[i].alpha = 0;
      } else {
        this.numbers[i].alpha = 1;
        this.numbers[i].texture = this.numTextures[`score_${countText[i]}.png`];
      }
    }

    // Align right
    const centerX = 224;
    const xo = centerX - this.numbers[0].width * 0.9 * countText.length;
    for (let i = 0; i < countText.length; i++) {
      this.numbers[i].x = xo + this.numbers[i].width * 0.9 * i;
    }
  }

  // Slide out garbage from left to right
  private animateGarbage(): void {
    const centerX = (this.icons[2].x + this.icons[3].x) / 2;
    for (let i = 0; i < this.icons.length; i++) {
      const icon = this.icons[i];
      const targetX = this.targetCoords[i];
      const toAdd = (targetX - centerX) / 8;

      if ((toAdd > 0 && icon.x + toAdd >= targetX) || (toAdd < 0 && icon.x + toAdd <= targetX)) {
        icon.x = targetX;
      } else {
        icon.x += toAdd;
      }
    }
  }
}

export { GarbageTray };
