/* @family. — check/template-measure.js ONE CARD'S RENDERED SHAPE, read in the page (tools/template-health.js passes it to page.evaluate). */
/* Returns, for every card on the glass inside `scope`, its kind, its shape signature and each template property that fails, expected vs actual. */
'use strict';

function measureCards(arg) {
  const scope = document.querySelector(arg.scope) || document.body;
  const R = document.documentElement, vw = innerWidth, vh = innerHeight;
  /* THE TOKENS, AS PIXELS AND COLOURS: a probe element takes each var() and the browser resolves it. */
  const probe = document.createElement('div'); probe.style.cssText = 'position:absolute;visibility:hidden;'; document.body.appendChild(probe);
  const px = v => { probe.style.width = v; const w = parseFloat(getComputedStyle(probe).width); probe.style.width = ''; return w; };
  const rootCs = getComputedStyle(R), tok = n => rootCs.getPropertyValue(n).trim();
  const FS = ['--fs-body', '--fs-title', '--fs-small', '--tp-fs'].map(n => px('var(' + n + ')'));
  const SP = [0].concat(['--s0', '--s1', '--s2', '--s3', '--s4', '--s5', '--s6', '--card-gap', '--tile-gap'].map(n => px('var(' + n + ')')));
  const MEASURE = px('var(--measure)'), S4 = px('var(--s4)'), TILE = px('var(--tile)'), TP_H = px('var(--tp-h)'), TP_FS = px('var(--tp-fs)');
  const colour = v => { probe.style.color = ''; probe.style.color = v; return getComputedStyle(probe).color; };
  const COL = new Set();
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch (e) { continue; }
    for (const r of rules) if (r.selectorText === ':root') for (const p of r.style) if (p.startsWith('--')) { const v = tok(p); if (v && !/^[\d.]+(px|rem|em|ch|%|s|ms)?$/.test(v) && !/\s/.test(v.replace(/,\s*/g, ','))) { const c = colour(v); if (c && c !== 'rgba(0, 0, 0, 0)' || /transparent|^#0{3,8}$/.test(v)) COL.add(rgbOf(c)); } } }
  probe.remove();
  function rgbOf(c) { const m = /(?:rgba?\(|color\(srgb )([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(c || ''); if (!m) return c;
    const f = /^color/.test(c) ? 255 : 1; return [m[1], m[2], m[3]].map(x => Math.round(parseFloat(x) * f)).join(','); }
  const alphaOf = c => { const m = /\/\s*([\d.]+)\)|rgba\([^)]*,\s*([\d.]+)\)/.exec(c || ''); return m ? parseFloat(m[1] || m[2]) : 1; };
  const colOk = c => !c || alphaOf(c) === 0 || COL.has(rgbOf(c));
  const near = (a, b, t) => Math.abs(a - b) <= (t == null ? 1 : t);
  const inSet = (v, set) => set.some(s => near(v, s, .6));
  const shown = el => { if (!el || !el.getClientRects().length) return false; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  /* A CARD ON THE GLASS: its box overlaps the viewport, and it is the outermost card (a card inside a card is that card's content). */
  const onGlass = c => arg.all || (() => { const r = c.getBoundingClientRect(); return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw; })();
  const cards = [...scope.querySelectorAll('.card')].filter(c => !c.parentElement.closest('.card') && shown(c) && onGlass(c));
  /* AND WHAT STANDS IN A PANE AS A CARD WITHOUT BEING ONE: a question, a practical's part, a worked page (the owner's "cards that don't follow the rules"). */
  const CHROME = /(^|\s)(tile-row|find-top|page-gap|sr-only|pane-gap)(\s|$)/;
  [...scope.querySelectorAll('.pane')].forEach(p => [...p.children].forEach(e => {
    while (e && !e.classList.contains('card') && /(^|\s)(favwrap|qwhole-wrap)(\s|$)/.test(e.className) && e.children.length === 1) e = e.firstElementChild;
    if (!e || e.closest('.card') || /-controls$|^stuff-/.test(e.id) || CHROME.test(e.className) || !shown(e) || !onGlass(e) || !e.textContent.trim()) return;
    if (cards.some(c => c.contains(e) || e.contains(c))) return;
    cards.push(e); }));
  const DRAWN = 'svg, canvas, video, .kc-pic, .gd-box, .kp, .scr, .cs-body, .pxe-grid, .boxer-frame, .tl-anim, figure, .anim, .hdb-ms, .tmt-box, .kt-box, .bk-cell, .hr, .nes-stage';
  const out = [];
  cards.forEach((c, ci) => {
    const fails = [], fail = (prop, expected, actual, el) => fails.push({ prop, expected, actual: String(actual).slice(0, 120), at: el && el !== c ? sel(el) : '' });
    const kc = c.classList.contains('kc');
    /* A PANEL (card_) IS NAMED BY ITS MAKER'S OWN CLASS: the settings form, the booking sheet, a message. */
    const kind = ([...c.classList].find(k => /^kc-(?!facts$|panel$|row$)/.test(k)) || '').replace(/^kc-/, '') || (c.closest('#s-reel') ? 'reel' : c.classList.contains('is-widget') ? 'widget' : c.classList.contains('qwhole') ? 'question' : c.classList.contains('prac-part') ? 'part' : '')
      || [...c.classList].filter(k => !/^(card|fc|kc|tap|is-[\w-]+|kc-[\w-]+)$/.test(k))[0] || c.tagName.toLowerCase();
    const regions = [...c.children].filter(shown).map(e => ([...e.classList].find(k => /^kc-/.test(k)) || e.tagName.toLowerCase() + (e.classList[0] ? '.' + e.classList[0] : '')).replace(/^kc-/, ''));
    const cr = c.getBoundingClientRect(), ccs = getComputedStyle(c);
    /* 1 BUILT ON THE TEMPLATE */
    if (!kc) fail('built', 'card fc kc (findCard/card_)', c.className);
    /* 2 ORDER: picture, tags, content, one tile row, nothing else */
    const ORDER = ['pic', 'tags', 'lines', 'form', 'act'];
    const idx = regions.map(r => ORDER.indexOf(r));
    if (idx.some(i => i < 0) || idx.some((v, i) => i && v < idx[i - 1])) fail('order', 'pic → tags → lines/form → act', regions.join(' → '));
    else if (regions.length && regions[regions.length - 1] !== 'act') fail('order', 'the tile row last', regions.join(' → '));
    /* 3 PICTURE ONLY IF REAL */
    const pic = c.querySelector(':scope > .kc-pic');
    if (pic && shown(pic)) { const m = pic.querySelector('img, svg, canvas, video, figure'); const real = m && (m.tagName !== 'IMG' || (m.complete && m.naturalWidth > 0));
      if (!real) fail('picture', 'a real picture or no picture part', m ? 'image did not load' : 'an empty picture part', pic); }
    /* 4 TAGS: a tag row of pills, first after the picture, each one look */
    const tagsEl = c.querySelector(':scope > .kc-tags');
    const TAG = '.qtag, .prof-tag', tags = tagsEl ? [...tagsEl.querySelectorAll(TAG)].filter(shown) : [];
    if (!tags.length) fail('tags', 'a tag row (the name is a tag)', tagsEl && shown(tagsEl) ? 'tags that are not pills: ' + tagsEl.textContent.trim().slice(0, 40) : 'no tags');
    tags.forEach(t => { const s = getComputedStyle(t), r = t.getBoundingClientRect();
      if (!near(parseFloat(s.fontSize), TP_FS, .6)) fail('tag-look', 'font ' + TP_FS.toFixed(1) + 'px', parseFloat(s.fontSize).toFixed(1) + 'px', t);
      else if (parseFloat(s.borderTopLeftRadius) < Math.min(r.height / 2 - 1, 40)) fail('tag-look', 'pill (round ends)', 'radius ' + s.borderTopLeftRadius, t);
      else if (r.height < TP_H - 1.5) fail('tag-look', 'height ≥ ' + TP_H.toFixed(1) + 'px', r.height.toFixed(1) + 'px', t);
      else if (s.borderTopStyle === 'none') fail('tag-look', '1px pill border', 'no border', t); });
    /* tags that are not the one tag row: a pill-looking span elsewhere */
    if (tagsEl) [...tagsEl.querySelectorAll('*')].filter(e => shown(e) && !e.closest(TAG) && !e.querySelector(TAG) && e.children.length === 0 && e.textContent.trim()).slice(0, 1)
      .forEach(e => fail('tags', 'only pills in the tag row', 'loose text "' + e.textContent.trim().slice(0, 40) + '"', e));
    /* 5 NO TITLE LINE */
    [...c.querySelectorAll('h1, h2, h3, h4, .fc-head, .card-title')].filter(h => shown(h) && !h.classList.contains('kc-h') && !h.closest('.kc-tags, ' + DRAWN)).slice(0, 1)
      .forEach(h => fail('title', 'no title line (the name is a tag)', h.tagName.toLowerCase() + ' "' + h.textContent.trim().slice(0, 40) + '"', h));
    /* 6 ONE ROW OF ROUND TILES AT THE BOTTOM, CENTRED */
    const act = c.querySelector(':scope > .kc-act');
    const rows = act ? [...act.querySelectorAll('.tile-row')].filter(shown) : [];
    if (!act || !shown(act) || !rows.length) fail('tiles', 'one tile row', 'none');
    else {
      const tiles = [...rows[0].querySelectorAll('.tile')].filter(t => shown(t) && !t.closest('.kc-more[hidden]'));
      const tops = new Set(tiles.map(t => Math.round(t.getBoundingClientRect().top / 4)));
      if (rows.length > 1 || tops.size > 1) fail('tiles', 'one row', (rows.length > 1 ? rows.length + ' rows' : tops.size + ' lines of tiles'), rows[0]);
      tiles.forEach(t => { const r = t.getBoundingClientRect(), s = getComputedStyle(t);
        if (!near(r.width, TILE, 1) || !near(r.height, TILE, 1)) fail('tile-size', TILE + 'px round', r.width.toFixed(0) + '×' + r.height.toFixed(0), t);
        else if (parseFloat(s.borderTopLeftRadius) < r.width / 2 - 1) fail('tile-size', 'round', 'radius ' + s.borderTopLeftRadius, t);
        if (t.textContent.trim() && !t.querySelector('svg, img') && t.textContent.trim().length > 2) fail('tile-size', 'an icon (word on hover)', 'a word "' + t.textContent.trim().slice(0, 20) + '"', t); });
      if (tiles.length) { const l = Math.min(...tiles.map(t => t.getBoundingClientRect().left)), r = Math.max(...tiles.map(t => t.getBoundingClientRect().right));
        if (!near((l + r) / 2, (cr.left + cr.right) / 2, 3)) fail('centre', 'tile row centred', 'off by ' + ((l + r) / 2 - (cr.left + cr.right) / 2).toFixed(0) + 'px', rows[0]); }
    }
    /* 7 NO STRAY CONTROLS: every button and link outside the tile row is a form's or a tag */
    [...c.querySelectorAll('button, a[href], .btn, .tile, [role="button"]')].filter(b => shown(b) && !b.closest('.kc-act, .kc-tags, form, .kc-form, .me-form, ' + DRAWN) && !(b.parentElement && b.parentElement.closest('button, a[href], .tile, .btn, [data-do]')))
      .slice(0, 1).forEach(b => fail('stray', 'controls only in the tile row (or a form)', (b.className || b.tagName.toLowerCase()) + ' "' + (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 30) + '"', b));
    /* 8 CENTRED, ONE COLUMN, NO WIDER THAN THE MEASURE */
    if (cr.width > MEASURE + 2 * S4 + 1) fail('width', '≤ ' + (MEASURE + 2 * S4).toFixed(0) + 'px', cr.width.toFixed(0) + 'px');
    if (ccs.textAlign !== 'center') fail('centre', 'text-align center', ccs.textAlign);
    const pr = c.parentElement.getBoundingClientRect(), pcs = getComputedStyle(c.parentElement);
    const pl = pr.left + parseFloat(pcs.paddingLeft), prr = pr.right - parseFloat(pcs.paddingRight);
    if (!near((cr.left + cr.right) / 2, (pl + prr) / 2, 3) && cr.width < prr - pl - 2) fail('centre', 'card centred in its column', 'off by ' + ((cr.left + cr.right) / 2 - (pl + prr) / 2).toFixed(0) + 'px');
    /* 9 SIZES AND COLOURS FROM THE TOKENS (text drawn as a figure is the figure's) */
    let seenFs = 0, seenCol = 0, seenRad = 0;
    [...c.querySelectorAll('*')].forEach(e => {
      if (e.closest(DRAWN) || !shown(e)) return;
      const s = getComputedStyle(e), own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (own && !seenFs && !inSet(parseFloat(s.fontSize), FS) && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName)) { seenFs = 1; fail('font', 'a --fs token (' + FS.map(f => f.toFixed(1)).join('/') + 'px)', parseFloat(s.fontSize).toFixed(1) + 'px', e); }
      if (own && !seenCol && !colOk(s.color)) { seenCol = 1; fail('colour', 'a palette token', s.color, e); }
      const rad = parseFloat(s.borderTopLeftRadius), r = e.getBoundingClientRect();
      if (!seenRad && rad > 0 && !(rad >= Math.min(r.width, r.height) / 2 - 1) && !inSet(rad, [px2('--r'), px2('--r-sm'), px2('--r-surface'), px2('--btn-r')])) { seenRad = 1; fail('radius', 'a radius token', s.borderTopLeftRadius, e); }
    });
    /* 10 NO INLINE STYLES */
    /* A STYLE THAT ONLY HANDS CSS A NUMBER (`--n:2`) is data, not a look; anything else is a look written outside the stylesheet. */
    const looks = e => e.getAttribute('style').split(';').map(x => x.trim()).filter(x => x && !/^--[\w-]+\s*:/.test(x));
    const inl = [c, ...c.querySelectorAll('[style]')].filter(e => e.hasAttribute('style') && looks(e).length && !e.closest(DRAWN) && shown(e));
    if (inl.length) fail('inline', 'no style="…"', inl.length + ' (' + looks(inl[0]).join(';').slice(0, 50) + ')', inl[0]);
    /* 11 SPACING: the card's own padding and its parts' gaps from the scale */
    const pads = [ccs.paddingTop, ccs.paddingBottom].map(parseFloat);
    if (pads.some(p => !inSet(p, SP))) fail('spacing', 'card padding from the --s scale', pads.join('/') + 'px');
    [...c.children].filter(shown).forEach((e, i) => { if (!i) return; const m = parseFloat(getComputedStyle(e).marginTop); if (!inSet(m, SP)) fail('spacing', 'a part\'s gap from the --s scale', m + 'px', e); });
    const tagR = tags[0] && tags[0].getBoundingClientRect(), tileR = act && act.querySelector('.tile') && act.querySelector('.tile').getBoundingClientRect();
    out.push({ i: ci, kind, regions: regions.join('>'), fails, pad: pads.join('/'), tagH: tagR ? Math.round(tagR.height) : 0, tagFs: tags[0] ? parseFloat(getComputedStyle(tags[0]).fontSize) : 0,
      tileW: tileR ? Math.round(tileR.width) : 0, rect: { x: cr.left + scrollX, y: cr.top + scrollY, w: cr.width, h: cr.height }, sel: cardSel(c) });
  });
  function px2(n) { return parseFloat(getComputedStyle(R).getPropertyValue(n)) * (/rem/.test(getComputedStyle(R).getPropertyValue(n)) ? parseFloat(getComputedStyle(R).fontSize) : 1) || 0; }
  function sel(el) { return el.tagName.toLowerCase() + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : ''); }
  function cardSel(c) { c.setAttribute('data-th', String(Math.random()).slice(2, 10)); return '[data-th="' + c.getAttribute('data-th') + '"]'; }
  return out;
}

module.exports = { measureCards };
