import * as PIXI from 'pixi.js';
import { Sprite, Graphics } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { ASSET_PATH } from '../constants';
import { EmojiPicker } from './emoji-picker';

export class NoteWindow extends SimContainer {
  private gameContainer: HTMLDivElement;
  private canvasWidth: number;
  private canvasHeight: number;

  private emojiPicker: EmojiPicker;
  private buttonRow: HTMLDivElement;

  private fullDiv: HTMLDivElement;
  private inputDiv: HTMLDivElement;
  private pageLeft: HTMLImageElement;
  private pageRight: HTMLImageElement;
  private pageNum: number;
  private pageNumDisplay: HTMLSpanElement;
  private changePosition: HTMLDivElement;
  private exitNotes: HTMLDivElement;

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
      visibility: 'hidden',
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
      filter: 'drop-shadow(0 0 1em black)',
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

    // Emoji Picker
    this.emojiPicker = new EmojiPicker(chainsim);
    this.emojiPicker.div.style.filter = 'drop-shadow(0 0 1em black)';
    this.fullDiv.appendChild(this.emojiPicker.div);

    // Cancel and slide reverse
    this.buttonRow = document.createElement('div');
    const buttonRowStyle: Partial<CSSStyleDeclaration> = {
      position: `relative`,
      fontFamily: `"Lucida Grande", sans-serif`,
      fontSize: `${this.canvasWidth / 20}px`,
      boxSizing: 'border-box',
      outline: '0px solid transparent',
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      // filter: 'drop-shadow(0 0 1em black)',
    };
    Object.assign(this.buttonRow.style, buttonRowStyle);
    this.fullDiv.appendChild(this.buttonRow);

    //
    const extractor: PIXI.Extract = this.chainsim.app.renderer.plugins.extract;
    const pageDiv = document.createElement('div');
    pageDiv.style.display = 'flex';
    pageDiv.style.flexDirection = 'row';
    pageDiv.style.alignItems = 'center';
    const pageLeftSprite = new Sprite(this.toolTextures['picker_arrow_left.png']);
    const pageRightSprite = new Sprite(this.toolTextures['picker_arrow_right.png']);
    this.pageLeft = extractor.image(pageLeftSprite);
    this.pageLeft.style.width = '25%';
    this.pageRight = extractor.image(pageRightSprite);
    this.pageNum = 0;
    this.pageNumDisplay = document.createElement('span');
    this.pageNumDisplay.innerText = `${this.pageNum + 1} / 4`;
    pageDiv.appendChild(this.pageLeft);
    pageDiv.appendChild(this.pageNumDisplay);
    pageDiv.appendChild(this.pageRight);
    this.buttonRow.appendChild(pageDiv);
  }

  public update(): void {
    //
  }

  public setVisible(bool: boolean): void {
    this.visible = bool;
    this.fullDiv.style.visibility = bool ? 'visible' : 'hidden';
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
