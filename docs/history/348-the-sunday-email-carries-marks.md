## The Sunday email carries marks: every answer the phone could not mark is marked by the server first, and the email says only what a parent needs

**The owner, 12 Oct**, of the email due on Sunday 18 Oct (the week Mon 12 – Sun 18 Oct, London):

> *"i want to ensure that this sunday she will recieve autimatic email as all parents, with linked emails,
> for her childs progress. they dont need to see usernames or whatever, all they need to see are the
> questions their kids have done this week. i want to make sure everything is set up. i want them to see if
> they got it right too. for this i need th ai marking to be working too."*

Four things, and this note is one section each: the marks (a server pass), the email (cut to what a parent
needs), the setup check the owner runs, and a dry run the lead runs on the real sheet before Sunday.

### What was wrong

- **An answer the phone could not mark said `sent` for ever.** A worded answer sent while AI marking was
  off, a maths answer whose scheme is words with no `accept` to Check against (`ansMaths_`), a press made
  without pressing Mark with AI — all `sent` (note 308). The email printed the word `sent` beside them, the
  server's word, which tells a parent nothing about how it went.
- **A mark needed the phone open.** Mark with AI is a press: the phone sends the question and the scheme,
  the server asks Gemini, the phone records the mark. A child who shut the iPad straight after sending had
  an answer nobody would ever mark.
- **The email said more than a parent needs.** The parent's own name, "— 3 new and 1 gone back to",
  "(again)" on a line, a link to the site, "Kit can see them on the site". And one way for a username to
  reach it: `mailOut_`'s net turns a child's whole name into "Kit (@handle)" when two children share a first
  name (note 342) — so a question whose words named a child in full would have put a handle in an inbox.

### 1. The marks: a server pass, nightly and an hour before the email

**Where the scheme comes from — the decision, with the numbers.** The backend has no library and no scheme
(SCHEMA.submissions); a submission row carries the question's words for the email (≤ 1,200 characters) and
no scheme. Two ways were weighed:

| | the phone sends the scheme with each worded submission | **the server fetches the library from the site** (chosen) |
|---|---|---|
| marks the rows already on the sheet (62 live, from 10–11 Oct) | no | **yes** |
| marks presses from phones still running cached code | no | **yes** |
| needs a js/ change (and parallel branches are changing js/) | yes | **no** |
| cost | a new column, up to 8,000 characters a row | **one fetch a pass, only when something worded waits** |

Measured on 12 Oct: `data/questions.json` is **14,092,112 bytes** (1,773,874 gzipped), 10,064 rows, one per
line (`check-library.js` holds that layout). From raw.githubusercontent.com: HTTP 200 in **1.35 s**
uncompressed, 1.76 s with gzip. In Node, `JSON.parse` of the whole file takes **224–489 ms and 20 MB more
heap**; finding a row by its `"row_id":"…"` and parsing that one line takes **10–30 ms for three keys and a
paper's preambles**, adding nothing to the heap beyond the text. Apps Script's memory ceiling is not
published, so the pass never parses the whole file. UrlFetchApp's documented response limit is 50 MB. The
GitHub Pages host could not be reached from the machine this was built on (a proxy), so `checkSundayEmail`
fetches it from Apps Script itself and says how big it was and how long it took — that line is the proof.

**What Gemini is given is what a press gives it.** The question as `aiQuestion_` (js/keypad.js) builds it —
the paper's, section's, question's and letter's preambles, outermost first (`digestStems_`, a port of
`stemIndex_` / `preamble_` in js/find.js), then the lead and the ask, read as text (`digestPlain_`, a port of
`aiPlain_` without a DOMParser: a fraction and a power written out, only a real tag stripped so "x < 7"
survives, and the 60 named entities the library uses plus any numeric one decoded — `DIGEST_ENTITIES`). The
scheme is the row's `answer` and its examiner's note. Out of the question's `marks`, 1 to 40, and an essay
when the phone would mark one as an essay (`ansEssay_`). The same clamps as a press (`AI_QUESTION_MAX`,
`AI_SCHEME_MAX`, `AI_ANSWER_MAX`), so the pass is never more generous than a press.

**Which answers.** The LATEST press of a question (by `pressed_at`, the card's rule) when it is `sent`,
arrived from the Monday of `digestWeekToSend_` to today, and is not carried-over work. Markable as Mark with
AI is offered (`aiWanted_`): a scheme, no `accept`, not a pick from a list, not a drawing — and one step
past the phone, **a maths answer whose scheme is words** (the 352 `calculation` rows with no `accept`, which
the phone can only Send). Counted over the library: 1,687 of 8,010 questions are markable this way, 277 of
them essays. Never markable, and "not marked" in the email: a practical's worksheet box, a pick with no
right answer, a drawing, a question with no scheme or gone from the library, an answer over 20,000
characters, and one Gemini twice gave no mark for.

**The mark is a row, appended the way a press is** — never a cell changed (note 308's rule). The same
person, key, answer (with its apostrophe), label and words; verdict `ai:N/M`; **the answer's own
`submitted_at`** (a mark written on Monday must not move last week's question into the new week, or the
admin's "last" date); **`pressed_at` one millisecond after the answer** (so it is the latest — `subAdopt_`
on the phone takes it only when strictly later — and any later press of the child's still wins); and an id
in `SUBMISSION_MARKED`'s shape (`<ms>-ai` and ten letters, two FNV-1a hashes of the answer's person, key,
id and moment), so the same answer always gets the same name. Under the script lock, briefly — the tab read
fresh, and nothing written if that id is already there or the child has pressed that question again since —
then flushed, and `submissionsTouched_` moves the child's stamp so their phone's cached copy is rebuilt.
**The lock is never held while Gemini is asked**: an ask can take ~80 s and every child's saved answer waits
on that lock.

**The clock, the pace, the resume** (constants in constants.gs, over `DIGEST_MARK_RUN`):

| | | why |
|---|---|---|
| `DIGEST_MARK_BUDGET_MS` | 240 s | Apps Script stops a run at 6 min, and an ask already started can take ~80 s |
| `DIGEST_MARK_GAP_MS` | 12 s | the free tier's few requests a minute |
| `DIGEST_MARK_MAX` | 20 a pass | a week's backlog does not spend the key's whole day in one night |
| `DIGEST_MARK_TRIES` | 2 | an answer Gemini twice gave no mark for is left, or twenty of them would hold back everything behind |
| `DIGEST_MARK_CLAIM_MS` | 7 min | one pass at a time: the id stops a second ROW, the claim stops a second ASK |
| `DIGEST_MARK_NIGHT` | 02:00 London | Gemini's daily quota is counted on California's day, which starts at 08:00 here: at 02:00 the pass spends what the children's presses left of yesterday, not what they will want today |

Nothing is kept between passes but `DIGEST_MARK_TRIED` (pruned to what is still waiting); the next pass works
out what is left from the sheet, so a pass stopped at four minutes — or by Apps Script at six — loses nothing.
Gemini **busy** or **unreachable** stops the pass (tomorrow's will try); **refused** (the key, the account,
both model names) stops it and the trigger throws, so Google emails the owner. It uses `aiMarkAsk_` and its
retries and pinned fallback (note 344) unchanged — `aiGaveUp_` now also returns a `why` beside its
sentence, so the pass does not read the wording — and **never `aiMarkCount_`**: that is a child's twenty
presses a day.

**Switched three ways, all on the config tab.** Nothing runs while `weekly_digest` is `off` (its default) or
GEMINI_API_KEY is missing; `weekly_digest_marking` (new, **on**, with its note) stops only the pass; and
`ai_marks_per_day` 0 stops it too, as that note has always promised for all AI marking. On is the safe
default because it is the second switch, not the first.

### 2. The email: the questions done this week and how they went

```
Subject: Kit’s week: 7 questions

Hello,

Kit worked on 7 questions this week (12 Oct – 18 Oct, up to 6pm on Sunday). Beside each one is how it went:
✓ right, ✗ wrong, or the marks an AI marker gave a written answer.

English Language · Paper 1: Explorations in Creative Reading and Writing — June 2017
Q5 20 of 40 marks: Your local newspaper is running a creative writing competition …

Maths · Paper 3 (Calculator) — June 2024
Q10a not marked: Here is a circle. On the diagram above, draw a radius of the circle.

Maths · Paper 31: Statistics — June 2022
Q1ai ✓: Find P(X = 3)

You get this because you are Kit’s parent on @family. To stop these emails, untick Weekly progress email in
Settings → Notifications on the site, or reply to this one and say so.
```

(An invented week, from the dry run; the marks there are the stub's.) The marks: ✓, ✗, the AI's
"**N of M marks**" (the phone's own words for it), and "**not marked**" for `sent`, a blank, or anything
outside the vocabulary — never the word `sent`. The key is said once, in the lead, and only for the marks the
list has. One list: "(again)" and "— N new and M gone back to" are gone; a question done again this week is a
question done this week. The parent's own name, the link and "can see them on the site" are gone. In the
HTML each mark has its own colour (green ✓, red ✗, blue marks, grey italic "not marked") — the first render at
390 px read "Q5 20 of 40 marks — Your local newspaper…" as one sentence; the glyphs differ too, so nothing
rests on colour alone. A name of one segment with no words carries its mark on its heading. 80 of the longest
questions are 83.5 KB of HTML with the colours, still under Gmail's 102 KB clip (check-digest renders it).

**No handle.** `mailOut_` takes `firstNamesOnly`, and the digest sends with it: the net leaves a child's whole
name as the first name alone (`kidNamesBare_` strips " (@handle)" from a copy of its index) and the option is
taken off before MailApp sees the message. Without it, check-digest's Kit — a question naming "Kit Example",
and another Kit on the sheet — went out as "Kit (@ke_bright_42)".

### 3. `checkSundayEmail`: run it from the editor, it changes nothing

Prints, in words, to the execution log: the backend's version (the code the triggers run); the mode and the
hour; whether the Sunday trigger and the two marking passes are installed; the marking switch, whether
GEMINI_API_KEY is set (never what it is) and which models marking asks; **a live ask of the marker** with a
made-up question ("Work out 2 + 3.", answered "5") — no learner's work; the mail quota and the reserve; the
library, fetched as the pass fetches it, with its size and time; and this week — how many learners sent
answers, how many will have a parent emailed, **each learner who will not be reached and why** (no accepted
parent / a parent with no email address / one who said no / one whose address is not confirmed), and how many
answers are still unmarked and how many of those the pass can mark. Learners by first name; the log is the
owner's. Not in `RUNNABLE` (the live ask is a Gemini request, and `?run=` is a URL).

### 4. `check/digest-dry.js`: the real week, sending nothing

```
node check/digest-dry.js --sheets /path/to/sheets.json --week 2026-10-18 --out /tmp/sunday [--marks half|full|none]
```

check/live.js's dump (`{ "ledger": { "<tab>": [[header], [row], …] } }`), any day of the week. In
check-mail-load.js's world (London's calendar — check/live.js's `formatDate` answers ISO for every format,
which breaks the week, and it does not load digest.gs): the setup check's reach lines as of the hour before
the email; the marking pass until nothing is left, with Gemini stubbed and the library the local file; then
every email the run would send, through `mailOut_`'s own net with a MailApp that only keeps it, written as
NN.html / NN.txt / NN.json (to, subject, text, html) with summary.json. It refuses `--out` inside the
repository and exits 1 if anything reached the world's MailApp. Date cells may be ISO, `dd/mm/yyyy hh:mm:ss`
(read as London) or a Sheets serial. Run on an invented week: 3 learners, 1 reachable, 7 unmarked answers, 5
marked, 1 drawing and 1 practical box "not marked", one email.

### Triggers

`installWeeklyDigest` books three, through one `newTrigger(` inside it (`book`): the email (Sunday at
`weekly_digest_hour`), the pass every night at 02:00, and the pass on Sunday an hour before the email with
`nearMinute(0)` — a trigger fires anywhere in its hour otherwise, and a pass at 17:58 does not precede an email
at 18:00; with it Google keeps to ±15 min, so a six-minute pass is done by 17:21. An email at midnight has its
pass on Saturday at 23:00. Run again, one of each. `removeWeeklyDigest` takes all three and nothing else.

### Checked

`js/check-digest.js`, 84 → 140 rules, through the real backend with Gemini, the library, MailApp and the
clock stubbed:

- **(a)** the week's `sent` worded answers are marked — Q1 2 of 3, an eight-mark English answer asked as an
  essay, a maths answer with its power written out — each one appended row with the answer's own arrival,
  pressed 1 ms after, the person's stamp moved; Gemini given the paper's and the question's preambles and
  nothing of another paper; a drawing, a pick, no scheme, a retired question, a practical box, the phone's
  own Check, a press's own AI mark, last week's and carried-over work all left; the child's card and Pat's
  email show the marks and "not marked"; and a real question found by the line scan in data/questions.json;
- **(b)** a second pass asks and writes nothing; a pass while another holds the claim does nothing, and a
  stale claim is taken over; Sam pressing Mark with AI while the pass asks about his answer keeps his press;
- **(c)** Gemini taking 70 s: asks at 0, 82, 164 s and none past 240 s, three marked and three left for the
  next pass; 25 quick answers are 20, then 5, never closer than 12 s;
- **(d)** three 503s then the fallback's 200 marks it, as Mark with AI does; both models full leaves both
  answers "not marked", left for the next pass, and the trigger does not throw; a 400 makes it throw for the
  owner; a reply with no mark is asked once more, then left;
- **(e)** a child at 19 of 20 stays at 19; `weekly_digest` off, `weekly_digest_marking` off,
  `ai_marks_per_day` 0 and no key each stop the pass before it fetches or asks anything;
- **(f)** the message MailApp is handed carries no handle, no other "@", no surname, no person id, no PIN, no
  "sent", no child's address, no parent's name, no other child, no "(again)", no link and no key — and does
  carry each question's words with ✓, ✗, "2 of 3 marks" and "not marked";
- **(g)** the three triggers, once each however often installed, Saturday at 23 for a midnight email, and the
  way back takes all three;
- **(h)** `checkSundayEmail` leaves every tab, Script Property, trigger and the mail stub as they were, logs
  every line above, never the key, and asks Gemini only its made-up question; with nothing set up it says
  so, line by line;
- **the dry run** on an invented week writes Pat's email with the stub's mark and "not marked", says nothing
  was sent, and refuses a folder inside the repository.

**25 mutations, each red for its own reason, the real files green after:** a mark stamped `submitted_at`
now; no `submissionsTouched_`; no preambles to Gemini; a newer press written over; the mark pressed before
the answer; no claim; no time budget; no gap; no fallback; busy read as no mark; refused not thrown; the pass
spending the child's cap; `ai_marks_per_day` 0 ignored; `firstNamesOnly` dropped (the handle reached the
email); `sent` printed; "(again)" back; the parent named; no nightly pass; the Sunday pass without
`nearMinute`; the uninstall keeping the marking; the setup check writing a Script Property; printing the key;
dropping the reason a learner is not reached; the dry run writing inside the repository; the dry run handing
its emails to the world's MailApp.

The four version stamps move together to `2026-10-12-t-sunday`.

### After the review of 12 Oct: the marks have to reach a weekend's work

The review's four blocking findings, all of one kind — the email went with marks it could have had:

1. **One pass between Saturday 02:00 and the email.** Four minutes at ~16 s an answer (Gemini's ~4 s and the
   12 s gap) is about sixteen; the live sheet's answers all came on a Saturday and a Sunday. Now the pass
   booked an hour before the email is a **run-up** (`DIGEST_MARK_RUNUP_MS`, 90 min): while work is left it
   books itself again a minute on (`digestMarkAgain_`, a one-off on the same handler, deleted by the pass it
   starts; its id in `DIGEST_MARK_AGAIN`), and no ask starts within `DIGEST_MARK_CLEAR_MS` (17 min) of the
   email. Sixty answers sent on the Sunday morning, Gemini at 4 s: all sixty marked, in four passes, where it
   was 16 marked and 44 "not marked". `DIGEST_MARK_MAX` now counts answers, not asks a busy Gemini refused.
2. **Gemini busy on the first answer gave up for good.** Busy or out of reach is now waited out —
   `DIGEST_MARK_BUSY_MS` (30 s), then the same answer again, through `aiMarkAsk_`'s own retry and fallback —
   and the pass stops only when a wait would carry it past its deadline. Refused still stops and throws.
3. **Answers after the pre-email pass went out unmarked.** `weeklyDigestRun` now runs a last pass first
   (`{ final: true }`, `DIGEST_MARK_FINAL_MS`, two minutes, so the mailing keeps the rest of the six), under
   the same claim, and its failure never stops the email. The email's trigger has `nearMinute(0)` too, and the
   email says "up to" the run's own London minute (`digestLook_`), not the hour it was booked for.
4. **`check-digest.js` typed the version stamp.** It reads `BACKEND_VERSION` now, so a correct bump of the
   four stamps is green.

And the minor ones: `checkSundayEmail` reads the hour the triggers were booked at (`DIGEST_BOOKED`, set by
`installWeeklyDigest`) and says when the config cell has moved since; names each child with a parent to email
and no answer yet (`digestReach_`, lifted out of `digestPlan_` unchanged); and estimates the room the passes
have before the email instead of saying "can mark N". The dry run marks on the triggers' schedule, each pass
seeing only the answers that had arrived by its time, and says how many go out "not marked" for want of
room. Its repository guard compares real paths, so `..sunday` inside the tree is inside. And
`weekly_digest_marking` is on only for blank, on, yes, y, true, 1 or ✓ — `weekly_digest`'s own rule, so
"disabled" or "none" is off rather than quietly on.

**Checked:** `check-digest.js` 140 → 150 rules: twelve 503s waited out and both marked; a whole pass of 503s
waits, leaves both, and does not throw; the Sunday burst of sixty all marked, no ask within 17 min of the
email, one one-off at a time, none left, none counted by the setup check; Saturday's nightly pass does not
book a run-up; an answer at 17:50 goes out "2 of 3 marks" and "up to 6:02pm"; the email's own pass keeps to
two minutes and the email still goes; the setup check's new lines; the guard's `..` folder. **Mutations, each
red, the real files green after:** the run-up never booking again (16 of 60 marked); busy giving up at once
(both busy rules red); no last pass in the email's run (the 17:50 answer "not marked").

The four version stamps move together to `2026-10-13-t-sunday-runup`. **If `installWeeklyDigest` was already
run, run it again** after deploying: it adds the email's `nearMinute(0)` and records the hour it booked.

### For the owner to do — one Apps Script sitting, before Sunday 18 Oct

1. **Deploy the backend** with the GitHub Assistant extension (CLAUDE.md's route 1: Repository ▾ / Branch ▾
   `main`, ↓), then **Deploy → Manage deployments → pencil → New version → Deploy**, so the site's own
   requests run it too.
2. Run **`ensureSchema`** (or open `/exec?setup=1`) once, so the config tab gains `weekly_digest_marking`
   (on) with its note. Not required — blank is on — but the row says what it does.
3. On the config tab set **`weekly_digest`** to **`send`**. (Check GEMINI_API_KEY is in Project Settings →
   Script Properties; it is if Mark with AI works.)
4. Run **`installWeeklyDigest`** from the function list. It books the email (Sundays about 18:00) and the two
   marking passes (nightly about 02:00, Sundays about 17:00, carrying on until about 17:43), and says so in the log.
5. Run **`checkSundayEmail`**. Every line should read as ready: the email ON, the triggers installed, the key
   set, Gemini answering the test, the library fetched, and a list of any learner who will not be reached and
   why — the live sheet has six parents with links and one email address among them, so most learners will
   be listed until their parents' addresses are on the people tab.

The child still has to be signed in as themselves on the device they work on — a question sent while the
tutor is signed in goes on the tutor's row (291).
