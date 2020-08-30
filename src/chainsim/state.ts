import { PuyoField, NumField, BoolField } from '../solver/field';
import { PUYOTYPE, DEFAULT_SETTINGS } from '../solver/constants';
import { ChainSolver } from '../solver';
import { TsuRNG } from './rng';
import { ASSET_PATH } from './constants';
import { parseCharID, parseSkinID, makeHSBFilter } from './helper/aesthetic';
import localforage from 'localforage';
import { Chainsim } from '.';
import { isColored } from '../solver/helper';
import { StoredCustomization } from './helper/storage';

export interface SimulatorSettings {
  rows: number;
  cols: number;
  hrows: number;
  puyoToPop: number;
}

export interface PixelSizing {
  cellWidth: number;
  cellHeight: number;
}

export interface FieldData {
  puyo: PuyoField;
  shadow: PuyoField;
  arrow: NumField;
  cursor: BoolField;
  number: NumField;
  comment?: string[];
}

export interface PuyoMovement {
  softDropSpeed: number; // Used for soft dropping and for gravity after chaining event.
  dropSpeedDuringChain: number; // Drop speed used on Puyos after a chaining event
}

export interface Aesthetic {
  charBG: string;
  charID: number;
  skin: string;
  skinID: number;
  hsbData: HSBData;
  hsbFilters: HSBFilters;
  frameOrientation: 'p1' | 'p1reversed' | 'p2' | 'p2reversed';
}

export interface PuyoHSB {
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

/** Subset of the overall app state that can go into local storage. */
interface SavedState {
  // Puyo Randomization
  seed?: number;
  pool: number[];

  simSettings: SimulatorSettings;
}

export type LoadableSlideData = PUYOTYPE[] | PuyoField | FieldData | FieldData[] | undefined;

// Type Guards
export function isPuyoArray(array: PUYOTYPE[] | FieldData[]): array is PUYOTYPE[] {
  return typeof array[0] === 'number';
}

export class AppState {
  // Chainsim
  public chainsim: Chainsim;

  // Puyo Randomization
  public seed: number; // 32-bit unsigned integer
  public poolSetSize: 3 | 4 | 5; // Numb
  public pool: number[];
  public origPool: number[];
  public poolPos: number;
  public poolChanged: boolean; // If you manually edit any puyos
  public colorOrder: number[];

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

  constructor(chainsim: Chainsim, customization?: StoredCustomization, x?: LoadableSlideData) {
    this.chainsim = chainsim;

    this.mode = 'editor'; // Need to include option to load straight into game mode.
    this.replay = false; // If true, don't override the next slides when the sim steps.

    this.colorOrder = customization?.colorSet.order || [2, 3, 4, 5, 6];
    this.seed = Math.floor(Math.random() * 4294967296); // 32-bit unsigned int
    this.poolSetSize = customization?.colorSet.setSize || 4;
    this.pool = TsuRNG.getPools(this.seed, this.colorOrder).color4;
    this.origPool = this.pool.slice();
    this.poolPos = 0;
    this.poolChanged = false;

    console.log('Color seed: ', this.seed);
    console.log('Pool: ', this.pool);

    this.aesthetic = {
      charID: customization?.aesthetic.charID || 0,
      charBG: `${ASSET_PATH}/character/${parseCharID(customization?.aesthetic.charID || 0)}`,
      skinID: customization?.aesthetic.skinID || 8,
      skin: `${ASSET_PATH}/puyo/${parseSkinID(customization?.aesthetic.skinID || 8)}`,
      hsbData: {
        red: {
          hue: customization?.aesthetic.hsbData.red.hue || 0,
          sat: customization?.aesthetic.hsbData.red.sat || 0,
          bri: customization?.aesthetic.hsbData.red.bri || 1,
        },
        green: {
          hue: customization?.aesthetic.hsbData.green.hue || 0,
          sat: customization?.aesthetic.hsbData.green.sat || 0,
          bri: customization?.aesthetic.hsbData.green.bri || 1,
        },
        blue: {
          hue: customization?.aesthetic.hsbData.blue.hue || 0,
          sat: customization?.aesthetic.hsbData.blue.sat || 0,
          bri: customization?.aesthetic.hsbData.blue.bri || 1,
        },
        yellow: {
          hue: customization?.aesthetic.hsbData.yellow.hue || 0,
          sat: customization?.aesthetic.hsbData.yellow.sat || 0,
          bri: customization?.aesthetic.hsbData.yellow.bri || 1,
        },
        purple: {
          hue: customization?.aesthetic.hsbData.purple.hue || 0,
          sat: customization?.aesthetic.hsbData.purple.sat || 0,
          bri: customization?.aesthetic.hsbData.purple.bri || 1,
        },
        garbage: {
          hue: customization?.aesthetic.hsbData.garbage.hue || 0,
          sat: customization?.aesthetic.hsbData.garbage.sat || 0,
          bri: customization?.aesthetic.hsbData.garbage.bri || 1,
        },
      },
      hsbFilters: {
        red: makeHSBFilter(
          customization?.aesthetic.hsbData.red.hue || 0,
          customization?.aesthetic.hsbData.red.sat || 0,
          customization?.aesthetic.hsbData.red.bri || 1,
        ),
        green: makeHSBFilter(
          customization?.aesthetic.hsbData.green.hue || 0,
          customization?.aesthetic.hsbData.green.sat || 0,
          customization?.aesthetic.hsbData.green.bri || 1,
        ),
        blue: makeHSBFilter(
          customization?.aesthetic.hsbData.blue.hue || 0,
          customization?.aesthetic.hsbData.blue.sat || 0,
          customization?.aesthetic.hsbData.blue.bri || 1,
        ),
        yellow: makeHSBFilter(
          customization?.aesthetic.hsbData.yellow.hue || 0,
          customization?.aesthetic.hsbData.yellow.sat || 0,
          customization?.aesthetic.hsbData.yellow.bri || 1,
        ),
        purple: makeHSBFilter(
          customization?.aesthetic.hsbData.purple.hue || 0,
          customization?.aesthetic.hsbData.purple.sat || 0,
          customization?.aesthetic.hsbData.purple.bri || 1,
        ),
        garbage: makeHSBFilter(
          customization?.aesthetic.hsbData.garbage.hue || 0,
          customization?.aesthetic.hsbData.garbage.sat || 0,
          customization?.aesthetic.hsbData.garbage.bri || 1,
        ),
      },
      frameOrientation: customization?.aesthetic.frameOrientation || 'p1',
    };

    // Set Keyboard codes
    this.chainsim.keyboard.left.code = customization?.keybinds.left || this.chainsim.keyboard.left.code;
    this.chainsim.keyboard.right.code = customization?.keybinds.right || this.chainsim.keyboard.right.code;
    this.chainsim.keyboard.down.code = customization?.keybinds.down || this.chainsim.keyboard.down.code;
    this.chainsim.keyboard.rotL.code = customization?.keybinds.rotL || this.chainsim.keyboard.rotL.code;
    this.chainsim.keyboard.rotR.code = customization?.keybinds.rotR || this.chainsim.keyboard.rotR.code;
    this.chainsim.keyboard.undo.code = customization?.keybinds.undo || this.chainsim.keyboard.undo.code;
    this.chainsim.keyboard.redo.code = customization?.keybinds.redo || this.chainsim.keyboard.redo.code;
    this.chainsim.keyboard.reset.code = customization?.keybinds.reset || this.chainsim.keyboard.reset.code;

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

    // Remap colors for the slides
    this.remapSlideColors(this.colorOrder, [2, 3, 4, 5, 6]);

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

  public mapNewColorOrder(newOrder: number[], _oldOrder: number[]): void {
    const oldOrder = _oldOrder || this.colorOrder;

    // Make a lookup table
    const map = new Map<PUYOTYPE, PUYOTYPE>();
    for (let i = 0; i < newOrder.length; i++) {
      map.set(oldOrder[i], newOrder[i]);
    }

    // Go through the pool and remap the order
    for (let i = 0; i < this.pool.length; i++) {
      const newColor = map.get(this.pool[i]);
      if (!newColor) {
        console.error('There was an error updating the new color order.');
        continue;
      }

      this.pool[i] = newColor;
    }

    // Go through every slide and remap the puyo and shadow layers
    this.slides.forEach((slide) => {
      for (let i = 0; i < slide.puyo.data.length; i++) {
        if (!isColored(slide.puyo.data[i]) && slide.puyo.data[i] !== PUYOTYPE.GARBAGE) {
          // This cell is probably blank, hard, stone, or block. Skip
          continue;
        }

        const newPuyoColor = map.get(slide.puyo.data[i]);
        if (!newPuyoColor) {
          console.error('There was an error remapping the fields to a new color order.');
          continue;
        }

        slide.puyo.data[i] = newPuyoColor;
      }

      for (let i = 0; i < slide.shadow.data.length; i++) {
        if (!isColored(slide.shadow.data[i]) && slide.shadow.data[i] !== PUYOTYPE.GARBAGE) {
          // This cell is probably blank, hard, stone, or block. Skip
          continue;
        }

        const newShadowColor = map.get(slide.shadow.data[i]);
        if (!newShadowColor || (!isColored(newShadowColor) && newShadowColor !== PUYOTYPE.GARBAGE)) {
          console.error('There was an error remapping the fields to a new color order.');
          continue;
        }

        slide.shadow.data[i] = newShadowColor;
      }
    });

    // Update color orders for Puyo and Shadow layers
    this.chainsim.frame?.puyoLayer.mapNewColorOrder(map);

    // Overwrite the old color order
    for (let i = 0; i < this.colorOrder.length; i++) {
      this.colorOrder[i] = newOrder[i];
    }
    console.log(this.pool);
  }

  public remapSlideColors(newOrder: number[], oldOrder: number[]): void {
    const map = new Map<PUYOTYPE, PUYOTYPE>();
    for (let i = 0; i < newOrder.length; i++) {
      map.set(oldOrder[i], newOrder[i]);
    }

    // Go through every slide and remap the puyo and shadow layers
    this.slides.forEach((slide) => {
      for (let i = 0; i < slide.puyo.data.length; i++) {
        if (!isColored(slide.puyo.data[i]) && slide.puyo.data[i] !== PUYOTYPE.GARBAGE) {
          // This cell is probably blank, hard, stone, or block. Skip
          continue;
        }

        const newPuyoColor = map.get(slide.puyo.data[i]);
        if (!newPuyoColor) {
          console.error('There was an error remapping the fields to a new color order.');
          continue;
        }

        slide.puyo.data[i] = newPuyoColor;
      }

      for (let i = 0; i < slide.shadow.data.length; i++) {
        if (!isColored(slide.shadow.data[i]) && slide.shadow.data[i] !== PUYOTYPE.GARBAGE) {
          // This cell is probably blank, hard, stone, or block. Skip
          continue;
        }

        const newShadowColor = map.get(slide.shadow.data[i]);
        if (!newShadowColor || (!isColored(newShadowColor) && newShadowColor !== PUYOTYPE.GARBAGE)) {
          console.error('There was an error remapping the fields to a new color order.');
          continue;
        }

        slide.shadow.data[i] = newShadowColor;
      }
    });
  }

  public async saveCustomization(): Promise<boolean> {
    try {
      const customization: StoredCustomization = {
        aesthetic: {
          charID: this.aesthetic.charID,
          skinID: this.aesthetic.skinID,
          hsbData: this.aesthetic.hsbData,
          frameOrientation: this.aesthetic.frameOrientation,
        },
        keybinds: {
          left: this.chainsim.keyboard.left.code,
          right: this.chainsim.keyboard.right.code,
          down: this.chainsim.keyboard.down.code,
          rotL: this.chainsim.keyboard.rotL.code,
          rotR: this.chainsim.keyboard.rotR.code,
          undo: this.chainsim.keyboard.undo.code,
          redo: this.chainsim.keyboard.redo.code,
          reset: this.chainsim.keyboard.reset.code,
        },
        colorSet: {
          order: this.colorOrder,
          setSize: this.poolSetSize,
        },
        gameSettings: {
          gameSpeed: 1,
          softDropSpeed: 2,
          delayAutoShift: 8,
          autoRepeatRate: 2,
        },
        simulatorSettings: {
          language: 'en',
        },
      };
      console.log('Set these values: ', customization);

      await localforage.setItem('puyosim-gg', customization);
      return true;
    } catch (err) {
      return false;
    }
  }
}
