import { PuyoField, NumField, BoolField } from '../solver/field';
import { PUYOTYPE, DEFAULT_SETTINGS } from '../solver/constants';
import { ChainSolver } from '../solver';
import { TsuRNG } from './rng';
import { ASSET_PATH } from './constants';
import { parseCharID, parseSkinID, makeHSBFilter } from './helper/aesthetic';

interface SimulatorSettings {
  rows: number;
  cols: number;
  hrows: number;
  puyoToPop: number;
}

interface PixelSizing {
  cellWidth: number;
  cellHeight: number;
}

interface FieldData {
  puyo: PuyoField;
  shadow: PuyoField;
  arrow: NumField;
  cursor: BoolField;
  number: NumField;
  comment?: string;
}

interface PuyoMovement {
  softDropSpeed: number; // Used for soft dropping and for gravity after chaining event.
  dropSpeedDuringChain: number; // Drop speed used on Puyos after a chaining event
}

interface Aesthetic {
  charBG: string;
  charID: number;
  skin: string;
  skinID: number;
  hsbData: HSBData;
  hsbFilters: HSBFilters;
}

interface PuyoHSB {
  hue: number;
  sat: number;
  bri: number;
}

export interface HSBData {
  [index: string]: PuyoHSB;
  red: PuyoHSB;
  green: PuyoHSB;
  blue: PuyoHSB;
  yellow: PuyoHSB;
  purple: PuyoHSB;
  garbage: PuyoHSB;
}

export interface HSBFilters {
  [index: string]: PIXI.Filter;
  red: PIXI.Filter;
  green: PIXI.Filter;
  blue: PIXI.Filter;
  yellow: PIXI.Filter;
  purple: PIXI.Filter;
  garbage: PIXI.Filter;
}

type LoadableSlideData = PUYOTYPE[] | PuyoField | FieldData | FieldData[] | undefined;

// Type Guards
function isPuyoArray(array: PUYOTYPE[] | FieldData[]): array is PUYOTYPE[] {
  return typeof array[0] === 'number';
}

class AppState {
  // Puyo Randomization
  public seed: number; // 32-bit unsigned integer
  public pool: number[];
  public origPool: number[];
  public poolPos: number;
  public poolChanged: boolean; // If you manually edit any puyos

  // Overall state
  public mode: 'editor' | 'game';
  public replay: boolean;

  // Sizing
  public simSettings: SimulatorSettings;
  public pxSizing: PixelSizing;

  // Track placement history, slideshow position
  public slides: FieldData[];
  public slidePos: number;

  // Track position in chaining animation.
  public solver: ChainSolver;
  public solverStep: number;

  // Animation controls
  public autoStep: boolean; // Pause simulation after each pop or drop
  public simSpeed: number;

  // Puyo movement
  public puyoMovement: PuyoMovement;

  // customization
  public aesthetic: Aesthetic;

  constructor(x?: LoadableSlideData) {
    this.mode = 'editor'; // Need to include option to load straight into game mode.
    this.replay = false; // If true, don't override the next slides when the sim steps.

    this.seed = Math.floor(Math.random() * 4294967296); // 32-bit unsigned int
    console.log('Color seed: ', this.seed);
    this.pool = TsuRNG.getPools(this.seed, [2, 3, 4, 5, 6]).color4;
    console.log('Pool: ', this.pool);
    this.origPool = this.pool.slice();
    this.poolPos = 0;
    this.poolChanged = false;

    console.log(`${ASSET_PATH}/character/${parseCharID(7)}`);

    this.aesthetic = {
      charID: 30,
      charBG: `${ASSET_PATH}/character/${parseCharID(30)}`,
      skinID: 2,
      skin: `${ASSET_PATH}/puyo/${parseSkinID(2)}`,
      hsbData: {
        red: { hue: 0, sat: 0, bri: 1 },
        green: { hue: 0, sat: 0, bri: 1 },
        blue: { hue: 0, sat: 0, bri: 1 },
        yellow: { hue: 0, sat: 0, bri: 1 },
        purple: { hue: 0, sat: 0, bri: 1 },
        garbage: { hue: 0, sat: 0, bri: 1 },
      },
      hsbFilters: {
        red: makeHSBFilter(0, 0, 1),
        green: makeHSBFilter(0, 0, 1),
        blue: makeHSBFilter(0, 0, 1),
        yellow: makeHSBFilter(0, 0, 1),
        purple: makeHSBFilter(0, 0, 1),
        garbage: makeHSBFilter(0, 0, 1),
      },
    };

    console.log(this.aesthetic.hsbFilters);

    this.simSettings = {
      rows: 13,
      cols: 6,
      hrows: 1,
      puyoToPop: 4,
    };

    this.pxSizing = {
      cellWidth: 64,
      cellHeight: 60,
    };

    // This should get overwritten by any incoming states.
    this.slides = [];
    this.initSlides(x);
    this.slidePos = 0;

    // Chain solver with full step tracking for guiding the chain animation
    this.solver = new ChainSolver(this.slides[this.slidePos].puyo.data, DEFAULT_SETTINGS);
    this.solverStep = 0;

    // Animation controls
    this.autoStep = true;
    this.simSpeed = 1;

    // Puyo Movement
    this.puyoMovement = {
      softDropSpeed: this.pxSizing.cellHeight / 2,
      dropSpeedDuringChain: this.pxSizing.cellHeight / 2,
    };
  }

  public initSlides(x: LoadableSlideData): void {
    if (x === undefined) {
      this.slides.push(this.emptySlide());
    } else if (x instanceof PuyoField) {
      this.slides.push({
        puyo: new PuyoField(this.simSettings.rows, this.simSettings.cols, x.data),
        shadow: new PuyoField(this.simSettings.rows, this.simSettings.cols),
        arrow: new NumField(this.simSettings.rows, this.simSettings.cols),
        cursor: new BoolField(this.simSettings.rows, this.simSettings.cols),
        number: new NumField(this.simSettings.rows, this.simSettings.cols),
      });
    } else if (Array.isArray(x) && x.length > 0) {
      if (isPuyoArray(x)) {
        this.slides.push({
          puyo: new PuyoField(this.simSettings.rows, this.simSettings.cols, x),
          shadow: new PuyoField(this.simSettings.rows, this.simSettings.cols),
          arrow: new NumField(this.simSettings.rows, this.simSettings.cols),
          cursor: new BoolField(this.simSettings.rows, this.simSettings.cols),
          number: new NumField(this.simSettings.rows, this.simSettings.cols),
        });
      } else {
        // I should probably implement something that properly copies everything instead of
        // setting a reference.
        this.slides = x;
      }
    } else {
      this.slides.push(this.emptySlide());
    }
  }

  private emptySlide(): FieldData {
    return {
      puyo: new PuyoField(this.simSettings.rows, this.simSettings.cols),
      shadow: new PuyoField(this.simSettings.rows, this.simSettings.cols),
      arrow: new NumField(this.simSettings.rows, this.simSettings.cols),
      cursor: new BoolField(this.simSettings.rows, this.simSettings.cols),
      number: new NumField(this.simSettings.rows, this.simSettings.cols),
    };
  }

  public addSlide(fieldData?: FieldData | PuyoField): void {
    let newSlide: FieldData;
    const rows = this.simSettings.rows;
    const cols = this.simSettings.cols;

    // Gotta update this to also handle reading replays...
    if (fieldData instanceof PuyoField) {
      newSlide = {
        puyo: new PuyoField(rows, cols, fieldData.data),
        shadow: new PuyoField(rows, cols),
        arrow: new NumField(rows, cols),
        cursor: new BoolField(rows, cols),
        number: new NumField(rows, cols),
      };
    } else if (fieldData) {
      // Create a copy of the passed in field data if it was defined.
      newSlide = {
        puyo: new PuyoField(rows, cols, fieldData.puyo.data),
        shadow: new PuyoField(rows, cols, fieldData.shadow.data),
        arrow: new NumField(rows, cols, fieldData.arrow.data),
        cursor: new BoolField(rows, cols, fieldData.cursor.data),
        number: new NumField(rows, cols, fieldData.number.data),
      };
    } else {
      // Otherwise, append an empty slide
      newSlide = {
        puyo: new PuyoField(rows, cols),
        shadow: new PuyoField(rows, cols),
        arrow: new NumField(rows, cols),
        cursor: new BoolField(rows, cols),
        number: new NumField(rows, cols),
      };
    }

    // Assuming slidePos had already been increased before this whole function was called...
    this.slides.splice(this.slidePos, 1, newSlide);
    console.log(this.slides);
  }

  public get latestFields(): FieldData {
    return this.slides[this.slides.length - 1];
  }
}

export { AppState, LoadableSlideData };
