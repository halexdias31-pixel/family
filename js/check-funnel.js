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
    if (o && o.body) return Promise.resolve(body_({ success: true }));
    return Promise.resolve(body_(fixture));
  };
  const src = loadOrder_().map(n => fs.readFileSync(path.join(ROOT, 'js', n + '.js'), 'utf8')).join('\n');
  try {
    w.eval(src + '\n;window.__f = { stuffItems, facetList, facetValues, facetCoverage,' +
      ' facetSplit_, nextFacet, FACET_MIN_MINORITY, FACET_MAX_ANSWERS, asList_ };');
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
       and doors are allowed to be lopsided. */
    if (offered && !facet.always) {
      const split = f.facetSplit_(items, facet);
      if (split < f.FACET_MIN_MINORITY) {
        bad.push('`' + facet.field + '` (' + facet.label + ') is offered but cannot narrow: only '
                 + (split * 100).toFixed(2) + '% of the items that can answer it fall outside the '
                 + 'commonest answer. A question with one real answer is a tap that does nothing.');
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
     ever reaches the funnel it shows up here as an answer that is not `<Month> <year>`, which is
     what "First wave" was doing for 850 rows while every other check passed. */
  const wave = facets.find(x => x.field === 'examWave');
  if (wave) {
    const odd = f.facetValues(items, wave)
      .map(v => String(v.value))
      .filter(v => v && !/^[A-Z][a-z]+ (?:19|20)\d{2}$/.test(v));
    if (odd.length) {
      bad.push('the sitting facet offers ' + odd.length + ' answer(s) that are not "<Month> <year>": '
               + odd.slice(0, 6).map(v => '"' + v + '"').join(', ')
               + ' — a second spelling of a sitting splits it into two buttons and hides half the '
               + 'questions behind whichever one nobody picks. See waveOf().');
    }
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
