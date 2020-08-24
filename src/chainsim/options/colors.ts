import * as PIXI from 'pixi.js';
import { Chainsim } from '../';
import { OptionsMenu } from '.';
import { OptionPage } from './page';

// Font style for text
const style = new PIXI.TextStyle({
  fontFamily: 'sans-serif',
  fontSize: 36,
  fontWeight: 'bold',
  fill: '#ffffff',
  stroke: '#555555',
  strokeThickness: 5,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 4,
});

/** The field frame. Contains the borders, background, and field layers.*/
export class ColorsPage extends OptionPage {
  private optionsMenu: OptionsMenu;
  private pointerDown: boolean;

  constructor(chainsim: Chainsim, optionsMenu: OptionsMenu) {
    super(chainsim);

    this.visible = true;
    this.optionsMenu = optionsMenu;
    this.pointerDown = false;

    const name = new PIXI.Text('Hue rotation', style);
    this.addChild(name);
  }

  public update(): void {
    //
  }

  public refreshSprites(): void {}
}
