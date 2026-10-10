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
      /* THE ONE LOADER NOW, NOT A SENTENCE OF ITS OWN — the owner, 9 Oct: *"They should all have a
         simplistic simple loading thing."* It said "The questions are still coming" until then. Still
         never "nothing in the library", which is what this state was written to stop. */
      expect: () => !!document.querySelector('#s-stuff .loading[role="status"]')
                 && !/Nothing in the shop or the library/.test(document.getElementById('s-stuff').textContent || ''),
      wants: 'the Find screen showing the one loader while the questions are on their way, not saying there are none' },
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
                         /* `Level · SATs` AND THEN `Key stage · KS2`. This was `Key stage · KS2`,
                            then `Level · KS2 SATs` when a primary sheet's key stage became its
                            qualification -- *"I prefer GCSE or SATs over grey areas"* -- and is two
                            answers now: *"sats is one tag not ks2 sats"*. The level is SATs and
                            Key stage is asked inside it, and only there (see `keystage` in find.js). */
                         { field: 'level', value: 'SATs' },
                         { field: 'keystage', value: 'KS2' },
                         { field: 'yearGroup', any: true }];
        paintStuff();
        goPage('stuff', 0, true);
      },
      /* ---------- AND THE CHIPS SAY ONLY WHAT WAS CHOSEN, WITH CLEAR BESIDE THE BOX ----------------
         The owner, 8 Oct, on a pupil's iPad: *"i dont need the category of the tag to appear with the
         choisen option in the finder"*, and *"clear button looks like a tag which it isnt."* This is
         the state both were said about — seven chips, one of them a skip — so this is where the
         pictures are asked for: no field name on any chip, Subject's chip `Maths✕` and nothing more
         (still in Subject's colour), the skip saying `Any school year✕`, and Clear the pen's bin tile in
         its slot beside the search box, not a chip among the tags. `check/ui.js` measures that tile's
         reach and contrast here like every other control. */
      expect: () => {
        const chips = [...document.querySelectorAll('#stuff-chips .chip')];
        const text = el => el.textContent.replace(/\s+/g, ' ').trim();
        const subject = chips.find(c => c.getAttribute('data-tag') === 'subject');
        return document.querySelectorAll('#stuff-groups .row').length > 0
          && !document.querySelector('#stuff-chips .chip-k')
          && !!subject && text(subject) === 'Maths✕'
          && chips.some(c => text(c) === 'Any school year✕')
          && !!document.querySelector('#stuff-clear .tile[data-do="filter-clear"]')
          && !document.querySelector('#stuff-chips [data-do="filter-clear"]');
      },
      wants: 'a question with answers on it, the chips only their values (Maths✕, Any school year✕), and Clear a tile beside the search box' },
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
       shape that was reported. (`Topic area` and `Topic` were skipped here with Doesn't matter until
       a past paper stopped answering either — see `topicArea WAS HERE` in find.js.) */
    { name: 'the year folder',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' },
                         { field: 'kindLabel', value: 'Questions' },
                         { field: 'subject', value: 'Maths' },
                         { field: 'documentType', value: 'Past paper' },
                         { field: 'level', value: 'GCSE' },
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
                         { field: 'tier', value: 'Higher' },
                         { field: 'examYear', value: '2017' },
                         { field: 'examMonth', value: 'June' },
                         { field: 'paperId', value: 'P-1MA1-1706-2H' }];
        paintStuff();
        goPage('stuff', stuffFirstResult_(), true);
      },
      /* AND THE CARD'S SITTING IS TWO TAGS, `2017` THEN `June` — *"Fix this why it say June and year
         in same chip"* was a screenshot of one purple `June 2024` pill on exactly this card. THEN THE
         DAY IT WAS SAT, `sat Thursday 8 June`, which was a line of its own under the tags and is a
         sitting tag now (`qTags_`) -- with no year in it, so it is not the fused pill again. */
      expect: () => {
        const rows = document.querySelectorAll('#stuff-groups .answers > .row[data-do="facet-pick"]');
        const groups = document.querySelector('#stuff-groups');
        const card = document.querySelector('#s-stuff .page.on .qcard') || document.querySelector('#s-stuff .qcard');
        const sit = card ? [...card.querySelectorAll('.qtag[data-tag="sitting"]')].map(t => t.textContent.trim()) : [];
        return !!groups && rows.length === 0 && /That is the paper, in order/.test(groups.textContent)
               && !!card && sit.slice(0, 2).join('|') === '2017|June'
               && sit.slice(2).every(t => /^sat [A-Z][a-z]+ \d{1,2} [A-Z][a-z]+$/.test(t));
      },
      wants: 'a funnel page asking nothing after Paper, with the paper\'s first question on the page after it, its sitting tagged 2017 then June (then the day it was sat, with no year)',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A LONG LIST, DRAWN WHOLE ------------------------------------------------------------
       THIS WAS "AN ANSWER ONE LETTER LONG" -- the `S`, `G` and `P` chips the letter ranges made -- and
       those cannot exist any more: the owner, 6 Oct, *"I no longer want to have that a-g method or
       h-n. Just display."* What the change made possible instead is a question drawing a dozen or
       more answers at once, in the smaller 32px chips asked for with it, so that is what is measured:
       Year 5's Corbettmaths worksheets, thirteen titles at the time of writing, every one its own
       chip and none of them a range. */
    { name: 'a long list, drawn whole',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: 'Questions' },
                         { field: 'subject', value: 'Maths', bucket: true },
                         { field: 'documentType', value: 'Worksheet' },
                         { field: 'keystage', value: 'KS2' },
                         { field: 'yearGroup', value: 'Year 5' }];
        paintStuff(); goPage('stuff', 0, true);
      },
      expect: () => {
        const rows = [...document.querySelectorAll('#stuff-groups .answers > .row[data-do="facet-pick"]')];
        return rows.length >= 10 && rows.every(r => !r.getAttribute('data-bucket'));
      },
      wants: 'ten or more answer chips on one question, none of them a range',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A BUNDLE OF PAPERS, WHICH ONLY A NARROWED LIST OFFERS ------------------------------
       THE CARD EXISTS ONLY WHEN THE RESULTS ARE WHOLE PAPERS — see `bundleOf_` — so `go('stuff')`
       never shows one, and neither does any state above: a search for "work out" is questions from
       everywhere, and six answers into the worksheets is not a set of papers. Nothing here would
       ever have measured it, which is the hole the receipt, the message thread and the basket were
       each in before a state put them on the screen.

       THE WIDEST ONE ANYBODY REACHES BY ANSWERING, on purpose: Edexcel GCSE Higher in 2017 is two
       sittings of papers, grouped a line per sitting. It was the `2017 & 2018` bucket, twelve papers
       in four, until the years stopped being paired (6 Oct) -- one year is the widest answer now. A
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
                         { field: 'examYear', value: '2017' }];
        paintStuff();
        const card = document.querySelector('#s-stuff .card.bundle');
        const page = card && card.closest('.page');
        if (!page) throw new Error('the funnel narrowed to a year of whole papers offers no bundle');
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
    /* ---------- A COURSEWORK, ON ITS STAGES PAGE ------------------------------------------------
       "i would like to add course works. make it bare bones. its within projects in finder." — the
       owner, 9 Oct. The project's state with the type chosen, as the funnel's own two answers:
       Projects, then Coursework, then the coursework's STAGES page — so the card with the board on
       its strip, the Stages list and the share tile beside them are the ones measured, and the
       longest strip and longest list any project card carries is the one at 320px. */
    { name: 'a coursework',
      enter: () => {
        const x = stuffItemsAll_().find(it => it.kind === 'project' && it.row && it.row.projectType === 'coursework');
        if (!x) throw new Error('no coursework in the list — data/projects.json has no `project_type: coursework` row');
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label }, { field: 'projectType', value: x.projectType }];
        paintStuff();
        const at = typeof stuffPages_ === 'function'
          ? Math.max(0, stuffPages_().findIndex(pg => pg.part === 'steps')) : 0;
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + at);
      },
      expect: () => {
        const main = document.querySelector('#s-stuff .card.proj:not(.prac-part)');
        const steps = document.querySelector('#s-stuff .card.proj.is-steps');
        const flags = [...document.querySelectorAll('#s-stuff .card.proj:not(.prac-part) .fc-flag')].map(f => f.textContent.trim());
        return !!main && !!steps
               && flags.length > 0 && flags.every(f => f === 'Coursework')
               && ((steps.querySelector('h3') || {}).textContent || '') === 'Stages'
               && !!steps.querySelector('.prac-steps ol > li');
      },
      wants: 'a coursework on its Stages page — the card flagged Coursework with its board, and the stages numbered',
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
        /* GCSE STATISTICS BY NAME, and its own `Book` chip: the shelf holds a book for every GCSE now,
           and the first one on it, or a chapter numbered like this one in another book, is not the
           page this state was written about. */
        const x = stuffItemsAll_().find(it => it.kind === 'textbook' && it.name === 'GCSE Statistics');
        if (!x) throw new Error('no GCSE Statistics textbook in the list — data/textbooks.json did not load');
        const c = (x.row.chapters || []).find(ch => /spread/i.test(ch.title)) || x.row.chapters[0];
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label },
                         { field: 'shelf', value: x.shelf },
                         { field: 'book', value: x.name }];
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
    /* ---------- A TEXTBOOK ANIMATION, ON ITS PAGE AFTER ITS CHAPTER ---------------------------------
       "Add the animations from loading to respective subject text books." — the owner, 8 Oct. Three of
       the twenty-seven, chosen for what they stress in a card: Pythagoras is the TALLEST drawing,
       Bayes the WIDEST (a 20rem root that came out at 288px in a 244px card at 320 before its size
       stopped at the box), and standard form the one that SCROLLED SIDEWAYS — its point hops past the
       row of digits it stands on. Each is reached the owner's way, by the book's chips, and turned to
       by its page; the pages either side are in the DOM beside it and are measured too. */
    { name: 'a textbook animation: Pythagoras',
      enter: () => {
        const x = stuffItemsAll_().find(it => it.kind === 'textbook' && it.name === 'GCSE Maths');
        if (!x) throw new Error('no GCSE Maths textbook in the list — data/textbooks.json did not load');
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label },
                         { field: 'shelf', value: x.shelf },
                         { field: 'book', value: x.name }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.part === 'an17-pyth');
        if (at < 0) throw new Error('GCSE Maths has no an17-pyth page — the pyth row is not under its chapter');
        goPage('stuff', stuffFirstResult_() + at);
      },
      expect: () => {
        const card = document.querySelector('#s-stuff .card.tb-an.is-an17-pyth');
        const stage = card && card.querySelector('.tb-an-stage[data-anim="pyth"]');
        return !!stage && !!stage.querySelector('.an-pyth')
               && !!card.querySelector('.tile-row [data-do="tb-an-again"]')
               && !!card.querySelector('.tb-about li')
               && !!document.head.querySelector('style[data-anim="pyth"]');
      },
      wants: 'Pythagoras after Maths chapter 17: the drawing from its row, Play again, and the chapter\'s own lines about it',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    { name: 'a textbook animation: Bayes',
      enter: () => {
        const x = stuffItemsAll_().find(it => it.kind === 'textbook' && it.name === 'GCSE Statistics');
        if (!x) throw new Error('no GCSE Statistics textbook in the list — data/textbooks.json did not load');
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label },
                         { field: 'shelf', value: x.shelf },
                         { field: 'book', value: x.name }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.part === 'an15-bayes');
        if (at < 0) throw new Error('GCSE Statistics has no an15-bayes page — the bayes row is not under its chapter');
        goPage('stuff', stuffFirstResult_() + at);
      },
      expect: () => {
        const card = document.querySelector('#s-stuff .card.tb-an.is-an15-bayes');
        const stage = card && card.querySelector('.tb-an-stage[data-anim="bayes"]');
        return !!stage && !!stage.querySelector('.an-bayes')
               && !!card.querySelector('.tile-row [data-do="tb-an-again"]')
               && !!card.querySelector('.tb-about li')
               && !!document.head.querySelector('style[data-anim="bayes"]');
      },
      wants: 'Bayes after Statistics chapter 15: the drawing from its row, Play again, and the chapter\'s own lines about it',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    { name: 'a textbook animation: standard form',
      enter: () => {
        const x = stuffItemsAll_().find(it => it.kind === 'textbook' && it.name === 'GCSE Maths');
        if (!x) throw new Error('no GCSE Maths textbook in the list — data/textbooks.json did not load');
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label },
                         { field: 'shelf', value: x.shelf },
                         { field: 'book', value: x.name }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.part === 'an2-sf');
        if (at < 0) throw new Error('GCSE Maths has no an2-sf page — the sf row is not under its chapter');
        goPage('stuff', stuffFirstResult_() + at);
      },
      expect: () => {
        const card = document.querySelector('#s-stuff .card.tb-an.is-an2-sf');
        const stage = card && card.querySelector('.tb-an-stage[data-anim="sf"]');
        return !!stage && !!stage.querySelector('.an-sf')
               && !!card.querySelector('.tile-row [data-do="tb-an-again"]')
               && !!card.querySelector('.tb-about li')
               && !!document.head.querySelector('style[data-anim="sf"]');
      },
      wants: 'Standard form after Maths chapter 2: the drawing from its row, Play again, and the chapter\'s own lines about it',
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
        /* NOT AN ORDERING: it has `choices` and a `choiceRight` too, and draws a strip, not options
           (`orderBox_`) -- it has states of its own below. */
        const mc = stuffItemsAll_().find(it => it.kind === 'question'
          && Array.isArray(it.choices) && it.choices.length >= 2 && (it.choiceRight || []).length
          && !orderIs_(it));
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
      /* THE PAGE'S OWN TAGS -- what it is and its number -- which replaced the gold header (`qPage_`). */
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qcard.qstem');
        const tag = k => ((c && c.querySelector('.qcard-tags [data-tag="' + k + '"]')) || {}).textContent || '';
        return !!c && tag('kind') === 'Question' && /^Q5( · \d+ of \d+)?$/.test(tag('number').trim()) && !tag('marks')
               && !!c.querySelector('.qsheet-stem') && !c.querySelector('.qp-ans, svg')
               && !!c.querySelector('.qsheet-figref');
      },
      wants: 'the stem of Q5 on its own page, tagged Question and Q5 (1 of 2: its table makes it two), no marks, no box and no picture, saying what is next',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    { name: 'its figure, the page after, with no question number',
      /* THE VENN DIAGRAM IS PART (c)'S NOW, because that is where the paper prints it: after (b),
         under the work-from-home bullets that (c) completes it from. It sat on the stem until the
         library was read against the paper, and this state followed it there. */
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-9MA031-2206-5c');
        if (!it) throw new Error('Q-9MA031-2206-5c is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'fig'));
      },
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qcard.qfig');
        const row = c && c.querySelector('.qcard-tags');
        return !!row && !/\bQ\d/.test(row.textContent) && !row.querySelector('[data-tag="number"], [data-tag="marks"]')
               && /^Figure/.test((row.querySelector('[data-tag="kind"]') || {}).textContent || '')
               && !!c.querySelector('figure svg') && !c.querySelector('.qp-ans');
      },
      wants: 'the Venn diagram on its own page, tagged Figure first, with no question number, no marks and no box',
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
               && ((c.querySelector('.qcard-tags [data-tag="kind"]') || {}).textContent || '') === 'Squared grid'
               && /not the paper.s own figure/i.test(c.textContent);
      },
      wants: 'a squared grid on its own page after its question, under the pen, tagged "Squared grid" and saying it is not the paper\'s figure',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- "USE YOUR GRAPH", WITH THE GRAPH IN FRONT OF IT --------------------------------------------
       The multi-part audit's finding 5, on the row it named: June 2024 Foundation Paper 2, Q24(c) "Use your
       graph to find estimates for the solutions of x^2 - x = 4", whose `uses` is (b). The curve (b) asks
       for is put on (b)'s grid under whoever is signed in, as the pen stores a stroke -- y = x^2 - x from
       -2 to 3, placed off the grid's own axes -- and the strip is turned to the page in front of (c): (b)'s
       picture with the curve on it, no pen, no control, and the line saying whose marks they are. */
    { name: 'the page in front of "use your graph", with the graph drawn on (b)',
      enter: () => {
        const all = stuffItemsAll_();
        const c = all.find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-2F-24c');
        const b = all.find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-2F-24b');
        if (!c || !b) throw new Error('June 2024 2F Q24(b) or (c) is not in the library');
        if (typeof usesOf_ !== 'function' || usesOf_(c) !== b) throw new Error('Q24(c) does not use (b) -- its `uses` cell is gone');
        const pts = [];
        for (let i = 0; i <= 25; i++) {
          const x = -2 + i / 5;
          pts.push(Math.round(146.5 + 45 * x), Math.round((194 - 22.5 * (x * x - x)) * 340 / 294));
        }
        window.__useKey = padKey_(b);
        try { localStorage.setItem(window.__useKey, JSON.stringify([pts])); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(c) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(c, 'use'));
      },
      expect: () => {
        const p = document.querySelector('#s-stuff .page.on .qcard.qfig-uses');
        return !!p && p.getAttribute('data-of') === 'Q-1MA1-2406-2F-24c'
               && p.querySelectorAll('.qpad-was path').length === 1 && !p.querySelector('.qpad, .tile, .qp-ans')
               && /Your marks from Q24b/.test(p.textContent);
      },
      wants: '(b)\'s grid with the curve drawn on it, read only, on the page in front of "Use your graph", saying the marks are from Q24b',
      leave: () => {
        try { localStorage.removeItem(window.__useKey); } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- AND ITS FIGURE TILE, WITH THE SAME GRAPH ON IT ----------------------------------------------
       Found in review: on Q24(c) the Figure tile opened (b)'s grid EMPTY while the page before showed the
       child's curve. Now the sheet carries the marks (`figsBefore_`) -- and, measured here because only a
       browser lays it out, ON the grid: in the sheet `.qpad-art` first took the sheet's whole width while
       the grid stopped at its 20rem cap, so the ink layer stretched past the picture and the curve sat
       21px off the axes it was drawn on. The tile is pressed through its own handler, as a finger does. */
    { name: 'the Figure tile on "use your graph", opening (b)\'s grid with the graph on it',
      enter: () => {
        const all = stuffItemsAll_();
        const c = all.find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-2F-24c');
        const b = all.find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-2F-24b');
        if (!c || !b) throw new Error('June 2024 2F Q24(b) or (c) is not in the library');
        const pts = [];
        for (let i = 0; i <= 25; i++) {
          const x = -2 + i / 5;
          pts.push(Math.round(146.5 + 45 * x), Math.round((194 - 22.5 * (x * x - x)) * 340 / 294));
        }
        window.__useKey = padKey_(b);
        try { localStorage.setItem(window.__useKey, JSON.stringify([pts])); } catch (e) {}
        const h = document.createElement('div');
        h.innerHTML = figTile_(c);
        if (!h.firstElementChild) throw new Error('Q24(c) has no Figure tile');
        ACTIONS['q-fig'](h.firstElementChild);
      },
      expect: () => {
        const s = document.querySelector('#sheet-body .qfig-sheet .qseen');
        const art = s && s.querySelector('.qpad-art > svg:first-child');
        const ink = s && s.querySelector('.qpad-ink');
        if (!art || !ink) return false;
        const a = art.getBoundingClientRect(), k = ink.getBoundingClientRect();
        return s.querySelectorAll('.qpad-was path').length === 1 && !s.querySelector('.qpad')
               && /yours from Q24b/.test(s.textContent)
               && Math.abs(a.width - k.width) <= 1 && Math.abs(a.height - k.height) <= 1;
      },
      wants: 'the sheet showing (b)\'s grid with the curve on it, read only, the ink exactly the grid\'s size, saying the marks are from Q24b',
      leave: () => {
        try { localStorage.removeItem(window.__useKey); } catch (e) {}
        closeSheet();
      } },
    /* ---------- A CONSTRUCTION, WITH A RULER'S LINE AND A COMPASS'S RING ON IT -----------------------------
       *"some questions require a compass or ruler. so should have a tile for these things."* November 2019
       Higher Paper 1, Q4: "Use a ruler and compasses to construct the line from the point P perpendicular
       to the line CD" -- the one pen question in the library whose own row asks for compasses, found by
       id. On its figure page, with the Compass in hand (pressed as a finger would, which also locks the
       card) and two marks made the way the tools make them: a ruler's two-point line and a closed ring
       built by the app's own `padArc_` from the ink's real box, so it is round at every width. Measured
       armed, because the bar's lit tile and the gold-filled lock are what is new here. */
    { name: 'a construction with the ruler and compass in the pen bar, a line and a circle drawn',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1911-1H-4');
        if (!it) throw new Error('Q-1MA1-1911-1H-4 is not in the library');
        if (padToolsOf_(it).join(' ') !== 'pen ruler compass') throw new Error('Q-1MA1-1911-1H-4 is not offered a ruler and compasses: ' + padToolsOf_(it).join(' '));
        window.__toolKey = padKey_(it);
        try { localStorage.removeItem(window.__toolKey); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'fig'), true);
        /* IN THE TICK THE PAGE IS BUILT, found by its key (`.page.on` comes a frame later), with a
           tick's grace if it is not there yet -- the timing the answer states above settled on. */
        const mark = () => {
          const pad = [...document.querySelectorAll('#s-stuff .qpad')].find(p => p.getAttribute('data-k') === window.__toolKey);
          const ink = pad && pad.querySelector('.qpad-ink');
          if (!ink) return false;
          const r = ink.getBoundingClientRect();
          if (!r.width || !r.height) return false;
          const ring = padArc_([200, 150], Math.min(r.width, r.height) * 0.22, r.width / 340, r.height / 340, 0, 2 * Math.PI);
          const marks = [[60, 280, 290, 60], ring];
          try { localStorage.setItem(window.__toolKey, JSON.stringify(marks)); } catch (e) {}
          padRepaint_(pad, marks);
          const c = pad.querySelector('.qpad-tool[data-tool="compass"]');
          if (c) c.click();
          return true;
        };
        if (!mark()) setTimeout(mark, 150);
      },
      expect: () => {
        const pad = [...document.querySelectorAll('#s-stuff .page.on .qpad')].find(p => p.getAttribute('data-k') === window.__toolKey);
        const lit = pad && [...pad.querySelectorAll('.qpad-tool.on')].map(b => b.getAttribute('data-tool')).join(' ');
        return !!pad && pad.classList.contains('is-drawing') && lit === 'compass'
               && !!pad.querySelector('.qpad-tool[data-tool="ruler"]') && !!pad.querySelector('.qpad-lock.on')
               && pad.querySelectorAll('.qpad-g path').length === 2;
      },
      wants: 'Q4\'s figure under the pen, armed, with Pen, Ruler and Compass in its bar, the Compass lit, and a ruler\'s line and a compass\'s ring on it',
      leave: () => {
        try { localStorage.removeItem(window.__toolKey); } catch (e) {}
        PAD_ON = ''; PAD_TOOL.delete(window.__toolKey);
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
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
        /* AT ONCE, by key, where the page is already built; after a tick only if not -- a loaded run's 150ms
           timer is what left this state unreached (the answer states above say more). */
        const k = circKey_(it);
        const ring = () => {
          const host = [...document.querySelectorAll('#s-stuff [data-circ]')].find(h => h.getAttribute('data-circ') === k);
          if (!host) return false;
          ['crumbling', 'rocky'].forEach(t => {
            const w = [...host.querySelectorAll('.qw')].find(s => s.textContent === t);
            if (w) w.click();
          });
          return true;
        };
        if (!ring()) setTimeout(ring, 150);
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
               && /1 of \d/.test((c.querySelector('.qcard-tags [data-tag="number"]') || {}).textContent || '');
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
      /* IN THE TILE ROW, BESIDE THE STAR -- the gold header it sat in became tags, and the date is yours
         like the star is (`questionTiles_`). */
      expect: () => {
        const s = document.querySelector('#s-stuff .page.on .tile-row .qcard-done');
        return !!s && /^Done 4 Oct( \d{4})?$/.test(s.textContent)
               && !document.querySelector('#s-stuff .page.on .qcard .qcard-done');
      },
      wants: 'the question card\'s tile row saying "Done 4 Oct" beside the star',
      leave: () => { try { localStorage.removeItem(window.__doneKey); } catch (e) {}
                     STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A KS2 SATs QUESTION: `SATs` AND `KS2`, TWO TAGS, AND WHAT TO BRING AS ITS OWN ---------
       *"why is ks2 sats one tag? it should be sats. if they want to specify key stage then it should be
       its own thing."* and *"why do the questions say non calculator but its not a tag?"* One row, named:
       the May 2024 Reasoning paper's first question, which asks for a ruler -- so the card wears the
       page's own tags, the level and the key stage as two blue pills, and a needs pill in its own
       colour, every one of which `ui.js` measures for contrast and for fitting at 320. Reached by the
       funnel's Paper answer, as a thumb reaches it. */
    { name: 'a KS2 SATs question, SATs and KS2 as two tags',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-STA-KS2-2024-P2-1');
        if (!it) throw new Error('Q-STA-KS2-2024-P2-1 is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it));
      },
      expect: () => {
        const row = document.querySelector('#s-stuff .page.on .qcard .qcard-tags');
        const tags = row ? [...row.querySelectorAll('.qtag')].map(t => (t.getAttribute('data-tag') || '') + ':' + t.textContent.trim()) : [];
        return tags[0] === 'kind:Question' && tags[1] === 'number:Q1' && tags.indexOf('level:SATs') >= 0
               && tags.indexOf('level:KS2') === tags.indexOf('level:SATs') + 1
               && !tags.some(t => /KS\s*\d\s*SATs/i.test(t)) && tags.indexOf('needs:Ruler') >= 0
               && !document.querySelector('#s-stuff .page.on .qcard-needs, #s-stuff .page.on .qcard-top');
      },
      wants: 'a KS2 SATs question tagged Question, Q1, its mark, then SATs and KS2 side by side and Ruler as what to bring -- no header line, no needs line',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
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
    /* THE RESULT EXPECTED IS THE ONE THE APP SAYS, not a word copied in here. These states wanted
       /^No$/ until the data caught up with "remove all whys" and Q3's head became the whole result
       ("No: salesmen get £180 each, …") -- the page was right and the check was a stale copy of the
       data. So the head is asked of `answerParts_` and drawn through `typeset_`, the same two calls
       `answerBlock_` makes, and the page must show exactly that -- inline in each `expect`, because a
       state is evaluated in the page as its own source and a helper declared in this file is not there. */
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
    /* ---------- SWIPED TO, NOT TURNED TO BY A TILE ----------------------------------------------------
       THIS WAS "THE ANSWER, TURNED TO FROM ITS QUESTION", pressing the question card's ↓ `To the answer`
       tile. The tile went on the owner's word, 8 Oct: *"there doesnt need to be a scroll down tile on
       questions."* So the question's page is landed on, it is asked to carry NO such tile, and the strip
       is swiped one page on -- `goPage(PAGE + 1)`, the landing a swipe ends in, animated as one -- and
       that page must be the question's answer, still hidden, with Show waiting. A paper chosen and no
       kind: the one place answers follow their questions. */
    { name: 'the answer, swiped to from its question',
      enter: () => {
        ANS_SHOWN.clear();
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1811-1H-3');
        if (!it) throw new Error('Q-1MA1-1811-1H-3 is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.q = '';
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        const first = typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1;
        goPage('stuff', first + stuffPageOf_(it), true);
        window.__ansWant = first + stuffPageOf_(it, 'ans');
        window.__ansFrom = PAGE.stuff;
        /* BY ITS KEY, in the tick the page is built -- `.page.on` arrives a frame after an instant landing. */
        const k = ansKey_(it);
        window.__ansTile = [...document.querySelectorAll('#s-stuff [data-do="qa-go"], #s-stuff .tile-i-next')].length;
        window.__ansCard = [...document.querySelectorAll('#s-stuff .qp-ans-in')].some(b => b.getAttribute('data-k') === k);
        goPage('stuff', PAGE.stuff + 1);
      },
      /* LANDED ON, AND STILL HIDDEN. *"answers should just stay hidden unless user unhides them"* --
         the page's own Show tile is the one tap that reveals it. */
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qans-card');
        return window.__ansCard && window.__ansTile === 0
               && PAGE.stuff === window.__ansFrom + 1 && PAGE.stuff === window.__ansWant
               && !!c && c.classList.contains('is-hidden') && c.getAttribute('data-of') === 'Q-1MA1-1811-1H-3'
               && !c.querySelector('.qans, .qans-body') && !!c.querySelector('.tile[data-do="qa-show"]');
      },
      wants: 'the question\'s page with no tile to the answer on the strip, then one swipe on: its answer, still hidden, Show the answer waiting',
      leave: () => { ANS_SHOWN.clear(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- QUESTIONS CHOSEN: THE PAGE AFTER A QUESTION IS THE NEXT QUESTION --------------------------
       THE OWNER, 8 Oct, on an iPad: *"answers shouldnt even be showing up when all ive done is clicked
       questions. the answers still show up."* Measured that morning on the Corbettmaths subtraction
       sheet: 59 pages, 27 of them answers, `subtraction-1, its answer, subtraction-2, its answer...`.
       With Questions chosen, Q1's card and one swipe on is Q2's card -- and no answer card anywhere on
       the strip, not merely shut. */
    { name: 'Questions chosen, Q1 then Q2',
      enter: () => {
        ANS_SHOWN.clear();
        const q1 = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-CBM-subtraction-1');
        if (!q1) throw new Error('Q-CBM-subtraction-1 is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.q = '';
        STUFF.filters = [{ field: 'paperId', value: facet.of(q1) }, { field: 'kindLabel', value: 'Questions' }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(q1), true);
        window.__q2From = PAGE.stuff;
        goPage('stuff', PAGE.stuff + 1);
      },
      expect: () => {
        const q2 = stuffItemsAll_().find(x => x.row && x.row.row_id === 'Q-CBM-subtraction-2');
        const box = document.querySelector('#s-stuff .page.on .qp-ans-in');
        return !!q2 && PAGE.stuff === window.__q2From + 1 && !!box && box.getAttribute('data-k') === ansKey_(q2)
               && !document.querySelector('#s-stuff .qans-card');
      },
      wants: 'the subtraction sheet with Questions chosen: Q1, one swipe, and Q2\'s card -- no answer card on the strip at all',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- WHAT KIND: QUESTIONS FIRST -------------------------------------------------------------
       The chips were the alphabet, so `Answers` was the first one -- top left, where a thumb lands -- and
       one tap on it opens every answer for anybody. In `KIND_BUCKET`'s order now: Questions, then
       Answers beside it. Pictured, because which chip is first is a fact about the screen. */
    { name: 'What kind, Questions first',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' }];
        paintStuff();
        goPage('stuff', 0, true);
      },
      expect: () => {
        const chips = [...document.querySelectorAll('#s-stuff .page.on [data-do="facet-pick"][data-field="kindLabel"]')]
          .map(c => c.getAttribute('data-value'));
        return chips[0] === 'Questions' && chips[1] === 'Answers';
      },
      wants: 'the What kind question with Questions as its first chip and Answers the second',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    { name: 'an answer, shown, and nothing under it',
      enter: () => {
        ANS_SHOWN.clear();
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1811-1H-3');
        if (!it) throw new Error('Q-1MA1-1811-1H-3 is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'ans'));
        /* AT ONCE, by key, where the page is already built; after a tick only if not -- a loaded run's 150ms
           timer is what left this state unreached (the answer states above say more). */
        const k = ansKey_(it);
        const show = () => {
          const c = [...document.querySelectorAll('#s-stuff .qans-card')].find(e => e.getAttribute('data-k') === k);
          const btn = c && c.querySelector('[data-do="qa-show"]');
          if (!btn) return false;
          btn.click();
          return true;
        };
        if (!show()) setTimeout(show, 150);
      },
      /* THE RESULT AND NOTHING ELSE: "No", and no fold, no working, no examiner's note under it. */
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qans-card:not(.is-hidden)');
        const ans = c && c.querySelector('.qans');
        return !!ans && ans.querySelector('.qans-body').textContent.trim() === ((t) => { const d = document.createElement('div'); d.innerHTML = typeset_(answerParts_(t).head); return d.textContent.trim(); })((stuffItemsAll_().find(x => x.row && x.row.row_id === 'Q-1MA1-1811-1H-3') || {}).answer)
               && !c.querySelector('details, .qans-why, .qans-more, .qans-note')
               && !!c.querySelector('.tile[data-do="qa-hide"]') && !c.querySelector('[data-do="qa-show"]');
      },
      wants: 'the answer page showing its result (the head answerParts_ gives) once its tile is pressed, nothing under it, and Hide the answer where Show was',
      leave: () => { ANS_SHOWN.clear(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- AND HIDDEN AGAIN, WITH THE TILE WHERE THE THUMB LEFT IT -----------------------------
       *"answers should just stay hidden unless user unhides them. and can hide them again. simple is
       best."* Show, then Hide, by real clicks; the tile's box is measured at each step, because "the
       same place" is a fact about pixels and jsdom has none (check-flow holds the markup half). The
       tile and the card's top may not move by half a pixel either way, and the page ends hidden with
       no answer in it. */
    { name: 'an answer shown and hidden again, its tile where it was',
      enter: () => {
        ANS_SHOWN.clear();
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1811-1H-3');
        if (!it) throw new Error('Q-1MA1-1811-1H-3 is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'ans'));
        window.__ansAt = [];
        window.__ansK = ansKey_(it);
        /* BY ITS KEY, in the tick the page is built: `.page.on` arrives a frame after an instant
           landing, and a loaded run's timers are what made the states round here flaky. */
        const card = () => [...document.querySelectorAll('#s-stuff .qans-card')].find(c => c.getAttribute('data-k') === window.__ansK);
        const at = () => {
          const c = card();
          const t = c && c.querySelector('.qa-toggle');
          if (!t) return null;
          const r = t.getBoundingClientRect(), q = c.getBoundingClientRect();
          return { x: r.left, y: r.top, top: q.top, act: t.getAttribute('data-do') };
        };
        /* IN ONE TICK: the redraw is synchronous and a box read straight after it is laid out, so
           there is nothing to wait for between the presses -- and nothing a slow run can miss. */
        const run = () => {
          if (!card()) return false;
          window.__ansAt.push(at());
          const s = card().querySelector('[data-do="qa-show"]');
          if (s) s.click();
          window.__ansAt.push(at());
          const h = card().querySelector('[data-do="qa-hide"]');
          if (h) h.click();
          window.__ansAt.push(at());
          return true;
        };
        if (!run()) setTimeout(run, 150);
      },
      expect: () => {
        const a = window.__ansAt || [];
        const c = [...document.querySelectorAll('#s-stuff .page.on .qans-card')].find(e => e.getAttribute('data-k') === window.__ansK);
        const still = (p, q) => !!p && !!q && Math.abs(p.x - q.x) < 0.5 && Math.abs(p.y - q.y) < 0.5 && Math.abs(p.top - q.top) < 0.5;
        return a.length === 3 && a[0] && a[0].act === 'qa-show' && a[1] && a[1].act === 'qa-hide' && a[2] && a[2].act === 'qa-show'
               && still(a[0], a[1]) && still(a[1], a[2])
               && !!c && c.classList.contains('is-hidden') && !c.querySelector('.qans, .qans-body');
      },
      wants: 'Show then Hide pressed on the answer page: the tile in the same place at every step, and the page hidden again with no answer in it',
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
        /* AT ONCE WHERE THE CARD IS ALREADY BUILT, by its key, and after a tick only if not: a loaded run's
           150ms timer is what left this state unreached (see the answer states above). */
        const run = () => {
          const hit = [...document.querySelectorAll('#s-stuff .qp-ans-in')].find(b => b.getAttribute('data-k') === ansKey_(it));
          const card = window.__qCard = hit && hit.closest('.qcard');
          const inp = card && card.querySelector('.qp-ans-in');
          const btn = card && card.querySelector('.qp-check');
          if (!inp || !btn) return false;
          const at = () => [card.querySelector('.qsheet-pb').getBoundingClientRect().top,
                            card.querySelector('.qp-ans').getBoundingClientRect().top,
                            card.getBoundingClientRect().height];
          const a = at();
          inp.value = '999999';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          btn.click();
          window.__qStable = { a, b: at() };
          return true;
        };
        if (!run()) setTimeout(run, 150);
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
        /* AT ONCE WHERE THE CARD IS ALREADY BUILT, by its key, and after a tick only if not: a loaded run's
           150ms timer is what left this state unreached (see the answer states above). */
        const run = () => {
          const hit = [...document.querySelectorAll('#s-stuff .qp-ans-in')].find(b => b.getAttribute('data-k') === ansKey_(it));
          const card = window.__qCard = hit && hit.closest('.qcard');
          const inp = card && card.querySelector('.qp-ans-in');
          const btn = card && card.querySelector('.qp-check');
          if (!inp || !btn) return false;
          const at = () => [card.querySelector('.qsheet-pb').getBoundingClientRect().top,
                            card.querySelector('.qp-ans').getBoundingClientRect().top,
                            btn.getBoundingClientRect().top];
          const a = at();
          inp.value = '15';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          btn.click();
          window.__qStable = { a, b: at() };
          return true;
        };
        if (!run()) setTimeout(run, 150);
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
    /* ---------- AN ORDERING, HALF PLACED, AND THEN SENT RIGHT -------------------------------------------
       THE OWNER, 8 Oct: *"I would prefer it be like an ordering system?? … simpler to mark for a
       machine."* (`orderBox_`, docs/history/303.) The real June 2024 1F Q4, its five numbers tapped by
       CLICKS on the real buttons. Half placed is the strip with two items in it, two ghosts in the row
       under it and three dashed slots -- the picture worth measuring at 320, where the strip wraps.
       Then the whole row WRONG, and Send, and then right, and Send: the question, the strip, the
       verdict's line and the card's height measured before and after each, because marking moves
       nothing (261) -- and Send and Clear too, because the long "Not yet — have another go" took room
       from them: at 320 Send went from 48x48 to 39x48 and Clear from 44 to 36 wide, and they moved 9
       and 17px. Only the short "Correct" had been measured, and it never squeezes the row. */
    { name: 'an ordering, half placed',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-1F-4');
        if (!it) throw new Error('Q-1MA1-2406-1F-4 is not in the library');
        if (!orderIs_(it)) throw new Error('Q-1MA1-2406-1F-4 is not an ordering — its answer_type is ' + it.answerType);
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        ORDER_SENT.clear();
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        window.__ordKey = ansKey_(it);
        const box = () => [...document.querySelectorAll('#s-stuff .qp-order')].find(b => b.getAttribute('data-k') === window.__ordKey);
        const run = () => {
          if (!box()) return false;
          [3, 4].forEach(n => { const b = box(); const el = b && b.querySelector('.qp-item[data-n="' + n + '"]'); if (el) el.click(); });
          return true;
        };
        if (!run()) setTimeout(run, 150);
      },
      expect: () => {
        const box = [...document.querySelectorAll('#s-stuff .qp-order')].find(b => b.getAttribute('data-k') === window.__ordKey);
        const card = box && box.closest('.qcard');
        const full = box ? [...box.querySelectorAll('.qp-slot')].map(s => (s.classList.contains('is-full') ? s.getAttribute('data-n') : '_')).join(' ') : '';
        return !!box && full === '3 4 _ _ _' && box.querySelectorAll('.qp-item.is-placed').length === 2
               && box.querySelectorAll('.qp-item').length === 5 && !card.querySelector('textarea, .qp-ans-in, .qp-opt');
      },
      wants: 'the real 1F Q4 as an ordering: 0.03 and 0.1 in the first two slots, their ghosts in the row under it, three slots empty, no text box',
      leave: () => {
        try { if (window.__ordKey) localStorage.removeItem(window.__ordKey); } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    { name: 'an ordering, sent wrong then right, nothing moved',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-1F-4');
        if (!it) throw new Error('Q-1MA1-2406-1F-4 is not in the library');
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        ORDER_SENT.clear();
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        window.__ordKey = ansKey_(it);
        window.__qStable = null;
        const box = () => [...document.querySelectorAll('#s-stuff .qp-order')].find(b => b.getAttribute('data-k') === window.__ordKey);
        const run = () => {
          if (!box()) return false;
          /* AND FILLING IT MOVES NOTHING EITHER: every slot, and the row of items where the finger is,
             measured before the first tap and after the last -- the strip is one shape throughout. */
          const shape = () => [...box().querySelectorAll('.qp-slot')].map(s => { const r = s.getBoundingClientRect(); return [r.left, r.top, r.width]; })
            .concat([[0, box().querySelector('.qp-items').getBoundingClientRect().top, 0]]);
          const shape0 = shape();
          const tap = n => { const b = box(); const el = b && b.querySelector('.qp-item[data-n="' + n + '"]'); if (el) el.click(); };
          const card = box().closest('.qcard');
          const at = () => [card.querySelector('.qsheet').getBoundingClientRect().top,
                            box().querySelector('.qp-slots').getBoundingClientRect().top,
                            box().querySelector('.qp-verdict').getBoundingClientRect().top,
                            card.getBoundingClientRect().height];
          const tiles = () => ['.qp-order-send', '.qp-order-clear'].map(q => { const r = box().querySelector(q).getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
          /* WRONG FIRST: the row reversed, its long verdict beside the two tiles. Measured by the verdict's
             ROW (`.qp-mark`), its top and height, not the sentence's own top: "Not yet — have another go"
             wraps to two lines INSIDE its slot at 320 and 390, as the typed bar's verdict does by design,
             so its first line starts higher in a row that has not moved -- nothing else is there to move. */
          const row = () => { const r = box().querySelector('.qp-mark').getBoundingClientRect(); return [r.top, r.height]; };
          const atRow = () => [card.querySelector('.qsheet').getBoundingClientRect().top,
                               box().querySelector('.qp-slots').getBoundingClientRect().top,
                               card.getBoundingClientRect().height].concat(row(), ...tiles());
          [1, 2, 5, 4, 3].forEach(tap);
          const w0 = atRow();
          box().querySelector('.qp-order-send').click();
          const wrong = { a: w0, b: atRow(), say: (box().querySelector('.qp-verdict') || {}).textContent };
          box().querySelector('.qp-order-clear').click();
          [3, 4, 5, 2, 1].forEach(tap);
          const a = at();
          box().querySelector('.qp-order-send').click();
          window.__qStable = { a, b: at(), fill: [shape0, shape()], wrong };
          return true;
        };
        if (!run()) setTimeout(run, 150);
      },
      expect: () => {
        const s = window.__qStable;
        const box = [...document.querySelectorAll('#s-stuff .qp-order')].find(b => b.getAttribute('data-k') === window.__ordKey);
        return !!s && !!box && box.classList.contains('is-right')
               && (box.querySelector('.qp-verdict') || {}).textContent === 'Correct'
               && s.a.every((v, i) => Math.abs(v - s.b[i]) < 0.5)
               && s.wrong.say === 'Not yet — have another go'
               && s.wrong.a.length === 13 && s.wrong.a.every((v, i) => Math.abs(v - s.wrong.b[i]) < 0.5)
               && s.fill[0].length === s.fill[1].length
               && s.fill[0].every((p, i) => p.every((v, j) => Math.abs(v - s.fill[1][i][j]) < 0.5));
      },
      wants: 'the reversed order sent and marked Not yet, then the right one marked Correct, with the question, the strip, the verdict\'s row, the card\'s height and the Send and Clear tiles (place and size) where they were each time, and every slot and the items where they were before the first tap',
      leave: () => {
        try { if (window.__ordKey) localStorage.removeItem(window.__ordKey); } catch (e) {}
        ORDER_SENT.clear();
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- AN ORDERING OF POWERS: A POWER IS RAISED IN THE ROW AS IT IS IN THE QUESTION ------------
       5-a-day 3 June Q1, "2² ∛27 1³ √25". A slot and an item are `inline-flex`, and a bare `<sup>` in one
       was a flex item of its own: not raised, centred beside its digit, so the row read "22 ∛27 13 √25"
       -- and standard form "6 × 104" -- and a child who reads them that way orders them wrong. Measured
       at 390 before the fix: the exponent level with its digit (sup 488-503, digit 487-504) where the
       question prints it 6px up. 2² is placed, so a slot holds one too, and every `<sup>` in the strip
       and the row must sit at least 2px above the bottom of the digit before it. Fractions never showed
       it -- `typeset_` draws one as a single element -- which is why the first shots missed it. */
    { name: 'an ordering of powers, raised as printed',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-CBM-5AD-F-0603-1');
        if (!it) throw new Error('Q-CBM-5AD-F-0603-1 is not in the library');
        if (!orderIs_(it)) throw new Error('Q-CBM-5AD-F-0603-1 is not an ordering — its answer_type is ' + it.answerType);
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        ORDER_SENT.clear();
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        window.__ordKey = ansKey_(it);
        const box = () => [...document.querySelectorAll('#s-stuff .qp-order')].find(b => b.getAttribute('data-k') === window.__ordKey);
        const run = () => {
          if (!box()) return false;
          const el = box().querySelector('.qp-item[data-n="1"]');
          if (el) el.click();
          return true;
        };
        if (!run()) setTimeout(run, 150);
      },
      expect: () => {
        const box = [...document.querySelectorAll('#s-stuff .qp-order')].find(b => b.getAttribute('data-k') === window.__ordKey);
        if (!box || !box.querySelector('.qp-slot.is-full[data-n="1"]')) return false;
        /* HOW FAR A <sup> SITS ABOVE THE BOTTOM OF THE TEXT JUST BEFORE IT, in px. */
        const raise = sup => {
          const t = sup.previousSibling;
          if (!t || t.nodeType !== 3 || !t.textContent.trim()) return null;
          const r = document.createRange(); r.selectNodeContents(t);
          return r.getBoundingClientRect().bottom - sup.getBoundingClientRect().bottom;
        };
        const sups = [...box.querySelectorAll('.qp-slot sup, .qp-item sup')];
        const q = box.closest('.qcard').querySelector('.qsheet sup');
        return sups.length >= 3 && q && raise(q) > 2 && sups.every(x => raise(x) !== null && raise(x) >= 2);
      },
      wants: '2² placed in slot 1, and every power in the strip and the row (2² and 1³, the ghost included) raised at least 2px above its digit, as the question prints it',
      leave: () => {
        try { if (window.__ordKey) localStorage.removeItem(window.__ordKey); } catch (e) {}
        ORDER_SENT.clear();
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
        /* AT ONCE, by key, where the page is already built; after a tick only if not -- a loaded run's 150ms
           timer is what left this state unreached (the answer states above say more). */
        const run = () => {
          const hit = [...document.querySelectorAll('#s-stuff .qp-choices')].find(b => b.getAttribute('data-k') === ansKey_(it));
          const card = window.__qCard = hit && hit.closest('.qcard');
          const opts = card ? [...card.querySelectorAll('.qp-opt')] : [];
          if (opts.length < 2) return false;
          const miss = it.choiceRight[0] === 1 ? 2 : 1;
          const at = () => [card.querySelector('.qsheet-pb').getBoundingClientRect().top,
                            card.querySelector('.qp-opt[data-n="' + miss + '"]').getBoundingClientRect().top,
                            card.getBoundingClientRect().height];
          const a = at();
          opts[miss - 1].click();
          window.__qStable = { a, b: at() };
          return true;
        };
        if (!run()) setTimeout(run, 150);
      },
      expect: () => {
        const s = window.__qStable;
        const box = window.__qCard && window.__qCard.querySelector('.qp-choices');
        const mark = box && box.nextElementSibling;
        return !!s && !!box && box.classList.contains('is-done')
               /* THE MISS, AND NO TICK ANYWHERE: the right option is the answer, and it waits behind
                  Show on the answer page like every other one (`choiceBox_`). */
               && !!box.querySelector('.qp-opt.is-picked:not(.is-ans)') && !box.querySelector('.qp-opt.is-ans')
               && !!mark && mark.classList.contains('is-near')
               && s.a.every((v, i) => Math.abs(v - s.b[i]) < 0.5);
      },
      wants: 'a wrong tap marked, no option ticked as the answer, and the question, the option and the card\'s height unmoved',
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
        /* FIRST AT ONCE, in the tick the card is built -- the poll is the fallback, and on a machine
           loaded to thirty its 20ms steps slipped past ui.js's half second (390, 768 and 1280, one run). */
        typeIt();
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
    /* ---------- THE KEYPAD UP ON A PART WITH A FIGURE BEHIND IT: THE FIGURE TILE STAYS ABOVE THE PAD ---
       THE REVIEW OF THE MULTI-PART MERGE, at 320x568: 1F Q23b's box raised the pad (top 315) and Check,
       Figure and the old way to the answer stood at 322-437, under it -- the Figure tile exists to show the Venn
       WHILE answering, and was hidden exactly then; a tap where it had been typed a key. The tile now
       stands at the end of the box's own line (`ansBox_`), so wherever the box clears the pad, it does.
       Expect: the box AND the Figure tile wholly above the pad's top edge, at every width. */
    { name: 'a part with a figure behind it, the keypad up, the Figure tile above the pad',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-1F-23b');
        if (!it) throw new Error('1F Q23b is not in the library');
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.q = '';
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        window.__kfKey = ansKey_(it);
        /* AFTER THE COLUMN HAS STOPPED, as a finger would: the box is tapped on a page that is still.
           Focused 20ms after `goPage`, the slide's own settle (`afterSlide_`) let go of the hold the pad
           had just lifted the card on (and the page was not yet `.on`, so the lift never ran), and the box sat under the pad at 320 -- a fault of the state's
           timing, not the app's: opened on the settled page, the lift is 45px and both clear it. */
        let tries = 0;
        const up = () => {
          const inp = [...document.querySelectorAll('#s-stuff .kp-in')].find(b => b.getAttribute('data-k') === window.__kfKey);
          const moving = typeof AFTER_SLIDE !== 'undefined' && (AFTER_SLIDE || AFTER_SLIDE_JOBS.size);
          if (!inp || moving || !inp.closest('#screen .page.on')) { if (++tries < 60) setTimeout(up, 50); return; }
          inp.focus();
          if (KP_AT !== inp) kpOpen_(inp);
        };
        up();
      },
      expect: () => {
        const pad = document.getElementById('kp');
        const inp = [...document.querySelectorAll('#s-stuff .kp-in')].find(b => b.getAttribute('data-k') === window.__kfKey);
        const pg = inp && inp.closest('.page');
        const fig = pg && pg.querySelector('[data-do="q-fig"]');
        if (!pad || pad.hidden || !inp || !fig) return false;
        const top = pad.getBoundingClientRect().top;
        return inp.getBoundingClientRect().bottom <= top && fig.getBoundingClientRect().bottom <= top
          && fig.getBoundingClientRect().top >= 0;
      },
      wants: '1F Q23b\u2019s box focused, the keypad up, and both the box and its Figure tile wholly above the pad',
      leave: () => {
        try { localStorage.removeItem(window.__kfKey); } catch (e) {}
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        kpClose_();
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- THE ANSWER BOX AT REST: A PAPER FIELD SAYING WHAT IT IS FOR, AND SEND ----------------------
       THE OWNER, 8 Oct: *"the answer box should look like a chatbox. with send tile. we found it hard to
       find answer box in the ipad in the sun."* It was `--sunk` on the card, 1.04:1, with nothing in it.
       At rest and empty: the field is the paper (`--paper`, read off the stylesheet rather than written
       here), it says "Type your answer", and Send is the gold tile beside it. `check/ui.js` measures its
       edges against the card (EDGE). Q0664, the row the marking states use. */
    { name: 'the answer box at rest, empty, with a Send tile',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q0664');
        if (!it) throw new Error('Q0664 is not in the library');
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        kpClose_();
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.q = '';
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        window.__restK = ansKey_(it);
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
      },
      expect: () => {
        const inp = [...document.querySelectorAll('#s-stuff .page.on .kp-in')].find(b => b.getAttribute('data-k') === window.__restK);
        const card = inp && inp.closest('.qcard');
        const field = card && card.querySelector('.qp-bar > .qp-ans');
        const show = card && card.querySelector('.kp-show');
        if (!field || !show) return false;
        const probe = document.createElement('i');
        probe.style.color = 'var(--paper)';
        document.body.appendChild(probe);
        const paper = getComputedStyle(probe).color;
        probe.remove();
        return getComputedStyle(field).backgroundColor === paper && !inp.value
               && /Type your answer/.test(getComputedStyle(show, '::before').content)
               && !!card.querySelector('.qp-bar > .tile.is-send.qp-check[data-do="qp-check"]')
               && !!card.querySelector('.qp-mark.qp-compose > .qp-verdict');
      },
      wants: 'Q0664\'s box empty and at rest: the field the paper colour, "Type your answer" in it, and the gold Send tile beside it',
      leave: () => {
        try { localStorage.removeItem(window.__restK); } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- THE KEYPAD UP, IN ITS SUNLIGHT COLOURS ----------------------------------------------------
       *"its hard to see keypad and each button especially backspace, which i thing should be red."* The
       keys were 1.03:1 on the pad. Lit faces now, ⌫ the app's red with a black mark, and the heights in
       px: 44 on a short screen, 56 from 700px, 48 between. The whole pad takes only a tap
       (`touch-action: manipulation`), so a double tap in a gap cannot zoom the iPad's page. */
    { name: 'the keypad up, colours for sunlight',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q0664');
        if (!it) throw new Error('Q0664 is not in the library');
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.q = '';
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        window.__sunK = ansKey_(it);
        let tries = 0;
        const up = () => {
          const inp = [...document.querySelectorAll('#s-stuff .kp-in')].find(b => b.getAttribute('data-k') === window.__sunK);
          if (!inp) { if (++tries < 20) setTimeout(up, 20); return; }
          inp.focus();
          if (KP_AT !== inp) kpOpen_(inp);
        };
        up();
      },
      expect: () => {
        const pad = document.getElementById('kp');
        if (!pad || pad.hidden) return false;
        const key = v => pad.querySelector('.kp-key[data-v="' + v + '"]');
        const bg = el => (el ? getComputedStyle(el).backgroundColor : '');
        const tall = innerHeight <= 600 ? 44 : innerWidth >= 700 ? 56 : 48;
        const keys = [...pad.querySelectorAll('.kp-key')];
        return bg(key('!back')) === 'rgb(255, 95, 86)' && getComputedStyle(key('!back')).color === 'rgb(0, 0, 0)'
               && !!key('!back').querySelector('svg.kp-del-i')
               && bg(key('7')) === 'rgb(242, 242, 242)' && getComputedStyle(key('7')).color === 'rgb(17, 17, 17)'
               && getComputedStyle(pad).touchAction === 'manipulation'
               && keys.length === 30 && keys.every(b => b.getBoundingClientRect().height >= tall - 0.5);
      },
      wants: 'the keypad up with light keys, ⌫ red with a black mark, touch-action manipulation on the pad, and every key 44/48/56px tall for the screen',
      leave: () => {
        try { localStorage.removeItem(window.__sunK); } catch (e) {}
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        kpClose_();
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- A REPAINT WITH THE KEYPAD UP --------------------------------------------------------------
       *"they keypad was a bit unstable. it wasnt working at first for some reason."* Signing in repaints,
       and `load()` repaints again about fifteen seconds later; each replaces the box being typed in. Here,
       in Chromium -- which fires `focusout` for the removed box, where the iPad fires nothing (check-flow
       holds that half): 7, `repaint()`, a beat for the focus to land, then 5. Wanted: the pad still up,
       on a box that is in the page, holding 7 before the 5 and 75 after it.
       TWO LAYERS SINCE 8 OCT, and this asks both. `findKeep_` (js/answers.js) holds a repaint of Find
       back while a box is focused or the pad is up, so `repaint()` must leave the SAME box in place; and
       a redraw that comes anyway -- `paintStuff(true)`, which no keep stands in front of -- must still
       land the pad on the new box. Merged, the state's old `repaint()` met the first layer and never
       reached the second: "shows no ... the pad still up on the new box" at every width. */
    { name: 'a repaint with the keypad up',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q0664');
        if (!it) throw new Error('Q0664 is not in the library');
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.q = '';
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        window.__rpK = ansKey_(it);
        window.__rp = null;
        const live = () => [...document.querySelectorAll('#s-stuff .kp-in')].find(b => b.getAttribute('data-k') === window.__rpK);
        const key = v => document.querySelector('#kp .kp-key[data-v="' + v + '"]');
        let tries = 0;
        const run = () => {
          const inp = live();
          if (!inp) { if (++tries < 20) setTimeout(run, 20); return; }
          inp.focus();
          if (KP_AT !== inp) kpOpen_(inp);
          key('7').click();
          repaint();
          const held = live() === inp && document.activeElement === inp;
          paintStuff(true);
          setTimeout(() => {
            const now = live();
            const mid = { up: !document.getElementById('kp').hidden, conn: !!KP_AT && KP_AT.isConnected, held: held,
                          same: !!now && now !== inp && document.activeElement === now, val: now && now.value };
            key('5').click();
            const end = live();
            window.__rp = { mid: mid, val: end && end.value, up: !document.getElementById('kp').hidden };
          }, 60);
        };
        run();
      },
      expect: () => {
        const r = window.__rp;
        return !!r && r.mid.held && r.mid.up && r.mid.conn && r.mid.same && r.mid.val === '7' && r.up && r.val === '75';
      },
      wants: 'Q0664 with 7 typed: a repaint held back (the same box), then a forced redraw with the pad still up on the new box holding 7 -- then 5 makes 75',
      leave: () => {
        try { localStorage.removeItem(window.__rpK); } catch (e) {}
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        kpClose_();
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- AND A WORDED ANSWER, WITH "MARK WITH AI" BESIDE IT ------------------------------------
       In the answer bar where Send stands on a box with a scheme (8 Oct, `aiTile_`), its verdict and its
       sentence on the lines under the bar.
       The fixture is a deployment with the action and no key (`aiMarking: false`), which is what
       `doGet` sends until the owner adds one — so this says yes for the length of the state, the way
       a key in Script Properties would, and puts it back. Q33 of AQA Biology June 2024 Foundation is
       a three-mark `explain` with a scheme and no `accept`: exactly the question the button is for. */
    { name: 'a worded answer, Mark with AI beside it',
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
        /* FIRST AT ONCE, as the keypad's state above now does; the poll is the fallback. */
        markIt();
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
        /* NO MATHS BOX ON IT: the worded box is the pad's too since 8 Oct, on the letters (`data-kp="words"`). */
        return !!go && !card.querySelector('.kp-in[data-kp="maths"]') && !!ta.matches('.kp-in[data-kp="words"][readonly]') && !!said && marked;
      },
      wants: 'a three-mark explain question with the pad\'s locked words box, "Mark with AI" beside it in the bar, and its verdict drawn — 2 of 3 and a sentence signed in, "sign in" signed out',
      leave: () => {
        if (window.__aiApi) api = window.__aiApi;
        if (window.__aiTok && USER) delete USER.token;
        try { localStorage.removeItem(window.__aiKey); } catch (e) {}
        DATA.aiMarking = false;
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- A WORDED ANSWER, THE PAD UP ON ITS LETTERS ---------------------------------------------
       THE OWNER, 8 Oct: *"Make the keypad never need to use their own keyboard the key pad seems to allow
       ios keyboard to show I just want self contained system really"*. A worded box was a textarea and the
       iPad's keyboard; it is the pad's box now, opening on the letters (keypad.js, `KP_ABC`). Pictured so
       `check/ui.js` measures the letters as it measures the maths keys -- every key's face against the
       pad (EDGE), its size (the letters are narrower than 44px and carry their reason, `ACCEPTED_TAP`),
       its contrast -- at every width. Q33 of AQA Biology June 2024 Foundation, the explain question the
       Mark-with-AI state uses, focused and typed into by the pad's own keys: "Hi" with its capital put in
       by itself. Expect: the letters face up (sixty columns, 39 keys, the bottom row the maths pad's),
       every key as tall as the maths keys for the screen, the box still locked and its pill wholly above
       the pad, and the drawing saying what was typed. */
    { name: 'a worded answer, the pad up on its letters',
      enter: () => {
        const id = 'Q-AQA-8461-2406-1F-033';
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === id);
        if (!it) throw new Error(id + ' is not in the library');
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.q = '';
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        window.__abcKey = ansKey_(it);
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        /* ON THE SETTLED PAGE, as the Figure state above opens its pad and for its reason: the lift is
           worked out on the page in front, and a page still sliding is not yet in front. */
        let tries = 0;
        const up = () => {
          const ta = [...document.querySelectorAll('#s-stuff .kp-in')].find(b => b.getAttribute('data-k') === window.__abcKey);
          const moving = typeof AFTER_SLIDE !== 'undefined' && (AFTER_SLIDE || AFTER_SLIDE_JOBS.size);
          if (!ta || moving || !ta.closest('#screen .page.on')) { if (++tries < 60) setTimeout(up, 50); return; }
          ta.focus();
          if (KP_AT !== ta) kpOpen_(ta);
          ['h', 'i'].forEach(v => {
            const k = document.querySelector('#kp .kp-key[data-v="' + v + '"]');
            if (k) k.click();
          });
        };
        up();
      },
      expect: () => {
        const pad = document.getElementById('kp');
        const ta = [...document.querySelectorAll('#s-stuff .kp-in')].find(b => b.getAttribute('data-k') === window.__abcKey);
        if (!pad || pad.hidden || !ta) return false;
        const keys = [...pad.querySelectorAll('.kp-key')];
        const tall = innerHeight <= 600 ? 44 : innerWidth >= 700 ? 56 : 48;
        const pill = ta.closest('.qp-ans');
        return pad.getAttribute('data-layer') === 'abc' && pad.classList.contains('is-abc')
               && getComputedStyle(pad).gridTemplateColumns.split(' ').length === 60
               && keys.length === 39 && keys.every(b => b.getBoundingClientRect().height >= tall - 0.5)
               && keys.slice(-6).map(b => b.getAttribute('data-v')).join('|') === '!123|!left|!right|!nl|!back|!done'
               && ta.readOnly && ta.getAttribute('inputmode') === 'none' && ta.value === 'Hi'
               && ta.parentNode.querySelector('.kp-show').textContent === 'Hi'
               && !!pill && pill.getBoundingClientRect().bottom <= pad.getBoundingClientRect().top;
      },
      wants: 'Q33\u2019s worded box focused, the pad up on its letters (39 keys on sixty columns, the maths pad\u2019s bottom row), "Hi" typed by the pad, the box locked and wholly above the pad',
      leave: () => {
        try { localStorage.removeItem(window.__abcKey); } catch (e) {}
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        kpClose_();
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- AN ESSAY, WRITTEN ON ITS SHEET IN PARAGRAPHS, THE PAD UP ---------------------------------
       THE OWNER, 9 Oct, about a pupil on AQA English Language Paper 1, June 2017, Section B: *"firstly it
       doesnt let him do paragraphs and also i want it to mark with ai."* The real Q-R0398-5 -- forty marks
       of writing -- drawn as a SHEET (`ansEssay_`, keypad.js; `.qp-sheet` in style.css), focused, and three
       paragraphs written into it through the pad: words on the letters' keys, each paragraph break on
       the essay's own RETURN key (two presses, a blank line), the rest of each paragraph handed to the
       pad's edit as a laptop's keys are. Pictured so `check/ui.js` measures the sheet and the essay's
       letters at every width -- the return key's size and face, the paper against the card (EDGE), the
       word count's contrast. Expect: the pad up on the essay's letters (40 keys, one return, labelled),
       the value holding two paragraph breaks, the drawing the same, the count right, the row under the
       sheet (and so the sheet) wholly above the pad, and the line being written -- the caret -- inside
       the sheet's window and above the pad, the thing "growing, then scrolling inside" is for. */
    { name: 'an essay, three paragraphs on its sheet, the pad up',
      enter: () => {
        const id = 'Q-R0398-5';
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === id);
        if (!it) throw new Error(id + ' is not in the library');
        try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.q = '';
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        window.__essayKey = ansKey_(it);
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        const PARAS = ['the bus shuddered away from the kerb and the town slid past the window like a film somebody had forgotten to stop. Rain had been falling since breakfast.',
          'beside me an old man held a paper bag of oranges on his knee as if it were something precious, and each time the driver braked he steadied it with both hands.',
          'by the time we reached the coast road the clouds had torn open, and the old man stepped down into the brightness, leaving the smell of oranges behind him.'];
        let tries = 0;
        const up = () => {
          const ta = [...document.querySelectorAll('#s-stuff .kp-in')].find(b => b.getAttribute('data-k') === window.__essayKey);
          const moving = typeof AFTER_SLIDE !== 'undefined' && (AFTER_SLIDE || AFTER_SLIDE_JOBS.size);
          if (!ta || moving || !ta.closest('#screen .page.on')) { if (++tries < 60) setTimeout(up, 50); return; }
          ta.focus();
          if (KP_AT !== ta) kpOpen_(ta);
          const key = v => document.querySelector('#kp .kp-key[data-v="' + v + '"]');
          PARAS.forEach((p, i) => {
            if (i) { key('!nl').click(); key('!nl').click(); }
            /* THE FIRST WORD ON THE KEYS, the capital put in by itself; the rest as a laptop types it. */
            const first = p.split(' ')[0];
            first.split('').forEach(c => { const k = key(c); if (k) k.click(); });
            kpType_(ta, p.slice(first.length), true);
          });
        };
        up();
      },
      expect: () => {
        const pad = document.getElementById('kp');
        const ta = [...document.querySelectorAll('#s-stuff .kp-in')].find(b => b.getAttribute('data-k') === window.__essayKey);
        if (!pad || pad.hidden || !ta || !ta.hasAttribute('data-kp-essay')) return false;
        const keys = [...pad.querySelectorAll('.kp-key')];
        const ret = pad.querySelector('.kp-key.kp-ret[data-v="!nl"]');
        const essay = ta.closest('.qp-essay');
        const foot = essay && essay.querySelector('.qp-sheet-foot');
        const show = ta.parentNode.querySelector('.kp-show');
        const caret = show && show.querySelector('.kp-caret');
        const v = ta.value;
        if (!ret || !foot || !caret || (v.match(/\n\n/g) || []).length !== 2 || !/^The bus/.test(v) || !/\n\nBeside/.test(v) || !/\n\nBy the time/.test(v)) return false;
        const padTop = pad.getBoundingClientRect().top;
        const c = caret.getBoundingClientRect(), sr = show.getBoundingClientRect();
        const tall = innerHeight <= 600 ? 44 : innerWidth >= 700 ? 56 : 48;
        return pad.getAttribute('data-layer') === 'abc' && keys.length === 40
               && keys.filter(b => b.getAttribute('data-v') === '!nl').length === 1 && /return/.test(ret.textContent)
               && ret.getBoundingClientRect().height >= tall - 0.5 && ret.getBoundingClientRect().width >= 44
               && ta.readOnly && ta.getAttribute('inputmode') === 'none'
               && show.textContent === v
               && essay.querySelector('.qp-words').textContent === kpWordsSay_(kpWordCount_(v))
               && foot.getBoundingClientRect().bottom <= padTop + 0.5
               && c.top >= sr.top - 1 && c.bottom <= sr.bottom + 1 && c.bottom <= padTop && c.top >= 0;
      },
      wants: 'Q-R0398-5 drawn as a sheet, the pad up on the essay\u2019s letters (40 keys, one labelled return at least 44px), three paragraphs typed with two blank lines between them, the count right, the row under the sheet above the pad and the caret in the sheet\u2019s window',
      leave: () => {
        try { localStorage.removeItem(window.__essayKey); } catch (e) {}
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        kpClose_();
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- WHERE A TYPED ANSWER IS KEPT, SAID UNDER THE BOX ----------------------------------------
       *"it doesnt seem to save their answers"* and *"i am very dissapointed it didnt have his answers
       already written in when he went to see them on the computer"* — js/answers.js. Two states, one per
       visitor: SIGNED IN, the box on a fresh device filled from the account by `answersPull_` and the line
       under it naming whose account it is on; SIGNED OUT, an answer typed and the line saying it is on
       this device only. The fixture is a deployment from before `saveAnswers`, and its signed-in visitor
       has no token, so both are lent for the length of the state — and `api` answers `myAnswers` the way
       the backend does — and put back. Measured at 320 because the line is one line and must stay one. */
    { name: 'a typed answer, filled from the account on another device',
      only: () => typeof USER !== 'undefined' && !!USER && !!USER.personId,
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q0664');
        if (!it) throw new Error('Q0664 is not in the library');
        const k = ansKey_(it);
        window.__svKey = k;
        try { localStorage.removeItem(k); localStorage.removeItem('ansAt:' + k); } catch (e) {}
        /* NOT DUE EITHER — the states above typed into this same box signed in, and an answer still due
           on this device wins over the account's (`answersAdopt_`), which is the rule, not this state. */
        ansDirtySet_(whoIs_()).delete(k); ansDirtyKeep_(whoIs_());
        window.__svFeat = DATA.features;
        DATA.features = (DATA.features || []).concat(['saveAnswers', 'myAnswers']);
        window.__svTok = !USER.token;
        if (window.__svTok) USER.token = 'state-token';
        window.__svApi = api;
        api = (b, o) => (b && b.action === 'myAnswers')
          ? Promise.resolve({ success: true, for: String(USER.personId),
              answers: { [ansServerKey_(k)]: { v: '4.6', at: Date.now() - 3600e3 } } })
          : (b && b.action === 'saveAnswers') ? Promise.resolve({ success: true, saved: {} })
          : window.__svApi(b, o);
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        answersPull_(true);
      },
      expect: () => {
        const inp = [...document.querySelectorAll('#s-stuff .qp-ans-in')].find(b => b.getAttribute('data-k') === window.__svKey);
        const line = [...document.querySelectorAll('#s-stuff .qp-saved')].find(b => b.getAttribute('data-k') === window.__svKey);
        return !!inp && inp.value === '4.6' && !!line && /^Saved to .+account$/.test(line.textContent);
      },
      wants: 'Q0664\u2019s box filled with 4.6 from the account, and "Saved to \u2026\u2019s account" under it on one line',
      leave: () => {
        if (window.__svApi) api = window.__svApi;
        DATA.features = window.__svFeat;
        if (window.__svTok && USER) delete USER.token;
        try { localStorage.removeItem(window.__svKey); localStorage.removeItem('ansAt:' + window.__svKey); } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    { name: 'a typed answer, kept on this device only',
      only: () => typeof USER !== 'undefined' && !USER,
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q0664');
        if (!it) throw new Error('Q0664 is not in the library');
        window.__svKey = ansKey_(it);
        try { localStorage.removeItem(window.__svKey); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        const run = () => {
          const inp = [...document.querySelectorAll('#s-stuff .qp-ans-in')].find(b => b.getAttribute('data-k') === window.__svKey);
          if (!inp) return false;
          inp.value = '4.6';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        };
        if (!run()) setTimeout(run, 150);
      },
      expect: () => {
        const line = [...document.querySelectorAll('#s-stuff .qp-saved')].find(b => b.getAttribute('data-k') === window.__svKey);
        return !!line && line.textContent === 'On this device only \u2014 sign in to keep it';
      },
      wants: 'Q0664 typed into signed out, and "On this device only \u2014 sign in to keep it" under the box on one line',
      leave: () => {
        try { localStorage.removeItem(window.__svKey); } catch (e) {}
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
    /* ---------- THE BIBLE, WHICH ONLY THE ADMIN VISITOR IS SHOWN ----------------------------------
       "i want to add the bible to resources as a book. but only admin can see the bible." `only`, for
       the films' reason one state up — signed out there is no item, no shelf answer and no fetch, and
       asking a stranger to reach it would report a fault about the check (check-flow proves the
       absence; this measures the presence).

       AND REDONE ON 6 OCT AS SIX QUESTIONS AND A CARD A VERSE (*"it should be like the other stuff.
       tags in finder ... each verse is a widget"*), so these are the screens that are new: the one
       question with one answer, the two longest grids the funnel draws — Psalms's 150 chapters and
       Psalm 119's 176 verses, which are where a grid is drawn smaller to fit and then scrolls — a
       verse card with its tags and its Chapter tile, and Esther 8:9, the longest verse, at every
       width. `check/ui.js` measures every pane in the strip, so each is measured with the pages
       either side of it.
       THE BOOKS ARE ASKED FOR IN THE FIRST STATE, for the ones after it: a state's `enter` has the
       500ms every state gets, and a book fetched there by the app's own call is held for the visit,
       so the cards after it are drawn from memory as a second visit would draw them. */
    { name: 'the Bible, the KJV question',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Resources' },
                         { field: 'shelf', value: 'Books' }];
        paintStuff();
        goPage('stuff', stuffQuestionPage_(), true);
        bibleLoad_(1);
        bibleLoad_(17);
        bibleLoad_(19);
      },
      expect: () => {
        const a = [...document.querySelectorAll('#stuff-groups [data-do="facet-pick"]')];
        return a.length === 1 && a[0].dataset.field === 'bibleTranslation' && a[0].dataset.value === 'KJV'
               && !!document.querySelector('#s-stuff .card.bible[data-bb="card"]');
      },
      wants: 'the Books shelf answered: the Bible\'s cover, and one question, Translation, with KJV its one answer' },
    { name: 'the Bible, Psalms\'s chapters',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Resources' },
                         { field: 'shelf', value: 'Books' }, { field: 'bibleTranslation', value: 'KJV' },
                         { field: 'bibleTestament', value: 'Old Testament' }, { field: 'bibleGroup', value: 'Poetry & Wisdom' },
                         { field: 'bibleBook', value: 'Psalms' }];
        paintStuff();
        goPage('stuff', stuffQuestionPage_(), true);
      },
      expect: () => document.querySelectorAll('#stuff-groups .answers.is-grid [data-do="facet-pick"][data-field="bibleChapter"]').length === 150,
      wants: 'Psalms\'s Chapter question, 1 to 150, drawn as a grid' },
    { name: 'the Bible, Psalm 119\'s verses',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Resources' },
                         { field: 'shelf', value: 'Books' }, { field: 'bibleTranslation', value: 'KJV' },
                         { field: 'bibleTestament', value: 'Old Testament' }, { field: 'bibleGroup', value: 'Poetry & Wisdom' },
                         { field: 'bibleBook', value: 'Psalms' }, { field: 'bibleChapter', value: '119' }];
        paintStuff();
        goPage('stuff', stuffQuestionPage_(), true);
      },
      expect: () => document.querySelectorAll('#stuff-groups .answers.is-grid [data-do="facet-pick"][data-field="bibleVerse"]').length === 176,
      wants: 'Psalm 119\'s Verse question, 1 to 176, drawn as a grid' },
    { name: 'the Bible, Genesis 1:3',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Resources' },
                         { field: 'shelf', value: 'Books' }, { field: 'bibleTranslation', value: 'KJV' },
                         { field: 'bibleTestament', value: 'Old Testament' }, { field: 'bibleGroup', value: 'Torah' },
                         { field: 'bibleBook', value: 'Genesis' }, { field: 'bibleChapter', value: '1' },
                         { field: 'bibleVerse', value: '3' }];
        paintStuff();
        goPage('stuff', stuffFirstResult_(), true);
      },
      expect: () => {
        /* `.bb-v` IS ONLY DRAWN ONCE THE BOOK IS IN — waiting, the card holds the one loader instead. */
        const v = document.querySelector('#s-stuff .card.bb-verse[data-key="bible:kjv:1:1:3"] .bb-v');
        return !!v && !v.closest('.bb-verse').querySelector('.loading') && /Let there be light/.test(v.textContent)
               && !!document.querySelector('#s-stuff [data-do="bible-go"][data-key="bible:kjv:1:1:3"]');
      },
      wants: 'the card for Genesis 1:3, "Let there be light", its tags, and its Chapter tile' },
    { name: 'the Bible, Esther 8:9',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Resources' },
                         { field: 'shelf', value: 'Books' }, { field: 'bibleTranslation', value: 'KJV' },
                         { field: 'bibleTestament', value: 'Old Testament' }, { field: 'bibleGroup', value: 'History' },
                         { field: 'bibleBook', value: 'Esther' }, { field: 'bibleChapter', value: '8' },
                         { field: 'bibleVerse', value: '9' }];
        paintStuff();
        goPage('stuff', stuffFirstResult_(), true);
      },
      /* THE LONGEST VERSE IN THE BIBLE, 534 characters — the one card that fills a small phone. */
      expect: () => {
        const v = document.querySelector('#s-stuff .card.bb-verse[data-key="bible:kjv:17:8:9"] .bb-v');
        return !!v && !v.closest('.bb-verse').querySelector('.loading') && v.textContent.length > 500 && !/[\[\]]/.test(v.textContent);
      },
      wants: 'Esther 8:9, the longest verse, drawn whole with no bracket',
      leave: () => { STUFF.q = ''; STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
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
      /* ---------- AND THE PROFILE IT BECAME ------------------------------------------------------------
         ASKED FOR AS *"refine the boxers widget. maybe add image of each boxer ... the wins losses
         etc."* The record left the gold meta line for a scoreboard of its own, and the photo stands
         beside the name — so this asks what only a browser can answer about that: the picture box is
         the 4:5 it was told to be, it sits to the LEFT of the name rather than over it (the grid in
         style.css, not the markup, puts it there), the scoreboard is whole numbers or says there is no
         record, and nothing on the card scrolls sideways at this width. The shared head's two rules
         stay: one title size, the flag above the title. */
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .card.fc.boxer:not(.is-fights)')
               || document.querySelector('#s-stuff .card.fc.boxer:not(.is-fights)');
        if (!c || c.querySelector('.thing')) return false;
        const h3 = c.querySelector('.fc-head > h3'), flag = c.querySelector('.fc-head .fc-flag');
        const rec = c.querySelector('.boxer-rec'), frame = c.querySelector('.boxer-pic .boxer-frame');
        if (!h3 || !flag || !rec || !frame || flag.textContent.trim() !== 'Boxer') return false;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const nums = [...rec.querySelectorAll('.boxer-tally .boxer-n > b')].map(b => b.textContent.trim());
        const told = nums.length ? nums.length >= 3 && nums.every(n => /^\d+$/.test(n))
                                 : /No fight record on file/.test(rec.textContent);
        const f = frame.getBoundingClientRect(), t = h3.getBoundingClientRect();
        return Math.abs(parseFloat(getComputedStyle(h3).fontSize) - 1.1 * rem) < .5
               && flag.getBoundingClientRect().bottom <= t.top + .5
               && told && f.width > 0 && Math.abs(f.width / f.height - .8) < .03
               && f.right <= t.left + .5
               && c.scrollWidth <= c.clientWidth + 1;
      },
      wants: 'a boxer\'s profile — the name at the title size under a Boxer flag, a 4:5 picture box to its left, the record as a scoreboard of whole numbers (or "no record on file"), nothing scrolling sideways',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- THE PHOTO'S CREDIT, AS A LINK A FINGER CAN HIT ------------------------------------------
       THE CREDIT IS A LINK NOW, to the photo's Commons file page — a CC BY or BY-SA licence asks for
       one — and a link is a tap target, so it is a 44px block rather than a 12px line of small print
       (`a.boxer-src` in style.css). Only a browser can say how tall a block is, so this asks one, at
       every width: Ali's credit is a link, at least 44px tall AT ITS OWN SIZE (a profile drawn smaller
       to fit its pane is the zoom's cost, counted by `check/ui.js` on its own line), straight under
       the picture and across the card rather than in the photo's column, and its words at least
       `.62rem` — the size the review measured the old `.56` against and found unreadable.

       THE PICTURE CANNOT ARRIVE HERE. This browser has no route to upload.wikimedia.org, so Ali's
       photo fails and takes its credit with it — which is `boxerPicFail_` doing its job. So the line
       is put back under the picture box by the card's own `boxerCredit_`, with the failed address
       forgotten first, and measured in the real stylesheet; what is measured is exactly the markup
       the card draws when the photo loads. */
    { name: 'a boxer photo\'s credit, a link a finger can hit',
      enter: () => {
        STUFF.q = 'Muhammad Ali';
        STUFF.filters = [{ field: 'kindLabel', value: 'Resources' }, { field: 'shelf', value: 'Boxing' },
                         { field: 'boxKind', value: 'Boxers' }];
        paintStuff();
        goPage('stuff', stuffFirstResult_(), true);
      },
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .card.fc.boxer:not(.is-fights)');
        const b = ((typeof DATA !== 'undefined' && DATA.boxers) || []).find(r => r.name === 'Muhammad Ali');
        const box = c && c.querySelector('.boxer-pic');
        if (!c || !b || !b.image || !box || !/Muhammad Ali/.test(c.querySelector('h3').textContent)) return false;
        let line = c.querySelector('.boxer-credit');
        if (!line) {
          BOXER_PIC_DEAD.delete(pic(b.image));
          line = document.createElement('p');
          line.className = 'boxer-credit';
          line.innerHTML = boxerCredit_(b, b.imageCredit);
          box.after(line);
          /* AND THE PANE IS FITTED AGAIN, as it is when a loaded photo's credit is there from the
             first paint: without it the card was measured at the zoom it had WITHOUT the line, and
             the rest of this file reported 42px below the fold that no real phone ever has. */
          try { paneReach_([c.closest('.pane')]); } catch (e) {}
        }
        const a = line.querySelector('a.boxer-src');
        if (!a || a.getAttribute('href') !== boxerCommons_(pic(b.image))) return false;
        let z = 1;
        for (let e = a; e; e = e.parentElement) { const v = parseFloat(e.style && e.style.zoom); if (v > 0 && v < 1) z *= v; }
        const r = a.getBoundingClientRect(), p = box.getBoundingClientRect(), k = c.getBoundingClientRect();
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return r.height / z >= 43.5 && r.width / z >= 43.5
               && r.top >= p.bottom - .5 && r.width >= (k.width - p.width) * .6
               && parseFloat(getComputedStyle(a).fontSize) >= .62 * rem - .05;
      },
      wants: 'Ali\'s photo credit as a link to its Commons file page, a 44px block at its own size, under the picture and across the card, its words at least .62rem',
      leave: () => { STUFF.q = ''; STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
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
        /* AND BOTH CORNERS' FACES, SQUARE, ABOVE THE FLAG — lifted there by `order`, which only a
           browser lays out. Two because a bout is two boxers, whether either has a photo or not. */
        const faces = [...c.querySelectorAll('.fight-faces .boxer-pic .boxer-frame')].map(e => e.getBoundingClientRect());
        return Math.abs(parseFloat(getComputedStyle(h3).fontSize) - 1.1 * rem) < .5
               && flag.getBoundingClientRect().bottom <= h3.getBoundingClientRect().top + .5
               && getComputedStyle(how).textTransform === 'none'
               && faces.length === 2 && faces.every(r => r.width > 0 && Math.abs(r.width - r.height) < 1.5
                                                        && r.bottom <= flag.getBoundingClientRect().top + .5);
      },
      wants: 'a fight on the shared head — both corners\' faces square above it, the two names as the title under a Fight flag, how it ended in sentence case, no loose note paragraphs',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- THE TEXTBOOK'S CONTENTS, AND `10.` INSIDE THE CARD ---------------------------------
       `a textbook chapter` lands nine pages past the contents card, so the card itself was in the
       DOM only as a neighbour and never the page measured. Its list has sixteen numbers, and with a
       bullet's 1.1rem indent `10.` to `16.` hung out past the card's padding at 320px — a marker is
       not a box, so no overflow rule could see it. So this asks the arithmetic directly: the list's
       indent against the width of its widest number, set in the list's own font. */
    { name: "the textbook's contents, every number inside the card",
      enter: () => {
        /* THE SIXTEEN-CHAPTER BOOK BY NAME — the widest list of numbers on the shelf, `10.` to `16.` —
           and its own `Book` chip, so the card measured is that one and not whichever book is first. */
        const x = stuffItemsAll_().find(it => it.kind === 'textbook' && it.name === 'GCSE Statistics');
        if (!x) throw new Error('no GCSE Statistics textbook in the list — data/textbooks.json did not load');
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label }, { field: 'shelf', value: x.shelf },
                         { field: 'book', value: x.name }];
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
        /* AT ONCE, where the page is already built; after a tick only if not -- a loaded run's 150ms
           timer is what left this state unreached (the answer states above say more). */
        const run = () => {
          const pane = document.getElementById('stuff-controls');
          if (!pane || !document.getElementById('stuff-q')) return false;
          const at = () => {
            const top = pane.getBoundingClientRect().top;
            const q = document.getElementById('stuff-q').getBoundingClientRect().top - top;
            const chip = document.querySelector('#stuff-chips .chip');
            return [q, chip ? chip.getBoundingClientRect().top - top : -1,
                    chip ? chip.getBoundingClientRect().left : -1];
          };
          const a = at();
          const r = document.querySelector('#stuff-groups .answers > .row[data-do="facet-pick"]');
          if (!r) return false;
          r.click();
          window.__findStill = { a, b: at(), n: STUFF.filters.length };
          return true;
        };
        if (!run()) setTimeout(run, 150);
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
    /* IT OPENS ON ONE QUESTION NOW — "who is the account for?" — with the boxes under it not yet
       shown; the walk after 273 found a parent made a student because nobody asked. So the sheet as it
       opens is the two answers, and the two states after this one are the form each answer draws. */
    /* `offsetHeight`, NOT `getBoundingClientRect`, IN BOTH EXPECTATIONS BELOW. The sheet opens with a
       scale from the card it came from (`#sheet`'s transition), and a bounding box is measured through
       that transform — so on a loaded machine `check/press.js`, which looks 340ms after entering,
       caught the boxes mid-grow at under 44px and reported the state as never arrived. Layout height is
       what "is it drawn at full size" means; the tap sizes themselves are `check/ui.js`'s to measure. */
    { name: 'making an account',
      only: () => typeof USER !== 'undefined' && !USER,
      enter: () => {
        const tile = document.querySelector('#s-account [data-do="register"]');
        if (!tile) throw new Error('no Make an account tile on the signed-out account column');
        ACTIONS['register'](tile);
      },
      expect: () => {
        const who = [...document.querySelectorAll('#sheet-body [data-do="reg-who"]')]
          .filter(b => b.offsetHeight >= 44).length;
        const rest = document.getElementById('reg-rest');
        return who === 2 && rest && rest.hidden ? 2 : 0;
      },
      wants: 'the register sheet open on its question: two 44px answers and nothing else yet',
      leave: () => { closeSheet(); } },
    /* ---------- AND ANSWERED "A PARENT" ------------------------------------------------------------
       The form a parent fills: the two names on one row, their own email, a PIN, the button and the
       note saying where their child's account is made — and no grown-up's-email tick, which is a
       student's. 320x568 is where the note ran under the fold before the names shared a row. */
    { name: 'making an account as a parent',
      only: () => typeof USER !== 'undefined' && !USER,
      enter: () => {
        const tile = document.querySelector('#s-account [data-do="register"]');
        if (!tile) throw new Error('no Make an account tile on the signed-out account column');
        ACTIONS['register'](tile);
        const b = document.querySelector('#sheet-body [data-do="reg-who"][data-who="parent"]');
        if (!b) throw new Error('the register sheet does not ask who the account is for');
        ACTIONS['reg-who'](b);
      },
      expect: () => {
        const boxes = ['reg-first', 'reg-last', 'reg-email', 'reg-pin']
          .filter(id => { const el = document.getElementById(id); return el && el.offsetHeight >= 44; }).length;
        const send = document.querySelector('#sheet-body [data-do="reg-send"]');
        const tick = document.getElementById('reg-noemail');
        return boxes === 4 && send && send.offsetHeight >= 44
          && tick && tick.closest('.reg-kid').hidden ? 5 : 0;
      },
      wants: 'the register sheet answered "a parent": four boxes, its button, and no grown-up\'s-email tick',
      leave: () => { closeSheet(); } },
    /* ---------- AND WITH "I HAVE NO EMAIL" TICKED ----------------------------------------------------
       *"so all kids can login easily with their handle and pin."* The tick is a `.check` row inside the
       sheet, between the email box and the PIN — the one line on the form a child with no address
       reads — so it is measured ticked at four widths: the label is the longest line on the sheet and
       320 is where it would wrap under its box. */
    { name: 'making an account with no email of your own',
      only: () => typeof USER !== 'undefined' && !USER,
      enter: () => {
        const tile = document.querySelector('#s-account [data-do="register"]');
        if (!tile) throw new Error('no Make an account tile on the signed-out account column');
        ACTIONS['register'](tile);
        /* A STUDENT'S TICK — the question is answered first, or the row is not drawn at all. */
        const b = document.querySelector('#sheet-body [data-do="reg-who"][data-who="student"]');
        if (!b) throw new Error('the register sheet does not ask who the account is for');
        ACTIONS['reg-who'](b);
        const tick = document.getElementById('reg-noemail');
        if (!tick) throw new Error('the register sheet has no no-email tick');
        tick.checked = true;
      },
      expect: () => {
        const tick = document.getElementById('reg-noemail');
        const row = tick && tick.closest('label.check');
        const r = row && row.getBoundingClientRect();
        return tick && tick.checked && r && r.height >= 44 && !!document.getElementById('reg-email') ? 1 : 0;
      },
      wants: 'the register sheet with the no-email tick ticked, a whole 44px row under the email box',
      leave: () => { closeSheet(); } },
    /* ---------- SIGNING IN ON A SHARED iPAD -------------------------------------------------------------
       *"the logging in and everything feels so janky and unresponsive and slow… i feel very insecure when
       signing into the kids accounts"* (docs/history/296). Three pictures of the card nobody signed in
       sees: the handles this device has signed in as chips, Sign in pressed and waiting, and a wrong PIN
       — the box emptied, focused and edged red. `api` answers `verifyLogin` for the length of the state
       (never, or with the server's wrong-PIN refusal) and is put back. */
    { name: 'the handles signed in on this device, as chips',
      only: () => typeof USER !== 'undefined' && !USER,
      enter: () => {
        localStorage.setItem('familyHandles', JSON.stringify(['ada_kind7', 'maximilian_steady42']));
        paint('account'); paintPager('account', true); goPage('account', 0, true);
      },
      expect: () => {
        const b = [...document.querySelectorAll('#s-account .hchip button')];
        return b.length === 4 && b.every(x => x.offsetHeight >= 44) ? 4 : 0;
      },
      wants: 'two remembered handles as chips over the email box, each with its \u2715, every one a 44px target',
      leave: () => { try { localStorage.removeItem('familyHandles'); } catch (e) {} paint('account'); paintPager('account', true); } },
    { name: 'signing in, waiting for the answer',
      only: () => typeof USER !== 'undefined' && !USER,
      enter: () => {
        const n = document.getElementById('in-name'), p = document.getElementById('in-pin');
        if (!n || !p) throw new Error('no sign-in card on the signed-out account column');
        window.__siApi = api;
        api = (b, o) => (b && b.action === 'verifyLogin') ? new Promise(() => {}) : window.__siApi(b, o);
        n.value = 'ada_kind7'; p.value = '4826';
        ACTIONS['do-signin'](document.querySelector('#s-account [data-do="do-signin"]'));
      },
      expect: () => {
        const t = document.querySelector('#s-account [data-do="do-signin"]');
        const p = document.getElementById('in-pin');
        return !!t && t.classList.contains('is-busy') && !!p && p.disabled;
      },
      wants: 'Sign in pressed and waiting: its ring turning, the boxes locked and still readable',
      leave: () => { if (window.__siApi) api = window.__siApi; paint('account'); paintPager('account', true); } },
    { name: 'a wrong PIN, the box emptied and edged red',
      only: () => typeof USER !== 'undefined' && !USER,
      enter: () => {
        const n = document.getElementById('in-name'), p = document.getElementById('in-pin');
        if (!n || !p) throw new Error('no sign-in card on the signed-out account column');
        window.__wpApi = api;
        api = (b, o) => (b && b.action === 'verifyLogin')
          ? Promise.resolve({ success: false, why: 'wrong-pin', error: 'Wrong PIN for that handle.' })
          : window.__wpApi(b, o);
        n.value = 'ada_kind7'; p.value = '1239';
        ACTIONS['do-signin'](document.querySelector('#s-account [data-do="do-signin"]'));
      },
      expect: () => {
        const p = document.getElementById('in-pin');
        return !!p && p.value === '' && p.getAttribute('aria-invalid') === 'true' && document.activeElement === p;
      },
      wants: 'the PIN box emptied, focused and edged in --bad after a wrong PIN, the handle kept',
      leave: () => {
        if (window.__wpApi) api = window.__wpApi;
        const p = document.getElementById('in-pin');
        if (p) { p.removeAttribute('aria-invalid'); p.blur(); }
        paint('account'); paintPager('account', true);
      } },
    /* ---------- A CHILD WITH NO HANDLE, ON AN ADMIN'S PEOPLE COLUMN ------------------------------------
       The card says "no handle yet" where the handle goes, and carries New PIN beside Message. Seeded
       into `DATA.everyone`, which the fixture does not carry, because the admin's list is built only
       for an admin's token. */
    { name: 'a child with no handle yet, and New PIN',
      only: () => typeof USER !== 'undefined' && !!USER && typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        window.STATE_EVERY_WAS = DATA.everyone;
        DATA.everyone = [{ personId: 'P-STATE-KID', title: 'Kit Handleless', handle: '', role: 'Student', image: '' }];
        paint('account');
        const at = [...document.querySelectorAll('#s-account .page')]
          .findIndex(pg => pg.querySelector('[data-do="kid-pin"][data-id="P-STATE-KID"]'));
        if (at < 0) throw new Error('no New PIN tile for the seeded child on the admin\'s column');
        goPage('account', at, true);
      },
      leave: () => {
        if (window.STATE_EVERY_WAS === undefined) delete DATA.everyone; else DATA.everyone = window.STATE_EVERY_WAS;
        delete window.STATE_EVERY_WAS;
        paint('account');
      },
      expect: () => {
        const pg = document.querySelector('#s-account .page.on');
        return pg && /no handle yet/.test(pg.textContent)
          && pg.querySelector('.tile[data-do="kid-pin"]') && pg.querySelector('.tile[data-do="msg-open"]') ? 2 : 0;
      },
      wants: '"no handle yet" on the card, and New PIN beside Message as tiles' },
    /* ---------- A NEW PIN, SHOWN ONCE ------------------------------------------------------------------
       The sheet New PIN ends in: the paper slip with the handle and the six digits, and Done. Drawn the
       way `kid-pin-go` draws it — `pinSlip_` into the sheet — so the measuring pass sees the slip at 320
       without posting a reset to anybody. */
    { name: 'a new PIN, shown once',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        openSheet('A new PIN for Kit', pinSlip_('Kit', 'kit_upright42', ['4', '8', '2', '9', '1', '3'].join(''))
          + '<p class="faint">Write it down or read it to them — it is not shown again.</p>'
          + '<button class="btn quiet" data-do="sheet-done">Done</button>');
      },
      expect: () => {
        const slip = document.querySelector('#sheet-body .pin-slip');
        return slip && slip.querySelectorAll('.pin-slip-v').length === 2
          && slip.scrollWidth <= slip.clientWidth + 1 ? 2 : 0;
      },
      wants: 'the paper slip in the sheet: the handle and the PIN, neither running off the slip',
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
    /* ---------- A QUALIFICATION, WRITTEN LIKE AN ISOTOPE — see `profQualChip_` in cards.js ---------
       *"for the qualifications bit, should be for example Maths subscript to it is grade and super
       script is the level."* `check-flow` reads the markup; what it cannot read is whether the CSS
       STACKS it — the level over the grade, sharing an x, on the subject's right, inside the pill and
       without making the pill taller than the chips beside it. So this seeds a tutor with every case
       (both halves, a level alone, a grade alone, still studying, a long subject, a certificate) in
       the server's own shape, and measures each chip in the browser at every width — which also puts
       the notation's contrast and the row's sideways scroll in front of `check/ui.js`. Put back after,
       the page included, for the reason the state above gives. */
    { name: 'a tutor\'s qualifications, written like isotopes',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.__ISO_HELD = (DATA.tutors || []).slice();
        window.__ISO_AT = PAGE.account || 0;
        const P = (subject, level, grade, board, received, kind) => ({ subject, level, grade, board, received, kind: kind || 'subject' });
        const parts = [P('Maths', 'A-Level', 'B', 'Edexcel', '2019'), P('English', 'GCSE', '7', 'Hill Top School', '2016'),
                       P('Maths', 'GCSE', '9', 'Hill Top School', '2017'), P('Physics', 'AS', '', '', ''),
                       P('Chemistry', '', 'A', '', ''), P('Theology', 'Degree', '', 'UWTSD', 'Present'),
                       P('English Language and Literature', "Master's degree", 'Distinction', 'University of Warwick', '2022'),
                       P('PGCE', '', '', 'Institute of Education', '2021', 'cert'), P('DBS', 'Enhanced', '', '', '', 'cert')];
        /* `teachesSpec` IS SET HERE AND NOT BORROWED FROM THE FIXTURE'S TUTOR: the gap below is measured
           against a Teaches chip on the same card, and a fixture edited to teach nothing would turn that
           comparison into a silent pass. */
        DATA.tutors = (DATA.tutors || []).concat([Object.assign({}, (DATA.tutors || [])[0] || {},
          { personId: 'P-iso', handle: 'iso', title: 'Iso Notation', listed: true, qualsParts: parts,
            teachesSpec: ['Maths (GCSE)'],
            quals: parts.map(p => [p.subject, p.level, p.grade && 'grade ' + p.grade].filter(Boolean).join(' ')) })]);
        paint('account');
        const n = accountPages_().findIndex(h => /Iso Notation/.test(h));
        if (n < 0) throw new Error('the seeded tutor is not on the account column');
        goPage('account', n, true);
      },
      expect: () => {
        const pg = [...document.querySelectorAll('#s-account .page')].find(p => /Iso Notation/.test(p.textContent));
        const row = pg && pg.querySelector('.prof-quals');
        if (!row) return 0;
        const box = el => el.getBoundingClientRect();
        const chips = [...row.querySelectorAll('.prof-tag')];
        const plain = chips.filter(c => !c.querySelector('.prof-iso'));
        const iso = chips.filter(c => c.querySelector('.prof-iso'));
        if (iso.length !== 7 || plain.length !== 2) return 0;
        const tall = box(plain[0]).height;
        /* THE SAME AIR AS THE TEACHES LEVEL. The brief said match the Teaches chips, and the first build
           put the stack 1.75px from its subject where the Teaches level sits 4.69px from its own — on one
           card, two notations at two distances. Measured from the subject's last letter to the first
           thing raised, on each kind of chip; no Teaches chip at all is a failure, not a pass. */
        const gapOf = (subjectNode, notation) => {
          const r = document.createRange(); r.selectNodeContents(subjectNode);
          return box(notation).left - r.getBoundingClientRect().right;
        };
        const tc = [...pg.querySelectorAll('.prof-teach:not(.prof-quals) .prof-tag')].find(c => c.querySelector('.prof-lv span'));
        if (!tc || !tc.firstChild) return 0;
        const teachGap = gapOf(tc.firstChild, tc.querySelector('.prof-lv span'));
        const ok = iso.every(c => {
          const b = box(c), st = c.querySelector('.prof-iso'), s = box(st);
          const up = st.querySelector('sup'), dn = st.querySelector('sub');
          /* THE SUBJECT'S LAST LETTER, by a range over its own text, so "on its right" is measured
             against the word and not against the pill. */
          const word = c.querySelector('.prof-q-end').firstChild;
          const r = document.createRange(); r.selectNodeContents(word);
          const w = r.getBoundingClientRect();
          /* "UP" AND "DOWN" AGAINST THE WORD'S OWN LINE, not the pill's middle: a long subject that
             wraps at 320 puts the pill's middle between its two lines. */
          const mid = w.top + w.height / 2;
          const stacked = up && dn ? box(up).bottom <= box(dn).top + 0.5 && Math.abs(box(up).left - box(dn).left) < 0.5
            : up ? box(up).top + box(up).height / 2 < mid - 1
            : dn ? box(dn).top + box(dn).height / 2 > mid + 1 : false;
          /* ONE LINE OF TEXT IS ONE PLAIN PILL TALL. A subject long enough to wrap is taller because
             of its words, which is not what is being asked; the stack must still sit beside its last
             word — the same line — and inside the pill. */
          const head = c.firstChild && c.firstChild.nodeType === 3 ? c.firstChild : null;
          let wrapped = false;
          if (head) {
            const hr = document.createRange(); hr.selectNodeContents(head);
            wrapped = [...hr.getClientRects()].some(x => x.width > 0 && Math.abs(x.top - w.top) > w.height / 2);
          }
          return stacked && s.left >= w.right - 0.5 && Math.abs((s.top + s.bottom) / 2 - mid) < w.height
            && Math.abs(gapOf(word, st) - teachGap) < 0.5
            && (wrapped || Math.abs(b.height - tall) < 0.6)
            && s.top >= b.top - 0.5 && s.bottom <= b.bottom + 0.5;
        });
        return ok ? iso.length : 0;
      },
      wants: 'each qualification\'s level over its grade on the subject\'s right, as far from it as a Teaches level is from its own, inside a pill no taller than a plain one',
      leave: () => {
        if (window.__ISO_HELD) DATA.tutors = window.__ISO_HELD;
        paint('account');
        goPage('account', window.__ISO_AT || 0, true);
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
    /* ---------- YOUR OWN CARD WHILE YOUR EMAIL IS UNPROVED ---------------------------------------------
       The PR #130 review: `notify` sends a PENDING address nothing, and nothing on the phone said so —
       a parent whose link went to spam booked and heard nothing. Now a line under your own card says
       the mail waits for the link, with "Send the link again" beside Sign out. `pendingEmail` is a key
       of the sign-in reply the fixture visitor does not carry, so it is set here, and the address is a
       long one with no space in it on purpose: it is the widest thing on the line. */
    { name: 'your own card, your email not confirmed yet',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.__PENDING_WAS = USER.pendingEmail;
        USER.pendingEmail = 'philippa.parentington-smythe.family@example.org';
        paint('account');
        goPage('account', 0, true);
      },
      expect: () => {
        const pg = document.querySelector('#s-account .page.on');
        const line = pg && pg.querySelector('.mail-held');
        return line && /philippa\.parentington-smythe\.family@example\.org/.test(line.textContent)
          && pg.querySelectorAll('[data-do="resend-link"]').length === 1
          && line.scrollWidth <= line.clientWidth + 1 ? 2 : 0;
      },
      wants: 'the line under your own card naming the address, whole and not running off it, and one "Send the link again"',
      leave: () => { USER.pendingEmail = window.__PENDING_WAS; repaint(true); } },
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
    /* ---------- YOUR CHILD'S ACCOUNT, MADE: THE SLIP ON THE CARD -----------------------------------------
       *"so all kids can login easily with their handle and pin."* After "Make their account" the card
       grows a paper slip with the handle and the PIN, held as `KID_MADE` for the signed-in parent. The
       admin visitor holds the role the card is for, so it is drawn; the slip is set straight into the
       state, as `kid-make` sets it, and the page holding the card is turned to. */
    { name: 'your child\'s account, made',
      only: () => typeof USER !== 'undefined' && !!USER && typeof mayAddChild_ === 'function' && mayAddChild_(),
      enter: () => {
        KID_MADE = { pid: String(USER.personId || ''), name: 'Maximilian', handle: 'maximilian_steady42',
                     pin: ['0', '7', '3', '9'].join('') };
        /* A FORM LEFT UNSAVED OR SENDING BY WHATEVER RAN BEFORE -- `check/press.js` presses every Save
           on this column first -- makes `paint` keep the column rather than throw typing away
           (`settingsKeep_`), so the slip was set and never drawn: "did not arrive" in the full suite,
           green alone. Cleared as the photographs state below clears them. */
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')].findIndex(pg => pg.querySelector('.kid-make'));
        if (at < 0) throw new Error('no "Make your child\'s account" card on the settings column');
        goPage('settings', at, true);
      },
      leave: () => { KID_MADE = { pid: '', name: '', handle: '', pin: '' }; paint('settings'); },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        const slip = pg && pg.querySelector('.kid-make .pin-slip');
        return slip && slip.querySelectorAll('.pin-slip-v').length === 2
          && pg.querySelectorAll('.kid-make [data-kid-new]').length === 3
          && slip.scrollWidth <= slip.clientWidth + 1 ? 2 : 0;
      },
      wants: 'the make card with its three boxes, and the slip: the handle and the PIN, neither running off it' },
    /* ---------- AND HELD FOR THE LINK: A PARENT WHOSE OWN ADDRESS NOBODY HAS PROVED ------------------------
       The PR #130 review: no child is put on an account until its address is confirmed (`confirmFirst_`
       in people.gs), so a PENDING parent's Settings draws ONE card where the two child forms would be —
       the sentence and "Send the link again". Seeded through `USER.pendingEmail`, which the sign-in reply
       carries and the fixture visitor does not, with a long address that has no space in it. */
    { name: 'your child\'s account, held for the link',
      only: () => typeof USER !== 'undefined' && !!USER && typeof mayAddChild_ === 'function' && mayAddChild_(),
      enter: () => {
        window.__PENDING_WAS = USER.pendingEmail;
        USER.pendingEmail = 'philippa.parentington-smythe.family@example.org';
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')].findIndex(pg => pg.querySelector('.kid-held'));
        if (at < 0) throw new Error('no held "Make your child\'s account" card on the settings column');
        goPage('settings', at, true);
      },
      /* `repaint(true)`: one page becomes two again, so the column is placed afresh — see the family state. */
      leave: () => { USER.pendingEmail = window.__PENDING_WAS; repaint(true); },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        const card = pg && pg.querySelector('.kid-held');
        return card && /philippa\.parentington-smythe\.family@example\.org/.test(card.textContent)
          && card.querySelectorAll('[data-do="resend-link"]').length === 1
          && !document.querySelector('#s-settings [data-kid-new], #s-settings [data-kid]')
          && card.scrollWidth <= card.clientWidth + 1 ? 2 : 0;
      },
      wants: 'one card naming the address to open the link from, with "Send the link again", and no child form anywhere on the column' },
    /* ---------- A NEW ADDRESS WAITING FOR ITS LINK, ON THE CONTACT CARD ----------------------------------
       Round three of the PR #130 review: a new address typed in Settings is not written until the account,
       signed in, opens the link sent to it (`authMove*_` in booking.gs). The box keeps the waiting address,
       a line under the row names both — the new one and the one that still signs in — and "Send the link
       again" sits beside Save. Seeded through `USER.profile.email_moving`, which `profileOf_` sends and the
       fixture visitor does not, with two long addresses that have no space in them. */
    { name: 'your new email, waiting for its link',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.__MOVING_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, {
          email: 'philippa.parentington-smythe.family@example.org',
          email_moving: 'philippa.parentington-smythe.newaddress@example.org' });
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')].findIndex(pg => pg.querySelector('.mail-moving'));
        if (at < 0) throw new Error('no Contact card saying a new address waits for its link');
        goPage('settings', at, true);
      },
      leave: () => { USER.profile = window.__MOVING_WAS; repaint(true); },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        const note = pg && pg.querySelector('.mail-moving');
        const box = pg && pg.querySelector('[data-me="email"]');
        return note && /newaddress@example\.org/.test(note.textContent) && /family@example\.org/.test(note.textContent)
          && box && box.value === 'philippa.parentington-smythe.newaddress@example.org'
          && pg.querySelectorAll('[data-do="resend-link"]').length === 1
          && note.scrollWidth <= note.clientWidth + 1 ? 2 : 0;
      },
      wants: 'the Contact card with the waiting address in its box, a line naming both addresses whole, and one "Send the link again"' },
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
          && (pg.querySelector('[data-biz="pub_liability"][data-k="reference"]') || {}).value === 'PL-000000'
          /* AND EACH ROW'S TWO BOXES ARE ONE WIDTH. The row is `.lib-row.q-row`, a class pair borrowed
             from the qualification editor — and when that editor was redrawn, its `.lib-row.q-row` rule
             went with it and these rows fell back to `.lib-row`'s wide box beside a 7rem one, with
             nothing here to notice. The rule is back, and this is what says so. */
          && [...pg.querySelectorAll('.biz-item .lib-row')].every(r => {
            const w = [...r.children].map(c => c.getBoundingClientRect().width);
            return w.length === 2 && w[0] > 0 && Math.abs(w[0] - w[1]) <= 1;
          });
      },
      wants: 'three insurance items, each with its date box, the one due soon flagged, and each row\'s two boxes one width' },

    /* ==============================================================================================
       THREE WIDGETS WAITING ON A REAL REQUEST, HELD, AND THEN LET GO

       THE OWNER, 9 Oct: *"Every widget has unique loading look. They should all have a simplistic
       simple loading thing while it's info or whatever is loading."* `loading_()` (shell.js) is that
       thing now, and these are the states that put it on the screen where `check/ui.js` can measure
       it: the business records (`listRecords`, a POST), the Videos card (`data/videos.json`, a file)
       and the camera (`getUserMedia`, the device). Each is HELD — the request is made by the app's
       own code and its answer kept back — so what is measured is the wait the app really draws,
       not a picture of one.

       `release` LETS IT GO, and `landed` says the content has arrived. `check/ui.js` measures the
       loader while it is held (one box, the same size on every card, centred), takes the card's
       height, releases, waits for `landed`, and takes it again: a loader that holds its room leaves
       the card the height it was. `leave` puts back what was there before and DROPS the held answer
       rather than delivering it — `check/press.js` never releases, and an answer arriving after the
       state has gone would land in the middle of the next one.

       THESE ARE THE KIND THAT HOLDS THE CARD — the loader drawn OVER what is already there, which is
       the only kind that can: a verse or a list whose length is not known until it lands is drawn
       where it lands, and the card is the size of what came. */
    { name: 'the business records still coming',
      only: () => typeof USER !== 'undefined' && !!USER && isAdmin(),
      enter: () => {
        const held = window.__bizHeld = { list: BIZ.list, fetch: window.fetch, go: null };
        const real = held.fetch;
        window.fetch = (url, o) => {
          let act = '';
          try { act = JSON.parse((o && o.body) || '{}').action; } catch (e) {}
          if (act !== 'listRecords') return real(url, o);
          return new Promise(r => {
            held.go = () => r(new Response(JSON.stringify({ success: true, records: [{
              id: 'pub_liability', title: 'Public liability insurance', category: 'Insurance',
              provider: 'Example Insure', reference: 'PL-000000', due_on: '2031-01-01' }] }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }));
          });
        };
        BIZ.list = null; BIZ.error = ''; BIZ.asking = false;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('[data-biz-page="Insurance"]'));
        if (at < 0) throw new Error('no business-records page on the settings column');
        goPage('settings', at, true);
        bizStart_();
      },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        const body = pg && pg.querySelector('.biz-body[aria-busy="true"]');
        return !!body && pg.querySelectorAll('.loading').length === 1 && !!body.querySelector(':scope > .loading')
          && !!body.querySelector('input[data-biz="pub_liability"][data-k="reference"]');
      },
      wants: 'the Insurance card\'s boxes drawn and under the one loader while listRecords is held',
      release: () => { const h = window.__bizHeld; if (h && h.go) { h.go(); h.go = null; } },
      landed: () => {
        const pg = document.querySelector('#s-settings .page.on');
        return !!pg && !pg.querySelector('.loading')
          && (pg.querySelector('[data-biz="pub_liability"][data-k="reference"]') || {}).value === 'PL-000000';
      },
      leave: () => {
        const h = window.__bizHeld;
        if (h) { window.fetch = h.fetch; BIZ.list = h.list; BIZ.asking = false; }
        delete window.__bizHeld;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        /* NOTHING WAS THERE BEFORE EITHER: ask again, on the real wire, rather than leave five cards
           drawn waiting with nothing on its way to end it. */
        if (!BIZ.list) bizStart_();
      } },

    /* ---------- THE WEEKLY PARENT EMAIL: ITS CARD, AND WHAT PREVIEW OPENS ----------------------------
       The infrastructure for *"something which triggers every sunday"* and emails parents — built and
       switched off (backend/digest.gs, js/digest.js). The card is the last page of an admin's Settings.
       The preview is drawn from a reply shaped the way `digestPreviewOut_` answers, with an address
       long enough that it has to wrap at 320, rather than by posting: the fixture is one payload and
       has no `digestPreview` to answer with. */
    { name: 'the weekly parent email card',
      only: () => typeof USER !== 'undefined' && !!USER && isAdmin(),
      enter: () => {
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')].findIndex(pg => pg.querySelector('.card.digest'));
        if (at < 0) throw new Error('no weekly parent email card on the settings column');
        goPage('settings', at, true);
      },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        return !!pg && /Weekly parent email:\s*(Off|Preview|Send)/.test((pg.querySelector('.digest-mode') || {}).textContent || '')
          && !!pg.querySelector('.tile-row [data-do="digest-preview"]');
      },
      wants: 'the mode in its title and one Preview tile' },
    { name: 'the weekly parent email, previewed',
      only: () => typeof USER !== 'undefined' && !!USER && isAdmin(),
      enter: () => {
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings .page')].findIndex(pg => pg.querySelector('.card.digest'));
        if (at < 0) throw new Error('no weekly parent email card on the settings column');
        goPage('settings', at, true);
        /* THE BODY AS `digestRender_` WRITES IT SINCE 8 OCT: a paper's heading, the scene its parts share
           once (cut to DIGEST_STEM_SHOWN), each part with its own ask — the longest lines the sheet is
           ever handed — and a paper with no words as its line of numbers. */
        const body = 'Hello Pat,\n\nThis week (28 Sep – 4 Oct, up to 6pm on Sunday) Ada worked on 4 questions — 3 new and 1 gone back to.\n\n'
          + 'Maths · Paper 1 (Calculator) — June 2024\nQ1, Q7 (again)\n\n'
          + 'Maths · Paper 3 (Calculator) — November 2023 (Higher)\n'
          + 'Here is some information about the 120 students in Year 11 at a school, who were each asked which of three after-school clubs they go to; 47 go to the chess club, 38 go to the drama club and the rest go to the football club, and no student goes to more than one club…\n'
          + 'Q14a: A student is chosen at random from the 120. Work out the probability that the student goes to the drama club, giving your answer as a fraction in its simplest form.\n'
          + 'Q14b: Two students are chosen at random without replacement. Work out the probability that both go to the chess club. (picture on the site)\n\n'
          + 'Ada can see them on the site: https://halexdias31-pixel.github.io/family/\n\n'
          + 'You get this because you are Ada’s parent on @family. To stop these emails, reply to this one and say so.';
        openSheet('Weekly parent email', digestSheet_({ success: true, mode: 'preview', hour: 18, scheduled: 0, words: true,
          week: { start: '2026-09-28', end: '2026-10-04', span: '28 Sep – 4 Oct' },
          emails: [{ learner: 'Ada Pupil', parent: 'Pat Parent', to: 'pat.parent.with.a.long.address@example.org',
                     subject: 'Ada’s week: 4 questions', text: body, html: '', count: 4 }],
          unreachable: [{ id: 'P-S3', name: 'Cal Alone', count: 1, why: 'no parent has accepted a link to them' }] }));
      },
      leave: () => { if (typeof closeSheet === 'function') closeSheet(); },
      expect: () => {
        const t = (document.getElementById('sheet-body') || {}).textContent || '';
        return /To Pat Parent/.test(t) && /Ada’s week: 4 questions/.test(t) && /Q14a: A student is chosen at random/.test(t)
          && /Nobody to tell/.test(t);
      },
      wants: 'each email under its address, its plain body with each question’s words, and who nobody can tell' },

    /* ---------- THE QUALIFICATIONS: ONE LINE A QUALIFICATION, AND IT FITS ---------------------------
       ASKED FOR AS *"can you make the qualifications widget more efficient, elegant, intuitive and take
       up less space."* Measured before: seven qualifications were 900px at 320x568 — drawn at 70%,
       the floor, and still scrolling. What this asserts, at every width, is the shape and the DATA
       CONTRACT under it:
       - all seventy `qual_*` boxes in the form, drawn or not, because `qualsIn` rebuilds the person's
         rows from what arrives and a slot missing from the form is a qualification deleted on Save;
       - one line a qualification, each subject named once, the level over the grade in the profile
         chip's own `.prof-iso`, and the DBS written plain;
       - Teach and Can teach as HIDDEN TRUE/FALSE boxes, no checkbox and no glyph to decode;
       - one `+` tile and no Save — every answer saves itself;
       - AND THE CARD FITS ITS PANE AT FULL SIZE: its own height (a zoomed card's `clientHeight` is
         still its height at zoom 1) is no more than the pane's. That is the "less space", as a number
         this file can fail on, rather than as a screenshot somebody has to remember to take.
       FOUND BY ASKING THE DOM for the tenth slot's place box, which exists whether or not it shows. */
    { name: 'the qualifications',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        /* THREE SUBJECTS AT TWO LEVELS AND AN ENHANCED DBS, through `USER.profile`, which is what the
           column is drawn from — the tutor the redesign was measured with. Written out in each state
           rather than shared, because a state is sent to the page as source. */
        window.STATE_QUAL_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, {
          qual_1: 'Maths', qual_1_level: 'GCSE', qual_1_grade: '9', qual_1_board: 'Hill Top School', qual_1_received: '2016',
          qual_1_teach: 'TRUE', qual_1_spec: 'TRUE',
          qual_2: 'Maths', qual_2_level: 'A-Level', qual_2_grade: 'A*', qual_2_board: 'Hill Top Sixth Form', qual_2_received: '2018',
          qual_2_teach: 'TRUE', qual_2_spec: 'TRUE',
          qual_3: 'Physics', qual_3_level: 'GCSE', qual_3_grade: '8', qual_3_received: '2016', qual_3_teach: 'TRUE',
          qual_4: 'Physics', qual_4_level: 'A-Level', qual_4_grade: 'A', qual_4_board: 'Hill Top Sixth Form', qual_4_received: '2018',
          qual_4_teach: 'TRUE',
          qual_5: 'English Literature', qual_5_level: 'GCSE', qual_5_grade: '7', qual_5_received: '2016',
          qual_6: 'English Literature', qual_6_level: 'A-Level', qual_6_grade: 'B', qual_6_received: '2018',
          qual_7: 'DBS', qual_7_level: 'Enhanced', qual_7_received: '2025' });
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
        const lines = [...shelf.querySelectorAll('.q-list .q-line')];
        const flags = [...shelf.querySelectorAll('[data-me$="_spec"], [data-me$="_teach"]')];
        const card = shelf.closest('.card'), pane = shelf.closest('.pane');
        return pg.querySelectorAll('[data-me^="qual_"]').length === 70
          && pg.querySelectorAll('[data-do="me-save"]').length === 0
          && lines.length === 7
          && lines.map(l => l.querySelector('.q-who').textContent.trim()).filter(Boolean).join('|') === 'Maths|Physics|English Literature|DBS'
          && shelf.querySelectorAll('.q-list .prof-iso sup + sub').length === 6
          && (lines[6].querySelector('.q-plain') || {}).textContent === 'Enhanced'
          && shelf.querySelectorAll('.q-list .q-chip').length === 2
          && !shelf.querySelector('input[type="checkbox"]')
          && flags.length === 20 && flags.every(b => b.type === 'hidden')
          && !/[✓★▸▾✕]/.test(shelf.textContent)
          && shelf.querySelectorAll('.tile[data-do="qual-add"]').length === 1
          && !shelf.querySelector('.is-open')
          && !!card && !!pane && card.clientHeight <= pane.clientHeight
          ? 70 : 0;
      },
      wants: 'seven qualifications as seven lines in the profile chip\'s notation, each subject once, one + tile, Teach as hidden boxes, and the card at full size inside its pane' },
    /* AND THE PHYSICS A-LEVEL OPEN, through a tap on its own line. One thing open, in place — every
       other line still on the card — the three-way control with `Can teach` lit (that is what it
       holds), every box captioned, `Still studying` offered in Finished, and the tick and the bin at
       opposite ends of their row. */
    { name: 'the qualifications, one line open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        /* THREE SUBJECTS AT TWO LEVELS AND AN ENHANCED DBS, through `USER.profile`, which is what the
           column is drawn from — the tutor the redesign was measured with. Written out in each state
           rather than shared, because a state is sent to the page as source. */
        window.STATE_QUAL_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, {
          qual_1: 'Maths', qual_1_level: 'GCSE', qual_1_grade: '9', qual_1_board: 'Hill Top School', qual_1_received: '2016',
          qual_1_teach: 'TRUE', qual_1_spec: 'TRUE',
          qual_2: 'Maths', qual_2_level: 'A-Level', qual_2_grade: 'A*', qual_2_board: 'Hill Top Sixth Form', qual_2_received: '2018',
          qual_2_teach: 'TRUE', qual_2_spec: 'TRUE',
          qual_3: 'Physics', qual_3_level: 'GCSE', qual_3_grade: '8', qual_3_received: '2016', qual_3_teach: 'TRUE',
          qual_4: 'Physics', qual_4_level: 'A-Level', qual_4_grade: 'A', qual_4_board: 'Hill Top Sixth Form', qual_4_received: '2018',
          qual_4_teach: 'TRUE',
          qual_5: 'English Literature', qual_5_level: 'GCSE', qual_5_grade: '7', qual_5_received: '2016',
          qual_6: 'English Literature', qual_6_level: 'A-Level', qual_6_grade: 'B', qual_6_received: '2018',
          qual_7: 'DBS', qual_7_level: 'Enhanced', qual_7_received: '2025' });
        /* A CLEAN COLUMN FIRST — see the agreement state above. */
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const pages = [...document.querySelectorAll('#s-settings .page')];
        const at = pages.findIndex(pg => pg.querySelector('[data-me="qual_10_board"]'));
        if (at < 0) throw new Error('no qualifications page on the settings column');
        goPage('settings', at, true);
        /* AND THE PHYSICS A-LEVEL OPENED THROUGH ITS OWN LINE. */
        const slot = [...pages[at].querySelectorAll('.q-list .q-slot')].find(sl =>
          (sl.querySelector('[data-me$="_level"]') || {}).value === 'A-Level'
          && (sl.querySelector('select.q-name') || {}).value === 'Physics');
        if (!slot) throw new Error('no Physics A-Level line on the qualifications page');
        slot.querySelector('.q-line').click();
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
        const open = [...shelf.querySelectorAll('.q-slot.is-open')];
        const ed = open[0] && open[0].querySelector(':scope > .q-ed');
        const visible = el => !!(el.offsetWidth || el.offsetHeight);
        const tick = ed && ed.querySelector('.tile[data-do="qual-done"]'), bin = ed && ed.querySelector('.tile[data-do="qual-drop"]');
        return open.length === 1 && !!ed && visible(ed)
          && open[0].querySelector('.q-line').getAttribute('aria-expanded') === 'true'
          && [...shelf.querySelectorAll('.q-list .q-line')].length === 7
          && [...shelf.querySelectorAll('.q-list .q-line')].every(visible)
          && ed.querySelectorAll('[data-do="qual-teach"]').length === 3
          && (ed.querySelector('[data-do="qual-teach"][aria-pressed="true"]') || {}).dataset.v === 'teach'
          && ed.querySelectorAll('label.field').length === 5
          && [...ed.querySelectorAll('label.field')].every(l => !!(l.querySelector(':scope > span') || {}).textContent)
          && [...ed.querySelectorAll('select[data-me$="_received"] option')].some(o => o.textContent === 'Still studying' && o.value === 'Present')
          && !!tick && !!bin && bin.getBoundingClientRect().left - tick.getBoundingClientRect().right > 60
          ? 1 : 0;
      },
      wants: 'the Physics A-Level open in place under its line, the other six lines still there, five captioned boxes, Can teach lit, and the tick and the bin at opposite ends' },
    /* AND THE DBS OPEN — A CERTIFICATE'S EDITOR. *Walked at 390:* it offered Grade and Teach / Can teach /
       Not teaching, neither of which a certificate has, and Teach would have listed the DBS under Teaches
       on the profile. Now: no grade, no three-way control, the year and the issuer side by side under
       their certificate captions, and the tick and the bin. Mutation: `.is-cert` off the slot — the grade
       and the control come back, and the issuer drops to a row of its own. */
    { name: 'the qualifications, a certificate open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_QUAL_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, {
          qual_1: 'Maths', qual_1_level: 'GCSE', qual_1_grade: '9', qual_1_board: 'Hill Top School', qual_1_received: '2016',
          qual_1_teach: 'TRUE', qual_1_spec: 'TRUE',
          qual_2: 'Maths', qual_2_level: 'A-Level', qual_2_grade: 'A*', qual_2_board: 'Hill Top Sixth Form', qual_2_received: '2018',
          qual_2_teach: 'TRUE', qual_2_spec: 'TRUE',
          qual_3: 'Physics', qual_3_level: 'GCSE', qual_3_grade: '8', qual_3_received: '2016', qual_3_teach: 'TRUE',
          qual_4: 'Physics', qual_4_level: 'A-Level', qual_4_grade: 'A', qual_4_board: 'Hill Top Sixth Form', qual_4_received: '2018',
          qual_4_teach: 'TRUE',
          qual_5: 'English Literature', qual_5_level: 'GCSE', qual_5_grade: '7', qual_5_received: '2016',
          qual_6: 'English Literature', qual_6_level: 'A-Level', qual_6_grade: 'B', qual_6_received: '2018',
          qual_7: 'DBS', qual_7_level: 'Enhanced', qual_7_received: '2025' });
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const pages = [...document.querySelectorAll('#s-settings .page')];
        const at = pages.findIndex(pg => pg.querySelector('[data-me="qual_10_board"]'));
        if (at < 0) throw new Error('no qualifications page on the settings column');
        goPage('settings', at, true);
        const slot = [...pages[at].querySelectorAll('.q-list .q-slot')].find(sl => (sl.querySelector('select.q-name') || {}).value === 'DBS');
        if (!slot) throw new Error('no DBS line on the qualifications page');
        slot.querySelector('.q-line').click();
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
        const open = [...shelf.querySelectorAll('.q-slot.is-open')];
        const ed = open[0] && open[0].querySelector(':scope > .q-ed');
        const shown = el => !!el && !!(el.offsetWidth || el.offsetHeight);
        if (open.length !== 1 || !shown(ed)) return 0;
        const year = ed.querySelector('select[data-me$="_received"]').closest('label');
        const from = ed.querySelector('input[data-me$="_board"]').closest('label');
        const cap = l => [...l.querySelectorAll(':scope > span')].filter(shown).map(x => x.textContent).join('|');
        return open[0].classList.contains('is-cert')
          && !shown(ed.querySelector('select[data-me$="_grade"]'))
          && !shown(ed.querySelector('.q-seg'))
          && shown(year) && shown(from)
          && Math.abs(year.getBoundingClientRect().top - from.getBoundingClientRect().top) < 2
          && cap(year) === 'Year' && cap(from) === 'Issued by'
          && !open[0].querySelector('.q-line .q-mark').textContent.trim()
          && !!ed.querySelector('.tile[data-do="qual-done"]') && !!ed.querySelector('.tile[data-do="qual-drop"]')
          ? 1 : 0;
      },
      wants: 'the Enhanced DBS open with no grade and no Teach control, its Year and Issued by side by side, and the tick and the bin' },
    /* AND A LINE BEING ADDED, through the `+`. *Walked:* its face said `New qualification` in the
       subject's 10ch column — "New / qualificat / ion", the first thing seen after `+` — over the boxes
       that say the same. A line not yet saved has no face: its editor, under the gold rule, is the line.
       Mutation: the `[data-new] > .q-line` rule removed — the face is drawn again. */
    { name: 'the qualifications, one being added',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_QUAL_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, {
          qual_1: 'Maths', qual_1_level: 'GCSE', qual_1_grade: '9', qual_1_board: 'Hill Top School', qual_1_received: '2016',
          qual_1_teach: 'TRUE', qual_1_spec: 'TRUE',
          qual_2: 'Maths', qual_2_level: 'A-Level', qual_2_grade: 'A*', qual_2_board: 'Hill Top Sixth Form', qual_2_received: '2018',
          qual_2_teach: 'TRUE', qual_2_spec: 'TRUE',
          qual_3: 'Physics', qual_3_level: 'GCSE', qual_3_grade: '8', qual_3_received: '2016', qual_3_teach: 'TRUE',
          qual_4: 'Physics', qual_4_level: 'A-Level', qual_4_grade: 'A', qual_4_board: 'Hill Top Sixth Form', qual_4_received: '2018',
          qual_4_teach: 'TRUE',
          qual_5: 'English Literature', qual_5_level: 'GCSE', qual_5_grade: '7', qual_5_received: '2016',
          qual_6: 'English Literature', qual_6_level: 'A-Level', qual_6_grade: 'B', qual_6_received: '2018',
          qual_7: 'DBS', qual_7_level: 'Enhanced', qual_7_received: '2025' });
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const pages = [...document.querySelectorAll('#s-settings .page')];
        const at = pages.findIndex(pg => pg.querySelector('[data-me="qual_10_board"]'));
        if (at < 0) throw new Error('no qualifications page on the settings column');
        goPage('settings', at, true);
        pages[at].querySelector('.q-shelf [data-do="qual-add"]').click();
        /* THE SUBJECT BOX TAKES THE FOCUS a tick later (`qualNext_`) — it opened the app's own list here
           until the dropdowns were the platform's again (note 315), and this shut that list so the card
           was what got measured. A focused box is part of the card a person is looking at, so it stays. */
        return new Promise(r => setTimeout(r, 60));
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
        const fresh = shelf.querySelector('.q-list .q-slot.is-open[data-new]');
        const shown = el => !!el && !!(el.offsetWidth || el.offsetHeight);
        return !!fresh && !shown(fresh.querySelector(':scope > .q-line'))
          && shown(fresh.querySelector('select.q-name'))
          && !/New qualification/.test(shelf.innerText)
          && [...shelf.querySelectorAll('.q-list .q-line')].filter(shown).length === 7
          ? 1 : 0;
      },
      wants: 'a line being added drawn as its editor alone — no face saying New qualification over its Subject box — with the seven saved lines above it' },

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

    /* ---------- A SEVERAL-OF-A-LIST FIELD, OPEN, WITH A BOX TICKED ---------------------------------
       IT WAS A BUTTON THAT HUNG `#drop`, the booking form's floating panel, which is a sibling of the
       screens — so the only way this lab ever saw the panel, or the press pass ever reached
       `me-many-pick`, was a state that opened it. On 9 October the owner asked for *"a more stable
       standard simple conventional drop down list"* (note 315), and the field is a `<details>` now:
       its summary is the field, and open, its ticks are real checkboxes under it IN the card, pushing
       the card longer — which is exactly what `check/ui.js` has to lay out and measure at every width.

       OPENED THROUGH THE SUMMARY, the browser's own door, and ONE BOX TICKED the way a finger ticks it —
       the box flips and `change` bubbles — so what is measured is the field with an answer in it, and
       what is asserted is that the answer reached the hidden box `me-save` reads. Shut and put back on
       the way out, because states run in order down one page. */
    { name: 'a several-of-a-list field open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const pages = [...document.querySelectorAll('#s-settings > .page')];
        /* ANY SEVERAL-OF-A-LIST FIELD — whichever one the column carries (a tutor's venues, on Contact
           & address). Which fields take several answers is `FIELD_MULTI`'s to say. */
        const q = '.field.many details';
        const at = pages.findIndex(pg => pg.querySelector(q));
        if (at < 0) throw new Error('no several-of-a-list field on the settings column');
        goPage('settings', at, true);
        const det = pages[at].querySelector(q);
        det.querySelector(':scope > summary').click();
        const box = det.querySelector('input[type="checkbox"]:not(:disabled)');
        if (!box) throw new Error('the open field draws no box to tick');
        window.STATE_MANY_WAS = { name: box.dataset.manyOf, value: (det.closest('.many').querySelector('input[type="hidden"]') || {}).value };
        box.checked = !box.checked;
        box.dispatchEvent(new Event('change', { bubbles: true }));
      },
      leave: () => {
        document.querySelectorAll('#s-settings .field.many details[open]').forEach(d => { d.open = false; });
        delete window.STATE_MANY_WAS;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
      },
      expect: () => {
        const det = document.querySelector('#s-settings .page.on .field.many details[open]');
        const was = window.STATE_MANY_WAS || {};
        const hidden = det && det.closest('.many').querySelector('input[type="hidden"]');
        return !!det && !document.getElementById('drop')
          && det.querySelectorAll('label.check input[type="checkbox"]').length > 0
          && !!det.closest('.me-form[data-dirty]')
          && !!hidden && hidden.value !== was.value ? 1 : 0;
      },
      wants: 'a several-of-a-list field open under its summary, in the card, with a box ticked into its hidden answer' },

    /* ---------- AN ORDINARY SELECT, ANSWERED ------------------------------------------------------------
       THIS WAS "A DROPDOWN OPEN" — a click AT a settings select, which hung the app's own panel off it
       for this lab to measure (note 226). The open list is the platform's again (note 315) and no page
       can draw, measure or press it, so there is no open state to enter. What a select still does to a
       card is be ANSWERED: the value moves, `change` bubbles, the card is marked as holding an unsaved
       answer. Answered here the way the platform's list answers — the value, then `input` and `change`,
       bubbling — and put back on the way out. */
    { name: 'a dropdown answered',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const pages = [...document.querySelectorAll('#s-settings > .page')];
        const at = pages.findIndex(pg => pg.querySelector('label.field > select:not(:disabled)'));
        if (at < 0) throw new Error('no select in a label on the settings column');
        goPage('settings', at, true);
        const sel = pages[at].querySelector('label.field > select:not(:disabled)');
        const to = [...sel.options].find(o => o.index !== sel.selectedIndex && !o.disabled);
        if (!to) throw new Error('the select has no second answer to choose');
        window.STATE_SEL_WAS = { name: sel.dataset.me, to: to.value };
        sel.value = to.value;
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      },
      leave: () => {
        delete window.STATE_SEL_WAS;
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
      },
      expect: () => {
        const was = window.STATE_SEL_WAS || {};
        const sel = document.querySelector('#s-settings .page.on select[data-me="' + was.name + '"]');
        return !!sel && sel.value === was.to && !!sel.closest('.me-form[data-dirty]')
          && !document.getElementById('drop') && !document.querySelector('[role="listbox"]') ? 1 : 0;
      },
      wants: 'a settings select holding a new answer, its card marked unsaved, and no list of the app\'s own anywhere' },

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
        /* `repaint`, AS THE STAR ON SAVED DOES (`on('fav')` in find.js), NOT `paint`: `paint` draws the
           markup and starts nothing, so this measured two widgets that had never started — which since 9
           Oct is two widgets under the loader (`widgetOnColumn_`), and was always two widgets nobody
           could have been looking at. `repaint` draws and starts them. */
        repaint(true);
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

  /* ---------- PROGRESS, WHICH HAS ONE STATE UNTIL IT IS BUILT, AND IT IS ASSERTED ------------------
     NOT LEFT TO THE DEFAULT. A column with no entry here is measured in the state it opens in with
     nothing asked of it, and "nothing to press" printed by `check/press.js` is the same silence
     whether the column drew its card or drew nothing. So the one state says what it must be looking
     at — the card, "Not built yet.", and not a control on it — for both visitors, which is the
     placeholder rule (`drill` in map.js) measured in a real browser rather than read off markup.
     The day the column is built this entry is where its states go.

     BOTH HALVES OF THE RULE, the three questions `placeholderFaults_` asks in check-flow.js — written
     out again here because `expect` is sent to the page as a string and can reach nothing of this
     file. The first version asked only "is there a control", with a selector that did not name a
     `<summary>`: a card given "Streak: 0 days · 0% of the course done", a bar at nought per cent and
     a `<details>` was measured as this state, and `check/ui.js` went red on it only because the
     summary was too small to tap (review, 9 October). So: nothing pressable anywhere in the column,
     by tag or by attribute; nothing in the pane but `drill`'s markup; and no digit. */
  progress: [
    { name: '',
      expect: () => {
        const h = document.getElementById('s-progress');
        const pane = h && h.querySelector(':scope > .page > .pane');
        if (!pane || !pane.querySelector('.card h3') || !/Not built yet/.test(pane.textContent)) return false;
        if (h.querySelector('button, [data-do], input, select, textarea, a[href], summary, details, label, '
          + '[tabindex], [onclick], [role], [contenteditable]')) return false;
        if ([...pane.querySelectorAll('*')].some(e => !e.matches('div.card, h3, p.sub, p.empty, br, span.faint'))) return false;
        return !/\d/.test(pane.textContent);
      },
      wants: 'Progress card saying it is not built yet: drill\'s markup only, no number, nothing on it to press' },
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

    /* ---------- CHECK UPLOADS, ANSWERED — THE ADMIN'S, LIKE THE FLYER ---------------------------
       The card as it reads on the day it matters: a deployment that can read Drive and not write
       to it, so two crosses, Google's own sentence under one of them, and the fix as numbered steps
       with a link. The longest thing on it is that sentence and the folder's name, and both are the
       server's — which is why the state seeds the reply rather than a tidy one of its own. `leave`
       puts the card back as it opens, before anybody has pressed it. */
    { name: 'check uploads, answered',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'uploads');
        if (n < 0) throw new Error('no Check uploads widget in the roster');
        goPage('tools', n, true);
        UPLOADS_SAID = { success: true, ok: false, version: '2026-10-05-chatmedia',
          checks: [
            { id: 'column', ok: true, label: 'The messages tab has an attachments column', said: 'Yes — a file’s address has somewhere to go.' },
            { id: 'scope', ok: false, label: 'This deployment may write to Drive', said: 'It holds drive.readonly — it can read and cannot write.' },
            { id: 'folder', ok: true, label: 'The posts folder opens', said: '“@family. posts and photographs (2026)”, from POSTS_FOLDER in constants.gs.' },
            { id: 'write', ok: false, label: 'A file can be made there and shared by link', said: 'No — Drive refused it for want of permission.' }],
          steps: [
            { text: 'Sync backend/ from GitHub, so appsscript.json in the editor lists .../auth/drive and not drive.readonly.' },
            { text: 'Open the consent link and press Allow, ticking every box.', href: 'https://accounts.google.com/o/oauth2/auth?client_id=example' },
            { text: 'Run authoriseDrive in the editor. Only when its last line says READY: Deploy → Manage deployments → edit → Version: New version → Deploy.' }] };
        uploadsPaint_();
      },
      expect: () => document.querySelectorAll('#s-tools .up-box .up-row.is-bad').length === 2
        && document.querySelectorAll('#s-tools .up-box .up-steps li').length === 3
        && !!document.querySelector('#s-tools .up-box a.tile[href^="https://accounts.google.com"]')
        && !!document.querySelector('#s-tools .up-box [data-do="uploads-check"]'),
      wants: 'the Check uploads tile, two ticks, two crosses, three numbered steps and an Allow tile',
      leave: () => { UPLOADS_SAID = null; uploadsPaint_(); } },

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

    /* ---------- THE WHITEBOARD, LOCKED, WITH SOMETHING ON IT --------------------------------------
       KEPT ON THE DEVICE, so it opens blank and unlocked on every run -- a cream rectangle measures
       perfectly. The state somebody is actually in is the other one: the padlock lit, the gold frame
       round the board, marks on it, and the bar and the note still inside a pane that clips. That is
       the case the board's height is capped for (`.wb` in style.css), at 320x568 above all.
       Seeded through the app's own key (`padKey_(WB_ITEM)`) and the app's own writer (`ansStore_`),
       and locked the way a repaint finds it (`PAD_ON`), so nothing here spells the key out. A ruled
       line across the top, a triangle and a ring: a stroke that touches the board's edges is the one
       that would show a board drawn the wrong shape. */
    { name: 'a whiteboard with a drawing on it',
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'whiteboard');
        if (n < 0) throw new Error('no whiteboard widget in the roster');
        goPage('tools', n, true);
        const k = padKey_(WB_ITEM);
        const ring = [];
        for (let i = 0; i <= 48; i++) ring.push(Math.round(170 + 60 * Math.cos(i / 24 * Math.PI)), Math.round(255 + 45 * Math.sin(i / 24 * Math.PI)));
        ansStore_(k, JSON.stringify([[0, 20, 340, 20], [70, 190, 170, 50, 270, 190, 70, 190], ring]));
        PAD_ON = k;
        initWhiteboard();
      },
      expect: () => document.querySelectorAll('#s-tools #wgt-whiteboard .qpad.is-drawing .qpad-g path').length === 3
                    && document.querySelector('#s-tools #wgt-whiteboard .qpad-ink[data-noswipe]')
                    && document.querySelectorAll('#s-tools #wgt-whiteboard .qpad-bar .tile').length === 3,
      wants: 'the board locked, three marks on it, and the padlock, Undo and Clear under it',
      leave: () => {
        const k = padKey_(WB_ITEM);
        PAD_ON = '';
        ansStore_(k, null);
        initWhiteboard();
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

    /* ---------- IMPOSTER, EVERY SCREEN OF A ROUND -----------------------------------------------
       The owner, 8 Oct: "info over load on the reading parts", and "so young ones who can’t read can
       play. Like it will read it out for them." Every screen after Deal is past the one `go()` reaches,
       and two of them — the switch and Listen — exist only with Read aloud on, so none of it had ever
       been measured. Entered through the game's own handlers; then the LONGEST word and the LONGEST
       category in `IMP_DECK` are put on the card, the Articulate states' rule, because the one worth
       measuring is the one that wraps — and the big line is meant to hold two lines without moving the
       button under it. A real Chromium has `speechSynthesis`, so the switch is drawn; a state that
       finds no switch fails, which is what it should do on a browser with no voice.

       READ ALOUD IS TURNED OFF AGAIN ON THE WAY OUT, because it is remembered on the device and every
       state after these would otherwise be measured with it on. */
    { name: 'imposter setup with read aloud on',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'imp'; ACTIONS['wg-pick'](sel); }
        ACTIONS['imp-players'](document.createElement('button'));
        if (!impAloud_()) ACTIONS['imp-aloud'](document.createElement('button'));
      },
      expect: () => !!document.querySelector('#s-games #imp-card .imp-aloud[aria-pressed="true"]')
                 && document.querySelectorAll('#s-games #imp-card .imp-step').length === 2,
      wants: 'Players, the stepper, Read aloud switched on, and Deal',
      leave: () => { impAloud_(false); ACTIONS['imp-players'](document.createElement('button')); } },
    { name: 'imposter pass',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'imp'; ACTIONS['wg-pick'](sel); }
        /* WITH READ ALOUD ON, like the two cards after it, so the four screens a child presses alone
           are measured — and photographed — at the one height `impFrame_` keeps them at. */
        impAloud_(true);
        ACTIONS['imp-start'](document.createElement('button'));
      },
      expect: () => !!document.querySelector('#s-games #imp-card [data-do="imp-show"] .tile-i')
                 && !!document.querySelector('#s-games #imp-card .imp-foot')
                 && /^Pass to Player 1/.test((document.querySelector('#s-games #imp-card') || {}).textContent.replace(/\s+/g, ' ').trim()),
      wants: 'Pass to, Player 1, and Show with its eye — nothing secret, and room kept for Listen',
      leave: () => { impAloud_(false); ACTIONS['imp-players'](document.createElement('button')); } },
    { name: 'imposter a players card with listen',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'imp'; ACTIONS['wg-pick'](sel); }
        impAloud_(true);
        ACTIONS['imp-start'](document.createElement('button'));
        const all = [];
        Object.keys(IMP_DECK).forEach(c => IMP_DECK[c].forEach(w => all.push([c, w])));
        const [c, w] = all.reduce((a, b) => (b[1].length > a[1].length ? b : a));
        IMP.imp = 1; IMP.cat = c; IMP.word = w;
        ACTIONS['imp-show'](document.createElement('button'));
      },
      expect: () => !!document.querySelector('#s-games #imp-card [data-do="imp-listen"]')
                 && !!document.querySelector('#s-games #imp-card [data-do="imp-hide"] .tile-i')
                 && (document.querySelector('#s-games #imp-card .imp-big') || {}).textContent === IMP.word,
      wants: 'the longest word in the deck, Hide with its shut eye, and the Listen speaker',
      leave: () => { impAloud_(false); ACTIONS['imp-players'](document.createElement('button')); } },
    { name: 'imposter the imposters card',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'imp'; ACTIONS['wg-pick'](sel); }
        impAloud_(true);
        ACTIONS['imp-start'](document.createElement('button'));
        IMP.imp = 0;
        IMP.cat = Object.keys(IMP_DECK).reduce((a, b) => (b.length > a.length ? b : a));
        ACTIONS['imp-show'](document.createElement('button'));
      },
      expect: () => (document.querySelector('#s-games #imp-card .imp-big') || {}).textContent === 'Imposter'
                 && (document.querySelector('#s-games #imp-card') || {}).textContent.indexOf('Hint: ' + IMP.cat) !== -1
                 && !!document.querySelector('#s-games #imp-card [data-do="imp-listen"]'),
      wants: 'Imposter, the longest category as the hint, Hide and Listen',
      leave: () => { impAloud_(false); ACTIONS['imp-players'](document.createElement('button')); } },
    { name: 'imposter play',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'imp'; ACTIONS['wg-pick'](sel); }
        impAloud_(true);
        ACTIONS['imp-start'](document.createElement('button'));
        for (let i = 0; i < IMP.n; i++) {
          ACTIONS['imp-show'](document.createElement('button'));
          ACTIONS['imp-hide'](document.createElement('button'));
        }
        IMP.cat = Object.keys(IMP_DECK).reduce((a, b) => (b.length > a.length ? b : a));
        impPaint();
      },
      expect: () => IMP.phase === 'play'
                 && !!document.querySelector('#s-games #imp-card [data-do="imp-reveal"]')
                 && / starts$/.test((document.querySelector('#s-games #imp-card .imp-big') || {}).textContent || ''),
      wants: 'the category, who starts, and Reveal — no word',
      leave: () => { impAloud_(false); ACTIONS['imp-players'](document.createElement('button')); } },
    { name: 'imposter reveal',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'imp'; ACTIONS['wg-pick'](sel); }
        ACTIONS['imp-start'](document.createElement('button'));
        for (let i = 0; i < IMP.n; i++) {
          ACTIONS['imp-show'](document.createElement('button'));
          ACTIONS['imp-hide'](document.createElement('button'));
        }
        ACTIONS['imp-reveal'](document.createElement('button'));
        const all = [];
        Object.keys(IMP_DECK).forEach(c => IMP_DECK[c].forEach(w => all.push(w)));
        IMP.word = all.reduce((a, b) => (b.length > a.length ? b : a));
        impPaint();
      },
      expect: () => IMP.phase === 'reveal'
                 && !!document.querySelector('#s-games #imp-acts [data-do="imp-again"]')
                 && !!document.querySelector('#s-games #imp-acts [data-do="imp-players"]'),
      wants: 'Imposter and the player, Word and the longest word, Play again and Players',
      leave: () => { ACTIONS['imp-players'](document.createElement('button')); } },
    /* THE BIG LINE AND THE BUTTON, MEASURED STAYING WHERE THEY ARE. "The gold one under the big word"
       has to be one place on every screen a child presses alone, and the first build broke it — Hide
       36px above where Show had been — where only a screenshot saw it. The six states above only ask
       that each thing EXISTS: with `.imp-foot` set to `display: none` and `.imp-big`'s two-line floor
       taken out, so Hide sat 36px above Show and a two-line word moved the button, they and the whole
       of check/ui.js still said "nothing NEW to report" (the review of 8 October).

       SO ONE ROUND IS WALKED THROUGH THE HANDLERS, the `Q0664` way above: the top of the big line and
       of the gold button on the pass screen, a player's card holding the LONGEST word in the deck, the
       next pass, the imposter's card holding the LONGEST category, and play — every one read in the
       same tick, so nothing moves between them but the card itself. With Read aloud on, which is the
       card with the speaker under it, and again with it off. Each top within 0.5px of the first. */
    { name: 'imposter the big line and the button stay put',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'imp'; ACTIONS['wg-pick'](sel); }
        window.__impStill = null;
        const b = () => document.createElement('button');
        const words = [];
        Object.keys(IMP_DECK).forEach(c => IMP_DECK[c].forEach(w => words.push(w)));
        const word = words.reduce((a, x) => (x.length > a.length ? x : a));
        const cat = Object.keys(IMP_DECK).reduce((a, x) => (x.length > a.length ? x : a));
        /* EACH TOP READ TWO FRAMES AFTER ITS PRESS, NOT IN THE SAME TICK. A card that changes height is
           put back in the middle of the pane by the `ResizeObserver` in find.js (`holdColumn_`), after
           layout and before paint — so a reading taken straight after the press is the card before it
           was re-centred, which no finger ever sees. The first version here read every screen in one
           tick and had Read aloud on and off at identical heights: blind to exactly the 36px it is for. */
        const frames = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        /* AND AT REST: a slide the column is still running is a card on its way, not where it stops —
           `settled` in check/ui.js asks the same of a whole screen. Bounded, and a card still moving
           after it is measured where it is and fails, which is right. */
        const moving = () => [...document.querySelectorAll('#s-games, #s-games .page')].some(el =>
          typeof el.getAnimations === 'function' && el.getAnimations().some(a => a.playState === 'running'));
        const rest = async () => {
          await frames();
          const t1 = performance.now();
          while (moving() && performance.now() - t1 < 1500) await new Promise(r => setTimeout(r, 50));
          await frames();
        };
        const at = where => {
          const q = sel => document.querySelector('#s-games #imp-card ' + sel);
          const big = q('.imp-big'), go = q('.imp-go');
          return { where: where, big: big ? +big.getBoundingClientRect().top.toFixed(1) : NaN,
                   go: go ? +go.getBoundingClientRect().top.toFixed(1) : NaN };
        };
        const walk = async aloud => {
          const got = [];
          const look = async where => { await rest(); got.push(at(where)); };
          impAloud_(aloud);
          ACTIONS['imp-players'](b());
          ACTIONS['imp-start'](b());
          IMP.imp = 1; IMP.word = word; IMP.cat = cat;
          impPaint();
          await look('pass to player 1');
          ACTIONS['imp-show'](b()); await look('player 1, ' + word);
          ACTIONS['imp-hide'](b()); await look('pass to player 2');
          ACTIONS['imp-show'](b()); await look('player 2, the imposter, ' + cat);
          ACTIONS['imp-hide'](b());
          while (IMP.phase === 'deal') { ACTIONS['imp-show'](b()); ACTIONS['imp-hide'](b()); }
          await look('play');
          return got;
        };
        /* AND NOT UNTIL THE PAGE IS ON THE GLASS, with nothing booked: `goPage` places on a frame. */
        const t0 = performance.now();
        const settle = () => {
          const card = document.querySelector('#s-games #imp-card');
          const r = card && card.getBoundingClientRect();
          const placed = r && r.top >= 0 && r.bottom <= innerHeight && !moving()
            && !(typeof PLACE_FRAME !== 'undefined' && PLACE_FRAME);
          if (!placed && performance.now() - t0 < 2000) { setTimeout(settle, 100); return; }
          (async () => { const on = await walk(true); const off = await walk(false); window.__impStill = { on: on, off: off }; })();
        };
        setTimeout(settle, 100);
      },
      expect: () => {
        const s = window.__impStill;
        const still = list => list.length === 5 && list.every(r => Number.isFinite(r.big) && Number.isFinite(r.go)
          && Math.abs(r.big - list[0].big) < 0.5 && Math.abs(r.go - list[0].go) < 0.5);
        return !!s && still(s.on) && still(s.off);
      },
      wants: 'the big line and the gold button at one height on pass, the longest word, the imposter\'s longest hint and play — Read aloud on and off',
      leave: () => { window.__impStill = null; impAloud_(false); ACTIONS['imp-players'](document.createElement('button')); } },

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

    /* ---------- THE FILMS IN THE VIDEOS CARD — THE ADMIN'S, AND NOBODY ELSE'S ------------------------
       *"Let admin be able to search up films which are in the notflix folder on gdrive."* Two states for
       one card, `only:` each way round, because what the card holds is the PAYLOAD's decision: the
       admin is served the fixture's three invented films and a sync stamp, and the signed-out visitor
       what `doGet` sends a stranger — no film and no stamp (`FIXTURE_ANON` in ui.js). The admin's card
       carries a row nobody else's has — the silver Sync from Drive tile and the line beside it — and a
       film not in the Drive yet, dimmed; both are new widths to fit at 320. */
    { name: 'the films in the videos card, an admin’s',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        VID.q = ''; VID.at = '';
        vidPaint_();
        goPage('games', n, true);
      },
      expect: () => !!document.querySelector('#s-games .vid-admin .tile.is-admin[data-do="vid-sync"]')
                 && !!document.querySelector('#s-games .vid-admin .vid-synced')
                 && document.querySelectorAll('#s-games .vid-list .vid-row').length >= 3
                 && !!document.querySelector('#s-games .vid-list .vid-row.is-off'),
      wants: 'the silver Sync from Drive tile and when it last ran, the films, and the one not in the Drive yet dimmed' },
    { name: 'the videos card, nobody’s films',
      only: () => !(typeof isAdmin === 'function' && isAdmin()),
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        VID.q = ''; VID.at = '';
        vidPaint_();
        goPage('games', n, true);
      },
      expect: () => !document.querySelector('#s-games .vid-admin *')
                 && !document.querySelector('#s-games [data-do="vid-sync"]')
                 && !/film|drive|sync/i.test((document.querySelector('#s-games .vid-box') || {}).textContent || 'film'),
      wants: 'no Sync tile, nothing in the admin row, and no word on the card that says films exist' },

    /* ---------- AND WHILE ITS LIST IS ON ITS WAY: THE ONE LOADER OVER THE CARD -----------------------
       One of three widgets held on a real request — see `the business records still coming` for the
       whole note. `data/videos.json` is asked for by the card's own `initVideos` and its answer kept
       back; here the payload is in, so an admin's card already has its films and is not waiting, and
       this is the stranger's.
       IT RELEASES INTO THREE REAL ROWS. It used to hand back the repository's own file, whose one row is
       a switched-off placeholder — so what landed was "No videos listed yet.", one line in place of the
       one line the count held, and "the card did not move" could not fail (review, 10 Oct). A list's
       length is not known until it lands, so the card GROWS by the rows (`grows`, read by `check/ui.js`):
       what is asked is that the veiled part kept its room — the card never shrinks — and that the three
       rows arrive. */
    { name: 'the videos still coming',
      only: () => !(typeof isAdmin === 'function' && isAdmin()),
      grows: 'the list of videos — how many rows are coming is not known until they come (see `vidPaint_`)',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        const held = window.__vidHeld = { list: VIDEOS_LIST, fetch: window.fetch, go: null };
        const real = held.fetch;
        /* THREE ROWS THE WAY THE OWNER WRITES THEM: active, a title, an address. `example.org` so no row
           reaches anywhere, and each is a row that opens a page (`vidHow_` 'out') — nothing to embed. */
        const rows = [1, 2, 3].map(i => ({ title: 'A held video, number ' + i, url: 'https://example.org/held-video-' + i,
                                           kind: 'clip', tags: '', age: '', notes: '', active: true }));
        window.fetch = (url, o) => (/data\/videos\.json/.test(String(url))
          ? new Promise(r => { held.go = () => r(new Response(JSON.stringify(rows),
              { status: 200, headers: { 'Content-Type': 'application/json' } })); })
          : real(url, o));
        VIDEOS_LIST = null; VIDEOS_ASKED = null; VID.q = ''; VID.at = '';
        goPage('games', n, true);
        initVideos();
      },
      expect: () => {
        const box = document.querySelector('#s-games #wgt-videos .vid-box');
        return !!box && box.getAttribute('aria-busy') === 'true' && !!box.querySelector(':scope > .loading')
          && document.querySelectorAll('#s-games #wgt-videos .loading').length === 1 && !!box.querySelector('input.vid-q');
      },
      wants: 'the videos card drawn whole and under the one loader while data/videos.json is held',
      release: () => { const h = window.__vidHeld; if (h) { window.fetch = h.fetch; if (h.go) { h.go(); h.go = null; } } },
      landed: () => {
        const box = document.querySelector('#s-games #wgt-videos .vid-box');
        return !!box && !box.querySelector('.loading') && !box.getAttribute('aria-busy')
          && box.querySelectorAll('.vid-list .vid-row').length === 3
          && /^3 videos$/.test(((box.querySelector('.vid-said') || {}).textContent || '').trim());
      },
      /* THE LIST IT HELD IS PUT BACK WHETHER OR NOT IT WAS RELEASED: released, `VIDEOS_LIST` is the three
         rows above, and the next state would be measuring a card with videos the repository never had. */
      leave: () => {
        const h = window.__vidHeld;
        if (h) { window.fetch = h.fetch; VIDEOS_LIST = h.list; VIDEOS_ASKED = null; }
        delete window.__vidHeld;
        vidPaint_();
        /* AND IF NOTHING WAS THERE BEFORE EITHER, asked again on the real wire, as the records' state does. */
        if (VIDEOS_LIST === null) videosAsk_().then(() => vidPaint_());
      } },
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
     day those two numbers were taken, then put every card on one line, and centres it again since 5
     October; whichever, a card that
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
    /* ---------- AND THE MOMENT BEFORE THE FIRST FRAME: THE ONE LOADER IN THE VIEWFINDER ----------------
       One of three widgets held on a real request — see `the business records still coming` (settings)
       for the whole note. The ask is the camera's own (`camStart_`) and the browser's answer is kept
       back, which is what a permission prompt left open does; released, it is handed a stream drawn
       from a canvas, which is a real `MediaStream` a container without a camera can make. The loader
       sits over the viewfinder, whose size is the card's, so the first frame lands in its place. */
    { name: 'the camera still starting',
      only: () => typeof USER !== 'undefined' && !!USER && !!(navigator.mediaDevices),
      enter: () => {
        const held = window.__camHeld = { go: null };
        navigator.mediaDevices.getUserMedia = () => new Promise(r => {
          held.go = () => {
            const c = document.createElement('canvas'); c.width = 8; c.height = 8;
            const g = c.getContext('2d'); g.fillStyle = '#336'; g.fillRect(0, 0, 8, 8);
            r(c.captureStream(5));
          };
        });
        /* AFTER ANY ASK STILL OUT. The state before this one put its picture back with `camAgain_`,
           which asks the real camera — and a container has none, so that ask is refused, and on a
           loaded machine the refusal can land after this has asked: it wrote "The camera did not
           start." over the viewfinder this is measuring. So it waits for that one to finish first
           (bounded), and then asks through the held door. */
        const t0 = Date.now();
        const ask = () => {
          if (CAM_ASKING && Date.now() - t0 < 2000) { setTimeout(ask, 50); return; }
          try { camStop_(); } catch (e) {}
          CAM_FAILED = null; CAM_ASKING = false;
          goPage('feed', feedCamAt_(), true);
          camStart_();
        };
        ask();
      },
      expect: () => {
        const off = document.getElementById('cam-off');
        return !!off && !off.hidden && !!off.querySelector('.loading[role="status"]')
          && document.querySelectorAll('#s-feed .cam-card .loading').length === 1;
      },
      wants: 'the viewfinder with the one loader in it while the camera is asked for',
      release: () => { const h = window.__camHeld; if (h && h.go) { h.go(); h.go = null; } },
      landed: () => {
        const off = document.getElementById('cam-off'), v = document.getElementById('cam-view');
        return !!off && off.hidden && !!v && !!v.srcObject;
      },
      leave: () => {
        delete window.__camHeld;
        try { delete navigator.mediaDevices.getUserMedia; } catch (e) {}
        CAM_ASKING = false;
        try { camStop_(); } catch (e) {}
        CAM_FAILED = null;
      } },
    /* ---------- AND A BROWSER WITH NO CAMERA AT ALL: A FACT, AND NO LOADER OVER IT ------------------
       Found by review: with `navigator.mediaDevices` missing, `camStart_` wrote "This browser has no
       camera support." under the card and left the viewfinder holding the loader `cameraCard` drew —
       dots pulsing over a sentence saying nothing was coming, for as long as the page was up. The
       container HAS `mediaDevices`, so it is taken away for the state (an own property over the
       prototype's getter) and put back by deleting it. */
    { name: 'the camera with no camera support',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        try { camStop_(); } catch (e) {}
        CAM_FAILED = null; CAM_ASKING = false;
        Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
        goPage('feed', feedCamAt_(), true);
        camStart_();
      },
      expect: () => {
        const off = document.getElementById('cam-off');
        return !!off && !off.hidden && !off.querySelector('.loading')
          && /no camera support/.test(off.textContent || '')
          && !document.querySelector('#s-feed .cam-card .loading');
      },
      wants: 'the viewfinder saying the browser has no camera support, and no loader anywhere on the card',
      leave: () => {
        try { delete navigator.mediaDevices; } catch (e) {}
        CAM_ASKING = false;
        try { camStop_(); } catch (e) {}
        CAM_FAILED = null;
      } },
    /* ---------- A POST'S FACES, IN EVERY STATE THEY ARE DRAWN IN ---------------------------------
       THE OWNER, 9 Oct: *"Also refine how the post reactions look. Looks abit scuffed right bow"* —
       and this lab had never drawn the row. The fixture's post sent `{"👍": 3}`, a shape `doGet` has
       never sent, which `reacts()` draws as nothing; so tap size, contrast and sideways overflow had
       been measured across every width on a post with no faces on it. The fixture sends the real
       shape now (six house faces, counts, total, yours, by) and these are the states the row is in:
       nobody, some, yours, a post's own set of more than six with three-digit and four-digit counts,
       and the who-reacted sheet open. Signed out is the other visitor, and runs all but "yours".

       SEEDED THROUGH `DATA.posts`, THE APP'S OWN DOOR — the post's `reactions` is exactly what the
       payload's arrival puts there — then `repaint` and `goPage` to the post, which is what a finger
       does. `PO1` because it is the fixture's post with a picture, so the row is where it is on most
       posts: directly under the photograph. AND PUT BACK, because states run in order down one page
       and the next would otherwise be measuring this one's counts. */
    { name: 'reactions nobody',
      enter: () => {
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (!p) throw new Error('the fixture has no PO1 to draw faces on');
        window.__RX_HELD = JSON.stringify(p.reactions);
        p.reactions = { emoji: ['👍', '❤️', '😂', '😮', '👏', '🎉'], counts: [0, 0, 0, 0, 0, 0],
                        total: 0, yours: '', by: [] };
        repaint(true);
        goPage('feed', feedCamAt_() + 1 + feedPosts().findIndex(x => x.id === 'PO1'), true);
      },
      expect: () => {
        const el = document.querySelector('#s-feed > .page.on [data-post="PO1"]');
        return !!el && el.querySelectorAll('.reacts .react').length === 6
          && !el.querySelector('.react-n') && !el.querySelector('.react-who');
      },
      wants: 'the post on the screen with six empty pills and no total',
      leave: () => {
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (p && window.__RX_HELD) p.reactions = JSON.parse(window.__RX_HELD);
        repaint(true);
      } },
    { name: 'reactions some',
      enter: () => {
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (!p) throw new Error('the fixture has no PO1 to draw faces on');
        window.__RX_HELD = JSON.stringify(p.reactions);
        p.reactions = { emoji: ['👍', '❤️', '😂', '😮', '👏', '🎉'], counts: [3, 1, 0, 0, 0, 0],
                        total: 4, yours: '',
                        by: [{ name: 'Ada Tutor', emoji: '👍' }, { name: 'Priya Parent', emoji: '👍' },
                             { name: 'Carl Everyclient', emoji: '👍' },
                             { name: 'Evie Everystudent-Longername', emoji: '❤️' }] };
        repaint(true);
        goPage('feed', feedCamAt_() + 1 + feedPosts().findIndex(x => x.id === 'PO1'), true);
      },
      expect: () => {
        const el = document.querySelector('#s-feed > .page.on [data-post="PO1"]');
        /* ONE LINE FOR THE STRANGER TOO: "yours" runs only signed in, and this runs for both. */
        const faces = el ? [...el.querySelectorAll('.reacts .react')] : [];
        const tops = new Set(faces.map(f => Math.round(f.getBoundingClientRect().top)));
        return !!el && el.querySelectorAll('.reacts .react-n').length === 2
          && faces.length === 6 && tops.size === 1
          && /4 reactions/.test((el.querySelector('.post-when .react-who') || {}).textContent || '');
      },
      wants: 'the post on the screen with six faces on one line, two counted, and "4 reactions" on its time line',
      leave: () => {
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (p && window.__RX_HELD) p.reactions = JSON.parse(window.__RX_HELD);
        repaint(true);
      } },
    /* EVERY FACE COUNTED IN TWO DIGITS AND ONE OF THEM YOURS — the widest the house row gets on a
       busy post, and the gold one with its heavier count inside a 41px cell at 320.
       AND ALL SIX ON ONE LINE, which is the redesign's whole claim: the scuff was a row that wrapped
       🎉 onto a line of its own, and a count that grew reflowing the row. Nothing held it — a grid
       changed to wrap the six as 5+1 at 320 passed this file clean, because this asked only for
       `.mine` and six counts. The same idiom as the wrapping state: one distinct top, one line. */
    { name: 'reactions yours',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (!p) throw new Error('the fixture has no PO1 to draw faces on');
        window.__RX_HELD = JSON.stringify(p.reactions);
        p.reactions = { emoji: ['👍', '❤️', '😂', '😮', '👏', '🎉'], counts: [12, 9, 15, 3, 27, 11],
                        total: 77, yours: '❤️',
                        by: [{ name: USER.name, emoji: '❤️' }, { name: 'Ada Tutor', emoji: '👍' },
                             { name: 'Priya Parent', emoji: '😂' }] };
        repaint(true);
        goPage('feed', feedCamAt_() + 1 + feedPosts().findIndex(x => x.id === 'PO1'), true);
      },
      expect: () => {
        const el = document.querySelector('#s-feed > .page.on [data-post="PO1"]');
        const mine = el && el.querySelector('.react.mine');
        const faces = el ? [...el.querySelectorAll('.reacts .react')] : [];
        const tops = new Set(faces.map(f => Math.round(f.getBoundingClientRect().top)));
        return !!mine && mine.dataset.emoji === '❤️' && mine.getAttribute('aria-pressed') === 'true'
          && el.querySelectorAll('.reacts .react-n').length === 6
          && faces.length === 6 && tops.size === 1;
      },
      wants: 'the post on the screen with six counted faces on ONE line and ❤️ drawn as yours',
      leave: () => {
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (p && window.__RX_HELD) p.reactions = JSON.parse(window.__RX_HELD);
        repaint(true);
      } },
    /* A POST'S OWN CELL NAMING NINE FACES, with three- and four-digit counts: the one case the row
       wraps (into the same columns, six and three), and the one case a count steps down a size
       (`is-long`) or rounds (`1k`). Yours too when signed in, on a three-digit face. */
    { name: 'reactions many and wrapping',
      enter: () => {
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (!p) throw new Error('the fixture has no PO1 to draw faces on');
        window.__RX_HELD = JSON.stringify(p.reactions);
        const signed = typeof USER !== 'undefined' && !!USER;
        p.reactions = { emoji: ['👍', '❤️', '😂', '😮', '👏', '🎉', '🔥', '🙏', '💯'],
                        counts: [999, 1500, 212, 7, 0, 45, 3, 0, 1], total: 2767,
                        yours: signed ? '😂' : '', by: [] };
        repaint(true);
        goPage('feed', feedCamAt_() + 1 + feedPosts().findIndex(x => x.id === 'PO1'), true);
      },
      expect: () => {
        const el = document.querySelector('#s-feed > .page.on [data-post="PO1"]');
        if (!el) return false;
        const faces = [...el.querySelectorAll('.reacts .react')];
        const top = faces.map(f => Math.round(f.getBoundingClientRect().top));
        const tops = new Set(top);
        /* SIX ON THE FIRST LINE, NOT JUST TWO LINES: a grid that wrapped at five drew 5+4, which is
           also two lines and passed. The house set's six columns are the claim; a ninth face starts
           the second line in them. */
        const first = top.filter(t => t === Math.min(...top)).length;
        return faces.length === 9 && tops.size === 2 && first === 6 && !!el.querySelector('.react.is-long')
          && [...el.querySelectorAll('.react-n')].some(n => n.textContent === '1k');
      },
      wants: 'the post on the screen with nine faces on two lines (six, then three), a three-digit count stepped down and 1500 drawn as 1k',
      leave: () => {
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (p && window.__RX_HELD) p.reactions = JSON.parse(window.__RX_HELD);
        repaint(true);
      } },
    /* WHO REACTED, OPEN — the sheet is outside `#s-feed`, and `check/ui.js` measures it when one is
       open. Groups most-used first, a long name, and yours the gold pill when signed in. Opened
       through the total's own handler, and shut on the way out (a sheet survives `go()`). */
    { name: 'reactions who reacted',
      enter: () => {
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (!p) throw new Error('the fixture has no PO1 to draw faces on');
        window.__RX_HELD = JSON.stringify(p.reactions);
        const signed = typeof USER !== 'undefined' && !!USER;
        p.reactions = { emoji: ['👍', '❤️', '😂', '😮', '👏', '🎉'], counts: [2, 1, 3, 0, 0, 0],
                        total: 6, yours: signed ? '😂' : '',
                        by: [{ name: 'Ada Tutor', emoji: '👍' }, { name: 'Priya Parent', emoji: '😂' },
                             { name: 'Evie Everystudent-Longername', emoji: '😂' },
                             { name: 'Carl Everyclient', emoji: '❤️' }]
                             .concat(signed ? [{ name: USER.name, emoji: '😂' }] : []) };
        repaint(true);
        goPage('feed', feedCamAt_() + 1 + feedPosts().findIndex(x => x.id === 'PO1'), true);
        const t = document.querySelector('#s-feed [data-post="PO1"] .post-when .react-who');
        if (!t) throw new Error('no total on the post to open who reacted from');
        ACTIONS['who-reacted'](t);
      },
      expect: () => {
        const sh = document.getElementById('sheet');
        const g = [...document.querySelectorAll('#sheet-body .rx-group .rx-pill .react-e')].map(x => x.textContent);
        return !!sh && !sh.classList.contains('hidden') && g.join(' ') === '😂 👍 ❤️';
      },
      wants: 'the who-reacted sheet open with 😂, 👍 and ❤️ in that order',
      leave: () => {
        closeSheet();
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (p && window.__RX_HELD) p.reactions = JSON.parse(window.__RX_HELD);
        repaint(true);
      } },
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

    /* ---------- A SEVERAL-ANSWERS ROW, OPEN UNDER ITSELF, WITH A BOX TICKED -------------------------
       `check/press.js` REPORTED THE HOLE BEFORE A STATE EXISTED: *"named on a screen and then not found
       to press (2): booking/book-many-pick, booking/book-many-done"*. The ticks are drawn only once a
       row has been pressed, and the press pass builds its queue from what is on the screen — so they
       were pressed by nothing.

       IT WAS `#drop`, a panel outside the screens, and this state's root was the panel. Since 9 October
       (note 315) the list is checkboxes IN the card, under the row it answers, pushing the rows below
       it down — so the measured root is `#s-booking` like every other booking state, and the card is
       longer while it is open: twelve subjects at 44px a row is the arithmetic note 147 ruled the
       in-flow shape out on, before `paneReach_` zoomed and scrolled a long card instead of clipping it.
       `check/ui.js` lays that out at every width now, on every commit.

       SEEDED THROUGH `BOOKING.picking` AND `drawBooker()`, which is what `book-many` does, and ONE BOX
       TICKED the way a finger ticks it — the box flips and `change` bubbles to `book-many-pick`. The step
       is found rather than named: which questions take several answers is `BOOK_STEPS`'s to say. */
    { name: 'a list of answers open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const st = (typeof BOOK_STEPS !== 'undefined' ? BOOK_STEPS : []).filter(x => x.multi && !x.grid)
          .filter(x => { try { return (x.options() || []).filter(Boolean).length >= 1; } catch (e) { return false; } })[0];
        if (!st) throw new Error('no several-answers question offers anything to tick');
        window.STATE_MANY_STEP = st.id;
        BOOKING.picking = st.id; drawBooker();
        /* THE BOX IS TICKED ONCE IT IS DRAWN, asked again for up to two seconds. `check/ui.js` found it
           missing once at 390 on a loaded machine and never in a replay of the same states, so the
           repaint can land late; a box that never comes is still reported, by `expect`. */
        return new Promise(ok => {
          const t0 = Date.now();
          const tick = () => {
            if (BOOKING.picking !== st.id) { BOOKING.picking = st.id; drawBooker(); }
            const box = document.querySelector('#bookr #bk-many-' + st.id + ' input[type="checkbox"]');
            if (box) { box.checked = true; box.dispatchEvent(new Event('change', { bubbles: true })); return ok(); }
            if (Date.now() - t0 > 2000) return ok();
            setTimeout(tick, 50);
          };
          tick();
        });
      },
      expect: () => {
        const id = window.STATE_MANY_STEP;
        const list = id && document.querySelector('#s-booking #bookr #bk-many-' + id);
        return !!list && !document.getElementById('drop')
          && list.querySelectorAll('label.check input[type="checkbox"]').length >= 1
          && list.querySelectorAll('input[type="checkbox"]:checked').length >= 1
          && (BOOKING[id] || []).length >= 1 ? 1 : 0;
      },
      wants: 'a several-answers row open under itself in the card, with a box ticked into the booking',
      /* PUT BACK, because states run in order down one page and the receipt state after this one would
         otherwise be measuring a half-answered form with a list open on it. */
      leave: () => { delete window.STATE_MANY_STEP;
        if (typeof resetBooking_ === 'function') resetBooking_(); BOOKING.picking = ''; drawBooker(); } },

    /* ---------- AND A SINGLE ANSWER, CHOSEN --------------------------------------------------------------
       THIS WAS "A SINGLE ANSWER OPEN" — a click AT a booking select, which hung the multi-select list's
       panel off it (note 226). The open list is the platform's again (note 315); nothing on the page
       draws it, so there is no open state for this lab to measure. What is left to measure is the card
       ANSWERED through that list — the value, then `input` and `change`, which is all a platform's list
       ever does — and that it reached `BOOKING` through the one `book-set` handler. */
    { name: 'a single answer chosen',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const sel = document.querySelector('#bookr select.bk-sel:not(:disabled)');
        if (!sel) throw new Error('the booking form draws no enabled select');
        const to = [...sel.options].find(o => o.value && o.index !== sel.selectedIndex && !o.disabled);
        if (!to) throw new Error('the first booking select has no second answer to choose');
        window.STATE_SEL_WAS = { step: sel.dataset.step, to: to.value };
        sel.value = to.value;
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      },
      expect: () => {
        const was = window.STATE_SEL_WAS || {};
        const sel = document.querySelector('#bookr select.bk-sel[data-step="' + was.step + '"]');
        return String(BOOKING[was.step] || '') === was.to && !!sel && sel.value === was.to
          && !document.getElementById('drop') && !document.querySelector('[role="listbox"]') ? 1 : 0;
      },
      wants: 'a booking row answered through its own select, the answer in BOOKING, and no list of the app\'s own',
      leave: () => { delete window.STATE_SEL_WAS;
        if (typeof resetBooking_ === 'function') resetBooking_(); drawBooker(); } },

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

    /* ---------- AND SOMEBODY ELSE'S CLASS, WITH SEATS, SEEN BY A FAMILY NOT ON IT -----------------
       *"The session booking thing at the bottom of receipt should be a line in the booking."* The
       way in was a block UNDER the paper — seats, price, the list's tally, a gold button, a faint
       paragraph — and this lab had never drawn it: every receipt state here is the admin's own, and
       the block only ever drew for somebody `canAsk` let in. It is a `Take a seat` tile in the
       foot, a `Sharing` row and a `Can come` row now, and those three are what this measures: the
       tally's bars across the answer and figure tracks at 320, and a fifth tile-height thing on a
       card `paneReach_` already shrinks to fit.

       AS A PARENT, NOT AS THE LAB'S ADMIN. `doGet` never sends `canAsk` to an admin — an admin is
       `iAmIn` on every session — so seeding it under the lab's own visitor would measure a card
       nobody can be shown: Take a seat beside Accept, Decline and Delete. The visitor is swapped for
       the length of the state and put back in `leave`, the way `the library still coming` holds
       and returns the payload.

       THE SHAPE `doGet` SENDS A STRANGER: no names on the seats, no `splitEmails`, `canAsk` and
       `seatsGoing` worked out by the server, and `whenCould` as `waitlistWhen` builds it — the
       longest block phrase the grid can write (`Wednesday afternoon`) among them, because the bar
       is the track that has to hold it. */
    { name: 'a class with seats, seen by a family not on it',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.__RC_WAS = USER;
        USER = { name: 'Visiting Parent', personId: 'P900', person_id: 'P900',
                 role: 'parent', roles: ['parent'], handle: 'visitingparent' };
        DATA.liveJobs = (DATA.liveJobs || []).filter(j => j.id !== 'W-UI').concat([{
          id: 'W-UI', jobId: 'W-UI', type: 'job', kind: 'waitlist', status: 'unconfirmed',
          title: 'GCSE Maths, English Language', subject: 'Maths, English Language', level: 'GCSE',
          location: 'Colliers Wood Library', tutor: '', weekday: '', time: '', term: 'Autumn 2026',
          maxKids: 4, currentKids: 2, dates: '', createdAt: '22/09/2026', price: 19,
          slots: [{ n: 1, client: '', status: 'Waiting', chat: '' },
                  { n: 2, client: '', status: 'Waiting', chat: '' }],
          tutorSlots: [], events: [], splitEmails: '', clientHosts: false,
          canAsk: true, seatsGoing: 2, openToOthers: true,
          whenCould: { people: 2, slots: [
            { slot: 'Monday evening', n: 2, all: true },
            { slot: 'Wednesday afternoon', n: 1, all: false },
            { slot: 'Saturday morning', n: 1, all: false }] },
        }]);
        OPEN_JOB = 'W-UI';
        STALE.booking = 1;
        paint('booking');
        goPage('booking', typeof jobPageAt_ === 'function' ? jobPageAt_('W-UI') : 1, true);
      },
      /* THE THREE PIECES, EACH ON THE PAPER, AND NOTHING UNDER IT. */
      expect: () => {
        const pg = [...document.querySelectorAll('#s-booking .page')]
          .find(p => /W-UI/.test((p.querySelector('.rc-ref') || {}).textContent || ''));
        const rc = pg && pg.querySelector('.rc');
        if (!rc || pg.querySelector('.join')) return false;
        if (!rc.querySelector('.rc-tiles [data-do="job-take-seat"]')) return false;
        if (rc.querySelectorAll('.bk-row.bk-tally .wc-row').length !== 3) return false;
        const sharing = [...rc.querySelectorAll('.bk-row')]
          .find(r => ((r.querySelector('.bk-k') || {}).textContent || '').trim() === 'Sharing');
        if (!sharing || !/2 seats free/.test(sharing.textContent)) return false;
        return ![...pg.querySelectorAll('[data-do]')].some(x => !x.closest('.rc'));
      },
      wants: 'a class\'s receipt with Take a seat in its foot, its seats in Sharing and its tally as a row',
      leave: () => {
        if (window.__RC_WAS) USER = window.__RC_WAS;
        window.__RC_WAS = null;
        OPEN_JOB = '';
        STALE.booking = 1;
      } },

    /* ---------- AND THE OTHER KIND OF JOINING: A SESSION A FAMILY BOOKED --------------------------
       THE SAME THREE PIECES, MINUS THE TALLY, AND THE OTHER WORD. `Ask to join` is the tile and
       `job-join` its handler, and until this state nothing in either instrument had ever drawn it —
       `check/press.js` pressed `job-take-seat` for the first time with the state above, and would
       otherwise never press this one at all. `Sharing` is the row that said "Just you" to the very
       visitor this card offers a seat to; it says the seats now, and this asks that it does. */
    { name: 'a session with seats, seen by a family not on it',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.__RC_WAS = USER;
        USER = { name: 'Visiting Parent', personId: 'P900', person_id: 'P900',
                 role: 'parent', roles: ['parent'], handle: 'visitingparent' };
        DATA.liveJobs = (DATA.liveJobs || []).filter(j => j.id !== 'S-UI').concat([{
          id: 'S-UI', jobId: 'S-UI', type: 'job', kind: '', status: 'unconfirmed',
          title: 'GCSE Maths', subject: 'Maths', level: 'GCSE', location: 'Mitcham library',
          tutor: '', weekday: 'Wednesday', time: '17:00', hours: '1', term: 'Autumn 2026',
          maxKids: 4, currentKids: 1, dates: '07/10/26, 14/10/26, 21/10/26', createdAt: '22/09/2026',
          price: 240, slots: [{ n: 1, client: '', status: 'Waiting', chat: '' }],
          tutorSlots: [], events: [], splitEmails: '', clientHosts: false,
          canAsk: true, seatsGoing: 3, openToOthers: true, whenCould: null,
        }]);
        OPEN_JOB = 'S-UI';
        STALE.booking = 1;
        paint('booking');
        goPage('booking', typeof jobPageAt_ === 'function' ? jobPageAt_('S-UI') : 1, true);
      },
      expect: () => {
        const pg = [...document.querySelectorAll('#s-booking .page')]
          .find(p => /S-UI/.test((p.querySelector('.rc-ref') || {}).textContent || ''));
        const rc = pg && pg.querySelector('.rc');
        if (!rc || pg.querySelector('.join')) return false;
        if (!rc.querySelector('.rc-tiles [data-do="job-join"]')) return false;
        const sharing = [...rc.querySelectorAll('.bk-row')]
          .find(r => ((r.querySelector('.bk-k') || {}).textContent || '').trim() === 'Sharing');
        if (!sharing || !/3 seats free/.test(sharing.textContent)) return false;
        return ![...pg.querySelectorAll('[data-do]')].some(x => !x.closest('.rc'));
      },
      wants: 'a session\'s receipt with Ask to join in its foot and its open seats in Sharing',
      leave: () => {
        if (window.__RC_WAS) USER = window.__RC_WAS;
        window.__RC_WAS = null;
        OPEN_JOB = '';
        STALE.booking = 1;
      } },

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

    /* ---------- A PHOTOGRAPH THE DEPLOYMENT COULD NOT KEEP, AS AN ADMIN READS IT -----------------
       *"i cant send images, or videos in the chat to people."* The refusal `sendMessage` gives when
       Drive says no — the admin's version, because the visitor here IS the admin, and it is the
       widest thing a bubble's red line ever holds: several lines and a consent address with no
       space in it for a hundred characters, in 78% of 320px. And the THIRD control, Words only,
       which is drawn only for `why: 'files'` with something typed — so this is the one state that
       puts three 44px targets in that row. */
    { name: 'a photo the deployment could not keep',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        MESSAGES = [{ id: 'k1', mine: false, read: true, withId: 'P009', withName: 'Ada Tutor',
          fromName: 'Ada Tutor', at: '2026-09-16 09:12', body: 'Could you send a photo of his working?' }];
        const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        MSG_PENDING = [{ tmp: 'tmpK', mine: true, read: true, state: 'failed', why: 'files',
          withId: 'P009', withName: 'Ada Tutor', fromName: 'Test Admin', atMs: Date.now() - 30e3,
          body: 'Here is page 2',
          err: 'The file could not be kept, so nothing was sent. Drive refused it: this deployment holds '
             + 'drive.readonly, so it can read the folder and cannot add to it.'
             + '\nFIX: Open the consent link and press Allow, ticking every box; then run authoriseDrive in '
             + 'the Apps Script editor. Only when its last line says READY: Deploy → Manage deployments → '
             + 'edit → Version: New version → Deploy. Tools → Check uploads says when it has worked.'
             + '\nConsent link: https://accounts.google.com/o/oauth2/auth?client_id=1234567890-abcdefghij'
             + 'klmnopqrstuvwxyz.apps.googleusercontent.com&scope=https://www.googleapis.com/auth/drive',
          attachments: [{ url: png, type: 'image/png', name: 'page2.png' }],
          queue: [{ name: 'page2.png', type: 'image/png', size: 1000, url: png }] }];
        DM_ASKED = true; DM_DONE = true; MSG_FAILED = false; DM_LAST = Date.now();
        paint('dm');
      },
      /* AND THE ADDRESS IS NOT ALSO PRINTED: once it is a control, the sentence says "the button
         below" or drops the line that only labelled it — see `msgFailSaid_`. */
      expect: () => !!document.querySelector('#s-dm .msg-fail a.msg-act[href^="https://accounts.google.com"]')
                 && !/accounts\.google\.com|Consent link/.test((document.querySelector('#s-dm .msg-fail-why') || {}).textContent || 'x accounts.google.com')
                 && !document.querySelector('#s-dm .msg-fail a.msg-act[href^="https://www.googleapis.com/auth"]')
                 && !!document.querySelector('#s-dm [data-do="msg-words"]')
                 && !!document.querySelector('#s-dm [data-do="msg-retry"]')
                 && !!document.querySelector('#s-dm [data-do="msg-drop"]'),
      wants: 'the refusal with Retry, Words only, Remove and the consent screen as a fourth control',
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
      /* EMPTIED AS A PERSON EMPTIES IT, with `input`: the paragraph is a DRAFT now (data.js; docs/history
         317), kept as it was typed and drawn back by every redraw of Messages — set to '' without telling
         anybody, it came back in the next state's composer. */
      leave: () => {
        delete MSG_QUEUE['P009'];
        const b = document.querySelector('#s-dm .msg-text');
        if (b) { b.value = ''; b.style.height = ''; b.dispatchEvent(new Event('input', { bubbles: true })); }
      } },
  ],
};

/* ---------- NOTIFICATIONS, AS EACH ROLE IS SENT THEM — `notifyCard_` in js/me.js ----------------------------
   *"Also let parents select their communication preferences like notification. And kids and tutors too I
   guess"* (the owner, 9 Oct). The card draws whatever list the server sends on the profile, so a state is a
   ROLE and that role's LIST — and a list typed out here would be this file's belief about the server, the
   fault CLAUDE.md records as "a fixture must send what doGet really sends". So the lists are not typed: they
   are `notifyOf_` itself, asked of the real backend (js/check-gas-load.js) when this file is loaded, and
   written into each state's `enter` as data. A label or a note changed in NOTIFY_KINDS is measured on the
   next run without anybody touching this file.

   WHY `new Function`: every state is carried into the page as its source (`String(state.enter)`) and run
   there, so a closure over a value computed here would arrive empty. A function BUILT from source with the
   list already in it is the same thing the other states are — a line of the app's own code — with the
   server's answer as a literal.

   THE WIDEST CASE EACH: a parent on an address with no space in it, a parent whose address is still waiting
   for its link (the one extra paragraph), a kid with no email (one sentence, nothing to tick), a tutor, the
   admin who is the signed-in visitor, and a backend older than the site (one sentence). The role is played
   through `USER` as the sign-in reply sends it, and `DATA.features` says whether the backend has `setNotify`
   — the fixture's own list predates it. `leave` puts the visitor back exactly. */
(function notifyStates_() {
  let real = null, why = '';
  try { real = require('../js/check-gas-load.js').backend(); } catch (e) { why = String(e && e.message || e); }
  const listFor = (role, email, extra) => {
    if (!real) return null;
    try { return JSON.parse(JSON.stringify(real.ev('notifyOf_(' + JSON.stringify(Object.assign(
      { role: role, email: email, person_id: 'P-STATE', verified: 'TRUE' }, extra || {})) + ')'))); }
    catch (e) { why = String(e && e.message || e); return null; }
  };
  const LONG = 'philippa.parentington-smythe.family@example.org';
  const state = (name, as, notify, hasFeature, expect, wants) => ({
    name: 'notifications, ' + name,
    only: () => typeof USER !== 'undefined' && !!USER,
    /* NO LIST WHERE ONE WAS WANTED IS A THROW, so the state reads "could not reach" — loud — rather than
       measuring the "on their way" sentence and calling it the parent's card. */
    enter: new Function((notify === null && hasFeature
        ? 'throw new Error(' + JSON.stringify('notifyOf_ could not be asked of the real backend: ' + why) + ');\n' : '')
      + 'var AS = ' + JSON.stringify(as) + ', NOTIFY = ' + JSON.stringify(notify) + ', HAS = ' + JSON.stringify(hasFeature) + ';\n'
      + 'window.__NOTIFY_WAS = { role: USER.role, roles: USER.roles, profile: USER.profile, features: DATA.features };\n'
      /* THE VISITOR AS STORED, kept where a reload cannot reach it — see `leave`. Only the first time: a state
         entered again after a reload must not keep the role it played as the visitor's own. */
      + 'try { if (sessionStorage.getItem("notifyStateUser") === null) sessionStorage.setItem("notifyStateUser", localStorage.getItem("familyUser") || ""); } catch (e) {}\n'
      + 'Object.assign(USER, AS);\n'
      + 'USER.profile = Object.assign({}, USER.profile || {});\n'
      + 'if (NOTIFY) USER.profile.notify = NOTIFY; else delete USER.profile.notify;\n'
      + 'DATA.features = (DATA.features || []).filter(function (x) { return x !== "setNotify"; }).concat(HAS ? ["setNotify"] : []);\n'
      /* A CLEAN COLUMN FIRST — `settingsKeep_`, the agreement state's reason. */
      + 'document.querySelectorAll("#s-settings .me-form").forEach(function (f) { f.removeAttribute("data-dirty"); f.classList.remove("is-sending"); });\n'
      + 'paint("settings");\n'
      + 'var at = [].slice.call(document.querySelectorAll("#s-settings .page")).findIndex(function (pg) { return pg.querySelector(".notify-card"); });\n'
      + 'if (at < 0) throw new Error("no Notifications card on the settings column");\n'
      + 'goPage("settings", at, true);'),
    /* ---------- AND THE STORED VISITOR PUT BACK, NOT ONLY THE ONE IN MEMORY ----------------------------------
       FOUND BY `check/press.js`: a tick pressed in "a parent" is a real save, and a real save writes `USER` to
       `familyUser` — as the parent this state was playing. Every reload after it (`freshen`, the next screen's
       visit) then signed the run in as that parent, and the Games column's swipes and the booking form's
       dropdown were measured for somebody who is not the visitor: two swipes "landed on page 2", wanted 3. So
       the stored visitor is kept in `sessionStorage` by `enter` and written back here, and `USER` is put back
       from it rather than from a copy a reload may have taken of the parent. */
    leave: () => {
      const was = window.__NOTIFY_WAS || {}; delete window.__NOTIFY_WAS;
      let raw = null;
      try { raw = sessionStorage.getItem('notifyStateUser'); sessionStorage.removeItem('notifyStateUser'); } catch (e) {}
      let stored = null;
      try { stored = raw ? JSON.parse(raw) : null; } catch (e) { stored = null; }
      const from = stored || was;
      USER.role = from.role; USER.roles = from.roles; USER.profile = from.profile; DATA.features = was.features;
      try { if (raw) localStorage.setItem('familyUser', raw); } catch (e) {}
      document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
      paint('settings');
    },
    expect: expect,
    wants: wants,
  });
  /* THE CARD IN FRONT, NOT RUNNING OFF THE SIDE, with this many ticks (all ticked — an untouched row is on)
     and this many lines of what is always sent. */
  const ticks = (n, must) => new Function('var c = document.querySelector("#s-settings .page.on .notify-card");\n'
    + 'if (!c) return 0;\n'
    + 'var t = c.querySelectorAll("[data-do=\\"notify-pick\\"]");\n'
    + 'return t.length === ' + n + ' && [].every.call(t, function (b) { return b.checked; })\n'
    + '  && c.querySelectorAll(".notify-always li").length === ' + must + '\n'
    + '  && c.scrollWidth <= c.clientWidth + 1 ? 1 : 0;');
  const said = re => new Function('var c = document.querySelector("#s-settings .page.on .notify-card");\n'
    + 'return c && !c.querySelector("[data-do=\\"notify-pick\\"]") && ' + re + '.test(c.textContent)'
    + ' && c.scrollWidth <= c.clientWidth + 1 ? 1 : 0;');
  const count = (n, essential) => ((n && n.kinds) || []).filter(k => !!k.essential === essential).length;
  const parent = listFor('client', LONG), held = listFor('client', LONG, { verified: 'PENDING' });
  const kid = listFor('student', ''), tutor = listFor('tutor', 'tutor@example.org'), admin = listFor('admin', 'admin@example.org');
  STATES.settings.push(
    state('a parent', { role: 'parent', roles: ['parent'] }, parent, true, ticks(count(parent, false), count(parent, true)),
      'a parent\'s ticks — the weekly email "not being sent yet", messages, booking updates, posts — and the four always sent'),
    state('a parent whose address waits for its link', { role: 'parent', roles: ['parent'] }, held, true,
      new Function('var c = document.querySelector("#s-settings .page.on .notify-card");\n'
        + 'return c && c.querySelector(".notify-held") && c.querySelectorAll("[data-do=\\"notify-pick\\"]").length === ' + count(held, false)
        + ' && c.scrollWidth <= c.clientWidth + 1 ? 1 : 0;'),
      'the parent\'s ticks under a line saying only the link goes to the address until it is opened'),
    state('a kid with no email', { role: 'kid', roles: ['kid'] }, kid, true, said('/no email address/'),
      'one sentence — nothing is emailed to a child with no address — and nothing to tick'),
    state('a tutor', { role: 'tutor', roles: ['tutor'] }, tutor, true, ticks(count(tutor, false), count(tutor, true)),
      'a tutor\'s ticks — messages, booking updates, posts — and the three always sent'),
    state('the admin', { role: 'admin', roles: ['admin'] }, admin, true, ticks(count(admin, false), count(admin, true)),
      'the admin\'s ticks — messages, festive sign-ups, posts waiting — and the three always sent'),
    state('a backend older than the site', { role: 'parent', roles: ['parent'] }, null, false, said('/does not have notification choices yet/'),
      'one sentence saying the backend has no notification choices yet, and nothing to tick'));
})();

const statesOf = id => STATES[id] || [{ name: '' }];

module.exports = { STATES, statesOf };
