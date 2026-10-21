## 392 — the columns are grouped by purpose (2026-10-21)

**Asked for as** "rearrange the columns to be a more intuitive layout". The row had grown by appending
each new column where it was asked for (Shop right of Booking, 251; Settings right of You; Spotlight
after Saved; Progress "at the end for now", 320; Find 2 right of Find, 329; Business last, 334), so it
read `feed booking shop reel dm stuff res account settings tools games saved spotlight progress biz` —
paying between the posts and the reels, You in the middle of the learning columns.

**The order decided**, left to right, in groups:

| Group | Columns |
|---|---|
| social | Feed, Spotlight, Reels, DMs |
| learning | Find, Find 2, Saved, Progress, Tools |
| business | Book, Shop |
| play | Games |
| you | You, Settings, Business (an admin's) |

Kept: Feed is still where the app opens (`TAB_HOME = 'feed'`, by name, not by position); Find 2 is
still immediately right of Find; Shop still right of Book; Settings still right of You; Business still
last and still an admin's alone.

**Where the order lives — two places, which now say the same thing.**
- `data/settings/columns.json`, served with the payload and applied by `applyColumns_` (shell.js): the
  order a phone ends up with. Rows reordered and `sort_order` renumbered 2..16.
- `TAB_ORDER` in `js/shell.js`: the order until that file lands, and whenever it is not read. **Before
  392 the two differed** — `TAB_ORDER` had Settings after Spotlight, the file had it after You — so the
  row rearranged itself a moment after the boot. They are the same list now, and `check-doors.js` has a
  new rule, *TAB_ORDER AND data/settings/columns.json PUT THE COLUMNS IN DIFFERENT ORDERS*, which fails
  the build if they part (mutation: Shop and Book swapped in `TAB_ORDER` → red, both rows printed).
  The Find 2 journey in check-flow also compares the row with and without the file.

`TABS` itself is untouched: it is append-only because `AT` is remembered by id and the axis clamps by
index; the display order is applied by sorting.

**Checks that encoded the old positions, rewritten to the new ones rather than loosened.**
- *glass widgets* (331): the column beside Tools is Book now (Shop two away), and the starred-widget journey stands on Progress, between Saved and Tools, and follows whichever copy the app runs.
- *builder order*: Shop in front with Games beside it, in place of Tools with Games beside it.
- `check/swipe.js` "sideways then up": from Games to You (Book, right of Tools, is one page, so "one page down" had nowhere to land).
- *progress*: was "the last column, straight after Spotlight, and a swipe past it stays put". Now the
  whole signed-out row must equal the decided order (`ORDER_392_` in check-flow, Business left out), a
  swipe off Saved lands on Progress and one off Progress lands on Tools.
- *business*: an admin's whole row must equal `ORDER_392_` (Business last, straight after Settings); a
  visitor's last column is Settings and a swipe past it stays put; signing in from Settings by way of You
  returns to Settings with Business beside it; a session ended on Business lands on Settings.
- `bizApplied_` ("was columns.json applied?") used to answer by the order (Settings straight after You
  was the file's and not the code's). With the two orders equal that tells nothing, so it asks
  `DATA.columns` instead.

Docs: CLAUDE.md's screen line, `docs/map-detail.md`, `data/settings/README.md` (the `sort_order` row
names `TAB_ORDER`), the column notes in `columns.json`, and the TABS headlines in shell.js that named
old positions.

**Run.** `node js/check.js`, `node js/check-all.js --fast` (58), the four `FLOW_PART=k/4` parts of
check-flow and `check/swipe.js` green apart from one finding that is red on c535669 too: *REACH wide 768
keyboard — the corner holds nothing* (not this change). `check/ui.js` per screen (feed, spotlight, progress, booking, settings): nothing new; the whole run outlasts 20 minutes here.
