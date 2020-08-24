import { Chainsim } from '..';
import { SimContainer } from '../container';
import { ASSET_PATH } from '../constants';

export class EmojiPicker extends SimContainer {
  public div: HTMLDivElement;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.div = document.createElement('div');

    const divStyle: Partial<CSSStyleDeclaration> = {
      position: `relative`,
      // fontFamily: `"Lucida Sans Unicode", "Lucida Grande", sans-serif`,
      backgroundImage: `url(${ASSET_PATH}/note_picker.png)`,
      width: '80%',
      backgroundSize: '100% 100%',
      margin: '2% 0 2% 0',
      padding: '5% 10% 8% 10%',
      boxSizing: 'border-box',
      pointerEvents: 'auto',
    };
    Object.assign(this.div.style, divStyle);
  }
}
