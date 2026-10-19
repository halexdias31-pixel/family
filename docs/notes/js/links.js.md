# js/links.js

The full text of comments in `js/links.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — links.js ONE FILE, SPLIT.

top level, before `AV_SKIN`

```
/* ==================================================================================================
   @family. — links.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   links.js is number 9 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### ---------- THE LINKS ARE GONE, AND THEIR LOGOS WITH THEM

top level, before `AV_SKIN`

```
/* ---------- THE LINKS ARE GONE, AND THEIR LOGOS WITH THEM ------------------------------------------
   `faviconFor`, `faviconAlt` AND `hostOf_` WERE HERE — a link's own favicon, asked of DuckDuckGo
   first (it keeps nothing) and Google second (it returns a globe rather than a 404), and the hostname
   both were built from, read with a pattern because `new URL` is missing from older phones. Their one
   caller was the link card on Find, and the owner asked for the links to go: *"Get rid of links
   that's almost redundant now."* Removed rather than left, for the reason `NAMED_COLOURS` gives
   below — a helper nothing calls is one somebody will trust. If links come back, the privacy half of
   the old note is the part worth keeping: only the hostname goes out, and DuckDuckGo is asked first. */
```

### `LINK_SHAPE` picked a shape and a colour per category — a cart for a shop, a card for a bank, a plain square otherwise.

top level, before `AV_SKIN`

```
/* `LINK_SHAPE` picked a shape and a colour per category — a cart for a shop, a card for a bank,
   a plain square otherwise. It went with the coloured squares: a link wears its own logo now, and
   a category has no business deciding what a site looks like. */
```

### `NAMED_COLOURS` lived here — a word in a link's `colour` column became a hex for the coloured square it filled.

top level, before `AV_SKIN`

```
/* `NAMED_COLOURS` lived here — a word in a link's `colour` column became a hex for the coloured
   square it filled. Nothing reads it now: a link wears the site's own logo, so the column is a note
   to whoever keeps the sheet rather than an instruction to the app.
   Removed rather than left: a table nothing uses is one somebody will fill in expecting it to
   do something. */
```

### The Library SCREEN is gone with its tab — every link became a card on Find, searchable and filterable, which the tile wall never was.

top level, before `AV_SKIN`

```
/* The Library SCREEN is gone with its tab — every link became a card on Find, searchable and
   filterable, which the tile wall never was. `libraryTiles` and `libraryPages` went with it, and the
   cards on Find have gone since (see the first note in this file). */
```

### AVATARS. Carried over whole from the burned file, geometry untouched.

top level, before `AV_SKIN`

```
/* ================================================================================================
   AVATARS.

   Carried over whole from the burned file, geometry untouched. This is the one part of that
   rewrite that could not be rebuilt from the backend: hermes holds the CATALOGUE — which items
   exist, what each costs, who may wear it — and this holds the SHAPES. `art_id` is the join
   between them, which is why an item can be renamed in the sheet without changing what it looks
   like: they are different questions.

   The split is deliberate and worth keeping. The browser has to hold the whole set of drawings in
   order to show a wardrobe, and it must hold no authority at all over who may wear what — a
   student with the developer tools open can equip anything they like here, and the server will
   refuse it.

   Deliberately ORIGINAL geometry. A famous toy figure's proportions and head are protected as
   trade dress, and "similar but changed a bit" is precisely what that protection covers. This is
   a simple round-headed blocky character of its own — nothing traced, nothing to credit.
================================================================================================ */
```

### ---------- AND THE SAME FIGURE AS A PICTURE: HEAD AND SHOULDERS IN A CIRCLE

top level, before `AV_BUST_GROUND`

```
/* ---------- AND THE SAME FIGURE AS A PICTURE: HEAD AND SHOULDERS IN A CIRCLE ------------------------
   THE OWNER, 10 Oct: *"…which allow you to use your avatar as a dp."* A whole figure is 48x60 and a
   face on a card is a 52px circle, so the whole body would be a 40px stick in it; a profile picture is
   a head and shoulders, which is what an Xbox gamerpic of an avatar is too. `{ bust: true }` crops
   the SAME drawing to the square `4 4 40 40` — the crown to mid-chest — on a round ground of its own,
   clipped so a cape or a raised hand stays inside the circle. ONE DRAWING, TWO CROPS: a second
   renderer for the figure-as-picture would be a figure that stops matching the wardrobe the day a
   hat is added, and the owner's point is that it is the avatar.
   ONE CLIP FOR EVERY BUST, IN THE PAGE (`#av-clip`, index.html). It was a `<clipPath>` inside each drawing,
   and an id must be unique on the page — the same person can be on three cards at once — so each drawing
   took the next number (`av-clip-1`, `-2`, …). That made every column holding a face draw DIFFERENT markup
   each time it was drawn from the same facts, and so a landing could never tell that a column had not
   changed: the identical-markup skip in `paint` (shell.js, docs/history/341) found four of fifteen columns
   differing by that number alone. The circle is the same in every drawing's own units, so one definition,
   drawn once by the page and never redrawn, serves them all. NOT THE SVG'S OWN BOX: rounding the box and
   hiding its overflow was tried first, and check/ui.js's drawn-picture rule read the box's clip cutting the
   circle — a box clip snaps to the pixel grid, a clip path does not (the reason that rule exists).
   The ground is the figure's own colour, not a token: it belongs to this drawing and to nothing else on
   the screen. */
```

### A PERSON'S PICTURE — TEN OF OURS, THEIR OWN FIGURE, A PHOTOGRAPH, OR THEIR INITIAL.

top level, before `PFP_PREFIX`

```
/* ==================================================================================================
   A PERSON'S PICTURE — TEN OF OURS, THEIR OWN FIGURE, A PHOTOGRAPH, OR THEIR INITIAL.

   THE OWNER, 10 Oct: *"everybody profile picture selector should have 10 basic profile pics like xbox
   dp selector, which allow you to use your avatar as a dp."* The `photo` cell holds a link, nothing,
   or one of eleven tokens (`PFP_CHOICES` in backend/constants.gs): `pfp:avatar` and `pfp:<name>` for
   each picture below. `check-profile.js` holds this list equal to that one.

   OUR OWN ARTWORK, NOT XBOX'S OR ANYBODY'S. Ten simple, bold drawings, one subject each on a round
   coloured ground, friendly enough for a seven-year-old and plain enough for a tutor: a fox, an owl,
   a cat, a dinosaur, a robot, a rocket, a planet with a ring, a football, a guitar and a paint palette.
   Drawn on a 48-unit square with nothing finer than about a unit and a half, because the smallest
   place one is drawn is a 2rem disc in a message head (about 30px) and the largest is the 88px
   preview — a whisker that is a hairline at 120px is nothing at 30.

   THE COLOURS ARE THE PICTURES' OWN, written into the drawings and nowhere else. CLAUDE.md: a colour
   that belongs to ONE component is defined on that component, so these are not `:root` tokens and
   not paper colours — a fox's orange is that fox's, as a chess board's cream is that board's.
   `check-css.js` fails on a `:root` token or a paper colour spelled out in here.

   IN THE ORDER THE GRID SHOWS THEM, after your own figure. Object order is insertion order, and the
   backend's `PFP_PICTURES` is in the same order so the two lists can be compared as lists. */
```

### THE TOKEN'S NAME, OR NOTHING:

top level, before `pfpChoice_`

```
/* THE TOKEN'S NAME, OR NOTHING: `avatar` or one of the ten for exactly `pfp:<name>`, and '' for
   anything else. Lower-cased and trimmed, as `photoChoice_` in core.gs reads it, so a token typed into
   the sheet by hand draws the same as one the grid wrote. */
```

### ---------- WHAT KIND OF PICTURE A STORED VALUE IS

top level, before `picKind_`

```
/* ---------- WHAT KIND OF PICTURE A STORED VALUE IS ---------------------------------------------------
   `photo` for an address (`https://…`, a `data:image`, or a path on this site such as the fixture's
   `data/reels/archetest.jpg`), `basic` or `avatar` for a token, and '' for nothing at all.
   ANYTHING ELSE IS NOTHING, NOT A PICTURE: a token from a newer list than this phone knows, or the
   WEARABLE string — "hair:crop|legs:jeans" — which an older backend put in a post's `avatar` ahead of
   the photograph and which drew as a broken square on every post by anybody who had dressed their
   figure. A scheme that is not a web address, a bar or a space is never an address on this site. */
```

### ONE OF THE TEN, drawn at `size` pixels.

top level, before `pfpArt_`

```
/* ONE OF THE TEN, drawn at `size` pixels. The ground is a circle, so it is round on every surface
   whatever shape the frame round it is; `aria-hidden` because the name is always said beside it — on
   a card the person's name, in the grid the button's own label. */
```

### THE ONE FUNCTION THAT TURNS A PERSON'S STORED PICTURE INTO WHAT IS DRAWN.

top level, before `personFace_`

```
/* ==================================================================================================
   THE ONE FUNCTION THAT TURNS A PERSON'S STORED PICTURE INTO WHAT IS DRAWN.

   EVERY FACE IN THE APP GOES THROUGH HERE: a person's card (yours and everybody's on the people
   column, your family's, an admin's everyone), a post's author, the head of a conversation, and the
   picker's own preview. Before this there were five renderers, each with its own idea of what a
   missing picture was — the card drew the initial, the picker drew your figure but only on your own
   screen, a post drew the business's logo, a message drew a letter in a gold ring — and a sixth kind
   of value would have meant teaching all five. Now there is one answer to "what does this person
   look like", and the surfaces differ only in the frame round it.

   `who` IS `{ pic, avatar, handle, name, personId }` — the stored value, the wearable string if the
   payload carried one, and what to seed and spell it with. `o` is the frame: `cls` for the element's
   class, `none` for the class the initial adds, `size` for a drawing, `alt` for a photograph.

     a photograph     the `<img>` every surface drew before, through `pic()` (a Drive page becomes the file)
     one of the ten   the drawing, in a `<span>` with the frame's class
     the figure       `avatarFor`'s bust — YOURS IS ALWAYS LIVE: on your own rows it is drawn from
                      `USER.avatar`, so the hat you put on a moment ago is on your card at once
                      rather than after the next payload. Anybody else's is drawn from the `avatar`
                      the server sent beside their face (`faceFig_` in core.gs), and a row that came
                      WITHOUT one — an older server, or a list the figure is not sent on — draws the
                      initial: a figure seeded from a handle would be a stranger's face over a real
                      person's name, which is worse than a letter.
     nothing          the initial, as every card drew it. */
```

### EVERY WEARABLE, AND WHETHER IT IS YOURS.

top level, before `wardrobe`

```
/**
 * EVERY WEARABLE, AND WHETHER IT IS YOURS.
 *
 * The backend sends `avatarItems` — its own answer, and the only one that counts. This falls back
 * to deriving the list from the shop rows and the drawings when it hasn't arrived, so a wardrobe
 * still appears on an older payload; what it must never do is decide anybody's unlocks, because
 * a student with the developer tools open can edit whatever this returns.
 */
```

