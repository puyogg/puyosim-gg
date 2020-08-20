import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js';
import { PUYOTYPE } from '~/solver/constants';
import { Page } from './page';
import { EditLayer } from '../field-layer';

export class ToolSprite extends Sprite {
  private toolValue: PUYOTYPE | number | boolean;

  constructor(
    texture: PIXI.Texture,
    toolCursor: Sprite,
    toolValue: PUYOTYPE | number | boolean,
    page: Page,
    editLayer: EditLayer,
  ) {
    super(texture);

    this.interactive = true;
    this.buttonMode = true;
    this.toolValue = toolValue;
    this.on('pointerdown', () => {
      toolCursor.x = this.x;
      toolCursor.y = this.y;
      page.currentTool = this.toolValue;
      editLayer.currentTool = this.toolValue;
    });
  }
}

export class ToolNumber extends Container {
  private textures: PIXI.ITextureDictionary;
  private first: Sprite;
  private second: Sprite;
  private firstOffset: number;
  private secondOffset: number;

  constructor(textures: PIXI.ITextureDictionary, toolCursor: Sprite) {
    super();

    this.textures = textures;

    this.first = new Sprite(this.textures['score_0.png']);
    this.second = new Sprite(this.textures['score_0.png']);
    this.first.anchor.set(0.5);
    this.second.anchor.set(0.5);
    this.addChild(this.first, this.second);

    this.firstOffset = -20;
    this.secondOffset = 20;
    this.first.x = this.firstOffset;
    this.second.x = this.secondOffset;

    this.on('pointerdown', () => {
      toolCursor.x = this.x;
      toolCursor.y = this.y;
    });
  }

  public setNumber(value: number): void {
    if (value < 10) {
      this.first.visible = true;
      this.second.visible = false;
      this.first.x = 0;
      this.first.texture = this.textures[`score_${value}.png`];
    } else {
      this.first.visible = true;
      this.second.visible = true;
      this.first.x = this.firstOffset;
      this.second.x = this.secondOffset;
      const numString = value.toString();
      this.first.texture = this.textures[`score_${numString[0]}.png`];
      this.second.texture = this.textures[`score_${numString[1]}.png`];
    }
  }
}
