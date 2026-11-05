#!/usr/bin/env node
/* @family. — tools/facet-data.js EVERY FACET VALUE, NOT ONLY THE WALKED ONES (940). Boots the app (check/jsdom-app.js), takes every answer of every
   menu over the whole library, and lists merged values, near-duplicate spellings and menu/chip/tag word mismatches into data/facet-health.json.
   The funnel walk (logic-health.js) follows a few answers per menu, so it missed "Volume of a Cube Volume of a Cuboid". --check: write nothing. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'facet-health.json');
const CHECK = process.argv.includes('--check');

(async () => {
  const t0 = Date.now();
  const { app, tick } = require('../check/jsdom-app.js');
  const A = await app(JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8')));
  const ev = s => A.w.__ev(s);
  while (!ev('LOADED && finderSettled_() && (LIBRARY_ROWS || []).length > 0')) {
    if (Date.now() - t0 > 240000) { console.error('facet-data: the app never settled in 240s'); process.exit(2); }
    await tick(250);
    ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  }
  const got = JSON.parse(ev(`(() => inFinder_(FINDERS.stuff, () => {
    USER = Object.assign({ name: 'T', personId: 'P-T' }, { role: 'Admin', roles: ['admin'] });
    STUFF.filters = []; STUFF.q = ''; STUFF.admit = null;
    const items = stuffItemsAll_(), out = [];
    const norm = t => String(t == null ? '' : t).replace(/<[^>]*>/g, '').replace(/\\s+/g, ' ').trim();
    const key = t => norm(t).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '').replace(/s$/, '');
    const lev1 = (a, b) => { if (Math.abs(a.length - b.length) > 1) return false; let i = 0; while (i < a.length && a[i] === b[i]) i++;
      return a.slice(i + 1) === b.slice(i + 1) || a.slice(i) === b.slice(i + 1) || a.slice(i + 1) === b.slice(i); };
    /* "Richard II"/"Richard III", "Section A"/"Section B": a numbering, not a spelling. */
    const ROMAN = (a, b) => { const t = x => x.replace(/\\s*\\b(?:[IVXLC]+|[A-Z])\\b['.]?\\s*$/, ''); return t(a) === t(b) && t(a) !== a; };
    const at = (a, b) => { const r = []; for (let p = a.indexOf(b); p >= 0; p = a.indexOf(b, p + 1)) if ((p === 0 || a[p - 1] === ' ') && (p + b.length === a.length || a[p + b.length] === ' ')) r.push(p); return r; };
    facetList().forEach(f => {
      let values = []; try { values = facetValues(items, f); } catch (e) { return; }
      const label = f.label + ' (' + f.field + ')', vals = values.map(v => String(v.value)), low = vals.map(v => v.toLowerCase());
      /* MERGED: one answer holding two others of its menu at word boundaries, or one twice. */
      const byLen = low.map((b, j) => [b, j]).filter(([b]) => b.length > 3);
      low.forEach((a, i) => { if (a.length < 9) return;
        const hits = byLen.filter(([b, j]) => j !== i && b.length < a.length && a.includes(b)).map(([b]) => at(a, b).map(p => [p, p + b.length + 1, b])).flat();
        /* TWO PIECES THAT FILL IT, with nothing but a space between: "X by Y" or "X and Y" is one name, not two joined. */
        const fills = (h, g) => { const [x, y] = h[0] < g[0] ? [h, g] : [g, h]; return x[1] === y[0] && x[0] === 0 && y[1] - 1 === a.length; };
        const pair = hits.find(h => hits.some(g => g !== h && fills(h, g)));
        const inner = pair ? [...new Set(hits.filter(h => hits.some(g => g !== h && fills(h, g))).map(h => h[2]))] : [];
        if (pair && a.split(' ').length <= 10) out.push({ kind: 'merged-all', menu: label, value: vals[i], say: 'is ' + (inner.length > 1 ? inner.slice(0, 2).map(b => '"' + b + '"').join(' + ') : '"' + inner[0] + '" twice') + ' joined' }); });
      /* NEAR-DUPLICATES: two answers that differ only in case, spacing, punctuation, a plural s, & for and, or one letter. */
      const seen = {};
      vals.forEach(v => { const k = key(v); if (!k) return; (seen[k] = seen[k] || []).push(v); });
      Object.values(seen).filter(g => g.length > 1).forEach(g => out.push({ kind: 'near-dup', menu: label, value: g[0], say: 'spelt ' + g.map(x => '"' + x + '"').join(' and ') }));
      const ks = Object.keys(seen).filter(k => k.length >= 8).sort();
      if (ks.length < 4000) for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
        if (ks[j].slice(0, 3) !== ks[i].slice(0, 3)) break;
        if (lev1(ks[i], ks[j]) && !/\\d/.test(ks[i] + ks[j]) && !ROMAN(seen[ks[i]][0], seen[ks[j]][0])) out.push({ kind: 'near-dup', menu: label, value: seen[ks[i]][0], say: 'one letter from "' + seen[ks[j]][0] + '"' }); }
      /* WORDS: the menu's text, the chip after the pick and the card's tag line are one text, for every answer. */
      values.forEach(v => { const menu = norm(v.show || v.value); let chip = '', tag = '';
        STUFF.filters = [{ field: f.field, value: v.value }];
        try { chip = norm(chipText_(STUFF.filters[0], 0)); } catch (e) { chip = '?'; }
        try { tag = norm(facetSay_(f, v.value)); } catch (e) { tag = '?'; }
        STUFF.filters = [];
        const chipOk = chip === menu || chip === norm(f.label + ' ' + menu);
        if (!chipOk || tag !== menu) out.push({ kind: 'words-all', menu: label, value: String(v.value), say: 'menu "' + menu + '", chip "' + chip + '", tag "' + tag + '"' }); });
    });
    return JSON.stringify({ items: items.length, menus: facetList().length, findings: out });
  }))()`));
  const counts = {}; got.findings.forEach(f => { counts[f.kind] = (counts[f.kind] || 0) + 1; });
  const text = JSON.stringify({ v: 1, items: got.items, menus: got.menus, counts, findings: got.findings }, null, 1) + '\n';
  const say = `facet-data: ${got.items} cards, ${got.menus} menus — ` + (Object.keys(counts).map(k => k + ' ' + counts[k]).join(', ') || 'nothing found');
  if (CHECK) { let had = ''; try { had = fs.readFileSync(OUT, 'utf8'); } catch (e) {} console.log(say + (had === text ? ' (current)' : ' (STALE)')); process.exit(had === text ? 0 : 1); }
  fs.writeFileSync(OUT, text);
  console.log(say + ' (' + Math.round((Date.now() - t0) / 1000) + 's)');
  if (process.argv.includes('-v')) got.findings.forEach(f => console.log(`${f.kind}\t${f.menu}\t${f.value}\t${f.say}`));
  process.exit(0);
})().catch(e => { console.error('facet-data: ' + (e && e.stack || e)); process.exit(2); });
