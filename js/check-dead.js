#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-dead.js FUNCTIONS NOTHING CALLS, on both sides of the app. § */
const fs = require('fs');
/* The list is tools/dead.js's, the one the Stability score and the Optimiser read. */
const { deadFunctions, jsF, gsF } = require('../tools/dead.js');
const D=deadFunctions(), say=side=>{ const d=D.filter(x=>x.side===side); console.log(side+': '+(d.length?d.map(x=>x.name+' ('+x.file+')').join(', '):'none')); return d.length; };
const a=say('frontend');
const b=gsF.length?say('backend'):(console.log('backend: no .gs files found beside the project — skipped'),0);

/* AND THE TWO RULES ABOUT HEADINGS, which are not style but structure. § */
const CARD = /<div class="card[^>]*>([\s\S]{0,900}?)<\/div>/g;
const split = [];
jsF.forEach(x => {
  const src = fs.readFileSync(x.p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  let m;
  while ((m = CARD.exec(src))) {
    if (/<h2[ >]/.test(m[1])) {
      split.push(x.f + ':' + src.slice(0, m.index).split('\n').length
        + '  an <h2> inside a card — `split_` cuts there, so the card becomes two pages');
    }
  }
});
console.log('');
console.log('HEADINGS THAT WOULD SPLIT A CARD  (' + split.length + ')');
console.log(split.length ? '  ' + split.join('\n  ') : '  none');

process.exit(a + b + split.length ? 1 : 0);