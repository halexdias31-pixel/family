#!/usr/bin/env node
/* @family. — check/chips-settings.js TWO OWNER CHECKS IN ONE 390x844 WALK (1040 r12), written to data/chips-settings-health.json for tools/health.js. */
/*   chip-size      a chosen chip (Practice ✕), a menu answer (Foundation) and a card's tag pill share one size: font-size, padding, height and */
/*                  radius, as the browser computes them; a tappable one keeps a 44px hit area in its invisible ::before. Mutation-proven in the */
/*                  walk: a chip's font-size changed by a stylesheet must be caught.                                                             */
/*   settings-work  every visible settings box (data-me) of every settings column, as an admin and as a student: changed, Saved, the page */
/*                  reloaded with the profile read back from the (fake, stateful) server only — the save must send the new value and the box */
/*                  must show it after the reload. A backend that drops a field is not tested here: the fake keeps what it is sent.          */
/*                  Also as a parent, a tutor, a brand-new tutor and an apprentice (glass.ACCOUNTS); a shut card's boxes must be disabled, and a */
/*                  refused save must say the sheet's own words beside its Save.                                                                 */
/*   settings-title every settings card is the one template (11 Nov) with its name as a tag (9 Nov: no title line), never empty or a raw id. Fails the run. */
'use strict';
const fs = require('fs'), path = require('path');
const glass = require('./glass.js');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'data', 'chips-settings-health.json');
const SHOTS = process.env.CS_SHOTS || '';
const COLS = ['staff', 'site', 'account', 'family', 'biz'];
const wait = ms => new Promise(r => setTimeout(r, ms));

/* WHAT EACH PILL MEASURES, in the page (the shortest tag: a long title wraps to two lines): the text's font-size, the pill's padding, height and radius, and the hit area a finger gets. */
function measure() {
  const one = (pill, text) => { if (!pill) return null; const s = getComputedStyle(pill), b = pill.getBoundingClientRect(), bf = getComputedStyle(pill, '::before');
    const inset = bf.content && bf.content !== 'none' && bf.position === 'absolute' ? parseFloat(bf.top) || 0 : 0;
    return { fs: getComputedStyle(text || pill).fontSize, pad: s.paddingTop + ' ' + s.paddingRight, h: Math.round(b.height * 10) / 10, r: s.borderTopLeftRadius, hit: Math.round(b.height - 2 * inset) }; };
  const ans = document.querySelector('#s-stuff .answers [data-do="facet-pick"]');
  return { tag: one([...document.querySelectorAll('#s-stuff .qcard-tags .qtag')].sort((a, b) => a.offsetHeight - b.offsetHeight)[0]), chip: one(document.querySelector('#s-stuff .chips .chip.sm')),
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
  for (const A of glass.ACCOUNTS) {
    const as = A.as;
    /* A SIGNED-IN SESSION HAS A TOKEN, AND THE SHEET'S ROW HAS EVERY COLUMN (phone_cc is how the site knows it is the whole row, profileShapeOk_). */
    const user = Object.assign({ token: 'cs-token' }, A.user), store = Object.assign({ phone_cc: '+44' }, A.profile || {}), sent = [];
    let fail = '';
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
      if (a.action === 'updateProfile' && fail) body = { success: false, error: fail };
      else if (a.action === 'updateProfile') { sent.push(a.fields || {}); Object.assign(store, a.fields || {}); delete store[process.env.CS_DROP || '\u0000']; body = { success: true, personId: user.personId, profile: Object.assign({}, store) }; }
      if (a.action === 'myProfile') body = { success: true, personId: user.personId, profile: Object.assign({}, store) };
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    const load = async () => { await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 60000 }); await wait(1500); };
    await load();
    if (as === 'admin') {
      /* THE OWNER'S SCREENSHOT: Practice › Questions › Maths › Past paper › GCSE, the chips, the answers and the first card's tags. */
      await page.evaluate(() => go('stuff')); await wait(2500);
      /* A QUESTION THE PATH DOES NOT NAME (Year before Level) is answered as a thumb would: its commonest answer, then look again. */
      const pick = t => page.evaluate(t => { const es = [...document.querySelectorAll('#s-stuff [data-do="facet-pick"]')], e = es.find(e => (e.querySelector('.k') || e).textContent.trim() === t); if (e) { e.click(); return 'hit'; }
        const F = es[0] && facetList().find(f => f.field === es[0].dataset.field); if (!F) return '';
        const top = facetValues(stuffFiltered(), F).sort((a, b) => b.n - a.n)[0], d = top && es.find(x => x.dataset.value === String(top.value)); if (d) d.click(); return d ? 'detour' : ''; }, t);
      for (const t of ['Practice', 'Questions', 'Maths', 'Past paper', 'GCSE']) {
        let ok = false;
        for (let hop = 0; hop < 3; hop++) { const r = await pick(t); if (r === 'hit') { ok = true; break; } if (!r) break; await wait(1800); }
        if (!ok) { work.push({ kind: 'chip-size', where: 'Find', say: `no "${t}" answer to press on the way to the GCSE card` }); break; }
        await wait(1800);
      }
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'gcse-menu.png') });
      const atMenu = await page.evaluate(measure);
      /* MUTATION: a chip one size up must be caught, or the check proves nothing. */
      const mutMenu = await page.evaluate(f => { const s = document.createElement('style'); s.id = 'cs-mut'; s.textContent = '.chip.sm { font-size: .72rem !important; }'; document.head.appendChild(s);
        const r = (0, eval)('(' + f + ')')(); s.remove(); return r; }, measure.toString());
      /* ON TO THE CARD: the questions still asked past GCSE are answered Doesn't matter until the results come, then scrolled to (a result is drawn as the scroll comes near). */
      for (let hop = 0; hop < 12 && !(await page.evaluate(() => !!document.querySelector('#s-stuff .qcard-tags .qtag'))); hop++) {
        await page.evaluate(() => { const e = document.querySelector('#s-stuff [data-do="facet-skip"]'); if (e) e.click(); else window.scrollTo(0, document.body.scrollHeight); }); await wait(1500); }
      await page.evaluate(() => window.scrollTo(0, 0));
      if (SHOTS) { await page.evaluate(() => { const q = document.querySelector('#s-stuff .qwhole'); if (q) q.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); }); await wait(500);
        await page.screenshot({ path: path.join(SHOTS, 'gcse-card.png') }); await page.evaluate(() => window.scrollTo(0, 0)); }
      /* THE CHIPS AND ANSWERS AS THE MENU DREW THEM, THE TAG AS THE CARD DOES. */
      const m = Object.assign({}, atMenu, { tag: (await page.evaluate(measure)).tag || atMenu.tag });
      chips = m; work.push(...chipWork(m, 'Find › Practice › Questions › Maths › Past paper › GCSE'));
      const mut = Object.assign({}, mutMenu, { tag: m.tag });
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
        /* SAVED AS TYPED (owner, 8 Nov): no Save to press — a Save tile still on a settings form is a finding. */
        [...forms].forEach(f => { if (f.querySelector('[data-do="me-save"], [data-do="card-save"]')) out['(a Save tile on a form)'] = '?'; });
        await new Promise(r => setTimeout(r, 2500));
        return { col, out };
      }, { col, nv: newValue.toString(), cs: colSettings.toString() });
      if (r.none) continue;
      Object.assign(changed, Object.fromEntries(Object.entries(r.out).map(([k, v]) => [k, { col, v }])));
    }
    /* EVERY SETTINGS CARD NAMED BY A TAG (9 Nov, superseding 8 Nov's h3): the one template (.kc) whose tags hold its name; an emptied tag line must be caught. */
    for (const col of COLS) {
      const bad = await page.evaluate(async ({ col, cs }) => { const s = await (0, eval)('(' + cs + ')')(col); if (!s) return null;
        const unnamed = root => [...root.querySelectorAll('.card')].filter(c => !c.parentElement.closest('.card')).filter(c => {
          const name = (c.getAttribute('aria-label') || '').trim(), tags = [...c.querySelectorAll(':scope > .kc-tags .qtag')].map(t => t.textContent.trim());
          return !c.classList.contains('kc') || !name || /^[a-z_0-9:-]+$/.test(name) || tags.indexOf(name) === -1; }).map(c => c.dataset.layCard || c.dataset.sec || c.className);
        const out = unnamed(s), first = s.querySelector('.card.kc > .kc-tags');
        let caught = true; if (first) { const was = first.innerHTML; first.innerHTML = ''; caught = unnamed(s).length > out.length; first.innerHTML = was; }
        return { out, caught }; }, { col, cs: colSettings.toString() });
      if (!bad) continue;
      bad.out.forEach(k => work.push({ kind: 'settings-title', where: as + ' › ' + col + ' › ' + k, say: 'a settings card not on the one template with its name as a tag' }));
      if (!bad.caught) work.push({ kind: 'settings-title', where: as + ' › ' + col + ' › mutation', say: 'an emptied tag line was NOT caught' });
    }
    /* SHUT MEANS SHUT: a box on a card you do not hold is greyed, never typed into. */
    for (const col of COLS) {
      const open = await page.evaluate(async ({ col, cs }) => { const s = await (0, eval)('(' + cs + ')')(col); if (!s) return [];
        return [...s.querySelectorAll('.is-locked input, .is-locked select, .is-locked textarea')].filter(i => !i.disabled).map(i => i.name || i.dataset.me || i.type); }, { col, cs: colSettings.toString() });
      open.forEach(k => work.push({ kind: 'settings-work', where: as + ' › ' + col + ' › ' + k, say: 'a box on a shut card can be typed into' }));
    }
    /* A REFUSED SAVE SAYS WHY, PLAINLY: the sheet's words show on the page, not a silent Save. */
    fail = 'The sheet is busy, try again';
    const said = await page.evaluate(async ({ col, nv, cs, fail }) => {
      const newValue = (0, eval)('(' + nv + ')');
      for (const c of col) { const s = await (0, eval)('(' + cs + ')')(c); if (!s) continue;
        const i = [...s.querySelectorAll('.me-form [data-me]')].find(i => i.offsetParent !== null && !i.disabled && i.type !== 'checkbox' && i.tagName !== 'SELECT'); if (!i) continue;
        i.value = newValue(i); i.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 2500));
        return document.body.innerText.indexOf(fail) !== -1 ? 'ok' : 'no words'; }
      return 'none';
    }, { col: COLS, nv: newValue.toString(), cs: colSettings.toString(), fail });
    fail = '';
    if (said === 'no words') work.push({ kind: 'settings-work', where: as + ' › refused save', say: 'the sheet refused a save and the page did not say so' });
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
  console.log(`chips-settings: chip-size ${work.filter(w => w.kind === 'chip-size').length}, settings ${out.settings.passed}/${out.settings.tried} pass, settings-work findings ${work.filter(w => w.kind === 'settings-work').length}, unnamed cards ${work.filter(w => w.kind === 'settings-title').length}`);
  work.filter(w => w.kind === 'settings-title').forEach(w => console.log('  unnamed: ' + w.where + ' — ' + w.say));
  process.exit(work.some(w => w.kind === 'settings-title') ? 1 : 0);
})().catch(e => { console.error('chips-settings: ' + (e && e.stack || e)); process.exit(2); });
