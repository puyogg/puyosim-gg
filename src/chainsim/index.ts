import * as PIXI from 'pixi.js';
import { AppState } from './state';
import { StateContainer } from './container';
import { ASSET_PATH } from './constants';
import { Frame } from './frame';

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
  private animationState: (delta: number) => void;

  constructor(options: PixiOptions) {
    this.simLoaded = false;
    this.app = new PIXI.Application(options);

    // Construct the starting state. Some stuff might've been passed
    // in as a parameter...
    this.state = new AppState();

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
      .add(`${ASSET_PATH}/puyo.json`)
      .add(`${ASSET_PATH}/arle_bg.png`)
      .add(`${ASSET_PATH}/field.json`)
      .load(() => {
        this.init();
      })
      .onComplete.add(() => {
        this.simLoaded = true;
        this.app.ticker.add((delta: number) => this.gameLoop(delta));
      });

    // Add components that this instance of Chainsim will need
  }

  /** Initialize sprites and containers that are shared among all chainsim types. */
  private init(): void {
    this.frame = new Frame(this.root);
    this.frame.x = 0;
    this.frame.y = 12;

    this.animationState = this.idle;
  }

  /////////////////////////////
  // Animation State Methods //
  /////////////////////////////
  private gameLoop(delta: number) {
    this.animationState(delta);
  }

  private idle(delta: number) {
    this.frame?.update(delta);
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
