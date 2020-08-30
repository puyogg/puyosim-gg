import { Sprite, Container, Text, TextStyle } from 'pixi.js';
import { SimContainer } from '../container';
import { Chainsim } from '..';
import { SimulatorPage } from './simulator';
import { PUYOTYPE } from '../../solver/constants';
import { TextButton } from './key-button';

const puyoColors = ['red', 'green', 'blue', 'yellow', 'purple'];

const medStyle = new TextStyle({
  fontFamily: 'sans-serif',
  fontSize: 36,
  fontWeight: 'bold',
  fill: '#ffffff',
  stroke: '#555555',
  strokeThickness: 5,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 4,
});

export class OrderSelector extends SimContainer {
  private simulatorPage: SimulatorPage;
  public puyos: Sprite[];
  private reset: TextButton;

  private numbers: Text[];
  private orderChanging: boolean;
  private newOrder: number[];
  private step: number;

  constructor(chainsim: Chainsim, simulatorPage: SimulatorPage) {
    super(chainsim);
    this.simulatorPage = simulatorPage;

    this.numbers = [];
    for (let i = 0; i < puyoColors.length; i++) {
      const num = this.simState.colorOrder.indexOf(i + PUYOTYPE.RED) + 1; // red offset
      this.numbers[i] = new Text(num.toString(), medStyle);
      this.numbers[i].position.set(25 + 86 * i, 0);
      this.addChild(this.numbers[i]);
    }

    this.puyos = [];
    this.newOrder = [];
    this.orderChanging = false;
    for (let i = 0; i < puyoColors.length; i++) {
      const name = puyoColors[i];
      this.puyos[i] = new Sprite(this.puyoTextures[`${name}_0.png`]);
      this.puyos[i].scale.set(1.2);
      // this.puyos[i].anchor.set(0.5);
      this.puyos[i].filters = [this.simState.aesthetic.hsbFilters[name]];
      this.puyos[i].position.set((this.puyos[i].width + 10) * i, 60);

      this.puyos[i].interactive = true;
      this.puyos[i].buttonMode = true;

      this.puyos[i].on('pointerdown', () => {
        if (!this.orderChanging) return;

        if (this.newOrder.includes(i + PUYOTYPE.RED)) return;

        this.newOrder.push(i + PUYOTYPE.RED);
        this.numbers[i].visible = true;
        this.numbers[i].text = `${this.newOrder.length}`;

        if (this.newOrder.length === 5) {
          this.dispatchNewOrder();
          this.orderChanging = false;
        }
      });

      this.addChild(this.puyos[i]);
    }

    this.reset = new TextButton('Reselect Order');
    this.reset.position.set(this.width / 2 - this.reset.width / 2, 160);
    this.reset.interactive = true;
    this.reset.buttonMode = true;
    this.reset.on('pointerdown', () => {
      this.orderChanging = true;
      this.numbers.forEach((num) => (num.visible = false));
      this.newOrder.length = 0; // Clear the old array
    });
    this.addChild(this.reset);
  }

  public refreshSprites(): void {
    for (let i = 0; i < puyoColors.length; i++) {
      const name = puyoColors[i];
      this.puyos[i].texture = this.puyoTextures[`${name}_0.png`];
      this.puyos[i].filters = [this.simState.aesthetic.hsbFilters[name]];
    }
  }

  public dispatchNewOrder(): void {
    // for (let i = 0; i < this.newOrder.length; i++) {
    //   this.simState.colorOrder[i] = this.newOrder[i];
    // }

    this.simState.mapNewColorOrder(this.newOrder);
    this.chainsim.activePair?.refreshSprites();
    this.chainsim.nextWindow?.colorSet.refreshSprites();
    this.chainsim.nextWindow?.drawer.refreshSprites();
    this.chainsim.nextWindow?.window.nextPuyos.refreshSprites();
  }
}
