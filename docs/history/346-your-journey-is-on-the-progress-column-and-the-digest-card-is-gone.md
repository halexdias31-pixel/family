## Your journey is the Progress column's card, and the weekly parent email's card is gone — the Sunday email stays on the server, switched off

**The owner, 12 Oct**, with a phone screenshot of an admin's Settings column ending on two cards — "Your
journey" (Goals, Milestones, Worked through, "Coming soon") and under it "Weekly parent email: Off":
*"This should be moved to appropriate column. Also the other widget regarding seeing weekly kids work or
whatever sounds dumb delete that widget."*

### What moved: "Your journey" is Progress's card, for whom it was drawn

`journeyCard_` and `mayJourney_` left `settingsPages_` (js/me.js) for **js/arcade.js, beside
`progressCards_`**, the list `screen('progress')` draws, with their comment and a paragraph on why they
moved. The card was the one thing on Settings that is not a setting; tracking a student's progress is
what the Progress column was made for (note 320, 9 Oct). Two "coming soon" cards about one thing in one
column would say it twice, so:

| who | Progress shows |
|---|---|
| a student, an admin (so the owner can see it) — `mayJourney_` | **"Your journey"**, in place of the placeholder |
| signed out, a parent, a tutor | the placeholder, unchanged: "Progress … Coming soon … Not built yet." |

Still one card either way, so `PAGER.progress` (`progressCards_().length`) is still 1 and right. Nothing
on the journey card is pressable — it had no control on Settings and has none here (`check/press.js`).

**`mayJourney_` asks `hasRole` now**, not a raw `indexOf` on the role words: the role cell is matched
through `ROLE_ALIASES` everywhere else, so a learner whose cell says `pupil` or `kid` was a student to
every card but this one.

**THE COUNTDOWN WAS A DAY OUT ACROSS THE CLOCK CHANGE.** It took `Math.ceil` of the gap between two local
midnights in days, and across the last Sunday of October in London that gap is fourteen days and an
hour — fifteen. Measured with `TZ=Europe/London` on 12 Oct (the clocks go back on the 25th): a big exam
14 days out read "15 days to go", and 30 read 31. `Math.round` now; the gap is whole days give or take
the hour. On a machine running UTC the checks cannot see this; run `TZ=Europe/London FLOW_ONLY='your
journey:' node js/check-flow.js` to — that is the mutation below.

### The column now depends on who is signed in, and follows them

It did not before: one card for everybody. Now it is the one column whose card changes with the person
and is not the column they change it on, so the fault it can have is the last person's card — a parent
shown the child's journey on the family iPad, or a student signing in to the placeholder until a reload.

**It follows the path every column already follows**: `repaint` — which every sign-in (`signedIn_`),
sign-out (`signedOut_`) and saved role (`roles-save`) ends in — marks every column but the one in front
`STALE`, and `go` draws a stale column on the way in. Nothing new was needed for a change of person; the
new journey below proves it is so (mutation M4: `repaint` skipping Progress turns it red).

**The exam dates are the one fact on the card that changes without a change of person.** A Save on About
you calls `load()`, and the payload that lands repaints everything — but that is up to half a minute away,
and a student who saves the date and swipes to Progress would see the old count. So
**`progressRedraw_`** (arcade.js) redraws the column if it is drawn — `paint` and then `paintPager`,
`paintNeighbours`' pair — and is called from `meSave_`, your own card's `card-save`, and
`profileRefresh_` (which already did exactly this for Settings: "REDRAWN IF IT IS DRAWN"), through
`landRepaint_` there so a box being typed in is not rebuilt.

### What went: the "Weekly parent email" card, and everything on the phone that only served it

| gone | what it was |
|---|---|
| `js/digest.js` (the whole file — its header said so) | `digestCard_`, `digestPages_`, the `digest-preview` handler, `digestSheet_` (the preview sheet), `DIGEST`, `DIGEST_SAY`, `digestModeOf_` / `digestModeNow_` / `digestWord_` / `digestBody_` |
| `'digest'` in `window.FILES` (index.html) | its `<script>` line, in the one list the page loads by |
| the push in `settingsPages_` (me.js) | `if (typeof digestPages_ === 'function') pages.push(...digestPages_())` |
| check-flow's digest-card journey | the card's mode, the Preview post, the sheet's escaping and its old-backend sentences |
| check/states.js: two admin states | "the weekly parent email card" and "…, previewed" |

**No CSS went**, because there was none: the card was drawn with `.card`, `.tile-row`, `.faint` and
`.me-said`, which everything uses. `--css-version` is unchanged; style.css is not touched.
**backend/files.json** lists the Apps Script files only; js/digest.js was never in it.

### What stays on the server, and why

**The Sunday email itself**, switched off exactly as it was (notes 280, 295, 308, 309): backend/digest.gs,
its config rows (`weekly_digest` = `off`, `weekly_digest_hour`, `weekly_digest_reserve`), the `digest_log`
tab, `installWeeklyDigest` / `removeWeeklyDigest`, the Weekly progress email tick on the Notifications
card, and js/check-digest.js, which still fails if anything on either side books or runs it. The owner
asked for that infrastructure (*"make the infrastructure to set it up so that in the future we will
actually wire it up"*) and called only the widget dumb.

**`digestPreview` stays too, with no caller on the phone.** It is a read (an admin's, in
`ACTION_ACCESS`; writes, sends and books nothing), it is still listed in the payload's `features`, and
no check fails on an action the site never calls: `check-access` asks the other direction (the site
calling an action with no handler), and `check-dead` counts functions, and `digestPreviewOut_` is called
by `doPost`. An admin can still ask it — `api({ action: 'digestPreview' })` from the console of a signed-in
admin's page answers with this week's emails. And reading what a Sunday would send without sending it
never needed the card: `weekly_digest` = `preview` writes it to `digest_log` and emails nobody, which is
step 4 of the owner's steps in note 280.

**No backend file changed**, so the four version stamps stand. Backend comments still describe the card
as the caller, and they are all of them:

| file | where | what it still says |
|---|---|---|
| backend/digest.gs | over `digestScheduled_` | "How many are booked, for the admin's card" |
| backend/digest.gs | over `digestPreviewOut_` | "for the card on the Settings column (js/digest.js)" |
| backend/digest.gs | in `digestPreviewOut_`, over `warning` and over `words: true` | "the card says the reason", "the card says to make a new version (js/digest.js)" |
| backend/dopost.gs | over the `digestPreview` branch | "for the admin's card on the Settings column" |
| backend/doget.gs | `'digestPreview'` in the payload's `features` | "the card asks before it posts" — nothing on the phone reads that entry now |

They were left rather than bump all four stamps for a comment and have the You screen read "Not deployed"
until a sync; **whoever next changes backend/ should correct them** — point them here and say
`digestPreview` has no caller on the phone, and that `features` entry is weight a reader no longer wants.

**js/check-digest.js is not backend and was corrected here.** Its preview section asked for `words: true`
"because the card tells an older deployed version apart by it", and its failure said "the card would tell
this backend it lists names only". The assertion stays — it is the action's contract, whoever asks — and
its comment and message now say so without a card.

### Settings' page indexes

The two cards were not the last pages: **Notifications was appended behind them**. So taking them out
moves that one page's index — by two for an admin, by one for a student — and nothing in front of them.
That happens once, with the build, and a build arrives by a reload, which `PAGE` does not survive (only
the column is remembered, `familyTab`). Within a visit, whoever is on a page past the end of a column
that got shorter is clamped to its last page, Notifications, never to nothing — `paintPager`'s clamp,
which check-flow's business journey already asks with `PAGE.settings` at 999 and now asks of the shorter
column. Nothing else counts Settings pages by number: check/states.js finds every Settings state by what
is on its page, and check/ui.js and check/press.js read the pages off the column.

A parallel branch takes the admin's "Your cut of an extra child" card (`cutCard_`) off Settings too; this
one does not touch it.

### Checked

**check-flow**, a new journey — *"your journey: on Progress for a student and not on Settings, the
placeholder for a parent, drawn again by a sign-in, a sign-out, a role and a saved exam date without a
reload — and no weekly parent email card anywhere"*. It goes the way a phone goes, with every payload
after the first held so nothing is redrawn by a payload landing: signed out, the placeholder; a student
signs in through the sign-in card — their journey, counting 14 days to their big exam, and none on
Settings; they tick only Client on the roles card and Save — the placeholder; Sign out from Spotlight, a
parent signs in — the placeholder, and no journey anywhere in the page; the parent signs out on Progress,
the student signs in again — the journey, same document; the student moves the big exam to 30 days on
About you and presses Save — Progress, not in front, counts 30; an admin — the journey on Progress, not
on Settings, and, every column drawn, no `.card.digest`, no `digest-preview` tile or handler, nothing in
the page naming the card, and no `digestPreview` posted.

The Progress journey (note 320) asks each of its five visitors for their own card now: the placeholder,
whole, for signed out, a parent and a tutor; for a student and an admin one page headed Your journey, no
"Not built yet" beside it, and nothing on the column to press. The business journey's "the weekly parent
email card … was to stay" is now the opposite: no journey card and no digest card on an admin's Settings.

**Mutations, each red and then green on the real files:**

| | mutation | red in |
|---|---|---|
| M1 | the journey card pushed back onto `settingsPages_` | the new journey (three lines: a student's Settings, `settingsPages_`, an admin's Settings) |
| M2 | `progressCards_` gives everybody the journey | both journeys (signed out, the client, the parent, the tutor) |
| M3 | `progressCards_` gives nobody the journey | both journeys (the student, twice, the saved date, the admin) |
| M4 | `repaint` does not mark Progress stale | the new journey: the student's sign-in, the second sign-in, the admin's |
| M4b | `roles-save` redraws Settings only | the new journey: "the student made themselves a client, and Progress is … journey" |
| M5 | `meSave_` without `progressRedraw_` | the new journey: "Progress (not in front, the payload held) still counts 14" |
| M6 | js/digest.js, its `FILES` entry and its push put back | the new journey (the card, the page naming it, the handler, `settingsPages_`) and the business journey |
| M7 | an `on('digest-preview')` handler alone | the new journey: "a `digest-preview` handler is still wired" |
| M8 | a tile on the journey card | both journeys |
| M9 | `Math.ceil` back, under `TZ=Europe/London` | the new journey: 15 and 31 days for 14 and 30 |

**check/states.js**: Progress's unnamed state asserts the card for the visitor — the placeholder, whole,
signed out; "Your journey" and nothing to press for the lab's admin. The "your journey" state moved from
Settings to Progress: a big exam a fortnight out, `progressRedraw_`, and the countdown on
`#s-progress`, none on Settings, no weekly email card anywhere. The two digest states are gone.

**The rest, on a machine shared with other workflows (load average 17 to 29):**

- **check-flow in four parts**: 354 journeys, one red — *"just a minute keeps its round through a repaint
  and pauses when the column is left"*, one of the known load-flaky ones, green alone.
- **The fast checks check-all lists** (53 of them, everything not marked slow): green, but for
  `check-dead`, which is soft and red on 069c0a5 with byte-identical output.
- **`check/ui.js --screen=progress`**: 15 combinations, nothing to report (the journey state is skipped
  for the signed-out visitor, by its `only`, and measured for the signed-in one at all five sizes).
  **`--screen=settings`**: 135 combinations, nothing new.
- **`check/press.js --screen=settings` and `--screen=progress`**: nothing threw, nothing silently inert —
  17 presses on Settings where the base has 18, the one gone being the Preview tile; nothing to press on
  Progress for either visitor. Its swipe pass went red in some runs, every time on the Games column
  (a flick chain from page 1, the times-tables Start's press mark), which this branch does not touch. The base,
  run four times the same afternoon, was red twice in the same pass — once on Tools and Find, once on
  **the same Games chain, word for word** — so it is load, and note 320 already lists the Games chain.
- **Screenshots at 390**, looked at and deleted: a student's Progress (the journey card, two countdowns),
  a parent's (the placeholder), an admin's (the journey card, no exam dates), and an admin's Settings
  turned to its last page — Notifications, behind the cut card, and no weekly email card.
