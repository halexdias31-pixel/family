## The Settings spreadsheet is being deleted, and eleven write handlers had no callers

**Asked for as "im trying to delete the settings spreadsheet. but obviously i want to not lose most
of its data… i am trying to move whats needed to code."** Fifty-eight tabs, coloured by the owner:
purple for what they knew they wanted, the file's own gold for *read by the app*, grey for
`_`-prefixed *read by nobody*.

**The first move was the export, on its own, before any wiring.** 679 rows and 6,233 cells compared
back against the workbook cell by cell — **0 differ** — which is the `libraryExtras_` rule this file
already records twice: prove it identical first, then make it. `data/settings/*.json` holds the 21
data tabs under the sheet's own column names, and `docs/settings/*.md` holds the 37 documentation
tabs as prose. At that commit the spreadsheet became deletable without loss, which is the thing that
had to be true before anything else was worth doing.

### The three-question test, and question 2 answered no for everything

**`updateVenue`, `updateConfig`, `updatePricing`, `updateShop`, `deleteShopItem`, `updateLink`,
`addLink`, `deleteLink`, `saveRoom`, `updateTrip`, `addTrip` — eleven handlers, access-listed in
`ACTION_ACCESS`, writing through `setCell`/`addRow`/`delRow`, and NOT ONE has a caller anywhere in
`js/` or `index.html`.** Measured rather than read: the strings do not occur. **That is
`orderPrints` eleven times over**, and `check-payload.js` has been able to see the wreckage from the
other end the whole time — `linkFields`, `roomFields`, `roomSlots`, `shopFields`, `tripFields`,
`venueFields`, `pricingRows` and `multiSelect` are all on its *sent and never read* list, because
they are the scaffolding those dead forms needed.

**So "does the app write to it" is NO for every Settings tab**, and that is what makes moving any of
it possible at all.

**Question 3 is the one that actually splits the list**, and it is not the same question. Eight tabs
are FORWARDED — the backend shapes a row and pushes it onto the payload, and nothing is computed
from it. Those a phone can own. The rest are read by the backend to *decide* something, and three of
those decide money.

### What is deliberately NOT in code, and the sentence is already in this file

**`config`, `pricing` and `venues` feed `quotePerHour` SERVER-SIDE.** *A total posted by a browser
is a total the client chose* — this repository's own words, written when `printPrice` moved to the
phone. Those three belong in **Ledger**, which is one line each in `WHERE` and leaves the Settings
file just as dead. `options`, `shop`, `holidays`, `landmarks` and `terms` are the softer version of
the same thing: `allOptions()`, `avatarCatalogue()`, `festiveOffers()` and `landmarks()` each do
arithmetic or a join rather than a forward, so moving them means porting a transform, which is work
rather than a copy.

### The file wins when it has rows, and that is what makes it shippable alone

`settingsInto_` in `js/settings.js` is `libraryExtras_`'s rule pointed the same way — **a file with
no rows leaves the payload's key alone** — and here it earns more than it did there, because the
front end reaches Pages in a minute and the backend reaches Apps Script when somebody runs a sync
that is blocked on a Cloud-project switch. Every ordering has to work:

| | |
|---|---|
| old backend, files present | the files win. Identical, because they ARE its rows |
| new backend, files present | the files are the only source |
| **the sheet deleted, old backend** | `openById` on a trashed file is caught — `ss = null`, every tab reads empty, the payload sends `[]`, **and the files win** |

**That third row is the one worth having**: the spreadsheet can go as soon as this deploys, without
waiting on the sync. Measured both ways in a real browser against the real files — 16 brand keys,
21 facets, 58 facts, 126 links in 25 categories, 12 campaigns; blank the files and every one falls
back to whatever the payload said.

**`kinds` and `laws` are `[]` on purpose and the harness proves why.** Both tabs were empty, so both
files are empty, so `check/fixture.json`'s three `kinds` rows — the ones that regroup tutor→people
and venue→places — still decide. That is the escape hatch this file already records, proving itself
a second time.

**And five fixture keys were deleted in the same commit.** `brand`, `facets`, `facts`, `links` and
`campaigns` are now overwritten a moment after they are read, and **a fixture key that silently does
nothing is the fault the suite exists to catch** — the sentence written when `questions` left. The
fixture's four brand keys were all in the file's sixteen, so not one of them survived.

**`fields` is not rebuilt on a link**, and that is the one shape deliberately not copied. The
backend packs every editable column onto each link for `updateLink`, which has no caller; `find.js`
reads `title`, `category` and the row. Carrying it would be shipping a dead surface's luggage to
every phone.

### Two things found on the way that are worth more than the migration

**The `facts` tab is a duplicate of `FEED_FACTS`, exactly.** 58 rows, all 58 matching the code's
list on subject and heading, nothing left over on either side. `factsNow_` prefers the sheet, so the
sheet has been winning — and handing back the code's own list. **This file says in two places that
the tab is empty or does not exist.** It has 58 rows. Nothing was ever wrong on screen, which is why
nobody looked.

**`terms` is the tutor agreement and it reaches no screen.** Eighteen rows — `docid`, `audience`,
`version`, `live`, `seq`, `title`, `heading`, `body`, `mustsign` — a real legal document, written
out. `check-payload.js` carries `DATA.terms` on its accepted-dead list with the note *"terms.js
wants legal documents (docid/version/mustsign); TAB.terms is SCHOOL terms"*. **That note is right
about `SCHEMA` and wrong about the sheet**: the tab holds exactly what `terms.js` asks for, and
`termsFor()` has been reading the same tab for school terms, finding no `term_name`, and falling
back to computed defaults — which is why nobody noticed either half. One tab, two readers, and the
one with real content in front of it was never wired up.

### What the brand tab carries, said rather than buried

`brand` holds the business's e-mail and phone. **Both are already published**: every row of that tab
goes into `payload.brand` and out to every anonymous visitor, `brand('phone')` is printed on the
flyer the app makes, and the e-mail is the author address on every commit in this public repository
already. Committing them publishes nothing that was not published — and `brand.email` is read by
**nothing** in the app, so it is a dead key as well as a personal one.

### The spreadsheet went from three files to two, and `?setup=1` would have died on the way

**The Ledger came back with 23 tabs and the import was exact** — the seven new ones match what was
sent **cell for cell: 353 rows, 3,833 cells, 0 differ**, dates still dates, and all fifteen of the
Ledger's own tabs untouched. `ticks` (518 rows) is there too, routed by nothing and read by nothing;
it is the one tab in that file holding children's handles, and it stays where it is.

**`post_comments` was missing**, which is expected — `ensureSchema` is the only thing that creates
it. Which is how the real fault was found.

#### `ensureSchema` had a bare `openById` and one dead route would have taken the whole run down

```js
const ss = SpreadsheetApp.openById(at.id);     // no try, no catch
```

**With `Settings` in the bin and one tab still routed at it, that throws, the throw escapes
`ensureSchema`, and the run dies on the first name in `SCHEMA`.** `?setup=1` is the only thing that
creates `post_comments` — so the comments feature would have sat there looking broken, on a live
site, with nothing anywhere saying why. Found by *reading the function while checking whether the
spreadsheet was safe to delete*, which is the only reason it is not a story about a broken setup
route.

**The route is fixed and so is the rule**, because repairing the instance and not the rule is the
shape this file records under `cost: 0`, under `paper: true`, under the spelling fold and under
`delRow` — every time with the fault coming back. A tab whose file will not open is now reported and
skipped, and the other thirty are still checked.

#### Seven moved, nine were deleted, and `SETTINGS_ID` went with them

| | |
|---|---|
| **to `Ledger`** | `config`, `pricing`, `venues` — **the money**, which `quotePerHour` decides server-side. Plus `options`, `shop`, `holidays`, `landmarks`, each reshaped by a function here (`allOptions`, `avatarCatalogue`, `festiveOffers`, `landmarks`) before anybody sees it |
| **deleted outright** | `brand`, `facets`, `kinds`, `laws`, `facts`, `splashes`, `links`, `campaigns`, `copy` — `WHERE`, `TAB`, `SCHEMA` and every `read` block, in one commit. `settingsInto_` builds all nine from `data/settings/*.json` |
| **routed to `Ledger` although empty** | `terms`, `rooms`, `trips`, `herd`, `widgets`, `map`, `landmark_parts` — so `read()` still answers and `ensureSchema` has somewhere to make them |

**`SCHEMA` had to go in the same commit as the read blocks, in both directions** — the third time
this file records that argument, after `SCHEMA.resources` and the library cut. Deleting the entries
alone fails `check-columns.js` on every `r.field` in a block that still exists; leaving them behind
is worse than untidy, because `ensureSchema` **creates any tab it cannot find** and would have built
nine empty decoys in `Ledger` — right headers, no rows, and somebody typing into one would be
ignored by an app reading the file instead.

**And `?setup=1` against `terms` stops being the hazard this file warns about.** That warning was
about adding nine school-term columns to a legal-documents tab; in `Ledger` there is no `terms` tab
at all, so it makes a fresh one with the right headers — which is the tab `termsFor()` has wanted
since it was written and has never had. The legal document itself is `data/settings/terms.json`.

#### Three dead handlers went, and eight are still here

`updateLink`, `addLink` and `deleteLink` wrote to a tab that no longer exists, so they could not
have worked. **They could not have been called either**: measured across `js/` and `index.html`, not
one of the three strings occurs. The other eight of the eleven — `updateVenue`, `updateConfig`,
`updatePricing`, `updateShop`, `deleteShopItem`, `saveRoom`, `updateTrip`, `addTrip` — write to tabs
that moved rather than went, so they would still work if anything ever called them. They stay, dead,
until somebody decides whether that admin surface is being rebuilt or buried.

#### Two server-side readers lost their sheet and both already had the answer

`reactionSet()` walked `brand` for a `reactions` key **no row has ever carried**, so it always fell
through to `HOUSE_REACTIONS`; it returns that now, and a post's own cell is still the rung above.
`brandName()` fell through to the literal `'@family.'`; that is `BRAND_NAME` in `constants.gs` now —
one place rather than a fallback repeated at each caller. **Two spellings of one name is a thing to
keep in step**, so it is written down: the file is what every screen reads, that constant is what
signs an e-mail.

**Measured after, in a browser against the real files**: 16 brand keys, 21 facets, 58 facts, 126
links in 25 categories, 12 campaigns, and the reel column still two clips. 30 checks pass and
`check/ui.js` reports nothing across 104 combinations.
