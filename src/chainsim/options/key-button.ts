import * as PIXI from 'pixi.js';
import { Text, Graphics, Container } from 'pixi.js';

const style = new PIXI.TextStyle({
  align: 'center',
  fontFamily: 'sans-serif',
  fontSize: 36,
  lineHeight: 60,
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

export class TextButton extends Container {
  public text: Text;
  private box: Graphics;

  constructor(text: string) {
    super();

    this.box = new Graphics();
    this.box.lineStyle(3, 0x535353);
    this.box.beginFill(0xdddddd);
    this.box.drawRect(0, 0, 300, 50);
    this.box.endFill();
    this.addChild(this.box);

    this.text = new Text(text, style);
    this.text.position.set(150, 30);
    this.text.anchor.set(0.5);
    this.addChild(this.text);
  }
}
