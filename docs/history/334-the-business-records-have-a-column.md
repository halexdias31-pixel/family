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
- **`check-flow.js`, four journeys, `business:`** — each serves the real columns.json and refuses to
  pass if it was not applied:
  1. *An admin has a Business column last, straight after Progress, holding the five records cards, and
     Save posts the card.* The swipe off Progress lands on it and one more stays; arriving asks
     `listRecords` once; the five cards in order and the pager agreeing; typing marks the card and
     `settingsKeep_` holds the column; Save posts that card's three items, filed under Insurance, with
     what was typed and what the records brought, and says Saved; Settings holds no records card,
     `settingsPages_` builds none, the weekly email card is still there, and `PAGE.settings` at 999
     opens on the last real page.
  2. *A student, a parent, a tutor and a visitor have no Business column* — not in the row, Progress
     last, a remembered `biz` opening them on `TAB_HOME` (the Feed, where a visitor with nothing
     remembered opens — see the review below), every column arrived at and a swipe past Progress
     staying put, `go('biz')` reaching nothing, no `#s-biz`, nothing in the serialised page naming it,
     and no `listRecords` asked.
  3. *Signing in as an admin adds the column and signing out takes it away, without a reload and without
     moving anybody* — signed in through the sign-in card with the payload that sign-in asks for HELD,
     so the column has to come from signing in and not from the payload fifteen seconds later; back on
     Progress, Business beside it, a swipe reaching its five cards; signed out from Spotlight, the column
     and its section gone and the person still on Spotlight; and an admin on Business whose Save is
     answered `why: 'signed-out'` put on Progress, the column gone.
  4. *An admin reloading on Business is put back on it* — `familyTab=biz` seeded with the admin, and the
     boot opens on Business with its section in `#screen`, a page in front, the five cards drawn and
     `listRecords` asked. Added after review (below).
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

### Review: "not Business" is two answers, and the journey could only hear one

**THE FINDING.** Delete the boot's `try { columnsFor_(); } catch (e) {}` from shell.js — the line over
the `familyTab` read whose comment says *anybody else's remembered `biz` … is let go* — and all three
`business:` journeys stayed green. What it broke was real: `TABS` still held `biz` when the remembered
id was read, so a student's phone that had an admin's `familyTab=biz` in storage honoured it, and the
next `columnsFor_` (the payload landing, the first repaint) took the column away and moved them one to
the left. Every non-admin with that in storage opened on **Progress** instead of the Feed. Reproduced
in jsdom and in Chromium at 390x844, signed out and as a student: `AT` was `progress` on the mutant and
`feed` on the real files.

**WHY NOTHING SAW IT.** The visitor journey asked `t.AT() !== 'biz'`. Both outcomes satisfy that — the
front door, and the column left of Business reached by being moved off it — so the line could not
tell the comment's promise from its failure. A check that names the one thing that
must not happen passes on every other wrong thing.

**FIXED IN THE CHECK, BECAUSE THE APP WAS RIGHT.** The boot line was already there and already did the
job; nothing proved it. The hook in check-flow.js hands over `TAB_HOME` (a `const`, so a getter, for
`AT`'s reason), and the visitor journey now asks that each of the four opens on `TAB_HOME` — where a
visitor with nothing remembered opens — and says *moved left off a column they should never have been
put on* when it is Progress. If `TAB_HOME` were ever Progress itself the two answers would be the same
column again, so that case says NOT checked rather than passing.

**AND THE ADMIN HALF HAD NO JOURNEY AT ALL.** *An admin reloading on Business is put back on it* —
`familyTab=biz` seeded with the admin, the boot opening on Business, its section in `#screen`, a page
in front, the five cards drawn and `listRecords` asked. Only the reviewer's Chromium driver had ever
stood on that path. It is also the visitor journey's control: a harness that never read `familyTab`
would open everybody on the Feed, and the visitor line would read OK for the wrong reason.

**Mutations, each red, the real files green after:**
- the boot's `columnsFor_()` deleted — the visitor journey red for all four (*opened them on progress,
  wanted feed … moved left off a column they should never have been put on*); the other three green.
- the remembered read refusing an admin column (`TABS.some(t => t.id === was && !t.admin)`) — the new
  admin journey red (*opened on feed — the remembered column an admin IS given was let go*); the other
  three green.

**Checks after the fix**, at a load average of 13 to 23 on four cores: `check.js`, `check-const.js`,
`check-css.js`, `check-doors.js`, `check-loading.js` green. `check-flow.js` whole: 274 of 276, all four
`business:` journeys ok. The two red: *just a minute keeps its round through a repaint* passes alone
twice — load. *A retry that succeeds does not rebuild the box somebody is typing in* failed alone too, so
it was traced. The journey waits a fixed 300ms after `go('tools')` and `goPage`, then types into the
notepad. Under load the Tools widget queue (`toolsStart_` → `widgetsWake_` → `initPad`) reaches the
notepad after the typing and writes its stored `""` back. A setter on the box caught the stack, the
write 31ms after the typing. It is red on the base commit as well (1 of 8 runs alone, against 4 of 11
here, and the Business change touches no widget path). That is load against a fixed wait, and it is
left for whoever next touches that journey: it should wait for `woken_()` before it types.
`ui.js --screen=biz --shots`: 15 combinations, nothing to report, five loaders held and let go. Looked
at 320 and 390: the same Insurance card, the seeded *Due soon* in gold, the dots while held.
`--screen=settings`: 160 combinations, nothing new. `press.js --screen=biz`: one action pressed, 101
swipes, 14 dropdown touches, all well. `swipe.js` 112 gestures OK, `cascade.js` 180 states with nothing
decided by file order alone, `deploy.js` OK.

### Not done, and worth knowing

- **While the payload is still coming, the row is `TAB_ORDER`'s** (note 320's last point), and Business
  is last in that order too, so it does not move when columns.json lands.
- **A state that plays another role on an admin's phone** (the notification states in check/states.js
  do) changes `USER.role` without a repaint, so the row keeps Business for the length of the state.
  `bizPages_` still asks `isAdmin()` and draws nothing for a parent, so nothing of an admin's is shown;
  the column is simply there and empty until the next repaint.

**Changed by [341](341-what-a-flick-can-reach-is-drawn-before-it-gets-there.md)** — the admin's column is built like any other by the builder, which reads `TABS` again on every slice: drawn in the quiet when it appears, never asked about once it has gone.
