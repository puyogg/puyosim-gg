interface Pos {
  x: number;
  y: number;
}

class PositionMatrix {
  rows: number;
  cols: number;
  private xPos: number[];
  private yPos: number[];

  constructor(rows: number, cols: number, cellWidth: number, cellHeight: number) {
    this.rows = rows;
    this.cols = cols;
    this.xPos = [];
    this.yPos = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Position them in the center because the anchor will be 0.5
        this.xPos[r * cols + c] = c * cellWidth + cellWidth / 2;
        this.yPos[r * cols + c] = r * cellHeight + cellHeight / 2;
      }
    }
  }

  public get(row: number, col: number): Pos {
    const x = this.xPos[row * this.cols + col];
    const y = this.yPos[row * this.cols + col];
    return { x: x, y: y };
  }
}

export { Pos, PositionMatrix };
