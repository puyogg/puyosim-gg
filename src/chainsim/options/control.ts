import { ASSET_PATH } from '../constants';
import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js';
import { Chainsim } from '../';
import skinList from '../skin-names.json';
import { OptionsMenu } from '.';
import { OptionPage } from './page';
import { TextButton } from './key-button';

const style = new PIXI.TextStyle({
  align: 'right',
  fontFamily: 'sans-serif',
  fontSize: 36,
  lineHeight: 60,
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

/** The field frame. Contains the borders, background, and field layers.*/
export class ControlPage extends OptionPage {
  private optionsMenu: OptionsMenu;

  private labels: PIXI.Text;

  private changeLeft: TextButton;
  private changeRight: TextButton;
  private changeDown: TextButton;
  private changeRotL: TextButton;
  private changeRotR: TextButton;
  private changeUndo: TextButton;
  private changeRedo: TextButton;
  private changeReset: TextButton;

  private prevKeyState: boolean;

  // private pointerDown: boolean;

  constructor(chainsim: Chainsim, optionsMenu: OptionsMenu) {
    super(chainsim);
    this.visible = false;
    this.optionsMenu = optionsMenu;
    this.prevKeyState = false;

    this.labels = new PIXI.Text('Left:\nRight:\nDown:\nRotate Left:\nRotate Right:\nUndo:\nRedo:\nReset:', style);
    this.labels.position.set(30, 300);
    this.addChild(this.labels);

    const keyboard = this.chainsim.keyboard;
    this.changeLeft = new TextButton(keyboard.left.code);
    this.changeRight = new TextButton(keyboard.right.code);
    this.changeDown = new TextButton(keyboard.down.code);
    this.changeRotL = new TextButton(keyboard.rotL.code);
    this.changeRotR = new TextButton(keyboard.rotR.code);
    this.changeUndo = new TextButton(keyboard.undo.code);
    this.changeRedo = new TextButton(keyboard.redo.code);
    this.changeReset = new TextButton(keyboard.reset.code);

    // Positioning
    const fields = [
      this.changeLeft,
      this.changeRight,
      this.changeDown,
      this.changeRotL,
      this.changeRotR,
      this.changeUndo,
      this.changeRedo,
      this.changeReset,
    ];
    for (let i = 0; i < fields.length; i++) {
      fields[i].position.set(280, 300 + 60 * i);
      fields[i].interactive = true;
      fields[i].buttonMode = true;
    }
    this.addChild(...fields);

    // Interaction event
    const awaitText = 'Press a key...';
    this.changeLeft.on('pointerdown', () => {
      this.chainsim.keyboard.changingBinds = true;
      this.chainsim.keyboard.bindTarget = this.chainsim.keyboard.left;
      this.showKeyCodes();
      this.changeLeft.text.text = awaitText;
    });

    this.changeRight.on('pointerdown', () => {
      this.chainsim.keyboard.changingBinds = true;
      this.chainsim.keyboard.bindTarget = this.chainsim.keyboard.right;
      this.showKeyCodes();
      this.changeRight.text.text = awaitText;
    });

    this.changeDown.on('pointerdown', () => {
      this.chainsim.keyboard.changingBinds = true;
      this.chainsim.keyboard.bindTarget = this.chainsim.keyboard.down;
      this.showKeyCodes();
      this.changeDown.text.text = awaitText;
    });

    this.changeRotL.on('pointerdown', () => {
      this.chainsim.keyboard.changingBinds = true;
      this.chainsim.keyboard.bindTarget = this.chainsim.keyboard.rotL;
      this.showKeyCodes();
      this.changeRotL.text.text = awaitText;
    });

    this.changeRotR.on('pointerdown', () => {
      this.chainsim.keyboard.changingBinds = true;
      this.chainsim.keyboard.bindTarget = this.chainsim.keyboard.rotR;
      this.showKeyCodes();
      this.changeRotR.text.text = awaitText;
    });

    this.changeUndo.on('pointerdown', () => {
      this.chainsim.keyboard.changingBinds = true;
      this.chainsim.keyboard.bindTarget = this.chainsim.keyboard.undo;
      this.showKeyCodes();
      this.changeUndo.text.text = awaitText;
    });

    this.changeRedo.on('pointerdown', () => {
      this.chainsim.keyboard.changingBinds = true;
      this.chainsim.keyboard.bindTarget = this.chainsim.keyboard.redo;
      this.showKeyCodes();
      this.changeRedo.text.text = awaitText;
    });

    this.changeReset.on('pointerdown', () => {
      this.chainsim.keyboard.changingBinds = true;
      this.chainsim.keyboard.bindTarget = this.chainsim.keyboard.reset;
      this.showKeyCodes();
      this.changeReset.text.text = awaitText;
    });
  }

  private showKeyCodes(): void {
    const keyboard = this.chainsim.keyboard;
    this.changeLeft.text.text = keyboard.left.code;
    this.changeRight.text.text = keyboard.right.code;
    this.changeDown.text.text = keyboard.down.code;
    this.changeRotL.text.text = keyboard.rotL.code;
    this.changeRotR.text.text = keyboard.rotR.code;
    this.changeUndo.text.text = keyboard.undo.code;
    this.changeRedo.text.text = keyboard.redo.code;
    this.changeReset.text.text = keyboard.reset.code;
  }

  public update(): void {
    if (this.visible) {
      if (this.prevKeyState && !this.chainsim.keyboard.changingBinds) {
        // Set all the box text back to the key code
        this.showKeyCodes();

        // Save state to localstorage?
        // Call a function in the state manager.
      }

      this.prevKeyState = this.chainsim.keyboard.changingBinds;
    }
  }
}
