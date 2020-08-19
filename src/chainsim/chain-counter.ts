import { SimContainer } from './container';
import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { ASSET_PATH } from './constants';
import { Chainsim } from '.';
import { PuyoLayer } from './field-layer';

class ChainCounter extends SimContainer {
  // Access to other components
  private puyoLayer: PuyoLayer;
  private container: PIXI.Container;

  private textures: PIXI.ITextureDictionary;
  private firstDigit: Sprite;
  private secondDigit: Sprite;
  private chainText: Sprite;

  private chain: number;

  private velocity: number;
  private acceleration: number;

  constructor(chainsim: Chainsim, puyoLayer: PuyoLayer) {
    super(chainsim);

    this.puyoLayer = puyoLayer;
    this.chainsim = chainsim;

    this.textures = this.resources[`${ASSET_PATH}/chain_font.json`].textures as PIXI.ITextureDictionary;

    // Everything moves together, but I don't want to mess up any global positioning
    // Make a nested container
    this.container = new PIXI.Container();
    this.addChild(this.container);

    // Numbers
    this.firstDigit = new Sprite(this.textures['chain_1.png']);
    this.firstDigit.scale.set(0.85);
    this.container.addChild(this.firstDigit);
    this.secondDigit = new Sprite(this.textures['chain_8.png']);
    this.secondDigit.scale.set(0.85);
    this.secondDigit.x = 40;
    this.container.addChild(this.secondDigit);
    this.firstDigit.visible = false;
    this.secondDigit.visible = false;

    // Chain!
    this.chainText = new Sprite(this.textures['chain_text.png']);
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
    const correctState = this.chainsim.animationState === this.chainsim.animatePops;

    if (puyoLayerBursting && correctState && showNumberUpdate) {
      this.chain = this.simState.solver.states[this.simState.solverStep].chainLength;
      this.prepAnimation();
    }

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
      this.secondDigit.texture = this.textures[`chain_${this.chain}.png`];
    } else {
      const chainString = this.chain.toString();
      this.firstDigit.visible = true;
      this.secondDigit.visible = true;
      this.chainText.visible = true;
      this.firstDigit.texture = this.textures[`chain_${chainString[0]}.png`];
      this.secondDigit.texture = this.textures[`chain_${chainString[1]}.png`];
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
