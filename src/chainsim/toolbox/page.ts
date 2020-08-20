import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import { PUYOTYPE } from '../../solver/constants';
import { Button } from './button';
import { ToolSprite } from './tool';
import { Frame } from '../frame';
import { EditLayer } from '../field-layer';

export abstract class Page extends SimContainer {
  public toolboxTextures: PIXI.ITextureDictionary;
  public currentTool: PUYOTYPE | number | boolean;
  public toolCursor: Sprite;
  public delete: ToolSprite;
  public tools: ToolSprite[];
  public clearLayer: Button;
  public editLayer: EditLayer;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.currentTool = 0;
    this.toolboxTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;

    this.tools = [];
    this.editLayer = (this.chainsim.frame as Frame).editLayer;

    // Cursor
    this.toolCursor = new Sprite(this.toolboxTextures['current_tool.png']);
    this.toolCursor.anchor.set(0.5);
    this.toolCursor.scale.set(1.3);
    this.toolCursor.position.set(48, 48);
    this.addChild(this.toolCursor);

    // X
    this.delete = new ToolSprite(this.toolboxTextures['editor_x.png'], this.toolCursor, 0, this, this.editLayer);
    this.delete.anchor.set(0.5);
    this.delete.position.set(48, 48);
    this.tools.push(this.delete);
    this.addChild(this.delete);

    // Clear Layer
    this.clearLayer = new Button(
      this.toolboxTextures['btn_clearLayer.png'],
      this.toolboxTextures['btn_clearLayer_pressed.png'],
    );
    this.clearLayer.anchor.set(0.5);
    this.clearLayer.position.set(160, 48);
    this.addChild(this.clearLayer);
  }

  public abstract setCurrent(): void;
}
