/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
// Generate the spritesheet for Puyo Puyo Tetris characters

// Column position: 12 + col * 188
// Row position: 12 +  row * 148
// Icon width: 168
// Icon height: 128

const frames = {};

const ppt = [
  'rng',
  'ris',
  'shz',
  't_o',
  't_t',
  'mag',
  'ami',
  't_fel',
  'ti_i',
  't_s',
  'klu',
  'sig',
  'dra',
  't_z',
  't_jl',
  'arl',
  'suk',
  't_sat',
  't_rul',
  't_raf',
  'wch',
  't_eco',
  't_mst',
  'lem',
];

for (let r = 0; r < 6; r++) {
  for (let c = 0; c < 4; c++) {
    const i = r * 4 + c;
    const name = `ppt_icon_${ppt[i]}`;
    const data = {
      field: `field_ppt_${ppt[i]}.png`,
      frame: { x: 12 + c * 188, y: 12 + r * 148, w: 168, h: 128 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 168, h: 128 },
      sourceSize: { w: 168, h: 128 },
      pivot: { x: 0.5, y: 0.5 },
    };

    frames[name] = data;
  }
}

const meta = {
  app: 'http://www.puyonexus.com',
  version: '1.0',
  image: '/sim_assets/img/char_ppt.png',
  format: 'RGBA8888',
  size: { w: 1024, h: 1066 },
  scale: '1',
};

const output = {
  frames: frames,
  meta: meta,
};

fs.writeFileSync('char_ppt.json', JSON.stringify(output));
