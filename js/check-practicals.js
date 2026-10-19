#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-practicals.js THE PRACTICALS, AND WHETHER THE THING THEY ARE JOINED TO EXISTS. § */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fail = [];
const note = [];

/* ---------- THE SHAPE, PARSED A LINE AT A TIME § */
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

/* ---------- WHAT THE TREE ANSWERS TO § */
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

/* ---------- AND `wow` IS A CLOSED LIST FOR A REASON THIS FILE ALREADY LEARNED § */
const WOW = new Set(['low', 'medium', 'medium-high', 'high', 'very high']);

/* ---------- AN EXPERIMENT OR A THING YOU MAKE § */
const PRACTICAL_TYPE = new Set(['experiment', 'build']);

/* ---------- A QUANTITY IS SHORT, OR IT IS NOT A QUANTITY § */
const QTY_MAX = 12;

/* The numbered columns this file exists to have replaced. A returning `equipment_11` is not untidy,
   it is the fault coming back — the same argument `RETIRED_FACETS` makes about a deleted facet. */
const NUMBERED = /^(equipment|step|topic)_\d+$/;

const seen = new Set();
let joined = 0, topicLinks = 0, required = 0;
let excluded = 0, hazards = 0, ages = 0, costed = 0;
let risked = 0, riskLines = 0;
let experiments = 0, builds = 0;
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
  /* EXACTLY THE ONE VALUE. § */
  if (c === 'AQA required practical') required++;

  /* ---------- A REFUSED EXPERIMENT IS ASKED FOR A REASON WHERE A LIVE ONE IS ASKED FOR A METHOD -- § */
  const gone = String(r.excluded_reason || '').trim();
  if (gone) {
    excluded++;
    /* `practical_type` IS ON THIS LIST FOR THE SAME REASON THE OTHER TWO ARE. § */
    const NEEDLESS = { steps: 'a method', risks: 'a risk assessment',
                       practical_type: 'a shape (experiment or build)' };
    Object.keys(NEEDLESS).forEach(col => {
      if (String(r[col] || '').trim()) {
        fail.push(id + ' is refused and carries ' + NEEDLESS[col] + ' anyway — an experiment '
          + 'nobody is going to run does not need one, and one that is there will eventually '
          + 'get run');
      }
    });
  } else {
    /* ---------- THE THREE LIST COLUMNS: PRESENT, AND NO DOUBLED PIPE § */
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
    /* ---------- AND THE KIT CARRIES ITS OWN QUANTITY, IN ONE STRING § */
    String(r.equipment || '').split('|').map(t => t.trim()).filter(Boolean).forEach(item => {
      const bits = item.split('\u00d7');
      if (bits.length === 1) return;
      if (bits.length > 2) {
        fail.push(id + ' has a kit item with two × in it — "' + item + '". One item is one thing '
          + 'and one quantity; two of anything here is a doubled pipe wearing a different hat');
        return;
      }
      const name = bits[0].trim(), qty = bits[1].trim();
      if (!name) {
        fail.push(id + ' has a kit item that is a quantity and no thing — "' + item + '"');
      }
      if (!qty) {
        fail.push(id + ' has a kit item ending in × with nothing after it — "' + item + '". '
          + 'The kit list would draw the × as part of the name');
      }
      if (qty === '1') {
        fail.push(id + ' has a kit item with a quantity of 1 — "' + item + '". Leave it off: one '
          + 'of a thing is what a kit line with no quantity already means');
      }
      if (qty.length > QTY_MAX) {
        fail.push(id + ' has a kit quantity of ' + qty.length + ' characters — "' + qty + '". It '
          + 'is printed after the name on the kit line and reads as a second item; put the detail '
          + 'in the name');
      }
    });
    riskLines += String(r.risks || '').split('|').filter(t => t.trim()).length;
    risked++;
  }

  /* ---------- WHICH OF THE TWO SHAPES IT IS § */
  const pt = String(r.practical_type || '').trim();
  if (pt && !PRACTICAL_TYPE.has(pt)) {
    fail.push(id + ' has practical_type "' + pt + '", which is neither of the two written down. '
      + 'Add it to PRACTICAL_TYPE here deliberately, or fix the row.');
  }
  if (!pt && !gone) {
    fail.push(id + ' has no practical_type — say whether it is an experiment (you end up with a '
      + 'reading) or a build (you end up with a thing you keep)');
  }
  if (pt === 'experiment') experiments++;
  if (pt === 'build') builds++;

  /* ---------- THE HAZARD IS A CLOSED LIST, FOR `VOCAB`'S REASON § */
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

  /* ---------- AN AGE IS A NUMBER OR IT IS ABSENT § */
  if (r.age_min !== undefined && r.age_min !== null && r.age_min !== '') {
    const a = Number(r.age_min);
    if (!isFinite(a) || a < 4 || a > 18) {
      fail.push(id + ' has age_min "' + r.age_min + '", which is not an age between 4 and 18');
    } else { ages++; }
  }

  /* ---------- A COST OF NOTHING AND NO COST ARE DIFFERENT ANSWERS § */
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
/* `practicals` RATHER THAN `experiments`, BECAUSE `experiment` IS A VALUE NOW. § */
console.log('\nTHE PRACTICALS  —  ' + rows.length + ' practicals, ' + required + ' AQA required, '
  + (rows.length - required) + ' extra');
console.log('topic links: ' + topicLinks + ' across ' + rows.length + ' practicals ('
  + (rows.length ? (topicLinks / rows.length).toFixed(1) : 0) + ' each), '
  + joined + ' reaching at least one branch of the topic tree');

/* ---------- PRINTED, BECAUSE A NUMBER IS SOMETHING SOMEBODY CAN ACT ON § */
console.log('carrying an age: ' + ages + ' · a hazard level: ' + hazards
  + ' · a cost per run: ' + costed + ' · refused with a reason: ' + excluded);
console.log('risk assessments: ' + risked + ' of ' + (rows.length - excluded) + ' live practicals, '
  + riskLines + ' hazards written out (' + (risked ? (riskLines / risked).toFixed(1) : 0) + ' each)'
  + ' · the ' + excluded + ' refused correctly carry none');

/* ---------- THE GUIDE'S OWN THREE COLUMNS, AND THE DRAWINGS § */
const live = rows.filter(r => !String(r.excluded_reason || '').trim());
const noSci = live.filter(r => !String(r.science || '').trim()).length;
const noVar = live.filter(r => !String(r.variables || '').trim()
                            || !String(r.log || '').trim()).length;
const drawn = live.filter(r => String(r.diagram || '').indexOf('<svg') === 0).length;
console.log('the guide: ' + (live.length - noVar) + ' of ' + live.length
  + ' offer things to change and things to measure, ' + drawn + ' carry an apparatus drawing and '
  + (live.length - drawn) + ' say in a sentence why they do not; '
  + (live.length - noSci) + ' hold a "What is going on" the guide does not draw at present');
if (noSci) note.push(noSci + ' live practical(s) have no "What is going on" paragraph held');
if (noVar) note.push(noVar + ' live practical(s) ask for an independent variable with nothing '
  + 'on the card suggesting one');

/* A DRAWING ON A REFUSED ROW WOULD BE A PICTURE OF AN EXPERIMENT NOBODY IS RUNNING. § */
rows.filter(r => String(r.excluded_reason || '').trim() && String(r.diagram || '').trim())
    .forEach(r => fail.push(r.practical_id + ' is a refused experiment and carries a diagram'));
/* ---------- AND A ROW WITH NO DRAWING SAYS WHY § */
const NO_DRAWING = {
};
live.forEach(r => {
  const has = String(r.diagram || '').trim();
  if (!has && !NO_DRAWING[r.practical_id]) {
    fail.push(r.practical_id + ' has no apparatus drawing and no written reason in NO_DRAWING — '
      + 'either draw it, or say in one sentence what there is about it that no picture determines');
  }
  if (has && NO_DRAWING[r.practical_id]) {
    fail.push(r.practical_id + ' carries a drawing AND an entry in NO_DRAWING saying why it has '
      + 'none; the entry is stale');
  }
});
Object.keys(NO_DRAWING).forEach(id => {
  if (!rows.some(r => r.practical_id === id)) {
    fail.push('NO_DRAWING names ' + id + ', which is not a row in this file');
  }
});

/* AND A DRAWING HAS TO BE A DRAWING. § */
rows.filter(r => String(r.diagram || '').trim()).forEach(r => {
  const d = String(r.diagram);
  if (d.indexOf('<svg viewBox="0 0 340 ') !== 0 || d.slice(-6) !== '</svg>') {
    fail.push(r.practical_id + ' has a diagram that is not an svg laid out inside W = 340');
  }
});

/* ---------- UNIFORM, WHICH IS A THING A CHECK CAN ASK § */
const running_ = rows.filter(r => !String(r.excluded_reason || '').trim());
running_.forEach(r => {
  if (!String(r.age_min || '').trim()) {
    fail.push(r.practical_id + ' has no age_min — every live practical says who is old enough');
  }
  if (!String(r.wow || '').trim()) {
    fail.push(r.practical_id + ' has no wow — the card reads it to say which to open a session with');
  }
});

/* ---------- AND A METHOD THAT NAMES A PLACE ONLY WORKS FOR SOMEBODY STANDING IN IT § */
const LOCAL = ['Wandle', 'Colliers Wood', 'Britannia Point', 'Wandsworth', 'Croydon', 'Merton'];
rows.forEach(r => {
  Object.keys(r).forEach(k => {
    if (typeof r[k] !== 'string') return;
    LOCAL.forEach(w => {
      if (r[k].indexOf(w) >= 0) {
        fail.push(r.practical_id + '.' + k + ' names ' + w
          + ' — a method that names a place only works for somebody standing in it');
      }
    });
  });
});

/* ---------- WHAT EACH COLUMN COVERS, AS A NUMBER § */
/* ---------- THE TWO SHAPES, AND HOW MUCH OF THE KIT CARRIES A QUANTITY § */
const kitItems = rows.reduce((n, r) => n
  + String(r.equipment || '').split('|').filter(t => t.trim()).length, 0);
const kitQty = rows.reduce((n, r) => n
  + String(r.equipment || '').split('|').filter(t => t.indexOf('\u00d7') > 0).length, 0);
console.log('shape: ' + experiments + ' experiment(s), ' + builds + ' build(s), '
  + excluded + ' refused and not asked; kit: ' + kitQty + ' of ' + kitItems
  + ' items carry a quantity');

const COVER = ['age_min', 'wow', 'cost_per_run_gbp', 'setup_cost_gbp', 'science', 'variables',
               'log', 'risks', 'diagram', 'item_ids'];
note.push('per column, of ' + rows.length + ' rows: ' + COVER
  .map(c => c + ' ' + rows.filter(r => String(r[c] || '').trim()).length)
  .join(' · '));

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
