enum COLOR {
  NONE,
  GARBAGE,
  RED,
  GREEN,
  BLUE,
  YELLOW,
  PURPLE,
  HARD,
  BLOCK,
}

class Puyo {
  public x: number;
  public y: number;
  public c: number;

  constructor(x: number, y: number, c: COLOR) {
    this.x = x;
    this.y = y;
    this.c = c;
  }

  isColored(): boolean {
    return this.c >= COLOR.RED && this.c <= COLOR.PURPLE;
  }

  isGarbage(): boolean {
    return this.c === COLOR.GARBAGE || this.c === COLOR.HARD;
  }

  isBlock(): boolean {
    return this.c === COLOR.BLOCK;
  }
}

export { COLOR, Puyo };
