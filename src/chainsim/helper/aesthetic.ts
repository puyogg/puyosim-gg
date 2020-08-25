import * as PIXI from 'pixi.js';
import charList from './character-list.json';
import puyoList from './puyo-list.json';

export function parseCharID(id: number): string {
  return charList[id].field;
}

export function parseSkinID(id: number): string {
  return puyoList[id].textureName;
}

export function makeHSBFilter(h: number, s: number, b: number): PIXI.Filter {
  const colorMatrix = new PIXI.filters.ColorMatrixFilter();
  colorMatrix.hue(h, true);
  colorMatrix.saturate(s, true);
  colorMatrix.brightness(b, true);
  return colorMatrix;
}
