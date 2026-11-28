/* @family. — receipt.js ONE FILE, SPLIT. § */


/* ---------- SHARING IS A PICTURE OF WHAT IS ON THE SCREEN § */

/* TWO DEVICE PIXELS TO A CSS PIXEL. A 1x picture of a 330px card is soft on every phone sold this
   decade, and 3x makes a file twice the size for a difference nobody sees in a chat thumbnail. */
const RC_SNAP_K = 2, RC_SNAP_MAX = 6e6;

/* ---------- THE FONT, CARRIED IN THE PICTURE § */
let RC_FONTS_ = null;
function rcFonts_() {
  if (RC_FONTS_) return RC_FONTS_;
  const faces = [];
  [...document.styleSheets].forEach(sh => {
    let rules = [];
    /* A STYLESHEET FROM ANOTHER ORIGIN THROWS ON `cssRules` — Google Fonts, if one is ever linked.
       Skipped rather than fatal: a face that cannot be read falls back, the rest are still carried. */
    try { rules = [...sh.cssRules]; } catch (e) { return; }
    rules.forEach(r => {
      if (r.type !== 5 && !/^@font-face/i.test(r.cssText || '')) return;
      faces.push({ css: r.cssText, base: sh.href || location.href });
    });
  });
  const inline = url => fetch(url)
    .then(r => r.ok ? r.blob() : Promise.reject(new Error(r.status)))
    .then(b => new Promise((ok, no) => {
      const fr = new FileReader();
      fr.onload = () => ok(fr.result);
      fr.onerror = () => no(fr.error);
      fr.readAsDataURL(b);
    }));
  const seen = {};
  RC_FONTS_ = Promise.all(faces.map(f => {
    const urls = [];
    f.css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => { urls.push(u); return m; });
    return Promise.all(urls.map(u => {
      const abs = new URL(u, f.base).href;
      seen[abs] = seen[abs] || inline(abs).catch(() => '');
      return seen[abs].then(d => [u, d]);
    })).then(pairs => pairs.reduce((css, [u, d]) => d ? css.split(u).join(d) : css, f.css));
  })).then(all => all.join('\n'))
    /* A FONT THAT WILL NOT LOAD IS NOT A SHARE THAT FAILS. The picture is still the booking, in the
       fallback face; refusing to share it over a typeface would be the worse answer. Not remembered,
       so the next press tries again. */
    .catch(() => { RC_FONTS_ = null; return ''; });
  return RC_FONTS_;
}

/* ---------- THE CLONE, WEARING WHAT THE BROWSER COMPUTED § */
function rcStyle_(cs) {
  let s = '';
  for (let i = 0; i < cs.length; i++) {
    const p = cs[i];
    if (/^(animation|transition)/.test(p)) continue;
    s += p + ':' + cs.getPropertyValue(p) + ';';
  }
  /* `background-position` IS COPIED BY ITS TWO HALVES, because the whole one does not come back. § */
  s += 'background-position-x:' + cs.getPropertyValue('background-position-x')
    + ';background-position-y:' + cs.getPropertyValue('background-position-y') + ';';
  return s + 'animation:none;transition:none;';
}

function rcClone_(el, rules) {
  if (el.nodeType === 3) return document.createTextNode(el.nodeValue);
  if (el.nodeType !== 1) return null;
  const cs = getComputedStyle(el);
  /* NOT DRAWN IS NOT COPIED. § */
  if (cs.display === 'none') return null;

  /* ---------- A CONTROL BECOMES THE WORDS IT SHOWS § */
  const text = el.tagName === 'SELECT' || el.tagName === 'TEXTAREA'
    || (el.tagName === 'INPUT'
        && !/^(checkbox|radio|range|color|file|image|button|submit|reset|hidden)$/i.test(el.type));
  if (text) {
    const d = document.createElement('div');
    let words = el.value, ink = '';
    if (el.tagName === 'SELECT') {
      const o = el.options[el.selectedIndex];
      words = o ? o.text : '';
    } else if (!el.value && el.placeholder) {
      words = el.placeholder;
      /* BOTH PROPERTIES. The computed `-webkit-text-fill-color` is the box's own ink already
         resolved, and it is what paints — so setting `color` alone left the hint in white. */
      const hint = getComputedStyle(el, '::placeholder');
      ink = 'color:' + hint.color + ';-webkit-text-fill-color:'
        + (hint.getPropertyValue('-webkit-text-fill-color') || hint.color) + ';';
    }
    d.textContent = words;
    /* `overflow: clip` WRITTEN, NOT COPIED. § */
    d.setAttribute('style', rcStyle_(cs) + ink + 'overflow:clip;'
      + (el.tagName === 'TEXTAREA' ? 'white-space:pre-wrap;' : 'white-space:nowrap;'));
    return d;
  }

  const c = el.cloneNode(false);
  c.setAttribute('style', rcStyle_(cs));
  ['::before', '::after'].forEach(p => {
    const ps = getComputedStyle(el, p);
    const ct = ps.getPropertyValue('content');
    if (!ct || ct === 'none' || ct === 'normal') return;
    const k = 'rcp' + rules.length;
    c.classList.add(k);
    rules.push('.' + k + p + '{' + rcStyle_(ps) + '}');
  });
  [...el.childNodes].forEach(n => {
    const k = rcClone_(n, rules);
    if (k) c.appendChild(k);
  });
  /* A TICK IS A PROPERTY TOO. */
  if (el.tagName === 'INPUT') {
    if (el.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked');
  }
  return c;
}

/* ---------- WHAT IS BEHIND THE CORNERS § */
function rcBehind_(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const bg = getComputedStyle(p).backgroundColor;
    if (bg && !/^(transparent|rgba\(\s*0,\s*0,\s*0,\s*0\s*\))$/.test(bg)) return bg;
  }
  return getComputedStyle(document.documentElement).backgroundColor || token_('--bg', 'black');
}

/* ---------- A PICTURE IN THE SNAPSHOT IS ITS OWN BYTES (owner, 17 Nov). An SVG drawn to a canvas loads nothing from
   outside, so each <img> becomes a data URL first. A Drive picture is fetched through its lh3 form, which Google serves
   with `Access-Control-Allow-Origin: *` for any anyone-with-link file; one try more at another size before giving up. */
const rcDriveId_ = u => (String(u).match(/\/d\/([\w-]{20,})/) || String(u).match(/[?&]id=([\w-]{20,})/) || [])[1] || '';
function rcPicData_(src) {
  const id = rcDriveId_(src);
  /* The address already on screen first (the browser may hold it), then smaller and bare; each tried twice with a pause,
     since Google answers a burst with 429. */
  const one = id ? [...new Set([/lh3\.googleusercontent/.test(src) ? src : '', 'https://lh3.googleusercontent.com/d/' + id + '=w600',
                    'https://lh3.googleusercontent.com/d/' + id].filter(Boolean))] : [src];
  const tries = one.concat(one);
  /* SMALL JPEG, DRAWN ON ITS OWN CANVAS FIRST (owner, 18 Nov). WebKit drew nothing at all once a full-size photo sat
     in the SVG as a data URL; a decoded bitmap re-encoded at ≤ 480 px keeps the SVG small and already decodable. */
  const get = u => fetch(u, { mode: 'cors', credentials: 'omit' }).then(r => r.ok ? r.blob() : Promise.reject(new Error(r.status)))
    .then(b => new Promise((ok, no) => {
      const url = URL.createObjectURL(b), im = new Image();
      im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => {
        try {
          const k = Math.min(1, 480 / Math.max(im.naturalWidth || 1, im.naturalHeight || 1));
          const cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(im.naturalWidth * k)); cv.height = Math.max(1, Math.round(im.naturalHeight * k));
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
          URL.revokeObjectURL(url); ok(cv.toDataURL('image/jpeg', 0.85));
        } catch (e) { URL.revokeObjectURL(url); no(e); }
      });
      im.onerror = () => { URL.revokeObjectURL(url); no(new Error('picture would not decode')); };
      im.src = url;
    }));
  return tries.reduce((p, u, i) => p.catch(() => new Promise(r => setTimeout(r, i < one.length ? 0 : 800)).then(() => get(u))), Promise.reject());
}
function rcPics_(clone) {
  return Promise.all([...clone.querySelectorAll('img')].map(im => {
    const src = im.getAttribute('src') || '';
    if (!src || /^data:/.test(src)) return null;
    return rcPicData_(src).then(d => { im.setAttribute('src', d); im.removeAttribute('srcset'); im.removeAttribute('loading'); })
      /* A PHOTO THAT WILL NOT LOAD IS LEFT OUT, NOT THE SHARE (owner, 18 Nov: "it should be an image it shares"): the card
         is drawn without it rather than falling back to a link. */
      .catch(e => { if (typeof oops_ === 'function') oops_(e, 'receipt:picture'); im.remove(); });
  }));
}

/** The `.rc` through an SVG <foreignObject>, as a PNG. Resolves `{ blob, w, h, svg }`. */
function rcPngSvg_(rc) {
  /* ---------- THE SNAPSHOT IS TAKEN IN ONE GO, SYNCHRONOUSLY § */
  rc.classList.add('rc-snap');
  let box, xml, behind;
  const rules = [];
  try {
    box = rc.getBoundingClientRect();
    const clone = rcClone_(rc, rules);
    clone.classList.remove('rc-snap');
    /* AT THE ORIGIN OF THE PICTURE. Its margin placed it in the column; here there is no column. */
    clone.style.margin = '0';
    /* ---------- AND AT ITS OWN SIZE, NOT THE SIZE IT WAS SHRUNK TO § */
    const z = (() => {
      const cw0 = parseFloat(getComputedStyle(rc).width);
      return cw0 > 0 && box.width > 0 ? box.width / cw0 : 1;
    })();
    if (Math.abs(z - 1) > 0.01) {
      clone.style.zoom = '1';
      box = { width: box.width / z, height: box.height / z, left: box.left, top: box.top };
    }
    clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    xml = clone;
    behind = rcBehind_(rc);
  } finally {
    rc.classList.remove('rc-snap');
  }
  const w = Math.max(1, box.width), h = Math.max(1, box.height);
  /* AN IPHONE DRAWS NOTHING PAST ITS CANVAS LIMIT (16.7M px, a few hundred MB for every canvas alive at once): the
     density comes down for a tall card rather than the picture failing (owner, 18 Nov: share is always a picture). */
  const k = Math.min(RC_SNAP_K, Math.sqrt(RC_SNAP_MAX / (w * h)), 4096 / w, 8192 / h);
  const cw = Math.max(1, Math.ceil(w * k)), ch = Math.max(1, Math.ceil(h * k));
  return Promise.all([rcFonts_(), rcPics_(xml)]).then(([fonts]) => {
    xml = new XMLSerializer().serializeToString(xml);
    /* `viewBox` IS THE CSS SIZE AND `width`/`height` THE PIXEL SIZE, so the browser lays the HTML out at the width it had on the screen — the same wraps, the same § */
    const svg = cardBlock_({ type: 'paperSnap', cw, ch, k, w, h, css: fonts + '\n' + rules.join('\n'), xml });
    /* NEVER A BLANK PICTURE (owner, 18 Nov). WebKit can fire `load` on an SVG image whose inner pictures are not yet
       painted, and the draw comes out as the background alone. So: load, decode, draw, and look — one colour all over
       means draw again after a pause; still blank after the last try is an error, never a black share. */
    const load = () => new Promise((ok, no) => {
      const img = new Image();
      img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => ok(img));
      img.onerror = () => no(new Error('the browser could not draw the receipt'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
    const plain = cv => {
      const s = document.createElement('canvas'); s.width = 32; s.height = 32;
      const g = s.getContext('2d'); g.drawImage(cv, 0, 0, 32, 32);
      let d;
      try { d = g.getImageData(0, 0, 32, 32).data; } finally { s.width = s.height = 0; }
      for (let i = 4; i < d.length; i += 4)
        if (Math.abs(d[i] - d[0]) + Math.abs(d[i + 1] - d[1]) + Math.abs(d[i + 2] - d[2]) > 24) return false;
      return true;
    };
    const wait = t => new Promise(r => setTimeout(r, t));
    const draw = (img, n) => {
      const cv = document.createElement('canvas');
      cv.width = cw; cv.height = ch;
      const g = cv.getContext('2d');
      if (!g) return Promise.reject(new Error('the browser gave no canvas for a ' + cw + 'x' + ch + ' picture'));
      g.fillStyle = behind;
      g.fillRect(0, 0, cw, ch);
      g.drawImage(img, 0, 0, cw, ch);
      if (plain(cv)) {
        cv.width = cv.height = 0;   /* released at once: iOS counts every live canvas against one budget */
        if (n >= 5) return Promise.reject(new Error('the browser made an empty picture'));
        return wait(250 * (n + 1)).then(() => n % 2 ? load().then(i => draw(i, n + 1)) : draw(img, n + 1));
      }
      return new Promise((ok, no) => cv.toBlob(b => { cv.width = cv.height = 0; return b ? ok({ blob: b, w: cw, h: ch, svg }) : no(new Error('the browser made an empty picture')); }, 'image/png'));
    };
    return load().then(img => draw(img, 0));
  });
}

/* ---------- THE SECOND PAINTER: THE CARD WALKED AND DRAWN, NO SVG AROUND IT (owner screenshot, 19 Nov: "the browser made
   an empty picture" on an iPhone). WebKit draws an SVG holding a <foreignObject> blank, so on Safari and every iPhone browser
   the picture is painted box by box: each visible element's background, border and corners at its place on the screen,
   each photo through `rcPicData_`, each line of words at the place the browser laid it out, each icon or diagram as an SVG
   of its own (plain SVG does draw in WebKit). Used always on WebKit, and wherever the first painter comes back empty. */
const rcWebKit_ = () => {
  if (/[?&]paint=1\b/.test(location.search)) return true;
  const ua = navigator.userAgent || '';
  return /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
    || (/AppleWebKit/.test(ua) && !/Chrom(e|ium)|Android|Edg\//.test(ua));
};
let RC_PAINT_ = null;   /* true once the SVG painter has come back empty here; asked of the browser once */

const rcClear_ = c => !c || /^(transparent|rgba\(\s*0,\s*0,\s*0,\s*0\s*\))$/.test(c);
/* The four corners as px, a percentage taken of the box it rounds. */
const rcRadii_ = (cs, w, h) => ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(c => {
  const v = (cs['border' + c + 'Radius'] || '0').split(' ')[0];
  const n = parseFloat(v) || 0;
  return Math.min(/%$/.test(v) ? n / 100 * Math.min(w, h) : n, w / 2, h / 2);
});
const rcDash_ = (d, w) => d === 'dashed' ? [3 * w, 3 * w] : d === 'dotted' ? [w, w] : [];
function rcPath_(g, x, y, w, h, r) {
  g.beginPath();
  if (r.some(Boolean) && g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h);
}
const RC_SVG_PROPS_ = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin',
  'stroke-dasharray', 'opacity', 'font-family', 'font-size', 'font-weight', 'font-style', 'text-anchor', 'dominant-baseline', 'visibility', 'display'];

/** The walk: synchronous, while `.rc-snap` holds the card as it will be pictured. A list of drawing steps, in paint order. */
function rcPaintList_(rc, box, z) {
  const ops = [];
  const at = r => ({ x: (r.left - box.left) / z, y: (r.top - box.top) / z, w: r.width / z, h: r.height / z });
  const words = (t, cs) => {
    const s = t.nodeValue;
    if (!/\S/.test(s)) return;
    const font = [cs.fontStyle, cs.fontWeight, cs.fontSize, cs.fontFamily].join(' ');
    const up = cs.textTransform === 'uppercase' ? x => x.toUpperCase() : cs.textTransform === 'lowercase' ? x => x.toLowerCase() : x => x;
    const ink = cs.getPropertyValue('-webkit-text-fill-color') || cs.color;
    const sp = parseFloat(cs.letterSpacing) || 0;
    /* AN ELLIPSIS DRAWN, NOT THE WORDS UNDER IT: a box that cuts its line with `…` ends its words at its content edge. */
    const pe = t.parentElement, ps = getComputedStyle(pe);
    const lim = ps.textOverflow === 'ellipsis' && ps.overflow !== 'visible'
      ? at(pe.getBoundingClientRect()).x + (pe.clientLeft + pe.clientWidth - (parseFloat(ps.paddingRight) || 0)) : Infinity;
    let cut = false;
    const rg = document.createRange();
    const re = /\S+/g;
    let m;
    while ((m = re.exec(s))) {
      rg.setStart(t, m.index); rg.setEnd(t, m.index + m[0].length);
      const rs = [...rg.getClientRects()].filter(r => r.width > 0 && r.height > 0);
      if (!rs.length) continue;
      if (rs.length === 1) {
        const r = at(rs[0]);
        if (cut || r.x >= lim) continue;
        if (r.x + r.w > lim) cut = true;
        ops.push({ t: 'word', s: up(m[0]), font, ink, sp, ell: cut ? lim : 0, ...r });
        continue;
      }
      /* A WORD BROKEN ACROSS LINES is placed letter by letter. */
      for (let i = 0; i < m[0].length; i++) {
        rg.setStart(t, m.index + i); rg.setEnd(t, m.index + i + 1);
        const r = rg.getClientRects()[0];
        if (r && r.width > 0) ops.push({ t: 'word', s: up(m[0][i]), font, ink, sp, ...at(r) });
      }
    }
  };
  const walk = (el, alpha) => {
    if (el.nodeType === 3) return words(el, getComputedStyle(el.parentElement));
    if (el.nodeType !== 1) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none') return;
    const a = alpha * (parseFloat(cs.opacity) || 0);
    if (a <= 0.01) return;
    const r = at(el.getBoundingClientRect());
    const seen = cs.visibility !== 'hidden';
    const rad = rcRadii_(cs, r.w, r.h);
    let pushed = false;
    if (a < 1) { ops.push({ t: 'save' }, { t: 'alpha', a }); pushed = true; }
    if (seen) {
      if (!rcClear_(cs.backgroundColor)) ops.push({ t: 'fill', c: cs.backgroundColor, rad, ...r });
      const g = /linear-gradient\(/.test(cs.backgroundImage) && cs.backgroundImage.match(/rgba?\([^)]*\)/g);
      if (g && g.length > 1) ops.push({ t: 'grad', cs: g, rad, ...r });
      const sides = ['Top', 'Right', 'Bottom', 'Left'].map(s => ({
        w: cs['border' + s + 'Style'] === 'none' || cs['border' + s + 'Style'] === 'hidden' ? 0 : parseFloat(cs['border' + s + 'Width']) || 0,
        c: cs['border' + s + 'Color'], d: cs['border' + s + 'Style'] }));
      if (sides.some(s => s.w > 0 && !rcClear_(s.c))) {
        const one = sides.every(s => s.w === sides[0].w && s.c === sides[0].c && s.d === sides[0].d);
        ops.push(one ? { t: 'ring', bw: sides[0].w, c: sides[0].c, d: sides[0].d, rad, ...r } : { t: 'sides', sides, ...r });
      }
    }
    const tag = el.tagName;
    if (seen && tag === 'IMG') {
      ops.push({ t: 'img', src: el.currentSrc || el.getAttribute('src') || '', fit: cs.objectFit, pos: cs.objectPosition, rad, ...r });
    } else if (seen && tag.toLowerCase() === 'svg') {
      const c = el.cloneNode(true), from = [el, ...el.querySelectorAll('*')], to = [c, ...c.querySelectorAll('*')];
      from.forEach((n, i) => {
        const ns = getComputedStyle(n);
        to[i].setAttribute('style', RC_SVG_PROPS_.map(p => p + ':' + ns.getPropertyValue(p)).join(';') + ';color:' + ns.color + ';animation:none');
      });
      c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      c.setAttribute('width', r.w); c.setAttribute('height', r.h);
      if (!c.getAttribute('viewBox') && el.viewBox && el.viewBox.baseVal && el.viewBox.baseVal.width)
        c.setAttribute('viewBox', [0, 0, el.viewBox.baseVal.width, el.viewBox.baseVal.height].join(' '));
      ops.push({ t: 'svg', xml: new XMLSerializer().serializeToString(c), ...r });
    } else if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) {
      if (seen && !/^(checkbox|radio|range|color|file|image|button|submit|reset|hidden)$/i.test(el.type || '')) {
        const o = tag === 'SELECT' ? el.options[el.selectedIndex] : null;
        const s = tag === 'SELECT' ? (o ? o.text : '') : el.value || el.placeholder || '';
        const ph = !el.value && tag !== 'SELECT' ? getComputedStyle(el, '::placeholder') : cs;
        const pl = parseFloat(cs.paddingLeft) + (parseFloat(cs.borderLeftWidth) || 0);
        if (s) ops.push({ t: 'line', s, font: [cs.fontStyle, cs.fontWeight, cs.fontSize, cs.fontFamily].join(' '),
                          ink: ph.color, x: r.x + pl, y: r.y, w: r.w - 2 * pl, h: r.h, al: cs.textAlign });
      }
    } else {
      /* A WORD WRITTEN BY THE STYLESHEET (`content: "Type your answer"` on an empty box) has no node to measure: it is set in
         the box's content area, aligned as the box aligns. Only for a box with no words of its own, where that is where it sits. */
      if (seen && !/\S/.test(el.textContent)) ['::before', '::after'].forEach(pp => {
        const ps = getComputedStyle(el, pp), ct = ps.getPropertyValue('content');
        const q = /^"((?:[^"\\]|\\.)*)"$/.exec(ct || '');
        if (!q || !q[1] || ps.display === 'none') return;
        const bl = (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.paddingLeft) || 0);
        const br = (parseFloat(cs.borderRightWidth) || 0) + (parseFloat(cs.paddingRight) || 0);
        const bt = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.paddingTop) || 0);
        const bb = (parseFloat(cs.borderBottomWidth) || 0) + (parseFloat(cs.paddingBottom) || 0);
        const up = ps.textTransform === 'uppercase' ? x => x.toUpperCase() : x => x;
        ops.push({ t: 'line', s: up(q[1].replace(/\\(.)/g, '$1')), font: [ps.fontStyle, ps.fontWeight, ps.fontSize, ps.fontFamily].join(' '),
                   ink: ps.color, x: r.x + bl, y: r.y + bt, w: r.w - bl - br, h: r.h - bt - bb, al: cs.textAlign });
      });
      const clip = cs.overflow !== 'visible' || cs.overflowX !== 'visible';
      if (clip) { ops.push({ t: 'save' }, { t: 'clip', rad, ...r }); }
      [...el.childNodes].forEach(n => walk(n, 1));
      if (clip) ops.push({ t: 'restore' });
    }
    if (pushed) ops.push({ t: 'restore' });
  };
  walk(rc, 1);
  return ops;
}

function rcPaint_(rc) {
  rc.classList.add('rc-snap');
  let box, ops, behind, z = 1;
  try {
    box = rc.getBoundingClientRect();
    const cw0 = parseFloat(getComputedStyle(rc).width);
    z = cw0 > 0 && box.width > 0 && Math.abs(box.width / cw0 - 1) > 0.01 ? box.width / cw0 : 1;
    ops = rcPaintList_(rc, box, z);
    behind = rcBehind_(rc);
  } finally {
    rc.classList.remove('rc-snap');
  }
  const w = Math.max(1, box.width / z), h = Math.max(1, box.height / z);
  const k = Math.min(RC_SNAP_K, Math.sqrt(RC_SNAP_MAX / (w * h)), 4096 / w, 8192 / h);
  const cw = Math.max(1, Math.ceil(w * k)), ch = Math.max(1, Math.ceil(h * k));
  const load = src => new Promise((ok, no) => {
    const im = new Image();
    im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => ok(im));
    im.onerror = () => no(new Error('picture would not decode'));
    im.src = src;
  });
  /* EACH PICTURE ITS OWN BYTES FIRST, as in the SVG painter: a canvas that drew a picture from elsewhere cannot be saved. */
  const pics = ops.map(o => {
    if (o.t === 'img') {
      if (!o.src) return null;
      const same = !/^https?:/.test(o.src) || new URL(o.src, location.href).origin === location.origin;
      return (same ? Promise.resolve(o.src) : rcPicData_(o.src)).then(load).then(im => { o.im = im; })
        .catch(e => { if (typeof oops_ === 'function') oops_(e, 'receipt:picture'); });
    }
    if (o.t === 'svg')
      return load('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(o.xml)).then(im => { o.im = im; }).catch(() => {});
    return null;
  });
  return Promise.all([document.fonts ? document.fonts.ready : null, ...pics]).then(() => {
    const cv = document.createElement('canvas');
    cv.width = cw; cv.height = ch;
    const g = cv.getContext('2d');
    if (!g) return Promise.reject(new Error('the browser gave no canvas for a ' + cw + 'x' + ch + ' picture'));
    g.fillStyle = behind;
    g.fillRect(0, 0, cw, ch);
    g.scale(cw / w, ch / h);
    g.textBaseline = 'alphabetic';
    ops.forEach(o => {
      switch (o.t) {
        case 'save': g.save(); break;
        case 'restore': g.restore(); break;
        case 'alpha': g.globalAlpha *= o.a; break;
        case 'clip': rcPath_(g, o.x, o.y, o.w, o.h, o.rad); g.clip(); break;
        case 'fill': g.fillStyle = o.c; rcPath_(g, o.x, o.y, o.w, o.h, o.rad); g.fill(); break;
        case 'grad': {
          const l = g.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
          o.cs.forEach((c, i) => l.addColorStop(i / (o.cs.length - 1), c));
          g.fillStyle = l; rcPath_(g, o.x, o.y, o.w, o.h, o.rad); g.fill(); break;
        }
        case 'ring': {
          const b = o.bw / 2;
          g.strokeStyle = o.c; g.lineWidth = o.bw; g.setLineDash(rcDash_(o.d, o.bw));
          rcPath_(g, o.x + b, o.y + b, o.w - o.bw, o.h - o.bw, o.rad.map(v => Math.max(0, v - b))); g.stroke(); g.setLineDash([]); break;
        }
        case 'sides': {
          const [t, r, btm, l] = o.sides;
          [[t, o.x, o.y, o.w, t.w], [r, o.x + o.w - r.w, o.y, r.w, o.h], [btm, o.x, o.y + o.h - btm.w, o.w, btm.w], [l, o.x, o.y, l.w, o.h]]
            .forEach(([s, x, y, sw, sh]) => {
              if (!(s.w > 0) || rcClear_(s.c)) return;
              if (!/dashed|dotted/.test(s.d)) { g.fillStyle = s.c; g.fillRect(x, y, sw, sh); return; }
              /* A DASHED RULE STAYS DASHED: the side drawn as a line down its middle. */
              const across = sw > sh;
              g.strokeStyle = s.c; g.lineWidth = s.w; g.setLineDash(rcDash_(s.d, s.w)); g.beginPath();
              if (across) { g.moveTo(x, y + sh / 2); g.lineTo(x + sw, y + sh / 2); } else { g.moveTo(x + sw / 2, y); g.lineTo(x + sw / 2, y + sh); }
              g.stroke(); g.setLineDash([]);
            });
          break;
        }
        case 'img': {
          if (!o.im) break;
          const iw = o.im.naturalWidth || o.w, ih = o.im.naturalHeight || o.h;
          let sx = 0, sy = 0, sw = iw, sh = ih;
          if (o.fit === 'cover') {
            const s = Math.max(o.w / iw, o.h / ih);
            sw = o.w / s; sh = o.h / s;
            const [px, py] = (o.pos || '50% 50%').split(' ').map(v => /%$/.test(v) ? parseFloat(v) / 100 : 0.5);
            sx = (iw - sw) * px; sy = (ih - sh) * py;
          }
          g.save(); rcPath_(g, o.x, o.y, o.w, o.h, o.rad); g.clip();
          if (o.fit === 'contain') {
            const s = Math.min(o.w / iw, o.h / ih);
            g.drawImage(o.im, o.x + (o.w - iw * s) / 2, o.y + (o.h - ih * s) / 2, iw * s, ih * s);
          } else g.drawImage(o.im, sx, sy, sw, sh, o.x, o.y, o.w, o.h);
          g.restore(); break;
        }
        case 'svg': if (o.im) g.drawImage(o.im, o.x, o.y, o.w, o.h); break;
        case 'word': case 'line': {
          g.font = o.font; g.fillStyle = o.ink;
          if ('letterSpacing' in g) g.letterSpacing = (o.sp || 0) + 'px';
          const m = g.measureText(o.s);
          const asc = m.fontBoundingBoxAscent || m.actualBoundingBoxAscent || parseFloat(o.font) * 0.8;
          const dsc = m.fontBoundingBoxDescent || m.actualBoundingBoxDescent || parseFloat(o.font) * 0.2;
          if (o.t === 'line') {
            g.save(); rcPath_(g, o.x, o.y, o.w, o.h, [0, 0, 0, 0]); g.clip();
            const al = /center/.test(o.al) ? 'center' : /right|end/.test(o.al) ? 'right' : 'left';
            g.textAlign = al;
            g.fillText(o.s, al === 'center' ? o.x + o.w / 2 : al === 'right' ? o.x + o.w : o.x, o.y + (o.h - asc - dsc) / 2 + asc);
            g.restore();
          } else {
            let s = o.s;
            if (o.ell) {
              const room = o.ell - o.x;
              while (s && g.measureText(s + '…').width > room) s = s.slice(0, -1);
              s += '…';
            }
            g.fillText(s, o.x, o.y + (o.h - asc - dsc) / 2 + asc);
          }
          break;
        }
      }
    });
    return new Promise((ok, no) => cv.toBlob(b => { cv.width = cv.height = 0; return b ? ok({ blob: b, w: cw, h: ch }) : no(new Error('the browser made an empty picture')); }, 'image/png'));
  });
}

/** The `.rc` as a PNG at `RC_SNAP_K` device pixels per CSS pixel. Resolves `{ blob, w, h }`. WebKit is painted box by box;
    elsewhere the SVG painter, and the box painter after it if that came back empty (remembered for the next share). */
function rcPng_(rc) {
  if (RC_PAINT_ === null) RC_PAINT_ = rcWebKit_();
  if (RC_PAINT_) return rcPaint_(rc);
  return rcPngSvg_(rc).catch(e => {
    if (!/empty picture|could not draw/.test(String(e && e.message))) return Promise.reject(e);
    RC_PAINT_ = true;
    return rcPaint_(rc);
  });
}

/* ---------- WHERE THE PICTURE GOES § */
let RC_SHOT = null;   /* { file, url } — the last picture made, for the Share button under its receipt */

function rcSave_(blob, name, rc) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  if (!('download' in a)) return rcOffer_(blob, name, rc);
  a.href = url;
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  /* NOT REVOKED AT ONCE. Some browsers start the download after the click returns, and a URL revoked
     under it is a zero-byte file. A minute is long enough and costs one picture's memory. */
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  toast(text_('saved-a-picture-of-this-booking'));
}

function rcOffer_(blob, name, rc, title) {
  if (RC_SHOT && RC_SHOT.url) URL.revokeObjectURL(RC_SHOT.url);
  const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : blob;
  RC_SHOT = { file, url: URL.createObjectURL(blob), name, title: title || 'Booking' };
  const can = !!(navigator.share && navigator.canShare && navigator.canShare({ files: [file] }));
  /* A STEP (owner, 22 Nov, ONE WAY TO OPEN): the picture is the Share step's own, beside its card, so Back takes it away. */
  const at = rc || document.querySelector('.screen.on .rc') || document.querySelector('.rc');
  const said = title ? title + ', as a picture' : text_('this-booking-as-a-picture');
  if (!at) { toast(text_('there-is-no-booking-on-screen')); return; }
  openStep_({ title: 'Share', el: at, beside: true, html: renderCard({ kind: 'shot', look: 'rc-shot-box', name: said,
    picture: { src: RC_SHOT.url, alt: said },
    body: [{ type: 'text', look: 'note', text: can ? text_('press-share-to-send-it') : text_('press-and-hold-the-picture-to') }],
    tiles: [can ? { label: 'Share', act: 'rc-shot-share', tone: 'buy' } : null, { label: text_('save'), act: 'rc-shot-save', data: { name } }].filter(Boolean) }) });
}
/* THE SHARE STEP OPENS AT THE PRESS, the picture still being made of the card it stands beside. */
function rcShareStep_(at) { openStep_({ title: 'Share', el: at, beside: true, html: cardBlock_({ type: 'wait', look: 'rc-shot-wait', on: true }) }); }

/* SAVE IS A FORM BUTTON LIKE SHARE (one way only): the download link is made and clicked here, never written as markup. */
on('rc-shot-save', el => {
  if (!RC_SHOT) return;
  const a = document.createElement('a');
  a.href = RC_SHOT.url; a.download = (el && el.dataset && el.dataset.name) || 'booking.png';
  document.body.appendChild(a); a.click(); a.remove();
});

on('rc-shot-share', () => {
  if (!RC_SHOT || !navigator.share) return;
  navigator.share({ files: [RC_SHOT.file], title: RC_SHOT.title })
    .catch(e => { if (!e || e.name !== 'AbortError') toast(text_('could-not-share-it-press-and')); });
});

/* A PICTURE THAT COULD NOT BE MADE IS SAID AND LOGGED, NEVER SWAPPED FOR A BARE LINK (owner, 18 Nov: share is always a
   picture of the card). The one answer for every share button. */
function rcShareFail_(e) {
  if (typeof oops_ === 'function') oops_(e, 'share:picture');
  /* THE SHARE STEP STILL WAITING goes: nothing came to show in it. */
  if (document.querySelector('#sheet-body .rc-shot-wait')) closeStep_();
  toast(text_('could-not-make-the-picture') + (typeof why_ === 'function' ? why_(e) : String((e && e.message) || e || '')));
}

function rcHand_(blob, name, rc, title) {
  const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
  const can = !!(file && navigator.share && navigator.canShare
                 && (() => { try { return navigator.canShare({ files: [file] }); } catch (e) { return false; } })());
  /* THE PICTURE IS SHOWN IN ITS STEP whatever the phone then does with it. */
  rcOffer_(blob, name, rc, title);
  if (!can) return rcSave_(blob, name, rc);
  if (navigator.userActivation && !navigator.userActivation.isActive) return;
  return navigator.share({ files: [file], title: title || 'Booking' }).catch(e => {
    if (e && e.name === 'AbortError') return;
    /* THE TAP HAS RUN OUT (iPhone: the picture took too long, NotAllowedError): the picture with its own Share button. */
    /* (it is in its step already) */
  });
}

on('book-share', el => {
  /* THE DOCUMENT THIS CONTROL IS PART OF, asked of the DOM rather than remembered. The form and a
     saved session share this handler without either being named. */
  const rc = el && el.closest && (el.closest('.rc') || (el.closest('.card') && el.closest('.card').querySelector('.rc')));
  if (!rc) return toast(text_('there-is-nothing-to-share-on'));
  /* SAID AT ONCE, because the picture takes a moment and a press that answers nothing for half a
     second gets pressed again. */
  toast(text_('making-a-picture-of-this-booking'));
  rcShareStep_(rc);
  rcPng_(rc)
    .then(p => rcHand_(p.blob, 'family-booking-' + stamp_() + '.png', rc))
    .catch(rcShareFail_);
});

/* THE BOOKER IS NOT A SHEET ANY MORE. § */
/* The one entry point. § */
/* EVERY ANSWER ON THE CARD COMES THROUGH THIS ONE REDRAW. */
function drawBooker() {
  if (typeof bookHomeSeats_ === 'function') bookHomeSeats_();
  redrawBooker_(paintBook_);
  /* EVERY ANSWER COMES THROUGH HERE, so here is where the form is kept for a reload (`bookKeep_`, book.js). */
  if (typeof bookKeep_ === 'function') bookKeep_();
}

/** WHERE IT IS UP TO, or null when nobody is booking. Empty is the blank paper, not a form. */
function bookerCard() {
  /* ---------- THE LIST IS NOT DRAWN INSTEAD OF THE CARD § */
  const out = drawBooker_();
  if (!out) return '';
  /* A CARD ON THE ONE TEMPLATE (owner, 12 Nov): name as first tag, the questions and price lines as its form, its round row last. */
  return renderCard({ kind: 'bookform', id: 'bookr', look: 'bookform', name: text_('your-booking'), tags: [{ text: text_('your-booking') }],
    body: [{ type: 'paperBox', look: 'bookform-paper', inner: out.html }], tiles: out.tiles });
}

function drawBooker_() {
  /* A CHILD THE CHOSEN CLIENT DOES NOT HAVE IS NEVER ON THE FORM, however BOOKING got it (a draft, a card, a payload that changed). */
  if (typeof bookKidsFor_ === 'function' && !(typeof awaiting_ === 'function' && awaiting_())) bookKidsFor_();
  /* ---------- THERE IS NO SECOND THING TO DRAW § */
  const L = bookPrice();

  /* WHAT HAS BEEN SAID SO FAR, each one pressable to change. A wizard that hides its earlier
     answers is one you have to restart to correct. */

  /* ---------- A QUESTION THAT DID NOT GET ASKED, SAID OUT LOUD § */
  /* AND THE NOTE HAS TO NAME THE RIGHT ACCOUNT. § */
  const forWhom = BOOKING.client === NOBODY ? '' : (BOOKING.client || (USER && USER.name) || '');
  const mine = !USER || !forWhom || norm(forWhom) === norm(USER.name);
  /* AND NO CHILDREN NOTE AT ALL WHEN THERE IS NO CLIENT. § */
  const noKids = USER && forWhom && !isWaiting_()
    && !bookStep_('kids').options().length
    && rank_() !== 'staff' && rank_() !== 'student';
  const kidsNote = noKids
    ? cardBlock_({ type: 'paperNote', look: 'note-gap', text: [text_('no-children-are-on') + (mine ? 'your account' : forWhom + '’s account')
        + ', so we cannot ask which of them this is for — the seats will just say ', { b: 'Child' }, '. '
        + (mine ? text_('ask-us-to-add-them-and') : text_('add-them-to-that-account-and'))] })
    : '';

  /* THE RUNNING BREAKDOWN. § */
  /* ---------- THE ACTIONS ARE PRINTED ON THE PAPER § */
  /* A CHILD ASKS A PARENT, NOT THE BUSINESS (398): no price reaches her, so the parent books it. Share stays — it is how she shows them. */
  const foot = (!may_('prices') ? cardBlock_({ type: 'paperNote', look: 'rc-kid', text: KID_ASK_PARENT }) : '') + policyLinks_('family');
  const money_ = bookBreakdown(L, foot);

  /* ---------- THE CARD IS THE FORM, FROM THE FIRST QUESTION § */
  const head = `${kidsNote}${money_ || ''}`;

  /* ONE RETURN. This was four branches — a question, a grid, a list of email boxes, and the card — and the last three have moved onto the paper. § */
  /* THE PAPER IS THE WHOLE THING NOW. The note box moved into it as a row, the buttons are printed
     on it above the barcode, and what is left out here is nothing at all. */
  /* THE CARD'S ROUND ROW (owner, 12 Nov): Send leads; findCard lifts this top-level row into the card's one row. */
  const tiles = [].concat(!may_('prices') ? null : { icon: 'send', label: 'Send', tone: 'buy', act: 'book-send' },
    { icon: 'share', label: text_('share-this-booking'), act: 'book-share' },
    /* REPORT OR SUGGEST A CHANGE ON THE BOOKING FORM TOO (489). */
    typeof suggestOpts_ === 'function' ? suggestOpts_('widget', 'booking', 'Booking') : null).filter(Boolean);
  return { html: head || cardBlock_({ type: 'paperNote', text: text_('not-enough-answered-to-price-it') }), tiles };
}

on('book-send', el => {
  /* A GUEST SENDS NOTHING: the answers stay and Find's first step asks who you are again (`SIGN`, find-account.js). */
  if (!USER) {
    toast(text_('sign-in-to-send-this-booking'));
    SIGN.step = ''; SIGN.pin = [];
    finderEach_(() => paintStuff(true));
    return;
  }
  const said = $('book-said');
  const L = bookPrice();
  el.disabled = true;
  if (said) tell_(said, 'info', 'Asking…');

  const spec = bookSpec();

  /* ---------- A CLASS GOES SOMEWHERE ELSE ENTIRELY § */
  /* ---------- ASKING TO JOIN A CLASS THAT IS ALREADY RUNNING § */
  const joined = typeof joinedJob_ === 'function' ? joinedJob_() : null;
  if (joined && !isWaiting_()) {
    /* SENT: the form's draft is not drawn by another page while this asks (`bookSending_`, book.js). */
    bookSending_(true);
    api({ action: 'move', jobId: String(joined.id || joined.jobId || ''),
          role: 'client', name: USER.name, personId: (USER && USER.personId) || '', move: 'Request',
          text: 'asked to join', requestId: 'join-' + (joined.id || '') + '-' + Date.now() })
      .then(d => {
        el.disabled = false;
        if (d && d.error) { bookSending_(false); if (said) tell_(said, 'error', d.error); return; }
        /* THE CLASS YOU ASKED TO JOIN, kept so it comes back under the blank form — see `ASKED_JOB` in book.js. § */
        ASKED_JOB = String(joined.id || joined.jobId || '');
        resetBooking_();
        toast(text_('asked-they-will-be-in-touch'));
        load();
      })
      /* ---------- THE HANDLER TOOK NO ARGUMENT AND THEN USED ONE § */
      .catch(err => {
        el.disabled = false;
        bookSending_(false);
        if (said) tell_(said, 'error', why_(err));
      });
    return;
  }

  if (isWaiting_()) {
    /* ---------- OPENING ONE IS A DIFFERENT ACTION FROM JOINING ONE § */
    const forNobody = BOOKING.client === NOBODY;
    bookSending_(true);
    send_({ action: forNobody ? 'openWaitlist' : 'joinWaitlist',
      name: USER.name, personId: (USER && USER.personId) || '',
      venue: BOOKING.loc,
      level: BOOKING.level,
      /* WHEN THIS FAMILY COULD COME. Sent as the words they ticked rather than as a code — it is
         read by a person deciding what day to run the class on, and "Weekday evenings, Weekends"
         is already the sentence they want. */
      availability: (BOOKING.avail || []).filter(Boolean).join(', '),
      requestId: 'wl-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    })
      .then(d => {
        /* CLOSING THE FORM, not a sheet. Sent is the one moment the booker should stop being on
           the screen — everything else about it is now a job, and jobs are the cards underneath. */
        /* WHERE IT HAS GOT TO, because that is the whole content of a waiting list. § */
        toast(d && d.seats
          ? text_('on-the-list-2') + d.joined + ' of ' + d.seats + ' seats taken'
          : text_('on-the-list'));
        /* BOTH WAITLIST VERBS ANSWER WITH ONE. § */
        ASKED_JOB = String((d && d.jobId) || '');
        resetBooking_();
        load();
      })
      /* `send_` has already said what went wrong and marked the error handled — this stops it
         reaching the console as an unhandled rejection, and adds nothing a person would read. */
      .catch(() => { el.disabled = false; bookSending_(false); });
    return;
  }

  /* BOOKING IS ADDING A LESSON TO THE ONE LIST (owner, 27 Nov): no request, no accept or decline. Inside the tutor's availability it is booked at
     once (addLesson, backend/post-booking.gs), weekly from the first date to the end of its term, and the term's total is paid up front now. */
  const first = (L && L.sessionDates || [])[0], hhmm = String(spec.time || '').slice(0, 5);
  const ymd = d => d instanceof Date ? d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') : '';
  if (!first || !/^\d\d:\d\d$/.test(hhmm)) { el.disabled = false; if (said) tell_(said, 'error', 'Choose a first day and a time.'); return; }
  bookSending_(true);
  send_({ action: 'addLesson', name: USER.name, personId: USER.personId || '',
    tutor: spec.tutor, learner: (BOOKING.kids || []).filter(Boolean)[0] || '',
    subject: spec.subjects.join(', '), level: spec.level, venue: BOOKING.loc,
    start: ymd(first) + 'T' + hhmm, minutes: String(Math.round((Number(spec.hours) || 1) * 60)), rrule: 'FREQ=WEEKLY' })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      const ls = (d && d.lesson) || {};
      resetBooking_();
      load();
      if (ls.pay !== 'owed') { toast('Booked'); return; }
      /* PAID UP FRONT: straight to the checkout for the term's total. */
      return api({ action: 'createCheckout', lessonId: ls.id, name: USER.name, personId: USER.personId || '' })
        .then(p => { if (p && p.url) location.href = p.url; else toast((p && p.error) || text_('stripe-did-not-give-us-a')); });
    })
    .catch(err => {
      el.disabled = false;
      bookSending_(false);
      if (said) tell_(said, 'error', why_(err));
    });
});

/* THE WHOLE RECEIPT, on tap. § */
/* ---------- A SESSION OPENS ON ITS OWN PAGE, NOT OVER THE TOP OF THE APP § */
/* NO `job` HANDLER: nothing draws a Job door; a push opens one by `openJob_` (push.js), and the journeys call it the same way. */
/* `quiet`: the way back from Stripe opens the receipt it paid for and says nothing of its own when the list has not caught up (`paidFromLink_`, me.js). */
function openJob_(id, quiet) {
  const jobs = DATA.liveJobs || DATA.jobs || [];
  const want = String(id || '');
  const j = jobs.find(x => String(x.id || x.jobId || '') === want);
  if (!j) { if (!quiet) toast(text_('that-session-is-not-in-this')); return false; }
  if (!USER) { if (!quiet) { toast(text_('sign-in-to-open-a-session')); go('account'); } return false; }

  OPEN_JOB = want;
  /* FIND › BOOKING (the column moved, 16 Nov): OPEN_JOB puts it first among the sessions; Find turns to its page. */
  go('booking');
  const host = $('s-stuff'), ref = new RegExp('\\b' + want.replace(/[^\w-]/g, '') + '\\b');
  const at = host ? [...host.querySelectorAll(':scope > .page')].findIndex(p => ref.test((p.querySelector('.rc-ref') || {}).textContent || '')) : -1;
  if (at >= 0 && typeof goPage === 'function') goPage('stuff', at, true);
  return true;
}

/* PAYING. `createCheckout` builds a Stripe session and hands back a URL; nothing about the booking is recorded by it, because a client who opens the payment page § */
on('job-pay', el => {
  el.disabled = true;
  api({ action: 'createCheckout', jobId: el.dataset.id,
        name: USER.name, personId: USER.personId || '',
        requestId: 'pay-' + el.dataset.id + '-' + Date.now() })
    .then(d => {
      el.disabled = false;
      if (d && d.error) { toast(d.error); return; }
      if (!d || !d.url) { toast(text_('stripe-did-not-give-us-a')); return; }
      /* THE SAME TAB. A payment opened in a new one is a payment somebody loses track of, and the
         return leg comes back to this site anyway. */
      location.href = d.url;
    })
    .catch(err => { el.disabled = false; toast(why_(err)); });
});

/* ---------- THE FAMILY LEAVING § */
on('job-leave', el => {
  const paid = !!el.dataset.paid;
  if (!sure_(el, paid ? 'Withdraw? (refunds go through Stripe)' : 'Withdraw?')) return;
  el.disabled = true;
  api({ action: 'move', jobId: el.dataset.id, role: 'client',
        /* THE ID AS WELL AS THE NAME — `move` now asks WHO is posting (a tutor seat needs a tutor),
           and a display name is an editable cell; the gate fills it from the token either way. */
        name: USER.name, personId: (USER && USER.personId) || '', move: 'Withdraw',
        requestId: 'wd-' + el.dataset.id + '-' + Date.now() })
    .then(d => {
      el.disabled = false;
      if (d && d.error) { toast(d.error); return; }
      toast('Withdrawn');
      load();
    })
    .catch(err => { el.disabled = false; toast(why_(err)); });
});

/* ASKING TO JOIN. The same `move` a tutor uses to apply — one machine, one set of rules, and the
   capacity and the family's consent are both checked on the backend rather than trusted from here. */
/* TAKING A SEAT ON A CLASS SOMEBODY ELSE STARTED. § */
/* ---------- TAKING A SEAT GOES TO THE FORM § */
on('job-take-seat', el => {
  const j = (DATA.liveJobs || DATA.jobs || []).find(x =>
    String(x.id || x.jobId || '') === String(el.dataset.id));
  if (!j) { toast(text_('that-class-has-gone')); return; }
  BOOKING.how      = text_('waiting-list-class');
  BOOKING.joining  = openClassLabel_(j);
  /* THE SAME RULE AS CHOOSING IT ON THE FORM: the class answers subject, level, place and seats (`joiningSet_`). */
  joiningSet_();
  closeStep_();
  finderSet_(FINDERS.stuff, { filters: [{ field: DOOR_FIELD, value: 'Booking' }], show: true });
  go('stuff');
  /* ONE PAGE ON FROM THE QUESTION, which is the form. */
  PAGE.stuff = stuffQuestionPage_() + 1;
  paintPager('stuff', true);
});


/* ---------- ASKING TO JOIN GOES TO THE FORM, LIKE TAKING A SEAT § */
on('job-join', el => {
  const j = (DATA.liveJobs || DATA.jobs || []).find(x =>
    String(x.id || x.jobId || '') === String(el.dataset.id));
  if (!j) { toast(text_('that-class-has-gone')); return; }
  BOOKING.how      = text_('instant-class');
  BOOKING.joining  = openClassLabel_(j);
  /* THE SAME RULE AS CHOOSING IT ON THE FORM: the class answers subject, level, place and seats (`joiningSet_`). */
  joiningSet_();
  closeStep_();
  finderSet_(FINDERS.stuff, { filters: [{ field: DOOR_FIELD, value: 'Booking' }], show: true });
  go('stuff');
  PAGE.stuff = stuffQuestionPage_() + 1;
  paintPager('stuff', true);
});

/* ---------- AN ADMIN ENDS A SESSION § */
on('job-delete', el => {
  const id = el.dataset.id;
  if (!sure_(el, text_('end-it'))) return;
  el.disabled = true;
  api({ action: 'deleteJob', adminName: USER.name, name: USER.name, jobId: id })
    .then(d => {
      if (d && d.error) { el.disabled = false; toast(d.error); return; }
      closeStep_();
      toast(text_('session-ended'));
      load();
    })
    .catch(err => { el.disabled = false; toast(why_(err)); });
});



/* The state the games keep between frames — the board, the clock, the deck, which month the calendar is showing. § */
/* ---------- ARE YOU SURE, WITHOUT A DIALOG § */
/* THE YES COUNTS ONLY SURE_GAP_MS AFTER THE ASK (534): a double tap's second half came 110 ms later and deleted; an early yes is ignored and it stays armed. */
const SURE_GAP_MS = 400;
/* `o.face(el, ask)` and `o.back(el)` draw a control's own armed look (the layout tiles say it in a label); without them the words replace the face. */
function sure_(el, ask, o) {
  if (!el) return true;                       // called from somewhere with no button: nothing to arm
  const opt = o || {};
  if (el.dataset.sure) {
    if (performance.now() - (el._sureAt || 0) < SURE_GAP_MS) return false;
    delete el.dataset.sure; clearTimeout(el._sureT); sureBack_(el); return true;
  }
  el.dataset.sure = '1';
  el._sureAt = performance.now();
  el._sureBack = opt.back || null;
  if (opt.face) opt.face(el, ask);
  else {
    /* THE WHOLE FACE IS KEPT, not its text: a tile is a drawn mark, and its text is nothing (420). */
    el._sureWas = { html: el.innerHTML, label: el.getAttribute('aria-label') };
    el.classList.add('is-sure');
    el.textContent = ask;
    if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', ask);
  }
  clearTimeout(el._sureT);
  el._sureT = setTimeout(() => {
    if (!el.dataset.sure) return;
    delete el.dataset.sure;
    sureBack_(el);
  }, opt.ms || 4000);
  return false;
}
function sureBack_(el) {
  const back = el._sureBack; el._sureBack = null;
  if (back) { if (el.isConnected) back(el); return; }
  const w = el._sureWas; el._sureWas = null;
  el.classList.remove('is-sure');
  if (!w) return;
  el.innerHTML = w.html;
  if (w.label != null) el.setAttribute('aria-label', w.label);
}

let FEED_AT = null;
let FEED_DECK = [];
let FEED_SEEN = [];
let FEED_PASS = 0;
const FEED_BUILT = {};

/* THE POLICIES A FAMILY OR TUTOR SIGNS UP TO (docs/policies), linked where they commit. Brand key `policies_url` is the switch: empty hides them. */
const POLICIES_URL = 'https://halexdias31-pixel.github.io/family/docs/policies/';
const POLICY_DOCS = {
  family: [['family-terms', 'Terms'], ['cancellation-refunds', text_('cancellation-and-refunds')], ['privacy-notice', 'Privacy'], ['complaints', 'Complaints'], ['safeguarding-policy', 'Safeguarding']],
  tutor: [['tutor-onboarding', 'Onboarding'], ['safer-recruitment', text_('safer-recruitment')], ['safeguarding-policy', 'Safeguarding'], ['online-safety', text_('online-safety')], ['home-visits', text_('home-visits')], ['privacy-notice', 'Privacy']]
};
function policyHref_(doc) {
  const base = String(brand('policies_url', POLICIES_URL) || '').trim();
  const name = String(doc || '').split('/').pop().replace(/\.md$/, '');
  return base && name ? base + name + '.md' : '';
}
function policyLinks_(who) {
  const list = (POLICY_DOCS[who] || []).filter(d => policyHref_(d[0]));
  if (!list.length) return '';
  return cardBlock_({ type: 'paperLinks', say: 'Policies: ', links: list.map(d => ({ href: policyHref_(d[0]), text: d[1] })) });
}
