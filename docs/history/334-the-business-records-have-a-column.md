## The business records have a column of their own, the last one — and the first column that is not everybody's

**The owner, 10 Oct:** *"the business checklist stuff should go in their own column at the end."*

### What moved, and what did not

**THE SAME FIVE CARDS, ON A NEW COLUMN.** Insurance, Tax, Legal and data, Safeguarding, Money and company
— `bizPages_` in js/records.js, unchanged: the same captions, the same boxes beside each other, the same
one Save per card through `send_`, the same refusal to save before `listRecords` has answered, and the
same one loader over the boxes while it is out (notes 306 and 310). What changed is who draws them:
`screen('biz', () => pages('biz', bizPages_()))` in records.js, where it was five lines appended to
`settingsPages_` (note 207). `bizStart_` fires on arriving at `biz` in `startScreen_`, where it fired on
arriving at `settings`.

**SETTINGS IS ABOUT YOU AGAIN.** Your details, your PIN, your roles, the weekly parent email card, which
emails you want — and no longer five cards of the business's insurance and tax at the foot of an
admin's copy. The weekly email card stays where it was. Taking five pages out moves the two behind them
for an admin, which is the thing the wardrobe's note in `settingsPages_` warns of; `paintPager` clamps
`PAGE.settings` to the pages there are, so an admin who had been on one of the five comes back to the
last real page and not to nothing — a journey asks it with `PAGE.settings` at 999.

**ONE THING DID HAVE TO FOLLOW THEM, AND NOTHING WOULD HAVE SAID SO.** A card is marked `data-dirty` from
its first keystroke (me.js), and two things read the mark: `bizFillAll_` leaves a typed-in card alone
when the records land, and `settingsKeep_` stops `paint` redrawing the column under the typing. Both
listeners were scoped to `#s-settings .me-form`. Moved as they were, a provider typed before the records
arrived would have been written over by them, and a payload landing would have redrawn the column under
the person typing — with every card still drawing perfectly. `KEEP_FORMS_` names both columns now and
`settingsKeep_` answers for `biz` as well; the first journey below asks both, and two mutations prove it.

### How a column is left out for everybody but an admin

**THE APP HAD NO WAY TO DO IT.** Every column was everybody's: `TABS` was one list doing two jobs, what
the build has and what is in front of this person, and `applyColumns_` (the sheet's row) rebuilt it from
itself. So the rule is new, and it is the smallest that does the job:

- **`admin: true` on the `TABS` entry.** `biz` is the only one.
- **`TABS_BUILT`** — every column the build has, fixed after the sort. **`COLUMNS`** — the row the sheet
  asks for (`applyColumns_` writes it now), or `TAB_ORDER`'s until the sheet is read. **`TABS`** —
  `COLUMNS` less a column this viewer is not given. Everything else still reads `TABS`, the same array,
  so the axis, `go`, the neighbours and the pager learned nothing.
- **`columnsFor_()`** writes `TABS` from `COLUMNS` and `isAdmin()`. It runs at boot before the remembered
  column is read (so an admin reloading on Business is put back on it, and a child's phone that
  remembers an admin's `biz` is not), when the sheet's row lands, and at the head of every `repaint` —
  which is where signing in, signing out, a session the server ended and a role changed in the sheet
  all end. So the column comes and goes **without a reload**.
- **The section is made by `columnsFor_`, not written in index.html.** index.html is every visitor's
  document: a section written there would be parsed into a child's page before any code could take it
  away. For an admin it is made empty and `paintNeighbours` draws it the way it draws any empty column;
  when the admin goes it is removed whole. For anybody else there is nothing in the page that names the
  column — no section, no card, no attribute — and a journey reads the whole serialised document for it.

**NOBODY IS MOVED BY IT.** Where you are is remembered by id (`AT`), not by index, and `repaint` places
the row again afterwards, so a column appearing or going leaves you on the column you were on. The one
person it moves is the one standing ON it when it goes — an admin whose session the server ended while
they were on the records (a Save answered `why: 'signed-out'`). They go to the column on its left,
Progress, where a swipe back would have taken them, rather than to the front door: they are still
holding the phone, and the toast tells them to sign in again.

**THE ROW IN columns.json DOES NOT DECIDE WHO.** `biz` has a row (`sort_order` 15, after Progress at 14),
because a column with no row is on no phone (note 320). The row decides where it sits and whether an
admin has it; it can never give it to anybody else.

**AND ONE FAULT THE SPLIT CAUGHT BEFORE IT SHIPPED.** `applyColumns_` built its table of known columns
from `TABS`. For a visitor `TABS` has no `biz` — so the first payload a visitor's phone applied would
have dropped the column from the row for good, and an admin signing in on that phone afterwards would
have had nothing to swipe to until a reload. It reads `TABS_BUILT` now; mutation 9 below is that line.

### Where it is named

| place | what |
|---|---|
| `TABS` (js/shell.js) | appended, `admin: true`, with its ASKED FOR AS note. 📋 a clipboard, which is a checklist; nothing draws it |
| `TAB_ORDER` | last, after `progress`. A branch adding `res` after `stuff` touches the other end of this list |
| `PAGER` | `biz: () => bizPages_().length` — five for an admin, nought for anybody else, who has no column to ask |
| `PAGE` | `biz: 0` |
| `screen('biz', …)` | js/records.js |
| `startScreen_` | `bizStart_` on `biz` |
| `<section id="s-biz">` | **not in index.html** — made by `columnsFor_` for an admin. index.html says so without naming it |
| `data/settings/columns.json` | `sort_order` 15, `active` TRUE |

### Checked

- **`check-doors.js`** asks the other way round for a column marked `admin`: it must have **no** section
  in index.html, and something must make one (`columnsFor_` with its `createElement('section')`). Red on
  the section written into index.html; red with the section made as a `div`; red with `admin: true`
  taken off the entry (the ordinary "a tab with no section" fault).
- **`check-flow.js`, three journeys, `business:`** — each serves the real columns.json and refuses to
  pass if it was not applied:
  1. *An admin has a Business column last, straight after Progress, holding the five records cards, and
     Save posts the card.* The swipe off Progress lands on it and one more stays; arriving asks
     `listRecords` once; the five cards in order and the pager agreeing; typing marks the card and
     `settingsKeep_` holds the column; Save posts that card's three items, filed under Insurance, with
     what was typed and what the records brought, and says Saved; Settings holds no records card,
     `settingsPages_` builds none, the weekly email card is still there, and `PAGE.settings` at 999
     opens on the last real page.
  2. *A student, a parent, a tutor and a visitor have no Business column* — not in the row, Progress
     last, a remembered `biz` not honoured, every column arrived at and a swipe past Progress staying
     put, `go('biz')` reaching nothing, no `#s-biz`, nothing in the serialised page naming it, and no
     `listRecords` asked.
  3. *Signing in as an admin adds the column and signing out takes it away, without a reload and without
     moving anybody* — signed in through the sign-in card with the payload that sign-in asks for HELD,
     so the column has to come from signing in and not from the payload fifteen seconds later; back on
     Progress, Business beside it, a swipe reaching its five cards; signed out from Spotlight, the column
     and its section gone and the person still on Spotlight; and an admin on Business whose Save is
     answered `why: 'signed-out'` put on Progress, the column gone.
  **Ten mutations, each red, each restored**: every viewer given the column (2 journeys red); `repaint`
  not asking (3); the typed-card mark scoped to Settings again (1); `settingsKeep_` for Settings only (1);
  the records left in `settingsPages_` (1); the column's last person sent to the front door (3);
  `bizStart_` on Settings again (1 and 3); the row's `sort_order` before Progress (1); `applyColumns_`'s
  known columns from `TABS` (3); `paintPager`'s clamp taken off (1). The section written into index.html
  leaves the journeys green — `columnsFor_` removes it at boot — and is `check-doors.js`'s to catch,
  which it does.
- **The records loader journey** (*a widget waiting on its fetch shows the one loader*) goes to `biz`
  and refuses to pass if it did not get there.
- **`check/states.js`** — the two records states moved from `settings` to a `biz` entry with `#s-biz`,
  and the unnamed state asks for the five cards, each with its Save, and no loader left on them. Every
  `biz` state is `only:` an admin. The first run measured 390 with the dots still over the boxes — the
  fixture answered `listRecords` late on a loaded machine — which is the held state's picture, not this
  one's, so the unnamed state now waits for the answer.
- **`check/ui.js` and `check/press.js`** skip a column the visitor is not given and say so: without it
  `--screen=biz` for the signed-out visitor measured and pressed the FEED under Business's name,
  because `go('biz')` lands on the front door for them. They ask `columnsFor_` first, so the row is the
  visitor's own at that moment: the Settings states play a parent or a tutor on the admin's phone, and a
  press that repaints inside one would otherwise leave a row without Business for the admin's turn.
- `check/ui.js --screen=biz --shots`: 15 combinations, nothing to report, five loaders held and let go.
  Looked at 320 and 390: the Insurance card centred with Progress's edge to its left and Tax below; the
  records seeded with *Due soon* in gold; the dots over the card while held. `--screen=settings`: 160
  combinations, nothing new.
- `check/press.js --screen=biz`: the one action (`biz-save`) pressed, alive; the signed-out pass says the
  column is not theirs. Its swipe pass now includes Business at the end of the row. One swipe red on all
  three runs — *chain from games p1 flick up landed on page 2, wanted page 3* — the Games flick chain
  note 320 already records as red on the base commit under load. The base commit, exported and run
  beside it at a load average of twenty to thirty, was red on the same chain once (*flick down landed
  on page 2, wanted page 1*) and on two other swipes (the reel's Sound, the whiteboard's padlock) once.
- `check/swipe.js`: 112 gestures, OK. `check/cascade.js`: 180 states, the Business column's three among
  them, nothing decided by file order alone (its first run here died with *Target crashed* — the
  kernel's OOM killer took the tab, 111 Chromiums on the machine — and the second ran clean).
  `check/deploy.js`: OK. `check.js`, `check-const.js`, `check-css.js`, `check-loading.js`,
  `check-settings.js`, `check-payload.js`, `check-drafts.js`: green.
- `check-flow.js` whole: 274 of 275. The red one — *taboo shows a word … a repaint stopped or replaced
  the round* — passes alone twice: load.

No stylesheet change (`.biz-*` was never scoped to Settings), so `--css-version` stands. No backend
change: `listRecords` and `saveRecordsPage` are as they were.

### Not done, and worth knowing

- **While the payload is still coming, the row is `TAB_ORDER`'s** (note 320's last point), and Business
  is last in that order too, so it does not move when columns.json lands.
- **A state that plays another role on an admin's phone** (the notification states in check/states.js
  do) changes `USER.role` without a repaint, so the row keeps Business for the length of the state.
  `bizPages_` still asks `isAdmin()` and draws nothing for a parent, so nothing of an admin's is shown;
  the column is simply there and empty until the next repaint.
