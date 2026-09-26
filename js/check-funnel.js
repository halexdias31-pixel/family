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
      ' facetSplit_, nextFacet, FACET_MIN_MINORITY, FACET_MAX_ANSWERS, asList_,' +
      ' filterHit, paperLabels_, stuffHay_, norm, RETIRED_FACETS,' +
      /* A THUNK, NOT THE OBJECT. `load()` ends with `DATA = d` — it REPLACES the payload — so a
         reference captured at eval time is the one from before the settings files landed, and the
         sheet reads as nought rows. Same trap `facetList`'s own memo is keyed against. */
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
  const wave = facets.find(x => x.field === 'examWave');
  if (wave) {
    const odd = f.facetValues(items, wave)
      .map(v => String(v.value))
      .filter(v => {
        const m = /^([A-Za-z]+) ((?:19|20)\d{2})$/.exec(v);
        return v && (!m || SERIES_WORDS.indexOf(m[1]) === -1);
      });
    if (odd.length) {
      bad.push('the sitting facet offers ' + odd.length + ' answer(s) that are not "<series> <year>", '
               + 'where <series> is one of ' + SERIES_WORDS.join('/') + ': '
               + odd.slice(0, 6).map(v => '"' + v + '"').join(', ')
               + ' — a second spelling of a sitting splits it into two buttons and hides half the '
               + 'questions behind whichever one nobody picks. See waveOf().');
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
       `bandNumbers_`  the answer is `11\u201320` and no row anywhere holds that string

     EACH ONE IS A CHANCE FOR A CHIP TO FIND NOTHING, silently — the list empties, the screen says
     "Nothing matches", and no error is thrown anywhere. Proved on the last of them: removing the
     band branch from `filterHit` makes pressing `11\u201320` return **0 questions where the row
     promised 15**, and every other check in this suite still passed.

     CHECKED AT TWO STATES, because a bug here is about a value, not about a state: the whole
     library, and one paper deep, where the bands and the short labels actually appear. */
  const promises = (label, list) => {
    facets.forEach(facet => {
      if (facet.collect) return;
      f.facetValues(list, facet).forEach(v => {
        const got = list.filter(x => f.filterHit(x, { field: facet.field, value: v.value })).length;
        if (got !== v.n) {
          bad.push('`' + facet.field + '` draws the answer "' + (v.show || v.value) + '" saying it '
            + 'holds ' + v.n + ' item(s) ' + label + ', and pressing it returns ' + got
            + ' — the row and `filterHit` disagree, so that chip empties the list with nothing '
            + 'on screen saying why. See shortLabels_, spellShow_ and bandNumbers_.');
        }
      });
    });
  };
  promises('in the whole library', items);
  const onePaper = items.filter(x => x.row && x.row.paper_id === 'P-1MA1-1705-1H');
  if (onePaper.length) promises('inside one paper', onePaper);

  /* ---------- 5. TWO FACETS, ONE MEANING --------------------------------------------------------
     The `level` / `stage` fault ACROSS facets: two questions offering the same answer word but
     landing on different result sets. Reported rather than failed — two facets legitimately share a
     word sometimes (a `Tier` of "A-Level" and a `Level` of "A-Level" are arguably both true) — but
     a person should look, because it is how "which one did I answer?" starts. */
  const answers = {};
  facets.forEach(facet => {
    if (facet.collect) return;
    f.facetValues(items, facet).forEach(v => {
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
    vals.forEach(v => {
      const held = new Set(qs.filter(x => f.filterHit(x, { field: 'paperId', value: v.value }))
                             .map(x => x.row.paper_id));
      if (held.size > 1) {
        bad.push('the Paper answer "' + (v.show || v.value) + '" holds ' + held.size
                 + ' different papers: ' + [...held].join(', '));
      }
    });
    console.log('\nTHE PAPER QUESTION: ' + vals.length + ' answers over ' + ids.size
                + ' papers' + (vals.length === ids.size ? ' — one each' : ''));
    if (vals.length !== ids.size) {
      bad.push('the Paper question offers ' + vals.length + ' answers for ' + ids.size + ' papers');
    }
  }

  /* ---------- AND THE PAPERS THE RULE ABOVE CANNOT REACH -----------------------------------------
     THAT RULE IS ON THE ITEMS, so a paper with no questions under it yet produces no items and is
     invisible to it. 425 of the library's papers are in that state — the transcription queue — and
     two of them arriving with the same label is a fault that shows up on the day somebody types
     the questions in, not on the day the rows land.

     IT HAPPENED. AQA Combined Science June 2024 went in beside the Edexcel papers already there,
     and `Biology Paper 1 \u2014 June 2024` is a true name of an 8464/B/1H and of a 1SC0/1BH. They
     agree on subject and on tier as well, so `paperLabels_` appended `\u00b7 Higher` to both and
     drew ONE button over two different papers. The board rung in that function is the fix; this is
     what would have named it.

     PRINTED, NOT FAILED, and the 17 it prints are why: thirteen are an `RS\u2026` stub sitting
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
      { say: 'Subject · Physics, Sitting · Summer 2024',
        on: [['subject', 'Physics'], ['examWave', 'Summer 2024']] },
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
  console.log('OK — every question the funnel asks can be answered more than one way, '
              + 'no answer is spelled twice, and the sitting has one vocabulary.');
  process.exit(0);
}
