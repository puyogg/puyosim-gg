import { SimContainer } from '../container';
import { Chainsim } from '..';
import { Window } from './window';
import { DrawerToggle } from './toggle';
import { Drawer } from './drawer';
import { ColorSet } from './color-set';

export interface WinState {
  currentTool: number;
  reset: boolean;
}

export class NextWindow extends SimContainer {
  public winState: WinState;

  public window: Window;
  private toggle: DrawerToggle;
  public drawer: Drawer;
  public colorSet: ColorSet;

  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.winState = {
      currentTool: 0,
      reset: false,
    };

    this.window = new Window(chainsim, this.winState);
    this.addChild(this.window);

    this.drawer = new Drawer(chainsim, this.winState);
    this.drawer.interactive = true;
    this.drawer.visible = false;
    this.drawer.position.set(-18, 310);
    this.addChild(this.drawer);

    this.toggle = new DrawerToggle(
      this.toolTextures['next_show.png'],
      this.toolTextures['next_show_pressed.png'],
      this.toolTextures['next_hide.png'],
      this.toolTextures['next_hide_pressed.png'],
    );
    this.toggle.anchor.set(0.5);
    this.toggle.scale.set(0.75);
    this.toggle.rotation = (-1 * Math.PI) / 2;
    this.toggle.position.set(22, 242);
    this.toggle.on('pointerup', () => {
      this.drawer.visible = this.toggle.active;
    });
    this.addChild(this.toggle);

    this.colorSet = new ColorSet(chainsim, this.winState);
    this.colorSet.position.set(130, 40);
    this.addChild(this.colorSet);
  }

  public update(delta: number): void {
    this.window.nextPuyos.update();
    this.drawer.update();
  }
}
