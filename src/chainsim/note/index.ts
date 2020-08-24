import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { ASSET_PATH } from '../constants';
import { EmojiPicker } from './emoji-picker';

export class NoteWindow extends SimContainer {
  private gameContainer: HTMLDivElement;
  private canvasWidth: number;
  private canvasHeight: number;

  private emojiPicker: EmojiPicker;

  private fullDiv: HTMLDivElement;
  private inputDiv: HTMLDivElement;

  constructor(chainsim: Chainsim) {
    super(chainsim);
    this.gameContainer = this.chainsim.app.view.parentElement as HTMLDivElement;
    this.gameContainer.style.position = 'relative';
    this.canvasWidth = this.chainsim.app.view.clientWidth;
    this.canvasHeight = this.chainsim.app.view.clientHeight;

    this.fullDiv = document.createElement('div');
    const fullDivStyle: Partial<CSSStyleDeclaration> = {
      position: 'absolute',
      boxSizing: 'border-box',
      // backgroundColor: 'rgba(0,0,0,0.2)',
      top: '0',
      left: '0',
      display: 'flex',
      flexDirection: 'column-reverse',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: '5% 0 5% 0',
      pointerEvents: 'none',
      // visibility: 'hidden',
    };
    Object.assign(this.fullDiv.style, fullDivStyle);
    this.gameContainer.appendChild(this.fullDiv);

    // Create a content editable div
    this.inputDiv = document.createElement('div');
    this.inputDiv.contentEditable = 'true';

    const divStyle: Partial<CSSStyleDeclaration> = {
      position: `relative`,
      // fontFamily: `"Lucida Sans Unicode", "Lucida Grande", sans-serif`,
      fontFamily: `"Lucida Grande", sans-serif`,
      fontSize: `${this.canvasWidth / 20}px`,
      backgroundImage: `url(${ASSET_PATH}/bubble.png)`,
      backgroundSize: '100% 100%',
      padding: '5% 10% 8% 10%',
      boxSizing: 'border-box',
      outline: '0px solid transparent',
      pointerEvents: 'auto',
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
    // this.gameContainer.appendChild(this.inputDiv);
    this.fullDiv.appendChild(this.inputDiv);
    console.log(this.gameContainer);

    // Try to render a sprite and extract it.
    const sprite = new Sprite(this.puyoTextures['red_0.png']);
    const filter = new PIXI.filters.ColorMatrixFilter();
    filter.contrast(0.9, true);
    sprite.filters = [filter];
    const image: HTMLImageElement = this.chainsim.app.renderer.plugins.extract.image(sprite);
    image.style.width = `8%`;
    image.style.verticalAlign = 'middle';
    image.className = 'red';
    this.inputDiv.appendChild(image);
    this.addChild(sprite);

    // Emoji Picker
    this.emojiPicker = new EmojiPicker(chainsim);
    this.fullDiv.appendChild(this.emojiPicker.div);

    setInterval(() => {
      console.log(this.getNoteFromDOM(this.inputDiv.innerHTML));
    }, 1000);
  }

  public update(): void {
    //
  }

  public resize(width: number, height: number): void {
    const divStyle: Partial<CSSStyleDeclaration> = {
      width: `${width * 0.95}px`,
      minHeight: `${height * 0.2}px`,
      // left: `${width * 0.025}px`,
      // top: `${height * 0.6}px`,
      fontSize: `${width / 25}px`,
    };
    Object.assign(this.inputDiv.style, divStyle);

    const fullDivStyle: Partial<CSSStyleDeclaration> = {
      width: `${width}px`,
      height: `${height}px`,
    };
    Object.assign(this.fullDiv.style, fullDivStyle);
  }

  public getNoteFromDOM(innerHTML: string): string {
    // 1. Split on <img> tag.
    const images = innerHTML.match(/\<img(?:.*?)\>/g) || [];
    const fragments = innerHTML.split(/\<img(?:.*?)\>/g);

    // 2. Get the className for each image.
    const names = images.map((image) => {
      const matches = image.match(/class="(.*?)"/);
      if (matches !== null) {
        return matches[1];
      } else {
        return '';
      }
    });

    // 3. Combine the string fragments with the classNames.
    let output = '';

    for (let i = 0; i < fragments.length; i++) {
      output += fragments[i];
      if (i < names.length) {
        output += `:${names[i]}:`;
      }
    }

    return output;
  }
}
