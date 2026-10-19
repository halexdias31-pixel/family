/* @family. — qtypes.js EVERY QUESTION PART IS ONE INTERACTION TYPE, AND EVERY TYPE HAS A PROTOCOL (375).
   Self-contained: check-qtypes.js runs this file alone in a vm, so it reads nothing declared elsewhere. */

/* ---------- THE PROTOCOLS, AS DATA. `need` is what makes a row complete: each entry a field, `a|b` either one,
   or a named test from QT_NEED below. Tiles are left to right; Check is the one gold disc of 368, always last. */
const QT_TYPED = 'One box on the site\'s keypad';
const QT_PEN = 'Its figure (or a made-up grid) under the pen';
const QT_PEN_TILES = ['Figure', 'Pen', 'Ruler / Compass / Protractor (as asked)', 'Undo', 'Clear', 'Check'];
const QT_PEN_PHONE = 'Finger draws, two fingers pan; the loupe follows the finger';
const QT_PEN_PC = 'Mouse or stylus on a lazy brush (368); the ruler snaps to the grid';
const QTYPE_PROTOCOL = {
  value:    { label: 'Single value', surface: QT_TYPED + ', maths keys', tiles: ['Figure', 'Check'],
              marked: 'accept: the number by value, a band `a to b`, a name in front (`x = 9`) allowed', tolerance: 'as the scheme writes it; a band where it prints one',
              wrong: 'Not yet, box stays editable', right: 'Correct + marks', phone: 'Keypad, not the phone keyboard', pc: 'Typed; Enter is Check', need: ['accept'] },
  unit:     { label: 'Value with a unit', surface: QT_TYPED + ', maths keys with the unit row', tiles: ['Figure', 'Check'],
              marked: 'accept: the number, its unit optional unless the scheme needs it (√, π, a rate)', tolerance: 'cm2 = cm² = cm^2; a wrong unit is wrong',
              wrong: 'Not yet', right: 'Correct + marks', phone: 'Unit keys on the pad', pc: 'Typed', need: ['accept'] },
  multi:    { label: 'Several values', surface: 'One box per value (362), side by side, wrapping', tiles: ['Figure', 'Check'],
              marked: 'accept list as a set, or `rule:` clauses (count, each, sum, set …)', tolerance: 'order-free unless the scheme orders',
              wrong: 'Not yet', right: 'Correct + marks', phone: '✓ reads next and moves box to box', pc: 'Tab or comma moves on', need: ['accept'] },
  fraction: { label: 'Fraction or mixed number', surface: QT_TYPED + ', stacked as typed', tiles: ['Figure', 'Check'],
              marked: 'accept by value (2/5 = 6/15 = 0.4); `rule: mixed` when the form is asked', tolerance: 'equal value unless simplest/mixed form is asked',
              wrong: 'Not yet', right: 'Correct + marks', phone: 'Fraction key on the pad', pc: 'Typed 1 3/4', need: ['accept', 'formRule'] },
  coords:   { label: 'Coordinates', surface: 'Two boxes in brackets (362)', tiles: ['Figure', 'Check'],
              marked: 'accept as an ordered pair', tolerance: 'exact; a graph reading as a band', wrong: 'Not yet', right: 'Correct + marks',
              phone: 'Minus key on the pad', pc: 'Typed', need: ['accept'] },
  expr:     { label: 'Expression or equation', surface: QT_TYPED + ', maths keys with letters and powers', tiles: ['Figure', 'Check'],
              marked: '`rule: expr`/`eqn` by value at six points; a form question (simplify, factorise) matched as written', tolerance: 'any equivalent form unless the form is the question',
              wrong: 'Not yet', right: 'Correct + marks', phone: 'x², √, π keys', pc: 'Typed x^2', need: ['accept', 'exprRule'] },
  choose1:  { label: 'Choose one', surface: 'The options as tiles', tiles: ['the options'],
              marked: 'choice_right', tolerance: 'none', wrong: 'The tapped option red, the right one shown', right: 'The option gold',
              phone: 'Tap', pc: 'Click', need: ['choices', 'choice_right'] },
  chooseN:  { label: 'Choose several', surface: 'The options as tiles; the count to pick is said', tiles: ['the options'],
              marked: 'choice_right, all of them', tolerance: 'order-free', wrong: 'Wrong picks red', right: 'All gold',
              phone: 'Tap each', pc: 'Click each', need: ['choices', 'choice_right'] },
  order:    { label: 'Put in order', surface: 'The items, and slots between the two ends (order_ends)', tiles: ['Clear', 'Check'],
              marked: 'choice_right as the permutation', tolerance: 'none', wrong: 'Not yet', right: 'Correct',
              phone: 'Tap item, it takes the next slot', pc: 'Click', need: ['choices', 'choice_right', 'order_ends'] },
  match:    { label: 'Match or sort into groups', surface: 'Labelled cells (Venn regions, pairs)', tiles: ['Figure', 'Check'],
              marked: 'cells, each by markAnswer_', tolerance: 'a cell holding a list is a set', wrong: 'n of m cells right, each coloured', right: 'Correct — every cell',
              phone: 'Text keyboard where a cell holds words', pc: 'Tab between cells', need: ['cells'] },
  table:    { label: 'Fill table cells', surface: 'The question\'s own table, its blanks as cells (359)', tiles: ['Figure', 'Check'],
              marked: 'cells, each by markAnswer_', tolerance: 'per cell, as value', wrong: 'n of m cells right', right: 'Correct — every cell',
              phone: 'Number pad where every way is a number', pc: 'Tab between cells', need: ['cells'] },
  label:    { label: 'Label a diagram', surface: QT_PEN + ', or labelled cells', tiles: QT_PEN_TILES,
              marked: 'cells (a label per place) or draw_answer `inside`; written labels are not read', tolerance: 'a label inside its region',
              wrong: 'Not yet', right: 'Correct + marks', phone: QT_PEN_PHONE, pc: QT_PEN_PC, need: ['draw_answer|cells|accept'] },
  words:    { label: 'Short words (1–2 marks)', surface: QT_TYPED + ', letter keys', tiles: ['Figure', 'Check'],
              marked: 'accept, else mark_words (key words, a point a mark); AI only after', tolerance: 'case, punctuation and a full stop ignored',
              wrong: 'Not yet', right: 'Correct + marks', phone: 'Letter keys', pc: 'Typed', need: ['accept|mark_words'] },
  reason:   { label: 'Explanation or reasoning', surface: QT_TYPED + ', letter keys, wrapping', tiles: ['Figure', 'Check', 'AI (only when the rule cannot give every mark)'],
              marked: 'mark_words: the verdict and the figure that decides it, a point a mark; AI last', tolerance: 'a No stopped by its own punctuation is the verdict',
              wrong: 'n of m marks, the missing point not shown', right: 'Full marks', phone: 'Letter keys', pc: 'Typed', need: ['mark_words|accept'] },
  essay:    { label: 'Essay', surface: 'A sheet, word count under it', tiles: ['Figure', 'Check (AI)'],
              marked: 'AI against the scheme (answer), clamped to the marks', tolerance: 'the scheme\'s levels',
              wrong: 'Marks and one sentence why', right: 'Marks and one sentence why', phone: 'The phone keyboard', pc: 'Typed', need: ['answer', 'marks'] },
  points:   { label: 'Draw point(s)', surface: QT_PEN, tiles: QT_PEN_TILES,
              marked: 'draw_answer `pts` (a cross or dot)', tolerance: '0.3 of a square', wrong: 'Not yet · by the drawing', right: 'Correct · by the drawing',
              phone: QT_PEN_PHONE, pc: QT_PEN_PC, need: ['draw_answer'] },
  line:     { label: 'Draw a line or segment', surface: QT_PEN, tiles: QT_PEN_TILES,
              marked: 'draw_answer `segs`/`line`/`pair`/`dir`/`radius`/`angle`', tolerance: '0.3 of a square; ends snapped to the grid',
              wrong: 'Not yet · by the drawing', right: 'Correct · by the drawing', phone: QT_PEN_PHONE, pc: QT_PEN_PC, need: ['draw_answer'] },
  shape:    { label: 'Draw a shape or transform one', surface: QT_PEN, tiles: QT_PEN_TILES,
              marked: 'draw_answer `segs` poly/`polygon`/`cuboid`; `or` for the right shape in the wrong place', tolerance: 'corners within 0.3 of a square; any size where no scale',
              wrong: 'Not yet, part marks', right: 'Correct · by the drawing', phone: QT_PEN_PHONE, pc: QT_PEN_PC, need: ['draw_answer'] },
  shade:    { label: 'Shade cells or a region', surface: QT_PEN, tiles: QT_PEN_TILES,
              marked: 'draw_answer `cells` (count or exact set) / `inside`', tolerance: 'by the ink inside each cell',
              wrong: 'Not yet', right: 'Correct · by the drawing', phone: QT_PEN_PHONE, pc: QT_PEN_PC, need: ['draw_answer'] },
  hand:     { label: 'Set a hand or pointer', surface: QT_PEN + ' (clock, dial, scale)', tiles: QT_PEN_TILES,
              marked: 'draw_answer `clock`/`dial`/`scale`, read as rays from the centre (368)', tolerance: 'half a division',
              wrong: 'Not yet', right: 'Correct · by the drawing', phone: QT_PEN_PHONE, pc: QT_PEN_PC, need: ['draw_answer'] },
  graph:    { label: 'Plot a graph or chart', surface: QT_PEN + ' (its axes, or made-up axes)', tiles: QT_PEN_TILES,
              marked: 'draw_answer `hist`/`box`/`pie`/`sketch`/`area`/`segs` path', tolerance: '0.3 of a square; a sketch by its shape',
              wrong: 'Not yet, part marks', right: 'Correct · by the drawing', phone: QT_PEN_PHONE, pc: QT_PEN_PC, need: ['draw_answer'] },
  construct:{ label: 'Construct (compass and ruler)', surface: QT_PEN + ', compass and ruler', tiles: QT_PEN_TILES,
              marked: 'draw_answer `curves` (arcs) with the line they make', tolerance: 'arcs seen, the line within 0.3 of a square',
              wrong: 'Not yet', right: 'Correct · by the drawing', phone: QT_PEN_PHONE, pc: QT_PEN_PC, need: ['draw_answer'] },
  numline:  { label: 'Number line', surface: QT_PEN + ' (the line)', tiles: QT_PEN_TILES,
              marked: 'draw_answer `interval` (circles filled or open) or `pts`', tolerance: 'a quarter of a step',
              wrong: 'Not yet', right: 'Correct · by the drawing', phone: QT_PEN_PHONE, pc: QT_PEN_PC, need: ['draw_answer'] },
  measure:  { label: 'Measure from a figure', surface: QT_TYPED + ' beside the figure', tiles: ['Figure', 'Check'],
              marked: 'accept as a band (`a to b`); an angle survives the screen, a length needs a stated scale', tolerance: 'the scheme\'s ± (often 2 mm / 2°)',
              wrong: 'Not yet', right: 'Correct + marks', phone: 'Loupe over the figure', pc: 'Typed', need: ['accept', 'band'] },
  print:    { label: 'Practical or printed sheet only', surface: 'None on screen: the printed sheet', tiles: ['Printed sheet'],
              marked: 'not by machine', tolerance: '—', wrong: '—', right: '—',
              phone: 'Says print it', pc: 'Says print it', need: ['convert'] },
};
const QTYPE_ORDER = Object.keys(QTYPE_PROTOCOL);

/* ---------- READING A ROW: the library's snake_case row, or a card item (which carries it as `row`). */
const qtS_ = v => (v == null ? '' : String(v)).trim();
const qtText_ = r => [r.lead, r.html].map(h => qtS_(h).replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' '))
  .join(' ').replace(/\s+/g, ' ').toLowerCase();
const qtWays_ = r => qtS_(r.accept).split('|').map(w => w.trim()).filter(Boolean);
const qtRules_ = r => qtWays_(r).filter(w => /^rule:/i.test(w)).map(w => w.replace(/^rule:\s*/i, ''));
const qtPlain_ = r => qtWays_(r).filter(w => !/^rule:/i.test(w));
const qtTrue_ = v => /^true$/i.test(qtS_(v));
let QT_DA_MEMO = null;
function qtDrawKinds_(r) {
  const raw = qtS_(r.draw_answer);
  if (!raw) return [];
  try {
    const d = JSON.parse(raw);
    return (Array.isArray(d.items) ? d.items : []).map(i => qtS_(i && (i.k || i.kind)));
  } catch (e) { return ['?']; }
}

/* A UNIT after the number, as the schemes write them. A bare letter after a digit with no space is algebra (8w), so it must be spaced or listed. */
const QT_UNIT = /^[£$€]\s*[\d.]|^[-−]?[\d.]+\s*p$|^[-−]?[\d.,\s]*\d\s*(%|°|(mm|cm|km|kg|mg|ml|cl|litres?|seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?|degrees?|pence|pounds?|euros?|dollars?|newtons?|units?|cubes?|coins?|people|kj|kw|hz|pa|kpa|mph|km\/h|m\/s|g\/cm|kg\/m|ω|ohms?|°c)\b|(cm|mm|m)\^?[23²³]|(mm|cm|km|ml|kg|mg)(?![a-z]))|^[-−]?[\d.,\s]*\d\s+[mglshnjwvp]\b/i;
const QT_COORD = /^\(\s*[-−]?[\d.\/]+\s*,\s*[-−]?[\d.\/]+\s*\)$/;
const QT_FRAC = /^[-−]?(\d+\s+)?\d+\s*[\/⁄]\s*\d+$|^[-−]?\d*\s*[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]$/;
const QT_ROMAN = /^[ivxlcdm]+$/i;
/* ALGEBRA: a one-letter name raised, beside a number or bracket, or joined by an operator. "x = 9" is a value, named; "fifty-four" is words. */
const QT_V = '(?<![a-z])[a-z](?![a-z])';
const QT_ALG = new RegExp(QT_V + '[\\^²³]|[\\d)]' + QT_V + '|' + QT_V + '\\(|' + QT_V + '\\s*[-+−×*\\/]\\s*[\\d(]|'
  + QT_V + '\\s*[-+−×*\\/]\\s*' + QT_V + '|[\\d)]\\s*[-+−×*\\/]\\s*' + QT_V + '|√' + QT_V, 'i');
function qtExpr_(w) {
  const s = w.replace(/π|pi\b/gi, '').trim();
  if (!/[a-z]/i.test(s) || /^[a-z]\s*=\s*[-−]?[\d.\/\s]+$/i.test(s) || QT_UNIT.test(s)) return false;
  return QT_ALG.test(s) || /^[-−]?\d*[a-z]$/i.test(s) && s.length > 1 || /=/.test(s) && /[a-z]/i.test(s.split('=')[1] || '');
}
/* SEVERAL VALUES: the same reading as find.js `multiOf_` (362) — a rule's count or set, a rule with no count, or the first way's short comma list. */
function qtMulti_(r) {
  for (const b of qtRules_(r)) {
    if (/(?:^|,)\s*(expr|eqn)\s/.test(b)) continue;
    if (/(?:^|,)\s*set\s/.test(b)) return true;
    const c = /(?:^|,)\s*count\s+(\d+)/.exec(b);
    if (!c || +c[1] >= 2) return true;
  }
  const w = qtPlain_(r)[0];
  if (!w) return false;
  const s = w.replace(/^\((.*)\)$/, '$1');
  if (/\d,\d{3}(?!\d)/.test(s) || !/,|\sand\s|&/.test(s)) return false;
  const parts = s.split(/\s*,\s*|\s+and\s+|\s*&\s*/).filter(Boolean);
  return parts.length >= 2 && parts.every(v => /^[-a-z]{0,2}\s*=?\s*[-\d.\/⁄£$%°a-z²³√π −]{1,14}$/i.test(v) && v.split(' ').length <= 3);
}

/* THE WORDS that name a drawn answer's type, tried in this order; the first to match wins. */
const QT_DRAW_WORDS = [
  ['match', /\bmatch\b|\bdraw (one |a )?lines? from each\b|\bjoin each\b/],
  ['table', /\bcomplete the (\w+ )?table\b/],
  ['chooseN', /\b(circle|underline|tick) (the|all|each|two|three|four|one)\b/],
  ['construct', /\bconstruct(ion|ed|ing)?\b(?! (an? |the |your )?([\w-]+ )?(table|tree|graph|chart|diagram|histogram|polygon|sentence|argument|frequency))|\bbisect|\bloci\b|\blocus\b|\bcompasses\b/],
  ['hand', /\bclock\b|\bclock ?face\b|\bhands?\b|\bdial\b|\bpointer\b|\barrow\b[^.]{0,40}\bscale\b|\bscale\b[^.]{0,40}\barrow\b/],
  ['numline', /\bnumber line\b/],
  ['graph', /\b(bar chart|bar graph|bar-line|histogram|pie chart|box ?plot|box-and-whisker|pictogram|frequency polygon|cumulative frequency|line graph|tally|time series|line of best fit|scatter|stem and leaf|tree diagram|venn)\b|\b(draw|plot|sketch|complete) (the |a |an )?(graph|curve|chart)\b|\bgraph of\b|\bsketch\b|\b(conversion|distance-time|travel) graph\b|\bdraw (the line )?[xy] ?=/],
  ['line', /\blines? of symmetry\b/],
  ['shade', /\bshade|\bcolour (in )?\b|\bcolor\b/],
  ['shape', /\b(reflect|rotat|translat|enlarg|transform)\w*|\bnet\b|\belevation\b|\bplan\b|\b(draw|complete|make|sketch)\b[^.]{0,50}\b(triangle|square|rectangle|quadrilateral|kite|rhombus|trapezium|parallelogram|polygon|pentagon|hexagon|octagon|shape|cuboid|cube|prism|pattern|picture)s?\b/],
  ['points', /\b(plot|mark|draw|put)\b[^.]{0,30}\b(points?|cross(es)?|dots?|positions?)\b|\bmark (it |this |the \w+ )?with (a|an) (x|cross)\b|\bplot\b/],
  ['label', /\blabel\b/],
  ['line', /\blines?\b|\bsegment\b|\bsymmetry\b|\bparallel\b|\bperpendicular\b|\bjoin\b|\bangle\b|\btangent\b|\bradius\b|\bdiameter\b|\bchord\b|\bbearing\b|\bruler\b|\barrow\b|\bvector\b|\broute\b|\bpath\b/],
];
/* THE GEOMETRY KINDS (366) a drawn answer is marked by, as the type each one is; the first in this order decides. */
const QT_DRAW_KINDS = [['curves', 'construct'], ['clock', 'hand'], ['dial', 'hand'], ['scale', 'hand'], ['interval', 'numline'],
  ['hist', 'graph'], ['box', 'graph'], ['pie', 'graph'], ['sketch', 'graph'], ['area', 'graph'], ['cells', 'shade'], ['inside', 'shade'],
  ['polygon', 'shape'], ['cuboid', 'shape'], ['line', 'line'], ['pair', 'line'], ['dir', 'line'], ['radius', 'line'], ['angle', 'line'],
  ['segs', 'line'], ['pts', 'points']];
const QT_DRAWN = { drawing: 1, annotate: 1 };
/* MEASURED off the figure: "measure the length of this line", not "the student used a balance to measure" */
const QT_MEASURE = /\bmeasure (the |this |each |angle |accurately )?(size|length|angle|distance|width|height|line|side|perimeter|bearing)s?\b|\buse (a|your) (ruler|protractor|angle measurer) to (find|measure)\b/;
/* the words that outrank the geometry kinds: a reflection is marked as `segs`, a matching drawn as lines */
const QT_DRAW_FIRST = ['match', 'table', 'chooseN', 'construct', 'hand', 'numline', 'graph', 'line', 'shape'];
const QT_WORDED = { explain: 1, proof: 1, written: 1 };
const QT_REASON_WORDS = /\b(explain|show that|prove|give (a |your )?reasons?|giving (a |your )?reasons?|comment|interpret|describe|justify|why|evaluate|discuss|compare|suggest|assess|criticise|state, giving)\b/;

/* ---------- THE TYPE: one of QTYPE_ORDER for every question part, never empty. */
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
    const kind = QT_DRAW_KINDS.find(p => k.indexOf(p[0]) !== -1);
    if (kind) return kind[1];
    if (said) return said[0];
    if (t === 'annotate') return 'label';
    return /grid|coord/.test(qtS_(r.figure) + surf) ? 'points' : 'shape';
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
    if (qtTrue_(r.needs_print) || qtTrue_(r.print_required)) return 'print';
    /* nothing to mark it by yet: the scheme's own answer says whether it is words or a value */
    const a = qtS_(r.answer).replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' ');
    return !/\d/.test(a) && /[a-z]{3,}/i.test(a) ? 'words' : 'value';
  }
  if (/(?:^|,)\s*(expr|eqn)\s/.test(rules)) return 'expr';
  if (/(?:^|,)\s*mixed\b/.test(rules)) return 'fraction';
  if (QT_COORD.test(first)) return 'coords';
  if (qtMulti_(r)) return 'multi';
  if (QT_FRAC.test(first)) return 'fraction';
  if (qtExpr_(first)) return 'expr';
  if (/^[-−\d.\s]*[a-z]?\s*[<>≤≥]/i.test(first) && /[a-z]/i.test(first)) return 'expr';
  if (plain.some(w => QT_UNIT.test(w.replace(/^[-−\d.\s]+to\s+/i, '')) && /[a-z£$€%°]/i.test(w.replace(/^[a-z]\s*=\s*/i, '')))) return 'unit';
  if (/[a-z]{3,}/i.test(first) && !QT_ROMAN.test(first)) return 'words';
  return 'value';
}

/* ---------- COMPLETE: every `need` of its type's protocol met. Returns the needs NOT met ([] is complete). */
const QT_FORM = /\b(simplify|simplest|factori[sz]e|expand|multiply out|in the form|standard form|surd)\b/;
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
function qtIncomplete_(x) {
  const r = (x && x.row) || x || {};
  const p = QTYPE_PROTOCOL[qType_(r)];
  return p ? p.need.filter(n => !qtNeedMet_(r, n)) : ['type'];
}
/* MACHINE-MARKED: a way to mark it with no person and no AI — the same reading as library.js `ableOf_` (359). */
function qtMachine_(x) {
  const r = (x && x.row) || x || {};
  if (qtS_(r.choices) && qtS_(r.choice_right)) return true;
  return !!(qtS_(r.accept) || qtS_(r.mark_words) || qtS_(r.cells) || qtS_(r.draw_answer));
}
