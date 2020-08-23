import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from './container';
import { Chainsim } from '.';
import { ASSET_PATH } from './constants';

export class NoteWindow extends SimContainer {
  private gameContainer: HTMLDivElement;
  private canvasWidth: number;
  private canvasHeight: number;

  private inputDiv: HTMLDivElement;

  constructor(chainsim: Chainsim) {
    super(chainsim);
    this.gameContainer = this.chainsim.app.view.parentElement as HTMLDivElement;
    this.gameContainer.style.position = 'relative';
    this.canvasWidth = this.chainsim.app.view.clientWidth;
    this.canvasHeight = this.chainsim.app.view.clientHeight;

    // Create a content editable div
    this.inputDiv = document.createElement('div');
    this.inputDiv.contentEditable = 'true';

    const divStyle: Partial<CSSStyleDeclaration> = {
      width: `${this.canvasWidth * 0.8}px`,
      height: `${this.canvasHeight * 0.2}px`,
      left: `${this.canvasWidth * 0.1}px`,
      top: `${this.canvasHeight * 0.6}px`,
      position: `absolute`,
      fontFamily: `"Lucida Sans Unicode", "Lucida Grande", sans-serif`,
      fontSize: `${this.canvasWidth / 20}px`,
      backgroundColor: `#DDDDDD`,
      visibility: 'visible',
      // pointerEvents: 'none',
    };
    Object.assign(this.inputDiv.style, divStyle);
    this.inputDiv.addEventListener('paste', (e) => {
      e.preventDefault();
      const data = e.clipboardData;
      if (data) {
        const text = data.getData('text/plain');
        document.execCommand('insertHTML', false, text);
      }
    });
    this.gameContainer.appendChild(this.inputDiv);
    console.log(this.gameContainer);

    // Try to render a sprite and extract it.
    const puyoTextures = this.resources[`${ASSET_PATH}/puyo.json`].textures as PIXI.ITextureDictionary;
    const sprite = new Sprite(puyoTextures['red_0.png']);
    const filter = new PIXI.filters.ColorMatrixFilter();
    filter.contrast(0.9, true);
    sprite.filters = [filter];
    const image: HTMLImageElement = this.chainsim.app.renderer.plugins.extract.image(sprite);
    image.width = this.canvasWidth / 15;
    image.style.verticalAlign = 'middle';
    this.inputDiv.appendChild(image);
    this.addChild(sprite);

    setInterval(() => {
      console.log(this.inputDiv.textContent);
    }, 3000);
  }

  public update(): void {
    if (
      this.canvasHeight !== this.chainsim.app.view.clientHeight ||
      this.canvasWidth !== this.chainsim.app.view.clientWidth
    ) {
      this.canvasWidth = this.chainsim.app.view.clientWidth;
      this.canvasHeight = this.chainsim.app.view.clientHeight;
    }
    console.log(this.inputDiv.innerText);
  }
}
