/* ==================================================================================================
   @family. — check/states.js

   THE STATES A SCREEN CAN BE IN, DECLARED ONCE AND READ BY BOTH INSTRUMENTS.

   `check/ui.js` MEASURES whether a screen can be read and hit; `check/press.js` PRESSES it and asks
   whether anything happened. They are two questions about the same nine screens, and both of them
   were blind in the same way before states existed: a screen has more than one, and `go(id)` only
   ever shows the one it opens in.

   THIS LIVES IN ITS OWN FILE BECAUSE A SECOND COPY WOULD DRIFT. That is the sentence this
   repository has already written about `documents_()`, about `paperIdOf_`, about `factsNow_` and
   about `childrenOf` — two readers of one fact are two chances to disagree about it, and here the
   disagreement would be silent in the worst direction: a state added for the measuring pass and not
   the pressing one is a surface nobody presses, which is exactly the hole the booking grid lived in.

   EVERY FUNCTION HERE RUNS IN THE BROWSER, not in node. They are passed across as source
   (`String(state.enter)`) and evaluated in the page, so they may use the app's own globals — `go`,
   `paint`, `openSheet`, `STUFF`, `MESSAGES` — and may not use anything from this file.
================================================================================================== */

/* ==================================================================================================
   A SCREEN IS NOT ONE PICTURE, AND THIS FILE HAD ONLY EVER TAKEN ONE OF EACH.

   `go(id)` PUTS A SCREEN IN FRONT OF YOU IN THE STATE IT OPENS IN, and for the Find screen that
   state is the funnel's question — a search box, some chips and a short list of answers. The
   RESULTS are pages you swipe to, and they are where every question card in the library is drawn.
   So this check has measured 72 combinations, on every run, for as long as it has existed, and
   NEVER ONCE RENDERED A QUESTION. The app's largest surface, four thousand rows of it.

   IT COST EXACTLY WHAT YOU WOULD EXPECT. Fifty-one questions carry the printed paper's dotted
   answer line, the longest 128 characters with no space in it — one unbreakable word that took the
   card, the pane and the page sideways at every width. `check/ui.js` measures sideways scroll and
   would have named it on the first run. Nothing did, because nothing ever turned the page.

   THIS IS THE `check-flow` STUB AGAIN, AND THE `check-booking` PATH BEFORE IT: a check that cannot
   reach its subject reporting a pass. The count in the summary said 72 combinations and meant it;
   what it did not say is that 72 combinations is nine screens seen once each.

   SO A SCREEN DECLARES ITS STATES. A state is a name and a line of the app's own code — no new
   navigation, no reaching past `go()`, just the same calls a finger would make. Anything not listed
   here is measured exactly as it was before, in the one state it opens in.

   AND A STATE THAT DOES NOT ARRIVE FAILS LOUDLY, for the same reason the signed-in seed does: a
   search that finds nothing would render an empty results page and report it as a clean sweep of
   the library. It asserts what it expects to be looking at. */
const STATES = {
  stuff: [
    { name: 'the question' },
    /* ---------- CARRY ON, WHICH ONLY EXISTS ONCE SOMEBODY HAS ANSWERED SOMETHING ---------------
       THE BLOCK IS DRAWN FROM `localStorage`, so on a fresh browser there is nothing to draw and
       `check/press.js` pressed 89 actions without ever reaching `resume-paper` -- and passed,
       because an action that is on no screen is an action it cannot report. That is the hole this
       file exists to close, and the same one the booking receipt and the message thread were in.

       SEEDED THROUGH `ansKey_`, THE APP'S OWN KEY-BUILDER, rather than by writing the string out
       here. The prefix is the signed-in person and the shape is `ans:<who>:q:<row_id>`; a second
       spelling of that in this file would be a second thing to keep in step, which is the fault
       `resumeList_` is written to avoid on the other side.

       AND `leave` TAKES THEM OUT AGAIN. States run in order down one page, so answers left behind
       would put a Carry on block on every state after this one. */
    /* NO `only`, DELIBERATELY: `ansKey_` prefixes whoever is signed in and writes the bare key when
       nobody is, so both visitors get a Carry on block and both are worth pressing. */
    { name: 'carry on',
      enter: () => {
        const rows = (LIBRARY_ROWS || [])
          .filter(r => r && r.kind === 'question' && r.paper_id === 'P-1MA1-1705-1H')
          .slice(0, 14);
        window.__seeded = rows.map(r => ansKey_({ key: 'q:' + r.row_id }));
        window.__seeded.forEach(k => localStorage.setItem(k, '42'));
        STUFF.q = '';
        STUFF.filters = [];
        paintStuff();
        goPage('stuff', 0, true);
      },
      expect: () => document.querySelectorAll('#s-stuff [data-do="resume-paper"]').length,
      wants: 'at least one paper to carry on with',
      leave: () => {
        (window.__seeded || []).forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
        window.__seeded = null;
        STUFF.filters = [];
        paintStuff();
      } },
    /* A WORD THAT IS IN THOUSANDS OF QUESTIONS, so the results are real cards rather than a lucky
       one. `goPage` is what the pager calls, and `stuffFirstResult_` is the app's own answer to
       "which page is the first result" — asking it rather than assuming page 1 is the whole
       reason that function exists. */
    { name: 'the results',
      enter: () => {
        STUFF.q = 'work out';
        paintStuff();
        goPage('stuff', stuffFirstResult_(), true);
      },
      /* WHAT MUST BE ON THE SCREEN FOR THIS TO HAVE WORKED. */
      expect: () => document.querySelectorAll('#s-stuff .qcard').length,
      wants: 'at least one question card' },
    /* ---------- AND THE FUNNEL SEVERAL ANSWERS DEEP -------------------------------------------
       THE FIRST QUESTION IS "WHAT FOR" AND ITS ANSWERS ARE ONE WORD EACH. Every answer row this
       check had ever measured was `Learning`, `Shop`, `Games` — so the row layout was proved
       against the shortest labels in the app and nothing else. Six answers down it is asking about
       TOPICS, where an answer is "Angles in Triangles & Quadrilaterals", and that is where the row
       was clipping its own text.

       THE PATH IS THE ONE FROM THE COMPLAINT, including the skipped question, because a state
       reached by a route nobody takes is a state nobody is in. */
    { name: 'six answers in',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' },
                         { field: 'kindLabel', value: 'Questions' },
                         { field: 'subject', value: 'Maths' },
                         { field: 'documentType', value: 'Worksheet' },
                         { field: 'keystage', value: 'KS2' },
                         { field: 'yearGroup', any: true }];
        paintStuff();
        goPage('stuff', 0, true);
      },
      expect: () => document.querySelectorAll('#stuff-groups .row').length,
      wants: 'a question with answers on it' },
    /* ---------- AND THE DOCUMENT BEHIND THE TILE -----------------------------------------------
       THE LONGEST SURFACE IN THE APP, AND IT IS NOT ON A SCREEN. A practical's guide opens in the
       sheet, which is where it had to go: 51 of the 56 practical cards were already taller than
       the pane before a word of it was written, so a guide on the card would have been a guide
       below the fold. `#sheet` is a sibling of the screens rather than a child of one, so nothing
       here could see it until `inspect` was taught to — see the note there.

       SEVEN TEXTAREAS, A RISK LIST AND A PAGE OF PROSE, none of it measured for a tap target, a
       contrast ratio or a sideways scroll until this. `openSheet` is what the tile's handler
       calls, so this is the app's own door and not a reach past it.

       LAST IN THE LIST, AND IT PUTS THE SHEET BACK. States run in order down one page and `go()`
       does not close a sheet, so an open guide would otherwise be measured again as part of Tools
       and Games. `leave` is what says so. */
    { name: 'a practical guide',
      enter: () => {
        const x = stuffItemsAll_().find(it => it.kind === 'practical' && !it.row.excluded);
        if (!x) throw new Error('no practical in the list to open a guide on');
        openSheet(x.name, practicalGuide_(x), null, null);
      },
      expect: () => document.querySelectorAll('#sheet-body .gd-box').length >= 7
                 && document.querySelector('#sheet-body .prac-kit li'),
      wants: 'the guide open in the sheet, with its kit list and all seven boxes',
      leave: () => closeSheet() },
    /* ---------- THE FILMS, WHICH ONLY ONE VISITOR HAS ------------------------------------------
       `only:` FOR THE SECOND TIME IN THIS FILE, and for a stronger reason than the flyer widget's.
       That one is a roster gate on the phone; this is the PAYLOAD — `doGet` builds `films` inside
       `if (viewerIsAdmin)` and sends `[]` to everybody else, so a signed-out visitor has no rows,
       no funnel answer and nothing to measure. Asking them to reach it would report a fault about
       the check rather than about the app, which is what `only` is for.

       THE FIXTURE'S THREE ROWS ARE INVENTED. That file is committed to a public repository and
       holds nothing real — see the note on them. What they are for is the SHAPE: a very long
       title against the flag, a series with no year, and a placeholder with no link, which are the
       three ways this card can be drawn. */
    { name: 'the films',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' },
                         { field: 'kindLabel', value: 'Films' }];
        paintStuff();
        goPage('stuff', stuffFirstResult_(), true);
      },
      expect: () => document.querySelectorAll('#s-stuff .card.film').length >= 2,
      wants: 'at least two film cards' },
  ],

  /* ---------- THE TWO WIDGETS THAT ARE TALLER THAN A SCREEN ------------------------------------
     `--screen=tools` MEASURED PAGE ONE AND NOTHING ELSE. The Tools column is one widget per page,
     so nine widgets were being reported on as one — and the two that did not fit were both further
     down. Reported by the owner as "I can't scroll down on some"; measured at 390px, the cheat
     sheet maker's card was 1263px inside an 805px pane and the flyer's 1252px, so 458px and 447px
     were clipped, taking the A4 preview and the Print button with them.

     THIS IS THE `check/cards.js` LESSON, one column along: the summary said eight combinations and
     meant it, and what it did not say is that eight combinations is one page seen eight times. The
     fix is not a new rule — `ui.js` already measures sideways scroll, tap targets and contrast, and
     would have measured these — it is a STATE, which is the sentence CLAUDE.md already carries
     about the funnel's answer rows.

     BY NAME, NOT BY PAGE NUMBER. `widgetColumn_` builds from the roster, so a widget added or
     switched off moves every index after it — and a state that silently lands on the wrong widget
     is worse than one that fails, because it reports a pass about something it did not look at.
     `expect` is what makes that loud. */
  tools: [
    { name: '' },
    { name: 'the cheat sheet maker',
      enter: () => {
        const n = allWidgets().filter(w => w.kind === 'tool')
          .findIndex(w => String(w.id) === 'mat');
        if (n < 0) throw new Error('no cheat sheet widget in the roster');
        goPage('tools', n, true);
      },
      expect: () => document.querySelector('#s-tools #mat-out .mat-sheet'),
      wants: 'the A4 preview drawn on screen' },
    /* ---------- AND THIS ONE IS NOT THERE FOR EVERYBODY -------------------------------------
       `flyers` CARRIES `admin: true`, so it is not in a signed-out visitor's roster at all — and
       "could not reach it" is the wrong sentence for a widget that correctly does not exist. A
       warning nobody can act on is the kind of red this file's own `ACCEPTED_TAP` note is about.
       `only` says who a state belongs to. It is skipped rather than failed, and the summary lists
       it as not reachable — which is the honest answer and still not silence. */
    /* ---------- THE PAGE NUMBER COMES FROM THE LIST THE COLUMN IS BUILT FROM --------------------
       THIS COUNTED `allWidgets()` AND THE COLUMN DRAWS `widgetsOf_()`, which is that list with the
       gated ones taken out. The two agreed for an admin, who is gated out of nothing, so the flyer
       state was right by luck rather than by construction — and the moment a widget appeared that
       an admin does NOT see, every index after it would have pointed one page off with nothing
       saying so. Same fault as a pager that counts for itself: two readings of one list.
       `expect` would have caught it, loudly, which is the other half of why states declare one. */
    { name: 'the flyer maker',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'flyers');
        if (n < 0) throw new Error('no flyer widget in the roster');
        goPage('tools', n, true);
      },
      expect: () => document.querySelector('#s-tools #fm-out .fm-sheet'),
      wants: 'the flyer drawn on screen' },

    /* ---------- A TUTOR'S TEACHING HOURS -----------------------------------------------------
       THE SEVENTY-SEVEN CELLS OF A WEEK GRID, on a card nobody had measured, in the one place this
       file could not reach before: `widgetsOf_` shows it to a tutor or an admin and to nobody
       else, and the column fills whichever pages it happens to stop on. A state is the only thing
       that puts it on the screen every run — which is the sentence this project already writes
       about the booking receipt and the message thread. */
    { name: 'a tutor\'s teaching hours',
      only: () => typeof isTutorRole === 'function' && isTutorRole(),
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'avail');
        if (n < 0) throw new Error('no availability widget in the roster');
        goPage('tools', n, true);
      },
      expect: () => document.querySelectorAll('#s-tools #avail-box .hr').length > 70,
      wants: 'the week of hours drawn on screen' },
  ],

  /* ---------- AND A SESSION RECEIPT, WHICH THIS FILE HAS NEVER HAD ON THE SCREEN ----------------
     MEASURED, SIGNED IN, AGAINST THE REAL FIXTURE: the booking column draws ONE page and it is the
     form. `myJobs_()` keeps the sessions whose `client` or `tutor` is the visitor, and the
     fixture's one job names neither — so `bookBlocks` returns the form and nothing else, and
     `booking: nothing to report` has meant that single page at four widths on every run.

     THE RECEIPT IS THE MOST-COMPLAINED-ABOUT CARD IN THE APP and it was outside the measurement
     the whole time. That is the `dm` note one column along, and the booking-screen-signed-out note
     before it, for a third time — and it is what let `Per session` wrap its label on every receipt
     ever drawn while a hundred and four combinations came back clean.

     SEEDED THROUGH THE PAYLOAD, NOT THE MARKUP. `DATA.liveJobs` is what `myJobs_` reads, so a job
     naming the signed-in visitor as its client is the state the app is in a moment after `load()`
     — the app's own door, the same move the seeded thread and the seeded visitor both make.

     ONE SESSION WITH EVERY ROW FILLED IN, because the fault this state exists to catch is a label
     or a value that does not fit its column, and a row with nothing in it cannot show one. Six
     dates so the `Dates` row has a range and a count; a price so the total row draws; a venue name
     as long as a real one. */
  booking: [
    /* THE FORM STAYS ON THE LIST — declaring states replaces the unnamed one, and the form is the
       page everybody arrives on. Same first line as `tools` and `dm`, for the same reason. */
    { name: '' },
    { name: 'a session receipt',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        DATA.liveJobs = [{
          id: 'J-UI', jobId: 'J-UI', title: 'GCSE Maths, Tuesday 4pm',
          subject: 'Maths', level: 'GCSE', students: '2',
          venue: 'Colliers Wood Library', clientHosts: '',
          weekday: 'Tuesday', time: '16:00', hours: '1.5', term: 'Autumn 2026',
          kind: 'session', splitEmails: '', tutor: 'Ada Tutor', client: USER.name,
          sessionDates: '06/10/26, 13/10/26, 20/10/26, 27/10/26, 03/11/26, 10/11/26',
          startDate: '06/10/26', endDate: '10/11/26',
          price: '270', tutorPay: '135', stage: 'accepted', status: 'accepted',
        }];
        paint('booking');
        /* PAGE BY POSITION IS WRONG HERE and `jobPageAt_` is the app's own answer: it reads the
           same ordered list the pages are built from, so this cannot land on the form because
           something moved. */
        goPage('booking', typeof jobPageAt_ === 'function' ? jobPageAt_('J-UI') : 1, true);
      },
      expect: () => document.querySelectorAll('#s-booking .rc .bk-row').length,
      wants: 'a receipt with rows on it' },
    /* ---------- AND THE BASKET, WHICH A FIXTURE CANNOT REACH AT ALL ----------------------------
       `basketPages()` RETURNS NOTHING WHEN `CART` IS EMPTY — deliberately, because "your basket is
       empty" is a whole pane whose content is the word no. And `CART` lives in `localStorage`, not
       in the payload, so no fixture can put anything in it: this column has drawn the form and
       nothing else on every run this file has ever made.

       SEEDED THE WAY THE APP FILLS IT. `CART` is what `basketPages` reads and `cart-add` writes,
       so setting it is the state a moment after somebody pressed Add to basket.

       A PRICE IN THE THOUSANDS ON PURPOSE. The figure column is the thing that breaks here — it is
       sized in `ch` of a proportional font and drawn in mono at 1.05rem bold — and `£2050.00` is
       one character wider than `£270.00`, which is the difference between a finding and a pass. */
    { name: 'the basket',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        CART = [{ key: 'I001', name: 'Trundle wheel, 1 m circumference', kind: 'shop',
                  cost: 0, money: 120000 },
                { key: 'I026', name: 'Tape measure, 30 m', kind: 'shop', cost: 0, money: 85000 }];
        paint('booking');
        goPage('booking', pageCount('booking') - 1, true);
      },
      expect: () => document.querySelector('#s-booking [data-do="cart-send"]'),
      wants: 'a basket with a way to pay on it' },
  ],

  /* ---------- AND THE MESSAGES COLUMN, WHICH THIS FILE HAS ONLY EVER SEEN EMPTY -----------------
     MESSAGES ARE A POST ACTION, NOT A PAYLOAD KEY — deliberately, because a conversation is private
     and the GET payload goes out whole to whoever asks for it. So `check/fixture.json` cannot carry
     one, the column has always drawn "Nothing yet.", and `dm: nothing to report` has meant that
     card and nothing else. The same sentence this file already carries about the booking screen
     signed out, one column along.

     SO THE THREAD IS SEEDED. `MESSAGES` is what `messageThreads_` reads and `loadMessages` writes,
     so setting it is the state the app is in a moment after a successful fetch — the app's own
     door, exactly as the signed-in visitor is seeded through `localStorage` rather than by poking
     `USER`.

     TWO PEOPLE AND A RUN OF THREE, because those are the two things the layout is about: which
     side a bubble is on, and a turn that is several messages long collapsing to one tail and one
     timestamp. One message from one person would measure neither.

     A LONG ONE ON PURPOSE. The widest thing a bubble ever holds is a sentence somebody typed, and
     78% of 320px is where it would clip if `max-width` and `overflow-wrap` disagreed. */
  dm: [
    /* THE EMPTY COLUMN STAYS ON THE LIST. Declaring states REPLACES the single unnamed one every
       screen has by default — so naming only the seeded thread would stop this file ever measuring
       the "Nothing yet." card again, which is the state a signed-out visitor and an empty inbox are
       both in. `tools` has the same first line for the same reason. */
    { name: '' },
    { name: 'a conversation',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const m = (id, mine, body, at, read) => ({
          id: id, mine: mine, body: body, at: at, read: read,
          withId: 'P009', withName: 'Ada Tutor',
          fromName: mine ? 'You' : 'Ada Tutor' });
        MESSAGES = [
          m('m1', false, 'Just checking Tuesday at 4 still works?', '2026-09-16 09:12', true),
          m('m2', true,  'Yes, that is fine.', '2026-09-16 09:40', true),
          m('m3', true,  'He has been doing the fractions sheet.', '2026-09-16 09:41', true),
          m('m4', true,  'Shall I bring the November 2019 paper?', '2026-09-16 09:41', true),
          m('m5', false, 'Please do — and a ruler, there is a construction question near the end '
                       + 'that needs compasses as well.', '2026-09-16 10:03', true),
        ];
        DM_ASKED = true;
        paint('dm');
      },
      expect: () => document.querySelectorAll('#s-dm .msg-bub').length >= 5
                 && document.querySelector('#s-dm .msg-text'),
      wants: 'five bubbles and a box to reply in' },
    /* ---------- AND AN INBOX, WHICH IS THE STATE THE FAULT WAS IN ---------------------------------
       ONE CONVERSATION IS NOT AN INBOX. The state above seeds a single thread — deliberately, for
       what it measures: which side a bubble sits on and how a run of three collapses. It fits on one
       pane, so for as long as it was the only seeded state this column could not have shown the
       fault it actually had: `screen('dm')` stacked EVERY conversation into one `.pane`, which is
       `overflow: hidden`, and at 390×844 with six of them 493px of somebody's messages were on the
       page with no scroll and no page to turn to.

       I WROTE THE RULE FIRST AND IT REPORTED NOTHING, which is the only reason this state exists:
       putting the `stack()` back did not fire it either, because two cards fit. A rule that cannot
       fail is not a rule — this file has deleted one for exactly that — and what was missing was
       never the rule, it was the state. Same sentence as the filter chips six answers deep.

       SIX, BECAUSE FIVE FITS. Measured at the tallest of the four widths: five conversations sit
       inside the pane and the sixth is what pushes it over, so this is the smallest inbox that can
       answer the question at every width rather than at 320 alone. */
    { name: 'an inbox',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const who = ['Ada Tutor', 'The office', 'Ben Parent', 'Cara Tutor', 'Dev Admin', 'Eve Parent'];
        MESSAGES = who.flatMap((n, i) => [
          { id: 'i' + i + 'a', mine: false, read: true, withId: 'P10' + i, withName: n,
            fromName: n, at: '2026-09-1' + i + ' 10:0' + i,
            body: 'Hello from ' + n + ' \u2014 long enough to take a line or two on a phone.' },
          { id: 'i' + i + 'b', mine: true, read: true, withId: 'P10' + i, withName: n,
            fromName: 'You', at: '2026-09-1' + i + ' 10:1' + i, body: 'Thanks, noted.' },
        ]);
        DM_ASKED = true;
        paint('dm');
      },
      expect: () => pageCount('dm') >= 7,
      wants: 'six conversations, each a page of its own' },
  ],
};

const statesOf = id => STATES[id] || [{ name: '' }];

module.exports = { STATES, statesOf };
