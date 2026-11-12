#!/usr/bin/env node
/* @family. — tools/template-health.js THE ONE TEMPLATE, AS RENDERED (owner, 12 Nov: "catch ANY irregular rules"). */
/* Drives the real app in Chromium as every role at 390 and 820, visits every screen and every Find card kind (sampled), loading and error */
/* states, and reads each card's computed shape (check/template-measure.js). Writes data/template-health.json, read by tools/health.js: */
/* one rule per template property (cards whose property matches the template ÷ cards seen), tpl-same (one tag/tile/padding size), and */
/* the shape variety rules. Exceptions only with an owner decision: data/settings/template-exceptions.json. Screenshots: check/shots/template/. */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'data', 'template-health.json'), SHOTS = path.join(ROOT, 'check', 'shots', 'template');
const { measureCards } = require('../check/template-measure.js');
const arg = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=')[1];
const SAMPLE = Number(arg('sample') || 3), WIDTHS = (arg('widths') || '390,820').split(',').map(Number), PORT = Number(process.env.TH_PORT || 8793);
const ROLES = {
  admin: { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' },
  tutor: { name: 'Tia Tutor', personId: 'P31', person_id: 'P31', role: 'tutor', rank: 'staff', roles: ['tutor'], handle: 'tia_tutor' },
  parent: { name: 'Mo Member', personId: 'P-MEMBER', role: 'parent', roles: ['parent'], rank: 'client', handle: 'momember' },
  pupil: { name: 'Sam Student', personId: 'P9', person_id: 'P9', role: 'student', roles: ['student'], handle: 'sam_quick12' },
  out: null,
};
const ONLY = (arg('as') || '').split(',').filter(Boolean);
/* THE PROPERTIES, each a rule: what the template says, in a few words. */
const PROPS = {
  built: 'drawn by the template (findCard/card_)', order: 'parts in order: picture, tags, content, tile row last', picture: 'a picture only when real',
  tags: 'a tag row of pills, the name a tag', 'tag-look': 'every tag the one pill (size, ends, border)', title: 'no title line outside the tags',
  tiles: 'one row of tiles at the bottom', 'tile-size': 'every tile the one round icon size', stray: 'no button or link outside the tile row or a form',
  width: 'no wider than the measure', centre: 'centred: card, text and tile row', font: 'font sizes from --fs', colour: 'text colours from the palette',
  radius: 'corners from the radius tokens', inline: 'no inline style', spacing: 'padding and gaps from the --s scale',
};
const EXC = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/template-exceptions.json'), 'utf8')).allowed || []; } catch (e) { return []; } })();
const allowed = (kind, prop) => EXC.find(x => (x.kind === kind || x.kind === '*') && (x.prop === prop || x.prop === '*'));

function serve() {
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
  return new Promise(ok => { const s = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]), p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
    const lib = require('../check/lib-full.js').serve(p);
    if (lib !== null) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(lib); }
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
  }); s.listen(PORT, () => ok(s)); });
}
const FIX = fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8');
const FIX_ANON = (() => { try { const o = JSON.parse(FIX); o.films = []; delete o.filmsSync; return JSON.stringify(o); } catch (e) { return FIX; } })();

async function boot(browser, width, user, mode) {
  const page = await browser.newPage({ viewport: { width, height: width < 600 ? 844 : 1180 }, deviceScaleFactor: 1 });
  page.on('pageerror', () => {});
  if (user) await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, user);
  await page.route('**://script.google.com/**', async r => {
    if (mode === 'loading') return; /* never answers: the loading state stays */
    if (mode === 'error') return r.fulfill({ status: 500, body: 'error' });
    r.fulfill({ status: 200, contentType: 'application/json', body: user && user.role === 'admin' ? FIX : FIX_ANON });
  });
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  if (mode) { await page.waitForTimeout(mode === 'error' ? 6000 : 2500); return page; }
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(600);
  return page;
}
const MEASURE_SRC = '(' + measureCards.toString() + ')';
const measure = (page, scope, all) => page.evaluate(([src, a]) => eval(src)(a), [MEASURE_SRC, { scope, all }]).catch(e => { if (process.env.TH_DEBUG) console.log(e.message); return []; });

async function visit(page, ctx, where, scope, seen, rows, all) {
  const got = await measure(page, scope, all);
  if (process.env.TH_DEBUG) console.log('    ' + where + ': ' + got.map(c => c.kind).join(' '));
  for (const c of got) {
    const key = ctx.role + ctx.width + c.kind + c.regions + c.rect.h.toFixed(0) + c.rect.y.toFixed(0) + where;
    if (seen.has(key)) continue; seen.add(key);
    const fails = c.fails.filter(f => !allowed(c.kind, f.prop));
    const row = Object.assign({}, ctx, { where, kind: c.kind, regions: c.regions, fails, allowed: c.fails.length - fails.length, pad: c.pad, tagH: c.tagH, tagFs: c.tagFs, tileW: c.tileW });
    /* ONE PICTURE PER KIND, PROPERTY, ROLE AND WIDTH: enough to see it and fix it. */
    for (const f of fails) {
      const id = [ctx.role, ctx.width, c.kind, f.prop].join('-').replace(/[^\w-]+/g, '_');
      if (!SHOT_DONE.has(id)) { SHOT_DONE.add(id); const file = path.join(SHOTS, id + '.png');
        try { const loc = page.locator(c.sel).first(); await loc.scrollIntoViewIfNeeded({ timeout: 1500 }); await loc.screenshot({ path: file, timeout: 3000 }); f.shot = path.relative(ROOT, file); } catch (e) { f.shot = ''; } }
      else f.shot = path.relative(ROOT, path.join(SHOTS, id + '.png'));
    }
    /* --all-shots: one picture of every kind, broken or not, to look at before and after a change */
    const aid = [ctx.role, ctx.width, c.kind, 'look'].join('-').replace(/[^\w-]+/g, '_');
    if (ALL_SHOTS && !SHOT_DONE.has(aid)) { SHOT_DONE.add(aid);
      try { const loc = page.locator(c.sel).first(); await loc.scrollIntoViewIfNeeded({ timeout: 1500 }); await loc.screenshot({ path: path.join(SHOTS, aid + '.png'), timeout: 3000 }); } catch (e) { /* a card gone mid-walk has no picture */ } }
    rows.push(row);
  }
}
const SHOT_DONE = new Set(), ALL_SHOTS = process.argv.includes('--all-shots');

async function walk(browser, role, width, rows) {
  const page = await boot(browser, width, ROLES[role]);
  const ctx = { role, width }, seen = new Set();
  /* EVERY SCREEN THIS ROLE HAS, each page of it (up to six) */
  const tabs = await page.evaluate(() => TABS.map(t => t.id).filter(id => id !== 'stuff' && !(typeof screenGone_ === 'function' && screenGone_(id)))).catch(() => []);
  for (const id of tabs) {
    const n = await page.evaluate(id => { go(id, false, true); return AT === id ? (typeof pageCount === 'function' ? pageCount(id) : 1) : 0; }, id).catch(() => 0);
    for (let p = 0; p < Math.min(n, 6); p++) {
      await page.evaluate(([id, p]) => goPage(id, p, true), [id, p]).catch(() => {});
      await page.waitForTimeout(350);
      await visit(page, ctx, 'screen:' + id, '#s-' + id, seen, rows);
    }
  }
  /* EVERY FIND DOOR, AND EVERY CARD KIND BEHIND IT, sampled evenly */
  await page.evaluate(() => go('stuff', false, true)).catch(() => {});
  await page.waitForTimeout(400);
  await visit(page, ctx, 'find:front', '#s-stuff', seen, rows);
  const plan = await page.evaluate(n => {
    const f = facetList().find(x => x.field === 'forLabel'), doors = f ? facetValues(stuffItems(), f).map(d => d.value || d) : [], out = [];
    doors.forEach(d => { finderSet_(FINDERS.stuff, { filters: [{ field: 'forLabel', value: d }], show: true });
      const pages = inFinder_(FINDERS.stuff, () => stuffPages_()), by = {};
      pages.forEach((p, i) => { const k = ((p.x && p.x.kind) || '?') + (p.part ? '/' + p.part : ''); (by[k] = by[k] || []).push(i); });
      Object.keys(by).forEach(k => { const at = by[k], step = Math.max(1, Math.floor(at.length / n)); for (let j = 0; j < n && j * step < at.length; j++) out.push({ door: d, kind: k, at: at[j * step] }); }); });
    return out;
  }, SAMPLE).catch(() => []);
  for (const s of plan) {
    await page.evaluate(s => { finderSet_(FINDERS.stuff, { filters: [{ field: 'forLabel', value: s.door }], show: true }); go('stuff', false, true); }, s).catch(() => {});
    /* THE LIST IS NARROWED OFF THE MAIN TASK (findDone_): wait for it, then turn to the page and let it come to rest */
    await page.waitForFunction(() => inFinder_(FINDERS.stuff, () => stuffPages_().length > 0), null, { timeout: 15000 }).catch(() => {});
    await page.evaluate(s => goPage('stuff', inFinder_(FINDERS.stuff, () => stuffFirstResult_()) + s.at, true), s).catch(() => {});
    await page.waitForFunction(() => { const pg = $('s-stuff').querySelectorAll(':scope > .page')[domIndex_('stuff', PAGE.stuff)]; if (!pg) return false;
      const r = pg.getBoundingClientRect(); return r.top >= -2 && r.top < innerHeight / 2; }, null, { timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(300);
    /* THE PAGE IN FRONT, filled, and only its cards measured (a neighbour peeking in is its own sample) */
    await page.evaluate(() => { document.querySelectorAll('[data-th-now]').forEach(e => e.removeAttribute('data-th-now'));
      const i = PAGE.stuff, pg = $('s-stuff').querySelectorAll(':scope > .page')[domIndex_('stuff', i)];
      if (pg) { inFinder_(FINDERS.stuff, () => stuffFillOne_(i)); pg.setAttribute('data-th-now', '1'); } }).catch(() => {});
    await page.waitForTimeout(250);
    await visit(page, ctx, 'find:' + s.door + ':' + s.kind, '[data-th-now]', seen, rows, true);
  }
  /* AN EMPTY RESULT */
  await page.evaluate(() => { finderSet_(FINDERS.stuff, { filters: [], q: 'zzqxjv nothing matches', show: true }); go('stuff', false, true); paintStuff(true); }).catch(() => {});
  await page.waitForTimeout(500);
  await visit(page, ctx, 'find:empty', '#s-stuff', seen, rows);
  await page.close();
  /* LOADING AND ERROR STATES (once per role and width) */
  for (const mode of ['loading', 'error']) {
    const p2 = await boot(browser, width, ROLES[role], mode);
    const seen2 = new Set();
    await visit(p2, ctx, 'state:' + mode + ':stuff', '#s-stuff', seen2, rows);
    for (const id of tabs) {
      const at = await p2.evaluate(id => { try { go(id, false, true); return AT === id; } catch (e) { return false; } }, id).catch(() => false);
      if (!at) continue;
      await p2.waitForTimeout(300);
      await visit(p2, ctx, 'state:' + mode + ':' + id, '#s-' + id, seen2, rows);
    }
    await p2.close();
  }
}

/* THE RULES, from the rows: per property, tpl-same (the mode of each size), and the variety of shapes. */
function rules(rows) {
  const R = [], work = [], n = rows.length;
  Object.keys(PROPS).forEach(p => {
    const bad = rows.filter(r => r.fails.some(f => f.prop === p));
    R.push({ id: 'tpl-' + p, label: 'Rendered cards: ' + PROPS[p], ok: n - bad.length, of: n, unit: 'cards seen' });
    const seen = new Set();
    bad.forEach(r => r.fails.filter(f => f.prop === p).forEach(f => { const k = [r.kind, r.role, r.width, f.prop, f.actual.slice(0, 30)].join('|'); if (seen.has(k)) return; seen.add(k);
      work.push({ kind: 'tpl-' + p, where: f.shot || r.where, say: `${r.kind} on ${r.where} as ${r.role} at ${r.width}: ${p} — expected ${f.expected}, got ${f.actual}${f.at ? ' (' + f.at + ')' : ''}` }); }));
  });
  /* ONE SIZE FOR EVERY TAG, TILE AND CARD PADDING: the most common value is the template's */
  /* PER WIDTH: the type scale follows the window (the html clamp), so 390 and 820 each have their own one size. A tag's height is its lines, so its font is compared. */
  const mode = (k, w) => { const c = {}; rows.forEach(r => { if (r[k] && r.width === w) c[r[k]] = (c[r[k]] || 0) + 1; }); return Object.keys(c).sort((a, b) => c[b] - c[a])[0]; };
  const MW = {}; WIDTHS.forEach(w => { MW[w] = { tagFs: mode('tagFs', w), tileW: mode('tileW', w), pad: mode('pad', w) }; });
  const M = MW[WIDTHS[0]], keys = Object.keys(M), diff = r => keys.filter(k => r[k] && String(r[k]) !== String(MW[r.width][k]));
  const odd = rows.filter(r => diff(r).length && !allowed(r.kind, 'same'));
  R.push({ id: 'tpl-same', label: 'Rendered cards with the same tag, tile and padding sizes as the rest', ok: n - odd.length, of: n, unit: 'cards seen' });
  const so = new Set();
  odd.forEach(r => { const k = diff(r); const id = r.kind + r.width + k.join(); if (so.has(id)) return; so.add(id);
    work.push({ kind: 'tpl-same', where: r.where, say: `${r.kind} as ${r.role} at ${r.width}: ` + k.map(x => `${x} ${r[x]} (the rest: ${MW[r.width][x]})`).join(', ') }); });
  /* SHAPE VARIETY: a signature is the parts drawn and the properties broken; one per kind, one across kinds (plus declared exceptions). */
  const sig = r => r.regions.replace(/(^|>)(pic>)/, '$1') + '|' + [...new Set(r.fails.map(f => f.prop))].sort().join(',');
  const byKind = {}; rows.forEach(r => { (byKind[r.kind] = byKind[r.kind] || new Set()).add(sig(r)); });
  const kinds = Object.keys(byKind), oneKind = kinds.filter(k => byKind[k].size === 1);
  R.push({ id: 'tpl-variety-kind', label: 'Card kinds drawn in one shape everywhere', ok: oneKind.length, of: kinds.length, unit: 'card kinds' });
  kinds.filter(k => byKind[k].size > 1).forEach(k => work.push({ kind: 'tpl-variety-kind', where: 'data/template-health.json', say: `${k}: ${byKind[k].size} shapes — ${[...byKind[k]].slice(0, 4).join(' ; ')}` }));
  const all = new Set(rows.map(sig));
  const declared = EXC.filter(x => x.prop === 'shape').length;
  R.push({ id: 'tpl-variety', label: 'Card shapes across all kinds (ideal: 1 + owner exceptions)', ok: Math.min(all.size, 1 + declared), of: all.size, unit: 'distinct shapes', variety: true });
  return { R, work, modes: MW, kinds: kinds.length, shapes: all.size };
}

(async () => {
  if (process.argv.includes('--check')) { const ok = fs.existsSync(OUT); if (!ok) console.error('template-health: data/template-health.json missing'); process.exit(ok ? 0 : 1); }
  fs.mkdirSync(SHOTS, { recursive: true });
  fs.readdirSync(SHOTS).forEach(f => fs.unlinkSync(path.join(SHOTS, f)));
  const { chromium } = require('playwright');
  const server = await serve(), browser = await chromium.launch();
  const rows = [];
  for (const width of WIDTHS) for (const role of Object.keys(ROLES).filter(r => !ONLY.length || ONLY.includes(r))) {
    const before = rows.length;
    try { await walk(browser, role, width, rows); } catch (e) { console.error(`  ! ${role} at ${width}: ${e.message.split('\n')[0]}`); }
    console.log(`  ${role} at ${width}: ${rows.length - before} cards`);
  }
  await browser.close(); server.close();
  const { R, work, modes, kinds, shapes } = rules(rows);
  const byKind = {}; rows.forEach(r => { const b = byKind[r.kind] = byKind[r.kind] || { cards: 0, clean: 0, props: {} }; b.cards++; if (!r.fails.length) b.clean++; r.fails.forEach(f => { b.props[f.prop] = (b.props[f.prop] || 0) + 1; }); });
  const res = { generated: 'tools/template-health.js', cards: rows.length, kinds, shapes, modes, rules: R, byKind, work };
  fs.writeFileSync(OUT, JSON.stringify(res, null, 1) + '\n');
  console.log(`template-health: ${rows.length} cards, ${kinds} kinds, ${shapes} shapes, ${work.length} findings`);
  R.forEach(r => console.log(`  ${r.id.padEnd(18)} ${r.ok}/${r.of}`));
  if (process.argv.includes('-v')) Object.keys(byKind).sort().forEach(k => console.log(`  ${k}: ${byKind[k].clean}/${byKind[k].cards} clean ${JSON.stringify(byKind[k].props)}`));
})();
