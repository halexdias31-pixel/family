/* @family. — qtools.js THE ONE TOOL ROW (round 3, the owner's design): every tool on every question part, in one
   place and one order; only the marker varies. The page is words, figure, options, one answer box, this row, the verdict. */

/* ---------- THE REGISTRY: what each tool is called, the act its tile carries, and how it opens, closes, saves and restores. */
/* `open`/`close` take the card and the part; `save`/`restore` read and write the part's one record (`partRec_`). */
/* THE OWNER'S ROW (round 4): no Grid, Table or Formula sheet -- a question brings its own -- one padlock; Calculator back (owner, 11 Nov) */
const QT_TOOLS = [
  /* ONE PEN (owner, 24 Nov): Point, Line, Curve, Shade and Compass are one tile; the stroke is read on lift (find-pad.js `padRead1_`) */
  { id: 'pen',        icon: 'pen',        label: 'Pen',             note: 'tap to draw; again to stop', act: 'qt-pen' },
  /* ONE MEASURE (owner, 24 Nov): a ruler; tapped again, a protractor; again, put away (find-measure.js `measOpen_`) */
  { id: 'measure',    icon: 'ruler',      label: 'Measure',         note: 'a ruler, then a protractor', act: 'qt-inst' },
  { id: 'read',       icon: 'speak',      label: 'Read aloud',      note: 'reads the question out',   act: 'read-aloud' },
  { id: 'calc',       icon: 'calc',       label: 'Calculator',      note: 'scientific',               act: 'qt-calc' },
  { id: 'check',      icon: 'send',       label: 'Check',           note: '',                         act: '' },
];
/* THE ONE ROW EVERY PART SHOWS, identically (owner, 8 Nov): data/settings/qengine.json `row`, as qtypes.js carries it (QENGINE) */
const QT_ROW = QENGINE.row;
/* THE PEN'S TILES, added only where the part has a figure to draw on (a drawing answer needs its pen) */
const QT_DRAWING = { pen: 1 };
/* THE PEN'S OWN NAME FOR EACH DRAWING TILE: Straight line is the pad's `ruler` mode (a line from press to lift, `padStroke_`). */
const QT_PAD_TOOL = { pen: 'pen' };
const qMulti_ = x => { try { return (questionParts_()[qId_(x)] || []).length > 1; } catch (e) { return false; } };
const qtTool_ = id => QT_TOOLS.find(t => t.id === id) || null;

/* WHAT THE PART HOLDS, every kind of answer in one shape. The typed box and the pen go to the account under their own
   synced keys (answers.js, the server's ceilings); the record reads them, so nothing saved before it is lost. */

/* ---------- THE MARKER: the one thing that varies between parts -- qtypes.js `qtMarker_`, which the Function tag reads too. */
/* WHAT THE LINE UNDER CHECK SAYS, by marker: how this part will be marked, before it is. Never a person. */
/* ONE LINE UNDER EVERY ROW (owner, 9 Nov): marking is one path for every type, so it says the same words everywhere. */
const QT_HOW_ALL = 'Marked by its mark scheme where a rule can; otherwise your work is saved, not marked';
/* the markers `mark_` (find-marking.js) reads off the typed box: one Check, `qp-check`, for all of them */
const QT_SCHEME_KINDS = { choice: 1, order: 1, accept: 1, words: 1 };
/* `ready` is false where the marker has nothing to mark against yet (no key, no scheme): Check says so instead of asking */
const QT_NO_SCHEME = 'No mark scheme yet \u2014 flag it and we will add one';
/* IS A MARKER'S SCHEME THERE: options with a key; the rest are ready as written (a part with no exact key saves, never marks: owner, 16 Nov). */
const choiceKeyed_ = x => (Array.isArray(x.choiceRight) ? x.choiceRight.length > 0 : !!x.choiceRight);
const MARKER_READY = { choice: choiceKeyed_, order: choiceKeyed_ };
/* THE PEN: the card's pad, made on the first tap where the part has none -- its figure, else its stem's, else a grid. */
function qtPenOpen_(el, tool) {
  const key = qtKeyOf_(el);
  let card = el.closest('.qcard');
  if (!card) return null;
  /* THE PART'S ONE SHEET HOLDS ITS PADS: the picture printed on it first, else its lines */
  let pad = card.querySelector('.qpad');
  if (!pad) {
    const x = qtItem_(key);
    if (!x) return null;
    qtPenSet_(x, true);
    card = qtRedraw_(card, x);
    pad = card && card.querySelector('.qpad');
  }
  if (pad) padToolPick_(pad, tool || 'pen');
  return pad;
}
on('qt-pen', el => { qtPenOpen_(el, QT_PAD_TOOL[el.getAttribute('data-tool')] || 'pen'); });
/* THE RULER AND THE PROTRACTOR FLOAT OVER THE PAGE like the calculator (owner, 20 Nov): no pen, no new screen (`measOpen_`, find-measure.js). The compass is the pen's. */
on('qt-inst', el => {
  const tool = el.getAttribute('data-tool') || 'ruler';
  if (isMeasureTool_(tool)) return measOpen_(el);
  qtPenOpen_(el, tool);
});
/* ---------- CHECK WITH NO MARK SCHEME: nothing is sent; the verdict line says what is missing, for a missing key too. */
on('qp-noscheme', el => {
  const mark = qMark_(el), out = mark && mark.querySelector('.qp-verdict');
  if (out) tell_(out, 'info', QT_NO_SCHEME);
});

