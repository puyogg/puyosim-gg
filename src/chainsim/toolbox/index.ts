import { SimContainer } from '../container';
import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import { Button } from './button';
import { SimTools } from './sim';
import { EditingTools } from './edit';

class Toolbox extends SimContainer {
  private layoutTextures: PIXI.ITextureDictionary;
  private toolboxTextures: PIXI.ITextureDictionary;

  private simTools: SimTools;
  private editingTools: EditingTools;

  private simToolsBtn: Button;
  private editToolsBtn: Button;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.layoutTextures = this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;
    this.toolboxTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;
    const toolbox = new Sprite(this.layoutTextures['toolbox.png']);
    this.addChild(toolbox);
    console.log(toolbox.width, toolbox.height);

    this.simToolsBtn = new Button(this.toolboxTextures['btn_sim.png']);
    this.simToolsBtn.pressed = this.toolboxTextures['btn_sim_pressed.png'];
    this.simToolsBtn.anchor.set(0.5);
    this.simToolsBtn.position.set(56, -36);
    this.addChild(this.simToolsBtn);

    this.editToolsBtn = new Button(this.toolboxTextures['btn_edit.png']);
    this.editToolsBtn.pressed = this.toolboxTextures['btn_edit_pressed.png'];
    this.editToolsBtn.anchor.set(0.5);
    this.editToolsBtn.position.set(136, -36);
    this.addChild(this.editToolsBtn);

    this.simTools = new SimTools(chainsim);
    this.simTools.position.set(56, 72);
    this.simTools.visible = false;
    this.addChild(this.simTools);

    this.editingTools = new EditingTools(chainsim);
    // this.editingTools.position.set(34, 34);
    this.editingTools.scale.set(0.8);
    this.addChild(this.editingTools);
  }
}

export { Toolbox };
