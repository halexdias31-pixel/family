#!/usr/bin/env node
/* @family. — check/motion.js MOTION IS ONE SYSTEM (531, 537; U12), read not run: every duration and curve in style.css and js/ is a token or a named exception, only the compositor moves things, and less motion is asked one way. */
/* HARD: a duration or curve written out (not ACCEPTED), a layout property transitioned or keyframed, `transition: all`, */
/* reduced motion asked outside shell.js, a script writing its own duration or curve, and an ACCEPTED entry that matches nothing. */
/* A RATCHET as well, against check/motion-baseline.json: the counts may fall, never grow; one that fell is said and lowered with --update. -v lists every hit; MOTION_CSS/MOTION_JS read a copy. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = path.join(__dirname, 'motion-baseline.json');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v') || process.env.VERBOSE === '1';
const CSS_FILE = process.env.MOTION_CSS || path.join(ROOT, 'style.css');
const JS_DIR = process.env.MOTION_JS || path.join(ROOT, 'js');

/* THE PROPERTIES A COMPOSITOR MOVES WITHOUT LAYOUT OR PAINT. */
const COMPOSITED = new Set(['transform', 'opacity', 'filter', 'translate', 'scale', 'rotate', 'visibility', 'backdrop-filter', 'clip-path']);
/* REPAINTED BUT NEVER LAID OUT: a release fading its wash back is allowed this (package E's press look), and counted. */
const PAINTED = new Set(['color', 'background', 'background-color', 'border-color', 'box-shadow', 'outline-color', 'fill', 'stroke',
  'text-decoration-color', 'caret-color', 'border-top-color', 'border-bottom-color', 'border-left-color', 'border-right-color']);
const EASE_WORD = /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)$/;

/* THE NAMED EXCEPTIONS, each with its reason. `css` is matched against the rule's selector (inside its @media/@keyframes);
   `js` is a file and a pattern on the line. Everything else is a token: --dur-*, --ease-*, MOTION_. */
const ACCEPTED = [
  { css: /^\.screen$/, why: 'the slide between columns (527) owns its own spring and timing' },
  { css: /^\.btn\.is-busy::before$|^\.tile\.is-busy::before$/, why: 'the busy ring is a loop, one turn in .7 s, not a movement from here to there' },
  { css: /^\.loading > span/, why: 'the three dots are a loop; their rhythm is the loader (306), not a movement' },
  { css: /^\.mc-caret$/, why: 'a caret blinks in steps(1); the keypad\'s and the calculator\'s are the system caret\'s rhythm' },
  { css: /^\.kp-caret$/, why: 'the keypad (528) owns its caret' },
  { css: /^\.chess /, why: 'the chess ending is a cinematic of its own (429): a ring three times, the dark, the fall, the word' },
  { css: /^\.chess\.is-fresh/, why: 'the chess ending is a cinematic of its own (429): a ring three times, the dark, the fall, the word' },
  { css: /@keyframes chess-fall/, why: 'the beaten king\'s fall is physics: a lean, a drop, a bounce, each with its own curve' },
  { css: /^\.c4-cell\.c4-new::after$|@keyframes c4-drop/, why: 'a counter falls a height that depends on its row: game physics, gravity then a bounce' },
  /* PACKAGE E (U9) REWRITES THESE PRESS RULES onto --dur-press / --dur-quick; until it lands they keep `var(--quick) ease`. */
  { css: /^\.card\.tap$/, why: 'press rule, package E (U9)' },
  { css: /^\.btn$|^\.btn, /, why: 'press rule, package E (U9)' },
  { css: /^\.chip\b/, why: 'press rule, package E (U9)' },
  { css: /^\.feed:active \.feed-art$/, why: 'press rule, package E (U9)' },
  { css: /^\.dock-row \.text-drop$/, why: 'press rule, package E (U9)' },
  { css: /^\.av-sw$/, why: 'press rule, package E (U9)' },
  { css: /^\.tile$|^\.tile, /, why: 'press rule, package E (U9)' },
  { css: /^\.cam-round \.cam-disc$/, why: 'press rule, package E (U9)' },
  { css: /^\.hr$/, why: 'press rule, package E (U9)' },
  { css: /^\.row\.tap\.counted$/, why: 'press rule, package E (U9)' },
];

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
const css = strip(fs.readFileSync(CSS_FILE, 'utf8'));
const lineOf = i => css.slice(0, i).split('\n').length;
const ms = s => (/ms$/.test(s) ? parseFloat(s) : parseFloat(s) * 1000);

/* EVERY DECLARATION WITH THE RULE IT SITS IN, by walking the braces: `owner` is the innermost selector, `outer` the @media or @keyframes round it. */
function declarations() {
  const out = [];
  const stack = [];
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') { stack.push(css.slice(start, i).trim().replace(/\s+/g, ' ')); start = i + 1; }
    else if (ch === '}' || ch === ';') {
      const text = css.slice(start, i);
      const m = /^\s*([a-z-]+)\s*:\s*([\s\S]+)$/.exec(text);
      if (m && stack.length) out.push({ prop: m[1], val: m[2].trim(), at: start + text.search(/\S/), owner: stack[stack.length - 1], outer: stack.slice(0, -1) });
      if (ch === '}') stack.pop();
      start = i + 1;
    }
  }
  return out;
}

const hits = { literals: [], layout: [], painted: [], all: [], frames: [], js: [], jsReduce: [] };
const distinct = { durations: new Map(), easings: new Map() };
const used = new Set();
const accepted = (owner, outer) => {
  const names = [owner].concat(outer.filter(o => /^@keyframes/.test(o)));
  const a = ACCEPTED.find(x => x.css && names.some(n => x.css.test(n)));
  if (a) used.add(a);
  return a;
};

/* THE STYLESHEET. */
declarations().forEach(d => {
  if (d.owner === ':root' || /^--/.test(d.prop)) return;
  const kf = d.outer.find(o => /^@keyframes/.test(o));
  const where = 'style.css:' + lineOf(d.at);
  const who = (kf ? kf + ' ' : '') + d.owner;
  /* A KEYFRAME MOVING A PROPERTY THE COMPOSITOR CANNOT, and cannot even paint without layout. */
  if (kf && !/^(animation-timing-function|offset)$/.test(d.prop) && !COMPOSITED.has(d.prop) && !PAINTED.has(d.prop)) {
    hits.frames.push(`${where} ${kf} moves ${d.prop}`);
  }
  if (!/^(transition|animation)(-duration|-timing-function|-property|-delay)?$/.test(d.prop)) return;
  const val = d.val.replace(/!important/, '').trim();
  const parts = val.replace(/\([^)]*\)/g, x => x.replace(/,/g, '\u0001')).split(',').map(p => p.replace(/\u0001/g, ',').trim());
  parts.forEach(p => {
    const bare = p.replace(/var\([^)]*\)/g, ' ').replace(/calc\([^)]*\)/g, m => /var\(/.test(p) && !/\d+m?s/.test(m) ? ' ' : m);
    const durs = (bare.match(/(?:^|[\s(*+])(\d*\.?\d+m?s)(?=[\s)]|$)/g) || []).map(x => x.replace(/^[\s(*+]/, '')).filter(x => ms(x) > 0);
    const curves = (bare.match(/cubic-bezier\([^)]*\)|steps\([^)]*\)|linear\([^)]*\)|\b(?:ease-in-out|ease-in|ease-out|ease|linear|step-start|step-end)\b/g) || [])
      .map(x => x.replace(/\s+/g, ''));
    durs.forEach(x => { (distinct.durations.get(ms(x)) || distinct.durations.set(ms(x), []).get(ms(x))).push(where); });
    curves.forEach(x => { (distinct.easings.get(x) || distinct.easings.set(x, []).get(x)).push(where); });
    if ((durs.length || curves.length) && !accepted(d.owner, d.outer)) hits.literals.push(`${where} ${who}: ${d.prop}: ${p}`);
    if (/^transition(-property)?$/.test(d.prop)) {
      const first = bare.trim().split(/\s+/)[0];
      if (first === 'all') hits.all.push(`${where} ${who}`);
      else if (/^[a-z-]+$/.test(first) && !/^(none|initial|inherit|unset)$/.test(first) && !EASE_WORD.test(first) && !COMPOSITED.has(first)) {
        (PAINTED.has(first) ? hits.painted : hits.layout).push(`${where} ${who} transitions ${first}`);
      }
    }
  });
});

/* THE SCRIPTS: a duration or curve written into animate()/a style, and reduced motion asked anywhere but shell.js (`motionOK_`, MOTION_). */
fs.readdirSync(JS_DIR).filter(f => /\.js$/.test(f) && !/^check/.test(f)).forEach(f => {
  const src = strip(fs.readFileSync(path.join(JS_DIR, f), 'utf8'));
  src.split('\n').forEach((l, i) => {
    const where = 'js/' + f + ':' + (i + 1);
    const code = l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1');
    const lit = /\bduration\s*:\s*\d/.test(code) || /\beasing\s*:\s*['"`]/.test(code)
      || (/\.style\.(transition|animation)\w*\s*=|transition\s*:\s*['"`]/.test(code) && /\d*\.?\d+m?s\b|cubic-bezier|\bease\b/.test(code.replace(/var\([^)]*\)/g, '')));
    if (lit) {
      const a = ACCEPTED.find(x => x.js === 'js/' + f && x.re.test(code));
      if (a) used.add(a); else hits.js.push(where + ': ' + code.trim().slice(0, 120));
    }
    if (/prefers-reduced-motion/.test(code) && f !== 'shell.js') hits.jsReduce.push(where);
  });
});

const stale = ACCEPTED.filter(a => !used.has(a)).map(a => (a.css ? 'css ' + a.css : a.js + ' ' + a.re) + ' — ' + a.why);

const counts = {
  durations: distinct.durations.size,
  easings: distinct.easings.size,
  durationUses: [...distinct.durations.values()].reduce((a, w) => a + w.length, 0),
  easingUses: [...distinct.easings.values()].reduce((a, w) => a + w.length, 0),
  painted: hits.painted.length,
};
const SAY = { durations: 'distinct duration literals', easings: 'distinct curves written out', durationUses: 'duration literals written',
  easingUses: 'curves written out', painted: 'transitions of a painted (not composited) property' };

if (process.argv.includes('--update')) {
  fs.writeFileSync(BASE, JSON.stringify(counts, null, 2) + '\n');
  console.log('motion: baseline written — ' + JSON.stringify(counts));
  process.exit(0);
}
let base = null;
try { base = JSON.parse(fs.readFileSync(BASE, 'utf8')); } catch (e) { /* said below */ }
if (!base) { console.error('motion: no check/motion-baseline.json — run `node check/motion.js --update` once'); process.exit(2); }
const seen = declarations().filter(d => /^(transition|animation)/.test(d.prop)).length;
if (!seen) { console.error('motion: no transition or animation read in ' + CSS_FILE + ' — the parse cannot see its subject'); process.exit(2); }

if (VERBOSE) {
  [...distinct.durations].sort((a, b) => a[0] - b[0]).forEach(([k, w]) => console.log(`  duration ${k}ms: ${w.length}× (${w.slice(0, 3).join(', ')})`));
  [...distinct.easings].forEach(([k, w]) => console.log(`  curve ${k}: ${w.length}× (${w.slice(0, 3).join(', ')})`));
  hits.painted.forEach(x => console.log('  painted: ' + x));
}
const HARD = [
  ['literals', 'a duration or curve written out — use --dur-*/--ease-* (or name it in ACCEPTED with its reason)'],
  ['layout', 'a transition of a property that lays the page out — move it by transform/opacity/clip-path'],
  ['frames', 'keyframes moving a property that lays the page out'],
  ['all', '`transition: all`'],
  ['js', 'a script writing its own duration or curve — use MOTION_'],
  ['jsReduce', 'reduced motion asked outside shell.js — ask motionOK_()'],
];
const fail = [];
HARD.forEach(([k, say]) => hits[k].forEach(h => fail.push(`${say}: ${h}`)));
stale.forEach(s => fail.push('an ACCEPTED exception matches nothing any more — take it out: ' + s));
const grew = Object.keys(counts).filter(k => counts[k] > (base[k] || 0));
grew.forEach(k => fail.push(`${SAY[k]} grew: ${counts[k]}, was ${base[k] || 0}`));
if (fail.length) {
  console.error('motion: ' + fail.length + ' finding(s)');
  fail.forEach(f => console.error('  ! ' + f));
  process.exit(1);
}
const fell = Object.keys(counts).filter(k => counts[k] < (base[k] || 0));
if (fell.length) console.log('motion: fell, lower the baseline with --update — ' + fell.map(k => `${SAY[k]} ${base[k]} -> ${counts[k]}`).join('; '));
console.log(`motion: every duration and curve is a token or one of ${ACCEPTED.length} named exceptions, only the compositor moves things — `
  + Object.keys(counts).map(k => k + ' ' + counts[k]).join(', '));
