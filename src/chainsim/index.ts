import * as PIXI from 'pixi.js';
import { AppState, LoadableSlideData } from './state';
import { ASSET_PATH } from './constants';
import { Frame } from './frame';
import { ScoreDisplay } from './score';
import { GarbageTray } from './garbage-tray';
import { ChainCounter } from './chain-counter';
import { Toolbox } from './toolbox';
import { NextWindow } from './next-window';

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
class Chainsim {
  private app: PIXI.Application;
  private loader: PIXI.Loader;
  private simLoaded: boolean;
  public state: AppState;
  public resources: PIXI.IResourceDictionary;

  // Field
  public frame: Frame | undefined;
  private scoreDisplay: ScoreDisplay | undefined;
  private garbageTray: GarbageTray | undefined;

  // Toolbox
  private toolbox: Toolbox | undefined;
  private chainCounter: ChainCounter | undefined;

  // Next Window
  public nextWindow: NextWindow | undefined;

  // Function that plays on every tick. Swap it out with other methods.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public animationState: (delta: number, ...args: any[]) => void;

  constructor(options: PixiOptions, slideData?: LoadableSlideData) {
    this.simLoaded = false;
    this.app = new PIXI.Application(options);

    // Construct the starting state. Some stuff might've been passed
    // in as a parameter...
    this.state = new AppState(slideData);

    // Set up loader, but don't run it yet. I need the reference to resources.
    // Run the asset loader
    this.loader = new PIXI.Loader();
    this.resources = this.loader.resources;

    // Set default animation state
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.animationState = () => {};

    // Run the asset loader
    this.loader
      .add(`${ASSET_PATH}/arle_bg.png`)
      .add(`${ASSET_PATH}/puyo.json`)
      .add(`${ASSET_PATH}/layout.json`)
      .add(`${ASSET_PATH}/scoreFont.json`)
      .add(`${ASSET_PATH}/chain_font.json`)
      .add(`${ASSET_PATH}/tools.json`)
      .load()
      .onComplete.add(() => {
        this.simLoaded = true;
        this.init();
        this.app.ticker.add((delta: number) => this.gameLoop(delta));
      });

    // Add components that this instance of Chainsim will need
  }

  /** Initialize sprites and containers that are shared among all chainsim types. */
  private init(): void {
    // Test background
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x00ff00);
    graphics.drawRect(0, 0, 630, 1000);
    graphics.endFill();
    this.app.stage.addChild(graphics);

    //// FIELD ////
    this.frame = new Frame(this);
    this.frame.x = 0;
    this.frame.y = 132;
    this.app.stage.addChild(this.frame);
    this.app.ticker.add((delta: number) => this.frame?.update(delta));

    this.scoreDisplay = new ScoreDisplay(this, this.frame.puyoLayer);
    this.scoreDisplay.x = 32;
    this.scoreDisplay.y = 935;
    this.app.stage.addChild(this.scoreDisplay);
    this.app.ticker.add(() => this.scoreDisplay?.update());

    this.garbageTray = new GarbageTray(this, this.frame.puyoLayer);
    this.garbageTray.x = 337;
    this.garbageTray.y = 915;
    this.garbageTray.scale.set(0.7, 0.7);
    this.app.stage.addChild(this.garbageTray);
    this.app.ticker.add((delta: number) => this.garbageTray?.update(delta));
    ///////////////

    //// TOOLBOX ////
    this.toolbox = new Toolbox(this);
    this.toolbox.position.set(438, 548);
    this.app.stage.addChild(this.toolbox);
    /////////////////

    this.nextWindow = new NextWindow(this);
    this.nextWindow.position.set(456, 160);
    // this.nextWindow.position.set(200, 200);
    this.app.stage.addChild(this.nextWindow);

    //// CHAIN COUNTER ////
    this.chainCounter = new ChainCounter(this, this.frame.puyoLayer);
    this.chainCounter.x = 432;
    this.chainCounter.y = 836;
    this.app.stage.addChild(this.chainCounter);
    this.app.ticker.add((delta: number) => this.chainCounter?.update(delta));
    ///////////////////////

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
    }
  }

  /** Update any states that need to change before we go into the dropping animation. */
  private prepAnimateChainDrops() {
    this.animationState = this.animateChainDrops;

    // Use the current solver state to setup the drop animation
    // const puyoField = this.state.slides[this.state.slidePos].puyo;
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
    // Similar to idle, but editor functions should be disabled.
    // console.log('Chain finished.');
  }

  public mountGame(el: HTMLElement): void {
    el.appendChild(this.app.view);
  }
}

class ChainsimFull extends Chainsim {
  constructor(options: PixiOptions) {
    super(options);
  }
}

export { Chainsim, ChainsimFull };
