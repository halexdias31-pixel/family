#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-funnel.js

   THE FUNNEL, RUN AGAINST THE REAL LIBRARY, ASKED WHETHER ITS QUESTIONS ARE WORTH ASKING.

   WHY THIS EXISTS. `check-flow` proves the app boots and can be pressed. `check-library` proves the
   data file is well formed. Neither can see the fault that actually makes the Find screen feel
   arbitrary, because it is not a crash and not a malformed row — it is a QUESTION THAT DOES NOT
   NARROW ANYTHING, sitting in the funnel looking exactly like a question that does.

   THREE OF THEM HAD ACCUMULATED, AND ALL THREE PASSED TWENTY-TWO GREEN CHECKS:

     `paper` / "Printed?"   `questionItems` wrote `paper: true` on every item and this facet was the
                            only reader. 3,753 answered Printed, 17 answered Digital, and the 17
                            were widgets with no such field. A literal, drawn as a choice.
     `exam_wave`            three spellings of one sitting — "June 2018" from the old import,
                            "First wave"/"Second wave" from the transcriptions. For 2018 the funnel
                            offered both, as separate answers, hiding 151 questions behind whichever
                            one you did not pick.
     `level` vs `stage`     two columns, one meaning, two facets, two different answer sets. Picking
                            A-Level gave you 135 items or 263 depending which question you were
                            asked first.

   THE COMMON SHAPE is that each looked fine in the code and only showed up in the ARITHMETIC over
   real data. So this check does what `whyThisQuestion()` does in the console — builds the real
   items and interrogates the real facets — and fails on the four things that can go wrong.

     node js/check-funnel.js

   IT USES THE REAL `data/questions.json`, not the fixture, on purpose: the fixture has four
   question rows and every fault above needs thousands of rows to become visible. The fixture still
   supplies everything that is not the library, so the non-library facets are measured thin here —
   which is why a thin facet is never a failure below, only a lopsided or incoherent one.
================================================================================================== */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const bad = [];
const note = [];

function loadOrder_() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
  if (!m) { console.error('cannot read window.FILES out of index.html'); process.exit(1); }
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}

function boot(cb) {
  const fixture = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8'));
  const library = LIBRARY;
  const practicals = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'practicals.json'), 'utf8'));
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true,
                                url: 'https://example.org/' });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.requestAnimationFrame = cb2 => setTimeout(() => cb2(Date.now()), 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  w.fetch = (url, o) => {
    const body_ = t => ({ ok: true, status: 200,
      text: () => Promise.resolve(JSON.stringify(t)), json: () => Promise.resolve(t) });
    if (String(url).includes('questions.json')) return Promise.resolve(body_(library));
    /* ---------- AND THE REAL PRACTICALS, WHICH THIS HARNESS HAD NEVER LOADED --------------------
       EVERY OTHER URL FELL THROUGH TO THE FIXTURE, so `data/practicals.json` came back as the
       payload object rather than an array and the practical mapper built nothing. That made this
       file blind to a whole kind: the count below reported `question`, `venue` and `tutor` and did
       not mention the 57 practicals at all, which is exactly the fault it was written to catch.

       A CHECK THAT CANNOT FAIL IS NOT A CHECK, and this one could not have, on the one kind that
       prompted it. Found by reading its own output rather than by trusting that it ran. */
    if (String(url).includes('practicals.json')) return Promise.resolve(body_(practicals));
    /* ---------- AND EVERY OTHER `data/` FILE, WHICH IS THE SAME FAULT TWICE MORE -----------------
       THE PRACTICALS FIX WAS WRITTEN AS ONE LINE FOR ONE FILE and the sentence above says what the
       shape is: every other url fell through to the fixture. Two more files fall through it, and
       both decide what this check measures.

       `data/topics.json` IS THE TOPIC TREE. `topicAreaOf_` is its only reader, so with the fixture
       in its place `DATA.topicTree` is empty, `Topic area` resolves to NOTHING on all 5,119 items,
       and a declared question with 13 answers and 84% coverage was invisible to every rule below.
       Measured both ways: 0 distinct topic areas with the fixture, 13 with the file.

       `data/settings/facets.json` IS THE FUNNEL'S OWN ORDER AND LABELS, and this is the half that
       matters most: **this check has never once measured the funnel the app draws.** The sheet
       relabels `Sitting` back to `Exam wave`, relabels `Company` to `Paper code` over answers that
       are publishers, switches `Year` off, and carries four rows naming fields that were renamed or
       deleted — so it invents `Question number` and `Question part` off the row, and `Type` and
       `Level` lose the positions it means to give them. None of that was visible here.

       SO THE RULE IS THE SHAPE RATHER THAN A THIRD LINE: any `data/**.json` the app asks for is
       served from disk, and the fixture answers only what is not a file. A file added tomorrow is
       loaded tomorrow with nothing here to remember — which is what the one-line-per-file version
       could not promise, and is why it needed fixing three times. */
    const file_ = /(data\/[a-z0-9_\-\/]+\.json)/.exec(String(url));
    if (file_) {
      try {
        return Promise.resolve(body_(JSON.parse(fs.readFileSync(path.join(ROOT, file_[1]), 'utf8'))));
      } catch (e) { /* not a file on disk — the fixture answers below */ }
    }
    if (o && o.body) return Promise.resolve(body_({ success: true }));
    return Promise.resolve(body_(fixture));
  };
  const src = loadOrder_().map(n => fs.readFileSync(path.join(ROOT, 'js', n + '.js'), 'utf8')).join('\n');
  try {
    w.eval(src + '\n;window.__f = { stuffItems, facetList, facetValues, facetCoverage,' +
      ' facetSplit_, nextFacet, FACET_MIN_MINORITY, FACET_MAX_ANSWERS, FACET_MAX_SHOWN, asList_,' +
      ' filterHit, facetOwn_, bucketHas_, bucketDeclares_, STUFF, paperLabels_, stuffHay_, norm,' +
      ' stuffNarrow_, FACET_NEEDS_FIRST, fiveDayLabel_, tagOf_,' +
      /* THE LIST THE APP DRAWS, SORTED, AND THE LAST-RESORT QUESTION -- so 4e can ask what a person
         is shown once a paper is chosen, through the same two functions the screen asks. */
      ' stuffFiltered, overFacet_,' +
      ' chipShow_, qTags_,' +
      ' RETIRED_FACETS, waveOf,' +
      /* A THUNK, NOT THE OBJECT. `load()` ends with `DATA = d` — it REPLACES the payload — so a
         reference captured at eval time is the one from before the settings files landed, and the
         sheet reads as nought rows. Same trap `facetList`'s own memo is keyed against. */
      /* THE TOPIC TREE AND ITS READER, so a rule can ask whether a branch a row was put in is one
         the row can honestly be in. The tree is a thunk for the same reason the facets are. */
      ' topicTree: () => (DATA && DATA.topicTree) || [], topicArea: topicAreaOf_,'
      + ' levelOf: levelOf_, topicAtoms: topicAtoms_, topicIndex: topicIndex_,' +
      ' facetsLive: () => (DATA && DATA.facets) || [], FACETS };');
  } catch (e) {
    bad.push('the app did not load: ' + e.message);
    return cb(null);
  }
  setTimeout(() => cb(w.__f), 1500);
}

/* THE RAW FILE, NOT THE MAPPED ITEMS. `stuffItems` drops every `kind: 'document'` row, and a
   paper-level fact — the code on the cover, the total, the link — lives on exactly those. */
const LIBRARY = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));

/* A value the funnel would draw on a button, reduced to the thing a person would say it is. Two
   answers that differ only by a hyphen, a space or a capital are ONE answer wearing two coats, and
   that is the `Alevel` / `A-Level` fault. */
const norm_ = v => String(v).toLowerCase().replace(/[^a-z0-9]/g, '');

boot(f => {
  if (!f) return done();
  const items = f.stuffItems();
  if (items.length < 100) {
    bad.push('only ' + items.length + ' items were built — the library did not load, and every '
             + 'rule below needs real volume to mean anything');
    return done();
  }
  const facets = f.facetList();

  /* ---------- 0. WHAT THE FIND SCREEN HOLDS IS WHAT THE OWNER SAID IT HOLDS ------------------------
     ASKED FOR AS *"Get rid of booking places ... So finder now will become just learning stuff"* and
     *"Get rid of links that's almost redundant now."* Neither is a question about a number, so the
     rules below could not see either: 127 links and 13 venues answered every facet perfectly well.
     Measured before the change, over the real files, Find's first question read `Booking, Places |
     Learning | Links | Shop`.

     ON THE REAL FILES, WHICH IS WHY IT IS HERE. This harness serves every `data/**.json` the app
     asks for from disk, so a fetch of `data/settings/links.json` that came back would put the 127
     links straight into `items` — the half `check-flow.js`'s inline payload cannot see. And the
     fixture's venue is a production-shaped row now that the fixture sends `kinds: []`.

     A KIND AND A DOOR, NOT A WHITELIST OF DOORS. `Shop` is still a door until its column exists
     (see `shop` in KINDS), and Friends and Paperwork appear for the people they belong to; a list of
     allowed answers would be wrong the day any of those moves. What is refused is what the owner
     named, and a door that is two groups joined by a comma — one chip, which is how `Booking,
     Places` was drawn. */
  const GONE = { venue: 'booking places', link: 'links' };
  const kindsHeld = {};
  items.forEach(x => { kindsHeld[x.kind] = (kindsHeld[x.kind] || 0) + 1; });
  Object.keys(GONE).forEach(k => {
    if (kindsHeld[k]) {
      bad.push(kindsHeld[k] + ' item(s) of kind `' + k + '` are in the list Find draws — the owner asked '
               + 'for ' + GONE[k] + ' to be taken off it. See FUNNEL_NOT_FOR and the note where `link` was '
               + 'in KINDS.');
    }
  });
  const forF = facets.find(x => x.field === 'forLabel');
  const doors = forF ? f.facetValues(items, forF).map(v => String(v.show || v.value)) : [];
  if (!doors.length) bad.push('`What for` draws no answers over ' + items.length + ' items, so the doors '
                              + 'could not be read — not a pass');
  doors.filter(d => /,|^(Links|Places)$/.test(d)).forEach(d => {
    bad.push('Find\'s first question offers "' + d + '" — a door the owner asked to be rid of, or two '
             + 'groups drawn as one chip');
  });
  console.log('\nWHAT FIND HOLDS: ' + Object.keys(kindsHeld).map(k => k + ' ' + kindsHeld[k]).join(' · ')
              + '\n  first question: ' + doors.join(' | '));

  facets.forEach(facet => {
    const vals = f.facetValues(items, facet);
    const cov = f.facetCoverage(items, facet);
    const offered = !facet.collect && vals.length >= 2 && vals.length <= f.FACET_MAX_ANSWERS
                    && cov >= facet.min;

    /* ---------- 1. A QUESTION EVERYBODY ANSWERS THE SAME WAY --------------------------------------
       The `paper` fault. Marked `always` means it is a door rather than a filter — see FACETS —
       and doors are allowed to be lopsided.

       `facetSplit_` IS NOW A SHARE OF THE LIST, not of the tally, and that repair was found by this
       check's own subject rather than by this check. `Key stage` scored 35.4% at a real state of the
       real funnel — five times the floor — and pressing its commonest answer left 1,314 items of
       1,331, because a multi-valued facet counts one item against several answers and the old
       denominator was that count rather than the list. Nothing here changed; the number it reads
       stopped lying. */
    if (offered && !facet.always) {
      const split = f.facetSplit_(items, facet);
      if (split < f.FACET_MIN_MINORITY) {
        bad.push('`' + facet.field + '` (' + facet.label + ') is offered but cannot narrow: '
                 + 'pressing its commonest answer would leave ' + (split * 100).toFixed(2)
                 + '% of the list standing. A question whose obvious answer changes nothing is a '
                 + 'tap that does nothing.');
      }
    }

    /* ---------- 2. ONE ANSWER WEARING TWO COATS ---------------------------------------------------
       The `Alevel` / `A-Level` fault, caught inside a single facet. */
    const seen = {};
    vals.forEach(v => {
      const k = norm_(v.value);
      if (!k) return;
      if (seen[k] && seen[k] !== String(v.value)) {
        bad.push('`' + facet.field + '` offers both "' + seen[k] + '" and "' + v.value
                 + '" — the same answer spelled two ways is two buttons for one thing.');
      }
      seen[k] = String(v.value);
    });

    /* ---------- 3. A FACET FED BY A LITERAL -------------------------------------------------------
       THE GENERAL FORM OF THE `paper: true` FAULT, and the one worth having. A facet whose reader
       returns the same value for every single item is not reading anything — it is reporting a
       constant somebody wrote in code. It cannot be caught by looking at the facet, only by running
       it over real items and noticing that the answer never moves. Skipped where nothing answers at
       all, which is an absent field rather than a hardcoded one. */
    if (vals.length === 1 && cov > 0.9) {
      note.push('`' + facet.field + '` returns "' + vals[0].value + '" for all ' + vals[0].n
                + ' items that answer it — check it is reading a column and not a literal');
    }
  });

  /* ---------- 4. THE SITTING HAS ONE VOCABULARY -------------------------------------------------
     `waveOf` collapses dates, month-names and phase words onto one set of buttons. If a new spelling
     ever reaches the funnel it shows up here as an answer that is not `<series word> <year>`, which
     is what "First wave" was doing for 850 rows while every other check passed.

     THE LIST IS CLOSED RATHER THAN A SHAPE, and that is a repair. The rule used to be the regex
     `^[A-Z][a-z]+ (19|20)\d{2}$` — any capitalised word and a year — so when `seriesOf_` was
     renamed from "June 2017" to "Summer 2017" this check went on passing without noticing that the
     funnel's entire sitting vocabulary had changed underneath it. A shape cannot tell a series word
     from a typo that happens to be capitalised; a list can. Same argument as `VOCAB` in
     check-library.js, and the same one that let `resource_type` sit in it after the rename. */
  const SERIES_WORDS = ['Summer', 'Autumn', 'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
  /* A MONTH WORD AND A YEAR IN ONE STRING — the `June 2024` pill. Read by the card rule in 4 and the
     Paper-answer rule in 4f, so the two cannot disagree about what "fused" means. */
  const MONTHS_LC = SERIES_WORDS.slice(2).map(m => m.toLowerCase());
  const fusedDate_ = s => /\b(19|20)\d{2}\b/.test(String(s))
    && MONTHS_LC.some(m => new RegExp('\\b' + m + '\\b', 'i').test(String(s)));
  /* ---------- THE SITTING IS TWO QUESTIONS NOW, SO THE RULE IS THREE ------------------------------
     REPORTED AS "some tags are like summer 2018 when it should just be summer then 2018", and
     `examWave` was split into `examSeries` and `examYear` over one reader, `sittingOf_`. THEN THE
     SEASON WENT: "I don't want it to ask summer or autumn I'd rather it just do the months. Like may
     or November" -- so it is `examYear` and then `examMonth`, the year first, as the outer folder.
     The closed vocabulary is asked of each at the place it can go wrong:

       `waveOf`       over the items, every answer `<series> <year>` -- the source the year is cut
                      from, and where `First wave` sat on 850 rows. Read off the reader rather than
                      off a facet, so a bucket can never be mistaken for a spelling. It still says
                      `Summer 2017`, because that is the bundle's TITLE word; it is no longer asked.
       `examMonth`    a month name and nothing else. `Summer` here is the season the owner asked to
                      be rid of, back as an answer.
       `examYear`     a four-digit year and nothing else, through `facetOwn_` (the column) and not
                      through the drawn answers, which are year PAIRS by design.

     AND THE OLD FACETS MUST BE OFF THE FUNNEL. A row naming `examWave` would put `Summer 2018` back
     beside them, and one naming `examSeries` would put `Summer` beside `May` and `June`. */
  const smonth = facets.find(x => x.field === 'examMonth');
  const syear = facets.find(x => x.field === 'examYear');
  ['examWave', 'examSeries'].forEach(old => {
    if (facets.find(x => x.field === old)) {
      bad.push('`' + old + '` is still a live question: the sitting is asked as `examYear` then '
               + '`examMonth`, and a third question offers "Summer" or "Summer 2018" again');
    }
  });
  if (!smonth || !syear) {
    bad.push('the sitting is not asked as two questions — `examYear` ' + (syear ? 'is' : 'is NOT')
             + ' live and `examMonth` ' + (smonth ? 'is' : 'is NOT') + ' — so "2018 then June" '
             + 'has nothing to measure: not a pass');
  } else if (!syear.folder || !smonth.folder) {
    bad.push('`examYear` and `examMonth` must both be `folder: true` -- asked even with one answer, '
             + 'the way the owner opens a year folder that holds one paper. See nextFacet().');
  } else if (f.facetOwn_ && f.waveOf) {
    const waves = {}, monthsSeen = {}, yearsSeen = {};
    let dated = 0, monthless = 0;
    const lost = {}, clash = {}, fusedTag = {}, unsplit = {}, tagsRead = {};
    items.forEach(x => {
      const w = String(f.waveOf(x) || '');
      if (w) waves[w] = 1;
      const ms = f.facetOwn_(smonth, x).filter(Boolean);
      const ys = f.facetOwn_(syear, x).filter(Boolean);
      ms.forEach(v => { monthsSeen[String(v)] = 1; });
      ys.forEach(v => { yearsSeen[String(v)] = 1; });
      if (ys.length) {
        dated++;
        if (!ms.length) { monthless++; lost[(x.row && x.row.paper_id) || x.id || '?'] = 1; }
        /* THE CARD AND THE FOLDER SAY THE SAME MONTH. The card's sitting tag is cut from the paper's
           name; the Month answer once read the date column first, and ten AQA papers said `June 2024`
           on the card and sat in the `May` folder. */
        /* ---------- AND THE CARD SAYS THEM AS TWO TAGS, THE WAY THE FOLDERS ASK THEM --------------
           REPORTED AS *"Fix this why it say June and year in same chip"*: the sitting was ONE pill,
           `June 2024`, under a funnel that asks Year and then Month. So the card's tags are read
           here as the two folders read them -- a year tag that is the Year answer, a month tag that
           is the Month answer -- and no tag of any colour may carry a month word and a year at once.
           THE OLD READ WAS A REGEX FOR THE FUSED PILL, and with the pill split it would match nothing
           and pass silently: the clash rule would have gone on printing green over cards it no
           longer read. So the split is asserted, not assumed: a dated card with no month tag is a
           failure of its own. */
        if (ms.length && f.qTags_) {
          const id = (x.row && x.row.paper_id) || x.id || '?';
          if (!tagsRead[id]) {
            tagsRead[id] = 1;
            const tags = f.qTags_(x) || [];
            tags.forEach(t => { if (fusedDate_(t.text)) fusedTag[id] = (t.tag || 'plain') + ' "' + t.text + '"'; });
            const sit = tags.filter(t => t.tag === 'sitting').map(t => String(t.text));
            const mTag = sit.find(t => MONTHS_LC.indexOf(t.split(/\s+/).pop().toLowerCase()) !== -1);
            const yTag = sit.find(t => /^(19|20)\d{2}$/.test(t));
            if (!mTag || !yTag) unsplit[id] = sit.join(' + ') || '(no sitting tag)';
            const mWord = mTag ? mTag.split(/\s+/).pop() : '';
            if (mWord && ms.indexOf(mWord) === -1) clash[id] = mWord + ' / ' + ms[0];
            if (yTag && ys.indexOf(yTag) === -1) clash[id] = yTag + ' / ' + ys[0];
          }
        }
      }
    });
    const clashes = Object.keys(clash);
    if (clashes.length) {
      bad.push(clashes.length + ' paper(s) whose card says one month or year and whose folder says '
               + 'another (card / folder): ' + clashes.slice(0, 6).map(k => k + ' ' + clash[k]).join(', ')
               + ' — a paper is filed under the month it prints. See sittingMonth_().');
    }
    const fusedIds = Object.keys(fusedTag);
    if (fusedIds.length) {
      bad.push(fusedIds.length + ' card(s) carry a tag holding a month and a year together: '
               + fusedIds.slice(0, 6).map(k => k + ' ' + fusedTag[k]).join(', ')
               + ' — the funnel asks Year and then Month, so the card says them as two tags. See qTags_.');
    }
    const unsplitIds = Object.keys(unsplit);
    if (unsplitIds.length) {
      bad.push(unsplitIds.length + ' dated card(s) do not show the year and the month as two sitting tags: '
               + unsplitIds.slice(0, 6).map(k => k + ' ' + unsplit[k]).join(', ') + '. See sittingParts_.');
    }
    console.log('  Card sitting tags: ' + Object.keys(tagsRead).length + ' dated paper(s) read as a year tag '
                + 'and a month tag; ' + fusedIds.length + ' fused');
    const oddWave = Object.keys(waves).filter(v => {
      const m = /^([A-Za-z]+) ((?:19|20)\d{2})$/.exec(v);
      return !m || SERIES_WORDS.indexOf(m[1]) === -1;
    });
    if (oddWave.length) {
      bad.push('`waveOf` gives ' + oddWave.length + ' sitting(s) that are not "<series> <year>", '
               + 'where <series> is one of ' + SERIES_WORDS.join('/') + ': '
               + oddWave.slice(0, 6).map(v => '"' + v + '"').join(', ')
               + ' — a second spelling of a sitting splits it into two buttons and hides half the '
               + 'questions behind whichever one nobody picks. See waveOf().');
    }
    const MONTHS = SERIES_WORDS.slice(2);
    const oddMonth = Object.keys(monthsSeen).filter(v => MONTHS.indexOf(v) === -1);
    if (oddMonth.length) {
      bad.push('the Month question offers ' + oddMonth.length + ' answer(s) that are not a month: '
               + oddMonth.slice(0, 6).map(v => '"' + v + '"').join(', ')
               + ' — the owner asked for May and November, never Summer or Autumn. See sittingMonth_().');
    }
    const oddYear = Object.keys(yearsSeen).filter(v => !/^(19|20)\d{2}$/.test(v));
    if (oddYear.length) {
      bad.push('the Year question offers ' + oddYear.length + ' answer(s) that are not a year: '
               + oddYear.slice(0, 6).map(v => '"' + v + '"').join(', ') + '. See sittingOf_().');
    }
    /* A PAPER WITH A YEAR AND NO MONTH IS IN THE YEAR FOLDER AND IN NO MONTH FOLDER INSIDE IT, so the
       Month question would hide it behind whichever month somebody tapped. Every paper here prints
       its month on its cover, so the count should be nought -- and a count is printed either way. */
    console.log('  Month: ' + Object.keys(monthsSeen).length + ' month(s) over ' + dated
                + ' dated item(s); ' + monthless + ' with a year and no month');
    if (monthless) {
      bad.push(monthless + ' item(s) have a sitting year and no month, so the Month folder hides them: '
               + Object.keys(lost).slice(0, 6).join(', ') + ' — give the paper a `month` or an '
               + '`exam_date`, or a name ending "— May 2017". See sittingMonth_().');
    }
    if (!Object.keys(monthsSeen).length || !Object.keys(yearsSeen).length) {
      bad.push('nothing in the library answers the Month or the Year question — '
               + Object.keys(monthsSeen).length + ' months, ' + Object.keys(yearsSeen).length
               + ' years — so this rule proves nothing');
    }
  } else {
    bad.push('`facetOwn_` or `waveOf` is not declared, so the sitting vocabulary cannot be read off '
             + 'the column — not a pass');
  }

  /* ---------- 4a. YEAR, MONTH, PAPER -- ASKED LIKE FOLDERS, EVEN WITH ONE INSIDE ---------------------
     ASKED FOR AS *"I want it to ask for the year even if there's only one year's worth of the paper
     ... Like when I'm in my gdrive folder finding the stuff it felt simple and I would have to select
     the year of the folder even if there was only one option."* Every other question is skipped
     with one answer, and the rule that skips them is right for them -- so this one walks the real
     funnel, through `nextFacet`, to the places where a folder holds exactly one thing, and requires
     the folder to be asked anyway. Found, not named: a level whose maths past papers are one year,
     and a month that holds one paper, so a library that grows a second KS1 year moves the walk to
     whatever is single then. And if nothing in the library is single, that is said, not passed. */
  if (f.nextFacet && f.stuffNarrow_ && smonth && syear) {
    const MATHS_PAST = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Questions' },
                        { field: 'subject', value: 'Maths' }, { field: 'documentType', value: 'Past paper' }];
    const was = f.STUFF.filters.slice();
    const asks = chips => {
      f.STUFF.filters = chips.slice();
      const facet = f.nextFacet(f.stuffNarrow_(items, chips, [], null));
      return facet ? facet.field : '(nothing)';
    };
    const valuesAt = (chips, facet) => {
      f.STUFF.filters = chips.slice();
      return f.facetValues(f.stuffNarrow_(items, chips, [], null), facet);
    };
    const paperF = facets.find(x => x.field === 'paperId');
    let walked = 0;
    try {
      const levelF = facets.find(x => x.field === 'level');
      const levels = levelF ? valuesAt(MATHS_PAST, levelF).filter(v => !v.bucket) : [];
      levels.forEach(lv => {
        const at = MATHS_PAST.concat([{ field: 'level', value: lv.value }]);
        const years = valuesAt(at, syear);
        if (years.length !== 1 || years[0].bucket) return;
        /* Tier and anything else the level still splits on come first, as a thumb would meet them. */
        let chips = at.slice();
        for (let i = 0; i < 6 && asks(chips) !== 'examYear'; i++) {
          const q = asks(chips);
          const facet = facets.find(x => x.field === q);
          const v = facet && valuesAt(chips, facet)[0];
          if (!v) break;
          chips = chips.concat([{ field: q, value: v.value, bucket: v.bucket }]);
        }
        walked++;
        const steps = [['examYear', syear], ['examMonth', smonth], ['paperId', paperF]];
        steps.forEach(([field, facet]) => {
          const got = asks(chips);
          if (got !== field) {
            bad.push(lv.value + ' maths past papers: the funnel asks `' + got + '` where the `' + field
                     + '` folder belongs -- ' + valuesAt(chips, facet).length + ' answer(s) in it, and '
                     + 'a folder is asked even with one. See `folder` and nextFacet().');
          }
          const v = facet && valuesAt(chips, facet)[0];
          if (v) chips = chips.concat([{ field: field, value: v.value, bucket: v.bucket }]);
        });
      });
      /* AND A MONTH THAT HOLDS ONE PAPER, which is the Paper folder asked with one answer. */
      const tierF = facets.find(x => x.field === 'tier');
      const gcse = MATHS_PAST.concat([{ field: 'level', value: 'GCSE' }]);
      const single = [];
      (tierF ? valuesAt(gcse, tierF) : []).forEach(t => {
        const at = gcse.concat([{ field: 'tier', value: t.value }]);
        const ys = valuesAt(at, syear);
        ys.filter(y => !y.bucket).forEach(y => {
          const ay = at.concat([{ field: 'examYear', value: y.value }]);
          valuesAt(ay, smonth).forEach(m => {
            const am = ay.concat([{ field: 'examMonth', value: m.value }]);
            if (paperF && valuesAt(am, paperF).length === 1) single.push(am);
          });
        });
      });
      if (single.length) {
        walked++;
        const got = asks(single[0]);
        if (got !== 'paperId') {
          bad.push('one paper in ' + single[0].slice(-3).map(c => c.value).join(' · ') + ' and the funnel '
                   + 'asks `' + got + '` instead of the Paper folder that holds it. See nextFacet().');
        }
      }
    } finally { f.STUFF.filters = was; }
    console.log('  Folders: ' + walked + ' single-answer walk(s) through Year, Month and Paper');
    if (!walked) {
      bad.push('nothing in the library is a year folder or a month folder holding one thing, so the '
               + 'folder rule has nothing to measure: not a pass');
    }
  }

  /* ---------- 4b. TWO ANSWERS, ONE LABEL --------------------------------------------------------
     `shortLabels_` DRAWS THE SHORTEST FORM OF A NAME THAT IS STILL UNIQUE — `Paper 1` rather than
     `Paper 1 (Non-Calculator) — May 2017` once the funnel has already asked which sitting. It
     chooses that rung by testing uniqueness itself, so this cannot fire on the code's own facets,
     and it is here for the same reason test 2 is kept: a `facets` row can invent a question at
     runtime over any column, and every one of those goes through the same shortening.

     THE COST OF BEING WRONG IS THE WHOLE POINT. Two papers on one button is not a cosmetic fault —
     the row's `data-value` is the FULL name, so two rows reading `Paper 1` would send you to
     whichever one you happened to press with nothing on screen saying the other existed. That is
     the `Alevel` / `A-Level` fault with the spelling hidden instead of shown. */
  facets.forEach(facet => {
    if (facet.collect) return;
    const seen = {};
    f.facetValues(items, facet).forEach(v => {
      const label = String(v.show === undefined ? v.value : v.show);
      if (seen[label] && seen[label] !== v.value) {
        bad.push('`' + facet.field + '` draws two different answers with the same label "' + label
                 + '": ' + JSON.stringify(seen[label]) + ' and ' + JSON.stringify(v.value)
                 + ' — one of them is unreachable, and nothing on screen says so. See shortLabels_.');
      }
      seen[label] = v.value;
    });
  });

  /* ---------- 4c. AN ANSWER MUST RETURN WHAT ITS OWN ROW PROMISED -------------------------------
     THE ONE INVARIANT THAT TIES THE DRAWER TO THE FILTER, and the only rule here that would have
     caught any of the last three faults on its own.

     EVERY ANSWER ROW IS A PROMISE. `facetValues` says "Paper 1, 31 questions" and draws a row; the
     chip that row creates goes through `filterHit`, which matches a completely different way — on
     `spellKey_`, or on numeric membership for a band. **Nothing had ever checked that the two agree**,
     and three separate mechanisms now sit between them:

       `spellShow_`    the chip holds the spelling that was drawn, the row holds whatever the sheet
                       says — `1st Class Maths` against `1stclassmaths`
       `shortLabels_`  the row's TEXT is shortened and its `data-value` is not
       `bucketValues_` the answer is `11–20`, `Heavyweight` or `C–F`, and no row anywhere holds
                       that string — it is a GROUP, matched by membership

     EACH ONE IS A CHANCE FOR A CHIP TO FIND NOTHING, silently — the list empties, the screen says
     "Nothing matches", and no error is thrown anywhere. Proved on the last of them: removing the
     band branch from `filterHit` makes pressing `11–20` return **0 questions where the row
     promised 15**, and every other check in this suite still passed.

     AND IT CAUGHT THE GROUPING'S OWN FIRST VERSION. `bucketValues_` summed the answer counts into
     each bucket, and `facetTally_` counts an item once per ANSWER — so a question tagged `Loci`
     and `Nets`, both inside `L–O`, was counted twice there: the row promised 723 and pressing it
     returned 646. The recount goes over the items through `bucketHas_` now.

     CHECKED AT TWO STATES, because a bug here is about a value, not about a state: the whole
     library, and one paper deep, where the bands and the short labels actually appear. */
  const promises = (label, list) => {
    facets.forEach(facet => {
      if (facet.collect) return;
      f.facetValues(list, facet).forEach(v => {
        /* ---------- PRESSED THE WAY THE APP PRESSES IT, WHICH NOW INCLUDES `bucket` ------------
           `facet-pick` READS `data-bucket` OFF THE ROW and puts it on the chip, because `filterHit`
           has to test membership for a bucket and equality for a leaf. A harness that presses
           without it is pressing something the app never sends: this reported `1-10` returning 0
           of a promised 14 the moment `bucketValues_` landed, which is the harness being wrong
           about the press rather than the app being wrong about the answer. The flag is carried
           from the value that drew the row, so the two cannot disagree. */
        const got = list.filter(x => f.filterHit(x,
          { field: facet.field, value: v.value, bucket: v.bucket })).length;
        if (got !== v.n) {
          bad.push('`' + facet.field + '` draws the answer "' + (v.show || v.value) + '" saying it '
            + 'holds ' + v.n + ' item(s) ' + label + ', and pressing it returns ' + got
            + ' — the row and `filterHit` disagree, so that chip empties the list with nothing '
            + 'on screen saying why. See shortLabels_, spellShow_ and bucketValues_.');
        }
      });
    });
  };
  promises('in the whole library', items);
  const onePaper = items.filter(x => x.row && x.row.paper_id === 'P-1MA1-1705-1H');
  if (onePaper.length) promises('inside one paper', onePaper);

  /* ---------- 4d. AND AN ANSWER INSIDE A BUCKET, PRESSED THROUGH THE WHOLE CHAIN -------------------
     4c PRESSES EACH ANSWER ON ITS OWN, over the list it was drawn from, and that is blind to the one
     thing a SECOND chip on a field does: `stuffNarrow_` stands the bucket down once the answer inside
     it arrives, so the inner answer is then tested against everything the earlier chips kept, not
     against the ten it was opened inside. FOUND WALKING ONE WORKSHEET: `1–10` opened onto `1`,
     `2–3`, ..., the `1` row promised 2 and pressing it showed 11 -- 1 and 10 to 19, because the
     inner rows were cut by the alphabet and read back as a prefix. 4c passed, because inside the
     ten, `1` really does hold two.
     SO THIS PRESSES THEM THE WAY A THUMB DOES: the bucket as a chip, then each answer drawn inside
     it as the next chip, through `stuffNarrow_` over everything -- and the count has to be the one
     the inner row said. Over the whole library and over one paper, the same two states as 4c. */
  let chained = 0;
  const chains = (label, base, doors) => {
    const was = f.STUFF.filters.slice();
    try {
      facets.forEach(facet => {
        if (facet.collect) return;
        /* ONLY WHERE THE FUNNEL WOULD ASK IT. `Day` over the whole library is every 5-a-day in seven
           months, which nobody is ever shown -- `FACET_NEEDS_FIRST` holds it behind Month -- and its
           weeks then hold forty-nine days apiece. A state no thumb can reach is not a promise. */
        const first = (f.FACET_NEEDS_FIRST || {})[facet.field];
        if (first && !doors.some(d => d.field === first)) return;
        f.STUFF.filters = doors.slice();
        f.facetValues(base, facet).filter(v => v.bucket).forEach(b => {
          const outer = doors.concat([{ field: facet.field, value: b.value, bucket: true }]);
          f.STUFF.filters = outer.slice();
          const inside = f.stuffNarrow_(items, outer, [], null);
          f.facetValues(inside, facet).forEach(v => {
            const chain = outer.concat([{ field: facet.field, value: v.value, bucket: v.bucket }]);
            const got = f.stuffNarrow_(items, chain, [], null).length;
            chained++;
            if (got !== v.n) {
              bad.push('`' + facet.field + '` opens "' + b.value + '" ' + label + ' onto "'
                + (v.show || v.value) + '", which says it holds ' + v.n + ' item(s), and pressing '
                + 'it there returns ' + got + ' — the bucket above it stands down once the answer '
                + 'inside it arrives, so that answer has to mean the same thing on its own. See '
                + 'bucketLabels_ and stuffNarrow_.');
            }
            f.STUFF.filters = outer.slice();
          });
        });
      });
    } finally { f.STUFF.filters = was; }
  };
  if (f.stuffNarrow_) {
    chains('in the whole library', items, []);
    /* ---------- AND NOT INSIDE ONE PAPER ANY MORE, WHICH IS SAID RATHER THAN SKIPPED ---------------
       THIS PRESSED THE QUESTION NUMBERS INSIDE `P-1MA1-1705-1H` -- `1–10`, then `1–2`, then `1` --
       and they were the only buckets a paper ever had. The owner retired both questions (*"no more
       asking for questions 1-10 or question part 1 or b."*) and a paper now ends the funnel (see
       `FACET_ENDS`), so inside one paper there is nothing to press. That is asserted in 4e below
       rather than assumed here: this line only says why the second state is gone. */
    console.log('  ' + chained + ' answer(s) pressed inside their bucket, through the whole chain'
                + ' (none inside one paper: a paper ends the funnel, see 4e)');
    if (!chained) bad.push('no answer was drawn inside any bucket, so the chain rule proves nothing');
  } else {
    bad.push('`stuffNarrow_` is not declared, so an answer inside a bucket cannot be pressed — not a pass');
  }

  /* ---------- 4e. AFTER PAPER, THE PAPER -- ITS QUESTIONS, IN ORDER, AND NOTHING MORE ASKED ------------
     ASKED FOR AS *"no more asking for questions 1-10 or question part 1 or b."* Before it, GCSE ·
     Foundation · 2024 · June · Paper 1 went on to `1–10 | 11–20 | 21–30`, then `1–2 | 3–4 | …`, then
     `1 | 2`. Three halves, each one a way it can come back:

       THE QUESTIONS ARE NOT LIVE.  `qNumber` and `qPart`, and the row's own spellings `question` and
                                   `part`, must not be in `facetList()` -- a sheet row switched back on
                                   is refused by `RETIRED_FACETS`, and this is what says so if that goes.
       NOTHING IS ASKED.           EVERY paper, reached the way a thumb reaches it -- Year, Month, then
                                   Paper -- asks nothing more, through `nextFacet` and the last resort
                                   both. Measured with only the two retired: 495 of 496 asked nothing
                                   and one asked `What you need`. That one is why `FACET_ENDS` exists.
       IT IS THE WHOLE PAPER, IN ORDER.  The drawn list holds every question of that paper and nothing
                                   else, question numbers never going backwards -- which is what makes
                                   it safe to stop asking: the order IS the question number. */
  ['qNumber', 'qPart', 'question', 'part'].forEach(old => {
    if (facets.find(x => x.field === old)) {
      bad.push('`' + old + '` is a live question again — the owner asked for "no more asking for '
               + 'questions 1-10 or question part 1 or b." See RETIRED_FACETS.');
    }
  });
  if (f.stuffFiltered && f.nextFacet && syear && smonth) {
    const was = { q: f.STUFF.q, filters: f.STUFF.filters.slice() };
    const byPaper = {};
    items.forEach(x => { const id = x.row && x.row.paper_id; if (id && x.kind === 'question') (byPaper[id] = byPaper[id] || []).push(x); });
    const after = {}, out = [];
    let walkedP = 0;
    try {
      Object.keys(byPaper).forEach(id => {
        const one = byPaper[id][0];
        const y = f.facetOwn_(syear, one)[0], m = f.facetOwn_(smonth, one)[0];
        f.STUFF.q = '';
        f.STUFF.filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Questions' }]
          .concat(y ? [{ field: 'examYear', value: y }] : [])
          .concat(m ? [{ field: 'examMonth', value: m }] : [])
          .concat([{ field: 'paperId', value: id }]);
        const list = f.stuffFiltered();
        walkedP++;
        const next = f.nextFacet(list) || (f.overFacet_ && f.overFacet_(list));
        if (next) {
          after[next.field] = (after[next.field] || 0) + 1;
          if (out.length < 6) out.push(id + ' asks `' + next.field + '`: ' + f.facetValues(list, next)
            .map(v => (v.show || v.value) + ' ' + v.n).join(' | '));
        }
        const want = byPaper[id].length;
        if (list.length !== want || list.some(x => !x.row || x.row.paper_id !== id)) {
          bad.push(id + ': choosing the paper draws ' + list.length + ' item(s) where the paper has ' + want
                   + ' question(s) — after Paper the list is the paper, whole');
        }
        for (let i = 1; i < list.length; i++) {
          const a = Number(list[i - 1].qNumber), b = Number(list[i].qNumber);
          if (isFinite(a) && isFinite(b) && b < a) {
            bad.push(id + ': question ' + list[i].qNumber + ' is drawn after question ' + list[i - 1].qNumber
                     + ' — the paper\'s own order is the only thing left to find a question by. See stuffSorted_.');
            break;
          }
        }
      });
    } finally { f.STUFF.q = was.q; f.STUFF.filters = was.filters; }
    const askedAfter = Object.keys(after);
    if (askedAfter.length) {
      bad.push(askedAfter.map(k => after[k] + ' paper(s) ask `' + k + '`').join(', ') + ' once the paper '
               + 'is chosen — after Paper the list is the answer. See FACET_ENDS. ' + out.join('; '));
    }
    console.log('  After Paper: ' + walkedP + ' paper(s) chosen through Year and Month; '
                + (askedAfter.length ? askedAfter.length + ' question(s) still asked' : 'nothing more asked')
                + ', each the whole paper in question order');
    if (walkedP < 100) bad.push('only ' + walkedP + ' paper(s) could be chosen, so the after-Paper rule '
                                + 'measures almost nothing — not a pass');
  } else {
    bad.push('`stuffFiltered` or `nextFacet` is not declared, or the sitting is not two questions, so what '
             + 'follows Paper cannot be read — not a pass');
  }

  /* ---------- 5. TWO FACETS, ONE MEANING --------------------------------------------------------
     The `level` / `stage` fault ACROSS facets: two questions offering the same answer word but
     landing on different result sets. Reported rather than failed — two facets legitimately share a
     word sometimes (a `Tier` of "A-Level" and a `Level` of "A-Level" are arguably both true) — but
     a person should look, because it is how "which one did I answer?" starts. */
  const answers = {};
  facets.forEach(facet => {
    if (facet.collect) return;
    f.facetValues(items, facet).forEach(v => {
      /* ---------- A RANGE IS NOT A NAME ----------------------------------------------------------
         THE MOMENT `bucketValues_` LANDED THIS NAMED FOUR LETTER RANGES: `2-B` is an answer to Topic
         and to Paper, `M-P` to Paper and to Category. That is arithmetic rather than ambiguity --
         the two questions index two different alphabets and the endpoints coincide -- where the
         four real findings under it are one WORD carrying two meanings, which is what somebody can
         act on. Buckets are skipped by the flag the row carries, the same way the paper test tells
         a shelf from a book. (It is still worth knowing that the Paper index and the Topic index
         read alike over the 1st Class Maths worksheets, because those sheets are NAMED after their
         topic -- a fact about the library, and written up rather than reported every run.) */
      if (v.bucket) return;
      const k = norm_(v.value);
      if (!k) return;
      (answers[k] = answers[k] || []).push({ field: facet.field, value: v.value, n: v.n });
    });
  });
  Object.keys(answers).forEach(k => {
    const hits = answers[k];
    if (hits.length < 2) return;
    const counts = hits.map(h => h.n);
    if (Math.min.apply(null, counts) === Math.max.apply(null, counts)) return;  /* same set, fine */
    note.push('"' + hits[0].value + '" is an answer to ' + hits.length + ' different questions with '
              + 'different result sets: '
              + hits.map(h => h.field + ' (' + h.n + ')').join(', '));
  });

  /* ---------- 6. WHAT THE SEARCH BOX CAN SEE, PER KIND -----------------------------------------
     `stuffFind`'s HAYSTACK IS `name + sub + subject + slot + grade + text`, and `text` is the only
     one of those that holds a thing's own WORDS. Everything else is a label. So a kind whose items
     carry no `text` is findable by its title and by nothing else — which is a whole department of
     the app that the search box cannot reach, and it does not throw, fail or look wrong anywhere.

     MEASURED THE DAY THE PRACTICAL GUIDES WENT IN: **0 of the 57 practicals had one.** `goggles`,
     `thermistor`, `nichrome`, `foil`, `tray` and `limiting reactant` each returned nothing, with
     every one of those words sitting in the row. The words that did hit — `bicarbonate`, `trundle`
     — hit the NAME, which is a coincidence rather than a search.

     PRINTED, NOT FAILED, and that is the `figure` argument rather than laziness: a boxer's card is
     a record with no prose on it, and demanding a haystack of one would mean inventing words to
     satisfy a checker. What the number is for is the OTHER direction — a kind that has words and
     stops shipping them, which is exactly how this was found and is the shape
     `papers checked against a total` going 34 to 2 under a green tick already records. */
  const byKind = {};
  items.forEach(x => {
    const k = x.kind || '(none)';
    const b = byKind[k] = byKind[k] || { n: 0, withText: 0, chars: 0 };
    b.n++;
    if (x.text && String(x.text).trim()) { b.withText++; b.chars += String(x.text).length; }
  });
  console.log('\nWHAT THE SEARCH BOX CAN SEE — items whose own words are in the haystack:');
  Object.keys(byKind).sort((a, b) => byKind[b].n - byKind[a].n).forEach(k => {
    const b = byKind[k];
    console.log('  ' + k.padEnd(12) + String(b.withText).padStart(5) + ' of ' + String(b.n).padEnd(6)
      + (b.withText ? ' (' + Math.round(b.chars / b.withText) + ' chars each)'
                    : ' — findable by its name and nothing else'));
  });

  /* ---------- 6b. THE CODE PRINTED ON THE COVER HAS TO FIND THE PAPER --------------------------
     A TUTOR HOLDING THE PAPER TYPES WHAT IS PRINTED ON IT. Measured on the real library before
     `paperCodeAtoms_` existed: `1MA1` returned 0 of 794, `8464` returned 0 of 157 and `8464/B/1H`
     returned 0 of 27 — three codes that are on the front of the paper AND in a cell on every row
     under it. Fourth occurrence of this file's own sentence, after `topics`, after `company` and
     after the practical guides.

     THIS ONE FAILS RATHER THAN PRINTING, because it is wiring rather than a backlog. A paper that
     HAS a `spec_code` either answers to it or something between that cell and the haystack has
     come undone, and the question has one right answer. The papers with NO code are the backlog
     and are counted below instead.

     THROUGH `stuffHay_` AND `norm`, which is the pair `stuffFind` itself uses — asking the search
     the way the box asks it rather than re-implementing the match, which is how a check ends up
     green over a broken screen. */
  const docCode = {};
  LIBRARY.forEach(r => {
    if (!r || r.kind !== 'document' || !r.paper_id) return;
    const c = String(r.spec_code || '').trim();
    if (c) docCode[r.paper_id] = c;
  });
  const codeOf = {};
  items.forEach(x => {
    const r = x.row || {};
    if (!r.paper_id) return;
    const c = String(r.spec_code || '').trim() || docCode[r.paper_id] || '';
    if (c) codeOf[r.paper_id] = c;
  });
  const unreachable = [];
  Object.keys(codeOf).forEach(pid => {
    const want = f.norm(codeOf[pid]).split(/\s+/).filter(Boolean);
    const hit = items.filter(x => x.row && x.row.paper_id === pid
      && want.every(w => f.stuffHay_(x).includes(w)));
    if (!hit.length) unreachable.push(pid + ' prints `' + codeOf[pid] + '` and typing it finds '
      + 'none of its rows');
  });
  unreachable.slice(0, 10).forEach(u => bad.push(u));
  if (unreachable.length > 10) bad.push('… and ' + (unreachable.length - 10) + ' more papers '
    + 'whose own code does not find them');

  /* THE BACKLOG, PRINTED. A worksheet has no exam code to carry and correctly has none; what this
     number is for is the papers that DO have one printed on them and no cell holding it — the
     Edexcel maths papers filed under `RS…` serials, and the AQA Religious Studies ones. One
     `spec_code` cell each and they join the rule above with nothing here to change. */
  const papers = {};
  items.forEach(x => {
    const r = x.row || {};
    if (!r.paper_id || x.kind !== 'question') return;
    papers[r.paper_id] = papers[r.paper_id] || {
      code: String(r.spec_code || '').trim() || docCode[r.paper_id] || '',
      board: r.exam_board || '', subject: r.subject || '' };
  });
  const ids = Object.keys(papers);
  const coded = ids.filter(p => papers[p].code
    || String(p).split(/[^A-Za-z0-9]+/).some(g => g.length >= 4 && g.length <= 8
        && /[A-Za-z]/.test(g) && /\d/.test(g)));
  console.log('\nPAPERS FINDABLE BY THE CODE ON THEIR COVER: ' + coded.length + ' of ' + ids.length
    + ' — the rest carry no code in any column, which is right for a worksheet and a backlog '
    + 'for an exam paper');

  /* ---------- 6c. A PAPER-LEVEL FACT HAS TO REACH EVERY QUESTION UNDER IT -----------------------
     "YOU MUST NOT USE A CALCULATOR" IS PRINTED ON A COVER AND IS TRUE OF ALL 41 QUESTIONS INSIDE,
     which is why `needs` sits on the `kind: 'document'` row rather than being copied onto every
     question — `needsOf_`'s own note says so, and CLAUDE.md records the denormalisation hazard the
     copy would be.

     MEASURED, AND IT WAS NOT REACHING THEM: `needsIndex_` was handed `DATA.questions`, and
     `libraryInto_` drops every row whose `active` cell is not on — so the map held 174 of the file's
     691 document rows. 77 of the 128 papers with a `needs` cell are marked inactive, seven of those
     have questions under them, and **247 questions never said whether a calculator was allowed**:
     the whole June 2024 Edexcel series, both tiers, Papers 1, 2 and 3, plus June 2023 Higher 1. On
     Foundation Paper 1, 15 of the 41 cards drew `Printed sheet` and nothing else, so the strip was
     present and read as complete — worse than a silence.

     THIS IS THE THIRD FUNCTION TO GET THAT WRONG. `specIndex_` and `paperLabels_` were each repaired
     for it, each with a paragraph explaining why, and the three lines were written out twice — so a
     third copy was the third. They all go through `libDocRows_` now, and this is the rule that would
     have caught the next one.

     A FAILURE RATHER THAN A COUNT, and rule 6b's own sentence is why: a paper that HAS the cell
     either reaches its questions or something between the cell and the card has come undone, and
     the question has exactly one right answer. A paper with no `needs` cell is the backlog and is
     printed below.

     ON THE ITEMS, THROUGH `asList_`, which is what `questionCard_` reads — asking the property
     rather than the mechanism, so it holds however the index is built. A test on `needsIndex_`'s
     arguments would pass on a version that took the file and ignored it. */
  const docNeeds = {};
  LIBRARY.forEach(r => {
    if (!r || r.kind !== 'document' || !r.paper_id) return;
    const n = String(r.needs || '').trim();
    if (n) docNeeds[r.paper_id] = n;
  });
  /* THE PAPERS THE FUNNEL ACTUALLY HOLDS QUESTIONS FOR -- a document row with nothing under it yet
     is the transcription queue and has no card for a requirement to be missing from. */
  const withQs = {};
  items.forEach(x => {
    if (x.kind === 'question' && x.row && x.row.paper_id) withQs[x.row.paper_id] = 1;
  });
  const missedNeeds = [];
  let needsChecked = 0;
  Object.keys(docNeeds).forEach(pid => {
    const mine = items.filter(x => x.kind === 'question' && x.row && x.row.paper_id === pid);
    if (!mine.length) return;
    needsChecked += mine.length;
    const want = f.asList_(String(docNeeds[pid]).split(','));
    const short = mine.filter(x => {
      const got = f.asList_(x.needs).map(v => String(v).toLowerCase());
      return !want.every(w => got.indexOf(String(w).toLowerCase()) !== -1);
    });
    if (short.length) missedNeeds.push(pid + ' declares `' + docNeeds[pid] + '` on its cover and '
      + short.length + ' of its ' + mine.length + ' questions do not carry it');
  });
  if (typeof f.asList_ !== 'function') {
    bad.push('`asList_` is not declared, so a paper\'s own requirements cannot be checked \u2014 not a pass');
  } else {
    missedNeeds.slice(0, 10).forEach(m => bad.push(m));
    if (missedNeeds.length > 10) bad.push('\u2026 and ' + (missedNeeds.length - 10)
      + ' more papers whose cover says something its questions do not');
    const noNeeds = Object.keys(withQs).filter(p => !docNeeds[p]).length;
    console.log('\nWHAT A PAPER SAYS YOU NEED, REACHING ITS QUESTIONS: ' + needsChecked
      + ' questions under ' + Object.keys(docNeeds).filter(p => withQs[p]).length
      + ' papers that declare one \u2014 and ' + noNeeds + ' papers declare nothing, which is right '
      + 'for a worksheet and a backlog for an exam paper');
  }

  /* ---------- AN ANSWER THAT NAMES A THING MUST NAME EXACTLY ONE OF THEM ------------------------
     THE `Paper` QUESTION WAS OFFERING ONE BUTTON FOR TWO PAPERS. Its `of` returned the paper's
     NAME, and `spellKey_` folds `Paper 1 (Non-Calculator) — May 2017` onto
     `Paper 1 (Non-calculator) — May 2017` — Edexcel Higher and Foundation, one sitting apart in
     meaning and one letter's case apart in spelling. Six names were shared by twenty papers, the
     six AQA `Paper 1 — June 2024` rows putting three subjects and two tiers on a single answer.

     TEST 2 COULD NOT SEE IT AND ITS OWN NOTE SAYS WHY: it looks for two values that normalise to
     one key, and after the fold there is only one value left to look at. The fold is right — it is
     what makes `Alevel` and `A-Level` one button — and feeding it an identity was not.

     SO THE RULE IS ON THE ITEMS BEHIND THE ANSWER rather than on the spelling in front of it: press
     it, and every question you are left with has to come from one paper. That is checkable without
     knowing anything about how the label was built, which is what makes it the right question.
     Proved by mutation: put the name back as the value and it names the merged answers. */
  const paperFacet = facets.find(x => x.field === 'paperId');
  if (!paperFacet) {
    bad.push('there is no `paperId` facet, so the Paper question cannot be checked — not a pass');
  } else {
    const qs = items.filter(x => x && x.row && x.row.paper_id);
    const vals = f.facetValues(qs, paperFacet);
    const ids = new Set(qs.map(x => x.row.paper_id));
    /* ---------- A LEAF ANSWER IS ONE PAPER; A BUCKET IS MEANT TO HOLD MANY ----------------------
       THIS TEST IS WHY `showOf` EXISTS — its own note above records six names carried by twenty
       papers, merged into one button by the spelling fold, so an answer holding two papers is a
       real fault and stays one.

       `bucketValues_` MAKES THE OTHER KIND OF ANSWER, and holding many papers is the whole of its
       job: `P` is not a paper, it is the way to the papers whose names start with it. Told apart by
       the flag the row carries rather than by the shape of the text, which is the same distinction
       `filterHit` draws and for the same reason. */
    const leaves = vals.filter(v => !v.bucket);
    vals.forEach(v => {
      if (v.bucket) return;
      const held = new Set(qs.filter(x => f.filterHit(x, { field: 'paperId', value: v.value }))
                             .map(x => x.row.paper_id));
      if (held.size > 1) {
        bad.push('the Paper answer "' + (v.show || v.value) + '" holds ' + held.size
                 + ' different papers: ' + [...held].join(', '));
      }
    });
    /* ONE ANSWER PER PAPER, AND ONLY WHERE THE ANSWERS ARE PAPERS. Over the whole library the
       Paper question is 266 answers, which is past the seven a card can hold, so what it draws is
       buckets — and counting those against the number of papers would be comparing a shelf against
       the books on it. The assertion holds where it means something: a list whose paper answers are
       leaves must have exactly one per paper. */
    const bucketed = vals.length !== leaves.length;
    console.log('\nTHE PAPER QUESTION: ' + vals.length + (bucketed ? ' bucket(s)' : ' answer(s)')
                + ' over ' + ids.size + ' papers'
                + (!bucketed && vals.length === ids.size ? ' — one each' : ''));
    if (!bucketed && vals.length !== ids.size) {
      bad.push('the Paper question offers ' + vals.length + ' answers for ' + ids.size + ' papers');
    }
  }

  /* ---------- AND THE PAPERS THE RULE ABOVE CANNOT REACH -----------------------------------------
     THAT RULE IS ON THE ITEMS, so a paper with no questions under it yet produces no items and is
     invisible to it. 425 of the library's papers are in that state — the transcription queue — and
     two of them arriving with the same label is a fault that shows up on the day somebody types
     the questions in, not on the day the rows land.

     IT HAPPENED. AQA Combined Science June 2024 went in beside the Edexcel papers already there,
     and `Biology Paper 1 — June 2024` is a true name of an 8464/B/1H and of a 1SC0/1BH. They
     agree on subject and on tier as well, so `paperLabels_` appended `· Higher` to both and
     drew ONE button over two different papers. The board rung in that function is the fix; this is
     what would have named it.

     PRINTED, NOT FAILED, and the 17 it prints are why: thirteen are an `RS…` stub sitting
     beside its own transcription, which `check-library.js` already counts as the intended state,
     and four are English stubs carrying no year and, on two of them, `subject: Maths` on an
     English Language paper. Both are rows to repair rather than a rule to enforce, and a permanent
     red is a red nobody reads. What guards the class of fault is the rung, not this line. */
  if (typeof f.paperLabels_ === 'function') {
    const labels = f.paperLabels_();
    const byLabel = {};
    Object.keys(labels).forEach(id => {
      (byLabel[labels[id]] = byLabel[labels[id]] || []).push(id);
    });
    const shared = Object.keys(byLabel).filter(l => byLabel[l].length > 1);
    console.log('\nPAPERS DRAWN UNDER ONE LABEL: ' + shared.length
                + (shared.length ? ' \u2014 rows to repair, not a rule' : ''));
    shared.slice(0, 10).forEach(l => console.log('  ' + JSON.stringify(l) + '  '
                                                 + byLabel[l].join(', ')));
    if (shared.length > 10) console.log('  \u2026 and ' + (shared.length - 10) + ' more');
  } else {
    bad.push('`paperLabels_` is not declared, so paper labels cannot be checked \u2014 not a pass');
  }

  /* ---------- A PAPER'S LABEL SAYS NOTHING THE SCREEN HAS ALREADY ANSWERED -----------------------
     REPORTED FROM THE LIVE FUNNEL: "biology paper 1 as one category when it should be like biology
     then paper 1." Narrowed to `Subject · Biology`, all four Paper answers read
     `Paper 1 — June 2024 · Biology · Foundation` — the subject spelled out on four answers that are
     all Biology, because `paperLabels_` disambiguated against the whole library once and
     `shortLabels_` cannot take an APPENDED rung off again.

     THE RULE IS ON THE ANSWERS RATHER THAN ON THE FUNCTION. Narrow by a facet, then read the labels
     the Paper question would draw: none of them may name the answer just chosen. That is the
     property, and it holds however the labels are built — where a test on `paperLabels_`'s
     arguments would pass on a version that took the ids and ignored them.

     THREE NARROWINGS, BECAUSE ONE PROVES ONE. A subject with several papers of one name (Biology),
     a subject-plus-tier (Chemistry · Higher) where the bare `Paper 1` becomes available, and a
     sitting (Physics · Summer 2024) where the date is the redundant word rather than the subject. */
  if (typeof f.facetValues === 'function') {
    const paper = f.facetList().find(x => x.field === 'paperId');
    const LOOK = [
      { say: 'Subject · Biology', on: [['subject', 'Biology']] },
      { say: 'Subject · Chemistry, Tier · Higher',
        on: [['subject', 'Chemistry'], ['tier', 'Higher']] },
      { say: 'Subject · Physics, Year · 2024, Month · June',
        on: [['subject', 'Physics'], ['examYear', '2024'], ['examMonth', 'June']] },
      /* THE YEAR IS ASSERTED TOO, AND THAT TOOK MOVING A RUNG. Split in two, the year is a chip of
         its own — and `paperLabels_` used to APPEND its subject and tier rungs after the paper's
         date (`Paper 1 — June 2024 · Foundation`), which left `nameForms_` nothing to cut, so the
         first version of this split exempted the year here with a comment. The rungs go before the
         date now and this narrowing reads `Paper 1 · Foundation`. Tier is deliberately left
         unanswered: answered, the papers are unique by name and the rule would pass on any order of
         rungs. */
    ];
    LOOK.forEach(look => {
      const kept = items.filter(x => look.on.every(([field, value]) =>
        f.filterHit(x, { field: field, value: value })));
      if (kept.length < 20) {
        bad.push('the paper-label rule could not reach ' + look.say + ' — ' + kept.length
                 + ' items, so it proves nothing');
        return;
      }
      const labels = f.facetValues(kept, paper).map(v => String(v.show || v.value));
      if (!labels.length) {
        bad.push('no paper answers at ' + look.say + ' — the rule proves nothing');
        return;
      }
      look.on.forEach(([field, value]) => {
        const said = labels.filter(l => l.indexOf(value) !== -1);
        if (said.length) {
          bad.push(said.length + ' of the ' + labels.length + ' paper answers at ' + look.say
                   + ' still spell out "' + value + '", which is the chip above them: '
                   + JSON.stringify(said[0]));
        }
      });
    });
  } else {
    bad.push('`facetValues` is not declared, so the paper labels cannot be checked — not a pass');
  }

  /* ---------- 4f. A CHIP'S HALF OF THE DATE IS NOT SAID AGAIN, AND NO ANSWER FUSES THE TWO -------------
     REPORTED AS *"Fix this why it say June and year in same chip"*. The card's tag is asserted in 4;
     this is the other half, the Paper answers and the chips they make. Measured before the fix, Year
     skipped and `June` pressed: `Paper 1 — June 2023 | Paper 1 — June 2024` -- the month the person
     had just chosen, read back fused to the year they had not.

     EVERY YEAR FOLDER A THUMB CAN REACH OVER PAST PAPERS, found by answering the funnel's own
     questions rather than named here, so a subject or a level added next term is walked with nothing
     to change. At each one, the three routes that say something: a year with the month skipped, a
     month with the year skipped, and both. Every Paper answer drawn there -- inside its bucket where
     the list is long -- and the chip it makes when pressed:

       never says the year a Year chip said, nor the month a Month chip said,
       never carries a month word and a year together,
       and reads on the chip exactly as it read on the button.

     NOT THE ROUTE WITH BOTH FOLDERS SKIPPED. `Doesn't matter` twice is a person choosing to see every
     sitting at once, nothing above the answers has said either half, and `— June 2023` is then the only
     thing telling two Paper 1s apart; that route keeps the date as the paper prints it, and the count
     of such answers is printed rather than failed. */
  if (f.nextFacet && f.stuffNarrow_ && f.chipShow_ && syear && smonth) {
    const paperF = facets.find(x => x.field === 'paperId');
    const was = { q: f.STUFF.q, filters: f.STUFF.filters.slice() };
    const listAt = chips => { f.STUFF.q = ''; f.STUFF.filters = chips.slice(); return f.stuffNarrow_(items, chips, [], null); };
    const chipOf = (v, field) => Object.assign({ field: field, value: v.value }, v.bucket ? { bucket: true } : {});
    const folders = [];
    const seenAt = new Set();
    const find = (chips, depth) => {
      const k = JSON.stringify(chips);
      if (seenAt.has(k) || folders.length >= 60) return;
      seenAt.add(k);
      const list = listAt(chips);
      const next = list.length ? f.nextFacet(list) : null;
      if (!next) return;
      if (next.field === 'examYear') { folders.push(chips); return; }
      if (depth <= 0) return;
      f.facetValues(list, next).forEach(v => find(chips.concat([chipOf(v, next.field)]), depth - 1));
    };
    let read = 0, unsaid = 0;
    try {
      find([{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Questions' },
            { field: 'documentType', value: 'Past paper' }], 6);
      const labelsAt = chips => {
        const out = [];
        const list = listAt(chips);
        f.facetValues(list, paperF).forEach(v => {
          if (!v.bucket) { out.push({ chips: chips, v: v }); return; }
          const inside = chips.concat([chipOf(v, 'paperId')]);
          f.facetValues(listAt(inside), paperF).filter(w => !w.bucket).forEach(w => out.push({ chips: inside, v: w }));
        });
        return out;
      };
      folders.forEach(at => {
        const here = listAt(at);
        const years = {}, months = {};
        here.forEach(x => {
          f.facetOwn_(syear, x).forEach(y => { years[y] = 1; });
          f.facetOwn_(smonth, x).forEach(m => { months[m] = 1; });
        });
        const routes = [];
        Object.keys(years).forEach(y => {
          routes.push([{ field: 'examYear', value: y }, { field: 'examMonth', any: true }]);
          Object.keys(months).forEach(m => routes.push([{ field: 'examYear', value: y }, { field: 'examMonth', value: m }]));
        });
        Object.keys(months).forEach(m => routes.push([{ field: 'examYear', any: true }, { field: 'examMonth', value: m }]));
        routes.forEach(route => {
          const chips = at.concat(route);
          const sayY = route[0].any ? '' : route[0].value, sayM = route[1].any ? '' : route[1].value;
          labelsAt(chips).forEach(({ chips: c, v }) => {
            const show = String(v.show || v.value);
            read++;
            const where = c.filter(x => x.field !== 'forLabel' && x.field !== 'kindLabel')
              .map(x => x.any ? x.field + ' skipped' : x.value).join(' · ');
            if (sayY && new RegExp('\\b' + sayY + '\\b').test(show)) {
              bad.push(where + ': the Paper answer "' + show + '" says the year the Year chip above it already said. See sittingUnsaid_().');
            }
            if (sayM && new RegExp('\\b' + sayM + '\\b', 'i').test(show)) {
              bad.push(where + ': the Paper answer "' + show + '" says the month the Month chip above it already said. See sittingUnsaid_().');
            }
            if (fusedDate_(show)) {
              bad.push(where + ': the Paper answer "' + show + '" holds a month and a year together — the funnel asks them as two folders.');
            }
            const pressed = c.concat([{ field: 'paperId', value: v.value }]);
            f.STUFF.filters = pressed.slice();
            const chip = f.chipShow_(pressed[pressed.length - 1], pressed.length - 1);
            if (chip !== show) {
              bad.push(where + ': pressing "' + show + '" makes a chip reading "' + chip + '" — a chip says what its button said.');
            }
          });
        });
        /* AND THE ROUTE THAT KEEPS THE PRINTED DATE, counted. */
        labelsAt(at.concat([{ field: 'examYear', any: true }, { field: 'examMonth', any: true }]))
          .forEach(({ v }) => { if (fusedDate_(v.show || v.value)) unsaid++; });
      });
    } finally { f.STUFF.q = was.q; f.STUFF.filters = was.filters; }
    console.log('  Paper answers under a Year or Month chip: ' + read + ' read at ' + folders.length
                + ' year folder(s), none repeating a chip or fusing the date; ' + unsaid
                + ' keep the printed date with both folders skipped');
    if (!read) bad.push('no Paper answer was read under a Year or Month chip, so the half-a-date rule proves nothing');
  } else {
    bad.push('`chipShow_`, `nextFacet` or `stuffNarrow_` is not declared, or the sitting is not two '
             + 'questions, so the Paper answers under a Year or Month chip cannot be read — not a pass');
  }

  /* ---------- A SATs PAPER IS `Paper 1` ON THE MENU, ON THE CHIP AND ON THE CARD ----------------------
     REPORTED AS *"When I do maths sats with Jp, the tags come out with full paper name and which paper
     is on the menu."* Measured: Maths · Past paper · KS2 SATs offered `Paper 1: Arithmetic — May 2019`
     beside `… May 2024`, and the chip it made read `PAPER Paper 1: Arithmetic — May 2019`. Three
     causes, one per half of this rule:

       the menu   the SATs question rows carry no sitting, so `Year` was never asked and the date had
                  to stay in the paper's name to tell two years apart -- `waveFromDoc_`
       the chip   it was labelled against the whole library rather than against the chips before
                  it -- `chipShow_`
       the card   the paper's name was one line of text -- `qTags_`

     KS1 AND KS2, because the two were added months apart and only one of them prompted this. Each
     year is walked on its own, which is what the funnel does once `Year` is asked. The route is
     `Level · SATs` then `Key stage · KS1` / `KS2` -- *"sats is one tag not ks2 sats"* -- which is the
     question a person answers to tell the two apart now that the level does not. */
  if (typeof f.chipShow_ === 'function' && typeof f.qTags_ === 'function' && f.STUFF) {
    const byField = fl => f.facetList().find(x => x.field === fl);
    const paperF = byField('paperId');
    const yearF = byField('examYear');
    let skipped = 0;
    ['KS1', 'KS2'].forEach(ks => {
      const level = 'SATs ' + ks;
      /* MATHS, as reported. The English SATs paper is `GPS Paper 1`, and there `GPS` is the word
         that says which English paper it is rather than a repeat of a chip above it. */
      const on = [['subject', 'Maths'], ['documentType', 'Past paper'], ['level', 'SATs'], ['keystage', ks]];
      const kept = items.filter(x => on.every(([fl, v]) => f.filterHit(x, { field: fl, value: v })));
      const years = yearF ? f.facetValues(kept, yearF).map(v => String(v.value)) : [];
      if (!kept.length || !years.length) {
        bad.push(level + ' past papers offer no Year answer, so their Paper answers have to carry the date'
                 + ' to tell two sittings apart — see `waveFromDoc_`');
        return;
      }
      years.forEach(yr => {
        const inYear = kept.filter(x => f.filterHit(x, { field: 'examYear', value: yr }));
        const answers = f.facetValues(inYear, paperF);
        answers.forEach(a => {
          const show = String(a.show || a.value);
          if (!/^Paper \d+$/.test(show)) {
            bad.push(level + ' ' + yr + ': the Paper answer reads ' + JSON.stringify(show)
                     + ' where the chips above it already say the level and the year');
            return;
          }
          const saved = f.STUFF.filters;
          f.STUFF.filters = on.map(([fl, v]) => ({ field: fl, value: v }))
            .concat([{ field: 'examYear', value: yr }, { field: 'paperId', value: a.value }]);
          let chip = '';
          try { chip = f.chipShow_(f.STUFF.filters[f.STUFF.filters.length - 1], f.STUFF.filters.length - 1); }
          finally { f.STUFF.filters = saved; }
          if (chip !== show) {
            bad.push(level + ' ' + yr + ': pressing ' + JSON.stringify(show) + ' makes a chip reading '
                     + JSON.stringify(chip) + ' — a chip says what the button it came from said');
          }
          const q = inYear.find(x => x.kind === 'question'
            && f.filterHit(x, { field: 'paperId', value: a.value }));
          const tags = q ? f.qTags_(q) : [];
          if (!tags.some(t => t.tag === 'paper' && t.text === show)) {
            bad.push(level + ' ' + yr + ': a card from ' + JSON.stringify(show) + ' has no red paper tag '
                     + 'reading it — its tags are ' + JSON.stringify(tags.map(t => t.text)));
          }
          if (tags.some(t => /\s[\u2014\u2013]\s/.test(t.text))) {
            bad.push(level + ' ' + yr + ': a card tag still holds the whole name, dash and all: '
                     + JSON.stringify(tags.map(t => t.text)));
          }
        });
      });
      /* ---------- AND WITH THE YEAR SKIPPED ----------------------------------------------------------
         `Doesn't matter` IS DRAWN UNDER EVERY QUESTION, folders included, and pressed on Year it left
         the six KS2 papers reading their whole names -- `Paper 1: Arithmetic — May 2019` -- on the
         menu and on the chip, while every check here walked only the years. With the year skipped
         the date is the one thing that tells two papers apart, so it may stay; the qualifier may not.
         Walked with the Month skipped too and with it answered, because both are a thumb's route.
         AND ONLY THE HALF OF THE DATE NOBODY HAS SAID -- *"Fix this why it say June and year in same
         chip"*. With `May` pressed the answer is `Paper 1 · 2019`, the year alone; only with BOTH
         folders skipped does the printed `— May 2019` stay, because then nothing above it has said
         either half and the two together are what tells the papers apart. See `sittingUnsaid_`. */
      const months = f.facetValues(kept, byField('examMonth') || yearF).filter(v => !v.bucket);
      const routes = [[{ field: 'examYear', any: true }, { field: 'examMonth', any: true }]]
        .concat(months.map(m => [{ field: 'examYear', any: true }, { field: 'examMonth', value: m.value }]));
      routes.forEach(route => {
        const saved = f.STUFF.filters;
        const doors = on.map(([fl, v]) => ({ field: fl, value: v })).concat(route);
        const say = level + ' with the Year skipped' + (route[1].any ? ' and the Month' : ', ' + route[1].value);
        try {
          f.STUFF.filters = doors.slice();
          const list = f.stuffNarrow_(items, doors, [], null);
          f.facetValues(list, paperF).forEach(a => {
            skipped++;
            const show = String(a.show || a.value);
            const shape = route[1].any ? /^Paper \d+( [\u2014\u2013] [A-Za-z]+ (19|20)\d{2})?$/
                                       : /^Paper \d+( \u00b7 (19|20)\d{2})?$/;
            if (!shape.test(show)) {
              bad.push(say + ': the Paper answer reads ' + JSON.stringify(show) + ' — the number, and the '
                       + 'half of the date no chip has said where two years share it, and nothing else. '
                       + 'See nameForms_() and sittingUnsaid_().');
            }
            f.STUFF.filters = doors.concat([{ field: 'paperId', value: a.value }]);
            const chip = f.chipShow_(f.STUFF.filters[f.STUFF.filters.length - 1], f.STUFF.filters.length - 1);
            if (chip !== show) {
              bad.push(say + ': pressing ' + JSON.stringify(show) + ' makes a chip reading '
                       + JSON.stringify(chip) + ' — a chip says what the button it came from said');
            }
            f.STUFF.filters = doors.slice();
          });
        } finally { f.STUFF.filters = saved; }
      });
    });
    console.log('  SATs: ' + skipped + ' Paper answer(s) read and pressed with the Year skipped');

    /* ---------- A CARD'S SUBJECT IS THE SUBJECT QUESTION'S, AND A 5-A-DAY'S DAY IS ITS DAY ANSWER -----
       TWO WAYS A CARD SAID A WORD THE FUNNEL ABOVE IT DID NOT. The subject tag was read off the name,
       so AQA Combined Science cards wore `Biology` in green and real GCSE Biology cards wore nothing;
       and a 5-a-day's name was cut at its dash, so `5-a-day Foundation` was one red pill and the day
       was coloured as a sitting while the Day answer that reaches it is red. Over every paper: each
       green tag is one of the item's own Subject answers, and each 5-a-day card carries its Day
       answer in the Day answer's colour and no pill joining a type to a level. */
    const subjectF = byField('subject');
    const seenPaper = {};
    let cards = 0, fives = 0;
    items.forEach(x => {
      const pid = x.kind === 'question' && x.row && x.row.paper_id;
      if (!pid || seenPaper[pid]) return;
      seenPaper[pid] = 1;
      cards++;
      const tags = f.qTags_(x) || [];
      const own = subjectF ? f.asList_(subjectF.of(x)).map(String) : [];
      tags.filter(t => t.tag === 'subject').forEach(t => {
        if (own.indexOf(t.text) === -1) {
          bad.push(pid + ': the card wears a green subject tag ' + JSON.stringify(t.text) + ' that is not its '
                   + 'Subject answer (' + JSON.stringify(own) + ') — see qTags_().');
        }
      });
      if (String(x.row.document_type || '') === '5-a-day' && f.fiveDayLabel_ && f.tagOf_) {
        fives++;
        const day = f.fiveDayLabel_(pid);
        if (!tags.some(t => t.tag === f.tagOf_('fiveDay') && t.text === day)) {
          bad.push(pid + ': the 5-a-day card has no ' + JSON.stringify(f.tagOf_('fiveDay')) + ' tag reading '
                   + JSON.stringify(day) + ', which is what its Day answer says — its tags are '
                   + JSON.stringify(tags.map(t => t.tag + ':' + t.text)));
        }
        if (tags.some(t => /5-a-day\s+\S/i.test(t.text))) {
          bad.push(pid + ': a 5-a-day card tag joins the type to the level: '
                   + JSON.stringify(tags.map(t => t.text)));
        }
      }
    });
    console.log('  Card tags: ' + cards + ' paper(s) read, ' + fives + ' of them 5-a-day');
    if (!fives) bad.push('no 5-a-day card was read, so the Day tag rule proves nothing');
    if (!skipped) bad.push('no SATs Paper answer was reached with the Year skipped, so that route proves nothing');
  } else {
    bad.push('`chipShow_` or `qTags_` is not declared, so the SATs tags cannot be checked — not a pass');
  }

  /* ---------- A `facets` ROW NAMING A FIELD NOTHING ANSWERS IS A DEAD ROW ------------------------
     FOUR OF THEM WERE LIVE WHEN THIS WAS WRITTEN, and they are the reason the funnel was reported
     as "not uniform". `data/settings/facets.json` is the live source of every question's LABEL and
     ORDER, and `facetList` sorts each of its rows into one of two piles: a field the code declares
     is a relabel of that question, and a field the code has never heard of is a NEW question read
     straight off the column. So a RENAME moves a row silently from the first pile to the second:

       `resourceType`  the column is `document_type` since the rename. The row meant to put `Type`
                       at order 40 and instead invented a dead question, while the real
                       `documentType` facet — having no row — fell wherever its position in the
                       code's array happened to land it. `Type` was FOURTEENTH.
       `stage`         renamed to `level` in code for exactly this reason, and the sheet kept the
                       old name. `Level` was EIGHTEENTH, after `Question number`.
       `qNumber`       both deleted from the code. The sheet went on inventing them, and
       `qPart`         `Question part` offered `A`, `B`, `C` beside `1`, `2`, `3` — two vocabularies
                       in one question, which is the most non-uniform answer set the funnel had.

     NOTHING COULD SEE ANY OF IT. `whyThisQuestion()` prints a dead question with `0%` beside it and
     is a console tool somebody has to run; this check ran with the fixture in the sheet's place, so
     it was measuring a funnel the app does not draw. Both halves are fixed in the same commit — the
     boot above serves the real file, and this is the rule that refuses the next rename.

     THE TEST IS "DOES ANY ITEM ANSWER IT", not "is it declared in code", because inventing a
     question off a column is a FEATURE — `facetFromSheet_` exists for it and a row naming a real
     `venues` column is meant to work with no code change. What cannot be right is a row nothing
     anywhere can answer: it is a label and an order attached to nothing.

     AND A ROW FOR A RETIRED FACET IS DEAD TOO. `RETIRED_FACETS` blocks it from drawing, which is
     the guard working; a row that exists only to be blocked is still a row somebody will read as
     live. `paper` was one. */
  const sheet = f.facetsLive();
  if (!sheet.length) {
    bad.push('the facets sheet reached the app as ' + sheet.length + ' rows, so its labels and its '
             + 'order could not be checked at all — not a pass');
  } else {
    const live = {};
    f.facetList().forEach(x => { live[x.field] = true; });
    const declared = {};
    f.FACETS.forEach(x => { declared[x.field] = true; });
    const dead = [];
    sheet.forEach(r => {
      if (!r || !r.field || r.active === false) return;
      if (f.RETIRED_FACETS && f.RETIRED_FACETS[r.field]) {
        dead.push(r.field + ' (retired in code — the row can only ever be blocked)');
        return;
      }
      if (!live[r.field]) { dead.push(r.field + ' (switched off by the sheet itself)'); return; }
      /* ---------- DECLARED IN CODE *OR* ANSWERED BY SOMETHING — NOT "ANSWERED", FULL STOP --------
         THE FIRST VERSION ASKED ONLY WHETHER ANY ITEM ANSWERS, and it named `slot` and `afford`:
         both are real code facets whose subject is the shop and the wardrobe, and `check/fixture.json`
         has no priced rows, so their coverage here is nought. This file's own header says why that
         cannot be a failure — the fixture supplies everything that is not the library, so a facet
         measured thin here is measured thin by the harness rather than by the app.
         A CODE FACET IS NEVER A DEAD ROW. Its `of` is a function somebody wrote; the row only
         relabels and reorders it. What is dead is a row naming a field the code does NOT declare
         and nothing anywhere answers — which is exactly what a rename leaves behind. */
      if (declared[r.field]) return;
      const facet = f.facetList().find(x => x.field === r.field);
      if (f.facetCoverage(items, facet) === 0) {
        dead.push(r.field + ' (labelled ' + JSON.stringify(r.label || '') + ', order '
                  + r.order + ' — the code does not declare it and no item answers it)');
      }
    });
    if (dead.length) {
      bad.push('the facets sheet has ' + dead.length + ' row(s) naming a field nothing answers, so '
               + 'the label and the order on them do nothing and the question they meant to place '
               + 'is placed by its position in the code instead: ' + dead.join('; '));
    }
    console.log('\nTHE FUNNEL\'S ORDER, AS THE SHEET DECLARES IT: '
                + f.facetList().map(x => x.label).join(' → '));
  }


  /* ================================================================================================
     AND NO QUESTION IS CUT INTO RANGES -- THE SEVEN-ANSWER CAP BELOW IS HISTORY.

     6 OCT, THE OWNER REVERSED IT: *"I don't want to break up the title of things ... I no longer
     want to have that a-g method or h-n. Just display. Other categories should reduce how many show
     up like grade."* So the rule now is: a group drawn is a category its facet's own table names
     (a grade band, a subject area), never `C–E` or `1–10`; and a question ASKED is drawn whole, so
     it holds at most FACET_MAX_ANSWERS. What the paragraphs below describe is the rule this
     replaced, kept because it says why the walk is shaped the way it is.

     REPORTED: "there are some menus in finder where there are more than 7 options. And so it can't
     display them and asks user to search. I DO NOT LIKE THIS." The funnel used to trim the drawn
     answers to seven and print a line pointing at the search box; `bucketValues_` groups instead,
     so a long answer list becomes at most seven buckets and the question is asked again inside
     whichever one was pressed.

     A PROPERTY OF THE DATA, NOT OF THE CODE, WHICH IS WHY IT IS CHECKED RATHER THAN ASSUMED. Every
     rule in `bucketValues_` can decline: a facet's own grouping stands down if it cannot place
     every value, the tens band stands down unless everything is an integer, and the alphabet stands
     down if every value reduces to one key. Each of those is the right thing to do and each leaves
     the list untrimmed — so the guarantee holds only as long as something walks the real funnel and
     counts. That is this.

     AT EVERY STATE A PERSON CAN REACH, NOT AT THE TOP. Six answers deep on Maths worksheets at KS4
     the Paper question still held 87 answers and Topic still held 75, so a check that looked only
     at the opening question would have passed over the states the complaint was about. The walk is
     the greedy one — always press the biggest answer — plus every answer to each of the two doors,
     which between them reach every kind the app holds.

     PROVED BY MUTATION: with `bucketValues_` handing back its input untouched, this names 71
     over-sized questions across 17 states — `topic` at 375 answers, `division` at 16, `decade` at
     14 — and exits 1.
  ================================================================================================ */
  if (f.facetValues && f.filterHit && f.FACET_MAX_SHOWN) {
    const CAP = f.FACET_MAX_SHOWN;
    const keep = (list, facet, v) =>
      list.filter(x => f.filterHit(x, { field: facet.field, value: v.value, bucket: v.bucket }));
    const over = [];
    const seenState = {};
    /* ---------- AND WHAT THE GROUPS ACTUALLY SAY, WHICH IS THE HALF A RULE CANNOT JUDGE ----------
       SEVEN LEGAL BUCKETS AND SEVEN USABLE ONES ARE NOT THE SAME THING. `Heavyweight` and
       `Grades 4–6` are questions a person can answer; `P`, `R`, `W` were the three the Paper
       question drew before its ranges were measured on the paper's NAME rather than on the id
       behind it, and every rule here was green over them. So the first grouping each question
       makes is printed, once, and a person reads it -- the argument this repository makes about
       the figure backlog and the transcription queue, pointed at the funnel. */
    const groups = {};
    const look = (say, list) => {
      if (seenState[say] || !list.length) return;
      seenState[say] = 1;
      f.facetList().forEach(facet => {
        let vals = [];
        try { vals = f.facetValues(list, facet); } catch (e) { return; }
        /* A RANGE IS ANY BUCKET THE FACET'S OWN TABLE DID NOT NAME -- `C–E`, `1–10`, `2023 & 2024`. */
        const ranged = vals.filter(v => v.bucket && !(f.bucketDeclares_ && f.bucketDeclares_(facet, v.value)));
        if (ranged.length) {
          over.push('`' + facet.field + '` (' + facet.label + ') draws ' + ranged.map(v => v.value).slice(0, 4).join(', ')
                    + ' at ' + (say || 'the top of the funnel'));
        }
        if (vals.length && vals[0].bucket && !groups[facet.field]) {
          groups[facet.field] = { label: facet.label, at: say || 'the top of the funnel',
                                  says: vals.map(v => (v.show || v.value) + ' (' + v.n + ')') };
        }
      });
    };
    /* AND THE QUESTION ACTUALLY ASKED IS ONE THAT FITS: drawn whole, so never past FACET_MAX_ANSWERS. */
    const tooLong = [];
    const lookAsk = (say, list) => {
      let facet = null;
      try { facet = f.nextFacet(list, {}); } catch (e) { facet = null; }
      if (!facet) return;
      const n = f.facetValues(list, facet).length;
      if (n > f.FACET_MAX_ANSWERS) tooLong.push('`' + facet.field + '` asks with ' + n + ' answers at ' + (say || 'the top'));
    };
    const all = f.stuffItems();
    look('', all);
    lookAsk('', all);
    /* THE TWO DOORS, EVERY ANSWER. `What for` and `What kind` take somebody from the whole app into
       one department, and the departments hold very different shapes of answer. */
    ['forLabel', 'kindLabel'].forEach(field => {
      const facet = f.facetList().find(x => x.field === field);
      if (!facet) return;
      f.facetValues(all, facet).forEach(v =>
        look(facet.label + ' · ' + (v.show || v.value), keep(all, facet, v)));
    });
    /* AND THE GREEDY PATH THROUGH THE LIBRARY, which is where the complaint came from. */
    let list = all;
    const said = [];
    for (let step = 0; step < 10 && list.length > 4; step++) {
      const facet = f.nextFacet(list, {});
      if (!facet) break;
      const vals = f.facetValues(list, facet);
      if (!vals.length) break;
      let best = vals[0];
      vals.forEach(v => {
        if (keep(list, facet, v).length > keep(list, facet, best).length) best = v;
      });
      said.push(facet.label + ' · ' + (best.show || best.value));
      list = keep(list, facet, best);
      look(said.join(' → '), list);
      lookAsk(said.join(' → '), list);
    }
    if (over.length) {
      bad.push('a question is drawn as letter or number ranges rather than as its answers -- the owner, '
               + '6 Oct: "I no longer want to have that a-g method or h-n. Just display": '
               + over.slice(0, 8).join('; ') + (over.length > 8 ? '; and ' + (over.length - 8) + ' more' : ''));
    } else {
      console.log('\nNO QUESTION IS CUT INTO RANGES -- every group drawn is a category its own table names, at '
                  + Object.keys(seenState).length + ' states of the real funnel');
    }
    if (tooLong.length) {
      bad.push('a question is ASKED with more answers than FACET_MAX_ANSWERS, so the whole list is drawn '
               + 'where the other questions should have narrowed it first: ' + tooLong.slice(0, 6).join('; '));
    }
    /* ---------- AND A DECLARED BUCKET HOLDS EXACTLY WHAT ITS TABLE SAYS --------------------------
       THE MUTANT THAT PROMPTED THIS PASSED EVERYTHING. With the letter ranges keyed on the raw
       value instead of on `bucketKeyOf_`, `Level` drew `KS2 (259)` where the table says 228: a
       range labelled `KS2` prefix-matched the values `KS2-GCSE` and `KS2-KS3`, so 31 rows were in
       two buckets at once and `LEVEL_BUCKET`'s own sentence — "a span is filed under the level it
       goes UP TO" — was being contradicted by the mechanism meant to implement it. Every rule here
       was green: the drawn count and the pressed count agreed, because both go through
       `bucketHas_`, which is exactly the function that was wrong.

       SO THE TABLE IS THE THING COMPARED AGAINST, not the code that reads it. Where a facet
       declares its own grouping and the drawn buckets are its own labels, an item belongs to a
       bucket if and only if one of its values names that bucket. `facetOwn_` and `filterHit` are
       both already here, and `bucketOf` rides on the facet object, so this needs nothing new
       exported — which is the point: it is asking the app the question rather than repeating its
       arithmetic. */
    const leaks = [];
    f.facetList().forEach(facet => {
      const g = groups[facet.field];
      if (!g || !f.bucketDeclares_ || typeof facet.bucketOf !== 'function') return;
      const labels = g.says.map(t => t.replace(/ \(\d+\)$/, ''));
      /* ---------- THROUGH THE ENGINE'S OWN TEST, NOT A SECOND COPY OF IT ------------------------
         THIS ASKED `facet.bucketOrder.indexOf(b) >= 0` AND IT SILENTLY SKIPPED `examWave`. That
         grouping is computed rather than listed, so its `order` is an EMPTY ARRAY — truthy, so the
         guard above let it through, and then every one of its labels failed the `indexOf` and the
         whole facet returned. A rule that cannot reach its subject reporting that the subject is
         fine is this repository's oldest shape, and here it was hiding a fifth of the declared
         groupings from the rule written to guard them. `bucketDeclares_` is what `bucketHas_`
         itself asks, so the check and the engine agree about which labels a grouping owns by
         construction rather than by two functions that have to be kept in step. */
      if (!labels.every(b => f.bucketDeclares_(facet, b))) return;
      let said = 0;
      all.forEach(x => {
        let mine;
        try { mine = f.facetOwn_(facet, x).map(v => facet.bucketOf(v)).filter(Boolean); }
        catch (e) { return; }
        labels.forEach(b => {
          const kept = f.filterHit(x, { field: facet.field, value: b, bucket: true });
          const named = mine.indexOf(b) >= 0;
          if (kept !== named && said < 3) {
            said += 1;
            leaks.push('`' + facet.field + '` ' + (kept ? 'keeps' : 'drops') + ' an item in the '
                       + '"' + b + '" bucket that its own table ' + (kept ? 'does not put' : 'puts')
                       + ' there — its values are ' + JSON.stringify(mine));
          }
        });
      });
    });
    if (leaks.length) {
      bad.push('a bucket holds something its own table does not put in it: ' + leaks.slice(0, 5).join('; '));
    }

    /* ---------- AND A LISTED TABLE PLACES EVERY ANSWER THE LIBRARY GIVES ----------------------------
       FOUND ADDING THE FIRST FUNCTIONAL SKILLS PAPER, and only because the summary line above was
       read: `Level` had been `KS1 | KS2 | KS3 | GCSE | A-Level` and one new band value turned it into
       `A (618) | F (6) | G (4752) | K (353)`. `bucketLabels_` stands the whole grouping down to the
       alphabet when ONE value has no row in the table -- deliberately, because a grouping that drops
       an answer hides it -- so six questions nobody had filed rewrote the Level question for all
       5,750. Nothing failed: the rule above only looks at a facet whose drawn labels are its own, so
       the moment the table stood down that rule stood down with it.

       SO A TABLE THAT IS WRITTEN OUT (`order` non-empty) MUST PLACE EVERY VALUE AN ITEM GIVES. A
       computed grouping (`waveBucket_`, an empty `order`) places by arithmetic and is not this rule's
       business. The repair is one row in the table, and the message names the value. */
    const unplaced = [];
    f.facetList().forEach(facet => {
      const of = facet.bucketOf;
      if (typeof of !== 'function' || !Array.isArray(of.order) || !of.order.length) return;
      const lost = {};
      all.forEach(x => {
        let vs = [];
        try { vs = f.facetOwn_(facet, x).filter(Boolean); } catch (e) { return; }
        vs.forEach(v => { if (!of(v)) lost[v] = (lost[v] || 0) + 1; });
      });
      Object.keys(lost).forEach(v => unplaced.push('`' + facet.field + '` "' + v + '" (' + lost[v] + ')'));
    });
    console.log('  values a written-out grouping has no row for: ' + unplaced.length);
    if (unplaced.length) {
      bad.push(unplaced.length + ' answer(s) have no row in their facet\'s bucket table, so that whole '
               + 'question is drawn as letter ranges instead of its own groups: '
               + unplaced.slice(0, 6).join(', ') + ' — add the value to the table (LEVEL_BUCKET and '
               + 'its neighbours in find.js).');
    }

    /* ---------- AND A QUESTION ASKED INSIDE A BUCKET OFFERS ONLY WHAT IS IN IT -------------------
       FOUND BY WALKING THE FUNNEL AND READING WHAT IT DREW, which is the only way it could have
       been: six chips deep, pressing `Topic · D–F` drew `D–E`, `F`, `I–M`, `N–P` and `S–T`.
       Nothing was broken — `topic` is multi-valued, so a question tagged `Decimals, Ratio` is kept
       by the chip and still carries `Ratio` — and the screen said the opposite of the chip above
       it. Every rule in this file was green, because every count agreed with every press.

       PRESSED THROUGH THE APP'S OWN STATE rather than by calling the restriction: the chip goes on
       `STUFF.filters` exactly as `facet-pick` puts it there, the items are filtered by `filterHit`,
       and what is read back is what `stuffQuestion` would draw. `bucketHas_` decides what "inside"
       means, because it is the one function that decides that anywhere. */
    const outside = [];
    f.facetList().forEach(facet => {
      if (!groups[facet.field] || !f.bucketHas_ || !f.STUFF) return;
      let vals = [];
      try { vals = f.facetValues(all, facet); } catch (e) { return; }
      const b = vals.find(v => v.bucket);
      if (!b) return;
      const kept = all.filter(x => f.filterHit(x, { field: facet.field, value: b.value, bucket: true }));
      const held = f.STUFF.filters;
      f.STUFF.filters = held.concat([{ field: facet.field, value: b.value, bucket: true }]);
      let inside = [];
      try { inside = f.facetValues(kept, facet); } catch (e) { /* reported below as empty */ }
      f.STUFF.filters = held;
      /* ---------- ON THE RAW VALUES, BECAUSE AN INNER ANSWER IS OFTEN A BUCKET TOO --------------
         THE FIRST VERSION ASKED `bucketHas_` WHETHER THE INNER ANSWER WAS INSIDE THE OUTER ONE and
         named four findings that are all correct behaviour: inside `1–10` the question numbers
         re-group as `2–3`, `4–5`, and a LABEL is not a value — `bucketHas_` takes what a row
         holds. So the test is on what the rows hold: any value on a kept item that the outer chip
         does not contain is a stray, and no answer drawn inside that chip may hold one. */
      const raw = {};
      kept.forEach(x => { try { f.facetOwn_(facet, x).forEach(v => { raw[v] = 1; }); } catch (e) {} });
      const strays = Object.keys(raw).filter(v => !f.bucketHas_(facet, b.value, v));
      inside.forEach(v => {
        const holds = strays.filter(sv => v.bucket ? f.bucketHas_(facet, v.value, sv)
                                                  : f.norm(sv) === f.norm(v.value));
        if (holds.length) {
          outside.push('`' + facet.field + '` is inside "' + b.value + '" and still offers "'
                       + (v.show || v.value) + '", which holds ' + JSON.stringify(holds.slice(0, 3)));
        }
      });
      if (!inside.length) {
        outside.push('`' + facet.field + '` offers nothing at all inside "' + b.value + '"');
      }
    });
    if (outside.length) {
      bad.push('a question asked inside a bucket offers an answer that is not in it, so the screen '
               + 'says the opposite of the chip above it: ' + outside.slice(0, 6).join('; ')
               + (outside.length > 6 ? '; and ' + (outside.length - 6) + ' more' : ''));
    }

    /* ---------- AND A LIST NO TABLE CAN SPLIT IS DRAWN WHOLE ------------------------------------
       A grouping that answers ONE label for every value cannot narrow anything, so `bucketLabels_`
       stands it down -- and since 6 Oct there is nothing behind it: no tens, no alphabet. Ten
       answers in, the same ten answers out, none of them a bucket. Asked of a facet built here,
       because none of the real tables collapses and the shape still has to be held. */
    const collapse = { field: '__collapse', label: 'Collapse', of: x => x.__v || '',
                       bucketOf: () => 'One thing', bucketOrder: ['One thing'] };
    const ten = 'alpha bravo charlie delta echo foxtrot golf hotel india juliet'
      .split(' ').map(v => ({ __v: v }));
    let drew = [];
    try { drew = f.facetValues(ten, collapse); } catch (e) { drew = []; }
    if (drew.length !== 10 || drew.some(v => v.bucket)) {
      bad.push('a list no table can split is not drawn whole: ' + drew.length + ' answers, '
               + drew.filter(v => v.bucket).length + ' of them buckets -- see `bucketLabels_`');
    }

    /* ---------- AND A TABLE PLACES EVERY SPELLING OF A VALUE IT LISTS ---------------------------
       `facetTally_` FOLDS VARIANTS BY `spellKey_` AND HANDS THE GROUPING WHICHEVER SPELLING WON,
       so a table keyed on `norm` — lower case and trim, nothing else — is using a looser fold at
       one end than the fold that decided the answer at the other. `A Level` is the same answer as
       `A-Level` to `spellKey_` and a different key to `norm`; it wins the vote by carrying a
       separator; and ONE unplaced value stands the whole grouping down to the alphabet, silently,
       on a question that worked the day before. This file records `Alevel` / `A-level` /
       `A-Level` as three answers on one screen in this very column.

       SO IT IS ASKED OF THE TABLES RATHER THAN OF THE DATA. Every label a facet declares must come
       back for a spelling of it with the separators taken out, which is the perturbation
       `spellKey_` is built to see through and `norm` cannot. */
    const unfolded = [];
    f.facetList().forEach(facet => {
      const order = facet.bucketOrder;
      if (!order || !order.length || typeof facet.bucketOf !== 'function') return;
      let vals = [];
      try { vals = f.facetValues(all, facet); } catch (e) { return; }
      vals.forEach(v => {
        const raw = String(v.value);
        let got = '';
        try { got = facet.bucketOf(raw); } catch (e) { got = ''; }
        if (!got) return;                       /* unplaced is rule 1's business, not this one */
        const bare = raw.replace(/[^A-Za-z0-9]+/g, '');
        let same = '';
        try { same = facet.bucketOf(bare); } catch (e) { same = ''; }
        if (same !== got) {
          unfolded.push('`' + facet.field + '` places "' + raw + '" in "' + got + '" and "'
                        + bare + '" in "' + (same || 'nothing') + '"');
        }
      });
    });
    if (unfolded.length) {
      bad.push('a grouping is keyed more tightly than the fold that decided its answers, so one '
               + 'typed cell would stand it down to letter ranges: ' + unfolded.slice(0, 5).join('; ')
               + (unfolded.length > 5 ? '; and ' + (unfolded.length - 5) + ' more' : ''));
    }

    const grouped = Object.keys(groups);
    if (grouped.length) {
      console.log('\nWHAT A LONG QUESTION IS ASKED AS — read these, a rule cannot judge them:');
      grouped.forEach(k => {
        console.log('  ' + k.padEnd(11) + ' ' + groups[k].says.join(' | '));
      });
    }
  } else {
    bad.push('`facetValues`, `filterHit` or `FACET_MAX_SHOWN` is not declared, so the seven-answer '
             + 'cap cannot be checked - not a pass');
  }

  /* ==================================================================================================
     RULE 8 — A BRANCH A ROW CANNOT HONESTLY BE IN

     REPORTED AS "sometimes in finder there are things which seem to appear in wrong menu. like i
     remember seeing a level maths pure somewhere it shouldnt be ... this happens frequently."

     MEASURED, AND IT WAS TWO FAULTS. **18 Edexcel GCSE Higher questions were in the A-level
     branch** — `proof`, `rates of change`, `coordinate geometry`, `arithmetic` are ordinary GCSE
     Higher topics and the A-level subtree was the only place in the tree those words appeared. And
     **2 KS2 GRAMMAR questions were under `Number`**, because `brackets` is a node in two roots and
     `topicIndex_` took whichever sat higher in the file.

     THE SECOND ONE IS WHY THIS IS A RULE AND NOT A ROW REPAIR. Nothing about either fault is
     visible from a row: the markup is valid, the card draws, the chip is a real answer, and the
     only way to see it is to compare the branch against what the row says about itself. That is
     the `cost: 0` shape — repaired in the data, the shape comes back.

     ONLY THE LEVEL, AND THAT NARROWNESS IS MEASURED. **97 practicals carry a science subject and
     resolve to a MATHS area on purpose** — the resistance of a wire IS a straight-line graph — so a
     subject rule here would report ninety-seven deliberate joins to catch two mistakes, which is
     the 95-findings-with-2-real-ones this suite already records. In `topicPick_` the subject only
     ever breaks a tie; here it is not asked at all. */
  if (typeof f.topicArea === 'function' && typeof f.levelOf === 'function') {
    const tree = f.topicTree() || [];
    const roots = tree.filter(r => r && !String(r.parent_id || '').trim());
    const lim = {};
    roots.forEach(r => { lim[r.label] = (f.topicAtoms(r.only_level) || []).map(norm_); });

    const wrong = [];
    items.forEach(x => {
      const lv = norm_(f.levelOf(x) || '');
      if (!lv) return;                       /* absent is not a contradiction */
      (f.topicArea(x) || []).forEach(a => {
        if ((lim[a] || []).length && lim[a].indexOf(lv) < 0) {
          wrong.push((x.key || x.name) + ' is ' + f.levelOf(x) + ' and was put in ' + a);
        }
      });
    });
    if (wrong.length) {
      bad.push(wrong.length + ' item(s) are in a topic branch their own Level column says they '
        + 'cannot be in — the "wrong menu" fault:');
      wrong.slice(0, 8).forEach(t => bad.push('    ' + t));
      if (wrong.length > 8) bad.push('    \u2026 and ' + (wrong.length - 8) + ' more');
    }

    /* ---------- AND THE WHOLE CHOICE, AGAINST THE TREE RATHER THAN AGAINST THE INDEX ----------
       THE FIRST VERSION READ `topicIndex_.exact` FOR THE CANDIDATES AND COULD NOT FAIL ON THE
       FAULT IT WAS WRITTEN FOR. That index is what the fix CHANGED — it used to keep the first
       branch in file order and now keeps them all — so reverting it leaves one candidate per word,
       the rule's own `length < 2` guard skips it, and the two grammar questions go back under
       Number in silence. A check that reads the thing it is checking is not an oracle; proved by
       mutation, which is the only way that was ever going to be known.

       SO THE CANDIDATES COME FROM `data/topics.json` ITSELF, and what is asserted is the contract
       rather than the code: of the branches a word names, the ones the row's LEVEL permits are the
       ones available; if more than one is left the row's SUBJECT narrows it; and if exactly one
       survives the app must give that one, no more and no fewer. */
    const keys_ = nm => { const k = norm_(nm); return k ? [k, k.replace(/ies$/, 'y').replace(/s$/, '')] : []; };
    const byId_ = {}; tree.forEach(r => { if (r && r.topic_id) byId_[r.topic_id] = r; });
    const rootOf_ = r => { let cur = r, n = 0;
      while (cur && String(cur.parent_id || '').trim() && byId_[cur.parent_id] && n++ < 8) cur = byId_[cur.parent_id];
      return cur || r; };
    const branches = {};                       /* word key -> [root label, ...] */
    tree.forEach(r => {
      if (!r || !r.label) return;
      const area = rootOf_(r).label;
      let names = [r.label, String(r.topic_id || '').replace(/-/g, ' ')].concat(f.topicAtoms(r.aliases));
      if (!String(r.parent_id || '').trim()) names = names.concat(r.label.split(/[&/,]/));
      names.forEach(nm => keys_(nm).forEach(k => {
        (branches[k] = branches[k] || []);
        if (branches[k].indexOf(area) < 0) branches[k].push(area);
      }));
    });
    const subLim = {}, lvLim = {};
    roots.forEach(r => { subLim[r.label] = (f.topicAtoms(r.only_subject) || []).map(norm_);
                         lvLim[r.label]  = (f.topicAtoms(r.only_level)   || []).map(norm_); });

    const crossed = [];
    let decidedByLevel = 0;
    items.forEach(x => {
      const mine = norm_(String(x.subject || '')), lv = norm_(f.levelOf(x) || '');
      f.topicAtoms((x.row && x.row.topics) || x.topics).forEach(t => {
        const ks = keys_(t);
        const cands = branches[ks[0]] || branches[ks[1]];
        if (!cands || !cands.length) return;               /* the tree does not know the word */
        let ok = cands.filter(a => !(lv && lvLim[a].length && lvLim[a].indexOf(lv) < 0));
        if (ok.length > 1 && mine) {
          const fits = ok.filter(a => !(subLim[a].length && subLim[a].indexOf(mine) < 0));
          if (fits.length) ok = fits;
        }
        if (ok.length > 1 && lv) {
          const named = ok.filter(a => lvLim[a].indexOf(lv) >= 0);
          /* ---------- AND THIS STEP HAS NO DATA EXERCISING IT, WHICH IS WHY IT IS COUNTED ------
             `topicPick_` prefers a branch the row POSITIVELY matches over one that says nothing —
             what stops an A-level question tagged `proof` losing its area now that `proof` also
             reaches GCSE `Algebraic Proof`. Measured: NOT ONE row in the library uses any of the
             six shared words at A-level, so removing that step from the app changes nothing and
             this rule cannot fail on it. A guard with no reader is the shape this repository
             records under `resource_type` in `VOCAB`; it is kept because the row that exercises it
             is one transcription away, and it is COUNTED so that is a number rather than a
             silence. */
          if (named.length) { ok = named; decidedByLevel++; }
        }
        /* ONE WORD, THROUGH THE APP'S OWN RESOLVER. Asking it of the whole item blames the wrong
           word: a physics practical tagged `Reflection, Waves, Angles` is in Geometry because of
           ANGLES, which is a deliberate join, and the first version reported that as a fault. */
        const got = f.topicArea({ subject: x.subject, level: f.levelOf(x), topics: t })[0] || '';
        const want = ok.length === 1 ? ok[0] : '';
        if (got !== want) {
          crossed.push((x.key || x.name) + ' is ' + (x.subject || '?') + ' / ' + (f.levelOf(x) || '?')
            + ' and "' + t + '" names ' + cands.join(' + ') + ' \u2014 the tree allows it '
            + (want ? want : 'no one branch') + ' and the app gave it ' + (got || 'none'));
        }
      });
    });
    console.log('topic words whose branch was decided by the row\'s level: ' + decidedByLevel);
    if (crossed.length) {
      bad.push(crossed.length + ' topic word(s) landed somewhere the tree does not allow \u2014 the '
        + '"wrong menu" fault:');
      crossed.slice(0, 8).forEach(t => bad.push('    ' + t));
      if (crossed.length > 8) bad.push('    \u2026 and ' + (crossed.length - 8) + ' more');
    }

    /* ---------- CAN EITHER HALF OF THIS FIRE AT ALL -----------------------------------------------
       THE LEVEL HALF IS ENFORCED BY A DECLARATION, so deleting every declaration would make it
       silent rather than red — a check that cannot fail under a confident comment about what it
       protects, which this repository has deleted one of. If no branch says what level it is, the
       rule has no subject and says so. */
    if (!roots.some(r => String(r.only_level || '').trim())) {
      bad.push('no topic tree root declares `only_level`, so the branch-a-row-cannot-be-in rule '
        + 'has nothing to enforce and was NOT checked — not a pass');
    }

    /* EVERY ROOT SAYS WHAT SUBJECT IT IS, or the tie-break silently stops working for it. A root
       added without one is not a failure anybody would see: `brackets` resolved to the wrong one
       of two for as long as that column did not exist. */
    const noSubject = roots.filter(r => !String(r.only_subject || '').trim()).map(r => r.label);
    if (noSubject.length) {
      bad.push('topic tree root(s) with no `only_subject`, so nothing can tell which subject they '
        + 'belong to when a topic word reaches two branches: ' + noSubject.join(', '));
    }

    /* AND WHAT THE TIE-BREAK COULD NOT SETTLE, printed rather than failed. A word in two branches
       that the row cannot choose between gets NO area, which is the right answer and is still a
       question somebody could answer by editing the tree.

       READ OFF `topicIndex_` ITSELF rather than rebuilt here. A copy of that walk would have to
       repeat `topicKey_`, the singular fold and the root-halves split — and a second reader of one
       thing is a second chance to disagree about it, which is what this file records about
       `documents_()` and `paperLabels_`. The first version did rebuild it and answered 4 where the
       index says otherwise. */
    const ix = typeof f.topicIndex === 'function' ? f.topicIndex() : null;
    if (!ix || !ix.exact) {
      bad.push('`topicIndex_` is not declared, so the ambiguous topic words were NOT counted');
    } else {
      const shared = Object.keys(ix.exact).filter(k => (ix.exact[k] || []).length > 1);
      console.log('topic words that name more than one branch, so the row decides: ' + shared.length
        + (shared.length ? '  (' + shared.slice(0, 10).join(', ') + ')' : ''));
    }
  } else {
    bad.push('`topicAreaOf_` or `levelOf_` is not declared, so which branch a row was put in was '
      + 'NOT checked — not a pass');
  }

  /* ---------- LEVEL BEFORE KEY STAGE, AND A QUALIFICATION RATHER THAN A GREY AREA --------------------
     THE OWNER: *"key stage 3 and 4 shouldnt come before like the level … I prefer GCSE or SATs over
     grey areas."* Four answers, each through the app's own readers:
       1. Level is ahead of Key stage in the code's order AND in the live order the sheet makes;
       2. no item with a key stage has no level — 1,160 primary sheets had none, which kept Level
          under its coverage bar and put Key stage in front of it;
       3. no item's level is a bare KS1, KS2, KS4 or KS5 — those have a qualification to say;
       4. Key stage is asked INSIDE SATs AND NOWHERE ELSE. *"why is ks2 sats one tag? it should be
          sats. if they want to specify key stage then it should be its own thing."* So no level
          reads `KS1 SATs` or `KS2 SATs` (the level is `SATs`), inside SATs the question answers
          exactly `KS1 | KS2`, and inside every other level it answers nothing at all — `KS3 | KS4`
          inside GCSE is the exact screen first reported, and this was "at most one answer" until
          the key stage stopped riding inside the level's name. */
  {
    const all = f.stuffItems();
    const ksF = (f.facetList() || []).find(x => x.field === 'keystage');
    const at = (list, field) => (list || []).findIndex(x => x.field === field);
    if (typeof f.levelOf !== 'function' || !ksF) {
      bad.push('`levelOf_` or the `keystage` facet is missing, so Level against Key stage was NOT checked — not a pass');
    } else {
      [['the code', f.FACETS], ['the live funnel', f.facetList()]].forEach(([which, list]) => {
        if (!(at(list, 'level') >= 0 && at(list, 'level') < at(list, 'keystage')))
          bad.push('in ' + which + ' Key stage comes before Level (level at ' + at(list, 'level') + ', keystage at ' + at(list, 'keystage') + ')');
      });
      const ksOf = x => String(x.keystage || '').split(',').map(v => v.trim()).filter(Boolean);
      const noLevel = all.filter(x => ksOf(x).length && !f.levelOf(x));
      if (noLevel.length) bad.push(noLevel.length + ' item(s) carry a key stage and no level, e.g. "' + noLevel[0].name + '" (' + noLevel[0].keystage + ')');
      const bare = all.filter(x => /^KS[1245]$/i.test(String(f.levelOf(x) || '')));
      if (bare.length) bad.push(bare.length + ' item(s) give a bare key stage as their level, e.g. "' + bare[0].name + '" → ' + f.levelOf(bare[0]));
      const fused = all.filter(x => /\bKS\s*\d\s*SATs\b/i.test(String(f.levelOf(x) || '')));
      if (fused.length) bad.push(fused.length + ' item(s) still give the key stage inside the level, e.g. "' + fused[0].name
        + '" → ' + f.levelOf(fused[0]) + ' — the level is SATs and the key stage is its own question');
      const levels = {};
      all.forEach(x => { const l = f.levelOf(x); if (l) (levels[l] = levels[l] || []).push(x); });
      const askedIn = [];
      Object.keys(levels).forEach(l => {
        const vals = f.facetValues(levels[l], ksF).map(v => String(v.value)).sort();
        if (l === 'SATs') {
          if (vals.join('|') !== 'KS1|KS2') bad.push('inside Level SATs Key stage asks ' + JSON.stringify(vals) + ', wanted KS1 | KS2');
        } else if (vals.length) bad.push('inside Level ' + l + ' Key stage answers ' + vals.join(' | ') + ' — it is asked inside SATs only');
        if (vals.length > 1) askedIn.push(l);
      });
      if (!levels.SATs) bad.push('no item has the level SATs, so Key stage inside SATs was NOT checked — not a pass');
      console.log('Level against Key stage: ' + all.filter(x => ksOf(x).length).length + ' items with a key stage, '
        + Object.keys(levels).length + ' levels, Key stage asked inside ' + askedIn.length + ' of them ('
        + askedIn.join(', ') + ')');
    }
  }

  done();
});

function done() {
  console.log('');
  if (note.length) {
    console.log('WORTH A LOOK — not failures:');
    note.forEach(n => console.log('  ' + n));
    console.log('');
  }
  if (bad.length) {
    console.log('THE FUNNEL IS ASKING QUESTIONS THAT DO NOT WORK:');
    bad.forEach(b => console.log('  ' + b));
    console.log('');
    process.exit(1);
  }
  console.log('OK — every question the funnel asks can be answered more than one way except the '
              + 'Year, Month and Paper folders, which are asked even with one; no answer is spelled '
              + 'twice, and the sitting is asked in months.');
  process.exit(0);
}
