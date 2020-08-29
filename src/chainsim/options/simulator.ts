import { ASSET_PATH } from '../constants';
import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js';
import { Chainsim } from '../';
import { OptionsMenu } from '.';
import { OptionPage } from './page';
import { OrderSelector } from './order-select';

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

const smallStyle = new PIXI.TextStyle({
  fontFamily: 'sans-serif',
  fontSize: 22,
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
export class SimulatorPage extends OptionPage {
  private optionsMenu: OptionsMenu;

  // private pointerDown: boolean;
  private orderSelector: OrderSelector;

  constructor(chainsim: Chainsim, optionsMenu: OptionsMenu) {
    super(chainsim);
    this.visible = false;
    this.optionsMenu = optionsMenu;

    const colorOrderText = new PIXI.Text('Color Order', style);
    colorOrderText.position.set(100, 220);
    this.addChild(colorOrderText);
    const colorOrderSubText = new PIXI.Text(
      'The first 2 pairs always contain colors 1 to 3.\nThe 5th color is disabled.',
      smallStyle,
    );
    colorOrderSubText.x = 315 - colorOrderSubText.width / 2;
    colorOrderSubText.y = 270;
    this.addChild(colorOrderSubText);

    this.orderSelector = new OrderSelector(chainsim, this);
    this.orderSelector.x = 315 - this.orderSelector.width / 2;
    this.orderSelector.y = 345;
    this.addChild(this.orderSelector);
  }

  public update(): void {
    //
  }

  public refreshSprites(): void {
    this.orderSelector.refreshSprites();
  }
}
