/* ---------- THE PAYLOAD LOAD: asked, landed, painted, and the banner when it fails (cut from shell-api.js; read with the other shell-*.js by tools/piece-src.js). */
async function load(again) {
  const R = RECONNECT;
  if (!again) reconnectStop_();
  /* THE DEVICE'S COPY FIRST, once a visit (1070): drawn while the network is asked; a newer load's answer makes it stale. */
  if (!again && !PAYLOAD_KEPT_TRIED) {
    PAYLOAD_KEPT_TRIED = true;
    const kept = payloadKept_();
    if (kept) loadOnce_(false, ++R.seq, kept).catch(() => {});
  }
  R.asked = Date.now();
  R.flying++;
  try { await loadOnce_(again, ++R.seq); }
  finally {
    R.flying--;
    /* THE ASK THAT WAITED FOR THIS ONE — see `due`. Not while another is still in the air: the last
       to land makes it, so two that land together are still one ask. */
    if (!R.flying && R.due) reconnectAsk_('owed');
  }
}
/* `DATA` IS THE PAYLOAD BEHIND A PROXY that counts the keys read and never sent (`missingKeys`). A new proxy on the library's arrival is a new `DATA`, so every memo keyed on it starts again. */
function dataProxy_(d) {
  return new Proxy(d, {
    get(t, k) {
      /* `then` is asked for by anything that awaits an object, to find out whether it is a promise. Not a missing key. */
      if (typeof k === 'string' && !(k in t) && k !== 'then') MISSING_KEYS[k] = (MISSING_KEYS[k] || 0) + 1;
      return t[k];
    }
  });
}
/* THE LIBRARY AFTER THE PAYLOAD (670): merged into the same rows once both files are in, then Find draws, and the question a reload left is reopened. */
let LIBRARY_FOR = null;
async function libraryLate_(d) {
  try {
    const rows = await libraryRows_(), extra = await libraryExtraRows_();
    await libraryQuiet_();
    if (LIBRARY_FOR !== d) return;   /* a newer payload took its place, and merged the library itself */
    libraryInto_(d, rows);
    libraryExtras_(d, extra);
    loadRowsClean_(d);
    DATA = dataProxy_(d);
  } catch (e) { /* a malformed library row is what the payload path always swallowed: Find draws with what merged */ }
  LIBRARY_LATE = false;
  if (LIBRARY_FAILED) banner('The questions did not load — ' + LIBRARY_FAILED + '. Everything else is here; reload the page to try again.');
  /* THE CARRY-OVER WAITS FOR THE QUESTIONS (`subMigrate_`, submit.js), so it runs again now they are here. */
  try { if (typeof finderForgetFound_ === 'function') finderForgetFound_(); if (typeof subMigrate_ === 'function') { subMigrate_(); subPush_(true); } landRepaint_(); if (!LOAD_FAILED && typeof findPlaceBack_ === 'function') findPlaceBack_(); }
  catch (e) { oops_(e, 'load:library-paint'); }
  setTimeout(shapeSave_, 4000);
}
/* WHETHER A GOOD PAYLOAD HAS EVER BEEN PAINTED — see the end of `load()`. */
let FIRST_PAINT_DONE = false;
async function loadOnce_(again, n, kept) {
  /* THE REPLY ARRIVED AND WAS DATA — so a throw after this is our own code, not the connection. */
  let reached = false;
  /* AND IT BECAME `DATA` — the one outcome a retry repaints for. */
  let got = false;
  /* WHOM IT IS ASKED FOR, kept to check the reply against — see `loadStale_`, and the note below on
     why each of the three keys is sent. */
  const who = loadWho_();
  try {
    /* The person's id goes with the request so the server can say which posts YOU liked — it
       cannot know otherwise, and sending every like to every phone to answer it would be absurd. */
    /* AND THE NAME, which is a different question from the id and was never being asked. § */
    /* ---------- AND THE TOKEN, WHICH IS THE ONLY ONE OF THE THREE THAT PROVES ANYTHING § */
    /* ALL THREE ARE BUILT BY `loadWho_` — `who`, at the top of this function. */
    /* NO CACHE, AND A DIFFERENT URL EVERY TIME. § */
    let d; if (kept) { d = kept; window.PAYLOAD_KEPT = true; } else {
    d = await loadFetch_(who);
    reached = true;
    /* WHAT THE SLOW BOX ASKS (index.html): the backend has answered, so whatever is left is ours and bounded. */
    window.PAYLOAD_IN = true; }
    /* THE ANSWER TO A QUESTION NOBODY IS ASKING ANY MORE — for somebody who has signed out or been signed in over since it went, or older than a payload already § */
    if (loadStale_(n, who)) return;
    /* KEPT ONLY ONCE IT IS STILL THIS PERSON'S (1070): a stale answer for someone who signed out must never be filed under whoever is here now. */
    if (!kept) payloadOwe_(d);
    if (d && !d.error) {
      /* WHAT WAS ASKED FOR AND NOT SENT. § */
      /* AND THE STARS THE SHEET KNOWS ABOUT — see `adoptFavourites_`. Called here rather than in
         `find.js` because this is the moment a payload becomes DATA, and a favourite read before
         that is the last device's guess. */
      /* ---------- THE LIBRARY, MERGED IN BEFORE THIS BECOMES `DATA` § */
      /* ---------- NOT `d = ...`, AND THAT LINE HAD BEEN THROWING ON EVERY LOAD § */
      /* THE CODE THE FIRST SCREEN DID NOT NEED (670) is in before anything draws from the payload. */
      if (!(await loadTakeData_(d, n, who))) return;
      got = true;
      RECONNECT.shown = n; RECONNECT.shownFor = who;
      /* THE MESSAGES CAME WITH IT (700), so the DMs column is drawn with the rest, not one cold round trip later. */
      if (typeof dmAdopt_ === 'function') dmAdopt_(d);
      /* AND THE SHAPE THE COLUMNS LANDED IN, for the next visit's wait (700). */
      setTimeout(shapeSave_, 4000);
      /* THE STARS AND THE SPOTLIGHTS, from the payload that has just landed. § */
      adoptMarks_();
      /* BEFORE THE ICON AND BEFORE ANYTHING IS DRAWN. `applyColumns_` can change which screen you
         are on, and everything painted after it reads `AT`. */
      applyColumns_();
      applyBrandIcon_();
      /* ---------- THE WATCHDOG'S MESSAGE IS NOT TRUE ANY MORE § */
      if (!kept) loadNotices_(d);   /* a kept copy says nothing new (1070): banners, messages and settings wait for the network */
    }
    else {
      LOAD_FAILED = String(d.error || 'the server refused the request');
      /* THE FILES STILL STAND -- see `filesOnly_`. A refusal from the backend is not a reason for
         a student to lose the paper they are working through. */
      await filesOnly_();
      /* ASKED AGAIN, EVERY TWO MINUTES — doGet's catch-all answers ANY exception this way, and the client cannot tell a throw that will pass from a refusal that will § */
      if (reconnectFail_(null, 'refused')) banner('The server said: ' + (d.error || 'something went wrong'));
    }
  } catch (err) {
    /* A FAILURE IS STALE THE SAME WAY — it would put the quiet line back over a payload that came. Not
       once the payload is `DATA`: a throw after that is this load's own, and this load is current. */
    if (!got && loadStale_(n, who)) return;
    LOAD_FAILED = String((err && err.message) || err || 'could not reach the backend');
    await filesOnly_();
    /* ASKED AGAIN, AND SAID QUIETLY — see `RECONNECT`. What follows is the diagnostic, and it is drawn
       only when `reconnectFail_` says an admin should see it now. */
    /* WHICH URL IT TRIED, as something you can press. § */
    if (reconnectFail_(err, reached ? 'ours' : 'way')) loadFailBanner_(err, reached);
  }
  /* A RETRY THAT BROUGHT NO PAYLOAD CHANGED NOTHING — failed on the way, or refused: § */
  if (again && !got && LOADED && reconnecting_()) return;
  loadFinish_(kept);
}
/* THE REQUEST ITSELF, under its deadlines: the reply parsed, or a throw for the catch in `loadOnce_`. */
async function loadFetch_(who) {
    const bust = (who ? '&' : '?') + '_=' + Date.now();
    /* THE SLOW-LOAD LINE STARTS ITS CLOCK HERE, beside the request it is about, rather than at boot:
       this is the moment the app begins waiting, and it is the only moment worth timing from. */
    /* ---------- AND AT THE SAME MOMENT, COME UP ON THE FILES § */
    clearTimeout(earlyTimer);
    earlyTimer = setTimeout(() => {
      if (LOADED) return;
      filesOnly_().then(() => {
        if (LOADED) return;
        try { repaint(); } catch (e) { oops_(e, 'shell:loadOnce_') }
      }).catch(() => {});
    }, EARLY_AFTER);
    /* ---------- A DEADLINE, BECAUSE A REQUEST THAT NEVER ANSWERS IS THE WORST FAILURE § */
    let bell;
    const deadline = new Promise((unused, no) => {
      bell = setTimeout(() => {
        const e = new Error('timeout');
        e.name = 'AbortError';
        no(e);
      }, 60000);
    });
    /* ---------- THE ONE THE HEAD ALREADY STARTED § */
    const early = window.BOOT_GET || null;
    window.BOOT_GET = null;
    let res;
    try {
      /* FROM A FILE, ASK A DIFFERENT WAY. `fetch` is refused outright by a page with no origin;
         a script tag is not. Served properly — Live Server, GitHub Pages — `fetch` is better in
         every way and this stays out of the way. */
      res = await Promise.race([
        early
          ? early.then(r => (r && r.ok ? r : (location.protocol === 'file:'
              ? jsonp(API + who + bust)
              : fetch(API + who + bust, { cache: 'no-store' }))))
          : location.protocol === 'file:'
          ? jsonp(API + who + bust)
          : fetch(API + who + bust, { cache: 'no-store' }),
        deadline]);
    } finally {
      /* Cleared whichever way it went, or a load that answered at 59 seconds leaves a timer running
         to reject a promise nobody is holding. */
      clearTimeout(bell);
    }
    /* JSONP HANDS BACK THE VALUE ITSELF — a script tag delivers a value, not a reply, so there is nothing to unwrap. § */
    if (res && res.__jsonp) {
      const got = res.__jsonp;
      res = { ok: true, status: 200, statusText: 'OK', json: () => got };
    }
    /* ---------- READ AS TEXT, THEN PARSE, so a web page says what it is § */
    /* THE BODY UNDER A DEADLINE TOO (503): the 60 seconds above covered the headers only. */
    let bodyBell;
    return await Promise.race([bootJson_(res), new Promise((u, no) => { bodyBell = setTimeout(() => no(new Error('timeout')), 60000); })])
      .finally(() => clearTimeout(bodyBell));
}
/* THE PAYLOAD BECOMES `DATA`, library and settings merged in first; false when it went stale on the way. */
async function loadTakeData_(d, n, who) {
      await laterFiles_();
      /* FEED FIRST (670): a library not yet here is merged after the payload is painted, and only Find waits for it (`LIBRARY_LATE`). */
      const late = !libraryHere_();
      try {
        if (!late) {
          libraryInto_(d, await libraryRows_());
          /* THE OTHER THREE TABS, WHICH MAY STILL BE EMPTY. § */
          libraryExtras_(d, await libraryExtraRows_());
        }
        /* AND THE SETTINGS TABS, ON THE SAME RULE; their own small fetch, so the columns and words never wait for the library. */
        settingsInto_(d, await settingsRows_());
      } catch (e) { /* the repairs below make an empty library a working one */ }
      loadRepairs_(d);
      /* AND ASKED AGAIN AT THE MOMENT IT BECOMES `DATA`. § */
      if (loadStale_(n, who)) return false;
      loadRowsClean_(d);
      DATA = dataProxy_(d);
      LIBRARY_LATE = late;
      LIBRARY_FOR = d;
      if (late) libraryLate_(d);
      LOAD_FAILED = '';
      return true;
}
/* WHAT A FRESH (NOT KEPT) PAYLOAD HAS TO SAY: banners, messages, settings, missing features. */
function loadNotices_(d) {
      if (LOAD_SLOW) banner('');
      /* AND THE ASKING-AGAIN STOPS — the quiet line goes, and an admin's diagnostic with it. Here, for
         the same reason as the line above: before the checks below write anything of their own. */
      reconnectDone_();
      /* WHAT THE BACKEND CAN DO, against what this site needs. § */
      /* A payload that could not write something — the schema check ran and a column is still
         missing. Said on load rather than waiting for somebody to try to save into it. */
      if (d.unwritten && d.unwritten.length) {
        banner('The sheet is missing columns: '
          + d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
          + '. Anything saved to them is discarded.');
      }
      /* ---------- AND THE QUESTION FILE, WHICH FAILS SEPARATELY AND USED TO FAIL SILENTLY § */
      if (LIBRARY_FAILED && !LIBRARY_LATE) {
        banner('The questions did not load — ' + LIBRARY_FAILED
          + '. Everything else is here; reload the page to try again.');
      }

      /* ---------- THE MESSAGE WIDGETS COULD NOT EXIST UNTIL YOU OPENED THE MESSAGE SCREEN § */
      if (USER && typeof loadMessages === 'function') {
        loadMessages().then(() => { try { landRepaint_(); } catch (e) { oops_(e, 'shell:loadOnce_') } });
      }
      /* AND YOUR OWN SETTINGS, AS THE SHEET HOLDS THEM — see `profileRefresh_` in me.js. § */
      if (USER && typeof profileRefresh_ === 'function') profileRefresh_();
      /* NO BANNER FOR A VERSION MISMATCH ANY MORE. § */
      /* `editResource` AND `deleteResource` WERE IN THIS LIST. § */
      const NEEDS = ['editPost', 'deletePost'];
      const missing = NEEDS.filter(f => (d.features || []).indexOf(f) === -1);
      if (missing.length) {
        /* THE VERSION IT ACTUALLY REACHED, said out loud. § */
        banner('The backend at this URL is ' + (d.version || 'an unknown version')
             + ', which cannot ' + missing.join(', ') + '. Either that deployment is old, or '
             + 'this site is pointed at the wrong one — check the id in API against the '
             + 'Deployment ID in Manage deployments.');
      }
}
/* THE ADMIN'S DIAGNOSTIC for a load that failed: which URL, and advice that matches the fault. */
function loadFailBanner_(err, reached) {
    const el = $('banner');
    if (el) {
      el.classList.remove('hidden');
      /* NOT A DOOR. `banner(msg, true)` makes the whole bar a "tap to load the new build", and this writes its own markup over it — found by review: § */
      el.removeAttribute('data-do');
      /* THE ADVICE MATCHES THE FAULT. § */
      const msg = String((err && err.message) || err || '');
      const why = /Unexpected token|not valid JSON/.test(msg)
        /* A reply arrived and it was a web page. § */
        ? 'The backend answered with a web page instead of data. Open it in a tab and read what '
          + 'it says — “Authorization is required” means the scopes changed and nobody has '
          + 'consented yet: run authoriseDrive from the Apps Script editor, accept the prompt with '
          + 'every box ticked, and deploy a new version once its last line says READY.'
        /* ---------- A PAGE OPENED FROM A FILE CANNOT REACH ANYTHING § */
        : location.protocol === 'file:'
        ? 'This page was opened from a file, so the browser blocked the request before it left — '
          + 'that is what “Failed to fetch” in no time at all means, and nothing is wrong with the '
          + 'backend. Serve the folder instead: in VS Code, right-click index.html → Open with '
          + 'Live Server. The address then starts http:// and everything works.'
        : /Failed to fetch|NetworkError|Load failed/.test(msg)
        /* Served properly and still nothing arrived — so now it IS the address or the access. */
        ? 'The reply never arrived, so this URL is not being served. Check Manage deployments: the '
          + 'one under ACTIVE is the only one that answers, an archived id looks exactly like '
          + 'this, and “Only myself” access does too.'
        /* ---------- THE DEADLINE, WHICH WAS FILED UNDER "SOMETHING ELSE" § */
        : /^timeout$/.test(msg)
        ? 'The backend took longer than a minute, again and again. One slow answer is a payload '
          + 'built cold (after clearPayloadCache) and the next ask gets the copy it kept; minutes of '
          + 'them is the script itself — open it in a tab and see how long it takes.'
        : 'Something else went wrong on the way.';
      el.innerHTML = 'Could not reach the backend.' + (reached ? '' : ' Still trying by itself.') + '<br>'
        + qtag_(esc(why)) + '<br>'
        + '<a class="link" href="' + esc(API) + '" target="_blank" rel="noopener">Open it in a '
        + 'tab</a> — the page itself will say which it is.<br>'
        + '<span>' + esc(msg)
        + ' · site ' + esc(SITE_VERSION) + ' · css ' + esc(cssVersion()) + '</span>';
    }
}
/* A LOAD FINISHED, whether it succeeded or failed: the loader goes and every screen is drawn. */
function loadFinish_(kept) {
  LOADED = true;
  /* THE FIRST LOAD IS DONE, said on `<html>` for whatever waits on it; nothing on screen changes. */
  bootLoaded_(true);
  /* THE ADMIN'S FRONT DOOR (489, layout.js), once the layout has come with the payload. */
  try { if (typeof frontGo_ === 'function') frontGo_(); } catch (e) { oops_(e, 'shell:loadOnce_') }
  /* ---------- THE STALE SCREENS, CLEARED BEFORE THE REDRAW § */
  /* ---------- ONCE, NOT ON EVERY LOAD § */
  /* ---------- AND NOT EMPTIED AT ALL ANY MORE — THE GLASS IS DRAWN, THE REST IN THE QUIET AFTER IT § */
  const first = !FIRST_PAINT_DONE && !LOAD_FAILED;
  if (first) TABS.forEach(t => { if (t.id !== AT && screenHasMarkup_(t.id)) PRE_PAYLOAD.add(t.id); });
  if (!LOAD_FAILED) FIRST_PAINT_DONE = true;
  /* AND THE WHOLE SEQUENCE, in the one order it may happen in — see `repaint`. Around the box somebody
     is typing in, if they are: see `landRepaint_`. */
  landRepaint_();
  /* THE FIRST PAYLOAD IS A FACT, NOT A MAYBE — every column holding the boot's markup is drawn from it. */
  if (first) {
    PRE_PAYLOAD.forEach(id => { if (STALE[id]) STALE[id] = 1; });
    GLASS.cols.forEach(id => {
      if (id === AT || !STALE[id]) return;
      paint(id);
      if (!STALE[id]) { PRE_PAYLOAD.delete(id); if (PAGER[id]) paintPager(id, true); }
    });
    aheadOpen_(); if (kept) payloadFind_();
  }
  if (typeof window.openSharedPost === 'function') window.openSharedPost();     // if the app was opened on a shared link, go to that post
  try { openSharedTutor(); } catch (e) { oops_(e, 'shell:loadOnce_') }   // or on a tutor's own link (400)
  try { if (typeof window.pushLanding_ === 'function') window.pushLanding_(); } catch (e) { oops_(e, 'shell:loadOnce_') }   // or on a tapped notification (492, push.js)
  /* AND BACK TO THE QUESTION A RELOAD TOOK YOU AWAY FROM — once a visit, on the first payload that
     arrived, when the column came back too. See `findPlaceBack_` in find.js and docs/history/317. */
  if (!LOAD_FAILED && !LIBRARY_LATE && typeof findPlaceBack_ === 'function') findPlaceBack_();
}
/* ---------- NO SPLASH (466): THE APP IS ON SCREEN FROM THE FIRST FRAME */
/* `html.is-loaded` says the first load finished, for a check to wait on; it covers nothing. */
const EARLY_AFTER = 15000;
/* The one that draws the app on its files when the backend is slow -- see `load`. */
let earlyTimer = null;
function bootLoaded_(on) {
  clearTimeout(earlyTimer);
  try { document.documentElement.classList.toggle('is-loaded', !!on); } catch (e) { oops_(e, 'shell:bootLoaded_') }
  /* THE SLOW BOX GOES WHEN THE WAIT ENDS (503): `banner('')` hid #banner, never this, so a 31-second backend left it up for good. */
  if (on) try { const b = $('boot-slow'); if (b) { b.className = 'hidden'; b.textContent = ''; } } catch (e) { /* the slow-start note is only a hint */ }
}
/* THE OLD SPLASH'S KEPT DRAWINGS (up to 1.5 MB) OUT OF THE STORE: nothing reads them since 466. True when anything went. */
function splashForget_() {
  const gone = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k === 'splashAnims' || k === 'splashOff' || k.indexOf('splashAnim:') === 0)) gone.push(k);
    }
    gone.forEach(k => localStorage.removeItem(k));
  } catch (e) { /* storage blocked: old splash keys stay, unread */ }
  return gone.length > 0;
}
/* A BANNER IS WORDS ONLY: the one tap it ever carried, "load the new version", is gone (610). */
function banner(msg) {
  const el = $('banner');
  if (!msg) { el.classList.add('hidden'); el.removeAttribute('data-do'); return; }
  el.textContent = msg;
  el.removeAttribute('data-do');
  el.classList.remove('hidden');
}
