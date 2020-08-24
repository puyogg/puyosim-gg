import { Page } from './page';
import { Chainsim } from '..';
import { ToolSprite } from './tool';

export class PageCursor extends Page {
  private tool: ToolSprite;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.name = 'cursor';

    const texture = this.toolTextures[`cursor.png`];
    this.tool = new ToolSprite(texture, this.toolCursor, true, this, this.editLayer);
    this.tool.anchor.set(0.5);
    this.tool.x = 48;
    this.tool.y = 120;
    this.addChild(this.tool);
  }

  public refreshSprite(): void {
    this.tool.texture = this.toolTextures[`cursor.png`];
  }

  public setCurrent(): void {
    this.editLayer.currentTool = this.currentTool;
  }
}
