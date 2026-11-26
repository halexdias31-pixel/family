/* @family. — messages.js shared helpers once beside the DMs (13 Nov): a Drive address, a picked file, a filename stamp, a tutor's own link. Messages itself went 25 Nov. */
/* ---------- SHARED HELPERS: a Drive address, a picked file, a filename stamp, a tutor's own link § */
/* A Google Drive share link is a page, not a picture — pasting one into an <img> gives a broken
   image every time. This turns it into the direct thumbnail. Anything that is already a plain URL
   passes straight through. */
function pic(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  const id = (u.match(/\/file\/d\/([\w-]{20,})/) || u.match(/[?&]id=([\w-]{20,})/) || [])[1];
  return id ? 'https://lh3.googleusercontent.com/d/' + id + '=w1200' : u;
}

/* TWENTY MEGABYTES A CLIP, because the whole file travels in one request and base64 adds a third. */
const CAM_VID_MAX = 20 * 1048576;
/* ONE FILE OR RECORDING, READY TO POST. § */
function camItemOf_(file) {
  return new Promise(done => {
    const type = String((file && file.type) || '');
    if (/^video\//i.test(type)) {
      if (file.size > CAM_VID_MAX) { done(null); return; }
      const r = new FileReader();
      r.onload = () => done({ kind: 'video', data: String(r.result || '') });
      r.onerror = () => done(null);
      try { r.readAsDataURL(file); } catch (e) { done(null); }
      return;
    }
    if (!/^image\//i.test(type)) { done(null); return; }
    /* NO OBJECT URLS (an old browser, a test page): nothing redrawn, and the caller sends the file as it is. */
    let url = '';
    try { url = URL.createObjectURL(file); } catch (e) { done(null); return; }
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
      const cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(img.naturalWidth * k));
      cv.height = Math.max(1, Math.round(img.naturalHeight * k));
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      try { done({ kind: 'image', data: cv.toDataURL('image/jpeg', 0.85) }); } catch (e) { done(null); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); done(null); };
    img.src = url;
  });
}
/* ONE FILENAME STAMP for every saved picture. */
function stamp_() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}
/* ---------- A TUTOR'S OWN ADDRESS (400): `?tutor=<handle>` opens their card, signed out or in ----------
   Prices follow the card's own rule (398): a child's phone has none to draw. */
const tutorLink_ = t => location.origin + location.pathname + '?tutor=' + encodeURIComponent(String((t && t.handle) || ''));
/* BY THE HANDLE ON THE TILE, so your own card's "Share my profile" works before the tutor list has you. */
/* A PICTURE OF THE CARD, NOT ONLY THE LINK (412) — the owner: "I meant it would share a PNG"; since 547 the picture is the card on the site itself. */
let TUTOR_PNG_BUSY = false;
on('tutor-share', el => {
  const handle = String(el.dataset.handle || '');
  if (!handle || TUTOR_PNG_BUSY) return;
  const t = (DATA.tutors || []).find(x => x && String(x.handle || '') === handle)
    || (USER && USER.handle === handle ? tutorPngMe_() : { handle, title: '@' + handle });
  const url = tutorLink_({ handle });
  TUTOR_PNG_BUSY = true;
  toast(text_('making-a-picture-of-this-profile'));
  tutorPng_(t)
    .then(blob => tutorPngHand_(blob, handle + '-profile.png', url, t.title || '@' + handle, el.closest && el.closest('.card, .qcard')))
    /* NO PICTURE: said and logged, never the link alone (owner, 18 Nov). */
    .catch(rcShareFail_)
    .then(() => { TUTOR_PNG_BUSY = false; }, () => { TUTOR_PNG_BUSY = false; });
});

/* YOUR OWN CARD BEFORE THE TUTOR LIST HAS YOU: what the sign-in reply knows. */
function tutorPngMe_() {
  const p = (USER && USER.profile) || {};
  return { handle: USER.handle, title: USER.name, image: p.photo || USER.photo || '', avatar: USER.avatar || '',
           personId: USER.personId, role: 'Tutor', description: p.headline ? '"' + p.headline + '"' : '' };
}

/* THE SHARE SHEET WITH THE FILE AND THE LINK; ELSE THE FILE DOWNLOADED AND THE LINK COPIED. */
function tutorPngHand_(blob, name, url, title, at) {
  const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
  const can = !!(file && navigator.share && navigator.canShare
                 && (() => { try { return navigator.canShare({ files: [file] }); } catch (e) { return false; } })());
  const save = () => {
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 60000);   // not at once: a download can start after the click returns
    const copy = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(url) : Promise.reject();
    return copy.then(() => toast(text_('image-saved-link-copied')), () => toast('Image saved · ' + url));
  };
  if (!can) return save();
  /* THE TAP HAS RUN OUT while the picture was made (iPhone): the picture under the card with its own Share button. */
  const offer = () => (at && typeof rcOffer_ === 'function' ? rcOffer_(blob, name, at, title) : save());
  if (navigator.userActivation && !navigator.userActivation.isActive) return offer();
  /* THE FILE ALONE: with a URL in `text`, iPhone apps (Messages, WhatsApp) send the link and drop the picture. */
  return navigator.share({ files: [file], title }).catch(e => { if (!e || e.name !== 'AbortError') return e && e.name === 'NotAllowedError' ? offer() : save(); });
}

/* ---------- THE PICTURE IS THE CARD (547): the owner, "when i share a staff profile it shares exactly as is" -- `findCard` draws it, the receipt's snapshot photographs it ---------- */
function tutorPng_(t) {
  const host = document.createElement('div');
  host.className = 'tpng-host';
  host.setAttribute('aria-hidden', 'true');
  const was = CARD_VIEWER; CARD_VIEWER = 'public';
  try { host.innerHTML = findCard({ kind: 'tutor', key: t.title || '', name: t.title || '', row: t }); } finally { CARD_VIEWER = was; }
  const card = host.firstElementChild;
  if (!card) return Promise.reject(new Error('no card'));
  host.style.width = tpngWidth_(t) + 'px';
  document.body.appendChild(host);
  return tpngInline_(card).then(() => rcPng_(card)).then(r => r.blob)
    .then(b => { host.remove(); return b; }, e => { host.remove(); throw e; });
}
/* THE SITE CARD'S OWN WIDTH, unzoomed, so the picture wraps where the site does; a column's card when no tutor card is drawn. */
function tpngWidth_(t) {
  const px = el => { const w = el ? parseFloat(getComputedStyle(el).width) : 0; return w > 0 ? w : 0; };
  const cards = [...document.querySelectorAll('.card.is-prof')].filter(el => !el.closest('.tpng-host') && px(el));
  const own = h => ((h.querySelector('.prof-handle') || {}).textContent || '') === '@' + (t && t.handle);
  const shown = cards.find(own) || cards[0];
  if (shown) return px(shown);
  const any = [...document.querySelectorAll('.screen .card, section .card')].find(el => !el.closest('.tpng-host') && px(el));
  return any ? px(any) : 24 * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
}
/* A PICTURE INSIDE AN SVG IMAGE LOADS NOTHING FROM OUTSIDE, so each photo and map tile goes in as data, decoded before the shot; what will not come is left out whole, never blurred. */
function tpngInline_(card) {
  const asData = src => fetch(src, { mode: 'cors' }).then(r => (r.ok ? r.blob() : Promise.reject(new Error(r.status))))
    .then(b => new Promise((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = () => no(fr.error); fr.readAsDataURL(b); }));
  const safe = src => { try { return asData(src); } catch (e) { return Promise.reject(e); } };
  const imgs = [...card.querySelectorAll('img')].map(img => {
    const src = img.getAttribute('src') || '';
    const got = /^data:/.test(src) ? Promise.resolve(src) : safe(img.src);
    return got.then(d => { img.removeAttribute('loading'); img.setAttribute('src', d);
      return img.decode ? img.decode().catch(() => img.remove()) : null; }, () => { img.remove(); });
  });
  const maps = [...card.querySelectorAll('.prof-heat')].map(heat => {
    const drop = () => {
      const cap = heat.previousElementSibling, next = heat.nextElementSibling;
      heat.remove();
      if (cap && cap.classList.contains('prof-cap') && !(next && next.classList.contains('prof-tags'))) cap.remove();
    };
    const tiles = heat.querySelector('.heat-tiles');
    const css = tiles ? tiles.style.backgroundImage : '';
    const urls = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m => m[1]);
    if (!urls.length) { drop(); return null; }
    return Promise.all(urls.map(safe)).then(ds => {
      tiles.style.backgroundImage = ds.map(d => 'url("' + d + '")').join(',');
      return Promise.all(ds.map(d => { const i = new Image(); i.src = d; return i.decode ? i.decode() : null; }));
    }).catch(drop);
  });
  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : null;
  return Promise.all(imgs.concat(maps, [fonts]));
}

/* ONCE A VISIT, on the first payload that has them. */
let TUTOR_LINK_DONE = false;
function openSharedTutor() {
  if (TUTOR_LINK_DONE) return;
  let h = '';
  try { h = String(new URLSearchParams(location.search).get('tutor') || '').replace(/^@+/, '').toLowerCase(); } catch (e) { h = ''; }
  if (!h) { TUTOR_LINK_DONE = true; return; }
  const t = (DATA.tutors || []).find(x => x && x.listed !== false && String(x.handle || '').toLowerCase() === h);
  if (!t) return;
  TUTOR_LINK_DONE = true;
  const item = { kind: 'tutor', name: t.title, key: t.title, row: t };
  openStep_({ title: t.title, html: cardBlock_({ type: 'group', look: 'tutor-link', inner: (typeof findCard === 'function' ? findCard(item) : '') + tileRow_(tile_(tutorOpts_(item))) }) });
}
