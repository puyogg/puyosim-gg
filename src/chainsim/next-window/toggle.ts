import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';

export class DrawerToggle extends Sprite {
  private inactiveUp: PIXI.Texture;
  private inactiveDn: PIXI.Texture;
  private activeUp: PIXI.Texture;
  private activeDn: PIXI.Texture;
  private up: PIXI.Texture;
  private dn: PIXI.Texture;

  private _active: boolean;

  constructor(inactiveUp: PIXI.Texture, inactiveDn: PIXI.Texture, activeUp: PIXI.Texture, activeDn: PIXI.Texture) {
    super(inactiveUp);

    this.inactiveUp = inactiveUp;
    this.inactiveDn = inactiveDn;
    this.activeUp = activeUp;
    this.activeDn = activeDn;

    this.up = this.inactiveUp;
    this.dn = this.inactiveDn;

    this._active = false;

    this.interactive = true;
    this.buttonMode = true;

    this.on('pointerdown', () => {
      this.texture = this.dn;
    });
    this.on('pointerup', () => {
      this.active = !this.active;
      this.texture = this.up;
    });
  }

  set active(bool: boolean) {
    this._active = bool;
    if (bool) {
      this.up = this.activeUp;
      this.dn = this.activeDn;
    } else {
      this.up = this.inactiveUp;
      this.dn = this.inactiveDn;
    }
  }

  get active(): boolean {
    return this._active;
  }
}
