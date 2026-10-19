# backend/digest.gs

The full text of comments in `backend/digest.gs` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — digest.gs THE SUNDAY PARENT EMAIL, AND THE MARKS IN IT

top level, before `digestMode_`

```
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
     2. (optional) `ensureSchema` — `/exec?setup=1` — so the config tab has `weekly_digest_hour` and its
        neighbours with their notes; a blank cell is its default without it;
     3. `weekly_digest` on the config tab to `send` (`off` until somebody types otherwise, CONFIG_DEFAULTS;
        `preview` writes the `digest_log` tab and emails nobody);
     4. `installWeeklyDigest` run once: ONE trigger, the Sunday email, and nothing beside it — and run
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

   AND THE MARKS IN IT ARE THE ONES RECORDED WHEN THE CHILD SENT THE ANSWER (18 Oct, docs/history/352).
   The owner: *"Marking? Why marking? It's already marked when they submit the questions? Don't be silly.
   The marking is already done on each question. 9pm on Sunday should be the only time trigger."* So the
   email reads each answer's verdict as the phone recorded it — ✓, ✗, the AI's "3 of 4 marks" — and an
   answer recorded `sent` (nothing marked it) says "not marked". Nothing here asks Gemini, nothing appends
   a mark, and the run marks nothing before it plans. From 12 to 18 Oct a server pass did all three,
   nightly at 02:00 and in a run-up before the email; it is gone, and `installWeeklyDigest` takes its
   triggers away (`DIGEST_RETIRED_RUNS`).

   WHO IT GOES TO, AND THE ONE RULE THAT MATTERS: a learner's ACCEPTED parents with an address
   (`acceptedParents` — a link the child said yes to, on the `family` tab), and nobody else. Not a
   pending or refused link, not the learner, not a tutor, not whoever shares a surname. A learner with
   no such parent is listed as unreachable and emailed to nobody; a parent whose `weekly_email` cell
   says no is skipped. One email per parent per learner, so two children are two emails and each one
   is about one child.

   FILE ORDER. Functions only, like every file but constants.gs: Apps Script joins the files in an
   order nobody chooses, and a top-level `const` here could be read before it exists. Its constants —
   `DIGEST_MODES`, `DIGEST_TZ`, `DIGEST_RUN`, `DIGEST_RETIRED_RUNS`, `DIGEST_LIBRARY_PATH` and the rest — are
   in constants.gs for that reason.
================================================================================================== */
```

### ---------- THE SWITCH, AND THE TWO NUMBERS BESIDE IT

top level, before `digestMode_`

```
/* ---------- THE SWITCH, AND THE TWO NUMBERS BESIDE IT ------------------------------------------------
   EACH WITH A FALLBACK, and each fallback is the safe answer: a blank, a typo or a missing config tab
   is `off`, 21:00 (the owner, 18 Oct: *"On Sunday @9pm"*) and a reserve of 10. `send` has to be spelled exactly, because it is the only one
   of the three that reaches somebody's inbox. */
```

### ---------- WHAT A WEEK IS: MONDAY 00:00 TO SUNDAY 23:59, LONDON

top level, before `digestDay_`

```
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
```

### ---------- AND THE WEEK A RUN SENDS

top level, before `digestWeekToSend_`

```
/* ---------- AND THE WEEK A RUN SENDS ---------------------------------------------------------------
   THIS WEEK ON A SUNDAY, OTHERWISE THE ONE THAT ENDED LAST SUNDAY. The trigger only ever fires on a
   Sunday, so for it the two are the same. The difference is the run somebody starts BY HAND on the
   Monday — after the mail quota ran out, or to read a preview of a week that is finished — which
   must finish the week that was being sent, not start a new one that has nothing in it. */
```

### ---------- THE PLAN: WHO DID WHAT, AND WHO IS TOLD

top level, before `digestPlan_`

```
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
```

### ONE QUESTION, HOWEVER MANY BOXES IT HAS.

in `digestPlan_`

```
/* ONE QUESTION, HOWEVER MANY BOXES IT HAS. A practical's worksheet is three answer boxes, each
     sent under the practical's key with its slot on the end (`pr:…#iv`, `#dv`, `#cv` — see `guideBox_`
     in js/find.js), so one worksheet filled in was three rows and an email saying "3 questions" with
     three raw keys in it. Rows are joined on the key before the `#`. */
```

### AND NO "60 min" IN A NAME.

in `digestPlan_`

```
/* AND NO "60 min" IN A NAME. A practical's card line is `Biology · Required practical · 60 min`, and
     the phone built its name from that line, so a parent read how long the card guesses a practical
     takes as though it were how long their child spent on it. The phone no longer sends it
     (`doneLabel_` in js/find.js); a row written before it stopped may still carry it, and it comes out
     here, where the email reads every label. */
```

### ---------- EVERY PRESS, FOLDED INTO ONE LINE PER QUESTION

in `digestPlan_`

```
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
```

### WORK CARRIED OVER FROM BEFORE THE SWITCH IS HISTORY, WHENEVER IT ARRIVED (`SUBMISSION_CARRIED`):

in `digestPlan_`

```
/* WORK CARRIED OVER FROM BEFORE THE SWITCH IS HISTORY, WHENEVER IT ARRIVED (`SUBMISSION_CARRIED`): never
       this week's work, and what makes a press of the same question this week "(again)". Its name and words
       still count, above — they are the question's. */
```

### THE NAME A PARENT CAN READ — see SCHEMA.submissions for why the backend cannot look a key up for itself.

in `digestPlan_`

```
/* THE NAME A PARENT CAN READ — see SCHEMA.submissions for why the backend cannot look a key up for
       itself. BUT ONLY TEXT THAT CANNOT PASS FOR A MESSAGE FROM THE BUSINESS: the label came off a
       phone, and printed under "@family." a label reading "NOTICE: fees overdue, pay at https://…" is
       the business saying it. `digestSafe_` turns away anything with a link or an address in it.
       NEVER THE KEY IN ITS PLACE: this printed a key in the library's shape when there was no name,
       until the email listed each question with its words — and `q:Q-9MA031-2206-1` among them reads
       to a parent as a fault. A question with no printable name is counted and not listed — it is in
       "…and N more" — rather than dropped, so the number the email gives stays true. */
```

### AND THE QUESTION'S WORDS (SCHEMA.submissions), by the same rule over the whole of them:

in `digestPlan_`

```
/* AND THE QUESTION'S WORDS (SCHEMA.submissions), by the same rule over the whole of them: phone text
       with a link or an address in it is not printed (`digestWordsSafe_`). Blank is a real answer — a
       row whose phone sent none — and the name stands alone. AND ONLY UNDER A KEY IN THE LIBRARY'S OWN
       SHAPE: an invented key cannot carry a paragraph. */
```

### ---------- WHICH OF A LEARNER'S PARENTS IS TOLD, AND WHY NOT THE REST

top level, before `digestReach_`

```
/* ---------- WHICH OF A LEARNER'S PARENTS IS TOLD, AND WHY NOT THE REST -------------------------------------
   LIFTED OUT OF `digestPlan_` UNCHANGED (the review of 12 Oct), so `checkSundayEmail` can ask it of a child
   who has done nothing yet this week — *"ensure that this sunday she will recieve"* is a question about a
   parent before it is a question about a week of work, and one rule read in two places is the drift
   `addressPending_` was written to end. Returns `{ to, skipped, linked }`. */
```

### NEVER AN ADDRESS NOBODY CONFIRMED.

in `digestReach_`

```
/* NEVER AN ADDRESS NOBODY CONFIRMED. `verified=PENDING` is a sign-up whose link was never
       clicked — a typo'd address, as often as not, which is a stranger's inbox. An admin's
       `linkChild` writes `accepted` without asking the address anything, so the link alone is
       no proof, and every Sunday a stranger would be told about somebody's child. Blank is an
       account from before verification existed, and is not pending. `addressPending_` (people.gs)
       is this rule for every mail now, so the digest and `notify` cannot disagree about it. */
```

### THEIR OWN CHOICE, through the one reader every sender asks (`wants_` in people.gs) — still the `weekly_email` cell, blank is yes, and now also the Weekly

in `digestReach_`

```
/* THEIR OWN CHOICE, through the one reader every sender asks (`wants_` in people.gs) — still the
       `weekly_email` cell, blank is yes, and now also the Weekly progress email tick on the parent's
       Notifications card (`setNotify`). It read `ON_(p.weekly_email)` itself until 9 Oct; one rule
       read in two places is the drift `addressPending_` was written to end. */
```

### ---------- ONE EMAIL: A SUBJECT, A PLAIN BODY AND THE SAME IN HTML

top level, before `digestRender_`

```
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
   "handed in, and that is all anybody knows" at best. The verdict is the one recorded when the answer was
   sent, unchanged (18 Oct: nothing marks it again before Sunday), and what nothing marked says so plainly.
   THE KEY IS SAID ONCE, in the lead, and only for the marks the list has: a week of ticks needs no
   sentence about an AI marker.

   THE PLAIN BODY IS NOT AN AFTERTHOUGHT. MailApp sends both and a mail client shows whichever it
   prefers; the plain one is also what the admin's Preview prints. Every value in the HTML goes through
   `digestEsc_` — a label came off a phone. THE FIRST NAME ONLY — `digestPlan_` has already turned away
   one that is not a name — and never the full display name in its place, which is built from the same
   editable cells; and `digestMail_` sends it with `firstNamesOnly`, so the net in `mailOut_` cannot add
   a handle either. */
```

### "WORKED ON", NOT "DID".

in `digestRender_`

```
/* "WORKED ON", NOT "DID". A submission is any answer sent — a wrong one, a one-word one, one nothing
     could mark. A parent reads "did" as finished work; the marks beside the numbers say how it went.

     AND "UP TO" THE MOMENT THE LIST WAS MADE (`look.hour` and `look.minute`, `digestLook_`). A question
     sent after the run is in nobody's email: next week's starts on the Monday. Said rather than hidden,
     so "this week" is not a claim to the whole of Sunday. IT SAID THE BOOKED HOUR, "up to 6pm", and the
     trigger fires anywhere near it: a run at 18:40 listed an answer from 18:20 under "up to 6pm", and one
     booked at 18:00 with the cell since changed to 20 promised "up to 8pm" (the review of 12 Oct). Now it
     is the run's own London time, so it is true whenever Google starts it. */
```

### THE BUSINESS'S NAME ENDS IN A FULL STOP, so it is the last word of its sentence and never followed by more punctuation — "on @family.."

in `digestRender_`

```
/* THE BUSINESS'S NAME ENDS IN A FULL STOP, so it is the last word of its sentence and never followed by
     more punctuation — "on @family.." is what it reads as anywhere else. THE SWITCH IS ON THE SITE (9 Oct),
     so the footer names it first — a reply still works, and is what somebody who never signs in will do. */
```

### THE KEY IS SAID FOR THE MARKS THE LIST PRINTS — not every item of the week.

in `make`

```
/* THE KEY IS SAID FOR THE MARKS THE LIST PRINTS — not every item of the week. It was built from all of
       them, and a week whose questions all had no printable name got "Beside each one is how it went: ✓
       right or ✗ wrong." over no list at all (the review of 12 Oct). AND A LIST WITH NOTHING IN IT SAYS SO:
       the count stays true, and the parent is told why there is nothing under it. */
```

### ---------- AND UNDER GMAIL'S CLIP, EVERY QUESTION KEPT

in `digestRender_`

```
/* ---------- AND UNDER GMAIL'S CLIP, EVERY QUESTION KEPT ------------------------------------------------------
     Past about 102 KB of HTML Gmail shows "[Message clipped]", and what is behind it — the end of the list and
     the footer that says how to stop — nobody reads. Whole words for a week of whole papers can pass it, so the
     longest SHARED SOURCE TEXTS go first, said as "(the source text is on the site)", then, only if that is not
     enough, the longest parts' words, as "(the question’s words are on the site)" — each question still listed
     with its number, its picture and its mark. A picture is a link and weighs nothing here. Cut a few at a time,
     by what they weigh against what is over, so it is a render or two and not one per question. */
```

### ---------- THE QUESTIONS, EACH WITH ITS OWN WORDS

top level, before `digestQuestions_`

```
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
```

### THE LIBRARY'S ROWS FOR THE WEEK (`digestEmailLibrary_`), and what the clip has asked to be said as "on the site" (`digestRender_`):

in `digestQuestions_`

```
/* THE LIBRARY'S ROWS FOR THE WEEK (`digestEmailLibrary_`), and what the clip has asked to be said as "on
     the site" (`digestRender_`): `stem:<row_id>` and `part:<key>`. No library — a run that could not fetch
     it, the admin's Preview, a check — is every question by its words cell, as before 18 Oct. */
```

### IN THE HTML THE MARK HAS A COLOUR OF ITS OWN — green ✓, red ✗, blue marks, grey "not marked" — because on the first render (a week of seven, at 390 px)

in `digestQuestions_`

```
/* IN THE HTML THE MARK HAS A COLOUR OF ITS OWN — green ✓, red ✗, blue marks, grey "not marked" — because
     on the first render (a week of seven, at 390 px) "Q5 20 of 40 marks — Your local newspaper…" read as
     one sentence, and the mark is the thing a parent scans the list for. The glyphs differ as well as the
     colours, so nothing rests on the colour alone; the plain body has the same words without it. */
```

### ---------- ONE QUESTION AS THE SITE'S CARD DRAWS IT (18 Oct)

top level, before `digestPartOut_`

```
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
```

### THE ROW A KEY NAMES, WHEN THE CARD WOULD DRAW IT:

top level, before `digestLibRow_`

```
/* THE ROW A KEY NAMES, WHEN THE CARD WOULD DRAW IT: a question, live, with something to show. A practical's
   box (`pr:`), a key typed into the sheet, a question the library has dropped or retired — null, and its words
   cell prints it, as it did before 18 Oct. */
```

### ---------- THE LIBRARY'S MARKUP, AS AN EMAIL MAY CARRY IT

top level, before `digestHtml_`

```
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
```

### WHAT BOTH THE HTML AND THE PLAIN BODY START FROM:

top level, before `digestPrep_`

```
/* WHAT BOTH THE HTML AND THE PLAIN BODY START FROM: what cannot be words gone with its contents, comments
   gone, and the two drawings the site makes with classes written as what they are — the stacked fraction
   as `<sup>a</sup>&frasl;<sub>b</sub>` (the library's own other spelling of it) and the recurring decimal's
   dot as U+0307 over the digit before it. */
```

### ---------- A DRAWING, AS AN EMAIL CAN SHOW IT

top level, before `digestDiagram_`

```
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
```

### ---------- THE ROWS THE WEEK'S EMAIL PRINTS, FETCHED ONCE FOR THE WHOLE RUN

top level, before `digestEmailLibrary_`

```
/* ---------- THE ROWS THE WEEK'S EMAIL PRINTS, FETCHED ONCE FOR THE WHOLE RUN ------------------------------------------
   The library's fetch and line scan (`digestLibrary_`, `digestLibraryFind_`, below) for every library key
   with a press in the week. A fetch that fails is said in the run's log and costs nothing else: each question
   then goes as its words cell, as it did before 18 Oct. */
```

### A VERDICT AS THE EMAIL MARKS IT — ✓ right, ✗ wrong (the site says "Not yet"; in a list of numbers a cross is the mark a parent reads at a glance), the AI's

top level, before `digestMark_`

```
/* A VERDICT AS THE EMAIL MARKS IT — ✓ right, ✗ wrong (the site says "Not yet"; in a list of numbers a
   cross is the mark a parent reads at a glance), the AI's marks as "3 of 4 marks", the way the phone
   says them, and "not marked" for everything else: `sent`, a blank, and anything outside the vocabulary.
   It printed `sent` for the first, and nothing at all for the rest, until 12 Oct. */
```

### ---------- TEXT THAT CAME OFF A PHONE, AND MAY GO OUT UNDER THE BUSINESS'S NAME

top level, before `digestSafe_`

```
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
```

### `digestSafe_` FOR A QUESTION'S WORDS — the same refusal over the WHOLE text.

top level, before `digestWordsSafe_`

```
/* `digestSafe_` FOR A QUESTION'S WORDS — the same refusal over the WHOLE text. `digestSafe_` asks it of
   `attemptLabel_(s)`, which is the first 120 characters with every `<…>` gone, so a link in the second
   line of a question would pass it. Measured: not one question or stem in data/questions.json is
   refused, so the rule costs no real question its words. */
```

### THE BUSINESS'S NAME AND THE SITE'S ADDRESS — each from the one place it is written, each with the constant beside it as the floor, so a broken config tab still

top level, before `digestLook_`

```
/* THE BUSINESS'S NAME AND THE SITE'S ADDRESS — each from the one place it is written, each with the
   constant beside it as the floor, so a broken config tab still signs the email. And the moment the
   list is made up to, which the email states as the end of the week it covers (`hour`, `minute`):
     on the week's Sunday   the London time NOW — the run's own, whenever Google started it
     before it (a Preview)  the hour the email is booked for, which is what it will be about
     after it (a rerun)     none: the whole week is in it */
```

### THE HOUR `installWeeklyDigest` RECORDED, and -1 when there is none:

top level, before `digestBooked_`

```
/* THE HOUR `installWeeklyDigest` RECORDED, and -1 when there is none: never installed, or installed by a
   backend from before the record (13 Oct) — which `checkSundayEmail` must tell apart from "booked at the
   cell's hour", because on 18 Oct the owner moved the cell from 18 to 21 over triggers booked at 18. */
```

### ---------- WHEN THIS WEEK'S EMAIL GOES, AS AN INSTANT — 0 WHEN THAT IS NOT STILL TO COME

top level, before `digestSendAt_`

```
/* ---------- WHEN THIS WEEK'S EMAIL GOES, AS AN INSTANT — 0 WHEN THAT IS NOT STILL TO COME --------------------
   The email is at `hour`:00 on the Sunday of the week `now` is in, London — so at hour 0 it is the
   Saturday's midnight. Worked out on London's wall clock (`Utilities.formatDate`, which knows the clocks)
   and counted in whole minutes from there, so it needs no time zone of its own. */
```

### ---------- THE SUNDAY RUN

top level, before `weeklyDigestRun`

```
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

   AND NO MARKING FIRST (18 Oct, docs/history/352). It ran a last AI marking pass for two minutes before
   it planned; the owner: *"It's already marked when they submit the questions"*. The list is made from
   the verdicts on the sheet as they were recorded, and an answer nothing marked says "not marked".
   `check-digest.js` fails if this run asks Gemini or writes a row to `submissions`. */
```

### ---------- THE LOCK IS HELD TO CLAIM AN EMAIL, NEVER TO SEND IT

top level, before `digestRun_`

```
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
```

### NO `submissions` TAB IS NOT A QUIET WEEK.

in `digestRun_`

```
/* NO `submissions` TAB IS NOT A QUIET WEEK. `read` answers a missing tab with no rows, so this run
     would plan nothing, write nothing, and the Sunday would look like a week nobody worked — on a Ledger
     that was in fact never told what anybody did. It stops here and says so, and the throw in
     `weeklyDigestRun` is the email that says it to the owner. */
```

### AND WHO WAS NOT TOLD, AND WHY — a row each, so the log answers both questions.

in `digestRun_`

```
/* AND WHO WAS NOT TOLD, AND WHY — a row each, so the log answers both questions. A parent who
     asked not to be sent it is a row too; a parent with no address is in the learner's `note`. One
     short hold for all of them: they are writes to the log and nothing else. */
```

### ---------- UNDER THE LOCK, BRIEFLY

top level, before `digestLocked_`

```
/* ---------- UNDER THE LOCK, BRIEFLY -----------------------------------------------------------------
   `fn` is handed the log as it is now — `readLog` drops that tab's cached copy first. Null when
   another run kept the lock for thirty seconds: the caller counts it `busy`, sends nothing for it,
   and its trigger throws so somebody runs it again. One function, so the lock is taken one way in one
   place — the claim and the "who was not told" rows both come through it. */
```

### ---------- CLAIM, SEND, RECEIPT

top level, before `digestMail_`

```
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
```

### ---------- NO `submissions` TAB, IN WORDS

top level, before `digestNoSubmissions_`

```
/* ---------- NO `submissions` TAB, IN WORDS ---------------------------------------------------------------
   THE OWNER'S LEDGER DID NOT HAVE AN `attempts` TAB until 6 Oct, and nothing said so: `read` answers a
   missing tab with no rows, which is exactly what a week of nobody working looks like. The weekly
   preview printed "Nobody has done a question yet this week" over a sheet that had never been told what
   anybody did. The same is true of `submissions`, which a pull of the backend does not create —
   `ensureSchema` does. So the run and the Preview ask this before they plan, and a run with something
   to send stops on it. '' when the tab is there. */
```

### THE LOG AS IT IS NOW — its cached copy dropped first, because a copy read before the lock was taken is the one another run has since written to.

top level, before `digestLog_`

```
/* THE LOG AS IT IS NOW — its cached copy dropped first, because a copy read before the lock was taken
   is the one another run has since written to. Only this tab's: `clearCache()` would have the next
   read of `people` and `submissions`, for nothing, go back to the sheet once per email. */
```

### ---------- BOOKING THE SUNDAY, BY HAND

top level, before `installWeeklyDigest`

```
/* ---------- BOOKING THE SUNDAY, BY HAND ---------------------------------------------------------------------
   RUN FROM THE APPS SCRIPT EDITOR'S FUNCTION LIST, ONCE, AND BY NOBODY ELSE. Not from `installTriggers`,
   not from `?run=`, not from `doGet` — a trigger booked as a side effect of something else is a Sunday
   email nobody decided to start. `check-digest.js` reads the backend for a call to either and fails.

   ONE BOOKING (18 Oct): the email, every Sunday at `weekly_digest_hour` — the owner, *"9pm on Sunday should
   be the only time trigger."* From 12 to 18 Oct this booked three: the email, an AI marking pass every
   night at 02:00, and a Sunday run-up an hour before the email that booked itself again while work was
   left. The marks are made when a child sends an answer, so those are gone (docs/history/352).
   `nearMinute(0)` because a trigger fires anywhere in its hour otherwise; with it Google keeps to fifteen
   minutes either side. The hour booked is kept (`DIGEST_BOOKED`), because a trigger's hour cannot be read
   back and the setup check must say when it really goes.

   THE OLD ONE GOES FIRST, the `installWarmTrigger` rule: run twice, it still leaves exactly one, and
   changing `weekly_digest_hour` is running this again. `inTimezone` says London out loud rather than
   trusting the project's own setting, so 21:00 stays 21:00 across the clocks changing.

   INSTALLED IS NOT ON. With `weekly_digest` at `off` it fires and returns at its first line; `preview` and
   `send` are a cell on the config tab, not another run of this.

   AND WHAT NOTHING RUNS ANY MORE GOES WITH IT — every trigger whose handler is in `DIGEST_RETIRED_RUNS`,
   and only those, by `removeWeeklyDigest`: the old after-session email's hourly check (removed 8 Oct) and
   the marking passes' handler (removed 18 Oct) — nightly, run-up and one-off alike. Left booked, each
   fires into a function that no longer exists, fails, and Google emails the owner each failure. The owner
   runs this anyway to book the email, so this is where they go, and the log line says how many. */
```

### THE WAY BACK: every trigger of the email's handler, and every one in `DIGEST_RETIRED_RUNS`, gone, and nothing else; and the Script Properties that describe

top level, before `removeWeeklyDigest`

```
/* THE WAY BACK: every trigger of the email's handler, and every one in `DIGEST_RETIRED_RUNS`, gone, and
   nothing else; and the Script Properties that describe them — the hour booked, and what the old marking
   pass kept (`DIGEST_RETIRED_PROPS`). Safe to run when there are none. */
```

### ---------- WHAT THE ADMIN'S PREVIEW IS SENT — `digestPreview` in dopost.gs

top level, before `digestPreviewOut_`

```
/* ---------- WHAT THE ADMIN'S PREVIEW IS SENT — `digestPreview` in dopost.gs -------------------------
   THIS WEEK SO FAR, and nothing written and nothing sent: the plan, rendered, for the card on the
   Settings column (js/digest.js). Every address is in it, which is why the action is `admin`. */
```

### `words` SAYS THIS BACKEND LISTS EACH QUESTION WITH ITS WORDS.

in `digestPreviewOut_`

```
/* `words` SAYS THIS BACKEND LISTS EACH QUESTION WITH ITS WORDS. The Preview is answered by the
     deployed web-app VERSION, the Sunday trigger runs the code as saved — so after a pull with no new
     version, the card would show the old list of names over a run that sends the new one. A reply
     without it is that older backend, and the card says to make a new version (js/digest.js). */
```

### THE LIBRARY, FOR THE EMAIL — EACH QUESTION PRINTED AS IT IS ON THE SITE (18 Oct, docs/history/351)

top level, before `digestLibrary_`

```
/* ==================================================================================================
   THE LIBRARY, FOR THE EMAIL — EACH QUESTION PRINTED AS IT IS ON THE SITE (18 Oct, docs/history/351)

   The backend holds no library: `data/questions.json` is in git, served by GitHub Pages. So the Sunday
   run fetches the site's own copy once (`digestEmailLibrary_`, above) and finds the week's rows in it by
   their text. Written for the AI marking pass of 12 Oct, which is gone (docs/history/352); the fetch and
   the scan stayed, because the email prints each question from its row. Measured then: 14,092,112 bytes
   (1.77 MB gzipped) from raw.githubusercontent.com in 1.35 s; ONE ROW A LINE, so a row is its
   `"row_id":"…"` and one `JSON.parse` of one line — never the whole file, which in Node is a quarter of a
   second and 20 MB more heap, and Apps Script's memory ceiling is not published.
================================================================================================== */
```

### THE FILE ITSELF: the site's copy first — the one the phones read — then raw.githubusercontent.com

top level, before `digestLibrary_`

```
/* THE FILE ITSELF: the site's copy first — the one the phones read — then raw.githubusercontent.com (`RAW`
   in sync.gs, read at call time, so a scope without sync.gs simply has no second address). A 200 that is
   not the library (a login page, a GitHub error page) is refused, not parsed. */
```

### THE ROWS ASKED FOR, AND THE PREAMBLES OF THEIR PAPERS — one line each, found by its text and parsed alone.

top level, before `digestLibraryFind_`

```
/* THE ROWS ASKED FOR, AND THE PREAMBLES OF THEIR PAPERS — one line each, found by its text and parsed
   alone. `"row_id":"Q-1"` cannot match `"row_id":"Q-10"` (the closing quote), and cannot sit inside a
   string value, where every quote is escaped. */
```

### THE PREAMBLES IN FRONT OF A QUESTION, OUTERMOST FIRST — `stemIndex_` and `preamble_` (js/find.js) for one question:

top level, before `digestStemRows_`

```
/* THE PREAMBLES IN FRONT OF A QUESTION, OUTERMOST FIRST — `stemIndex_` and `preamble_` (js/find.js) for
   one question: the paper's, the section's, the question's, then its letter's ("(d)" for d(ii)), each
   scope in `sort_order` — and one with a picture and no words is a stem the card draws too (`preamble_`:
   `x.html || x.diagram`), so the email prints it too (18 Oct). */
```

### THE LIBRARY'S MARKUP AS TEXT — `aiPlain_` (js/keypad.js) without a DOMParser, which Apps Script has not got:

top level, before `digestPlain_`

```
/* THE LIBRARY'S MARKUP AS TEXT — `aiPlain_` (js/keypad.js) without a DOMParser, which Apps Script has not
   got: a fraction and a power written out first, a line for a break, a tag only where `<` is followed by
   a letter (a bare "x < 7" is maths, not a tag — `attemptWords_`'s rule), then the entities. */
```

### `checkSundayEmail` — ONE CHECK THE OWNER RUNS FROM THE EDITOR, AND IT CHANGES NOTHING (12 Oct)

top level, before `checkSundayEmail`

```
/* ==================================================================================================
   `checkSundayEmail` — ONE CHECK THE OWNER RUNS FROM THE EDITOR, AND IT CHANGES NOTHING (12 Oct)

   *"i want to make sure everything is set up."* Every part of the Sunday email lives somewhere different
   — a cell on the config tab, a trigger, a Script Property, Google's mail quota, the family tab, the
   site's library — and "is it set up" was six places to look, two of which (the trigger and the hour it
   was booked at) the owner cannot see without knowing where. So this reads each and says, in words, in
   the execution log: the mode and the hour; whether the Sunday trigger is booked, once, and whether an old
   trigger nothing runs any more is still booked beside it; the hour it was BOOKED at (`DIGEST_BOOKED`),
   with a WARNING while the config cell says another; the mail quota; the library, fetched as the run
   fetches it; and THIS WEEK — how many learners sent answers, how many have a parent who will be emailed,
   why each of the rest will not be, and which children with a parent to email have sent nothing yet (no
   work, no email). ITS MARKING LINES WENT ON 18 OCT with the marking passes — the key, the models, a live
   ask of Gemini, what was unmarked and the room before the email: the email asks Gemini nothing, so
   whether Gemini answers says nothing about Sunday (docs/history/352).

   NOTHING WRITTEN, SENT OR BOOKED — `check-digest.js` runs it over the stubbed backend and fails on a
   cell, an email, a trigger or a Script Property it changed. Names are FIRST names, and the log is the
   owner's; nothing here is ever sent to anybody. Not in `RUNNABLE`: `?run=` is a URL, and this log names
   children. Returns `{ lines }` for the checks. */
```

### THE HOUR BOOKED, ON A LINE OF ITS OWN (18 Oct).

in `checkSundayEmail`

```
/* THE HOUR BOOKED, ON A LINE OF ITS OWN (18 Oct). Apps Script cannot read the hour a trigger fires at, so
     `installWeeklyDigest` writes down the hour it booked (`DIGEST_BOOKED`) and this prints it — and WARNS, in
     words, when the config cell says another hour now: the owner moved `weekly_digest_hour` from 18 to 21 on
     the day, and a cell changed after installing moves nothing until the trigger is booked again. */
```

### AND WHO GETS NOTHING BECAUSE THERE IS NOTHING YET (the review of 12 Oct).

in `checkSundayEmail`

```
/* AND WHO GETS NOTHING BECAUSE THERE IS NOTHING YET (the review of 12 Oct). A child whose parent can be
         emailed, with no answer this week, was in no line at all — and that is exactly the owner's question
         (*"ensure that this sunday she will recieve"*): an email goes only for a week with work in it. */
```

