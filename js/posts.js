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

screen('posts', () => {
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

  if (!posts.length && !festive.length) {
    return nothingHere('Nothing posted yet.<br><span class="faint">Add a row to the posts tab '
      + 'with an image link and a caption.</span>');
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
  const cards = posts.map((p, i) => {
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
        ${/* One glyph, at the end of the row where it does not compete with the picture. A post is
              looked at a hundred times for every time it is edited, so the control is small. */''}
        ${isAdmin() ? `<span class="post-edit" data-do="post-edit"
             data-id="${esc(p.id)}">⋯</span>` : ''}
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
        ${/* THE SAME MARK AS EVERY OTHER SHARE. This was a ↗ — a character, so whatever arrow the
              phone happened to have, at whatever weight, next to marks that are drawn. Sharing a
              post and sharing a booking are the same act and now look it. */''}
        <button class="post-act" data-do="share" data-id="${esc(p.id)}"
          title="Share this post" aria-label="Share this post">${tileIcon_('share')}</button>
      </div>

      ${/* The name leads the caption, as it does everywhere — but ONLY when there is a caption.
            Without a caption it was printing the name on its own under the picture, which is the
            name said twice and answers nothing. */''}
      ${p.caption ? `<p class="post-cap"><b>${esc(who)}</b> ${mark(p.caption)}</p>` : ''}
      ${p.poll ? poll(p) : ''}
      ${p.body ? `<p class="note">${mark(p.body)}</p>` : ''}
      ${p.when || p.at ? `<p class="faint post-when">${esc(ago(p.at || p.when))}</p>` : ''}
      ${/* THE DECISION, on the post itself. Not on a list somewhere else: you are already looking
            at the photograph and the caption, which is everything the decision is about, and a
            separate approvals screen is a second place to remember to visit. */''}
      ${(p.waiting || p.refused) && isAdmin() ? `<div class="btn-row post-ok">
          <button class="btn" data-do="post-approve" data-id="${esc(p.id)}" data-on="1">Put it up</button>
          ${p.refused ? '' : `<button class="btn quiet" data-do="post-approve"
             data-id="${esc(p.id)}" data-on="">Not this one</button>`}
        </div>` : ''}
      ${p.waiting && !isAdmin() ? `<p class="faint">Waiting to be checked. Only you can see it.</p>` : ''}
    </article>`;
  });

  /* ANYBODY SIGNED IN. It was admin-only, which meant the one screen the whole family looks at was
     the one screen only you could add to. What differs is what happens after — see the card. */
  if (USER) cards.unshift(newPostCard());
  /* AFTER THE ＋, BEFORE THE POSTS. The ＋ is a control and belongs at the very top; the festive
     cards are the most perishable thing on the screen and belong next. */
  festive.reverse().forEach(c => cards.splice(USER ? 1 : 0, 0, c));
  return pages('posts', cards);
});

/* The first page of the feed, for an admin. A card rather than a glyph: it can say what it does,
   which a ＋ in a corner cannot, and it is the width of a thumb rather than the width of a
   fingernail. */
function newPostCard() {
  /* THE CARD SAYS WHAT WILL HAPPEN TO IT, and says it BEFORE anybody posts rather than after.
     A client who posts and then finds nothing on the feed assumes it failed and posts again; one
     who was told it gets checked first knows exactly what is going on and waits.
     Nobody is being told off here — "we check them first" is a sentence about the app, not about
     the person reading it. */
  return `<div class="card">
    <div class="tap" data-do="new-post">
      <h3>＋ New post</h3>
      <p class="sub">A photograph, a line about it, and a poll if you want one.${
        isAdmin() ? '' : '<br>We check posts before they go up.'}</p>
    </div>
  </div>`;
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
  if (!USER) { toast('Sign in to react'); go('me'); return; }
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

  const before = { yours: r.yours, counts: r.counts.slice(), total: r.total };
  const at = e => r.emoji.indexOf(e);
  if (at(emoji) < 0) return;

  /* Moved before the server answers. The whole row is redrawn rather than one face, because
     changing your reaction moves two counts at once. */
  if (r.yours) { r.counts[at(r.yours)]--; r.total--; }
  if (r.yours === emoji) { r.yours = ''; }
  else { r.yours = emoji; r.counts[at(emoji)]++; r.total++; }
  repaint();

  send({ action: 'reactPost', name: USER.name, postId: id, emoji })
    .catch(err => {
      r.yours = before.yours; r.counts = before.counts; r.total = before.total;
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
    name: USER.name, postId: id, choice })
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
  if (n < 0) { go('posts'); return; }
  PAGE.posts = n;
  go('posts');
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
    name: USER.name, adminName: USER.name,
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
  if (!on && !confirm('Not put this one up?\n\nThe person who posted it is told, and the post is '
    + 'kept so you can look at it again.')) return;
  el.disabled = true;
  api({ action: 'approvePost', adminName: USER.name, name: USER.name,
        id: el.dataset.id, on: on ? 'TRUE' : 'FALSE' })
    .then(d => {
      if (d && d.error) { el.disabled = false; toast(d.error); return; }
      toast(on ? 'It is up' : 'Not put up');
      load();
    })
    .catch(() => { el.disabled = false; toast('Could not reach the server.'); });
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
