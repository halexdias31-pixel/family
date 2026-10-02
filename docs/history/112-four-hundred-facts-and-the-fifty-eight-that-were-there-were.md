## Four hundred facts, and the fifty-eight that were there were in the wrong file to matter

**Asked for as "have you added the other many interstting facts? i asked for 400 last night".** They
were not there. `data/settings/facts.json` held 58 and `FEED_FACTS` in `js/chess.js` held the same 58
plus the two clips — a duplicate this file already records.

**WHICH FILE IS LIVE IS NOT THE OBVIOUS ONE, and getting it wrong would have shipped nothing.**
`factsNow_` prefers `DATA.facts` and falls through to `FEED_FACTS` only when the sheet has nothing;
`settingsInto_` fills `DATA.facts` from the JSON file, which has rows. **So a fact added to the
JavaScript list alone is a fact nobody ever sees.** The file is the source and `FEED_FACTS` is the
floor for a phone whose data files did not arrive — `libraryExtras_`'s rule pointed the same way,
now written down in `chess.js` so it is not rediscovered.

**`tools/add-facts.py` is the writer and it is idempotent on the heading**, so a batch can be added
to and re-run without the ids shifting or the facts doubling. Every row asserts its own shape as it
is written: a heading short enough for `.feed-head`, a body that is prose, a `pic` that is two or
three ordinary words naming the SUBJECT rather than the sentence.

**THE HEADING IS THE FACT.** `.feed-head` takes the space and `.feed-body` is small, so a heading
that teases with the answer underneath makes a card you have to work for. The body says why — the
mechanism, the number, what it means.

**Six subjects were added to the sixteen already in use** — Food, Maths, Music, Science, Sea,
Weather — and `feedColours` hashes whatever word it is handed, so a new one costs nothing and gets
its own pair of colours. **Which is exactly why there is a closed list**: nothing anywhere would
notice `Sport` beside `Sports`, and two spellings of one answer are two buttons, which is
`spellKey_`'s whole argument one file along.

**`Study` is the subject a tutoring app has a reason to be opinionated about**, and it went from
three rows to fifteen: testing beats rereading, spacing beats cramming, mixing topics up feels worse
and works better, highlighting is close to useless on its own.

### The rules live in the check as well as in the writer

**`tools/add-facts.py` asserts all of it at the other end and that is not enough**, which is the
sentence `check-quizzes.js` already carries: a file can be hand-edited, appended to by another
script, or written by a version of the tool that has since changed, and a rule living only in the
thing that produced the data is a rule nothing enforces about the data.

**Two duplicate headings is the deck repeating itself**, which is the one thing that reads as broken
— and it is invisible from everywhere else: a duplicated fact measures perfectly, lays out perfectly,
and is a bug you notice on the fourth tap. `check-settings.js` fails on a repeated heading, a
repeated `fact_id`, a subject off the list, markup in a fact, and a heading too long for the card.
**Proved by mutation** in both directions.

**Measured in the app after**: 400 facts, 22 subjects, 60 deals with no repeat, and the two clips
still answering `clipsNow_` from the code because the file holds no clip rows — which is the
per-list rule working exactly as its note says it should.
