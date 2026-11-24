#!/usr/bin/env node
/* @family. — tools/one-settings-card.js THE ONE-SETTINGS-CARD CHECK (rule 1.75, owner 22 Nov): every Settings card is the one card — a title, a stack
   of rows, optional buttons — and every row is one of three kinds: text (a fact), field (a box typed into or picked), item (a list entry that opens).
   The data says so once (kinds.json setting.cardType, setting.rows); setCard_ (js/me-shelves.js) marks each card data-shape and each row data-row.
   Every account type's Settings cards are drawn on an iPhone 13 (child, family, tutor, admin), counted site-wide; more than one card type, more than
   three row kinds, or a row with no kind fails the build. Run by tools/build.js after the bundles.
   AND WHAT A PERSON SEES (23 Nov: an admin signed in as a child saw sixteen Settings cards, each its name and buttons alone): each role taps
   Find › Settings for real; a drawn Settings card with no visible row fails, and today's answers (a made-up `history` answer for P-E1) must
   show in the child's Progress, the admin's lens on the child, and a tutor's booked student under Work on file. */
'use strict';
const SB = require('./lib/site-browser.js'), SD = require('./lib/site-data.js');
const ROLES = ['child', 'family', 'tutor', 'admin'];

async function run() {
  const SET = SD.kinds().setting || {}, rows = SET.rows || [];
  const bad = [];
  if (typeof SET.cardType !== 'string' || !SET.cardType) bad.push('kinds.json setting.cardType names no one card type');
  if (!rows.length || rows.length > 3) bad.push('kinds.json setting.rows names ' + rows.length + ' row kinds; three at most');
  if ((SET.cards || []).some(c => c.shape) || SET.shapes || SET.shapeBy) bad.push('kinds.json setting still names card shapes (shapes, shapeBy or a card `shape`)');
  const look = async see => {
    const pg = await SB.open({ user: SB.USERS[see], words: false, ready: () => typeof DATA !== 'undefined' && DATA && (DATA.tutors || []).length && DATA.permissions && DATA.settingFor });
    try {
      return await pg.evaluate(() => {
        const out = [];
        settingTypes_().forEach(({ col }) => { if (!col) return;
          settingGroups_(col).forEach(g => { const t = document.createElement('template'); t.innerHTML = g.pages.join('');
            t.content.querySelectorAll('.kc-setting').forEach(c => { if (c.parentElement && c.parentElement.closest('.kc-setting')) return;
              const set = c.querySelector(':scope > .kc-lines > .kc-set');
              out.push({ col, n: c.getAttribute('aria-label') || c.dataset.card || '?', sh: c.dataset.shape || '',
                rows: set ? [...set.children].map(r => r.dataset.row || '') : [] }); }); }); });
        return out;
      });
    } finally { await pg.close(); }
  };
  /* TODAY'S ANSWERS, AS THE BACKEND'S `history` WOULD SAY THEM; a tutor's Work on file lists the child as a booked student. */
  const KID = 'P-E1', today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date()), SAID = 'Fractions check ' + today;
  const answer = q => q.action === 'history' ? { success: true, summary: ['One question on ' + q.day + '.'], items: q.of === KID && q.day === today
      ? [{ label: SAID, mark: '1/1', how: 'right', answer: '3/4', tries: 1 }] : [] }
    : q.action === 'workFilesOf' ? { success: true, work: [], others: [{ id: KID, name: 'Evie' }] } : null;
  const seen = async see => {
    const pg = await SB.open({ user: SB.USERS[see], words: false, answer, ready: () => typeof DATA !== 'undefined' && DATA && (DATA.tutors || []).length && DATA.permissions && DATA.settingFor });
    const cards = () => pg.evaluate(() => [...document.querySelectorAll('.kc-setting')].filter(c => c.offsetParent && !(c.parentElement && c.parentElement.closest('.kc-setting')))
      .map(c => { const L = c.querySelector(':scope > .kc-lines'), rows = L ? [...L.querySelectorAll('[data-row], .kc-line, input, select, textarea, button, .tile')] : [];
        return { n: c.getAttribute('aria-label') || '?', rows: rows.filter(r => r.offsetHeight > 0 && (r.matches('input, select, textarea, button, .tile') || r.innerText.trim())).length, text: L ? L.innerText : '' }; }));
    try {
      const out = { see, cards: [], hist: null };
      out.cards = await SB.retry(async () => { await SB.tap(pg, 'Settings'); await SB.tap(pg, 'Doesn\'t matter'); await pg.waitForTimeout(1500); return cards(); }, r => r.length > 0);
      const has = () => pg.evaluate(s => document.body.innerText.indexOf(s) >= 0, SAID);
      if (see === 'child') out.hist = (out.cards.find(c => c.n === 'Progress') || {}).text && (await has());
      if (see === 'admin') {
        await pg.evaluate(id => { LENS = Object.assign({ lens: true }, (DATA.everyone || []).find(p => p.personId === id) || { personId: id }, { role: 'Student', roles: ['student'], rank: 'student' }); lensRedraw_(); }, KID);
        await pg.waitForTimeout(2500); out.hist = await has();
      }
      if (see === 'tutor') {
        const t = pg.locator('.kc-setting [data-do="hist-see"]').first();
        try { await t.click({ timeout: 8000 }); await pg.waitForTimeout(2000); out.hist = await has(); } catch (e) { out.hist = false; }
      }
      return out;
    } finally { await pg.close(); }
  };
  try {
    const sights = await SB.pool(ROLES, 2, seen);
    sights.forEach(o => {
      if (!o.cards.length) bad.push(o.see + ': Find › Settings drew no cards');
      o.cards.filter(c => !c.rows).slice(0, 8).forEach(c => bad.push(o.see + ' › Settings › ' + c.n + ' shows its name and buttons alone (no row, no body)'));
      if (o.hist === false || (o.hist != null && !o.hist)) bad.push(o.see + ': today\'s answers (' + SAID + ') are not shown ' + ({ child: 'in Progress', admin: 'in the lens on ' + KID, tutor: 'under a booked student\'s Work on file' })[o.see]);
    });
    console.log('one-settings-card: seen ' + sights.map(o => o.see + ' ' + o.cards.length + ' cards, ' + o.cards.filter(c => c.rows).length + ' with rows' + (o.hist == null ? '' : ', today ' + (o.hist ? 'shown' : 'MISSING'))).join('; '));
    const got = [].concat(...(await Promise.all(ROLES.map(async see => (await look(see)).map(x => Object.assign(x, { see }))))));
    if (!got.length) bad.push('no Settings cards drawn — the app did not start');
    const types = [...new Set(got.map(x => x.sh))], kinds = [...new Set([].concat(...got.map(x => x.rows)))];
    const n = k => got.reduce((s, x) => s + x.rows.filter(r => r === k).length, 0);
    console.log('one-settings-card: ' + got.length + ' Settings cards (' + ROLES.join(', ') + ') in ' + types.length + ' card type(s): ' + types.map(t => t || '(none)').join(', ')
      + '; ' + kinds.length + ' row kind(s): ' + kinds.map(k => (k || '(no kind)') + ' ' + n(k)).join(', '));
    if (types.length > 1) bad.push('Settings has ' + types.length + ' card types: ' + types.join(', ') + '; one');
    got.filter(x => x.sh !== SET.cardType).slice(0, 8).forEach(x => bad.push(x.see + ' › ' + x.n + ' is ' + (x.sh || 'no card type') + ', not ' + SET.cardType));
    if (kinds.length > 3) bad.push('Settings has ' + kinds.length + ' row kinds: ' + kinds.join(', ') + '; three at most');
    got.filter(x => x.rows.some(r => rows.indexOf(r) < 0)).slice(0, 8).forEach(x => bad.push(x.see + ' › ' + x.n + ' has a row that is not ' + rows.join(', ') + ' [' + x.rows.join(' ') + ']'));
  } finally { await SB.done(); }
  if (bad.length) throw new Error('one-settings-card: FAILED\n  ' + bad.join('\n  '));
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e.message || e); process.exit(1); });
