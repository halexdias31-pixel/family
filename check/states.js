/* @family. — check/states.js THE STATES A SCREEN CAN BE IN, DECLARED ONCE AND READ BY BOTH INSTRUMENTS. § */

/* A SCREEN IS NOT ONE PICTURE, AND THIS FILE HAD ONLY EVER TAKEN ONE OF EACH. § */
const STATES = {
  stuff: [
    { name: 'the question' },
    /* A WORD THAT IS IN THOUSANDS OF QUESTIONS, so the results are real cards rather than a lucky one. § */
    /* ---------- AND THE SECONDS BEFORE THE LIBRARY LANDS § */
    { name: 'the library still coming',
      enter: () => {
        /* EVERY LIST, NOT JUST THE QUESTIONS. § */
        window.__LIB_HELD = { rows: LIBRARY_ROWS, data: {} };
        Object.keys(DATA).forEach(k => {
          if (Array.isArray(DATA[k])) { window.__LIB_HELD.data[k] = DATA[k]; DATA[k] = []; }
        });
        LIBRARY_ROWS = null;
        /* EVERY MEMO, AND `DATA` IS WHAT THEY ARE KEYED ON. § */
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
      /* THE ONE LOADER NOW, NOT A SENTENCE OF ITS OWN — the owner, 9 Oct: § */
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
    /* ---------- AND THE FUNNEL SEVERAL ANSWERS DEEP § */
    { name: 'six answers in',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'forLabel', value: 'Learning' },
                         { field: 'kindLabel', value: 'Questions' },
                         { field: 'subject', value: 'Maths' },
                         { field: 'documentType', value: 'Worksheet' },
                         /* `Level · SATs` AND THEN `Key stage · KS2`. § */
                         { field: 'level', value: 'SATs' },
                         { field: 'keystage', value: 'KS2' },
                         { field: 'yearGroup', any: true }];
        paintStuff();
        goPage('stuff', 0, true);
      },
      /* ---------- AND THE CHIPS SAY ONLY WHAT WAS CHOSEN, WITH CLEAR BESIDE THE BOX § */
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
    /* ---------- THE SITTING, ASKED AS THE YEAR AND THEN THE MONTH § */
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
    /* ---------- THE PAPER FOLDER WITH THE YEAR SKIPPED § */
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
        /* THE SHORTEST NAME EACH PAPER HAS THAT NO OTHER ANSWER SHARES (`shortLabels_`, 396): its number, and its date where two sittings share it. */
        const said = rows.map(txt);
        return new Set(said).size === said.length && said.every(t => /^Paper \d+/.test(t));
      },
      wants: 'the Paper question, each answer its number (and its date where two share it), no two alike' },
    /* ---------- A PAPER CHOSEN, AND THE ONE RULE ASKS ITS QUESTION NEXT (396) § */
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
      /* AND THE CARD'S SITTING IS TWO TAGS, `2017` THEN `June` — *"Fix this why it say June and year in same chip"* was a screenshot of one purple `June 2024` pill on § */
      expect: () => {
        const rows = [...document.querySelectorAll('#stuff-groups .answers > .row[data-do="facet-pick"]')];
        const groups = document.querySelector('#stuff-groups');
        const card = document.querySelector('#s-stuff .page.on .qcard') || document.querySelector('#s-stuff .qcard');
        const sit = card ? [...card.querySelectorAll('.qtag[data-tag="sitting"]')].map(t => t.textContent.trim()) : [];
        return !!groups && rows.length >= 2 && rows.every(r => r.dataset.field === 'qNumber')
               && !!card && sit.join('|') === '2017|June';
      },
      wants: 'the Question question after Paper, Q1 onwards, with the paper\'s first question on the page after it, its sitting tagged 2017 then June',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A LONG LIST, DRAWN WHOLE § */
    { name: 'a long list, drawn whole',
      enter: () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: 'Questions' },
                         { field: 'subject', value: 'Maths' },
                         { field: 'documentType', value: 'Worksheet' },
                         { field: 'keystage', value: 'KS2' },
                         { field: 'yearGroup', value: 'Year 5' },
                         /* SATs, since 396 asks Level here (a Year 5 sheet filed GCSE makes two answers); then Paper, 13 sheets. */
                         { field: 'level', value: 'SATs' }];
        paintStuff(); goPage('stuff', 0, true);
      },
      expect: () => {
        const rows = [...document.querySelectorAll('#stuff-groups .answers > .row[data-do="facet-pick"]')];
        return rows.length >= 10;
      },
      wants: 'ten or more answer chips on one question, none of them a range',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A BUNDLE OF PAPERS, WHICH ONLY A NARROWED LIST OFFERS § */
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
    /* ---------- AND THE DOCUMENT BEHIND THE TILE § */
    { name: 'a practical guide',
      enter: () => {
        const x = stuffItemsAll_().find(it => it.kind === 'practical' && !it.row.excluded);
        if (!x) throw new Error('no practical in the list to draw a card for');
        /* THE FUNNEL'S OWN ANSWER, not a hand on the list. `kindLabel` is what the `What kind`
           question writes, so this is the chip a thumb would have set. */
        STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label }];
        paintStuff();
        /* ONTO THE WORKSHEET, which is the fourth page of the first practical now — "split into widgets. diagram, equipment, steps, worksheet bit." § */
        const at = typeof stuffPages_ === 'function'
          ? Math.max(0, stuffPages_().findIndex(pg => pg.part === 'work')) : 0;
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + at);
      },
      /* THE NUMBER IS ASSERTED RATHER THAN DESCRIBED — `>= 3` would pass on a guide that had quietly grown a fourth question nobody decided on, and this state is the § */
      expect: () => {
        /* ONE CARD, NOT THE SCREEN. § */
        /* FOUR CARDS, EACH ASKED ABOUT ITS OWN JOB. § */
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
    /* ---------- A PROJECT, ON ITS LAST PAGE § */
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
    /* ---------- A COURSEWORK, ON ITS STAGES PAGE § */
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
        const flags = [...document.querySelectorAll('#s-stuff .card.proj:not(.prac-part) .qtag[data-f="projectType"]')].map(f => f.textContent.trim());
        return !!main && !!steps
               && flags.length > 0 && flags.every(f => f === 'Coursework')
               && ((steps.querySelector('h3') || {}).textContent || '') === 'Stages'
               && !!steps.querySelector('.prac-steps ol > li');
      },
      wants: 'a coursework on its Stages page — the card flagged Coursework with its board, and the stages numbered',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A QUESTION ANSWERED BY DRAWING, DRAWN ON ITS OWN FIGURE IN ITS CARD (docs/history/356) § */
    { name: 'a question drawn on the paper\'s own figure, the grid under the pen in its card',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-1F-7');
        if (!it) throw new Error('Q-1MA1-2406-1F-7 is not in the library');
        if (!padSource_(it) || padSource_(it).from !== 'part') throw new Error('Q-1MA1-2406-1F-7 is not drawn on its own figure any more');
        window.__faceItem = it;
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
      },
      expect: () => {
        const it = window.__faceItem;
        const pad = it && [...document.querySelectorAll('#s-stuff .page.on .qcard .qsheet .qpad')].find(p => p.getAttribute('data-k') === padKey_(it));
        if (!pad) return false;
        const page = pad.closest('.page'), pane = pad.closest('.pane');
        const art = pad.querySelector('.qpad-art > svg:first-child');
        const side = e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); };
        const taps = [...pad.querySelectorAll('.qpad-bar [data-do]')];
        return !page.querySelector('.qp-ans, .q-drawt') && !/on the next page/i.test(page.textContent)
               && !pad.classList.contains('is-drawing') && !pad.querySelector('.qpad-lock') && !!pad.querySelector('.qpad-undo')
               && !!pad.querySelector('.qpad-clear') && !!art && !art.classList.contains('qsurf')
               && taps.length >= 3 && taps.every(e => side(e) >= 43.5)
               && [...pane.children].every(k => !k.style.zoom)
               && art.getBoundingClientRect().width >= Math.min(FIG_FLOOR, art.parentElement.getBoundingClientRect().width) - 0.5
               && !/redrawn|not the paper.s own|drawn (by|for) @family|your marks from|yours from/i.test(pad.textContent);
      },
      wants: 'June 2024 1F Q7 as one card: its ask and its own grid under the pen and ready for the first touch (no lock, 368), its tools, Undo and Clear at 44px, no box, no Draw tile, no "on the next page", nothing drawn smaller whole, the grid no narrower than its floor',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A STEM'S MAP UNDER A PART'S OWN PEN, AND ITS BOX AT THE FOOT § */
    { name: 'a stem\'s map under a part\'s own pen, with its box at the foot',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1CM-bearings-2');
        if (!it) throw new Error('Q-1CM-bearings-2 is not in the library');
        window.__faceItem = it;
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
      },
      expect: () => {
        const it = window.__faceItem;
        const pad = it && [...document.querySelectorAll('#s-stuff .page.on .qcard .qsheet .qpad')].find(p => p.getAttribute('data-k') === padKey_(it));
        const card = pad && pad.closest('.qcard');
        const box = card && card.querySelector('.qp-ans .kp-in');
        return !!pad && !!box && !!(pad.compareDocumentPosition(box) & 4) && !card.parentElement.querySelector('.q-drawt');
      },
      wants: 'the stem\'s map under the part\'s pen in its card, and the box under it at the foot',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- THE TALLEST FIGURE UNDER A PEN, AT 320 TOO § */
    { name: 'the tallest figure under a pen, its tiles a fingertip and never under its floor',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1CM-transformations-of-graphs-8');
        if (!it) throw new Error('Q-1CM-transformations-of-graphs-8 is not in the library');
        window.__faceItem = it;
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
      },
      expect: () => {
        const it = window.__faceItem;
        const pad = it && [...document.querySelectorAll('#s-stuff .page.on .qcard .qpad')].find(p => p.getAttribute('data-k') === padKey_(it));
        if (!pad) return false;
        const pane = pad.closest('.pane');
        const art = pad.querySelector('.qpad-art > svg:first-child');
        const side = e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); };
        const words = [...pad.closest('.qcard').querySelectorAll('[data-face-zoom]')];
        const gave = words.length && words.every(e => Math.abs(parseFloat(e.style.zoom || '1') - PANE_ZOOM_MIN) < 0.001);
        return [...pad.querySelectorAll('.qpad-bar [data-do]')].every(e => side(e) >= 43.5)
               && [...pane.children].every(k => !k.style.zoom)
               && art.getBoundingClientRect().width >= FIG_FLOOR - 0.5
               && (!art.style.width || !!gave);
      },
      wants: 'the four sine grids under the pen, its tiles at 44px, nothing drawn smaller whole, the figure no narrower than the floor and narrowed only once the words have given way',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A MULTIPLE-CHOICE QUESTION, ANSWERED BY TAPPING § */
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
    /* ---------- A MULTI-PART QUESTION WITH A DIAGRAM, IN THE PAPER'S ORDER § */
    { name: 'a multi-part question\'s stem, on its own page in front of its parts',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-9MA031-2206-5a');
        if (!it) throw new Error('Q-9MA031-2206-5a is not in the library');
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it, 'stem0'));
      },
      /* THE ITEM'S OWN TAGS, the same on its opening as on its card (`tagRow_`, 355): § */
      expect: () => {
        const c = document.querySelector('#s-stuff .page.on .qcard.qstem');
        const tag = f => [...(c ? c.querySelectorAll('.qcard-tags [data-f="' + f + '"]') : [])].map(t => t.textContent.trim()).join(' ');
        return !!c && tag('kindLabel') === 'Questions' && tag('qNumber') === 'Q5' && tag('qPart') === 'a' && !tag('qPage')
               && !!c.querySelector('.qsheet-stem') && !c.querySelector('.qp-ans')
               && !!c.querySelector('.qsheet-more');
      },
      wants: 'the stem of Q5 on its own page, tagged Questions, Q5 and a (its part\'s row), no page number, no box and no picture, saying what is next',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A MADE-UP SURFACE AND A BOX: THE HEXAGON (docs/history/356) § */
    { name: 'a question answered on a surface and in a box: its blank space under the pen and the box below',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-CBM-2d-shapes-2');
        if (!it) throw new Error('Q-CBM-2d-shapes-2 is not in the library');
        window.__faceItem = it;
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        const card = a && a.closest('.qcard');
        const box = card && card.querySelector('.qp-ans .kp-in');
        return !!a && !!a.querySelector('.qpad .qpad-art > svg.qsurf.is-blank') && !!box && !!(a.compareDocumentPosition(box) & 4)
               && !card.parentElement.querySelector('.q-drawt');
      },
      wants: 'the hexagon\'s blank space under the pen and its box below it, on one card, no Draw tile',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- A MADE-UP SURFACE AND NOTHING ELSE § */
    { name: 'a question answered on a made-up surface alone, the surface under the pen where the box would be',
      enter: () => {
        const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q-1MA1-2406-1F-11c');
        if (!it) throw new Error('Q-1MA1-2406-1F-11c is not in the library');
        window.__faceItem = it;
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
      },
      expect: () => {
        const it = window.__faceItem;
        const a = it && [...document.querySelectorAll('#s-stuff .page.on .qp-area')].find(e => e.getAttribute('data-q') === it.key);
        const art = a && a.querySelector('.qpad-art > svg.qsurf');
        const ink = a && a.querySelector('.qpad-ink');
        if (!art || !ink) return false;
        const r = art.getBoundingClientRect(), k = ink.getBoundingClientRect();
        return !a.closest('.qcard').querySelector('.qp-ans') && Math.abs(r.width - k.width) <= 1 && Math.abs(r.height - k.height) <= 1;
      },
      wants: 'a made-up surface under the pen where the box would be, the ink exactly its size, and no box',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- "USE YOUR GRAPH", WITH THE GRAPH IN FRONT OF ITS WORDS, IN ITS CARD § */
    { name: '"use your graph", with the graph drawn on (b) in front of its words',
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
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(c));
      },
      expect: () => {
        const s = document.querySelector('#s-stuff .page.on .qcard .qsheet .qseen');
        const art = s && s.querySelector('.qpad-art > svg:first-child');
        const ink = s && s.querySelector('.qpad-ink');
        if (!art || !ink) return false;
        const a = art.getBoundingClientRect(), k = ink.getBoundingClientRect();
        return s.querySelectorAll('.qpad-was path').length === 1 && !s.querySelector('.qpad, .tile, .qp-ans')
               && Math.abs(a.width - k.width) <= 1 && Math.abs(a.height - k.height) <= 1
               && !/redrawn|not the paper.s own|drawn (by|for) @family|your marks from|yours from/i.test(s.closest('.qcard').textContent);
      },
      wants: '(b)\'s grid with the curve drawn on it, read only, in (c)\'s card in front of "Use your graph", the ink exactly the grid\'s size, with no line about whose marks they are',
      leave: () => {
        try { localStorage.removeItem(window.__useKey); } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- AND ITS FIGURE TILE, WITH THE SAME GRAPH ON IT § */
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
               && !/redrawn|not the paper.s own|drawn (by|for) @family|your marks from|yours from/i.test(s.textContent)
               && Math.abs(a.width - k.width) <= 1 && Math.abs(a.height - k.height) <= 1;
      },
      wants: 'the sheet showing (b)\'s grid with the curve on it, read only, the ink exactly the grid\'s size, with no line about whose marks they are',
      leave: () => {
        try { localStorage.removeItem(window.__useKey); } catch (e) {}
        closeSheet();
      } },
    /* ---------- A CONSTRUCTION, WITH A RULER'S LINE AND A COMPASS'S RING ON IT § */
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
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
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
        const pad = [...document.querySelectorAll('#s-stuff .page.on .qcard .qpad')].find(p => p.getAttribute('data-k') === window.__toolKey);
        const lit = pad && [...pad.querySelectorAll('.qpad-tool.on')].map(b => b.getAttribute('data-tool')).join(' ');
        return !!pad && pad.classList.contains('is-drawing') && lit === 'compass'
               && !!pad.querySelector('.qpad-tool[data-tool="ruler"]') && !pad.querySelector('.qpad-lock')
               && pad.querySelectorAll('.qpad-g path').length === 2;
      },
      wants: 'Q4\'s figure under the pen on its card, holding the pen, with Pen, Ruler and Compass in its bar, the Compass lit, and a ruler\'s line and a compass\'s ring on it',
      leave: () => {
        try { localStorage.removeItem(window.__toolKey); } catch (e) {}
        PAD_ON = ''; PAD_TOOL.delete(window.__toolKey);
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- A PASSAGE WITH TWO WORDS RINGED § */
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
    /* ---------- A PART TOO LONG FOR ONE PAGE, CUT BETWEEN PARAGRAPHS § */
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
               && ((c.querySelector('.qcard-tags [data-f="qPage"]') || {}).textContent || '') === 'Page 1'
               && /^\d+ pages$/.test((c.querySelector('.qcard-tags [data-f="qPages"]') || {}).textContent || '');
      },
      wants: 'the first page of a long part: its reading, no box, tagged [Page 1] [N pages], saying it continues',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- HOW YOUR LAST ANSWER WENT, BESIDE THE STAR § */
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
        /* THE BOX HOLDS WHAT WAS SENT, so its own line says the verdict (368: no slot beside the star) */
        window.__subAns = ansKey_(it); try { ansStore_(window.__subAns, '7'); } catch (e) {}
        try { localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it));
      },
      expect: () => {
        const s = document.querySelector('#s-stuff .page.on .qp-mark > .qp-verdict');
        return !!s && s.textContent === 'Correct' && s.closest('.qp-mark').classList.contains('is-right')
               && !/\d{1,2} [A-Z][a-z]{2}|Done/.test(s.textContent)
               && !document.querySelector('#s-stuff .page.on .qcard-verdict, .qcard-done');
      },
      wants: 'the box\'s own line saying "Correct", with its tick, and no slot beside the star — and no day anywhere',
      leave: () => {
        try {
          const all = JSON.parse(localStorage.getItem('subLast:' + window.__subWho) || '{}') || {};
          delete all[window.__subKey];
          localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all));
          if (window.__subAns) ansStore_(window.__subAns, '');
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
        /* THE BOX HOLDS WHAT WAS SENT, so its own line says the verdict (368: no slot beside the star) */
        window.__subAns = ansKey_(it); try { ansStore_(window.__subAns, '8'); } catch (e) {}
        try { localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it));
      },
      expect: () => {
        const s = document.querySelector('#s-stuff .page.on .qp-mark > .qp-verdict');
        return !!s && /^Not yet/.test(s.textContent) && s.closest('.qp-mark').classList.contains('is-near')
               && !/\d{1,2} [A-Z][a-z]{2}|Done/.test(s.textContent)
               && !document.querySelector('#s-stuff .page.on .qcard-verdict, .qcard-done');
      },
      wants: 'the box\'s own line saying "Not yet", with the turning arrow, and no slot beside the star — and no day anywhere',
      leave: () => {
        try {
          const all = JSON.parse(localStorage.getItem('subLast:' + window.__subWho) || '{}') || {};
          delete all[window.__subKey];
          localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all));
          if (window.__subAns) ansStore_(window.__subAns, '');
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
        /* THE BOX HOLDS WHAT WAS SENT, so its own line says the verdict (368: no slot beside the star) */
        window.__subAns = ansKey_(it); try { ansStore_(window.__subAns, 'because it is'); } catch (e) {}
        try { localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all)); } catch (e) {}
        const facet = FACETS.find(f => f.field === 'paperId');
        STUFF.filters = [{ field: 'paperId', value: facet.of(it) }];
        paintStuff();
        goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it));
      },
      expect: () => {
        const s = document.querySelector('#s-stuff .page.on .qp-mark > .qp-verdict');
        return !!s && /^Sent/.test(s.textContent) && !s.closest('.qp-mark').classList.contains('is-right') && !s.closest('.qp-mark').classList.contains('is-near')
               && !/\d{1,2} [A-Z][a-z]{2}|Done/.test(s.textContent)
               && !document.querySelector('#s-stuff .page.on .qcard-verdict, .qcard-done');
      },
      wants: 'the box\'s own line saying "Sent", no tick and no arrow, and no slot beside the star — and no day anywhere',
      leave: () => {
        try {
          const all = JSON.parse(localStorage.getItem('subLast:' + window.__subWho) || '{}') || {};
          delete all[window.__subKey];
          localStorage.setItem('subLast:' + window.__subWho, JSON.stringify(all));
          if (window.__subAns) ansStore_(window.__subAns, '');
        } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- A KS2 SATs QUESTION: `SATs` AND `KS2`, TWO TAGS, AND WHAT TO BRING AS ITS OWN § */
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
        return tags[0] === 'kind:Learning' && tags[1] === 'kind:Questions' && tags.indexOf('paper:Q1') >= 0 && tags.indexOf('board:STA') >= 0 && tags.indexOf('level:SATs') >= 0
               && tags.indexOf('level:KS2') === tags.indexOf('level:SATs') + 1
               && !tags.some(t => /KS\s*\d\s*SATs/i.test(t)) && tags.indexOf('needs:Ruler') >= 0
               && !document.querySelector('#s-stuff .page.on .qcard-needs, #s-stuff .page.on .qcard-top');
      },
      wants: 'a KS2 SATs question tagged Learning and Questions first, then SATs and KS2 side by side, its board STA, Q1, its mark and Ruler as what to bring -- no header line, no needs line',
      leave: () => { STUFF.filters = []; paintStuff(); goPage('stuff', 0); } },
    /* ---------- THE ANSWER PAGE: HIDDEN, TURNED TO, AND SHOWN § */
    /* THE RESULT EXPECTED IS THE ONE THE APP SAYS, not a word copied in here. § */
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
    /* ---------- SWIPED TO, NOT TURNED TO BY A TILE § */
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
    /* ---------- QUESTIONS CHOSEN: THE PAGE AFTER A QUESTION IS THE NEXT QUESTION § */
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
    /* ---------- WHAT KIND: QUESTIONS FIRST § */
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
    /* ---------- AND HIDDEN AGAIN, WITH THE TILE WHERE THE THUMB LEFT IT § */
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
    /* ---------- MARKED, AND NOTHING MOVED § */
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
        /* THE ANSWER PAGE STAYS SHUT -- asked of `ansOpen_`, the one rule the page is drawn by, because the page may not be built yet and is not the one on screen. § */
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
    /* ---------- AN ORDERING, HALF PLACED, AND THEN SENT RIGHT § */
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
          /* WRONG FIRST: the row reversed, its long verdict beside the two tiles. § */
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
    /* ---------- AN ORDERING OF POWERS: A POWER IS RAISED IN THE ROW AS IT IS IN THE QUESTION § */
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
        return !!s && !!box && box.classList.contains('is-miss')
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
    /* ---------- THE MATHS KEYPAD, UP, WITH A FRACTION HALF BUILT § */
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
        /* ASKED AGAIN UNTIL THE CARD IS THERE, rather than once at a guessed delay: § */
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
    /* ---------- THE KEYPAD UP ON A PART WITH A FIGURE BEHIND IT: THE FIGURE TILE STAYS ABOVE THE PAD § */
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
        /* AFTER THE COLUMN HAS STOPPED, as a finger would: § */
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
    /* ---------- THE ANSWER BOX AT REST: A PAPER FIELD SAYING WHAT IT IS FOR, AND SEND § */
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
               && !!card.querySelector('.qp-bar > .tile.qp-check:not(.is-send)[data-do="qp-check"]')
               && !!card.querySelector('.qp-mark.qp-compose > .qp-verdict');
      },
      wants: 'Q0664\'s box empty and at rest: the field the paper colour, "Type your answer" in it, and the gold Send tile beside it',
      leave: () => {
        try { localStorage.removeItem(window.__restK); } catch (e) {}
        STUFF.filters = []; paintStuff(); goPage('stuff', 0);
      } },
    /* ---------- THE KEYPAD UP, IN ITS SUNLIGHT COLOURS § */
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
    /* ---------- A REPAINT WITH THE KEYPAD UP § */
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
    /* ---------- AND A WORDED ANSWER, WITH "MARK WITH AI" BESIDE IT § */
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
        /* SIGNED IN, IT IS MARKED — by a stand-in for `api` that answers the way `aiMark` does, so the picture is of the verdict and the sentence as they are really § */
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
    /* ---------- A WORDED ANSWER, THE PAD UP ON ITS LETTERS § */
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
    /* ---------- AN ESSAY, WRITTEN ON ITS SHEET IN PARAGRAPHS, THE PAD UP § */
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
    /* ---------- WHERE A TYPED ANSWER IS KEPT, SAID UNDER THE BOX § */
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
        return !!inp && inp.value === '4.6' && !!line && line.textContent === '' && /^Saved to .+account$/.test(ansSavedWords_(window.__svKey));  // saved, and silent about it (368)
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
    /* ---------- THE FILMS, WHICH ONLY ONE VISITOR IS SENT — AND WHICH FIND DOES NOT HAVE § */
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
    /* ---------- THE TWO WAYS THE FUNNEL ENDS WITHOUT A QUESTION § */
    { name: 'a search that matches nothing',
      enter: () => { STUFF.filters = []; STUFF.q = 'zqxjv nothing is called this'; paintStuff(); goPage('stuff', 0, true); },
      expect: () => /Nothing matches/.test((document.querySelector('#stuff-groups .empty') || {}).textContent || ''),
      wants: 'the funnel saying Nothing matches',
      leave: () => { STUFF.q = ''; paintStuff(); goPage('stuff', 0); } },
    /* AND A SEARCH A CHIP HIDES. § */
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
    /* ---------- "STABLE": AN ANSWER PRESSED MOVES NOTHING ABOVE IT § */
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
    /* ---------- AND A CARD'S OWN PAGES FILLING MOVE NOTHING ON IT § */
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
        /* THE CARD'S PAGE BY THE APP'S OWN `domIndex_`, NOT THE N-TH CHILD AND NOT `.page.on`: § */
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
        /* THE PAGES ARE FILLED BY `fillStuffPages`, CALLED HERE RATHER THAN WAITED FOR, AND NOTHING IN THIS STATE WAITS ON A TIMER. § */
        fillStuffPages(true);
        const a = at();
        const was = page() && page().querySelector('.card.fc .fc-head h3');
        goPage('stuff', first + STUFF_WIN + 3, true); fillStuffPages(true);
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
  /* FIND 2, RIGHT OF FIND (docs/history/329, 347) § */
  res: [
    { name: 'the question' },
    /* ---------- A CONTENT CARD, REACHED BY WHAT KIND · CONTENT AND ITS SUBJECT § */
    { name: 'a content card',
      enter: () => inFinder_(finderOf_('res'), () => {
        /* BY ITS KEY, under What kind · Content and its own subject — written out in each state because
           a state's `enter` runs in the page as its own text, where a helper here does not exist. */
        const K = 'ct:TB-GCSE-STATS-9', x = stuffItemsAll_().find(it => it.key === K);
        if (!x) throw new Error('no ' + K + ' content card in the list — data/textbooks.json did not load');
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: 'Content' }, { field: 'subject', value: x.subject }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.x && pg.x.key === K && !pg.part);
        if (at < 0) throw new Error(K + ' has no ' + 'card' + ' page under Content · ' + x.subject);
        goPage('res', stuffFirstResult_() + at);
      }),
      expect: () => {
        const ch = [...document.querySelectorAll('#s-res .card.ct')]
          .find(el => /spread/i.test((el.querySelector('h3') || {}).textContent || ''));
        return !!ch && !ch.querySelector('.fc-flag')
               && ((ch.querySelector('.qtags .qtag') || {}).textContent || '') === 'Content'
               && !!ch.querySelector('.qtags .qtag[data-tag="topic"]')
               && !!ch.querySelector('.tb-words li b')
               && !!ch.querySelector('.tb-math .frac .frac-d')
               && !!ch.querySelector('.tb-points li')
               && !!ch.querySelector('li .tb-h')
               /* NOTHING BUT CONTENT HERE — a boxer would mean the chip did not hold. */
               && !document.querySelector('#s-res .card:not(.tb) .boxer-rec');
      },
      wants: 'a content card — its head and tag row, key words, stacked formulas, worked lines and the Higher mark',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    /* ---------- A CONTENT CARD'S ANIMATION, ON ITS PAGE AFTER ITS CARD § */
    { name: 'a content card animation: Pythagoras',
      enter: () => inFinder_(finderOf_('res'), () => {
        /* BY ITS KEY, under What kind · Content and its own subject — written out in each state because
           a state's `enter` runs in the page as its own text, where a helper here does not exist. */
        const K = 'ct:TB-GCSE-MATHS-17', P = 'an17-pyth', x = stuffItemsAll_().find(it => it.key === K);
        if (!x) throw new Error('no ' + K + ' content card in the list — data/textbooks.json did not load');
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: 'Content' }, { field: 'subject', value: x.subject }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.x && pg.x.key === K && pg.part === P);
        if (at < 0) throw new Error(K + ' has no ' + P + ' page under Content · ' + x.subject);
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
      wants: 'Pythagoras after the Pythagoras and trigonometry card: the drawing from its row, Play again, and the card\'s own lines about it',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    { name: 'a content card animation: Bayes',
      enter: () => inFinder_(finderOf_('res'), () => {
        /* BY ITS KEY, under What kind · Content and its own subject — written out in each state because
           a state's `enter` runs in the page as its own text, where a helper here does not exist. */
        const K = 'ct:TB-GCSE-STATS-15', P = 'an15-bayes', x = stuffItemsAll_().find(it => it.key === K);
        if (!x) throw new Error('no ' + K + ' content card in the list — data/textbooks.json did not load');
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: 'Content' }, { field: 'subject', value: x.subject }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.x && pg.x.key === K && pg.part === P);
        if (at < 0) throw new Error(K + ' has no ' + P + ' page under Content · ' + x.subject);
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
      wants: 'Bayes after the Probability card: the drawing from its row, Play again, and the card\'s own lines about it',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    { name: 'a content card animation: standard form',
      enter: () => inFinder_(finderOf_('res'), () => {
        /* BY ITS KEY, under What kind · Content and its own subject — written out in each state because
           a state's `enter` runs in the page as its own text, where a helper here does not exist. */
        const K = 'ct:TB-GCSE-MATHS-2', P = 'an2-sf', x = stuffItemsAll_().find(it => it.key === K);
        if (!x) throw new Error('no ' + K + ' content card in the list — data/textbooks.json did not load');
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: 'Content' }, { field: 'subject', value: x.subject }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.x && pg.x.key === K && pg.part === P);
        if (at < 0) throw new Error(K + ' has no ' + P + ' page under Content · ' + x.subject);
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
      wants: 'Standard form after the Indices, surds and standard form card: the drawing from its row, Play again, and the card\'s own lines about it',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    /* ---------- THE BIBLE, WHICH ONLY THE ADMIN VISITOR IS SHOWN § */
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
    /* THE FIND CARD'S SHARED PARTS, ON THE KINDS THAT HAD NONE OF THEM § */
    { name: 'the boxers, on the shared head',
      enter: () => inFinder_(finderOf_('res'), () => {
        STUFF.q = '';
        STUFF.filters = [{ field: 'shelf', value: 'Boxing' },
                         { field: 'boxKind', value: 'Boxers' }];
        paintStuff();
        goPage('res', stuffFirstResult_(), true);
      }),
      /* ---------- AND THE PROFILE IT BECAME § */
      expect: () => {
        const c = document.querySelector('#s-res .page.on .card.fc.boxer:not(.is-fights)')
               || document.querySelector('#s-res .card.fc.boxer:not(.is-fights)');
        if (!c || c.querySelector('.thing')) return false;
        /* THE HEAD IS ITS TITLE; WHAT IT IS IS THE Boxers-or-fights ANSWER, in the tag row under it (355). */
        const h3 = c.querySelector('.fc-head > h3'), flag = c.querySelector('.qtags .qtag[data-f="boxKind"]');
        const rec = c.querySelector('.boxer-rec'), frame = c.querySelector('.boxer-pic .boxer-frame');
        if (!h3 || !flag || !rec || !frame || flag.textContent.trim() !== 'Boxers' || c.querySelector('.fc-flag')) return false;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const nums = [...rec.querySelectorAll('.boxer-tally .boxer-n > b')].map(b => b.textContent.trim());
        const told = nums.length ? nums.length >= 3 && nums.every(n => /^\d+$/.test(n))
                                 : /No fight record on file/.test(rec.textContent);
        const f = frame.getBoundingClientRect(), t = h3.getBoundingClientRect();
        return Math.abs(parseFloat(getComputedStyle(h3).fontSize) - 1.1 * rem) < .5
               && flag.getBoundingClientRect().top >= t.bottom - .5
               && told && f.width > 0 && Math.abs(f.width / f.height - .8) < .03
               && f.right <= t.left + .5
               && c.scrollWidth <= c.clientWidth + 1;
      },
      wants: 'a boxer\'s profile — the name at the title size with its [Boxers] tag under it, a 4:5 picture box to its left, the record as a scoreboard of whole numbers (or "no record on file"), nothing scrolling sideways',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    /* ---------- THE PHOTO'S CREDIT, AS A LINK A FINGER CAN HIT § */
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
          /* AND THE PANE IS FITTED AGAIN, as it is when a loaded photo's credit is there from the first paint: § */
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
      /* AND NO `.note` PARAGRAPHS. § */
      expect: () => {
        const c = document.querySelector('#s-res .page.on .card.fc.fight')
               || document.querySelector('#s-res .card.fc.fight');
        if (!c || c.querySelector('p.note')) return false;
        const h3 = c.querySelector('.fc-head > h3.fight-line'), flag = c.querySelector('.qtags .qtag[data-f="boxKind"]');
        const how = c.querySelector('.fc-meta');
        if (!h3 || !flag || !how || flag.textContent.trim() !== 'Fights' || c.querySelector('.fc-flag')) return false;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        /* AND BOTH CORNERS' FACES, SQUARE, ABOVE THE TAG ROW — lifted there by `order`, which only a
           browser lays out. Two because a bout is two boxers, whether either has a photo or not. */
        const faces = [...c.querySelectorAll('.fight-faces .boxer-pic .boxer-frame')].map(e => e.getBoundingClientRect());
        return Math.abs(parseFloat(getComputedStyle(h3).fontSize) - 1.1 * rem) < .5
               && flag.getBoundingClientRect().top >= h3.getBoundingClientRect().bottom - .5
               && getComputedStyle(how).textTransform === 'none'
               && faces.length === 2 && faces.every(r => r.width > 0 && Math.abs(r.width - r.height) < 1.5
                                                        && r.bottom <= flag.getBoundingClientRect().top + .5);
      },
      wants: 'a fight on the shared head — both corners\' faces square above it, the two names as the title with its [Fights] tag under it, how it ended in sentence case, no loose note paragraphs',
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
    /* ---------- THE FIGHTER IN THE RING LOOKS LIKE HIM, IN THE COLOURS A BROWSER ACTUALLY PAINTS § */
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
    /* ---------- A FIGHTER WITH NO ROW IS A SILHOUETTE, NOT A PALE BLOND MAN § */
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
    /* ---------- EVERY COLOUR OF THE FIGURE SHOWS AGAINST THE DARK HE STANDS IN § */
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
    /* ---------- THE LONGEST TAG ROW, EVERY TAG INSIDE THE CARD § */
    { name: "a content card's tag row, every tag inside the card",
      enter: () => inFinder_(finderOf_('res'), () => {
        /* BY ITS KEY, under What kind · Content and its own subject — written out in each state because
           a state's `enter` runs in the page as its own text, where a helper here does not exist. */
        const K = 'ct:TB-GCSE-MATHS-20', x = stuffItemsAll_().find(it => it.key === K);
        if (!x) throw new Error('no ' + K + ' content card in the list — data/textbooks.json did not load');
        STUFF.q = '';
        STUFF.filters = [{ field: 'kindLabel', value: 'Content' }, { field: 'subject', value: x.subject }];
        paintStuff();
        const at = stuffPages_().findIndex(pg => pg.x && pg.x.key === K && !pg.part);
        if (at < 0) throw new Error(K + ' has no ' + 'card' + ' page under Content · ' + x.subject);
        goPage('res', stuffFirstResult_() + at);
      }),
      expect: () => {
        const c = [...document.querySelectorAll('#s-res .card.ct')].find(el => /Data and statistics/.test((el.querySelector('h3') || {}).textContent || ''));
        const tags = c ? [...c.querySelectorAll('.qtags .qtag')] : [];
        if (tags.length < 10) return false;
        const box = c.getBoundingClientRect();
        return tags.every(t => { const r = t.getBoundingClientRect(); return r.left >= box.left - 0.5 && r.right <= box.right + 0.5; });
      },
      wants: "the Data and statistics card's thirteen topic tags, every one inside the card",
      leave: () => inFinder_(finderOf_('res'), () => { STUFF.filters = []; paintStuff(); goPage('res', 0); }) },
  ],

  /* ---------- THE TWO WIDGETS THAT ARE TALLER THAN A SCREEN § */
  /* ---------- THE SAVED COLUMN, IN BOTH OF ITS STATES § */
  /* ---------- AN UNLISTED TUTOR, WHICH ONLY AN ADMIN IS SENT § */
  account: [
    { name: '' },
    /* ---------- THE STAFF HUB (405): its three parts, as an admin who teaches (the fixture's admin, given Tutor for the visit). */
    { name: 'your own card, the Staff hub tile and the terms not agreed',
      only: () => typeof USER !== 'undefined' && !!USER && (isAdmin() || hubFor_()),
      enter: () => {
        window.STATE_HUB_WAS = { roles: USER.roles, at: USER.agreementSignedAt, v: USER.agreementVersion };
        USER.roles = (USER.roles || []).concat(['tutor']); delete USER.agreementSignedAt; delete USER.agreementVersion;
        paint('account'); goPage('account', 0, true);
      },
      leave: () => { const w = window.STATE_HUB_WAS || {}; USER.roles = w.roles; USER.agreementSignedAt = w.at; USER.agreementVersion = w.v; paint('account'); },
      expect: () => document.querySelector('#s-account .page.on [data-do="hub-open"]') && document.querySelector('#s-account .page.on .hub-warn') ? 1 : 0,
      wants: 'your own card with a Staff hub tile in its row and the red line saying the terms are not agreed' },
    { name: 'the Staff hub, terms agreed',
      only: () => typeof USER !== 'undefined' && !!USER && (isAdmin() || hubFor_()),
      enter: () => {
        window.STATE_HUB_WAS = { roles: USER.roles, at: USER.agreementSignedAt, v: USER.agreementVersion };
        USER.roles = (USER.roles || []).concat(['tutor']); USER.agreementSignedAt = '24/10/26 18:20'; USER.agreementVersion = termsVersion_();
        hubOpen_('terms');
      },
      leave: () => { const w = window.STATE_HUB_WAS || {}; USER.roles = w.roles; USER.agreementSignedAt = w.at; USER.agreementVersion = w.v; closeSheet(); },
      expect: () => {
        const b = document.querySelector('#sheet-body [data-do="agree-sign"]');
        return b && b.checked && b.disabled && document.querySelectorAll('#sheet-body .hub-terms .doc h4').length >= 8 ? 1 : 0;
      },
      wants: 'the tutor terms in the Staff hub, ticked and locked, with their sections' },
    { name: 'the Staff hub, pricing',
      only: () => typeof USER !== 'undefined' && !!USER && (isAdmin() || hubFor_()),
      enter: () => { window.STATE_HUB_WAS = { roles: USER.roles }; USER.roles = (USER.roles || []).concat(['tutor']); hubOpen_('pricing'); },
      leave: () => { USER.roles = (window.STATE_HUB_WAS || {}).roles; closeSheet(); },
      expect: () => document.querySelectorAll('#sheet-body .pb-row .pb-bar').length === 3
        && !!document.querySelector('#sheet-body input[type="range"][data-pv="rate"]') ? 1 : 0,
      wants: 'the pricing part: rate and seat controls and three bars, for 1, 2 and 3 students' },
    { name: 'the Staff hub, a statement',
      only: () => typeof USER !== 'undefined' && !!USER && (isAdmin() || hubFor_()),
      enter: () => {
        window.STATE_HUB_WAS = { roles: USER.roles }; USER.roles = (USER.roles || []).concat(['tutor']);
        const r = (d, what, n) => ({ date: d, job: 'J1', what, hours: 1.5, students: n, paid: 45, business: 7.5, tutor: 30 });
        STMT.asking = false; STMT.error = ''; STMT.tutorId = ''; STMT.tutorName = '';
        STMT.data = { month: STMT.month, tutor: 'Test Admin', sessions: [r(STMT.month + '-06', 'GCSE Maths', 2), r(STMT.month + '-13', 'GCSE Maths', 2),
          r(STMT.month + '-20', 'A-Level Further Maths', 3)], totals: { sessions: 3, hours: 4.5, paid: 135, business: 22.5, tutor: 90 } };
        HUB.part = 'statement';
        openSheet('Staff hub', hubHtml_());
      },
      leave: () => { USER.roles = (window.STATE_HUB_WAS || {}).roles; STMT.data = null; closeSheet(); },
      expect: () => document.querySelectorAll('#sheet-body .stmt-t tbody tr').length === 3 ? 1 : 0,
      wants: 'a month\'s statement on paper: three sessions and the totals' },
    /* ---------- THE SHEET THAT MAKES AN ACCOUNT § */
    /* IT OPENS ON ONE QUESTION NOW — "who is the account for?" § */
    /* `offsetHeight`, NOT `getBoundingClientRect`, IN BOTH EXPECTATIONS BELOW. § */
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
    /* ---------- AND ANSWERED "A PARENT" § */
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
    /* ---------- AND WITH "I HAVE NO EMAIL" TICKED § */
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
    /* ---------- A CHILD WITH NO HANDLE, ON AN ADMIN'S PEOPLE COLUMN § */
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
    /* ---------- A NEW PIN, SHOWN ONCE § */
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
    /* ---------- THE HANDLE, WITH EXACTLY ONE `@` IN FRONT OF IT § */
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
    /* ---------- THE AGES THEY TEACH, AS A CHIP UNDER "AT A GLANCE" § */
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
        /* THE PAGE NUMBER COMES FROM THE BUILDER THE COLUMN IS DRAWN FROM, not from a second re-derivation of `others` here — which is the fault the flyer state above § */
        const n = accountPages_().findIndex(h => /prof-off/.test(h));
        if (n < 0) throw new Error('the unlisted tutor is not on the account column');
        goPage('account', n, true);
      },
      /* ---------- AND THE LINE THAT SAYS WHAT THE MARK MEANS § */
      expect: () => document.querySelector('#s-account .card.is-widget.is-off .prof-off')
                 && document.querySelector('#s-account .card.is-widget.is-off .prof-hid'),
      wants: 'the unlisted tutor drawn, dimmed, with "· not listed" and the line saying what it means',
      leave: () => {
        if (window.__OFF_HELD) DATA.tutors = window.__OFF_HELD;
        paint('account');
      } },
    /* ---------- A TUTOR'S OTHER PHOTOGRAPHS, FOUR SQUARES TO A ROW, AND NONE OF THEM OPENS § */
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
    /* ---------- WHAT THEY TEACH: ONE CHIP A SUBJECT, ITS LEVELS RAISED — see `teachGroups_` § */
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
      /* AND THE COLUMN GOES BACK TO THE PAGE IT WAS ON. § */
      leave: () => {
        if (window.__TEACH_HELD) DATA.tutors = window.__TEACH_HELD;
        paint('account');
        goPage('account', window.__TEACH_AT || 0, true);
      } },
    /* ---------- A QUALIFICATION, WRITTEN LIKE AN ISOTOPE — see `profQualChip_` in cards.js § */
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
        /* `teachesSpec` IS SET HERE AND NOT BORROWED FROM THE FIXTURE'S TUTOR: § */
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
        /* THE SAME AIR AS THE TEACHES LEVEL. § */
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
          /* ONE LINE OF TEXT IS ONE PLAIN PILL TALL. § */
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
    /* ---------- WHERE THEY TUTOR, AS A HEAT MAP — see `profHeat_` in cards.js § */
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
        /* AND `Available` AFTER IT, which is the one caption added since the five were asked for — "tutors availability should appear on their card."* It is the week § */
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
    /* ---------- A TUTOR'S HOURS ON THEIR CARD — see `profAvail_` in cards.js § */
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
    /* ---------- YOUR FAMILY, A CARD EACH § */
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
    /* ---------- YOUR OWN CARD WHILE YOUR EMAIL IS UNPROVED § */
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
    /* ---------- YOUR OWN CARD, BEING EDITED — `cardEditHtml_` in me.js (docs/history/330) § */
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
          /* SAVE AND CANCEL IN REACH WITH THE FORM AT ITS TOP — the review of 330: § */
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
          && !!form.querySelector('.ce-sec[data-sec="glance"] [data-me="min_hours"]')
          /* ON ONE PHONE SCREEN (docs/history/425): at 390x844 the whole form, every fold shut, is within its budget —
             2856px before; the owner: "condense this so it can all apear on a phone screen". */
          && (innerWidth !== 390 || innerHeight !== 844 || form.closest('.card-ed').getBoundingClientRect().height <= 760) ? 1 : 0;
      },
      wants: 'your card as its own form at full size in a pane that scrolls, no taller than 760px at 390x844: every section in the card\'s order (the figure and the handle among them), the picture chooser, three photographs fetched at once, three qualifications, the session length, the map, all seven days of the week, Save and Cancel as tiles in reach at the foot of the pane, and Sign out under them' },
    /* ---------- AND ANOTHER TUTOR'S CARD, EDITED BY AN ADMIN § */
    { name: 'another tutor\'s card, being edited by an admin',
      only: () => typeof USER !== 'undefined' && !!USER && typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        const ada = (DATA.tutors || []).find(t => t && t.personId && String(t.personId) !== String(USER.personId));
        if (!ada) throw new Error('the fixture has no tutor other than the visitor');
        CARD_EDIT = cardEditFresh_(ada.personId);
        CARD_EDIT.base = { phone_cc: '+44', first_name: 'Ada', last_name: 'Tutor',
          headline: 'Ten years of GCSE and A-Level maths.', rate_per_hour: '30', extra_seat_rate: '0.5',
          /* A CUT OF THEIR OWN (docs/history/345), so the business's pound box is measured filled, beside theirs. */
          extra_seat_cut: '0.1',
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
          /* THE TWO PARTS OF A SEAT IN POUNDS BESIDE THE RATE, THE CUT THE ADMIN'S TO SET, AND THE SEAT AS THE CARD
             WILL PRINT IT (docs/history/345): £15.00 theirs and £3.00 the business's of a £30 rate. */
          && (form.querySelector('[data-pound="extra_seat_rate"]') || {}).value === '15.00'
          && (form.querySelector('[data-pound="extra_seat_cut"]') || {}).value === '3.00'
          && /\+£18\.00\/h a seat/.test((form.querySelector('.ce-seat') || {}).textContent || '')
          && pg.querySelectorAll('.ce-tiles .tile[data-do="card-save"], .ce-tiles .tile[data-do="card-cancel"]').length === 2 ? 1 : 0;
      },
      wants: 'the fixture tutor\'s card as a form for the admin: their headline in its box, their picture shown and not offered, the two parts of a seat in pounds with the seat they make, the whole week, Save and Cancel' },
    /* ---------- EVERYBODY'S OWN CARD, BEING EDITED — THE FIGURE AND THE HANDLE ON IT (docs/history/339) § */
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

    /* ---------- YOUR HANDLE, ON YOUR OWN CARD: SHOWN, WITH RANDOMISE, AND NO BOX § */
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

    /* ---------- THE WARDROBE, ON YOUR OWN CARD — ONE SECTION, AND A PICK THAT REDRAWS IT § */
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
    /* ---------- YOUR PICTURE, CHOSEN — `photoPicker_` in me.js § */
    { name: 'your picture, chosen',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_PFP_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, { photo: 'data/reels/archetest.jpg', phone_cc: '+44' });
        /* ON YOUR OWN CARD'S EDIT, where the picker is since docs/history/339 — the form opened as Edit opens
           it, and the copy it is drawn from shaped as `myProfile` sends it (`phone_cc`). */
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        CARD_EDIT = cardEditFresh_(USER.personId);
        /* THE PICKER IS ONE LINE UNTIL OPENED (docs/history/425) — opened here, as a tap on "Picture" does. */
        CE_OPEN.add('picture');
        paint('account');
        const at = [...document.querySelectorAll('#s-account .page')].findIndex(pg => pg.querySelector('.card-ed .pfp'));
        if (at < 0) throw new Error('no picture picker on your own card\'s Edit');
        goPage('account', at, true);
      },
      leave: () => {
        USER.profile = window.STATE_PFP_WAS; delete window.STATE_PFP_WAS;
        CARD_EDIT = null; CE_OPEN.delete('picture');
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
    /* ---------- YOUR PICTURE, ONE OF ELEVEN — AT REST, AND WITH THE FOX CHOSEN § */
    { name: 'your picture, the eleven at rest',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.STATE_PFP_WAS = USER.profile;
        USER.profile = Object.assign({}, USER.profile || {}, { photo: '', phone_cc: '+44' });
        /* ON YOUR OWN CARD'S EDIT, where the picker is since docs/history/339 — the form opened as Edit opens
           it, and the copy it is drawn from shaped as `myProfile` sends it (`phone_cc`). */
        document.querySelectorAll('#s-account .card-ed .me-form').forEach(f => { f.removeAttribute('data-dirty'); f.classList.remove('is-sending'); });
        CARD_EDIT = cardEditFresh_(USER.personId);
        /* THE PICKER IS ONE LINE UNTIL OPENED (docs/history/425) — opened here, as a tap on "Picture" does. */
        CE_OPEN.add('picture');
        paint('account');
        const at = [...document.querySelectorAll('#s-account .page')].findIndex(pg => pg.querySelector('.card-ed .pfp'));
        if (at < 0) throw new Error('no picture picker on your own card\'s Edit');
        goPage('account', at, true);
      },
      leave: () => {
        USER.profile = window.STATE_PFP_WAS; delete window.STATE_PFP_WAS;
        CARD_EDIT = null; CE_OPEN.delete('picture');
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
        /* THE PICKER IS ONE LINE UNTIL OPENED (docs/history/425) — opened here, as a tap on "Picture" does. */
        CE_OPEN.add('picture');
        paint('account');
        const at = [...document.querySelectorAll('#s-account .page')].findIndex(pg => pg.querySelector('.card-ed .pfp'));
        if (at < 0) throw new Error('no picture picker on your own card\'s Edit');
        goPage('account', at, true);
      },
      leave: () => {
        USER.profile = window.STATE_PFP_WAS; delete window.STATE_PFP_WAS;
        CARD_EDIT = null; CE_OPEN.delete('picture');
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

  /* ---------- THE SETTINGS COLUMN, WHICH THIS FILE HAD NEVER DECLARED A STATE FOR § */
  settings: [
    { name: '' },
    /* ---------- YOUR CHILD'S ACCOUNT, MADE: THE SLIP ON "MANAGE YOUR CHILD" § */
    { name: 'your child\'s account, made',
      only: () => typeof USER !== 'undefined' && !!USER && typeof mayAddChild_ === 'function' && mayAddChild_(),
      enter: () => {
        KID_MADE = { pid: String(USER.personId || ''), name: 'Maximilian', handle: 'maximilian_steady42',
                     pin: ['0', '7', '3', '9'].join('') };
        /* A FORM LEFT UNSAVED OR SENDING BY WHATEVER RAN BEFORE -- `check/press.js` presses every Save on this column first -- makes `paint` keep the column rather than § */
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
    /* ---------- AND HELD FOR THE LINK: A PARENT WHOSE OWN ADDRESS NOBODY HAS PROVED § */
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
    /* ---------- MANAGE YOUR CHILD, WITH CHILDREN LINKED, AND WITH NONE (docs/history/339) § */
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
        /* NEVER DRAWN SMALLER (the review of docs/history/339): § */
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
    /* ---------- A NEW ADDRESS WAITING FOR ITS LINK, ON THE CONTACT CARD § */
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
    /* ---------- THE PHOTOGRAPHS PAGE: THE FACE, THE CLIP, AND A SHELF OF EIGHT § */
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
    /* ---------- THE FOUR FIELDS THAT ARE THE QUOTE, WHICH THE FIXTURE HAD NEVER SENT § */
    { name: 'the rate and group size',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const at = [...document.querySelectorAll('#s-settings .page')]
          .findIndex(pg => pg.querySelector('[data-me="rate_per_hour"]'));
        if (at < 0) throw new Error('no pricing page on the settings column');
        goPage('settings', at, true);
      },
      /* EXACTLY SEVEN, NOT MERELY SOME. § */
      expect: () => (document.querySelectorAll('#s-settings .page.on [data-me]').length === 7
                     && document.querySelectorAll('#s-settings .page.on .f-row.is-range [data-me]').length === 4
                     && !!document.querySelector('#s-settings .page.on .f-row.is-range [data-me="min_hours"]')
                     && !!document.querySelector('#s-settings .page.on [data-me="extra_seat_cut"]:not([disabled])')
                     ? 7 : 0),
      wants: 'all four pricing boxes, the business\'s cut of a seat (the admin\'s to set) and the session length on one page, the students and the hours each one min – max row' },

    /* ---------- YOUR JOURNEY WAS HERE, AND IS PROGRESS'S STATE NOW ---------------------------------
       The card went to the Progress column on 12 Oct (docs/history/346); its state went with it, below. */
    /* ---------- THE AGES A TUTOR TEACHES, ON ABOUT YOU AND NOT ON THE PAGE ABOVE § */
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

    /* THE TUTOR AGREEMENT'S STATE WAS HERE — the terms are in the Staff hub on You now (405); its states are on `account`. */

    /* ---------- YOUR ROLES, WITH A TUTOR TICK WAITING — `rolesCard_` in me.js § */
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

    /* ---------- THE WEEKLY PARENT EMAIL'S CARD AND ITS PREVIEW WERE TWO STATES HERE § */

    /* ---------- THE QUALIFICATIONS: ONE LINE A QUALIFICATION, AND IT FITS § */
    { name: 'the qualifications',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        /* THREE SUBJECTS AT TWO LEVELS AND AN ENHANCED DBS, through `USER.profile`, which is what the column is drawn from — the tutor the redesign was measured with. § */
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
    /* AND THE PHYSICS A-LEVEL OPEN, through a tap on its own line. § */
    { name: 'the qualifications, one line open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        /* THREE SUBJECTS AT TWO LEVELS AND AN ENHANCED DBS, through `USER.profile`, which is what the column is drawn from — the tutor the redesign was measured with. § */
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
    /* AND THE DBS OPEN — A CERTIFICATE'S EDITOR. § */
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
    /* AND A LINE BEING ADDED, through the `+`. § */
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
        /* THE SUBJECT BOX TAKES THE FOCUS a tick later (`qualNext_`) — it opened the app's own list here until the dropdowns were the platform's again (note 315), and § */
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

    /* ---------- THE THREE DATE-OF-BIRTH BOXES, ON A GROUP THE FIXTURE DID NOT HAVE § */
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

    /* ---------- THE TWO EXAM DATES, WHICH ONLY A STUDENT IS OFFERED § */
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
      /* BOTH, AND BOTH A REAL DATE PICKER. § */
      expect: () => (document.querySelectorAll('#s-settings .page.on input[type="date"][data-me]')
                       .length === 2 ? 2 : 0),
      wants: 'two exam-date boxes, both drawn as a date picker' },

    /* ---------- A SEVERAL-OF-A-LIST FIELD, OPEN, WITH A BOX TICKED § */
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

    /* ---------- AN ORDINARY SELECT, ANSWERED § */
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

    /* "ALSO TEACH, OPEN" WENT WITH THE PAGE. § */

  ],

  saved: [
    { name: 'nothing kept' },
    { name: 'two widgets kept',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        widgetsOf_('tool').slice(0, 2).forEach(w => {
          if (!isFav(WIDGET_KEY(w))) toggleFav(WIDGET_KEY(w), 'widget');
        });
        /* `repaint`, AS THE STAR ON SAVED DOES (`on('fav')` in find.js), NOT `paint`: § */
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
    /* ---------- THINGS KEPT, DRAWN AS FIND DRAWS THEM § */
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
    /* ---------- THE LIBRARY CARDS STARRED ONTO SAVED, TYPED INTO, AND A REPAINT (the review of docs/history/339) § */
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

  /* ---------- THE SHOP WINDOW, EMPTY AND FULL, AND THE EMPTY ONE IS TWO DIFFERENT CARDS § */
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

  /* ---------- THE BUSINESS RECORDS, A COLUMN OF THEIR OWN AND ONLY AN ADMIN'S § */
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

    /* THE INSURANCE CARD WITH SOMETHING RECORDED. § */
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
          /* AND EACH ROW'S TWO BOXES ARE ONE WIDTH. § */
          && [...pg.querySelectorAll('.biz-item .lib-row')].every(r => {
            const w = [...r.children].map(c => c.getBoundingClientRect().width);
            return w.length === 2 && w[0] > 0 && Math.abs(w[0] - w[1]) <= 1;
          });
      },
      wants: 'three insurance items, each with its date box, the one due soon flagged, and each row\'s two boxes one width' },

    /* THREE WIDGETS WAITING ON A REAL REQUEST, HELD, AND THEN LET GO — this one, and the Videos card and the camera, which are declared with their own columns § */
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

  /* ---------- PROGRESS (435): THE TITLE ALONE WITH NOTHING TO COUNT, OR THE LEARNER'S CARDS — EITHER WAY ASSERTED ---------- */
  progress: [
    { name: '',
      expect: () => {
        const h = document.getElementById('s-progress');
        const pane = h && h.querySelector(':scope > .page > .pane');
        if (!pane || !pane.querySelector('.card h3, .loading')) return false;
        const acts = [...h.querySelectorAll('[data-do]')].map(e => e.dataset.do);
        if (acts.some(a => a !== 'prog-practise' && a !== 'prog-sessions')) return false;
        if (/Not built yet/.test(h.textContent)) return false;
        /* EVERY WIDGET, ALWAYS (435): seven titles at least, each empty one its title alone. */
        const cards = [...h.querySelectorAll(':scope > .page .card')];
        if (cards.length < 7 || cards.some(c => !c.querySelector('h3'))) return false;
        return cards.filter(c => c.classList.contains('is-empty')).every(c => c.children.length === 1);
      },
      wants: 'every Progress widget drawn, each with nothing to say its title alone; the only controls Practise and Sessions' },
    /* ---------- YOUR EXAMS, WITH THE ONE LIVE LINE DRAWN ---------- */
    { name: 'your exams',
      only: () => typeof USER !== 'undefined' && !!USER && typeof mayJourney_ === 'function' && mayJourney_(),
      enter: () => {
        const t = new Date(Date.now() + 14 * 864e5);
        USER.profile = Object.assign({}, USER.profile || {},
          { exam_big_date: t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0') });
        progressRedraw_();
        const c = document.querySelector('#s-progress .card.journey');
        if (!c) throw new Error('no countdowns card on the progress column');
        const pages = [...document.querySelectorAll('#s-progress > .page')];
        goPage('progress', Math.max(0, pages.indexOf(c.closest('.page'))), true);
      },
      expect: () => {
        const c = document.querySelector('#s-progress .page.on .card.journey');
        return !!c && /Big exam\s*\d+ days?/.test(c.textContent) && !c.querySelector('button, [data-do]')
          && !document.querySelector('#s-settings .card.journey')
          && !document.querySelector('.card.digest, [data-do="digest-preview"]');
      },
      wants: 'the Countdowns card on Progress, with the Big exam line and no control on it — none on Settings, and no weekly parent email card anywhere',
      leave: () => { if (USER && USER.profile) delete USER.profile.exam_big_date; progressRedraw_(); } },
  ],

  /* ---------- THE SHOP § */
  shop: [
    { name: '' },
    /* THE FIRST SHELF. Found by its heading rather than by a number, because how many widgets sit above the things is the roster's business — and asked of the cards § */
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

    /* ---------- AND THE BASKET, WHICH A FIXTURE CANNOT REACH AT ALL § */
    /* ---------- AND WHAT A BUNDLE PUTS IN IT, which is most of what a basket holds now § */
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
                /* AND THE SHOP LINES THE BASKET MOSTLY HOLDS: § */
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
      /* `widgetsOf_`, NOT `allWidgets()` — the note over the flyer state below says why, and this state was still doing the thing it describes: § */
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'mat');
        if (n < 0) throw new Error('no cheat sheet widget in the roster');
        goPage('tools', n, true);
      },
      /* NO PREVIEW, AND THAT IS PART OF WHAT IS ASSERTED. § */
      expect: () => !document.querySelector('#s-tools .mat-sheet')
        && document.querySelector('#s-tools #mat-said b'),
      wants: 'the picker and the gauge, with no A4 preview on the card' },
    /* ---------- AND FILLED, WHICH IS THE CARD SOMEBODY ACTUALLY PRINTS FROM § */
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
        /* A TOPIC AT A TIME NOW (`MAT_GROUPS`), and no GCSE topic holds five, so the ticks are taken across the topics the way a person would make a sheet — and the view § */
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
        /* AND ASKED OF THE COMPUTED STYLE, NOT ONLY THE CLASS: § */
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
    /* ---------- AND EVERY VIEW OF IT FITS, WHICH IS WHAT THE OWNER ASKED § */
    { name: 'the cheat sheet maker, every subject, level and topic',
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'mat');
        if (n < 0) throw new Error('no cheat sheet widget in the roster');
        goPage('tools', n, true);
        if (!document.querySelector('#s-tools #mat-group')) throw new Error('the cheat sheet maker has no topic select');
      },
      expect: () => {
        const phone = (innerWidth === 320 && innerHeight === 568) || (innerWidth === 390 && innerHeight === 844);
        /* NOT WALKED AT ALL AWAY FROM THE PHONES. § */
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
    /* ---------- AND THIS ONE IS NOT THERE FOR EVERYBODY § */
    /* ---------- THE PAGE NUMBER COMES FROM THE LIST THE COLUMN IS BUILT FROM § */
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

    /* ---------- CHECK UPLOADS, ANSWERED — THE ADMIN'S, LIKE THE FLYER § */
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

    /* ---------- A TUTOR'S TEACHING HOURS § */
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

    /* ---------- A TIMETABLE WITH A WEEK IN IT § */
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

    /* ---------- THE TIMETABLE WITH YOUR BOOKED SESSIONS LOCKED IN IT § */
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
    /* ---------- A CALENDAR WITH EVERY KIND OF DATE ON IT § */
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

    /* ---------- TOUCH TYPING, HALF WAY ALONG A LINE WITH A KEY WRONG § */
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

    /* ---------- THE WHITEBOARD, A MATHS NOTEBOOK WITH SOMETHING ON IT (377): a line, a triangle and a ring, from the pen's old format ---------- */
    { name: 'a whiteboard with a drawing on it',
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'whiteboard');
        if (n < 0) throw new Error('no whiteboard widget in the roster');
        goPage('tools', n, true);
        const k = padKey_(WB_ITEM);
        const ring = [];
        for (let i = 0; i <= 48; i++) ring.push(Math.round(170 + 60 * Math.cos(i / 24 * Math.PI)), Math.round(255 + 45 * Math.sin(i / 24 * Math.PI)));
        ansStore_(k, JSON.stringify([[0, 20, 340, 20], [70, 190, 170, 50, 270, 190, 70, 190], ring]));
        initBoard_();
      },
      expect: () => {
        const nb = document.querySelector('#s-tools #wgt-whiteboard .nb');
        return !!nb && nbState_(nb.getAttribute('data-k')).items.length === 3
          && !!nb.querySelector('.nb-pad[data-noswipe]') && nb.querySelectorAll('.nb-bar .tile').length === 5;
      },
      wants: 'the notebook drawn with three marks on it, its pad named for the grid, and Fraction, Power, Root, Integral and Clear under the page',
      leave: () => {
        const k = padKey_(WB_ITEM);
        ansStore_(k, null);
        NB_STATE.delete(k);
        initBoard_();
      } },
    /* ---------- THREE, FOUR AND FIVE LIBRARY CARDS, DRAWN AS CARDS — `libraryShelf_` in me.js; docs/history/332 § */
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

  /* ---------- A HIGH-SCORE BOARD WITH SCORES ON IT § */
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
        /* ---------- AND THE VISITOR HAS TO BE ON IT, OR THE OTHER BRANCH NEVER DRAWS § */
        if (typeof USER !== 'undefined' && USER) DATA.students.push(
          { name: USER.name, handle: USER.handle, personId: USER.personId,
            highscore: 8, ttHighscore: 7 });
        /* `repaint` RATHER THAN `paint`, and the difference is the whole state. § */
        repaint(true);
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'flabby');
        if (n < 0) throw new Error('no Flabby Pird widget in the roster');
        goPage('games', n, true);
      },
      /* ONE MORE ROW THAN `SCORE_TOP`, and the number is READ OFF THE APP rather than written here: § */
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
        /* `repaint` RATHER THAN `paint`, and the difference is the whole state. § */
        repaint(true);
      } },
    /* THE SAME RENDERER IN THE OTHER CARD, and still worth its own state although the reason it was written for has gone. § */
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

    /* ---------- AND A SCRABBLE GAME PART-WAY THROUGH § */
    { name: 'a game of scrabble',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'boardgames');
        if (n < 0) throw new Error('no board games widget in the roster');
        goPage('games', n, true);
        try { localStorage.setItem('bg-game', 'scr'); } catch (e) {}
        bgPaint_();
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

    /* THE HAND-OVER IS ITS OWN STATE because it is the one that draws NO rack: § */
    { name: 'handing the phone over',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'boardgames');
        if (n < 0) throw new Error('no board games widget in the roster');
        goPage('games', n, true);
        try { localStorage.setItem('bg-game', 'scr'); } catch (e) {}
        bgPaint_();
        scrabble = scrNew_(3);
        scrabble.handover = true;
        scrabblePaint();
      },
      expect: () => !!document.querySelector('#s-games .scr-hand')
                 && document.querySelectorAll('#s-games .scr-tile').length === 0,
      wants: 'the hand-over card, with no rack on the screen',
      leave: () => { scrabble = null; scrabblePaint(); } },

    /* ---------- THE FOUR CLASSROOM GAMES, EACH ON ITS BUSIEST CARD § */
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

    /* ---------- IMPOSTER, EVERY SCREEN OF A ROUND § */
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
      /* AND THE PICTURE HAS ITS HAIRLINE AND NO "?": § */
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
      /* AND THE "?" DRAWN ON IT — the mark a child who cannot read "Imposter" knows this card by (impFrame_, note 343). § */
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
    /* THE BIG LINE AND THE BUTTON, MEASURED STAYING WHERE THEY ARE. § */
    { name: 'imposter the big line and the button stay put',
      enter: () => {
        goPage('games', (n => { if (n < 0) throw new Error('no wordgames widget in the roster'); return n; })(widgetsOf_('game').findIndex(w => String(w.id) === 'wordgames')), true);
        { const sel = document.querySelector('#s-games #wg-pick'); sel.value = 'imp'; ACTIONS['wg-pick'](sel); }
        window.__impStill = null;
        const b = () => document.createElement('button');
        const [, word, wordSym] = impCards_().reduce((a, x) => (x[1].length > a[1].length ? x : a));
        const cat = Object.keys(IMP_DECK).reduce((a, x) => (x.length > a.length ? x : a));
        const catSym = IMP_DECK[cat].sym;
        /* EACH TOP READ TWO FRAMES AFTER ITS PRESS, NOT IN THE SAME TICK. § */
        const frames = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        /* AND AT REST: a slide the column is still running is a card on its way, not where it stops — `settled` in check/ui.js asks the same of a whole screen. § */
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

    /* `an alibi case card` AND `an alibi interview` WERE HERE, and went with the game ("delete alibi game.") — a state that enters a widget nobody can open fails § */
    /* ---------- A WORD SEARCH PART-FOUND, AND A SENTENCE PART-BUILT § */
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

    /* ---------- A CONNECT 4 GAME, WON § */
    { name: 'a connect 4 game, won',
      enter: () => {
        const n = widgetsOf_('game').findIndex(w => String(w.id) === 'boardgames');
        if (n < 0) throw new Error('no board games widget in the roster');
        goPage('games', n, true);
        try { localStorage.setItem('bg-game', 'c4'); } catch (e) {}
        bgPaint_();
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

  ],

  /* ---------- REELS: VIDEOS LEADS THE COLUMN (414), so its states are measured here; the widget's page is its index among the column's widgets */
  reel: [
    { name: '' },
    /* ---------- THE VIDEOS CARD: THE BAR, FOUR RESULTS, A FILM PLAYING, AND THE GLASS FILLED § */
    { name: 'the videos card, idle',
      enter: () => {
        const n = widgetsOf_('reel').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        VID.q = ''; VID.at = '';
        vidPaint_();
        goPage('reel', n, true);
      },
      expect: () => {
        const box = document.querySelector('#s-reel #wgt-videos .vid-box');
        return !!box && !!box.querySelector('input.vid-q') && !box.querySelector('.vid-row, .vid-player, .vid-watch.on, .loading')
          && !(box.querySelector('.vid-results') || {}).innerHTML && !(box.querySelector('.vid-admin') || {}).innerHTML;
      },
      wants: 'the search bar and nothing else — no count, no list, no admin row, no player' },
    { name: 'a video search, four and how many more',
      enter: () => {
        const n = widgetsOf_('reel').findIndex(w => String(w.id) === 'videos');
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
        goPage('reel', n, true);
      },
      expect: () => {
        const box = document.querySelector('#s-reel #wgt-videos .vid-box');
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
        const n = widgetsOf_('reel').findIndex(w => String(w.id) === 'videos');
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
        goPage('reel', n, true);
      },
      expect: () => !!document.querySelector('#s-reel .vid-stage.on video.vid-player')
                 && !!document.querySelector('#s-reel .vid-acts .tile[data-do="vid-full"]:not([disabled])')
                 && !document.querySelector('#s-reel .vid-results .vid-row')
                 && !(document.querySelector('#s-reel .vid-admin') || {}).innerHTML
                 && (document.querySelector('#s-reel .vid-q') || {}).value === 'photo',
      wants: 'the player holding the chosen clip in place of the results, the Full screen tile beside its title, and the bar still holding "photo"',
      leave: () => { VIDEOS_LIST = window.__seedVid || null; VID.q = ''; VID.at = ''; vidPaint_(); } },
    /* ---------- A FILM FROM THE FOLDER, PLAYING IN DRIVE'S PLAYER, WITH THE DOOR BESIDE IT § */
    { name: 'a film from the folder playing, with Open in Drive',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        const n = widgetsOf_('reel').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        window.__seedFilms = DATA.films;
        DATA.films = (DATA.films || []).concat([{ id: 'FXD01', title: 'An Invented Film Kept In Drive For Measuring', year: '1999',
          kind: 'film', audience: 'kids', seasons: '', url: 'https://drive.google.com/file/d/example-fx-drive-001/view', placeholder: false, notes: '' }]);
        VID.q = 'invented film kept';
        VID.at = 'fFXD01';
        vidPaint_();
        goPage('reel', n, true);
      },
      expect: () => /^https:\/\/drive\.google\.com\/file\/d\/example-fx-drive-001\/preview$/.test(
                     (document.querySelector('#s-reel .vid-stage iframe.vid-player') || {}).src || '')
                 && !!document.querySelector('#s-reel .vid-acts .tile[data-do="vid-full"]')
                 && !!document.querySelector('#s-reel .vid-acts a.tile[href*="example-fx-drive-001"]'),
      wants: 'Drive\'s player of the film, and Full screen and Open in Drive beside its title',
      leave: () => { DATA.films = window.__seedFilms || []; VID.q = ''; VID.at = ''; vidPaint_(); } },
    /* ---------- AND THE APP'S OWN FULL SCREEN, WHERE THE BROWSER HAS NONE § */
    { name: 'the videos card, its own full screen',
      enter: () => {
        const n = widgetsOf_('reel').findIndex(w => String(w.id) === 'videos');
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
        goPage('reel', n, true);
        setTimeout(() => {
          const t = document.querySelector('#s-reel #wgt-videos .vid-acts [data-do="vid-full"]');
          if (t) ACTIONS['vid-full'](t);
        }, 150);
      },
      /* AND WHAT "FULL SCREEN" MEANS, ASKED IN PIXELS AT EVERY WIDTH: § */
      expect: () => {
        const w = document.querySelector('#s-reel #wgt-videos .vid-watch.is-fs');
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
        /* AND THE CARD LET GO OF, AS A FINGER LEAVING IT WOULD. § */
        try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); HOLD_AT = null; } catch (e) {}
        const a = window.__fsApi;
        if (a) { if (a.r) Element.prototype.requestFullscreen = a.r; if (a.w) Element.prototype.webkitRequestFullscreen = a.w; }
        delete window.__fsApi;
        VIDEOS_LIST = window.__seedVid || null; VID.q = ''; VID.at = ''; vidPaint_();
      } },

    /* ---------- THE FILMS IN THE VIDEOS CARD — THE ADMIN'S, AND NOBODY ELSE'S § */
    { name: 'the films in the videos card, an admin’s',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        const n = widgetsOf_('reel').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        VID.q = 'film'; VID.at = '';
        vidPaint_();
        goPage('reel', n, true);
      },
      expect: () => !!document.querySelector('#s-reel .vid-admin .tile.is-admin[data-do="vid-sync"]')
                 && !!document.querySelector('#s-reel .vid-admin .vid-synced')
                 && document.querySelectorAll('#s-reel .vid-results .vid-row').length >= 3
                 && !!document.querySelector('#s-reel .vid-results .vid-row.is-off'),
      wants: 'the films "film" finds, the one not in the Drive yet dimmed, and the silver Sync from Drive tile and when it last ran under them',
      leave: () => { VID.q = ''; VID.at = ''; vidPaint_(); } },
    { name: 'the videos card, nobody’s films',
      only: () => !(typeof isAdmin === 'function' && isAdmin()),
      enter: () => {
        const n = widgetsOf_('reel').findIndex(w => String(w.id) === 'videos');
        if (n < 0) throw new Error('no videos widget in the roster');
        VID.q = 'film'; VID.at = '';
        vidPaint_();
        goPage('reel', n, true);
      },
      expect: () => !document.querySelector('#s-reel .vid-admin *')
                 && !document.querySelector('#s-reel [data-do="vid-sync"]')
                 && !!document.querySelector('#s-reel .vid-results .vid-none')
                 && !/film|drive|sync/i.test((document.querySelector('#s-reel .vid-box') || {}).textContent || 'film'),
      wants: 'a search for "film" answered without a film, no Sync tile, nothing in the admin row, and no word on the card that says films exist',
      leave: () => { VID.q = ''; VID.at = ''; vidPaint_(); } },

    /* ---------- AND WHILE ITS LIST IS ON ITS WAY: THE BAR, AND THE ONE LOADER WHERE THE RESULTS GO § */
    { name: 'the videos still coming',
      only: () => !(typeof isAdmin === 'function' && isAdmin()),
      grows: 'the results — how many rows are coming is not known until they come (see `vidPaint_`)',
      enter: () => {
        const n = widgetsOf_('reel').findIndex(w => String(w.id) === 'videos');
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
        goPage('reel', n, true);
        initVideos();
      },
      expect: () => {
        const box = document.querySelector('#s-reel #wgt-videos .vid-box');
        return !!box && !box.getAttribute('aria-busy') && !!box.querySelector('.vid-results > .loading')
          && document.querySelectorAll('#s-reel #wgt-videos .loading').length === 1 && !!box.querySelector('input.vid-q');
      },
      wants: 'the bar, usable, and the one loader where the results will be while data/videos.json is held',
      release: () => { const h = window.__vidHeld; if (h) { window.fetch = h.fetch; if (h.go) { h.go(); h.go = null; } } },
      landed: () => {
        const box = document.querySelector('#s-reel #wgt-videos .vid-box');
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

  /* ---------- A SCRABBLE GAME PART-WAY THROUGH § */
  /* ---------- AND A SESSION RECEIPT, WHICH THIS FILE HAS NEVER HAD ON THE SCREEN § */
  /* ---------- THE CAMERA WITH A PICTURE ON IT § */
  /* THE CAMERA IS A PAGE OF THE FEED NOW, directly above the newest post — the `make` column is gone. § */
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
    /* ---------- AND THE MOMENT BEFORE THE FIRST FRAME: THE ONE LOADER IN THE VIEWFINDER § */
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
        /* AFTER ANY ASK STILL OUT. § */
        const t0 = Date.now();
        const ask = () => {
          if (CAM_ASKING && Date.now() - t0 < 2000) { setTimeout(ask, 50); return; }
          try { camStop_(); } catch (e) {}
          CAM_FAILED = null; CAM_ASKING = false;
          goPage('feed', feedCamAt_(), true);
          /* `true`: an ask on the spot, so a refusal this browser kept earlier (427) does not stand in for the wait. */
          camStart_(true);
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
    /* ---------- AND A BROWSER WITH NO CAMERA AT ALL: A FACT, AND NO LOADER OVER IT § */
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
    /* ---------- A POST'S FACES, IN EVERY STATE THEY ARE DRAWN IN § */
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
    /* EVERY FACE COUNTED IN TWO DIGITS AND ONE OF THEM YOURS — the widest the house row gets on a busy post, and the gold one with its heavier count inside a 41px § */
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
    /* A POST'S OWN CELL NAMING NINE FACES, with three- and four-digit counts: § */
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
    /* WHO REACTED, OPEN — the sheet is outside `#s-feed`, and `check/ui.js` measures it when one is open. § */
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
    /* ---------- A TAP ON A FACE, AND THE CARD IT IS ON DOES NOT MOVE § */
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
        /* AND THE CARD STILL BEFORE THE TAP. § */
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
        /* AND THE HOLD THE TAP TOOK IS LET GO. § */
        HOLD_AT = null;
        repaint(true);
      } },
    /* ---------- A POST WITH NO DATE: THE FIRST FACE AND THE LAST TAKEN BACK, AND THE CARD DOES NOT MOVE -- § */
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

    /* ---------- THE WAITING-LIST BRANCH, WHICH IS A DIFFERENT FORM § */
    { name: 'a waiting list',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        BOOKING.how = 'Waiting list class';
        /* ---------- AND A VENUE, BECAUSE WITHOUT ONE THE BRANCH RETURNS ON ITS SECOND LINE § */
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
      /* PUT BACK, because states run in order down one page and the receipt state after this one would otherwise be measuring a waiting list's form. § */
      leave: () => { if (typeof resetBooking_ === 'function') resetBooking_(); drawBooker(); } },

    /* ---------- A SEVERAL-ANSWERS ROW, OPEN UNDER ITSELF, WITH A BOX TICKED § */
    { name: 'a list of answers open',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const st = (typeof BOOK_STEPS !== 'undefined' ? BOOK_STEPS : []).filter(x => x.multi && !x.grid)
          .filter(x => { try { return (x.options() || []).filter(Boolean).length >= 1; } catch (e) { return false; } })[0];
        if (!st) throw new Error('no several-answers question offers anything to tick');
        window.STATE_MANY_STEP = st.id;
        BOOKING.picking = st.id; drawBooker();
        /* THE BOX IS TICKED ONCE IT IS DRAWN, asked again for up to two seconds. § */
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

    /* ---------- AND A SINGLE ANSWER, CHOSEN § */
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

    /* ---------- A ROOM CHOSEN, AND THE ROW SAYING WHICH § */
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
    /* ---------- A TUTOR CHOSEN: THE WEEK IS THE DAYS THEY WORK — see `days` in `slotGrid` § */
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
          /* ---------- `maxKids` AND `location`, WHICH ARE THE NAMES `doGet` SENDS § */
          maxKids: 2, location: 'Colliers Wood Library', clientHosts: true,
          weekday: 'Tuesday', time: '16:00', hours: '1.5', term: 'Autumn 2026',
          kind: 'session', splitEmails: 'gran@example.org', tutor: 'Ada Tutor', client: USER.name,
          /* ---------- `dates`, BECAUSE THAT IS THE NAME `doGet` SENDS § */
          dates: '06/10/26, 13/10/26, 20/10/26, 27/10/26, 03/11/26, 10/11/26',
          startDate: '06/10/26', endDate: '10/11/26', createdAt: '22/09/2026',
          slots: [{ n: 1, client: USER.name, status: 'Booked' },
                  { n: 2, client: 'Second Family', status: 'Booked' }],
          /* ---------- THE JOB'S OWN LOG, WHICH IS WHERE TWO OF THE FIVE DATES COME FROM § */
          events: [
            { at: '22/09/2026', actor: USER.name, role: 'client', action: 'Request', target: '', message: 'asked for a session' },
            { at: '23/09/2026', actor: 'Second Family', role: 'client', action: 'Request', target: '', message: 'asked to join' },
            { at: '24/09/2026', actor: USER.name, role: 'client', action: 'Accept', target: '', message: 'accepted by us' },
            { at: '25/09/2026', actor: 'Second Family', role: 'client', action: 'Accept', target: '', message: 'accepted by us' },
            { at: '26/09/2026', actor: USER.name, role: 'client', action: 'Confirm', target: '', message: 'payment confirmed' },
            { at: '28/09/2026', actor: 'Second Family', role: 'client', action: 'Confirm', target: '', message: 'payment confirmed' },
          ],
          /* `adminKeeps`, BECAUSE THE LAB SIGNS IN AS AN ADMIN and an admin is sent all three figures — so this card draws `Client pays`, `Tutor earns` and `Admin earns` § */
          price: '270', tutorPay: '135', adminKeeps: '81', stage: 'accepted', status: 'accepted',
        }];
        paint('booking');
        /* PAGE BY POSITION IS WRONG HERE and `jobPageAt_` is the app's own answer: it reads the
           same ordered list the pages are built from, so this cannot land on the form because
           something moved. */
        goPage('booking', typeof jobPageAt_ === 'function' ? jobPageAt_('J-UI') : 1, true);
      },
      /* AND THE ADMIN'S THREE FIGURES ARE ROWS OF IT, AND ITS TILES ARE ON IT. § */
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

    /* ---------- AND SOMEBODY ELSE'S CLASS, WITH SEATS, SEEN BY A FAMILY NOT ON IT § */
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

    /* ---------- AND THE OTHER KIND OF JOINING: A SESSION A FAMILY BOOKED § */
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

    /* ---------- THE PICTURE OF IT, IN A SHEET § */
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

  /* ---------- AND THE MESSAGES COLUMN, WHICH THIS FILE HAS ONLY EVER SEEN EMPTY § */
  dm: [
    /* THE EMPTY COLUMN STAYS ON THE LIST. § */
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
          /* ONE PICTURE AND ONE FILE, because a thread of words alone never drew an attachment and the bubble that holds one is laid out differently — no padding round a § */
          Object.assign(m('m6', true, '', '2026-09-17 08:30', true), { attachments: [
            { url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
              type: 'image/png', name: 'working.png' }] }),
          Object.assign(m('m7', false, 'Here is the mark scheme.', '2026-09-17 09:05', true), {
            attachments: [{ url: 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWx/view',
              type: 'application/pdf', name: 'November 2019 mark scheme.pdf' }] }),
        ];
        /* ---------- AND THE COLUMN POLLS NOW, SO THE SEED HAS TO READ AS FRESH § */
        DM_ASKED = true; DM_DONE = true; MSG_FAILED = false; DM_LAST = Date.now();
        paint('dm');
      },
      expect: () => document.querySelectorAll('#s-dm .msg-bub').length >= 7
                 && document.querySelector('#s-dm .msg-pic img')
                 && document.querySelector('#s-dm .msg-file')
                 && document.querySelector('#s-dm .msg-day')
                 && document.querySelector('#s-dm .msg-text'),
      wants: 'seven bubbles — one a picture, one a file — a day line and a box to reply in' },
    /* ---------- AND AN INBOX, WHICH IS THE STATE THE FAULT WAS IN § */
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
      /* SIX PAGES, NOT SEVEN. § */
      expect: () => pageCount('dm') >= 6,
      wants: 'six conversations, each a page of its own' },

    /* ---------- AND THE STATES THE CHAT POLISH WAS ABOUT § */
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

    /* A REFUSAL AND A SEND IN FLIGHT, which are the two pending shapes `messagesHtml_` draws. § */
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

    /* ---------- A PHOTOGRAPH THE DEPLOYMENT COULD NOT KEEP, AS AN ADMIN READS IT § */
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

    /* THE COMPOSER IN USE: § */
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
      /* EMPTIED AS A PERSON EMPTIES IT, with `input`: § */
      leave: () => {
        delete MSG_QUEUE['P009'];
        const b = document.querySelector('#s-dm .msg-text');
        if (b) { b.value = ''; b.style.height = ''; b.dispatchEvent(new Event('input', { bubbles: true })); }
      } },
  ],
};

/* ---------- NOTIFICATIONS, AS EACH ROLE IS SENT THEM — `notifyCard_` in js/me.js § */
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
    /* ---------- AND THE STORED VISITOR PUT BACK, NOT ONLY THE ONE IN MEMORY § */
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
