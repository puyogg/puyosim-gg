import { PageMain } from './main';
import { Chainsim } from '..';

export class PageShadow extends PageMain {
  constructor(chainsim: Chainsim) {
    super(chainsim);

    this.tools.forEach((tool) => (tool.alpha = 0.5));
  }

  // Overrides the setListeners from pageMain. Automatically gets called when super is called.
  public setListeners(): void {
    this.clearLayer.on('pointerup', () => {
      alert('Shadow');
    });
  }
}
