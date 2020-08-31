import { Chainsim } from '..';
import { SimContainer } from '../container';
import { ASSET_PATH } from '../constants';
import { PUYOTYPE, PUYONAME } from '../../solver/constants';
import { Sprite } from 'pixi.js';

export class EmojiPicker extends SimContainer {
  public div: HTMLDivElement;

  private puyos: Sprite[];
  private garbagePuyo: Sprite;
  private hardPuyo: Sprite;
  private stonePuyo: Sprite;
  private arrows: Sprite[];
  private cursorSprite: Sprite;

  private puyoImgs: HTMLImageElement[];
  private garbageImg: HTMLImageElement;
  private hardImg: HTMLImageElement;
  private stoneImg: HTMLImageElement;
  private arrowImgs: HTMLImageElement[];
  private cursorImg: HTMLImageElement;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.div = document.createElement('div');
    this.div.style.textAlign = 'center';

    const divStyle: Partial<CSSStyleDeclaration> = {
      position: `relative`,
      // fontFamily: `"Lucida Sans Unicode", "Lucida Grande", sans-serif`,
      backgroundImage: `url(${ASSET_PATH}/note_picker.png)`,
      width: '80%',
      backgroundSize: '100% 100%',
      // margin: '2% 0 2% 0',
      padding: '1% 1% 1% 1%',
      boxSizing: 'border-box',
      pointerEvents: 'auto',
    };
    Object.assign(this.div.style, divStyle);

    // Colored Puyos
    this.puyos = [];
    this.puyoImgs = [];
    for (let i = 0; i < 5; i++) {
      const name = PUYONAME[(i + 2) as PUYOTYPE];
      this.puyos[i] = new Sprite(this.puyoTextures[`${name}_0.png`]);
      this.puyos[i].filters = [this.simState.aesthetic.hsbFilters[name]];

      this.puyoImgs[i] = this.chainsim.app.renderer.plugins.extract.image(this.puyos[i]);
      this.puyoImgs[i].style.width = `10%`;
      this.div.appendChild(this.puyoImgs[i]);
    }
    console.log(this.puyos, this.puyoImgs);

    // Garbage Puyo
    this.garbagePuyo = new Sprite(this.puyoTextures['garbage_0.png']);
    this.garbagePuyo.filters = [this.simState.aesthetic.hsbFilters['garbage']];
    this.garbageImg = this.chainsim.app.renderer.plugins.extract.image(this.garbagePuyo);
    this.garbageImg.style.width = '10%';
    this.div.appendChild(this.garbageImg);

    // Hard puyo
    this.hardPuyo = new Sprite(this.puyoTextures['hard_0.png']);
    this.hardImg = this.chainsim.app.renderer.plugins.extract.image(this.hardPuyo);
    this.hardImg.style.width = '10%';
    this.div.appendChild(this.hardImg);

    // Stone Puyo
    this.stonePuyo = new Sprite(this.puyoTextures['stone_0.png']);
    this.stoneImg = this.chainsim.app.renderer.plugins.extract.image(this.stonePuyo);
    this.stoneImg.style.width = '10%';
    this.div.appendChild(this.stoneImg);

    this.div.innerHTML += '<br />';

    // Arrows
    this.arrows = [];
    this.arrowImgs = [];
    for (let i = 0; i < 4; i++) {
      // For some reason the image doesn't get extracted correctly when PIXI.js is the one that rotates it.
      this.arrows[i] = new Sprite(this.toolTextures['arrow.png']);
      this.arrowImgs[i] = this.chainsim.app.renderer.plugins.extract.image(this.arrows[i]);
      this.arrowImgs[i].style.width = '10%';
      this.arrowImgs[i].style.transform = `rotate(${90 * i}deg)`;
      this.div.appendChild(this.arrowImgs[i]);
    }

    // Cursor
    this.cursorSprite = new Sprite(this.toolTextures['cursor.png']);
    this.cursorImg = this.chainsim.app.renderer.plugins.extract.image(this.cursorSprite);
    this.cursorImg.style.width = '10%';
    this.div.appendChild(this.cursorImg);
  }

  public refreshSprites(): void {
    const extractor: PIXI.Extract = this.chainsim.app.renderer.plugins.extract;

    // Set puyos to their textures again in case the Puyo skin was changed.
    for (let i = 0; i < 5; i++) {
      const name = PUYONAME[(i + 2) as PUYOTYPE];
      this.puyos[i].texture = this.puyoTextures[`${name}_0.png`];
      const newExtract = extractor.image(this.puyos[i]);
      this.puyoImgs[i].src = newExtract.src;
    }

    this.garbagePuyo.texture = this.puyoTextures['garbage_0.png'];
    const garbageExtract = extractor.image(this.garbagePuyo);
    this.garbageImg.src = garbageExtract.src;

    this.hardPuyo.texture = this.puyoTextures['hard_0.png'];
    const hardExtract = extractor.image(this.hardPuyo);
    this.hardImg.src = hardExtract.src;

    this.stonePuyo.texture = this.puyoTextures['stone_0.png'];
    const stoneExtract = extractor.image(this.stonePuyo);
    this.stoneImg.src = stoneExtract.src;

    // Arrows and cursors shouldn't have their sprites replaced.
  }
}
