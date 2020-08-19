import { StateContainer } from './container';
import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { ASSET_PATH } from './constants';
import { PuyoLayer } from './layer';
import { Chainsim } from '.';

class ScoreDisplay extends StateContainer {
  private textures: PIXI.ITextureDictionary;
  private sprites: Sprite[];
  private puyoLayer: PuyoLayer;
  private chainsim: Chainsim;
  private score: number;

  constructor(parent: StateContainer, puyoLayer: PuyoLayer, chainsim: Chainsim) {
    super(parent);

    this.textures = this.resources[`${ASSET_PATH}/scoreFont.json`].textures as PIXI.ITextureDictionary;
    this.sprites = [];
    this.puyoLayer = puyoLayer;
    this.chainsim = chainsim;
    this.score = 0;

    // Initialize sprites
    for (let i = 0; i < 8; i++) {
      this.sprites[i] = new Sprite(this.textures['score_0.png']);
      this.sprites[i].scale.set(0.8, 0.8);
      this.sprites[i].anchor.set(0.5);
      this.sprites[i].x = this.sprites[i].width * 0.9 * i;
      this.sprites[i].y = 0;
      this.addChild(this.sprites[i]);
    }
  }

  public update(): void {
    const showScoreUpdate = this.score !== this.state.solver.states[this.state.solverStep].score;

    // The displayed score needs to be slightly older than what's in the solver state
    // so it can display without glitching during the popping animation.
    if (this.chainsim.animationState !== this.chainsim.animatePops) {
      this.score = this.state.solver.states[this.state.solverStep].score;
    }

    // Check if the puyoLayer is playing the popping animation.
    const puyoLayerPopping = this.puyoLayer.runningPopAnimation;
    // Check if we're actually in the animatePop state
    const correctState = this.chainsim.animationState === this.chainsim.animatePops;

    if (puyoLayerPopping && correctState) {
      this.showMultipliers();
    } else {
      if (showScoreUpdate) this.showScore();
    }
  }

  private reset(): void {
    for (let i = 0; i < 8; i++) {
      this.sprites[i].texture = this.textures['score_0.png'];
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
      this.sprites[i].texture = this.textures[`score_${scoreText[i - diff]}.png`];
    }
  }

  private showMultipliers(): void {
    const { PC, CB, GB, CP } = this.state.solver.states[this.state.solverStep];
    const left = (PC * 10).toString();
    const right = Math.min(Math.max(GB + CB + CP, 1), 999).toString();

    this.sprites.forEach((sprite) => (sprite.visible = false));

    this.sprites[4].visible = true;
    this.sprites[4].texture = this.textures['score_x.png'];

    for (let i = 1 + (3 - left.length); i < 4; i++) {
      this.sprites[i].visible = true;
      this.sprites[i].texture = this.textures[`score_${left[i - (1 + (3 - left.length))]}.png`];
    }

    for (let i = 5 + (3 - right.length); i < 8; i++) {
      this.sprites[i].visible = true;
      this.sprites[i].texture = this.textures[`score_${right[i - (5 + (3 - right.length))]}.png`];
    }
  }
}

export { ScoreDisplay };
