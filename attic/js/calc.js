/* @family. — calc.js: the calculator widget's screen and its key-row sizing (Find's pages size it too). The engine is in arcade.js. */
const CALC_KEYBOARD = { Enter: '=', '=': '=', Backspace: 'del', Delete: 'C', Escape: 'C', ArrowLeft: 'left', ArrowRight: 'right',
  ArrowUp: 'up', ArrowDown: 'down', '*': '×', x: '×', '/': '÷', '-': '−', '+': '+', '^': 'pow', '(': '(', ')': ')', '.': '.',
  p: 'pi', s: 'sin', c: 'cos', t: 'tan', r: 'sqrt', f: 'frac', a: 'Ans', Shift: null };

function initMiniCalc() {
  const disp = $('mc-display');
  if (!disp) return;
  const st = calcNew();
  const render = () => {
    const h = calcHtml(st);
    /* The status row, the LCD's top line: S while SHIFT is held, D degrees, Math the natural display. Drawn by CSS, never the sum's text. */
    disp.innerHTML = '<div class="mc-stat" aria-hidden="true"><b data-i="S"' + (st.shift ? ' class="on"' : '') + '></b><b data-i="D" class="on"></b><b data-i="Math" class="on"></b>'
      + (st.past.length ? '<b data-i="▲" class="on"></b>' : '') + '</div><div class="mc-in">' + h.input + '</div><div class="mc-out">'
      + (h.output || (st.root.length ? '' : '0')) + '</div>';
    const card = disp.closest('.card');
    if (card) card.classList.toggle('mc-shifted', st.shift);
    const inp = disp.firstChild;
    inp.scrollLeft = inp.scrollWidth;       // a long sum scrolls to where you are typing
  };
  window._mcClick = v => { calcKey(st, v); render(); };
  /* Typing on a laptop, while focus is anywhere inside the calculator's own card. */
  const card = disp.closest('.card');
  if (card && !card.__mcKeys) {
    card.__mcKeys = true;
    card.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = /^[0-9]$/.test(e.key) ? e.key : CALC_KEYBOARD[e.key];
      if (!k) return;
      e.preventDefault();
      window._mcClick?.(k);
    });
  }
  render();
}

/* THE KEY ROWS SIZED FROM THE PANE (533, D4): the device is drawn at full size, never zoomed, so its nine key rows (`--calc-row`) take what the pane has left. */
/* 36px IS A TILE'S FLOOR (`PANE_FLOOR_TILE`); a pane too short even then scrolls (320x568). 44px at most: the owner, "calc widget is too big" (562). */
const CALC_ROW_MIN = 36, CALC_ROW_MAX = 44, CALC_ROWS = 9;
function calcFit_(pane) {
  const c = pane && pane.querySelector('.calc');
  if (!c) return;
  try {
    c.style.removeProperty('--calc-row');
    const cs = getComputedStyle(pane);
    const num = k => parseFloat(cs[k]) || 0;
    const pad = num('paddingTop') + num('paddingBottom');
    /* THE PANE'S CAP, NOT ITS HEIGHT: a pane is as tall as its card, so its own height says nothing about the room a shorter device would leave. */
    const cap = parseFloat(cs.maxHeight);
    const room = (cap > 0 ? cap - num('borderTopWidth') - num('borderBottomWidth') : pane.clientHeight) - pad;
    const used = pane.scrollHeight - pad;
    const at = parseFloat(getComputedStyle(c).getPropertyValue('--calc-row')) || 52;
    const k = Math.floor(Math.max(CALC_ROW_MIN, Math.min(CALC_ROW_MAX, at + (room - 4 - used) / CALC_ROWS)));
    if (k !== at) c.style.setProperty('--calc-row', k + 'px');
  } catch (e) { /* the stylesheet's row stands, and `paneReach_` scrolls what does not fit */ }
}
