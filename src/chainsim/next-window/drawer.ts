import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { ASSET_PATH } from '../constants';
import { NextEditor } from './editor';
import { WinState } from '.';
import { NextNumber } from './next-number';
import { PUYONAME, PUYOTYPE } from '../../solver/constants';
import { NextTool } from './tool';

export class Drawer extends SimContainer {
  private puyoTextures: PIXI.ITextureDictionary;
  private toolTextures: PIXI.ITextureDictionary;
  private layoutTextures: PIXI.ITextureDictionary;

  private winState: WinState;

  private drawer: Sprite;
  private editor: NextEditor;
  private numbers: NextNumber[];
  private puyos: Sprite[];
  private tools: NextTool[];

  constructor(chainsim: Chainsim, winState: WinState) {
    super(chainsim);

    // Set reference to window editor state
    this.winState = winState;

    // Enable interactivity to block touch events to the editor/sim
    this.interactive = true;

    this.puyoTextures = this.resources[`${ASSET_PATH}/puyo.json`].textures as PIXI.ITextureDictionary;
    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;
    this.layoutTextures = this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;

    this.drawer = new Sprite(this.layoutTextures['next_big_container.png']);
    this.addChild(this.drawer);

    this.editor = new NextEditor(chainsim, winState);
    this.addChild(this.editor);

    this.numbers = [];
    for (let i = 0; i < 7; i++) {
      this.numbers[i] = new NextNumber(chainsim, winState, i + 2);
      this.numbers[i].position.set(90, 30 + i * 62);
      this.numbers[i].scale.set(0.4);
      this.numbers[i].pivot.set(0, 0);
      this.numbers[i].rotation = -1 * (Math.PI / 2) * 0.3;
      this.addChild(this.numbers[i]);
    }

    this.puyos = [];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 2; c++) {
        const i = r * 2 + c;
        this.puyos[i] = new Sprite(this.puyoTextures['red_0.png']);
        this.puyos[i].scale.set(0.65);
        this.puyos[i].anchor.set(0.5);
        this.puyos[i].x = c % 2 === 0 ? 122 : 164;
        this.puyos[i].y = 40 + r * 62;
        this.addChild(this.puyos[i]);
      }
    }

    this.tools = [];
    for (let i = 0; i < 7; i++) {
      const type = i as PUYOTYPE;
      this.tools[i] = new NextTool(this.puyoTextures[`${PUYONAME[type]}_0.png`]);
      this.tools[i].x = 36;
      this.tools[i].y = 35 + i * 53;
      this.addChild(this.tools[i]);
    }
    this.tools[0].texture = this.toolTextures['editor_x.png'];
    this.tools[7] = new NextTool(this.toolTextures['return.png']);
    this.tools[7].x = 36;
    this.tools[7].y = 35 + 7 * 53;
    this.addChild(this.tools[7]);

    this.refreshSprites();
  }

  public refreshSprites(): void {
    this.numbers.forEach((number) => number.refreshSprites());

    for (let i = 0; i < this.puyos.length; i++) {
      const poolIdx = this.simState.poolPos + i + 4;
      const puyo = this.simState.pool[poolIdx] as PUYOTYPE;
      this.puyos[i].texture = this.puyoTextures[`${PUYONAME[puyo]}_0.png`];
    }
  }
}
