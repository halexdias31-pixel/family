#!/usr/bin/env node
/* @family. — tools/one-price.js THE ONE-PRICE CHECK (rule 1.75, owner 21 Nov: one open tutor rate).
   A parent would notice a waitlist seat priced on one rate and a No preference booking on another, so every price sum lives once,
   in js/core-price.js (`priceFrom`, copied whole into backend/cards-gen.gs as `priceCore_`), and the open rate is config `open_tutor_rate`.
   Outside core-price.js, js/ or backend/ reading a price row by hand (cfg.open_tutor_rate, cfg.waitlist_extra_seat), typing an
   open-rate constant, or adding a room to a tutor's rate fails the build; inside it, a hand rate constant or literal fallback fails too.
   tools/build.js runs it. */
'use strict';
const { text, srcFiles, report, main, bare } = require('./lib/gen.js');
const HOME = 'js/core-price.js';
const OUTSIDE = [
  [/\b(?:OPEN_RATE|open_?rate|open_tutor_rate)\s*=\s*\d/i, 'types an open rate by hand (config open_tutor_rate, read in ' + HOME + ')'],
  [/\bcfg\s*\.\s*(?:open_tutor_rate|waitlist_extra_seat)\b|\bcfg\s*\[\s*['"](?:open_tutor_rate|waitlist_extra_seat)['"]\s*\]/,
    'reads a price row by hand (price it with priceCore_(...).priceFrom, ' + HOME + ')'],
  [/\b(?:room|venue\w*)\s*\+\s*(?:tutor|open)\w*\b/i, 'adds a room to a tutor rate by hand, a second price formula (take priceFrom from ' + HOME + ')'],
];
const INSIDE = [
  [/\b(?:const|let|var)\s+[A-Z_]*RATE[A-Z_]*\s*=\s*\d/, 'keeps a hand rate constant (the open rate is config open_tutor_rate)'],
  [/\bOPEN_RATE\b/, 'names OPEN_RATE (the open rate is config open_tutor_rate)'],
  [/tutorRate\s*>\s*0\s*\?\s*tutorRate\s*:\s*\d/, 'falls back to a hand rate literal for the charge rate'],
];

function run() {
  const bad = [];
  const files = srcFiles(['js', 'backend'], /\.(js|gs)$/).filter(f => f !== HOME && !/-gen\.gs$/.test(f));
  files.forEach(f => {
    const src = bare(text(f), { comments: 'js' });
    OUTSIDE.forEach(([re, say]) => { if (re.test(src)) bad.push(f + ' ' + say); });
  });
  const home = bare(text(HOME), { comments: 'js' });
  INSIDE.forEach(([re, say]) => { if (re.test(home)) bad.push(HOME + ' ' + say); });
  if (!/cvD\(\s*'open_tutor_rate'/.test(home)) bad.push(HOME + ' does not read the open rate from config open_tutor_rate');
  console.log('one-price: ' + files.length + ' js/backend files; one price formula and one open rate (config open_tutor_rate) in ' + HOME);
  report('one-price', bad);
}
module.exports = { run };
main(module, run);
