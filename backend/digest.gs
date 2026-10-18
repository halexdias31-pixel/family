/* ==================================================================================================
   @family. — digest.gs   THE SUNDAY PARENT EMAIL, AND THE MARKS IN IT

   ASKED FOR AS *"i need you to make something which triggers every sunday. it checks what the student
   has done that week and records the questions and send it in an email to parents. for now dont
   actually make it but make the infrastructure to set it up so that in the future we will actually
   wire it up and make it properlly."* BUILT AND SWITCHED OFF on that (docs/history/280), and on 12 Oct
   made to go: *"i want to ensure that this sunday she will recieve autimatic email as all parents, with
   linked emails, for her childs progress. they dont need to see usernames or whatever, all they need to
   see are the questions their kids have done this week ... i want them to see if they got it right
   too. for this i need th ai marking to be working too."* See docs/history/348.

   WHAT THE OWNER DOES, ONCE, IN THE APPS SCRIPT EDITOR — and nothing in code does any of it (the same
   steps, in the same order, as docs/history/348):
     1. the backend deployed (the GitHub Assistant extension — CLAUDE.md's route 1), then Deploy → Manage
        deployments → New version, so the site's own requests run it too;
     2. (optional) `ensureSchema` — `/exec?setup=1` — so the config tab gains `weekly_digest_marking` with
        its note; blank is on without it;
     3. `weekly_digest` on the config tab to `send` (`off` until somebody types otherwise, CONFIG_DEFAULTS;
        `preview` writes the `digest_log` tab and emails nobody);
     4. `installWeeklyDigest` run once: the Sunday email, and the two AI marking passes beside it — and run
        AGAIN whenever `weekly_digest_hour` changes (21, 9pm, since 18 Oct: *"On Sunday @9pm"*), because a
        booked trigger keeps its hour. Nothing in this project calls it, and `check-digest.js` fails if
        anything starts to;
     5. `checkSundayEmail` run, which changes nothing and says, in words, whether all of it is ready.

   WHAT THE EMAIL SAYS — NOTHING BUT WHAT A PARENT NEEDS (12 Oct). The child's FIRST name, the week, and
   every question the child sent an answer to that week, each with its own words and how it went: ✓, ✗,
   the AI's "3 of 4 marks", or "not marked". No handle, username, sign-in name, id, PIN or surname — the
   net in `mailOut_` is told to leave a whole name as the first name alone (`firstNamesOnly`), so not even
   a question that names a child can put a handle in it. "New this week" against "gone back to", the
   link to the site and the word `sent` (the server's word for an answer nothing marked) were cut.
   AND EACH QUESTION AS IT IS ON THE SITE (18 Oct, docs/history/351): *"So each question As is on site."* A
   question the library has is printed from its row, as the question card draws it — the preamble its
   parts share once, each part's number and marks over ALL of its words, then the child's mark — and its
   picture is the drawing's PNG twin on the site (`data/diagrams/`, written by tools/diagram_png.js),
   shown in the body and never attached (*"No jpgs."*). A question the library has not got goes as the
   words its submission carried, as before. `digestPartOut_` and `digestDiagram_`, below.
   It is the only parent email since 8 Oct: the one after each session, then every day of work
   (docs/history/291, 294), was deleted, and what it had that parents should get is here — every
   question with its words (`digestQuestions_`), and the words plumbing (`words`, `digestWordsSafe_`).

   WHAT IT READS: `submissions` — one row per answer a learner SENT, with its verdict and the server's
   time (SCHEMA.submissions, `submitAnswer`). A question is in a learner's week when any of its
   submissions is, by London's calendar, and the email shows its LATEST verdict of the week. Every press
   is a row, so a run days late still finds the week whole (docs/history/308).

   AND THE MARKS IN IT ARE MADE BEFORE IT GOES (`digestMarkPass_`, below). An answer the phone could not
   mark — a worded one sent while AI marking was off, a maths one with nothing to Check against — is
   `sent`. Nightly; from an hour before the email, again and again until it is close; and once more as
   the email goes, the pass asks the same Gemini marker Mark with AI asks (`aiMarkAsk_`, dopost.gs) for
   each one, with the question and the scheme it fetches from the site's own copy of the library, and
   appends the mark as a row the way a press would — so the child sees it on their phone the next
   morning, and the parent reads it on Sunday. It spends the key's Gemini quota
   and never a child's `ai_marks_per_day`. An answer it cannot mark (no scheme, a drawing, a pick with no
   right answer, Gemini refusing) stays unmarked, and the email says "not marked".

   WHO IT GOES TO, AND THE ONE RULE THAT MATTERS: a learner's ACCEPTED parents with an address
   (`acceptedParents` — a link the child said yes to, on the `family` tab), and nobody else. Not a
   pending or refused link, not the learner, not a tutor, not whoever shares a surname. A learner with
   no such parent is listed as unreachable and emailed to nobody; a parent whose `weekly_email` cell
   says no is skipped. One email per parent per learner, so two children are two emails and each one
   is about one child.

   FILE ORDER. Functions only, like every file but constants.gs: Apps Script joins the files in an
   order nobody chooses, and a top-level `const` here could be read before it exists. Its constants —
   `DIGEST_MODES`, `DIGEST_TZ`, `DIGEST_RUN`, `DIGEST_MARK_*`, `DIGEST_LIBRARY_PATH` and the rest — are
   in constants.gs for that reason.
================================================================================================== */


/* ---------- THE SWITCH, AND THE TWO NUMBERS BESIDE IT ------------------------------------------------
   EACH WITH A FALLBACK, and each fallback is the safe answer: a blank, a typo or a missing config tab
   is `off`, 21:00 (the owner, 18 Oct: *"On Sunday @9pm"*) and a reserve of 10. `send` has to be spelled exactly, because it is the only one
   of the three that reaches somebody's inbox. */
function digestMode_(cfg) {
  const m = norm(cfg && cfg.weekly_digest);
  return DIGEST_MODES.indexOf(m) !== -1 ? m : 'off';
}
function digestHour_(cfg) {
  const c = S(cfg && cfg.weekly_digest_hour);
  return /^\d{1,2}$/.test(c) && Number(c) <= 23 ? Number(c) : 21;
}
function digestReserve_(cfg) {
  const c = S(cfg && cfg.weekly_digest_reserve);
  return /^\d+$/.test(c) ? Number(c) : 10;
}


/* ---------- WHAT A WEEK IS: MONDAY 00:00 TO SUNDAY 23:59, LONDON ---------------------------------------
   LONDON BECAUSE THAT IS WHOSE CALENDAR THE EMAIL IS ON. A submission's `submitted_at` is an instant,
   and `digestDay_` turns it into London's `yyyy-MM-dd` — so the week is a run of those strings, and
   comparing strings is all the selection does. MONDAY TO SUNDAY because the email goes on
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
   PURE. Everything it needs is handed in — the submissions rows, the people rows, a `parentsOf(id)` that
   answers with person rows, and `look` (the business's name and the site's address) — and it reads no
   tab, sends nothing and writes nothing. So the same function is the Sunday run, the admin's Preview
   and the check, and none of the three can be looking at a different rule.

   `parentsOf` IS `acceptedParents` everywhere but the check, rather than this walking `family` itself:
   a second reader of who is whose parent is the one that drifts (see `childrenOf` in people.gs, twice).

   Returns `{ week, learners, emails, unreachable, look }`:
     learners     one per learner who did anything this week — the questions, new and again, who is told
     emails       one per parent per learner, rendered: `to`, `subject`, `text`, `html`
     unreachable  learners nobody can be told about, each with the reason in words

   IT TOOK A RENDER AND AN OPT-OUT COLUMN AS WELL, for the email after each session, which ran this
   with a "week" one day long. That email is gone (docs/history/295), and so are the two arguments. */
function digestPlan_(week, subRows, peopleRows, parentsOf, look) {
  const byId = {};
  (peopleRows || []).forEach(p => { const id = S(p && p.person_id); if (id && !byId[id]) byId[id] = p; });

  /* ONE QUESTION, HOWEVER MANY BOXES IT HAS. A practical's worksheet is three answer boxes, each
     sent under the practical's key with its slot on the end (`pr:…#iv`, `#dv`, `#cv` — see `guideBox_`
     in js/find.js), so one worksheet filled in was three rows and an email saying "3 questions" with
     three raw keys in it. Rows are joined on the key before the `#`. */
  /* AND NO "60 min" IN A NAME. A practical's card line is `Biology · Required practical · 60 min`, and
     the phone built its name from that line, so a parent read how long the card guesses a practical
     takes as though it were how long their child spent on it. The phone no longer sends it
     (`doneLabel_` in js/find.js); a row written before it stopped may still carry it, and it comes out
     here, where the email reads every label. */
  const tidy = v => attemptLabel_(v).split(' · ').filter(x => !/^\d+ min$/.test(x)).join(' · ');
  /* ---------- EVERY PRESS, FOLDED INTO ONE LINE PER QUESTION ------------------------------------------
     IN THE WEEK by its London day — the day it ARRIVED (`submitted_at`, the server's clock: a phone's
     clock is wrong on enough iPads to put a Sunday's work in the wrong week). BEFORE THE WEEK makes it
     "gone back to" — the child had sent an answer to it before Monday. AFTER THE WEEK is next week's,
     and changes nothing here, so a run days late sees the week as it was. THE VERDICT is the week's
     latest PRESS — the latest `pressed_at` (`submitted_at` on a row without one), and of two in the same
     instant the later row: *"it will leave the latest event up"*. The card and the box order presses the
     same way (`submissionsBuild_` in doget.gs), so a parent's mark and the child's card cannot disagree —
     and a phone's whole queue flushed in one request, every row with one `submitted_at`, is still in
     the order it was pressed. THE NAME AND THE WORDS are the latest ones any of its rows carries up to
     the end of the week — a row whose phone sent none does not blank the name an earlier row gave it.
     A ROW CARRIED OVER FROM BEFORE THE SWITCH arrives the week the backend lands and is not that week's
     work: it is "before" whatever its arrival (`SUBMISSION_CARRIED`, review of 10 Oct). */
  const joined = {};
  (subRows || []).forEach(r => {
    const pid = S(r && r.person_id), q = S(r && r.key).split('#')[0];
    if (!pid || !q) return;
    const came = answerAtMs_(r.submitted_at);
    if (!came) return;
    const ms = answerAtMs_(r.pressed_at) || came;
    const day = digestDay_(new Date(came));
    if (day > week.end) return;
    const id = pid + '\u0001' + q;
    const J = joined[id] || (joined[id] = { pid: pid, key: q, before: false, inWeek: false, at: -1, last: '',
                                            verdict: '', label: '', labelAt: -1, words: '', wordsAt: -1 });
    const l = tidy(r.label), w = attemptWords_(r.words);
    if (l && ms >= J.labelAt) { J.label = l; J.labelAt = ms; }
    if (w && ms >= J.wordsAt) { J.words = w; J.wordsAt = ms; }
    /* WORK CARRIED OVER FROM BEFORE THE SWITCH IS HISTORY, WHENEVER IT ARRIVED (`SUBMISSION_CARRIED`): never
       this week's work, and what makes a press of the same question this week "(again)". Its name and words
       still count, above — they are the question's. */
    if (SUBMISSION_CARRIED.test(S(r.event_id))) { J.before = true; return; }
    if (day < week.start) { J.before = true; return; }
    J.inWeek = true;
    if (ms >= J.at) { J.at = ms; J.last = day; J.verdict = S(r.verdict); }
  });

  const per = {};
  Object.keys(joined).forEach(id => {
    const J = joined[id];
    if (!J.inWeek) return;
    const fresh = !J.before;
    const L = per[J.pid] || (per[J.pid] = { id: J.pid, fresh: [], again: [] });
    /* THE NAME A PARENT CAN READ — see SCHEMA.submissions for why the backend cannot look a key up for
       itself. BUT ONLY TEXT THAT CANNOT PASS FOR A MESSAGE FROM THE BUSINESS: the label came off a
       phone, and printed under "@family." a label reading "NOTICE: fees overdue, pay at https://…" is
       the business saying it. `digestSafe_` turns away anything with a link or an address in it.
       NEVER THE KEY IN ITS PLACE: this printed a key in the library's shape when there was no name,
       until the email listed each question with its words — and `q:Q-9MA031-2206-1` among them reads
       to a parent as a fault. A question with no printable name is counted and not listed — it is in
       "…and N more" — rather than dropped, so the number the email gives stays true. */
    const label = digestSafe_(J.label) ? J.label : '';
    /* AND THE QUESTION'S WORDS (SCHEMA.submissions), by the same rule over the whole of them: phone text
       with a link or an address in it is not printed (`digestWordsSafe_`). Blank is a real answer — a
       row whose phone sent none — and the name stands alone. AND ONLY UNDER A KEY IN THE LIBRARY'S OWN
       SHAPE: an invented key cannot carry a paragraph. */
    const words = label && DIGEST_KEY_SHAPE.test(J.key) && digestWordsSafe_(J.words) ? J.words : '';
    /* AND HOW IT WENT, the week's last word on it — a verdict outside the vocabulary prints no mark. */
    const verdict = SUBMISSION_VERDICT.test(J.verdict) ? J.verdict : '';
    const item = { key: J.key, label: label, words: words, hidden: !label, last: J.last, verdict: verdict };
    (fresh ? L.fresh : L.again).push(item);
  });

  const order = (a, b) => (a.last < b.last ? -1 : a.last > b.last ? 1 : a.label < b.label ? -1 : a.label > b.label ? 1 : 0);
  const learners = [], emails = [], unreachable = [];
  Object.keys(per).forEach(pid => {
    const L = per[pid];
    L.fresh.sort(order); L.again.sort(order);
    L.count = L.fresh.length + L.again.length;
    const me = byId[pid];
    /* `nameFor_` — the admin's Preview names a child by first name like everything else (the owner,
       10 Oct: *"dont show children's last name"*); the email itself only ever said `L.first`. */
    L.name = me ? nameFor_(me) : '';
    /* THE CHILD'S FIRST NAME GOES IN THE SUBJECT LINE, and it is a cell the child can edit. A name
       that is a link, an address or a sentence is "Your child" instead. */
    L.first = me && digestSafe_(me.first_name) && S(me.first_name).length <= 30 ? S(me.first_name) : '';
    L.to = []; L.skipped = []; L.why = '';
    if (!me) {
      L.why = 'not on the people tab';
    } else {
      const R = digestReach_(pid, parentsOf);
      L.to = R.to; L.skipped = R.skipped;
      /* THE REASON IN WORDS, naming each parent, because "unreachable" alone sends the owner to the
         family tab to work out which of three things it is. */
      if (!L.to.length) {
        L.why = !R.linked ? 'no parent has accepted a link to them'
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


/* ---------- WHICH OF A LEARNER'S PARENTS IS TOLD, AND WHY NOT THE REST -------------------------------------
   LIFTED OUT OF `digestPlan_` UNCHANGED (the review of 12 Oct), so `checkSundayEmail` can ask it of a child
   who has done nothing yet this week — *"ensure that this sunday she will recieve"* is a question about a
   parent before it is a question about a week of work, and one rule read in two places is the drift
   `addressPending_` was written to end. Returns `{ to, skipped, linked }`. */
function digestReach_(pid, parentsOf) {
  let parents = [];
  try { parents = parentsOf(pid) || []; } catch (err) { parents = []; }
  const to = [], skipped = [], seenId = {}, seenMail = {};
  let linked = 0;
  parents.forEach(p => {
    const id = S(p && p.person_id);
    /* NEVER THE LEARNER, whatever the family tab says — a row linking somebody to themselves is a
       typo, and "not emailed to themselves" is the rule. */
    if (!id || id === pid || seenId[id]) return;
    seenId[id] = 1;
    linked++;
    const who = { id: id, name: personDisplayName(p), first: S(p.first_name), email: S(p.email) };
    if (!who.email) { skipped.push(Object.assign(who, { why: 'no email address' })); return; }
    /* NEVER AN ADDRESS NOBODY CONFIRMED. `verified=PENDING` is a sign-up whose link was never
       clicked — a typo'd address, as often as not, which is a stranger's inbox. An admin's
       `linkChild` writes `accepted` without asking the address anything, so the link alone is
       no proof, and every Sunday a stranger would be told about somebody's child. Blank is an
       account from before verification existed, and is not pending. `addressPending_` (people.gs)
       is this rule for every mail now, so the digest and `notify` cannot disagree about it. */
    if (addressPending_(p)) { skipped.push(Object.assign(who, { why: 'email not confirmed' })); return; }
    /* THEIR OWN CHOICE, through the one reader every sender asks (`wants_` in people.gs) — still the
       `weekly_email` cell, blank is yes, and now also the Weekly progress email tick on the parent's
       Notifications card (`setNotify`). It read `ON_(p.weekly_email)` itself until 9 Oct; one rule
       read in two places is the drift `addressPending_` was written to end. */
    if (!wants_(p, 'weekly')) { skipped.push(Object.assign(who, { why: 'asked not to get it' })); return; }
    /* ONE MAILBOX ONCE PER CHILD, if two parent rows share an address. */
    const m = norm(who.email);
    if (seenMail[m]) { skipped.push(Object.assign(who, { why: 'same address as another parent' })); return; }
    seenMail[m] = 1;
    to.push(who);
  });
  return { to: to, skipped: skipped, linked: linked };
}

/* ---------- ONE EMAIL: A SUBJECT, A PLAIN BODY AND THE SAME IN HTML -----------------------------------
   THE QUESTIONS DONE THIS WEEK AND HOW THEY WENT, AND NOTHING ELSE. The owner, 12 Oct: *"they dont need
   to see usernames or whatever, all they need to see are the questions their kids have done this week
   ... i want them to see if they got it right too."* So: a greeting, one paragraph saying who and which
   week and what the marks mean, the list, and one line in small print saying why it came and how to
   stop it. CUT ON 12 OCT, each because it was not that: the parent's own name in the greeting (a cell
   is a cell; "Hello," says the same), "— 3 new and 1 gone back to" and "(again)" (the site's split, not
   a parent's — a question done again this week is a question done this week, in the one list), and
   "Kit can see them on the site: <link>" (a link in an email from a tutor is the thing parents are told
   not to press, and the child, not the parent, is who can see them).

   HOW EACH ONE WENT, BESIDE ITS NUMBER (`digestMark_`): ✓, ✗, the AI's "3 of 4 marks", or "not marked".
   It said `sent` where nothing could mark an answer — the server's word for it, which a parent read as
   "handed in, and that is all anybody knows" at best. Since the marking pass (`digestMarkPass_`) nearly
   everything worded IS marked by Sunday, and what is left says plainly that it was not.
   THE KEY IS SAID ONCE, in the lead, and only for the marks the list has: a week of ticks needs no
   sentence about an AI marker.

   THE PLAIN BODY IS NOT AN AFTERTHOUGHT. MailApp sends both and a mail client shows whichever it
   prefers; the plain one is also what the admin's Preview prints. Every value in the HTML goes through
   `digestEsc_` — a label came off a phone. THE FIRST NAME ONLY — `digestPlan_` has already turned away
   one that is not a name — and never the full display name in its place, which is built from the same
   editable cells; and `digestMail_` sends it with `firstNamesOnly`, so the net in `mailOut_` cannot add
   a handle either. */
function digestRender_(L, P, week, look) {
  const brand = S(look && look.brand) || BRAND_NAME;
  const kid = S(L.first) || 'Your child';
  const items = (L.fresh || []).concat(L.again || []);
  const n = items.length;
  const qs = x => x + ' question' + (x === 1 ? '' : 's');
  /* "WORKED ON", NOT "DID". A submission is any answer sent — a wrong one, a one-word one, one nothing
     could mark. A parent reads "did" as finished work; the marks beside the numbers say how it went.

     AND "UP TO" THE MOMENT THE LIST WAS MADE (`look.hour` and `look.minute`, `digestLook_`). A question
     sent after the run is in nobody's email: next week's starts on the Monday. Said rather than hidden,
     so "this week" is not a claim to the whole of Sunday. IT SAID THE BOOKED HOUR, "up to 6pm", and the
     trigger fires anywhere near it: a run at 18:40 listed an answer from 18:20 under "up to 6pm", and one
     booked at 18:00 with the cell since changed to 20 promised "up to 8pm" (the review of 12 Oct). Now it
     is the run's own London time, so it is true whenever Google starts it. */
  const hour = look && typeof look.hour === 'number' ? look.hour : -1;
  const minute = look && typeof look.minute === 'number' && look.minute > 0 && look.minute < 60 ? look.minute : 0;
  const clock = minute ? ((hour % 12) || 12) + ':' + String(minute).padStart(2, '0') + (hour < 12 ? 'am' : 'pm')
    : hour === 0 ? 'midnight' : hour === 12 ? 'noon' : (hour % 12) + (hour < 12 ? 'am' : 'pm');
  const upTo = hour >= 0 && hour <= 23 ? ', up to ' + clock + ' on Sunday' : '';

  /* THE WEEK'S QUESTIONS, AT MOST `DIGEST_WEEK_LIST_MAX`, THEN "…and N more." A question with no name
     `digestPlan_` would print — hidden, or only its own key — is counted in `n` and never listed, so it
     is part of the "more". */
  /* EACH QUESTION AS IT IS ON THE SITE when the library has it (`look.lib`, 18 Oct) — see `digestPartOut_`. */
  const opts = { lib: look && look.lib, site: S(look && look.site) || SITE_URL, kid: kid, cut: {} };
  /* THE BUSINESS'S NAME ENDS IN A FULL STOP, so it is the last word of its sentence and never followed by
     more punctuation — "on @family.." is what it reads as anywhere else. THE SWITCH IS ON THE SITE (9 Oct),
     so the footer names it first — a reply still works, and is what somebody who never signs in will do. */
  const foot = 'You get this because you are ' + (S(L.first) ? kid + '’s parent' : 'a parent') + ' on ' + brand + (/[.!?]$/.test(brand) ? '' : '.')
    + ' To stop these emails, untick Weekly progress email in Settings → Notifications on the site, or reply to this one and say so.';
  const subject = kid + '’s week: ' + qs(n);
  const make = Q => {
    /* THE KEY IS SAID FOR THE MARKS THE LIST PRINTS — not every item of the week. It was built from all of
       them, and a week whose questions all had no printable name got "Beside each one is how it went: ✓
       right or ✗ wrong." over no list at all (the review of 12 Oct). AND A LIST WITH NOTHING IN IT SAYS SO:
       the count stays true, and the parent is told why there is nothing under it. */
    const legend = [];
    if (Q.marks.indexOf('✓') !== -1) legend.push('✓ right');
    if (Q.marks.indexOf('✗') !== -1) legend.push('✗ wrong');
    if (Q.marks.some(m => / of \d+ marks?$/.test(m))) legend.push('the marks an AI marker gave a written answer');
    const said = legend.length < 2 ? legend.join('')
      : legend.slice(0, -1).join(', ') + (legend.length > 2 ? ',' : '') + ' or ' + legend[legend.length - 1];
    const unnamed = n && !Q.printed
      ? (n === 1 ? ' It could not be named here, so it is not listed.' : ' They could not be named here, so they are not listed.')
      : '';
    /* "BESIDE" WHILE EVERY MARK IS BESIDE ITS NUMBER; a question printed from the library has its words first
       and the child's mark under them, so a list with one says where without saying either. */
    const lead = kid + ' worked on ' + qs(n) + ' this week (' + digestSpan_(week) + upTo + ').'
      + (said ? (Q.fromLib ? ' How each one went: ' : ' Beside each one is how it went: ') + said + '.' : '') + unnamed;
    return {
      text: ['Hello,', '', lead, ''].concat(Q.lines, [foot]).join('\n'),
      html: '<div style="font-family:Georgia,serif;font-size:16px;line-height:1.5;color:#222;max-width:560px">'
        + '<p>Hello,</p><p>' + digestEsc_(lead) + '</p>' + Q.html
        + '<p style="color:#666;font-size:13px">' + digestEsc_(foot) + '</p></div>',
    };
  };
  let Q = digestQuestions_(items, DIGEST_WEEK_LIST_MAX, opts), m = make(Q);
  /* ---------- AND UNDER GMAIL'S CLIP, EVERY QUESTION KEPT ------------------------------------------------------
     Past about 102 KB of HTML Gmail shows "[Message clipped]", and what is behind it — the end of the list and
     the footer that says how to stop — nobody reads. Whole words for a week of whole papers can pass it, so the
     longest SHARED SOURCE TEXTS go first, said as "(the source text is on the site)", then, only if that is not
     enough, the longest parts' words, as "(the question’s words are on the site)" — each question still listed
     with its number, its picture and its mark. A picture is a link and weighs nothing here. Cut a few at a time,
     by what they weigh against what is over, so it is a render or two and not one per question. */
  for (let turn = 0; turn < 12 && digestBytes_(m.html) > DIGEST_CLIP_BYTES; turn++) {
    let over = digestBytes_(m.html) - DIGEST_CLIP_BYTES;
    const next = Q.sizes.filter(z => z.bytes && !opts.cut[z.id])
      .sort((a, b) => (a.kind === b.kind ? b.bytes - a.bytes : a.kind === 'stem' ? -1 : 1));
    if (!next.length) break;
    for (let k = 0; k < next.length && over > 0; k++) { opts.cut[next[k].id] = 1; over -= next[k].bytes - 80; }
    Q = digestQuestions_(items, DIGEST_WEEK_LIST_MAX, opts);
    m = make(Q);
  }
  return { subject: subject, text: m.text, html: m.html };
}

/* ---------- THE QUESTIONS, EACH WITH ITS OWN WORDS ----------------------------------------------------------
   *"with the exact questions for each"*. A heading per paper (the label before its last ` · `), then a
   line per question: its number, how it went, and what it asked (SCHEMA.submissions `words`). The stem a
   question's parts share is printed ONCE, above the first of them — `words` is the stem, a `---` line,
   then the part's own ask — so Q5a, Q5b and Q5c read as the paper prints them rather than as one scene
   three times. Each is cut to what reads on a phone (`DIGEST_WORDS_SHOWN`, `DIGEST_STEM_SHOWN`).
   Headings sort alphabetically, numbers as numbers (Q2 before Q10).

   THE MARK IS THE WEEK'S LATEST VERDICT, beside the number (`digestMark_`): `Q5a ✓: Find P(red).`,
   `Q7 3 of 4 marks: …`, `Q3 not marked: …`. The owner, 9 Oct: *"Just whether it's right or not."* A
   question with no number carries its mark alone, ahead of its words. ONE LIST since 12 Oct: it took the
   week's new questions and the ones "gone back to" apart and tagged the second "(again)" — the site's
   distinction, not a parent's.

   A PAPER WITH NO WORDS FOR ANY OF ITS QUESTIONS — rows marked before the phone sent them — is a line of
   numbers, `Q3 ✓, Q7 not marked`.

   AND SINCE 18 OCT A QUESTION THE LIBRARY HAS IS NOT CUT AT ALL: `o.lib` (`digestEmailLibrary_`) holds its
   row, and it is printed whole, as the site's card draws it (`digestPartOut_`) — `Q5a · 2 marks`, its words,
   its picture, then `Kit: ✓`. The cuts above, and the words cell, are for a question it has not got.

   A RAW KEY NEVER GOES IN THE EMAIL. A question with no printable name — no label, an unsafe one
   (`digestPlan_` blanks it), or one that is only its own key — is counted and not listed: it is in
   "…and N more", which is printed only under a list that named something.

   WRITTEN FOR THE DAILY EMAIL (docs/history/294) and LIFTED OUT UNCHANGED when the owner made the weekly
   one the email parents get (295).

   PURE. `items` are `digestPlan_`'s (`key`, `label`, `words`, `hidden`, `verdict`); `o` is `{ lib, site, kid,
   cut }` — the library's rows, the site's address, the child's first name and what the clip said as "on the
   site" (`digestRender_`). Returns
     lines    the plain body's lines for the list — per paper its heading, its questions and a blank
              line, then "…and N more." and a blank line when something was left out of a list that
              named anything
     html     the same list, every value through `digestEsc_`
     printed  how many questions it names (a one-segment name with no words names its one question)
     marks    the mark of each one it names — what the lead's key is built from
     more     how many it does not: hidden, only a key, or past `max`
     fromLib  how many it printed from the library, as the site draws them
     sizes    what the clip may say as "on the site" instead — each stem and part printed whole, and its bytes */
function digestQuestions_(items, max, o) {
  items = items || [];
  o = o || {};
  const n = items.length;
  /* THE LIBRARY'S ROWS FOR THE WEEK (`digestEmailLibrary_`), and what the clip has asked to be said as "on
     the site" (`digestRender_`): `stem:<row_id>` and `part:<key>`. No library — a run that could not fetch
     it, the admin's Preview, a check — is every question by its words cell, as before 18 Oct. */
  const lib = o.lib && o.lib.rows ? o.lib : null, pre = lib && lib.pre ? lib.pre : [];
  const said = o.cut || {}, kid = S(o.kid) || 'Your child', site = S(o.site) || SITE_URL;
  const cut = (t, most) => { const x = S(t).replace(/\s*\n+\s*/g, ' ').trim(); return x.length > most ? x.slice(0, most - 1).replace(/\s+\S*$/, '') + '…' : x; };
  const heads = {};
  items.forEach(q => {
    const label = S(q && q.label);
    if (!label || (q && q.hidden) || label === S(q && q.key)) return;
    const bits = label.split(' · ');
    const head = bits.length > 1 ? bits.slice(0, -1).join(' · ') : label;
    const num = bits.length > 1 ? bits[bits.length - 1] : '';
    /* THE STEM AND THE ASK, either side of a `---` line — which may be the last line, when a part's own
       ask is only its picture and the cell was trimmed. */
    const w = S(q && q.words), cutAt = /\n---(?:\n|$)/.exec(w);
    (heads[head] || (heads[head] = [])).push({ mark: digestMark_(q && q.verdict), key: S(q && q.key), row: digestLibRow_(lib, q && q.key),
      num: num, stem: cutAt ? w.slice(0, cutAt.index) : '', ask: cutAt ? w.slice(cutAt.index + cutAt[0].length) : w });
  });
  /* A CAP THAT IS NOT A NUMBER IS THE WEEK'S, never "all of them": `slice(0, undefined)` is the whole
     list, and the cap is what keeps an email under the size a mail client clips it at. */
  let room = typeof max === 'number' && max >= 0 ? max : DIGEST_WEEK_LIST_MAX, printed = 0;
  const shown = [];
  Object.keys(heads).sort((a, b) => a.localeCompare(b)).forEach(h => {
    if (room <= 0) return;
    const list = heads[h].slice().sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true }));
    const take = list.slice(0, room);
    room -= take.length; printed += take.length;
    shown.push({ head: h, items: take, worded: take.some(it => S(it.ask) || it.row) });
  });
  const more = n - printed;
  /* A NAME OF ONE SEGMENT HAS NO NUMBER, so no number in its tag: its mark alone, and its words after —
     never ": What is 7 × 8?". */
  const tag = it => (it.num ? it.num + ' ' + it.mark : it.mark);
  /* IN THE HTML THE MARK HAS A COLOUR OF ITS OWN — green ✓, red ✗, blue marks, grey "not marked" — because
     on the first render (a week of seven, at 390 px) "Q5 20 of 40 marks — Your local newspaper…" read as
     one sentence, and the mark is the thing a parent scans the list for. The glyphs differ as well as the
     colours, so nothing rests on the colour alone; the plain body has the same words without it. */
  const tone = m => (m === '✓' ? 'color:#1a7f37;font-weight:bold' : m === '✗' ? 'color:#b42318;font-weight:bold'
    : m === 'not marked' ? 'color:#767676;font-style:italic' : 'color:#1d4ed8;font-weight:bold');
  const tagHtml = it => (it.num ? '<b>' + digestEsc_(it.num) + '</b> ' : '') + '<span style="' + tone(it.mark) + '">' + digestEsc_(it.mark) + '</span>';

  const lines = [];
  const parts = [];
  /* WHAT THE CLIP MAY SAY AS "ON THE SITE" INSTEAD, with what its words weigh — `digestRender_` picks from it. */
  const sizes = [];
  let fromLib = 0;
  shown.forEach(h => {
    if (!h.worded) {
      /* A NAME OF ONE SEGMENT WITH NO WORDS IS ITS HEADING AND NOTHING ELSE, so its mark goes on the heading
         ("Times tables: ✓") rather than alone on a line under it; numbered ones are the line of numbers. */
      const bare = h.items.filter(it => !it.num), numbered = h.items.filter(it => it.num);
      const head = h.head + (bare.length ? ': ' + bare.map(it => it.mark).join(', ') : '');
      lines.push(head);
      let html = '<p style="margin:20px 0 4px"><b>' + digestEsc_(h.head) + '</b>' + (bare.length ? ': ' + bare.map(tagHtml).join(', ') : '') + '</p>';
      if (numbered.length) {
        lines.push(numbered.map(tag).join(', '));
        html += '<p style="margin:0 0 8px">' + numbered.map(tagHtml).join(', ') + '</p>';
      }
      lines.push('');
      parts.push(html);
      return;
    }
    lines.push(h.head);
    let html = '<p style="margin:20px 0 4px"><b>' + digestEsc_(h.head) + '</b></p>';
    let stem = '';
    const done = {};
    h.items.forEach(it => {
      /* ---------- AS IT IS ON THE SITE (18 Oct): the row the card draws, from the library ---------- */
      const P = it.row ? digestPartOut_(it, pre, done, said, site) : null;
      if (P) {
        fromLib++;
        P.stems.forEach(st => { lines.push.apply(lines, st.lines); html += st.html; sizes.push({ id: st.id, kind: 'stem', bytes: st.bytes }); });
        if (P.bytes) sizes.push({ id: 'part:' + it.key, kind: 'part', bytes: P.bytes });
        const head = [it.num, P.marks].filter(Boolean).join(' · ');
        if (head) lines.push(head);
        lines.push.apply(lines, P.lines);
        lines.push(kid + ': ' + it.mark, '');
        html += (head ? '<p style="margin:18px 0 4px">' + (it.num ? '<b>' + digestEsc_(it.num) + '</b>' : '')
                 + (it.num && P.marks ? ' · ' : '') + digestEsc_(P.marks) + '</p>' : '')
          + P.html + '<p style="margin:4px 0 0">' + digestEsc_(kid) + ': <span style="' + tone(it.mark) + '">' + digestEsc_(it.mark) + '</span></p>';
        stem = '';
        return;
      }
      if (it.stem && it.stem !== stem) {
        lines.push(cut(it.stem, DIGEST_STEM_SHOWN));
        html += '<p style="margin:0 0 8px;color:#555"><i>' + digestEsc_(cut(it.stem, DIGEST_STEM_SHOWN)) + '</i></p>';
      }
      stem = it.stem;
      const said1 = cut(it.ask, DIGEST_WORDS_SHOWN);
      lines.push(said1 ? tag(it) + ': ' + said1 : tag(it));
      html += '<p style="margin:0 0 8px">' + tagHtml(it) + (said1 ? ' — ' + digestEsc_(said1) : '') + '</p>';
    });
    if (lines[lines.length - 1] !== '') lines.push('');
    parts.push(html);
  });
  if (printed && more > 0) lines.push('…and ' + more + ' more.', '');
  const marks = [];
  shown.forEach(h => h.items.forEach(it => marks.push(it.mark)));
  return { lines: lines, html: parts.join('') + (printed && more > 0 ? '<p>…and ' + more + ' more.</p>' : ''),
           printed: printed, marks: marks, more: more, fromLib: fromLib, sizes: sizes };
}

/* ---------- ONE QUESTION AS THE SITE'S CARD DRAWS IT (18 Oct) ---------------------------------------------------
   The owner, 18 Oct: *"So each question As is on site."* — and, of the version before it, *"No jpgs."*: the
   pictures in the body of the email, never attached. So a question in the library is printed from its row,
   the way the question card draws it (js/find.js): every preamble it sits under, outermost first, ONCE in a
   paper however many of its parts the child did (`questionStemCard_` — `done` is the paper's list), each
   with its own picture after its words unless the row marks where the picture stands; then the part — its
   number and its marks over its words, as the card's tags are, then its lead, its picture and its words in
   the order `partPlan_` lays them out (a `<!--fig-->` marker where the row has one; after a lead; else in
   front of the words) — ALL of its words, never cut and never "…". The markup goes through `digestHtml_`'s
   allow-list; a picture is `digestDiagram_`'s PNG twin of the drawing, a link and never an attachment.

   NULL WHEN THE ROW CANNOT BE PRINTED SO — its words hold what `DIGEST_WORDS_REFUSE` turns away (a link, an
   address, a number shaped like an account), which in a parent's inbox is a link a tutor sent — and the
   question goes as its words cell, as before. A STEM SO REFUSED, or one the clip took (`said`), is "(the
   source text is on the site)": the parts still read in order, and the picture, a link, still shows. */
function digestPartOut_(it, pre, done, said, site) {
  const q = it.row;
  const refused = t => DIGEST_WORDS_REFUSE.some(re => re.test(t));
  /* EACH PIECE ON ITS OWN — the lead is a block of its own on the card (`.qsheet-lead`), and run together with
     the words "…of the source." and "Read again…" read as "source.Read", which is a domain to the refusal. */
  if ([q.lead, q.html].some(h => refused(digestText_(h)))) return null;
  const fig = digestDiagram_(q.diagram, site);
  /* WHERE THE PICTURE STANDS AMONG THE WORDS — `figBlocks_` / `partPlan_` in js/find.js: after the words before
     a `<!--fig-->` marker; else after the lead; else in front of the words. */
  const mark = /<!--\s*fig\s*-->/i, html = S(q.html), at = html.search(mark);
  const lead = S(q.lead).replace(/<!--\s*fig\s*-->/gi, '');
  const before = at >= 0 ? html.slice(0, at) : '', after = at >= 0 ? html.slice(at).replace(mark, '') : html;
  const cutOut = !!said['part:' + it.key];
  const piece = h => (S(h).replace(/<!--[\s\S]*?-->/g, '').trim() ? '<div style="margin:0 0 6px">' + digestHtml_(h) + '</div>' : '');
  const out = { stems: [], lines: [], html: '', bytes: 0,
                marks: Number(q.marks) > 0 ? Number(q.marks) + ' mark' + (Number(q.marks) === 1 ? '' : 's') : '' };
  digestStemRows_(q, pre).forEach(p => {
    const id = 'stem:' + (S(p.row_id) || S(p.html).slice(0, 80));
    if (done[id]) return;
    done[id] = 1;
    const pf = digestDiagram_(p.diagram, site);
    const ph = S(p.html), pat = ph.search(mark), text = digestText_(ph);
    const gone = !!said[id] || refused(text);
    /* A STAND-IN FOR A SOURCE THE PAPER PRINTS IN A SEPARATE BOOKLET is in a dashed box, as on the site
       (`.qsheet-stem.is-standin`), so nobody takes it for the exam's own words. */
    const box = TRUE_(p.placeholder) ? 'border:1px dashed #999;padding:6px 8px;' : '';
    const before = pat >= 0 ? ph.slice(0, pat) : ph, after = pat >= 0 ? ph.slice(pat).replace(mark, '') : '';
    const l = S(p.lines) ? [S(p.lines)] : [];
    let h = S(p.lines) ? '<p style="margin:0 0 4px"><i>' + digestEsc_(p.lines) + '</i></p>' : '';
    if (gone) {
      h += (text ? '<p style="margin:0 0 6px"><i>(the source text is on the site)</i></p>' : '') + (pf ? pf.html : '');
      if (text) l.push('(the source text is on the site)');
      if (pf) l.push(pf.text);
    } else {
      h += piece(before) + (pf ? pf.html : '') + piece(after);
      l.push.apply(l, digestLines_(before));
      if (pf) l.push(pf.text);
      l.push.apply(l, digestLines_(after));
    }
    h = '<div style="margin:0 0 8px;color:#555;' + box + '">' + h + '</div>';
    out.stems.push({ id: id, html: h, lines: l, bytes: gone ? 0 : digestBytes_(h) });
  });
  if (cutOut) {
    out.html = '<p style="margin:0 0 6px"><i>(the question’s words are on the site)</i></p>' + (fig ? fig.html : '');
    out.lines = ['(the question’s words are on the site)'].concat(fig ? [fig.text] : []);
    return out;
  }
  const figFirst = at < 0 && !lead;
  out.html = (figFirst && fig ? fig.html : '') + piece(lead) + piece(before) + (!figFirst && fig ? fig.html : '') + piece(after);
  out.lines = (figFirst && fig ? [fig.text] : []).concat(digestLines_(lead), digestLines_(before), !figFirst && fig ? [fig.text] : [], digestLines_(after));
  out.bytes = digestBytes_(out.html);
  return out;
}
/* THE ROW A KEY NAMES, WHEN THE CARD WOULD DRAW IT: a question, live, with something to show. A practical's
   box (`pr:`), a key typed into the sheet, a question the library has dropped or retired — null, and its words
   cell prints it, as it did before 18 Oct. */
function digestLibRow_(lib, key) {
  const k = S(key);
  if (!lib || !lib.rows || !/^q:/.test(k)) return null;
  const q = lib.rows[k.slice(2)];
  return q && q.kind === 'question' && ON_(q.active) && (S(q.html) || S(q.lead) || S(q.diagram)) ? q : null;
}

/* ---------- THE LIBRARY'S MARKUP, AS AN EMAIL MAY CARRY IT ---------------------------------------------------
   A STRICT ALLOW-LIST, because a mail client is not the site: p, br, b, strong, i, em, sup, sub, ul, ol, li,
   table, thead, tbody, tr, th, td, span, div — and NO ATTRIBUTE BUT colspan AND rowspan, so no class, id,
   link, handler or style of the row's own reaches an inbox. What email needs to look right is a style
   written HERE, inline (a mail client drops a stylesheet): a table's rules, a paragraph's gap. The rest of
   the library's vocabulary is turned into those, not dropped: a heading is a bold paragraph, a quotation an
   indented block, underline and strike-through a span saying so, the site's stacked fraction
   (`span.frac`) a superscript over a subscript, a recurring decimal's dot a combining dot above its digit,
   and an overline kept. Any other tag goes and its words stay; a `<script>`, `<style>`, `<svg>` or `<math>`
   goes with its contents. Every tag left open is closed, a closing tag with no opening one is dropped, and
   text is escaped — "x < 7" is maths, not a tag (`attemptWords_`'s rule). A named entity the library uses
   is written as its character (`DIGEST_ENTITIES`), so no mail client is asked to know `&frasl;`. */
function digestHtml_(html) {
  const src = digestPrep_(html);
  const KEEP = /^(p|br|b|strong|i|em|sup|sub|ul|ol|li|table|thead|tbody|tr|th|td|span|div)$/;
  const SAY = { p: 'margin:0 0 8px', ul: 'margin:0 0 8px;padding-left:24px', ol: 'margin:0 0 8px;padding-left:24px',
                table: 'border-collapse:collapse;margin:4px 0 10px', th: 'border:1px solid #999;padding:3px 6px;text-align:left',
                td: 'border:1px solid #999;padding:3px 6px' };
  const AS = { blockquote: ['<div style="margin:0 0 8px 12px;padding-left:10px;border-left:3px solid #ccc">', '</div>'],
               u: ['<span style="text-decoration:underline">', '</span>'], s: ['<span style="text-decoration:line-through">', '</span>'] };
  const VOID = /^(img|hr|input|wbr|col|area|source|meta|link|base|embed|param|track)$/;
  const text = t => t
    .replace(/&(?!(?:#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/&([a-z][a-z0-9]*);/gi, (m, e) => (!/^(amp|lt|gt|quot|nbsp)$/.test(e) && Object.prototype.hasOwnProperty.call(DIGEST_ENTITIES, e) ? DIGEST_ENTITIES[e] : m))
    .replace(/\^\(([^()<>]{1,40})\)/g, '<sup>$1</sup>').replace(/\^(-?[0-9A-Za-z.]{1,12})/g, '<sup>$1</sup>');
  const out = [], open = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^<>]*)>/g;
  let from = 0, m;
  while ((m = re.exec(src))) {
    out.push(text(src.slice(from, m.index)));
    from = re.lastIndex;
    const name = m[2].toLowerCase(), attrs = m[3] || '';
    if (m[1]) {
      let k = open.length - 1;
      while (k >= 0 && open[k].name !== name) k--;
      while (k >= 0 && open.length > k) out.push(open.pop().close);
      continue;
    }
    if (name === 'br') { out.push('<br>'); continue; }
    if (VOID.test(name) || /\/\s*$/.test(attrs)) continue;
    let start = '', close = '';
    if (/^h[1-6]$/.test(name)) { start = '<p style="margin:0 0 8px"><b>'; close = '</b></p>'; }
    else if (AS[name]) { start = AS[name][0]; close = AS[name][1]; }
    else if (KEEP.test(name)) {
      let extra = '';
      if (name === 'td' || name === 'th') {
        const cs = /\bcolspan\s*=\s*["']?(\d{1,2})\b/i.exec(attrs), rs = /\browspan\s*=\s*["']?(\d{1,2})\b/i.exec(attrs);
        if (cs) extra += ' colspan="' + cs[1] + '"';
        if (rs) extra += ' rowspan="' + rs[1] + '"';
      }
      const style = name === 'span' && /text-decoration\s*:\s*overline/i.test(attrs) ? 'text-decoration:overline' : (SAY[name] || '');
      start = '<' + name + extra + (style ? ' style="' + style + '"' : '') + '>';
      close = '</' + name + '>';
    }
    out.push(start);
    open.push({ name: name, close: close });
  }
  out.push(text(src.slice(from)));
  while (open.length) out.push(open.pop().close);
  return out.join('');
}
/* WHAT BOTH THE HTML AND THE PLAIN BODY START FROM: what cannot be words gone with its contents, comments
   gone, and the two drawings the site makes with classes written as what they are — the stacked fraction
   as `<sup>a</sup>&frasl;<sub>b</sub>` (the library's own other spelling of it) and the recurring decimal's
   dot as U+0307 over the digit before it. */
function digestPrep_(html) {
  return S(html)
    .replace(/<(script|style|svg|math)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<span class="frac">\s*<span class="frac-n">([\s\S]*?)<\/span>\s*<span class="frac-d">([\s\S]*?)<\/span>\s*<\/span>/g, '<sup>$1</sup>&frasl;<sub>$2</sub>')
    .replace(/<span aria-hidden="true"[^>]*>\s*(?:&bull;|•|&middot;|·)\s*<\/span>/g, '&#775;');
}
/* AND AS TEXT, for the plain body: `digestPlain_` (Gemini's reading of it, unchanged) over the same start,
   with a table's cells kept apart and a block's end a line's end. */
function digestText_(html) {
  /* A FRACTION AND A POWER AS A PARENT WRITES THEM — `5/x`, `x^2`, brackets only round more than one term —
     where `digestPlain_` brackets every one for Gemini, and a tag inside them (`<i>x</i>`) is no reason to
     lose the fraction. */
  const bare = t => t.replace(/<[^<>]*>/g, '');
  const term = t => (/^[\w.\u00b2\u00b3\u03b1-\u03c9\u221a]+$/.test(t) ? t : '(' + t + ')');
  return digestPlain_(digestPrep_(html)
    .replace(/<sup>((?:(?!<\/?sup\b)[\s\S])*?)<\/sup>\s*(?:&frasl;|\u2044|&#8260;)\s*<sub>((?:(?!<\/?sub\b)[\s\S])*?)<\/sub>/g,
      (m, a, b) => term(bare(a).trim()) + '/' + term(bare(b).trim()))
    .replace(/<sup>((?:(?!<\/?sup\b)[\s\S])*?)<\/sup>/g, (m, a) => (/^[*†‡§]+$/.test(bare(a).trim()) ? bare(a).trim() : '^' + term(bare(a).trim())))
    .replace(/<\/t[dh]>\s*(?=<t[dh]\b)/gi, ' | ').replace(/<\/(h[1-6]|blockquote|ul|ol|table)>/gi, '$&<br>'));
}
function digestLines_(html) {
  return digestText_(html).split('\n').map(x => x.trim()).filter(Boolean);
}
/* WHAT A STRING WEIGHS IN UTF-8 — what Gmail's clip counts. */
function digestBytes_(s) {
  const t = S(s);
  let n = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) { n += 4; i++; } else n += c < 0x80 ? 1 : c < 0x800 ? 2 : 3;
  }
  return n;
}

/* ---------- A DRAWING, AS AN EMAIL CAN SHOW IT -------------------------------------------------------------------
   A QUESTION'S PICTURE IS AN INLINE SVG (the library's `diagram`), inked in `currentColor` by the site's CSS —
   and Gmail and Yahoo Mail show no SVG at all. So each one has a PNG twin in the repository, drawn ONCE by
   `tools/diagram_png.js` with the site's own figure rules on the PAPER palette, at twice its size, and named
   by the first 12 hex digits of the SHA-256 of the drawing's text: `data/diagrams/<hash>.png`. A drawing that
   changes is a new file, so an email already sent keeps the picture it was sent with; `check-diagram-png.js`
   fails on a drawing with no twin and on a twin with no drawing. The email shows it from the site the backend
   already knows (`look.site`), at the drawing's own width and never wider than the message, with the
   drawing's own description (`aria-label`) as its alt text — and the plain body says that description.
   A LINK, NEVER AN ATTACHMENT (*"No jpgs."*), and so nothing it weighs counts towards Gmail's clip. */
function digestDiagram_(svg, site) {
  const s = S(svg);
  if (!/^\s*<svg\b/i.test(s)) return null;
  /* EVERY <svg> IN THE CELL — one holds two (Figures 4 and 5 of one question), drawn one above the other in
     one twin: its alt text says both, and it is as wide as the wider. */
  const labels = [];
  let width = 0;
  (s.match(/<svg\b[^>]*>/gi) || []).forEach(open => {
    const label = /\baria-label="([^"]*)"/i.exec(open);
    if (label && digestPlain_(label[1]).trim()) labels.push(digestPlain_(label[1]).replace(/\s+/g, ' ').trim());
    const vb = /\bviewBox="\s*-?[\d.]+[\s,]+-?[\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/i.exec(open);
    const wide = /\bwidth="([\d.]+)(?:px)?"/i.exec(open);
    width = Math.max(width, Math.round(Number(wide ? wide[1] : vb ? vb[1] : DIGEST_PNG_WIDTH)) || DIGEST_PNG_WIDTH);
  });
  const alt = labels.join(' / ') || 'A diagram';
  width = width || DIGEST_PNG_WIDTH;
  let hash = '';
  try {
    /* Signed bytes, as Java hands them over; `map.call` so an array-like answer is read the same. */
    hash = Array.prototype.map.call(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8),
      b => ((b + 256) % 256).toString(16).padStart(2, '0')).join('').slice(0, DIGEST_PNG_HEX);
  } catch (err) { hash = ''; }
  if (hash.length !== DIGEST_PNG_HEX) return { html: '', text: '[Picture: ' + alt + ']', alt: alt, width: width, src: '' };
  const src = S(site || SITE_URL).replace(/\/*$/, '/') + DIGEST_PNG_DIR + hash + '.png';
  return { src: src, alt: alt, width: width, hash: hash, text: '[Picture: ' + alt + ']',
           html: '<div style="margin:8px 0"><img src="' + digestEsc_(src) + '" width="' + width + '" alt="' + digestEsc_(alt)
                 + '" style="max-width:100%;height:auto"></div>' };
}

/* ---------- THE ROWS THE WEEK'S EMAIL PRINTS, FETCHED ONCE FOR THE WHOLE RUN ------------------------------------------
   The marking pass's own fetch and line scan (`digestLibrary_`, `digestLibraryFind_`) for every library key
   with a press in the week. A fetch that fails is said in the run's log and costs nothing else: each question
   then goes as its words cell, as it did before 18 Oct. */
function digestEmailLibrary_(week, subRows, cfg) {
  const ids = {};
  (subRows || []).forEach(r => {
    const k = S(r && r.key).split('#')[0];
    if (!/^q:/.test(k) || !DIGEST_KEY_SHAPE.test(k)) return;
    const came = answerAtMs_(r.submitted_at);
    if (!came) return;
    const day = digestDay_(new Date(came));
    if (day >= week.start && day <= week.end) ids[k.slice(2)] = 1;
  });
  const want = Object.keys(ids);
  if (!want.length) return { rows: {}, pre: [] };
  const got = digestLibrary_(S(cfg && cfg.site_url) || SITE_URL);
  if (got.error) return { rows: {}, pre: [], error: got.error };
  return digestLibraryFind_(got.text, want);
}

/* A VERDICT AS THE EMAIL MARKS IT — ✓ right, ✗ wrong (the site says "Not yet"; in a list of numbers a
   cross is the mark a parent reads at a glance), the AI's marks as "3 of 4 marks", the way the phone
   says them, and "not marked" for everything else: `sent`, a blank, and anything outside the vocabulary.
   It printed `sent` for the first, and nothing at all for the rest, until 12 Oct. */
function digestMark_(v) {
  const t = S(v);
  if (t === 'right') return '✓';
  if (t === 'wrong') return '✗';
  const m = /^ai:(\d{1,3})\/(\d{1,3})$/.exec(t);
  return m ? m[1] + ' of ' + m[2] + ' mark' + (m[2] === '1' ? '' : 's') : 'not marked';
}

function digestEsc_(s) {
  return S(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- TEXT THAT CAME OFF A PHONE, AND MAY GO OUT UNDER THE BUSINESS'S NAME ---------------------
   ESCAPING IS NOT ENOUGH. `digestEsc_` stops a label being markup; it does not stop it being a
   message. A learner's phone sends the label, the key and their own first name, and a reviewer sent
   "NOTICE FROM @family.: fees overdue, pay today at https://…" through the real `markDone` (the action
   `submitAnswer` replaced, which takes the same name by the same rule) and saw it
   listed as a question in a parent's email from "@family." — with the link live, because mail clients
   make one of any address in a plain body. So a piece of phone text is printed only when it holds no
   link (`://`), no `www.`, no `@` and nothing shaped like a domain (`word.word`). Every name the
   library builds — subject, paper, question, practical — passes; that was measured against
   data/questions.json and data/practicals.json, and none of them has a full stop between two words.
   False means "do not print it", never "drop it": the caller counts it. */
function digestSafe_(s) {
  const t = attemptLabel_(s);
  return !!t && !/:\/\/|\bwww\.|@|\b[a-z0-9-]{2,}\.[a-z]{2,}\b/i.test(t);
}

/* `digestSafe_` FOR A QUESTION'S WORDS — the same refusal over the WHOLE text. `digestSafe_` asks it of
   `attemptLabel_(s)`, which is the first 120 characters with every `<…>` gone, so a link in the second
   line of a question would pass it. Measured: not one question or stem in data/questions.json is
   refused, so the rule costs no real question its words. */
function digestWordsSafe_(s) {
  const t = attemptWords_(s);
  return !!t && !DIGEST_WORDS_REFUSE.some(re => re.test(t));
}

/* THE BUSINESS'S NAME AND THE SITE'S ADDRESS — each from the one place it is written, each with the
   constant beside it as the floor, so a broken config tab still signs the email. And the moment the
   list is made up to, which the email states as the end of the week it covers (`hour`, `minute`):
     on the week's Sunday   the London time NOW — the run's own, whenever Google started it
     before it (a Preview)  the hour the email is booked for, which is what it will be about
     after it (a rerun)     none: the whole week is in it */
function digestLook_(now, week) {
  let brand = '', site = '', cfg = {};
  try { brand = S(brandName()); } catch (err) {}
  try { cfg = config() || {}; site = S(cfg.site_url); } catch (err) {}
  const d = now instanceof Date && !isNaN(now) ? now : new Date();
  const today = digestDay_(d);
  let hour = -1, minute = 0;
  if (week && today === week.end) {
    const wall = Utilities.formatDate(d, DIGEST_TZ, 'yyyy-MM-dd HH:mm');
    hour = Number(wall.slice(11, 13)); minute = Number(wall.slice(14, 16));
  } else if (!week || today < week.end) {
    hour = digestBookedHour_(cfg);
  }
  return { brand: brand || BRAND_NAME, site: site || SITE_URL, hour: hour, minute: minute };
}

/* THE PLAN FOR A WEEK, OFF THE SHEET AS IT IS. The only impure step: three reads and the real
   `acceptedParents`. `now` is the moment the list is made up to (`digestLook_`); the clock when none. */
function digestPlanNow_(week, now, lib) {
  const look = digestLook_(now, week);
  /* AND THE LIBRARY'S ROWS, when the caller fetched them (`digestEmailLibrary_`): each question as it is on
     the site. Without them each goes as its words cell — the check's plans, and a run whose fetch failed. */
  if (lib && lib.rows) look.lib = lib;
  return digestPlan_(week, read(TAB.submissions).rows, read(TAB.people).rows, acceptedParents, look);
}

/* THE HOUR THE EMAIL IS BOOKED FOR — what `installWeeklyDigest` booked (`DIGEST_BOOKED`), because Apps
   Script cannot read a trigger's hour back; the config cell's when nothing was booked by this backend. */
function digestBookedHour_(cfg) {
  const booked = digestBooked_();
  return booked >= 0 ? booked : digestHour_(cfg);
}
/* THE HOUR `installWeeklyDigest` RECORDED, and -1 when there is none: never installed, or installed by a
   backend from before the record (13 Oct) — which `checkSundayEmail` must tell apart from "booked at the
   cell's hour", because on 18 Oct the owner moved the cell from 18 to 21 over triggers booked at 18. */
function digestBooked_() {
  let booked = '';
  try { booked = S(PropertiesService.getScriptProperties().getProperty(DIGEST_BOOKED)); } catch (err) { booked = ''; }
  return /^\d{1,2}$/.test(booked) && Number(booked) <= 23 ? Number(booked) : -1;
}

/* ---------- WHEN THIS WEEK'S EMAIL GOES, AS AN INSTANT — 0 WHEN THAT IS NOT STILL TO COME --------------------
   The email is at `hour`:00 on the Sunday of the week `now` is in, London — so at hour 0 it is the
   Saturday's midnight. Worked out on London's wall clock (`Utilities.formatDate`, which knows the clocks)
   and counted in whole minutes from there, so it needs no time zone of its own. */
function digestSendAt_(now, hour) {
  const d = now instanceof Date && !isNaN(now) ? now : new Date();
  const wall = Utilities.formatDate(d, DIGEST_TZ, 'yyyy-MM-dd HH:mm');
  const today = wall.slice(0, 10), sunday = digestWeekOf_(today).end;
  const at = iso => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
  const days = Math.round((at(sunday) - at(today)) / 864e5);
  const mins = days * 1440 + hour * 60 - (Number(wall.slice(11, 13)) * 60 + Number(wall.slice(14, 16)));
  if (mins <= 0) return 0;
  const t = d.getTime();
  return t - (t % 60000) + mins * 60000;
}


/* ---------- THE SUNDAY RUN ------------------------------------------------------------------------------
   `weeklyDigestRun` IS WHAT THE TRIGGER CALLS, and the only thing `installWeeklyDigest` books. Google
   hands a trigger an event object, which says nothing this needs; the clock is read here.

   OFF RETURNS FIRST, BEFORE THE LOCK AND BEFORE A TAB IS READ. A trigger left installed with the
   switch off costs one config read a week and does nothing else — which is what makes installing the
   trigger and switching the email on two separate decisions.

   A RUN THAT DID NOT FINISH THROWS. Apps Script throws a trigger's return value away and emails the
   owner only when the function throws, so a `{ error }` or a `{ held: 3 }` handed back from here was a
   run the executions page called "Completed" — and a held email nobody noticed by the next Sunday is
   never sent, because `digestWeekToSend_` has moved on to the new week. So anything short of every
   email sent (or previewed), or knowingly skipped, is an exception with the counts in its message: the
   failure email Google sends is the notice. `digestRun_` itself returns, because the checks and the
   admin want the counts, not a stack.

   AND THE LAST MARKS FIRST (the review of 12 Oct). The pass before the email stops a quarter of an hour
   short of it, and Sunday evening is homework's busiest hour: an answer sent at 17:30 went out "not
   marked" with Gemini idle. So the run marks what came in since, for `DIGEST_MARK_FINAL_MS`, and only
   then plans — the marks as fresh as the list. Short, because the mailing must fit in the same six
   minutes; never a reason not to send (its own failure is logged and the email goes, saying "not
   marked"); and through the same claim, so it never asks about an answer a running pass is asking about. */
function weeklyDigestRun(e) {
  let marks = null;
  try { marks = digestMarkPass_(new Date(), { final: true }); }
  catch (err) { marks = { error: S(err && err.message || err) }; }
  if (marks && !marks.did) console.log('weeklyDigestRun: the last marks before the email — ' + JSON.stringify(marks));
  const out = digestRun_(new Date());
  if (out) out.marking = marks;
  if (out && /^NOT fetched/.test(S(out.library))) console.log('weeklyDigestRun: the question library was ' + out.library);
  if (out && (out.error || out.held || out.failed || out.busy)) {
    throw new Error('The weekly parent email did not finish: '
      + (out.error ? out.error : 'sent ' + out.sent + ', held ' + out.held + ' (mail quota), failed '
         + out.failed + ', busy ' + out.busy + ' (lock) — see the digest_log tab, then run '
         + 'weeklyDigestRun again from the editor before next Sunday; it sends only what is not sent.'));
  }
  return out;
}

/* ---------- THE LOCK IS HELD TO CLAIM AN EMAIL, NEVER TO SEND IT ----------------------------------------
   IT WAS HELD FOR THE WHOLE MAILING, and a mailing is a row, a flush, a `sendEmail` and another row per
   parent — a second or so each, so 30–60 seconds at 18:00 on a Sunday during which the site's own
   writes were refused. `markDone` (`tryLock(5000)`, as `submitAnswer` is now) answered "Busy" and the
   phone's backlog re-sent the keys without their names; `aiMarkCount_` answered -1 and a student was told their AI marks were used
   up. The busiest hour of the week for homework is the worst one to hold the only lock the site has.

   SO THE LOCK GUARDS ONLY THE CLAIM: under it, the log is read fresh, the row for this week, learner and
   parent is found, and if it is not already a receipt it is written `sending` and flushed. Then the lock
   goes, and the email is sent. A second run waiting on the lock reads that `sending` row when it gets
   in, and skips it — which is the whole of what the lock was for. AT MOST ONCE still holds: the receipt
   is on the sheet before the send begins, and `check-digest.js` asks the mail stub to look for it.

   `sent` IS WRITTEN AFTER, IN ITS OWN TRY. It was in the same `try` as `sendEmail`, so a sheet timeout
   on that one write — after the email had gone — fell into the `catch` and wrote `failed` over the
   `sending` receipt, and `failed` is no receipt: the next run sent the parent the same email again.
   Now only `sendEmail` throwing is `failed`; a lost `sent` write leaves `sending`, which a rerun counts
   as sent, which it was.

   THE QUOTA. `MailApp.getRemainingDailyQuota()` is asked before each email, and the run stops sending
   once it would go below `weekly_digest_reserve` — those rows are `held`, and running it again once
   the quota is back (the next day, by hand) sends them, the same week, thanks to `digestWeekToSend_`.
   A row saying `preview`, `held` or `failed` is no receipt, and a rerun sends it. */
function digestRun_(now) {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const mode = digestMode_(cfg);
  if (mode === 'off') return { mode: 'off', did: 'nothing — weekly_digest on the config tab is off' };

  if (!digestLog_().sheet) return { mode: mode, error: 'The sheet has no digest_log tab. Run ensureSchema() (open /exec?setup=1) to add it. Nothing was sent.' };
  /* NO `submissions` TAB IS NOT A QUIET WEEK. `read` answers a missing tab with no rows, so this run
     would plan nothing, write nothing, and the Sunday would look like a week nobody worked — on a Ledger
     that was in fact never told what anybody did. It stops here and says so, and the throw in
     `weeklyDigestRun` is the email that says it to the owner. */
  const noSubmissions = digestNoSubmissions_();
  if (noSubmissions) return { mode: mode, error: noSubmissions };
  /* THE PLAN IS MADE WITHOUT THE LOCK. It reads `submissions` and `people` and writes nothing; what it
     decides is checked against the log, fresh, under the lock, one email at a time. */
  const week = digestWeekToSend_(now);
  /* EACH QUESTION AS IT IS ON THE SITE (18 Oct): the library's rows for the week's questions, fetched once.
     A fetch that fails stops nothing — the run says so in its log and the questions go as their words. */
  let lib = null;
  try { lib = digestEmailLibrary_(week, read(TAB.submissions).rows, cfg); }
  catch (err) { lib = { rows: {}, pre: [], error: S(err && err.message || err) }; }
  const plan = digestPlanNow_(week, now, lib);
  const out = { mode: mode, week: { start: week.start, end: week.end }, learners: plan.learners.length,
                emails: plan.emails.length, previewed: 0, sent: 0, already: 0, held: 0, failed: 0, busy: 0,
                unreachable: plan.unreachable.length, skipped: 0,
                library: lib && lib.error ? 'NOT fetched, so each question went as its words cell — ' + lib.error : 'each question as it is on the site' };
  const mailed = digestMail_(plan.emails, {
    mode: mode, reserve: digestReserve_(cfg), readLog: digestLog_, brand: plan.look.brand,
    find: (log, m) => digestLogFind_(log, week.start, m.learner_id, m.parent_id),
    put: (log, row, m, v) => digestLogPut_(log, row, week.start, m.learner_id, m.parent_id, v),
    heldNote: 'daily mail quota — run weeklyDigestRun again tomorrow',
  });
  ['previewed', 'sent', 'already', 'held', 'failed', 'busy'].forEach(k => { out[k] += mailed[k]; });

  /* AND WHO WAS NOT TOLD, AND WHY — a row each, so the log answers both questions. A parent who
     asked not to be sent it is a row too; a parent with no address is in the learner's `note`. One
     short hold for all of them: they are writes to the log and nothing else. */
  const noted = digestLocked_(digestLog_, log => {
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
          status: 'opted out', at: new Date(), note: 'weekly_email on their row says no (Settings → Notifications)' });
        out.skipped++;
      });
    });
    return true;
  });
  if (!noted) out.busy++;
  return out;
}

/* ---------- UNDER THE LOCK, BRIEFLY -----------------------------------------------------------------
   `fn` is handed the log as it is now — `readLog` drops that tab's cached copy first. Null when
   another run kept the lock for thirty seconds: the caller counts it `busy`, sends nothing for it,
   and its trigger throws so somebody runs it again. One function, so the lock is taken one way in one
   place — the claim and the "who was not told" rows both come through it. */
function digestLocked_(readLog, fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return null;
  try { return fn(readLog()); } finally { lock.releaseLock(); }
}

/* ---------- CLAIM, SEND, RECEIPT -------------------------------------------------------------------------
   MOVED OUT OF `digestRun_` UNCHANGED, the day a second email needed it (that email is gone again —
   docs/history/295 — and this stays as the Sunday run's engine): the order below is the whole of "at
   most once", it was paid for in the three bugs written above `digestRun_`, and it is written once.
   The log's parts are arguments and the order is not:

     under the lock    the log read fresh; `sent` or `sending` already there is ALREADY;
                       `preview` mode writes `preview`; at or below the reserve writes `held`;
                       otherwise `sending` is written and flushed
     lock released     then the send — never under it
     a throw           `failed`, which is no receipt, so the next run sends it
     after             `sent`, in its own `try`, so a lost write leaves `sending` — still a receipt

   `o` = { mode, reserve, readLog, find(log, m), put(log, row, m, values), heldNote, brand }. `find`
   and `put` are the email's own log: its tab, its key, its extra columns. Returns the counts. */
function digestMail_(emails, o) {
  const out = { previewed: 0, sent: 0, already: 0, held: 0, failed: 0, busy: 0 };
  (emails || []).forEach(m => {
    const claim = digestLocked_(o.readLog, log => {
      const row = o.find(log, m);
      const was = norm(row && row.status);
      if (was === 'sent' || was === 'sending') return { already: true };
      const v = { to: m.to, subject: m.subject, questions: m.count, at: new Date(), note: '' };
      if (o.mode === 'preview') {
        o.put(log, row, m, Object.assign(v, { status: 'preview' }));
        return { previewed: true };
      }
      if (digestQuota_() <= o.reserve) {
        o.put(log, row, m, Object.assign(v, { status: 'held', note: o.heldNote }));
        return { held: true };
      }
      const r = o.put(log, row, m, Object.assign(v, { status: 'sending' }));
      /* FLUSHED BEFORE THE LOCK GOES, so the next run to take it reads the claim off the sheet. */
      try { SpreadsheetApp.flush(); } catch (err) {}
      return { row: r, log: log };
    });
    if (!claim) { out.busy++; return; }
    if (claim.already) { out.already++; return; }
    if (claim.previewed) { out.previewed++; return; }
    if (claim.held) { out.held++; return; }
    try {
      /* `firstNamesOnly`: the net in `mailOut_` leaves a child's whole name as the first name alone here,
         never "First (@handle)" — a parent's email carries no username (the note over `digestRender_`). */
      mailOut_({ to: m.to, subject: m.subject, body: m.text, htmlBody: m.html, name: o.brand || BRAND_NAME, firstNamesOnly: true });
    } catch (err) {
      try { setCells(claim.log, claim.row, { status: 'failed', note: S(err && err.message || err).slice(0, 200) }); } catch (e2) {}
      out.failed++;
      return;
    }
    out.sent++;
    try { setCells(claim.log, claim.row, { status: 'sent', at: new Date() }); } catch (err) {}
  });
  return out;
}

/* ---------- NO `submissions` TAB, IN WORDS ---------------------------------------------------------------
   THE OWNER'S LEDGER DID NOT HAVE AN `attempts` TAB until 6 Oct, and nothing said so: `read` answers a
   missing tab with no rows, which is exactly what a week of nobody working looks like. The weekly
   preview printed "Nobody has done a question yet this week" over a sheet that had never been told what
   anybody did. The same is true of `submissions`, which a pull of the backend does not create —
   `ensureSchema` does. So the run and the Preview ask this before they plan, and a run with something
   to send stops on it. '' when the tab is there. */
function digestNoSubmissions_() {
  let there = false;
  try { there = !!read(TAB.submissions).sheet; } catch (err) { there = false; }
  return there ? ''
    : 'The Ledger has no submissions tab, so nothing says what anybody sent. Open /exec?setup=1 (ensureSchema) '
    + 'to add it; answers sent from then on are what these emails report. Nothing was sent.';
}

/* THE LOG AS IT IS NOW — its cached copy dropped first, because a copy read before the lock was taken
   is the one another run has since written to. Only this tab's: `clearCache()` would have the next
   read of `people` and `submissions`, for nothing, go back to the sheet once per email. */
function digestLog_() {
  try { delete _cache[TAB.digest_log]; } catch (err) {}
  return read(TAB.digest_log);
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


/* ---------- BOOKING THE SUNDAY, AND ITS MARKING, BY HAND --------------------------------------------------
   RUN FROM THE APPS SCRIPT EDITOR'S FUNCTION LIST, ONCE, AND BY NOBODY ELSE. Not from `installTriggers`,
   not from `?run=`, not from `doGet` — a trigger booked as a side effect of something else is a Sunday
   email nobody decided to start. `check-digest.js` reads the backend for a call to either and fails.

   THREE BOOKINGS, ALL HERE (12 Oct): the email, every Sunday at `weekly_digest_hour`; the marking pass
   (`digestMarkRun`) every night at `DIGEST_MARK_NIGHT`, so a child sees the marks next morning; and the
   marking pass again on Sunday an hour before the email, so the email has them — the RUN-UP, which books
   itself again while work is left (`digestMarkAgain_`, the one other `newTrigger(` in this file, a
   one-off on the same handler, so the way back takes it too). `nearMinute(0)` on all three because a
   trigger fires anywhere in its hour otherwise — 17:58 for a pass the 18:00 email must follow, 18:59 for
   an email whose run-up stopped at 17:43 — and with it Google keeps to fifteen minutes either side. The
   EMAIL had none until the review of 12 Oct, so it could go at any minute from 18:00 to 18:59, and an
   answer sent in that gap went out "not marked". An email at midnight has its pass at 23:00 on the
   Saturday. The hour booked is kept (`DIGEST_BOOKED`), because a trigger's hour cannot be read back and
   the setup check must say when it really goes.

   THE OLD ONES GO FIRST, the `installWarmTrigger` rule: run twice, it still leaves exactly one of each,
   and changing `weekly_digest_hour` is running this again. `inTimezone` says London out loud rather
   than trusting the project's own setting, so 18:00 stays 18:00 across the clocks changing.

   INSTALLED IS NOT ON. With `weekly_digest` at `off` every one of them fires and returns at its first
   line; `preview` and `send` are a cell on the config tab, not another run of this.

   AND THE OLD EMAIL'S HOURLY CHECK GOES WITH IT. The email after each session was booked the same way
   (from the editor, an hourly trigger) and was removed on 8 Oct; a trigger left booked for it fires
   every hour into a function that no longer exists, fails, and Google emails the owner each failure.
   The owner runs this anyway to switch the weekly email on, so this is where it is taken away — every
   trigger whose handler is in `DIGEST_RETIRED_RUNS`, and only those — and the log line says how many. */
function installWeeklyDigest() {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const hour = digestHour_(cfg);
  const gone = removeWeeklyDigest();
  let retired = 0;
  ScriptApp.getProjectTriggers().forEach(t => {
    if (DIGEST_RETIRED_RUNS.indexOf(t.getHandlerFunction()) !== -1) { ScriptApp.deleteTrigger(t); retired++; }
  });
  const book = fn => ScriptApp.newTrigger(fn).timeBased();
  book(DIGEST_RUN).onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(hour).nearMinute(0).inTimezone(DIGEST_TZ).create();
  book(DIGEST_MARK_RUN).everyDays(1).atHour(DIGEST_MARK_NIGHT).nearMinute(0).inTimezone(DIGEST_TZ).create();
  const before = hour ? hour - 1 : 23;
  book(DIGEST_MARK_RUN).onWeekDay(hour ? ScriptApp.WeekDay.SUNDAY : ScriptApp.WeekDay.SATURDAY).atHour(before)
    .nearMinute(0).inTimezone(DIGEST_TZ).create();
  try { PropertiesService.getScriptProperties().setProperty(DIGEST_BOOKED, String(hour)); } catch (err) {}
  const mode = digestMode_(cfg);
  const out = { installed: 'every Sunday at about ' + hour + ':00, London time', replaced: gone.removed, mode: mode,
           means: mode === 'off' ? 'it runs and does nothing until weekly_digest on the config tab is preview or send'
                : mode === 'preview' ? 'it writes what it would send to the digest_log tab and sends nothing'
                : 'it EMAILS PARENTS',
           marking: 'AI marking of unmarked answers every night at about ' + DIGEST_MARK_NIGHT + ':00 and '
                    + (hour ? 'on Sunday' : 'on Saturday') + ' at about ' + before + ':00, London time, carrying on '
                    + 'until a quarter of an hour before the email, and once more as it goes ('
                    + (digestMarkOff_(cfg) || 'on, while GEMINI_API_KEY is set') + ')',
           oldHourly: retired ? 'removed the old after-session email’s hourly check (' + retired + ' trigger'
                                + (retired === 1 ? '' : 's') + ')' : 'no old after-session email check was booked',
           next: 'run checkSundayEmail to see that everything is ready' };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}
/* THE WAY BACK: every trigger of the email's handler and of the marking pass's — a run-up's one-off
   included — gone, and nothing else; and the two Script Properties that describe them. Safe to run when
   there are none. */
function removeWeeklyDigest() {
  let n = 0, marking = 0;
  ScriptApp.getProjectTriggers().forEach(t => {
    const fn = t.getHandlerFunction();
    if (fn === DIGEST_RUN) { ScriptApp.deleteTrigger(t); n++; }
    else if (fn === DIGEST_MARK_RUN) { ScriptApp.deleteTrigger(t); marking++; }
  });
  try {
    const props = PropertiesService.getScriptProperties();
    props.deleteProperty(DIGEST_BOOKED);
    props.deleteProperty(DIGEST_MARK_AGAIN);
  } catch (err) {}
  return { removed: n, marking: marking };
}
/* How many are booked, for the admin's card and `checkSundayEmail` — a run-up's one-off not among them,
   since it is gone again within minutes. Null when it cannot be asked. */
function digestScheduled_(fn) {
  try {
    const again = digestMarkAgainId_();
    return ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === (fn || DIGEST_RUN)
      && !(again && S(t.getUniqueId && t.getUniqueId()) === again)).length;
  } catch (err) { return null; }
}


/* ---------- WHAT THE ADMIN'S PREVIEW IS SENT — `digestPreview` in dopost.gs -------------------------
   THIS WEEK SO FAR, and nothing written and nothing sent: the plan, rendered, for the card on the
   Settings column (js/digest.js). Every address is in it, which is why the action is `admin`. */
function digestPreviewOut_(now) {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const week = digestWeek_(now);
  /* THE SAME LIBRARY AS THE RUN'S, so the Preview is the email as it will go (18 Oct). */
  let lib = null;
  try { lib = digestEmailLibrary_(week, read(TAB.submissions).rows, cfg); } catch (err) { lib = null; }
  const plan = digestPlanNow_(week, now, lib);
  /* AND WHETHER THERE IS ANYTHING TO READ: with no `submissions` tab the plan is empty for a reason, and
     the card says the reason rather than "nobody has done a question". */
  const warning = digestNoSubmissions_();
  /* `words` SAYS THIS BACKEND LISTS EACH QUESTION WITH ITS WORDS. The Preview is answered by the
     deployed web-app VERSION, the Sunday trigger runs the code as saved — so after a pull with no new
     version, the card would show the old list of names over a run that sends the new one. A reply
     without it is that older backend, and the card says to make a new version (js/digest.js). */
  return {
    success: true, mode: digestMode_(cfg), hour: digestBookedHour_(cfg), scheduled: digestScheduled_(),
    submissions: !warning, warning: warning, words: true,
    week: { start: week.start, end: week.end, span: digestSpan_(week) },
    learners: plan.learners.map(L => ({ id: L.id, name: L.name, count: L.count, fresh: L.fresh.length,
      again: L.again.length, to: L.to.map(p => p.name), why: L.why })),
    emails: plan.emails.map(m => ({ learner: m.learner, parent: m.parent, to: m.to, subject: m.subject,
      text: m.text, html: m.html, count: m.count })),
    unreachable: plan.unreachable,
  };
}


/* ==================================================================================================
   THE MARKING PASS — EVERY ANSWER OF THE WEEK THAT NOTHING MARKED, MARKED BEFORE THE EMAIL GOES
   (12 Oct, docs/history/348)

   THE OWNER: *"i want them to see if they got it right too. for this i need th ai marking to be working
   too."* An answer is `sent` when the phone had nothing to mark it with: a worded answer while AI marking
   was off (no key, or a phone still on a cached payload), a maths answer whose scheme is words and has no
   `accept` to Check against, or a press made before the child thought to press Mark with AI. In the
   email each of those said `sent`; and an answer marked only when the phone is open is an answer never
   marked once the child shuts the iPad straight after sending it.

   SO THE SERVER MARKS THEM, WITH THE MARKER A PRESS USES. `aiMarkAsk_` (dopost.gs) — its prompt, its
   schema, its retries and its pinned fallback model (docs/history/344) — with the same clamps `aiMark`
   puts on a press (`AI_QUESTION_MAX`, `AI_SCHEME_MAX`, `AI_ANSWER_MAX`, 1 to 40 marks), so a pass is never
   more generous than a press. NOT `aiMarkCount_`: that is a child's twenty presses a day, and a pass
   that spent it would answer a child "today's 20 AI marks used" for work they never pressed.

   WHERE THE QUESTION AND ITS SCHEME COME FROM — the site, because nowhere else has them. The backend
   holds no library (SCHEMA.submissions); a press sends the question and the scheme from the phone; a
   submission row carries the question's words for the email (up to 1,200 characters, and no scheme).
   Two ways were weighed: the phone sending the scheme with every worded submission, which marks
   nothing already on the sheet, nothing from a phone still running cached code, and needs a js/ change;
   or the server fetching `data/questions.json` from the public site, which marks every row on the sheet
   today. The second, measured: 14,092,112 bytes (1.77 MB gzipped) from raw.githubusercontent.com in
   1.35 s; ONE ROW A LINE, so a row is its `"row_id":"…"` and one `JSON.parse` of one line — three keys
   and a paper's preambles in 10-30 ms in Node, where parsing the whole file is a quarter of a second and
   20 MB more heap, and Apps Script's memory ceiling is not published. The question is built as the phone
   builds it (`aiQuestion_` in js/keypad.js): the paper's, section's, question's and letter's preambles
   (`digestStems_`, a port of `stemIndex_`/`preamble_` in js/find.js), then its lead and its ask, read as
   text (`digestPlain_`, a port of `aiPlain_`) — and the scheme is its `answer` and its examiner's note.

   WHICH ANSWERS: the LATEST press of a question, by `pressed_at` (the card's rule and the email's), when
   it is `sent`, it arrived this week or last (`digestWeekToSend_`'s Monday to today: a pass on a Monday
   still finishes the week the email just went for), and it is not work carried over from before the
   switch (`SUBMISSION_CARRIED`). Newest first. MARKABLE as Mark with AI is offered (`aiWanted_` in
   js/keypad.js): a question with a scheme and no `accept`, not a pick from a list, not a drawing — and,
   one step past the phone, a maths answer whose scheme is words, which the phone sends as `sent` because
   its keypad has nothing to Check it against (`ansMaths_`). Marked as an essay when the phone would
   (`ansEssay_`: written or explain, 6 marks or more, not Maths or Statistics).

   THE MARK IS ONE ROW, APPENDED — SCHEMA.submissions: what a press would have written, with the answer's
   own `submitted_at`, `pressed_at` one millisecond after it, and an id made from it (`SUBMISSION_MARKED`).
   UNDER THE LOCK, BRIEFLY, AND NEVER WHILE GEMINI IS ASKED: an ask can take up to 80 s and every child's
   saved answer waits on that lock. Under it, the tab is read fresh, and nothing is written if the mark is
   already there (a second pass) or the child has pressed that question again since (their press is the
   newer word, and a mark of an older answer must not go over it).

   THE CLOCK, THE PACE AND THE RESUME: constants.gs, over `DIGEST_MARK_RUN`. Nothing is kept between
   passes but `DIGEST_MARK_TRIED` (answers Gemini gave no mark for) — the next pass works out what is
   left from the sheet itself, so a pass stopped at four minutes, or by Apps Script at six, loses nothing.

   AND BEFORE THE EMAIL IT DOES NOT STOP AT ONE PASS (the review of 12 Oct). A pass is about sixteen
   answers (four minutes, an answer every ~16 s), and one an hour before the email left a weekend burst
   mostly "not marked". So a pass in the RUN-UP (`DIGEST_MARK_RUNUP_MS` before the email) that stopped
   with work left books itself again a minute later (`digestMarkAgain_`), until it is
   `DIGEST_MARK_CLEAR_MS` from the email — measured over the real backend with Gemini at 4 s an answer,
   that is about nine passes, some 140 answers, where it was 16; the email's own run then marks what came
   in since (`weeklyDigestRun`). And GEMINI BUSY IS WAITED OUT: the pass waits `DIGEST_MARK_BUSY_MS` and
   asks the same answer again while its time allows, where it gave up at the first busy and left the rest
   for a pass that, on a Sunday, came after the email.
================================================================================================== */

/* THE SWITCHES, READ IN ONE PLACE: '' when the pass may run, otherwise why not, in words. `weekly_digest`
   off is off for its marking too — installed is not on. `ai_marks_per_day` 0 has always said "switches AI
   marking off", and the owner reaching for it means all of it; blank there is 20, as for a press. */
function digestMarkOff_(cfg) {
  if (digestMode_(cfg) === 'off') return 'off: weekly_digest on the config tab is off';
  /* ON IS SPELLED — blank, on, yes, true, 1 or ✓ — AND OFF IS EVERYTHING ELSE, `weekly_digest`'s own rule
     (the note on its row in CONFIG_DEFAULTS says why it changed). */
  if (!/^(|on|yes|y|true|1|✓)$/i.test(S(cfg && cfg.weekly_digest_marking))) return 'off: weekly_digest_marking on the config tab is off';
  const cap = S(cfg && cfg.ai_marks_per_day);
  if (cap !== '' && Math.max(0, Math.floor(N(cap))) === 0) return 'off: ai_marks_per_day on the config tab is 0, which switches AI marking off';
  return '';
}

/* ---------- WHAT THE TRIGGERS CALL ------------------------------------------------------------------------
   Booked by `installWeeklyDigest`, nightly and an hour before the Sunday email, and by a run-up pass for
   the minute after it (`digestMarkAgain_`). A pass that could not start, or that Gemini REFUSED (the key,
   the account, a model name — the owner's to mend), throws, so Google emails the owner; one that ran out
   of time or found Gemini busy has not failed — the next pass carries on — and returns. */
function digestMarkRun(e) {
  const out = digestMarkPass_(new Date());
  if (out && out.error) throw new Error('The AI marking for the Sunday email did not run: ' + out.error);
  if (out && out.stopped === 'refused') {
    throw new Error('The AI marking for the Sunday email stopped: Gemini refused to mark (' + S(out.said) + '). '
      + 'Check GEMINI_API_KEY in Script Properties and gemini_model on the config tab, then run checkSundayEmail. '
      + out.marked + ' marked before it stopped.');
  }
  return out;
}

/* ---------- ONE PASS -------------------------------------------------------------------------------------
   Returns the counts, for the trigger, the checks and the dry run (check/digest-dry.js):
     waiting   answers whose latest press is `sent`, this week or last
     marked    marks written            asked    Gemini asks made
     cannot    { reason: n } — never asked: no scheme, a drawing, a pick, too long, given no mark twice
     nomark    Gemini answered with no mark in it (asked again next pass, up to DIGEST_MARK_TRIES)
     newer     marked, but the child had pressed again meanwhile — not written
     already   marked by another pass meanwhile — not written
     left      not reached: `stopped` says why — time, max, busy, unreachable, refused, lock
     waited    times it waited Gemini out (busy or unreachable) and asked the same answer again
     again     true when it booked the run-up's next pass
   `o.final`: the email's own last pass — `DIGEST_MARK_FINAL_MS`, and no run-up: it is the last word. */
function digestMarkPass_(now, o) {
  const t0 = Date.now();
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const off = digestMarkOff_(cfg);
  if (off) return { did: 'nothing', why: off };
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';
  if (!apiKey) return { did: 'nothing', why: 'off: there is no GEMINI_API_KEY in Script Properties' };
  const noTab = digestNoSubmissions_();
  if (noTab) return { error: noTab };
  const claim = digestMarkClaim_();
  if (!claim) return { did: 'nothing', why: 'another marking pass is running' };
  try {
    /* THE ONE-OFF THAT STARTED THIS PASS, IF ONE DID, IS DELETED — under the claim, so only the pass that
       holds it does; a fired one-off is otherwise left in the project's trigger list. */
    digestMarkAgainDone_();
    return digestMarkWork_(now, cfg, apiKey, t0, o || {});
  } finally {
    digestMarkLetGo_(claim);
  }
}
function digestMarkWork_(now, cfg, apiKey, t0, o) {
  const today = digestDay_(now), from = digestWeekToSend_(now).start;
  /* THE RUN-UP: this week's email still to come, and close. Its asks stop `DIGEST_MARK_CLEAR_MS` short of
     it, whatever is left of the pass's own four minutes; the email's last pass is not clipped — it IS the
     email's. */
  const sendAt = o.final ? 0 : digestSendAt_(now, digestBookedHour_(cfg));
  const runUp = !!sendAt && sendAt - now.getTime() <= DIGEST_MARK_RUNUP_MS;
  let deadline = t0 + (o.final ? DIGEST_MARK_FINAL_MS : DIGEST_MARK_BUDGET_MS);
  if (runUp) deadline = Math.min(deadline, sendAt - DIGEST_MARK_CLEAR_MS);
  try { delete _cache[TAB.submissions]; } catch (err) {}
  const waiting = digestMarkWaiting_(read(TAB.submissions).rows, from, today);
  const out = { from: from, to: today, waiting: waiting.length, marked: 0, asked: 0, cannot: {}, nomark: 0,
                newer: 0, already: 0, left: 0, stopped: '', model: '', waited: 0, again: false };
  const tried = digestMarkTried_();
  if (!waiting.length) { digestMarkTriedKeep_(tried, waiting); return out; }
  const lib = digestMarkLibraryFor_(waiting, cfg);
  if (lib.error) { out.error = lib.error; out.left = waiting.length; return out; }
  out.library = lib.url || '';
  const sorted = digestMarkSort_(waiting, lib, tried);
  out.cannot = sorted.cannot;
  const work = sorted.work;
  const models = aiModels_(cfg);
  let answered = 0, rested = false;
  for (let i = 0; i < work.length; i++) {
    const M = work[i];
    /* NO ASK STARTED PAST THE DEADLINE OR THE CAP — and the gap is counted before it is slept, so the last
       sleep cannot carry an ask past the deadline either. THE CAP COUNTS ANSWERS: an ask Gemini was too
       busy to answer spent none of the key's day. After a wait for a busy Gemini, no gap: it was longer. */
    const gap = out.asked && !rested ? DIGEST_MARK_GAP_MS : 0;
    if (answered >= DIGEST_MARK_MAX || Date.now() + gap > deadline) {
      out.left = work.length - i; out.stopped = answered >= DIGEST_MARK_MAX ? 'max' : 'time'; break;
    }
    if (gap) Utilities.sleep(gap);
    rested = false;
    out.asked++;
    let got = null;
    try { got = aiMarkAsk_(apiKey, models, M.question, M.scheme, M.answer, M.avail, M.essay); }
    catch (err) { got = { error: S(err && err.message || err), why: 'unreachable' }; }
    if (!got || got.error) {
      const why = S(got && got.why);
      /* REFUSING is the owner's to mend — the key, the account, a model name — so the pass stops and
         `digestMarkRun` throws. */
      if (why === 'refused') { out.left = work.length - i; out.stopped = why; out.said = S(got && got.error); break; }
      /* FULL OR OUT OF REACH IS WAITED OUT, NOT GIVEN UP ON (the review of 12 Oct). It broke out here and
         left everything for "the next pass", which on a Sunday is the one after the email: a 20-second
         503 storm at 16:55 went out as a whole week "not marked", with Gemini back seconds later. Now the
         pass waits `DIGEST_MARK_BUSY_MS` and asks the SAME answer again while its time allows, and stops
         only when the wait would carry it past its deadline. */
      if (why === 'busy' || why === 'unreachable') {
        out.said = S(got && got.error);
        if (Date.now() + DIGEST_MARK_BUSY_MS > deadline) { out.left = work.length - i; out.stopped = why; break; }
        Utilities.sleep(DIGEST_MARK_BUSY_MS);
        out.waited++;
        rested = true;
        i--;
        continue;
      }
      /* A reply with no mark in it is about this answer alone: counted, and the pass goes on. */
      answered++;
      tried[M.id] = (Number(tried[M.id]) || 0) + 1;
      out.nomark++;
      continue;
    }
    answered++;
    const awarded = Math.max(0, Math.min(M.avail, Math.round(Number(got.awarded) || 0)));
    const wrote = digestMarkWrite_(M.W, 'ai:' + awarded + '/' + M.avail, M.id);
    if (wrote === 'wrote') { out.marked++; out.model = S(got.model) || out.model; delete tried[M.id]; }
    else if (wrote === 'newer') out.newer++;
    else if (wrote === 'already') out.already++;
    else { out.left = work.length - i; out.stopped = 'lock'; break; }
  }
  digestMarkTriedKeep_(tried, waiting);
  /* AND IN THE RUN-UP, AGAIN A MINUTE LATER while work is left and there is a minute of asking before the
     email's quarter of an hour. Not on `refused` (the owner's), and never from the email's own pass. */
  if (runUp && out.left && /^(time|max|busy|unreachable|lock)$/.test(out.stopped)
      && Date.now() + DIGEST_MARK_AGAIN_MS + 60000 < sendAt - DIGEST_MARK_CLEAR_MS) {
    out.again = digestMarkAgain_();
  }
  console.log('digestMarkPass: ' + JSON.stringify(out));
  return out;
}

/* ---------- THE RUN-UP'S NEXT PASS: A ONE-OFF, A MINUTE ON ------------------------------------------------
   THE ONE OTHER `newTrigger(` IN THIS FILE, and `check-digest.js` holds it to this shape: the marking
   pass's own handler, `after(DIGEST_MARK_AGAIN_MS)`, nothing else — so it can book no email and no
   recurring trigger, and `removeWeeklyDigest` takes it with the rest. Its id is kept (`DIGEST_MARK_AGAIN`):
   the pass it starts deletes it (`digestMarkAgainDone_`), because a fired one-off stays in the project's
   list, and the project has twenty triggers to share among everything. */
function digestMarkAgain_() {
  try {
    const t = ScriptApp.newTrigger(DIGEST_MARK_RUN).timeBased().after(DIGEST_MARK_AGAIN_MS).create();
    PropertiesService.getScriptProperties().setProperty(DIGEST_MARK_AGAIN, S(t && t.getUniqueId && t.getUniqueId()) || '?');
    return true;
  } catch (err) {
    console.log('digestMarkPass: could not book the next pass of the run-up — ' + S(err && err.message || err));
    return false;
  }
}
function digestMarkAgainId_() {
  try { return S(PropertiesService.getScriptProperties().getProperty(DIGEST_MARK_AGAIN)); } catch (err) { return ''; }
}
function digestMarkAgainDone_() {
  const id = digestMarkAgainId_();
  if (!id) return;
  try {
    ScriptApp.getProjectTriggers().forEach(t => {
      if (t.getHandlerFunction() === DIGEST_MARK_RUN && S(t.getUniqueId && t.getUniqueId()) === id) ScriptApp.deleteTrigger(t);
    });
    PropertiesService.getScriptProperties().deleteProperty(DIGEST_MARK_AGAIN);
  } catch (err) {}
}

/* ---------- WHICH ANSWERS ARE WAITING — PURE ------------------------------------------------------------
   Per person and key (a practical's `#slot` kept: each box is its own answer), the latest press — by
   `pressed_at`, `submitted_at` where there is none, and of two in one instant the later row, the rule
   `submissionsBuild_` and `digestPlan_` keep — when it is `sent`, arrived between `from` and `to` (London
   days) and is not carried over. Newest first, each with the id its mark would have. */
function digestMarkWaiting_(rows, from, to) {
  const last = {};
  (rows || []).forEach(r => {
    const pid = S(r && r.person_id), k = S(r && r.key);
    if (!pid || !k) return;
    const came = answerAtMs_(r.submitted_at);
    if (!came) return;
    const ms = answerAtMs_(r.pressed_at) || came;
    const id = pid + '\u0001' + k;
    if (last[id] && last[id].ms > ms) return;
    last[id] = { r: r, ms: ms, came: came };
  });
  return Object.keys(last).map(id => last[id]).filter(W => {
    if (S(W.r.verdict) !== 'sent' || SUBMISSION_CARRIED.test(S(W.r.event_id))) return false;
    const day = digestDay_(new Date(W.came));
    return day >= from && day <= to;
  }).map(W => Object.assign(W, { id: digestMarkId_(W.r, W.ms) })).sort((a, b) => b.ms - a.ms);
}

/* THE NAME OF THE MARK OF ONE ANSWER — the same answer always gets the same one (`SUBMISSION_MARKED`).
   Two FNV-1a hashes of the answer's person, key, id and moment, in base 36: no service to call, so the
   checks and the editor make the same name. */
function digestMarkId_(r, ms) {
  const src = S(r && r.event_id);
  const at = SUBMISSION_ID.test(src) ? src.split('-')[0] : String(Math.floor(Number(ms) || 0));
  const seed = S(r && r.person_id) + '|' + S(r && r.key) + '|' + src + '|' + Math.floor(Number(ms) || 0);
  const h = salt => {
    let x = (2166136261 ^ salt) >>> 0;
    for (let i = 0; i < seed.length; i++) { x ^= seed.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; }
    return x.toString(36);
  };
  return at + '-ai' + (h(0) + h(0x9e3779b9) + '0000000000').slice(0, 10);
}

/* ---------- THE LIBRARY, FOR THE ANSWERS THAT NEED IT ------------------------------------------------------
   Only a `q:` key has a scheme; a practical's box and anything typed into the sheet are sorted out before
   the 14 MB is fetched, so a night with nothing worded fetches nothing. */
function digestMarkLibraryFor_(waiting, cfg) {
  const ids = {};
  waiting.forEach(W => { const k = S(W.r.key); if (/^q:/.test(k) && DIGEST_KEY_SHAPE.test(k)) ids[k.slice(2)] = 1; });
  if (!Object.keys(ids).length) return { rows: {}, pre: [] };
  const got = digestLibrary_(S(cfg && cfg.site_url) || SITE_URL);
  if (got.error) return got;
  return Object.assign(digestLibraryFind_(got.text, Object.keys(ids)), { url: got.url, ms: got.ms, size: got.size });
}

/* THE FILE ITSELF: the site's copy first — the one the phones read — then raw.githubusercontent.com (`RAW`
   in sync.gs, read at call time, so a scope without sync.gs simply has no second address). A 200 that is
   not the library (a login page, a GitHub error page) is refused, not parsed. */
function digestLibrary_(site) {
  const urls = [S(site || SITE_URL).replace(/\/*$/, '/') + DIGEST_LIBRARY_PATH];
  try { urls.push(RAW + DIGEST_LIBRARY_PATH); } catch (err) { /* sync.gs is not in this scope */ }
  const said = [];
  for (let i = 0; i < urls.length; i++) {
    const t = Date.now();
    try {
      const res = UrlFetchApp.fetch(urls[i] + '?v=' + Date.now(), { muteHttpExceptions: true, followRedirects: true });
      const code = res.getResponseCode();
      const text = code === 200 ? String(res.getContentText('UTF-8')) : '';
      if (code === 200 && /^\s*\[/.test(text.slice(0, 50)) && text.indexOf('"row_id":"') !== -1) {
        return { text: text, url: urls[i], ms: Date.now() - t, size: text.length };
      }
      said.push(urls[i] + ' answered ' + code + (code === 200 ? ' with something that is not the library' : ''));
    } catch (err) {
      said.push(urls[i] + ' could not be reached (' + S(err && err.message || err).slice(0, 120) + ')');
    }
  }
  return { error: 'the question library could not be fetched, so nothing could be marked — ' + said.join('; ') };
}

/* THE ROWS ASKED FOR, AND THE PREAMBLES OF THEIR PAPERS — one line each, found by its text and parsed
   alone. `"row_id":"Q-1"` cannot match `"row_id":"Q-10"` (the closing quote), and cannot sit inside a
   string value, where every quote is escaped. */
function digestLibraryFind_(text, ids) {
  const bounds = at => {
    const a = text.lastIndexOf('\n', at) + 1;
    let b = text.indexOf('\n', at);
    if (b === -1) b = text.length;
    return [a, b];
  };
  const parse = line => { try { return JSON.parse(line.replace(/,?\s*$/, '')); } catch (err) { return null; } };
  const rows = {}, papers = [];
  (ids || []).forEach(id => {
    const at = text.indexOf('"row_id":' + JSON.stringify(id));
    if (at === -1) return;
    const ab = bounds(at), q = parse(text.slice(ab[0], ab[1]));
    if (!q || S(q.row_id) !== id) return;
    rows[id] = q;
    const pid = S(q.paper_id || q.paper);
    if (pid && papers.indexOf(pid) === -1) papers.push(pid);
  });
  const pre = [];
  const tags = papers.map(pid => '"paper_id":' + JSON.stringify(pid));
  const mark = '"kind":"preamble"';
  for (let at = text.indexOf(mark); tags.length && at !== -1; ) {
    const ab = bounds(at), line = text.slice(ab[0], ab[1]);
    if (tags.some(t => line.indexOf(t) !== -1)) {
      const p = parse(line);
      if (p && p.kind === 'preamble' && ON_(p.active)) pre.push(p);
    }
    at = text.indexOf(mark, ab[1]);
  }
  return { rows: rows, pre: pre };
}

/* ---------- WHAT CAN BE MARKED, AND WHAT GEMINI IS GIVEN -------------------------------------------------- */
function digestMarkSort_(waiting, lib, tried) {
  const work = [], cannot = {};
  const no = why => { cannot[why] = (cannot[why] || 0) + 1; };
  waiting.forEach(W => {
    const k = S(W.r.key);
    if (/^pr:/.test(k)) return no('a practical’s worksheet box, which has no mark scheme');
    if (!/^q:/.test(k) || !DIGEST_KEY_SHAPE.test(k)) return no('not a question from the library');
    if ((Number(tried && tried[W.id]) || 0) >= DIGEST_MARK_TRIES) return no('Gemini gave no mark for it, twice');
    const M = digestMarkable_((lib.rows || {})[k.slice(2)], lib.pre || [], digestAnswer_(W.r));
    if (M.why) return no(M.why);
    work.push(Object.assign(M, { W: W, id: W.id }));
  });
  return { work: work, cannot: cannot };
}
/* AS MARK WITH AI IS OFFERED (`aiWanted_`, js/keypad.js), AND AS ITS PRESS IS CLAMPED (`aiMark`, dopost.gs). */
function digestMarkable_(q, pre, answer) {
  if (!q || q.kind !== 'question' || !ON_(q.active)) return { why: 'no longer in the library' };
  if (S(q.choices).split('|').map(x => x.trim()).filter(Boolean).length >= 2) return { why: 'a pick from a list with no right answer' };
  const type = norm(q.answer_type);
  if (type === 'drawing' || type === 'annotate') return { why: 'a drawing' };
  if (S(q.accept)) return { why: 'a question the phone checks, not the AI' };
  const plainScheme = digestPlain_(q.answer);
  if (!plainScheme) return { why: 'no mark scheme' };
  if (!S(answer)) return { why: 'no answer' };
  if (answer.length > AI_ANSWER_MAX) return { why: 'too long to mark' };
  const note = S(q.examiner_note);
  return {
    question: digestStems_(q, pre).concat([q.lead, q.html]).map(digestPlain_).filter(Boolean).join('\n\n').slice(0, AI_QUESTION_MAX),
    scheme: (plainScheme + (note ? '\nExaminer’s note: ' + note : '')).slice(0, AI_SCHEME_MAX),
    answer: answer,
    avail: Math.max(1, Math.min(40, Math.round(N(q.marks)) || 1)),
    essay: (type === 'written' || type === 'explain') && N(q.marks) >= 6 && !/\bmath|statistic/i.test(S(q.subject)),
  };
}
/* THE PREAMBLES IN FRONT OF A QUESTION, OUTERMOST FIRST — `stemIndex_` and `preamble_` (js/find.js) for
   one question: the paper's, the section's, the question's, then its letter's ("(d)" for d(ii)), each
   scope in `sort_order`. */
function digestStems_(q, pre) {
  return digestStemRows_(q, pre).filter(one => S(one.html)).map(one => one.html);
}
/* THE PREAMBLE ROWS THEMSELVES, for the email (18 Oct): one with a picture and no words is a stem the card
   draws too (`preamble_`: `x.html || x.diagram`); Gemini is given only the words (`digestStems_`). */
function digestStemRows_(q, pre) {
  const bare = v => S(v).toLowerCase().replace(/[()\s]/g, '');
  const pidOf = one => S(one && (one.paper_id || one.paper));
  const scopeOf = one => {
    const num = S(one.question), part = bare(one.part);
    if (num && /^[a-z]$/.test(part)) return 'l|' + num + '|' + part;
    if (num) return 'q|' + num;
    if (S(one.section)) return 's|' + S(one.section);
    return 'p';
  };
  /* A PART'S LETTER, READ AS `qRefBits_` READS IT: "d(ii)" and "dii" are (d); "ii" alone is a numeral. */
  const letterOf = part => {
    const s = bare(part);
    if (!s || /^(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/.test(s)) return '';
    const m = /^([a-z]?)(i{1,3}|iv|vi{0,3}|ix|xi{0,3})?$/.exec(s);
    return m ? m[1] : '';
  };
  const pid = pidOf(q), num = S(q.question), letter = letterOf(q.part);
  const want = ['p'];
  if (S(q.section)) want.push('s|' + S(q.section));
  if (num) { want.push('q|' + num); if (letter) want.push('l|' + num + '|' + letter); }
  const out = [];
  want.forEach(w => (pre || []).filter(one => pidOf(one) === pid && scopeOf(one) === w)
    .sort((a, b) => (N(a.sort_order) || 0) - (N(b.sort_order) || 0))
    .forEach(one => { if (S(one.html) || S(one.diagram)) out.push(one); }));
  return out;
}
/* THE LIBRARY'S MARKUP AS TEXT — `aiPlain_` (js/keypad.js) without a DOMParser, which Apps Script has not
   got: a fraction and a power written out first, a line for a break, a tag only where `<` is followed by
   a letter (a bare "x < 7" is maths, not a tag — `attemptWords_`'s rule), then the entities. */
function digestPlain_(html) {
  return S(html)
    .replace(/<sup>([^<]*)<\/sup>\s*(?:&frasl;|\u2044)\s*<sub>([^<]*)<\/sub>/g, '($1)/($2)')
    .replace(/<sup>([^<]*)<\/sup>/g, '^($1)')
    .replace(/<(br|\/p|\/li|\/div|\/tr)\b[^>]*>/gi, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?[a-z][^<>]*>/gi, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e) => {
      if (e.charAt(0) === '#') {
        const n = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
      }
      return Object.prototype.hasOwnProperty.call(DIGEST_ENTITIES, e) ? DIGEST_ENTITIES[e] : m;
    })
    .replace(/[ \t\u00a0]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}

/* THE ANSWER AS IT WAS SENT — not `S()`, which trims: an essay's last line break is part of what the child
   wrote, and the mark's row repeats the answer it marks exactly. */
function digestAnswer_(r) {
  const a = r && r.answer;
  return a === undefined || a === null ? '' : String(a);
}

/* ---------- THE MARK, WRITTEN ---------------------------------------------------------------------------
   `'wrote'`, `'already'` (this mark is on the sheet), `'newer'` (the child pressed that question again
   after the answer that was marked), `'busy'` (no lock in `DIGEST_MARK_LOCK_MS`) or `'gone'` (no tab).
   The row as `submissionsAppend_` writes a press — the answer with its apostrophe, the name and the words
   only where the tab has the column — but NOT through it: it stamps `submitted_at` with now, and a mark
   written on Monday would move last week's question into the new week. Then flushed, and the person's
   stamp moved (`submissionsTouched_`), so their phone's cached copy is rebuilt with the mark in it. */
function digestMarkWrite_(W, verdict, id) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(DIGEST_MARK_LOCK_MS)) return 'busy';
  try {
    const t = readCols_(TAB.submissions, ['person_id', 'key', 'event_id', 'submitted_at', 'pressed_at']);
    if (!t.sheet) return 'gone';
    const src = W.r, pid = S(src.person_id), k = S(src.key);
    let had = false, newer = false;
    t.rows.forEach(r => {
      if (S(r.event_id) === id) had = true;
      if (S(r.person_id) !== pid || S(r.key) !== k) return;
      const at = answerAtMs_(r.pressed_at) || answerAtMs_(r.submitted_at);
      if (at > W.ms || (at === W.ms && r._row > src._row)) newer = true;
    });
    if (had) return 'already';
    if (newer) return 'newer';
    const has = c => t.headers.indexOf(c) !== -1;
    const row = { person_id: pid, key: k, answer: "'" + digestAnswer_(src), verdict: verdict, submitted_at: src.submitted_at };
    if (has('label')) row.label = attemptLabel_(src.label);
    if (has('words')) row.words = attemptWords_(src.words);
    if (has('event_id')) row.event_id = id;
    if (has('pressed_at')) row.pressed_at = "'" + new Date(W.ms + 1).toISOString();
    if (!addRow(t, row)) return 'gone';
    try { SpreadsheetApp.flush(); } catch (err) {}
    submissionsTouched_(pid);
    try { delete _cache[TAB.submissions]; } catch (err) {}
    return 'wrote';
  } finally {
    lock.releaseLock();
  }
}

/* ---------- ONE PASS AT A TIME, AND WHAT GEMINI GAVE NO MARK FOR -------------------------------------------
   THE CLAIM: the nightly pass, the Sunday one and a run from the editor could overlap, and the id and the
   re-check stop a second ROW but not a second ASK. A claim older than `DIGEST_MARK_CLAIM_MS` is a pass
   Apps Script stopped at six minutes, and is taken over. Given back only by the pass that holds it. */
function digestMarkClaim_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(DIGEST_MARK_LOCK_MS)) return '';
  try {
    const props = PropertiesService.getScriptProperties();
    let c = {};
    try { c = JSON.parse(props.getProperty(DIGEST_MARK_CLAIM) || '{}') || {}; } catch (err) { c = {}; }
    if (Number(c.until) > Date.now()) return '';
    const id = Utilities.getUuid();
    props.setProperty(DIGEST_MARK_CLAIM, JSON.stringify({ id: id, until: Date.now() + DIGEST_MARK_CLAIM_MS }));
    return id;
  } finally {
    lock.releaseLock();
  }
}
function digestMarkLetGo_(id) {
  try {
    const props = PropertiesService.getScriptProperties();
    const c = JSON.parse(props.getProperty(DIGEST_MARK_CLAIM) || '{}') || {};
    if (c.id === id) props.deleteProperty(DIGEST_MARK_CLAIM);
  } catch (err) {}
}
function digestMarkTried_() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty(DIGEST_MARK_TRIED) || '{}') || {}; }
  catch (err) { return {}; }
}
/* KEPT ONLY FOR ANSWERS STILL WAITING, so the tally cannot grow past this week and last. */
function digestMarkTriedKeep_(tried, waiting) {
  const keep = {};
  waiting.forEach(W => { const n = Number(tried && tried[W.id]) || 0; if (n > 0) keep[W.id] = n; });
  try {
    const props = PropertiesService.getScriptProperties();
    if (Object.keys(keep).length) props.setProperty(DIGEST_MARK_TRIED, JSON.stringify(keep));
    else props.deleteProperty(DIGEST_MARK_TRIED);
  } catch (err) {}
}


/* ==================================================================================================
   `checkSundayEmail` — ONE CHECK THE OWNER RUNS FROM THE EDITOR, AND IT CHANGES NOTHING (12 Oct)

   *"i want to make sure everything is set up."* Every part of the Sunday email lives somewhere different
   — a cell on the config tab, three triggers, a Script Property, Google's mail quota, the family tab, the
   site's library, Gemini — and "is it set up" was six places to look, two of which (the triggers, the
   key) the owner cannot see without knowing where. So this reads each and says, in words, in the
   execution log: the mode and the hour; whether the Sunday trigger and the two marking passes are
   booked; whether GEMINI_API_KEY is there (never what it is) and which model marking asks; a live ask of
   the marker with a made-up question (no learner's work leaves the sheet for it); the mail quota; the
   library, fetched as the pass fetches it; and THIS WEEK — how many learners sent answers, how many have a
   parent who will be emailed, why each of the rest will not be, which children with a parent to email have
   sent nothing yet (no work, no email), how many answers are still unmarked and how many of those the pass
   can mark, and roughly how many the passes have room for before the email. The hours are the ones the
   triggers were BOOKED at (`DIGEST_BOOKED`), and a config cell changed since is said to be out of step.

   NOTHING WRITTEN, SENT OR BOOKED — `check-digest.js` runs it over the stubbed backend and fails on a
   cell, an email, a trigger or a Script Property it changed. Names are FIRST names, and the log is the
   owner's; nothing here is ever sent to anybody. Not in `RUNNABLE`: the live ask is a Gemini request,
   and `?run=` is a URL. Returns `{ lines }` for the checks. */
function checkSundayEmail() {
  const lines = [];
  const say = s => { lines.push(s); };
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const now = new Date();
  let cfg = {};
  try { cfg = config(); } catch (err) { say('The config tab could not be read (' + S(err && err.message || err) + '), so this is the defaults.'); }
  /* THE HOUR THE TRIGGERS WERE BOOKED AT, not the cell's (the review of 12 Oct): the cell changed after
     installing moves nothing, and this said "installed, at about 20:00" over a trigger firing at 18:00. */
  const mode = digestMode_(cfg), hour = digestBookedHour_(cfg), cellHour = digestHour_(cfg), reserve = digestReserve_(cfg);
  say('Backend ' + BACKEND_VERSION + ' — the code these triggers run, as saved in this editor.');

  const sun = digestScheduled_(DIGEST_RUN), mk = digestScheduled_(DIGEST_MARK_RUN), booked = digestBooked_();
  /* AN HOUR NOBODY RECORDED IS NOT THE CELL'S HOUR: triggers booked by a backend from before the record fire at
     whatever the cell said then, and this said "about 21:00" over a trigger firing at 18:00. */
  const unknownHour = booked < 0 && !!sun;
  say('THE EMAIL: ' + (mode === 'send' ? 'ON — it emails parents'
      : mode === 'preview' ? 'PREVIEW — it writes the digest_log tab and emails nobody'
      : 'OFF — nothing is sent') + ' (weekly_digest is "' + S(cfg.weekly_digest) + '"). '
    + (unknownHour ? 'The hour it goes at on Sundays was not recorded — see THE HOUR BOOKED below.'
       : 'It goes on Sundays at about ' + hour + ':00, London time.')
    + (mode === 'send' ? '' : ' Set weekly_digest to send on the config tab to email parents.'));

  say('THE TRIGGERS: the Sunday email is ' + (sun === null ? 'unknown (the triggers could not be listed)'
      : sun === 1 ? 'installed' : sun ? 'installed ' + sun + ' times (run installWeeklyDigest to leave one)'
      : 'NOT installed (run installWeeklyDigest)') + '; the AI marking passes are '
    + (mk === null ? 'unknown' : mk === 2 ? 'installed (every night at about ' + DIGEST_MARK_NIGHT + ':00, and '
        + (hour ? 'on Sunday at about ' + (hour - 1) : 'on Saturday at about 23') + ':00)'
      : mk ? plural(mk, 'trigger') + ', wanted 2 (run installWeeklyDigest)' : 'NOT installed (run installWeeklyDigest)') + '.');

  /* THE HOUR BOOKED, ON A LINE OF ITS OWN (18 Oct). Apps Script cannot read the hour a trigger fires at, so
     `installWeeklyDigest` writes down the hour it booked (`DIGEST_BOOKED`) and this prints it — and WARNS, in
     words, when the config cell says another hour now: the owner moved `weekly_digest_hour` from 18 to 21 on
     the day, and a cell changed after installing moves nothing until the triggers are booked again. */
  say('THE HOUR BOOKED: ' + (booked >= 0
      ? 'installWeeklyDigest booked the email for about ' + booked + ':00 on Sundays, London time (recorded in Script Properties as '
        + DIGEST_BOOKED + ').' + (booked !== cellHour
          ? ' WARNING: weekly_digest_hour on the config tab now says ' + cellHour + ', but the email still goes at about ' + booked
            + ':00 — run installWeeklyDigest again to move it to ' + cellHour + ':00.'
          : ' The config tab says the same.')
      : unknownHour ? 'NOT recorded — the triggers were booked by an older backend, and Apps Script cannot read a trigger’s hour back. '
        + 'WARNING: run installWeeklyDigest again, so the email is booked at ' + cellHour + ':00 (weekly_digest_hour) and the hour is recorded.'
      : 'nothing is booked yet; installWeeklyDigest will book ' + cellHour + ':00 (weekly_digest_hour on the config tab).'));

  const off = digestMarkOff_(cfg);
  let apiKey = '';
  try { apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || ''; } catch (err) { apiKey = ''; }
  const models = aiModels_(cfg);
  say('AI MARKING: ' + (off ? off.replace(/^off: /, 'OFF — ') : 'on') + '. GEMINI_API_KEY is '
    + (apiKey ? 'set in Script Properties' : 'NOT set — add it under Project Settings → Script Properties, or nothing is marked')
    + '. Marking asks ' + models.join(', then ') + ', and never spends anybody’s ai_marks_per_day.');

  if (apiKey) {
    const t = Date.now();
    let got = null;
    try { got = aiMarkAsk_(apiKey, models, 'Work out 2 + 3.', '5', '5', 1, false); }
    catch (err) { got = { error: S(err && err.message || err) }; }
    say('LIVE TEST OF THE MARKER (a made-up question, "Work out 2 + 3.", answered "5"): '
      + (got && !got.error ? 'Gemini answered — ' + got.awarded + ' of 1 mark, from ' + S(got.model || models[0])
         : 'Gemini did NOT mark it — ' + S(got && got.error)) + ' (' + ((Date.now() - t) / 1000).toFixed(1) + ' s).');
  } else {
    say('LIVE TEST OF THE MARKER: not asked — there is no key to ask with.');
  }

  const quota = digestQuota_();
  say('MAIL: ' + plural(quota, 'email') + ' left in today’s quota; the Sunday run keeps ' + reserve + ' back for PIN resets and notices.');

  /* THE LIBRARY, AS THE PASS FETCHES IT — the one part of this nobody can see from the editor. */
  const lib = digestLibrary_(S(cfg.site_url) || SITE_URL);
  say(lib.error ? 'THE QUESTION LIBRARY: NOT fetched — ' + lib.error + '.'
    : 'THE QUESTION LIBRARY: fetched ' + (lib.size / 1e6).toFixed(1) + ' million characters in '
      + (lib.ms / 1000).toFixed(1) + ' s from ' + lib.url + '.');

  const week = digestWeek_(now);
  const noTab = digestNoSubmissions_();
  if (noTab) {
    say('THIS WEEK: ' + noTab);
  } else {
    let plan = null, rows = [];
    try { rows = read(TAB.submissions).rows; plan = digestPlanNow_(week); }
    catch (err) { say('THIS WEEK: could not be planned (' + S(err && err.message || err) + ').'); }
    if (plan) {
      const reached = plan.learners.filter(L => !L.why);
      say('THIS WEEK (' + digestSpan_(week) + ', so far): ' + plural(plan.learners.length, 'learner') + ' sent answers; '
        + reached.length + ' of them will have a parent emailed (' + plural(plan.emails.length, 'email') + ').');
      plan.learners.filter(L => L.why).forEach(L => {
        say('  NOT REACHED — ' + (S(L.first) || 'a learner with no first name') + ': ' + digestWhyNot_(L) + '.');
      });
      /* AND WHO GETS NOTHING BECAUSE THERE IS NOTHING YET (the review of 12 Oct). A child whose parent can be
         emailed, with no answer this week, was in no line at all — and that is exactly the owner's question
         (*"ensure that this sunday she will recieve"*): an email goes only for a week with work in it. */
      const did = {};
      plan.learners.forEach(L => { did[L.id] = 1; });
      let people = [];
      try { people = read(TAB.people).rows; } catch (err) { people = []; }
      const idle = [];
      people.forEach(p => {
        const id = S(p && p.person_id);
        if (!id || did[id]) return;
        if (digestReach_(id, acceptedParents).to.length) idle.push(S(p.first_name) || 'a learner with no first name');
      });
      if (idle.length) say('  NO ANSWERS YET — ' + idle.join(', ') + ': a parent can be emailed, but no email goes unless '
        + (idle.length === 1 ? 'they answer' : 'each answers') + ' a question by about ' + hour + ':00 on Sunday.');
    }
    const from = digestWeekToSend_(now).start, today = digestDay_(now);
    const waiting = digestMarkWaiting_(rows, from, today);
    let markable = 0;
    if (!waiting.length) {
      say('NOT MARKED YET (sent since ' + from + '): none.');
    } else {
      const found = lib.error ? null : digestLibraryFind_(lib.text,
        waiting.map(W => S(W.r.key)).filter(k => /^q:/.test(k) && DIGEST_KEY_SHAPE.test(k)).map(k => k.slice(2)));
      if (!found) say('NOT MARKED YET (sent since ' + from + '): ' + plural(waiting.length, 'answer') + ', and none can be marked until the library can be fetched.');
      else {
        const sorted = digestMarkSort_(waiting, found, digestMarkTried_());
        const why = Object.keys(sorted.cannot).map(w => sorted.cannot[w] + ' (' + w + ')').join(', ');
        say('NOT MARKED YET (sent since ' + from + '): ' + plural(waiting.length, 'answer') + '. The marking pass can mark '
          + sorted.work.length + (why ? '; it cannot mark ' + why + ' — the email says "not marked" beside those' : '') + '.');
        markable = sorted.work.length;
      }
    }
    /* HOW MANY FIT BEFORE THE EMAIL — what the triggers will really do, not what is markable (the review of
       12 Oct: this said "can mark 60" over a schedule with room for 16). */
    const room = digestMarkRoom_(now, hour);
    say(!room ? 'ROOM BEFORE THE EMAIL: this week’s email has gone.'
      : 'ROOM BEFORE THE EMAIL: about ' + room.total + ' answers — ' + room.nights + ' nightly pass' + (room.nights === 1 ? '' : 'es') + ' (about ' + room.per
        + ' each), then from about ' + (hour ? hour - 1 : 23) + ':00 a run-up of about ' + room.runup + ' pass' + (room.runup === 1 ? '' : 'es') + ' until a quarter of an hour before, '
        + 'then about ' + room.final + ' as it goes; a guess at about ' + room.askSecs + ' s an answer, and slower answers mean fewer.'
        + (markable > room.total ? ' FEWER THAN THE ' + markable + ' WAITING: about ' + (markable - room.total) + ' would go out "not marked" unless they are marked sooner.' : ''));
  }
  say('Nothing was changed: no row written, no email sent, no trigger booked.');
  Logger.log(lines.join('\n'));
  return { lines: lines };
}
/* ---------- ROOM BEFORE THE EMAIL, ROUGHLY — `checkSundayEmail`'s estimate, in words, never a promise ----
   Per pass: the asks that fit its time at one every `DIGEST_MARK_GAP_MS` plus Gemini's own (`ask`, a guess:
   about 4 s for an ordinary answer, longer for an essay), capped at `DIGEST_MARK_MAX`. The nightly passes
   still to come before the run-up, the run-up's passes (one every `DIGEST_MARK_AGAIN_MS` + its budget,
   from an hour before — or now — until `DIGEST_MARK_CLEAR_MS` before), and the email's own last pass.
   Null once this week's email has gone. */
function digestMarkRoom_(now, hour) {
  const ask = 4000;
  const fit = ms => Math.min(DIGEST_MARK_MAX, Math.floor(ms / (DIGEST_MARK_GAP_MS + ask)) + 1);
  const sendAt = digestSendAt_(now, hour);
  if (!sendAt) return null;
  const left = sendAt - now.getTime();
  const wall = Utilities.formatDate(now, DIGEST_TZ, 'yyyy-MM-dd HH:mm');
  const nowMin = Number(wall.slice(11, 13)) * 60 + Number(wall.slice(14, 16));
  let nights = 0;
  for (let k = 0; k <= 7; k++) {
    const off = (k * 1440 + DIGEST_MARK_NIGHT * 60 - nowMin) * 60000;
    if (off > 0 && off < left - DIGEST_MARK_RUNUP_MS) nights++;
  }
  const span = Math.min(left, 3600e3) - DIGEST_MARK_CLEAR_MS;
  const runup = span > 0 ? Math.ceil(span / (DIGEST_MARK_AGAIN_MS + DIGEST_MARK_BUDGET_MS)) : 0;
  const per = fit(DIGEST_MARK_BUDGET_MS), final = fit(DIGEST_MARK_FINAL_MS);
  return { nights: nights, runup: runup, per: per, final: final, askSecs: ask / 1000, total: (nights + runup) * per + final };
}

/* WHY A LEARNER WILL NOT BE REACHED, IN THE OWNER'S WORDS — from `digestPlan_`'s reasons, naming each
   parent by first name. */
function digestWhyNot_(L) {
  if (!(L.skipped || []).length) return /people tab/.test(S(L.why)) ? 'not on the people tab' : 'no parent has accepted a link to them';
  const said = { 'no email address': 'has no email address', 'email not confirmed': 'has not confirmed their email address',
                 'asked not to get it': 'said no to these emails', 'same address as another parent': 'shares an address with another parent' };
  return L.skipped.map(p => 'parent ' + (S(p.first) || 'with no first name') + ' ' + (said[p.why] || p.why)).join('; ');
}
