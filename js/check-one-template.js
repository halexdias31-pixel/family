#!/usr/bin/env node
/* @family. — check-one-template.js ONE TEMPLATE (owner, 11 Nov): only findCard writes `class="card`; every other maker hands card_ a plain div, the booking form too (owner, 12 Nov). */
/* The reading is tools/one-template.js, the one the Optimiser scores (`one-template`). */
const { seen, bad } = require('../tools/one-template.js').oneTemplate();
if (bad.length) {
  console.error('one template: ' + bad.length + ' card(s) built outside findCard/card_');
  bad.slice(0, 60).forEach(b => console.error('  ' + b));
  process.exit(1);
}
console.log('one template: ' + seen + ' served files, every card through findCard (card_), no exception');
