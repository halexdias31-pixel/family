/* @family. — calc.js THE QUESTION'S CALCULATOR (owner, 11 Nov; made calm and simple 20 Nov): one per part, floating over the page; the engine is calc-engine.js. */
const CALC_KEYBOARD = { Enter: '=', '=': '=', Backspace: 'del', Delete: 'C', Escape: 'C', ArrowLeft: 'left', ArrowRight: 'right',
  ArrowUp: 'up', ArrowDown: 'down', '*': '×', x: '×', '/': '÷', '-': '−', '+': '+', '^': 'pow', '(': '(', ')': ')', '.': '.',
  p: 'pi', s: 'sin', c: 'cos', t: 'tan', r: 'sqrt', f: 'frac', a: 'Ans', d: 'drg', Shift: null };
/* EACH PART'S OWN SUM, by its key, for the visit: a part's calculator opened again holds what it held */
const CALC_ST = new Map();
const calcOf_ = key => { if (!CALC_ST.has(key)) CALC_ST.set(key, calcNew()); return CALC_ST.get(key); };

/* THE FACE (owner, 20 Nov: "sleek, simpler"): a calm display, the sum above and the answer below; three rows of functions whose second meanings wait behind SHIFT; the number pad. */
/* Each key: [what it types, its face, what it types after SHIFT, that face, its name]. Faces are runs (renderCard's runs). */
const CALC_FACE = [
  [['shift', 'SHIFT', null, null, 'shift'], ['sin', 'sin', 'asin', ['sin', { sup: '−1' }]], ['cos', 'cos', 'acos', ['cos', { sup: '−1' }]], ['tan', 'tan', 'atan', ['tan', { sup: '−1' }]], ['(', '(', null, null, 'open bracket']],
  [['sq', ['x', { sup: '2' }], 'cube', ['x', { sup: '3' }], 'squared'], ['pow', ['x', { sup: '■' }], 'inv', ['x', { sup: '−1' }], 'power'], ['sqrt', '√', 'cbrt', '∛', 'square root'], ['frac', 'a/b', null, null, 'fraction'], [')', ')', null, null, 'close bracket']],
  [['pi', 'π', 'e', { i: 'e' }, 'pi'], ['log', 'log', 'ln', 'ln', 'log'], ['left', '◀', 'up', '▲', 'left'], ['right', '▶', 'down', '▼', 'right'], ['sd', 'S⇔D', 'approx', '≈', 'format']],
  [['7', '7'], ['8', '8'], ['9', '9'], ['del', '⌫', null, null, 'delete'], ['C', 'AC', null, null, 'all clear']],
  [['4', '4'], ['5', '5'], ['6', '6'], ['×', '×', null, null, 'times'], ['÷', '÷', null, null, 'divide']],
  [['1', '1'], ['2', '2'], ['3', '3'], ['+', '+', null, null, 'plus'], ['−', '−', null, null, 'minus']],
  [['0', '0'], ['.', '.', null, null, 'point'], ['e10', ['×10', { sup: 'x' }], null, null, 'times 10 to the power'], ['Ans', 'Ans'], ['=', '=', null, null, 'equals']],
];
/* THE DISPLAY: SHIFT and DEG/RAD in small type, the sum, the answer. */
function calcScreen_(st) {
  const h = calcHtml(st);
  return cardBlocks_([{ type: 'group', look: 'mc-stat', attrs: { 'aria-hidden': 'true' }, inner: (st.shift ? '<b>SHIFT</b>' : '') + (st.past.length ? '<b>▲</b>' : '') },
    { type: 'group', look: 'mc-in', inner: h.input }, { type: 'group', look: 'mc-out', inner: h.output || (st.root.length ? '' : '0') }]);
}
const calcKeyHtml_ = (k, row) => tile_({ form: true, look: 'mc-btn' + (row > 2 ? ' mc-n' : ' mc-f') + (/^[0-9.]$/.test(k[0]) ? ' mc-d' : '') + (k[0] === '=' ? ' mc-eq' : '') + (k[0] === 'shift' ? ' mc-sh' : '') + (k[0] === 'C' || k[0] === 'del' ? ' mc-clr' : ''),
  act: 'qcalc-key', data: Object.assign({ mc: k[0] }, k[2] ? { alt: k[2] } : {}), aria: k[4] || k[0],
  html: '<span class="mc-lab">' + cardRuns_(k[1]) + '</span>' + (k[2] ? '<span class="mc-alt">' + cardRuns_(k[3]) + '</span>' : '') });
function calcFaceHtml_(key) {
  const st = calcOf_(key);
  return '<div class="calc' + (st.shift ? ' mc-shifted' : '') + '" data-key="' + esc(key) + '" role="group" aria-label="Calculator">'
    + '<div class="calc-head"><span class="calc-grip" aria-hidden="true"></span>'
    + tile_({ form: true, look: 'mc-drg', act: 'qcalc-key', data: { mc: 'drg' }, aria: 'Degrees or radians', label: st.rad ? 'RAD' : 'DEG' }) + '</div>'
    + '<div class="mc-display" tabindex="0" aria-live="polite" aria-label="Calculator display">' + calcScreen_(st) + '</div>'
    + CALC_FACE.map((r, i) => '<div class="calc-row' + (i === 2 ? ' calc-row-last' : '') + '">' + r.map(k => calcKeyHtml_(k, i)).join('') + '</div>').join('') + '</div>';
}
/* THE LCD DRAWN AGAIN after a key; a long sum scrolls to where you are typing */
function calcPaint_(box) {
  const disp = box && box.querySelector('.mc-display');
  if (!disp) return;
  const st = calcOf_(box.getAttribute('data-key') || '');
  disp.innerHTML = calcScreen_(st);
  box.classList.toggle('mc-shifted', !!st.shift);
  const drg = box.querySelector('.mc-drg');
  if (drg) drg.textContent = st.rad ? 'RAD' : 'DEG';
  const inp = disp.querySelector('.mc-in');
  if (inp) inp.scrollLeft = inp.scrollWidth;
}
function calcPress_(box, v, alt) {
  if (!box || !v) return;
  const st = calcOf_(box.getAttribute('data-key') || '');
  /* AFTER SHIFT a key types its second meaning, by name, so the engine's own SHIFT table is not asked */
  if (st.shift && alt) { st.shift = false; calcKey(st, alt); } else calcKey(st, v);
  calcPaint_(box);
}
on('qcalc-key', el => calcPress_(el.closest('.calc'), el.getAttribute('data-mc'), el.getAttribute('data-alt')));
/* TYPING ON A LAPTOP, while focus is anywhere inside a calculator */
inputKeys_(Object.assign({ 0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9' }, CALC_KEYBOARD),
  (k, down, e) => calcPress_(e.target.closest('.calc[data-key]'), k),
  { when: e => !!(e.target && e.target.closest && e.target.closest('.calc[data-key]')), stop: false, inField: true });
/* THE QUESTION TOOL ROW'S CALCULATOR (owner, 11 Nov): this face floating over the page, by the one floating-tool mechanism (`floatToggle_`, find-measure.js). */
const calcAllowed_ = x => ![].concat((x && x.needs) || []).some(v => /^non-calculator$|^no calculator$/i.test(String(v).trim()));
on('qt-calc', el => {
  const key = qtKeyOf_(el);
  if (!key) return;
  const box = floatToggle_('calc', key, calcFaceHtml_(key));
  if (box) { floatPlace_(box, innerWidth - box.offsetWidth - 12, 64); calcPaint_(box); }
});
