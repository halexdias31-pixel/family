/* @family. — js/qtools-row.js A PART'S TOOL ROW: its marker, the pen, ruler and Check tiles, redrawn in place (cut from qtools.js; read as one by tools/piece-src.js). */
function markerOf_(x) {
  let kind = 'ai';
  try { kind = qtMarker_(workRow_(x || {})); } catch (e) { kind = 'ai'; }
  /* options with no key are still options to tap: their Check says the key is missing (never a person) */
  if (!isChoiceMarker_(kind) && x && Array.isArray(x.choices) && x.choices.length >= 2) kind = orderIs_(x) ? 'order' : 'choice';
  /* NO MARK SCHEME is no accept, key words, cells, options or answer (round 4): an importer's note alone is not a scheme to mark against */
  const ready = Object.prototype.hasOwnProperty.call(MARKER_READY, kind) ? MARKER_READY[kind](x) : true;
  const how = ready ? QT_HOW_ALL : QT_NO_SCHEME;
  return { kind, ready, how };
}
/* THE CHECK TILE FOR THAT MARKER, last in the row. An AI part whose marker is off says why under the row, not by vanishing. */
function qtCheck_(x, m) {
  const k = (m || markerOf_(x)).kind;
  if (QT_SCHEME_KINDS[k] && (m || markerOf_(x)).ready) return tile_({ send: true, act: 'qp-check', cls: 'qp-check' });
  if (k === 'cells') return tile_({ send: true, act: 'qp-cells-check', cls: 'qp-check' });
  if (k === 'draw') return tile_({ send: true, act: 'pad-check', cls: 'qp-check' });
  /* NO SCHEME, NO AI CHECK: a request could only fail, so its Check says so under the row, as options with no key do (round 4) */
  if (!(m || markerOf_(x)).ready) return tile_({ send: true, act: 'qp-noscheme', cls: 'qp-check', data: { key: (x && x.key) || '' } });
  const ai = typeof aiOpts_ === 'function' ? tile_(aiOpts_(x)) : '';
  return ai || tile_({ send: true, act: 'qp-ai', cls: 'qp-ai-go qp-check', off: true });
}
/* ---------- THE ROW. QT_ROW on every part, the pen's tiles where there is a figure, then Undo, Clear and Check (1020). */
const PEN_OPEN = new Set();
/* WHAT `qPartCard_` HANDS THE NEXT ROW DRAWN: its part's other tiles; `used` says a row took them */
const QT_MORE = { html: '', used: false };      // parts whose pen was opened this visit (the surface is made on the first Pen tap)
/* EACH TOOL'S OWN TILE, by its id in QT_TOOLS: a `tile(t, x, key)` of its own, else the one lit-by-`qtToolOn_` tile below */
const QT_TILE = {
  mag: () => typeof magOpts_ === 'function' ? magOpts_() : null,
  lock: () => typeof qLockOpts_ === 'function' ? qLockOpts_() : null,
  read: (t, x, key) => {
    const o = typeof readAloudOpts_ === 'function' ? readAloudOpts_(x) : null;
    if (o) o.data = Object.assign({}, o.data, { part: 1 });
    return o || { icon: t.icon, label: t.label, note: 'not on this device', act: 'read-aloud', cls: 'read-aloud', off: true, data: { key } };
  },
  /* ONLY WHERE A CALCULATOR IS ALLOWED: a Non-calculator paper never shows it; unknown shows it (owner, 11 Nov) */
  calc: (t, x, key) => calcAllowed_(x) ? { icon: t.icon, label: t.label, note: t.note, act: t.act, cls: 'qt-t qt-calc', on: QCALC_OPEN.has(key), pressed: QCALC_OPEN.has(key), data: { tool: t.id, key } } : null,
  /* SIGNED IN, ON A PAPER: the whole paper downloaded for no connection (offline.js) */
  offline: (t, x) => (typeof offOpts_ === 'function' ? offOpts_(x) : null),
  photo: (t, x) => ({ icon: t.icon, label: t.label, note: t.note, act: 'qp-work', cls: 'qp-work-go qt-t', data: { k: ansKey_(x), tool: t.id } }),
};
/* THE PAD'S KEY A PEN OR INSTRUMENT TILE READS, '' for the rest; and the tool that pad holds, '' when it is not taking the pen */
const qtPadKey_ = (t, x) => t && (t.act === 'qt-pen' || t.act === 'qt-inst') && typeof padKey_ === 'function' ? padKey_(x) : '';
const qtInHand_ = pk => pk && typeof PAD_ON !== 'undefined' && PAD_ON === pk ? (PAD_TOOL.get(pk) || 'pen') : '';
function qtToolOpts_(t, x) {
  const key = (x && x.key) || '';
  if (QT_TILE[t.id]) return QT_TILE[t.id](t, x, key);
  /* A CARD DRAWN AGAIN keeps the tool in hand lit, by the one rule `qtLight_` uses too */
  const pk = qtPadKey_(t, x);
  const on = qtToolOn_(t.id, key, pk, qtInHand_(pk));
  const cls = 'qt-t' + (isMeasureTool_(t.id) ? ' q-meast' : '');
  return { icon: t.icon, label: t.label, note: t.note, act: t.act, cls, on, pressed: on, data: { tool: t.id, key } };
}
/* IS THIS TOOL IN HAND, the one rule: Ruler or Protractor laid on a figure (MEAS), the protractor on the pad, the rest the pad's tool */
/* A MEASURING TOOL NOT LAID ON A FIGURE: the ruler is then out of hand; the protractor may still be on the pad. */
const MEASURE_ON_PAD = { ruler: () => false, protractor: pk => !!(pk && padProtOn_(pk)) };
function qtToolOn_(id, key, pk, inHand) {
  if (isMeasureTool_(id) && typeof MEAS !== 'undefined' && MEAS && MEAS.k === key && MEAS.tool === id) return true;
  if (Object.prototype.hasOwnProperty.call(MEASURE_ON_PAD, id)) return MEASURE_ON_PAD[id](pk);
  if (!pk || !inHand) return false;
  return inHand === QT_PAD_TOOL[id];
}
/* EVERY PEN/INSTRUMENT TILE UNDER `root` LIT AGAIN BY `qtToolOn_`, in place; `inHand` stands in for the tool of a pad being armed */
function qtLight_(root, inHand) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('.qt-row .qt-t[data-do="qt-inst"], .qt-row .qt-t[data-do="qt-pen"]').forEach(t => {
    const card = t.closest('.qcard'), pad = card && card.querySelector('.qpad');
    const pk = (pad && pad.getAttribute('data-k')) || '';
    const lit = qtToolOn_(t.getAttribute('data-tool'), t.getAttribute('data-key') || '', pk, inHand !== undefined ? inHand : qtInHand_(pk));
    tileSet_(t, { on: lit, pressed: lit });
  });
}
function qtRow_(x, held) {
  if (!x || !x.key) return '';
  const key = x.key;
  /* A CARD DRAWN AGAIN WHILE ITS RULER IS OUT gets it back on the new figure, once the markup is in */
  if (typeof MEAS !== 'undefined' && MEAS && MEAS.k === key && typeof setTimeout === 'function') setTimeout(measRepaint_, 0);
  /* QT_ROW ON EVERY PART; the pen's tiles, Undo and Clear only where the pad is already on the card (1020) */
  const art = typeof padReady_ !== 'function' || padReady_(x);
  const ids = QT_ROW.concat(art ? Object.keys(QT_DRAWING) : []);
  const tools = tile_(ids.map(qtTool_).filter(Boolean).map(t => qtToolOpts_(t, x))) + (art && typeof padUndoTiles_ === 'function' ? padUndoTiles_(x) : '');
  const m = markerOf_(x);
  /* A PART OF A WHOLE QUESTION (owner, 8 Nov): its Show-the-answer and card tiles join this row, so the part has one row, not three */
  const more = QT_MORE.html; QT_MORE.html = ''; QT_MORE.used = true;
  const wk = typeof ansKey_ === 'function' && isQ_(x) ? ansKey_(x) : '';
  const work = wk && typeof workGoOpts_ === 'function' ? `<span class="qp-work-slot" data-k="${esc(wk)}">${tile_(workGoOpts_(wk))}</span>` : '';
  /* THE FOUR (owner, 9 Nov): Send/Check, Message, Star, ⋯; the tools, help, share and suggest wait behind ⋯ (`kcFour_`). */
  const four = kcFour_(x, `<span class="qt-tools">${tools}</span>${held || ''}${work}${more}`, qtCheck_(x, m));
  /* NO GREY LINE UNDER IT (owner, 9 Nov): how a part is marked is said when Check is pressed, on its verdict line. */
  return `<div class="tile-row qt-row kc-row" role="toolbar" aria-label="Tools" data-key="${esc(key)}">${four}</div>`;
}
const qtItem_ = key => { try { return stuffItemsAll_().find(it => it && it.key === key) || null; } catch (e) { return null; } };
const qtKeyOf_ = el => (el && el.getAttribute('data-key')) || '';
/* ---------- THE CARD DRAWN AGAIN, where it stands: what a pen opened needs, its plan forgotten first. */
/* A PART'S PEN OPENED OR PUT AWAY, and the plans that read it forgotten: what the card is drawn from next. */
function qtPenSet_(x, on) {
  if (!x || !x.key) return;
  if (on) PEN_OPEN.add(x.key); else PEN_OPEN.delete(x.key);
  CHUNK_MEMO.delete(x);   // a WeakMap's delete never throws, whatever it is given
  STEM_PEN = { from: null, svgs: null };
}
function qtRedraw_(card, x) {
  if (!card || !x) return null;
  qtPenSet_(x, PEN_OPEN.has(x.key));
  const t = document.createElement('div');
  /* A FIND CARD STAYS IN THE ONE CARD SHAPE when drawn again (owner 1a, 8 Nov). */
  t.innerHTML = card.classList.contains('kc') && isQ_(x) ? findCard(x) : questionCard_(x, card);
  const next = t.firstElementChild;
  if (!next) return null;
  card.replaceWith(next);
  return next;
}
