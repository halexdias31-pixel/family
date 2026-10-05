/* ==================================================================================================
   @family. — digest.gs   THE WEEKLY PARENT EMAIL, BUILT AND SWITCHED OFF

   ASKED FOR AS *"i need you to make something which triggers every sunday. it checks what the student
   has done that week and records the questions and send it in an email to parents. for now dont
   actually make it but make the infrastructure to set it up so that in the future we will actually
   wire it up and make it properlly."*

   SO EVERYTHING IS HERE AND NOTHING IS RUNNING. Three things have to happen, all by the owner, before
   one parent gets one email — and none of them is in code:
     1. `weekly_digest` on the config tab, `off` until somebody types otherwise (CONFIG_DEFAULTS);
     2. `installWeeklyDigest` run once from the Apps Script editor, which is the only thing that books
        the Sunday trigger — nothing in this project calls it, and `check-digest.js` fails if anything
        starts to;
     3. `preview` for a Sunday or two, reading `digest_log`, before `send`.
   The steps, and the decisions that go with them, are in docs/history/pending-digest.md.

   WHAT IT READS. `attempts` — one row per learner per question, `first_done` and `last_done` (see
   SCHEMA.attempts, and `markDone`, which writes them). A question is in a learner's week when either
   day falls inside it: `first_done` in the week is NEW, `last_done` in the week and `first_done`
   before it is DONE AGAIN. That is all the tab can say — it keeps the first and the last day, not
   every day — and it is enough for a run on the Sunday the week ends. A run days later can miss a
   question done in the week and again since, because its `last_done` has moved on; said in the note.

   WHO IT GOES TO, AND THE ONE RULE THAT MATTERS: a learner's ACCEPTED parents with an address
   (`acceptedParents` — a link the child said yes to, on the `family` tab), and nobody else. Not a
   pending or refused link, not the learner, not a tutor, not whoever shares a surname. A learner with
   no such parent is listed as unreachable and emailed to nobody; a parent whose `weekly_email` cell
   says no is skipped. One email per parent per learner, so two children are two emails and each one
   is about one child.

   FILE ORDER. Functions only, like every file but constants.gs: Apps Script joins the files in an
   order nobody chooses, and a top-level `const` here could be read before it exists. Its constants —
   `DIGEST_MODES`, `DIGEST_TZ`, `DIGEST_RUN`, `DIGEST_LIST_MAX` — are in constants.gs for that reason.
================================================================================================== */


/* ---------- THE SWITCH, AND THE TWO NUMBERS BESIDE IT ------------------------------------------------
   EACH WITH A FALLBACK, and each fallback is the safe answer: a blank, a typo or a missing config tab
   is `off`, 18:00 and a reserve of 10. `send` has to be spelled exactly, because it is the only one
   of the three that reaches somebody's inbox. */
function digestMode_(cfg) {
  const m = norm(cfg && cfg.weekly_digest);
  return DIGEST_MODES.indexOf(m) !== -1 ? m : 'off';
}
function digestHour_(cfg) {
  const c = S(cfg && cfg.weekly_digest_hour);
  return /^\d{1,2}$/.test(c) && Number(c) <= 23 ? Number(c) : 18;
}
function digestReserve_(cfg) {
  const c = S(cfg && cfg.weekly_digest_reserve);
  return /^\d+$/.test(c) ? Number(c) : 10;
}


/* ---------- WHAT A WEEK IS: MONDAY 00:00 TO SUNDAY 23:59, LONDON ---------------------------------------
   LONDON BECAUSE THAT IS WHOSE CALENDAR THE DAYS ON THE SHEET ARE. `attemptsUpsert_` writes a day as
   `yyyy-MM-dd` — the phone's own day, or London's today — so the week has to be a run of those same
   strings, and comparing strings is all the selection does. MONDAY TO SUNDAY because the email goes on
   the Sunday the week ends, and a week that ended on Saturday would leave the day it is read on out.

   BST IS HANDLED BY NEVER DOING ARITHMETIC ON A CLOCK. The one conversion from an instant to a date is
   `Utilities.formatDate(now, 'Europe/London', …)`, which knows when the clocks change; everything after
   that is calendar arithmetic on `Date.UTC`, which has no daylight saving, so a day is always 864e5 ms
   and the last Sunday of October (25 hours) and of March (23) cannot move a boundary. Done the other
   way — `now - 7 * 864e5`, or `getDay()` on the server's clock — a run at 00:30 on a Monday in summer
   is still Sunday in UTC and reports the week just gone as the new one. `check-digest.js` asks both
   Sundays the clocks change. */
function digestDay_(now) {
  const d = now instanceof Date && !isNaN(now) ? now : new Date();
  return Utilities.formatDate(d, DIGEST_TZ, 'yyyy-MM-dd');
}
function digestShift_(iso, days) {
  const t = Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) + days * 864e5;
  return new Date(t).toISOString().slice(0, 10);
}
/* The Monday and the Sunday of the week a London day is in. */
function digestWeekOf_(iso) {
  const dow = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))).getUTCDay();
  const back = (dow + 6) % 7;                   // Monday 0 … Sunday 6
  return { start: digestShift_(iso, -back), end: digestShift_(iso, 6 - back) };
}
/* The week `now` is in — what the admin's Preview shows: this week so far. */
function digestWeek_(now) {
  const today = digestDay_(now);
  return Object.assign(digestWeekOf_(today), { today: today });
}
/* ---------- AND THE WEEK A RUN SENDS ---------------------------------------------------------------
   THIS WEEK ON A SUNDAY, OTHERWISE THE ONE THAT ENDED LAST SUNDAY. The trigger only ever fires on a
   Sunday, so for it the two are the same. The difference is the run somebody starts BY HAND on the
   Monday — after the mail quota ran out, or to read a preview of a week that is finished — which
   must finish the week that was being sent, not start a new one that has nothing in it. */
function digestWeekToSend_(now) {
  const w = digestWeek_(now);
  if (w.today === w.end) return w;
  return Object.assign(digestWeekOf_(digestShift_(w.start, -1)), { today: w.today });
}
/* `28 Sep – 4 Oct`, off the two strings — no Date, so no time zone to get wrong. */
function digestSpan_(week) {
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const say = iso => (+iso.slice(8, 10)) + ' ' + MON[+iso.slice(5, 7) - 1];
  return say(week.start) + ' – ' + say(week.end);
}


/* ---------- THE PLAN: WHO DID WHAT, AND WHO IS TOLD ----------------------------------------------------
   PURE. Everything it needs is handed in — the attempts rows, the people rows, a `parentsOf(id)` that
   answers with person rows, and `look` (the business's name and the site's address) — and it reads no
   tab, sends nothing and writes nothing. So the same function is the Sunday run, the admin's Preview
   and the check, and none of the three can be looking at a different rule.

   `parentsOf` IS `acceptedParents` everywhere but the check, rather than this walking `family` itself:
   a second reader of who is whose parent is the one that drifts (see `childrenOf` in people.gs, twice).

   Returns `{ week, learners, emails, unreachable, look }`:
     learners     one per learner who did anything this week — the questions, new and again, who is told
     emails       one per parent per learner, rendered: `to`, `subject`, `text`, `html`
     unreachable  learners nobody can be told about, each with the reason in words */
function digestPlan_(week, attemptRows, peopleRows, parentsOf, look) {
  const inWeek = d => !!d && d >= week.start && d <= week.end;
  const byId = {};
  (peopleRows || []).forEach(p => { const id = S(p && p.person_id); if (id && !byId[id]) byId[id] = p; });

  const per = {};
  (attemptRows || []).forEach(r => {
    const pid = S(r && r.person_id), q = S(r && r.question_key);
    if (!pid || !q) return;
    const first = isoDate_(r.first_done), last = isoDate_(r.last_done);
    const fresh = inWeek(first);
    if (!fresh && !inWeek(last)) return;
    const L = per[pid] || (per[pid] = { id: pid, fresh: [], again: [] });
    /* THE NAME A PARENT CAN READ, OR THE KEY — see SCHEMA.attempts for why the backend cannot look
       a key up for itself. */
    const item = { key: q, label: attemptLabel_(r.label) || q, last: last, times: N(r.times) || 1 };
    (fresh ? L.fresh : L.again).push(item);
  });

  const order = (a, b) => (a.last < b.last ? -1 : a.last > b.last ? 1 : a.label < b.label ? -1 : a.label > b.label ? 1 : 0);
  const learners = [], emails = [], unreachable = [];
  Object.keys(per).forEach(pid => {
    const L = per[pid];
    L.fresh.sort(order); L.again.sort(order);
    L.count = L.fresh.length + L.again.length;
    const me = byId[pid];
    L.name = me ? personDisplayName(me) : '';
    L.first = me ? S(me.first_name) : '';
    L.to = []; L.skipped = []; L.why = '';
    if (!me) {
      L.why = 'not on the people tab';
    } else {
      let parents = [];
      try { parents = parentsOf(pid) || []; } catch (err) { parents = []; }
      const seenId = {}, seenMail = {};
      let linked = 0;
      parents.forEach(p => {
        const id = S(p && p.person_id);
        /* NEVER THE LEARNER, whatever the family tab says — a row linking somebody to themselves is a
           typo, and "not emailed to themselves" is the rule. */
        if (!id || id === pid || seenId[id]) return;
        seenId[id] = 1;
        linked++;
        const who = { id: id, name: personDisplayName(p), first: S(p.first_name), email: S(p.email) };
        if (!who.email) { L.skipped.push(Object.assign(who, { why: 'no email address' })); return; }
        if (!ON_(p.weekly_email)) { L.skipped.push(Object.assign(who, { why: 'asked not to get it' })); return; }
        /* ONE MAILBOX ONCE PER CHILD, if two parent rows share an address. */
        const m = norm(who.email);
        if (seenMail[m]) { L.skipped.push(Object.assign(who, { why: 'same address as another parent' })); return; }
        seenMail[m] = 1;
        L.to.push(who);
      });
      /* THE REASON IN WORDS, naming each parent, because "unreachable" alone sends the owner to the
         family tab to work out which of three things it is. */
      if (!L.to.length) {
        L.why = !linked ? 'no parent has accepted a link to them'
              : 'no parent can be told — ' + L.skipped.map(s => (s.name || s.id) + ': ' + s.why).join('; ');
      }
    }
    learners.push(L);
    if (L.why) { unreachable.push({ id: pid, name: L.name, count: L.count, why: L.why }); return; }
    L.to.forEach(p => {
      const m = digestRender_(L, p, week, look);
      emails.push({ week: week.start, learner_id: pid, parent_id: p.id, learner: L.name, parent: p.name,
                    to: p.email, subject: m.subject, text: m.text, html: m.html, count: L.count });
    });
  });
  learners.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return { week: week, learners: learners, emails: emails, unreachable: unreachable, look: look || {} };
}


/* ---------- ONE EMAIL: A SUBJECT, A PLAIN BODY AND THE SAME IN HTML -----------------------------------
   SHORT AND PLAIN, because it is read on a phone by a parent between other things: who, how many, the
   list, the site, how to stop. No marks and no verdicts — `attempts` records that a question was done,
   not how it went, and an email that implied a score would be inventing one.

   THE PLAIN BODY IS NOT AN AFTERTHOUGHT. MailApp sends both and a mail client shows whichever it
   prefers; the plain one is also what the admin's Preview prints. Every value in the HTML goes through
   `digestEsc_` — a label came off a phone. */
function digestRender_(L, P, week, look) {
  const brand = S(look && look.brand) || BRAND_NAME;
  const site = S(look && look.site) || SITE_URL;
  const kid = S(L.first) || S(L.name) || 'Your child';
  const qs = x => x + ' question' + (x === 1 ? '' : 's');
  const n = L.fresh.length + L.again.length;
  const hello = S(P && P.first) ? 'Hello ' + S(P.first) + ',' : 'Hello,';
  const lead = 'This week (' + digestSpan_(week) + ') ' + kid + ' did ' + qs(n) + ' on ' + brand
    + (L.fresh.length && L.again.length ? ': ' + L.fresh.length + ' new, and ' + L.again.length + ' done again.' : '.');

  /* AT MOST `DIGEST_LIST_MAX`, the new ones first, then "and N more". */
  let room = DIGEST_LIST_MAX;
  const take = list => { const shown = list.slice(0, Math.max(0, room)); room -= shown.length; return shown; };
  const fresh = take(L.fresh), again = take(L.again);
  const more = n - fresh.length - again.length;
  const parts = [];
  if (fresh.length) parts.push({ head: L.again.length ? 'New this week' : 'The questions', items: fresh });
  if (again.length) parts.push({ head: 'Done again', items: again });

  const link = 'See them on the site: ' + site;
  const foot = 'You get this because you are ' + kid + '’s parent on ' + brand
    + '. To stop these emails, reply to this one and say so.';
  const subject = kid + '’s week on ' + brand + ': ' + qs(n);

  const text = [hello, '', lead, '']
    .concat(...parts.map(p => [p.head].concat(p.items.map(q => '- ' + q.label), [''])))
    .concat(more > 0 ? ['…and ' + more + ' more.', ''] : [])
    .concat([link, '', foot]).join('\n');
  const html = '<p>' + digestEsc_(hello) + '</p><p>' + digestEsc_(lead) + '</p>'
    + parts.map(p => '<p><b>' + digestEsc_(p.head) + '</b></p><ul>'
      + p.items.map(q => '<li>' + digestEsc_(q.label) + '</li>').join('') + '</ul>').join('')
    + (more > 0 ? '<p>…and ' + more + ' more.</p>' : '')
    + '<p><a href="' + digestEsc_(site) + '">See them on ' + digestEsc_(brand) + '</a></p>'
    + '<p><small>' + digestEsc_(foot) + '</small></p>';
  return { subject: subject, text: text, html: html };
}

function digestEsc_(s) {
  return S(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* THE BUSINESS'S NAME AND THE SITE'S ADDRESS — each from the one place it is written, each with the
   constant beside it as the floor, so a broken config tab still signs the email. */
function digestLook_() {
  let brand = '', site = '';
  try { brand = S(brandName()); } catch (err) {}
  try { site = S(config().site_url); } catch (err) {}
  return { brand: brand || BRAND_NAME, site: site || SITE_URL };
}

/* THE PLAN FOR A WEEK, OFF THE SHEET AS IT IS. The only impure step: three reads and the real
   `acceptedParents`. */
function digestPlanNow_(week) {
  return digestPlan_(week, read(TAB.attempts).rows, read(TAB.people).rows, acceptedParents, digestLook_());
}


/* ---------- THE SUNDAY RUN ------------------------------------------------------------------------------
   `weeklyDigestRun` IS WHAT THE TRIGGER CALLS, and the only thing `installWeeklyDigest` books. Google
   hands a trigger an event object, which says nothing this needs; the clock is read here.

   OFF RETURNS FIRST, BEFORE THE LOCK AND BEFORE A TAB IS READ. A trigger left installed with the
   switch off costs one config read a week and does nothing else — which is what makes installing the
   trigger and switching the email on two separate decisions.

   UNDER THE SCRIPT LOCK, so two runs — the trigger, and somebody pressing Run in the editor at the same
   minute — cannot both find no receipt and both send. Refused rather than run unlocked.

   THE LOG ROW IS THE RECEIPT, AND IT IS WRITTEN BEFORE THE EMAIL. `sending` goes on the row (and is
   flushed) before `MailApp.sendEmail`; `sent` after. A run killed between the two leaves `sending`,
   which a rerun treats as sent: AT MOST ONCE, because a parent sent the same email twice minds more
   than one who missed a week. A row saying `preview`, `held` or `failed` is no receipt, and a rerun
   sends it.

   THE QUOTA. `MailApp.getRemainingDailyQuota()` is asked before each email, and the run stops sending
   once it would go below `weekly_digest_reserve` — those rows are `held`, and running it again once
   the quota is back (the next day, by hand) sends them, the same week, thanks to `digestWeekToSend_`. */
function weeklyDigestRun(e) {
  return digestRun_(new Date());
}

function digestRun_(now) {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const mode = digestMode_(cfg);
  if (mode === 'off') return { mode: 'off', did: 'nothing — weekly_digest on the config tab is off' };

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return { mode: mode, error: 'Busy — another run holds the lock. Nothing was sent.' };
  try {
    /* FRESH ROWS UNDER THE LOCK — a copy read before it was taken is the one the other run changed. */
    clearCache();
    const log = read(TAB.digest_log);
    if (!log.sheet) return { mode: mode, error: 'The sheet has no digest_log tab. Run ensureSchema() (open /exec?setup=1) to add it. Nothing was sent.' };
    const week = digestWeekToSend_(now);
    const plan = digestPlanNow_(week);
    const reserve = digestReserve_(cfg);
    const out = { mode: mode, week: { start: week.start, end: week.end }, learners: plan.learners.length,
                  emails: plan.emails.length, previewed: 0, sent: 0, already: 0, held: 0, failed: 0,
                  unreachable: plan.unreachable.length, skipped: 0 };

    plan.emails.forEach(m => {
      const row = digestLogFind_(log, week.start, m.learner_id, m.parent_id);
      const was = norm(row && row.status);
      if (was === 'sent' || was === 'sending') { out.already++; return; }
      const v = { to: m.to, subject: m.subject, questions: m.count, at: new Date(), note: '' };
      if (mode === 'preview') {
        digestLogPut_(log, row, week.start, m.learner_id, m.parent_id, Object.assign(v, { status: 'preview' }));
        out.previewed++;
        return;
      }
      if (digestQuota_() <= reserve) {
        digestLogPut_(log, row, week.start, m.learner_id, m.parent_id,
          Object.assign(v, { status: 'held', note: 'daily mail quota — run weeklyDigestRun again tomorrow' }));
        out.held++;
        return;
      }
      const r = digestLogPut_(log, row, week.start, m.learner_id, m.parent_id, Object.assign(v, { status: 'sending' }));
      try { SpreadsheetApp.flush(); } catch (err) {}
      try {
        MailApp.sendEmail({ to: m.to, subject: m.subject, body: m.text, htmlBody: m.html, name: plan.look.brand || BRAND_NAME });
        setCells(log, r, { status: 'sent', at: new Date() });
        out.sent++;
      } catch (err) {
        setCells(log, r, { status: 'failed', note: S(err && err.message || err).slice(0, 200) });
        out.failed++;
      }
    });

    /* AND WHO WAS NOT TOLD, AND WHY — a row each, so the log answers both questions. A parent who
       asked not to be sent it is a row too; a parent with no address is in the learner's `note`. */
    plan.learners.forEach(L => {
      if (L.why) {
        const row = digestLogFind_(log, week.start, L.id, '');
        digestLogPut_(log, row, week.start, L.id, '', { to: '', subject: '', questions: L.count,
          status: 'not sent', at: new Date(), note: L.why });
        out.skipped++;
      }
      L.skipped.filter(p => p.why === 'asked not to get it').forEach(p => {
        const row = digestLogFind_(log, week.start, L.id, p.id);
        if (norm(row && row.status) === 'sent') return;
        digestLogPut_(log, row, week.start, L.id, p.id, { to: '', subject: '', questions: L.count,
          status: 'opted out', at: new Date(), note: 'weekly_email on their row says no' });
        out.skipped++;
      });
    });
    return out;
  } finally {
    lock.releaseLock();
  }
}

function digestLogFind_(log, weekStart, learnerId, parentId) {
  return log.rows.find(r => isoDate_(r.week_of) === weekStart && S(r.learner_id) === S(learnerId)
                             && S(r.parent_id) === S(parentId)) || null;
}
/* A ROW UPDATED, OR ONE ADDED. `week_of` is written as text — see SCHEMA.digest_log. */
function digestLogPut_(log, row, weekStart, learnerId, parentId, values) {
  if (row) { setCells(log, row, values); return row; }
  return addRow(log, Object.assign({ week_of: "'" + weekStart, learner_id: S(learnerId), parent_id: S(parentId) }, values));
}
function digestQuota_() {
  try { return Number(MailApp.getRemainingDailyQuota()) || 0; } catch (err) { return 0; }
}


/* ---------- BOOKING THE SUNDAY, BY HAND ---------------------------------------------------------------
   RUN FROM THE APPS SCRIPT EDITOR'S FUNCTION LIST, ONCE, AND BY NOBODY ELSE. Not from `installTriggers`,
   not from `?run=`, not from `doGet` — a trigger booked as a side effect of something else is a Sunday
   email nobody decided to start. `check-digest.js` reads the backend for a call to either and fails.

   THE OLD ONE GOES FIRST, the `installWarmTrigger` rule: run twice, it still leaves exactly one, and
   changing `weekly_digest_hour` is running this again. `inTimezone` says London out loud rather than
   trusting the project's own setting, so 18:00 stays 18:00 across the clocks changing.

   INSTALLED IS NOT ON. With `weekly_digest` at `off` the trigger fires every Sunday and returns at its
   first line; `preview` and `send` are a cell on the config tab, not another run of this. */
function installWeeklyDigest() {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const hour = digestHour_(cfg);
  const removed = removeWeeklyDigest().removed;
  ScriptApp.newTrigger(DIGEST_RUN).timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(hour)
    .inTimezone(DIGEST_TZ).create();
  const mode = digestMode_(cfg);
  return { installed: 'every Sunday at about ' + hour + ':00, London time', replaced: removed, mode: mode,
           means: mode === 'off' ? 'it runs and does nothing until weekly_digest on the config tab is preview or send'
                : mode === 'preview' ? 'it writes what it would send to the digest_log tab and sends nothing'
                : 'it EMAILS PARENTS' };
}
/* THE WAY BACK: every Sunday trigger of this handler, gone. Safe to run when there are none. */
function removeWeeklyDigest() {
  let n = 0;
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === DIGEST_RUN) { ScriptApp.deleteTrigger(t); n++; }
  });
  return { removed: n };
}
/* How many are booked, for the admin's card. Null when it cannot be asked. */
function digestScheduled_() {
  try { return ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === DIGEST_RUN).length; }
  catch (err) { return null; }
}


/* ---------- WHAT THE ADMIN'S PREVIEW IS SENT — `digestPreview` in dopost.gs -------------------------
   THIS WEEK SO FAR, and nothing written and nothing sent: the plan, rendered, for the card on the
   Settings column (js/digest.js). Every address is in it, which is why the action is `admin`. */
function digestPreviewOut_(now) {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const week = digestWeek_(now);
  const plan = digestPlanNow_(week);
  return {
    success: true, mode: digestMode_(cfg), hour: digestHour_(cfg), scheduled: digestScheduled_(),
    week: { start: week.start, end: week.end, span: digestSpan_(week) },
    learners: plan.learners.map(L => ({ id: L.id, name: L.name, count: L.count, fresh: L.fresh.length,
      again: L.again.length, to: L.to.map(p => p.name), why: L.why })),
    emails: plan.emails.map(m => ({ learner: m.learner, parent: m.parent, to: m.to, subject: m.subject,
      text: m.text, html: m.html, count: m.count })),
    unreachable: plan.unreachable,
  };
}
