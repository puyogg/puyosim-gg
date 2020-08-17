interface Dimensions {
  rows: number;
  cols: number;
  hrows: number;
}

interface PixelSizing {
  cellWidth: number;
  cellHeight: number;
}

class AppState {
  public dimensions: Dimensions;
  public pxSizing: PixelSizing;

  constructor() {
    this.dimensions = {
      rows: 13,
      cols: 6,
      hrows: 1,
    };

    this.pxSizing = {
      cellWidth: 64,
      cellHeight: 60,
    };
  }
}

export { AppState };
