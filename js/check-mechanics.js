#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-mechanics.js MECHANICS (548): each card has a system and a source; car cards name make, model, years; no part
   numbers or plates; each facet one string; named parts are real part cards. No flags, no port. */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'data', 'mechanics');
const FILES = ['parts', 'models', 'fits', 'jobs', 'symptoms'];
const SYSTEMS = ['Engine', 'Fuel', 'Ignition', 'Cooling', 'Lubrication', 'Exhaust', 'Transmission/Clutch', 'Brakes', 'Suspension', 'Steering',
  'Electrical', 'Lighting', 'Body', 'Tyres & wheels', 'HVAC'];
const DIFF = ['Easy', 'Moderate', 'Garage'];
/* A CATALOGUE NUMBER: seven or more digits run together or spaced, or letters then five or more digits. */
const PARTNO = /\d(?:[ -]?\d){6,}|\b[A-Z]{1,3}\d{5,}\b/;
const fail = [], data = {};
FILES.forEach(f => {
  try { data[f] = JSON.parse(fs.readFileSync(path.join(dir, f + '.json'), 'utf8'))[f]; } catch (e) { data[f] = null; }
  if (!Array.isArray(data[f]) || !data[f].length) { console.error('check-mechanics: data/mechanics/' + f + '.json did not load or is empty — NOTHING was checked'); process.exit(1); }
});
const partNames = new Set(data.parts.map(p => p.name)), ids = new Set();
FILES.forEach(f => data[f].forEach(r => {
  const at = f + ' ' + (r.id || JSON.stringify(r).slice(0, 40));
  if (!r.id || ids.has(r.id)) fail.push(at + ': no id, or an id used twice');
  ids.add(r.id);
  if (!r.name) fail.push(at + ': no name');
  if (SYSTEMS.indexOf(r.system) < 0) fail.push(at + ': system "' + r.system + '" is not one of the ' + SYSTEMS.length);
  if (!String(r.source || '').trim()) fail.push(at + ': no source line');
  ['system', 'make', 'model', 'engine', 'difficulty'].forEach(k => {
    if (r[k] != null && typeof r[k] !== 'string') fail.push(at + ': ' + k + ' is not one string');
  });
  if (r.difficulty && DIFF.indexOf(r.difficulty) < 0) fail.push(at + ': difficulty "' + r.difficulty + '" is not Easy, Moderate or Garage');
  if (f === 'parts' && !(r.does && r.signs && r.interval && r.difficulty && r.tools)) fail.push(at + ': a part needs what it does, signs, interval, difficulty and tools');
  if (f === 'models' || f === 'fits' || f === 'jobs') {
    if (!r.make || !r.model || !/\d{4}/.test(r.years || '')) fail.push(at + ': a car card must name make, model and year range');
  }
  if (f === 'models' && !(r.facts || []).length) fail.push(at + ': a model card with no facts');
  if (f === 'jobs' && !((r.steps || []).length && r.time && r.difficulty && r.tools)) fail.push(at + ': a job needs steps, time, difficulty and tools');
  [].concat(r.causes || [], r.parts || []).forEach(p => { if (!partNames.has(p)) fail.push(at + ': names "' + p + '", which is no part card'); });
  const words = JSON.stringify(r);
  const m = words.match(PARTNO);
  if (m) fail.push(at + ': "' + m[0] + '" looks like a part number');
  if (/\b[A-Z]{1,3}\s?\d{2}\s?[A-Z]{3}\b|\b[A-Z]\d{1,3}\s?[A-Z]{3}\b/.test(words)) fail.push(at + ': something that looks like a number plate');
}));
if (fail.length) {
  fail.forEach(f => console.error('  ' + f));
  console.error('check-mechanics: ' + fail.length + ' fault(s)');
  process.exit(1);
}
console.log('check-mechanics: ' + FILES.map(f => data[f].length + ' ' + f).join(', ') + ' — every card has a system and a source, no part numbers.');
