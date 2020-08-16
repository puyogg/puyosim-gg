import { PUYOTYPE } from './constants';

class Field<T> {
  public rows: number;
  public cols: number;
  public data: T[];

  constructor(rows: number, cols: number, copyArray?: T[]) {
    this.rows = rows;
    this.cols = cols;

    if (copyArray) {
      this.data = copyArray.slice(0);
    } else {
      this.data = new Array(rows * cols);
    }
  }

  public get(row: number, col: number): T {
    return this.data[row * this.cols + col];
  }

  public set(row: number, col: number, val: T): void {
    this.data[row * this.cols + col] = val;
  }
}

class PuyoField extends Field<PUYOTYPE> {
  constructor(rows: number, cols: number, copyArray?: PUYOTYPE[]) {
    super(rows, cols, copyArray);
    if (!copyArray) this.reset();
  }

  public reset(): void {
    this.data.fill(PUYOTYPE.NONE);
  }
}

class BoolField extends Field<boolean> {
  constructor(rows: number, cols: number, copyArray?: boolean[]) {
    super(rows, cols, copyArray);
    if (!copyArray) this.reset();
  }

  public reset(): void {
    this.data.fill(false);
  }
}

class NumField extends Field<number> {
  constructor(rows: number, cols: number, copyArray?: number[]) {
    super(rows, cols, copyArray);
    if (!copyArray) this.reset();
  }

  public reset(): void {
    this.data.fill(0);
  }
}

export { Field, PuyoField, BoolField, NumField };
