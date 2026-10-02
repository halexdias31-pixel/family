## `node js/check-settings.js` — the nine tabs that became files, and nothing was checking them

**`brand`, `facets`, `kinds`, `laws`, `facts`, `splashes`, `links`, `campaigns` and `copy` left the
Settings spreadsheet and are `data/settings/*.json` now.** `settingsInto_` maps them onto `DATA` and
a file with rows WINS, so they are the source of truth for nine tabs — and **no check had ever
opened one.**

**This is `check-rows.js`'s fault one layer along, and that file exists because of it**: folding two
tabs together left **seven reads of `r.link` on rows that call the URL `source_url`**, every
checklist topic arriving with no link on it, and nothing throwing. The same is now available here. A
column renamed in an export, or a read written from memory, is a value that silently arrives as
`undefined` and then as `''` — a brand key that never resolves, a facet with no label, a campaign
with no accent — and every one of those has a fallback, which is exactly why nobody would notice.

| | |
|---|---|
| **fails** | a column READ that the file does not have, and a tab named in `SETTINGS_TABS` with no file beside it |
| **prints** | a column the file HAS that nothing reads — weight shipped to every phone for nobody, which is `check-payload.js`'s "sent and never read" |
| **prints** | the twelve files in `data/settings/` that nothing fetches. `config`, `pricing` and `venues` are deliberate: they feed `quotePerHour` **server-side**, because *a total posted by a browser is a total the client chose* |
| **says so** | `kinds` and `laws` are `[]`, so their columns cannot be known. "I did not manage to look" printed as "I looked and it was fine" is the failure this repository keeps finding in its own checks |

### It mis-attributed on its first run, and the giveaway was a zero

**The first version sliced the file into nine blocks, one per `const x = extra['settings/x']`, and
reported seven columns as missing from `copy`.** Every one belongs to CAMPAIGNS: a campaign carries
its own words, so `settingsInto_` builds the copy index INSIDE the campaigns block, the copy binding
opens first, and a flat slice handed the campaign's reads to the wrong tab. **Meanwhile `campaigns`
reported reading nothing at all** — a check that finds zero reads in a block full of them has lost
its subject, and that number is the only reason the other seven were not believed.

**So it parses.** Acorn was already a dependency for `check-rows.js`, which learned this exact lesson
— its first version reported 95 findings with 2 real ones because one binding map per FILE let a
handler's `r` outlive the handler. **The binding is the CALL, not the line**: the tab is whatever the
receiver of `.forEach(r => …)` resolves to, through a local `const` or the head of a chain like
`campaigns.filter(…).map(…)`.

**And `facts` carries its row in a wrapper.** It needs the index, so it maps to `{ r, i }` first and
every read after that is `x.r.heading` — reading only `r.<col>` found nothing in that block and
reported a live tab as mapped nowhere. Any parameter name is followed, but **only through `.r`**, so
the `.sort((a, b) => a.order - b.order)` at the end of the same chain contributes nothing: `order`
and `row` are fields of the mapped object, not columns of anything.

**`clip` is read off `facts` on purpose and that column has never existed** — the clips live in
`FEED_FACTS`, and `clipsNow_` falls through to the code's list when the sheet has none. That is the
house rule stated per LIST rather than per tab, so one ordinary fact typed into the sheet cannot take
the Reels column dark. It is the `ACCEPTED` pattern for the sixth time, one entry and one written
reason, and it is also the door: add a `clip` column and a row wins over the code.

**Proved in both directions**: renaming `value` to `val` in `brand.json` names it and exits 1.
