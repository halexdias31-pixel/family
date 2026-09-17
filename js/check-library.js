/* ==================================================================================================
   check-library.js — THE ONE DATA FILE IN THIS REPOSITORY, GUARDED

   `data/questions.json` is 4,264 rows and 2.4 MB of committed content, and until this file existed
   NOTHING CHECKED IT AT ALL. Every other check in here reads the code; this one reads the data the
   code is about. A wrong row does not throw, does not fail a build, and looks exactly like a right
   one — it is simply a question somebody is taught wrongly.

   Each rule below is a mistake that was actually made, or came within one step of being made.

   THE SHAPE. Line one is a bare `[`, the last line a bare `]`, and every row is ONE JSON OBJECT ON
   ONE LINE so a diff names the rows that changed. Every insert written for this file appends inside
   those brackets by splitting on newlines — so the shape is not cosmetic, it is the contract those
   scripts rely on. The first insert of the session assumed no brackets at all and would have
   written a broken file; it was caught by reading the first line, which is not a method that scales.

   ROW IDS ARE UNIQUE. A repeated id is a question that silently replaces another. Papers were
   transcribed one per sitting, and a paper keyed on the month it was sat (`P-1MA1-1906-2H`) rather
   than the year alone is the only thing that keeps a June paper from colliding with a November one.

   NO TICK COLUMNS, EVER. `ticks_1`, `ticks_2` and `ticks_3` held the handles of real people, most of
   them children, and were stripped at source when this file was built. THIS REPOSITORY IS PUBLIC and
   git history is permanent, so a tick column reappearing is not a data-quality problem, it is a
   disclosure. CLAUDE.md says this twice; this says it where it can act.

   A QUESTION'S PAPER MUST EXIST. `kind: 'paper'` is the one row a document gets, and it carries the
   link, the page count and the print flag. A question naming a `paper_id` with no paper row behind
   it is a question that can be found and never opened. (The reverse is fine and expected: 440 papers
   carry no questions yet. That is the backlog written down, not a fault, so it is reported and does
   not fail.)

   EVERY EDEXCEL 1MA1 HIGHER PAPER IS 80 MARKS. That is a fact about the qualification, not a
   convention, which makes it the strongest check available here: a dropped part, a doubled part or a
   mistyped mark shows up as a total that is not 80. Twelve papers, twelve 80s. It caught nothing
   when written because every paper was checked against its own stated total before insertion — which
   is the point. The check is the thing that keeps that true after the person who was being careful
   has gone.

   THE FACET VOCABULARY IS CLOSED. This is the near-miss that prompted the file. `exam_wave`, `tier`,
   `subject` and the rest are FACETS: `facetFromSheet_` turns a column into a question the funnel
   asks, and every distinct value becomes an answer somebody is offered. Transcribing the November
   papers I tagged them `exam_wave: 'Resit'` — a perfectly sensible word, next to the `'Second wave'`
   the file had used for exactly that meaning since before I arrived. Two answers, one meaning, and a
   filter that reads as arbitrary. I caught it by looking afterwards, which is luck.

   So the vocabulary is written down and anything outside it FAILS. The point is not that these
   values are beautiful — two of them are not, and say so below — it is that a NEW one has to be
   added here deliberately, by somebody who has just read what is already in use. Same argument as
   `ACCEPTED` in check-payload.js and `ACCEPTED_TAP` in check/ui.js: a list exists so that the next
   arrival fails loudly instead of joining a red nobody reads.

   Run:  node js/check-library.js
================================================================================================== */

const fs = require('fs');
const path = require('path');

/* A path may be passed in — `node js/check-library.js /tmp/mutated.json` — which is only ever used to
   prove this file can still fail. A check nobody has watched fail is a check nobody should trust. */
const FILE = process.argv[2] || path.join(__dirname, '..', 'data', 'questions.json');

/* ---------- THE CLOSED VOCABULARY ---------------------------------------------------------------
   Every value here is one the file already uses. Adding to this list is how you add an answer to a
   facet, and it should take a moment's thought — that moment is the whole feature.

   TWO ENTRIES ARE UNTIDY AND KEPT ANYWAY, with the reason written down, because silently
   "correcting" content is worse than describing it:

     exam_wave  carries both words (`First wave`, `Second wave` — the summer and November sittings)
                and ISO dates from an older import. They mean different things to whoever wrote
                them and nothing in the app reads the dates, so they stay until somebody decides
                what the column is for. NEW rows use the words.
     pages_checked  is a flag everywhere except one import that wrote a date into it. Left as found. */
const VOCAB = {
  kind:          ['document', 'preamble', 'question'],
  active:        ['True', 'False'],
  subject:       ['Combined Science', 'English Language', 'Maths', 'Physics', 'Religious Studies'],
  document_type: ['Exercise', 'Past paper', 'Specimen paper', 'Worksheet'],
  /* THE ATOMS ONLY — `KS1, KS2` and `KS3, KS4` were here as whole-cell spellings and are gone;
     see LIST_COLS below for why a list column is checked per item. */
  key_stage:     ['KS1', 'KS2', 'KS3', 'KS4', 'KS5'],
  band_type:     ['grade', 'stage', 'tier', 'year'],
  tier:          ['A-Level', 'AS', 'Foundation', 'Higher'],
  level:         ['AS', 'Alevel', 'GCSE'],
  exam_board:    ['AQA', 'Edexcel', 'STA'],
  exam_wave:     ['First wave', 'Second wave',
                  '2017-06-01', '2018-06-01', '2019-06-01', '2020-06-01',
                  '2021-06-01', '2022-06-01', '2023-06-01', '2024-06-01'],
  answer_type:   ['annotate', 'calculation', 'drawing', 'explain', 'proof', 'short', 'written'],
  month:         ['5', '6', '11'],
  paper:         ['1', '2', '3'],
  /* WHAT YOU HAVE TO HAVE IN FRONT OF YOU — one comma-list, not three booleans. A closed list for
     the reason every list here is closed: `calc`, `Calculator` and `calculator` would be three
     buttons on the funnel for one fact, which is the `Alevel` / `A-Level` fault in a new column.
     `Calculator` and `No calculator` live on the DOCUMENT row (the front cover says it once for the
     whole paper); the kit lives on the question that asks for it. See tools/set-needs.py. */
  needs:         ['Calculator', 'No calculator', 'Compass', 'Ruler', 'Protractor', 'Tracing paper'],
  needs_print:   ['True', 'False'],
  printable:     ['True', 'False'],
  trackable:     ['True', 'False'],
  print_required:['True', 'False'],
  pages_checked: ['True', '2026-08-06'],
  currency:      ['GBP'],
};

/* Columns that must never come back. See the header. */
const FORBIDDEN = /^ticks?(_\d+)?$/i;

const fail = [];
const note = [];

/* ---------- THE SHAPE, READ AS TEXT ---------------------------------------------------------------
   Before parsing, because the one-object-per-line layout is invisible to JSON.parse: a file written
   as one long line parses perfectly and makes every future diff useless. */
const raw = fs.readFileSync(FILE, 'utf8').replace(/\n$/, '').split('\n');

if (raw[0] !== '[') fail.push(`line 1 is ${JSON.stringify(raw[0].slice(0, 40))}, not a bare [`);
if (raw[raw.length - 1] !== ']') fail.push('the last line is not a bare ]');

/* EACH LINE IS PARSED ON ITS OWN, not merely checked for the right last character. The first version
   of this asked whether the line ended in `}` — and the whole file concatenated onto a single line
   ends in `}` too, so the one mutant that should have caught it sailed through. Parsing is the only
   test that actually says "exactly one object here". */
const body = raw.slice(1, -1);
body.forEach((line, i) => {
  const last = i === body.length - 1;
  if (!(last ? line.endsWith('}') : line.endsWith('},'))) {
    fail.push(`line ${i + 2} does not end in ${last ? '}' : '},'}`);
    return;
  }
  try {
    const one = JSON.parse(last ? line : line.slice(0, -1));
    if (!one || typeof one !== 'object' || Array.isArray(one)) {
      fail.push(`line ${i + 2} is not a JSON object`);
    }
  } catch (e) {
    fail.push(`line ${i + 2} is not ONE object on ONE line — ${e.message.slice(0, 60)}`);
  }
});

let rows = [];
try {
  rows = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  if (!Array.isArray(rows)) fail.push('the file is not a JSON array');
} catch (e) {
  fail.push('the file does not parse: ' + e.message);
}

/* ---------- IDS ---------------------------------------------------------------------------------- */
const seen = new Map();
const dupes = [];
const idless = [];
rows.forEach((r, i) => {
  const id = r && r.row_id;
  if (!id) { idless.push(i + 2); return; }
  if (seen.has(id)) dupes.push({ id, first: seen.get(id), again: i + 2 });
  else seen.set(id, i + 2);
});
idless.forEach(l => fail.push(`the row on line ${l} has no row_id`));
dupes.forEach(d => fail.push(`row_id ${d.id} is used twice — lines ${d.first} and ${d.again}`));

/* ---------- COLUMNS THAT MUST NOT EXIST ----------------------------------------------------------- */
const banned = new Set();
rows.forEach(r => Object.keys(r || {}).forEach(k => { if (FORBIDDEN.test(k)) banned.add(k); }));
banned.forEach(k => fail.push(
  `the column "${k}" is back. It held the handles of real people and this repository is public.`));

/* ---------- A QUESTION'S PAPER ------------------------------------------------------------------- */
const papers = new Set(rows.filter(r => r && r.kind === 'document').map(r => r.paper_id).filter(Boolean));
const orphans = new Map();
rows.forEach(r => {
  if (!r || r.kind === 'document' || !r.paper_id) return;
  if (!papers.has(r.paper_id)) {
    if (!orphans.has(r.paper_id)) orphans.set(r.paper_id, []);
    orphans.get(r.paper_id).push(r.row_id);
  }
});
orphans.forEach((ids, p) => fail.push(
  `${ids.length} question${ids.length > 1 ? 's' : ''} name paper_id ${p}, which has no kind:'paper' row`));

/* Papers with nothing under them are the backlog, not a fault. */
const used = new Set(rows.filter(r => r && r.kind !== 'document').map(r => r.paper_id));
const empty = [...papers].filter(p => !used.has(p));

/* ---------- 80 MARKS ------------------------------------------------------------------------------
   Every Edexcel GCSE maths past paper is 80 marks, Foundation and Higher alike, by definition of the
   qualification. It is the only end-to-end check a transcription has — nothing else in here knows
   what the paper said — so it catches a dropped part, a misread mark and a doubled question at once.
   Anything else (worksheets, A-level, other boards) has no single right answer to compare against
   and is left alone rather than guessed at.

   THE PAPER IS IDENTIFIED BY WHAT IT IS, NOT BY HOW ITS ID IS SPELLED. This used to test
   `/^P-1MA1-\d+-\dH$/` against the paper_id, and the June 2024 series — six papers, both tiers,
   filed under `RS…` ids — was therefore never checked at all. That is the same fault as the
   duplicate above wearing different clothes: an id prefix is a naming habit, and a check that keys
   on one only sees the papers somebody happened to name that way. All six do total 80; nothing was
   wrong, and nothing would have said so. */
const paperFacts = new Map();
rows.forEach(r => {
  if (r && r.kind === 'document' && r.paper_id) paperFacts.set(r.paper_id, r);
});
/* ---------- AND THE PAPER SAYS WHAT IT IS OUT OF ---------------------------------------------------
   THIS KNEW ABOUT ONE QUALIFICATION. `isEdexcelGcseMaths` is a predicate over five columns, written
   because the id prefix it used before was blind to six papers filed under `RS…` ids — a real fix,
   and still a rule that only works for the board and subject somebody had in front of them. The
   first AQA GCSE English paper walked straight past it, and so would every A-level paper already in
   the library.

   SO THE PAPER DECLARES ITS OWN TOTAL. `total_marks` on the `kind: 'paper'` row, and the parts under
   it must sum to it. That is one cell per paper, set by whoever transcribes it from the front page
   of the thing they are looking at — which is where the number is printed, and the one moment
   anybody is certain of it. No board, subject, tier or key stage appears in the rule at all.

   THE OLD PREDICATE STAYS AS A DEFAULT, not as the rule. Thirty Edexcel GCSE maths papers are in
   here without a `total_marks` cell, and 80 is true of every one of them by definition of the
   qualification — so they go on being checked while the column fills in behind them. A paper that
   matches neither is not checked, and the count below says how many that is rather than letting it
   pass as coverage. */
const isEdexcelGcseMaths = pid => {
  const p = paperFacts.get(pid);
  return !!p && p.exam_board === 'Edexcel' && p.subject === 'Maths' && p.key_stage === 'KS4'
      && p.document_type === 'Past paper' && (p.tier === 'Higher' || p.tier === 'Foundation');
};
const outOf = pid => {
  const p = paperFacts.get(pid);
  const said = p && Number(p.total_marks);
  if (Number.isFinite(said) && said > 0) return { total: said, why: 'its own total_marks' };
  if (isEdexcelGcseMaths(pid)) return { total: 80, why: 'every Edexcel GCSE maths paper is 80' };
  return null;
};
const marks = new Map();
const unchecked = new Set();
rows.forEach(r => {
  if (!r || r.kind !== 'question') return;
  if (!outOf(r.paper_id)) { if (r.paper_id) unchecked.add(r.paper_id); return; }
  const n = Number(r.marks);
  if (!Number.isFinite(n)) {
    fail.push(`${r.row_id} has marks ${JSON.stringify(r.marks)}, which is not a number`);
    return;
  }
  marks.set(r.paper_id, (marks.get(r.paper_id) || 0) + n);
});
[...marks.entries()].sort().forEach(([p, m]) => {
  const want = outOf(p);
  if (m !== want.total) {
    fail.push(`${p} totals ${m} marks and should be ${want.total} — ${want.why}. `
      + `A paper that does not sum is a dropped part, a misread mark count or a duplicated `
      + `question, and this is the only end-to-end check the library has.`);
  }
});

/* ---------- THE CLOSED VOCABULARY ----------------------------------------------------------------- */
const strays = [];
/* ---------- A LIST COLUMN IS CHECKED PER ITEM, NOT PER CELL --------------------------------------
   `key_stage` GAVE THIS AWAY AND IT TOOK A SECOND LIST COLUMN TO NOTICE. Its vocabulary reads
   `KS1`, `KS1, KS2`, `KS2`, `KS3`, `KS3, KS4`, `KS4`, `KS5` — five values and two COMBINATIONS of
   them, listed because the loop compared the whole cell. That is fine at two combinations and
   combinatorial after: `needs` holds six atoms, so a cell-wise list would need sixty-three entries
   to permit what six atoms already say, and a real pair like "Compass, Ruler" fails until somebody
   types it out.

   THE COLUMN IS A LIST WHEREVER THE APP READS IT AS ONE — `asList_` and a comma, which is how
   `topics`, `keystage` and `images` have always worked. So the vocabulary is the ATOMS, and the
   combinations come out of `key_stage` because they were never facts, only an artefact of how this
   loop asked the question. */
const LIST_COLS = new Set(['needs', 'key_stage']);

Object.keys(VOCAB).forEach(col => {
  const allowed = new Set(VOCAB[col]);
  const bad = new Map();
  let seen = 0;
  rows.forEach(r => {
    if (!r || !(col in r)) return;
    seen++;
    const parts = LIST_COLS.has(col)
      ? String(r[col]).split(',').map(x => x.trim()).filter(Boolean)
      : [String(r[col])];
    parts.forEach(v => { if (!allowed.has(v)) bad.set(v, (bad.get(v) || 0) + 1); });
  });
  /* ---------- A VOCABULARY FOR A COLUMN NOTHING HAS IS A VOCABULARY NOTHING ENFORCES -------------
     CAUGHT BY DOING IT. `resource_type` was renamed to `document_type` across the file and the code,
     and this list kept the old name — so the loop above found the column on zero rows, reported zero
     strays, and printed a pass. The closed vocabulary for the funnel's `Type` question had stopped
     existing and nothing said so.

     THAT IS THE SHAPE THIS WHOLE FILE IS ABOUT: a check that cannot reach its subject reporting that
     the subject is fine. `check-booking.js` printed "nothing to check" and exited 0; this printed
     nothing at all. So a name in VOCAB that no row carries is now a failure — either the column was
     renamed and this list did not follow, or the entry is for a column that never existed. */
  if (!seen) {
    fail.push(`VOCAB has a closed list for \`${col}\` and not one row has that column. It has been `
      + `renamed out from under this list, or it never existed — either way the vocabulary for it `
      + `is being enforced on nothing.`);
  }
  bad.forEach((n, v) => strays.push({ col, v, n }));
});
strays.forEach(s => fail.push(
  `${s.col} = ${JSON.stringify(s.v)} on ${s.n} row${s.n > 1 ? 's' : ''} — not in the vocabulary. ` +
  `Read what the column already uses before adding it to VOCAB in this file.`));

/* ---------- THE SAME PAPER, TRANSCRIBED TWICE ------------------------------------------------------
   This file had no idea what a real-world exam paper IS, only what a row is, so the ids being
   unique was the whole of its protection. That is not enough: the June 2024 Higher papers were
   already in here under `RS…` ids, and a session that listed `paper_id` prefixes, saw no
   `P-1MA1-24…`, and went off to transcribe Paper 1 again produced 33 fresh rows with fresh ids
   and no complaint from anything. A duplicate paper is worse than a duplicate row, because a
   duplicate row at least LOOKS wrong in the funnel; two copies of a paper just make the library
   bigger and every search return each question twice.

   So the key is what identifies a SITTING: subject, board, year, series, paper number and tier.
   Two details matter.

   THE MONTH IS COLLAPSED TO A SERIES, because the same sitting is dated both ways in here — the
   2024 Higher Paper 1 sat on 16 May and is filed under month 6, and the duplicate was filed under
   month 5. Comparing months exactly would have let the pair through, which is precisely the
   `waveOf` problem `find.js` already solves for the funnel: two spellings of one sitting.

   ONLY PAPERS THAT HAVE QUESTIONS COUNT. Most `kind: 'paper'` rows are documents with nothing
   under them yet — a link and a page count — and a document row sitting beside the transcription
   of the same paper is the normal, intended state. Seventeen of those pairs exist right now and
   not one is a fault. */
const ACCEPTED_TWICE = {
  'Maths|Edexcel|2024|summer|3|A-Level':
    'Papers 31 (Statistics) and 32 (Mechanics) are two different A-level papers and both carry ' +
    'paper: 3, so the key collides on something that is not a duplicate.',
};
const seriesOf = m => (['5', '6', '7'].includes(String(m)) ? 'summer'
                    : ['10', '11', '12'].includes(String(m)) ? 'autumn' : String(m || ''));
const withQuestions = new Set(rows.filter(r => r && r.kind === 'question').map(r => r.paper_id));
const sittings = new Map();
rows.forEach(r => {
  if (!r || r.kind !== 'document' || !withQuestions.has(r.paper_id)) return;
  const bits = [r.subject, r.exam_board, r.year, seriesOf(r.month), r.paper, r.tier];
  if (bits.some(b => !b)) return;
  const key = bits.join('|');
  if (!sittings.has(key)) sittings.set(key, []);
  sittings.get(key).push(r.paper_id);
});
const twice = [];
sittings.forEach((ids, key) => {
  if (ids.length < 2) return;
  if (ACCEPTED_TWICE[key]) return;
  twice.push(`${key} is transcribed ${ids.length} times: ${ids.join(', ')}. One sitting, one paper ` +
             `— delete the newer copy, or add the key to ACCEPTED_TWICE with a written reason.`);
});
twice.forEach(t => fail.push(t));

/* ---------- THE SAME DOCUMENT, TRANSCRIBED TWICE — AND THIS IS THE STRONGER TEST -------------------
   THE SITTING KEY ABOVE CANNOT SEE A WORKSHEET. It is built from subject, board, year, series,
   paper number and tier, and a Corbettmaths or 1st Class Maths sheet has none of those — so five
   sets sat in the library, three of them a SECOND transcription of a PDF that was already in here,
   past every check in the suite. Found by noticing that five of the sixty-nine `W-CBM-` sets carry
   a `source_url` and the other sixty-four do not: the URL is the 1st Class Maths tell, because that
   publisher's sheets are Drive files and Corbettmaths' are not.

   AND THE URLS WERE IDENTICAL — the same Drive file id, character for character. `W-CBM-reflections`
   (9 parts, terse) and `W-1CM-reflections` (15 parts, carrying the sheet's own title) are one PDF
   read twice, at different granularity, by two different sessions. Nothing about the text matched,
   which is why comparing questions said "different worksheets" and was wrong: the questions ARE
   different, because the two transcriptions disagree about where a question ends.

   SO THE DOCUMENT IS THE THING, AND ITS URL IS ITS IDENTITY. A `source_url` is a file somewhere;
   two `paper_id`s pointing at one file is one document entered twice, whatever either is called and
   whatever the rows under them say. It needs no vocabulary, no id convention and no knowledge of
   what an exam is, which is what makes it the test the sitting key should have been.

   COMPARED ON THE DRIVE ID, NOT THE URL. The same file is written both `drive.google.com/file/d/<id>/view`
   and `drive.google.com/open?id=<id>&usp=drive_copy` in this very library, on rows of the same set —
   two spellings of one address, which is the `waveOf` fault in a third column.

   TWO PAPERS WITH QUESTIONS IS A FAILURE; A STUB BESIDE A TRANSCRIPTION IS A NOTE. Twenty-five of
   the twenty-eight pairs are an empty `R0xxx` document row — a link and a page count, no questions —
   sitting beside the real transcription of that paper. That is the normal, intended state and the
   sitting key above already says so in its own words. What cannot be normal is the same file read
   into questions twice. */
const driveId = u => {
  const m = String(u || '').match(/[-\w]{25,}/);
  return m ? m[0] : String(u || '');
};
const partsPer = {};
rows.forEach(r => { if (r && r.kind === 'question') partsPer[r.paper_id] = (partsPer[r.paper_id] || 0) + 1; });
const byDoc = new Map();
rows.forEach(r => {
  if (!r || !r.source_url || !r.paper_id) return;
  const k = driveId(r.source_url);
  if (!k) return;
  if (!byDoc.has(k)) byDoc.set(k, new Set());
  byDoc.get(k).add(r.paper_id);
});
let stubPairs = 0;
byDoc.forEach((ids, k) => {
  if (ids.size < 2) return;
  const withParts = [...ids].filter(id => partsPer[id]);
  if (withParts.length < 2) { stubPairs++; return; }
  fail.push(`one document is transcribed ${withParts.length} times — `
    + withParts.map(id => `${id} (${partsPer[id]} parts)`).join(', ')
    + `. They share the file ${k}, so they are one PDF read twice: keep the fuller transcription `
    + `and delete the other, or the library teaches the same question under two names.`);
});

/* ---------- A PREAMBLE THAT NOTHING SITS UNDER ------------------------------------------------------
   A `kind: 'stem'` ROW IS A PARAGRAPH SEVERAL QUESTIONS HANG FROM, and its scope is read off the
   columns it carries — see `preamble_` in find.js. Three things can go wrong with that and none of
   them throws:

   AN ORPHAN. A stem naming a question number that has no parts is a paragraph nothing will ever
   draw. It reads as content in the file and is content nowhere, which is the `dropdowns.checklists`
   fault in miniature: a builder producing nothing from nothing, silently, for as long as nobody
   looks.

   A STEM THAT CLAIMS MARKS. A preamble is scene-setting; the marks are on the parts. One carrying
   a mark count would be double-counted by the 80-mark rule above, and that rule is the only
   end-to-end check this library has.

   AND A PART WHOSE SCENE IS MISSING is NOT reported, deliberately. 3,976 of the 4,005 parts carry
   their preamble inside their own `html` because that is how they were transcribed, and a check
   that fires on all of them says nothing anybody can act on. The model is thinly populated on
   purpose — filling it in is editorial work on rows that already exist. */
/* ---------- SEVERAL PREAMBLES IN ONE SCOPE, AND NO ORDER BETWEEN THEM -------------------------------
   AN INSERT IS A LIST NOW — see `stemIndex_` in find.js, and the measurement that prompted it:
   three rows in one scope went in and ONE came out, silently, because the index held a row per
   scope rather than a list. That is fixed, and the fix introduced a way to be wrong that did not
   exist before: two rows in one scope with nothing saying which comes first.

   THE ORDER IS THE CONTENT. "Lines 1-6" printed under "Lines 20 to the end" is not untidy, it is
   the source in the wrong order, and a student reading it would have no way to tell. `sort_order`
   is what declares it, so a scope holding several rows where two share an order — or where any
   lacks one — is a paper whose insert reads differently depending on the order the file happens
   to be in. Proved by mutation, both directions. */
const scopeOf_ = r => r.paper_id + '|' + (String(r.question || '').trim() ? 'q' + r.question
                                          : r.section ? 's' + r.section : 'paper');
const inScope = {};
rows.forEach(r => {
  if (!r || r.kind !== 'preamble' || !r.paper_id) return;
  (inScope[scopeOf_(r)] || (inScope[scopeOf_(r)] = [])).push(r);
});
Object.keys(inScope).forEach(k => {
  const list = inScope[k];
  if (list.length < 2) return;
  const orders = list.map(r => String(r.sort_order || '').trim());
  const missing = list.filter((r, i) => !orders[i]);
  if (missing.length) {
    fail.push(`${k} has ${list.length} preamble rows and ${missing.length} of them ` + (missing.length === 1 ? `carries` : `carry`) + ` no `
      + `sort_order (${missing.map(r => r.row_id).join(', ')}). Several parts in one scope are `
      + `drawn in the order this column gives; without it the insert reads in whatever order the `
      + `file happens to be in.`);
    return;
  }
  const seen = {};
  orders.forEach((o, i) => { (seen[o] || (seen[o] = [])).push(list[i].row_id); });
  Object.keys(seen).filter(o => seen[o].length > 1).forEach(o => {
    fail.push(`${k} has ${seen[o].length} preamble rows all at sort_order ${o} `
      + `(${seen[o].join(', ')}). Which one is drawn first is then undefined, and for an insert `
      + `the order IS the content.`);
  });
});

const partKeys = new Set();
const sectionKeys = new Set();
rows.forEach(r => {
  if (!r || r.kind !== 'question' || !r.paper_id) return;
  partKeys.add(r.paper_id + '|' + r.question);
  if (r.section) sectionKeys.add(r.paper_id + '|' + r.section);
});
const paperKeys = new Set(rows.filter(r => r && r.kind === 'question').map(r => r.paper_id));
rows.forEach(r => {
  if (!r || r.kind !== 'preamble') return;
  if (Number(r.marks)) {
    fail.push(`${r.row_id} is a stem carrying ${r.marks} mark(s). A preamble is scene-setting and `
      + `the marks belong to the parts under it — this one is counted twice by the 80-mark rule.`);
  }
  /* ---------- A PAPER WITH NO QUESTIONS AT ALL IS ONE BEING BUILT --------------------------------
     THE INSERT CAN ARRIVE BEFORE THE QUESTIONS DO, and on AQA English it usually will: the source
     is a separate booklet, so somebody holding the insert and not the question paper has exactly
     half of a real paper and should be able to put that half in. Failing them for it would mean
     the only way to add an insert is to invent the questions that point at it — which is the one
     outcome this whole file exists to prevent.

     SO THE RULE IS ABOUT A SCOPE THAT MISSED, not about a paper that is unfinished. A stem under a
     paper that HAS parts and matches none of them is a paragraph nothing will ever draw. A stem
     under a paper with no parts yet is the backlog, and the backlog is already counted below —
     440 document rows are in exactly that state. */
  if (!paperKeys.has(r.paper_id)) return;
  const has = (r.question !== undefined && r.question !== null && r.question !== '')
    ? partKeys.has(r.paper_id + '|' + r.question)
    : r.section ? sectionKeys.has(r.paper_id + '|' + r.section)
    : paperKeys.has(r.paper_id);
  if (!has) {
    fail.push(`${r.row_id} is a stem nothing sits under — nothing in ${r.paper_id} matches its `
      + `scope, so the paragraph is in the file and on no screen. Point a part at it or delete it.`);
  }
});

/* ---------- THE DATE A PAPER WAS SAT, AND THE TWO WAYS IT CAN LIE --------------------------------
   `exam_date` IS HOW A PERSON NAMES A PAPER. "Thursday 25 May 2017, Paper 1 Higher" is what a tutor
   and a student both say out loud, and the library held `year` and `month` and nothing finer — so
   the one identifier everybody actually uses was the one that could not be matched on.

   IT IS ALSO WHERE THE 2021 ANSWER GOES. Edexcel took the date off the front page in 2021 and two
   ©2021 sets of Higher papers sit unidentified because of it; CLAUDE.md records that the empty
   document rows' `source_url`s carry the real dates (`1MA1_1H_que_20211103.pdf`). There was nowhere
   to put that answer once somebody worked it out. There is now.

   TWO RULES, AND THE SECOND IS THE ONE WORTH HAVING. A date that is not a date is obvious and
   caught at once. A date that disagrees with the `year` and `month` already on the row is not: both
   halves read perfectly, the funnel files the paper by one of them and the person searching uses
   the other, and nothing anywhere says they are different. Same shape as the two spellings of a
   sitting, one column further in. */
rows.forEach(r => {
  if (!r || !r.exam_date) return;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(r.exam_date));
  if (!m) {
    fail.push(`${r.row_id} has exam_date ${JSON.stringify(r.exam_date)}, which is not YYYY-MM-DD.`);
    return;
  }
  const [y, mo, d] = m.slice(1).map(Number);
  const real = new Date(Date.UTC(y, mo - 1, d));
  if (real.getUTCFullYear() !== y || real.getUTCMonth() + 1 !== mo || real.getUTCDate() !== d) {
    fail.push(`${r.row_id} has exam_date ${r.exam_date}, which is not a day that exists.`);
    return;
  }
  if (r.year && String(r.year) !== String(y)) {
    fail.push(`${r.row_id} is dated ${r.exam_date} and its year column says ${r.year}. `
      + `Both read perfectly and one of them is wrong.`);
  }
  if (r.month && String(r.month) !== String(mo)) {
    fail.push(`${r.row_id} is dated ${r.exam_date} and its month column says ${r.month}. `
      + `The funnel files it by one and a person searches by the other.`);
  }
  /* ---------- AND A THIRD, WHICH IS THE ONLY ONE THAT CATCHES THE WRONG DATE -------------------
     NOBODY SITS A GCSE ON A SATURDAY. The two rules above compare `exam_date` against columns
     that were filled in by the same person in the same sitting, so a date that is simply WRONG —
     a day out, or a publication date mistaken for an exam date — agrees with both of them and
     sails past.

     THIS IS NOT HYPOTHETICAL AND IT NEARLY HAPPENED HERE. 41 documents carry a `source_url` with a
     full date in the filename (`1MA1_1H_que_20211103.pdf`), which looked like 41 free exam dates
     waiting to be copied across. **Eight of the 41 land on a Saturday** — `P-1MA1-2306-1H` on
     2023-05-20, four November Paper 2s, and the 2022 and 2023 summer Paper 1s. So that slug is the
     date the FILE was published at least some of the time, and there is no way to tell from here
     which of the other 33 are exam dates and which are not. Bulk-filling from it would have put a
     confident wrong day on a third of the library.

     A WEEKEND IS THE ONE HALF A CHECKER CAN SETTLE without knowing the timetable. It cannot tell a
     Tuesday that is wrong from a Tuesday that is right — only a person holding the paper can — but
     it is enough to refuse the whole class of mistake that produced those eight. */
  const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (real.getUTCDay() === 0 || real.getUTCDay() === 6) {
    fail.push(`${r.row_id} has exam_date ${r.exam_date}, which is a ${DAY[real.getUTCDay()]}. `
      + `Boards do not sit papers at the weekend, so this is a publication date or a typo — `
      + `see the note above: eight of the 41 dates in source_url filenames are Saturdays.`);
  }
});

const datedPapers = new Set(rows.filter(r => r && r.exam_date && r.paper_id).map(r => r.paper_id));

/* ---------- AN ADDRESS THAT IS NOT AN ADDRESS ------------------------------------------------------
   `images` IS A COMMA-SEPARATED LIST OF PLACES A PICTURE IS, and the one way it fails silently is a
   value that is not a place: a filename with no folder, a Drive *page* rather than a Drive file, a
   path copied off somebody's desktop. None of those throw — the browser asks, gets nothing, and the
   question is served with a broken picture where its prompt should be, which on AQA Paper 1
   Question 5 is the whole question.

   TWO SHAPES ARE ADDRESSES: `http(s)://…`, and a `data:image/…` URI for a picture committed into the
   row itself. Anything else is refused here rather than at the end of a wire.

   `drive.google.com/file/d/<id>` IS NAMED SEPARATELY because this repository has already paid for
   that distinction once: a Drive FILE page is HTML, not an image, so it renders as nothing in an
   `<img>`. The same spelling trap as the `.xlsx` ids in `check-tabs.js`. */
const pic = [];
rows.forEach(r => {
  if (!r || !r.images) return;
  String(r.images).split(',').map(v => v.trim()).filter(Boolean).forEach(src => {
    if (/^data:image\//.test(src)) { pic.push(src); return; }
    if (!/^https?:\/\//.test(src)) {
      fail.push(`${r.row_id} has an image "${src.slice(0, 60)}" that is not an address. `
        + `It must start http:// or https://, or be a data:image/… URI.`);
      return;
    }
    if (/drive\.google\.com\/file\/d\//.test(src)) {
      fail.push(`${r.row_id} points an image at ${src.slice(0, 60)} — that is a Drive FILE PAGE, `
        + `which is HTML. An <img> asking for it gets a web page and draws nothing. Use a direct `
        + `image address.`);
      return;
    }
    pic.push(src);
  });
});

/* ---------- A PICTURE THIS SITE DREW MUST SAY SO ---------------------------------------------------
   SIX QUESTIONS IN THE CORBETTMATHS MONEY SHEET HAD NO ANSWER IN THEM. "Natalie has these coins.
   How much money does Natalie have?" — and no coins: the data was entirely in an image and a
   transcription is a text layer. corbettmaths.com is blocked from the agent's environment by the
   same policy that blocks every Google host, so the real coins cannot be recovered; the set that is
   drawn now is ours, and so is the answer.

   `diagram_by` IS A DISCLOSURE FIELD AND IT IS CLOSED. Absent means the picture came off the paper;
   `family` means this site drew it. Anything else is a spelling nobody has agreed, and it would go
   straight onto a card under a credit line that would then be wrong — which is worse than no credit
   at all. Same argument as `VOCAB`, one column over.

   AND A PICTURE CANNOT BE CREDITED IF THERE IS NO PICTURE. A `diagram_by` on a row with no
   `diagram` is a claim about nothing, and it is exactly what a half-finished edit leaves behind. */
const DIAGRAM_BY = ['family'];
rows.forEach(r => {
  if (!r || !r.diagram_by) return;
  if (!DIAGRAM_BY.includes(r.diagram_by)) {
    fail.push(`${r.row_id} says diagram_by: ${JSON.stringify(r.diagram_by)}. The only value that `
      + `means anything is ${DIAGRAM_BY.map(v => JSON.stringify(v)).join(', ')} — absent means the `
      + `picture came off the paper. Add it to DIAGRAM_BY with a reason, or fix the row.`);
  }
  if (!r.diagram) {
    fail.push(`${r.row_id} credits a diagram it does not have. Draw it or drop the credit.`);
  }
});
const drawnHere = rows.filter(r => r && r.diagram_by === 'family').length;

/* ---------- WHAT IS STILL STANDING IN FOR SOMETHING ------------------------------------------------
   `placeholder` MARKS A ROW WHOSE CONTENT IS A DESCRIPTION OF THE REAL THING. The AQA English
   inserts are the first: the sources are a separate booklet and third-party copyright, so they are
   not in the paper and cannot be reproduced here — what is in the row is enough to teach around and
   is explicitly not the text.

   IT IS A LIST, NOT A FAILURE. A placeholder is a decision somebody made on purpose and a job
   somebody means to finish; a build that refuses it would just mean nobody marks anything. Printed,
   counted, and named, so the list of what is outstanding is read off the data rather than
   remembered. Same argument as the questions the transcriber could not recover. */
const standingIn = rows.filter(r => r && String(r.placeholder) === 'True');

/* ---------- WHAT THE TRANSCRIBER COULD NOT RECOVER -------------------------------------------------
   `examiner_note` is where somebody transcribing a paper wrote down that a question did not come
   across — a diagram the PDF had no text for, or maths the text layer had flattened past reading.
   These are real questions being taught in a broken state, and nothing surfaced them until now.
   Reported rather than failed: it is editorial work on a handful of rows, not a build error. */
const flagged = rows.filter(r => r && r.examiner_note);

/* ==================================================================================================
   THE OTHER THREE LIBRARY FILES, WHICH ARE MID-MIGRATION.

   `data/boxers.json`, `data/fights.json` and `data/cheatsheet.json` are the next three tabs out of
   the spreadsheet — see the header of `js/library.js` for why they qualify and why the move is two
   steps. They ship EMPTY, with the payload still supplying those keys, because the rows live in a
   Google sheet that the agent environment cannot reach.

   TWO THINGS ARE WORTH CHECKING AND THEY ARE DIFFERENT SEVERITIES. The SHAPE is a rule: whatever
   ends up in the file must be a JSON array with one object per line, or the next script to append
   to it by splitting on newlines corrupts it — the same rule, for the same reason, as the one this
   file already applies to `questions.json`. Whether the migration is FINISHED is a note: the moment
   a file has rows in it, `doget.gs` is still walking the same tab and shipping it to every phone
   for nobody, and that is when the block should go. Nothing can work that out except by holding the
   two facts side by side, so it is printed rather than remembered. */
const EXTRA_FILES = ['boxers', 'fights', 'cheatsheet'];
const DOGET_SRC = (() => {
  for (const rel of ['backend/doget.gs', 'doget.gs']) {
    try { return fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'); } catch (e) {}
  }
  try { return fs.readFileSync(path.join(__dirname, 'doget.gs'), 'utf8'); } catch (e) {}
  return null;
})();

EXTRA_FILES.forEach(name => {
  const f = path.join(__dirname, '..', 'data', name + '.json');
  let raw;
  try { raw = fs.readFileSync(f, 'utf8'); }
  catch (e) {
    fail.push('data/' + name + '.json is missing — library.js fetches it on every load');
    return;
  }
  const lines = raw.replace(/\n$/, '').split('\n');
  if (lines[0] !== '[' || lines[lines.length - 1] !== ']') {
    fail.push('data/' + name + '.json must open with a bare [ and close with a bare ]');
    return;
  }
  const body = lines.slice(1, -1);
  body.forEach((line, i) => {
    const last = i === body.length - 1;
    if (!(last ? line.endsWith('}') : line.endsWith('},'))) {
      fail.push('data/' + name + '.json line ' + (i + 2) + ' is not ONE object on ONE line');
      return;
    }
    try {
      const one = JSON.parse(last ? line : line.slice(0, -1));
      if (!one || typeof one !== 'object' || Array.isArray(one))
        fail.push('data/' + name + '.json line ' + (i + 2) + ' is not an object');
    } catch (e) {
      fail.push('data/' + name + '.json line ' + (i + 2) + ' does not parse — '
                + e.message.slice(0, 60));
    }
  });
  if (body.length && DOGET_SRC && new RegExp('read\\(TAB\\.' + name + '\\)').test(DOGET_SRC)) {
    note.push('data/' + name + '.json now has ' + body.length + ' row(s) AND doget.gs still builds '
              + 'payload.' + name + ' — step 2 of that migration is due: delete that block so the '
              + 'tab stops being walked for every phone on every load');
  }
});

/* ---------- SAY IT --------------------------------------------------------------------------------- */
const say = (title, list, draw) => {
  console.log('\n' + title + '  (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  list.forEach(x => console.log('  ' + draw(x)));
};

console.log(`\nTHE LIBRARY  —  ${rows.length} rows, ${papers.size} papers, ${marks.size} Edexcel GCSE maths papers checked at 80 marks`);

say('BROKEN', fail, x => x);

say('WHAT THE TRANSCRIBER COULD NOT RECOVER — worth a person and the original paper', flagged,
    r => `${r.row_id}  ${String(r.examiner_note).slice(0, 96)}`);

/* ---------- `note` WAS PUSHED TO AND NEVER PRINTED -----------------------------------------------
   CLAUDE.md STATES THIS FILE'S JOB OUTRIGHT: "`check-library.js` says when step 2 is due rather
   than leaving it to memory: once a file has rows AND `doget.gs` still builds that key, it prints
   that the block should go." It did not print it. `const note = []` was declared, `note.push(…)`
   was called, and nothing anywhere read the array — so the signal went into a list that was
   dropped on the floor every run.

   IT SURVIVED BECAUSE THE CONDITION HAD NEVER BEEN TRUE. All three files held `[]` from the day
   they were committed, so `body.length` was 0 and the push never happened; the first run that
   could have printed anything is the run after the export. A rule that cannot fire is a rule
   nobody finds out is broken, which is this repository's oldest shape and is recorded here about
   three checks that were never in the roster, a check that could not find its subject, and a
   `check/ui.js` rule that fired zero times on the fault it was written for.

   PRINTED, NOT FAILED, deliberately. Step 2 is a decision about a live backend and a deploy, not a
   thing a build should refuse over — the same footing as the transcriber's list above it. */
say('WORTH DOING NEXT — not a fault', note, x => x);

console.log(`\npapers with no questions under them yet: ${empty.length}  (the backlog, not a fault)`);
console.log(`documents with a stub row beside their transcription: ${stubPairs}  (the intended state)`);
console.log(`papers checked against a total: ${marks.size}   papers with no total to check against: `
          + `${unchecked.size}  (put total_marks on the paper row and they are)`);
console.log(`pictures drawn here because the original's did not survive: ${drawnHere}  (each credited on its card)`);
console.log(`pictures carried by rows as an address: ${pic.length}`);
/* WITH A DENOMINATOR, because "1" is a number and "1 of 665" is a backlog. Same argument as the
   `total_marks` line three above it: what is uncovered has to be a figure somebody can act on
   rather than a silence. A date is read off the front page of the paper, so this moves only when
   somebody has one in front of them — see the weekend rule for why it is not derived. */
/* ---------- A QUESTION WHOSE PICTURE NEVER CAME ACROSS ------------------------------------------
   REPORTED BY SOMEBODY TEACHING FROM THE PAPER: "this is what question 4 looks like but on the app
   it's just text." It was — `Q-1MA1-1705-1H-4` carried `figure: 'diagram'` and no `diagram`, so the
   square ABCD arrived as a sentence describing a square, which you can only sit an exam from if you
   already know what the square looked like.

   `figure` IS TWO COLUMNS UNDER ONE NAME and that is why this is a count rather than a rule.
   CLAUDE.md records it: `venn`, `scatter`, `pie-chart` mean the paper had a picture nobody
   transcribed, while `grid-blank`, `fractions`, `boxes`, `long-method` mean it had somewhere to
   WRITE THE ANSWER — and those questions are complete as they stand. A first renderer printed "not
   drawn yet" off this column and was wrong on about 120 questions. So the answer-space labels are
   named here and everything else is counted.

   PRINTED, NOT FAILED. It is editorial work needing the original paper open beside you, and drawing
   one from the row's own prose is how a wrong figure gets onto a card wearing the exam's authority —
   see tools/draw-1705-1h-more.py for the line between the two. A number is something somebody can
   act on; a silence is how 486 of them accumulated unnoticed. */
const ANSWER_SPACE = ['grid-blank', 'fractions', 'boxes', 'long-method', 'lines', 'working',
                      'answer-space', 'table-blank'];
const noPicture = rows.filter(r => r && r.kind === 'question'
  && String(r.figure || '').trim()
  && ANSWER_SPACE.indexOf(String(r.figure).trim()) === -1
  && !r.diagram && !String(r.images || '').trim());
const perPaper = {};
noPicture.forEach(r => { perPaper[r.paper_id] = (perPaper[r.paper_id] || 0) + 1; });
const worst = Object.keys(perPaper).sort((a, b) => perPaper[b] - perPaper[a]).slice(0, 5);
console.log(`questions whose picture never came across: ${noPicture.length}`
  + `  (the paper had a figure, the row has neither a drawing nor an image)`);
if (worst.length) {
  console.log(`   worst papers: ${worst.map(k => `${k} (${perPaper[k]})`).join(', ')}`);
}

/* ---------- WHAT A PAPER REQUIRES, AND HOW MUCH OF IT IS KNOWN ----------------------------------
   THE SAME BACKLOG SHAPE AS `total_marks` AND `exam_date`: a number somebody can act on beats a
   silence. Calculator is read off the paper's own front page and covers every question inside, so
   it is counted per DOCUMENT; the kit is per question and mostly absent, because only twelve
   questions in the whole library print the word themselves — see tools/set-needs.py for why the
   rest are left blank rather than inferred from what the question is about. */
const saysCalc = rows.filter(r => r && r.kind === 'document'
  && /calculator/i.test(String(r.needs || ''))).length;
const docCount = rows.filter(r => r && r.kind === 'document').length;
const kitRows = rows.filter(r => r && r.kind === 'question'
  && /Compass|Ruler|Protractor|Tracing paper/.test(String(r.needs || ''))).length;
const printRows = rows.filter(r => r && r.kind === 'question'
  && (String(r.needs_print) === 'True' || String(r.print_required) === 'True')).length;
console.log(`papers saying whether a calculator is allowed: ${saysCalc} of ${docCount}`
  + `   questions naming kit they need: ${kitRows}`
  + `   questions needing the printed sheet: ${printRows}`);

const allDocs_ = rows.filter(r => r && r.kind === 'document').length;
console.log(`papers carrying the date they were sat: ${datedPapers.size} of ${allDocs_}`
  + `   (the rest are known to a month only)`);
if (standingIn.length) {
  console.log(`\nSTANDING IN FOR SOMETHING NOT YET TYPED — a list, not a fault  (${standingIn.length})`);
  standingIn.forEach(r => console.log(`  ${r.row_id}  ${String(r.name || '').slice(0, 64)}`));
}

if (fail.length) {
  console.log('\nFAILED — ' + fail.length + ' thing(s) wrong with data/questions.json above.');
  process.exit(1);
}
console.log('\nOK — the library parses, its ids are unique, every paper checked sums to its own\n     stated total, and no facet has grown a new answer.');
