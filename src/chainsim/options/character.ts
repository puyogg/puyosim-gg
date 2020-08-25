import { ASSET_PATH } from '../constants';
import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js';
import { Chainsim } from '../';
import skinList from '../skin-names.json';
import { OptionsMenu } from '.';
import { OptionPage } from './page';

const style = new PIXI.TextStyle({
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

interface InitialsAndFilenames {
  initials: string[];
  filenames: string[];
}

/** The field frame. Contains the borders, background, and field layers.*/
export class CharacterPage extends OptionPage {
  private optionsMenu: OptionsMenu;

  private pointerDown: boolean;

  private ppeInits: string[];
  private ppeIcons: Sprite[];
  private ppeContainer: Container;

  private pptInits: string[];
  private pptIcons: Sprite[];
  private pptContainer: Container;
  private pages: Container[];

  private selectBorder: Sprite;

  private pageLeft: Sprite;
  private pageRight: Sprite;
  private pageNum: number;
  private pageDisplay: PIXI.Text;

  private filter: PIXI.filters.ColorMatrixFilter;
  private ticker: number;

  constructor(chainsim: Chainsim, optionsMenu: OptionsMenu) {
    super(chainsim);

    this.visible = true;
    this.optionsMenu = optionsMenu;
    this.pointerDown = false;

    this.filter = new PIXI.filters.ColorMatrixFilter();
    this.filter.hue(0, true);
    this.ticker = 0;

    const ppeTextures = this.resources[`${ASSET_PATH}/char_esports.json`].textures as PIXI.ITextureDictionary;
    const pptTextures = this.resources[`${ASSET_PATH}/char_ppt.json`].textures as PIXI.ITextureDictionary;

    const { initials: ppeInits, filenames: ppeKeys } = this.getPPEdata();
    const { initials: pptInits, filenames: pptKeys } = this.getPPTdata();
    console.log(pptInits, pptKeys);
    this.ppeInits = ppeInits;
    this.pptInits = pptInits;

    this.ppeIcons = [];
    this.ppeContainer = new Container();
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const i = r * 4 + c;
        const icon = new Sprite(ppeTextures[ppeKeys[i]]);
        icon.scale.set(0.7);
        icon.position.set((icon.width + 15) * c, 30 + (icon.height + 15) * r);

        icon.interactive = true;
        icon.buttonMode = true;

        icon.on('pointerdown', () => {
          this.setBackground(i, 0);
          this.selectBorder.position.set((icon.width + 15) * c, 30 + (icon.height + 15) * r);
        });

        this.ppeIcons.push(icon);
      }
    }
    this.ppeContainer.addChild(...this.ppeIcons);
    this.addChild(this.ppeContainer);

    this.pptIcons = [];
    this.pptContainer = new Container();
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const i = r * 4 + c;
        const icon = new Sprite(pptTextures[pptKeys[i]]);
        icon.scale.set(0.7);
        icon.position.set((icon.width + 15) * c, 30 + (icon.height + 15) * r);

        icon.interactive = true;
        icon.buttonMode = true;

        icon.on('pointerdown', () => {
          this.setBackground(i + 24, 1);
          this.selectBorder.position.set((icon.width + 15) * c, 30 + (icon.height + 15) * r);
        });

        this.pptIcons.push(icon);
      }
    }
    this.pptContainer.addChild(...this.pptIcons);
    this.addChild(this.pptContainer);

    const paginate = new Container();
    this.pageLeft = new Sprite(this.toolTextures['picker_arrow_left.png']);
    this.pageLeft.anchor.set(0.5);
    this.pageLeft.position.set(-100, 0);
    this.pageLeft.interactive = true;
    this.pageLeft.buttonMode = true;
    this.pageLeft.on('pointerdown', () => (this.pageNum = (this.pageNum - 1 + 2) % 2));
    this.pageRight = new Sprite(this.toolTextures['picker_arrow_right.png']);
    this.pageRight.anchor.set(0.5);
    this.pageRight.position.set(100, 0);
    this.pageRight.interactive = true;
    this.pageRight.buttonMode = true;
    this.pageRight.on('pointerdown', () => (this.pageNum = (this.pageNum + 1) % 2));

    this.pageNum = Math.floor(this.simState.aesthetic.charID / 24);
    this.pageDisplay = new PIXI.Text(`${this.pageNum + 1} / 2`, style);
    this.pageDisplay.anchor.set(0.5);

    paginate.addChild(this.pageLeft, this.pageRight, this.pageDisplay);
    paginate.position.set(315 - 55, 725);
    this.addChild(paginate);

    // Set to current character and page.
    this.pages = [this.ppeContainer, this.pptContainer];
    this.setPage(this.pageNum);

    const mod = this.simState.aesthetic.charID % 24;
    this.selectBorder = new Sprite(this.resources[`${ASSET_PATH}/selected_char.png`].texture);
    this.selectBorder.scale.set(0.7);
    this.selectBorder.x = (mod % 4) * (this.ppeIcons[0].width + 15);
    this.selectBorder.y = 30 + Math.floor(mod / 4) * (this.ppeIcons[0].height + 15);
    this.selectBorder.filters = [this.filter];
    this.addChild(this.selectBorder);
  }

  public update(): void {
    if (this.visible) {
      if (this.pageNum === 0) {
        this.ppeContainer.visible = true;
        this.pptContainer.visible = false;
      } else {
        this.ppeContainer.visible = false;
        this.pptContainer.visible = true;
      }

      const c = this.simState.aesthetic.charID;
      const p = this.pageNum;
      this.selectBorder.visible = (c < 24 && p === 0) || (c >= 24 && c < 48 && p === 1);

      const { matrix } = this.filter;

      matrix[3] = Math.cos(this.ticker / 4);
      matrix[5] = Math.sin(this.ticker / 4);
      matrix[6] = Math.sin(this.ticker / 4);
      this.ticker += 0.2;
      this.pageDisplay.text = `${this.pageNum + 1} / 2`;
    }
  }

  private setPage(page: number) {
    const p = (page + this.pages.length) % this.pages.length;
    for (let i = 0; i < this.pages.length; i++) {
      this.pages[i].visible = i === p;
    }
  }

  private getPPEdata(): InitialsAndFilenames {
    const ppeTextures = this.resources[`${ASSET_PATH}/char_esports.json`].textures as PIXI.ITextureDictionary;
    const ppeNames: string[] = [];
    const ppeKeys = Object.keys(ppeTextures);
    for (let i = 0; i < ppeKeys.length; i++) {
      if (ppeKeys[i] !== 'char_select') {
        const initials = ppeKeys[i].split('_').pop();
        if (initials) ppeNames.push(initials);
      }
    }

    const correctKeys: string[] = [];
    for (let i = 0; i < ppeKeys.length; i++) {
      if (ppeKeys[i] !== 'char_select') {
        correctKeys.push(ppeKeys[i]);
      }
    }

    return {
      initials: ppeNames,
      filenames: correctKeys,
    };
  }

  private getPPTdata(): InitialsAndFilenames {
    const pptTextures = this.resources[`${ASSET_PATH}/char_ppt.json`].textures as PIXI.ITextureDictionary;
    const pptKeys = Object.keys(pptTextures);
    const pptInitials: string[] = [];
    for (let i = 0; i < pptKeys.length; i++) {
      const initials = pptKeys[i].split('_').slice(2).join('_');
      if (initials) pptInitials.push(initials);
    }

    return {
      initials: pptInitials,
      filenames: pptKeys,
    };
  }

  private setBackground(idx: number, page: number): void {
    this.optionsMenu.isLoading = true;

    let name, textureName: string;
    if (page === 0) {
      name = this.ppeInits[idx];
      textureName = `field_${name}.png`;
    } else {
      name = this.pptInits[idx % 24];
      textureName = `field_ppt_${name}.png`;
    }

    console.log(name, textureName);

    // Destroy current background texture
    const currentBG = this.chainsim.frame?.charBG.texture.textureCacheIds[0];
    if (currentBG) {
      this.resources[currentBG].texture.destroy();

      // Delete it from the resource loader
      delete this.resources[currentBG];
    }

    this.chainsim.loader
      .add(`${ASSET_PATH}/character/${textureName}`)
      .load()
      .onComplete.once(() => {
        // Refresh everything that relies on puyoTextures
        const frame = this.chainsim.frame;
        if (frame) frame.charBG.texture = this.resources[`${ASSET_PATH}/character/${textureName}`].texture;
        this.optionsMenu.isLoading = false;
        this.simState.aesthetic.charID = idx;
        this.simState.aesthetic.charBG = `${ASSET_PATH}/character/${textureName}`;
      });
  }
}
