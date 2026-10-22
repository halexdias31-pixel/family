#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-funnel.js THE FUNNEL, RUN AGAINST THE REAL LIBRARY, ASKED WHETHER ITS QUESTIONS ARE WORTH ASKING. § */
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
    /* ---------- AND THE REAL PRACTICALS, WHICH THIS HARNESS HAD NEVER LOADED § */
    if (String(url).includes('practicals.json')) return Promise.resolve(body_(practicals));
    /* ---------- AND EVERY OTHER `data/` FILE, WHICH IS THE SAME FAULT TWICE MORE § */
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
      ' filterHit, facetOwn_, STUFF, stuffHay_, norm,' +
      ' stuffNarrow_, stuffWords_, tagOf_, TAG_OF, FACET_KEYS, FACET_COVERAGE, facetWhy_, facetSay_,' +
      ' answerCmp_, placeChipDead_, NEED_WORDS,' +
      /* THE LIST THE APP DRAWS, SORTED, AND THE LAST-RESORT QUESTION -- so 4e can ask what a person
         is shown once a paper is chosen, through the same two functions the screen asks. */
      ' stuffFiltered, overFacet_,' +
      ' chipShow_, tagRow_,' +
      /* THE CARD'S ROW AS A LIST -- `tagRow_`'s own markup read back, so this reads what is drawn and
         not a second copy of the rule (docs/history/355). */
      ' tagList_: (x, p) => { const d = document.createElement("div"); d.innerHTML = tagRow_(x, p);' +
      ' return [...d.querySelectorAll(".qtag")].map(t => ({ tag: t.getAttribute("data-tag") || "",' +
      ' text: t.textContent, field: t.getAttribute("data-f") || "" })); },' +
      ' RETIRED_FACETS, waveOf,' +
      /* A THUNK, NOT THE OBJECT. § */
      /* THE TOPIC TREE, ITS READER AND `topicAtoms_` WERE EXPORTED HERE for rule 8, and went with
         it — see the note where rule 8 was. `levelOf_` stays: the key-stage rule reads it. */
      ' levelOf: levelOf_,' +
      ' facetsLive: () => (DATA && DATA.facets) || [], FACETS,' +
      ' FACET_TALLY,' +
      /* THE SECOND FINDER (docs/history/329, 347): its binding, its record and its state, so the pass at
         the end asks Find 2's questions the way the app asks them. */
      ' inFinder_, finderOf_, kindOf_, stuffItemsAll_, RES_ST: typeof RES_ST !== "undefined" ? RES_ST : null };');
  } catch (e) {
    bad.push('the app did not load: ' + e.message);
    return cb(null);
  }
  setTimeout(() => cb(w.__f), 1500);
}

/* THE RAW FILE, NOT THE MAPPED ITEMS. `stuffItems` drops every `kind: 'document'` row, and a
   paper-level fact — the code on the cover, the total, the link — lives on exactly those. */
const LIBRARY = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));

/* A value the funnel would draw on a button, reduced to the thing a person would say it is. § */
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

  /* ---------- 0. WHAT THE FIND SCREEN HOLDS IS WHAT THE OWNER SAID IT HOLDS § */
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
  /* AND EVERYTHING ELSE. § */
  if (f.kindOf_ && f.stuffItemsAll_) {
    const notFor = x => { const g = [].concat(x.groups || f.kindOf_(x).group || []).filter(Boolean);
                          return g.length && g.every(k => k === 'Booking' || k === 'Shop'); };
    const wholeKinds = [...new Set(f.stuffItemsAll_().filter(x => !notFor(x)).map(x => x.kind))];
    const missing = wholeKinds.filter(k => !kindsHeld[k]);
    if (missing.length) bad.push('Find\'s list holds no ' + missing.join(', ') + ' — the whole list does, and Find carries everything the funnel is for (347)');
    ['content', 'boxer', 'fight'].forEach(k => { if (!kindsHeld[k]) bad.push('Find holds no ' + k + ' — the content cards and the resources are Find\'s too (347)'); });
  } else bad.push('`kindOf_` or `stuffItemsAll_` is not exported, so Find holding everything was NOT checked');

  /* ---------- 1. EVERY FACET IS THE SAME KIND OF THING, ASKED, SORTED, SAID AND COLOURED BY ONE RULE (396) § */
  {
    const keys = f.FACET_KEYS || [];
    if (!keys.length) bad.push('FACET_KEYS is not exported, so the facets\' shape was NOT checked — not a pass');
    f.FACETS.forEach(x => {
      const extra = Object.keys(x).filter(k => keys.indexOf(k) === -1);
      if (extra.length) bad.push('`' + x.field + '` carries ' + extra.join(', ') + ' — a facet is a field, a label and its readers (' + keys.join(', ') + '); a behaviour of its own is the special case the owner asked to be rid of');
    });
    facets.forEach(x => {
      ['min', 'always', 'folder', 'grid', 'only', 'tagOnly'].forEach(k => { if (k in x) bad.push('the live `' + x.field + '` carries `' + k + '` — the sheet or the code gave one facet a rule of its own'); });
      if (!f.tagOf_(x.field)) bad.push('`' + x.field + '` has no tag colour — TAG_OF and its default must colour every facet');
    });
    if (f.tagOf_('aFacetTheSheetInvented') !== f.tagOf_('another')) bad.push('two unlisted facets get different colours — a facet nobody listed takes the one default');
    if (!f.tagOf_('aFacetTheSheetInvented')) bad.push('a facet the sheet invents gets no colour');
    /* ONE BAR: the tab has no coverage column, and the sort is the tab's order alone. */
    const rows = f.facetsLive();
    if (rows.some(r => r && 'minCoverage' in r)) bad.push('the facets reach the app with a minCoverage — one coverage bar (FACET_COVERAGE) is the only one');
    try {
      const sheet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'facets.json'), 'utf8'));
      const cols = sheet.filter(r => r && 'min_coverage' in r).map(r => r.field);
      if (cols.length) bad.push('data/settings/facets.json has a min_coverage cell on ' + cols.join(', ') + ' — nothing reads it, and a cell that does nothing misleads whoever types in it');
    } catch (e) { bad.push('data/settings/facets.json could not be read — its columns were NOT checked'); }
    for (let i = 1; i < facets.length; i++) {
      if (facets[i].at < facets[i - 1].at) { bad.push('the live facets are not in the tab\'s sort_order: `' + facets[i - 1].field + '` (' + facets[i - 1].at + ') before `' + facets[i].field + '` (' + facets[i].at + ')'); break; }
    }
  }
  /* AND ASKED BY THE ONE TEST: the first facet in the tab's order that `facetWhy_` passes, whatever it is. */
  if (f.facetWhy_) {
    const first = facets.find(x => !f.facetWhy_(items, x));
    const asked = f.nextFacet(items);
    if ((first && first.field) !== (asked && asked.field)) bad.push('nextFacet asks `' + (asked && asked.field) + '` where the one rule picks `' + (first && first.field) + '`');
  }
  /* ---------- 1b. ONE ORDER FOR ANSWERS, BY WHAT THEY ARE; ONE WAY TO SAY THEM § */
  if (f.answerCmp_ && f.facetSay_) {
    const order = (texts, want, say) => {
      const got = texts.slice().sort(f.answerCmp_(texts));
      if (got.join('|') !== want.join('|')) bad.push(say + ' sorts as ' + got.join(', ') + ', wanted ' + want.join(', '));
    };
    order(['2019', '2024', '2017'], ['2024', '2019', '2017'], 'years');
    order(['May 2019', 'June 2024', 'November 2019'], ['June 2024', 'November 2019', 'May 2019'], 'dates');
    order(['10', '2', '1'], ['1', '2', '10'], 'numbers');
    order(['November', 'June', 'May'], ['May', 'June', 'November'], 'months');
    order(['iv', 'ii', 'i', 'iii'], ['i', 'ii', 'iii', 'iv'], 'roman numerals');
    order(['Q10', 'Q2', 'Q1'], ['Q1', 'Q2', 'Q10'], 'names with numbers');
    order(['Higher', 'Foundation'], ['Foundation', 'Higher'], 'words');
    const say = (v, want) => { const got = f.facetSay_({}, v); if (got !== want) bad.push('"' + v + '" is said "' + got + '", wanted "' + want + '"'); };
    say('a', 'a'); say('ii', 'ii'); say('past paper', 'Past paper'); say('AQA', 'AQA'); say('.1', '.1');
    /* AND EVERY FACET OVER THE LIBRARY SAYS ITS ANSWERS THAT WAY, in that order. */
    facets.forEach(x => {
      const vals = f.facetValues(items, x);
      const texts = vals.map(v => v.text);
      const cmp = f.answerCmp_(texts);
      for (let i = 1; i < texts.length; i++) {
        if (cmp(texts[i - 1], texts[i]) > 0) { bad.push('`' + x.field + '` draws "' + texts[i - 1] + '" before "' + texts[i] + '" — not the one order its answers\' kind has'); break; }
      }
      vals.forEach(v => { if (v.text !== f.facetSay_(x, v.value)) bad.push('`' + x.field + '` says "' + v.value + '" as "' + v.text + '" — not the one way'); });
    });
  } else bad.push('`answerCmp_` or `facetSay_` is not exported, so the one order and the one way of saying were NOT checked — not a pass');

  facets.forEach(facet => {
    const vals = f.facetValues(items, facet);
    const cov = f.facetCoverage(items, facet);

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

    /* ---------- 3. A FACET FED BY A LITERAL § */
    if (vals.length === 1 && cov > 0.9) {
      note.push('`' + facet.field + '` returns "' + vals[0].value + '" for all ' + vals[0].n
                + ' items that answer it — check it is reading a column and not a literal');
    }
  });

  /* ---------- 4. THE SITTING HAS ONE VOCABULARY § */
  const SERIES_WORDS = ['Summer', 'Autumn', 'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
  /* A MONTH WORD AND A YEAR IN ONE STRING — the `June 2024` pill. Read by the card rule in 4 and the
     Paper-answer rule in 4f, so the two cannot disagree about what "fused" means. */
  const MONTHS_LC = SERIES_WORDS.slice(2).map(m => m.toLowerCase());
  const fusedDate_ = s => /\b(19|20)\d{2}\b/.test(String(s))
    && MONTHS_LC.some(m => new RegExp('\\b' + m + '\\b', 'i').test(String(s)));
  /* ---------- THE SITTING IS TWO QUESTIONS NOW, SO THE RULE IS THREE § */
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
        /* THE CARD AND THE FOLDER SAY THE SAME MONTH. § */
        /* ---------- AND THE CARD SAYS THEM AS TWO TAGS, THE WAY THE FOLDERS ASK THEM § */
        if (ms.length && f.tagList_) {
          const id = (x.row && x.row.paper_id) || x.id || '?';
          if (!tagsRead[id]) {
            tagsRead[id] = 1;
            const tags = f.tagList_(x) || [];
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
               + ' — the funnel asks Year and then Month, so the card says them as two tags. See tagRow_.');
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
    /* A PAPER WITH A YEAR AND NO MONTH IS IN THE YEAR FOLDER AND IN NO MONTH FOLDER INSIDE IT, so the Month question would hide it behind whichever month somebody § */
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

  /* ---------- 4a. YEAR, MONTH, PAPER -- ASKED LIKE EVERY OTHER QUESTION, SO NEVER WITH ONE ANSWER (396) § */
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
      const levels = levelF ? valuesAt(MATHS_PAST, levelF) : [];
      levels.forEach(lv => {
        const at = MATHS_PAST.concat([{ field: 'level', value: lv.value }]);
        const years = valuesAt(at, syear);
        if (years.length !== 1) return;
        /* Tier and anything else the level still splits on come first, as a thumb would meet them. */
        let chips = at.slice();
        for (let i = 0; i < 6 && asks(chips) !== 'examYear'; i++) {
          const q = asks(chips);
          const facet = facets.find(x => x.field === q);
          const v = facet && valuesAt(chips, facet)[0];
          if (!v) break;
          chips = chips.concat([{ field: q, value: v.value }]);
        }
        walked++;
        const steps = [['examYear', syear], ['examMonth', smonth], ['paperId', paperF]];
        steps.forEach(([field, facet]) => {
          const got = asks(chips), n = valuesAt(chips, facet).length;
          if (got === field && n < 2) {
            bad.push(lv.value + ' maths past papers: the funnel asks `' + field + '` with ' + n + ' answer(s) -- '
                     + 'a question with one answer is not asked, Year, Month and Paper included. See facetWhy_().');
          }
          const v = facet && valuesAt(chips, facet)[0];
          if (v) chips = chips.concat([{ field: field, value: v.value }]);
        });
      });
      /* AND A MONTH THAT HOLDS ONE PAPER, whose Paper question has one answer and is not asked. */
      const tierF = facets.find(x => x.field === 'tier');
      const gcse = MATHS_PAST.concat([{ field: 'level', value: 'GCSE' }]);
      const single = [];
      (tierF ? valuesAt(gcse, tierF) : []).forEach(t => {
        const at = gcse.concat([{ field: 'tier', value: t.value }]);
        const ys = valuesAt(at, syear);
        ys.forEach(y => {
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
        if (got === 'paperId') {
          bad.push('one paper in ' + single[0].slice(-3).map(c => c.value).join(' · ') + ' and the funnel '
                   + 'asks Paper with that one answer. See facetWhy_().');
        }
      }
    } finally { f.STUFF.filters = was; }
    console.log('  One answer: ' + walked + ' single-answer walk(s) through Year, Month and Paper, none asked');
    if (!walked) {
      bad.push('nothing in the library is a year or a month holding one thing, so the '
               + 'one-answer rule has nothing to measure: not a pass');
    }
  }

  /* ---------- 4b. TWO ANSWERS, ONE LABEL § */
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

  /* ---------- 4c. AN ANSWER MUST RETURN WHAT ITS OWN ROW PROMISED § */
  const promises = (label, list) => {
    facets.forEach(facet => {
      if (facet.collect) return;
      f.facetValues(list, facet).forEach(v => {
        const got = list.filter(x => f.filterHit(x, { field: facet.field, value: v.value })).length;
        if (got !== v.n) {
          bad.push('`' + facet.field + '` draws the answer "' + (v.show || v.value) + '" saying it '
            + 'holds ' + v.n + ' item(s) ' + label + ', and pressing it returns ' + got
            + ' — the row and `filterHit` disagree, so that chip empties the list with nothing '
            + 'on screen saying why. See facetTally_ and filterHit.');
        }
      });
    });
  };
  promises('in the whole library', items);
  const onePaper = items.filter(x => x.row && x.row.paper_id === 'P-1MA1-1705-1H');
  if (onePaper.length) promises('inside one paper', onePaper);

  /* ---------- 4d. NO ANSWER IS A RANGE, AND A RANGE CHIP KEPT FROM BEFORE IS DROPPED (290, 396) § */
  {
    const ranged = [];
    facets.forEach(x => f.facetValues(items, x).forEach(v => { if (v.bucket) ranged.push(x.field + ' ' + v.value); }));
    if (ranged.length) bad.push('answers drawn as ranges: ' + ranged.slice(0, 5).join(', '));
    if (!f.placeChipDead_ || !f.placeChipDead_({ field: 'subject', value: 'Science', bucket: true })) bad.push('a kept range chip (`bucket`) is not dropped — nothing answers one since the tables went');
  }

  /* ---------- 4e. AFTER PAPER, THE PAPER -- ITS QUESTIONS, IN ORDER, AND THE FUNNEL GOES ON BY THE SAME RULE (396) § */
  ['question', 'part'].forEach(old => {
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
        if (next) after[next.field] = (after[next.field] || 0) + 1;
        /* A PAPER IS NOT AN END (396): the one rule still asks — Question, when it has two numbers or more. */
        const qF = facets.find(x => x.field === 'qNumber');
        const nums = qF ? f.facetValues(list, qF).length : 0;
        if (nums >= 2 && nums <= f.FACET_MAX_ANSWERS && !next && out.length < 6) {
          out.push(id + ' has ' + nums + ' question numbers and the funnel asks nothing');
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
    if (out.length) {
      bad.push('a chosen paper ends the funnel where the one rule would still ask: ' + out.join('; '));
    }
    if (!after.qNumber) bad.push('no chosen paper goes on to ask Question, so the after-Paper rule proves nothing');
    console.log('  After Paper: ' + walkedP + ' paper(s) chosen through Year and Month, each the whole paper in question order; '
                + 'next asked: ' + askedAfter.map(k => k + ' ' + after[k]).join(', '));
    if (walkedP < 100) bad.push('only ' + walkedP + ' paper(s) could be chosen, so the after-Paper rule '
                                + 'measures almost nothing — not a pass');
  } else {
    bad.push('`stuffFiltered` or `nextFacet` is not declared, or the sitting is not two questions, so what '
             + 'follows Paper cannot be read — not a pass');
  }

  /* ---------- 5. TWO FACETS, ONE MEANING § */
  const answers = {};
  facets.forEach(facet => {
    /* A QUESTION NOBODY IS ASKED CANNOT BE CONFUSED WITH ONE THAT IS. § */
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

  /* ---------- 6. WHAT THE SEARCH BOX CAN SEE, PER KIND § */
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

  /* ---------- 6b. THE CODE PRINTED ON THE COVER HAS TO FIND THE PAPER § */
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

  /* ---------- 6c. A PAST PAPER IS FOUND BY THE WORDS A STUDENT SAYS IT IN (365): level, tier, its name. "Paper 2" finds no Paper 1. */
  const said = {};
  items.forEach(x => {
    const r = x.row || {};
    if (x.kind !== 'question' || !r.paper_id || !x.tier || !r.level || !/past paper/i.test(x.documentType || '') || said[r.paper_id]) return;
    said[r.paper_id] = [r.level, x.subject, x.tier, x.sub].join(' ');
  });
  const byWords = Object.keys(said).filter(pid => {
    const got = f.stuffNarrow_(items, [], f.stuffWords_(said[pid]));
    const n = /\bpaper (\d+)/i.exec(said[pid]);
    return !got.some(x => x.row && x.row.paper_id === pid)
      || (n && got.some(x => x.row && /\bpaper (\d+)/i.test(x.sub || '') && /\bpaper (\d+)/i.exec(x.sub)[1] !== n[1]));
  });
  if (Object.keys(said).length < 20) bad.push('only ' + Object.keys(said).length + ' past papers with a tier and a level reached 6c — the search was NOT proved');
  byWords.slice(0, 10).forEach(pid => bad.push(pid + ': typing "' + said[pid] + '" does not find it, or finds another numbered paper with it'));
  /* THE BACKLOG, PRINTED. § */
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

  /* ---------- 6c. A PAPER-LEVEL FACT HAS TO REACH EVERY QUESTION UNDER IT § */
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
    /* IN THE WORDS THE ITEM CARRIES (`NEED_WORDS`): `No calculator` on the cover is `Non-calculator` on the question. */
    const want = f.asList_(String(docNeeds[pid]).split(',')).map(w => (f.NEED_WORDS || {})[String(w).trim().toLowerCase()] || w);
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

  /* ---------- AN ANSWER THAT NAMES A THING MUST NAME EXACTLY ONE OF THEM § */
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
    console.log('\nTHE PAPER QUESTION: ' + vals.length + ' answer(s) over ' + ids.size + ' papers'
                + (vals.length === ids.size ? ' — one each' : ''));
    if (vals.length !== ids.size) {
      bad.push('the Paper question offers ' + vals.length + ' answers for ' + ids.size + ' papers');
    }
  }

  /* ---------- AND TWO PAPERS ARE NEVER DRAWN THE SAME, OVER THE WHOLE LIBRARY: a shared name says what tells them apart (`tellApart_`) § */
  if (paperFacet) {
    const qs = items.filter(x => x && x.row && x.row.paper_id);
    const byShow = {};
    f.facetValues(qs, paperFacet).forEach(v => { (byShow[v.show] = byShow[v.show] || []).push(v.value); });
    const shared = Object.keys(byShow).filter(l => byShow[l].length > 1);
    const told = Object.keys(byShow).filter(l => / \u00b7 /.test(l));
    console.log('\nPAPERS TOLD APART BY ANOTHER FACET: ' + told.length + (told.length ? ', e.g. ' + told.slice(0, 3).map(l => JSON.stringify(l)).join(', ') : ''));
    if (shared.length) bad.push(shared.length + ' paper label(s) still stand for two papers over the whole library, so nothing on the screen tells them apart: '
      + shared.slice(0, 5).map(l => JSON.stringify(l) + ' ' + byShow[l].join(', ')).join('; '));
  }

  /* ---------- A PAPER'S LABEL SAYS NOTHING THE SCREEN HAS ALREADY ANSWERED § */
  if (typeof f.facetValues === 'function') {
    const paper = f.facetList().find(x => x.field === 'paperId');
    const LOOK = [
      { say: 'Subject · Biology', on: [['subject', 'Biology']] },
      { say: 'Subject · Chemistry, Tier · Higher',
        on: [['subject', 'Chemistry'], ['tier', 'Higher']] },
      { say: 'Subject · Physics, Year · 2024, Month · June',
        on: [['subject', 'Physics'], ['examYear', '2024'], ['examMonth', 'June']] },
      /* THE YEAR IS ASSERTED TOO, AND THAT TOOK MOVING A RUNG. § */
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

  /* ---------- 4f. UNDER A YEAR OR MONTH CHIP, EVERY PAPER ANSWER IS ONE NAME, AND ITS CHIP SAYS WHAT IT SAID (396) § */
  if (f.nextFacet && f.stuffNarrow_ && f.chipShow_ && syear && smonth) {
    const paperF = facets.find(x => x.field === 'paperId');
    const was = { q: f.STUFF.q, filters: f.STUFF.filters.slice() };
    const listAt = chips => { f.STUFF.q = ''; f.STUFF.filters = chips.slice(); return f.stuffNarrow_(items, chips, [], null); };
    const chipOf = (v, field) => ({ field: field, value: v.value });
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
        f.facetValues(list, paperF).forEach(v => out.push({ chips: chips, v: v }));
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
          labelsAt(chips).forEach(({ chips: c, v }) => {
            const show = String(v.show || v.value);
            read++;
            const where = c.filter(x => x.field !== 'forLabel' && x.field !== 'kindLabel')
              .map(x => x.any ? x.field + ' skipped' : x.value).join(' · ');
            const pressed = c.concat([{ field: 'paperId', value: v.value }]);
            f.STUFF.filters = pressed.slice();
            const chip = f.chipShow_(pressed[pressed.length - 1], pressed.length - 1);
            if (chip !== show) {
              bad.push(where + ': pressing "' + show + '" makes a chip reading "' + chip + '" — a chip says what its button said.');
            }
          });
        });
        /* AND NO TWO ANSWERS UNDER ONE ROUTE READ THE SAME. */
        routes.forEach(route => {
          const shows = labelsAt(at.concat(route)).map(({ v }) => String(v.show || v.value));
          if (new Set(shows).size !== shows.length) bad.push('two Paper answers read the same under ' + route.map(c => c.any ? c.field + ' skipped' : c.value).join(' · ') + ': ' + shows.join(' | '));
          unsaid += shows.length;
        });
      });
    } finally { f.STUFF.q = was.q; f.STUFF.filters = was.filters; }
    console.log('  Paper answers under a Year or Month chip: ' + read + ' read and pressed at ' + folders.length
                + ' year folder(s); ' + unsaid + ' compared, none reading the same as another');
    if (!read) bad.push('no Paper answer was read under a Year or Month chip, so the half-a-date rule proves nothing');
  } else {
    bad.push('`chipShow_`, `nextFacet` or `stuffNarrow_` is not declared, or the sitting is not two '
             + 'questions, so the Paper answers under a Year or Month chip cannot be read — not a pass');
  }

  /* ---------- A SATs PAPER IS `Paper 1` ON THE MENU, ON THE CHIP AND ON THE CARD § */
  if (typeof f.chipShow_ === 'function' && typeof f.tagList_ === 'function' && f.STUFF) {
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
          const tags = q ? f.tagList_(q) : [];
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
      /* ---------- AND WITH THE YEAR SKIPPED § */
      const months = f.facetValues(kept, byField('examMonth') || yearF);
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
            /* THE SHORTEST NAME THAT IS STILL ONE PAPER (396): the number, and its date where two sittings share the number. */
            const shape = /^Paper \d+( [\u2014\u2013] [A-Za-z]+ (19|20)\d{2})?$/;
            if (!shape.test(show)) {
              bad.push(say + ': the Paper answer reads ' + JSON.stringify(show) + ' — the number, and the '
                       + 'date where two sittings share it, and nothing else. See nameForms_() and shortLabels_().');
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

    /* ---------- A CARD'S SUBJECT IS THE SUBJECT QUESTION'S, AND A 5-A-DAY'S DAY IS ITS DAY ANSWER § */
    const subjectF = byField('subject');
    const seenPaper = {};
    let cards = 0, fives = 0;
    items.forEach(x => {
      const pid = x.kind === 'question' && x.row && x.row.paper_id;
      if (!pid || seenPaper[pid]) return;
      seenPaper[pid] = 1;
      cards++;
      const tags = f.tagList_(x) || [];
      const own = subjectF ? f.asList_(subjectF.of(x)).map(String) : [];
      tags.filter(t => t.tag === 'subject').forEach(t => {
        if (own.indexOf(t.text) === -1) {
          bad.push(pid + ': the card wears a green subject tag ' + JSON.stringify(t.text) + ' that is not its '
                   + 'Subject answer (' + JSON.stringify(own) + ') — see tagRow_().');
        }
      });
      const dayF = byField('fiveDay');
      if (String(x.row.document_type || '') === '5-a-day' && dayF && f.tagOf_) {
        fives++;
        const day = f.facetSay_(dayF, f.asList_(dayF.of(x))[0] || '');
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
    bad.push('`chipShow_` or `tagRow_` is not declared, so the SATs tags cannot be checked — not a pass');
  }

  /* ---------- A `facets` ROW NAMING A FIELD NOTHING ANSWERS IS A DEAD ROW § */
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
      /* ---------- DECLARED IN CODE *OR* ANSWERED BY SOMETHING — NOT "ANSWERED", FULL STOP § */
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


  /* ---------- AT EVERY STATE OF THE REAL FUNNEL: NO QUESTION ASKED PAST FACET_MAX_ANSWERS, NONE ASKED OF A LIST THAT CANNOT
     ANSWER IT, AND THE LAST RESORT THE FEWEST (396) — one rule where the fence, the grids and the doors were § */
  if (f.facetValues && f.filterHit) {
    const keep = (list, facet, v) => list.filter(x => f.filterHit(x, { field: facet.field, value: v.value }));
    const tooLong = [], strays = [], resort = [];
    let states = 0, resorts = 0;
    const lookAsk = (say, list) => {
      if (!list.length) return;
      states++;
      let facet = null;
      try { facet = f.nextFacet(list); } catch (e) { tooLong.push(say + ': nextFacet threw ' + e.message); return; }
      if (facet) {
        const n = f.facetValues(list, facet).length;
        if (n > f.FACET_MAX_ANSWERS) tooLong.push('`' + facet.field + '` asks with ' + n + ' answers at ' + (say || 'the top'));
        if (/^bible/.test(facet.field) && !list.every(x => x.kind === 'bible')) strays.push('`' + facet.field + '` asked at ' + (say || 'the top'));
        return;
      }
      const over = f.overFacet_(list);
      if (!over) return;
      resorts++;
      const n = f.facetValues(list, over).length;
      const fewer = f.facetList().filter(x => x.field !== over.field && !f.STUFF.filters.some(c => c.field === x.field)
        && f.facetValues(list, x).length > f.FACET_MAX_ANSWERS && !f.facetWhy_(list, x, true)
        && f.facetValues(list, x).length < n);
      if (fewer.length) resort.push((say || 'the top') + ': the last resort asks `' + over.field + '` (' + n + ') where `' + fewer[0].field + '` has fewer');
    };
    const all = f.stuffItems();
    lookAsk('', all);
    ['forLabel', 'kindLabel'].forEach(field => {
      const facet = f.facetList().find(x => x.field === field);
      if (!facet) return;
      f.facetValues(all, facet).forEach(v => lookAsk(facet.label + ' · ' + (v.show || v.value), keep(all, facet, v)));
    });
    /* AND THE GREEDY PATH THROUGH THE LIBRARY, which is where the complaint came from. */
    let list = all;
    const said = [];
    for (let step = 0; step < 12 && list.length > 1; step++) {
      const facet = f.nextFacet(list);
      if (!facet) break;
      const vals = f.facetValues(list, facet);
      if (!vals.length) break;
      let best = vals[0];
      vals.forEach(v => { if (v.n > best.n) best = v; });
      said.push(facet.label + ' · ' + (best.show || best.value));
      list = keep(list, facet, best);
      lookAsk(said.join(' → '), list);
    }
    /* AND EVERY KIND ALONE, which is where a question made for one kind would show itself. */
    const kinds = {};
    all.forEach(x => { (kinds[x.kind] = kinds[x.kind] || []).push(x); });
    Object.keys(kinds).forEach(k => lookAsk('every ' + k, kinds[k]));
    if (!(f.inFinder_ && f.finderOf_ && f.finderOf_('res'))) bad.push('the second finder is not exported, so whether it holds Find\'s list was NOT checked — not a pass');
    if (tooLong.length) {
      bad.push('a question is ASKED with more answers than FACET_MAX_ANSWERS, so the whole list is drawn '
               + 'where the other questions should have narrowed it first: ' + tooLong.slice(0, 6).join('; '));
    }
    if (strays.length) bad.push('a Bible question is asked of a list that is not the Bible — the coverage rule should hold it: ' + strays.slice(0, 5).join('; '));
    if (resort.length) bad.push(resort.slice(0, 5).join('; '));
    if (states < 10) bad.push('only ' + states + ' states of the funnel were read — not a pass');
    console.log('\nTHE ONE RULE AT ' + states + ' STATES OF THE REAL FUNNEL: nothing asked past ' + f.FACET_MAX_ANSWERS
                + ' answers, no Bible question off the Bible, ' + resorts + ' last resort(s), each the fewest');
  } else {
    bad.push('`facetValues` or `filterHit` is not declared, so the funnel\'s states cannot be read - not a pass');
  }

  /* RULE 8 WAS HERE — A BRANCH A ROW CANNOT HONESTLY BE IN § */

  /* ---------- LEVEL BEFORE KEY STAGE, AND A QUALIFICATION RATHER THAN A GREY AREA § */
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
        }
        if (vals.length > 1) askedIn.push(l);
      });
      if (!levels.SATs) bad.push('no item has the level SATs, so Key stage inside SATs was NOT checked — not a pass');
      /* KEY STAGE IS AN ORDINARY QUESTION (396): asked wherever it splits a list, by the one rule. */
      console.log('Level against Key stage: ' + all.filter(x => ksOf(x).length).length + ' items with a key stage, '
        + Object.keys(levels).length + ' levels, Key stage asked inside ' + askedIn.length + ' of them ('
        + askedIn.join(', ') + ')');
    }
  }

  /* FIND 2, THE SAME FINDER TWICE (docs/history/347). § */
  if (f.inFinder_ && f.finderOf_ && f.finderOf_('res') && f.RES_ST) {
    const RF = f.finderOf_('res');
    const S = f.RES_ST;
    const keyOf = x => String(x.key || x.kind + ':' + x.name);
    const fItems = f.stuffItems();
    const fFirst = f.nextFacet(fItems.slice());
    const fFirstVals = fFirst ? f.facetValues(fItems, fFirst) : [];
    const show = (q, vals) => (q ? q.field + ' [' + vals.map(v => (v.show || v.value) + ' ' + v.n).join(' | ') + ']' : 'nothing');
    /* c, Find's side, outside any binding: the question after each answer of the first. */
    const nextOf = list => { const q = f.nextFacet(list.slice()); return show(q, q ? f.facetValues(list, q) : []); };
    const rung = fFirst ? fFirstVals.map(v => {
      const chip = { field: fFirst.field, value: v.value };
      f.STUFF.filters = [chip];
      const l = fItems.filter(x => f.filterHit(x, chip));
      const said = nextOf(l);
      f.STUFF.filters = [];
      return [fFirst.label + ' · ' + (v.show || v.value), chip, said];
    }) : [];
    f.inFinder_(RF, () => {
      S.filters = []; S.q = '';
      const ritems = f.stuffItems();
      const held = {};
      ritems.forEach(x => { held[x.kind] = (held[x.kind] || 0) + 1; });
      /* a. */
      if (!ritems.length) { bad.push('Find 2 holds nothing — not a pass'); return; }
      const fk = fItems.map(keyOf).sort(), rk = ritems.map(keyOf).sort();
      if (fk.length !== rk.length) bad.push('Find holds ' + fk.length + ' items and Find 2 ' + rk.length + ' — the same finder twice holds the same list');
      else if (fk.join('\n') !== rk.join('\n')) {
        const rs = new Set(rk);
        const onlyF = fk.filter(k => !rs.has(k));
        bad.push((onlyF.length || 'some') + ' item(s) on Find are not on Find 2, first ' + onlyF.slice(0, 3).join(', '));
      }
      /* b. */
      const first = f.nextFacet(ritems.slice());
      const firstVals = first ? f.facetValues(ritems, first) : [];
      if (!first) bad.push('Find 2 asks no first question over ' + ritems.length + ' items');
      if (show(first, firstVals) !== show(fFirst, fFirstVals)) bad.push('Find 2 asks ' + show(first, firstVals) + ' first, Find asks ' + show(fFirst, fFirstVals));
      console.log('\nWHAT FIND 2 HOLDS: ' + Object.keys(held).map(k => k + ' ' + held[k]).join(' · ')
                  + '\n  first question: ' + show(first, firstVals));
      /* c. */
      const states = [['Find 2', ritems, []]];
      rung.forEach(([say, chip, said]) => {
        S.filters = [Object.assign({}, chip)];
        const l = ritems.filter(x => f.filterHit(x, chip));
        const here = nextOf(l);
        if (here !== said) bad.push('after ' + say + ' Find 2 asks ' + here.slice(0, 200) + ' and Find ' + said.slice(0, 200));
        states.push(['Find 2 → ' + say, l, [chip]]);
      });
      if (rung.length < 2) bad.push('Find\'s first question has ' + rung.length + ' answer(s), so the rung below it was NOT compared — not a pass');
      /* d. THE SAME ONE RULE ON FIND 2: no Bible question over a list without the Bible. */
      const leaked = [];
      states.forEach(([say, list, chips]) => {
        if (!list.length || list.some(x => x.kind === 'bible')) return;
        S.filters = chips.map(c => Object.assign({}, c));
        const q = f.nextFacet(list.slice()) || f.overFacet_(list.slice());
        if (q && /^bible/.test(q.field)) leaked.push(say + ' asks ' + q.field);
      });
      if (leaked.length) bad.push('a Bible question is asked on Find 2 over a list without the Bible: ' + leaked.join('; '));
      S.filters = []; S.q = '';
      console.log('  compared: ' + rung.length + ' answers of the first question, the next question after each; the one rule over ' + states.length + ' lists');
    });
  } else bad.push('the second finder (`inFinder_`, `finderOf_`, `RES_ST`) is not exported, so Find 2 was NOT checked — not a pass');

  /* ---------- THE SUNDAY EMAIL'S TAGS ARE THE CARD'S (docs/history/380): backend/digest.gs ports `tagRow_`, asked of every question § */
  try {
    const b = require('./check-gas-load.js').backend();
    const qs = f.stuffItems().filter(x => x && x.kind === 'question' && x.row);
    const pids = [...new Set(qs.map(x => String(x.row.paper_id || '')).filter(Boolean))];
    b.ev('globalThis.__T = digestTagIndex_(' + JSON.stringify(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8')) + ', ' + JSON.stringify(pids) + ')');
    const differ = [];
    qs.forEach(x => {
      /* THE PAGE TAGS ([2] [of 2]) ARE THE SITE'S READING PAGES; the email draws the part whole, so it says none. And no
         Function tag: qtypes.js reads it in the browser (DIGEST_TAG_FACETS says so). */
      const want = f.tagList_(x).filter(t => !/^(qPages?|function)$/.test(t.field)).map(t => t.tag + ':' + t.text).join(' ');
      const got = b.ev('(() => { const pid = ' + JSON.stringify(String(x.row.paper_id || '')) + ', id = ' + JSON.stringify(String(x.row.row_id))
        + '; const r = (__T.rows[pid] || []).find(o => o.row_id === id); return digestCardTags_(r, __T).map(t => t.kind + ":" + t.text).join(" "); })()');
      if (got !== want) differ.push(x.row.row_id + ': the card says ' + JSON.stringify(want) + ', the email ' + JSON.stringify(got));
    });
    console.log('  Email tags: ' + qs.length + ' questions, ' + differ.length + ' differing from the card');
    if (qs.length < 1000) bad.push('the email\'s tags were compared over ' + qs.length + ' questions — the library did not load, which is not a pass');
    if (differ.length) bad.push(differ.length + ' question(s) wear different tags in the Sunday email from their card (`digestCardTags_` vs `tagRow_`) — first: ' + differ.slice(0, 3).join('; '));
  } catch (e) {
    bad.push('the email\'s tags could not be compared with the card\'s: ' + e.message + ' — not a pass');
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
  console.log('OK — every facet is asked, sorted, said and coloured by one rule: no question with one '
              + 'answer, no answer spelled twice, and the sitting asked in months.');
  process.exit(0);
}
