#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-projects.js
   THE PROJECTS, AND WHETHER THE THINGS THEY ARE JOINED TO EXIST.

   ASKED FOR AS "the projects are like practicles, but not practicles. so should be a new tag in the
   finder called projects." So this is `check-practicals.js`'s sibling and holds the same two
   arguments it does, about a different file:

   THE JOIN IS THE FEATURE. A project names topics in the library's own spellings, so a recipe book
   that scales from four people to six is found by the Topic question that finds a past paper on
   direct proportion. A topic the tree has never heard of is a join that silently reaches nothing —
   the trundle wheel's `Perimeter and area`, which matched one question in ninety-four.

   THE KIT IS `Name × qty`, refused here because `kitParse_` is forgiving on purpose, and a `Glue ×`
   with nothing after it would draw as the words `Glue ×` and look like a design.

   AND THREE THINGS A PRACTICAL NEVER HAD TO ASK:

   · THE TWO TABLES THAT GROUP THE FUNNEL. `bucketLabels_` stands a whole grouping down the moment
     ONE answer is unplaced. A project whose subject is `Computing`, or whose level is `KS2/KS3`
     with a slash, would turn the Subject or Level question back into the alphabet for the whole
     library — and a kind missing from `KIND_BUCKET` would do the same to `What kind`, which is the
     question the owner asked to see `Projects` in. So all three are read out of js/find.js.

   · AGES 8 TO 16, the range the projects were asked for, as two numbers rather than a sentence.

   · NOTHING GOES ONLINE. A child's film, voice and face are the material here, and "save videos"
     is deliberately not built (see `projectCard_`). A step or a share note that says upload,
     publish or post online is the one sentence on these cards that could hurt somebody, so it
     fails rather than counts. `safety` may SAY "not put online"; it is not scanned.

   AND, SINCE 9 OCT, A PROJECT OR A COURSEWORK. "i would like to add course works. make it bare
   bones. its within projects in finder." — the owner. So `project_type` is a closed word, blank
   reading as `project`; a live coursework MUST name an `exam_board` from a closed list and MAY
   name a `spec_ref`, and a project may name neither (note 253: a how-to video has no exam board);
   there is a project AND a coursework, because a question with one answer is never asked; and the
   question is wired the way `practicalType` is — a row in `data/settings/facets.json`, live, asked
   before Subject, asked ONLY of a list that is all projects, its colour in `TAG_OF`. See
   docs/history/314.
================================================================================================== */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const fail = [];
const note = [];

/* ONE OBJECT PER LINE, `[` and `]` alone — every data file's shape, for the next script that
   appends by splitting on newlines. Same reader `check-practicals.js` uses, for its reason. */
function readLines(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) { fail.push(rel + ' does not exist'); return []; }
  const lines = fs.readFileSync(p, 'utf8').replace(/\n$/, '').split('\n');
  if (lines[0].trim() !== '[') fail.push(rel + ' line 1 is not a bare [');
  if (lines[lines.length - 1].trim() !== ']') fail.push(rel + ' does not end with a bare ]');
  const rows = [];
  lines.slice(1, -1).forEach((raw, i) => {
    const s = raw.trim().replace(/,$/, '');
    if (!s) return;
    try { rows.push(JSON.parse(s)); }
    catch (e) { fail.push(rel + ' line ' + (i + 2) + ' does not parse — ' + e.message.slice(0, 60)); }
  });
  return rows;
}

const rows = readLines('data/projects.json');
const tree = readLines('data/topics.json');

/* LABEL, ALIAS, AND THE ID READ AS WORDS — `check-practicals.js`'s three, and its stricter standard:
   a hand-written topic names the branch outright rather than resolving by containment. */
const key = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');
const known = new Set();
tree.forEach(t => {
  if (!t || !t.label) return;
  known.add(key(t.label));
  known.add(key(String(t.topic_id || '').replace(/-/g, ' ')));
  String(t.aliases || '').split(',').forEach(a => { if (a.trim()) known.add(key(a)); });
});

/* ---------- THE THREE TABLES, READ OUT OF THE FILE THAT USES THEM --------------------------------
   READ RATHER THAN COPIED, because a copy here is a second list that agrees with the first until
   the day somebody edits one. The quoted strings inside the `bucketTable_([...])` literal are the
   labels and the values together; a value matching either is placed. */
const findSrc = fs.readFileSync(path.join(root, 'js', 'find.js'), 'utf8');
function table(name) {
  const m = new RegExp('const ' + name + ' = bucketTable_\\(\\[([\\s\\S]*?)\\]\\);').exec(findSrc);
  if (!m) { fail.push(name + ' is not in js/find.js any more — this check cannot see what groups the funnel'); return null; }
  const out = new Set();
  /* COMMENTS OUT FIRST. `KIND_BUCKET`'s rows sit under prose that quotes kinds by name, and a
     quoted word in a comment is not a placed answer. */
  m[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/'([^']*)'/g, (_, v) => { out.add(v); return _; });
  return out;
}
const SUBJECTS = table('SUBJECT_BUCKET');
const LEVELS = table('LEVEL_BUCKET');
const KINDS_PLACED = table('KIND_BUCKET');

/* THE KIND ITSELF, AND THE WORD THE OWNER ASKED FOR. The label is what `What kind` prints, so it is
   read off the `KINDS` entry and then looked for in the table that groups it. */
const kindM = /\n\s*project:\s*\{\s*group:\s*'([^']*)',\s*label:\s*'([^']*)'/.exec(findSrc);
if (!kindM) {
  fail.push('js/find.js has no `project:` entry in KINDS — Projects is not a kind, so Find cannot offer it');
} else {
  if (kindM[1] !== 'Learning') fail.push('the project kind is in group "' + kindM[1] + '", not Learning beside the practicals');
  if (kindM[2] !== 'Projects') fail.push('the project kind is labelled "' + kindM[2] + '" — the owner asked for "Projects"');
  if (KINDS_PLACED && !KINDS_PLACED.has(kindM[2])) {
    fail.push('"' + kindM[2] + '" is not in KIND_BUCKET — one unplaced kind stands the whole '
      + '`What kind` grouping down to the alphabet');
  }
}
/* AND THE FILE IS FETCHED AT ALL. A kind with a mapper and no fetch is a door to an empty room —
   `DATA.projects` would be `undefined`, `|| []` would make it nothing, and nothing would say so. */
const libSrc = fs.readFileSync(path.join(root, 'js', 'library.js'), 'utf8');
const libM = /const LIB_EXTRA = \[([^\]]*)\]/.exec(libSrc);
if (!libM || libM[1].indexOf("'projects'") < 0) {
  fail.push("js/library.js LIB_EXTRA does not name 'projects', so data/projects.json is never fetched");
}

/* ---------- PROJECT OR COURSEWORK, WIRED END TO END ------------------------------------------------
   FOUR PLACES, AND A MISSING ONE IS SILENT IN EVERY CASE. `practicalType`'s arrangement, which has no
   facet in code: the mapper has to read the column, the item has to carry the field, the facets file
   has to name it (a field nobody names is a question nobody asks), and `TAG_OF` has to colour it.
   Read out of the files, for the reason the bucket tables are. */
const TYPES = new Set(['project', 'coursework']);
/* THE BOARDS, IN THE SPELLINGS THE REST OF THE SHELF ALREADY USES — `check-library.js` holds `AQA`
   and `Edexcel` for the papers, and the textbooks print `AQA`, `Edexcel`, `OCR` and `Eduqas`. One
   spelling per board is what makes Exam board put a coursework and a past paper under one answer;
   `Pearson Edexcel` or `AQQ` would be an answer of their own. A closed list, `PROJ_TYPE`'s rule:
   a new board is added here on purpose. */
const BOARDS = new Set(['AQA', 'Edexcel', 'OCR', 'WJEC', 'Eduqas', 'CCEA']);
if (!/projectType:\s*libS\(r\.project_type\)/.test(libSrc)) {
  fail.push('js/library.js does not map `project_type` onto `projectType` — every coursework would read as a project');
}
if (!/\n\s*projectType:\s*projType_\(p\)/.test(findSrc)) {
  fail.push('the project mapper in js/find.js does not put `projectType` on the item, so the funnel has nothing to read');
}
/* IN `TAG_OF` ITSELF, not anywhere in the file. Tested against the whole of find.js this passed with
   the entry deleted and the words quoted in a comment elsewhere; `check-bible.js` cuts the same
   block out first, and so does this. */
const tagSrc = (() => {
  const i = findSrc.indexOf('const TAG_OF = {');
  const j = i < 0 ? -1 : findSrc.indexOf('\n};', i);
  return i < 0 || j < 0 ? '' : findSrc.slice(i, j).replace(/\/\*[\s\S]*?\*\//g, '');
})();
if (!tagSrc) fail.push('js/find.js has no `const TAG_OF = {` block — the type colour was NOT checked');
else if (!/\bprojectType:\s*'type'/.test(tagSrc)) {
  fail.push('TAG_OF in js/find.js has no `projectType: \'type\'` — the answer and its chip would be the plain outline, not the type colour experiment-or-build wears');
}
let facetRows = [];
try { facetRows = JSON.parse(fs.readFileSync(path.join(root, 'data', 'settings', 'facets.json'), 'utf8')); }
catch (e) { fail.push('data/settings/facets.json does not parse — the Project or coursework question was NOT checked'); }
/* THE FACETS FILE'S CELLS, READ THE WAY THE PHONE READS THEM. `settingsInto_` turns a blank
   `sort_order` into null and `facetList` then places the question at 1000 and up — after Subject —
   while `Number('')` is 0 and looked like "first". `active` goes through `libOn`, so "FALSE" is off
   though it is not `=== false`. And `min_coverage` through `facetMin_`: blank is the default half, a
   number over 1 is a percentage. Three readers copied in miniature, because a check that reads a cell
   more kindly than the phone does is a check that passes what the phone breaks. */
const cellNum = v => (v === null || v === undefined || String(v).trim() === '' || !isFinite(Number(v)) ? null : Number(v));
const cellOn = v => /^(true|yes|1|y|on|)$/i.test(String(v === undefined || v === null ? '' : v).trim());
const cellMin = v => { const n = cellNum(v); const m = n === null ? 0.5 : n; return m > 1 ? Math.min(m / 100, 1) : Math.max(m, 0); };
const typeRow = facetRows.find(f => f && f.field === 'projectType');
const subjRow = facetRows.find(f => f && f.field === 'subject');
if (facetRows.length && !typeRow) {
  fail.push('data/settings/facets.json has no `projectType` row — with no facet in code that is the only thing that makes it a question');
} else if (typeRow) {
  const at = cellNum(typeRow.sort_order), subjAt = subjRow ? cellNum(subjRow.sort_order) : null;
  if (!cellOn(typeRow.active)) fail.push('data/settings/facets.json switches `projectType` off (active ' + JSON.stringify(typeRow.active) + ') — Projects would never ask Project or coursework');
  /* BEFORE SUBJECT, AND THIS IS THE RULE THAT WOULD OTHERWISE FAIL WITHOUT A SOUND. A coursework's
     subject (Design and Technology) is not one any project has, so Subject asked first files it
     alone under Technology; once it is alone the question has one answer, and a question with one
     answer is never asked. Measured with the row at 38.5, beside `practicalType`: the funnel asked
     Subject straight after Projects (check-flow's coursework journey), and every Subject answer
     leaves one type, so Project or coursework could never come. A blank is NOT before anything:
     the phone puts it at 1000. */
  else if (at === null) {
    fail.push('`projectType` has sort_order ' + JSON.stringify(typeRow.sort_order) + ' — the phone reads that as no order and asks it after every coded question, Subject included');
  } else if (subjAt !== null && !(at < subjAt)) {
    fail.push('`projectType` is at sort_order ' + at + ', not before Subject (' + subjAt
      + ') — Subject would split the courseworks from the projects first and the question would never have two answers');
  }
  /* ONLY OF A LIST THAT IS ALL PROJECTS. Asked before Subject, at the default half it was asked of
     ANY list that was half projects: typing `blade` and skipping What kind left two projects, the
     D&T textbook and a practical, the funnel asked Project or coursework, and Coursework dropped the
     textbook and the practical without a word. A sweep of 1,550 searches found `send`, `folder` and
     `studio` doing the same. At 1 every item in hand has to be a project, which is what the row's
     note always said the coverage rule did. */
  const min = cellMin(typeRow.min_coverage);
  if (min < 1) {
    fail.push('`projectType` has min_coverage ' + JSON.stringify(typeRow.min_coverage) + ', read as ' + min
      + ' — it must be 1, or a search holding projects AND textbooks or practicals asks Project or coursework, and either answer drops the rest without a word');
  }
}

const NUMBERED = /^(materials|step|topic)_\d+$/;
/* THE SENTENCES THAT PUT A CHILD'S WORK ON THE INTERNET. A closed list, which is the
   `LOCAL` / `RETIRED_FACETS` pattern: it cannot catch a phrasing nobody has written, and it makes
   the obvious ones impossible to ship by accident. */
const ONLINE = /\b(upload|publish|post (it|them|this) online|go live|youtube channel|public link)\b/i;
const LOCAL = ['Wandle', 'Colliers Wood', 'Britannia Point', 'Wandsworth', 'Croydon', 'Merton'];
const QTY_MAX = 12;
const STEPS_MIN = 4;
const STEPS_PAGE_FITS = 1200;

const seen = new Set();
let live = 0, topicLinks = 0, joined = 0, kitItems = 0, kitQty = 0, sessions = 0;
const byType = { project: 0, coursework: 0 };
const unknownTopics = new Map();
const bySubject = {}, byLevel = {};

rows.forEach(r => {
  const id = String((r && r.project_id) || '').trim();
  if (!id) { fail.push('a row has no project_id'); return; }
  if (!/^PJ-\d{2,}$/.test(id)) fail.push(id + ' is not shaped PJ-nn — the practicals are PR-, and one id space each is how a key never collides');
  if (seen.has(id)) fail.push(id + ' appears twice — a repeat silently replaces a project');
  seen.add(id);
  const on = /^(true|yes|1|y|on|)$/i.test(String(r.active == null ? '' : r.active).trim());
  if (on) live++;

  Object.keys(r).forEach(k => {
    if (NUMBERED.test(k)) fail.push(id + ' carries `' + k + '` — a numbered column; the list is one pipe-separated cell');
    if (typeof r[k] === 'string') LOCAL.forEach(w => {
      if (r[k].indexOf(w) >= 0) fail.push(id + '.' + k + ' names ' + w + ' — a step that names a place only works for somebody standing in it');
    });
  });

  ['name', 'summary', 'makes', 'materials', 'steps', 'topics', 'share', 'safety'].forEach(col => {
    if (!String(r[col] || '').trim()) fail.push(id + ' has no ' + col);
  });

  /* A CLOSED WORD, WRITTEN AS THE MAPPER READS IT. Blank is `project` — the eight rows from before
     the column. Exact and lower-case, `check-practicals.js`'s rule for `practical_type`: the mapper
     forgives `Coursework`, and a file that relies on being forgiven is a file the next reader trips
     on. */
  const pt = r.project_type == null ? '' : r.project_type;
  if (typeof pt !== 'string') fail.push(id + ' has project_type ' + JSON.stringify(pt) + ' — text: blank, project or coursework');
  else if (pt !== '' && !TYPES.has(pt)) {
    fail.push(id + ' has project_type "' + pt + '" — blank, project or coursework. A third word is drawn raw on the card '
      + 'and answers the question as itself; add it to PROJ_TYPE in js/find.js deliberately, then here.');
  }
  const type = TYPES.has(pt) ? pt : 'project';
  /* LIVE ROWS ONLY: a switched-off coursework is one Find never offers, so it answers nothing. */
  if (on) byType[type] = (byType[type] || 0) + 1;
  /* THE BOARD AND THE SPEC ARE TEXT, and a coursework's alone. `8552` typed as a number is a spec
     that loses a leading zero the day a board has one and sorts as arithmetic; and a board on a
     project means a row that is coursework and was never marked so — note 253, "a how-to video has
     no ... exam board". */
  ['exam_board', 'spec_ref'].forEach(col => {
    if (r[col] == null || r[col] === '') return;
    if (typeof r[col] !== 'string') fail.push(id + '.' + col + ' is ' + JSON.stringify(r[col]) + ' — text, in quotes');
    else if (!r[col].trim()) fail.push(id + '.' + col + ' is only spaces');
    else if (type !== 'coursework') fail.push(id + ' names ' + col + ' "' + r[col] + '" and is not a coursework — a project has no board; mark it `project_type: coursework` or take the board off');
  });
  /* THE PRACTICALS' SPELLING, AND ONLY IT. `board` and `spec` are the textbooks' columns for the same
     two facts; on a project row the mapper reads neither, so a coursework written with them would
     lose its board without a sound. Named so the fix is obvious. */
  [['board', 'exam_board'], ['spec', 'spec_ref']].forEach(([wrong, right]) => {
    if (r[wrong] != null) fail.push(id + ' has a `' + wrong + '` column — the projects spell it `' + right + '`, as the practicals do; the mapper never reads `' + wrong + '`');
  });
  /* A COURSEWORK HAS A BOARD — "the one thing it has that a project does not". Required on a LIVE
     one, from the closed list above: a coursework with no board is a project wearing the word, and a
     misspelt board is an Exam board answer of its own. */
  if (on && type === 'coursework') {
    const b = typeof r.exam_board === 'string' ? r.exam_board.trim() : '';
    if (!b) fail.push(id + ' is a coursework with no exam_board — a coursework counts towards one board\'s qualification; name it (' + [...BOARDS].join(', ') + ')');
    else if (!BOARDS.has(b)) fail.push(id + ' has exam_board "' + b + '", not one of ' + [...BOARDS].join(', ') + ' — a new board is added to BOARDS on purpose, in the spelling the textbooks use');
  }
  /* HOW LONG THE ORDERED PAGE IS, PRINTED AND NOT FAILED. The steps and the safety paragraph share
     one card, and the card is drawn smaller to fit down to a floor and then scrolls inside itself.
     Measured at 320×568 on 9 Oct: PJ-01's 1,182 characters fit at 74%, PJ-02's 1,253 scroll by
     29px, and the first coursework's 1,617 scrolled by 141 with its knife-safety paragraph under the
     edge. A proxy for a measurement, so a note — `check/ui.js` skips a pane that scrolls, and a
     screenshot is the last word. */
  const pageChars = String(r.steps || '').replace(/\|/g, '').length + String(r.safety || '').length;
  if (pageChars > STEPS_PAGE_FITS) note.push(id + '\'s steps and safety are ' + pageChars + ' characters; at 320px about ' + STEPS_PAGE_FITS + ' fit on the page whole, so this one probably scrolls inside its card');

  /* THE TWO TABLES. Blank is allowed by the funnel and refused here: a project nobody has put in a
     subject is a project the Subject question cannot reach. */
  const subj = String(r.subject || '').trim();
  if (!subj) fail.push(id + ' has no subject');
  else if (SUBJECTS && !SUBJECTS.has(subj)) {
    fail.push(id + ' has subject "' + subj + '", which SUBJECT_BUCKET in js/find.js does not place — '
      + 'one unplaced subject stands the whole Subject grouping down. Add a row there deliberately, or use one it has.');
  }
  bySubject[subj] = (bySubject[subj] || 0) + 1;
  const lvl = String(r.level || '').trim();
  if (!lvl) fail.push(id + ' has no level');
  else if (LEVELS && !LEVELS.has(lvl)) {
    fail.push(id + ' has level "' + lvl + '", which LEVEL_BUCKET in js/find.js does not place');
  }
  byLevel[lvl] = (byLevel[lvl] || 0) + 1;

  /* NUMBERS, NOT STRINGS. An empty string is a blank wearing a number's clothes — the `cost: 0`
     argument `check-practicals.js` makes about a price. */
  const s = r.sessions;
  if (typeof s !== 'number' || !Number.isInteger(s) || s < 1 || s > 12) {
    fail.push(id + ' has sessions ' + JSON.stringify(s) + ' — a whole number of sessions, 1 to 12');
  } else sessions += s;
  const a0 = r.age_min, a1 = r.age_max;
  if (typeof a0 !== 'number' || typeof a1 !== 'number' || a0 < 8 || a1 > 16 || a0 > a1) {
    fail.push(id + ' has ages ' + JSON.stringify(a0) + '–' + JSON.stringify(a1)
      + ' — two numbers inside 8 to 16, the range the projects were asked for, youngest first');
  }

  /* THE STEPS. Four at least: fewer is an idea rather than a project. */
  const steps = String(r.steps || '').split('|');
  if (steps.some(t => !t.trim())) fail.push(id + ' has an empty step — a doubled pipe');
  if (steps.filter(t => t.trim()).length < STEPS_MIN) fail.push(id + ' has fewer than ' + STEPS_MIN + ' steps');

  /* `Name × qty`, word for word the practicals' rule — see the note there on why `×` and not `x`,
     and why a quantity of one is no quantity. */
  String(r.materials || '').split('|').forEach(item => {
    item = item.trim();
    if (!item) { fail.push(id + ' has an empty item in materials — a doubled pipe'); return; }
    kitItems++;
    const bits = item.split('×');
    if (bits.length === 1) return;
    if (bits.length > 2) { fail.push(id + ' has a materials item with two × — "' + item + '"'); return; }
    const name = bits[0].trim(), qty = bits[1].trim();
    if (!name) fail.push(id + ' has a materials item that is a quantity and no thing — "' + item + '"');
    if (!qty) fail.push(id + ' has a materials item ending in × — "' + item + '"');
    if (qty === '1') fail.push(id + ' has a quantity of 1 — "' + item + '". Leave it off');
    if (qty.length > QTY_MAX) fail.push(id + ' has a quantity of ' + qty.length + ' characters — "' + qty + '"');
    if (qty) kitQty++;
  });

  ['steps', 'share', 'summary', 'makes'].forEach(col => {
    const m = ONLINE.exec(String(r[col] || ''));
    if (m) fail.push(id + '.' + col + ' says "' + m[0] + '" — a project\'s work goes to the tutor in '
      + 'Messages and to the next session, never online. Saving or publishing students\' videos is not built.');
  });

  const topics = String(r.topics || '').split(',').map(t => t.trim()).filter(Boolean);
  topicLinks += topics.length;
  let ok = 0;
  topics.forEach(t => {
    if (known.has(key(t))) { ok++; return; }
    if (!unknownTopics.has(t)) unknownTopics.set(t, []);
    unknownTopics.get(t).push(id);
  });
  if (ok) joined++;
});

unknownTopics.forEach((ids, t) => {
  fail.push('topic "' + t + '" (on ' + ids.join(', ') + ') is not a label, alias or id in '
    + 'data/topics.json — so nothing in the library shares it and the join is decoration.');
});

/* A COUNT, NOT A PASS — the argument `check-practicals.js` prints its own under. If the live
   number reads 0 something has switched every row off, which no rule above would notice. */
if (!live && rows.length) fail.push('every project is switched off — Find would offer nothing under Projects');
/* BOTH ANSWERS, OR THE QUESTION IS NEVER ASKED — the funnel's own rule for a question with one
   answer. So a file of courseworks alone, or of projects alone, leaves the facet wired and silent,
   and only a count can say so. Counted over LIVE rows, because that is the list the funnel asks. */
if (live && !byType.coursework) fail.push('no live row is a coursework — Project or coursework has one answer and is never asked');
if (live && !byType.project) fail.push('every live row is a coursework — Project or coursework has one answer and is never asked');
console.log('\nTHE PROJECTS  —  ' + rows.length + ' projects, ' + live + ' live, '
  + sessions + ' sessions of work between them');
console.log('topic links: ' + topicLinks + ' (' + (rows.length ? (topicLinks / rows.length).toFixed(1) : 0)
  + ' each), ' + joined + ' of ' + rows.length + ' reaching at least one branch of the topic tree');
console.log('by subject: ' + Object.keys(bySubject).map(k => k + ' ' + bySubject[k]).join(' · ')
  + '   by level: ' + Object.keys(byLevel).map(k => k + ' ' + byLevel[k]).join(' · '));
console.log('materials: ' + kitQty + ' of ' + kitItems + ' items carry a quantity');
console.log('live by type: ' + byType.project + ' project(s) · ' + byType.coursework + ' coursework'
  + (typeRow ? '   asked as "' + typeRow.label + '" at ' + typeRow.sort_order
    + ', of lists that are ' + Math.round(cellMin(typeRow.min_coverage) * 100) + '% projects' : ''));
note.forEach(n => console.log('note: ' + n));

if (fail.length) {
  console.log('\nBROKEN  (' + fail.length + ')');
  fail.forEach(f => console.log('  ' + f));
  console.log('\nFAILED — ' + fail.length + ' thing(s) wrong with data/projects.json or its join above.');
  process.exit(1);
}
console.log('\nOK — every project has an id, a subject and level the funnel can group, ages and\n'
  + '     sessions as numbers, materials, steps, a share note, nothing sent online, and topics\n'
  + '     that name real branches of the tree; and Find offers them as "Projects", asking\n'
  + '     "Project or coursework" first and only of a list of projects, with a board from the\n'
  + '     closed list on every coursework and on nothing else.');
