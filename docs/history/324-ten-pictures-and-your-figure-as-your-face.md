## Ten pictures and your own figure, chosen like an Xbox gamerpic, drawn by one function everywhere a face is

**The owner, 10 Oct:** *"everybody profile picture selector should have 10 basic profile pics like xbox
dp selector, which allow you to use your avatar as a dp."*

### What a person now sees

The picture card on Settings (`photoPicker_`, me.js) keeps its square preview, **Choose photo** and
**Remove**. Under them is a grid of eleven choices, the way the Xbox gamerpic picker lays them out:

1. **Your own figure first.** This is the wardrobe figure, drawn live by `avatarFor`, so it wears
   whatever the wardrobe card has on it.
2. **Then ten pictures.** A fox, an owl, a cat, a dinosaur, a robot, a rocket, a planet with a ring, a
   football, a guitar and a paint palette.

A tap saves straight away, as Choose photo does, and the card's own Save does not touch it. A gold ring
marks the one in use, and `aria-pressed` follows the ring. The line under the grid says what happened:
"Saved. The fox is your picture." A tap on the one already in use sends nothing.

Every role draws this card: student, parent, tutor and admin. Every role's group list names `photo`.

**The grid is four to a row at 320 and six from 294px.** Each cell is 44px or more, in px, because it is
a tap target. A 320 card has about 248px inside it, which fits four 56px cells, so the rows are 4, 4 and
3. From 294px, which is six 44px cells plus their gaps, it is six to a row: 6 and 5. The container query
asks the picker's own width, because the same card is a whole phone column at 390 and a third of the
screen at 1280. The choices are buttons, not tiles: they are the answer being chosen, as the keypad's
keys and the wardrobe's own squares are.

### The ten pictures are our own

They are drawn in `PFP_ART` (links.js), one subject each on a round coloured ground, on a 48-unit square.
Nothing in them is finer than about a unit and a half, because the smallest place a face is drawn is the
2rem disc in a message head, about 30px.

Their colours are written into the drawings and nowhere else. CLAUDE.md says a colour that belongs to
one component is defined on that component, so none of them is a `:root` token and none is a paper
colour. `check-css.js` now fails on either: a `--pfp-…` token on `:root`, or any `:root` token's hex
used in a drawing.

**The figure as a picture** is `avatarFor(…, { bust: true })`. It is the same drawing cropped to
`4 4 40 40`, crown to mid-chest, on a round ground of its own (`AV_BUST_GROUND`), and clipped so a cape
or a raised wand stays inside the circle. The clip needs an id, and the same person can be on three
cards at once, so each drawing takes the next number (`AV_CLIP`).

### What is stored: a token, decided from the backend

The `photo` cell could not simply hold a picture's name. Every reader drew it as an `<img>`:
`findCard`, the post face, the message head and the picker. A name would have been a broken square on
every phone. `savePhoto` also refused anything that was not a `data:image`.

So the cell now holds one of three things:

- a link, as before (an upload's Drive address, or one an admin pasted);
- nothing, which draws the initial;
- one of **eleven tokens**: `pfp:avatar`, and `pfp:fox` and so on for the ten pictures.

The list is `PFP_CHOICES` in constants.gs. `check-profile.js` holds it equal, and in the same order, to
the phone's `PFP_ART`.

There is one judge of the cell, in core.gs:

- `photoChoice_` answers the token or nothing. It trims and lower-cases, so ` PFP:Owl ` typed into the
  sheet is kept as `pfp:owl`.
- `photoRefusal_` allows a link, nothing or a token. `updateProfile` asks it of any `photo` it is sent.
  That door had no check at all before this.

`savePhoto` takes `choice` beside `data` and `remove`. A choice that is not exactly one of the eleven is
refused by name with the cell as it was. A link at that door is still refused, because the grid never
sends one.

All four stamps were bumped together to `2026-10-10-h-pictures`.

### One function draws every face

`personFace_(who, o)` is in links.js. `who` is `{ pic, avatar, handle, name, personId }`. It draws:

- **a photograph** as the same `<img>` through `pic()` that every surface drew before;
- **a picture** as its drawing;
- **the figure** as the bust. Yours is always drawn from `USER.avatar`, so the hat you put on a moment
  ago is on your card now. Anybody else's is drawn from the `avatar` the server sent beside their face.
- **nothing**, as the initial.

`picKind_` treats anything else as no picture at all. That includes a token this phone does not know,
and the wardrobe string, which an older backend put in a post's face.

Every face found goes through it:

- `findCard`: your card, every tutor and admin, your family's cards, and an admin's everyone;
- `meCard`'s fallback;
- the post author (`postCard_`);
- the message head (`dmFace_`);
- the picker's own preview.

**The preview of no picture is the initial now.** Before, the preview showed your dressed figure, on
your own screen only, while the card everybody else saw drew the initial. The figure is now a picture
you can actually choose, for everybody.

**Places that draw a person but are left alone:**

- **The friend card** on Find still draws the full wardrobe figure. The `students` list it reads carries
  no face, and adding one would send a child's picture to every student (rule 4 below).
- **The booking roster** draws a figure seeded from the typed seat name. It is not anybody's chosen
  picture and has no person behind it to look up.
- **`image2` on a job** (the confirmed tutor's photo) is sent and read nowhere.

### The figure goes with the face only when it is the face

`pfp:avatar` can only be drawn for somebody else if their wardrobe string comes too. `faceFig_(r)` in
core.gs adds `avatar` to a row only when the cell is `pfp:avatar`. That covers `tutors`, the admin's
`everyone`, `familyOf_`'s family cards, and a post's `figure`. Everybody who chose a photo or a fox sends
exactly what they sent before.

`accountPages_` rebuilt the family card without that field, so a child who chose their figure was an
initial on their parent's column. The student journey below found this, and it is fixed: the row now
carries `avatar` from the same source as `image`.

**The post face was broken for anybody with a dressed figure.** It was
`S(pp.avatar) || S(pp.photo)`, which puts the wardrobe string ahead of the photograph. It is now the
`photo` cell, plus `figure` when that cell is the figure. `picKind_` also reads the old string as no
picture, so the new phone shows the brand's mark there instead of a broken square, on either backend.

### A child's privacy is unchanged

- A child's choice reaches their family and the admin. Both are already sent that child's face.
- `payload.students`, which goes to every student for the friend search, carries exactly the keys it
  carried before. A stranger is sent nothing of the child.
- **A dressed child's photograph still does not reach the feed.** Under the old line, a dressed child's
  post sent the wardrobe string in place of the photograph: broken, but private. Fixing the line
  naively would have put that photograph on a public page. So for a child, a link goes on a post only
  where it went before, meaning no figure dressed. A token goes always, because a fox, or a figure the
  old line already sent, says nothing about the child.
- **A child is anybody who holds `student`**, asked with `hasRole(pp, 'student')`, the same test the
  privacy-gated `students` list uses. The first version asked `toAppRole(mainRole(pp)) === 'kid'`, and
  that let a child with a second role through. See "After review" below.

### Until the backend is pulled, a tap fails out loud

A server from before this answers `choice` with "That is not a picture. Choose a photo from your
phone." and writes nothing. The picker then:

- puts the old picture back in the preview, and the ring back where it was;
- keeps the server's sentence on the line and adds "Your picture is unchanged.";
- adds "The server has not been updated for the pictures yet; until it is, a photo still works.",
  because the payload's stamp is a date older than `2026-10-10-h-pictures`. A stamp that is not a date,
  such as the lab's `fixture`, is never called old. This hint is for a tap in the grid only: a refused
  photograph or Remove is the old server's own door, and its own sentence already says why.

`pfpTake_` also writes `USER.photo` now, and repaints the You column. A parent's new photo used to stay
off their own card until they signed in again, because that card is built from `USER.photo` and nothing
wrote it.

### Checks

**`check-profile.js` §12b** runs the real `doPost` and `doGet` over an in-memory sheet:

- all eleven tokens are kept exactly, and `PFP:Owl` is kept as `pfp:owl`;
- a link at the grid's door, `pfp:unicorn`, `pfp:`, a bare `fox`, two tokens and markup are each
  refused, with nothing written;
- a choice with no token is refused;
- the admin's editor keeps a token, a link and a blank, and refuses a sentence, `pfp:unicorn` and
  `javascript:`;
- a visitor gets the tutor's figure with `pfp:avatar` and no figure with the guitar;
- the child's family card and the admin's everyone card carry the figure;
- the `students` list keeps its shape, the stranger gets nothing, and the feed carries the token and
  never the dressed child's photo;
- the phone's list equals the backend's list.

That is 33 rules.

**`check-flow.js`** has four journeys, one per role. Each one chooses the figure, then a picture
(fox / cat / robot / rocket), then a photo, then Remove. After each step it asks about:

- the request that left the phone;
- `USER.profile`;
- the ring and `aria-pressed`;
- the line under the grid;
- the preview;
- your own card as the app repainted it;
- one surface somebody else sees, drawn as that person from the row `doGet` sends them: the parent's
  column for the student, the child's message head for the parent, a visitor's people column for the
  tutor, the feed for the admin.

The journeys also check that the figure is live after a change of shirt, and that a repeat tap sends
nothing. A fifth journey plays a server from before this deploy.

**`check-css.js` 7c** covers the pictures' palette.

**`check/states.js`** has two new states, measured by `check/ui.js` at every width:

- `your picture, the eleven at rest`: eleven, the figure first, each 44px or more, none ringed, the
  initial in the preview, the line under the grid, Remove off. It counts how many sit on each row:
  4/4/3 under 294px and 6/5 from it. A row count alone would pass 5/5/1, which is the orphan this
  layout exists to avoid;
- `your picture, the fox chosen`: the fox filling the preview, the ring on the fox alone, Remove live.

**`check/fixture.json`** now sends what `doGet` sends:

- Ada, on `tutors` and on her post, chose her figure;
- Evie, on `everyone`, chose the fox;
- Carl, on `everyone`, chose his figure.

`check-payload.js` failed until it did, because the new keys were on no fixture row.

**Mutations.** Each check went red, and was green again once the change was put back:

- `photoChoice_` accepting any `pfp:` → four refusals red.
- `faceFig_` always sending the figure → "the reply to pfp:fox carried avatar".
- Dropping the child-photo guard on posts → "a dressed child's photograph was put on the public feed".
- `image` added to `students` rows → "another student was sent the child's picture".
- Dropping `photoRefusal_` from `updateProfile` → three red.
- A picture added to `PFP_ART` only → "one list, in one order".
- The `basic` branch of `personFace_` removed → every journey red at its picture step: preview, own card
  and other surface.
- `pfpTake_` not repainting the You column → "your own card is not on the You column".
- The own figure drawn from the row instead of `USER.avatar` → the live-shirt line red for the tutor and
  the admin. Their rows are the stale ones; a parent's and a student's row is built from `USER`.
- The old `pic(p.avatar)` post face → "src=pfp:avatar".
- `dmFace_` looking at tutors only → the parent's three steps red.
- The refusal path not restoring → the fifth journey red on four lines.
- The stamp hint off → red on one line.
- `#f4f1e8` painted into the fox, or a `--pfp-fox` token on `:root` → `check-css` red.
- Five to a row and no ring in the CSS → both new states red at 320 in `check/ui.js` ("was entered and
  shows no …").

**Runs, on a shared machine with a load average between 20 and 39:**

- all 277 `check-flow` journeys pass;
- `check/ui.js --screen=settings` and `--screen=account` report nothing new, at every width;
- `check/press.js --screen=settings` reports nothing thrown and nothing inert. `pfp-choose` was pressed;
  `pfp-remove` was correctly disabled;
- `check/cascade.js`: nothing is decided by file order alone. It needed longer than ten minutes under
  this load, so it ran in the background.

### What the screenshots showed

- **The ten pictures alone, at 30, 40 and 120px**, rendered in Chromium. Each reads as its subject at
  40px and still at 30. The fox's white muzzle reads as a grin, which is friendly and was kept. The
  football's rim patches are the faintest detail and do not matter at 40. The figure's bust is head and
  shoulders, with hair and headwear inside the circle.
- **The picker at 320.** The preview and the two tiles, then 4, 4, 3 under them, then the line. The card
  is drawn at 86% to fit, the known `paneReach_` trade.
- **The picker at 390.** Six and five.
- **The fox chosen.** The fox fills the preview's square as a disc, a gold ring sits round the fox in the
  grid, and Remove is lit.
- **The account column and the feed with the fixture.** Ada's card and post show her figure, glasses
  and all. Evie's card shows the fox. Carl's shows his figure in a cap. The signed-in admin, with
  `pfp:avatar` on his profile, sees his own figure on his own card.

### After review: two findings, each reproduced, fixed at the cause, and held by a check

**1. A child with a second role was not a child on the feed (must-fix).**

- **What it did.** The feed's guard asked `toAppRole(mainRole(pp)) === 'kid'`. `mainRole` ranks tutor
  and client above student. A child can tick Tutor in their own Settings: `setMyRoles` is self-serve,
  holds the role PENDING, and never lists them. Their role cell then reads "tutor, student", and they
  stopped being a child to this line. Their photograph went out as their post face to every visitor,
  where the old line had sent their wearable string. That is something new about a child sent to
  people who could not see their picture before, which the owner ruled out.
- **Reproduced.** A dressed child with a photograph link, who has posted once. After they post
  `setMyRoles` with `['student', 'tutor']`, the anonymous feed's face for their post went from `""` to
  the link. A row already held as "student, client" did the same. On the commit before this change,
  both sent the wearable string.
- **Fixed.** The guard is `hasRole(pp, 'student')`. That is the test the privacy-gated `students` list
  already uses, so the payload has one idea of who is a child. It errs the private way: an adult who
  also takes lessons and has dressed a figure keeps the old line's answer, which is no worse than it
  was. A child with no figure dressed still sends exactly what the old line sent, their link.
- **The check.** `check-profile.js` §12b has three more rules, on a fresh sheet:
  - the dressed child ticks Tutor through the real `doPost`, and the feed must not carry their
    photograph;
  - a row held as "student, client" must not either;
  - a "student, tutor" with no figure must still get their link, so the rule is no stricter than before.
- **Mutations.** Putting `mainRole` back made the first two red ("was put on the public feed by their
  photograph"). Dropping the `!!S(pp.avatar)` half made the third red ("lost the face the old line sent
  them"). Both were green again with the fix back. 36 picture rules hold.

**2. The pictures lost a sliver of their circle at 320 (should-fix).**

- **What it did.** Each drawing is a circle that touches the edge of its own `<svg>`: the ground is
  r=24 in a 48 viewBox, and the bust's clip is r=20 in a 40 one. An `<svg>` inside a page clips to its
  own box by default. That clip is snapped to the pixel grid, but the circle is not.
- **Where it showed.** On a 320 Settings card, `paneReach_` draws the picker at 0.858. There the snap
  landed a pixel inside the circle. The fox, robot and guitar came out flat on the right, and the
  football, guitar and palette flat at the bottom. At 390, the cells sit at fractional positions, and
  the figure, the cat and the rocket lost 3 to 5 device pixels.
- **Reproduced.** In Chromium at 320x568, the screen was photographed as built and again with only the
  drawings' own clip lifted. Five of the eleven differed at their edges: 5 to 20 pixels each at DPR 1,
  and 28 to 69 at DPR 2. The post face and the card face did not differ, because their frames are
  round and clip to their own border.
- **Fixed.** `overflow: visible` on `.pfp-opt > svg` and `.face-pic > svg`. This lifts the clip and
  shows nothing new: measured in the browser, every one of the ten draws inside its own 0–48 square,
  and the bust clips itself to its own circle. `--css-version` is `2026-10-10-h-pictures-round`.
- **The check.** `check/ui.js` has a new heading, **A DRAWN PICTURE CUT BY ITS OWN BOX**:
  - it photographs every `svg.pfp-art` and `svg.avatar.is-bust` fully on the glass, in the column in
    front, on every screen and state;
  - it takes three shots: as it is, with the drawings' own clip lifted, then as it is again;
  - a pixel counts only where the two as-it-is shots agree, so a loader or a slide moving between
    shots is never read as a cut;
  - the picker's own states fail if they draw no picture to measure;
  - the count is printed: "drawn pictures photographed for a cut edge".
- **Proof.** Before the fix it was red at 320 on the picker's two chosen states: the fox, robot,
  football, guitar and palette, 5 to 18 pixels each. With only the grid's rule removed, it was red on
  the same lines. With the fix it was green: 280 pictures on Settings and 60 on the account column, at
  every width.
- **Not asked: the frame round a face.** `.prof-pic`, `.post-face` and `.dm-av` are round by design,
  and what they trim is a circle. Lifting their clip as well differs only in the anti-aliasing of an
  edge that is round either way.

**Seen at 320 and 390 at DPR 3, after the fix:** every circle in the grid is round on all four sides,
including the right-hand column and the bottom row at 0.858. The preview's disc fills its square. The
ring sits round the chosen picture without covering it.

### Deploy

The front end works on its own: every face draws through `personFace_`, and a tap fails honestly. The
pictures can only be **kept** once `backend/` is pulled, with all four stamps at `2026-10-10-h-pictures`.
