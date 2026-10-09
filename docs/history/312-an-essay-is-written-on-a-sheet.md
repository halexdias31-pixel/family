## An essay is written on a sheet: paragraphs with a return key you can see, and Gemini marks all of it

**The owner, 9 Oct**, about a pupil sitting AQA GCSE English Language Paper 1, June 2017, Section B —
question 5, forty marks of creative writing (row `Q-R0398-5`, `answer_type` `written`, no `accept`):
*"firstly it doesnt let him do paragraphs and also i want it to mark with ai. gemini."*

### Why he could not write paragraphs

**THE BOX WAS A CHAT BAR.** Since 297 every answer box is `ansBox_`'s chat bar: a cream pill beside a
round Send tile, one line tall, growing to about five lines (`max-height: 9.5rem`) and then scrolling
inside. Right for "egestion"; for an essay it is four paragraphs seen through a letterbox.

**AND THE NEW LINE WAS THERE, IN THE TWO PLACES NOBODY LOOKS.** On the pad's letters the new line was
`↵`, a grey glyph in the fourth slot of the bottom row, the size of ← and → beside it. On a laptop,
Enter was ✓ (`kpDone_`, put the pad away) and only Shift+Enter typed a new line — so a child pressing
Enter for a new paragraph closed the keyboard he was typing on. Nothing was broken; nothing said how.

### Why Gemini could not mark it

**THE ANSWER WAS CUT AT 2,000 CHARACTERS**, silently, by the backend (`aiMark` in dopost.gs) — about
350 words. A top-band essay is 600–1,000 words, so Gemini marked its first third and the phone drew the
mark as the essay's. The question was cut at 4,000 and the scheme at 3,000.

**AND THE SAME 2,000 WAS THE ACCOUNT'S CEILING** (`ANSWER_TEXT_MAX`, "the same ceiling as an answer sent
to Mark with AI"): a forty-mark essay stopped going to the pupil's account at its fourth paragraph and
said "On this device only — too long for the account".

**AND WITH AI MARKING OFF THE SHEET SAID NOTHING.** No key in Script Properties (or no `aiMark` in the
deployment) drew no tile and no word about why, under an answer nobody else was going to mark.

### What was built

**ONE PREDICATE, `ansEssay_(x)`** (js/keypad.js): a worded box (not maths, not choices, not a pen)
whose `answer_type` is `written` or `explain`, worth **6 marks or more**, **in a subject that is not
Maths**. Counted over data/questions.json on 9 Oct, 8,010 question rows:

| | rows |
|---|---|
| `written`, 6 marks or more | 201 — Religious Studies 152, English Language 21, sciences 28 |
| `explain`, 6 marks or more | 76 — English Language 71, Physics 4, Combined Science 1 |
| **essays** | **277**, every one with a scheme and none with `accept` — all Gemini's, none Check's; 275 of the schemes name their levels |

**Not Maths** came from the review (below): the first count was 281, and four of them were Maths
`explain` rows worth six or seven — a "show that", a tangent's equation, two histograms compared, a
wage sum. Their schemes are method steps, and this predicate is also what asks Gemini for the levelled
marking, so it was telling a model to judge the writing of a page of algebra. No Maths `written` row
was ever caught (all 40 are worth 1 to 5 or carry no mark).

**`written` at any mark was the first rule, and the count said no:** 90 of its 291 rows are under 6
marks or have none — "State the defining property of a black hole" [1], Greek comprehension's "Give two
details" [2], "Interpret what the gradient represents" [1]. Twelve ruled lines under a one-mark question
says "write a lot" to a question that wants a phrase. Six is where the boards' own levelled extended
responses start (AQA's six-mark science questions; English's shortest analysis question is eight), and
five-mark `explain` (11 rows) is mostly Maths "show that" — working, not prose.

**THE SHEET** (`ansBox_` in find.js, `.qp-sheet` in style.css). Full card width; the paper palette, tokens
only; ruled in `--paper-rule`, one hairline per 24px line of 16px writing, the rules scrolling with the
words. Eight lines tall to start on a phone and twelve on a tablet; growing with the essay to **the room
above the pad** (`100dvh − --kp-h − 112px`, `--kp-h` the pad's own height, written by keypad.js when it
comes up) and then scrolling inside, the line being written kept in view (`kpCaretSeen_`), and the row
under the sheet kept above the pad (`kpBox_` is that row for an essay). The same cap with the pad down,
so putting it away moves nothing. The newlines are drawn (`pre-wrap`), so a blank line is a paragraph
break you can see. Empty, it says *"Write your answer here. Press return to start a new paragraph."*

**THE CARD IS NEVER SHRUNK FOR IT.** Measured at 390x844 with three paragraphs, the growing sheet took
its card past the pane and `paneReach_` zoomed the whole card to 0.87 — the writing 14px, the Mark tile
38px, the sheet 242px wide. A sheet already scrolls, so it is the thing that gives the room back:
`kpSheetFit_` (keypad.js), called by `paneReach_` before it measures, caps the sheet at what keeps its
card inside the pane — never under five lines — and the card stays at full size.

**UNDER IT, A ROW OF TILES** (a thing has tiles): Mark with AI (or Send where a scheme can be checked),
the Figure tile, and the **word count** — "412 words", live, kept by `kpRender_` so a key, a paste, an
undo and the account's copy arriving all update it. With no tile to draw, one faint line says why —
*"AI marking isn't switched on yet"* (`aiWhyNot_`) — to a pupil signed in, never to a stranger, and
never as a control that does nothing. The verdict, the saved line and `.qp-ai-why` keep their classes
and their reserved lines; `.qp-ans-in`, `.qp-mark`, `.qp-ai`, `.qp-ai-go`, `.qp-check` and `data-k`
are where they were.

**THE RETURN KEY.** An essay's letters face (`KP_ABC_ESSAY`) has a phone's return: at the right-hand
end of the space bar's row, **twelve columns** (two letters) wide, *"↵ return"* on its face — 57px at
320, 71 at 390, 121 on a tablet, and as tall as every key. The space bar gives up the columns (36 → 24).
Not in the bottom row: its six keys are ten columns each because ten is what 44px needs at 320, so none
of them can grow. The bottom row's fourth slot goes back to ␣, the maths pad's own row again — one
return, and a big one. A short worded box keeps its ↵ where it was.

**A LAPTOP'S ENTER** (`kpKeys_`): in an essay Enter is a new line, Shift+Enter too; Ctrl/⌘+Enter is ✓
and Escape puts the pad away. A short worded box keeps Enter as ✓.

**GEMINI MARKS THE WHOLE ESSAY.** Both sides together, the same numbers (`AI_ANSWER_MAX`,
`AI_QUESTION_MAX`, `AI_SCHEME_MAX` in js/keypad.js and backend/constants.gs): the answer up to 20,000
characters and **refused, never cut**, past it (on the phone and again on the server, before a mark is
counted); the question and the scheme to 8,000 each. `ANSWER_TEXT_MAX` / `ANS_TEXT_MAX` to 20,000, so
the account keeps what was marked. The request carries `essay: true` (`ansEssay_`), and for an essay
`aiMarkAsk_` asks what an examiner does: **each strand the scheme names marked separately on its own
levels** (the level the writing best fits, then the mark within it) as `parts`, which the server clamps
one by one and **sums** — believed only when the strands' ceilings add up to the question's — and
**two or three short, specific points** a fifteen-year-old can act on. The reply keeps its shape
(`{success, awarded, available, feedback}`, `why: 'ai-off'`): `feedback` is the strands on one line and
a line per point, drawn as lines (`.qp-ai-why { white-space: pre-line }`); `parts` and `points` ride
beside it as data. A short answer is marked exactly as before.

**WHAT WAS LOOKED AT AND LEFT.** No `maxOutputTokens`: the reply is small because the schema makes it
so, and a model that thinks spends its thinking from the same allowance — a cap low enough to matter
ends the JSON halfway. The input is under 40,000 characters, about 10,000 tokens. `UrlFetchApp` gives
up at about a minute and `api()` has no timeout of its own; an essay is marked in seconds. The per-day
cap (`ai_marks_per_day`, 20) is unchanged and a refusal for length does not spend one. There was no
cache to read, and none was added: `check-aimark.js`'s cap journeys send the same answer twenty-one
times, and a pupil pressing Mark twice on an unchanged essay is rare enough to cost one mark.

**THE FOUR VERSION STAMPS** are `2026-10-09-b-essay`; `--css-version` is `2026-10-09-essay-sheet-b`.
**Backend changed, so it has to be pulled into the Apps Script editor for the new limits and prompt to
go live — by the GitHub Assistant extension in the editor's toolbar** (`Repository ▾ / Branch ▾ / ↓`),
which is the route that works today (CLAUDE.md, "So: three routes"); `pullFromGitHub` is the third
choice and blocked by the default Cloud project. Until the pull, the live `aiMark` still cuts at 2,000
and marks one sentence — and the phone knows it, because only the new backend lists `aiMarkWhole`
(below), so a longer essay is not sent to the old one.

### What the review of 9 Oct changed

Two reviewers used it on an iPad, a phone and a laptop. What they found, and what was done:

- **A DEPLOY GAP WOULD HAVE SHOWN A MARK FOR A THIRD OF AN ESSAY AS THE ESSAY'S** (the must-fix).
  Pages serves the front end a minute after a push; the backend changes when the owner pulls it. Until
  then the live `aiMark` is still in `features`, still cuts at 2,000 and ignores `essay` — so the new
  phone posted 6,000 characters and drew "N of 40 marks · AI" for the first 350 words. Now the backend
  that reads the whole answer says so: **`aiMarkWhole`** in doGet's `features`, the `attemptWords`
  precedent. A phone that does not see it sends nothing over 2,000 characters and says why, in the
  verdict's line — *"The AI marker reads only the first 2,000 characters until it is updated — this is
  6,214, so it was not sent"* — spending none of the day's marks. An essay under 2,000 is read whole by
  either backend and still goes.
- **THE FIRST KEY AFTER MARKING WIPED THE FEEDBACK**, and a reload lost it: the points the pupil was
  meant to revise from went the moment they started revising, and getting them back cost another of
  the day's twenty. An essay's mark is now **kept with its answer** — on the device, under the
  answer's own key, so it is that person's — with the exact text it marked. Typed over, it stays and
  says **"· before your changes"**, its colour and the sheet's ring taken off; undone back to that text,
  it is fresh again; the card drawn again, or the page reloaded, draws it again without asking Gemini.
  A failed re-mark leaves the old points where they are. A short answer still loses its verdict on the
  next key — there the next key is a new answer. **And the account's copy arriving from another device**
  (`ansRefresh_`, which sets the value with no `input` event and took every verdict off) says the kept
  mark again against the words that arrived instead of blanking it: blanking left the points under an
  empty line on a sheet still ringed stale. Found while fixing the rest, not by the review.
- **AT 320x568 THE ESSAY CARD WAS DRAWN SMALLER** (zoom 0.843: Mark with AI 40px, the sheet 188px wide)
  — the one size where the sheet was worse than the bar it replaced. Five lines of sheet and the
  question do not fit a 568px pane however the sheet gives way. So an essay's card is drawn smaller
  only while that keeps its tiles at 44px (`PANE_ZOOM_ESSAY`, 0.92, in find.js); past it the card is
  full size and its pane scrolls, as any card past the zoom floor does. Measured after: no zoom at
  320x568, the tile 48px, the sheet 223px wide and five lines; 375 to 1366 unchanged.
- **FOUR MATHS ROWS WERE SENT THE ESSAY PROMPT** — see "Not Maths" above.
- **THE HINT WENT AS THE SHEET WAS TAPPED**: `:empty` on the drawing, and the caret is a span in it. The
  field now says `is-blank` for itself while nothing is written (`kpCount_`), and the hint is laid
  behind the caret until the first key.
- **MARK WITH AI WAS AN UNLABELLED SPARKLE ON TOUCH**, and the pad's ✓ wore Send's aeroplane on an essay
  where it only puts the pad away. The tile has its name beside it (`.qp-ai-say`), and an essay's ✓
  says **done**.
- **HOME AND END WENT TO THE ESSAY'S START AND END.** They stop at the paragraph now (`kpLineStart_`),
  Ctrl/⌘ with them goes to the very start or end, and ⇧ selects to either.
- **AN ESSAY REPLY WITH NO TOTAL WAS A SUCCESSFUL 0.** With strands that do not add up and `awarded`
  missing, blank or a word, `aiMarkEssay_` clamped it to nought; it is "try again" now.

**Looked at and left.** *Marking shrinks the sheet* (to about 6–8 lines on a phone or a laptop, from 12
or 14): the points take room on the card, and the sheet is the one thing on it that scrolls; the other
ways to find that room are a smaller card or a scrolling pane, which are the two things this note was
written to avoid. With the mark now kept while revising, the pupil reads the points with the pad down
and writes with it up, where the sheet has the room above the pad. *↑ and ↓ forget the column* over a
short line (83 → 57 → 58): a remembered "goal column" across presses is a feature of its own, and it
predates this change.

### The checks

- **`check-flow.js`**, *"an essay is a sheet…"*: the real Q-R0398-5 through the loader; a sheet, not a
  bar; one labelled return twelve columns wide and the bottom row ␣; two paragraphs on the pad's keys
  and return, a third on a laptop's Enter — `\n\n` in the value and the drawing, the count right;
  Shift+Enter a new line, Ctrl+Enter ✓; a 6,000-character paste sent to Mark with AI **whole**, as an
  essay, out of 40, its strands and points drawn as lines; a three-mark explain box still the bar with
  Enter as ✓; AI off — one line to a pupil, nothing to a stranger, no dead control. Mutated three ways
  (Enter back to ✓, the answer sliced at 2,000, ↵ back in the bottom row): red each time, green on the
  real files. **And after the review**: a six-mark Maths explain is not an essay; the tile has its name
  beside it; the sheet is `is-blank` before and after it is focused and not after a letter; the essay's
  ✓ says "done"; Home, End, ⇧+Home and Ctrl+Home/End; a return typed after the mark leaves it **"before
  your changes"** with its points, undo makes it fresh, the card redrawn keeps it, the account's copy
  arriving (`ansRefresh_`) makes it fresh or stale and never blank, and **a second window seeded only
  with the device's storage draws it without asking Gemini**. The one expectation that was
  obsolete by design: *"a typed return takes the mark off"* — the chat bar's rule, still asked of a short
  box by the Mark-with-AI journey. Mutated seven ways (the stale paint, the `aiMarkWhole` gate, the Maths
  line, `is-blank`, Home, the done key, the device copy), and an eighth for `ansRefresh_` (its kept-mark
  line taken out: the verdict blank over its points): red each time, green on the real files.
- **`check-flow.js`**, *"a backend without aiMarkWhole…"*: features `['aiMark']` only — a 6,000-character
  essay is not sent and the pupil is told why with both numbers; a short essay is sent as an essay and
  marked; `aiMarkWhole` added, the same 6,000 go whole.
- **`check-aimark.js`**, through the real `doPost` (and after the review: `aiMarkWhole` in doGet's
  `features`; an essay reply with no total and no strands that add up — missing, blank, a word — is
  "did not give a mark", never 0, and a total of 0 that was given is still 0; mutated, red): a
  6,000-character essay reaches Gemini whole; the question and scheme past their old cuts; the essay
  prompt asks for strands on levels and two or three points; strands clamped and summed (17/24 + 99/16 → 33); strands that do not add up → the model's
  total, clamped, and no breakdown; a fourth point dropped; 20,001 characters refused before Gemini or
  the cap; a short answer still one sentence; and the phone's three ceilings equal the server's, and
  the account's at least as long. Mutated (the server slicing at 2,000; the phone's ceiling at 2,000):
  red, then green.
- **One expectation was genuinely obsolete**: `check-flow.js`'s *"answers: a refused save keeps the
  answer due…"* typed `'x'.repeat(2001)` as "too long for the account" — the old ceiling copied into a
  check. It reads `ANS_TEXT_MAX` out of js/answers.js now and types one past it. Nothing that held the
  chat bar's shape needed changing: every check that asks for `.qp-bar` asks it of a one- or three-mark
  box, which is still a bar.
- **`check/states.js`**, *"an essay, three paragraphs on its sheet, the pad up"*, measured by
  `check/ui.js` at every width for both visitors: 40 keys, one labelled return ≥ 44px, two paragraph
  breaks, the count right, the row under the sheet above the pad and the caret inside the sheet's window.
  `.qp-essay > .qp-sheet` joins the EDGE rule's subjects.
- **And `check/ui.js` learnt one thing from it.** The first run named the essay state PANE OFF THE
  SCREEN at 320, 390, 1280 and 1920: with the pad up, `kpLift_` lifts the column by what the row under
  the sheet is short of, and a sheet that tall takes the card's top — the question — above the glass.
  That is the keypad's design (the phone's own keyboard pushes a page the same way; the pad put away
  puts it back), and the alternative was measured and refused: a sheet sized so the whole card fits
  above the pad is five lines on a phone and on a laptop. So a pane whose top is above the glass is
  printed as **PANE LIFTED OVER THE PAD (known)** — and only when the pad is up, the hold carries a
  lift, and the focused box's field and the row kept clear for it are wholly on the glass above the pad.
  A lift that took the box itself off the top is still PANE OFF THE SCREEN.
