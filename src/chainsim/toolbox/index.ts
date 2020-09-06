import { SimContainer } from '../container';
import { Sprite } from 'pixi.js';
import { Chainsim } from '..';
import { SimAndEdit } from './sim-edit';
import { GameTools } from './game';

export class Toolbox extends SimContainer {
  public simAndEdit: SimAndEdit;
  public gameTools: GameTools;

  constructor(chainsim: Chainsim) {
    super(chainsim);

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

  public update(): void {
    this.gameTools.update();
  }
}
