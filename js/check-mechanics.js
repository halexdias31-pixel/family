#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-mechanics.js MECHANICS AND PC PARTS (548, batch E): written by tools/mech_rows.py; every card has a
   source and a 16x16 drawing; every car attribute is its own field (no combined string but the hidden name). */
/* A part's fits are car cards' engine codes; no catalogue numbers, no number plates. No flags, no port. */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'data', 'mechanics');
const FILES = ['parts', 'models', 'pc'];
const SYSTEMS = ['Engine', 'Fuel', 'Ignition', 'Cooling', 'Lubrication', 'Exhaust', 'Transmission/Clutch', 'Brakes', 'Suspension', 'Steering',
  'Electrical', 'Lighting', 'Body', 'Tyres & wheels', 'HVAC'];
const PC_TYPES = ['CPU', 'Motherboard', 'RAM', 'GPU', 'Storage', 'PSU', 'Case', 'Cooling', 'Cables', 'OS media'];
/* ONE ATTRIBUTE A FIELD (owner, 6 Nov): each car field is one short value, never "Renault Clio III 1.2 16V". */
const CAR_FIELDS = ['make', 'model', 'gen', 'phase', 'market', 'years', 'size', 'valves', 'badge', 'fuel', 'code'];
/* A CATALOGUE NUMBER: seven or more digits run together or spaced, or letters then five or more digits. */
const PARTNO = /\d(?:[ -]?\d){6,}|\b[A-Z]{1,3}\d{5,}\b/;
const PALETTE = /^[.k1-6BDNLYRGWwbrmnucgoetypsfa]{16}$/;
const fail = [], data = {};
FILES.forEach(f => {
  try { data[f] = JSON.parse(fs.readFileSync(path.join(dir, f + '.json'), 'utf8'))[f]; } catch (e) { data[f] = null; }
  if (!Array.isArray(data[f]) || !data[f].length) { console.error('check-mechanics: data/mechanics/' + f + '.json did not load or is empty — NOTHING was checked'); process.exit(1); }
});
const codes = new Set(data.models.map(m => m.code)), ids = new Set();
if (data.parts.length < 60) fail.push('only ' + data.parts.length + ' car parts — the Clio had 68');
['Renault', 'Ford', 'Volkswagen', 'Vauxhall'].forEach(b => { if (!data.models.some(m => m.make === b)) fail.push('no ' + b + ' car card'); });
PC_TYPES.forEach(t => { if (!data.pc.some(p => p.type === t)) fail.push('no PC part of type ' + t); });
FILES.forEach(f => data[f].forEach(r => {
  const at = f + ' ' + (r.id || JSON.stringify(r).slice(0, 40));
  if (!r.id || ids.has(r.id)) fail.push(at + ': no id, or an id used twice');
  ids.add(r.id);
  if (!r.name) fail.push(at + ': no name');
  if (!String(r.source || '').trim()) fail.push(at + ': no source line');
  if (!Array.isArray(r.px) || r.px.length !== 16 || !r.px.every(l => PALETTE.test(l))) fail.push(at + ': px is not 16 rows of 16 palette letters (tools/mech_rows.py)');
  if (r.part_no != null) fail.push(at + ': carries a part number — only plain facts (owner, 6 Nov)');
  if (f === 'parts') {
    if (SYSTEMS.indexOf(r.system) < 0) fail.push(at + ': system "' + r.system + '" is not one of the ' + SYSTEMS.length);
    if (!(r.does && /£\d/.test(r.value || '') && /approximate/.test(r.source))) fail.push(at + ': a part needs what it does, a £ band and a source saying approximate');
    if (!(Array.isArray(r.fits) && r.fits.length && r.fits.every(c => codes.has(c)))) fail.push(at + ': fits must name car cards\' engine codes (' + [...codes].join(', ') + ')');
  }
  if (f === 'models') {
    CAR_FIELDS.forEach(k => { if (r[k] != null && (typeof r[k] !== 'string' || r[k].split(' ').length > 2)) fail.push(at + ': ' + k + ' "' + r[k] + '" is not one attribute'); });
    if (!(r.make && r.model && r.gen && r.code && /\d{4}/.test(r.years || '') && r.size && r.fuel)) fail.push(at + ': a car needs make, model, generation, years, size, fuel and engine code');
  }
  if (f === 'pc' && !(PC_TYPES.indexOf(r.type) >= 0 && r.socket && (r.iface || []).length && (r.links || []).length && r.does))
    fail.push(at + ': a PC part needs a type, socket or form factor, interfaces, what it connects to and what it does');
  const words = JSON.stringify(Object.assign({}, r, { px: [] }));
  const m = words.match(PARTNO);
  if (m) fail.push(at + ': "' + m[0] + '" looks like a part number');
  if (/\b[A-Z]{2}\d{2}\s?[A-Z]{3}\b/.test(words)) fail.push(at + ': something that looks like a number plate');
}));
if (fail.length) {
  fail.forEach(f => console.error('  ' + f));
  console.error('check-mechanics: ' + fail.length + ' fault(s)');
  process.exit(1);
}
console.log('check-mechanics: ' + FILES.map(f => data[f].length + ' ' + f).join(', ') + ' — every card has a source and a drawing, every car attribute its own field, every part fits a car card.');
