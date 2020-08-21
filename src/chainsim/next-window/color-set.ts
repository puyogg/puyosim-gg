import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { ASSET_PATH } from '../constants';
import { WinState } from '.';
import { PUYOTYPE, PUYONAME } from '../../solver/constants';

export class ColorSet extends SimContainer {
  private puyoTextures: PIXI.ITextureDictionary;
  private toolTextures: PIXI.ITextureDictionary;
  private layoutTextures: PIXI.ITextureDictionary;

  private winState: WinState;
  private availableColors: PUYOTYPE[];
  private colorSet: Sprite[];

  constructor(chainsim: Chainsim, winState: WinState) {
    super(chainsim);

    // Set reference to window editor state
    this.winState = winState;

    this.puyoTextures = this.resources[`${ASSET_PATH}/puyo.json`].textures as PIXI.ITextureDictionary;
    this.toolTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;
    this.layoutTextures = this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;

    this.availableColors = [];
    this.checkAvailableColors(); // update this.availableColors
    this.colorSet = [];
    for (let i = 0; i < this.availableColors.length; i++) {
      const color = this.availableColors[i];
      this.colorSet[i] = new Sprite(this.puyoTextures[`${PUYONAME[color]}_0.png`]);
      const sprite = this.colorSet[i];
      sprite.scale.set(0.3);
      sprite.anchor.set(0.5);
      sprite.y = sprite.height * i;
      this.addChild(sprite);
    }
  }

  private checkAvailableColors(): void {
    const pool = this.simState.pool;

    const colors = [PUYOTYPE.RED, PUYOTYPE.GREEN, PUYOTYPE.BLUE, PUYOTYPE.YELLOW, PUYOTYPE.PURPLE];
    const available: PUYOTYPE[] = [];

    colors.forEach((color) => {
      const hasColor = pool.some((value) => value === color);
      if (hasColor) available.push(color);
    });
    this.availableColors = available;
  }
}
