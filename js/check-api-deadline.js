#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-api-deadline.js A POST THE BACKEND RUNS FOR MINUTES IS NOT CUT AT ONE (534). */
/* api() gives up after API_DEADLINE_MS; an action whose backend budget is longer must be in API_LONG_ (shell.js), past that budget. Read, not run. */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const bad = [], said = [];
const read = p => { try { return fs.readFileSync(path.join(root, p), 'utf8'); } catch (e) { return null; } };

const shell = read('js/shell.js'), post = read('backend/dopost.gs');
let gs = [];
try { gs = fs.readdirSync(path.join(root, 'backend')).filter(f => f.endsWith('.gs')).map(f => read('backend/' + f)); } catch (e) {}
if (!shell || !post || gs.length < 5) { console.error('check-api-deadline: cannot read js/shell.js, backend/dopost.gs or the backend files'); process.exit(1); }
const src = gs.join('\n');

/* THE CLIENT'S NUMBERS: the one deadline, and the named long actions. */
const num = (name) => { const m = new RegExp('const ' + name + '\\s*=\\s*([^;]+);').exec(shell); try { return m ? Function('return ' + m[1])() : NaN; } catch (e) { return NaN; } };
const DEADLINE = num('API_DEADLINE_MS');
const longM = /const API_LONG_\s*=\s*(\{[\s\S]*?\n\});/.exec(shell);
let LONG = null;
try { LONG = longM ? Function('return ' + longM[1])() : null; } catch (e) { LONG = null; }
if (!(DEADLINE > 0) || !LONG) { console.error('check-api-deadline: cannot read API_DEADLINE_MS or API_LONG_ in js/shell.js'); process.exit(1); }

/* THE BACKEND'S *_MS CONSTANTS, in order, so one may be written from another. */
const MS = Object.create(null);
for (const m of src.matchAll(/^const (\w+_MS)\s*=\s*([^;\n]+);/gm)) {
  try { MS[m[1]] = Function('return ' + m[2].replace(/\b[A-Z][A-Z0-9_]*_MS\b/g, k => String(MS[k] || 0)))(); } catch (e) { /* not a number */ }
}
const val = s => /^\d+$/.test(s) ? +s : MS[s];

/* EVERY TOP-LEVEL FUNCTION: from its line to its closing brace at column 0, or the next function. */
const FN = Object.create(null);
const heads = [...src.matchAll(/^function (\w+)\s*\(/gm)];
heads.forEach((m, i) => {
  const next = i + 1 < heads.length ? heads[i + 1].index : src.length;
  const close = src.indexOf('\n}', m.index);
  FN[m[1]] = src.slice(m.index, close >= 0 && close < next ? close + 2 : next);
});

/* A BUDGET, as the backend writes one: `now() - t0 > X`, `budgetMs || X`, `t0 + N * 1000`. */
const BUDGET = Object.create(null);
for (const n of Object.keys(FN)) {
  const b = FN[n], put = (w, v) => { if (v > (BUDGET[n] ? BUDGET[n].ms : 0)) BUDGET[n] = { ms: v, how: w }; };
  for (const m of b.matchAll(/now\(\)\s*-\s*t0\s*>=?\s*(\w+)/gi)) put(m[0], val(m[1]));
  for (const m of b.matchAll(/budgetMs\)?\s*\|\|\s*(\w+)/g)) put(m[0], val(m[1]));
  for (const m of b.matchAll(/t0\s*\+\s*(\d+)\s*\*\s*1000\b/g)) put(m[0], +m[1] * 1000);
}

/* WHAT EACH POST ACTION CAN REACH, through the functions it calls. */
const reach = start => {
  const seen = new Set(), q = start.slice();
  while (q.length) {
    const f = q.pop();
    if (seen.has(f) || !FN[f]) continue;
    seen.add(f);
    for (const m of FN[f].matchAll(/\b(\w+)\s*\(/g)) if (FN[m[1]] && !seen.has(m[1])) q.push(m[1]);
  }
  return seen;
};
const acts = [...post.matchAll(/action === '(\w+)'/g)];
if (Object.keys(FN).length < 200 || acts.length < 50) { console.error('check-api-deadline: read ' + Object.keys(FN).length + ' functions and ' + acts.length + ' actions — too few to trust'); process.exit(1); }
const LONGEST = Object.create(null);
acts.forEach((m, i) => {
  const body = post.slice(m.index, i + 1 < acts.length ? acts[i + 1].index : m.index + 3000);
  const calls = [...body.matchAll(/\b(\w+)\s*\(/g)].map(x => x[1]).filter(x => FN[x] && x !== 'doPost');
  for (const f of reach(calls)) {
    const b = BUDGET[f];
    if (b && b.ms > DEADLINE && !(LONGEST[m[1]] && LONGEST[m[1]].ms >= b.ms)) LONGEST[m[1]] = { ms: b.ms, fn: f, how: b.how };
  }
});

for (const a of Object.keys(LONGEST)) {
  const b = LONGEST[a], got = LONG[a];
  said.push(a + ': backend budget ' + Math.round(b.ms / 1000) + ' s (' + b.fn + ': ' + b.how + '), client waits ' + Math.round((got || DEADLINE) / 1000) + ' s');
  if (!got) bad.push(a + ' runs up to ' + Math.round(b.ms / 1000) + ' s in ' + b.fn + ' (' + b.how + ') but api() cuts it at ' + Math.round(DEADLINE / 1000) + ' s — name it in API_LONG_');
  else if (got < b.ms + 60000) bad.push(a + ': API_LONG_ waits ' + Math.round(got / 1000) + ' s, under its backend budget of ' + Math.round(b.ms / 1000) + ' s plus a minute');
  else if (got > 6 * 60000) bad.push(a + ': API_LONG_ waits ' + Math.round(got / 1000) + ' s, past Apps Script\'s six minutes');
}
for (const a of Object.keys(LONG)) {
  if (!acts.some(m => m[1] === a)) bad.push('API_LONG_ names ' + a + ', which doPost does not handle');
  else if (!LONGEST[a]) bad.push('API_LONG_ names ' + a + ', but no backend budget over ' + Math.round(DEADLINE / 1000) + ' s was found for it — take it out');
}

/* AND api() WAITS THAT LONG: its own source run with a fetch that never answers, timers recorded, not fired. */
try {
  const at = shell.indexOf('\nfunction api(');
  const end = shell.indexOf('\n}\n', at);
  if (at < 0 || end < 0) throw new Error('function api( not found in js/shell.js');
  const timers = [];
  const ctx = { API: 'x', USER: null, PRESS_ACTING_: null, AbortController, Promise, JSON, Object, Error, String,
    setTimeout: (f, ms) => { timers.push(ms); return timers.length; }, clearTimeout: () => {},
    fetch: () => new Promise(() => {}), API_DEADLINE_MS: DEADLINE, API_LONG_: LONG };
  require('vm').runInNewContext(shell.slice(at, end + 2) + '\nthis.api = api;', ctx);
  const waits = a => { timers.length = 0; ctx.api({ action: a }); return Math.max(0, ...timers); };
  for (const a of Object.keys(LONGEST)) if (waits(a) !== LONG[a]) bad.push('api({action: ' + a + '}) set its deadline to ' + waits(a) + ' ms, not API_LONG_\'s ' + LONG[a]);
  if (waits('postApprove') !== DEADLINE) bad.push('api({action: postApprove}) set its deadline to ' + waits('postApprove') + ' ms, not API_DEADLINE_MS');
} catch (e) { bad.push('api() could not be run: ' + e.message); }

if (bad.length) {
  console.error('check-api-deadline: ' + bad.length + ' wrong:\n  ' + bad.join('\n  '));
  process.exit(1);
}
console.log('check-api-deadline: OK — ' + Object.keys(LONGEST).length + ' long actions of ' + acts.length + ' wait past ' + Math.round(DEADLINE / 1000) + ' s');
if (process.env.VERBOSE) said.forEach(l => console.log('  ' + l));
