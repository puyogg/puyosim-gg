import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { WinState } from '.';
import { PUYOTYPE, PUYONAME } from '../../solver/constants';

export class ColorSet extends SimContainer {
  private winState: WinState;
  private availableColors: PUYOTYPE[];
  private colorSet: Sprite[];

  constructor(chainsim: Chainsim, winState: WinState) {
    super(chainsim);

    // Set reference to window editor state
    this.winState = winState;

    this.availableColors = [];
    this.colorSet = [];
    this.checkAvailableColors(); // update this.availableColors
    for (let i = 0; i < this.availableColors.length; i++) {
      this.colorSet[i] = new Sprite(this.puyoTextures['spacer_0.png']);
      this.addChild(this.colorSet[i]);
    }

    this.refreshSprites();
  }

  public refreshSprites(): void {
    this.checkAvailableColors(); // update this.availableColors
    for (let i = 0; i < this.availableColors.length; i++) {
      const color = this.availableColors[i];
      const sprite = this.colorSet[i];
      sprite.texture = this.puyoTextures[`${PUYONAME[color]}_0.png`];
      sprite.scale.set(0.3);
      sprite.anchor.set(0.5);
      sprite.y = sprite.height * i;

      sprite.filters = [this.simState.aesthetic.hsbFilters[PUYONAME[color]]];
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
