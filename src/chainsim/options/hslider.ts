import * as PIXI from 'pixi.js';
import { Sprite, Graphics } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { Number3Digit } from '../number';

// Font style for text
const titleStyle = new PIXI.TextStyle({
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

const numberStyle = new PIXI.TextStyle({
  fontFamily: 'sans-serif',
  fontSize: 64,
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

export class HorizontalSlider extends SimContainer {
  private maxX: number;
  private bar: Sprite;

  private pointerDown: boolean;
  public value: number;
  private minValue: number;
  private maxValue: number;
  private numDisplay: PIXI.Text;
  private text: string;
  private textDisplay: PIXI.Text;

  public onChange: () => void;

  constructor(chainsim: Chainsim, initValue: number, minValue: number, maxValue: number, text: string) {
    super(chainsim);

    this.maxX = 360;
    this.pointerDown = false;
    this.text = text;

    // Value should be retrieved from this.simState...
    // but I don't know how I wanna structure that yet
    this.value = initValue;
    this.minValue = minValue;
    this.maxValue = maxValue;

    this.textDisplay = new PIXI.Text(this.text, titleStyle);
    this.textDisplay.position.set(0, -80);
    this.addChild(this.textDisplay);

    const line = new Graphics();
    line.lineStyle(5, 0x777777);
    line.moveTo(0, 0);
    line.lineTo(this.maxX, 0);
    this.addChild(line);

    this.bar = new Sprite(this.toolTextures['sliding_rect.png']);
    this.bar.anchor.set(0.5);
    this.bar.scale.set(0.7);
    this.bar.interactive = true;
    this.bar.buttonMode = true;
    this.bar.on('pointerdown', (event: PIXI.InteractionEvent) => {
      const pos = event.data.getLocalPosition(this);
      this.bar.x = pos.x;
      this.pointerDown = true;
      this.updateBarPos();
    });
    this.bar.on('pointermove', (event: PIXI.InteractionEvent) => {
      if (this.pointerDown) {
        const pos = event.data.getLocalPosition(this);
        this.bar.x = pos.x;
        this.updateBarPos();
      }
    });
    this.bar.on('pointerup', () => (this.pointerDown = false));
    this.bar.on('pointerupoutside', () => (this.pointerDown = false));
    this.addChild(this.bar);

    // this.numDisplay = new Number3Digit(chainsim, 0, 'middle');
    // this.numDisplay.setNumber(0);
    // this.numDisplay.position.set(440, this.bar.y);
    // this.addChild(this.numDisplay);
    this.numDisplay = new PIXI.Text(`${this.value}`, numberStyle);
    this.numDisplay.position.set(440, this.bar.y);
    this.numDisplay.anchor.set(0.5);
    this.addChild(this.numDisplay);

    this.initBarPos();

    // Empty callback function
    this.onChange = () => undefined;
  }

  public initBarPos(): void {
    const fraction = (this.value - this.minValue) / (this.maxValue - this.minValue);
    this.bar.x = this.maxX * fraction;
  }

  public setValue(val: number): void {
    this.value = Math.round(val);
    this.initBarPos();
    this.numDisplay.text = `${this.value}`;
  }

  public updateBarPos(): void {
    if (this.bar.x < 0) this.bar.x = 0;
    if (this.bar.x > this.maxX) this.bar.x = this.maxX;
    const range = this.maxValue - this.minValue;
    const newValue = Math.round(this.minValue + (this.bar.x / this.maxX) * range);

    if (newValue !== this.value) {
      this.onChange();
    }

    this.value = Math.round(this.minValue + (this.bar.x / this.maxX) * range);
    this.numDisplay.text = `${this.value}`;
  }
}
