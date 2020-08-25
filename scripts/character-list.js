/* eslint-disable @typescript-eslint/no-var-requires */
const jsonPPE = require('./char_esports.json');
const jsonPPT = require('./char_ppt.json');
const fs = require('fs');

const chars = [];

for (let key in jsonPPE.frames) {
  const data = jsonPPE.frames[key];
  data['textureName'] = key;
  chars.push(data);
}

for (let key in jsonPPT.frames) {
  const data = jsonPPT.frames[key];
  data['textureName'] = key;
  chars.push(data);
}

fs.writeFileSync('character-list.json', JSON.stringify(chars));
