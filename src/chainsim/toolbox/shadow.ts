import { PageMain } from './main';
import { Chainsim } from '..';

export class PageShadow extends PageMain {
  constructor(chainsim: Chainsim) {
    super(chainsim);
    this.name = 'shadow';
    this.tools.forEach((tool) => (tool.alpha = 0.5));
  }

  // Overrides the setListeners from pageMain. Automatically gets called when super is called.
}
