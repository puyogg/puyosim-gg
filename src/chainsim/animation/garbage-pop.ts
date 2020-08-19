import { Sprite } from 'pixi.js';
import { PUYONAME, PUYOTYPE } from '../../solver/constants';

// Flicker value array so that it still shows up when there's frame skipping.
const flicker = [true, true, false, false];

function garbagePop(
  sprite: Sprite,
  color: PUYOTYPE,
  adjValue: number,
  t: number,
  textures: PIXI.ITextureDictionary,
): boolean {
  const name = PUYONAME[color];

  if (t < 8) {
    return false;
  }

  if (t < 30) {
    sprite.visible = flicker[(t - 8) % 4];
    return false;
  }

  sprite.visible = true;
  if (t < 39) {
    return false;
  }

  if (color === PUYOTYPE.HARD && adjValue === 1) {
    sprite.texture = textures['garbage_0.png'];
  } else {
    sprite.visible = false;
  }

  return true;
}

export { garbagePop };
