import { PuyoField, NumField, BoolField } from '../solver/field';
import { PUYOTYPE, DEFAULT_SETTINGS } from '../solver/constants';
import { ChainSolver } from '../solver';

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

type LoadableSlideData = PUYOTYPE[] | PuyoField | FieldData | FieldData[] | undefined;

// Type Guards
function isPuyoArray(array: PUYOTYPE[] | FieldData[]): array is PUYOTYPE[] {
  return typeof array[0] === 'number';
}

class AppState {
  // Overall state
  public mode: 'editor' | 'game';

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

  constructor(x?: LoadableSlideData) {
    this.mode = 'editor'; // Need to include option to load straight into game mode.

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
    console.log(this.slides);
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

  public addSlide(fieldData?: FieldData): void {
    let newSlide: FieldData;

    if (fieldData) {
      // Create a copy of the passed in field data if it was defined.
      newSlide = {
        puyo: new PuyoField(this.simSettings.rows, this.simSettings.cols, fieldData.puyo.data),
        shadow: new PuyoField(this.simSettings.rows, this.simSettings.cols, fieldData.shadow.data),
        arrow: new NumField(this.simSettings.rows, this.simSettings.cols, fieldData.arrow.data),
        cursor: new BoolField(this.simSettings.rows, this.simSettings.cols, fieldData.cursor.data),
        number: new NumField(this.simSettings.rows, this.simSettings.cols, fieldData.number.data),
      };
    } else {
      // Otherwise, append an empty slide
      newSlide = {
        puyo: new PuyoField(this.simSettings.rows, this.simSettings.cols),
        shadow: new PuyoField(this.simSettings.rows, this.simSettings.cols),
        arrow: new NumField(this.simSettings.rows, this.simSettings.cols),
        cursor: new BoolField(this.simSettings.rows, this.simSettings.cols),
        number: new NumField(this.simSettings.rows, this.simSettings.cols),
      };
    }

    this.slides.push(newSlide);
  }

  public get latestFields(): FieldData {
    return this.slides[this.slides.length - 1];
  }
}

export { AppState, LoadableSlideData };
