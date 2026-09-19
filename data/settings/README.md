# The Settings spreadsheet, as files

**Every row of all twenty-one data tabs, exported verbatim before the spreadsheet is deleted.**
679 rows, 6,233 cells, compared back against the workbook cell by cell: **0 differ**. That
comparison is the whole reason this commit exists on its own — the `libraryExtras_` rule this
repository already records twice, *prove it identical first, then make it*.

**Nothing reads these files yet.** The site still asks `doGet`, `doGet` still reads the
spreadsheet, and this commit changes no behaviour at all. What it changes is that the spreadsheet
is now safe to delete without losing anything, which was the thing that had to be true first.

**The sheet's own column names are kept** — `list_name`, `surcharge_per_hour`, `mustsign` — not the
camelCase the phone reads. A faithful export is one you can paste a row back into without
translating it, and the single place that renames a column is the mapping. Two spellings in two
places is what `r.link` against `source_url` cost: seven silent reads.

**One object per line**, `[` alone on the first line and `]` alone on the last, because that is the
shape every other data file here has and the reason is the next script that appends by splitting on
newlines.

**Five files hold no rows** — `kinds`, `laws`, `rooms`, `trips`, `herd`. They are here as `[]`
rather than absent, because *the tab existed and nobody ever typed in it* is a fact somebody will
want in a month, and an absent file cannot say it.

---

## What can move into code, and what must not

The three-question test in CLAUDE.md decides it, and the first question that answers wins.

### 1. Is it secret? — one tab, and it is not quite

`brand` carries the business's own e-mail and phone. **Both are already published**: every row of
that tab goes into `payload.brand` and out to every anonymous visitor, `brand('phone')` is printed
on the flyer the app makes, and `halex.dias.31@gmail.com` is the author address on every commit in
this repository's public history already. So committing them publishes nothing that was not
published. Worth knowing rather than worth hiding — and `brand.email` is read by **nothing** in the
app, so it is a dead key as well as a personal one.

### 2. Does the app write to it? — eleven handlers say yes and not one of them is called

`updateVenue`, `updateConfig`, `updatePricing`, `updateShop`, `deleteShopItem`, `updateLink`,
`addLink`, `deleteLink`, `saveRoom`, `updateTrip`, `addTrip`. Every one is access-listed in
`ACTION_ACCESS`, every one writes through `setCell`/`addRow`/`delRow`, and **every one has zero
callers anywhere in `js/` or `index.html`** — measured, not read: the strings do not occur.

**That is `orderPrints` eleven times over**, and this repository already has the sentence for it:
*access-listed, published in the feature list, never called.* The admin forms those handlers
belonged to are gone; `check-payload.js` can still see their wreckage from the other end, which is
why `linkFields`, `roomFields`, `roomSlots`, `shopFields`, `tripFields`, `venueFields`,
`pricingRows` and `multiSelect` are all on its *sent and never read* list.

**So the honest answer to question 2 is NO for every tab here** — which is what makes moving them
possible at all.

### 3. Then who reads it, and where is it read?

That is the question that actually splits the list, and it is not the same as question 2.

| the app only FORWARDS it to the payload | a tab a phone can own |
|---|---|
| `facets` 21 · `splashes` 26 · `campaigns` 12 · `copy` 22 · `facts` 58 · `links` 126 · `avatar` 27 · `terms` 18 | the backend shapes them and sends them; nothing is computed FROM them. These are the ones a front-end reader can take whole, exactly as `libraryExtras_` took the boxers |

| the BACKEND computes with it | and that is a reason to be careful |
|---|---|
| **`config` 25 · `pricing` 41 · `venues` 13** | **the money.** `quotePerHour` reads all three server-side, and this repository's own sentence is *a total posted by a browser is a total the client chose*. These should move to the **Ledger** spreadsheet — one line each in `WHERE` — not into code. The Settings file still dies; the price stays somewhere a browser cannot edit |
| `brand` 16 | two keys are read at WRITE time — `brandName()` when an e-mail goes out, `reactionSet()` when a post is written. Both already fall back to code (`'@family.'`, `HOUSE_REACTIONS`), so the fallback is the answer and the tab can go |
| `options` 145 | `allOptions()` and `optionFocus()` shape it into `DATA.dropdowns`. Pure reshaping, no decision — but `check-payload.js` reports `options` itself as **sent and never read**, so some of this is already weight |
| `holidays` 36 | `festiveOffers()` applies date arithmetic — `opens_days`, `trail_days` — against today. Moving it means porting that to JS, which is real work rather than a copy |
| `landmarks` 31 | `landmarks()` converts metres to degrees and assembles the map. Same: a transform, not a forward |
| `shop` 62 | `avatarCatalogue()` reads shop rows for the wardrobe. `avatar` (27 rows) is read by **nothing at all** — it is the wardrobe's colours, and `AVATAR_ITEMS` in code is the live copy |

---

## Two things found on the way that are worth more than the migration

**The `facts` tab is a duplicate of `FEED_FACTS`, exactly.** 58 rows, and all 58 match the code's
list on subject and heading with nothing on either side left over. `factsNow_` prefers the sheet, so
the sheet has been winning for as long as it has had rows — identically. Deleting the tab loses
nothing. CLAUDE.md says in two places that this tab is empty or does not exist; it has 58 rows and
they are the code's own.

**`terms` is the tutor agreement and it reaches no screen.** Eighteen rows — `docid`, `audience`,
`version`, `live`, `seq`, `title`, `heading`, `body`, `mustsign` — a real legal document, written
out. `check-payload.js` has `DATA.terms` on its accepted-dead list with the note *"terms.js wants
legal documents (docid/version/mustsign); TAB.terms is SCHOOL terms"*. That note is right about the
SCHEMA and wrong about the sheet: **the sheet holds exactly what `terms.js` is asking for**, and
`termsFor()` has been reading the same tab for school terms, finding no `term_name`, and falling
back to computed defaults. One tab, two readers, and the one with real content in front of it is
the one that was never wired up.
