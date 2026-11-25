/* A NUMBER OR SUM SAID IN WORDS (920 qengine): "fifteen" is 15, "two x plus one" is 2 x + 1; null when no word was a number or an operation. */
const MARK_NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const MARK_TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const MARK_OP_WORDS = { plus: '+', add: '+', minus: '-', take: '-', times: '*', over: '/', squared: '^2', cubed: '^3', equals: '=' };
function markSpoken_(s) {
  const out = [];
  let n = null, said = false;
  const end = () => { if (n !== null) { out.push(String(n.total + n.part)); n = null; } };
  String(s == null ? '' : s).toLowerCase().replace(/-/g, ' ').split(/\s+/).filter(Boolean).forEach(w => {
    const u = MARK_NUM_WORDS.indexOf(w), t = MARK_TENS[w];
    if (u >= 0 || t) { n = n || { total: 0, part: 0 }; n.part += u >= 0 ? u : t; said = true; return; }
    if (n && w === 'hundred') { n.part *= 100; return; }
    if (n && w === 'thousand') { n.total += n.part * 1000; n.part = 0; return; }
    if (n && w === 'and') return;
    end();
    if (MARK_OP_WORDS[w]) { out.push(MARK_OP_WORDS[w]); said = true; } else out.push(w);
  });
  end();
  return said ? out.join(' ') : null;
}

/* ---------- A WORDED ANSWER OF A MARK OR TWO, MARKED BY RULE BEFORE ANY AI (359) */
/* `mark_words`: points split by `;`, a mark each; ways by `|`; words that must all be there joined by `+`; a number is compared as a number. § */
const MW_STOP = /^(the|a|an|of|to|is|it|and|or|in|on|be|as|so|by|at|for)$/;
function mwStem_(w) {
  /* a full stop ends the sentence, not the word: "No." is "no" and "the same." is "same" */
  let s = String(w || '').toLowerCase().replace(/[^a-z0-9.]/g, '').replace(/\.+$/, '');
  if (/^-?\d/.test(s)) return s;
  const cut = s.replace(/(ations?|ings?|edly|ed|es|ly|er|est|s)$/, '');
  return cut.length >= 3 ? cut : s;
}
function mwToks_(t) {
  /* "No, the powers ...": a No stopped by its punctuation is the verdict, and must not negate the next word */
  return String(t || '').toLowerCase().replace(/^\s*no\s*[,.:;!\u2013\u2014]+/, 'no verdict ').replace(/['\u2019]/g, '').replace(/(\d),(?=\d{3}\b)/g, '$1').replace(/[^a-z0-9.\s-]/g, ' ')
    .split(/[\s-]+/).filter(Boolean).map(mwStem_).filter(Boolean);
}
/* A PAIR, A VECTOR AND A LINE READ WITH THEIR SIGNS (385), one token each beside the words: `(5, -4)`, `(5/-4)`, `⟮5,-4⟯`,
   "5 right 4 down" are `pr5nm4`; `x = -2` is `lnxm2`, `y = -x` `lnymx` */
const mwNum_ = n => (+n < 0 ? 'm' : '') + String(Math.abs(+n));
function mwShapes_(t) {
  const s = String(t || '').toLowerCase().replace(/[\u2212\u2013]/g, '-').replace(/&minus;/g, '-');
  const out = [], N = '(-?\\d+(?:\\.\\d+)?)';
  const pair = (a, b) => out.push('pr' + mwNum_(a) + 'n' + mwNum_(b));
  s.replace(new RegExp('[(\u27ee]\\s*' + N + '\\s*(?:[,/]\\s*|\\s(?=\\s*-?\\d))' + N + '\\s*[)\u27ef]', 'g'), (m, a, b) => pair(a, b));
  const mv = { right: [1, 0], left: [-1, 0], up: [0, 1], down: [0, -1] };
  const steps = [];
  s.replace(/(\d+(?:\.\d+)?)\s*(?:squares?|units?)?\s*(?:to\s+the\s+)?(right|left|up|down)\b|\b(right|left|up|down)\s*(\d+(?:\.\d+)?)/g, (m, n1, d1, d2, n2) => { steps.push([mv[d1 || d2], +(n1 || n2)]); });
  if (steps.length) { let x = 0, y = 0; steps.forEach(([d, n]) => { x += d[0] * n; y += d[1] * n; }); pair(x, y); }
  s.replace(new RegExp('\\b([xy])\\s*=\\s*(-?)\\s*(x|y|\\d+(?:\\.\\d+)?)\\b', 'g'), (m, v, sg, w) => out.push('ln' + v + (/[xy]/.test(w) ? (sg ? 'm' : '') + w : mwNum_(sg + w))));
  s.replace(/\b([xy])[\s-]*axis\b/g, (m, v) => out.push('ln' + (v === 'x' ? 'y' : 'x') + '0'));
  return out;
}
function mwHas_(toks, term) {
  const sh = /^\s*(\(.*\)|[xy]\s*=.*)\s*$/.test(term) ? mwShapes_(term) : [];
  if (sh.length) return toks.indexOf(sh[0]) !== -1;
  const want = mwToks_(term).filter(w => !MW_STOP.test(w));
  if (!want.length) return false;
  for (let i = 0; i + want.length <= toks.length; i++) {
    let b = i - 1;
    while (b >= 0 && MW_STOP.test(toks[b])) b--;
    if (b >= 0 && /^(not|no|never|isnt|wasnt)$/.test(toks[b])) continue;
    if (want.every((w, j) => toks[i + j] === w || (/^-?[\d.]+$/.test(w) && parseFloat(toks[i + j]) === parseFloat(w)))) return true;
  }
  return false;
}
/* `{ got, of }`, or null for nothing typed. */
function markWords_(typed, rule) {
  if (!String(typed || '').trim()) return null;
  const toks = mwToks_(typed).concat(mwShapes_(typed));
  const points = String(rule || '').split(';').map(p => p.trim()).filter(Boolean);
  const got = points.filter(p => p.split('|').some(way => way.split('+').every(term => mwHas_(toks, term)))).length;
  return { got: got, of: points.length };
}

/* ---------- A GRID OR TABLE WITH BLANKS IS ANSWERED IN THE ONE BOX, ITS PARTS IN ORDER (359; owner, 22 Nov) */
/* `cells` READ: one entry a blank, in reading order -- `{ label, ways }`, and `ways` empty for a blank not asked. */
const CELL_ENT = { amp: '&', nbsp: ' ', rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c', apos: "'", quot: '"', deg: '\u00b0',
  minus: '\u2212', times: '\u00d7', divide: '\u00f7', ndash: '\u2013', mdash: '\u2014', hellip: '\u2026', pound: '\u00a3', micro: '\u00b5', plusmn: '\u00b1', lt: '<', gt: '>' };
function cellsOf_(x) {
  /* an HTML entity (`&rsquo;`) is its character first, so its `;` never splits a blank; a label is up to 60 characters (17 Nov) */
  const raw = String((x && x.cells) || '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === '#'
    ? String.fromCodePoint(parseInt(e.slice(e[1] === 'x' || e[1] === 'X' ? 2 : 1), e[1] === 'x' || e[1] === 'X' ? 16 : 10))
    : (CELL_ENT[e.toLowerCase()] || m)).trim();
  if (!raw) return [];
  return raw.split(';').map((c, i) => {
    const m = /^\s*([^=|]{1,60}?)\s*=\s*(.*)$/.exec(c);
    const ways = (m ? m[2] : c).trim();
    return { label: m ? m[1].trim() : String(i + 1), ways: ways === '-' ? '' : ways };
  });
}
/* EVERY GAP TYPED IN ONE BOX (owner, 13 Nov): read however the child parts them -- `;` `,` `/` new lines "and" "then", numbered or not -- first answer, first gap. */
function cellsOneBox_(vals, cells) {
  const v = vals || [], asked = cells.filter(c => c.ways);
  if (!asked.length || v.slice(1).some(s => String(s || '').trim()) || !String(v[0] || '').trim()) return v;
  const got = gapsSplit_(String(v[0]), asked);
  let n = 0;
  return cells.map(c => (c.ways ? got[n++] || '' : ''));
}
/* NUMBERING IN FRONT ("1) x 2) y", "(a) x", "a x b y") parts answers only as a run from the start counting up; a bare number never does. */
const GAP_RUNS = [['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'], ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'],
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']];
function gapsUnnumber_(s) {
  for (const run of GAP_RUNS) {
    const bare = run[0] === 'a';
    let at = 0, out = '', i = 0;
    for (; i < run.length; i++) {
      const re = new RegExp('(?:^|[\\s,;/])\\(?' + run[i] + (bare ? '(?:\\)|[.:](?=\\s)|(?=\\s))' : '(?:\\)|[.:](?=\\s))') + '\\s*', 'ig');
      re.lastIndex = at;
      const m = re.exec(s);
      if (!m || (i === 0 && m.index !== 0)) break;
      out += s.slice(at, m.index) + (i ? '\n' : '');
      at = m.index + m[0].length;
    }
    if (i >= 2) return out + s.slice(at);
  }
  return s;
}
/* A GAP'S OWN NAME IN FRONT ("Top = pentagon") and stray punctuation round an answer come off. */
const gapClean_ = (p, c) => { let s = String(p).trim();
  if (c && c.label && !/^\d+$/.test(c.label)) s = s.replace(new RegExp('^\\(?' + c.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\)?\\s*[=:]\\s*', 'i'), '');
  return s.replace(/^[\s,;:!?"'‘’“”]+|[\s,;:!?."'‘’“”]+$/g, ''); };
/* THE FINEST CUT, as [start, end] spans; at a plain space too only where every way of every gap is one word. */
function gapSpans_(s, spaces) {
  const re = new RegExp('\\s*(?:[\\n;,/|&]|\\b(?:and\\s+then|and|then)\\b)\\s*' + (spaces ? '|\\s+' : ''), 'gi');
  const out = [];
  let at = 0, m;
  while ((m = re.exec(s))) { if (!m[0]) { re.lastIndex++; continue; } if (m.index > at) out.push([at, m.index]); at = m.index + m[0].length; }
  if (at < s.length) out.push([at, s.length]);
  return out.filter(([a, b]) => gapClean_(s.slice(a, b)));
}
/* PIECES JOINED BACK where the cut fell inside one answer ("3,000", "1/2", "bread and butter"): kept in order, the grouping that marks most right. */
function gapsFit_(s, spans, gaps) {
  const n = gaps.length, m = spans.length, text = (a, b) => s.slice(spans[a][0], spans[b - 1][1]);
  if (m <= n || m > 30) return gaps.map((c, j) => (j < m ? gapClean_(m > n && j === n - 1 ? text(j, m) : text(j, j + 1), c) : ''));
  const best = [], from = [];
  for (let i = 0; i <= m; i++) { best.push(new Array(n + 1).fill(-1)); from.push(new Array(n + 1).fill(0)); }
  best[0][0] = 0;
  for (let j = 1; j <= n; j++) for (let i = j; i <= m - (n - j); i++) for (let a = j - 1; a < i; a++) {
    if (best[a][j - 1] < 0) continue;
    const sc = best[a][j - 1] + (markAnswer_(gapClean_(text(a, i), gaps[j - 1]), gaps[j - 1].ways) === true ? 1 : 0);
    if (sc > best[i][j]) { best[i][j] = sc; from[i][j] = a; }
  }
  const out = [];
  for (let j = n, i = m; j >= 1; j--) { const a = from[i][j]; out.unshift(gapClean_(text(a, i), gaps[j - 1])); i = a; }
  return out;
}
/* ONE BOX'S TEXT AS ITS GAPS' ANSWERS, in order: the separators read, then plain spaces too when every answer is one word, whichever marks more. */
function gapsSplit_(raw, gaps) {
  const s = gapsUnnumber_(String(raw || '').replace(/\r/g, '').trim());
  const oneWord = gaps.every(c => String(c.ways).split('|').every(w => !/\S\s+\S/.test(w.trim())));
  const score = v => v.filter((p, j) => markAnswer_(p, gaps[j].ways) === true).length;
  return [false].concat(oneWord ? [true] : []).map(sp => gapsFit_(s, gapSpans_(s, sp), gaps)).reduce((a, b) => (score(b) > score(a) ? b : a));
}
/* EACH CELL MARKED ON ITS OWN by `markAnswer_`: `{ right, of, each }`, `each[i]` true, false, or null for nothing typed; one box's text is read as every gap. */
/* THE ORDER RULE, ONE FOR EVERY TABLE, read from the table's own structure, never per question (owner, 23 Nov):
   a row the child writes whole -- no given cell in it: "list all the outcomes", a sample space, a frequency table they build, blank row
   headers -- is one of an unordered list, so two or more such rows match the key's rows in any order (a multiset of rows); the same for
   two or more columns written whole; every other blank is tied to a given row or column header and is marked by its place.
   `{ by: 'rows' | 'cols' | 'place', table, groups }`: `groups` the cells (indices into `cells`) of each free row or column. */
function cellsOrder_(x) {
  const cells = cellsOf_(x), r = (x && x.row) || x || {};
  const p = qtCellPlaces_(String(r.lead || '') + String(r.html || ''), cells);
  if (!p) return { by: 'place', table: '', groups: [], places: null };
  /* a row or column is written whole when every cell in it is a box (two or more cells); only the blanks' own table can have one */
  const box = new Map(p.at.map((i, k) => [i, k]).filter(([i]) => i >= 0));
  const lines = key => {
    const m = new Map();
    p.tds.forEach((d, i) => { const g = d[key]; if (!m.has(g)) m.set(g, []); m.get(g).push(i); });
    return [...m.values()].filter(l => l.length >= 2 && l.every(i => box.has(i))).map(l => l.map(i => box.get(i)));
  };
  const out = by => ({ by, table: p.table, groups: by === 'place' ? [] : lines(by === 'rows' ? 'r' : 'c'), places: p });
  if (p.by !== 'blanks') return out('place');
  if (lines('r').length >= 2) return out('rows');
  if (lines('c').length >= 2) return out('cols');
  return out('place');
}
function markCells_(vals, cells, opt, order) {
  /* A BOX A CELL IS ONE VALUE (owner, 23 Nov): an array a cell each is never re-split -- a fraction key's (1)/(12) is one value, not two cells at its slash;
     only a single typed string (an answer saved before 23 Nov) is parted into the cells */
  vals = Array.isArray(vals) && vals.length === cells.length && cells.length > 1 ? vals.map(v => String(v == null ? '' : v)) : cellsOneBox_(typeof vals === 'string' ? [vals] : vals, cells);
  /* a gap's typo is forgiven unless it is near another gap's answer (the word bank) */
  const gapOpt = i => ({ strict: !!(opt && opt.strict), others: ((opt && opt.others) || []).concat(cells.filter((c, j) => j !== i && c.ways).map(c => c.ways)) });
  const one = (v, i) => !!markAnswer_(v || '', cells[i].ways, false, gapOpt(i));
  const each = cells.map((c, i) => (c.ways ? markAnswer_(vals[i] || '', c.ways, false, gapOpt(i)) : undefined));
  /* AN UNORDERED LIST OF ROWS (or columns): each typed row given the key's row it fits best, whole rows first, each key row once */
  const groups = (order && order.groups) || [];
  if (groups.length >= 2) {
    const score = (a, b) => a.reduce((s, n, c) => s + (cells[b[c]] && cells[b[c]].ways && one(vals[n], b[c]) ? 1 : 0), 0);
    const pairs = [];
    groups.forEach((a, i) => groups.forEach((b, j) => { if (a.length === b.length) pairs.push([score(a, b), i === j ? 1 : 0, i, j]); }));
    pairs.sort((p, q) => q[0] - p[0] || q[1] - p[1]);
    const usedA = new Set(), usedB = new Set();
    for (const [, , i, j] of pairs) {
      if (usedA.has(i) || usedB.has(j)) continue;
      usedA.add(i); usedB.add(j);
      groups[i].forEach((n, c) => { const k = groups[j][c]; each[n] = cells[n].ways ? (cells[k].ways ? one(vals[n], k) : false) : undefined; });
    }
  }
  const asked = each.filter(v => v !== undefined);
  return { right: asked.filter(v => v === true).length, of: asked.length, each: each, by: (order && order.by) || 'place' };
}
/* A PART OF AN ANSWER BOX, drawn by renderCard's group block: its tag, class, attributes, then markup already drawn and/or text. */
const fcG_ = (tag, look, attrs, inner, text) => cardBlock_({ type: 'group', tag, look, attrs, inner, text });
const fcVerdict_ = t => fcG_('span', 'qp-verdict', { role: 'status', 'aria-live': 'polite' }, '', t);
const fcSaved_ = k => fcG_('span', 'qp-saved', { 'data-k': k }, '', ansSavedSay_(k));
/* ---------- FILL A TABLE IS TYPED (owner, 23 Nov): each empty cell is the one answer box, its keypad's keys from that cell's own answer,
   tapped in any order; the table drawn is exactly what is marked -- the question's own table with its blanks made boxes, or, where the
   question shows none, a table of its own, a row an entry. Marked a cell at a time by the one marker (`markCells_`, its order rule). */
const cellsVals_ = (v, cells) => { const s = String(v == null ? '' : v); return / ; /.test(s) || !s.trim() ? s.split(' ; ') : cellsOneBox_([s], cells); };
const cellsFirstWay_ = c => String(c.ways || '').split('|').map(w => w.trim()).find(w => w && !/^rule:/i.test(w)) || '';
function cellsCellBox_(k, c, i, v, acc, key) {
  const maths = kpMathsy_(cellsFirstWay_(c));
  return fcG_('label', 'qp-ans qp-cell-ans' + (maths ? ' qp-ans-maths' : '') + (key ? ' is-key' : ''), key ? null : { 'data-accept': acc || c.ways },
    kpField_(key ? '' : k, v || '', maths ? 'maths' : 'words', 3, (key ? 'Answer, blank ' : 'Blank ') + c.label,
      key ? ANS_KEY_IN : { class: 'qp-ans-in kp-in qp-cell', 'data-do': 'qp-cell', 'data-n': String(i) }));
}
/* THE TABLE OF BOXES: the question's own, its blanks (or the labels in them) made boxes; else one of its own */
function cellsTable_(x, key) {
  const cells = cellsOf_(x), k = ansKey_(x), vals = key ? [] : cellsVals_(ansRead_(k), cells), o = cellsOrder_(x), p = o.places;
  /* THE KEY'S TABLE (`key`): the same table, each cell's first way in its place -- the shown answer (cellsKeyTable_) */
  /* THE KEY'S CELL IS THE CHILD'S BOX, read-only, its key typed in it (owner, 23 Nov: "uniformalize the answers") */
  const put_ = (c, n, a) => (key ? cellsCellBox_(k, c, n, cellsFirstWay_(c), a, true) : cellsCellBox_(k, c, n, vals[n], a));
  if (p) {
    let t = p.table;
    const put = p.at.map((i, n) => [i, n]).filter(([i]) => i >= 0).sort((a, b) => b[0] - a[0]);
    /* A CELL OF AN UNORDERED ROW can hold any row's answer in its column: its keypad has the keys of them all */
    const acc = new Map();
    o.groups.forEach(g => g.forEach((n, c) => acc.set(n, [...new Set(o.groups.map(h => cells[h[c]] && cells[h[c]].ways).filter(Boolean))].join(' | '))));
    for (const [i, n] of put) {
      const d = p.tds[i], box = put_(cells[n], n, acc.get(n));
      const open = t.slice(d.at, d.at + d.open), inner = t.slice(d.at + d.open, d.end - 5);
      const tag = /\bclass="/.test(open) ? open.replace(/\bclass="/, 'class="qp-cell-at ') : open.replace(/^<(td|th)/, '<$1 class="qp-cell-at"');
      const fill = p.token[n] ? inner.replace(/<[^>]*>/g, '').replace(p.token[n], '\u0000').replace(/\u0000/, box) : box;
      t = t.slice(0, d.at) + tag + fill + t.slice(d.end - 5);
    }
    return t.replace(/^<table[^>]*>/, '<table class="qp-cells" data-order="' + o.by + '">');
  }
  const named = c => !/^\d+$/.test(c.label);
  return '<table class="qp-cells qp-cells-own" data-order="place"><tbody>' + cells.map((c, n) => (c.ways
    ? '<tr><th scope="row">' + esc(named(c) ? c.label : String(n + 1)) + '</th><td class="qp-cell-at">' + put_(c, n) + '</td></tr>' : '')).join('') + '</tbody></table>';
}
/* THE SHOWN ANSWER OF A TABLE (owner, 23 Nov): the table itself, each cell's key in place, drawn as the child's answer is */
const cellsKeyTable_ = x => cellsTable_(x, true);
/* THE ONE LINE OVER THE TABLE: what is marked, and whether its rows (or columns) may come in any order */
const cellsHint_ = by => by === 'rows' ? 'Fill in every empty cell — the rows can go in any order'
  : by === 'cols' ? 'Fill in every empty cell — the columns can go in any order' : 'Fill in every empty cell';
function cellsBox_(x, key) {
  const k = ansKey_(x), o = cellsOrder_(x);
  if (key) return fcG_('div', 'qp-mark qp-compose qp-cells-box qp-key', null, fcG_('p', 'q-hint', null, '', 'Answer')
    + fcG_('div', 'qp-cells-wrap q-tscroll', null, cellsTable_(x, true)) + ansKeyNote_(x, '', true));
  const said = subBoxSay_(k, String(ansRead_(k) || ''));
  return fcG_('div', 'qp-mark qp-compose qp-cells-box' + (said.cls ? ' ' + said.cls : ''), { 'data-k': k },
    fcG_('p', 'q-hint', null, '', cellsHint_(o.by)) + sheet_(x, '', fcG_('div', 'qp-cells-wrap q-tscroll', null, cellsTable_(x)))
    + fcVerdict_(said.text) + fcSaved_(k));
}
/* THE QUESTION'S OWN TABLE IS DRAWN ONCE: in the box, its blanks boxes -- so the words above leave it out */
function cellsHere_(x, html) {
  const cells = cellsOf_(x);
  if (!cells.length || !cellsOrder_(x).places) return html;
  const p = qtCellPlaces_(html, cells);
  return p ? String(html).replace(p.table, '') : html;
}
const cellsIn_ = box => [].slice.call(box ? box.querySelectorAll('.qp-cell') : []);
function cellsRead_(box, cells) {
  const vals = cells.map(() => '');
  cellsIn_(box).forEach(c => { vals[+c.getAttribute('data-n')] = c.value || ''; });
  return vals;
}
/* SAVED AS IT IS TYPED, the cells together, "a ; b ; c" -- the stored form every saved answer already has */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-cell"]');
  const box = el && el.closest('.qp-cells-box');
  if (!box) return;
  const x = stuffItemsAll_().find(it => ansKey_(it) === box.getAttribute('data-k'));
  if (!x) return;
  ansStore_(box.getAttribute('data-k'), cellsRead_(box, cellsOf_(x)).join(' ; '), true);
  box.classList.remove('is-right', 'is-near');
  const lab = el.closest('.qp-cell-ans');
  if (lab) lab.classList.remove('is-right', 'is-near');
});
document.addEventListener('focusout', e => {
  if (e.target && e.target.closest && e.target.closest('[data-do="qp-cell"]') && typeof answersPush_ === 'function') answersPush_(true);
});
on('qp-cells-check', el => {
  const box = qMark_(el, '.qp-cells-box');
  const out = box && box.querySelector('.qp-verdict');
  const x = box && stuffItemsAll_().find(it => ansKey_(it) === box.getAttribute('data-k'));
  if (!x || !out) return;
  const cells = cellsOf_(x), vals = cellsRead_(box, cells);
  const v = mark_(x, vals, 'cells'), m = { right: v.marks, of: v.outOf, each: v.each || [] };
  cellsIn_(box).forEach(c => {
    const lab = c.closest('.qp-cell-ans'), r = m.each[+c.getAttribute('data-n')];
    if (lab) { lab.classList.toggle('is-right', r === true); lab.classList.toggle('is-near', r === false); }
  });
  box.classList.remove('is-right', 'is-near');
  const notYet = partReady_('cells', m);
  if (notYet) { tell_(out, 'info', notYet); return; }
  const all = m.right === m.of;
  box.classList.add(all ? 'is-right' : 'is-near');
  tell_(out, all ? 'saved' : 'info', all ? text_('correct-every') + 'cell' : m.right + ' of ' + m.of + ' cells right');
  ansStore_(box.getAttribute('data-k'), vals.join(' ; '), true);
  subRecord_(box.getAttribute('data-k'), vals.join(' ; '), all ? 'right' : 'wrong');
});

/* A TILE'S ANSWER BOX: the box is in the card's sheet and its Check in the card's one tile row (rule 1.26), so a tile asks its card. */
function qMark_(el, sel) {
  const s = sel || '.qp-mark', own = el && el.closest && el.closest(s);
  if (own) return own;
  const card = el && el.closest && el.closest('.qcard');
  return card ? card.querySelector(s) : null;
}
/* ---------- THE ANSWER IS THE SAME BOX (owner, 23 Nov: "uniformalize the way the answers work compared to the questions"): `key` draws the
   question's own answer box read-only, the right answer in it, the note under it -- one drawing for the child's answer and the shown one. */
const ANS_KEY_IN = { class: 'qp-ans-in kp-in qp-key-in', 'data-do': null, 'data-k': null, disabled: true, inputmode: null };
const ansPlain_ = h => String(h == null ? '' : h).replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>\s*<p[^>]*>/gi, '\n').replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&times;/g, '\u00d7').replace(/&divide;/g, '\u00f7').replace(/&minus;/g, '\u2212').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
/* WHAT GOES IN THE BOX: a pick's key letters; a typed part what it accepts first; else the scheme's head. */
function ansKeyVal_(x) {
  const opts = Array.isArray(x.choices) ? x.choices : [], ks = (x.choiceRight || []).filter(k => k > 0 && k <= opts.length);
  if (ks.length && opts.length >= 2) return ks.map(k => CHOICE_LETTERS[k - 1]).join(', ');
  const acc = String(x.accept || '').split('|').map(w => w.trim()).find(w => w && !/^rule:/i.test(w));
  if (acc) return ansPlain_(acc);
  return String(x.answer || '').trim() ? ansPlain_(answerParts_(x.answer).head) : '';
}
/* THE NOTE UNDER IT: what the answer says beyond the box (a pick's words, the scheme's head and why), never the box again. */
function ansKeyNote_(x, inBox, table) {
  const said = table || typeof answerSay_ !== 'function' ? '' : answerSay_(x.answer, x.choices, x.choiceRight, orderIs_(x));
  const why = String(x.answer || '').trim() ? answerParts_(x.answer).why : '';
  const bits = [said, why].filter(b => b && ansPlain_(b) && ansPlain_(b) !== inBox);
  return bits.length ? fcG_('p', 'qp-fb qans-note', null, typeset_(bits.join(' \u2014 '))) : '';
}
/* THE FACE IS THE ONE SOURCE'S (qtypes.js `qtFace_`, owner 20 Nov): one box for every question (22 Nov). */
function ansBox_(x, key) {
  const face = qtFace_(x);
  if (face.cells) return cellsBox_(x, key);
  if (key) {
    const v = ansKeyVal_(x), essay = !!(ansEssay_(x) || face.sheet);
    const field = kpField_('', v, essay ? 'essay' : ansMaths_(x) ? 'maths' : 'words', 3, 'The answer', ANS_KEY_IN);
    return fcG_('div', 'qp-mark qp-compose qp-key' + (essay ? ' qp-essay' : ''), null, (essay ? '' : choiceList_(x))
      + (essay ? fcG_('label', 'qp-ans qp-sheet is-key', null, field) : fcG_('div', 'qp-ans-row qp-bar', null, fcG_('label', 'qp-ans is-key' + (ansMaths_(x) ? ' qp-ans-maths' : ''), null, field)))
      + ansKeyNote_(x, v));
  }
  const opts = choiceList_(x);
  const k = ansKey_(x);
  const m = markerOf_(x);
  const can = m.kind === 'accept' ? String(x.accept || '').trim() : '';
  const rule = m.kind === 'words' ? String(x.markWords || '').trim() : '';
  const geo = m.kind === 'draw' ? String(x.drawAnswer || '').trim() : '';
  /* ONE KEYPAD THAT TYPES ANYTHING (keypad.js): the answer's shape only picks the layer it opens on */
  const maths = ansMaths_(x);
  const val = ansRead_(k);
  /* A DRAWN ANSWER IS MARKED HERE TOO, by its geometry (366): the row carries the pad's key for `padCheck_` */
  const drawAt = geo ? { 'data-k': k, 'data-pad': padKey_(x), 'data-draw': geo, 'data-marks': String(Number(x.marks) || '') } : {};
  /* NO EXACT KEY, NO MARK (owner, 16 Nov): the part saves its work; feedback an earlier AI mark left is still shown under it (`qp-fb`) */
  const kept = !markSchemeOf_(x).length;
  const cls = 'qp-mark qp-compose' + (kept ? ' qp-keep' : '') + (geo ? ' qpad-send' : '');
  const dataAt = Object.assign(can ? { 'data-accept': can } : {}, rule ? { 'data-rule': rule, 'data-marks': String(Number(x.marks) || '') } : {}, drawAt);
  const fb = why => (kept && why ? fcG_('p', 'qp-fb', null, '', why) : '');
  /* THE ONE SHEET (owner, 24 Nov): every part answered on it -- its picture printed at the top, then its lines; keys type on the lines, touch draws */
  const essay = ansEssay_(x) || face.sheet;
  const typed = kpField_(k, val, essay ? 'essay' : maths ? 'maths' : 'words', 3, null, essay ? null : choiceKeysAt_(x));
  const said = geo ? subBoxSay_(k, padSay_(padRead_(padKey_(x)))) : subBoxSay_(k, val);
  return fcG_('div', cls + (essay ? ' qp-essay' : '') + (said.cls ? ' ' + said.cls : ''), dataAt,
    opts + sheet_(x, typed, sheetPrint_(x)) + (essay ? fcG_('p', 'qp-words', null, '', kpWordsSay_(val)) : '')
    + fcVerdict_(geo ? padSaid_(said.text) : said.text) + fcSaved_(k)) + fb(said.text ? said.why : '');
}
/* ---------- THE ONE ANSWER SHEET (owner, 24 Nov: "one answer sheet, the same for every question part, so nothing changes shape under a child").
   One lined paper surface on the one drawing layer (the pad), its height its lines; what the part prints on it (a picture to draw on, a table to fill)
   at its top. The one keyboard types on its lines (a table's: its empty cells, in reading order); a touch on it only ever draws. No face, no swap. */
const SHEET_LINE = 28;
/* HOW MANY LINES, from the question's data: a table's working two, an essay a line a mark (6 to 16), any other a line a mark (1 to 4) */
function ansLines_(x) {
  const f = qtFace_(x), m = Math.round(Number((x && (x.marks || (x.row && x.row.marks))) || 1)) || 1;
  if (f.cells) return 2;
  if (ansEssay_(x) || f.sheet) return Math.max(6, Math.min(16, m));
  /* A PART THAT DRAWS gets room to draw: three lines at least; a typed-only part keeps its one */
  return Math.max(f.face === 'draw' ? 3 : 1, Math.min(4, m));
}
const sheetSvg_ = n => figDraw_({ el: 'svg', a: { class: 'qsurf is-lines', viewBox: '0 0 340 ' + n * SHEET_LINE, role: 'img', 'aria-label': 'Lined paper' },
  kids: Array.from({ length: n }, (_, i) => ({ el: 'line', a: { class: 'grid', x1: 0, y1: (i + 1) * SHEET_LINE - 1, x2: 340, y2: (i + 1) * SHEET_LINE - 1 } })) });
/* THE LINES' OWN PAD, under the part's key with `~sheet`: a picture's pad and the lines under it keep their marks apart (a drawn answer with no
   picture draws on its lines under its own key, where its Check reads it) */
const sheetItem_ = x => ({ key: x.key + '~sheet' });
/* WHAT IS PRINTED ON THE SHEET: the part's picture to draw on, as its pad (its marks under the part's own key, marked as before) */
function sheetPrint_(x) {
  const p = x && x.key ? padSource_(x) : null;
  /* ONE NOTE A SHEET, at its foot (the lines' pad's): the picture's own is left off */
  /* `qp-area`: the figure's own look (its grid, axes, numbers and marks in the ink, style.css), as it had on the card */
  return p ? fcG_('div', 'qp-sheet-print qp-area', { 'data-q': x.key }, padWrap_(x, p.svg, 'row').replace(/<p class="qpad-note"[^>]*>[\s\S]*?<\/p>/, '')) : '';
}
/* THE LINES' PAD: a drawn answer with no picture draws on them under its own key; any other part under `~sheet`. Marks made on the old
   paper face (`~paper`, gone 24 Nov) are moved onto it once, the first time it is drawn (`padAdopt_`: only into an empty pad). */
function sheetLinesItem_(x, print) {
  const it = !print && qtFace_(x).face === 'draw' ? x : sheetItem_(x);
  padAdopt_(padKey_(it), padKey_({ key: x.key + '~paper' }));
  return it;
}
function sheet_(x, typed, print) {
  const n = ansLines_(x);
  return fcG_('div', 'qp-sheet', { 'data-k': ansKey_(x), 'data-lines': String(n), style: '--sheet-lines: ' + n },
    (print || '') + fcG_('div', 'qp-sheet-lines', null, padWrap_(sheetLinesItem_(x, print), sheetSvg_(n), 'row')
      + (typed ? fcG_('label', 'qp-ans qp-sheet-type', { 'aria-label': text_('your-answer') }, typed) : '')));
}
/* WHERE THE KEYS GO ON A SHEET: its lines, or a table's first empty cell (else its first) */
function sheetInput_(sheet) {
  if (!sheet) return null;
  const t = sheet.querySelector('.qp-sheet-type .kp-in');
  if (t) return t;
  const cells = [].slice.call(sheet.querySelectorAll('.qp-cell'));
  return cells.find(c => !c.value) || cells[0] || null;
}
/* A TOUCH ON THE SHEET SCROLLS UNTIL A DRAWING TILE IS PICKED (owner, 24 Nov: the Pen tile on, the pen draws; tapped again, it is put down).
   A TAP (not a scroll) opens the keyboard on its lines once the touch is lifted: opened on the way down it moved the page under the finger. */
let SHEET_DOWN = null;
document.addEventListener('pointerdown', e => {
  const sheet = e.target && e.target.closest && e.target.closest('.qp-sheet');
  SHEET_DOWN = sheet ? { sheet, x: e.clientX, y: e.clientY } : null;
}, true);
['pointerup', 'pointercancel'].forEach(ev => document.addEventListener(ev, e => {
  const d = SHEET_DOWN;
  SHEET_DOWN = null;
  if (!d || ev === 'pointercancel' || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || !d.sheet.isConnected) return;
  /* NOT WHILE ITS PEN IS IN HAND: that touch was a mark */
  if (typeof PAD_ON !== 'undefined' && PAD_ON && d.sheet.querySelector('.qpad[data-k="' + PAD_ON.replace(/"/g, '') + '"]')) return;
  const inp = sheetInput_(d.sheet);
  if (inp && typeof KP_AT !== 'undefined' && KP_AT !== inp && typeof kpTake_ === 'function') kpTake_(inp);
}, true));
/* A TABLE'S CELLS IN READING ORDER: <- at a cell's start goes to the one before, -> at its end (or done) to the next */
function sheetHop_(inp, cmd) {
  const sheet = inp && inp.classList && inp.classList.contains('qp-cell') && inp.closest('.qp-sheet');
  if (!sheet) return false;
  const cells = [].slice.call(sheet.querySelectorAll('.qp-cell')), i = cells.indexOf(inp);
  const a = inp.selectionStart, b = inp.selectionEnd, n = String(inp.value || '').length;
  const to = cmd === '!left' ? (a === 0 && b === 0 ? cells[i - 1] : null) : cmd === '!done' || (a === n && b === n) ? cells[i + 1] : null;
  if (!to) return false;
  kpTake_(to);
  return true;
}
/* WHAT A BOX'S VERDICT LINE SAYS AS IT IS DRAWN: the latest submission's verdict, if the box holds it. */
function subBoxSay_(k, val) {
  const latest = typeof subLatest_ === 'function' ? subLatest_(k) : null;
  return latest && latest.a === String(val == null ? '' : val) && typeof subSay_ === 'function'
    ? Object.assign({ why: latest.f || '' }, subSay_(latest.v)) : { text: '', cls: '', why: '' };
}

/* ---------- THE VERDICT, ONE PATH FOR EVERY TYPED PART (owner, 9 Nov): `mark_` against the scheme; a part with no rule is saved, `unmarked` (owner, 17 Nov). */
on('qp-check', (el) => {
  const box = qMark_(el);
  const card = el.closest('.qcard');
  /* ITS OWN BOX'S FIELD FIRST (508): a card with two boxes marked the first one's. */
  const inp = (box && box.querySelector('.qp-ans-in')) || (card && card.querySelector('.qp-ans-in'));
  const out = box && box.querySelector('.qp-verdict');
  if (!box || !inp || !out) return;
  const k = inp.getAttribute('data-k');
  const x = stuffItemsAll_().find(it => ansKey_(it) === k);
  /* ONE PRESS, ONE VERDICT: a mark still being made is not made again */
  if (box.classList.contains('is-busy') || el.disabled) return;
  box.classList.remove('is-right', 'is-near');
  if (partReady_('typed', inp.value)) { tell_(out, 'info', partReady_('typed', inp.value)); return; }
  const v = mark_(x || { accept: box.getAttribute('data-accept') || '' }, inp.value, x ? '' : 'accept');
  if (v.state === 'empty') { tell_(out, 'info', partReady_('typed', '')); return; }
  if (v.state === 'unmarked') { ACTIONS['qp-send'](el); return; }
  if (v.state === 'wait') { tell_(out, 'info', v.why); return; }
  const full = v.verdict === 'right', rules = markTierOf_(v.method) === 'rules';
  box.classList.add(full ? 'is-right' : 'is-near');
  /* PEEL and LEVELS: the level and mark, and under it which elements each box had or missed, or what lifts it to the next level (`qp-fb`, as a saved verdict draws it) */
  if (v.peel || v.levels) {
    tell_(out, full ? 'saved' : 'info', v.say);
    let fb = box.querySelector('.qp-fb') || (box.nextElementSibling && box.nextElementSibling.matches('.qp-fb') ? box.nextElementSibling : null);
    if (!fb) { fb = document.createElement('p'); fb.className = 'qp-fb'; box.appendChild(fb); }
    fb.textContent = v.why;
    subRecord_(k, inp.value, markWord_(v), undefined, v.why);
    return;
  }
  const marks = v.marks + ' of ' + v.outOf + ' ' + plural_(v.outOf, 'mark');
  tell_(out, full && v.method !== 'words' ? 'saved' : 'info', v.method === 'words' ? marks + ' · by key words' : rules ? marks : full ? (v.typo ? text_('correct-check-the-spelling') + v.typo + ')' : statusWord_(v)) : text_('not-yet-have-another-go'));
  /* MARKED IS A SUBMISSION, right or not yet (js/submit.js); signed out it is this visit's alone. */
  subRecord_(k, inp.value, markWord_(v));
});

/* ---------- SAVE, WHERE NOTHING CAN MARK IT (owner, 16 Nov): the typed answer as a `sent` submission, nothing else with it (photo marking is gone: owner, 22 Nov). */
on('qp-send', (el) => {
  const box = qMark_(el);
  const inp = box && box.querySelector('.qp-ans-in');
  const out = box && box.querySelector('.qp-verdict');
  if (!inp || !out || el.disabled) return;
  box.classList.remove('is-right', 'is-near');
  const k = inp.getAttribute('data-k');
  const notYet = partReady_('save', { typed: inp.value });
  if (notYet) { tell_(out, 'info', notYet); return; }
  const sent = subRecord_(k, inp.value, 'sent');
  /* LEVEL-MARKED (tools/validate-questions.js `tutor`): never a silent save -- the tutor marks it */
  const x = typeof qStatus_ === 'function' ? stuffItemsAll_().find(it => ansKey_(it) === k) : null;
  const tutor = !!x && qStatus_(x) === 'tutor';
  tell_(out, sent ? 'saved' : 'error', sent ? (box.classList.contains('qp-keep') ? text_('saved') : 'Sent') + (tutor ? ' \u2014 marked by your tutor' : '') : text_('sign-in-to-send-it'));
});

/* ---------- WHO IS WORKING § */

/* SAVED AS IT IS TYPED, through a delegated listener rather than a handler per box — there are thousands of these and only one of them is ever being typed into. § */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-ans"]');
  if (!el) return;
  /* THROUGH `ansStore_`, which keeps it on this device. § */
  ansStore_(el.getAttribute('data-k') || '', el.value || '', el.getAttribute('data-kp') === 'words');
  /* A WORDED ANSWER GROWS AS IT IS TYPED, the way a message bar does: § */
  if (el.tagName === 'TEXTAREA' && el.closest('.qp-sheet') && !el.classList.contains('kp-in')) {
    el.style.height = '';
    if (el.scrollHeight) el.style.height = el.scrollHeight + 'px';
  }
  /* A VERDICT IS ABOUT THE ANSWER IT MARKED, and the moment a letter changes it is about an answer that is no longer there. § */
  const mark = el.closest('.qp-mark');
  if (mark && typeof subVerdictPaint_ === 'function') subVerdictPaint_(mark, el);
});

/* SOME ANSWERS ARE A MARK ON THE PICTURE, AND A TEXTAREA CANNOT HOLD ONE. § */
/* ---------- AND THEY ARE WHOEVER IS SIGNED IN'S, AS THE TYPED ANSWER IS § */
const padItemKey_ = x => (x && (x.key || x.name)) || '?';
/* ---------- `pad:` IS A QUESTION'S, AND A PEN THAT IS NOT ON A QUESTION SAYS SO IN ITS KEY § */
const padPrefix_ = x => (x && x.prefix) || 'pad';
const padKey_ = x => padPrefix_(x) + ':' + (whoIs_() ? whoIs_() + ':' : '') + padItemKey_(x);
function padAdopt_(k, bare) {
  if (!k || !bare || k === bare) return;
  try {
    /* "EMPTY" IS ASKED OF THE WRITER'S OWN READER (`ansValue_`, answers.js), the visit's copy first. § */
    const read = typeof ansValue_ === 'function' ? ansValue_ : (x => keep_.get(x));
    if (read(k) !== null) return;
    const v = read(bare);
    if (v === null) return;
    /* NOR A DRAWING SOMEBODY ELSE MADE SIGNED OUT — `ansRead_`'s rule, asked of the same `ansMayMove_`
       (answers.js). Only into an empty pad, so any answer but "no" moves it. */
    if (typeof ansMayMove_ === 'function' && !ansMayMove_(bare, k)) return;
    /* THROUGH `ansStore_`, so the marks that became this person's go up to their account with the rest. */
    if (typeof ansStore_ === 'function') ansStore_(k, v); else keep_.put(k, v);
    /* AND OFF THE SIGNED-OUT KEY THROUGH THE WRITER: the store's copy, the visit's, and the mark. */
    if (typeof ansLocalPut_ === 'function') ansLocalPut_(bare, null); else keep_.del(bare);
  } catch (e) { /* storage blocked: the answer stays on the page only */ }
}

/* THE PICTURE IT DRAWS ON: § */
/* OPTIONS OR CELLS ARE THE ANSWER where a row has them (as before round 3): their pen waits for its first tap, so the card is not drawn smaller under a pen it may never use */
const padPicked_ = x => !!x && ((Array.isArray(x.choices) && x.choices.length >= 2) || (typeof cellsOf_ === 'function' && cellsOf_(x).length > 0));
/* KEPT ON THE CARD per library generation (930): `stuffPages_` asks it of every result, and each ask copied the whole row (`workRow_`) -- seconds on a phone. */
const padDrawn_ = x => {
  if (!x) return false;
  const g = typeof LIB === 'object' && LIB ? LIB.gen : 0;
  if (x._pdg !== g || x._pd === undefined) { x._pd = typeof qtDrawn_ === 'function' && typeof workRow_ === 'function' && !!qtDrawn_(workRow_(x)) && !padPicked_(x); x._pdg = g; }
  return x._pd; };
/* SOMETHING TO DRAW ON: a drawn answer, a surface the row names, its own figure or its stem's one. Nothing else opens a pen -- no blank working paper (owner, 29 Oct). */
function padHasArt_(x) {
  if (!x) return false;
  /* A SURFACE THE ROW NAMES counts though its answer is options or cells (a times-table grid to annotate): its Pen lays it */
  if (padDrawn_(x) || x.diagram || padSurface_(x)) return true;
  return (x.stems || []).filter(p => p && p.diagram).length === 1;
}
function padSource_(x) {
  if (!x || !padHasArt_(x)) return null;
  /* a passage to ring words in is the part's own surface; its Pen still opens a grid below it */
  const said = padSurface_(x), surf = said === 'text' || padPicked_(x) ? '' : said;
  const opened = !!x.key && typeof PEN_OPEN !== 'undefined' && (PEN_OPEN.has(x.key) || padHasInk_(x));
  if (said === 'text' && !opened) return null;
  /* A FIGURE IS ITS PAD FROM THE START (1020): opening the pen on a tap redrew the card, moving the stem and adding tiles */
  /* BUT NOT A PART ANSWERED IN CELLS (523): the diagram is never the answer box, so its figure stays a picture. */
  const fig = !cellsOf_(x).some(c => c.ways) && (!!x.diagram || padStemFirst_(x));
  if (!padDrawn_(x) && !surf && !opened && !fig) return null;
  if (said === 'text') return { svg: surfaceSvg_('grid'), from: 'surface', surface: 'grid' };
  if (x.diagram) return { svg: x.diagram, from: 'part' };
  const stems = (x.stems || []).filter(p => p && p.diagram);
  if (stems.length === 1) return { svg: stems[0].diagram, from: stems[0] };
  const kind = surf || 'grid';
  return { svg: surfaceSvg_(kind), from: 'surface', surface: kind };
}
/* THE FIRST PART UNDER A STEM'S ONE FIGURE draws on it from the start; the rest read it there, so it is drawn once, not once a part */
const padStemFirst_ = x => { const st = (x.stems || []).filter(p => p && p.diagram); if (st.length !== 1) return false;
  try { const f = ((questionParts_()[qId_(x)]) || []).find(y => (y.stems || []).indexOf(st[0]) !== -1); return !f || f.key === x.key; } catch (e) { return false; } };
/* MARKS ALREADY SAVED keep the pen open across a reload; asked of the raw store, never parsed, as it runs for every part. */
function padHasInk_(x) {
  if (!x || x.prefix || !x.key || !(typeof whoIs_ === 'function')) return false;
  try { const v = typeof ansValue_ === 'function' ? ansValue_(padKey_(x)) : null; return !!v && v !== '[]'; } catch (e) { return false; }
}

/* THROUGH `ansValue_`, THE WRITER'S OWN READER (js/answers.js), and not `localStorage` beside it. § */
function padRead_(k) {
  try {
    const raw = typeof ansValue_ === 'function' ? ansValue_(k) : keep_.get(k);
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v : [];
  } catch (e) { return []; }
}

/* A STROKE IS A POLYLINE AND THAT IS THE WHOLE FORMAT. § */
/* ---------- A FAST LINE IS DRAWN ROUND: CORNER-KEEPING CENTRIPETAL CATMULL-ROM (338) § */
const PAD_CORNER_DEG = 50;
const PAD_CURVE_MIN = 8;
const PAD_CORNER_COS = Math.cos(PAD_CORNER_DEG * Math.PI / 180);
/* A CONTROL POINT TO ONE DECIMAL, "12.3" or "12" -- whole units would bend a curve by up to half a unit. */
const padNum_ = v => String(Math.round(v * 10) / 10);
/* SEGMENTS a..b-1 OF A STROKE `st` (a flat list with no point repeated), with neighbours from the whole of it -- the one writer the stored path and the live § */
function padSegs_(st, k, a, b) {
  const m = st.length / 2;
  const X = i => st[2 * i], Y = i => k * st[2 * i + 1];
  const corner = i => {
    if (i <= 0 || i >= m - 1) return true;
    const ux = X(i) - X(i - 1), uy = Y(i) - Y(i - 1), vx = X(i + 1) - X(i), vy = Y(i + 1) - Y(i);
    return ux * vx + uy * vy <= PAD_CORNER_COS * Math.hypot(ux, uy) * Math.hypot(vx, vy);
  };
  let d = '', c0 = corner(a);
  for (let i = a; i < b; i++) {
    const c1 = corner(i + 1);
    const x0 = X(i), y0 = Y(i), x1 = X(i + 1), y1 = Y(i + 1);
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (len < PAD_CURVE_MIN || (c0 && c1)) d += 'L' + st[2 * i + 2] + ' ' + st[2 * i + 3];
    else {
      const d1 = Math.sqrt(len);
      let b1x, b1y, b2x, b2y;
      if (c0) { b1x = x0 + (x1 - x0) / 3; b1y = y0 + (y1 - y0) / 3; }
      else {
        const px = X(i - 1), py = Y(i - 1), d0 = Math.sqrt(Math.hypot(x0 - px, y0 - py));
        const q = 3 * d0 * (d0 + d1), w = 2 * d0 * d0 + 3 * d0 * d1 + d1 * d1;
        b1x = (d0 * d0 * x1 - d1 * d1 * px + w * x0) / q; b1y = (d0 * d0 * y1 - d1 * d1 * py + w * y0) / q;
      }
      if (c1) { b2x = x1 - (x1 - x0) / 3; b2y = y1 - (y1 - y0) / 3; }
      else {
        const nx = X(i + 2), ny = Y(i + 2), d2 = Math.sqrt(Math.hypot(nx - x1, ny - y1));
        const q = 3 * d2 * (d2 + d1), w = 2 * d2 * d2 + 3 * d2 * d1 + d1 * d1;
        b2x = (d2 * d2 * x0 - d1 * d1 * nx + w * x1) / q; b2y = (d2 * d2 * y0 - d1 * d1 * ny + w * y1) / q;
      }
      d += 'C' + padNum_(b1x) + ' ' + padNum_(b1y / k) + ' ' + padNum_(b2x) + ' ' + padNum_(b2y / k)
        + ' ' + st[2 * i + 2] + ' ' + st[2 * i + 3];
    }
    c0 = c1;
  }
  return d;
}
/* A STROKE AS A PATH. `k` is the pad's aspect (`data-aspect`, `padAspect_`); a wrong or missing one only changes how a curve bends, never where a point is. § */
const PAD_PATHS = new Map();
const PAD_PATHS_MAX = 4e6;    // characters, keys and paths together: about 8MB
let PAD_PATHS_SIZE = 0;
function padPath_(st, k, live) {
  const plain = () => {
    let d = '';
    for (let i = 0; i + 1 < st.length; i += 2) d += (i ? 'L' : 'M') + st[i] + ' ' + st[i + 1];
    /* A SINGLE TAP IS A DOT, and a dot is a real answer — "mark with a cross" starts as one, and a `<path>` with one point paints nothing at all. § */
    return st.length === 2 ? `M${st[0]} ${st[1]}L${st[0]} ${st[1]}` : d;
  };
  if (!Array.isArray(st) || st.length < 6 || st.length % 2) return plain();
  const q = k > 0 && isFinite(k) ? k : 1;
  const s = [];
  for (let i = 0; i < st.length; i += 2) {
    const x = st[i], y = st[i + 1];
    if (typeof x !== 'number' || typeof y !== 'number' || !isFinite(x) || !isFinite(y)) return plain();
    if (s.length && s[s.length - 2] === x && s[s.length - 1] === y) continue;
    s.push(x, y);
  }
  if (s.length < 6) return plain();
  /* EVERY VALUE IS A FINITE NUMBER HERE, so the key cannot mistake "12" for 12. */
  const key = live ? '' : q + '|' + st.join(',');
  if (key) { const was = PAD_PATHS.get(key); if (was !== undefined) return was; }
  const segs = padSegs_(s, q, 0, s.length / 2 - 1);
  const d = segs.indexOf('C') === -1 ? plain() : 'M' + s[0] + ' ' + s[1] + segs;
  if (key) {
    if (PAD_PATHS_SIZE + key.length + d.length > PAD_PATHS_MAX) { PAD_PATHS.clear(); PAD_PATHS_SIZE = 0; }
    PAD_PATHS.set(key, d);
    PAD_PATHS_SIZE += key.length + d.length;
  }
  return d;
}
/* THE PAD'S SHAPE, H/W OF ITS BOX: § */
function padAspect_(x, svg) {
  if (x && padPrefix_(x) === 'board') return Math.round(4 / 3 * 1e4) / 1e4;
  const m = /viewBox\s*=\s*["']\s*[-\d.eE+]+[\s,]+[-\d.eE+]+[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)/.exec(String(svg || ''));
  const w = m ? Number(m[1]) : 0, h = m ? Number(m[2]) : 0;
  return w > 0 && h > 0 && isFinite(w) && isFinite(h) ? Math.round(h / w * 1e4) / 1e4 : 1;
}
/* AND WHAT A PAD ELEMENT SAYS IT IS. */
const padAspectOf_ = pad => Number(pad && pad.getAttribute && pad.getAttribute('data-aspect')) || 1;

/* ---------- EVERY PAD HOLDS EVERY INSTRUMENT (round 3), chosen from the part's one tool row (qtools.js), never from its words. */
const PAD_TOOLS = ['pen', 'ruler', 'compass', 'protractor', 'point', 'shade'];

/* UNDO AND CLEAR, dimmed while there is nothing to take back; in a question's tool row by key (1020). The row offers a pen only where the pad is already drawn */
const padUndoOpts_ = (x, k0) => { const k = k0 || padKey_(x), n = padRead_(k).length, data = k0 ? {} : { k };
  return [{ icon: 'undo', label: 'Undo', note: 'the last mark', act: 'pad-undo', cls: 'qpad-undo', off: !n && !PAD_CLEARED.has(k), data },
    { icon: 'bin', label: 'Clear', note: 'every mark', act: 'pad-clear', cls: 'qpad-clear', off: !n, data }]; };
const padUndoTiles_ = (x, k0) => tile_(padUndoOpts_(x, k0));
const padBar_ = k => fcG_('div', 'qpad-bar tile-row', { role: 'toolbar', 'aria-label': 'Drawing' }, fcG_('span', 'qpad-group', null, padUndoTiles_(null, k)));
/* A PAD'S INK AS A DRAWING: one group of strokes, each a path at the pad's shape. */
const padInk_ = (cls, strokes, ka) => ({ el: 'g', a: { class: cls, 'vector-effect': 'non-scaling-stroke' },
  kids: (strokes || []).map(st => ({ el: 'path', a: { 'vector-effect': 'non-scaling-stroke', d: padPath_(st, ka) } })) });

/* A PICTURE TOO THIN TO DRAW ON IS GIVEN ROOM ABOVE AND BELOW (385): a number line 340x35 was a 31px strip at 390, and its circles go above the line */
const PAD_MIN_ASPECT = 0.3;
function padRoom_(svg) {
  const m = /viewBox\s*=\s*(["'])\s*([-\d.eE+]+)[\s,]+([-\d.eE+]+)[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)\s*\1/.exec(String(svg || ''));
  if (!m) return svg;
  const x0 = +m[2], y0 = +m[3], w = +m[4], h = +m[5];
  if (!(w > 0 && h > 0) || h / w >= PAD_MIN_ASPECT) return svg;
  const H = Math.round(w * PAD_MIN_ASPECT * 100) / 100, y = Math.round((y0 - (H - h) / 2) * 100) / 100;
  return svg.replace(m[0], `viewBox="${x0} ${y} ${w} ${H}"`);
}

/* A FIGURE DRAWN TO SCALE SAYS SO: `data-cm` on its <svg> is its own units to one centimetre. Returned in the pad's
   ink units (340 across), so the compass and the ruler can say a length in centimetres (`padLenSay_`); 0 when unsaid. */
function padCm_(svg) {
  const s = String(svg || ''), head = (/^\s*<svg\b[^>]*>/.exec(s) || [''])[0];
  const cm = Number((/\sdata-cm\s*=\s*["']\s*([\d.]+)/.exec(head) || [])[1]);
  const w = Number((/viewBox\s*=\s*["']\s*[-\d.eE+]+[\s,]+[-\d.eE+]+[\s,]+([\d.eE+]+)/.exec(head) || [])[1]) || 340;
  return cm > 0 && isFinite(cm) ? Math.round(cm * 340 / w * 1e4) / 1e4 : 0;
}

function padWrap_(x, svg, foot) {
  /* THE PICTURE AS THE LIBRARY HAS IT names the parts that share it; the roomier copy is only what is drawn */
  const src = svg;
  if (!(x && (padPrefix_(x) === 'board' || /\bis-lines\b/.test(String(svg))))) svg = padRoom_(svg);
  const k = padKey_(x);
  /* DRAWING THE PAD IS OPENING IT, so this is where the phone's old marks become this person's. */
  padAdopt_(k, padPrefix_(x) + ':' + padItemKey_(x));
  const marks = padRead_(k);
  /* AND THE MARKS AN EARLIER PART MADE ON THIS SAME PICTURE, under this part's own and out of reach of
     its Undo and Clear -- (ii)'s cross goes on the scale (i) already marked. See `usesOf_`. */
  const under = padUnderParts_(x, src), was = [].concat(...under.map(usesMine_));
  /* THE MODE IS READ OFF `PAD_ON`, NOT LEFT ON THE ELEMENT BY THE PRESS THAT SET IT. § */
  const pen = PAD_ON === k;
  /* THE PAD'S SHAPE, written on it for the live path and every repaint to read -- one number for all of them,
     so the stroke under the finger and the same stroke drawn again agree byte for byte (`padPath_`). */
  const ka = padAspect_(x, svg);
  /* THE OVERLAY TAKES ITS BOX FROM THE PICTURE UNDER IT, by stretching to the same box, rather than by parsing a viewBox out of the drawing's markup. § */
  const zm = pen && PAD_ZOOM.has(k) ? PAD_ZOOM.get(k) : null;
  const ink = cardBlock_({ type: 'drawing', node: { el: 'svg', a: { class: 'qpad-ink', 'data-noswipe': '1', viewBox: '0 0 340 340', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
    kids: [under.length ? padInk_('qpad-was', was, ka) : null, padInk_('qpad-g', marks, ka), { el: 'g', a: { class: 'qpad-aid' } }].filter(Boolean) } });
  /* the zoom is two numbers set as the pad is drawn, not a look a class could hold */
  const cm = padCm_(src);
  return fcG_('div', 'qpad' + (pen ? ' is-drawing' : '') + (zm ? ' is-zoomed' : ''), { 'data-k': k, 'data-aspect': String(ka), 'data-cm': cm ? String(cm) : null,
    'data-under': under.length ? under.map(padKey_).join(' ') : null, style: zm ? '--pad-zoom: ' + padZoomVar_(zm) + '; --pad-zoom-s: ' + zm.s.toFixed(4) : null },
    fcG_('div', 'qpad-art', null, svg + ink + (padProtOn_(k) ? padProtHtml_(k) : '') + (cm ? fcG_('span', 'qpad-len', { 'aria-live': 'polite' }, '') : ''))
    + (foot === 'row' ? '' : padBar_(k))
    /* WHERE THE MARKS GO, AND ONLY A `pad:` KEY GOES ANYWHERE: § */
    + fcG_('p', 'qpad-note', { 'data-kept-k': k }, '', padNoteSay_(k)));
}

/* ---------- A DRAWN ANSWER IS SENT LIKE A TYPED ONE (362) */
/* What the submission says: the drawing itself rides under its `pad:` key; this names it, and changes when a mark does. */
function padSay_(marks) {
  const n = (marks || []).length;
  if (!n) return '';
  let h = 0;
  const raw = JSON.stringify(marks);
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) | 0;
  return 'drawing \u00b7 ' + n + ' ' + plural_(n, 'mark') + ' \u00b7 #' + (h >>> 0).toString(36);
}
/* a drawing's verdict line: marks counted by the drawing say so */
const padSaid_ = t => String(t || '').replace(/ \u00b7 by key words$/, ' \u00b7 by the drawing');
/* THE PAD A CHECK ROW MARKS: its own card's, by key -- the row stands under the words, not inside the pad (381) */
function padOfRow_(row) {
  if (!row) return null;
  const k = row.getAttribute('data-pad');
  const inPad = row.closest('.qpad');
  if (inPad || !k) return inPad;
  const mine = p => p.getAttribute('data-k') === k;
  const card = row.closest('.qcard');
  return (card && [].find.call(card.querySelectorAll('.qpad[data-k]'), mine))
    || [].find.call(document.querySelectorAll('.qpad[data-k]'), mine) || null;
}
