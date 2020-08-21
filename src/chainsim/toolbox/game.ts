import { SimContainer } from '../container';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import { Button } from './button';

export class GameTools extends SimContainer {
  private toolboxTextures: PIXI.ITextureDictionary;

  private btnLeft: Button;
  private btnRight: Button;
  private btnDown: Button;
  private btnRotL: Button;
  private btnRotR: Button;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.toolboxTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;

    this.btnRotL = new Button(
      this.toolboxTextures['btn_rotateleft.png'],
      this.toolboxTextures['btn_rotateleft_pressed.png'],
    );
    this.btnRotL.anchor.set(0.5);
    this.btnRotL.position.set(0, 0);

    this.btnRotR = new Button(
      this.toolboxTextures['btn_rotateright.png'],
      this.toolboxTextures['btn_rotateright_pressed.png'],
    );
    this.btnRotR.anchor.set(0.5);
    this.btnRotR.position.set(80, 0);

    this.btnLeft = new Button(this.toolboxTextures['btn_left.png'], this.toolboxTextures['btn_left_pressed.png']);
    this.btnLeft.anchor.set(0.5);
    this.btnLeft.position.set(0, 72);

    this.btnRight = new Button(this.toolboxTextures['btn_right.png'], this.toolboxTextures['btn_right_pressed.png']);
    this.btnRight.anchor.set(0.5);
    this.btnRight.position.set(80, 72);

    this.btnDown = new Button(this.toolboxTextures['btn_down.png'], this.toolboxTextures['btn_down_pressed.png']);
    this.btnDown.anchor.set(0.5);
    this.btnDown.position.set(40, 144);

    this.addChild(this.btnRotL, this.btnRotR, this.btnLeft, this.btnRight, this.btnDown);
  }
}
