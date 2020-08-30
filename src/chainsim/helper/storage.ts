import { HSBData } from '../state';
import localforage from 'localforage';

/** Visual customization settings */
interface StoredAesthetic {
  charID: number;
  skinID: number;
  hsbData: HSBData;
  frameOrientation: 'p1' | 'p1reversed' | 'p2' | 'p2reversed';
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

interface StoredColorSet {
  order: number[];
  setSize: 3 | 4 | 5;
}

interface StoredGameSettings {
  gameSpeed: number;
  softDropSpeed: number;
  delayAutoShift: number;
  autoRepeatRate: number;
}

interface storedSimulatorSettings {
  language: 'en';
}

/** Settings that can get saved to localStage. */
export interface StoredCustomization {
  aesthetic: StoredAesthetic;
  keybinds: StoredKeyBinds;
  colorSet: StoredColorSet;
  gameSettings: StoredGameSettings;
  simulatorSettings: storedSimulatorSettings;
}

export async function loadCustomization(): Promise<StoredCustomization | undefined> {
  try {
    const loadedData = await localforage.getItem('puyosim-gg');
    if (loadedData) {
      const customization = loadedData as StoredCustomization;
      return customization;
    }
    return undefined;
  } catch (err) {
    console.log('Error', err);
    return undefined;
  }
}

// export async function saveCustomization(): Promise<void> {
//   try {
//     const customization: StoredCustomization = {

//     };
//     console.log(customization);
//   } catch (err) {
//     console.log('Error', err);
//   }
// }
