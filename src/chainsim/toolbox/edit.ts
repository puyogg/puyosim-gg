import { SimContainer } from '../container';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import { Sprite } from 'pixi.js';
import { PageMain } from './main';
import { PageShadow } from './shadow';
import { PageArrow } from './arrow';
import { PageCursor } from './cursor';
import { PageNumber } from './number';
import { Page } from './page';

export class EditingTools extends SimContainer {
  private toolboxTextures: PIXI.ITextureDictionary;

  private pageLeft: Sprite;
  private pageRight: Sprite;
  private layerName: Sprite;

  private pageMain: PageMain;
  private pageShadow: PageShadow;
  private pageArrow: PageArrow;
  private pageCursor: PageCursor;
  private pageNumber: PageNumber;
  private pages: Page[];

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.toolboxTextures = this.resources[`${ASSET_PATH}/tools.json`].textures as PIXI.ITextureDictionary;

    this.pageMain = new PageMain(chainsim);
    this.addChild(this.pageMain);

    this.pageShadow = new PageShadow(chainsim);
    this.addChild(this.pageShadow);

    this.pageArrow = new PageArrow(chainsim);
    this.addChild(this.pageArrow);

    this.pageCursor = new PageCursor(chainsim);
    this.addChild(this.pageCursor);

    this.pageNumber = new PageNumber(chainsim);
    this.addChild(this.pageNumber);

    this.pages = [this.pageMain, this.pageShadow, this.pageArrow, this.pageCursor, this.pageNumber];
    this.simState.currentLayer = 0;

    // Page Left, full width 238
    this.pageLeft = new Sprite(this.toolboxTextures['picker_arrow_left.png']);
    this.pageLeft.anchor.set(0.5);
    this.pageLeft.position.set(26, 330);
    this.pageLeft.interactive = true;
    this.pageLeft.buttonMode = true;
    this.addChild(this.pageLeft);

    // Page Right
    this.pageRight = new Sprite(this.toolboxTextures['picker_arrow_right.png']);
    this.pageRight.anchor.set(0.5);
    this.pageRight.position.set(212, 330);
    this.pageRight.interactive = true;
    this.pageRight.buttonMode = true;
    this.addChild(this.pageRight);

    // Layer Name
    this.layerName = new Sprite(this.toolboxTextures['layer_main.png']);
    this.layerName.anchor.set(0.5);
    this.layerName.position.set(119, 330);
    this.addChild(this.layerName);

    this.setCurrentPage(); // Should comment this out later(?) since the editor won't be visible right away

    // Set interaction
    this.pageLeft.on('pointerdown', () => this.setPrevPage());
    this.pageRight.on('pointerdown', () => this.setNextPage());
  }

  public setCurrentPage(): void {
    this.pages.forEach((page) => (page.visible = false));
    const page = this.pages[this.simState.currentLayer];
    page.visible = true;
    page.setCurrent(); // Set the page's current tool
    this.layerName.texture = this.toolboxTextures[`layer_${page.name}.png`];
  }

  public setNextPage(): void {
    this.pages.forEach((page) => (page.visible = false));
    this.simState.currentLayer =
      this.simState.currentLayer === this.pages.length - 1 ? 0 : this.simState.currentLayer + 1;
    const page = this.pages[this.simState.currentLayer];
    page.visible = true;
    page.setCurrent(); // Set the page's current tool
    this.layerName.texture = this.toolboxTextures[`layer_${page.name}.png`];
  }

  public setPrevPage(): void {
    this.pages.forEach((page) => (page.visible = false));
    this.simState.currentLayer =
      this.simState.currentLayer === 0 ? this.pages.length - 1 : this.simState.currentLayer - 1;
    const page = this.pages[this.simState.currentLayer];
    page.visible = true;
    page.setCurrent(); // Set the page's current tool
    this.layerName.texture = this.toolboxTextures[`layer_${page.name}.png`];
  }
}
