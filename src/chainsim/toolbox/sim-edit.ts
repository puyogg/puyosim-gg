import { SimContainer } from '../container';
import * as PIXI from 'pixi.js';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import { SimTools } from './sim';
import { EditingTools } from './edit';
import { Switch } from './switch';
import { Frame } from '../frame';

export class SimAndEdit extends SimContainer {
  private toolTextures: PIXI.ITextureDictionary;

  private simTools: SimTools;
  private editingTools: EditingTools;

  private simToolsBtn: Switch;
  private editToolsBtn: Switch;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;

    this.simToolsBtn = new Switch(this.toolTextures['btn_sim.png'], this.toolTextures['btn_sim_pressed.png']);
    this.simToolsBtn.down = true;
    this.simToolsBtn.anchor.set(0.5);
    this.simToolsBtn.position.set(56, -36);
    this.simToolsBtn.on('pointerdown', () => {
      this.simTools.visible = true;
      this.editingTools.visible = false;
      this.editToolsBtn.down = false;
      (this.chainsim.frame as Frame).editLayer.interactive = false;
      // May need to do other things, like reset the chain state...
    });
    this.addChild(this.simToolsBtn);

    this.editToolsBtn = new Switch(this.toolTextures['btn_puyo.png'], this.toolTextures['btn_puyo_pressed.png']);
    this.editToolsBtn.anchor.set(0.5);
    this.editToolsBtn.position.set(136, -36);
    this.editToolsBtn.on('pointerdown', () => {
      this.chainsim.solverReset();
      this.simTools.visible = false;
      this.editingTools.visible = true;
      this.simToolsBtn.down = false;
      (this.chainsim.frame as Frame).editLayer.interactive = true;
    });
    this.addChild(this.editToolsBtn);

    this.simTools = new SimTools(chainsim);
    this.simTools.position.set(56, 72);
    this.addChild(this.simTools);

    this.editingTools = new EditingTools(chainsim);
    this.editingTools.scale.set(0.8);
    this.editingTools.visible = false;
    this.addChild(this.editingTools);
  }
}
