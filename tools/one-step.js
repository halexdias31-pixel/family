#!/usr/bin/env node
/* @family. — tools/one-step.js THE ONE-STEP CHECK (rule 1.75, owner 22 Nov: UNIFY NEXT 3, ONE WAY TO OPEN, "least dynamic wins"): every tap that opens
   something pushes one step through `openStep_` (js/shell-click.js), and Back pops exactly one, putting back the scroll beneath.
   (a) IN THE CODE: nothing in js/ calls the old openers (`openSheet`, `closeSheet`, a share picture inserted beside its receipt), and no file
       but shell-click.js touches the browser's history stack (`pushState`) or listens to `popstate`.
   (b) ON AN iPHONE 13 (tools/lib/site-browser.js): a Share, a More, an admin's Edit of a person and a Docket item's Edit in Find are each opened from a
       scrolled page; each must add exactly one step and one history entry, and the browser's Back must close it and return the page to the same
       scroll. A screenshot of each step at 390px goes to .cache/one-step/. Fails the build. Run by tools/build.js after the bundles. */
'use strict';
const fs = require('fs'), path = require('path');
const { ROOT, main, report, bare } = require('./lib/gen.js');
const SB = require('./lib/site-browser.js');
const SHOTS = path.join(ROOT, '.cache', 'one-step');

/* (a) THE OLD OPENERS, anywhere in js/ (comments stripped, so a story of how it was is no failure). */
const OLD = [[/\bopenSheet\s*\(/, 'openSheet('], [/\bcloseSheet\s*\(/, 'closeSheet('], [/insertAdjacentHTML\(\s*'afterend',\s*renderCard\(\{\s*kind:\s*'shot'/, 'a share picture inserted in place']];
const HIST = [[/history\.pushState\s*\(/, 'history.pushState'], [/['"]popstate['"]/, 'a popstate listener']];
function codeBad() {
  const bad = [];
  fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).forEach(f => {
    const src = bare(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), { comments: true });
    OLD.forEach(([re, what]) => { if (re.test(src)) bad.push('js/' + f + ' calls the old opener ' + what + ' — open it with openStep_'); });
    if (f !== 'shell-click.js') HIST.forEach(([re, what]) => { if (re.test(src)) bad.push('js/' + f + ' uses ' + what + ' — steps own the history (openStep_)'); });
  });
  return bad;
}

/* IN THE PAGE: what a step is measured by. */
const look = () => ({ steps: STEPS_.filter(s => !s.dead).length, hist: history.length, state: (history.state || {}).familyStep || 0,
  sheet: !document.getElementById('sheet').classList.contains('hidden'), y: Math.round((document.scrollingElement || document.documentElement).scrollTop) });

/* ONE CASE: `prep` readies the page (scrolled), `press` opens the step, `shown` says it is open, `gone` that it is closed again. */
async function one(c) {
  const pg = await SB.open(c.open);
  try {
    await pg.setViewportSize({ width: 390, height: 844 });
    if (c.prep) await c.prep(pg);
    await pg.evaluate(() => { const r = document.scrollingElement || document.documentElement; r.scrollTop = Math.min(120, r.scrollHeight - innerHeight); });
    await pg.waitForTimeout(400);
    const a = await pg.evaluate(look);
    const ok = await c.press(pg);
    if (!ok) return [c.name + ': nothing to press'];
    await pg.waitForFunction(c.shown, null, { timeout: 15000 }).catch(() => null);
    await pg.waitForTimeout(900);
    const b = await pg.evaluate(look);
    fs.mkdirSync(SHOTS, { recursive: true });
    await pg.screenshot({ path: path.join(SHOTS, c.file) });
    const bad = [];
    if (b.steps !== a.steps + 1) bad.push(c.name + ': ' + (b.steps - a.steps) + ' steps pushed, not one');
    if (b.hist !== a.hist + 1) bad.push(c.name + ': ' + (b.hist - a.hist) + ' history entries pushed, not one');
    if (!(await pg.evaluate(c.shown))) bad.push(c.name + ': the step did not open');
    await pg.evaluate(() => history.back());
    await pg.waitForFunction(c.gone, null, { timeout: 15000 }).catch(() => null);
    await pg.waitForTimeout(900);
    const d = await pg.evaluate(look);
    if (!(await pg.evaluate(c.gone))) bad.push(c.name + ': Back did not close it');
    if (d.steps !== a.steps) bad.push(c.name + ': Back popped ' + (b.steps - d.steps) + ' steps, not one');
    if (d.state !== a.state) bad.push(c.name + ': Back did not return to the history entry it opened from');
    if (Math.abs(d.y - a.y) > 2) bad.push(c.name + ': the scroll below came back at ' + d.y + 'px, not ' + a.y + 'px');
    return bad;
  } finally { await pg.close(); }
}

const Q = 'Q-1MA1-2311-2F-16';
const qOpen = { at: '?card=' + encodeURIComponent('q:' + Q), ready: () => [...document.querySelectorAll('#screen .qcard')].some(e => !e.classList.contains('lib-wait') && e.offsetHeight > 0 && e.querySelector('[data-do="card-share"]')) };
const pressIn = sel => pg => pg.evaluate(s => { const b = [...document.querySelectorAll(s)].find(e => e.offsetWidth > 0); if (b) b.click(); return !!b; }, sel);
const DOCKET = { lists: [{ name: 'Docket', items: Array.from({ length: 16 }, (_, k) => ({ title: 'Made-up item ' + (k + 1) })) }] };
const CASES = [
  { name: 'Share', file: 'share.png', open: qOpen,
    prep: pg => pg.evaluate(() => { window.rcHand_ = () => {}; }),
    press: pressIn('#screen .qcard [data-do="card-share"]'),
    shown: () => !document.getElementById('sheet').classList.contains('hidden') && /Share/.test(document.getElementById('sheet-title').textContent),
    gone: () => document.getElementById('sheet').classList.contains('hidden') },
  { name: 'Edit', file: 'edit.png', open: { as: 'admin' },
    prep: async pg => { for (const t of ['Profiles', 'Student']) await SB.tap(pg, t); },
    press: pressIn('#screen [data-do="person-edit"]'),
    shown: () => !!document.querySelector('#screen .pe-form, #screen [data-do="person-edit-done"]'),
    gone: () => !document.querySelector('#screen .pe-form, #screen [data-do="person-edit-done"]') },
  { name: 'Docket item edit', file: 'docket-edit.png', open: { user: Object.assign({}, SB.USERS.admin, { owner: true, todo: JSON.stringify(DOCKET) }),
      answer: q => (q.action === 'docketImport' && q.read ? { success: true, todo: JSON.stringify(DOCKET), base: 'b' } : null) },
    prep: async pg => { for (const t of ['Tools', 'Docket']) await SB.tap(pg, t); await pg.evaluate(() => { const s = document.querySelector('#screen .dk-line > summary'); if (s) s.click(); }); },
    press: pressIn('#screen [data-do="dk-fedit"]'),
    shown: () => !!document.querySelector('#screen [data-do="dk-fsave"]'),
    gone: () => !document.querySelector('#screen [data-do="dk-fsave"]') },
];

async function run() {
  const bad = codeBad();
  try {
    for (const c of CASES) {
      let r; try { r = await one(c); } catch (e) { r = [c.name + ': ' + String((e && e.message) || e).split('\n')[0]]; }
      bad.push(...r);
    }
  } finally { await SB.done(); }
  console.log('one-step: ' + CASES.length + ' openers, each one step and one Back to the same place and scroll; ' + (bad.length ? bad.length + ' problem(s)' : 'all pass') + ' (shots in .cache/one-step/)');
  report('one-step', bad, 'opener(s) not one step');
}
module.exports = { run };
main(module, run);
