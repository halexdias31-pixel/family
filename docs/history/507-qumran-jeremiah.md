# 507 — The Qumran Jeremiah fragments: 4QJerb and 4QJerd

Owner: "Hebrew fragments of Jeremiah found at Qumran (4QJer^b and 4QJer^d) preserve the… — add this fragment
into the database like the others." (The sentence arrived cut off; the well-known point it was making is below.)

## What was added

Two rows of `data/manuscripts.json`, in the MS-0001/MS-0002 shape (495), 18+ like every religious history row (499):

| id | name | catalogue | contents | date |
|---|---|---|---|---|
| MS-0003 | 4QJerb | 4Q71 | Jeremiah 9:22–25, 10:1–21 | 2nd century BC (palaeography) |
| MS-0004 | 4QJerd | 4Q72a (formerly counted with 4QJerb) | Jeremiah 43:2–10 | 2nd century BC (palaeography) |

Both: Qumran Cave 4, 1952; Hebrew on parchment in the Jewish square script; Israel Antiquities Authority's Dead
Sea Scrolls collection, Jerusalem; edited by Emanuel Tov in DJD XV (1997). Years `-200`..`-50`: sources give "the
first half of the second century BCE or the Hasmonaean period", so the range covers both readings. Size left
blank — no reliable published figure found.

**What they show, said cautiously:** 4QJerb lacks Jer 10:6–8 and 10 and has verse 9 within verse 5, as the
Septuagint does; the longer Masoretic text has them. 4QJerd's wording (shorter name forms in 43:4–6) is likewise
closer to the Septuagint. They are read as Hebrew witnesses to the shorter edition behind the Greek; the
rows say "closer to", and that the extent is debated, rather than "identical".

## What was not added

- **No drawing.** 495's rule: a drawing is traced from a public-domain photograph on Wikimedia Commons. Commons
  search for 4QJer / 4Q71 / 4Q72 found no file. The photographs that exist are the Leon Levy Digital Library's
  and the IAA's, which are not PD. So no `MS_LOOK` entry: the cards show tags and facts only.
- **No links yet.** Links go through a row's `writings` column (WR- ids). There is no Septuagint, Masoretic or
  Jeremiah writing row yet (another change is adding the Septuagint and Masoretic texts); link them there.

Sources: en.wikipedia.org/wiki/List_of_the_Dead_Sea_Scrolls; library.biblicalarchaeology.org (BAR,
"The Book of Jeremiah: a Work in Progress" and its image captions); Tov, DJD XV (1997), 171–176 for 4Q71.

## One side a card (same change)

Owner: "currently it displays front and back in the same thing. no. make front a tag and back a tag, so each
widget displays one side."

- Each `MS_LOOK` side names its `side` (`front`/`back`); `histItems_` (find.js) makes one Find item per drawn side,
  tagged by the new ordinary facet **Side** (`histSide`: Front (recto) / Back (verso); `FACETS`, `TAG_OF`,
  `data/settings/facets.json`). `msFragSvg_(r, ix)` draws that side alone; the facts line is on every card.
- Papyrus 52: Front (recto, John 18:31–33) and Back (verso, John 18:37–38). Codex Alexandrinus fol. 41v is one
  card, Back (verso). Undrawn rows (the Qumran fragments) stay one card with no Side tag.
- Saved keys: the first drawn side keeps the bare `hdb:MS-NNNN` key, so a saved or linked key opens the Front
  card (P52) with no migration code; the other side is `hdb:MS-NNNN:back`.
- The 495 journey that asked for both sides on one card now asks for one side, the Back card, its tag and facts.
