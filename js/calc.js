/* @family. — calc.js THE QUESTION'S CALCULATOR (owner, 11 Nov: "like the old calculator was"): the fx-83GT CW face, one per part; the engine is calc-engine.js. */
const CALC_KEYBOARD = { Enter: '=', '=': '=', Backspace: 'del', Delete: 'C', Escape: 'C', ArrowLeft: 'left', ArrowRight: 'right',
  ArrowUp: 'up', ArrowDown: 'down', '*': '×', x: '×', '/': '÷', '-': '−', '+': '+', '^': 'pow', '(': '(', ')': ')', '.': '.',
  p: 'pi', s: 'sin', c: 'cos', t: 'tan', r: 'sqrt', f: 'frac', a: 'Ans', Shift: null };
/* EACH PART'S OWN SUM, by its key, for the visit: a part's calculator opened again holds what it held */
const CALC_ST = new Map();
const calcOf_ = key => { if (!CALC_ST.has(key)) CALC_ST.set(key, calcNew()); return CALC_ST.get(key); };

/* THE LCD: the status row (S while SHIFT is held, D degrees, Math the natural display), the sum, the answer. Drawn by CSS, never the sum's text. */
function calcScreen_(st) {
  const h = calcHtml(st);
  return '<div class="mc-stat" aria-hidden="true"><b data-i="S"' + (st.shift ? ' class="on"' : '') + '></b><b data-i="D" class="on"></b><b data-i="Math" class="on"></b>'
    + (st.past.length ? '<b data-i="▲" class="on"></b>' : '') + '</div><div class="mc-in">' + h.input + '</div><div class="mc-out">'
    + (h.output || (st.root.length ? '' : '0')) + '</div>';
}
/* A KEY'S PRINTED FACE IS DATA (calc-engine.js): runs drawn by renderCard's runs, line drawings by its drawing block. */
const calcFace_ = v => [].concat(v == null ? [] : v).map(x => x && x.el ? cardDraw_(x) : cardRuns_(x)).join('');
/* THE FACE, as it was in the Calculator widget: bezel and LCD, the top keys round the pad, the function keys, the number keys */
function calcFaceHtml_(key) {
  const st = calcOf_(key);
  const keys = ([[ 'top', 'calc-top', '<i class="calc-pad" aria-hidden="true"></i><i class="calc-pad calc-pad-v" aria-hidden="true"></i>'], ['fn', 'calc-fn', ''], ['num', 'calc-num', '']]).map(([part, cls, extra]) =>
    `<div class="${cls}">${extra}${CALC_KEYS.filter(k => k[2].split(' ')[0] === part).map(([v, label, kc, legend, name]) =>
      tile_({ form: true, look: 'mc-btn ' + kc + (/^\w+$/.test(v) ? ' mc-k-' + v : ''), act: 'qcalc-key', data: { mc: v }, aria: name || v,
        html: (/pad|pg/.test(kc) ? '' : `<small class="mc-alt">${calcFace_(legend)}</small>`) + `<span class="mc-lab">${calcFace_(label)}</span>` })).join('')}</div>`).join('');
  return `<div class="calc${st.shift ? ' mc-shifted' : ''}" data-key="${esc(key)}" role="group" aria-label="Calculator">
    <div class="calc-bezel"><div class="mc-display" tabindex="0" aria-live="polite" aria-label="Calculator display">${calcScreen_(st)}</div>
    <div class="calc-label">${esc(brand('name', '@family.'))}</div></div>${keys}</div>`;
}
/* THE LCD DRAWN AGAIN after a key; a long sum scrolls to where you are typing */
function calcPaint_(box) {
  const disp = box && box.querySelector('.mc-display');
  if (!disp) return;
  const st = calcOf_(box.getAttribute('data-key') || '');
  disp.innerHTML = calcScreen_(st);
  box.classList.toggle('mc-shifted', !!st.shift);
  const inp = disp.querySelector('.mc-in');
  if (inp) inp.scrollLeft = inp.scrollWidth;
}
function calcPress_(box, v) {
  if (!box || !v) return;
  calcKey(calcOf_(box.getAttribute('data-key') || ''), v);
  calcPaint_(box);
}
on('qcalc-key', el => calcPress_(el.closest('.calc'), el.getAttribute('data-mc')));
/* TYPING ON A LAPTOP, while focus is anywhere inside a calculator */
document.addEventListener('keydown', e => {
  const box = e.target && e.target.closest && e.target.closest('.calc[data-key]');
  if (!box || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = /^[0-9]$/.test(e.key) ? e.key : CALC_KEYBOARD[e.key];
  if (!k) return;
  e.preventDefault();
  calcPress_(box, k);
});
/* THE QUESTION TOOL ROW'S CALCULATOR (owner, 11 Nov), this face; since 13 Nov a small one floating over the page, dragged like the ruler. */
const calcAllowed_ = x => ![].concat((x && x.needs) || []).some(v => /^non-calculator$|^no calculator$/i.test(String(v).trim()));
/* ONE AT A TIME: the part whose calculator floats, or none */
const QCALC_OPEN = new Set();
on('qt-calc', el => {
  const key = qtKeyOf_(el);
  if (!key) return;
  const open = !QCALC_OPEN.has(key);
  QCALC_OPEN.clear();
  document.querySelectorAll('.calc-float').forEach(e => e.remove());
  document.querySelectorAll('.qt-calc[aria-pressed="true"]').forEach(t => { if (t !== el) tileSet_(t, { on: false, pressed: false }); });
  if (open) {
    QCALC_OPEN.add(key);
    document.body.insertAdjacentHTML('beforeend', calcFaceHtml_(key));
    const box = document.body.lastElementChild;
    box.classList.add('calc-float', 'floaty');
    calcPaint_(box);
  }
  tileSet_(el, { on: open, pressed: open });
});
