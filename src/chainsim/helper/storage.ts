import { HSBData } from '../state';

/** Visual customization settings */
interface StoredAesthetic {
  charID: number;
  skinID: number;
  hsbData: HSBData;
}

/** Settings that can get saved to localStage. */
export interface StoredState {}
