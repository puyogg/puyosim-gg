/* eslint-disable @typescript-eslint/no-var-requires */
const puyoObj = require('./puyotrim.json');
const fs = require('fs');

const puyos = [];

for (let key in puyoObj.frames) {
  const data = puyoObj.frames[key];
  data['textureName'] = key;
  puyos.push(data);
}

fs.writeFileSync('puyo-list.json', JSON.stringify(puyos).replace(/_trim/g, ''));
