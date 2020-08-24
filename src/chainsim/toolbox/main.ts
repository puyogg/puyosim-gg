import { Page } from './page';
import { Chainsim } from '..';
import { PUYOTYPE } from '../../solver/constants';
import { ToolSprite } from './tool';

const names: string[][] = [
  ['red', 'green', 'blue'],
  ['yellow', 'purple', 'stone'],
  ['garbage', 'hard', 'block'],
];

const toolValue: PUYOTYPE[][] = [
  [PUYOTYPE.RED, PUYOTYPE.GREEN, PUYOTYPE.BLUE],
  [PUYOTYPE.YELLOW, PUYOTYPE.PURPLE, PUYOTYPE.STONE],
  [PUYOTYPE.GARBAGE, PUYOTYPE.HARD, PUYOTYPE.BLOCK],
];

export class PageMain extends Page {
  private puyoTools: ToolSprite[][];

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.name = 'main';

    this.puyoTools = [];
    for (let r = 0; r < names.length; r++) {
      this.puyoTools[r] = [];
      for (let c = 0; c < names[r].length; c++) {
        const name = names[r][c];
        const value = toolValue[r][c];
        const texture = this.puyoTextures[`${name}_0.png`];
        const tool = new ToolSprite(texture, this.toolCursor, value, this, this.editLayer);
        tool.anchor.set(0.5);
        tool.x = 48 + 71 * c;
        tool.y = 120 + 71 * r;
        this.puyoTools[r][c] = tool;
        this.tools.push(tool);
        this.addChild(tool);
      }
    }
  }

  /** Update the textures the tool buttons use */
  public refreshSprites(): void {
    for (let r = 0; r < names.length; r++) {
      for (let c = 0; c < names[r].length; c++) {
        const name = names[r][c];
        const texture = this.puyoTextures[`${name}_0.png`];
        const tool = this.puyoTools[r][c];
        tool.texture = texture;
      }
    }
  }

  public setCurrent(): void {
    this.editLayer.currentTool = this.currentTool;
  }
}
