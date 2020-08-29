import { HSBData } from '../state';

/** Visual customization settings */
interface StoredAesthetic {
  charID: number;
  skinID: number;
  hsbData: HSBData;
}

interface StoredKeyBinds {
  left: string;
  right: string;
  down: string;
  rotL: string;
  rotR: string;
  undo: string;
  redo: string;
  reset: string;
}

type StoredColorOrder = number[];

/** Settings that can get saved to localStage. */
export interface StoredState {
  aesthetic: StoredAesthetic;
  keybinds: StoredKeyBinds;
}
