/* @family. — qtypes.js EVERY QUESTION PART IS ONE INTERACTION TYPE, AND EVERY TYPE HAS A PROTOCOL (375).
   Self-contained: check-qtypes.js runs this file alone in a vm, so it reads nothing declared elsewhere. */

/* QENGINE:BEGIN — data/settings/qengine.json, written by `node tools/build.js`; edit the json, never this. */
const QENGINE = {"types":{"value":{"checker":"number","moved":true,"face":"type","label":"Single value","padLayer":"maths","surface":"{typed}, maths keys","tiles":["Figure","Check"],"marked":"accept: the number by value, a band `a to b`, a name in front (`x = 9`) allowed","tolerance":"as the scheme writes it; a band where it prints one","wrong":"Not yet, box stays editable","right":"Correct + marks","phone":"Keypad, not the phone keyboard","pc":"Typed; Enter is Check","need":["accept"]},"unit":{"checker":"number","moved":true,"face":"type","label":"Value with a unit","padLayer":"maths","surface":"{typed}, maths keys with the unit row","tiles":["Figure","Check"],"marked":"accept: the number, its unit optional unless the scheme needs it (√, π, a rate)","tolerance":"cm2 = cm² = cm^2; a wrong unit is wrong","wrong":"Not yet","right":"Correct + marks","phone":"Unit keys on the pad","pc":"Typed","need":["accept"]},"fraction":{"checker":"number","moved":true,"face":"type","label":"Fraction or mixed number","padLayer":"maths","surface":"{typed}, stacked as typed","tiles":["Figure","Check"],"marked":"accept by value (2/5 = 6/15 = 0.4); `rule: mixed` when the form is asked","tolerance":"equal value unless simplest/mixed form is asked","wrong":"Not yet","right":"Correct + marks","phone":"Fraction key on the pad","pc":"Typed 1 3/4","need":["accept","formRule"]},"multi":{"checker":"number","moved":true,"face":"type","label":"Several values","padLayer":"maths","surface":"One box (owner, 20 Nov): the values typed in it with commas or spaces","tiles":["Figure","Check"],"marked":"accept list as a set, or `rule:` clauses (count, each, sum, set …)","tolerance":"order-free unless the scheme orders","wrong":"Not yet","right":"Correct + marks","phone":"✓ sends","pc":"Enter sends","need":["accept"]},"measure":{"checker":"number","moved":true,"face":"type","label":"Measure from a figure","padLayer":"maths","surface":"{typed} beside the figure; a protractor or ruler laid on the figure (385)","tiles":["Figure","Protractor / Ruler (as asked)","Check"],"marked":"accept as a band (`a to b`); an angle survives the screen, a length needs a stated scale","tolerance":"the scheme's ± (often 2 mm / 2°)","wrong":"Not yet","right":"Correct + marks","phone":"One finger drags the tool, two turn it, or its round handle; it snaps onto a corner and along an arm","pc":"Drag; the handle or the wheel turns it; typed","need":["accept","band"]},"expr":{"checker":"expression","moved":true,"face":"type","label":"Expression or equation","padLayer":"maths","surface":"{typed}, maths keys with letters and powers","tiles":["Figure","Check"],"marked":"`rule: expr`/`eqn` by value at six points; a form question (simplify, factorise) matched as written","tolerance":"any equivalent form unless the form is the question","wrong":"Not yet","right":"Correct + marks","phone":"x², √, π keys","pc":"Typed x^2","need":["accept","exprRule"]},"coords":{"checker":"number","moved":true,"face":"type","label":"Coordinates","padLayer":"maths","surface":"Two boxes in brackets (362)","tiles":["Figure","Check"],"marked":"accept as an ordered pair","tolerance":"exact; a graph reading as a band","wrong":"Not yet","right":"Correct + marks","phone":"Minus key on the pad","pc":"Typed","need":["accept"]},"draw":{"checker":"points","moved":true,"face":"draw","label":"Draw on the figure","surface":"{pen}: the figure with its frame (grid x,y, number line, or angle round a centre for a clock, dial or pie), every tap snapped to the frame","tiles":"{penTiles}","marked":"draw_answer in the one form: points, lines, curves and regions in the frame (find-pen.js drawOne_), one marker (DRAW_MARK), part marks a piece; AI only for a shape-only sketch (`ai`)","tolerance":"half a step of the frame (a grid square, unless the frame says its step)","wrong":"Not yet, part marks","right":"Correct · by the drawing","phone":"{penPhone}","pc":"{penPc}","need":["draw_answer"]},"choose1":{"checker":"choice","moved":true,"face":"type","padLayer":"letters","label":"Choose one","surface":"The options listed A, B, C; the one box, its keypad only the option letters","tiles":["the options"],"marked":"choice_right","tolerance":"none","wrong":"The tapped option red, the right one shown","right":"The option gold","phone":"Tap","pc":"Click","need":["choices","choice_right"]},"chooseN":{"checker":"choice","moved":true,"face":"type","padLayer":"letters","label":"Choose several","surface":"The options listed A, B, C; the one box, its keypad only the option letters (A,D: sorted, no repeats); the count to pick is said","tiles":["the options"],"marked":"choice_right, all of them","tolerance":"order-free","wrong":"Wrong picks red","right":"All gold","phone":"Tap each","pc":"Click each","need":["choices","choice_right"]},"match":{"checker":"choice","moved":false,"face":"type","label":"Match or sort into groups","surface":"A table, a box an answer (owner, 23 Nov), or lines drawn on the figure in place (402)","tiles":["Figure","Check"],"marked":"cells, each by markAnswer_; or draw_answer `join` (a stroke from one box to its partner)","tolerance":"a cell holding a list is a set","wrong":"n of m answers right","right":"Correct — every answer","phone":"Each box's keypad","pc":"Typed; Tab between boxes","need":["cells|draw_answer"]},"order":{"checker":"choice","moved":true,"face":"type","padLayer":"letters","label":"Put in order","surface":"The items listed A, B, C between the two ends (order_ends); the one box, the letters tapped in sequence (B,D,A,C)","tiles":["Clear","Check"],"marked":"choice_right as the permutation","tolerance":"none","wrong":"Not yet","right":"Correct","phone":"Tap item, it takes the next slot","pc":"Click","need":["choices","choice_right","order_ends"]},"label":{"checker":"choice","moved":false,"face":"type","label":"Label a diagram","surface":"{pen}, or a table, a box a label","tiles":"{penTiles}","marked":"cells (a label per place) or draw_answer `inside`; written labels are not read","tolerance":"a label inside its region","wrong":"Not yet","right":"Correct + marks","phone":"{penPhone}","pc":"{penPc}","need":["draw_answer|cells|accept"]},"table":{"checker":"number","moved":true,"face":"type","label":"Fill table cells","surface":"The table, each empty cell the one answer box (owner, 23 Nov): the question's own table, or one drawn a row an entry; tapped in any order","tiles":["Figure","Check"],"marked":"cells, a cell at a time by markAnswer_ (find-cells.js markCells_); rows (or columns) the child writes whole match the key's in any order, every other cell by its place","tolerance":"per cell, as value","wrong":"n of m cells right","right":"Correct — every cell","phone":"Each cell's keypad from its own answer","pc":"Typed; Tab between cells","need":["cells"]},"reason":{"checker":"words","moved":true,"face":"type","label":"Explanation or reasoning","surface":"{typed}, letter keys, wrapping","tiles":["Figure","Check","AI (only when the rule cannot give every mark)"],"marked":"mark_words: the verdict and the figure that decides it, a point a mark; AI last","tolerance":"a No stopped by its own punctuation is the verdict","wrong":"n of m marks, the missing point not shown","right":"Full marks","phone":"Letter keys","pc":"Typed","need":["mark_words|accept"]},"words":{"checker":"words","moved":true,"face":"type","label":"Short words (1–2 marks)","surface":"{typed}, letter keys","tiles":["Figure","Check"],"marked":"accept, else mark_words (key words, a point a mark); AI only after","tolerance":"case, punctuation and a full stop ignored","wrong":"Not yet","right":"Correct + marks","phone":"Letter keys","pc":"Typed","need":["accept|mark_words"]},"essay":{"checker":"none","moved":false,"face":"type","label":"Essay","padLayer":"sheet","surface":"A sheet, word count under it","tiles":["Figure","Check (AI)"],"marked":"AI against the scheme (answer), clamped to the marks","tolerance":"the scheme's levels","wrong":"Marks and one sentence why","right":"Marks and one sentence why","phone":"The phone keyboard","pc":"Typed","need":["answer","marks"]}},"phrases":{"typed":"One box on the site's keypad","pen":"Its figure under the pen, in place on the card: its own, or the stem's (the stem's words carried onto the card above it), else a made-up grid. One figure, no second copy, no Draw switch, no box or keypad; Check under the part's words","penTiles":["Figure","Point","Line","Curve","Shade","Compass","Undo","Check"],"penPhone":"Finger draws, two fingers pan; the loupe follows the finger","penPc":"Mouse or stylus on a lazy brush (368); the ruler snaps to the grid"},"row":["read","measure","calc"],"buttons":["qp-check|qp-cells-check|pad-check|qp-noscheme|qp-send:send:Check","read-aloud:speak:Read aloud","card-share:share:Share","qt-pen/pen:pen:Pen","qt-inst/measure:ruler:Measure","pad-undo:undo:Undo","qt-calc:calc:Calculator"],"cut":["find-top","fav"]};
/* QENGINE:END */
/* ---------- THE PROTOCOLS, AS DATA: qengine.json `types`, the one list of question types (owner, 17 Nov). `need` is what makes a row
   complete: each entry a field, `a|b` either one, or a named test from QT_NEED below. Tiles are left to right; Check is the one gold
   disc of 368, always last. A field that is, or starts with, `{name}` reads qengine.json `phrases` (the pen's words, written once). */
const qtPhrase_ = v => Array.isArray(v) || typeof v !== 'string' ? v
  : /^\{(\w+)\}$/.test(v) && Array.isArray(QENGINE.phrases[v.slice(1, -1)]) ? QENGINE.phrases[v.slice(1, -1)]
  : v.replace(/^\{(\w+)\}/, (m, k) => (k in QENGINE.phrases ? QENGINE.phrases[k] : m));
const QTYPE_PROTOCOL = Object.fromEntries(Object.entries(QENGINE.types).map(([t, p]) =>
  [t, Object.fromEntries(Object.entries(p).map(([k, v]) => [k, qtPhrase_(v)]))]));

/* ---------- READING A ROW: the library's snake_case row, or a card item (which carries it as `row`). */
const qtS_ = v => (v == null ? '' : String(v)).trim();
const qtText_ = r => [r.lead, r.html].map(h => qtS_(h).replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' '))
  .join(' ').replace(/\s+/g, ' ').toLowerCase();
const qtWays_ = r => qtS_(r.accept).split('|').map(w => w.trim()).filter(Boolean);
const qtRules_ = r => qtWays_(r).filter(w => /^rule:/i.test(w)).map(w => w.replace(/^rule:\s*/i, ''));
const qtPlain_ = r => qtWays_(r).filter(w => !/^rule:/i.test(w));
function qtDrawKinds_(r) {
  const raw = qtS_(r.draw_answer);
  if (!raw) return [];
  try {
    const d = JSON.parse(raw);
    /* the one form's pieces by how each is read (`as`, else what it is); an older key by its kinds */
    if (Array.isArray(d.pieces)) return d.pieces.map(p => qtS_(p && (p.as || p.is)));
    return (Array.isArray(d.items) ? d.items : []).map(i => qtS_(i && (i.k || i.kind)));
  } catch (e) { return ['?']; }
}

/* A UNIT after the number, as the schemes write them. A bare letter after a digit with no space is algebra (8w), so it must be spaced or listed. */
const QT_UNIT = /^[£$€]\s*[\d.]|^[-−]?[\d.]+\s*p$|^[-−]?[\d.,\s]*\d\s*(%|°|(mm|cm|km|kg|mg|ml|cl|litres?|seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?|degrees?|pence|pounds?|euros?|dollars?|newtons?|units?|cubes?|coins?|people|kj|kw|hz|pa|kpa|mph|km\/h|m\/s|g\/cm|kg\/m|ω|ohms?|°c)\b|(cm|mm|m)\^?[23²³]|(mm|cm|km|ml|kg|mg)(?![a-z]))|^[-−]?[\d.,\s]*\d\s+[mglshnjwvp]\b/i;
const QT_COORD = /^\(\s*[-−]?[\d.\/]+\s*,\s*[-−]?[\d.\/]+\s*\)$/;
const QT_FRAC = /^[-−]?(\d+\s+)?\d+\s*[\/⁄]\s*\d+$|^[-−]?\d*\s*[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]$/;
const QT_ROMAN = /^[ivxlcdm]+$/i;
/* ALGEBRA: a one-letter name raised, beside a number or bracket, or joined by an operator. "x = 9" is a value, named; "fifty-four" is words. */
const QT_V = '(?:^|[^a-z])[a-z](?![a-z])';
const QT_V0 = '[a-z](?![a-z])';
const QT_ALG = new RegExp(QT_V + '[\\^²³]|[\\d)]' + QT_V0 + '|' + QT_V + '\\(|' + QT_V + '\\s*[-+−×*\\/]\\s*[\\d(]|'
  + QT_V + '\\s*[-+−×*\\/]\\s*' + QT_V0 + '|[\\d)]\\s*[-+−×*\\/]\\s*' + QT_V0 + '|√' + QT_V0, 'i');
function qtExpr_(w) {
  const s = w.replace(/π|pi\b/gi, '').trim();
  if (!/[a-z]/i.test(s) || /^[a-z]\s*=\s*[-−]?[\d.\/\s]+$/i.test(s) || QT_UNIT.test(s)) return false;
  return QT_ALG.test(s) || /^[-−]?\d*[a-z]$/i.test(s) && s.length > 1 || /=/.test(s) && /[a-z]/i.test(s.split('=')[1] || '');
}
/* ---------- THE ANSWER FACE, THE ONE SOURCE (owner, 20 Nov: "a question must never show two answer boxes when it wants one answer").
   What a part is answered on and how many boxes it shows, from its key and its figure; find-cells.js `ansBox_` draws it, the type reads `values`.
   ONE BOX by default, whatever the key: a list, a `set`, a `count`, a coordinate, a pair, "x = , y =" are typed in it with commas or spaces.
   A `cells` key is one box too, its parts typed in order with commas (owner, 22 Nov); options and drawings keep their own face.
   `values` is how many the key wants (0 an open count), for the type and for "Give 2 answers" read aloud — never a box count. */
/* "and" parts values only between numbers or letters ("36 and 48", "C and D"), never "two hundred and nine" */
function qtSplit_(s) {
  return [].concat(...String(s).split(/\s*,\s*/).map(v => (/\d|^[a-z]{1,2}\s+(and|&)\s+[a-z]{1,2}$/i.test(v)
    ? v.replace(/^and\s+/i, '').split(/\s+and\s+|\s*&\s*/) : [v])));
}
/* HOW MANY THE KEY WANTS: a rule's `count N`, a `set`'s groups, a rule with no count open (0), else the first way's short comma list. */
function qtValues_(r) {
  for (const b of qtRules_(r)) {
    /* an expression is one value; a points rule is words (owner, 18-19 Nov) */
    if (/(?:^|,)\s*(expr|eqn)\s|(?:^|,)\s*points\b|^peel\b|^levels\b/.test(b)) continue;
    const set = /(?:^|,)\s*set\s+([^,]+)/.exec(b);
    if (set) return set[1].split('/').length;
    const c = /(?:^|,)\s*count\s+(\d+)/.exec(b);
    if (c && +c[1] >= 2) return +c[1];
    if (!c) return 0;
  }
  /* a way splits only into short values: never a thousands comma (1,000) or a sentence */
  const split = w => {
    const s = w.replace(/^\((.*)\)$/, '$1');
    if (/\d,\d{3}(?!\d)/.test(s) || !/,|\sand\s|&/.test(s)) return 1;
    const parts = qtSplit_(s);
    return parts.length >= 2 && parts.length <= 16 && parts.every(v => /^[-a-z]{0,2}\s*=?\s*[-\d.\/⁄£$%°a-z²³√π −]{1,14}$/i.test(v) && v.split(' ').length <= 3) ? parts.length : 1;
  };
  const ways = qtPlain_(r);
  if (!ways.length) return 1;
  const n = split(ways[0]);
  return n >= 2 && ways.every(w => { const m = split(w); return m === 1 || m === n; }) ? n : 1;
}
/* ---------- A TABLE'S BLANKS ARE ITS BOXES (owner, 23 Nov: fill a table is typed, the one box in each empty cell, tapped in any order).
   Where each `cells` entry stands in the question's own table, found the first of three ways that places every asked entry:
   1. the table's blanks in reading order (an empty top-left corner heads the rows and columns and is never one);
   2. each entry's own label written in its cell, "(i)" or "families (i)": the box takes the label's place;
   3. each entry named by its row's first cell ("Blue = 8"): the box in that row's last blank (a tally table's Frequency).
   Else '' and the box draws its own table, a row an entry, its name beside its box. A blank is empty however many spaces it holds. */
const QT_CELL_EMPTY = /^(?:\s|&nbsp;| )*$/;
const qtCellText_ = h => String(h || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/&minus;|−|&ndash;|–/g, '-')
  .replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().toLowerCase();
/* ONE TABLE READ: each cell `{ r, c, at, end, open, inner, blank }` (`open` the length of its opening tag), its rows' widths */
function qtCellRead_(t) {
  const rows = [...String(t).matchAll(/<tr[\s\S]*?<\/tr>/g)].map(m => [m.index, m.index + m[0].length]);
  const tds = [...String(t).matchAll(/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/g)].map(m => {
    const r = rows.findIndex(([a, b]) => m.index >= a && m.index < b);
    return { r, at: m.index, end: m.index + m[0].length, open: 2 + m[1].length + m[2].length, inner: m[3], blank: QT_CELL_EMPTY.test(m[3]) };
  });
  tds.forEach((d, i) => { d.c = i && tds[i - 1].r === d.r ? tds[i - 1].c + 1 : 0; });
  return tds;
}
/* `{ table, tds, at: a cell index per entry (-1 for an entry not asked), token: the label a box replaces, or '' }`, or null */
function qtCellPlaces_(html, cells) {
  const n = (cells || []).length;
  if (!n) return null;
  const asked = cells.map(c => !!c.ways);
  for (const t of String(html || '').match(/<table[\s\S]*?<\/table>/g) || []) {
    const tds = qtCellRead_(t), blanks = tds.map((d, i) => (d.blank ? i : -1)).filter(i => i >= 0);
    /* 1. the blanks, in reading order */
    const corner = blanks.length === n + 1 && blanks[0] === 0 && tds[0].r === 0;
    if (blanks.length === n || corner) {
      const at = corner ? blanks.slice(1) : blanks;
      return { table: t, tds, at: at.map((i, k) => (asked[k] ? i : -1)), token: at.map(() => ''), by: 'blanks' };
    }
    /* 2. each entry's label in its cell, once */
    const lab = c => /^\(\s*[a-z0-9]{1,5}\s*\)$/i.test(c.label) ? c.label.replace(/\s+/g, '') : '';
    const tok = cells.map((c, k) => {
      if (!asked[k] || !lab(c)) return -1;
      const hit = tds.map((d, i) => (d.inner.replace(/<[^>]*>/g, '').replace(/\s+/g, '').indexOf(lab(c)) >= 0 ? i : -1)).filter(i => i >= 0);
      return hit.length === 1 ? hit[0] : -2;
    });
    if (asked.some(Boolean) && tok.every((i, k) => !asked[k] || i >= 0) && new Set(tok.filter(i => i >= 0)).size === tok.filter(i => i >= 0).length) {
      return { table: t, tds, at: tok.map((i, k) => (asked[k] ? i : -1)), token: cells.map(c => lab(c)), by: 'labels' };
    }
    /* 3. each entry named by its row's first cell: the row's last blank */
    const rowAt = cells.map((c, k) => {
      if (!asked[k]) return -1;
      const name = qtCellText_(c.label);
      const heads = tds.filter(d => d.c === 0 && qtCellText_(d.inner) === name);
      if (heads.length !== 1) return -2;
      const mine = tds.map((d, i) => (d.r === heads[0].r && d.blank ? i : -1)).filter(i => i >= 0);
      return mine.length ? mine[mine.length - 1] : -2;
    });
    if (asked.some(Boolean) && rowAt.every((i, k) => !asked[k] || i >= 0) && new Set(rowAt.filter(i => i >= 0)).size === rowAt.filter(i => i >= 0).length) {
      return { table: t, tds, at: rowAt, token: cells.map(() => ''), by: 'rows' };
    }
  }
  return null;
}
/* THE ANSWER FACE (owner, 23 Nov): one of QT_FACES for every question -- type (the one box and keypad; options are typed by their letters,
   `letters` the count, on a keypad of only those letters) or draw
   (the drawing pad). `face` is the one field; a table's blanks (`cells`) and an essay's sheet (`sheet`) are the one box too. */
const QT_FACES = ['type', 'draw'];
function qtFace_(x) {
  const r = (x && x.row) || x || {};
  const cells = qtS_(r.cells) ? qtS_(r.cells).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, '&').split(';').length : 0;
  const choices = Array.isArray(r.choices) ? r.choices : qtS_(r.choices).split('|').filter(c => c.trim());
  const values = qtWays_(r).length ? qtValues_(r) : 1;
  if (cells) return { face: 'type', cells: cells, values: cells };
  if (choices.length >= 2) return { face: 'type', letters: choices.length, values: values };
  if (qtS_(r.draw_answer || r.drawAnswer)) return { face: 'draw', values: 1 };
  if (qtRules_(r).some(b => /^(peel|levels)\b/i.test(b))) return { face: 'type', sheet: true, values: 1 };
  return { face: 'type', values: values };
}

/* THE WORDS that make a drawn answer something other than a drawing (a matching, a table, a choice, a label), tried in this order. */
const QT_DRAW_WORDS = [
  ['match', /\bmatch\b|\bdraw (one |a )?lines? from each\b|\bjoin each\b/],
  ['table', /\bcomplete the (\w+ )?table\b/],
  ['chooseN', /\b(circle|underline|tick) (the|all|each|two|three|four|one)\b/],
  ['label', /\blabel\b/],
];
/* ONE DRAWING CANVAS (owner, 23 Nov): every other drawn answer is the one type `draw` -- its pieces (points, lines, curves, regions in
   the figure's frame) are its key, not its type. A `join` piece (a matching drawn as lines) is a matching. */
const QT_DRAW_FIRST = ['match', 'table', 'chooseN'];
const QT_DRAWN = { drawing: 1, annotate: 1 };
/* MEASURED off the figure: "measure the length of this line", not "the student used a balance to measure" */
const QT_MEASURE = /\bmeasure (the |this |each |angle |accurately )?(size|length|angle|distance|width|height|line|side|perimeter|bearing)s?\b|\buse (a|your) (ruler|protractor|angle measurer) to (find|measure)\b/;
const QT_WORDED = { explain: 1, proof: 1, written: 1 };
const QT_REASON_WORDS = /\b(explain|show that|prove|give (a |your )?reasons?|giving (a |your )?reasons?|comment|interpret|describe|justify|why|evaluate|discuss|compare|suggest|assess|criticise|state, giving)\b/;

/* ---------- THE TYPE: one of QTYPE_ORDER for every question part, never empty. */
/* A SCHEME'S BOLD ANSWER THAT IS A FORMULA: a sign, a fraction, a root or a power in it, and no word of three letters */
function qtFormula_(ans) {
  const h = ((/<b>([\s\S]*?)<\/b>/.exec(qtS_(ans)) || [])[1]) || '';
  return /=|&frasl;|&radic;|\u221a|\u2044|<su[pb]>|&pi;|\u03c0/.test(h) && !/[a-z]{3,}/i.test(h.replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' '));
}
function qType_(x) {
  const r = (x && x.row) || x || {};
  const t = qtS_(r.answer_type).toLowerCase();
  const words = qtText_(r);
  const choices = qtS_(r.choices).split('|').filter(c => c.trim());
  if (choices.length >= 2) {
    if (t === 'order') return 'order';
    return qtS_(r.choice_right).split('|')[0].split(',').filter(n => n.trim()).length >= 2 ? 'chooseN' : 'choose1';
  }
  if (qtS_(r.cells)) return /\b(match|join|sort|venn|pairs?)\b/.test(words) || /venn/i.test(qtS_(r.figure)) ? 'match'
    : t === 'annotate' || /\blabel\b/.test(words) ? 'label' : 'table';
  const surf = qtS_(r.surface).toLowerCase();
  /* a drawing whose answer is typed in its box (a bearing, a reading) is that box's type: the pen is the working (366) */
  const boxed = !qtS_(r.draw_answer) && (qtWays_(r).length || qtS_(r.mark_words));
  if ((QT_DRAWN[t] || (surf && surf !== 'text')) && !boxed) {
    const k = qtDrawKinds_(r);
    /* the words first where they name a type the kinds cannot (a reflection is `segs`), then the kinds, then the weaker words */
    const said = QT_DRAW_WORDS.find(w => w[1].test(words));
    if (said && QT_DRAW_FIRST.indexOf(said[0]) !== -1) return said[0];
    if (k.indexOf('join') !== -1) return 'match';
    if (!k.length && ((said && said[0] === 'label') || t === 'annotate')) return 'label';
    return 'draw';
  }
  const plain = qtPlain_(r), first = plain[0] || '', rules = qtRules_(r).join(', ');
  const marks = Number(r.marks) || 0;
  if (QT_WORDED[t] && marks >= 6 && !/math|statistic/i.test(qtS_(r.subject))) return 'essay';
  if (QT_MEASURE.test(words.replace(/\bused to measure\b/g, '')) && !QT_WORDED[t]) return 'measure';
  const short = marks <= 2 && !QT_REASON_WORDS.test(words);
  if (QT_WORDED[t] && !qtWays_(r).length) return short && t !== 'explain' && t !== 'proof' ? 'words' : 'reason';
  if (!qtWays_(r).length) {
    if (qtS_(r.mark_words)) return short ? 'words' : 'reason';
    if (QT_REASON_WORDS.test(words)) return 'reason';
    /* nothing to mark it by yet: the scheme's own answer says whether it is words or a value */
    const a = qtS_(r.answer).replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' ');
    /* its bold answer first when that is a formula: "dr/dt = k/√r — for a constant k" is a value, its gloss words (round 4) */
    if (qtFormula_(r.answer)) return 'value';
    return !/\d/.test(a) && /[a-z]{3,}/i.test(a) ? 'words' : 'value';
  }
  if (/(?:^|,)\s*(expr|eqn)\s/.test(rules)) return 'expr';
  if (/(?:^|,)\s*mixed\b/.test(rules)) return 'fraction';
  /* A POINTS RULE MARKS WORDS: letter keys, one wrapping box (owner, 18 Nov). */
  if (/(?:^|,)\s*points\b/.test(rules) && !plain.length) return short ? 'words' : 'reason';
  if (QT_COORD.test(first)) return 'coords';
  /* SEVERAL VALUES, typed in the one box (qtFace_) */
  if (qtFace_(r).values !== 1) return 'multi';
  if (QT_FRAC.test(first)) return 'fraction';
  if (qtExpr_(first)) return 'expr';
  if (/^[-−\d.\s]*[a-z]?\s*[<>≤≥]/i.test(first) && /[a-z]/i.test(first)) return 'expr';
  if (plain.some(w => QT_UNIT.test(w.replace(/^[-−\d.\s]+to\s+/i, '')) && /[a-z£$€%°]/i.test(w.replace(/^[a-z]\s*=\s*/i, '')))) return 'unit';
  if (/[a-z]{3,}/i.test(first) && !QT_ROMAN.test(first)) return 'words';
  return 'value';
}

/* ---------- COMPLETE: every `need` of its type's protocol met. Returns the needs NOT met ([] is complete). */
const QT_FORM = /\b(simplify|simplest|factori[sz]e|expand|multiply out|in the form|standard form|surd|as a (single )?power of)\b/;
const QT_NEED = {
  /* an algebraic answer asked for its value needs a rule (365); a form question is matched as written */
  exprRule: r => QT_FORM.test(qtText_(r)) || /[<>≤≥]/.test(qtPlain_(r)[0] || '') || /(?:^|,)\s*(expr|eqn)\s/.test(qtRules_(r).join(', ')),
  /* "as a mixed number" / "simplest form" is about the form: a rule or a single exact way says so */
  formRule: r => !/\bmixed number\b/.test(qtText_(r)) || /(?:^|,)\s*mixed\b/.test(qtRules_(r).join(', ')),
  /* a measurement is read off a picture, so the scheme's band, not one exact figure */
  band: r => qtWays_(r).some(w => /\bto\b|\.\.|±|^rule:/i.test(w)) || qtWays_(r).length >= 3,
  convert: () => false,
};
function qtNeedMet_(r, need) {
  if (QT_NEED[need]) return QT_NEED[need](r);
  return need.split('|').some(f => qtS_(r[f]) !== '');
}
function qtDrawn_(x) {
  const r = (x && x.row) || x || {};
  const surf = qtS_(r.surface).toLowerCase();
  if (!(QT_DRAWN[qtS_(r.answer_type).toLowerCase()] || (surf && surf !== 'text'))) return false;
  return !qtS_(r.choices) && !qtS_(r.cells);
}
function qtIncomplete_(x) {
  const r = (x && x.row) || x || {};
  const p = QTYPE_PROTOCOL[qType_(r)];
  return p ? p.need.filter(n => !qtNeedMet_(r, n)) : ['type'];
}
/* THE MARKER (round 3): what marks this part, the one thing that varies between pages -- the page's Check and the
   Function verified tag both read it. Never a person, never AI (owner, 16 Nov): what no rule can mark is saved, unmarked (`save`). */
function qtMarker_(x) {
  const r = (x && x.row) || x || {};
  if (qtS_(r.choices) && qtS_(r.choice_right)) return qtS_(r.answer_type).toLowerCase() === 'order' ? 'order' : 'choice';
  if (qtS_(r.cells)) return 'cells';
  if (qtS_(r.draw_answer)) return 'draw';
  if (qtS_(r.accept)) return 'accept';
  if (qtS_(r.mark_words)) return 'words';
  return 'save';
}
/* MACHINE-MARKED: a way to mark it at all (359); with a complete protocol it is the Function verified tag (388). */
function qtMachine_(x) { return qtMarker_(x) !== 'save'; }
/* THE LAYER THE ONE PAD OPENS ON is the type row's `keys` (1200): maths, the essay's sheet, else the letters (keypad.js) */
const qtKeys_ = t => (QTYPE_PROTOCOL[t] && QTYPE_PROTOCOL[t].padLayer) || 'letters';
