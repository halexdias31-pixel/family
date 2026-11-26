/* @family. — overworld.js ONE FILE, SPLIT. § */


/* ---------- THE PICTURE § */
const FEED_PICS = {};        // one lookup per search term, for as long as the tab is open

function feedPicture(query) {
  const q = String(query || '').trim();
  if (!q) return Promise.resolve(null);
  if (FEED_PICS[q] !== undefined) return Promise.resolve(FEED_PICS[q]);

  const key = ((DATA.constants || {}).vars || {}).giphy_key;
  const url = key
    ? 'https://api.giphy.com/v1/gifs/search?api_key=' + encodeURIComponent(key)
      + '&q=' + encodeURIComponent(q)
      /* `rating=g` is not optional on a site children open. Without it a search for "pistol
         shrimp" can return anything Giphy has under that phrase. */
      + '&limit=1&rating=g&lang=en'
    /* `origin=*` is what makes Commons answer a browser at all — without it the request is made, refused by CORS, and fails in a way that looks identical to the § */
    : 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*'
      + '&generator=search&gsrnamespace=6&gsrlimit=1'
      + '&gsrsearch=' + encodeURIComponent('filetype:bitmap ' + q)
      + '&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900';

  return dataFile_(url, { fail: true })
    .then(d => {
      let out = null;
      if (key) {
        const g = (d.data || [])[0];
        if (g) out = { src: (g.images && g.images.downsized_medium || {}).url || '',
                       by: 'GIPHY' };
      } else {
        const pages = ((d.query || {}).pages) || {};
        const first = Object.keys(pages).map(k => pages[k])[0];
        const info = first && (first.imageinfo || [])[0];
        if (info) {
          const meta = info.extmetadata || {};
          out = {
            src: info.thumburl || info.url,
            /* The artist field is HTML — Commons stores a link in it — so the tags are stripped
               rather than escaped and rendered. A credit line is a name, not markup. */
            by: String((meta.Artist || {}).value || '').replace(/<[^>]*>/g, '').trim().slice(0, 60)
                || 'Wikimedia Commons',
          };
        }
      }
      FEED_PICS[q] = out && out.src ? out : null;
      return FEED_PICS[q];
    })
    /* A TERM THE SERVICE ANSWERED WITH NOTHING is remembered as nothing, so a deck that repeats does not ask again for an answer already given. § */
    .catch(() => null);
}

function drawFeed() {
  const host = $('feed-screen');
  if (!host) return;
  // No end to reach, so no wrapping and no going below the first.
  FEED_AT = Math.max(0, FEED_AT);
  const it = feedItem(FEED_AT);
  if (!it) return;
  host.innerHTML = (window.feedSlide || (() => ''))(it);

  /* The photograph arrives afterwards and fades in over the drawing. § */
  /* A CLIP PLAYS HERE TOO, AND IT HAS TO BE ASKED. § */
  const vid = host.querySelector('video.feed-vid');
  if (vid && typeof window.reelPlay_ === 'function') window.reelPlay_(vid);

  const at = FEED_AT;
  if (it.pic) feedPicture(it.pic).then(found => {
    if (!found || at !== FEED_AT) return;
    const art = host.querySelector('.feed-art');
    if (!art) return;
    const img = new Image();
    img.onload = () => {
      if (at !== FEED_AT) return;
      art.style.backgroundImage = `url("${found.src}")`;
      art.classList.add('has-photo');
      const cred = host.querySelector('.feed-credit');
      if (cred && found.by) cred.textContent = found.by;
    };
    /* A src that 404s or is blocked simply never loads, and the gradient stays. Nothing to
       handle: the failure state and the starting state are the same picture. */
    img.src = found.src;
  });

  /* ---------- WHERE YOU GOT TO IS NOT KEPT ANY MORE § */
}



/* TAP FOR THE NEXT, and the left third for the one before — the gesture stories taught everybody, and it costs one line more than a tap that only goes forward. § */
on('feed-tap', (el, e) => {
  const box = el.getBoundingClientRect();
  const x = (e && e.clientX !== undefined ? e.clientX : box.right) - box.left;
  FEED_AT += (x < box.width * 0.3 && FEED_AT > 0) ? -1 : 1;
  drawFeed();
});




/* OPEN A WIDGET. Its markup into the sheet, then the one function that brings it to life. § */

/* Started when their screen appears, and only then — a canvas loop running behind a screen nobody
   is looking at is a flat battery for nothing. */

/* A PEN'S INK KEEPS THE DRAG ONLY WHILE ITS PEN IS PICKED (owner, 7 Nov): an unarmed figure scrolls like the page */
function noSwipe_(t) {
  const n = t && t.closest ? t.closest('[data-noswipe]') : null;
  return !!n && !(n.classList && n.classList.contains('qpad-ink') && !n.closest('.qpad.is-drawing'));
}
/* THE PADLOCK (457, 461): a widget's (`game`, 'id@column:page') or a question page's (`q`, 'column:page') holds the column still. Its own name, as `SWIPE.lock` is zeroed on every touch. */
const PADLOCK = { game: '', q: '' };
const padHere_ = () => String(typeof AT !== 'undefined' ? AT : '') + ':' + String((typeof PAGE !== 'undefined' && PAGE[AT]) || 0);

/* ONE PADLOCK FOR EVERY WIDGET AND CARD (461, 498): `widgetOnColumn_` and `cardRow_` put it on each, so text can be selected and copied with the column held. */
const gameLocked_ = id => !!PADLOCK.game && PADLOCK.game.split('@')[0] === String(id);
const gameLockLook_ = on => ({ icon: on ? 'lock' : 'unlock', label: on ? 'Locked' : 'Lock',
  note: on ? 'tap to let the page move' : 'hold it still to select text', on, pressed: on });
function gameLockOpts_(id) {
  return (Object.assign(gameLockLook_(gameLocked_(id)), { act: 'game-lock', cls: 'game-lock', data: { w: id } }));
}
function gameLockSet_(v) {
  PADLOCK.game = v || '';
  document.querySelectorAll('.game-lock').forEach(el => {
    const on = gameLocked_(el.getAttribute('data-w'));
    tileSet_(el, gameLockLook_(on));
    const w = el.closest('.is-widget'), row = el.closest('.tile-row');
    if (w) w.classList.toggle('is-locked', on);
    const card = w || el.closest('.card') || (row && row.previousElementSibling);
    if (card) card.classList.toggle('is-held', on);
  });
  pageHold_(!!PADLOCK.game);
}
on('game-lock', el => {
  const id = el.getAttribute('data-w');
  gameLockSet_(gameLocked_(id) ? '' : id + '@' + padHere_());
});
/* LET GO WHEN THE PERSON LEAVES: a tab, a link, another page of the column (`placeCells`), or the app hidden. */
function gameLockStray_() { if (PADLOCK.game && PADLOCK.game.split('@')[1] !== padHere_()) gameLockSet_(''); }
document.addEventListener('visibilitychange', () => { if (document.hidden && PADLOCK.game) gameLockSet_(''); });

/* ABSOLUTE WHILE A WIDGET IS LOCKED: the pager's own drag-scroll fallback, a native pan, a wheel and an arrow key's page scroll were each a way round (461). */
const PAD_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '];
function padStop_(e) {
  if (!e.cancelable) return;
  if (e.type === 'keydown') {
    const t = e.target;
    if (PAD_KEYS.indexOf(e.key) < 0 || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) return;
  }
  e.preventDefault();
}
/* LISTENING ONLY WHILE LOCKED: a blocking touchmove/wheel listener makes every scroll in the app wait for the page's thread (419). */
let PAD_HOLD = false;
function pageHold_(on) {
  if (!!on === PAD_HOLD) return;
  PAD_HOLD = !!on;
  document.documentElement.classList.toggle('padlocked', PAD_HOLD);
  ['touchmove', 'wheel'].forEach(n => (on ? addEventListener : removeEventListener)(n, padStop_, { passive: false }));
  (on ? addEventListener : removeEventListener)('keydown', padStop_);
}

/* ---------- THE SCREEN CHANGING SHAPE UNDER THE APP § */
let RESHAPE = 0;
function reshaped_() {
  clearTimeout(RESHAPE);
  /* `'x'` names the axis the placement is FOR, and a full placement does both — every cell gets a new transform whichever is named. § */
  RESHAPE = setTimeout(() => { try { placeCells('x', true); } catch (err) {} }, 100);
}
addEventListener('resize', reshaped_, { passive: true });
/* `orientationchange` as well as `resize`: § */
addEventListener('orientationchange', reshaped_, { passive: true });
/* The visual viewport is the part you can actually see — it changes when the address bar slides
   away or a keyboard opens, and neither of those fires a window resize on iOS. */
if (window.visualViewport) {
  visualViewport.addEventListener('resize', reshaped_, { passive: true });
}

/* IF ANY OF THIS THROWS, SAY SO ON THE SCREEN. § */
function bootFailed(err, when) {

  try {
    const box = document.getElementById('screen') || document.body;
    const line = (look, text) => ({ type: 'group', tag: 'p', look, text });
    const said = [line('boot-fail-head', 'The app stopped while ' + String(when) + '.'), line('boot-fail-why', why_(err)),
      err && err.stack ? line('boot-fail-why boot-fail-stack', String(err.stack).split('\n').slice(0, 4).join('\n')) : null,
      line('boot-fail-ver', 'site ' + SITE_VERSION + ' · css ' + cssVersion())].filter(Boolean);
    /* THROUGH THE ONE CARD MAKER; if even that is missing, the same words as plain text. */
    if (typeof cardBlock_ === 'function') box.innerHTML = cardBlock_({ type: 'group', look: 'boot-fail', blocks: said });
    else box.textContent = said.map(p => p.text).join('\n');
  } catch (e2) {
    /* Even that failed — the document is not there to write to. Nothing left but the console. */
  }
  try { console.error('@family. stopped while ' + when, err); } catch (e3) {}
}

/* ANYTHING THAT THROWS LATER, and did not get caught nearer to where it happened. § */
let toldYou = false;
addEventListener('error', e => {
  /* A resource, not the code. `target` is the <img> or <script> that failed. */
  if (e && e.target && e.target !== window && e.target.tagName) {
    const src = e.target.currentSrc || e.target.src || '';
    console.warn('[load]', e.target.tagName, src);
    /* A SCRIPT THAT DID NOT ARRIVE is not the same kind of thing as a picture that did not. § */
    if (e.target.tagName === 'SCRIPT') {
      banner('A part of the app did not load: ' + (src.split('/').pop().split('?')[0] || 'unknown')
        + ' — and everything listed after it in index.html is missing too. Check that file is '
        + 'there and that its name matches the list in index.html exactly.');
    }
    return;
  }
  if (toldYou) return;
  toldYou = true;

  const msg = String((e && e.error && e.error.message) || (e && e.message) || 'something went wrong');
  console.error('[window]', (e && e.error) || msg);
  /* A banner rather than the whole screen. Whatever threw, everything else still works — and if it
     did not, the person can see that for themselves without being told. */
  banner(text_('something-went-wrong') + msg
    + (/^Script error/i.test(msg)
        /* The browser is withholding it, which it does for any script it treats as cross-origin —
           and opening the app from a file:// path makes every script cross-origin. */
        ? ' — the browser will not say more than that when the app is opened from a file rather '
          + 'than from a web address. The console has the real one.'
        : ''));
});

/* A FLICK INSIDE AN OPEN SHEET SEPARATE FROM THE GRID'S GESTURE ON PURPOSE. § */
const SHEET_FLICK = { live: false, id: 0, x: 0, y: 0, at: 0 };

addEventListener('pointerdown', e => {
  if (!e.isPrimary || typeof sheetStep !== 'function' || !sheetStep) return;
  if ($('sheet').classList.contains('hidden')) return;
  if (e.pointerType === 'mouse' && e.buttons !== 1) return;
  if (e.target.closest?.('input, textarea, select, button, a') || noSwipe_(e.target)) return;
  SHEET_FLICK.live = true; SHEET_FLICK.id = e.pointerId;
  SHEET_FLICK.x = e.clientX; SHEET_FLICK.y = e.clientY; SHEET_FLICK.at = Date.now();
}, { passive: true });

addEventListener('pointerup', e => {
  if (!SHEET_FLICK.live || e.pointerId !== SHEET_FLICK.id) return;
  SHEET_FLICK.live = false;
  if (typeof sheetStep !== 'function' || !sheetStep) return;

  const dx = e.clientX - SHEET_FLICK.x, dy = e.clientY - SHEET_FLICK.y;
  /* SIDEWAYS IS NOT THIS GESTURE, and a lazy diagonal is sideways. The grid uses 1.4 to favour the
     vertical; the same number here, for the same reason and so the two agree about what a
     vertical flick is. */
  if (Math.abs(dy) < 60 || Math.abs(dy) < Math.abs(dx) * 1.4) return;
  /* AND NOT A SLOW DRAG. Three quarters of a second of travel is somebody moving the page about,
     not flicking through it. */
  if (Date.now() - SHEET_FLICK.at > 750) return;

  const body = $('sheet-body');
  if (body) {
    const room = body.scrollHeight - body.clientHeight;
    const pos  = body.scrollTop;
    /* 2px, THE SAME SLACK THE GRID USES for the same rounding reason — a body that fits exactly
       still reports a pixel of overflow. */
    if (dy < 0 && room - pos > 2) return;    // flicking up, still more to read below
    if (dy > 0 && pos > 2) return;           // flicking down, still scrolled away from the top
  }

  /* DOWN IS BACKWARDS, up is forwards — the direction the content moves, which is the way the grid
     already reads a swipe and the way every list on a phone reads one. */
  try { sheetStep(dy > 0 ? -1 : 1); } catch (err) {}
}, { passive: true });
