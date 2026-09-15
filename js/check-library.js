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
  kind:          ['paper', 'part', 'stem'],
  active:        ['True', 'False'],
  subject:       ['Combined Science', 'English Language', 'Maths', 'Physics', 'Religious Studies'],
  resource_type: ['Exercise', 'Past paper', 'Specimen paper', 'Worksheet'],
  key_stage:     ['KS1', 'KS1, KS2', 'KS2', 'KS3', 'KS3, KS4', 'KS4', 'KS5'],
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
const papers = new Set(rows.filter(r => r && r.kind === 'paper').map(r => r.paper_id).filter(Boolean));
const orphans = new Map();
rows.forEach(r => {
  if (!r || r.kind === 'paper' || !r.paper_id) return;
  if (!papers.has(r.paper_id)) {
    if (!orphans.has(r.paper_id)) orphans.set(r.paper_id, []);
    orphans.get(r.paper_id).push(r.row_id);
  }
});
orphans.forEach((ids, p) => fail.push(
  `${ids.length} question${ids.length > 1 ? 's' : ''} name paper_id ${p}, which has no kind:'paper' row`));

/* Papers with nothing under them are the backlog, not a fault. */
const used = new Set(rows.filter(r => r && r.kind !== 'paper').map(r => r.paper_id));
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
  if (r && r.kind === 'paper' && r.paper_id) paperFacts.set(r.paper_id, r);
});
const isEdexcelGcseMaths = pid => {
  const p = paperFacts.get(pid);
  return !!p && p.exam_board === 'Edexcel' && p.subject === 'Maths' && p.key_stage === 'KS4'
      && p.resource_type === 'Past paper' && (p.tier === 'Higher' || p.tier === 'Foundation');
};
const marks = new Map();
rows.forEach(r => {
  if (!r || r.kind !== 'part') return;
  if (!isEdexcelGcseMaths(r.paper_id)) return;
  const n = Number(r.marks);
  if (!Number.isFinite(n)) {
    fail.push(`${r.row_id} has marks ${JSON.stringify(r.marks)}, which is not a number`);
    return;
  }
  marks.set(r.paper_id, (marks.get(r.paper_id) || 0) + n);
});
[...marks.entries()].sort().forEach(([p, m]) => {
  if (m !== 80) fail.push(`${p} totals ${m} marks; every Edexcel GCSE maths paper is 80`);
});

/* ---------- THE CLOSED VOCABULARY ----------------------------------------------------------------- */
const strays = [];
Object.keys(VOCAB).forEach(col => {
  const allowed = new Set(VOCAB[col]);
  const bad = new Map();
  rows.forEach(r => {
    if (!r || !(col in r)) return;
    const v = String(r[col]);
    if (!allowed.has(v)) bad.set(v, (bad.get(v) || 0) + 1);
  });
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
const withQuestions = new Set(rows.filter(r => r && r.kind === 'part').map(r => r.paper_id));
const sittings = new Map();
rows.forEach(r => {
  if (!r || r.kind !== 'paper' || !withQuestions.has(r.paper_id)) return;
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
rows.forEach(r => { if (r && r.kind === 'part') partsPer[r.paper_id] = (partsPer[r.paper_id] || 0) + 1; });
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

say('QUESTIONS THE TRANSCRIBER COULD NOT RECOVER — worth a person and the original PDF', flagged,
    r => `${r.row_id}  ${String(r.examiner_note).slice(0, 96)}`);

console.log(`\npapers with no questions under them yet: ${empty.length}  (the backlog, not a fault)`);
console.log(`documents with a stub row beside their transcription: ${stubPairs}  (the intended state)`);

if (fail.length) {
  console.log('\nFAILED — ' + fail.length + ' thing(s) wrong with data/questions.json above.');
  process.exit(1);
}
console.log('\nOK — the library parses, its ids are unique, every paper is 80 marks, and no facet has grown a new answer.');
