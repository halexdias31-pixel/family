#!/usr/bin/env node
/* @family. — check/chips-settings.js TWO OWNER CHECKS IN ONE 390x844 WALK (1040 r12), written to data/chips-settings-health.json for tools/health.js. */
/*   chip-size      a chosen chip (Practice ✕), a menu answer (Foundation) and a card's tag pill share one size: font-size, padding, height and */
/*                  radius, as the browser computes them; a tappable one keeps a 44px hit area in its invisible ::before. Mutation-proven in the */
/*                  walk: a chip's font-size changed by a stylesheet must be caught.                                                             */
/*   settings-work  every visible settings box (data-me) of every settings column, as an admin and as a student: changed, Saved, the page */
/*                  reloaded with the profile read back from the (fake, stateful) server only — the save must send the new value and the box */
/*                  must show it after the reload. A backend that drops a field is not tested here: the fake keeps what it is sent.          */
'use strict';
const fs = require('fs'), path = require('path');
const glass = require('./glass.js');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'data', 'chips-settings-health.json');
const SHOTS = process.env.CS_SHOTS || '';
const COLS = ['staff', 'site', 'account', 'family', 'biz'];
const wait = ms => new Promise(r => setTimeout(r, ms));

/* WHAT EACH PILL MEASURES, in the page: the text's font-size, the pill's padding, height and radius, and the hit area a finger gets. */
function measure() {
  const one = (pill, text) => { if (!pill) return null; const s = getComputedStyle(pill), b = pill.getBoundingClientRect(), bf = getComputedStyle(pill, '::before');
    const inset = bf.content && bf.content !== 'none' && bf.position === 'absolute' ? parseFloat(bf.top) || 0 : 0;
    return { fs: getComputedStyle(text || pill).fontSize, pad: s.paddingTop + ' ' + s.paddingRight, h: Math.round(b.height * 10) / 10, r: s.borderTopLeftRadius, hit: Math.round(b.height - 2 * inset) }; };
  const ans = document.querySelector('#s-stuff .answers [data-do="facet-pick"]');
  return { tag: one(document.querySelector('#s-stuff .qcard-tags .qtag')), chip: one(document.querySelector('#s-stuff .chips .chip.sm')),
    answer: one(ans, ans && ans.querySelector('.k')) };
}
function chipWork(m, label) {
  const W = [];
  ['tag', 'chip', 'answer'].forEach(k => { if (!m[k]) W.push({ kind: 'chip-size', where: label, say: `no ${k} drawn to measure` }); });
  if (W.length) return W;
  ['fs', 'pad', 'h', 'r'].forEach(p => ['chip', 'answer'].forEach(k => { if (String(m[k][p]) !== String(m.tag[p]))
    W.push({ kind: 'chip-size', where: label, say: `${k} ${p} ${m[k][p]} is not the tag pill's ${m.tag[p]}` }); }));
  ['chip', 'answer'].forEach(k => { if (m[k].hit < 44) W.push({ kind: 'chip-size', where: label, say: `${k} hit area ${m[k].hit}px, under 44px` }); });
  return W;
}

/* A NEW VALUE FOR A BOX: one its own checks accept, and never the value it holds. */
function newValue(el) {
  const k = (el.dataset && el.dataset.me) || el.name, t = el.type, was = el.value;
  if (t === 'checkbox') return !el.checked;
  if (el.tagName === 'SELECT') { const o = [...el.options].map(o => o.value).filter(v => v && v !== was); return o.length ? o[Math.min(1, o.length - 1)] : null; }
  const by = { dob_d: '14', dob_m: '5', dob_y: '2010', email: 'new.address@example.org', postcode: 'AB1 2CD', phone_no: '7700900123',
    years_experience: '7', travel_km: '9', rate_per_hour: '31', min_students: '1', max_students: '4', extra_seat_rate: '6', extra_seat_cut: '2' };
  if (by[k]) return by[k] === was ? by[k] + '1' : by[k];
  if (t === 'date') return '2027-05-14';
  if (t === 'number') return String((Number(was) || 0) + 3);
  if (t === 'url') return 'https://example.org/p' + k + '.png';
  if (t === 'tel') return '7700900123';
  return 'Test ' + k.replace(/_/g, ' ');
}

/* A COLUMN'S SETTINGS, where they are drawn now: its own screen while it is on, else every Find › Settings item from it, drawn on the page as Find draws it. */
async function colSettings(col) {
  const old = document.getElementById('cs-host'); if (old) old.remove();
  try { go(col); } catch (e) { /* a column switched off lives in Find */ }
  await new Promise(r => setTimeout(r, 2500));
  const s = document.getElementById('s-' + col);
  if (s && s.offsetParent !== null && s.querySelector('.me-form')) return s;
  /* EACH PART INTO THE PAGE AS IT IS BUILT, as Find paints: a form not yet in the page can lose the copy it was drawn from (`cardDrawn_`). */
  const h = document.createElement('div'); h.id = 'cs-host'; document.body.prepend(h);
  try { inFinder_(FINDER, () => settingDoorItems_().forEach(x => (x.parts || []).filter(p => p.col === col).forEach(p => h.insertAdjacentHTML('beforeend', settingPart_(p))))); } catch (e) { /* none drawn reads as no settings */ }
  if (!h.children.length) { h.remove(); return null; }
  return h;
}

(async () => {
  const server = await glass.serve('CS_PORT'), port = server.address().port;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const work = [], settings = [], errors = [];
  let chips = null;
  for (const as of ['admin', 'student']) {
    /* A SIGNED-IN SESSION HAS A TOKEN, AND THE SHEET'S ROW HAS EVERY COLUMN (phone_cc is how the site knows it is the whole row, profileShapeOk_). */
    const user = Object.assign({ token: 'cs-token' }, glass.VIEWERS.find(v => v.as === as).user), store = { phone_cc: '+44' }, sent = [];
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(as + ': ' + String(e.message).slice(0, 160)));
    await page.addInitScript(u => { try { if (!localStorage.getItem('familyUser')) localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* the walk says so below */ } }, user);
    /* THE FAKE SHEET KEEPS WHAT IT IS SENT: updateProfile merges, myProfile and verifyLogin read it back. */
    await page.route('**://script.google.com/**', r => {
      if (r.request().method() !== 'POST') return r.fulfill({ status: 200, contentType: 'application/json', body: glass.FIXTURE });
      let a = {}; try { a = JSON.parse(r.request().postData() || '{}'); } catch (e) { a = {}; }
      let body = { success: true };
      /* CS_DROP=<field> IS THE MUTATION: a sheet that drops one field must fail that setting, and only it. */
      if (a.action === 'updateProfile') { sent.push(a.fields || {}); Object.assign(store, a.fields || {}); delete store[process.env.CS_DROP || '\u0000']; body = { success: true, personId: user.personId, profile: Object.assign({}, store) }; }
      if (a.action === 'myProfile') body = { success: true, personId: user.personId, profile: Object.assign({}, store) };
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    const load = async () => { await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 60000 }); await wait(1500); };
    await load();
    if (as === 'admin') {
      /* THE OWNER'S SCREENSHOT: Practice › Questions › Maths › Past paper › GCSE, the chips, the answers and the first card's tags. */
      await page.evaluate(() => go('stuff')); await wait(2500);
      for (const t of ['Practice', 'Questions', 'Maths', 'Past paper', 'GCSE']) {
        const ok = await page.evaluate(t => { const e = [...document.querySelectorAll('#s-stuff [data-do="facet-pick"]')].find(e => (e.querySelector('.k') || e).textContent.trim() === t); if (e) e.click(); return !!e; }, t);
        if (!ok) { work.push({ kind: 'chip-size', where: 'Find', say: `no "${t}" answer to press on the way to the GCSE card` }); break; }
        await wait(1800);
      }
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'gcse-menu.png') });
      if (SHOTS) { await page.evaluate(() => { const q = document.querySelector('#s-stuff .qwhole'); if (q) q.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); }); await wait(500);
        await page.screenshot({ path: path.join(SHOTS, 'gcse-card.png') }); await page.evaluate(() => window.scrollTo(0, 0)); }
      const m = await page.evaluate(measure);
      chips = m; work.push(...chipWork(m, 'Find › Practice › Questions › Maths › Past paper › GCSE'));
      /* MUTATION: a chip one size up must be caught, or the check proves nothing. */
      const mut = await page.evaluate(f => { const s = document.createElement('style'); s.id = 'cs-mut'; s.textContent = '.chip.sm { font-size: .72rem !important; }'; document.head.appendChild(s);
        const r = (0, eval)('(' + f + ')')(); s.remove(); return r; }, measure.toString());
      if (!chipWork(mut, 'mutation').some(w => / fs /.test(w.say))) work.push({ kind: 'chip-size', where: 'mutation', say: 'a chip drawn at .72rem was NOT caught — the check proves nothing' });
    }
    /* EVERY SETTINGS BOX: changed, then each form's own Save pressed once. */
    const changed = {};
    for (const col of COLS) {
      const r = await page.evaluate(async ({ col, nv, cs }) => {
        const newValue = (0, eval)('(' + nv + ')');
        const s = await (0, eval)('(' + cs + ')')(col); if (!s) return { col, none: 'no settings for this account' };
        const out = {}, forms = new Set();
        [...s.querySelectorAll('.me-form [data-me]')].filter(i => i.offsetParent !== null && !i.disabled).forEach(i => {
          const v = newValue(i); if (v === null) return;
          if (i.type === 'checkbox') i.checked = v; else i.value = v;
          i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true }));
          out[i.dataset.me] = i.type === 'checkbox' ? (v ? 'TRUE' : 'FALSE') : String(v).trim(); forms.add(i.closest('.me-form')); });
        /* A SETTINGS FORM'S SAVE (me-save), or its card's (card-save, your own card's sections, 468). */
        [...forms].forEach(f => { const c = f.closest('.card-ed'), b = f.querySelector('[data-do="me-save"]') || (c && c.querySelector('[data-do="card-save"]'));
          if (b) b.click(); else out['(no Save on a form)'] = '?'; });
        await new Promise(r => setTimeout(r, 2000));
        return { col, out };
      }, { col, nv: newValue.toString(), cs: colSettings.toString() });
      if (r.none) continue;
      Object.assign(changed, Object.fromEntries(Object.entries(r.out).map(([k, v]) => [k, { col, v }])));
    }
    /* THE RELOAD READS THE SHEET, NOT THE DEVICE: the stored sign-in keeps who you are and loses the saved profile. */
    await page.evaluate(() => { try { const u = JSON.parse(localStorage.getItem('familyUser')); delete u.profile; localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* none stored */ } });
    await load();
    const after = {};
    for (const col of COLS) {
      const got = await page.evaluate(async ({ col, cs }) => { const s = await (0, eval)('(' + cs + ')')(col), o = {}; if (!s) return o;
        s.querySelectorAll('.me-form [data-me]').forEach(i => { o[i.dataset.me] = i.type === 'checkbox' ? (i.checked ? 'TRUE' : 'FALSE') : String(i.value || '').trim(); }); return o; }, { col, cs: colSettings.toString() });
      Object.assign(after, got);
    }
    const posted = Object.assign({}, ...sent);
    Object.keys(changed).forEach(k => { const { col, v } = changed[k], why = [];
      if (posted[k] !== v) why.push(`Save sent ${JSON.stringify(posted[k])}, not ${JSON.stringify(v)}`);
      if (after[k] !== v) why.push(`after the reload the box shows ${JSON.stringify(after[k])}, not ${JSON.stringify(v)}`);
      settings.push({ as, col, field: k, pass: !why.length, why });
      if (why.length) work.push({ kind: 'settings-work', where: as + ' › ' + col + ' › ' + k, say: why.join('; ') }); });
    await ctx.close();
  }
  await browser.close(); server.close();
  errors.forEach(e => work.push({ kind: 'settings-work', where: 'page error', say: e }));
  const out = { chips, settings: { tried: settings.length, passed: settings.filter(s => s.pass).length, each: settings }, work };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(`chips-settings: chip-size ${work.filter(w => w.kind === 'chip-size').length}, settings ${out.settings.passed}/${out.settings.tried} pass, settings-work findings ${work.filter(w => w.kind === 'settings-work').length}`);
  process.exit(0);
})().catch(e => { console.error('chips-settings: ' + (e && e.stack || e)); process.exit(2); });
