import { SimContainer } from '../container';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import { Button } from './button';

class SimTools extends SimContainer {
  private toolboxTextures: PIXI.ITextureDictionary;

  private btnShare: Button;
  private btnReset: Button;
  private btnBack: Button;
  private btnPause: Button;
  private btnStep: Button;
  private btnPlay: Button;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.toolboxTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;

    this.btnShare = new Button(this.toolboxTextures['btn_share.png'], this.toolboxTextures['btn_share_pressed.png']);
    this.btnShare.anchor.set(0.5);
    this.btnShare.position.set(0, 0);
    this.addChild(this.btnShare);

    this.btnReset = new Button(this.toolboxTextures['btn_reset.png'], this.toolboxTextures['btn_reset_pressed.png']);
    this.btnReset.anchor.set(0.5);
    this.btnReset.position.set(79, 0);
    this.addChild(this.btnReset);

    this.btnBack = new Button(this.toolboxTextures['btn_back.png'], this.toolboxTextures['btn_back_pressed.png']);
    this.btnBack.anchor.set(0.5);
    this.btnBack.position.set(0, 72);
    this.addChild(this.btnBack);

    this.btnPause = new Button(this.toolboxTextures['btn_pause.png'], this.toolboxTextures['btn_pause_pressed.png']);
    this.btnPause.anchor.set(0.5);
    this.btnPause.position.set(79, 72);
    this.addChild(this.btnPause);

    this.btnStep = new Button(this.toolboxTextures['btn_step.png'], this.toolboxTextures['btn_step_pressed.png']);
    this.btnStep.anchor.set(0.5);
    this.btnStep.position.set(0, 144);
    this.addChild(this.btnStep);

    this.btnPlay = new Button(this.toolboxTextures['btn_play.png'], this.toolboxTextures['btn_play_pressed.png']);
    this.btnPlay.anchor.set(0.5);
    this.btnPlay.position.set(79, 144);
    this.addChild(this.btnPlay);
  }
}

export { SimTools };
