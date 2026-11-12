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

/* ---------- A GRID OR TABLE WITH BLANKS IS FILLED IN WHERE IT STANDS, A CELL AT A TIME (359) */
/* a blank is empty however many spaces the transcriber left in it (`&nbsp;&nbsp;&nbsp;&nbsp;` is one blank) */
const CELL_BLANK = /<(td|th)([^>]*)>(?:\s|&nbsp;|\u00a0)*<\/\1>/g;
const cellCorner_ = t => /^<table[^>]*>\s*(?:<thead[^>]*>\s*)?(?:<tbody[^>]*>\s*)?<tr[^>]*>\s*<(td|th)[^>]*>(?:\s|&nbsp;|\u00a0)*<\/\1>/.test(t);
/* `cells` READ: one entry a blank, in reading order -- `{ label, ways }`, and `ways` empty for a blank not asked. */
function cellsOf_(x) {
  const raw = String((x && x.cells) || '').trim();
  if (!raw) return [];
  return raw.split(';').map((c, i) => {
    const m = /^\s*([^=|]{1,12}?)\s*=\s*(.*)$/.exec(c);
    const ways = (m ? m[2] : c).trim();
    return { label: m ? m[1].trim() : String(i + 1), ways: ways === '-' ? '' : ways };
  });
}
/* EVERY BLANK TYPED IN THE FIRST BOX ("chemical, kinetic"): split on commas, `;` or "and", in order, when that gives one a blank. */
function cellsOneBox_(vals, cells) {
  const v = vals || [], asked = cells.filter(c => c.ways).length;
  if (asked < 2 || v.slice(1).some(s => String(s || '').trim())) return v;
  const bits = String(v[0] || '').split(/\s*(?:[,;]|\band\b)\s*/i).map(s => s.trim()).filter(Boolean);
  if (bits.length !== asked) return v;
  let n = 0;
  return cells.map(c => (c.ways ? bits[n++] : ''));
}
/* EACH CELL MARKED ON ITS OWN by `markAnswer_`: `{ right, of, each }`, `each[i]` true, false, or null for nothing typed. */
function markCells_(vals, cells) {
  vals = cellsOneBox_(vals, cells);
  const each = cells.map((c, i) => c.ways ? markAnswer_(vals[i] || '', c.ways) : undefined);
  const asked = each.filter(v => v !== undefined);
  return { right: asked.filter(v => v === true).length, of: asked.length, each: each };
}
const cellsVals_ = v => String(v == null ? '' : v).split(' ; ');
function cellInput_(k, c, i, v) {
  if (!c.ways) return '';
  /* a cell holding a list (`24, 68`) needs the comma, which a phone's number pad does not have */
  const num = /^[-\d.,\s|£$%°/]+$/.test(c.ways) && !/,\s/.test(c.ways);
  return `<input class="qp-cell" data-k="${esc(k)}" data-n="${i}" aria-label="Blank ${esc(c.label)}" autocomplete="off"
    inputmode="${num ? 'decimal' : 'text'}" value="${esc(v || '')}">`;
}
/* THE QUESTION'S OWN TABLE, ITS BLANKS MADE CELLS -- or '' when it has none with as many blanks as `cells`. */
function cellsTable_(x, html) {
  const cells = cellsOf_(x);
  if (!cells.length) return '';
  const k = ansKey_(x), vals = cellsVals_(ansRead_(k));
  let n = 0;
  const out = String(html || '').replace(/<table[\s\S]*?<\/table>/, t => {
    const blanks = (t.match(CELL_BLANK) || []).length;
    /* AN EMPTY TOP-LEFT CORNER heads both the rows and the columns: it is never a blank to fill. */
    const corner = blanks === cells.length + 1 && cellCorner_(t);
    if (blanks !== cells.length && !corner) return t;
    let skip = corner;
    return t.replace(CELL_BLANK, (m, tag, at) => {
      if (skip) { skip = false; return m; }
      const i = n++;
      return `<${tag}${at} class="qp-cell-at">${cellInput_(k, cells[i], i, vals[i])}</${tag}>`;
    }).replace(/^<table/, '<table data-cells="1"');
  });
  return n ? out : '';
}
/* THE BOX UNDER IT: Check marks every cell; with no table to fill, the cells stand in a row of their own. */
const cellsHere_ = (x, html) => (cellsOf_(x).length && cellsTable_(x, html)) || html;
/* THE WORDS THE ANSWER CARD ITSELF SHOWS -- its last chunk, as `questionCard_` draws it; the part's whole words where it has no plan */
const cellsCardHtml_ = x => {
  try { const c = partChunks_(x); return c.length ? chunkHtml_(c[c.length - 1], null, x) : String((x && x.html) || ''); }
  catch (e) { return String((x && x.html) || ''); }
};
function cellsBox_(x) {
  const cells = cellsOf_(x), k = ansKey_(x);
  /* IN THE TABLE ON THIS CARD, not merely in the part's words: a long part's table on a page in front had no box anywhere (457) */
  const inTable = !!cellsTable_(x, cellsCardHtml_(x));
  const vals = cellsVals_(ansRead_(k));
  const row = inTable ? '' : `<div class="qp-cells">${cells.map((c, i) => c.ways
    ? `<label class="qp-cell-l"><span>${esc(c.label)}</span>${cellInput_(k, c, i, vals[i])}</label>` : '').join('')}</div>`;
  const said = subBoxSay_(k, ansRead_(k));
  return `<div class="qp-mark qp-compose qp-cells-box${said.cls ? ' ' + said.cls : ''}" data-k="${esc(k)}">${row}
    ${qtRow_(x)}${workStrip_(x)}
    <span class="qp-verdict" role="status" aria-live="polite">${esc(said.text)}</span>
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span></div>`;
}
const cellsIn_ = el => { const card = el && el.closest('.qcard'); return card ? [].slice.call(card.querySelectorAll('.qp-cell')) : []; };
function cellsRead_(el) {
  const vals = [];
  cellsIn_(el).forEach(c => { vals[+c.getAttribute('data-n')] = c.value; });
  return vals;
}
document.addEventListener('input', e => {
  const el = e.target && e.target.classList && e.target.classList.contains('qp-cell') ? e.target : null;
  if (!el) return;
  const vals = cellsRead_(el);
  for (let i = 0; i < vals.length; i++) if (vals[i] == null) vals[i] = '';
  ansStore_(el.getAttribute('data-k') || '', vals.join(' ; '));
  el.classList.remove('is-right', 'is-near');
});
on('qp-cells-check', el => {
  const box = el.closest('.qp-cells-box');
  const out = box && box.querySelector('.qp-verdict');
  const x = box && stuffItemsAll_().find(it => ansKey_(it) === box.getAttribute('data-k'));
  if (!x || !out) return;
  const vals = cellsRead_(box), m = markCells_(vals, cellsOf_(x));
  cellsIn_(box).forEach(c => {
    const v = m.each[+c.getAttribute('data-n')];
    c.classList.toggle('is-right', v === true);
    c.classList.toggle('is-near', v === false);
  });
  box.classList.remove('is-right', 'is-near');
  const notYet = partReady_('cells', m);
  if (notYet) { out.textContent = notYet; return; }
  const all = m.right === m.of;
  box.classList.add(all ? 'is-right' : 'is-near');
  out.textContent = all ? 'Correct — every cell' : m.right + ' of ' + m.of + ' cells right';
  subRecord_(box.getAttribute('data-k'), vals.join(' ; '), all ? 'right' : 'wrong');
});

/* "and" parts values only between numbers or letters ("36 and 48", "C and D"), never "two hundred and nine" */
function multiSplit_(s) {
  return [].concat(...String(s).split(/\s*,\s*/).map(v => (/\d|^[a-z]{1,2}\s+(and|&)\s+[a-z]{1,2}$/i.test(v)
    ? v.replace(/^and\s+/i, '').split(/\s+and\s+|\s*&\s*/) : [v])));
}
/* ---------- ONE BOX PER VALUE (362): an answer of several values gets a box each, not one box and commas to type. */
/* How many, from `accept`: a rule's `count N`, a `set`'s groups, a way's comma list; a rule with no count grows a box at a time. */
function multiOf_(x) {
  const all = String((x && x.accept) || '').split('|').map(w => w.trim()).filter(Boolean);
  const ways = all.filter(w => !/^rule:/i.test(w));
  for (const r of all.filter(w => /^rule:/i.test(w))) {
    const body = r.replace(/^rule:\s*/i, '');
    if (/(?:^|,)\s*(expr|eqn)\s/.test(body)) continue;   /* one expression, one box */
    const set = /(?:^|,)\s*set\s+([^,]+)/.exec(body);
    if (set) return { n: set[1].split('/').length, words: true, wrap: '', labels: [] };
    const c = /(?:^|,)\s*count\s+(\d+)/.exec(body);
    if (c && +c[1] >= 2) return { n: +c[1], wrap: '', labels: [] };
    if (!c) return { n: 0, grow: true, wrap: '', labels: [] };
  }
  /* a way splits only into short values: never a thousands comma (1,000) or a sentence */
  const split = w => {
    const p = /^\((.*)\)$/.exec(w), s = p ? p[1] : w;
    if (/\d,\d{3}(?!\d)/.test(s) || !/,|\sand\s|&/.test(s)) return null;
    const parts = multiSplit_(s);
    if (parts.length < 2 || parts.some(v => !/^[-a-z]{0,2}\s*=?\s*[-\d.\/£$%°a-z²³√π ]{1,14}$/i.test(v) || v.split(' ').length > 3)) return null;
    return { parts: parts, wrap: p ? '()' : '' };
  };
  const first = ways.length ? split(ways[0]) : null;
  if (!first || first.parts.length > 16 || ways.map(split).some(g => g && g.parts.length !== first.parts.length)) return null;
  return { n: first.parts.length, wrap: first.wrap, labels: first.parts.map(v => (/^([a-z])\s*=/i.exec(v) || [])[1] || '') };
}
/* A SAVED ANSWER INTO ITS BOXES — an old one typed with commas too: brackets and `x =` off, split at the commas. */
function multiVals_(val, m) {
  let s = String(val == null ? '' : val).trim();
  if (m.wrap) s = s.replace(/^\((.*)\)$/, '$1');
  const out = s ? multiSplit_(s).map((v, i) => (m.labels[i] ? v.replace(new RegExp('^' + m.labels[i] + '\\s*=\\s*', 'i'), '') : v)) : [];
  return out;
}
/* AND THE BOXES INTO ONE ANSWER: what the marker and the account receive, written as the scheme writes it. */
function multiJoin_(vals, m) {
  const v = vals.map(s => String(s == null ? '' : s).trim());
  while (v.length && !v[v.length - 1]) v.pop();
  if (!v.length) return '';
  const s = v.map((s, i) => (m.labels[i] ? m.labels[i] + ' = ' + s : s)).join(', ');
  return m.wrap ? '(' + s + ')' : s;
}
function multiField_(k, i, v, kind, signs) {
  return kpField_(k + '#' + i, v, kind, signs, 'Answer ' + (i + 1), { n: i, k: k });
}
function multiBoxes_(x, k, val, m, maths, signs) {
  const vals = multiVals_(val, m);
  const n = m.grow ? vals.filter(Boolean).length + 1 : m.n;
  const kind = m.words || !maths ? 'words' : 'maths';
  const one = i => `<label class="qp-ans qp-multi-f">${m.labels[i] ? `<span class="qp-multi-l">${esc(m.labels[i])} =</span>` : ''}${
    multiField_(k, i, vals[i] || '', kind, signs)}</label>`;
  const boxes = [];
  for (let i = 0; i < n; i++) boxes.push(one(i));
  /* the joined answer, first in the box, is what Check, Send and every verdict painter read in place of `.qp-ans-in` */
  return `<div class="qp-multi${m.wrap ? ' is-pair' : ''}" data-mk="${esc(k)}" data-m="${esc(JSON.stringify(m))}" data-kind="${kind}"${
    signs ? ` data-signs="${+signs}"` : ''}${m.grow ? ' data-grow="1"' : ''}><input type="hidden" class="qp-multi-val" data-k="${esc(k)}" value="${esc(multiJoin_(vals, m))}">${boxes.join('')}</div>`;
}
const multiIns_ = box => [].slice.call(box.querySelectorAll('.kp-in[data-do="qp-multi"]'));
/* EVERY KEY IN A BOX: the joined answer kept under the question's own key, and a filled last box grows another where the count is open. */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-multi"]');
  const box = el && el.closest('.qp-multi');
  if (!box) return;
  let m;
  try { m = JSON.parse(box.getAttribute('data-m')); } catch (err) { return; }
  const ins = multiIns_(box), all = box.querySelector('.qp-multi-val');
  const v = multiJoin_(ins.map(i => i.value), m);
  if (all) all.value = v;
  ansStore_(box.getAttribute('data-mk') || '', v);
  if (box.hasAttribute('data-grow') && ins.length && ins[ins.length - 1] === el && el.value.trim()) {
    const at = document.createElement('div');
    const kind = box.getAttribute('data-kind');
    at.innerHTML = `<label class="qp-ans qp-multi-f">${multiField_(box.getAttribute('data-mk'), ins.length, '', kind, +box.getAttribute('data-signs') || 0)}</label>`;
    box.appendChild(at.firstChild);
  }
  const mark = box.closest('.qp-mark');
  if (mark && all && typeof subVerdictPaint_ === 'function') subVerdictPaint_(mark, all);
});
/* AN ANSWER ARRIVING FROM ANOTHER DEVICE OR TAB (answers.js) lands on the joined value; its boxes take it too. */
function multiFill_(all) {
  const box = all && all.closest && all.closest('.qp-multi');
  if (!box) return;
  let m;
  try { m = JSON.parse(box.getAttribute('data-m')); } catch (err) { return; }
  const vals = multiVals_(all.value, m);
  multiIns_(box).forEach((inp, i) => {
    if (inp.value === (vals[i] || '')) return;
    inp.value = vals[i] || '';
    if (typeof kpRender_ === 'function') kpRender_(inp);
  });
}
/* THE BOX AFTER THIS ONE, for ✓ and the comma key on the pad: one tap from box to box. */
function multiNext_(inp) {
  const box = inp && inp.closest && inp.closest('.qp-multi');
  if (!box) return null;
  const ins = multiIns_(box), i = ins.indexOf(inp);
  return i >= 0 && i < ins.length - 1 ? ins[i + 1] : null;
}

function ansBox_(x) {
  if (cellsOf_(x).length) return cellsBox_(x);
  const opts = choiceList_(x);
  const k = ansKey_(x);
  const m = markerOf_(x);
  const can = m.kind === 'accept' ? String(x.accept || '').trim() : '';
  const rule = isWordsMark_(m) ? String(x.markWords || '').trim() : '';
  const geo = m.kind === 'draw' ? String(x.drawAnswer || '').trim() : '';
  /* ONE KEYPAD THAT TYPES ANYTHING (keypad.js): the answer's shape only picks the layer it opens on */
  const maths = ansMaths_(x);
  /* ONE MARK BUTTON (owner, 11 Nov): the part's protocol picks the marker -- a rule where there is one, else the AI */
  const ai = isAiMark_(m) ? tile_(aiOpts_(x)) : '';
  const val = ansRead_(k);
  const ws = workStrip_(x);
  const row = qtRow_(x);
  /* A DRAWN ANSWER IS MARKED HERE TOO, by its geometry (366): the row carries the pad's key for `padCheck_` */
  const drawAt = geo ? ` data-k="${esc(k)}" data-pad="${esc(padKey_(x))}" data-draw="${esc(geo)}" data-marks="${esc(String(Number(x.marks) || ''))}"` : '';
  const isAi = isAiMark_(m) && m.ready;
  const cls = 'qp-mark qp-compose' + (isAi ? ' qp-ai' : '') + (geo ? ' qpad-send' : '');
  const dataAt = (can ? ` data-accept="${esc(can)}"` : '') + (rule ? ` data-rule="${esc(rule)}" data-marks="${esc(String(Number(x.marks) || ''))}"` : '') + drawAt;
  /* ---------- AN ESSAY IS WRITTEN ON A SHEET: the same one box, bigger § */
  if (ansEssay_(x)) {
    const note = isAiMark_(m) && !ai ? aiWhyNot_(x) : '';
    const kept = isAi && typeof aiKeptView_ === 'function' ? aiKeptView_(k, val) : null;
    const said = subBoxSay_(k, val);
    const own = kept && (kept.fresh || !said.text) ? kept : null;
    const vcls = own ? own.cls : said.cls, vsay = own ? own.verdict : said.text;
    return `<div class="${cls} qp-essay${vcls ? ' ' + vcls : ''}"${dataAt}>
    <label class="qp-ans qp-sheet" aria-label="Your answer">${kpField_(k, val, 'essay', 3)}</label>
    <p class="qp-words">${esc(kpWordsSay_(val))}</p>
    ${row}${ws}${note ? `<p class="qp-ai-note">${esc(note)}</p>` : ''}
    <span class="qp-verdict" role="status" aria-live="polite">${esc(vsay)}</span>
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span>
  </div>${isAi ? `<p class="qp-ai-why">${own ? esc(own.why) : ''}</p>` : ''}`;
  }
  const many = can ? multiOf_(x) : null;
  const bar = opts + (many ? `<div class="qp-ans-row qp-bar qp-multi-bar">${multiBoxes_(x, k, val, many, maths, 3)}</div>`
    : `<div class="qp-ans-row qp-bar"><label class="qp-ans${maths ? ' qp-ans-maths' : ''}" aria-label="Your answer">
    ${kpField_(k, val, maths ? 'maths' : 'words', 3)}
  </label></div>`);
  const note = isAiMark_(m) && !ai ? aiWhyNot_(x) : '';
  /* THE VERDICT IS THE LATEST SUBMISSION'S, WHILE THE BOX HOLDS WHAT WAS SENT -- on this device or on the account, next sign-in § */
  const said = geo ? subBoxSay_(k, padSay_(padRead_(padKey_(x)))) : subBoxSay_(k, val);
  return `<div class="${cls}${said.cls ? ' ' + said.cls : ''}"${dataAt}>
    ${bar}${row}${ws}${note ? `<p class="qp-ai-note">${esc(note)}</p>` : ''}
    <span class="qp-verdict" role="status" aria-live="polite">${esc(geo ? padSaid_(said.text) : said.text)}</span>
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span>
  </div>${isAi ? '<p class="qp-ai-why"></p>' : ''}`;
}
/* WHAT A BOX'S VERDICT LINE SAYS AS IT IS DRAWN: the latest submission's verdict, if the box holds it. */
function subBoxSay_(k, val) {
  const latest = typeof subLatest_ === 'function' ? subLatest_(k) : null;
  return latest && latest.a === String(val == null ? '' : val) && typeof subSay_ === 'function'
    ? subSay_(latest.v) : { text: '', cls: '' };
}

/* ---------- THE VERDICT, ONE PATH FOR EVERY TYPED PART (owner, 9 Nov): `markPart_` against the scheme; a part with no rule goes to the AI from the same button. */
on('qp-check', (el) => {
  const box = el.closest('.qp-mark');
  const card = el.closest('.qcard');
  /* ITS OWN BOX'S FIELD FIRST (508): a card with two boxes marked the first one's. */
  const inp = (box && box.querySelector('.qp-multi-val, .qp-ans-in')) || (card && card.querySelector('.qp-multi-val, .qp-ans-in'));
  const out = box && box.querySelector('.qp-verdict');
  if (!box || !inp || !out) return;
  const k = inp.getAttribute('data-k');
  const x = stuffItemsAll_().find(it => ansKey_(it) === k);
  /* A PHOTO IS READ BY THE AI MARKER (owner, 29 Oct): the scheme reads only the typed box, so a part with photos goes to `markWorking` with them */
  const send = typeof WORK_PICS !== 'undefined' && (WORK_PICS[k] || []).length
    ? [].find.call(document.querySelectorAll('.qp-work-send'), b => b.getAttribute('data-k') === k) : null;
  /* ONE PRESS, ONE VERDICT: a mark still being made is not made again */
  if (box.classList.contains('is-busy') || el.disabled) return;
  box.classList.remove('is-right', 'is-near');
  if (send && ACTIONS['qp-work-send']) {
    out.textContent = 'Your photos go to the AI marker';
    ACTIONS['qp-work-send'](send);
    return;
  }
  if (partReady_('typed', inp.value)) { out.textContent = partReady_('typed', inp.value); return; }
  const v = x ? markPart_(x, inp.value) : markAnswer_(inp.value, box.getAttribute('data-accept')) === null ? null : { got: markAnswer_(inp.value, box.getAttribute('data-accept')) ? 1 : 0, of: 1 };
  if (!v) { out.textContent = partReady_('typed', ''); return; }
  if (v.ai) { if (ACTIONS['qp-ai']) ACTIONS['qp-ai'](el); return; }
  const full = v.got >= v.of;
  box.classList.add(full ? 'is-right' : 'is-near');
  out.textContent = v.words ? v.got + ' of ' + v.of + ' mark' + (v.of === 1 ? '' : 's') + ' · by key words' : full ? 'Correct' : 'Not yet — have another go';
  /* MARKED IS A SUBMISSION, right or not yet (js/submit.js); signed out it is this visit's alone. */
  subRecord_(k, inp.value, v.words ? 'rule:' + v.got + '/' + v.of : full ? 'right' : 'wrong');
});

/* ---------- SEND, WHERE NOTHING CAN MARK IT § */
on('qp-send', (el) => {
  const box = el.closest('.qp-mark');
  const inp = box && box.querySelector('.qp-multi-val, .qp-ans-in');
  const out = box && box.querySelector('.qp-verdict');
  if (!inp || !out || el.disabled) return;
  box.classList.remove('is-right', 'is-near');
  if (partReady_('typed', inp.value)) { out.textContent = partReady_('typed', inp.value); return; }
  out.textContent = subRecord_(inp.getAttribute('data-k'), inp.value, 'sent') ? 'Sent' : 'Sign in to send it';
});

/* ---------- WHO IS WORKING § */

/* SAVED AS IT IS TYPED, through a delegated listener rather than a handler per box — there are thousands of these and only one of them is ever being typed into. § */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-ans"]');
  if (!el) return;
  /* THROUGH `ansStore_`, which keeps it on this device. § */
  ansStore_(el.getAttribute('data-k') || '', el.value || '', el.getAttribute('data-kp') === 'words');
  /* A WORDED ANSWER GROWS AS IT IS TYPED, the way a message bar does: § */
  if (el.tagName === 'TEXTAREA' && el.closest('.qp-bar') && !el.classList.contains('kp-in')) {
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
    const read = typeof ansValue_ === 'function' ? ansValue_ : (x => localStorage.getItem(x));
    if (read(k) !== null) return;
    const v = read(bare);
    if (v === null) return;
    /* NOR A DRAWING SOMEBODY ELSE MADE SIGNED OUT — `ansRead_`'s rule, asked of the same `ansMayMove_`
       (answers.js). Only into an empty pad, so any answer but "no" moves it. */
    if (typeof ansMayMove_ === 'function' && !ansMayMove_(bare, k)) return;
    /* THROUGH `ansStore_`, so the marks that became this person's go up to their account with the rest. */
    if (typeof ansStore_ === 'function') ansStore_(k, v); else localStorage.setItem(k, v);
    /* AND OFF THE SIGNED-OUT KEY THROUGH THE WRITER: the store's copy, the visit's, and the mark. */
    if (typeof ansLocalPut_ === 'function') ansLocalPut_(bare, null); else localStorage.removeItem(bare);
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
    const raw = typeof ansValue_ === 'function' ? ansValue_(k) : localStorage.getItem(k);
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
const PAD_TOOLS = ['pen', 'ruler', 'compass', 'protractor'];

/* UNDO AND CLEAR, dimmed while there is nothing to take back; in a question's tool row by key (1020). The row offers a pen only where the pad is already drawn */
const padUndoTiles_ = (x, k0) => { const k = k0 || padKey_(x), n = padRead_(k).length, data = k0 ? {} : { k };
  return tile_({ icon: 'undo', label: 'Undo', note: 'the last mark', act: 'pad-undo', cls: 'qpad-undo', off: !n && !PAD_CLEARED.has(k), data })
    + tile_({ icon: 'bin', label: 'Clear', note: 'every mark', act: 'pad-clear', cls: 'qpad-clear', off: !n, data }); };
const padBar_ = k => `<div class="qpad-bar tile-row" role="toolbar" aria-label="Drawing"><span class="qpad-group">${padUndoTiles_(null, k)}</span></div>`;
const padReady_ = x => padHasArt_(x) && (!!padSource_(x) || padSurface_(x) === 'text');

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

function padWrap_(x, svg, foot) {
  /* THE PICTURE AS THE LIBRARY HAS IT names the parts that share it; the roomier copy is only what is drawn */
  const src = svg;
  if (!(x && padPrefix_(x) === 'board')) svg = padRoom_(svg);
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
  return `<div class="qpad${pen ? ' is-drawing' : ''}${zm ? ' is-zoomed' : ''}" data-k="${esc(k)}" data-aspect="${ka}"${
    under.length ? ` data-under="${esc(under.map(padKey_).join(' '))}"` : ''}${zm ? ` style="--pad-zoom: ${padZoomVar_(zm)}; --pad-zoom-s: ${zm.s.toFixed(4)}"` : ''}>
    <div class="qpad-art">${svg}
      <svg class="qpad-ink" data-noswipe viewBox="0 0 340 340" preserveAspectRatio="none" aria-hidden="true">
        ${under.length ? usesInk_(was, ka) : ''}
        <g class="qpad-g" vector-effect="non-scaling-stroke">${marks.map(st =>
          `<path vector-effect="non-scaling-stroke" d="${padPath_(st, ka)}"/>`).join('')}</g>
        <g class="qpad-aid"></g>
      </svg>
      ${padProtOn_(k) ? padProtHtml_(k) : ''}
    </div>
    ${foot === 'row' ? '' : padBar_(k)}
    ${/* WHERE THE MARKS GO, AND ONLY A `pad:` KEY GOES ANYWHERE: § */
          ''}
    <p class="qpad-note" data-kept-k="${esc(k)}">${esc(padNoteSay_(k))}</p>
  </div>`;
}

/* ---------- A DRAWN ANSWER IS SENT LIKE A TYPED ONE (362) */
/* What the submission says: the drawing itself rides under its `pad:` key; this names it, and changes when a mark does. */
function padSay_(marks) {
  const n = (marks || []).length;
  if (!n) return '';
  let h = 0;
  const raw = JSON.stringify(marks);
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) | 0;
  return 'drawing \u00b7 ' + n + ' mark' + (n === 1 ? '' : 's') + ' \u00b7 #' + (h >>> 0).toString(36);
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
