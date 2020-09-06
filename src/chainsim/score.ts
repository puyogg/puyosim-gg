import { SimContainer } from './container';
import { Sprite } from 'pixi.js';
import { PuyoLayer } from './field-layer';
import { Chainsim } from '.';

class ScoreDisplay extends SimContainer {
  private sprites: Sprite[];
  private puyoLayer: PuyoLayer;
  private score: number;

  private prevState: (delta: number) => void;

  constructor(chainsim: Chainsim, puyoLayer: PuyoLayer) {
    super(chainsim);

    this.sprites = [];
    this.puyoLayer = puyoLayer;
    this.chainsim = chainsim;
    this.score = 0;
    this.prevState = this.chainsim.idle;

    // Initialize sprites
    for (let i = 0; i < 8; i++) {
      this.sprites[i] = new Sprite(this.numTextures['score_0.png']);
      this.sprites[i].scale.set(0.8, 0.8);
      this.sprites[i].anchor.set(0.5);
      this.sprites[i].x = this.sprites[i].width * 0.9 * i;
      this.sprites[i].y = 0;
      this.addChild(this.sprites[i]);
    }
  }

  public update(): void {
    const showScoreUpdate = this.score !== this.simState.solver.states[this.simState.solverStep].score;

    if (this.chainsim.animationState === this.chainsim.idle && this.simState.mode === 'editor') {
      this.score = 0;
      this.showScore();
    }

    // The displayed score needs to be slightly older than what's in the solver state
    // so it can display without glitching during the popping animation.
    if (this.chainsim.animationState !== this.chainsim.animatePops) {
      this.score = this.simState.solver.states[this.simState.solverStep].score;
    }

    // Check if the puyoLayer is playing the popping animation.
    const puyoLayerPopping = this.puyoLayer.runningPopAnimation;
    // Check if we're actually in the animatePop state
    const correctState = this.chainsim.animationState === this.chainsim.animatePops;

    if (puyoLayerPopping && correctState) {
      this.showMultipliers();
    } else if (
      (this.prevState === this.chainsim.animatePops || this.prevState === this.chainsim.animateChainDrops) &&
      (this.chainsim.animationState === this.chainsim.idle ||
        this.chainsim.animationState === this.chainsim.chainPaused)
    ) {
      this.showScore();
    } else {
      if (showScoreUpdate) this.showScore();
    }

    this.prevState = this.chainsim.animationState;
  }

  private reset(): void {
    for (let i = 0; i < 8; i++) {
      this.sprites[i].texture = this.numTextures['score_0.png'];
      this.sprites[i].x = this.sprites[i].width * 0.9 * i;
      this.sprites[i].y = 0;
      this.sprites[i].visible = true;
    }
  }

  private showScore(): void {
    this.reset();

    const scoreText = this.score.toString();
    const diff = 8 - scoreText.length;

    for (let i = diff; i < 8; i++) {
      this.sprites[i].texture = this.numTextures[`score_${scoreText[i - diff]}.png`];
    }
  }

  private showMultipliers(): void {
    const { PC, CB, GB, CP } = this.simState.solver.states[this.simState.solverStep];
    const left = (PC * 10).toString();
    const right = Math.min(Math.max(GB + CB + CP, 1), 999).toString();

    this.sprites.forEach((sprite) => (sprite.visible = false));

    this.sprites[4].visible = true;
    this.sprites[4].texture = this.numTextures['score_x.png'];

    for (let i = 1 + (3 - left.length); i < 4; i++) {
      this.sprites[i].visible = true;
      this.sprites[i].texture = this.numTextures[`score_${left[i - (1 + (3 - left.length))]}.png`];
    }

    for (let i = 5 + (3 - right.length); i < 8; i++) {
      this.sprites[i].visible = true;
      this.sprites[i].texture = this.numTextures[`score_${right[i - (5 + (3 - right.length))]}.png`];
    }
  }
}

export { ScoreDisplay };
