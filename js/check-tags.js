#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-tags.js EVERY FACT ITS OWN TAG (owner, 12 Nov: "Paper 1" said with a year next to it after Doesn't matter at Year). */
/* Walks Find's funnel in the real app, answering each question AND Doesn't matter, and fails when an answer, a chip or a card tag says */
/* words that are not its own facet's: another facet's value glued on (`Paper 1 · 2017`) is that facet's own tag, never part of this one. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MAX_NODES = Number(process.env.TAGS_NODES) || 260, MAX_CHILDREN = 6, CARDS = 3;

/* A DRAWN TEXT IS ITS OWN when every piece of it (cut at an ellipsis) sits inside one of its own words. */
const key = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function glued(text, own) {
  const forms = own.map(key).filter(Boolean);
  return String(text).split('…').map(key).filter(Boolean).some(p => !forms.some(f => (' ' + f + ' ').indexOf(' ' + p + ' ') !== -1 || f.indexOf(p) !== -1));
}
/* AND HOLDS NO OTHER FACET'S VALUE for the same cards (a title that spells the year included) unless its own short words say it too. */
function holds(text, short, others) {
  const t = ' ' + key(text) + ' ', mine = short.map(s => ' ' + key(s) + ' ');
  return others.find(o => { const k = ' ' + key(o) + ' '; return k.trim().length > 1 && t.indexOf(k) !== -1 && !mine.some(m => m.indexOf(k) !== -1); }) || '';
}
/* MUTATION PROOF: the owner's bug is caught, as words or as a title; the plain tag and a shortened title of its own pass. */
if (!glued('Paper 1 · 2017', ['Paper 1']) || !glued('Paper 1… 2017', ['Paper 1']) || glued('Paper 1', ['Paper 1'])
    || glued('Paper 1 (Non-calc…', ['Paper 1 (Non-calculator) — June 2019'])
    || holds('Paper 1 (Non-calculator) — June 2019', ['Paper 1'], ['2019', 'June']) !== '2019' || holds('Paper 1', ['Paper 1'], ['1', '2019'])) {
  console.error('check-tags: the glued-tag rule fails its own mutation test'); process.exit(2);
}

(async () => {
  const { app, tick } = require('../check/jsdom-app.js');
  const payload = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8'));
  const A = await app(payload);
  const ev = s => A.w.__ev(s);
  const t0 = Date.now();
  ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  while (!ev('LOADED && finderSettled_() && (LIBRARY_ROWS || []).length > 0')) {
    if (Date.now() - t0 > 240000) { console.error('check-tags: the app never settled in 240s — NOT checked'); process.exit(2); }
    await tick(250);
    ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  }
  /* THE OWNER'S PATH FIRST, then breadth first: each answer and each Doesn't matter is a place of its own. */
  const seeds = [[], [{ field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Questions' }, { field: 'subject', value: 'Maths' },
    { field: 'documentType', value: 'Past paper' }, { field: 'examYear', any: true }]];
  const got = JSON.parse(ev(`(() => {
    const key = ${key.toString()};
    ${glued.toString()}
    ${holds.toString()}
    const short = (f, u) => { const o = [u]; try { o.push(facetSay_(f, u)); } catch (e) {} try { if (f.tagSay) o.push(f.tagSay(u)); } catch (e) {}
      return o.map(String).concat([f.label + ' ' + u]); };
    const say = (f, u) => { const o = short(f, u); try { if (f.nameOf) o.push(...asList_(f.nameOf(u))); } catch (e) {}
      o.slice().forEach(w => { try { o.push(...nameForms_(String(w))); } catch (e) {} }); return o.map(String); };
    /* EVERY OTHER FACET'S WORDS for these cards: a tag that spells one is two facts in one tag. */
    const others = (list, mine) => { const o = new Set();
      list.slice(0, 20).forEach(x => facetList().forEach(g => { if (mine.indexOf(g.field) !== -1) return;
        let vs = []; try { vs = facetOwn_(g, x); } catch (e) { vs = []; }
        vs.forEach(u => { o.add(String(u)); try { o.add(String(facetSay_(g, u))); } catch (e) {} }); }));
      return [...o]; };
    const twice = (t, sh, list, mine) => { const h = holds(t, sh, others(list, mine)); return h ? ' — it spells "' + h + '", another facet\\'s' : ''; };
    const bad = [], queue = ${JSON.stringify(seeds)}, seen = new Set();
    let nodes = 0, answers = 0, tags = 0, skips = 0;
    /* AND THE OWNER'S PATH DOWN TO ITS LAST QUESTION, each step Doesn't matter or the first answer, so the Paper question is read under both. */
    [true, false].forEach(skip => { let at = queue[1].slice();
      for (let i = 0; i < 16; i++) { const f = inFinder_(FINDERS.stuff, () => { STUFF.filters = at; STUFF.admit = null; const l = stuffFiltered(); return l.length ? nextFacet(l) : null; });
        if (!f) break; const v = !skip && inFinder_(FINDERS.stuff, () => facetValues(stuffFiltered(), f)[0]);
        at = at.concat(v ? [v.value].concat(v.also || []).map(u => ({ field: f.field, value: u })) : [{ field: f.field, any: true }]); queue.splice(2, 0, at); } });
    const where = fs =>fs.map(c => c.any ? 'Doesn\\'t matter' : c.value).join(' \\u203a ') || 'the front';
    while (queue.length && nodes < ${MAX_NODES}) {
      const filters = queue.shift(), k = JSON.stringify(filters);
      if (seen.has(k)) continue;
      seen.add(k);
      inFinder_(FINDERS.stuff, () => {
        STUFF.filters = filters; STUFF.admit = null;
        const items = stuffFiltered();
        if (!items.length) return;
        nodes++;
        if (filters.some(c => c.any)) skips++;
        /* THE CHIPS, as the row draws them. */
        filters.forEach((c, i) => { if (c.any) return; const fc = facetBy(c.field); if (!fc) return;
          const t = chipText_(c, i), two = twice(t, short(fc, c.value), items, [fc.field]);
          if (glued(t, say(fc, c.value)) || two) bad.push(where(filters) + ': the ' + fc.label + ' chip reads "' + t + '", not its own words' + two); });
        /* EACH CARD'S TAGS: the facet a tag names (and its data-also), said in those facets' words for this card. */
        items.slice(0, ${CARDS}).forEach(x => {
          const d = document.createElement('div'); d.innerHTML = tagRow_(x);
          d.querySelectorAll('.qtag').forEach(el => { tags++;
            const fc = facetBy(el.getAttribute('data-f')); if (!fc) return;
            const fields = [fc].concat(String(el.getAttribute('data-also') || '').split(' ').filter(Boolean).map(facetBy).filter(Boolean));
            const vals = g => { try { return (facetTags_(g, x) || []).map(String); } catch (e) { return []; } };
            const own = [].concat(...fields.map(g => [].concat(...vals(g).map(u => say(g, u)))));
            const two = twice(el.textContent, [].concat(...fields.map(g => [].concat(...vals(g).map(u => short(g, u))))), [x], fields.map(g => g.field));
            if (glued(el.textContent, own) || two) bad.push(where(filters) + ': a ' + x.kind + ' card\\'s ' + fc.label + ' tag reads "' + el.textContent + '", not its own words' + two); });
        });
        const f = nextFacet(items);
        if (!f) return;
        const values = facetValues(items, f);
        values.forEach(v => { answers++;
          const mine = [v.value].concat(v.also || []), ks = new Set(mine.map(spellKey_));
          const under = items.filter(x => facetOwn_(f, x).some(u => ks.has(spellKey_(u))));
          const t = v.show != null ? v.show : v.text || v.value;
          const two = twice(t, [].concat(...mine.map(u => short(f, u))), under, [f.field]);
          if (glued(t, [].concat(...mine.map(u => say(f, u))).concat([v.text || ''])) || two) bad.push(where(filters) + ': the ' + f.label + ' answer reads "' + t + '", not its own words' + two); });
        values.slice(0, ${MAX_CHILDREN}).forEach(v => queue.push(filters.concat([v.value].concat(v.also || []).map(u => ({ field: f.field, value: u })))));
        queue.push(filters.concat([{ field: f.field, any: true }]));
      });
    }
    inFinder_(FINDERS.stuff, () => { STUFF.filters = []; STUFF.admit = null; });
    return JSON.stringify({ bad: [...new Set(bad)], nodes, answers, tags, skips });
  })()`));
  A.close();
  console.log('check-tags: ' + got.nodes + ' places in Find (' + got.skips + ' under a Doesn\'t matter), ' + got.answers + ' answers and ' + got.tags + ' card tags read');
  if (got.nodes < 20 || !got.skips || !got.tags) { console.error('check-tags: the walk reached too little to prove anything — NOT a pass'); process.exit(1); }
  if (got.bad.length) {
    console.error('check-tags: ' + got.bad.length + ' tag(s) say another fact than their own — every fact is its own tag (docs/rules.md):');
    got.bad.slice(0, 25).forEach(b => console.error('  ' + b));
    process.exit(1);
  }
  console.log('OK — every answer, chip and card tag says its own fact, after every answer and every Doesn\'t matter');
  process.exit(0);
})();
