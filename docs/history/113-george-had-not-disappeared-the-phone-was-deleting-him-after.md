## George had not disappeared — the phone was deleting him after the server had sent him

**Reported as "where did george dissapear off to?"** and nothing had gone wrong with his row. He is a
tutor, his `listed` cell is off, and `accountPages_` read
`.filter(t => t && t.title && t.listed !== false)` — so an unlisted tutor was dropped **on the phone,
after `doGet` had deliberately sent him.**

**`doget.gs` ALREADY DECIDES THIS AND SAYS SO OUT LOUD**, beside the gate that does it: *"An admin
sees the unlisted ones too, marked. Without that a tutor switched off vanishes from the site and can
only be switched back on in the spreadsheet — which would make the control worse than not having
one."* The rule was written twice and the two disagreed. **That is the `MESSAGING` fault** — a policy
copied onto the phone is two rules to keep in step — and here the copy silently won, on the one
screen that can switch him back on.

**IT MADE THREE THINGS UNREACHABLE THAT WERE ALREADY BUILT.** `findCard` draws such a row dimmed with
`· not listed` beside the role, `.card.is-widget.is-off` and `.prof-off` are in the stylesheet, and
`asItem_` three lines below the filter sets `off: t.listed === false`. None of them could ever run,
because the row never arrived — a renderer left standing over a permanently false condition, which is
the shape recorded here under `resource_type` in `VOCAB` and the dead `kind === 'paper'` guard.

**The server is the gate and stays the gate**, which is what makes deleting the clause a repair
rather than a disclosure: a non-admin is never sent an unlisted tutor, so there was nothing here to
filter. **Measured on two payloads**: an admin gets 3 pages with George dimmed and labelled, a parent
gets 2 and no George anywhere. Proved by mutation — the old clause back, and the admin gets 2 pages
and no George.

### The fixture's one tutor is listed and has a DBS, so two states had never been drawn

**`check/fixture.json` has a single tutor, `listed: true`, `dbs: true`** — so the account column this
lab has measured on every run is the one where every row is live and every stamp is green.
`.prof-dbs.no` and `.prof-off` had **never been on a screen it looked at**, which is the same hole the
booking receipt, the message thread and the basket were each in.

**The state found a real fault on its first run**: `· not listed` at `#b9544a` is **4.15:1 against
`--bg`**, under WCAG AA's 4.5 for small text — the one word on the card that says why it is dimmed,
and the hardest thing on it to read. `#c4655a` is 5.02:1 and the same hue.

**Repaired as a token, not at the instance.** That hex was written out twice — `No DBS on file` and
`· not listed` — so fixing the one the check happened to name would have left the other wrong in
exactly the same way, which is the `cost: 0` sentence for the thirteenth time. `--prof-warn` is
**declared on `.is-prof` rather than at `:root`**, because it is this card's own word for "something
is not right here" and nothing else in the app should be offered it — the rule the house style states
with the chess board's cream and charcoal.

**The page number comes from `accountPages_()` itself**, not from a second re-derivation of `others`
in the harness: `termsPages_()` is concatenated after the people, so counting from the end lands on a
legal document. That is the flyer state's own lesson — two readings of one list — one screen along.

### Asked again, and this time the answer was in the cell rather than in the code

**Reported as "Where's George I still don't see him on my site."** The fix above landed on `main` at
14:53 the day before, so the obvious reading is that it did not work. **It does. Every link in the
chain was measured this time rather than read, and the last one is a spreadsheet cell.**

| | |
|---|---|
| the front end | `accountPages_` and `stuffItemsRaw_` both filter on `t.title` and nothing else — the `listed` clause is gone from both, and it is on `main` |
| **the sheet** | **`listed` on P002 is `FALSE`.** Read through the Drive connector, positioned against the header rather than off a collapsed snippet: column 55 of 75, blank on the other tutor and on the admin |
| his role | `tutor`, so `hasRole(r, 'tutor')` passes and he is a candidate at all |
| the server | `(listed \|\| viewerIsAdmin)` — so he is sent to an admin and to nobody else |
| **`viewerIsAdmin`** | `isAdminPerson(S(p.name))` → `findPerson` → `hasRole(p,'admin')`. P001's role is `admin`, and **both** the boot fetch in `index.html` and `load()`'s own fallback send `name=`, which is the fault `shell.js` already records having fixed |
| the switch | `set-listed` → `setListed` in `dopost.gs`, access-listed `admin`, writing that same cell |

**SO NOTHING IS BROKEN AND THE CONTROL IS WORKING AS DESIGNED.** `listed: FALSE` is a tutor switched
off, which is what that column is for; he is drawn for an admin only, dimmed, with `· not listed`
beside the name and a `Not listed` tile under it reading *"clients cannot see them"*. One tap on
that tile is what puts him back on the public site.

**AND THE TAP IS THE RIGHT ROUTE RATHER THAN THE CELL**, which is worth saying because editing the
sheet by hand looks equivalent and is not: `setCell` sets `POST_WROTE` and retires the six-hour
payload immediately, where a cell typed by hand reaches the site only if `onSheetChange` is
installed — the trap this file records under "the cache, and the trap in it".

**What could not be checked from here is the one thing that never can**: which build that phone is
running. Every host but GitHub is blocked, so a live open is the owner's to do — which is what the
build stamp on the You screen and the reload banner are both for.

#### The DBS is not why he is hidden, and nothing anywhere ties the two

**Asked as "even if he doesn't have a dbs he should still be listed", which is right and is already
how it works.** `dbs` and `listed` are two independent cells read by two independent lines —
`dbs: TRUE_(r.dbs_checked)` and `listed: ON_(r.listed)` — and the gate at `doget.gs:541` reads only
the second. Measured across `js/` and `backend/`: **nothing anywhere reads a DBS to decide a
listing.** The only two writers of that cell are `setListed`, which is the tile, and
`makeBrandAccount`, which touches the brand row alone and only when the cell is blank. So the
missing DBS did not switch him off; somebody or something wrote `FALSE`, and the remedy is the tap.

**WHAT THE TAP PUBLISHES IS WORTH NAMING BEFORE IT IS PRESSED, because it is a public statement
about a named person.** Rendered as an admin against a row shaped like his — `listed: false`,
`dbs: false` — his card draws dimmed, `· not listed` beside the role, and **`No DBS on file` in
red**. Listed, the dimming and the words go and **the red stamp stays**, on a card clients can see.
That is `findCard`'s own decision and its note defends it outright: *"a pass without one is visibly
a pass without one, which is exactly the right amount of alarming."* It is right for somebody a
parent is checking, and it is not a side effect of anything in this commit — so listing him is a
choice to show that stamp, not a way round it.

**And the tile is a sibling of the card rather than a child of it**, which is how the first probe
came back reporting no tile on a page carrying two. `cardTiles_` returns its own row, so a selector
scoped to `.card.is-prof` finds nothing and reads as the control being absent — the shape this file
records every time an instrument cannot reach its subject. Measured properly: `set-listed` once per
tutor, `data-who` the display name, and `isAdmin()` true.
