on('qp-ai', (el) => {
  const box = el.closest('.qp-ai');
  const card = el.closest('.qcard');
  const inp = card && card.querySelector('.qp-multi-val, .qp-ans-in');
  const out = box && box.querySelector('.qp-verdict');
  const why = box && box.nextElementSibling && box.nextElementSibling.classList.contains('qp-ai-why')
    ? box.nextElementSibling : null;
  if (!inp || !out || el.disabled || (box && box.classList.contains('is-busy'))) return;
  /* AN ESSAY'S KEPT POINTS STAY UNDER IT UNTIL NEW ONES ARRIVE (`aiKeep_`): a request that fails must not
     take away the only feedback the pupil has. A short answer's sentence goes, as it always did. */
  const essayBox = box.classList.contains('qp-essay');
  box.classList.remove('is-right', 'is-near');
  if (why && !essayBox) why.textContent = '';
  /* NOTHING TYPED, DRAWN OR PHOTOGRAPHED IS NOT A WRONG ANSWER, and it is not worth a request either. */
  const x0 = ansItem_(inp.getAttribute('data-k'));
  const rec = typeof partRec_ === 'function' && x0 ? partRec_(x0) : {};
  const seen = (rec.strokes || []).length > 0 || rec.photos > 0;
  let reads = false;
  try { reads = (DATA.features || []).indexOf('aiMarkImages') !== -1; } catch (e) { reads = false; }
  /* a backend not yet pulled reads only the box: the drawing and photos are working beside it */
  const notYet = partReady_('ai', { typed: inp.value, seen, reads });
  if (notYet) { out.textContent = notYet; return; }
  if (typeof USER !== 'object' || !USER || !USER.token) { out.textContent = 'Sign in to have it marked'; return; }
  const x = x0;
  if (!x) { out.textContent = 'Could not find this question'; return; }
  const sent = inp.value;
  /* TOO LONG IS SAID, NEVER CUT: a mark for part of an essay, shown as a mark for the essay, is the fault
     the 2,000-character cut was. */
  if (sent.length > AI_ANSWER_MAX) { out.textContent = 'Too long to mark \u2014 ' + aiCount_(AI_ANSWER_MAX) + ' characters at most'; return; }
  /* AND A BACKEND THAT HAS NOT BEEN PULLED YET WOULD CUT IT -- `aiWhole_` above. */
  if (sent.length > AI_ANSWER_OLD && !aiWhole_()) {
    out.textContent = 'The AI marker reads only the first ' + aiCount_(AI_ANSWER_OLD) + ' characters until it is updated \u2014 this is '
      + aiCount_(sent.length) + ', so it was not sent';
    return;
  }
  /* THE SOUND IS WOKEN NOW, INSIDE THE TAP, and held awake until the reply, because the verdict lands after the network and an iPad lets a page start sound only § */
  const k = inp.getAttribute('data-k');
  const letGo = typeof markWait_ === 'function' ? markWait_() : null;
  const here = typeof markWhere_ === 'function' && markWhere_(k);
  el.disabled = true;
  /* THE TILE'S OWN RING WHILE IT WAITS (`.tile.is-busy`), on the tile as well as the row: a disabled
     tile loses its plate, which says "nothing to press" -- the wrong sentence for "pressed, marking". */
  box.classList.add('is-busy');
  el.classList.add('is-busy');
  out.textContent = '';
  const stage = aiStageStart_(box, out);
  let failed = false;
  const done = () => { el.disabled = AI_OFF; box.classList.remove('is-busy'); el.classList.remove('is-busy'); aiStageEnd_(stage, failed); if (letGo) letGo(); };
  /* `essay` ASKS FOR THE LEVELLED MARKING (`aiMarkAsk_` in dopost.gs): § */
  const essay = ansEssay_(x);
  /* THE DRAWING AS A PNG AND THE PHOTOS go with the words (`aiImages_`, qtools.js); drawing it is part of the wait the dots show. Words alone go at once. */
  const body = { action: 'aiMark', personId: USER.personId || '', question: aiQuestion_(x), scheme: aiScheme_(x),
                 answer: sent, marks: Number(x.marks) || 1, essay: essay };
  (seen && reads ? aiImages_(x, card).then(images => api(Object.assign(body, images.length ? { images: images } : {}))) : api(body))
    .then(d => {
      /* BELIEVED ONLY IN THE SHAPE ASKED FOR: whole marks, none below 0 or above what is available */
      if (d && d.success && !aiMarkSane_(d)) d = { success: false, message: 'Could not mark that just now' };
      /* NO TRY AGAIN WHERE AGAIN CANNOT HELP: switched off, or today's marks used. */
      failed = (!d || !d.success) && !(d && (d.why === 'ai-off' || d.why === 'ai-cap'));
      done();
      if (d && d.why === 'ai-off') return aiOff_(d.message);
      /* A VERDICT IS ABOUT THE ANSWER IT MARKED. § */
      if (inp.value !== sent && !essayBox) { out.textContent = ''; return; }
      if (!d || !d.success) {
        out.textContent = (d && (d.message || d.error)) || 'Could not mark that just now';
        return;
      }
      const full = d.awarded >= d.available;
      const said = d.awarded + ' of ' + d.available + ' mark' + (d.available === 1 ? '' : 's') + ' \u00b7 AI';
      if (essayBox) {
        aiKeep_(inp.getAttribute('data-k'), { a: sent, v: said, f: String(d.feedback || ''), c: full ? 'is-right' : 'is-near' });
      } else {
        box.classList.add(full ? 'is-right' : 'is-near');
        out.textContent = said;
        if (why) why.textContent = d.feedback || '';
      }
      /* MARKED IS A SUBMISSION — the answer and its marks, `ai:3/4`, one event on the account like a Check (js/submit.js). § */
      const a = Number(d.awarded), m = Number(d.available);
      /* HEARD ONLY WHERE IT WAS ASKED FOR: this card still on the page in front, with the app in sight --
         `'late'`, through the context the press woke; anywhere else, `'none'`. */
      if (typeof subRecord_ === 'function') {
        subRecord_(k, sent,
          Number.isInteger(a) && Number.isInteger(m) && a >= 0 && m >= 1 && a <= m && m < 1000 ? 'ai:' + a + '/' + m : 'sent',
          here && markWhere_(k) ? 'late' : 'none');
      }
      /* AND THEN THE ESSAY'S LINE, FROM WHAT IS KEPT — after the record, so the verdict line and the
         submission it now reads agree (`subVerdictPaint_` asks both). */
      if (essayBox) aiKeptPaint_(box, inp);
    })
    .catch(() => {
      failed = true;
      done();
      out.textContent = 'Could not reach the marker \u2014 check the connection';
    });
});

/* TYPING TAKES THE AI'S SENTENCE OFF, as find.js's listener takes the verdict off every box — that one draws the verdict line from the latest submission now § */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-ans"]');
  const box = el && el.closest('.qp-ai');
  if (!box || box.classList.contains('is-busy') || box.classList.contains('is-off')) return;
  if (box.classList.contains('qp-essay')) return;
  const why = box.nextElementSibling;
  if (why && why.classList.contains('qp-ai-why')) why.textContent = '';
});

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
  L.innerHTML = '<div class="kp-loupe-in"></div>';
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
/* A HELD FINGER MOVING THE CARET IS NOT A SCROLL: the box allows panning (`touch-action: manipulation`), so the
   browser would take the drag and cancel the pointer; refused here only while the caret or a handle is held */
document.addEventListener('touchmove', e => { if ((kpBusy_() || (KP_SPACE && KP_SPACE.on)) && e.cancelable) e.preventDefault(); }, { capture: true, passive: false });
