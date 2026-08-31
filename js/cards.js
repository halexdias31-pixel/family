/* ==================================================================================================
   @family. — cards.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   cards.js is number 6 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* The app STARTS at the very bottom of this file, not here.

   It used to start here, and here is above every `screen(...)` registration — so `go()` ran with
   an empty SCREENS table and `paint()` fell through to its own "Nothing here yet", on every tab,
   until the first fetch came back and repainted. The skeleton was never reached once, on any
   device: the thing it was covering had already been replaced by a sentence saying there was
   nothing to cover.

   Nothing marks the boundary in a file that is read top to bottom, which is exactly why the
   start belongs at the end — where everything it needs is behind it by construction rather than
   by somebody remembering. */

/* ================================================================================================
   THE FIRST SCREEN — Who.

   Tutors and venues, which is the simplest real screen: two lists of things the backend already
   sends. It is here to prove the shell rather than to be finished, and to be the shape every
   other screen copies:

     · a screen is ONE function returning markup
     · it never touches the tab bar, the header or another screen
     · anything needing the whole display opens a sheet
     · anything pressable carries `data-do`, so the markup can be thrown away and redrawn
================================================================================================ */

/* ---------- WHAT A PERSON, A PLACE AND A SUBJECT LOOK LIKE ---------------------------------------
   The Find SCREEN is gone — it and Stuff were two tabs asking the same question, and the funnel
   can hold both lists now that it skips whatever a kind cannot answer. What survives is the three
   card shapes, because a tutor still has to look like a tutor.

   `findItems`, `findPageHtml`, `findBrowse`, `findPageCount` and the `find-kind` handler went with
   the screen. Every one of them was a smaller, worse copy of something the funnel already does:
   a browse page with three counts, a pager, and a filter that could only ever ask one question.
--------------------------------------------------------------------------------------------- */
/** One card. The three shapes, each carrying the class that colours its name. */
/* ---------- YOU, AS A CARD -------------------------------------------------------------------------
   THE ACCOUNT WAS A LIST OF ROWS ON `You` — name, role, credits, ticks, email, where — with the
   things you can do about it as three separate tap-cards further down the column. Everybody else in
   this app is a card: a tutor is a pass, a friend is a card, a venue is a card. You were a settings
   screen.

   ONE CARD, AND THE ACTIONS ARE ON IT, which is the rule every other card in the app already
   follows. Editing your details, adding your child and opening your wardrobe were three cards you
   scrolled past; they are marks in the row under your own face now.

   IT IS ONLY EVER YOU. There is no people directory on the device and there should not be one from
   here: the `people` tab carries PINs, bank details, addresses and dates of birth, and the backend
   deliberately sends only `tutors` — filtered to public facts — and `students`. Everything on this
   card is already on this device because it is yours. */
/* NO `cardTiles_` CALL HERE. `stuffCard` in find.js appends the action row to every card it draws,
   and this card is drawn through it — the `me` kind is registered in `KINDS` like any other. This
   builder kept the call it had from before the actions were centralised, so the row came out twice:
   two stars, two pencils, two bins, two admin rows, all live and all doing the same thing. */
function meCard() {
  if (!USER) return '';
  const face = pic(USER.photo || (USER.profile || {}).photo || '');
  const p = USER.profile || {};
  const ticks = typeof tickCount === 'function' ? tickCount() : 0;
  const rows = [
    ['Role', roleOf(USER.role || '')],
    ['Credits', String(USER.credits || 0)],
    ['Ticks', String(ticks)],
    ['Email', p.email || ''],
    ['Where', p.city || p.borough || ''],
  ].filter(([, v]) => String(v || '').trim());

  return `<div class="card">
    <div class="thing">
      ${face
        ? `<img class="thing-pic" src="${esc(face)}" alt="">`
        : `<span class="thing-pic art">${avatarFor(USER.handle || USER.name, 52, USER.avatar)}</span>`}
      <div class="thing-body">
        <h3>${esc(USER.name)}</h3>
        <p class="sub">${esc(roleOf(USER.role || 'student'))}</p>
      </div>
    </div>
    ${rows.map(([k, v]) => row(k, v)).join('')}
    ${/* ---------- THE WAY OUT IS ON THE CARD -------------------------------------------------------
          IT HAS BEEN IN THREE PLACES AND NONE OF THEM WAS THIS ONE. It was at the far end of the You
          column, then at the top of the feed with a second copy left behind on You, and when the
          columns went it needed a home again. Every one of those was a decision about which SCREEN
          it belonged on — and it does not belong on a screen, it belongs on the object it acts on.

          THIS IS THAT OBJECT. Your photograph, your name, your role, your credits: signing out is
          the last row of the same card, in the same place your account already is, findable the one
          way everything else in this app is findable. Nothing has to remember where it was put. */''}
    <button class="btn quiet" data-do="signout" style="margin-top:.6rem">Sign out</button>
  </div>`;
}

function findCard(x) {
  const t = x.row;
  /* ---------- A TUTOR IS A STAFF PASS ------------------------------------------------------------
     The thing a parent is actually checking, in the form they already know how to read.

     A pass carries a photograph, a name, what the person does, and — the whole reason a pass exists
     — whether they have been CLEARED. DBS was a boolean in a row of fields, which is where a fact
     goes to be skipped. On a pass it is a stamp, and a pass without one is visibly a pass without
     one, which is exactly the right amount of alarming.

     THE HOLE AT THE TOP is not decoration. It is what makes the eye read the whole thing as a card
     hanging round somebody's neck rather than as a rectangle with a photograph in it — and once it
     reads as that, the DBS stamp reads as clearance without anybody explaining it. */
  if (x.kind === 'tutor') return `
    ${/* NO LONGER A TAP TARGET. The sheet it opened repeated this pass and added three facts and a
          button; the facts are on the pass now — see `pass-line` below and `pass-where` in the
          foot — and the button is a row under it. */''}
    <div class="pass${t.listed === false ? ' is-off' : ''}">
      <span class="pass-hole"></span>
      <div class="pass-top">
        <span class="pass-org">@family.</span>
        <span class="pass-role">${esc(t.role || 'Tutor')}</span>
      </div>
      <div class="pass-body">
        ${t.image
          ? `<img class="pass-pic" src="${esc(pic(t.image))}" alt="" loading="lazy">`
          : `<span class="pass-pic pass-none">${esc((t.title || '?').slice(0, 1).toUpperCase())}</span>`}
        <div class="pass-who">
          <span class="pass-name">${esc(t.title)}</span>
          ${/* WHAT THEY TEACH, as printed lines. Two at most: a pass lists a person's post, not
                their whole history, and four subjects in this space is a paragraph. */''}
          ${/* THREE, NOT TWO. The sheet's "Teaches" row held the whole list and the pass held the
                first two, so the fact you had to open a panel for was the third subject. Three is
                what fits; anything past that is a paragraph and belongs on a profile. */''}
          ${(t.teaches || []).slice(0, 3).map(v =>
            `<span class="pass-line">${mark(v)}</span>`).join('')}
          ${t.rate ? `<span class="pass-line pass-rate">${money(t.rate)}/h</span>` : ''}
        </div>
      </div>
      <div class="pass-foot">
        ${/* THE STAMP. Present and green, or absent and said so — never quietly missing, which is
              what a blank field is. A parent scanning a list of these is looking for exactly one
              thing and it should be findable at arm's length. */''}
        <span class="pass-dbs ${t.dbs ? 'yes' : 'no'}">${t.dbs ? 'DBS CHECKED' : 'NO DBS ON FILE'}</span>
        ${/* WHERE THEY ARE. The one fact on the sheet that was not already on the pass, and the one
              a parent scanning a list of tutors is actually sorting by. */''}
        ${t.city || t.borough ? `<span class="pass-where">${esc(t.city || t.borough)}</span>` : ''}
        ${t.listed === false ? '<span class="pass-off">NOT LISTED</span>' : ''}
      </div>
    </div>`;

  /* ---------- A VENUE IS THE SLIP ON THE DOOR ----------------------------------------------------
     The tear-off booking slip taped to a library room: where it is, which rooms, how many fit, what
     an hour costs. Everything on it is already on the venues and rooms tabs — this is not inventing
     a form, it is drawing the one the data was always describing.

     THE PERFORATION down the bottom is the whole trick. A rectangle with a torn edge is a slip you
     take away, and a slip you take away is a thing you BOOK — which is what this card does when you
     tap it. The shape says what the tap does. */
  if (x.kind === 'venue') return `
    ${/* NO LONGER A TAP TARGET. The sheet it opened held a "from" price and a rate; the rooms
          below already hold one line each, which is the better version of both. */''}
    <div class="slip">
      <div class="slip-head">
        <span class="slip-where">${esc(t.title)}</span>
        ${t.subtitle ? `<span class="slip-sub">${mark(t.subtitle)}</span>` : ''}
      </div>
      <div class="slip-rows">
        ${/* ONE LINE PER ROOM, which is what a venue with rooms actually is — Richmond is not one
              price, it is three rooms at three prices holding three different numbers, and a single
              "from" figure was the cheapest of them dressed as the answer. */''}
        ${(t.rooms || []).length
          ? (t.rooms || []).slice(0, 4).map(r => `
              <div class="slip-row">
                <span class="slip-room">${esc(r.name)}</span>
                <span class="slip-cap">${r.max ? 'up to ' + r.max : ''}</span>
                <span class="slip-rate mono">${r.rate ? money(r.rate) + '/h' : 'free'}</span>
              </div>`).join('')
          : `<div class="slip-row">
               <span class="slip-room">The room</span>
               <span class="slip-cap">${t.maxCapacity ? 'up to ' + t.maxCapacity : ''}</span>
               <span class="slip-rate mono">${t.bestRate ? money(t.bestRate) + '/h' : 'free'}</span>
             </div>`}
      </div>
      ${/* The perforation, and under it the stub — the part you would tear off and keep. */''}
      <div class="slip-perf"></div>
      <div class="slip-stub">
        <span>${t.minNoticeDays ? esc(t.minNoticeDays) + ' days notice' : 'Book any time'}</span>
      </div>
      ${/* "Tap to book" WAS THE STUB'S RIGHT-HAND TEXT and it is gone: the tap it described no
            longer exists, and a row underneath now says the same thing as a thing you press. */''}
    </div>`;

  /* ---------- A LEVEL IS THE OTHER HALF OF A SUBJECT CARD ----------------------------------------
     GCSE was never a thing you could look at. It was a word inside a tutor's `teaches` string, a
     key in the pricing tab and an option on the booking form, and none of those three knew about
     the others — see `levelRows` for what that costs. This is those three facts on one card.

     NO NEW COLOUR. Green is a subject, purple a venue, red a tutor, and style.css says plainly
     that a fourth would turn a vocabulary into a legend. A level is not a fourth thing to scan a
     list for — it is a property of the three — so its name is set in the ordinary colour and the
     SUBJECTS on it are green, which is the same green they are everywhere else.

     THE TWO GAPS ARE PRINTED, not hidden behind a blank. A level with no multiplier says so
     instead of quietly reading "no surcharge"; a level the booking form has never heard of says
     so instead of looking exactly like one you can book. Both are admin-facing faults sitting in
     a client-facing list, and the only way either was ever going to be noticed is if something
     drew it. */
  if (x.kind === 'level') return `
    <div class="card is-level">
      <h3>${esc(t.name)}</h3>
      ${t.priced
        ? row(t.mult === 1 ? 'No surcharge' : 'Surcharge',
              t.mult === 1 ? '—'
            : (t.mult > 1 ? '+' : '−') + Math.abs(Math.round((t.mult - 1) * 100)) + '%')
        : row('Surcharge', 'Not priced yet', 'bad')}
      ${/* THE SUBJECTS THAT RUN AT IT — green, because a subject is green wherever it appears, and
            this is the fact somebody who has chosen a level is actually asking for. */''}
      ${t.subjects && t.subjects.length
        ? rowHtml('Subjects', t.subjects.map(s => `<span class="subject">${esc(s)}</span>`).join(', '))
        : row('Subjects', 'None yet', 'bad')}
      ${row('Tutors', t.tutors && t.tutors.length ? String(t.tutors.length) : 'None yet',
            t.tutors && t.tutors.length ? '' : 'bad')}
      ${t.listed ? '' : row('Booking form', 'Not offered', 'bad')}
      ${t.tutors && t.tutors.length
        ? `<p class="faint" style="margin:.3rem 0 0">${esc(t.tutors.map(y => y.title).join(', '))}</p>`
        : '<p class="faint" style="margin:.3rem 0 0">Nobody teaches at this level yet</p>'}
    </div>`;

  return `
    <div class="card is-subject">
      <h3>${esc(t.name)}</h3>
      ${row(t.mult === 1 ? 'No surcharge' : 'Surcharge',
            t.mult === 1 ? '—'
          : (t.mult > 1 ? '+' : '−') + Math.abs(Math.round((t.mult - 1) * 100)) + '%')}
      ${/* THE LEVELS, which only the sheet had. One line, and it is the fact that decides whether
            this subject is the one somebody wants at all. */''}
      ${t.levels && t.levels.filter(Boolean).length
        ? row('Levels', t.levels.filter(Boolean).join(', ')) : ''}
      ${t.tutors && t.tutors.length
        ? `<p class="faint" style="margin:.3rem 0 0">${esc(t.tutors.map(y => y.title).join(', '))}</p>`
        : '<p class="faint" style="margin:.3rem 0 0">Nobody teaches this yet</p>'}
    </div>`;
}

/* Tapping one opens a sheet rather than expanding the card. An expanding card pushes everything
   below it down, which on a phone means the thing you were looking at moves the moment you touch
   it — a sheet leaves the list exactly where it was. */
/* ---------- `on('who')` WAS HERE ----------------------------------------------------------------
   It opened a panel over a pass or a slip that already said everything in it. Every fact it
   added is on the card now and the one button is a row underneath. See `tutorTiles_` and
   `venueTiles_` in tiles.js.
--------------------------------------------------------------------------------------------- */

/* The switch. Admin only — a tutor who could list themselves could put themselves in front of
   clients before you had agreed to it. */
on('set-listed', el => {
  /* ---------- `el.checked` WAS READ HERE, AND THIS IS NO LONGER A CHECKBOX -----------------------
     It became a tile when the tutor sheet went, and `.checked` on a button is `undefined` — so this
     sent `on: undefined` on every press and put `!undefined`, which is `true`, back on failure. The
     switch was broken in both directions and looked like a backend problem.

     THE FILL IS THE STATE NOW, the same way it is on a star: `.on` is what the tile is showing, so
     `.on` is what it currently means, and the new value is the opposite of that. */
  const on = !el.classList.contains('on');

  /* SAID BEFORE IT IS TRUE. It almost always becomes true, and the round trip is the only part
     anybody would notice. */
  tileSet_(el, { label: on ? 'Listed' : 'Not listed', on,
                 note: on ? 'clients can see them' : 'clients cannot see them' });

  api({ action: 'setListed',
    adminName: USER.name, name: USER.name, who: el.dataset.who, on })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      toast(on ? 'Listed' : 'Hidden from clients');
      /* `load()` WAS HERE — the whole payload fetched again to change one word. Nothing else on the
         screen depends on whether one tutor is listed, so nothing else needs redrawing. The row's
         own `listed` is updated so a later repaint from anything else agrees with the tile. */
      const t = (DATA.tutors || []).find(x => norm(x.title) === norm(el.dataset.who));
      if (t) t.listed = on;
    })
    .catch(err => {
      /* PUT IT BACK. A switch that has not actually flipped must not keep saying it has — this is
         the one case where showing it early has a cost, and it is paid here. */
      tileSet_(el, { label: !on ? 'Listed' : 'Not listed', on: !on,
                     note: !on ? 'clients can see them' : 'clients cannot see them' });
      toast(String((err && err.message) || 'Could not reach the server.'));
    });
});

/* THE OTHER HALF OF THE CLICK HANDLER.
   A checkbox is not clicked in the way a button is — the change event is what tells you it
   actually flipped, and reading .checked in a click handler can catch it mid-flight. A select is
   the same problem said louder: its value only means anything after `change`.
   So both come through here, and the click handler above refuses them. */
document.addEventListener('change', e => {
  const el = e.target.closest('[data-do]');
  if (!el || !ACTIONS[el.dataset.do]) return;
  if (el.tagName !== 'SELECT' && el.type !== 'checkbox') return;
  /* The same reason as the click handler: an error that gets out of here loses its message. */
  try {
    ACTIONS[el.dataset.do](el, e);
  } catch (err) {
    console.error('[' + el.dataset.do + ']', err);
    toast(el.dataset.do + ' — ' + String((err && err.message) || err));
  }
});

/* Tapping a SUBJECT. It has emitted `data-do="subject"` since the screen was written and no
   handler was ever registered, so the third of the three lists on this tab was the one that did
   nothing when you pressed it. */
/* ---------- `on('subject')` WAS HERE -------------------------------------------------------------
   The surcharge and the tutor names were already on the card; the levels have joined them, and
   `Book this` is a row underneath. The one thing genuinely lost is the list of tutors AS CARDS
   inside it — which was a list of passes reachable only by opening a subject, when the same
   passes are one filter away on the same screen.
--------------------------------------------------------------------------------------------- */

/* ---------- BOOKING FROM A CARD --------------------------------------------------------------------
   IT WENT TO A COLUMN THAT NO LONGER EXISTS, and said "not built yet" on arrival — which was true
   when it was written and has not been for a while.

   IT ASKS THE FUNNEL INSTEAD. "What for · Booking" is the filter the booker lives behind, so
   pressing Book on a tutor or a venue is answering that question on your behalf and landing you on
   the form. The name on the button is not carried through yet: `data-name` is read by nothing, and
   pre-filling the tutor from here is a change to `BOOKING`, not to navigation. */
on('book-with', () => {
  closeSheet();
  STUFF.filters = [{ field: 'forLabel', value: 'Booking' }];
  go('stuff');
  paintStuff();
});