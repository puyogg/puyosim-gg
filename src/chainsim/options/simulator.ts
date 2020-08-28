import { ASSET_PATH } from '../constants';
import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js';
import { Chainsim } from '../';
import skinList from '../skin-names.json';
import { OptionsMenu } from '.';
import { OptionPage } from './page';

/** The field frame. Contains the borders, background, and field layers.*/
export class SimulatorPage extends OptionPage {
  private optionsMenu: OptionsMenu;

  // private pointerDown: boolean;

  constructor(chainsim: Chainsim, optionsMenu: OptionsMenu) {
    super(chainsim);
    this.visible = false;
    this.optionsMenu = optionsMenu;
  }

  public update(): void {
    //
  }
}
