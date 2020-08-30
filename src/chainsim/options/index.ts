import { SimContainer } from '../container';
import { ASSET_PATH } from '../constants';
import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js';
import { Chainsim } from '../';
import { Switch } from '../toolbox/switch';
import { SkinPage } from './skins';
import { OptionPage } from './page';
import { ColorsPage } from './colors';
import { CharacterPage } from './character';
import { ControlPage } from './control';
import { SimulatorPage } from './simulator';
import { ChainsPage } from './chains';

const blurFilter = new PIXI.filters.BlurFilter();

/** The field frame. Contains the borders, background, and field layers.*/
export class OptionsMenu extends SimContainer {
  private btnContainer: Container;
  private btnSkin: Switch;
  private btnColor: Switch;
  private btnChar: Switch;
  private btnControl: Switch;
  private btnSim: Switch;
  private btnChains: Switch;

  private pageNum: number;
  private tabs: Switch[];
  private pages: OptionPage[];
  private exit: Sprite;

  public skinPage: SkinPage;
  public colorsPage: ColorsPage;
  public characterPage: CharacterPage;
  public controlPage: ControlPage;
  public simulatorPage: SimulatorPage;
  public chainsPage: ChainsPage;
  public loadDimmer: Container;
  private saveWheel: Sprite;
  public isLoading: boolean;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.visible = true;
    this.isLoading = false;

    const dimmer = new PIXI.Graphics();
    dimmer.beginFill(0x000000, 0.75);
    dimmer.drawRect(0, 0, 630, 1000);
    dimmer.endFill();
    dimmer.interactive = true;
    this.addChild(dimmer);

    this.btnContainer = new Container();
    this.btnContainer.position.set(315, 60);
    this.btnContainer.scale.set(1.2);
    this.addChild(this.btnContainer);

    // Option Buttons
    this.btnSkin = new Switch(this.toolTextures['option_skin.png'], this.toolTextures['option_skin_pressed.png']);
    this.btnSkin.anchor.set(0.5);
    this.btnSkin.position.set(-158, 0);

    this.btnColor = new Switch(this.toolTextures['option_color.png'], this.toolTextures['option_color_pressed.png']);
    this.btnColor.anchor.set(0.5);
    this.btnColor.position.set(0, 0);

    this.btnChar = new Switch(
      this.toolTextures['option_character.png'],
      this.toolTextures['option_character_pressed.png'],
    );
    this.btnChar.anchor.set(0.5);
    this.btnChar.position.set(158, 0);

    this.btnControl = new Switch(
      this.toolTextures['option_controls.png'],
      this.toolTextures['option_controls_pressed.png'],
    );
    this.btnControl.anchor.set(0.5);
    this.btnControl.position.set(-158, 80);

    this.btnSim = new Switch(
      this.toolTextures['option_simulator.png'],
      this.toolTextures['option_simulator_pressed.png'],
    );
    this.btnSim.anchor.set(0.5);
    this.btnSim.position.set(0, 80);

    this.btnChains = new Switch(this.toolTextures['option_chains.png'], this.toolTextures['option_chains_pressed.png']);
    this.btnChains.anchor.set(0.5);
    this.btnChains.position.set(158, 80);

    this.tabs = [this.btnSkin, this.btnColor, this.btnChar, this.btnControl, this.btnSim, this.btnChains];
    this.btnContainer.addChild(...this.tabs);

    for (let i = 0; i < this.tabs.length; i++) {
      this.tabs[i].on('pointerdown', () => {
        this.pageNum = i;
      });
    }

    // Set up pages to display
    this.pageNum = 4;

    // Pages
    this.skinPage = new SkinPage(chainsim, this);
    this.skinPage.position.set(55, 180);
    this.colorsPage = new ColorsPage(chainsim, this);
    this.colorsPage.position.set(55, 180);
    this.characterPage = new CharacterPage(chainsim, this);
    this.characterPage.position.set(55, 180);
    this.controlPage = new ControlPage(chainsim, this);
    this.simulatorPage = new SimulatorPage(chainsim, this);
    this.chainsPage = new ChainsPage(chainsim, this);

    this.pages = [
      this.skinPage,
      this.colorsPage,
      this.characterPage,
      this.controlPage,
      this.simulatorPage,
      this.chainsPage,
    ];
    this.addChild(...this.pages);

    // Exit button
    this.exit = new Sprite(this.toolTextures['editor_x.png']);
    this.exit.position.set(560, 940);
    this.exit.anchor.set(0.5);
    this.exit.on('pointerdown', async () => {
      await this.simState.saveCustomization();
      this.visible = false;
    });
    this.exit.interactive = true;
    this.exit.buttonMode = true;
    this.addChild(this.exit);

    // More Loading
    this.loadDimmer = new Container();
    const dimmer2 = new PIXI.Graphics();
    dimmer2.beginFill(0x000000, 0.75);
    dimmer2.drawRect(0, 0, 630, 1000);
    dimmer2.endFill();
    dimmer2.interactive = true;
    this.saveWheel = new Sprite(this.resources[`${ASSET_PATH}/save_wheel.png`].texture);
    this.saveWheel.anchor.set(0.5);
    this.saveWheel.position.set(this.chainsim.app.view.width / 2, this.chainsim.app.view.height / 2);
    this.loadDimmer.addChild(dimmer2, this.saveWheel);
    this.addChild(this.loadDimmer);
  }

  public update(): void {
    if (this.visible) {
      this.loadDimmer.visible = this.isLoading;
      if (this.isLoading) {
        this.saveWheel.rotation += Math.PI / 60;
      }

      this.pages.forEach((page) => {
        page.visible = false;
      });
      this.tabs.forEach((tab) => {
        tab.down = false;
      });
      this.pages[this.pageNum].visible = true;
      this.tabs[this.pageNum].down = true;
      this.pages[this.pageNum].update();
      this.chainsim.root.filters = [blurFilter];
    } else {
      // this.chainsim.app.stage.filters = null;
      Object.assign(this.chainsim.root, {
        filters: null,
      });
    }
  }
}
