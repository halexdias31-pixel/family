#!/usr/bin/env node
/* @family. — check-tiers.js THE TWO TIERS (860): data/settings/tiers.json names every screen, widget, file and check, and the code guards and loads what it calls secondary as it says. */
'use strict';
require('../check/quiet');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const bad = [];
let T;
try { T = JSON.parse(read('data/settings/tiers.json')); }
catch (e) { console.log('FAILED — data/settings/tiers.json cannot be read: ' + e.message + ', so NOTHING was checked'); process.exit(1); }
const TIERS = ['core', 'secondary', 'off'];
const list = (re, s) => { const m = re.exec(s); return m ? [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : null; };
const html = read('index.html');
const FILES = list(/window\.FILES\s*=\s*\[([\s\S]*?)\]/, html), LATER = list(/window\.LATER\s*=\s*\[([\s\S]*?)\]/, html);
if (!FILES || !LATER) { console.log('FAILED — cannot read window.FILES / window.LATER out of index.html, so NOTHING was checked'); process.exit(1); }

/* ONE NAME, ONE TIER: each section lists exactly what the code has, nothing stale, nothing missing. */
const same = (what, have, want) => {
  const sec = T[what] || {};
  Object.keys(sec).forEach(k => { if (TIERS.indexOf(sec[k]) === -1) bad.push(what + ' ' + k + ' is "' + sec[k] + '", not core, secondary or off'); });
  want.filter(k => !(k in sec)).forEach(k => bad.push(what + ': ' + k + ' has no tier in data/settings/tiers.json'));
  if (have !== false) Object.keys(sec).filter(k => want.indexOf(k) === -1).forEach(k => bad.push(what + ': ' + k + ' is in tiers.json and not in the code'));
};
same('screens', true, JSON.parse(read('data/settings/columns.json')).map(r => r.screen));
const map = read('js/map.js');
same('widgets', true, [...map.matchAll(/\{ id: '([^']+)', kind: '([^']+)'/g)].map(m => m[1]));
same('files', true, FILES);
const SUITE = [...read('js/check-all.js').matchAll(/\{ file: '([^']+)'/g)].map(m => m[1]);
same('checks', true, SUITE);
same('kinds', false, []);
const secOf = what => Object.keys(T[what] || {}).filter(k => T[what][k] === 'secondary');
const coreOf = what => Object.keys(T[what] || {}).filter(k => T[what][k] === 'core');
['stuff'].forEach(s => { if ((T.screens || {})[s] !== 'core') bad.push('Find\'s screen ' + s + ' is not core'); });
['find', 'shell', 'keypad'].flatMap(b => require('../tools/piece-src.js').pieceFiles(b)).map(f => f.slice(3, -3)).concat(['data', 'boot', 'library', 'answers']).forEach(f => { if ((T.files || {})[f] !== 'core') bad.push('js/' + f + '.js is not core, and Find cannot run without it'); });

/* THE BROWSER'S COPY: shell.js's core lists are this file's. */
const shell = require('../tools/piece-src.js').pieceSrc('shell', ROOT);
const eq = (a, b) => a.slice().sort().join() === b.slice().sort().join();
const cw = list(/const TIER_CORE_WIDGETS = \[([^\]]*)\]/, shell), ck = list(/const TIER_CORE_KINDS = \[([^\]]*)\]/, shell);
if (!cw || !eq(cw, coreOf('widgets'))) bad.push('shell.js TIER_CORE_WIDGETS is [' + cw + '], tiers.json says [' + coreOf('widgets') + ']');
if (!ck || !eq(ck, coreOf('kinds'))) bad.push('shell.js TIER_CORE_KINDS is [' + ck + '], tiers.json says [' + coreOf('kinds') + ']');
if (T.kindDefault !== 'secondary') bad.push('kindDefault must be secondary: a kind nobody named is guarded');

/* THE GUARDS ARE WHERE EVERY CALLER PASSES. */
const end = map.indexOf('\n];', map.indexOf('const WIDGETS = ['));
if (end === -1 || !/^\s*(\/\*[^\n]*\*\/\s*)?tierGuardWidgets_\(WIDGETS\);/.test(map.slice(end + 3))) bad.push('map.js does not call tierGuardWidgets_(WIDGETS) straight after the WIDGETS array');
if (!/tierCore_\('kind', x\.kind\) \? card\(x, credits\) : tierRun_\(/.test(require('../tools/find-src.js').findSrc())) bad.push('find.js stuffCard does not run a secondary kind\'s card through tierRun_');

/* SECONDARY CODE IS LATER (670), never before the first paint, unless eagerSecondary gives the reason. */
const eager = T.eagerSecondary || {};
secOf('files').filter(f => LATER.indexOf(f) === -1 && !eager[f]).forEach(f => bad.push('js/' + f + '.js is secondary and loads before the first paint: put it in LATER or give eagerSecondary its reason'));
Object.keys(eager).forEach(f => {
  if ((T.files || {})[f] !== 'secondary') bad.push('eagerSecondary ' + f + ' is not a secondary file');
  else if (LATER.indexOf(f) !== -1) bad.push('eagerSecondary ' + f + ' is in LATER already: take it off the list');
  if (String(eager[f] || '').length < 20) bad.push('eagerSecondary ' + f + ' has no written reason');
});
/* OFF (860): never fetched, still declared, and the code is what tiers.json says (tools/tiers.js --check). */
const OFF = list(/window\.OFF\s*=\s*\[([^\]]*)\]/, html) || [];
Object.keys(T.files || {}).filter(f => T.files[f] === 'off').forEach(f => {
  if (OFF.indexOf(f) === -1) bad.push('js/' + f + '.js is off and not in window.OFF');
  if (LATER.indexOf(f) !== -1) bad.push('js/' + f + '.js is off and still in LATER');
  if (!fs.existsSync(path.join(ROOT, 'js', f + '.js'))) bad.push('js/' + f + '.js is off and gone: off keeps the code');
});
try { require('child_process').execFileSync(process.execPath, [path.join(ROOT, 'tools', 'tiers.js'), '--check'], { encoding: 'utf8' }); }
catch (e) { bad.push(String(e.stdout || e.message).trim()); }
/* A RATCHET: the eager secondary files may only get fewer. */
const EAGER_SECONDARY_MAX = 4;
if (Object.keys(eager).length > EAGER_SECONDARY_MAX) bad.push(Object.keys(eager).length + ' eager secondary files, more than ' + EAGER_SECONDARY_MAX);

/* AND THE JOURNEYS' SPLIT COMPILES, and leaves the core ones that prove Find. */
const J = T.journeys || {};
let core = null, sec = null;
try { core = new RegExp(J.core, 'i'); sec = new RegExp(J.secondary, 'i'); } catch (e) { bad.push('journeys: ' + e.message); }
if (core && sec) ['the app loads and draws without throwing'].forEach(n => { if (!core.test(n) || sec.test(n)) bad.push('journey "' + n + '" would not be core'); });

const count = what => coreOf(what).length + ' core, ' + secOf(what).length + ' secondary, ' + Object.keys(T[what] || {}).filter(k => T[what][k] === 'off').length + ' off';
if (process.env.VERBOSE === '1' || process.argv.includes('-v')) ['screens', 'widgets', 'kinds', 'files', 'checks'].forEach(k => console.log('   ' + k.padEnd(8) + count(k)));
if (bad.length) { bad.forEach(b => console.log('FAIL — ' + b)); process.exit(1); }
console.log('OK — tiers: checks ' + count('checks') + '; screens ' + count('screens') + '; widgets ' + count('widgets') + '; every secondary widget and kind guarded, secondary files LATER but ' + Object.keys(eager).length);
