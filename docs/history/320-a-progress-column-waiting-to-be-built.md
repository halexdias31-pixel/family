## A Progress column at the end of the row, waiting to be built — and the sixth place a column is named

**The owner, 9 Oct:** *"i want to add a new column for students to track their progress and everythinh.
you can leave it at the end of the columns for now. just leave a place holder for now."*

### What it is

**A COLUMN, BECAUSE IT IS A PLACE.** `TABS` in shell.js judges every column by one test: a question is
answered, a place is somewhere you go. Nobody narrows "how am I doing" down by answering the funnel's
questions — it is the same page whatever they were looking for, and a child opens the app to look at it
with no errand at all. So it is the thirteenth column, and not a kind in `data/settings/kinds.json`.

**ONE CARD, AND IT SAYS SO.** `progressCards_` in js/arcade.js returns `drill`'s markup and nothing more:
a heading, one line — *"Coming soon: everything you have done in one place — the questions you have
answered, what you got right, and what to work on next."* — and *"Not built yet."* No tile, no `data-do`,
no bar at nought per cent. js/map.js wrote the rule down over `drill`, and `contest` and `legotrade`
follow it: **a placeholder that looks finished is worse than an empty one**, because somebody taps the
thing that looks like a control and the app reads as broken rather than as unbuilt.

**THE SAME CARD FOR EVERYBODY** — signed out, a student, a parent, a tutor, an admin. Who sees whose
progress (a student their own, a parent their children's, a tutor their students', an admin anybody's)
is the first decision of building it, and deciding it now would be deciding it for a card with nothing
on it to show.

**WHAT IT WILL DRAW FROM**, written in the code because it is the first thing whoever builds it needs:
what the app already keeps about each person's work. Every answer — typed, picked, drawn or ringed — is
on the person's account (the `answers` tab, note 296; `js/answers.js` is the phone's half), and the
`submissions` log being added on another branch records each one checked and how it was marked. "What
you got right" and "what to work on next" are questions about those rows, not a new tab.

### Where it is named

| place | what |
|---|---|
| `TABS` (js/shell.js) | **appended**, with its ASKED FOR AS note. Append-only: `AT` is remembered by id and the X axis clamps by index |
| `TAB_ORDER` | last, after `settings` — the code's own order, which is the order until the settings files land and whenever they do not |
| `PAGER` | `progress: () => progressCards_().length` — counted from the list the screen draws, the rule every entry there states |
| `PAGE` | `progress: 0` |
| `screen('progress', …)` | js/arcade.js, beside Saved and Spotlight. It starts and stops nothing: nothing on it runs |
| `<section id="s-progress">` | index.html |
| `data/settings/columns.json` | `sort_order` 14, after Spotlight at 13, `active` TRUE |

**LAST IN BOTH ORDERS.** On a phone the order is columns.json's — Settings sits right of You at 9 — so
Progress follows Spotlight. In the code's fallback order Settings is last but one and Progress follows
it. **Moving it is one row of columns.json, with no deploy.**

**THE ICON IS 📈, AND NOTHING DRAWS IT.** The row of icons is two kinds: emoji (🏠 📅 🛒 🔎 👤 🧰 🎮) and
plain shapes that already mean the thing (★ kept, ✦ featured, ⚙ settings, ✉ a letter). No plain shape
means a chart, and the near ones are taken in this app — ↗ was a post's share mark, ▲ is the
calculator's up key — so it is the emoji half: 📈 is Unicode 6.0, in Apple's emoji font since iOS 5, and
a line going up reads at any size. **But there is no tab bar.** `<nav id="tabs">` went from index.html
long ago (its note is still there), so no icon in `TABS` is drawn anywhere; it is carried for
`applyColumns_` and whatever names a column next. The screenshot of "the tab bar showing it" could not
be taken for that reason; the 1920×1080 shot shows the row's end instead — Saved, Spotlight, Progress,
and nothing to its right.

### What adding it found: columns.json is the list, not only its order

**`applyColumns_` REBUILDS `TABS` FROM THE FILE'S ROWS**, so a column with no row is drawn on no phone.
`check-doors.js` compared five places — `TABS`, `TAB_ORDER`, `PAGER`, `screen()` and the `<section>` —
all of them in the code, and **passed with the row missing**: proved by removing it, HEAD's check-doors
green, the app booted with the real file and no Progress column on it. Nothing else could have seen it:
`check-flow`'s stub had never served the file (it answers any GET it is not told about with the
payload, which has no `length`, so `settingsInto_` skipped it), so every journey ran on `TAB_ORDER`;
and `check/ui.js` measures the columns the app reports, so a missing column is a column it is never
asked about.

**SO `check-doors.js` READS THE FILE NOW**, and fails on a tab with no row, a row naming no tab, and a
file it cannot read — a check that cannot reach its subject is not a pass. A row switched off counts:
`active` FALSE is somebody's decision, and this asks only that there was one. The list of screens in
`data/settings/README.md` still named `make` and left out four columns; it is the current thirteen now,
with a sentence saying a screen with no row is on no phone.

### Checked

- **`check-doors.js`** — 13 screens, nothing to report. Six mutations, each red, then green on the real
  files: the `<section>` removed, the `PAGER` key renamed, the `TAB_ORDER` entry removed, the
  columns.json row renamed (both directions reported), the row removed, and the file unreadable.
- **`check-flow.js`**, one journey: *progress is the last column, one card that says it is not built yet
  with nothing to press, and a swipe off Spotlight lands on it.* It serves the real columns.json and
  refuses to pass if the file was not applied; asks that Progress is last and straight after Spotlight;
  swipes as a trackpad sends it (a sideways `wheel`, which `overworld.js` answers with the same
  `ax.go(ax.at() + 1)` a finger's release makes) and lands on Progress, and one more stays there; then
  for all five visitors, one page, the pager agreeing with it, headed Progress, "Not built yet.", and no
  control. **Four mutations**, each red: the row removed, `sort_order` 0, a control for an admin only,
  the words changed. The existing walks over `TABS` (every tab draws; every pager agrees with its
  screen) take the new column in by themselves.
- **`check/states.js`** — Progress has one state, and it asserts what it is looking at (the card, "Not
  built yet.", nothing pressable) rather than being left to the default, where "nothing to press" is the
  same silence whether the card drew or nothing did. **`check/ui.js --screen=progress`**: 10
  combinations, nothing to report; with the words changed, "that state was NOT measured" and exit 1.
  `check/ui.js` and `check/press.js` read their screens off `TABS`, so the column is in every full run.
- **`check/press.js` READ THE ROW MID-BOOT.** Its swipe pass waited a fixed 2.2 seconds and then took
  each column's neighbours from `TABS` — and on a machine running other checks (load average about
  fifty) the payload had not landed yet, so the neighbours came from `TAB_ORDER` and the swipes landed
  in columns.json's order. Six swipes "went somewhere else" with the app right every time (`left from
  account landed on settings, wanted tools`). Not this column's fault — the Settings pairs are as old
  as Settings' row — but this column was one of the pairs. It waits for `LOADED` now, which is set
  after `applyColumns_`, success or failure; the six are gone. What is left red is red on the base
  commit under the same load: Find's picture swipe and tap, and a Games flick chain.
- **`check/swipe.js`** names the one-page columns it asks the diagonal of (`saved`, `spotlight`,
  `booking`, `dm`) and needs one with a column after it. Progress is the last column, so it cannot be
  that column; the list is unchanged, and Spotlight now has a column after it in a phone's order. Its
  findings here were the base commit's (`wide 1280 mouse`) and frame counts that a load average of
  fifty cannot promise (`drag frames`: 1 and then 4 of the 6 a 400ms drag wants); none names a column.
- **`check-flow.js` whole**: 198 journeys, two red. The videos journey is red on the base commit too
  (*"the card never asked for data/videos.json"*); the booking-share one passes alone.
- `check.js`, `check-const.js`, `check-css.js`, `check-settings.js`, `check-spine.js`: green. No
  stylesheet change, so `--css-version` stands. No backend change.

### Not done, and worth knowing

- **Before the payload lands the columns are in `TAB_ORDER`**, and they reorder when the settings files
  are read (Settings moves from the end to right of You). Seen in screenshots taken 2.6 seconds into a
  boot. It was so before this, it is not changed here, and the screenshot script waits for
  `DATA.columns` for that reason.
- Who sees whose progress, and the page shape, are for when it is built.
