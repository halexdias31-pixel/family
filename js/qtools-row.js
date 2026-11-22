/* @family. — js/qtools-row.js A PART'S TOOL ROW: its marker, the pen, ruler and Check tiles, redrawn in place (cut from qtools.js; read as one by tools/piece-src.js). */
function markerOf_(x) {
  let kind = 'save';
  try { kind = qtMarker_(workRow_(x || {})); } catch (e) { kind = 'save'; }
  /* options with no key are still options to tap: their Check says the key is missing (never a person) */
  if (!isChoiceMarker_(kind) && x && Array.isArray(x.choices) && x.choices.length >= 2) kind = orderIs_(x) ? 'order' : 'choice';
  /* NO MARK SCHEME is no accept, key words, cells, options or answer (round 4): an importer's note alone is not a scheme to mark against */
  const ready = Object.prototype.hasOwnProperty.call(MARKER_READY, kind) ? MARKER_READY[kind](x) : true;
  const how = ready ? QT_HOW_ALL : QT_NO_SCHEME;
  return { kind, ready, how };
}
/* THE CHECK TILE FOR THAT MARKER, last in the row. A part with no exact key has no Check: its tile saves the work (owner, 16 Nov: marking is mechanical only). */
function qtCheckOpts_(x, m) {
  m = m || markerOf_(x);
  if (QT_SCHEME_KINDS[m.kind] && m.ready) return { send: true, act: 'qp-check', cls: 'qp-check' };
  if (m.kind === 'cells') return { send: true, act: 'qp-cells-check', cls: 'qp-check' };
  if (m.kind === 'draw') return { send: true, act: 'pad-check', cls: 'qp-check' };
  /* OPTIONS WITH NO KEY: their Check says so under the row (round 4) */
  if (!m.ready) return { send: true, act: 'qp-noscheme', cls: 'qp-check', data: { key: (x && x.key) || '' } };
  /* LEVEL-MARKED (tools/validate-questions.js `tutor`): saved for the tutor, and it says so */
  return Object.assign({ send: true, label: text_('save'), act: 'qp-send', cls: 'qp-send' }, typeof qStatus_ === 'function' && qStatus_(x) === 'tutor' ? { note: 'marked by your tutor' } : {});
}
/* ---------- THE ROW. QT_ROW on every part, the pen's tiles where there is a figure, then Undo, Clear and Check (1020). */
const PEN_OPEN = new Set();
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
  calc: (t, x, key) => calcAllowed_(x) ? { icon: t.icon, label: t.label, note: t.note, act: t.act, cls: 'qt-t qt-calc', on: floatIs_('calc', key), pressed: floatIs_('calc', key), data: { tool: t.id, key } } : null,
  /* SIGNED IN, ON A PAPER: the whole paper downloaded for no connection (offline.js) */
  offline: (t, x) => (typeof window.offOpts_ === 'function' ? window.offOpts_(x) : null),
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
/* IS THIS TOOL IN HAND, the one rule: the calculator, Ruler or Protractor floating for this part (`floatIs_`, find-measure.js), the rest the pad's tool */
function qtToolOn_(id, key, pk, inHand) {
  if ((isMeasureTool_(id) || id === 'calc') && typeof floatIs_ === 'function' && floatIs_(id, key)) return true;
  if (id === 'calc' || isMeasureTool_(id)) return false;
  if (!pk || !inHand) return false;
  return inHand === QT_PAD_TOOL[id];
}
/* EVERY PEN/INSTRUMENT TILE UNDER `root` LIT AGAIN BY `qtToolOn_`, in place; `inHand` stands in for the tool of a pad being armed */
function qtLight_(root, inHand) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('.qt-row .qt-t[data-do="qt-inst"], .qt-row .qt-t[data-do="qt-pen"], .qt-row .qt-t[data-do="qt-calc"]').forEach(t => {
    const card = t.closest('.qcard'), pad = card && card.querySelector('.qpad');
    const pk = (pad && pad.getAttribute('data-k')) || '';
    const lit = qtToolOn_(t.getAttribute('data-tool'), t.getAttribute('data-key') || '', pk, inHand !== undefined ? inHand : qtInHand_(pk));
    tileSet_(t, { on: lit, pressed: lit });
  });
}
/* A PART'S TILES AS DATA, Check first (rule 1.26): its tools, the pen's Undo and Clear, Show the answer, Help. ONE MARK BUTTON (owner, 15 Nov): no second one for photos. */
function qtTiles_(x, ans) {
  if (!x || !x.key) return [];
  /* AND ITS ANSWER BOX'S FACE: the student's pick, else the question's own (answer-face.js) */
  if (typeof ansFaceDue_ === 'function') ansFaceDue_(x);
  /* QT_ROW ON EVERY PART; the pen's tiles, Undo and Clear only where the pad is already on the card (1020) */
  const art = typeof padReady_ !== 'function' || padReady_(x);
  const ids = QT_ROW.concat(art ? Object.keys(QT_DRAWING) : []);
  return [qtCheckOpts_(x)].concat(ids.map(qtTool_).filter(Boolean).map(t => qtToolOpts_(t, x)),
    art && typeof padUndoOpts_ === 'function' ? padUndoOpts_(x) : [],
    [ans && typeof qaToggleOpts_ === 'function' ? qaToggleOpts_(ansKey_(x), ansOpen_(x)) : null,
      typeof helpOpts_ === 'function' ? helpOpts_(x, '') : null]).filter(Boolean);
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
  t.innerHTML = findCard(x);
  const next = t.firstElementChild;
  if (!next) return null;
  card.replaceWith(next);
  return next;
}
/* ---------- SIX AND MORE (owner, 22 Nov, queue step 5): the row's tiles split by data/settings/qengine.json `visible`, `more` and `cut`. */
/* At most six tiles shown, in `visible` order (a|b either act); the rest stay in the card, hidden, behind one More tile; `cut` ones are not drawn. */
const QT_VISIBLE = (QENGINE.visible || []).map(s => String(s).split('|'));
const qtTileAct_ = t => (/\bdata-do="([^"]*)"/.exec(t) || [])[1] || '';
function qtSplit_(html) {
  const all = (String(html || '').match(/<(button|a)\b[^>]*\bclass="tile\b[^"]*"[^>]*>[\s\S]*?<\/\1>/g) || []).filter(t => (QENGINE.cut || []).indexOf(qtTileAct_(t)) < 0);
  const shown = QT_VISIBLE.map(acts => { const t = all.find(u => acts.indexOf(qtTileAct_(u)) >= 0); if (t) all.splice(all.indexOf(t), 1); return t || ''; }).filter(Boolean);
  const rank = t => { const i = (QENGINE.more || []).indexOf(qtTileAct_(t)); return i < 0 ? 999 : i; };
  const rest = all.map((t, i) => [t, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(p => p[0]);
  if (!rest.length) return shown.join('');
  return shown.join('') + tile_({ icon: 'more', label: 'More', note: rest.length + ' more tools', act: 'qt-more' })
    + `<span class="kc-more" hidden>${rest.join('')}</span>`;
}
/* MORE OPENS THE ONE SHEET (`openSheet`), the hidden tiles drawn there as they stand now; a tap there closes it and presses the card's own tile. */
let QT_MORE_FROM = [];
on('qt-more', el => {
  const box = el.parentNode && el.parentNode.querySelector('.kc-more');
  QT_MORE_FROM = box ? [...box.querySelectorAll('.tile')] : [];
  /* A COPY ANSWERS ONLY TO ITS PLACE: its hook classes (`.help-hand`, `.qt-calc`) dropped, so no painter redraws it as the real tile. */
  const tiles = QT_MORE_FROM.map((t, i) => t.outerHTML.replace(/\bdata-do="[^"]*"/, 'data-do="qt-more-go" data-i="' + i + '"')
    .replace(/\bclass="([^"]*)"/, (m, c) => 'class="' + c.split(/\s+/).filter(k => /^(tile|on|is-[\w-]+)$/.test(k)).join(' ') + '"')).join('');
  openSheet('More', tileWrap_(tiles, ''));
});
on('qt-more-go', el => {
  const t = QT_MORE_FROM[+el.getAttribute('data-i')];
  closeSheet();
  /* AFTER THIS PRESS ENDS: a press inside a press is dropped as the same one (`pressAgain_`). */
  setTimeout(() => { if (t && t.isConnected) t.click(); }, 0);
});
