/* ==================================================================================================
   @family. — answers.js

   WHAT A CHILD WRITES IS THEIRS, AND IT GOES WHERE THEY GO.

   REPORTED BY THE OWNER, LIVE, ON A PUPIL'S iPAD:
     *"i just relogged in as [the child] after having done the questions earlier and i dont see his
      answers there"*
     *"it doesnt seem to save their answers"*
     *"i am very dissapointed it didnt have his answers already written in when he went to see them on
      the computer"*

   ALL THREE WERE TRUE. An answer — typed, picked, drawn or ringed — lived in the browser it was made
   in (`localStorage`, under `ans:u:<person>:<question>`) and nowhere else. The card on the computer
   said `Done 8 Oct` (the `attempts` tab has had the date since 268) over an empty box: the record that
   the work happened, without the work. And on the SAME iPad, an answer typed before anybody signed in
   was looked for under a key no answer had (the `ansRead_` regex — see find.js) and never found.

   SO EVERY ANSWER NOW HAS A HOME ON THE ACCOUNT — the `answers` tab (SCHEMA.answers), one row per
   person per answer — and this file is the phone's half:

     WRITING     `ansStore_` is the ONE writer. Every place that used to `localStorage.setItem` an answer
                 calls it (the box's `input`, a pick, a stroke, an undo, a clear, a ringed word, an old
                 drawing moved to whoever opened it). Signed in, it stamps the edit's time and marks the
                 key DIRTY — kept in `localStorage`, so a reload, a crash or a dead battery cannot lose
                 the fact that it still has to go up.
     SENDING     `answersPush_`, a second and a half after the last keystroke, and AT ONCE on Check, on a
                 pick, on leaving the box, and as the app goes to the background (with `keepalive`, so a
                 child closing the iPad cover does not take the last answer with them). A key stops
                 being dirty only when the server has it AND the box has not changed since it was sent.
     READING     `answersPull_`, from `adoptMarks_` once a visit, the moment somebody signs in, and when
                 the app comes back to the front (at most once a minute — the iPad to the computer and
                 back). A DIRTY KEY WINS (it is about to upload, and it is newer), and A BOX UNDER A
                 FINGER IS NEVER OVERWRITTEN.
     SAYING SO   `ansSavedSay_` / `ansSavedPaint_` — one dim line under the box: "Saved to Ada’s
                 account", "Saving…", or "On this device only — sign in to keep it". The owner said
                 *"i feel very insecure when signing into the kids accounts"*; a parent has to be able
                 to SEE where the work went. Not a global "who is signed in" pill: the owner took the
                 name off the box as clutter (*"remove 'names answer'. that is redundant."*), so the name
                 appears only in the one sentence that is about whose account the answer is on.

   AND `findKeep_`, which keeps the Find column from being rebuilt under a child who is typing — the
   other half of *"janky and unresponsive"*: a payload landing fifteen seconds after "Signed in" used to
   replace the box with the keypad up.

   ITS OWN FILE because it is one idea with one vocabulary, and find.js is 940 KB that three people are
   working in at once. It loads after find.js and keypad.js; everything it calls in them is called at
   run time, never while loading, so the order between them is free.
================================================================================================== */

/* ---------- THE KEYS ----------------------------------------------------------------------------------
   ON THE PHONE an answer's key carries the person: `ans:u:P7:q:Q-1`, `pad:u:P7:q:Q-1`,
   `pad:u:P7:q:Q-1:words`, `ans:u:P7:pr:PR-1#iv`. ON THE SHEET the person is its own column, so the key
   goes up without them — `ans:q:Q-1` — and comes back with whoever asked put in again. A signed-out key
   (`ans:q:Q-1`) has nobody in it, and is the device's alone. */
const ANS_KEY_WHO = /^(?:ans|pad):(u:[^:]+):/;
const ansWhoOf_ = k => { const m = ANS_KEY_WHO.exec(String(k || '')); return m ? m[1] : ''; };
const ansServerKey_ = k => String(k || '').replace(/^(ans|pad):u:[^:]+:/, '$1:');
const ansLocalKey_ = (sk, who) => String(sk || '').replace(/^(ans|pad):/, '$1:' + who + ':');
/* A DRAWING'S STROKES, as against its ringed words (`:words`) or a typed answer. */
const ansIsPad_ = k => /^pad:/.test(String(k || '')) && !/:words$/.test(String(k || ''));
const ansIsRing_ = k => /^pad:/.test(String(k || '')) && /:words$/.test(String(k || ''));

/* THE SERVER'S CEILINGS, said again because the phone must not send what will be refused — and a value
   it would refuse stays on the device rather than being retried for ever. `ANSWER_TEXT_MAX`,
   `ANSWER_PAD_MAX` and `ANSWERS_PER_POST` in backend/constants.gs; `check-saved-answers.js` asks the
   server's. */
const ANS_TEXT_MAX = 2000, ANS_PAD_MAX = 40000, ANS_PER_POST = 25;
/* AND WHAT A `keepalive` REQUEST MAY CARRY. A browser refuses one over 64 KB, so the flush as the app
   goes away sends what fits and leaves the rest dirty for next time. */
const ANS_KEEPALIVE_MAX = 60000;
/* THE STAMP OF AN ANSWER THE ACCOUNT WILL NOT TAKE — over its ceiling, or refused by the server — so it is
   neither due (it would be refused for ever) nor "saved". The next edit stamps it again and it is asked
   once more. */
const ANS_HERE_ONLY = -1;

/* ---------- WHAT IS ON THIS DEVICE -------------------------------------------------------------------
   EVERY READ AND WRITE IS WRAPPED, for find.js's reason: private mode THROWS on `localStorage` rather
   than answering null. `ANS_MEM` holds this visit's writes so a throwing storage still saves the visit's
   work to the account — the one case where the account is the only copy there will ever be.
   ONLY WHEN STORAGE THROWS. A storage that answers null means the key is not there — taken away by a
   clear, a move to whoever signed in, or another tab — and the visit's old copy must not bring it back. */
const ANS_MEM = new Map();
function ansValue_(k) {
  try { return localStorage.getItem(k); } catch (e) {}
  return ANS_MEM.has(k) ? ANS_MEM.get(k) : null;
}
function ansLocalPut_(k, v) {
  ANS_MEM.set(k, v);
  try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {}
  /* A RING HELD FOR THE VISIT (`CIRC_HELD`) is the copy `circRead_` falls back to, and must say the same. */
  if (ansIsRing_(k) && typeof CIRC_HELD !== 'undefined') {
    try { if (v === null || v === '') CIRC_HELD.delete(k); else CIRC_HELD.set(k, JSON.parse(v)); } catch (e) {}
  }
}
/* WHEN THE ANSWER IN THIS KEY WAS LAST EDITED, in ms — by this device's child, or by whichever device
   the server's copy came from. 0 is "never stamped": a value from before this file existed. */
const ANS_AT_MEM = new Map();
function ansAt_(k) {
  try { return Number(localStorage.getItem('ansAt:' + k)) || 0; } catch (e) {}
  return ANS_AT_MEM.get(k) || 0;
}
function ansAtSet_(k, at) {
  ANS_AT_MEM.set(k, at);
  try { localStorage.setItem('ansAt:' + k, String(at)); } catch (e) {}
}
/* WHICH KEYS STILL HAVE TO GO UP, per person. A Set held for the visit and written through to storage,
   so the list survives a reload, a crash and a sign-out — and goes up the next time that person signs
   in, on this device. */
const ANS_DIRTY = new Map();
function ansDirtySet_(who) {
  let s = ANS_DIRTY.get(who);
  if (!s) {
    s = new Set();
    try { (JSON.parse(localStorage.getItem('ansDirty:' + who) || '[]') || []).forEach(k => s.add(String(k))); } catch (e) {}
    ANS_DIRTY.set(who, s);
  }
  return s;
}
function ansDirtyKeep_(who) {
  const s = ANS_DIRTY.get(who);
  try {
    if (s && s.size) localStorage.setItem('ansDirty:' + who, JSON.stringify([...s]));
    else localStorage.removeItem('ansDirty:' + who);
  } catch (e) {}
}

/* ---------- THE ONE WRITER ---------------------------------------------------------------------------
   `v` is the value as stored (`null` takes the key away — a cleared drawing, the last ring taken off).
   SIGNED OUT IT IS EXACTLY WHAT IT ALWAYS WAS: the value, on the device, and nothing else — there is
   nobody to send it to, and the line under the box says so. */
function ansStore_(k, v) {
  k = String(k || '');
  if (!k) return;
  ansLocalPut_(k, v === undefined ? null : (v === null ? null : String(v)));
  const who = ansWhoOf_(k);
  if (who) {
    ansAtSet_(k, Date.now());
    ansDirtySet_(who).add(k);
    ansDirtyKeep_(who);
    answersPush_();
  }
  ansSavedPaint_();
}

/* ---------- MAY THIS PHONE SEND, AND READ ------------------------------------------------------------
   A person with an id and a session, and a backend that says it can (`DATA.features`) — so a phone
   ahead of the deploy keeps answers on the device and SAYS so under the box, rather than being refused
   on every keystroke or claiming a save that never happened. */
function answersCan_(what) {
  try {
    return !!(USER && USER.personId && USER.token && DATA && Array.isArray(DATA.features)
      && DATA.features.indexOf(what || 'saveAnswers') !== -1);
  } catch (e) { return false; }
}

/* ---------- A DRAWING, SMALLER, BEFORE IT TRAVELS -------------------------------------------------------
   RAMER–DOUGLAS–PEUCKER, ONE UNIT OF THE 340-WIDE PICTURE. Measured: a 340-unit freehand stroke is 504
   points and 3,796 characters as drawn, 33 points and 248 characters after — and the line it draws is
   the same line to within a unit, which is finer than the finger that made it. Only what is SENT is
   simplified; this device keeps every point it drew. A dot (one point) is a dot. */
function ansSimplify_(st, tol) {
  const n = Math.floor((st || []).length / 2);
  if (n <= 2) return (st || []).slice();
  const keep = new Uint8Array(n);
  keep[0] = 1; keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const ax = st[2 * a], ay = st[2 * a + 1], bx = st[2 * b], by = st[2 * b + 1];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    let far = -1, most = 0;
    for (let i = a + 1; i < b; i++) {
      const px = st[2 * i], py = st[2 * i + 1];
      const d = len ? Math.abs(dy * px - dx * py + bx * ay - by * ax) / len : Math.hypot(px - ax, py - ay);
      if (d > most) { most = d; far = i; }
    }
    if (far > 0 && most > tol) { keep[far] = 1; stack.push([a, far], [far, b]); }
  }
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(st[2 * i], st[2 * i + 1]);
  return out;
}
/* WHAT GOES UP FOR ONE KEY: the text as it is, a drawing simplified, and nothing as ''. */
function ansOutgoing_(k, raw) {
  if (raw === null || raw === undefined) return '';
  if (!ansIsPad_(k)) return String(raw);
  try {
    const all = JSON.parse(raw);
    if (!Array.isArray(all)) return String(raw);
    return JSON.stringify(all.map(st => Array.isArray(st) ? ansSimplify_(st, 1) : st));
  } catch (e) { return String(raw); }
}
/* AND WHAT COMES DOWN, CHECKED, before it goes anywhere near the markup. A drawing is a list of lists of
   numbers and a ringed word is `3.7`; anything else is a value this phone cannot draw, and it is left on
   the sheet rather than put in a `<path d>`. */
function ansIncoming_(sk, v) {
  const s = v === null || v === undefined ? '' : String(v);
  if (!/^pad:/.test(sk)) return s;
  if (s === '') return '';
  try {
    const all = JSON.parse(s);
    if (!Array.isArray(all)) return null;
    if (/:words$/.test(sk)) return all.every(w => /^\d+\.\d+$/.test(String(w))) ? JSON.stringify(all.map(String)) : null;
    return all.every(st => Array.isArray(st) && st.every(n => typeof n === 'number' && isFinite(n)))
      ? JSON.stringify(all.map(st => st.map(n => Math.round(n)))) : null;
  } catch (e) { return null; }
}

/* ---------- SENDING ----------------------------------------------------------------------------------
   `answersPush_()` books a send a second and a half out, the notepad's rhythm, so a sentence typed is one
   request and not forty. `answersPush_(true)` sends now — Check, a pick, leaving the box, the app going
   away — and returns a promise of whether everything due went up. `keepalive` is for the last of those:
   a request the browser finishes after the page is gone. */
const ANS_WAIT = 1500;
let ANS_TIMER = 0;
let ANS_BUSY = null;          // the request in flight, so a second flush joins it rather than racing it
let ANS_AGAIN = false;
let ANS_RETRY = 0, ANS_BACKOFF = 0;
function answersPush_(now, keepalive) {
  clearTimeout(ANS_TIMER);
  ANS_TIMER = 0;
  if (!now) { ANS_TIMER = setTimeout(() => answersPush_(true), ANS_WAIT); return Promise.resolve(false); }
  if (!answersCan_('saveAnswers') || typeof api !== 'function') return Promise.resolve(false);
  if (ANS_BUSY) { ANS_AGAIN = true; return ANS_BUSY; }
  const pid = String(USER.personId), who = 'u:' + pid;
  const dirty = ansDirtySet_(who);
  if (!dirty.size) return Promise.resolve(true);
  const items = [], sent = [];
  let size = 0;
  for (const k of dirty) {
    if (items.length >= ANS_PER_POST) break;
    const raw = ansValue_(k);
    const v = ansOutgoing_(k, raw);
    /* OVER ITS CEILING IT STAYS HERE, and stops being due: the server would refuse it every time. Its
       stamp says so (`ANS_HERE_ONLY`), so the line under the box does not claim a save that never was. */
    if (v.length > (/^pad:/.test(k) ? ANS_PAD_MAX : ANS_TEXT_MAX)) { dirty.delete(k); ansAtSet_(k, ANS_HERE_ONLY); continue; }
    const item = { key: ansServerKey_(k), v: v, at: ansAt_(k) || Date.now() };
    const len = JSON.stringify(item).length;
    if (keepalive && items.length && size + len > ANS_KEEPALIVE_MAX) break;
    if (keepalive && len > ANS_KEEPALIVE_MAX) continue;
    size += len;
    items.push(item);
    sent.push({ k: k, raw: raw, at: item.at });
  }
  ansDirtyKeep_(who);
  if (!items.length) { ansSavedPaint_(); return Promise.resolve(true); }
  /* `personId` AS WELL AS THE TOKEN — the gate overwrites it with the token's person, and `check-post.js`
     asks that every handler reading one is sent one. */
  const req = api({ action: 'saveAnswers', personId: pid, items: items }, keepalive ? { keepalive: true } : undefined);
  ANS_BUSY = Promise.resolve(req)
    .then(d => {
      if (!d || !d.success || !d.saved || typeof d.saved !== 'object') throw new Error((d && d.error) || 'not saved');
      const won = [];
      sent.forEach(s => {
        const got = d.saved[ansServerKey_(s.k)];
        /* REFUSED — a key or a size the server will not take. Not due any more; it stays on the device,
           and its stamp says so. */
        if (!got) { dirty.delete(s.k); ansAtSet_(s.k, ANS_HERE_ONLY); return; }
        /* TYPED OVER WHILE IT WAS ON THE WIRE: still due, and the send that is already booked takes it. */
        if (ansValue_(s.k) !== s.raw) return;
        dirty.delete(s.k);
        const at = Number(got.at) || s.at;
        /* THE SERVER HAD A LATER EDIT (another device, since) — and the later edit wins, here as there. */
        if (at > s.at && ansIncoming_(ansServerKey_(s.k), got.v) !== null && !ansHeld_(s.k)) {
          ansLocalPut_(s.k, ansIncoming_(ansServerKey_(s.k), got.v) || (/^pad:/.test(s.k) ? null : ''));
          won.push(s.k);
        }
        ansAtSet_(s.k, at);
      });
      ansDirtyKeep_(who);
      ANS_RETRY = 0; ANS_BACKOFF = 0;
      if (won.length) ansRefresh_(won);
      return true;
    })
    .catch(() => {
      /* REFUSED OR UNREACHED: every key stays due, and it is tried again — sooner at first, then less
         often, so a phone with no signal is not a request a second. */
      ANS_BACKOFF = Math.min(Math.max(5000, ANS_BACKOFF * 2), 300000);
      clearTimeout(ANS_RETRY);
      ANS_RETRY = setTimeout(() => answersPush_(true), ANS_BACKOFF);
      return false;
    })
    .then(ok => {
      ANS_BUSY = null;
      ansSavedPaint_();
      const again = ANS_AGAIN;
      ANS_AGAIN = false;
      const same = !!USER && String(USER.personId) === pid;
      /* MORE THAN ONE REQUEST'S WORTH, or a flush asked for while this one was out: once more, now. */
      if (ok && same && (again || (dirty.size && items.length >= ANS_PER_POST))) return answersPush_(true);
      /* TYPED OVER WHILE IT WAS OUT: due again, on the ordinary second and a half — a child typing
         through a slow reply is still one request per pause, not one per round trip. */
      if (ok && same && dirty.size && !keepalive) answersPush_();
      return ok;
    });
  return ANS_BUSY;
}

/* ---------- READING ----------------------------------------------------------------------------------
   ONCE PER PERSON PER VISIT from `adoptMarks_` (a payload landing), and again whenever `force` says so:
   signing in, and coming back to the app after a minute away. Answered `{ success, for, answers }`; a
   reply for anybody but the person signed in NOW is about the last child on a shared iPad, and is
   dropped. `check/ui.js` answers every POST with the payload, which has no `for` — dropped the same way. */
let ANS_PULLED = '';
let ANS_PULL_AT = 0;
let ANS_PULLING = null;
function answersPull_(force) {
  if (!answersCan_('myAnswers') || typeof api !== 'function') return Promise.resolve(false);
  const pid = String(USER.personId);
  if (!force && ANS_PULLED === pid) return Promise.resolve(false);
  if (ANS_PULLING && ANS_PULLING.pid === pid) return ANS_PULLING.p;
  ANS_PULLED = pid;
  ANS_PULL_AT = Date.now();
  const p = Promise.resolve(api({ action: 'myAnswers', personId: pid }))
    .then(d => {
      ANS_PULLING = null;
      if (!d || !d.success || !d.answers || typeof d.answers !== 'object') { ANS_PULLED = ''; return false; }
      if (String(d.for || '') !== pid || !USER || String(USER.personId) !== pid) return false;
      answersAdopt_(pid, d.answers);
      /* AND WHATEVER IS DUE GOES UP NOW — the backlog the merge just found included. */
      answersPush_(true);
      return true;
    })
    .catch(() => { ANS_PULLING = null; ANS_PULLED = ''; return false; });
  ANS_PULLING = { pid: pid, p: p };
  return p;
}

/* IS THIS KEY UNDER A FINGER — the box with the focus, or the pad taking the pen. Never overwritten. */
function ansHeld_(k) {
  try {
    const a = document.activeElement;
    if (a && a.getAttribute && a.getAttribute('data-k') === k) return true;
    if (typeof PAD_ON !== 'undefined' && PAD_ON && (PAD_ON === k || PAD_ON + ':words' === k)) return true;
  } catch (e) {}
  return false;
}

/* ---------- THE MERGE -----------------------------------------------------------------------------------
   `got` is `{ <server key>: { v, at } }` for this person — from `myAnswers` or the sign-in reply.
     a DIRTY key here         wins: it is about to go up, and it is the later edit
     a key under a finger     is left alone — the child is writing in it
     the same edit coming back (same `at`)  nothing to do
     otherwise                the server's value replaces this device's, and its `at` with it
   THEN THE BACKLOG: an answer on this device for this person with no stamp at all is from before this
   file — typed by this child on this iPad this afternoon, say — and if the sheet has nothing for it, it
   is due. That is the answer the owner went looking for on the computer. */
function answersAdopt_(pid, got) {
  const who = 'u:' + String(pid);
  const dirty = ansDirtySet_(who);
  const changed = [];
  const seen = new Set();
  Object.keys(got || {}).forEach(sk => {
    if (!/^(ans|pad):/.test(sk)) return;
    const g = got[sk];
    if (!g || typeof g !== 'object') return;
    const k = ansLocalKey_(sk, who);
    seen.add(k);
    const v = ansIncoming_(sk, g.v);
    if (v === null) return;
    const at = Number(g.at) || 0;
    if (dirty.has(k) || ansHeld_(k)) return;
    const lat = ansAt_(k);
    /* TOO LONG FOR THE ACCOUNT, SO KEPT HERE — and not replaced by the shorter one the account has. */
    if (lat === ANS_HERE_ONLY) return;
    if (lat && lat === at) return;
    const local = ansValue_(k);
    if ((local === null ? '' : local) === v) { if (at) ansAtSet_(k, at); return; }
    /* NEWER HERE AND NOT DUE — the sheet lost it, or never had the last of it. Sent again. */
    if (lat && lat > at) { dirty.add(k); return; }
    ansLocalPut_(k, v === '' && /^pad:/.test(k) ? null : v);
    if (at) ansAtSet_(k, at);
    changed.push(k);
  });
  try {
    const pre = ['ans:' + who + ':', 'pad:' + who + ':'];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || seen.has(k) || dirty.has(k) || !pre.some(p => k.indexOf(p) === 0)) continue;
      if (ansAt_(k)) continue;
      const v = localStorage.getItem(k);
      if (v === null || !String(v).trim() || v === '[]') continue;
      ansAtSet_(k, Date.now());
      dirty.add(k);
    }
  } catch (e) {}
  ansDirtyKeep_(who);
  if (changed.length) ansRefresh_(changed);
  ansSavedPaint_();
}

/* ---------- AND WHAT IS ON THE SCREEN, CHANGED WHERE IT STANDS -------------------------------------------
   NOT A REPAINT. A repaint of Find is the thing `findKeep_` exists to hold back, and it would throw away
   every verdict on the column. Each kind of answer is put back by the code that draws it: a box's value
   (and the keypad's drawing of it), the options rebuilt by `choiceBox_` exactly as a tap does, a pad's
   strokes by `padRepaint_`, a ring by its class. A verdict about the old answer goes, as typing takes it. */
function ansRefresh_(keys) {
  const want = new Set(keys);
  const has = k => want.has(k) && !ansHeld_(k);
  try {
    document.querySelectorAll('[data-do="qp-ans"][data-k]').forEach(el => {
      const k = el.getAttribute('data-k');
      if (!has(k)) return;
      const v = typeof ansRead_ === 'function' ? ansRead_(k) : (ansValue_(k) || '');
      if (el.value === v) return;
      el.value = v;
      /* REDRAWN BY THE PAD'S OWN DRAWING (`kpRender_`), which knows a worded box from a maths one: this
         called `kpTypeset_` on every box, and a worded answer filled from another device came back
         typeset -- `well-known` with a minus in it, `and/or` stacked as a fraction. */
      if (el.classList.contains('kp-in') && typeof kpRender_ === 'function') kpRender_(el);
      const card = el.closest('.qcard');
      [card && card.querySelector('.qp-mark[data-accept]'), card && card.querySelector('.qp-ai')].forEach(m => {
        if (!m) return;
        m.classList.remove('is-right', 'is-near');
        const out = m.querySelector('.qp-verdict');
        if (out) out.textContent = '';
      });
    });
    document.querySelectorAll('.qp-choices[data-k]').forEach(box => {
      if (has(box.getAttribute('data-k')) && typeof choiceRedraw_ === 'function') choiceRedraw_(box);
    });
    document.querySelectorAll('.qpad[data-k]').forEach(pad => {
      const k = pad.getAttribute('data-k');
      if (has(k) && typeof padRepaint_ === 'function') padRepaint_(pad, padRead_(k));
    });
    document.querySelectorAll('[data-circ]').forEach(h => {
      const k = h.getAttribute('data-circ');
      if (!has(k) || typeof circRead_ !== 'function') return;
      const on = circRead_(k);
      h.querySelectorAll('.qw').forEach(s => {
        const lit = on.indexOf(s.getAttribute('data-w')) !== -1;
        s.classList.toggle('is-circled', lit);
        s.setAttribute('aria-pressed', lit ? 'true' : 'false');
      });
    });
  } catch (e) {}
}

/* ---------- THE LINE UNDER THE BOX ---------------------------------------------------------------------
   ONE LINE, ALWAYS THE SAME HEIGHT (`.qp-saved` reserves it), so a box that goes from nothing to
   "Saving…" to "Saved" moves nothing under it — the rule 261 made for the verdict. Empty when there is
   nothing written: a line about saving an empty box is a line about nothing.

     signed out                         On this device only — sign in to keep it
     signed in, a backend that cannot   On this device only
     over the account's ceiling         On this device only — too long for the account
     due, or not yet reconciled         Saving…
     on the account                     Saved to Ada’s account

   THE FIRST NAME, AND ONLY HERE. It is the one sentence that is about whose account the work went to,
   which is exactly what a parent handing an iPad between children needs to read. */
function ansFirstName_() {
  try { return String((USER && (USER.name || USER.handle)) || '').trim().split(/\s+/)[0] || ''; }
  catch (e) { return ''; }
}
function ansSavedSay_(k) {
  k = String(k || '');
  const v = ansValue_(k);
  if (v === null || !String(v).trim() || v === '[]') return '';
  const who = ansWhoOf_(k);
  if (!who) return 'On this device only — sign in to keep it';
  if (!answersCan_('saveAnswers') || who !== 'u:' + String(USER.personId)) return 'On this device only';
  if (ansAt_(k) === ANS_HERE_ONLY) return 'On this device only \u2014 too long for the account';
  if (ansDirtySet_(who).has(k) || !ansAt_(k)) return 'Saving…';
  const name = ansFirstName_();
  return name ? 'Saved to ' + name + '’s account' : 'Saved to your account';
}
function ansSavedPaint_() {
  try {
    document.querySelectorAll('.qp-saved[data-k]').forEach(el => {
      const say = ansSavedSay_(el.getAttribute('data-k'));
      if (el.textContent !== say) el.textContent = say;
    });
  } catch (e) {}
}
/* THE SAME FACT FOR THE PEN AND THE RINGED WORDS, in the note they already carried ("Kept on this phone
   only, like the answer box" — true until today, and now true only signed out). Drawn with the card, so
   it is the state at the last repaint. */
function padKeptSay_() {
  if (!(typeof whoIs_ === 'function' && whoIs_())) return 'Kept on this device only — sign in to keep it.';
  if (!answersCan_('saveAnswers')) return 'Kept on this device only.';
  const name = ansFirstName_();
  return 'Saved to ' + (name ? name + '’s' : 'your') + ' account, like the answer box.';
}

/* ---------- WHEN IT SENDS AT ONCE ------------------------------------------------------------------------
   LEAVING A BOX, which is the moment a child has finished with it. AFTER CHECK, A PICK OR "MARK WITH AI"
   — this listener is added after the app's own click dispatcher (shell.js), so the handler has stored the
   answer by the time this runs. AND THE APP GOING AWAY: `visibilitychange` to hidden is the last event an
   iPad reliably sends when the cover closes or the Home Screen is pressed, and `pagehide` is the one a
   tab closing sends — both with `keepalive`. */
document.addEventListener('focusout', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-ans"]');
  if (el) answersPush_(true);
});
document.addEventListener('click', e => {
  const t = e.target && e.target.closest && e.target.closest('[data-do="qp-check"], [data-do="qp-choose"], [data-do="qp-ai"]');
  if (t) answersPush_(true);
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { answersPush_(true, true); return; }
  /* BACK IN FRONT, AND IT HAS BEEN A WHILE: the computer may have written since. Once a minute at most. */
  if (document.visibilityState === 'visible' && Date.now() - ANS_PULL_AT > 60000) answersPull_(true);
});
window.addEventListener('pagehide', () => { answersPush_(true, true); });

/* ==================================================================================================
   AND THE FIND COLUMN IS NOT REBUILT UNDER A CHILD WHO IS WRITING.

   MEASURED (diag-signin, 820x1180, the iPad): focus a keypad box on Find right after signing in, type
   "7" — saved — and when the payload landed fifteen seconds later the whole column was rebuilt: the box
   replaced, `KP_AT` left on a detached input, the keypad closed. On Safari, which may not send
   `focusout` for a removed element, the pad would stay up typing into nothing. The messages reply and
   the profile refresh then did it twice more.

   `settingsKeep_` (me.js) already answers this for a half-filled settings card, and `paint` asks it.
   This is the same question for Find: while an answer box has the focus, the keypad is up or a stroke
   is half drawn, the column is marked STALE instead of rebuilt — and drawn again a moment after the
   child leaves the box, or the next time the column is arrived at.

   NOT WHILE THE PEN IS MERELY ON, and not while a verdict is showing, though both were tried: either
   can outlast a sign-out, and a Find column held stale across a change of person is one whose boxes are
   still keyed to the last child. The pen's state is redrawn from `PAD_ON` anyway, and every stroke is
   stored the moment it ends. A verdict is only held back from the moment-after redraw below, which is
   the one that would wipe "Correct" a heartbeat after Check put it there. */
function findKeep_(id) {
  if (id !== 'stuff') return false;
  try {
    const host = document.getElementById('s-stuff');
    if (!host) return false;
    const a = document.activeElement;
    if (a && host.contains(a) && a.matches && a.matches('[data-do="qp-ans"], .kp-in, textarea, input')) return true;
    if (document.documentElement.classList.contains('kp-up')) return true;
    return typeof PAD_ST !== 'undefined' && !!PAD_ST;
  } catch (e) { return false; }
}
/* A VERDICT ON THE SCREEN, which lives in the DOM only — Check writes it there and nothing stores it. */
function findVerdictShown_() {
  try {
    const host = document.getElementById('s-stuff');
    return !!host && [].some.call(host.querySelectorAll('.qp-mark[data-accept] .qp-verdict, .qp-ai .qp-verdict'),
      el => !!String(el.textContent || '').trim());
  } catch (e) { return false; }
}
/* THE REDRAW IT HELD BACK, once nothing is held — a moment after leaving the box, so a tap that moved the
   focus from one box to the next (focusout, then focusin) finds the next box focused and waits again.
   Not over a verdict just given: that waits for the next arrival at the column (`go` draws a stale
   column on the way in). */
let FIND_KEPT_TIMER = 0;
document.addEventListener('focusout', () => {
  clearTimeout(FIND_KEPT_TIMER);
  FIND_KEPT_TIMER = setTimeout(() => {
    try {
      if (AT === 'stuff' && STALE && STALE.stuff && !findKeep_('stuff') && !findVerdictShown_()) repaint();
    } catch (e) {}
  }, 400);
});

/* ---------- AND FORGOTTEN AT SIGN-OUT ----------------------------------------------------------------
   `signedOut_` (me.js) calls this: the next person to sign in is read for at once, whoever they are, and
   a retry booked for the last one is not left to run. What is still due stays due — under the last
   person's key, for the next time they sign in here. */
function answersForget_() {
  ANS_PULLED = '';
  ANS_PULLING = null;
  ANS_PULL_AT = 0;
  clearTimeout(ANS_RETRY);
  ANS_BACKOFF = 0;
}
