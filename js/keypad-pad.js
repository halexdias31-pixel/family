on('kp-key', (el) => {
  if (KP_REPEATED) { KP_REPEATED = false; return; }
  /* THE LIVE BOX, NOT THE LAST ONE NAMED -- a redraw may have replaced it (`kpLive_`). */
  const inp = kpLive_();
  if (!inp) return;
  const v = el.getAttribute('data-v') || '';
  if (v === '!done') return kpDone_(inp);
  if (v === '!abc' || v === '!123' || v === '!sym') return kpLayer_(v === '!abc' ? 'abc' : v === '!sym' ? 'sym' : 'maths', inp);
  if (v === '!shift') return kpShiftTap_();
  if (v === '!mic') return kpMic_(inp, el);
  kpType_(inp, v, false);
});

/* ---------- THE MIC (562, owner note 128): the browser's own speech recognition types what you say into the live box; none, and the key says so */
let KP_MIC_ON = null;
const kpMicApi_ = () => (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;
function kpMicPaint_(on) { document.querySelectorAll('.kp-mic').forEach(k => { k.classList.toggle('is-on', !!on); k.setAttribute('aria-pressed', on ? 'true' : 'false'); }); }
function kpMic_(inp, el) {
  if (KP_MIC_ON) { try { KP_MIC_ON.stop(); } catch (e) { /* already stopped: nothing to undo */ } return; }
  const Api = kpMicApi_();
  if (!Api) { if (typeof toast === 'function') toast('Dictation is not available in this browser.'); return; }
  let r;
  try { r = new Api(); } catch (e) { return; }
  r.lang = 'en-GB'; r.interimResults = false; r.continuous = false;
  r.onresult = ev => {
    const said = [].map.call(ev.results || [], x => (x && x[0] && x[0].transcript) || '').join(' ').trim();
    const box = kpLive_() || inp;
    if (!said || !box) return;
    const v = String(box.value || ''), a = box.selectionStart == null ? v.length : box.selectionStart;
    kpType_(box, (a > 0 && !/\s$/.test(v.slice(0, a)) ? ' ' : '') + said, true);
  };
  r.onend = r.onerror = () => { KP_MIC_ON = null; kpMicPaint_(false); };
  try { r.start(); KP_MIC_ON = r; kpMicPaint_(true); } catch (e) { KP_MIC_ON = null; kpMicPaint_(false); }
}

/* ✓ IS CHECK, where the question has a scheme to check against — the same handler the button runs, not a copy of it — and otherwise it is "I have finished" § */
/* ---------- ✓ — THE GOLD SEND KEY, AND ENTER ON A LAPTOP — RUNS THE BOX'S OWN SEND § */
function kpDone_(inp) {
  if (kpSite_(inp)) return kpSiteDone_(inp);
  const nx = typeof multiNext_ === 'function' ? multiNext_(inp) : null;
  if (nx) return kpTake_(nx);
  const box = inp.hasAttribute('data-kp-essay') ? null : inp.closest('.qp-mark');
  /* ONE SUBMIT PATH (508): ✓ presses the box's own send tile, whatever it is called. */
  const go = box && (box.querySelector('.tile.is-submit[data-do]:not([disabled])')
    || box.querySelector('.qp-ai-go[data-do="qp-ai"]:not([disabled])'));
  const run = go && ACTIONS[go.getAttribute('data-do')];
  if (run) run(go);
  inp.blur();
  kpClose_();
}

/* ---------- CAPITALS § */
let KP_SHIFT = 'off';
let KP_SHIFT_AT = 0;
function kpShiftTap_() {
  const now = Date.now();
  KP_SHIFT = KP_SHIFT === 'lock' ? 'off' : now - KP_SHIFT_AT < 350 ? 'lock' : KP_SHIFT === 'off' ? 'once' : 'off';
  KP_SHIFT_AT = now;
  kpShiftPaint_();
}
function kpAutoShift_(inp) {
  if (KP_SHIFT === 'lock') return;
  if (!inp || (inp.getAttribute('data-kp') !== 'words' && !kpSiteCaps_(inp))) { KP_SHIFT = 'off'; return; }
  const at = inp.selectionStart == null ? inp.value.length : inp.selectionStart;
  const before = inp.value.slice(0, at);
  KP_SHIFT = (!before.trim() || /[.?!]\s+$/.test(before) || /\n\s*$/.test(before)) ? 'once' : 'off';
}
function kpShiftPaint_() {
  const pad = document.getElementById('kp');
  if (!pad) return;
  pad.classList.toggle('is-shift', KP_LAYER === 'abc' && KP_SHIFT !== 'off');
  const s = pad.querySelector('.kp-shift');
  if (!s) return;
  s.classList.toggle('is-on', KP_SHIFT !== 'off');
  s.classList.toggle('is-lock', KP_SHIFT === 'lock');
  s.setAttribute('aria-pressed', KP_SHIFT !== 'off' ? 'true' : 'false');
  s.setAttribute('aria-label', KP_SHIFT === 'lock' ? 'capitals locked' : 'capitals');
}

/* ---------- A TAP BETWEEN KEYS IS THE NEAREST KEY § */
function kpNear_(e) {
  const pad = e.currentTarget;
  if (e.target !== pad || !e.detail || PRESS_MOVED || PRESS_SLIDING) return;
  const ks = [...pad.querySelectorAll('.kp-key')].map(k => ({ k: k, r: k.getBoundingClientRect() }));
  const band = ks.filter(o => e.clientY >= o.r.top - 3 && e.clientY <= o.r.bottom + 3);
  let best = null, bd = Infinity;
  (band.length ? band : ks).forEach(o => {
    const dx = Math.max(o.r.left - e.clientX, 0, e.clientX - o.r.right);
    const dy = Math.max(o.r.top - e.clientY, 0, e.clientY - o.r.bottom);
    const d = dx * dx + dy * dy * 4;
    if (d < bd) { bd = d; best = o.k; }
  });
  if (best && ACTIONS['kp-key']) ACTIONS['kp-key'](best);
}

/* ---------- ⌫, ← AND → REPEAT WHILE HELD § */
let KP_HOLD = 0;
function kpHoldStop_() {
  clearTimeout(KP_HOLD);
  clearInterval(KP_HOLD);
  KP_HOLD = 0;
}
function kpHold_(e) {
  KP_REPEATED = false;
  kpHoldStop_();
  const key = e.target && e.target.closest && e.target.closest('.kp-key');
  const v = key ? key.getAttribute('data-v') || '' : '';
  if (!/^!(back|left|right)$/.test(v)) return;
  const step = () => {
    const inp = kpLive_();
    if (!inp || !key.isConnected) return kpHoldStop_();
    KP_REPEATED = true;
    kpType_(inp, v, true);
  };
  KP_HOLD = setTimeout(() => { step(); if (KP_HOLD) KP_HOLD = setInterval(step, 70); }, 450);
}

/* ---------- WHAT A SCREEN READER HEARS § */
let KP_SAY = 0;
const kpSpoken_ = v => String(v || '')
  .replace(/\(([^()]*)\)\/\(([^()]*)\)/g, '$1 over $2').replace(/\/\(([^()]*)\)/g, ' over $1')
  .replace(/\^\(([^()]*)\)/g, ' to the power $1').replace(/\u221a\(([^()]*)\)/g, 'root $1')
  .replace(/-/g, ' minus ').replace(/\s+/g, ' ').trim();
function kpSay_(inp) {
  clearTimeout(KP_SAY);
  KP_SAY = setTimeout(() => {
    const say = document.getElementById('kp-say');
    if (!say || KP_AT !== inp) return;
    /* A PIN OR A PASSWORD IS NEVER READ OUT (528) */
    if (kpSecret_(inp)) { say.textContent = ''; return; }
    const v = String(kpSite_(inp) ? kpText_(inp) : inp.value);
    say.textContent = inp.getAttribute('data-kp') === 'words' || kpSite_(inp)
      ? v.split(/[.?!\n]\s*/).filter(s => s.trim()).slice(-1).join('').slice(-160) : kpSpoken_(v);
  }, 600);
}

/* ---------- A TAP ON THE BOX § */
const kpOfTap_ = t => {
  const lab = t && t.closest && t.closest('label.qp-ans');
  return lab ? lab.querySelector('.kp-in') : null;
};
document.addEventListener('mousedown', e => { if (kpOfTap_(e.target)) e.preventDefault(); }, true);
document.addEventListener('click', e => {
  const inp = kpOfTap_(e.target);
  if (!inp) return;
  e.preventDefault();
  /* THE CLICK AFTER A HOLD, A DRAG OR A DOUBLE TAP (385) sets no caret: the gesture already put it where it belongs */
  if (Date.now() < KP_SWALLOW) { KP_SWALLOW = 0; return; }
  if (PRESS_MOVED || PRESS_SLIDING) return;
  const show = inp.parentNode && inp.parentNode.querySelector('.kp-show');
  let at = null;
  /* ONLY A TAP IN THE BOX THE PAD IS ALREADY ON places the caret; arriving lands at the end, so ⌫ deletes (454: a tap left of a wrong answer froze ⌫ at 0) */
  if (KP_AT === inp && show && show.contains(e.target) && e.detail && inp.value) {
    try { at = kpHit_(inp, show, e.clientX, e.clientY); } catch (err) { at = null; }
  }
  kpTake_(inp);
  if (KP_AT !== inp || at == null) return;
  try { inp.setSelectionRange(at, at); } catch (err) { /* focus and scrolling are niceties */ }
  kpRender_(inp);
  kpAutoShift_(inp);
  kpShiftPaint_();
}, true);

/* ---------- WHERE IN THE ANSWER A FINGER LANDED § */
function kpHit_(inp, show, x, y) {
  return inp.getAttribute('data-kp') === 'words' ? kpHitWords_(show, x, y) : kpHitMaths_(inp, show, x, y);
}
function kpHitWords_(show, x, y) {
  const texts = [];
  const walk = document.createTreeWalker(show, NodeFilter.SHOW_TEXT);
  for (let t = walk.nextNode(); t; t = walk.nextNode()) texts.push(t);
  const index = (node, off) => {
    let n = 0;
    for (const t of texts) { if (t === node) return n + off; n += t.length; }
    return null;
  };
  let node = null, off = 0;
  try {
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      if (p) { node = p.offsetNode; off = p.offset; }
    } else if (document.caretRangeFromPoint) {
      const r = document.caretRangeFromPoint(x, y);
      if (r) { node = r.startContainer; off = r.startOffset; }
    }
  } catch (e) { node = null; }
  if (node && node.nodeType === 3 && show.contains(node)) {
    const i = index(node, off);
    if (i != null) return i;
  }
  let best = texts.reduce((n, t) => n + t.length, 0), bd = Infinity, n = 0;
  const rg = document.createRange();
  for (const t of texts) {
    for (let i = 0; i < t.length; i++) {
      rg.setStart(t, i); rg.setEnd(t, i + 1);
      const b = rg.getBoundingClientRect();
      if (!b.width && !b.height) continue;
      const dy = y < b.top ? b.top - y : y > b.bottom ? y - b.bottom : 0;
      const mid = (b.left + b.right) / 2;
      const d = dy * 1000 + Math.abs(x - (x < mid ? b.left : b.right));
      if (d < bd) { bd = d; best = n + i + (x < mid ? 0 : 1); }
    }
    n += t.length;
  }
  return best;
}
function kpHitMaths_(inp, show, x, y) {
  const sr = show.getBoundingClientRect();
  const host = document.createElement('div');
  host.className = 'kp-hit';
  host.style.cssText = 'position:fixed;left:' + sr.left + 'px;top:' + sr.top + 'px;width:' + sr.width
    + 'px;visibility:hidden;pointer-events:none;contain:layout style paint';
  let html = '';
  for (let i = 0; i <= inp.value.length; i++) {
    html += '<span class="kp-show" style="position:absolute;left:0;top:0;width:' + sr.width + 'px">'
      + kpTypeset_(inp.value, i) + '</span>';
  }
  host.innerHTML = html;
  document.body.appendChild(host);
  let best = inp.value.length, bd = Infinity;
  try {
    [...host.children].forEach((g, i) => {
      const c = g.querySelector('.kp-caret');
      if (!c) return;
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.left - x) + 2 * Math.abs((r.top + r.bottom) / 2 - y);
      if (d < bd) { bd = d; best = i; }
    });
  } finally { host.remove(); }
  return best;
}

document.addEventListener('focusin', e => {
  const t = e.target;
  if (t && t.classList && t.classList.contains('kp-in')) kpOpen_(t);
});
document.addEventListener('focusout', e => {
  const t = e.target;
  if (!kpIs_(t)) return;
  /* AFTER THE FOCUS HAS LANDED, so a move from one box straight to another hands the pad over
     rather than closing and reopening it. */
  setTimeout(() => {
    const now = document.activeElement;
    if (kpIs_(now) && (now.classList.contains('kp-in') || KP_AT === now)) return;
    /* TAKEN AWAY, NOT LEFT: § */
    if (KP_AT === t && !t.isConnected) {
      const again = kpFind_(t.getAttribute('data-k'));
      if (again) { kpTake_(again); return; }
    }
    if (KP_AT === t) kpClose_();
  }, 0);
});
/* A TYPED KEY AND A MOVED CARET REDRAW THE DRAWING. `input` covers what changed the value; `keyup`
   covers a laptop's keys, which `kpKeys_` below has already sent through the pad. */
['input', 'keyup'].forEach(ev => document.addEventListener(ev, e => {
  const t = e.target;
  if (t && t.classList && t.classList.contains('kp-in')) kpRender_(t);
}));

/* ---------- THE PAD IS THE KEYBOARD FOR EVERY BOX ON THE SITE (528) ---------- */
/* The owner: "make it so the keyboard is the @family keyboard everywhere". Every other box stays a real field (the browser's caret, selection, paste, a laptop's keys); only the phone's keyboard is shut out. */
const KP_TEXT_TYPE = /^(|text|search|email|url|tel|password|number)$/;
/* WHAT TAKES TEXT: a textarea, a text-like input, an editable piece of words (words.js). An answer box is kpField_'s, locked in its markup, and never this. */
function kpTakesText_(el) {
  if (!el || el.nodeType !== 1 || !el.classList || el.classList.contains('kp-in')) return false;
  if (el.tagName === 'TEXTAREA') return true;
  if (el.tagName === 'INPUT') return KP_TEXT_TYPE.test(String(el.getAttribute('type') || '').trim().toLowerCase());
  const ce = el.getAttribute('contenteditable');
  return ce != null && /^(|true|plaintext-only)$/i.test(ce.trim());
}
const kpSite_ = el => !!(el && el.nodeType === 1 && el.hasAttribute('data-kpb') && !el.classList.contains('kp-in'));
const kpIs_ = el => !!(el && el.classList && (el.classList.contains('kp-in') || kpSite_(el)));
const kpField2_ = el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
const kpLines_ = el => !!el && el.tagName === 'TEXTAREA';
const kpText_ = el => String((kpField2_(el) ? el.value : el.textContent) || '');
const kpWritable_ = el => !!el && !el.disabled && !(kpField2_(el) && el.readOnly);
const kpSecret_ = el => !!el && el.tagName === 'INPUT' && (/^password$/i.test(el.type || '') || el.classList.contains('pin-dots')
  || /password|one-time-code/i.test(el.getAttribute('autocomplete') || ''));
/* A CAPITAL BY ITSELF where a phone's keyboard gives one: a box of sentences, never an address, a PIN, or a box that says autocapitalize="off" */
function kpSiteCaps_(el) {
  if (!kpSite_(el) || el.getAttribute('data-kpb') !== 'abc' || kpSecret_(el)) return false;
  if (/^(off|none)$/i.test(el.getAttribute('autocapitalize') || '')) return false;
  return el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(|text)$/i.test(el.getAttribute('type') || ''));
}
/* THE FACE IT OPENS ON, read from what the box says it is: a number, a phone number or digits written as its inputmode → 123; an address → letters with @ . /; else letters */
function kpSiteLayer_(el) {
  const ty = String(el.getAttribute('type') || '').toLowerCase(), im = String(el.getAttribute('inputmode') || '').toLowerCase();
  if (/^(number|tel)$/.test(ty) || /^(numeric|decimal|tel)$/.test(im)) return 'num';
  if (/^(email|url)$/.test(ty) || /^(email|url)$/.test(im)) return 'mail';
  return 'abc';
}
/* THE ONE BINDING: the face read from the markup, then the phone's keyboard shut out. The only script in js/ that writes `inputmode`, and only ever "none" (check-flow). No `readonly`: a reader still hears a field. */
function kpBind_(el) {
  /* THE ONE SCROLLING PAGE (900): an ordinary box keeps the phone's own keyboard; the pad is the answer boxes' alone. */
  if (FLOW_LAYOUT || !kpTakesText_(el) || el.hasAttribute('data-kpb')) return;
  el.setAttribute('data-kpb', kpSiteLayer_(el));
  el.setAttribute('inputmode', 'none');
}
function kpBindIn_(root) {
  if (!root || root.nodeType !== 1) return;
  kpBind_(root);
  if (root.firstElementChild) root.querySelectorAll('input, textarea, [contenteditable]').forEach(kpBind_);
}
/* A BOX TAKEN AWAY WITH THE PAD ON IT (a message sent, its composer drawn again) takes the pad with it, as a phone's keyboard goes; an answer box is found again by its name (kpLive_) */
const kpGone_ = () => { if (KP_AT && kpSite_(KP_AT) && !KP_AT.isConnected) kpClose_(); };
/* EVERY BOX AS IT IS DRAWN, before a finger can reach it; and again on the way in (a tap, a focus), for a box drawn and focused in one go */
try {
  new MutationObserver(list => { for (const m of list) for (const n of m.addedNodes) kpBindIn_(n); kpGone_(); })
    .observe(document.documentElement, { childList: true, subtree: true });
} catch (e) { /* the tap and the focus below still bind */ }
kpBindIn_(document.documentElement);

/* THE PAD COMES UP WHEN A PERSON PUT THE FOCUS THERE (a tap, Tab), as a phone's keyboard does, and not for a box a screen focused by itself; a tap on it later brings it up */
const KP_USER_MS = 1500;
let KP_USER_AT = 0;
const kpUser_ = () => Date.now() - KP_USER_AT < KP_USER_MS;
const kpBoxAt_ = t => (t && t.closest ? t.closest('input, textarea, [contenteditable]') : null);
['pointerdown', 'touchstart'].forEach(ev => document.addEventListener(ev, e => {
  KP_USER_AT = Date.now();
  kpBind_(kpBoxAt_(e.target));
}, { capture: true, passive: true }));
document.addEventListener('keydown', e => { if (e.key === 'Tab') KP_USER_AT = Date.now(); }, true);
document.addEventListener('focusin', e => {
  const t = e.target;
  kpBind_(t);
  if (kpSite_(t) && kpWritable_(t) && kpUser_()) kpOpen_(t);
}, true);
document.addEventListener('click', e => {
  const t = kpBoxAt_(e.target);
  if (kpSite_(t) && document.activeElement === t && KP_AT !== t && kpWritable_(t)) kpOpen_(t);
});
/* A LAPTOP'S OWN KEYS TYPE STRAIGHT INTO THE FIELD; the box is kept above the pad as it grows */
document.addEventListener('input', e => { if (KP_AT && e.target === KP_AT && kpSite_(KP_AT)) kpKeepClear_(KP_AT); });

/* A KEY INTO A BOX ELSEWHERE: the browser's own edit where it has one (its `input` event, its undo, maxlength, a number box's rules), else the same splice by hand */
const KP_PEND = new WeakMap();
function kpSiteEdit_(el, cmd) {
  if (!kpWritable_(el)) return;
  if (cmd === '!left' || cmd === '!right') return kpSiteMove_(el, cmd === '!left' ? -1 : 1);
  if (/^!(home|end|top|bottom)$/.test(cmd) || (cmd === '\n' && !kpLines_(el))) return;
  const back = cmd === '!back' || cmd === '!del';
  const t = back ? '' : cmd;
  if (document.activeElement === el && typeof document.execCommand === 'function') {
    let done = false;
    try { done = document.execCommand(back ? (cmd === '!del' ? 'forwardDelete' : 'delete') : 'insertText', false, t); } catch (e) { done = false; }
    if (done) { KP_PEND.delete(el); return; }
  }
  if (!kpField2_(el)) return kpSiteEditable_(el, t, back);
  /* A NUMBER BOX HALF TYPED ("1.", "-") reads back empty, so the text so far is held beside it until it is a number again */
  let pend = KP_PEND.get(el);
  if (pend != null && el.value !== '') { KP_PEND.delete(el); pend = null; }
  const v = pend != null ? pend : el.value;
  let a = pend != null ? null : el.selectionStart, b = pend != null ? null : el.selectionEnd;
  if (a == null) a = b = v.length;
  if (back && a === b) {
    if (cmd === '!del') { if (b >= v.length) return; b++; } else { if (!a) return; a--; }
  }
  let put = t;
  const max = el.maxLength;
  if (max >= 0 && v.length - (b - a) + put.length > max) put = put.slice(0, Math.max(0, max - (v.length - (b - a))));
  if (!back && !put) return;
  const nv = v.slice(0, a) + put + v.slice(b);
  el.value = nv;
  if (el.value !== nv) KP_PEND.set(el, nv); else KP_PEND.delete(el);
  try { el.setSelectionRange(a + put.length, a + put.length); } catch (e) { /* an email or number box has no caret to set */ }
  kpSiteInput_(el, back ? 'deleteContentBackward' : 'insertText', back ? null : put);
}
function kpSiteInput_(el, type, data) {
  let ev;
  try { ev = new window.InputEvent('input', { bubbles: true, inputType: type, data: data }); } catch (e) { ev = new Event('input', { bubbles: true }); }
  el.dispatchEvent(ev);
}
/* ← AND →: the field's own caret. An email or number box has none a script can move; its own arrow keys still do */
function kpSiteMove_(el, dir) {
  if (!kpField2_(el)) {
    try { const s = window.getSelection(); if (s && s.modify) s.modify('move', dir < 0 ? 'backward' : 'forward', 'character'); } catch (e) { /* left where it is */ }
    return;
  }
  const a = el.selectionStart, b = el.selectionEnd;
  if (a == null) return;
  const c = b > a ? (dir < 0 ? a : b) : Math.max(0, Math.min(el.value.length, a + dir));
  try { el.setSelectionRange(c, c); } catch (e) { /* left where it is */ }
}
/* AN EDITABLE PIECE OF WORDS (words.js), where the browser has no edit of its own to lend: the selection's range, by hand */
function kpSiteEditable_(el, t, back) {
  try {
    const s = window.getSelection();
    let r = s && s.rangeCount ? s.getRangeAt(0) : null;
    if (!r || !el.contains(r.commonAncestorContainer)) { r = document.createRange(); r.selectNodeContents(el); r.collapse(false); }
    if (back && r.collapsed) {
      let n = r.startContainer, o = r.startOffset;
      if (n.nodeType === 1 && o > 0 && n.childNodes[o - 1].nodeType === 3) { n = n.childNodes[o - 1]; o = n.length; }
      if (n.nodeType !== 3 || !o) return;
      r.setStart(n, o - 1);
      r.setEnd(n, o);
    }
    r.deleteContents();
    if (t) { const tn = document.createTextNode(t); r.insertNode(tn); r.setStartAfter(tn); r.collapse(true); }
    s.removeAllRanges();
    s.addRange(r);
  } catch (e) { return; }
  kpSiteInput_(el, back ? 'deleteContentBackward' : 'insertText', back ? null : t);
}
/* ✓ ON A BOX ELSEWHERE IS ITS ENTER: whatever Enter does there (sign in, search, add), its form sent if nothing took it, the pad put away. A box of lines says `done`; its Send tile sends */
function kpSiteDone_(el) {
  if (!kpLines_(el)) {
    let go = true;
    try { go = el.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true })); } catch (e) { go = true; }
    if (go && el.form && el.isConnected && typeof el.form.requestSubmit === 'function') { try { el.form.requestSubmit(); } catch (e) { /* a form that cannot be sent stays */ } }
  }
  if (document.activeElement === el) el.blur();
  kpClose_();
}

/* ---------- A LAPTOP'S KEYBOARD, AND AN iPAD'S § */
function kpKeys_(e) {
  const t = e.target;
  /* A BOX ELSEWHERE TAKES A LAPTOP'S KEYS AS THEY ARE (528); Escape puts the pad away */
  if (kpSite_(t)) { if (e.key === 'Escape' && KP_AT === t) kpClose_(); return; }
  if (!t || !t.classList || !t.classList.contains('kp-in') || e.isComposing || e.keyCode === 229) return;
  const words = t.getAttribute('data-kp') === 'words';
  const essay = words && t.hasAttribute('data-kp-essay');
  const k = e.key || '';
  let altGr = false;
  try { altGr = !!(e.getModifierState && e.getModifierState('AltGraph')); } catch (err) { oops_(err, 'keypad:kpKeys_') }
  if (!altGr && e.ctrlKey && e.altKey && !e.metaKey && k.length === 1) altGr = true;
  let cmd = null;
  if (k === 'Enter') {
    e.preventDefault();
    const done = essay ? (e.ctrlKey || e.metaKey) : !(words && e.shiftKey);
    if (done) return kpDone_(t);
    cmd = '\n';
  } else if (k === 'Escape') {
    e.preventDefault();
    t.blur();
    kpClose_();
    return;
  } else if ((e.ctrlKey || e.metaKey) && !altGr && (k === 'Home' || k === 'End')) {
    /* THE WHOLE ANSWER'S START OR END (`kpLineStart_`), with ⇧ the selection to it. */
    e.preventDefault();
    if (KP_AT !== t) kpOpen_(t);
    if (e.shiftKey) return kpExtend_(t, k, true);
    return kpType_(t, k === 'Home' ? '!top' : '!bottom', true);
  } else if ((e.ctrlKey || e.metaKey) && !altGr) {
    const c = k.toLowerCase();
    const redo = (c === 'z' && e.shiftKey) || (c === 'y' && e.ctrlKey && !e.metaKey);
    if (c === 'z' || redo) {
      e.preventDefault();
      if (KP_AT !== t) kpOpen_(t);
      return kpUndo_(t, redo);
    }
    if (c === 'x') return kpCut_(e, t);
    return;
  } else if (e.shiftKey && /^(ArrowLeft|ArrowRight|Home|End)$/.test(k)) {
    e.preventDefault();
    if (KP_AT !== t) kpOpen_(t);
    return kpExtend_(t, k);
  } else if (e.shiftKey && words && (k === 'ArrowUp' || k === 'ArrowDown')) {
    e.preventDefault();
    if (KP_AT !== t) kpOpen_(t);
    return kpLine_(t, k === 'ArrowUp' ? -1 : 1, true);
  } else if (k === 'Backspace') cmd = '!back';
  else if (k === 'Delete') cmd = '!del';
  else if (k === 'ArrowLeft') cmd = '!left';
  else if (k === 'ArrowRight') cmd = '!right';
  else if (k === 'Home') cmd = '!home';
  else if (k === 'End') cmd = '!end';
  else if ((k === 'ArrowUp' || k === 'ArrowDown') && words) cmd = k;
  else if (k.length === 1) cmd = !words && k === '*' ? '\u00d7' : k;
  if (cmd == null) return;
  e.preventDefault();
  if (KP_AT !== t) kpOpen_(t);
  if (cmd === 'ArrowUp' || cmd === 'ArrowDown') return kpLine_(t, cmd === 'ArrowUp' ? -1 : 1);
  kpType_(t, cmd, true);
}
document.addEventListener('keydown', kpKeys_, true);
/* ↑ AND ↓ IN A WORDED BOX: § */
function kpLine_(inp, dir, grow) {
  const show = inp.parentNode && inp.parentNode.querySelector('.kp-show');
  if (!show) return;
  const v = inp.value;
  let s = inp.selectionStart, e = inp.selectionEnd;
  if (s == null) s = e = v.length;
  const back = inp.selectionDirection === 'backward';
  const anchor = back ? e : s;
  const from = grow ? (back ? s : e) : (dir < 0 ? s : e);
  show.innerHTML = kpDraw_(v, from, true);
  const c = show.querySelector('.kp-caret');
  if (!c) return kpRender_(inp);
  const r = c.getBoundingClientRect();
  const lh = parseFloat(getComputedStyle(show).lineHeight) || r.height || 20;
  const at = kpHitWords_(show, r.left, r.top + r.height / 2 + dir * lh);
  if (grow) return kpSelect_(inp, anchor, at);
  try { inp.setSelectionRange(at, at); } catch (err) { /* focus and scrolling are niceties */ }
  kpRender_(inp);
}
/* ⇧ WITH ← → HOME END: the selection's moving end goes one character, or to an end, and its anchor --
   where it began -- stays, whichever side of it the moving end has crossed to. */
function kpExtend_(inp, k, whole) {
  const v = inp.value;
  let s = inp.selectionStart, e = inp.selectionEnd;
  if (s == null) s = e = v.length;
  const back = inp.selectionDirection === 'backward';
  const anchor = back ? e : s;
  let to = back ? s : e;
  if (k === 'ArrowLeft') to = Math.max(0, to - 1);
  else if (k === 'ArrowRight') to = Math.min(v.length, to + 1);
  else if (k === 'Home') to = whole ? 0 : kpLineStart_(v, to);
  else if (k === 'End') to = whole ? v.length : kpLineEnd_(v, to);
  kpSelect_(inp, anchor, to);
}
/* CTRL/⌘+X: THE SELECTION TO THE CLIPBOARD, THEN TAKEN OUT THROUGH THE PAD'S EDIT. § */
let KP_CUT = false;
function kpCut_(e, t) {
  e.preventDefault();
  if (!(t.selectionEnd > t.selectionStart)) return;
  KP_CUT = false;
  try { document.execCommand('cut'); } catch (err) { oops_(err, 'keypad:kpCut_') }
  if (KP_CUT) return;
  let copied = false;
  try { copied = document.execCommand('copy'); } catch (err) { copied = false; }
  if (!copied) return;
  if (KP_AT !== t) kpOpen_(t);
  kpType_(t, '!back', true);
}
document.addEventListener('cut', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('kp-in')) return;
  KP_CUT = true;
  e.preventDefault();
  const a = t.selectionStart, b = t.selectionEnd;
  if (!(b > a)) return;
  try { e.clipboardData.setData('text/plain', t.value.slice(a, b)); } catch (err) { return; }
  if (KP_AT !== t) kpOpen_(t);
  kpType_(t, '!back', true);
}, true);
/* A PASTE ON A LAPTOP arrives on the readonly box carrying its text (measured) and is typed through
   the pad's edit like any key -- into a maths box as one line, because an `<input>` holds one. */
document.addEventListener('paste', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('kp-in')) return;
  e.preventDefault();
  let s = '';
  try { s = (e.clipboardData && e.clipboardData.getData('text')) || ''; } catch (err) { s = ''; }
  if (!s) return;
  if (KP_AT !== t) kpOpen_(t);
  kpType_(t, t.getAttribute('data-kp') === 'words' ? s.replace(/\r\n?/g, '\n') : s.replace(/\s*[\r\n]+\s*/g, ' '), true);
}, true);

/* MARK WITH AI — A WORDED ANSWER, MARKED BY GEMINI AGAINST THE SCHEME THE CARD ALREADY HOLDS. § */
let AI_OFF = false;

function aiOffered_() {
  if (AI_OFF) return false;
  try { return (DATA.features || []).indexOf('aiMark') !== -1 && DATA.aiMarking !== false; }
  catch (e) { return false; }
}

/* ---------- NOT KNOWN YET IS NOT OFF (review of 10 Oct) § */
function aiUndecided_() {
  if (AI_OFF) return false;
  try { return typeof awaiting_ === 'function' && awaiting_() && !(DATA && Array.isArray(DATA.features)); }
  catch (e) { return false; }
}

/* THE AI MARKS EVERY PART NO RULE CAN (`markerOf_`, qtools.js), and only those: one mark button per part (owner, 11 Nov). */
/* an AI part with no mark scheme is not offered it (round 4): its Check says "No mark scheme yet" instead (`qtCheck_`) */
function aiWanted_(x) {
  const m = x && typeof markerOf_ === 'function' ? markerOf_(x) : null;
  return !!m && m.ready && isAiMark_(m);
}

/* THE TILE ALONE, GOLD AND ROUND IN THE ANSWER BAR WHERE SEND STANDS ON A BOX WITH A SCHEME -- the bar, its verdict line and the sentence under it are § */
function aiOpts_(x) {
  if (!aiWanted_(x)) return null;
  const wait = aiUndecided_();
  if (!wait && !aiOffered_()) return null;
  return { send: true, act: 'qp-ai', cls: wait ? 'qp-ai-go qp-ai-wait' : 'qp-ai-go', off: wait };
}
/* ---------- AND DECIDED WHERE IT STANDS, THE MOMENT THE PAYLOAD SAYS (`adoptMarks_`, shell.js) § */
function aiDecided_() {
  if (aiUndecided_() || !aiOffered_()) return;
  document.querySelectorAll('.qp-ai-go.qp-ai-wait').forEach(b => {
    b.classList.remove('qp-ai-wait');
    b.disabled = false;
  });
  /* AND A PART PRESSED WITH NO CONNECTION is marked now its card is drawn again online (offline.js). */
  if (typeof offAiFlush_ === 'function') offAiFlush_();
}

/* THE QUESTION AS WORDS. § */
function aiPlain_(html) {
  const s = String(html || '')
    .replace(/<sup>([^<]*)<\/sup>\s*(?:&frasl;|\u2044)\s*<sub>([^<]*)<\/sub>/g, '($1)/($2)')
    .replace(/<sup>([^<]*)<\/sup>/g, '^($1)')
    .replace(/<(br|\/p|\/li|\/div|\/tr)\b[^>]*>/gi, '\n');
  let t = '';
  try { t = new DOMParser().parseFromString(s, 'text/html').body.textContent || ''; }
  catch (e) { t = s.replace(/<[^>]*>/g, ' '); }
  return t.replace(/[ \t\u00a0]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}

/* ---------- HOW MUCH GOES TO GEMINI, AND THE SAME NUMBERS ON THE SERVER § */
const AI_ANSWER_MAX = 20000, AI_QUESTION_MAX = 8000, AI_SCHEME_MAX = 8000;

function aiQuestion_(x) {
  const parts = (x.stems || []).map(p => p && p.html).concat([x.lead, x.html]);
  return parts.map(aiPlain_).filter(Boolean).join('\n\n').slice(0, AI_QUESTION_MAX);
}

function aiScheme_(x) {
  const note = String(x.examinerNote || '').trim();
  return (aiPlain_(x.answer) + (note ? '\nExaminer\u2019s note: ' + note : '')).slice(0, AI_SCHEME_MAX);
}

/* ---------- AND WHEN THERE IS NO TILE, A LINE SAYING WHY § */
function aiWhyNot_(x) {
  if (!aiWanted_(x) || aiOffered_()) return '';
  if (!(typeof whoIs_ === 'function' && whoIs_())) return '';
  return AI_OFF ? 'AI marking isn\u2019t switched on' : 'AI marking isn\u2019t switched on yet';
}

/* AND THE BOX SAYS THE MARKER IS OFF; its Check stays, unpressable, until it is on. */
function aiOff_(said) {
  AI_OFF = true;
  document.querySelectorAll('.qp-ai').forEach(box => {
    box.classList.add('is-off');
    /* NEVER SWAPPED FOR A PLAIN SEND: a human never marks, so the Check waits for the AI, off */
    box.querySelectorAll('.qp-ai-go').forEach(b => { b.disabled = true; });
    const out = box.querySelector('.qp-verdict');
    const say = said || 'AI marking isn\u2019t switched on';
    if (out) out.textContent = say;
    /* WHAT THIS LINE SAID, so `subVerdictPaint_` (js/submit.js) keeps it only while it still says it: a
       verdict that has replaced it is taken off by the next key, as on every box. */
    box.setAttribute('data-off-said', say);
  });
}

/* ---------- A BACKEND THAT READS THE WHOLE ESSAY SAYS SO (`aiMarkWhole` in `features`) § */
const AI_ANSWER_OLD = 2000;
function aiWhole_() {
  try { return (DATA.features || []).indexOf('aiMarkWhole') !== -1; }
  catch (e) { return false; }
}
const aiCount_ = n => String(n).replace(/\B(?=(\d{3})+$)/g, ',');

/* ---------- AN ESSAY'S MARK STAYS WHILE IT IS REVISED, AND ACROSS A RELOAD § */
/* KEPT IN THE PART'S ONE RECORD (qtools.js `partRecAt_`), field `ai`; an old `aiMark:` key is folded into it once. */
function aiKeep_(k, rec) {
  if (!k) return;
  partRecPutAt_(partKeyOfAns_(k), 'ai', rec);
}
function aiKept_(k) {
  if (!k) return null;
  const rec = partRecAt_(partKeyOfAns_(k)).ai;
  return rec && typeof rec.a === 'string' && typeof rec.v === 'string' ? rec : null;
}
/* WHAT THE ROW SHOWS FOR A KEPT MARK against the answer as it is now -- read by `ansBox_` when the card
   is drawn and by the `input` listener as it is typed into. */
function aiKeptView_(k, now) {
  const rec = aiKept_(k);
  if (!rec) return null;
  const fresh = String(now == null ? '' : now) === rec.a;
  return { fresh: fresh, cls: fresh ? (rec.c === 'is-right' ? 'is-right' : 'is-near') : 'is-stale',
           verdict: rec.v + (fresh ? '' : ' \u00b7 before your changes'), why: String(rec.f || '') };
}
function aiKeptPaint_(box, inp) {
  const view = aiKeptView_(inp.getAttribute('data-k'), inp.value);
  if (!view) return false;
  /* ONE OF THE THREE, and a forced `toggle` writes nothing that is already so -- this is asked on every key typed into an essay that has a kept mark. § */
  ['is-right', 'is-near', 'is-stale'].forEach(c => box.classList.toggle(c, c === view.cls));
  const out = box.querySelector('.qp-verdict');
  if (out && out.textContent !== view.verdict) out.textContent = view.verdict;
  const why = box.nextElementSibling;
  if (why && why.classList.contains('qp-ai-why') && why.textContent !== view.why) why.textContent = view.why;
  return true;
}

/* ---------- MARK WITH AI SAYS WHERE IT IS (456): the owner, "it just says marking ... we didn't feel blind". The one wait allowed words beside the dots. § */
const AI_STAGE_SENT_MS = 1500;   // the answer is a few KB of text: past this it has left on any connection that will answer
const AI_STAGE_SLOW_MS = 20000;  // a mark usually lands well inside this; past it, say so
const AI_STAGE_TICK_MS = 500;
function aiStageSay_(ms) {
  const s = Math.floor(ms / 1000);
  /* ONLY WHAT HAS HAPPENED: sent, then marked by Gemini in one call -- so no "reading" stage it cannot vouch for. */
  const words = ms < AI_STAGE_SENT_MS ? 'Sending your work…'
    : ms < AI_STAGE_SLOW_MS ? 'Marking against the scheme…'
    : 'Still working — this one is taking longer than usual';
  return s ? words + ' · ' + s + ' s' : words;
}
function aiStageStart_(box, out) {
  let line = box.querySelector(':scope > .qp-ai-stage');
  if (!line) {
    line = document.createElement('div');
    if (out && out.parentNode === box) out.after(line); else box.appendChild(line);
  }
  line.className = 'qp-ai-stage';
  line.innerHTML = '<span class="qp-ai-stage-say"></span>';
  waiting_(line);
  const say = line.querySelector('.qp-ai-stage-say');
  const began = Date.now();
  const paint = () => { const t = aiStageSay_(Date.now() - began); if (say.textContent !== t) say.textContent = t; };
  paint();
  const timer = setInterval(paint, AI_STAGE_TICK_MS);
  return { line: line, stop: () => clearInterval(timer) };
}
/* A MARK TAKES THE LINE AWAY; A FAILURE LEAVES A TRY AGAIN TILE IN IT, the reason being the verdict line above. */
function aiStageEnd_(st, failed) {
  st.stop();
  if (!failed) { st.line.remove(); return; }
  st.line.removeAttribute('aria-busy');
  st.line.className = 'qp-ai-stage tile-row';
  st.line.innerHTML = tile_({ icon: 'again', label: 'Try again', act: 'qp-ai-again' });
}
on('qp-ai-again', (el) => {
  const box = el.closest('.qp-ai');
  const go = box && box.querySelector('[data-do="qp-ai"]');
  if (go && !go.disabled) ACTIONS['qp-ai'](go);
});

const aiMarkSane_ = d => Number.isInteger(Number(d.awarded)) && Number.isInteger(Number(d.available))
  && Number(d.available) >= 1 && Number(d.awarded) >= 0 && Number(d.awarded) <= Number(d.available) && d.available !== '' && d.awarded !== '';
