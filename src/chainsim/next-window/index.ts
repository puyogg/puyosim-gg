import * as PIXI from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { Window } from './window';
import { DrawerToggle } from './toggle';
import { ASSET_PATH } from '../constants';
import { Drawer } from './drawer';
import { ColorSet } from './color-set';

export interface WinState {
  currentTool: number;
  reset: boolean;
}

export class NextWindow extends SimContainer {
  private toolTextures: PIXI.ITextureDictionary;

  private winState: WinState;

  private window: Window;
  private toggle: DrawerToggle;
  private drawer: Drawer;
  private colorSet: ColorSet;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;

    this.winState = {
      currentTool: 0,
      reset: false,
    };

    this.window = new Window(chainsim);
    this.addChild(this.window);

    this.drawer = new Drawer(chainsim, this.winState);
    this.drawer.interactive = true;
    this.drawer.visible = false;
    this.drawer.position.set(-18, 310);
    this.addChild(this.drawer);

    this.toggle = new DrawerToggle(
      this.toolTextures['next_show.png'],
      this.toolTextures['next_show_pressed.png'],
      this.toolTextures['next_hide.png'],
      this.toolTextures['next_hide_pressed.png'],
    );
    this.toggle.anchor.set(0.5);
    this.toggle.scale.set(0.75);
    this.toggle.rotation = (-1 * Math.PI) / 2;
    this.toggle.position.set(22, 242);
    this.toggle.on('pointerup', () => {
      this.drawer.visible = this.toggle.active;
    });
    this.addChild(this.toggle);

    this.colorSet = new ColorSet(chainsim, this.winState);
    this.colorSet.position.set(130, 40);
    this.addChild(this.colorSet);
  }
}
