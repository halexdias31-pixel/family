/* @family. — messages.js DMs, Messages and Daive, cut out of posts.js when the Feed was switched off (13 Nov). */
/* ---------- MESSAGES ARE FIND › MESSAGES (find-only, 16 Nov): the column, its pages and its tab are gone; a conversation is a Find card (find-doors.js). */

/* ASKED ONCE, NOT ONCE PER PAINT — AND `MESSAGES` CANNOT BE THE FLAG THAT SAYS SO. § */
let DM_ASKED = false;
/* AND WHETHER IT CAME BACK, which `MESSAGES` cannot say. § */
let DM_DONE  = false;

/* IS ONE IN FLIGHT. Two overlapping asks against this backend is two round trips for one answer,
   and the second one landing first would paint an older list over a newer one. */
let DM_BUSY = false;
let DM_TIMER = 0;
/* ---------- WHEN IT LAST ASKED, NOT WHEN IT LAST GOT AN ANSWER § */
let DM_LAST = 0;

/* IT KEEPS ITSELF UP TO DATE, AND THE REFRESH BUTTON IS GONE § */
const DM_EVERY = 20 * 1000;

/* WHAT WOULD LOOK DIFFERENT IF IT WERE DRAWN AGAIN. § */
function dmStamp_() {
  return (MESSAGES || []).map(m => String((m && m.id) || '') + (m && m.read ? '1' : '0')).join(',');
}

/* IS SOMEBODY MID-SENTENCE. Asked of the DOM rather than remembered in a flag, which is what
   `msg-send` and `me-save` already do for the same reason: the fact is in the box. */
function dmTyping_() {
  const host = $('s-stuff');
  if (!host) return false;
  /* Files chosen and not yet sent count as typing: a repaint would keep them (they live in
     `MSG_QUEUE`) but would close whatever somebody was doing with the picker. */
  return [].slice.call(host.querySelectorAll('.msg-form .msg-text'))
    .some(b => String(b.value || '').trim())
    || Object.keys(MSG_QUEUE).some(k => (MSG_QUEUE[k] || []).length);
}

/* THE ONE SIDE EFFECT. § */
function dmSync_(force) {
  if (!USER || !LOADED || DM_BUSY) return;
  if (!force && DM_ASKED && Date.now() - DM_LAST < DM_EVERY) return;
  DM_ASKED = true; DM_BUSY = true; DM_LAST = Date.now();
  const was = dmStamp_();
  loadMessages().then(() => {
    DM_BUSY = false; DM_DONE = true;
    /* EACH CONVERSATION SHOWN IN FIND REDRAWN WHERE IT STANDS, never under somebody's typing. */
    if (dmStamp_() !== was && !dmTyping_()) dmShownThreads_().forEach(k => { try { msgFindRedraw_(k); } catch (e) { oops_(e, 'dm:sync'); } });
  });
}
/* THE CONVERSATIONS FIND IS SHOWING, by thread. */
function dmShownThreads_() {
  const host = $('s-stuff'), seen = {};
  if (!host) return [];
  [].forEach.call(host.querySelectorAll('[data-thread]'), el => { seen[el.dataset.thread] = 1; });
  return Object.keys(seen);
}
/* FIND › MESSAGES IS OPEN, OR A MESSAGE CARD SHOWS (a conversation, Daive, or a first message's form): what keeps the poll running. */
function dmShown_() {
  if (typeof AT === 'undefined' || AT !== 'stuff') return false;
  const host = $('s-stuff');
  return !!(host && host.querySelector('[data-thread], [data-daive], .kc-msg'));
}

/* THE PAYLOAD'S COPY (700): taken as the first answer, and the 20 s poll keeps it fresh from there. A backend that sends none leaves the ask as it was. */
function dmAdopt_(d) {
  if (!USER || !d || !Array.isArray(d.messages) || DM_BUSY) return;
  MESSAGES = d.messages; MSG_FAILED = false;
  DM_ASKED = true; DM_DONE = true; DM_LAST = Date.now();
}

/* STARTED WHEN A MESSAGE CARD IS DRAWN IN FIND (`threadCard_`, me-messages.js), and it stops itself once none shows. */
function dmPoll_() {
  clearInterval(DM_TIMER);
  dmSync_();
  DM_TIMER = setInterval(() => { if (dmShown_()) dmSync_(); else dmStop_(); }, DM_EVERY);
}
/* ONE TIMER: a card drawn again while it runs leaves it be. */
function dmWatch_() { if (!DM_TIMER && USER) dmPoll_(); }
function dmStop_() { clearInterval(DM_TIMER); DM_TIMER = 0; }

/* AND COMING BACK TO THE APP IS WORTH AN ASK WHATEVER THE CLOCK SAYS. § */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && dmShown_()) dmPoll_();
});

/* ---------- ONE LIST, TWO READINGS — THE MARKUP AND THE NAME IN THE HEADER § */
/* ---------- THE FACE IN A CONVERSATION'S HEAD IS THE ONE ON THEIR PROFILE § */
/* ---------- AND IT IS `personFace_`, LIKE EVERY OTHER FACE § */
function dmFace_(t) {
  const letter = initial(t.name);   // letters and digits only; the ring's data-letter, for the error listener below
  const famMine = !!(USER && USER.personId && DATA && DATA.familyFor && String(DATA.familyFor) === String(USER.personId));
  const rows = ((DATA && DATA.tutors) || [])
    .concat(famMine && Array.isArray(DATA.family) ? DATA.family : [])
    .concat(typeof may_ === 'function' && may_('admin') && DATA && Array.isArray(DATA.everyone) ? DATA.everyone : []);
  const id = String(t.id || '');
  /* THE SERVER'S WORD FIRST (413): `messages` sends each correspondent's chosen picture, or their figure when none is chosen — a parent or a child too, not only a tutor. */
  const sent = (t.msgs || []).map(m => m && m.withFace).filter(f => f && typeof f === 'object').pop();
  const listed = (id && rows.find(r => r && String(r.personId || '') === id))
    || rows.find(r => r && t.name && norm(r.title || '') === norm(t.name));
  const who = sent ? { image: String(sent.pic || ''), avatar: typeof sent.avatar === 'string' ? sent.avatar : (listed || {}).avatar,
                       handle: (listed || {}).handle || t.name, title: t.name, personId: id } : listed;
  /* THE INITIAL IN ITS RING, and a photo over it that gives way to the initial when it will not load (the listener below). */
  const av = (inner, pic) => cardBlock_({ type: 'group', tag: 'span', look: 'dm-av' + (pic ? ' has-pic' : ''), attrs: { 'aria-hidden': 'true', 'data-letter': letter },
    text: inner == null ? letter : null, inner: inner || '' });
  if (!who) return av();
  const face = personFace_({ pic: who.image, avatar: who.avatar, handle: who.handle, name: t.name || who.title,
                             personId: who.personId }, { cls: 'dm-pic', size: 32 });
  if (picKind_(who.image) === 'photo') return av(face, true);
  return /^<span class="dm-pic face-pic"/.test(face) ? av(face, true) : av();
}
/* A PHOTO THAT WILL NOT LOAD gives its ring back to the initial (it was an inline onerror; one listener now, as a boxer's picture has). */
document.addEventListener('error', e => {
  const img = e.target, ring = img && img.matches && img.matches('.dm-av.has-pic img') ? img.parentNode : null;
  if (ring) { ring.classList.remove('has-pic'); ring.textContent = ring.getAttribute('data-letter') || ''; }
}, true);

/* ---------- DAIVE, THE ASSISTANT, FIRST IN FIND › MESSAGES (449, 461; find-only 16 Nov) ----------
   A conversation like any other — the same head, bubbles and composer — kept on this device; `data-daive` marks its card. */
let ASST_BUSY = false, ASST_SAID = '';
const ASST_KEEP = 40, DAIVE = 'Daive';
const asstDay_ = () => todayIso_();   // the one today, js/core.js
function asstCap_() {
  const v = (DATA && DATA.constants && DATA.constants.vars) || {};
  const c = v.assistant_questions_per_day;
  return c === '' || c == null || isNaN(Number(c)) ? 5 : Math.max(0, Math.floor(Number(c)));
}
function asstKey_() { return 'asst:' + String((USER && USER.personId) || ''); }
/* HELD IN MEMORY TOO, so a phone whose storage refuses still counts down within the visit (461). */
let ASST_MEM = null;
function asstGet_() {
  let s = null;
  s = keep_.json(asstKey_(), null);
  if (!s && ASST_MEM && ASST_MEM.key === asstKey_()) s = ASST_MEM.s;
  s = s && typeof s === 'object' ? s : {};
  const msgs = Array.isArray(s.msgs) ? s.msgs.filter(m => m && typeof m.text === 'string') : [];
  const today = asstDay_();
  const left = s.day === today && typeof s.left === 'number' ? Math.min(s.left, asstCap_()) : asstCap_();
  return { day: today, left: Math.max(0, left), msgs: msgs.slice(-ASST_KEEP) };
}
function asstPut_(s) { ASST_MEM = { key: asstKey_(), s: s }; keep_.put(asstKey_(), JSON.stringify(s)); }
/* WHAT EACH COLUMN IS FOR, in plain words, so Daive can say where things are. Site help only: nothing about the business (547). */
const ASST_NAV = {
  spotlight: 'what is pinned in the window', feed: 'posts; the camera is the page above the newest post', reel: 'short videos, one per page',
  stuff: 'pick answers to narrow down questions, papers, lessons, tools and games', res: 'a second finder that keeps its own place',
  saved: 'what you starred', booking: 'book a session', shop: 'the shop',
  family: 'a parent account\'s settings', staff: 'a tutor account\'s settings', account: 'a student account\'s settings: sign in, PIN, progress',
  students: 'a card per student', parents: 'a card per parent',
};
/* WHAT DAIVE IS TOLD: the columns this viewer has, left to right, and the Tools widgets' names -- a map of the site and nothing else (547). */
function asstFacts_() {
  const out = ['swipe left and right to move between columns; the bar at the bottom jumps to one'];
  try { TABS.forEach(t => out.push('column "' + t.title + '": ' + (ASST_NAV[t.id] || t.title))); } catch (e) { /* no columns yet: the map is shorter, not broken */ }
  try { const ws = widgetsOf_('tool').map(x => x.name || x.id).filter(Boolean); if (ws.length) out.push('Tools in Find: ' + ws.join(', ')); } catch (e) { /* no widgets yet: the columns alone */ }
  out.push('Messages in Find: your conversations, one card each, and Daive first');
  out.push('tutors in Find: Profiles, then Tutor');
  out.push('to message a tutor: the Message tile on their card');
  return out.join('\n').slice(0, 4000);
}
/* THE SAME SHAPE `messagesHtml_` DRAWS FOR A PERSON, so Daive's bubbles are a conversation's bubbles. */
function asstMsgs_(s) {
  return s.msgs.map(m => ({ mine: m.role === 'user', read: true, body: m.text, atMs: m.at || 0, fromName: DAIVE }));
}
CARD_EMBEDS['daive'] = () => {
  const s = asstGet_(), cap = asstCap_(), out = s.left <= 0, shut = out || ASST_BUSY;
  const said = out ? 'No questions left today — they come back tomorrow.' : s.left + ' of ' + cap + ' questions left today';
  return cardBlocks_([
    { type: 'group', look: 'dm-head', blocks: [{ type: 'group', tag: 'span', look: 'dm-av daive-av', attrs: { 'aria-hidden': 'true' }, text: 'D' }, { type: 'msgHead', text: DAIVE }] },
    { type: 'group', look: 'msg-body', inner: messagesHtml_(asstMsgs_(s)) + (ASST_BUSY ? loading_() : '') },
    { type: 'msgForm', k: 'daive', to: DAIVE, rows: 1, max: 1000, off: shut, drafted: draftAttr_('asst', ''), value: ASST_BUSY ? '' : draftVal_('asst', '', ''),
      send: { form: true, look: 'btn msg-go', act: 'daive-send', off: shut, label: 'Send' }, note: ASST_SAID, also: [{ look: 'daive-left', text: said }] }]);
};
/* DAIVE IS AN ITEM (487): an admin's Delete and Note on it; deleted, it is gone for everyone. Its id keeps the old column's name, so a delete already made stands. */
/* ONE MAKER (owner, 18 Nov): Suggest and the admin's Edit words are tiles in the card's own row, never a row hung on after it. */
const DAIVE_ID = 'item:dm:daive';
const daiveHtml_ = () => renderCard(shapeCard_('msg', { kind: 'msg', name: DAIVE, tags: [{ text: DAIVE, colour: 0 }, { text: 'Assistant', colour: false }], data: { daive: 1, item: DAIVE_ID },
  tiles: [].concat(typeof suggestOpts_ === 'function' ? [suggestOpts_('widget', 'daive', DAIVE)] : [], (typeof wordsOpts_ === 'function' && wordsOpts_(DAIVE_ID)) || []).filter(Boolean),
  body: [{ type: 'embed', tool: 'daive' }] }));
const daiveItem_ = () => (typeof wordsIn_ === 'function' ? wordsIn_(DAIVE_ID, daiveHtml_()) : daiveHtml_());
/* REDRAWN IN PLACE in Find, and Find forgets what it drew, so a later paint never judges against the old card. */
function asstRedraw_() {
  const col = $('s-stuff'), card = col && col.querySelector('[data-daive]');
  if (!card) return;
  card.outerHTML = daiveItem_() || cardBlock_({ type: 'group', tag: 'span', attrs: { hidden: true } });
  const body = col.querySelector('[data-daive] .msg-body');
  if (body) body.scrollTop = body.scrollHeight;
  try { col.DRAWN = null; } catch (e) {}
}
on('daive-send', el => {
  const card = el.closest ? el.closest('[data-daive]') : null;
  const box = card ? card.querySelector('.msg-text') : null;
  const text = String((box && box.value) || '').trim();
  if (!text || ASST_BUSY || !USER) return;
  const s = asstGet_();
  if (s.left <= 0) return;
  const history = s.msgs.slice(-6).map(m => ({ role: m.role, text: m.text }));
  s.msgs.push({ role: 'user', text: text, at: Date.now() });
  asstPut_(s);
  ASST_BUSY = true; ASST_SAID = '';
  asstRedraw_();
  const done = (d) => {
    ASST_BUSY = false;
    const now = asstGet_();
    const told = d && d.left !== '' && d.left != null && !isNaN(Number(d.left)) ? Math.max(0, Math.floor(Number(d.left))) : null;
    if (d && d.success && d.answer) {
      /* AN ANSWER IS ONE QUESTION USED, whatever the reply says or forgets (461): the lower of ours less one and the server's. */
      now.left = Math.max(0, told == null ? s.left - 1 : Math.min(told, s.left - 1));
      now.msgs.push({ role: 'assistant', text: String(d.answer), at: Date.now() });
      try { draftDrop_('asst', ''); } catch (e) {}
    } else {
      if (told != null) now.left = told;
      /* NOT ANSWERED IS NOT ASKED: the question comes off the thread, and the backend gave the count back. */
      const last = now.msgs[now.msgs.length - 1];
      if (last && last.role === 'user' && last.text === text) now.msgs.pop();
      ASST_SAID = (d && (d.message || d.error)) || DAIVE + ' could not be reached — try again in a moment.';
    }
    now.msgs = now.msgs.slice(-ASST_KEEP);
    asstPut_(now);
    asstRedraw_();
    if (!(d && d.success)) { const b = $('s-stuff') && $('s-stuff').querySelector('[data-daive] .msg-text'); if (b && !b.disabled) b.value = text; }
  };
  api({ action: 'askAssistant', personId: USER.personId, question: text, history: history, facts: asstFacts_() })
    .then(done, () => done(null));
});

/* ---------- SHARED HELPERS FROM posts.js: a Drive address, a face by id, a picked file, a filename stamp, a tutor's own link § */
/* A Google Drive share link is a page, not a picture — pasting one into an <img> gives a broken
   image every time. This turns it into the direct thumbnail. Anything that is already a plain URL
   passes straight through. */
function pic(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  const id = (u.match(/\/file\/d\/([\w-]{20,})/) || u.match(/[?&]id=([\w-]{20,})/) || [])[1];
  return id ? 'https://lh3.googleusercontent.com/d/' + id + '=w1200' : u;
}
/* A CLIP IS MARKED `#video` BY THE BACKEND THAT UPLOADED IT, because a Drive address names no type;
   an address typed in is a clip if it ends like one. */
/* THE ADDRESS A `<video>` IS POINTED AT. § */
function postVidSrc_(u) {
  const bare = String(u || '').replace(/#video$/i, '');
  const id = (bare.match(/\/file\/d\/([\w-]{20,})/) || bare.match(/[?&]id=([\w-]{20,})/) || [])[1];
  return id ? 'https://drive.usercontent.google.com/download?id=' + id + '&export=download' : bare;
}

/* A PERSON'S FACE AND NAME FROM THEIR PROFILE ROW in the payload, by id (1040 r10); a post's own copy only when no list has them. */
const profileOf_ = id => { const r = id && ['people', 'tutors', 'family', 'students', 'clients', 'everyone'].map(k => ((DATA || {})[k] || []).find(x => x && String(x.personId || x.person_id || '') === String(id))).find(Boolean);
  return r ? { pic: r.image != null ? r.image : r.photo, avatar: r.avatar, handle: r.handle } : null; };
/* TWENTY MEGABYTES A CLIP AND FORTY-FIVE A POST, because the whole post travels in one request and
   base64 adds a third. Numbers a phone can post over a school's wifi, not limits anybody enforces
   past this card. */
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

/* ONCE A VISIT, on the first payload that has them — `openSharedPost`'s place in the landing. */
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
  openSheet(t.title, cardBlock_({ type: 'group', look: 'tutor-link', inner: (typeof findCard === 'function' ? findCard(item) : '') + tileRow_(tile_(tutorOpts_(item))) }));
}
