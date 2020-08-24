import { SimContainer } from '../container';
import { Chainsim } from '..';
import { Button } from './button';

class SimTools extends SimContainer {
  private btnShare: Button;
  private btnReset: Button;
  private btnBack: Button;
  private btnPause: Button;
  private btnStep: Button;
  private btnPlay: Button;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.btnShare = new Button(this.toolTextures['btn_share.png'], this.toolTextures['btn_share_pressed.png']);
    this.btnShare.anchor.set(0.5);
    this.btnShare.position.set(0, 0);
    this.btnShare.on('pointerdown', () => {
      console.log(this.simState.slides[this.simState.slidePos]);
    });
    this.addChild(this.btnShare);

    this.btnReset = new Button(this.toolTextures['btn_reset.png'], this.toolTextures['btn_reset_pressed.png']);
    this.btnReset.anchor.set(0.5);
    this.btnReset.position.set(79, 0);
    this.btnReset.on('pointerdown', () => this.chainsim.solverReset());
    this.addChild(this.btnReset);

    this.btnBack = new Button(this.toolTextures['btn_back.png'], this.toolTextures['btn_back_pressed.png']);
    this.btnBack.anchor.set(0.5);
    this.btnBack.position.set(0, 72);
    this.btnBack.on('pointerdown', () => this.chainsim.solverStepBack());
    this.addChild(this.btnBack);

    this.btnPause = new Button(this.toolTextures['btn_pause.png'], this.toolTextures['btn_pause_pressed.png']);
    this.btnPause.anchor.set(0.5);
    this.btnPause.position.set(79, 72);
    this.btnPause.on('pointerdown', () => this.chainsim.solverPause());
    this.addChild(this.btnPause);

    this.btnStep = new Button(this.toolTextures['btn_step.png'], this.toolTextures['btn_step_pressed.png']);
    this.btnStep.anchor.set(0.5);
    this.btnStep.position.set(0, 144);
    this.btnStep.on('pointerdown', () => this.chainsim.solverStep());
    this.addChild(this.btnStep);

    this.btnPlay = new Button(this.toolTextures['btn_play.png'], this.toolTextures['btn_play_pressed.png']);
    this.btnPlay.anchor.set(0.5);
    this.btnPlay.position.set(79, 144);
    this.btnPlay.on('pointerdown', () => this.chainsim.solverPlay());
    this.addChild(this.btnPlay);
  }
}

export { SimTools };
