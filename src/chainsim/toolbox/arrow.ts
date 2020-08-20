import { Page } from './page';
import { ASSET_PATH } from '../constants';
import { Chainsim } from '..';
import { Sprite } from 'pixi.js';
import { Button } from './button';
import { ToolSprite } from './tool';

const angles: number[][] = [[0, (1 / 2) * Math.PI, Math.PI], [(3 / 2) * Math.PI]];

const toolValue: number[][] = [[1, 2, 3], [4]];

export class PageArrow extends Page {
  private arrowTools: ToolSprite[][];

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.arrowTools = [];
    for (let r = 0; r < angles.length; r++) {
      this.arrowTools[r] = [];
      for (let c = 0; c < angles[r].length; c++) {
        const angle = angles[r][c];
        const value = toolValue[r][c];
        const texture = this.toolboxTextures[`arrow.png`];
        const tool = new ToolSprite(texture, this.toolCursor, value, this, this.simState);
        tool.anchor.set(0.5);
        tool.x = 48 + 71 * c;
        tool.y = 120 + 71 * r;
        tool.rotation = angle;
        this.arrowTools[r][c] = tool;
        this.tools.push(tool);
        this.addChild(tool);
      }
    }

    this.setListeners();
  }

  public setListeners(): void {
    this.clearLayer.on('pointerup', () => {
      alert('Arrow');
    });
  }
}
