## Which columns the app has is a file now, and the reader had been unreachable since it was written

**Asked as "there should be like 4-5 columns i think like it was before".** Git says there is no
before — the tab table has held nine in every commit since the repository began, and the hour grid
has been eleven hours by seven days in every one as well. **What the question exposed is that the
answer was never the owner's to give.**

**`applyColumns_` in `shell.js` has been complete and unreachable since it was written.** It reads
`DATA.columns`, applies the order, takes the label and the icon from each row, **refuses to invent a
column the build does not have** — *"a column that swipes to a blank is worse than a column that is
not there"* — refuses to leave you with none, and moves `AT` off a screen that has just been
switched off. Every guard is there and commented. **No backend has ever sent that key.** It sits on
`check-payload.js`'s accepted-dead list with the note *"needs a `columns` tab"*, and the spreadsheet
that tab would have lived in is being deleted.

**That is `orderPrints` again** — access-listed, argued for at length, never once called — and this
file records eleven more of them under the Settings migration.

**So the source is a file, like the nine tabs that just left that spreadsheet.**
`data/settings/columns.json` is fetched with them, `settingsInto_` writes `d.columns`, and the
ordering was already right: `settingsInto_` runs in `load()` a few lines before `applyColumns_`,
under a comment saying that one can change which screen you are on and everything painted after it
reads `AT`.

**It ships with the nine the code already has, in the order the code already puts them in, so
nothing changes today.** What it buys is that *"the app should have four or five columns"* is a cell
rather than a commit — which is the right shape for it, because which columns an app has is a
judgement about the app and not a repair.

**Proved in five states**, all with no JS errors: as shipped (nine, in order, `DATA.columns` nine
rows); **four columns relabelled and reordered with five switched off — `Home · Find · Book · You`**;
Find switched off, which lands you on Feed; an empty file; and a file holding an object instead of a
list. The last three all fall back to the code's nine, which is the same fall-through every other
settings file has and the reason a broken export cannot take the app down.

**It is the one file in `data/settings/` that is not an export.** Every other one is a tab that
existed, copied out verbatim; this is a tab that never did, written from the code so that a reader
which could not be reached has somewhere to read from.
