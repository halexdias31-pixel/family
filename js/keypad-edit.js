/* ---------- ROOM TO WRITE, the whole-screen sheet of 359, is gone (368): the owner found it did nothing; the box wraps its own lines */

/* ---------- EDITING LIKE iOS (385): "editing a text box of text you have already written is hard and clunky". */
const KP_LOUPE_MS = 350;   // held this long without moving, a finger on the box takes the caret and the loupe comes up
const KP_SLOP_PX = 8;      // moved further than this before then, the finger was scrolling or swiping, not editing
const KP_DBL_MS = 320;     // a second tap this soon, this near, selects the word
const KP_PAD_STEP_PX = 9;  // the space bar as a trackpad: one character per this much slide
let KP_EDIT = null;        // the gesture on a box: { inp, id, x0, y0, mode: 'wait'|'loupe'|'drag'|'handle', end, anchor, timer }
let KP_TAP = null;         // the last plain tap on a box, for the double tap
let KP_SWALLOW = 0;        // a click arriving before this time ends a gesture already handled, and sets no caret
let KP_SPACE = null;       // the space bar held: { id, x0, at, on }
const kpBusy_ = () => !!(KP_EDIT && KP_EDIT.mode !== 'wait');
const kpPlace_ = (inp, x, y) => {
  const show = inp.parentNode && inp.parentNode.querySelector('.kp-show');
  if (!show || !inp.value) return 0;
  try { return kpHit_(inp, show, x, y); } catch (e) { return inp.value.length; }
};
function kpSelect_(inp, a, b) {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  try { inp.setSelectionRange(lo, hi, a > b ? 'backward' : 'forward'); } catch (e) { /* focus and scrolling are niceties */ }
  kpRender_(inp);
}
/* THE WORD AROUND i: letters and digits together, or the one sign there */
function kpWordAt_(v, i) {
  const w = /[0-9a-zÀ-ɏ'.]/i;
  let a = Math.min(i, v.length), b = a;
  if (!w.test(v.charAt(a)) && a > 0 && w.test(v.charAt(a - 1))) a = b = a - 1;
  if (!w.test(v.charAt(a))) return [a, Math.min(v.length, a + 1)];
  while (a > 0 && w.test(v.charAt(a - 1))) a--;
  while (b < v.length && w.test(v.charAt(b))) b++;
  return [a, b];
}
/* THE LOUPE: the box's drawing, magnified, over the finger -- where the caret is when the finger hides it */
function kpLoupe_(inp, x, y) {
  let L = document.getElementById('kp-loupe');
  if (!inp) { if (L) L.hidden = true; return; }
  const show = inp.parentNode && inp.parentNode.querySelector('.kp-show');
  if (!show) return;
  if (!L) { L = document.createElement('div'); L.id = 'kp-loupe'; L.className = 'kp-loupe'; L.setAttribute('aria-hidden', 'true'); document.body.appendChild(L); }
  const sr = show.getBoundingClientRect(), Z = 1.6, W = 132, H = 56;
  L.hidden = false;
  L.innerHTML = cardBlock_({ type: 'group', look: 'kp-loupe-in' });
  const inner = L.firstChild, copy = show.cloneNode(true);
  copy.style.cssText = 'position:absolute;margin:0;left:0;top:0;width:' + sr.width + 'px;height:' + sr.height + 'px;transform-origin:0 0;transform:scale(' + Z + ')';
  inner.appendChild(copy);
  copy.style.left = (W / 2 - (x - sr.left) * Z) + 'px';
  copy.style.top = (H / 2 - (y - sr.top) * Z) + 'px';
  L.style.left = Math.max(4, Math.min(innerWidth - W - 4, x - W / 2)) + 'px';
  L.style.top = Math.max(4, y - H - 44) + 'px';
}
/* SELECTION HANDLES, at the two ends of a selection, dragged to move that end (no new buttons: they are the selection's own ends) */
function kpHandles_(inp) {
  if (inp && inp.parentNode) inp.parentNode.querySelectorAll('.kp-handle').forEach(h => h.remove());
  if (!inp || KP_AT !== inp || !(inp.selectionEnd > inp.selectionStart)) return;
  const f = inp.parentNode, show = f && f.querySelector('.kp-show');
  if (!show) return;
  const fr = f.getBoundingClientRect();
  const ends = [show.querySelector('.kp-sel-a') || show.querySelector('mark.kp-sel'), show.querySelector('.kp-sel-b') || show.querySelector('mark.kp-sel')];
  ends.forEach((el, i) => {
    if (!el) return;
    const rs = el.getClientRects(), r = i ? rs[rs.length - 1] : rs[0];
    if (!r) return;
    const h = document.createElement('span');
    h.className = 'kp-handle kp-handle-' + (i ? 'b' : 'a');
    h.setAttribute('data-end', i ? 'b' : 'a');
    h.setAttribute('aria-hidden', 'true');
    h.style.left = ((i ? r.right : r.left) - fr.left) + 'px';
    h.style.top = (r.top - fr.top) + 'px';
    h.style.height = r.height + 'px';
    f.appendChild(h);
  });
}
document.addEventListener('pointerdown', e => {
  const t = e.target;
  const h = t && t.closest && t.closest('.kp-handle');
  const f = t && t.closest && t.closest('.kp-field');
  const inp = f && f.querySelector('.kp-in');
  if (!inp) return;
  clearTimeout(KP_EDIT && KP_EDIT.timer);
  if (h && KP_AT === inp) {
    e.preventDefault();
    KP_EDIT = { inp, id: e.pointerId, mode: 'handle', end: h.getAttribute('data-end'),
                fixed: h.getAttribute('data-end') === 'a' ? inp.selectionEnd : inp.selectionStart };
    return;
  }
  KP_EDIT = { inp, id: e.pointerId, x0: e.clientX, y0: e.clientY, mode: 'wait', mouse: e.pointerType === 'mouse' };
  if (KP_EDIT.mouse) {
    /* A MOUSE PRESSES AND DRAGS TO SELECT, from where it pressed */
    if (e.button !== 0) { KP_EDIT = null; return; }
    kpTake_(inp);
    KP_EDIT.anchor = kpPlace_(inp, e.clientX, e.clientY);
    return;
  }
  const g = KP_EDIT;
  g.timer = setTimeout(() => {
    if (KP_EDIT !== g || g.mode !== 'wait') return;
    g.mode = 'loupe';
    kpTake_(inp);
    const at = kpPlace_(inp, g.x0, g.y0);
    kpSelect_(inp, at, at);
    kpLoupe_(inp, g.x0, g.y0);
  }, KP_LOUPE_MS);
}, true);
document.addEventListener('pointermove', e => {
  const g = KP_EDIT;
  if (g && g.id === e.pointerId) {
    const far = g.x0 == null ? 0 : Math.hypot(e.clientX - g.x0, e.clientY - g.y0);
    if (g.mode === 'wait') {
      if (g.mouse && far > 3 && e.buttons & 1) g.mode = 'drag';
      else if (!g.mouse && far > KP_SLOP_PX) { clearTimeout(g.timer); KP_EDIT = null; return; }
      else return;
    }
    if (e.cancelable) e.preventDefault();
    const at = kpPlace_(g.inp, e.clientX, e.clientY);
    if (g.mode === 'loupe') { kpSelect_(g.inp, at, at); kpLoupe_(g.inp, e.clientX, e.clientY); }
    else if (g.mode === 'drag') kpSelect_(g.inp, g.anchor, at);
    else if (g.mode === 'handle') kpSelect_(g.inp, g.fixed, at);
    return;
  }
  /* THE SPACE BAR AS A TRACKPAD: held and slid, the caret moves a character per step and no space is typed */
  const S = KP_SPACE;
  if (S && S.id === e.pointerId) {
    const dx = e.clientX - S.x0;
    if (!S.on && Math.abs(dx) < KP_SLOP_PX) return;
    const inp = kpLive_();
    if (!inp) return;
    if (!S.on) { S.on = true; S.at = inp.selectionEnd == null ? inp.value.length : inp.selectionEnd; kpHoldStop_(); }
    KP_REPEATED = true;
    const at = Math.max(0, Math.min(inp.value.length, S.at + Math.round(dx / KP_PAD_STEP_PX)));
    kpSelect_(inp, at, at);
  }
}, { capture: true, passive: false });
const kpEditEnd_ = e => {
  const g = KP_EDIT;
  const S = KP_SPACE;
  if (S && S.id === e.pointerId) {
    /* THE LIFT IS THE LAST PLACE: a slide's final moves can arrive coalesced into the lift itself */
    const inp = S.on && kpLive_();
    if (inp) { const at = Math.max(0, Math.min(inp.value.length, S.at + Math.round((e.clientX - S.x0) / KP_PAD_STEP_PX))); kpSelect_(inp, at, at); }
    KP_SPACE = null;
  }
  if (!g || g.id !== e.pointerId) return;
  clearTimeout(g.timer);
  KP_EDIT = null;
  if (g.mode === 'wait') {
    /* A PLAIN TAP: the click handler puts the caret where the finger was; a second one soon after selects the word */
    const now = Date.now(), T = KP_TAP;
    KP_TAP = { inp: g.inp, at: now, x: e.clientX, y: e.clientY };
    if (T && T.inp === g.inp && now - T.at < KP_DBL_MS && Math.hypot(e.clientX - T.x, e.clientY - T.y) < 24 && g.inp.value) {
      KP_TAP = null;
      KP_SWALLOW = now + 600;
      kpTake_(g.inp);
      const w = kpWordAt_(g.inp.value, kpPlace_(g.inp, e.clientX, e.clientY));
      kpSelect_(g.inp, w[0], w[1]);
    }
    return;
  }
  /* AND THE LIFT IS WHERE THE CARET OR THE END STAYS, as above */
  if (g.mode !== 'wait' && e.type === 'pointerup') {
    const at = kpPlace_(g.inp, e.clientX, e.clientY);
    if (g.mode === 'loupe') kpSelect_(g.inp, at, at);
    else kpSelect_(g.inp, g.mode === 'drag' ? g.anchor : g.fixed, at);
  }
  kpLoupe_(null);
  KP_SWALLOW = Date.now() + 600;
  kpHandles_(g.inp);
};
['pointerup', 'pointercancel'].forEach(ev => document.addEventListener(ev, kpEditEnd_, true));
document.addEventListener('pointerdown', e => {
  const k = e.target && e.target.closest && e.target.closest('#kp .kp-key');
  if (k && k.getAttribute('data-v') === ' ') KP_SPACE = { id: e.pointerId, x0: e.clientX, on: false };
}, true);
/* A HELD FINGER MOVING THE CARET IS NOT A SCROLL: § */
document.addEventListener('touchmove', e => { if ((kpBusy_() || (KP_SPACE && KP_SPACE.on)) && e.cancelable) e.preventDefault(); }, { capture: true, passive: false });
