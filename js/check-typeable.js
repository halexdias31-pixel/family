#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-typeable.js EVERY STORED ANSWER CAN BE TYPED ON THE PAD (round 4): each library accept has a written way the keypad's three faces type, as markNorm_ reads it. -v lists the ways no key types. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const LIB_FULL = require('../check/lib-full.js');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
if (!m) { console.log('FAILED — cannot read window.FILES out of index.html, so the keypad could not be loaded'); process.exit(1); }
const dom = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, ''), { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.org/' });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
w.scrollTo = () => {};
w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
w.fetch = () => new Promise(() => {});   // nothing arrives: the pad and the marker need no payload
w.__aheadHold = true;
try { w.eval([...m[1].matchAll(/'([^']+)'/g)].map(x => fs.readFileSync(path.join(__dirname, x[1] + '.js'), 'utf8')).join('\n')); }
catch (e) { console.log('FAILED — the app would not load: ' + e.message + ' — nothing was checked'); process.exit(1); }
if (typeof w.kpPadHtml_ !== 'function' || typeof w.markNorm_ !== 'function') { console.log('FAILED — kpPadHtml_ or markNorm_ is not in the app — nothing was checked'); process.exit(1); }

/* ---------- THE KEYS, AS THE PAD DRAWS THEM: every face, for a maths box and a worded one */
const FACES = ['maths', 'abc', 'sym'];
const keysOf = (face, words) => {
  const box = w.document.createElement('div');
  box.innerHTML = w.kpPadHtml_(face, words, true, false, true);
  return [...box.querySelectorAll('.kp-key')].map(b => b.getAttribute('data-v'));
};
const fail = [];
const all = [];
FACES.forEach(f => [false, true].forEach(words => all.push({ f, words, keys: keysOf(f, words) })));
/* EACH FACE REACHED: maths -> abc -> sym, and back from sym to both */
const TO = { '!abc': 'abc', '!123': 'maths', '!sym': 'sym' };
[false, true].forEach(words => {
  const seen = new Set([words ? 'abc' : 'maths']), todo = [...seen];
  while (todo.length) {
    const f = todo.pop();
    (all.find(a => a.f === f && a.words === words) || { keys: [] }).keys.forEach(v => { if (TO[v] && !seen.has(TO[v])) { seen.add(TO[v]); todo.push(TO[v]); } });
  }
  FACES.forEach(f => { if (!seen.has(f)) fail.push('the ' + f + ' face cannot be reached from a ' + (words ? 'worded' : 'maths') + ' box'); });
});
/* WHAT A KEY PUTS IN THE BOX: itself, a letter in both cases (⇧), or the structure a command writes */
const PUTS = { '!frac': '()/()', '!pow': '^()', '!sqrt': '√()', '!vec': '⟮,⟯', '!nl': '\n' };
const typed = new Set();
all.forEach(a => a.keys.forEach(v => {
  const t = PUTS[v] !== undefined ? PUTS[v] : /^!./.test(v) ? '' : v;
  for (const c of t) { typed.add(c); typed.add(c.toUpperCase()); }
}));
const N = w.markNorm_;
/* A CHARACTER IS TYPED if a key puts it, or the marker reads it as characters a key puts ("1" either side, so a lone "." or "/" survives) */
const charOk = c => typed.has(c) || /\s/.test(c) || [...N('1' + c + '1')].every(d => typed.has(d) || /\s/.test(d));
const wayOk = way => [...way].every(charOk);

let rows = 0, ways = 0, waysBad = 0;
const badWays = [];
let LIB;
try { LIB = LIB_FULL.rows('questions'); }
catch (e) { console.log('FAILED — the library could not be read whole: ' + e.message); process.exit(1); }
LIB.forEach(r => {
  if (!r || r.kind !== 'question') return;
  const written = String(r.accept || '').split('|').map(s => s.trim()).filter(s => s && !/^rule:/i.test(s));
  if (!written.length) return;
  rows++;
  ways += written.length;
  const no = written.filter(s => !wayOk(s));
  waysBad += no.length;
  no.forEach(s => badWays.push(r.row_id + ' ' + JSON.stringify(s) + ': no key for ' + [...new Set([...s].filter(c => !charOk(c)))].join(' ')));
  if (no.length === written.length) fail.push(r.row_id + ': none of its ways can be typed on the pad -- ' + no.map(s => JSON.stringify(s) + ' needs ' + [...new Set([...s].filter(c => !charOk(c)))].join(' ')).join('; '));
});
if (rows < 1000) fail.push('only ' + rows + ' rows with an accept were read — the library was not reached');
if (process.argv.includes('-v')) badWays.forEach(b => console.log('  a way no key types (another of its ways can be): ' + b));
const line = rows + ' questions with accepted answers, ' + ways + ' written ways, ' + (ways - waysBad) + ' typed key by key, '
  + waysBad + ' with a character only another of its ways avoids; ' + typed.size + ' characters on the pad\'s ' + FACES.length + ' faces';
if (!fail.length) { console.log('OK — every stored answer can be typed on the pad: ' + line); process.exit(0); }
console.log('FAILED — ' + fail.length + ' problem(s): ' + line);
fail.slice(0, process.argv.includes('-v') ? 1e9 : 40).forEach(f => console.log('  ' + f));
process.exit(1);
