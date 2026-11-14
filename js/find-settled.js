/* @family. — js/find-settled.js THE FIRST PAINT IS THE LAST (546): whether every source has come, and the build's answer for where the finder stands (cut from find-pages.js). */
/* WHETHER ANY SOURCE'S INDEX IS STILL ON ITS WAY (546) — every loader keeps `asking` on its own state, read here as one list. */
const writingAsking_ = () => [BIBLE, window.TALMUD, window.QURAN, window.HADITH, window.WORKS, TEXTS, PDTEXTS, window.ORTHO, window.HYMNS].some(S => S && S.asking);

/* ---------- THE FIRST PAINT IS THE LAST (546): a question the build already answered (FINDER_TAGS, tools/finder-tags.js) is painted whole while the finder's files still arrive, so no list of answers grows or changes in front of you. */
const finderSettled_ = () => {
  try {
    if (typeof awaiting_ === 'function' && awaiting_()) return false;
    /* A KEPT PAYLOAD DRAWS BEFORE THE LIBRARY (1070): the build's answers stand until the cards are in. */
    if (typeof LIBRARY_LATE !== 'undefined' && LIBRARY_LATE) return false;
    if (typeof LIBRARY_ASK !== 'undefined' && (LIBRARY_ASK || LIBRARY_EXTRA_ASK)) return false;
    return !writingAsking_();
  } catch (e) { return true; }
};
/* WHICH VIEW OF THE LIBRARY THIS VIEWER HAS: admin or not, the Bible or not — no age lines (1040). */
function finderTagsView_() {
  const T = typeof FINDER_TAGS !== 'undefined' ? FINDER_TAGS : null;
  if (!T || !T.views) return null;
  /* AN ADMIN SEES People and Settings: a view of its own. */
  let adm = false;
  try { adm = typeof isAdmin === 'function' && isAdmin(); } catch (e) { adm = false; }
  const v = T.views[(adm ? 'admin+' : '') + (typeof bibleFor_ === 'function' && bibleFor_() ? 'bible' : '')];
  return v ? Object.assign({}, T.same || {}, v) : null;
}
/* WHERE THE FINDER STANDS, as the build writes it: each chip in the order pressed, `field=value` or `field=*` for Doesn't matter. */
const finderStateKey_ = () => (STUFF.filters || []).map(f => f.field + '=' + (f.any ? '*' : f.value)).join('&');
/* A FRESH START ONLY (no answer pressed, R4): once pressed, the funnel answers over what had come, as it always did. */
function finderTagsAt_() {
  if (STUFF.admit != null || finderSettled_()) return null;
  const key = finderStateKey_(), view = key === null ? null : finderTagsView_();
  const at = view && view[key], facet = at && facetBy(at[0]);
  return facet ? { facet: facet, values: at[1].map(v => ({ value: v[0], show: v.length > 1 ? v[1] : v[0], also: v[2] })) } : null;
}
