## The boxer card is a fighter's profile: the photo, the record as the centrepiece, the tape, and his fights

**"can you refine the boxers widget. maybe add image of each boxer. and make it look nicer. the wins
losses etc. my mate's a boxer and i want to impress him."** (5 Oct)

The card was a name, a sub-line and `56-5-0 · 37 KO` in small gold mono: every number a boxer is
judged by, at the size this app keeps for a footnote. It is laid out the way a fight broadcast lays a
fighter out now, and his fights are the page after it.

### The data first, committed on its own

The verifiers' kept patches (`ok-r0` … `ok-r3`, 177 cells on 42 rows) went into `data/boxers.json`
line by line: every object line was checked to round-trip byte-identical before it was touched, and
the 61 rows no patch named are byte-for-byte what they were. Born-in, stance, reach, titles, notable
wins and losses, no-contests, and a handful of corrections. **One photo**: Ali, `Muhammad_Ali_NYWTS.jpg`
(New York World-Telegram & Sun collection, Library of Congress, public domain), credited "Photo: Ira
Rosenberg, Public domain, via Wikimedia Commons". Every other `image` cell is still blank — the
verifiers rejected the rest because no Commons page could be opened from here to confirm the author
and licence.

### The licence rule, which is the one rule here that is not a matter of taste

**A Commons photograph is free on a condition: its author and licence are named wherever it is
shown.** So the credit is never optional and never hidden:

- `boxerPicSrc_` (find.js) draws a photo **only with its credit**. A row with an `image` and no
  `image_credit` gets the placeholder, whatever the sheet says.
- `check-library.js` **fails** such a row, and an `image` that is not `https` (a plain-http picture is
  blocked as mixed content — a broken box by another route). So the mistake is caught before it ships,
  not quietly hidden after.
- The credit is printed in small type directly under the photo, and on the fight card as one line
  under both faces ("Photo of Muhammad Ali: Ira Rosenberg, …"). A photo that fails to load takes its
  credit with it — a credit under a placeholder names a picture nobody can see.
- To add a photo: put the Commons file's `upload.wikimedia.org` address in `image` and the author and
  licence in `image_credit` in the form "Photo: <author>, <licence>, via Wikimedia Commons". Check
  the file page says who the author is — an event name or a magazine is not an author.

### The card

| Part | What it is | Why |
|---|---|---|
| Photo | a 4:5 portrait in the left two-fifths, beside the name; lazy, `object-fit: cover`, alt = his name | **Not full width, measured**: a 4:3 photo across the card put the profile at 1,480px on a 390px phone, and 102 of 103 rows have no photo, so it would have been a 225px placeholder on nearly every page. Beside the name it costs nothing. |
| Placeholder | the splash's gold 8-bit fighter in his guard, in the splash's ring, his initials over the top rope | the same paths and the same `.bx-*` rules as `tools/boxing.py`, so the loading screen and the placeholder are one drawing. **Nobody's likeness** — a stand-in that looked like a person would be a picture of the wrong man. Always in the box under the photo, so nothing jumps while it loads; `boxerPicFail_` takes a failed `<img>` out and it is all that is left — never a broken-picture icon — and a failed address is not asked for again on the next repaint. |
| Head | `Boxer` flag, the name, the nickname under it in quotes and gold, the country with its flag, the weight he is known at | the shared `.fc-head`; the photo is placed by a grid, not moved in the markup, so the card still opens on its head (the shared-parts journey) and a screen reader hears the name first |
| Status | `● Active · since 2013`, `Retired · 2005`, `† Deceased · 1942–2016` | each with the years that status is about; the career span is the tape's |
| **The record** | won / lost / drawn (and NC when there were any) at 2.4rem, KOs under wins and losses, one bar for the split, KO rate and fights | the only boxed thing on the card. Gold won, the ring's red lost, quiet ink drawn; a nought is faint ("none" is quiet). The bar is an SVG whose widths are attributes and add up to exactly 100 (the last segment takes the remainder). A fighter still fighting gets "Record as of …" |
| Tale of the tape | age (living) or born / died with the age he reached, height in cm and feet, reach in cm and inches, stance, every weight when more than one, career | only the rows a cell answered |
| Titles | the sheet's own sentence beside a gold rule; Hall of Fame and lineal as gold badges | |
| Highlights | a tile under the card: a YouTube search for his name | the fight's Watch, one kind along; a link, so `tile_` draws the anchor |

**His fights are the next page** (`boxerPart_`, in `pageParts_` as `fights`): who he beat and who beat
him as chips, then every bout in `data/fights.json` he is in, **newest first**, one line each — W/L/D
in a square, the opponent, `TKO 14 · 1 Oct 1975 · TITLE`. A page and not more card because of the
owner's standing rule, *"I don't like scrolling ... This goes for all widgets so they all fit on
screen"*: Ali's fourteen bouts are a screen on their own. Measured in the screenshot run, the profile
is 357–548px tall at 320 and 407–617px at 390 across the five boxers shot, so it fits a 390×844 pane
whole; `check/ui.js` reports it drawn at 89–91% on a 320×568 phone, the known shrink-to-fit. Ali's
fights page, the longest there is, is 736px at 320 and 806px at 390. A fighter with neither notable
names nor bouts on file (seventeen of them) has no fights page — an empty page is the one
`pageParts_` refuses.

**The fight card shows both corners** as small squares over the title, the winner's framed in gold, the
blue corner's placeholder mirrored in the splash's blue trunks. An opponent with no row of his own
gets the placeholder with his initials.

### Three mapper faults the card would have printed

- **The record was `libN`**, which reads a blank as 0. Fourteen fighters have no record yet and would
  have drawn as `0-0-0`; `losses_ko` is blank on a hundred rows and would have printed "0 KO" under
  every loss column. The record, height and reach are `libNum` now — blank is "not on file", and the
  card says "No fight record on file yet."
- **`hall_of_fame` and `lineal` were `libOn`**, which reads BLANK AS ON (right for `active`). Nothing
  drew them before; the new card would have put a Hall of Fame badge on the 24 blank rows and "lineal
  champion" on all 103. They are `libTrue`.
- **`image_credit` was not mapped**, so no boxer could ever have shown a photo under the licence rule.

### Checked

`check-library.js`: a boxer row with an image and no credit, an image that is not https, or KOs
outnumbering the wins or losses they are part of (a KO rate over 100%) fails. Proved: Ali's credit
blanked, `57 KO in 56 wins`, and an `http://` address each red; restored, green.

`check-flow.js`, four journeys over the real files through the real mapper:
*a boxer with a photo* (img, alt, lazy, the credit word for word, W/L/D, KOs, no "0 KO" under a blank,
KO rate, bar = 100 and the win segment its share, the Highlights tile under the card);
*a boxer without a photo* (ring, initials `JL`, no img, no credit; an address with no credit is not
drawn; a blank record says so and draws no scoreboard);
*a photo that will not load* (the browser's `error`, then: img gone, ring left, credit gone, not asked
for again on a repaint);
*a boxer's fights* (every bout with his id, counted from the file, newest first, the other corner's
name and the right letter, a fighter with nothing gets no page; the Thrilla's two faces, the winner
framed, Ali's credit). Ten mutations, each red for its own reason and green on restore: the bar's
last segment off by one; the credit taken off; `losses_ko` back to `libN`; a photo drawn without its
credit; the record back to `libN`; the error listener emptied; the failed address not remembered;
bouts oldest first; the result read from the other corner; the winner's frame on the loser.

`check/states.js`: *the boxers* now asks for the 4:5 box to the LEFT of the name, the scoreboard in
whole numbers (or "no record on file"), the title size and flag rule, and nothing scrolling sideways;
*the fights* asks for both faces, square, above the flag. Proved by putting the photo back across the
card and the faces back under the title: both states red at all four widths; restored, green.

Screenshots at 320 and 390 of Ali, his fights page, Usyk, Joe Louis (no photo), Canelo (no record) and
two fights. **Chromium here cannot reach `upload.wikimedia.org`**, so those requests were routed to a
local grey stand-in labelled "STAND-IN IMAGE" — the picture in them is not the real photograph.

### For the owner

- **Open Ali's photo once** (`data/boxers.json`, BX0001 `image`) in a browser before relying on it.
  The verifier recomputed the Commons path and knows the file, but could not load the page from here.
- **The `notes` column is on the card now**, under the record — most of it qualifies the record
  ("Exhibition bouts excluded", "Record disputed — newspaper-decision era"), and that is why. Thirteen
  rows are notes to the editor ("ACTIVE — record needs checking", "… — check") and visitors will see
  them, the way a fight shows "Not checked yet". Reword or clear those cells if you would rather not.
- Fourteen fighters (Canelo, Joshua, Crawford, Inoue among them) have no record in the file and say
  so; filling `wins` / `losses` / `draws` is what puts the scoreboard on their cards.
- More photos are a cell each, with the credit — see the licence rule above.

**To confirm:** the photo beside the name rather than across the card; the fights on a page of their
own; the Highlights tile (a YouTube search, the same thing the fights' Watch tiles do); zeros drawn
faint; the record's notes shown.
