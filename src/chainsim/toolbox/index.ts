import { SimContainer } from '../container';
import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import { SimAndEdit } from './sim-edit';
import { GameTools } from './game';

export class Toolbox extends SimContainer {
  private layoutTextures: PIXI.ITextureDictionary;
  private toolTextures: PIXI.ITextureDictionary;

  public simAndEdit: SimAndEdit;
  public gameTools: GameTools;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.layoutTextures = this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;
    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;
    const toolbox = new Sprite(this.layoutTextures['toolbox.png']);
    this.addChild(toolbox);

    this.simAndEdit = new SimAndEdit(chainsim);
    // this.simAndEdit.visible = false;
    this.addChild(this.simAndEdit);

    this.gameTools = new GameTools(chainsim);
    this.gameTools.position.set(56, 72);
    this.gameTools.visible = false;
    this.addChild(this.gameTools);
  }
}
