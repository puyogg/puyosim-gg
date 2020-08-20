import { PUYOTYPE } from '../solver/constants';
import { SimContainer } from './container';
import { PuyoLayer, ShadowLayer, ArrowLayer, CursorLayer, NumberLayer, Layer, EditLayer } from './field-layer';
import { ASSET_PATH } from './constants';
import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { Chainsim } from '.';

/** The field frame. Contains the borders, background, and field layers.*/
class Frame extends SimContainer {
  public layerContainer: PIXI.Container;
  public puyoLayer: PuyoLayer;
  public shadowLayer: ShadowLayer;
  public arrowLayer: ArrowLayer;
  public cursorLayer: CursorLayer;
  public numberLayer: NumberLayer;
  public editLayer: EditLayer;
  public layers: Layer[];

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.initCharBG();
    this.initBorders();

    this.layerContainer = new PIXI.Container();
    this.layerContainer.x = 25;
    this.layerContainer.y = -8;
    this.addChild(this.layerContainer);

    // this.chainsim.state.slides[0].shadow.data.fill(PUYOTYPE.GARBAGE); // Test
    this.shadowLayer = new ShadowLayer(chainsim);
    this.layerContainer.addChild(this.shadowLayer);

    this.puyoLayer = new PuyoLayer(chainsim);
    this.layerContainer.addChild(this.puyoLayer);

    // for (let i = 0; i < this.chainsim.state.slides[0].arrow.data.length; i++) {
    //   this.chainsim.state.slides[0].arrow.data[i] = Math.floor(Math.random() * 4) + 1;
    // }
    this.arrowLayer = new ArrowLayer(chainsim);
    this.layerContainer.addChild(this.arrowLayer);

    // for (let i = 0; i < this.chainsim.state.slides[0].cursor.data.length; i++) {
    //   this.chainsim.state.slides[0].cursor.data[i] = Math.round(Math.random()) === 0;
    // }
    this.cursorLayer = new CursorLayer(chainsim);
    this.layerContainer.addChild(this.cursorLayer);

    // for (let i = 0; i < this.chainsim.state.slides[0].number.data.length; i++) {
    //   this.chainsim.state.slides[0].number.data[i] = Math.floor(Math.random() * 100);
    // }
    this.numberLayer = new NumberLayer(chainsim);
    this.layerContainer.addChild(this.numberLayer);

    this.layers = [this.puyoLayer, this.shadowLayer, this.arrowLayer, this.cursorLayer, this.numberLayer];

    // Editor layer
    this.editLayer = new EditLayer(chainsim, this.layers);
    this.layerContainer.addChild(this.editLayer);

    // this.arrowLayer.alpha = 0;
    // this.cursorLayer.alpha = 0;
    // this.numberLayer.alpha = 0;
  }

  public update(delta: number): void {
    this.shadowLayer.update(delta);
    this.arrowLayer.update(delta);
    this.cursorLayer.update(delta);
    this.numberLayer.update(delta);
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
