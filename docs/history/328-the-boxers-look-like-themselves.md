## The boxers look like themselves: an eight-bit likeness from what sources show, in the trunks of that night

**The owner, 10 Oct:** *"make the boxers retro avatar actually look more like the boxers and their shorts
in the fight."*

### What it was

Every boxer's card and every fight card has a ring under the photo — the placeholder that is there before
the photo arrives and all that is left if it never does. In it stood **the loading screen's gold fighter**,
`tools/boxing.py`'s guard pose painted by the "box" splash's `.bx-*` rules: the same paths for all 103
fighters, gold trunks in the red corner and blue in the blue, his initials over the ropes. The comment over
`BOXER_GUARD` defended it on purpose — *a stand-in that looked like a person would be a picture of the wrong
man.*

### What it is now

**A LIKENESS, AND ONLY AS MUCH OF ONE AS A SOURCE SHOWS.** The answer to the old worry is to draw nothing
nobody can vouch for: his skin, from six tones; his hair, as one of thirteen small pixel shapes in one of
eight colours; a moustache, goatee, beard, stubble or sideburns over the face; and his **trunks** — the pair
he usually wore on his profile, and **the pair from that night** on a fight card, the trim as the waistband
and a side stripe. Eight bits is the honest resolution for it: enough to tell Ali's white-and-black from
Frazier's green-and-gold, not enough to pretend to be a portrait.

**ONE RENDERER.** `boxerFigure_(look, trunks, blue)` in find.js draws the guard pose from rows of game
pixels (`BOXER_BODY`, `BOXER_HAIR`, `BOXER_FACE`, written as `y:x0-x1` runs on the old grid, so the fighter
stands exactly where and how he did). The whole head is painted in skin first and the hair laid over it, so
a faded side or a cornrow's parting shows scalp without any subtraction. Bald and shaved are the head alone;
the afro is taller and wider; dreads hang as separate locks with the background between them; leopard is
two tones. The blue corner is the same drawing mirrored, facing his opponent.

**THE COLOURS ARE THE FIGURE'S OWN**, named on `.boxer-ring` in style.css and nowhere else — six skins,
eight hair colours, seventeen trunk colours and the leopard's spot (`--bf-s4`, `--bf-hc-black`,
`--bf-tk-maroon`). They belong to one drawing, so they are not `:root` tokens (the chess board's rule), and
none is a paper colour. The renderer points each part at one through a custom property on the fighter's
group, and every rule falls back to the old stand-in's colour when the property is not set. Black is a
charcoal one step off the card, or Tyson would be a face and a pair of legs; the deepest skins are lifted a
little for the same reason.

**A BLANK IS THE OLD STAND-IN'S PART.** A fighter with no look is exactly the gold fighter every card had
before. A fight with no trunks on file is the corner's colour — **not** the fighter's usual pair, because
"he usually wore white" is not a source for what he wore that night. One exception, found on the screen:
on a fighter we *can* describe, a hair colour nobody stated is his own skin a shade darker (`.bf-seen`),
because the stand-in's grey on Deontay Wilder read as a grey-haired man and its gold in the blue corner as a
blond one — claims made by a fallback.

**IT NO LONGER MIRRORS THE SPLASH.** Another builder is retiring the "box" splash (it teaches nothing), and
the cards must not lose their fighter with it. So the ring, the figure and every colour are `bf-*` in
find.js and under `.boxer-ring` in style.css. **The cards need none of the splash's `.bx-*` rules** — not
`.bx-skin`, `.bx-post`, `.bx-rope`, `.bx-l .bx-trunks` or any other — and none of its `--bx-mat`: the mat is
`--bf-mat` on `.boxer-ring`. The splash's own block was left untouched on this branch so the two merges do
not collide; the one line in it that still names `.boxer-ring` (`.bx-ring, .boxer-ring { --bx-mat: … }`)
sets a property the cards no longer read, and goes with the splash.

### The data, and how sure it is

`data/boxers.json` gained `look_skin`, `look_hair`, `look_hair_colour`, `look_facial`, `trunks_usual` and
`look_source`; `data/fights.json` gained `trunks_a`, `trunks_b` and `trunks_source`. **Only research marked
high or medium was written in**; every filled row says where its values came from and how sure each is.

| | high | medium | blank |
|---|---|---|---|
| skin (103) | 0 | 103 | 0 |
| hair (103) | 0 | 89 | 14 |
| hair colour (103) | 0 | 93 | 10 |
| facial hair (103) | 0 | 62 | 41 |
| usual trunks (103) | 16 | 7 | 80 |
| **the boxers, 515 values** | **16** | **354** | **145** |
| **the fights, 314 corners** | **44** | **22** | **248** |

44 of the 157 fights have at least one corner's trunks, 22 have both. Three corners came from the looks
research rather than the fight research, each from a source naming the bout: LaMotta's black-and-white at the
St Valentine's Day Massacre and Robinson's white-and-black in the second Basilio fight (fight-worn lots, high),
and Liston's white-and-black in Clay–Liston I (a photo caption, medium). The two researchers disagreed on one
corner, Frazier in Manila — "blue" against "navy" from the same ESPN words, *dark blue trunks with white
trim* — and it is navy/white, the vocabulary's dark blue.

**WHY SO MANY BLANKS, AND WHY THE LOOKS ARE ALL MEDIUM.**

- **No photograph was opened.** Wikipedia, Commons and every page fetch failed from the research machine,
  so skin, hair and facial hair are **from memory of widely published photographs, not re-checked against a
  picture**. That is why none is high, and a less-photographed fighter's skin may be a step off on the scale.
  They are the first thing to check against a photo.
- **The search allowance ran out** (200, shared by every researcher in the run). Jack Johnson, Tunney,
  Schmeling and Armstrong were never searched for trunks, and Monzon v Napoles not at all.
- **Black-and-white film.** Nearly every fight before 1962 is blank unless a fight-worn lot or a museum
  record names the colour.
- **Trunks that changed every night.** Chavez, Pacquiao, Mayweather (*"Mexican colours"* v De La Hoya) and
  Inoue, who says so himself, have no usual pair.
- **Blank on purpose.** Liston's usual pair has two sources that disagree; Buchanan's tartan and Chavez's
  teal are not words the figure has; Eubank's yellow comes only from a shop's blog; Benn's black is from a
  caption that does not say which Eubank fight; Jones v Toney's source is cut off at *"wearing whi…"*.

The opponents with no row of their own (52 corners) have no look and are the old stand-in — still in that
night's trunks when a source names them, as Cleveland Williams is in black.

### What guards it

- **`js/check-library.js`** holds every look and trunks cell to `BOXER_LOOK` — cut out of find.js, the same
  list the figure draws from, so the two cannot disagree — refuses a misspelt column, a filled cell with no
  source, and a word in the list with no shape in find.js or no colour on `.boxer-ring`. Mutations: trunks
  `white/black` → `whte/black` on Ali's row turned it red; so did taking `--bf-tk-maroon` out of style.css.
- **`js/check-flow.js`**, *the eight-bit fighter*: all 103 profiles wear exactly their row's words and no
  word for a blank; the Fight of the Century is red/white against green/gold with each man's own skin and
  hair and **not** Ali's usual pair; Johnson v Jeffries, with nothing on file, carries no trunks colour, and
  the stylesheet's gold and blue fallbacks are asked of style.css itself; a misspelt word in a copy draws the
  corner's colour, not half a look.
- **`check/states.js`**, measured by `check/ui.js` at every width as both visitors: *a boxer who looks like
  himself* (Lennox Lewis — the computed fill of skin, dreads, goatee and white trunks against the palette, the
  locks hanging below the old cap and inside the frame) and *a fight in that night's trunks* (Ali v Frazier
  1971 in the colours a browser actually paints, facing each other, and a blank corner drawn beside them
  painted gold and blue).

- **`check/cascade.js`** found the first draft settling two things by file order alone: the middle rope
  carried both `bf-rope` and `bf-rope-mid` (two rules of one weight on one element, 22 of them), and
  `.bf-seen .bf-hair` tied `.bf-r .bf-hair` on a described fighter in the blue corner. The middle rope has
  its own class now and the shadow rule is a class heavier, so specificity decides both. Putting the double
  class back turns it red again.
- **The side stripe** was drawn down the middle of the trunks first; in the enlarged sheet it met the gap
  between the legs and read as the gap reaching up. It runs down the near leg.

Looked at enlarged at 320 and 390: Ali, Tyson, Frazier, Lewis and Naseem Hamed's profiles; Ali v Frazier
1971, the Rumble in the Jungle and Lewis v Tyson.
