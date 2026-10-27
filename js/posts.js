/* @family. — posts.js ONE FILE, SPLIT. § */


/* ---------- POSTS § */

/* A Google Drive share link is a page, not a picture — pasting one into an <img> gives a broken
   image every time. This turns it into the direct thumbnail. Anything that is already a plain URL
   passes straight through. */
function pic(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  const id = (u.match(/\/file\/d\/([\w-]{20,})/) || u.match(/[?&]id=([\w-]{20,})/) || [])[1];
  return id ? 'https://lh3.googleusercontent.com/d/' + id + '=w1200' : u;
}

/* THE FEED, IN ORDER. The sheet's row order is Drive's iteration order, which is not chronological and not anything — February posts were sitting between June § */
/* ---------- ONE POST, AS A CARD § */
/* ---------- EVERY PICTURE AND CLIP ON A POST, AS ONE LIST § */
function postMedia_(p) {
  const list = Array.isArray(p && p.media) && p.media.length ? p.media : [p && p.image];
  return list.map(x => String(x || '').trim()).filter(Boolean);
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
/* ONE ITEM, drawn as a picture or as a clip. § */
function postItem_(u, cls, eager) {
  if (postIsVideo_(u)) {
    return `<video class="${cls} post-vid" src="${esc(postVidSrc_(u))}"
      data-open="${esc(String(u).replace(/#video$/i, ''))}" controls playsinline preload="metadata"></video>`;
  }
  return `<img class="${cls}" src="${esc(pic(u))}" alt="" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
}
/* ---------- SEVERAL OF THEM, IN A GRID RATHER THAN A STRIP § */
/* ---------- THE NEXT POSTS' PICTURES ARE ASKED FOR BEFORE YOU REACH THEM § */
const PICS_BACK = 2, PICS_AHEAD = 6, PICS_DECODE = 2;
function picsAhead_(id) {
  try {
    const host = $('s-' + id);
    if (!host) return;
    const pages = host.querySelectorAll(':scope > .page');
    if (!pages.length) return;
    const at = PAGE[id] || 0;
    const k = typeof domIndex_ === 'function' ? domIndex_(id, at) : at;
    const dir = (typeof AHEAD !== 'undefined' && AHEAD.dir.y[id]) || 1;
    const lit = new Set(typeof GLASS !== 'undefined' && GLASS.at === AT ? GLASS.pages : []);
    for (let j = -PICS_BACK; j <= PICS_AHEAD; j++) {
      const pg = pages[k + dir * j];
      if (!pg) continue;
      const low = !lit.has(pg);
      pg.querySelectorAll('img').forEach(img => {
        if (img.loading === 'lazy') img.loading = 'eager';
        if (low) { if (img.getAttribute('fetchpriority') !== 'low' && !img.complete) img.setAttribute('fetchpriority', 'low'); }
        else if (img.getAttribute('fetchpriority') === 'low') img.removeAttribute('fetchpriority');
      });
    }
  } catch (e) { /* a picture fetched on arrival is still a picture */ }
}

/* ---------- AND IN THE QUIET: THE NEXT TWO DECODED, THE COLUMNS BESIDE, THEN EVERY OTHER COLUMN § */
/* ---------- AND A CARD FILLED AFTER THE PLACEMENT IS ASKED FOR AS IF THE PLACEMENT HAD SEEN IT § */
const PICS_ASKED = new WeakSet();
function picsWant_(id) {
  const host = $('s-' + id);
  if (!host) return null;
  const pages = host.querySelectorAll(':scope > .page');
  if (!pages.length) return null;
  const ti = TABS.findIndex(t => t.id === AT), ci = TABS.findIndex(t => t.id === id);
  if (ci < 0) return null;
  const at = PAGE[id] || 0;
  const k = typeof domIndex_ === 'function' ? domIndex_(id, at) : at;
  const wide = typeof WIDE !== 'undefined' && WIDE;
  const beside = id !== AT && (wide ? (typeof GLASS !== 'undefined' && GLASS.cols.indexOf(id) !== -1) : Math.abs(ci - ti) === 1);
  const eager = [], decode = [];
  if (id === AT) {
    const dir = (typeof AHEAD !== 'undefined' && AHEAD.dir.y[id]) || 1;
    for (let j = -PICS_BACK; j <= PICS_AHEAD; j++) if (pages[k + dir * j]) eager.push(pages[k + dir * j]);
    for (let j = 1; j <= PICS_DECODE; j++) if (pages[k + dir * j]) decode.push(pages[k + dir * j]);
  } else {
    const hi = beside ? 2 : 4;
    for (let j = -1; j <= hi; j++) if (pages[k + j]) eager.push(pages[k + j]);
    if (beside && wide && pages[k]) decode.push(pages[k]);
  }
  return { eager, decode };
}
function picsTodo_(w) {
  return !!w && (w.eager.some(pg => pg.querySelector('img[loading="lazy"]'))
    || w.decode.some(pg => [...pg.querySelectorAll('img')].some(img => !PICS_ASKED.has(img) && !(img.complete && img.naturalWidth))));
}
function picsRun_(id) {
  const w = picsWant_(id);
  if (!w) return;
  if (id === AT) picsAhead_(id);
  else w.eager.forEach(pg => pg.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; }));
  w.decode.forEach(pg => pg.querySelectorAll('img').forEach(img => {
    if (PICS_ASKED.has(img) || (img.complete && img.naturalWidth)) return;
    PICS_ASKED.add(img);
    if (img.loading === 'lazy') img.loading = 'eager';
    try { if (img.decode) img.decode().catch(() => {}); } catch (e) {}
  }));
}
function picsJobs_() {
  if (typeof AHEAD_KINDS === 'undefined') return [];
  const out = [];
  TABS.forEach(t => {
    if (STALE[t.id]) return;
    const w = picsWant_(t.id);
    if (picsTodo_(w)) out.push({ key: 'pics:' + t.id, kind: 'pics', d: aheadDist_(t.id, null), run: () => picsRun_(t.id) });
  });
  return out;
}
if (typeof AHEAD_KINDS !== 'undefined') AHEAD_KINDS.push(picsJobs_);
function postMediaHtml_(list, i) {
  if (!list.length) return '';
  if (list.length === 1) {
    const u = list[0];
    if (postIsVideo_(u)) return postItem_(u, 'post-pic', i < 2);
    /* THE PICTURE'S OWN SHAPE, EDGE TO EDGE — and 4:5 only until the file says what that is. § */
    return `<img class="post-pic" src="${esc(pic(u))}" alt="" width="800" height="1000"
           decoding="async" loading="${i < 2 ? 'eager' : 'lazy'}">`;
  }
  return `<div class="post-grid${list.length % 2 ? ' is-odd' : ''}">${
    list.map((u, k) => postItem_(u, 'post-cell', i < 2 && k < 2)).join('')}</div>`;
}
/* A CLIP DRIVE WOULD NOT HAND OVER BECOMES A LINK TO IT, not a black box with a play button that does nothing. § */
function postVidFail_(v) {
  if (!v || v.dataset.dead) return;
  v.dataset.dead = '1';
  const href = v.dataset.open || '';
  const a = document.createElement('a');
  a.className = v.className.replace('post-vid', 'post-vid-out');
  a.href = href; a.target = '_blank'; a.rel = 'noopener';
  a.textContent = '\u25b6 Open the video';
  v.replaceWith(a);
}
document.addEventListener('error', e => {
  const v = e.target;
  if (v && v.matches && v.matches('video.post-vid')) postVidFail_(v);
}, true);

/* THE AUTHOR'S FACE, READ AT DRAW TIME (474): your own post wears the picture on your account now, not the one the post was sent with; the brand's mark only for the business. */
function postFaceWho_(p, who) {
  const id = String((p && p.authorId) || '');
  const me = id && typeof USER !== 'undefined' && USER && String(USER.personId || '') === id;
  if (me) {
    const now = String(USER.photo || (USER.profile || {}).photo || '');
    return { pic: now, avatar: USER.avatar || '', handle: USER.handle || p.handle, name: who, personId: id };
  }
  if (id) return { pic: p.avatar || '', avatar: p.figure, handle: p.handle, name: who, personId: id };
  return { pic: picKind_(p.avatar) ? p.avatar : (brand('logo_square') || brand('logo_circle')), avatar: p.figure, handle: p.handle, name: who };
}
function postFace_(p, who) {
  const f = postFaceWho_(p, who);
  return personFace_(f, { cls: 'post-face', none: 'none', size: 30 })
    .replace(/^<(img|span) class="/, '<$1 data-face-of="' + esc(f.personId || '') + '" class="');
}
/* A NEW PICTURE ON THE ACCOUNT REDRAWS YOUR FACES ON THE FEED where they stand — `pfpTake_` (me.js) calls this. */
function postFacesMine_() {
  if (typeof USER === 'undefined' || !USER || !USER.personId) return;
  const id = String(USER.personId);
  document.querySelectorAll('[data-face-of="' + id + '"]').forEach(el => {
    const p = (DATA.posts || []).find(x => String(x.authorId || '') === id) || { authorId: id };
    el.outerHTML = postFace_(p, p.handle || p.author || USER.name);
  });
}

function postCard_(p, i) {
    const media = postMedia_(p);
    /* The author's face, or the brand's mark when the post is the business speaking. A column of
       blank circles is the thing that makes a feed look unfinished. */
    const who = p.handle || p.author || brand('name', '@family.');
    /* ---------- THROUGH `personFace_`, THE ONE FUNCTION EVERY FACE GOES THROUGH § */
    const faceHtml = postFace_(p, who);

    /* ---------- THE FACES' SLOT, BUILT ONCE BECAUSE IT GOES IN ONE OF TWO PLACES § */
    const acts = reacts(p) || (isAdmin()
      ? '<span class="faint">No reactions — this payload predates them. '
        + 'Check the build stamp on Business.</span>'
      : '');
    const actsHtml = acts ? `<div class="post-acts">${acts}</div>` : '';

    /* The order is Instagram's, and it is right: § */
    /* WAITING FOR APPROVAL (413): a dotted outline and a line saying so — only its author and an admin are ever sent one. */
    return `<article class="post${p.waiting ? ' is-pending' : ''}" data-post="${esc(p.id)}">
      ${p.waiting ? `<p class="post-pending" role="status">Waiting for approval${isAdmin() ? '' : ' · only you and the admin can see it'}</p>` : ''}
      <header class="post-by">
        ${faceHtml}
        <span class="post-nm">
          ${/* No "· deleted" any more: a deleted post is not drawn at all, so nothing reaching
                 here can be one. */''}
          <span class="post-who">${esc(who)}${p.pinned
            ? ' <span class="faint">· pinned</span>' : ''}${p.refused
            ? ' <span class="post-wait">· not put up</span>' : ''}</span>
          ${p.location ? `<span class="post-where">${esc(p.location)}</span>` : ''}
        </span>
        ${/* THE ⋯ STOOD HERE — "one glyph, at the end of the row where it does not compete with the picture; a post is looked at a hundred times for every time it is § */
              ''}
      </header>

      ${/* A SHAPE BEFORE IT LOADS. § */
             ''}
      ${postMediaHtml_(media, i)}

      ${/* THE FACES, DIRECTLY UNDER THE PICTURE — the place the heart held, where the eye already goes and where the thing you can do about a photograph belongs. § */
            ''}
      ${media.length ? actsHtml : ''}

      ${/* The name leads the caption, as it does everywhere — but ONLY when there is a caption.
            Without a caption it was printing the name on its own under the picture, which is the
            name said twice and answers nothing. */''}
      ${p.caption ? `<p class="post-cap"><b>${esc(who)}</b> ${mark(p.caption)}</p>` : ''}
      ${p.poll ? poll(p) : ''}
      ${p.body ? `<p class="note">${mark(p.body)}</p>` : ''}
      ${media.length ? '' : actsHtml}
      ${postWhen_(p)}
      ${/* WHAT YOU CAN DO ABOUT IT, IN ONE ROW. § */
            ''}
      ${postTiles_(p)}
      ${commentsHtml_(p)}
    </article>`;
}

/* WHAT PEOPLE SAID UNDER IT. § */
function commentsHtml_(p) {
  const c = p && p.comments;
  if (!c || !Array.isArray(c.list)) return '';
  const list = c.list;
  const more = Math.max(0, Number(c.total || list.length) - list.length);

  /* ---------- A CONVERSATION IS ONE ELEMENT, NOT A SECOND CARD § */
  return `<div class="post-said">
    ${list.length ? `<ul class="cmt-list">${list.map(x => `
      <li class="cmt${x.mine ? ' mine' : ''}">
        <p class="cmt-body"><b>${esc(x.name)}</b> ${mark(x.body)}</p>
        <p class="faint cmt-when">${esc(ago(x.at) || x.at || '')}${x.canRemove
          ? ` · <button class="cmt-x" data-do="cmt-del" data-id="${esc(x.id)}">Remove</button>`
          : ''}</p>
      </li>`).join('')}</ul>` : ''}
    ${/* THE ONES NOT SHOWN ARE A NUMBER RATHER THAN A SILENCE. `doGet` caps the list at sixty;
          a conversation that simply stops at sixty with nothing saying so is a conversation
          somebody thinks they have read. */''}
    ${more ? `<p class="faint">${more} more, not shown.</p>` : ''}
    ${/* ---------- POST IS A TILE § */
          ''}
    ${USER
      ? `<div class="cmt-form">
           ${/* A DRAFT (data.js), per post and per person: § */
                 ''}
           <textarea class="cmt-text" rows="1" maxlength="2000"
             placeholder="Say something…"${draftAttr_('cmt', p.id)}>${esc(draftVal_('cmt', p.id))}</textarea>
           ${tile_({ icon: 'send', label: 'Post', note: 'your comment', act: 'cmt-add', cls: 'cmt-go',
                     data: { id: p.id } })}
           <p class="faint cmt-said"></p>
         </div>`
      : `<p class="faint">Sign in to say something.</p>`}
  </div>`;
}

/* ---------- POSTING ONE § */
on('cmt-add', el => {
  const form = el.closest ? el.closest('.cmt-form') : null;
  const box  = form ? form.querySelector('.cmt-text') : null;
  const said = form ? form.querySelector('.cmt-said') : null;
  const text = ((box && box.value) || '').trim();
  if (!text) { box && box.focus(); return; }
  if (!USER) { if (said) said.textContent = 'Sign in first.'; return; }

  /* THE RING, NOT A WORD. § */
  el.disabled = true;
  el.classList.add('is-busy');
  const done = () => { el.disabled = false; el.classList.remove('is-busy'); };

  /* SENT, SO NOT A DRAFT ON ANY OTHER PAGE — a reload while the server answered put the comment back in
     the box after it was on the post (`draftSent_`, data.js; the review of 317). Dropped by the reply,
     given back by a refusal. */
  try { draftSent_('cmt', el.dataset.id, text); } catch (e) {}
  send({ action: 'addComment', name: USER.name, personId: USER.personId,
         postId: el.dataset.id, body: text })
    .then(() => { done(); if (box) { box.value = ''; box.style.height = ''; }
                  try { draftSentDone_('cmt', el.dataset.id, text); } catch (e) {}
                  if (said) said.textContent = ''; load(); })
    /* THE SERVER'S OWN SENTENCE. Every refusal it can give is written for a person to read — the
       length, the post being gone, not being signed in — and "Not posted" would throw away the
       only part that says what to do about it. */
    .catch(err => { done(); try { draftSentBack_('cmt', el.dataset.id, text); } catch (e) {}
                    if (said) said.textContent = String(err.message || 'Not posted.'); });
});

/* TAKING ONE DOWN. `canRemove` came from the server per comment, so this button only exists where the server has already said yes — and the server checks again § */
on('cmt-del', el => {
  if (!USER) return;
  el.disabled = true;
  send({ action: 'deleteComment', name: USER.name, personId: USER.personId,
         commentId: el.dataset.id })
    .then(() => load())
    .catch(err => { el.disabled = false; toast(String(err.message || 'Not removed.')); });
});

function feedPosts() {
  return [...(DATA.posts || [])]
    /* A DELETED POST IS GONE FROM THE FEED, for everybody including the admin who deleted it. § */
    .filter(p => p.active !== false)
    .sort((a, b) => {
      const pin = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      if (pin) return pin;
      /* `at` first — the payload's millisecond timestamp. `when` is a DAY, so two posts from the
         same afternoon tie on it and fall back to sheet order, which after a folder scan is
         Drive's order and no order at all. */
      const da = parseWhen(a.at || a.when), db = parseWhen(b.at || b.when);
      /* An undated post goes LAST, not first. Sorting a null as 0 put every unparsed date at the
         bottom of time — which is 1970, and above everything. */
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db - da;
    });
}

/* ---------- THE FEED IS A FUNNEL ANSWER, NOT A COLUMN § */
function postsBlocks() {
  /* NOTHING LOADED YET is not the same as NOTHING TO SHOW, and the difference matters: § */
  if (!LOADED) return [loading_()];

  const posts = feedPosts();
  /* ---------- WHAT THE CALENDAR IS OFFERING, AT THE FRONT OF THE FEED § */
  const festive = (DATA.festive || []).map(f => typeof itemMark_ === 'function' ? itemMark_('item:feed:festive', 'feed', festiveCard(f)) : festiveCard(f)).filter(Boolean);


  /* THE FEED IS NEVER EMPTY WHEN SOMEBODY IS SIGNED OUT — the sign-in card is always there — so the
     nothing-here message is only right when there is genuinely nothing and somebody to see it. */
  if (!posts.length && !festive.length && USER) {
    return [nothingHere('Nothing posted yet.<br><span class="faint">Add a row to the posts tab '
      + 'with an image link and a caption.</span>')];
  }

  /* ONE POST PER SCREEN, and the same pager the tools use. § */
  /* THE ＋ IS ON THE FEED, not in a bar above it. § */
  const cards = posts.map((p, i) => postCard_(p, i));

  /* ---------- THE COMPOSER WAS HERE, AND IT WAS ALSO THE SCREEN TO THE LEFT § */
  /* THE FESTIVE CARDS ARE FIRST NOW. They were second, behind the ＋; with the ＋ gone they are the
     most perishable thing on the screen and belong at the front on their own merits. */
  festive.reverse().forEach(c => cards.unshift(c));
  /* ---------- SPOTLIGHT IS NOT HERE ANY MORE § */

  /* ---------- SIGNING IN IS NOT HERE EITHER § */

  /* THE CARDS THEMSELVES. This was `pages('posts', cards)` — the screen's own pager — and there is
     no Posts screen to page. `screen('stuff')` pages the whole funnel, and these are pages in it. */
  return cards;
}

/* The first page of the feed, for an admin. A card rather than a glyph: it can say what it does,
   which a ＋ in a corner cannot, and it is the width of a thumb rather than the width of a
   fingernail. */
/* THE CAMERA, ON THE PAGE. § */
let CAM_STREAM = null;
/* ---------- A QUESTION STILL OPEN, AND AN ANSWER THAT WAS NO § */
let CAM_ASKING = false;
let CAM_FAILED = null;
/* ---------- WHICH WAY IT IS POINTING, AND WHY IT IS A VARIABLE NOW § */
let CAM_FACE = 'environment';
/* THE ANSWER IS KEPT ON THE DEVICE (427): 'granted' or 'refused'. A refusal is never asked again by arriving — only `Try the camera again` asks. */
const CAM_KEY = 'family:cam';
function camMinded_() { try { return localStorage.getItem(CAM_KEY) || ''; } catch (e) { return ''; } }
function camMind_(v) { try { if (v) localStorage.setItem(CAM_KEY, v); else localStorage.removeItem(CAM_KEY); } catch (e) {} }
/* WHAT THE BROWSER ITSELF SAYS, where it will say: 'granted', 'denied', 'prompt' or '' (no answer within a second). */
async function camPermission_() {
  try {
    if (!navigator.permissions || !navigator.permissions.query) return '';
    const s = await Promise.race([navigator.permissions.query({ name: 'camera' }),
      new Promise(ok => setTimeout(() => ok(null), 1000))]);
    return (s && s.state) || '';
  } catch (e) { return ''; }
}
/* PARKED, NOT STOPPED (427): every new getUserMedia after a stop re-prompts on an iPhone, so off its page the stream stays and its track is switched off. */
function camPark_() {
  try { recStop_(); } catch (e) {}
  try { if (CAM_STREAM) CAM_STREAM.getTracks().forEach(t => { t.enabled = false; }); } catch (e) {}
  const v = $('cam-view'); if (v) { try { v.pause(); } catch (e) {} }
  camLive_(false);
}
function camWake_() {
  try { if (CAM_STREAM) CAM_STREAM.getTracks().forEach(t => { t.enabled = true; }); } catch (e) {}
}
/* IS A CAMERA ACTUALLY LOOKING — a parked stream is not. */
function camOn_() {
  try { return !!CAM_STREAM && CAM_STREAM.getTracks().some(t => t.enabled !== false); } catch (e) { return !!CAM_STREAM; }
}

function cameraCard() {
  if (POST_COMPOSING) return `<div class="card cam-card is-composing">${postComposeHtml_()}</div>`;
  return `<div class="card cam-card">
    <h3>Camera</h3>
    <div class="cam-stage" id="cam-stage">
      <video id="cam-view" playsinline muted autoplay></video>
      <canvas id="cam-still" hidden></canvas>
      ${/* "Starting" RATHER THAN "off", BECAUSE IT IS. § */
            ''}
      ${/* ---------- AND AT REST IT IS A VIEWFINDER THAT IS OFF, NOT A WAIT (docs/history/341) § */
            ''}
      <div class="cam-off" id="cam-off"></div>
    </div>
    ${/* ---------- FOUR CONTROLS, WHICH IS WHAT A CAMERA HAS § */
          ''}
    <div class="cam-bar">
      ${/* A LABEL, NOT A BUTTON, so the file input opens with no script at all — a `for` reaches a control the page is hiding, which is the one way to style a file § */
            ''}
      ${/* ROUND, LIKE THE SHUTTER (448): "I would rather it be a circular button". The word sits under the disc. */''}
      <label class="cam-round cam-pick" for="cam-pick" title="Choose photos or videos"><span class="cam-disc" aria-hidden="true">▦</span><span class="cam-word">Photos</span></label>
      ${/* SEVERAL, AND CLIPS AS WELL AS PHOTOGRAPHS — "tutors should be able to post more then one photo. not just one. and also videos." § */
            ''}
      <input type="file" id="cam-pick" data-do="cam-pick" accept="image/*,video/*" multiple hidden>
      ${/* THE WORDS ARE IN `aria-label` AND `title` RATHER THAN IN THE DISC. A shutter with the
            word "Photo" written across it is not a shutter, and a control with no name at all is
            one a screen reader cannot offer. */''}
      <button class="cam-shot" data-do="cam-shoot" id="cam-shoot"
              aria-label="Take a photo" title="Take a photo" disabled></button>
      <button class="cam-rec" data-do="cam-video" id="cam-video"
              aria-label="Record a video" title="Record a video" disabled></button>
      <button class="cam-round cam-write" data-do="new-post" aria-label="Write a post" title="Write a post"><span class="cam-disc" aria-hidden="true">✎</span><span class="cam-word">Write a post</span></button>
      <button class="cam-side" data-do="cam-flip" id="cam-flip"
              aria-label="Switch camera" title="Switch camera" hidden>Switch</button>
    </div>
    ${/* ---------- ONE LINE ABOUT IT, BECAUSE A POST WITH NOTHING SAID ABOUT IT IS A PHOTOGRAPH § */
          ''}
    ${/* ---------- WHAT IS ALREADY IN THIS POST § */
          ''}
    <div class="cam-tray" id="cam-tray" hidden></div>
    <input id="cam-cap" class="cam-cap" hidden
           placeholder="One line about it" autocomplete="off" maxlength="200">

    ${/* ---------- WHO IT GOES UP AS, WHICH IS THE SAME QUESTION THE COMPOSER ASKS § */
          ''}
    ${/* AN ADMIN'S QUESTION ONLY (413): anybody else's post is their own. */
          typeof isAdmin === 'function' && isAdmin() ? `<span class="btn-row cam-as" id="cam-as" data-as="brand" hidden>
      <button class="btn quiet on" data-do="as" data-for="cam-as" data-as="brand"
        >${esc(brand('name', '@family.'))} <span class="faint">business</span></button>
      <button class="btn quiet" data-do="as" data-for="cam-as" data-as="me"
        >me <span class="faint">personal</span></button>
    </span>` : ''}
    <div class="btn-row cam-row">
      <button class="btn quiet" data-do="cam-again" id="cam-again" hidden>Again</button>
      ${/* KEEP THIS ONE AND TAKE ANOTHER. The picture goes into the tray and the viewfinder comes
            back, so a post of five is five presses of the shutter and one of `Post it`. */''}
      <button class="btn quiet" data-do="cam-more" id="cam-more" hidden>Add another</button>
      <button class="btn" data-do="cam-post" id="cam-post" hidden>Post it</button>
      <button class="btn quiet" data-do="cam-save" id="cam-save" hidden>Save a copy</button>
      ${/* HIDDEN UNTIL SOMETHING FAILS. See the note at the top: this is the way back from a refused
            prompt, not a step on the way in. */''}
      <button class="btn" data-do="cam-on" id="cam-on" hidden>Try the camera again</button>
    </div>
    <p class="faint" id="cam-said"></p>
  </div>`;
}

/* WHY IT MIGHT NOT WORK, IN WORDS. Three refusals look identical from the outside — no camera, a
   refused prompt, and a page that is not on HTTPS — and only the first is worth giving up over. */
function camWhy_(err) {
  const n = String((err && err.name) || err || '');
  if (!window.isSecureContext) {
    return 'The camera only works on a secure page. Open the site over https.';
  }
  if (/NotAllowedError|SecurityError/i.test(n)) {
    return 'The camera was refused. Allow it for this site in the browser\u2019s address bar, then try again.';
  }
  if (/NotFoundError|OverconstrainedError/i.test(n)) return 'No camera on this device.';
  if (/NotReadableError/i.test(n)) return 'Something else is using the camera.';
  return 'The camera would not start: ' + n;
}

/* ---------- STARTING IT, FROM THE COLUMN ARRIVING OR FROM A RETRY § */
/** @param {boolean} [asked] a tap asked for it (`Try the camera again`, Switch): a remembered refusal does not stand in the way. */
async function camStart_(asked) {
  const v = $('cam-view');
  if (!v) return;
  /* A REBUILT CARD HAS AN EMPTY TRAY while `CAM_ITEMS` still holds the post being made — `repaint` replaces the markup and keeps the state — so the tray is drawn § */
  camHold_();

  /* A STREAM THE SYSTEM ENDED while it was parked (a phone call, a long time away) is let go, and asked for afresh below. */
  try { if (CAM_STREAM && CAM_STREAM.getTracks().some(t => t.readyState === 'ended')) camStop_(true); } catch (e) {}

  /* ---------- THE MARKUP CAN BE REPLACED UNDER A LIVE STREAM § */
  /* AND A PARKED ONE IS WOKEN, with no new ask (427) — unless a picture is being held, when it stays off until `Again`. */
  if (CAM_STREAM) {
    const held = $('cam-still');
    if (held && !held.hidden) return;
    camWake_();
    if (v.srcObject !== CAM_STREAM) v.srcObject = CAM_STREAM;
    try { await v.play(); } catch (e) {}
    $('cam-off')   && ($('cam-off').hidden = true);
    camLive_(true);
    camWays_();
    return;
  }

  /* A PICTURE ALREADY ON THE CARD IS NOT INTERRUPTED. Coming back to a shot you took, or a photo you
     picked, must not have the live preview reopen underneath it and throw the picture away. */
  const c = $('cam-still');
  if (c && !c.hidden) return;

  /* ONE QUESTION AT A TIME, AND A NO IS NOT ASKED AGAIN BEHIND YOUR BACK — see `CAM_ASKING` and `CAM_FAILED` where they are declared. § */
  if (CAM_ASKING) return;
  if (CAM_FAILED) { camFailed_(CAM_FAILED); return; }

  let said = $('cam-said'), retry = $('cam-on');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    /* A FACT, SO THE VIEWFINDER SAYS IT — and the loader comes out of it. § */
    const off = $('cam-off');
    if (off) { off.hidden = false; off.innerHTML = '<p class="sub">This browser has no camera support.</p>'; }
    if (said) said.textContent = '';
    if (retry) retry.hidden = true;          // nothing a retry could change
    camSettle_();
    return;
  }
  /* A NO KEPT ON THE DEVICE, OR ONE THE BROWSER REPORTS, IS NOT ASKED AGAIN BY ARRIVING (427). A 'granted' from the browser overrules a kept no. */
  if (!asked) {
    CAM_ASKING = true;
    const perm = await camPermission_();
    CAM_ASKING = false;
    if (perm === 'granted' && camMinded_() === 'refused') camMind_('');
    if (perm === 'denied' || (perm !== 'granted' && camMinded_() === 'refused')) {
      if (perm === 'denied') camMind_('refused');
      camFailed_({ name: 'NotAllowedError' });
      return;
    }
    if (CAM_ASKING || CAM_STREAM || !$('cam-view')) return;
  }
  said = $('cam-said'); retry = $('cam-on');
  if (retry) retry.disabled = true;
  /* ---------- A NEW ASK IS A WAIT AGAIN, AND IT LOOKS LIKE ONE § */
  const off = $('cam-off');
  if (off) { off.hidden = false; if (!off.querySelector('.loading')) off.innerHTML = loading_(); }
  if (said) said.textContent = '';
  CAM_ASKING = true;
  try {
    /* THE BACK CAMERA IF THERE IS ONE. `ideal` rather than `exact` so a laptop with one front
       camera gets that rather than an OverconstrainedError. */
    CAM_STREAM = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: CAM_FACE } }, audio: false });
  } catch (err) {
    CAM_ASKING = false;
    CAM_STREAM = null;
    /* REMEMBERED ONLY IF IT IS STILL THE PAGE IN FRONT. A refusal that lands after the page was left
       belongs to a visit that is over, and the next swipe up is a fresh ask. */
    CAM_FAILED = feedCamHere_() ? err : null;
    /* BUT A REFUSAL IS THE PERSON'S ANSWER WHENEVER IT LANDS, and it is kept on the device (427). */
    if (/NotAllowedError|SecurityError/i.test(String((err && err.name) || err || ''))) camMind_('refused');
    camFailed_(err);
    return;
  }
  CAM_ASKING = false;
  camMind_('granted');

  /* THE COLUMN MAY HAVE LEFT WHILE THE PROMPT WAS UP. § */
  if (!feedCamHere_()) { camStop_(true, true); camRest_(); return; }

  /* ---------- AND THE CARD MAY HAVE BEEN DRAWN AGAIN WHILE IT WAS UP § */
  const now = $('cam-view');
  if (!now) { camStop_(true); return; }
  said = $('cam-said'); retry = $('cam-on');
  now.srcObject = CAM_STREAM;
  try { await now.play(); } catch (e) {}
  $('cam-off') && ($('cam-off').hidden = true);
  if (retry) { retry.hidden = true; retry.disabled = false; }
  camLive_(true);
  if (said) said.textContent = '';
  /* ---------- AND ONLY NOW CAN ANYBODY ASK HOW MANY CAMERAS THERE ARE § */
  camWays_();
}

/* ---------- WHAT THE CARD SAYS WHEN THE CAMERA DID NOT START § */
function camFailed_(err) {
  const said = $('cam-said'), retry = $('cam-on'), off = $('cam-off');
  if (said) said.textContent = camWhy_(err);
  /* THE WAY BACK APPEARS ONLY NOW. Until something fails there is nothing to retry, and a button
     offering to start a camera that is already running is the thing this replaced. */
  if (retry) { retry.hidden = false; retry.disabled = false; }
  /* THE PANEL'S WHOLE CONTENT, NOT A LINE INSIDE IT: while it waits it holds the loader and no
     sentence, so there is no line to find and rewrite. */
  if (off) { off.hidden = false; off.innerHTML = '<p class="sub">The camera did not start.</p>'; }
  /* A 44px BUTTON THAT WAS NOT THERE A MOMENT AGO IS A CHANGE OF HEIGHT LIKE ANY OTHER. */
  camSettle_();
}

/* ---------- THE TWO SHUTTERS ARE ONE FACT: IS THERE A LIVE STREAM § */
function camLive_(on) {
  const shoot = $('cam-shoot'), rec = $('cam-video');
  if (shoot) shoot.disabled = !on;
  if (rec) {
    rec.hidden = typeof MediaRecorder !== 'function';
    rec.disabled = !on;
  }
}

/* IS THERE A SECOND CAMERA TO SWITCH TO. § */
async function camWays_() {
  const flip = $('cam-flip');
  if (!flip) return;
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    const list = await navigator.mediaDevices.enumerateDevices();
    flip.hidden = list.filter(d => d.kind === 'videoinput').length < 2;
  } catch (e) {}
}

/* ---------- TURNING IT ROUND § */
async function camFlip_() {
  const said = $('cam-said');
  if (CAM_REC && CAM_REC.state === 'recording') {
    if (said) said.textContent = 'Stop the recording first.';
    return;
  }
  CAM_FACE = CAM_FACE === 'environment' ? 'user' : 'environment';
  camStop_(true);
  await camStart_(true);
}

on('cam-flip', () => camFlip_());
/* THE ONE DOOR THAT ASKS AGAIN ON THE SPOT. § */
on('cam-on', () => { CAM_FAILED = null; camMind_(''); camStart_(true); });

/* ---------- A PICTURE OUT OF THE GALLERY § */
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="cam-pick"]');
  if (!el) return;
  const files = Array.from(el.files || []);
  el.value = '';
  if (!files.length) return;

  const said = $('cam-said'), c = $('cam-still'), v = $('cam-view');
  if (!c) return;

  /* ---------- ONE PHOTOGRAPH WITH NOTHING HELD IS THE CARD IT ALWAYS WAS § */
  const file = files[0];
  if (files.length > 1 || !/^image\//i.test(file.type || '') || CAM_ITEMS.length || !c.hidden) {
    camKeep_();
    if (said) said.textContent = 'Adding\u2026';
    Promise.all(files.map(camItemOf_)).then(got => {
      const kept = got.filter(Boolean);
      CAM_ITEMS = CAM_ITEMS.concat(kept);
      if (said) said.textContent = kept.length < got.length
        ? (got.length - kept.length) + ' could not be added \u2014 a clip over '
          + Math.round(CAM_VID_MAX / 1048576) + ' MB is too big to post from here.'
        : '';
      camHold_();
      camSettle_();
    });
    return;
  }

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    /* REVOKED THE MOMENT IT IS DRAWN. § */
    URL.revokeObjectURL(url);
    c.hidden = false;
    if (v) v.hidden = true;
    camLive_(false);
    camHold_();
    $('cam-off')   && ($('cam-off').hidden = true);
    /* SEE `cam-shoot`: `Again` already offers the camera, so this would be the second button for it. */
    $('cam-on')    && ($('cam-on').hidden = true);
    camSettle_();
    if (said) said.textContent = '';
    /* THE CAMERA IS LET GO, not left running behind the picture. § */
    /* Parked, not stopped (427): `Again` wakes it without a second prompt. */
    camStop_(true, true);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    if (said) said.textContent = 'That file would not open as a picture.';
  };
  img.src = url;
});

on('cam-shoot', () => {
  const v = $('cam-view'), c = $('cam-still');
  if (!v || !c || !v.videoWidth) return;
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
  c.hidden = false; v.hidden = true;
  /* THE SHUTTERS GREY WHILE A PICTURE IS BEING LOOKED AT. The stream is still running underneath —
     see `Again` — so they would work; what they would do is throw away the shot you just took. */
  camLive_(false);
  camHold_();
  /* `Try the camera again` GOES WHILE A PICTURE IS BEING HELD, and that is a duplicate removed rather than a control taken away. § */
  $('cam-on') && ($('cam-on').hidden = true);
  camSettle_();
});

/* THE COLUMN HAS TO BE MEASURED AGAIN WHEN THE CARD CHANGES SIZE. § */
/* ---------- THE POST BEING MADE, AS A LIST § */
let CAM_ITEMS = [];
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
/* THE PICTURE ON THE CARD GOES INTO THE TRAY, and the card goes back to the viewfinder. */
function camKeep_() {
  const c = $('cam-still');
  if (!c || c.hidden) return;
  try { CAM_ITEMS.push({ kind: 'image', data: c.toDataURL('image/jpeg', 0.85) }); } catch (e) { return; }
  c.hidden = true;
}
/* ---------- WHICH CONTROLS ARE SHOWING IS ONE FACT: WHAT IS BEING HELD § */
function camHold_() {
  const still = !!($('cam-still') && !$('cam-still').hidden);
  const n = CAM_ITEMS.length + (still ? 1 : 0);
  const show = (id, on) => { const el = $(id); if (el) el.hidden = !on; };
  show('cam-again', still); show('cam-save', still); show('cam-more', still);
  show('cam-post', n > 0); show('cam-cap', n > 0); show('cam-as', n > 0);
  const post = $('cam-post');
  if (post) post.textContent = n > 1 ? 'Post all ' + n : 'Post it';
  const tray = $('cam-tray');
  if (!tray) return;
  tray.hidden = !CAM_ITEMS.length;
  tray.innerHTML = CAM_ITEMS.length ? `<p class="faint cam-tray-say">${CAM_ITEMS.length} kept for
      this post \u2014 tap one to take it out</p><div class="cam-thumbs">${CAM_ITEMS.map((x, k) =>
    `<button class="cam-thumb" data-do="cam-drop" data-i="${k}"
       aria-label="Take this one out of the post" title="Take this one out">${x.kind === 'video'
      ? '<span class="cam-thumb-vid">\u25b6</span>'
      : `<img src="${esc(x.data)}" alt="" decoding="async">`}</button>`).join('')}</div>` : '';
}
on('cam-more', () => {
  camKeep_();
  camAgain_();
});
on('cam-drop', el => {
  const k = Number(el.dataset.i);
  if (k >= 0 && k < CAM_ITEMS.length) CAM_ITEMS.splice(k, 1);
  camHold_();
  camSettle_();
});

function camSettle_() {
  try { placeCells('y', true, 0, 'feed'); } catch (err) {}
}

/* `Again` NOW HAS TO PUT THE CAMERA BACK, not just uncover it. § */
/* ONE FUNCTION, TWO CALLERS. § */
function camAgain_() {
  const v = $('cam-view'), c = $('cam-still');
  if (c) c.hidden = true;
  if (v) v.hidden = false;
  /* EMPTIED AS WELL AS HIDDEN, and that is the half a `hidden` does not do. § */
  const cap = $('cam-cap'); if (cap && !CAM_ITEMS.length) cap.value = '';
  camHold_();
  camLive_(true);
  const said = $('cam-said'); if (said) said.textContent = '';
  camStart_();
  /* AND THE OTHER DIRECTION. § */
  camSettle_();
}
on('cam-again', camAgain_);

/* ---------- RECORDING, WHICH IS THE SAME SHAPE AS A PHOTOGRAPH § */
let CAM_REC = null;
let CAM_BITS = [];

function canRecord_() {
  return typeof MediaRecorder === 'function' && !!CAM_STREAM;
}

/* THE FIRST TYPE THE BROWSER ADMITS TO. § */
function recType_() {
  const want = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
  for (const t of want) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

function recStop_() {
  if (CAM_REC && CAM_REC.state !== 'inactive') { try { CAM_REC.stop(); } catch (e) {} }
}

on('cam-video', () => {
  const said = $('cam-said'), btn = $('cam-video');
  if (!canRecord_()) { if (said) said.textContent = 'This browser cannot record video.'; return; }

  if (CAM_REC && CAM_REC.state === 'recording') { recStop_(); return; }

  CAM_BITS = [];
  try {
    const type = recType_();
    CAM_REC = new MediaRecorder(CAM_STREAM, type ? { mimeType: type } : undefined);
  } catch (err) {
    if (said) said.textContent = 'Could not start recording: ' + String((err && err.message) || err);
    return;
  }

  CAM_REC.ondataavailable = e => { if (e.data && e.data.size) CAM_BITS.push(e.data); };
  CAM_REC.onstop = () => {
    camRecMark_(false);
    const blob = new Blob(CAM_BITS, { type: (CAM_REC && CAM_REC.mimeType) || 'video/webm' });
    CAM_BITS = [];
    if (!blob.size) { if (said) said.textContent = 'Nothing was recorded.'; return; }
    /* THE SAME WAY OUT AS A PHOTOGRAPH — see `cam-save`. § */
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'family-' + stamp_() + (/mp4/.test(blob.type) ? '.mp4' : '.webm');
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      if (said) said.textContent = 'Saved.';
      /* AND INTO THE POST, which is the half that makes a clip postable at all — "and also videos". § */
      camItemOf_(blob).then(it => {
        if (!it) {
          if (said) said.textContent = 'Saved. Too long to post from here \u2014 a clip over '
            + Math.round(CAM_VID_MAX / 1048576) + ' MB.';
          return;
        }
        CAM_ITEMS.push(it);
        if (said) said.textContent = 'Saved, and added to this post.';
        camHold_(); camSettle_();
      });
    } catch (err) {
      if (said) said.textContent = 'Could not save that: ' + String((err && err.message) || err);
    }
  };

  try { CAM_REC.start(); } catch (err) {
    if (said) said.textContent = 'Could not start recording: ' + String((err && err.message) || err);
    return;
  }
  camRecMark_(true);
  if (said) said.textContent = 'Recording. Press the square when you are done.';
});

/* ---------- THE DISC SAYS WHAT IT IS DOING, BECAUSE IT CANNOT SAY IT IN WORDS § */
function camRecMark_(on) {
  const btn = $('cam-video');
  if (!btn) return;
  btn.classList.toggle('is-rec', !!on);
  btn.setAttribute('aria-label', on ? 'Stop recording' : 'Record a video');
  btn.setAttribute('title', on ? 'Stop recording' : 'Record a video');
}

/* ONE PLACE THAT NAMES A FILE. `cam-save` built this inline and the recorder needed the same thing;
   two copies of a filename format is two things to keep in step, which is this repository's most
   repeated fault. */
function stamp_() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/* POSTING THE SHOT, AND THE ENDPOINT HAD BEEN THERE THE WHOLE TIME § */
on('cam-post', el => {
  const c = $('cam-still'), said = $('cam-said');
  if (!c) return;
  if (!USER) { if (said) said.textContent = 'Sign in first — a post needs somebody to be from.'; return; }
  /* ---------- EVERYTHING IN THE TRAY, THEN THE PICTURE ON THE CARD § */
  /* 0.85 RATHER THAN THE DOWNLOAD'S 0.92. § */
  const list = CAM_ITEMS.map(x => x.data);
  if (!c.hidden) {
    try { list.push(c.toDataURL('image/jpeg', 0.85)); }
    catch (err) { if (said) said.textContent = 'Could not read that photo: '
      + String((err && err.message) || err); return; }
  }
  if (!list.length) { if (said) said.textContent = 'Take a photo or pick one first.'; return; }
  /* ONE REQUEST CARRIES ALL OF IT, base64 inside a JSON body, and Apps Script refuses a body much
     past fifty megabytes — so the phone says so in words rather than letting the server fail in
     its own. */
  const size = list.reduce((n, x) => n + x.length, 0);
  if (size > CAM_POST_MAX) {
    if (said) said.textContent = 'That is too much to post at once (' + Math.round(size / 1048576)
      + ' MB). Take a clip or two out and post them separately.';
    return;
  }
  const data = list[0];

  /* `send_` RATHER THAN `api`, WHICH IS THE WHOLE OF `check-replies.js`. § */
  send_({
    action: 'addPost',
    name: USER.name, adminName: USER.name, personId: (USER && USER.personId) || '',
    data: data,
    media: list.slice(1),
    postAs: postAsOf_('cam-as'),
    caption: ($('cam-cap') || {}).value || '',
    body: '', location: '', poll: '',
  }, { button: el, busy: 'Posting…', where: 'cam-said' })
    .then(d => {
      toast(d && d.pending ? 'Posted — waiting for approval' : 'Posted'); CAM_ITEMS = []; camAgain_(); load();
    })
    /* `send_` HAS ALREADY WRITTEN THE REASON into `cam-said` and marked the error handled; this
       catch exists so the rejection does not reach the console as an unhandled one. */
    .catch(() => {});
});

on('cam-save', () => {
  const c = $('cam-still'), said = $('cam-said');
  if (!c) return;
  /* A DOWNLOAD, WHICH IS NOW THE SECOND WAY OUT RATHER THAN THE ONLY ONE — see `cam-post` above. */
  try {
    const a = document.createElement('a');
    a.href = c.toDataURL('image/jpeg', 0.92);
    a.download = 'family-' + stamp_() + '.jpg';
    document.body.appendChild(a); a.click(); a.remove();
    if (said) said.textContent = 'Saved to this device.';
  } catch (err) {
    if (said) said.textContent = 'Could not save that: ' + String((err && err.message) || err);
  }
});

/** Let the camera go, or park it (427). Called when the column leaves — see `go` in shell.js.
 *  @param {boolean} [keepShown] leave the card exactly as it looks.
 *  @param {boolean} [park] track off, stream kept. */
/* EVERY BUTTON BACK TO ITS STARTING STATE TOO, not just the stream. § */
function camStop_(keepShown, park) {
  /* ---------- A RECORDING IN PROGRESS IS STOPPED FIRST, AND THAT ORDER MATTERS § */
  try { recStop_(); } catch (e) {}
  const v = $('cam-view');
  if (park) camPark_();
  else {
    try { if (CAM_STREAM) CAM_STREAM.getTracks().forEach(t => t.stop()); } catch (e) {}
    CAM_STREAM = null;
    if (v) { try { v.srcObject = null; } catch (e) {} }
  }
  if (keepShown) return;
  /* LEAVING THE COLUMN FORGETS A REFUSAL, like swiping off the page does in `feedCamWatch_`. § */
  CAM_FAILED = null;

  camRecMark_(false);
  camLive_(false);
  const flip = $('cam-flip'); if (flip) flip.hidden = true;

  if (v) v.hidden = false;
  const c = $('cam-still'); if (c) c.hidden = true;
  /* BACK TO THE VIEWFINDER AT REST — the dark stage, no loader: nothing is being asked for now (`cameraCard`). */
  const off = $('cam-off');
  if (off) { off.hidden = false; off.innerHTML = ''; }
  $('cam-on')    && ($('cam-on').hidden = true, $('cam-on').disabled = false);
  /* LEAVING THE COLUMN LETS THE POST GO TOO, the tray with it — the same thing it has always done to
     a single held picture. */
  CAM_ITEMS = [];
  const cap = $('cam-cap'); if (cap) cap.value = '';
  camHold_();
}

/* ---------- REACTIONS § */
/* ONE PAINT'S WORTH OF "THE FACE YOU JUST PRESSED". § */
var REACT_POP_ = '';

/* ---------- A PRESS ON ONE POST REDRAWS THAT POST'S OWN PARTS, WHERE THEY STAND — NEVER THE COLUMN -- § */
function postRedraw_(id, parts) {
  const data = el => [].filter.call(el.attributes, x => x.name.indexOf('data-') === 0)
    .map(x => x.name + '=' + x.value).sort().join('\n');
  const a = document.activeElement;
  const held = a && a.dataset && a.dataset.do && a.closest
    ? { el: a, data: data(a), host: a.closest('section.screen') } : null;

  const p = (DATA.posts || []).find(x => x.id === id);
  const cards = p ? [].filter.call(document.querySelectorAll('article.post[data-post]'),
                                   x => x.dataset.post === id) : [];
  /* NO COPY OF THE POST ON THE PAGE, NOTHING TO REDRAW. § */
  if (!cards.length) return;
  const drawn = parts.map(([, draw]) => (p ? draw(p) || '' : ''));
  /* A CARD WITHOUT A PART THAT NOW DRAWS SOMETHING is the one case left for the whole repaint, and no press reaches it: § */
  const fits = cards.every(c => parts.every(([sel], i) => !!c.querySelector(sel) || !drawn[i]));
  if (!fits) repaint();
  else cards.forEach(c => parts.forEach(([sel], i) => {
    const old = c.querySelector(sel);
    if (!old) return;
    if (drawn[i]) old.outerHTML = drawn[i]; else old.remove();
  }));

  if (!held || !held.host || held.el.isConnected) return;
  const again = [].find.call(held.host.querySelectorAll('[data-do]'), b => data(b) === held.data);
  if (again) { try { again.focus({ preventScroll: true }); } catch (e) {} }
}
/* A REACTION CHANGES TWO PARTS: the row of faces, and the total on the time line. */
function reactRepaint_(id) {
  postRedraw_(id, [['.reacts', reacts], ['.post-when', postWhen_]]);
}

/* A COUNT IS AT MOST THREE CHARACTERS, so a pill never grows for its number: § */
function reactN_(n) {
  n = Number(n) || 0;
  return n < 1000 ? String(n) : Math.floor(n / 1000) + 'k';
}

function reacts(p) {
  const r = p.reactions;
  /* NO FACES, NO ROW — and the caller is told, rather than being handed an empty div. § */
  if (!r || !Array.isArray(r.emoji) || !r.emoji.length) return '';
  const counts = Array.isArray(r.counts) ? r.counts : [];
  /* `mine` RIGHT AFTER `react` IN THE CLASS LIST, because `check/ui.js` names a control by its first two classes and its `ACCEPTED_TAP` entry for these cells is § */
  return `<div class="reacts" role="group" aria-label="Reactions">${r.emoji.map((e, i) => {
    const n = Number(counts[i]) || 0;
    const t = n ? reactN_(n) : '';            // no zero counts: an empty pill, not a 0
    const mine = r.yours === e;
    const cls = 'react' + (mine ? ' mine' : '') + (t.length > 2 ? ' is-long' : '')
              + (REACT_POP_ && REACT_POP_ === p.id + ' ' + e ? ' is-pop' : '');
    return `<button class="${cls}" data-do="react" data-id="${esc(p.id)}" data-emoji="${esc(e)}"
               aria-pressed="${mine}"><span class="react-e">${esc(e)}</span>${
      t ? `<span class="react-n">${t}</span>` : ''}</button>`;
  }).join('')}</div>`;
}

/* THE TOTAL, and it is its own button. § */
function reactWho_(p) {
  const r = p && p.reactions;
  const n = r ? Number(r.total) || 0 : 0;
  if (!n) return '';                          // a 0 that opens an empty sheet is a promise broken
  return `<button class="text-action react-who" data-do="who-reacted" data-id="${esc(p.id)}"
             >${n} reaction${n === 1 ? '' : 's'}</button>`;
}
/* WHEN, AND HOW MANY. Time first, so a total appearing never moves it; 44px tall either way, so the first reaction on a post moves nothing below it — the tile § */
function postWhen_(p) {
  const at = p.at || p.when;
  const when = at ? `<span>${esc(ago(at))}</span>` : '';
  const who = reactWho_(p);
  const r = p.reactions;
  const faces = !!(r && Array.isArray(r.emoji) && r.emoji.length);   // `reacts()` draws a row
  if (!when && !who && !faces) return '';
  return `<p class="faint post-when">${when}${when && who ? '<span aria-hidden="true">·</span>' : ''}${who}</p>`;
}

/* WHO REACTED, AND WITH WHAT. § */
on('who-reacted', el => {
  const p = (DATA.posts || []).find(x => x.id === el.dataset.id);
  const r = p && p.reactions;
  if (!r || !r.total) return;
  const me = USER ? norm(USER.name) : '';
  const isMe = n => !!me && norm(n) === me;
  const by = r.by || [];
  const groups = (r.emoji || []).map((e, i) => ({
    emoji: e, at: i, mine: r.yours === e, n: Number((r.counts || [])[i]) || 0,
    /* YOU FIRST in your own group — the one name in the sheet you are looking for. */
    names: by.filter(x => x && x.emoji === e).map(x => x.name).sort((a, b) => isMe(b) - isMe(a)),
  })).filter(g => g.n)
    /* MOST FIRST, ties in the house order: "four people laughed" is the shape of the answer. */
    .sort((a, b) => b.n - a.n || a.at - b.at);

  sheetHere_(el);    // under the post's own tile row (453)
  openSheet(r.total + ' reaction' + (r.total === 1 ? '' : 's'),
    groups.map(g => `<section class="rx-group">
      <h3 class="rx-head"><span class="rx-pill${g.mine ? ' mine' : ''}"><span class="react-e">${
        esc(g.emoji)}</span><span class="react-n">${g.n}</span></span></h3>
      ${g.names.map(n => rowValue(mark(n) + (isMe(n) ? '<span class="rx-you">you</span>' : ''))).join('')}
      ${g.n > g.names.length
        /* Reacted by people whose names the site cannot resolve — somebody removed from the sheet,
           or a reaction from before they were added. The count is still true. */
        ? `<p class="faint">…and ${g.n - g.names.length} more</p>` : ''}
    </section>`).join(''));
});

on('react', el => {
  /* THE COLUMN THAT HOLDS THE SIGN-IN CARD. This said `goFor_('You')`, which filtered the Find
     screen to a group nothing is in — see the note where `goFor_` used to be. */
  if (!USER) { toast('Sign in to react'); go('account'); return; }
  const id = el.dataset.id, emoji = el.dataset.emoji;
  const post = (DATA.posts || []).find(x => x.id === id);
  if (!post || !post.reactions) return;

  const r = post.reactions;
  /* A counts array shorter than the emoji list would go NaN on the first press and stay NaN. The
     button can only exist if there are emoji, so this fills in whatever the payload left out. */
  if (!Array.isArray(r.counts) || r.counts.length !== r.emoji.length) {
    r.counts = r.emoji.map((_, i) => Number((r.counts || [])[i]) || 0);
  }
  if (typeof r.total !== 'number') r.total = r.counts.reduce((a, b) => a + b, 0);

  /* ---------- `by` IS THE FOURTH THING THAT MOVES, AND IT WAS THE ONE LEFT BEHIND § */
  if (r.emoji.indexOf(emoji) < 0) return;

  /* WHAT THE SERVER HOLDS, read before the move — unless a save of this post is already on its way,
     when `choiceSave_` keeps the one it was given at the start (see there). */
  const had = r.yours || '';
  /* Moved before the server answers: the same tap takes yours back, any other face moves it. */
  reactMove_(r, r.yours === emoji ? '' : emoji);
  /* THE FACE THAT JUST LANDED IS MARKED FOR THIS ONE PAINT — see `REACT_POP_`. § */
  REACT_POP_ = r.yours === emoji ? id + ' ' + emoji : '';   // added or moved: it lands; taken back: quiet
  reactRepaint_(id);
  REACT_POP_ = '';

  /* `personId` AS WELL AS `name`. § */
  const yours = () => { const q = (DATA.posts || []).find(x => x.id === id);
                        return q && q.reactions ? q.reactions.yours || '' : null; };
  choiceSave_('react ' + id, had, {
    mine: yours,
    send: (want, held) => send({ action: 'reactPost', name: USER.name,
      personId: (USER && USER.personId) || '', postId: id, emoji: want || held, want }),
    put: held => {
      const q = (DATA.posts || []).find(x => x.id === id);
      if (!q || !q.reactions) return;
      reactMove_(q.reactions, held);
      reactRepaint_(id);          // in place again, and whichever face holds the focus NOW keeps it
    },
    or: 'Could not save that',
  });
});

/* YOURS MOVES TO `to` ('' for none), AND ALL FOUR FIELDS MOVE WITH IT — `yours`, the two counts, the total and `by` § */
function reactMove_(r, to) {
  const at = e => r.emoji.indexOf(e);
  const me = USER ? norm(USER.name) : '';
  if (r.yours && at(r.yours) >= 0) { r.counts[at(r.yours)]--; r.total--; }
  /* MINE OUT OF THE LIST FIRST, whichever face it was on, and back in under the new one: changing your
     face is one move rather than two that have to agree. */
  if (me) r.by = (r.by || []).filter(x => !x || norm(x.name) !== me);
  r.yours = to && at(to) >= 0 ? to : '';
  if (r.yours) {
    r.counts[at(r.yours)]++; r.total++;
    if (me) r.by.push({ name: USER.name, emoji: r.yours });
  }
}

/* ---------- ONE CHOICE PER PERSON PER POST, SAVED ONE REQUEST AT A TIME, AND A REFUSAL PUTS BACK WHAT § */
const CHOICE_SAVE_ = {};
function choiceSave_(key, saved, o) {
  const s = CHOICE_SAVE_[key] || (CHOICE_SAVE_[key] = { saved: saved, busy: false });
  s.o = o;
  choicePump_(key);
}
function choicePump_(key) {
  const s = CHOICE_SAVE_[key];
  if (!s || s.busy) return;
  const want = s.o.mine();
  if (want === null || want === s.saved) { delete CHOICE_SAVE_[key]; return; }
  s.busy = true;
  Promise.resolve().then(() => s.o.send(want, s.saved))
    .then(() => { s.saved = want; },
          err => { s.o.put(s.saved); toast(String((err && err.message) || s.o.or)); })
    .then(() => { s.busy = false; choicePump_(key); });
}

/* ---------- A POLL § */
function poll(p) {
  const q = p.poll;
  const voted = !!q.yours;
  const most = Math.max(1, ...q.counts);

  return `<div class="poll">
    ${q.options.map((opt, i) => {
      const n = q.counts[i];
      const share = q.total ? Math.round(n / q.total * 100) : 0;
      const mine = q.yours === opt;
      return `<button class="poll-row${mine ? ' mine' : ''}${voted ? ' done' : ''}"
                 data-do="vote" data-id="${esc(p.id)}" data-choice="${esc(opt)}">
        ${voted
          /* The bar is drawn against the BIGGEST answer, not against the total — with four options
             the winner might be 30%, and a bar 30% across reads as nobody choosing it. */
          ? `<span class="poll-bar" style="width:${Math.round(n / most * 100)}%"></span>` : ''}
        <span class="poll-text">${mine ? '✓ ' : ''}${esc(opt)}</span>
        ${voted ? `<span class="poll-n">${share}%</span>` : ''}
      </button>`;
    }).join('')}
    <p class="faint poll-tot">${
      !USER ? 'Sign in to vote'
      : q.total === 0 ? 'No votes yet'
      : q.total + ' vote' + (q.total === 1 ? '' : 's')
        + (voted ? ' · tap yours again to take it back' : '')
    }</p>
  </div>`;
}

on('vote', el => {
  if (!USER) { toast('Sign in to vote'); return; }
  const id = el.dataset.id, choice = el.dataset.choice;
  const post = (DATA.posts || []).find(x => x.id === id);
  if (!post || !post.poll) return;

  const q = post.poll;
  if (q.options.indexOf(choice) < 0) return;
  const had = q.yours || '';             // what the server holds — see the same line in on('react')

  /* Moved on screen before the server answers, the same as a face — and the whole poll is redrawn rather than one row, because a vote changes every percentage on § */
  voteMove_(q, q.yours === choice ? '' : choice);
  postRedraw_(id, [['.poll', poll]]);

  /* ONE SAVE AT A TIME, CARRYING WHERE THE PERSON STOPPED, and a refusal puts back what the server holds — `choiceSave_`. § */
  choiceSave_('vote ' + id, had, {
    mine: () => { const x = (DATA.posts || []).find(y => y.id === id);
                  return x && x.poll ? x.poll.yours || '' : null; },
    send: (want, held) => api({ action: 'votePoll', name: USER.name,
      personId: (USER && USER.personId) || '', postId: id, choice: want || held, want })
      .then(d => { if (d && d.error) throw new Error(d.error); }),
    put: held => {
      const x = (DATA.posts || []).find(y => y.id === id);
      if (!x || !x.poll) return;
      voteMove_(x.poll, held);
      postRedraw_(id, [['.poll', poll]]);
    },
    or: 'Could not save that vote',
  });
});

/* YOUR VOTE MOVES TO `to` ('' for none), its count and the total with it — the tap and the undo both,
   for the reason `reactMove_` gives. */
function voteMove_(q, to) {
  const at = c => q.options.indexOf(c);
  if (q.yours && at(q.yours) >= 0) { q.counts[at(q.yours)]--; q.total--; }
  q.yours = to && at(to) >= 0 ? to : '';
  if (q.yours) { q.counts[at(q.yours)]++; q.total++; }
}

/* SHARING. A post needs an address of its own or there is nothing to send — so each one gets
   `?post=` and the app opens on it. Without that, sharing sends somebody to the top of a feed to
   hunt for a photograph they were shown. */
/* A PICTURE OF THE WHOLE POST (413) — `postPng_` below; the link alone when no canvas can be drawn. */
let POST_PNG_BUSY = false;
on('share', el => {
  const id = el.dataset.id;
  const post = (DATA.posts || []).find(p => p.id === id);
  const url = location.origin + location.pathname + '?post=' + encodeURIComponent(id);
  const text = post && post.caption ? post.caption : '@family.';
  if (post && !POST_PNG_BUSY && typeof document.createElement('canvas').getContext === 'function') {
    POST_PNG_BUSY = true;
    el.classList.add('is-busy');
    const done = () => { POST_PNG_BUSY = false; el.classList.remove('is-busy'); };
    postPng_(post, url)
      .then(cv => shareCanvasPng_(cv, 'family-post-' + String(id).replace(/[^\w-]/g, '') + '.png', text + ' ' + url))
      .then(done, () => { done(); postShareLink_(text, url); });
    return;
  }
  postShareLink_(text, url);
});
function postShareLink_(text, url) {
  if (navigator.share) {
    navigator.share({ title: '@family.', text, url }).catch(() => {});
    return;
  }
  /* No share sheet — a desktop, or an older phone. Copying is the honest fallback; a dialog
     saying "sharing is not supported" helps nobody. */
  navigator.clipboard?.writeText(url)
    .then(() => toast('Link copied'))
    .catch(() => toast(url));
}

/* Arriving on a shared post. Read once at start-up and cleared, so a refresh later does not drag
   somebody back to a photograph they have finished with. */
function openSharedPost() {
  let id = '';
  try { id = new URLSearchParams(location.search).get('post') || ''; } catch {}
  if (!id) return;

  /* TURN THE DIAL TO IT, rather than scrolling. § */
  postGo_(id);
}
/* THE FEED'S PAGE FOR ONE POST: the festive cards, then the camera, then the posts (`feedColumn_`) — the index alone landed short by the camera and the festive cards (413). */
function feedPageOf_(id) {
  const n = feedPosts().findIndex(p => String(p.id) === String(id));
  return n < 0 ? -1 : feedCamAt_() + 1 + n;
}
function postGo_(id) {
  const n = feedPageOf_(id);
  /* ---------- THE FEED IS A COLUMN AND THIS WAS ASKING THE FUNNEL FOR IT § */
  if (n < 0) { go('feed'); return; }
  PAGE.feed = n;                 // the screen is `feed`; `PAGE.posts` went nowhere — see PAGER
  go('feed');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelector(`[data-post="${CSS.escape(String(id))}"]`)?.classList.add('post-lit');
  }));
}
on('post-open', el => postGo_(el.dataset.id));

/* ---------- A TUTOR'S OWN ADDRESS (400): `?tutor=<handle>` opens their card, signed out or in ----------
   Prices follow the card's own rule (398): a child's phone has none to draw. */
const tutorLink_ = t => location.origin + location.pathname + '?tutor=' + encodeURIComponent(String((t && t.handle) || ''));
/* BY THE HANDLE ON THE TILE, so your own card's "Share my profile" works before the tutor list has you. */
/* A PICTURE OF THE CARD, NOT ONLY THE LINK (412) — the owner: "I meant it would share a PNG", to answer a parent on WhatsApp. */
let TUTOR_PNG_BUSY = false;
on('tutor-share', el => {
  const handle = String(el.dataset.handle || '');
  if (!handle || TUTOR_PNG_BUSY) return;
  const t = (DATA.tutors || []).find(x => x && String(x.handle || '') === handle)
    || (USER && USER.handle === handle ? tutorPngMe_() : { handle, title: '@' + handle });
  const url = tutorLink_({ handle });
  TUTOR_PNG_BUSY = true;
  toast('Making a picture of this profile…');
  tutorPng_(t, url)
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

/* ---------- THE PROFILE AS A 1080×1350 PNG (412), drawn on a canvas — no library, no HTML snapshot ---------- */
const TPNG_W = 1080, TPNG_H = 1350, TPNG_M = 84;

/* AN IMAGE, OR NULL: crossOrigin so a photo cannot taint the canvas, and a 1px trial draw in case it would. */
function tpngImg_(src) {
  return new Promise(ok => {
    if (!src) return ok(null);
    const img = new Image();
    let done = false;
    const end = v => { if (!done) { done = true; ok(v); } };
    setTimeout(() => end(null), 4000);
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 1;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0, 1, 1); g.getImageData(0, 0, 1, 1);
        end(img);
      } catch (e) { end(null); }
    };
    img.onerror = () => end(null);
    img.src = src;
  });
}
/* AN SVG FACE AS AN IMAGE SOURCE. The page's `#av-clip` is not inside it, so the canvas does the circle instead. */
const tpngSvg_ = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(String(s)
  .replace(/<svg(?![^>]*xmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"').replace(/\sclip-path="url\(#av-clip\)"/g, ''));

/* THE FACE BY `personFace_`'s ORDER: their photo, else their figure or one of the ten, else nothing (initials are drawn). */
function tpngFace_(t) {
  const v = String(t.image || '').trim(), kind = picKind_(v);
  if (kind === 'photo') return tpngImg_(pic(v)).then(img => img || tpngFigure_(t, 'avatar'));
  return tpngFigure_(t, kind);
}
function tpngFigure_(t, kind) {
  try {
    if (kind === 'basic') return tpngImg_(tpngSvg_(pfpArt_(pfpChoice_(t.image), 560)));
    if (typeof t.avatar === 'string' && t.avatar) return tpngImg_(tpngSvg_(avatarFor(t.handle || t.title, 560, t.avatar, { bust: true })));
  } catch (e) {}
  return Promise.resolve(null);
}

/* THE PALETTE AND THE FACE OFF THE STYLESHEET'S OWN TOKENS, so the picture changes when `:root` does. */
function tpngTokens_() {
  let cs = null;
  try { cs = getComputedStyle(document.documentElement); } catch (e) {}
  const v = (k, or) => { const s = cs ? String(cs.getPropertyValue(k) || '').trim() : ''; return s || or; };
  return { bg: v('--bg', '#000'), raised: v('--raised', '#0b0b0b'), line: v('--line', '#232323'), ink: v('--ink', '#e6e6e6'),
           dim: v('--dim', '#9a9a9a'), gold: v('--gold', '#ffffff'), good: v('--good', '#3ddc84'),
           paper: v('--paper', '#f4f1e8'), paperInk: v('--paper-ink', '#2b2620'),
           font: v('--font', 'ui-monospace, monospace') };
}

/* EVERYTHING THE PICTURE SAYS, as plain lines — the same readers the card uses, so the two never disagree. */
function tpngFacts_(t) {
  const groups = typeof teachGroups_ === 'function' ? teachGroups_(profList_(t.teachesSpec || t.teachesMain).concat(profList_(t.teaches))) : [];
  const teaches = groups.map(g => g.subject + (g.levels.length ? ' (' + g.levels.join(', ') + ')' : ''));
  const parts = Array.isArray(t.qualsParts) ? t.qualsParts.filter(p => p && String(p.subject || '').trim()) : [];
  const quals = parts.length
    ? parts.map(p => [p.subject, p.level, p.grade && 'grade ' + p.grade].map(x => String(x || '').trim()).filter(Boolean).join(' '))
    : profList_(t.quals);
  const venues = profList_(t.venues);
  return { teaches, quals, venues, facts: typeof profFacts_ === 'function' ? profFacts_(t) : [] };
}

/* A CHILD'S PHONE DRAWS NO PRICE (398) — the same rule as the card's `prof-rate`. */
const tpngRate_ = t => (Number(t.rate) > 0 && !childView_()) ? money(t.rate).replace(/\.00$/, '') + '/h' : '';

function tutorPng_(t, url) {
  const fontsReady = (document.fonts && document.fonts.load)
    ? Promise.race([Promise.all(['700 64px', '400 32px'].map(f => document.fonts.load(f + ' "Family Code"'))).catch(() => {}),
                    new Promise(r => setTimeout(r, 2500))])
    : Promise.resolve();
  const logoSrc = brand('logo_square', '') || brand('logo_circle', '');
  return Promise.all([tpngFace_(t), logoSrc ? tpngImg_(pic(logoSrc)) : null, fontsReady]).then(([face, logo]) => {
    const draw = (face, logo) => {
      const cv = document.createElement('canvas');
      cv.width = TPNG_W; cv.height = TPNG_H;
      const g = cv.getContext('2d');
      if (!g) throw new Error('no canvas');
      tpngDraw_(g, t, url, face, logo);
      return new Promise((ok, no) => cv.toBlob(b => b ? ok(b) : no(new Error('empty picture')), 'image/png'));
    };
    /* A PICTURE THAT TAINTED THE CANVAS ANYWAY: drawn again with the initials and no logo. */
    try { return draw(face, logo).catch(() => draw(null, null)); } catch (e) { if (face || logo) return draw(null, null); throw e; }
  });
}

/* ONE LINE AT `size`, SHRUNK TO `min` AND THEN CUT WITH AN ELLIPSIS, so nothing runs past the margin. */
function tpngFit_(g, text, maxW, size, min, weight, font) {
  let s = size;
  const set = () => { g.font = (weight || 400) + ' ' + s + 'px ' + font; };
  set();
  while (s > min && g.measureText(text).width > maxW) { s -= 2; set(); }
  let out = String(text);
  while (out.length > 1 && g.measureText(out).width > maxW) out = out.slice(0, -2) + '…';
  return { text: out, size: s };
}
/* WORDS (or a list's items, joined by `sep`) INTO AT MOST `lines` LINES OF `maxW`; a piece wider than a line is broken where it must be. */
function tpngWrap_(g, text, maxW, lines, sep) {
  const words = Array.isArray(text) ? text.map(String).filter(Boolean) : String(text).split(/\s+/).filter(Boolean), out = [];
  const join = sep == null ? ' ' : sep;
  let cur = '';
  const push = w => {
    /* A LIST'S ITEM IS CUT WITH AN ELLIPSIS, not split mid-word; a link is split. */
    if (Array.isArray(text) && join) { while (w.length > 1 && g.measureText(w).width > maxW) w = w.slice(0, -2) + '…'; return w; }
    while (g.measureText(w).width > maxW && w.length > 1) {
      let k = w.length - 1;
      while (k > 1 && g.measureText(w.slice(0, k)).width > maxW) k--;
      out.push(w.slice(0, k)); w = w.slice(k);
    }
    return w;
  };
  words.forEach(w => {
    const next = cur ? cur + join + w : w;
    if (g.measureText(next).width <= maxW) { cur = next; return; }
    if (cur) out.push(cur);
    cur = push(w);
  });
  if (cur) out.push(cur);
  if (out.length > lines) {
    const kept = out.slice(0, lines);
    let last = kept[lines - 1] + '…';
    while (last.length > 1 && g.measureText(last).width > maxW) last = last.slice(0, -2) + '…';
    kept[lines - 1] = last;
    return kept;
  }
  return out;
}

function tpngRound_(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r);
  g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r);
  g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r);
  g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r);
  g.closePath();
}

function tpngDraw_(g, t, url, face, logo) {
  const C = tpngTokens_(), F = C.font, W = TPNG_W, H = TPNG_H, M = TPNG_M, inner = W - 2 * M;
  const name = String(t.title || ('@' + (t.handle || ''))).trim();
  const text = (s, x, y, size, colour, weight, align) => {
    g.font = (weight || 400) + ' ' + size + 'px ' + F; g.fillStyle = colour; g.textAlign = align || 'left'; g.fillText(s, x, y);
  };
  g.textBaseline = 'alphabetic';
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  /* A WARM LIGHT BEHIND THE FACE, and a thin gold frame — the black and gold of the screen. */
  try {
    const glow = g.createRadialGradient(W / 2, 360, 40, W / 2, 360, 620);
    glow.addColorStop(0, C.gold + '2e'); glow.addColorStop(1, C.gold + '00');
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
  } catch (e) {}
  g.strokeStyle = C.gold; g.lineWidth = 3; g.globalAlpha = .55;
  tpngRound_(g, 30, 30, W - 60, H - 60, 28); g.stroke();
  g.globalAlpha = 1;

  /* THE BRAND, TOP LEFT; WHAT THIS IS, TOP RIGHT. */
  let bx = M;
  if (logo) {
    g.save(); g.beginPath(); g.arc(M + 32, 112, 32, 0, Math.PI * 2); g.clip();
    g.drawImage(logo, M, 80, 64, 64); g.restore();
    bx = M + 84;
  }
  const bn = tpngFit_(g, brand('name', '@family.'), 560, 44, 28, 700, F);
  text(bn.text, bx, 128, bn.size, C.gold, 700);
  text('TUTOR PROFILE', W - M, 124, 24, C.dim, 400, 'right');
  g.fillStyle = C.line; g.fillRect(M, 178, inner, 2);

  /* THE FACE: a photo, a figure, or their initial on gold. */
  const fx = W / 2, fy = 322, fr = 118;
  g.save(); g.beginPath(); g.arc(fx, fy, fr, 0, Math.PI * 2); g.closePath(); g.clip();
  if (face) {
    const iw = face.naturalWidth || face.width || 1, ih = face.naturalHeight || face.height || 1, s = Math.min(iw, ih);
    g.fillStyle = C.raised; g.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
    g.drawImage(face, (iw - s) / 2, (ih - s) / 2, s, s, fx - fr, fy - fr, fr * 2, fr * 2);
  } else {
    g.fillStyle = C.raised; g.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
    g.textBaseline = 'middle';
    text(initial(name), fx, fy + 6, 130, C.gold, 700, 'center');
    g.textBaseline = 'alphabetic';
  }
  g.restore();
  g.beginPath(); g.arc(fx, fy, fr + 5, 0, Math.PI * 2); g.strokeStyle = C.gold; g.lineWidth = 6; g.stroke();

  /* NAME AS THE SITE SHOWS IT (`title`, the server's public name); handle and role under it. */
  let y = 538;
  const nm = tpngFit_(g, name, inner, 68, 52, 700, F);
  if (g.measureText(name).width <= inner) text(nm.text, W / 2, y, nm.size, C.ink, 700, 'center');
  else {
    /* A LONG NAME GOES ONTO TWO LINES rather than losing its end. */
    g.font = '700 52px ' + F;
    tpngWrap_(g, name, inner, 2).forEach((l, i) => { if (i) y += 60; text(l, W / 2, y, 52, C.ink, 700, 'center'); });
  }
  const sub = [t.handle ? '@' + t.handle : '', [t.role || 'Tutor'].concat(profList_(t.titles)).join(' · ')].filter(Boolean).join(' · ');
  y += 52;
  const sb = tpngFit_(g, sub, inner, 30, 22, 400, F);
  text(sb.text, W / 2, y, sb.size, C.dim, 400, 'center');

  /* THE BADGES: the rate (never to a child), DBS, experience — pills centred, the last dropped if they do not fit. */
  const facts = tpngFacts_(t);
  const rate = tpngRate_(t);
  const pills = [];
  if (rate) pills.push({ s: rate, solid: true });
  if (t.dbs) pills.push({ s: '✓ DBS checked' });
  if (facts.facts[0]) pills.push({ s: facts.facts[0] });
  const pillW = p => { g.font = (p.solid ? 700 : 400) + ' 30px ' + F; return g.measureText(p.s).width + 52; };
  while (pills.length && pills.reduce((a, p) => a + pillW(p), 0) + 20 * (pills.length - 1) > inner) pills.pop();
  y += 36;
  if (pills.length) {
    let px = W / 2 - (pills.reduce((a, p) => a + pillW(p), 0) + 20 * (pills.length - 1)) / 2;
    pills.forEach(p => {
      const w = pillW(p);
      tpngRound_(g, px, y, w, 62, 31);
      if (p.solid) { g.fillStyle = C.gold; g.fill(); }
      else { g.strokeStyle = C.gold; g.lineWidth = 2; g.stroke(); }
      text(p.s, px + w / 2, y + 42, 30, p.solid ? C.bg : C.gold, p.solid ? 700 : 400, 'center');
      px += w + 20;
    });
    y += 62;
  }

  /* THEIR OWN LINE, as they wrote it — at most two lines, so what they teach keeps its room. */
  const bio = String(t.description || '').trim();
  if (bio) {
    g.font = '400 30px ' + F;
    const lines = tpngWrap_(g, bio, inner - 40, 2);
    y += 18;
    lines.forEach(l => { y += 42; text(l, W / 2, y, 30, C.ink, 400, 'center'); });
  }

  /* THE FOOTER IS FIXED; THE SECTIONS FILL WHAT IS LEFT ABOVE IT AND STOP — nothing runs under it. */
  const footTop = H - 276, LH = 40;
  const sections = [['TEACHES', facts.teaches, 2], ['TUTORS AT', facts.venues, 1], ['QUALIFICATIONS', facts.quals, 2]];
  y += 22;
  sections.forEach(([cap, list, max]) => {
    if (!list.length) return;
    g.font = '400 28px ' + F;
    /* AS MANY LINES AS FIT ABOVE THE FOOTER: caption 30 + 10, then a line every LH, the last baseline 26 clear of the rule. */
    const room = Math.min(max, Math.floor((footTop - 26 - (y + 40)) / LH));
    if (room < 1) return;
    const lines = tpngWrap_(g, list, inner, room, '  ·  ');
    y += 30; text(cap, M, y, 22, C.gold, 700);
    y += 10;
    lines.forEach(l => { y += LH; text(l, M, y, 28, C.ink, 400); });
    y += 18;
  });

  /* THE LINK, PRINTED, and a QR code to it on a paper square — a phone camera reads it off a screen. */
  g.fillStyle = C.line; g.fillRect(M, footTop, inner, 2);
  const qr = (() => { try { return qr_(url); } catch (e) { return null; } })();
  const qs = 196, qy = footTop + 34;
  let tx = M;
  if (qr) {
    g.fillStyle = C.paper; tpngRound_(g, M, qy, qs, qs, 10); g.fill();
    const cell = Math.floor((qs - 24) / qr.size), off = (qs - cell * qr.size) / 2;
    g.fillStyle = C.paperInk;
    for (let r = 0; r < qr.size; r++) for (let c = 0; c < qr.size; c++)
      if (qr.at(c, r)) g.fillRect(M + off + c * cell, qy + off + r * cell, cell, cell);
    tx = M + qs + 40;
  }
  const tw = W - M - tx;
  text('See the whole profile and book:', tx, qy + 40, 26, C.dim, 400);
  g.font = '700 30px ' + F;
  const shownUrl = String(url).replace(/^https?:\/\//, '');
  /* A LINK BREAKS AFTER / ? = & — never inside a word unless a word alone is wider than the line. */
  tpngWrap_(g, shownUrl.split(/(?<=[/?=&])/), tw, 3, '').forEach((l, i) => text(l, tx, qy + 92 + i * 42, 30, C.gold, 700));
}

/* ---------- A SMALL QR ENCODER (412): byte mode, level M, versions 1–10 — enough for a profile link ---------- */
const QR_ECC_M = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26], QR_BLOCKS_M = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
function qrMul_(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
  return z & 0xFF;
}
function qrEcc_(data, n) {
  const div = new Array(n).fill(0); div[n - 1] = 1;
  let root = 1;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) { div[j] = qrMul_(div[j], root); if (j + 1 < n) div[j] ^= div[j + 1]; }
    root = qrMul_(root, 2);
  }
  const out = new Array(n).fill(0);
  data.forEach(b => { const f = b ^ out.shift(); out.push(0); div.forEach((d, i) => { out[i] ^= qrMul_(d, f); }); });
  return out;
}
const qrRaw_ = v => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const a = Math.floor(v / 7) + 2; r -= (25 * a - 10) * a - 55; if (v >= 7) r -= 36; } return r; };
function qrAlign_(v, size) {
  if (v === 1) return [];
  const n = Math.floor(v / 7) + 2, step = Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2, out = [6];
  for (let p = size - 7; out.length < n; p -= step) out.splice(1, 0, p);
  return out;
}
function qr_(text) {
  const bytes = Array.from(new TextEncoder().encode(String(text)));
  let v = 0;
  for (let k = 1; k <= 10 && !v; k++) {
    const cap = Math.floor(qrRaw_(k) / 8) - QR_ECC_M[k - 1] * QR_BLOCKS_M[k - 1];
    if (4 + (k < 10 ? 8 : 16) + bytes.length * 8 <= cap * 8) v = k;
  }
  if (!v) return null;
  const size = v * 4 + 17, eccN = QR_ECC_M[v - 1], nb = QR_BLOCKS_M[v - 1];
  const raw = Math.floor(qrRaw_(v) / 8), cap = raw - eccN * nb;
  /* THE BITS: mode 0100, the count, the bytes, a terminator, then the two pad bytes in turn. */
  const bits = [];
  const put = (x, n) => { for (let i = n - 1; i >= 0; i--) bits.push((x >>> i) & 1); };
  put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
  put(0, Math.min(4, cap * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  for (let p = 0; data.length < cap; p ^= 1) data.push(p ? 0x11 : 0xEC);
  /* BLOCKS, EACH WITH ITS ERROR CORRECTION, INTERLEAVED. */
  const short = nb - raw % nb, shortLen = Math.floor(raw / nb), blocks = [];
  for (let i = 0, k = 0; i < nb; i++) {
    const d = data.slice(k, k + shortLen - eccN + (i < short ? 0 : 1));
    k += d.length;
    const e = qrEcc_(d, eccN);
    if (i < short) d.push(0);
    blocks.push(d.concat(e));
  }
  const words = [];
  for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== shortLen - eccN || j >= short) words.push(b[i]); });
  /* THE FIXED PATTERNS. */
  const m = [], fn = [];
  for (let i = 0; i < size; i++) { m.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
  const set = (x, y, dark) => { m[y][x] = !!dark; fn[y][x] = true; };
  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  [[3, 3], [size - 4, 3], [3, size - 4]].forEach(([cx, cy]) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
      if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
    }
  });
  const al = qrAlign_(v, size), last = al.length - 1;
  al.forEach((ax, i) => al.forEach((ay, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));
  const format = mask => {
    const d = (0 << 3) | mask;   // level M is 00
    let r = d;
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const b = ((d << 10) | r) ^ 0x5412, bit = i => (b >>> i) & 1;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, 1);
  };
  format(0);
  if (v >= 7) {
    let r = v;
    for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
    const b = (v << 12) | r;
    for (let i = 0; i < 18; i++) { const a = size - 11 + i % 3, c = Math.floor(i / 3), on = (b >>> i) & 1; set(a, c, on); set(c, a, on); }
  }
  /* THE DATA, IN THE ZIGZAG. */
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
      const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
      if (!fn[y][x] && i < words.length * 8) { m[y][x] = ((words[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
    }
  }
  /* THE MASK WITH THE LOWEST PENALTY, by the standard's four rules. */
  const rule = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, x => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
                (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
                (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];
  const flip = k => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && rule[k](x, y)) m[y][x] = !m[y][x]; };
  const penalty = () => {
    let p = 0, dark = 0;
    const lines = [];
    for (let a = 0; a < size; a++) {
      let row = '', col = '';
      for (let b = 0; b < size; b++) { row += m[a][b] ? 1 : 0; col += m[b][a] ? 1 : 0; if (m[a][b]) dark++; }
      lines.push(row, col);
    }
    lines.forEach(l => {
      (l.match(/0{5,}|1{5,}/g) || []).forEach(r => { p += r.length - 2; });
      const pad = '0000' + l + '0000';
      for (let k = pad.indexOf('1011101'); k >= 0; k = pad.indexOf('1011101', k + 1)) {
        if (pad.slice(k - 4, k) === '0000' || pad.slice(k + 7, k + 11) === '0000') p += 40;
      }
    });
    for (let y = 0; y + 1 < size; y++) for (let x = 0; x + 1 < size; x++) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3;
    }
    return p + (Math.ceil(Math.abs(dark * 20 - size * size * 10) / (size * size)) - 1) * 10;
  };
  let best = 0, bestP = Infinity;
  for (let k = 0; k < 8; k++) { flip(k); format(k); const p = penalty(); if (p < bestP) { bestP = p; best = k; } flip(k); }
  flip(best); format(best);
  return { size, version: v, mask: best, at: (x, y) => m[y][x] };
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
  openSheet(t.title, `<div class="tutor-link">${typeof findCard === 'function' ? findCard(item) : ''}
    ${tileRow_(tutorTiles_(item))}</div>`);
}

/* ---------- POSTING § */
/* `shrink` lived here — it resized a chosen photograph in the browser before uploading it, so a 4MB camera picture did not become a 4MB row. § */

/* ---------- THE SHEET'S BOXES ARE DRAFTS (data.js; docs/history/317) § */
/* THE POLL'S OPTIONS ARE ONE BOX EACH (448): "you shouldn't have to separate it with commas". At least two, at most six. */
const POLL_MIN = 2, POLL_MAX = 6;
const POST_DRAFT_FIELDS = ['cap', 'loc', 'body'].concat(Array.from({ length: POLL_MAX }, (_, k) => 'poll' + k));
const mayUpload_ = () => rankAtLeast_('client');
/* POST AS THE BUSINESS OR AS ME — an admin's question only; anybody else's post is theirs (413). */
function postAsRow_(id) {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  return `<label class="field"><span>post as</span>
    <span class="btn-row post-as" id="${id}" data-as="brand">
      <button class="btn quiet on" data-do="as" data-for="${id}" data-as="brand">${esc(brand('name', '@family.'))} <span class="faint">business</span></button>
      <button class="btn quiet" data-do="as" data-for="${id}" data-as="me">me <span class="faint">personal</span></button>
    </span></label>`;
}
const postAsOf_ = id => (typeof isAdmin === 'function' && isAdmin()) ? ((($(id) || {}).dataset || {}).as || 'brand') : 'me';
/* WRITING A POST CHANGES THE CAMERA CARD IN PLACE (448): "do not use pop-up menus on my site". Words only — no picture picker; Photos is beside the shutter. */
let POST_COMPOSING = false;
function pollBox_(k) {
  return `<label class="field poll-opt"><span>option ${k + 1}</span>
    <input id="post-poll-${k}" class="post-poll-in" maxlength="80" placeholder="${k ? 'Another answer' : 'An answer'}"${draftAttr_('post', 'poll' + k)} value="${esc(draftVal_('post', 'poll' + k))}"></label>`;
}
function postComposeHtml_() {
  let n = POLL_MIN;
  for (let k = 0; k < POLL_MAX; k++) if (draftVal_('post', 'poll' + k)) n = Math.max(n, k + 1);
  return `<div class="post-compose" id="post-compose">
  <h3>Write a post</h3>
  <label class="field"><span>caption</span>
    <input id="post-cap" placeholder="One line about it"${draftAttr_('post', 'cap')} value="${esc(draftVal_('post', 'cap'))}"></label>
  <label class="field"><span>where</span>
    <input id="post-loc" placeholder="Colliers Wood Library"${draftAttr_('post', 'loc')} value="${esc(draftVal_('post', 'loc'))}"></label>
  <label class="field"><span>more, if you want it</span>
    <textarea id="post-body" placeholder="Optional"${draftAttr_('post', 'body')}>${esc(draftVal_('post', 'body'))}</textarea></label>
  <p class="faint poll-head">A poll, if you want one</p>
  <div class="poll-opts" id="post-poll-opts" data-n="${n}">${Array.from({ length: n }, (_, k) => pollBox_(k)).join('')}</div>
  <button class="btn quiet" data-do="poll-more" id="poll-more"${n >= POLL_MAX ? ' hidden' : ''}>Add option</button>
  ${postAsRow_('post-as')}
  <div class="btn-row">
    <button class="btn quiet" data-do="post-cancel">Back</button>
    <button class="btn" data-do="post-send">Post it</button>
  </div>
  <p class="faint" id="post-said" style="margin:.6rem 0 0">${isAdmin() ? '' : 'An admin approves it before anybody else sees it.'}</p>
</div>`;
}
/* REDRAWS THE CARD ITSELF, so the camera's markup and the composer's are never on screen together. */
function camCardRedraw_() {
  const card = document.querySelector('#s-feed .cam-card') || document.querySelector('.cam-card');
  if (!card) return false;
  const box = document.createElement('div');
  box.innerHTML = camItem_(cameraCard());
  if (!box.firstElementChild) { card.remove(); return true; }
  card.replaceWith(box.firstElementChild);
  return true;
}
on('new-post', () => {
  if (!USER) return;
  if (!mayUpload_()) { toast('Posts are put up by a grown-up — ask your parent or tutor.'); return; }
  POST_COMPOSING = true;
  try { camStop_(true, true); } catch (e) {}
  camCardRedraw_();
  const cap = $('post-cap'); if (cap) { try { cap.focus({ preventScroll: true }); } catch (e) {} }
});
function postComposeClose_() {
  POST_COMPOSING = false;
  camCardRedraw_();
  try { feedCamWatch_(); } catch (e) {}
}
on('post-cancel', () => postComposeClose_());
on('poll-more', () => {
  const box = $('post-poll-opts');
  if (!box) return;
  const n = box.querySelectorAll('.post-poll-in').length;
  if (n >= POLL_MAX) return;
  box.insertAdjacentHTML('beforeend', pollBox_(n));
  const b = $('poll-more'); if (b && n + 1 >= POLL_MAX) b.hidden = true;
  const inp = $('post-poll-' + n); if (inp) { try { inp.focus({ preventScroll: true }); } catch (e) {} }
});
/* THE OPTIONS AS THE SHEET KEEPS THEM — one cell, comma-joined (doget splits it), so a comma typed inside an option is taken out. */
function pollOptsOf_() {
  return [].slice.call(document.querySelectorAll('#post-poll-opts .post-poll-in'))
    .map(x => String(x.value || '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
}
/* WHO THE POST IS FROM. § */
/* `data-for` NAMES THE ROW, because there are two of them now — the composer's and the camera's — and `$('post-as')` was the id of one. § */
on('as', el => {
  const row = $(el.dataset.for || 'post-as');
  if (!row) return;
  row.dataset.as = el.dataset.as || 'brand';
  row.querySelectorAll('[data-do="as"]').forEach(b => b.classList.toggle('on', b === el));
});

on('post-send', el => {
  const said = $('post-said');
  const v = id => String(($(id) || {}).value || '').trim();
  const opts = pollOptsOf_();
  if (opts.length === 1) { if (said) said.textContent = 'A poll needs at least two options.'; return; }
  if (!v('post-cap') && !v('post-body') && !opts.length) { if (said) said.textContent = 'Write something first.'; return; }
  /* SENT, SO NOT A DRAFT ON ANY OTHER PAGE (`draftSent_`, data.js). */
  POST_DRAFT_FIELDS.forEach(f => { try { draftSent_('post', f); } catch (e) {} });

  send_({ action: 'addPost',
    name: USER.name, adminName: USER.name, personId: (USER && USER.personId) || '',
    caption: v('post-cap'),
    location: v('post-loc'),
    poll: opts.join(', '),
    postAs: postAsOf_('post-as'),
    body: v('post-body') }, { button: el, busy: 'Posting…', where: 'post-said' })
    .then(d => {
      POST_DRAFT_FIELDS.forEach(f => { try { draftDrop_('post', f); } catch (e) {} });
      postComposeClose_();
      toast(d && d.pending ? 'Posted — waiting for approval' : 'Posted'); load();
    })
    .catch(() => { POST_DRAFT_FIELDS.forEach(f => { try { draftSentBack_('post', f); } catch (e) {} }); });
});
/* ---------- EDITING A POST § */
/* TWO SHEETS (413): its author's words while it waits; once it is up only an admin's pin and date — the words are final. */
on('post-edit', el => {
  const p = (DATA.posts || []).find(x => x.id === el.dataset.id);
  if (!p) return;
  const words = !!(p.waiting && p.mine);
  /* The options only, not the counts. What the site holds is what a phone was sent; the sheet's
     cell is the source, and the two are the same list while nobody has voted. */
  const opts = p.poll ? (p.poll.options || []).join(', ') : '';
  const voted = !!(p.poll && p.poll.total);

  sheetHere_(el, true);    // the post card becomes its editor (453)
  openSheet(words ? 'Edit post' : 'Pin or date', `
    ${p.image ? `<img src="${esc(pic(p.image))}" decoding="async" alt=""
         style="width:100%;margin-bottom:.7rem">` : ''}
    ${/* EACH BOX A DRAFT OF THE EDIT (data.js; 317), drawn from the saved post when there is none and
          dropped on Save — so a reload mid-edit reopens the sheet holding the edit, not the post. */''}
    ${words ? `<label class="field"><span>caption</span>
      <input id="pe-cap" value="${esc(draftVal_('post-edit', p.id + ':cap', p.caption || ''))}"${draftAttr_('post-edit', p.id + ':cap', p.caption || '')}></label>
    <label class="field"><span>more</span>
      <textarea id="pe-body"${draftAttr_('post-edit', p.id + ':body', p.body || '')}>${esc(draftVal_('post-edit', p.id + ':body', p.body || ''))}</textarea></label>
    <label class="field"><span>where</span>
      <input id="pe-loc" value="${esc(draftVal_('post-edit', p.id + ':loc', p.location || ''))}"${draftAttr_('post-edit', p.id + ':loc', p.location || '')}></label>
    ${/* A VOTE IS STORED AGAINST THE WORDS. § */
          ''}
    <label class="field"><span>poll</span>
      <input id="pe-poll" value="${esc(voted ? opts : draftVal_('post-edit', p.id + ':poll', opts))}" placeholder="Yes, No, Maybe" ${voted ? 'disabled' : draftAttr_('post-edit', p.id + ':poll', opts)}>
      ${voted ? `<span class="faint">${p.poll.total} vote${p.poll.total === 1 ? '' : 's'} cast —
        the options are fixed now.</span>` : ''}</label>` : `
    ${/* The date is editable because the feed is ORDERED by it — a post from the folder with the wrong timestamp sits in the wrong place for ever otherwise. */''}
    <label class="field"><span>posted on</span>
      <input id="pe-when" value="${esc(draftVal_('post-edit', p.id + ':when', p.when || ''))}" placeholder="DD/MM/YYYY HH:MM:SS"${draftAttr_('post-edit', p.id + ':when', p.when || '')}></label>
    <label class="check">
      <input type="checkbox" id="pe-pin" ${p.pinned ? 'checked' : ''}>
      <span class="box"></span>
      <span>Pin to the top<br><span class="faint">Above everything, whatever its date.</span></span>
    </label>`}

    <button class="btn" data-do="post-save" data-id="${esc(p.id)}">Save</button>
    <div class="btn-row" style="margin-top:.5rem">
      <button class="btn danger" data-do="post-delete" data-id="${esc(p.id)}" data-on="">Delete</button>
    </div>
    <p class="faint" id="pe-said" style="margin:.6rem 0 0">${words
      ? 'You can change it until it is approved. After that it stays as it is — you can still delete it.'
      : 'Once a post is up its words and pictures stay as they are. To change them, delete it and post again.'}</p>`);
});

/* LETTING ONE THROUGH, or turning it down. `data-on` carries which — an empty string is false to
   `TRUE_` on the backend, so one handler covers both and there is no second name to keep in step. */
on('post-approve', el => {
  const on = el.dataset.on === '1';
  /* TWO PRESSES, NOT A confirm() — the same pattern as `post-delete` below, and for the same reason: § */
  if (!on && !sure_(el, 'Turn it down?')) return;
  el.disabled = true;
  api({ action: 'approvePost', adminName: USER.name, name: USER.name, personId: USER.personId || '',
        id: el.dataset.id, on: on ? 'TRUE' : 'FALSE' })
    .then(d => {
      if (d && d.error) { el.disabled = false; toast(d.error); return; }
      toast(on ? 'It is up' : 'Not put up');
      load();
    })
    .catch(err => { el.disabled = false; toast(why_(err)); });
});

on('post-save', el => {
  const v = id => (($(id) || {}).value || '').trim();
  const has = id => !!$(id);
  const said = $('pe-said');
  const p = (DATA.posts || []).find(x => x.id === el.dataset.id);
  const voted = !!(p && p.poll && p.poll.total);

  /* A date typed into the wrong shape sorts the post to the bottom of the feed and gives no hint
     why. Checked here, where it can still be corrected. */
  if (v('pe-when') && !parseWhen(v('pe-when'))) {
    if (said) said.textContent = 'That date is not DD/MM/YYYY.';
    return;
  }

  /* ONLY WHAT THIS SHEET SHOWS — the server refuses a field this person may not change on this post (413). */
  const fields = {};
  if (has('pe-cap')) Object.assign(fields, { caption: v('pe-cap'), body: v('pe-body'), location: v('pe-loc') });
  /* Left out ENTIRELY rather than sent unchanged — the server tests whether the field was sent at
     all, and sending it back identical would still count as an attempt to change it. */
  if (has('pe-poll') && !voted) fields.poll = v('pe-poll');
  if (has('pe-pin')) Object.assign(fields, { posted_on: v('pe-when'), pinned: ($('pe-pin') || {}).checked });

  el.disabled = true;
  if (said) said.textContent = 'Saving…';
  api({ action: 'editPost',
    name: USER.name, adminName: USER.name, personId: USER.personId || '', id: el.dataset.id, fields })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      ['cap', 'body', 'loc', 'when', 'poll'].forEach(f => { try { draftDrop_('post-edit', el.dataset.id + ':' + f); } catch (e) {} });
      closeSheet(); toast('Saved'); load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not save that');
    });
});

/* TWO PRESSES, not a confirm() — `sure_` (receipt.js), the tile's and the sheet's alike. An author takes their own down; an admin any (413). */
on('post-delete', el => {
  const restoring = !!el.dataset.on;
  if (!restoring && !sure_(el, 'Really delete?')) return;
  const said = $('pe-said');
  el.disabled = true;
  if (said) said.textContent = restoring ? 'Restoring…' : 'Deleting…';

  api({ action: 'deletePost',
    name: USER.name, adminName: USER.name, personId: USER.personId || '', id: el.dataset.id, on: restoring })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      if (el.closest && el.closest('#sheet')) closeSheet();
      toast(restoring ? 'Back on the feed' : 'Deleted');
      load();
    })
    .catch(err => {
      el.disabled = false;
      delete el.dataset.sure; sureBack_(el);
      const why = String(err.message || 'Could not do that');
      if (said) said.textContent = why; else toast(why);
    });
});


/* THE COLUMNS These are not screens coming back unchanged. § */

/* ---------- MAKING ONE § */
/* ONE PAGE, AND IT IS THE CAMERA. § */
/* ---------- IT WAS A COLUMN, AND IT IS ONE PAGE OF THE FEED NOW § */
/* THE CAMERA IS AN ITEM (487): an admin's Delete and Note on it, and gone for everyone once deleted. */
const camItem_ = h => typeof itemMark_ === 'function' ? itemMark_('item:feed:camera', 'feed', h) : h;
function feedCamCard_() { return camItem_(feedCamCard0_()); }
function feedCamCard0_() {
  /* A CHILD HAS NO CAMERA HERE AND NO PICKER (413): nothing on this card could upload, and the server would refuse it. */
  if (USER && !mayUpload_()) {
    return `<div class="card cam-kid"><h3>Camera</h3>
      <p class="sub">Pictures go up from a grown-up's account — ask your parent or tutor to post one.</p></div>`;
  }
  return USER
    ? cameraCard()
    : `<div class="card"><h3>Camera</h3>
      <p class="sub">Sign in to post — your account is a few screens to the right.</p></div>`;
}

/* ---------- READING THEM § */
/* ---------- THE CAMERA IS THE PAGE ABOVE THE NEWEST POST § */
function feedCamAt_() {
  /* `postsBlocks` PUTS THE FESTIVE CARDS FIRST and nothing else in front of the posts — and when there is nothing at all it returns one "Nothing posted yet" card § */
  return LOADED ? (DATA.festive || []).length : 0;
}
function feedColumn_() {
  const blocks = postsBlocks();
  if (!LOADED || !Array.isArray(blocks)) return blocks;
  const at = feedCamAt_();
  return blocks.slice(0, at).concat([feedCamCard_()].filter(Boolean), blocks.slice(at));
}
screen('feed', () => pages('feed', feedColumn_()));

/* IS THE CAMERA ON THE SCREEN, which is the only moment it should be running. */
/* ---------- AND NOT BEFORE THE FEED HAS BEEN OPENED AT ITS FRONT DOOR § */
function feedCamHere_() {
  return !POST_COMPOSING && typeof AT !== 'undefined' && AT === 'feed' && LOADED
    && typeof PAGE_OPENED !== 'undefined' && !!PAGE_OPENED.feed
    && (PAGE.feed || 0) === feedCamAt_();
}
/* START IT ON ITS PAGE AND LET IT GO ON EVERY OTHER. § */
function feedCamWatch_() {
  if (feedCamHere_()) { camStart_(); return; }
  /* OFF ITS PAGE, A REFUSAL IS FORGOTTEN. Coming back up to it is a swipe, and a swipe is somebody
     asking for the camera — see `CAM_FAILED`. */
  CAM_FAILED = null;
  if (CAM_STREAM || (CAM_REC && CAM_REC.state === 'recording')) camStop_(true, true);
  camRest_();
}
/* LET GO FOR REAL when the page goes, or has been out of sight a minute; parked at once when it is hidden (427). */
let CAM_AWAY = 0;
document.addEventListener('visibilitychange', () => {
  clearTimeout(CAM_AWAY); CAM_AWAY = 0;
  if (document.visibilityState === 'hidden') {
    if (!CAM_STREAM) return;
    camStop_(true, true);
    CAM_AWAY = setTimeout(() => { CAM_AWAY = 0; if (document.visibilityState === 'hidden') camStop_(true); }, 60000);
    return;
  }
  try { if (feedCamHere_()) camStart_(); } catch (e) {}
});
window.addEventListener('pagehide', () => { try { if (CAM_STREAM) camStop_(true); } catch (e) {} });
/* ---------- OFF ITS PAGE THE VIEWFINDER IS AT REST, WHATEVER THE ASK IS DOING (docs/history/341) § */
function camRest_() {
  const off = $('cam-off');
  if (off && off.querySelector(':scope > .loading')) off.innerHTML = '';
}


/* REELS AND MESSAGES — the last two columns on the layout sheet § */

/* ---------- REELS § */
/* ---------- AND IT WAS EMPTY, FOR EVERYBODY, SINCE THE DAY IT WAS WRITTEN § */
screen('reel', () => {
  /* WAITING, AS EVERY COLUMN WAITS — `loading_()` on a page of its own. */
  if (!LOADED) return `<section class="page"><div class="pane">${loading_()}</div></section>`;
  /* ---------- CLIPS ONLY, AND THE FACTS ARE NOT A FALLBACK § */
  /* ONE SNAPSHOT PER DRAW, and everything below reads it. § */
  const facts = REEL_CLIPS = clipsNow_();
  /* THE PAGES BEFORE THE FIRST REEL (414): the column's widgets, then an admin's "+" (404). Every reel's page is its index plus `REEL_LEAD`. */
  const lead = reelLead_();
  reelLeadSet_(lead.length);
  if (!facts.length) {
    /* NO CLIPS: the one empty state (`emptyCard_`, shell.js) — the title alone. */
    return pages('reel', lead.concat([emptyCard_('Reels')]));
  }
  /* ---------- ONE WIDGET PER REEL, WHICH IS WHAT EVERY OTHER COLUMN IN THE APP IS § */
  /* ---------- A REDRAW MUST NOT LOSE THE PAGE YOU ARE ON § */
  REEL_SHOWN = 0;
  return pages('reel', lead.concat(reelCards_(Math.max(REEL_FIRST, (PAGE.reel || 0) + 1 + REEL_AHEAD - REEL_LEAD))));
});

/* WHAT LEADS THE COLUMN (414): its widgets (kind `reel`, map.js) and an admin's "+", in that order, so the "+" sits next to the reels it adds to and the first reel is where the column opens (`PAGE_HOME.reel`). */
function reelLead_() {
  const wgts = typeof widgetColumn_ === 'function' ? widgetColumn_('reel') : [];
  const add = typeof mediaHtml_ === 'function' ? mediaHtml_('reel') : '';
  return wgts.concat(add ? [add] : []);
}
/* A LEAD THAT GREW OR SHRANK (an admin signing in) MOVES THE PAGE WITH IT, so the reel in front stays in front. */
function reelLeadSet_(n) {
  if (n !== REEL_LEAD) PAGE.reel = Math.max(0, (PAGE.reel || 0) + n - REEL_LEAD);
  REEL_LEAD = n;
}

/* ---------- IT GOES DOWN FOR EVER, AND THE DECK IT DRAWS FROM ALREADY DID § */
/* ---------- SEVEN, SIX AND SIX SINCE 11 OCT (docs/history/341) § */
const REEL_FIRST = 7;      // on the first paint. One is on screen; the rest are the next flicks.
const REEL_MORE  = 6;      // appended at a time when fewer than REEL_AHEAD are ahead.
const REEL_AHEAD = 6;      // how far ahead of you the column is kept — the top-up and the redraw
                           // read the same number, or one of them builds a page short of the other.
const REEL_MAX   = 60;     // the ceiling, in slides. See above.
let REEL_SHOWN = 0;
/* PAGES BEFORE THE FIRST REEL: the lead widgets plus an admin's "+" (404, 414). `data-reel` is the page. */
let REEL_LEAD = 0;
/* WHICH REEL SOMEBODY HAS DELIBERATELY STOPPED, by index, or −1 for none. § */
let REEL_HELD = -1;

/* ONE READER FOR "WHICH CLIPS", and this function was a second one. § */
/* THE LIST THIS COLUMN WAS DRAWN FROM, held for as long as the column is. § */
let REEL_CLIPS = null;
function reelClips_() {
  if (!REEL_CLIPS) REEL_CLIPS = (typeof clipsNow_ === 'function' ? clipsNow_() : []);
  return REEL_CLIPS;
}

function reelItem_(n) {
  const clips = reelClips_();
  if (!clips.length || n >= REEL_MAX) return null;
  return clips[n % clips.length];
}

/* ONE CARD PER REEL, AND THE CARD IS THE WIDGET. § */
function reelCards_(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const it = reelItem_(REEL_SHOWN);
    if (!it) break;
    /* THE WHOLE SLIDE IS THE PAUSE, which is what a video is everywhere else. § */
    out.push(`<div class="card is-widget"><div class="widget-slot">
      <div class="reel${REEL_SHOWN + REEL_LEAD === REEL_HELD ? ' is-held' : ''}"
           data-reel="${REEL_SHOWN + REEL_LEAD}" data-do="reel-tap">${feedSlide(it)}` +
      /* HOW OLD YOU HAVE TO BE (406), when it is not everyone. */
      `${typeof mediaAgeSay_ === 'function' && mediaAgeSay_(it.age) ? `<span class="media-age-badge is-reel" aria-label="for ages ${esc(mediaAgeSay_(it.age))}">${esc(mediaAgeSay_(it.age))}</span>` : ''}` +
      `${reelSoundTile_(false)}</div>
    </div></div>`);
    REEL_SHOWN++;
  }
  return out;
}

/* HOW MANY PAGES THIS COLUMN HAS, asked by `PAGER.reel` in shell.js — and it is the same counter the markup is built from, so the pager and the screen cannot § */
function reelPages_() {
  const n = reelClips_().length ? REEL_SHOWN + REEL_LEAD : REEL_LEAD + 1;
  return new Array(Math.max(1, n)).fill('');
}

/* ---------- THE PAGER SAYS WHICH ONE IS BEING WATCHED, AND IT IS THE ONLY THING THAT DOES § */
/* CALLED BY `startScreen_`, WHICH IS THE LIST OF WHAT A SCREEN HAS RUNNING — and it was booked on its own from `go` until it was measured. § */
function reelsWatch_() {
  reelTurn_(PAGE.reel || 0);
}

function reelTurn_(n) {
  const host = $('s-reel');
  if (!host) return;

  /* MORE REELS BEFORE THE BOTTOM RATHER THAN AT IT. § */
  /* AND NOT WHILE THE COLUMN IS STILL WAITING. § */
  if (LOADED && n - REEL_LEAD >= REEL_SHOWN - REEL_AHEAD) reelMore_(host);

  /* THE ONE BEING WATCHED PLAYS AND THE REST DO NOT — and the rest are two pixels off the screen rather than gone, because the column peeks above and below. § */
  host.querySelectorAll('.reel').forEach(el => {
    const at = Number(el.dataset.reel);
    const here = at === n && REEL_HELD !== n;
    const v = el.querySelector('video.feed-vid');
    if (v) {
      if (here) reelPlay_(v);
      else { try { v.pause(); } catch {} }
    }
    /* A SHORT OBEYS THE SAME RULE, and one more: § */
    const yt = el.querySelector('.feed-yt');
    if (yt) {
      if (here) reelYtPlay_(yt);
      else if (Math.abs(at - n) > 1) reelYtDrop_(yt);
      else reelYtPause_(yt);
    }
  });

  /* AND THE NEIGHBOURS' FOCUS IS READ AGAIN, NOW THAT THEY ARE STILL. § */
  if (typeof softDim_ === 'function' && !SOFT_DRAG) {
    host.querySelectorAll('.page.soft').forEach(p => p.classList.toggle('soft-dim', softDim_(p)));
  }
}

/* ---------- AND IT STOPS WHEN YOU LEAVE THE COLUMN § */
function reelsStop_() { clipsStop_($('s-reel')); }

/* ONE FUNCTION, BECAUSE THERE ARE TWO SURFACES THAT PLAY A CLIP and they are the two this feature has always had: § */
function clipsStop_(root) {
  if (!root) return;
  root.querySelectorAll('video.feed-vid').forEach(v => { try { v.pause(); } catch {} });
  /* A SHORT IS TAKEN DOWN RATHER THAN PAUSED when its column is left — `reelYtDrop_` says why. It is
     built again, from its poster, the moment `reelsWatch_` finds it on screen on the way back. */
  root.querySelectorAll('.feed-yt').forEach(reelYtDrop_);
}

/* ONE MORE LAP, AS PAGES. § */
/* ---------- AND THE COLUMN IS NO LONGER WHAT IT WAS DRAWN WITH (`DRAWN = null`) § */
function reelMore_(host, n) {
  const cards = reelCards_(n || REEL_MORE);
  if (!cards.length) return;
  host.insertAdjacentHTML('beforeend', pages('reel', cards));
  host.DRAWN = null;
  paintPager('reel', true);
}
/* IN THE RELEASE: ONE SLIDE, when fewer than `REEL_AHEAD` are left past the page being turned to — markup, amortised as Find's window is, so a run of flicks § */
function reelAhead_(n) {
  const host = $('s-reel');
  if (!host || !LOADED || n - REEL_LEAD < REEL_SHOWN - REEL_AHEAD) return;
  const cards = reelCards_(1);
  if (cards.length) { host.insertAdjacentHTML('beforeend', pages('reel', cards)); host.DRAWN = null; }
}
/* AND IN THE QUIET, UP TO TWELVE AHEAD — the builder's `reels` job. */
function reelJobs_() {
  if (!LOADED || STALE.reel || !$('s-reel') || !$('s-reel').firstElementChild) return [];
  const want = (PAGE.reel || 0) - REEL_LEAD + 1 + REEL_AHEAD + REEL_MORE;
  if (REEL_SHOWN >= want || REEL_SHOWN >= REEL_MAX || !reelItem_(REEL_SHOWN)) return [];
  return [{ key: 'reels', kind: 'reels', d: aheadDist_('reel', null), run: () => reelMore_($('s-reel'), want - REEL_SHOWN) }];
}
if (typeof AHEAD_KINDS !== 'undefined') AHEAD_KINDS.push(reelJobs_);

/* ---------- A CLIP, AND NOTHING BEHIND IT IF IT WILL NOT PLAY § */
function reelPlay_(v) {
  if (!v || v.dataset.dead) return;
  if (!v.getAttribute('src')) {
    const src = clipSrc_(v.dataset.clip);
    if (!src) { v.dataset.dead = '1'; return; }
    /* THE SCRIM AND THE WHITE TEXT ARRIVE WITH THE FIRST FRAME, for the reason the photograph slide
       waits for `img.onload`: until then the slide is its own gradient and its subject's initial. */
    v.addEventListener('loadeddata', () => {
      const art = v.closest('.feed-art');
      if (art) art.classList.add('has-photo');
    }, { once: true });
    v.addEventListener('error', () => { v.dataset.dead = '1'; }, { once: true });
    v.src = src;
  }
  /* A BLOCKED AUTOPLAY IS A REJECTED PROMISE AND NOT AN ERROR. § */
  const p = v.play();
  if (p && p.catch) p.catch(() => {});
}
/* A YOUTUBE SHORT, DRIVEN THE WAY THE `<video>` ABOVE IS § */
const YT_HOST = 'https://www.youtube-nocookie.com';
/* HOW LONG A PLAYER HAS TO PLAY ITS FIRST FRAME before the slide stops waiting and offers the door. § */
const YT_GIVE_UP = 20000;
/* HOW LONG THE PLAYER STAYS SHOWING ACROSS A LAP — see `reelYtHeard_`. A restart that has not said
   PLAYING again by then is not a lap any more, and whatever YouTube is drawing goes back under the
   poster. */
const YT_LAP = 2500;
let YT_SEQ = 0;
/* PER SLIDE, ITS TWO CLOCKS AND THE LAST STATE ITS PLAYER REPORTED. A WeakMap, so a slide a repaint
   threw away takes its entry with it, and nothing about a clock is written into the markup. */
const YT_BOX = new WeakMap();
/* BOTH CLOCKS STOPPED — when the player is taken down, or given up on. A clock left running over a
   player that is gone would fire into the NEXT one built on the same slide and decide about it. */
function ytClocksOff_(box) {
  const o = ytBox_(box);
  clearTimeout(o.clock); clearTimeout(o.lap);
  o.clock = o.lap = 0;
  o.st = null;
}
function ytBox_(box) {
  let o = YT_BOX.get(box);
  if (!o) YT_BOX.set(box, o = { clock: 0, lap: 0, st: null });
  return o;
}

/* THE ADDRESS, and every word in it is doing something. § */
function reelYtSrc_(id) {
  const o = /^https?:$/.test(location.protocol) ? '&origin=' + encodeURIComponent(location.origin) : '';
  const v = encodeURIComponent(id);
  return YT_HOST + '/embed/' + v + '?enablejsapi=1&mute=1&autoplay=1&loop=1&playlist=' + v
    + '&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3' + o;
}

/* ONE ORDER TO ONE PLAYER. § */
function reelYtSay_(box, func, args) {
  const f = box && box.querySelector('iframe.feed-yt-frame');
  if (!f || !f.contentWindow) return;
  try {
    f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [],
                                                 id: f.dataset.n, channel: 'widget' }), YT_HOST);
  } catch (e) {}
}

/* PLAY: build the player the first time this slide is the one on screen, and ask it to play after. § */
function reelYtPlay_(box) {
  if (!box || box.dataset.dead) return;
  box.dataset.want = 'play';
  if (box.querySelector('iframe.feed-yt-frame')) reelYtSay_(box, 'playVideo');
  else if (!reelYtBuild_(box)) return;
  reelYtClock_(box);
}

/* THE PLAYER ITSELF, put in the slide under the veil. False when the slide names no video. */
function reelYtBuild_(box) {
  const id = box.dataset.yt;
  if (!id) return false;
  const f = document.createElement('iframe');
  f.className = 'feed-yt-frame';
  f.dataset.n = String(++YT_SEQ);
  f.title = 'YouTube video';
  /* `autoplay` IN `allow` IS WHAT LETS THE SOUND TILE WORK: § */
  f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
  f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  f.setAttribute('tabindex', '-1');
  f.addEventListener('load', () => reelYtHello_(f));
  f.src = reelYtSrc_(id);
  box.insertBefore(f, box.firstChild);
  return true;
}

/* ---------- THE GIVE-UP CLOCK, WOUND BY EVERY ASK TO PLAY § */
function reelYtClock_(box) {
  const f = box.querySelector('iframe.feed-yt-frame');
  const o = ytBox_(box);
  if (!f || f.dataset.played || o.clock) return;
  o.clock = setTimeout(() => {
    o.clock = 0;
    if (!f.isConnected || f.dataset.played) return;
    if (!f.dataset.heard || box.dataset.want === 'play') reelYtDead_(box);
  }, YT_GIVE_UP);
}

/* PAUSE, and the poster goes back over it at once rather than when YouTube confirms — the frame
   between is YouTube's pause screen. */
function reelYtPause_(box) {
  if (!box) return;
  box.dataset.want = 'pause';
  box.classList.remove('is-live');
  reelYtSay_(box, 'pauseVideo');
}

/* ---------- TAKEN DOWN, NOT PAUSED, ONCE IT IS OUT OF REACH § */
function reelYtDrop_(box) {
  if (!box) return;
  box.dataset.want = 'pause';
  box.classList.remove('is-live');
  ytClocksOff_(box);
  const f = box.querySelector('iframe.feed-yt-frame');
  if (f) f.remove();
  if (box.dataset.sound) {
    delete box.dataset.sound;
    reelSoundSay_(box.closest('.reel') && box.closest('.reel').querySelector('.reel-sound'), false);
  }
}

/* ---------- WHEN IT CANNOT PLAY, IT STAYS A PICTURE WITH A WAY OUT § */
function reelYtDead_(box) {
  if (!box || box.dataset.dead) return;
  box.dataset.dead = '1';
  box.classList.remove('is-live');
  ytClocksOff_(box);
  const f = box.querySelector('iframe.feed-yt-frame');
  if (f) f.remove();
  const art = box.closest('.feed-art');
  if (art) art.classList.add('is-dead');
  const reel = box.closest('.reel');
  if (reel) {
    reel.classList.remove('is-held');
    if (REEL_HELD === Number(reel.dataset.reel)) REEL_HELD = -1;
  }
}

/* HELLO, UNTIL IT ANSWERS. § */
function reelYtHello_(f) {
  let n = 0;
  const say = () => {
    if (!f.isConnected || f.dataset.heard || ++n > YT_GIVE_UP / 400) return;
    try {
      const w = f.contentWindow;
      const id = f.dataset.n;
      w.postMessage(JSON.stringify({ event: 'listening', id: id, channel: 'widget' }), YT_HOST);
      ['onReady', 'onStateChange', 'onError'].forEach(ev =>
        w.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: [ev],
                                       id: id, channel: 'widget' }), YT_HOST));
    } catch (e) {}
    setTimeout(say, 400);
  };
  say();
}

/* WHAT THE PLAYER SAYS. § */
function reelYtHeard_(f, d) {
  const box = f.closest('.feed-yt');
  if (!box) return;
  const first = !f.dataset.heard;
  f.dataset.heard = '1';
  if (d.event === 'onError') { reelYtDead_(box); return; }
  if (first || d.event === 'onReady') {
    reelYtSay_(box, box.dataset.sound === 'on' ? 'unMute' : 'mute');
    reelYtSay_(box, box.dataset.want === 'play' ? 'playVideo' : 'pauseVideo');
  }
  const st = d.event === 'onStateChange' ? Number(d.info)
    : d.event === 'infoDelivery' && d.info && typeof d.info.playerState === 'number' ? d.info.playerState
    : null;
  if (st === null) return;
  const o = ytBox_(box);
  o.st = st;
  if (st === 1) {
    clearTimeout(o.lap); o.lap = 0;
    /* PLAYING WHILE IT WAS ASKED NOT TO — `autoplay` beat a flick away, or a pause sent before it was
       listening — is told again rather than shown. */
    f.dataset.played = '1';
    if (box.dataset.want !== 'play') { reelYtSay_(box, 'pauseVideo'); return; }
    box.classList.add('is-live');
    const art = box.closest('.feed-art');
    if (art) art.classList.add('has-photo');
  } else if (st === 3) {
    /* buffering: as it is */
  } else if ((st === 0 || st === -1) && box.dataset.want === 'play' && box.classList.contains('is-live')) {
    if (!o.lap) o.lap = setTimeout(() => {
      o.lap = 0;
      if (o.st !== 1 && o.st !== 3) box.classList.remove('is-live');
    }, YT_LAP);
  } else {
    clearTimeout(o.lap); o.lap = 0;
    box.classList.remove('is-live');
  }
}

/* ONE LISTENER FOR EVERY PLAYER, matched to its frame by the window that sent the message — the `data-do` shape, one listener for the document. § */
addEventListener('message', e => {
  if (!/^https:\/\/www\.youtube(?:-nocookie)?\.com$/.test(String(e.origin || ''))) return;
  let d = e.data;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch (x) { return; } }
  if (!d || typeof d !== 'object' || !d.event) return;
  const f = [...document.querySelectorAll('iframe.feed-yt-frame')].find(x => x.contentWindow === e.source);
  if (f) reelYtHeard_(f, d);
});

/* SOUND IS OFF UNTIL IT IS ASKED FOR, because a column that starts talking the moment it opens is a column nobody opens twice — and because a muted video is the § */
/* ---------- A REEL YOU CANNOT STOP § */
on('reel-tap', (el, e) => {
  /* THE DOOR OUT IS NOT A PAUSE. "Watch on YouTube" sits inside the slide, so its click reaches this
     handler too; the link does its own job and this one does nothing. */
  if (e && e.target && e.target.closest && e.target.closest('a[href]')) return;
  const n = Number(el.dataset.reel);
  /* A SHORT IS HELD BY `REEL_HELD`, NOT BY ASKING IT. § */
  const yt = el.querySelector('.feed-yt');
  if (yt) {
    if (yt.dataset.dead) return;
    if (REEL_HELD === n) {
      REEL_HELD = -1;
      el.classList.remove('is-held');
      reelYtPlay_(yt);
    } else {
      REEL_HELD = n;
      el.classList.add('is-held');
      reelYtPause_(yt);
    }
    return;
  }
  const v = el.querySelector('video.feed-vid');
  if (!v) return;
  if (v.paused) {
    REEL_HELD = -1;
    el.classList.remove('is-held');
    reelPlay_(v);
  } else {
    REEL_HELD = n;
    el.classList.add('is-held');
    try { v.pause(); } catch {}
  }
});

/* ---------- THE SOUND IS A TILE, LIKE EVERYTHING ELSE § */
function reelSoundTile_(on) {
  return tile_({ icon: on ? 'sound' : 'mute', label: on ? 'Sound on' : 'Sound off',
                 tone: 'over', cls: 'reel-sound', act: 'reel-sound', pressed: !!on });
}
function reelSoundSay_(el, on) {
  if (!el) return;
  tileSet_(el, { icon: on ? 'sound' : 'mute', label: on ? 'Sound on' : 'Sound off', pressed: !!on });
}

on('reel-sound', (el) => {
  const slide = el.closest('.reel');
  /* THE SAME TILE AND THE SAME WORDS FOR A SHORT, said to the player instead of set on an element.
     A held Short is not started by it: sound on a stopped reel is a choice for when it next plays. */
  const yt = slide && slide.querySelector('.feed-yt');
  if (yt) {
    if (yt.dataset.dead) return;
    const on_ = yt.dataset.sound !== 'on';
    if (on_) yt.dataset.sound = 'on'; else delete yt.dataset.sound;
    reelYtSay_(yt, on_ ? 'unMute' : 'mute');
    if (on_ && yt.dataset.want === 'play') reelYtSay_(yt, 'playVideo');
    reelSoundSay_(el, on_);
    return;
  }
  const v = slide && slide.querySelector('video.feed-vid');
  if (!v) return;
  v.muted = !v.muted;
  reelSoundSay_(el, !v.muted);
  if (!v.muted) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
});

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
  const letter = initial(t.name);   // letters and digits only, so it is safe inside the onerror below
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
  if (!who) return `<span class="dm-av" aria-hidden="true">${letter}</span>`;
  const face = personFace_({ pic: who.image, avatar: who.avatar, handle: who.handle, name: t.name || who.title,
                             personId: who.personId }, { cls: 'dm-pic', size: 32 });
  if (picKind_(who.image) === 'photo') {
    return `<span class="dm-av has-pic" aria-hidden="true">${face.replace('<img ', `<img onerror="this.parentNode.classList.remove('has-pic');this.parentNode.textContent='${letter}'" `)}</span>`;
  }
  return /^<span class="dm-pic face-pic"/.test(face)
    ? `<span class="dm-av has-pic" aria-hidden="true">${face}</span>`
    : `<span class="dm-av" aria-hidden="true">${letter}</span>`;
}

function dmPages_() {
  if (!USER) return [{ name: '', html: `<div class="card"><h3>Messages</h3>
    <p class="sub">Sign in to see your messages.</p></div>` }];
  /* THE PAYLOAD AND THE FIRST ANSWER FOR MESSAGES — `loading_()` until both, as every column waits. */
  if (!LOADED || !DM_DONE) return [{ name: '', html: loading_() }];

  const threads = messageThreads_();
  /* ---------- THE HEAD CARD WAS A PAGE WITH NO MESSAGE ON IT § */

  /* ---------- AND AN EMPTY INBOX SAYS WHICH EMPTY IT IS § */
  if (!threads.length) return daivePages_().concat([{ name: '', html: `<div class="card"><h3>Messages</h3>
    ${MSG_FAILED
      ? `<p class="empty">Your messages did not come.<br><span class="faint">The line to the
           office is down, or this phone has no signal.</span></p>
         <button class="btn quiet" data-do="dm-refresh">Try again</button>`
      : emptyMessages_}</div>` }]);

  /* ONE CARD PER CONVERSATION, most recent first — `messageThreads_` has already done both, and
     doing it again here is a second copy of the ordering rule to get wrong later. */
  /* ---------- DRAWN IS READ, ON THIS SCREEN ONLY § */
  threads.forEach(t2 => markRead_(t2.msgs));
  /* ---------- AND EACH ONE CAN BE ANSWERED WHERE IT IS READ § */
  /* THE NAME IS THE PERSON, and the unread count rides on it — so the header says who you are reading rather than "3 of 7", which is the same judgement § */
  return daivePages_().concat(threads.map(t => ({
    name: t.name + (t.unread ? ' (' + t.unread + ')' : ''),
    html: `<div class="card${t.unread ? ' unread' : ''}">
      <div class="dm-head">${dmFace_(t)}
        <h3>${esc(t.name)}${t.unread ? ` <span class="dm-new">${t.unread} new</span>` : ''}</h3></div>
      <div class="msg-body">${messagesHtml_(t.msgs)}</div>
      ${msgForm_(t.name, t.id)}
    </div>`,
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
/* A SLOGAN OR A PLACEHOLDER IS NOT A FACT: the model greeted with the slogan glued to the name (461). */
const ASST_FACT_SKIP = /logo|colou?r|^ink$|accent|ground|font|phone|email|^site$|url|slogan|tagline|motto|strap|hero|headline/i;
const asstPlaceholder_ = t => /^(todo|tbc|tbd|n\/?a|none|x+|-+|…|\.\.\.|lorem\b.*|placeholder.*|example.*)$/i.test(t)
  || /\{\{|\}\}|\[[^\]]*\]|<[^>]+>|lorem ipsum/i.test(t);
/* WHAT DAIVE IS TOLD ABOUT THE BUSINESS: the brand tab's plain facts and a few config numbers, all public already. */
function asstFacts_() {
  const out = [];
  const b = (DATA && DATA.brand) || {};
  Object.keys(b).forEach(k => {
    const v = b[k];
    if (typeof v !== 'string' && typeof v !== 'number') return;
    const t = String(v).trim();
    if (!t || t.length > 300 || ASST_FACT_SKIP.test(k) || asstPlaceholder_(t)) return;
    if (/^#|^https?:|^data:|\.(png|jpe?g|svg|webp)$/i.test(t)) return;
    out.push((k === 'name' ? 'business name' : k.replace(/_/g, ' ')) + ': ' + t);
  });
  const v = (DATA && DATA.constants && DATA.constants.vars) || {};
  if (v.h) out.push('hours per session: ' + v.h);
  if (v.max_students_per_job) out.push('most students in one session: ' + v.max_students_per_job);
  try { out.push('screens in the app: ' + TABS.map(t => t.title).join(', ')); } catch (e) {}
  out.push('to book: the Booking screen; to message a tutor: the Message tile on their card');
  return out.join('\n').slice(0, 4000);
}
/* THE SAME SHAPE `messagesHtml_` DRAWS FOR A PERSON, so Daive's bubbles are a conversation's bubbles. */
function asstMsgs_(s) {
  return s.msgs.map(m => ({ mine: m.role === 'user', read: true, body: m.text, atMs: m.at || 0, fromName: DAIVE }));
}
function daiveHtml_() {
  const s = asstGet_(), cap = asstCap_(), out = s.left <= 0, shut = out || ASST_BUSY;
  const said = out ? 'No questions left today — they come back tomorrow.' : s.left + ' of ' + cap + ' questions left today';
  return `<div class="card daive" data-daive="1">
    <div class="dm-head"><span class="dm-av daive-av" aria-hidden="true">D</span><h3>${DAIVE}</h3></div>
    <div class="msg-body">${messagesHtml_(asstMsgs_(s)) || `<p class="faint">Ask about lessons, prices and booking, or for help with something you are studying.</p>`}${ASST_BUSY ? loading_() : ''}</div>
    <div class="msg-form" data-k="daive">
      <textarea class="msg-text" rows="1" maxlength="1000" placeholder="Message…" aria-label="Message ${DAIVE}"${shut ? ' disabled' : ''}${draftAttr_('asst', '')}>${ASST_BUSY ? '' : esc(draftVal_('asst', '', ''))}</textarea>
      <button class="btn msg-go" data-do="daive-send"${shut ? ' disabled' : ''}>Send</button>
      <p class="faint msg-said">${esc(ASST_SAID)}</p>
      <p class="faint msg-said daive-left">${esc(said)}</p>
    </div>
  </div>`;
}
/* DAIVE IS AN ITEM (487): an admin's Delete and Note on it; deleted, it is gone for everyone. */
const daiveItem_ = () => typeof itemMark_ === 'function' ? itemMark_('item:dm:daive', 'dm', daiveHtml_()) : daiveHtml_();
function daivePage_() { return { name: DAIVE, html: daiveItem_() }; }
const daivePages_ = () => [daivePage_()].filter(p => p.html);
/* REDRAWN IN PLACE, and the column forgets what it drew, so a later paint never judges against the old card. */
function asstRedraw_() {
  const col = $('s-dm'), card = col && col.querySelector('[data-daive]');
  if (!card) return;
  card.outerHTML = daiveItem_() || '<span hidden></span>';
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

/* ---------- THE "MESSAGE EVERYONE" CARD WAS HERE § */

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


/* ---------- A POST AS A PNG (413): "share a post as a PNG of the full post widget" ----------
   On a canvas in the stylesheet's own black and gold: face, name, picture, words, reactions, brand, link. */
const PPNG_W = 1080, PPNG_M = 72;
function ppngTokens_() {
  let cs = null;
  try { cs = getComputedStyle(document.documentElement); } catch (e) {}
  const v = (k, or) => { const s = cs ? String(cs.getPropertyValue(k) || '').trim() : ''; return s || or; };
  return { bg: v('--bg', '#000'), raised: v('--raised', '#0b0b0b'), line: v('--line', '#232323'), ink: v('--ink', '#e6e6e6'),
           dim: v('--dim', '#9a9a9a'), gold: v('--gold', '#ffffff'), font: v('--font', 'ui-monospace, monospace') };
}
/* AN IMAGE THE CANVAS MAY EXPORT, OR NULL: straight, with CORS; else through `imageData` (the backend's proxy); else nothing. */
function ppngImg_(src) {
  const load = (u, cors) => new Promise(ok => {
    if (!u) return ok(null);
    const img = new Image();
    let over = false;
    const end = v => { if (!over) { over = true; ok(v); } };
    setTimeout(() => end(null), 5000);
    if (cors) img.crossOrigin = 'anonymous';
    img.onload = () => {
      try { const c = document.createElement('canvas'); c.width = c.height = 1; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 1, 1); g.getImageData(0, 0, 1, 1); end(img); }
      catch (e) { end(null); }
    };
    img.onerror = () => end(null);
    img.src = u;
  });
  if (!src) return Promise.resolve(null);
  if (/^data:/i.test(src)) return load(src, false);
  return load(src, true).then(img => img || (typeof api === 'function'
    ? api({ action: 'imageData', url: src }).then(d => (d && d.dataUri ? load(d.dataUri, false) : null), () => null)
    : null));
}
const ppngSvg_ = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(String(s)
  .replace(/<svg(?![^>]*xmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"').replace(/\sclip-path="url\(#av-clip\)"/g, ''));
/* THE AUTHOR'S FACE BY THE CARD'S OWN ORDER (`postCard_`): their photo or picture or figure, else the brand's mark, else the initial. */
function ppngFace_(p) {
  const v = picKind_(p.avatar) ? String(p.avatar) : (brand('logo_square') || brand('logo_circle') || '');
  const kind = picKind_(v);
  try {
    if (kind === 'photo') return ppngImg_(pic(v));
    if (kind === 'basic') return ppngImg_(ppngSvg_(pfpArt_(pfpChoice_(v), 240)));
    if (kind === 'avatar' && typeof p.figure === 'string') return ppngImg_(ppngSvg_(avatarFor(p.handle || p.author, 240, p.figure, { bust: true })));
  } catch (e) {}
  return Promise.resolve(null);
}
/* WORDS INTO AT MOST `max` LINES OF `w` PIXELS, the last cut with an ellipsis. */
function ppngWrap_(g, text, w, max) {
  const out = [];
  String(text || '').split(/\n+/).forEach(par => {
    let cur = '';
    par.split(/\s+/).filter(Boolean).forEach(word => {
      while (g.measureText(word).width > w && word.length > 1) {
        let k = word.length - 1;
        while (k > 1 && g.measureText(word.slice(0, k)).width > w) k--;
        if (cur) { out.push(cur); cur = ''; }
        out.push(word.slice(0, k)); word = word.slice(k);
      }
      const next = cur ? cur + ' ' + word : word;
      if (g.measureText(next).width <= w) cur = next; else { out.push(cur); cur = word; }
    });
    if (cur) out.push(cur);
  });
  if (out.length > max) {
    const kept = out.slice(0, max);
    let last = kept[max - 1] + '…';
    while (last.length > 1 && g.measureText(last).width > w) last = last.slice(0, -2) + '…';
    kept[max - 1] = last;
    return kept;
  }
  return out;
}
function postPng_(p, url) {
  const media = postMedia_(p).filter(u => !postIsVideo_(u));
  const fonts = document.fonts && document.fonts.load
    ? Promise.race([Promise.all(['700 40px', '400 30px'].map(f => document.fonts.load(f + ' "Family Code"'))).catch(() => {}), new Promise(r => setTimeout(r, 2000))])
    : Promise.resolve();
  const logoSrc = brand('logo_square', '') || brand('logo_circle', '');
  return Promise.all([ppngFace_(p), media[0] ? ppngImg_(pic(media[0])) : null, logoSrc ? ppngImg_(pic(logoSrc)) : null, fonts])
    .then(([face, photo, logo]) => {
      const C = ppngTokens_(), F = C.font, W = PPNG_W, M = PPNG_M, inner = W - 2 * M;
      const probe = document.createElement('canvas').getContext('2d');
      if (!probe) throw new Error('no canvas');
      const who = String(p.handle || p.author || brand('name', '@family.'));
      probe.font = '400 32px ' + F;
      const cap = p.caption ? ppngWrap_(probe, who + '  ' + p.caption, inner, 8) : [];
      probe.font = '400 28px ' + F;
      const body = p.body ? ppngWrap_(probe, p.body, inner, 8) : [];
      const r = p.reactions || {};
      const total = (Array.isArray(r.counts) ? r.counts : []).reduce((n, x) => n + (Number(x) || 0), 0);
      const iw = photo ? (photo.naturalWidth || photo.width || 1) : 0, ih = photo ? (photo.naturalHeight || photo.height || 1) : 0;
      /* THE PICTURE'S OWN SHAPE, between 16:9 and 4:5 — the card's own limits. */
      const ph = photo ? Math.round(inner * Math.min(1.25, Math.max(0.5625, ih / iw))) : 0;
      const H = 60 + 150 + (ph ? ph + 40 : 0) + cap.length * 46 + (cap.length ? 16 : 0) + body.length * 40 + (body.length ? 16 : 0)
              + (total ? 56 : 0) + 190;
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const g = cv.getContext('2d');
      const text = (t, x, y, size, colour, weight, align) => { g.font = (weight || 400) + ' ' + size + 'px ' + F; g.fillStyle = colour; g.textAlign = align || 'left'; g.fillText(t, x, y); };
      g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
      g.strokeStyle = C.gold; g.globalAlpha = .55; g.lineWidth = 3;
      g.beginPath(); if (g.roundRect) g.roundRect(24, 24, W - 48, H - 48, 26); else g.rect(24, 24, W - 48, H - 48); g.stroke();
      g.globalAlpha = 1;
      /* THE HEAD: the face in a gold ring, the name, where. */
      let y = 60;
      const fx = M + 46, fy = y + 56, fr = 46;
      g.save(); g.beginPath(); g.arc(fx, fy, fr, 0, Math.PI * 2); g.clip();
      g.fillStyle = C.raised; g.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
      if (face) {
        const w0 = face.naturalWidth || face.width || 1, h0 = face.naturalHeight || face.height || 1, sq = Math.min(w0, h0);
        g.drawImage(face, (w0 - sq) / 2, (h0 - sq) / 2, sq, sq, fx - fr, fy - fr, fr * 2, fr * 2);
      } else { g.textBaseline = 'middle'; text(initial(who), fx, fy + 2, 46, C.gold, 700, 'center'); g.textBaseline = 'alphabetic'; }
      g.restore();
      g.beginPath(); g.arc(fx, fy, fr + 3, 0, Math.PI * 2); g.strokeStyle = C.gold; g.lineWidth = 4; g.stroke();
      probe.font = '700 38px ' + F;
      text(ppngWrap_(probe, who, inner - 130, 1)[0] || who, fx + fr + 26, fy + (p.location ? -4 : 13), 38, C.ink, 700);
      if (p.location) { probe.font = '400 26px ' + F; text(ppngWrap_(probe, p.location, inner - 130, 1)[0], fx + fr + 26, fy + 34, 26, C.dim); }
      y += 150;
      if (photo) {
        const want = inner / ph, have = iw / ih;
        let sx = 0, sy = 0, sw = iw, sh = ih;
        if (have > want) { sw = ih * want; sx = (iw - sw) / 2; } else { sh = iw / want; sy = (ih - sh) / 2; }
        g.save(); g.beginPath(); if (g.roundRect) g.roundRect(M, y, inner, ph, 14); else g.rect(M, y, inner, ph); g.clip();
        g.drawImage(photo, sx, sy, sw, sh, M, y, inner, ph); g.restore();
        if (media.length > 1) text('+' + (media.length - 1) + ' more', W - M - 14, y + ph - 18, 26, C.ink, 700, 'right');
        y += ph + 40;
      }
      cap.forEach((line, i) => {
        y += 38;
        if (i === 0 && line.indexOf(who) === 0) { text(who, M, y, 32, C.ink, 700); probe.font = '700 32px ' + F; text(line.slice(who.length), M + probe.measureText(who).width, y, 32, C.ink); }
        else text(line, M, y, 32, C.ink);
        y += 8;
      });
      if (cap.length) y += 16;
      body.forEach(line => { y += 34; text(line, M, y, 28, C.dim); y += 6; });
      if (body.length) y += 16;
      if (total) { y += 40; text((Array.isArray(r.emoji) ? r.emoji.slice(0, 3).join(' ') + '  ' : '') + total + (total === 1 ? ' reaction' : ' reactions'), M, y, 28, C.dim); y += 16; }
      /* THE FOOT: the brand and the link back to this post. */
      const fy2 = H - 150;
      g.fillStyle = C.line; g.fillRect(M, fy2, inner, 2);
      let bx = M;
      if (logo) { g.save(); g.beginPath(); g.arc(M + 28, fy2 + 62, 28, 0, Math.PI * 2); g.clip(); g.drawImage(logo, M, fy2 + 34, 56, 56); g.restore(); bx = M + 74; }
      text(brand('name', '@family.'), bx, fy2 + 60, 36, C.gold, 700);
      probe.font = '400 22px ' + F;
      text(ppngWrap_(probe, String(url || '').replace(/^https?:\/\//, ''), inner - (bx - M), 1)[0] || '', bx, fy2 + 96, 22, C.dim);
      return cv;
    });
}
