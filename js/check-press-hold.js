#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-press-hold.js A CONTROL WAITING ON ITS REQUEST HOLDS ITSELF, NOT ITS TWINS, AND NOT FOR EVER (534). */
/* shell.js's press block run in a vm with fake elements and a fake clock: a held Send leaves another Send free, and a promise that never settles lets go; a stepper takes two fast taps. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const shell = (() => { try { return fs.readFileSync(path.join(__dirname, 'shell.js'), 'utf8'); } catch (e) { return null; } })();
const from = shell ? shell.indexOf('const PRESS_AGAIN_MS') : -1;
const to = shell ? shell.indexOf('function pressFree_') : -1;
const dl = shell ? /const API_DEADLINE_MS\s*=\s*([^;]+);/.exec(shell) : null;
if (from < 0 || to < from || !dl) { console.error('check-press-hold: cannot find the press block or API_DEADLINE_MS in js/shell.js'); process.exit(1); }

let now = 0;
const timers = [];
const ctx = {
  performance: { now: () => now }, Promise, Map, Set, Object, String,
  setTimeout: (f, ms) => { timers.push({ f, at: now + ms }); return timers.length; },
  clearTimeout: id => { if (timers[id - 1]) timers[id - 1].f = null; },
};
vm.runInNewContext('const API_DEADLINE_MS = ' + dl[1] + ';\n' + shell.slice(from, to) + '\nthis.pressAgain_ = pressAgain_; this.pressOut_ = pressOut_; this.pressKey_ = pressKey_;', ctx);

/* A FAKE CONTROL: what pressKey_ and pressAgain_ read. */
const control = (cls, act) => {
  const at = { class: cls, 'data-do': act };
  return {
    tagName: 'BUTTON', isConnected: true,
    get attributes() { return Object.keys(at).map(n => ({ name: n, value: at[n] })); },
    getAttribute: n => (n in at ? at[n] : null), hasAttribute: n => n in at,
    setAttribute: (n, v) => { at[n] = String(v); }, removeAttribute: n => { delete at[n]; },
  };
};
const run = until => { now = until; timers.forEach(t => { if (t.f && t.at <= now) { const f = t.f; t.f = null; f(); } }); };

const bad = [];
const a = control('tile', 'msg-send'), b = control('tile', 'msg-send');
if (ctx.pressKey_(a) !== ctx.pressKey_(b)) bad.push('the two Sends were meant to share a press key and do not — the test no longer tests anything');
if (ctx.pressAgain_(a)) bad.push('a first press on a Send was dropped');
ctx.pressOut_(ctx.pressKey_(a), a, new Promise(() => {}));
now = 1000;
if (!ctx.pressAgain_(a)) bad.push('a Send whose request is out took a second press');
if (a.getAttribute('aria-busy') !== 'true') bad.push('a Send whose request is out is not aria-busy');
if (ctx.pressAgain_(b)) bad.push('another Send, in another sheet, was held by the first one\'s request');
run(now + 10 * 60000);
if (ctx.pressAgain_(a)) bad.push('a Send whose promise never settles was still held ten minutes later');
if (a.hasAttribute('aria-busy')) bad.push('a Send whose promise never settles still says aria-busy ten minutes later');

/* STEPPERS PRESSED FAST ON PURPOSE: the next story, a rewrite step, a sentence back — two taps 200 ms apart are two steps. */
for (const act of ['feed-tap', 'rw-next', 'rw-back', 'speed-back']) {
  const el = control('tile', act);
  now += 1000;
  const first = ctx.pressAgain_(el);
  now += 200;
  if (first || ctx.pressAgain_(el)) bad.push(act + ': two taps 200 ms apart were taken as one — name it in PRESS_REPEAT_');
}

if (bad.length) { console.error('check-press-hold: ' + bad.length + ' wrong:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('check-press-hold: OK — a held control holds itself, not its twin, and lets go of a promise that never settles');
