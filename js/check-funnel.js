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
  const library = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));
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
    if (o && o.body) return Promise.resolve(body_({ success: true }));
    return Promise.resolve(body_(fixture));
  };
  const src = loadOrder_().map(n => fs.readFileSync(path.join(ROOT, 'js', n + '.js'), 'utf8')).join('\n');
  try {
    w.eval(src + '\n;window.__f = { stuffItems, facetList, facetValues, facetCoverage,' +
      ' facetSplit_, nextFacet, FACET_MIN_MINORITY, FACET_MAX_ANSWERS, asList_,' +
      ' filterHit };');
  } catch (e) {
    bad.push('the app did not load: ' + e.message);
    return cb(null);
  }
  setTimeout(() => cb(w.__f), 1500);
}

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
