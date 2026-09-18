/* ==================================================================================================
   @family. — posts.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   posts.js is number 8 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- POSTS -------------------------------------------------------------------------------
   The front of the app. A picture, a line about it, and a heart with a number.

   Full width and one column: a photograph split across two columns on a phone is two photographs
   of nothing.
--------------------------------------------------------------------------------------------- */

/* A Google Drive share link is a page, not a picture — pasting one into an <img> gives a broken
   image every time. This turns it into the direct thumbnail. Anything that is already a plain URL
   passes straight through. */
function pic(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  const id = (u.match(/\/file\/d\/([\w-]{20,})/) || u.match(/[?&]id=([\w-]{20,})/) || [])[1];
  return id ? 'https://lh3.googleusercontent.com/d/' + id + '=w1200' : u;
}

/**
 * THE FEED, IN ORDER.
 *
 * The sheet's row order is Drive's iteration order, which is not chronological and not anything —
 * February posts were sitting between June ones, and a feed in no order reads as a feed that
 * failed to load rather than as one arranged badly.
 *
 * `parseDMY` rather than `new Date()`: the cells are DD/MM/YYYY and a browser reads those as
 * American, so 12/06 becomes December.
 */
/* ---------- ONE POST, AS A CARD ------------------------------------------------------------------
   THIS WAS THE BODY OF `feedPosts`'s `map` AND NOTHING ELSE COULD DRAW A POST. That was fine while
   the feed was the only place posts appeared; it stopped being fine the moment they became a thing
   you can search for, because the funnel needs a card for every kind it lists and there was no
   function to ask.

   LIFTED OUT UNCHANGED. Same markup, same order — who, picture, actions, caption — same admin
   controls, same everything. `i` is still taken because the first two pictures load eagerly and
   the rest lazily, and a post found by searching is the first thing on its page, so it is passed 0
   from there.
--------------------------------------------------------------------------------------------- */
function postCard_(p, i) {
    const src = pic(p.image);
    /* The author's face, or the brand's mark when the post is the business speaking. A column of
       blank circles is the thing that makes a feed look unfinished. */
    const face = pic(p.avatar || brand('logo_square') || brand('logo_circle'));
    const who = p.handle || p.author || brand('name', '@family.');

    /* The order is Instagram's, and it is right: WHO first, then the picture, then what you can do
       about it, then what it says.
       Who first because a photograph with no attribution is an advert; the caption last because it
       is the only part you may not read. */
    return `<article class="post" data-post="${esc(p.id)}">
      <header class="post-by">
        ${face
          ? `<img class="post-face" src="${esc(face)}" alt="">`
          : `<span class="post-face none">${esc(initial(who))}</span>`}
        <span class="post-nm">
          ${/* No "· deleted" any more: a deleted post is not drawn at all, so nothing reaching
                 here can be one. */''}
          <span class="post-who">${esc(who)}${p.pinned
            ? ' <span class="faint">· pinned</span>' : ''}${p.waiting
            ? ' <span class="post-wait">· waiting</span>' : ''}${p.refused
            ? ' <span class="post-wait">· not put up</span>' : ''}</span>
          ${p.location ? `<span class="post-where">${esc(p.location)}</span>` : ''}
        </span>
        ${/* THE ⋯ STOOD HERE — "one glyph, at the end of the row where it does not compete with the
              picture; a post is looked at a hundred times for every time it is edited, so the
              control is small." Small is right and a `<span>` was the wrong way to get it: a span
              with a `data-do` cannot be reached by a keyboard, is not announced as a control, and
              is invisible to `check/ui.js`, which measures buttons, links and inputs. It was about
              14px and nothing had ever said so.
              Editing is now a tile in the row under the post, with every other thing you can do to
              it — see `postTiles_`. */''}
      </header>

      ${/* A SHAPE BEFORE IT LOADS. Without one an image is a zero-height box until the photograph
             arrives — so the pane is measured short, the grid places the panes for that height, and
             two posts overlap by exactly the height the picture turned out to be.
             `aspect-ratio` reserves the room. 4:5 is the portrait most phone photographs are, and
             the real one replaces it the moment the file's own dimensions are known; the observer
             below catches that. Reserving the wrong shape briefly is a smaller error than reserving
             none, which is what the overlap was. */''}
      ${src ? `<img class="post-pic" src="${esc(src)}" alt=""
           style="aspect-ratio:4/5"
           onload="this.style.aspectRatio=this.naturalWidth+'/'+this.naturalHeight"
           loading="${i < 2 ? 'eager' : 'lazy'}">` : ''}

      ${/* THE ACTIONS ROW, which is now reactions and sharing and nothing else.
            The heart has gone. A like is a reaction with exactly one option, so having both was
            two counts of the same gesture — and a heart sitting beside a 👍 asking for the same
            press, with no way to tell somebody which one you meant.
            The reactions move UP here, into the place the heart held: directly under the picture,
            where the eye already goes and where the thing you can do about a photograph belongs. */''}
      <div class="post-acts">
        ${reacts(p) || (isAdmin()
          ? '<span class="faint">No reaction set — fill in <code>brand!reactions</code>.</span>'
          : '<span></span>')}
        ${/* SHARING MOVED DOWN INTO THE TILE ROW. It was the one action living in this row, drawn
              as a `.post-act` — its own class, its own 44px rule, its own hover — for a control
              that is the same act as sharing a booking and now uses the same renderer. What is left
              here is the reactions, which are a counted response rather than an action on the post,
              and which is why the row is aligned to flex-start: they wrap. */''}
      </div>

      ${/* The name leads the caption, as it does everywhere — but ONLY when there is a caption.
            Without a caption it was printing the name on its own under the picture, which is the
            name said twice and answers nothing. */''}
      ${p.caption ? `<p class="post-cap"><b>${esc(who)}</b> ${mark(p.caption)}</p>` : ''}
      ${p.poll ? poll(p) : ''}
      ${p.body ? `<p class="note">${mark(p.body)}</p>` : ''}
      ${p.when || p.at ? `<p class="faint post-when">${esc(ago(p.at || p.when))}</p>` : ''}
      ${/* WHAT YOU CAN DO ABOUT IT, IN ONE ROW. Sharing, editing, and the decision to put it up were
            three controls in three places drawn three ways — a `<span>` in the header, a
            `.post-act` beside the reactions, and a `.btn-row` down here. A post is a THING, and a
            thing has tiles: see `postTiles_`, which follows `jobAdminTiles_` exactly.

            THE DECISION STAYS ON THE POST, which was the right half of the old arrangement and the
            reason the button row was here rather than on an approvals screen: you are already
            looking at the photograph and the caption, which is everything the decision is about. */''}
      ${postTiles_(p)}
      ${p.waiting && !isAdmin() ? `<p class="faint">Waiting to be checked. Only you can see it.</p>` : ''}
    </article>`;
}

function feedPosts() {
  return [...(DATA.posts || DATA.gallery || [])]
    /* A DELETED POST IS GONE FROM THE FEED, for everybody including the admin who deleted it.
       It used to stay, greyed and marked "· deleted", so that it could be switched back on — the
       same argument the tutor `listed` switch follows. In practice that put every post ever
       deleted permanently in the way of every post that had not been, on the one screen that is
       supposed to be a feed.
       Deleting is still a FLAG and not a removal: the row stays in the sheet, the picture stays in
       Drive, and the reactions and votes pointing at it stay counted. Putting one back is setting
       `active` to TRUE on the posts tab. That is the trade — the feed stays clean, and undoing a
       delete is a cell rather than a tap. */
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

/* ---------- THE FEED IS A FUNNEL ANSWER, NOT A COLUMN ---------------------------------------------
   `screen('posts')` WAS HERE. It was the last tab besides Find, kept because it is the one screen
   somebody opens with no errand — and every other column had already been folded in. What was left
   was one navigation for everything except this, which is two navigations.

   THE BODY IS UNCHANGED AND IS NOW A FUNCTION. `postsBlocks` returns exactly the card list the
   screen returned, in exactly the order it built — spotlight, the ＋, the festive cards, then the
   posts, pinned first and newest after. `feedPages_` in find.js puts them behind `What for · Posts`.
   Nothing about what a post looks like, how it sorts, or who may see it has moved. */
function postsBlocks() {
  /* NOTHING LOADED YET is not the same as NOTHING TO SHOW, and the difference matters: one is a
     wait and the other is a fact. Telling somebody "nothing posted yet" while the request is still
     in flight is a lie the app corrects a second later, which is worse than saying nothing. */
  if (!LOADED) return skeleton();

  const posts = feedPosts();
  /* ---------- WHAT THE CALENDAR IS OFFERING, AT THE FRONT OF THE FEED -------------------------------
     THESE WERE ON THE BOOKING COLUMN, which is where they were built and is not where they belong.
     A festive card is the business saying "there is a holiday club on the 23rd, four places left" —
     an announcement with a date on it, which is precisely what this screen is for. It was next to
     the booking form only because bookings were.

     NOBODY PUBLISHES THEM. A holiday row carries a date and how many days ahead to appear, so six
     weeks before Christmas one puts itself here and the week after it is gone. That is the same
     thing the ＋ card at the top of this feed does by hand, done by the sheet.

     IN FRONT OF THE POSTS, because they expire and posts do not. A photograph from June will still
     be worth seeing next week; a club with four places left may not be there. */
  const festive = (DATA.festive || []).map(festiveCard);


  /* THE FEED IS NEVER EMPTY WHEN SOMEBODY IS SIGNED OUT — the sign-in card is always there — so the
     nothing-here message is only right when there is genuinely nothing and somebody to see it. */
  if (!posts.length && !festive.length && USER) {
    return [nothingHere('Nothing posted yet.<br><span class="faint">Add a row to the posts tab '
      + 'with an image link and a caption.</span>')];
  }

  /* ONE POST PER SCREEN, and the same pager the tools use. A feed is the place this shape
     belongs most obviously — a photograph competing with the top of the next photograph is a
     photograph nobody looks at properly, and scrolling past one by accident is how you never see
     it again. */
  /* THE ＋ IS ON THE FEED, not in a bar above it.
     It lived in the header, beside a ⟳ that rescanned the Drive folder — two glyphs in the corner
     of every screen in the app, one of which only means anything on this one and the other of
     which is a thing nobody should have to know exists. A control belongs beside the thing it acts
     on: adding a post belongs at the top of the posts.

     `unshift` rather than a separate strip, because a page is a page. It pages, it swipes, it is
     placed by the same grid as everything else, and it needs no rule of its own anywhere. */
  const cards = posts.map((p, i) => postCard_(p, i));

  /* ---------- THE COMPOSER WAS HERE, AND IT WAS ALSO THE SCREEN TO THE LEFT ----------------------
     `unshift(newPostCard())` PUT IT AT THE TOP OF THE FEED, and `screen('make')` further down this
     file drew the identical card as a column of its own. Two pages, same card, one swipe apart —
     which is what you saw: "＋ New post" beside "＋ New post".

     THE FILE ALREADY SAYS WHICH ONE IS WRONG. The note under `screen('feed')` reads "THE COMPOSER
     IS NOT REPEATED AT THE TOP. It is one swipe left from anywhere in the feed, always in the same
     direction — which is what a column gives it that a card at the top of a list cannot, because a
     card at the top of a list moves as the list grows." That was the decision; this line was left
     behind when it was made.

     `PAGER.feed` COUNTED IT TOO, with `.concat(USER ? [''] : [])`, so removing it here without
     removing it there would page one past the end of the feed onto nothing. Both went. */
  /* THE FESTIVE CARDS ARE FIRST NOW. They were second, behind the ＋; with the ＋ gone they are the
     most perishable thing on the screen and belong at the front on their own merits. */
  festive.reverse().forEach(c => cards.unshift(c));
  /* ---------- SPOTLIGHT IS NOT HERE ANY MORE -----------------------------------------------------
     IT WAS ABOVE EVEN THE ＋, on the argument that nothing outranks what the business most wants
     seen at the top of its own feed. True while the feed was the screen the app opened on. It is an
     answer to a question now, which means somebody has to ask for Posts before spotlight exists —
     and the one thing spotlight is for is reaching somebody who has not asked for anything.

     SO IT IS IN FRONT OF THE QUESTION INSTEAD, the first page of the funnel, before anything has
     been narrowed. See `screen('stuff')` in find.js. */

  /* ---------- SIGNING IN IS NOT HERE EITHER -------------------------------------------------------
     IT WAS AT THE TOP OF THIS FEED because the feed was the screen nobody arrived at with an errand,
     and a state that governs everything belonged where somebody landed. The feed is an ANSWER now —
     `What for · Posts` — so it is behind a question, and a way in that is behind a question is a way
     in you have to already be able to use.

     IT IS ON THE QUESTION ITSELF. `#stuff-controls` is drawn before anything is narrowed and is
     never filtered away, so signed out you meet the sign-in card first and signed in you get your
     credits and the way out. See `screen('stuff')` in find.js. */

  /* THE CARDS THEMSELVES. This was `pages('posts', cards)` — the screen's own pager — and there is
     no Posts screen to page. `screen('stuff')` pages the whole funnel, and these are pages in it. */
  return cards;
}

/* The first page of the feed, for an admin. A card rather than a glyph: it can say what it does,
   which a ＋ in a corner cannot, and it is the width of a thumb rather than the width of a
   fingernail. */
/* ==================================================================================================
   THE CAMERA, ON THE PAGE.

   THE 📷 TAB DREW "＋ New post" — a card describing a photograph rather than a way to take one. The
   feed drew the same card at its top, so the tab was a duplicate of a card one swipe away, and
   neither of them was a camera.

   THIS IS THE VIEWFINDER. Live preview in a glass card, a shutter under it, and the still held on
   the page once taken.

   --------------------------------------------------------------------------------------------------
   IT DOES NOT UPLOAD, AND THAT IS NOT AN OVERSIGHT.

   `on('new-post')` takes a LINK to a picture, deliberately: "Uploading meant this app had to be
   allowed to write to your Drive, which is a large permission to hold for the sake of one button."
   The backend has no endpoint that accepts an image either — `imageData` runs the other way, fetching
   a URL and returning a data URI.

   So a still taken here is SAVED TO THE PHONE, and the composer's folder picker finds it once it
   reaches the Drive folder — which is the route the composer's own note describes: "share it to the
   folder from the camera roll and it is here". One extra step, and it is the step that keeps this
   app out of your Drive's write permissions.

   --------------------------------------------------------------------------------------------------
   IT STARTS WHEN THE COLUMN ARRIVES, AND IT USED TO WAIT FOR A TAP.

   The note here said a gesture was required for `getUserMedia`. That is not the rule — the rule is
   PERMISSION, which is a prompt the browser raises on its own and then remembers for the site. So
   the button bought nothing after the first visit: you granted the camera once and were still asked
   to press `Turn the camera on` every single time the column came round.

   Started from `go` now, the same way the tools and games are, through `afterSlide_` so the markup
   it needs is in the document before it looks for it.

   A REFUSAL STILL HAS TO LEAVE A WAY BACK. If the prompt is declined, or the page is not on https,
   or another app holds the camera, there is no gesture coming and nothing would ever retry — so the
   button is still here, hidden, and appears with the sentence saying what went wrong. It is a retry
   after a failure rather than a step in the normal path, which is the difference the old one blurred.

   AND IT STOPS WHEN THE COLUMN LEAVES — `camStop_`, called from `go` beside `toolsStop_`. A live
   camera behind a screen nobody is looking at is a recording light on for nothing.

   --------------------------------------------------------------------------------------------------
   A PICTURE FROM THE GALLERY LANDS IN THE SAME CANVAS A SHOT DOES.

   `Photos` is a file input wearing a label, and what it picks is DRAWN INTO `cam-still` rather than
   given an element of its own. So `Again` and `Save it` need to know nothing about where the picture
   came from: there is one held image on this card and one set of buttons for it. A second element
   would have meant every one of those handlers asking which of two things it was looking at, which
   is three states to keep in step for no gain anybody can see.
================================================================================================== */
let CAM_STREAM = null;

function cameraCard() {
  return `<div class="card cam-card">
    <h3>Camera</h3>
    <div class="cam-stage" id="cam-stage">
      <video id="cam-view" playsinline muted autoplay></video>
      <canvas id="cam-still" hidden></canvas>
      ${/* "Starting" RATHER THAN "off", BECAUSE IT IS. This panel shows for the moment between the
            column arriving and the first frame, and `The camera is off.` was a statement about a
            state the card no longer has — read while the thing it denied was already happening. */''}
      <div class="cam-off" id="cam-off">
        <p class="sub">Starting the camera…</p>
      </div>
    </div>
    <div class="btn-row cam-row">
      ${/* `Photo`, `Video`, `Photos` — asked for by name. It said `Take one`, which is a sentence
            about the button rather than a name for what you get, and there was no way to record at
            all. The other three controls in this row are all CONDITIONAL — `Again` and `Save it`
            appear once there is something to save, `Try the camera again` only after a refusal —
            so the row a person actually sees is these three and nothing else. */''}
      <button class="btn quiet" data-do="cam-shoot" id="cam-shoot" hidden>Photo</button>
      <button class="btn quiet" data-do="cam-video" id="cam-video" hidden>Video</button>
      <button class="btn quiet" data-do="cam-again" id="cam-again" hidden>Again</button>
      <button class="btn" data-do="cam-save" id="cam-save" hidden>Save it</button>
      ${/* A LABEL, NOT A BUTTON, so the file input opens with no script at all — a `for` reaches a
            control the page is hiding, which is the one way to style a file picker without
            rebuilding it. `accept="image/*"` and NO `capture`: capture would reopen the camera,
            which is the thing this button exists to be an alternative to. */''}
      <label class="btn quiet cam-pick" for="cam-pick">Photos</label>
      <input type="file" id="cam-pick" data-do="cam-pick" accept="image/*" hidden>
      ${/* HIDDEN UNTIL SOMETHING FAILS. See the note at the top: this is the way back from a refused
            prompt, not a step on the way in. */''}
      <button class="btn" data-do="cam-on" id="cam-on" hidden>Try the camera again</button>
    </div>
    <p class="faint" id="cam-said"></p>

    ${/* ---------- `Write a post` WAS HERE AND IS GONE ON REQUEST ---------------------------------
          IT WAS THE ONLY DOOR TO `on('new-post')`, so that handler and the composer behind it are
          now unreachable — working code with nothing to open it. Left in place rather than deleted:
          it is a whole feature, and where a composer belongs is a decision about the app rather than
          a tidy-up to make on the way past. `check-doors.js` reports it as a handler waiting for a
          button, which is exactly what it is and exactly what that check is for. */''}
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

/* ---------- STARTING IT, FROM THE COLUMN ARRIVING OR FROM A RETRY ----------------------------------
   ONE FUNCTION FOR BOTH, because the retry button and the swipe want exactly the same thing and two
   copies of "ask for the camera" is two places for the failure wording to drift apart.

   IT RETURNS EARLY IF A STREAM IS ALREADY LIVE. `go` runs on every arrival, including the one where
   you swiped away and straight back before the card was torn down, and a second `getUserMedia` while
   the first is running is a second camera light and a stream nothing ever stops.

   AND IT RETURNS EARLY IF THE CARD IS NOT DRAWN. Signed out, `screen('make')` renders a sentence and
   no viewfinder, so there is nothing to start and nothing to say about it. */
async function camStart_() {
  const v = $('cam-view');
  if (!v) return;

  /* ---------- THE MARKUP CAN BE REPLACED UNDER A LIVE STREAM -----------------------------------
     `repaint` rebuilds this screen's cards, so the `<video>` that had the camera in it is gone and
     the one in front of you is a fresh element with `srcObject` null — while `CAM_STREAM` still
     holds the camera open behind it. Returning early on "a stream exists" would leave that: a black
     box, a camera light on, and nothing able to fix it short of leaving the column.
     Re-attached rather than reopened, because the stream is fine; it is the element that changed. */
  if (CAM_STREAM) {
    if (v.srcObject !== CAM_STREAM) {
      v.srcObject = CAM_STREAM;
      try { await v.play(); } catch (e) {}
      $('cam-off')   && ($('cam-off').hidden = true);
      $('cam-shoot') && ($('cam-shoot').hidden = false);
      $('cam-video') && ($('cam-video').hidden = !canRecord_());
    }
    return;
  }

  /* A PICTURE ALREADY ON THE CARD IS NOT INTERRUPTED. Coming back to a shot you took, or a photo you
     picked, must not have the live preview reopen underneath it and throw the picture away. */
  const c = $('cam-still');
  if (c && !c.hidden) return;

  const said = $('cam-said'), retry = $('cam-on');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (said) said.textContent = 'This browser has no camera support.';
    if (retry) retry.hidden = true;          // nothing a retry could change
    return;
  }
  if (retry) retry.disabled = true;
  try {
    /* THE BACK CAMERA IF THERE IS ONE. `ideal` rather than `exact` so a laptop with one front
       camera gets that rather than an OverconstrainedError. */
    CAM_STREAM = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } }, audio: false });
  } catch (err) {
    CAM_STREAM = null;
    if (said) said.textContent = camWhy_(err);
    /* THE WAY BACK APPEARS ONLY NOW. Until something fails there is nothing to retry, and a button
       offering to start a camera that is already running is the thing this replaced. */
    if (retry) { retry.hidden = false; retry.disabled = false; }
    const off = $('cam-off');
    if (off) { off.hidden = false; const t = off.querySelector('.sub'); if (t) t.textContent = 'The camera did not start.'; }
    return;
  }

  /* THE COLUMN MAY HAVE LEFT WHILE THE PROMPT WAS UP. `camStop_` ran with CAM_STREAM still null, so
     it stopped nothing, and this stream would have stayed live behind a screen nobody is looking at
     — a recording light on for nothing, which is the exact thing camStop_ exists to prevent. */
  if (typeof AT !== 'undefined' && AT !== 'make') { camStop_(); return; }

  v.srcObject = CAM_STREAM;
  try { await v.play(); } catch (e) {}
  $('cam-off') && ($('cam-off').hidden = true);
  if (retry) { retry.hidden = true; retry.disabled = false; }
  $('cam-shoot') && ($('cam-shoot').hidden = false);
  if (said) said.textContent = '';
}

on('cam-on', () => camStart_());

/* ---------- A PICTURE OUT OF THE GALLERY ----------------------------------------------------------
   DRAWN INTO THE SAME CANVAS A SHOT USES, so `Again` and `Save it` work on it without knowing where
   it came from. See the note at the top of this section.

   `change`, NOT A `data-do` CLICK. `on()` is the click table; a file input reports its choice by
   changing, and this is the pattern book.js already uses for its typed fields.

   THE VALUE IS CLEARED AFTERWARDS. Without it, picking the same photograph twice in a row is a
   `change` event that never fires — the input's value has not changed — so the second attempt looks
   like the button is broken. */
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="cam-pick"]');
  if (!el) return;
  const file = el.files && el.files[0];
  el.value = '';
  if (!file) return;

  const said = $('cam-said'), c = $('cam-still'), v = $('cam-view');
  if (!c) return;

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    /* REVOKED THE MOMENT IT IS DRAWN. The pixels are in the canvas by now, so the blob URL is a
       handle on a file this page has finished with, and one left per photograph is a leak that only
       shows up on the device of somebody who picked forty. */
    URL.revokeObjectURL(url);
    c.hidden = false;
    if (v) v.hidden = true;
    $('cam-shoot') && ($('cam-shoot').hidden = true);
    $('cam-again') && ($('cam-again').hidden = false);
    $('cam-save')  && ($('cam-save').hidden = false);
    $('cam-off')   && ($('cam-off').hidden = true);
    if (said) said.textContent = '';
    /* THE CAMERA IS LET GO, not left running behind the picture. You asked for a photograph instead
       of the viewfinder; holding the stream open for a preview nobody can see is the recording light
       again. `Again` starts it back up. */
    camStop_(true);
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
  $('cam-shoot').hidden = true;
  $('cam-again').hidden = false;
  $('cam-save').hidden = false;
});

/* `Again` NOW HAS TO PUT THE CAMERA BACK, not just uncover it. A shot taken here leaves the stream
   running underneath, but a photograph picked from the gallery released it — see the picker — so
   showing the `<video>` again would have shown a dead black box on exactly that path. `camStart_`
   returns immediately when a stream is already live, so the shot case costs nothing. */
on('cam-again', () => {
  const v = $('cam-view'), c = $('cam-still');
  if (c) c.hidden = true;
  if (v) v.hidden = false;
  $('cam-again').hidden = true;
  $('cam-save').hidden = true;
  $('cam-shoot').hidden = false;
  const said = $('cam-said'); if (said) said.textContent = '';
  camStart_();
});

/* ---------- RECORDING, WHICH IS THE SAME SHAPE AS A PHOTOGRAPH ------------------------------------
   A PHOTO HERE IS A DOWNLOAD, and the note on `cam-save` says why: this app holds no write
   permission on your Drive and the backend has no endpoint that takes a file. A video is the same
   fact one size larger, so it takes the same way out — record, stop, download — rather than
   inventing an upload that has nowhere to arrive.

   `MediaRecorder` IS ASKED ABOUT RATHER THAN ASSUMED. It is absent on older iOS and its codec
   support differs per browser, so the button is only shown when the API exists and only ever uses
   a type the browser says it can write. A control that appears and then throws is worse than one
   that is not there — which is the `orderPrints` lesson in a different costume.

   THE STREAM IS THE ONE ALREADY RUNNING. `camStart_` owns it and `camStop_` releases it; this
   never opens or closes the camera itself, or stopping a recording would fight the column leaving. */
let CAM_REC = null;
let CAM_BITS = [];

function canRecord_() {
  return typeof MediaRecorder === 'function' && !!CAM_STREAM;
}

/* THE FIRST TYPE THE BROWSER ADMITS TO. Chrome writes webm, Safari writes mp4, and passing a type
   neither supports makes the constructor throw — so it is asked rather than guessed, and an empty
   string lets the browser pick its own default as a last resort. */
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
    if (btn) { btn.textContent = 'Video'; btn.classList.remove('is-rec'); }
    const blob = new Blob(CAM_BITS, { type: (CAM_REC && CAM_REC.mimeType) || 'video/webm' });
    CAM_BITS = [];
    if (!blob.size) { if (said) said.textContent = 'Nothing was recorded.'; return; }
    /* THE SAME WAY OUT AS A PHOTOGRAPH — see `cam-save`. The object URL is revoked immediately
       after the click: a video blob is megabytes and leaving it attached to the document holds all
       of them for as long as the page is open. */
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'family-' + stamp_() + (/mp4/.test(blob.type) ? '.mp4' : '.webm');
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      if (said) said.textContent = 'Saved.';
    } catch (err) {
      if (said) said.textContent = 'Could not save that: ' + String((err && err.message) || err);
    }
  };

  try { CAM_REC.start(); } catch (err) {
    if (said) said.textContent = 'Could not start recording: ' + String((err && err.message) || err);
    return;
  }
  if (btn) { btn.textContent = 'Stop'; btn.classList.add('is-rec'); }
  if (said) said.textContent = 'Recording. Press Stop when you are done.';
});

/* ONE PLACE THAT NAMES A FILE. `cam-save` built this inline and the recorder needed the same thing;
   two copies of a filename format is two things to keep in step, which is this repository's most
   repeated fault. */
function stamp_() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

on('cam-save', () => {
  const c = $('cam-still'), said = $('cam-said');
  if (!c) return;
  /* A DOWNLOAD, BECAUSE THERE IS NOWHERE ELSE FOR IT TO GO. See the note at the top: this app does
     not hold write permission on your Drive and the backend has no endpoint that takes an image. */
  try {
    const a = document.createElement('a');
    a.href = c.toDataURL('image/jpeg', 0.92);
    a.download = 'family-' + stamp_() + '.jpg';
    document.body.appendChild(a); a.click(); a.remove();
    if (said) said.textContent = 'Saved. Put it in the posts folder and it will be in the list below.';
  } catch (err) {
    if (said) said.textContent = 'Could not save that: ' + String((err && err.message) || err);
  }
});

/** Let the camera go. Called when the column leaves — see `go` in shell.js.
 *  @param {boolean} [keepShown] release the stream and leave the card exactly as it looks. */
/* EVERY BUTTON BACK TO ITS STARTING STATE TOO, not just the stream. Stopping the tracks leaves the
   last frame frozen in the `<video>` and "Take one" still showing, so the card looks live and does
   nothing — which reads as a broken camera rather than a stopped one.

   EXCEPT WHEN THE POINT WAS TO KEEP WHAT IS ON IT. The gallery picker releases the camera while a
   photograph is being looked at, and the full reset would have wiped that photograph off the canvas
   half a frame after drawing it. `keepShown` releases the hardware and touches nothing else.

   `cam-on` IS NOT REVEALED BY A STOP ANY MORE. It used to come back on every leave, because it was
   the way in; it is the way back from a failure now, and a stop is not a failure. Showing it here
   meant swiping away and back left a `Try the camera again` button sitting over a camera that had
   just started itself perfectly well. */
function camStop_(keepShown) {
  /* ---------- A RECORDING IN PROGRESS IS STOPPED FIRST, AND THAT ORDER MATTERS -------------------
     STOPPING THE TRACKS FIRST WOULD LOSE THE FILE. `MediaRecorder.onstop` is where the blob is
     assembled and downloaded, and a recorder whose source tracks have already ended may never fire
     it — so leaving the column mid-record would take the camera light off and silently throw away
     what had been recorded. Stopped here, before the stream goes, so the download still happens. */
  try { recStop_(); } catch (e) {}
  try { if (CAM_STREAM) CAM_STREAM.getTracks().forEach(t => t.stop()); } catch (e) {}
  CAM_STREAM = null;
  const v = $('cam-view');
  if (v) { try { v.srcObject = null; } catch (e) {} }
  if (keepShown) return;

  const rec = $('cam-video');
  if (rec) { rec.hidden = true; rec.textContent = 'Video'; rec.classList.remove('is-rec'); }

  if (v) v.hidden = false;
  const c = $('cam-still'); if (c) c.hidden = true;
  const off = $('cam-off');
  if (off) { off.hidden = false;
             const t = off.querySelector('.sub'); if (t) t.textContent = 'Starting the camera…'; }
  $('cam-on')    && ($('cam-on').hidden = true, $('cam-on').disabled = false);
  $('cam-shoot') && ($('cam-shoot').hidden = true);
  $('cam-again') && ($('cam-again').hidden = true);
  $('cam-save')  && ($('cam-save').hidden = true);
}

/* ---------- REACTIONS ---------------------------------------------------------------------------
   A row of faces with a count under each. Unlike the poll, the counts are NOT hidden — a poll asks
   a question and wants an unanchored answer; a reaction is a room agreeing with itself, and seeing
   that eleven people laughed is most of why anybody adds a twelfth.

   A face with nobody behind it shows no number rather than a 0 — a row of zeroes reads as
   indifference, and an empty space reads as nothing having happened yet.
--------------------------------------------------------------------------------------------- */
function reacts(p) {
  const r = p.reactions;
  /* NO FACES, NO ROW — and the caller is told, rather than being handed an empty div.
     `r.emoji.map` over an empty array drew a `<div class="reacts">` with nothing inside it, which
     renders as no gap, no message and no clue: exactly the silent absence this codebase keeps
     producing. The emoji set comes from `brand!reactions`, and while that cell is empty there is
     nothing to draw. */
  if (!r || !Array.isArray(r.emoji) || !r.emoji.length) return '';
  const counts = Array.isArray(r.counts) ? r.counts : [];
  return `<div class="reacts">
    ${r.emoji.map((e, i) => {
      const n = counts[i] || 0;
      const mine = r.yours === e;
      return `<button class="react${mine ? ' mine' : ''}${n ? ' any' : ''}"
                 data-do="react" data-id="${esc(p.id)}" data-emoji="${esc(e)}">
        <span class="react-e">${esc(e)}</span>${n ? `<span class="react-n">${n}</span>` : ''}
      </button>`;
    }).join('')}
    ${/* THE TOTAL, and it is its own button. Pressing a face adds YOUR reaction; pressing the
          number asks who — two different questions, and one control answering both means somebody
          who wants to see the list has to react to the post to find out.
          Only there when somebody has: a 0 that opens an empty panel is a promise broken. */''}
    ${r.total ? `<button class="react-who" data-do="who-reacted" data-id="${esc(p.id)}"
        >${r.total}</button>` : ''}
  </div>`;
}

/* WHO REACTED, AND WITH WHAT. Grouped by face rather than listed flat: "four people laughed" is
   the shape of the answer, and a list of twenty rows each carrying its own emoji makes you count
   them yourself. */
on('who-reacted', el => {
  const p = (DATA.posts || []).find(x => x.id === el.dataset.id);
  const r = p && p.reactions;
  if (!r || !r.total) return;

  const by = r.by || [];
  const groups = (r.emoji || []).map((e, i) => ({
    emoji: e, n: (r.counts || [])[i] || 0,
    names: by.filter(x => x.emoji === e).map(x => x.name),
  })).filter(g => g.n);

  openSheet(r.total + ' reaction' + (r.total === 1 ? '' : 's'),
    groups.map(g => `
      <h2><span>${esc(g.emoji)}</span><span class="faint">${g.n}</span></h2>
      ${g.names.length
        ? g.names.map(n => rowValue(mark(n))).join('')
        : ''}
      ${g.n > g.names.length
        /* Reacted by people whose names the site cannot resolve — somebody removed from the sheet,
           or a reaction from before they were added. The count is still true. */
        ? `<p class="faint">…and ${g.n - g.names.length} more</p>` : ''}`).join(''));
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

  /* ---------- `by` IS THE FOURTH THING THAT MOVES, AND IT WAS THE ONE LEFT BEHIND -----------------
     THREE FIELDS WERE UPDATED AND FOUR CHANGE. `yours`, `counts` and `total` were moved here before
     the server answered — which is right, and is what makes the row respond to a tap — and
     `r.by`, the list of WHO reacted with WHAT, was not. `on('who-reacted')` builds its groups by
     filtering `by` per emoji and prints the count off `counts`, so the two disagree the moment
     anybody presses a face:

       · react for the first time  → the sheet says `😂 1` with no name under it and the line
                                     "…and 1 more", which is the branch written for a person the
                                     site cannot resolve. You are not unresolvable; you are missing.
       · change which face         → your name stays listed under the emoji you moved AWAY from
       · take a reaction back      → the header says 2 and three names are printed under it

     AND NOTHING REPAIRED IT. The `send` has no `.then`, so no reload follows a successful react —
     deliberately, because a whole payload per tap is what the optimistic update exists to avoid —
     and `by` stayed wrong for the rest of the session.

     SO IT MOVES WITH THE COUNTS, in the same three lines, which is the only version that cannot
     drift: a fifth field would have to be forgotten in one place rather than in one of two.
     `before` carries it too, because the `.catch` below puts everything back and a restore that
     misses one field is this same bug with a network failure in front of it.

     BY NAME, because that is what `by` holds — `doget.gs` sends names rather than ids on purpose
     ("a reaction is a public thing and an id is not"). So this is the one comparison in the app
     that is SUPPOSED to be on a display name: it is matching the entry the server will write for
     you against the one you are looking at, and both sides are the same string from the same
     source. */
  const before = { yours: r.yours, counts: r.counts.slice(), total: r.total,
                   by: (r.by || []).slice() };
  const at = e => r.emoji.indexOf(e);
  if (at(emoji) < 0) return;

  /* Moved before the server answers. The whole row is redrawn rather than one face, because
     changing your reaction moves two counts at once. */
  if (r.yours) { r.counts[at(r.yours)]--; r.total--; }
  /* MINE OUT OF THE LIST FIRST, whichever face it was on. Dropping it unconditionally and adding it
     back below is what makes changing your face one move rather than two that have to agree.
     `by` IS CAPPED AT FORTY by the backend, so on a very popular post you may not be in the list at
     all — removing an entry that is not there is a no-op, and adding one takes the list to 41 for
     this session only. Both are better than the count and the names disagreeing. */
  r.by = (r.by || []).filter(x => !x || norm(x.name) !== norm(USER.name));
  if (r.yours === emoji) { r.yours = ''; }
  else {
    r.yours = emoji; r.counts[at(emoji)]++; r.total++;
    r.by.push({ name: USER.name, emoji: emoji });
  }
  repaint();

  /* `personId` AS WELL AS `name`. The handler resolves the person with
     `findPerson(S(body.name), S(body.personId))`, which prefers the id and falls back to matching
     the name — and a name is an editable cell. Sent only the name, a reaction lands on whichever
     row happens to hold that name first, and stops finding anybody at all the moment somebody
     renames themselves. `check-post.js` now fails on any action that leaves it out. */
  send({ action: 'reactPost', name: USER.name, personId: (USER && USER.personId) || '',
         postId: id, emoji })
    .catch(err => {
      r.yours = before.yours; r.counts = before.counts; r.total = before.total;
      r.by = before.by;             // the fourth field, or the sheet disagrees after a failed save
      repaint();
      toast(String(err.message || 'Could not save that'));
    });
});

/* ---------- A POLL ------------------------------------------------------------------------------
   The counts are HIDDEN until you have voted. Not to be coy — seeing that eleven people said Yes
   before you answer changes what you answer, and a poll that anchors people is a poll that tells
   you what it already said.
--------------------------------------------------------------------------------------------- */
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
  const before = { yours: q.yours, counts: q.counts.slice(), total: q.total };

  /* Moved on screen before the server answers, the same as a like — and the whole poll is redrawn
     rather than one row, because a vote changes every percentage on it. */
  const at = i => q.options.indexOf(i);
  if (q.yours) { q.counts[at(q.yours)]--; q.total--; }
  if (q.yours === choice) { q.yours = ''; }
  else { q.yours = choice; q.counts[at(choice)]++; q.total++; }
  repaint();

  api({ action: 'votePoll',
    name: USER.name, personId: (USER && USER.personId) || '', postId: id, choice })
    .then(d => { if (d && d.error) throw new Error(d.error); })
    .catch(err => {
      q.yours = before.yours; q.counts = before.counts; q.total = before.total;
      repaint();
      toast(String(err.message || 'Could not save that vote'));
    });
});

/* SHARING. A post needs an address of its own or there is nothing to send — so each one gets
   `?post=` and the app opens on it. Without that, sharing sends somebody to the top of a feed to
   hunt for a photograph they were shown. */
on('share', el => {
  const id = el.dataset.id;
  const post = (DATA.posts || []).find(p => p.id === id);
  const url = location.origin + location.pathname + '?post=' + encodeURIComponent(id);
  const text = post && post.caption ? post.caption : '@family.';

  if (navigator.share) {
    navigator.share({ title: '@family.', text, url }).catch(() => {});
    return;
  }
  /* No share sheet — a desktop, or an older phone. Copying is the honest fallback; a dialog
     saying "sharing is not supported" helps nobody. */
  navigator.clipboard?.writeText(url)
    .then(() => toast('Link copied'))
    .catch(() => toast(url));
});

/* Arriving on a shared post. Read once at start-up and cleared, so a refresh later does not drag
   somebody back to a photograph they have finished with. */
function openSharedPost() {
  let id = '';
  try { id = new URLSearchParams(location.search).get('post') || ''; } catch {}
  if (!id) return;

  /* TURN THE DIAL TO IT, rather than scrolling. The feed is one post per screen now, so the post
     somebody was sent is a PAGE rather than a position down a column — and scrollIntoView on an
     absolutely-positioned page moves nothing at all, silently, which would look exactly like a
     shared link going to the top of the feed. */
  const n = feedPosts().findIndex(p => String(p.id) === String(id));
  /* ---------- THE FEED IS A COLUMN AND THIS WAS ASKING THE FUNNEL FOR IT ------------------------
     BOTH LINES SAID `goFor_('Posts')` while `PAGE.feed` was being set between them, which is the
     whole argument in one place: the page index belongs to the `feed` screen, so the screen is
     where this was trying to go. `Posts` is not a group any kind declares, so the filter matched
     nothing and the funnel was left holding an empty list behind a dead chip. */
  if (n < 0) { go('feed'); return; }
  PAGE.feed = n;                 // the screen is `feed`; `PAGE.posts` went nowhere — see PAGER
  go('feed');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelector(`[data-post="${CSS.escape(id)}"]`)?.classList.add('post-lit');
  }));
}

/* ---------- POSTING ------------------------------------------------------------------------------
   An admin picks a photograph and it goes to the Drive folder and the posts tab at once.

   RESIZED ON THE PHONE FIRST. A modern camera makes a 4MB picture, which as base64 is 5.5MB — over
   what Apps Script will take, and a minute of a library's wifi. Scaled to 1600px and re-encoded it
   is about 300KB, and nobody can tell on a phone screen.
--------------------------------------------------------------------------------------------- */
/* `shrink` lived here — it resized a chosen photograph in the browser before uploading it, so a
   4MB camera picture did not become a 4MB row. There is nothing to upload any more: a post is the
   ADDRESS of a picture, so the picture is never carried anywhere and never needs shrinking.
   Deleted rather than left unused. Dead code reads as a thing the app does, and the next person to
   wonder why posting is slow would have found a resizer and believed it. */

on('new-post', () => {
  openSheet('New post', `
  ${/* CHOOSE ONE THAT IS ALREADY THERE, before being offered the upload.
       Uploading writes to Drive; choosing only reads it. That difference matters because a
       deployment can hold read and not write — and for a photograph taken on a phone this is the
       shorter route anyway: share it to the folder from the camera roll and it is here. */''}
  <div id="post-from-folder"><p class="faint">Looking in the folder…</p></div>
  ${/* A LINK, not a file.
       Uploading meant this app had to be allowed to write to your Drive, which is a large
       permission to hold for the sake of one button — and the picture has to be somewhere with a
       link anyway before anybody but you can see it.
       So the picture stays where it is and the post keeps its address. The row above fills this in
       for anything already in the folder; anything else is a paste. */''}
  <label class="field"><span>link to the picture</span>
    <input id="post-link" placeholder="https://…" inputmode="url" autocomplete="off"></label>
  <div id="post-preview"></div>
  <label class="field"><span>caption</span>
    <input id="post-cap" placeholder="One line about it"></label>
  <label class="field"><span>where</span>
    <input id="post-loc" placeholder="Colliers Wood Library" list="known-places">
    <datalist id="known-places">
      ${(DATA.venues || []).map(v => `<option value="${esc(v.title)}">`).join('')}
    </datalist></label>
  <label class="field"><span>more, if you want it</span>
    <textarea id="post-body" placeholder="Optional"></textarea></label>
  <label class="field"><span>poll, if you want one</span>
    <input id="post-poll" placeholder="Yes, No, Maybe"></label>
  <label class="field"><span>posting as</span>
    <span class="btn-row" id="post-as" data-as="brand">
      <button class="btn quiet on" data-do="as" data-as="brand">
        ${esc(brand('name', '@family.'))}</button>
      <button class="btn quiet" data-do="as" data-as="me">${esc(USER ? USER.name : 'me')}</button>
    </span></label>
  <button class="btn" data-do="post-send">Post it</button>
  <p class="faint" id="post-said" style="margin:.6rem 0 0"></p>`);

  /* Fetched after the sheet is up, so the form is usable while the folder is being read. */
  send_({ action: 'folderFiles', name: USER.name, adminName: USER.name })
    .then(d => {
      const box = $('post-from-folder');
      if (!box) return;                                   // the sheet was closed
      if (!(d.files || []).length) {
        /* Nothing to choose, or no permission to look. Either way the upload below is the only
           route, and a picker with nothing in it is worse than no picker. */
        box.innerHTML = d.error
          ? `<p class="faint">Could not look in the folder: ${esc(d.error)}</p>`
          : `<p class="faint">Nothing new in the folder. Put a photograph in it from Drive and it
               will appear here.</p>`;
        return;
      }
      box.innerHTML = `<p class="faint">In the folder — tap one</p>
        <div class="pickers">${d.files.map(f => `
          <button class="picker" data-do="post-pick" data-id="${esc(f.id)}"
                  data-caption="${esc(f.caption)}" title="${esc(f.name)}">
            <img src="${esc(pic('https://drive.google.com/file/d/' + f.id + '/view'))}" alt=""
                 loading="lazy">
            <span>${esc(f.caption)}</span>
          </button>`).join('')}</div>`;
    })
    .catch(() => {
      const box = $('post-from-folder');
      if (box) box.innerHTML = '';
    });
});

/* WHO THE POST IS FROM.
   Two buttons emitting `data-do="as"`, and no handler of that name was ever registered — so the
   row read as a control, pressed like one, and did nothing. `post-send` reads the choice from the
   CONTAINER's `data-as`, which the markup sets to "brand" and nothing ever changed, so every post
   any admin has ever made has gone out as the business whichever button they pressed.
   The state lives on the container rather than on the pressed button, because that is where the
   sender already looks for it. */
on('as', el => {
  const row = $('post-as');
  if (!row) return;
  row.dataset.as = el.dataset.as || 'brand';
  row.querySelectorAll('[data-do="as"]').forEach(b => b.classList.toggle('on', b === el));
});

/* Choosing one. It does not upload anything — the picture is already in Drive and already shared,
   so all that is missing is the row. */
on('post-pick', el => {
  document.querySelectorAll('.picker').forEach(b => b.classList.toggle('on', b === el));
  /* Straight into the link box, not into a hidden field beside it. There is one place the picture
     is named, and you can see it and change it — a picker that stores its answer somewhere
     invisible is a second source of truth waiting to disagree with the one on screen. */
  const box = $('post-link');
  if (box) box.value = 'https://drive.google.com/file/d/' + el.dataset.id + '/view';
  /* The caption comes from the file's name, and only while the box is empty — somebody who has
     already typed one meant it. */
  const cap = $('post-cap');
  if (cap && !cap.value) cap.value = el.dataset.caption || '';
  showPostPreview();
});

/**
 * A PREVIEW OF WHATEVER THE LINK POINTS AT.
 *
 * It is the only way to find out, before posting, that a Drive link has not been shared — the
 * commonest fault by far, and one that looks fine to whoever pasted it because they can see the
 * picture and nobody else can.
 */
function showPostPreview() {
  const box = $('post-preview');
  const url = ($('post-link') || {}).value || '';
  if (!box) return;
  if (!url.trim()) { box.innerHTML = ''; return; }

  const src = pic(url.trim());
  box.innerHTML = `<img src="${esc(src)}" alt=""
    style="width:100%;margin:.2rem 0 .6rem;background:var(--sunk)">`;
  const img = box.querySelector('img');
  if (!img) return;                 // nothing to watch load, so nothing to report about it
  const said = $('post-said');
  img.onload = () => { if (said) said.textContent = ''; };
  img.onerror = () => {
    box.innerHTML = '';
    if (said) said.textContent = 'That link does not show a picture. If it is in Drive, it needs '
      + 'to be shared with anyone who has the link.';
  };
}

document.addEventListener('input', e => {
  if (e.target.id === 'post-link') showPostPreview();
});

on('post-send', el => {
  const link = (($('post-link') || {}).value || '').trim();
  const said = $('post-said');
  if (!link) { if (said) said.textContent = 'A link to the picture, first.'; return; }
  el.disabled = true;
  if (said) said.textContent = 'Posting…';

  api({ action: 'addPost',
    name: USER.name, adminName: USER.name, personId: (USER && USER.personId) || '',
    /* THE ADDRESS OF THE PICTURE, and nothing else. No bytes go anywhere: the picture stays where
       it already is, which is the only reason this app no longer needs permission to write to your
       Drive at all. */
    image: link,
    caption: ($('post-cap') || {}).value || '',
    location: ($('post-loc') || {}).value || '',
    poll: ($('post-poll') || {}).value || '',
    postAs: ($('post-as') || {}).dataset?.as || 'brand',
    body: ($('post-body') || {}).value || '' })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet(); toast('Posted'); load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not post that');
    });
});

/* ---------- EDITING A POST -----------------------------------------------------------------------
   Admin only, and the same shape as editing a resource: id-keyed, only the fields shown are sent,
   and delete is a flag rather than a removed row.

   The row is REFERENCED. Likes, votes and reactions are all rows elsewhere pointing at this
   post_id — take the row away and every one of them points at nothing, which renders as a like
   count on a post that is not there.
--------------------------------------------------------------------------------------------- */
on('post-edit', el => {
  const p = (DATA.posts || []).find(x => x.id === el.dataset.id);
  if (!p) return;
  /* The options only, not the counts. What the site holds is what a phone was sent; the sheet's
     cell is the source, and the two are the same list while nobody has voted. */
  const opts = p.poll ? (p.poll.options || []).join(', ') : '';
  const voted = !!(p.poll && p.poll.total);

  openSheet('Edit post', `
    ${p.image ? `<img src="${esc(pic(p.image))}" alt=""
         style="width:100%;margin-bottom:.7rem">` : ''}
    <label class="field"><span>caption</span>
      <input id="pe-cap" value="${esc(p.caption || '')}"></label>
    <label class="field"><span>more</span>
      <textarea id="pe-body">${esc(p.body || '')}</textarea></label>
    <label class="field"><span>where</span>
      <input id="pe-loc" value="${esc(p.location || '')}" list="known-places">
      <datalist id="known-places">
        ${(DATA.venues || []).map(v => `<option value="${esc(v.title)}">`).join('')}
      </datalist></label>
    ${/* The date is editable because the feed is ORDERED by it. A post that arrived in the folder
          with the wrong timestamp sits in the wrong place for ever otherwise, and the only way to
          fix it was to open the spreadsheet. */''}
    <label class="field"><span>posted on</span>
      <input id="pe-when" value="${esc(p.when || '')}" placeholder="DD/MM/YYYY HH:MM:SS"></label>
    ${/* A VOTE IS STORED AGAINST THE WORDS. Rename an option and every vote cast for it points at
          something that no longer exists — the count survives, its option does not, and the
          percentages quietly stop adding up. Nothing throws, which is the worst version of it. So
          the options are editable only while nobody has voted. */''}
    <label class="field"><span>poll</span>
      <input id="pe-poll" value="${esc(opts)}" placeholder="Yes, No, Maybe" ${voted ? 'disabled' : ''}>
      ${voted ? `<span class="faint">${p.poll.total} vote${p.poll.total === 1 ? '' : 's'} cast —
        the options are fixed now. A vote is stored against the words, so changing them would
        strand it.</span>` : ''}</label>

    <label class="check">
      <input type="checkbox" id="pe-pin" ${p.pinned ? 'checked' : ''}>
      <span class="box"></span>
      <span>Pin to the top<br><span class="faint">Above everything, whatever its date.</span></span>
    </label>

    <button class="btn" data-do="post-save" data-id="${esc(p.id)}">Save</button>
    <div class="btn-row" style="margin-top:.5rem">
      ${/* Only Delete. The button used to say "Restore" on a post that was already deleted — and
             a deleted post is not in the feed now, so there is no card to open to reach it. A
             label that cannot be shown is the `arrive()` fault in miniature. */''}
      <button class="btn danger" data-do="post-delete"
              data-id="${esc(p.id)}" data-on="">Delete</button>
    </div>
    <p class="faint" id="pe-said" style="margin:.6rem 0 0">
      It disappears from the feed. Nothing is destroyed — the picture stays in Drive, the
      reactions stay counted, and the row stays on the posts tab. To bring one back, set its
      <code>active</code> cell to TRUE.</p>`);
});

/* LETTING ONE THROUGH, or turning it down. `data-on` carries which — an empty string is false to
   `TRUE_` on the backend, so one handler covers both and there is no second name to keep in step. */
on('post-approve', el => {
  const on = el.dataset.on === '1';
  /* TWO PRESSES, NOT A confirm() — the same pattern as `post-delete` below, and for the same reason:
     an OS dialog cannot use a single word this app chose, and on a phone it reads as the page having
     been taken over. The button says what will happen instead. */
  if (!on && !sure_(el, 'Turn it down?')) return;
  el.disabled = true;
  api({ action: 'approvePost', adminName: USER.name, name: USER.name,
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
  const said = $('pe-said');
  const p = (DATA.posts || []).find(x => x.id === el.dataset.id);
  const voted = !!(p && p.poll && p.poll.total);

  /* A date typed into the wrong shape sorts the post to the bottom of the feed and gives no hint
     why. Checked here, where it can still be corrected. */
  if (v('pe-when') && !parseWhen(v('pe-when'))) {
    if (said) said.textContent = 'That date is not DD/MM/YYYY.';
    return;
  }

  const fields = {
    caption: v('pe-cap'), body: v('pe-body'), location: v('pe-loc'),
    posted_on: v('pe-when'), pinned: ($('pe-pin') || {}).checked,
  };
  /* Left out ENTIRELY rather than sent unchanged — the server tests whether the field was sent at
     all, and sending it back identical would still count as an attempt to change it. */
  if (!voted) fields.poll = v('pe-poll');

  el.disabled = true;
  if (said) said.textContent = 'Saving…';
  api({ action: 'editPost',
    name: USER.name, adminName: USER.name, id: el.dataset.id, fields })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet(); toast('Saved'); load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not save that');
    });
});

/* TWO PRESSES. Not a browser confirm() — it is the one dialogue on a phone that looks like the
   page has been taken over by something else, and it cannot say what is about to happen in the
   words this app uses. The button becomes the question, and a press somewhere else leaves it as
   it was. */
on('post-delete', el => {
  const restoring = !!el.dataset.on;
  if (!el.dataset.sure && !restoring) {
    el.dataset.sure = '1';
    el.textContent = 'Really delete?';
    setTimeout(() => { if (el.dataset.sure) { delete el.dataset.sure; el.textContent = 'Delete'; } }, 4000);
    return;
  }
  const said = $('pe-said');
  el.disabled = true;
  if (said) said.textContent = restoring ? 'Restoring…' : 'Deleting…';

  api({ action: 'deletePost',
    name: USER.name, adminName: USER.name, id: el.dataset.id, on: restoring })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet();
      toast(restoring ? 'Back on the feed' : 'Deleted — still there, switched off');
      load();
    })
    .catch(err => {
      el.disabled = false; delete el.dataset.sure;
      el.textContent = restoring ? 'Restore' : 'Delete';
      if (said) said.textContent = String(err.message || 'Could not do that');
    });
});


/* ==================================================================================================
   THE COLUMNS
   These are not screens coming back unchanged. `screen('posts')` was one column doing two jobs —
   reading and posting — and a phone puts making a thing to the LEFT of looking at things. So it
   split, and the two halves are these.
================================================================================================== */

/* ---------- MAKING ONE ---------------------------------------------------------------------------
   THE COMPOSER AND NOTHING ELSE. Every card added here is a card between somebody and the thing
   they swiped left to do — and this is the one column reachable by accident, so what it shows when
   you land on it wrongly has to be harmless and obvious. An empty box is both.

   SIGNED OUT IT SAYS SO, rather than offering a control that will refuse. `new-post` needs a user,
   and a button that refuses is worse than one that was never there. */
/* ONE PAGE, AND IT IS THE CAMERA. It was the camera and then a card describing a photograph — and
   that second card had already been deleted from the top of the feed for being a duplicate of this
   column. Two of it on one column was one more than two of it across two. The composer it offered
   is a button on the camera now; see `cameraCard`. */
screen('make', () => pages('make', USER
  ? [cameraCard()]
  : [`<div class="card"><h3>New post</h3>
      <p class="sub">Sign in to post — your account is the last screen to the right.</p></div>`]));

/* ---------- READING THEM -------------------------------------------------------------------------
   `postsBlocks` UNCHANGED, and that is the point: the feed under `What for · Posts` and the feed on
   this column are the same function and cannot drift. One is a door, the other is an answer.

   THE COMPOSER IS NOT REPEATED AT THE TOP. It is one swipe left from anywhere in the feed, always
   in the same direction — which is what a column gives it that a card at the top of a list cannot,
   because a card at the top of a list moves as the list grows. */
screen('feed', () => pages('feed', postsBlocks()));


/* ==================================================================================================
   REELS AND MESSAGES — the last two columns on the layout sheet
================================================================================================== */

/* ---------- REELS --------------------------------------------------------------------------------
   ONE FACT PER SCREEN, SNAPPED. `scroll-snap` does the physics, so there is no listener, no
   transform and no drag maths — and the momentum matches every other scroll on the phone because it
   IS every other scroll on the phone.

   THIS IS THE ONE SCREEN WHERE A PAGER IS RIGHT, and worth saying because the same shape is wrong
   on the feed: a feed is read by flicking past six things, a reel is watched one at a time.

   NO `.pane`. Every other screen puts its cards on one, and a pane sets `touch-action: none` so the
   grid can own the vertical drag. Here the drag IS the scroll.

   THE PHOTOGRAPH IS NOT FETCHED HERE. `pic` is a search term, not a URL — the picture is found on
   Wikimedia Commons when the slide comes into view, which is `reelsWatch_` below. A gradient is the
   floor, not a placeholder: fifty-eight slides that each flash grey first is a column that looks
   broken while it works. */
/* ---------- AND IT WAS EMPTY, FOR EVERYBODY, SINCE THE DAY IT WAS WRITTEN --------------------------
   THIS READ `DATA.facts` AND NOTHING ELSE, AND THAT TAB HAS NEVER HAD A ROW IN IT. So the column
   showed "Nothing here yet. Add a row to the facts tab" to every visitor, while fifty-eight facts
   sat in `FEED_FACTS` in chess.js being shown by the "One more thing" widget two columns over.
   Nothing was broken — measured in a browser: the tab is there, `go('reel')` works, no errors, 0
   facts sent and 58 in the code. **A column that works and has nothing to show is read as a column
   that does not work**, which is the whole of the report that started this.

   `factsNow_` IS THE FIX AND IT IS THE HOUSE RULE. An empty or broken sheet must still produce a
   working site; a tab with no rows leaves the code's copy alone, which is `libraryExtras_`'s rule
   pointed the other way. The sheet still wins the moment it has a row, so nothing about the
   migration is undone — it just stops being a cliff. */
screen('reel', () => {
  if (!LOADED) return `<section class="page"><div class="pane">${skeleton()}</div></section>`;
  /* ---------- CLIPS ONLY, AND THE FACTS ARE NOT A FALLBACK ---------------------------------------
     REPORTED FROM A SCREENSHOT OF THIS COLUMN: "no more factoids on this yh? its just the videos".
     The column opened on a green gradient reading "Notre-Dame took nearly 200 years", which is a
     perfectly good fact and is not a reel.

     THE TWO SURFACES WANT DIFFERENT HALVES OF ONE LIST, which is why this is a filter here and not
     a second source. `factsNow_` still answers both — the sheet wins over the code, a clip row is a
     row with a `clip` — and the "One more thing" widget goes on dealing the whole deck. Splitting
     the data instead would be two tabs, two empty states and two things to keep in step, which is
     the `needs_print` / `print_required` lesson one more time.

     AND A COLUMN WITH NO CLIPS SAYS SO RATHER THAN FILLING ITSELF WITH FACTS. Showing the next best
     thing is exactly how this screen came to be showing the wrong thing. */
  const facts = clipsNow_();
  const rows = factsNow_().length;
  if (!facts.length) {
    return `<section class="page"><div class="pane"><div class="card">
      <h3>Reels</h3>
      <p class="sub">No clips yet. Add a row to the <b>facts</b> tab with a <b>clip</b> — a Google
        Drive file id, or a link to a video. The words are optional.</p>
      ${/* ---------- WHICH OF TWO VERY DIFFERENT THINGS THIS IS ------------------------------
            "No clips yet" WAS BOTH ANSWERS AT ONCE and I could not tell them apart from a
            screenshot of it. A column that has looked at fifty-eight reel rows and found no clip
            on any of them is a data problem; a column that has looked at NOTHING is a code
            problem — chess.js holds the built-in list, and if the browser is serving a copy of it
            from before clips existed, or did not get it at all, the count is the only thing on
            the screen that says so.

            This repository's oldest fault, one more time, and this is the fifth entry that names
            it: "I did not manage to look" printed as "I looked and there was nothing there".
            `nothingHere` gives the funnel a reason and a `Try again` for exactly this; a count is
            the cheap version of the same honesty. */''}
      <p class="faint">${rows
        ? `Looked at ${rows} reel row${rows === 1 ? '' : 's'} and none of them has a clip.`
        : 'There are no reel rows at all — not even the built-in ones. That is this page\'s own '
          + 'code missing rather than an empty sheet, so open the site with <b>?dev</b>, which '
          + 'clears the held copies and fetches every file fresh.'}</p>
    </div></div></section>`;
  }
  /* ---------- ON A CARD, LIKE EVERY OTHER SCREEN IN THE APP ---------------------------------------
     THIS WAS THE ONE SCREEN WITH NO PANE. `pages()` and `stack()` both wrap what they are given in
     `.page > .pane`, and all eight other screens go through one of them; this returned its own
     markup and drew straight onto the black. The note that defended it was about the SCROLL — a
     pane sets `touch-action: none` — and both are available: the card is ordinary, and `.reels`
     inside it keeps `touch-action: pan-y`, which is what actually made the swipe work.

     THE SLIDES ARE THE "ONE MORE THING" WIDGET'S OWN MARKUP. They used to be `.reel .over`, a
     second set of rules describing the same object as `.feed-art` two columns over — a heading, a
     subject, a paragraph and a credit over a picture, written twice and drifting. `feedSlide` is
     the one renderer now, so a change to how a fact looks lands on both surfaces at once. That is
     the same argument `factsNow_` already settles about where a fact COMES from, one layer up.
     (`.reels` keeps its own scroller and its own snap: how a column of slides behaves is not how a
     slide looks, and the widget is one card with no scroll at all.) */
  REEL_SHOWN = 0;
  return `<section class="page"><div class="pane"><div class="card is-widget">
    <div class="widget-slot">
      <div class="card"><h3>Reels</h3>
      <div class="reels" id="reels">${reelBatch_(REEL_FIRST)}</div>
      </div>
    </div>
  </div></div></section>`;
});

/* ---------- IT GOES DOWN FOR EVER, AND THE DECK IT DRAWS FROM ALREADY DID ------------------------
   THE OLD COLUMN DREW ALL FIFTY-EIGHT AND STOPPED. Fifty-eight is a lot of slides and it is still a
   bottom — you reach it, and the column that is supposed to be endless is a list you have finished.
   It was also fifty-eight `.reel-art` boxes and fifty-eight observed elements on the first paint of
   a screen showing one of them.

   `feedItem(n)` HAS NEVER HAD AN END. The "One more thing" widget has been walking it forwards
   since it was written — its own comment says "No end to reach, so no wrapping and no going below
   the first" — because `feedShuffle` deals another pass whenever the deck runs out, seeded by the
   day and by how many passes have gone before, so a second lap today is a different order rather
   than the same fifty-eight in the same run. The infinite column is that function read one index at
   a time. Nothing new decides what comes next.

   THAT DECK IS THE WIDGET'S NOW AND NOT THIS COLUMN'S — see the note in the screen above. What is
   left of "for ever" here is a LAP: the clips in the order they are written, then the same clips
   again. With two of them that is plainly a repeat rather than an endless supply, and saying so is
   better than a column that stops dead two flicks in and reads as broken. It stops being a repeat
   the moment there are more clips, with nothing here to change.

   AND IT IS BOUNDED, because a video is not a div. Every slide that has been watched holds a
   decoded `<video>` with a `src` on it, so a column that appended for ever would be a megabyte a
   flick with nothing ever released. `REEL_MAX` is the stated ceiling — thirty laps of two clips,
   further than anybody scrolls — rather than a leak nobody measures until a phone gets hot. */
const REEL_FIRST = 3;      // on the first paint. One is on screen; the rest are the next flick.
const REEL_MORE  = 3;      // appended when the last one is two slides away.
const REEL_MAX   = 60;     // the ceiling, in slides. See above.
let REEL_SHOWN = 0;
let REEL_IO_ART = null;
let REEL_IO_PLAY = null;

/* ONE READER FOR "WHICH CLIPS", and this function was a second one. It filtered `factsNow_` while
   the screen above asked `clipsNow_`, and the two disagree exactly when the sheet has an ordinary
   fact row in it: `factsNow_` hands back the sheet, `clipsNow_` falls through to the built-ins, and
   the column drew its heading, its scroller, and no slides at all. Caught by a mutant putting one
   typed fact in the payload — `{"slides":0}` under a card reading just "Reels". A second reader of
   one thing is a second chance to disagree about it, which is the sentence this repository already
   carries about `documents_()`, `paperIdOf_` and `factsNow_` itself. */
function reelItem_(n) {
  const clips = clipsNow_();
  if (!clips.length || n >= REEL_MAX) return null;
  return clips[n % clips.length];
}

function reelBatch_(count) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const it = reelItem_(REEL_SHOWN);
    if (!it) break;
    /* `--h` IS THE SLIDE'S OWN HUE and `feedSlide` paints its own gradient from the subject, so
       this is only the frame the snap happens in. The two were one element before and the reel had
       to know what a fact looks like to draw it. */
    out += `<div class="reel" data-reel="${REEL_SHOWN}">${feedSlide(it)}` +
      `<button class="btn tiny reel-sound" data-do="reel-sound">Sound off</button></div>`;
    REEL_SHOWN++;
  }
  return out;
}

/* ---------- TWO OBSERVERS, ASKING DIFFERENT QUESTIONS ---------------------------------------------
   ONE WATCHES THE BOTTOM and one watches what is being played. The first wants "is this slide
   nearly on screen", answered two hundred pixels early so the next lap is built before anybody is
   waiting for it; the second wants "is this the slide being watched", answered every time that
   changes, for as long as the column is open. One observer doing both would either build late or
   leave a clip playing three slides above with its sound on.

   THE PHOTOGRAPH FETCH WAS HERE AND IS GONE WITH THE FACTS. It asked Wikimedia Commons for a
   picture off the slide's `pic`, one screen ahead — right when a slide could be a fact, and dead
   the moment every slide is a clip, because `reelItem_` cannot return anything without one. A
   reader left standing over a condition that is now permanently false is the shape this file
   records under `resource_type` in `VOCAB` and under `libraryInto_`'s dead `kind === 'paper'`
   guard: it reads as live and does nothing. `feedPicture` is untouched and still draws the "One
   more thing" widget, which is where the facts went. */
function reelsWatch_() {
  const host = $('reels');
  if (!host || !window.IntersectionObserver) return;

  REEL_IO_ART = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    /* MORE SLIDES, BEFORE THE BOTTOM RATHER THAN AT IT. Appending when the last one is reached puts
       a blank half-second where the flick should have been; two early is the same cost paid while
       nobody is waiting. */
    if (Number(e.target.dataset.reel) >= REEL_SHOWN - 2) reelMore_(host);
  }), { root: host, rootMargin: '200px 0px' });

  /* THE ONE BEING WATCHED PLAYS AND THE REST DO NOT. `0.6` rather than any intersection: the snap
     means a slide is either most of the column or a sliver of it, and a sliver is the one you have
     just flicked away from. */
  REEL_IO_PLAY = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && e.intersectionRatio > 0.55) reelPlay_(v);
    else { try { v.pause(); } catch {} }
  }), { root: host, threshold: [0, 0.55, 0.9] });

  reelObserve_(host);
}

function reelObserve_(host) {
  host.querySelectorAll('.reel:not(.is-watched)').forEach(el => {
    el.classList.add('is-watched');
    if (REEL_IO_ART) REEL_IO_ART.observe(el);
    const v = el.querySelector('.feed-vid');
    if (v && REEL_IO_PLAY) REEL_IO_PLAY.observe(v);
  });
}

function reelMore_(host) {
  const html = reelBatch_(REEL_MORE);
  if (!html) return;
  host.insertAdjacentHTML('beforeend', html);
  reelObserve_(host);
}

/* ---------- A CLIP, AND THE ROUTE THAT CANNOT BE TESTED FROM HERE --------------------------------
   THE `src` IS SET HERE AND NOT IN THE MARKUP, so a clip five slides down is not being downloaded
   while you watch the first one. Seven megabytes each, and the browser decides for itself how much
   of a `preload="none"` video to fetch anyway.

   AND IF IT WILL NOT PLAY, GOOGLE'S OWN PLAYER DOES. `uc?export=download` hands back the bytes,
   which is the only form a `<video>` can mute, loop and pause; it is also undocumented and every
   Google host is blocked from the environment this was written in, so whether a real browser gets
   the file or a redirect it will not follow is a fact the live site settles. `error` is the
   browser saying which — and the `/preview` iframe that replaces it is the documented embed,
   with Google's chrome and a play button instead of an autoplay, which is a worse reel and a
   working one. A column that shows a black rectangle is neither. */
function reelPlay_(v) {
  if (!v || v.dataset.dead) return;
  if (!v.getAttribute('src')) {
    const src = clipSrc_(v.dataset.clip);
    if (!src) return;
    /* THE SCRIM AND THE WHITE TEXT ARRIVE WITH THE FIRST FRAME, for the reason the photograph slide
       waits for `img.onload`: until then the slide is its own gradient and its subject's initial,
       which is a finished thing rather than a hole. */
    v.addEventListener('loadeddata', () => {
      const art = v.closest('.feed-art');
      if (art) art.classList.add('has-photo');
    }, { once: true });
    v.addEventListener('error', () => {
      if (v.dataset.dead) return;
      v.dataset.dead = '1';
      const frame = clipFrame_(v.dataset.clip);
      const slide = v.closest('.reel');
      if (!frame || !slide) return;
      v.outerHTML = `<iframe class="feed-vid" src="${esc(frame)}" allow="autoplay"
        referrerpolicy="no-referrer" title="Reel"></iframe>`;
      const btn = slide.querySelector('.reel-sound');
      if (btn) btn.remove();
    }, { once: true });
    v.src = src;
  }
  /* A BLOCKED AUTOPLAY IS A REJECTED PROMISE AND NOT AN ERROR. Every browser refuses to start an
     unmuted video nobody has tapped, and one that has been unmuted by the button below and then
     scrolled back to is exactly that case. Caught and dropped: the slide is on screen with its
     first frame showing, which is what a paused reel looks like. */
  const p = v.play();
  if (p && p.catch) p.catch(() => {});
}

/* SOUND IS OFF UNTIL IT IS ASKED FOR, because a column that starts talking the moment it opens is a
   column nobody opens twice — and because a muted video is the only kind a browser will start by
   itself. The button says the state it is IN, not the state it would move to: "Sound off" on a
   muted clip is what everything else in this app does with a switch. */
on('reel-sound', (el) => {
  const slide = el.closest('.reel');
  const v = slide && slide.querySelector('video.feed-vid');
  if (!v) return;
  v.muted = !v.muted;
  el.textContent = v.muted ? 'Sound off' : 'Sound on';
  if (!v.muted) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
});

/* ---------- MESSAGES -----------------------------------------------------------------------------
   THE TAB IS EMPTY AND THIS SAYS SO. An empty screen that is WIRED is a week ahead of one that looks
   right and is not: the backend already has sendMessage, messages, readMessage and flagMessage, and
   the only thing missing is rows.

   ONE ROW PER CONVERSATION, the same row a resource and a person use. One shape doing three jobs is
   most of why this app stays quiet. */
screen('dm', () => stack('dm', dmCards_()));

/* ---------- THIS SCREEN READ A KEY THAT HAS NEVER EXISTED ----------------------------------------
   IT SAID "No messages." TO EVERYBODY, FOR EVER, AND IT WAS NOT A BUG IN THE BACKEND. It took
   `DATA.messages`. Messages are a POST action, not a payload key, because a conversation is private
   and the GET payload goes out whole to whoever asks for it — so the backend is RIGHT not to send
   them, and `|| []` turned the absence into an empty inbox. The exact fault CLAUDE.md names as the
   worst one here, and `check-payload.js` now reports it.

   WORSE: IT HAD ALREADY BEEN FOUND AND FIXED ONCE. me.js says "`DATA.messages` — which both readers
   below took — is not a key the payload has ever held", and fixed the two it could see. This was a
   THIRD reader, in another file, and the fix never reached it. That is the disease in this codebase
   in one function: not a wrong idea, a right idea that did not arrive everywhere.

   THREE FAULTS IN EIGHT LINES, because the other two were hiding behind the first. It also sorted on
   `m.sentAt` and tested `m.readAt`; the handler sends `at` and `read`. Fixing only the key would have
   produced cards in arbitrary order, every one of them marked unread — a different silent wrong
   answer, and one that looks enough like working to survive.

   NOTHING NEW IS BUILT HERE. `loadMessages`, `messageThreads_` and `messagesHtml_` are me.js's, are
   loaded before this file, and are what the widget already uses. A fourth copy of "how to show a
   message" is how this happened in the first place.
--------------------------------------------------------------------------------------------- */

/* ASKED ONCE, NOT ONCE PER PAINT — AND `MESSAGES` CANNOT BE THE FLAG THAT SAYS SO.
   `loadMessages` assigns MESSAGES on success and deliberately does NOT on failure, so an unreachable
   backend leaves whatever was there rather than reading as an empty inbox. Right for the widget, and
   a trap here: if "MESSAGES is still null" were the condition to fetch, one failed request would
   paint, re-ask, fail, paint, re-ask — a loop against the backend for as long as the tab was open.
   This records that the ASKING happened, which is the fact the redraw actually depends on. */
let DM_ASKED = false;

function dmCards_() {
  if (!USER) return [`<div class="card"><h3>Messages</h3>
    <p class="sub">Sign in to see your messages.</p></div>`];
  if (!LOADED) return [skeleton()];

  if (!DM_ASKED) {
    DM_ASKED = true;
    /* `loadMessages` swallows its own failures and always resolves, so there is no rejection path to
       handle — and the repaint must happen either way, or a failed first fetch leaves the skeleton
       on screen for ever with nothing saying why. */
    loadMessages().then(() => paint('dm'));
    return [skeleton()];
  }

  const threads = messageThreads_();
  const head = `<div class="card"><h3>Messages</h3>
    <button class="btn" data-do="dm-refresh">Refresh</button></div>`;
  if (!threads.length) return [`<div class="card"><h3>Messages</h3>${emptyMessages_}</div>`];

  /* ONE CARD PER CONVERSATION, most recent first — `messageThreads_` has already done both, and
     doing it again here is a second copy of the ordering rule to get wrong later. */
  /* ---------- DRAWN IS READ, ON THIS SCREEN ONLY -------------------------------------------------
     EVERY THREAD IS OPEN HERE. The Messages column is not a list of conversations to tap into — it
     is the conversations, one card each, with the messages in them. So drawing this screen IS
     somebody reading them, and `readMessage` is owed for each one.

     SAFE TO CALL FROM A DRAW, which is normally the wrong place for a round trip. `markRead_` sets
     `read` on the message the moment it asks, so a second paint before the reply finds nothing left
     to send and a failed one puts it back. */
  threads.forEach(t2 => markRead_(t2.msgs));
  return [head].concat(threads.map(t => `<div class="card${t.unread ? ' unread' : ''}">
      <h3>${esc(t.name)}${t.unread ? ` <span class="faint">(${t.unread})</span>` : ''}</h3>
      ${messagesHtml_(t.msgs)}
    </div>`));
}

/* THE ONLY WAY BACK TO THE SERVER ONCE THE SCREEN IS UP. The fetch above runs once, so without this
   a message that arrived after the tab was first opened would not appear until a reload. */
on('dm-refresh', () => { loadMessages().then(() => paint('dm')); });
