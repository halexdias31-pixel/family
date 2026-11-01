#!/usr/bin/env node
/* @family. — check/press-twice.js ONE PRESS, ONE ACTION (534): two real taps 110 ms apart on every control on the glass, in every states.js state, with every POST held 1.5 s. */
/* double-tap: no action is posted twice. arm: a control that asks first is still asking, with 0 POSTs, after a yes at ~375 ms (under sure_'s 400), and a yes at 1 s posts exactly once. */
/* Visitors student and admin at 390 only: not 320 or 1280 (the dispatcher reads no width), not signed out. A student's member-only Find states never arrive (notes). */
/* --as=<visitor> --screen=<id,id> -v. Port: TWICE_PORT. */
'use strict';
require('./quiet');
const glass = require('./glass.js');
const { statesOf } = require('./states.js');

const HOLD_MS = 1500;
/* THE TAP GAP the audit measured a double tap at, and when the third press lands: past the dispatcher's 350 ms, inside sure_'s 400 ms. */
const GAP_MS = 110, EARLY_YES_MS = 375, LATE_YES_MS = 1000;

/* NOT PRESSED, each with its reason, and still printed. */
const ACCEPTED = {
  signout: 'ends the session every later press in this run depends on; it posts nothing to repeat.',
  'reload-build': 'reloads the page, which ends the run\'s page with it.',
  retry: 'asks for the payload again (a GET); a second retry is a second ask for the same thing, not a second action.',
};
const SKIP_TAGS = /^(SELECT|INPUT|TEXTAREA)$/;

/* STUBS A PRESS MUST NOT REACH: a print dialogue, a new window or a reload would stop the page under the run. */
function guards() {
  window.print = () => {}; window.open = () => null; window.alert = () => {}; window.confirm = () => true; window.prompt = () => '';
  window.__tw = { posts: [], clicks: [] };
  /* THE SAME CONTROL, EVEN REDRAWN: its kind, action and data less the arming marks — the dispatcher's own rule, kept here so a mutation of it cannot blind the check. */
  __tw.key = el => { let k = (String(el.getAttribute('class') || '').trim().split(/\s+/)[0] || el.tagName) + ':' + (el.getAttribute('data-do') || '');
    for (const a of el.attributes) if (/^data-/.test(a.name) && !/^data-(do|sure|armed|repeat)$/.test(a.name)) k += '|' + a.name + '=' + a.value;
    return k; };
  __tw.roots = () => {
    const sh = document.getElementById('sheet');
    const open = sh && !sh.classList.contains('hidden');
    return [document.querySelector('#s-' + AT + ' > .page.on'), open ? sh : null].filter(Boolean);
  };
  __tw.find = key => { for (const r of __tw.roots()) for (const el of r.querySelectorAll('[data-do]')) if (__tw.key(el) === key) return el; return null; };
  __tw.armed = el => !!el && (el.hasAttribute('data-sure') || el.hasAttribute('data-armed') || el.classList.contains('is-sure') || el.classList.contains('is-armed'));
  addEventListener('click', e => { const d = e.target && e.target.closest && e.target.closest('[data-do]'); if (d) __tw.clicks.push({ key: __tw.key(d), t: performance.now() }); }, true);
}

/* EVERY CONTROL A FINGER CAN REACH on the card in front and an open sheet, one per action. */
const controlsOnGlass = (page, repeat) => page.evaluate(([skip, rep]) => {
  const seen = new Set(), out = [];
  __tw.roots().forEach((r, i) => r.querySelectorAll('[data-do]').forEach(el => {
    const act = el.getAttribute('data-do');
    if (seen.has(act) || new RegExp(skip).test(el.tagName) || el.disabled || el.hasAttribute('data-repeat') || rep.indexOf(act) !== -1) return;
    const b = el.getBoundingClientRect();
    if (b.width < 4 || b.height < 4) return;
    seen.add(act);
    out.push({ act, key: __tw.key(el), sheet: i > 0 || r.id === 'sheet' });
  }));
  return out;
}, [SKIP_TAGS.source, repeat]);

/* ON THE GLASS AND UNDER THE FINGER: scrolled into its own vertical scroller (never the row of columns), then hit-tested at its centre. */
const aim = (page, key) => page.evaluate(async key => {
  const el = __tw.find(key);
  if (!el) return { miss: 'gone' };
  for (let p = el.parentElement; p && p.id !== 'screen'; p = p.parentElement) {
    const cs = getComputedStyle(p);
    if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 1) {
      const b = el.getBoundingClientRect(), pb = p.getBoundingClientRect();
      if (b.top < pb.top || b.bottom > pb.bottom) p.scrollTop += (b.top + b.height / 2) - (pb.top + pb.height / 2);
      break;
    }
  }
  const t0 = performance.now();
  while (typeof SLIDE_UNTIL !== 'undefined' && performance.now() < SLIDE_UNTIL && performance.now() - t0 < 2000) await new Promise(r => setTimeout(r, 30));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const b = el.getBoundingClientRect();
  const x = b.left + b.width / 2, y = b.top + Math.min(b.height / 2, 20);
  if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return { miss: 'off the glass' };
  const hit = document.elementFromPoint(x, y);
  if (!hit || !(el === hit || el.contains(hit))) return { miss: 'covered by ' + (hit ? hit.tagName.toLowerCase() + '.' + String(hit.className || '').split(' ')[0] : 'nothing') };
  return { x, y };
}, key);

async function enter(page, sid, state) {
  await page.evaluate(sid => { try { closeSheet(); } catch (e) {} try { go(sid, false, true); } catch (e) {} }, sid);
  await page.waitForTimeout(300);
  if (state.only && !(await page.evaluate(src => { try { return !!eval('(' + src + ')')(); } catch (e) { return false; } }, String(state.only)))) return 'not this visitor\'s';
  if (state.enter) {
    const ok = await page.evaluate(src => { try { eval('(' + src + ')')(); return true; } catch (e) { return String(e && e.message || e); } }, String(state.enter));
    if (ok !== true) return 'could not enter: ' + ok;
    await page.waitForTimeout(340);
  }
  if (state.expect) {
    const got = await page.evaluate(async src => {
      const t0 = performance.now();
      for (;;) { let ok = false; try { ok = !!eval('(' + src + ')')(); } catch (e) {}
        if (ok || performance.now() - t0 > 2500) return ok; await new Promise(r => setTimeout(r, 100)); }
    }, String(state.expect));
    if (!got) return 'did not arrive';
  }
  return '';
}

const tally = posts => posts.reduce((m, p) => { m[p] = (m[p] || 0) + 1; return m; }, {});
const twiceOf = posts => Object.entries(tally(posts)).filter(([, n]) => n > 1).map(([a, n]) => `\`${a}\` ×${n}`);

async function main() {
  const AS = glass.arg('as'), ONLY = (glass.arg('screen') || '').split(',').filter(Boolean);
  const server = await glass.serve('TWICE_PORT');
  const port = server.address().port;
  const { chromium } = require('playwright');
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.error('press-twice: no browser — ' + e.message); server.close(); process.exit(2); }
  const fail = [], notes = [], armedSeen = [];
  let pressed = 0, unreached = 0;
  try {
    for (const v of glass.VIEWERS.filter(x => x.as !== 'out' && (!AS || x.as === AS))) {
      const s = await glass.open(browser, port, v, 390, 844, { init: guards });
      const page = s.page;
      try {
        if (!s.ready) { fail.push(`${v.as}: the payload or the library never arrived — nothing pressed`); continue; }
        /* EVERY POST HELD 1.5 s, as a slow sheet holds it, and counted by its action; a GET (the payload) passes. */
        await page.route('**://script.google.com/**', async r => {
          if (r.request().method() !== 'POST') return r.fallback();
          let act = '?'; try { act = JSON.parse(r.request().postData() || '{}').action || '?'; } catch (e) {}
          await page.evaluate(a => { __tw.posts.push(a); __tw.out = (__tw.out || 0) + 1; }, act).catch(() => {});
          await new Promise(ok => setTimeout(ok, HOLD_MS));
          await page.evaluate(() => { __tw.out--; }).catch(() => {});
          return r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }).catch(() => {});
        });
        const repeat = await page.evaluate(() => (typeof PRESS_REPEAT_ !== 'undefined' ? [...PRESS_REPEAT_] : []));
        /* A NAME IN THE REPEAT LIST WITH NO HANDLER is a misspelling that silently guards the real one. */
        (await page.evaluate(r => r.filter(a => !ACTIONS[a]), repeat)).forEach(a => fail.push(`PRESS_REPEAT_ names ${a}, which no on() registers`));
        const screens = ONLY.length ? ONLY : await page.evaluate(() => TABS.map(t => t.id));
        for (const sid of screens) {
          const done = new Set();
          for (const state of statesOf(sid)) {
            const where = `${v.as} ${sid}${state.name ? ' · ' + state.name : ''}`;
            const no = await enter(page, sid, state);
            if (no) { if (!/not this visitor/.test(no)) notes.push(`${where}: ${no} — nothing pressed here`); continue; }
            const list = (await controlsOnGlass(page, repeat)).filter(c => !done.has(c.act));
            for (const c of list) {
              if (ACCEPTED[c.act]) { done.add(c.act); continue; }
              let at = await aim(page, c.key);
              /* BACK INTO THE STATE ONCE, since an earlier press may have moved the page on. */
              if (at.miss) { await enter(page, sid, state); at = await aim(page, c.key); }
              if (at.miss) { unreached++; if (process.env.VERBOSE) notes.push(`${where}: ${c.act} not pressed — ${at.miss}`); continue; }
              done.add(c.act);
              if (process.env.VERBOSE) notes.push(`${where}: double-tapped ${c.act}`);
              await page.evaluate(() => { __tw.posts = []; __tw.clicks = []; });
              const t0 = Date.now();
              await page.touchscreen.tap(at.x, at.y);
              await page.waitForTimeout(Math.max(0, GAP_MS - (Date.now() - t0)));
              const at2 = await aim(page, c.key);
              if (!at2.miss) await page.touchscreen.tap(at2.x, at2.y);
              await page.waitForTimeout(Math.max(0, 300 - (Date.now() - t0)));
              pressed++;
              const first = await page.evaluate(key => ({ posts: __tw.posts.slice(), armed: __tw.armed(__tw.find(key)),
                                                          clicks: __tw.clicks.filter(x => x.key === key).map(x => x.t) }), c.key);
              if (first.clicks.length < 2 && !at2.miss) notes.push(`${where}: ${c.act} — ${first.clicks.length} of 2 taps became clicks`);
              const twice = twiceOf(first.posts);
              if (twice.length) fail.push(`${where}: a double tap on ${c.act} posted ${twice.join(', ')}`);
              if (first.armed) {
                armedSeen.push(c.act);
                if (first.posts.length) fail.push(`${where}: ${c.act} asks first, yet posted ${first.posts.join(', ')} before the yes`);
                /* THE EARLY YES AND THE LATE ONE, timed in the page from the first tap's click. */
                const arm = await page.evaluate(async ([key, early, late, t1]) => {
                  const wait = ms => new Promise(r => setTimeout(r, Math.max(0, ms)));
                  const press = () => { const el = __tw.find(key); if (el) el.click(); return el; };
                  await wait(t1 + early - performance.now());
                  const sent = performance.now() - t1;
                  press();
                  await wait(60);
                  const early_ = { at: Math.round(sent), posts: __tw.posts.slice(), armed: __tw.armed(__tw.find(key)) };
                  await wait(t1 + late - performance.now());
                  press();
                  await wait(400);
                  return { early: early_, late: __tw.posts.slice() };
                }, [c.key, EARLY_YES_MS, LATE_YES_MS, first.clicks[0] || 0]);
                if (arm.early.at > 398) notes.push(`${where}: ${c.act} — the early yes landed at ${arm.early.at} ms, too late to test sure_'s 400 ms`);
                else if (arm.early.posts.length || !arm.early.armed) fail.push(`${where}: a yes ${arm.early.at} ms after arming ${c.act} ${arm.early.posts.length ? 'posted ' + arm.early.posts.join(', ') : 'disarmed it'} (under 400 ms must be ignored)`);
                else if (arm.late.length !== 1) fail.push(`${where}: the yes at ${LATE_YES_MS} ms on ${c.act} posted ${arm.late.length} times (${arm.late.join(', ') || 'nothing'}), not once`);
              }
              /* WAIT OUT WHAT IS HELD, so the next control's count is its own. */
              await page.waitForFunction(() => !__tw.out, null, { timeout: HOLD_MS * 4 }).catch(() => {});
              await page.waitForTimeout(150);
            }
            if (state.leave) await page.evaluate(src => { try { eval('(' + src + ')')(); } catch (e) {} }, String(state.leave));
          }
        }
        if (s.errors.length) notes.push(`${v.as}: page errors — ${s.errors.slice(0, 3).join(' | ')}`);
      } finally { await s.ctx.close(); }
    }
  } finally { await browser.close(); server.close(); }
  if (!pressed) fail.push('nothing was pressed — the run reached no control, so nothing was measured');
  if (!armedSeen.length && !ONLY.length) fail.push('no control that asks first was reached — the arm half measured nothing');
  Object.keys(ACCEPTED).forEach(a => notes.push(`not pressed: ${a} — ${ACCEPTED[a]}`));
  if (notes.length) { console.log(`press-twice: notes (${notes.length}):`); notes.forEach(n => console.log('  ' + n)); }
  if (fail.length) { console.error(`press-twice: ${fail.length} finding(s)`); fail.forEach(f => console.error('  ! ' + f)); process.exit(1); }
  console.log(`press-twice: one press is one action — ${pressed} controls double-tapped, ${armedSeen.length} that ask first (${[...new Set(armedSeen)].join(', ')}), ${unreached} not reachable by a finger`);
}
main().catch(e => { console.error('press-twice: ' + e.stack); process.exit(2); });
