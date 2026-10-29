require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* check-library.js — THE ONE DATA FILE IN THIS REPOSITORY, GUARDED § */

const fs = require('fs');
const path = require('path');

/* A path may be passed in — `node js/check-library.js /tmp/mutated.json` — which is only ever used to
   prove this file can still fail. A check nobody has watched fail is a check nobody should trust. */
const FILE = process.argv[2] || path.join(__dirname, '..', 'data', 'questions.json');

/* ---------- THE CLOSED VOCABULARY § */
const VOCAB = {
  kind:          ['document', 'preamble', 'question'],
  active:        ['True', 'False'],
  subject:       ['Biology', 'Chemistry', 'Combined Science', 'English Language', 'Greek', 'Maths',
                  'Physics', 'Religious Studies', 'Driving Theory', 'Statistics'],
  /* `5-a-day` IS A DIFFERENT KIND OF THING FROM A WORKSHEET and the owner's own words are the reason it is a value rather than a naming convention: § */
  document_type: ['5-a-day', 'Exercise', 'Past paper', 'Specimen paper', 'Worksheet'],
  /* THE ATOMS ONLY — `KS1, KS2` and `KS3, KS4` were here as whole-cell spellings and are gone;
     see LIST_COLS below for why a list column is checked per item. */
  key_stage:     ['KS1', 'KS2', 'KS3', 'KS4', 'KS5'],
  band_type:     ['grade', 'stage', 'tier', 'year'],
  /* `Foundation Plus` AND `Higher Plus` ARE CORBETTMATHS' OWN LEVELS, printed on the front of every 5-a-day, and they are not exam tiers — Edexcel and AQA have two. § */
  tier:          ['A-Level', 'AS', 'Foundation', 'Foundation Plus', 'Higher', 'Higher Plus'],
  level:         ['AS', 'Alevel', 'GCSE', 'Theory test'],
  exam_board:    ['AQA', 'Edexcel', 'STA', 'DVSA'],
  exam_wave:     ['First wave', 'Second wave',
                  '2017-06-01', '2018-06-01', '2019-06-01', '2020-06-01',
                  '2021-06-01', '2022-06-01', '2023-06-01', '2024-06-01'],
  /* `order` IS AN ORDERING -- items tapped into slots, marked by their order (see the rule for it below
     and `orderBox_` in find.js). A value of its own because it draws a different box. */
  answer_type:   ['annotate', 'calculation', 'drawing', 'explain', 'order', 'proof', 'short', 'written'],
  /* WHAT A MARK IS MADE ON -- squared paper, axes, a blank space, or the passage itself. § */
  surface:       ['blank', 'coord', 'grid', 'text'],
  month:         ['5', '6', '11'],
  /* 4, 5 AND 6 ARE REAL PAPER NUMBERS and it took Edexcel Combined Science to prove it. § */
  paper:         ['1', '2', '3', '4', '5', '6'],
  /* WHAT YOU HAVE TO HAVE IN FRONT OF YOU — one comma-list, not three booleans. § */
  /* `Periodic table` IS THE SCIENCES' VERSION OF THE SAME FACT and arrived with the first AQA chemistry paper: § */
  /* `Equation booklet` IS THE PHYSICS ONE, and AQA encloses it with the paper: § */
  needs:         ['Calculator', 'No calculator', 'Compass', 'Ruler', 'Protractor', 'Tracing paper',
                  'Periodic table', 'Equation booklet'],
  needs_print:   ['True', 'False'],
  printable:     ['True', 'False'],
  trackable:     ['True', 'False'],
  print_required:['True', 'False'],
  pages_checked: ['True', '2026-08-06'],
  verified:      ['True'],
  currency:      ['GBP'],
};

/* Columns that must never come back. See the header. */
const FORBIDDEN = /^ticks?(_\d+)?$/i;

const fail = [];
const note = [];

/* ---------- THE SHAPE, READ AS TEXT § */
/* THE FILE WITH ITS WORDS PUT BACK (397, check/lib-full.js) unless a path was passed in — the repository's copy is card metadata. */
const FILE_TEXT = process.argv[2] ? fs.readFileSync(FILE, 'utf8') : require('../check/lib-full.js').text('questions');
/* A PENDING CARD WHOSE WORDS THIS MACHINE HAS NOT GOT (docs/library.md): its figure and choices are in the words, not here. */
const wordless = r => require('../check/lib-full.js').pending(r) && !String(r.html || '').trim();
const raw = FILE_TEXT.replace(/\n$/, '').split('\n');

if (raw[0] !== '[') fail.push(`line 1 is ${JSON.stringify(raw[0].slice(0, 40))}, not a bare [`);
if (raw[raw.length - 1] !== ']') fail.push('the last line is not a bare ]');

/* EACH LINE IS PARSED ON ITS OWN, not merely checked for the right last character. § */
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
  rows = JSON.parse(FILE_TEXT);
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

/* ---------- 80 MARKS § */
const paperFacts = new Map();
rows.forEach(r => {
  if (r && r.kind === 'document' && r.paper_id) paperFacts.set(r.paper_id, r);
});
/* ---------- AND THE PAPER SAYS WHAT IT IS OUT OF § */
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
/* ---------- A LIST COLUMN IS CHECKED PER ITEM, NOT PER CELL § */
const LIST_COLS = new Set(['needs', 'key_stage']);
/* ---------- A VOCABULARY WRITTEN BEFORE ITS COLUMN, ON PURPOSE § */
const VOCAB_AHEAD = new Set([]);

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
  /* ---------- A VOCABULARY FOR A COLUMN NOTHING HAS IS A VOCABULARY NOTHING ENFORCES § */
  if (!seen && VOCAB_AHEAD.has(col)) {
    console.log(`\`${col}\` has its closed list ahead of its data: on no row yet (VOCAB_AHEAD).`);
  } else if (VOCAB_AHEAD.has(col)) {
    console.log(`\`${col}\` is on ${seen} row${seen > 1 ? 's' : ''} now and enforced like any column — take it off VOCAB_AHEAD.`);
  } else if (!seen) {
    fail.push(`VOCAB has a closed list for \`${col}\` and not one row has that column. It has been `
      + `renamed out from under this list, or it never existed — either way the vocabulary for it `
      + `is being enforced on nothing.`);
  }
  bad.forEach((n, v) => strays.push({ col, v, n }));
});
strays.forEach(s => fail.push(
  `${s.col} = ${JSON.stringify(s.v)} on ${s.n} row${s.n > 1 ? 's' : ''} — not in the vocabulary. ` +
  `Read what the column already uses before adding it to VOCAB in this file.`));

/* ---------- `AND` AND `&` ARE TWO BUTTONS FOR ONE TOPIC § */
const AMP = new Map();
rows.forEach(r => {
  if (!r || !r.topics) return;
  String(r.topics).split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
    /* CASE IS DELIBERATELY NOT FOLDED HERE. § */
    /* `&amp;` IS A THIRD SPELLING AND IT GOT PAST THIS RULE ONCE. § */
    const k = t.replace(/&amp;/g, '&').replace(/\s*&\s*/g, ' and ').replace(/\s+/g, ' ');
    if (!AMP.has(k)) AMP.set(k, new Map());
    const m = AMP.get(k);
    m.set(t, (m.get(t) || 0) + 1);
  });
});
AMP.forEach(m => {
  if (m.size < 2) return;
  const shown = [...m.entries()].map(([t, n]) => `${JSON.stringify(t)} (${n})`).join(' and ');
  fail.push(`one topic, two spellings: ${shown}. \`spellKey_\` folds case and punctuation but not `
    + `the word \`and\` against \`&\`, so these are two answers in the funnel for one thing. `
    + `Pick the spelling data/topics.json uses.`);
});

/* ---------- THE SAME PAPER, TRANSCRIBED TWICE § */
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
  sittings.get(key).push({ id: r.paper_id, spec: String(r.spec_code || '').trim() });
});
const twice = [];
sittings.forEach((papers, key) => {
  if (papers.length < 2) return;
  /* EVERY ONE CODED, AND ALL THE CODES DIFFERENT. Either half missing and it is a duplicate: a
     blank code cannot distinguish anything, and two papers printing one code are one paper. */
  const codes = papers.map(p => p.spec);
  if (codes.every(Boolean) && new Set(codes).size === codes.length) return;
  const ids = papers.map(p => p.id);
  twice.push(`${key} is transcribed ${ids.length} times: ${ids.join(', ')}. One sitting, one paper ` +
             `— delete the newer copy, or, if these really are different papers the qualification ` +
             `numbers alike, give each its own \`spec_code\` off its own cover.`);
});
twice.forEach(t => fail.push(t));

/* ---------- THE SAME DOCUMENT, TRANSCRIBED TWICE — AND THIS IS THE STRONGER TEST § */
const driveId = u => {
  const m = String(u || '').match(/[-\w]{25,}/);
  return m ? m[0] : String(u || '');
};
const partsPer = {};
const docType = {};
rows.forEach(r => { if (r && r.kind === 'document') docType[r.paper_id] = String(r.document_type || ''); });
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
  /* A 5-A-DAY BOOK IS ONE FILE HOLDING A MONTH OF DOCUMENTS. § */
  if (withParts.every(id => docType[id] === '5-a-day')) return;
  fail.push(`one document is transcribed ${withParts.length} times — `
    + withParts.map(id => `${id} (${partsPer[id]} parts)`).join(', ')
    + `. They share the file ${k}, so they are one PDF read twice: keep the fuller transcription `
    + `and delete the other, or the library teaches the same question under two names.`);
});

/* ---------- A PREAMBLE THAT NOTHING SITS UNDER § */
/* ---------- SEVERAL PREAMBLES IN ONE SCOPE, AND NO ORDER BETWEEN THEM § */
/* A LETTER'S OPENING IS ITS OWN SCOPE -- "(d)" of a question, see `stemLetter_` in find.js -- so a
   question's own opening and its (d) opening are not two rows in one scope demanding a sort_order. */
const preLetter_ = r => { const p = String(r.part || '').trim().toLowerCase().replace(/[()\s]/g, ''); return /^[a-z]$/.test(p) ? p : ''; };
const scopeOf_ = r => r.paper_id + '|' + (String(r.question || '').trim() ? 'q' + r.question + (preLetter_(r) ? '(' + preLetter_(r) + ')' : '')
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
  /* ---------- A PAPER WITH NO QUESTIONS AT ALL IS ONE BEING BUILT § */
  /* ---------- A PREAMBLE'S `part` IS ONE LETTER, OR NOTHING § */
  if (String(r.part || '').trim()) {
    const L = preLetter_(r);
    if (!L || !String(r.question || '').trim()) {
      fail.push(`${r.row_id} is a preamble with part "${r.part}". An opening's part is one letter, the `
        + `letter whose parts it opens ("d" for d(i) and d(ii)), on a row that names its question.`);
      return;
    }
    if (!paperKeys.has(r.paper_id)) return;
    const mine = rows.some(q => q && q.kind === 'question' && q.paper_id === r.paper_id
      && String(q.question) === String(r.question)
      && String(q.part || '').trim().toLowerCase().replace(/[()\s]/g, '').charAt(0) === L
      && !/^(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/.test(String(q.part || '').trim().toLowerCase()));
    if (!mine) fail.push(`${r.row_id} opens part (${L}) of ${r.paper_id} Q${r.question}, and that question has `
      + `no part (${L}) -- the opening is in the file and on no screen.`);
    return;
  }
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

/* ---------- THE DATE A PAPER WAS SAT, AND THE TWO WAYS IT CAN LIE § */
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
  /* ---------- AND A THIRD, WHICH IS THE ONLY ONE THAT CATCHES THE WRONG DATE § */
  const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (real.getUTCDay() === 0 || real.getUTCDay() === 6) {
    fail.push(`${r.row_id} has exam_date ${r.exam_date}, which is a ${DAY[real.getUTCDay()]}. `
      + `Boards do not sit papers at the weekend, so this is a publication date or a typo — `
      + `see the note above: eight of the 41 dates in source_url filenames are Saturdays.`);
  }
});

const datedPapers = new Set(rows.filter(r => r && r.exam_date && r.paper_id).map(r => r.paper_id));

/* ---------- AN ADDRESS THAT IS NOT AN ADDRESS § */
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

/* ---------- A PICTURE THIS SITE DREW MUST SAY SO § */
const DIAGRAM_BY = ['family', 'family-set'];
rows.forEach(r => {
  if (!r || !r.diagram_by) return;
  if (!DIAGRAM_BY.includes(r.diagram_by)) {
    fail.push(`${r.row_id} says diagram_by: ${JSON.stringify(r.diagram_by)}. The only value that `
      + `means anything is ${DIAGRAM_BY.map(v => JSON.stringify(v)).join(', ')} — absent means the `
      + `picture came off the paper. Add it to DIAGRAM_BY with a reason, or fix the row.`);
  }
  if (!r.diagram && !wordless(r)) {
    fail.push(`${r.row_id} credits a diagram it does not have. Draw it or drop the credit.`);
  }
});
const drawnHere = rows.filter(r => r && /^family/.test(String(r.diagram_by || ''))).length;
const chosenHere = rows.filter(r => r && r.diagram_by === 'family-set').length;

/* ---------- WHERE A ROW'S FIGURE STANDS: `<!--fig-->` § */
const FIG_MARK = /<!--\s*fig\s*-->/gi;
const FIG_BLOCK = /^(p|div|table|thead|tbody|tfoot|tr|td|th|ul|ol|li|dl|dt|dd|h[1-6]|blockquote|figure|pre|section|span|b|i|em|strong|sup|sub)$/i;
const FIG_VOID = /^(br|img|hr|input|meta|link|col|wbr|source|area|base|param|track|embed)$/i;
let marked = 0;
rows.forEach(r => {
  if (!r || !r.row_id) return;
  Object.keys(r).forEach(k => {
    if (k === 'html' || typeof r[k] !== 'string') return;
    if (FIG_MARK.test(r[k])) fail.push(`${r.row_id} carries <!--fig--> in \`${k}\`. The marker belongs in \`html\` only.`);
    FIG_MARK.lastIndex = 0;
  });
  const h = String(r.html || '');
  const hits = h.match(FIG_MARK) || [];
  if (!hits.length) return;
  marked++;
  if (hits.length > 1) fail.push(`${r.row_id} carries ${hits.length} <!--fig--> markers. A row has one figure, so one marker.`);
  const pen = /^(drawing|annotate)$/i.test(String(r.answer_type || '').trim());
  if (!r.diagram && !String(r.images || '').trim() && !pen) {
    fail.push(`${r.row_id} marks where its figure stands and has no figure (no diagram, no images, not a `
      + `drawing question). Draw the figure or take the marker out.`);
  }
  const at = h.search(FIG_MARK);
  const T = /<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;
  let m, depth = 0;
  while ((m = T.exec(h)) && m.index < at) {
    if (FIG_VOID.test(m[2]) || m[3] || !FIG_BLOCK.test(m[2])) continue;
    depth = m[1] ? Math.max(0, depth - 1) : depth + 1;
  }
  if (depth) fail.push(`${r.row_id} puts <!--fig--> inside a block. It goes BETWEEN two top-level blocks — `
    + `the app stands it after the block it is in, which is not where the row says.`);
});

/* ---------- WHAT IS STILL STANDING IN FOR SOMETHING § */
const standingIn = rows.filter(r => r && String(r.placeholder) === 'True');

/* ---------- WHAT THE TRANSCRIBER COULD NOT RECOVER § */
const flagged = rows.filter(r => r && r.examiner_note);

/* THE OTHER THREE LIBRARY FILES, WHICH ARE MID-MIGRATION. § */
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

/* ---------- A BOXER'S PHOTO CARRIES ITS CREDIT, AND HIS RECORD ADDS UP § */
{
  let boxers = [];
  try { boxers = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'boxers.json'), 'utf8')); }
  catch (e) { fail.push('data/boxers.json could not be read for the photo and record rules — NOT checked'); }
  const n = v => (String(v == null ? '' : v).trim() === '' ? null : Number(v));
  let pics = 0;
  const todo = [];
  (Array.isArray(boxers) ? boxers : []).forEach(b => {
    if (!b || typeof b !== 'object') return;
    const who = (b.boxer_id || '?') + ' ' + (b.name || '');
    const img = String(b.image || '').trim(), credit = String(b.image_credit || '').trim();
    if (img) {
      pics++;
      if (!credit) fail.push('data/boxers.json ' + who + ' has an image and no image_credit — a Commons photo may only be shown with its author and licence');
      if (!/^https:\/\//i.test(img)) fail.push('data/boxers.json ' + who + ' image is not an https address: ' + img.slice(0, 60));
    } else if (credit) {
      note.push('data/boxers.json ' + who + ' has an image_credit and no image');
    }
    [['wins_ko', 'wins'], ['losses_ko', 'losses']].forEach(([part, whole]) => {
      const p = n(b[part]), w = n(b[whole]);
      if (p != null && (!isFinite(p) || p < 0)) fail.push('data/boxers.json ' + who + ' ' + part + ' is not a count: ' + b[part]);
      else if (p != null && w != null && p > w) fail.push('data/boxers.json ' + who + ' has ' + p + ' ' + part + ' in ' + w + ' ' + whole);
    });
    /* ---------- A CC LICENCE NEEDS ITS LINK, AND ONLY A COMMONS FILE HAS ONE TO GIVE § */
    if (img && /\bCC[ -]?(BY|0)\b|creative commons/i.test(credit)
        && !/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/[^/?#]+/i.test(img)) {
      fail.push('data/boxers.json ' + who + ' is credited under a CC licence and its image is not a Commons file address, so the card cannot link the credit to the licence: ' + img.slice(0, 70));
    }
    /* ---------- THE EDITOR'S TO-DO, LISTED § */
    if (/\bcheck(ing)?\b/i.test(String(b.notes || ''))) todo.push(who + ' — ' + String(b.notes).trim());
  });
  console.log('boxers with a photo: ' + pics + ' of ' + (Array.isArray(boxers) ? boxers.length : 0)
    + '   (every one credited, or this would have failed)');
  console.log('boxer rows the editor still has to check: ' + todo.length + '   (kept off the cards; the backlog, not a fault)');
  todo.forEach(t => console.log('  ' + t));
}

/* ---------- A BOXER'S LOOK AND A FIGHT'S TRUNKS USE THE FIGURE'S WORDS, AND SAY WHERE THEY CAME FROM § */
{
  const findSrc = (() => { try { return fs.readFileSync(path.join(__dirname, 'find.js'), 'utf8'); } catch (e) { return ''; } })();
  const cut = require('./check-marks-load.js').cutFrom(findSrc, 'BOXER_LOOK');
  let V = null;
  try { V = cut ? eval('(' + cut.replace(/^const BOXER_LOOK =/, '').replace(/;\s*$/, '') + ')') : null; } catch (e) { V = null; }
  const read = n => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', n + '.json'), 'utf8')); } catch (e) { return null; } };
  const boxers = read('boxers'), fights = read('fights');
  if (!V || !['skin', 'hair', 'hair_colour', 'facial', 'trunks'].every(k => Array.isArray(V[k]) && V[k].length)) {
    fail.push('BOXER_LOOK could not be cut out of js/find.js — the boxers\' looks and the fights\' trunks were NOT checked');
  } else if (!Array.isArray(boxers) || !Array.isArray(fights)) {
    fail.push('data/boxers.json or data/fights.json could not be read — the looks and trunks were NOT checked');
  } else {
    /* ---------- AND EVERY WORD HAS SOMETHING TO DRAW § */
    const shapes = n => { try { const c = require('./check-marks-load.js').cutFrom(findSrc, n); return c ? eval('(' + c.replace(/^const \w+ =/, '') + ')') : null; } catch (e) { return null; } };
    const HAIR = shapes('BOXER_HAIR'), FACE = shapes('BOXER_FACE');
    const ring = (() => {
      try {
        const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
        const m = css.match(/\n\.boxer-ring\s*\{([^}]*--bf-[^}]*)\}/);
        return m ? m[1] : '';
      } catch (e) { return ''; }
    })();
    if (!HAIR || !FACE) fail.push('BOXER_HAIR or BOXER_FACE could not be cut out of js/find.js — the shapes were NOT checked');
    else {
      V.hair.filter(w => typeof HAIR[w] !== 'string').forEach(w => fail.push('hair style "' + w + '" is in BOXER_LOOK and has no shape in BOXER_HAIR'));
      V.facial.filter(w => typeof FACE[w] !== 'string').forEach(w => fail.push('facial hair "' + w + '" is in BOXER_LOOK and has no shape in BOXER_FACE'));
    }
    if (!ring) fail.push('style.css has no `.boxer-ring { --bf-… }` block — the figure\'s colours were NOT checked');
    else {
      [['skin', w => '--bf-' + w], ['hair_colour', w => '--bf-hc-' + w], ['trunks', w => '--bf-tk-' + w]].forEach(([k, tok]) =>
        V[k].filter(w => !new RegExp(tok(w) + '\\s*:').test(ring)).forEach(w =>
          fail.push(k + ' "' + w + '" is in BOXER_LOOK and `.boxer-ring` names no ' + tok(w) + ' — it would draw the stand-in\'s colour')));
      if (!/--bf-tk-leopard-spot\s*:/.test(ring)) fail.push('`.boxer-ring` names no --bf-tk-leopard-spot — leopard would be one tone');
    }
    const trunksBad = v => {
      const parts = v.split('/');
      if (parts.length > 2) return 'has more than one trim';
      const odd = parts.filter(c => V.trunks.indexOf(c) < 0);
      if (odd.length) return 'is not a trunks colour (' + odd.join(', ') + ')';
      if (parts.length === 2 && parts[0] === parts[1]) return 'has a trim the same as its colour';
      return '';
    };
    const LOOK = { look_skin: 'skin', look_hair: 'hair', look_hair_colour: 'hair_colour', look_facial: 'facial' };
    const KNOWN_B = Object.keys(LOOK).concat(['trunks_usual', 'look_source']);
    const KNOWN_F = ['trunks_a', 'trunks_b', 'trunks_source'];
    const n = { looks: 0, cells: 0, usual: 0, corners: 0, fights: 0, unverified: 0 };
    boxers.forEach(b => {
      if (!b || typeof b !== 'object') return;
      const who = 'data/boxers.json ' + (b.boxer_id || '?') + ' ' + (b.name || '');
      Object.keys(b).filter(k => /^(look|trunks)_/.test(k) && KNOWN_B.indexOf(k) < 0)
        .forEach(k => fail.push(who + ' has a column `' + k + '` the figure does not read — misspelt?'));
      let filled = 0;
      Object.keys(LOOK).forEach(col => {
        const v = String(b[col] == null ? '' : b[col]);
        if (!v) return;
        filled++;
        if (V[LOOK[col]].indexOf(v) < 0) fail.push(who + ' ' + col + ' is "' + v + '", not one of: ' + V[LOOK[col]].join(' '));
      });
      const t = String(b.trunks_usual == null ? '' : b.trunks_usual);
      if (t) { filled++; n.usual++; const why = trunksBad(t); if (why) fail.push(who + ' trunks_usual "' + t + '" ' + why); }
      if (filled) { n.looks++; n.cells += filled; }
      if (filled && !String(b.look_source || '').trim()) fail.push(who + ' has a look and no look_source — say where each value came from');
      const src = String(b.look_source || ''), seen = /photo checked:\s*https?:\/\//i.test(src), memory = /from memory/i.test(src);
      Object.keys(LOOK).forEach(col => {
        if (!String(b[col] == null ? '' : b[col])) return;
        const m = new RegExp('(^|[\\s,:])' + LOOK[col] + ' (high|medium|unverified)\\b').exec(src);
        if (!m) { fail.push(who + ' ' + col + ' is filled and look_source does not label it (`' + LOOK[col] + ' unverified`, or high/medium with the photo)'); return; }
        if (m[2] === 'unverified') { n.unverified++; return; }
        if (!seen || memory) fail.push(who + ' ' + col + ' is labelled ' + m[2] + ' and ' + (memory ? 'its source says it was judged from memory' : 'no photograph is named (`photo checked: <url>`)') + ' — label it unverified until a photo is checked');
      });
    });
    fights.forEach(f => {
      if (!f || typeof f !== 'object') return;
      const who = 'data/fights.json ' + (f.fight_id || '?') + ' ' + (f.boxer_a || '') + ' v ' + (f.boxer_b || '');
      Object.keys(f).filter(k => /^trunks_/.test(k) && KNOWN_F.indexOf(k) < 0)
        .forEach(k => fail.push(who + ' has a column `' + k + '` the figure does not read — misspelt?'));
      let filled = 0;
      ['trunks_a', 'trunks_b'].forEach(col => {
        const v = String(f[col] == null ? '' : f[col]);
        if (!v) return;
        filled++;
        const why = trunksBad(v);
        if (why) fail.push(who + ' ' + col + ' "' + v + '" ' + why);
      });
      if (filled) { n.fights++; n.corners += filled; }
      if (filled && !String(f.trunks_source || '').trim()) fail.push(who + ' names trunks and has no trunks_source — say where they came from');
    });
    /* A COUNT, NOT A SILENCE: a vocabulary check over files with no looks in them is not a pass. */
    console.log('boxers with a look: ' + n.looks + ' of ' + boxers.length + ' (' + n.cells + ' cells, ' + n.unverified
      + ' of them unverified against a photo, ' + n.usual
      + ' with their usual trunks)   fights with trunks: ' + n.fights + ' of ' + fights.length
      + ' (' + n.corners + ' of ' + (2 * fights.length) + ' corners)   — every word one the figure draws');
    if (!n.looks || !n.corners) fail.push('no boxer has a look or no fight has trunks — the vocabulary rule had nothing to check, NOT a pass');
  }
}

/* ---------- THE LEGO SETS: A CATALOGUE SHAPED LIKE THE SHOP, WAITING TO BE STOCKED § */
{
  const f = path.join(__dirname, '..', 'data', 'lego-sets.json');
  let raw = null;
  try { raw = fs.readFileSync(f, 'utf8'); } catch (e) { fail.push('data/lego-sets.json could not be read'); }
  const schemaSrc = (() => { try { return fs.readFileSync(path.join(__dirname, '..', 'backend', 'constants.gs'), 'utf8'); } catch (e) { return ''; } })();
  const shopCols = (() => {
    const m = schemaSrc.match(/\n  shop: \[([\s\S]*?)\]/);
    return m ? [...m[1].matchAll(/"([^"]+)"/g)].map(x => x[1]) : [];
  })();
  if (raw !== null) {
    const lines = raw.replace(/\n$/, '').split('\n');
    if (lines[0] !== '[' || lines[lines.length - 1] !== ']') fail.push('data/lego-sets.json must open with a bare [ and close with a bare ]');
    let sets = [];
    try { sets = JSON.parse(raw); } catch (e) { fail.push('data/lego-sets.json does not parse — ' + e.message.slice(0, 60)); }
    if (!shopCols.length) fail.push('SCHEMA.shop could not be read out of backend/constants.gs, so data/lego-sets.json was NOT compared with the shop tab');
    const seen = new Set();
    sets.forEach((r, i) => {
      const at = 'data/lego-sets.json row ' + (i + 1) + ' (' + (r.item_id || '?') + ')';
      shopCols.forEach(c => { if (!(c in r)) fail.push(at + ' has no `' + c + '` — the shop tab has that column, so a paste would shift every cell after it'); });
      if (r.item_id !== 'LG-' + r.set_number) fail.push(at + ': the id must be LG- and the set number');
      if (seen.has(r.item_id)) fail.push(at + ' repeats an id');
      seen.add(r.item_id);
      ['price_pence', 'rrp_pence', 'pieces'].forEach(k => {
        if (!Number.isInteger(r[k]) || r[k] <= 0) fail.push(at + ': `' + k + '` must be a whole number above nought, and is ' + JSON.stringify(r[k]));
      });
    });
    note.push('data/lego-sets.json holds ' + sets.length + ' set(s), ' + sets.filter(r => r.active).length + ' of them switched on for the shop');
  }

  /* ---------- AND THE OWNER'S NEW ITEMS, WAITING TO BE PASTED § */
  const addF = path.join(__dirname, '..', 'data', 'shop-additions.json');
  let adds = null;
  try { adds = JSON.parse(fs.readFileSync(addF, 'utf8')); }
  catch (e) { fail.push('data/shop-additions.json could not be read or does not parse — ' + e.message.slice(0, 60)); }
  if (adds !== null) {
    if (!Array.isArray(adds) || !adds.length) fail.push('data/shop-additions.json holds no rows');
    else {
      const taken = new Set();
      try {
        JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'settings', 'shop.json'), 'utf8'))
          .forEach(r => taken.add(String(r.item_id)));
      } catch (e) { fail.push('data/settings/shop.json could not be read, so the new ids were NOT compared with the shop\'s'); }
      if (taken.size && !taken.has('I040')) fail.push('data/settings/shop.json does not hold I040 — the id comparison is against the wrong list');
      const seen = new Set();
      adds.forEach((r, i) => {
        const at = 'data/shop-additions.json row ' + (i + 1) + ' (' + (r.item_id || '?') + ')';
        shopCols.forEach(c => { if (!(c in r)) fail.push(at + ' has no `' + c + '` — the shop tab has that column, so a paste would shift every cell after it'); });
        const extra = Object.keys(r).filter(k => shopCols.indexOf(k) < 0);
        if (shopCols.length && extra.length) fail.push(at + ' carries ' + extra.join(', ') + ', which the shop tab has no column for');
        if (!/^I\d{3}$/.test(String(r.item_id))) fail.push(at + ': an item id is I and three digits');
        if (seen.has(r.item_id)) fail.push(at + ' repeats an id in the file');
        if (taken.has(String(r.item_id))) fail.push(at + ' is an id the shop tab already has');
        if (r.item_id === 'I045') fail.push(at + ': I045 is named by the practicals for the cones — do not reuse it');
        seen.add(r.item_id);
        ['price_pence', 'price_ticks', 'price_coins', 'value_pence'].forEach(k => {
          if (String(r[k] == null ? '' : r[k]).trim() !== '')
            fail.push(at + ' has `' + k + '` = ' + JSON.stringify(r[k]) + ' — no price was given for it, so it must be blank until the owner fills it');
        });
        if (r.active !== true) fail.push(at + ' is not active — these are for sale, as the owner answered');
        if (!String(r.name || '').trim()) fail.push(at + ' has no name, and doGet drops a row with no name');
      });
      /* THE CSV IS WHAT GETS PASTED, so it is held to the JSON cell for cell — in the tab's order. */
      let csv = null;
      try { csv = fs.readFileSync(path.join(__dirname, '..', 'data', 'shop-additions.csv'), 'utf8'); }
      catch (e) { fail.push('data/shop-additions.csv could not be read'); }
      if (csv !== null) {
        const cells = line => {
          const out = []; let cur = '', q = false;
          for (let k = 0; k < line.length; k++) {
            const ch = line[k];
            if (q) { if (ch === '"' && line[k + 1] === '"') { cur += '"'; k++; } else if (ch === '"') q = false; else cur += ch; }
            else if (ch === '"') q = true; else if (ch === ',') { out.push(cur); cur = ''; } else cur += ch;
          }
          out.push(cur); return out;
        };
        const lines = csv.replace(/\r/g, '').replace(/\n$/, '').split('\n');
        if (lines[0] !== shopCols.join(',')) fail.push('data/shop-additions.csv does not open with the shop tab\'s columns in the tab\'s order');
        if (lines.length - 1 !== adds.length) fail.push('data/shop-additions.csv has ' + (lines.length - 1) + ' rows and the JSON has ' + adds.length);
        lines.slice(1).forEach((l, i) => {
          const c = cells(l), r = adds[i] || {};
          shopCols.forEach((k, j) => {
            const want = r[k] === true ? 'TRUE' : r[k] === false ? 'FALSE' : String(r[k] == null ? '' : r[k]);
            if (c[j] !== want) fail.push('data/shop-additions.csv row ' + (i + 1) + ' `' + k + '` reads ' + JSON.stringify(c[j]) + ' where the JSON says ' + JSON.stringify(want));
          });
        });
      }
      note.push('data/shop-additions.json holds ' + adds.length + ' row(s) for the Ledger shop tab, '
                + adds.map(r => r.item_id).join(' ') + ' — none priced yet');
    }
  }
}

/* ---------- A SIMPLEST-FORM QUESTION MUST NOT HAVE A FRACTION FOR AN ANSWER § */
const BARE_FRACTION = /^-?\d*\s*\d+[\u2044\/]\d+$/;
const SIMPLEST = /simplest form|lowest terms|fully simplif/i;
rows.forEach(r => {
  if (!r || r.kind !== 'question') return;
  const a = String(r.accept || '').trim();
  if (!a || !BARE_FRACTION.test(a)) return;
  const asked = String(r.html || '') + ' ' + String(r.lead || '');
  if (!SIMPLEST.test(asked.replace(/<[^>]+>/g, ' '))) return;
  fail.push(r.row_id + ' asks for the simplest form and its `accept` is the fraction ' + a
            + ' — the marker compares fractions by value, so the unsimplified fraction in the '
            + 'question would be marked right. Leave `accept` off this row and let a person mark it.');
});

/* ---------- A TAPPED ANSWER MUST BE ONE OF THE TAPS § */
let choiceRows = 0;
rows.forEach(r => {
  if (!r || (!r.choices && !r.choice_right)) return;
  const ch = String(r.choices || '').split('|').map(t => t.trim()).filter(Boolean);
  /* BY COMMA AND BY PIPE: an ordering's `choice_right` may list more than one order (`2,1,3 | 1,2,3`),
     and every position in every one of them must still be one of the taps. */
  const right = String(r.choice_right || '').split(/[,|]/).map(t => t.trim()).filter(Boolean);
  if (r.choices) choiceRows++;
  if (r.kind !== 'question') fail.push(r.row_id + ' carries `choices` and is not a question row');
  else if (ch.length < 2) fail.push(r.row_id + ' has `choices` with fewer than two options, so there is nothing to choose between');
  else right.forEach(n => {
    const v = Number(n);
    if (!Number.isInteger(v) || v < 1 || v > ch.length)
      fail.push(r.row_id + ' credits option ' + n + ' of ' + ch.length + ' — a right answer nobody can tap');
  });
});
console.log('multiple-choice questions drawn as taps: ' + choiceRows);

/* ---------- AN ORDERING IS ITS ITEMS, THE ORDERS THAT ARE RIGHT, AND ITS TWO ENDS § */
let orderRows = 0;
rows.forEach(r => {
  if (!r) return;
  const isOrder = String(r.answer_type || '').trim() === 'order';
  if (!isOrder) {
    if (String(r.order_ends || '').trim()) fail.push(r.row_id + ' has `order_ends` and is not an ordering (`answer_type: order`) — nothing draws them');
    return;
  }
  orderRows++;
  if (wordless(r)) return;
  const ch = String(r.choices || '').split('|').map(t => t.trim()).filter(Boolean);
  const ways = String(r.choice_right || '').split('|').map(w => w.trim()).filter(Boolean);
  const ends = String(r.order_ends || '').split('|').map(t => t.trim()).filter(Boolean);
  if (r.kind !== 'question') fail.push(r.row_id + ' is an ordering and not a question row');
  if (ch.length < 2) fail.push(r.row_id + ' is an ordering of ' + ch.length + ' item(s) — there is nothing to put in order');
  if (!ways.length) fail.push(r.row_id + ' is an ordering with no `choice_right` — no order is right, so nobody can be');
  ways.forEach(w => {
    const p = w.split(',').map(t => t.trim());
    const whole = p.length === ch.length && p.every(t => /^\d+$/.test(t))
      && p.map(Number).sort((a, b) => a - b).every((v, i) => v === i + 1);
    if (!whole) fail.push(r.row_id + ' lists the order "' + w + '", which is not its ' + ch.length + ' items each once (1 to ' + ch.length + ')');
  });
  if (ends.length !== 2) fail.push(r.row_id + ' has `order_ends` "' + String(r.order_ends || '') + '" — wanted the two ends, first end first: "smallest | largest"');
  if (String(r.accept || '').trim()) fail.push(r.row_id + ' is an ordering with an `accept` — the marker reads a typed list as a set, so any order of the right items would be marked right');
});
console.log('orderings tapped in order: ' + orderRows);

/* ---------- AND THE ORDER IT LISTS IS THE RIGHT ONE § */
const ORD_SEP = /,|&rarr;|→/;
const ordText = s => String(s == null ? '' : s).replace(/<[^>]*>/g, '')
  .replace(/(\d),(\d{3})\b/g, '$1$2').replace(/&nbsp;|&thinsp;|\s+/g, '').toLowerCase();
const ORD_UNIT = { '': ['n', 1], '%': ['n', 0.01], '&pound;': ['money', 1], '£': ['money', 1], p: ['money', 0.01],
  '&deg;c': ['temp', 1], '°c': ['temp', 1], m: ['length', 1], cm: ['length', 0.01], mm: ['length', 0.001],
  km: ['length', 1000], kg: ['mass', 1], g: ['mass', 0.001], tonnes: ['mass', 1000], tonne: ['mass', 1000],
  ml: ['volume', 0.001], litres: ['volume', 1], litre: ['volume', 1], l: ['volume', 1] };
const ROMAN = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
/* AN ITEM AS [kind, value], or null where it does not read as one number. A card's letter in front of
   it ("A &pound;250", where the items are lettered cards in a figure) is a name, not part of the value. */
const ordValue = html => {
  const s = String(html).replace(/^[A-Z]\s+(?=\S)/, '').replace(/&nbsp;|&thinsp;|\s+/g, '').replace(/&minus;|−/g, '-');
  let m;
  if ((m = /^<sup>(\d+)<\/sup>&frasl;<sub>(\d+)<\/sub>$/.exec(s))) return ['n', +m[1] / +m[2]];
  if ((m = /^(-?\d*\.?\d+)&times;10<sup>(-?\d+)<\/sup>$/.exec(s))) return ['n', +m[1] * Math.pow(10, +m[2])];
  if ((m = /^(\d+)<sup>(\d+)<\/sup>$/.exec(s))) return ['n', Math.pow(+m[1], +m[2])];
  if ((m = /^(?:&radic;|√)(\d+(?:\.\d+)?)$/.exec(s))) return ['n', Math.sqrt(+m[1])];
  if ((m = /^(?:&#8731;|∛)(\d+(?:\.\d+)?)$/.exec(s))) return ['n', Math.cbrt(+m[1])];
  if (/^[IVXLCDM]+$/.test(s)) {
    let v = 0;
    for (let i = 0; i < s.length; i++) v += ROMAN[s[i]] < (ROMAN[s[i + 1]] || 0) ? -ROMAN[s[i]] : ROMAN[s[i]];
    return ['n', v];
  }
  /* A RECURRING DECIMAL: each dotted digit is a span holding the digit and a `&bull;` over it. The block
     from the first dotted digit to the last repeats, and it runs to the end of the number. */
  if (/&bull;/.test(s)) {
    const t = s.replace(/<span[^>]*>(\d)<span[^>]*>&bull;<\/span><\/span>/g, '[$1]');
    const r = /^(-?\d*)\.((?:\d|\[\d\])+)$/.exec(t);
    if (!r || !/\]$/.test(t)) return null;
    const ds = [...r[2].matchAll(/\[(\d)\]|(\d)/g)].map(x => ({ d: x[1] || x[2], dot: !!x[1] }));
    const at = ds.findIndex(x => x.dot);
    const fixed = ds.slice(0, at).map(x => x.d).join(''), rep = ds.slice(at).map(x => x.d).join('');
    return ['n', parseFloat(r[1] + '.' + fixed + rep.repeat(Math.ceil(18 / rep.length)))];
  }
  const u = /^(-?)(&pound;|£)?(\d+(?:\.\d+)?|\.\d+)([a-z%&;°]*)$/i.exec(s.replace(/(\d),(\d{3})\b/g, '$1$2'));
  if (!u) return null;
  const unit = (u[2] || u[4] || '').toLowerCase();
  if (u[2] && u[4]) return null;
  const k = ORD_UNIT[unit];
  return k ? [k[0], (u[1] ? -1 : 1) * +u[3] * k[1]] : null;
};
const ORD_UP = /^(smallest|lowest|least|shortest|lightest|coldest|cheapest)$/i;
const ORD_DOWN = /^(largest|highest|greatest|biggest|longest|heaviest|warmest|hottest|dearest)$/i;
let ordAnswered = 0, ordRead = 0, ordUnread = 0;
rows.forEach(r => {
  if (!r || String(r.answer_type || '').trim() !== 'order') return;
  const raw = String(r.choices || '').split('|').map(t => t.trim()).filter(Boolean);
  const ch = raw.map(ordText);
  const ways = String(r.choice_right || '').split('|').map(w => w.split(',').map(t => +t.trim())).filter(w => w.length && w.every(k => k >= 1 && k <= ch.length));
  if (!ways.length) return;   /* the rule above has failed it already */
  const head = /<b>([\s\S]*?)<\/b>/.exec(String(r.answer || ''));
  if (!head) fail.push(r.row_id + ' is an ordering whose `answer` has no <b> list — nothing says which order its `choice_right` is meant to be');
  else {
    const said = ordText(head[1]).split(ORD_SEP);
    if (ways.some(w => w.length === said.length && w.every((k, i) => said[i] === ch[k - 1]))) ordAnswered++;
    else fail.push(r.row_id + ' answers "' + head[1].replace(/<[^>]*>/g, '') + '", which is not its items in any order `choice_right` lists (' + r.choice_right + ') — one of the two is wrong');
  }
  const vals = raw.map(ordValue);
  const end = String(r.order_ends || '').split('|')[0].trim();
  const dir = ORD_UP.test(end) ? 1 : ORD_DOWN.test(end) ? -1 : 0;
  if (!dir || vals.some(v => !v) || new Set(vals.map(v => v[0])).size !== 1) { ordUnread++; return; }
  ordRead++;
  const listed = new Set(ways.map(w => w.join(',')));
  ways.forEach(w => {
    for (let i = 0; i + 1 < w.length; i++) {
      const a = vals[w[i] - 1][1], b = vals[w[i + 1] - 1][1];
      const same = Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
      if (!same && (b - a) * dir < 0) {
        fail.push(r.row_id + ' lists the order ' + w.join(',') + ', which puts ' + raw[w[i] - 1].replace(/<[^>]*>/g, '') + ' (' + a + ') before ' + raw[w[i + 1] - 1].replace(/<[^>]*>/g, '') + ' (' + b + ') — not ' + end + ' first');
        break;
      }
      if (same) {
        const s = w.slice(); [s[i], s[i + 1]] = [s[i + 1], s[i]];
        if (!listed.has(s.join(','))) fail.push(r.row_id + ': items ' + w[i] + ' and ' + w[i + 1] + ' are equal, and ' + s.join(',') + ' is not listed beside ' + w.join(',') + ' — a right order marked wrong');
      }
    }
  });
});
console.log('orderings whose answer names their items in a listed order: ' + ordAnswered + '; read as numbers and running the way their ends say: ' + ordRead + ' (' + ordUnread + ' are words, names or mixed units and are not read)');

/* ---------- SAY IT --------------------------------------------------------------------------------- */
const say = (title, list, draw) => {
  console.log('\n' + title + '  (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  list.forEach(x => console.log('  ' + draw(x)));
};

/* "EDEXCEL GCSE MATHS PAPERS CHECKED AT 80 MARKS" WAS TRUE WHEN IT WAS WRITTEN AND IS NOT NOW. § */
/* ---------- AN `accept` THAT CANNOT MARK ITS OWN ANSWER § */
const MARKS = require('./check-marks-load.js').markingSource(path.join(__dirname, '..'));
if (MARKS.missing.length) {
  fail.push('the marking functions could not be cut out of find.js (' + MARKS.missing.join(', ')
    + '), so no `accept` cell was checked \u2014 which is not the same as their being fine');
} else {
  /* eslint-disable no-eval */
  const MK = eval('(function () { ' + MARKS.source + '\n; return { markAnswer_: markAnswer_, markNorm_: markNorm_ }; })()');
  const markOf = MK.markAnswer_;
  rows.forEach(r => {
    const cell = String((r && r.accept) || '').trim();
    if (!cell) return;
    const first = (cell.split('|').map(w => w.trim()).filter(w => !/^rule:/i.test(w))[0] || '');
    if (first && !markOf(first, cell)) {
      fail.push(r.row_id + ' cannot be marked by its own `accept` (' + JSON.stringify(cell)
        + ') \u2014 a child typing exactly that is told they are wrong');
    }
  });

  /* ---------- A TICK BOX HAS ONE RIGHT OPTION AND THE PAPER PRINTS THE OTHERS § */
  const TICK = /tick\s*(<[^>]*>)?\s*one/i;
  const optionsOf = html => (String(html || '').match(/<li>[\s\S]*?<\/li>/g) || [])
    .map(o => o.replace(/<\/?su[pb]>/g, '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
               .replace(/\s+/g, ' ').trim().replace(/\.$/, ''))
    .filter(Boolean);
  let tickable = 0, tickBlank = 0;
  rows.forEach(r => {
    if (!r || r.kind !== 'question' || !TICK.test(String(r.html || ''))) return;
    const opts = optionsOf(r.html);
    if (!opts.length) return;
    const cell = String(r.accept || '').trim();
    if (!cell) { tickBlank++; return; }
    tickable++;
    const hit = opts.filter(o => markOf(o, cell) === true);
    if (hit.length !== 1) {
      fail.push(r.row_id + ' prints ' + opts.length + ' options to tick and its `accept` ('
        + JSON.stringify(cell) + ') marks ' + hit.length + ' of them right'
        + (hit.length ? ' \u2014 ' + JSON.stringify(hit.slice(0, 3)) : '')
        + '. A tick box has one right option.');
    }
  });
  note.push(tickable + ' tick-box question(s) can mark themselves and each was checked against '
    + 'every other option its paper prints; ' + tickBlank + ' print their options and have no '
    + '`accept`, so they draw no Check button');

  /* ---------- A QUESTION THAT ASKS FOR THE UNITS DOES NOT ACCEPT A BARE NUMBER § */
  const UNITS_ASKED = /\b(?:giv(?:e|ing)|stat(?:e|ing)|includ(?:e|ing)) (?:the |your )?units\b|units of your answer/i;
  /* THE NOTE IS A COUNT OF BOTH, NEVER A SENTENCE. § */
  let unitsAsked = 0, unitsBare = 0;
  rows.forEach(r => {
    if (!r || r.kind !== 'question' || !r.accept) return;
    if (!UNITS_ASKED.test(String(r.html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' '))) return;
    unitsAsked++;
    const bare = String(r.accept).split('|').map(w => w.trim()).filter(w => /^-?[\d.,\s\/⁄]+$/.test(w));
    if (!bare.length) return;
    unitsBare++;
    fail.push(r.row_id + ' asks for the units and its `accept` lists the bare number '
      + JSON.stringify(bare.join(' | ')) + ' — which marks ANY unit right. Leave only the ways with the unit.');
  });
  note.push(unitsAsked + ' question(s) ask for the units and can mark themselves: '
    + (unitsAsked - unitsBare) + ' list only ways with the unit, ' + unitsBare + ' list a bare number');

  /* ---------- A ROOT OR π WITH A UNIT NAMES THE UNIT § */
  const ROOTY = /[√π]/;                     /* as the marker asks it of a typed answer */
  /* a length (or `units`) after a number, a π, a root or a bracket — read the same way in the cell and the model answer */
  const NAMES_UNIT = /(?:\d|π|\))\s*(?:mm|cm|km|m|units?)(?:\^?[23]|[²³])?(?![a-z])/;
  const headOf = a => String((/<b>([\s\S]*?)<\/b>/.exec(String(a || '')) || [, String(a || '').split(/\u2014|&mdash;/)[0]])[1])
    .replace(/&pi;/g, 'π').replace(/&radic;/g, '√').replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9]+;/g, ' ');
  let rootUnit = 0, rootUnitBare = 0;
  rows.forEach(r => {
    if (!r || r.kind !== 'question' || !r.accept) return;
    const ways = String(r.accept).split('|').map(w => MK.markNorm_(w.trim())).filter(Boolean);
    if (!ways.some(w => ROOTY.test(w))) return;
    if (!NAMES_UNIT.test(headOf(r.answer))) return;
    rootUnit++;
    if (ways.some(w => NAMES_UNIT.test(w))) return;
    rootUnitBare++;
    fail.push(r.row_id + ' answers with a root or π, its model answer gives a unit ('
      + JSON.stringify(headOf(r.answer).replace(/\s+/g, ' ').trim()) + '), and its `accept` ('
      + JSON.stringify(r.accept) + ') names none — so that unit, typed, is marked wrong');
  });
  note.push(rootUnit + ' question(s) answer with a root or π and a unit: ' + (rootUnit - rootUnitBare)
    + ' name the unit in their cell, ' + rootUnitBare + ' do not');

  /* ---------- A ROOT OR π ANSWER GETS THE KEY FOR IT § */
  const kpSrc = fs.readFileSync(path.join(__dirname, 'keypad.js'), 'utf8');
  /* the cutter by its full name: `cutFrom` is destructured further down this file, past where this runs */
  /* THE LAYER IS READ OFF qType_ (round 3), so qtypes.js and working.js's `workRow_` come with the keypad's own names */
  const qtSrc_ = fs.readFileSync(path.join(__dirname, 'qtypes.js'), 'utf8');
  const wrSrc_ = require('./check-marks-load.js').cutFrom(fs.readFileSync(path.join(__dirname, 'working.js'), 'utf8'), 'workRow_');
  const kpParts = ['KP_LEAD', 'kpMathsy_', 'ansMaths_'].map(n => require('./check-marks-load.js').cutFrom(kpSrc, n)).concat([wrSrc_]);
  if (kpParts.some(c => !c)) {
    fail.push('KP_LEAD, kpMathsy_ or ansMaths_ is not in keypad.js, or workRow_ not in working.js — renamed? No row was checked for which layer it opens on.');
  } else {
    const KP = eval('(function () { ' + MARKS.source + '\n' + qtSrc_ + '\n' + kpParts.join('\n')
      + '\n; return { kpMathsy_: kpMathsy_, ansMaths_: ansMaths_, markNorm_: markNorm_, markRange_: markRange_ }; })()');
    let rootRows = 0, rootKeyboard = 0;
    rows.forEach(r => {
      if (!r || r.kind !== 'question' || !r.accept) return;
      const ways = String(r.accept).split('|').map(w => w.trim()).filter(Boolean);
      if (!ways.some(w => /[√π]/.test(KP.markNorm_(w)) && KP.kpMathsy_(w))) return;
      rootRows++;
      const item = { answerType: r.answer_type, accept: r.accept,
                     choices: r.choices ? String(r.choices).split('|') : [] };
      if (KP.ansMaths_(item)) return;
      rootKeyboard++;
      fail.push(r.row_id + ' writes its answer as a root the keypad can type, and '
        + JSON.stringify(ways.filter(w => !KP.kpMathsy_(w)).join(' | '))
        + ' sends it to the phone keyboard instead, which has no √ or π key');
    });
    note.push(rootRows + ' question(s) answer with a root or π: ' + (rootRows - rootKeyboard)
      + ' get the keypad, ' + rootKeyboard + ' are sent to the phone keyboard');
    ['Q-1MA1-2006-3H-12a'].forEach(id => {
      const r = rows.find(x => x && x.row_id === id);
      if (!r) { fail.push(id + ' is not in the library — renamed? It was checked for the keypad by name.'); return; }
      const item = { answerType: r.answer_type, accept: r.accept,
                     choices: r.choices ? String(r.choices).split('|') : [] };
      if (!KP.ansMaths_(item)) fail.push(id + ' is an algebraic fraction and is sent to the phone keyboard: '
        + JSON.stringify(String(r.accept || '').split('|').map(w => w.trim()).filter(w => !KP.kpMathsy_(w)).join(' | '))
        + ' is not maths-shaped');
    });

    /* ---------- A BAND IS A NUMBER, AND GETS THE KEYS FOR ONE § */
    let bandRows = 0, bandKeyboard = 0;
    rows.forEach(r => {
      if (!r || r.kind !== 'question' || !r.accept) return;
      if (String(r.answer_type || '').trim().toLowerCase() !== 'calculation') return;
      const ways = String(r.accept).split('|').map(w => w.trim()).filter(Boolean);
      if (!ways.some(w => KP.markRange_(w))) return;
      if (!ways.every(w => KP.markRange_(w) || /^-?[\d.,\s\/]+°?$/.test(KP.markNorm_(w)))) return;
      bandRows++;
      const item = { answerType: r.answer_type, accept: r.accept,
                     choices: r.choices ? String(r.choices).split('|') : [] };
      if (KP.ansMaths_(item)) return;
      bandKeyboard++;
      fail.push(r.row_id + ' is answered with a band of numbers (' + JSON.stringify(r.accept)
        + ') and is sent to the phone keyboard instead of the keypad');
    });
    note.push(bandRows + ' calculation(s) answer with a band of numbers: ' + (bandRows - bandKeyboard)
      + ' get the keypad, ' + bandKeyboard + ' are sent to the phone keyboard');
  }
}

console.log(`\nTHE LIBRARY  —  ${rows.length} rows, ${papers.size} papers, ${marks.size} of them summed against a stated total`);

say('BROKEN', fail, x => x);

say('WHAT THE TRANSCRIBER COULD NOT RECOVER — worth a person and the original paper', flagged,
    r => `${r.row_id}  ${String(r.examiner_note).slice(0, 96)}`);

/* ---------- WHEN A FIGURE IS DRAWN, AND THE RULE IS THE OWNER'S § */

/* ---------- A CARD IS NOT A PAGE § */
const PRE_AT = {};
rows.forEach(r => {
  if (!r || r.kind !== 'preamble') return;
  const k = [r.paper_id, String(r.question || ''), String(r.section || '')].join('|');
  (PRE_AT[k] = PRE_AT[k] || []).push(r);
});
const words = h => String(h == null ? '' : h).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const unshown = [];
rows.forEach(r => {
  if (!r || r.kind !== 'question') return;
  if (String(r.diagram || '').trim()) return;          /* it draws the thing; nothing to look up */
  const txt = words(r.html);
  const refs = [...new Set((txt.match(/(?:Figure|Table)\s+\d+/g) || [])
    .map(m => m.replace(/\D+/g, '')))];
  if (!refs.length) return;
  /* EVERYTHING THE CARD SHOWS, which is the row plus the preambles `preamble_` would attach: § */
  let shown = txt;
  Object.keys(PRE_AT).forEach(k => {
    const [pid, q, sec] = k.split('|');
    if (pid !== r.paper_id) return;
    if (q && q !== String(r.question || '')) return;
    if (sec && sec !== String(r.section || '')) return;
    PRE_AT[k].forEach(x => { shown += ' ' + words(x.html) + ' ' + (x.diagram || ''); });
  });
  /* SAYING WHAT IT SHOWS, not merely naming it. "Figure 4 shows the inheritance of AKU" is a
     description; "complete Figure 4" is a reference. */
  const told = refs.every(n =>
    new RegExp('(?:Figure|Table)\\s+' + n + '\\s+(?:shows|is|represents|gives)').test(shown));
  if (!told) unshown.push(r);
});
say('A FIGURE NAMED AND NOT SHOWN — the card cannot answer it, and the paper is needed',
    unshown.slice(0, 10), r => `${r.row_id}  ${words(r.html).slice(0, 88)}`);
if (unshown.length > 10) console.log('  … and ' + (unshown.length - 10) + ' more');

/* ---------- `note` WAS PUSHED TO AND NEVER PRINTED § */
say('WORTH DOING NEXT — not a fault', note, x => x);

console.log(`\npapers with no questions under them yet: ${empty.length}  (the backlog, not a fault)`);
console.log(`documents with a stub row beside their transcription: ${stubPairs}  (the intended state)`);
/* ---------- AND A PAPER THAT DECLARES A TOTAL AND HAS NO QUESTIONS IS IN NEITHER COUNT § */
const queued = [...paperFacts.entries()]
  .filter(([pid, p]) => Number(p.total_marks) > 0 && !marks.has(pid) && !unchecked.has(pid));
console.log(`papers with a total and no questions yet: ${queued.length}  (the transcription queue)`);
/* TEN AND A REMAINDER, because eighty-seven lines on every run is a list nobody reads — which is the `ACCEPTED_TAP` argument pointed the other way: § */
queued.sort().slice(0, 10).forEach(([pid, p]) =>
  console.log(`  ${pid.padEnd(22)} ${String(p.name || '').slice(0, 42).padEnd(42)} out of ${p.total_marks}`));
if (queued.length > 10) console.log(`  … and ${queued.length - 10} more`);

console.log(`papers checked against a total: ${marks.size}   papers with no total to check against: `
          + `${unchecked.size}  (put total_marks on the paper row and they are)`);
console.log(`pictures drawn here from what the paper prints: ${drawnHere - chosenHere}`
  + `   pictures whose contents we had to choose: ${chosenHere}  (each credited on its card)`);
console.log(`pictures carried by rows as an address: ${pic.length}`);
/* WITH A DENOMINATOR, because "1" is a number and "1 of 665" is a backlog. § */
/* ---------- A QUESTION WHOSE PICTURE NEVER CAME ACROSS § */
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

/* ---------- A QUESTION WHOSE TABLE NEVER CAME ACROSS § */
const DRAWN_COLS = ['html', 'lead', 'diagram', 'images'];
const drawnText = r => DRAWN_COLS.map(k => String(r[k] || '')).join('');
const stemsAbove = {};
rows.forEach(r => {
  if (r && r.kind === 'preamble') (stemsAbove[r.paper_id] = stemsAbove[r.paper_id] || []).push(r);
});
const NAMES_A_TABLE = /\b(?:the|this)\s+table\b|\bthe\s+list\b/i;
const noTable = rows.filter(r => r && r.kind === 'question'
  && NAMES_A_TABLE.test(String(r.html || ''))
  && !/<table/i.test(drawnText(r) + (stemsAbove[r.paper_id] || [])
       .filter(p => !String(p.question || '') || String(p.question) === String(r.question))
       .map(drawnText).join('')));
const tableCounted = noTable.filter(r => String(r.figure || '').trim()
  && ANSWER_SPACE.indexOf(String(r.figure).trim()) === -1).length;
const tableIsBlank = noTable.filter(r => ANSWER_SPACE.indexOf(String(r.figure || '').trim()) !== -1).length;
const tableSilent = noTable.filter(r => !String(r.figure || '').trim());
const tPerPaper = {};
tableSilent.forEach(r => { tPerPaper[r.paper_id] = (tPerPaper[r.paper_id] || 0) + 1; });
const tWorst = Object.keys(tPerPaper).sort((a, b) => tPerPaper[b] - tPerPaper[a]).slice(0, 5);
console.log(`questions naming a table their card does not hold: ${noTable.length}`
  + `  (${tableCounted} already in the picture count, ${tableIsBlank} where the table IS the answer space, `
  + `${tableSilent.length} recorded nowhere)`);
if (tWorst.length) {
  console.log(`   worst for the ${tableSilent.length}: ${tWorst.map(k => `${k} (${tPerPaper[k]})`).join(', ')}`);
}

/* ---------- ONE PICTURE, SEVERAL PARTS, AND WHERE IT BELONGS § */
const byQ = {};
rows.forEach(r => {
  if (!r || r.kind !== 'question') return;
  const f = String(r.figure || '').trim();
  if (!f || ANSWER_SPACE.indexOf(f) !== -1) return;
  const k = `${r.paper_id}|${r.question}|${f}`;
  (byQ[k] || (byQ[k] = [])).push(r);
});
const shared = Object.keys(byQ).filter(k => byQ[k].length > 1);
const drawnTwice = shared.filter(k => byQ[k].filter(r => String(r.diagram || '').trim()).length > 1);
console.log(`a picture named on more than one part of one question: ${shared.length}`
  + `  (it belongs on the question's preamble, drawn once — see \`preamble_\`)`);
if (drawnTwice.length) {
  console.log(`   and drawn on more than one of them: ${drawnTwice.length} — `
    + drawnTwice.slice(0, 3).map(k => k.split('|').slice(0, 2).join(' Q')).join(', ')
    + (drawnTwice.length > 3 ? `, …` : ''));
}

/* ---------- WHAT A PAPER REQUIRES, AND HOW MUCH OF IT IS KNOWN § */
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

/* ---------- A QUESTION THAT ASKS YOU TO DRAW, WITH NOWHERE TO DRAW § */
const preDiag_ = {};
rows.forEach(r => {
  if (!r || r.kind !== 'preamble' || !r.diagram) return;
  const k = String(r.paper_id) + '\u0000' + String(r.question || '');
  preDiag_[k] = (preDiag_[k] || 0) + 1;
});
const drawQs = rows.filter(r => r && r.kind === 'question'
  && /^(drawing|annotate)$/i.test(String(r.answer_type || '').trim()));
/* EXACTLY ONE, not "any". § */
const withPad = drawQs.filter(r => r.diagram
  || preDiag_[String(r.paper_id) + '\u0000' + String(r.question || '')] === 1);
/* THE APP'S OWN RULE FOR WHICH SURFACE, cut out of find.js by name with the two names it reads. A check
   that cannot find its subject exits non-zero: "I did not count" is not "there were none". */
const findSrc_ = fs.readFileSync(path.join(__dirname, 'find.js'), 'utf8');
const { cutFrom } = require('./check-marks-load.js');
const surfParts_ = ['padPicked_', 'padDrawn_', 'padSurface_'].map(n => cutFrom(findSrc_, n))
  .concat([cutFrom(fs.readFileSync(path.join(__dirname, 'working.js'), 'utf8'), 'workRow_')]);
if (surfParts_.some(c => !c)) {
  fail.push('padSurface_, padDrawn_ or padPicked_ is not in find.js, or workRow_ not in working.js — renamed? The surfaces were NOT counted.');
}
const padSurface_ = surfParts_.some(c => !c) ? (() => '')
  : new Function(fs.readFileSync(path.join(__dirname, 'qtypes.js'), 'utf8') + '\n' + surfParts_.join('\n') + '\nreturn padSurface_;')();
const onSurface = {};
drawQs.filter(r => withPad.indexOf(r) === -1).forEach(r => {
  const k = padSurface_({ answerType: String(r.answer_type || '').trim().toLowerCase(), surface: r.surface, figure: r.figure, row: r }) || 'none';
  onSurface[k] = (onSurface[k] || 0) + 1;
});
console.log(`questions answered by drawing: ${drawQs.length} — on their own picture: ${withPad.length}, `
  + `on a surface while the picture is transcribed: ${Object.keys(onSurface).sort()
    .map(k => `${k} ${onSurface[k]}`).join(', ') || 'none'}`);

/* THE PEN'S INSTRUMENTS are no longer counted per question: every part has every tool (round 3, qtools.js; check-tools.js). */

/* ---------- "USE YOUR GRAPH" NAMES THE PART WHOSE GRAPH § */
const usesKey_ = p => String(p == null ? '' : p).toLowerCase().replace(/[^a-z0-9]/g, '');
const penRow_ = r => /^(drawing|annotate)$/i.test(String(r.answer_type || '').trim())
  || ['grid', 'coord', 'blank'].indexOf(String(r.surface || '').trim().toLowerCase()) !== -1;
const YOUR_DRAWING = /\b(use|using|from|on) your (graph|diagram|drawing|line of best fit|line|curve|box plot|histogram|tree diagram|venn diagram|scatter (graph|diagram)|cumulative frequency (graph|diagram))\b/i;
const usesQs_ = {};
rows.forEach(r => {
  if (!r || r.kind !== 'question') return;
  const k = String(r.paper_id) + '\u0000' + String(r.question || '');
  (usesQs_[k] = usesQs_[k] || []).push(r);
});
const usesBad = [], usesMissing = [];
let usesN = 0;
rows.forEach(r => {
  if (r && r.kind !== 'question' && r.uses !== undefined && r.uses !== '') usesBad.push(`${r.row_id} is a ${r.kind} row with a \`uses\` — only a question part can use another`);
});
Object.keys(usesQs_).forEach(k => {
  const xs = usesQs_[k];
  const at = {};
  xs.forEach((r, i) => { at[usesKey_(r.part)] = i; });
  xs.forEach((r, i) => {
    if (r.uses !== undefined && r.uses !== null && String(r.uses) !== '') {
      usesN++;
      const j = at[usesKey_(r.uses)];
      if (j === undefined) usesBad.push(`${r.row_id} uses "${r.uses}", and its question has no such part`);
      else if (j === i) usesBad.push(`${r.row_id} uses itself`);
      else if (j > i) usesBad.push(`${r.row_id} uses "${r.uses}", which comes after it — its marks cannot exist yet`);
      else if (!penRow_(xs[j])) usesBad.push(`${r.row_id} uses "${r.uses}", which is not answered by drawing — there are no marks to show`);
      return;
    }
    const words = String((r.lead || '') + ' ' + (r.html || '')).replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' ');
    if (i && YOUR_DRAWING.test(words) && xs.slice(0, i).some(penRow_)) {
      usesMissing.push(`${r.row_id} says "${(words.match(YOUR_DRAWING) || [''])[0]}" after a part answered by drawing, and has no \`uses\` — the child's drawing is not shown`);
    }
  });
});
usesBad.concat(usesMissing).forEach(m => fail.push(m));
console.log(`parts that show an earlier part's drawing (\`uses\`): ${usesN}`
  + (usesBad.length + usesMissing.length ? `  — and ${usesBad.length + usesMissing.length} WRONG:` : ''));
usesBad.concat(usesMissing).forEach(m => console.log('   ' + m));

/* ---------- THE FIGURES THE PAPER PRINTS AND NOBODY HAS DRAWN, COUNTED SO THE COUNT CANNOT GROW § */
const NOT_DRAWN_MAX = 410;
const nfSrc_ = ['FIG_NAMED', 'figWanted_'].map(n => cutFrom(findSrc_, n));
if (nfSrc_.some(c => !c)) {
  const why = 'FIG_NAMED or figWanted_ is not in find.js — renamed? The figures not drawn yet were NOT counted.';
  fail.push(why);
  console.log(why);
}
const figWanted_ = nfSrc_.some(c => !c) ? (() => false) : new Function(nfSrc_.join('\n') + '\nreturn figWanted_;')();
const hasPic_ = r => !!(String(r.diagram || '').trim() || String(r.images || '').trim());
const picAt_ = {};
rows.forEach(r => {
  if (!r || !hasPic_(r) || (r.kind !== 'question' && r.kind !== 'preamble')) return;
  const q = String(r.question || '').trim();
  /* A QUESTION'S PICTURE COVERS ITS QUESTION; A PREAMBLE'S, THE SCOPE IT IS WRITTEN FOR. */
  const k = r.kind === 'question' || q ? 'q|' + r.paper_id + '|' + q
    : r.section ? 's|' + r.paper_id + '|' + r.section : 'p|' + r.paper_id;
  picAt_[k] = true;
});
const notDrawn = rows.filter(r => {
  if (!r || r.kind !== 'question') return false;
  /* A `uses` PART'S FIGURE IS THE CHILD'S OWN DRAWING, shown in its card (`usesBlock_`) -- `figMissing_` says
     the same, and a ledger that counted it would be a backlog nobody can ever draw down. */
  if (r.uses !== undefined && r.uses !== null && String(r.uses).trim() !== '') return false;
  if (padSurface_({ answerType: String(r.answer_type || '').trim().toLowerCase(), surface: r.surface, figure: r.figure, row: r })) return false;
  const figured = picAt_['q|' + r.paper_id + '|' + String(r.question || '').trim()]
    || (r.section && picAt_['s|' + r.paper_id + '|' + r.section]) || picAt_['p|' + r.paper_id];
  return figWanted_(String(r.lead || '') + ' ' + String(r.html || ''), !!figured);
});
console.log(`parts naming a figure nobody has drawn yet ("Figure not drawn yet." in the first card of each run): ${notDrawn.length}`
  + `   (ceiling ${NOT_DRAWN_MAX})`);
if (notDrawn.length > NOT_DRAWN_MAX) {
  const why = `${notDrawn.length - NOT_DRAWN_MAX} more part(s) name a figure nobody has drawn than the ${NOT_DRAWN_MAX} `
    + `already known -- a new row was added without its picture. Draw it (\`diagram\`), or it shows `
    + `"not drawn yet". The last in the file: ${notDrawn.slice(-3).map(r => r.row_id).join(', ')}`;
  fail.push(why);
  console.log('  ' + why);
} else if (notDrawn.length < NOT_DRAWN_MAX) {
  console.log(`   ${NOT_DRAWN_MAX - notDrawn.length} fewer than the ceiling -- lower NOT_DRAWN_MAX to ${notDrawn.length} to keep the gain.`);
}

/* ---------- ONE SPELLING OF A PART PER QUESTION § */
const spellBy_ = {};
rows.forEach(r => {
  if (!r || r.kind !== 'question' || !r.part) return;
  const p = String(r.part).trim();
  const how = /\(/.test(p) ? 'bracketed' : /^[a-z](i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i.test(p) ? 'bare' : '';
  if (!how) return;
  const k = String(r.paper_id) + ' Q' + String(r.question || '');
  (spellBy_[k] = spellBy_[k] || {})[how] = (spellBy_[k][how] || []).concat(p);
});
const mixedSpell_ = Object.keys(spellBy_).filter(k => spellBy_[k].bracketed && spellBy_[k].bare);
/* SAID AS WELL AS PUSHED, for the reason the tools count below gives: this is past where `fail` prints. */
mixedSpell_.forEach(k => {
  const why = `${k} spells its parts two ways — ${spellBy_[k].bracketed.join(', ')} beside `
    + `${spellBy_[k].bare.join(', ')}. Keep to one per question: a(i), a(ii) or ai, aii.`;
  fail.push(why);
  console.log('  ' + why);
});
console.log(`questions spelling their parts two ways (bi beside b(ii)): ${mixedSpell_.length}`);

/* ---------- EVERY PART SPLITS INTO ITS TAGS: Q1a(ii) IS [Q1] [a] [ii] (docs/history/355) § */
{
  /* SAID AS WELL AS PUSHED: this is past where `fail` prints, as the spelling rule above says. */
  const bad_ = why => { fail.push(why); console.log('  ' + why); };
  const need_ = ['partSplit_', 'partNumerals_', 'paperIdOf_'].map(n => cutFrom(findSrc_, n));
  const line_ = n => (findSrc_.match(new RegExp('^const ' + n + ' = .*$', 'm')) || [''])[0];
  const consts_ = ['ROMAN_ONLY', 'NUM_ROMAN', 'partBare_'].map(line_);
  if (need_.some(c => !c) || consts_.some(c => !c)) {
    bad_('partSplit_, partNumerals_, paperIdOf_, ROMAN_ONLY, NUM_ROMAN or partBare_ is not in find.js — renamed? The parts were NOT split.');
  } else {
    const api_ = new Function(consts_.join('\n') + '\n' + need_.join('\n') + '\nreturn { partSplit_, partNumerals_ };')();
    const qRows_ = rows.filter(r => r && r.kind === 'question').map(r => ({ paper_id: r.paper_id, q: r.question, part: r.part, kind: r.kind, row_id: r.row_id }));
    const numerals_ = api_.partNumerals_(qRows_);
    const shapes_ = {}, unsplit_ = [];
    qRows_.forEach(r => {
      if (!String(r.part || '').trim()) return;
      const sp = api_.partSplit_(r.part, numerals_.get(r));
      if (!sp) { unsplit_.push(r.row_id + ' "' + r.part + '"'); return; }
      const k = (sp.part ? (sp.part[0] === '.' ? 'digit' : 'letter') : '') + (sp.part && sp.sub ? ' + ' : '') + (sp.sub ? 'numeral' : '');
      shapes_[k] = (shapes_[k] || 0) + 1;
    });
    if (unsplit_.length) bad_(unsplit_.length + ' part(s) do not split into a Part and a Sub-part tag: ' + unsplit_.slice(0, 8).join(', '));
    const q4i_ = qRows_.filter(r => r.paper_id === 'W-CBM-time' && String(r.q) === '4' && String(r.part).trim() === 'i');
    if (!q4i_.length) bad_('W-CBM-time Q4 (i) is not in the library — the lettered-i trap was NOT checked');
    q4i_.forEach(r => {
      const sp = api_.partSplit_(r.part, numerals_.get(r)) || {};
      if (sp.part !== 'i' || sp.sub) bad_(r.row_id + ': W-CBM-time Q4 runs a to j, so its "i" is the letter [i], not the numeral -- it split as ' + JSON.stringify(sp));
    });
    console.log('parts split into tags: ' + Object.keys(shapes_).sort().map(k => k + ' ' + shapes_[k]).join(', ')
      + (unsplit_.length ? ', unsplittable ' + unsplit_.length : ', none unsplittable'));
  }
}

console.log(`rows saying where the paper prints their figure (<!--fig-->): ${marked}`
  + `   (the rest stand it in front of the ask -- a pen question too since 337, its pen on the card)`);
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
