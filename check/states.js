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
    /* A WORD THAT IS IN THOUSANDS OF QUESTIONS, so the results are real cards rather than a lucky
       one. `goPage` is what the pager calls, and `stuffFirstResult_` is the app's own answer to
       "which page is the first result" — asking it rather than assuming page 1 is the whole
       reason that function exists. */
    /* ---------- AND THE SECONDS BEFORE THE LIBRARY LANDS ---------------------------------------
       REPORTED AS "when i click on questions it takes long to load". Measured on a 1.6 Mbps link
       at 4x CPU: `data/questions.json` is 605 KB gzipped, its body takes about eight seconds, and
       for every one of them the Find screen read "Nothing in the shop or the library yet." — this
       repository's oldest fault, on its main screen, on every first visit.

       `LIBRARY_ROWS` IS THE STATE AND IT IS THE APP'S OWN. `null` until the file lands, `[]` when
       it legitimately holds nothing — so this seeds through the same door the boot uses rather
       than inventing a flag, which is what every other state here does. The memo has to go with
       it, or `stuffItems` hands back the list it built when the library WAS there.

       `leave` PUTS IT BACK, because states run in order down one page and every state after this
       one would otherwise be measuring an app with no library. */
    { name: 'the library still coming',
      enter: () => {
        /* EVERY LIST, NOT JUST THE QUESTIONS. CLAUDE.md records why the empty-state branch is hard
           to reach at all: "on this site the list is NEVER empty, because the payload carries
           tutors and venues" — so clearing `DATA.questions` alone leaves the funnel drawing a
           question about three venues and this state measures the wrong screen. Before `load()`
           has finished, nothing is there; that is what this is. */
        window.__LIB_HELD = { rows: LIBRARY_ROWS, data: {} };
        Object.keys(DATA).forEach(k => {
          if (Array.isArray(DATA[k])) { window.__LIB_HELD.data[k] = DATA[k]; DATA[k] = []; }
        });
        LIBRARY_ROWS = null;
        /* EVERY MEMO, AND `DATA` IS WHAT THEY ARE KEYED ON. `stuffItems` and `stuffFiltered` both
           hold `from: DATA` by object identity, so emptying its arrays leaves all three handing
           back the 5,587 items they built when the payload was whole -- which is a state the app
           is never in and would have measured the wrong screen. */
        ITEM_MEMO = {}; ALL_MEMO = {}; FIND_MEMO = {};
        STUFF.filters = []; STUFF.q = '';
        paintStuff();
      },
      leave: () => {
        const held = window.__LIB_HELD || { rows: null, data: {} };
        Object.keys(held.data).forEach(k => { DATA[k] = held.data[k]; });
        LIBRARY_ROWS = held.rows;
        ITEM_MEMO = {}; ALL_MEMO = {}; FIND_MEMO = {};
        paintStuff();
      },
      expect: () => /still coming/.test(document.getElementById('s-stuff').textContent || ''),
      wants: 'the Find screen to say the questions are still coming, not that there are none' },
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
    /* ---------- A BUNDLE OF PAPERS, WHICH ONLY A NARROWED LIST OFFERS ------------------------------
       THE CARD EXISTS ONLY WHEN THE RESULTS ARE WHOLE PAPERS — see `bundleOf_` — so `go('stuff')`
       never shows one, and neither does any state above: a search for "work out" is questions from
       everywhere, and six answers into the worksheets is not a set of papers. Nothing here would
       ever have measured it, which is the hole the receipt, the message thread and the basket were
       each in before a state put them on the screen.

       THE WIDEST ONE ANYBODY REACHES BY ANSWERING, on purpose: Edexcel GCSE Higher over the
       `2017 & 2018` bucket is twelve papers in four sittings, grouped a line per sitting — the
       longest list and the longest title the card is drawn with on the owner's own example. A
       three-paper bundle would measure the easy case.

       FOUND BY THE PAGE IT IS ON rather than by a number, because the leading pages in front of the
       results change with what else is offered, and a literal would land on the wrong one.

       AND IT PUTS THE BASKET BACK AS WELL AS THE FUNNEL. `check/press.js` presses the trolley here,
       which writes twelve lines to `localStorage` — and states run in order down one page, so a
       basket left full would be measured on the Tools column as though somebody had filled it. */
    { name: 'a bundle of papers',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' },
                         { field: 'kindLabel', value: 'Questions' },
                         { field: 'subject', value: 'Maths' },
                         { field: 'documentType', value: 'Past paper' },
                         { field: 'level', value: 'GCSE' },
                         { field: 'tier', value: 'Higher' },
                         { field: 'examWave', value: '2017 & 2018', bucket: true }];
        paintStuff();
        const card = document.querySelector('#s-stuff .card.bundle');
        const page = card && card.closest('.page');
        if (!page) throw new Error('the funnel narrowed to twelve whole papers offers no bundle');
        goPage('stuff', [].indexOf.call(page.parentNode.children, page), true);
      },
      expect: () => {
        const c = document.querySelector('#s-stuff .card.bundle');
        return !!c && c.querySelectorAll('.bundle-list li').length >= 2
               && !!document.querySelector('#s-stuff [data-do="cart-add"][data-kind="bundle"]');
      },
      wants: 'a bundle card listing its papers, with a trolley to put them in the basket',
      leave: () => {
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
        CART = []; cartSave(); if (typeof cartPaint_ === 'function') cartPaint_();
      } },
    /* ---------- AND THE DOCUMENT BEHIND THE TILE -----------------------------------------------
       THE LONGEST SURFACE IN THE APP, AND IT IS NOT ON A SCREEN. A practical's guide opens in the
       sheet, which is where it had to go: 51 of the 56 practical cards were already taller than
       the pane before a word of it was written, so a guide on the card would have been a guide
       below the fold. `#sheet` is a sibling of the screens rather than a child of one, so nothing
       here could see it until `inspect` was taught to — see the note there.

       THE KIT, THE METHOD AND THREE TEXTAREAS, none of it measured for a tap target, a contrast
       ratio or a sideways scroll until this.

       IT OPENED A SHEET AND THERE IS NO SHEET ANY MORE. "I HATE POP UP" — so `practicalCard_`
       draws the guide inline and the tile, its handler and `openSheet` are all gone from this
       path. A state that opened a surface the app no longer has would be measuring something
       nobody can see, which is this repository's oldest fault pointed at its own lab. It answers
       the funnel down to the practicals and turns to the first result instead, which is the app's
       own door and the state a person is actually in.

       IT WAS EIGHT BOXES AND A RISK LIST until the guide was cut to the five things its own note
       names.

       LAST IN THE LIST, AND IT PUTS THE FUNNEL BACK. States run in order down one page, so a
       funnel left narrowed to the practicals would be measured again as part of Tools and Games.
       `leave` is what says so. */
    { name: 'a practical guide',
      enter: () => {
        const x = stuffItemsAll_().find(it => it.kind === 'practical' && !it.row.excluded);
        if (!x) throw new Error('no practical in the list to draw a card for');
        /* THE FUNNEL'S OWN ANSWER, not a hand on the list. `kindLabel` is what the `What kind`
           question writes, so this is the chip a thumb would have set. */
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label }];
        paintStuff();
        /* ONTO THE WORKSHEET, which is the fourth page of the first practical now — "split into
           widgets. diagram, equipment, steps, worksheet bit." Found off the app's own
           `stuffPages_` rather than counted as `+ 3`, because a practical with no method would have
           three pages and a literal would land on the next practical's card. The pager keeps five
           pages either side filled, so the card, the kit and the method are all in the DOM too
           and the expect below asks about all four. */
        const at = typeof stuffPages_ === 'function'
          ? Math.max(0, stuffPages_().findIndex(pg => pg.part === 'work')) : 0;
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + at);
      },
      /* THE NUMBER IS ASSERTED RATHER THAN DESCRIBED — `>= 3` would pass on a guide that had
         quietly grown a fourth question nobody decided on, and this state is the only thing that
         renders one. And the kit is asked for as a LIST — `.prac-kit ul > li` — and as nothing
         else: it was Google-Docs-style chips for a while and went back to bullets on "the google
         chip idea didnt work how i wanted to so revert back", so a `.kit-chip` turning up again is
         the reverted shape coming back and fails here rather than passing as "a kit was drawn". */
      expect: () => {
        /* ONE CARD, NOT THE SCREEN. The windowed pager keeps about six result pages in the DOM at
           once, so counting `.gd-box` across `#s-stuff` counts six guides and answers 18 — which
           is what the first version of this did, and it reported the state unreachable on a screen
           that was drawing it perfectly. The count is per card because the claim is per card. */
        /* FOUR CARDS, EACH ASKED ABOUT ITS OWN JOB. The worksheet holds exactly the three boxes;
           the kit page holds the list; and the practical's own card holds NEITHER — a first card
           that still carried the guide would pass the other two tests while being the one long
           card this split replaced. And no part page carries a drawing: the picture is on the
           first card and only there. */
        const main = document.querySelector('#s-stuff .card.prac:not(.prac-part)');
        const work = document.querySelector('#s-stuff .card.prac-part.is-work');
        const kit  = document.querySelector('#s-stuff .card.prac-part.is-kit');
        const steps = document.querySelector('#s-stuff .card.prac-part.is-steps');
        return !!main && !!work && !!kit && !!steps
               && work.querySelectorAll('.gd-box').length === 3
               && !!kit.querySelector('.prac-kit ul > li')
               && !kit.querySelector('.kit-chip')
               && !!steps.querySelector('.prac-steps li')
               && !main.querySelector('.gd-box, .prac-kit, .prac-steps')
               && !document.querySelector('#s-stuff .prac-part figure');
      },
      wants: 'a practical split over four cards — the card, the kit list, the steps, and a worksheet of three boxes',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A QUIZ, PART-ANSWERED --------------------------------------------------------
       BOTH STATES OF THE ROW, IN ONE SCREEN. A quiz question is drawn one of two ways — unanswered,
       with four live buttons; answered, with the right one marked, the wrong one outlined and the
       explanation underneath — and they have different heights, different colours and different
       controls. Measuring only the first would be measuring half the feature, which is exactly what
       `check/ui.js` had been doing to the booking column for as long as the fixture's one job named
       neither visitor.

       ANSWERED THROUGH `localStorage` RATHER THAN BY PRESSING, which is the door this feature
       actually uses: `quizRow_` reads the stored answer and works the mark out itself, so seeding
       the key is the same thing as having pressed the button — and it is what proves the two paths
       agree. `quizKey_` is the app's own key-builder for the reason the seeded message thread uses
       `MESSAGES`: a second spelling of that key here would be a second thing to keep in step.

       AND IT PUTS THE FUNNEL BACK, for the reason the guide above does. It opened a SHEET until
       "ok get rid of the other pop up menu" took the quiz onto its card; a state that opens a
       surface the app no longer has measures something nobody can see. */
    { name: 'a quiz',
      enter: () => {
        const any = stuffItemsAll_().find(it => it.kind === 'quiz');
        if (!any) throw new Error('no quiz in the list to draw a card for');
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(any).label }];
        paintStuff();
        /* ---------- SEEDED ON THE QUIZ THE SCREEN WILL ACTUALLY SHOW -------------------------
           NOT ON `stuffItemsAll_()`'s FIRST, which is a different order from the funnel's: the
           list is sorted before it is paged, so seeding one quiz and landing on another would
           leave this state measuring an untouched card and reporting the marked states missing.
           `stuffFiltered()` after the repaint is the order the pages are built from. */
        const x = stuffFiltered()[0];
        if (!x) throw new Error('the funnel returned no quiz after filtering to them');
        /* One right and one wrong, so both marked states are on the screen at once. A quiz where
           everything is right measures no red, which is half the rules in the block. */
        const pick = (x.row.qs || []).filter(q => q.kind === 'choice');
        if (pick.length >= 2) {
          localStorage.setItem(quizKey_(x, pick[0].n), pick[0].answer);
          const other = (pick[1].choices || []).find(c => c !== pick[1].answer);
          if (other) localStorage.setItem(quizKey_(x, pick[1].n), other);
        }
        paintStuff();
        goPage('stuff', typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1);
      },
      /* ONE CARD, NOT THE SCREEN, for the reason the guide's own expect records: the windowed
         pager holds about six result pages at once, so a count across `#s-stuff` counts six
         quizzes. The seeded one is the first, which is what the `stuffFiltered()[0]` above buys. */
      expect: () => {
        const c = document.querySelector('#s-stuff .card.quiz');
        return !!c && c.querySelectorAll('.quiz-q').length >= 3
               && !!c.querySelector('.quiz-q.is-right')
               && !!c.querySelector('.quiz-q.is-near')
               && !!c.querySelector('.quiz-why');
      },
      wants: 'a quiz card with one question right, one wrong, and both explanations drawn',
      /* ---------- IT CLEARS THE QUIZ IT SEEDED, AND IT USED TO CLEAR A DIFFERENT ONE ------------
         THIS READ `stuffItemsAll_()`'s FIRST QUIZ, which was the same one `enter` seeded while
         `enter` read that list too. It does not any more — the seed moved to `stuffFiltered()[0]`,
         which is the funnel's own order — so looking the quiz up the old way would clear five keys
         on a quiz nobody touched and leave five behind on the one that was. States run in order
         down one page, so those would still be there when Tools and Games are measured.

         BOTH ENDS READ THE SAME LIST NOW, which is the only arrangement where they cannot drift —
         the sentence this repository writes about `documents_()`, `factsNow_` and `childrenOf`. */
      leave: () => {
        const x = stuffFiltered()[0];
        if (x && x.kind === 'quiz') (x.row.qs || []).forEach(q => {
          try { localStorage.removeItem(quizKey_(x, q.n)); } catch (e) {}
        });
        STUFF.filters = [];
        paintStuff();
        goPage('stuff', 0);
      } },
    /* ---------- A DIAGRAM YOU CAN DRAW ON, WITH THE PEN OFF ------------------------------------
       THE SURFACE THE REPORT WAS ABOUT, AND NOTHING HAD EVER RENDERED IT. 169 rows in the library
       want a pen and 26 carry the picture to put one over — and every one of them is inside the
       funnel behind a filter, so `check/ui.js` has measured question cards for as long as it has
       existed without once measuring the one that carries a control over a drawing.

       OFF RATHER THAN ON, because off is the state the card ARRIVES in and the state the report
       was about: "when you are drawing its moving the widget itself". Armed, the card differs by a
       gold frame and a gold fill, which the contrast rule has already seen on other surfaces; the
       lock control's gold-on-sunk outline is new here and is the thing worth measuring.

       BY `paperId` AND THEN BY POSITION, not by `kindLabel`. Every question in the library is one
       `kindLabel`, so filtering on it and taking the first would land on whichever question sorts
       first — which is not a pen card. The paper is the narrowest chip that reaches this row, and
       `stuffFiltered()` after the repaint is the order the pages are built from, for the reason the
       quiz state above records. */
    { name: 'a diagram you can draw on',
      enter: () => {
        const pen = stuffItemsAll_().find(it => it.kind === 'question'
          && typeof padSource_ === 'function' && padSource_(it));
        if (!pen) throw new Error('no question in the list carries a pen');
        /* THE VALUE THE FACET ITSELF WOULD READ, not a field name written out here. `paperId`'s
           `of` is `x.row.paper_id` and the item carries no `paperId` of its own — so a state that
           reached for one would set a chip matching nothing and report the app broken, which is
           what the first version of this did. */
        const facet = FACETS.find(f => f.field === 'paperId');
        if (!facet) throw new Error('there is no paperId facet to narrow by');
        STUFF.filters = [{ field: 'paperId', value: facet.of(pen) }];
        paintStuff();
        const at = stuffFiltered().indexOf(pen);
        if (at < 0) throw new Error('the paper chip does not return its own pen question');
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + at);
      },
      /* THE PICTURE AND ITS CONTROL, PER CARD. `.qpad-art[data-do]` is the half that was missing —
         a pad whose picture is not a door is the card as it was reported, and it measures perfectly
         either way, so it has to be asserted rather than looked at. */
      expect: () => {
        const c = document.querySelector('#s-stuff .qpad');
        return !!c && !!c.querySelector('.qpad-art[data-do="pad-draw"]')
               && !!c.querySelector('.qpad-lock')
               && !c.classList.contains('is-drawing');
      },
      wants: 'a question card whose diagram takes a pen, with the lock control drawn and the pen off',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
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
  /* ---------- THE SAVED COLUMN, IN BOTH OF ITS STATES --------------------------------------------
     IT IS EMPTY FOR EVERY VISITOR ON A FRESH BROWSER, which is the state `check/press.js` and
     `check/ui.js` would both have measured and the only one they could reach — the same hole the
     booking receipt and the message thread were in, and the one the removed Carry-on block was in
     when a whole feature went unpressed. A column whose contents come from `localStorage` needs a
     state that seeds it or the lab reports a clean sweep of a card it never saw.

     SEEDED THROUGH `toggleFav`, THE APP'S OWN WRITER, rather than by writing the key out here: the
     prefix is `WIDGET_KEY`'s and a second spelling of it would be a second thing to keep in step.
     `leave` takes them back off, because states run in order down one page. */
  /* ---------- AN UNLISTED TUTOR, WHICH ONLY AN ADMIN IS SENT --------------------------------------
     REPORTED AS "where did george dissapear off to?" — and this column had been filtering unlisted
     tutors back out on the phone after `doGet` had deliberately sent them to an admin, so that
     `findCard`'s dimmed `· not listed` row and `asItem_`'s `off` flag were both unreachable code.

     NO FIXTURE CAN HOLD THIS ONE. `check/fixture.json` has a single tutor and she is listed, so the
     only account column the lab has ever measured is the one where every row is live — which is the
     hole the booking receipt, the message thread and the basket were each in. Seeded onto
     `DATA.tutors`, which is where `accountPages_` reads from and what `load()` fills.

     `only:` BECAUSE A NON-ADMIN IS NEVER SENT ONE. `doget.gs` gates it on `viewerIsAdmin`, so
     asking a stranger to reach this state would report a fault about the check rather than the app
     — the same argument as the films two blocks up. */
  account: [
    { name: '' },
    /* ---------- THE HANDLE, WITH EXACTLY ONE `@` IN FRONT OF IT ----------------------------------
       ASKED FOR AS *"each person should have … handle llik \"@_____\""*, and the visible half of that
       had never existed: `doGet` has sent `handle` on every tutor since it was written and the only
       place the `@` appeared anywhere in `js/` was a toast.

       ONE, NOT AT LEAST ONE, AND THAT IS THE ASSERTION RATHER THAN A DETAIL. The fixture stated the
       handle as `@ada` — a shape `HANDLE_SHAPE` refuses and no row can hold — so a card drawing `@` +
       the cell rendered `@@ada`, and a rule that only asked whether an `@` was present would have
       passed on it. `check-handles.js` now refuses such a fixture; this refuses such a card. */
    { name: 'a handle on a card',
      only: () => typeof USER !== 'undefined' && !!USER
                  && !!((DATA.tutors || []).find(t => t && t.handle)),
      enter: () => {
        const at = [...document.querySelectorAll('#s-account .page')]
          .findIndex(pg => pg.querySelector('.prof-handle'));
        if (at < 0) throw new Error('no card on the account column draws a handle');
        goPage('account', at, true);
      },
      expect: () => {
        const el = document.querySelector('#s-account .page.on .prof-handle');
        const txt = el ? el.textContent.trim() : '';
        return (/^@[A-Za-z][A-Za-z0-9_]{2,19}$/.test(txt)) ? 1 : 0;
      },
      wants: 'a handle drawn as exactly one @ and a shape a row could hold' },
    { name: 'a tutor switched off',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        window.__OFF_HELD = (DATA.tutors || []).slice();
        DATA.tutors = (DATA.tutors || []).concat([Object.assign(
          {}, (DATA.tutors || [])[0] || {},
          { personId: 'P-unlisted', handle: 'unlisted', title: 'Switched Off',
            subtitle: 'Maths, GCSE', listed: false })]);
        paint('account');
        /* THE PAGE NUMBER COMES FROM THE BUILDER THE COLUMN IS DRAWN FROM, not from a second
           re-derivation of `others` here — which is the fault the flyer state above records, where
           a count of one list indexed a column built from another. `termsPages_()` is concatenated
           after these, so counting from the end would land on a legal document. */
        const n = accountPages_().findIndex(h => /prof-off/.test(h));
        if (n < 0) throw new Error('the unlisted tutor is not on the account column');
        goPage('account', n, true);
      },
      /* ---------- AND THE LINE THAT SAYS WHAT THE MARK MEANS -----------------------------------
         THE THREE SIGNALS THIS STATE ALREADY MEASURED ALL SAY A STATE AND NONE SAYS WHAT TO DO.
         The card dims, the role reads `· not listed`, the tile shows a crossed-out eye — and
         `tile_` puts a tile's label in `title` and `aria-label` only, so on a phone the way back
         is an unlabelled icon in a row of icons. Reported three times as *"i still dont see
         george"* about a tutor who was on the screen. The sentence is admin-only, so this is the
         only state in the file that can reach it. */
      expect: () => document.querySelector('#s-account .card.is-widget.is-off .prof-off')
                 && document.querySelector('#s-account .card.is-widget.is-off .prof-hid'),
      wants: 'the unlisted tutor drawn, dimmed, with "· not listed" and the line saying what it means',
      leave: () => {
        if (window.__OFF_HELD) DATA.tutors = window.__OFF_HELD;
        paint('account');
      } },
  ],

  /* ---------- THE SETTINGS COLUMN, WHICH THIS FILE HAD NEVER DECLARED A STATE FOR ----------------
     IT HAS THIRTEEN PAGES AND THE LAB HAD ONLY EVER SEEN THE FIRST. `check/ui.js` measures the page
     a column opens on, so `About you` was the whole of Settings as far as this file was concerned
     — and that column now also holds the library cards and the wardrobe card. Same fault as
     the Find screen measured only on its first question, one column along: what was missing was
     never a rule, it was a state.

     THE WARDROBE IS FOUND BY ASKING THE DOM. A literal page number would drift the moment a
     deployment sends one `profileFields` group fewer, and a state that lands on the wrong page fails loudly
     through `expect` rather than measuring the wrong card in silence. */
  settings: [
    { name: '' },
    /* ---------- THE FOUR FIELDS THAT ARE THE QUOTE, WHICH THE FIXTURE HAD NEVER SENT -------------
       `Group size` AND `Your rate` WERE TWO PAGES WITH A SAVE EACH and are one page now, because
       they are one decision and one monthly clock — asked for as *"…all together. and they can only
       change once a month."* `check/fixture.json` carried neither group, so the lab has never
       rendered a pricing box at all: the same hole the booking receipt, the message thread and the
       basket were each in, and the third time in three commits that the fixture was found stating a
       shape `doGet` does not send.

       FOUND BY ASKING THE DOM for the rate box, exactly as the wardrobe state below does. A literal
       page number drifts the moment a deployment sends one group fewer. */
    { name: 'the rate and group size',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('[data-me="rate_per_hour"]'));
        if (at < 0) throw new Error('no pricing page on the settings column');
        goPage('settings', at, true);
      },
      /* EXACTLY FOUR, NOT MERELY SOME. `expect` is read as a truthy value, so a page holding two
         boxes would pass a bare count — and two is precisely what splitting the group back into
         `Group size` and `Your rate` produces. The whole point is that they are on ONE page, so the
         number is the assertion. */
      expect: () => (document.querySelectorAll('#s-settings .page.on [data-me]').length === 4
                     && document.querySelectorAll('#s-settings .page.on .f-row.is-range [data-me]').length === 2
                     ? 4 : 0),
      wants: 'all four pricing boxes on one page, the students as one min – max row' },

    /* ---------- THE TUTOR AGREEMENT, BOTH OF ITS STATES --------------------------------------------
       The signed-in visitor is an admin, and `isTutorRole()` is tutor-or-admin, so the card is on
       the column. Seeded as SIGNED through `USER` — the field `loginReplyFor_` sends — because the
       locked box is the half that is easy to get wrong: a ticked box a repaint draws unticked is the
       `REEL_HELD` fault, and a signed agreement that can be clicked again is the whole complaint.
       `leave` puts the visitor back as unsigned, since states run in order down one page. */
    { name: 'the tutor agreement, signed',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        USER.agreementSignedAt = '28/09/26 18:20'; USER.agreementVersion = AGREEMENT_VERSION;
        /* A CLEAN COLUMN FIRST. `paint('settings')` is refused while a card has something typed in
           it — `settingsKeep_`, so a Save's reload cannot throw away another card's typing — and
           `check/press.js` has been typing into these cards for a minute before any state runs. The
           refused paint left the state measuring the card from before its own seed, and reported
           two settings states as not arriving that `check/ui.js`, which types nothing, found fine. */
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('[data-do="agree-sign"]'));
        if (at < 0) throw new Error('no agreement card on the settings column');
        goPage('settings', at, true);
      },
      leave: () => { delete USER.agreementSignedAt; delete USER.agreementVersion;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings'); },
      expect: () => {
        const b = document.querySelector('#s-settings .page.on [data-do="agree-sign"]');
        return b && b.checked && b.disabled
          && document.querySelectorAll('#s-settings .page.on .agree-list li').length >= 8;
      },
      wants: 'the agreement, ticked and locked, with its points' },

    /* THE ADMIN'S CUT OF AN EXTRA CHILD: a box holding the current figure and a sentence saying it
       in money. The fixture carries no `boss_rate`, so this is the "none set" state, which is the
       one a new sheet is in. */
    { name: "the admin's cut of an extra child",
      only: () => typeof USER !== 'undefined' && !!USER && isAdmin(),
      enter: () => {
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('#cut-val'));
        if (at < 0) throw new Error('no cut card on the settings column');
        goPage('settings', at, true);
      },
      expect: () => document.querySelector('#s-settings .page.on #cut-val')
        && /extra child adds/.test((document.querySelector('#s-settings .page.on .cut-say') || {}).textContent || ''),
      wants: 'the share box and its worked example' },

    /* ---------- UP TO TEN QUALIFICATIONS ON ONE PAGE, SHOWN AS WHAT IS FILLED IN -------------------
       ASKED FOR AS *"allow to add as many qualifications as you like (up to 10)"*. All ten are IN
       the page — forty controls under one Save, because the packer rebuilds the whole `quals` cell
       from what arrives — and only the filled ones (or one empty one) are SHOWN, with `Add another`
       revealing the next. So this presses `Add another` once and asks for exactly one more card
       showing than it arrived with: a shelf that drew all ten, or one whose button did nothing,
       both measure perfectly and both fail this.
       FOUND BY ASKING THE DOM for the tenth slot's board box, which exists whether or not it shows. */
    { name: 'the qualifications',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        /* ONE SLOT FILLED, through `USER.profile`, which is what `loginReplyFor_` fills and what the
           column is drawn from. The fixture's admin has no qualifications, so without this every card
           is empty, every card is open, and a collapse that never shuts anything measures perfectly. */
        window.STATE_QUAL_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {},
          { qual_1: 'Maths', qual_1_level: 'A-Level', qual_1_grade: 'B', qual_1_board: 'Edexcel' });
        /* A CLEAN COLUMN FIRST — see the agreement state above. */
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const pages = [...document.querySelectorAll('#s-settings .page')];
        const at = pages.findIndex(pg => pg.querySelector('[data-me="qual_10_board"]'));
        if (at < 0) throw new Error('no qualifications page on the settings column');
        goPage('settings', at, true);
        const shelf = pages[at].querySelector('[data-me="qual_1"]').closest('.lib-shelf');
        window.STATE_QUALS_SHOWN = shelf.querySelectorAll('.lib-card:not([hidden])').length;
        const more = shelf.querySelector('[data-do="shelf-more"]');
        if (more) more.click();
      },
      leave: () => {
        delete window.STATE_QUALS_SHOWN;
        USER.profile = window.STATE_QUAL_WAS; delete window.STATE_QUAL_WAS;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
      },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        const shelf = pg && pg.querySelector('[data-me="qual_1"]');
        const box = shelf && shelf.closest('.lib-shelf');
        /* SEVENTY: four boxes, the received year and the two ticks per slot, which replaced the
           `What you teach` and studying pages — and exactly twenty ticks, so a shelf that lost its
           `I teach this` / `Specialise` pair fails here rather than drawing a page that looks fine. */
        return box && pg.querySelectorAll('[data-me^="qual_"]').length === 70
          && pg.querySelectorAll('[data-do="qual-tick"]').length === 20
          && pg.querySelectorAll('[data-do="me-save"]').length === 1
          /* ONE SUMMARY BUTTON PER SLOT, and every filled slot arrives SHUT — a filled card drawn open
             is the 802px page the collapse exists to prevent, and it measures perfectly. */
          && box.querySelectorAll('.q-card > .q-sum[data-do="qual-open"]').length === 10
          && box.querySelectorAll('.q-card.is-shut').length >= 1
          && [...box.querySelectorAll('.q-card')].every(c =>
               [...c.querySelectorAll('[data-me^="qual_"]')]
                 .some(el => !/_(teach|spec)$/.test(el.dataset.me) && String(el.value || '').trim())
               === c.classList.contains('is-shut'))
          && box.querySelectorAll('.lib-card:not([hidden])').length === window.STATE_QUALS_SHOWN + 1
          ? 70 : 0;
      },
      wants: 'ten qualification slots with their received year and two ticks under one Save, and Add another revealing exactly one more' },

    /* ---------- THE THREE DATE-OF-BIRTH BOXES, ON A GROUP THE FIXTURE DID NOT HAVE ---------------
       `check/fixture.json` SENT NO `Contact` GROUP, so nothing in this lab had ever drawn a date of
       birth at all — the fourth time that file has been found stating a shape `doGet` does not
       send, after `focus` as a string, the receipt's `sessionDates` against `dates`, and the job's
       `students` and `venue`. `PROFILE_GROUPS` has had `['email','phone','date_of_birth']` since it
       was written; the fixture has it now too, in the same place.

       EXACTLY THREE, NOT MERELY SOME. `expect` is read as a truthy value, so a page holding one box
       passes a bare count — and one box is precisely what the version before this drew. The number
       IS the assertion, which is the same reason the pricing state counts to four.

       FOUND BY ASKING THE DOM, like every other state on this column: `settingsPages_`'s length
       varies with what the backend sends, so a literal page number drifts the moment a deployment
       sends one group fewer. */
    { name: 'a date of birth',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('[data-me="dob_d"]'));
        if (at < 0) throw new Error('no date-of-birth page on the settings column');
        goPage('settings', at, true);
      },
      expect: () => (document.querySelectorAll('#s-settings .page.on .dob-boxes [data-me]').length === 3
                     && document.querySelectorAll('#s-settings .page.on [data-me="date_of_birth"]').length === 0
                     ? 3 : 0),
      wants: 'three date-of-birth boxes and no fourth box for the column itself' },

    /* ---------- THE TWO EXAM DATES, WHICH ONLY A STUDENT IS OFFERED ------------------------------
       ASKED FOR AS *"allow student accounts to be able to write exam dates. like Small exam: _____
       big exam:_____."* The group is in `STUDENT_GROUPS` and in neither of the other two maps, which
       is what makes it appear for a student and for nobody else — so it is unreachable as the admin
       every other state on this column is measured as, and would have gone unmeasured for exactly
       that reason.

       `USER.role` IS THE APP'S OWN DOOR AND IS WHY THIS IS NOT A POKE. `loginReplyFor_` sends the
       role and `data.js` writes it onto `USER`, so a state that sets it and repaints is the state a
       student's own sign-in produces — the same argument as the message thread seeded through
       `MESSAGES`, which is what `loadMessages` writes.

       `studentFields` WAS `[]` IN THE FIXTURE, which is not what `doGet` sends — it sends
       `STUDENT_GROUPS`, an object — so `Object.keys([]).length` was 0, `settingsPages_` fell through
       to the tutor's map, and a student's whole settings column has never been drawn here at all.
       The FIFTH time that file has been found stating a shape the server does not send.

       IT PUTS THE ROLE BACK, because states run in order down one page and a lab left holding a
       student would measure every column after this one as the wrong visitor. */
    { name: 'the exam dates',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_ROLE_WAS = USER.role;
        USER.role = 'student';
        /* A CLEAN COLUMN FIRST — see the agreement state above. */
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        repaint();
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('[data-me="exam_small_date"]'));
        if (at < 0) throw new Error('no exam-dates page on the settings column');
        goPage('settings', at, true);
      },
      leave: () => { USER.role = window.STATE_ROLE_WAS;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        repaint(); },
      /* BOTH, AND BOTH A REAL DATE PICKER. `expect` is truthy-read, so a bare count passes on a page
         holding two plain text boxes — which is precisely what `FIELD_IS_DATE` failing to match
         produces, and the whole point of the `_date` suffix. So the type is the assertion. */
      expect: () => (document.querySelectorAll('#s-settings .page.on input[type="date"][data-me]')
                       .length === 2 ? 2 : 0),
      wants: 'two exam-date boxes, both drawn as a date picker' },

    /* ---------- MORE QUALIFICATIONS, WITH ITS LIST OPEN ------------------------------------------
       `extra_quals` IS A DROP-DOWN THAT STAYS OPEN — `#drop`, borrowed from the booking form, which
       is a sibling of the screens rather than inside one. So the only way this lab ever sees the
       panel, or the press pass ever reaches `me-many-pick`, is a state that opens it: the same hole
       `booking · a list of answers open` was written to close. Opened through the app's own door,
       the field's button, and shut again on the way out because states run in order down one page
       and an open panel would be measured as part of every state after this one. */
    { name: 'more qualifications open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const pages = [...document.querySelectorAll('#s-settings .page')];
        /* BY FIELD, so this goes on meaning `extra_quals` whichever page carries it — it sits under
           the qualifications shelf now that the "What you teach" page is gone. */
        const q = '[data-do="me-many"][data-field="extra_quals"]';
        const at = pages.findIndex(pg => pg.querySelector(q));
        if (at < 0) throw new Error('no several-of-a-list field on the settings column');
        goPage('settings', at, true);
        pages[at].querySelector(q).click();
      },
      leave: () => { if (typeof meDropShut_ === 'function') meDropShut_(); },
      expect: () => {
        const el = document.getElementById('drop');
        return !!el && !el.classList.contains('hidden')
          && el.querySelectorAll('[data-do="me-many-pick"]').length > 7;
      },
      wants: 'the qualifications list open under its field, with more than seven to tick' },

    /* "ALSO TEACH, OPEN" WENT WITH THE PAGE. What a tutor teaches is two ticks on each
       qualification now — `the qualifications` above counts them — and `teaches_also` is derived
       from those on save, so there is no panel on this column to open. */

    /* ---------- THE WARDROBE IS ONE CARD NOW, SO ONE STATE FINDS IT AND A SECOND PRESSES IT --------
       It was four pages — Colours, then the six slots two at a time — and these two states found the
       colour page and then the first slot page. *"should just be 1"*: one card holds the swatches, all
       six slots and ONE figure, so both states land on the same page and ask different things of it. */
    { name: 'the wardrobe',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('[data-do="av-colour"]'));
        if (at < 0) throw new Error('no wardrobe card on the settings column');
        goPage('settings', at, true);
      },
      /* ONE CARD: the swatches AND the slots on the same page, and ONE figure — the report was the
         same picture drawn four times, so the count of figures is the assertion. */
      expect: () => {
        const pages = [...document.querySelectorAll('#s-settings .page')];
        const pg = pages.find(p => p.querySelector('[data-do="av-colour"]'));
        return pg && pg.querySelector('[data-do="av-pick"]')
          && document.querySelectorAll('#s-settings .av-figure').length === 1
          && pages.filter(p => p.querySelector('[data-do="av-pick"], [data-do="av-colour"]')).length === 1;
      },
      wants: 'one wardrobe card holding the colours, every slot and one figure' },

    /* ---------- AND A PICK, WHICH IS WHERE THE DUPLICATE-ID FAULT LIVED -------------------------
       WITH FOUR PAGES THE FIGURE WAS ON EVERY ONE, and as `id="av-figure"` `$()` handed `avatarSave`
       the first — so a pick on one page redrew the figure on another. One card makes that impossible
       rather than guarded, and the state stays because the immediate redraw is still the thing a
       wardrobe is for: the item chosen is the first unlocked one that is not already worn, because
       pressing the one already on is a save that changes nothing. */
    { name: 'a pick redraws the figure',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const pages = [...document.querySelectorAll('#s-settings .page')];
        const at = pages.findIndex(pg => pg.querySelector('[data-do="av-pick"]'));
        if (at < 0) throw new Error('no wardrobe card on the settings column');
        goPage('settings', at, true);
        /* THE PAGE BY INDEX, NOT BY `.page.on` — `goPage` sets that class through `paintPager`, and
           reading it in the same tick finds the page the column was on before the turn. */
        const pg = pages[at];
        const fig = pg.querySelector('.av-figure');
        const was = fig ? fig.innerHTML : '';
        const pick = [...pg.querySelectorAll('[data-do="av-pick"]')]
          .find(b => !b.classList.contains('on') && !b.classList.contains('locked'));
        if (pick) pick.click();
        /* READ IN THE SAME TICK AS THE PRESS. `avatarSave` redraws before the server answers, and
           read later the answer is the stub's: `check/fixture.json` carries no `avatar` key, so the
           figure would go back to the default and this would report the app broken for the
           fixture's shape.
           ASKED OF THE CARD AS IT NOW IS. `avatarSave` rebuilds the card's inside from `wardrobeCard_`
           — so the ring, a bought item's lock and the credits line follow the look, not only the
           figure — which means the figure read before the press is a detached element afterwards.
           And the picked item must now carry the ring: that half is what the rebuild is for. */
        const now = pg.querySelector('.av-figure');
        const ringed = pick && pg.querySelector('[data-do="av-pick"][data-slot="' + pick.dataset.slot
          + '"][data-id="' + pick.dataset.id + '"].on');
        window.__AV_MOVED = !!now && !!was && now.innerHTML !== was && (!pick || !!ringed);
      },
      expect: () => window.__AV_MOVED,
      wants: 'the figure on the wardrobe card redrawn by a pick made on it' },
  ],

  saved: [
    { name: 'nothing kept' },
    { name: 'two widgets kept',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        widgetsOf_('tool').slice(0, 2).forEach(w => {
          if (!isFav(WIDGET_KEY(w))) toggleFav(WIDGET_KEY(w), 'widget');
        });
        paint('saved');
      },
      expect: () => document.querySelectorAll('#s-saved .widget-slot').length >= 2
                 && document.querySelector('#s-saved .tile.on'),
      wants: 'two starred widgets on the column, each with a filled star',
      leave: () => {
        widgetsOf_('tool').slice(0, 2).forEach(w => {
          if (isFav(WIDGET_KEY(w))) toggleFav(WIDGET_KEY(w), 'widget');
        });
        paint('saved');
      } },
  ],

  /* ---------- THE SHOP WINDOW, EMPTY AND FULL, AND THE EMPTY ONE IS TWO DIFFERENT CARDS --------
     `check/fixture.json` SENDS `spotlight: []`, so the unnamed state below is the empty column —
     and it is not one card but two, because the sentence an ADMIN is shown says how to fill it and
     the one everybody else is shown says what the column is for. Both are measured, because the
     unnamed state runs for both visitors.

     SEEDED THROUGH THE PAYLOAD AND `adoptSpotlight_`, which is the app's own door: `DATA.spotlight`
     is what the backend sends and that function is the only thing that reads it. Poking `SPOT`
     directly would measure a shape `doGet` does not send, which is the fixture fault this file has
     now been caught committing four times.

     TWO KEYS OFF `stuffItemsAll_()` RATHER THAN A LITERAL. A key written in here is a key that goes
     stale the moment the fixture changes, and the column's whole job is to draw the cards those
     keys name — a state that seeds a key nothing matches measures the EMPTY column while claiming
     to measure the full one. */
  spotlight: [
    { name: '' },
    { name: 'two things in the window',
      enter: () => {
        DATA.spotlight = stuffItemsAll_().slice(0, 2).map(x => x.key);
        adoptSpotlight_();
        paint('spotlight');
      },
      expect: () => document.querySelectorAll('#s-spotlight .page').length,
      wants: 'a page per spotlit thing',
      /* STATES RUN IN ORDER DOWN ONE PAGE, so what this wrote has to go — left behind, the empty
         column would never be measured again on this run and Saved would be measured with a
         payload key nothing else expects. */
      leave: () => { DATA.spotlight = []; adoptSpotlight_(); paint('spotlight'); } },
  ],

  tools: [
    { name: '' },
    { name: 'the cheat sheet maker',
      /* `widgetsOf_`, NOT `allWidgets()` — the note over the flyer state below says why, and this
         state was still doing the thing it describes: the flyer maker and the tutors' hours are
         gated out of a stranger's column, so `allWidgets()` put the cheat sheet two pages further
         down than the column draws it and a signed-out run turned to the calendar instead. The
         expect went on passing because every page of the column is in the document at once. */
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'mat');
        if (n < 0) throw new Error('no cheat sheet widget in the roster');
        goPage('tools', n, true);
      },
      /* NO PREVIEW, AND THAT IS PART OF WHAT IS ASSERTED. The sheet is built off screen for the
         gauge and the printer (see `matProbe`); a `.mat-sheet` back inside the card would be the
         preview returning, which the owner asked to be rid of. The gauge's sentence is what says
         the page was laid out and measured at all. */
      expect: () => !document.querySelector('#s-tools .mat-sheet')
        && document.querySelector('#s-tools #mat-said b'),
      wants: 'the picker and the gauge, with no A4 preview on the card' },
    /* ---------- AND FILLED, WHICH IS THE CARD SOMEBODY ACTUALLY PRINTS FROM ------------------------
       THE STATE ABOVE IS THE CARD AS IT OPENS — every level, nothing ticked, so the row holding
       Fill and Clear is not drawn at all and not one tick on the list is set. That is the least
       interesting version of the card to measure and the only one this file had: a subject and a
       level chosen, the page filled, the "given in the exam" notes under their rows and Print lit
       is the state the tool exists to reach, and none of it had been laid out at any width.
       ENTERED THROUGH THE CONTROLS rather than by setting `MAT_LEVEL`, because the selects and the
       button are the doors, and a state reached round them proves the drawing and not the tool.
       `leave` PUTS THE MAKER BACK AS IT OPENS, and forgets what it remembered on this device —
       states run in order down one page, and `matRecall` would otherwise open every later visit to
       the tool on a filled GCSE sheet. */
    { name: 'the cheat sheet maker, filled',
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'mat');
        if (n < 0) throw new Error('no cheat sheet widget in the roster');
        goPage('tools', n, true);
        const sub = document.querySelector('#s-tools #mat-subject');
        const lev = document.querySelector('#s-tools #mat-level');
        if (!sub || !lev) throw new Error('the cheat sheet maker has no subject or level select');
        sub.value = 'Maths'; sub.dispatchEvent(new Event('change', { bubbles: true }));
        lev.value = 'GCSE|H'; lev.dispatchEvent(new Event('change', { bubbles: true }));
        const fill = document.querySelector('#s-tools #mat-fill');
        if (!fill) throw new Error('the cheat sheet maker has no Fill button');
        fill.click();
      },
      expect: () => document.querySelector('#s-tools #mat-quick:not([hidden])')
        && document.querySelectorAll('#s-tools .mat-list input:checked').length >= 5
        && !document.querySelector('#s-tools #mat-go').disabled,
      wants: 'a subject and a level chosen, the page filled and Print ready',
      leave: () => {
        MAT_ON = []; MAT_SUBJECT = 'Maths'; MAT_LEVEL = 'all'; MAT_TIER = 'H'; MAT_EXAM = 'all';
        try { localStorage.removeItem('matChoice'); } catch (e) {}
        matPaint();
      } },
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
      /* THE SENTENCE IN PLACE OF THE PICTURE, and no picture — see `flyDraw`. */
      expect: () => !document.querySelector('#s-tools .fm-sheet')
        && document.querySelector('#s-tools #fm-said b'),
      wants: 'the flyer maker saying what will print, with no preview on the card' },

    /* ---------- AND THE BASKET, WHICH A FIXTURE CANNOT REACH AT ALL ---------------------------
       `CART` LIVES IN `localStorage`, NOT IN THE PAYLOAD, so no fixture can put anything in it:
       whichever surface the basket has been on, this file has only ever seen it empty. It was a
       page of the booking column and is a tool now — asked for as *"i want the cart to be a tool
       in the tool column"* — so the state moved with it, seeded exactly as before.

       SEEDED THE WAY THE APP FILLS IT. `CART` is what `cartCard_` reads and `cart-add` writes, and
       `initCart()` is the widget's own `start` — which is what `toolsStart_` calls when the column
       arrives, so this is the state a moment after somebody pressed the trolley on a card in Find.

       A PRICE IN THE THOUSANDS ON PURPOSE. The figure column is the thing that breaks here — it is
       sized in `ch` of a proportional font and drawn in mono — and `£2050.00` is one character
       wider than `£270.00`, which is the difference between a finding and a pass. */
    /* ---------- AND WHAT A BUNDLE PUTS IN IT, which is most of what a basket holds now --------------
       Three papers under the title of the bundle they came from, one of them laminated, and a paper
       nobody has counted the pages of — so the group's caption, the `✓ laminated` switch, the `? pp`
       and the `tbc` in the figure column are all on the screen at once. The first version of the
       laminated switch said `laminated £7.00 · plain` and put the ✕ on a line of its own at 320px;
       a basket seeded with shop items only could never have shown that. Invented lines, shaped the
       way `cartAddBundle_` writes them. */
    { name: 'the basket',
      enter: () => {
        const from = 'Edexcel · Maths · GCSE · Higher · Past papers · Summer 2017';
        CART = [{ key: 'P-1MA1-1705-1H', kind: 'print', name: 'Paper 1 (Non-Calculator) — May 2017 · Higher',
                  short: 'Paper 1', pages: 20, cost: 0, from: from, laminate: true },
                { key: 'P-1MA1-1706-2H', kind: 'print', name: 'Paper 2 (Calculator) — June 2017 · Higher',
                  short: 'Paper 2', pages: 24, cost: 0, from: from },
                { key: 'P-UNCOUNTED', kind: 'print', name: 'Paper 3 (Calculator) — June 2017 · Higher',
                  short: 'Paper 3', pages: 0, cost: 0, from: from },
                { key: 'I001', name: 'Trundle wheel, 1 m circumference', kind: 'shop',
                  cost: 0, money: 120000 },
                { key: 'I026', name: 'Tape measure, 30 m', kind: 'shop', cost: 0, money: 85000 }];
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'cart');
        if (n < 0) throw new Error('no basket widget in the roster');
        goPage('tools', n, true);
        initCart();
      },
      expect: () => document.querySelector('#s-tools [data-do="cart-send"]')
                    && document.querySelector('#s-tools .cart-box .cart-from'),
      wants: 'a basket holding a bundle under its title, with a way to send the order',
      /* PUT BACK, because states run in order down one page and an empty basket is what every
         other state on this column expects to find. */
      leave: () => { CART = []; initCart(); } },

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

  /* ---------- A HIGH-SCORE BOARD WITH SCORES ON IT ---------------------------------------------
     `check/fixture.json` HAS NO STUDENTS AND ITS ONE TUTOR SCORES NOUGHT, so the only state the lab
     could reach is the board's empty card — which is this file's own sentence about the booking
     receipt, the message thread and the basket, for a fourth time. A board of one row and a board
     of six are different objects to measure: the second is where a long handle meets a `flex: 0 0
     auto` label, and where the mark for your own line has to be visible against the rows either
     side of it. (It was also written when that card was a charcoal handheld with row colours of
     its own — see "THE HANDHELD, AND WHY IT IS NOT HERE ANY MORE" in style.css. Both boards are on
     the app's own ground now; the rest of the argument is untouched by that.)

     SEEDED THROUGH THE PAYLOAD, which is the same door `load()` uses — `scoreRanks_` reads
     `DATA.students` and `DATA.tutors` and nothing else, so putting rows there is the app arriving
     at this state rather than the harness reaching past it.

     AND THE SEEDED TUTOR IS DELIBERATELY EIGHTH. If the visitor were in the top five the board
     would never draw its other branch — your own row, appended underneath with the place you are
     actually in — and that branch is the whole reason the board is not simply `slice(0, 5)`. */
  games: [
    { name: '' },
    { name: 'a full high-score board',
      enter: () => {
        window.__seedScores = { students: DATA.students, tutors: JSON.stringify(DATA.tutors) };
        DATA.students = [
          { name: 'Beatrix', handle: 'beatrix-longhandle20', highscore: 92, ttHighscore: 61 },
          { name: 'Caleb', handle: 'caleb', highscore: 74, ttHighscore: 55 },
          { name: 'Dilnoza', handle: 'dilnoza', highscore: 68, ttHighscore: 49 },
          { name: 'Emeka', handle: 'emeka', highscore: 51, ttHighscore: 44 },
          { name: 'Fen', handle: 'fen', highscore: 40, ttHighscore: 38 },
          { name: 'Gita', handle: 'gita', highscore: 27, ttHighscore: 30 },
          { name: 'Hal', handle: 'hal', highscore: 19, ttHighscore: 21 },
        ];
        /* ---------- AND THE VISITOR HAS TO BE ON IT, OR THE OTHER BRANCH NEVER DRAWS ---------
           THE FIRST VERSION PUT A SCORE ON THE FIXTURE'S ONE TUTOR AND CALLED THAT "YOU". It is
           not: the seeded visitor is `Test Admin` / `testadmin` / `P001` and the fixture's tutor is
           `Ada Tutor` / `@ada` / `P-@ada`, so `mineIs_` correctly matched nobody and the board drew
           five rows with no mark on any of them. The assertion failed and it was right to — the
           state was wrong, not the app. Seeded off `USER` itself, so it is whoever the lab is
           signed in as rather than a name written twice. */
        if (typeof USER !== 'undefined' && USER) DATA.students.push(
          { name: USER.name, handle: USER.handle, personId: USER.personId,
            highscore: 8, ttHighscore: 7 });
        /* `repaint` RATHER THAN `paint`, and the difference is the whole state. `paint(id)` replaces
           the markup and stops there; the widgets that were running inside it are restarted by
           `startScreen_`, which only `repaint` and `go` call — so a bare `paint` here rebuilt the
           card and left the board an empty div, which is exactly what the first run of this state
           reported. Its own note says so: "a repaint rebuilds the markup it was running in". */
        repaint(true);
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'flabby');
        if (n < 0) throw new Error('no Flabby Pird widget in the roster');
        goPage('games', n, true);
      },
      /* ONE MORE ROW THAN `SCORE_TOP`, and the number is READ OFF THE APP rather than written here:
         the seed puts the visitor eighth on purpose, so the board draws the top N and then their
         own line. A literal would be the same figure in two files and the copy in this one is the
         one nobody re-reads — which is what happened the first time, when `SCORE_TOP` went from
         five to three for a measured reason and an assertion of `>= 5` failed every state.

         Signed out there is no visitor to mark, so the extra row and the mark are both asserted
         only where there is somebody to mark — the alternative is a state that fails for the
         stranger it is correctly not about. */
      expect: () => {
        const rows = document.querySelectorAll('#s-games #flappy-board .row');
        const me = document.querySelector('#s-games #flappy-board .row.is-me');
        const signedIn = typeof USER !== 'undefined' && !!USER;
        return rows.length === SCORE_TOP + (signedIn ? 1 : 0) && (!signedIn || !!me);
      },
      wants: 'the top scores plus your own line on the Flabby Pird card',
      leave: () => {
        DATA.students = window.__seedScores.students;
        DATA.tutors = JSON.parse(window.__seedScores.tutors);
        /* `repaint` RATHER THAN `paint`, and the difference is the whole state. `paint(id)` replaces
           the markup and stops there; the widgets that were running inside it are restarted by
           `startScreen_`, which only `repaint` and `go` call — so a bare `paint` here rebuilt the
           card and left the board an empty div, which is exactly what the first run of this state
           reported. Its own note says so: "a repaint rebuilds the markup it was running in". */
        repaint(true);
      } },
    /* THE SAME RENDERER IN THE OTHER CARD, and still worth its own state although the reason it
       was written for has gone. That reason was that the flappy card retoned `.row .k` and `.row
       .v` for a charcoal shell and the times-table card did not, so a contrast finding on one said
       nothing about the other; the shell went with the Game Boy panel and both boards sit on the
       app's own ground now. What is left is that `paintBoard_` is called from two `init`s and this
       is the only thing that reaches the second one — a board drawn by `initTables` and not by
       `initFlappy` is a card that measures itself into existence on one column and not the other,
       which is precisely what an empty div looked like the first time this state ran. */
    { name: 'the times-table board',
      enter: () => {
        window.__seedScoresTt = { students: DATA.students, tutors: JSON.stringify(DATA.tutors) };
        DATA.students = [
          { name: 'Beatrix', handle: 'beatrix', ttHighscore: 61 },
          { name: 'Caleb', handle: 'caleb', ttHighscore: 55 },
          { name: 'Dilnoza', handle: 'dilnoza', ttHighscore: 49 },
          { name: 'Emeka', handle: 'emeka', ttHighscore: 44 },
          { name: 'Fen', handle: 'fen', ttHighscore: 38 },
          { name: 'Gita', handle: 'gita', ttHighscore: 30 },
        ];
        if (typeof USER !== 'undefined' && USER) DATA.students.push(
          { name: USER.name, handle: USER.handle, personId: USER.personId, ttHighscore: 5 });
        repaint(true);
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'tables');
        if (n < 0) throw new Error('no times-table widget in the roster');
        goPage('games', n, true);
      },
      expect: () => document.querySelectorAll('#s-games #tt-board .row').length >= SCORE_TOP,
      wants: 'the times-table high scores under the sprint',
      leave: () => {
        DATA.students = window.__seedScoresTt.students;
        DATA.tutors = JSON.parse(window.__seedScoresTt.tutors);
        repaint(true);
      } },

    /* ---------- AND A SCRABBLE GAME PART-WAY THROUGH ------------------------------------------
       THE WIDGET OPENS ON THREE BUTTONS — 2, 3 or 4 players — and that is the only state `go()`
       can reach. Everything the game actually is lives past them: a board with tiles on it, a
       rack, four actions and the hand-over card between turns. Fifteen columns of squares over
       seven 44px tiles is also the tallest card in this column, and it was 17px past the pane's
       own fold the first time anything measured it.

       SEEDED THROUGH THE GAME'S OWN FUNCTIONS — `scrNew_` deals the bag, `scrPlace_` puts a tile
       down — rather than from a board written out here. A fixture board would be a second
       description of what a game looks like, and the copy in this file is the one nobody
       re-reads. */
    { name: 'a game of scrabble',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'scrabble');
        if (n < 0) throw new Error('no scrabble widget in the roster');
        goPage('games', n, true);
        scrabble = scrNew_(2);
        scrabble.handover = false;
        /* A BLANK ON THE RACK ON PURPOSE: it is the one tile with no letter and no value, so it is
           the one that can be drawn wrongly without anything looking odd. */
        scrabble.players[0].rack = ['C', 'A', 'T', 'S', 'E', '', 'Q'];
        scrPlace_(scrabble, 111, 0);
        scrPlace_(scrabble, 112, 1);
        scrPlace_(scrabble, 113, 2);
        scrabblePaint();
      },
      expect: () => document.querySelectorAll('#s-games .scr-sq.has').length === 3
                 && document.querySelectorAll('#s-games .scr-tile').length === 7
                 && !document.getElementById('scr-acts').hidden,
      wants: 'three tiles on the board, a rack of seven and the four actions',
      leave: () => { scrabble = null; scrabblePaint(); } },

    /* THE HAND-OVER IS ITS OWN STATE because it is the one that draws NO rack: the card between two
       players is what makes a secret rack possible on one screen, and it has different content and
       a different height from every other. */
    { name: 'handing the phone over',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'scrabble');
        if (n < 0) throw new Error('no scrabble widget in the roster');
        goPage('games', n, true);
        scrabble = scrNew_(3);
        scrabble.handover = true;
        scrabblePaint();
      },
      expect: () => !!document.querySelector('#s-games .scr-hand')
                 && document.querySelectorAll('#s-games .scr-tile').length === 0,
      wants: 'the hand-over card, with no rack on the screen',
      leave: () => { scrabble = null; scrabblePaint(); } },
  ],

  /* ---------- A SCRABBLE GAME PART-WAY THROUGH -------------------------------------------------
     THE WIDGET OPENS ON THREE BUTTONS — 2, 3 or 4 players — and that is the only state `go()` can
     reach. Everything this game actually is lives past them: a board with tiles on it, a rack, four
     actions, and the hand-over card between turns. Fifteen columns of squares and seven 44px tiles
     are also the tallest thing in the games column, and the card was 17px past the pane's own fold
     the first time anything measured it.

     SEEDED THROUGH THE GAME'S OWN FUNCTIONS — `scrNew_` deals the bag and `scrPlace_` puts a tile
     down — rather than by writing a board literal here. A fixture board would be a second
     description of what a game looks like, and the one in this file is the one nobody re-reads. */
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
  /* ---------- THE CAMERA WITH A PICTURE ON IT ----------------------------------------------------
     THE CAMERA OPENS ON A VIEWFINDER AND NOTHING ELSE. `Again`, `Post it`, `Save a copy`,
     the caption box and the row that says who it goes up as are all `hidden` until there is a
     photograph — so HALF THE CAMERA has been outside this lab for as long as it has existed, and
     `check/press.js` reported `cam-post`, `cam-save` and `cam-again` as untouched rather than as
     faults, because an action on no screen is one it cannot reach.

     WHAT THAT COST, MEASURED THE DAY THIS WAS WRITTEN: with a picture on the card the column ran
     55px BELOW THE SCREEN at 390 and 36px past the pane's own fold at 768. Neither is visible to
     the two rules that were watching — the pane's `scrollHeight` equals its `clientHeight`, so
     nothing is overflowing; it is the PANE that hangs off the bottom, because `columnShift_`
     places the page once and nothing re-placed it when the card grew. (It centred the page on the
     day those two numbers were taken; it puts every column's card on one line now, and a card that
     grows after the placement is still a card the placement never saw.)

     THROUGH THE APP'S OWN PICKER, not by drawing on the canvas. `on('cam-pick')` reads
     `el.files[0]`, so a `DataTransfer` carrying a real one-pixel PNG is the same event a finger
     makes — which matters here more than usual, because the thing being measured is what that
     handler reveals. A container has no camera, so `cam-shoot` is not a door this can use.

     AND IT IS PUT BACK. States run in order down one page and `camAgain_` is the app's own way to
     throw a picture away, so the next state and the next screen are not measured with a photograph
     still on the card — the same reason the guide state closes its sheet. */
  /* THE CAMERA IS A PAGE OF THE FEED NOW, directly above the newest post — the `make` column is
     gone. So the state turns to that page first, through the app's own `goPage` and `feedCamAt_`,
     and measures the card where it now sits. */
  feed: [
    { name: '' },
    { name: 'a photograph taken',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        goPage('feed', feedCamAt_(), true);
        const el = document.getElementById('cam-pick');
        if (!el) throw new Error('no cam-pick on the feed column');
        /* A ONE-PIXEL PNG, WRITTEN OUT RATHER THAN DRAWN. `canvas.toBlob` is async and this has to
           throw synchronously to be reported as unreachable. */
        const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const dt = new DataTransfer();
        dt.items.add(new File([bytes], 'shot.png', { type: 'image/png' }));
        el.files = dt.files;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      },
      expect: () => {
        const still = document.getElementById('cam-still');
        const post = document.getElementById('cam-post');
        return !!(still && !still.hidden && post && !post.hidden);
      },
      wants: 'the still on the card with Post it under it',
      leave: () => { if (typeof camAgain_ === 'function') camAgain_(); } },
  ],

  booking: [
    /* THE FORM STAYS ON THE LIST — declaring states replaces the unnamed one, and the form is the
       page everybody arrives on. Same first line as `tools` and `dm`, for the same reason. */
    { name: '' },

    /* ---------- THE WAITING-LIST BRANCH, WHICH IS A DIFFERENT FORM ----------------------------
       `isWaiting_()` CHANGES SIX ROWS AND THE WHOLE WEEK. An ordinary booking ticks eleven hours a
       day and a waiting list ticks three blocks — different grid, different cell count, different
       height — and until this state existed the lab had only ever seen the first. That is the same
       hole the session receipt and the message thread were each in: a branch the fixture cannot
       reach, measured by nothing, on the app's most control-dense card.

       IT COST THE CARD'S LAST THREE PIXELS TO FIND OUT. Measured on its first run: 803px of card in
       an 807px pane, `under: 3`. There is no headroom on this branch at all, which is why the block
       grid's cells are 20px rather than 44 and why the row above it spans — both written up where
       they are.

       SEEDED THROUGH `BOOKING.how` AND `drawBooker()`, which is exactly what the Kind dropdown's
       own `change` handler does. `isWaiting_` tests for "wait", so the string is the option's own
       words rather than a shape that happens to match.

       AND TWO BLOCKS ARE TICKED, because one is not a summary. `blockSay_` groups by block and
       collapses runs of days, and a single cell exercises none of that — `Mon · Tue evenings` is
       the shortest answer that proves the row is a sentence rather than a list of phrases. */
    { name: 'a waiting list',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        BOOKING.how = 'Waiting list class';
        /* ---------- AND A VENUE, BECAUSE WITHOUT ONE THE BRANCH RETURNS ON ITS SECOND LINE --------
           `bookPrice` ANSWERS `null` FOR A WAITING LIST WITH NO VENUE — *"the venue is the only
           answer it needs"* — and `breakdownRows` does `const w = bookPrice(); if (!w) return rows;`
           right at the top of the waiting block. So every run of this state has measured the card
           WITHOUT `A seat`, `Shared by`, `Per session`, `Term` or `About` on it: five of the rows
           that only exist on this branch, on the state written to measure this branch.

           IT NEEDED A SEAT PRICE IN THE FIXTURE TOO. `DATA.waitlistSeat` is a venue-keyed map the
           backend computes, and the fixture had no such key — so the lab could not have drawn this
           card however the state was seeded. Both halves in one commit, or the state reads as
           seeded and still measures the empty branch. */
        BOOKING.loc = 'Colliers Wood Library';
        BOOKING.avail = ['Monday evening', 'Tuesday evening'];
        drawBooker();
      },
      expect: () => {
        const cells = document.querySelectorAll('#s-booking [data-do="book-block"]');
        const on = document.querySelectorAll('#s-booking [data-do="book-block"].on');
        return cells.length === 21 && on.length === 2;
      },
      wants: 'a week of three blocks a day with two of them ticked',
      /* PUT BACK, because states run in order down one page and the receipt state after this one
         would otherwise be measuring a waiting list's form. `resetBooking_` is the app's own way to
         empty it — the same call every send path ends with. */
      leave: () => { if (typeof resetBooking_ === 'function') resetBooking_(); drawBooker(); } },

    /* ---------- THE LIST THAT HANGS OFF A FIELD ------------------------------------------------
       `check/press.js` REPORTED IT BEFORE THIS EXISTED: *"named on a screen and then not found to
       press (2): booking/book-many-pick, booking/book-many-done"*. Both controls are drawn only
       once a field has been pressed, and the press pass builds its queue from what is on the screen
       — so the two halves of the list were pressed by nothing. While it was a sheet they were
       collected with everything else a press opens; anywhere else they are a state or they are
       nowhere, which is exactly the hole this file's own header describes.

       AND IT IS `#drop` NOW RATHER THAN THE PAGE. The list replaced the form for one commit and was
       reported as *"i hate this"*; it hangs off its field, outside the screens, because `.pane` is
       `overflow: hidden` and would clip it anywhere else. So the measured root is the panel, not
       `#s-booking` — a selector scoped to the screen finds nothing and reads as the list being
       absent, which is this file's own recurring fault about an instrument that cannot reach its
       subject.

       AND `check/ui.js` HAD NEVER LAID IT OUT EITHER. Twelve 44px options in whichever side of the
       field has more room is the arithmetic the whole design turns on, and until this state it was
       measured in a probe rather than on every commit.

       SEEDED THROUGH `BOOKING.picking` AND `drawBooker()`, which is what `book-many` does — the
       app's own door rather than markup poked into the page. The step is found rather than named:
       which questions take several answers is `BOOK_STEPS`'s to say, and a literal here would be a
       second copy of that list. */
    { name: 'a list of answers open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const st = (typeof BOOK_STEPS !== 'undefined' ? BOOK_STEPS : []).filter(x => x.multi && !x.grid)
          .filter(x => { try { return (x.options() || []).filter(Boolean).length >= 1; } catch (e) { return false; } })[0];
        if (st) { BOOKING.picking = st.id; drawBooker(); }
      },
      expect: () => document.querySelectorAll('#drop .pick-opt').length >= 1
        && !!document.querySelector('#drop [data-do="book-many-done"]')
        /* AND OPEN, because `#drop` keeps its markup for as long as it is up and an assertion on the
           options alone would pass on a panel that is hidden. */
        && !document.getElementById('drop').classList.contains('hidden'),
      wants: 'a list of options hanging off the field, with a Done under them',
      /* PUT BACK, because states run in order down one page and the receipt state after this one
         would otherwise be measuring a picker. */
      leave: () => { BOOKING.picking = ''; drawBooker(); } },

    { name: 'a session receipt',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        DATA.liveJobs = [{
          id: 'J-UI', jobId: 'J-UI', title: 'GCSE Maths, Tuesday 4pm',
          subject: 'Maths', level: 'GCSE',
          /* ---------- `maxKids` AND `location`, WHICH ARE THE NAMES `doGet` SENDS --------------
             THIS SEEDED `students` AND `venue` AND THE PAYLOAD CARRIES NEITHER. Both were read by
             `jobRows`, so on every real receipt the `Students` row was absent entirely — `push`
             skips a row with no value — and `Venue` with it. The state was seeding the names the
             CODE reads rather than the names the SERVER sends, so the lab drew two rows nobody
             holding a real booking has ever seen. Same fault as `sessionDates` below it, found the
             same way: every field this receipt reads, compared against every key `doGet` puts on a
             job. `clientHosts` and `splitEmails` are sent now, so they keep their names. */
          maxKids: 2, location: 'Colliers Wood Library', clientHosts: true,
          weekday: 'Tuesday', time: '16:00', hours: '1.5', term: 'Autumn 2026',
          kind: 'session', splitEmails: 'gran@example.org', tutor: 'Ada Tutor', client: USER.name,
          /* ---------- `dates`, BECAUSE THAT IS THE NAME `doGet` SENDS ---------------------------
             THIS SAID `sessionDates` AND THE PAYLOAD HAS NEVER CARRIED THAT KEY. `doGet` ships the
             run as `dates: dates.join(', ')`, so `jobRows` — which read `j.sessionDates` — found
             nothing on every real job and the `Dates` row printed a dash on every receipt anybody
             has been handed. The state was seeding the name the CODE reads rather than the name the
             SERVER sends, which is the fault CLAUDE.md records about the fixture stating `focus` as
             a string `doGet` does not send: the lab measured a shape that does not exist and
             reported the row working.

             A PAID SEAT AND A FUTURE START, so the five stage ticks are THREE ON AND TWO OFF.
             `jobAccepted_` takes `Booked` and `jobStage_` reads it as a receipt, so `Requested`,
             `Accepted` and `Paid` are true; the dates are still ahead, so `Started` and `Completed`
             are not. A state where all five agreed would measure one box five times. */
          dates: '06/10/26, 13/10/26, 20/10/26, 27/10/26, 03/11/26, 10/11/26',
          startDate: '06/10/26', endDate: '10/11/26', createdAt: '22/09/2026',
          slots: [{ n: 1, client: USER.name, status: 'Booked' },
                  { n: 2, client: 'Second Family', status: 'Booked' }],
          /* ---------- THE JOB'S OWN LOG, WHICH IS WHERE TWO OF THE FIVE DATES COME FROM --------
             `doGet` HAS PUT `events: eventsForJob(jobId)` ON EVERY JOB SINCE THE ROSTER WAS
             DERIVED FROM IT, and this state seeded none — so `Accepted` and `Paid` could tick with
             no date and the lab could not tell that from a date that failed to draw.

             TWO FAMILIES, EACH ACCEPTING AND PAYING ON A DIFFERENT DAY, because that is the only
             shape that proves the two rules are opposite ends of the list: `Accepted` needs every
             seat, so it takes the LAST Accept (25th, not the 24th); `Paid` needs one booked seat
             on a session, so it takes the FIRST Confirm (26th, not the 28th). A log where everyone
             moved on one day would pass whichever way round they were read.

             `at` IS `dd/mm/yyyy` HERE because that is what `eventsForJob` sends — it puts the cell
             through `fmtDate` on the backend. `createdAt` is the same. The card's own `fmtDate`
             shortens both to the `dd/mm/yy` the `Dates` row above them already uses, and seeding
             the long form is what measures that rather than assuming it. */
          events: [
            { at: '22/09/2026', actor: USER.name, role: 'client', action: 'Request', target: '', message: 'asked for a session' },
            { at: '23/09/2026', actor: 'Second Family', role: 'client', action: 'Request', target: '', message: 'asked to join' },
            { at: '24/09/2026', actor: USER.name, role: 'client', action: 'Accept', target: '', message: 'accepted by us' },
            { at: '25/09/2026', actor: 'Second Family', role: 'client', action: 'Accept', target: '', message: 'accepted by us' },
            { at: '26/09/2026', actor: USER.name, role: 'client', action: 'Confirm', target: '', message: 'payment confirmed' },
            { at: '28/09/2026', actor: 'Second Family', role: 'client', action: 'Confirm', target: '', message: 'payment confirmed' },
          ],
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
          /* ONE PICTURE AND ONE FILE, because a thread of words alone never drew an attachment and
             the bubble that holds one is laid out differently — no padding round a photograph, a
             chip for a PDF. The picture is a data: URL so the lab needs no network for it; the file
             is only a link, which is all a file is on the card. */
          Object.assign(m('m6', true, '', '2026-09-17 08:30', true), { attachments: [
            { url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
              type: 'image/png', name: 'working.png' }] }),
          Object.assign(m('m7', false, 'Here is the mark scheme.', '2026-09-17 09:05', true), {
            attachments: [{ url: 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWx/view',
              type: 'application/pdf', name: 'November 2019 mark scheme.pdf' }] }),
        ];
        /* ---------- AND THE COLUMN POLLS NOW, SO THE SEED HAS TO READ AS FRESH --------------------
           `dmSync_` ASKS THE BACKEND WHENEVER THE LAST ANSWER IS OVER `DM_EVERY` OLD, which is how
           the Refresh button came off the column — so a state that seeds `MESSAGES` and says
           nothing about when is a state one tick away from being replaced by the harness's own
           empty fixture. `DM_LAST` is when the column last asked, and this state IS an answer
           having just arrived: seeding it is not a test hook, it is the other half of the state
           being declared. */
        DM_ASKED = true; DM_DONE = true; MSG_FAILED = false; DM_LAST = Date.now();
        paint('dm');
      },
      expect: () => document.querySelectorAll('#s-dm .msg-bub').length >= 7
                 && document.querySelector('#s-dm .msg-pic img')
                 && document.querySelector('#s-dm .msg-file')
                 && document.querySelector('#s-dm .msg-day')
                 && document.querySelector('#s-dm .msg-text'),
      wants: 'seven bubbles — one a picture, one a file — a day line and a box to reply in' },
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
        DM_ASKED = true; DM_DONE = true; MSG_FAILED = false; DM_LAST = Date.now();
        paint('dm');
      },
      /* SIX PAGES, NOT SEVEN. It was `>= 7` while the column opened with a head card carrying a
         heading and a Refresh button — a page with no message on it, which is the card the owner
         asked to be rid of. Six conversations are six pages. */
      expect: () => pageCount('dm') >= 6,
      wants: 'six conversations, each a page of its own' },
  ],
};

const statesOf = id => STATES[id] || [{ name: '' }];

module.exports = { STATES, statesOf };
