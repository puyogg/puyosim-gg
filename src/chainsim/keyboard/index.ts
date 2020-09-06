interface Key {
  code: string;
  isDown: boolean;
}

export class Keyboard {
  public left: Key;
  public right: Key;
  public down: Key;
  public rotL: Key;
  public rotR: Key;
  public undo: Key;
  public redo: Key;
  public reset: Key;

  private btnList: Key[];
  public active: boolean;

  public changingBinds: boolean;
  public bindTarget: Key | undefined;

  constructor(bindTo: HTMLElement) {
    // Initialize Buttons
    this.left = {
      code: 'ArrowLeft',
      isDown: false,
    };

    this.right = {
      code: 'ArrowRight',
      isDown: false,
    };

    this.down = {
      code: 'ArrowDown',
      isDown: false,
    };

    this.rotL = {
      code: 'KeyZ',
      isDown: false,
    };

    this.rotR = {
      code: 'KeyX',
      isDown: false,
    };

    this.undo = {
      code: 'KeyA',
      isDown: false,
    };

    this.redo = {
      code: 'KeyS',
      isDown: false,
    };

    this.reset = {
      code: 'KeyR',
      isDown: false,
    };

    this.btnList = [this.left, this.right, this.down, this.rotL, this.rotR, this.undo, this.redo, this.reset];
    this.active = false;

    this.changingBinds = false;
    this.bindTarget = undefined;

    bindTo.addEventListener('keydown', (event: KeyboardEvent) => this.keyDown(event));
    bindTo.addEventListener('keyup', (event: KeyboardEvent) => this.keyUp(event));
    bindTo.addEventListener('keydown', (event: KeyboardEvent) => this.changeBind(event));
  }

  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
   * @param event
   */
  private keyDown(event: KeyboardEvent): void {
    if (this.changingBinds) return;

    if (event.defaultPrevented) {
      return;
    }

    switch (event.code) {
      case this.left.code:
        this.left.isDown = true;
        break;
      case this.right.code:
        this.right.isDown = true;
        break;
      case this.down.code:
        this.down.isDown = true;
        break;
      case this.rotL.code:
        this.rotL.isDown = true;
        break;
      case this.rotR.code:
        this.rotR.isDown = true;
        break;
      case this.undo.code:
        this.undo.isDown = true;
        break;
      case this.redo.code:
        this.redo.isDown = true;
        break;
      case this.reset.code:
        this.reset.isDown = true;
        break;
      default:
        break;
    }

    if (this.btnList.some((btn) => btn.isDown)) {
      this.active = true;
    }

    // Consume the event so it doesn't get handled twice.
    event.preventDefault();
  }

  private keyUp(event: KeyboardEvent): void {
    if (this.changingBinds) return;

    if (event.defaultPrevented) {
      return;
    }

    switch (event.code) {
      case this.left.code:
        this.left.isDown = false;
        break;
      case this.right.code:
        this.right.isDown = false;
        break;
      case this.down.code:
        this.down.isDown = false;
        break;
      case this.rotL.code:
        this.rotL.isDown = false;
        break;
      case this.rotR.code:
        this.rotR.isDown = false;
        break;
      case this.undo.code:
        this.undo.isDown = false;
        break;
      case this.redo.code:
        this.redo.isDown = false;
        break;
      case this.reset.code:
        this.reset.isDown = false;
        break;
      default:
        break;
    }

    if (this.btnList.every((btn) => !btn.isDown)) {
      this.active = false;
    }

    // Consume the event so it doesn't get handled twice.
    event.preventDefault();
  }

  private changeBind(event: KeyboardEvent): void {
    if (this.bindTarget && this.changingBinds) {
      this.bindTarget.code = event.code;
      this.changingBinds = false;
      event.preventDefault();
    }
  }
}
