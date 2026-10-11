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
group, and every rule says what a part nobody recorded is when the property is not set. **Every colour
clears 2:1 against the dark the fighter stands in** (`bf-stage`) — see the review below for why, and for
the black that is blacker on the face.

**A BLANK CLAIMS NOTHING** — rewritten after the review below, which found the first version's blanks
(the old stand-in's parts) making claims. A fighter with **no row** is a silhouette: skin and hair in one
shadow tone, `--bf-ghost`. A fight with **no trunks on file** is the corner's colour **muted** — a dusky
ochre or slate no trunks word uses, the waistband the same colour darker, no side stripe — and **not** the
fighter's usual pair, because "he usually wore white" is not a source for what he wore that night. On a
fighter we *can* describe, a hair colour nobody stated is his own skin a shade darker (`.bf-seen`),
because the stand-in's grey on Deontay Wilder read as a grey-haired man and its gold in the blue corner as a
blond one — claims made by a fallback.

**A WOMAN WEARS A TOP.** Nine rows are `sex` F; the guard pose is a bare torso, and nothing read `sex`
until the review. She wears a crop top in her trunks' colour (`BOXER_BODY.top`), and with no hair on file
she has hair drawn back to a knot (`BOXER_HAIR_UNSAID.F`), not the men's short cap. A corner with no row
is a woman when the other corner is one.

**IT NO LONGER MIRRORS THE SPLASH.** Another builder is retiring the "box" splash (it teaches nothing), and
the cards must not lose their fighter with it. So the ring, the figure and every colour are `bf-*` in
find.js and under `.boxer-ring` in style.css. **The cards need none of the splash's `.bx-*` rules** — not
`.bx-skin`, `.bx-post`, `.bx-rope`, `.bx-l .bx-trunks` or any other — and none of its `--bx-mat`: the mat is
`--bf-mat` on `.boxer-ring`. The splash's own block was left untouched on this branch so the two merges do
not collide; the one line in it that still names `.boxer-ring` (`.bx-ring, .boxer-ring { --bx-mat: … }`)
sets a property the cards no longer read, and goes with the splash.

### The data, and how sure it is

`data/boxers.json` gained `look_skin`, `look_hair`, `look_hair_colour`, `look_facial`, `trunks_usual` and
`look_source`; `data/fights.json` gained `trunks_a`, `trunks_b` and `trunks_source`. Trunks are written
only from research marked high or medium, and **a fight's corner only from a source that names that
bout**. The looks are written and drawn, but labelled **unverified**: judged from memory, no photograph
opened. Every filled row says where its values came from and how sure each is.

| | high | medium | unverified | blank |
|---|---|---|---|---|
| skin (103) | 0 | 0 | 103 | 0 |
| hair (103) | 0 | 0 | 89 | 14 |
| hair colour (103) | 0 | 0 | 93 | 10 |
| facial hair (103) | 0 | 0 | 62 | 41 |
| usual trunks (103) | 16 | 7 | 0 | 80 |
| **the boxers, 515 values** | **16** | **7** | **347** | **145** |
| **the fights, 314 corners** | **44** | **9** | **0** | **261** |

36 of the 157 fights have at least one corner's trunks, 17 have both. (The first commit wrote 66 corners
in 44 fights; 13 came out in the review — see below.) Three corners came from the looks
research rather than the fight research, each from a source naming the bout: LaMotta's black-and-white at the
St Valentine's Day Massacre and Robinson's white-and-black in the second Basilio fight (fight-worn lots, high),
and Liston's white-and-black in Clay–Liston I (a photo caption, medium). The two researchers disagreed on one
corner, Frazier in Manila — "blue" against "navy" from the same ESPN words, *dark blue trunks with white
trim* — and it is navy/white, the vocabulary's dark blue.

**WHY SO MANY BLANKS, AND WHY THE LOOKS ARE ALL MEDIUM.**

- **No photograph was opened.** Wikipedia, Commons and every page fetch failed from the research machine,
  so skin, hair and facial hair are **from memory of widely published photographs, not re-checked against a
  picture**. They were first labelled medium; they are **unverified** now, and check-library refuses high
  or medium on a look field whose source names no photograph (`photo checked: <url>`). A
  less-photographed fighter's skin may be a step off on the scale. They are the first thing to check
  against a photo — start with the 37 rows that already carry a Commons image.
- **The search allowance ran out** (200, shared by every researcher in the run). Jack Johnson, Tunney,
  Schmeling and Armstrong were never searched for trunks, and Monzon v Napoles not at all.
- **Black-and-white film.** Nearly every fight before 1962 is blank unless a fight-worn lot or a museum
  record names the colour.
- **Trunks that changed every night.** Chavez, Pacquiao, Mayweather (*"Mexican colours"* v De La Hoya) and
  Inoue, who says so himself, have no usual pair.
- **Blank on purpose.** Liston's usual pair has two sources that disagree; Buchanan's tartan and Chavez's
  teal are not words the figure has; Eubank's yellow comes only from a shop's blog; Benn's black is from a
  caption that does not say which Eubank fight; Jones v Toney's source is cut off at *"wearing whi…"*.

The opponents with no row of their own (53 corners) have no look and are a silhouette — still in that
night's trunks when a source names them, as Cleveland Williams is in black.

### What guards it

- **`js/check-library.js`** holds every look and trunks cell to `BOXER_LOOK` — cut out of find.js, the same
  list the figure draws from, so the two cannot disagree — refuses a misspelt column, a filled cell with no
  source, and a word in the list with no shape in find.js or no colour on `.boxer-ring`. Mutations: trunks
  `white/black` → `whte/black` on Ali's row turned it red; so did taking `--bf-tk-maroon` out of style.css.
- **`js/check-flow.js`**, *the eight-bit fighter*: all 103 profiles wear exactly their row's words and no
  word for a blank; all nine women are `bf-f`, wear the top, and with no hair on file are never given the
  men's cap, and no man wears a top; the Fight of the Century is red/white against green/gold with each
  man's own skin and hair and **not** Ali's usual pair; Johnson v Jeffries, with nothing on file, carries no
  trunks colour, and the stylesheet's silhouette and muted-corner fallbacks are asked of style.css itself;
  Laila Ali v Frazier-Lyde puts both women in a top; a misspelt word in a copy draws a blank's part, not
  half a look. Mutations: the renderer ignoring `sex`, `fightCard_` not passing it to a corner with no row,
  and the women's unsaid hair set to the short cap each turned it red.
- **`js/check-library.js`** also holds every look cell to a label in `look_source` — unverified, or high or
  medium only with `photo checked: <url>` and never from memory. Mutation: Ali's `skin unverified` →
  `skin medium` turned it red.
- **`check/states.js`**, measured by `check/ui.js` at every width as both visitors: *a boxer who looks like
  himself* (Lennox Lewis — the computed fill of skin, dreads, goatee and white trunks against the palette, the
  locks hanging below the old cap and inside the frame); *a fight in that night's trunks* (Ali v Frazier
  1971 in the colours a browser actually paints, facing each other, and a blank corner drawn beside them
  painted the corner's muted colour, no stripe); *a fighter with no row is a silhouette* (Berbick beside
  Tyson: skin and hair one shadow tone, neither paper nor gold nor any skin); and *every colour of the
  eight-bit fighter shows against the stage* (every skin, hair colour and trunks colour, the silhouette and
  both unrecorded pairs at 2:1 or more against `bf-stage`, a black beard 2:1 on every skin, Tyson's own
  hair and trunks, and the unrecorded pairs 50 or more from every trunks word). Mutations: black hair back
  to #2e2925 (1.37:1), the skin fallback back to `--paper`, the blue fallback back to the corner blue (40
  from sky) and the beard back in the lifted black (1.06:1 on s6) each turned one red.

- **`check/cascade.js`** found the first draft settling two things by file order alone: the middle rope
  carried both `bf-rope` and `bf-rope-mid` (two rules of one weight on one element, 22 of them), and
  `.bf-seen .bf-hair` tied `.bf-r .bf-hair` on a described fighter in the blue corner. The middle rope has
  its own class now and the shadow rule is a class heavier, so specificity decides both. Putting the double
  class back turns it red again. (The blue corner's gold-hair rule went in the review — the silhouette has
  one hair colour in both corners — and the black-beard rule, `.bf-hc-black .bf-face`, is a class heavier
  than `.bf-face` for the same reason.)
- **The side stripe** was drawn down the middle of the trunks first; in the enlarged sheet it met the gap
  between the legs and read as the gap reaching up. It runs down the near leg.

Looked at enlarged at 320 and 390: Ali, Tyson, Frazier, Lewis and Naseem Hamed's profiles; Ali v Frazier
1971, the Rumble in the Jungle and Lewis v Tyson.

### The review of 10 Oct, and what it changed

A review of the first commit took the figures apart at 4x with photos blocked and read the sources
corner by corner. Seven findings; what happened to each:

1. **The women were bare-chested men.** All nine `sex` F rows were the bare torso in their own skin —
   Taylor's ponytail, Martin's pink trunks, topless — and seven with no hair on file got the men's cap.
   *Fixed:* the top and the drawn-back hair above; a no-row opponent of a woman is a woman.
2. **A corner with no row claimed a skin and a hair colour.** The stand-in's paper skin and blue-corner gold
   hair, dressed in real trunks beside a described opponent, made Cleveland Williams, Trevor Berbick, Andy
   Ruiz, Michael Moorer and Benny Paret a pale blond man. *Fixed:* the silhouette. One cost, seen on the
   enlarged sheet: the two no-row corners in **black** trunks (Williams, Berbick) show them only faintly
   against the silhouette's grey — the grey is chosen to clear the muted trunks most such corners wear.
3. **Dark parts vanished.** Black hair 1.29:1 against the stage, black trunks 1.40:1, the deepest skin
   1.97:1, a black beard on it 1.53:1. *Fixed, not as the review suggested:* it offered raising the
   backdrop, and the arithmetic says no — a backdrop bright enough to lift black to 2:1 is the brightness of
   the middle skins (s3–s5) and the grey and silver trunks, which would sink instead. So the gold light now
   ends above the top rope, the ring draws the dark behind the figure (`bf-stage`, `--raised`), black, dark
   brown, navy and maroon are lifted to just over 2:1 against it, no skin is lightened, and a black beard is
   drawn in a deeper black (`--bf-fh-black`) because it sits on skin.
4. **The marquee bouts have no trunks** — Mayweather–Pacquiao, Fury–Wilder, Fury–Usyk, Klitschko–Fury,
   Canelo–GGG — and Mayweather, Pacquiao, Fury and Canelo no usual pair. *Not fixed:* the search allowance
   for the run was spent and every source host was blocked from this machine, so no fight-night source
   could be found, and a guess is not one. **This is the owner's "their shorts in the fight" for the
   fights he most likely means, and it is still open.**
5. **Unknown trunks looked researched.** Gold or blue with the ink waistband read as gold/white or
   sky/white; 80 profiles wore it, and Sanchez's real sky/white beside Gomez's blank was one light blue
   twice. *Fixed:* the muted corner colour above, held 50 or more from every trunks word.
6. **Thirteen fight corners were a fighter's usual pair**, their own sources saying so — Tyson's
   "trademark black … no fight-night source pulled" (FT0065, FT0078, FT0079), Douglas's "signed product,
   not a fight-night source" (FT0065), Holyfield's purple "not stated for this fight by name" (FT0079,
   FT0080, FT0082), Martin's pink likewise (FT0103), Holmes and Cooney's commemorative pair (FT0052),
   McGuigan's UN colours "not this bout by name" (FT0058), Bowe's robe and an unnamed lot (FT0068), and a
   dealer's "similar to those worn" for Louis (FT0008) — the one Joe Louis contradicting his own row, which
   says his fights cannot be fixed without colour film. *Fixed:* the build writes a corner only when its
   source names the bout, refuses those sources' own words for "not this fight", and asserts these 13 are
   blank: 53 corners (44 high, 9 medium) in 36 fights, 17 with both.
7. **No look has a checkable source.** All 103 said "judged from memory … no photo was re-checked" and were
   labelled medium. *Relabelled, not verified:* every look is **unverified** in `look_source` and
   check-library now refuses the old label. The values are still drawn — blanking them would put every one
   of the 103 back to a silhouette, and the review offered either. Checking them against photographs
   could not be done from here (every photo host blocked) and is the first thing to do before trusting a
   skin tone.

Looked at enlarged at 390 after the review: the nine women's profiles, Tyson, Joshua, Lewis, Hearns,
Mayweather; and sixteen fights — Taylor v Serrano, Ali v Frazier-Lyde, Martin v Gogarty, Shields v
Marshall, Ali v Williams, Tyson v Berbick, Tyson v Douglas, Foreman v Moorer, Joshua v Ruiz II, Griffith v
Paret III, Sanchez v Gomez, the Fight of the Century, Mayweather v Pacquiao, Holm v Martin, Johnson v
Jeffries, Louis v Schmeling II.
