#!/usr/bin/env node
/* @family. — tools/profile-roles.js THE PROFILE-ROLES CHECK (rule 1.75, queue 4h, owner 20 Nov): a child's own profile showed staff cards (Apply to
   teach, the availability grid, rate, qualifications, photos, staff hub). For each role, the served app (bundles, tools/lib/payload.json as the
   backend's answer, an iPhone 13) is signed in as that role and its Find › Settings cards listed (`settingDoorItems_`); every card is held against
   the master: its own `see` row in data/settings/permissions.json, else its account type's (`type:<T>`, its `col` in kinds.json setting.cards). A card the role
   may not see, a child shown Apply to teach, or a role shown no cards at all fails the build. Run by tools/build.js after the bundles. */
'use strict';
const SB = require('./lib/site-browser.js'), SD = require('./lib/site-data.js');
/* EACH SEE ROLE AND THE ACCOUNT THAT HOLDS IT. */
const ROLES = ['child', 'family', 'tutor', 'admin'].map(see => ({ see, user: SB.USERS[see] }));

/* THE MASTER: who may see a key, as permissions.json's `see` rows say; no row is an admin's only (`can_`, data.js). */
function master() {
  const perms = SD.permissions().filter(r => r.kind === 'see');
  const see = {};
  perms.forEach(r => { (see[r.action] = see[r.action] || {})[r.role] = r.allow === true; });
  const may = (key, role) => (see[key] && typeof see[key][role] === 'boolean' ? see[key][role] : role === 'admin');
  const typeOfCol = {};
  SD.kinds().setting.cards
    .filter(r => /^type:/.test(r.id) && r.col).forEach(r => { typeOfCol[r.col] = r.id; });
  return { see, may, typeOfCol };
}

async function run() {
  const M = master();
  const look = async role => {
    const pg = await SB.open({ user: role.user, words: false, ready: () => typeof DATA !== 'undefined' && DATA && (DATA.tutors || []).length && DATA.permissions && DATA.settingFor });
    try {
      return await pg.evaluate(() => {
        /* EVERY SETTINGS CARD DRAWN SAYS WHICH IT IS (job E): its data-card (or data-lay-card, or a list's mark) is an id the registry knows
           (kinds.json setting.cards, or a set:/own:/prog:series: id); a padlock or a wait says data-card="-" or is a wait. */
        const unknown = [];
        settingTypes_().forEach(({ col }) => {
          if (!col) return;
          settingGroups_(col).forEach(g => {
            const h = g.pages.join(''), tag = (/^\s*(?:<!--[^>]*-->)?\s*<div[^>]*>/.exec(h) || [''])[0];
            const said = (/\sdata-card="([^"]*)"/.exec(tag) || [])[1];
            if (settingNone_(h)) return;
            if (said && !cardIs_(said)) unknown.push(col + ': data-card="' + said + '" is not in the registry');
            else if (!g.id && !/\bis-wait\b|\bwait\b|kc-empty|loading/.test(tag)) unknown.push(col + ': a card with no data-card: ' + tag.slice(0, 120));
          });
        });
        return { unknown, items: settingDoorItems_().filter(x => x.parts).map(x => ({ name: x.name,
          parts: x.parts.filter(p => !p.lens).map(p => ({ col: p.col || '', id: p.id || (p.notify ? 'door:notify' : '') })) })) };
      });
    } finally { await pg.close(); }
  };
  try {
    const got = await Promise.all(ROLES.map(look));
    const bad = [];
    let cards = 0;
    ROLES.forEach((role, i) => {
      const items = got[i].items;
      got[i].unknown.forEach(u => bad.push(role.see + ' › ' + u));
      if (!items.length) bad.push(role.see + ': no cards drawn — the app did not start');
      items.forEach(x => x.parts.forEach(p => {
        cards++;
        /* A CARD WITH ITS OWN ROWS ANSWERS BY THEM; one without, by its account type's. */
        const key = p.id && M.see[p.id] ? p.id : M.typeOfCol[p.col] || p.id;
        if (!key || !M.may(key, role.see)) bad.push(role.see + ' › ' + x.name + ' [' + (key || p.col || '?') + ']');
        if (role.see === 'child' && (p.id === 'staff:apply' || /^set:staff:|^staff:|^appr:/.test(p.id))) bad.push('child › ' + x.name + ' [a staff card]');
      }));
    });
    console.log('profile-roles: ' + ROLES.length + ' roles, ' + bad.length + ' cards out of place');
    console.log('  by role: ' + ROLES.map((r, i) => r.see + ' ' + got[i].items.length).join(', ') + ' (' + cards + ' cards)');
    bad.forEach(x => console.log('  ' + x));
    if (bad.length) throw new Error('profile-roles: ' + bad.length + ' card(s) out of place');
  } finally { await SB.done(); }
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e.message || e); process.exit(1); });
