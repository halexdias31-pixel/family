#!/usr/bin/env node
/* @family. — tools/profile-roles.js THE PROFILE-ROLES CHECK (rule 1.75, queue 4h, owner 20 Nov): a child's own profile showed staff cards (Apply to
   teach, the availability grid, rate, qualifications, photos, staff hub). For each role, the served app (bundles, tools/lib/payload.json as the
   backend's answer, an iPhone 13) is signed in as that role and its Find › Settings cards listed (`settingDoorItems_`); every card is held against
   the master: its own `see` row in data/settings/permissions.json, else its account type's (`type:<T>`, setting-for.json's `col`). A card the role
   may not see, a child shown Apply to teach, or a role shown no cards at all fails the build. Run by tools/build.js after the bundles. */
'use strict';
const fs = require('fs'), http = require('http'), path = require('path');
const ROOT = path.join(__dirname, '..'), PORT = 8132;
const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
/* EACH SEE ROLE AND THE ACCOUNT THAT HOLDS IT. */
const ROLES = [
  { see: 'child', user: { name: 'Finley Student', handle: 'finley', personId: 'P-E1', role: 'student', roles: ['student'], rank: 'student', token: 'tok' } },
  { see: 'family', user: { name: 'Carl Client', handle: 'carl', personId: 'P-E2', role: 'client', roles: ['client'], rank: 'client', token: 'tok' } },
  { see: 'tutor', user: { name: 'Ada Tutor', handle: 'ada', personId: 'P002', role: 'tutor', roles: ['tutor'], rank: 'staff', token: 'tok' } },
  { see: 'admin', user: { name: 'Test Admin', handle: 'testadmin', personId: 'P001', role: 'admin', roles: ['admin'], rank: 'admin', token: 'tok' } },
];

/* THE MASTER: who may see a key, as permissions.json's `see` rows say; no row is an admin's only (`can_`, data.js). */
function master() {
  const perms = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/permissions.json'), 'utf8')).filter(r => r.kind === 'see');
  const see = {};
  perms.forEach(r => { (see[r.action] = see[r.action] || {})[r.role] = r.allow === true; });
  const may = (key, role) => (see[key] && typeof see[key][role] === 'boolean' ? see[key][role] : role === 'admin');
  const typeOfCol = {};
  JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/setting-for.json'), 'utf8'))
    .filter(r => /^type:/.test(r.card) && r.col).forEach(r => { typeOfCol[r.col] = r.card; });
  return { see, may, typeOfCol };
}

async function run() {
  const M = master();
  const payload = fs.readFileSync(path.join(ROOT, 'tools/lib/payload.json'), 'utf8');
  const { chromium, devices } = require('playwright');
  const srv = http.createServer((q, s) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    fs.readFile(path.join(ROOT, p), (e, b) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); s.end(b); });
  }).listen(PORT);
  const b = await chromium.launch();
  const look = async role => {
    const c = await b.newContext({ ...devices['iPhone 13'] });
    try {
      const pg = await c.newPage();
      await pg.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, role.user);
      await pg.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: payload }));
      await pg.goto('http://localhost:' + PORT + '/');
      await pg.waitForFunction(() => typeof DATA !== 'undefined' && DATA && (DATA.tutors || []).length && DATA.permissions && DATA.settingFor, null, { timeout: 90000 });
      await pg.waitForTimeout(1500);
      return await pg.evaluate(() => settingDoorItems_().filter(x => x.parts).map(x => ({ name: x.name,
        parts: x.parts.filter(p => !p.lens).map(p => ({ col: p.col || '', id: p.id || (p.notify ? 'door:notify' : '') })) })));
    } finally { await c.close(); }
  };
  try {
    const got = await Promise.all(ROLES.map(look));
    const bad = [];
    let cards = 0;
    ROLES.forEach((role, i) => {
      const items = got[i];
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
    console.log('  by role: ' + ROLES.map((r, i) => r.see + ' ' + got[i].length).join(', ') + ' (' + cards + ' cards)');
    bad.forEach(x => console.log('  ' + x));
    if (bad.length) throw new Error('profile-roles: ' + bad.length + ' card(s) out of place');
  } finally { await b.close(); srv.close(); }
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e.message || e); process.exit(1); });
