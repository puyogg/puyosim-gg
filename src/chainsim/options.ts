import * as PIXI from 'pixi.js';
import { SimContainer } from './container';
import { Chainsim } from '.';
import { Button } from './toolbox/button';
import { ASSET_PATH } from './constants';
import { Toolbox } from './toolbox';

export class OptionButtons extends SimContainer {
  private toolTextures: PIXI.ITextureDictionary;
  private toolbox: Toolbox;

  private btnEdit: Button;
  private btnGame: Button;

  constructor(chainsim: Chainsim) {
    super(chainsim);
    this.toolbox = this.chainsim.toolbox as Toolbox;

    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;

    this.btnEdit = new Button(this.toolTextures['btn_edit.png'], this.toolTextures['btn_edit_pressed.png']);
    this.btnEdit.anchor.set(0.5);
    this.btnEdit.on('pointerdown', () => {
      this.toolbox.simAndEdit.visible = true;
      this.toolbox.gameTools.visible = false;
      this.simState.mode = 'editor';
      this.chainsim.solverReset();
    });

    this.btnGame = new Button(this.toolTextures['btn_game.png'], this.toolTextures['btn_game_pressed.png']);
    this.btnGame.anchor.set(0.5);
    this.btnGame.position.set(this.btnGame.width, 0);
    this.btnGame.on('pointerdown', () => {
      this.chainsim.solverReset();
      this.toolbox.simAndEdit.visible = false;
      this.toolbox.gameTools.visible = true;
      this.simState.mode = 'game';
      if (this.simState.slidePos === 0) this.chainsim.animationState = this.chainsim.animateNextWindow;
    });

    this.addChild(this.btnEdit, this.btnGame);
  }
}
