import * as PIXI from 'pixi.js';
import { AppState, LoadableSlideData } from './state';
import { StateContainer } from './container';
import { ASSET_PATH } from './constants';
import { Frame } from './frame';
import { PuyoField } from '~/solver/field';

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
  private state: AppState;
  private loader: PIXI.Loader;
  private resources: PIXI.IResourceDictionary;
  private simLoaded: boolean;
  private root: StateContainer;

  private frame: Frame | undefined;

  // Function that plays on every tick. Swap it out with other methods.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private animationState: (delta: number, ...args: any[]) => void;

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

    // Set the stage
    this.root = new StateContainer(undefined, this.state, this.resources);
    this.app.stage.addChild(this.root);

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
      .load(() => {
        this.init();
      })
      .onComplete.add(() => {
        this.simLoaded = true;
        this.app.ticker.add((delta: number) => this.gameLoop(delta));

        // setInterval(() => {
        //   this.gameLoop(1);
        // }, 200);
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
    this.root.addChild(graphics);

    this.frame = new Frame(this.root);
    this.frame.x = 0;
    this.frame.y = 128;

    // this.animationState = this.idle;
    this.animationState = this.simulateStep;
  }

  /////////////////////////////
  // Animation State Methods //
  /////////////////////////////
  private gameLoop(delta: number) {
    this.animationState(delta);
  }

  /** Chain solver inactive, no other actions */
  private idle(delta: number) {
    this.frame?.update(delta);
  }

  /** Simulate a step. This function assumes the previous state was this.idle() */
  private simulateStep(delta: number) {
    this.state.stepByStep = true;

    // Lock out certain controls
    // ... To implement

    // Bring current slide's PuyoField into the solver and run it
    const puyoField = this.state.slides[this.state.slidePos].puyo;
    this.state.solver.resetToField(puyoField);
    this.state.solver.simulate();
    this.state.solverStep = 0;

    // Decide whether we're gonna animate drops or pops.
    // Run the preparation methods.
    if (this.state.solver.states[0].hasDrops) {
      return this.prepAnimateChainDrops(puyoField);
    } else if (this.state.solver.states[0].hasPops) {
      return this.prepAnimatePops(puyoField);
    }
  }

  /** Update any states that need to change before we go into the dropping animation. */
  private prepAnimateChainDrops(puyoField: PuyoField) {
    this.animationState = this.animateChainDrops;
    this.frame?.puyoLayer.prepAnimateChainDrops(puyoField);
  }

  private animateChainDrops(delta: number) {
    const finished = this.frame?.puyoLayer.animateChainDrops(delta);
    if (finished) {
      console.log('No more drops!');

      // Advance to the next solver step.
      this.state.solverStep += 1;

      if (this.state.solver.states[this.state.solverStep].hasPops) {
        return this.prepAnimatePops((this.frame as Frame).puyoLayer.tempField);
      } else {
        this.animationState = this.chainFinished;
      }
    }
  }

  /** Update any states that need to change before we go into the popping animation. */
  private prepAnimatePops(puyoField: PuyoField) {
    this.animationState = this.animatePops;
    this.frame?.puyoLayer.prepAnimatePops(puyoField);
  }

  private animatePops(delta: number) {
    console.log('Animating Pops');
  }

  private chainFinished(delta: number) {
    // Similar to idle, but editor functions should be disabled.
    console.log('Chain finished.');
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
