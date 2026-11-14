/* @family. — js/find-quick.js A FIND TAP LOOKED UP, NOT COUNTED (1100): § */

/* AND ONCE SETTLED (1100): § */
function finderTagsLook_() {
  const fs = STUFF.filters || [];
  if (!fs.length || fs.some(f => !f || f.any) || STUFF.admit != null || !finderSettled_()) return null;
  const view = finderTagsView_(), at = view && view[finderStateKey_()];
  if (!at || !(at[3] > 1) || !finderTagsSame_(view, fs[0])) return null;
  const facet = facetBy(at[0]);
  return facet ? { facet: facet, values: at[1].map((v, i) => ({ value: v[0], show: v.length > 1 ? v[1] : v[0], also: v[2], n: (at[2] || [])[i], say: (at[4] || [])[i] })) } : null;
}
/* THE BUILD'S LIBRARY IS THIS ONE when the facets are its facets, nothing failed to come, no press makes Your result a § */
/* chip's cards are as many as it counted (one tally of the whole list, held). Anything else is counted live, as before. */
const TAGS_SAME = { all: null, gen: -1, by: {} };
function finderTagsSame_(view, first) {
  try {
    const T = FINDER_TAGS, all = stuffItems(), gen = typeof LIB !== 'undefined' && LIB ? LIB.gen : 0;
    if (!T || T.facets !== facetList().map(f => f.field).join(',')) return false;
    const m = myResults_();
    if (m && m.size) return false;
    if ([BIBLE, window.TALMUD, QURAN, window.HADITH, window.WORKS, TEXTS, PDTEXTS, window.ORTHO, HYMNS].some(b => b && b.failed)) return false;
    if (TAGS_SAME.all !== all || TAGS_SAME.gen !== gen) { TAGS_SAME.all = all; TAGS_SAME.gen = gen; TAGS_SAME.by = {}; }
    const k = first.field + '=' + first.value;
    if (k in TAGS_SAME.by) return TAGS_SAME.by[k];
    const root = view[''], i = root && root[0] === first.field ? root[1].findIndex(v => v[0] === first.value) : -1;
    const live = i < 0 ? null : (facetTally_(stuffSorted_(all), facetBy(root[0])).values || []).find(v => spellKey_(v.value) === spellKey_(first.value));
    return (TAGS_SAME.by[k] = !!live && live.n === (root[2] || [])[i]);
  } catch (e) { return false; }
}

/* A WALK'S NEXT QUESTION (`finderWalk_`), the build's own while its library is this one; null when it must be counted. */
function finderTagsNext_(out) {
  try {
    if (!out.length || out.some(f => f.any) || !finderSettled_()) return null;
    const view = finderTagsView_(), at = view && view[out.map(f => f.field + '=' + f.value).join('&')];
    const facet = at && finderTagsSame_(view, out[0]) ? facetBy(at[0]) : null;
    return facet ? { facet: facet, n: at[3], has: v => at[1].some(a => spellKey_(a[0]) === spellKey_(v)) } : null;
  } catch (e) { return null; }
}

/* THE BUILD'S WORDS (1100, js/finder-tags.js `#says`) while its library is this one (`finderTagsSame_` on Practice and Library): § */
const SAYS_BUILT = new WeakMap();
function answerSaysBuilt_(items) {
  if (SAYS_BUILT.has(items)) return SAYS_BUILT.get(items);
  let out = null;
  try {
    const view = finderSettled_() ? finderTagsView_() : null, said = view && view['#says'];
    if (said && ['Practice', 'Library'].every(v => finderTagsSame_(view, { field: 'kindLabel', value: v }))) {
      out = {};
      Object.keys(said).forEach(f => { const m = out[f] = new Map(); Object.keys(said[f]).forEach(v => m.set(spellKey_(v), said[f][v])); });
    }
  } catch (e) { out = null; }
  /* NOT HELD WHILE THE FINDER IS STILL FILLING: asked again once it settles. */
  if (out || finderSettled_()) SAYS_BUILT.set(items, out);
  return out;
}

/* A BIG LIST'S CARDS BY ONE FACET'S ANSWER (1100), in the list's order, made once (or ahead, `frontWarm_`): § */
/* Not for a facet that reads the chips or your presses (`OWN_LIVE`), and only over NARROW_BIG cards, where a walk is felt. */
const NARROW_INDEX = new WeakMap(), NARROW_BIG = 20000, OWN_LIVE = { myResult: 1, wCollection: 1 };
function narrowIndex_(items, field, make) {
  if (!items || items.length < NARROW_BIG || OWN_LIVE[field]) return null;
  let per = NARROW_INDEX.get(items);
  if (!per) NARROW_INDEX.set(items, per = {});
  const facet = facetBy(field);
  if (!facet) return null;
  if (per[field] && per[field].facet === facet && per[field].gen === LIB.gen) return per[field].by;
  if (make === false) return null;
  const by = new Map();
  for (const x of items) {
    const seen = new Set();
    for (const v of facetOwn_(facet, x)) {
      const k = spellKey_(v);
      if (seen.has(k)) continue;
      seen.add(k);
      let a = by.get(k);
      if (!a) by.set(k, a = []);
      a.push(x);
    }
  }
  per[field] = { facet: facet, gen: LIB.gen, by: by };
  return by;
}

/* THE FRONT ANSWERS' LISTS, NARROWED WHILE NOTHING ELSE RUNS (1100), one an idle moment, so the first tap on Practice or § */
const FRONT_WARM = { list: [], for: null, at: ['Practice', 'Library'] };
function frontWarm_() {
  if (typeof finderSettled_ !== 'function' || !finderSettled_()) return;
  const F = FINDERS.stuff, all = inFinder_(F, () => stuffItems());
  if (FRONT_WARM.for === all) return;
  FRONT_WARM.for = all; FRONT_WARM.list = [];
  const idle = typeof requestIdleCallback === 'function' ? requestIdleCallback : f => setTimeout(f, 50);
  const one = i => idle(() => {
    if (FRONT_WARM.for !== all || i >= FRONT_WARM.at.length) return;
    inFinder_(F, () => {
      const was = STUFF.filters, memo = FIND_MEMO;
      try {
        STUFF.filters = [{ field: 'kindLabel', value: FRONT_WARM.at[i] }];
        const items = stuffFiltered();
        FRONT_WARM.list.push(Object.assign({}, FIND_MEMO, { recent: null }));
        /* AND ITS NEXT QUESTION'S ANSWERS INDEXED, as the build says it is asked. */
        const view = finderTagsView_(), q = view && view['kindLabel=' + FRONT_WARM.at[i]];
        if (q) narrowIndex_(items, q[0]);
      } catch (e) { /* warmed or not, the tap narrows as before */ }
      STUFF.filters = was; FIND_MEMO = memo;
    });
    one(i + 1);
  });
  one(0);
}

/* A TAP IS SEEN BEFORE IT IS COUNTED (1100): a question the build looked up paints now; one counted live shows its chips and the loader */
/* this frame and is counted after it, unless another tap has moved the chips on by then. */
/* A LIST ALREADY NARROWED (Back) has its question held with it, so it paints now too. */
const stuffSeen_ = () => { const k = JSON.stringify([STUFF.filters, USER ? USER.credits : -1]); return FIND_MEMO.key === k || (FIND_MEMO.recent || []).some(m => m.key === k); };
function paintStuffSoon_() {
  const F = FINDER;
  let now = true;
  try { now = !!(finderTagsAt_() || finderTagsLook_() || stuffSeen_()); } catch (e) { now = true; }
  if (now || typeof requestAnimationFrame !== 'function') return paintStuff();
  findMenuFill_(F, [{ type: 'wait', on: true }]);
  const want = JSON.stringify(STUFF.filters), at = PAGE[F.id] || 0;
  /* A PAGE TURNED BEFORE THE LATE PAINT LANDS is kept: painting "fresh" threw the child back to the question. */
  requestAnimationFrame(() => setTimeout(() => inFinder_(F, () => { if (JSON.stringify(STUFF.filters) === want) paintStuff((PAGE[F.id] || 0) !== at); }), 0));
}

/* THE MENU A CHIP WAS PICKED FROM, AS THE BUILD WROTE IT (1100): § */
function chipShowBuilt_(before, f) {
  try {
    if (before.some(c => !c || c.any) || STUFF.admit != null || !finderSettled_()) return null;
    const view = finderTagsView_(), at = view && view[before.map(c => c.field + '=' + c.value).join('&')];
    if (!at || at[0] !== f.field || !finderTagsSame_(view, before[0] || f)) return null;
    const v = at[1].find(a => [a[0]].concat(a[2] || []).some(u => spellKey_(u) === spellKey_(f.value)));
    return v ? (v.length > 1 ? v[1] : v[0]) : null;
  } catch (e) { return null; }
}

/* HELD ON THE BUNDLE, AND MADE IN THE QUIET (1100): each paper's tag row reads its pages, half a second at 4x, so the tap paints the */
/* card with its own tag first and the shared ones join its row a moment later. */
function bundleTags_(b) {
  if (!b) return bundleTagsOf_(b);
  if (b.tagsHtml != null) return b.tagsHtml;
  if (!b.tagsAsked) {
    b.tagsAsked = true;
    const idle = typeof requestIdleCallback === 'function' ? requestIdleCallback : f => setTimeout(f, 30);
    idle(() => {
      try { b.tagsHtml = bundleTagsOf_(b); } catch (e) { b.tagsHtml = ''; return; }
      let now = null;
      try { now = inFinder_(FINDERS.stuff, () => BUNDLE_MEMO.get(FIND_MEMO.items)); } catch (e) { now = null; }
      /* INTO THE ONE CARD'S TAG PART, its name still the first tag (`findCard`). */
      const name = b.title || 'These papers', t = kcUnpicked_(b.tagsHtml), html = kcSays_(t, name) ? t : kcTagFirst_(t, name);
      if (now === b) document.querySelectorAll('#s-stuff .card.bundle > .kc-tags').forEach(el => { el.innerHTML = html; });
    });
  }
  return String(tagRow_(BUNDLE_ITEM) || cardBlock_({ type: 'group', look: 'qtags qcard-tags' }));
}
