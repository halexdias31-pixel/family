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

const NUMBERED = /^(materials|step|topic)_\d+$/;
/* THE SENTENCES THAT PUT A CHILD'S WORK ON THE INTERNET. A closed list, which is the
   `LOCAL` / `RETIRED_FACETS` pattern: it cannot catch a phrasing nobody has written, and it makes
   the obvious ones impossible to ship by accident. */
const ONLINE = /\b(upload|publish|post (it|them|this) online|go live|youtube channel|public link)\b/i;
const LOCAL = ['Wandle', 'Colliers Wood', 'Britannia Point', 'Wandsworth', 'Croydon', 'Merton'];
const QTY_MAX = 12;
const STEPS_MIN = 4;

const seen = new Set();
let live = 0, topicLinks = 0, joined = 0, kitItems = 0, kitQty = 0, sessions = 0;
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
console.log('\nTHE PROJECTS  —  ' + rows.length + ' projects, ' + live + ' live, '
  + sessions + ' sessions of work between them');
console.log('topic links: ' + topicLinks + ' (' + (rows.length ? (topicLinks / rows.length).toFixed(1) : 0)
  + ' each), ' + joined + ' of ' + rows.length + ' reaching at least one branch of the topic tree');
console.log('by subject: ' + Object.keys(bySubject).map(k => k + ' ' + bySubject[k]).join(' · ')
  + '   by level: ' + Object.keys(byLevel).map(k => k + ' ' + byLevel[k]).join(' · '));
console.log('materials: ' + kitQty + ' of ' + kitItems + ' items carry a quantity');
note.forEach(n => console.log('note: ' + n));

if (fail.length) {
  console.log('\nBROKEN  (' + fail.length + ')');
  fail.forEach(f => console.log('  ' + f));
  console.log('\nFAILED — ' + fail.length + ' thing(s) wrong with data/projects.json or its join above.');
  process.exit(1);
}
console.log('\nOK — every project has an id, a subject and level the funnel can group, ages and\n'
  + '     sessions as numbers, materials, steps, a share note, nothing sent online, and topics\n'
  + '     that name real branches of the tree; and Find offers them as "Projects".');
