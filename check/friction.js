#!/usr/bin/env node
/* @family. — check/friction.js HOW FRICTIONLESS IS IT (1040 batch G): the core journeys walked at 390x844 on the fixture, as a parent, */
/*   a tutor and a student — taps, screens, typed fields, waits on loading_, dead ends, errors, and whether it can be done at all.  */
/*   Each journey is a list of steps; a step it cannot find is a finding naming that step, and the walk goes on by code so the rest */
/*   is still measured. Payment is stubbed where it leaves the site (createCheckout's URL). To data/friction-health.json, read by */
/*   tools/health.js as `friction`; the totals' budgets (structure-budgets.json `friction`) only go down, lowered here on a better walk. */
'use strict';
const fs = require('fs'), path = require('path');
const glass = require('./glass.js');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'data', 'friction-health.json');
const BP = path.join(ROOT, 'data', 'settings', 'structure-budgets.json');
const wait = ms => new Promise(r => setTimeout(r, ms));
const ONLY = process.env.FR_ONLY || '';  /* one journey by name, for a quick look; never writes the budget */
const PAY_URL = 'https://checkout.stripe.com/c/pay/friction-stub';

/* THE FIXTURE PLUS ONE SESSION the parent is in, accepted and owed, with the tutor on it — so Pay and Receipts have something to show. */
const FX = JSON.parse(glass.FIXTURE);
FX.liveJobs = (FX.liveJobs || []).concat([{ id: 'J-FR1', jobId: 'J-FR1', title: 'GCSE Maths, Tuesday 4pm', subject: 'Maths', level: 'GCSE',
  client: 'Pat Parent', tutor: 'Ada Tutor', venue: 'Colliers Wood Library', price: '30', unit: 'hour', seats: '3',
  slots: [{ client: 'Pat Parent', status: 'agreed' }], tutorSlots: [{ tutor: 'Ada Tutor', status: 'confirmed' }] }]);
const FIX = JSON.stringify(FX);
const AS = {
  parent: { token: 'fr-p', name: 'Pat Parent', personId: 'P7', person_id: 'P7', role: 'client', roles: ['client'], handle: 'pat' },
  tutor: { token: 'fr-t', name: 'Ada Tutor', personId: 'P002', person_id: 'P002', role: 'tutor', roles: ['tutor'], handle: 'ada' },
  student: Object.assign({ token: 'fr-s' }, glass.VIEWERS.find(v => v.as === 'student').user),
};

/* IN THE PAGE: a visible control by its words (label or text), Find's or a sheet's; the feed is never the way to a journey. */
const FIND_JS = (want, act) => {
  const rx = new RegExp(want, 'i');
  return [...document.querySelectorAll(act ? '[data-do="' + act + '"]' : '[data-do]')].find(e => e.getClientRects().length && !e.disabled && !e.closest('#s-feed, .post')
    && rx.test(((e.getAttribute('aria-label') || '') + ' ' + e.textContent).replace(/\s+/g, ' ')));
};

function walker(page, net) {
  const J = { taps: 0, screens: 0, fields: 0, waitMs: 0, deadEnds: [], errors: [], missing: [], steps: [] };
  let t0 = 0;
  const tapAt = async (want, act) => page.evaluate(([w, a, f]) => { const e = (new Function('return ' + f))()(w, a); if (!e) return null;
    e.scrollIntoView({ block: 'center' }); e.click(); return e.getAttribute('data-do'); }, [want, act || '', FIND_JS.toString()]);
  /* WAITS: time with a loading_() on the glass, sampled until it goes (or 8 s). */
  const settle = async () => { await wait(700); const s = Date.now();
    while (Date.now() - s < 8000 && await page.evaluate(() => [...document.querySelectorAll('.loading')].some(e => e.getClientRects().length && !e.closest('#s-feed')))) await wait(100);
    J.waitMs += Date.now() - s; };
  const W = {
    J,
    start: () => { t0 = Date.now(); },
    /* ONE TAP on a control; a menu answer is also a screen passed. */
    tap: async (step, want, act) => { const d = await tapAt(want, act);
      if (!d) { J.missing.push(step); J.steps.push(step + ': not found'); return false; }
      J.taps++; if (/^facet-|^filter-|^go$|-open$|^book-with$/.test(d)) J.screens++; J.steps.push(step); await settle(); return true; },
    /* TYPED: a field filled is a field and a tap. */
    type: async (step, sel, text) => { const ok = await page.evaluate(([s, t]) => { const e = [...document.querySelectorAll(s)].find(x => x.getClientRects().length); if (!e) return false;
      e.focus(); e.value = t; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return true; }, [sel, text]);
      if (!ok) { J.missing.push(step); J.steps.push(step + ': no field'); return false; } J.taps++; J.fields++; J.steps.push(step); return true; },
    /* FROM THE TOP: Find's answers cleared, as a person would start again (one tap when anything was picked). */
    fresh: async () => { const any = await page.evaluate(() => !!(STUFF.filters || []).length);
      if (any) { await tapAt('Clear', 'filter-clear'); J.taps++; await settle(); }
      await page.evaluate(() => { if (typeof closeSheet === 'function') closeSheet(); go('stuff'); }); await wait(400); },
    /* A STEP THE SITE HAS NO WAY TO: named, then reached by code so the walk goes on. */
    deadEnd: async (step, js) => { J.deadEnds.push(step); J.steps.push(step + ': dead end'); if (js) { await page.evaluate(js); await settle(); } },
    has: (sel) => page.evaluate(s => [...document.querySelectorAll(s)].some(e => e.getClientRects().length && !e.closest('#s-feed')), sel),
    posted: rx => net.some(b => rx.test(b)),
    end: () => { J.ms = Date.now() - t0; return J; },
  };
  return W;
}

/* THE JOURNEYS. Each returns nothing; what it found is on W.J. */
const JOURNEYS = {
  parent: {
    'find a tutor': async W => {
      await W.tap('Find › Booking', '^\\s*Booking\\s*$', 'facet-pick');
      await W.tap('Booking › Tutors', '^\\s*Tutors\\s*$', 'facet-pick');
      if (!(await W.has('[data-do="msg-open"]'))) W.J.missing.push('a tutor card');
    },
    'book a session': async W => {
      await W.tap('Find › Booking', '^\\s*Booking\\s*$', 'facet-pick');
      /* BY REAL TAPS ONLY: the form is Find › Booking's own answer, so a missing form is the journey failing, not a shortcut. */
      if (!(await W.has('#s-stuff [data-do="book-set"]'))) { W.J.missing.push('the booking form under Find › Booking'); return; }
      for (let n = 0; n < 14 && await pickNext_(W); n++);
      await W.tap('a time', '', 'book-slot');
      if (!(await W.tap('Send', 'Send', 'book-send'))) return;
      await wait(1500);
      if (!W.posted(/"action":"(?:createJob|move)"/)) W.J.errors.push('Send sent nothing (' + (await W.said()) + ')');
    },
    'pay': async W => {
      await W.tap('Find › Booking', '^\\s*Booking\\s*$', 'facet-pick');
      await W.tap('Booking › Receipts', '^\\s*Receipts\\s*$', 'facet-pick');
      if (!(await W.tap('Pay and confirm', 'Pay', 'job-pay'))) return;
      await wait(1500);
      if (!W.paid()) W.J.errors.push('Pay did not reach the payment page');
    },
    'message the tutor': async W => {
      await W.tap('Find › Booking', '^\\s*Booking\\s*$', 'facet-pick');
      await W.tap('Booking › Tutors', '^\\s*Tutors\\s*$', 'facet-pick');
      if (!(await W.tap('Message', 'Message', 'msg-open'))) return;
      if (!(await W.type('the message', '.msg-text', 'Hello, is Tuesday still on?'))) return;
      await W.tap('Send', '', 'msg-send');
      if (!W.posted(/"action":"(?:sendMessage|message|dm)/i)) W.J.errors.push('Send posted no message');
    },
  },
  tutor: {
    'see bookings': async W => {
      await W.tap('Find › Booking', '^\\s*Booking\\s*$', 'facet-pick');
      await W.tap('Booking › Receipts', '^\\s*Receipts\\s*$', 'facet-pick');
      if (!(await W.has('.rc'))) W.J.missing.push('a session card');
    },
    'message a parent': async W => {
      /* ONE PERSON TO WRITE TO IS NO QUESTION: the funnel goes straight to their card, so that menu is not a step missed. */
      if (await W.tap('Find › Messages', '^\\s*Messages\\s*$', 'facet-pick')) {
        if (!(await W.tap('Messages › a person', 'Pat|Parent', 'facet-pick')) && await W.has('#s-stuff .msg-text')) { W.J.missing.pop(); W.J.steps.pop(); } }
      else { W.J.missing.pop(); W.J.steps.pop();
        await W.tap('Find › Booking', '^\\s*Booking\\s*$', 'facet-pick');
        await W.tap('Booking › Receipts', '^\\s*Receipts\\s*$', 'facet-pick'); }
      /* A CONVERSATION CARD IS ITS OWN COMPOSER; a session card needs its Message tile first. */
      if (!(await W.has('#s-stuff .msg-text')) && !(await W.tap('Message the parent', 'Message|Pat', 'msg-open'))) return;
      if (!(await W.type('the message', '.msg-text', 'Sam did well today.'))) return;
      await W.tap('Send', '', 'msg-send');
    },
    'set homework': async W => {
      await W.tap('Find › Practice', '^\\s*Practice\\s*$', 'facet-pick');
      await W.tap('Practice › Questions', '^\\s*Questions\\s*$', 'facet-pick');
      for (let n = 0; n < 4 && !(await W.has('#s-stuff [data-do="qp-check"]')); n++) await W.tap("Doesn't matter", "Doesn't matter", 'facet-skip');
      await W.tap('Set as homework (assign a paper or question to a student)', 'homework|assign|set (?:it|this) for|give to', '');
    },
    'see results': async W => {
      await W.tap('Find › Profiles', '^\\s*Profiles\\s*$', 'facet-pick');
      await W.tap('Profiles › Student', '^\\s*Students?\\s*$', 'facet-pick');
      await W.tap("a student's answers or marks", 'results|answers|marks|progress|submissions', '');
    },
  },
  student: {
    'open homework': async W => {
      if (!(await W.tap('Find › Homework (what my tutor set)', '^\\s*(?:Homework|Set for you|Assigned)\\s*$', 'facet-pick'))) {
        W.J.missing.pop(); W.J.steps.pop(); W.J.deadEnds.push('no homework list: a student finds a paper themselves');
        await W.tap('Find › Practice', '^\\s*Practice\\s*$', 'facet-pick');
        await W.tap('Practice › Questions', '^\\s*Questions\\s*$', 'facet-pick');
        for (let n = 0; n < 4 && !(await W.has('#s-stuff [data-do="qp-check"]')); n++) await W.tap("Doesn't matter", "Doesn't matter", 'facet-skip');
      }
      if (!(await W.has('#s-stuff [data-do="qp-check"]'))) W.J.missing.push('a question to answer');
    },
    'answer': async W => {
      await W.tap('Find › Practice', '^\\s*Practice\\s*$', 'facet-pick');
      await W.tap('Practice › Questions', '^\\s*Questions\\s*$', 'facet-pick');
      for (let n = 0; n < 4 && !(await W.has('#s-stuff [data-do="qp-check"]')); n++) await W.tap("Doesn't matter", "Doesn't matter", 'facet-skip');
      await W.tap('the answer box', 'Your answer', 'qp-ans');
      W.J.taps--; await W.type('the answer', '#s-stuff .qp-ans-in', '42');
    },
    'see result': async W => {
      await W.tap('Find › Practice', '^\\s*Practice\\s*$', 'facet-pick');
      await W.tap('Practice › Questions', '^\\s*Questions\\s*$', 'facet-pick');
      for (let n = 0; n < 4 && !(await W.has('#s-stuff [data-do="qp-check"]')); n++) await W.tap("Doesn't matter", "Doesn't matter", 'facet-skip');
      await W.type('the answer', '#s-stuff .qp-ans-in', '42');
      const before = await W.cardText();
      if (!(await W.tap('Check', '^\\s*Check\\s*$', 'qp-check'))) return;
      await wait(800);
      if ((await W.cardText()) === before) W.J.errors.push('Check showed no result');
    },
  },
};

/* THE FORM: the first unanswered visible question takes its first real answer — two taps (open, choose) and a field. */
async function pickNext_(W) {
  const page = W.page;
  W.asked = W.asked || [];
  const got = await page.evaluate(done => { const s = [...document.querySelectorAll('select[data-do="book-set"]')].find(e => e.getClientRects().length && !e.value && !e.closest('.bk-face.is-set') && e.options.length > 1 && done.indexOf(e.dataset.step) < 0);
    if (!s) return ''; const o = [...s.options].find(x => x.value); s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); return s.dataset.step + '=' + o.value; }, W.asked);
  if (!got) return false;
  W.asked.push(got.split('=')[0]);
  W.J.taps += 2; W.J.fields++; W.J.steps.push('form: ' + got); await wait(600); return true;
}

/* THE SCORE: 100 less each cost; anything impossible is 0. */
const score = j => j.missing.length ? 0 : Math.max(0, Math.round(100 - j.taps * 2 - j.fields * 3 - j.screens - j.waitMs / 200 - j.deadEnds.length * 15 - j.errors.length * 10));

(async () => {
  const server = await glass.serve('FR_PORT'), port = server.address().port;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const out = { roles: {}, totals: { taps: 0, screens: 0, fields: 0, waitMs: 0, deadEnds: 0, errors: 0, impossible: 0 }, work: [] };
  for (const role of Object.keys(JOURNEYS)) {
    out.roles[role] = {};
    for (const name of Object.keys(JOURNEYS[role]).filter(n => !ONLY || ONLY === n)) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
      const page = await ctx.newPage(), net = [], errs = [];
      let paid = false;
      page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
      await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* the walk says so */ } }, AS[role]);
      await page.route('**://checkout.stripe.com/**', r => { paid = true; return r.fulfill({ status: 200, contentType: 'text/html', body: '<p>stub</p>' }); });
      await page.route('**://script.google.com/**', r => { const post = r.request().method() === 'POST', b = post ? (r.request().postData() || '') : '';
        if (post) net.push(b);
        return r.fulfill({ status: 200, contentType: 'application/json', body: !post ? FIX : /createCheckout/.test(b) ? JSON.stringify({ url: PAY_URL }) : '{"success":true}' }); });
      await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 60000 }).catch(() => {});
      await page.evaluate(() => go('stuff'));
      await page.waitForFunction(() => typeof finderSettled_ !== 'function' || finderSettled_(), null, { timeout: 60000 }).catch(() => {});
      await wait(1200);
      const W = walker(page, net);
      W.page = page; W.paid = () => paid;
      W.said = () => page.evaluate(() => { const e = document.getElementById('book-said'); return e ? e.textContent.trim().slice(0, 120) : 'no word'; });
      W.cardText = () => page.evaluate(() => { const b = document.querySelector('#s-stuff [data-do="qp-check"]'); const c = b && b.closest('.card, .qwhole'); return c ? c.innerText : ''; });
      W.start();
      try { await JOURNEYS[role][name](W); } catch (e) { if (!/Target closed|navigat/i.test(e.message)) W.J.errors.push('the walk broke: ' + e.message.slice(0, 120)); }
      const j = W.end();
      j.errors.push(...errs.map(e => 'page error: ' + e));
      j.possible = !j.missing.length; j.score = score(j);
      out.roles[role][name] = j;
      ['taps', 'screens', 'fields', 'waitMs'].forEach(k => { out.totals[k] += j[k]; });
      out.totals.deadEnds += j.deadEnds.length; out.totals.errors += j.errors.length; out.totals.impossible += j.possible ? 0 : 1;
      const at = role + ': ' + name;
      j.missing.forEach(m => out.work.push({ kind: 'friction', where: at, say: 'cannot be done — no ' + m }));
      j.deadEnds.forEach(m => out.work.push({ kind: 'friction', where: at, say: 'dead end — ' + m }));
      j.errors.forEach(m => out.work.push({ kind: 'friction', where: at, say: m }));
      await ctx.close();
    }
  }
  await browser.close(); server.close();
  const all = [].concat(...Object.values(out.roles).map(r => Object.values(r)));
  out.score = Math.round(all.reduce((a, j) => a + j.score, 0) / (all.length || 1));
  out.count = out.work.length;
  /* THE RATCHET: a total over its budget is a finding; a better walk lowers the budget, never raises it. */
  let BJ = {}; try { BJ = JSON.parse(fs.readFileSync(BP, 'utf8')); } catch (e) { BJ = {}; }
  const B = BJ.friction || {}, next = {};
  Object.keys(out.totals).forEach(k => { const b = B[k] == null ? out.totals[k] : B[k];
    if (out.totals[k] > b + (k === 'waitMs' ? 1000 : 0)) out.work.push({ kind: 'friction', where: 'totals', say: k + ' ' + out.totals[k] + ', over its budget of ' + b });
    next[k] = Math.min(b, out.totals[k]); });
  out.count = out.work.length;
  if (!ONLY && !out.work.some(w => w.where === 'totals')) { BJ.friction = next; fs.writeFileSync(BP, JSON.stringify(BJ, null, 1) + '\n'); }
  if (!ONLY) fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  Object.keys(out.roles).forEach(r => Object.keys(out.roles[r]).forEach(n => { const j = out.roles[r][n];
    if (ONLY) console.log(j.steps.join(" | "));
    console.log(`${r}: ${n} — ${j.possible ? 'done' : 'IMPOSSIBLE'}, score ${j.score}: ${j.taps} taps, ${j.screens} screens, ${j.fields} fields, ${j.waitMs} ms waiting, ${j.deadEnds.length} dead ends, ${j.errors.length} errors`); }));
  out.work.forEach(w => console.log('friction: ' + w.where + ' — ' + w.say));
  console.log('friction: score ' + out.score + ' over ' + all.length + ' journeys');
})().catch(e => { console.error('friction: COULD NOT RUN — ' + e.message); process.exit(2); });
