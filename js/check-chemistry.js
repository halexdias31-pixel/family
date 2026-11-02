#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-chemistry.js CHEMISTRY (550): elements 1–118 once each; every card has an id, a name and a
   source; substances and reactions carry their fields; every substance a reaction names is a card. No flags, no port. */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'data', 'chemistry');
const FILES = ['elements', 'substances', 'reactions'];
const CATS = ['Alkali metal', 'Alkaline earth metal', 'Transition metal', 'Lanthanide', 'Actinide', 'Post-transition metal', 'Metalloid',
  'Non-metal', 'Halogen', 'Noble gas'];
const STATES = ['Solid', 'Liquid', 'Gas', 'Aqueous solution', 'Unknown'];
const fail = [], data = {};
FILES.forEach(f => {
  try { data[f] = JSON.parse(fs.readFileSync(path.join(dir, f + '.json'), 'utf8'))[f]; } catch (e) { data[f] = null; }
  if (!Array.isArray(data[f]) || !data[f].length) { console.error('check-chemistry: data/chemistry/' + f + '.json did not load or is empty — NOTHING was checked'); process.exit(1); }
});
const ids = new Set(), names = new Set();
FILES.forEach(f => data[f].forEach(r => {
  const at = f + ' ' + (r.id || JSON.stringify(r).slice(0, 40));
  if (!r.id || ids.has(r.id)) fail.push(at + ': no id, or an id used twice');
  ids.add(r.id);
  if (!r.name) fail.push(at + ': no name');
  if (f !== 'reactions' && names.has(r.name)) fail.push(at + ': the name "' + r.name + '" is on two cards, so a reaction could not say which');
  if (f !== 'reactions') names.add(r.name);
  if (!String(r.source || '').trim()) fail.push(at + ': no source line');
  if (r.state != null && STATES.indexOf(r.state) < 0) fail.push(at + ': state "' + r.state + '" is not one of ' + STATES.join(', '));
  ['category', 'type', 'group', 'period', 'state'].forEach(k => {
    if (r[k] != null && typeof r[k] !== 'string') fail.push(at + ': ' + k + ' is not one string');
  });
}));
const nums = data.elements.map(e => e.number);
if (data.elements.length !== 118) fail.push('elements: ' + data.elements.length + ' cards, wanted 118');
for (let z = 1; z <= 118; z++) if (nums.filter(n => n === z).length !== 1) fail.push('elements: atomic number ' + z + ' appears ' + nums.filter(n => n === z).length + ' times');
nums.forEach(n => { if (!(Number.isInteger(n) && n >= 1 && n <= 118)) fail.push('elements: atomic number ' + JSON.stringify(n) + ' is not a whole number 1–118'); });
data.elements.forEach(e => {
  const at = 'elements ' + e.id;
  if (!(e.symbol && /^[A-Z][a-z]?$/.test(e.symbol) && e.mass && e.period && e.block && e.config && e.discovered)) fail.push(at + ': an element needs symbol, mass, period, block, configuration and year discovered');
  if (CATS.indexOf(e.category) < 0) fail.push(at + ': category "' + e.category + '" is not one of the ' + CATS.length);
});
if (new Set(data.elements.map(e => e.symbol)).size !== data.elements.length) fail.push('elements: a symbol is used twice');
data.substances.forEach(s => {
  if (!(s.formula && s.type && s.state && s.use && s.hazard)) fail.push('substances ' + s.id + ': a substance needs formula, type, state, use and hazard');
});
data.reactions.forEach(r => {
  const at = 'reactions ' + r.id;
  if (!(r.pattern && r.type && r.conditions && r.observations && (r.examples || []).length)) fail.push(at + ': a reaction needs pattern, type, conditions, observations and examples');
  (r.examples || []).forEach(x => (x.substances || []).forEach(n => { if (!names.has(n)) fail.push(at + ': names "' + n + '", which is no element or substance card'); }));
  (r.examples || []).forEach(x => { if (!(x.substances || []).length) fail.push(at + ': an example names no substance'); });
});
if (fail.length) {
  fail.forEach(f => console.error('  ' + f));
  console.error('check-chemistry: ' + fail.length + ' fault(s)');
  process.exit(1);
}
console.log('check-chemistry: ' + FILES.map(f => data[f].length + ' ' + f).join(', ') + ' — elements 1–118 once each, every reaction names real cards, every card sourced.');
