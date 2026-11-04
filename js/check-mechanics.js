#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-mechanics.js MECHANICS (548, 740): each card has a system and a source; one car, the Clio; no part
   numbers but a part's labelled example; a part's engines are car cards'; no pictures. No flags, no port. */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'data', 'mechanics');
const FILES = ['parts', 'models'];
/* TWO DATABASES (650): parts and cars. ONE CAR (740): the owner's Renault Clio, a car card per engine. */
const ENGINES = new Set();
const SYSTEMS = ['Engine', 'Fuel', 'Ignition', 'Cooling', 'Lubrication', 'Exhaust', 'Transmission/Clutch', 'Brakes', 'Suspension', 'Steering',
  'Electrical', 'Lighting', 'Body', 'Tyres & wheels', 'HVAC'];
/* A PART'S EXAMPLE NUMBER IS THE SITE'S OWN FORMAT (570), never a maker's: EX-<system>-<nnn>. */
const EXAMPLE_NO = /^EX-[A-Z]{3}-\d{3}$/;
/* A CATALOGUE NUMBER: seven or more digits run together or spaced, or letters then five or more digits. */
const PARTNO = /\d(?:[ -]?\d){6,}|\b[A-Z]{1,3}\d{5,}\b/;
const fail = [], data = {};
FILES.forEach(f => {
  try { data[f] = JSON.parse(fs.readFileSync(path.join(dir, f + '.json'), 'utf8'))[f]; } catch (e) { data[f] = null; }
  if (!Array.isArray(data[f]) || !data[f].length) { console.error('check-mechanics: data/mechanics/' + f + '.json did not load or is empty — NOTHING was checked'); process.exit(1); }
});
const partNames = new Set(data.parts.map(p => p.name)), ids = new Set();
data.models.forEach(m => ENGINES.add(m.engine));
if (fs.existsSync(path.join(dir, 'fits.json'))) fail.push('data/mechanics/fits.json is back — parts lists went in 650; a part says its cars');
/* NO PICTURES (740): the owner's "doesn't even need pictures anymore". */
if (fs.existsSync(path.join(dir, 'pixels.json'))) fail.push('data/mechanics/pixels.json is back — the pictures went in 740');
FILES.forEach(f => data[f].forEach(r => {
  const at = f + ' ' + (r.id || JSON.stringify(r).slice(0, 40));
  if (!r.id || ids.has(r.id)) fail.push(at + ': no id, or an id used twice');
  ids.add(r.id);
  if (!r.name) fail.push(at + ': no name');
  if (SYSTEMS.indexOf(r.system) < 0) fail.push(at + ': system "' + r.system + '" is not one of the ' + SYSTEMS.length);
  if (!String(r.source || '').trim()) fail.push(at + ': no source line');
  ['system', 'make', 'model', 'engine'].forEach(k => {
    if (r[k] != null && typeof r[k] !== 'string') fail.push(at + ': ' + k + ' is not one string');
  });
  if (f === 'parts' && !(r.does && EXAMPLE_NO.test(r.part_no || '') && /£\d/.test(r.value || '') && /example/.test(r.source) && /approximate/.test(r.source)))
    fail.push(at + ': a part needs what it is, an example number EX-XXX-nnn, a £ value, and a source saying example and approximate');
  if (['steps', 'causes', 'signs', 'check'].some(k => r[k] != null)) fail.push(at + ': carries jobs-and-symptoms teaching, which went in 570');
  if (f === 'parts' && !(Array.isArray(r.engines) && r.engines.length && r.engines.every(e => ENGINES.has(e)) && r.fits))
    fail.push(at + ': engines must name car cards\' engines (' + [...ENGINES].join(', ') + ') and come with a fits line');
  if (f === 'models' && !(r.make === 'Renault' && /^Clio/.test(r.model || '') && /\d{4}/.test(r.years || '') && r.engine))
    fail.push(at + ': a car card is the Renault Clio (740), with model, year range and engine');
  if (['cars', 'facts', 'image', 'picture'].some(k => r[k] != null)) fail.push(at + ': carries `cars`, `facts` or a picture, which went in 740 — cards are minimal');
  if (f === 'jobs' && !((r.steps || []).length && r.time && r.difficulty && r.tools)) fail.push(at + ': a job needs steps, time, difficulty and tools');
  [].concat(r.causes || [], r.parts || []).forEach(p => { if (!partNames.has(p)) fail.push(at + ': names "' + p + '", which is no part card'); });
  const words = JSON.stringify(Object.assign({}, r, { part_no: '' }));
  const m = words.match(PARTNO);
  if (m) fail.push(at + ': "' + m[0] + '" looks like a part number');
  if (/\b[A-Z]{1,3}\s?\d{2}\s?[A-Z]{3}\b|\b[A-Z]\d{1,3}\s?[A-Z]{3}\b/.test(words)) fail.push(at + ': something that looks like a number plate');
}));
if (fail.length) {
  fail.forEach(f => console.error('  ' + f));
  console.error('check-mechanics: ' + fail.length + ' fault(s)');
  process.exit(1);
}
console.log('check-mechanics: ' + FILES.map(f => data[f].length + ' ' + f).join(', ') + ' — every card has a system and a source, part numbers only as labelled examples; every part fits a Clio engine.');
