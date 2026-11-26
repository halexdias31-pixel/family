#!/usr/bin/env node
/* @family. — tools/one-order.js THE ONE-ORDER CHECK (rule 1.75, owner 24 Nov: "general before specific", a principle, not a hand order):
   Find asks its tags in ONE fixed order per door (facetOrder_, js/find-facets.js), counted once from every item of the door: a tag whose every
   answer sits inside one answer of another is asked after it. A child would notice two things, and both are counted here, for a child on a phone:
   (a) THE SAME ORDER WHATEVER WAS TAPPED: in Learn (Practice and Library, one door since 26 Nov), several different first answers each walked forward — no two walks ask two tags
       in opposite orders, and no tag is asked before one it nests in (nesting counted here on its own, over the whole door);
   (b) EVERY ITEM REACHABLE BY FORWARD TAPS ONLY (no chip deleted): the funnel's tree walked from each door, every answer and "Doesn't matter"
       for the cards no answer holds, until the list stops asking; the items reached against the door's total.
   `--prove` breaks each rule in the page and fails unless every break is caught. Run by tools/build.js after `bundle`. */
'use strict';
const { main } = require('./lib/gen.js');
const SB = require('./lib/site-browser.js');

const DOORS = ['Learn'];
/* HOW MANY DIFFERENT FIRST ANSWERS EACH DOOR IS WALKED FROM, and how deep each walk goes. */
const FIRSTS = 6, STEPS = 14;
/* A HARD LIMIT PER DOOR: a walk that runs past it FAILS with a word why, never hangs the build. */
const LIMIT = 60000;

/* THE BREAKS --prove makes. */
const BREAKS = [
  { name: 'none' },
  /* The order changes as you tap: turned round under any first answer but the one tapped first. */
  { name: 'order that changes with the taps', js: () => { const real = facetOrder_; facetOrder_ = d => { const o = real(d), c = (STUFF.filters || [])[1];
    if (!c) return o; const k = c.field + '=' + c.value; window.__firstTap = window.__firstTap || k;
    return window.__firstTap === k ? o : o.slice().reverse(); }; } },
  /* Specific before general: each door's order counted afresh, then every tag that nests in another put first. */
  { name: 'specific before general', js: () => { const real = facetOrder_; window.ORDER_LIVE = true; ORDER_MEMO_.from = null;
    facetOrder_ = d => { const o = real(d), w = ORDER_MEMO_.why[d === undefined ? facetDoor_() : d];
      const deep = w ? o.filter(f => (w.get(f.field) || []).length) : [];
      return deep.concat(o.filter(f => deep.indexOf(f) === -1)); }; } },
  /* "Doesn't matter" loses the cards that have no answer to it: those cards can no longer be reached. */
  { name: "Doesn't matter drops the blanks", js: () => { const real = stuffFiltered; stuffFiltered = () => { const anys = (STUFF.filters || []).filter(f => f.any).map(f => facetBy(f.field)).filter(Boolean);
    return real().filter(x => anys.every(f => facetOwn_(f, x).length)); }; } },
];

/* EVERYTHING ONE DOOR NEEDS, counted in the page. */
function probe(arg) {
  const { door, firsts, steps } = arg;
  return inFinder_(FINDERS.stuff, () => {
    const at = filters => { STUFF.filters = filters; STUFF.admit = null; return stuffFiltered(); };
    const ask = items => items.length < 2 ? null : (nextFacet(items) || overFacet_(items));
    const chips = (f, v) => [v.value].concat(v.also || []).map(u => ({ field: f.field, value: u }));
    const top = [{ field: 'kindLabel', value: door }];
    const all = at(top), out = { door, total: all.length, walks: [], wrong: [], nest: [], reached: 0, unreached: [], anys: 0, nodes: 0, leaves: 0 };
    /* (a) WALKS FROM DIFFERENT FIRST ANSWERS. */
    const q1 = ask(all);
    if (!q1) { out.wrong.push(door + ': nothing asked'); return out; }
    const v1 = facetValues(all, q1), pick = [];
    for (let i = 0; i < firsts && i < v1.length; i++) pick.push(v1[Math.floor(i * v1.length / Math.min(firsts, v1.length))]);
    pick.forEach((v, n) => {
      let filters = top.concat(chips(q1, v)), seq = [q1.field];
      for (let s = 0; s < steps; s++) {
        const items = at(filters), f = ask(items);
        if (!f) break;
        seq.push(f.field);
        const vs = facetValues(items, f);
        filters = filters.concat(chips(f, vs[(n + s) % vs.length]));
      }
      out.walks.push(seq);
    });
    const pos = {};
    out.walks.forEach(seq => seq.forEach((f, i) => seq.slice(i + 1).forEach(g => { pos[f + '>' + g] = 1; })));
    Object.keys(pos).forEach(k => { const [f, g] = k.split('>'); if (pos[g + '>' + f] && f < g) out.wrong.push(door + ': ' + f + ' and ' + g + ' asked in both orders'); });
    /* NESTING, COUNTED HERE ON ITS OWN over the whole door: B after every A it nests in. */
    const inside = (B, A) => { const t = echoTo_(all, B, A); return !!t && Object.keys(t).length > 0; };
    const seen = [...new Set([].concat(...out.walks))].map(facetBy).filter(Boolean);
    const TWO = {}, two = f => f.field in TWO ? TWO[f.field] : (TWO[f.field] = (() => { const s = new Set(); for (const x of all) { facetOwn_(f, x).forEach(u => s.add(spellKey_(u))); if (s.size > 1) return true; } return false; })());
    const IN = {}, inside2 = (B, A) => { const k = B.field + '>' + A.field; return k in IN ? IN[k] : (IN[k] = inside(B, A)); };
    out.walks.forEach(seq => seq.forEach((b, i) => seq.slice(i + 1).forEach(a => {
      const B = facetBy(b), A = facetBy(a);
      if (A && B && two(A) && inside2(B, A) && !inside2(A, B)) out.nest.push(door + ': ' + b + ' asked before ' + a + ', which it nests in');
    })));
    out.nest = [...new Set(out.nest)];
    out.order = seen.map(f => f.field);
    /* (b) REACHABILITY: forward taps only; a node is walked for the cards it still has to reach. */
    /* IN PLAIN JS, ONE PASS: each menu's cards are its parent's that hold the tapped answer (Doesn't matter keeps them all), never the library filtered again. */
    const got = new Set(), leafAny = [], leafOne = [];
    const walk = (filters, items, want) => {
      if (Date.now() > arg.until) throw new Error('one-order: timed out walking ' + door + ' after ' + out.nodes + ' menus');
      want = want.filter(x => !got.has(x));
      if (!want.length) return;
      out.nodes++;
      STUFF.filters = filters;
      const f = ask(items);
      if (!f) { (filters.some(c => c.any) ? leafAny : leafOne).push([filters, items]); items.forEach(x => got.add(x)); return; }
      const vs = facetValues(items, f);
      for (const v of vs) {
        const keys = new Set([v.value].concat(v.also || []).map(spellKey_)), has = x => facetOwn_(f, x).some(u => keys.has(spellKey_(u)));
        const sub = want.filter(has);
        if (!sub.length) continue;
        const kids = items.filter(has);
        /* A menu of one card shows that card: reached without asking. */
        if (kids.length < 2) { kids.forEach(x => got.add(x)); continue; }
        walk(filters.concat(chips(f, v)), kids, sub);
      }
      /* "Doesn't matter" for the cards no answer offered holds. */
      const rest = want.filter(x => !got.has(x));
      if (rest.length) { out.anys++; walk(filters.concat([{ field: f.field, any: true }]), items, rest); }
    };
    walk(top, all, all);
    /* THE LIST THE SITE SHOWS at a sample of the walk's last menus (half after a Doesn't matter): a card the walk counted but the page drops is not reached. */
    const sample = l => l.filter((_, i) => i % Math.max(1, Math.ceil(l.length / 30)) === 0);
    sample(leafAny).concat(sample(leafOne)).forEach(([filters, items]) => {
      const shown = new Set(at(filters));
      items.forEach(x => { if (!shown.has(x)) got.delete(x); });
      out.leaves++;
    });
    out.reached = all.filter(x => got.has(x)).length;
    out.unreached = all.filter(x => !got.has(x)).slice(0, 5).map(x => String(x.title || x.name || x.key || '?').slice(0, 60));
    STUFF.filters = [];
    return out;
  });
}

/* ONE PAGE FOR EVERY BREAK (--prove): the library loads once; each break starts from the functions as they came. */
const openPage = () => SB.open({ as: 'child', ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().length > 0 && typeof facetOrder_ === 'function' });
async function check(brk, shared) {
  const pg = shared || await openPage();
  const bad = [], rep = [];
  const T0 = Date.now();
  try {
    await pg.evaluate(() => { const O = window.__orig || (window.__orig = { nextFacet, facetOrder_, facetWhy_, stuffFiltered }); nextFacet = O.nextFacet; facetOrder_ = O.facetOrder_; facetWhy_ = O.facetWhy_; stuffFiltered = O.stuffFiltered; window.ORDER_LIVE = false; ORDER_MEMO_.from = null; });
    if (brk && brk.js) await pg.evaluate(brk.js);
    for (const door of DOORS) {
      const r = await Promise.race([pg.evaluate(probe, { door, firsts: FIRSTS, steps: STEPS, until: Date.now() + LIMIT }),
        new Promise((_, no) => setTimeout(() => no(new Error('one-order: ' + door + ' took over ' + (LIMIT / 1000 + 30) + 's, failed rather than hang')), LIMIT + 30000))]);
      r.secs = Math.round((Date.now() - T0) / 1000);
      rep.push(r);
      r.wrong.concat(r.nest).forEach(w => bad.push(w));
      if (r.walks.length < 2) bad.push(door + ': only ' + r.walks.length + ' first answer(s) to walk from');
      if (r.reached < r.total) bad.push(door + ': ' + (r.total - r.reached) + ' of ' + r.total + ' items not reachable by forward taps (' + r.unreached.join('; ') + ')');
    }
  } finally { if (!shared) await pg.close(); }
  return { bad, rep };
}

async function run() {
  if (process.argv.indexOf('--prove') > 0) {
    const missed = [], pg = await openPage();
    for (const b of BREAKS) {
      /* A break that runs past the limit has failed loudly: caught. */
      const { bad } = await check(b, pg).catch(e => ({ bad: [String(e.message || e)] }));
      if (b.name === 'none' && bad.length) throw new Error('one-order --prove: the unbroken site already fails (' + bad[0] + ')');
      if (b.name !== 'none' && !bad.length) missed.push(b.name);
      if (b.name !== 'none') console.log('  break "' + b.name + '": ' + (bad.length ? 'caught — ' + bad[0] : 'MISSED'));
    }
    await pg.close();
    await SB.done();
    if (missed.length) throw new Error('one-order --prove: missed ' + missed.join(', '));
    console.log('one-order --prove: every break caught (' + (BREAKS.length - 1) + ')');
    return;
  }
  const { bad, rep } = await check(null);
  console.log('one-order: one fixed order per door, general before specific, for a child — ' + rep.map(r => r.door + ': ' + r.walks.length + ' walks from different first answers agree ('
    + r.order.length + ' tags), ' + r.reached + '/' + r.total + ' items reachable by forward taps (' + r.nodes + ' menus, ' + r.anys + " Doesn't matter, " + r.leaves + ' last menus checked against the page, ' + r.secs + 's)').join('; ') + (bad.length ? '' : ' — ok'));
  bad.slice(0, 20).forEach(b => console.log('  ' + b));
  await SB.done();
  if (bad.length) throw new Error('one-order: ' + bad.length + ' problem(s)');
}
module.exports = { run };
main(module, run);
