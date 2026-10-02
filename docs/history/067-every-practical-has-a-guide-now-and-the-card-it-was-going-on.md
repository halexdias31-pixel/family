## Every practical has a guide now, and the card it was going on was already cut in half

**Asked for as "i also want to add volcanoe practicle to database. aslo each practicle needs to have
a guide with it. like a risk assessment, something which asks for iv dv and control variable. and
whatever else you think is needed for guide. so like it will be in same row as practiclale in
database."**

**`risks` is the one new column, and it is a pipe list like every other list on this tab.** One
hazard and what you do about it per item — *"vinegar in the eyes stings badly and this one erupts
upwards — goggles on both of you before the first pour, not after the first surprise"*. 52 live
practicals, **171 hazards, 3.3 each**; the five refused experiments correctly carry none, for the
reason `check-practicals.js` already gives about their methods: writing out a procedure for
something nobody will run is inventing content to satisfy a checker.

**A pipe, not a comma, and the practicals already paid for that lesson** — 14 of the 410 equipment
cells carry a comma inside one item, and no comma rule can tell *"Bunsen burner, tripod, gauze,
heatproof mat"* (four things) from *"Nichrome wire (about 1 m, taped to a metre rule)"* (one).

**The volcano is `PR-HM11`**, 40 minutes, home, 6+, 40p a run and £7.50 of kit bought once — and
the row's own `aim` says what makes it a practical rather than a party trick: *"build a volcano,
then stop treating it as a trick and find the mixture that gives the biggest eruption."* It joins
`Chemical Changes`, `Rate of Reaction`, `Writing & Simplifying Ratio` and `Units & Measures`, all
four spellings the tree already answers to.

### THE CARD WAS ALREADY 891px INSIDE A 534px PANE, AND THAT IS WHAT DECIDED WHERE THE GUIDE GOES

**Measured before a word of it was written, which is the only reason the design is what it is.**
`.pane` is `overflow: hidden` with `max-height: calc(100dvh − …)` — **534px on a 320×568 phone,
807px on a 390×844 one** — and each card is one page of a column. At 320×568:

| | before | after |
|---|---|---|
| practical cards past the pane | **51 of 56** | **0 of 57** |
| median card | **891px** | **274px** |
| the worst | **1693px** | 386px |

**More than half the set had its kit, its method, its safety line and its notes below the fold, with
no scroll and no page to turn to.** On every commit, for as long as that card had existed. A guide
appended to the bottom of such a card would have been a guide nobody could reach — so the guide is
not on the card.

**NOTHING ANYWHERE COULD SEE IT, and the reason is the sentence this file already writes twice.**
`check/ui.js` renders whichever five cards the funnel happens to stop on; `check/cards.js` lays out
every row in the library and **asks about WIDTH only**. Both were green. The axis nobody travels was
measured on every commit and the axis everybody travels was measured by nothing — which is exactly
what `OUT OF REACH` was added to `check/ui.js` for one commit earlier, on the screens, and this is
the same fault one layer down, on the cards.

**So the card is the SEARCH RESULT and the guide is the DOCUMENT.** That split is what the funnel
already does everywhere else. The card keeps what you choose BETWEEN practicals on — the flag, the
strip, the aim, the outcome, the hazard word, and `wow`'s *"worth opening a session with"*, whose
own note says it answers exactly the question of which one to start a session with. The kit, the
method, the safety line and the notes are what you read AFTER deciding, and they moved.

**A tile, because a practical is a thing.** The house style settles it — a THING has tiles, a FORM
has buttons, tiles win any tie — one renderer, one 44px target, and `check-doors.js` pairs the `act`
against its handler. **`icon: 'paper'` is not in `TILE_ICONS`**, and `tileIcon_` falls back to the
word for a name it has never heard of: *"visibly wrong, rather than invisible"*, which is what the
first screenshot showed — a square reading `Guide` in a column of glyphs. `doc`, because a guide is
a document.

### `#sheet-body` scrolls, which is this app's own answer for anything longer than a card

The note by `.pane` says it outright: *"anything genuinely long should be PAGED"*, or it belongs
somewhere that scrolls. The guide is 3,451px on the volcano. `<details>` was not an option —
`js/find.js` records it being removed at the owner's decision.

**Eight boxes, and the slots are the ask**: what else can you see in THIS room · independent
variable · dependent variable · control variables · prediction · results · conclusion · evaluation.
Each is `ansKey_(x) + '#' + slot`, so `whoIs_` still decides whose answers these are and the
"working as" switch still moves all eight together — which it would not if this invented its own
key-builder. **Proved on the wire**: typing into the IV box writes `ans:pr:PR-HM11#iv` to
localStorage, and it comes back after closing and reopening the sheet and after a full page reload.

**THE RISK ASSESSMENT IS NOT FINISHED WHEN IT ARRIVES, and that is the whole shape of it.** What is
in the row is what is true of the EXPERIMENT. What nothing in a database can know is the ROOM:
whether there is a rug under the table, whether a toddler is in the house, whether the only socket
is beside the sink. A risk assessment that reads as complete is one nobody looks up from — so the
written hazards are the START of the list and the last line of that section is a box.

**And the public-liability line is drawn from `venue === 'home'`**, not written into ten rows. The
AQA insert argument, which this file already makes twice: one fact several rows hang from belongs to
whatever draws them, or it is ten cells to keep in step the day the wording changes.

### It is the card's own classes, because they are the card's own blocks

**`.prac-kit`, `.prac-steps`, `.prac-why`, `.prac-tab`, `.prac-safety`, `.prac-home`, `.prac-maths`,
`.prac-note`, `.prac-aim` and `.prac-out` are drawn by the guide now and by nothing else.** Giving
them `.gd-` names would have been a second description of one object — the `.reel .over` fault,
where a subject, a heading, a paragraph and a credit over a picture were written twice in this
stylesheet and drifted. `.prac-tab`'s own note describes "what I changed" beside "what I measured",
which is precisely the pair this guide asks somebody to name.

**The answer box is `ansBox_`'s box**: `.qp-ans` and `.qp-ans-in`, already the ruled-paper field a
student writes into, already keyed off `data-do="qp-ans"`, already saved by the same delegated
listener. Four rules are genuinely new — the wrapper, the question, the hint under it, and the
box's own floor — and `.gd-sec` joins the existing selector groups rather than restating them.

**Spellcheck stays on**, where `ansBox_` turns it off. That one holds `3.42 × 10⁷`; these hold prose
about what somebody thinks will happen.

### A screenshot caught two, and one of them was the specificity trap again

**The guide's maths line and its tutor notes drew at the browser's default 16px** — a third larger
than every other paragraph on the card, because they were bare `<p>`s and nothing styled them.
Valid markup, no overflow, nothing any check could measure. **Ninth time this file records that a
screenshot is the last word on something drawn.**

**And the obvious fix would have eaten the safety line.** `.gd-sec p` is a class plus a type,
specificity (0,1,1), against `.prac-safety`'s and `.prac-home`'s (0,1,0) — both of which are `<p>`
inside a `.gd-sec` — so it would have won every declaration they make and flattened the gold-ruled
warning into ordinary body text. Caught before it was written, by reading what was already in the
block. **Sixth conviction of `.price.faint`** in this stylesheet, after `--fly-ink`,
`.bk-row.is-blank` losing to `.bk-row.is-bare`, `.rc-total` losing to `.bk-row`, and
`text-anchor="end"` losing to `.qsheet .num`.

### `check/cards.js` gained the other axis, and `check/ui.js` can see a sheet at all

**The height rule is a FAILURE rather than a count, and it can be, because the number is zero.**
Everywhere else in these files a blank is a backlog printed as a number; here there is no backlog to
swamp it, so the first card that goes back past the fold says so instead of joining a red nobody
reads. **Proved by mutation**: putting the guide back on the card names 50 rows, the worst 2,656px
past the pane, and exits 1.

**Only the practicals, and that line is principled rather than lazy.** That pass boots the real app
and calls `practicalCard_`, so it measures the height the app actually draws; the question pass
rebuilds a question's markup with `cardHtml`, which has no tiles, no mark scheme and no answer box.
A height measured off that is the height of a card nobody sees, which is the fault this very file
was once caught committing. Sampled through the app's own `questionCard_` instead: **4 of 600 past
the cap, median 250px** — real, small, and not something that instrument can honestly claim to have
swept.

**And `#sheet` is a sibling of the screens, not a child of one.** So every surface this app opens in
a sheet — the details form, the pay sheet, the composer, a tutor's profile, and now the guide — has
been outside `check/ui.js` for as long as that file has existed. Nothing was wrong with `#s-<id>`:
it IS the screen, and a sheet is not on it. **A declared state that opened one would have reported a
clean sweep of the screen underneath**, which is the `check-booking.js` fault in another
costume. The sheet joins the measured roots when it is open, 19 states and 128 combinations now, and
**`leave` puts it back** — states run in order down one page and `go()` does not close a sheet, so an
open guide would otherwise have been counted as part of Tools and Games.

**Proved by mutation**: `white-space: nowrap` on `.gd-ask` names `stuff · a practical guide` at all
four widths and both visitors; the real files report nothing new across 128 combinations.

### The guide is what somebody is looking for, and the search box could not see a word of it

**Said as "all of the guides are resources i guess which can be found in finder".** Measured before
anything was changed: **0 of the 57 practicals carried a `text` at all.** `stuffFind`'s haystack is
`name + sub + subject + slot + grade + text`, and `text` is the only one of those that holds a
thing's own WORDS — every other entry is a label. So a practical was findable by its title and by
nothing else.

| typing | before | after |
|---|---|---|
| `goggles` | **0** | **13** |
| `stopwatch`, `ruler` | **0** | 18 each |
| `tray` | **0** | 11 |
| `nichrome`, `foil`, `magnesium ribbon` | **0** | 2 each |
| `limiting reactant`, `perimeter` | **0** | 1 each |
| `bicarbonate` | 1 | 4 |

**The handful that did hit were hitting the NAME, which is a coincidence rather than a search** —
the volcano happens to be called *"Volcano — bicarbonate and vinegar"*, and `trundle` and
`chromatography` are titles too. Every word in the first five rows of that table is sitting in the
row somebody was looking for.

**This is the `topics` fix and the `company` fix one data file along**, and the sentence is the same
all three times: the words are in the row, the search box cannot see them, and a screen whose whole
job is finding things returns nothing for the thing it holds. There it was one column; here it is
the whole guide — the kit, the method, the hazards, the variables and the science. **Built onto the
item, not matched per keystroke**, which is what those two notes also say. 1,558 characters a
practical, and a search still measures 1 ms over 4,963 items.

**A refused experiment is searchable too, deliberately.** Those five rows exist so a tutor asking
why they are not burning magnesium ribbon finds the answer instead of an absence — and a reason
nothing can search for is an absence with a row behind it. `magnesium ribbon` returns both.

**`plainText_` came out of `searchText_`** rather than being written twice: a `&frasl;` or a `<b>`
is the same thing to a person typing into the search box whichever column it came from, and two
copies of that entity list is two chances to handle one of them in one haystack and not the other.

**One thing is deliberately NOT searchable**: the public-liability sentence. It is drawn from
`venue === 'home'` and is in no row, so `public liability` returns nothing while `home` returns all
of them. The fact is the venue; the sentence is the rendering.

#### `check-funnel.js` prints what the search box can see, per kind — and could not see it

**The instrument that would have caught this is a count**, so it is one now: items per kind whose
own words are in the haystack. **Printed rather than failed**, and that is the `figure` argument
rather than laziness — a boxer's card is a record with no prose on it, and demanding a haystack of
one would mean inventing words to satisfy a checker. What the number is for is the other direction:
a kind that HAS words and stops shipping them.

**Its first run reported `question`, `venue` and `tutor` and did not mention the practicals at
all.** The harness's `fetch` stub answers `questions.json` with the real library and **everything
else with the fixture**, so `data/practicals.json` came back as a payload object rather than an
array and the mapper built nothing. So the check was blind to the one kind it was written for — *a
check that cannot fail is not a check*, and this one could not have. Found by reading its own output
rather than by trusting that it ran, which is the same move as the probe that reported clean on the
`and`/`&` spellings.

**Proved by mutation** with the line put back: `practical 0 of 57 — findable by its name and nothing
else`.

#### And `Resources` in the funnel now means boxing

**Worth knowing before anybody files anything under that word.** Measured under `What for ·
Learning`: **Questions 4,906 · Resources 260 · Practicals 57** — and those 260 are the boxers and
the fights. `KINDS` gives `boxer` and `fight` the label `Resources`, and the note above it says why:
*"like a topic and a past paper, because that is what the second question is asking"*. **Both of
those are gone** — `topic` was deleted when the funnel started listing questions, and `question`
was given its own label — so the word is now doing no work it was chosen for and names one subject.

**Not renamed here**, because the `kinds` tab owns a label with no deploy and which word goes on a
button is a judgement rather than a repair. Written down so it is a decision rather than a leftover
— the shape this file already records under `resource_type` in `VOCAB` and the dead
`kind === 'paper'` guard.
