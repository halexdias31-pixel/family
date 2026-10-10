## Films leave Find, and a tutor's extra photographs stay squares

Two requests from the owner on 10 Oct. Each one takes something away that had been built in answer
to an earlier request.

---

### 1. Films are not in Find

**The owner, 10 Oct:** *"films should not appear in the finder it cannot be found there"*

#### What it was

Find (the funnel, `js/find.js`) had a `film` kind: `Films` under What kind, one item per row of
`DATA.films` (keys `fm:…`), its own card (`filmCard_`), and a Watch tile linking to Drive (`filmTiles_`
in `js/tiles.js`). Only an admin ever saw any of it, because `doGet` sends `films` only inside
`if (viewerIsAdmin)` and sends everybody else `[]` (note 068). An admin could reach a film two ways:
Find, and Games → Videos, which already searches the same rows by title, year, kids, series and
documentary. The owner wants films found in one place, and Find is not it.

#### What it is

- **Find has no films at all, for anybody.** No kind, no items, no card, no `Films` answer under What
  kind, and nothing in Find's search. A film's title, its director, its lead and its notes are not in
  Find's haystack, because nothing on Find's list reads `DATA.films` any more.
- **Removed:** the `film` entry in `KINDS`, the mapper in `stuffItemsRaw_`, `filmCard_`, `filmTiles_`
  (and the line in `cardActions_` that called it), and `.fc-note p` / `.fc-note p:last-child` in
  style.css. The film card was the last thing that put a `<p>` inside a `.fc-note`; every `.fc-note`
  left *is* the paragraph. Each removed piece has a short note where it was, quoting the owner and
  saying where films are found.
- **Kept exactly as it was:** `DATA.films`, `DATA.filmsSync`, the Notflix sync, and all of Games →
  Videos. `filmsAdopt_` in games.js still calls `stuffForget_`. Find has nothing a sync could change,
  so that call now rebuilds lists that are the same as before: harmless, and left alone because
  games.js was being reworked in another branch. `signedOut_` (me.js) still calls `stuffForget_` too.
  Sign-out empties the stars and the per-person keys in place, so the call still does a job there.
- `--css-version` is `2026-10-10-films-leave-find`.

#### The `Read or watch it` bucket

With Films gone, `KIND_BUCKET`'s third row would hold `Resources` alone. There were three ways to
handle that, and the rules already in find.js decide between them:

| | |
|---|---|
| **Delete the row** | `Resources` would have no row. `check-funnel.js` requires a written-out table to place every answer the library gives, and one unplaced value stands the grouping down. **Proved:** with the row deleted, check-funnel exits 1 with `kindLabel "Resources" (284)` unplaced. |
| **Fold it into `Work through it`** | That would file a boxer and a bout as things you work through, which they are not. It is the two-cupboards fault the other way round. |
| **Keep it, holding one kind** | **Chosen.** `Order it` already holds only `Bundles`. The one-answer rule that once argued against a one-kind bucket (`Make something`) only applies when the bucket is *drawn* in place of its answers, and since 6 Oct nothing is drawn that way (`bucketValues_` returns the answers unchanged). So What kind shows `Resources` itself, the owner's own word for that tag. |

**The name stays `Read or watch it` because it is still true.** A bout carries a Watch tile and a
boxer carries Highlights (`fightTiles_` and `boxerTiles_`). The textbooks and the Bible are read. A
chip saved under the old label also keeps working, because `bucketDeclares_` still recognises it. On
screen, the row only affects **order** (`within`, read by `orderOf` on What kind). That order is
unchanged apart from Films dropping out from between the last two:
Questions · Answers · Practicals · Projects · Bundles · Resources.

**Since the second finder ([329](329-the-second-finder-carries-the-resources.md)), `Resources` is not a
What kind answer on Find at all** — the resources are their own column, right of Find. The row still
places it, so the table places every label the library gives. At the merge this note's journey was
fed the practicals instead of the textbooks (Learning on Find had one kind left, so What kind was
skipped), and its state asks What kind over Find's whole list rather than under Learning.

#### Checks

- `js/check-flow.js`, new journey: *films are not in Find for an admin with films in the payload —
  not by title, not under What kind — and the videos card still finds one.* It can only be asked of
  an admin: nobody else is sent a film, so a student's Find would pass even with the mapper back. The
  setup is proved first (the admin's `DATA` holds all seven films). Then:
  - The title is typed into Find's own box, through its input handler and debounce.
  - Every other title, and two words that only a film's notes contain (`XY9`, `unfinished`), are
    searched for on the filtered list.
  - What kind is checked two ways: the chips as the question page draws them (with real projects
    and textbooks in the payload, so the question has answers of its own), and the facet's answers
    over the whole list.
  - Finally, the videos card must still find `Paper Moon Rising` for `paper moon`.
- Updated rather than deleted. Each one says what it used to ask:
  - The Drive-sync journey asked Find for the four films the sync carried. It now asks that Find
    has none.
  - The sign-out journey's setup required the admin's Find to hold all seven. It now requires none.
  - The signed-out-payload journey's setup is now the admin's `DATA.films` instead of Find's items.
    `Films` is still refused on the signed-out funnel.
  - The shared-parts journey drops `film` from `KINDS_HERE`. It still puts the fixture's films in
    the payload and fails if any of them reaches Find.
  - The What-kind order journey expects the six kinds above, and fails if `orderOf('Films')` still
    has a place.
- `check/states.js`: the state `the films` used to open Learning → Films and measure the film cards.
  It is now `no films in Find, an admin’s`. It draws the admin's What kind question with the
  fixture's three films in the payload, and it only arrives if no chip says Films and no item in
  Find is a film. The videos-card states on Games still measure where films really are.
- Mutations, each red, real files green again afterwards:
  - **find.js and tiles.js put back:** the new journey fails 13 ways (7 items, the typed title, a
    drawn card, 8 searches, Films on the page and in the facet). The order journey, shared-parts,
    sign-out, sync and signed-out-payload journeys each fail. `check/ui.js --screen=stuff
    --width=320` reports the new state *NOT measured* and exits 1.
  - **Mapper alone** (no kind, so the items fall to Shop): the new journey fails on the 7 items
    in `stuffItemsAll_`.
  - **`Films` back in `KIND_BUCKET` alone:** the order journey fails.
  - **The row deleted:** check-funnel fails (see the table above).

---

### 2. A tutor's extra photographs stay squares

**The owner, 10 Oct:** *"i dont like how you made it so people can enlarge a photo of tutor. the extra
ones"*

Commit `6758e2f`. A tutor's extra photographs (`t.photos`, up to eight, four to a row on the profile
card in `findCard`, js/cards.js) used to be `<button class="prof-shot" data-do="prof-shot"
aria-pressed>`, read out as "Photo — tap to see it bigger". A tap opened one across the whole row at
its own proportions, and a second tap put it back.

- **Each square is a `<span class="prof-shot">` holding the `<img>`** and nothing else: nothing to
  press, nothing read out about making it bigger. It is the same reason the week on that card is made
  of spans (`profAvail_`): something that is not a control is not marked up as one.
- **`on('prof-shot')` is gone** (a note sits where it was), and so are `.prof-shot.is-big` and its
  `img` rule. `.prof-shot` lost its button resets, its 44px floor and its `zoom-in` cursor, because a
  picture that is not a control has no tap target to keep.
- `check/states.js`: the state that opened one (*a tutor's photographs, one opened*) is now *a tutor's
  photographs, pressed and staying squares*. It presses one, then asks that every square is still as
  wide as it is tall and that the grid holds no `button`, `[data-do]`, `[aria-pressed]` or `.is-big`.
