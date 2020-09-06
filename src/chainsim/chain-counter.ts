import { SimContainer } from './container';
import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { Chainsim } from '.';
import { PuyoLayer } from './field-layer';

class ChainCounter extends SimContainer {
  // Access to other components
  private puyoLayer: PuyoLayer;
  private container: PIXI.Container;

  private firstDigit: Sprite;
  private secondDigit: Sprite;
  private chainText: Sprite;

  private chain: number;

  private velocity: number;
  private acceleration: number;

  private prevState: (delta: number) => void;
  private solverPos: number;

  constructor(chainsim: Chainsim, puyoLayer: PuyoLayer) {
    super(chainsim);

    this.puyoLayer = puyoLayer;
    this.chainsim = chainsim;
    this.prevState = this.chainsim.idle;
    this.solverPos = 0;

    // Everything moves together, but I don't want to mess up any global positioning
    // Make a nested container
    this.container = new PIXI.Container();
    this.addChild(this.container);

    // Numbers
    this.firstDigit = new Sprite(this.chainFontTextures['chain_1.png']);
    this.firstDigit.scale.set(0.85);
    this.container.addChild(this.firstDigit);
    this.secondDigit = new Sprite(this.chainFontTextures['chain_8.png']);
    this.secondDigit.scale.set(0.85);
    this.secondDigit.x = 40;
    this.container.addChild(this.secondDigit);
    this.firstDigit.visible = false;
    this.secondDigit.visible = false;

    // Chain!
    this.chainText = new Sprite(this.chainFontTextures['chain_text.png']);
    this.chainText.x = 84;
    this.chainText.y = 8;
    this.chainText.scale.set(0.85);
    this.container.addChild(this.chainText);
    this.chainText.visible = false;

    this.chain = 0;

    this.velocity = 0;
    this.acceleration = -2;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(delta: number): void {
    const showNumberUpdate = this.chain !== this.simState.solver.states[this.simState.solverStep].chainLength;
    const puyoLayerBursting = this.puyoLayer.runningBurstAnimation;
    const isPopping = this.chainsim.animationState === this.chainsim.animatePops;
    const popSkipped =
      this.prevState === this.chainsim.animatePops && this.chainsim.animationState === this.chainsim.chainPaused;
    const wentBack = this.solverPos > this.simState.solverStep;

    // console.log(this.simState.solver.states[this.simState.solverStep].chainLength);
    if ((puyoLayerBursting && isPopping && showNumberUpdate) || (showNumberUpdate && popSkipped) || wentBack) {
      this.solverPos = this.simState.solverStep;
      this.chain = this.simState.solver.states[this.simState.solverStep].chainLength;
      this.prepAnimation();
    } else if (
      (this.simState.solver.states[this.simState.solverStep].chainLength === 0 ||
        this.chainsim.animationState === this.chainsim.idle) &&
      this.simState.mode === 'editor'
    ) {
      this.firstDigit.visible = false;
      this.secondDigit.visible = false;
      this.chainText.visible = false;
      this.chain = 0;
      this.solverPos = 0;
    }

    this.prevState = this.chainsim.animationState;
    this.animate();
  }

  private prepAnimation(): void {
    this.container.x = -30;

    if (this.chain === 0) {
      this.firstDigit.visible = false;
      this.secondDigit.visible = false;
      this.chainText.visible = false;
      return;
    }

    if (this.chain < 10) {
      this.firstDigit.visible = false;
      this.secondDigit.visible = true;
      this.chainText.visible = true;
      this.secondDigit.texture = this.chainFontTextures[`chain_${this.chain}.png`];
    } else {
      const chainString = this.chain.toString();
      this.firstDigit.visible = true;
      this.secondDigit.visible = true;
      this.chainText.visible = true;
      this.firstDigit.texture = this.chainFontTextures[`chain_${chainString[0]}.png`];
      this.secondDigit.texture = this.chainFontTextures[`chain_${chainString[1]}.png`];
    }

    this.velocity = 10;
  }

  private animate(): void {
    this.container.x += this.velocity;
    this.velocity = Math.max(this.velocity + this.acceleration, 0);

    if (this.container.x > 0) {
      this.container.x = 0;
    }
  }
}

export { ChainCounter };
