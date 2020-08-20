import { Page } from './page';
import { Chainsim } from '..';
import { ToolSprite } from './tool';

export class PageCursor extends Page {
  private tool: ToolSprite;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.name = 'cursor';

    const texture = this.toolboxTextures[`cursor.png`];
    this.tool = new ToolSprite(texture, this.toolCursor, true, this, this.simState);
    this.tool.anchor.set(0.5);
    this.tool.x = 48;
    this.tool.y = 120;
    this.addChild(this.tool);

    this.setListeners();
  }

  public setCurrent(): void {
    this.simState.currentTool = this.currentTool;
  }

  public setListeners(): void {
    this.clearLayer.on('pointerup', () => {
      alert('Cursor');
    });
  }
}
