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

/* ---------- THE PAD IN NODE: a box as the page has one, typed through kpEdit_ */
function pad(app) {
  const { ctx, call } = app;
  if (!ctx.Event) ctx.Event = class Event { constructor(t) { this.type = t; } };
  const faceOf = (acc, words, layer) => { ctx.__acc = acc; ctx.__w = !!words; ctx.__l = layer || (words ? 'abc' : 'maths');
    const h = call('kpPadHtml_(__l, __w, true, false, true, "", __acc)');
    return [...h.matchAll(/data-v="([^"]*)"/g)].map(m => m[1].replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')); };
  const type = (taps, words, attrs) => {
    ctx.__taps = taps; ctx.__w = !!words; ctx.__at = attrs || {};
    return call('(function () { const at = { a: 0, b: 0 }; const inp = { value: "", nodeType: 1, get selectionStart() { return at.a; }, get selectionEnd() { return at.b; },'
      + ' setSelectionRange(a, b) { at.a = a; at.b = b; }, getAttribute(n) { return n === "data-kp" ? (__w ? "words" : "maths") : n === "data-k" ? "kp-taps" : n in __at ? __at[n] : null; },'
      + ' hasAttribute() { return false; }, classList: { contains: c => c === "kp-in" }, dispatchEvent() {} };'
      + ' for (const t of __taps) kpEdit_(inp, __w && KP_WORD_SIGN[t] ? KP_WORD_SIGN[t] : t); return inp.value; })()');
  };
  return { faceOf, type };
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
        const taps = idx.map(n => '!pick:' + L[n - 1]), face = P.faceOf(L, true, 'letters');
        const missing = taps.filter(k => !face.includes(k));
        const v = P.type(taps, true, keys);
        ctx.__a = v;
        let right = false; try { right = call('mark_(__x, __a)').verdict === 'right'; } catch (e) { right = false; }
        if (face.some(f => !/^!(pick:|left|right|back|done)/.test(f))) missing.push('a key that is no option: ' + face.filter(f => !/^!(pick:|left|right|back|done)/.test(f)).join(' '));
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

/* ---------- ON A PHONE AND AN iPAD: the drawn keys tapped */
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
          d.innerHTML = '<div class="qp-ans-row qp-bar"><label class="qp-ans qp-ans-maths">' + kpField_('kp-taps-' + Math.random(), '', 'maths', 3) + '</label></div>';
          (document.querySelector('main') || document.body).prepend(d);
          const inp = d.querySelector('.kp-in'); inp.focus(); kpOpen_(inp);
          return [...document.querySelectorAll('#kp .kp-key')].map(e => e.getAttribute('data-v'));
        }, key);
        const turners = setup.filter(v => LAYERS.test(v || ''));
        if (turners.length) bad.push(name + ' ' + what + ': a key turns the pad over (' + turners.join(' ') + ')');
        let missing = '';
        for (const t of taps) {
          const i = setup.indexOf(t);
          if (i < 0) { missing = t; break; }
          await pg.locator('#kp .kp-key').nth(i).click({ timeout: 3000 });
        }
        const got = await pg.evaluate(k => {
          const inp = document.querySelector('.kp-taps .kp-in'), box = document.querySelector('.kp-taps .qp-ans');
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
        if (way.length < 12 && got.w > got.vw * 0.75) bad.push(name + ' ' + what + ': a short answer\'s box is ' + Math.round(got.w) + 'px of ' + got.vw);
      }
      /* OPTIONS: a pick-several part's letters keypad, D then A tapped, is A,D -- and has no key but its letters and ← → ⌫ done */
      const keys = await pg.evaluate(() => {
        document.querySelectorAll('.kp-taps').forEach(n => n.remove());
        const d = document.createElement('div');
        d.className = 'qp-mark qp-compose kp-taps';
        d.innerHTML = '<div class="qp-ans-row qp-bar"><label class="qp-ans">' + kpField_('kp-taps-pick', '', 'words', 3, null, { 'data-kp-letters': 'ABCD', 'data-kp-pick': 'set' }) + '</label></div>';
        (document.querySelector('main') || document.body).prepend(d);
        const inp = d.querySelector('.kp-in'); inp.focus(); kpOpen_(inp);
        return [...document.querySelectorAll('#kp .kp-key')].map(e => e.getAttribute('data-v'));
      });
      for (const t of ['!pick:D', '!pick:A', '!pick:D']) { const i = keys.indexOf(t); if (i >= 0) await pg.locator('#kp .kp-key').nth(i).click({ timeout: 3000 }); else bad.push(name + ': no option key ' + t); }
      const picked = await pg.evaluate(() => document.querySelector('.kp-taps .kp-in').value);
      if (picked !== 'A,D') bad.push(name + ': pick several D, A, D gave ' + JSON.stringify(picked) + ', not "A,D"');
      const other = keys.filter(v => !/^!(pick:|left|right|back|done)/.test(v || ''));
      if (other.length) bad.push(name + ': the options keypad has other keys (' + other.join(' ') + ')');
      if (process.env.KP_SHOTS) await pg.screenshot({ path: path.join(process.env.KP_SHOTS, 'keypad-' + name.replace(/\W+/g, '-') + '.png') });
      await pg.evaluate(() => { const i = document.querySelector('.kp-taps .kp-in'); if (i) { i.blur(); kpClose_(); } });
    } catch (e) { bad.push(name + ': ' + e.message.split('\n')[0]); }
    await pg.close();
  }
  await SB.done();
  console.log('keypad-taps: ' + sizes.length + ' screens, ' + FORMS.length + ' forms tapped on the drawn keys');
  return bad;
}

async function run(o) {
  const opts = Object.assign({ floor: process.argv.includes('--floor'), show: Number((process.argv.find(a => /^--show=/.test(a)) || '=0').split('=')[1]) }, o || {});
  const app = VQ.appCode(), P = pad(app);
  let bad = forms(app, P);
  /* TWO WAYS TO ANSWER, type and draw: the old pick face may not come back */
  if ([...app.call('QT_FACES')].indexOf('pick') >= 0) bad.push('QT_FACES still has the pick face');
  if (fs.existsSync(path.join(ROOT, 'data-private', 'questions.json'))) bad = bad.concat(library(app, P, opts));
  else console.log('keypad-taps: no data-private here, the library sample skipped');
  if (!process.argv.includes('--no-browser')) bad = bad.concat(await browser());
  report('keypad-taps', bad, 'keypad failure(s)');
}
module.exports = { run, FORMS };
main(module, run);
