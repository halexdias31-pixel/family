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
/* ---------- ONE PERSON, ONE CARD -------------------------------------------------------------------
   YOU WERE ON THE SCREEN TWICE. A staff pass with your photograph, your subjects, your rate and your
   DBS stamp — and then, a swipe later, a second card with your photograph, your name and your role
   again above your credits. Same person, same face, two cards, because one was built for `tutor` and
   the other for `me` and nothing ever asked whether they could be the same row.

   THE PASS IS THE PUBLIC HALF AND IT WINS. It is what everybody else sees of you, it is the shape
   this app already uses for a person, and it says more: what you teach, what you cost, whether you
   are cleared. Drawing a plainer version of the same person underneath it says nothing the pass did
   not already say better.

   SO THE PRIVATE HALF HANGS OFF IT. Credits, ticks, email, where — the facts only you see — are rows
   under your own pass rather than a card of their own, and the way out is the last of them.

   AND IT IS NOT ABOUT TUTORS. A child with a row, an admin, anybody: `passFor_` finds whatever
   public record exists for the person and the private rows go under it. Somebody with no such record
   gets the rows on their own, which is what everybody used to get. */
function passFor_(name) {
  const n = norm(name);
  if (!n) return null;
  return (DATA.tutors || []).find(t => norm(t.title) === n) || null;
}

/* ---------- ONE ROW FOR ONE PERSON, PASSED IN RATHER THAN LOOKED UP A SECOND TIME -----------------
   `passFor_(USER.name)` MATCHES ON THE DISPLAY NAME ALONE, and CLAUDE.md is emphatic about what
   that costs: `findPerson` on the backend falls back to matching a name, which is right for a row
   typed into a sheet before anybody has an id and silently wrong the day two tutors share one.
   `accountPages_` already does this properly — `mineIs_` tries `personId`, then `handle`, then the
   name, in the order the backend uses — and it has the answer in its hand when it calls this.

   SO THE ROW IS AN ARGUMENT. Passing it is what makes the two agree by construction; `passFor_`
   stays as the fallback for a caller that has no row, which today is `KINDS.tutor.card` — the
   funnel's renderer, currently unreached because Booking has left the funnel, and still correct if
   the `kinds` tab ever puts a tutor back in it. */
function meCard(given) {
  if (!USER) return '';
  const face = pic(USER.photo || (USER.profile || {}).photo || '');
  const p = USER.profile || {};
  const rows = [
    /* `Role` GOES WHEN THE PASS IS THERE. The pass prints it in the corner, and a row repeating it
       under the photograph is the duplication this merge exists to remove. */
    ['Role', roleOf(USER.role || '')],
    ['Credits', String(USER.credits || 0)],
    /* `['Ticks', …]` WAS HERE. Nothing counts a tick any more — see `tickCount` in price-rows.js.
       Dropped rather than left at 0: `.filter(([, v]) => …)` below would have hidden it anyway, so
       the only thing a zero could have done is reappear the day somebody typed a number in. */
    ['Email', p.email || ''],
    ['Where', p.city || p.borough || ''],
  ].filter(([, v]) => String(v || '').trim());

  const mine = given || passFor_(USER.name);
  if (mine) {
    /* ---------- TWO WIDGETS, NOT A CARD INSIDE A CARD ---------------------------------------------
       THIS WRAPPED `findCard` IN `<div class="card">` and appended the private rows inside it. That
       was right while a tutor was a `.pass` — a bare object with no container of its own. It is a
       `.card.is-widget` now, so a wrapper would be a card in a card, which is the nesting
       `accountPages_` has just stopped doing.

       AND THEY ARE TWO DIFFERENT THINGS ANYWAY, which is the better reason. The profile is what
       everybody else sees of you; credits, e-mail and where you are are what only you see. One box
       holding both says they are the same kind of fact, and the heading on the second is what tells
       a reader that the rows under it are private — which nothing on the merged card ever did. */
    const priv = rows.filter(([k]) => k !== 'Role');
    return findCard({ kind: 'tutor', row: mine })
      + (priv.length
         ? `<div class="card is-widget"><h3>Only you see this</h3>${
              priv.map(([k, v]) => row(k, v)).join('')}</div>`
         : '');
  }

  return `<div class="card is-widget">
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
    ${/* THE `Sign out` BUTTON WAS HERE, briefly. It moved to `#stuff-controls` — the question at the
          top of the funnel, which is the one thing on screen that is never scrolled past, never
          filtered out and never not drawn. A card can be all three, and a way out that is only
          there when you have already found yourself is not one. See `screen('stuff')`. */''}
  </div>`;
}

/* ---------- A FIELD THAT MIGHT BE A LIST, AND MIGHT BE A STRING, AND MIGHT BE NEITHER -------------
   THE FIRST VERSION OF THIS CARD DID `(t.focus || []).join(' · ')` AND IT THREW. `doget.gs` sends
   `focus` as an array and the fixture holds the string `"Maths"`, and a string has no `.join` — so
   `paint` caught the TypeError, drew its "This screen did not draw" card, and `check/ui.js`
   measured that card across eight combinations and reported nothing to report.

   THE SHAPE IS NOT SOMETHING THIS CARD GETS TO ASSUME. Four of the thirteen fields it reads are
   list-shaped, they arrive from a spreadsheet through a mapper, and this file has already paid for
   the opposite belief twice — `r.link` against `source_url` cost seven silent reads, and
   `extraQuals` is sent as a STRING while the fixture holds an empty ARRAY, which is truthy, so the
   naive test printed an `Also` row with nothing after it.

   SO IT READS ALL THREE FORMS, exactly as `asList_` in find.js does for the funnel: an array, a
   comma-separated cell, or a single value. Declared here rather than borrowed because `cards.js`
   loads before `find.js` — see `window.FILES` — and a card that works only once the funnel has
   loaded is a card that breaks on the first screen somebody opens. */
function profList_(v) {
  return (Array.isArray(v) ? v : String(v == null ? '' : v).split(','))
    .map(x => String(x == null ? '' : x).trim()).filter(Boolean);
}

/* ---------- "1 to 4 students", NOT `minStudents` AND `maxStudents` --------------------------------
   THE SHEET STORES A FLOOR AND A CEILING and a reader wants a range, so the joining happens once
   here rather than on every card that shows one. Three cases and they read differently:
     · both, and equal   → "1 student"        — a tutor who only takes one is stating a policy
     · both, and apart   → "1 to 4 students"
     · a floor only      → "1 student or more" — `maxStudents` of 0 is "no limit set", which
                            `doget.gs` says outright, so it must not be printed as a ceiling of nought
   NOTHING AT ALL when there is no floor either: an unanswered question is not a range, and a row
   reading "0 students" is the `cost: 0` shape one more time. */
function profRange_(lo, hi, one, many) {
  const a = Number(lo) || 0, b = Number(hi) || 0;
  if (!a && !b) return '';
  const word = n => n === 1 ? one : many;
  const label = one === 'hour' ? 'Session length' : 'Group size';
  if (a && b && a !== b) return row(label, a + ' to ' + b + ' ' + word(b));
  if (a && b) return row(label, a + ' ' + word(a));
  if (a) return row(label, a + ' ' + word(a) + ' or more');
  return row(label, 'up to ' + b + ' ' + word(b));
}

/* A YEAR OLD. `fmtDate` sends `dd/mm/yyyy`, which `parseDMY` is the one reader of in this app —
   `new Date('03/12/2026')` is March in New York and December in London, and that timezone fault
   already cost this project seven buttons under `waveOf`. Anything unparseable is not stale: an
   unreadable date is a fact about the cell, and marking it red would accuse somebody of letting
   their profile rot because a spreadsheet holds a word. */
/* THE DATE AS TYPED, or nothing. Anything that is not `dd/mm/yyyy` is not a date this app can
   reason about, and the two callers below want the same answer to that question. */
function profDate_(v) {
  const t = String(v == null ? '' : v).trim();
  return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(t) ? t : '';
}

function profStale_(s) {
  const d = typeof parseDMY === 'function' ? parseDMY(String(s || '')) : null;
  if (!d || isNaN(+d)) return false;
  const year = new Date(); year.setFullYear(year.getFullYear() - 1);
  return d < year;
}

function findCard(x) {
  const t = x.row;
  /* ---------- A PERSON IS A WIDGET, AND THE LANYARD HAS GONE ------------------------------------
     REPORTED AS "get rid of that lanyard looking thing mate. just a normal widget." — the second
     complaint about this card in two days, and the first one ("I want them standardised like the
     other widgets") was answered by putting the pass INSIDE a widget, which is not what was asked
     and left a lanyard in a box.

     WHAT THE PASS WAS FOR, so the argument is not lost with the markup. It carried a photograph, a
     name, what the person does and whether they had been CLEARED, and the defence of it was that
     the SHAPE did the explaining: a rectangle with a hole punched in the top reads as something
     worn round a neck, and once it reads as that the DBS stamp reads as clearance without anybody
     saying so. That was true and it is not the point. A pass is an object you are handed at a
     reception desk; this app is a column of widgets you scroll, and one object among nine widgets
     reads as a thing that has not been finished rather than as a thing with a shape of its own.

     AND IT COULD NOT HOLD WHAT IS ACTUALLY IN THE SHEET. That is the half that matters more than
     the taste. `doget.gs` has sent thirteen public facts about a tutor since it was written and the
     pass drew four of them: a photograph, a name, three subjects and a rate. The headline they
     wrote about themselves, the three adjectives, the years they have been doing it, their
     qualifications and grades, the group sizes and session lengths they accept, what they focus on,
     and when they last confirmed any of it were all on every phone, on every load, drawn nowhere.
     THIRTEEN COLUMNS WRITTEN AND NEVER READ is this repository's oldest shape — `figure`,
     `orderPrints`, the four message actions, `exam_date` — and a pass is 3.4rem of card wide, so
     there was nowhere to put them even once somebody noticed.

     SO IT IS `.card.is-widget`, the same container the calculator and the notepad sit in, with the
     role as its label and rows underneath. Asked for twice; the rows are what makes it worth it.

     THE DBS STAMP SURVIVES THE MOVE, because the one thing on here a parent is actually scanning
     for should not become a row of text among twelve others. It is a marked chip beside the name,
     green or red, and the `undefined` rule below is unchanged and still the sharp edge. */
  if (x.kind === 'tutor') return `
    <div class="card is-widget is-prof${t.listed === false ? ' is-off' : ''}">
      ${/* ---------- A TITLE SITS BESIDE THE ROLE, IN THE ROLE'S OWN LABEL ---------------------
             `doGet` SENDS `titles` — the values in the role cell that are titles rather than
             roles, `Head of Boxing` among them — and this heading is the one place on the card
             that already says what somebody IS. A row of its own would be a twelfth label/value
             line for a fact three words long; a longer `role` string would put a title through the
             funnel, which reads that field as a kind. `profList_` because the shape is not
             something this card gets to assume — see its note. */''}
      <h3>${esc([t.role || 'Tutor'].concat(profList_(t.titles)).join(' · '))}${
        t.listed === false ? ' <span class="prof-off">· not listed</span>' : ''}</h3>
      ${/* ---------- AND WHAT `· not listed` MEANS, SAID ONCE, WHERE THE MARK IS ------------------
            REPORTED THREE TIMES AS *"i still dont see george"*, AND HE WAS ON THE SCREEN. Measured:
            an admin's account column opens ON the unlisted tutor — `PAGE_HOME.account` is page 1
            — dimmed, with `· not listed` beside the role and a `set-listed` tile under the card.
            What was missing is that every one of those signals says a STATE and none of them says
            what to do about it: `tile_` puts a tile's label in `title` and `aria-label` only, which
            is a recorded decision and not one to undo here, so on a phone the only way back is an
            unlabelled crossed-out eye in a row of icons.

            ONE LINE UNDER THE ROW RATHER THAN A WORD ON THE BUTTON is what the house style says for
            exactly this — see `jobAdminTiles_` — and here it is at the TOP of the card because
            that is where the mark it explains is. It says the consequence rather than the cell:
            "clients cannot see them" is what `listed` means, and the tile is what changes it.

            ADMIN ONLY, because nobody else is ever sent an unlisted tutor: `doGet`'s gate is
            `(listed || viewerIsAdmin)`, so a client's payload has no such row and repeating the
            rule here would be the second copy this repository keeps paying for. */''}
      ${t.listed === false && isAdmin()
        ? `<p class="prof-say prof-hid">Clients cannot see them. The crossed-out eye below puts
             them back on the site.</p>` : ''}
      <div class="prof-top">
        ${t.image
          ? `<img class="prof-pic" src="${esc(pic(t.image))}" alt="" loading="lazy">`
          : `<span class="prof-pic prof-none">${esc((t.title || '?').slice(0, 1).toUpperCase())}</span>`}
        <div class="prof-who">
          <span class="prof-name">${esc(t.title)}</span>
          ${t.subtitle || t.city || t.borough
            ? `<span class="prof-where">${esc(t.subtitle || t.city || t.borough)}</span>` : ''}
          ${/* ---------- ABSENT IS NOT `false`, AND IT IS THE ONLY EXCEPTION ON THIS CARD ----------
                A TUTOR ROW'S `dbs` COMES FROM `TRUE_(r.dbs_checked)` and is therefore always
                answered — true or false — so every person a parent can look up gets a mark either
                way, and a missing one is meant to be alarming. A row built somewhere that has no
                such cell (your own account, when you are not staff) has the key ABSENT, and
                stamping NO DBS ON FILE across it would report a fact nobody has recorded: the
                `cost: 0` shape, a blank read as a negative. Omitting the key is what tells the two
                apart. See `accountPages_`. */''}
          ${t.dbs === undefined ? ''
            : `<span class="prof-dbs ${t.dbs ? 'yes' : 'no'}">${
                t.dbs ? 'DBS checked' : 'No DBS on file'}</span>`}
        </div>
      </div>
      ${/* WHAT THEY WROTE ABOUT THEMSELVES. `doget.gs` already wraps it in quotation marks, so it
            is printed as said rather than as a field with a label — which is the difference between
            a profile and a form. */''}
      ${t.description ? `<p class="prof-say">${esc(t.description)}</p>` : ''}
      ${/* THE THREE ADJECTIVES OFF THE SHEET. Chips rather than a comma list because they are three
            separate claims and not a sentence; and capped at three because the tab has exactly
            three columns and a fourth would mean somebody changed the sheet, not the card. */''}
      ${profList_(t.tags).length
        ? `<div class="prof-tags">${profList_(t.tags).slice(0, 3)
             .map(v => `<span class="prof-tag">${esc(v)}</span>`).join('')}</div>` : ''}
      ${/* ---------- THE ROWS, AND EVERY ONE OF THEM IS DROPPED WHEN IT IS EMPTY -------------------
            `.filter(Boolean)` AT THE END IS THE WHOLE RULE. A tutor with no qualifications typed in
            should show a shorter card, not a card with `Qualifications —` on it: a labelled blank
            is a claim that somebody looked and there was nothing, which is the sentence this
            repository has written down five times. `row` prints a dash for an empty value, so the
            emptiness has to be decided here, before it is asked for. */''}
      ${[
        profList_(t.teaches).length
          ? rowHtml('Teaches', profList_(t.teaches).map(v => mark(v)).join(', ')) : '',
        t.yrsExp ? row('Experience', String(t.yrsExp).replace(/^(\d+)$/, '$1 years')) : '',
        profList_(t.quals).length ? row('Qualifications', profList_(t.quals).join(' · ')) : '',
        profList_(t.extraQuals).length ? row('Also', profList_(t.extraQuals).join(' · ')) : '',
        profList_(t.focus).length ? row('Focus', profList_(t.focus).join(' · ')) : '',
        /* WHAT A SESSION WITH THEM LOOKS LIKE. Two rows rather than four, because "1 to 4 students"
           is the fact and `minStudents` / `maxStudents` are how it is stored — and a card that
           prints storage has made the reader do the joining. `maxStudents` of 0 means no limit set,
           which `doget.gs` says outright, so it is read as no limit rather than as nought. */
        profRange_(t.minStudents, t.maxStudents, 'student', 'students'),
        profRange_(t.minHours, t.maxHours, 'hour', 'hours'),
        t.rate ? row('Rate', money(t.rate) + '/h') : '',
        /* THE SECOND SEAT IS A DIFFERENT PRICE and a parent booking for two children is the person
           most likely to be looking at this card. `core.js` already prices it; this says so. */
        Number(t.extraSeat) > 0 ? row('Each extra seat', money(t.extraSeat) + '/h') : '',
        /* ---------- WHEN THEY LAST SAID ANY OF THIS WAS TRUE --------------------------------------
           `doget.gs` SENDS THE DATE AND SAYS WHY: "a profile nobody has looked at for a year is
           worse than one that's obviously incomplete, because it reads as true" — and then "the
           site decides what counts as recent, so the rule lives in one place". This is that one
           place, and until now it was nowhere: the column has been on every phone since it was
           written, drawn by nothing.

           A YEAR, AND IT IS MARKED RATHER THAN HIDDEN. Hiding a stale date leaves the card looking
           exactly like a fresh one, which is the fault the sentence above describes. */
        /* ONLY IF IT IS A DATE. `doget.gs` sends `fmtDate(r.details_confirmed)` — `dd/mm/yyyy` — and
           the fixture holds the boolean `true`, which would have printed a row reading
           `Details confirmed  true`. A cell holding a tick instead of a day is a fact about the
           spreadsheet and not about the tutor, and printing it is the same mistake as the `figure`
           column's "not drawn yet": a value drawn as though somebody had meant it that way. */
        profDate_(t.detailsConfirmed)
          ? row('Details confirmed', profDate_(t.detailsConfirmed),
                profStale_(t.detailsConfirmed) ? 'bad' : '')
          : '',
      ].filter(Boolean).join('')}
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