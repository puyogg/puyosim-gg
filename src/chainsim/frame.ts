import { SimContainer } from './container';
import { PuyoLayer } from './field-layer';
import { ASSET_PATH } from './constants';
import { Sprite } from 'pixi.js';
import { Chainsim } from '.';

/** The field frame, along with the character background */
class Frame extends SimContainer {
  public puyoLayer: PuyoLayer;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.initCharBG();
    this.initBorders();

    this.puyoLayer = new PuyoLayer(chainsim);
    this.addChild(this.puyoLayer);
    this.puyoLayer.x = 25;
    this.puyoLayer.y = -8;
  }

  public update(delta: number): void {
    delta;
  }

  private initCharBG(): void {
    const texture = this.resources[`${ASSET_PATH}/arle_bg.png`].texture;

    const charBG = new Sprite(texture);
    charBG.x = 17;
    charBG.y = 51;
    this.addChild(charBG);
  }

  private initBorders(): void {
    const fieldTextures = this.resources[`${ASSET_PATH}/layout.json`].textures as PIXI.ITextureDictionary;
    const borderTop = new Sprite(fieldTextures['field_border_top.png']);
    borderTop.x = 0;
    borderTop.y = 0;
    this.addChild(borderTop);

    const borderLeftTop = new Sprite(fieldTextures['field_border_left_tophalf.png']);
    borderLeftTop.x = 0;
    borderLeftTop.y = 52;
    this.addChild(borderLeftTop);

    const borderLeftBot = new Sprite(fieldTextures['field_border_left_bottomhalf.png']);
    borderLeftBot.x = 0;
    borderLeftBot.y = 404;
    this.addChild(borderLeftBot);

    const borderRightTop = new Sprite(fieldTextures['field_border_right_tophalf.png']);
    borderRightTop.x = 417;
    borderRightTop.y = 52;
    this.addChild(borderRightTop);

    const borderRightBot = new Sprite(fieldTextures['field_border_right_bottomhalf.png']);
    borderRightBot.x = 417;
    borderRightBot.y = 404;
    this.addChild(borderRightBot);

    const borderBot = new Sprite(fieldTextures['field_border_bottom.png']);
    borderBot.x = 0;
    borderBot.y = 770;
    this.addChild(borderBot);
  }
}

export { Frame };
