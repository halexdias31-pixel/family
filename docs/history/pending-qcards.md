## A question reads text, figure, text, figure, text; the answer is one tap for everybody; and a drawing question has something to draw on

**Asked for on 5 October, after tutoring a student through Edexcel GCSE Maths June 2024 Paper 1
Foundation:** *"Let's say there's a question which begins with text, then diagram, then text then
diagram then text. This should break into 5 widgets. This is to ensure it's same order but diagram
has its own widget. Also remove all 'why's. I just want it to have answer. And you should have to
click to reveal the answer. Should behave the same whether it's a tutor or child. No difference
between the two. Also some questions require answers on diagram. So should have a diagram for them
to draw on to do it or whatever."* And, the same day: *"No distinction between tutor and student on
the finder. All the same. Remove any nuances about that."*

### The answer: the result, and one tap

| | |
|---|---|
| **what is drawn** | `answerBlock_` draws the head `answerParts_` returns, mark codes off, and nothing else: no "Why" fold, no working, no examiner's note. `answerParts_` is still the one definition of where an answer stops. The working and the note stay in the row: Mark with AI sends both as its scheme (`aiScheme_`). `.qans-why`, `.qans-more`, `.qans-note` are gone from the stylesheet |
| **who sees it** | `ansOpen_` is `ANS_SHOWN.has(ansKey_(x))` and nothing more. Gone: the staff bypass (`isTutorRole()` saw it open), the auto-open on a right Check, the auto-open on a tapped question settled right. The page says "Answer hidden" (not "have a go first", which was advice to a student on a page a tutor reads) and the one control under it shows it |
| **the tile** | `Show the answer` for everybody; staff read `The answer`. Pressing it still shows the page and turns to it |
| **kept** | `ANS_SHOWN` keyed by the answer box's key, which carries who is signed in, for the visit |

`check-answers.js` now cuts `answerBlock_` out by name and runs it over every answer in the library:
the head typeset and nothing of the why or the note (4,333 answers). It prints, without failing, the
**112** results that say the work was done rather than what it came to ("Shown", "AO2") — the data
workflow is rewriting those rows.

### Every figure on its own page, where the paper prints it

**The data convention** (the data workflow is putting it into rows): the literal `<!--fig-->` between
two top-level blocks of a row's `html` is where that row's `diagram` / `images` stands. A comment
because HTML promises never to draw one — `plainText_` (search), `typeset_` and a browser show
nothing for it. `figBlocks_` takes it out before anything is weighed or drawn; a marker inside a block
stands after that block rather than cutting it. `check-library.js` holds it: `html` only, one per row,
on a row with a figure (or a drawing question), at the top level; and counts the rows carrying one.

**The pages** (`stemPlan_`, `partPlan_`, laid out by `pageParts_`):

| a row with a figure | pages |
|---|---|
| stem, marker | words before → **figure** (`sfigN`) → words after (`stemN-J`) |
| stem, no marker | words → figure (as before) |
| part, marker | lead + html before → **figure** → html after, with the box (the card) |
| part, marker at the very end | the card → figure |
| part, no marker, a pen question | the card → figure to draw on (you read what to draw first) |
| part, no marker, a lead | lead → figure → the card |
| part, no marker, no lead | **figure → the card** (it was card → figure for every part; the paper prints a part's figure before its ask far more often) |

So the owner's sentence is five pages and then the answer: `Q5`, `Figure`, `Q5(a) · 1 of 2`,
`Figure`, `Q5(a) · 2 of 2` with the box. Text pages carry the number (and `N of M` across both sides of
the figure); figure pages only the figure's name. The long-text cut still runs within each side.
"Figure on the next page" is on exactly the page in front of a figure — and on a card whose figure
stands in front of it, nothing (it pointed forward at a page you had just turned past).

**Decided, worth a look:** a stem with words on both sides of its figure, followed by a part with a
lead, is **six** pages, not five: stem words (`Q6 · 1 of 2`), figure, stem words (`Q6 · 2 of 2`), the
lead (`Q6(a) · 1 of 2`), figure, the ask. The stem's words are every part's and the lead is (a)'s, so
one page holding both would print (a)'s sentence under a header saying Q6. Where the paper prints
"text, figure, text, figure, text" the data can say it in five (stem: text + figure; part: text
`<!--fig-->` text).

### A surface for every drawing and annotating question

Of 301, **67** had a picture under the pen. The rest get a surface (`padSurface_`, `surfaceSvg_`):

| | |
|---|---|
| **which** | the row's new `surface` column (`grid`, `coord`, `blank`, `text`) — said explicitly it applies whatever the `answer_type`; else, for a pen question, from `figure`: anything naming a coordinate grid → axes on a grid; any other grid (`grid-blank`, `histogram-grid`, `grid-triangle`, `square-grid`, `grid-line`…) → squared paper — a rule, not a list; isometric or anything else → a blank space. Today: **grid 66, coord 18, blank 150** |
| **drawn** | in `W = 340`, under the existing pen (`padWrap_`, keyed by `padKey_`, so marks persist), in the transcribed figures' own ink classes. The page is headed by what it is — "Squared grid", "Axes", "Space to draw", never "Figure" — and says "Not the paper's own figure — somewhere to work your answer". The paper's own figure, or a stem's one figure, always wins |
| **text** | "Circle the three adjectives in the passage below": the part's own words are the surface. Each word a tap target (`circWords_`); a tap rings it, another takes it off; stored beside the pen's marks (`pad:<question>:words`), held for the visit if storage throws |

**Why a tap and not a pen, for text:** a stroke round a word is a drag, and a drag on this pager turns
the page unless the pen is locked first — two controls between a child and a circle; a tap is a
click, which `PRESS_MOVED` already tells from a swipe. A ring stored in pixels circles whatever was
under it at that width; a ring stored as the word (block and place, `3.7`) is the same word at 320px
and on a laptop. And the answer to the question is a set of words, so storing one stores the answer.

`surface` is a new column: `library.js` maps it, `questionItems` carries it, `check-library.js` closes
its vocabulary — **ahead of the data** (`VOCAB_AHEAD`): on no row yet, printed every run, and it says
when to take it off the list. Questions come only from `data/questions.json`, so there is no sheet tab
or `SCHEMA` entry to add.

The old argument against a generated grid ("a question you cannot answer wearing the clothes of one
you can") is rewritten where it stood, in find.js and check-library.js: the owner decided the other
way, and the surface says on its page that it is not the paper's figure.

### No distinction between tutor and student on Find

Audited `js/find.js`, `library.js`, `keypad.js`, `tiles.js`, `collections.js` for `isTutorRole`,
`isAdmin`, `role`, `staff`, `whoIs_` and wording aimed at one reader.

**Removed:** the staff bypass in `ansOpen_`; the staff label on the answer tile; the auto-opens on a
right answer (not a role difference, but the same reveal nobody pressed); the admin's gold Spotlight
tile on everything in Find's **Learning** group (questions, practicals, projects, textbooks — decided
by `kindOf_`, not a list); `isAdmin()` in the item memo key and the funnel memo (nothing filters by it
— a role in the key read as though Find drew a different library); `const admin` in `libraryInto_`
(declared, never read); "send it to your tutor" on a project's share page ("send it in Messages");
"have a go first" on the hidden answer; the old two-reader argument over `answerBlock_`, rewritten as
what the owner settled.

**Kept, deliberately:** per-person storage — answers, pen marks, rings, done dates, `ANS_SHOWN` — is
each person's own drawer, not a role; the star needs somebody signed in to keep it for. **Films** stay
admin-only, sent by `doGet` to an admin alone: the owner's own words in 068 ("i dont want people to be
able to see them"). Everything outside Find's learning surface: the Spotlight tile on shop rows,
tutors and classes; Mark with AI is offered on what the payload says, to anybody signed in (`self` in
`constants.gs`); the shop's `audience` column, the people column, bookings, job pages, admin tools.

**Worth a look:** an admin can no longer put a question, practical, project or textbook in the
Spotlight window from its card. One condition (`adminLearn_` in tiles.js) restores it.

### Checked, each proved by mutation and restored

`check-flow` — five journeys new or rewritten:
*an answer draws its result and nothing else* (red: the Why fold back, the note drawn);
*an answer is its own page …, hidden from everybody alike* (red: staff bypass, staff label, a right
tap opening it, a right Check opening it);
*a figure stands where the paper prints it* — the owner's five pages, the six-page stem+lead fixture
with headers, pointers, word order, the marker never drawn or searched, strip/Saved/tile, every
placement without a marker, the cut inside a side (red: figure always after the card, the marker not
stripped, a stem's marker ignored, no-lead figure after the card, a pen figure in front, "Continued"
before a figure, one cut across the figure);
*a question answered on a diagram has a surface* (red: no fallback, a surface over the paper's own
figure, a surface headed "Figure", coordinates read as squares, no ringing, a ring not stored,
punctuation in a word, the lead made tappable);
*Find draws the same question family … for a tutor, an admin, a student and nobody* — every page,
markup compared with only a person's things taken out (red: staff see it open, staff label, Spotlight
on learning kinds, Mark with AI for staff only, the pen withheld from staff, an excluded practical
offered to staff only).
`check-library`: the marker rules (red on a mutated copy: inside a block, twice, on a row with no
figure, in `lead`) and an unknown `surface` value. `check-answers`: `answerBlock_` over the library
(red: the fold back, the note drawn, the whole answer drawn). `check/states.js`: the answer hidden for
both visitors (its `only:` is gone), shown with nothing under it, a right Check leaving it shut, a
squared grid under the pen, a passage with two words ringed. `check/press.js` walks figures standing
in front of cards and between pre pages; `check/cards.js` fails a page that draws the marker.
`check/ui.js` accepts a ringed word's size with a written reason (`ACCEPTED_TAP`, `.qw`).

Looked at at 320 and 390: the five pages, the answer hidden and shown (signed out and as an admin), a
squared grid with a stroke on it, a passage with three words ringed. The first look caught two faults
and both were fixed: the ring was drawn round 9px of padding (a tall lozenge into the lines above and
below; the reach is a `::before` now), and every word wore the app's dotted inline-action underline,
so the passage read as a paragraph of links (`.qw` is out of that rule).
