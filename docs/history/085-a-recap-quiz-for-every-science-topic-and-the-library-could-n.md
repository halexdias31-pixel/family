## A recap quiz for every science topic, and the library could not mark a single one of its own

**Asked for as "i need to make a quize for each level of each topic in my site. just a quiz os less
pressure. sort of like a recap thing. starting with science."**

**THE MEASUREMENT IS WHY IT IS NEW CONTENT RATHER THAN A NEW VIEW OF THE LIBRARY.** There are 745
science questions in `data/questions.json` and **every one of them has an empty `accept`** — so not
one can mark itself. That is correct for an exam question, which is marked against a scheme by a
person reading working, and it makes a recap impossible: the whole point of a recap is that you
find out now. So 405 questions were written for it — 81 quizzes, five each, **27 science topics ×
KS3 / GCSE Foundation / GCSE Higher**, 368 multiple choice and 37 typed.

**The three levels are different QUESTIONS about one topic, not one question worded harder.** KS3
asks what a thing is; Foundation asks what it does and what the words mean; Higher asks the content
that is Higher-only on the spec — the inverse square law, monoclonal antibodies, negative feedback,
trophic efficiency, momentum. A Higher paper is not a Foundation paper with longer words.

**And every `why` is the MECHANISM rather than the answer said again.** This file already records
that line twice about the practicals' `science` column: a sentence saying *"the rate rises with
concentration"* hands somebody the result of an experiment they have not run. *"More particles in
the same volume, so more frequent collisions"* is the half a student cannot get from watching, and
it is as true before the answer as after it.

### It is marked by `markAnswer_`, which is the library's own marker

**A typed quiz answer goes through the same function a past-paper answer does**, so the fraction
slash, the mixed number, the "or equivalent" fold and the accepted band all behave here exactly as
they do on an Edexcel paper. A second marking implementation would be the second reader this
repository records under `documents_()`, `paperIdOf_`, `factsNow_` and `childrenOf` — and **this is
the one surface in the app that tells a child they are wrong**, so two of them is two chances to do
that unfairly.

**And the answers live in the drawer the past papers already write into.** `ansKey_(x) + '#q<n>'`
is `guideBox_`'s shape and for its reason: `whoIs_` still decides whose answers these are, so two
students on one phone get two sets and signing out moves all five together. Which also makes *"if
they answer something, it will be answered next time they come on"* true of a quiz with nothing new
written.

### `node js/check-quizzes.js` found three on its first run, and they are its whole class of fault

**`quizRight_` compares a multiple-choice answer against the stored press as a STRING, character for
character** — and that is safe only because the answer is one of the choices. An answer cell that is
not reachable by any press marks **every attempt wrong, for ever**, silently, with valid markup, and
reading as the student's fault rather than the row's. That is the failure this file calls the worse
of the two.

**The three it caught are the same shape one column along**: `A hand warmer`, `A sports injury cold
pack` and `Radon gas from rocks` were printed as the answer to a TYPED question whose `accept` list
would have refused all three — so a child typing exactly what the card showed them would have been
told they were wrong. The check runs the app's own `markAnswer_` over every typed row's own printed
answer, which is the only way that question can be asked.

**`tools/quizwrite.py` asserts all of it at the writing end and that is not enough.** A file can be
hand-edited, appended to by another script, or written by a version of that tool that has since
changed, and a rule living only in the thing that produced the data is a rule nothing enforces about
the data. Same argument as `check-library.js` sitting over insert scripts that already assert their
own totals. **Proved by mutation in four directions**: an answer that is not a choice, a comma in a
topic name, a missing `why`, and a typed row whose `accept` was emptied.

### `check-marks-load.js` — the second extractor was written and immediately got it wrong

**`check-quizzes.js` needs the same six marking functions `check-marking.js` cuts out of `find.js`,
to ask a different question of them**, and its first version had its own simpler cutter: to the next
top-level declaration. **It reported `js/find.js no longer declares markBare_`** about a file that
declares it on line 3420 — `markBare_` is a `const` arrow with no block, so it ends at a semicolon
rather than a brace, and the naive cut walked straight past it.

A check confidently wrong about its own subject, one commit after being written. One extractor now,
brace-counted, used by both — which is this repository's own answer every time two readers of one
thing appear.

### The number was in the roster line, and a state added to the lab did not touch it

**`check-all.js` said `132 combinations of screen, state, width and visitor` and the run printed
140.** The quiz state was measured, reported nothing, and the summary went on naming the old number,
because `check/states.js` and `check-all.js` are different files and only one of them counts.
**Fifth occurrence of the shape this file opens the checking section with** — "all 18 checks pass",
"one of the eighteen names", `papers checked against a total` going 34 → 2 under a green tick, and
the prose over `CARD_W` naming 88% and 4% while the code said 80 and 8. The label names no number
now; the run prints its own.

### The double-import trap, and it printed `0 quizzes` over 405 perfect rows

**`tools/quizwrite.py` run as a script is `__main__`.** The three content files say
`from quizwrite import quiz`, which loads it a SECOND time under its own name with its own empty
`ROWS` — so the rows landed in `quizwrite.ROWS` and the `write()` at the bottom read `__main__.ROWS`,
a different list. It reported **`0 quizzes, 0 questions`** over content that had been built perfectly,
which is this repository's oldest shape one more time: *I did not manage to look, reported as I
looked and there was nothing there.* It goes through the imported copy now.

### Found in the funnel, opened in a sheet — which is the practicals' split and its measured reason

**`.pane` is `overflow: hidden` and caps at 805px on an 844px phone**, and five questions with four
choices and an explanation each is nowhere near that. So the card is the search RESULT — the topic,
the level, and how far through you are — and the sheet is the thing you work through, because
`#sheet-body` scrolls. Identical to the split `practicalCard_` records, taken for the same reason
measured one data file along.

**The join is `topics` a third time**, and that is the whole reason this is in the funnel rather than
on a screen of its own: `tools/quizwrite.py` refuses a topic `data/topics.json` has never heard of,
so a quiz, a practical and a past-paper question about cell biology all answer one Topic question.
`level` and `tier` are the library's own spellings for the `needs_print` / `print_required` reason —
a third spelling of a fact two columns already carry cost 356 rows of disagreement last time.

**The mark is drawn from the stored answer, never left on the element by the handler.** That is the
`REEL_HELD` fault in full: the reel's pause mark was added in the tap handler only, so a repaint
rebuilt the markup without it while the state stayed. Here the same fault would be a quiz you
answered, reopened, and found blank while the score said 5 of 5. `quizRow_` reads the key and works
the mark out itself, so the markup after a press is byte-identical to the markup after reopening.

**And the score is counted rather than stored** — a stored score is a second copy of a fact five keys
already hold, which is `paperMismatches`'s argument and `reelPages_`'s. An unanswered question is not
a wrong one, because `markAnswer_` answers `null` for an empty box and that distinction is deliberate
there: the line says *"3 of 5 answered, 2 right"* rather than failing the two nobody has reached.

**The declared state seeds one right and one wrong**, through `localStorage` and the app's own
`quizKey_` rather than by pressing, because that is what proves the two paths agree — and a quiz
where everything is right measures no red, which is half the rules in the block.

### `check/press.js` could not see a sheet a STATE had opened, and the mutant proved it

**It reported a clean run over 93 actions with `quiz-pick`, `quiz-check` and `quiz-again` never
pressed once.** The queue is built from `#s-<id>`, and **a sheet is a sibling of the screens rather
than a child of one** — so the only route a sheet's actions ever had was `out.inSheet`, which is
collected AFTER a press opens one. A state whose own `enter` opens a sheet queued nothing at all.

**Proved by breaking `quiz-pick` outright and watching the mutant survive**, which is this file's own
definition of a check that cannot fail. With the queue seeded from an open sheet the count goes
**93 → 99** and the mutant is named at both visitors; the real handler is silent.

**The practical guide had been in the same hole since it was written** and got away with it because
the boxes it holds are `qp-ans`, which is pressed on a question card elsewhere. That is the
instance; the queue is the rule, and this repository's own sentence about `cost: 0` and `paper:
true` is why the fix is the second one.

### The card said the same sentence eighty-one times

**A screenshot of five cards in one column, all reading *"A quick recap. Nothing is sent anywhere and
there is no timer."*** One fact about every quiz in the list, printed once per row — which is the AQA
insert fault this file records in full: one sentence describing an insert, repeated on every question
that used it, when it belongs to the thing they all hang from. The sheet's own intro says it once, at
the moment somebody is about to answer.

What actually tells two cards apart is the topic, the level chip and how far through you are, and
only the third of those is ever worth a line. **Twelfth time this file writes that a screenshot is
the last word on something drawn** — nothing measured wrong, no overflow, no tap target under 44px,
and the card was a third boilerplate.
