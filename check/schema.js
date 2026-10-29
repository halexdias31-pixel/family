/* @family. — check/schema.js THE LIBRARY'S ONE SCHEMA (R4, R5): each card file's columns and closed vocabularies, and
   `validate(row, file)`. Read by js/check-schema.js, js/check-library.js and every tool that writes a row. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const L = require('./lib-full.js');

/* ---------- THE LEVEL TABLE AND THE SOURCES, OUT OF js/find.js — the app reads them there, so there is one copy ---------- */
let APP = null;
function app() {
  if (APP) return APP;
  const src = fs.readFileSync(path.join(L.ROOT, 'js', 'find.js'), 'utf8');
  const grab = (re, what) => {
    const m = re.exec(src);
    if (!m) throw new Error('js/find.js has no ' + what + ' — check/schema.js reads it from there');
    return m[0];
  };
  const ctx = vm.createContext({});
  vm.runInContext([
    grab(/^const LEVEL_TABLE = \[[\s\S]*?\n\];\n/m, '`const LEVEL_TABLE = [ … ];`'),
    grab(/^function levelsIn_\([\s\S]*?\n}\n/m, '`function levelsIn_(cell) { … }`'),
    grab(/^const LIB_SOURCES = \[[^\]]*\];\n/m, '`const LIB_SOURCES = [ … ];`'),
    'this.__A = { LEVEL_TABLE: LEVEL_TABLE, levelsIn: levelsIn_, LIB_SOURCES: LIB_SOURCES };',
  ].join('\n'), ctx, { filename: 'find.js (extract)' });
  APP = ctx.__A;
  return APP;
}
const LEVEL_TABLE = () => app().LEVEL_TABLE;
const levelsIn = cell => Array.from(app().levelsIn(cell));
const LEVELS = () => LEVEL_TABLE().map(l => l.level);
const levelEntry = name => LEVEL_TABLE().find(l => l.level === name) || null;

/* ---------- THE CLOSED VOCABULARIES ---------- */
const KEY_STAGES = ['KS1', 'KS2', 'KS3', 'KS4', 'KS5'];
const BOARDS = ['AQA', 'Edexcel', 'STA', 'DVSA', 'OCR', 'Eduqas'];
/* A BOARD BY ITS LONG NAME, as `company` spells a board's own paper. */
const BOARD_NAMES = ['Standards & Testing Agency'];
const SOURCES = () => Array.from(app().LIB_SOURCES);
const TIERS = () => [...new Set([].concat(...LEVEL_TABLE().map(l => l.tiers)))];

/* THE QUESTIONS FILE'S CLOSED LISTS (moved here from js/check-library.js; the story of each word is in
   docs/notes/js/check-library.js.md under its old heading). A list column is checked per item. */
function VOCAB() {
  return {
    kind:          ['document', 'preamble', 'question'],
    active:        ['True', 'False'],
    subject:       ['Biology', 'Chemistry', 'Combined Science', 'English Language', 'Greek', 'Maths',
                    'Physics', 'Religious Studies', 'Driving Theory', 'Statistics',
                    /* the boards' own past papers (fix-pastpapers), spelled as data/textbooks.json spells them */
                    'Business', 'Citizenship', 'Computer Science', 'Design and Technology', 'Drama', 'Economics',
                    'English Literature', 'Food Preparation and Nutrition', 'Further Maths', 'Geography', 'History',
                    'Media Studies', 'Physical Education', 'Politics', 'Psychology', 'Sociology'],
    /* `5-a-day` IS A DIFFERENT KIND OF THING FROM A WORKSHEET, in the owner's own words. */
    document_type: ['5-a-day', 'Exercise', 'Past paper', 'Specimen paper', 'Worksheet'],
    key_stage:     KEY_STAGES,
    band_type:     ['grade', 'stage', 'tier', 'year'],
    /* THE TIERS ARE LEVEL_TABLE'S (`Foundation Plus`, `Higher Plus` are Corbettmaths' 5-a-day levels). */
    tier:          TIERS(),
    level:         LEVELS(),
    exam_board:    BOARDS,
    /* WHO MADE IT: a board (by either name) or a worksheet maker, which is a Source and not a board (O3). */
    company:       BOARDS.concat(BOARD_NAMES, SOURCES()),
    exam_wave:     ['First wave', 'Second wave',
                    '2017-06-01', '2018-06-01', '2019-06-01', '2020-06-01',
                    '2021-06-01', '2022-06-01', '2023-06-01', '2024-06-01'],
    /* `order` IS AN ORDERING — items tapped into slots, marked by their order (`orderBox_` in find.js). */
    answer_type:   ['annotate', 'calculation', 'drawing', 'explain', 'order', 'proof', 'short', 'written'],
    /* WHAT A MARK IS MADE ON — squared paper, axes, a blank space, or the passage itself. */
    surface:       ['blank', 'coord', 'grid', 'text'],
    month:         ['5', '6', '11'],
    /* 4 TO 7 ARE REAL PAPER NUMBERS: Edexcel Combined Science, and OCR RS's seventh component (H573/07). */
    paper:         ['1', '2', '3', '4', '5', '6', '7'],
    /* WHAT YOU HAVE TO HAVE IN FRONT OF YOU — one comma-list, not booleans. */
    needs:         ['Calculator', 'No calculator', 'Compass', 'Ruler', 'Protractor', 'Tracing paper',
                    'Periodic table', 'Equation booklet'],
    needs_print:   ['True', 'False'],
    printable:     ['True', 'False'],
    trackable:     ['True', 'False'],
    print_required:['True', 'False'],
    pages_checked: ['True', '2026-08-06'],
    verified:      ['True'],
    currency:      ['GBP'],
    lib_pending:   ['True'],
  };
}
/* A LEVEL IS A LIST OF REAL LEVELS (O1): `KS3, GCSE` is two. check-library reads VOCAB through this per item; validate's own level
   block below asks level itself. */
const LIST_COLS = new Set(['needs', 'key_stage', 'level']);

/* ---------- ONE TABLE OF COLUMN NAMES PER CARD FILE: `cols` every column a row may have, and which column holds each idea ---------- */
const FILES = {
  questions: {
    cols: ['row_id', 'paper_id', 'question', 'kind', 'section', 'active', 'name', 'subject', 'key_stage', 'band_type',
      'band_value', 'tier', 'source_url', 'trackable', 'printable', 'company', 'exam_board', 'exam_wave', 'year', 'level',
      'paper', 'month', 'document_type', 'source_id', 'html', 'part', 'marks', 'answer_type', 'function_verified', 'answer',
      'accept', 'lead', 'figure', 'diagram', 'diagram_twin', 'diagram_twin_wh', 'examiner_note', 'examiner_report', 'guide',
      'needs_print', 'pages', 'pages_checked', 'topics', 'print_required', 'mark_words', 'diagram_by', 'surface',
      'draw_answer', 'verified', 'choices', 'choice_right', 'order_ends', 'uses', 'sort_order', 'needs', 'cells',
      'spec_code', 'lines', 'placeholder', 'currency', 'total_marks', 'lib_pending', 'lib_has', 'description', 'exam_date',
      'images'],
    level: 'level', keystage: 'key_stage', tier: 'tier', board: 'exam_board', company: 'company', topics: 'topics',
    vocab: true,
  },
  textbooks: {
    cols: ['book_id', 'chapter', 'title', 'summary', 'subject', 'level', 'keystage', 'board', 'spec', 'tier', 'topics',
      'active', 'words', 'points', 'formulas', 'anim', 'about', 'html', 'css', 'lib_pending', 'lib_has'],
    level: 'level', keystage: 'keystage', tier: 'tier', board: 'board', topics: 'topics',
  },
  practicals: {
    cols: ['practical_id', 'name', 'subject', 'level', 'exam_board', 'spec_ref', 'compliance', 'venue', 'feasible',
      'group_size', 'minutes', 'item_ids', 'active', 'sort_order', 'topics', 'age_min', 'wow', 'practical_type', 'aim',
      'outcome', 'safety', 'maths_link', 'equipment', 'steps', 'notes', 'science', 'log', 'variables', 'diagram', 'risks',
      'hazard', 'cost_per_run_gbp', 'setup_cost_gbp', 'excluded_reason', 'reconsider_at_age', 'lib_pending', 'lib_has'],
    level: 'level', board: 'exam_board', topics: 'topics',
  },
  projects: {
    cols: ['project_id', 'name', 'summary', 'subject', 'level', 'age_min', 'age_max', 'sessions', 'makes', 'topics',
      'active', 'sort_order', 'materials', 'steps', 'safety', 'share', 'project_type', 'exam_board', 'spec_ref',
      'lib_pending', 'lib_has'],
    level: 'level', board: 'exam_board', topics: 'topics',
  },
  inserts: {
    cols: ['insert_id', 'name', 'summary', 'subject', 'level', 'keystage', 'board', 'tier', 'for_subjects', 'for_levels',
      'for_tiers', 'verified', 'verified_note', 'official', 'sections', 'table', 'active', 'elements', 'for_papers',
      'sources', 'line_numbers', 'lib_pending', 'lib_has', 'source_text'],
    level: 'level', keystage: 'keystage', tier: 'tier', board: 'board', forLevels: 'for_levels', forTiers: 'for_tiers',
  },
};

/* ---------- THE TOPICS' OWN SPELLINGS: every label and alias in data/topics.json, exactly ---------- */
let TOPICS = null;
function topicWords() {
  if (TOPICS) return TOPICS;
  TOPICS = new Set();
  JSON.parse(fs.readFileSync(path.join(L.ROOT, 'data', 'topics.json'), 'utf8')).forEach(t => {
    if (!t) return;
    if (t.label) TOPICS.add(String(t.label).trim());
    String(t.aliases || '').split(',').map(s => s.trim()).filter(Boolean).forEach(a => TOPICS.add(a));
  });
  return TOPICS;
}

const S = v => (v === undefined || v === null ? '' : String(v)).trim();
const atoms = v => (Array.isArray(v) ? v.map(S) : S(v).split(',').map(s => s.trim())).filter(Boolean);

/* AN ANSWER THE MATHS KEYPAD CAN TYPE: its head (the bold words, or up to the dash), or an accepted way, holds a digit or
   is algebra (an operator, `)(`, `b − a`). A word or a letter (`random`, `F`) is not. */
function mathsy(answer) {
  const h = S(answer);
  const b = /^\s*<b>([\s\S]*?)<\/b>/i.exec(h);
  const head = (b ? b[1] : h.split(/&mdash;|—/)[0]).replace(/<[^>]+>/g, ' ').replace(/&minus;/g, '−')
    .replace(/&times;/g, '×').replace(/&divide;/g, '÷').replace(/&pi;/g, 'π').replace(/&[a-z]+;|&#\d+;/gi, ' ');
  return /\d/.test(head) || /[=+−×÷^√π/]|\)\s*\(|\b[a-zA-Z]\s*[−-]\s*[a-zA-Z]\b/.test(head);
}

/* A NOTE SAYING A PART'S MARKS ARE FOR THE PARTS BEFORE IT TOO, in the library's two shapes: "The question's N mark is
   for …", "The paper gives (its) N marks for the whole / all / both / … together". */
const SHARED = /\bthe question(?:'|’|&rsquo;)s \d+ marks? (?:is|are) for\b|\bthe paper (?:gives|prints) (?:its )?\d+ marks? for (?:the whole\b|all\b|both\b|[^.]*?\btogether\b|[^.]*?\bdoes not divide them\b)/i;
/* WORDS THAT ASK FOR SOMETHING TO BE FILLED IN: a table, Venn or tree completed, boxes filled, a figure labelled, a
   matching. Not one missing number (the answer box), a label on one's own drawing, a Punnett square (cells fold case). */
const FILL_IN = [
  /\b(?:complete|fill in)(?: in)? (?:the |this )?(?:[\w-]+ ){0,3}?(?:table|grid|venn diagram|tree diagram|frequency tree|distance chart|tally chart)\b/i,
  /\b(?:fill in|write(?: in)?) the missing (?:[\w-]+ )?(?:numbers|digits|words|values)\b|\bfill in the (?:blanks|gaps|boxes)\b/i,
  /\b(?:write|put)\b[^.?]{0,40}?\bin (?:each (?:empty |blank )?box|the (?:empty |blank )?boxes)\b|\bgo in the boxes\b/i,
  /\bwhat (?:number|digit|word|letter)s? goes? in (?:box|cell|region)\b/i,
  /\blabel (?:the|each) (?:parts?|structures?|blanks?|boxes|organs?)\b|\blabel (?:the )?(?:diagram|figure)\b/i,
  /\bmatch each\b|\bdraw (?:a |one )?lines? (?:from|to) each\b|\bjoin each\b/i,
];
/* PARTS THE CELLS RULE LEAVES, one written reason each: cells mark each box alone, so an open pair stays one box per value. */
const CELLS_EXEMPT = {
  'Q-CBM-square-numbers-16': 'an open pair (81 and 9, or 36 and 54): one box per value, marked as a pair',
  'Q-CBM-5AD-F-0606-1': 'an open pair in either order (5 and -5): one box per value, marked as a pair',
  'Q-CBM-5AD-F-0606-1b': 'an open pair in either order (4 and -1): one box per value, marked as a pair',
  'Q-STA-KS2-2024-P3-11': 'its digits could not be recovered from the transcription (examiner note), so there is no answer to make cells from',
};
function fillIn(html) {
  const t = S(html).replace(/<svg[\s\S]*?<\/svg>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&[a-z]+;|&#\d+;/gi, ' ').replace(/\s+/g, ' ');
  for (const re of FILL_IN) { const m = re.exec(t); if (m) return m[0]; }
  return '';
}

/* THE LEVELS A ROW IS TAUGHT AT, read as `levelsOf_` reads an item: a stage band wins over the level cell. */
function rowLevels(row, file) {
  const f = FILES[file];
  if (!f || !f.level) return [];
  const band = file === 'questions' && S(row.band_type) === 'stage' ? S(row.band_value) : '';
  return levelsIn(band || row[f.level]);
}

/* ---------- validate(row, file): THIS ROW'S OWN PROBLEMS, each { rule, col, msg } ---------- */
function validate(row, file) {
  const f = FILES[file];
  if (!f) throw new Error('check/schema.js knows no card file `' + file + '` — one of ' + Object.keys(FILES).join(', '));
  const out = [];
  const bad = (rule, col, msg) => out.push({ rule: rule, col: col, msg: msg });
  if (!row || typeof row !== 'object' || Array.isArray(row)) { bad('shape', '', 'is not an object'); return out; }

  /* EVERY COLUMN IS ONE THE FILE HAS: a typo is a new column nothing reads. */
  Object.keys(row).forEach(k => { if (f.cols.indexOf(k) === -1) bad('column', k, 'column `' + k + '` is not a column of ' + file); });

  /* THE QUESTIONS FILE'S CLOSED LISTS. Level, tier and board are asked below, in every file alike. */
  if (f.vocab) {
    const V = VOCAB();
    Object.keys(V).forEach(col => {
      if (col === 'level' || col === 'tier' || col === 'exam_board' || col === 'key_stage' || !(col in row)) return;
      const parts = LIST_COLS.has(col) ? atoms(row[col]) : [S(row[col])];
      parts.forEach(v => { if (V[col].indexOf(v) === -1) bad('vocab', col, col + ' ' + JSON.stringify(v) + ' is not in its closed list'); });
    });
  }

  /* LEVEL: a list of real levels, spelled as LEVEL_TABLE spells them — never a range, never another spelling (O1). */
  const LV = LEVELS();
  [[f.level, 'level'], [f.forLevels, 'for_levels']].forEach(([col]) => {
    if (!col || !S(row[col])) return;
    atoms(row[col]).forEach(a => {
      if (LV.indexOf(a) !== -1) return;
      const as = levelsIn(a);
      const known = as.every(l => LV.indexOf(l) !== -1);
      bad('level', col, col + ' ' + JSON.stringify(a) + (known
        ? (as.length > 1 ? ' is a range — store the list ' + JSON.stringify(as.join(', ')) : ' is spelled ' + JSON.stringify(as[0]))
        : ' is not a level (' + LV.join(', ') + ')'));
    });
  });
  if (file === 'questions' && S(row.band_type) === 'stage' && S(row.band_value)) {
    const b = levelsIn(row.band_value);
    if (!b.every(l => LV.indexOf(l) !== -1)) bad('level', 'band_value', 'band_value ' + JSON.stringify(S(row.band_value)) + ' is a stage band and not a level');
  }

  /* KEY STAGE, TIER AND BOARD: closed lists in every file. */
  const TI = TIERS();
  if (f.keystage) atoms(row[f.keystage]).forEach(k => { if (KEY_STAGES.indexOf(k) === -1) bad('vocab', f.keystage, f.keystage + ' ' + JSON.stringify(k) + ' is not a key stage'); });
  [f.tier, f.forTiers].forEach(col => {
    if (col) atoms(row[col]).forEach(t => { if (TI.indexOf(t) === -1) bad('tier', col, col + ' ' + JSON.stringify(t) + ' is not a tier (' + TI.join(', ') + ')'); });
  });
  if (f.board) atoms(row[f.board]).forEach(b => { if (BOARDS.indexOf(b) === -1) bad('vocab', f.board, f.board + ' ' + JSON.stringify(b) + ' is not an exam board'); });

  /* LEVEL, KEY STAGE AND TIER AGREE: each key stage and tier is one LEVEL_TABLE gives one of the row's levels. */
  const lv = rowLevels(row, file).map(levelEntry);
  if (lv.length && lv.every(Boolean)) {
    const stages = [].concat(...lv.map(l => l.stages)), tiers = [].concat(...lv.map(l => l.tiers));
    const names = lv.map(l => l.level).join(', ');
    if (f.keystage) atoms(row[f.keystage]).forEach(k => { if (KEY_STAGES.indexOf(k) !== -1 && stages.indexOf(k) === -1) bad('agree', f.keystage, 'key stage ' + k + ' is not one of ' + names + "'s (" + (stages.join(', ') || 'none') + ')'); });
    if (f.tier) atoms(row[f.tier]).forEach(t => { if (TI.indexOf(t) !== -1 && tiers.indexOf(t) === -1) bad('agree', f.tier, 'tier ' + t + ' is not one of ' + names + "'s (" + (tiers.join(', ') || 'none') + ')'); });
    if (file === 'questions' && S(row.band_type) === 'stage' && S(row.band_value) && S(row.level)) {
      const a = levelsIn(row.band_value).join(', '), b = levelsIn(row.level).join(', ');
      if (a !== b) bad('agree', 'level', 'the stage band says ' + a + ' and the level cell ' + b);
    }
  }

  /* A WORKSHEET MAKER IS A SOURCE, NOT A BOARD (O3): its sheet names no exam board. */
  if (f.company && SOURCES().indexOf(S(row[f.company])) !== -1 && S(row[f.board])) {
    bad('source', f.board, S(row[f.company]) + ' is a Source, so its sheet carries no ' + f.board + ' (' + S(row[f.board]) + ')');
  }

  /* A BOARD'S OWN PAPER (past or specimen) NAMES THE BOARD TWICE: its maker (`company`) is the board it is set by. */
  if (f.company && /^(Past|Specimen) paper$/.test(S(row.document_type))) {
    const co = S(row[f.company]), bo = S(row[f.board]);
    if (bo && !co) bad('board', f.company, 'a ' + S(row.document_type).toLowerCase() + ' of ' + bo + ' names no company');
    else if (BOARDS.indexOf(co) !== -1 && co !== bo) bad('board', f.board, 'a ' + S(row.document_type).toLowerCase() + ' made by ' + co + ' is set by ' + (bo || 'no board'));
  }

  /* TOPICS: each spelled exactly as data/topics.json spells a label or an alias. */
  if (f.topics) atoms(row[f.topics]).forEach(t => { if (!topicWords().has(t)) bad('topic', f.topics, 'topic ' + JSON.stringify(t) + ' is not a label or alias in data/topics.json'); });

  if (file === 'questions') {
    const kind = S(row.kind), live = S(row.active) !== 'False';
    /* MARKS: a whole number wherever given; a live past-paper part with none is asked in validateFile (a run may share them). */
    if (S(row.marks) && !/^\d+$/.test(S(row.marks))) bad('marks', 'marks', 'marks ' + JSON.stringify(S(row.marks)) + ' is not a whole number');
    if (S(row.total_marks) && !/^\d+$/.test(S(row.total_marks))) bad('marks', 'total_marks', 'total_marks ' + JSON.stringify(S(row.total_marks)) + ' is not a whole number');
    /* THE ANSWER'S SHAPE IS ITS TYPE'S: a calculation's answer has a number in it; an ordering has its options and its order. */
    if (kind === 'question' && S(row.answer_type) === 'calculation' && S(row.answer) && !mathsy(row.answer) && !(S(row.accept) && mathsy(row.accept))) bad('answer', 'answer', "a calculation whose answer is neither a number nor algebra — it gets a number keypad");
    if (kind === 'question' && S(row.answer_type) === 'order' && S(row.html) && !(S(row.choices) && S(row.choice_right))) bad('answer', 'choices', 'an ordering with no choices or no choice_right');
    /* A PART THAT ASKS TO FILL SOMETHING IN IS ANSWERED IN CELLS (the owner's fill-in standard): never on the diagram. */
    if (kind === 'question' && live && !S(row.cells) && !CELLS_EXEMPT[S(row.row_id)]) {
      const ask = fillIn(row.html);
      if (ask) bad('cells', 'cells', 'its words ask to ' + JSON.stringify(ask) + ' and it has no cells — a table of cells, laid out as the paper\'s');
    }
  }

  /* No lib_pending rule: the marker stays on once the words arrive (docs/library.md), so its presence says nothing. */
  return out;
}

/* ---------- THE FILE'S CROSS-ROW RULES, AND EVERY ROW'S OWN: [{ id, rule, col, msg }] ---------- */
function validateFile(rows, file) {
  const def = L.defs().files[file];
  const idOf = r => (def ? L.idOf(def, r) : '') || '(no id)';
  const out = [];
  (rows || []).forEach(r => validate(r, file).forEach(p => out.push(Object.assign({ id: idOf(r) }, p))));
  if (file !== 'questions') return out;
  const qs = (rows || []).filter(r => r && S(r.kind) === 'question');
  const byPaper = new Map(), byQ = new Set();
  qs.forEach(r => {
    const pid = S(r.paper_id);
    if (!byPaper.has(pid)) byPaper.set(pid, []);
    byPaper.get(pid).push(r);
    byQ.add(pid + '|' + S(r.question));
  });
  /* THE NEXT PART OF THE SAME QUESTION, IN FILE ORDER, THAT CARRIES MARKS — the one a run of unmarked parts shares. */
  const order = new Map(qs.map((q, i) => [q, i]));
  const laterMarked = q => byPaper.get(S(q.paper_id)).find(o => S(o.question) === S(q.question) && order.get(o) > order.get(q) && S(o.marks)) || null;
  (rows || []).forEach(r => {
    if (!r) return;
    const pid = S(r.paper_id);
    /* A PREAMBLE STANDS OVER A QUESTION: its paper (and its question, when it names one) has a question row. */
    if (S(r.kind) === 'preamble' && !(S(r.question) ? byQ.has(pid + '|' + S(r.question)) : byPaper.has(pid))) {
      out.push({ id: idOf(r), rule: 'preamble', col: 'question', msg: 'a preamble with no question under it' });
    }
    /* A LIVE PAST-PAPER PART HAS MARKS, or a later part of its question carries the run's marks and its examiner note
       says so (the note is private, so a pending row without its words is not counted). */
    if (S(r.kind) === 'question' && S(r.active) !== 'False' && S(r.document_type) === 'Past paper' && !S(r.marks)) {
      const later = laterMarked(r);
      if (!later) out.push({ id: idOf(r), rule: 'marks', col: 'marks', msg: 'a past-paper question with no marks' });
      else if (!SHARED.test(S(later.examiner_note))) out.push({ id: idOf(r), rule: 'marks', col: 'examiner_note', msg: 'no marks, and ' + idOf(later) + ' after it has marks but no examiner note saying they are for the parts together' });
    }
    /* TOTAL_MARKS COVERS WHAT IS COUNTED: never under its parts' sum, equal once each part has or shares marks. A
       switched-off part counts (it is on the paper); a cover with no question is hidden (O6), not asked. */
    if (S(r.kind) === 'document' && /^\d+$/.test(S(r.total_marks)) && byPaper.has(pid)) {
      const mine = byPaper.get(pid);
      const sum = mine.reduce((n, q) => n + (Number(S(q.marks)) || 0), 0), total = Number(S(r.total_marks));
      const whole = mine.every(q => /^\d+$/.test(S(q.marks)) || laterMarked(q));
      if (sum > total || (whole && mine.length && sum !== total)) {
        out.push({ id: idOf(r), rule: 'total', col: 'total_marks', msg: 'total_marks ' + total + ' and its questions count ' + sum });
      }
    }
  });
  return out;
}

/* ---------- THE GATE (R5): the problems these rows have that the same rows did not have before; a tool refuses on any ---------- */
const keyOf = p => p.id + '\u0000' + p.rule + '\u0000' + p.msg;
function newProblems(file, rows, before) {
  const had = new Set(validateFile(before || [], file).map(keyOf));
  return validateFile(rows, file).filter(p => !had.has(keyOf(p)));
}
function refuse(file, rows, before, who) {
  const fresh = newProblems(file, rows, before);
  if (!fresh.length) return;
  throw new Error((who || file) + ': refused, nothing written — ' + fresh.length + ' row problem(s) the schema (check/schema.js) does not allow:\n'
    + fresh.slice(0, 12).map(p => '  ' + p.id + ': ' + p.msg).join('\n') + (fresh.length > 12 ? '\n  …' : ''));
}

/* THE FILE AS COMMITTED (HEAD), with this machine's words put back — what a tool's rows are compared with. [] if git has none. */
function committed(file, map) {
  const def = L.defs().files[file];
  let rows;
  try {
    rows = JSON.parse(cp.execFileSync('git', ['show', 'HEAD:' + def.file], { cwd: L.ROOT, maxBuffer: 512 * 1024 * 1024, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch (e) { return []; }
  const words = map || L.readPrivate(file) || {};
  return rows.map(r => {
    if (!r || !Object.prototype.hasOwnProperty.call(r, 'lib_has')) return r;
    const w = Object.assign({}, r, words[L.idOf(def, r)] || {});
    delete w.lib_has;
    return w;
  });
}

module.exports = { fillIn, FILL_IN, SHARED, CELLS_EXEMPT, FILES, VOCAB, LIST_COLS, KEY_STAGES, BOARDS, BOARD_NAMES, SOURCES, TIERS, LEVELS, LEVEL_TABLE,
                   levelsIn, rowLevels, validate, validateFile, newProblems, refuse, committed, topicWords };
