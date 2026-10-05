## The weekly parent email is built and switched off: a Sunday run, a log, a preview, and nothing that starts it

Asked for as *"i need you to make something which triggers every sunday. it checks what the student
has done that week and records the questions and send it in an emial to parents. for now dont
actually make it but make the infrastructure to set it up so that in the future we will actually
wire it up and make it properlly."*

So everything needed to switch it on is in place, and **nothing sends an email or books a trigger**.
Three things have to happen before one parent gets one email, all of them done by the owner, none in
code: the config row says `preview` or `send`; `installWeeklyDigest` is run once from the Apps Script
editor; and `preview` is read for a Sunday or two first. `check-digest.js` fails if anything in the
backend or the site starts calling the run or the installer.

### What exists

**`backend/digest.gs`** (in `files.json`), functions only — its constants are in constants.gs, the
rule every file but that one keeps.

- **A week is Monday 00:00 to Sunday 23:59, London.** London because that is whose calendar the days
  on `attempts` are: `markDone` writes `yyyy-MM-dd` as the phone's day or London's today. BST is
  handled by converting an instant to a date exactly once, with `Utilities.formatDate(…,
  'Europe/London', …)`, and doing everything after that as calendar arithmetic on `Date.UTC`, which
  has no daylight saving. `now - 7 days` or `getDay()` on the server clock would put 00:30 on a
  summer Monday in the week just gone. A run on a Sunday sends that week; a run by hand on any other
  day sends the week that ended last Sunday — so a Monday rerun after the quota ran out finishes the
  week it was sending instead of starting an empty one.
- **The plan is a pure function** (`digestPlan_`): the attempts rows, the people rows and a
  `parentsOf` go in; per learner, the questions done that week come out — **new** (`first_done` in
  the week) and **done again** (`last_done` in it, `first_done` before) — with who is told. It reads
  no tab, so the Sunday run, the admin's preview and the check all run the same rule. `parentsOf` is
  the real `acceptedParents` everywhere but the check.
- **Who gets it:** the learner's **accepted** parents (`family` tab, `state = accepted`) with an
  email address, and nobody else. A pending or refused link gets nothing, another family's parent
  gets nothing, a row linking a learner to themselves is ignored, two parent rows on one address get
  one email. A learner nobody can be told about is listed as **unreachable, with the reason naming
  each parent**, and emailed to nobody. One email per parent per learner.
- **The email** is short and plain: `Ada’s week: 3 questions`; who, how many, new and done again, the
  list (30 at most, then "and N more"), a link to the site, and *"You get this because you are Ada’s
  parent on @family. To stop these emails, reply to this one and say so."* Plain text and HTML, every
  value escaped in the HTML. Signed with `brandName()` (→ `BRAND_NAME`), linked to `site_url` (→
  `SITE_URL`). No marks — `attempts` records that a question was done, not how it went.
- **`weeklyDigestRun()`** is the trigger's entry point. **off** returns before reading a tab.
  **preview** writes what would be sent to `digest_log` and sends nothing. **send** emails, under the
  script lock, asking `MailApp.getRemainingDailyQuota()` before each email and stopping at
  `weekly_digest_reserve`. **Idempotent:** the log row is the receipt — `sending` is written (and
  flushed) before the email, `sent` after, and a rerun the same week skips both. At most once: a run
  killed between the two leaves `sending`, which is not sent again. `preview`, `held` (quota) and
  `failed` rows are sent by the next run.
- **`installWeeklyDigest()` / `removeWeeklyDigest()`**, run by hand from the editor: one Sunday
  trigger at `weekly_digest_hour`, London, the old one deleted first (the `installWarmTrigger`
  rule), no other trigger touched. Not called from `installTriggers`, `?run=` or anywhere else.

**The sheet** — all created or added by `ensureSchema`, nothing renamed:

| | |
|---|---|
| `config` rows | `weekly_digest` = `off` (anything but exactly `preview` or `send` is off), `weekly_digest_hour` = 18, `weekly_digest_reserve` = 10 |
| `digest_log` tab (Ledger) | `week_of, learner_id, parent_id, to, subject, questions, status, at, note` — one row per parent per learner per week, plus a `not sent` row per unreachable learner and an `opted out` row per parent who said no. `week_of` is the Monday, written as text |
| `attempts.label` | what a parent can read — `Maths · Paper 1 (Calculator) — June 2024 · Q3`. The phone sends it with `markDone` (one addition to `doneMark_` in js/find.js); `markDone` strips tags, caps it at 120, sets it on a new row and fills a blank one when the day moves — never on a day already covered, which still writes nothing. Blank → the email shows the key |
| `people.weekly_email` | per parent; **blank is on**, anything that is not blank/yes/true/1 (`ON_`) is "stop" |

**`digestPreview`** (`admin` in `ACTION_ACCESS`, listed in `features`): this week so far, every email
rendered and every unreachable learner, writing, sending and booking nothing.

**The card** (`js/digest.js`, after `records` in `window.FILES`): the last page of the Settings
column, for an admin. *Weekly parent email: Off / Preview / Send* as the config row says, where the
switch is, and one **Preview** tile that opens the emails this week would produce — the plain body,
escaped on the phone — and who nobody can tell. It switches nothing; that is a cell and a run in the
editor, on purpose.

### Checked, each rule proved by mutation and restored to green

**`js/check-digest.js`** (in `check-all`) on the real backend through `check-gas-load.js` (which now
loads `digest`), with MailApp, ScriptApp, the lock and the clock stubbed, and `formatDate` answering
in the zone it is asked for: twelve week cases including both Sundays the clocks change in 2026;
only that week's attempts (the Sunday before and Monday after are out, the Sunday itself in), new vs
again, label vs key; only Pat — not Pam (opted out), Peg (asked), Rex (refused), Bo (Ben's), nor Ada
herself; unreachable Cal and Dee with reasons; off writes and sends nothing (nor does `yes`); preview
writes the log once and sends nothing; send sends one each, a second run and a Monday run none, a
preview after does not touch a receipt; quota 11 with reserve 10 sends one and holds one, which the
next run sends; a throw is `failed` and retried; a `sending` row is not resent; the lock held sends
nothing; `weeklyDigestRun` on a Sunday clock; one trigger at 18 → 7 → fallback for 25/six/-1, London,
other triggers untouched, remove takes only its own; nothing calls the installer or the run, RUNNABLE
and `installTriggers` do not name them, the config arrives off; `digestPreview` answers an admin and
refuses a student, a parent and nobody; `markDone`'s label — tags, cap, the covered day, no
overwrite. **35 mutations, each red for its own reason.**

**`check-flow`**: the attempts journey now asks that a Check on a library card sends its label (and
does not say the subject twice), and a card not in the library sends exactly what it did before; a
new journey asks the card is an admin's, reads the mode as the server does, is a tile row, posts one
`digestPreview` and nothing else, shows the emails escaped and who cannot be told, takes the server's
mode afterwards, and tells a backend without the action to sync. **11 mutations, each red.**
`check-columns` and `check-rows` now read `digest.gs` too.

Screenshots of the card and the preview at 320 and 390 were looked at: one line of title, the tile
44px, nothing scrolls sideways; long addresses wrap in the sheet.

### Owner steps, to switch it on later

1. Push, and sync `backend/` into Apps Script (GitHub Assistant, or clasp). The merge bumps the four
   version stamps; this branch does not. Deploy a new web-app version so `digestPreview` is live.
2. Run **`ensureSchema`** (or open `/exec?setup=1`). It adds `digest_log`, `attempts.label`,
   `people.weekly_email` and the three config rows, `weekly_digest` = `off`.
3. On the phone, Settings → the last card → **Preview**. Read what this week would say.
4. Set **`weekly_digest` = `preview`** on the config tab.
5. Run **`installWeeklyDigest`** once, from the editor's function list. Google will ask for nothing
   new — `script.scriptapp` and `script.send_mail` are already granted. (`removeWeeklyDigest` undoes it.)
6. After a Sunday, **read `digest_log`**: who would have been emailed, the subjects, who was `not
   sent` and why. Fix family links and addresses it names.
7. When it reads right, set **`weekly_digest` = `send`**. A rerun by hand the same week sends nothing
   twice. To stop everything: `off`, or `removeWeeklyDigest`.

### Decisions for the owner

- **The hour.** 18:00 Sunday, London. Later catches more of Sunday — a question done after the send
  is in nobody's email, because next week starts on Monday. Changing `weekly_digest_hour` means
  running `installWeeklyDigest` again.
- **Who gets it.** Every accepted parent with an address, one email per child. Not tutors (who a tutor
  teaches is not a column — see 269), not students themselves, not a parent whose link is pending.
  Learners with no linked parent are listed, not emailed — the log says who.
- **The opt-out wording and mechanism.** Today it is "reply to this one and say so", and the owner
  sets `weekly_email` to `no` on that parent's row. A Settings switch for parents, or an unsubscribe
  link, would be the next step; neither is built.
- **What a question is called.** Rows written before this deploy, and the backlog a phone sends on
  load, have no label and show the key (`q:Q-9MA031-2206-1`). They fill in the next day each question
  is marked on a card. If that is not enough, the run could look keys up in `data/questions.json` over
  the site's own URL — not built; it is 7.6 MB.
- **A label is what the student's phone sent**, stripped and capped, and it only ever reaches that
  student's own parents.
- **The quota reserve.** 10 kept back for new PINs and notices. A consumer Gmail account sends about
  100 a day; past that, the rest are `held` and go when `weeklyDigestRun` is run again the next day.
- **No marks, no streaks, no comparison** — it reports what was done. Anything more is a decision about
  what parents are told, not a gap.
