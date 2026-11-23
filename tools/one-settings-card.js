#!/usr/bin/env node
/* @family. — tools/one-settings-card.js THE ONE-SETTINGS-CARD CHECK (rule 1.75, owner 22 Nov): every Settings card is the one card — a title, a stack
   of rows, optional buttons — and every row is one of three kinds: text (a fact), field (a box typed into or picked), item (a list entry that opens).
   The data says so once (kinds.json setting.card, setting.rows); setCard_ (js/me-shelves.js) marks each card data-shape and each row data-row.
   Every account type's Settings cards are drawn on an iPhone 13 (child, family, tutor, admin), counted site-wide; more than one card type, more than
   three row kinds, or a row with no kind fails the build. Run by tools/build.js after the bundles. */
'use strict';
const SB = require('./lib/site-browser.js'), SD = require('./lib/site-data.js');
const ROLES = ['child', 'family', 'tutor', 'admin'];

async function run() {
  const SET = SD.kinds().setting || {}, rows = SET.rows || [];
  const bad = [];
  if (typeof SET.card !== 'string' || !SET.card) bad.push('kinds.json setting.card names no one card type');
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
  try {
    const got = [].concat(...(await Promise.all(ROLES.map(async see => (await look(see)).map(x => Object.assign(x, { see }))))));
    if (!got.length) bad.push('no Settings cards drawn — the app did not start');
    const types = [...new Set(got.map(x => x.sh))], kinds = [...new Set([].concat(...got.map(x => x.rows)))];
    const n = k => got.reduce((s, x) => s + x.rows.filter(r => r === k).length, 0);
    console.log('one-settings-card: ' + got.length + ' Settings cards (' + ROLES.join(', ') + ') in ' + types.length + ' card type(s): ' + types.map(t => t || '(none)').join(', ')
      + '; ' + kinds.length + ' row kind(s): ' + kinds.map(k => (k || '(no kind)') + ' ' + n(k)).join(', '));
    if (types.length > 1) bad.push('Settings has ' + types.length + ' card types: ' + types.join(', ') + '; one');
    got.filter(x => x.sh !== SET.card).slice(0, 8).forEach(x => bad.push(x.see + ' › ' + x.n + ' is ' + (x.sh || 'no card type') + ', not ' + SET.card));
    if (kinds.length > 3) bad.push('Settings has ' + kinds.length + ' row kinds: ' + kinds.join(', ') + '; three at most');
    got.filter(x => x.rows.some(r => rows.indexOf(r) < 0)).slice(0, 8).forEach(x => bad.push(x.see + ' › ' + x.n + ' has a row that is not ' + rows.join(', ') + ' [' + x.rows.join(' ') + ']'));
  } finally { await SB.done(); }
  if (bad.length) throw new Error('one-settings-card: FAILED\n  ' + bad.join('\n  '));
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e.message || e); process.exit(1); });
