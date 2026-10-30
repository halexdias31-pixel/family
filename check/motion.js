#!/usr/bin/env node
/* @family. — check/motion.js MOTION IS ONE SYSTEM (531, U12), read not run: durations, curves and moved properties in style.css and js/, counted against check/motion-baseline.json. */
/* A RATCHET: a count may fall, never grow. One that fell is said, so the baseline is lowered with --update and cannot creep back. -v lists every hit. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = path.join(__dirname, 'motion-baseline.json');
const VERBOSE = process.argv.includes('--verbose') || process.env.VERBOSE === '1';

/* THE PROPERTIES A COMPOSITOR MOVES WITHOUT LAYOUT OR PAINT; anything else animated costs a frame (U12). */
const COMPOSITED = new Set(['transform', 'opacity', 'filter', 'translate', 'scale', 'rotate', 'visibility', 'backdrop-filter']);
const EASE_WORD = /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)$/;

const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
const lineOf = i => css.slice(0, i).split('\n').length;
const hits = { durations: new Map(), easings: new Map(), moved: [], all: [], frames: [], jsDurations: [], jsReduce: [] };
const note = (m, k, where) => { if (!m.has(k)) m.set(k, []); m.get(k).push(where); };
const ms = s => (/ms$/.test(s) ? parseFloat(s) : parseFloat(s) * 1000);

/* EVERY transition/animation DECLARATION outside :root, split into its comma parts. */
const rootEnd = css.indexOf('}', css.indexOf(':root'));
const DECL = /(?:^|[;{\s])((?:transition|animation)(?:-duration|-timing-function|-property|-delay)?)\s*:\s*([^;{}]+)/g;
for (let m; (m = DECL.exec(css));) {
  if (m.index < rootEnd) continue;
  const prop = m[1], val = m[2].replace(/!important/, '').trim(), where = 'style.css:' + lineOf(m.index);
  const parts = val.replace(/\([^)]*\)/g, x => x.replace(/,/g, '\u0001')).split(',').map(p => p.replace(/\u0001/g, ',').trim());
  parts.forEach(p => {
    const bare = p.replace(/var\([^)]*\)/g, ' ');
    (bare.match(/(?:^|\s)(\d*\.?\d+m?s)(?=\s|$)/g) || []).map(x => x.trim()).filter(x => ms(x) > 0)
      .forEach(x => note(hits.durations, ms(x) + 'ms', where));
    (bare.match(/cubic-bezier\([^)]*\)|steps\([^)]*\)|linear\([^)]*\)|\b(?:ease-in-out|ease-in|ease-out|ease|linear|step-start|step-end)\b/g) || [])
      .forEach(x => note(hits.easings, x.replace(/\s+/g, ''), where));
    if (/^transition(-property)?$/.test(prop)) {
      const first = bare.trim().split(/\s+/)[0];
      if (first === 'all') hits.all.push(where);
      else if (/^[a-z-]+$/.test(first) && !/^(none|initial|inherit|unset)$/.test(first) && !EASE_WORD.test(first) && !COMPOSITED.has(first))
        hits.moved.push(where + ' ' + first);
    }
  });
}
/* KEYFRAMES THAT MOVE A PROPERTY THE COMPOSITOR CANNOT. */
const KF = /@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g;
for (let m; (m = KF.exec(css));) {
  const props = new Set((m[2].match(/[{;]\s*([a-z-]+)\s*:/g) || []).map(x => x.replace(/[{;:\s]/g, '')));
  const slow = [...props].filter(p => !COMPOSITED.has(p) && !/^--/.test(p) && p !== 'offset');
  if (slow.length) hits.frames.push('style.css:' + lineOf(m.index) + ' @keyframes ' + m[1] + ' (' + slow.join(', ') + ')');
}

/* THE SCRIPTS: a duration written into a transition or an animate() call, and every reduced-motion question not asked through motionOK_. */
const jsDir = path.join(ROOT, 'js');
fs.readdirSync(jsDir).filter(f => /\.js$/.test(f) && !/^check/.test(f)).forEach(f => {
  const src = fs.readFileSync(path.join(jsDir, f), 'utf8');
  src.split('\n').forEach((l, i) => {
    const where = 'js/' + f + ':' + (i + 1);
    if (/^\s*(\/\/|\/?\*)/.test(l)) return;
    if (/transition\s*[=:(]|\.animate\(/.test(l) && /['"`][^'"`]*\b\d*\.?\d+m?s\b/.test(l)) hits.jsDurations.push(where);
    else if (/\.animate\(/.test(l) && /duration\s*:\s*\d/.test(l)) hits.jsDurations.push(where);
    if (/prefers-reduced-motion/.test(l) && !/function motionOK_/.test(src.split('\n')[i - 1] || '')) hits.jsReduce.push(where);
  });
});

const counts = {
  durations: hits.durations.size,            /* distinct duration literals in the stylesheet */
  easings: hits.easings.size,                /* distinct timing functions written out */
  /* AND EVERY USE: a new rule reusing an old literal grows these, so moving onto the tokens is seen and a new literal use fails. */
  durationUses: [...hits.durations.values()].reduce((a, w) => a + w.length, 0),
  easingUses: [...hits.easings.values()].reduce((a, w) => a + w.length, 0),
  moved: hits.moved.length,                  /* transitions of a property the compositor cannot move */
  transitionAll: hits.all.length,            /* `transition: all` */
  keyframes: hits.frames.length,             /* keyframes moving a non-composited property */
  jsDurations: hits.jsDurations.length,      /* a script writing its own duration */
  jsReduce: hits.jsReduce.length,            /* reduced motion asked outside motionOK_ */
};
const SAY = { durations: 'distinct duration literals', easings: 'distinct curves written out',
  durationUses: 'duration literals written', easingUses: 'curves written out', moved: 'transitions of a non-composited property',
  transitionAll: '`transition: all`', keyframes: 'keyframes moving a non-composited property', jsDurations: 'scripts writing their own duration',
  jsReduce: 'reduced-motion questions outside motionOK_' };

if (process.argv.includes('--update')) {
  fs.writeFileSync(BASE, JSON.stringify(counts, null, 2) + '\n');
  console.log('motion: baseline written — ' + JSON.stringify(counts));
  process.exit(0);
}
let base = null;
try { base = JSON.parse(fs.readFileSync(BASE, 'utf8')); } catch (e) {}
if (!base) { console.error('motion: no check/motion-baseline.json — run `node check/motion.js --update` once'); process.exit(2); }
if (!counts.durations && !counts.easings) { console.error('motion: no transition or animation read in style.css — the parse cannot see its subject'); process.exit(2); }

if (VERBOSE) {
  [...hits.durations].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])).forEach(([k, w]) => console.log(`  duration ${k}: ${w.length}× (${w.slice(0, 3).join(', ')})`));
  [...hits.easings].forEach(([k, w]) => console.log(`  curve ${k}: ${w.length}× (${w.slice(0, 3).join(', ')})`));
  hits.moved.concat(hits.all, hits.frames, hits.jsDurations, hits.jsReduce.map(x => x + ' reduced motion')).forEach(x => console.log('  ' + x));
}
const grew = Object.keys(counts).filter(k => counts[k] > (base[k] || 0));
const fell = Object.keys(counts).filter(k => counts[k] < (base[k] || 0));
if (grew.length) {
  console.error('motion: ' + grew.length + ' count(s) grew — use the tokens (--dur-*, --ease-*, MOTION_, motionOK_) instead');
  grew.forEach(k => console.error(`  ! ${SAY[k]}: ${counts[k]}, was ${base[k] || 0}`));
  process.exit(1);
}
if (fell.length) console.log('motion: fell, lower the baseline with --update — ' + fell.map(k => `${SAY[k]} ${base[k]} -> ${counts[k]}`).join('; '));
console.log('motion: no count grew — ' + Object.keys(counts).map(k => k + ' ' + counts[k]).join(', '));
