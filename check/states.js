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
           is never in and would have measured the wrong screen.
           `stuffForget_` RATHER THAN THE THREE BY NAME: there are two finders now (docs/history/329), and
           the names are the bound one's; the app's own forgetting empties every finder's. */
        stuffForget_();
        STUFF.filters = []; STUFF.q = '';
        paintStuff();
      },
      leave: () => {
        const held = window.__LIB_HELD || { rows: null, data: {} };
        Object.keys(held.data).forEach(k => { DATA[k] = held.data[k]; });
        LIBRARY_ROWS = held.rows;
        stuffForget_();
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
    /* ---------- A QUESTION DRAWN ON THE PAPER'S OWN FIGURE: ITS BOX, AND `Draw` -----------------------------------
       THE PEN WAS ON THE FIGURE PAGE, and the state that stood here ("a diagram you can draw on") turned to that
       page and measured the lock over the picture. Since the owner's 11 Oct *"simplest and most uniform"* the
       pen is the card's other face for every question answered by drawing (docs/history/337), so the paper's
       own figure is measured where a made-up surface is: on the card, on its box first, then switched. June
       2024 1F Q7, *"On the grid, draw a suitable diagram or chart for this information"* -- the review's own
       example, whose paper prints a blank grid, which read side by side with the owner's hexagon exactly as
       that did. By id, so it follows the row; the face set to the box first, as a device that never chose. */
    { name: 'a question drawn on the paper\'s own figure, on its answer box with a Draw tile',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-1F-7');
        if (!it) throw new Error('Q-1MA1-2406-1F-7 is not in the library');
        if (!padSource_(it) || padSource_(it).from !== 'part') throw new Error('Q-1MA1-2406-1F-7 is not drawn on its own figure any more');
        window.__faceItem = it;
        padFaceSet_(padKey_(it), 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        const page = a && a.closest('.page');
        const tile = page && [...page.querySelectorAll('.q-drawt')].find(b => b.getAttribute('data-key') === it.key);
        /* AND "FIGURE ON THE NEXT PAGE" SHOWN: true on the box, whose figure is the page after (the switched state
           below asks that it goes when the figure is under the pen). Only a browser computes `:has`. */
        const ref = [...a.closest('.qcard').querySelectorAll('.qsheet-figref')];
        return !!tile && !a.classList.contains('is-draw') && !!a.querySelector('.qp-ans .kp-in') && !page.querySelector('.qpad')
               && (tile.getAttribute('aria-label') || '') === 'Draw · on the figure'
               && ref.length > 0 && ref.every(e => getComputedStyle(e).display !== 'none');
      },
      wants: 'June 2024 1F Q7 on its card: the answer box, "Figure on the next page" over it, no pen anywhere on the page, and "Draw · on the figure" in the row under it',
      leave: () => { padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- THE SAME CARD, SWITCHED TO ITS FIGURE -------------------------------------------------------------
       `Draw` through its own handler: the box gives way IN PLACE to the paper's own grid under the pen -- the
       picture its figure page draws, on the same `pad:` key that page used, so every drawing made there is
       here -- with the lock (off: the card arrives with the pen off), Undo and Clear, the card's one line of
       credit ("The paper's figure, redrawn.") and no "Not the paper's own figure"; the tile reads `Type`, and
       the page has not moved. AND TWO THINGS THE REVIEW OF 337 FOUND NOTHING HOLDING:
         "Figure on the next page" is hidden -- the figure is right under it. The rule is one line of
           style.css (`.qcard:has(> .qp-area.is-draw) .qsheet-figref`), and deleting it left every check green
           while 198 cards pointed at the next page over the figure under the pen.
         Q7's grid is blank -- nothing to read in it -- so it gives way BEFORE the card's words, as a made-up
           grid does (`padFaceFit_`): the words drawn smaller only once the grid is at its floor. Split by who
           drew it, Q7's question went to 0.7 at 320 beside a made-up blank grid's at 0.95. */
    { name: 'a question drawn on the paper\'s own figure, switched to its figure under the pen',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-1F-7');
        if (!it) throw new Error('Q-1MA1-2406-1F-7 is not in the library');
        window.__faceItem = it;
        padFaceSet_(padKey_(it), 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        window.__facePage = (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it);
        goPage('stuff', window.__facePage, true);
        const h = document.createElement('div');
        h.innerHTML = drawTile_(it);
        if (!h.firstElementChild) throw new Error('Q-1MA1-2406-1F-7 has no Draw tile');
        ACTIONS['q-draw'](h.firstElementChild);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        const page = a && a.closest('.page');
        const tile = page && [...page.querySelectorAll('.q-drawt')].find(b => b.getAttribute('data-key') === it.key);
        const pad = a && a.querySelector('.qpad');
        const art = pad && pad.querySelector('.qpad-art > svg:first-child');
        const words = a && a.closest('.qcard').querySelector(':scope > .qsheet');
        return !!tile && a.classList.contains('is-draw') && !a.querySelector('.qp-ans')
               && !!pad && pad.getAttribute('data-k') === padKey_(it) && !pad.classList.contains('is-drawing')
               && !!art && !art.classList.contains('qsurf') && /^A grid of squares/.test(art.getAttribute('aria-label') || '')
               && !!pad.querySelector('.qpad-art[data-do="pad-draw"]') && !!pad.querySelector('.qpad-lock')
               && !!pad.querySelector('.qpad-undo') && !!pad.querySelector('.qpad-clear')
               && ((pad.querySelector(':scope > .fig-by') || {}).textContent || '').trim() === 'The paper\u2019s figure, redrawn.'
               && !/not the paper.s own figure/i.test(pad.textContent)
               && /^Type\b/.test(tile.getAttribute('aria-label') || '') && PAGE.stuff === window.__facePage
               && [...a.closest('.qcard').querySelectorAll('.qsheet-figref')].every(e => getComputedStyle(e).display === 'none')
               && !padFaceReads_(art) && (!words || !words.style.zoom || art.getBoundingClientRect().width <= PAD_FACE_FLOOR + 0.5);
      },
      wants: 'June 2024 1F Q7\'s own grid under the pen where its box was, on its pad: key, the pen off with the lock, Undo and Clear, the card\'s one line of credit, the tile reading Type, on the same page, no "Figure on the next page" over it, and its words drawn smaller only once the blank grid is at its floor',
      leave: () => { padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- AND ITS FIGURE PAGE, A PICTURE TO LOOK AT ------------------------------------------------------------
       A picture the paper prints keeps its own page, where the paper prints it -- Q7's row marks its figure
       after the ask, so the page after the card -- and the page is the picture and its credit: no lock, no
       Undo, no Clear, nothing that takes a finger. That page is where the pen was until 11 Oct. */
    { name: 'the paper\'s own figure on its page, a picture to look at with no pen',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-1F-7');
        if (!it) throw new Error('Q-1MA1-2406-1F-7 is not in the library');
        if (pageParts_(it).indexOf('fig') < 0) throw new Error('Q-1MA1-2406-1F-7 has no figure page: ' + JSON.stringify(pageParts_(it)));
        window.__faceItem = it;
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'fig'), true);
      },
      expect: () => {
        const it = window.__faceItem;
        const page = document.querySelector('#s-stuff .page.on');
        const c = page && page.querySelector('.qcard.qfig');
        return !!c && c.getAttribute('data-of') === it.row.row_id && !!c.querySelector('figure svg[aria-label^="A grid of squares"]')
               && /drawn for @family/.test(c.textContent) && !page.querySelector('.qpad, .qpad-lock, [data-do^="pad-"]');
      },
      wants: 'Q7\'s grid on its own figure page, credited, with no pen, no lock and nothing to press',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A STEM'S MAP UNDER ONE PART'S OWN PEN -----------------------------------------------------------------
       The bearings sheet's Q2 opens with a map that (a), (b) and (c) each draw on. Each part's pen was on a
       copy of the map on its own figure page; the map is the stem's page now, once, and each part's Draw
       puts it under that part's own pen, on that part's key. (b), so it is not simply the page after the map. */
    { name: 'a stem\'s map switched to under the second part\'s own pen',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1CM-bearings-2b');
        if (!it) throw new Error('Q-1CM-bearings-2b is not in the library');
        if (!padSource_(it) || typeof padSource_(it).from !== 'object') throw new Error('Q-1CM-bearings-2b is not drawn on its stem\'s map any more');
        window.__faceItem = it;
        padFaceSet_(padKey_(it), 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        window.__facePage = (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it);
        goPage('stuff', window.__facePage, true);
        const h = document.createElement('div');
        h.innerHTML = drawTile_(it);
        if (!h.firstElementChild) throw new Error('Q-1CM-bearings-2b has no Draw tile');
        ACTIONS['q-draw'](h.firstElementChild);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        const pad = a && a.querySelector('.qpad');
        const art = pad && pad.querySelector('.qpad-art > svg:first-child');
        return !!pad && a.classList.contains('is-draw') && pad.getAttribute('data-k') === padKey_(it)
               && !!art && /^A map of an island/.test(art.getAttribute('aria-label') || '')
               && !stuffPages_().some(pg => pg.x === it && pg.part === 'fig') && PAGE.stuff === window.__facePage;
      },
      wants: 'bearings Q2(b)\'s card with the stem\'s map under its own pen, on its own key, and no figure page of its own in the strip',
      leave: () => { padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- THE TALLEST PAPER FIGURE SWITCHED TO: EVERY TILE A FINGERTIP, `Type` ON THE GLASS, THE FIGURE WHOLE ----
       The transformations-of-graphs sheet's Q8 stem: four sine grids stacked, 340 by 640 -- 1.88 times as tall as
       it is wide, the tallest of the 470, shared by (a), (b) and (c). At 320x568 its natural width draws it 420px
       tall in a 534px pane, so the square shrink 327 wrote for a made-up grid would have taken nearly twice the
       width it needed. `padFaceFit_` works from the drawing's own shape now; its graphs carry axis numbers, so
       the words give way first, then the figure, to `PAD_FACE_FLOOR` and never under it. The dice table's
       `expect`, asked of this card, and more: the whole picture inside the pane; a picture drawn narrower than
       its page only by as much as the card needed -- a pane that fits with room to spare under a narrowed
       figure is the square shrink back, taking width by the pixel of height when a figure this tall gives
       nearly two; never under the floor (it was 179px at 320 for "the face on the glass at once", a rule that
       took it to 88px on a phone on its side -- check/press.js turns one); and narrowed only once the words
       are at `PANE_ZOOM_MIN`, which is the order a picture with something to read in it gives way in. Every
       width. */
    { name: 'the tallest paper figure switched to its drawing, its tiles a fingertip, Type and the whole figure on the glass',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1CM-transformations-of-graphs-8');
        if (!it) throw new Error('Q-1CM-transformations-of-graphs-8 is not in the library');
        if (!padSource_(it) || padSource_(it).from === 'surface') throw new Error('Q-1CM-transformations-of-graphs-8 is not drawn on its stem\'s figure any more');
        window.__faceItem = it;
        padFaceSet_(padKey_(it), 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        const h = document.createElement('div');
        h.innerHTML = drawTile_(it);
        if (!h.firstElementChild) throw new Error('Q-1CM-transformations-of-graphs-8 has no Draw tile');
        ACTIONS['q-draw'](h.firstElementChild);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        if (!a || !a.classList.contains('is-draw')) return false;
        const pane = a.closest('.pane');
        const tile = [...a.closest('.page').querySelectorAll('.q-drawt')].find(b => b.getAttribute('data-key') === it.key);
        const art = a.querySelector('.qpad-art > svg:first-child');
        if (!pane || !tile || !art) return false;
        const side = e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); };
        const taps = [...a.querySelectorAll('.qpad-bar [data-do]')].concat([tile]);
        const pr = pane.getBoundingClientRect(), tr = tile.getBoundingClientRect(), fr = art.getBoundingClientRect();
        const hit = document.elementFromPoint(tr.left + tr.width / 2, tr.top + tr.height * 0.9);
        const words = a.closest('.qcard').querySelector(':scope > .qsheet');
        const gave = words && Math.abs(parseFloat(words.style.zoom || '1') - PANE_ZOOM_MIN) < 0.001;
        /* THE ROOM LEFT UNUSED: a pane is as tall as what is in it, up to its cap (`max-height`), so the room a
           narrowed figure gave away and did not need is the cap less the pane's height. */
        const cap = parseFloat(getComputedStyle(pane).maxHeight);
        const slack = isFinite(cap) ? cap - pane.clientHeight : 0;
        return taps.length >= 4 && taps.every(e => side(e) >= 43.5)
               && [...pane.children].every(k => !k.style.zoom)
               && tr.top >= pr.top - 0.5 && tr.bottom <= pr.bottom + 0.5
               && !!hit && tile.contains(hit)
               && fr.top >= pr.top - 0.5 && fr.bottom <= pr.bottom + 0.5
               && (!art.style.width || pane.style.overflowY === 'auto' || slack <= 16)
               && (pane.style.overflowY !== 'auto' || !!gave)
               && fr.width >= PAD_FACE_FLOOR - 0.5 && padFaceReads_(art) && (!art.style.width || !!gave);
      },
      wants: 'the four sine grids under the pen with the lock, Undo, Clear and Type at 44px on the glass, nothing drawn smaller whole, Type where a press lands on it, the whole figure inside the pane, no narrower than the floor, narrowed only after the words, and no scroll before the words have given way',
      leave: () => { padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A DENSE FIGURE THAT GIVES WAY TO ITS FLOOR AND NO FURTHER ---------------------------------------------
       AQA Chemistry, June 2024 Paper 2F Q1.9: "Complete Figure 2" -- a percentage grid of 2mm squares with its
       axis labels 13 units in a 340-unit box, under a page of words and a pen bar of six tiles on two rows. At
       320x568 its words go to `PANE_ZOOM_MIN`, then its figure to `PAD_FACE_FLOOR` (180px wide: its 13-unit
       labels 6.9px, its 9-unit axis captions 4.8px -- "labels at 6.9px" was said of all of them until the review
       of 337 measured the captions), and what is left scrolls. Without the floor it would have kept shrinking
       until the card fitted -- labels at 5px and squares a finger cannot tell apart, to save one short scroll;
       the owner's "I don't like scrolling" is answered by the words and the figure giving what they can and
       not past it. At 390 and wider it is drawn at its page's size. The `expect` is the tall figure's, the
       floor, and the order: a figure with labels in it is narrowed only once the words are at their floor. */
    { name: 'a dense paper figure switched to its drawing, given way to its floor and no further',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-AQA-8462-2406-2F-019');
        if (!it) throw new Error('Q-AQA-8462-2406-2F-019 is not in the library');
        if (!padSource_(it) || padSource_(it).from !== 'part') throw new Error('Q-AQA-8462-2406-2F-019 is not drawn on its own figure any more');
        window.__faceItem = it;
        padFaceSet_(padKey_(it), 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        const h = document.createElement('div');
        h.innerHTML = drawTile_(it);
        if (!h.firstElementChild) throw new Error('Q-AQA-8462-2406-2F-019 has no Draw tile');
        ACTIONS['q-draw'](h.firstElementChild);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        if (!a || !a.classList.contains('is-draw')) return false;
        const pane = a.closest('.pane');
        const tile = [...a.closest('.page').querySelectorAll('.q-drawt')].find(b => b.getAttribute('data-key') === it.key);
        const art = a.querySelector('.qpad-art > svg:first-child');
        if (!pane || !tile || !art) return false;
        const side = e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); };
        const taps = [...a.querySelectorAll('.qpad-bar [data-do]')].concat([tile]);
        const pr = pane.getBoundingClientRect(), tr = tile.getBoundingClientRect(), fr = art.getBoundingClientRect();
        const hit = document.elementFromPoint(tr.left + tr.width / 2, tr.top + tr.height * 0.9);
        const words = a.closest('.qcard').querySelector(':scope > .qsheet');
        const gave = words && Math.abs(parseFloat(words.style.zoom || '1') - PANE_ZOOM_MIN) < 0.001;
        return taps.length >= 6 && taps.every(e => side(e) >= 43.5)
               && [...pane.children].every(k => !k.style.zoom)
               && tr.top >= pr.top - 0.5 && tr.bottom <= pr.bottom + 0.5 && !!hit && tile.contains(hit)
               && fr.top >= pr.top - 0.5 && fr.bottom <= pr.bottom + 0.5
               && (!art.style.width || parseFloat(art.style.width) >= PAD_FACE_FLOOR) && fr.width >= PAD_FACE_FLOOR - 0.5
               && (pane.style.overflowY !== 'auto' || !!gave)
               && padFaceReads_(art) && (!art.style.width || !!gave);
      },
      wants: 'the chemistry grid under the pen, no narrower than the floor and narrowed only after the words, its six tiles and Type at 44px on the glass, the whole figure inside the pane, and a scroll only once the words have given way',
      leave: () => { padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A FIGURE WITH NUMBERS IN IT, WHOSE CARD'S WORDS ALONE MAKE THE ROOM -----------------------------------
       June 2024 2H Q21, *"On the grid, draw the graph of y = g(-x) + 2"*: a coordinate grid numbered -6 to 6 with
       g(x) drawn on it. At 320x568 its card fits once its words give way (to about 0.79), its grid at its page's
       size. THE ORDER IS THE POINT, and the two states above cannot hold it alone: there the words run out and
       the figure is narrowed anyway, which a rule that narrowed the figure FIRST also arrives at -- the review
       of 337 made every picture give way first and every check stayed green. Here a figure-first rule narrows
       the grid (its numbers smaller) to save the words a squeeze they could take. So: a picture with something
       to read in it is narrowed only once the words are at `PANE_ZOOM_MIN` -- here, not at all. At 390 and wider
       nothing gives way and the `expect` is the plain one. */
    { name: 'a figure with numbers in it switched to its drawing, its card\'s words giving way first and the figure kept whole',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-2H-21');
        if (!it) throw new Error('Q-1MA1-2406-2H-21 is not in the library');
        if (!padSource_(it) || padSource_(it).from !== 'part') throw new Error('Q-1MA1-2406-2H-21 is not drawn on its own figure any more');
        window.__faceItem = it;
        padFaceSet_(padKey_(it), 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        const h = document.createElement('div');
        h.innerHTML = drawTile_(it);
        if (!h.firstElementChild) throw new Error('Q-1MA1-2406-2H-21 has no Draw tile');
        ACTIONS['q-draw'](h.firstElementChild);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        if (!a || !a.classList.contains('is-draw')) return false;
        const pane = a.closest('.pane');
        const tile = [...a.closest('.page').querySelectorAll('.q-drawt')].find(b => b.getAttribute('data-key') === it.key);
        const art = a.querySelector('.qpad-art > svg:first-child');
        if (!pane || !tile || !art) return false;
        const side = e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); };
        const taps = [...a.querySelectorAll('.qpad-bar [data-do]')].concat([tile]);
        const pr = pane.getBoundingClientRect(), tr = tile.getBoundingClientRect(), fr = art.getBoundingClientRect();
        const hit = document.elementFromPoint(tr.left + tr.width / 2, tr.top + tr.height * 0.9);
        const words = a.closest('.qcard').querySelector(':scope > .qsheet');
        const gave = words && Math.abs(parseFloat(words.style.zoom || '1') - PANE_ZOOM_MIN) < 0.001;
        return taps.length >= 4 && taps.every(e => side(e) >= 43.5)
               && [...pane.children].every(k => !k.style.zoom)
               && tr.top >= pr.top - 0.5 && tr.bottom <= pr.bottom + 0.5 && !!hit && tile.contains(hit)
               && fr.top >= pr.top - 0.5 && fr.bottom <= pr.bottom + 0.5
               && padFaceReads_(art) && (!art.style.width || !!gave);
      },
      wants: 'June 2024 2H Q21\'s numbered grid under the pen, its tiles and Type at 44px on the glass, the whole grid in the pane, and the grid narrowed only if the words are already at their floor',
      leave: () => { padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
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
    /* ---------- A QUESTION ANSWERED ON A MADE-UP SURFACE: ONE CARD, THE BOX, AND `Draw` -----------------
       THE OWNER, 10 Oct, over this very card: *"this is confusing. theres an answer box and draw box? in
       questions which require a drawing, just leave it as an answer box like before but theres an option
       to switch to drawing box."* KS1 "How many sides has a hexagon?" -- a one-word answer whose row gives
       it a blank space to count on -- was the box, "Space to draw on the next page", and a page after it
       headed "Space to draw". Now it is ONE card: the box as on any question, no line pointing on, and a
       `Draw` tile in the row under the card; and no surface page anywhere in the strip. Named, because it
       is the owner's own screenshot. The face is set to the box first, as a device that never chose. */
    { name: 'a question answered on a surface, on its answer box with a Draw tile',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-CBM-2d-shapes-2');
        if (!it) throw new Error('Q-CBM-2d-shapes-2 ("How many sides has a hexagon?") is not in the library');
        if (typeof surfaceOf_ !== 'function' || !surfaceOf_(it)) throw new Error('Q-CBM-2d-shapes-2 is not answered on a surface any more');
        window.__faceItem = it;
        padFaceSet_(padKey_(it), 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        const page = a && a.closest('.page');
        const tile = page && [...page.querySelectorAll('.q-drawt')].find(b => b.getAttribute('data-key') === it.key);
        return !!tile && !a.classList.contains('is-draw') && !!a.querySelector('.qp-ans .kp-in') && !a.querySelector('.qpad')
               && /^Draw\b/.test(tile.getAttribute('aria-label') || '') && !page.querySelector('.qsheet-figref')
               && !stuffPages_().some(pg => pg.x === it && pg.part === 'fig');
      },
      wants: 'the hexagon question as one card: its answer box, no "on the next page" line, a Draw tile in the row under it, and no surface page in the strip',
      leave: () => { padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- THE SAME CARD, SWITCHED TO THE DRAWING ------------------------------------------------------
       `Draw` pressed through its own handler, as a finger does: the box gives way IN PLACE to the blank
       space under the pen -- lock, Undo, Clear, the line saying it is not the paper's own figure -- and the
       tile reads `Type`. The page does not change: both faces are one page. */
    { name: 'a question answered on a surface, switched to the drawing',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-CBM-2d-shapes-2');
        if (!it) throw new Error('Q-CBM-2d-shapes-2 ("How many sides has a hexagon?") is not in the library');
        window.__faceItem = it;
        padFaceSet_(padKey_(it), 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        window.__facePage = (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it);
        goPage('stuff', window.__facePage, true);
        const h = document.createElement('div');
        h.innerHTML = drawTile_(it);
        if (!h.firstElementChild) throw new Error('Q-CBM-2d-shapes-2 has no Draw tile');
        ACTIONS['q-draw'](h.firstElementChild);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        const page = a && a.closest('.page');
        const tile = page && [...page.querySelectorAll('.q-drawt')].find(b => b.getAttribute('data-key') === it.key);
        return !!tile && a.classList.contains('is-draw') && !a.querySelector('.qp-ans')
               && !!a.querySelector('.qpad .qpad-art > svg.qsurf.is-blank') && !!a.querySelector('.qpad-lock')
               && !!a.querySelector('.qpad-undo') && !!a.querySelector('.qpad-clear')
               && /not the paper.s own figure/i.test(a.textContent) && /^Type\b/.test(tile.getAttribute('aria-label') || '')
               && PAGE.stuff === window.__facePage;
      },
      wants: 'the hexagon card with a blank space under the pen where its box was, lock, Undo and Clear under it, saying it is not the paper\'s figure, the tile reading Type, on the same page',
      leave: () => { padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A SQUARED GRID, SWITCHED TO ------------------------------------------------------------------
       *"some questions require answers on diagram. So should have a diagram for them to draw on"* -- the
       first question in the library on a squared-grid SURFACE, found by the app's own rule so the state
       follows the data as the paper's own figures are redrawn. Switched to through `Draw`; the grid under
       the pen with every tool its question asks for (`padTools_`: KS2 "Draw the reflection... Use a ruler"
       brings the Ruler), and nothing of it on a page of its own. */
    { name: 'a question answered on a squared grid, switched to the drawing',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && typeof surfaceOf_ === 'function'
          && surfaceOf_(x) && padSurface_(x) === 'grid');
        if (!it) throw new Error('no question in the library stands on a squared-grid surface');
        window.__faceItem = it;
        padFaceSet_(padKey_(it), 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        const h = document.createElement('div');
        h.innerHTML = drawTile_(it);
        if (!h.firstElementChild) throw new Error(it.row.row_id + ' has no Draw tile');
        ACTIONS['q-draw'](h.firstElementChild);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        const tools = a ? [...a.querySelectorAll('.qpad-tool')].map(b => b.getAttribute('data-tool')).join(' ') : '';
        const want = padToolsOf_(it).length > 1 ? padToolsOf_(it).join(' ') : '';
        return !!a && a.classList.contains('is-draw') && !!a.querySelector('.qpad .qpad-art > svg.qsurf.is-grid')
               && !a.querySelector('.qp-ans') && tools === want
               && !stuffPages_().some(pg => pg.x === it && pg.part === 'fig');
      },
      wants: 'a squared grid under the pen on the question card, in the box\'s place, with the tools its question asks for, and no page of its own',
      leave: () => { padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- AXES, SWITCHED TO ----------------------------------------------------------------------------
       NO ROW IN THE LIBRARY IS ON AXES TODAY (every coordinate grid the papers print has been drawn), so,
       as the passage state does for `text`, this gives a real squared-grid row `surface: "coord"` for the
       length of the state -- the value a row would carry -- through the app's own memo, and switches to it. */
    { name: 'a question answered on axes, switched to the drawing',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && typeof surfaceOf_ === 'function'
          && surfaceOf_(x) && padSurface_(x) === 'grid');
        if (!it) throw new Error('no question in the library stands on a squared-grid surface to put axes on');
        window.__faceItem = it;
        window.__faceHad = it.surface;
        it.surface = 'coord';
        CHUNK_MEMO.delete(it);
        padFaceSet_(padKey_(it), 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        const h = document.createElement('div');
        h.innerHTML = drawTile_(it);
        if (!h.firstElementChild) throw new Error(it.row.row_id + ' has no Draw tile');
        ACTIONS['q-draw'](h.firstElementChild);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        return !!a && a.classList.contains('is-draw') && !!a.querySelector('.qpad .qpad-art > svg.qsurf.is-coord line.axis')
               && !a.querySelector('.qp-ans');
      },
      wants: 'axes on a grid under the pen on the question card, in the box\'s place',
      leave: () => {
        const it = window.__faceItem;
        if (it) { it.surface = window.__faceHad || ''; CHUNK_MEMO.delete(it); }
        padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- A TALL QUESTION SWITCHED TO ITS DRAWING: EVERY TILE A FINGERTIP, AND `Type` ON THE GLASS -----------
       FOUND IN REVIEW OF 327, at 320x568: with the grid at its floor, 27 of the 62 surface cards still passed
       their pane and `paneReach_` drew each of them smaller WHOLE -- the pen's lock, Undo and Clear and the
       `Type` tile at 31 to 42px. This card was the worst: 5-a-day 24 October Q4a, a 7x7 dice table above
       the grid, drawn at the 0.7 floor and still 9px over, so the pane neither fitted nor scrolled and `Type`
       -- the one way back to the box -- was cut in half by its edge. Now the grid gives way, then the words,
       never the tiles, and a card still over scrolls to its foot (`padFaceFit_`, `paneReach_`).
       THE `expect` IS THE RULE, because nothing else here can see it: `check/ui.js` judges a control at the
       size the stylesheet gave it (a whole card drawn at 0.7 has 44px tiles as far as it knows), and a pane
       9px over is inside `PANE_REACH`'s tolerance. So this asks the glass: every pen tile and `Type` at 44px
       on the screen, no card drawn smaller whole, and `Type` inside its pane and hit at 90% of its height --
       the reviewer's own test, which missed it at 85% and 95%. Every width; it was red at 320. */
    { name: 'a tall question switched to the drawing, its tiles a fingertip and Type on the glass',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-CBM-5AD-F-1024-5');
        if (!it) throw new Error('Q-CBM-5AD-F-1024-5 (5-a-day 24 October, the dice table) is not in the library');
        if (typeof surfaceOf_ !== 'function' || !surfaceOf_(it)) throw new Error('Q-CBM-5AD-F-1024-5 is not answered on a surface any more');
        window.__faceItem = it;
        padFaceSet_(padKey_(it), 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        /* THE TILE `drawTile_` DRAWS, pressed through its own handler, as the hexagon's state does: the page is
           filled a frame after `goPage`, and the handler rewrites every copy on the screen and keeps the face. */
        const h = document.createElement('div');
        h.innerHTML = drawTile_(it);
        if (!h.firstElementChild) throw new Error('Q-CBM-5AD-F-1024-5 has no Draw tile');
        ACTIONS['q-draw'](h.firstElementChild);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        if (!a || !a.classList.contains('is-draw')) return false;
        const pane = a.closest('.pane');
        const tile = [...a.closest('.page').querySelectorAll('.q-drawt')].find(b => b.getAttribute('data-key') === it.key);
        if (!pane || !tile) return false;
        const side = e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); };
        const taps = [...a.querySelectorAll('.qpad-bar [data-do]')].concat([tile]);
        const pr = pane.getBoundingClientRect(), tr = tile.getBoundingClientRect();
        const hit = document.elementFromPoint(tr.left + tr.width / 2, tr.top + tr.height * 0.9);
        /* AND THE PANE SCROLLS ONLY ONCE THE WORDS HAVE GIVEN ALL THEY CAN: a card that scrolls with its words
           at full size is the owner's "I don't like scrolling" for nothing. */
        const words = a.closest('.qcard').querySelector(':scope > .qsheet');
        const gave = words && Math.abs(parseFloat(words.style.zoom || '1') - PANE_ZOOM_MIN) < 0.001;
        return taps.length >= 4 && taps.every(e => side(e) >= 43.5)
               && [...pane.children].every(k => !k.style.zoom)
               && tr.top >= pr.top - 0.5 && tr.bottom <= pr.bottom + 0.5
               && !!hit && tile.contains(hit)
               && (pane.style.overflowY !== 'auto' || !!gave);
      },
      wants: 'the dice-table card on its drawing with the lock, Undo, Clear and Type at 44px on the glass, nothing drawn smaller whole, Type inside its pane where a press lands on it, and no scroll before its words have given way',
      leave: () => { padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- AND THE PEN'S TOAST OVER THE ROW TAKES NO PRESS ------------------------------------------------
       FOUND IN REVIEW OF 327: on the drawing, the row under the card sits at the foot of the column, which is
       where `toast()` speaks -- "Cleared. Undo puts it back.", "Nothing to undo" -- and for 2.6 seconds a tap
       on `Type` landed on the toast and nothing switched; at 320x568 the hit test at the tile's centre
       returned the toast. The toast is words with nothing to press, so it passes every press through
       (`#toast`, style.css). Cleared through the pen's own handler, on the owner's hexagon with a stroke on
       it; the toast's own timer stopped so it is still up when this is measured, and taken down on leave.
       Asked at the toast's centre (a press there reaches what is under it, at every width) and at `Type`'s
       (a press on the tile is the tile's, whether or not the toast is over it at this width). */
    { name: 'a question switched to the drawing and Cleared, the toast over its row taking no press',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-CBM-2d-shapes-2');
        if (!it) throw new Error('Q-CBM-2d-shapes-2 ("How many sides has a hexagon?") is not in the library');
        window.__faceItem = it;
        try { localStorage.setItem(padKey_(it), JSON.stringify([[60, 60, 200, 60, 200, 200]])); } catch (e) {}
        padFaceSet_(padKey_(it), 'draw');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        /* PRESSED ONCE THE PAGE IS FILLED -- a frame or two after `goPage`, longer on a busy machine -- and
           `expect` waits for the toast it says. */
        const press = n => {
          const a = [...document.querySelectorAll('#s-stuff .page.on .qp-area.is-draw')].find(e => e.getAttribute('data-q') === it.key);
          const clear = a && a.querySelector('.qpad-clear');
          if (clear) { ACTIONS['pad-clear'](clear); clearTimeout(toastTimer); }
          else if (n > 0) setTimeout(() => press(n - 1), 100);
        };
        press(25);
      },
      expect: () => {
        const it = window.__faceItem;
        const t = document.getElementById('toast');
        if (!t || !/Cleared/.test(t.textContent)) return false;
        const page = document.querySelector('#s-stuff .page.on');
        const tile = page && [...page.querySelectorAll('.q-drawt')].find(b => b.getAttribute('data-key') === it.key);
        if (!tile) return false;
        const r = t.getBoundingClientRect(), tr = tile.getBoundingClientRect();
        const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        const on = document.elementFromPoint(tr.left + tr.width / 2, tr.top + tr.height / 2);
        return !!at && !t.contains(at) && !!on && tile.contains(on);
      },
      wants: 'the hexagon on its drawing just Cleared, the toast up over the foot of the column, and a press at the toast or at Type reaching what is under it',
      leave: () => {
        const it = window.__faceItem;
        try { localStorage.removeItem(padKey_(it)); } catch (e) {}
        try { PAD_CLEARED.delete(padKey_(it)); } catch (e) {}
        const t = document.getElementById('toast');
        if (t) t.remove();
        padFaceForget_(); STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
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
       id. On its card switched to its figure (the pen is the card's other face since 337; it was on the
       figure page), with the Compass in hand (pressed as a finger would, which also locks the card) and
       two marks made the way the tools make them: a ruler's two-point line and a closed ring built by the
       app's own `padArc_` from the ink's real box, so it is round at every width. Measured armed, because
       the bar's lit tile and the gold-filled lock are what is new here. */
    { name: 'a construction with the ruler and compass in the pen bar, a line and a circle drawn',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1911-1H-4');
        if (!it) throw new Error('Q-1MA1-1911-1H-4 is not in the library');
        if (padToolsOf_(it).join(' ') !== 'pen ruler compass') throw new Error('Q-1MA1-1911-1H-4 is not offered a ruler and compasses: ' + padToolsOf_(it).join(' '));
        window.__toolKey = padKey_(it);
        try { localStorage.removeItem(window.__toolKey); } catch (e) {}
        padFaceSet_(window.__toolKey, 'type');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
        /* ONTO ITS FIGURE THROUGH ITS OWN `Draw`, as the paper-figure states above. */
        const h = document.createElement('div');
        h.innerHTML = drawTile_(it);
        if (!h.firstElementChild) throw new Error('Q-1MA1-1911-1H-4 has no Draw tile');
        ACTIONS['q-draw'](h.firstElementChild);
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
        const pad = [...document.querySelectorAll('#s-stuff .page.on .qp-area.is-draw .qpad')].find(p => p.getAttribute('data-k') === window.__toolKey);
        const lit = pad && [...pad.querySelectorAll('.qpad-tool.on')].map(b => b.getAttribute('data-tool')).join(' ');
        return !!pad && pad.classList.contains('is-drawing') && lit === 'compass'
               && !!pad.querySelector('.qpad-tool[data-tool="ruler"]') && !!pad.querySelector('.qpad-lock.on')
               && pad.querySelectorAll('.qpad-g path').length === 2;
      },
      wants: 'Q4\'s figure under the pen on its card, armed, with Pen, Ruler and Compass in its bar, the Compass lit, and a ruler\'s line and a compass\'s ring on it',
      leave: () => {
        try { localStorage.removeItem(window.__toolKey); } catch (e) {}
        PAD_ON = ''; PAD_TOOL.delete(window.__toolKey); padFaceForget_();
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
    /* ---------- HOW YOUR LAST ANSWER WENT, BESIDE THE STAR -------------------------------------------------
       THE OWNER, 9 OCT: *"The kids don't need to see the day they did something. Just whether it's right
       or not."* So the slot that said `Done 4 Oct` says how the LATEST submission went (`subSlot_`, js/
       submit.js): "Correct" with the tick, "Not yet" with the turning arrow, "Sent" in the dim ink. Three
       states, one verdict each, so `ui.js` measures every one at every width — "Not yet" is the longest
       beside the star, and the row is 44px tiles that must not wrap. Signed in only: signed out there is
       no slot. The latest is written where this device keeps it (`subLast:<who>`), and taken off again on
       the way out so no other state is pictured marked. No card says a day. */
    { name: 'a question you last got right',
      only: () => typeof whoIs_ === 'function' && !!whoIs_(),
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1811-1H-3');
        if (!it) throw new Error('Q-1MA1-1811-1H-3 is not in the library');
        window.__subWho = whoIs_();
        window.__subKey = subKeyOf_(ansKey_(it));
        let all = {};
        try { all = JSON.parse(localStorage.getItem('subLast:' + window.__subWho) || '{}') || {}; } catch (e) { all = {}; }
        all[window.__subKey] = { a: '7', v: 'right', at: Date.now(), id: '1760000000000-state1' };
        try { localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it));
      },
      expect: () => {
        const s = document.querySelector('#s-stuff .page.on .tile-row .qcard-verdict');
        return !!s && s.textContent === 'Correct' && s.classList.contains('is-right')
               && !/\d{1,2} [A-Z][a-z]{2}|Done/.test(s.textContent)
               && !document.querySelector('#s-stuff .page.on .qcard .qcard-verdict, .qcard-done');
      },
      wants: 'the question card\'s tile row saying "Correct", with its tick, beside the star — and no day anywhere',
      leave: () => {
        try {
          const all = JSON.parse(localStorage.getItem('subLast:' + window.__subWho) || '{}') || {};
          delete all[window.__subKey];
          localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all));
        } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    { name: 'a question you last got wrong, not yet',
      only: () => typeof whoIs_ === 'function' && !!whoIs_(),
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1811-1H-3');
        if (!it) throw new Error('Q-1MA1-1811-1H-3 is not in the library');
        window.__subWho = whoIs_();
        window.__subKey = subKeyOf_(ansKey_(it));
        let all = {};
        try { all = JSON.parse(localStorage.getItem('subLast:' + window.__subWho) || '{}') || {}; } catch (e) { all = {}; }
        all[window.__subKey] = { a: '8', v: 'wrong', at: Date.now(), id: '1760000000000-state1' };
        try { localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it));
      },
      expect: () => {
        const s = document.querySelector('#s-stuff .page.on .tile-row .qcard-verdict');
        return !!s && s.textContent === 'Not yet' && s.classList.contains('is-near')
               && !/\d{1,2} [A-Z][a-z]{2}|Done/.test(s.textContent)
               && !document.querySelector('#s-stuff .page.on .qcard .qcard-verdict, .qcard-done');
      },
      wants: 'the question card\'s tile row saying "Not yet", with the turning arrow, beside the star — and no day anywhere',
      leave: () => {
        try {
          const all = JSON.parse(localStorage.getItem('subLast:' + window.__subWho) || '{}') || {};
          delete all[window.__subKey];
          localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all));
        } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    { name: 'a question you last sent, unmarked',
      only: () => typeof whoIs_ === 'function' && !!whoIs_(),
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-1811-1H-3');
        if (!it) throw new Error('Q-1MA1-1811-1H-3 is not in the library');
        window.__subWho = whoIs_();
        window.__subKey = subKeyOf_(ansKey_(it));
        let all = {};
        try { all = JSON.parse(localStorage.getItem('subLast:' + window.__subWho) || '{}') || {}; } catch (e) { all = {}; }
        all[window.__subKey] = { a: 'because it is', v: 'sent', at: Date.now(), id: '1760000000000-state1' };
        try { localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it));
      },
      expect: () => {
        const s = document.querySelector('#s-stuff .page.on .tile-row .qcard-verdict');
        return !!s && s.textContent === 'Sent' && !s.classList.contains('is-right') && !s.classList.contains('is-near')
               && !/\d{1,2} [A-Z][a-z]{2}|Done/.test(s.textContent)
               && !document.querySelector('#s-stuff .page.on .qcard .qcard-verdict, .qcard-done');
      },
      wants: 'the question card\'s tile row saying "Sent", no tick and no arrow, beside the star — and no day anywhere',
      leave: () => {
        try {
          const all = JSON.parse(localStorage.getItem('subLast:' + window.__subWho) || '{}') || {};
          delete all[window.__subKey];
          localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all));
        } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
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
        /* AND ANY VERDICT IT WAS LAST SENT WITH, which the strip draws from (js/submit.js). */
        ORDER_HOLE.clear();
        try {
          const all = JSON.parse(localStorage.getItem('subLast:' + whoIs_()) || '{}') || {};
          delete all[subKeyOf_(ansKey_(it))];
          localStorage.setItem('subLast:' + whoIs_(), JSON.stringify(all));
        } catch (e) {}
        subForget_();
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
        /* AND ANY VERDICT IT WAS LAST SENT WITH, which the strip draws from (js/submit.js). */
        ORDER_HOLE.clear();
        try {
          const all = JSON.parse(localStorage.getItem('subLast:' + whoIs_()) || '{}') || {};
          delete all[subKeyOf_(ansKey_(it))];
          localStorage.setItem('subLast:' + whoIs_(), JSON.stringify(all));
        } catch (e) {}
        subForget_();
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
        ORDER_HOLE.clear();
        try {
          const all = JSON.parse(localStorage.getItem('subLast:' + whoIs_()) || '{}') || {};
          delete all[subKeyOf_(window.__ordKey)];
          localStorage.setItem('subLast:' + whoIs_(), JSON.stringify(all));
        } catch (e) {}
        subForget_();
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
        /* AND ANY VERDICT IT WAS LAST SENT WITH, which the strip draws from (js/submit.js). */
        ORDER_HOLE.clear();
        try {
          const all = JSON.parse(localStorage.getItem('subLast:' + whoIs_()) || '{}') || {};
          delete all[subKeyOf_(ansKey_(it))];
          localStorage.setItem('subLast:' + whoIs_(), JSON.stringify(all));
        } catch (e) {}
        subForget_();
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
        ORDER_HOLE.clear();
        try {
          const all = JSON.parse(localStorage.getItem('subLast:' + whoIs_()) || '{}') || {};
          delete all[subKeyOf_(window.__ordKey)];
          localStorage.setItem('subLast:' + whoIs_(), JSON.stringify(all));
        } catch (e) {}
        subForget_();
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
    /* ---------- THE FILMS, WHICH ONLY ONE VISITOR IS SENT — AND WHICH FIND DOES NOT HAVE ----------------
       `only:` FOR THE SECOND TIME IN THIS FILE, and for a stronger reason than the flyer widget's.
       That one is a roster gate on the phone; this is the PAYLOAD — `doGet` builds `films` inside
       `if (viewerIsAdmin)` and sends `[]` to everybody else, so a signed-out visitor has no rows and
       their Find has no films whatever the code does. Asking them would pass with the fault in place.

       THIS STATE OPENED `Learning → Films` AND MEASURED THE FILM CARDS — the fixture's long title, its
       series and its placeholder, and the Watch tile in the row under the card. THE OWNER, 10 Oct:
       *"films should not appear in the finder it cannot be found there"*. So it is the admin's first
       question in Find now, drawn WITH the fixture's three films in the payload: it measures the page an
       admin is shown, and it arrives only if nothing on it, nothing What kind could answer over Find's
       whole list, and nothing a film's title finds in Find's search, is a film. A film is measured where
       it is found — "the films in the videos card, an admin’s", on Games.
       NOT `Learning`'s What kind ANY MORE, which is what the films branch asked for: the second finder
       took the textbooks to its own column for two days (docs/history/329; Find holds them again since
       347), and over the fixture Learning in Find then held one kind, so What kind was skipped and the page
       drew Year. A state that wants a second What kind answer on Find depends on what the fixture happens
       to hold — so this asks What kind's answers of the facet over the whole list instead, which is the
       same question without the funnel's skip. */
    { name: 'no films in Find, an admin’s',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [];
        paintStuff();
        goPage('stuff', stuffQuestionPage_(), true);
      },
      expect: () => {
        const films = (DATA.films || []).filter(f => f && f.title);
        const isFilm = x => x && (x.kind === 'film' || films.some(f => f.title === x.name));
        const kl = facetList().find(f => f.field === 'kindLabel');
        const kinds = kl ? facetValues(stuffItems(), kl).map(v => String(v.value)) : [];
        const was = STUFF.q;
        let found = 0;
        try { films.forEach(f => { STUFF.q = f.title; found += stuffFiltered().filter(isFilm).length; }); }
        finally { STUFF.q = was; }
        return films.length >= 2 && kinds.length >= 1 && kinds.indexOf('Films') === -1 && !found
               && !!document.querySelector('#stuff-groups [data-do="facet-pick"]')
               && !stuffItemsAll_().some(isFilm)
               && !document.querySelector('#s-stuff .card.film');
      },
      wants: 'the admin’s first question in Find drawn with the films in the payload, no Films answer What kind could give, no film found by its title, and no film anywhere in Find' },
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
    /* AND A SEARCH A CHIP HIDES. It was "a search only Resources answers" — a boxer's name typed into Find
       while the boxers were one column over, which drew "1 in Resources" and an Open tile that carried the
       words across (329's review, finding 1). Both finders hold the boxers now (347) and the tile is gone:
       what is left to measure is the sentence a chip leaves — faint words, which is a contrast ratio, and
       which only a browser measures — and that no tile to the other column is drawn under it. */
    { name: 'a search a chip hides',
      enter: () => { STUFF.filters = [{ field: 'kindLabel', value: 'Projects' }]; STUFF.q = 'Olivares'; paintStuff(); goPage('stuff', stuffQuestionPage_(), true); },
      expect: () => {
        const g = document.querySelector('#stuff-groups');
        return !!g && /take a filter off/.test(g.textContent) && !g.querySelector('[data-do="finder-words"]');
      },
      wants: 'Find\'s empty search under a chip saying "Try fewer words, or take a filter off." and offering no other column',
      leave: () => { STUFF.q = ''; STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
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
  /* ================================================================================================
     FIND 2, RIGHT OF FIND (docs/history/329, 347)

     THE OWNER, 10 Oct, built this column for the resources; on 12 Oct: *"Return to that origional finder
     having everything and now there is just an identical second finder."* The textbook, Bible, boxer and
     fight states moved here with the resources (329) and STAY here now that both finders hold them,
     because they are what proves the second column draws as Find does — the column a student keeps the
     reading up in. Each runs in the second finder's binding (`inFinder_`, find.js — inside it `STUFF` IS
     this column's state, so the code reads as it did), turns `goPage('res', …)` and looks in `#s-res`.
     They set the shelf's chip without `What for · Learning` and `What kind · Resources` in front of it:
     the shelf narrows to the same list a finger reaches through those two doors, so the page drawn is the
     page a finger reaches.
  ================================================================================================ */
  res: [
    { name: 'the question' },
    /* ---------- A TEXTBOOK CHAPTER, REACHED BY ITS SHELF -----------------------------------------
       "the @family textbook should be bare bones for now and the textbooks will be in the resources
       tag in the finder." The owner's route as chips — Resources, then the `@family. textbooks`
       shelf — and then the Measures of spread chapter, because it is the one with everything a
       chapter can carry: key words, Higher lines, and the standard deviation formulas, whose
       stacked fractions under a root are the widest thing on any page of the book. The chapters
       either side are in the DOM beside it, so they are measured too, for a tap target, a contrast
       ratio and a sideways scroll. */
    { name: 'a textbook chapter',
      enter: () => inFinder_(finderOf_('res'), () => {
        /* GCSE STATISTICS BY NAME, and its own `Book` chip: the shelf holds a book for every GCSE now,
           and the first one on it, or a chapter numbered like this one in another book, is not the
           page this state was written about. */
        const x = stuffItemsAll_().find(it => it.kind === 'textbook' && it.name === 'GCSE Statistics');
        if (!x) throw new Error('no GCSE Statistics textbook in the list — data/textbooks.json did not load');
        const c = (x.row.chapters || []).find(ch => /spread/i.test(ch.title)) || x.row.chapters[0];
        STUFF.filters = [{ field: 'shelf', value: x.shelf },
                         { field: 'book', value: x.name }];
        paintStuff();
        const at = typeof stuffPages_ === 'function'
          ? Math.max(0, stuffPages_().findIndex(pg => pg.part === 'ch' + c.n)) : 0;
        goPage('res', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + at);
      }),
      expect: () => {
        /* THE CHAPTER AND ITS NEIGHBOURS, NOT THE CONTENTS CARD: the pager keeps `STUFF_WIN` pages
           either side of this one, and the card is nine pages back. The card has a journey of its
           own in check-flow; this state is about the widest page. */
        const ch = [...document.querySelectorAll('#s-res .card.tb.prac-part')]
          .find(el => /spread/i.test((el.querySelector('h3') || {}).textContent || ''));
        return !!ch && !!ch.querySelector('.tb-words li b')
               && !!ch.querySelector('.tb-math .frac .frac-d')
               && !!ch.querySelector('.tb-points li')
               && !!ch.querySelector('li .tb-h')
               /* NOTHING BUT THE BOOK ON THIS SHELF — a boxer here would mean the chip did not hold. */
               && !document.querySelector('#s-res .card:not(.tb) .boxer-rec');
      },
      wants: 'a textbook chapter page — key words, stacked formulas, worked lines and the Higher mark',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    /* ---------- A TEXTBOOK ANIMATION, ON ITS PAGE AFTER ITS CHAPTER ---------------------------------
       "Add the animations from loading to respective subject text books." — the owner, 8 Oct. Three of
       the twenty-seven, chosen for what they stress in a card: Pythagoras is the TALLEST drawing,
       Bayes the WIDEST (a 20rem root that came out at 288px in a 244px card at 320 before its size
       stopped at the box), and standard form the one that SCROLLED SIDEWAYS — its point hops past the
       row of digits it stands on. Each is reached the owner's way, by the book's chips, and turned to
       by its page; the pages either side are in the DOM beside it and are measured too. */
    { name: 'a textbook animation: Pythagoras',
      enter: () => inFinder_(finderOf_('res'), () => {
        const x = stuffItemsAll_().find(it => it.kind === 'textbook' && it.name === 'GCSE Maths');
        if (!x) throw new Error('no GCSE Maths textbook in the list — data/textbooks.json did not load');
        STUFF.filters = [{ field: 'shelf', value: x.shelf },
                         { field: 'book', value: x.name }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.part === 'an17-pyth');
        if (at < 0) throw new Error('GCSE Maths has no an17-pyth page — the pyth row is not under its chapter');
        goPage('res', stuffFirstResult_() + at);
      }),
      expect: () => {
        const card = document.querySelector('#s-res .card.tb-an.is-an17-pyth');
        const stage = card && card.querySelector('.tb-an-stage[data-anim="pyth"]');
        return !!stage && !!stage.querySelector('.an-pyth')
               && !!card.querySelector('.tile-row [data-do="tb-an-again"]')
               && !!card.querySelector('.tb-about li')
               && !!document.head.querySelector('style[data-anim="pyth"]');
      },
      wants: 'Pythagoras after Maths chapter 17: the drawing from its row, Play again, and the chapter\'s own lines about it',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    { name: 'a textbook animation: Bayes',
      enter: () => inFinder_(finderOf_('res'), () => {
        const x = stuffItemsAll_().find(it => it.kind === 'textbook' && it.name === 'GCSE Statistics');
        if (!x) throw new Error('no GCSE Statistics textbook in the list — data/textbooks.json did not load');
        STUFF.filters = [{ field: 'shelf', value: x.shelf },
                         { field: 'book', value: x.name }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.part === 'an15-bayes');
        if (at < 0) throw new Error('GCSE Statistics has no an15-bayes page — the bayes row is not under its chapter');
        goPage('res', stuffFirstResult_() + at);
      }),
      expect: () => {
        const card = document.querySelector('#s-res .card.tb-an.is-an15-bayes');
        const stage = card && card.querySelector('.tb-an-stage[data-anim="bayes"]');
        return !!stage && !!stage.querySelector('.an-bayes')
               && !!card.querySelector('.tile-row [data-do="tb-an-again"]')
               && !!card.querySelector('.tb-about li')
               && !!document.head.querySelector('style[data-anim="bayes"]');
      },
      wants: 'Bayes after Statistics chapter 15: the drawing from its row, Play again, and the chapter\'s own lines about it',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    { name: 'a textbook animation: standard form',
      enter: () => inFinder_(finderOf_('res'), () => {
        const x = stuffItemsAll_().find(it => it.kind === 'textbook' && it.name === 'GCSE Maths');
        if (!x) throw new Error('no GCSE Maths textbook in the list — data/textbooks.json did not load');
        STUFF.filters = [{ field: 'shelf', value: x.shelf },
                         { field: 'book', value: x.name }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.part === 'an2-sf');
        if (at < 0) throw new Error('GCSE Maths has no an2-sf page — the sf row is not under its chapter');
        goPage('res', stuffFirstResult_() + at);
      }),
      expect: () => {
        const card = document.querySelector('#s-res .card.tb-an.is-an2-sf');
        const stage = card && card.querySelector('.tb-an-stage[data-anim="sf"]');
        return !!stage && !!stage.querySelector('.an-sf')
               && !!card.querySelector('.tile-row [data-do="tb-an-again"]')
               && !!card.querySelector('.tb-about li')
               && !!document.head.querySelector('style[data-anim="sf"]');
      },
      wants: 'Standard form after Maths chapter 2: the drawing from its row, Play again, and the chapter\'s own lines about it',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
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
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'shelf', value: 'Books' }];
        paintStuff();
        goPage('res', stuffQuestionPage_(), true);
        bibleLoad_(1);
        bibleLoad_(17);
        bibleLoad_(19);
      }),
      expect: () => {
        const a = [...document.querySelectorAll('#res-groups [data-do="facet-pick"]')];
        return a.length === 1 && a[0].dataset.field === 'bibleTranslation' && a[0].dataset.value === 'KJV'
               && !!document.querySelector('#s-res .card.bible[data-bb="card"]');
      },
      wants: 'the Books shelf answered: the Bible\'s cover, and one question, Translation, with KJV its one answer' },
    { name: 'the Bible, Psalms\'s chapters',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'shelf', value: 'Books' }, { field: 'bibleTranslation', value: 'KJV' },
                         { field: 'bibleTestament', value: 'Old Testament' }, { field: 'bibleGroup', value: 'Poetry & Wisdom' },
                         { field: 'bibleBook', value: 'Psalms' }];
        paintStuff();
        goPage('res', stuffQuestionPage_(), true);
      }),
      expect: () => document.querySelectorAll('#res-groups .answers.is-grid [data-do="facet-pick"][data-field="bibleChapter"]').length === 150,
      wants: 'Psalms\'s Chapter question, 1 to 150, drawn as a grid' },
    { name: 'the Bible, Psalm 119\'s verses',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'shelf', value: 'Books' }, { field: 'bibleTranslation', value: 'KJV' },
                         { field: 'bibleTestament', value: 'Old Testament' }, { field: 'bibleGroup', value: 'Poetry & Wisdom' },
                         { field: 'bibleBook', value: 'Psalms' }, { field: 'bibleChapter', value: '119' }];
        paintStuff();
        goPage('res', stuffQuestionPage_(), true);
      }),
      expect: () => document.querySelectorAll('#res-groups .answers.is-grid [data-do="facet-pick"][data-field="bibleVerse"]').length === 176,
      wants: 'Psalm 119\'s Verse question, 1 to 176, drawn as a grid' },
    { name: 'the Bible, Genesis 1:3',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'shelf', value: 'Books' }, { field: 'bibleTranslation', value: 'KJV' },
                         { field: 'bibleTestament', value: 'Old Testament' }, { field: 'bibleGroup', value: 'Torah' },
                         { field: 'bibleBook', value: 'Genesis' }, { field: 'bibleChapter', value: '1' },
                         { field: 'bibleVerse', value: '3' }];
        paintStuff();
        goPage('res', stuffFirstResult_(), true);
      }),
      expect: () => {
        /* `.bb-v` IS ONLY DRAWN ONCE THE BOOK IS IN — waiting, the card holds the one loader instead. */
        const v = document.querySelector('#s-res .card.bb-verse[data-key="bible:kjv:1:1:3"] .bb-v');
        return !!v && !v.closest('.bb-verse').querySelector('.loading') && /Let there be light/.test(v.textContent)
               && !!document.querySelector('#s-res [data-do="bible-go"][data-key="bible:kjv:1:1:3"]');
      },
      wants: 'the card for Genesis 1:3, "Let there be light", its tags, and its Chapter tile' },
    { name: 'the Bible, Esther 8:9',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'shelf', value: 'Books' }, { field: 'bibleTranslation', value: 'KJV' },
                         { field: 'bibleTestament', value: 'Old Testament' }, { field: 'bibleGroup', value: 'History' },
                         { field: 'bibleBook', value: 'Esther' }, { field: 'bibleChapter', value: '8' },
                         { field: 'bibleVerse', value: '9' }];
        paintStuff();
        goPage('res', stuffFirstResult_(), true);
      }),
      /* THE LONGEST VERSE IN THE BIBLE, 534 characters — the one card that fills a small phone. */
      expect: () => {
        const v = document.querySelector('#s-res .card.bb-verse[data-key="bible:kjv:17:8:9"] .bb-v');
        return !!v && !v.closest('.bb-verse').querySelector('.loading') && v.textContent.length > 500 && !/[\[\]]/.test(v.textContent);
      },
      wants: 'Esther 8:9, the longest verse, drawn whole with no bracket',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.q = ''; STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
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
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'shelf', value: 'Boxing' },
                         { field: 'boxKind', value: 'Boxers' }];
        paintStuff();
        goPage('res', stuffFirstResult_(), true);
      }),
      /* ---------- AND THE PROFILE IT BECAME ------------------------------------------------------------
         ASKED FOR AS *"refine the boxers widget. maybe add image of each boxer ... the wins losses
         etc."* The record left the gold meta line for a scoreboard of its own, and the photo stands
         beside the name — so this asks what only a browser can answer about that: the picture box is
         the 4:5 it was told to be, it sits to the LEFT of the name rather than over it (the grid in
         style.css, not the markup, puts it there), the scoreboard is whole numbers or says there is no
         record, and nothing on the card scrolls sideways at this width. The shared head's two rules
         stay: one title size, the flag above the title. */
      expect: () => {
        const c = document.querySelector('#s-res .page.on .card.fc.boxer:not(.is-fights)')
               || document.querySelector('#s-res .card.fc.boxer:not(.is-fights)');
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
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
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
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = 'Muhammad Ali';
        STUFF.filters = [{ field: 'shelf', value: 'Boxing' },
                         { field: 'boxKind', value: 'Boxers' }];
        paintStuff();
        goPage('res', stuffFirstResult_(), true);
      }),
      expect: () => {
        const c = document.querySelector('#s-res .page.on .card.fc.boxer:not(.is-fights)');
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
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.q = ''; STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    { name: 'the fights, on the shared head',
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'shelf', value: 'Boxing' },
                         { field: 'boxKind', value: 'Fights' }];
        paintStuff();
        goPage('res', stuffFirstResult_(), true);
      }),
      /* AND NO `.note` PARAGRAPHS. The title and the venue were two of them a browser's default
         margin apart; they are one `.fc-note` line now, and the method is in sentence case like
         every other meta line rather than in capitals. */
      expect: () => {
        const c = document.querySelector('#s-res .page.on .card.fc.fight')
               || document.querySelector('#s-res .card.fc.fight');
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
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    /* ---------- THE FIGHTER IN THE RING LOOKS LIKE HIM, IN THE COLOURS A BROWSER ACTUALLY PAINTS -------
       THE OWNER, 10 Oct: *"make the boxers retro avatar actually look more like the boxers and their
       shorts in the fight."* `check-flow` asks which words each figure was drawn with; only a browser
       can say what colour comes out after the custom properties, their fallbacks and `.boxer-ring`'s
       own palette have all been resolved — a token renamed on one side of that chain paints the
       corner's colour and says nothing. So these ask for the computed `fill` of each part, against the
       palette entry the row's word names, at every width, as two visitors:

         a profile   Lennox Lewis — his dreads (hair drawn OUTSIDE the old head, and still inside the
                     frame), his goatee (in the face's deeper black), his skin and his usual white
                     trunks, none of them the gold stand-in's colours, the picture box still the 4:5 it
                     was told to be.
         a fight     Ali v Frazier, 1971: red trunks trimmed white in the red corner, green trimmed gold
                     in the blue, the blue corner mirrored to face left — and a corner with no trunks
                     on file, drawn beside them for the asking, painted the corner's MUTED colour by
                     the stylesheet's fallbacks, its waistband the same colour darker, no stripe.
         a stranger  Tyson v Berbick, 1986: Berbick has no row, so beside Tyson in his own skin he is
                     the silhouette — skin and hair one shadow tone, NOT the old stand-in's paper and
                     gold, which made him a pale blond man in his own black trunks.
         the dark    every skin, hair colour, trunks colour, the silhouette and both unrecorded trunks,
                     drawn for the asking, each clearing 2:1 against the stage he stands in; a black
                     beard 2:1 on every skin; and the unrecorded trunks well away from every trunks word.

       `rgb` IS WRITTEN OUT IN EACH, not shared, for the reason `fcHead` is: these functions are passed
       to the browser as source one at a time and cannot see each other. */
    { name: 'a boxer who looks like himself',
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = 'Lennox Lewis';
        STUFF.filters = [{ field: 'shelf', value: 'Boxing' },
                         { field: 'boxKind', value: 'Boxers' }];
        paintStuff();
        goPage('res', stuffFirstResult_(), true);
      }),
      expect: () => {
        const c = document.querySelector('#s-res .page.on .card.fc.boxer:not(.is-fights)');
        const row = ((typeof DATA !== 'undefined' && DATA.boxers) || []).find(r => r.name === 'Lennox Lewis');
        if (!c || !row || !row.look || !/Lennox Lewis/.test((c.querySelector('h3') || {}).textContent || '')) return false;
        const frame = c.querySelector('.boxer-pic .boxer-frame'), ring = frame && frame.querySelector('svg.boxer-ring');
        const g = ring && ring.querySelector('g.bf.bf-l');
        if (!g || g.classList.contains('bf-r')) return false;
        const rgb = h => { const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(h).trim());
                           return m ? 'rgb(' + [m[1], m[2], m[3]].map(x => parseInt(x, 16)).join(', ') + ')' : 'none'; };
        const tok = n => rgb(getComputedStyle(ring).getPropertyValue(n));
        const fill = sel => { const el = g.querySelector(sel); return el ? getComputedStyle(el).fill : 'missing'; };
        const L = row.look, t = String(row.trunks || '').split('/');
        if (L.hair !== 'dreads' || !L.hairColour || !L.skin || !L.facial || L.facial === 'none' || !t[0]) return false;
        const gold = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim();
        const f = frame.getBoundingClientRect(), hb = g.querySelector('.bf-hair').getBoundingClientRect(),
              px = f.width / 40;
        return g.classList.contains('bf-hs-dreads') && g.classList.contains('bf-fh-' + L.facial)
               && fill('.bf-skin') === tok('--bf-' + L.skin)
               && fill('.bf-hair') === tok('--bf-hc-' + L.hairColour)
               /* A BLACK BEARD IS THE DEEPER BLACK — it sits on the face, not the stage (style.css). */
               && fill('.bf-face') === tok(L.hairColour === 'black' ? '--bf-fh-black' : '--bf-hc-' + L.hairColour)
               && fill('.bf-trunks') === tok('--bf-tk-' + t[0])
               && fill('.bf-band') === tok('--bf-tk-' + (t[1] || t[0]))
               && fill('.bf-trunks') !== rgb(gold)
               && getComputedStyle(ring).shapeRendering === 'crispedges'
               /* THE LOCKS HANG BELOW WHERE THE OLD CAP ENDED — seven game pixels of hair, not its five —
                  and still inside the frame. */
               && hb.height >= 6.5 * px && hb.left >= f.left && hb.bottom <= f.bottom
               && f.width > 0 && Math.abs(f.width / f.height - .8) < .03
               && c.scrollWidth <= c.clientWidth + 1;
      },
      wants: 'Lennox Lewis drawn as himself — dreads behind the head and inside the frame, goatee, his skin and his white trunks in the figure\'s own colours, never the gold stand-in\'s',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.q = ''; STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    { name: 'a fight in that night\'s trunks',
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'shelf', value: 'Boxing' },
                         { field: 'boxKind', value: 'Fights' }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.x && pg.x.row && pg.x.row.id === 'FT0033' && !pg.part);
        if (at < 0) throw new Error('FT0033, the Fight of the Century, is not in the Fights list');
        goPage('res', stuffFirstResult_() + at, true);
      }),
      expect: () => {
        const c = document.querySelector('#s-res .page.on .card.fc.fight');
        const fr = ((typeof DATA !== 'undefined' && DATA.fights) || []).find(r => r.id === 'FT0033');
        if (!c || !fr || fr.trunksA !== 'red/white' || fr.trunksB !== 'green/gold') return false;
        const rings = [...c.querySelectorAll('.fight-faces .boxer-pic svg.boxer-ring')];
        if (rings.length !== 2) return false;
        const rgb = h => { const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(h).trim());
                           return m ? 'rgb(' + [m[1], m[2], m[3]].map(x => parseInt(x, 16)).join(', ') + ')' : 'none'; };
        const tok = (ring, n) => rgb(getComputedStyle(ring).getPropertyValue(n));
        const fill = (ring, sel) => { const el = ring.querySelector('g.bf ' + sel); return el ? getComputedStyle(el).fill : 'missing'; };
        const [ra, rb] = rings, ga = ra.querySelector('g.bf'), gb = rb.querySelector('g.bf');
        if (!ga || !gb) return false;
        /* FACING EACH OTHER: the red corner's gloves to the right of his head, the blue corner's to the left. */
        const faces = (g, right) => { const gl = g.querySelector('.bf-glove').getBoundingClientRect(), sk = g.querySelector('.bf-skin').getBoundingClientRect();
                                      return right ? gl.right > sk.right : gl.left < sk.left; };
        /* AND A CORNER NOBODY RESEARCHED, drawn by the card's own renderer for the asking: the
           stylesheet's fallbacks are what paint it, and nothing else on this screen would show them. */
        const probe = document.createElement('span');
        probe.className = 'boxer-frame';
        probe.style.cssText = 'position:fixed;left:-999px;top:0;width:80px';
        probe.innerHTML = boxerRing_('X Y', false, null, '') + boxerRing_('X Y', true, null, '');
        document.body.appendChild(probe);
        const blanks = [...probe.querySelectorAll('svg.boxer-ring g.bf .bf-trunks')].map(el => getComputedStyle(el).fill);
        const blankStripes = probe.querySelectorAll('svg.boxer-ring g.bf .bf-stripe').length;
        probe.remove();
        const root = getComputedStyle(document.documentElement);
        /* THE BLANKS ARE THE CORNER'S COLOUR MUTED, NOT THE CORNER'S COLOUR: the old gold and blue with
           an ink waistband read as a researched gold-and-white pair (the review of 10 Oct). */
        return fill(ra, '.bf-trunks') === tok(ra, '--bf-tk-red') && fill(ra, '.bf-band') === tok(ra, '--bf-tk-white')
               && fill(ra, '.bf-stripe') === tok(ra, '--bf-tk-white')
               && fill(rb, '.bf-trunks') === tok(rb, '--bf-tk-green') && fill(rb, '.bf-band') === tok(rb, '--bf-tk-gold')
               && fill(rb, '.bf-stripe') === tok(rb, '--bf-tk-gold')
               && ga.classList.contains('bf-l') && gb.classList.contains('bf-r')
               && faces(ga, true) && faces(gb, false)
               && blanks.length === 2 && blanks[0] === tok(ra, '--bf-unsaid-l') && blanks[1] === tok(ra, '--bf-unsaid-r')
               && blanks[0] !== rgb(root.getPropertyValue('--gold')) && blanks[1] !== rgb(root.getPropertyValue('--tag-level'))
               && blankStripes === 0;
      },
      wants: 'Ali v Frazier 1971 in that night\'s trunks — red trimmed white facing right, green trimmed gold facing left — and a corner with no trunks on file painted the corner\'s muted colour with no stripe',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    /* ---------- A FIGHTER WITH NO ROW IS A SILHOUETTE, NOT A PALE BLOND MAN ------------------------------
       THE REVIEW OF 10 OCT: the 53 corners with no boxer row kept the old stand-in's paper skin and, in
       the blue corner, its gold hair — while being dressed in their real trunks beside an opponent in
       his real skin. Trevor Berbick, Cleveland Williams, Andy Ruiz and Benny Paret were drawn as a pale
       blond man. A corner with no row claims no skin and no hair colour: both are ONE shadow tone.
       `paint` asks the browser what a token resolves to on a scrap element in the same ring, because a
       `color-mix` token reads back as its formula, not as a colour. */
    { name: 'a fighter with no row is a silhouette',
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'shelf', value: 'Boxing' },
                         { field: 'boxKind', value: 'Fights' }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.x && pg.x.row && pg.x.row.id === 'FT0060' && !pg.part);
        if (at < 0) throw new Error('FT0060, Tyson v Berbick, is not in the Fights list');
        goPage('res', stuffFirstResult_() + at, true);
      }),
      expect: () => {
        const c = document.querySelector('#s-res .page.on .card.fc.fight');
        const fr = ((typeof DATA !== 'undefined' && DATA.fights) || []).find(r => r.id === 'FT0060');
        if (!c || !fr || fr.bId || fr.trunksB !== 'black') return false;
        const rings = [...c.querySelectorAll('.fight-faces .boxer-pic svg.boxer-ring')];
        if (rings.length !== 2) return false;
        const [ra, rb] = rings, ga = ra.querySelector('g.bf'), gb = rb.querySelector('g.bf');
        if (!ga || !gb) return false;
        const paint = (ring, v) => { const e = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                                     e.style.fill = v; ring.appendChild(e); const f = getComputedStyle(e).fill; e.remove(); return f; };
        const fill = (ring, sel) => { const el = ring.querySelector('g.bf ' + sel); return el ? getComputedStyle(el).fill : 'missing'; };
        const sk = ([...ga.classList].find(k => /^bf-sk-/.test(k)) || '').slice(6);
        const ghost = paint(rb, 'var(--bf-ghost)');
        const skins = ['s1', 's2', 's3', 's4', 's5', 's6'].map(t => paint(rb, 'var(--bf-' + t + ')'));
        return !!sk && ga.classList.contains('bf-seen') && fill(ra, '.bf-skin') === paint(ra, 'var(--bf-' + sk + ')')
               && !gb.classList.contains('bf-seen') && !/--bf-(skin|hair):/.test(gb.getAttribute('style') || '')
               && fill(rb, '.bf-skin') === ghost && fill(rb, '.bf-hair') === ghost
               && ghost !== paint(rb, 'var(--paper)') && ghost !== paint(rb, 'var(--gold)') && skins.indexOf(ghost) < 0
               && fill(rb, '.bf-trunks') === paint(rb, 'var(--bf-tk-black)');
      },
      wants: 'Tyson v Berbick 1986 — Tyson in his own skin, Berbick (no row) a silhouette in one shadow tone, neither paper nor gold nor any skin, still in his black trunks',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    /* ---------- EVERY COLOUR OF THE FIGURE SHOWS AGAINST THE DARK HE STANDS IN --------------------------
       THE REVIEW OF 10 OCT measured the 4x shots: black hair 1.29:1 against the stage, black trunks
       1.40:1, the deepest skin 1.97:1, a black beard on it 1.53:1. Tyson was a face and a pair of legs
       and Joshua's head a dark hood. So every colour the figure can wear is drawn here, for the asking,
       by the card's own renderer, and its computed fill is held to 2:1 against the computed fill of
       `bf-stage`, the dark behind him: six skins, eight hair colours, seventeen trunks, the silhouette
       and both unrecorded pairs. A black beard is held to 2:1 against each skin, because it sits on the
       face. The unrecorded pairs are held at least 50 apart (RGB) from every trunks word — the old
       blue fallback and the vocabulary's sky were the same light blue twice. And Mike Tyson's own
       profile is measured as drawn: his hair and trunks against his ring's stage, and the stage
       reaching above his hair, so the gold light behind the initials cannot creep back over his head.
       A failure is left on `window.__bfDark` for whoever opens the page. */
    { name: 'every colour of the eight-bit fighter shows against the stage',
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = 'Mike Tyson';
        STUFF.filters = [{ field: 'shelf', value: 'Boxing' },
                         { field: 'boxKind', value: 'Boxers' }];
        paintStuff();
        goPage('res', stuffFirstResult_(), true);
      }),
      expect: () => {
        const c = document.querySelector('#s-res .page.on .card.fc.boxer:not(.is-fights)');
        if (!c || !/Mike Tyson/.test((c.querySelector('h3') || {}).textContent || '')) return false;
        const col = v => {
          let m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(v);
          if (m) return [+m[1], +m[2], +m[3]];
          m = /^color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)/.exec(v);
          return m ? [m[1] * 255, m[2] * 255, m[3] * 255] : null;
        };
        const lum = v => { const k = col(v); if (!k) return NaN;
          const [r, g, b] = k.map(x => { x /= 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        const ratio = (p, q) => { const a = lum(p), b = lum(q); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
        const far = (p, q) => { const a = col(p), b = col(q); return a && b ? Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) : 0; };
        const bad = [];
        /* HIS OWN RING, AS DRAWN. */
        const ring = c.querySelector('.boxer-pic .boxer-frame svg.boxer-ring'), g = ring && ring.querySelector('g.bf');
        const stageEl = ring && ring.querySelector('.bf-stage');
        if (!g || !stageEl || !g.classList.contains('bf-hc-black') || !g.classList.contains('bf-tk-black')) return false;
        const stage = getComputedStyle(stageEl).fill;
        ['.bf-hair', '.bf-trunks'].forEach(sel => { const r = ratio(getComputedStyle(g.querySelector(sel)).fill, stage);
          if (!(r >= 2)) bad.push('Tyson ' + sel + ' ' + r.toFixed(2) + ':1'); });
        if (stageEl.getBoundingClientRect().top > g.querySelector('.bf-hair').getBoundingClientRect().top + 0.5) bad.push('the stage does not reach above his hair');
        /* EVERY WORD, DRAWN FOR THE ASKING. */
        const probe = document.createElement('span');
        probe.className = 'boxer-frame';
        probe.style.cssText = 'position:fixed;left:-999px;top:0;width:80px';
        const cases = [];
        BOXER_LOOK.skin.forEach(t => cases.push(['skin ' + t, '.bf-skin', boxerRing_('X Y', false, { skin: t, hair: 'short', hairColour: 'black' }, 'white')]));
        BOXER_LOOK.hair_colour.forEach(t => cases.push(['hair ' + t, '.bf-hair', boxerRing_('X Y', false, { skin: 's3', hair: 'short', hairColour: t }, 'white')]));
        BOXER_LOOK.trunks.forEach(t => cases.push(['trunks ' + t, '.bf-trunks', boxerRing_('X Y', false, { skin: 's3' }, t)]));
        cases.push(['the silhouette', '.bf-skin', boxerRing_('X Y', false, null, '')],
                   ['unrecorded trunks, red corner', '.bf-trunks', boxerRing_('X Y', false, null, '')],
                   ['unrecorded trunks, blue corner', '.bf-trunks', boxerRing_('X Y', true, null, '')]);
        probe.innerHTML = cases.map(k => k[2]).join('');
        document.body.appendChild(probe);
        const svgs = [...probe.querySelectorAll('svg.boxer-ring')];
        const fills = {};
        cases.forEach(([name, sel], i) => {
          const s = svgs[i], f = getComputedStyle(s.querySelector('g.bf ' + sel)).fill, st = getComputedStyle(s.querySelector('.bf-stage')).fill;
          fills[name] = f;
          const r = ratio(f, st);
          if (!(r >= 2)) bad.push(name + ' ' + r.toFixed(2) + ':1 against the stage');
        });
        /* A BLACK BEARD ON EVERY SKIN. */
        probe.innerHTML = BOXER_LOOK.skin.map(t => boxerRing_('X Y', false, { skin: t, hair: 'short', hairColour: 'black', facial: 'beard' }, 'white')).join('');
        [...probe.querySelectorAll('svg.boxer-ring')].forEach((s, i) => {
          const r = ratio(getComputedStyle(s.querySelector('.bf-face')).fill, getComputedStyle(s.querySelector('.bf-skin')).fill);
          if (!(r >= 2)) bad.push('a black beard on ' + BOXER_LOOK.skin[i] + ' ' + r.toFixed(2) + ':1');
        });
        probe.remove();
        ['unrecorded trunks, red corner', 'unrecorded trunks, blue corner'].forEach(u => BOXER_LOOK.trunks.forEach(t => {
          const d = far(fills[u], fills['trunks ' + t]);
          if (!(d >= 50)) bad.push(u + ' is ' + Math.round(d) + ' from ' + t);
        }));
        window.__bfDark = bad;
        return bad.length === 0 && Object.keys(fills).length === cases.length;
      },
      wants: 'every skin, hair colour, trunks colour, the silhouette and the unrecorded trunks at 2:1 or more against the stage, a black beard 2:1 on every skin, Tyson\'s own hair and trunks too, and the unrecorded trunks 50 or more from every trunks word',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.q = ''; STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    /* ---------- THE TEXTBOOK'S CONTENTS, AND `10.` INSIDE THE CARD ---------------------------------
       `a textbook chapter` lands nine pages past the contents card, so the card itself was in the
       DOM only as a neighbour and never the page measured. Its list has sixteen numbers, and with a
       bullet's 1.1rem indent `10.` to `16.` hung out past the card's padding at 320px — a marker is
       not a box, so no overflow rule could see it. So this asks the arithmetic directly: the list's
       indent against the width of its widest number, set in the list's own font. */
    { name: "the textbook's contents, every number inside the card",
      enter: () => inFinder_(finderOf_('res'), () => {
        /* THE SIXTEEN-CHAPTER BOOK BY NAME — the widest list of numbers on the shelf, `10.` to `16.` —
           and its own `Book` chip, so the card measured is that one and not whichever book is first. */
        const x = stuffItemsAll_().find(it => it.kind === 'textbook' && it.name === 'GCSE Statistics');
        if (!x) throw new Error('no GCSE Statistics textbook in the list — data/textbooks.json did not load');
        STUFF.q = '';
        STUFF.filters = [{ field: 'shelf', value: x.shelf },
                         { field: 'book', value: x.name }];
        paintStuff();
        goPage('res', stuffFirstResult_(), true);
      }),
      expect: () => {
        const c = document.querySelector('#s-res .card.tb:not(.prac-part)');
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
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
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
    /* ---------- A TUTOR'S OTHER PHOTOGRAPHS, FOUR SQUARES TO A ROW, AND NONE OF THEM OPENS ---------
       ASKED FOR AS *"tutors should be able to add more pics"*. This state opened one across the row,
       until the owner, 10 Oct: *"i dont like how you made it so people can enlarge a photo of tutor.
       the extra ones"*. So it now presses one and asks that nothing happened — the squares are still
       squares, none is a button, and nothing says it can be made bigger. `check/fixture.json`'s tutor
       carries three local pictures so the squares have something real in them. */
    { name: "a tutor's photographs, pressed and staying squares",
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
        /* SQUARE, STILL: every one as wide as it is tall after the press, none a control, none told
           it can grow. */
        const square = b => { const r = b.getBoundingClientRect(); return r.width > 0 && Math.abs(r.width - r.height) < 1.5; };
        return shots.length >= 2 && shots.every(square)
          && !grid.querySelector('button, [data-do], [aria-pressed], .is-big') ? shots.length : 0;
      },
      wants: "a tutor's photographs as squares, still squares after one is pressed, and none of them a button",
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
       ticked on (Thu, Fri, Sun) NOT DRAWN — they were thin collapsed rows until the owner, 10 Oct:
       *"no need to display monday if they dont have any hours on monday."* Measured at every width
       because it is the last thing on a card that is already near its pane's height.

       AND MONDAY 17 MUST NOT LOOK LIKE MONDAY 9. A taught hour was `hr shut`, the same dark cell as an
       hour never ticked, with the difference in a `title` no phone shows — so a day kept only for a
       taught hour was a row of nothing (found in review). Asked of the browser's COMPUTED style, not
       the class: a class with no rule behind it is the fault itself. And the key that says what the
       hatching means is under the week, because Ada is teaching one of her hours. */
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
        const days = rows.map(r => ((r.querySelector('.slot-day') || {}).textContent || '').trim()).join(' ');
        const busy = wk.querySelector('.hr[data-code="m17"]');
        const never = wk.querySelector('.hr[data-code="m09"]');
        const look = el => { const s = getComputedStyle(el); return [s.opacity, s.backgroundImage, s.borderTopColor].join(' | '); };
        return cap && cap.textContent.trim() === 'Available'
          && wk.querySelectorAll('.hr.on').length === 8
          && !!busy && !busy.classList.contains('on') && busy.classList.contains('shut')
          && !!never && !never.classList.contains('on') && look(busy) !== look(never)
          && /already teaching/i.test((wk.querySelector('.prof-key') || {}).textContent || '')
          && days === 'Mon Tue Wed Sat' && !wk.querySelector('.is-shut')
          && !wk.querySelector('button, input, label') ? 1 : 0;
      },
      wants: 'an Available caption over Mon, Tue, Wed and Sat only, eight hours lit, Monday 17 drawn as taught (computed unlike unticked Monday 9) and the "already teaching" key',
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
    /* ---------- YOUR OWN CARD, BEING EDITED — `cardEditHtml_` in me.js (docs/history/330) ----------------------
       The owner, 10 Oct: *"all of this stuff should be editable directly on the tutors card for that
       respective tutor."* The visitor is the fixture's admin, who has no tutor row, so one is put in the
       payload under their id — a copy of the fixture tutor's — and their `USER.profile` is filled the way
       `myProfile` fills it, the WIDEST case rather than the tidiest: the longest headline and words a card
       holds, three qualifications, three photographs, three venues and a week with hours on four days. The
       form is every section of the card at once, so it is the tallest thing on the column and is measured at
       every width — the boxes, the shelf, the picker and the week each in a card narrower than Settings'. */
    { name: 'your own card, being edited',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const ada = (DATA.tutors || []).find(t => t && t.personId) || {};
        window.__CE_HELD = { tutors: DATA.tutors, profile: USER.profile };
        DATA.tutors = [Object.assign({}, ada, { personId: USER.personId, title: 'Test Admin', handle: USER.handle || 'testadmin' })]
          .concat(DATA.tutors || []);
        USER.profile = Object.assign({}, USER.profile || {}, {
          phone_cc: '+44', first_name: 'Test', last_name: 'Administrator-Longsurname',
          headline: 'Ten years of GCSE and A-Level maths, physics and further maths — patient, clear, and on time.',
          rate_per_hour: '32.50', extra_seat_rate: '0.5', min_students: '1', max_students: '4',
          video: 'https://example.org/videos/an-introduction-to-how-i-teach-maths-and-physics.mp4',
          photos_1: 'data/reels/archetest.jpg', photos_2: 'icon.png', photos_3: 'favicon.png',
          adjective_1: 'Conscientious', adjective_2: 'Encouraging', adjective_3: 'Methodical',
          years_experience: '12', favourite_colour: 'Purple', age_min: '8', age_max: 'Adults', min_hours: '1', max_hours: '2',
          qual_1: 'Maths', qual_1_level: 'GCSE', qual_1_grade: '9', qual_1_received: '2016', qual_1_teach: 'TRUE', qual_1_spec: 'TRUE',
          qual_2: 'Maths', qual_2_level: 'A-Level', qual_2_grade: 'A*', qual_2_received: '2018', qual_2_teach: 'TRUE', qual_2_spec: 'FALSE',
          qual_3: 'DBS', qual_3_level: 'Enhanced', qual_3_received: '2025',
          venues_ok: 'Colliers Wood Library, Sutton Library, Online', travel_km: '15',
          m16: 'TRUE', m17: 'TRUE', tu10: 'TRUE', tu11: 'TRUE', w16: 'TRUE', sa10: 'TRUE', sa11: 'TRUE', sa12: 'TRUE' });
        CARD_EDIT = cardEditFresh_(USER.personId);
        paint('account');
        const pages = [...document.querySelectorAll('#s-account .page')];
        const at = pages.findIndex(pg => pg.querySelector('.card-ed .me-form'));
        if (at < 0) throw new Error('no card on the account column is open for editing');
        goPage('account', at, true);
      },
      leave: () => {
        DATA.tutors = window.__CE_HELD.tutors; USER.profile = window.__CE_HELD.profile; delete window.__CE_HELD;
        CARD_EDIT = null;
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        repaint(true);
      },
      expect: () => {
        const pg = document.querySelector('#s-account .page.on');
        const form = pg && pg.querySelector('.card-ed .me-form');
        if (!form) return 0;
        const secs = [...form.querySelectorAll('.ce-sec')].map(x => x.dataset.sec).join(',');
        /* YOUR FIGURE AFTER THE PICTURE AND YOUR HANDLE AFTER THE NAME, on your own card (docs/history/339). */
        return secs === 'picture,figure,name,handle,rate,headline,photos,words,glance,quals,where,week'
          && !!form.querySelector('.pfp [data-do="pfp-pick"]')
          && form.querySelectorAll('.me-week .slot-row:not(.slot-head)').length === 7
          && form.querySelectorAll('.me-week .hr input[data-me]').length === 70
          && form.querySelectorAll('[data-me^="qual_"]').length === 70
          && form.querySelectorAll('.q-list .q-line').length === 3
          && form.querySelectorAll('.ph-shelf .ph-thumb img').length === 3
          && !!form.querySelector('.ce-heat .prof-heat')
          && pg.querySelectorAll('.ce-tiles .tile[data-do="card-save"], .ce-tiles .tile[data-do="card-cancel"]').length === 2
          && !pg.querySelector('[data-do="card-edit"]')
          /* AT FULL SIZE, AND THE PANE SCROLLS TO ITS SAVE — `paneReach_` draws a card being edited at
             zoom 1 (it is taller than any pane even at the 0.70 floor), so its boxes keep their size. */
          && !(form.closest('.card-ed').style.zoom && form.closest('.card-ed').style.zoom !== '1')
          && (pane => !!pane && (pane.scrollHeight <= pane.clientHeight + 2 || getComputedStyle(pane).overflowY === 'auto'))(form.closest('.pane'))
          /* SAVE AND CANCEL IN REACH WITH THE FORM AT ITS TOP — the review of 330: the one Save sat under the
             week, 1,952px down at 390. The row is stuck to the foot of the pane (`.ce-tiles`, style.css), so
             with the pane scrolled to its top the Save tile is inside the pane's visible box. */
          && (pane => {
            if (!pane) return false;
            const was = pane.scrollTop; pane.scrollTop = 0;
            const r = pg.querySelector('.ce-tiles [data-do="card-save"]').getBoundingClientRect(), b = pane.getBoundingClientRect();
            const ok = r.height > 0 && r.top >= b.top - 1 && r.bottom <= b.bottom + 1;
            pane.scrollTop = was;
            return ok;
          })(form.closest('.pane'))
          /* SIGN OUT STILL UNDER IT, and the photographs not waiting to be scrolled to ("these remain loading
             untill i scroll to them"), and the session length boxes in At a glance. */
          && pg.querySelectorAll('[data-do="signout"]').length === 1
          && !form.querySelector('img[loading="lazy"]')
          && !!form.querySelector('.ce-sec[data-sec="glance"] [data-me="min_hours"]') ? 1 : 0;
      },
      wants: 'your card as its own form at full size in a pane that scrolls: every section in the card\'s order (the figure and the handle among them), the picture chooser, three photographs fetched at once, three qualifications, the session length, the map, all seven days of the week, Save and Cancel as tiles in reach at the foot of the pane, and Sign out under them' },
    /* ---------- AND ANOTHER TUTOR'S CARD, EDITED BY AN ADMIN ---------------------------------------------------
       Decision 3 of the brief: `updateProfile` already lets an admin write another person's row, so an admin's
       Edit on the fixture tutor opens the same form — filled from `getProfile`, which the lab's backend cannot
       answer, so the copy it would have returned is put where the answer goes. The picture is shown and not
       offered (`savePhoto` writes the admin's own row), with one line saying why. */
    { name: 'another tutor\'s card, being edited by an admin',
      only: () => typeof USER !== 'undefined' && !!USER && typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        const ada = (DATA.tutors || []).find(t => t && t.personId && String(t.personId) !== String(USER.personId));
        if (!ada) throw new Error('the fixture has no tutor other than the visitor');
        CARD_EDIT = cardEditFresh_(ada.personId);
        CARD_EDIT.base = { phone_cc: '+44', first_name: 'Ada', last_name: 'Tutor',
          headline: 'Ten years of GCSE and A-Level maths.', rate_per_hour: '30', extra_seat_rate: '0.5',
          min_students: '1', max_students: '3', adjective_1: 'Patient', adjective_2: 'Clear', adjective_3: 'Encouraging',
          years_experience: '10', favourite_colour: 'Blue', age_min: '11', age_max: '18',
          qual_1: 'Maths', qual_1_level: 'A-Level', qual_1_grade: 'A*', qual_1_received: '2014', qual_1_teach: 'TRUE', qual_1_spec: 'TRUE',
          venues_ok: 'Colliers Wood Library, Sutton Library, Online', travel_km: '8', m16: 'TRUE', m17: 'TRUE', m18: 'TRUE' };
        paint('account');
        const pages = [...document.querySelectorAll('#s-account .page')];
        const at = pages.findIndex(pg => pg.querySelector('.card-ed .me-form'));
        if (at < 0) throw new Error('the fixture tutor\'s card did not open for editing');
        goPage('account', at, true);
      },
      leave: () => {
        CARD_EDIT = null;
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        repaint(true);
      },
      expect: () => {
        const pg = document.querySelector('#s-account .page.on');
        const form = pg && pg.querySelector('.card-ed .me-form');
        if (!form) return 0;
        return !!form.querySelector('.ce-pic') && !form.querySelector('.pfp')
          && /Only Ada can change this picture/.test(form.textContent)
          && (form.querySelector('[data-me="headline"]') || {}).value === 'Ten years of GCSE and A-Level maths.'
          && form.querySelectorAll('.me-week .slot-row:not(.slot-head)').length === 7
          && pg.querySelectorAll('.ce-tiles .tile[data-do="card-save"], .ce-tiles .tile[data-do="card-cancel"]').length === 2 ? 1 : 0;
      },
      wants: 'the fixture tutor\'s card as a form for the admin: their headline in its box, their picture shown and not offered, the whole week, Save and Cancel' },
    /* ---------- EVERYBODY'S OWN CARD, BEING EDITED — THE FIGURE AND THE HANDLE ON IT (docs/history/339) ---------------
       THE OWNER, 11 Oct: *"the random name generator should be one of the editable things in the profile settings of
       the profile card. your figure should also be in your profile card editing."* Edit on your own card is
       everybody's now, and for somebody with no public card — the lab's admin, a parent, a student — the form is the
       four sections their card prints: the picture, the figure (the wardrobe, which was the last page of Settings),
       the name and the handle (Randomise, which was on Settings' Signing in card). Each is measured at every width,
       as the visitor the lab has (an admin with no tutor row) and then as a parent and a student, by giving the
       same visitor that role the way the exam-dates state on Settings does. `USER.profile` is filled the way
       `myProfile` fills it (`phone_cc`), or the form waits for a copy it can trust. */
    ...['', 'client', 'student'].map(role => ({
      name: role === '' ? 'your own card, being edited, with no public card'
        : (role === 'client' ? 'a parent\'s' : 'a student\'s') + ' own card, being edited',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: new Function('return (' + String(role => {
        window.__CE_OWN = { role: USER.role, roles: USER.roles, profile: USER.profile, avatar: USER.avatar };
        if (role) { USER.role = role; USER.roles = [role]; }
        USER.profile = Object.assign({}, USER.profile || {}, { phone_cc: '+44', photo: '' });
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        CARD_EDIT = cardEditFresh_(USER.personId);
        CARD_EDIT.pic0 = ''; CARD_EDIT.fig0 = String(USER.avatar || '');
        if (role) repaint(); else paint('account');
        const pages = [...document.querySelectorAll('#s-account .page')];
        const at = pages.findIndex(pg => pg.querySelector('.card-ed .me-form'));
        if (at < 0) throw new Error('your own card did not open for editing');
        goPage('account', at, true);
      }) + ')(' + JSON.stringify(role) + ');'),
      leave: () => {
        const w = window.__CE_OWN || {};
        USER.role = w.role; USER.roles = w.roles; USER.profile = w.profile; USER.avatar = w.avatar; delete window.__CE_OWN;
        CARD_EDIT = null;
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        repaint(true);
      },
      expect: () => {
        const pg = document.querySelector('#s-account .page.on');
        const form = pg && pg.querySelector('.card-ed .me-form');
        if (!form) return 0;
        const secs = [...form.querySelectorAll('.ce-sec')].map(x => x.dataset.sec).join(',');
        const fig = form.querySelector('.ce-sec[data-sec="figure"]'), hd = form.querySelector('.ce-sec[data-sec="handle"]');
        const pane = form.closest('.pane');
        return secs === 'picture,figure,name,handle'
          && !!form.querySelector('.pfp [data-do="pfp-pick"]')
          && !!fig && fig.querySelectorAll('.av-figure').length === 1 && !!fig.querySelector('[data-do="av-colour"]') && !!fig.querySelector('[data-do="av-pick"]')
          && !!hd && (hd.querySelector('.handle-shown') || {}).textContent === (USER.handle || '')
          && hd.querySelectorAll('.tile-row > .tile[data-do="handle-shuffle"]').length === 1 && !hd.querySelector('input, .btn')
          && !!form.querySelector('[data-me="first_name"]') && !form.querySelector('[data-me="email"], [data-me="headline"], [data-me^="lib"]')
          && pg.querySelectorAll('.ce-tiles .tile[data-do="card-save"], .ce-tiles .tile[data-do="card-cancel"]').length === 2
          && !(form.closest('.card-ed').style.zoom && form.closest('.card-ed').style.zoom !== '1')
          && !!pane && (pane.scrollHeight <= pane.clientHeight + 2 || getComputedStyle(pane).overflowY === 'auto')
          && pg.querySelectorAll('[data-do="signout"]').length === 1 ? 4 : 0;
      },
      wants: 'your own card as its form, at full size in a pane that scrolls: the picture, your figure (the wardrobe), your name and your handle with Randomise and nothing to type, nothing else, Save and Cancel, and Sign out under them' })),

    /* ---------- YOUR HANDLE, ON YOUR OWN CARD: SHOWN, WITH RANDOMISE, AND NO BOX ----------------------------------
       ASKED FOR AS *"handles should be their name and a virtuous describing word. they can randomise it but it will
       follow that general name."* — and on 11 Oct, *"the random name generator should be one of the editable things in
       the profile settings of the profile card"*, so it is the handle section of your own card's Edit, where the card
       prints it under your name (it was on Settings' Signing in card). FOUR THINGS TOGETHER, because each on its own
       passes a section that got one of the others wrong: exactly one shown handle and it is `USER.handle`, exactly one
       `@` in front of it (the `@@ada` fault `check-handles.js` guards in the fixture), one Randomise TILE, and nothing to
       type into — and a fifth, the line under it saying Cancel does not put the old one back, because the press saves at
       once. The pane is scrolled so the section is on the glass, and that is asked too. */
    { name: 'your handle, on your own card',
      only: () => typeof USER !== 'undefined' && !!USER && !!USER.handle,
      enter: () => {
        window.__CE_OWN = { profile: USER.profile };
        USER.profile = Object.assign({}, USER.profile || {}, { phone_cc: '+44' });
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        CARD_EDIT = cardEditFresh_(USER.personId);
        paint('account');
        const pages = [...document.querySelectorAll('#s-account .page')];
        const at = pages.findIndex(pg => pg.querySelector('.card-ed .ce-sec[data-sec="handle"]'));
        if (at < 0) throw new Error('no handle section on your own card\'s Edit');
        goPage('account', at, true);
        const sec = pages[at].querySelector('.card-ed .ce-sec[data-sec="handle"]'), pane = sec.closest('.pane');
        if (pane) pane.scrollTop += sec.getBoundingClientRect().top - pane.getBoundingClientRect().top - 12;
      },
      leave: () => {
        USER.profile = (window.__CE_OWN || {}).profile; delete window.__CE_OWN;
        CARD_EDIT = null;
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        repaint(true);
      },
      expect: () => {
        const pg = document.querySelector('#s-account .page.on');
        const sec = pg && pg.querySelector('.card-ed .ce-sec[data-sec="handle"]');
        if (!sec) return 0;
        const shown = sec.querySelectorAll('.handle-shown');
        const line = sec.querySelector('.handle-now');
        const r = sec.getBoundingClientRect(), b = sec.closest('.pane').getBoundingClientRect();
        return (shown.length === 1 && shown[0].textContent === USER.handle
                && line && (line.textContent.match(/@/g) || []).length === 1
                && sec.querySelectorAll('[data-do="handle-shuffle"]').length === 1
                /* A TILE, NOT A BUTTON — *"a THING has tiles; a FORM has buttons"*, and the handle is a thing. */
                && sec.querySelectorAll('.tile-row > .tile[data-do="handle-shuffle"] svg.tile-i-shuffle').length === 1
                && !sec.querySelector('.btn, input, #handle-new, [data-do="handle-save"]')
                && /Cancel does not put the old one back/.test((sec.querySelector('.handle-said') || {}).textContent || '')
                && r.top >= b.top - 1 && r.top < b.bottom - 40
                && !document.querySelector('#s-settings .handle-shown, #s-settings [data-do="handle-shuffle"]')) ? 1 : 0;
      },
      wants: 'the handle section of your own card\'s Edit on the glass: the handle shown once with one @, a Randomise tile with its mark, nothing to type into, the line saying Cancel does not undo it — and no handle on Settings' },

    /* ---------- THE WARDROBE, ON YOUR OWN CARD — ONE SECTION, AND A PICK THAT REDRAWS IT -------------------------------
       It was the last page of Settings, "Your figure", one card since *"should just be 1"*; on 11 Oct, *"your figure
       should also be in your profile card editing"*, so it is the figure section of your own card's Edit, straight
       under the picture. ONE section holding the swatches, all six slots and ONE figure; the pane scrolled to it, so it
       is measured on the glass at every width. And a pick, the same tick as the press (`avatarSave` redraws before the
       server answers; the lab's stub answers with the payload, which carries no `avatar`): the figure redrawn, the
       picked item ringed, AND THE PICTURE'S "YOUR FIGURE" ONE SECTION UP REDRAWN WITH IT — the figure is what the
       picture draws (docs/history/324), so the two must never disagree on one form. */
    { name: 'the wardrobe, on your own card',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.__CE_OWN = { profile: USER.profile };
        USER.profile = Object.assign({}, USER.profile || {}, { phone_cc: '+44' });
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        CARD_EDIT = cardEditFresh_(USER.personId);
        paint('account');
        const pages = [...document.querySelectorAll('#s-account .page')];
        const at = pages.findIndex(pg => pg.querySelector('.card-ed .ce-sec[data-sec="figure"]'));
        if (at < 0) throw new Error('no figure section on your own card\'s Edit');
        goPage('account', at, true);
        const sec = pages[at].querySelector('.card-ed .ce-sec[data-sec="figure"]'), pane = sec.closest('.pane');
        if (pane) pane.scrollTop += sec.getBoundingClientRect().top - pane.getBoundingClientRect().top - 12;
      },
      leave: () => {
        USER.profile = (window.__CE_OWN || {}).profile; delete window.__CE_OWN;
        CARD_EDIT = null;
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        repaint(true);
      },
      expect: () => {
        const pg = document.querySelector('#s-account .page.on');
        const sec = pg && pg.querySelector('.card-ed .ce-sec[data-sec="figure"]');
        if (!sec) return 0;
        const r = sec.getBoundingClientRect(), b = sec.closest('.pane').getBoundingClientRect();
        return !!sec.querySelector('.av-card [data-do="av-pick"]') && !!sec.querySelector('.av-card [data-do="av-colour"]')
          && document.querySelectorAll('#s-account .av-figure').length === 1
          && r.top >= b.top - 1 && r.top < b.bottom - 40
          && !document.querySelector('#s-settings .av-card, #s-settings [data-do="av-pick"]') ? 1 : 0;
      },
      wants: 'the figure section of your own card\'s Edit on the glass: the colours, every slot and one figure — and no wardrobe on Settings' },
    { name: 'a pick redraws the figure, and the picture\'s "your figure" with it',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.__CE_OWN = { profile: USER.profile, avatar: USER.avatar };
        USER.profile = Object.assign({}, USER.profile || {}, { phone_cc: '+44' });
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        CARD_EDIT = cardEditFresh_(USER.personId);
        paint('account');
        const pages = [...document.querySelectorAll('#s-account .page')];
        const at = pages.findIndex(pg => pg.querySelector('.card-ed [data-do="av-pick"]'));
        if (at < 0) throw new Error('no wardrobe on your own card\'s Edit');
        goPage('account', at, true);
        /* THE PAGE BY INDEX, NOT BY `.page.on` — `goPage` sets that class through `paintPager`. */
        const pg = pages[at];
        const fig = pg.querySelector('.av-figure');
        const was = fig ? fig.innerHTML : '';
        const opt = pg.querySelector('.pfp-opt[data-pic="avatar"]');
        const optWas = opt ? opt.innerHTML : '';
        const pick = [...pg.querySelectorAll('[data-do="av-pick"]')]
          .find(b => !b.classList.contains('on') && !b.classList.contains('locked') && b.dataset.slot === 'hair');
        if (pick) pick.click();
        /* READ IN THE SAME TICK AS THE PRESS — see the note above. */
        const now = pg.querySelector('.av-figure');
        const ringed = pick && pg.querySelector('[data-do="av-pick"][data-slot="' + pick.dataset.slot
          + '"][data-id="' + pick.dataset.id + '"].on');
        const optNow = pg.querySelector('.pfp-opt[data-pic="avatar"]');
        window.__AV_MOVED = !!pick && !!now && !!was && now.innerHTML !== was && !!ringed
          && !!optNow && !!optWas && optNow.innerHTML !== optWas;
        const sec = pg.querySelector('.card-ed .ce-sec[data-sec="figure"]'), pane = sec && sec.closest('.pane');
        if (pane) pane.scrollTop += sec.getBoundingClientRect().top - pane.getBoundingClientRect().top - 12;
      },
      leave: () => {
        const w = window.__CE_OWN || {};
        USER.profile = w.profile; USER.avatar = w.avatar; delete window.__CE_OWN;
        CARD_EDIT = null;
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        repaint(true);
      },
      expect: () => window.__AV_MOVED,
      wants: 'a hairstyle picked in the figure section redraws the figure, rings the pick, and redraws the picture\'s "your figure" one section up' },
    /* ---------- YOUR PICTURE, CHOSEN — `photoPicker_` in me.js ------------------------------------
       *"everyone should have a profile picture selector widget in account settings"* — the picture section of
       your own card's Edit since docs/history/339, for everybody, so these three states are the You column's. Seeded with a
       picture already kept, so the preview is a photograph rather than the initial and `Remove` is
       live: a square preview, `Choose photo` and `Remove` as tiles, the hidden file input that takes
       images, and no link box. At four widths, because the preview sits beside two tap targets and
       a line of text and is the one row on the card that could wrap at 320. */
    { name: 'your picture, chosen',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_PFP_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, { photo: 'data/reels/archetest.jpg', phone_cc: '+44' });
        /* ON YOUR OWN CARD'S EDIT, where the picker is since docs/history/339 — the form opened as Edit opens
           it, and the copy it is drawn from shaped as `myProfile` sends it (`phone_cc`). */
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        CARD_EDIT = cardEditFresh_(USER.personId);
        paint('account');
        const at = [...document.querySelectorAll('#s-account .page')].findIndex(pg => pg.querySelector('.card-ed .pfp'));
        if (at < 0) throw new Error('no picture picker on your own card\'s Edit');
        goPage('account', at, true);
      },
      leave: () => {
        USER.profile = window.STATE_PFP_WAS; delete window.STATE_PFP_WAS;
        CARD_EDIT = null;
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        repaint(true);
      },
      expect: () => {
        const pg = document.querySelector('#s-account .page.on');
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
    /* ---------- YOUR PICTURE, ONE OF ELEVEN — AT REST, AND WITH THE FOX CHOSEN ---------------------
       THE OWNER, 10 Oct: *"everybody profile picture selector should have 10 basic profile pics like
       xbox dp selector, which allow you to use your avatar as a dp."* The grid under the preview: your
       figure first, then the ten, every one a 44px target or more, in one block that fits the card —
       FOUR TO A ROW where the picker is under 294px wide (three rows) and SIX where it is not (two
       rows), the line under the grid rather than beside the tiles. At rest nothing is ringed and the
       preview is your initial; with the fox chosen the preview IS the fox, the gold ring is on it and
       only it, and Remove is live because there is a picture to remove. Measured by `check/ui.js` at
       every width for the tap targets, the contrast and the sideways scroll; asserted here for the
       shape, because a grid of eleven that wraps 5-5-1 or runs off the card measures as eleven fine
       buttons. */
    { name: 'your picture, the eleven at rest',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_PFP_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, { photo: '', phone_cc: '+44' });
        /* ON YOUR OWN CARD'S EDIT, where the picker is since docs/history/339 — the form opened as Edit opens
           it, and the copy it is drawn from shaped as `myProfile` sends it (`phone_cc`). */
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        CARD_EDIT = cardEditFresh_(USER.personId);
        paint('account');
        const at = [...document.querySelectorAll('#s-account .page')].findIndex(pg => pg.querySelector('.card-ed .pfp'));
        if (at < 0) throw new Error('no picture picker on your own card\'s Edit');
        goPage('account', at, true);
      },
      leave: () => {
        USER.profile = window.STATE_PFP_WAS; delete window.STATE_PFP_WAS;
        CARD_EDIT = null;
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        repaint(true);
      },
      expect: () => {
        const pg = document.querySelector('#s-account .page.on');
        const box = pg && pg.querySelector('.pfp');
        if (!box) return 0;
        const opts = [...box.querySelectorAll('.pfp-grid .pfp-opt')];
        const b = box.getBoundingClientRect();
        const grid = box.querySelector('.pfp-grid').getBoundingClientRect();
        const said = box.querySelector('.pfp-said').getBoundingClientRect();
        /* ZOOM: `paneReach_` may draw a tall card smaller to fit its pane, so a size is read in the
           card's own pixels — the box's layout width over its drawn width. */
        const z = box.offsetWidth ? b.width / box.offsetWidth : 1;
        /* HOW MANY ON EACH ROW, not merely how many rows: 5, 5, 1 is three rows too, and it is the
           orphan this layout exists to avoid. */
        const tops = opts.map(o => Math.round(o.getBoundingClientRect().top / z));
        const rows = [...new Set(tops)].map(t => tops.filter(x => x === t).length).join(',');
        const big = opts.every(o => { const r = o.getBoundingClientRect(); return r.width / z >= 43.5 && r.height / z >= 43.5; });
        return opts.length === 11 && opts[0].dataset.pic === 'avatar' && !!opts[0].querySelector('svg.avatar.is-bust')
          && opts.slice(1).every(o => o.querySelector('svg.pfp-art'))
          && !box.querySelector('.pfp-opt.on') && !!box.querySelector('.pfp-face .pfp-none')
          && big && grid.right <= b.right + 0.5 && grid.left >= b.left - 0.5
          && rows === (box.offsetWidth >= 294 ? '6,5' : '4,4,3')
          && said.top >= grid.bottom - 1
          && !!box.querySelector('.tile[data-do="pfp-remove"]') && box.querySelector('.tile[data-do="pfp-remove"]').disabled ? 11 : 0;
      },
      wants: 'your figure then the ten pictures, each 44px or more, none ringed, the initial in the preview, 4/4/3 under 294px and 6/5 from it, the line under the grid, and Remove off' },
    { name: 'your picture, the fox chosen',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_PFP_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, { photo: 'pfp:fox', phone_cc: '+44' });
        /* ON YOUR OWN CARD'S EDIT, where the picker is since docs/history/339 — the form opened as Edit opens
           it, and the copy it is drawn from shaped as `myProfile` sends it (`phone_cc`). */
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        CARD_EDIT = cardEditFresh_(USER.personId);
        paint('account');
        const at = [...document.querySelectorAll('#s-account .page')].findIndex(pg => pg.querySelector('.card-ed .pfp'));
        if (at < 0) throw new Error('no picture picker on your own card\'s Edit');
        goPage('account', at, true);
      },
      leave: () => {
        USER.profile = window.STATE_PFP_WAS; delete window.STATE_PFP_WAS;
        CARD_EDIT = null;
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => f.removeAttribute('data-dirty'));
        repaint(true);
      },
      expect: () => {
        const pg = document.querySelector('#s-account .page.on');
        const box = pg && pg.querySelector('.pfp');
        if (!box) return 0;
        const on = [...box.querySelectorAll('.pfp-opt.on')];
        const face = box.querySelector('.pfp-face');
        const r = face.getBoundingClientRect();
        const art = face.querySelector('svg.pfp-art');
        const ring = on[0] && getComputedStyle(on[0]).boxShadow;
        return on.length === 1 && on[0].dataset.pic === 'fox' && on[0].getAttribute('aria-pressed') === 'true'
          && !!ring && ring !== 'none'
          && !!art && Math.abs(art.getBoundingClientRect().width - r.width) < 3
          && /fox is your picture/i.test(box.querySelector('.pfp-said').textContent)
          && !box.querySelector('.tile[data-do="pfp-remove"]').disabled ? 1 : 0;
      },
      wants: 'the fox in the preview, filling it; the gold ring on the fox and nowhere else, pressed; the line saying the fox is your picture; Remove live' },
  ],

  /* ---------- THE SETTINGS COLUMN, WHICH THIS FILE HAD NEVER DECLARED A STATE FOR ----------------
     IT HAS THIRTEEN PAGES AND THE LAB HAD ONLY EVER SEEN THE FIRST. `check/ui.js` measures the page
     a column opens on, so `About you` was the whole of Settings as far as this file was concerned.
     Same fault as the Find screen measured only on its first question, one column along: what was
     missing was never a rule, it was a state. (The library cards, the wardrobe, the handle and the
     picture were pages here and are measured where they are now — Tools, and your own card's Edit on
     the You column — since docs/history/339.)

     EVERY CARD IS FOUND BY ASKING THE DOM. A literal page number would drift the moment a
     deployment sends one `profileFields` group fewer, and a state that lands on the wrong page fails loudly
     through `expect` rather than measuring the wrong card in silence. */
  settings: [
    { name: '' },
    /* ---------- YOUR CHILD'S ACCOUNT, MADE: THE SLIP ON "MANAGE YOUR CHILD" -----------------------------------------
       *"so all kids can login easily with their handle and pin."* After "Make their account" the make section of
       "Manage your child" (one card since docs/history/339, the make and the add forms under the children linked to
       you) grows a paper slip with the handle and the PIN, held as `KID_MADE` for the signed-in parent. The admin
       visitor holds the role the card is for, so it is drawn; the slip is set straight into the state, as `kid-make`
       sets it, and the page holding the card is turned to. The card is the tallest thing on the column with the slip
       on it — both forms and the slip — so it is measured at every width. */
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
        const slip = pg && pg.querySelector('.kid-manage .kid-make .pin-slip');
        return slip && slip.querySelectorAll('.pin-slip-v').length === 2
          && pg.querySelectorAll('.kid-make [data-kid-new]').length === 3
          && pg.querySelectorAll('.kid-manage .kid-add [data-kid]').length === 2
          && slip.scrollWidth <= slip.clientWidth + 1 ? 2 : 0;
      },
      wants: '"Manage your child" with the make form\'s three boxes, the slip — the handle and the PIN, neither running off it — and the add form\'s two boxes under it' },
    /* ---------- AND HELD FOR THE LINK: A PARENT WHOSE OWN ADDRESS NOBODY HAS PROVED ------------------------
       The PR #130 review: no child is put on an account until its address is confirmed (`confirmFirst_`
       in people.gs), so a PENDING parent's "Manage your child" holds ONE sentence where the two child forms
       would be — the address and "Send the link again". It was a card of its own drawn instead of two; it is
       the same one card either way since docs/history/339. Seeded through `USER.pendingEmail`, which the
       sign-in reply carries and the fixture visitor does not, with a long address that has no space in it. */
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
      /* `repaint(true)`: the card's inside changes back, so the column is placed afresh — see the family state. */
      leave: () => { USER.pendingEmail = window.__PENDING_WAS; repaint(true); },
      expect: () => {
        const pg = document.querySelector('#s-settings .page.on');
        const card = pg && pg.querySelector('.kid-manage .kid-held');
        return card && /philippa\.parentington-smythe\.family@example\.org/.test(card.textContent)
          && card.querySelectorAll('[data-do="resend-link"]').length === 1
          && !document.querySelector('#s-settings [data-kid-new], #s-settings [data-kid]')
          && card.scrollWidth <= card.clientWidth + 1 ? 2 : 0;
      },
      wants: 'one card naming the address to open the link from, with "Send the link again", and no child form anywhere on the column' },
    /* ---------- MANAGE YOUR CHILD, WITH CHILDREN LINKED, AND WITH NONE (docs/history/339) ----------------------------
       The owner, 11 Oct: *"chagne the add/make you child widget into one widget which is manage you child."* The card
       opens with the children already linked to you — a face, a first name, a handle and New PIN at the end of each
       line — and then the two forms. `DATA.family` is built by `doGet` for the signed-in person and the fixture cannot
       carry it, so it is seeded as the family state on the You column seeds it, stamped as this visitor's: three
       children, the longest first name and handle a line will hold, one face a photograph, one the fox and one an
       initial. And with none linked, the one line that says so. */
    ...[3, 0].map(n => ({
      name: n ? 'Manage your child, three children linked' : 'Manage your child, none linked',
      only: () => typeof USER !== 'undefined' && !!USER && typeof mayAddChild_ === 'function' && mayAddChild_(),
      enter: new Function('return (' + String(n => {
        window.__KIDS_WAS = { family: DATA.family, familyFor: DATA.familyFor };
        DATA.familyFor = USER.personId;
        DATA.family = [
          { personId: 'P-kid-1', title: 'Maximilian-Alexander', relation: 'child', handle: 'maximilian_conscientious42', image: 'data/reels/archetest.jpg' },
          { personId: 'P-kid-2', title: 'Wren', relation: 'child', handle: 'wren_kind43', image: 'pfp:fox' },
          { personId: 'P-kid-3', title: 'Ola', relation: 'child', handle: 'ola_brave07', image: '' },
        ].slice(0, n);
        document.querySelectorAll('#s-settings .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('settings');
        const at = [...document.querySelectorAll('#s-settings > .page')].findIndex(pg => pg.querySelector('.kid-manage'));
        if (at < 0) throw new Error('no "Manage your child" on the settings column');
        goPage('settings', at, true);
      }) + ')(' + n + ');'),
      leave: () => { const k = window.__KIDS_WAS || {}; DATA.family = k.family; DATA.familyFor = k.familyFor; delete window.__KIDS_WAS; repaint(true); },
      expect: new Function('return (' + String(n => {
        const pg = document.querySelector('#s-settings .page.on');
        const card = pg && pg.querySelector('.kid-manage');
        if (!card) return 0;
        const rows = [...card.querySelectorAll('.kid-list .kid-row')];
        const rowsOk = rows.length === n && rows.every(r => r.querySelectorAll('.tile[data-do="kid-pin"]').length === 1
          && !!r.querySelector('.kid-face') && r.scrollWidth <= r.clientWidth + 1
          && r.querySelector('.tile').getBoundingClientRect().right <= r.getBoundingClientRect().right + 0.5);
        const none = /No child is linked to you yet/.test(card.textContent);
        /* NEVER DRAWN SMALLER (the review of docs/history/339): two forms and a New PIN per child are there to be
           typed into and pressed, so the card is at full size and its pane scrolls — `paneReach_`'s card-editor
           rule. At 320x568 it was drawn at 70-84%, every control under 44px. And the two forms are headed in a
           readable size, because the server's email sends a parent to find those words. */
        const pane = card.closest('.pane');
        const zoomed = !!pane && [...pane.children].some(k => Number(k.style.zoom || 1) < 1);
        const heads = [...card.querySelectorAll('.kid-sec > .kid-h')];
        const headsOk = heads.length === 2 && heads.every(h => parseFloat(getComputedStyle(h).fontSize) >= 12);
        return rowsOk && (n ? !none : none) && !zoomed && headsOk
          && card.querySelectorAll('.kid-make [data-kid-new]').length === 3 && card.querySelectorAll('.kid-add [data-kid]').length === 2
          && card.scrollWidth <= card.clientWidth + 1 ? Math.max(1, n) : 0;
      }) + ')(' + n + ');'),
      wants: n ? '"Manage your child" at full size, listing three children, each a face, a first name and a handle with New PIN at the end of the line and nothing running off it, then both forms under headings of 12px or more'
               : '"Manage your child" at full size, saying no child is linked yet, then both forms under headings of 12px or more' })),
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
          /* AND NO PICKER: the face is the picture section of your own card's Edit now (docs/history/339). */
          && !pg.querySelector('.pfp') && !pg.querySelector('[data-me="photo"]') && !!pg.querySelector('[data-me="video"]')
          && shown.length === 2 && shown.every(s => s.querySelector('.ph-thumb img'))
          && pg.querySelectorAll('[data-do="shelf-more"]').length === 1
          && pg.querySelectorAll('[data-do="me-save"]').length === 1 ? 8 : 0;
      },
      wants: 'the video, then the two filled photograph links with a thumbnail each, eight boxes in the form and one Add another — and no picture picker, which is on your own card' },
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
      /* EXACTLY SIX, NOT MERELY SOME. `expect` is read as a truthy value, so a page holding two
         boxes would pass a bare count — and two is precisely what splitting the group back into
         `Group size` and `Your rate` produces. The whole point is that they are on ONE page, so the
         number is the assertion. SIX SINCE docs/history/330: the four pricing boxes and the session
         length (`SESSION_FIELDS`, constants.gs — on this page, not under its clock), which a tutor
         with a card edits on the card and a tutor not yet listed edits here. Two ranges, four boxes. */
      expect: () => (document.querySelectorAll('#s-settings .page.on [data-me]').length === 6
                     && document.querySelectorAll('#s-settings .page.on .f-row.is-range [data-me]').length === 4
                     && !!document.querySelector('#s-settings .page.on .f-row.is-range [data-me="min_hours"]')
                     ? 6 : 0),
      wants: 'all four pricing boxes and the session length on one page, the students and the hours each one min – max row' },

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
    /* ---------- THE LIBRARY CARDS STARRED ONTO SAVED, TYPED INTO, AND A REPAINT (the review of docs/history/339) --------
       A library card has no draft (its PIN is on it), so what keeps typing on the starred copy is the hold: Saved's
       `.widget-slot .me-form` in `KEEP_FORMS_` marks it dirty, `settingsKeep_('saved')` holds the column, and a
       repaint leaves the box — the same element, the same words. Asked HERE, in a browser, because check-flow
       cannot reach a starred copy: jsdom has no `CSS.escape`, so `$('lib-box')` falls back to the first copy, the
       one on Tools. Measured in the review with either half of the hold taken away: the box was replaced and said
       "Merton", the sheet's copy, over what was typed. Starred, typed into once the Saved copy is drawn, repainted,
       and what the box is and holds written down for `expect`. */
    { name: 'the library cards starred, typed into, and the column repainted',
      only: () => typeof USER !== 'undefined' && !!USER && widgetsOf_('tool').some(w => w.id === 'libcards'),
      enter: () => {
        const w = widgetsOf_('tool').find(x => x.id === 'libcards');
        if (!isFav(WIDGET_KEY(w))) toggleFav(WIDGET_KEY(w), 'widget');
        window.__LIB_SAVED = null;
        repaint(true);
        const at = [...document.querySelectorAll('#s-saved > .page')].findIndex(pg => pg.querySelector('#wgt-libcards'));
        if (at < 0) throw new Error('the starred library cards are not on the Saved column');
        goPage('saved', at, true);
        const t0 = performance.now();
        const type = () => {
          const box = document.querySelector('#s-saved #wgt-libcards [data-me="lib1_name"]');
          if (!box) { if (performance.now() - t0 < 2000) setTimeout(type, 100); else window.__LIB_SAVED = { drawn: false }; return; }
          box.value = 'Typed on Saved';
          box.dispatchEvent(new Event('input', { bubbles: true }));
          repaint(true);
          setTimeout(() => {
            const now = document.querySelector('#s-saved #wgt-libcards [data-me="lib1_name"]');
            window.__LIB_SAVED = { drawn: true, same: now === box, val: now && now.value };
          }, 500);
        };
        setTimeout(type, 150);
      },
      expect: () => !!window.__LIB_SAVED && window.__LIB_SAVED.same === true && window.__LIB_SAVED.val === 'Typed on Saved',
      why: () => JSON.stringify(window.__LIB_SAVED),
      wants: 'the starred library cards on Saved keeping what was typed through a repaint — the same box, the same words',
      leave: () => {
        const w = widgetsOf_('tool').find(x => x.id === 'libcards');
        document.querySelectorAll('#s-saved .widget-slot .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        if (w && isFav(WIDGET_KEY(w))) toggleFav(WIDGET_KEY(w), 'widget');
        delete window.__LIB_SAVED;
        repaint(true);
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

  /* ---------- THE BUSINESS RECORDS, A COLUMN OF THEIR OWN AND ONLY AN ADMIN'S ------------------------
     They were pages of an admin's Settings, measured there by the two states below; *"the business
     checklist stuff should go in their own column at the end"* (the owner, 10 Oct) moved them, and the
     states moved with them (docs/history/334). EVERY STATE HERE IS `only:` AN ADMIN, the unnamed one
     included — for anybody else the column is not in `TABS`, `go('biz')` lands on the front door, and
     measuring that as this column would be a finding about the check. `check/ui.js` and
     `check/press.js` skip a column a visitor is not given as well, so a state that forgot its `only`
     still measures nothing in the stranger's name.

     THE UNNAMED STATE ASKS WHAT IT IS LOOKING AT, for Progress's reason: the column a person lands on,
     the five cards in order, each with its Save — and ANSWERED, no loader left on it. Arriving asks
     `listRecords` (`bizStart_`), and the first run measured 390 with the dots still over the boxes
     because a loaded machine answered late; the wait is `the business records still coming`, below,
     held on purpose, and this one is the column once the answer is in. */
  biz: [
    { name: '',
      only: () => typeof USER !== 'undefined' && !!USER && isAdmin(),
      expect: () => {
        const h = document.getElementById('s-biz');
        if (!h || typeof AT === 'undefined' || AT !== 'biz' || h.querySelector('.loading')) return 0;
        const cards = [...h.querySelectorAll(':scope > .page > .pane .me-form[data-biz-page]')];
        return cards.map(c => c.dataset.bizPage).join('|') === 'Insurance|Tax|Legal and data|Safeguarding|Money and company'
          && cards.every(c => c.querySelector('.tile[data-do="biz-save"]')) ? 1 : 0;
      },
      wants: 'the Business column: Insurance, Tax, Legal and data, Safeguarding, Money and company, each with its Save' },

    /* THE INSURANCE CARD WITH SOMETHING RECORDED. `only:` for the flyer's reason: nobody else is drawn
       one, so asking a stranger to reach it would be a finding about the check. SEEDED THROUGH
       `BIZ.list`, which is what `listRecords` writes — the fixture answers every POST with the payload,
       so without a seed the page is measured with every box empty and no flag, which is half of what
       the card can draw. One item due in ten days, so the Due soon flag is on the screen and measured. */
    { name: 'the business records (insurance)',
      only: () => typeof USER !== 'undefined' && !!USER && isAdmin(),
      enter: () => {
        const d = new Date(); d.setDate(d.getDate() + 10);
        const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-'
          + String(d.getDate()).padStart(2, '0');
        window.__bizWas = BIZ.list;
        BIZ.list = [{ id: 'pub_liability', title: 'Public liability insurance', category: 'Insurance',
          provider: 'Example Insure', reference: 'PL-000000', due_on: iso }];
        document.querySelectorAll('#s-biz .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('biz');
        const at = [...document.querySelectorAll('#s-biz .page')]
          .findIndex(pg => pg.querySelector('[data-biz-page="Insurance"]'));
        if (at < 0) throw new Error('no business-records page on the Business column');
        goPage('biz', at, true);
      },
      leave: () => { BIZ.list = window.__bizWas || null; delete window.__bizWas;
        document.querySelectorAll('#s-biz .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('biz'); },
      expect: () => {
        const pg = document.querySelector('#s-biz .page.on');
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
       THREE WIDGETS WAITING ON A REAL REQUEST, HELD, AND THEN LET GO — this one, and the Videos card
       and the camera, which are declared with their own columns

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
        document.querySelectorAll('#s-biz .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('biz');
        const at = [...document.querySelectorAll('#s-biz .page')]
          .findIndex(pg => pg.querySelector('[data-biz-page="Insurance"]'));
        if (at < 0) throw new Error('no business-records page on the Business column');
        goPage('biz', at, true);
        bizStart_();
      },
      expect: () => {
        const pg = document.querySelector('#s-biz .page.on');
        const body = pg && pg.querySelector('.biz-body[aria-busy="true"]');
        return !!body && pg.querySelectorAll('.loading').length === 1 && !!body.querySelector(':scope > .loading')
          && !!body.querySelector('input[data-biz="pub_liability"][data-k="reference"]');
      },
      wants: 'the Insurance card\'s boxes drawn and under the one loader while listRecords is held',
      release: () => { const h = window.__bizHeld; if (h && h.go) { h.go(); h.go = null; } },
      landed: () => {
        const pg = document.querySelector('#s-biz .page.on');
        return !!pg && !pg.querySelector('.loading')
          && (pg.querySelector('[data-biz="pub_liability"][data-k="reference"]') || {}).value === 'PL-000000';
      },
      leave: () => {
        const h = window.__bizHeld;
        if (h) { window.fetch = h.fetch; BIZ.list = h.list; BIZ.asking = false; }
        delete window.__bizHeld;
        document.querySelectorAll('#s-biz .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        paint('biz');
        /* NOTHING WAS THERE BEFORE EITHER: ask again, on the real wire, rather than leave five cards
           drawn waiting with nothing on its way to end it. */
        if (!BIZ.list) bizStart_();
      } },

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
    /* ---------- THREE, FOUR AND FIVE LIBRARY CARDS, DRAWN AS CARDS — `libraryShelf_` in me.js; docs/history/332 -----
       ON TOOLS SINCE docs/history/339 — *"move library card widget to the tools column."* — a widget card now, with its
       star above the shelf, so the page is the shelf and a row taller than it was on Settings, and these three states
       are the Tools column's. Everything they ask is what they asked of the Settings page.
       THE OWNER, 10 Oct: *"make each look like a card. with fake barcode."* Seeded with invented libraries (the
       longest name the shelf has ever been measured with among the first three, because the name is the box
       that gives), the rest of the five slots empty. Asked of each card, at every width: its three boxes are ON
       it; it is a bank card's shape (85.6:54, within 3%) and nothing inside it spills past that shape; the ink
       of every box is 4.5:1 or better on the card's own paper, which `check/ui.js`'s text rule cannot ask
       because a box's value is not a text node; and the bars are decoration (`aria-hidden`) and different on
       every card. `Add another` is on the page while a slot is left to reveal, and not once all five show.

       FOUR AND FIVE AS WELL AS THREE, BECAUSE THE CARD'S SHAPE IS WHAT MAKES THE PAGE TALL. A face's height
       follows its width, so at the column's full width three cards were the most a 390x844 phone drew at full
       size: the fit rule took four to 81% and five to its 70% floor there, and at 1280x800 three to 81% —
       every card with a blank band between its name and its bars. The review of 10 Oct found this file seeded
       three, so `check/ui.js` had never once drawn the page where it cost most. Now it draws all three counts.
       And the cards give that band back first (`libFit_` in me.js, called by `paneReach_`): they narrow,
       keeping the shape, until the page fits or the band runs out, and only the rest is drawn smaller. Asked
       of every count, at every width: A PAGE DRAWN SMALLER HAS NO BLANK BAND LEFT ON ITS CARDS (3px of
       slack for the last pass's rounding) — red before `libFit_`, when four cards at 390 were at 81% with
       45px of blank on each and three at 1280 at 81% with 68; and the fit rule's own promise, that the page
       is no smaller than the app's `PANE_ZOOM_MIN` and the tick is on the glass or the pane scrolls to it.
       The cost that is left prints as `CARD DRAWN SMALLER TO FIT` with its percentage, beside every other
       card that pays it.

       WHY `new Function`: every state is carried into the page as its source and run there (the
       notifications states below say so at length), so a closure over `n` would arrive empty. Each state is
       the one source below with its count written in as a literal. */
    ...(() => {
      const enter = n => {
        window.STATE_LIB_WAS = USER.profile;
        const seed = [['Merton', '2000000000000'], ['Sutton Central', '2000000000001'],
                      ['Wandsworth Town and Putney', '2000000000002'], ['Larkbridge', '2000000000003'],
                      ['Fennmoor Green', '2000000000004']];
        const cards = {};
        for (let i = 1; i <= 5; i++) {
          const s = i <= n ? seed[i - 1] : ['', ''];
          cards['lib' + i + '_name'] = s[0]; cards['lib' + i + '_no'] = s[1]; cards['lib' + i + '_pin'] = i <= n ? '0000' : '';
        }
        USER.profile = Object.assign({}, USER.profile || {}, cards);
        /* THE TOOLS WIDGET NOW (docs/history/339): its slot found by its id, the column turned to it, and every
           copy drawn again from the seeded profile — `libCardsRedraw_` is what `myProfile` landing calls. */
        document.querySelectorAll('#s-tools .widget-slot .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        const at = [...document.querySelectorAll('#s-tools > .page')].findIndex(pg => pg.querySelector('#wgt-libcards'));
        if (at < 0) throw new Error('no library cards widget on the Tools column');
        goPage('tools', at, true);
        libCardsRedraw_();
      };
      const expect = n => {
        const pg = document.querySelector('#s-tools .page.on');
        if (!pg || !pg.querySelector('#wgt-libcards')) return 0;
        const slots = pg.querySelectorAll('.lib-card').length;
        const faces = [...pg.querySelectorAll('.lib-card:not([hidden]) > .lib-face')];
        if (faces.length !== n || pg.querySelectorAll('[data-do="shelf-more"]').length !== (n < slots ? 1 : 0)) return 0;
        const rgb = s => (String(s).match(/[\d.]+/g) || []).slice(0, 3).map(Number);
        const lum = c => c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
          .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
        const ratio = (p, q) => { const a = lum(rgb(p)), b = lum(rgb(q)); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
        const bars = new Set();
        const ok = faces.every(f => {
          const r = f.getBoundingClientRect();
          const paper = getComputedStyle(f).backgroundColor;
          const boxes = [...f.querySelectorAll('input[data-me]')];
          const svg = f.querySelector('svg.lib-bars');
          if (svg) bars.add(svg.innerHTML);
          return boxes.length === 3
            && ['name', 'no', 'pin'].every(k => f.querySelector('input[data-me$="_' + k + '"]'))
            && Math.abs(r.width / r.height - 85.6 / 54) < 0.03 * (85.6 / 54)
            && f.scrollHeight <= f.clientHeight + 1 && f.scrollWidth <= f.clientWidth + 1
            && boxes.every(b => ratio(getComputedStyle(b).color, paper) >= 4.5)
            && !!svg && svg.getAttribute('aria-hidden') === 'true';
        });
        if (!ok || bars.size !== n) return 0;
        /* THE FIT RULE'S PROMISE, read off the page rather than restated: no smaller than its floor, and the
           tick on the glass or one scroll of the pane away. */
        const pane = faces[0].closest('.pane'), tick = pg.querySelector('[data-do="me-save"]');
        if (!pane || !tick || typeof PANE_ZOOM_MIN !== 'number') return 0;
        const zoom = Math.min(1, ...[...pane.children].map(k => Number(k.style.zoom || 1)));
        if (zoom < PANE_ZOOM_MIN - 0.001) return 0;
        /* THE CARDS GAVE THEIR BLANK BAND BEFORE THE PAGE WAS DRAWN SMALLER — the face's third row. */
        const band = parseFloat(String(getComputedStyle(faces[0]).gridTemplateRows).split(/\s+/)[2]) || 0;
        if (zoom < 1 && band > 3) return 0;
        const p = pane.getBoundingClientRect(), t = tick.getBoundingClientRect();
        const seen = t.top >= p.top - 1 && t.bottom <= p.bottom + 1 && t.bottom <= innerHeight + 1;
        const scrolls = pane.style.overflowY === 'auto' && pane.scrollHeight - pane.clientHeight > 2;
        return seen || scrolls ? n : 0;
      };
      const word = { 3: 'three', 4: 'four', 5: 'five' };
      return [3, 4, 5].map(n => ({
        name: word[n] + ' library cards',
        only: () => typeof USER !== 'undefined' && !!USER,
        enter: new Function('return (' + String(enter) + ')(' + n + ');'),
        leave: () => {
          USER.profile = window.STATE_LIB_WAS; delete window.STATE_LIB_WAS;
          document.querySelectorAll('#s-tools .widget-slot .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
          libCardsRedraw_();
        },
        expect: new Function('return (' + String(expect) + ')(' + n + ');'),
        wants: word[n] + ' library cards at a bank card\'s proportions, each with its name, PIN and number boxes on it in ink '
          + '4.5:1 on its paper, different bars on each, ' + (n < 5 ? 'one Add another' : 'no Add another')
          + ', no blank band left on a card if the page is drawn smaller, no smaller than PANE_ZOOM_MIN, and the tick '
          + 'on the glass or one scroll away' }));
    })(),
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
       category in `IMP_DECK` are put on the card — with their pictures, read through the game's own
       `impCards_` (note 343) — the Articulate states' rule, because the one worth
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
                 && !!document.querySelector('#s-games #imp-card .imp-sym')
                 && (document.querySelector('#s-games #imp-card') || {}).textContent.replace(/\s+/g, ' ').trim() === 'Player 1 Show',
      wants: 'Player 1 and Show with its eye — nothing secret, no "Pass to", and room kept for the picture and Listen',
      leave: () => { impAloud_(false); ACTIONS['imp-players'](document.createElement('button')); } },
    { name: 'imposter a players card with listen',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'imp'; ACTIONS['wg-pick'](sel); }
        impAloud_(true);
        ACTIONS['imp-start'](document.createElement('button'));
        const [c, w, p] = impCards_().reduce((a, b) => (b[1].length > a[1].length ? b : a));
        IMP.imp = 1; IMP.cat = c; IMP.word = w; IMP.sym = p;
        ACTIONS['imp-show'](document.createElement('button'));
      },
      /* AND THE PICTURE HAS ITS HAIRLINE AND NO "?": the outline is what keeps ♠ and 🕸️ from vanishing
         into a nearly black card (style.css, `.imp-sym`), and the "?" is the imposter's alone. Asked of
         the real stylesheet, because jsdom draws neither. */
      expect: () => !!document.querySelector('#s-games #imp-card [data-do="imp-listen"]')
                 && !!document.querySelector('#s-games #imp-card [data-do="imp-hide"] .tile-i')
                 && (document.querySelector('#s-games #imp-card .imp-big') || {}).textContent === IMP.word
                 && !!IMP.sym && (document.querySelector('#s-games #imp-card .imp-sym') || {}).textContent === IMP.sym
                 && /drop-shadow/.test(getComputedStyle(document.querySelector('#s-games #imp-card .imp-sym')).filter)
                 && getComputedStyle(document.querySelector('#s-games #imp-card .imp-sym'), '::after').content === 'none',
      wants: 'the longest word in the deck under its outlined picture, no "?", Hide with its shut eye, and the Listen speaker',
      leave: () => { impAloud_(false); ACTIONS['imp-players'](document.createElement('button')); } },
    { name: 'imposter the imposters card',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'imp'; ACTIONS['wg-pick'](sel); }
        impAloud_(true);
        ACTIONS['imp-start'](document.createElement('button'));
        IMP.imp = 0;
        IMP.cat = Object.keys(IMP_DECK).reduce((a, b) => (b.length > a.length ? b : a));
        IMP.catSym = IMP_DECK[IMP.cat].sym;
        ACTIONS['imp-show'](document.createElement('button'));
      },
      /* AND THE "?" DRAWN ON IT — the mark a child who cannot read "Imposter" knows this card by
         (impFrame_, note 343). The class is the journey's to see; whether the stylesheet draws
         anything for it only a real browser can say. */
      expect: () => (document.querySelector('#s-games #imp-card .imp-big') || {}).textContent === 'Imposter'
                 && (document.querySelector('#s-games #imp-card .imp-lab') || {}).textContent === IMP.cat
                 && !!IMP.catSym && (document.querySelector('#s-games #imp-card .imp-sym') || {}).textContent === IMP.catSym
                 && !!document.querySelector('#s-games #imp-card [data-do="imp-listen"]')
                 && getComputedStyle(document.querySelector('#s-games #imp-card .imp-sym'), '::after').content === '"?"',
      wants: 'the category\'s picture with the imposter\'s "?" on it, Imposter, the longest category as the hint, Hide and Listen',
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
        IMP.catSym = IMP_DECK[IMP.cat].sym;
        impPaint();
      },
      expect: () => IMP.phase === 'play'
                 && !!document.querySelector('#s-games #imp-card [data-do="imp-reveal"]')
                 && / starts$/.test((document.querySelector('#s-games #imp-card .imp-big') || {}).textContent || ''),
      wants: 'the category\'s picture, who starts, the category, and Reveal — no word',
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
        const [, w, p] = impCards_().reduce((a, b) => (b[1].length > a[1].length ? b : a));
        IMP.word = w; IMP.sym = p;
        impPaint();
      },
      expect: () => IMP.phase === 'reveal'
                 && !!document.querySelector('#s-games #imp-acts [data-do="imp-again"]')
                 && !!document.querySelector('#s-games #imp-acts [data-do="imp-players"]'),
      wants: 'Imposter and the player, the longest word under its picture, Deal and Players',
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
       card with the speaker under it, and again with it off. Each top within 0.5px of the first.

       AND THE PICTURE'S TOP AS WELL, since every card has one (the owner, 11 Oct: "Add symbols to
       imposter"; note 343). The hand-over draws that slot EMPTY, so a slot that took its height from
       its emoji would be 0px tall there and put the name and Show a picture's height higher than the
       word and Hide that follow — the 36px fault again, from the other end of the card. */
    { name: 'imposter the big line and the button stay put',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'imp'; ACTIONS['wg-pick'](sel); }
        window.__impStill = null;
        const b = () => document.createElement('button');
        const [, word, wordSym] = impCards_().reduce((a, x) => (x[1].length > a[1].length ? x : a));
        const cat = Object.keys(IMP_DECK).reduce((a, x) => (x.length > a.length ? x : a));
        const catSym = IMP_DECK[cat].sym;
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
          const big = q('.imp-big'), go = q('.imp-go'), pic = q('.imp-sym');
          return { where: where, big: big ? +big.getBoundingClientRect().top.toFixed(1) : NaN,
                   go: go ? +go.getBoundingClientRect().top.toFixed(1) : NaN,
                   pic: pic ? +pic.getBoundingClientRect().top.toFixed(1) : NaN };
        };
        const walk = async aloud => {
          const got = [];
          const look = async where => { await rest(); got.push(at(where)); };
          impAloud_(aloud);
          ACTIONS['imp-players'](b());
          ACTIONS['imp-start'](b());
          IMP.imp = 1; IMP.word = word; IMP.cat = cat; IMP.sym = wordSym; IMP.catSym = catSym;
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
          && Number.isFinite(r.pic) && Math.abs(r.pic - list[0].pic) < 0.5
          && Math.abs(r.big - list[0].big) < 0.5 && Math.abs(r.go - list[0].go) < 0.5);
        return !!s && still(s.on) && still(s.off);
      },
      wants: 'the picture, the big line and the gold button at one height on pass, the longest word, the imposter\'s longest hint and play — Read aloud on and off',
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

    /* ---------- THE VIDEOS CARD: THE BAR, FOUR RESULTS, A FILM PLAYING, AND THE GLASS FILLED -----------
       *"at first all you see is a search bare, then you search and you see relevant result underneath.
       max 4 results show. you click on one, then it shows video. you can click fullscreen to make it
       fullscreen"* — the owner, 10 Oct (note 321). FOUR STATES FOR FOUR THINGS THE CARD IS, because
       `go()` reaches only the first: the bar alone; four results with the line under them (and, for an
       admin, the Sync row at the foot); a result playing in their place; and the app's own full screen.
       Seeded through the card's own list (`VIDEOS_LIST`, what `data/videos.json` would have filled)
       with the LONGEST title a row is likely to carry, because a title is the one thing on this card
       that can take it sideways at 320. The video is the repository's own reel, so the lab plays a real
       file and never reaches for YouTube. */
    { name: 'the videos card, idle',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        VID.q = ''; VID.at = '';
        vidPaint_();
        goPage('games', n, true);
      },
      expect: () => {
        const box = document.querySelector('#s-games #wgt-videos .vid-box');
        return !!box && !!box.querySelector('input.vid-q') && !box.querySelector('.vid-row, .vid-player, .vid-watch.on, .loading')
          && !(box.querySelector('.vid-results') || {}).innerHTML && !(box.querySelector('.vid-admin') || {}).innerHTML;
      },
      wants: 'the search bar and nothing else — no count, no list, no admin row, no player' },
    { name: 'a video search, four and how many more',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        window.__seedVid = VIDEOS_LIST;
        VIDEOS_LIST = [
          { title: 'Photosynthesis explained: how a leaf turns light, water and carbon dioxide into sugar',
            url: 'data/reels/archetest.mp4', kind: 'clip', tags: 'science biology plants', age: '9+', active: true },
          { title: 'Photosynthesis, the short one', url: 'data/reels/archetest.mp4?b', kind: 'clip', tags: 'science', age: '', active: true },
          { title: 'Photographs of leaves', url: 'https://example.org/leaves', kind: 'clip', tags: 'art', age: '', active: true },
          { title: 'The photon and the leaf', url: 'data/reels/archetest.mp4?d', kind: 'clip', tags: 'physics', age: '', active: true },
          { title: 'Sunlight and plants', url: 'data/reels/archetest.mp4?e', kind: 'clip', tags: 'photo science', age: '', active: true },
          { title: 'Why leaves are green', url: 'data/reels/archetest.mp4?f', kind: 'clip', tags: 'photosynthesis', age: '', active: true },
          { title: 'Fractions in two minutes', url: 'data/reels/archetest.mp4?c', kind: 'clip', tags: 'maths', age: '', active: true },
        ];
        VID.q = 'photo'; VID.at = '';
        /* PAINTED, THEN TURNED TO, so the pager settles on a card that already has its height. */
        vidPaint_();
        goPage('games', n, true);
      },
      expect: () => {
        const box = document.querySelector('#s-games #wgt-videos .vid-box');
        if (!box || box.querySelectorAll('.vid-results .vid-list .vid-row').length !== 4) return false;
        if (!/^2 more — keep typing to narrow$/.test(((box.querySelector('.vid-results .vid-more') || {}).textContent || ''))) return false;
        /* AN ADMIN'S SYNC ROW AT THE FOOT, UNDER THE RESULTS; NOBODY ELSE'S. */
        const adm = box.querySelector('.vid-admin');
        const mine = typeof isAdmin === 'function' && isAdmin();
        return mine ? !!(adm && adm.querySelector('.tile.is-admin[data-do="vid-sync"]')) && box.lastElementChild === adm
                    : !(adm && adm.innerHTML);
      },
      wants: 'four results and "2 more — keep typing to narrow" under them, and an admin\'s Sync row at the foot',
      leave: () => { VIDEOS_LIST = window.__seedVid || null; VID.q = ''; VID.at = ''; vidPaint_(); } },
    { name: 'a video search, one playing',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        window.__seedVid = VIDEOS_LIST;
        VIDEOS_LIST = [
          { title: 'Photosynthesis explained: how a leaf turns light, water and carbon dioxide into sugar',
            url: 'data/reels/archetest.mp4', kind: 'clip', tags: 'science biology plants', age: '9+', active: true },
          { title: 'Photosynthesis, the short one', url: 'data/reels/archetest.mp4?b', kind: 'clip',
            tags: 'science', age: '', active: true },
        ];
        VID.q = 'photo';
        VID.at = 'v0';
        vidPaint_();
        goPage('games', n, true);
      },
      expect: () => !!document.querySelector('#s-games .vid-stage.on video.vid-player')
                 && !!document.querySelector('#s-games .vid-acts .tile[data-do="vid-full"]:not([disabled])')
                 && !document.querySelector('#s-games .vid-results .vid-row')
                 && !(document.querySelector('#s-games .vid-admin') || {}).innerHTML
                 && (document.querySelector('#s-games .vid-q') || {}).value === 'photo',
      wants: 'the player holding the chosen clip in place of the results, the Full screen tile beside its title, and the bar still holding "photo"',
      leave: () => { VIDEOS_LIST = window.__seedVid || null; VID.q = ''; VID.at = ''; vidPaint_(); } },
    /* ---------- A FILM FROM THE FOLDER, PLAYING IN DRIVE'S PLAYER, WITH THE DOOR BESIDE IT --------------
       The one watch view with TWO tiles beside its title — Full screen and Open in Drive — which is the
       narrowest the title gets at 320. The film is invented and added to the admin's films for this
       state alone; its frame asks Drive for a file that does not exist, which this lab cannot reach
       anyway — what is measured is the card round it. */
    { name: 'a film from the folder playing, with Open in Drive',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        window.__seedFilms = DATA.films;
        DATA.films = (DATA.films || []).concat([{ id: 'FXD01', title: 'An Invented Film Kept In Drive For Measuring', year: '1999',
          kind: 'film', audience: 'kids', seasons: '', url: 'https://drive.google.com/file/d/example-fx-drive-001/view', placeholder: false, notes: '' }]);
        VID.q = 'invented film kept';
        VID.at = 'fFXD01';
        vidPaint_();
        goPage('games', n, true);
      },
      expect: () => /^https:\/\/drive\.google\.com\/file\/d\/example-fx-drive-001\/preview$/.test(
                     (document.querySelector('#s-games .vid-stage iframe.vid-player') || {}).src || '')
                 && !!document.querySelector('#s-games .vid-acts .tile[data-do="vid-full"]')
                 && !!document.querySelector('#s-games .vid-acts a.tile[href*="example-fx-drive-001"]'),
      wants: 'Drive\'s player of the film, and Full screen and Open in Drive beside its title',
      leave: () => { DATA.films = window.__seedFilms || []; VID.q = ''; VID.at = ''; vidPaint_(); } },
    /* ---------- AND THE APP'S OWN FULL SCREEN, WHERE THE BROWSER HAS NONE --------------------------------
       Safari on an iPhone has no full screen for anything but a `<video>`'s own player; this lab is
       Chromium, so the Fullscreen API is TAKEN AWAY for the state — and the `<video>` here has no
       `webkitEnterFullscreen` in Chromium either, so the tile reaches the app's own, as an iframe on an
       iPhone does. Pressed through the tile, after the card is placed. What is measured is the block in
       the top layer over the whole glass: the Exit tile's 44px, nothing sideways, and the pane under it
       where it was. Put back on `leave`, API and all. */
    { name: 'the videos card, its own full screen',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        window.__seedVid = VIDEOS_LIST;
        window.__fsApi = { r: Element.prototype.requestFullscreen, w: Element.prototype.webkitRequestFullscreen };
        delete Element.prototype.requestFullscreen;
        delete Element.prototype.webkitRequestFullscreen;
        VIDEOS_LIST = [{ title: 'Photosynthesis explained: how a leaf turns light, water and carbon dioxide into sugar',
                         url: 'data/reels/archetest.mp4', kind: 'clip', tags: 'science', age: '9+', active: true }];
        VID.q = 'photo';
        VID.at = 'v0';
        vidPaint_();
        goPage('games', n, true);
        setTimeout(() => {
          const t = document.querySelector('#s-games #wgt-videos .vid-acts [data-do="vid-full"]');
          if (t) ACTIONS['vid-full'](t);
        }, 150);
      },
      /* AND WHAT "FULL SCREEN" MEANS, ASKED IN PIXELS AT EVERY WIDTH: the block is the viewport, a point
         in each corner and the middle of the glass lands inside it (nothing of the app is above it or
         reachable through it), the film is 16:9, wholly on the glass and as large as the room allows —
         the width of the glass, its height, or the width less the Exit tile beside it — and the Exit
         tile is on the glass and off the picture. A rule that put the block in a corner, or a film the size of the card,
         arrives here as a state that did not arrive. */
      expect: () => {
        const w = document.querySelector('#s-games #wgt-videos .vid-watch.is-fs');
        let open = false;
        try { open = !!w && w.matches(':popover-open'); } catch (e) { open = false; }
        const x = w && w.querySelector('.vid-acts .tile[data-do="vid-unfull"]');
        const v = w && w.querySelector('.vid-stage video.vid-player');
        if (!open || !x || !v) return false;
        const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
        const r = w.getBoundingClientRect(), st = w.querySelector('.vid-stage').getBoundingClientRect(), xr = x.getBoundingClientRect();
        const whole = Math.abs(r.left) < 1 && Math.abs(r.top) < 1 && Math.abs(r.width - vw) < 1 && Math.abs(r.height - vh) < 1;
        const over = [[2, 2], [vw - 3, 2], [2, vh - 3], [vw - 3, vh - 3], [vw / 2, vh / 2]]
          .every(([px, py]) => { const e = document.elementFromPoint(px, py); return !!e && w.contains(e); });
        /* AS LARGE AS THE ROOM ALLOWS: on its side the whole height, or the width less the Exit tile and
           its 1.5rem beside it; upright the whole width, or the height less the tile under it. */
        const g = 44 + 1.5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
        const room = vw > vh ? Math.min(vw - g, vh * 16 / 9) : Math.min(vw, (vh - g) * 16 / 9);
        const wide = Math.abs(st.width / st.height - 16 / 9) < 0.02 && st.width >= room - 2
          && st.left >= -1 && st.top >= -1 && st.right <= vw + 1 && st.bottom <= vh + 1;
        const clear = xr.width >= 44 && xr.height >= 44 && xr.left >= 0 && xr.top >= 0 && xr.right <= vw && xr.bottom <= vh
          && (xr.right <= st.left || xr.left >= st.right || xr.bottom <= st.top || xr.top >= st.bottom);
        return whole && over && wide && clear;
      },
      wants: 'the player\'s block in the top layer over the whole screen — the viewport, a 16:9 film as large as the room allows, and an Exit full screen tile of 44px beside it, off the picture',
      leave: () => {
        try { vidFullOff_(); } catch (e) {}
        /* AND THE CARD LET GO OF, AS A FINGER LEAVING IT WOULD. Going full screen hands the focus to the Exit
           tile and coming back hands it to Full screen, and a focus on the card in front HOLDS its top
           (`HOLD_AT`, shell.js) — right for somebody using it, and here it outlived the state: every later
           state on this page then grew and shrank the card downward from a held top, and the column ended
           the run 94-143px off the line `check/ui.js` holds every column to. */
        try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); HOLD_AT = null; } catch (e) {}
        const a = window.__fsApi;
        if (a) { if (a.r) Element.prototype.requestFullscreen = a.r; if (a.w) Element.prototype.webkitRequestFullscreen = a.w; }
        delete window.__fsApi;
        VIDEOS_LIST = window.__seedVid || null; VID.q = ''; VID.at = ''; vidPaint_();
      } },

    /* ---------- THE FILMS IN THE VIDEOS CARD — THE ADMIN'S, AND NOBODY ELSE'S ------------------------
       *"Let admin be able to search up films which are in the notflix folder on gdrive."* Two states for
       one card, `only:` each way round, because what the card holds is the PAYLOAD's decision: the
       admin is served the fixture's three invented films and a sync stamp, and the signed-out visitor
       what `doGet` sends a stranger — no film and no stamp (`FIXTURE_ANON` in ui.js). The admin's card
       carries a row nobody else's has — the silver Sync from Drive tile and the line beside it — and a
       film not in the Drive yet, dimmed; both are new widths to fit at 320. Since note 321 both are a
       SEARCH ("film"), because an idle card shows neither. */
    { name: 'the films in the videos card, an admin’s',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        VID.q = 'film'; VID.at = '';
        vidPaint_();
        goPage('games', n, true);
      },
      expect: () => !!document.querySelector('#s-games .vid-admin .tile.is-admin[data-do="vid-sync"]')
                 && !!document.querySelector('#s-games .vid-admin .vid-synced')
                 && document.querySelectorAll('#s-games .vid-results .vid-row').length >= 3
                 && !!document.querySelector('#s-games .vid-results .vid-row.is-off'),
      wants: 'the films "film" finds, the one not in the Drive yet dimmed, and the silver Sync from Drive tile and when it last ran under them',
      leave: () => { VID.q = ''; VID.at = ''; vidPaint_(); } },
    { name: 'the videos card, nobody’s films',
      only: () => !(typeof isAdmin === 'function' && isAdmin()),
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        VID.q = 'film'; VID.at = '';
        vidPaint_();
        goPage('games', n, true);
      },
      expect: () => !document.querySelector('#s-games .vid-admin *')
                 && !document.querySelector('#s-games [data-do="vid-sync"]')
                 && !!document.querySelector('#s-games .vid-results .vid-none')
                 && !/film|drive|sync/i.test((document.querySelector('#s-games .vid-box') || {}).textContent || 'film'),
      wants: 'a search for "film" answered without a film, no Sync tile, nothing in the admin row, and no word on the card that says films exist',
      leave: () => { VID.q = ''; VID.at = ''; vidPaint_(); } },

    /* ---------- AND WHILE ITS LIST IS ON ITS WAY: THE BAR, AND THE ONE LOADER WHERE THE RESULTS GO --------
       One of three widgets held on a real request — see `the business records still coming` for the
       whole note. `data/videos.json` is asked for by the card's own `initVideos` and its answer kept
       back; here the payload is in, so an admin's card already has its films and is not waiting, and
       this is the stranger's.
       THE BAR IS NOT VEILED (note 321): it is the first thing on the card and it can be typed into
       before the list lands. A word is typed here, so the one loader stands where the results will be
       — and the state releases into three real rows the word finds. A list's length is not known until
       it lands, so the card GROWS by the rows (`grows`, read by `check/ui.js`): what is asked is that
       the loader's room was not more than came, and that the three rows arrive. */
    { name: 'the videos still coming',
      only: () => !(typeof isAdmin === 'function' && isAdmin()),
      grows: 'the results — how many rows are coming is not known until they come (see `vidPaint_`)',
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
        VIDEOS_LIST = null; VIDEOS_ASKED = null; VID.q = 'held'; VID.at = '';
        goPage('games', n, true);
        initVideos();
      },
      expect: () => {
        const box = document.querySelector('#s-games #wgt-videos .vid-box');
        return !!box && !box.getAttribute('aria-busy') && !!box.querySelector('.vid-results > .loading')
          && document.querySelectorAll('#s-games #wgt-videos .loading').length === 1 && !!box.querySelector('input.vid-q');
      },
      wants: 'the bar, usable, and the one loader where the results will be while data/videos.json is held',
      release: () => { const h = window.__vidHeld; if (h) { window.fetch = h.fetch; if (h.go) { h.go(); h.go = null; } } },
      landed: () => {
        const box = document.querySelector('#s-games #wgt-videos .vid-box');
        return !!box && !box.querySelector('.loading')
          && box.querySelectorAll('.vid-results .vid-row').length === 3;
      },
      /* THE LIST IT HELD IS PUT BACK WHETHER OR NOT IT WAS RELEASED: released, `VIDEOS_LIST` is the three
         rows above, and the next state would be measuring a card with videos the repository never had. */
      leave: () => {
        const h = window.__vidHeld;
        if (h) { window.fetch = h.fetch; VIDEOS_LIST = h.list; VIDEOS_ASKED = null; }
        delete window.__vidHeld;
        VID.q = ''; VID.at = '';
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
       One of three widgets held on a real request — see `the business records still coming` (biz)
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
                        by: [{ name: 'Ada Tutor', emoji: '👍' }, { name: 'Priya', emoji: '👍' },
                             { name: 'Carl Everyteacher-Longername', emoji: '👍' },
                             { name: 'Evie', emoji: '❤️' }] };
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
                             { name: 'Priya', emoji: '😂' }] };
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
                        /* THE LONG NAME IS A TUTOR'S: a parent reaches anybody else as her first name, as
                           a child does (docs/history/333, 342), so a long whole name is only ever a tutor's. */
                        by: [{ name: 'Ada Tutor', emoji: '👍' }, { name: 'Priya', emoji: '😂' },
                             { name: 'Evie', emoji: '😂' },
                             { name: 'Carl Everyteacher-Longername', emoji: '❤️' }]
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
    /* ---------- A TAP ON A FACE, AND THE CARD IT IS ON DOES NOT MOVE ---------------------------------
       THE OWNER, 10 Oct: *"The post section is a bit buggy. When I click a reaction it bugs out a bit.
       On only some of them."* Every state above draws the row and looks at it; none of them pressed it,
       so none could see what a press did to the card around it. A face called `repaint()`, which
       rebuilt the whole column — so the post's picture was a new `<img>` with no pixels and no size,
       held at the 4:5 stand-in until it was read again (`.page .post-pic { aspect-ratio: auto 4 / 5 }`),
       and the card changed height and zoom under the finger, then changed back (docs/history/335).
       THIS LAB STANDS IN FOR THE PHONE THAT CANNOT HAND THE PICTURE STRAIGHT BACK: `page.route` turns
       the browser's cache off, so a rebuilt picture is fetched again here every time.

       A SINGLE SQUARE PHOTOGRAPH, because that is a post the fault reached and the fixture's PO1 is a
       grid, whose cells are fixed squares and only blinked. Square is not 4:5, so a rebuilt picture
       is a taller card for as long as it waits. Signed in only: signed out, a face goes to sign in.

       WHAT IS HELD, from the frame before the tap, in the tap's own task and on every frame for half a
       second after it: the same `<article>`, the same pane, the same `<img>`, and the card's height,
       zoom and top and the picture's height to within a pixel. Measured inside the page because the
       fault lasts a few frames and `check/ui.js` looks once; the result is read by `expect`, and `why`
       says what moved. A TOKEN, so a `leave` that comes first (cascade.js does not wait for `expect`)
       stops the tap rather than letting it land on the post `leave` just put back. */
    { name: 'reactions a tap keeps the card',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (!p) throw new Error('the fixture has no PO1 to press a face on');
        window.__RX_HELD = JSON.stringify(p.reactions);
        window.__RX_MEDIA = JSON.stringify({ image: p.image, media: p.media });
        p.image = 'data/reels/archetest.jpg'; p.media = ['data/reels/archetest.jpg'];
        p.reactions = { emoji: ['👍', '❤️', '😂', '😮', '👏', '🎉'], counts: [3, 1, 0, 0, 0, 0],
                        total: 4, yours: '', by: [{ name: 'Ada Tutor', emoji: '👍' }] };
        repaint(true);
        goPage('feed', feedCamAt_() + 1 + feedPosts().findIndex(x => x.id === 'PO1'), true);
        const me = { done: false, seen: [], tapped: false };
        window.__RX_TAP = me;
        const card = () => document.querySelector('#s-feed [data-post="PO1"]');
        const look = () => {
          const c = card(), img = c && c.querySelector('img.post-pic');
          return { c, pane: c && c.closest('.pane'), img, zoom: c ? c.style.zoom || '1' : '',
                   h: c ? c.getBoundingClientRect().height : 0, top: c ? c.getBoundingClientRect().top : 0,
                   ih: img ? img.getBoundingClientRect().height : 0 };
        };
        const t0 = performance.now();
        const ready = () => {
          if (window.__RX_TAP !== me) return;
          const c = card(), img = c && c.querySelector('img.post-pic');
          if (!img || !img.complete || !img.naturalWidth) {
            if (performance.now() - t0 < 1500) { setTimeout(ready, 40); return; }
            me.seen.push('the square photograph never arrived, so nothing was pressed'); me.done = true; return;
          }
          ts = performance.now(); settle();
        };
        /* AND THE CARD STILL BEFORE THE TAP. `repaint(true)` and `goPage` above leave the column gliding
           onto its line for a few hundred milliseconds at 768 and wider — measured with the tap taken
           out, the card's top went 58 → 103.5 at 1920 with nothing pressed — and a tap in the middle
           of that would charge the glide to the tap. So five frames running with the same top and
           height first; if the column never stops within 1.2s the tap goes ahead and the top is not
           compared, rather than failing on a movement that is not the tap's. Every wait here is
           bounded to fit inside the 3s `check/ui.js` and `check/press.js` give `expect`. */
        let last = '', still = 0, ts = 0;
        const settle = () => {
          if (window.__RX_TAP !== me) return;
          const r = card() ? card().getBoundingClientRect() : { top: 0, height: 0 };
          const k = Math.round(r.top * 2) + ',' + Math.round(r.height * 2);
          still = k === last ? still + 1 : 0; last = k;
          if (still >= 5) { tap(true); return; }
          if (performance.now() - ts > 1200) { tap(false); return; }
          requestAnimationFrame(settle);
        };
        const tap = settled => {
          {
            const was = look();
            me.settled = settled;
            const face = was.c.querySelector('.react[data-emoji="😂"]');
            if (!face) { me.seen.push('no 😂 on the post to press'); me.done = true; return; }
            const say = (when, what) => { const s = when + ': ' + what; if (me.seen.indexOf(s) < 0 && me.seen.length < 12) me.seen.push(s); };
            const check = when => {
              const now = look();
              if (now.c !== was.c) say(when, 'the post is a new <article>');
              else if (now.pane !== was.pane) say(when, 'the pane is a new element');
              if (now.img !== was.img) say(when, 'the picture is a new <img>');
              if (Math.abs(now.h - was.h) > 1) say(when, `the card is ${now.h.toFixed(1)}px tall, was ${was.h.toFixed(1)}`);
              if (now.zoom !== was.zoom) say(when, `the card is drawn at zoom ${now.zoom}, was ${was.zoom}`);
              if (Math.abs(now.ih - was.ih) > 1) say(when, `the picture is ${now.ih.toFixed(1)}px tall, was ${was.ih.toFixed(1)}`);
              if (settled && Math.abs(now.top - was.top) > 1) say(when, `the card's top is at ${now.top.toFixed(1)}, was ${was.top.toFixed(1)}`);
            };
            face.click();                 // the app's own one click handler, as a finger's tap reaches it
            me.tapped = true;
            check('in the tap');
            const t1 = performance.now();
            const frame = () => {
              if (window.__RX_TAP !== me) return;
              check('a frame later');
              if (performance.now() - t1 < 500) requestAnimationFrame(frame);
              else me.done = true;
            };
            requestAnimationFrame(frame);
          }
        };
        ready();
      },
      expect: () => {
        const t = window.__RX_TAP;
        const el = document.querySelector('#s-feed [data-post="PO1"]');
        const mine = el && el.querySelector('.react.mine');
        return !!t && t.done && t.tapped && !t.seen.length && !!mine && mine.dataset.emoji === '😂';
      },
      why: () => {
        const t = window.__RX_TAP;
        return !t ? 'the tap never started' : !t.done ? 'the half second after the tap never finished'
          : t.seen.join('; ') || 'nothing moved, and 😂 is not yours';
      },
      wants: 'a tap on 😂 landing on a square photograph\'s post with the card, its pane and its picture the same elements, at the same height, zoom and top',
      leave: () => {
        window.__RX_TAP = null;
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (p && window.__RX_HELD) p.reactions = JSON.parse(window.__RX_HELD);
        if (p && window.__RX_MEDIA) Object.assign(p, JSON.parse(window.__RX_MEDIA));
        /* AND THE HOLD THE TAP TOOK IS LET GO. A press on the card in front holds its top where it is
           (`HOLD_AT`, shell.js) so a card that changes under a finger grows downward — right for a
           person, and wrong here, where the lab is swapping the post's square photograph back for
           the fixture's grid, 90px taller at 1920. Held, the grid hung 43.8px below the middle and
           the columns-in-line rule named it after every screen had been visited. Nobody is using
           the card once the state is over, which is what arriving anywhere else would say too. */
        HOLD_AT = null;
        repaint(true);
      } },
    /* ---------- A POST WITH NO DATE: THE FIRST FACE AND THE LAST TAKEN BACK, AND THE CARD DOES NOT MOVE --
       THE STATE ABOVE PRESSES A DATED POST, and the fix it holds held for every dated post and no other.
       A row typed into the posts tab by hand without a date column arrives as `at: 0, when: ''`; with no
       reactions it drew no time line, so the first face fell back to rebuilding the column (a 16:9 card
       428.5 → 689px at 390 and thrown off the glass for a frame or two) and taking the last face back
       removed the line (the card 36.6px shorter, the tile row jumping up under the thumb). The line is
       there now whenever a post has faces, empty until somebody reacts (`postWhen_`, docs/history/335).
       THE SAME SQUARE PHOTOGRAPH AND THE SAME MEASURES as the state above, over TWO taps on 👍 a quarter
       of a second apart — the first face, then the last taken back — each held against the card as it
       was before the first: the same `<article>`, pane and `<img>`, the same height, zoom and top. */
    { name: 'reactions an undated post keeps the card',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (!p) throw new Error('the fixture has no PO1 to press a face on');
        window.__RX_HELD = JSON.stringify(p.reactions);
        window.__RX_MEDIA = JSON.stringify({ image: p.image, media: p.media, at: p.at, when: p.when });
        p.image = 'data/reels/archetest.jpg'; p.media = ['data/reels/archetest.jpg'];
        p.at = 0; p.when = '';
        p.reactions = { emoji: ['👍', '❤️', '😂', '😮', '👏', '🎉'], counts: [0, 0, 0, 0, 0, 0],
                        total: 0, yours: '', by: [] };
        repaint(true);
        goPage('feed', feedCamAt_() + 1 + feedPosts().findIndex(x => x.id === 'PO1'), true);
        const me = { done: false, seen: [], taps: 0 };
        window.__RX_TAP = me;
        const card = () => document.querySelector('#s-feed [data-post="PO1"]');
        const look = () => {
          const c = card(), img = c && c.querySelector('img.post-pic');
          return { c, pane: c && c.closest('.pane'), img, zoom: c ? c.style.zoom || '1' : '',
                   h: c ? c.getBoundingClientRect().height : 0, top: c ? c.getBoundingClientRect().top : 0,
                   line: !!(c && c.querySelector('.post-when')) };
        };
        const t0 = performance.now();
        let last = '', still = 0, ts = 0;
        const ready = () => {
          if (window.__RX_TAP !== me) return;
          const img = card() && card().querySelector('img.post-pic');
          if (!img || !img.complete || !img.naturalWidth) {
            if (performance.now() - t0 < 1200) { setTimeout(ready, 40); return; }
            me.seen.push('the square photograph never arrived, so nothing was pressed'); me.done = true; return;
          }
          ts = performance.now(); settle();
        };
        /* STILL FIRST, for the reason the state above gives: `goPage` leaves the column gliding. */
        const settle = () => {
          if (window.__RX_TAP !== me) return;
          const r = card() ? card().getBoundingClientRect() : { top: 0, height: 0 };
          const k = Math.round(r.top * 2) + ',' + Math.round(r.height * 2);
          still = k === last ? still + 1 : 0; last = k;
          if (still >= 5) { run(true); return; }
          if (performance.now() - ts > 1000) { run(false); return; }
          requestAnimationFrame(settle);
        };
        const run = settled => {
          const was = look();
          if (!was.line) me.seen.push('before any face, the post has no time line — the first face has nowhere to put its total');
          const say = (when, what) => { const s = when + ': ' + what; if (me.seen.indexOf(s) < 0 && me.seen.length < 12) me.seen.push(s); };
          const check = when => {
            const now = look();
            if (now.c !== was.c) say(when, 'the post is a new <article>');
            else if (now.pane !== was.pane) say(when, 'the pane is a new element');
            if (now.img !== was.img) say(when, 'the picture is a new <img>');
            if (!now.line) say(when, 'the time line is gone');
            if (Math.abs(now.h - was.h) > 1) say(when, `the card is ${now.h.toFixed(1)}px tall, was ${was.h.toFixed(1)}`);
            if (now.zoom !== was.zoom) say(when, `the card is drawn at zoom ${now.zoom}, was ${was.zoom}`);
            if (settled && Math.abs(now.top - was.top) > 1) say(when, `the card's top is at ${now.top.toFixed(1)}, was ${was.top.toFixed(1)}`);
          };
          const press = what => {
            const f = card() && card().querySelector('.react[data-emoji="👍"]');
            if (!f) { say(what, 'there is no 👍 to press'); return; }
            f.click(); me.taps++;
            check(what);
          };
          press('the first face');
          const t1 = performance.now();
          let second = false;
          const frame = () => {
            if (window.__RX_TAP !== me) return;
            const t = performance.now() - t1;
            if (!second && t >= 250) { second = true; press('the last face taken back'); }
            else check(second ? 'a frame after the last face went' : 'a frame after the first face');
            if (t < 500) requestAnimationFrame(frame); else me.done = true;
          };
          requestAnimationFrame(frame);
        };
        ready();
      },
      expect: () => {
        const t = window.__RX_TAP;
        const el = document.querySelector('#s-feed [data-post="PO1"]');
        return !!t && t.done && t.taps === 2 && !t.seen.length && !!el && !el.querySelector('.react.mine')
          && !!el.querySelector('.post-when');
      },
      why: () => {
        const t = window.__RX_TAP;
        return !t ? 'the taps never started' : !t.done ? 'the half second of taps never finished'
          : t.seen.join('; ') || (t.taps !== 2 ? `${t.taps} taps landed, not 2` : 'a face is still yours, or the line is gone');
      },
      wants: 'the first face on an undated post and the last taken back, with the card, its pane and its picture the same elements at the same height, zoom and top, and the time line there throughout',
      leave: () => {
        window.__RX_TAP = null;
        const p = (DATA.posts || []).find(x => x.id === 'PO1');
        if (p && window.__RX_HELD) p.reactions = JSON.parse(window.__RX_HELD);
        if (p && window.__RX_MEDIA) Object.assign(p, JSON.parse(window.__RX_MEDIA));
        HOLD_AT = null;                 // the hold the taps took — see the state above
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

    /* ---------- A ROOM CHOSEN, AND THE ROW SAYING WHICH ------------------------------------------------
       *"colliers would library has 3 rooms within it"* — the owner, 10 Oct (docs/history/336). Once a
       venue has rooms the Venue row's answers are one string until the last word, and a select cannot
       wrap: review chose each of the fixture's three rooms at 390 and every one read "Colliers …", on the
       form and in the picture the Share tile makes. The row draws its answer as words now (`wrap` on the
       `loc` step, `stepSelect_`), with the select laid over them.

       THE LARGE ROOM, CHOSEN THROUGH THE SELECT'S OWN `change`, because it is the one whose words differ
       from a small room's only at the end. What arrives is asked in the real cascade, at every width:
       the words on the row are the chosen option's whole text and none of them is cut off, and the
       select still covers them — so the words are the answer and a tap on them is a tap on the control.
       `check/share.js` takes this state's `enter` for its picture of the form with a room on it. */
    { name: 'a room chosen, named whole on its row',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const sel = document.querySelector('#bookr select.bk-sel[data-step="loc"]');
        if (!sel) throw new Error('the booking form draws no Venue select');
        const rooms = [...sel.options].filter(o => / — /.test(o.value));
        const to = rooms.find(o => /large/i.test(o.value)) || rooms[rooms.length - 1];
        if (!to) throw new Error('the fixture offers no room on the Venue row — check/fixture.json lost its rooms');
        window.STATE_ROOM = to.value;
        sel.value = to.value;
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      },
      expect: () => {
        const want = window.STATE_ROOM;
        const sel = document.querySelector('#bookr select.bk-sel[data-step="loc"]');
        const face = sel && sel.closest('.bk-face');
        const said = face && face.querySelector('.bk-said');
        if (!want || !sel || sel.value !== want || BOOKING.loc !== want || !said) return 0;
        const o = sel.options[sel.selectedIndex];
        const a = said.getBoundingClientRect(), b = sel.getBoundingClientRect();
        return said.textContent === (o && o.text) && said.textContent.indexOf(want) === 0
          && said.scrollWidth <= said.clientWidth + 1
          && Math.abs(a.top - b.top) <= 1 && Math.abs(a.bottom - b.bottom) <= 1
          && Math.abs(a.left - b.left) <= 1 && Math.abs(a.right - b.right) <= 1 ? 1 : 0;
      },
      wants: 'the Venue row naming the whole room chosen, uncut, with its select laid over the words',
      leave: () => { delete window.STATE_ROOM;
        if (typeof resetBooking_ === 'function') resetBooking_(); drawBooker(); } },
    /* ---------- A TUTOR CHOSEN: THE WEEK IS THE DAYS THEY WORK — see `days` in `slotGrid` ---------------
       THE OWNER, 10 Oct: *"availability of tutors should just show the days they have an availibility
       up. no need to display monday if they dont have any hours on monday."* The form the lab has
       always measured names nobody, so it draws seven days — and the week with a tutor named is a
       different HEIGHT of card, three rows shorter here, which nothing measured. The fixture's Ada
       ticks Monday, Tuesday, Wednesday and Saturday (Monday 17 already taught), so those four and no
       other — and no `Thursday —` put back by the spine, which is the second half of the change. Two
       hours ticked on her Tuesday, so a lit run is on the card the lab looks at. */
    { name: 'a tutor chosen, and only their days',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        if (!(DATA.tutors || []).some(t => t.title === 'Ada Tutor')) throw new Error('the fixture has no Ada Tutor to choose');
        BOOKING.tutor = 'Ada Tutor';
        BOOKING.slots = ['tu10', 'tu11'];
        drawBooker();
      },
      expect: () => {
        const rows = [...document.querySelectorAll('#s-booking #bookr .bk-row.bk-wk')];
        const days = rows.map(r => ((r.querySelector('.bk-k') || {}).textContent || '').trim()).join(' ');
        const dash = [...document.querySelectorAll('#s-booking #bookr .bk-row.is-blank .bk-k')]
          .some(k => SLOT_DAYS.some(d => d[1] === k.textContent.trim()));
        return days === 'Monday Tuesday Wednesday Saturday' && !dash
          && document.querySelectorAll('#s-booking #bookr [data-do="book-slot"].on').length === 2 ? 1 : 0;
      },
      wants: 'Ada\'s four days (Mon, Tue, Wed, Sat) and no other, with her Tuesday 10 and 11 ticked',
      leave: () => { if (typeof resetBooking_ === 'function') resetBooking_(); drawBooker(); } },

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
             DERIVED FROM IT (since 342, every job the viewer is ON, or every job for an admin — this
             viewer is on it), and this state seeded none — so `Accepted` and `Paid` could tick with
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
