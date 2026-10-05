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
- The credit is printed in small type (`.62rem`) on a line of its own directly under the photo, and
  on the fight card under both faces ("Photo of Muhammad Ali: Ira Rosenberg, …"). A photo that fails
  to load takes its credit with it — a credit under a placeholder names a picture nobody can see.
- **The credit is a link to the photo's Commons file page** (round two, below), because CC BY and
  CC BY-SA ask for a link to the work and its licence, not only a name. Built from the address, so
  it cannot drift; `check-library.js` fails a CC credit on any picture that is not a Commons file.
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
| Tale of the tape | age (living) or born / died with the age he reached, height in cm and feet, reach in cm and inches, stance, every weight when more than one (four or more as `8 · Flyweight → Light Middleweight`), career | only the rows a cell answered |
| Titles / Honours | the sheet's own sentence beside a gold rule; Hall of Fame and lineal as gold badges on the heading's line | headed **Honours** when the row names no belt — "Titles" over a Hall of Fame badge alone read as "never won one" |
| Highlights | a tile under the card: a YouTube search for his name | the fight's Watch, one kind along; a link, so `tile_` draws the anchor |

**His fights are the next pages** (`boxerPart_`, in `pageParts_` as `fights`, `fights2`, …): who he
beat and who beat him as chips on the first, then every bout in `data/fights.json` he is in, **newest
first**, one line each — W/L/D in a square, the opponent, `TKO 14 · 1 Oct 1975 · TITLE` — **seven to
a page**. Pages and not more card because of the owner's standing rule, *"I don't like scrolling ...
This goes for all widgets so they all fit on screen"*. (The first build put all fourteen of Ali's on
one page; on a real 320×568 phone that was drawn at the 70% floor — see round two.) A fighter with
neither notable names nor bouts on file has no fights page — an empty page is the one `pageParts_`
refuses.

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
framed, Ali's credit). Eleven mutations, each red for its own reason and green on restore: the bar's
last segment off by one; the credit taken off; `losses_ko` back to `libN`; a photo drawn without its
credit; the record back to `libN`; the error listener emptied; the failed address not remembered;
bouts oldest first; the result read from the other corner; the winner's frame on the loser; a `Jr.`
taken as a surname (Floyd Mayweather Jr. as `FJ`).

`check/states.js`: *the boxers* now asks for the 4:5 box to the LEFT of the name, the scoreboard in
whole numbers (or "no record on file"), the title size and flag rule, and nothing scrolling sideways;
*the fights* asks for both faces, square, above the flag. Proved by putting the photo back across the
card and the faces back under the title: both states red at all four widths; restored, green.

Screenshots at 320 and 390 of Ali, his fights page, Usyk, Joe Louis (no photo), Canelo (no record) and
two fights. **Chromium here cannot reach `upload.wikimedia.org`**, so those requests were routed to a
local grey stand-in labelled "STAND-IN IMAGE" — the picture in them is not the real photograph.

### For the owner

- **Open Ali's photo once** (`data/boxers.json`, BX0001 `image`) in a browser before relying on it —
  or tap its credit on his card, which now opens its Commons page.
- **36 more photos are waiting for a person with a browser.** Each was proposed with its credit and
  rejected only because nothing here can open Commons. For each: open the link, check the author and
  the licence on the page match the credit, and if they do, put the picture's `upload.wikimedia.org`
  address in `image` and the credit in `image_credit` (the original proposals, addresses included,
  are in the builder's scratchpad as `boxers/patches/r0.json` and `r1.json`). Three are flagged.

| Row | Boxer | Commons file page | Proposed credit |
|---|---|---|---|
| BX0002 | Joe Louis | <https://commons.wikimedia.org/wiki/File:Joe_Louis_by_van_Vechten.jpg> | Photo: Carl Van Vechten, Public domain, via Wikimedia Commons |
| BX0005 | George Foreman | <https://commons.wikimedia.org/wiki/File:George_Foreman_1974_(cropped).jpg> | Photo: Unknown author, Public domain, via Wikimedia Commons |
| BX0006 | Joe Frazier | <https://commons.wikimedia.org/wiki/File:Joe_Frazier_studio_portrait.jpg> | Photo: Unknown photographer, Public domain, via Wikimedia Commons |
| BX0009 | Lennox Lewis | <https://commons.wikimedia.org/wiki/File:Lenox_Lewis_2010_cropped.jpg> | Photo: -nikkon-, CC BY-SA 2.0, via Wikimedia Commons |
| BX0010 | Sonny Liston | <https://commons.wikimedia.org/wiki/File:Sonny_Liston_1962_Portrait.jpg> | Photo: Stanley Weston, Public domain, via Wikimedia Commons |
| BX0013 | Riddick Bowe | <https://commons.wikimedia.org/wiki/File:Riddick_%22Big_Daddy%22_Bowe.jpg> | Photo: Christian Sahm, CC BY 2.0, via Wikimedia Commons |
| BX0014 | Wladimir Klitschko | <https://commons.wikimedia.org/wiki/File:Klitschko-gesf-2018-7931_(cropped).jpg> | Photo: Fuzheado, CC BY-SA 4.0, via Wikimedia Commons |
| BX0017 | Oleksandr Usyk | <https://commons.wikimedia.org/wiki/File:Oleksandr_Usyk_in_Kyiv,_Ukraine_on_31_December_2024_(cropped).jpg> | Photo: President Of Ukraine, CC0, via Wikimedia Commons — **CC0 credited to the President of Ukraine's office, whose photos are usually CC BY 4.0 — check the licence** |
| BX0018 | Anthony Joshua | <https://commons.wikimedia.org/wiki/File:Anthony_Joshua_in_2019.jpg> | Photo: JazzyJoeyD, CC BY-SA 4.0, via Wikimedia Commons |
| BX0021 | Marvin Hagler | <https://commons.wikimedia.org/wiki/File:Marvin_Hagler_in_the_Oval_Office_(cropped).jpg> | Photo: White House Photographic Office, Public domain, via Wikimedia Commons |
| BX0022 | Sugar Ray Leonard | <https://commons.wikimedia.org/wiki/File:Sugar_Ray_Leonard.jpg> | Photo: Kingkongphoto & www.celebrity-photos.com from Laurel Maryland, USA, CC BY-SA 2.0, via Wikimedia Commons |
| BX0025 | Carlos Monzon | <https://commons.wikimedia.org/wiki/File:Carlos_Monz%C3%B3n.JPG> | Photo: Revista Gente y la Actualidad, Public domain, via Wikimedia Commons |
| BX0026 | Julio Cesar Chavez | <https://commons.wikimedia.org/wiki/File:Julio_C%C3%A9sar_Ch%C3%A1vez_2017.png> | Photo: Box Azteca, CC BY 3.0, via Wikimedia Commons |
| BX0029 | Manny Pacquiao | <https://commons.wikimedia.org/wiki/File:Manny_Pacquiao_at_87th_NCAA_cropped.jpg> | Photo: inboundpass, CC BY 2.0, via Wikimedia Commons |
| BX0030 | Bernard Hopkins | <https://commons.wikimedia.org/wiki/File:Bernard_Hopkins_2010.jpg> | Photo: DEWALT POWER TOOLS FIGHT NIGHT CLUB 2010, CC BY 2.0, via Wikimedia Commons — **the "author" is a Flickr account named after an event — check the file page names a photographer** |
| BX0033 | Willie Pep | <https://commons.wikimedia.org/wiki/File:Willie_Pep_1950.jpg> | Photo: Unknown author (Los Angeles Daily News), Public domain, via Wikimedia Commons |
| BX0034 | Henry Armstrong | <https://commons.wikimedia.org/wiki/File:Henry_Armstrong_(Boxer).jpg> | Photo: Otis Historical Archives National Museum of Health and Medicine, CC BY 2.0, via Wikimedia Commons |
| BX0037 | Jake LaMotta | <https://commons.wikimedia.org/wiki/File:Jake_LaMotta_signed_photo_postcard_1952_(cropped).jpg> | Photo: Unknown author, Public domain, via Wikimedia Commons |
| BX0038 | Joe Calzaghe | <https://commons.wikimedia.org/wiki/File:JoeCalzaghe-July2007.jpg> | Photo: Ben Duffy, CC BY 3.0, via Wikimedia Commons |
| BX0041 | Gennadiy Golovkin | <https://commons.wikimedia.org/wiki/File:Gennady_Golovkin_2015.jpg> | Photo: R.J. Cohen, CC BY-SA 2.0, via Wikimedia Commons |
| BX0042 | Juan Manuel Marquez | <https://commons.wikimedia.org/wiki/File:Juan_Manuel_M%C3%A1rquez_2012.jpg> | Photo: presidenciamx, CC BY 2.0, via Wikimedia Commons |
| BX0045 | Christy Martin | <https://commons.wikimedia.org/wiki/File:Christy_Martin_2023.jpg> | Photo: S882019, CC BY-SA 4.0, via Wikimedia Commons |
| BX0046 | Katie Taylor | <https://commons.wikimedia.org/wiki/File:Katie_Taylor_2012_Summer_Olympics_Gown.jpg> | Photo: cormac70, CC BY 2.0, via Wikimedia Commons |
| BX0049 | Max Schmeling | <https://commons.wikimedia.org/wiki/File:Max_Schmeling_NYWTS.jpg> | Photo: Wm. C. Greene, Public domain, via Wikimedia Commons |
| BX0050 | Jersey Joe Walcott | <https://commons.wikimedia.org/wiki/File:Jersey_Joe_Walcott_1937.jpg> | Photo: Sport Photo The Ring 1937, CC BY 3.0, via Wikimedia Commons — **a 1937 photograph under CC BY 3.0, credited to a magazine — almost certainly public domain or mis-credited** |
| BX0053 | Ken Norton | <https://commons.wikimedia.org/wiki/File:Kenny_Norton_(cropped).jpg> | Photo: Pete Susens, CC BY-SA 2.0, via Wikimedia Commons |
| BX0057 | Sam Langford | <https://commons.wikimedia.org/wiki/File:Sam_Langford_LOC.jpg> | Photo: Bain News Service, Public domain, via Wikimedia Commons |
| BX0061 | Barney Ross | <https://commons.wikimedia.org/wiki/File:Barney_Ross_and_Phil_Furr_LCCN2016878288.jpg> | Photo: Harris & Ewing, Public domain, via Wikimedia Commons |
| BX0065 | Emile Griffith | <https://commons.wikimedia.org/wiki/File:Emile_Griffith.jpg> | Photo: Roberto Vicario, CC BY-SA 3.0, via Wikimedia Commons |
| BX0069 | Alexis Arguello | <https://commons.wikimedia.org/wiki/File:Alexis_Arg%C3%BCello.jpg> | Photo: Jorge Mejía Peralta, CC BY 2.0, via Wikimedia Commons |
| BX0073 | Jose Napoles | <https://commons.wikimedia.org/wiki/File:Jos%C3%A9_N%C3%A1poles_c1973.jpg> | Photo: Unknown author (Panini "Campioni dello Sport" card), Public domain, via Wikimedia Commons |
| BX0077 | Felix Trinidad | <https://commons.wikimedia.org/wiki/File:Felix_Trinidad.jpg> | Photo: matt borowick, CC BY 2.0, via Wikimedia Commons |
| BX0081 | James Toney | <https://commons.wikimedia.org/wiki/File:James_Toney.jpg> | Photo: Stoyan Vassev, CC BY-SA 2.0, via Wikimedia Commons |
| BX0085 | Kostya Tszyu | <https://commons.wikimedia.org/wiki/File:Kostya_Tszyu_2008.jpg> | Photo: Uncle Mong, CC BY-SA 2.0, via Wikimedia Commons |
| BX0097 | David Haye | <https://commons.wikimedia.org/wiki/File:David_Haye.png> | Photo: Loura Conerney, CC BY-SA 2.0, via Wikimedia Commons |
| BX0101 | Lucia Rijker | <https://commons.wikimedia.org/wiki/File:Lucia_Rijker_in_training.jpg> | Photo: Nimueva, Public domain, via Wikimedia Commons |

- **Check the cells the builder wrote from memory** (round two, below): the 73 `world_titles`, the six
  records, Tyson's 50-7. Each record's `notes` says "... check against BoxRec"; that keeps the note
  off the card and on `check-library.js`'s list, and clearing it once checked takes it off the list.
- Still blank and saying so: Claressa Shields and Amanda Serrano (the builder was not sure enough of
  their counts), and six old-timers whose records are disputed by design (Jack Johnson, Carnera,
  Langford, Greb, Benny Leonard, Jimmy Wilde). Four rows have no belt on file (Christy Martin,
  Regina Halmich, Lucia Rijker, Holly Holm).

**To confirm:** the photo beside the name rather than across the card; the fights on pages of their
own, seven a page; the Highlights tile (a YouTube search, the same thing the fights' Watch tiles do);
zeros drawn faint; the record's notes shown, the editor's kept off; Sam Langford's nickname.

### Round two — what the review found, and what was done about each

The review of `3140519` read every card as a boxer would and measured all 103 profiles on a real
320×568 phone. Its findings, in its order:

| # | Finding | Done |
|---|---|---|
| 1 | Only one photo of 103 | **Not fixable from here, and not reported as done.** Commons, Wikipedia and upload.wikimedia.org are refused by this machine's proxy and the web search budget is spent, so no licence could be read. The 36 candidates are listed above for a browser. |
| 2 | Notes to the editor on public cards ("ACTIVE — record needs checking" under Usyk's 24-0, Hatton's "date of death needs checking", Fury, Pacquiao, Lomachenko) | `boxerNote_`: a note that says *check* or *checking* is the editor's and is not drawn; every other note still is. `check-library.js` lists the rows that carry one, every run (12 today). Hatton's cleared: 14 Sep 2025 is right. |
| 3 | "TITLES" over a Hall of Fame badge alone on 56 cards — Tyson, Mayweather, Holyfield… | The heading is **Honours** when the row names no belt. And `world_titles` filled for 73 champions, so 99 of 103 rows now name their belts. The Hall of Fame badge rides the heading's line. |
| 4 | Current stars with no record — Canelo, Joshua, Wilder, Crawford, Inoue, Katie Taylor… | Six filled, each `record_as_of` the date of a bout the builder is sure of, so the card's "Record as of 13 Sep 2025" is true on that day whatever has happened since: Canelo 63-3-2 (39 KO), Crawford 42-0 (31), Joshua 29-4 (26), Wilder 44-4-1 (43), Taylor 24-1 (6), Inoue 31-0 (27). Shields and Serrano left blank. |
| 5 | Shrinks to fit on a real small phone: Pacquiao's profile at 72%, Ali's fights page at the 70% floor, the credit at about 6px | Bouts **seven a page** (`fights`, `fights2`, …); four or more weights fold to `8 · Flyweight → Light Middleweight` by the weight ladder; the credit `.62rem` and a full-width line under the photo rather than a four-line caption in its column; the badges on the heading's line; the tape's rows `.22rem` apart. **Measured, all 103 at 320×568: no fights page shrinks now (Ali's were 70%); profiles 83–100%, median 98%** (Pacquiao 85%, Ali 86%); none scrolls, nothing overflows; at 390×844 nothing shrinks. 55 profiles still shrink a little — mostly the belts now filled in — and that is the designed shrink-to-fit, well clear of its floor. |
| 6 | The credit does not link to the source, which CC BY / BY-SA need | The credit **is the link**, to the file page built from the picture's own address (a thumbnail's `480px-` prefix is not part of the name); a 44px block, so it is a tap target like any other. `check-library.js` fails a CC credit on a picture that is not a Commons file. |
| 7 | Fight card dates in ISO; De La Hoya as `OH`; `aria-label` on a bare span | The fight card's date is `boxerDate_`'s; a surname may start with De / La / Del / Van / Von / Da / Di / Du / Le / Der / Den (`OD`); the W/L square is `aria-hidden` and a hidden word ("Won, ") is what a screen reader reads. |
| 8 | Data that predates the branch | Tyson's 2024 Jake Paul fight was a sanctioned professional bout: 50-7 (5 KO losses), active to 2024, and his note now says the Paul fight counts. Pacquiao–Márquez I is `SD` (a split draw), not `MD`. Sam Langford is shown as "The Boston Bonecrusher" — owner to confirm. |

**Nothing was rejected outright.** Finding 1 is the one that cannot be done here, and the reason is the
network, not a disagreement.

**From the builder's own knowledge, not from a page.** Every value in findings 3, 4 and 8 — the belts,
the six records, Tyson, the split draw, the nickname — was written without a source opened this run,
because none could be. They are the well-known facts of well-known careers, written conservatively
(the belts in the sheet's short style, the records dated to a named fight), and four rows the builder
was unsure of were left blank rather than guessed. They are still a list to check, above.

**Checked.** `check-flow.js`: a fifth journey, *every fighter's card*, asks all 103 rows for the three
reading faults (no editor's note, every qualifying note, Titles only over a title, the weights folded
by the ladder); the fights journey asks for seven a page, every page full but the last, the range in
each heading, the names on the first page only, a word for a screen reader and the square hidden from
it, and the fight card's date; the photo journey asks for the credit as a link to the right file page
on both cards; the no-photo journey for `OD` and three particle names the file does not hold.
`check-library.js`: the CC rule and the to-do list. `check/states.js`: *a boxer photo's credit*, a
44px link under the photo and across the card, its words at least `.62rem`, at every width — proved
by taking the 44px floor off `a.boxer-src` in a copy: the state red at all four widths for both
visitors; restored, measured. (This browser cannot load the photo, so the state puts the credit line
back with the card's own `boxerCredit_` and fits the pane again before measuring it.)

`check/ui.js` learned one thing. The screen-reader word on each bout (`.boxer-say`: 1px,
`overflow: hidden`, `clip-path: inset(50%)`) was reported as a 24px SIDEWAYS SCROLL on every width.
That is the visually-hidden pattern working, so a box clipped to nothing and no wider than a pixel is
now the third way of being "told it could", beside the ellipsis; the first run, before the
exemption, is the red.
**Fifteen mutations**, each red for its own reason and green on restore (run in a copy of the tree):
the editor's notes printed; every note hidden; always "Titles"; the weights never folded; the cell's
order instead of the ladder; one page of fourteen; the names on every page; the credit not a link;
the file page named from the thumbnail; the fight card's ISO date; the particle ignored; no word for
a screen reader; the square read out as well; a failed photo keeping its credit; a CC credit on a
Drive picture.

**Screenshots** at 320×568 and 390×844 (real device heights this time) of Ali, both his fights pages,
Pacquiao and his two, Tyson, Usyk, Canelo, Hatton, De La Hoya, Calzaghe (the most shrunk), Langford,
Christy Martin (Honours), and two fights. Commons was routed to the same grey stand-in as before.
