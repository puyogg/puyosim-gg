import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { PUYONAME, PUYOTYPE } from '../../solver/constants';

// Flicker value array so that it still shows up when there's frame skipping.
const flicker = [false, false, true, true];

function colorPop(
  sprite: Sprite,
  color: PUYOTYPE,
  t: number,
  stagger: number,
  textures: PIXI.ITextureDictionary,
): boolean {
  const name = PUYONAME[color];

  if (t < 8) {
    // For the first 8 frames, do nothing
    return false;
  }

  if (t < 30) {
    // Flicker every two frames
    sprite.visible = flicker[(t - 8) % 4];
    return false;
  }

  sprite.visible = true;
  if (t < 39) {
    sprite.texture = textures[`${name}_shocked.png`];
    return false;
  }

  // The bursting animation is staggered.
  const burstDelay = stagger * 2;
  const burstDisappear = 39 + 6 + burstDelay;
  if (t < burstDisappear) {
    if (t >= 39 + burstDelay) {
      const t2 = t - (39 + burstDelay);

      // show the big burst the first two frames
      if (t2 < 2) {
        sprite.texture = textures[`${name}_burst_0.png`];
      } else {
        sprite.texture = textures[`${name}_burst_1.png`];
      }
    }
    return false;
  }

  // Final case
  sprite.visible = false;

  // about 6 frames of air time
  if (t < burstDisappear + 6) {
    return false;
  }

  return true;
}

export { colorPop };
