import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { Window } from './window';
import { DrawerToggle } from './toggle';
import { ASSET_PATH } from '../constants';
import { Drawer } from './drawer';
import { NextEditor } from './editor';

export class NextWindow extends SimContainer {
  private toolTextures: PIXI.ITextureDictionary;
  private numTextures: PIXI.ITextureDictionary;

  private window: Window;
  private toggle: DrawerToggle;
  private drawer: Drawer;
  private editor: NextEditor;
  private drawerContainer: Container;
  private numbers: Sprite[];

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;
    this.numTextures = this.resources[`${ASSET_PATH}/scoreFont.json`].textures as PIXI.ITextureDictionary;

    this.window = new Window(chainsim);
    this.addChild(this.window);

    this.drawerContainer = new Container();
    this.drawerContainer.position.set(-18, 310);
    this.drawerContainer.visible = false;
    this.addChild(this.drawerContainer);

    this.drawer = new Drawer(chainsim);
    this.drawer.interactive = true;
    this.editor = new NextEditor(chainsim);
    this.drawerContainer.addChild(this.drawer, this.editor);

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
      this.drawerContainer.visible = this.toggle.active;
    });
    this.addChild(this.toggle);

    this.numbers = [];
    for (let i = 0; i < 7; i++) {
      this.numbers[i] = new Sprite(this.numTextures[`score_${i + 3}.png`]);
      this.numbers[i].anchor.set(0.5);
      this.numbers[i].scale.set(0.8);
      this.numbers[i].position.set(80, 340 + i * (this.numbers[i].height + 12));
      this.addChild(this.numbers[i]);
    }
  }
}
