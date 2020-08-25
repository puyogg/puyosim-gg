import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js';
import { Chainsim } from '../';
import { OptionsMenu } from '.';
import { OptionPage } from './page';
import { HorizontalSlider } from './hslider';
import { HSBData, HSBFilters } from '../state';
import { makeHSBFilter } from '../helper/aesthetic';

const puyoColors = ['red', 'green', 'blue', 'yellow', 'purple', 'garbage'];

interface FixedFilter extends PIXI.Filter {
  matrix: Float32Array;
}

/** The field frame. Contains the borders, background, and field layers.*/
export class ColorsPage extends OptionPage {
  private optionsMenu: OptionsMenu;
  private pointerDown: boolean;

  // private prevVisibility: boolean;
  private hsbData: HSBData;
  private hsbFilters: HSBFilters;

  private puyoContainer: Container;
  private puyos: Sprite[];

  private hueSlider: HorizontalSlider;
  private satSlider: HorizontalSlider;
  private briSlider: HorizontalSlider;

  public currentColor: string;

  constructor(chainsim: Chainsim, optionsMenu: OptionsMenu) {
    super(chainsim);

    this.visible = false;
    // this.prevVisibility = false;
    this.optionsMenu = optionsMenu;
    this.pointerDown = false;

    // Set up the Puyo Icons
    this.puyos = [];
    this.puyoContainer = new PIXI.Container();
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const i = r * 3 + c;
        const color = puyoColors[i];
        this.puyos[i] = new Sprite(this.puyoTextures[`big_${color}.png`]);
        this.puyos[i].anchor.set(0.5, 1);
        this.puyos[i].scale.set(0.8);
        this.puyos[i].position.set((this.puyos[i].width + 40) * (c - 1), (this.puyos[i].height + 40) * r);
        this.puyoContainer.addChild(this.puyos[i]);
        this.puyos[i].filters = [this.simState.aesthetic.hsbFilters[color]];

        // Set interaction. Clicking updates this.currentColor
        this.puyos[i].interactive = true;
        this.puyos[i].buttonMode = true;
        this.puyos[i].on('pointerdown', () => {
          this.currentColor = color;
          this.hueSlider.setValue(this.hsbData[this.currentColor].hue);
          this.satSlider.setValue(Math.floor(this.hsbData[this.currentColor].sat * 100));
          this.briSlider.setValue(Math.floor(this.hsbData[this.currentColor].bri * 100));
        });
      }
    }
    this.puyoContainer.position.set(315 - 55, 150);
    this.addChild(this.puyoContainer);

    // Set up the sliders
    this.hueSlider = new HorizontalSlider(chainsim, 30, 0, 360, 'Hue Rotation');
    this.hueSlider.position.set(55, 400);
    this.hueSlider.scale.set(0.9);
    this.hueSlider.onChange = () => {
      this.setHSBFilter(this.hueSlider.value, this.satSlider.value / 100, this.briSlider.value / 100);
    };
    this.satSlider = new HorizontalSlider(chainsim, 100, -100, 100, 'Saturation');
    this.satSlider.position.set(55, 515);
    this.satSlider.scale.set(0.9);
    this.satSlider.onChange = () => {
      this.setHSBFilter(this.hueSlider.value, this.satSlider.value / 100, this.briSlider.value / 100);
    };
    this.briSlider = new HorizontalSlider(chainsim, 25, 0, 200, 'Brightness');
    this.briSlider.position.set(55, 630);
    this.briSlider.scale.set(0.9);
    this.briSlider.onChange = () => {
      this.setHSBFilter(this.hueSlider.value, this.satSlider.value / 100, this.briSlider.value / 100);
    };
    this.addChild(this.hueSlider, this.satSlider, this.briSlider);

    // Set reference to simState HSB state
    this.hsbData = this.simState.aesthetic.hsbData;
    this.hsbFilters = this.simState.aesthetic.hsbFilters;
    // Set the current color to change and its default value from simState
    this.currentColor = 'red';
    this.hueSlider.setValue(this.hsbData[this.currentColor].hue);
    this.satSlider.setValue(Math.floor(this.hsbData[this.currentColor].sat * 100));
    this.briSlider.setValue(Math.floor(this.hsbData[this.currentColor].bri * 100));
    this.setHSBFilter(
      this.hsbData[this.currentColor].hue,
      this.hsbData[this.currentColor].sat,
      this.hsbData[this.currentColor].bri,
    );
  }

  public update(): void {}

  public setSliderValues(): void {}

  public setHSBFilter(h: number, s: number, b: number): void {
    // Update the hsbData
    this.hsbData[this.currentColor].hue = h;
    this.hsbData[this.currentColor].sat = s;
    this.hsbData[this.currentColor].bri = b;

    // This'll cause a lot of garbage collection but oh well...
    // Make a new PIXI ColorMatrix filter
    console.log(h, s, b);
    const newFilter = makeHSBFilter(h, s, b) as FixedFilter;
    const { matrix: newMatrix } = newFilter;

    // Get the filter from the state object, corresponding to the current color
    const filter: FixedFilter = this.hsbFilters[this.currentColor] as FixedFilter;
    const { matrix } = filter;

    // // Copy over the values
    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = newMatrix[i];
    }
  }

  public refreshSprites(): void {
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const i = r * 3 + c;
        this.puyos[i].texture = this.puyoTextures[`big_${puyoColors[i]}.png`];
        this.puyos[i].position.set((this.puyos[i].width + 40) * (c - 1), (this.puyos[i].height + 40) * r);
      }
    }
  }
}
