import { SimContainer } from '../container';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import { Button } from './button';
import { Sprite } from 'pixi.js';
import { PageMain } from './main';
import { PageShadow } from './shadow';
import { PageArrow } from './arrow';
import { PageCursor } from './cursor';
import { PageNumber } from './number';

const pageName = ['main', 'shadow', 'arrow', 'cursor', 'number'];

export class EditingTools extends SimContainer {
  private toolboxTextures: PIXI.ITextureDictionary;

  private pageLeft: Sprite;
  private pageRight: Sprite;
  private layerName: Sprite;

  private pageIdx: number;
  private pageMain: PageMain;
  private pageShadow: PageShadow;
  private pageArrow: PageArrow;
  private pageCursor: PageCursor;
  private pageNumber: PageNumber;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.toolboxTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;

    this.pageMain = new PageMain(chainsim);
    this.pageMain.visible = false;
    this.addChild(this.pageMain);

    this.pageShadow = new PageShadow(chainsim);
    this.pageShadow.visible = false;
    this.addChild(this.pageShadow);

    this.pageArrow = new PageArrow(chainsim);
    this.pageArrow.visible = false;
    this.addChild(this.pageArrow);

    this.pageCursor = new PageCursor(chainsim);
    this.pageCursor.visible = false;
    this.addChild(this.pageCursor);

    this.pageNumber = new PageNumber(chainsim);
    this.addChild(this.pageNumber);

    // Page Left, full width 238
    this.pageLeft = new Sprite(this.toolboxTextures['picker_arrow_left.png']);
    this.pageLeft.anchor.set(0.5);
    this.pageLeft.position.set(26, 330);
    this.addChild(this.pageLeft);

    // Page Right
    this.pageRight = new Sprite(this.toolboxTextures['picker_arrow_right.png']);
    this.pageRight.anchor.set(0.5);
    this.pageRight.position.set(212, 330);
    this.addChild(this.pageRight);

    // Layer Name
    this.layerName = new Sprite(this.toolboxTextures['layer_main.png']);
    this.layerName.anchor.set(0.5);
    this.layerName.position.set(119, 330);
    this.addChild(this.layerName);

    // Pages
    this.pageIdx = 0;
  }
}
