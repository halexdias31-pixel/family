/* @family. — qtools.js THE ONE TOOL ROW (round 3, the owner's design): every tool on every question part, in one
   place and one order; only the marker varies. The page is words, figure, options, one answer box, this row, the verdict. */

/* ---------- THE REGISTRY: what each tool is called, the act its tile carries, and how it opens, closes, saves and restores. */
/* `open`/`close` take the card and the part; `save`/`restore` read and write the part's one record (`partRec_`). */
const QT_TOOLS = [
  { id: 'pen',        icon: 'pen',        label: 'Pen',             note: 'draw on the figure',       act: 'qt-pen' },
  { id: 'ruler',      icon: 'ruler',      label: 'Ruler',           note: 'measure or rule a line',   act: 'qt-inst' },
  { id: 'protractor', icon: 'protractor', label: 'Protractor',      note: 'measure an angle',         act: 'qt-inst' },
  { id: 'compass',    icon: 'compass',    label: 'Compass',         note: 'press the centre, drag',   act: 'qt-inst' },
  { id: 'grid',       icon: 'grid',       label: 'Grid',            note: 'squares, then axes',       act: 'qt-grid' },
  { id: 'calc',       icon: 'calc',       label: 'Calculator',      note: 'scientific',               act: 'qt-panel', panel: true },
  { id: 'table',      icon: 'table',      label: 'Table',           note: 'rows and columns',         act: 'qt-panel', panel: true },
  { id: 'photo',      icon: 'photo',      label: 'Photo of working', note: 'up to 3 pages',           act: 'qp-work' },
  { id: 'formula',    icon: 'integral',   label: 'Formula sheet',   note: 'the usual formulae',       act: 'qt-panel', panel: true },
  { id: 'mag',        icon: 'zoom',       label: 'Magnifier',       note: 'hold it over the page',    act: 'q-mag' },
  { id: 'read',       icon: 'speak',      label: 'Read aloud',      note: 'reads the question out',   act: 'read-aloud' },
  { id: 'check',      icon: 'send',       label: 'Check',           note: '',                         act: '' },
];
const QT_ORDER = QT_TOOLS.map(t => t.id);
const qtTool_ = id => QT_TOOLS.find(t => t.id === id) || null;

/* ---------- THE PART'S ONE RECORD (text, choice, cells, strokes, photos, table): read whole, the old keys folded in. */
const PART_MEM = new Map();
const partRecKey_ = x => 'part:' + (typeof whoIs_ === 'function' && whoIs_() ? whoIs_() + ':' : '') + ((x && (x.key || x.name)) || '?');
function partRecRaw_(x) {
  const k = partRecKey_(x);
  if (PART_MEM.has(k)) return PART_MEM.get(k);
  let rec = null;
  try { rec = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { rec = null; }
  if (!rec || typeof rec !== 'object') rec = { v: 1 };
  PART_MEM.set(k, rec);
  return rec;
}
function partRecPut_(x, field, v) {
  const k = partRecKey_(x), rec = partRecRaw_(x);
  if (v == null || v === '') delete rec[field]; else rec[field] = v;
  try { localStorage.setItem(k, JSON.stringify(rec)); } catch (e) { /* this visit only */ }
}
/* WHAT THE PART HOLDS, every kind of answer in one shape. The typed box and the pen still travel under their own
   synced keys (answers.js); this reads them, so an answer saved before the record existed is still found. */
function partRec_(x) {
  const rec = Object.assign({}, partRecRaw_(x));
  const ak = typeof ansKey_ === 'function' ? ansKey_(x) : '';
  const a = ak && typeof ansRead_ === 'function' ? ansRead_(ak) : '';
  const isChoice = Array.isArray(x && x.choices) && x.choices.length >= 2;
  const isCells = typeof cellsOf_ === 'function' && cellsOf_(x).length > 0;
  if (a) { if (isChoice) rec.choice = a; else if (isCells) rec.cells = a; else rec.text = a; }
  try { rec.strokes = typeof padRead_ === 'function' ? padRead_(padKey_(x)) : []; } catch (e) { rec.strokes = []; }
  rec.photos = (typeof WORK_PICS !== 'undefined' && WORK_PICS[ak]) ? WORK_PICS[ak].length : 0;
  return rec;
}

/* ---------- THE MARKER: the one thing that varies between parts -- qtypes.js `qtMarker_`, which the Function tag reads too. */
function markerOf_(x) {
  let kind = 'ai';
  try { kind = qtMarker_(workRow_(x || {})); } catch (e) { kind = 'ai'; }
  /* options with no key are still options to tap: their Check says the key is missing (never a person) */
  if (kind !== 'choice' && kind !== 'order' && x && Array.isArray(x.choices) && x.choices.length >= 2) kind = orderIs_(x) ? 'order' : 'choice';
  return { kind };
}
/* THE CHECK TILE FOR THAT MARKER, last in the row. An AI part whose marker is off says why under the row, not by vanishing. */
function qtCheck_(x) {
  const k = markerOf_(x).kind;
  if (k === 'choice') return checkTile_({ act: 'qp-choice-check', cls: 'qp-check' });
  if (k === 'order') return checkTile_({ act: 'qp-order-send', cls: 'qp-order-send qp-check' });
  if (k === 'cells') return checkTile_({ act: 'qp-cells-check', cls: 'qp-check' });
  if (k === 'draw') return checkTile_({ act: 'pad-check', cls: 'qp-check' });
  if (k === 'accept') return checkTile_({ act: 'qp-check', cls: 'qp-check' });
  if (k === 'words') return checkTile_({ act: 'qp-rule', cls: 'qp-check' });
  const ai = typeof aiTile_ === 'function' ? aiTile_(x) : '';
  return ai || checkTile_({ act: 'qp-ai', cls: 'qp-ai-go qp-check', off: true });
}

/* ---------- THE ROW. Always all twelve, in QT_ORDER; on a phone the eleven tools fold behind one Tools tile, Check stays out. */
const QT_OPEN = new Set();       // parts whose folded row is open, by key, for the visit
const QT_PANEL = new Map();      // the panel open under a part's row: 'calc' | 'table' | 'formula'
const QT_GRID = new Map();       // a part's grid: 'grid' | 'coord'
const PEN_OPEN = new Set();      // parts whose pen was opened this visit (the surface is made on the first Pen tap)
function qtToolTile_(t, x) {
  const key = (x && x.key) || '';
  if (t.id === 'mag') return typeof magTile_ === 'function' ? magTile_() : '';
  if (t.id === 'read') {
    const live = typeof readAloudTile_ === 'function' ? readAloudTile_(x) : '';
    return live || tile_({ icon: t.icon, label: t.label, note: 'not on this device', act: 'read-aloud', cls: 'read-aloud', off: true, data: { key } });
  }
  if (t.id === 'photo') {
    return tile_({ icon: t.icon, label: t.label, note: t.note, act: 'qp-work', cls: 'qp-work-go qt-t', data: { k: ansKey_(x), tool: t.id } });
  }
  /* A CARD DRAWN AGAIN keeps the tool in hand lit -- `padArm_`'s rule, read off PAD_ON and PAD_TOOL, which outlive the markup */
  const pk = (t.act === 'qt-pen' || t.act === 'qt-inst') && typeof padKey_ === 'function' ? padKey_(x) : '';
  const held = !!pk && PAD_ON === pk && (t.id === 'protractor' ? padProtOn_(pk) : (PAD_TOOL.get(pk) || 'pen') === t.id);
  const on = t.panel ? QT_PANEL.get(key) === t.id : t.id === 'grid' ? !!QT_GRID.get(key) : held;
  const cls = 'qt-t' + ((t.id === 'ruler' || t.id === 'protractor') ? ' q-meast' : '');
  return tile_({ icon: t.icon, label: t.label, note: t.note, act: t.act, cls, on, pressed: on, data: { tool: t.id, key } });
}
function qtRow_(x) {
  if (!x || !x.key) return '';
  const key = x.key, open = QT_OPEN.has(key);
  /* A CARD DRAWN AGAIN WHILE ITS RULER IS OUT gets it back on the new figure, once the markup is in */
  if (typeof MEAS !== 'undefined' && MEAS && MEAS.k === key && typeof setTimeout === 'function') setTimeout(measRepaint_, 0);
  const tools = QT_TOOLS.filter(t => t.id !== 'check').map(t => qtToolTile_(t, x)).join('');
  const fold = tile_({ icon: 'tools', label: 'Tools', note: open ? 'fold them away' : 'pen, ruler, calculator …', act: 'qt-fold', cls: 'qt-fold', on: open, pressed: open, data: { key } });
  return `<div class="tile-row qt-row${open ? ' is-open' : ''}" role="toolbar" aria-label="Tools" data-key="${esc(key)}">${fold}<span class="qt-tools">${tools}</span>${qtCheck_(x)}</div>
    <div class="qt-panel" data-key="${esc(key)}"${QT_PANEL.has(key) ? '' : ' hidden'}>${qtPanelHtml_(x)}</div>`;
}
const qtItem_ = key => { try { return stuffItemsAll_().find(it => it && it.key === key) || null; } catch (e) { return null; } };
const qtKeyOf_ = el => (el && el.getAttribute('data-key')) || '';

on('qt-fold', el => {
  const key = qtKeyOf_(el), row = el.closest('.qt-row');
  if (QT_OPEN.has(key)) QT_OPEN.delete(key); else QT_OPEN.add(key);
  if (row) row.classList.toggle('is-open', QT_OPEN.has(key));
  tileSet_(el, { on: QT_OPEN.has(key), pressed: QT_OPEN.has(key) });
});

/* ---------- THE CARD DRAWN AGAIN, where it stands: what a pen opened or a grid changed needs, its plan forgotten first. */
/* A PART'S PEN OPENED OR PUT AWAY, and the plans that read it forgotten: what the card is drawn from next. */
function qtPenSet_(x, on) {
  if (!x || !x.key) return;
  if (on) PEN_OPEN.add(x.key); else PEN_OPEN.delete(x.key);
  try { CHUNK_MEMO.delete(x); } catch (e) {}
  STEM_PEN = { from: null, svgs: null };
}
function qtRedraw_(card, x) {
  if (!card || !x) return null;
  qtPenSet_(x, PEN_OPEN.has(x.key));
  const t = document.createElement('div');
  t.innerHTML = questionCard_(x);
  const next = t.firstElementChild;
  if (!next) return null;
  card.replaceWith(next);
  return next;
}
/* THE PEN: the card's pad, made on the first tap where the part has none -- its figure, else its stem's, else a grid. */
function qtPenOpen_(el, tool) {
  const key = qtKeyOf_(el);
  let card = el.closest('.qcard');
  if (!card) return null;
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
on('qt-pen', el => { qtPenOpen_(el, 'pen'); });
/* RULER AND PROTRACTOR lie on the figure when there is one and no pen; under a pen they are the pen's; with neither, they open the pen. */
on('qt-inst', el => {
  const tool = el.getAttribute('data-tool') || 'ruler';
  const card = el.closest('.qcard');
  const pad = card && card.querySelector('.qpad');
  if (!pad && (tool === 'ruler' || tool === 'protractor') && card && card.querySelector('figure svg')) return measOpen_(el);
  qtPenOpen_(el, tool);
});
/* THE GRID: squares, then axes, then off -- on the made-up surface it is the surface, on a figure it lies over it. */
on('qt-grid', el => {
  const key = qtKeyOf_(el), x = qtItem_(key), card = el.closest('.qcard');
  if (!x || !card) return;
  const was = QT_GRID.get(key) || '';
  const next = was === '' ? 'grid' : was === 'grid' ? 'coord' : '';
  if (next) QT_GRID.set(key, next); else QT_GRID.delete(key);
  partRecPut_(x, 'grid', next);
  if (next) qtPenSet_(x, true);
  qtRedraw_(card, x);
});
/* the grid a part was left with comes back with it */
function qtGridOf_(x) {
  const key = x && x.key;
  if (!key) return '';
  if (!QT_GRID.has(key)) { const g = partRecRaw_(x).grid; if (g === 'grid' || g === 'coord') QT_GRID.set(key, g); }
  return QT_GRID.get(key) || '';
}

/* ---------- THE PANELS under the row: one at a time, a second tap folds it. */
on('qt-panel', el => {
  const key = qtKeyOf_(el), tool = el.getAttribute('data-tool') || '', x = qtItem_(key);
  const card = el.closest('.qcard');
  if (!x || !card) return;
  if (QT_PANEL.get(key) === tool) QT_PANEL.delete(key); else QT_PANEL.set(key, tool);
  const panel = card.querySelector(`.qt-panel[data-key="${CSS.escape(key)}"]`);
  if (panel) { panel.innerHTML = qtPanelHtml_(x); panel.hidden = !QT_PANEL.has(key); }
  card.querySelectorAll('.qt-row .qt-t[data-do="qt-panel"]').forEach(t => {
    const lit = QT_PANEL.get(key) === t.getAttribute('data-tool');
    tileSet_(t, { on: lit, pressed: lit });
  });
});
function qtPanelHtml_(x) {
  const p = QT_PANEL.get(x && x.key);
  if (p === 'calc') return calcHtml_(x);
  if (p === 'table') return tableHtml_(x);
  if (p === 'formula') return formulaHtml_();
  return '';
}

/* ---------- THE CALCULATOR: scientific, in the page, no network -- the Tools column's engine (arcade.js `calcKey`), one per part. */
const QCALC_KEYS = [['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan'], ['sqrt', '√'], ['sq', 'x²'],
  ['7', '7'], ['8', '8'], ['9', '9'], ['÷', '÷'], ['(', '('], ['4', '4'], ['5', '5'], ['6', '6'], ['×', '×'], [')', ')'],
  ['1', '1'], ['2', '2'], ['3', '3'], ['−', '−'], ['pow', 'xʸ'], ['0', '0'], ['.', '.'], ['pi', 'π'], ['+', '+'], ['frac', 'a/b'],
  ['log', 'log'], ['Ans', 'Ans'], ['del', '⌫'], ['C', 'AC'], ['=', '=']];
const QCALC = new Map();          // a part's calculator state, by key, for the visit
const qcalcOf_ = key => { if (!QCALC.has(key)) QCALC.set(key, calcNew()); return QCALC.get(key); };
function qcalcShow_(st) {
  const h = calcHtml(st);
  return `<div class="qcalc-in">${h.input}</div><div class="qcalc-res">${h.output || (st.root.length ? '' : '0')}</div>`;
}
function calcHtml_(x) {
  const st = qcalcOf_(x.key);
  return `<div class="qcalc" data-key="${esc(x.key)}" role="group" aria-label="Calculator">
    <output class="qcalc-out" aria-live="polite">${qcalcShow_(st)}</output>
    <div class="qcalc-keys">${QCALC_KEYS.map(k => `<button type="button" class="qcalc-k${/^[\d.]$/.test(k[0]) ? '' : ' is-op'}${k[0] === '=' ? ' is-eq' : ''}" data-do="qcalc-key" data-v="${esc(k[0])}">${esc(k[1])}</button>`).join('')}</div>
    <div class="tile-row">${tile_({ icon: 'in', label: 'Put in my answer', act: 'qcalc-use', cls: 'qcalc-use', data: { key: x.key } })}</div>
  </div>`;
}
on('qcalc-key', el => {
  const box = el.closest('.qcalc'), out = box && box.querySelector('.qcalc-out');
  const key = box && box.getAttribute('data-key');
  if (!out || !key) return;
  const st = qcalcOf_(key);
  try { calcKey(st, el.getAttribute('data-v')); } catch (e) { st.err = (e && e.calc) || 'Math ERROR'; }
  out.innerHTML = qcalcShow_(st);
  const x = qtItem_(key);
  if (x && st.fresh && st.val != null) partRecPut_(x, 'calc', calcText(st.val, st.dec));
});
/* THE RESULT INTO THE ANSWER BOX, through the box's own writer so it is saved and marked like a typed one. */
on('qcalc-use', el => {
  const card = el.closest('.qcard'), key = qtKeyOf_(el), st = QCALC.get(key);
  const inp = card && card.querySelector('.qp-ans-in');
  if (!inp || !st || !st.fresh || st.val == null) return;
  inp.value = (inp.value || '') + calcText(st.val, st.dec);
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  if (typeof kpRender_ === 'function') kpRender_(inp);
});

/* ---------- THE TABLE: rows and columns to work in, on any part; kept in the part's record. */
const TABLE_START = [['', '', ''], ['', '', ''], ['', '', '']];
function tableOf_(x) {
  const t = partRecRaw_(x).table;
  return Array.isArray(t) && t.length && t.every(Array.isArray) ? t : TABLE_START.map(r => r.slice());
}
function tableHtml_(x) {
  const t = tableOf_(x);
  return `<div class="qt-table" data-key="${esc(x.key)}">
    <table><tbody>${t.map((r, i) => `<tr>${r.map((c, j) => `<td><input class="qt-cell" data-i="${i}" data-j="${j}" aria-label="Row ${i + 1}, column ${j + 1}" value="${esc(c)}" autocomplete="off"></td>`).join('')}</tr>`).join('')}</tbody></table>
    <div class="tile-row">${tile_({ icon: 'plus', label: 'Row', act: 'qt-table-row', data: { key: x.key } })}${tile_({ icon: 'plus', label: 'Column', act: 'qt-table-col', data: { key: x.key } })}${tile_({ icon: 'bin', label: 'Clear', act: 'qt-table-clear', data: { key: x.key } })}</div>
  </div>`;
}
document.addEventListener('input', e => {
  const c = e.target && e.target.classList && e.target.classList.contains('qt-cell') ? e.target : null;
  const box = c && c.closest('.qt-table'), x = box && qtItem_(box.getAttribute('data-key'));
  if (!x) return;
  const t = tableOf_(x);
  const i = +c.getAttribute('data-i'), j = +c.getAttribute('data-j');
  if (t[i]) t[i][j] = c.value;
  partRecPut_(x, 'table', t);
});
function tableEdit_(el, fn) {
  const box = el.closest('.qt-table'), x = qtItem_(qtKeyOf_(el));
  if (!box || !x) return;
  const t = fn(tableOf_(x));
  partRecPut_(x, 'table', t && t.length ? t : null);
  box.outerHTML = tableHtml_(x);
}
on('qt-table-row', el => tableEdit_(el, t => t.concat([t[0].map(() => '')])));
on('qt-table-col', el => tableEdit_(el, t => t.map(r => r.concat(['']))));
on('qt-table-clear', el => tableEdit_(el, () => null));

/* ---------- THE FORMULA SHEET: what an exam's formulae page gives, here beside the question. */
const FORMULAE = [
  ['Area of a circle', 'A = πr²'], ['Circumference', 'C = 2πr'], ['Area of a triangle', 'A = ½ab sin C'],
  ['Trapezium', 'A = ½(a + b)h'], ['Pythagoras', 'a² + b² = c²'], ['Trigonometry', 'sin θ = o/h, cos θ = a/h, tan θ = o/a'],
  ['Sine rule', 'a/sin A = b/sin B = c/sin C'], ['Cosine rule', 'a² = b² + c² − 2bc cos A'],
  ['Quadratic formula', 'x = (−b ± √(b² − 4ac)) / 2a'], ['Volume of a prism', 'V = area of cross-section × length'],
  ['Sphere', 'V = ⁴⁄₃πr³, A = 4πr²'], ['Cone', 'V = ⅓πr²h, curved A = πrl'], ['Speed', 'speed = distance ÷ time'],
  ['Density', 'density = mass ÷ volume'], ['Pressure', 'pressure = force ÷ area'], ['Compound interest', 'P(1 + r/100)ⁿ'],
  ['Kinetic energy', 'Eₖ = ½mv²'], ['Weight', 'W = mg'], ['Ohm’s law', 'V = IR'], ['Power', 'P = IV = E/t'],
  ['Moles', 'n = mass ÷ Mᵣ'], ['Wave speed', 'v = fλ'],
];
const formulaHtml_ = () => `<dl class="qt-formula">${FORMULAE.map(f => `<div><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join('')}</dl>`;

/* ---------- CHECK ON OPTIONS: a tap marks already; Check says the verdict again, or what is missing. */
on('qp-choice-check', el => {
  const mark = el.closest('.qp-mark'), card = el.closest('.qcard');
  const box = card && card.querySelector('.qp-choices');
  const out = mark && mark.querySelector('.qp-verdict');
  if (!box || !out) return;
  const right = box.getAttribute('data-right');
  if (!right) { out.textContent = 'No answer key for this one yet — flag it and we will add one'; return; }
  const picked = box.querySelectorAll('.qp-opt.is-picked').length;
  if (!picked) { out.textContent = 'Tap an option first'; return; }
  out.textContent = box.classList.contains('is-done') ? 'Correct' : 'Not yet — have another go';
});
