/* @family. — messages.js DMs, Messages and Daive, cut out of posts.js when the Feed was switched off (13 Nov). */
/* ---------- MESSAGES § */
/* ---------- ONE CONVERSATION PER PAGE, WHICH IS WHAT EVERY OTHER COLUMN ALREADY IS § */
/* ---------- BUT A COLUMN DRAWN AHEAD ASKS NOBODY (`dmAsk_`) § */
function dmAsk_() {
  if (typeof AHEAD !== 'undefined' && AHEAD.running) {
    if (!DM_DONE && USER && MESSAGES) { DM_ASKED = true; DM_DONE = true; }
    return;
  }
  dmSync_();
}
screen('dm', () => { dmAsk_(); return pages('dm', dmPages_().map(p => p.html)); });

/* ---------- THIS SCREEN READ A KEY THAT HAS NEVER EXISTED § */

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
  const host = $('s-dm');
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
  const first = !DM_ASKED;
  DM_ASKED = true; DM_BUSY = true; DM_LAST = Date.now();
  const was = dmStamp_();
  /* Which conversation is on the screen, by person rather than by page — a message arriving in another thread moves that thread to the front and would otherwise § */
  /* ONE LESS THAN THE PAGE: Daive is page 0 (449). */
  const here = ((messageThreads_()[((typeof PAGE === 'object' && PAGE.dm) || 0) - 1]) || {}).id;
  loadMessages().then(() => {
    DM_BUSY = false; DM_DONE = true;
    if (first) paint('dm');
    else if (dmStamp_() !== was && !dmTyping_()) dmRedraw_(here);
  });
}

/* THE PAYLOAD'S COPY (700): taken as the first answer, and the 20 s poll keeps it fresh from there. A backend that sends none leaves the ask as it was. */
function dmAdopt_(d) {
  if (!USER || !d || !Array.isArray(d.messages) || DM_BUSY) return;
  MESSAGES = d.messages; MSG_FAILED = false;
  DM_ASKED = true; DM_DONE = true; DM_LAST = Date.now();
}

/* STARTED WHEN THE COLUMN ARRIVES AND STOPPED WHEN IT LEAVES, from `startScreen_` and `paint` — the one list that exists for exactly this. § */
function dmPoll_() {
  clearInterval(DM_TIMER);
  dmSync_();
  DM_TIMER = setInterval(() => { if (AT === 'dm') dmSync_(); else dmStop_(); }, DM_EVERY);
}
function dmStop_() { clearInterval(DM_TIMER); DM_TIMER = 0; }

/* AND COMING BACK TO THE APP IS WORTH AN ASK WHATEVER THE CLOCK SAYS. § */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && AT === 'dm') dmPoll_();
});

/* ---------- ONE LIST, TWO READINGS — THE MARKUP AND THE NAME IN THE HEADER § */
/* ---------- THE FACE IN A CONVERSATION'S HEAD IS THE ONE ON THEIR PROFILE § */
/* ---------- AND IT IS `personFace_`, LIKE EVERY OTHER FACE § */
function dmFace_(t) {
  const letter = initial(t.name);   // letters and digits only; the ring's data-letter, for the error listener below
  const famMine = !!(USER && USER.personId && DATA && DATA.familyFor && String(DATA.familyFor) === String(USER.personId));
  const rows = ((DATA && DATA.tutors) || [])
    .concat(famMine && Array.isArray(DATA.family) ? DATA.family : [])
    .concat(typeof isAdmin === 'function' && isAdmin() && DATA && Array.isArray(DATA.everyone) ? DATA.everyone : []);
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

function dmPages_() {
  if (!USER) return [{ name: '', html: card_(cardBlock_({ type: 'group', look: '', blocks: [{ type: 'msgHead', text: 'Messages' }] })) }];
  /* THE PAYLOAD AND THE FIRST ANSWER FOR MESSAGES — `loading_()` until both, as every column waits. */
  if (!LOADED || !DM_DONE) return [{ name: '', html: loading_() }];

  const threads = messageThreads_();
  /* ---------- THE HEAD CARD WAS A PAGE WITH NO MESSAGE ON IT § */

  /* ---------- AND AN EMPTY INBOX SAYS WHICH EMPTY IT IS § */
  if (!threads.length) return daivePages_().concat([{ name: '', html: suggestRowIn_(card_(cardBlock_({ type: 'group', look: '',
    blocks: [{ type: 'msgHead', text: 'Messages' }], inner: MSG_FAILED ? empty_('Messages did not load.') : emptyMessages_(),
    tiles: MSG_FAILED ? [{ form: true, label: 'Try again', act: 'dm-refresh', kind: 'quiet' }] : [] })), 'widget', 'messages', 'Messages') }]);

  /* ONE CARD PER CONVERSATION, most recent first — `messageThreads_` has already done both, and
     doing it again here is a second copy of the ordering rule to get wrong later. */
  /* ---------- DRAWN IS READ, ON THIS SCREEN ONLY § */
  threads.forEach(t2 => markRead_(t2.msgs));
  /* ---------- AND EACH ONE CAN BE ANSWERED WHERE IT IS READ § */
  /* THE NAME IS THE PERSON, and the unread count rides on it — so the header says who you are reading rather than "3 of 7", which is the same judgement § */
  return daivePages_().concat(threads.map(t => ({
    name: displayName_(t.name) + (t.unread ? ' (' + t.unread + ')' : ''),
    html: renderCard({ kind: 'msg', look: 'dm-page' + (t.unread ? ' unread' : ''), name: displayName_(t.name),
      body: [{ type: 'embed', tool: 'dm-thread', args: { t } }] }),
  })));
}

/* ---------- DAIVE, THE ASSISTANT, PINNED FIRST IN MESSAGES (449, 461) ----------
   A conversation like any other — the same head, bubbles and composer — kept on this device; `data-daive` marks its card. */
let ASST_BUSY = false, ASST_SAID = '';
const ASST_KEEP = 40, DAIVE = 'Daive';
const asstDay_ = () => { try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } };
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
  try { s = JSON.parse(localStorage.getItem(asstKey_()) || 'null'); } catch (e) { s = null; }
  if (!s && ASST_MEM && ASST_MEM.key === asstKey_()) s = ASST_MEM.s;
  s = s && typeof s === 'object' ? s : {};
  const msgs = Array.isArray(s.msgs) ? s.msgs.filter(m => m && typeof m.text === 'string') : [];
  const today = asstDay_();
  const left = s.day === today && typeof s.left === 'number' ? Math.min(s.left, asstCap_()) : asstCap_();
  return { day: today, left: Math.max(0, left), msgs: msgs.slice(-ASST_KEEP) };
}
function asstPut_(s) { ASST_MEM = { key: asstKey_(), s: s }; try { localStorage.setItem(asstKey_(), JSON.stringify(s)); } catch (e) {} }
/* WHAT EACH COLUMN IS FOR, in plain words, so Daive can say where things are. Site help only: nothing about the business (547). */
const ASST_NAV = {
  spotlight: 'what is pinned in the window', feed: 'posts; the camera is the page above the newest post', reel: 'short videos, one per page',
  dm: 'messages, one conversation per page; Daive is the first',
  stuff: 'pick answers to narrow down questions, papers, lessons, tools and games', res: 'a second finder that keeps its own place',
  saved: 'what you starred', booking: 'book a session', shop: 'the shop',
  family: 'a parent account\'s settings', staff: 'a tutor account\'s settings', account: 'a student account\'s settings: sign in, PIN, progress',
  tutors: 'a card per tutor', students: 'a card per student', parents: 'a card per parent',
};
/* WHAT DAIVE IS TOLD: the columns this viewer has, left to right, and the Tools widgets' names -- a map of the site and nothing else (547). */
function asstFacts_() {
  const out = ['swipe left and right to move between columns; the bar at the bottom jumps to one'];
  try { TABS.forEach(t => out.push('column "' + t.title + '": ' + (ASST_NAV[t.id] || t.title))); } catch (e) { /* no columns yet: the map is shorter, not broken */ }
  try { const ws = widgetsOf_('tool').map(x => x.name || x.id).filter(Boolean); if (ws.length) out.push('Tools in Find: ' + ws.join(', ')); } catch (e) { /* no widgets yet: the columns alone */ }
  out.push('to message a tutor: the Message tile on their card');
  return out.join('\n').slice(0, 4000);
}
/* THE SAME SHAPE `messagesHtml_` DRAWS FOR A PERSON, so Daive's bubbles are a conversation's bubbles. */
function asstMsgs_(s) {
  return s.msgs.map(m => ({ mine: m.role === 'user', read: true, body: m.text, atMs: m.at || 0, fromName: DAIVE }));
}
/* A CONVERSATION'S INSIDES (head, bubbles, composer) are the card's one embed: the send path stays msgForm_'s own. */
CARD_EMBEDS['dm-thread'] = ({ t }) => cardBlocks_([
  { type: 'group', look: 'dm-head', inner: dmFace_(t) + cardBlock_({ type: 'msgHead', text: [displayName_(t.name)].concat(t.unread ? [' ', { span: 'dm-new', text: t.unread + ' new' }] : []) }) },
  { type: 'group', look: 'msg-body', inner: messagesHtml_(t.msgs) }]) + msgForm_(t.name, t.id);
CARD_EMBEDS['daive'] = () => {
  const s = asstGet_(), cap = asstCap_(), out = s.left <= 0, shut = out || ASST_BUSY;
  const said = out ? 'No questions left today — they come back tomorrow.' : s.left + ' of ' + cap + ' questions left today';
  return cardBlocks_([
    { type: 'group', look: 'dm-head', blocks: [{ type: 'group', tag: 'span', look: 'dm-av daive-av', attrs: { 'aria-hidden': 'true' }, text: 'D' }, { type: 'msgHead', text: DAIVE }] },
    { type: 'group', look: 'msg-body', inner: messagesHtml_(asstMsgs_(s)) + (ASST_BUSY ? loading_() : '') },
    { type: 'msgForm', k: 'daive', to: DAIVE, rows: 1, max: 1000, off: shut, drafted: draftAttr_('asst', ''), value: ASST_BUSY ? '' : draftVal_('asst', '', ''),
      send: { form: true, look: 'btn msg-go', act: 'daive-send', off: shut, label: 'Send' }, note: ASST_SAID, also: [{ look: 'daive-left', text: said }] }]);
};
const daiveHtml_ = () => renderCard({ kind: 'msg', look: 'daive', name: DAIVE, data: { daive: 1 }, body: [{ type: 'embed', tool: 'daive' }] });
/* DAIVE IS AN ITEM (487): an admin's Delete and Note on it; deleted, it is gone for everyone. */
const daiveItem_ = () => {
  const h = typeof itemMark_ === 'function' ? itemMark_('item:dm:daive', 'dm', daiveHtml_()) : daiveHtml_();
  return h ? suggestRowIn_(h, 'widget', 'daive', DAIVE) : '';
};
function daivePage_() { return { name: DAIVE, html: daiveItem_() }; }
const daivePages_ = () => [daivePage_()].filter(p => p.html);
/* REDRAWN IN PLACE, and the column forgets what it drew, so a later paint never judges against the old card. */
function asstRedraw_() {
  const col = $('s-dm'), card = col && col.querySelector('[data-daive]');
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
    if (!(d && d.success)) { const b = $('s-dm') && $('s-dm').querySelector('[data-daive] .msg-text'); if (b && !b.disabled) b.value = text; }
  };
  api({ action: 'askAssistant', personId: USER.personId, question: text, history: history, facts: asstFacts_() })
    .then(done, () => done(null));
});

/* ---------- A CONVERSATION OPENS AT THE NEWEST MESSAGE, NOT THE OLDEST § */
function dmFoot_() {
  const col = $('s-dm');
  if (!col) return;
  [].forEach.call(col.querySelectorAll('.msg-body'), el => {
    el.scrollTop = el.scrollHeight;
    /* A PICTURE LANDS AFTER THE SCROLL, and a photograph arriving 300px tall under a thread already at its bottom pushes the newest message out of sight. § */
    [].forEach.call(el.querySelectorAll('img, video'), m => {
      if (m.dataset.foot) return;
      m.dataset.foot = '1';
      const bottom = () => el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      const was = bottom();
      m.addEventListener(m.tagName === 'VIDEO' ? 'loadedmetadata' : 'load', () => {
        if (was || bottom()) el.scrollTop = el.scrollHeight;
      }, { once: true });
    });
  });
}

/* THE ONLY WAY BACK TO THE SERVER ONCE THE SCREEN IS UP. The fetch above runs once, so without this
   a message that arrived after the tab was first opened would not appear until a reload. */
on('dm-refresh', () => { loadMessages().then(() => { paint('dm'); setTimeout(dmFoot_, 0); }); });

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
const postIsVideo_ = u => /#video$/i.test(u) || /\.(mp4|webm|mov|m4v)(?:[?#]|$)/i.test(u);
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
const CAM_POST_MAX = 45 * 1048576;
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
  toast('Making a picture of this profile…');
  tutorPng_(t)
    .then(blob => tutorPngHand_(blob, handle + '-profile.png', url, t.title || '@' + handle))
    /* NO CANVAS (an old browser, a test page): the link alone, as before 412. */
    .catch(() => tutorLinkOnly_(t.title || '@' + handle, url))
    .then(() => { TUTOR_PNG_BUSY = false; }, () => { TUTOR_PNG_BUSY = false; });
});

/* YOUR OWN CARD BEFORE THE TUTOR LIST HAS YOU: what the sign-in reply knows. */
function tutorPngMe_() {
  const p = (USER && USER.profile) || {};
  return { handle: USER.handle, title: USER.name, image: p.photo || USER.photo || '', avatar: USER.avatar || '',
           personId: USER.personId, role: 'Tutor', description: p.headline ? '"' + p.headline + '"' : '' };
}

function tutorLinkOnly_(title, url) {
  if (navigator.share) return navigator.share({ title, text: title + ' on ' + brand('name', '@family.'), url }).catch(() => {});
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(url).then(() => toast('Link copied')).catch(() => toast(url));
  toast(url);
}

/* THE SHARE SHEET WITH THE FILE AND THE LINK; ELSE THE FILE DOWNLOADED AND THE LINK COPIED. */
function tutorPngHand_(blob, name, url, title) {
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
    return copy.then(() => toast('Image saved · link copied'), () => toast('Image saved · ' + url));
  };
  if (!can) return save();
  return navigator.share({ files: [file], title, text: url }).catch(e => { if (!e || e.name !== 'AbortError') return save(); });
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
