## Projects are a kind of their own in Find, beside the practicals

**Asked for as "the projects are like practicles, but not practicles. so should be a new tag in the
finder called projects."** The same owner's earlier notes: "projects for students and places for
them to save videos and stuff", "Add projects to accommodate for Yasir", "YouTube course, project",
"What other ways to teach Yasir, projects, car gallery".

### What was built

- **`data/projects.json`** — eight projects for ages 8 to 16, none of them a science practical: a
  how-to video, a car gallery with facts, a board game, a stop-motion LEGO film, a family recipe
  book, a hand-written website, a local history walk and a podcast episode. One object per line,
  the sheet's own column names: `project_id`, `name`, `summary`, `subject`, `level`, `age_min`,
  `age_max`, `sessions`, `makes`, `topics`, `materials`, `steps`, `safety`, `share`, `active`,
  `sort_order`. `materials` is `equipment` under a child's word and uses the same `Name × qty`
  format and `kitParse_`.
- **`js/library.js`** — `projects` is the seventh `LIB_EXTRA` file; `libraryExtras_` maps it.
  Ages and sessions through `libNum`, so a blank is "nobody has said" rather than nought.
- **`js/find.js`** — a `project` entry in `KINDS` (Learning, `Projects`), `Projects` in
  `KIND_BUCKET` under `Work through it` beside `Practicals`, the mapper in the item list,
  `projectText_` for search, `projectCard_`, `projectPart_` and `pageParts_`: card, Materials,
  Steps (with one "Before you start" safety paragraph), Share it. The share page carries the row's
  own note and one tile, `proj-share`, which goes to Messages.
- **`backend/doget.gs`** — `projects: []`, the line every phone-filled key has, so
  `check-payload.js` does not report it read-and-never-sent.

### Why a kind and not a third `practicalType`

A how-to video has no independent variable, no exam board, no lab and no required/extra flag, and
every one of those is something the practical card or worksheet asks. What a project shares with a
practical is how it is FOUND — topic, subject, level — and that is the half reused.

### Saving students' videos is NOT built

"places for them to save videos" would be file storage for children's films and voices, with the
consent and moderation that carries. Out of scope on purpose. The last page tells the student what
to send their tutor in Messages and to bring the thing itself to the next session, and
`check-projects.js` FAILS a step or share note that says upload, publish or post online.

### Checks

- `js/check-projects.js` (in `check-all.js`) — ids, topics against `data/topics.json`, the kit
  format, sessions and ages as numbers in 8–16, and three things a practical never had to ask:
  `subject` and `level` must be values `SUBJECT_BUCKET` / `LEVEL_BUCKET` place (one unplaced value
  stands the whole question down to the alphabet), `Projects` must be in `KIND_BUCKET`, and
  `LIB_EXTRA` must fetch the file. All three tables are read out of the source, not copied.
- `js/check-flow.js` journey — the real file through the real mapper; Find offers all eight, `What
  kind` places Projects with Practicals, four pages, and the share tile lands on `dm`.
- `check/states.js` — `a project`, on the share page, so `check/ui.js` and `check/press.js`
  measure all four pages.
