## Coursework is a type of project: one column, one question, and the stages of a design-and-make

**The owner, 9 Oct**: *"i would like to add course works. make it bare bones. its within projects in
finder. like i remember i did dt graphics coursewoork in gcse which was to make products for a movie
coming out. liek carboard cutout and stuff and poster ect. make it bare bones for now, i am just
trying to set up infrastructure."*

### What was built

- **`data/projects.json`** — one new column, `project_type`: `project` or `coursework`, and **blank
  reads as `project`**, so the eight rows from note 253 are untouched. A coursework row also names
  `exam_board` (required, from a closed list) and may name `spec_ref` — **the practicals' column
  names**, see below. One seed row, `PJ-09`, *Products for a film launch*: a studio has a new movie
  coming out; design and make a free-standing cardboard cut-out, a poster and a third piece such as
  a popcorn box, for GCSE Design and Technology, ages 14–16, ten sessions. Its `steps` are the eight
  **stages** of a design-and-make coursework — the brief, research, a specification, ideas,
  development, model and test, making, evaluation.
- **`js/library.js`** — `projectType` (lower-cased, blank → `project`), and `exam_board` → `board`,
  `spec_ref` → `specRef`, word for word the practicals' mapper.
- **`js/find.js`** — `PROJ_TYPE` and `projType_`, `PRAC_TYPE`'s arrangement: the file holds the word,
  the code holds the label, an unknown word is drawn raw. The card's flag says `Coursework`; its
  strip says `Design and Technology · GCSE · AQA 8552`, the board and spec joined by a no-break
  space so they wrap as one; the ordered page is titled **Stages** on a coursework and Steps on a
  project — one word chosen by the type, not a second page. The share page of a coursework carries
  one paragraph on whose work it is (below). The item carries `projectType` (the label) and
  `examBoard`. `projectText_` adds `coursework NEA non-exam assessment`, the board and the spec to a
  coursework's haystack, the subject's short names (`PROJ_SUBJECT_SAID`: `DT D&T`) to any project's,
  and every hyphenated word again without its hyphen. `TAG_OF.projectType` is `type`, the colour
  Experiment or build wears.
- **`data/settings/facets.json`** — one row: `projectType`, *Project or coursework*, sort order 28,
  **`min_coverage` 1**.

### A type, not a kind — the opposite answer to note 253, for the same reason

Note 253 made projects a kind of their own because a how-to video has none of a practical's
questions — no variable, no board, no lab. A coursework has every one of a project's: sessions,
materials, an ordered list, something made at the end, a share page. The one thing it has that a
project does not is a board — so `check-projects.js` **requires** one on a live coursework. So it is
a word in a column, exactly as `practical_type` is, and everything a project already does it does
too.

### The question is a row of the facets file, as `practicalType`'s is

`practicalType` has **no facet in code**. It is one row of `data/settings/facets.json`, read by
`settingsInto_` (the file replaced the sheet's `facets` tab — `doGet` no longer reads that tab) and
turned into a question by `facetFromSheet_`. `projectType` is the same: no code fallback, because
the thing it mirrors has none. **Nothing for the owner to add to a spreadsheet** — the row is in
the repository, and projects come only from `data/projects.json` (`LIB_EXTRA`), never from the sheet,
so `backend/` did not change and no version stamp moved.

### Asked BEFORE Subject, and that is load-bearing

`practicalType` sits at 38, after Subject. Put there, this question is never asked: measured in
`check-flow.js` with the row at 38.5, the funnel asked **Subject** straight after Projects — Maths,
English, Technology — and every one of those answers leaves only one type (the coursework is the
only Design and Technology project), so *Project or coursework* never had two answers. At 28 it is
the first thing asked once Projects is chosen, which is what *"its within projects in finder"* means.
`check-projects.js` fails a `sort_order` that is not before Subject's — and a blank one, which the
phone places at 1000.

### And asked ONLY of a list that is all projects — `min_coverage` 1

**The first cut shipped with `min_coverage` blank, and its own note said "the coverage rule hides it
elsewhere". It did not.** The default bar is half the list, and sitting before Subject means
nothing narrower gets there first. The review typed `blade` and skipped What kind: two projects,
the D&T textbook and a practical — exactly half projects — and the funnel asked *Project or
coursework*; Coursework left one item, and the textbook and the practical went without a word. A
sweep of 1,550 searches found `send` (17 items, 9 of them projects), `folder` and `studio` doing the
same, for both visitors. `practicalType` never did it (0 of 1,500 practical words) only because it
sits after Subject, which splits a mixed list first.

At 1 every item in hand must be a project. Measured after: `blade`, `send`, `folder` and `studio`
with What kind skipped all ask Subject, and Learning → Projects still asks Project or coursework
first. `check-projects.js` reads the cell as `facetMin_` does and fails anything under 1;
`check-flow.js` builds every project plus a practical, skips the doors, and fails if
`nextFacet` asks the question — and fails if the projects alone do NOT, so the first half cannot
pass by the question vanishing altogether.

### The seed row is our own brief, not a board's

No exam board's NEA context, brief or assessment wording is copied. The brief is the owner's memory
in our words, and the stages are the general shape every design-and-make coursework takes. The
board and spec, `AQA` / `8552`, are the ones the @family. GCSE Design and Technology textbook already
names; `Design and Technology` and `GCSE` are spellings `SUBJECT_BUCKET` (Technology) and
`LEVEL_BUCKET` already place.

**Topics are three existing branches of `data/topics.json`** — `3-D Shapes` (its alias is `nets`),
`Scale Drawings & Maps`, `Enlargements` — because a popcorn-box net and a cut-out scaled up from a
drawing are exactly those, and `check-projects.js` refuses an empty `topics`. The tree has no Design
and Technology branch, and none was invented: the D&T textbook's own chapters carry no topics either.
**A known cost, left on purpose:** Subject → Design and Technology leaves the textbook and the
coursework, and since one of the two carries topics, Topic passes the half-coverage bar and asks
`3-D Shapes | Enlargements | Scale Drawings & Maps`, where any answer drops the textbook. Blanking
the topics would end that route at two items as before, but it needs `check-projects.js` to stop
requiring topics on a subject the tree does not cover — a rule change wider than this.

### The stages fit on the page because they are short, and it took two goes

**The first draft's eight ran past the foot of the screen at 390×844.** Cut once, they fit there —
but only because the card was drawn at 86.5%, and at **320×568 they did not fit at all**: the card
shrank to the 70% floor, still scrolled 141px inside itself, stage 8 was cut mid-sentence and the
knife-safety paragraph sat wholly below the edge, reachable by one drag that the next drag turned
into a page turn. 1,617 characters of stages and safety, where the other projects carry 883 to
1,253 (PJ-02's 1,253 also scrolls at 320, by 29px, and did before this).

Cut again to **1,048**, the safety line down to the knife alone (it named a glue gun the materials
never listed, and a window for glue that a glue stick and PVA do not need). Measured: zoom 0.769 at
320 with the whole page drawn and the safety paragraph 23px above the foot; zoom 1 at 390.
`check/ui.js` skips a pane that scrolls, so it could not have caught this; `check-projects.js` now
prints a note for any row whose stages and safety pass 1,200 characters — a proxy, so a note and not
a failure, and a screenshot is still the last word.

### A real coursework is the pupil's own work — the share page says so

The share page sends work to a tutor, and the first stage told a pupil to start their **real**
coursework from the board's context — so the row read as an offer to go over work that will be
handed in. JCQ's instructions for conducting non-exam assessment, which every board follows, say
the work submitted must be the candidate's own and that the school must be able to confirm it;
nothing found there names private tutors, so the page says the cautious thing. **In code, under the
tile row, on every coursework's share page**: this brief is practice; the one you hand in starts from
the context your exam board sets, and must be your own work; a tutor can teach the stages on this
brief but must not comment on, correct or improve work that will be handed in; tell your teacher
about any help you have outside school. In code rather than in the row so that the next coursework
cannot be written without it; the sentence about the board's context moved there from stage 1.

### Found by the words the owner used

**`dt` gave 43 results without the coursework; `d&t`, `D&T` and `cutout` gave none; `graphics` and
`movie` missed it.** The owner's sentence was all of those. Now: `PROJ_SUBJECT_SAID` puts `DT D&T` in
any Design and Technology project's haystack (one entry; the D&T textbook is still not found by
`d&t`, which is the textbooks' search to change); every hyphenated word is appended without its
hyphen, so `cutout` finds `cut-out` and `stopmotion` finds `stop-motion`; and the row's summary says
`movie` and `graphics` in its own words. Measured: `d&t`, `graphics`, `movie`, `cutout`,
`coursework` and `nea coursework` put it first; `dt` finds it among 44.

**`nea` alone still finds it, but 82nd of 335** (`near`, `nearest`, `linear`), because the search is a
substring test shared by every kind; ranking whole words above parts of words would change every
kind's search and is not done here. `non-exam` finds it among 6, and `nea coursework` first.

### One fact, one spelling — `exam_board` and `spec_ref`

The first cut wrote `exam_board` (the practicals' board) beside `spec` (the textbooks' spec), in the
column's first row. One fact under two spellings is the `needs_print` / `print_required` fault.
The practical is the project's sibling, so its spelling won, for the columns and for the mapped
fields (`board`, `specRef`). `check-projects.js` fails a project row that carries `board` or `spec`,
which the mapper would never read.

### Bare bones, and what is deliberately not here

Not built, and the obvious next things: marking against a board's criteria, a deadline per stage, a
record of which stage a pupil has reached, a screen of its own. **Uploading a pupil's work is not
built on purpose**, not merely not yet — note 253's reason: storing children's work is consent and
moderation. The share page sends them to Messages and to the next session, and
`check-projects.js` still fails any stage or share note that says upload or publish.

### Checks, and what each was proved against

- `js/check-projects.js` — `project_type` is blank, `project` or `coursework`; `exam_board` and
  `spec_ref` are text and only on a coursework, and a live coursework must name a board from
  `BOARDS` (`AQA`, `Edexcel`, `OCR`, `WJEC`, `Eduqas`, `CCEA` — the spellings the papers and
  textbooks already use); `board` and `spec` columns are refused; at least one live project and one
  live coursework, or the question has one answer; the wiring read out of the source — library.js
  maps the column, the item carries the field, `TAG_OF` colours it (read inside the `TAG_OF` block
  only, as `check-bible.js` does), the facets row is live, before Subject and at `min_coverage` 1,
  each cell read the way the phone reads it (a blank `sort_order` is 1000, `"FALSE"` is off).
- `js/check-flow.js` — *Coursework is a type of project*: the real facets file served, the real
  rows through the real mapper, then pressed on the real answer buttons — Learning → Projects asks
  only *Project or coursework*, in the type colour; Coursework leaves the coursework alone; a list
  of every project plus a practical is NOT asked it; its card's strip carries the board and spec the
  **file row** names, as one pair, and the item answers Exam board with it (the first version
  compared the strip with the mapper's own output, so dropping the board from the mapper skipped the
  test); Stages, and a project's still Steps; the own-work note on a coursework's share page and not
  a project's; and the searches — `non-exam`, `dt`, `d&t` and `cutout` first shown to be absent from
  the row's own cells (the first version searched `nea`, which the row's "nearby" already held, so it
  passed with every name removed), then each found.
- **Mutations, each run on a copy and each failing:** `min_coverage` blank; the NEA names out of
  `projectText_`; `PROJ_SUBJECT_SAID` emptied; the hyphen-free copies out; the board out of the
  library.js mapper; `examBoard` out of the item; PJ-09's `exam_board` deleted, and set to `AQQ`;
  `sort_order` blank; `active` `"FALSE"`; the `TAG_OF` entry deleted with its words left in a
  comment; `spec_ref` written `spec`; the own-work note out; board and spec joined by ` · `. Then the
  real files green again.
- `check/states.js` — `a coursework`, beside `a project`, on its Stages page, so `check/ui.js` and
  `check/press.js` measure the longest strip a project card carries.
