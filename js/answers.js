/* @family. — answers.js WHAT A CHILD WRITES IS THEIRS, AND IT GOES WHERE THEY GO. § */

/* ---------- THE KEYS § */
const ANS_KEY_WHO = /^(?:ans|pad):(u:[^:]+):/;
const ansWhoOf_ = k => { const m = ANS_KEY_WHO.exec(String(k || '')); return m ? m[1] : ''; };
const ansServerKey_ = k => String(k || '').replace(/^(ans|pad):u:[^:]+:/, '$1:');
const ansLocalKey_ = (sk, who) => String(sk || '').replace(/^(ans|pad):/, '$1:' + who + ':');
/* A DRAWING'S STROKES, as against its ringed words (`:words`) or a typed answer. */
const ansIsPad_ = k => /^pad:/.test(String(k || '')) && !/:words$/.test(String(k || ''));
const ansIsRing_ = k => /^pad:/.test(String(k || '')) && /:words$/.test(String(k || ''));
/* THE WHITEBOARD'S STROKES (`board:`, find.js): a drawing, kept on the device and never sent. */
const ansIsBoard_ = k => /^board:/.test(String(k || ''));
/* ---------- WHAT A MARK OF WHOSE IT IS CAN NAME (`ansGoneMark_`, below) § */
const ANS_MARKABLE = /^(?:(?:ans|pad|board):(?!u:)|draft:device:)/;
const ansMarkable_ = k => ANS_MARKABLE.test(String(k || ''));
const ansKeyWho_ = k => { const m = /^(?:ans|pad|board|draft):(u:[^:]+):/.exec(String(k || '')); return m ? m[1] : ''; };

/* THE SERVER'S CEILINGS, said again because the phone must not send what will be refused — and a value it would refuse stays on the device rather than being § */
/* 20,000 SINCE AN ESSAY BECAME AN ANSWER (9 Oct): at 2,000 a forty-mark essay stopped going to the account
   at its fourth paragraph. See `ANSWER_TEXT_MAX`. */
const ANS_TEXT_MAX = 20000, ANS_PAD_MAX = 40000, ANS_PER_POST = 25;
/* AND WHAT A `keepalive` REQUEST MAY CARRY. A browser refuses one over 64 KB, so the flush as the app
   goes away sends what fits and leaves the rest dirty for next time. */
const ANS_KEEPALIVE_MAX = 60000;
/* THE STAMP OF AN ANSWER THE ACCOUNT WILL NOT TAKE — over its ceiling, or refused by the server — so it is
   neither due (it would be refused for ever) nor "saved". The next edit stamps it again and it is asked
   once more. */
const ANS_HERE_ONLY = -1;

/* ---------- WHAT IS ON THIS DEVICE § */
const ANS_MEM = new Map();
function ansValue_(k) {
  /* A KEY THE STORE REFUSED IS READ FROM THE VISIT FIRST (`keepHeld_`, data.js) — the stored copy is
     older, or nothing, and drawing it is how the next key saved it over the newer one (317). */
  const held = typeof keepHeld_ === 'function' ? keepHeld_(k) : undefined;
  if (held !== undefined) return held;
  try { return localStorage.getItem(k); } catch (e) {}
  return ANS_MEM.has(k) ? ANS_MEM.get(k) : null;
}
/* `words` IS TRUE FOR A WORDED BOX (the essay's too), from the `input` listener in find.js — what
   `ansJoin_` asks before it puts two answers of one person's together. */
function ansLocalPut_(k, v, words) {
  /* WHAT WAS HERE BEFORE THIS WRITE, which the mark below asks about — read before `ANS_MEM` takes the new
     value, because a store that throws is read from `ANS_MEM`. */
  const mark = ansMarkable_(k);
  const was = mark ? ansValue_(k) : null;
  ANS_MEM.set(k, v);
  /* SIGNED OUT, WHILE A SESSION THE SERVER ENDED IS FRESH, IT IS THAT PERSON'S — `ansGoneMark_` below. § */
  if (mark) ansGoneMark_(k, v, words, was);
  /* A FULL STORE GIVES UP THE LOADING SCREEN'S COPY BEFORE IT GIVES UP A CHILD'S WORK. § */
  if (typeof keepPut_ === 'function') keepPut_(k, v);
  else { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
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

/* ---------- THE ONE WRITER § */
function ansStore_(k, v, words) {
  k = String(k || '');
  if (!k) return;
  ansLocalPut_(k, v === undefined ? null : (v === null ? null : String(v)), words);
  const who = ansWhoOf_(k);
  ansAtSet_(k, Date.now());
  if (who) {
    /* STAMPED ALWAYS (above, signed out too — 318's claim reads it) — the time of the edit is also what tells a draft typed here after the last press from the press § */
    if (ansSyncs_(k)) {
      ansDirtySet_(who).add(k);
      ansDirtyKeep_(who);
      answersPush_();
    }
  }
  ansSavedPaint_();
}
/* DOES THIS KEY STILL GO TO THE ACCOUNT AS A DRAFT? A drawing always; a typed, picked or ordered answer
   only to a backend that cannot take the presses (`submitAnswer`), where the draft is all it can keep. */
function ansSyncs_(k) {
  return !/^ans:/.test(String(k || '')) || !answersCan_('submitAnswer');
}

/* ---------- MAY THIS PHONE SEND, AND READ § */
function answersCan_(what) {
  try {
    return !!(USER && USER.personId && USER.token && DATA && Array.isArray(DATA.features)
      && DATA.features.indexOf(what || 'saveAnswers') !== -1);
  } catch (e) { return false; }
}

/* ---------- A DRAWING, SMALLER, BEFORE IT TRAVELS § */
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
/* AND WHAT COMES DOWN, CHECKED, before it goes anywhere near the markup. § */
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

/* ---------- SENDING § */
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
  /* A TYPED ANSWER LEFT DUE FROM BEFORE — marked on an older visit, or before this payload said the
     backend keeps submissions — is not a draft to send any more: what was SENT is its record. */
  let dropped = false;
  [...dirty].forEach(k => { if (!ansSyncs_(k)) { dirty.delete(k); dropped = true; } });
  if (dropped) ansDirtyKeep_(who);
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

/* ---------- READING § */
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

/* ---------- THE MERGE § */
function answersAdopt_(pid, got) {
  const who = 'u:' + String(pid);
  const dirty = ansDirtySet_(who);
  const changed = [];
  const seen = new Set();
  /* THE ACCOUNT'S OLD DRAFTS OF TYPED ANSWERS ARE NOT READ BACK to a phone whose backend keeps submissions: § */
  const subs = answersCan_('submitAnswer');
  Object.keys(got || {}).forEach(sk => {
    if (!/^(ans|pad):/.test(sk)) return;
    if (subs && /^ans:/.test(sk)) return;
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
    const pre = subs ? ['pad:' + who + ':'] : ['ans:' + who + ':', 'pad:' + who + ':'];
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

/* ---------- WHAT WAS WRITTEN SIGNED OUT, CLAIMED BY WHOEVER SIGNS IN FROM SIGNED OUT § */
function ansBareKeys_() {
  const all = new Set();
  try { for (let i = 0; i < localStorage.length; i++) all.add(localStorage.key(i)); }
  catch (e) { ANS_MEM.forEach((v, k) => all.add(k)); }
  if (typeof KEEP_UNKEPT !== 'undefined') KEEP_UNKEPT.forEach(k => all.add(k));
  return [...all].filter(k => k && /^(?:ans|pad|board):(?!u:)/.test(k));
}
function answersClaim_(pid, ownOnly) {
  const who = 'u:' + String(pid || '');
  if (who === 'u:') return [];
  const dirty = ansDirtySet_(who);
  const moved = [];
  ansBareKeys_().forEach(bare => {
    const board = ansIsBoard_(bare);
    const k = bare.replace(/^(ans|pad|board):/, '$1:' + who + ':');
    const may = ansMayMove_(bare, k);
    if (!may || ((ownOnly || board) && may !== 'own')) return;
    /* READ BEFORE THE REMOVAL BELOW TAKES THE MARK WITH THE ANSWER. */
    const mark = may === 'own' ? ansGoneOf_(bare) : null;
    const v = ansValue_(bare);
    const at = ansAt_(bare);
    const mine = ansValue_(k);
    const has = mine !== null && !!String(mine).trim() && mine !== '[]';
    /* GONE FROM UNDER THE SIGNED-OUT KEY WHATEVER HAPPENS NEXT — moved, joined, or the older of two. */
    ansLocalPut_(bare, null);
    ANS_AT_MEM.delete(bare);
    try { localStorage.removeItem('ansAt:' + bare); } catch (e) {}
    if (v === null || !String(v).trim() || v === '[]') return;
    const joined = mark && has ? ansJoin_(bare, mine, v, mark.words) : null;
    /* WHAT IS WRITTEN OVER IS THE ANSWER THE OLD CODE LEFT, until this person's one-time carry-over has run on this device — and that pass reads the box, so it was § */
    const over = () => { if (has && typeof subClaimOver_ === 'function') subClaimOver_(k, mine, ansAt_(k)); };
    if (joined !== null) {
      if (joined === mine) return;
      over();
      ansLocalPut_(k, joined);
      ansAtSet_(k, Date.now());
    } else {
      if (has && !(at && at > ansAt_(k))) return;
      over();
      ansLocalPut_(k, v);
      ansAtSet_(k, at || Date.now());
    }
    /* THE BOARD STAYS ON THE DEVICE (note 310): § */
    if (!board && ansSyncs_(k)) dirty.add(k);
    moved.push(k);
  });
  ansDirtyKeep_(who);
  if (moved.length) { ansRefresh_(moved); answersPush_(); }
  ansSavedPaint_();
  return moved;
}

/* ---------- AND WHAT IS ON THE SCREEN, CHANGED WHERE IT STANDS § */
function ansRefresh_(keys) {
  const want = new Set(keys);
  const has = k => want.has(k) && !ansHeld_(k);
  try {
    document.querySelectorAll('[data-do="qp-ans"][data-k], .qp-multi-val[data-k]').forEach(el => {
      const k = el.getAttribute('data-k');
      if (!has(k)) return;
      const v = typeof ansRead_ === 'function' ? ansRead_(k) : (ansValue_(k) || '');
      if (el.value === v) return;
      el.value = v;
      /* REDRAWN BY THE PAD'S OWN DRAWING (`kpRender_`), which knows a worded box from a maths one: § */
      if (el.classList.contains('kp-in') && typeof kpRender_ === 'function') kpRender_(el);
      if (el.classList.contains('qp-multi-val') && typeof multiFill_ === 'function') multiFill_(el);
      const card = el.closest('.qcard');
      [card && card.querySelector('.qp-mark[data-accept]'), card && card.querySelector('.qp-ai')].forEach(m => {
        if (!m) return;
        /* EXCEPT AN ESSAY'S KEPT AI MARK, which is said again against the words now on the sheet -- fresh if they are the ones it read, "before your changes" if not § */
        if (m.classList.contains('qp-essay') && m.classList.contains('qp-ai') && typeof aiKeptPaint_ === 'function' && aiKeptPaint_(m, el)) return;
        m.classList.remove('is-right', 'is-near');
        const out = m.querySelector('.qp-verdict');
        if (out) out.textContent = '';
      });
    });
    document.querySelectorAll('.qp-choices[data-k]').forEach(box => {
      if (has(box.getAttribute('data-k')) && typeof choiceRedraw_ === 'function') choiceRedraw_(box);
    });
    /* AN ORDERING'S ROW, drawn again from the store by `orderBox_` exactly as a tap does. */
    document.querySelectorAll('.qp-order[data-k]').forEach(box => {
      if (has(box.getAttribute('data-k')) && typeof orderRedraw_ === 'function') orderRedraw_(box, '');
    });
    document.querySelectorAll('.qpad[data-k]').forEach(pad => {
      const k = pad.getAttribute('data-k');
      if (has(k) && typeof padRepaint_ === 'function') padRepaint_(pad, padRead_(k));
    });
    /* `padFace_` WAS ASKED AGAIN HERE for every card with a `Draw` tile (337): § */
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

/* ---------- THE LINE UNDER THE BOX § */
function ansFirstName_() {
  try { return String((USER && (USER.name || USER.handle)) || '').trim().split(/\s+/)[0] || ''; }
  catch (e) { return ''; }
}
/* ON THE ACCOUNT, AS THIS DEVICE LAST WROTE IT — so a store refusing the device's copy loses nothing
   that a reload cannot bring back down. Asked by `keepAtRisk_` (data.js) before the browser is told to
   ask "Leave site?". */
function ansOnAccount_(k) {
  try {
    const who = ansWhoOf_(k);
    if (!who || who !== 'u:' + String(USER.personId)) return false;
    /* A TYPED, PICKED OR ORDERED ANSWER IS ON THE ACCOUNT ONLY AS IT WAS SENT (note 308). § */
    if (/^ans:/.test(k)) {
      /* AND SAID FROM THE DEVICE'S OWN RECORD OF THE PRESS, before the payload has said which backend it is
         (`ansSentHere_`, below) — a typed answer to a backend from before submissions is still a draft. */
      if (ansSentHere_(k)) return true;
      if (answersCan_('submitAnswer')) return false;
    }
    return answersCan_('saveAnswers') && ansAt_(k) > 0 && !ansDirtySet_(who).has(k);
  } catch (e) { return false; }
}
/* ---------- A PRESS THE SERVER HAS ANSWERED FOR IS ON THE ACCOUNT, WHATEVER THE PAYLOAD HAS SAID YET § */
function ansSentHere_(k) {
  try {
    const l = typeof subLatest_ === 'function' ? subLatest_(k) : null;
    return !!l && !l.q && !l.far && l.a === ansValue_(k);
  } catch (e) { return false; }
}
const ANS_NOT_KEPT = 'Not saved — this browser is not keeping it';
/* ---------- AN EMPTY BOX OVER AN ANSWER THAT IS STILL HERE § */
/* ---------- FOR AN HOUR, NOT UNTIL SOMEBODY SIGNS IN § */
const ANS_GONE_MS = 60 * 60 * 1000;
/* ---------- AND THE RECORD OF IT IS KEPT AS CAREFULLY AS THE WORK IT GUARDS § */
const ansRec_ = name => ansValue_(name);
function ansRecPut_(name, v) {
  if (typeof keepPut_ === 'function') { keepPut_(name, v, 'record'); return; }
  try { if (v === null) localStorage.removeItem(name); else localStorage.setItem(name, v); } catch (e) {}
}
function ansGone_() {
  try {
    const g = JSON.parse(ansRec_('familyGone') || 'null');
    return g && /^u:[^:]+$/.test(String(g.who || '')) && Date.now() - (Number(g.at) || 0) < ANS_GONE_MS ? String(g.who) : '';
  } catch (e) { return ''; }
}
function ansGoneSay_(k) {
  if (ansWhoOf_(k)) return '';
  const gone = ansGone_();
  if (!gone) return '';
  const theirs = ansValue_(ansLocalKey_(ansServerKey_(k), gone));
  return theirs !== null && String(theirs).trim() && theirs !== '[]'
    ? 'Signed out — sign in again and your answer is back' : '';
}
/* ---------- AND WHAT THEY TYPE SIGNED OUT MEANWHILE IS STILL THEIRS § */
/* THE WRITE AN UNDO IS MAKING, while it makes it: § */
let ANS_PUT_BACK = null;
function ansPutBack_(k, mark, write) {
  const before = ANS_PUT_BACK;
  ANS_PUT_BACK = ansMarkable_(k) ? { k: String(k), mark: ansGoneRead_(mark) } : null;
  try { write(); } finally { ANS_PUT_BACK = before; }
}
function ansGoneMark_(k, v, words, was) {
  if (!ansMarkable_(k)) return;
  try {
    const empty = v === null || v === undefined || !String(v).trim() || v === '[]';
    const back = ANS_PUT_BACK && ANS_PUT_BACK.k === k ? ANS_PUT_BACK : null;
    const gone = empty ? '' : ansGone_();
    const raw = ansRec_(ANS_GONE_KEYS);
    if (!raw && !gone && !(back && back.mark)) return;
    const map = JSON.parse(raw || '{}') || {};
    const had = ansGoneRead_(map[k]);
    let want = empty || !gone ? null : { who: gone, words: !!words };
    /* PUT BACK BY AN UNDO: whose it was when it was last this value, whoever's session is fresh now. */
    if (!empty && back) want = back.mark;
    else if (!empty && had && (!want || want.who !== had.who)
        && ansKeeps_(k, was === undefined ? ansValue_(k) : was, v)) want = had;
    if (want ? !!had && had.who === want.who && had.words === want.words : !had) return;
    if (want) map[k] = want; else delete map[k];
    /* AND WHAT NO LONGER NAMES AN ANSWER, while it is open anyway — ASKED OF `ansValue_`, which answers with the visit's copy of a key the store refused. § */
    Object.keys(map).forEach(x => { if (x !== k && ansValue_(x) === null) delete map[x]; });
    ansRecPut_(ANS_GONE_KEYS, Object.keys(map).length ? JSON.stringify(map) : null);
  } catch (e) {}
}
/* ---------- DOES A WRITE KEEP WHAT WAS THERE — an edit of it, or a new answer over it? (P7, above) § */
function ansKeeps_(k, was, v) {
  if (was === null || was === undefined || v === null || v === undefined) return false;
  if (ansIsPad_(k) || ansIsRing_(k) || ansIsBoard_(k)) {
    try {
      const a = JSON.parse(was), b = JSON.parse(v);
      if (Array.isArray(a) && Array.isArray(b)) {
        const old = new Set(a.map(x => JSON.stringify(x)));
        return b.some(x => old.has(JSON.stringify(x)));
      }
    } catch (e) {}
  }
  const a = String(was), b = String(v);
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  return 2 * (p + s) >= a.length;
}
/* ONE MARK, READ — `{ who, words }`, or null. A bare string is a mark from before marks said how the
   answer was typed. */
function ansGoneRead_(m) {
  if (!m) return null;
  if (typeof m === 'string') return { who: m, words: false };
  return typeof m === 'object' && m.who ? { who: String(m.who), words: !!m.words } : null;
}
function ansGoneOf_(bare) {
  try { return ansGoneRead_((JSON.parse(ansRec_(ANS_GONE_KEYS) || '{}') || {})[bare]); } catch (e) { return null; }
}
/* ---------- AND NEVER ON THE DEVICE WITHOUT ITS MARK § */
function keepWaits_(k) {
  if (typeof KEEP_UNKEPT === 'undefined' || !KEEP_UNKEPT.has(ANS_GONE_KEYS)) return false;
  /* ANYTHING A MARK CAN NAME — the board and the device's drafts as well as answers (`ansMarkable_`). */
  if (!ansMarkable_(k)) return false;
  const held = ansGoneOf_(k);
  if (!held) return false;
  /* NOT WHEN THE STORED MARKS SAY THE SAME ALREADY — the refused write was about some other answer. */
  let kept = null;
  try { kept = ansGoneRead_((JSON.parse(localStorage.getItem(ANS_GONE_KEYS) || '{}') || {})[k]); } catch (e) {}
  return !(kept && kept.who === held.who);
}
/* ---------- THE PEN'S AND THE RINGS' NOTE, FOR THE KEY IT IS UNDER § */
function padNoteSay_(k) {
  k = String(k || '');
  const v = ansValue_(k);
  const has = v !== null && !!String(v).trim() && v !== '[]';
  if (has && typeof KEEP_UNKEPT !== 'undefined' && KEEP_UNKEPT.has(k) && !ansOnAccount_(k)) return ANS_NOT_KEPT + '.';
  if (!/^(ans|pad):/.test(k)) return typeof PAD_HERE_ONLY === 'string' ? PAD_HERE_ONLY : 'Kept on this device only.';
  const gone = has ? '' : ansGoneSay_(k);
  return gone ? gone + '.' : padKeptSay_();
}
/* ---------- MAY THE SIGNED-OUT `bare` BECOME `k`'S — THE ONE QUESTION EVERY MOVE ASKS § */
const ANS_SWITCHED = 'familySwitched';
function ansSwitched_() {
  const v = String(ansRec_(ANS_SWITCHED) || '');
  return /^u:[^:]+$/.test(v) ? v : '';
}
function ansSwitchedIn_(pid) {
  try { ansRecPut_(ANS_SWITCHED, pid ? 'u:' + String(pid) : null); } catch (e) {}
}
function ansMayMove_(bare, k) {
  const m = ansGoneOf_(bare);
  const who = ansKeyWho_(k);
  if (m) return m.who === who ? 'own' : '';
  return who && who === ansSwitched_() ? '' : 'later';
}
/* ---------- TWO ANSWERS OF ONE PERSON'S, PUT TOGETHER WHERE THEY CAN BE ONE § */
function ansJoin_(bare, mine, v, words) {
  if (ansIsPad_(bare) || ansIsRing_(bare) || ansIsBoard_(bare)) {
    try {
      const a = JSON.parse(mine), b = JSON.parse(v);
      if (!Array.isArray(a) || !Array.isArray(b)) return null;
      const seen = new Set(a.map(x => JSON.stringify(x)));
      const add = b.filter(x => { const s = JSON.stringify(x); if (seen.has(s)) return false; seen.add(s); return true; });
      return add.length ? JSON.stringify(a.concat(add)) : mine;
    } catch (e) { return null; }
  }
  if (!words) return null;
  const add = String(v).trim();
  if (String(mine).indexOf(add) !== -1) return mine;
  return String(mine).replace(/\s+$/, '') + '\n\n' + add;
}
/* SAVING IS SILENT (368): the line speaks only when an answer is not, or cannot be, on the account -- "Saved to Ada's account" told a child what they knew */
const ANS_QUIET = /^(Saved to|Sent to|Saving|Sending|On this device until you send it)/;
function ansSavedSay_(k) {
  const say = ansSavedWords_(k);
  return ansQuiet_(say) ? '' : say;
}
function ansQuiet_(say) { return ANS_QUIET.test(String(say || '')); }
function ansSavedWords_(k) {
  k = String(k || '');
  const v = ansValue_(k);
  if (v === null || !String(v).trim() || v === '[]') return ansGoneSay_(k);
  const who = ansWhoOf_(k);
  /* REFUSED BY THE STORE AND NOT ON THE ACCOUNT EITHER — the one line that must never say "on this
     device", because it is on no device. `keepPut_` in data.js. */
  if (typeof KEEP_UNKEPT !== 'undefined' && KEEP_UNKEPT.has(k) && !ansOnAccount_(k)) return ANS_NOT_KEPT;
  if (!who) return 'On this device only — sign in to keep it';
  /* A CARD STILL ON THE SCREEN FROM BEFORE A SIGN-OUT names somebody, with nobody signed in: never theirs. */
  const own = !!(typeof USER === 'object' && USER && who === 'u:' + String(USER.personId));
  /* SENT, AND THE SERVER SAID SO — true before the payload lands as after (`ansSentHere_`, above). */
  if (/^ans:/.test(k) && own && ansSentHere_(k)) {
    const nm = ansFirstName_();
    return nm ? 'Sent to ' + nm + '’s account' : 'Sent to your account';
  }
  /* ---------- AND WHAT DEPENDS ON THE BACKEND WAITS FOR THE PAYLOAD THAT SAYS WHICH ONE IT IS § */
  if (own && typeof awaiting_ === 'function' && awaiting_()) return '';
  if (/^ans:/.test(k) && answersCan_('submitAnswer') && own) {
    const latest = typeof subLatest_ === 'function' ? subLatest_(k) : null;
    if (!latest || latest.a !== v) return 'On this device until you send it';
    if (latest.far) return 'On this device only \u2014 too long to send';
    if (latest.q) return 'Sending…';
    const nm = ansFirstName_();
    return nm ? 'Sent to ' + nm + '’s account' : 'Sent to your account';
  }
  if (!answersCan_('saveAnswers') || !own) return 'On this device only';
  if (ansAt_(k) === ANS_HERE_ONLY) return 'On this device only \u2014 too long for the account';
  if (ansDirtySet_(who).has(k) || !ansAt_(k)) return 'Saving…';
  const name = ansFirstName_();
  return name ? 'Saved to ' + name + '’s account' : 'Saved to your account';
}
function ansSavedPaint_() {
  /* AND THE PEN'S AND THE RINGS' NOTE, which a refused stroke or an ended session changes too. */
  try {
    document.querySelectorAll('[data-kept-k]').forEach(el => {
      const say = padNoteSay_(el.getAttribute('data-kept-k'));
      if (el.textContent !== say) el.textContent = say;
    });
  } catch (e) {}
  try {
    document.querySelectorAll('.qp-saved[data-k]').forEach(el => {
      const say = ansSavedSay_(el.getAttribute('data-k'));
      if (el.textContent !== say) el.textContent = say;
    });
  } catch (e) {}
}
/* THE SAME FACT FOR THE PEN AND THE RINGED WORDS, in the note they already carried. § */
function padKeptSay_() {
  if (!(typeof whoIs_ === 'function' && whoIs_())) return 'Kept on this device only — sign in to keep it.';
  if (!answersCan_('saveAnswers')) return 'Kept on this device only.';
  return '';
}

/* ---------- WHEN IT SENDS AT ONCE § */
document.addEventListener('focusout', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-ans"], [data-do="qp-multi"]');
  if (el) answersPush_(true);
});
/* TO A BACKEND FROM BEFORE `submitAnswer` ONLY, now: § */
document.addEventListener('click', e => {
  const t = e.target && e.target.closest && e.target.closest('[data-do="qp-check"], [data-do="qp-choose"], [data-do="qp-order-send"], [data-do="qp-ai"], [data-do="qp-send"]');
  if (t) answersPush_(true);
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { answersPush_(true, true); return; }
  /* BACK IN FRONT, AND IT HAS BEEN A WHILE: the computer may have written since. Once a minute at most. */
  if (document.visibilityState === 'visible' && Date.now() - ANS_PULL_AT > 60000) answersPull_(true);
});
window.addEventListener('pagehide', () => { answersPush_(true, true); });

/* ---------- AND AN ANSWER WRITTEN IN ANOTHER TAB IS THE ANSWER IN THIS ONE § */
window.addEventListener('storage', e => {
  const k = e && e.key;
  if (!k || !/^(ans|pad):/.test(k)) return;
  try {
    if (typeof KEEP_UNKEPT !== 'undefined') KEEP_UNKEPT.delete(k);
    ANS_MEM.delete(k);
    if (ansIsRing_(k) && typeof CIRC_HELD !== 'undefined') CIRC_HELD.delete(k);
    const v = e.newValue === null ? '' : String(e.newValue);
    document.querySelectorAll('[data-do="qp-ans"][data-k], .qp-multi-val[data-k]').forEach(el => {
      if (el.getAttribute('data-k') !== k || el.value === v) return;
      el.value = v;
      if (el.classList.contains('kp-in') && typeof kpRender_ === 'function') kpRender_(el);
      if (el.classList.contains('qp-multi-val') && typeof multiFill_ === 'function') multiFill_(el);
    });
    if (typeof KP_UNDO !== 'undefined' && KP_UNDO && typeof KP_UNDO.delete === 'function') KP_UNDO.delete(k);
    ansRefresh_([k]);
    ansSavedPaint_();
  } catch (err) {}
});

/* AND THE FIND COLUMN IS NOT REBUILT UNDER A CHILD WHO IS WRITING. § */
const findIs_ = id => (typeof finderOf_ === 'function' ? !!finderOf_(id) : id === 'stuff');
function findKeep_(id) {
  if (!findIs_(id)) return false;
  try {
    const host = document.getElementById('s-' + id);
    if (!host) return false;
    const a = document.activeElement;
    if (a && host.contains(a) && a.matches && a.matches('[data-do="qp-ans"], .kp-in, textarea, input')) return true;
    if (document.documentElement.classList.contains('kp-up')) return true;
    return typeof PAD_ST !== 'undefined' && !!PAD_ST;
  } catch (e) { return false; }
}
/* A VERDICT ON THE SCREEN. § */
function findVerdictShown_(id) {
  try {
    const host = document.getElementById('s-' + (id && findIs_(id) ? id : 'stuff'));
    return !!host && [].some.call(host.querySelectorAll('.qp-mark[data-accept] .qp-verdict, .qp-ai .qp-verdict'),
      el => !!String(el.textContent || '').trim());
  } catch (e) { return false; }
}
/* THE REDRAW IT HELD BACK, once nothing is held — a moment after leaving the box, so a tap that moved the focus from one box to the next (focusout, then focusin) § */
let FIND_KEPT_TIMER = 0;
document.addEventListener('focusout', () => {
  clearTimeout(FIND_KEPT_TIMER);
  FIND_KEPT_TIMER = setTimeout(() => {
    try {
      if (findIs_(AT) && STALE && STALE[AT] && !findKeep_(AT) && !findVerdictShown_(AT)) repaint();
    } catch (e) {}
  }, 400);
});

/* ---------- AND FORGOTTEN AT SIGN-OUT § */
function answersForget_() {
  ANS_PULLED = '';
  ANS_PULLING = null;
  ANS_PULL_AT = 0;
  clearTimeout(ANS_RETRY);
  ANS_BACKOFF = 0;
  /* AND THE NOTE OF A SESSION THE SERVER ENDED (`ansGoneSay_`): § */
  try { ansRecPut_('familyGone', null); } catch (e) {}
  /* AND WHO ARRIVED OVER SOMEBODY ELSE (`ansMayMove_`): the next arrival says again how it came. */
  try { ansRecPut_(ANS_SWITCHED, null); } catch (e) {}
}
