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
   The steps, and the decisions that go with them, are in
   docs/history/280-the-weekly-parent-email-is-built-and-switched-off-a-sunday-r.md. (This line named
   `pending-digest.md`, a file that never existed — the note was numbered when it was filed.)

   AND SINCE 8 OCT IT IS THE ONLY PARENT EMAIL, AND IT SAYS WHAT EACH QUESTION ASKED. For two days
   there was a second one, after each session and then every day of work (docs/history/291, 294), which
   printed each question's own words. The owner, shown it: *"should be at the end of the week that it
   send to parents all they done that week"*, and then *"delete daily email stuff. idk what thats
   about."* So that email is gone — its file, its tab, its switch, its card, its opt-out column — and
   what it had that parents should get is here: every question of the week with its words
   (`digestQuestions_`, lifted out of it), and the words plumbing it needed (SCHEMA.attempts `words`,
   `digestWordsSafe_`). `digestMail_` and `digestNoAttempts_` were shaped to be shared with it and are
   this email's own again. See docs/history/295-one-email-to-parents-at-the-end-of-the-week.md.

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
   `DIGEST_MODES`, `DIGEST_TZ`, `DIGEST_RUN`, `DIGEST_WEEK_LIST_MAX`, `DIGEST_WORDS_SHOWN` and the
   rest — are in constants.gs for that reason.
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
     unreachable  learners nobody can be told about, each with the reason in words

   IT TOOK A RENDER AND AN OPT-OUT COLUMN AS WELL, for the email after each session, which ran this
   with a "week" one day long. That email is gone (docs/history/295), and so are the two arguments. */
function digestPlan_(week, attemptRows, peopleRows, parentsOf, look) {
  const inWeek = d => !!d && d >= week.start && d <= week.end;
  const byId = {};
  (peopleRows || []).forEach(p => { const id = S(p && p.person_id); if (id && !byId[id]) byId[id] = p; });

  /* ONE QUESTION, HOWEVER MANY BOXES IT HAS. A practical's worksheet is three answer boxes, each
     marked done under the practical's key with its slot on the end (`pr:…#iv`, `#dv`, `#cv` — see
     `guideBox_` in js/find.js), so one worksheet filled in was three rows and an email saying "3
     questions" with three raw keys in it. Rows are joined on the key before the `#`: the earliest
     first day, the latest last day, the first name any of them carries. */
  /* AND NO "60 min" IN A NAME. A practical's card line is `Biology · Required practical · 60 min`, and
     the phone built its name from that line, so a parent read how long the card guesses a practical
     takes as though it were how long their child spent on it. The phone no longer sends it
     (`doneLabel_` in js/find.js); the rows already on the sheet still carry it, and it comes out here,
     where the email reads every label. */
  const tidy = v => attemptLabel_(v).split(' · ').filter(x => !/^\d+ min$/.test(x)).join(' · ');
  const joined = {};
  (attemptRows || []).forEach(r => {
    const pid = S(r && r.person_id), q = S(r && r.question_key).split('#')[0];
    if (!pid || !q) return;
    const first = isoDate_(r.first_done), last = isoDate_(r.last_done);
    const id = pid + '\u0001' + q, J = joined[id];
    if (!J) { joined[id] = { pid: pid, key: q, first: first, last: last, label: tidy(r.label), words: attemptWords_(r.words), times: N(r.times) || 1 }; return; }
    if (first && (!J.first || first < J.first)) J.first = first;
    if (last && last > J.last) J.last = last;
    if (!J.label) J.label = tidy(r.label);
    if (!J.words) J.words = attemptWords_(r.words);
    J.times = Math.max(J.times, N(r.times) || 1);
  });

  const per = {};
  Object.keys(joined).forEach(id => {
    const J = joined[id];
    const fresh = inWeek(J.first);
    if (!fresh && !inWeek(J.last)) return;
    const L = per[J.pid] || (per[J.pid] = { id: J.pid, fresh: [], again: [] });
    /* THE NAME A PARENT CAN READ — see SCHEMA.attempts for why the backend cannot look a key up for
       itself. BUT ONLY TEXT THAT CANNOT PASS FOR A MESSAGE FROM THE BUSINESS: the label came off a
       phone, and printed under "@family." a label reading "NOTICE: fees overdue, pay at https://…" is
       the business saying it. `digestSafe_` turns away anything with a link or an address in it.
       NEVER THE KEY IN ITS PLACE: this printed a key in the library's shape when there was no name,
       until the email listed each question with its words — and `q:Q-9MA031-2206-1` among them reads
       to a parent as a fault. A question with no printable name is counted and not listed — it is in
       "…and N more" — rather than dropped, so the number the email gives stays true. */
    const label = digestSafe_(J.label) ? J.label : '';
    /* AND THE QUESTION'S WORDS (SCHEMA.attempts), by the same rule over the whole of them: phone text
       with a link or an address in it is not printed (`digestWordsSafe_`). Blank is a real answer — a
       row from before the phone sent them — and the name stands alone. AND ONLY UNDER A KEY IN THE
       LIBRARY'S OWN SHAPE: an invented key cannot carry a paragraph. */
    const words = label && DIGEST_KEY_SHAPE.test(J.key) && digestWordsSafe_(J.words) ? J.words : '';
    const item = { key: J.key, label: label, words: words, hidden: !label, last: J.last, times: J.times };
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
    /* THE CHILD'S FIRST NAME GOES IN THE SUBJECT LINE, and it is a cell the child can edit. A name
       that is a link, an address or a sentence is "Your child" instead. */
    L.first = me && digestSafe_(me.first_name) && S(me.first_name).length <= 30 ? S(me.first_name) : '';
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
        /* NEVER AN ADDRESS NOBODY CONFIRMED. `verified=PENDING` is a sign-up whose link was never
           clicked — a typo'd address, as often as not, which is a stranger's inbox. An admin's
           `linkChild` writes `accepted` without asking the address anything, so the link alone is
           no proof, and every Sunday a stranger would be told about somebody's child. Blank is an
           account from before verification existed, and is not pending. `addressPending_` (people.gs)
           is this rule for every mail now, so the digest and `notify` cannot disagree about it. */
        if (addressPending_(p)) { L.skipped.push(Object.assign(who, { why: 'email not confirmed' })); return; }
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

   THE LIST IS EVERY QUESTION, EACH WITH ITS OWN WORDS, since 8 Oct. It was a line of names — "New this
   week", "Gone back to", `- Maths · Paper 1 · Q3` — until the owner, shown a daily email that printed
   what each question asked, said *"should be at the end of the week that it send to parents all they
   done that week"*: this is the email parents get, and it says that, for the week. So the list is
   `digestQuestions_` — grouped by paper, the shared stem once, "Q5a: <the ask>", "(again)" for one
   first done before this week, a paper with no words its line of numbers, never a raw key — capped at
   `DIGEST_WEEK_LIST_MAX`, because a week is up to seven days of it.

   THE PLAIN BODY IS NOT AN AFTERTHOUGHT. MailApp sends both and a mail client shows whichever it
   prefers; the plain one is also what the admin's Preview prints. Every value in the HTML goes through
   `digestEsc_` — a label came off a phone. */
function digestRender_(L, P, week, look) {
  const brand = S(look && look.brand) || BRAND_NAME;
  const site = S(look && look.site) || SITE_URL;
  /* THE FIRST NAME ONLY — `digestPlan_` has already turned away one that is not a name — and never
     the full display name in its place, which is built from the same editable cells. */
  const kid = S(L.first) || 'Your child', kids = S(L.first) ? kid : 'your child';
  const qs = x => x + ' question' + (x === 1 ? '' : 's');
  const n = L.fresh.length + L.again.length;
  const hello = S(P && P.first) ? 'Hello ' + S(P.first) + ',' : 'Hello,';
  /* "WORKED ON", NOT "DID". `markDone` is the first keystroke in an answer box, or enough options
     chosen — a wrong answer, or one character, is a question marked done. A parent reads "did" as
     finished work, and an email that implied it would be claiming more than the sheet knows.

     AND "UP TO" THE HOUR IT IS SENT. The run is at `weekly_digest_hour` on the Sunday (18:00), and a
     question first done after that is in nobody's week: next week's starts on the Monday, and the
     sheet keeps days, not times. Said rather than hidden, so "this week" is not a claim to the whole
     of Sunday. See CONFIG_DEFAULTS for the trade the hour makes. */
  const hour = look && typeof look.hour === 'number' ? look.hour : -1;
  const upTo = hour >= 0 && hour <= 23
    ? ', up to ' + (hour === 0 ? 'midnight' : hour === 12 ? 'noon' : (hour % 12) + (hour < 12 ? 'am' : 'pm')) + ' on Sunday'
    : '';
  /* THE BUSINESS'S NAME ENDS IN A FULL STOP, so it is the sender's name and the last word of the footer
     and never followed by more punctuation — "on @family.:" and "@family.." are what it reads as
     anywhere else. */
  const lead = 'This week (' + digestSpan_(week) + upTo + ') ' + kids + ' worked on ' + qs(n)
    + (L.fresh.length && L.again.length ? ' — ' + L.fresh.length + ' new and ' + L.again.length + ' gone back to.' : '.');

  /* THE WEEK'S QUESTIONS, AT MOST `DIGEST_WEEK_LIST_MAX`, THEN "…and N more." A question with no name
     `digestPlan_` would print — hidden, or only its own key — is counted in `n` and never listed, so it
     is part of the "more". */
  const Q = digestQuestions_(L.fresh, L.again, DIGEST_WEEK_LIST_MAX);

  /* THE CHILD CAN SEE THEM, NOT THE PARENT. `attemptsFor_` (doget.gs) sends a signed-in person their
     OWN questions and nobody else's — a parent who signed in to look would find none of these, so
     "see them on the site" was a promise to the wrong person. And "which ones" when the list named
     none: "see them" over no list points at nothing. */
  const sees = kid + (Q.printed ? ' can see them on ' : ' can see which ones on ');
  const link = sees + 'the site: ' + site;
  const foot = 'You get this because you are ' + (S(L.first) ? kid + '’s parent' : 'a parent') + ' on ' + brand + (/[.!?]$/.test(brand) ? '' : '.')
    + ' To stop these emails, reply to this one and say so.';
  const subject = kid + '’s week: ' + qs(n);

  const text = [hello, '', lead, ''].concat(Q.lines, [link, '', foot]).join('\n');
  const html = '<p>' + digestEsc_(hello) + '</p><p>' + digestEsc_(lead) + '</p>' + Q.html
    + '<p><a href="' + digestEsc_(site) + '">' + digestEsc_(sees + brand) + '</a></p>'
    + '<p><small>' + digestEsc_(foot) + '</small></p>';
  return { subject: subject, text: text, html: html };
}

/* ---------- THE QUESTIONS, EACH WITH ITS OWN WORDS ----------------------------------------------------------
   *"with the exact questions for each"*. A heading per paper (the label before its last ` · `), then a
   line per question: its number, and what it asked (SCHEMA.attempts `words`). The stem a question's
   parts share is printed ONCE, above the first of them — `words` is the stem, a `---` line, then the
   part's own ask — so Q5a, Q5b and Q5c read as the paper prints them rather than as one scene three
   times. Each is cut to what reads on a phone (`DIGEST_WORDS_SHOWN`, `DIGEST_STEM_SHOWN`), and the link
   at the end of the email is where the whole question is drawn, with its picture. Headings sort
   alphabetically, numbers as numbers (Q2 before Q10); an item in `again` says "(again)".

   A PAPER WITH NO WORDS FOR ANY OF ITS QUESTIONS — rows marked before the phone sent them, until their
   learner next loads the site — is the old line of numbers, `Q3, Q7 (again)`.

   A RAW KEY NEVER GOES IN THE EMAIL. A question with no printable name — no label, an unsafe one
   (`digestPlan_` blanks it), or one that is only its own key — is counted and not listed: it is in
   "…and N more", which is printed only under a list that named something. Under no list at all the
   caller says the child can see WHICH ones.

   WRITTEN FOR THE DAILY EMAIL (docs/history/294) and LIFTED OUT UNCHANGED — byte for byte, measured
   over 400 renders — when the owner made the weekly one the email parents get; the daily one was then
   removed (295), and this is what it left behind.

   PURE. `fresh` and `again` are `digestPlan_`'s items (`key`, `label`, `words`, `hidden`). Returns
     lines    the plain body's lines for the list — per paper its heading, its questions and a blank
              line, then "…and N more." and a blank line when something was left out of a list that
              named anything
     html     the same list, every value through `digestEsc_`
     printed  how many questions it names (a one-segment name with no words names its one question)
     more     how many it does not: hidden, only a key, or past `max` */
function digestQuestions_(fresh, again, max) {
  fresh = fresh || []; again = again || [];
  const n = fresh.length + again.length;
  const cut = (t, most) => { const x = S(t).replace(/\s*\n+\s*/g, ' ').trim(); return x.length > most ? x.slice(0, most - 1).replace(/\s+\S*$/, '') + '…' : x; };
  const heads = {};
  fresh.map(q => [q, false]).concat(again.map(q => [q, true])).forEach(([q, before]) => {
    const label = S(q && q.label);
    if (!label || (q && q.hidden) || label === S(q && q.key)) return;
    const bits = label.split(' · ');
    const head = bits.length > 1 ? bits.slice(0, -1).join(' · ') : label;
    const num = bits.length > 1 ? bits[bits.length - 1] : '';
    /* THE STEM AND THE ASK, either side of a `---` line — which may be the last line, when a part's own
       ask is only its picture and the cell was trimmed. */
    const w = S(q && q.words), cutAt = /\n---(?:\n|$)/.exec(w);
    (heads[head] || (heads[head] = [])).push({
      num: num, again: before, stem: cutAt ? w.slice(0, cutAt.index) : '', ask: cutAt ? w.slice(cutAt.index + cutAt[0].length) : w });
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
    shown.push({ head: h, items: take.filter(it => it.num || it.ask), worded: take.some(it => S(it.ask)) });
  });
  const more = n - printed;
  /* A NAME OF ONE SEGMENT HAS NO NUMBER, so no tag: its words stand alone, never ": What is 7 × 8?". */
  const tag = it => (it.num ? it.num + (it.again ? ' (again)' : '') : '');

  const lines = [];
  const parts = [];
  shown.forEach(h => {
    lines.push(h.head);
    let html = '<p><b>' + digestEsc_(h.head) + '</b></p>';
    if (!h.worded) {
      if (h.items.length) { lines.push(h.items.map(tag).join(', ')); html = '<p><b>' + digestEsc_(h.head) + '</b><br>' + digestEsc_(h.items.map(tag).join(', ')) + '</p>'; }
    } else {
      let stem = '';
      h.items.forEach(it => {
        if (it.stem && it.stem !== stem) {
          lines.push(cut(it.stem, DIGEST_STEM_SHOWN));
          html += '<p><i>' + digestEsc_(cut(it.stem, DIGEST_STEM_SHOWN)) + '</i></p>';
        }
        stem = it.stem;
        const said = cut(it.ask, DIGEST_WORDS_SHOWN);
        lines.push(tag(it) && said ? tag(it) + ': ' + said : tag(it) || said);
        html += '<p>' + (it.num ? '<b>' + digestEsc_(tag(it)) + '</b>' + (said ? ' — ' : '') : '') + digestEsc_(said) + '</p>';
      });
    }
    lines.push('');
    parts.push(html);
  });
  if (printed && more > 0) lines.push('…and ' + more + ' more.', '');
  return { lines: lines, html: parts.join('') + (printed && more > 0 ? '<p>…and ' + more + ' more.</p>' : ''),
           printed: printed, more: more };
}

function digestEsc_(s) {
  return S(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- TEXT THAT CAME OFF A PHONE, AND MAY GO OUT UNDER THE BUSINESS'S NAME ---------------------
   ESCAPING IS NOT ENOUGH. `digestEsc_` stops a label being markup; it does not stop it being a
   message. A learner's phone sends the label, the key and their own first name, and a reviewer sent
   "NOTICE FROM @family.: fees overdue, pay today at https://…" through the real `markDone` and saw it
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
   constant beside it as the floor, so a broken config tab still signs the email. And the hour the
   Sunday run goes at, which the email states as the end of the week it covers. */
function digestLook_() {
  let brand = '', site = '', cfg = {};
  try { brand = S(brandName()); } catch (err) {}
  try { cfg = config() || {}; site = S(cfg.site_url); } catch (err) {}
  return { brand: brand || BRAND_NAME, site: site || SITE_URL, hour: digestHour_(cfg) };
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

   A RUN THAT DID NOT FINISH THROWS. Apps Script throws a trigger's return value away and emails the
   owner only when the function throws, so a `{ error }` or a `{ held: 3 }` handed back from here was a
   run the executions page called "Completed" — and a held email nobody noticed by the next Sunday is
   never sent, because `digestWeekToSend_` has moved on to the new week. So anything short of every
   email sent (or previewed), or knowingly skipped, is an exception with the counts in its message: the
   failure email Google sends is the notice. `digestRun_` itself returns, because the checks and the
   admin want the counts, not a stack. */
function weeklyDigestRun(e) {
  const out = digestRun_(new Date());
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
   writes were refused. `markDone` (`tryLock(5000)`) answered "Busy" and the phone's backlog re-sent the
   keys without their names; `aiMarkCount_` answered -1 and a student was told their AI marks were used
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
  /* NO `attempts` TAB IS NOT A QUIET WEEK. `read` answers a missing tab with no rows, so this run
     planned nothing, wrote nothing, and the Sunday looked like a week nobody worked — on a Ledger
     that was in fact never told what anybody did. It stops here and says so, and the throw in
     `weeklyDigestRun` is the email that says it to the owner. */
  const noAttempts = digestNoAttempts_();
  if (noAttempts) return { mode: mode, error: noAttempts };
  /* THE PLAN IS MADE WITHOUT THE LOCK. It reads `attempts` and `people` and writes nothing; what it
     decides is checked against the log, fresh, under the lock, one email at a time. */
  const week = digestWeekToSend_(now);
  const plan = digestPlanNow_(week);
  const out = { mode: mode, week: { start: week.start, end: week.end }, learners: plan.learners.length,
                emails: plan.emails.length, previewed: 0, sent: 0, already: 0, held: 0, failed: 0, busy: 0,
                unreachable: plan.unreachable.length, skipped: 0 };
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
          status: 'opted out', at: new Date(), note: 'weekly_email on their row says no' });
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
      MailApp.sendEmail({ to: m.to, subject: m.subject, body: m.text, htmlBody: m.html, name: o.brand || BRAND_NAME });
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

/* ---------- NO `attempts` TAB, IN WORDS ----------------------------------------------------------------
   THE OWNER'S LEDGER DID NOT HAVE ONE until 6 Oct, and nothing said so: `read` answers a missing tab
   with no rows, which is exactly what a week of nobody working looks like. The weekly preview printed
   "Nobody has done a question yet this week" over a sheet that had never been told what anybody did.
   Only `markDone` said it, to a phone, where nobody reads it. So the run and the Preview ask this
   before they plan, and a run with something to send stops on it. '' when the tab is there. */
function digestNoAttempts_() {
  let there = false;
  try { there = !!read(TAB.attempts).sheet; } catch (err) { there = false; }
  return there ? ''
    : 'The Ledger has no attempts tab, so nothing says what anybody did. Open /exec?setup=1 (ensureSchema) '
    + 'to add it; questions marked from then on are what these emails report. Nothing was sent.';
}

/* THE LOG AS IT IS NOW — its cached copy dropped first, because a copy read before the lock was taken
   is the one another run has since written to. Only this tab's: `clearCache()` would have the next
   read of `people` and `attempts`, for nothing, go back to the sheet once per email. */
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


/* ---------- BOOKING THE SUNDAY, BY HAND ---------------------------------------------------------------
   RUN FROM THE APPS SCRIPT EDITOR'S FUNCTION LIST, ONCE, AND BY NOBODY ELSE. Not from `installTriggers`,
   not from `?run=`, not from `doGet` — a trigger booked as a side effect of something else is a Sunday
   email nobody decided to start. `check-digest.js` reads the backend for a call to either and fails.

   THE OLD ONE GOES FIRST, the `installWarmTrigger` rule: run twice, it still leaves exactly one, and
   changing `weekly_digest_hour` is running this again. `inTimezone` says London out loud rather than
   trusting the project's own setting, so 18:00 stays 18:00 across the clocks changing.

   INSTALLED IS NOT ON. With `weekly_digest` at `off` the trigger fires every Sunday and returns at its
   first line; `preview` and `send` are a cell on the config tab, not another run of this.

   AND THE OLD EMAIL'S HOURLY CHECK GOES WITH IT. The email after each session was booked the same way
   (from the editor, an hourly trigger) and was removed on 8 Oct; a trigger left booked for it fires
   every hour into a function that no longer exists, fails, and Google emails the owner each failure.
   The owner runs this anyway to switch the weekly email on, so this is where it is taken away — every
   trigger whose handler is in `DIGEST_RETIRED_RUNS`, and only those — and the log line says how many. */
function installWeeklyDigest() {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const hour = digestHour_(cfg);
  const removed = removeWeeklyDigest().removed;
  let retired = 0;
  ScriptApp.getProjectTriggers().forEach(t => {
    if (DIGEST_RETIRED_RUNS.indexOf(t.getHandlerFunction()) !== -1) { ScriptApp.deleteTrigger(t); retired++; }
  });
  ScriptApp.newTrigger(DIGEST_RUN).timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(hour)
    .inTimezone(DIGEST_TZ).create();
  const mode = digestMode_(cfg);
  const out = { installed: 'every Sunday at about ' + hour + ':00, London time', replaced: removed, mode: mode,
           means: mode === 'off' ? 'it runs and does nothing until weekly_digest on the config tab is preview or send'
                : mode === 'preview' ? 'it writes what it would send to the digest_log tab and sends nothing'
                : 'it EMAILS PARENTS',
           oldHourly: retired ? 'removed the old after-session email’s hourly check (' + retired + ' trigger'
                                + (retired === 1 ? '' : 's') + ')' : 'no old after-session email check was booked' };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
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
  /* AND WHETHER THERE IS ANYTHING TO READ: with no `attempts` tab the plan is empty for a reason, and
     the card says the reason rather than "nobody has done a question". */
  const warning = digestNoAttempts_();
  /* `words` SAYS THIS BACKEND LISTS EACH QUESTION WITH ITS WORDS. The Preview is answered by the
     deployed web-app VERSION, the Sunday trigger runs the code as saved — so after a pull with no new
     version, the card would show the old list of names over a run that sends the new one. A reply
     without it is that older backend, and the card says to make a new version (js/digest.js). */
  return {
    success: true, mode: digestMode_(cfg), hour: digestHour_(cfg), scheduled: digestScheduled_(),
    attempts: !warning, warning: warning, words: true,
    week: { start: week.start, end: week.end, span: digestSpan_(week) },
    learners: plan.learners.map(L => ({ id: L.id, name: L.name, count: L.count, fresh: L.fresh.length,
      again: L.again.length, to: L.to.map(p => p.name), why: L.why })),
    emails: plan.emails.map(m => ({ learner: m.learner, parent: m.parent, to: m.to, subject: m.subject,
      text: m.text, html: m.html, count: m.count })),
    unreachable: plan.unreachable,
  };
}
