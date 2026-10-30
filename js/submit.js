/* @family. — submit.js EVERY ANSWER SENT IS AN EVENT, AND WHAT A CHILD SEES IS THE LATEST ONE. § */

/* THE SERVER'S CEILINGS, said again, because the phone must not send what will be refused for ever — `SUBMISSIONS_PER_POST` and `ANSWER_TEXT_MAX` in § */
const SUB_PER_POST = 25, SUB_ANSWER_MAX = 20000, SUB_TWICE_MS = 1000;
const SUB_LAST = new Map();   // who|key -> the last press made on this page, for the double-tap guard (508)
/* WHAT A `keepalive` REQUEST MAY CARRY — a browser refuses one over 64 KB (answers.js says the same). */
const SUB_KEEPALIVE_MAX = 60000;

/* ---------- THE KEYS § */
const subKeyOf_ = k => String(k || '').replace(/^ans:(?:u:[^:]+:)?/, '');
/* THE PRESS'S NAME: this device's clock and six random letters and digits — `SUBMISSION_ID` on the
   server, checked for that shape. */
const subId_ = () => Date.now() + '-' + (Math.random().toString(36).slice(2) + '000000').slice(0, 6);

/* ---------- THE LATEST PRESS PER QUESTION, ON THIS DEVICE § */
const SUB_MEM = new Map();
function subAll_(who) {
  const m = SUB_MEM.get(who);
  if (!who) return m ? m.map : (SUB_MEM.set('', { raw: '', map: {} }), SUB_MEM.get('').map);
  let raw = null;
  try { raw = localStorage.getItem('subLast:' + who); }
  catch (e) { return m ? m.map : (SUB_MEM.set(who, { raw: null, map: {} }), SUB_MEM.get(who).map); }
  if (m && m.raw === raw) return m.map;
  let map = {};
  try { map = JSON.parse(raw || '{}') || {}; } catch (e) { map = {}; }
  if (!map || typeof map !== 'object' || Array.isArray(map)) map = {};
  SUB_MEM.set(who, { raw: raw, map: map });
  return map;
}
/* TRUE WHEN THE STORE TOOK IT — `subMigrate_` marks itself done only then. */
function subAllKeep_(who, map) {
  const raw = JSON.stringify(map || {});
  SUB_MEM.set(who, { raw: raw, map: map || {} });
  if (!who) return true;
  try { localStorage.setItem('subLast:' + who, raw); return true; }
  catch (e) {
    /* A FULL STORE KEEPS THE OLD TEXT, and the next read would find it differing from this copy and parse the old one over the press just made. § */
    let held = null;
    try { held = localStorage.getItem('subLast:' + who); } catch (e2) { held = null; }
    SUB_MEM.set(who, { raw: held, map: map || {} });
    return false;
  }
}
/* THE LATEST PRESS FOR AN ANSWER KEY — only ever the person signed in now. A key that names somebody
   else is somebody else's drawer, and is never read out on this person's screen. */
function subLatest_(k) {
  k = String(k || '');
  if (!/^ans:/.test(k)) return null;
  const who = ansWhoOf_(k);
  if (who && !(typeof whoIs_ === 'function' && whoIs_() === who)) return null;
  const e = subAll_(who)[subKeyOf_(k)];
  return e && typeof e === 'object' && typeof e.a === 'string' ? e : null;
}

/* ---------- THE QUEUE: EVERY PRESS NOT YET ON THE ACCOUNT, IN ORDER § */
/* ---------- AND A QUEUE THE STORE REFUSED IS THE VISIT'S, READ FIRST (review of 10 Oct) § */
const SUBQ_MEM = new Map();
const subQKey_ = who => 'subQ:' + who;
function subQueue_(who) {
  const parse = raw => {
    try {
      const list = JSON.parse(raw || '[]');
      return Array.isArray(list) ? list.filter(e => e && typeof e === 'object' && e.id && e.key) : [];
    } catch (e) { return []; }
  };
  const held = typeof keepHeld_ === 'function' ? keepHeld_(subQKey_(who)) : undefined;
  if (held !== undefined) return parse(held);
  let raw = null;
  try { raw = localStorage.getItem(subQKey_(who)); } catch (e) { return (SUBQ_MEM.get(who) || []).slice(); }
  return parse(raw);
}
function subQueueKeep_(who, list) {
  SUBQ_MEM.set(who, list.slice());
  const raw = list.length ? JSON.stringify(list) : null;
  if (typeof keepPut_ === 'function') return keepPut_(subQKey_(who), raw);
  try { if (raw === null) localStorage.removeItem(subQKey_(who)); else localStorage.setItem(subQKey_(who), raw); return true; }
  catch (e) { return false; }
}
/* ---------- A PRESS MARKED "STILL TO GO" THAT THE QUEUE HAS NOT GOT WILL NEVER GO — SO IT IS QUEUED AGAIN § */
function subRequeue_(who) {
  const all = subAll_(who), queue = subQueue_(who);
  const ids = new Set(queue.map(e => e.id)), lost = [];
  Object.keys(all).forEach(key => {
    const e = all[key];
    if (!e || typeof e !== 'object' || !e.q || !e.id || ids.has(e.id) || typeof e.a !== 'string' || !e.a.trim()) return;
    const k = 'ans:' + who + ':' + key;
    const ev = { id: String(e.id), key: key, answer: e.a, verdict: String(e.v || ''), at: Number(e.at) || Date.now() };
    try { const l = typeof doneLabel_ === 'function' ? doneLabel_(k) : ''; if (l) ev.label = l; } catch (err) {}
    try { const w = typeof doneWords_ === 'function' ? doneWords_(k) : ''; if (w) ev.words = w; } catch (err) {}
    lost.push(ev);
  });
  if (lost.length) subQueueKeep_(who, queue.concat(lost));
  return new Set(lost.map(ev => ev.key));
}

/* ---------- RECORDING A PRESS § */
function subRecord_(k, answer, verdict, sound) {
  k = String(k || '');
  answer = answer === null || answer === undefined ? '' : String(answer);
  if (!/^ans:/.test(k) || !answer.trim() || !verdict) return null;
  const who = ansWhoOf_(k);
  /* NOBODY TO RECORD IT FOR -- a card still keyed to a person whose session has ended (Find is held while a child writes, so the box keeps its key). § */
  if (who && !(typeof whoIs_ === 'function' && whoIs_() === who)) {
    if (sound !== 'none') markPlay_(String(verdict), sound === 'late');
    return null;
  }
  const key = subKeyOf_(k);
  /* ONE PRESS, ONE SUBMISSION (508): the same answer and verdict again within a second is a double tap, not a second try. */
  const prev = SUB_LAST.get(who + '|' + key);
  if (prev && prev.e.a === answer && prev.e.v === String(verdict) && Date.now() - prev.t < SUB_TWICE_MS) return prev.e;
  const e = { a: answer, v: String(verdict), at: Date.now(), id: subId_() };
  SUB_LAST.set(who + '|' + key, { e: e, t: e.at });
  /* SIGNED IN WITH AN ID: the account's. Over the account's ceiling it stays here and says so. */
  const pid = who && typeof USER === 'object' && USER && USER.personId && who === 'u:' + String(USER.personId) ? String(USER.personId) : '';
  if (pid) {
    if (answer.length > SUB_ANSWER_MAX) e.far = 1;
    else {
      e.q = 1;
      /* `at` IS THE PRESS'S OWN MOMENT, and the server orders "latest" by it (`pressed_at`, clamped to its
         own clock) — not by when the request arrived, which the rollout's queue would scramble. */
      const ev = { id: e.id, key: key, answer: answer, verdict: e.v, at: e.at };
      try { const l = typeof doneLabel_ === 'function' ? doneLabel_(k) : ''; if (l) ev.label = l; } catch (err) {}
      try { const w = typeof doneWords_ === 'function' ? doneWords_(k) : ''; if (w) ev.words = w; } catch (err) {}
      const q = subQueue_(who);
      q.push(ev);
      subQueueKeep_(who, q);
    }
  }
  const all = subAll_(who);
  all[key] = e;
  subAllKeep_(who, all);
  subPaint_(k);
  /* AND YOUR RESULT TAG (463) is read again */
  if (typeof myResultNew_ === 'function') myResultNew_(k);
  /* PROGRESS COUNTS THESE PRESSES (435), so its column is drawn again before anybody next arrives. */
  if (typeof markStale_ === 'function' && typeof AT !== 'undefined' && AT !== 'account') markStale_('account');
  if (e.q) subPush_(true);
  /* LAST, AFTER EVERYTHING ELSE THE PRESS DOES, so a sound that cannot play costs nothing it was for. */
  if (sound !== 'none') markPlay_(e.v, sound === 'late');
  return e;
}

/* ---------- SENDING § */
let SUB_BUSY = null, SUB_AGAIN = false, SUB_RETRY = 0, SUB_BACKOFF = 0;
/* THE REQUEST. `personId` AS WELL AS THE TOKEN — the gate overwrites it with the token's person, and `check-post.js` asks that every handler reading one is sent § */
function subBody_(pid, items) {
  return { action: 'submitAnswer', personId: pid, items: items, sent: Date.now() };
}
/* WHAT THE SERVER SAID, LAID ON THIS DEVICE — the same for a send now and for Sign out's last one (`subDrain_`). § */
function subApply_(who, items, d) {
  if (!d || !d.success || !d.saved || typeof d.saved !== 'object') throw new Error((d && d.error) || 'not sent');
  const went = new Set(items.map(ev => ev.id));
  /* THE QUEUE READ AGAIN: a press made while this was on the wire is still to go. */
  subQueueKeep_(who, subQueue_(who).filter(ev => !went.has(ev.id)));
  const all = subAll_(who);
  items.forEach(ev => {
    const cur = all[ev.key];
    /* A LATER PRESS OF THE SAME QUESTION IS THE LATEST NOW, and is left as it is. */
    if (!cur || cur.id !== ev.id) return;
    const got = d.saved[ev.id];
    all[ev.key] = got ? { a: cur.a, v: cur.v, at: Number(got.at) || cur.at, id: ev.id }
                      : { a: cur.a, v: cur.v, at: cur.at, id: ev.id, far: 1 };
  });
  subAllKeep_(who, all);
}
function subPush_(now, keepalive) {
  if (!(typeof answersCan_ === 'function' && answersCan_('submitAnswer')) || typeof api !== 'function') return Promise.resolve(false);
  if (SUB_BUSY) { SUB_AGAIN = true; return SUB_BUSY; }
  const pid = String(USER.personId), who = 'u:' + pid;
  const queue = subQueue_(who);
  if (!queue.length) return Promise.resolve(true);
  const items = [];
  let size = 0;
  for (const ev of queue) {
    if (items.length >= SUB_PER_POST) break;
    const len = JSON.stringify(ev).length;
    if (keepalive && items.length && size + len > SUB_KEEPALIVE_MAX) break;
    size += len;
    items.push(ev);
  }
  const req = api(subBody_(pid, items), keepalive ? { keepalive: true } : undefined);
  SUB_BUSY = Promise.resolve(req)
    .then(d => {
      subApply_(who, items, d);
      clearTimeout(SUB_RETRY);
      SUB_BACKOFF = 0;
      return true;
    })
    .catch(() => {
      SUB_BACKOFF = Math.min(Math.max(5000, SUB_BACKOFF * 2), 300000);
      clearTimeout(SUB_RETRY);
      SUB_RETRY = setTimeout(() => subPush_(true), SUB_BACKOFF);
      return false;
    })
    .then(ok => {
      SUB_BUSY = null;
      subPaintAll_();
      const again = SUB_AGAIN;
      SUB_AGAIN = false;
      const same = !!USER && String(USER.personId) === pid;
      /* MORE THAN ONE REQUEST'S WORTH, or a press made while this one was out: once more, now. */
      if (ok && same && (again || subQueue_(who).length)) return subPush_(true, keepalive);
      return ok;
    });
  return SUB_BUSY;
}

/* ---------- AT SIGN-OUT, WHAT IS STILL QUEUED GOES UP ON THE TOKEN THAT IS ENDING (review of 10 Oct) § */
const SUB_DRAIN_ROUNDS = 4;
function subDrain_(pid, tok, can) {
  pid = String(pid || '');
  if (!pid || !tok || !can || typeof api !== 'function') return Promise.resolve(false);
  const who = 'u:' + pid, busy = SUB_BUSY;
  const round = n => {
    const queue = subQueue_(who);
    if (!queue.length) return Promise.resolve(true);
    if (n >= SUB_DRAIN_ROUNDS) return Promise.resolve(false);
    const items = queue.slice(0, SUB_PER_POST);
    return Promise.resolve(api(Object.assign(subBody_(pid, items), { token: tok })))
      .then(d => { subApply_(who, items, d); return round(n + 1); });
  };
  return Promise.resolve(busy).catch(() => {}).then(() => round(0)).catch(() => false);
}

/* ---------- WHAT THE ACCOUNT SAYS, LAID OVER THIS DEVICE § */
function subAdopt_() {
  try {
    if (typeof USER !== 'object' || !USER || !USER.personId) return;
    const pid = String(USER.personId), who = 'u:' + pid;
    const lost = subRequeue_(who);
    const s = typeof DATA === 'object' && DATA ? DATA.submissions : null;
    if (s && s.mine && typeof s.mine === 'object' && String(s.for || '') === pid) {
      const all = subAll_(who);
      const moved = [], filled = [];
      Object.keys(s.mine).forEach(key => {
        const g = s.mine[key];
        if (!g || typeof g !== 'object' || g.answer === undefined || g.answer === null) return;
        const at = Number(g.at) || 0, id = String(g.id || ''), answer = String(g.answer), verdict = String(g.verdict || '');
        /* AN EMPTY SUBMISSION IS NOBODY'S LATEST, AND NEVER EMPTIES A BOX. § */
        if (!answer.trim()) return;
        const cur = all[key];
        /* A PRESS STILL TO GO FROM HERE IS THE LATEST THERE IS — except one that was lost from the queue and has only just been put back (`subRequeue_`): § */
        if (cur && cur.q && !(lost.has(key) && at > Number(cur.at))) return;
        if (cur && id && cur.id === id) return;
        if (cur && Number(cur.at) >= at) return;
        all[key] = { a: answer, v: verdict, at: at, id: id };
        const k = 'ans:' + who + ':' + key;
        moved.push(k);
        /* THE BOX. A finger in it is never written over; an answer typed here after this press is a
           draft of this device's, and stays here until it is sent; anything else takes the account's. */
        if (typeof ansHeld_ === 'function' && ansHeld_(k)) return;
        const local = ansValue_(k);
        if (local === answer) return;
        /* A DRAFT IS WHAT WAS TYPED HERE AND NEVER SENT — not the answer this device's own last press sent, whatever its clock says: § */
        const sentHere = !!cur && local === cur.a;
        if (!sentHere && local !== null && String(local) !== '' && ansAt_(k) > at) return;
        ansLocalPut_(k, answer);
        ansAtSet_(k, at);
        filled.push(k);
      });
      if (moved.length) {
        subAllKeep_(who, all);
        if (filled.length && typeof ansRefresh_ === 'function') ansRefresh_(filled);
        moved.forEach(subBoxPaint_);
      }
    }
    subPaintAll_();
  } catch (e) {}
  try { subMigrate_(); } catch (e) {}
  subPush_(true);
}

/* ---------- WHAT WAS DONE BEFORE THE SWITCH, SENT ONCE, SO NO CHILD LOSES IT § */
const SUB_BEFORE = Date.UTC(2026, 9, 9);
/* ---------- WHAT A SIGN-IN'S CLAIM WROTE OVER, KEPT FOR THE CARRY-OVER THAT HAS NOT RUN § */
const subBeforeKey_ = who => 'subBefore:' + who;
function subBefore_(who) {
  let raw = typeof keepHeld_ === 'function' ? keepHeld_(subBeforeKey_(who)) : undefined;
  if (raw === undefined) { try { raw = localStorage.getItem(subBeforeKey_(who)); } catch (e) { raw = null; } }
  try { const m = JSON.parse(raw || '{}'); return m && typeof m === 'object' && !Array.isArray(m) ? m : {}; }
  catch (e) { return {}; }
}
function subClaimOver_(k, was, at) {
  k = String(k || '');
  const who = ansWhoOf_(k);
  if (!who || !/^ans:/.test(k) || was === null || was === undefined || !String(was).trim()) return;
  try { if (localStorage.getItem('subMigrated:' + who)) return; } catch (e) { return; }
  const held = subBefore_(who), key = subKeyOf_(k);
  if (held[key]) return;
  held[key] = { a: String(was), at: Number(at) || 0 };
  const raw = JSON.stringify(held);
  if (typeof keepPut_ === 'function') keepPut_(subBeforeKey_(who), raw, 'record');
  else { try { localStorage.setItem(subBeforeKey_(who), raw); } catch (e) {} }
}
function subMigrateId_(pid, key) {
  /* TWO 32-BIT FNV-1a PASSES IN BASE 36 — `SUBMISSION_ID`'s shape, `<digits>-<letters and digits>`, with an
     `m` that says on the sheet which rows this wrote. The digits are the day of the switch, not a clock. */
  const h = seed => {
    let x = seed >>> 0;
    const t = String(pid) + '\u0001' + String(key);
    for (let i = 0; i < t.length; i++) { x ^= t.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; }
    return (x >>> 0).toString(36).padStart(7, '0');
  };
  return SUB_BEFORE + '-m' + h(2166136261) + h(3735928559);
}
function subMigrateMark_(x, v, slot) {
  if (slot) return { a: v, v: 'sent' };
  if (orderIs_(x)) {
    const said = orderSay_(orderSeq_(v, x.choices.length));
    if (!said) return null;
    const ways = orderWays_(x);
    if (!ways.length) return { a: said, v: 'sent' };
    const r = markOrder_(said, ways);
    return r === null ? null : { a: said, v: r ? 'right' : 'wrong' };
  }
  if (Array.isArray(x.choices) && x.choices.length >= 2) {
    const right = (x.choiceRight || []).slice().sort((p, q) => p - q);
    const picked = String(v).split(',').map(t => parseInt(t, 10)).filter(n => n > 0);
    if (!picked.length || picked.length < Math.max(1, right.length)) return null;
    const said = picked.join(',');
    if (!right.length) return { a: said, v: 'sent' };
    return { a: said, v: picked.slice().sort((p, q) => p - q).join(',') === right.join(',') ? 'right' : 'wrong' };
  }
  const accept = String(x.accept || '').trim();
  if (!accept) return { a: v, v: 'sent' };
  const m = markAnswer_(v, accept);
  return m === null ? null : { a: v, v: m ? 'right' : 'wrong' };
}
function subMigrate_() {
  if (typeof USER !== 'object' || !USER || !USER.personId) return;
  const pid = String(USER.personId), who = 'u:' + pid;
  if (!(typeof whoIs_ === 'function' && whoIs_() === who)) return;
  const flag = 'subMigrated:' + who;
  /* A BROWSER THAT KEEPS NOTHING KEPT NO `done:` DATE AND NO ANSWER PAST THE VISIT, and could hold no flag:
     nothing to carry, and nothing to stop the pass running on every load. */
  try { if (localStorage.getItem(flag)) return; } catch (e) { return; }
  /* THE ACCOUNT'S OWN, so a question it already has a submission for is left alone — and a backend that
     keeps submissions but has not sent this person's copy yet is waited for. */
  let mine = {};
  if (answersCan_('submitAnswer')) {
    const s = DATA && DATA.submissions;
    if (!s || String(s.for || '') !== pid || !s.mine || typeof s.mine !== 'object') return;
    mine = s.mine;
  }
  const items = typeof stuffItemsAll_ === 'function' ? stuffItemsAll_() : [];
  if (!items.some(it => it && it.kind === 'question')) return;
  /* WHAT WAS DONE, AND WHEN — the device's dates, and the old backend's rows of this person. */
  const done = {};
  const pre = 'done:' + who + ':';
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(pre) === 0) done[k.slice(pre.length)] = String(localStorage.getItem(k) || '');
    }
  } catch (e) {}
  try {
    const a = DATA && DATA.attempts;
    if (a && a.mine && typeof a.mine === 'object' && String(a.for || '') === pid) {
      Object.keys(a.mine).forEach(q => { if (!(q in done)) done[q] = String((a.mine[q] && a.mine[q].last) || ''); });
    }
  } catch (e) {}
  const index = new Map();
  items.forEach(it => { if (it) index.set(ansKey_(it), it); });
  const all = subAll_(who), queue = subQueue_(who), made = [];
  const before = subBefore_(who);
  const dayMs = (d, h) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d); return m ? new Date(+m[1], +m[2] - 1, +m[3], h).getTime() : 0; };
  Object.keys(done).forEach(key => {
    if (!key || mine[key] || all[key]) return;
    const k = 'ans:' + who + ':' + key;
    /* WHAT THE CLAIM WROTE OVER, IF IT DID, rather than the claimed draft now in the box (see above). */
    const kept = before[key] && typeof before[key] === 'object' && typeof before[key].a === 'string' ? before[key] : null;
    const v = kept ? kept.a : ansValue_(k);
    if (v === null || !String(v).trim()) return;
    const now = Date.now();
    let at = kept ? Number(kept.at) || 0 : Number(ansAt_(k)) || 0;
    /* EDITED AFTER THE END OF ITS DONE DAY: written since the switch, a draft nobody pressed (see above).
       Midnight after the day, by this device's clock, as `doneMark_` dated it. */
    const end = dayMs(done[key], 24);
    if (end && at >= end && at <= now) return;
    const slot = /#[^#]*$/.test(key);
    const x = index.get(slot ? k.replace(/#[^#]*$/, '') : k);
    if (!x) return;
    const m = subMigrateMark_(x, String(v), slot);
    if (!m || !String(m.a).trim()) return;
    if (!(at > 0 && at <= now)) at = dayMs(done[key], 12) || SUB_BEFORE;
    const e = { a: m.a, v: m.v, at: Math.min(at, now), id: subMigrateId_(pid, key) };
    if (m.a.length > SUB_ANSWER_MAX) e.far = 1;
    else {
      e.q = 1;
      const ev = { id: e.id, key: key, answer: m.a, verdict: m.v, at: e.at };
      try { const l = doneLabel_(k, index); if (l) ev.label = l; } catch (err) {}
      try { const w = doneWords_(k, index); if (w) ev.words = w; } catch (err) {}
      queue.push(ev);
    }
    all[key] = e;
    made.push(k);
  });
  /* DONE ONLY WHEN WHAT IT MADE IS KEPT. § */
  let stored = true;
  if (made.length) {
    const q = subQueueKeep_(who, queue), l = subAllKeep_(who, all);
    stored = q && l;
    made.forEach(subBoxPaint_);
    subPaintAll_();
  }
  if (!stored) return;
  try { localStorage.setItem(flag, String(Date.now())); } catch (e) {}
  /* AND WHAT THE CLAIM WROTE OVER IS NOBODY'S BUSINESS ANY MORE. */
  if (typeof keepPut_ === 'function') keepPut_(subBeforeKey_(who), null, 'record');
  else { try { localStorage.removeItem(subBeforeKey_(who)); } catch (e) {} }
}

/* ---------- THE WORDS FOR A VERDICT § */
/* `ai:2/3` MARKED BY THE AI, `rule:2/3` BY THE QUESTION'S KEY WORDS (359) -- which way is kept with the marks. */
function subAiOf_(v) {
  const m = /^(ai|rule):(\d{1,3})\/(\d{1,3})$/.exec(String(v || ''));
  return m ? { got: +m[2], of: +m[3], by: m[1] } : null;
}
function subSay_(v) {
  if (v === 'right') return { text: 'Correct', cls: 'is-right' };
  if (v === 'wrong') return { text: 'Not yet — have another go', cls: 'is-near' };
  if (v === 'sent') return { text: 'Sent', cls: '' };
  const ai = subAiOf_(v);
  if (ai) return { text: ai.got + ' of ' + ai.of + ' mark' + (ai.of === 1 ? '' : 's') + (ai.by === 'rule' ? ' · by key words' : ' · AI'), cls: ai.got >= ai.of ? 'is-right' : 'is-near' };
  return { text: '', cls: '' };
}

/* ---------- THE VERDICT, HEARD § */
/* NO SWITCH (374, the owner: "it should just play sound, no option to get rid of"): the tab's mute and the device's volume are the way to quiet it; the old device setting is forgotten */
try { localStorage.removeItem('mark-sound'); } catch (e) { /* nothing kept */ }
/* WHETHER THIS DEVICE CAN MAKE A SOUND AT ALL. § */
function markCanSound_() {
  try { return !!(window.AudioContext || window.webkitAudioContext); } catch (e) { return false; }
}
function markKind_(v) {
  if (v === 'right') return 'right';
  if (v === 'wrong') return 'wrong';
  const ai = subAiOf_(v);
  if (!ai || ai.of < 1) return '';
  return ai.got >= ai.of ? 'right' : ai.got === 0 ? 'wrong' : '';
}

/* ---------- THE TWO SOUNDS, AS NOTES ON A CLOCK § */
const MARK_CHIME = [{ f: 783.99, at: 0, len: 0.16 }, { f: 1046.5, at: 0.09, len: 0.23 }];
const MARK_CHIME_PEAK = 0.03, MARK_BUZZ_PEAK = 0.06, MARK_BUZZ_LEN = 0.4;
const MARK_BUZZ = [['sawtooth', 164.81], ['square', 174.61]], MARK_BUZZ_LP = 1600;
function markTone_(ac, t0, kind, out) {
  if (kind === 'right') {
    let end = t0;
    MARK_CHIME.forEach(n => {
      const a = t0 + n.at, z = a + n.len;
      const g = ac.createGain();
      g.gain.setValueAtTime(0, a);
      g.gain.linearRampToValueAtTime(MARK_CHIME_PEAK, a + 0.012);
      g.gain.exponentialRampToValueAtTime(MARK_CHIME_PEAK / 1000, z - 0.01);
      g.gain.linearRampToValueAtTime(0, z);
      g.connect(out);
      [[n.f, 1], [n.f * 2, 1 / 3]].forEach(([f, lvl]) => {
        const o = ac.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, a);
        let to = g;
        if (lvl !== 1) { to = ac.createGain(); to.gain.setValueAtTime(lvl, a); to.connect(g); }
        o.connect(to);
        o.start(a);
        o.stop(z + 0.02);
      });
      end = Math.max(end, z);
    });
    return end;
  }
  const z = t0 + MARK_BUZZ_LEN;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(MARK_BUZZ_LP, t0);
  lp.Q.setValueAtTime(0.7, t0);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(MARK_BUZZ_PEAK, t0 + 0.025);
  g.gain.setValueAtTime(MARK_BUZZ_PEAK, z - 0.09);
  g.gain.linearRampToValueAtTime(0, z);
  lp.connect(g);
  g.connect(out);
  MARK_BUZZ.forEach(([type, f]) => {
    const o = ac.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    const half = ac.createGain();
    half.gain.setValueAtTime(0.5, t0);
    o.connect(half);
    half.connect(lp);
    o.start(t0);
    o.stop(z + 0.02);
  });
  return z;
}

/* ---------- THE CONTEXT, WOKEN AT THE PRESS § */
let MARK_AC = null;
function markHear_() {
  if (!markCanSound_()) return null;
  try {
    if (!MARK_AC) MARK_AC = new (window.AudioContext || window.webkitAudioContext)();
    markRest_(-1);
    if (MARK_AC.state !== 'running') {
      const p = MARK_AC.resume();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    return MARK_AC;
  } catch (e) { return null; }
}
/* ---------- AND PUT TO REST WHEN NOTHING IS PLAYING § */
const MARK_REST_MS = 1000;
let MARK_REST = 0, MARK_HOLD = 0;
function markRest_(ms) {
  clearTimeout(MARK_REST);
  MARK_REST = 0;
  if (ms < 0 || !MARK_AC) return;
  const rest = () => {
    MARK_REST = 0;
    if (MARK_HOLD > 0 || !MARK_AC) return;
    try { const p = MARK_AC.suspend(); if (p && typeof p.catch === 'function') p.catch(() => {}); } catch (e) {}
  };
  if (ms === 0) rest(); else MARK_REST = setTimeout(rest, ms);
}
/* MARK WITH AI'S PRESS: § */
function markWait_() {
  if (!markHear_()) return () => {};
  MARK_HOLD++;
  let held = true;
  return () => {
    if (!held) return;
    held = false;
    MARK_HOLD = Math.max(0, MARK_HOLD - 1);
    markRest_(MARK_REST_MS);
  };
}
/* ---------- WHETHER THE CHILD IS STILL AT THE CARD, SO A LATE VERDICT KNOWS WHETHER TO BE HEARD § */
function markWhere_(k) {
  try {
    if (!k || document.visibilityState === 'hidden') return false;
    const host = document.getElementById('s-' + AT);
    const pg = host && host.querySelector(':scope > .page.on');
    return !!pg && [...pg.querySelectorAll('.qp-ans-in[data-k], .qp-multi-val[data-k]')].some(el => el.getAttribute('data-k') === k);
  } catch (e) { return false; }
}

/* ---------- AND PLAYED § */
const MARK_LATE_MS = 600;
let MARK_NOW = null;
function markHush_() {
  const n = MARK_NOW;
  MARK_NOW = null;
  if (!n) return;
  try {
    const t = n.ac.currentTime;
    if (t < n.end) {
      n.out.gain.cancelScheduledValues(t);
      n.out.gain.setValueAtTime(1, t);
      n.out.gain.linearRampToValueAtTime(0, t + 0.015);
    }
    setTimeout(() => { try { n.out.disconnect(); } catch (e) {} }, 60);
  } catch (e) {}
}
function markPlay_(v, late) {
  const kind = markKind_(v);
  if (!kind) return;
  const ac = late ? MARK_AC : markHear_();
  if (!ac) return;
  const asked = Date.now();
  const go = () => {
    try {
      /* TOO LATE TO PLAY: nothing will, so the context woken for it is put to rest as after a sound. */
      if (ac.state !== 'running' || Date.now() - asked > MARK_LATE_MS) { if (ac.state === 'running') markRest_(MARK_REST_MS); return; }
      markHush_();
      const out = ac.createGain();
      out.gain.setValueAtTime(1, ac.currentTime);
      out.connect(ac.destination);
      const end = markTone_(ac, ac.currentTime + 0.02, kind, out);
      MARK_NOW = { ac: ac, out: out, end: end };
      markRest_(Math.max(0, end - ac.currentTime) * 1000 + MARK_REST_MS);
    } catch (e) {}
  };
  if (ac.state === 'running') { go(); return; }
  try {
    const p = ac.resume();
    if (p && typeof p.then === 'function') p.then(go, () => {});
  } catch (e) {}
}
/* AN APP OUT OF SIGHT KEEPS NO AUDIO RUNNING, a wait for Mark with AI or not: the next press wakes it
   (`markHear_`), and a verdict landing while hidden is not heard anyway (`markWhere_`). */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'hidden' || !MARK_AC) return;
  markRest_(-1);
  try { const p = MARK_AC.suspend(); if (p && typeof p.catch === 'function') p.catch(() => {}); } catch (e) {}
});

/* ---------- PAINTED WHERE IT STANDS § */
function subPaint_(k) {
  if (typeof ansSavedPaint_ === 'function') ansSavedPaint_();
}
function subPaintAll_() {
  if (typeof ansSavedPaint_ === 'function') ansSavedPaint_();
}
/* A BOX'S VERDICT LINE, FROM THE STORE: § */
function subVerdictPaint_(mark, inp) {
  if (!mark || !inp || mark.classList.contains('is-busy')) return;
  const out = mark.querySelector('.qp-verdict');
  if (!out) return;
  const k = inp.getAttribute('data-k');
  const latest = subLatest_(k);
  const say = latest && latest.a === inp.value ? subSay_(latest.v) : { text: '', cls: '' };
  /* AN ESSAY'S MARK KEPT ON THIS DEVICE (`aiKeptView_`, keypad.js, note 312) is drawn instead — with its points, fresh or "before your changes" — when it is about § */
  if (mark.classList.contains('qp-essay') && mark.classList.contains('qp-ai') && typeof aiKeptView_ === 'function') {
    const view = aiKeptView_(k, inp.value);
    if (view && (view.fresh || !say.text) && typeof aiKeptPaint_ === 'function') { aiKeptPaint_(mark, inp); return; }
    const why = mark.nextElementSibling;
    if (why && why.classList.contains('qp-ai-why') && why.textContent) why.textContent = '';
    mark.classList.remove('is-stale');
  }
  /* AI MARKING SWITCHED OFF says so on this line (`aiOff_`), and keeps saying it until there is something else to say — but ONLY WHILE THE LINE STILL SAYS IT. § */
  if (!say.text && mark.classList.contains('is-off') && out.textContent && out.textContent === mark.getAttribute('data-off-said')) return;
  mark.classList.remove('is-right', 'is-near');
  if (say.cls) mark.classList.add(say.cls);
  if (out.textContent !== say.text) out.textContent = say.text;
}
function subBoxPaint_(k) {
  try {
    document.querySelectorAll('.qp-ans-in[data-k], .qp-multi-val[data-k]').forEach(inp => {
      if (inp.getAttribute('data-k') === k) subVerdictPaint_(inp.closest('.qp-mark'), inp);
    });
    document.querySelectorAll('.qp-order[data-k]').forEach(box => {
      if (box.getAttribute('data-k') === k && typeof orderRedraw_ === 'function') orderRedraw_(box, '');
    });
  } catch (e) {}
}

/* ---------- AS THE APP GOES AWAY, WHATEVER IS WAITING GOES WITH `keepalive` § */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') subPush_(true, true);
});
window.addEventListener('pagehide', () => { subPush_(true, true); });

/* ---------- AND FORGOTTEN AT SIGN-OUT § */
function subForget_() {
  SUB_MEM.clear();
  SUBQ_MEM.clear();
  clearTimeout(SUB_RETRY);
  SUB_BACKOFF = 0;
  SUB_AGAIN = false;
}

/* ---------- SUGGEST A CHANGE (494): one tile on every thing, one box in place ----------
   An admin's goes to Notes for Claude; anybody else's waits for Confirm. A message's says "Tell the admin" (413). */
const SUGGEST_NOTE_MAX = 1000;
const suggestPeople_ = kind => kind === 'message' || kind === 'post';
/* A RULE (496): `tell-admin` — the words only; the quiet safeguarding path stays either way. */
const suggestTell_ = kind => suggestPeople_(kind) && (typeof ruleOn_ !== 'function' || ruleOn_('tell-admin'));
/* WHAT HAS AN OPEN NOTE FOR CLAUDE, by `kind|id` — sent to everybody as `reportedItems`, no names in it. */
const reportedNow_ = (kind, id) => ((typeof DATA !== 'undefined' && DATA && DATA.reportedItems) || []).indexOf(kind + '|' + id) !== -1;

/* THE ONE TILE, on every thing: Student rank and up; signed out it is not drawn. `check-suggest` holds every such tile to it. */
function suggestTile_(kind, id, label, cls) {
  if (!kind || !id || typeof rankAtLeast_ !== 'function' || !rankAtLeast_('student')) return '';
  return tile_({ icon: 'suggest', label: suggestTell_(kind) ? 'Tell the admin' : 'Suggest a change', note: reportedNow_(kind, id) ? 'to change' : '',
                 act: 'rep-box', cls: 'rep-tile' + (cls ? ' ' + cls : ''), data: { rk: kind, ri: id, rl: String(label || '').slice(0, 120) } });
}
/* A CARD WITH NO TILE ROW OF ITS OWN takes the tile in one of its own, put inside the card by `cardRowIn_`. */
function suggestRowIn_(html, kind, id, label) {
  const t = suggestTile_(kind, id, label);
  return t && typeof cardRowIn_ === 'function' ? cardRowIn_(html, `<div class="tile-row rep-row">${t}</div>`) : html;
}
/* A FIND CARD'S KIND AND ID: a question by its key (`q:…`), and so every card in both finders. */
function suggestTileFor_(x) {
  if (!x || !x.key) return '';
  return suggestTile_(x.kind, x.key, [x.name, x.sub].filter(Boolean).join(' · '));
}

/* WHAT KIND OF SCREEN IT WAS SEEN ON — enough for the owner to try it on the same, and nothing that names a device. */
function reportDevice_() {
  try {
    /* `screen` IS shell.js's column maker in this scope, so the window's size, not the display's. */
    const w = Math.min(innerWidth, innerHeight);
    const touch = matchMedia('(pointer: coarse)').matches;
    return !touch ? 'computer' : w < 600 ? 'phone' : 'tablet';
  } catch (e) { return ''; }
}

/* IN PLACE OF THE THING (489, `boxInPlace_`): one text area, a picture, Send and Cancel. No notes listed (498): Done is Claude's, by data/notes-done.json. */
function reportBoxHtml_(kind, id, label, finder, path) {
  const admin = typeof rankAtLeast_ === 'function' && rankAtLeast_('admin');
  const dk = kind + '|' + id, people = suggestPeople_(kind), files = admin && !people;
  return `<div class="me-form rep-form rep-box" data-rk="${esc(kind)}" data-ri="${esc(id)}" data-rl="${esc(label)}" data-finder="${esc(finder || '')}" data-path="${esc(path || '')}">
    ${label ? `<p class="faint rep-what">${esc(label)}</p>` : ''}
    ${path ? `<p class="faint rep-path">Path: ${esc(path)}</p>` : ''}
    <textarea class="rep-note-in" rows="3" maxlength="${SUGGEST_NOTE_MAX}" autocomplete="off"
      placeholder="${people ? 'What is wrong? (you can leave this empty)' : 'What should change here?'}" aria-label="${suggestTell_(kind) ? 'Tell the admin' : 'Suggest a change'}"${draftAttr_('rep', dk)}>${esc(draftVal_('rep', dk))}</textarea>
    <input type="file" accept="image/*" class="rep-pic-in" hidden aria-hidden="true" tabindex="-1">
    <img class="rep-pic-show" alt="The picture going with it" hidden>${files ? `
    <input type="file" multiple accept="${REP_FILE_ACCEPT}" class="rep-files-in" hidden aria-hidden="true" tabindex="-1">
    <input type="file" multiple webkitdirectory directory class="rep-dir-in" hidden aria-hidden="true" tabindex="-1">
    <ol class="faint rep-file-list" hidden></ol><p class="faint rep-file-total" aria-live="polite" hidden></p>
    ${repNoDir_() ? '<p class="faint rep-no-dir">On iPhone, Safari cannot choose a folder: use Add files and pick several at once.</p>' : ''}` : ''}
    <div class="tile-row">${tile_({ icon: 'send', label: 'Send', note: admin ? 'to Claude' : 'to the admin', act: 'rep-send', cls: 'rep-send is-submit' })}${
      people ? '' : tile_({ icon: 'photo', label: 'Add a picture', note: 'camera or library', act: 'rep-pic', cls: 'rep-pic' })}${
      files ? tile_({ icon: 'doc', label: 'Add files', note: 'PDFs, pictures, docx, zip', act: 'rep-files', cls: 'rep-files-t' }) : ''}${
      files && !repNoDir_() ? tile_({ icon: 'plus', label: 'Add a folder', note: 'keeps its subfolders', act: 'rep-dir', cls: 'rep-dir-t' }) : ''}${
      tile_({ icon: 'close', label: 'Cancel', act: 'rep-cancel' })}</div>
    <p class="faint me-said rep-said" aria-live="polite">${admin
      ? 'Yours goes straight to Notes for Claude.'
      : people ? 'Only the admin sees this, and they are told at once.' : 'The admin reads it first; nothing changes until they do.'}</p>
  </div>`;
}
/* THE FUNNEL PATH (498): a suggestion made on Find or Find 2 says which answers and words led there, e.g. "Learning › Library › History". */
function reportPath_(el) {
  try {
    const sc = el && el.closest ? el.closest('.screen') : null;
    const F = sc && typeof finderOf_ === 'function' ? finderOf_(String(sc.id).replace(/^s-/, '')) : null;
    if (!F) return '';
    return inFinder_(F, () => {
      const steps = (STUFF.filters || []).map(f => f.any ? 'any ' + f.field : String(f.value || '')).filter(Boolean);
      if (STUFF.q) steps.push('words "' + String(STUFF.q).trim().slice(0, 60) + '"');
      return (F.id === 'res' ? 'Find 2' : 'Find') + (steps.length ? ' › ' + steps.join(' › ') : '');
    });
  } catch (e) { return ''; }
}
/* A PICTURE, SHRUNK ON THE PHONE (498): the long side down to 1280px, then the JPEG quality down until it is under about 300 KB. */
const REP_PIC_MAX = 300 * 1024, REP_PIC_SIDE = 1280;
/* THE SHRUNK PICTURE, by its box: a data URL is too long for an attribute. */
const REP_PIC = new WeakMap();
function reportPicShrink_(file) {
  return new Promise((ok, no) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); no(new Error('That is not a picture this phone can read.')); };
    img.onload = () => {
      URL.revokeObjectURL(url);
      let side = REP_PIC_SIDE, out = '';
      for (let tries = 0; tries < 6; tries++) {
        const k = Math.min(1, side / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        for (const q of [0.8, 0.65, 0.5]) { out = c.toDataURL('image/jpeg', q); if (out.length * 0.75 <= REP_PIC_MAX) return ok(out); }
        side = Math.round(side * 0.7);
      }
      ok(out);
    };
    img.src = url;
  });
}
on('rep-pic', el => { const f = el.closest('.rep-box'); const i = f && f.querySelector('.rep-pic-in'); if (i) i.click(); });
document.addEventListener('change', e => {
  const i = e.target;
  if (!i || !i.classList || !i.classList.contains('rep-pic-in')) return;
  const form = i.closest('.rep-box'), file = i.files && i.files[0];
  if (!form || !file) return;
  const said = form.querySelector('.rep-said'), show = form.querySelector('.rep-pic-show');
  reportPicShrink_(file).then(data => {
    REP_PIC.set(form, data);
    if (show) { show.src = data; show.hidden = false; }
    const t = form.querySelector('.rep-pic');
    if (t) tileSet_(t, { icon: 'photo', label: 'Change the picture', on: true });
  }).catch(err => { if (said) said.textContent = String((err && err.message) || 'That picture could not be read.'); });
});
/* ---------- FILES AND FOLDERS FOR CLAUDE (515), the admin's alone: each file sent in parts to Drive "Claude inbox", one at a time, then the note names them. */
const REP_FILE_ACCEPT = '.pdf,application/pdf,image/*,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.zip,application/zip';
/* 8 MiB a part, a multiple of Drive's 256 KiB, about 11 MB once base64 — well under Apps Script's 50 MB a request. */
const REP_PART = 8 * 1048576, REP_FILE_MAX = 500 * 1048576, REP_TRIES = 3;
/* IPHONE AND IPAD SAFARI CANNOT PICK A FOLDER (the input opens as plain files), so the tile is not drawn and the box says so. */
const repNoDir_ = () => { try { return /iP(hone|ad|od)/.test(navigator.userAgent || '') || !('webkitdirectory' in window.HTMLInputElement.prototype); } catch (e) { return true; } };
/* THE CHOSEN FILES, by box: [{ file, rel, state: 'wait'|'sending'|'done'|'failed', sent }]. */
const REP_FILES = new WeakMap();
const repMb_ = n => (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB';
function repFilesDraw_(form) {
  const list = REP_FILES.get(form) || [], ol = form.querySelector('.rep-file-list'), tot = form.querySelector('.rep-file-total');
  if (!ol || !tot) return;
  ol.hidden = tot.hidden = !list.length;
  ol.innerHTML = list.slice(0, 50).map(x => `<li class="rep-file is-${x.state}">${esc(x.rel)} · ${
    x.state === 'done' ? 'sent' : x.state === 'failed' ? 'failed — Send tries it again' : x.state === 'sending' ? Math.floor(100 * x.sent / Math.max(1, x.file.size)) + '%' : repMb_(x.file.size)}</li>`).join('')
    + (list.length > 50 ? `<li>… and ${list.length - 50} more</li>` : '');
  const all = list.reduce((a, x) => a + x.file.size, 0), sent = list.reduce((a, x) => a + (x.state === 'done' ? x.file.size : x.sent || 0), 0);
  const done = list.filter(x => x.state === 'done').length;
  tot.textContent = `${done} of ${list.length} file${list.length === 1 ? '' : 's'} sent · ${repMb_(sent)} of ${repMb_(all)}`;
}
/* THE BATCH'S FOLDER NAME: the chosen folder's own name, else "Files" and the minute, so loose files never mix with an earlier batch. */
function repBatch_(list) {
  const top = list.map(x => x.rel.split('/')[0]);
  if (list.length && list.every(x => x.rel.indexOf('/') > 0) && top.every(t => t === top[0])) return { batch: top[0], strip: true };
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return { batch: `Files ${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}${p(d.getMinutes())}`, strip: false };
}
const repB64_ = blob => new Promise((ok, no) => {
  const r = new FileReader();
  r.onload = () => ok(String(r.result || '').replace(/^data:[^,]*,/, ''));
  r.onerror = () => no(new Error('That file could not be read.'));
  r.readAsDataURL(blob);
});
/* ONE FILE, PART BY PART; a failed part starts the file again (a fresh Drive session), up to REP_TRIES times. */
async function repSendFile_(form, x, b) {
  const rel = b.strip ? x.rel.split('/').slice(1).join('/') : x.rel.split('/').pop();
  for (let tries = 0; tries < REP_TRIES; tries++) {
    const upload = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    x.state = 'sending'; x.sent = 0; repFilesDraw_(form);
    try {
      let start = 0;
      do {
        const part = x.file.slice(start, start + REP_PART);
        const d = await api({ action: 'suggestUpload', personId: USER.personId || '', batch: b.batch, rel, upload,
          size: x.file.size, start, mime: x.file.type || '', data: await repB64_(part) });
        if (!d || d.error) throw new Error((d && d.error) || 'That part did not go.');
        start += part.size; x.sent = start; repFilesDraw_(form);
      } while (start < x.file.size);
      x.state = 'done'; repFilesDraw_(form);
      return true;
    } catch (e) { x.error = String((e && e.message) || e); }
  }
  x.state = 'failed'; repFilesDraw_(form);
  return false;
}
function repFilesAdd_(form, files, dir) {
  const said = form.querySelector('.rep-said'), list = REP_FILES.get(form) || [], big = [];
  [...(files || [])].forEach(f => {
    const rel = String((dir && f.webkitRelativePath) || f.name).replace(/^\/+/, '');
    if (f.size > REP_FILE_MAX) { big.push(f.name); return; }
    if (!f.size || list.some(x => x.rel === rel && x.file.size === f.size)) return;
    list.push({ file: f, rel, state: 'wait', sent: 0 });
  });
  REP_FILES.set(form, list);
  repFilesDraw_(form);
  if (said && big.length) said.textContent = `Too large (over ${repMb_(REP_FILE_MAX)}), left out: ${big.slice(0, 3).join(', ')}${big.length > 3 ? '…' : ''}`;
}
on('rep-files', el => { const i = el.closest('.rep-box') && el.closest('.rep-box').querySelector('.rep-files-in'); if (i) i.click(); });
on('rep-dir', el => { const i = el.closest('.rep-box') && el.closest('.rep-box').querySelector('.rep-dir-in'); if (i) i.click(); });
document.addEventListener('change', e => {
  const i = e.target;
  if (!i || !i.classList || !(i.classList.contains('rep-files-in') || i.classList.contains('rep-dir-in'))) return;
  const form = i.closest('.rep-box');
  if (form) repFilesAdd_(form, i.files, i.classList.contains('rep-dir-in'));
  try { i.value = ''; } catch (err) {}
});
/* EVERY FILE NOT YET SENT, in order; resolves to the note's `files`, or null when one failed (Send again retries only those). */
async function repFilesSend_(form) {
  const list = REP_FILES.get(form) || [];
  if (!list.length) return undefined;
  const b = form.dataset.batch ? JSON.parse(form.dataset.batch) : repBatch_(list);
  form.dataset.batch = JSON.stringify(b);
  for (const x of list) if (x.state !== 'done' && !(await repSendFile_(form, x, b))) return null;
  return { batch: b.batch, count: list.length, names: list.map(x => b.strip ? x.rel.split('/').slice(1).join('/') : x.rel) };
}
const reportBoxOf_ = (kind, id) => [...document.querySelectorAll('.rep-box')].find(b => b.dataset.rk === kind && b.dataset.ri === id) || null;

on('rep-box', el => {
  if (!(typeof rankAtLeast_ === 'function' && rankAtLeast_('student'))) { toast('Sign in to suggest a change.'); return; }
  const kind = el.getAttribute('data-rk') || '', id = el.getAttribute('data-ri') || '';
  const had = reportBoxOf_(kind, id);
  if (had) { boxOut_(had); return; }
  let finder = '';
  try { finder = (finderAt_(el) || {}).id || ''; } catch (e) {}
  /* IN PLACE OF THE THING (489, `boxInPlace_`); a message's box still goes under the whole message. */
  /* A TILE DRAWN WITHOUT A NAME (a widget with no title field) takes its thing's heading, so the note names what a person sees. */
  const home = el.closest('.card, .own-set, .post');
  const h = home && home.querySelector('h2, h3, .wgt-title');
  const label = el.getAttribute('data-rl') || ((h && h.textContent) || '').trim().slice(0, 120);
  const box = boxInPlace_(el, reportBoxHtml_(kind, id, label, finder, reportPath_(el)));
  const s = box && box.querySelector('textarea');
  if (s) try { s.focus({ preventScroll: true }); } catch (e) {}
});
/* CANCEL CLOSES THE BOX AND KEEPS THE WORDS as the draft, for the next open. */
on('rep-cancel', el => { boxOut_(el.closest('.rep-box')); });

on('rep-send', el => {
  const form = el.closest('.rep-box');
  if (!form || form.classList.contains('is-sending') || !USER) return;
  const said = form.querySelector('.rep-said');
  const kind = form.dataset.rk, id = form.dataset.ri;
  const box = form.querySelector('.rep-note-in');
  const note = String((box && box.value) || '').trim().slice(0, SUGGEST_NOTE_MAX);
  const hasFiles = (REP_FILES.get(form) || []).length > 0;
  if (!note && !hasFiles && !suggestPeople_(kind)) { if (said) said.textContent = 'Write what should change first.'; return; }
  /* THE BOOKING WIDGET'S FIELDS GO WITH IT (29 Oct), so the note says what was filled in — `bookFieldsSaid_`, book.js. */
  const fields = kind === 'widget' && id === 'booking' && typeof bookFieldsSaid_ === 'function' ? bookFieldsSaid_() : '';
  form.classList.add('is-sending');
  (hasFiles ? repFilesSend_(form) : Promise.resolve(undefined)).catch(() => null).then(files => {
  form.classList.remove('is-sending');
  if (files === null) { const bad = (REP_FILES.get(form) || []).find(x => x.state === 'failed'); if (said) said.textContent = 'A file did not go' + (bad && bad.error ? ': ' + bad.error : '') + '. Press Send to try the rest again.'; return; }
  return send_({ action: 'suggest', personId: USER.personId || '', kind, itemId: id, label: form.dataset.rl || '', note: [note, fields].filter(Boolean).join('\n\n'),
          finder: form.dataset.finder || '', path: form.dataset.path || '', image: REP_PIC.get(form) || '', device: reportDevice_(), ...(files ? { files } : {}) },
        { button: el, where: said })
    .then(d => {
      /* SENT, SO THE DRAFT GOES — a reload must not bring back words already in the sheet. */
      try { draftDrop_('rep', kind + '|' + id); } catch (e) {}
      if (box) box.value = '';
      boxOut_(form);
      if (d && d.serious && DATA) {
        DATA.reportedItems = (DATA.reportedItems || []).concat(kind + '|' + id);
        if (Array.isArray(d.notes)) DATA.claudeNotes = d.notes;
      }
      toast(d && d.already ? 'Thanks — you already sent that one today' : d && d.serious ? 'Sent to Notes for Claude' : 'Thanks — sent to the admin');
    })
    .catch(() => {});
  });
});
