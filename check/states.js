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
                         /* `Level · KS2 SATs`, WHERE THIS WAS `Key stage · KS2` — *"I prefer GCSE or
                            SATs over grey areas."* A primary sheet's key stage is said as its
                            qualification now, and Key stage is silent on it (see `keystage` in
                            find.js), so the old answer reached nothing and the state went unmeasured. */
                         { field: 'level', value: 'KS2 SATs' },
                         { field: 'yearGroup', any: true }];
        paintStuff();
        goPage('stuff', 0, true);
      },
      expect: () => document.querySelectorAll('#stuff-groups .row').length,
      wants: 'a question with answers on it' },
    /* ---------- THE SITTING, ASKED AS THE YEAR AND THEN THE MONTH ------------------------------------
       REPORTED AS "some tags are like summer 2018 when it should just be summer then 2018", and as
       "they dont need to appear one above the other but can fill like from left to right". Then the
       season went: "I don't want it to ask summer or autumn I'd rather it just do the months. Like
       may or November" -- and the year comes FIRST, as the outer folder. So these are two states,
       one for each folder: Higher chosen and the question on the page is Year, its answers bare
       years; then 2017 chosen and the question is Month, its answers bare months.

       THE EXPECT ASKS THE THINGS A SCREENSHOT SHOWED, because none is a measurement any rule in
       check/ui.js makes: no answer carries a month and a year together, no answer is a season, and at
       least two answers sit on one line — chips stacked one per row measure perfectly and are the
       shape that was reported. Topic area and Topic are skipped, as a person who wants a sitting
       would. */
    { name: 'the year folder',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' },
                         { field: 'kindLabel', value: 'Questions' },
                         { field: 'subject', value: 'Maths' },
                         { field: 'documentType', value: 'Past paper' },
                         { field: 'level', value: 'GCSE' },
                         { field: 'topicArea', any: true },
                         { field: 'topic', any: true },
                         { field: 'tier', value: 'Higher' }];
        paintStuff();
        goPage('stuff', 0, true);
      },
      expect: () => {
        const rows = [...document.querySelectorAll('#stuff-groups .answers > .row[data-do="facet-pick"]')];
        if (rows.length < 2) return false;
        if (!rows.every(r => r.dataset.field === 'examYear')) return false;
        if (rows.some(r => /[A-Za-z]+\s+(19|20)\d{2}/.test(r.textContent))) return false;
        const tops = rows.map(r => Math.round(r.getBoundingClientRect().top));
        return new Set(tops).size < tops.length;
      },
      wants: 'the Year question, bare years only, drawn as chips sharing a line' },
    { name: 'the month folder inside the year',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' },
                         { field: 'kindLabel', value: 'Questions' },
                         { field: 'subject', value: 'Maths' },
                         { field: 'documentType', value: 'Past paper' },
                         { field: 'level', value: 'GCSE' },
                         { field: 'topicArea', any: true },
                         { field: 'topic', any: true },
                         { field: 'tier', value: 'Higher' },
                         { field: 'examYear', value: '2017' }];
        paintStuff();
        goPage('stuff', 0, true);
      },
      expect: () => {
        const rows = [...document.querySelectorAll('#stuff-groups .answers > .row[data-do="facet-pick"]')];
        if (rows.length < 2) return false;
        if (!rows.every(r => r.dataset.field === 'examMonth')) return false;
        if (rows.some(r => /(19|20)\d{2}|Summer|Autumn|Spring|Winter/i.test(r.textContent))) return false;
        const tops = rows.map(r => Math.round(r.getBoundingClientRect().top));
        return new Set(tops).size < tops.length;
      },
      wants: 'the Month question, bare month names only, drawn as chips sharing a line' },
    /* ---------- THE PAPER FOLDER WITH THE YEAR SKIPPED ------------------------------------------------
       *"Fix this why it say June and year in same chip"* — with `Doesn't matter` on Year and a month
       pressed, the Paper answers read `Paper 1 — May 2017 | Paper 1 — May 2018 | …`: the month the
       person had just chosen, said again on every answer, fused to the year. Now they read `Paper 1 ·
       2017 | Paper 1 · 2018 | …`, the half nobody has said. GCSE Higher in May is the route that
       draws them as answers rather than letter ranges: four sittings, one Paper 1 each. */
    { name: 'the paper folder with the year skipped',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' },
                         { field: 'kindLabel', value: 'Questions' },
                         { field: 'subject', value: 'Maths' },
                         { field: 'documentType', value: 'Past paper' },
                         { field: 'level', value: 'GCSE' },
                         { field: 'topicArea', any: true },
                         { field: 'topic', any: true },
                         { field: 'tier', value: 'Higher' },
                         { field: 'examYear', any: true },
                         { field: 'examMonth', value: 'May' }];
        paintStuff();
        goPage('stuff', 0, true);
      },
      expect: () => {
        const rows = [...document.querySelectorAll('#stuff-groups .answers > .row[data-do="facet-pick"]')];
        const txt = r => r.textContent.replace(/\s+/g, ' ').trim();
        if (rows.length < 2 || !rows.every(r => r.dataset.field === 'paperId')) return false;
        if (rows.some(r => /\bMay\b/i.test(txt(r)))) return false;
        return rows.every(r => /· (19|20)\d{2}\b/.test(txt(r)));
      },
      wants: 'the Paper question, each answer its number and its year, and no answer saying May again' },
    /* ---------- A PAPER CHOSEN, AND NOTHING MORE ASKED -----------------------------------------------
       ASKED FOR AS *"no more asking for questions 1-10 or question part 1 or b."* This route used to go
       on to `Question number 1–10 | 11–20 | 21–30`, then `1–2 | 3–4`, then `1 | 2`. Now the paper is the
       last folder (`FACET_ENDS`): the funnel page draws no answers and says to swipe up, and the next
       page is the paper's first question. The state turns to that page, so the card a thumb lands on
       is what gets measured — and the funnel page is asked about from there, since it is still in
       the strip. */
    { name: 'a paper chosen',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' },
                         { field: 'kindLabel', value: 'Questions' },
                         { field: 'subject', value: 'Maths' },
                         { field: 'documentType', value: 'Past paper' },
                         { field: 'level', value: 'GCSE' },
                         { field: 'topicArea', any: true },
                         { field: 'topic', any: true },
                         { field: 'tier', value: 'Higher' },
                         { field: 'examYear', value: '2017' },
                         { field: 'examMonth', value: 'June' },
                         { field: 'paperId', value: 'P-1MA1-1706-2H' }];
        paintStuff();
        goPage('stuff', stuffFirstResult_(), true);
      },
      /* AND THE CARD'S SITTING IS TWO TAGS, `2017` THEN `June` — *"Fix this why it say June and year
         in same chip"* was a screenshot of one purple `June 2024` pill on exactly this card. */
      expect: () => {
        const rows = document.querySelectorAll('#stuff-groups .answers > .row[data-do="facet-pick"]');
        const groups = document.querySelector('#stuff-groups');
        const card = document.querySelector('#s-stuff .page.on .qcard') || document.querySelector('#s-stuff .qcard');
        const sit = card ? [...card.querySelectorAll('.qtag[data-tag="sitting"]')].map(t => t.textContent.trim()) : [];
        return !!groups && rows.length === 0 && /That is the paper, in order/.test(groups.textContent)
               && !!card && sit.join('|') === '2017|June';
      },
      wants: 'a funnel page asking nothing after Paper, with the paper\'s first question on the page after it, its sitting tagged 2017 then June',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- AN ANSWER ONE LETTER LONG ---------------------------------------------------------
       A CHIP IS AS WIDE AS ITS WORDS, and the letter ranges `bucketValues_` groups a long list into
       are often a single letter — `S` among the topics here, `G` and `P` among the English papers.
       The first version of the chips drew those 34x44: under the tap floor sideways, which no state
       above could show, because every answer they reach is a word. This one reaches the Topic
       question over GCSE Maths past papers, where one of the ranges is one letter, and leaves the
       measuring to the tap-target rule. */
    { name: 'an answer one letter long',
      /* FOUND BY WALKING THE FUNNEL, NOT BY A ROUTE WRITTEN HERE. Which question ends in a one-letter
         range is a fact about the data, and the data moves: this was written when past papers still
         answered Topic, and the next commit to land took Topic off every question that is not a 1st
         Class Maths worksheet — so its one route reached no range at all and the state reported
         itself unreachable. So it answers the funnel's own questions, depth first, through the same
         `facet-pick` rows a finger presses, and stops at the first screen drawing a one-letter chip.
         Capped, so a library with none fails as "did not arrive" rather than hanging the run. */
      enter: () => {
        const rows = () => [...document.querySelectorAll('#stuff-groups .answers > .row[data-do="facet-pick"]')];
        const one = () => rows().some(r => r.textContent.trim().length === 1);
        let left = 400;
        const walk = (filters, depth) => {
          STUFF.q = ''; STUFF.filters = filters; paintStuff(); goPage('stuff', 0, true);
          if (one()) return true;
          if (!depth || --left <= 0) return false;
          const opts = rows().map(r => ({ field: r.getAttribute('data-field'), value: r.getAttribute('data-value'),
                                          bucket: !!r.getAttribute('data-bucket') }))
                             .filter(o => o.field && o.value != null);
          for (const o of opts) {
            const f = Object.assign({ field: o.field, value: o.value }, o.bucket ? { bucket: true } : {});
            if (walk(filters.concat([f]), depth - 1)) return true;
            if (left <= 0) return false;
          }
          return false;
        };
        walk([{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Questions' }], 5);
      },
      expect: () => [...document.querySelectorAll('#stuff-groups .answers > .row[data-do="facet-pick"]')]
        .some(r => r.textContent.trim().length === 1),
      wants: 'an answer chip whose whole label is one letter' },
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
       basket left full would be measured on the Shop column as though somebody had filled it. */
    { name: 'a bundle of papers',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' },
                         { field: 'kindLabel', value: 'Questions' },
                         { field: 'subject', value: 'Maths' },
                         { field: 'documentType', value: 'Past paper' },
                         { field: 'level', value: 'GCSE' },
                         { field: 'tier', value: 'Higher' },
                         { field: 'examYear', value: '2017 & 2018', bucket: true }];
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
               && !main.querySelector('.gd-box, .prac-kit, .prac-steps, figure')
               /* THE PICTURE IS ITS OWN PAGE NOW, and on no other: "across the board of all
                  resources the diagrams should be its own widgets". */
               && !document.querySelector('#s-stuff .prac-part:not(.is-fig) figure');
      },
      wants: 'a practical split into cards — the card, its diagram, the kit list, the steps, and a worksheet of three boxes',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A PROJECT, ON ITS LAST PAGE ----------------------------------------------------
       "the projects are like practicles, but not practicles. so should be a new tag in the finder
       called projects." The practical's state one kind along: the funnel's own `What kind` answer,
       then the first project's SHARE page found off `stuffPages_` — so the card, the materials and
       the steps are in the DOM beside it and all four are measured for a tap target, a contrast
       ratio and a sideways scroll. The share page is the one with a tile on it. */
    { name: 'a project',
      enter: () => {
        const x = stuffItemsAll_().find(it => it.kind === 'project');
        if (!x) throw new Error('no project in the list — data/projects.json did not load');
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label }];
        paintStuff();
        const at = typeof stuffPages_ === 'function'
          ? Math.max(0, stuffPages_().findIndex(pg => pg.part === 'share')) : 0;
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + at);
      },
      expect: () => {
        const main = document.querySelector('#s-stuff .card.proj:not(.prac-part)');
        const kit = document.querySelector('#s-stuff .card.proj.is-kit');
        const steps = document.querySelector('#s-stuff .card.proj.is-steps');
        const share = document.querySelector('#s-stuff .card.proj.is-share');
        return !!main && !!kit && !!steps && !!share
               && !!kit.querySelector('.prac-kit ul > li')
               && !!steps.querySelector('.prac-steps ol > li')
               && !!share.querySelector('[data-do="proj-share"]')
               && !document.querySelector('#s-stuff .card.prac:not(.proj)');
      },
      wants: 'a project split into cards — the card, its materials, its steps, and a share page with a Messages tile',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A TEXTBOOK CHAPTER, REACHED BY ITS SHELF -----------------------------------------
       "the @family textbook should be bare bones for now and the textbooks will be in the resources
       tag in the finder." The owner's route as chips — Resources, then the `@family. textbooks`
       shelf — and then the Measures of spread chapter, because it is the one with everything a
       chapter can carry: key words, Higher lines, and the standard deviation formulas, whose
       stacked fractions under a root are the widest thing on any page of the book. The chapters
       either side are in the DOM beside it, so they are measured too, for a tap target, a contrast
       ratio and a sideways scroll. */
    { name: 'a textbook chapter',
      enter: () => {
        const x = stuffItemsAll_().find(it => it.kind === 'textbook');
        if (!x) throw new Error('no textbook in the list — data/textbooks.json did not load');
        const c = (x.row.chapters || []).find(ch => /spread/i.test(ch.title)) || x.row.chapters[0];
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label },
                         { field: 'shelf', value: x.shelf }];
        paintStuff();
        const at = typeof stuffPages_ === 'function'
          ? Math.max(0, stuffPages_().findIndex(pg => pg.part === 'ch' + c.n)) : 0;
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + at);
      },
      expect: () => {
        /* THE CHAPTER AND ITS NEIGHBOURS, NOT THE CONTENTS CARD: the pager keeps `STUFF_WIN` pages
           either side of this one, and the card is nine pages back. The card has a journey of its
           own in check-flow; this state is about the widest page. */
        const ch = [...document.querySelectorAll('#s-stuff .card.tb.prac-part')]
          .find(el => /spread/i.test((el.querySelector('h3') || {}).textContent || ''));
        return !!ch && !!ch.querySelector('.tb-words li b')
               && !!ch.querySelector('.tb-math .frac .frac-d')
               && !!ch.querySelector('.tb-points li')
               && !!ch.querySelector('li .tb-h')
               /* NOTHING BUT THE BOOK ON THIS SHELF — a boxer here would mean the chip did not hold. */
               && !document.querySelector('#s-stuff .card:not(.tb) .boxer-rec');
      },
      wants: 'a textbook chapter page — key words, stacked formulas, worked lines and the Higher mark',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
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
       `stuffFiltered()` after the repaint is the order the pages are built from: the list is sorted
       before it is paged, so `stuffItemsAll_()`'s first is not the card the screen shows. */
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
        if (stuffFiltered().indexOf(pen) < 0) throw new Error('the paper chip does not return its own pen question');
        /* ONTO ITS FIGURE PAGE, the one after the question — the pen goes with the picture, and the
           picture is its own card now. `stuffPageOf_` is the app's own mapping from an item and a
           part to a page. */
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1)
          + stuffPageOf_(pen, 'fig'));
      },
      /* THE PICTURE AND ITS CONTROL, PER CARD. `.qpad-art[data-do]` is the half that was missing —
         a pad whose picture is not a door is the card as it was reported, and it measures perfectly
         either way, so it has to be asserted rather than looked at. */
      expect: () => {
        /* ON THE FIGURE CARD, AND ON NO QUESTION CARD — the pen moved with the picture. */
        const c = document.querySelector('#s-stuff .qfig .qpad');
        return !!c && !document.querySelector('#s-stuff .qcard:not(.qfig) .qpad')
               && !!c.querySelector('.qpad-art[data-do="pad-draw"]')
               && !!c.querySelector('.qpad-lock')
               && !c.classList.contains('is-drawing');
      },
      wants: 'a figure card, after its question, whose diagram takes a pen, with the lock control drawn and the pen off',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A MULTIPLE-CHOICE QUESTION, ANSWERED BY TAPPING ---------------------------------
       ITS OPTIONS ARE BUTTONS AND THERE IS NO TEXT BOX — asked for in as many words. Narrowed by
       its own paper, exactly as the pen state above, and landed on its own page. The expect asks
       for the buttons AND the absence of a textarea on that card, because a card drawing both
       measures perfectly and is the thing that was asked to stop. */
    { name: 'a multiple-choice question',
      enter: () => {
        const mc = stuffItemsAll_().find(it => it.kind === 'question'
          && Array.isArray(it.choices) && it.choices.length >= 2 && (it.choiceRight || []).length);
        if (!mc) throw new Error('no question in the list carries choices');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(mc) }];
        paintStuff();
        if (stuffFiltered().indexOf(mc) < 0) throw new Error('the paper chip does not return its own choice question');
        window.__mcKey = ansKey_(mc);
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1)
          + stuffPageOf_(mc));
      },
      expect: () => {
        const box = document.querySelector('#s-stuff .page.on .qp-choices')
          || [...document.querySelectorAll('#s-stuff .qp-choices')].find(b => b.getAttribute('data-k') === window.__mcKey);
        const card = box && box.closest('.qcard');
        return !!box && box.querySelectorAll('button.qp-opt').length >= 2
               && !card.querySelector('textarea.qp-ans-in');
      },
      wants: 'a question whose options are buttons, with no text box on its card',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A MULTI-PART QUESTION WITH A DIAGRAM, IN THE PAPER'S ORDER ------------------------------
       ASKED FOR AS *"evaluate how questions appear when there's multiple parts and a diagram"* and
       *"diagram widgets shouldn't have a question number on them"*. One row, named: Q5 of the June 2022
       A-level Statistics paper -- a stem ("Of the 80 people...") with a Venn diagram, then six parts, the
       third of which is "complete the Venn diagram above". Two pictures: the stem's own page, headed
       `Q5` with no part (`· 1 of 2`: its table is long enough to be cut), and the Venn diagram on the page after it, headed `Figure` with no number of either
       kind. Both land on the pages in front of (a), where the strip puts them once for all six. */
    { name: 'a multi-part question\'s stem, on its own page in front of its parts',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-9MA031-2206-5a');
        if (!it) throw new Error('Q-9MA031-2206-5a is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'stem0'));
      },
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qcard.qstem');
        return !!c && /^Q5( · \d+ of \d+)?$/.test(c.querySelector('.qcard-top').textContent.trim().replace(/\s+/g, ' '))
               && !!c.querySelector('.qsheet-stem') && !c.querySelector('.qp-ans, svg')
               && !!c.querySelector('.qsheet-figref');
      },
      wants: 'the stem of Q5 on its own page, headed Q5 (1 of 2: its table makes it two), no box and no picture, saying what is next',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    { name: 'its figure, the page after, with no question number',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-9MA031-2206-5a');
        if (!it) throw new Error('Q-9MA031-2206-5a is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'sfig0'));
      },
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qcard.qfig');
        return !!c && !/\bQ\d/.test(c.querySelector('.qcard-top').textContent)
               && /^Figure/.test(c.querySelector('.qcard-top').textContent.trim())
               && !!c.querySelector('figure svg') && !c.querySelector('.qp-ans');
      },
      wants: 'the Venn diagram on its own page, headed Figure, with no question number and no box',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A DRAWING QUESTION WITH NO PICTURE: A SQUARED GRID UNDER THE PEN ----------------------
       *"some questions require answers on diagram. So should have a diagram for them to draw on"*. The
       first question in the library that `padSource_` gives a SURFACE rather than a figure, and whose
       surface is squared paper -- found by the app's own rule, not named, so the state follows the
       data as the data workflow redraws the real figures. On its own page, after the ask, headed
       "Squared grid", saying it is not the paper's figure. */
    { name: 'a drawing question\'s squared grid, under the pen',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && typeof padSource_ === 'function'
          && (padSource_(x) || {}).from === 'surface' && padSurface_(x) === 'grid');
        if (!it) throw new Error('no question in the library stands on a squared-grid surface');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        window.__surfRow = it.row.row_id;
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'fig'));
      },
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qcard.qfig');
        return !!c && c.getAttribute('data-of') === window.__surfRow
               && !!c.querySelector('.qpad .qpad-art > svg.qsurf.is-grid')
               && c.querySelector('.qcard-top').textContent.trim() === 'Squared grid'
               && /not the paper.s own figure/i.test(c.textContent);
      },
      wants: 'a squared grid on its own page after its question, under the pen, headed "Squared grid" and saying it is not the paper\'s figure',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A PASSAGE WITH TWO WORDS RINGED -----------------------------------------------------------
       "Circle the three adjectives in the passage below" -- KS2 grammar, June 2025. NO ROW CARRIES
       `surface: "text"` YET (the data workflow is writing it), so this gives the real row the value it
       will carry, for the length of the state, through the app's own memo (`CHUNK_MEMO` keeps a part's
       pages, and they change when its surface does). Two words are rung through the real handler, as a
       finger would, and taken off again on the way out with everything else. */
    { name: 'a passage with two words ringed',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-STA-KS2-2025-GPS1-16');
        if (!it) throw new Error('Q-STA-KS2-2025-GPS1-16 is not in the library');
        window.__ringItem = it;
        window.__ringHad = it.surface;
        it.surface = 'text';
        CHUNK_MEMO.delete(it);
        try { localStorage.removeItem(circKey_(it)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        setTimeout(() => {
          ['crumbling', 'rocky'].forEach(t => {
            const w = [...document.querySelectorAll('#s-stuff .page.on .qw')].find(s => s.textContent === t);
            if (w) w.click();
          });
        }, 150);
      },
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qsheet-part.is-text');
        const lit = c ? [...c.querySelectorAll('.qw.is-circled')].map(s => s.textContent).sort().join(',') : '';
        return lit === 'crumbling,rocky';
      },
      wants: 'the passage on the question card with "crumbling" and "rocky" ringed in gold, every other word tappable',
      leave: () => {
        const it = window.__ringItem;
        if (it) {
          try { localStorage.removeItem(circKey_(it)); } catch (e) {}
          CIRC_HELD.delete(circKey_(it));
          it.surface = window.__ringHad || '';
          CHUNK_MEMO.delete(it);
        }
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- A PART TOO LONG FOR ONE PAGE, CUT BETWEEN PARAGRAPHS --------------------------------------
       *"each widget is smaller than a phone screen"*. Named: Q3.5 of the June 2024 A-level Biology
       Paper 3 -- the tallest question card in the library before the cut, 1,241px past a 320 pane. Its
       first page (`pre0`): the reading, no box, saying it continues; the card after it keeps the ask. */
    { name: 'a long part\'s first page, cut before its ask',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-AQA-7408-2406-3A-035');
        if (!it) throw new Error('Q-AQA-7408-2406-3A-035 is not in the library');
        if (pageParts_(it).indexOf('pre0') < 0) throw new Error('Q-AQA-7408-2406-3A-035 is not cut any more');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'pre0'));
      },
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qcard.qpre');
        return !!c && !c.querySelector('.qp-ans') && /Continued on the next page/.test(c.textContent)
               && /1 of \d/.test(c.querySelector('.qcard-top').textContent);
      },
      wants: 'the first page of a long part: its reading, no box, "1 of N", saying it continues',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A QUESTION YOU HAVE DONE, DATED --------------------------------------------------------
       ASKED FOR AS *"when a student does do a question, it should record the date they did it"*. Signed
       in only -- signed out records nothing, by design (`doneKeyOf_`). The date is written where the
       app writes it, under the visitor's own key, and taken off again on the way out so no other state
       is pictured stamped. The expect asks for the stamp in the header's slot, on the marks' line. */
    { name: 'a question you have done, dated',
      only: () => typeof whoIs_ === 'function' && !!whoIs_(),
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1811-1H-3');
        if (!it) throw new Error('Q-1MA1-1811-1H-3 is not in the library');
        window.__doneKey = 'done:' + ansKey_(it).slice(4);
        try { localStorage.setItem(window.__doneKey, '2026-10-04'); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it));
      },
      expect: () => {
        const s = document.querySelector('#s-stuff .page.on .qcard-top .qcard-done');
        return !!s && /^Done 4 Oct( \d{4})?$/.test(s.textContent);
      },
      wants: 'the question card saying "Done 4 Oct" beside its marks',
      leave: () => { try { localStorage.removeItem(window.__doneKey); } catch (e) {}
                     STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- THE ANSWER PAGE: HIDDEN, TURNED TO, AND SHOWN ----------------------------------------
       ASKED FOR AS "what I want was answers to be short and to be their own widget" -- the answer is
       the page after its question (`questionAnsCard_`) -- and then *"remove all 'why's. I just want
       it to have answer. And you should have to click to reveal the answer. Should behave the same
       whether it's a tutor or child."* Three pictures, because a finger can put it in three states,
       and each is something `ui.js` measures: the waiting sentence and its 44px control; the page a
       question's tile turns to; and the result shown by its own button, with nothing under it. NO
       `only:` ON ANY OF THEM -- the hidden page used to be skipped for staff, because a tutor's was
       open; it is the same page for both visitors now, so both are pictured.

       ONE ROW, NAMED, on purpose: June 2018 Higher 1, question 3 -- "No", then working that holds a
       stacked fraction. Picked because it was a 207-character paragraph before 259's rewrite, so
       the pictures show the change on a real answer rather than on whichever sorts first. Landed on
       by `stuffPageOf_(it, 'ans')`, the app's own map from a part to a page. AFTER A TICK, because
       the page is drawn by `goPage` and is not there to press until then.

       `ANS_SHOWN` IS EMPTIED ON THE WAY IN AND OUT. States run in order down one page, and an answer
       shown by one would be measured as already shown by the next -- the hidden state would then be
       a picture of the open one, and pass. */
    { name: 'an answer, hidden until it is asked for',
      enter: () => {
        ANS_SHOWN.clear();
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1811-1H-3');
        if (!it) throw new Error('Q-1MA1-1811-1H-3 is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'ans'));
      },
      /* AND NOTHING OF THE ANSWER IN THE PAGE AT ALL -- the old `is-shut` hid with CSS an answer
         that was in the document, so "not visible" is not the test; "not there" is. */
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qans-card');
        return !!c && c.classList.contains('is-hidden') && c.getAttribute('data-of') === 'Q-1MA1-1811-1H-3'
               && !c.querySelector('.qans, .qans-body') && /Answer hidden/.test(c.textContent)
               && !!c.querySelector('[data-do="qa-show"]');
      },
      wants: 'Q3\'s answer page, after its question, for whoever is looking: "Answer hidden", Show the answer, and no answer in it',
      leave: () => { ANS_SHOWN.clear(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    { name: 'the answer, turned to from its question',
      enter: () => {
        ANS_SHOWN.clear();
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1811-1H-3');
        if (!it) throw new Error('Q-1MA1-1811-1H-3 is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        const first = typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1;
        goPage('stuff', first + stuffPageOf_(it), true);
        window.__ansWant = first + stuffPageOf_(it, 'ans');
        window.__ansFrom = null;
        /* THE TILE ON THE QUESTION'S OWN PAGE, pressed as a finger would. */
        setTimeout(() => {
          const tile = document.querySelector('#s-stuff .page.on [data-do="qa-go"]');
          window.__ansFrom = PAGE.stuff;
          if (tile) tile.click();
        }, 150);
      },
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qans-card');
        return window.__ansFrom !== null && PAGE.stuff === window.__ansWant && PAGE.stuff > window.__ansFrom
               && !!c && !c.classList.contains('is-hidden') && c.getAttribute('data-of') === 'Q-1MA1-1811-1H-3'
               && /^No$/.test((c.querySelector('.qans-body') || {}).textContent.trim());
      },
      wants: 'the question\'s answer tile pressed, and the page turned forward to its answer, open: "No"',
      leave: () => { ANS_SHOWN.clear(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    { name: 'an answer, shown, and nothing under it',
      enter: () => {
        ANS_SHOWN.clear();
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1811-1H-3');
        if (!it) throw new Error('Q-1MA1-1811-1H-3 is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'ans'));
        setTimeout(() => {
          const btn = document.querySelector('#s-stuff .page.on .qans-card [data-do="qa-show"]');
          if (btn) btn.click();
        }, 150);
      },
      /* THE RESULT AND NOTHING ELSE: "No", and no fold, no working, no examiner's note under it. */
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qans-card:not(.is-hidden)');
        const ans = c && c.querySelector('.qans');
        return !!ans && /^No$/.test(ans.querySelector('.qans-body').textContent.trim())
               && !c.querySelector('details, .qans-why, .qans-more, .qans-note');
      },
      wants: 'the answer page showing "No" once its button is pressed, and nothing under it',
      leave: () => { ANS_SHOWN.clear(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- MARKED, AND NOTHING MOVED --------------------------------------------------------
       ASKED FOR AS "make it nice more sleek, fresh stable". The unstable part was measured before it
       was fixed: at 320 "Not yet — have another go" wrapped under Check and grew the card by 21.8px,
       and a tapped wrong option grew it by 13.7px as its verdict line arrived from nowhere -- the
       card jumped at the moment it told you your answer. Neither is visible in a picture taken
       afterwards, so these states take the picture's measurements BEFORE the press as well, the way
       a finger would see it: the question's top, the answer box's top and the card's height, then
       Check (or the tap), then the same three again. A wrong verdict may move NOTHING; a right one
       may grow the card only BELOW the box -- and it does not open the answer page any more: the
       verdict is "Correct", and the page after waits for its own tap, for everybody.

       NAMED ROWS, so the pictures are the same question every run: `Q0664` is 5/8 = ?/24 (typed,
       accepts 15, its stem a stacked fraction), and the Corbettmaths ×10 question is a one-answer
       tapped one. The stored answer is cleared first and again on the way out -- a pick left over
       from an earlier run is a question already settled, and would measure the wrong card. */
    { name: 'a typed answer, marked not yet, nothing moved',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q0664');
        if (!it) throw new Error('Q0664 is not in the library');
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        window.__qStable = null; window.__qCard = null;
        setTimeout(() => {
          const hit = [...document.querySelectorAll('#s-stuff .qp-ans-in')].find(b => b.getAttribute('data-k') === ansKey_(it));
          const card = window.__qCard = hit && hit.closest('.qcard');
          const inp = card && card.querySelector('.qp-ans-in');
          const btn = card && card.querySelector('.qp-check');
          if (!inp || !btn) return;
          const at = () => [card.querySelector('.qsheet-pb').getBoundingClientRect().top,
                            card.querySelector('.qp-ans').getBoundingClientRect().top,
                            card.getBoundingClientRect().height];
          const a = at();
          inp.value = '999999';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          btn.click();
          window.__qStable = { a, b: at() };
        }, 150);
      },
      expect: () => {
        const s = window.__qStable;
        const mark = window.__qCard && window.__qCard.querySelector('.qp-mark');
        return !!s && !!mark && mark.classList.contains('is-near')
               && s.a.every((v, i) => Math.abs(v - s.b[i]) < 0.5);
      },
      wants: 'Q0664 marked "not yet" with the question, the box and the card\'s height exactly where they were before Check',
      leave: () => {
        const it = stuffItemsAll_().find(x => x.row && x.row.row_id === 'Q0664');
        try { if (it) localStorage.removeItem(ansKey_(it)); } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    { name: 'a typed answer, marked right, the question still',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q0664');
        if (!it) throw new Error('Q0664 is not in the library');
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        window.__qStable = null; window.__qCard = null;
        setTimeout(() => {
          const hit = [...document.querySelectorAll('#s-stuff .qp-ans-in')].find(b => b.getAttribute('data-k') === ansKey_(it));
          const card = window.__qCard = hit && hit.closest('.qcard');
          const inp = card && card.querySelector('.qp-ans-in');
          const btn = card && card.querySelector('.qp-check');
          if (!inp || !btn) return;
          const at = () => [card.querySelector('.qsheet-pb').getBoundingClientRect().top,
                            card.querySelector('.qp-ans').getBoundingClientRect().top,
                            btn.getBoundingClientRect().top];
          const a = at();
          inp.value = '15';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          btn.click();
          window.__qStable = { a, b: at() };
        }, 150);
      },
      expect: () => {
        const s = window.__qStable;
        const card = window.__qCard;
        const mark = card && card.querySelector('.qp-mark');
        /* THE ANSWER PAGE STAYS SHUT -- asked of `ansOpen_`, the one rule the page is drawn by, because
           the page may not be built yet and is not the one on screen. A right answer used to open it;
           *"you should have to click to reveal the answer"*. */
        const it = stuffItemsAll_().find(x => x.row && x.row.row_id === 'Q0664');
        return !!s && !!mark && mark.classList.contains('is-right') && !!it && !ansOpen_(it)
               && !card.querySelector('.qans')
               && s.a.every((v, i) => Math.abs(v - s.b[i]) < 0.5);
      },
      wants: 'Q0664 marked right and its answer page still waiting for its tap, with the question, the box and Check where they were',
      leave: () => {
        const it = stuffItemsAll_().find(x => x.row && x.row.row_id === 'Q0664');
        try { if (it) localStorage.removeItem(ansKey_(it)); } catch (e) {}
        ANS_SHOWN.clear();
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    { name: 'a tapped answer, not yet, nothing moved',
      enter: () => {
        const id = 'Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-12';
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === id);
        if (!it) throw new Error(id + ' is not in the library');
        if (!(it.choiceRight || []).length) throw new Error(id + ' has no credited choice to miss');
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        window.__qStable = null; window.__qCard = null;
        setTimeout(() => {
          const hit = [...document.querySelectorAll('#s-stuff .qp-choices')].find(b => b.getAttribute('data-k') === ansKey_(it));
          const card = window.__qCard = hit && hit.closest('.qcard');
          const opts = card ? [...card.querySelectorAll('.qp-opt')] : [];
          if (opts.length < 2) return;
          const miss = it.choiceRight[0] === 1 ? 2 : 1;
          const at = () => [card.querySelector('.qsheet-pb').getBoundingClientRect().top,
                            card.querySelector('.qp-opt[data-n="' + miss + '"]').getBoundingClientRect().top,
                            card.getBoundingClientRect().height];
          const a = at();
          opts[miss - 1].click();
          window.__qStable = { a, b: at() };
        }, 150);
      },
      expect: () => {
        const s = window.__qStable;
        const box = window.__qCard && window.__qCard.querySelector('.qp-choices');
        const mark = box && box.nextElementSibling;
        return !!s && !!box && box.classList.contains('is-done')
               && !!box.querySelector('.qp-opt.is-picked:not(.is-ans)') && !!box.querySelector('.qp-opt.is-ans')
               && !!mark && mark.classList.contains('is-near')
               && s.a.every((v, i) => Math.abs(v - s.b[i]) < 0.5);
      },
      wants: 'a wrong tap marked, the right option ticked, and the question, the option and the card\'s height unmoved',
      leave: () => {
        const it = stuffItemsAll_().find(x => x.row && x.row.row_id === 'Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-12');
        try { if (it) localStorage.removeItem(ansKey_(it)); } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- THE MATHS KEYPAD, UP, WITH A FRACTION HALF BUILT ------------------------------------
       ASKED FOR AS "make the input better … like hegarty maths … desmos". The pad is one element on
       <body>, fixed to the foot of the app's column, and it is the one surface in this app that is
       drawn OVER the screens rather than in one — so it is exactly what `ui.js` has to measure at
       320: six keys across at 44px, nothing sideways, the caret and the slots inside the box. Q0664
       is a `calculation` with a scheme, the same row the two marking states use. The keys are CLICKED,
       not called, so the delegated handler and the pad's own `mousedown` guard are what run — a key
       that took the focus off the box would close the pad and fail `expect`. Three, then →, then
       nothing: a fraction with a top and an empty dashed bottom, which is the picture worth looking
       at. */
    { name: 'a maths answer, the keypad up, a fraction half built',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q0664');
        if (!it) throw new Error('Q0664 is not in the library');
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        window.__kpCard = null;
        /* ASKED AGAIN UNTIL THE CARD IS THERE, rather than once at a guessed delay: the page is built
           by `goPage`, and on a loaded machine 150ms was sometimes before it — measured, once in two
           runs at 320. Every 20ms, inside `ui.js`'s half second, then `expect` says so. */
        let tries = 0;
        const typeIt = () => {
          const inp = [...document.querySelectorAll('#s-stuff .kp-in')].find(b => b.getAttribute('data-k') === ansKey_(it));
          if (!inp) { if (++tries < 20) setTimeout(typeIt, 20); return; }
          window.__kpCard = inp.closest('.qcard');
          inp.focus();
          /* A HEADLESS PAGE THAT IS NOT THE FRONT WINDOW may take the focus without firing `focusin`;
             what a focus opens is check-flow's question, and this one is about how the pad looks. */
          if (KP_AT !== inp) kpOpen_(inp);
          ['!frac', '3', '!right'].forEach(v => {
            const k = document.querySelector('#kp .kp-key[data-v="' + v + '"]');
            if (k) k.click();
          });
        };
        setTimeout(typeIt, 60);
      },
      expect: () => {
        const pad = document.getElementById('kp');
        const card = window.__kpCard;
        const show = card && card.querySelector('.kp-show');
        return !!pad && !pad.hidden && getComputedStyle(pad).display === 'grid'
               && pad.querySelectorAll('.kp-key').length === 30
               && !!show && !!show.querySelector('.frac .frac-n') && show.querySelector('.frac .frac-n').textContent.trim() === '3'
               && !!show.querySelector('.frac-d .kp-hole') && !!show.querySelector('.frac-d .kp-caret');
      },
      wants: 'Q0664’s maths box focused, the keypad up with its 30 keys, and 3 over an empty dashed slot with the caret in it',
      leave: () => {
        const it = stuffItemsAll_().find(x => x.row && x.row.row_id === 'Q0664');
        try { if (it) localStorage.removeItem(ansKey_(it)); } catch (e) {}
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        kpClose_();
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- AND A WORDED ANSWER, WITH "MARK WITH AI" UNDER IT ------------------------------------
       The fixture is a deployment with the action and no key (`aiMarking: false`), which is what
       `doGet` sends until the owner adds one — so this says yes for the length of the state, the way
       a key in Script Properties would, and puts it back. Q33 of AQA Biology June 2024 Foundation is
       a three-mark `explain` with a scheme and no `accept`: exactly the question the button is for. */
    { name: 'a worded answer, Mark with AI under it',
      enter: () => {
        const id = 'Q-AQA-8461-2406-1F-033';
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === id);
        if (!it) throw new Error(id + ' is not in the library');
        DATA.aiMarking = true;
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        window.__aiKey = ansKey_(it);
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        /* SIGNED IN, IT IS MARKED — by a stand-in for `api` that answers the way `aiMark` does, so the
           picture is of the verdict and the sentence as they are really drawn, by the real handler.
           There is no Gemini in a check. Signed out, the press says to sign in, which is the other
           thing worth seeing. `api` is put back on the way out. */
        window.__aiApi = api;
        /* THE FIXTURE'S SIGNED-IN VISITOR HAS NO SESSION TOKEN, which every real sign-in carries — so
           one is lent for the length of the state, and taken back. */
        window.__aiTok = !!(typeof USER === 'object' && USER && !USER.token);
        if (window.__aiTok) USER.token = 'state-token';
        api = b => (b && b.action === 'aiMark')
          ? Promise.resolve({ success: true, awarded: 2, available: 3, left: 19,
              feedback: 'You described the fall after 1968 but not the peak before it.' })
          : window.__aiApi(b);
        /* POLLED, LIKE THE KEYPAD'S STATE ABOVE: once at 150ms missed the card at 768 on a loaded run. */
        let tries = 0;
        const markIt = () => {
          const ta = [...document.querySelectorAll('#s-stuff textarea.qp-ans-in')].find(b => b.getAttribute('data-k') === window.__aiKey);
          const go = ta && ta.closest('.qcard').querySelector('.qp-ai-go');
          if (!ta || !go) { if (++tries < 20) setTimeout(markIt, 20); return; }
          ta.value = 'It rose to a peak in the 1960s and then fell sharply once the vaccine came in.';
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          go.click();
        };
        setTimeout(markIt, 60);
      },
      expect: () => {
        const ta = [...document.querySelectorAll('#s-stuff textarea.qp-ans-in')].find(b => b.getAttribute('data-k') === window.__aiKey);
        const card = ta && ta.closest('.qcard');
        const go = card && card.querySelector('.qp-ai-go');
        const said = card && card.querySelector('.qp-ai .qp-verdict');
        const why = card && card.querySelector('.qp-ai-why');
        const marked = (typeof USER === 'object' && USER && USER.token)
          ? /2 of 3 marks/.test(said.textContent) && /peak/.test(why.textContent)
          : /Sign in/.test(said.textContent);
        return !!go && !card.querySelector('.kp-in') && !!said && marked;
      },
      wants: 'a three-mark explain question with its textarea, "Mark with AI" under it, and its verdict drawn — 2 of 3 and a sentence signed in, "sign in" signed out',
      leave: () => {
        if (window.__aiApi) api = window.__aiApi;
        if (window.__aiTok && USER) delete USER.token;
        try { localStorage.removeItem(window.__aiKey); } catch (e) {}
        DATA.aiMarking = false;
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
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
      /* AND ONE ROW OF TILES. The Watch tile was a `.tile-row` drawn INSIDE the card, above the
         notes, with the star's row under the card — two rows on one film, where a fight has one.
         It is `filmTiles_`'s now, so a row inside a film card is that shape coming back. */
      expect: () => {
        const films = [...document.querySelectorAll('#s-stuff .card.film')];
        const live = films.find(c => !c.classList.contains('is-off'));
        const row = live && live.parentElement && live.parentElement.nextElementSibling;
        return films.length >= 2 && !films.some(c => c.querySelector('.tile-row'))
               && !!row && row.classList.contains('tile-row') && !!row.querySelector('a.tile[href]');
      },
      wants: 'at least two film cards, each with no tile row inside it, and the Watch tile in the row under the card' },
    /* ==============================================================================================
       THE FIND CARD'S SHARED PARTS, ON THE KINDS THAT HAD NONE OF THEM

       ASKED FOR AS *"didn't I ask you to sleekerise the whole widget system in the finder"* — and
       two kinds in Find had never been on a screen this file drew: the boxer and the fight. The
       boxer was a SHOP row (a 0.92rem title, the record pinned in a corner) and the fight a loose
       paragraph of names, and nothing measured either, because no state reached Resources ›
       Boxing. These do, and each asks for the shared shape rather than just "a card": the title in
       `.fc-head` at the one title size, the kind flag drawn ABOVE it (the kicker slot every page
       now has), and the numbers on the gold meta line.

       `fcHead` IS WRITTEN OUT IN EACH, not shared, because these functions are passed to the
       browser as source one at a time and cannot see each other — the note at the top of the file.
    ============================================================================================== */
    { name: 'the boxers, on the shared head',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: 'Resources' }, { field: 'shelf', value: 'Boxing' },
                         { field: 'boxKind', value: 'Boxers' }];
        paintStuff();
        goPage('stuff', stuffFirstResult_(), true);
      },
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .card.fc.boxer')
               || document.querySelector('#s-stuff .card.fc.boxer');
        if (!c || c.querySelector('.thing')) return false;
        const h3 = c.querySelector('.fc-head > h3'), flag = c.querySelector('.fc-head .fc-flag');
        const rec = c.querySelector('.fc-meta.boxer-rec');
        if (!h3 || !flag || !rec || flag.textContent.trim() !== 'Boxer') return false;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return Math.abs(parseFloat(getComputedStyle(h3).fontSize) - 1.1 * rem) < .5
               && flag.getBoundingClientRect().bottom <= h3.getBoundingClientRect().top + .5
               && /^\d+-\d+-\d+/.test(rec.textContent.trim());
      },
      wants: 'a boxer on the shared head — the name at the title size under a Boxer flag, the record on the meta line, no shop row',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    { name: 'the fights, on the shared head',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: 'Resources' }, { field: 'shelf', value: 'Boxing' },
                         { field: 'boxKind', value: 'Fights' }];
        paintStuff();
        goPage('stuff', stuffFirstResult_(), true);
      },
      /* AND NO `.note` PARAGRAPHS. The title and the venue were two of them a browser's default
         margin apart; they are one `.fc-note` line now, and the method is in sentence case like
         every other meta line rather than in capitals. */
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .card.fc.fight')
               || document.querySelector('#s-stuff .card.fc.fight');
        if (!c || c.querySelector('p.note')) return false;
        const h3 = c.querySelector('.fc-head > h3.fight-line'), flag = c.querySelector('.fc-head .fc-flag');
        const how = c.querySelector('.fc-meta');
        if (!h3 || !flag || !how || flag.textContent.trim() !== 'Fight') return false;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return Math.abs(parseFloat(getComputedStyle(h3).fontSize) - 1.1 * rem) < .5
               && flag.getBoundingClientRect().bottom <= h3.getBoundingClientRect().top + .5
               && getComputedStyle(how).textTransform === 'none';
      },
      wants: 'a fight on the shared head — the two names as the title under a Fight flag, how it ended in sentence case, no loose note paragraphs',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- THE TEXTBOOK'S CONTENTS, AND `10.` INSIDE THE CARD ---------------------------------
       `a textbook chapter` lands nine pages past the contents card, so the card itself was in the
       DOM only as a neighbour and never the page measured. Its list has sixteen numbers, and with a
       bullet's 1.1rem indent `10.` to `16.` hung out past the card's padding at 320px — a marker is
       not a box, so no overflow rule could see it. So this asks the arithmetic directly: the list's
       indent against the width of its widest number, set in the list's own font. */
    { name: "the textbook's contents, every number inside the card",
      enter: () => {
        const x = stuffItemsAll_().find(it => it.kind === 'textbook');
        if (!x) throw new Error('no textbook in the list — data/textbooks.json did not load');
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label }, { field: 'shelf', value: x.shelf }];
        paintStuff();
        goPage('stuff', stuffFirstResult_(), true);
      },
      expect: () => {
        const c = document.querySelector('#s-stuff .card.tb:not(.prac-part)');
        const ol = c && c.querySelector('.tb-toc ol.fc-list');
        const li = ol && ol.children;
        if (!li || li.length < 10) return false;
        const probe = document.createElement('span');
        probe.textContent = li.length + '. ';
        probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
        li[li.length - 1].appendChild(probe);
        const need = probe.getBoundingClientRect().width;
        probe.remove();
        return parseFloat(getComputedStyle(ol).paddingLeft) >= need;
      },
      wants: "the textbook's contents card, its list indented at least as wide as its widest number",
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- THE TWO WAYS THE FUNNEL ENDS WITHOUT A QUESTION ------------------------------------
       NEITHER WAS A STATE. `Nothing matches` is what a search for nothing says, and "Nothing left to
       narrow" is the last line under the chips when every question is answered — an inline
       `style="margin:.6rem 0 0"` in the faintest ink until it had a class. Both are measured for
       contrast here for the first time. */
    { name: 'a search that matches nothing',
      enter: () => { STUFF.filters = []; STUFF.q = 'zqxjv nothing is called this'; paintStuff(); goPage('stuff', 0, true); },
      expect: () => /Nothing matches/.test((document.querySelector('#stuff-groups .empty') || {}).textContent || ''),
      wants: 'the funnel saying Nothing matches',
      leave: () => { STUFF.q = ''; paintStuff(); goPage('stuff', 0); } },
    { name: 'nothing left to narrow',
      /* ANSWERED BY THE FUNNEL'S OWN ROWS until it stops asking, over the projects — eight things,
         so it runs out of questions in two or three answers whatever the data says next week. */
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Projects' }];
        paintStuff();
        for (let i = 0; i < 8; i++) {
          const r = document.querySelector('#stuff-groups .answers > .row[data-do="facet-pick"]');
          if (!r) break;
          r.click();
        }
        goPage('stuff', 0, true);
      },
      expect: () => {
        const end = document.querySelector('#stuff-groups .find-end');
        const chips = document.querySelector('#stuff-chips .chips');
        return !!end && /Nothing left to narrow/.test(end.textContent) && !end.hasAttribute('style')
               && !!end.querySelector('b') && !!chips
               && parseFloat(getComputedStyle(chips).borderBottomWidth) >= 1;
      },
      wants: 'the funnel ending on "Nothing left to narrow" in its own class, with a rule under the chosen chips',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- "STABLE": AN ANSWER PRESSED MOVES NOTHING ABOVE IT ---------------------------------
       *"nice more sleek, fresh stable"*. Pressing an answer adds a chip and asks the next question,
       so the list UNDER the chips moves by design — but the search box and the chips already chosen
       must not move a pixel, or the thing you were about to press next is somewhere else. Measured
       before and after a real click on the first answer, relative to the pane. */
    { name: 'an answer pressed, the search box and the chips still',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' }];
        paintStuff();
        goPage('stuff', 0, true);
        window.__findStill = null;
        setTimeout(() => {
          const pane = document.getElementById('stuff-controls');
          const at = () => {
            const top = pane.getBoundingClientRect().top;
            const q = document.getElementById('stuff-q').getBoundingClientRect().top - top;
            const chip = document.querySelector('#stuff-chips .chip');
            return [q, chip ? chip.getBoundingClientRect().top - top : -1,
                    chip ? chip.getBoundingClientRect().left : -1];
          };
          const a = at();
          const r = document.querySelector('#stuff-groups .answers > .row[data-do="facet-pick"]');
          if (!r) return;
          r.click();
          window.__findStill = { a, b: at(), n: STUFF.filters.length };
        }, 150);
      },
      expect: () => {
        const s = window.__findStill;
        return !!s && s.n === 2 && s.a[1] >= 0 && s.a.every((v, i) => Math.abs(v - s.b[i]) < .5);
      },
      wants: 'a second chip added with the search box and the first chip exactly where they were',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- AND A CARD'S OWN PAGES FILLING MOVE NOTHING ON IT ----------------------------------
       The pager fills pages either side of the one in front as you swipe, so a practical's diagram,
       kit and steps are drawn into the DOM while you are reading its card. Measured on the card:
       its title and its foot, relative to its pane, before and after turning two pages on and
       back. THREE PAGES WAS NOT ENOUGH and the first version measured nothing: with `STUFF_NEAR` at 5
       every page it passed was already drawn. `STUFF_NEAR + 3` on is far enough that the card's OWN
       page is emptied, so coming back draws it again from nothing — the moment a card loads. */
    { name: "a practical's pages filled, its card still",
      enter: () => {
        const x = stuffItemsAll_().find(it => it.kind === 'practical' && !it.row.excluded && it.row.diagram);
        if (!x) throw new Error('no practical with a diagram');
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label }];
        paintStuff();
        const first = stuffFirstResult_();
        goPage('stuff', first, true);
        window.__cardStill = null;
        /* THE CARD'S PAGE BY THE APP'S OWN `domIndex_`, NOT THE N-TH CHILD AND NOT `.page.on`: the
           pager keeps a window of result pages and recycles them, so the strip's children are not
           numbered by page, and `.on` moves on the next frame rather than inside `goPage`. */
        const page = () => document.querySelectorAll('#s-stuff > .page')[domIndex_('stuff', first)];
        const at = () => {
          const pg = page(), pane = pg && pg.querySelector('.pane');
          const h3 = pane && pane.querySelector('.card.fc .fc-head h3');
          /* THE CARD'S FOOT, NOT THE TILE ROW: signed out there is no star and no admin mark, so
             there is no row, and a state that measures nothing for a stranger is not measuring. */
          const card = h3 && h3.closest('.card');
          if (!card) return null;
          const t = pane.getBoundingClientRect().top;
          return [h3.getBoundingClientRect().top - t, card.getBoundingClientRect().bottom - t,
                  pane.getBoundingClientRect().height];
        };
        /* THE PAGES ARE FILLED BY `fillStuffPages`, CALLED HERE RATHER THAN WAITED FOR, AND NOTHING
           IN THIS STATE WAITS ON A TIMER. The pager fills on the settle after a swipe; the first
           version waited for it, then waited 60ms twice for its own measurements — and with the
           whole suite running at once those timers fired after the half second `check/ui.js` gives
           a state, so it reported the card missing at every width. Calling the app's own filler
           (`all`, so the far pages are not left to a timer either) is the same drawing, and reading
           a box forces the layout, so the whole thing is synchronous. The title node is kept so the
           expect can tell the card was drawn AGAIN rather than left standing. */
        fillStuffPages(true);
        const a = at();
        const was = page() && page().querySelector('.card.fc .fc-head h3');
        goPage('stuff', first + STUFF_NEAR + 3, true); fillStuffPages(true);
        goPage('stuff', first, true); fillStuffPages(true);
        const now = page() && page().querySelector('.card.fc .fc-head h3');
        window.__cardStill = { a, b: at(), redrawn: !!now && now !== was };
      },
      expect: () => {
        const s = window.__cardStill;
        return !!s && !!s.a && !!s.b && s.redrawn && s.a.every((v, i) => Math.abs(v - s.b[i]) < .5);
      },
      wants: "a practical's card with its title, its foot and its pane's height unchanged after its pages filled",
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
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
    /* ---------- THE SHEET THAT MAKES AN ACCOUNT ----------------------------------------------------
       ASKED FOR AS *"turn the sign in and forgot pin buttons into tiles. same with create account
       button."* The third tile opens a four-box form a signed-out visitor is the only one to see —
       and `#sheet` is a sibling of the screens, so without a state of its own neither the measuring
       pass nor the pressing pass would ever have it open. Entered through the tile's own handler. */
    { name: 'making an account',
      only: () => typeof USER !== 'undefined' && !USER,
      enter: () => {
        const tile = document.querySelector('#s-account [data-do="register"]');
        if (!tile) throw new Error('no Make an account tile on the signed-out account column');
        ACTIONS['register'](tile);
      },
      expect: () => ['reg-first', 'reg-last', 'reg-email', 'reg-pin']
        .filter(id => document.getElementById(id)).length
        + (document.querySelector('#sheet-body [data-do="reg-send"]') ? 1 : 0) === 5 ? 5 : 0,
      wants: 'the register sheet open: four boxes and its one button',
      leave: () => { closeSheet(); } },
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
    /* ---------- THE AGES THEY TEACH, AS A CHIP UNDER "AT A GLANCE" ---------------------------------
       `check/fixture.json`'s tutor teaches 8 to 16, which is what `doGet` sends as `ageMin: 8,
       ageMax: 16`. The chip sits among the other facts rather than as a row of its own, and the
       assertion is the WORDS — a chip reading "8 – 16" or "Ages: 8, 16" is the card saying it
       differently from `profAges_`, which `check-flow.js` holds to every one-ended shape. */
    { name: 'an age range on a card',
      only: () => typeof USER !== 'undefined' && !!USER
                  && (DATA.tutors || []).some(t => t && t.ageMin === 8 && t.ageMax === 16),
      enter: () => {
        const at = [...document.querySelectorAll('#s-account .page')]
          .findIndex(pg => [...pg.querySelectorAll('.prof-facts .prof-tag')].some(c => /^Ages /.test(c.textContent.trim())));
        if (at < 0) throw new Error('no card on the account column draws an age range');
        goPage('account', at, true);
      },
      expect: () => [...document.querySelectorAll('#s-account .page.on .prof-facts .prof-tag')]
                      .some(c => c.textContent.trim() === 'Ages 8–16') ? 1 : 0,
      wants: 'the fixture tutor\'s "Ages 8–16" chip under At a glance' },
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
    /* ---------- A TUTOR'S OTHER PHOTOGRAPHS, AND ONE OF THEM OPENED -----------------------------
       ASKED FOR AS *"tutors should be able to add more pics"*. The grid is four squares to a row and
       a tap opens one across the row, in place — so the state that matters is the OPENED one: a
       picture at its own proportions is the tallest thing this card can hold, and it is exactly the
       height `paneWatch_` has to hear about. `check/fixture.json`'s tutor carries three local
       pictures so the squares have something real in them. */
    { name: "a tutor's photographs, one opened",
      only: () => typeof USER !== 'undefined' && !!USER
                  && (DATA.tutors || []).some(t => t && Array.isArray(t.photos) && t.photos.length),
      enter: () => {
        const pages = [...document.querySelectorAll('#s-account .page')];
        const at = pages.findIndex(pg => pg.querySelector('.prof-photos'));
        if (at < 0) throw new Error('no card on the account column draws a tutor\'s photographs');
        goPage('account', at, true);
        /* THE PAGE BY INDEX, NOT `.page.on` — that class is written when the column is placed, so
           read in the same tick as `goPage` it names the page the column was on before the turn. */
        const shots = pages[at].querySelectorAll('.prof-shot');
        if (shots[1]) shots[1].click();
      },
      expect: () => {
        const grid = document.querySelector('#s-account .page.on .prof-photos');
        const shots = grid ? [...grid.querySelectorAll('.prof-shot')] : [];
        const big = shots.filter(b => b.classList.contains('is-big'));
        return shots.length >= 2 && big.length === 1 && big[0] === shots[1]
          && big[0].getAttribute('aria-pressed') === 'true' ? shots.length : 0;
      },
      wants: "a tutor's photographs as squares, with the one tapped opened across the row",
      leave: () => { paint('account'); } },
    /* ---------- WHAT THEY TEACH: ONE CHIP A SUBJECT, ITS LEVELS RAISED — see `teachGroups_` ------
       *"Subject ^level, level, level … no brackets."* The fixture's tutor teaches one level of two
       subjects, so every chip it draws has one level and nothing wraps — which is the arrangement
       that cannot go wrong. So this seeds the one that can: a subject at four levels, and a subject
       with a long name, so a raised list has to break at 320px and the lab measures where it went —
       sideways scroll, contrast of the raised levels, and the card against its pane. Seeded onto
       `DATA.tutors` in the server's own shape, as the switched-off tutor above is, and put back. */
    { name: 'a tutor teaching one subject at several levels',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.__TEACH_HELD = (DATA.tutors || []).slice();
        window.__TEACH_AT = PAGE.account || 0;
        DATA.tutors = (DATA.tutors || []).concat([Object.assign(
          {}, (DATA.tutors || [])[0] || {},
          { personId: 'P-levels', handle: 'levels', title: 'Many Levels', listed: true,
            teachesSpec: ['Maths (GCSE)', 'Maths (A-Level)'], teachesMain: 'Maths (GCSE)',
            teaches: ['Maths (GCSE)', 'Maths (A-Level)', 'Maths (KS2)', 'Maths (KS3)', 'Maths (AS)',
                      'Maths (Degree)', 'English Language and Literature (GCSE)',
                      'English Language and Literature (A-Level)', 'Physics'] })]);
        paint('account');
        const n = accountPages_().findIndex(h => /Many Levels/.test(h));
        if (n < 0) throw new Error('the seeded tutor is not on the account column');
        goPage('account', n, true);
      },
      expect: () => {
        const pg = [...document.querySelectorAll('#s-account .page')]
          .find(p => /Many Levels/.test(p.textContent));
        const tags = pg ? [...pg.querySelectorAll('.prof-teach .prof-tag')] : [];
        const said = tags.filter(x => x.querySelector('sup.prof-lv'))
          .map(x => x.textContent.replace(/\s+/g, ' ').trim());
        return said.includes('Maths GCSE, A-Level') && said.includes('Maths KS2, KS3, AS, Degree')
          && said.some(s => /^English Language and Literature GCSE, A-Level$/.test(s))
          && !tags.some(x => /[()]/.test(x.textContent)) ? tags.length : 0;
      },
      wants: 'a subject drawn once per row, its levels raised after it and no brackets anywhere',
      /* AND THE COLUMN GOES BACK TO THE PAGE IT WAS ON. Taking the seeded tutor out takes a page out
         from under the one this state turned to, so a bare repaint left `PAGE.account` naming a page
         that is no longer there — and `COLUMNS OUT OF LINE` reported the account column 500px off
         every other column, which was this state's own debris rather than the app. */
      leave: () => {
        if (window.__TEACH_HELD) DATA.tutors = window.__TEACH_HELD;
        paint('account');
        goPage('account', window.__TEACH_AT || 0, true);
      } },
    /* ---------- WHERE THEY TUTOR, AS A HEAT MAP — see `profHeat_` in cards.js ------------------
       *"just let it be a heat map of the areas"*. The fixture's tutor ticks three: one venue WITH
       coordinates, one WITHOUT (left off rather than guessed), and Online (a chip, not a place). So
       the map must carry exactly one glow, the Online chip must be under it, and no venue's name may
       be printed on the card — which is the whole point of the change. Also the five captions and no
       sixth: *"there should be x number of titles"*. */
    { name: 'a tutor card, the five captions and the area map',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const pages = [...document.querySelectorAll('#s-account .page')];
        const at = pages.findIndex(pg => pg.querySelector('.prof-heat'));
        if (at < 0) throw new Error('no card on the account column draws a heat map');
        goPage('account', at, true);
      },
      expect: () => {
        const pg = [...document.querySelectorAll('#s-account .page')].find(p => p.querySelector('.prof-heat'));
        if (!pg) return 0;
        const caps = [...pg.querySelectorAll('.prof-cap')].map(c => c.textContent.trim());
        /* AND `Available` AFTER IT, which is the one caption added since the five were asked for —
           *"tutors availability should appear on their card."* It is the week, drawn by `profAvail_`
           only for a tutor who has ticked an hour, so it may follow the map and nothing else may. */
        const allowed = ['At a glance', 'Teaches', 'Can also teach', 'Qualifications', 'Tutors at', 'Available'];
        const last = caps.filter(c => c !== 'Available');
        const text = pg.textContent;
        const heat = pg.querySelector('.prof-heat');
        return heat.getAttribute('data-dots') === '1'
          && ((heat.querySelector('.heat-tiles') || {}).style || { backgroundImage: '' }).backgroundImage
               .match(/tile\.openstreetmap\.org/g)?.length >= 2
          && caps.every(c => allowed.includes(c)) && caps.includes('Tutors at')
          && last.indexOf('Tutors at') === last.length - 1
          && (!caps.includes('Available') || caps.indexOf('Available') === caps.length - 1)
          && [...pg.querySelectorAll('.prof-tag')].some(x => x.textContent.trim() === 'Online')
          && !/Colliers Wood Library|Sutton Library/.test(text) ? 1 : 0;
      },
      wants: 'the five captions in order, one glow on a map, Online as a chip, and no venue named',
      leave: () => { paint('account'); } },
    /* ---------- A TUTOR'S HOURS ON THEIR CARD — see `profAvail_` in cards.js -----------------------
       *"tutors availability should appear on their card."* The fixture's tutor sends what `doGet`
       sends — 77 codes, nine of them 'TRUE' (Mon 16-18, Tue 10-11, Wed 16, Sat 10-12) — and is
       already teaching Mon 17. So eight hours lit, Mon 17 greyed, and the three days nothing is
       ticked on (Thu, Fri, Sun) collapsed rather than drawn as thumb-sized rows of grey. Measured at
       every width because it is the last thing on a card that is already near its pane's height. */
    { name: 'a tutor\'s hours on their card',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const pages = [...document.querySelectorAll('#s-account .page')];
        const at = pages.findIndex(pg => pg.querySelector('.prof-week'));
        if (at < 0) throw new Error('no card on the account column draws a tutor\'s week');
        goPage('account', at, true);
      },
      expect: () => {
        const pg = [...document.querySelectorAll('#s-account .page')].find(p => p.querySelector('.prof-week'));
        if (!pg) return 0;
        const wk = pg.querySelector('.prof-week');
        const cap = wk.previousElementSibling;
        const rows = [...wk.querySelectorAll('.slot-row:not(.slot-head)')];
        const busy = wk.querySelector('.hr[data-code="m17"]');
        return cap && cap.textContent.trim() === 'Available'
          && wk.querySelectorAll('.hr.on').length === 8
          && !!busy && !busy.classList.contains('on') && busy.classList.contains('shut')
          && rows.length === 7 && rows.filter(r => r.classList.contains('is-shut')).length === 3
          && !wk.querySelector('button, input, label') ? 1 : 0;
      },
      wants: 'an Available caption over a week with eight hours lit, Monday 17 greyed as taught, and Thu, Fri and Sun collapsed',
      leave: () => { paint('account'); } },
    /* ---------- YOUR FAMILY, A CARD EACH ------------------------------------------------------------
       ASKED FOR AS *"students should be able to see their parents and likewise"*. `DATA.family` is a
       key the fixture cannot carry — `doGet` builds it from the signed-in person's own accepted
       links — so it is seeded here, which is the state a payload with a family in it produces: one
       parent and one child, so both labels are drawn and measured. Long names on purpose, because
       the name is the widest thing on the card. */
    { name: 'your family, a card each',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.__FAM_HELD = DATA.family; window.__FAM_FOR = DATA.familyFor; window.__FAM_CLAIMS = DATA.claims;
        /* AND ONE REQUEST WAITING ON AN ANSWER, so the claim card is measured and its two buttons
           are pressed by `check/press.js` — it is drawn only from a payload the fixture cannot carry. */
        DATA.claims = [{ rowIndex: 99, from: 'Bartholomew Askerton-Longfellow', asked: '01/10/2026' }];
        /* Stamped as THIS visitor's, or the column correctly refuses to draw it — see `familyFor`. */
        DATA.familyFor = USER.personId;
        DATA.family = [
          { personId: 'P-fam-parent', title: 'Philippa Parentington-Smythe', relation: 'parent',
            handle: 'philippa_bright42', image: '' },
          { personId: 'P-fam-child', title: 'Christopher Childerley', relation: 'child',
            handle: 'christopher_calm17', image: '' },
          /* AND A SIBLING, on *"students should be able to see their parents and siblings
             likewise"* — the longest of the three labels, so it is the one measured at 320. */
          { personId: 'P-fam-sib', title: 'Bartholomew Brotherington-Hale', relation: 'sibling',
            handle: 'bartholomew_kind19', image: '' },
        ];
        paint('account');
        /* ON THE REQUEST, which is the page in front of the family cards: the one with buttons. */
        const n = accountPages_().findIndex(h => /says they are your parent/.test(h));
        if (n < 0) throw new Error('no claim card on the account column');
        goPage('account', n, true);
      },
      expect: () => {
        const heads = [...document.querySelectorAll('#s-account .card.is-prof h3')].map(h => h.textContent.trim());
        return heads.filter(h => h === 'Your parent').length === 1
            && heads.filter(h => h === 'Your child').length === 1
            && heads.filter(h => h === 'Your brother or sister').length === 1
            && document.querySelectorAll('#s-account [data-do="claim-yes"]').length === 1 ? 3 : 0;
      },
      wants: 'one card each headed "Your parent", "Your child" and "Your brother or sister", and one request to answer',
      /* `repaint(true)`, not `paint`: four pages leave the column (a sibling made it four), so it is placed again — a bare paint
         left the card in front sitting where the old page 2 was, and COLUMNS OUT OF LINE said so. */
      leave: () => { DATA.family = window.__FAM_HELD; DATA.familyFor = window.__FAM_FOR; DATA.claims = window.__FAM_CLAIMS; repaint(true); } },
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
    /* ---------- THE PHOTOGRAPHS PAGE: THE FACE, THE CLIP, AND A SHELF OF EIGHT ------------------
       Eight boxes are IN the form whether or not they are drawn — `photosIn` rebuilds the whole cell
       from what arrives, so a box missing from the form is a photograph deleted on Save — and only
       the filled ones SHOW, each with a thumbnail of the link beside it and one `Add another` under
       them. Seeded through `USER.profile`, which is what the column is drawn from. */
    { name: 'the photographs',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_PHOTO_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, {
          photos_1: 'data/reels/archetest.jpg', photos_2: 'icon.png' });
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('[data-me="photos_1"]'));
        if (at < 0) throw new Error('no photographs page on the settings column');
        goPage('settings', at, true);
      },
      leave: () => {
        USER.profile = window.STATE_PHOTO_WAS; delete window.STATE_PHOTO_WAS;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
      },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        if (!pg) return 0;
        const slots = [...pg.querySelectorAll('.ph-slot')];
        const shown = slots.filter(s => !s.hidden);
        return pg.querySelectorAll('[data-me^="photos_"]').length === 8
          /* THE FACE IS THE PICKER NOW, NOT A LINK BOX — `photoPicker_`, and no `data-me="photo"` beside
             it, which the card's Save would post with the old address over a picture just chosen. */
          && !!pg.querySelector('.pfp') && !pg.querySelector('[data-me="photo"]') && !!pg.querySelector('[data-me="video"]')
          && shown.length === 2 && shown.every(s => s.querySelector('.ph-thumb img'))
          && pg.querySelectorAll('[data-do="shelf-more"]').length === 1
          && pg.querySelectorAll('[data-do="me-save"]').length === 1 ? 8 : 0;
      },
      wants: 'the picture picker and the video, then the two filled photograph links with a thumbnail each, eight boxes in the form and one Add another' },
    /* ---------- YOUR PICTURE, CHOSEN — `photoPicker_` in me.js ------------------------------------
       *"everyone should have a profile picture selector widget in account settings"*. Seeded with a
       picture already kept, so the preview is a photograph rather than the initial and `Remove` is
       live: a square preview, `Choose photo` and `Remove` as tiles, the hidden file input that takes
       images, and no link box. At four widths, because the preview sits beside two tap targets and
       a line of text and is the one row on the card that could wrap at 320. */
    { name: 'your picture, chosen',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_PFP_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, { photo: 'data/reels/archetest.jpg' });
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')].findIndex(pg => pg.querySelector('.pfp'));
        if (at < 0) throw new Error('no picture picker on the settings column');
        goPage('settings', at, true);
      },
      leave: () => {
        USER.profile = window.STATE_PFP_WAS; delete window.STATE_PFP_WAS;
        paint('settings');
      },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        const box = pg && pg.querySelector('.pfp');
        if (!box) return 0;
        const face = box.querySelector('.pfp-face');
        const r = face && face.getBoundingClientRect();
        const rm = box.querySelector('.tile[data-do="pfp-remove"]');
        const inp = box.querySelector('input.pfp-in[type="file"]');
        return !!face.querySelector('img') && r.width > 40 && Math.abs(r.width - r.height) < 1
          && !!box.querySelector('.tile[data-do="pfp-pick"]') && !!rm && !rm.disabled
          && !!inp && inp.hidden && /image\/\*/.test(inp.accept)
          && !pg.querySelector('[data-me="photo"]') ? 1 : 0;
      },
      wants: 'a square preview of the picture, Choose photo and a live Remove as tiles, a hidden image input, and no link box' },
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

    /* ---------- YOUR JOURNEY, THE PLACEHOLDER ----------------------------------------------------
       For a student and an admin; the lab signs in as an admin. Found by asking the DOM, as the
       pricing state does, and seeded with an exam date a fortnight out so the one live line draws. */
    { name: 'your journey',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const t = new Date(Date.now() + 14 * 864e5);
        USER.profile = Object.assign({}, USER.profile || {},
          { exam_big_date: t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0') });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')].findIndex(pg => pg.querySelector('.card.journey'));
        if (at < 0) throw new Error('no journey card on the settings column');
        goPage('settings', at, true);
      },
      expect: () => {
        const c = document.querySelector('#s-settings .card.journey');
        return !!c && /days? to go/.test(c.textContent) && !c.querySelector('button, [data-do]');
      },
      wants: 'the journey card, with the exam countdown and no control that does nothing',
      leave: () => { if (USER && USER.profile) delete USER.profile.exam_big_date; paint('settings'); } },
    /* ---------- THE AGES A TUTOR TEACHES, ON ABOUT YOU AND NOT ON THE PAGE ABOVE ------------------
       ONE `[youngest] – [oldest]` ROW OF TWO SELECTS, and the assertion is that shape rather than the
       presence of two fields: two plain boxes would mean `validations` never carried `AGE_OPTIONS`, and
       the form would be offering free text to a server that refuses anything off the list. The
       options are read off `DATA.validations` rather than written out here — a list typed into this
       file would be a third copy of one the backend owns.
       NOT ON THE RATE PAGE, which the state above counts at exactly four boxes: an age range prices
       nothing, so it is not under the month's clock. Seeded through `USER.profile` with one end the
       word `Adults`, because that is the option a number-shaped reader would get wrong. */
    { name: 'the age range',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_AGE_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, { age_min: '8', age_max: 'Adults' });
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('[data-me="age_min"]'));
        if (at < 0) throw new Error('no age range on the settings column');
        goPage('settings', at, true);
      },
      leave: () => {
        USER.profile = window.STATE_AGE_WAS; delete window.STATE_AGE_WAS;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
      },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        const row = pg && pg.querySelector('.f-row.is-range');
        const lo = row && row.querySelector('select[data-me="age_min"]');
        const hi = row && row.querySelector('select[data-me="age_max"]');
        const want = ((DATA.validations || {}).age_min || []).join('|');
        const offers = s => [...s.options].map(o => o.value).filter(Boolean).join('|');
        return lo && hi && want && offers(lo) === want && offers(hi) === want
          && lo.value === '8' && hi.value === 'Adults'
          && !pg.querySelector('[data-me="rate_per_hour"]')
          && pg.querySelectorAll('[data-do="me-save"]').length === 1 ? 2 : 0;
      },
      wants: 'the ages as one [youngest] – [oldest] row of two selects, 8 and Adults chosen, on a page without the rate' },

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

    /* ---------- YOUR ROLES, WITH A TUTOR TICK WAITING — `rolesCard_` in me.js ---------------------
       *"each account should have a widget in account settings which say what the roles are … like
       multiselect."* The lab signs in as an admin, and an admin is never pending — so the state plays
       a parent who has ticked Tutor and been told to wait: `role`, `roles` and `tutorPending` as the
       sign-in reply sends them. That is the card's fullest drawing: two ticks of three, two-line
       labels, and the waiting sentence under the tile — the one row that could wrap at 320 and the
       three 44px targets that must not shrink with it. `leave` puts the admin back exactly. */
    { name: 'your roles, a Tutor tick waiting',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_ROLES_WAS = { role: USER.role, roles: USER.roles, tutorPending: USER.tutorPending };
        Object.assign(USER, { role: 'tutor', roles: ['tutor', 'parent'], tutorPending: true });
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')].findIndex(pg => pg.querySelector('.roles-card'));
        if (at < 0) throw new Error('no roles card on the settings column');
        goPage('settings', at, true);
      },
      leave: () => {
        const was = window.STATE_ROLES_WAS || {}; delete window.STATE_ROLES_WAS;
        USER.role = was.role; USER.roles = was.roles;
        if (was.tutorPending === undefined) delete USER.tutorPending; else USER.tutorPending = was.tutorPending;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
      },
      expect: () => {
        const c = document.querySelector('#s-settings .page.on .roles-card');
        if (!c) return 0;
        const on = r => { const b = c.querySelector(`[data-role-pick="${r}"]`); return b ? b.checked : null; };
        return on('tutor') === true && on('client') === true && on('student') === false
          && !c.querySelector('[data-role-pick="admin"]') && !c.querySelector('.role-admin')
          && /waiting for @family/.test((c.querySelector('.roles-said') || {}).textContent || '')
          && !!c.querySelector('.tile[data-do="roles-save"]') ? 1 : 0;
      },
      wants: 'three role ticks, Tutor and Client ticked, no Admin tick, the waiting line and a Save tile' },

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

    /* THE BUSINESS RECORDS, AN ADMIN'S PAGES OF THIS COLUMN — they were a widget on Tools. `only:`
       for the flyer's reason: nobody else is drawn one, so asking a stranger to reach it would be a
       finding about the check. SEEDED THROUGH `BIZ.list`, which is what `listRecords` writes — the
       fixture answers every POST with the payload, so without a seed the page is measured with every
       box empty and no flag, which is half of what the card can draw. One item due in ten days, so
       the Due soon flag is on the screen and measured. */
    { name: 'the business records (insurance)',
      only: () => typeof USER !== 'undefined' && !!USER && isAdmin(),
      enter: () => {
        const d = new Date(); d.setDate(d.getDate() + 10);
        const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-'
          + String(d.getDate()).padStart(2, '0');
        window.__bizWas = BIZ.list;
        BIZ.list = [{ id: 'pub_liability', title: 'Public liability insurance', category: 'Insurance',
          provider: 'Example Insure', reference: 'PL-000000', due_on: iso }];
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('[data-biz-page="Insurance"]'));
        if (at < 0) throw new Error('no business-records page on the settings column');
        goPage('settings', at, true);
      },
      leave: () => { BIZ.list = window.__bizWas || null; delete window.__bizWas;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings'); },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        return pg && pg.querySelectorAll('.biz-item').length === 3
          && pg.querySelectorAll('input[type="date"][data-biz]').length === 3
          && /Due soon/.test((pg.querySelector('.biz-item.is-soon .biz-flag') || {}).textContent || '')
          && (pg.querySelector('[data-biz="pub_liability"][data-k="reference"]') || {}).value === 'PL-000000';
      },
      wants: 'three insurance items, each with its date box, and the one due soon flagged' },

    /* ---------- THE QUALIFICATIONS: A LIST YOU READ, AND ONE EDITOR AT A TIME ----------------------
       REPORTED AS *"the current system for adding qualifications is really hard to understand."* The
       shelf is a read list now — a bold subject, its levels as plain lines, a word button `Edit` on
       each — and an editor opens in place of the one row being changed. What this asserts is the
       DATA CONTRACT the redraw must not break, and the SHAPE the owner asked for:
       - all seventy `qual_*` boxes in the form, drawn or not, because `qualsIn` rebuilds the person's
         rows from what arrives and a slot missing from the form is a qualification deleted on Save;
       - Maths once, with its two levels under it, and the degree a level of its own subject;
       - no checkbox anywhere on the shelf: Teach and Can teach are HIDDEN boxes holding TRUE/FALSE,
         read here as values — GCSE taught (so both TRUE), A-Level can-teach only;
       - an `Edit` per level and per subject, no glyph to decode, and no `data-me` on a control that
         is not an answer.
       FOUND BY ASKING THE DOM for the tenth slot's place box, which exists whether or not it shows. */
    { name: 'the qualifications',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        /* TWO LEVELS OF ONE SUBJECT AND A DEGREE, through `USER.profile`, which is what the column is
           drawn from. The two Maths records must be ONE subject with two levels under it. Written
           out in each state rather than shared, because a state is sent to the page as source. */
        window.STATE_QUAL_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, {
          qual_1: 'Maths', qual_1_level: 'GCSE', qual_1_grade: '8', qual_1_board: 'Hill Top School', qual_1_received: '2017',
          qual_1_teach: 'TRUE', qual_1_spec: 'TRUE',
          qual_2: 'Maths', qual_2_level: 'A-Level', qual_2_grade: 'B', qual_2_board: 'Hill Top Sixth Form', qual_2_received: '2019',
          qual_2_teach: 'TRUE',
          qual_3: 'Bible and Theology', qual_3_level: 'Degree', qual_3_received: 'Present' });
        /* A CLEAN COLUMN FIRST — see the agreement state above. */
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const pages = [...document.querySelectorAll('#s-settings .page')];
        const at = pages.findIndex(pg => pg.querySelector('[data-me="qual_10_board"]'));
        if (at < 0) throw new Error('no qualifications page on the settings column');
        goPage('settings', at, true);
      },
      leave: () => {
        USER.profile = window.STATE_QUAL_WAS; delete window.STATE_QUAL_WAS;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
      },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        const shelf = pg && pg.querySelector('.q-shelf');
        if (!shelf) return 0;
        const subjects = [...shelf.querySelectorAll('.q-subj')];
        const maths = subjects.find(sj => sj.dataset.name === 'Maths');
        const slotsOf = sj => [...sj.querySelectorAll('.q-levels > .q-slot')];
        const val = (sl, k) => ((sl && sl.querySelector('[data-me="qual_' + sl.dataset.slot + k + '"]')) || {}).value;
        const levelOf = lvl => maths && slotsOf(maths).find(sl => val(sl, '_level') === lvl);
        const flags = [...shelf.querySelectorAll('[data-me$="_spec"], [data-me$="_teach"]')];
        return pg.querySelectorAll('[data-me^="qual_"]').length === 70
          /* NO SAVE TILE ON THIS CARD — every editor saves itself. */
          && pg.querySelectorAll('[data-do="me-save"]').length === 0
          && subjects.length === 2 && !!maths
          && shelf.querySelectorAll('.q-head').length === 2
          && slotsOf(maths).length === 2
          && slotsOf(maths).every(sl => val(sl, '') === 'Maths')
          && subjects.some(sj => sj.dataset.name === 'Bible and Theology')
          && !shelf.querySelector('input[type="checkbox"]')
          && flags.length === 20 && flags.every(b => b.type === 'hidden')
          && val(levelOf('A-Level'), '_spec') === 'FALSE' && val(levelOf('A-Level'), '_teach') === 'TRUE'
          && val(levelOf('GCSE'), '_spec') === 'TRUE' && val(levelOf('GCSE'), '_teach') === 'TRUE'
          && shelf.querySelectorAll('.q-levels > .q-slot [data-do="qual-edit"]').length === 3
          && shelf.querySelectorAll('[data-do="qual-subj-edit"]').length === 2
          && !/[✓★▸▾✕]/.test(shelf.textContent)
          && !shelf.querySelector('.q-seg [data-me], .q-acts [data-me]')
          /* THE GOLD CHIP ON GCSE ONLY, and nothing open. */
          && shelf.querySelectorAll('.q-chip').length === 1 && !!levelOf('GCSE').querySelector('.q-chip')
          && !shelf.querySelector('.is-editing')
          && !!shelf.querySelector('input[data-me$="_board"]')
          ? 70 : 0;
      },
      wants: 'Maths drawn once with GCSE and A-Level as read rows under it, a degree as a level of its own subject, Teach as hidden TRUE/FALSE boxes, an Edit per level and subject, and no glyphs or checkboxes' },
    /* AND THE A-LEVEL EDITOR OPEN, through the page's own `Edit`. One thing open, the three-way control
       drawn with `Can teach` lit (that is what the A-Level holds), every caption above its box, and
       `Still studying` offered in Finished. Every other `Edit` is off the page while it is open. */
    { name: 'the qualifications, one level open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        /* TWO LEVELS OF ONE SUBJECT AND A DEGREE, through `USER.profile`, which is what the column is
           drawn from. The two Maths records must be ONE subject with two levels under it. Written
           out in each state rather than shared, because a state is sent to the page as source. */
        window.STATE_QUAL_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, {
          qual_1: 'Maths', qual_1_level: 'GCSE', qual_1_grade: '8', qual_1_board: 'Hill Top School', qual_1_received: '2017',
          qual_1_teach: 'TRUE', qual_1_spec: 'TRUE',
          qual_2: 'Maths', qual_2_level: 'A-Level', qual_2_grade: 'B', qual_2_board: 'Hill Top Sixth Form', qual_2_received: '2019',
          qual_2_teach: 'TRUE',
          qual_3: 'Bible and Theology', qual_3_level: 'Degree', qual_3_received: 'Present' });
        /* A CLEAN COLUMN FIRST — see the agreement state above. */
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const pages = [...document.querySelectorAll('#s-settings .page')];
        const at = pages.findIndex(pg => pg.querySelector('[data-me="qual_10_board"]'));
        if (at < 0) throw new Error('no qualifications page on the settings column');
        goPage('settings', at, true);
        /* AND THE A-LEVEL OPENED THROUGH ITS OWN `Edit`. */
        const slot = [...pages[at].querySelectorAll('.q-slot')].find(sl =>
          (sl.querySelector('[data-me$="_level"]') || {}).value === 'A-Level');
        if (!slot) throw new Error('no A-Level row on the qualifications page');
        slot.querySelector('[data-do="qual-edit"]').click();
      },
      leave: () => {
        USER.profile = window.STATE_QUAL_WAS; delete window.STATE_QUAL_WAS;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
      },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        const shelf = pg && pg.querySelector('.q-shelf');
        if (!shelf) return 0;
        const open = [...shelf.querySelectorAll('.is-editing')];
        const ed = open[0] && open[0].querySelector(':scope > .q-ed');
        const visible = el => !!(el.offsetWidth || el.offsetHeight);
        return shelf.classList.contains('is-editing') && open.length === 1 && !!ed
          && ed.querySelectorAll('[data-do="qual-teach"]').length === 3
          && (ed.querySelector('[data-do="qual-teach"][aria-pressed="true"]') || {}).dataset.v === 'teach'
          && [...ed.querySelectorAll('label.field')].every(l => !!(l.querySelector(':scope > span') || {}).textContent)
          && [...ed.querySelectorAll('select[data-me$="_received"] option')].some(o => o.textContent === 'Still studying' && o.value === 'Present')
          && [...shelf.querySelectorAll('[data-do="qual-edit"], [data-do="qual-subj-edit"], [data-do^="qual-add"]')].every(b => !visible(b))
          ? 1 : 0;
      },
      wants: 'one editor open in place of the A-Level row, its captions above the boxes, Can teach lit, and every other Edit off the page' },

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

    /* ---------- YOUR HANDLE: SHOWN, WITH RANDOMISE, AND NO BOX ---------------------------------------
       ASKED FOR AS *"handles should be their name and a virtuous describing word. they can randomise
       it but it will follow that general name."* The Signing in card had a text box for the handle;
       a box left behind beside the Randomise button would be a door to an action the server no longer
       has (`changeHandle` is gone), and it would measure perfectly.

       FOUR THINGS TOGETHER, because each on its own passes a card that got one of the others wrong:
       exactly one shown handle and it is `USER.handle`, exactly one `@` in front of it (the `@@ada`
       fault `check-handles.js` already guards in the fixture), one Randomise TILE, and nothing to
       type into. Found by asking the DOM, like every other state on this column. */
    { name: 'your handle',
      only: () => typeof USER !== 'undefined' && !!USER && !!USER.handle,
      enter: () => {
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('.handle-shown'));
        if (at < 0) throw new Error('no handle on the settings column');
        goPage('settings', at, true);
      },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        if (!pg) return 0;
        const shown = pg.querySelectorAll('.handle-shown');
        const line = pg.querySelector('.handle-now');
        return (shown.length === 1 && shown[0].textContent === USER.handle
                && line && (line.textContent.match(/@/g) || []).length === 1
                && pg.querySelectorAll('[data-do="handle-shuffle"]').length === 1
                /* A TILE, NOT A BUTTON — *"a THING has tiles; a FORM has buttons"*, and the handle is a
                   thing. It was `.btn quiet` until 2 October; one inside a `.tile-row` with its mark
                   is what `tile_` draws, so this fails if anybody writes the button back by hand. */
                && pg.querySelectorAll('.tile-row > .tile[data-do="handle-shuffle"] svg.tile-i-shuffle').length === 1
                && !pg.querySelector('.btn[data-do="handle-shuffle"]')
                && !pg.querySelector('#handle-new, [data-do="handle-save"]')) ? 1 : 0;
      },
      wants: 'the handle shown once with one @, a Randomise tile with its mark, and no box to type a handle into' },

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
    { name: 'a several-of-a-list field open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const pages = [...document.querySelectorAll('#s-settings .page')];
        /* ANY SEVERAL-OF-A-LIST FIELD. It was `extra_quals`, which is gone — a PGCE or a DBS is an
           ordinary qualification entry now — so this opens whichever one the column carries (a
           tutor's venues, on Contact & address). */
        const q = '[data-do="me-many"]';
        const at = pages.findIndex(pg => pg.querySelector(q));
        if (at < 0) throw new Error('no several-of-a-list field on the settings column');
        goPage('settings', at, true);
        pages[at].querySelector(q).click();
      },
      leave: () => { if (typeof meDropShut_ === 'function') meDropShut_(); },
      expect: () => {
        const el = document.getElementById('drop');
        return !!el && !el.classList.contains('hidden')
          && el.querySelectorAll('[data-do="me-many-pick"]').length > 0;
      },
      wants: 'a several-of-a-list field open under its button, with something to tick' },

    /* ---------- AN ORDINARY SELECT, OPEN ------------------------------------------------------------
       EVERY SINGLE-CHOICE `<select>` HANGS `#drop` NOW — see `SEL_OK` in book.js — and the settings
       column is where most of them are. Opened through the select's own door, a click AT it, which is
       the path `selAt_` takes for assistive technology; shut on the way out for the reason above. */
    { name: 'a dropdown open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const pages = [...document.querySelectorAll('#s-settings > .page')];
        const at = pages.findIndex(pg => pg.querySelector('label.field > select:not(:disabled)'));
        if (at < 0) throw new Error('no select in a label on the settings column');
        goPage('settings', at, true);
        pages[at].querySelector('label.field > select:not(:disabled)').click();
      },
      leave: () => { if (typeof selShut_ === 'function') selShut_(); },
      expect: () => {
        const el = document.getElementById('drop');
        return !!el && !el.classList.contains('hidden') && el.dataset.owner === 'sel'
          && el.querySelectorAll('[data-do="sel-pick"]').length >= 2
          && el.querySelectorAll('[data-do="sel-pick"][aria-selected="true"]').length === 1;
      },
      wants: 'a settings select\'s options hanging off it in the booking list\'s panel, one marked' },

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
    /* ---------- THINGS KEPT, DRAWN AS FIND DRAWS THEM ------------------------------------------
       THE STATE ABOVE KEEPS WIDGETS, and a kept practical, boxer or pencil had never been drawn
       here. Each was wrapped in `.card.is-widget` — a widget's own framed body — inside the pane,
       which draws that frame already: a card in a box in a box, 14px narrower each side than the
       same card on Find. Seeded through `toggleFav`, the app's own writer, one of each kind that is
       drawn differently; `leave` takes them back off. */
    { name: 'things kept, drawn as Find draws them',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const all = stuffItemsAll_();
        window.__keptKeys = ['practical', 'boxer', 'shop']
          .map(k => all.find(x => x.kind === k && x.key && !(x.row && x.row.excluded)))
          .filter(Boolean).map(x => x.key);
        window.__keptKeys.forEach(k => { if (!isFav(k)) toggleFav(k); });
        paint('saved');
      },
      expect: () => (window.__keptKeys || []).length === 3
                 && document.querySelectorAll('#s-saved .favwrap').length >= 3
                 && !!document.querySelector('#s-saved .favwrap > .card.fc.prac')
                 && !!document.querySelector('#s-saved .favwrap > .card.fc.boxer')
                 && !document.querySelector('#s-saved .card.is-widget .favwrap'),
      wants: 'a kept practical, boxer and shop thing, each drawn straight into its pane with no widget frame round it',
      leave: () => {
        (window.__keptKeys || []).forEach(k => { if (isFav(k)) toggleFav(k); });
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

  /* ---------- THE SHOP ------------------------------------------------------------------------
     THE UNNAMED STATE IS PAGE 0, the basket, empty — which is what every visitor lands on. The two
     below are what a fixture with no shop rows could never have drawn: a shelf of shop cards, and a
     basket with something in it. `check/fixture.json` sends ten shop rows now, shaped as `doGet`
     sends them, for exactly this. */
  shop: [
    { name: '' },
    /* THE FIRST SHELF. Found by its heading rather than by a number, because how many widgets sit
       above the things is the roster's business — and asked of the cards that are there, tiles and
       all, since a shelf drawing headings over nothing is the failure that looks finished. */
    { name: 'the first shelf',
      enter: () => {
        const pages = [...document.querySelectorAll('#s-shop .page')];
        const at = pages.findIndex(pg => pg.querySelector('h2') && pg.querySelector('.favwrap'));
        if (at < 0) throw new Error('the shop column has no shelf of things');
        goPage('shop', at, true);
      },
      expect: () => {
        const pg = document.querySelectorAll('#s-shop .page')[PAGE.shop];
        return !!pg && !!pg.querySelector('h2') && pg.querySelectorAll('.favwrap').length >= 1
          && !!pg.querySelector('[data-do="cart-add"]');
      },
      wants: 'a shelf of the shop under its heading, each thing with a trolley' },

    /* ---------- AND THE BASKET, WHICH A FIXTURE CANNOT REACH AT ALL ---------------------------
       `CART` LIVES IN `localStorage`, NOT IN THE PAYLOAD, so no fixture can put anything in it:
       whichever surface the basket has been on, this file has only ever seen it empty. It was a
       page of the booking column, then a tool — asked for as *"i want the cart to be a tool in the
       tool column"* — and is the first page of the Shop column now, so the state moved with it
       again, seeded exactly as before.

       SEEDED THE WAY THE APP FILLS IT. `CART` is what `cartCard_` reads and `cart-add` writes, and
       `initCart()` is the widget's own `start` — which is what `toolsStart_('shop')` calls when the
       column arrives, so this is the state a moment after somebody pressed the trolley on a card in Find.

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
                /* A CHEAT SHEET, as `mat-cart` writes it — one page, its pieces carried — so the
                   laminate strip is measured on a line that is not a paper. */
                { key: 'mat:Maths|GCSE|H|M01,M17,M26', kind: 'print', pages: 1, cost: 0,
                  name: 'Cheat sheet — Maths · GCSE Higher (2 pieces)',
                  parts: ['Ruler down the edge', 'Straight line', 'Quadratics'] },
                { key: 'I001', name: 'Trundle wheel, 1 m circumference', kind: 'shop',
                  cost: 0, money: 120000 },
                { key: 'I026', name: 'Tape measure, 30 m', kind: 'shop', cost: 0, money: 85000 },
                /* AND THE SHOP LINES THE BASKET MOSTLY HOLDS: a pence-priced one-word item (the line
                   that was 72px tall with its ✕ alone on a row) and one bought with credits, so the
                   head's credits line is drawn too. Shaped as `cartPrice_` writes them. */
                { key: 'Pencil', name: 'Pencil', kind: 'shop', cost: 0, money: 0.3 },
                { key: 'Sticker sheet', name: 'Sticker sheet', kind: 'shop', cost: 3, money: 0 }];
        const n = widgetsOf_('shop').findIndex(w => String(w.id) === 'cart');
        if (n < 0) throw new Error('no basket widget on the shop');
        goPage('shop', n, true);
        initCart();
      },
      /* AND A SHOP LINE IS ONE LINE: its ✕ on the name's own line, no strip under it, and the
         leader drawn — the three things "refine basket to look nicer" changed, asked of the page. */
      expect: () => document.querySelector('#s-shop [data-do="cart-send"]')
                    && document.querySelector('#s-shop .cart-box .cart-from')
                    && [...document.querySelectorAll('#s-shop .cart-box .bk-row.is-wide')]
                         .filter(r => /Pencil/.test(r.textContent))
                         .some(r => r.querySelector('.cart-ln [data-do="cart-drop"]') && !r.querySelector('.cart-ctl')
                                    && r.querySelector('.cart-lead').getBoundingClientRect().width > 8),
      wants: 'a basket holding a bundle under its title, a cheat sheet and shop lines, each shop line one line with its ✕ and a leader to its price, and a way to send the order',
      /* PUT BACK, because states run in order down one page and an empty basket is what every
         other state on this column expects to find. */
      leave: () => { CART = []; initCart(); } },
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
    { name: 'the cheat sheet maker, five pieces ticked',
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'mat');
        if (n < 0) throw new Error('no cheat sheet widget in the roster');
        goPage('tools', n, true);
        const sub = document.querySelector('#s-tools #mat-subject');
        const lev = document.querySelector('#s-tools #mat-level');
        if (!sub || !lev) throw new Error('the cheat sheet maker has no subject or level select');
        sub.value = 'Maths'; sub.dispatchEvent(new Event('change', { bubbles: true }));
        lev.value = 'GCSE|H'; lev.dispatchEvent(new Event('change', { bubbles: true }));
        /* FIVE PIECES TICKED BY HAND — there is no Fill button any more (the owner took it off), so
           the pieces go on the way a person puts them on, through the list's own boxes. */
        /* A TOPIC AT A TIME NOW (`MAT_GROUPS`), and no GCSE topic holds five, so the ticks are taken
           across the topics the way a person would make a sheet — and the view is put back on the
           first, Number, which is where the negative number line asserted below lives. */
        const grp = document.querySelector('#s-tools #mat-group');
        if (!grp) throw new Error('the cheat sheet maker has no topic select');
        const topics = [...grp.options].map(o => o.value);
        let ticked = 0;
        for (const g of topics) {
          if (ticked >= 5) break;
          grp.value = g; grp.dispatchEvent(new Event('change', { bubbles: true }));
          const boxes = [...document.querySelectorAll('#s-tools .mat-list label:not(.off):not([data-id="M01"]) input:not(:checked)')]
            .slice(0, 5 - ticked);
          boxes.forEach(b => b.click());
          ticked += boxes.length;
        }
        if (ticked < 5) throw new Error('fewer than five pieces offered for GCSE Higher');
        grp.value = topics[0]; grp.dispatchEvent(new Event('change', { bubbles: true }));
      },
      expect: () => !document.querySelector('#s-tools #mat-fill, #s-tools #mat-clear')
        && document.querySelectorAll('#s-tools .mat-list input:checked').length >= 5
        && !document.querySelector('#s-tools #mat-go').disabled
        /* THE NEGATIVE NUMBER LINE IS ON THE GCSE LIST, and the list is not a scroller — it is the
           whole list, and the pane is what scrolls (see the note over the list in `initMat`). */
        && document.querySelector('#s-tools #mat-list label[data-id="M52"]:not(.off)')
        && !document.querySelector('#s-tools #mat-box .widget-squeeze')
        /* AND ASKED OF THE COMPUTED STYLE, NOT ONLY THE CLASS: a rule giving `.mat-list` its own
           `overflow-y: auto` would put the scroll bar straight back with no `widget-squeeze` anywhere,
           and the class test above would go on passing. Nothing from the list up to its card may
           scroll; the pane above the card is the one scroller, and it is `paneReach_`'s. */
        && (() => {
          const list = document.querySelector('#s-tools #mat-list');
          for (let e = list; e && !e.matches('.card.is-widget'); e = e.parentElement) {
            if (/auto|scroll/.test(getComputedStyle(e).overflowY)) return false;
          }
          return true;
        })(),
      wants: 'a subject and a level chosen, five pieces ticked, no Fill or Clear, the negative number line offered, the list not a scroller, and Print ready',
      leave: () => {
        MAT_ON = []; MAT_SUBJECT = 'Maths'; MAT_LEVEL = 'all'; MAT_TIER = 'H'; MAT_EXAM = 'all';
        MAT_GROUP = ''; if (typeof MAT_KIND !== 'undefined') MAT_KIND = 'cheat';
        try { localStorage.removeItem('matChoice'); } catch (e) {}
        matPaint();
      } },
    /* ---------- AND EVERY VIEW OF IT FITS, WHICH IS WHAT THE OWNER ASKED -------------------------------
       ASKED FOR AS *"the cheat sheet maker shouldnt be as long as it is. you need to think a way to
       make it fit on screen without scrolling"*. It was 1206px in a 532px pane at 320x568 on the view
       it opened on. The answer was a third select, the topic, that cuts the list to eight rows at most
       (`MAT_GROUPS` in mat.js) — and a fit is a property of every view, not of the one a state
       happens to land on, so this walks the lot: every subject the select offers, every level of
       it, every topic of that, set through the selects' own `change` events. After each, the app's
       own `paneReach_` is asked to fit the pane, and the answer must be: nothing scrolls, and the
       card was not drawn smaller than 0.85 to get there. 0.85 rather than `PANE_ZOOM_MIN`'s 0.7,
       because a card that "fits" at 0.7 is the thing the owner was complaining about wearing a
       smaller font.
       AT THE TWO PHONES, 320x568 and 390x844, which are the sizes the complaint is about; a tablet
       and a laptop pass this trivially and are measured for everything else as before.
       `MAT_FIT_MISS` NAMES THE FIRST VIEW THAT FAILED, because `expect` can only say yes or no and
       "some view did not fit" is a sentence nobody can act on. Read it in the page, or run
       `node check/ui.js --screen=tools` with a console.log of it. */
    { name: 'the cheat sheet maker, every subject, level and topic',
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'mat');
        if (n < 0) throw new Error('no cheat sheet widget in the roster');
        goPage('tools', n, true);
        if (!document.querySelector('#s-tools #mat-group')) throw new Error('the cheat sheet maker has no topic select');
      },
      expect: () => {
        const phone = (innerWidth === 320 && innerHeight === 568) || (innerWidth === 390 && innerHeight === 844);
        /* NOT WALKED AT ALL AWAY FROM THE PHONES. Each view is a full `matPaint`, which lays out the
           A4 sheet off screen to measure the gauge — two hundred of them per visitor per size, and
           with all four sizes walked `check/ui.js` ran past `check-all`'s ten-minute limit. */
        if (!phone) return !!document.querySelector('#s-tools #mat-group');
        const sub = document.querySelector('#s-tools #mat-subject');
        const lev = document.querySelector('#s-tools #mat-level');
        const box = document.querySelector('#s-tools #mat-box');
        const pane = box && box.closest('.pane');
        if (!sub || !lev || !pane) return false;
        const fire = (el, v) => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); };
        let miss = '', views = 0;
        for (const s of [...sub.options].map(o => o.value)) {
          fire(sub, s);
          for (const l of [...lev.options].map(o => o.value)) {
            fire(lev, l);
            const grp = document.querySelector('#s-tools #mat-group');
            const gs = grp && !grp.closest('[hidden]') ? [...grp.options].map(o => o.value) : [''];
            for (const g of gs) {
              if (g) fire(grp, g);
              views++;
              if (miss) continue;
              paneReach_([pane]);
              const zoom = Math.min(...[...pane.children].map(k => Number(k.style.zoom || 1)));
              const rows = document.querySelectorAll('#s-tools .mat-list label:not(.off)').length;
              if (pane.scrollHeight - pane.clientHeight > 2 || zoom < 0.85 || rows > 8) {
                miss = `${s} · ${l} · ${g || '(one topic)'}: ${rows} rows, ${pane.scrollHeight}px in `
                     + `${pane.clientHeight}px at zoom ${zoom}`;
              }
            }
          }
        }
        window.MAT_FIT_MISS = miss;
        /* MORE THAN A HANDFUL OF VIEWS, or the walk did not walk — a select that lost its options
           would pass this with one view measured. */
        return !miss && views > 50;
      },
      wants: 'every subject × level × topic of the cheat sheet maker fitting its pane at 320x568 and 390x844 with no scroll and no zoom below 0.85 (window.MAT_FIT_MISS names the first that did not)',
      leave: () => {
        MAT_ON = []; MAT_SUBJECT = 'Maths'; MAT_LEVEL = 'all'; MAT_TIER = 'H'; MAT_EXAM = 'all';
        MAT_GROUP = ''; if (typeof MAT_KIND !== 'undefined') MAT_KIND = 'cheat';
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
      /* SEVENTY: seven days of `AVAIL_HOURS`, nine to six — it was seventy-seven while that span
         ran to seven o'clock, an hour the booking grid never offered. */
      expect: () => document.querySelectorAll('#s-tools #avail-box .hr').length >= 70,
      wants: 'the week of hours drawn on screen' },

    /* ---------- A TIMETABLE WITH A WEEK IN IT ------------------------------------------------------
       KEPT ON THE DEVICE, so no fixture can fill it — the basket's sentence. Seeded through the app's
       own key (`tmtKey_`) with the weekend on, so all seven chips are measured going four and three,
       and with one lesson OPEN, so the editor's time box and subject box are measured side by side
       at 320 rather than only the summary lines. One subject and one note deliberately long, because
       the longest thing a row ever holds is something somebody typed. */
    { name: 'a timetable',
      enter: () => {
        const day = [
          { id: 'T1', at: '09:00', subject: 'Maths', note: 'Room 4 — Mr Patel' },
          { id: 'T2', at: '10:00', subject: 'English Literature and Language combined', note: '' },
          { id: 'T3', at: '11:15', subject: 'Chemistry', note: 'Bring the revision guide and a calculator, practical write-up due' },
          { id: 'T4', at: '13:30', subject: 'History', note: '' }];
        const week = { weekend: true,
          days: [day, [{ id: 'T5', at: '09:00', subject: 'Maths', note: '' }], [], [], [], [], []] };
        /* ON THE ACCOUNT WHEN SIGNED IN, on the device when not — the two homes `tmtRead_` has. */
        if (typeof USER !== 'undefined' && USER) USER.timetable = JSON.stringify(week);
        else localStorage.setItem(tmtKey_(), JSON.stringify(week));
        TMT_DAY = 0; TMT_OPEN = 'T3';
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'timetable');
        if (n < 0) throw new Error('no timetable widget in the roster');
        goPage('tools', n, true);
        initTimetable();
      },
      expect: () => document.querySelectorAll('#s-tools .tmt-box .tmt-day').length === 7
                    && document.querySelectorAll('#s-tools .tmt-box .tmt-row:not(.is-booked)').length === 3
                    && document.querySelector('#s-tools .tmt-box .tmt-ed .tmt-time'),
      wants: 'seven day chips, three lessons as lines and one open with its time box',
      leave: () => {
        localStorage.removeItem(tmtKey_());
        if (typeof USER !== 'undefined' && USER) delete USER.timetable;
        TMT_DAY = -1; TMT_OPEN = '';
        initTimetable();
      } },

    /* ---------- THE TIMETABLE WITH YOUR BOOKED SESSIONS LOCKED IN IT ------------------------------
       `Your week` is folded into the Timetable, so the one week view now holds two kinds of row: what
       somebody wrote, and a session booked here (`.tmt-row.is-booked`, green, a second line of hours
       and place). Seeded through the payload — `myJobs_` reads `DATA.liveJobs` — with a session on
       Monday and Saturday and no dates (a request not yet in the diary is on every week its days come
       round), between lessons at nine, three and six, so the booked row is measured among the others
       and the Saturday shows all seven chips with the weekend box unticked. Signed in only: a visitor
       has no sessions. */
    { name: 'a timetable with your sessions in it',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.__TMT_JOBS = { live: DATA.liveJobs, jobs: DATA.jobs };
        const mine = { id: 'J-TMT', jobId: 'J-TMT', subject: 'GCSE Physics, triple award', location: 'Colliers Wood Library',
          day: 'Monday, Saturday', time: '16:00', hours: 2, client: USER.name, tutor: 'Ada Tutor',
          status: 'active', dates: '', slots: [{ n: 1, client: USER.name, status: 'Booked' }] };
        DATA.liveJobs = DATA.jobs = [mine];
        USER.timetable = JSON.stringify({ weekend: false, days: [[
          { id: 'S1', at: '09:00', subject: 'Maths', note: 'Room 4' },
          { id: 'S2', at: '15:00', subject: 'English', note: '' },
          { id: 'S3', at: '18:00', subject: 'Swimming', note: 'Leisure centre' }], [], [], [], [], [], []] });
        TMT_DAY = 0; TMT_OPEN = '';
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'timetable');
        if (n < 0) throw new Error('no timetable widget in the roster');
        goPage('tools', n, true);
        initTimetable();
      },
      expect: () => document.querySelectorAll('#s-tools .tmt-box .tmt-day').length === 7
                    && document.querySelectorAll('#s-tools .tmt-box .tmt-row.is-booked[data-do="job"]').length === 1
                    && document.querySelectorAll('#s-tools .tmt-box .tmt-row:not(.is-booked)').length === 3,
      wants: 'seven chips, the booked session locked between three lessons',
      leave: () => {
        const was = window.__TMT_JOBS || {};
        DATA.liveJobs = was.live; DATA.jobs = was.jobs;
        delete USER.timetable;
        TMT_DAY = -1; TMT_OPEN = '';
        initTimetable();
      } },
    /* ---------- A CALENDAR WITH EVERY KIND OF DATE ON IT ----------------------------------------
       The calendar learned six kinds of date — sessions, terms, half terms, bank holidays, closed
       days, events — and a key under the month. The fixture holds none of them in THIS month (it
       has no exams, and the bank holidays it carries are whatever month they fall in), so they are
       seeded through the payload for the month on screen, several on one day so the dots are
       measured crowded, and put back on the way out. Signed in, because sessions are somebody's. */
    { name: 'a calendar with every kind of date',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const now = new Date(), y = now.getFullYear(), m = now.getMonth();
        const on = n => String(n).padStart(2, '0') + '/' + String(m + 1).padStart(2, '0') + '/' + y;
        window.__CAL_HELD = { live: DATA.liveJobs, jobs: DATA.jobs, intervals: DATA.intervals,
          closures: DATA.closures, festive: DATA.festive, exams: DATA.exams };
        DATA.liveJobs = DATA.jobs = [{ id: 'J-CAL', jobId: 'J-CAL', subject: 'Maths', time: '16:00', day: 'Monday',
          client: USER.name, tutor: 'Ada Tutor', status: 'active', dates: [on(6), on(13), on(20)].join(', '),
          location: 'Colliers Wood Library', slots: [] }];
        DATA.intervals = [{ term: 'Autumn 2', label: 'Autumn 2', kind: 'term', startDate: on(2), endDate: '19/12/' + (y + 1) },
          { term: 'Half Term', label: 'Half Term', kind: 'half-term', startDate: on(26), endDate: on(28) }];
        DATA.closures = [{ date: on(13), name: 'Staff training', kind: 'inset' }, { date: on(9), name: 'Bank holiday', kind: 'bank' }];
        DATA.festive = [{ id: 'H1', name: 'Pumpkin carving', venue: 'Colliers Wood Library', date: on(13) }];
        DATA.exams = [{ personId: USER.personId, who: USER.name, label: 'Small exam', date: on(13), kind: 'mock' },
          { personId: USER.personId, who: USER.name, subject: 'Maths', label: 'Paper 1', date: on(15), kind: 'exam' }];
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'calendar');
        if (n < 0) throw new Error('no calendar widget in the roster');
        goPage('tools', n, true);
        initCalendar();
      },
      expect: () => document.querySelectorAll('#s-tools .cal-key-box .cal-key span').length === 8
                    && document.querySelector('#s-tools .cal-d .dot.session')
                    && document.querySelector('#s-tools .cal-d .dot.halfterm'),
      wants: 'a month with all eight kinds of dot and an eight-entry key under it',
      leave: () => {
        const h = window.__CAL_HELD || {};
        DATA.liveJobs = h.live; DATA.jobs = h.jobs; DATA.intervals = h.intervals;
        DATA.closures = h.closures; DATA.festive = h.festive; DATA.exams = h.exams;
        initCalendar();
      } },

    /* ---------- TOUCH TYPING, HALF WAY ALONG A LINE WITH A KEY WRONG ----------------------------
       KEPT ON THE DEVICE, so no fixture can climb the ladder — seeded through the app's own key with
       three rungs open and the third chosen, so the rungs are measured on, open and shut together.
       The line is SET rather than drawn at random, half typed and with a wrong key held, so the
       measured card carries every class it can: letters done, the lit letter in its miss colour, the
       wrong key red on the keyboard, a capital's shift lit, a score under the line. And the hidden
       box FOCUSED, through the app's own handler, because the card draws differently when it is
       listening and that is the state somebody is looking at it in. */
    { name: 'touch typing',
      enter: () => {
        localStorage.setItem(ktKey_(), JSON.stringify({ at: 3, open: 3, held: [3, 3, 3, 1, 0], best: 41, lines: 10 }));
        KT = null;
        const s = ktNow_();
        s.line = 'Quiet zebras jump over the Lazy fox at London';
        s.pos = 27; s.right = 27; s.wrong = 2; s.miss = 'k'; s.t0 = Date.now() - 6000; s.t1 = Date.now();
        s.said = 'Last line: 38 wpm, 95% right.';
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'typing');
        if (n < 0) throw new Error('no typing widget in the roster');
        goPage('tools', n, true);
        initTyping();
        const line = document.querySelector('#s-tools .kt-box .kt-line');
        if (line) ACTIONS['kt-focus'](line);
      },
      expect: () => document.querySelectorAll('#s-tools .kt-box .kt-rung').length === 5
                    && document.querySelectorAll('#s-tools .kt-box .kt-rung:disabled').length === 1
                    && document.querySelectorAll('#s-tools .kt-box .kt-k').length === 34
                    && document.querySelector('#s-tools .kt-box .kt-k.next')
                    && document.querySelector('#s-tools .kt-box .kt-k.miss'),
      wants: 'five rungs with the last shut, a 34-key keyboard with the next key lit and a wrong one red',
      leave: () => {
        localStorage.removeItem(ktKey_());
        KT = null;
        document.activeElement && document.activeElement.blur && document.activeElement.blur();
        initTyping();
      } },
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

    /* ---------- THE FOUR CLASSROOM GAMES, EACH ON ITS BUSIEST CARD ----------------------------
       ALL FOUR ARE INSIDE THE WORD GAMES WIDGET NOW and are reached through its dropdown.
       EVERY ONE OPENS ON A SINGLE BUTTON, which is the only state `go()` reaches — so everything
       these games are (a clock, Taboo's forbidden words, 20 Questions' count) is past it and
       nothing would measure it without a state. Entered through the app's own handlers, and then
       given the LONGEST entry its deck holds: a round is dealt at random, so a state that measured
       whatever came up would measure a different card every run, and the one worth measuring is
       the one that wraps. */
    { name: 'just a minute, mid-round',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        /* ONE OF THE WORD GAMES, chosen through the widget's own dropdown. */
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'jam'; ACTIONS['wg-pick'](sel); }
        ACTIONS['jam-start'](document.createElement('button'));
        PARTY.jam.topic = JAM_DECK.reduce((a, b) => (b.length > a.length ? b : a), '');
        jamPaint();
      },
      expect: () => document.querySelectorAll('#s-games #jam-acts .party-call').length === 3
                 && !!document.querySelector('#s-games #jam-card .party-clock'),
      wants: 'the topic, the clock and the three tallies',
      leave: () => { partyHold_('jam'); PARTY.jam = null; jamPaint(); } },

    { name: 'a taboo card',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        /* ONE OF THE WORD GAMES, chosen through the widget's own dropdown. */
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'tab'; ACTIONS['wg-pick'](sel); }
        ACTIONS['tab-start'](document.createElement('button'));
        PARTY.tab.card = TABOO_DECK.reduce((a, b) => (b.join('').length > a.join('').length ? b : a));
        tabPaint();
      },
      expect: () => {
        const n = document.querySelectorAll('#s-games #tab-card .tab-ban li').length;
        return n >= 4 && n <= 5;
      },
      wants: 'the word and four or five words you may not say',
      leave: () => { partyHold_('tab'); PARTY.tab = null; tabPaint(); } },

    { name: 'the hot seat word, held up to the class',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        /* ONE OF THE WORD GAMES, chosen through the widget's own dropdown. */
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'hot'; ACTIONS['wg-pick'](sel); }
        ACTIONS['hot-start'](document.createElement('button'));
        const b = document.createElement('button');
        b.setAttribute('data-g', 'hot');
        ACTIONS['party-resume'](b);
        PARTY.hot.word = HOT_DECK.reduce((a, c) => (c.length > a.length ? c : a), '');
        hotPaint();
      },
      expect: () => !!document.querySelector('#s-games #hot-card .hot-word'),
      wants: 'the word in large type, with Got it and Pass',
      leave: () => { partyHold_('hot'); PARTY.hot = null; hotPaint(); } },

    { name: '20 questions, being asked',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        /* ONE OF THE WORD GAMES, chosen through the widget's own dropdown. */
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'twq'; ACTIONS['wg-pick'](sel); }
        ['twq-start', 'twq-show', 'twq-hide', 'twq-ask', 'twq-ask', 'twq-ask']
          .forEach(a => ACTIONS[a](document.createElement('button')));
      },
      expect: () => document.querySelectorAll('#s-games #twq-acts [data-do="twq-ask"]').length === 2
                 && !document.querySelector('#s-games #twq-card .art-word'),
      wants: 'the count, Yes and No, and no secret on the screen',
      leave: () => { PARTY.twq = null; twqPaint(); } },

    /* `an alibi case card` AND `an alibi interview` WERE HERE, and went with the game ("delete alibi
       game.") — a state that enters a widget nobody can open fails loudly, which is right, and a
       state measuring nothing has no business being kept to say so. */
    /* ---------- A WORD SEARCH PART-FOUND, AND A SENTENCE PART-BUILT ------------------------------
       Both widgets OPEN on a fresh deal, which is the one state `go()` reaches — and a fresh deal is
       the state with nothing struck through, nothing highlighted, no start ring and an empty strip.
       Every mark either game puts on its card is past it. Seeded through the games' own functions
       (`wsBuild_`, `wsPick_`, `ssDeal_`) and their own handlers, never a board written out here: a
       grid in this file would be a second description of a puzzle, and the one nobody re-reads.
       THE OLDER THEME, because it is the ten-by-ten grid — the tallest card either game draws, and
       the one a 320px phone has least room for. */
    { name: 'a word search part-found',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'wordsearch');
        if (n < 0) throw new Error('no word search widget in the roster');
        goPage('games', n, true);
        window.__seedWs = WS;
        WS = wsBuild_(WS_THEMES.find(t => !t.young));
        const wd = WS.words[0];
        wsPick_(wd.cells[0]);
        wsPick_(wd.cells[wd.cells.length - 1]);
        wsPick_(WS.words[1].cells[0]);
        wsPaint();
      },
      expect: () => document.querySelectorAll('#s-games #ws-words li.got s').length === 1
                 && document.querySelectorAll('#s-games .ws-c.got').length >= 3
                 && document.querySelectorAll('#s-games .ws-c.sel').length === 1,
      wants: 'one word struck through and highlighted, and the start of the next one ringed',
      /* PUT BACK, OR DEALT AGAIN WHERE THERE WAS NOTHING TO PUT BACK: `wsPaint` with no puzzle draws
         nothing, so restoring a null would leave this state's marks on the card for the next one. */
      leave: () => { WS = window.__seedWs || null; if (!WS) wsDeal_(wsThemeId_()); wsPaint(); } },

    /* THE LONGEST SENTENCE IN THE LIST, half built — fourteen chips is the most this card ever lays
       out, and half of them dimmed is what a sentence in progress looks like. */
    { name: 'a sentence part-built',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'scramble');
        if (n < 0) throw new Error('no sentence scramble widget in the roster');
        goPage('games', n, true);
        window.__seedSs = SS;
        let long = null;
        Object.keys(SS_SENTENCES).forEach(b => SS_SENTENCES[b].forEach(e => {
          if (!long || ssOrders_(e)[0].length > ssOrders_(long)[0].length) long = e;
        }));
        const words = ssOrders_(long)[0];
        SS = { band: 'KS4', entry: long, chips: words.slice().reverse(), picked: [], verdict: '', said: '' };
        for (let k = 0; k < Math.ceil(words.length / 2); k++) SS.picked.push(words.length - 1 - k);
        ssPaint();
      },
      expect: () => document.querySelectorAll('#s-games .ss-chip.used').length >= 6
                 && !!document.querySelector('#s-games [data-do="ss-check"][disabled]'),
      wants: 'the longest sentence half built, its used chips dimmed and Check not yet pressable',
      leave: () => { SS = window.__seedSs || null; if (!SS) ssDeal_(ssBand_()); ssPaint(); } },

    /* ---------- A CONNECT 4 GAME, WON --------------------------------------------------------------
       THE WIDGET OPENS ON AN EMPTY BOARD, which is the one state `go()` reaches — and an empty board
       has no counter, no falling counter and no ring, so nothing "refine connect 4 add dropping
       animation of counters" added would ever be measured or pressed. Played through the board's
       own handler, Red down the first column, so the four that won are ringed, the line under the
       board carries its disc, and the last counter is the one that fell.

       AND THE EXPECTATION ASKS THE BROWSER WHAT ONLY A BROWSER KNOWS: that the counter marked to
       fall really has the `c4-drop` animation on its `::after`. `check-flow.js` can ask which
       square is marked; it cannot ask whether the stylesheet still does anything with the mark. */
    { name: 'a connect 4 game, won',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'connect4');
        if (n < 0) throw new Error('no connect 4 widget in the roster');
        goPage('games', n, true);
        initConnect4();
        [0, 1, 0, 1, 0, 1, 0].forEach(x => {
          const b = document.createElement('button');
          b.setAttribute('data-x', String(x));
          ACTIONS['c4-drop'](b);
        });
      },
      expect: () => {
        const fell = document.querySelector('#s-games .c4-cell.c4-new');
        return document.querySelectorAll('#s-games .c4-cell.c4-win').length === 4
          && !!document.querySelector('#s-games #c4-said .c4-turn.p1')
          && !!fell && getComputedStyle(fell, '::after').animationName === 'c4-drop';
      },
      wants: 'four counters ringed, a red disc beside Red wins, and the last counter under the drop',
      leave: () => { initConnect4(); } },

    /* ---------- THE VIDEOS CARD, SEARCHED AND PLAYING ---------------------------------------------
       THE WIDGET OPENS ON A BOX AND A LIST, which is the one state `go()` reaches — the player, the
       Full screen tile and a narrowed count only exist after somebody types and taps. Seeded through
       the card's own list (`VIDEOS_LIST`, what `data/videos.json` would have filled) with the
       LONGEST title a row is likely to carry, because a title is the one thing on this card that
       can take it sideways at 320. The video is the repository's own reel, so the lab plays a real
       file and never reaches for YouTube. */
    { name: 'a video search, narrowed, one playing',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        window.__seedVid = VIDEOS_LIST;
        VIDEOS_LIST = [
          { title: 'Photosynthesis explained: how a leaf turns light, water and carbon dioxide into sugar',
            url: 'data/reels/archetest.mp4', kind: 'clip', tags: 'science biology plants', age: '9+', active: true },
          { title: 'Photosynthesis, the short one', url: 'data/reels/archetest.mp4?b', kind: 'clip',
            tags: 'science', age: '', active: true },
          { title: 'Fractions in two minutes', url: 'data/reels/archetest.mp4?c', kind: 'clip',
            tags: 'maths', age: '', active: true },
        ];
        VID.q = 'photo';
        VID.at = 'v0';
        /* PAINTED, THEN TURNED TO. The card shrinks from the whole list to two rows here, and a
           page that changes height while the pager is still settling on it was measured mid-slide
           once, 70px off the screen. */
        vidPaint_();
        goPage('games', n, true);
      },
      expect: () => !!document.querySelector('#s-games .vid-stage.on video.vid-player')
                 && !!document.querySelector('#s-games .vid-acts .tile[data-do="vid-full"]:not([disabled])')
                 && document.querySelectorAll('#s-games .vid-list .vid-row').length === 2
                 && /^2 of \d+ videos$/.test((document.querySelector('#s-games .vid-said') || {}).textContent || ''),
      wants: 'the player holding the chosen clip, a Full screen tile under it, and two of the list left',
      leave: () => { VIDEOS_LIST = window.__seedVid || null; VID.q = ''; VID.at = ''; vidPaint_(); } },
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

    /* ---------- AND A SINGLE ANSWER, OPEN, IN THE SAME PANEL ---------------------------------------
       *"should be consistent with the booking multiselect drop down list"* — so the one-of-a-list
       rows on this card hang the same `#drop` the state above opens. Through the select's own door,
       and shut again on the way out. */
    { name: 'a single answer open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const sel = document.querySelector('#bookr select.bk-sel:not(:disabled)');
        if (!sel) throw new Error('the booking form draws no enabled select');
        sel.click();
      },
      expect: () => {
        const el = document.getElementById('drop');
        return !!el && !el.classList.contains('hidden') && el.dataset.owner === 'sel'
          && el.querySelectorAll('#drop .pick-opt[data-do="sel-pick"]').length >= 2;
      },
      wants: 'a single-answer row\'s options hanging off it, the multi-select list\'s rows',
      leave: () => { if (typeof selShut_ === 'function') selShut_(); } },

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
          /* `adminKeeps`, BECAUSE THE LAB SIGNS IN AS AN ADMIN and an admin is sent all three
             figures — so this card draws `Client pays`, `Tutor earns` and `Admin earns` as three
             total rows, which is the tallest the total block gets and the one worth measuring. */
          price: '270', tutorPay: '135', adminKeeps: '81', stage: 'accepted', status: 'accepted',
        }];
        paint('booking');
        /* PAGE BY POSITION IS WRONG HERE and `jobPageAt_` is the app's own answer: it reads the
           same ordered list the pages are built from, so this cannot land on the form because
           something moved. */
        goPage('booking', typeof jobPageAt_ === 'function' ? jobPageAt_('J-UI') : 1, true);
      },
      /* AND THE ADMIN'S THREE FIGURES ARE ROWS OF IT, AND ITS TILES ARE ON IT. *"no floating tiles
         for already booked sessions"* — every action on the session's page is inside the paper, and
         a session already booked offers no Pay. Asked of the one page in front, since the column
         also holds the form — found by its own reference rather than by `.page.on`. */
      expect: () => {
        const pg = [...document.querySelectorAll('#s-booking .page')]
          .find(p => /J-UI/.test((p.querySelector('.rc-ref') || {}).textContent || ''));
        const rc = pg && pg.querySelector('.rc');
        if (!rc || !rc.querySelectorAll('.bk-row').length) return false;
        if (rc.querySelectorAll('.rc-total').length !== 3) return false;
        if (!rc.querySelector('.rc-tiles [data-do="job-delete"]')) return false;
        if (pg.querySelector('[data-do="job-pay"]')) return false;
        return ![...pg.querySelectorAll('[data-do]')].some(x => !x.closest('.rc'));
      },
      wants: 'a receipt with rows on it, an admin\'s three money rows, and its tiles on the paper' },

    /* ---------- THE PICTURE OF IT, IN A SHEET -------------------------------------------------------
       *"make sure sharing booking is an identical … png … of the booking reciept."* Sharing makes a
       PNG of the receipt and hands it to the phone's share sheet; where there is none, or Safari
       refuses one this late after the press, the picture is offered in a sheet instead — the one
       surface that path draws, and the only place in the app a whole receipt is shown as an image at
       the sheet's width. Measured like every other sheet: does it fit, can its button be hit.

       ENTERED THROUGH `rcOffer_`, which is what the share path calls when it cannot share, with a
       picture the shape of a receipt (a phone card at 2x) made SYNCHRONOUSLY. The first version made
       the real one with `rcPng_` and was not measured at 320 on a loaded machine: a picture is
       asynchronous, `enter` is not awaited, and the sheet was not open yet when it was looked at.
       What the picture holds is `check/share.js`'s question; this one is the sheet around it. */
    { name: 'a picture of the receipt, offered in a sheet',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const c = document.createElement('canvas');
        c.width = 520; c.height = 1220;
        const g = c.getContext('2d');
        g.fillStyle = '#0b0b0b'; g.fillRect(0, 0, c.width, c.height);
        const bin = atob(c.toDataURL('image/png').split(',')[1]);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        rcOffer_(new Blob([bytes], { type: 'image/png' }), 'family-booking.png');
      },
      expect: () => !!document.querySelector('#sheet:not(.hidden) img.rc-shot'),
      wants: 'the receipt as a picture in a sheet, with a way to save it',
      leave: () => { if (typeof closeSheet === 'function') closeSheet(); } },
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

    /* ---------- AND THE STATES THE CHAT POLISH WAS ABOUT ------------------------------------------
       *"also refine the chat widgetts. looks fine but refine please."* Every fault that pass found
       was in a state this file had never drawn: the composer with something in it, a refusal, and a
       thread long enough to need all of the pane. Each is declared here so the widths it was fixed
       at are measured at every run, not once by hand.

       A LONG THREAD, AND THE COMPOSER STILL ON THE GLASS. The thread used to stop at 22rem; it now
       takes the pane's own cap less what the head and the composer need, and the pane is `overflow:
       hidden` — so a wrong sum would put the box you reply in under the bottom edge, where nothing
       but a screenshot would see it. `expect` asks the geometry directly: the composer's foot is
       inside the pane, and the thread is taller than the 22rem it used to be held to.

       AND THE CARD IS NOT ZOOMED. A sum that comes out too tall does not clip the composer — it
       is caught first by `paneReach_` in find.js, which draws a card taller than its pane SMALLER,
       so the composer stays on the glass at 85% and every 44px target in it becomes 37px. Proved
       by mutation: with the cap 6rem too generous the first version of this `expect` passed and the
       only trace was a "known" card-drawn-smaller line. So it asks the card's own `zoom` as well. */
    { name: 'a long thread',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        MESSAGES = Array.from({ length: 24 }, (_, i) => ({
          id: 'L' + i, mine: i % 3 === 1, read: true, withId: 'P009', withName: 'Ada Tutor',
          fromName: i % 3 === 1 ? 'You' : 'Ada Tutor', at: '2026-09-' + (10 + (i >> 3)) + ' 1' + (i % 10) + ':0' + (i % 6),
          body: i % 5 === 0 ? 'A longer one, the length of a question about Tuesday and what to bring to it.' : 'Short.' }));
        MSG_PENDING = [];
        DM_ASKED = true; DM_DONE = true; MSG_FAILED = false; DM_LAST = Date.now();
        paint('dm');
      },
      expect: () => {
        const form = document.querySelector('#s-dm .msg-form');
        const body = document.querySelector('#s-dm .msg-body');
        const pane = form && form.closest('.pane');
        if (!form || !body || !pane) return false;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const zoomed = [].some.call(pane.children, k => k.style.zoom && k.style.zoom !== '1');
        return !zoomed
            && form.getBoundingClientRect().bottom <= pane.getBoundingClientRect().bottom + 0.5
            && body.getBoundingClientRect().height > 22 * rem;
      },
      wants: 'a thread taller than 22rem, its composer wholly inside the pane, and the card not zoomed to fit' },

    /* A REFUSAL AND A SEND IN FLIGHT, which are the two pending shapes `messagesHtml_` draws. The
       refusal's two controls are the 44px targets this file exists to measure, and its sentence is
       the server's own — the longest is the five-minute one, used here. */
    { name: 'a refused send',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        MESSAGES = [{ id: 'f1', mine: false, read: true, withId: 'P009', withName: 'Ada Tutor',
          fromName: 'Ada Tutor', at: '2026-09-16 09:12', body: 'Can you send the homework?' }];
        MSG_PENDING = [
          { tmp: 'tmpA', mine: true, read: true, state: 'failed', withId: 'P009', withName: 'Ada Tutor',
            err: 'One message every five minutes — 3 to go.', fromName: 'Test Admin',
            body: 'Here it is, sorry for the delay', atMs: Date.now() - 60e3, attachments: [], queue: [] },
          { tmp: 'tmpB', mine: true, read: true, state: 'sending', withId: 'P009', withName: 'Ada Tutor',
            fromName: 'Test Admin', body: 'And the second page', atMs: Date.now(), attachments: [], queue: [] }];
        DM_ASKED = true; DM_DONE = true; MSG_FAILED = false; DM_LAST = Date.now();
        paint('dm');
      },
      expect: () => !!document.querySelector('#s-dm .msg.is-failed .msg-fail-why')
                 && !!document.querySelector('#s-dm [data-do="msg-retry"]')
                 && !!document.querySelector('#s-dm .msg.is-sending'),
      wants: 'a refused bubble with its sentence, Retry and Remove, and one still sending',
      leave: () => { MSG_PENDING = []; } },

    /* THE COMPOSER IN USE: a paragraph typed and two files waiting. The row that wrapped `Send`
       under the `+` at 320px did it with the box EMPTY; with a paragraph in it the box is at its
       tallest, and the tray of chips is the one part of the form that only exists here. `leave`
       empties both, because a queued file counts as typing (`dmTyping_`) and would hold every
       repaint after this one. */
    { name: 'a reply being written',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        MESSAGES = [{ id: 'c1', mine: false, read: true, withId: 'P009', withName: 'Ada Tutor',
          fromName: 'Ada Tutor', at: '2026-09-16 09:12', body: 'Any questions before Tuesday?' }];
        MSG_PENDING = [];
        MSG_QUEUE['P009'] = [
          { name: 'IMG_2041.jpg', type: 'image/png', size: 1000,
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
          { name: 'Worksheet answers, final version.pdf', type: 'application/pdf', size: 1000, url: '#' }];
        DM_ASKED = true; DM_DONE = true; MSG_FAILED = false; DM_LAST = Date.now();
        paint('dm');
        const b = document.querySelector('#s-dm .msg-text');
        if (b) {
          b.value = 'Yes — question 7, the one about the ratio of the two areas. I did not get how '
                  + 'they set it up and I tried it three times.';
          b.dispatchEvent(new Event('input', { bubbles: true }));
        }
      },
      /* ONE ROW: the `+`, the box and `Send` share a top edge's worth of line — `Send` sits beside
         the box rather than under the `+`, which is the wrap this state exists to catch. */
      expect: () => {
        const f = document.querySelector('#s-dm .msg-form');
        const go = f && f.querySelector('.msg-go'), box = f && f.querySelector('.msg-text');
        return !!(f && f.querySelectorAll('.msg-chip').length === 2 && go && box
          && go.getBoundingClientRect().left >= box.getBoundingClientRect().right - 0.5);
      },
      wants: 'two chips waiting, a paragraph in the box and Send beside it rather than under it',
      leave: () => {
        delete MSG_QUEUE['P009'];
        const b = document.querySelector('#s-dm .msg-text');
        if (b) { b.value = ''; b.style.height = ''; }
      } },
  ],
};

const statesOf = id => STATES[id] || [{ name: '' }];

module.exports = { STATES, statesOf };
