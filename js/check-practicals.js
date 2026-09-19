#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-practicals.js

   THE PRACTICALS, AND WHETHER THE THING THEY ARE JOINED TO EXISTS.

   WHY THIS IS NOT PART OF `check-library.js`. That one owns `data/questions.json` — ids, the 80-mark
   rule, the closed facet vocabulary. This owns a different file with a different shape and, more to
   the point, ONE question that file cannot ask: does a practical's topic name anything real.

   THAT QUESTION IS THE WHOLE FEATURE. The export shipped one topic per practical and the trundle
   wheel's was `Perimeter and area` — a phrase that reads perfectly and matched exactly ONE question
   in a library holding ninety-four about perimeter and area under other spellings. A join that
   silently reaches nothing is this repository's oldest shape: `figure`, `orderPrints`, the four
   message actions, `exam_date`. Here it would be worse than silent, because "Practicals" would be
   an answer in the funnel that quietly returned the wrong ones.

   SO A TOPIC HAS TO BE A LABEL OR AN ALIAS IN `data/topics.json`, and that is checkable where free
   text never is. The tree is the one place that says what a topic is called; a practical naming a
   spelling the tree has never heard of is either a typo or a branch somebody needs to add, and
   both are things a person should be told about rather than a filter that comes back empty.
================================================================================================== */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fail = [];
const note = [];

/* ---------- THE SHAPE, PARSED A LINE AT A TIME ---------------------------------------------------
   The same rule `data/questions.json` has and for the same reason: the next script to append by
   splitting on newlines. `check-library.js` records why each line is parsed on its own rather than
   the file's last character checked — a whole file flattened onto one line still ends in `}`. */
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

const rows = readLines('data/practicals.json');
const tree = readLines('data/topics.json');

/* ---------- WHAT THE TREE ANSWERS TO -------------------------------------------------------------
   Label, alias, and the id read as words — the same three `topicIndex_` in find.js builds its map
   from. Deliberately NOT the containment pass: that one resolves "scatter graphs" inside "Scatter
   Graphs & Correlation" and is right to, but a practical's topic is written by hand into a file
   under review, so it can be held to the stricter standard of naming the branch outright. */
const key = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');
const known = new Set();
tree.forEach(t => {
  if (!t || !t.label) return;
  known.add(key(t.label));
  known.add(key(String(t.topic_id || '').replace(/-/g, ' ')));
  String(t.aliases || '').split(',').forEach(a => { if (a.trim()) known.add(key(a)); });
});

const COMPLIANCE = new Set([
  'AQA required practical',
  'AQA-aligned, not a required practical',
  'Not assessed — enrichment',
]);

/* FIVE LEVELS, LOWEST FIRST. `none` is a fish tank; `medium` is the only one in this library that
   involves fire, and it is outdoors on a metal tray. Nothing here is `high` that is not also
   refused outright. */
const HAZARD = new Set(['none', 'very low', 'low', 'medium', 'high']);

/* ---------- AND `wow` IS A CLOSED LIST FOR A REASON THIS FILE ALREADY LEARNED ---------------------
   IT WENT IN AS FREE TEXT — "low to look at, high to learn from", "high — and he keeps it" — which
   reads beautifully and cannot be compared. The card reads this column to mark the one or two worth
   opening a session with, and a rule over free text is the fault recorded a few lines up, where
   `/required practical/` matched `AQA-aligned, NOT a required practical` and called five extras
   required. The nuance did not go anywhere: it is in `notes`, which is prose and is drawn as prose. */
const WOW = new Set(['low', 'medium', 'medium-high', 'high', 'very high']);

/* The numbered columns this file exists to have replaced. A returning `equipment_11` is not untidy,
   it is the fault coming back — the same argument `RETIRED_FACETS` makes about a deleted facet. */
const NUMBERED = /^(equipment|step|topic)_\d+$/;

const seen = new Set();
let joined = 0, topicLinks = 0, required = 0;
let excluded = 0, hazards = 0, ages = 0, costed = 0;
let risked = 0, riskLines = 0;
const unknownTopics = new Map();

rows.forEach(r => {
  const id = String((r && r.practical_id) || '').trim();
  if (!id) { fail.push('a row has no practical_id'); return; }
  if (seen.has(id)) fail.push(id + ' appears twice — a repeat silently replaces a practical');
  seen.add(id);

  Object.keys(r).forEach(k => {
    if (NUMBERED.test(k)) {
      fail.push(id + ' carries `' + k + '` — the numbered columns were folded into `equipment`, '
        + '`steps` and `topics`, and one coming back is the fault returning');
    }
  });

  const c = String(r.compliance || '').trim();
  if (!COMPLIANCE.has(c)) {
    fail.push(id + ' has compliance "' + c + '", which is not one of the three written down. '
      + 'Add it to COMPLIANCE here deliberately, or fix the row.');
  }
  /* EXACTLY THE ONE VALUE. `AQA-aligned, not a required practical` CONTAINS the words
     "required practical", so a substring test counted five extras as required — found here,
     by this count disagreeing with the one the transform printed. */
  if (c === 'AQA required practical') required++;

  /* ---------- A REFUSED EXPERIMENT IS ASKED FOR A REASON WHERE A LIVE ONE IS ASKED FOR A METHOD --
     FIVE ROWS ARE EXPERIMENTS THAT WERE CONSIDERED AND TURNED DOWN — burning magnesium ribbon,
     magnesium and hydrochloric acid, flame tests, and two left out on preference. They are rows
     rather than a deletion because "recorded so the reasoning is not lost" is the whole point of
     them: a tutor asking why they are not doing the classic version has to be able to find the
     answer.

     `active` IS NOT THE COLUMN FOR THAT, and this repository already records the distinction on
     the posts tab: `active` is whether a thing has been deleted and `approved` is whether it has
     been let through, and folding them together makes undeleting and approving one act. So an
     excluded row is LIVE and carries `excluded_reason`.

     AND IT IS NOT ASKED FOR A METHOD. An experiment nobody will run does not need one, and
     demanding it would mean writing out a procedure purely to satisfy a checker — inventing
     content, which is the opposite of what this file is for. It is asked for the reason instead,
     which is the thing that has to be there. */
  const gone = String(r.excluded_reason || '').trim();
  if (gone) {
    excluded++;
    ['steps', 'risks'].forEach(col => {
      if (String(r[col] || '').trim()) {
        fail.push(id + ' is refused and carries ' + (col === 'steps' ? 'a method' : 'a risk '
          + 'assessment') + ' anyway — an experiment nobody is going to run does not need one, '
          + 'and one that is there will eventually get run');
      }
    });
  } else {
    /* ---------- THE THREE LIST COLUMNS: PRESENT, AND NO DOUBLED PIPE ---------------------------
       `risks` IS A FAILURE RATHER THAN A COUNT, and it is the only editorial column in this file
       that is. Everywhere else here a blank cell is a backlog printed as a number — the age, the
       hazard, the shop join — because the argument this repository makes over and over is that a
       wrong "you need compasses" sends a tutor into a lesson with the wrong bag while a blank one
       sends them to look at the paper.

       A RISK ASSESSMENT IS THE ONE PLACE THAT ARGUMENT DOES NOT HOLD. The blank does not send
       anybody to look: it produces a guide that opens with a heading reading `Risk assessment`
       over nothing, which reads as an experiment with no hazards in it. That is a claim, and it
       is the one claim in this app that could hurt somebody. So a live practical arriving with no
       hazards written out fails here, where it is one row of editorial work, rather than shipping
       and being found in a client's kitchen.

       The guide still draws a fallback for it — see `practicalGuide_` — because a phone running a
       file from before this rule existed is a thing that happens, and half a second of honest
       prose beats an empty heading. This is what stops that fallback ever being reached. */
    ['equipment', 'steps', 'risks'].forEach(col => {
      const v = String(r[col] || '').trim();
      if (!v) {
        fail.push(id + ' has no ' + col + (col === 'risks'
          ? ' — a hazard and what you do about it, one per pipe-separated item' : ''));
        return;
      }
      v.split('|').forEach(part => {
        if (!part.trim()) fail.push(id + ' has an empty item in ' + col + ' — a doubled pipe');
      });
    });
    risked++;
    riskLines += String(r.risks || '').split('|').filter(t => t.trim()).length;
  }

  /* ---------- THE HAZARD IS A CLOSED LIST, FOR `VOCAB`'S REASON ---------------------------------
     It is the one word a tutor triages on before reading anything else — "medium, involves fire"
     against "very low" — and free text turns a triage into a paragraph. A sixth level has to be
     added here by somebody who has just read the five already in use, which is the argument
     `check-library.js` makes about `exam_wave` and `Resit` beside `Second wave`. */
  const hz = String(r.hazard || '').trim();
  if (hz && !HAZARD.has(hz)) {
    fail.push(id + ' has hazard "' + hz + '", which is not one of the five written down. '
      + 'Add it to HAZARD here deliberately, or fix the row.');
  }
  if (hz) hazards++;

  const ww = String(r.wow || '').trim();
  if (ww && !WOW.has(ww)) {
    fail.push(id + ' has wow "' + ww + '", which is not one of the five written down. It is read '
      + 'by the card to mark what to open with, so it has to be comparable — put the nuance '
      + 'in `notes`.');
  }

  /* ---------- AN AGE IS A NUMBER OR IT IS ABSENT ------------------------------------------------
     `12+ with an adult` in this column would be a sentence nothing can compare, and the sentence
     belongs in `safety` where it already is. */
  if (r.age_min !== undefined && r.age_min !== null && r.age_min !== '') {
    const a = Number(r.age_min);
    if (!isFinite(a) || a < 4 || a > 18) {
      fail.push(id + ' has age_min "' + r.age_min + '", which is not an age between 4 and 18');
    } else { ages++; }
  }

  /* ---------- A COST OF NOTHING AND NO COST ARE DIFFERENT ANSWERS -------------------------------
     THIS IS THE `cost: 0` FAULT AND THIS FILE IS WHERE IT IS REFUSED. CLAUDE.md records it four
     times: `Number(x.price) || 0` made a blank cell a price of nought and 3,262 of 3,265 items
     answered "Free". Measuring car speeds really does cost nothing per run; the 41 lab practicals
     have never been costed at all. A `0` states the first and an absent value states the second,
     and an empty STRING states neither — it is a blank wearing a number's clothes. */
  ['cost_per_run_gbp', 'setup_cost_gbp'].forEach(col => {
    const v = r[col];
    if (v === undefined || v === null) return;
    if (typeof v !== 'number' || !isFinite(v) || v < 0) {
      fail.push(id + ' has ' + col + ' ' + JSON.stringify(v) + ' — a cost is a number, and '
        + 'ABSENT where it has not been worked out. An empty string is neither.');
    } else if (col === 'cost_per_run_gbp') { costed++; }
  });

  const topics = String(r.topics || '').split(',').map(t => t.trim()).filter(Boolean);
  if (!topics.length) {
    fail.push(id + ' names no topics, so nothing in the library can reach it');
  }
  topicLinks += topics.length;
  let ok = 0;
  topics.forEach(t => {
    if (known.has(key(t))) { ok++; return; }
    if (!unknownTopics.has(t)) unknownTopics.set(t, []);
    unknownTopics.get(t).push(id);
  });
  if (ok) joined++;

  /* The shop join. Nothing reads it yet — the stock lives in the Settings spreadsheet — so this
     only asks that what is there is shaped like an id list and not like a name. */
  const items = String(r.item_ids || '').trim();
  if (items && !/^I\d+(\s*,\s*I\d+)*$/.test(items)) {
    fail.push(id + ' has item_ids "' + items + '", which is not a comma list of I-numbers');
  }
});

unknownTopics.forEach((ids, t) => {
  fail.push('topic "' + t + '" (on ' + ids.join(', ') + ') is not a label, alias or id in '
    + 'data/topics.json — so nothing in the library shares it and the join is decoration. '
    + 'Either it is a typo, or the tree needs that branch.');
});

/* ---------- SAY IT ------------------------------------------------------------------------------ */
console.log('\nTHE PRACTICALS  —  ' + rows.length + ' experiments, ' + required + ' AQA required, '
  + (rows.length - required) + ' extra');
console.log('topic links: ' + topicLinks + ' across ' + rows.length + ' practicals ('
  + (rows.length ? (topicLinks / rows.length).toFixed(1) : 0) + ' each), '
  + joined + ' reaching at least one branch of the topic tree');

/* ---------- PRINTED, BECAUSE A NUMBER IS SOMETHING SOMEBODY CAN ACT ON ------------------------
   The argument `check-library.js` makes about its own counts, and the one that caught a rename
   taking `papers checked against a total` from 34 to 2 under a green tick. A count that moves when
   it should not is the only thing that would show these columns quietly emptying. */
console.log('carrying an age: ' + ages + ' · a hazard level: ' + hazards
  + ' · a cost per run: ' + costed + ' · refused with a reason: ' + excluded);
console.log('risk assessments: ' + risked + ' of ' + (rows.length - excluded) + ' live practicals, '
  + riskLines + ' hazards written out (' + (risked ? (riskLines / risked).toFixed(1) : 0) + ' each)'
  + ' · the ' + excluded + ' refused correctly carry none');

const noItems = rows.filter(r => !String(r.item_ids || '').trim()).length;
if (noItems) {
  note.push(noItems + ' of ' + rows.length + ' name no shop items yet — a backlog, not a fault: '
    + 'the stock rows live in the Settings spreadsheet and this column is the join waiting for them');
}
note.forEach(n => console.log('note: ' + n));

if (fail.length) {
  console.log('\nBROKEN  (' + fail.length + ')');
  fail.forEach(f => console.log('  ' + f));
  console.log('\nFAILED — ' + fail.length + ' thing(s) wrong with data/practicals.json above.');
  process.exit(1);
}
console.log('\nOK — every practical has an id, a compliance the code knows, kit, steps, a risk\n'
  + '     assessment, and topics that name real branches of the tree.');
