/* @family. — check/surface-nesting.js: a box drawn inside a box (690), run in the page by check/ui.js. */
/* Returns each visible surface (own fill or four-sided edge) whose nearest surface ancestor in the column is another. */
(function () {
  return function surfaceNesting(sid, accepted) {
    /* CONTROLS AND PICTURES ARE NOT SURFACES: an input keeps its subtle fill, a tile, chip or avatar is a thing, not a box. */
    const NOT = 'input, textarea, select, button, img, svg, canvas, video, iframe, picture, .tile, .chip, .key, [role="button"], '
      + '.avatar, .pfp, .search, .loading, .dot';
    const col = document.getElementById('s-' + sid);
    if (!col) return [];
    const alpha = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return 0;
      const p = m[1].split(/[\s,\/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
    const surf = el => {
      if (el.matches(NOT) || el.closest('svg')) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 64 || r.height < 28) return false;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'contents') return false;
      const fill = alpha(cs.backgroundColor) > 0.02 || /gradient/.test(cs.backgroundImage);
      const edge = ['Top', 'Right', 'Bottom', 'Left'].every(s => parseFloat(cs['border' + s + 'Width']) > 0
        && cs['border' + s + 'Style'] !== 'none' && alpha(cs['border' + s + 'Color']) > 0);
      return fill || edge;
    };
    const name = el => el.tagName.toLowerCase() + [...el.classList].slice(0, 2).map(c => '.' + c).join('');
    const out = [];
    for (const el of col.querySelectorAll('*')) {
      if (!el.getClientRects().length || !surf(el)) continue;
      if (accepted.some(a => el.closest(a))) continue;
      let up = el.parentElement;
      while (up && up !== col && !surf(up)) up = up.parentElement;
      if (!up || up === col) continue;
      if (accepted.some(a => up.matches(a))) continue;
      out.push({ inner: name(el), outer: name(up) });
    }
    return out;
  };
})()
