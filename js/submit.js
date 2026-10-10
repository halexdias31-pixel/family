/* ==================================================================================================
   @family. — submit.js

   EVERY ANSWER SENT IS AN EVENT, AND WHAT A CHILD SEES IS THE LATEST ONE.

   THE OWNER, 9 OCT:
     *"The kids don't need to see the day they did something. Just whether it's right or not. Also I
      just want system to record each submition. So like if they submit a correct answer then change it
      and submit an incorrect answer, that's 2 events. And it will leave the latest event up, so they
      would see incorrect answer there next time they login. Simple. Instead of each question just
      saving number of attempts."*

   SO A SUBMISSION IS ONE PRESS THAT ASKS FOR A VERDICT, and nothing else is: Send on a typed or maths
   answer (Check, `qp-check`), a pick that completes a multiple-choice card (`qp-choose`), Send on an
   ordering (`qp-order-send`), Mark with AI coming back with marks (`qp-ai`), and Send on a box nothing
   can mark (`qp-send` — verdict `sent`). Typing is not one, an item placed in an ordering is not one,
   and "Write something first" is not one. Each press is a row of SCHEMA.submissions on the account,
   appended and never touched again (`submitAnswer` in backend/dopost.gs).

   AND WHAT IS SHOWN IS THE LATEST PRESS, NEVER A DATE: on the card, beside the star, "Correct" / "Not
   yet" / "Sent" / the AI's "3/4" (`subSlot_`, find.js); in the box, the latest answer sent with its
   verdict on the verdict line — on any device, next sign-in. It replaced `Done 4 Oct` and the
   `attempts` tab under it, which kept a first day, a last day and a count.

   THE PHONE'S HALF, IN FOUR PARTS:

     RECORDING   `subRecord_` — the handler's press, made into an event: an id of its own (its clock and
                 a random tail, so a retried send is one row on the sheet), the question's key, its name
                 and words for the parent email (`doneLabel_` / `doneWords_`, find.js), what was sent and
                 the verdict. Into the QUEUE, kept in `localStorage` per person (`subQ:u:<id>`), so a
                 reload, a dead battery or a backend that cannot take it yet loses nothing; and into
                 the LATEST, this device's copy of the last press per question (`subLast:u:<id>`).
     SENDING     `subPush_` — at once (a press is not a keystroke: there is nothing to wait for), again
                 with backoff on a refusal or no signal, and with `keepalive` as the app goes away. Only
                 to a backend whose `features` lists `submitAnswer`; a phone ahead of the deploy keeps
                 every press and sends them the first time it can.
     ADOPTING    `subAdopt_` — the account's latest per question (`DATA.submissions`, laid on every
                 payload fresh and on the sign-in reply), laid over this device's: a press made on the
                 computer since is the latest here too, and fills the box — unless a finger is in it,
                 or something was typed here AFTER it, which stays on this device, with no verdict,
                 until it is sent.
     SAYING SO   the line under the box (`ansSavedSay_`, answers.js) and the card's slot (`subPaint_`).

   ITS OWN FILE, after answers.js: one idea with one vocabulary, beside the file that keeps drawings.
   Everything it calls in find.js, keypad.js and answers.js is called at run time, never while loading.
================================================================================================== */

/* THE SERVER'S CEILINGS, said again, because the phone must not send what will be refused for ever —
   `SUBMISSIONS_PER_POST` and `ANSWER_TEXT_MAX` in backend/constants.gs. An answer longer than the account
   keeps is still a press: its verdict is shown here, and it stays on this device and says so. 20,000
   SINCE THE ESSAY SHEET (note 312) raised both sides from 2,000 — the merge found this one still at
   2,000, so every essay over about 350 words Marked with AI would have been "too long to send" while
   the account would have taken it. */
const SUB_PER_POST = 25, SUB_ANSWER_MAX = 20000;
/* WHAT A `keepalive` REQUEST MAY CARRY — a browser refuses one over 64 KB (answers.js says the same). */
const SUB_KEEPALIVE_MAX = 60000;

/* ---------- THE KEYS ----------------------------------------------------------------------------------
   THE PHONE'S ANSWER KEY carries the person (`ans:u:P7:q:Q-1`); the SHEET'S carries the question only
   (`q:Q-1`, `pr:PR-1#iv` for a practical's worksheet box), with the person in its own column. */
const subKeyOf_ = k => String(k || '').replace(/^ans:(?:u:[^:]+:)?/, '');
/* THE PRESS'S NAME: this device's clock and six random letters and digits — `SUBMISSION_ID` on the
   server, checked for that shape. */
const subId_ = () => Date.now() + '-' + (Math.random().toString(36).slice(2) + '000000').slice(0, 6);

/* ---------- THE LATEST PRESS PER QUESTION, ON THIS DEVICE -----------------------------------------------
   `{ <sheet key>: { a, v, at, id, q?, far? } }` per person: the answer sent, its verdict, when (the
   server's time once it has it, this device's until then), the press's id, `q` while it is still to go
   up, `far` when the account will never take it (too long, or refused) and it lives here alone.

   SIGNED OUT IT IS THIS VISIT'S ALONE (`''`): there is no account to send to, and the verdict a Send
   just gave has to survive the card being drawn again — it did not, for an ordering, until `ORDER_SENT`
   held it for the visit, and this is that, for every kind of box.

   READ THROUGH A COPY, CHECKED AGAINST THE STORED TEXT. A card asks this for every question it draws,
   and parsing the whole map per card is a column of hundreds of parses; the text is compared instead,
   so a write from another tab — or a check seeding the store — is seen on the next read. Wrapped,
   because private mode throws on `localStorage` rather than answering null. */
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
    /* A FULL STORE KEEPS THE OLD TEXT, and the next read would find it differing from this copy and parse
       the old one over the press just made. So the copy is filed under the text the store still holds:
       the visit keeps the press, and the queue (`subQ:`) still has it to send — held for the visit itself
       when the store refuses it too (`subQueueKeep_`), which until 10 Oct it was not. */
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

/* ---------- THE QUEUE: EVERY PRESS NOT YET ON THE ACCOUNT, IN ORDER -------------------------------------
   PER PERSON, IN `localStorage`, so it survives a reload, a crash and a sign-out — and goes up the next
   time that person is signed in here, the way an unsent drawing does (`ansDirty`). Every press, not the
   latest per question: right and then wrong is two rows on the sheet, *"that's 2 events"*. */
/* ---------- AND A QUEUE THE STORE REFUSED IS THE VISIT'S, READ FIRST (review of 10 Oct) --------------------
   THE WRITE WENT INTO `SUBQ_MEM` AND THE REFUSAL WAS SWALLOWED, and the read only fell back to that copy
   when `getItem` THREW. A nearly full store does not throw on a read: it answers with the list it still
   holds — the old one, without the press just made. Measured: Check pressed with the queue's write
   refused, nothing sent, nothing on the account, and "Sending…" under the box for ever; and the one-time
   carry-over (`subMigrate_`) marked itself done over a queue that was never kept, so a child's work from
   before the switch was flagged as carried and never went. So the queue goes through `keepPut_`
   (data.js), the one writer for what a person made: a refusal gives up the splash's copy first and tries
   again; a write still refused is held for the visit (`keepHeld_`), read before the store by this, written
   again as the page goes (`keepRetry_`), and counted as work only this page holds — the browser asks
   "Leave site?" until it has gone up. Returns whether the store took it. */
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
/* ---------- A PRESS MARKED "STILL TO GO" THAT THE QUEUE HAS NOT GOT WILL NEVER GO — SO IT IS QUEUED AGAIN ----------
   `q` on the latest says a press is in the queue. A queue write the store refused and the page left before
   it could go up (an old backend cannot take it) leaves the `q` and loses the press: "Sending…" for ever,
   and `subAdopt_` kept it as "the latest there is" over every later press from another device — measured,
   a computer's "Not yet" never shown on the iPad. Asked on every adopt: each such press is put back in the
   queue under its own id (the server writes an id once, so a press that did go up after all is not a
   second row), with its name and words found again the way `subRecord_` finds them. Returns the keys. */
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

/* ---------- RECORDING A PRESS -----------------------------------------------------------------------------
   `k` is the box's answer key, `answer` what was sent (a pick's positions, an ordering's order, the
   words in the box), `verdict` `right` · `wrong` · `sent` · `ai:N/M`. Returns the latest entry it wrote,
   or null when there was nothing to record (an empty answer, a key for somebody not signed in).

   THE NAME AND THE WORDS GO WITH IT, found the way `doneMark_` found them for the `attempts` tab it
   replaced: the weekly email reads them, and the backend cannot look a key up. */
function subRecord_(k, answer, verdict) {
  k = String(k || '');
  answer = answer === null || answer === undefined ? '' : String(answer);
  if (!/^ans:/.test(k) || !answer.trim() || !verdict) return null;
  const who = ansWhoOf_(k);
  if (who && !(typeof whoIs_ === 'function' && whoIs_() === who)) return null;
  const key = subKeyOf_(k);
  const e = { a: answer, v: String(verdict), at: Date.now(), id: subId_() };
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
  if (e.q) subPush_(true);
  return e;
}

/* ---------- SENDING -------------------------------------------------------------------------------------
   A PERSON WITH AN ID AND A SESSION, AND A BACKEND THAT SAYS IT CAN (`submitAnswer` in `DATA.features`).
   Answered `{ success, saved: { <id>: { key, verdict, at } } }`: an id in `saved` is on the sheet — written
   now, or by an earlier send whose reply was lost — and leaves the queue; an id NOT in it was refused for
   good (its shape, its verdict, its length), and leaves the queue too, its answer kept here and saying so.
   No reply, or an error ("Busy"), keeps the whole queue and tries again — sooner at first, then less
   often, so a phone with no signal is not a request a second. */
let SUB_BUSY = null, SUB_AGAIN = false, SUB_RETRY = 0, SUB_BACKOFF = 0;
/* THE REQUEST. `personId` AS WELL AS THE TOKEN — the gate overwrites it with the token's person, and
   `check-post.js` asks that every handler reading one is sent one.
   ---------- AND THIS DEVICE'S CLOCK AT THE MOMENT IT SENDS (`sent`, review of 10 Oct) ----------------------
   `pressed_at` is the press's own moment by this device's clock, and the server held it only against a
   FAST clock (never later than its own). A SLOW one went through: an iPad two hours behind, the answer
   changed and Checked now, was stored two hours ago — older than the computer's press an hour ago — so the
   account's latest was the earlier answer, and the next load wrote it back over the iPad's own box. A
   child setting the clock back for a game is enough. The server cannot know a press's true time, but it
   can know this device's error: its own clock when the request lands, less this, is the skew, and every
   press in the request moves by it (`submissionsAppend_` in dopost.gs). A phone that sends no `sent` is
   held as before. */
function subBody_(pid, items) {
  return { action: 'submitAnswer', personId: pid, items: items, sent: Date.now() };
}
/* WHAT THE SERVER SAID, LAID ON THIS DEVICE — the same for a send now and for Sign out's last one
   (`subDrain_`). Answered `{ success, saved: { <id>: { key, verdict, at } } }`; anything else throws, and
   the whole request stays queued. */
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

/* ---------- AT SIGN-OUT, WHAT IS STILL QUEUED GOES UP ON THE TOKEN THAT IS ENDING (review of 10 Oct) --------
   SIGN OUT WAITED FOR THE DRAFTS AND THE NOTEPAD (`answersPush_`, `keepFlush_`) before it ended the session,
   and not for the presses, which since 9 Oct are how a typed answer reaches the account at all. Measured:
   Check, then Sign out 20 ms later — the server, which does not order two requests, ended the token first
   and refused the press; two Checks inside one request's flight, then Sign out — the second waited behind
   the first (`SUB_AGAIN`), and `subForget_` threw that away with nobody signed in to send it for. Both
   stayed queued under the child on this device: on a tutor's laptop or a friend's iPad they never sign
   into again, never sent. So `on('signout')` (me.js) asks this BEFORE it forgets the person — `pid`, the
   token and whether the backend takes presses are read then — and ends the session only once it has
   answered: the request in flight first, then whatever is still queued for them, on THEIR token (`api()`
   keeps a token it is given), a request at a time, the replies laid on the device as `subPush_` lays
   them. Nobody else's: the queue is read under their id. Whatever cannot go waits under it, as before.
   A few requests at most — Sign out must not wait on a queue of hundreds for ever. */
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

/* ---------- WHAT THE ACCOUNT SAYS, LAID OVER THIS DEVICE ------------------------------------------------
   FROM `adoptMarks_` (every payload) AND `signedIn_` (the sign-in reply). `DATA.submissions` is
   `{ for, mine: { <key>: { answer, verdict, at, id } } }` for the token's person, and a copy built for
   anybody but the person signed in now is the last child on a shared iPad, and is not read.
     a press still to go up from here    wins: it is the latest there is
     the same press (same id)            nothing to do
     a later one here                    stays (this device sent it, and the account is a load behind)
     otherwise                           the account's is the latest — on the card, and in the box,
                                         unless a finger is in it or something was typed here after it
   Then whatever is waiting here goes up. */
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
        /* AN EMPTY SUBMISSION IS NOBODY'S LATEST, AND NEVER EMPTIES A BOX. The server refuses one, and the
           phone never makes one — but a row typed into the sheet by hand, or one written by a backend
           from before that rule, would otherwise be "the latest answer sent" and be laid over whatever
           the box holds: an essay emptied by a blank cell, on every device, with a verdict beside the
           nothing. It is passed over as though it were not there. */
        if (!answer.trim()) return;
        const cur = all[key];
        /* A PRESS STILL TO GO FROM HERE IS THE LATEST THERE IS — except one that was lost from the queue and
           has only just been put back (`subRequeue_`): it may be days old, and a later press from another
           device is the latest on this device too, as it is on the account. It still goes up, as history. */
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
        /* A DRAFT IS WHAT WAS TYPED HERE AND NEVER SENT — not the answer this device's own last press sent,
           whatever its clock says: an iPad ten minutes fast would otherwise keep its old answer over the
           computer's newer press, as though it were newer. */
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

/* ---------- WHAT WAS DONE BEFORE THE SWITCH, SENT ONCE, SO NO CHILD LOSES IT --------------------------------
   THE LIVE LEDGER, COUNTED ON 10 OCT: 55 `attempts` rows for 5 learners and no `answers` tab — the live
   backend is a week old, older than the answers sync — so a typed answer is on the child's device and
   nowhere else, under `ans:u:<id>:<key>`. When the new backend lands, the card's mark is the latest
   SUBMISSION, and nobody has submitted anything: every question those children did would go blank on
   every card, and their answers would never reach the account, because a box opens on the latest answer
   sent and nothing was ever sent. The owner updates in place (pull, `ensureSchema`, New version), so
   there is no spreadsheet to carry it across in; the devices are where it is.

   SO, ONCE PER PERSON PER DEVICE (`subMigrated:u:<id>`, written when the pass has run), on a load signed
   in: every question this person had DONE before the change —
     · a `done:u:<id>:<key>` date on this device (written by the first keystroke, Check or pick of a day,
       `doneMark_`, until 9 Oct), or
     · a row of their own in `DATA.attempts`, while an old backend still sends it —
   that holds a non-empty answer of THIS PERSON on this device (`ans:u:<id>:<key>` only, read through the
   visit's copy first, `ansValue_`), and that the account has no submission for, becomes ONE submission,
   marked by the site's own marker exactly as its press would have been: an ordering by `orderSeq_` and
   `markOrder_`, a pick against `choiceRight`, a typed or maths answer with a scheme by `markAnswer_`, and
   `sent` for anything nothing can mark. Then it is on the card and in the account like any press.

   WHAT IS NOT SENT: a key the library does not have (nothing can name or mark it, and the pass waits until
   the library has loaded rather than calling every key unknown); an empty answer; a holed ordering or a
   pick still short of its number, which were never answers; and a draft that was never DONE — typed and
   left is a draft, and stays one. Nobody else's: the keys are read under this person's id and no other,
   so on the family iPad a brother's answers are his, for his own sign-in. A signed-out answer reaches
   this person's key only through `answersClaim_` or `ansRead_`, which ask `ansMayMove_` (note 317) —
   this never reads a signed-out key.

   ONE ROW, HOWEVER MANY DEVICES OR RUNS. The press's id is made from the person and the key
   (`subMigrateId_`), so the same question migrated from the iPad and the computer, or twice because a
   flag was lost, is one row: the server writes an id once per person. Its time is the answer's own last
   edit (`ansAt_`), else the day it was done, so a press made since — on any device — is the later one.

   WAITS, AND DOES NOT MARK ITSELF DONE, while it cannot judge: no library yet, or a backend that keeps
   submissions whose copy for this person has not arrived. A backend from before submissions has none to
   compare with, so the presses are queued and go up the first time it can take them.

   ---------- WHAT THE OLD CODE LEFT, NOT WHAT HAS BEEN WRITTEN INTO THE KEY SINCE (review of 10 Oct) ----------
   IT READ THE BOX AS IT IS WHEN THE PASS RUNS, and the pass runs late — after the sign-in reply, after the
   library, after the payload — while three doors write into `ans:u:<id>:` before it: the claim at a
   sign-in from nobody (`answersClaim_`, 318: the later edit wins), a card drawn before the payload
   (Saved draws a starred one from the device), and `ansRead_` moving a signed-out answer into an empty
   box. Measured: Ada had done Q1a on 5 Oct ("0.0197", right); somebody typed "5" into it signed out; she
   signed in from nobody, and the claim put "5" in her key a moment before this pass sent it as her
   submission — "Not yet" on her card, ✗ in her parent's email, dated today so the latest, and her right
   answer never reached the account. A press nobody pressed, which the claim's own comment says never
   happens. So two rules, one per kind of door:
     · AN ANSWER LAST EDITED AFTER ITS DONE DAY WAS WRITTEN BY THIS CODE, not the old one, and is a draft.
       The old code wrote `done:` on the first keystroke, Check or pick of every day the box was touched
       (`doneMark_`, until 9 Oct), by the same clock as `ansAt:` — so an answer it left is never stamped
       after the end of its done day. One stamped later was typed, claimed or moved since, and nobody
       pressed it: it stays in the box, a draft, and is not carried.
     · WHAT THE CLAIM WROTE OVER IS READ INSTEAD OF THE BOX (`subBefore:u:<id>`, `subClaimOver_` below):
       Ada's "0.0197" with its 5 Oct time, so the claim keeps 318's rule (the later edit is her draft) and
       the carry-over keeps hers. Read first, whenever the pass runs — at the sign-in or once the library
       and the account's copy land — so the order of the two calls in `signedIn_` cannot matter. */
const SUB_BEFORE = Date.UTC(2026, 9, 9);
/* ---------- WHAT A SIGN-IN'S CLAIM WROTE OVER, KEPT FOR THE CARRY-OVER THAT HAS NOT RUN ---------------------
   `answersClaim_` (answers.js) calls this before it writes over a typed answer this person already had —
   only while their carry-over is still to run on this device. The FIRST answer written over is the one
   the old code left, and a second claim never replaces it. Through `keepPut_` as a record (data.js): held
   for the visit if the store refuses it, given the splash's room, and written again as the page goes —
   lost, the claimed draft would be the only answer the pass could find. Gone when the pass has run. */
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
  /* DONE ONLY WHEN WHAT IT MADE IS KEPT. The flag was written whatever the store said, so a queue it
     refused was a carry-over marked done and never sent (review of 10 Oct, above `subQueue_`). Refused, the
     visit still holds both and sends what it can; the next load runs the pass again, and a press it left
     marked to go is queued again by `subRequeue_` — under the same id, so it is one row. */
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

/* ---------- THE WORDS FOR A VERDICT -----------------------------------------------------------------------
   ON THE BOX'S VERDICT LINE, the sentence Check has always said; ON THE CARD, the short form beside the
   star. Right and Not yet carry the line's own marks, drawn by the stylesheet (a tick, and the turning
   arrow that says "go round again" — never a cross: see `.qp-verdict` in style.css). `sent` is plain:
   nothing marked it. The AI's is its marks. */
function subAiOf_(v) {
  const m = /^ai:(\d{1,3})\/(\d{1,3})$/.exec(String(v || ''));
  return m ? { got: +m[1], of: +m[2] } : null;
}
function subSay_(v) {
  if (v === 'right') return { text: 'Correct', cls: 'is-right' };
  if (v === 'wrong') return { text: 'Not yet — have another go', cls: 'is-near' };
  if (v === 'sent') return { text: 'Sent', cls: '' };
  const ai = subAiOf_(v);
  if (ai) return { text: ai.got + ' of ' + ai.of + ' mark' + (ai.of === 1 ? '' : 's') + ' · AI', cls: ai.got >= ai.of ? 'is-right' : 'is-near' };
  return { text: '', cls: '' };
}
function subMark_(v) {
  if (v === 'right') return { text: 'Correct', cls: ' is-right' };
  if (v === 'wrong') return { text: 'Not yet', cls: ' is-near' };
  if (v === 'sent') return { text: 'Sent', cls: ' is-sent' };
  const ai = subAiOf_(v);
  if (ai) return { text: ai.got + '/' + ai.of, cls: ai.got >= ai.of ? ' is-right' : ' is-near' };
  return { text: '', cls: '' };
}

/* ---------- PAINTED WHERE IT STANDS --------------------------------------------------------------------
   THE CARD'S SLOT, by its answer key, on every column that holds the card (Find and Saved), and the line
   under every box — never a repaint, which would rebuild the column under a child's finger. */
function subSlotSet_(el) {
  const m = subMark_((subLatest_(el.getAttribute('data-k')) || {}).v);
  const cls = 'qcard-verdict' + m.cls;
  if (el.className !== cls) el.className = cls;
  if (el.textContent !== m.text) el.textContent = m.text;
}
function subPaint_(k) {
  try {
    document.querySelectorAll('.qcard-verdict[data-k]').forEach(el => { if (el.getAttribute('data-k') === k) subSlotSet_(el); });
  } catch (e) {}
  if (typeof ansSavedPaint_ === 'function') ansSavedPaint_();
}
function subPaintAll_() {
  try { document.querySelectorAll('.qcard-verdict[data-k]').forEach(subSlotSet_); } catch (e) {}
  if (typeof ansSavedPaint_ === 'function') ansSavedPaint_();
}
/* A BOX'S VERDICT LINE, FROM THE STORE: the latest press's verdict while the box holds what was sent, and
   nothing once it holds anything else — a verdict is about the answer it marked. Not while Mark with AI
   is still marking (its reply decides), and an ordering is drawn again whole, from the store, as a tap
   draws it. */
function subVerdictPaint_(mark, inp) {
  if (!mark || !inp || mark.classList.contains('is-busy')) return;
  const out = mark.querySelector('.qp-verdict');
  if (!out) return;
  const k = inp.getAttribute('data-k');
  const latest = subLatest_(k);
  const say = latest && latest.a === inp.value ? subSay_(latest.v) : { text: '', cls: '' };
  /* AN ESSAY'S MARK KEPT ON THIS DEVICE (`aiKeptView_`, keypad.js, note 312) is drawn instead — with its
     points, fresh or "before your changes" — when it is about these very words, or when no submission
     is. A submission about these words that is not the kept mark's (from another device, or a plain Send
     since) is the newer reading: its verdict, and the kept points, which are about other words, off the
     screen (they stay kept, for an Undo back to them). */
  if (mark.classList.contains('qp-essay') && mark.classList.contains('qp-ai') && typeof aiKeptView_ === 'function') {
    const view = aiKeptView_(k, inp.value);
    if (view && (view.fresh || !say.text) && typeof aiKeptPaint_ === 'function') { aiKeptPaint_(mark, inp); return; }
    const why = mark.nextElementSibling;
    if (why && why.classList.contains('qp-ai-why') && why.textContent) why.textContent = '';
    mark.classList.remove('is-stale');
  }
  /* AI MARKING SWITCHED OFF says so on this line (`aiOff_`), and keeps saying it until there is something
     else to say — but ONLY WHILE THE LINE STILL SAYS IT. It returned on `is-off` alone, and `aiOff_` leaves
     that on the box after swapping its tile for the plain Send: so once "Sent" had replaced the message,
     a letter typed after it left "Sent" over an answer nobody sent, above "On this device until you send
     it" — the box contradicting itself, and typing no longer taking a verdict off (review of 9 Oct). */
  if (!say.text && mark.classList.contains('is-off') && out.textContent && out.textContent === mark.getAttribute('data-off-said')) return;
  mark.classList.remove('is-right', 'is-near');
  if (say.cls) mark.classList.add(say.cls);
  if (out.textContent !== say.text) out.textContent = say.text;
}
function subBoxPaint_(k) {
  try {
    document.querySelectorAll('.qp-ans-in[data-k]').forEach(inp => {
      if (inp.getAttribute('data-k') === k) subVerdictPaint_(inp.closest('.qp-mark'), inp);
    });
    document.querySelectorAll('.qp-order[data-k]').forEach(box => {
      if (box.getAttribute('data-k') === k && typeof orderRedraw_ === 'function') orderRedraw_(box, '');
    });
  } catch (e) {}
}

/* ---------- AS THE APP GOES AWAY, WHATEVER IS WAITING GOES WITH `keepalive` ----------------------------------
   `visibilitychange` to hidden is the last event an iPad reliably sends when the cover closes, and
   `pagehide` the one a closing tab sends (answers.js does the same for drawings). */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') subPush_(true, true);
});
window.addEventListener('pagehide', () => { subPush_(true, true); });

/* ---------- AND FORGOTTEN AT SIGN-OUT -------------------------------------------------------------------
   `signedOut_` (me.js) calls this. The signed-out visit's verdicts go (they were the last person's
   presses on a shared iPad), a retry booked for the last person is not left to run, and the copies held
   in memory are dropped so the next person's are read from their own drawer. What is still to go up
   stays queued under the last person's key, for the next time they sign in here. */
function subForget_() {
  SUB_MEM.clear();
  SUBQ_MEM.clear();
  clearTimeout(SUB_RETRY);
  SUB_BACKOFF = 0;
  SUB_AGAIN = false;
}
