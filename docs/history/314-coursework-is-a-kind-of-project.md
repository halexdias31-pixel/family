## Coursework is a type of project: one column, one question, and the stages of a design-and-make

**The owner, 9 Oct**: *"i would like to add course works. make it bare bones. its within projects in
finder. like i remember i did dt graphics coursewoork in gcse which was to make products for a movie
coming out. liek carboard cutout and stuff and poster ect. make it bare bones for now, i am just
trying to set up infrastructure."*

### What was built

- **`data/projects.json`** — one new column, `project_type`: `project` or `coursework`, and **blank
  reads as `project`**, so the eight rows from note 253 are untouched. A coursework row may also name
  `exam_board` and `spec`. One seed row, `PJ-09`, *Products for a film launch*: a studio is about to
  release a film; design and make a free-standing cardboard cut-out, a poster and one more piece (a
  ticket or a popcorn box), for GCSE Design and Technology, ages 14–16, ten sessions. Its `steps` are
  the eight **stages** of a design-and-make coursework — the brief and the client, research, a
  specification, initial ideas, development, model and test, making, evaluation.
- **`js/library.js`** — `projectType` (lower-cased, blank → `project`), `board`, `spec`. The
  textbook's names for the last two, because they are the same two facts.
- **`js/find.js`** — `PROJ_TYPE` and `projType_`, `PRAC_TYPE`'s arrangement: the file holds the word,
  the code holds the label, an unknown word is drawn raw. The card's flag says `Coursework`; its
  strip says `Design and Technology · GCSE · AQA · 8552`, as a textbook's cover does; the ordered
  page is titled **Stages** on a coursework and Steps on a project — one word chosen by the type,
  not a second page. The item carries `projectType` (the label) and `examBoard`. `projectText_`
  adds `coursework NEA non-exam assessment`, the board and the spec to a coursework's haystack.
  `TAG_OF.projectType` is `type`, the colour Experiment or build wears.
- **`data/settings/facets.json`** — one row: `projectType`, *Project or coursework*, sort order 28.

### A type, not a kind — the opposite answer to note 253, for the same reason

Note 253 made projects a kind of their own because a how-to video has none of a practical's
questions — no variable, no board, no lab. A coursework has every one of a project's: sessions,
materials, an ordered list, something made at the end, a share page. The one thing it has that a
project does not is a board. So it is a word in a column, exactly as `practical_type` is, and
everything a project already does it does too.

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
The coverage rule keeps it silent everywhere else: on any list where projects are under half, it is
not asked. `check-projects.js` fails a `sort_order` that is not before Subject's.

### The seed row is our own brief, not a board's

No exam board's NEA context, brief or assessment wording is copied. The brief is the owner's memory
in our words, and the stages are the general shape every design-and-make coursework takes. The
first stage says so to the pupil: *for your real coursework, start from the context your exam board
sets for the year.* The board and spec, `AQA` / `8552`, are the ones the @family. GCSE Design and
Technology textbook already names; `Design and Technology` and `GCSE` are spellings `SUBJECT_BUCKET`
(Technology) and `LEVEL_BUCKET` already place.

**Topics are three existing branches of `data/topics.json`** — `3-D Shapes` (its alias is `nets`),
`Scale Drawings & Maps`, `Enlargements` — because a popcorn-box net and a cut-out scaled up from a
drawing are exactly those, and `check-projects.js` refuses an empty `topics`. The tree has no Design
and Technology branch, and none was invented: the D&T textbook's own chapters carry no topics either.

**The stages are a sentence or two each, and a screenshot is why.** The first draft's eight ran
past the foot of the screen at 390×844, the safety paragraph going under the edge mid-sentence; the
same eight stages in fewer words fit on the page whole.

### Bare bones, and what is deliberately not here

Not built, and the obvious next things: marking against a board's criteria, a deadline per stage, a
record of which stage a pupil has reached, a screen of its own. **Uploading a pupil's work is not
built on purpose**, not merely not yet — note 253's reason: storing children's work is consent and
moderation. The share page sends them to Messages and to the next session, and
`check-projects.js` still fails any stage or share note that says upload or publish.

### Checks

- `js/check-projects.js` — `project_type` is blank, `project` or `coursework`; `exam_board` and
  `spec` are text and only on a coursework; at least one live project and one live coursework, or the
  question has one answer; the wiring read out of the source — library.js maps the column, the item carries
  the field, `TAG_OF` colours it, the facets file names it, active, before Subject. Each rule was
  broken on purpose and failed, then the real files were green again.
- `js/check-flow.js` — *Coursework is a type of project*: the real facets file served, the real
  rows through the real mapper, then pressed on the real answer buttons — Learning → Projects asks
  only *Project or coursework*, `Project` and `Coursework`, in the type colour; Coursework leaves the
  coursework alone; its card says Coursework, AQA and 8552; its ordered page is Stages and a
  project's is still Steps; typing `coursework` or `nea` finds it.
- `check/states.js` — `a coursework`, beside `a project`, on its Stages page, so `check/ui.js` and
  `check/press.js` measure the longest strip a project card carries.
