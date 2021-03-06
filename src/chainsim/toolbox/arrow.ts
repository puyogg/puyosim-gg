import { Page } from './page';
import { Chainsim } from '..';
import { ToolSprite } from './tool';

const angles: number[][] = [[0, (1 / 2) * Math.PI, Math.PI], [(3 / 2) * Math.PI]];

const toolValue: number[][] = [[1, 2, 3], [4]];

export class PageArrow extends Page {
  private arrowTools: ToolSprite[][];

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.name = 'arrow';

    this.arrowTools = [];
    for (let r = 0; r < angles.length; r++) {
      this.arrowTools[r] = [];
      for (let c = 0; c < angles[r].length; c++) {
        const angle = angles[r][c];
        const value = toolValue[r][c];
        const texture = this.toolTextures[`arrow.png`];
        const tool = new ToolSprite(texture, this.toolCursor, value, this, this.editLayer);
        tool.anchor.set(0.5);
        tool.x = 48 + 71 * c;
        tool.y = 120 + 71 * r;
        tool.rotation = angle;
        this.arrowTools[r][c] = tool;
        this.tools.push(tool);
        this.addChild(tool);
      }
    }
  }

  /** Update the textures the tool buttons use */
  public refreshSprites(): void {
    for (let r = 0; r < angles.length; r++) {
      for (let c = 0; c < angles[r].length; c++) {
        const angle = angles[r][c];
        const texture = this.toolTextures[`arrow.png`];
        const tool = this.arrowTools[r][c];
        tool.texture = texture;
        tool.anchor.set(0.5);
        tool.x = 48 + 71 * c;
        tool.y = 120 + 71 * r;
        tool.rotation = angle;
      }
    }
  }

  public setCurrent(): void {
    this.editLayer.currentTool = this.currentTool;
  }
}
