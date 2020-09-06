import * as PIXI from 'pixi.js';
import { AppState, LoadableSlideData } from './state';
import { ASSET_PATH } from './constants';
import { Frame } from './frame';
import { ScoreDisplay } from './score';
import { GarbageTray } from './garbage-tray';
import { ChainCounter } from './chain-counter';
import { Toolbox } from './toolbox';
import { NextWindow } from './next-window';
import { OptionButtons } from './meta-options';
import { ActivePairContainer } from './active-pair';
import { PuyoField } from '../solver/field';
import { SlideChanger } from './slide';
import { get2d } from '../solver/helper';
import { NoteWindow } from './note';
import { OptionsMenu } from './options';
import { Keyboard } from './keyboard';
import puyoJSON from './helper/puyo.json';
import { loadCustomization, StoredCustomization } from './helper/storage';

/** Subset of options available at https://pixijs.download/v5.3.3/docs/PIXI.Application.html */
interface PixiOptions {
  width: number;
  height: number;
  transparent: boolean;
  antialias: boolean;
  preserveDrawingBuffer: boolean;
  // resolution: number; // How does this work? It's new.
  // autoDensity: boolean; // How does this work? It's new.
  // resizeTo: Window | HTMLElement; // How does this work? It's new.
}

/**
 * Wrapper class for a PIXI Application.
 * - Coordinates the different components.
 * - Provides methods for mounting the game to an HTMLElement.
 */
export class Chainsim {
  public app: PIXI.Application;
  public root: PIXI.Container; // Gets blurred when the options menu appears.
  public loader: PIXI.Loader;
  private simLoaded: boolean;
  public state: AppState;
  public resources: PIXI.IResourceDictionary;

  public frame: Frame | undefined;
  private scoreDisplay: ScoreDisplay | undefined;
  public garbageTray: GarbageTray | undefined;

  public toolbox: Toolbox | undefined;
  private chainCounter: ChainCounter | undefined;

  public nextWindow: NextWindow | undefined;

  // Edit, Game, Accessibility
  public optionButtons: OptionButtons | undefined;

  public activePair: ActivePairContainer | undefined;

  public slideChanger: SlideChanger | undefined;

  public noteWindow: NoteWindow | undefined;

  public optionsMenu: OptionsMenu | undefined;

  // Controls
  public keyboard: Keyboard;

  // Function that plays on every tick. Swap it out with other methods.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public animationState: (delta: number, ...args: any[]) => void;

  constructor(options: PixiOptions, customization?: StoredCustomization, slideData?: LoadableSlideData) {
    this.simLoaded = false;
    this.app = new PIXI.Application(options);

    this.root = new PIXI.Container();
    this.app.stage.addChild(this.root);

    // Construct the starting state. Some stuff might've been passed
    // in as a parameter...
    this.keyboard = new Keyboard(this.app.view);
    this.state = new AppState(this, customization, slideData);

    // Set up loader, but don't run it yet. I need the reference to resources.
    // Run the asset loader
    this.loader = new PIXI.Loader();
    this.resources = this.loader.resources;

    // Set default animation state
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.animationState = () => {};

    // CSS Stuff
    // so  users don't get trapped inside the chainsim
    this.app.renderer.plugins.interaction.autoPreventDefault = false;
    this.app.renderer.view.style.touchAction = 'manipulation';
    this.app.renderer.view.style.width = '100%';
    // Set tabindex=0 to allow for focusable keyboard inputs
    this.app.renderer.view.tabIndex = 0;

    globalThis.onresize = () => this.resizeCanvas();

    this.resizeCanvas();

    this.runLoader();
  }

  private resizeCanvas(): void {
    const parent = this.app.view.parentElement;

    if (!parent) return;

    let height = parent.getBoundingClientRect().width * 1.5873015873;
    let width = parent.getBoundingClientRect().width;
    this.app.view.style.height = `${height}px`;
    this.app.view.style.width = `${width}px`;

    // !!! Check if we have the note window open
    // But if the game is taller than the window, resize it again
    // let gameHeight = parseFloat(this.app.view.style.height.replace(/[^\d.-]/g, ''));
    if (!this.noteWindow?.visible) {
      if (height > window.innerHeight) {
        height = window.innerHeight;
        width = window.innerHeight * 0.63;
        this.app.view.style.height = `${height}px`;
        this.app.view.style.width = `${width}px`;
      }
    }

    this.noteWindow?.resize(width, height);
  }

  private async runLoader(): Promise<void> {
    // Overwrite the sim state with any saved data from IndexedDB.
    // await this.state.loadCustomization();

    // Replace the loaded puyo skin with the one in the state obj.
    puyoJSON.meta.image = this.state.aesthetic.skin;
    const sheetBase64 = globalThis.btoa(JSON.stringify(puyoJSON));
    const sheetURL = 'data:application/json;base64,' + sheetBase64;

    // Run the asset loader
    this.loader
      .add(this.state.aesthetic.charBG)
      .add(`${ASSET_PATH}/save_wheel.png`)
      .add(`${ASSET_PATH}/char_ppt.json`)
      .add(`${ASSET_PATH}/char_esports.json`)
      .add(`${ASSET_PATH}/selected_char.png`)
      .add(`${ASSET_PATH}/bubble.png`)
      .add(`${ASSET_PATH}/puyo.json`, sheetURL)
      .add(`${ASSET_PATH}/layout.json`)
      .add(`${ASSET_PATH}/scoreFont.json`)
      .add(`${ASSET_PATH}/chain_font.json`)
      .add(`${ASSET_PATH}/tools.json`)
      .add(`${ASSET_PATH}/puyotrim.json`)
      .load()
      .onComplete.once(() => {
        this.simLoaded = true;
        this.initObjects();
        this.app.ticker.add((delta: number) => this.gameLoop(delta));
      });
  }

  /** Initialize sprites and containers that are shared among all chainsim types. */
  private initObjects(): void {
    // Test background
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x22dd77);
    graphics.drawRect(0, 0, 630, 1000);
    graphics.endFill();
    this.root.addChild(graphics);

    //// FIELD ////
    this.frame = new Frame(this);
    this.frame.x = 0;
    this.frame.y = 132;
    this.root.addChild(this.frame);

    this.scoreDisplay = new ScoreDisplay(this, this.frame.puyoLayer);
    this.scoreDisplay.x = 32;
    this.scoreDisplay.y = 935;
    this.root.addChild(this.scoreDisplay);

    this.garbageTray = new GarbageTray(this, this.frame.puyoLayer);
    this.garbageTray.x = 337;
    this.garbageTray.y = 915;
    this.garbageTray.scale.set(0.7, 0.7);
    this.root.addChild(this.garbageTray);

    //// ACTIVE PAIR ////
    this.activePair = new ActivePairContainer(this);
    this.activePair.x = this.frame.puyoLayer.toGlobal(this.root).x;
    this.activePair.y = this.frame.puyoLayer.toGlobal(this.root).y - 60 * 2;
    this.root.addChild(this.activePair);

    //// TOOLBOX ////
    this.toolbox = new Toolbox(this);
    this.toolbox.position.set(438, 548);
    this.root.addChild(this.toolbox);

    //// CHAIN COUNTER ////
    this.chainCounter = new ChainCounter(this, this.frame.puyoLayer);
    this.chainCounter.x = 432;
    this.chainCounter.y = 836;
    this.root.addChild(this.chainCounter);

    //// NEXT WINDOW ////
    this.nextWindow = new NextWindow(this);
    this.nextWindow.position.set(456, 160);
    this.root.addChild(this.nextWindow);

    //// OPTIONS ////
    this.optionButtons = new OptionButtons(this);
    this.optionButtons.position.set(485, 30);
    this.optionButtons.scale.set(0.8);
    this.root.addChild(this.optionButtons);

    //// Slide Changer ////
    this.slideChanger = new SlideChanger(this);
    this.slideChanger.position.set(530, 135);
    this.slideChanger.scale.set(0.76);
    this.root.addChild(this.slideChanger);

    // Note Window ////
    this.noteWindow = new NoteWindow(this);
    this.noteWindow.position.set(0, 0);
    this.noteWindow.setVisible(false);
    this.root.addChild(this.noteWindow);

    this.optionsMenu = new OptionsMenu(this);
    this.app.stage.addChild(this.optionsMenu);

    // Add a bunch of things to the ticker
    this.app.ticker.add((delta: number) => {
      this.frame?.update(delta);
      this.scoreDisplay?.update();
      this.garbageTray?.update(delta);
      this.toolbox?.update();
      this.activePair?.update(delta);
      this.chainCounter?.update(delta);
      this.nextWindow?.update(delta);
      this.slideChanger?.update();
      this.noteWindow?.update();
      this.optionsMenu?.update();
    });

    // Now that everything's been placed, resize the canvas.
    this.resizeCanvas();
    this.animationState = this.idle;
  }

  private gameLoop(delta: number) {
    for (let i = 0; i < this.state.simSpeed; i++) {
      this.animationState(delta);
    }
  }

  /** Chain solver inactive, no other actions */
  public idle(delta: number): void {
    //
  }

  /** Simulate a step. This function assumes the previous state was this.idle() */
  public startSimulation(): void {
    const puyoField = this.state.slides[this.state.slidePos].puyo;

    if (this.animationState === this.idle) {
      // Bring current slide's PuyoField into the solver and run it
      this.state.solver.resetToField(puyoField);
      this.state.solver.simulate();
      this.state.solverStep = 0;
    }

    this.continueSimulation();
  }

  public continueSimulation(): void {
    if (this.state.solver.states[this.state.solverStep].hasDrops) {
      return this.prepAnimateChainDrops();
    } else if (this.state.solver.states[this.state.solverStep].hasPops) {
      // return this.prepAnimatePops(this.state.solver.states[this.state.solverStep]);
      return this.prepAnimatePops();
    } else {
      this.animationState = this.chainPaused;
    }
  }

  /** Update any states that need to change before we go into the dropping animation. */
  private prepAnimateChainDrops() {
    this.animationState = this.animateChainDrops;

    const puyoField = this.state.solver.states[this.state.solverStep].puyoField;
    this.frame?.puyoLayer.prepAnimateChainDrops(puyoField);
  }

  public animateChainDrops(delta: number): void {
    const finished = this.frame?.puyoLayer.animateChainDrops(delta);
    if (finished) {
      // Advance to the next solver step.
      this.state.solverStep += 1;

      if (this.state.solver.states[this.state.solverStep].hasPops && this.state.autoStep) {
        return this.prepAnimatePops();
      } else {
        this.animationState = this.chainPaused;
      }
    }
  }

  public prepDropActivePair(inputField: PuyoField): void {
    this.animationState = this.animateDropActivePair;
    this.state.autoStep = true;
    this.frame?.puyoLayer.prepAnimateChainDrops(inputField);
  }

  public animateDropActivePair(delta: number): void {
    const finished = this.frame?.puyoLayer.animateChainDrops(delta);
    if (finished) {
      // this.animationState = this.animateNextWindow;
      // Gotta check for pops
      const field = (this.frame as Frame).puyoLayer.tempField;
      this.state.solver.resetToField(field);
      this.state.solver.simulate();
      this.state.solverStep = 0;
      this.continueSimulation();
    }
  }

  public animateNextWindow(delta: number): void {
    const finished = this.nextWindow?.window.nextPuyos.animate();
    if (finished) {
      this.animationState = this.idle;
      if (!this.state.replay) {
        this.state.slidePos += 1;
        this.state.poolPos = (this.state.poolPos + 2) % this.state.pool.length;
        const field = (this.frame as Frame).puyoLayer.tempField; // Get the dropped field
        this.state.addSlide(field); // Gets a copied FieldData and pushes to slides
      }
    }
  }

  /** Update any states that need to change before we go into the popping animation. */
  private prepAnimatePops() {
    this.animationState = this.animatePops;
    const fieldState = this.state.solver.states[this.state.solverStep];
    this.frame?.puyoLayer.prepAnimatePops(fieldState);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public animatePops(delta: number): void {
    const finished = this.frame?.puyoLayer.animateChainPops();

    if (finished) {
      // Advance to the next solver step.
      this.state.solverStep += 1;

      if (this.state.solver.states[this.state.solverStep].hasDrops && this.state.autoStep) {
        return this.prepAnimateChainDrops();
      } else {
        this.animationState = this.chainPaused;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public chainPaused(delta: number): void {
    // If we're in game mode, don't pause.
    if (this.state.mode === 'game') {
      this.animationState = this.animateNextWindow;
      this.animateNextWindow(delta);
    }
  }

  ///////////////////////////////////
  //////// COMMANDS /////////////////
  ///////////////////////////////////
  // These are usually called from the toolbox.
  public solverReset(): void {
    this.state.solverStep = 0;
    this.animationState = this.idle;
    // const puyoField = this.state.solver.states[this.state.solverStep].puyoField;
    const puyoField = this.state.slides[this.state.slidePos].puyo;
    this.state.solver.resetToField(puyoField);
    this.state.solver.simulate();
    this.state.solverStep = 0;
    this.frame?.puyoLayer.refreshSprites(puyoField);
    this.frame?.puyoLayer.tempField.copyFrom(puyoField);
  }

  public solverStepBack(): void {
    if (this.animationState === this.animatePops || this.animationState === this.animateChainDrops) {
      this.state.solverStep = this.state.solverStep === 0 ? 0 : this.state.solverStep - 1;
      this.state.simSpeed = 1;
      this.animationState = this.state.solverStep === 0 ? this.idle : this.chainPaused;
      const puyoField = this.state.solver.states[this.state.solverStep].puyoField;
      this.frame?.puyoLayer.refreshSprites(puyoField);
      return;
    }

    if (this.animationState === this.idle || this.animationState === this.chainPaused) {
      if (this.state.solverStep === 0) {
        this.animationState = this.idle;
      } else {
        this.state.solverStep = this.state.solverStep - 1;
      }
      const puyoField = this.state.solver.states[this.state.solverStep].puyoField;
      this.frame?.puyoLayer.refreshSprites(puyoField);
    }
  }

  public solverPause(): void {
    if (this.animationState === this.animatePops || this.animationState === this.animateChainDrops) {
      this.animationState = this.chainPaused;
      const puyoField = this.state.solver.states[this.state.solverStep].puyoField;
      this.frame?.puyoLayer.refreshSprites(puyoField);
    }
  }

  public solverStep(): void {
    if (this.animationState === this.idle) {
      this.state.autoStep = false;
      this.state.simSpeed = 1;
      this.startSimulation();
      return;
    }

    if (this.animationState === this.chainPaused) {
      this.state.autoStep = false;
      this.state.simSpeed = 1;
      this.continueSimulation();
      return;
    }

    if (this.animationState === this.animatePops || this.animationState === this.animateChainDrops) {
      this.state.solverStep += 1;
      this.state.simSpeed = 1;
      this.animationState = this.chainPaused;
      const puyoField = this.state.solver.states[this.state.solverStep].puyoField;
      this.frame?.puyoLayer.refreshSprites(puyoField);
      return;
    }
  }

  public solverPlay(): void {
    if (this.animationState === this.idle) {
      this.state.autoStep = true;
      this.state.simSpeed = 1;
      this.startSimulation();
      return;
    }

    if (this.animationState === this.chainPaused) {
      this.state.autoStep = true;
      this.state.simSpeed = 1;
      this.continueSimulation();
      return;
    }

    if (this.animationState === this.animatePops || this.animationState === this.animateChainDrops) {
      this.state.autoStep = true;
      this.state.simSpeed *= 2;
      return;
    }
  }

  public mountGame(el: HTMLElement): void {
    el.appendChild(this.app.view);
  }
}

export async function createChainsim(options: PixiOptions, slideData?: LoadableSlideData): Promise<Chainsim> {
  const customization = await loadCustomization();
  console.log('Loaded customization:', customization);

  return new Chainsim(options, customization, slideData);
}
