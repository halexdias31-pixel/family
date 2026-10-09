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
whose `answer_type` is `written` or `explain`, worth **6 marks or more**. Counted over
data/questions.json on 9 Oct, 8,010 question rows:

| | rows |
|---|---|
| `written`, 6 marks or more | 201 — Religious Studies 152, English Language 21, sciences 28 |
| `explain`, 6 marks or more | 80 — English Language 71, Physics 4, Maths 4, Combined Science 1 |
| **essays** | **281**, every one with a scheme and none with `accept` — all Gemini's, none Check's |

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

**THE FOUR VERSION STAMPS** are `2026-10-09-b-essay`; `--css-version` is `2026-10-09-essay-sheet`.
**Backend changed: run `pullFromGitHub` (or the editor's GitHub route) for the new limits and prompt to
go live** — until then the live `aiMark` still cuts at 2,000 and marks one sentence.

### The checks

- **`check-flow.js`**, *"an essay is a sheet…"*: the real Q-R0398-5 through the loader; a sheet, not a
  bar; one labelled return twelve columns wide and the bottom row ␣; two paragraphs on the pad's keys
  and return, a third on a laptop's Enter — `\n\n` in the value and the drawing, the count right;
  Shift+Enter a new line, Ctrl+Enter ✓; a 6,000-character paste sent to Mark with AI **whole**, as an
  essay, out of 40, its strands and points drawn as lines; a typed return takes the mark off; a
  three-mark explain box still the bar with Enter as ✓; AI off — one line to a pupil, nothing to a
  stranger, no dead control. Mutated three ways (Enter back to ✓, the answer sliced at 2,000, ↵ back in
  the bottom row): red each time, green on the real files.
- **`check-aimark.js`**, through the real `doPost`: a 6,000-character essay reaches Gemini whole; the
  question and scheme past their old cuts; the essay prompt asks for strands on levels and two or three
  points; strands clamped and summed (17/24 + 99/16 → 33); strands that do not add up → the model's
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
