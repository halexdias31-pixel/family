# js/cards.js

The full text of comments in `js/cards.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — cards.js ONE FILE, SPLIT.

top level, before `passFor_`

```
/* ==================================================================================================
   @family. — cards.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   cards.js is number 6 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### The app STARTS at the very bottom of this file, not here.

top level, before `passFor_`

```
/* The app STARTS at the very bottom of this file, not here.

   It used to start here, and here is above every `screen(...)` registration — so `go()` ran with
   an empty SCREENS table and `paint()` fell through to its own "Nothing here yet", on every tab,
   until the first fetch came back and repainted. The skeleton was never reached once, on any
   device: the thing it was covering had already been replaced by a sentence saying there was
   nothing to cover.

   Nothing marks the boundary in a file that is read top to bottom, which is exactly why the
   start belongs at the end — where everything it needs is behind it by construction rather than
   by somebody remembering. */
```

### THE FIRST SCREEN — Who.

top level, before `passFor_`

```
/* ================================================================================================
   THE FIRST SCREEN — Who.

   Tutors and venues, which is the simplest real screen: two lists of things the backend already
   sends. It is here to prove the shell rather than to be finished, and to be the shape every
   other screen copies:

     · a screen is ONE function returning markup
     · it never touches the tab bar, the header or another screen
     · anything needing the whole display opens a sheet
     · anything pressable carries `data-do`, so the markup can be thrown away and redrawn
================================================================================================ */
```

### ---------- WHAT A PERSON, A PLACE AND A SUBJECT LOOK LIKE

top level, before `passFor_`

```
/* ---------- WHAT A PERSON, A PLACE AND A SUBJECT LOOK LIKE ---------------------------------------
   The Find SCREEN is gone — it and Stuff were two tabs asking the same question, and the funnel
   can hold both lists now that it skips whatever a kind cannot answer. What survives is the three
   card shapes, because a tutor still has to look like a tutor.

   `findItems`, `findPageHtml`, `findBrowse`, `findPageCount` and the `find-kind` handler went with
   the screen. Every one of them was a smaller, worse copy of something the funnel already does:
   a browse page with three counts, a pager, and a filter that could only ever ask one question.
--------------------------------------------------------------------------------------------- */
```

### ---------- YOU, AS A CARD

top level, before `passFor_`

```
/* ---------- YOU, AS A CARD -------------------------------------------------------------------------
   THE ACCOUNT WAS A LIST OF ROWS ON `You` — name, role, credits, ticks, email, where — with the
   things you can do about it as three separate tap-cards further down the column. Everybody else in
   this app is a card: a tutor is a pass, a friend is a card, a venue is a card. You were a settings
   screen.

   ONE CARD, AND THE ACTIONS ARE ON IT, which is the rule every other card in the app already
   follows. Editing your details, adding your child and opening your wardrobe were three cards you
   scrolled past; they are marks in the row under your own face now.

   IT IS ONLY EVER YOU. There is no people directory on the device and there should not be one from
   here: the `people` tab carries PINs, bank details, addresses and dates of birth, and the backend
   deliberately sends only `tutors` — filtered to public facts — and `students`. Everything on this
   card is already on this device because it is yours. */
```

### NO `cardTiles_` CALL HERE.

top level, before `passFor_`

```
/* NO `cardTiles_` CALL HERE. `stuffCard` in find.js appends the action row to every card it draws,
   and this card is drawn through it — the `me` kind is registered in `KINDS` like any other. This
   builder kept the call it had from before the actions were centralised, so the row came out twice:
   two stars, two pencils, two bins, two admin rows, all live and all doing the same thing. */
```

### ---------- ONE PERSON, ONE CARD

top level, before `passFor_`

```
/* ---------- ONE PERSON, ONE CARD -------------------------------------------------------------------
   YOU WERE ON THE SCREEN TWICE. A staff pass with your photograph, your subjects, your rate and your
   DBS stamp — and then, a swipe later, a second card with your photograph, your name and your role
   again above your credits. Same person, same face, two cards, because one was built for `tutor` and
   the other for `me` and nothing ever asked whether they could be the same row.

   THE PASS IS THE PUBLIC HALF AND IT WINS. It is what everybody else sees of you, it is the shape
   this app already uses for a person, and it says more: what you teach, what you cost, whether you
   are cleared. Drawing a plainer version of the same person underneath it says nothing the pass did
   not already say better.

   SO THE PRIVATE HALF HANGS OFF IT. Credits, ticks, email, where — the facts only you see — are rows
   under your own pass rather than a card of their own, and the way out is the last of them.

   AND IT IS NOT ABOUT TUTORS. A child with a row, an admin, anybody: `passFor_` finds whatever
   public record exists for the person and the private rows go under it. Somebody with no such record
   gets the rows on their own, which is what everybody used to get. */
```

### ---------- ONE ROW FOR ONE PERSON, PASSED IN RATHER THAN LOOKED UP A SECOND TIME

top level, before `meCard`

```
/* ---------- ONE ROW FOR ONE PERSON, PASSED IN RATHER THAN LOOKED UP A SECOND TIME -----------------
   `passFor_(USER.name)` MATCHES ON THE DISPLAY NAME ALONE, and CLAUDE.md is emphatic about what
   that costs: `findPerson` on the backend falls back to matching a name, which is right for a row
   typed into a sheet before anybody has an id and silently wrong the day two tutors share one.
   `accountPages_` already does this properly — `mineIs_` tries `personId`, then `handle`, then the
   name, in the order the backend uses — and it has the answer in its hand when it calls this.

   SO THE ROW IS AN ARGUMENT. Passing it is what makes the two agree by construction; `passFor_`
   stays as the fallback for a caller that has no row, which today is `KINDS.tutor.card` — the
   funnel's renderer, currently unreached because Booking has left the funnel, and still correct if
   the `kinds` tab ever puts a tutor back in it. */
```

### `USER.profile.photo` FIRST:

in `meCard`

```
/* `USER.profile.photo` FIRST: it is what the picker writes the moment the server answers, where
     `USER.photo` is the sign-in reply's copy — `pfpTake_` writes both now, but a remembered sign-in
     from before it holds only the first. */
```

### ---------- CREDITS, E-MAIL AND WHERE MOVED TO THE SETTINGS COLUMN

in `meCard`

```
/* ---------- CREDITS, E-MAIL AND WHERE MOVED TO THE SETTINGS COLUMN ----------------------------
     They were a second card under this one headed "Only you see this". Asked for as *"credits can
     stay in the column to the right along with email and where bit"* and *"remove the only you can
     see this bit"*: the e-mail and the place are boxes on that column already, so printing them here
     too was one fact in two places, and the credits sit on the figure's card there because credits
     are what buy a wearable. What is left here is who you are — the photograph, the name, the role
     and the handle — which is the one thing this column is for. The fallback card below prints
     the role in its subtitle, so a `Role` row under it would say it twice. */
```

### ---------- TWO WIDGETS, NOT A CARD INSIDE A CARD

in `meCard`

```
/* ---------- TWO WIDGETS, NOT A CARD INSIDE A CARD ---------------------------------------------
       THIS WRAPPED `findCard` IN `<div class="card">` and appended the private rows inside it. That
       was right while a tutor was a `.pass` — a bare object with no container of its own. It is a
       `.card.is-widget` now, so a wrapper would be a card in a card, which is the nesting
       `accountPages_` has just stopped doing. And with the private rows gone to Settings there is
       no second card either: your own card is the card everybody else sees of you. */
```

### THROUGH `personFace_` LIKE EVERY FACE.

in `meCard`

```
/* THROUGH `personFace_` LIKE EVERY FACE. This drew the full wardrobe figure for no picture,
            a face only you ever saw; with no picture it is the initial everybody else sees, and the
            figure is a picture you choose (`photoPicker_`). */
```

### THE `Sign out` BUTTON WAS HERE, briefly.

in `meCard`

```
/* THE `Sign out` BUTTON WAS HERE, briefly. It moved to `#stuff-controls` — the question at the
          top of the funnel, which is the one thing on screen that is never scrolled past, never
          filtered out and never not drawn. A card can be all three, and a way out that is only
          there when you have already found yourself is not one. See `screen('stuff')`. */
```

### ---------- A FIELD THAT MIGHT BE A LIST, AND MIGHT BE A STRING, AND MIGHT BE NEITHER

top level, before `profList_`

```
/* ---------- A FIELD THAT MIGHT BE A LIST, AND MIGHT BE A STRING, AND MIGHT BE NEITHER -------------
   THE FIRST VERSION OF THIS CARD DID `(t.focus || []).join(' · ')` AND IT THREW. `doget.gs` sends
   `focus` as an array and the fixture holds the string `"Maths"`, and a string has no `.join` — so
   `paint` caught the TypeError, drew its "This screen did not draw" card, and `check/ui.js`
   measured that card across eight combinations and reported nothing to report.

   THE SHAPE IS NOT SOMETHING THIS CARD GETS TO ASSUME. Four of the thirteen fields it reads are
   list-shaped, they arrive from a spreadsheet through a mapper, and this file has already paid for
   the opposite belief twice — `r.link` against `source_url` cost seven silent reads, and
   `extraQuals` is sent as a STRING while the fixture holds an empty ARRAY, which is truthy, so the
   naive test printed an `Also` row with nothing after it.

   SO IT READS ALL THREE FORMS, exactly as `asList_` in find.js does for the funnel: an array, a
   comma-separated cell, or a single value. Declared here rather than borrowed because `cards.js`
   loads before `find.js` — see `window.FILES` — and a card that works only once the funnel has
   loaded is a card that breaks on the first screen somebody opens. */
```

### ---------- WHAT A TUTOR TEACHES: THE SUBJECT ONCE, ITS LEVELS RAISED AFTER IT

top level, before `teachGroups_`

```
/* ---------- WHAT A TUTOR TEACHES: THE SUBJECT ONCE, ITS LEVELS RAISED AFTER IT ------------------
   ASKED FOR AS *"what they teach should appear like Subject ^level, level, level. so like the levels
   are superscripted. no brackets."* It was one chip per PHRASE — `Maths (GCSE)`, `Maths (A-Level)`,
   `Maths (AS)` — so a tutor teaching one subject at three levels said "Maths" three times in a row
   and the brackets were most of the ink.

   GROUPED HERE, ON THE PHONE, AND THE PHRASES ARE LEFT ALONE. `teachesOf_` sends one phrase per level
   because that is what it dedupes on, and the booking form's `why` and `subjectRows` / `levelRows`
   match against exactly that string. Changing `teachPhrase_` would change what three matchers
   compare to fix how one card looks — and an older backend sends the very same strings, so nothing
   here waits on a deploy.

   READ WITH `subjectIn_` AND `levelIn_`, price-rows.js's pair, which is already the one reader of
   that format: a third regex here would be a third chance to read `Maths (GCSE)` differently. A
   phrase with no bracket is the subject on its own, and is a chip with nothing raised; a subject
   that arrives both bare and with a level just shows the level, because the bare one adds nothing.

   THE ORDER IS THE SERVER'S. The first time a subject is seen fixes its place, and its levels follow
   in the order they came, which is the order the tutor entered them on the qualification shelf.
   `GCSE` and `gcse` are one level. */
```

### ONE CHIP. The levels are a `<sup>`, and each level is its own no-wrap span, so at 320px a long list breaks BETWEEN levels rather than inside `A-Level` at its

top level, before `teachChip_`

```
/* ONE CHIP. The levels are a `<sup>`, and each level is its own no-wrap span, so at 320px a long
   list breaks BETWEEN levels rather than inside `A-Level` at its hyphen. The no-break space before
   the first one keeps it on the subject's line, so a chip never wraps to leave a subject on its own
   with its levels underneath; it is also what makes the chip read "Maths GCSE, A-Level" to a screen
   reader rather than "MathsGCSE". `mark` runs on each half, so a search for "GCSE" still lights it. */
```

### ---------- A QUALIFICATION, WRITTEN LIKE AN ISOTOPE

top level, before `profQualV_`

```
/* ---------- A QUALIFICATION, WRITTEN LIKE AN ISOTOPE -----------------------------------------------
   ASKED FOR AS *"for the qualifications bit, should be for example Maths subscript to it is grade and
   super script is the level."* So `Maths` with `A-Level` raised and `B` lowered beside it, the two
   stacked one over the other — the way ¹⁴₆C is written, with the pair on the right. It was one chip
   per sentence, "Maths A-Level grade B at Hill Top School (2019)", which was most of a line for one
   claim and read the same whether the grade was an A* or a U.

   OFF `qualsParts`, NOT OFF THE SENTENCE. Taking "English Language GCSE grade 7" apart on the phone
   is guessing where the subject stops and the level starts, so the server sends the parts beside the
   sentences — see `qualsParts_` in core.gs. A backend from before that sends only `quals`, and the
   chips are then exactly the sentences they always were: nothing here waits on a deploy to draw.

   WHAT IS LEFT OFF THE FACE IS KEPT IN THE NAME. Where it was studied and when it was finished are
   not in the notation; they are the chip's `aria-label` and its `title`, so a screen reader hears
   "Maths, A-Level, grade B, at Hill Top School, 2019" rather than "Maths A-Level B", and a pointer
   held over it shows the same. `role="img"` is what makes the label the thing read — the same
   arrangement as the area map and the week below, which are also one picture of several facts.

   ONE CHIP PER QUALIFICATION, NOT ONE PER SUBJECT the way `teachGroups_` does it. A level and its
   grade are one fact; `Maths ^GCSE, A-Level ₉, B` would leave a reader to pair them up by position,
   and the place and year of each would have to share one label. What grouping was FOR — "Maths"
   said three times in a row — is answered by order instead: a subject's qualifications sit together,
   in the order their subject first appears, which is how the tutor's own shelf lays them out (see
   `qualShelf_` in me.js). The server's order inside a subject is kept, so GCSE stays before A-Level
   when that is how they were entered.

   A CERTIFICATE IS A PLAIN CHIP — `kind: 'cert'`, decided on the server. A PGCE or an Enhanced DBS is
   a thing held rather than a subject at a level, and notation over it would be a raised `Enhanced`
   with nothing lowered under it. No level → just the lowered grade; no grade → just the raised level;
   neither → the subject alone, which is a plain chip too.

   STILL STUDYING, WITH NO GRADE YET, IS SAID IN THE GRADE'S PLACE. The sentence said "— studying now"
   and the card would otherwise draw a degree somebody has not finished exactly as one they hold. The
   form's own grade picker calls the empty answer "None yet", so the lowered slot is where a parent
   expects to find out — `studying`, set apart from a real grade in italic. A grade already given (a
   predicted one) wins, and the label still says "studying now". */
```

### THE LAST WORD OF THE SUBJECT IS HELD TO ITS NOTATION, so at 320px a long subject breaks between its own words and never leaves the stack alone at the start of

in `profQualChip_`

```
/* THE LAST WORD OF THE SUBJECT IS HELD TO ITS NOTATION, so at 320px a long subject breaks between
     its own words and never leaves the stack alone at the start of the chip's next line.
     COLOURED FIRST, CUT AFTER. It was cut first and each half coloured on its own, so a `laws` row
     naming "English Language" matched neither "English" nor "Language" and the subject went plain —
     the two-halves fault `mark`'s "longest first" exists to prevent, let back in from outside it. Now
     the whole subject goes through `mark` once and the cut is the last space BETWEEN its coloured
     words (`profLastGap_`), never one inside a colour; a phrase coloured whole is held whole. */
```

### THE LAST SPACE IN `mark`'s HTML THAT IS NEITHER INSIDE A TAG NOR INSIDE A COLOURED SPAN, or -1.

top level, before `profLastGap_`

```
/* THE LAST SPACE IN `mark`'s HTML THAT IS NEITHER INSIDE A TAG NOR INSIDE A COLOURED SPAN, or -1.
   `mark` escapes before it wraps, so every `<` here opens a tag and never stands for the letter, and
   its `<span class="…">` has a space of its own that must not be taken for one between words. Counted
   as a depth rather than a yes/no, so a span inside a span — should a law ever make one — is still
   inside, and the cut can never land where it would leave a tag open across the no-wrap span. */
```

### ---------- "1 to 4 students", NOT `minStudents` AND `maxStudents`

top level, before `profRange_`

```
/* ---------- "1 to 4 students", NOT `minStudents` AND `maxStudents` --------------------------------
   THE SHEET STORES A FLOOR AND A CEILING and a reader wants a range, so the joining happens once
   here rather than on every card that shows one. Three cases and they read differently:
     · both, and equal   → "1 student"        — a tutor who only takes one is stating a policy
     · both, and apart   → "1–4 students"
     · a floor only      → "1+ student" — `maxStudents` of 0 is "no limit set", which
                            `doget.gs` says outright, so it must not be printed as a ceiling of nought
   NOTHING AT ALL when there is no floor either: an unanswered question is not a range, and a row
   reading "0 students" is the `cost: 0` shape one more time. */
```

### `1–4 students` and `1+ hour`, ASKED FOR BY NAME over "1 to 4" and "1 hour or more":

in `profRange_`

```
/* `1–4 students` and `1+ hour`, ASKED FOR BY NAME over "1 to 4" and "1 hour or more": a range
     is scanned rather than read, and the short form is what every timetable prints. En dash, the
     character this app already writes a range with (`1–10`, `Grades 4–6`). */
```

### ---------- "Ages 8–16", AND EVERY WAY A ROW CAN HAVE ONLY HALF OF ONE

top level, before `profAge_`

```
/* ---------- "Ages 8–16", AND EVERY WAY A ROW CAN HAVE ONLY HALF OF ONE ---------------------------
   `doGet` SENDS EACH END AS A WHOLE NUMBER, THE WORD `Adults`, OR '' — `ageOut_` in people.gs — and a
   row typed into the sheet by hand has often filled in one end and not the other. Each shape says
   what the tutor actually told us and nothing more:
     · both, apart        → "Ages 8–16"        · both, equal  → "Age 10"
     · youngest only      → "Ages 11+"         · oldest only  → "Ages up to 16"
     · up to Adults       → "Ages 11+"         · Adults first → "Adults"
     · oldest is Adults and no youngest → "All ages"
   A PAIR TYPED BACKWARDS IS READ THE WAY IT OBVIOUSLY MEANS — the server refuses one from the form
   (`ageRefusal_`), so the only way here is a hand-typed row, and "Ages 16–8" helps nobody.
   Read loosely again rather than trusting the payload's spelling, because the fixture and an older
   backend are payloads too: a number, a numeric string, `adults` in any case, or `18+`. Nought and
   anything unreadable are an end nobody answered, never "age 0". */
```

### THE FACT CHIPS, in the order a parent asks:

top level, before `profFacts_`

```
/* THE FACT CHIPS, in the order a parent asks: how experienced, whether they take a child this age,
   how many at once, how long. The ages come second because they are the first thing that rules a
   tutor OUT — a parent of a seven-year-old has no use for the group size of somebody who starts at
   eleven. `yrsExp` is a number when the sheet holds one and whatever was typed otherwise. */
```

### ---------- WHERE THEY TUTOR, AS A HEAT MAP RATHER THAN A LIST OF NAMES

top level, before `HEAT_W`

```
/* ---------- WHERE THEY TUTOR, AS A HEAT MAP RATHER THAN A LIST OF NAMES -------------------------
   ASKED FOR AS *"instead of the tutors at showing names of all places, just let it be a heat map of
   the areas. like that way people will generally see that i tutor roughly south west london by
   seeing my heat map."* A list of eleven library names says nothing to a parent who does not know
   them; a warm patch over the south west of a map of London says it at a glance.

   THE POINTS ARE THE VENUES' OWN COORDINATES, which the payload already carries (`lat`/`lng` on
   `DATA.venues`, filled by `?run=geocode`), matched by name to the ticked list. A venue with no
   coordinates is left off rather than guessed at, and `Online` has none, so it is a chip under the
   map when it is ticked — it is not a place.

   THE MAP IS REAL STREET TILES, NOT A DRAWING, because "roughly south west London" is only readable
   against London: a glow on a blank box is a glow. OpenStreetMap's own tiles, which need no key,
   darkened in CSS so the map sits in a black-and-gold card rather than being a white hole in it, with
   the credit OpenStreetMap asks for. Tiles are another origin, so `sw.js` never caches them, and one that fails to
   load leaves the card's own grey under the glow — the heat still reads, the streets do not.

   CENTRED ON THE POINTS, AT THE CLOSEST ZOOM THAT HOLDS THEM ALL, capped both ways: never closer than
   a borough (a street-level map would be a tutor's front door, which is not what this is for) and
   never further out than all of London. Positions are Web Mercator pixels relative to the centre,
   written as `calc(50% + …px)`, so the map is right at every card width without being measured. */
```

### BACKGROUND LAYERS, NOT ELEMENTS.

in `profHeat_`

```
/* BACKGROUND LAYERS, NOT ELEMENTS. The tiles run wider than any card so no width leaves a bare
     edge, and as absolutely placed `<img>`s that made the box scroll sideways by 120-150px —
     `overflow: hidden` clips a scroller, it does not stop it being one, and `check/ui.js` named it on
     the first run. A background is painted inside its own box and has no extent to scroll to, so the
     map is clipped by construction. The glows are radial gradients in the same list, on top. */
```

### `50%` IN A BACKGROUND POSITION IS NOT THE BOX'S MIDDLE.

in `profHeat_`

```
/* `50%` IN A BACKGROUND POSITION IS NOT THE BOX'S MIDDLE. It lines the IMAGE's 50% up with the
     BOX's 50%, so a 256px tile placed at `calc(50% + d)` starts 128px left of where `d` says — and
     the first version shipped that way: every tile and every glow was half its own size up and to
     the left, the bottom of the map was black, and the glows sat off their venues. The owner's
     screenshot is what showed it (this container cannot load the tiles). `w` and `h` put it back:
     the image's own half is added so its top-left corner lands at `50% + d`. */
```

### OPENSTREETMAP'S OWN TILES, WHICH NEED NO KEY.

in `profHeat_`

```
/* OPENSTREETMAP'S OWN TILES, WHICH NEED NO KEY. The first version used CARTO's dark tiles,
       and CARTO now draws "API key required" over every tile for a site with no account -- the
       owner's report was "the map is asking me for an api key". OSM's standard tiles are free with
       the credit printed on the map; they are light, so `.heat-tiles` darkens them in CSS rather
       than this paying for a dark style. */
```

### ---------- WHEN THEY TEACH, AS THE RECEIPT'S WEEK

top level, before `profAvail_`

```
/* ---------- WHEN THEY TEACH, AS THE RECEIPT'S WEEK ------------------------------------------------
   ASKED FOR AS *"tutors availability should appear on their card."* `doGet` has sent `avail` on
   every tutor since the grid was written — the 77 `m09`…`su19` codes as `{ m16: 'TRUE', m17: '' }`
   (`availGridOut`) — and `busy`, the same codes for hours they are already teaching. The card read
   neither, so a parent choosing between two tutors had to start a booking with each to find out
   whether either worked Tuesdays.

   `weekGrid_`, AND THE RECEIPT'S CELL. The same day rows the booking form, the receipt and the
   tutor's own Settings week are drawn with, so a week on a card is not a fourth thing to learn; the
   cell is the receipt's look — lit or `shut` — on a `<span>`, because a card is read, not answered
   (see the note over the markup for what a disabled button cost).

   A BUSY HOUR IS NOT LIT GOLD. It is an hour they said they can teach and somebody already has,
   so offering it as open is the promise the booking grid would then break; `slotGrid` greys it for
   the same reason. Its `title` says why, which is what the booking grid's cells do too — and on the
   card it is also hatched, for the reason given at the end of this note.

   A DAY WITH NOTHING TICKED IS NOT DRAWN, and A TUTOR WITH NOTHING TICKED GETS NO WEEK — the sentence
   under the caption instead (see below). Seventy-seven grey cells read as "never available", which
   is not what an unfilled grid means.

   ---------- ONLY THE DAYS THEY WORK ----------------------------------------------------------------
   THE OWNER, 10 Oct: *"availability of tutors should just show the days they have an availibility up.
   no need to display monday if they dont have any hours on monday."* A day with nothing ticked was a
   thin `shut` row, on the argument the booking grid makes — "a missing Wednesday and a Wednesday
   nobody works are different facts". On a CARD that argument has nothing to stand on: the card is
   read, nothing on it is pressed, and nobody reading "Available" down a tutor's card mistakes a
   missing Wednesday for anything but a day they do not teach. Four thin rules of nothing under a
   tutor who works three days was three-sevenths of the week spent saying no.

   SO A DAY IS DRAWN WHEN IT HAS AN HOUR THEY TICKED INSIDE THE BOOKABLE SPAN, LIT OR ALREADY TAUGHT.
   A taught hour keeps its day: it is still a day they work, which is the thing a parent comparing two
   tutors wants to know. Days keep the week's order (`SLOT_DAYS`), and the hour ruler rides on
   whichever day is first. See docs/history/325.

   ---------- AND A TAUGHT HOUR HAS TO LOOK TAUGHT, OR ITS DAY IS A ROW OF NOTHING ------------------
   THE FIRST CUT OF THIS SAID "the grey says the hour is gone", AND THERE WAS NO GREY. A taught hour
   was `hr shut` — the same dark cell as an hour never ticked — with the difference in its `title`,
   which a phone never shows. While every day was drawn that was a detail; once a day is drawn
   BECAUSE of its ticked hours, a Thursday whose one ticked hour is taught came out as ten identical
   empty cells, the very row the owner asked to drop. Found in the review's screenshot (ticked Thu 16
   and Fri 10, teaching Thu 16). So the cell keeps `shut` — it cannot be booked — and `is-busy` gives
   it its own look (`.prof-week .hr.is-busy`: a gold edge, hatched across), and ONE KEY under the
   week says what the hatching means, drawn only when there is a taught hour to explain. The
   sentence read aloud says it too, after the free hours: the week is `role="img"`, so the key's
   words are not read and the label has to carry them. */
```

### ---------- NO `avail` KEY AT ALL IS NOT A TUTOR

in `profAvail_`

```
/* ---------- NO `avail` KEY AT ALL IS NOT A TUTOR -----------------------------------------------
     `doGet` sends `avail` on every tutor row (`availGridOut`, `{}` when nothing is ticked). A
     student or client on an admin's people column (`DATA.everyone`), a family card, or your own
     card when you teach nobody carries no such key — and was told it "hasn't set their hours yet,
     so they can't be booked by name", a tutor's warning on a child. Found in the screenshot of the
     first admin column that listed everyone. */
```

### ---------- NO HOURS IS SAID, NOT LEFT BLANK

in `profAvail_`

```
/* ---------- NO HOURS IS SAID, NOT LEFT BLANK -------------------------------------------------
     THIS DREW NOTHING, on the argument that 77 grey cells would read as "never available" and that
     `slotGrid` treated an empty grid as "nobody has said". The second half changed: *"tutor with no
     hours wont be bookable."* So a family reading the card needs to know why the name is greyed in
     the booking form, and an admin looking down the tutors needs to see who has not filled their
     week in — the one place every tutor is drawn for them. One sentence under the caption, in the
     card's own warning ink; still no week, because a week of grey says the wrong thing. */
```

### THE BOOKING'S SPAN AND NOTHING WIDER.

in `profAvail_`

```
/* THE BOOKING'S SPAN AND NOTHING WIDER. This widened the week to any hour the tutor had ticked,
     because their own grid ran to seven and the booking grid stops at six — so a seven o'clock tick
     was drawn here, lit, as an hour a family could have, and the booking grid had no column for it.
     The two spans are one now (`AVAIL_HOURS` = `SLOT_HOURS`, held equal by check-booking.js), so the
     card shows exactly the hours that can be booked. */
```

### ---------- TICKED, BUT NOT AT AN HOUR THAT CAN BE BOOKED

in `profAvail_`

```
/* ---------- TICKED, BUT NOT AT AN HOUR THAT CAN BE BOOKED ---------------------------------------
     WITH THE EMPTY DAYS GONE, THIS TUTOR WOULD GET A CAPTION OVER NOTHING — or a header row of hour
     numbers with no day under it. It happens: a seven o'clock tick made while the Settings grid ran
     to seven is still in the sheet (`AVAIL_HOURS` stops at six now), and it is the only tick some
     tutors have. They HAVE said when they work, so "hasn't set their hours" would be untrue; what is
     true is the sentence the week's own `aria-label` already says when nothing in it is free. Drawn
     in the warning ink like the one above, because a family is about to find the name bookable and
     every hour of it grey. */
```

### ---------- SPANS, NOT THE RECEIPT'S DISABLED BUTTONS

in `profAvail_`

```
/* ---------- SPANS, NOT THE RECEIPT'S DISABLED BUTTONS ---------------------------------------------
     THE FIRST VERSION USED `jobWeekRows_`'s `<button disabled>`, and `check/ui.js` listed every one
     of the 77 as a 17x12 tap target — 210 "known" rows at 320 alone, a report nobody would read past,
     about cells nobody is meant to press. A cell that is not a control should not be marked up as
     one; it keeps `.hr`'s look and is a `<span>`. A screen reader is given ONE sentence for the whole
     week instead of 77 cells — "Monday 16:00, 18:00; Tuesday 10:00…" — which is what a parent asking
     "when are they free" wants read out. */
```

### WHAT ONE EXTRA SEAT ADDS TO THE HOURLY RATE — ASKED FOR AS *"a smaller rate to the side so clients can know extra cost for the extra seat"*.

top level, before `profSeat_`

```
/* WHAT ONE EXTRA SEAT ADDS TO THE HOURLY RATE — ASKED FOR AS *"a smaller rate to the side so
   clients can know extra cost for the extra seat"*. `seatShare_` is the reader `priceFrom` uses,
   so the card and the booking agree: a seat is `(cUsed + bUsed)` of the rate. Nought draws nothing.
   `bUsed` IS THIS TUTOR'S OWN CUT when an admin has set one (`extraSeatCut`, docs/history/345), the config
   default when it is blank — the number the owner pointed at, *"that small number to the right of their
   normal rate"*. And the card editor's live preview is this function over the typed row, so the form and
   the card cannot print two different seats. */
```

### ---------- A PERSON IS A WIDGET, AND THE LANYARD HAS GONE

in `findCard`

```
/* ---------- A PERSON IS A WIDGET, AND THE LANYARD HAS GONE ------------------------------------
     REPORTED AS "get rid of that lanyard looking thing mate. just a normal widget." — the second
     complaint about this card in two days, and the first one ("I want them standardised like the
     other widgets") was answered by putting the pass INSIDE a widget, which is not what was asked
     and left a lanyard in a box.

     WHAT THE PASS WAS FOR, so the argument is not lost with the markup. It carried a photograph, a
     name, what the person does and whether they had been CLEARED, and the defence of it was that
     the SHAPE did the explaining: a rectangle with a hole punched in the top reads as something
     worn round a neck, and once it reads as that the DBS stamp reads as clearance without anybody
     saying so. That was true and it is not the point. A pass is an object you are handed at a
     reception desk; this app is a column of widgets you scroll, and one object among nine widgets
     reads as a thing that has not been finished rather than as a thing with a shape of its own.

     AND IT COULD NOT HOLD WHAT IS ACTUALLY IN THE SHEET. That is the half that matters more than
     the taste. `doget.gs` has sent thirteen public facts about a tutor since it was written and the
     pass drew four of them: a photograph, a name, three subjects and a rate. The headline they
     wrote about themselves, the three adjectives, the years they have been doing it, their
     qualifications and grades, the group sizes and session lengths they accept, what they focus on,
     and when they last confirmed any of it were all on every phone, on every load, drawn nowhere.
     THIRTEEN COLUMNS WRITTEN AND NEVER READ is this repository's oldest shape — `figure`,
     `orderPrints`, the four message actions, `exam_date` — and a pass is 3.4rem of card wide, so
     there was nowhere to put them even once somebody noticed.

     SO IT IS `.card.is-widget`, the same container the calculator and the notepad sit in, with the
     role as its label and rows underneath. Asked for twice; the rows are what makes it worth it.

     THE DBS STAMP SURVIVES THE MOVE, because the one thing on here a parent is actually scanning
     for should not become a row of text among twelve others. It is a marked chip beside the name,
     green or red, and the `undefined` rule below is unchanged and still the sharp edge. */
```

### ---------- A TITLE SITS BESIDE THE ROLE, IN THE ROLE'S OWN LABEL

in `findCard`

```
/* ---------- A TITLE SITS BESIDE THE ROLE, IN THE ROLE'S OWN LABEL ---------------------
             `doGet` SENDS `titles` — the values in the role cell that are titles rather than
             roles, `Head of Boxing` among them — and this heading is the one place on the card
             that already says what somebody IS. A row of its own would be a twelfth label/value
             line for a fact three words long; a longer `role` string would put a title through the
             funnel, which reads that field as a kind. `profList_` because the shape is not
             something this card gets to assume — see its note. */
```

### ---------- AND WHAT `· not listed` MEANS, SAID ONCE, WHERE THE MARK IS

in `findCard`

```
/* ---------- AND WHAT `· not listed` MEANS, SAID ONCE, WHERE THE MARK IS ------------------
            REPORTED THREE TIMES AS *"i still dont see george"*, AND HE WAS ON THE SCREEN. Measured:
            an admin's account column opens ON the unlisted tutor — `PAGE_HOME.account` is page 1
            — dimmed, with `· not listed` beside the role and a `set-listed` tile under the card.
            What was missing is that every one of those signals says a STATE and none of them says
            what to do about it: `tile_` puts a tile's label in `title` and `aria-label` only, which
            is a recorded decision and not one to undo here, so on a phone the only way back is an
            unlabelled crossed-out eye in a row of icons.

            ONE LINE UNDER THE ROW RATHER THAN A WORD ON THE BUTTON is what the house style says for
            exactly this — see `jobAdminTiles_` — and here it is at the TOP of the card because
            that is where the mark it explains is. It says the consequence rather than the cell:
            "clients cannot see them" is what `listed` means, and the tile is what changes it.

            ADMIN ONLY, because nobody else is ever sent an unlisted tutor: `doGet`'s gate is
            `(listed || viewerIsAdmin)`, so a client's payload has no such row and repeating the
            rule here would be the second copy this repository keeps paying for. */
```

### A TICKED TUTOR BOX IS A QUESTION TO THE ADMIN, and this is where it is answered — the same switch, so the sentence says what pressing it MEANS for somebody who

in `findCard`

```
/* A TICKED TUTOR BOX IS A QUESTION TO THE ADMIN, and this is where it is answered — the
            same switch, so the sentence says what pressing it MEANS for somebody who asked:
            `setMyRoles` holds them at `PENDING` and `setListed` writing TRUE is the approval. */
```

### THE FACE IS `personFace_` (links.js), THE ONE FUNCTION EVERY FACE GOES THROUGH:

in `findCard`

```
/* THE FACE IS `personFace_` (links.js), THE ONE FUNCTION EVERY FACE GOES THROUGH: a photograph
              as it always was, one of the ten pictures, the figure when the row carries it — the
              owner, 10 Oct: *"…which allow you to use your avatar as a dp."* — or the initial. This
              card is yours, a tutor's, your family's and everybody on an admin's column, so this one
              line is most of the places a person's picture is seen. */
```

### ---------- AND THE HANDLE, WITH THE `@` THAT IS NOT IN THE CELL

in `findCard`

```
/* ---------- AND THE HANDLE, WITH THE `@` THAT IS NOT IN THE CELL ---------------------
                ASKED FOR AS *"each person should have … handle llik \"@_____\""*, and the visible
                half of that was missing: `doGet` has sent `handle` on every tutor since it was
                written, and measured across `js/`, the only place the `@` appeared was a toast in
                `changeHandle`. So a handle was a thing you signed in with and never saw.

                THE `@` IS DRAWN AND NOT STORED. The cell holds `halex_kind`; `findPerson`
                resolves through `key()`, which strips the `@` anyway, so a stored one would be a
                character that means nothing to every reader and has to be remembered by every
                writer. Same separation as `spellShow_`: what is matched and what is shown.

                WHATEVER THE SERVER RESOLVED, which is worth knowing before anybody reads one.
                `doget.gs` sends `handle || username || first_name`, so a row with neither column
                filled in shows an `@` in front of a FIRST NAME — true of every account made before
                `register` started generating one, and what `?run=fillHandles` is for. */
```

### ---------- THE RATE, UP HERE AND BIGGER

in `findCard`

```
/* ---------- THE RATE, UP HERE AND BIGGER ------------------------------------------------
                ASKED FOR AS *"rate should appear near profile at the top and bigger."* It was the
                eleventh label/value row, under the qualifications — and it is the one number a
                parent opens this card to find. One place: the `Rate` row it replaces is gone, so the
                card cannot print two rates that disagree. */
```

### ---------- NO CITY AND NO DBS STAMP UP HERE

in `findCard`

```
/* ---------- NO CITY AND NO DBS STAMP UP HERE --------------------------------------------
                ASKED FOR AS *"remove the city which appears under the rate"* and *"enhanced dbs check
                shouldnt appear up there. treat it like an extra qualification thing. thats how they
                activate it."* `Enhanced DBS` is on the extra-qualifications list, so a tutor who holds
                one ticks it and it is drawn as a dashed chip under Qualifications with everything else
                they typed. The `dbs_checked` stamp went, which means the card no longer says a DBS is
                MISSING — absence is now silence, like every other qualification. Checking the
                certificate is the business's job and belongs with the records, not on the card. */
```

### ---------- THEIR OTHER PHOTOGRAPHS, AS SMALL SQUARES

in `findCard`

```
/* ---------- THEIR OTHER PHOTOGRAPHS, AS SMALL SQUARES --------------------------------------
            ASKED FOR AS *"tutors should be able to add more pics."* `doGet` sends `photos`, the links
            after the face (`photosList_`), and an older backend sends no key at all — which draws
            nothing, rather than a grid of nothing.
            FOUR TO A ROW, because this card is somebody's CV rather than their feed: eight photographs
            are two rows of thumbnails a parent can take in at once, where the post grid's two-wide
            squares would be four rows — most of a phone — under a profile.
            AND THEY STAY SQUARES. A tap opened one across the whole row, and a second put it back; the
            owner, 10 Oct: *"i dont like how you made it so people can enlarge a photo of tutor. the
            extra ones"*. So a square is a picture and nothing else — a `<span>`, not a button, with
            nothing to press and no "tap to see it bigger" read out, the same reason the week on this
            card is spans (`profAvail_`): a cell that is not a control is not marked up as one. */
```

### THE THREE ADJECTIVES OFF THE SHEET, AS BOLD WORDS AND NOT CHIPS.

in `findCard`

```
/* THE THREE ADJECTIVES OFF THE SHEET, AS BOLD WORDS AND NOT CHIPS. Asked for as "the
            adjectives for tutors shouldnt be like google chips. they should be like just bold words to
            catch attention." A chip is a fact somebody scans for — a subject, a group size — and the
            rows below are chips for that reason. These are the tutor describing themselves, which is
            read rather than scanned, so they are one line of words with a gold dot between them.
            Capped at three because the tab has exactly three columns. */
```

### ---------- EXPERIENCE, GROUP SIZE AND SESSION LENGTH, AS CHIPS

in `findCard`

```
/* ---------- EXPERIENCE, GROUP SIZE AND SESSION LENGTH, AS CHIPS --------------------------
            ASKED FOR AS *"the years experience should also be a google chip type thing … sesson
            lenth should also be a google chip. same with student number size."* They were three
            label/value rows; each is one short fact a parent scans for, which is what a chip is.
            Captioned so a chip reading `1–4 students` does not have to explain itself. The extra
            seat is not a chip: it is beside the rate, which is where a price is looked for. */
```

### ---------- THE ROWS, AND EVERY ONE OF THEM IS DROPPED WHEN IT IS EMPTY

in `findCard`

```
/* ---------- THE ROWS, AND EVERY ONE OF THEM IS DROPPED WHEN IT IS EMPTY -------------------
            `.filter(Boolean)` AT THE END IS THE WHOLE RULE. A tutor with no qualifications typed in
            should show a shorter card, not a card with `Qualifications —` on it: a labelled blank
            is a claim that somebody looked and there was nothing, which is the sentence this
            repository has written down five times. `row` prints a dash for an empty value, so the
            emptiness has to be decided here, before it is asked for. */
```

### ---------- WHAT THEY TEACH, AS THE SAME CHIPS THE ADJECTIVES ARE

in `findCard`

```
/* ---------- WHAT THEY TEACH, AS THE SAME CHIPS THE ADJECTIVES ARE ------------------------
            ASKED FOR AS *"can you see how adjectives look like google chips? i want the same for
            the subjects in tutors profile cards. to look like this ( Maths (GCSE) )"*. It was a
            `Teaches` row, a comma list — and each subject is a separate claim a parent is looking
            for, which is the argument the adjectives' own note makes for being chips.
            THE SPECIALISMS ARE MARKED, and `teachesSpec` says which they are rather than position:
            a tutor with no specialism and two other subjects must not have the first drawn as one.
            `mark` still runs inside each chip, so a search for "GCSE" lights the chip it matched.
            NOT UPPER-CASED, unlike the adjectives: "MATHS (GCSE)" is a subject shouted, and the
            owner's own example is written in the case the sheet holds. */
```

### ---------- FIVE CAPTIONS, IN THIS ORDER, AND NO OTHERS

in `findCard`

```
/* ---------- FIVE CAPTIONS, IN THIS ORDER, AND NO OTHERS ----------------------------------
            ASKED FOR AS *"there should be x number of titles. at a glance, teaches, can also teach,
            qualifications, tutors at."* So `Teaches` is every level a tutor ticked `Teach` on (see
            `qualSlot_` in me.js) — and everything
            else they ticked `Can teach` on is its own caption, where it used to share a row with the
            specialism and be told apart only by a gold edge. The `Focus` row went: it was a sixth
            title nobody asked for. `teachesSpec` is still said by the server rather than read off
            position, so a tutor with no specialism gets no `Teaches` row rather than their first
            "also" subject promoted into it. */
```

### SEVERAL TEACHES. *"when i tick teach for different levels of same subject it unticks the other one. i dont want that"* — so `teachesSpec` is a list, every one

in `findCard`

```
/* SEVERAL TEACHES. *"when i tick teach for different levels of same subject it unticks the
            other one. i dont want that"* — so `teachesSpec` is a list, every one a gold chip under
            `Teaches`, and `Can also teach` is the rest. An older backend sends one string as
            `teachesMain`, which `profList_` reads as a list of one. */
```

### ONE CHIP A SUBJECT, ITS LEVELS RAISED — `teachGroups_`.

in `findCard`

```
/* ONE CHIP A SUBJECT, ITS LEVELS RAISED — `teachGroups_`. The split into the two rows is
            still made on the PHRASE, before any grouping, so a tutor who specialises in Maths at
            GCSE and also teaches it at A-Level gets `Maths ^GCSE` in gold and `Maths ^A-Level` under
            Can also teach. That is the truth; grouping first would put a level they did not
            specialise in under the gold edge. */
```

### ---------- QUALIFICATIONS, AS THE SAME CHIPS

in `findCard`

```
/* ---------- QUALIFICATIONS, AS THE SAME CHIPS ---------------------------------------------
            ASKED FOR AS *"qualifications should also look like google chips."* One chip a
            qualification, and since *"Maths subscript to it is grade and super script is the
            level"* each is written like an isotope — `profQuals_`, above. A PGCE or a DBS is one of
            these entries — the separate "more qualifications" field is gone — and stays a plain chip. */
```

### ---------- A VENUE IS AN ORDINARY CARD

in `findCard`

```
/* ---------- A VENUE IS AN ORDINARY CARD ------------------------------------------------------
     IT WAS THE SLIP ON THE DOOR — cream paper, a torn perforation and a stub, drawn to read as a
     booking form you tear off. Asked to go: "venues have unique css. i dont want that anymore."
     So it is `.card` with an `h3` and `row`s, which is exactly what a level and a subject are, and
     nothing it said is lost — the place, the line under it, one row per room with how many fit and
     what an hour costs, and the notice it needs. ONE LINE PER ROOM stays, for the reason it was
     written: Richmond is three rooms at three prices, and a single "from" figure was the cheapest
     of them dressed as the answer. */
```

### ---------- A LEVEL IS THE OTHER HALF OF A SUBJECT CARD

in `findCard`

```
/* ---------- A LEVEL IS THE OTHER HALF OF A SUBJECT CARD ----------------------------------------
     GCSE was never a thing you could look at. It was a word inside a tutor's `teaches` string, a
     key in the pricing tab and an option on the booking form, and none of those three knew about
     the others — see `levelRows` for what that costs. This is those three facts on one card.

     NO NEW COLOUR. Green is a subject, purple a venue, red a tutor, and style.css says plainly
     that a fourth would turn a vocabulary into a legend. A level is not a fourth thing to scan a
     list for — it is a property of the three — so its name is set in the ordinary colour and the
     SUBJECTS on it are green, which is the same green they are everywhere else.

     THE TWO GAPS ARE PRINTED, not hidden behind a blank. A level with no multiplier says so
     instead of quietly reading "no surcharge"; a level the booking form has never heard of says
     so instead of looking exactly like one you can book. Both are admin-facing faults sitting in
     a client-facing list, and the only way either was ever going to be noticed is if something
     drew it. */
```

### Tapping one opens a sheet rather than expanding the card.

top level, before `on`

```
/* Tapping one opens a sheet rather than expanding the card. An expanding card pushes everything
   below it down, which on a phone means the thing you were looking at moves the moment you touch
   it — a sheet leaves the list exactly where it was. */
```

### ---------- `on('who')` WAS HERE

top level, before `on`

```
/* ---------- `on('who')` WAS HERE ----------------------------------------------------------------
   It opened a panel over a pass or a slip that already said everything in it. Every fact it
   added is on the card now and the one button is a row underneath. See `tutorTiles_` and
   `venueTiles_` in tiles.js.
--------------------------------------------------------------------------------------------- */
```

### ---------- `el.checked` WAS READ HERE, AND THIS IS NO LONGER A CHECKBOX

top level, before `on`

```
/* ---------- `el.checked` WAS READ HERE, AND THIS IS NO LONGER A CHECKBOX -----------------------
     It became a tile when the tutor sheet went, and `.checked` on a button is `undefined` — so this
     sent `on: undefined` on every press and put `!undefined`, which is `true`, back on failure. The
     switch was broken in both directions and looked like a backend problem.

     THE FILL IS THE STATE NOW, the same way it is on a star: `.on` is what the tile is showing, so
     `.on` is what it currently means, and the new value is the opposite of that. */
```

### `load()` WAS HERE — the whole payload fetched again to change one word.

top level, before `id`

```
/* `load()` WAS HERE — the whole payload fetched again to change one word. Nothing else on the
         screen depends on whether one tutor is listed, so nothing else needs redrawing. The row's
         own `listed` is updated so a later repaint from anything else agrees with the tile. */
```

### THE OTHER HALF OF THE CLICK HANDLER.

top level, before `el`

```
/* THE OTHER HALF OF THE CLICK HANDLER.
   A checkbox is not clicked in the way a button is — the change event is what tells you it
   actually flipped, and reading .checked in a click handler can catch it mid-flight. A select is
   the same problem said louder: its value only means anything after `change`.
   So both come through here, and the click handler above refuses them. */
```

### ---------- `on('subject')` WAS HERE

top level, before `STUFF.filters`

```
/* ---------- `on('subject')` WAS HERE -------------------------------------------------------------
   The surcharge and the tutor names were already on the card; the levels have joined them, and
   `Book this` is a row underneath. The one thing genuinely lost is the list of tutors AS CARDS
   inside it — which was a list of passes reachable only by opening a subject, when the same
   passes are one filter away on the same screen.
--------------------------------------------------------------------------------------------- */
```

### ---------- BOOKING FROM A CARD

top level, before `STUFF.filters`

```
/* ---------- BOOKING FROM A CARD --------------------------------------------------------------------
   IT WENT TO A COLUMN THAT NO LONGER EXISTS, and said "not built yet" on arrival — which was true
   when it was written and has not been for a while.

   IT ASKS THE FUNNEL INSTEAD. "What for · Booking" is the filter the booker lives behind, so
   pressing Book on a tutor or a venue is answering that question on your behalf and landing you on
   the form. The name on the button is not carried through yet: `data-name` is read by nothing, and
   pre-filling the tutor from here is a change to `BOOKING`, not to navigation. */
```

