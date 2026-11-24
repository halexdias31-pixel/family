#!/usr/bin/env node
/* @family. — tools/keypad-taps.js THE KEYPAD CHECK (rule 1.75, owner 23 Nov: "Make the keypad better in general. Hegarty Maths always worked";
   "I can't do coordinate questions"; "I hate a button for more buttons"). Three parts, each what a child would notice:
   1. FORMS: each form Hegarty's pad types (mixed number, fraction, power, root, negative, decimal, π, ratio, units, points, inequality,
      standard form) tapped on the one pad's keys (js/keypad-keys.js kpEdit_, in a vm as tools/validate-questions.js loads the app) and
      marked by the one marker: every one Right, and every key it needs on the face the box opens on.
   2. THE LIBRARY: a sample of every answer type's site-marked questions, the key's first way tapped the same way and marked by mark_;
      the pass count per type is printed and may not fall below tools/data/keypad-taps.json.
   3. ON A PHONE AND AN iPAD (tools/lib/site-browser.js, 390px and 820px): a real box, the forms tapped on the drawn keys; no key turns the
      pad over (abc / 123 / αβ / ⇧ / more), every key inside the screen, the box in the theme's colours and short for a short answer.
   4. FILL A TABLE (owner 23 Nov: a table is typed): a sample of the site-marked table questions, kept in their order, and made-up tables
      whose rows are a list, filled in a shuffled row order: each empty cell's own box tapped on its own keypad (that cell's answer's keys),
      the boxes in any order, marked Right by mark_; a separate table-only input (a field not the one box, or a box outside the table) fails.
   5. ON AN iPHONE (`onIphone`): upright and on its side, still and as Safari pans for a focused box: every key inside the seen screen,
      the pad on its foot, each key's centre tapped landing on that key.
   Any failure fails the build. `--floor` writes today's library counts as the floor. */
'use strict';
const fs = require('fs'), path = require('path');
const { report, main, ROOT } = require('./lib/gen.js');
const VQ = require('./validate-questions.js');
const { kpTapsOf } = require('./lib/keypad-taps.js');
const FLOOR = path.join(ROOT, 'tools', 'data', 'keypad-taps.json');

/* [key (accepted ways), the way a child taps, what it is] -- the key's first way is tapped unless a way is given */
const FORMS = [
  ['2 1/3 | rule: count 1, mixed, each eq 7/3', '2 1/3', 'mixed number: 7/3 as a mixed number (Q-CBM-top-heavy-fractions-mixed-numbers-1)'],
  ['1 3/10 | rule: count 1, mixed, each eq 13/10', '1 3/10', 'mixed number: 13/10'],
  ['7/4', '7/4', 'fraction template'],
  ['3/8 | rule: count 1, lowest, each eq 3/8', '3/8', 'fraction in its simplest form'],
  ['x^5', 'x^5', 'a power'],
  ['2^(-3)', '2^(-3)', 'a negative power'],
  ['√7', '√7', 'a square root'],
  ['-4', '-4', 'a negative number'],
  ['3.75', '3.75', 'a decimal'],
  ['4π', '4π', 'π'],
  ['3:5', '3:5', 'a ratio'],
  ['12cm', '12cm', 'a length with its unit'],
  ['45°', '45°', 'an angle'],
  ['£4.50', '£4.50', 'money'],
  ['(3, -11) | (3,-11)', '(3, -11)', 'a point with a negative'],
  ['(-2, 5)', '(-2, 5)', 'a point, x negative'],
  ['(0, -3) | (0,-3)', '(0, -3)', 'a point on an axis'],
  ['(1, 2), (3, 4)', '(1, 2), (3, 4)', 'two points'],
  ['x = 5, y = 9', 'x = 5, y = 9', 'two named values'],
  ['x > 4', 'x > 4', 'an inequality'],
  ['-2 ≤ x < 3', '-2 ≤ x < 3', 'a double inequality'],
  ['8.9 × 10^8 | rule: standard form', '8.9 × 10^8', 'standard form'],
  ['3.2 × 10^-4 | rule: standard form', '3.2 × 10^-4', 'standard form, a negative power'],
  ['5, 7', '5, 7', 'two answers'],
];
/* THE CHILD'S OWN TYPINGS of 7/3 as a mixed number, marked as typed (no keypad): each must be Right, 7/3 itself and a wrong value not */
const TYPED = [['2 1/3', true], ['2⅓', true], ['2+1/3', true], ['2+ 1/3', true], ['2 (1)/(3)', true], ['(2) (1)/(3)', true], ['2 and 1/3', true],
  ['7/3', false], ['2 2/3', false], ['1 4/3', false], ['3 1/3', false]];
const KEY73 = '2 1/3 | rule: count 1, mixed, each eq 7/3';
const LAYERS = /^!(abc|123|sym|shift|more)$/;
/* THE ONE KEYBOARD'S ROWS (owner 23 Nov: "about 6 rows"): seven of ten hold the letters, the numbers and the maths keys at a phone's key size */
const ROWS = 7;

/* ---------- THE PAD IN NODE: a box as the page has one, typed through kpEdit_ */
function pad(app) {
  const { ctx, call } = app;
  if (!ctx.Event) ctx.Event = class Event { constructor(t) { this.type = t; } };
  const dec = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  /* EVERY KEY THE PAD DRAWS FOR A BOX, in order: its value, greyed or not, its span */
  const keysOf = box => { ctx.__b = box;
    return [...call('kpPadHtml_(__b)').matchAll(/<button\b[^>]*>/g)].map(m => m[0]).filter(t => /\bkp-key\b/.test(t))
      .map(t => ({ v: dec((/data-v="([^"]*)"/.exec(t) || [])[1] || ''), off: /\bkp-off\b/.test(t), span: +((/\bkp-s(\d+)/.exec(t) || [])[1] || 6) })); };
  /* THE KEYS THIS BOX CAN USE: the greyed ones are on the pad but type nothing */
  const faceOf = (acc, words, kind) => keysOf({ kind: kind || (words ? 'words' : 'maths'), acc: acc }).filter(k => !k.off).map(k => k.v);
  const type = (taps, words, attrs) => {
    ctx.__taps = taps; ctx.__w = !!words; ctx.__at = attrs || {};
    return call('(function () { const at = { a: 0, b: 0 }; const inp = { value: "", nodeType: 1, get selectionStart() { return at.a; }, get selectionEnd() { return at.b; },'
      + ' setSelectionRange(a, b) { at.a = a; at.b = b; }, getAttribute(n) { return n === "data-kp" ? (__w ? "words" : "maths") : n === "data-k" ? "kp-taps" : n in __at ? __at[n] : null; },'
      + ' hasAttribute() { return false; }, classList: { contains: c => c === "kp-in" }, dispatchEvent() {} };'
      + ' for (const t of __taps) kpEdit_(inp, __w && KP_WORD_SIGN[t] ? KP_WORD_SIGN[t] : t); return inp.value; })()');
  };
  return { faceOf, keysOf, type };
}

/* ---------- ONE LAYOUT, NO KEY DOING ANOTHER'S JOB (owner 23 Nov, ONE KEYBOARD) */
/* every kind of box the site has: a maths answer (nothing said, and several answers), a worded one, an essay, options, and the site's own
   boxes (text, an address, a number, a password) */
const BOXES = [['a maths answer, nothing said', { kind: 'maths' }], ['a maths answer 2 1/3', { kind: 'maths', acc: '2 1/3' }],
  ['a maths answer x > 4', { kind: 'maths', acc: 'x > 4' }], ['a maths answer £4.50', { kind: 'maths', acc: '£4.50' }],
  ['a maths answer with Greek', { kind: 'maths', acc: '2θ' }], ['a worded answer', { kind: 'words', acc: 'Paris' }],
  ['an essay', { kind: 'words', essay: true }], ['options', { kind: 'letters', acc: 'ABCD' }],
  ['a box elsewhere', { kind: 'site', site: 'abc' }], ['an address', { kind: 'site', site: 'mail' }],
  ['a number box', { kind: 'site', site: 'num' }], ['a password', { kind: 'site', site: 'abc', secret: true }], ['a box of lines', { kind: 'site', site: 'abc', essay: true }]];
function oneLayout(app, P) {
  const bad = [];
  const ref = P.keysOf(BOXES[0][1]);
  /* the layout's own keys: the rows of sixty columns before any row an answer adds (`kpNeedKeys_`) */
  const own = ks => { let used = 0; return ks.filter(k => { const inside = used < ROWS * 60; used += k.span; return inside; }); };
  const rows = ref.reduce((s, k) => s + k.span, 0) / 60;
  if (rows !== ROWS) bad.push('the keyboard has ' + rows + ' rows, not ' + ROWS);
  const sig = ks => own(ks).map(k => k.v + '/' + k.span).join(' ');
  for (const [what, box] of BOXES) {
    const ks = P.keysOf(box);
    if (sig(ks) !== sig(ref)) bad.push(what + ': its keys are not in the one layout\'s places (' + own(ks).map(k => k.v).join(' ') + ')');
    if (ks.some(k => LAYERS.test(k.v))) bad.push(what + ': a key turns the pad over');
    if (!ks.some(k => k.off) && box.kind !== 'words') bad.push(what + ': no key greyed, though this box cannot use every key');
  }
  /* NO KEY TWICE, and none whose job another key does: each key typed after a 5, in a maths box and a worded one, against every other key
     alone, any two, and a fraction, power or root key with one key in it; the same text, or a value the marker takes as the same, is a key
     too many (x² is xⁿ 2, (−) is −, ×10ⁿ is × 1 0 xⁿ) */
  const vs = own(ref).map(k => k.v);
  vs.filter((v, i) => vs.indexOf(v) !== i).forEach(v => bad.push('the key ' + JSON.stringify(v) + ' is on the keyboard twice'));
  const typing = vs.filter(v => !/^!(back|left|right|done|mic|nl)$/.test(v));
  const out = (taps, words) => P.type(['5'].concat(taps), words);
  const same = {}, mk = {};
  for (const words of [false, true]) {
    const one = {}, two = new Map();
    typing.forEach(v => { one[v] = out([v], words); });
    typing.forEach(a => typing.forEach(b => { const s = out([a, b], words); if (!two.has(s)) two.set(s, []); two.get(s).push([a, b]); }));
    const filled = [];
    if (!words) ['!frac', '!pow', '!sqrt'].forEach(t => typing.filter(o => /^\d$/.test(o)).forEach(o => filled.push([[t, o, '!right'], out([t, o, '!right'], false)])));
    for (const k of typing) {
      const want = one[k];
      let by = typing.filter(o => o !== k && one[o] === want).map(o => [o])[0] || (two.get(want) || []).find(p => p.indexOf(k) < 0) || null;
      app.ctx.__k = want; app.ctx.__t = '5';
      /* a key the marker reads past (5% and 5) is no value of its own to compare */
      let past = true; try { past = !!app.call('markAnswer_(__t, __k)'); } catch (e) { past = true; }
      if (!by && !words && !/^!(frac|pow|sqrt)$/.test(k) && !past) {
        for (const [taps, s] of filled) {
          if (taps[0] === k || s === want) continue;
          app.ctx.__t = s;
          let ok = false; try { ok = !!app.call('markAnswer_(__t, __k)'); } catch (e) { ok = false; }
          if (ok) { by = taps; break; }
        }
      }
      if (by && !same[k]) { same[k] = by; mk[k] = words ? 'a worded box' : 'a maths box'; }
    }
  }
  Object.keys(same).forEach(k => bad.push('the key ' + JSON.stringify(k) + ' does what ' + same[k].join(' ') + ' already does (in ' + mk[k] + '): a key too many'));
  console.log('keypad-taps: one layout, ' + rows + ' rows, ' + vs.length + ' keys, the same places on ' + BOXES.length + ' kinds of box; '
    + typing.length + ' typing keys checked for another key\'s job');
  return bad;
}

function forms(app, P) {
  const bad = [];
  let pass = 0;
  for (const [key, way, what] of FORMS) {
    const taps = kpTapsOf(way, false), face = P.faceOf(key, false);
    const missing = [...new Set(taps.filter(t => !face.includes(t)))];
    const v = P.type(taps, false);
    app.ctx.__t = v; app.ctx.__k = key;
    const ok = !!app.call('markAnswer_(__t, __k)');
    if (ok && !missing.length) pass++;
    else bad.push(what + ': tapped ' + JSON.stringify(taps.join(' ')) + ' -> ' + JSON.stringify(v) + (ok ? '' : ' marked wrong') + (missing.length ? ', no key for ' + missing.join(' ') : ''));
    if (face.some(f => LAYERS.test(f))) bad.push(what + ': the face has a key that turns the pad over (' + face.filter(f => LAYERS.test(f)).join(' ') + ')');
  }
  for (const [t, want] of TYPED) {
    app.ctx.__t = t; app.ctx.__k = KEY73;
    if (!!app.call('markAnswer_(__t, __k)') !== want) bad.push('7/3 as a mixed number typed ' + JSON.stringify(t) + ' must be ' + (want ? 'Right' : 'wrong'));
    else pass++;
  }
  console.log('keypad-taps: forms ' + pass + '/' + (FORMS.length + TYPED.length) + ' right');
  return bad;
}

/* ---------- THE LIBRARY: every answer type, its site-marked questions sampled */
function library(app, P, opts) {
  const status = (JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'question-status.json'), 'utf8')).status) || {};
  const all = VQ.rowsOf().filter(r => r.kind === 'question' && status[r.row_id] === 'ok');
  const rows = all.filter(r => String(r.accept || '').split('|').some(w => w.trim() && !/^\s*rule:/i.test(w)) && !r.choices && !r.cells);
  const byType = {};
  rows.forEach(r => { const t = String(r.answer_type || '?'); (byType[t] = byType[t] || []).push(r); });
  /* AND EVERY COORDINATE QUESTION, not a sample (owner 23 Nov: "I can't do coordinate questions!!") */
  /* AND THE OPTIONS (owner 23 Nov: pick merged into type): a sample of pick-one, pick-several and order parts, typed on their letters keypad */
  const opt = all.filter(r => String(r.choices || '').split('|').filter(c => c.trim()).length >= 2 && String(r.choice_right || '').trim());
  byType['* options: order'] = opt.filter(r => /^order$/i.test(String(r.answer_type || '').trim()));
  byType['* options: pick several'] = opt.filter(r => !/^order$/i.test(String(r.answer_type || '').trim()) && /,/.test(String(r.choice_right).split('|')[0]));
  byType['* options: pick one'] = opt.filter(r => !/^order$/i.test(String(r.answer_type || '').trim()) && !/,/.test(String(r.choice_right).split('|')[0]));
  byType['* coordinates'] = rows.filter(r => /coordinate/i.test(String(r.html || '')));
  const { ctx, call } = app;
  const per = {}, misses = [];
  for (const t of Object.keys(byType).sort()) {
    const all = byType[t], cap = /^\* coord/.test(t) ? all.length : t[0] === '*' ? 80 : 40, step = Math.max(1, Math.floor(all.length / cap));
    const pick = all.filter((r, i) => i % step === 0).slice(0, cap);
    let pass = 0;
    for (const r of pick) {
      ctx.__r = r;
      let x; try { x = call('libQuestion_(__r)'); } catch (e) { continue; }
      ctx.__x = x;
      const kind = call('markerOf_(__x).kind');
      if (/^(draw|save)$/.test(kind)) { pass++; continue; }
      const keys = call('choiceKeysAt_(__x)');
      if (keys) {
        /* the key's letters, a set tapped in reverse (the box sorts it), each its option's key */
        const L = keys['data-kp-letters'], idx = (x.choiceRight || []).slice();
        if (keys['data-kp-pick'] === 'set') idx.reverse();
        /* each option is its letter's key on the one keyboard; every other key but ← → ⌫ done is greyed */
        const taps = idx.map(n => L[n - 1].toLowerCase()), face = P.faceOf(L, true, 'letters');
        const missing = taps.filter(k => !face.includes(k));
        const v = P.type(taps, true, keys);
        ctx.__a = v;
        let right = false; try { right = call('mark_(__x, __a)').verdict === 'right'; } catch (e) { right = false; }
        const other = face.filter(f => !/^!(left|right|back|done)$/.test(f) && L.indexOf(f.toUpperCase()) < 0);
        if (other.length) missing.push('a key that is no option: ' + other.join(' '));
        if (right && !missing.length) pass++;
        else if (misses.length < (opts.show || 0)) misses.push(r.row_id + ' [' + t + '] ' + JSON.stringify(r.choice_right) + ' -> ' + JSON.stringify(v) + (right ? '' : ' wrong') + (missing.length ? ' ' + missing.join(' ') : ''));
        continue;
      }
      const words = !call('ansMaths_(__x)');
      const way = String(r.accept).split('|').map(w => w.trim()).find(w => w && !/^rule:/i.test(w));
      const taps = kpTapsOf(way, words), face = P.faceOf(r.accept, words);
      const missing = [...new Set(taps.filter(k => !face.includes(k) && !(words && k === '\n')))];
      let v = ''; try { v = P.type(taps, words); } catch (e) { v = 'error ' + e.message; }
      ctx.__a = v;
      let right = false; try { right = call('mark_(__x, __a)').verdict === 'right'; } catch (e) { right = false; }
      if (right && !missing.length) pass++;
      else if (misses.length < (opts.show || 0)) misses.push(r.row_id + ' [' + t + '] ' + JSON.stringify(way) + ' -> ' + JSON.stringify(v) + (right ? '' : ' wrong') + (missing.length ? ' no key ' + missing.join(' ') : ''));
    }
    per[t] = [pass, pick.length];
  }
  const sum = Object.values(per).reduce((s, [p, n]) => [s[0] + p, s[1] + n], [0, 0]);
  console.log('keypad-taps: library sample ' + sum[0] + '/' + sum[1] + ' right across ' + Object.keys(per).length + ' answer types');
  Object.entries(per).forEach(([t, [p, n]]) => console.log('  ' + t + ': ' + p + '/' + n));
  misses.forEach(m => console.log('  miss ' + m));
  const bad = [];
  if (opts.floor) fs.writeFileSync(FLOOR, JSON.stringify({ say: 'Written by tools/keypad-taps.js --floor: each answer type\'s sampled questions tapped right; a fall fails the build.', per }, null, 1) + '\n');
  else if (fs.existsSync(FLOOR)) {
    const f = JSON.parse(fs.readFileSync(FLOOR, 'utf8')).per || {};
    /* the share tapped right, not the count: which questions are markable moves with the library */
    Object.entries(f).forEach(([t, [p, n]]) => { const [q, m] = per[t] || [0, 1]; if (q / Math.max(1, m) < p / Math.max(1, n) - 1e-9) bad.push(t + ': ' + q + '/' + m + ' tapped right, the floor is ' + p + '/' + n); });
  }
  return bad;
}

/* ---------- FILL A TABLE: each cell's box tapped on its own keypad, the cells in any order */
const OneCells = () => require('./one-cells.js');
const UNORDERED = () => {
  const { COINS } = OneCells();
  return [COINS, {
    key: 'keypad-taps-spinners', marks: 2,
    html: '<p>A spinner (1, 2, 3) is spun and a coin thrown. List every outcome.</p><table><tr><th>Spinner</th><th>Coin</th></tr>'
      + '<tr><td></td><td></td></tr>'.repeat(6) + '</table>',
    cells: '1 = 1 ; 2 = H ; 3 = 1 ; 4 = T ; 5 = 2 ; 6 = H ; 7 = 2 ; 8 = T ; 9 = 3 ; 10 = H ; 11 = 3 ; 12 = T'
  }];
};
function tables(app, P) {
  const { ctx, call } = app;
  call('qtMarker_(workRow_({row:{}}))'); call('padGrid_'); call('CARD_BLOCKS');
  call('Object.assign(CARD_BLOCKS, { control: kcfControl_, field: kcfField_, tick: kcfTickB_, many: kcfMany_, group: kcfGroup_ })');
  call('oops_ = e => { throw e; }');
  const bad = [], n = { ordered: [0, 0], unordered: [0, 0] };
  const dec = v => v.replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  /* one table part, its cells filled in `order` (a list of cell numbers) with `ways` (a way per cell) */
  const fill = (x, label, ways, order) => {
    ctx.__x = x;
    const html = String(call('ansBox_(__x)') || '');
    const fields = [...html.matchAll(/<(input|textarea)\b[^>]*>/g)].map(m => m[0]);
    const tables = (html.match(/<table[\s\S]*?<\/table>/g) || []).join('');
    const stray = fields.filter(f => !/\bkp-in\b/.test(f) || !/\bqp-ans-in\b/.test(f) || tables.indexOf(f) < 0);
    if (stray.length) return label + ': ' + stray.length + ' input(s) not the one box in the table';
    const box = {};
    html.split('<label class="qp-ans qp-cell-ans').slice(1).forEach(h => {
      const acc = /data-accept="([^"]*)"/.exec(h), kp = /data-kp="(\w+)"/.exec(h), at = /data-n="(\d+)"/.exec(h);
      if (acc && kp && at) box[+at[1]] = { acc: dec(acc[1]), words: kp[1] === 'words' };
    });
    const vals = ways.map(() => '');
    for (const i of order) {
      if (!ways[i]) continue;
      const b = box[i];
      if (!b) return label + ': cell ' + i + ' has no box';
      const taps = kpTapsOf(ways[i], b.words), face = P.faceOf(b.acc, b.words);
      const missing = [...new Set(taps.filter(k => !face.includes(k) && !(b.words && k === '\n')))];
      if (missing.length) return label + ': cell ' + i + ' ' + JSON.stringify(ways[i]) + ' has no key ' + missing.join(' ');
      vals[i] = P.type(taps, b.words);
    }
    ctx.__a = vals;
    const v = call('mark_(__x, __a)');
    /* CHECK LEAVES THE BOXES AS TYPED: the saved "a ; b ; c" read back is the same value in every cell */
    ctx.__s = vals.join(' ; ');
    const back = call('cellsVals_(__s, cellsOf_(__x))');
    if (vals.some((w, i) => String(back[i] || '') !== w)) return label + ': saved ' + JSON.stringify(ctx.__s) + ' reads back as ' + JSON.stringify(back);
    return v.verdict === 'right' ? '' : label + ': tapped ' + JSON.stringify(vals) + ' marked ' + v.verdict + ' ' + v.marks + '/' + v.outOf;
  };
  const shuffle = (a, seed) => { const b = a.slice(); let s = seed; for (let i = b.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  /* THE LIBRARY'S TABLES, site-marked, every kind of placing: the key's first way in each cell, the cells tapped last to first */
  const status = (JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'question-status.json'), 'utf8')).status) || {};
  const rows = fs.existsSync(path.join(ROOT, 'data-private', 'questions.json')) ? VQ.rowsOf().filter(r => r.kind === 'question' && !r.same_as && String(r.cells || '').trim() && status[r.row_id] === 'ok') : [];
  const step = Math.max(1, Math.floor(rows.length / 60));
  /* AND THE LIVE BUG (owner photo, 23 Nov): the probability tree's six values, fractions on the fraction key, kept a value a cell */
  const bug = rows.filter(r => r.row_id === 'Q-1CM-probability-tree-diagrams-1');
  rows.filter((r, i) => i % step === 0).slice(0, 60).concat(bug).forEach(r => {
    ctx.__r = r;
    let x; try { x = call('libQuestion_(__r)'); } catch (e) { return; }
    ctx.__x = x;
    const ways = call('cellsOf_(__x).map(c => (String(c.ways || "").split("|").map(w => w.trim()).find(w => w && !/^rule:/i.test(w)) || ""))');
    n.ordered[1]++;
    const miss = fill(x, r.row_id, ways, ways.map((w, i) => i).reverse());
    if (miss) bad.push('table ' + miss); else n.ordered[0]++;
  });
  /* AN UNORDERED TABLE: its rows filled in a shuffled order -- the key's rows, each typed in another row's place */
  UNORDERED().forEach((t, k) => {
    const x = Object.assign({}, t);
    ctx.__x = x;
    const ways = call('cellsOf_(__x).map(c => c.ways)'), o = call('cellsOrder_(__x)');
    if (o.by !== 'rows') { bad.push('table ' + t.key + ': its rows are marked "' + o.by + '", not in any order'); return; }
    const perm = shuffle(o.groups.map((g, i) => i), 7 + k);
    const typed = ways.slice();
    o.groups.forEach((g, i) => g.forEach((cell, c) => { typed[cell] = ways[o.groups[perm[i]][c]]; }));
    n.unordered[1]++;
    const miss = fill(x, t.key + ' (rows shuffled)', typed, shuffle(typed.map((w, i) => i), 3 + k));
    if (miss) bad.push('table ' + miss); else n.unordered[0]++;
  });
  /* AND NO TABLE KEEPS A SEPARATE ONE-BOX: the tree's answer is the table, no comma line under it */
  console.log('keypad-taps: tables ' + n.ordered[0] + '/' + n.ordered[1] + ' ordered (library sample) and ' + n.unordered[0] + '/' + n.unordered[1] + ' unordered (rows shuffled) tapped right');
  return bad;
}

/* ---------- ON A PHONE AND AN iPAD: the drawn keys tapped */
/* A KEY TAPPED, once more if a loaded page missed it (22 Nov: under load a phone-sized page misses taps) */
async function press(pg, i) {
  const k = pg.locator('#kp .kp-key').nth(i);
  try { await k.click({ timeout: 3000 }); } catch (e) { await k.click({ timeout: 3000, force: true }); }
}
async function browser() {
  const SB = require('./lib/site-browser.js');
  const { devices } = require('playwright');
  const bad = [];
  const sizes = [['390px phone', devices['iPhone 13']], ['iPad', devices['iPad (gen 7)'] || { viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true }]];
  for (const [name, dev] of sizes) {
    let pg;
    try {
      pg = await SB.open({ as: 'child', settle: 500 });
      await pg.setViewportSize(dev.viewport);
    } catch (e) { bad.push(name + ': the site did not open (' + e.message + ')'); continue; }
    try {
      for (const [key, way, what] of FORMS) {
        const taps = kpTapsOf(way, false);
        /* a part's answer bar as find-cells.js draws one, its accepted ways on the part */
        const setup = await pg.evaluate(k => {
          document.querySelectorAll('.kp-taps').forEach(n => n.remove());
          const d = document.createElement('div');
          d.className = 'qp-mark qp-compose kp-taps'; d.setAttribute('data-accept', k);
          d.innerHTML = '<div class="qp-sheet" style="--sheet-lines: 1"><div class="qp-sheet-lines">' + sheetSvg_(1) + '<label class="qp-ans qp-sheet-type">' + kpField_('kp-taps-' + Math.random(), '', 'maths', 3) + '</label></div></div>';
          (document.querySelector('main') || document.body).prepend(d);
          const inp = d.querySelector('.kp-in'); inp.focus(); kpOpen_(inp);
          return [...document.querySelectorAll('#kp .kp-key')].map(e => (e.hasAttribute('data-off') ? '' : e.getAttribute('data-v')));
        }, key);
        const turners = setup.filter(v => LAYERS.test(v || ''));
        if (turners.length) bad.push(name + ' ' + what + ': a key turns the pad over (' + turners.join(' ') + ')');
        let missing = '';
        for (const t of taps) {
          const i = setup.indexOf(t);
          if (i < 0) { missing = t; break; }
          await press(pg, i);
        }
        const got = await pg.evaluate(k => {
          const inp = document.querySelector('.kp-taps .kp-in'), box = document.querySelector('.kp-taps .qp-sheet');
          const cs = getComputedStyle(box), raised = getComputedStyle(document.documentElement).getPropertyValue('--raised').trim();
          const probe = document.createElement('span'); probe.style.color = raised; document.body.appendChild(probe);
          const want = getComputedStyle(probe).color; probe.remove();
          const keys = [...document.querySelectorAll('#kp .kp-key')].filter(e => { const r = e.getBoundingClientRect(); return r.width < 1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1 || r.left < -1; }).length;
          return { v: inp.value, right: !!markAnswer_(inp.value, k), bg: cs.backgroundColor, want, w: box.getBoundingClientRect().width, vw: innerWidth, off: keys };
        }, key);
        if (missing) bad.push(name + ' ' + what + ': no key for ' + missing);
        else if (!got.right) bad.push(name + ' ' + what + ': tapped ' + JSON.stringify(got.v) + ', marked wrong');
        if (got.off) bad.push(name + ' ' + what + ': ' + got.off + ' key(s) off the screen');
        if (got.bg !== got.want) bad.push(name + ': the answer box is ' + got.bg + ', not the theme\'s --raised ' + got.want);
        /* A SHORT ANSWER'S BOX IS NO LONGER NARROWER: every part is written on the one sheet, the same width (owner, 24 Nov) */
      }
      /* OPTIONS: a pick-several part's letters keypad, D then A tapped, is A,D -- and has no key but its letters and ← → ⌫ done */
      const keys = await pg.evaluate(() => {
        document.querySelectorAll('.kp-taps').forEach(n => n.remove());
        const d = document.createElement('div');
        d.className = 'qp-mark qp-compose kp-taps';
        d.innerHTML = '<div class="qp-sheet" style="--sheet-lines: 1"><div class="qp-sheet-lines">' + sheetSvg_(1) + '<label class="qp-ans qp-sheet-type">' + kpField_('kp-taps-pick', '', 'words', 3, null, { 'data-kp-letters': 'ABCD', 'data-kp-pick': 'set' }) + '</label></div></div>';
        (document.querySelector('main') || document.body).prepend(d);
        const inp = d.querySelector('.kp-in'); inp.focus(); kpOpen_(inp);
        return [...document.querySelectorAll('#kp .kp-key')].map(e => (e.hasAttribute('data-off') ? '' : e.getAttribute('data-v')));
      });
      for (const t of ['d', 'a', 'd']) { const i = keys.indexOf(t); if (i >= 0) await press(pg, i); else bad.push(name + ': no option key ' + t); }
      /* a greyed key tapped types nothing */
      const z = keys.length ? await pg.evaluate(() => [...document.querySelectorAll('#kp .kp-key')].findIndex(e => e.getAttribute('data-v') === 'z')) : -1;
      if (z >= 0) await press(pg, z);
      const picked = await pg.evaluate(() => document.querySelector('.kp-taps .kp-in').value);
      if (picked !== 'A,D') bad.push(name + ': pick several D, A, D (and the greyed z) gave ' + JSON.stringify(picked) + ', not "A,D"');
      const other = keys.filter(v => v && !/^!(left|right|back|done)$/.test(v) && 'abcd'.indexOf(v) < 0);
      if (other.length) bad.push(name + ': the options keypad lights other keys (' + other.join(' ') + ')');
      if (process.env.KP_SHOTS) await pg.screenshot({ path: path.join(process.env.KP_SHOTS, 'keypad-' + name.replace(/\W+/g, '-') + '-options.png') });
      await pg.evaluate(() => { const i = document.querySelector('.kp-taps .kp-in'); if (i) { i.blur(); kpClose_(); } });
    } catch (e) { bad.push(name + ': ' + e.message.split('\n')[0]); }
    await pg.close();
    bad.push(...await everyBox(SB, name, dev));
  }
  bad.push(...await onIphone(SB));
  await SB.done();
  console.log('keypad-taps: ' + sizes.length + ' screens, ' + FORMS.length + ' forms tapped on the drawn keys');
  return bad;
}

/* ---------- EVERY BOX ON EVERY SCREEN OPENS THE ONE KEYBOARD (owner 23 Nov: "the welcome screen without it"): signed out (the welcome and
   sign-in screen), as a child and as an admin, every screen the app has drawn and every Settings form: each text box is bound to the
   keyboard, and each one in sight, tapped, opens it -- the one layout in the one set of places, every key inside the screen and big enough
   for a child's finger, the box not under it */
const KP_MIN = 38;
async function everyBox(SB, name, dev) {
  const bad = [], seen = { boxes: 0, tapped: 0, screens: 0 };
  const ref = await (async () => {
    const pg = await SB.open({ as: 'child', settle: 300 });
    try { return await pg.evaluate(() => { const t = document.createElement('template'); t.innerHTML = kpPadHtml_({ kind: 'maths' });
      return [...t.content.querySelectorAll('.kp-key')].map(e => e.getAttribute('data-v')).slice(0, 69).join('|'); }); } finally { await pg.close(); }
  })();
  for (const as of ['none', 'child', 'admin']) {
    let pg;
    try {
      pg = await SB.open(as === 'none' ? { as, settle: 1500, ready: () => document.readyState === 'complete' && typeof kpOpen_ === 'function' } : { as, settle: 500 });
      await pg.setViewportSize(dev.viewport);
    } catch (e) { bad.push(name + ' ' + as + ': the site did not open (' + e.message.split('\n')[0] + ')'); continue; }
    try {
      /* the screens: the one the app opens on, each screen it has, and (signed in) every Settings form drawn on the page */
      const ids = await pg.evaluate(() => (typeof SCREENS === 'object' ? Object.keys(SCREENS) : []));
      const stops = ['(opening)'].concat(ids, as === 'none' ? [] : ['(settings forms)']);
      for (const stop of stops) {
        const boxes = await pg.evaluate(stop => {
          document.querySelectorAll('.kp-crawl').forEach(n => n.remove());
          if (stop === '(settings forms)' && typeof settingTypes_ === 'function') {
            const d = document.createElement('div'); d.className = 'kp-crawl';
            settingTypes_().forEach(({ col }) => { if (col) settingGroups_(col).forEach(g => { d.insertAdjacentHTML('beforeend', g.pages.join('')); }); });
            (document.querySelector('main') || document.body).prepend(d);
          } else if (stop !== '(opening)') { try { go(stop, false, true); } catch (e) { /* a screen this role cannot open */ } }
          return true;
        }, stop);
        void boxes;
        await pg.waitForTimeout(stop === '(opening)' ? 100 : 500);
        const list = await pg.evaluate(() => {
          const text = el => el.classList.contains('kp-in') || el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(|text|search|email|url|tel|password|number)$/i.test(el.getAttribute('type') || ''))
            || /^(|true|plaintext-only)$/i.test(el.getAttribute('contenteditable') || 'x');
          const all = [...document.querySelectorAll('input, textarea, [contenteditable]')].filter(el => !el.closest('#kp') && text(el) && !el.disabled);
          return all.map((el, i) => { el.setAttribute('data-kp-crawl', i); const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
            const shown = el.classList.contains('kp-in') ? el.parentNode.getBoundingClientRect() : r;
            return { i, bound: el.classList.contains('kp-in') || el.hasAttribute('data-kpb'), mode: el.getAttribute('inputmode'),
              seen: shown.width > 0 && shown.height > 0 && cs.visibility !== 'hidden' && !el.closest('[hidden]'),
              ro: !el.classList.contains('kp-in') && el.readOnly, what: (el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.name || el.className || el.tagName).slice(0, 40) }; });
        });
        seen.screens++;
        for (const b of list) {
          seen.boxes++;
          if (!b.bound || b.mode !== 'none') bad.push(name + ' ' + as + ' ' + stop + ': the box "' + b.what + '" does not take the one keyboard');
        }
        /* each box in sight tapped (a few a screen): the keyboard opens on it */
        for (const b of list.filter(b => b.seen && b.bound && !b.ro).slice(0, 4)) {
          try { await pg.evaluate(() => { if (typeof kpClose_ === 'function') kpClose_(); if (document.activeElement) document.activeElement.blur(); });
            await pg.locator('[data-kp-crawl="' + b.i + '"]').first().click({ timeout: 2500, force: true }); } catch (e) { continue; }
          await pg.waitForTimeout(150);
          const got = await pg.evaluate(({ i, min }) => {
            const pad = document.getElementById('kp'), el = document.querySelector('[data-kp-crawl="' + i + '"]');
            if (!pad || pad.hidden || !el) return null;
            const keys = [...pad.querySelectorAll('.kp-key')], pr = pad.getBoundingClientRect();
            const box = (el.classList.contains('kp-in') ? el.parentNode : el).getBoundingClientRect();
            return { sig: keys.map(e => e.getAttribute('data-v')).slice(0, 69).join('|'), at: KP_AT === el,
              small: keys.filter(e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height) < min; }).length,
              out: keys.filter(e => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1 || r.bottom > innerHeight + 1; }).length,
              under: box.height > 0 && box.top < pr.top && box.bottom > pr.top + 2 };
          }, { i: b.i, min: KP_MIN });
          seen.tapped++;
          if (!got || !got.at) { bad.push(name + ' ' + as + ' ' + stop + ': the box "' + b.what + '" tapped, the keyboard did not open on it'); continue; }
          if (got.sig !== ref) bad.push(name + ' ' + as + ' ' + stop + ': the box "' + b.what + '" opens a keyboard not in the one layout');
          if (got.small) bad.push(name + ' ' + as + ' ' + stop + ': ' + got.small + ' key(s) under ' + KP_MIN + 'px');
          if (got.out) bad.push(name + ' ' + as + ' ' + stop + ': ' + got.out + ' key(s) off the screen');
          if (got.under) bad.push(name + ' ' + as + ' ' + stop + ': the keyboard covers the box "' + b.what + '"');
          if (process.env.KP_SHOTS && as === 'none' && seen.tapped < 3) await pg.screenshot({ path: path.join(process.env.KP_SHOTS, 'keypad-' + name.replace(/\W+/g, '-') + '-welcome.png') });
        }
      }
    } catch (e) { bad.push(name + ' ' + as + ': ' + e.message.split('\n')[0]); }
    await pg.close();
  }
  if (!seen.tapped) bad.push(name + ': no box was tapped -- the crawl found nothing to type in');
  console.log('keypad-taps: ' + name + ', ' + seen.screens + ' screens (signed out, child, admin, Settings forms): ' + seen.boxes + ' boxes bound, ' + seen.tapped + ' tapped open the one keyboard');
  return bad;
}

/* ---------- ON AN iPHONE, WHERE THE CHILD SEES IT (owner 23 Nov: "Keyboard not working on phone on site. It's like offset up"): iPhone 13
   Safari upright and on its side, the home bar under it, and the screen as Safari pans it when a box is focused (the seen part of the page
   short of the layout's foot): every key drawn inside what is seen, the pad's foot on the seen screen's foot, and a tap on each key's centre
   landing on that key (elementFromPoint). Chromium cannot pan, so the pan is `visualViewport` as Safari reports it. */
async function onIphone(SB) {
  const bad = [];
  const cases = [['iPhone upright', { width: 390, height: 664 }, 0, 34], ['iPhone upright, Safari panned for the box', { width: 390, height: 664 }, 120, 34],
    ['iPhone on its side', { width: 750, height: 342 }, 0, 21], ['iPhone on its side, panned', { width: 750, height: 342 }, 12, 21]];
  for (const [name, vp, pan, safe] of cases) {
    let pg;
    try { pg = await SB.open({ as: 'child', settle: 300 }); await pg.setViewportSize(vp); } catch (e) { bad.push(name + ': the site did not open (' + e.message.split('\n')[0] + ')'); continue; }
    try {
      const got = await pg.evaluate(({ pan, safe }) => {
        document.documentElement.style.setProperty('--safe-bottom', safe + 'px');
        const real = window.visualViewport, H = innerHeight, W = innerWidth;
        if (pan) {
          const fake = Object.assign(new EventTarget(), { offsetTop: 0, offsetLeft: 0, pageTop: scrollY, scale: 1, width: W, height: H - pan });
          Object.defineProperty(window, 'visualViewport', { configurable: true, value: fake });
        }
        const d = document.createElement('div'); d.className = 'kp-iphone';
        d.innerHTML = '<div class="qp-ans-row qp-bar"><label class="qp-ans qp-ans-maths">' + kpField_('kp-iphone', '', 'maths', 3) + '</label></div>';
        (document.querySelector('main') || document.body).prepend(d);
        const inp = d.querySelector('.kp-in'); inp.focus(); kpOpen_(inp);
        const vv = window.visualViewport, top = vv.offsetTop, foot = vv.offsetTop + vv.height;
        const pad = document.getElementById('kp'), pr = pad.getBoundingClientRect();
        const keys = [...pad.querySelectorAll('.kp-key')];
        const out = [], miss = [];
        keys.forEach((k, i) => {
          const r = k.getBoundingClientRect();
          if (r.top < top - 1 || r.bottom > foot + 1 || r.left < -1 || r.right > W + 1) out.push(k.getAttribute('data-v') || i);
          const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          if (!at || at.closest('.kp-key') !== k) miss.push(k.getAttribute('data-v') || i);
        });
        if (pan) Object.defineProperty(window, 'visualViewport', { configurable: true, value: real });
        return { n: keys.length, out, miss, gap: Math.round(foot - pr.bottom) };
      }, { pan, safe });
      if (!got.n) bad.push(name + ': no keyboard opened');
      if (got.out.length) bad.push(name + ': ' + got.out.length + ' key(s) drawn outside the seen screen (' + got.out.slice(0, 8).join(' ') + ')');
      if (got.miss.length) bad.push(name + ': a tap on ' + got.miss.length + ' key(s) lands elsewhere (' + got.miss.slice(0, 8).join(' ') + ')');
      if (Math.abs(got.gap) > 1) bad.push(name + ': the keyboard\'s foot is ' + got.gap + 'px off the seen screen\'s foot');
      if (process.env.KP_SHOTS) await pg.screenshot({ path: path.join(process.env.KP_SHOTS, 'keypad-' + name.replace(/\W+/g, '-') + '.png') });
    } catch (e) { bad.push(name + ': ' + e.message.split('\n')[0]); }
    await pg.close();
  }
  console.log('keypad-taps: iPhone 13 upright and on its side, still and panned: every key inside the seen screen, tapped where drawn');
  return bad;
}

async function run(o) {
  const opts = Object.assign({ floor: process.argv.includes('--floor'), show: Number((process.argv.find(a => /^--show=/.test(a)) || '=0').split('=')[1]) }, o || {});
  const app = VQ.appCode(), P = pad(app);
  let bad = forms(app, P).concat(oneLayout(app, P));
  /* TWO WAYS TO ANSWER, type and draw: the old pick face may not come back */
  if ([...app.call('QT_FACES')].indexOf('pick') >= 0) bad.push('QT_FACES still has the pick face');
  if (fs.existsSync(path.join(ROOT, 'data-private', 'questions.json'))) bad = bad.concat(library(app, P, opts));
  else console.log('keypad-taps: no data-private here, the library sample skipped');
  bad = bad.concat(tables(app, P));
  if (!process.argv.includes('--no-browser')) bad = bad.concat(await browser());
  report('keypad-taps', bad, 'keypad failure(s)');
}
module.exports = { run, FORMS };
main(module, run);
