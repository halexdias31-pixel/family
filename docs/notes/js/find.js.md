# js/find.js

The full text of comments in `js/find.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — find.js ONE FILE, SPLIT.

top level, before `STUFF`

```
/* ==================================================================================================
   @family. — find.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   find.js is number 10 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### ---------- SHOP & RESOURCES

top level, before `STUFF`

```
/* ---------- SHOP & RESOURCES --------------------------------------------------------------------
   Two lists that belong together because both are things you GET — one for credits, one for free,
   which is a smaller difference than either has with anything else in the app.

   With four hundred resources this is the one screen that genuinely needs finding tools. Four of
   them, and they do different jobs — which is why all four are here rather than one clever one:

     SEARCH   I know what it is called
     FILTER   show me only this kind
     GROUP    lay it out by subject, or by grade
     SORT     put the ones I want first

   THE CONTROLS ARE NOT REDRAWN WHEN THE LIST IS. Only `#stuff-list` is rewritten, so an open
   dropdown is never destroyed mid-choice and the search box never loses focus or caret — which is
   what the refocus hack under the old input handler existed to paper over.
--------------------------------------------------------------------------------------------- */
```

### FILTERS YOU ADD, not a mode you pick.

top level, before `STUFF`

```
/* FILTERS YOU ADD, not a mode you pick.

   One dropdown could only ever ask one question: shop only, OR Maths, OR things you can afford —
   never Maths AND Grade 9 AND resources, which is the question somebody actually has. So a filter
   is a thing you add to a list, and the list is what narrows the results.

   TWO RULES, and they are the ones every filter list uses because they are the ones people mean:
     · SAME field  → either. Adding Physics after Maths shows both, because nobody adds a second
                     subject in order to see fewer things.
     · OTHER field → both. Maths and Grade 9 is Maths at Grade 9.

   Each one is a chip you can take off, so nothing can be narrowing the list without saying so —
   which is the failure of a dropdown you set three screens ago and forgot about. */
```

### `groupBy` WAS HERE — the field the list was currently collected by.

top level, before `STUFF`

```
/* `groupBy` WAS HERE — the field the list was currently collected by. THE COLLECTION WENT: a line
   above the funnel reading "or the 227 papers these are in" was a second way of narrowing sitting
   above the first, and a screen with two of those is a pivot table. A paper is now an ANSWER to an
   ordinary question — see `paperId` in FACETS — which is what it should always have been. */
```

### `whose` IS ONLY EVER SET WHILE NOBODY IS SIGNED IN:

top level, before `STUFF`

```
/* `whose` IS ONLY EVER SET WHILE NOBODY IS SIGNED IN: the person whose session died under them with this
   question on Find (`ended` in `signedOut_`), so that only they, signing in again, are handed it back.
   Empty otherwise — signed in, the question is `USER`'s; signed out, it is the holder's. */
```

### A `let` SINCE THE SECOND FINDER (below):

top level, before `STUFF`

```
/* A `let` SINCE THE SECOND FINDER (below): `STUFF` is the state of whichever finder is being drawn,
   and Find's whenever none is being drawn. The object itself is never replaced — Find's is this one
   for the life of the page — only which finder's object the name stands for. */
```

### ---------- ONE FINDER, TWICE

top level, before `RES_ST`

```
/* ---------- ONE FINDER, TWICE ---------------------------------------------------------------------
   THE OWNER, 12 Oct: *"Also forget what I said about the finders regarding one having content and
   other have exercises. Return to that origional finder having everything and now there is just an
   identical second finder. Smart students will know to use this second finder to have the content up
   while they do questions on the origional finder."* So there are two finders, Find (`stuff`) and
   Find 2 (`res`), immediately right of it, and they are the SAME finder: both carry every item the
   funnel offers and ask the same questions of it. What the second one is for is its own STATE — its
   own words, chips, page and kept place — so a chapter can stay up in one column while the questions
   on it are answered in the other.
   IT WAS A SPLIT FOR TWO DAYS (10 to 12 Oct, docs/history/329): the second column carried only the
   kinds whose label is Resources and Find the rest, a kinds-table rule (`resKind_`) on each finder's
   list, links routed "to the finder that holds it" (`finderOfItem_`), an empty search that offered
   the other column, and a kept place that dropped the other finder's chips. All of that is gone
   (docs/history/347); the binding below is what was kept, because it is the half the owner's use
   depends on.

   ONE ENGINE, NOT A COPY. The funnel is this file, and it reads `STUFF` and its memos by name at
   about a hundred places. A copy is two engines that drift; a scope threaded through every function
   is forty signatures, several of which the checks call. So the engine is untouched and what moves is
   WHOSE its globals are: `inFinder_(F, fn)` parks the bound finder's state on its record (`STUFF`,
   `ITEM_MEMO`, `FIND_MEMO`, `STUFF_PAGES`, `CHIP_SHOW`, its two timers and its kept-place flag), puts
   F's in their place, runs fn, and puts everything back in a `finally` — so a throw cannot leave one
   finder holding the other's chips. The bound finder's state lives in the globals; every other
   finder's lives on its record. That is the whole invariant.

   OUTSIDE A BINDING IT IS FIND. Every other file that writes `STUFF.filters` — the booking doors in
   receipt.js and cards.js, sign-out in me.js — means Find and gets Find, and so does every check that
   pokes `STUFF` from outside. Only find.js binds, at the places a finder is drawn, pressed, filled or
   typed into: the screen draw, the funnel's handlers, the fill and the search box. So the two finders'
   chips, words, page and place cannot reach each other — which is now the only thing that makes the
   second one worth having.

   WORK THAT RUNS LATER RUNS OUTSIDE THE BINDING, which is the one rule this adds. A timer, a
   microtask, an `afterSlide_` job or a promise captures its F and binds again — the late fill
   (`STUFF_LATE`), the draw's microtask, the search box's debounce, the `fill:` keys in shell.js and the
   Bible's index landing are all written that way. `afterSlide_` dedupes by key, and by function when
   there is none, so a finder's fill is booked under `'fill:' + id` or two finders' fills become one.
   AND SOMETHING THAT FORGETS "THE FOUND LIST" FORGETS EVERY FINDER'S (`finderEach_`,
   `finderForgetFound_`): a `FIND_MEMO.key = null` written outside a binding reaches Find's alone, and
   with both finders holding the friends, the Bible and every question, the other would go on
   answering from the list before the change. */
```

### A FINDER'S RECORD: who it is and — while it is not the bound one — its parked state.

top level, before `finder_`

```
/* A FINDER'S RECORD: who it is and — while it is not the bound one — its parked state. `place` is the
   surface its kept place is filed under (`draftKeep_`); `widgets` is whether the Tools tail of the fill
   runs (Find's alone — one widget started and stopped by two columns would be started twice);
   `front` the pages between the question and the results — the booking form, the posts, the bundles —
   FIND'S ALONE, because they are not search results: the booking form is one draft of one booking
   (`BOOKING` is one global state), and a second copy of it one swipe along would be a second form
   writing the same booking; `empty` what an empty database says, the same sentence in both. There is
   no `has` any more: both finders carry everything (347). */
```

### By screen id; and by the screen an element is drawn in, falling back to the column in front and then Find — a handler pressed from a detached button

top level, before `finderOf_`

```
/* By screen id; and by the screen an element is drawn in, falling back to the column in front and
   then Find — a handler pressed from a detached button (the checks do that) still acts on a finder,
   and a press from Saved or the Spotlight, which are no finder, acts on Find.
   `finderOfItem_` WAS HERE — "the finder that holds this item" — and went with the split (347). With
   both finders holding everything it could only ever answer Find, which would have hidden a decision
   in a function's name; each of its callers now says which finder it means. */
```

### ---------- ONE QUESTION AT A TIME

top level, before `KINDS`

```
/* ---------- ONE QUESTION AT A TIME ----------------------------------------------------------------
   Eleven filters as eleven controls is a form, and a form is the opposite of finding something.

   They are not eleven independent questions. Key stage decides band value. Tier only exists for
   some subjects at some levels. Exam wave contains the year. Board and company are near enough the
   same fact that one sheet row says Edexcel and Pearson. Asked all at once they are a wall; asked
   in order they collapse into two or three.

   SO: ONE RULE, AND EVERYTHING FOLLOWS FROM IT — only ever offer a filter that would change what
   you see. If everything left is Edexcel, do not ask about the board. If nothing left has a tier,
   do not ask about tier. That is not a guess about what people want; it is a fact about the
   remaining set, worked out again after every tap.

   Finding a past paper becomes: Maths → KS4 → Edexcel → Past paper. Four taps, one short list at a
   time, each shorter than the last because the one before it narrowed things.

   THE ORDER IS FIXED, and deliberately so. It mirrors how somebody actually asks — what sort of
   thing, what subject, what level, whose paper, what kind of paper — and a page that reorders
   itself is a page you have to read every time instead of reaching for.
--------------------------------------------------------------------------------------------- */
```

### WHAT KINDS OF THING CAN BE FOUND.

top level, before `KINDS`

```
/* ================================================================================================
   WHAT KINDS OF THING CAN BE FOUND.

   One entry per kind, and every question the app asks about a kind is answered here. Adding a new
   findable thing was four scattered edits — a branch in the group ternary, a branch in the label
   ternary, a branch in `stuffCard`, and a case in `stuffItems` — and getting three of the four right
   produced something that appears in a list, cannot be narrowed down, and renders as a blank card.

   `group` is the first question the funnel asks and `label` the second. Ordering the table puts
   things in the order they are offered, which is one more thing that used to live somewhere else.
================================================================================================ */
```

### A person, a place and a subject already have a card each — written for the Find screen and carrying the class that colours the name.

in `KINDS`

```
/* A person, a place and a subject already have a card each — written for the Find screen and
     carrying the class that colours the name. Reused rather than reimplemented: two cards for one
     tutor is two things to keep looking the same. */
```

### ---------- A TUTOR IS TWO THINGS AND THE GROUP HAD ROOM FOR ONE

in `KINDS`

```
/* ---------- A TUTOR IS TWO THINGS AND THE GROUP HAD ROOM FOR ONE --------------------------------
     BOOKING IS WHAT A TUTOR IS FOR; PEOPLE IS WHAT A TUTOR IS. Somebody arranging a session and
     somebody looking up who teaches their child are on different errands, and the first question
     asks which errand you are on — so filing a tutor under one of them meant the other had to
     answer wrongly to get there.

     A LIST RATHER THAN A SECOND KIND. Two kinds for one row is two cards to keep looking the same,
     which is the mistake the note above already refuses. `group` may be an array now; everything
     that reads it — the coverage rule, the value counts, the filter test and the group order —
     takes one or many. See `asList_` below. */
```

### ---------- `People` IS GONE AND A TUTOR IS JUST A BOOKING THING AGAIN

in `KINDS`

```
/* ---------- `People` IS GONE AND A TUTOR IS JUST A BOOKING THING AGAIN --------------------------
     IT WAS TWO GROUPS BECAUSE A TUTOR IS TWO THINGS — what they are FOR and what they ARE — and
     `People` was the second half. That half now has a column of its own, so answering it here was a
     second route to a screen you can reach by swiping, and a second route is a second thing to keep
     right. The array stays supported everywhere that reads it (`asList_`); nothing in this build
     uses two groups any more. */
```

### ---------- YOUR OWN PASS IS YOUR OWN CARD

in `tutor`

```
/* ---------- YOUR OWN PASS IS YOUR OWN CARD ------------------------------------------
                THE MERGE HAPPENS HERE, ON THE TUTOR ROW, and the first attempt had it backwards: I
                dropped you from the tutor list so the account card could hold the pass, which took
                you out of Booking · Tutors — where you are a tutor, and where you should be listed
                among them.

                SO THE ROW STAYS AND THE CARD CHANGES. Everybody's pass draws as a pass; yours draws
                as your pass with your credits, your details and the way out beneath it. One row, one
                card, in every list a tutor belongs in. `meCard` calls `findCard` directly for the
                pass itself, so this cannot come back round on itself. */
```

### ---------- A VENUE IS A BOOKING THING AGAIN, AND THAT IS WHAT TAKES IT OFF FIND

in `KINDS`

```
/* ---------- A VENUE IS A BOOKING THING AGAIN, AND THAT IS WHAT TAKES IT OFF FIND -------------
     IT WAS `Booking, Places` — two groups, which was the mechanism behind "add venues to finder":
     `FUNNEL_NOT_FOR` drops a kind whose group list is EXACTLY `['Booking']`, and a second group was
     the comma that got past it. The first Find question then read `Booking, Places (13) | Learning
     | Links | Shop`, and `asList_` does not split the code's own cell, so the door was ONE chip with
     a comma in its name. Every check missed it because `check/fixture.json` sent a `kinds` tab
     production does not have, and its rows put the venue under `places` instead.

     TAKEN BACK OUT ON THE OWNER'S WORD: *"Get rid of booking places. Get rid of shop tag. I will
     make a new coloumn for shop stuff. So finder now will become just learning stuff."* So the one
     group is the whole change, and `FUNNEL_NOT_FOR` does the rest with nothing added to it.

     NOTHING GOES DARK. A venue is still a row in `stuffItemsRaw_`, so a STARRED venue is still on
     Saved (`collItems_` reads `stuffItemsAll_`), and the booking form's venue dropdown and the
     pricing read `venueRows` and never read this. `check-flow.js` asks both halves.

     AND `borough` GOES QUIET WITH IT. `Where` was answered by eleven venues and by nothing else —
     measured over the real venues and the real shop — so its row in `data/settings/facets.json` is
     switched off rather than left to be asked of nobody. */
```

### A LEVEL IS THE FOURTH THING A BOOKING IS ASSEMBLED FROM — who, where, what, and how far on — and it was the one you could not look at.

in `KINDS`

```
/* A LEVEL IS THE FOURTH THING A BOOKING IS ASSEMBLED FROM — who, where, what, and how far on —
     and it was the one you could not look at. Same group as the other three because it is the same
     errand: this is a thing you book with, not a thing you learn from. */
```

### ---------- YOUR OWN SESSIONS ARE ANSWERS UNDER BOOKING

in `KINDS`

```
/* ---------- YOUR OWN SESSIONS ARE ANSWERS UNDER BOOKING ---------------------------------------
     THEY WERE KINDS, THEN THEY WERE NOT, AND NOW THEY ARE AGAIN — and the reason changed rather
     than the mind. Taken out, they had nowhere else to be but a column of their own, and the
     argument was that you do not SEARCH for your own bookings, you check them. That is still true.
     What is different is that Booking is now an answer in this funnel rather than a tab: choosing
     it is checking, and "Classes, Waitlists, Receipts" beside "Tutors, Venues, Subjects, Levels" is
     the whole of booking in one list — the four things a session is made FROM and the three things
     a session IS.

     THREE KINDS AND NOT ONE, because they are three different questions. What is running, what I am
     waiting for, and what has finished. A single `Sessions` answer would need a second question to
     separate them, and the second question is this one.

     THE SAME `jobCard` STUB IN ALL THREE. A session looks the same wherever it is seen — the stub
     already colours itself by `jobStage_`, so a waitlist reads as a waitlist without this having to
     know how one looks. */
```

### ---------- THE WHOLE RECEIPT, NOT A STUB THAT OPENS ONE

in `KINDS`

```
/* ---------- THE WHOLE RECEIPT, NOT A STUB THAT OPENS ONE ----------------------------------------
     `jobCard` IS A FOLD — a few lines with the subject and the day, made for a LIST, and tapping it
     opened the document in a sheet over the top of everything. A sheet is a screen you have to
     close, and the funnel has already done the narrowing that a list needs: by the time you are
     looking at `Booking · Classes` there is nothing on the page but your sessions, one to a page,
     which is the shape this app uses for a document everywhere else.

     SO THE PAGE IS THE DOCUMENT. `jobReceipt` is the paper opened out — the same fourteen rows the
     booking form drew — with the way in and the way to pay under it, which is where somebody
     deciding either would look for them. Nothing to open and nothing to close.

     `jobCard` STAYS FOR THE WIDGET, where a list is genuinely what is wanted: `Your sessions` in
     the tools drawer is a glance at several, not a read of one. */
```

### ---------- ONE ANSWER, NOT THREE

in `KINDS`

```
/* ---------- ONE ANSWER, NOT THREE ---------------------------------------------------------------
     `Classes`, `Waitlists` AND `Receipts` WERE THREE KINDS AND THAT WAS THE WRONG CUT. They are one
     kind of thing at four points in its life, and splitting them by state meant the same session
     moved between answers as it aged: you looked under Classes for the thing you booked in
     September and by December it had become a Receipt without telling you.

     AN ANSWER SHOULD NAME WHAT A THING IS, NOT WHAT STAGE IT IS AT. A session is a receipt from the
     moment it is asked for — that is what the card has always drawn, torn at both ends — and its
     stage is a line ON the receipt, which is where somebody reads it. That way the list is stable,
     the count means "sessions", and nothing has to be looked for in two places. */
```

### `coupon` WAS A KIND HERE — the classes with seats going.

in `KINDS`

```
/* `coupon` WAS A KIND HERE — the classes with seats going.
     Both have gone, and for opposite reasons.

     YOUR SESSIONS ARE PANES ON `You`: you do not search for your own bookings, you check them.

     THE OPEN CLASSES ARE A DROPDOWN ON THE BOOKING FORM. A findable kind for a handful of rows meant
     somebody wanting a class had to know to go looking for one, and somebody filling in the form was
     never told they existed — two ways to make a booking that did not look like each other. Now
     "Waiting list class" is answered on the paper and the row below asks which list. See `joining`
     in book.js. */
```

### ---------- YOU ARE FINDABLE, AND YOU ARE THE ONLY PERSON WHO IS

in `KINDS`

```
/* ---------- YOU ARE FINDABLE, AND YOU ARE THE ONLY PERSON WHO IS -------------------------------
     `People` HAS ONE ENTRY AND THAT IS THE POINT. Tutors are already a kind, filtered to public
     facts by the backend; friends are already a kind, name and handle and score. What was missing
     was you — your own account lived as a settings list on `You` while everybody else in the app
     was a card.

     NOTHING ELSE GOES IN THIS GROUP without a backend change. The `people` tab holds PINs, bank
     details, addresses and dates of birth, and `doget.gs` deliberately never sends it — a directory
     built from here would put all of that on every phone, and the leak would be invisible because
     the data would already have arrived. */
```

### ---------- BACK UNDER `People`, AND THERE IS NO `You` ANSWER

in `KINDS`

```
/* ---------- BACK UNDER `People`, AND THERE IS NO `You` ANSWER ---------------------------------
     IT WAS BRIEFLY ITS OWN ANSWER, on the argument that with the columns gone `forLabel` is the
     whole navigation and one of its answers had to be you. That was wrong for a simple reason: the
     card IS the answer. `meCard` carries your photograph, your name, your role, your credits and now
     the way out — so an answer called `You` led to one card, which is a question whose only purpose
     was to be answered.

     UNDER `People`, where a person goes, found the way every other person in this app is found. */
```

### `me` WAS HERE — you, under `People`, found the way every other person is found.

in `KINDS`

```
/* `me` WAS HERE — you, under `People`, found the way every other person is found. Removed with
     the group: your own card is the whole of the account column, one swipe right, and a funnel
     answer that leads to exactly one card you can already see is a question with nothing to decide.
     `meCard` itself stays and is still what a tutor row draws when the tutor is you. */
```

### ---------- THE PAPERWORK, AND IT IS A DEPARTMENT

in `KINDS`

```
/* ---------- THE PAPERWORK, AND IT IS A DEPARTMENT ------------------------------------------------
     ITS OWN GROUP, NOT UNDER `Learning`. The first question asks which errand you are on, and
     somebody looking for the cancellation policy is not revising — filing a policy under Learning
     would be answering that question wrongly in order to reach it, which is the fault the note above
     `link` already refuses.

     `kindLabel` COMES OFF THE ITEM, so the second question splits the library into `For tutors` and
     `For families` without a facet, a column or a line in FACETS — see `docItems_` in terms.js. And
     because a policy has no board, tier or key stage, the coverage rule stops every other question
     being asked at all. The whole department costs one entry here and one line in `stuffItems`. */
```

### ---------- POSTS ARE A THING YOU LOOK FOR

in `KINDS`

```
/* ---------- POSTS ARE A THING YOU LOOK FOR ---------------------------------------------------
     THE FEED IS FOR SCROLLING, NOT FOR FINDING. It is sorted by pinned and then by when, which is
     right for a feed and useless the moment somebody wants the picture from the trip in March — the
     only way to it was to scroll past everything newer, on the one screen where scrolling past
     something is how you never see it again.

     ITS OWN GROUP, NOT UNDER `Learning` OR `Booking`. A post is the business talking: an
     announcement, a photograph, a poll. It is not something you book with and not something you
     revise from, and filing it under either would be answering the first question wrongly to get
     to it — the same fault the note above `link` describes.

     THE CARD IS THE FEED'S OWN. `postCard_` in posts.js is the article the feed draws, lifted out
     of the `map` it was buried in — so a post found here is the same object with the same
     reactions, the same share button and the same admin controls, rather than a summary of one
     that then needs somewhere to open. */
```

### `post` WAS HERE — the real post card, reactions and all, answering under `Posts`.

in `KINDS`

```
/* `post` WAS HERE — the real post card, reactions and all, answering under `Posts`. Removed:
     the feed is a column, and the same post reachable two ways is two places for it to look
     different. `postCard_` stays; the feed is what draws it. */
```

### A BUTTON, NOT A SPAN — the fourth one of these.

in `card`

```
/* A BUTTON, NOT A SPAN — the fourth one of these. A span with a `data-do` cannot be
              reached by a keyboard, is not announced as a control, and `check/ui.js` never measures
              it because that pass looks at buttons, links and inputs. `.text-drop` looks the same
              either way; see the rule beside it in style.css. */
```

### ---------- BOXING IS A SUBJECT, NOT A DEPARTMENT

in `KINDS`

```
/* ---------- BOXING IS A SUBJECT, NOT A DEPARTMENT ------------------------------------------------
     THIS HAD ITS OWN GROUP, on the argument below — that a boxer is not something you book, learn
     from or buy. That argument was wrong, and the first question showed why: Booking, Boxing,
     Learning, Shop, Tools & games. Four of those are things you might want to DO with the app and
     one is a topic, sitting at the same level, as though boxing were a department.

     A BOXER IS SOMETHING YOU LEARN ABOUT, exactly as a past paper is. So the group is Learning and
     the SUBJECT is Boxing — which puts it in the list beside Maths and English, where anybody
     looking for it would look, and where it can be narrowed by division the way a paper is
     narrowed by exam board.

     The old reasoning is kept below because it is the reasoning that has to be answered, not
     deleted: what it got right is that a boxer is not a resource. What it missed is that the first
     question is not asking what KIND of record a thing is — it is asking what you came here to do.
  ------------------------------------------------------------------------------------------------
     ITS OWN GROUP. A boxer is not something you book, learn from or buy — and folding him into
     Learning would put a dead heavyweight in the same list as a past paper. */
```

### LABELLED `Resources`, LIKE A TOPIC AND A PAST PAPER, because that is what the second question is asking:

in `KINDS`

```
/* LABELLED `Resources`, LIKE A TOPIC AND A PAST PAPER, because that is what the second question
     is asking: what KIND of thing, not which table it came out of. `Boxers` and `Fights` as their
     own kinds put the storage shape on the screen — the user does not have a boxers tab, they have
     a subject they want to read about. Two kinds sharing a label is already how `topic` and
     `question` work, and it is the reason Boxing can then turn up under Subject beside Maths and
     English rather than as a department of its own. */
```

### A PRACTICAL IS A THING YOU FIND, which is why it is in the funnel at all and tools and games are not.

in `KINDS`

```
/* A PRACTICAL IS A THING YOU FIND, which is why it is in the funnel at all and tools and games
     are not. You do not know which experiment you want -- you know the topic, or the subject, or
     that you have forty minutes and no lab. All four of those are questions the funnel already
     asks, so this needed a mapper and a card and nothing else. */
```

### ---------- A PROJECT IS THE PRACTICAL'S SIBLING, NOT ONE OF ITS SHAPES

in `KINDS`

```
/* ---------- A PROJECT IS THE PRACTICAL'S SIBLING, NOT ONE OF ITS SHAPES ------------------------
     ASKED FOR AS "the projects are like practicles, but not practicles. so should be a new tag in
     the finder called projects." So it is a kind of its own beside `practical` rather than a third
     `practicalType` beside experiment and build: a how-to video has no independent variable, no
     exam board and no lab, and every one of those is a question the practical card asks.

     FOUND THE SAME WAY, which is the half that is like a practical: the topic, the subject, the
     level. Mapper, card, pages; nothing in the engine. */
```

### ---------- `film` WAS A KIND HERE, AND THE FILMS ARE OFF FIND

in `KINDS`

```
/* ---------- `film` WAS A KIND HERE, AND THE FILMS ARE OFF FIND ----------------------------------
     THE OWNER, 10 Oct: *"films should not appear in the finder it cannot be found there"*. It was a
     kind of its own, `Films`, one item per row of `DATA.films` — an admin's only, because `doGet`
     sends nobody else a row — with a card of its own (`filmCard_`) and a Watch tile (`filmTiles_` in
     tiles.js). A FILM IS FOUND IN GAMES → VIDEOS, which searches the same rows by title, year, kids,
     series and documentary and opens Drive from the row; Find was a second, worse door to the same
     list, and the one the owner did not want.

     ALL OF IT WENT TOGETHER: this entry, the mapper in `stuffItemsRaw_`, `Films` in `KIND_BUCKET`,
     the card, the tile and `.fc-note p` (the card was its only producer). `DATA.films` AND THE SYNC
     STAY EXACTLY AS THEY WERE — the videos card reads them, and `filmsAdopt_` still calls
     `stuffForget_`, which is now a harmless rebuild. `check-flow` proves the absence for an admin with
     films in the payload: no film by title, no `Films` under What kind, and the videos card still
     finds it. See docs/history/326. */
```

### ---------- `textbook` WAS HERE, AND EACH OF ITS CHAPTERS IS A CONTENT CARD NOW

in `KINDS`

```
/* ---------- `textbook` WAS HERE, AND EACH OF ITS CHAPTERS IS A CONTENT CARD NOW -----------------
     IT WAS ONE RESULT A BOOK, labelled `Resources` on the `@family. textbooks` shelf, with a contents
     card and a page per chapter. THE OWNER, 12 Oct: *"for maths text book begin adding topic tags so
     students can immediately find what they need. Forget the whole concept of it being a text book.
     It's just a "content card" or whatever. It can share same tags as questions e.g. gcse, ks2,
     maths."* So a chapter is ONE THING you find, the way a question is: `content`, its own answer
     under What kind beside Questions and Practicals, carrying the question library's Subject, Level,
     Tier and Topic in the library's own spellings (`contentItem_`), so "surds" finds the surds card
     beside the surds questions. The shelf and the `Book` question went with the book; a kept chip on
     either is dropped (`placeChipDead_`), and a star on a book names no item and is skipped by
     Saved (`collItems_`). `Content` IS THE CODE'S OWN LABEL, so an empty `kinds` tab still says it.
     See docs/history/347, part 2. */
```

### ---------- THE BIBLE, AND THE ONE KIND THE PHONE ITSELF KEEPS FROM ALL BUT AN ADMIN

in `KINDS`

```
/* ---------- THE BIBLE, AND THE ONE KIND THE PHONE ITSELF KEEPS FROM ALL BUT AN ADMIN -----------
     ASKED FOR AS "i want to add the bible to resources as a book. but only admin can see the bible."
     So it wears `Resources` like the textbook beside it, on a shelf of its own (`Books`), and its
     item exists only for an admin — `bibleItems_` and the long note above `bibleFor_` say why that
     gate is on the phone and why it is the one exception to Find being built the same for every
     role. THE ONLY ADMIN-ONLY KIND NOW: `film` was an admin's too, by the payload, until the films
     left Find (see where it was, above) — and it was never a role test on the phone.
     ONE KIND, TWO CARDS: the cover on Find's own list, and each of the 31,102 verses once the Bible is
     open (*"each verse is a widget"*) — `bibleCard_` tells them apart. */
```

### ---------- TWO GROUPS, NOT ONE GROUP AND THEN THE SAME QUESTION AGAIN

in `KINDS`

```
/* ---------- TWO GROUPS, NOT ONE GROUP AND THEN THE SAME QUESTION AGAIN ---------------------------
     `Tools & games` WAS ONE ANSWER THAT IMMEDIATELY ASKED ITSELF. Choosing it led to a second
     question whose two answers were the two halves of the name you had just read — so the name
     posed the choice and the tap did not make it. Two taps to say a thing you had already decided
     before the first one.

     AND THEY ARE NOT ONE ERRAND. A protractor and Flabby Pird are not near neighbours: somebody
     reaching for a timer in the middle of a session and somebody killing ten minutes want opposite
     things, and grouping them says they are variations of each other.

     SEPARATE, EACH GROUP HOLDS ONE KIND, so the second question is skipped by the one-answer rule
     and Games goes straight to the games. Same number of taps to reach a game, one fewer to reach
     a tool, and the first question now reads as five errands rather than four and a category. */
```

### ---------- THESE TWO STAY IN THE TABLE AND NO LONGER ANSWER THE FIRST QUESTION

in `KINDS`

```
/* ---------- THESE TWO STAY IN THE TABLE AND NO LONGER ANSWER THE FIRST QUESTION -----------------
     TOOLS AND GAMES ARE COLUMNS NOW, so the funnel stops OFFERING them — but deleting these two
     entries would be the wrong way to do it, and quietly so. A widget may file itself under another
     group: `book.js` builds one per live session with `kind: 'tool'` and `groups: 'Booking'`, so it
     answers under Booking beside the receipts, which is where somebody looks for a class.

     `kindOf_` FALLS BACK TO `{ group: 'Shop', label: 'Things' }` FOR A KIND IT DOES NOT KNOW. Take
     `tool` out of here and those session widgets do not disappear — they turn into Shop · Things,
     which is a wrong answer rather than a missing one, and the kind of wrong answer nobody reports
     because it looks like a category somebody chose.

     SO THE ITEMS ARE FILTERED INSTEAD, where they are built: a widget reaches the funnel only if it
     says which group it belongs to. See `allWidgets()` in the item list below. The plain tools and
     games say nothing, so they are not offered — and `Tools` and `Games` stop being answers because
     NOTHING ANSWERS THEM, which is how `facetValues` decides what to show. */
```

### ---------- `link` WAS A KIND HERE, AND THE LINKS ARE OFF FIND

in `KINDS`

```
/* ---------- `link` WAS A KIND HERE, AND THE LINKS ARE OFF FIND -----------------------------------
     ASKED FOR AS *"Get rid of links that's almost redundant now."* It was its own door, `Links`, 127
     bookmarks in 25 categories read off `data/settings/links.json` on every load — a bank, a
     download site and the BBC beside the past papers. Its card drew each site's own favicon and
     refused to link anything that was not an absolute http(s) address; both halves went with it
     (`faviconFor`, `faviconAlt` and `hostOf_` in links.js had no other caller).

     NOTHING ELSE READ THE LIST. The mapper in `stuffItemsRaw_` was the only reader of `DATA.links`,
     so the fetch, the mapping in `settingsInto_`, the `Category` question and its `facets.json` row
     all went in the same change. `data/settings/links.json` STAYS IN THE REPOSITORY, unread, as the
     archive of what the tab held. The one link the owner had asked for by name, the periodic
     table, was a Drive PDF; the cheat sheet tool draws a periodic table of its own (`M50` in
     mat.js), which never read this list. Putting links back is this entry, the mapper and the
     fetch: three places, all named in the history note. */
```

### ---------- A QUESTION IS NOT A DIFFERENT KIND OF THING FROM ITS PAPER

in `KINDS`

```
/* ---------- A QUESTION IS NOT A DIFFERENT KIND OF THING FROM ITS PAPER ------------------------
     I GAVE IT ITS OWN LABEL — "Questions" beside "Resources" — and that is two cupboards where
     there is one thing. Somebody after question 5b would have had to know which to open, and
     narrowing to Past paper would have hidden every question in it.

     SAME GROUP AND SAME LABEL AS A RESOURCE, so "Learning → Resources → Past paper" holds the
     paper AND its parts, and the Question and Part facets narrow from there. One funnel, which is
     the argument I made for the two extra rungs and then failed to build. Only the CARD differs,
     because a part is drawn differently from a paper. */
```

### ---------- `question` WAS A KIND AND IS NOT ANY MORE

in `KINDS`

```
/* ---------- `question` WAS A KIND AND IS NOT ANY MORE ------------------------------------------
     A PAST PAPER WAS DRAWN TWICE OVER. `paperCard` rendered the cover AND printed every question
     underneath it (`paperInline_`, since removed for a second reason — see the note where it used
     to be) — and each of those questions was ALSO its own card
     in the same list. Choosing Learning · Maths · Past paper gave you the paper, then the paper
     again one question at a time, and the answer to "which question" was a column of numbers 1 to
     23 drawn from all six papers of a sitting at once.

     THE FACETS BELOW WERE BUILT TO SURVIVE THAT. `paperName` says outright that it exists because
     "there was no which-paper", and `qNumber` and `qPart` narrow a list that should not have been
     long. Removing the second rendering removes the reason for all three.

     NOTHING IS LOST AND THE SEARCH STILL WORKS. The questions are one tap away on the card that
     names them, with their answers under them — `paperBody_` calls the same `answerBlock_`. And
     `paperText_(id)` already folds every question's words into the
     paper's own haystack, which is why searching `surds` finds the paper rather than nothing. */
```

### ---------- THE SHOP HAS A COLUMN OF ITS OWN, AND THIS IS NOT A DOOR ANY MORE

in `KINDS`

```
/* ---------- THE SHOP HAS A COLUMN OF ITS OWN, AND THIS IS NOT A DOOR ANY MORE --------------------
     ASKED FOR AS *"Get rid of shop tag. I will make a new coloumn for shop stuff."* The door stayed
     for one commit, because forty Things had no other way onto a screen; the Shop column is that way
     now, and `FUNNEL_NOT_FOR` keeps them off Find. The kind stays so Saved, the basket and the Shop
     column can still draw a shop row with the same card. */
```

### NO LONGER A TAP TARGET.

in `widgetCard_`

```
/* NO LONGER A TAP TARGET. The sheet it opened was not a description of the tool, it WAS the tool —
     so there is nothing to summarise here and nothing a panel added except a lid. `widgetTiles_`
     opens it inside this card instead, and closes it with the same row. */
```

### One card shape for both, because they are the same kind of thing to a person looking for one:

in `thingCard_`

```
/* One card shape for both, because they are the same kind of thing to a person looking for one:
     a picture, a name, what it belongs to, and — if it costs anything — what.

     A RESOURCE SHOWS NO PRICE AT ALL. It used to say "0 credits — free", on the argument that a
     blank where a price should be reads as the app having forgotten. That argument holds for one
     card among priced ones and collapses when four hundred of the four hundred and ten say it:
     repeated on every row it stops being information and becomes a line you read past, and the
     one card that DOES cost something loses the contrast that made its price visible.

     A shop item priced at zero still says free, because there it means something — free among
     things that cost. A resource is free because it is a resource. */
```

### WHAT IT TAKES TO HAVE IT.

in `thingCard_`

```
/* WHAT IT TAKES TO HAVE IT. Three answers, and the card used to give one:
         a level    — earned, not bought. Gold once you are there, faint until then, and it says
                      WHICH level rather than "locked", because a number you can count towards is
                      a different thing from a door.
         credits    — bought. Gold when you can afford it.
         nothing    — genuinely free, which for a wearable means everybody starts with it. */
```

### ---------- AND A FOURTH ANSWER: NOBODY HAS PRICED IT

in `thingCard_`

```
/* ---------- AND A FOURTH ANSWER: NOBODY HAS PRICED IT --------------------------------------
         not priced — the cell is empty. Said out loud, faintly, rather than folded into `free`.
       THE LIST ABOVE SAID THREE AND THE CODE GAVE THREE, and the fourth state existed the whole
       time: `Number('') || 0` made a blank price a price of nought, so every wearable
       `seedAvatarItems` wrote — seven of them, at 15 to 40 coins in `AVATAR_ITEMS` — was drawn as
       FREE on every phone. `priced_` on the mapper is what tells the two apart now, and this is the
       half that has to say so, because `undefined` printed straight into the old branch reads
       `undefined credits`.

       FAINT AND NOT ALARMING. An unpriced row is an admin's unfinished cell, not a fault a visitor
       can do anything about — and calling it "free" is the one thing it must not do, because
       somebody presses that. Same argument as the DBS stamp: absent is not a negative, it is a
       blank, and the two are different sentences. */
```

### ---------- A QUESTION IS A QUESTION. THERE ARE NO DOCUMENTS ON THIS SCREEN.

in `thingCard_`

```
/* ---------- A QUESTION IS A QUESTION. THERE ARE NO DOCUMENTS ON THIS SCREEN. ------------------
       `paperCard` WAS HERE, drawing a past paper as the cover of one — board across the top, tier
       in the corner, a ruled box for a candidate's name. It was a good card and it is gone with the
       thing it drew: the funnel lists QUESTIONS now, and a collection is not a result.

       WHY. A document is a box with questions in it, and this screen is for finding a question.
       Putting the box in the list meant every search returned two kinds of thing that answer the
       same facets — choose Edexcel · 2022 · Higher and you got the paper AND its parts — and every
       attempt to make that read properly made it worse: the paper drawn twice, then the whole paper
       printed onto its own card, then a card that was a cover you had to open. Three goes. The
       collection was the problem, not how it was drawn. */
```

### THE CARD IS NO LONGER A BUTTON.

in `thingCard_`

```
/* THE CARD IS NO LONGER A BUTTON. Its surface opened a sheet that repeated the card and then
       offered four controls; the controls are ON the card now, so the surface has nothing left to
       do — and leaving it tappable means every tap that misses a tick by two pixels opens a panel.
       A WEARABLE IS THE ONE EXCEPTION and keeps its sheet: buying one and putting it on are a
       single act with no basket in it, which is a different gesture from anything in a tile row. */
```

### NOTHING ON THIS LIST IS A TAP TARGET ANY MORE.

in `thingCard_`

```
/* NOTHING ON THIS LIST IS A TAP TARGET ANY MORE. The wearable was the last exception — it kept
       its sheet because buying and wearing are one act — and that act is now the row underneath,
       which says which of the three it is rather than making you open a panel to find out. */
```

### A WEARABLE DRAWS ITSELF.

in `thingCard_`

```
/* A WEARABLE DRAWS ITSELF. It has no photograph and never will — the drawing is the
              object, and a card selling a cape with nothing on it was selling a word.
              Cropped to the item rather than shown on a figure: a card-sized person wearing a
              scarf makes the scarf the smallest thing on the card. */
```

### ---------- A RESULT IS READ LIKE A SEARCH RESULT

in `thingCard_`

```
/* ---------- A RESULT IS READ LIKE A SEARCH RESULT -------------------------------------
                WHERE IT IS FROM GOES ABOVE THE NAME, not under it. That is the one structural thing
                Google's results do and almost nothing else does, and the reason is scanning: down a
                list of twenty, the eye lands on the same spot on every row, and the FIRST thing it
                should meet is what kind of thing this is — 1stclassmaths · KS2 · Year 4 — so that a
                row can be dismissed without reading its title at all.

                Under the title it would be a footnote, read only by somebody already interested,
                which is backwards. Half of searching is ruling things out.

                IT IS A BREADCRUMB, so the separators are middots and the whole line is small, quiet
                and monospaced. It is a path, not a sentence. */
```

### THE LEVEL, NOT THE KEY STAGE — `KS3, KS4` on a crumb is the grey area the owner asked to stop seeing; `levelOf_` says GCSE.

in `thingCard_`

```
/* THE LEVEL, NOT THE KEY STAGE — `KS3, KS4` on a crumb is the grey area the owner asked
                to stop seeing; `levelOf_` says GCSE. A stage band IS the level, so it is not said
                twice. AND INSIDE SATs THE KEY STAGE BESIDE IT, as its own word -- `SATs · KS2`,
                never `KS2 SATs` (`levelSaid_`). */
```

### Its own second line:

in `thingCard_`

```
/* Its own second line: a resource says its subject, a shop item its description. This
                fell back to the GROUP name when both were empty — which was the card repeating the
                heading above it, and is now a fallback to nothing, which is honest. */
```

### THE YEAR, ON THE CARD.

in `thingCard_`

```
/* THE YEAR, ON THE CARD. For a past paper it is most of the identity — "Paper 1" is
                four papers and "Paper 1 · 2024" is one — and it was in the payload, filterable and
                sortable, and shown nowhere. A thing you can sort by and cannot see is a sort you
                have to take on trust.
                Read off the wave when the year itself is blank: "June 2024" carries it, and
                nobody should have to type the same fact into two columns. */
```

### WHO IT IS FROM, FIRST.

in `thingCard_`

```
/* WHO IT IS FROM, FIRST. The line said "Maths · 2025" on four hundred cards — and on a
                screen already filtered to maths the subject is the one word every card shares, which
                makes it the one word none of them needed. The company varies: 1stclassmaths at KS4,
                Corbettmaths at KS2. That is the fact that tells two cards apart.
                NOT ON A PAPER. `paperCard` has already drawn the board across the top of the cover,
                and printing "AQA" twice on one card reads as a mistake rather than emphasis. */
```

### A THING'S ENTRY. Wearables are the one kind decided by a FIELD rather than by `kind` — the shop holds both, and which it is depends on whether the row names a

top level, before `KIND_LIVE`

```
/* A THING'S ENTRY. Wearables are the one kind decided by a FIELD rather than by `kind` — the shop
   holds both, and which it is depends on whether the row names a slot to wear it in. That is a
   genuine exception and is written out here rather than being a tenth entry that `kind` can never
   select. */
```

### THE FUNNEL'S ANSWERS, AS THE SHEET WANTS THEM.

top level, before `KIND_LIVE`

```
/* ==================================================================================================
   THE FUNNEL'S ANSWERS, AS THE SHEET WANTS THEM.

   `facets` MOVED THE QUESTIONS OUT OF CODE AND LEFT THE ANSWERS BEHIND. Which group a kind belongs
   to, what that group is called, what the kind is called, and what order the groups are offered in
   are four editorial decisions, and all four were literals — while the LABEL on the question asking
   them had a spreadsheet column. The same kind of decision on both sides of one screen, half of it
   a cell and half of it a deploy.

   WHAT `card` AND `wearable` STAY FOR. How to DRAW a kind is code, exactly as `of` is on a facet —
   a function cannot live in a cell without inventing a formula language. Only the naming and the
   grouping move.

   A KIND WITH NO ROW IS UNCHANGED, so the tab can be empty. A ROW FOR A KIND NOTHING PRODUCES is
   ignored, because there would be nothing to group.

   AND `GROUP_ORDER` IS DERIVED FROM IT NOW rather than being a second hand-written list that could
   disagree with the first. It could, and silently: a group named in `KINDS` and missing from the
   order sorted to the end alphabetically with nothing said.
================================================================================================== */
```

### ---------- A KIND THE SHEET INVENTED

in `kindMap_`

```
/* ---------- A KIND THE SHEET INVENTED ---------------------------------------------------------
     THE SAME GAP THE `facets` TAB HAD, and the same fix — see `facetFromSheet_`. This walked
     `Object.keys(KINDS)` and overlaid the sheet onto each, so a `kinds` row for a kind the code
     does not declare was read and thrown away. The backend already sends those rows through; its
     comment where it builds `payload.kinds` says so in as many words.

     AND THE CARD ALREADY FELL BACK, which is what makes this three lines rather than a project.
     `(kindOf_(x).card || thingCard_)(x, credits)` has always been the call — a kind with no card
     draws as an ordinary thing: name, subtitle, picture, price. So a new kind needs no card
     function, no `KINDS` entry and no facet. It needs a row here and a source of items.

     WHAT THAT LEAVES AS THE LAST HAND-WRITTEN BIT is `stuffItems` — where the items come from at
     all. That is one mapper per domain and it is the honest floor: something has to say "boxers
     live on `DATA.boxers` and a boxer is called `name`". Everything after it is now editorial.

     THE OLD FALLBACK WAS WRONG AND SILENT. `kindOf_` answers `{ group: 'Shop', label: 'Things' }`
     for a kind it does not know, so an unrouted kind did not vanish — it appeared under Shop,
     labelled Things, which is worse than vanishing because it looks deliberate. A sheet row is now
     the way to say where it really belongs. */
```

### A SHEET-ONLY KIND WITH NO GROUP WOULD LAND IN `undefined`, which `groupOrder_` would then offer as an answer to the first question.

in `kindMap_`

```
/* A SHEET-ONLY KIND WITH NO GROUP WOULD LAND IN `undefined`, which `groupOrder_` would then
       offer as an answer to the first question. `Learning` is the default because it is where
       content goes and the only alternative is refusing the row silently. */
```

### THE SHEET WINS WHEN IT HAS SAID ANYTHING.

in `out.k`

```
/* THE SHEET WINS WHEN IT HAS SAID ANYTHING. `asList_` is what decides whether it has — an
         empty cell arrives as an empty array, which is falsy nowhere useful, so testing the length
         is the only test that means "the cell was blank". */
```

### HELD AGAINST THE KIND MAP IT WAS READ FROM, because `facetTally_`'s comparator asks for it on every comparison while it sorts a question's answers — an

top level, before `GROUP_ORDER`

```
/* HELD AGAINST THE KIND MAP IT WAS READ FROM, because `facetTally_`'s comparator asks for it on
   every comparison while it sorts a question's answers — an `Object.keys`, a walk and a
   `localeCompare` sort, dozens of times a tap, for a list that changes only when `kindMap_` does. A
   copy is handed out so nothing can reorder the one that is kept. */
```

### ONE VALUE OR SEVERAL, ALWAYS READ AS SEVERAL.

top level, before `asList_`

```
/* ONE VALUE OR SEVERAL, ALWAYS READ AS SEVERAL. A facet's `of` may return a string, a list, or
   nothing; every caller wants the same thing out of it, which is the values that are actually
   there. Blank strings are dropped here rather than in four places — `facetCoverage` counts what
   is left, and a row with nothing to say about a question should not be counted as having said
   something empty. */
```

### ---------- AND THE COMMON CASE IS ONE STRING, WHICH USED TO COST FOUR ALLOCATIONS

top level, before `asList_`

```
/* ---------- AND THE COMMON CASE IS ONE STRING, WHICH USED TO COST FOUR ALLOCATIONS -------------
   MEASURED ON THE TAP THAT PROMPTED IT. `facetTally_` calls this once per item per facet, and
   `nextFacet` tallies until a question qualifies -- so answering one funnel question over 5,032
   items is about thirty thousand calls, and a CPU profile at 20x put `asList_` at 156 ms, the
   largest piece of JavaScript on the screen. The old body wrapped the value in an array, mapped a
   closure over it and filtered the result: three arrays and a function call to say "this string is
   not empty".

   SAME ANSWER, SAME ORDER, SAME DROPPING OF BLANKS -- a string, a number, null and an array all
   come back exactly as before; this only stops building the scaffolding for the cases that do not
   need it. */
```

### ---------- A PRICE THAT NOBODY HAS TYPED IS NOT A PRICE OF ZERO

top level, before `priced_`

```
/* ---------- A PRICE THAT NOBODY HAS TYPED IS NOT A PRICE OF ZERO --------------------------------
   `Number(t.rate) || 0` WAS THE PATTERN and it folds three different things into one number: a
   rate of 0, a blank cell, and a cell holding "ask me". All three came out 0, and 0 means FREE to
   the Price facet — so a tutor whose rate nobody has filled in was advertised as free.

   `undefined` IS THE ANSWER FOR ALL THREE. It is what "I have no price" looks like everywhere else
   in this file: `asList_` drops it, the facet skips it, and the card draws nothing. A real 0 still
   gets through, because `Number('0')` is 0 and `isFinite(0)` is true. */
```

### ONE WORD, ONE QUESTION — AND TWELVE WORDS WERE ANSWERS TO TWO.

top level, before `FACET_SAME_AS`

```
/* ==================================================================================================
   ONE WORD, ONE QUESTION — AND TWELVE WORDS WERE ANSWERS TO TWO.

   `check-funnel.js` HAS PRINTED THIS AS A NOTE FOR MONTHS and a note nobody acts on is the thing
   this repository warns about in six other places. It was reported from the live funnel in the
   owner's own words — "the other day i saw that it wasnt uniform" — so here is the measurement it
   was reported against, once the check was made to boot with the real settings files:

     Biology        subject 243   topicArea 305      the science roots `data/topics.json` gained
     Chemistry      subject 276   topicArea 341      for the practicals
     Physics        subject 348   topicArea 263
     Algebra        topicArea 815   topic 11         a root's own name, used as a leaf on a few rows
     Number         topicArea 1367  topic 9
     Probability    topicArea 119   topic 56
     Statistics     topicArea 289   topic 9
     KS3            keystage 736   level 27          a key stage typed into the level column
     A-Level        level 263      tier 135          a level answered through the Tier question
     Edexcel        examBoard 2576 company 1148      the board's own name, in the publisher column

   EVERY ONE IS THE `level` / `stage` FAULT, which this file already records at length: the same
   word, twice, meaning different things, and which result set you get depends on which of the two
   questions the funnel happened to offer you first. There it was repaired by merging two facets
   into one. These cannot be merged — a subject and a branch of the topic tree are different facts
   that happen to share a name, and so are a board and a publisher.

   SO THE RULE IS THAT THE NARROWER QUESTION KEEPS THE WORD. `not: 'subject'` on `topicArea` means:
   drop any of my values that the Subject question already gives THIS item. A Biology question stops
   answering `Topic area` with `Biology`, because `Subject` has already asked that and asked it
   better; a Biology PRACTICAL whose subject is Biology likewise. Nothing is lost — the narrower
   question is the one that was going to be offered anyway — and the wider one stops offering a
   button that duplicates it. (`Topic area` is retired since — see `topicArea WAS HERE`; the same
   `not:` still stands on `tier` against `level` and on `company` against `examBoard`.)

   PER ITEM, NOT PER FACET, and that is the whole of why it is safe. `Probability` stays a Topic
   wherever the row's topic AREA is something else, and stops being one only on the rows where the
   two agree. A blanket "Topic may not say Probability" would have taken a real answer away from 47
   rows to fix 9.

   THROUGH `spellKey_`, because that is what the funnel already means by "the same answer" — see
   `facetTally_`. `STA` against `Standards & Testing Agency` is the one pair no spelling rule can
   join, and it is not a spelling: it is an organisation's short name, which is the line `levelOf_`
   draws for `AS level`. `FACET_SAME_AS` is that one fact, with its reason beside it.
================================================================================================== */
```

### The Standards & Testing Agency publishes the KS2 SATs papers AND is the board on them, so its own name is in both columns on all 228 rows — spelled out in one

in `FACET_SAME_AS`

```
/* The Standards & Testing Agency publishes the KS2 SATs papers AND is the board on them, so its
     own name is in both columns on all 228 rows — spelled out in one and abbreviated in the other,
     which no reduction of letters can fold. `Exam board` says `STA` because that is what a teacher
     says; the publisher question drops it because the board question has already asked. */
```

### The raw reader of another facet, off `FACETS` rather than off `facetList()`:

top level, before `FACET_RAW`

```
/* The raw reader of another facet, off `FACETS` rather than off `facetList()`: the sheet may
   relabel and reorder a question but it cannot change what a column holds, and going through the
   live list would make a `not:` chain depend on which rows the sheet happens to carry. */
```

### A MAP, BUILT ON FIRST USE — this is asked once per item per deferring facet while a question is tallied, and `FACETS` is a fixed array, so a `find` along it

top level, before `FACET_RAW`

```
/* A MAP, BUILT ON FIRST USE — this is asked once per item per deferring facet while a question is
   tallied, and `FACETS` is a fixed array, so a `find` along it each time was the same answer
   bought five thousand times a tap. Built lazily because `FACETS` is declared further down. */
```

### ---------- WHY THESE ARE UP HERE AND NOT BESIDE `bucketValues_`

top level, before `SPELL_KEYS`

```
/* ---------- WHY THESE ARE UP HERE AND NOT BESIDE `bucketValues_` --------------------------------
   `FACETS` IS A TOP-LEVEL `const` ARRAY AND IT IS BUILT AS THE FILE LOADS, so every table a facet
   entry names has to exist by then. Declared below it they are in the temporal dead zone and the
   app does not start at all — `Cannot access 'KIND_BUCKET' before initialization`, on the first
   line of the first facet. The engine that reads them is further down, where it belongs; the
   tables are data and data comes first.
--------------------------------------------------------------------------------------------- */
```

### THE GROUPINGS THEMSELVES — "grouping many subtopics into first larger topics", written out.

top level, before `SPELL_KEYS`

```
/* ==================================================================================================
   THE GROUPINGS THEMSELVES — "grouping many subtopics into first larger topics", written out.

   THE ALPHABET IS THE FLOOR AND IT IS NOT THE ANSWER. `bucketValues_` above guarantees that no
   question ever draws more than seven answers; these are what stop the seven being `A`, `B`, `C`.
   Measured with the generic rule alone: `Sitting` came out as **A and S** — Autumn and Summer, two
   buttons for nine years of exams — and `check-funnel.js` refused it outright, which is that check
   doing its job on my own change. `What you need` came out as `P`, `Subject` as `B / C / E / M`.
   Each is a legal grouping that nobody could use.

   EVERY LABEL HERE IS A WORD ALREADY IN USE. The maths ones are the national curriculum's own
   strand names, the boxing ones are what the weight classes are actually called, and the rest are
   what a tutor says out loud. Nothing is title-cased by code and nothing is abbreviated — the
   `Hcf And Lcm` fault this file records is a label a machine made up.

   A TABLE AND A LOOKUP, NOT A TEST PER VALUE, so the grouping is a thing you can read down and
   check against the data rather than a chain of conditions. `bucketOf` returns '' for a value it
   does not place, and `bucketLabels_` stands the whole rule down the moment that happens — one
   unplaced value and the alphabet takes over, which cannot lose anything. That is the half that
   makes these safe to write: a grouping that goes stale as the library grows degrades to something
   usable instead of hiding the values it forgot.
================================================================================================== */
```

### ---------- THE SAME FIFTY WORDS, FIVE THOUSAND TIMES EACH

top level, before `SPELL_KEYS`

```
/* ---------- THE SAME FIFTY WORDS, FIVE THOUSAND TIMES EACH ---------------------------------------
   IT IS A PURE FUNCTION OVER A TINY SET. `facetTally_` and `filterHit` call this once per item per
   facet, and the values are a subject, a tier, a board -- `Maths` is folded five thousand times to
   the same five letters on every filter change. A `Map` makes the second one free.

   BOUNDED BY THE DATA rather than by a cap: the keys are the distinct values the library holds in
   its facet columns, which is hundreds, not the strings anybody can type. Nothing here is fed a
   search box. */
```

### ---------- A VALUE -> LABEL TABLE, INVERTED ONCE SO THE LOOKUP IS A MAP RATHER THAN A SCAN

top level, before `bucketTable_`

```
/* ---------- A VALUE -> LABEL TABLE, INVERTED ONCE SO THE LOOKUP IS A MAP RATHER THAN A SCAN ------
   AND IT FALLS BACK TO `spellKey_`, WHICH IS THE FOLD THAT DECIDED THE VALUE WAS ONE ANSWER.
   `norm` is `toLowerCase().trim()` and nothing else, and `facetTally_` folds variants by
   `spellKey_` — alphanumerics only — then hands this function whichever spelling `spellBetter_`
   picked to SHOW. So the two ends were using different folds, and the gap is the one this file
   records for this exact column: `Alevel`, `A-level` and `A-Level` were three answers on one
   screen, and `spellKey_` is what made them one. A row spelled `A Level` folds to the same answer
   as `A-Level`, wins the spelling vote if it carries more separators, reaches this table as a key
   `norm` has never seen — and one unplaced value stands the WHOLE grouping down to the alphabet,
   silently, on a question that was working the day before.

   BOTH INDEXES ARE BUILT AT CONSTRUCTION, and the first version built the second one lazily so it
   could keep `spellKey_` where it was, further down the file. `js/check.js` refused that with one
   finding per table: it cannot see that the reference is behind a branch that only runs on the
   first lookup, and what it is guarding is a throw at LOAD that takes every name below it in the
   file with it. The dependency is real, so `spellKey_` moved above these tables instead — which is
   the rule `index.html`'s file list is built on, one file in. */
```

### `People & places` (Tutors, Venues) WAS A THIRD ROW, and nothing could answer it:

top level, before `KIND_BUCKET`

```
/* `People & places` (Tutors, Venues) WAS A THIRD ROW, and nothing could answer it: a tutor is
   `Booking` alone and a venue is again, so `FUNNEL_NOT_FOR` keeps both out of every list this
   grouping is asked of. It showed up only under `check/fixture.json`'s old `kinds` rows, which
   filed them under `people` and `places` where production files them nowhere. */
```

### `Projects` JOINS `Work through it`, BESIDE `Practicals`, and it has to be in this table at all:

top level, before `KIND_BUCKET`

```
/* `Projects` JOINS `Work through it`, BESIDE `Practicals`, and it has to be in this table at all:
   `bucketLabels_` stands the whole grouping down the moment one answer is unplaced, so a kind
   missing from here turns the app's second question back into the alphabet. `check-projects.js`
   reads this line for that reason. NOT a bucket of its own — `Make something` holding one kind
   would be skipped by the one-answer rule, and the word the owner asked to see would never be on
   screen. */
```

### ---------- `Films` LEFT `Read or watch it`, AND THE ROW STAYS, HOLDING `Resources` ALONE

top level, before `KIND_BUCKET`

```
/* ---------- `Films` LEFT `Read or watch it`, AND THE ROW STAYS, HOLDING `Resources` ALONE -------------
   THE OWNER, 10 Oct: *"films should not appear in the finder it cannot be found there"* — see where
   `film` was in `KINDS`. Three ways to handle the row it leaves, decided by the rules above:

     DELETE IT    and `Resources` is unplaced. A written-out table must place every answer the library
                  gives (`check-funnel.js`), and one unplaced value is the stand-down this table's own
                  note warns about. Not an option.
     FOLD IT      into `Work through it`, and a boxer and a bout are filed as something you work
                  through, which they are not — the two-cupboards fault the other way round.
     KEEP IT      with one kind in it. `Order it` already holds one (`Bundles`), and the one-answer rule
                  that argued against a bucket of one (`Make something`, above) bites only when the
                  bucket is DRAWN in place of its answers. Since 6 Oct nothing is (`bucketValues_`), so
                  What kind draws `Resources` itself, the owner's own word for that tag.

   KEPT, AND UNDER THE SAME NAME, because the name is still true: a bout carries a Watch tile and a
   boxer his Highlights (`fightTiles_`, `boxerTiles_` in tiles.js), the textbook and the Bible are read.
   The row's one effect on screen is ORDER (`within`, for `orderOf` on What kind), and that is
   unchanged: Questions · Answers · Practicals · Projects · Bundles · Resources, with Films no longer
   between the last two. */
```

### THE FOUR SCIENCES ARE ONE ANSWER UNTIL SOMEBODY WANTS ONE OF THEM.

top level, before `SUBJECT_BUCKET`

```
/* THE FOUR SCIENCES ARE ONE ANSWER UNTIL SOMEBODY WANTS ONE OF THEM. Maths and English are not
   folded into anything, because on this library they are most of it and folding the biggest answer
   into a bucket of one is a tap that changes nothing. */
```

### `Statistics` IS GCSE STATISTICS — the @family.

in `SUBJECT_BUCKET`

```
/* `Statistics` IS GCSE STATISTICS — the @family. textbook's subject — and it sits in Maths
     because a maths tutor is who teaches it and a maths student is who looks for it. Its own row
     would be a Subject answer holding one book. */
```

### ---------- THE REST OF THE GCSE TIMETABLE, ONE @family. TEXTBOOK EACH

in `SUBJECT_BUCKET`

```
/* ---------- THE REST OF THE GCSE TIMETABLE, ONE @family. TEXTBOOK EACH ---------------------------
     "add a maths and English language+lit gcse text book in like the stats one … do physics and
     chemistry and biology too. do geography too. do any other common gcse subjects too." Every book's
     subject has to be placed here or the whole Subject grouping stands down (`check-textbooks.js`),
     so the timetable arrived as rows rather than as a list of twenty-four answers. Grouped the way a
     school's options booklet groups them, which is how a parent already thinks about the choice.
     `Religious Studies` was a row of its own while it was the only humanity in the library; it is
     one of three now, and a row of one beside a row of three reads as a mistake. */
```

### `AREA_BUCKET` WAS HERE — the national curriculum's strands, `Topic area`'s seven buckets, with A-level pure maths filed under Algebra.

top level, before `GRADE_BUCKET`

```
/* `AREA_BUCKET` WAS HERE — the national curriculum's strands, `Topic area`'s seven buckets, with
   A-level pure maths filed under Algebra. Its only reader was that facet's `bucketOf`, so it went
   with `topicAreaOf_` (see `THE TOPIC TREE WAS READ HERE`); a `const` table is invisible to
   `check-dead.js`, which looks for `function`, so it would not have been listed. */
```

### GRADES IN THREES, which is how a tutor talks about them — "a grade 4 to 6 question" is a sentence somebody says and "Grade 4" alone is a precision nobody has

top level, before `GRADE_BUCKET`

```
/* GRADES IN THREES, which is how a tutor talks about them — "a grade 4 to 6 question" is a sentence
   somebody says and "Grade 4" alone is a precision nobody has about a question they have not read.
   Grade 9 is here although nothing carries it yet, so the day something does it is already placed. */
```

### WHAT YOU HAVE TO HAVE IN FRONT OF YOU, by where you get it from:

top level, before `NEEDS_BUCKET`

```
/* WHAT YOU HAVE TO HAVE IN FRONT OF YOU, by where you get it from: the calculator question is its
   own question and everybody asks it, a drawing kit comes out of a pencil case, and a sheet is
   something the exam board hands you. THE TWO CALCULATOR LABELS ARE THE WORDS THE CARD'S TAG SAYS
   (`needsSay_`), so a bucket, the answer under it, its chip and the tag on the card are one spelling;
   the values on the right stay the cell's, which `check-library.js` closes. */
```

### THE WEIGHT CLASSES, GROUPED THE WAY BOXING GROUPS THEM.

top level, before `DIVISION_BUCKET`

```
/* THE WEIGHT CLASSES, GROUPED THE WAY BOXING GROUPS THEM. Sixteen divisions is the sport's own
   fragmentation — light, super and plain of nearly everything — and nobody outside it thinks in
   sixteen. Every one of these six is a name a commentator uses. */
```

### A SPAN IS FILED UNDER THE LEVEL IT GOES UP TO, and that is a decision rather than an observation.

top level, before `LEVEL_BUCKET`

```
/* A SPAN IS FILED UNDER THE LEVEL IT GOES UP TO, and that is a decision rather than an observation.
   `KS2–GCSE` is four values wide and belongs somewhere; the top of the range is the level somebody
   is working towards, which is what they are choosing a question for. */
```

### `SATs`, ONE ANSWER, WHERE THIS WAS `KS1 SATs` AND `KS2 SATs` -- and before that `KS1` and `KS2`.

in `LEVEL_BUCKET`

```
/* `SATs`, ONE ANSWER, WHERE THIS WAS `KS1 SATs` AND `KS2 SATs` -- and before that `KS1` and `KS2`.
     *"I prefer GCSE or SATs over grey areas"* turned the key stages into qualifications, and joined
     the two facts into one word to do it. Then: *"why is ks2 sats one tag? it should be sats. if they
     want to specify key stage then it should be its own thing. sats is one tag not ks2 sats."* So
     the qualification is `SATs`, the key stage is the `Key stage` question asked inside it (and only
     there), and every old spelling the data or a bulk import still carries is placed here. */
```

### FUNCTIONAL SKILLS IS ITS OWN QUALIFICATION, NOT A RUNG OF THIS ONE.

in `LEVEL_BUCKET`

```
/* FUNCTIONAL SKILLS IS ITS OWN QUALIFICATION, NOT A RUNG OF THIS ONE. Level 2 is pitched near a GCSE
     grade 4 and is sat by adults and apprentices as often as by anyone at school, so filing it under
     `GCSE` would put a different exam, with a different shape (two sections, a checking mark), under a
     name it does not carry. It sits beside GCSE because that is where its Level 2 is pitched; Entry
     Level and Level 1 join it here when their papers arrive, under the same one answer. */
```

### ---------- AND THE TWO THAT ARE COMPUTED RATHER THAN LISTED

top level, before `decadeBucket_`

```
/* ---------- AND THE TWO THAT ARE COMPUTED RATHER THAN LISTED ------------------------------------
   A YEAR IS NOT A LIST, so a table of sittings would need a row adding every August. These read the
   number out of the answer, which is what `waveOf` and `decadesOf_` already put there.

   NEWEST FIRST, which is the order the sitting list is already in and for the reason recorded there:
   the newest paper is the one closest to the specification somebody is actually sitting. */
```

### WHAT FOR, before what kind.

in `FACETS`

```
/* WHAT FOR, before what kind.
     A tutor, a venue and a subject are three answers to one question — who, where and what — and
     nobody assembling a session thinks of them as three different sorts of thing. They are the
     things you BOOK. Grouping them says so, and it takes the first question from nine answers to
     four, which is the difference between a menu and a choice.
     Derived, not stored: what a thing is for follows from what it IS, so there is no column for
     this and nothing to keep in step. And `kindLabel` below still asks which one — except where
     the group holds only one kind, in which case the one-answer rule skips it and choosing
     Learning takes you straight to the resources. */
```

### ---------- AN ITEM MAY OVERRIDE THE GROUP ITS KIND PUTS IT IN

in `FACETS`

```
/* ---------- AN ITEM MAY OVERRIDE THE GROUP ITS KIND PUTS IT IN ----------------------------------
     `kinds` DECIDES THE GROUP FOR A WHOLE KIND, which is right for the kinds — a tutor is Booking
     and People, every tutor, always. It is wrong for one item inside a kind: `Your sessions` is a
     widget, so its kind says Tools, and Tools is where somebody looks for a timer rather than for
     what they have booked.
     `groups` ON THE ITEM WINS WHEN IT IS THERE. Same list-or-string shape `asList_` already reads,
     so nothing else had to learn a new form. Nothing sets it but the widgets, and only the one. */
```

### ---------- A DOOR IS NOT A FILTER, AND THE BALANCE RULE HAD TO BE TOLD

in `FACETS`

```
/* ---------- A DOOR IS NOT A FILTER, AND THE BALANCE RULE HAD TO BE TOLD -----------------------
     `FACET_MIN_MINORITY` SKIPS A QUESTION NOBODY ANSWERS DIFFERENTLY, and on this library that is
     very nearly this one: 3,753 of 3,770 items are questions, so `Learning` holds 99.5% and the
     rule would drop the app's first question on the floor.

     IT WOULD BE RIGHT ABOUT THE ARITHMETIC AND WRONG ABOUT THE JOB. Every other facet NARROWS a
     list of like things — which subject, which tier, which board — and there the rule is exactly
     correct: an answer nobody gives is a button that does nothing. These two NAVIGATE. `What for`
     and `What kind` are how somebody gets from the whole app to a department, and the person who
     came to book a tutor needs that door whether it leads to one tutor or to a thousand. Hiding it
     because the library is large would mean the funnel got harder to use the more content you
     added, which is precisely backwards.

     SO `always` MARKS THE TWO THAT ARE DOORS, and nothing else may carry it. It exempts a facet
     from the balance rule ONLY — the coverage rule, the answer-count cap and "everything agrees"
     all still apply, so a group question with one answer left still goes away. */
```

### ---------- `Answers` IS A KIND, BESIDE `Questions`

in `FACETS`

```
/* ---------- `Answers` IS A KIND, BESIDE `Questions` ------------------------------------------------
     THE OWNER, 6 Oct: *"The answers should just be another tag at the start of the funnel menu. You
     complicated it."* It had been a hidden `Page` filter, reached by an `Answers only` switch tile on
     every answer page. Now a question that has an answer answers this question twice -- `Questions`
     and `Answers` -- and choosing `Answers` draws only the answer pages (`answersView_`), in the
     question's order, open. */
```

### ---------- AND `Questions` MEANS QUESTIONS, NOT QUESTIONS AND THEIR ANSWERS

in `FACETS`

```
/* ---------- AND `Questions` MEANS QUESTIONS, NOT QUESTIONS AND THEIR ANSWERS -------------------------
     THE OWNER, 8 Oct, from a lesson on an iPad in the sun: *"answers shouldnt even be showing up when all
     ive done is clicked questions. the answers still show up."* `Questions` drew every question with its
     answer page after it -- hidden, but a card headed "Answer" under every question reads as the answers
     showing. So each chip means what it says: `Questions` is the question, its opening and its figures
     and never an answer page (`questionsView_`); `Answers` is the answers alone, open. With no kind
     chosen -- "Doesn't matter", a search, Saved -- each answer page still follows its question, shut
     until Show: the 5 Oct wish, *"the answers should appear after their questions"*. The same for a
     tutor and a pupil; a tutor's way to the answers is the Answers chip.

     IN `KIND_BUCKET`'S ORDER, NOT THE ALPHABET'S (`orderOf`). Alphabetical put `Answers` first, top
     left, where a thumb lands -- and one tap on it opens every answer at once, for anybody. Questions
     comes first now and Answers beside it, its pair. */
```

### THE TAG IS WHAT THIS PAGE IS, NOT EVERY DOOR THE ITEM STANDS BEHIND.

in `FACETS`

```
/* THE TAG IS WHAT THIS PAGE IS, NOT EVERY DOOR THE ITEM STANDS BEHIND. A question answers
       `Questions`, `Answers` and `Bundles` above, because each of those lists holds it; its card is a
       question and its answer page is an answer, so the row says the one the page is -- the same word
       the chip that opened that page wears (docs/history/355). */
```

### ---------- THE THIRD DOOR: WHICH SHELF OF THE RESOURCES

in `FACETS`

```
/* ---------- THE THIRD DOOR: WHICH SHELF OF THE RESOURCES ---------------------------------------
     THE OWNER'S ROUTE IS "Learning → Resources → @family. textbooks → GCSE Statistics", and without
     this question there is no third rung to stand on. `Resources` is 260 rows of boxing and one
     book; every question the funnel asked there was a boxing question, and the book answered none
     of them — so it was reachable by search and by nothing else.

     `always`, LIKE THE TWO ABOVE, AND FOR THEIR REASON. One book against 260 boxers and bouts is a
     0.4% split and `FACET_MIN_MINORITY` would refuse the question — correctly for a filter, wrongly
     for a door. This takes somebody to a department, the way `What kind` does. The coverage rule still
     applies: nothing outside Resources carries a shelf, so it is never asked of the questions, and
     with one shelf left it is not asked at all.

     EVERY RESOURCE NAMES ITS SHELF, which is why the boxers and the bouts say `Boxing` in their
     mappers. A shelf only some of the list had would fail the coverage rule and never be asked. */
```

### ---------- THE BIBLE'S SIX QUESTIONS, IN THE OWNER'S ORDER

in `FACETS`

```
/* ---------- THE BIBLE'S SIX QUESTIONS, IN THE OWNER'S ORDER -----------------------------------------
     *"tags in finder. should go translation e.g. kjv, then old testament or new, then group the books,
     e.g. torah, pauline epistles ect. then the book titles e.g. genises, eodus. then the chapters, e.g.
     1,2,3 then the verses e.g 1 2 3. each verse is a widget."* — 6 Oct. Six ordinary questions, so each
     answer is a chip with a ✕ like every other; see the head of the Bible section for why the reader
     they replace was not.

     TWO FLAGS NOTHING ELSE CARRIES, and both are read by name in `nextFacet`:
       `only: '<kind>'` IS THE FENCE (`facetFenced_`). The question is asked only of a list made
         entirely of that kind, and a list made entirely of that kind is asked only its own questions.
         Without it the coverage rule would be doing the fencing, by arithmetic, over a list that is
         81% verses for an admin — and every school question would pay a tally of six questions no
         school item can answer. With it, everybody else pays one property read.
       `grid: true` IS A NUMBERED RUN — chapters, verses — exempt from `FACET_MAX_ANSWERS` and drawn
         as a grid of numbers rather than as chips. The cap is about forty NAMES nobody can read; a
         grid of 150 numbers is read by position, the way a printed Bible's chapter index is. A grid
         facet must also be `only` (`check-funnel.js` refuses one that is not), so the exemption can
         never escape a closed kind into the library, where 389 topics would be drawn whole.
     `folder: true` ON ALL SIX, `examYear`'s principle: a path is asked whole even where a rung has one
     answer — KJV, Acts, Revelation, chapter 1 of Jude — so the route to a verse is always six taps.
     THE ORDER IS `FACET_NEEDS_FIRST`'S, which chains each to the one above it, so a sheet that
     reorders them reorders nothing, and "Doesn't matter" on one releases the next.
     THE FIELD NAMES ARE NOT `book`, `year`, `level`… — `book` is the textbook's question just above,
     and a shared name would put the textbooks' answers on the Bible's chip.
     The cover answers Translation alone, and only once the index has said which translation it is. */
```

### Only venues have one, so it is only ever asked once you are looking at venues — which is the coverage rule doing the work that a per-kind filter list would

in `FACETS`

```
/* Only venues have one, so it is only ever asked once you are looking at venues — which is the
     coverage rule doing the work that a per-kind filter list would otherwise have to.
     VENUES ARE OFF FIND, so nothing in the funnel answers it and its `facets.json` row is OFF. The
     reader stays: it is one line, and a `kinds` row putting venues back puts the question back. */
```

### `book` WAS HERE — `Book`, which @family.

in `FACETS`

```
/* `book` WAS HERE — `Book`, which @family. textbook, asked after Subject on the textbooks' shelf.
     There are no books on screen since 12 Oct (see `content` in KINDS), so nothing answered it; it is
     in `RETIRED_FACETS`, which keeps the sheet's row from asking it and a kept chip from coming back. */
```

### ---------- THE QUESTION THE FUNNEL HAD NEVER ASKED

in `FACETS`

```
/* ---------- THE QUESTION THE FUNNEL HAD NEVER ASKED --------------------------------------------
     STRAIGHT AFTER `Subject`, because "Maths, and it is about fractions" is how somebody says what
     they are looking for — and because `nextFacet` walks this list IN ORDER, so anything below the
     provenance questions is a question you only reach after answering five that are not it.

     IT STAYS SILENT UNTIL IT IS USEFUL, WITHOUT BEING TOLD TO. There are 389 distinct topics across
     the library, which is past `FACET_MAX_ANSWERS`, so it is not offered at the top — and 91.5% of
     the question rows carry one but almost nothing else in the app does, so its coverage is low
     until the list IS questions. Both rules that keep it out of the way are the ones already here,
     doing the job they were written for; there is no number in this entry.

     SO IT ARRIVES WHERE IT IS ANSWERABLE. Learning · Maths · Worksheet · KS2 leaves 54 topics —
     still a list, so the funnel keeps narrowing — and by the point it used to say "nothing left"
     it is eleven. See `topicOf_` for the reader and for why the spelling is voted on rather than
     listed.

     AND IT IS A COLLECTION AS WELL AS A QUESTION, for free: 389 groups is past the same constant
     `collectionAxes_` reads, so "or the 352 topics these are in" becomes available wherever
     grouping by topic would collapse the list harder than grouping by paper. Neither of those
     behaviours is written here. */
```

### ---------- A QUESTION ANSWERS THESE ONLY IF IT IS A 1ST CLASS MATHS WORKSHEET

in `FACETS`

```
/* ---------- A QUESTION ANSWERS THESE ONLY IF IT IS A 1ST CLASS MATHS WORKSHEET ----------------
     THE OWNER'S CALL, IN HIS WORDS: "each question has an assigned topic. I hate that. I only liked
     it with the first class maths stuff because the topic names were the names of the pdf itself."
     A 1st Class Maths sheet IS one topic — `Linear Equations (one step)`, graded 1 to 9 — so the
     tag is the sheet's own title and choosing it is choosing the worksheet. On a past paper or a
     5-a-day the same cell is a label somebody assigned to one question out of thirty, which is a
     judgement drawn as a fact. The `topics` cells stay in the file — the search box still reads
     them, and practicals and projects still join on them — so this is one test to take back out. */
```

### ---------- `topicArea` WAS HERE — `Topic area`, the branch above the topic

in `FACETS`

```
/* ---------- `topicArea` WAS HERE — `Topic area`, the branch above the topic -------------------------
     Algebra, Geometry & Measures, Number, Probability, Ratio & Proportion, Statistics: the national
     curriculum's strands out of `data/topics.json`, asked so that a list of topics too long to offer
     (past `FACET_MAX_ANSWERS`) could be reached in two steps. The owner, 6 Oct: *"why is there a topic
     area menu? like im fin with names of pdfs which are the names of the topics themselves right? or
     is there a valid reason for this"*. There was not. On the only questions that answered it — the
     1st Class Maths sheets — `Grade` already brings the list under the cap, and a sheet's topic IS
     its PDF's name, which `Paper` lists; so it was a grouping laid over a list that did not need one,
     the shape the owner had already refused as Grade 1–3. And on a practical it was wrong outright:
     a GCSE Biology practical answered `Algebra` and `Geometry & Measures`, because the tree files a
     science practical's maths skills under maths branches. `RETIRED_FACETS` keeps the sheet's row
     from asking it again.

     AND ITS READER WENT AFTER IT, A ROUND LATE. This note first said "`topicAreaOf_` stays: the
     search and the checks still read the tree", and only the second half was true. The search reads
     a question's own words (`stuffHay_` — name, sub, subject, slot, grade, text) and has never asked
     the tree anything; the one caller left was `check-funnel.js`'s rule 8, guarding a menu nobody
     could open any more, and `check-dead.js` listed the function as unreachable from the day this
     facet went. So `topicAreaOf_`, the index under it (`topicIndex_`, `topicPick_`), its bucket table
     and the boot's fetch of `data/topics.json` are gone — see `THE TOPIC TREE WAS READ HERE`. The
     file stays: `check-practicals`, `check-projects` and `check-textbooks` hold a hand-written topic
     to its labels and aliases, which is a check reading a file, not the app reading one. */
```

### ---------- WHAT KIND OF PROJECT OR PRACTICAL, AND WHETHER A BOARD ASKS FOR IT

in `FACETS`

```
/* ---------- WHAT KIND OF PROJECT OR PRACTICAL, AND WHETHER A BOARD ASKS FOR IT --------------------
     `projectType` AND `practicalType` WERE THE SHEET'S QUESTIONS ONLY, read off the column by
     `facetFromSheet_`, and the cards said the same facts in pills of their own (`.fc-flag`) -- a
     lowercase `experiment` on the chip beside `Experiment` on the card. They are code facets now so
     they can carry `tag: true`, and each reads the item's own spelling (`PRAC_TYPE`, `projType_`),
     so the card's tag, the answer and its chip are one word. The rows in data/settings/facets.json
     still own their label, order, coverage and whether they are asked at all.
     `required` IS THE THIRD PILL A PRACTICAL WORE -- `Required practical`, `Extra`, `Not for now` --
     a tag now like the others, and `tagOnly`: 28/49/5 is a fact about a practical somebody may pick
     on the practical's own list, not a question every list of practicals should stop to ask. */
```

### ---------- THE DECADE COMES BEFORE THE WEIGHT

in `FACETS`

```
/* ---------- THE DECADE COMES BEFORE THE WEIGHT -------------------------------------------------
     REPORTED AS "boxers and fights shouldn't be organised by weight category before the decade/s
     involved of fighter or boxer", and it is the same judgement `boxKind` above already records
     one rung up: the question somebody has FIRST is the one that should be asked first, and
     `nextFacet` walks this list in order.

     WHICH IS RIGHT, AND NOT BECAUSE OF THE ARITHMETIC. A division narrows harder — twenty answers
     against six or seven — so every rule in this file would pick it, and every rule in this file is
     about how much a question narrows rather than about what somebody came for. A person who wants
     to look at boxing wants an ERA: the heavyweights of the seventies are a subject, and
     "heavyweight" across a century is a list of strangers. The weight is the second question, and
     it is a good one once the era is chosen.

     A DECADE, NOT A YEAR. `year` further down would give forty answers, past `FACET_MAX_ANSWERS`,
     so the question would be refused outright and the funnel would go straight to the weight — the
     exact complaint. Ten years is the unit boxing is actually discussed in.

     AND A FIGHTER IS IN AS MANY AS HE FOUGHT IN, which is what "decade/s" means. A career from
     1975 to 1992 answers the 1970s, the 1980s and the 1990s, so narrowing to the eighties finds him
     — a fighter filed under his last year alone disappears from the decade he was famous in. That
     is the same fault `keystage` had, where a primary worksheet forced into one key stage vanished
     from the other, and the machinery is the same: `asList_` reads a list, so a facet returning
     several answers already filters and counts against all of them. */
```

### THIRD, and it was seventh.

in `FACETS`

```
/* THIRD, and it was seventh. An exercise and a past paper are different ERRANDS — somebody
     revising and somebody sitting a mock are not looking for the same thing — so it is the
     question that most changes what should come next. 412 of 417 rows can answer it, which is
     the other half of what makes a good early question. */
```

### ---------- THREE BANDS, THREE QUESTIONS, BECAUSE THEY ARE NOT THE SAME QUESTION

in `FACETS`

```
/* ---------- THREE BANDS, THREE QUESTIONS, BECAUSE THEY ARE NOT THE SAME QUESTION ----------------
     `band_value` HOLDS A NUMBER AND `band_type` SAYS WHAT KIND OF NUMBER IT IS. A GCSE grade 4 and
     a Year 4 sheet both hold `4`, and asking one question called "Grade" over both would put a
     nine-year-old's worksheet under Grade 4 next to a foundation exam topic. Each type gets its own
     facet, gated on `bandType`, so the three can never be mixed and the wrong one is never asked.

     `stage` AND `grade` WERE HERE ALREADY; `year` IS THE ONE THAT WAS MISSING — which is why the
     Corbettmaths primary sheets could not be reached from the funnel at all. They are banded by
     school year, no facet asked about school years, and the Grade question they could not answer
     was the only one on offer.

     THE COVERAGE RULE THEN DOES THE REST. `Grade` is only offered when enough of what is on screen
     can answer it, so choosing Learning · Maths · Worksheet with primary sheets showing offers
     `Year`, and with GCSE sheets showing offers `Grade` — without either list naming the other. */
```

### `School year`, NOT `Year`.

in `FACETS`

```
/* `School year`, NOT `Year`. There are two facets here that were both called Year — this one, the
     year group a child is in, and `year` below, the year a paper was sat. They never collided while
     no maths resource carried a year group; the primary worksheets now do, and two questions
     labelled the same thing on one screen, one meaning 4 and the other 2024, is the sort of fault
     that reads as a bug in the data rather than in the label. */
```

### ---------- ONE LADDER, NOT TWO, AND THE SPELLING IS PART OF THE FAULT

in `FACETS`

```
/* ---------- ONE LADDER, NOT TWO, AND THE SPELLING IS PART OF THE FAULT ------------------------
     THIS WAS `stage`, READING ONLY `band_value` WHERE `band_type` IS `stage`. The `level` column
     says the same thing on a different set of rows, and because the code had no `level` facet the
     `facets` tab invented one — exactly as `facetFromSheet_` is designed to. So the funnel asked
     the same question twice, off two columns, and the two disagreed:

         level = Alevel   ->  135 items          stage = A-Level  ->  263 items
         level = GCSE     -> 2092 items          stage = GCSE     ->  345 items

     MEASURED, AND THE OVERLAP IS THE POINT: 128 A-level items carry a stage and no level, 135
     carry both. Which result set you got depended on which of the two questions the funnel
     happened to offer you first — the same word, twice, meaning different things. That is the
     "it feels arbitrary" complaint in its most literal form.

     NAMED `level` SO THE SHEET'S ROW BECOMES AN OVERRIDE. `facetList` treats a `facets` row whose
     field is already declared in code as a relabel/reorder of that facet, and one whose field is
     unknown as a new question. Renaming this from `stage` to `level` moves the sheet's row from
     the second pile to the first, so there is one question again and the sheet still owns its
     label, its order and whether it is asked at all.

     THE BAND WINS WHERE IT EXISTS, because `band_type: stage` is a deliberate statement about a
     row; the `level` column is the bulk-import's version of the same fact and is the fallback.

     AND `Alevel` IS A MISSPELLING OF A PROPER NOUN. Three spellings were on screen at once —
     `Alevel`, `A-Level`, `A-Level` — reading as three different things. Normalised here rather
     than in the data because the data is bulk-imported and will keep arriving both ways. */
```

### `not: keystage` WAS HERE — 27 rows had `KS3` typed into the level column and Key stage asked it first.

in `FACETS`

```
/* `not: keystage` WAS HERE — 27 rows had `KS3` typed into the level column and Key stage asked it
     first. The deference runs the other way now: Level is asked first and Key stage drops whatever
     Level already says (see `keystage`, just below). Both ways at once would be each dropping the
     other's answer. */
```

### ---------- A RESOURCE CAN BELONG TO MORE THAN ONE KEY STAGE

in `FACETS`

```
/* ---------- A RESOURCE CAN BELONG TO MORE THAN ONE KEY STAGE -------------------------------------
     PRIMARY WORKSHEETS DO NOT RESPECT THE BOUNDARY. Column addition, times tables, telling the time,
     naming 2-D shapes — Year 2 meets all of them and Year 6 is still practising them. Forcing one
     answer meant choosing which half of the audience to hide the sheet from, and KS2 won every
     time, so a KS1 tutor filtering by key stage saw nothing at all.

     THE MACHINERY WAS ALREADY THERE, HALF OF IT. `asList_` reads an array or a single value and
     every facet goes through it — matching at `matches_` and counting in `facetValues` — so a facet
     returning two key stages already filters and counts correctly against both. What it did NOT
     read was a comma inside a cell, which is how a spreadsheet holds a list: `KS1, KS2` arrived as
     one answer spelled "KS1, KS2", sitting in the list beside the real ones.

     SO THE SPLIT HAPPENS HERE, not in the sheet and not in the backend, and the column stays
     something a person can type into.

     ---------- AND IT IS ASKED AFTER LEVEL, AND ONLY ABOUT WHAT LEVEL HAS NOT ALREADY SAID ---------
     ASKED FOR AS *"Some worksheets are key stage 4 and 3 … key stage 3 and 4 shouldnt come before
     like the level … I prefer GCSE or SATs over grey areas."* Two faults in that sentence. This
     entry sat ABOVE `level` here, so wherever the code order stood (no `facets` row, or a sheet that
     names one and not the other) Key stage was asked first. And where `level` WAS first, it was
     skipped on every primary worksheet — 1,160 rows with a key stage and no level, under the 50%
     coverage bar — so the funnel fell through to `KS1 | KS2`, and inside GCSE it asked `KS3 | KS4`
     of the 737 sheets tagged `KS3, KS4`: a grey area offered after the qualification was chosen.

     SO `levelOf_` NOW READS A KEY STAGE AS ITS QUALIFICATION (`ksLevel_`) where a row has no level,
     and THIS QUESTION IS SILENT ON ANY ROW WHOSE LEVEL IS A QUALIFICATION — GCSE, SATs, A-level,
     Functional Skills, anything `LEVEL_BUCKET` files outside `KS3`. Dropping only the key stage the
     level names was tried first and measured: 17 GCSE-levelled sheets carry `KS2` in the key stage
     cell, so inside GCSE it still asked `KS2 | KS3`. The qualification is the answer the owner
     prefers, so where there is one the key stage is not offered beside it. What is left is a row
     with no qualification behind it, less the key stage its level already says. It stays a facet
     rather than being retired because the `facets` tab names it.

     ---------- AND NOW IT IS ASKED INSIDE SATs, AND ONLY THERE ----------------------------------------
     *"why is ks2 sats one tag? it should be sats. if they want to specify key stage then it should be
     its own thing."* The level stopped saying the key stage (`KS2 SATs` is `SATs`), so inside SATs
     this is the one question that tells a KS1 paper from a KS2 one -- `KS1 | KS2`, off
     `satsStagesOf_`. Everywhere else it answers nothing, which keeps the GCSE screen the owner
     reported (`KS3 | KS4` after the qualification was chosen) and the KS3 shelf's ranges from
     asking a grey area the qualification already settled. `check-funnel` holds both halves. */
```

### ---------- `A-Level` IS NOT A TIER, AND IT WAS AN ANSWER TO THIS QUESTION

in `FACETS`

```
/* ---------- `A-Level` IS NOT A TIER, AND IT WAS AN ANSWER TO THIS QUESTION ---------------------
     135 ROWS ANSWERED `Tier · A-Level` AND 263 ANSWERED `Level · A-Level`, so pressing the tier
     chip quietly gave you half of what the level chip gives — the smaller, wrong one. `check-funnel`
     has printed that pair as a note since it learned to print notes.
     A TIER IS FOUNDATION OR HIGHER. An A-level paper has neither, and saying so by answering
     nothing is honest where inventing a third tier is not. `Level` is untouched and still answers
     A-Level for all 263. The `tier` CELL is untouched too, because `paperLabels_` tells the A-level
     and AS papers of one sitting apart by exactly that column. */
```

### Through `waveOf`, for the same reason `year` goes through `yearOf` one line below:

in `FACETS`

```
/* Through `waveOf`, for the same reason `year` goes through `yearOf` one line below: the cell
     may hold a DATE rather than a wave, and a filter button sixty characters wide reading
     "Fri Jun 01 2024 08:00:00 GMT+0100 (British Summer Time)" is what that looks like untouched. */
```

### ---------- A SITTING IS TWO QUESTIONS: THE SERIES, THEN THE YEAR

in `FACETS`

```
/* ---------- A SITTING IS TWO QUESTIONS: THE SERIES, THEN THE YEAR ---------------------------------
     REPORTED AS "some tags are like summer 2018 when it should just be summer then 2018". This was
     ONE facet, `examWave`, answering `Summer 2018`. Sixteen sittings is past the seven a card holds,
     so its first draw was year PAIRS (`2023 & 2024`), and pressing one drew `Summer 2023`,
     `Autumn 2023`, `Summer 2024`: two facts on every answer, the year twice on the screen.

     Now two facets over the one reader, `sittingOf_`, which splits what `waveOf` already produced.
     So the two cannot disagree about what a row's sitting is, and every spelling `waveOf` folds (a
     date cell, `First wave`, `June 2018`) folds the same way for both. The series has two answers
     on this library (Summer, Autumn); the year keeps the pairs grouping, because nine years is still
     past seven, and is asked over again inside a pair.

     `examWave` IS RETIRED, NOT KEPT AS A THIRD WAY IN, and `RETIRED_FACETS` says why. Two questions
     about the sitting plus a third about the same thing joined up would be the `level`/`stage`
     fault. The bundle still names a sitting `Summer 2017` in its title and its groups; it reads
     `waveOf` directly for that, which is the one reader both facets are built on. */
```

### ---------- THE YEAR, THEN THE MONTH, THEN THE PAPER — LIKE THE FOLDERS THEY CAME FROM

in `FACETS`

```
/* ---------- THE YEAR, THEN THE MONTH, THEN THE PAPER — LIKE THE FOLDERS THEY CAME FROM ------------
     ASKED FOR AS *"I want it to ask for the year even if there's only one year's worth of the paper.
     Also I don't want it to ask summer or autumn I'd rather it just do the months. Like may or
     November. This is a principle I just want it to follow. Like when I'm in my gdrive folder finding
     the stuff it felt simple and I would have to select the year of the folder even if there was only
     one option."*

     TWO CHANGES, AND THE SECOND OVERRULES A DECISION ON PURPOSE. The series word (`Summer`) was
     chosen over the month because an Edexcel summer series sits Paper 1 in May and Papers 2 and 3 in
     June, so a month splits one series across two answers. That is now what is wanted: May holds
     Paper 1 and June holds Papers 2 and 3, the way two folders would. The YEAR comes first, as the
     outer folder does, and the month is asked inside it.

     `folder: true` IS THE PRINCIPLE. An ordinary question is skipped when it has one answer, because a
     tap that keeps everything narrows nothing -- right for a filter, and wrong for a path. A folder
     question is asked even with one answer, so the route to a paper is always Year, Month, Paper
     whatever is in the library: the same three taps for the only 2026 paper as for one of twelve in
     2019. Coverage still applies -- a list that mostly has no sitting is not asked about one.

     `examSeries` IS RETIRED, see `RETIRED_FACETS`. The bundle's own title still says `Summer 2017`
     where its papers share one, through `waveOf`. */
```

### ---------- `Publisher`, AND IT WAS LABELLED `Paper code` OVER PUBLISHERS

in `FACETS`

```
/* ---------- `Publisher`, AND IT WAS LABELLED `Paper code` OVER PUBLISHERS ----------------------
     THE LIVE LABEL CAME OFF THE SHEET AND WAS `Paper code`, over the answers `1st Class Maths`,
     `AQA`, `Edexcel`, `Corbettmaths` and `Standards & Testing Agency`. The row's own note in
     `data/settings/facets.json` says why it was typed — "holds 9MA0/01 more often than a publisher;
     split the column when you can" — and the column WAS split: `spec_code` has held the codes since
     the AQA RS papers went in. A label is exactly the thing a spreadsheet cell never gets reviewed,
     which is the sentence `RETIRED_FACETS` already carries.

     `not: examBoard` IS THE OTHER HALF. 2,542 of these rows carry the board's own name in the
     publisher column, so `Edexcel` was an answer to two questions with two different result sets —
     2,576 through the board and 1,148 through this one. Deferring leaves this question meaning the
     one thing its name means: who MADE the sheet, when that is not the board. Measured: five
     answers become two, `1st Class Maths` (1,370) and `Corbettmaths` (1,057). */
```

### ---------- WHAT YOU NEED IN FRONT OF YOU

in `FACETS`

```
/* ---------- WHAT YOU NEED IN FRONT OF YOU ------------------------------------------------------
     A LIST, so a question needing compasses AND the printed sheet answers both — `asList_` and the
     comma are doing here exactly what they do for `keystage` two screens up. The values come from a
     closed vocabulary in `check-library.js`, so a fifth spelling of "calculator" fails the build
     rather than becoming a fifth button.

     ITS COVERAGE IS LOW ON PURPOSE AND NOTHING NEW DECIDES WHEN IT IS ASKED. 1,013 of 4,005
     questions inherit a calculator answer from their paper's front page and the rest say nothing
     yet, so `FACET_COVERAGE` keeps the question quiet until the list on screen is mostly papers
     that declare it — which is the same self-correcting rule that keeps `Topic` out of the way
     until the list IS questions. */
```

### `tagOnly` SINCE 18 Oct:

in `FACETS`

```
/* `tagOnly` SINCE 18 Oct: measured, it was asked in 0 of 1,674 states -- every paper's kit is one
     answer by the time it could split anything -- so it is a door on a chosen paper's page, with the
     question number and the marks, rather than a question that never came. */
```

### ---------- `paper` — "PRINTED?" — WAS HERE, AND IT WAS NOT A QUESTION

in `FACETS`

```
/* ---------- `paper` — "PRINTED?" — WAS HERE, AND IT WAS NOT A QUESTION ------------------------
     IT READ `x.paper`, AND `questionItems` SET THAT TO `true` ON EVERY QUESTION. So the only
     reader of the field was this facet, and the only writer was a literal. Measured: 3,753 items
     answered `Printed` and 17 answered `Digital` — and those 17 were the widgets, which have no
     such field at all. It passed every test `nextFacet` had (two answers, 100% coverage) and
     narrowed nothing, on every search, for everybody.

     THIS IS THE `cost: 0` FAULT AGAIN. CLAUDE.md records it: "3,262 of 3,265 items answered Free,
     which made that bucket mean everything." That one was fixed in the data and the RULE that
     would have caught the next one was never written, so the next one arrived here. It is written
     now — see `FACET_MAX_SHARE` — and this facet is gone rather than repaired, because there is
     nothing left for it to ask: the print line was deleted with the paper card (CLAUDE.md, "What
     IS lost, and it is the print line"), so nothing in the app sells a printed anything.

     THE THREE COLUMNS IT MIGHT HAVE READ disagree anyway — `printable` is True on 882 rows,
     `needs_print` on 248, `print_required` on 100 — so an honest version of this question would
     have had to pick one and say why. When something sells paper again, that is the moment to. */
```

### ---------- `paperName` — "WHICH PAPER" — WAS HERE

in `FACETS`

```
/* ---------- `paperName` — "WHICH PAPER" — WAS HERE ------------------------------------------
     IT EXISTED BECAUSE THE PAPER WAS A RESULT. Its own note said so: the facet kept a paper's card
     in the list beside its questions rather than filtering it out. There are no paper cards; the
     list is questions, and `Year` + `Exam wave` + `Tier` already say which paper a question is
     from, off the same three columns copied onto every question row. A fourth facet spelling out
     "Paper 31: Statistics — June 2022" was the collection asserting itself one more time. */
```

### ---------- TWO MORE RUNGS ON THE SAME LADDER

in `FACETS`

```
/* ---------- TWO MORE RUNGS ON THE SAME LADDER ------------------------------------------------
     A QUESTION IS NOT A NEW KIND OF SEARCH, it is level → year → paper carried two steps further.
     These sit after the paper facets so the funnel narrows in the order somebody thinks in: which
     paper, then which question, then which part.
     Blank on everything that is not a question, so they only appear once the list is questions —
     which is what every other facet here already does. */
```

### ---------- ONLY WHERE A QUESTION NUMBER MEANS SOMETHING

in `FACETS`

```
/* ---------- ONLY WHERE A QUESTION NUMBER MEANS SOMETHING -----------------------------------
     ON A PAST PAPER IT IS A REAL QUESTION: "question 5" is a specific problem people talk about,
     look up and revise. ON A WORKSHEET IT IS A ROW INDEX. Twenty-five primary topics with ten
     questions each produced "1 (25), 2 (25), 3 (25) … 10 (25)" — ten identical answers that carry
     no fact about anything, offered as the next step after Key stage.

     THE DIFFERENCE IS THE DOCUMENT, so the document decides. A paper's numbering is part of how it
     is referred to; a worksheet's is the order it happens to be typed in. Blank on a worksheet, so
     the coverage rule never offers it there — and unchanged on the papers, where it was right. */
```

### ---------- THE FACET THAT IS ALWAYS TOO BIG TO ASK, DELIBERATELY

in `FACETS`

```
/* ---------- THE FACET THAT IS ALWAYS TOO BIG TO ASK, DELIBERATELY ---------------------------
     202 ANSWERS. It will never be offered as a question — `FACET_MAX_ANSWERS` is 40 — and that is
     not a flaw in it, it is what makes it a COLLECTION. `collectionAxes_` picks up exactly the
     facets that fail that test, so declaring this is how a paper becomes a thing you can group by
     without a `kind: 'paper'` row existing anywhere.

     `paper_id` OFF THE ROW, NOT `name` OFF THE ITEM. A question item's `name` is `Q2a` — the
     reference — and the paper's name is its `sub`. The id is the honest join and `groupItems_`
     names the group from what its members agree on, which for these is that `sub`.

     ANY DOMAIN CAN DO THE SAME with a row in the `facets` tab: name a column that many rows share
     and the funnel decides, by counting, whether it is a question or a collection. */
```

### ---------- A PAPER IS AN ANSWER, NOT A SECOND WAY OF ASKING

in `FACETS`

```
/* ---------- A PAPER IS AN ANSWER, NOT A SECOND WAY OF ASKING ----------------------------------
     THIS CARRIED `collect: true` AND WAS DRAWN AS A LINE ABOVE THE FUNNEL — "or the 227 papers
     these are in" — because 227 answers is past `FACET_MAX_ANSWERS` and a question cannot offer
     them. The flag, `collectionAxes_`, `groupItems_` and both handlers are gone: two ways of
     narrowing one list, stacked on one screen, is a pivot table, and this is a search.

     THE ORDINARY RULES ALREADY DO THE JOB and do it better. 227 answers keeps this silent at the
     top exactly as the cap intends; narrow to one board, tier and sitting and it is twelve, under
     the cap, and the funnel asks "which paper" as the plain question it is — with the same chip,
     the same ✕ and the same counts as every other answer. Nothing special, nothing to explain, and
     one screen with one question on it.

     THE NAME, NOT THE ID. `paper_id` is `P-1MA1-2306-1H` and a button has to be readable; every
     question of one paper carries that paper's name as its `sub`, so the id decides WHO answers
     and the name is what is shown. An item with no `paper_id` does not answer at all, which is
     what keeps the question away from tutors, venues and widgets. */
```

### ---------- A 5-A-DAY IS FOUND BY ITS LEVEL, ITS MONTH AND ITS DAY

in `FACETS`

```
/* ---------- A 5-A-DAY IS FOUND BY ITS LEVEL, ITS MONTH AND ITS DAY -------------------------
     REPORTED AS "corbet maths 5 a day is mad on the finder. should split into months and tiers".
     A book is a month of days, and the Paper question over 214 of them drew seven letter ranges of
     "5-a-day Foundation — 12 June" — an index nobody can use. The three questions somebody actually
     has in mind are which level, which month and which day, in that order, and they are asked in
     that order (sort 44–46 in `data/settings/facets.json`, straight after Type).

     ONLY 5-A-DAY ROWS ANSWER THESE, so the coverage rule keeps all three off every other screen,
     and nothing here touches `tier` or `paperId` for the rest of the library. `fiveLevel` reads the
     same `tier` cell as Tier — deliberately a second question rather than a move of Tier, because
     moving Tier up the order would move it for every past paper as well. With one level in the
     library it has one answer and is skipped, and it starts being asked the day a second book lands.

     THE DAY'S VALUE IS THE PAPER ID and its label is `1 June`, which is the `paperId` arrangement:
     the id decides who answers. Grouped into weeks, because a month is thirty answers. */
```

### `said` IS WHAT THE YEAR AND MONTH CHIPS HAVE ALREADY SAID, and the label drops it — see `sittingUnsaid_`.

in `FACETS`

```
/* `said` IS WHAT THE YEAR AND MONTH CHIPS HAVE ALREADY SAID, and the label drops it — see
       `sittingUnsaid_`. Absent on every caller that labels a paper on its own (the bundle, the
       basket, a bucket's key), which keep the whole name. */
```

### THE TAG IS THE ANSWER AS ITS OWN FOLDER DRAWS IT -- `Paper 1`, not the library-unique `Paper 1 (Non-Calculator) · Foundation — June 2024`:

in `FACETS`

```
/* THE TAG IS THE ANSWER AS ITS OWN FOLDER DRAWS IT -- `Paper 1`, not the library-unique
       `Paper 1 (Non-Calculator) · Foundation — June 2024`: the tags in front already say the tier and
       the sitting, and the calculator is its own tag (285). See `paperTag_`. */
```

### ---------- WHICH QUESTION, WHICH PART, WHICH PAGE, HOW MANY MARKS

in `FACETS`

```
/* ---------- WHICH QUESTION, WHICH PART, WHICH PAGE, HOW MANY MARKS ---------------------------------
     THE OWNER, 12 Oct: every tag on a card is an answer you can pick in the finder, and `Q1a(ii) · 1 of
     5` is five of them -- [Q1] [a] [ii] [1] [of 5] -- with the marks a sixth. They were one bold tag and
     one marks token the funnel could not pick; they are facets now, and `tagOnly`, so the 2 Oct rule
     stands: *"no more asking for questions 1-10 or question part 1 or b."* `nextFacet` never asks them
     on the way to a paper. Once a paper is chosen they are doors on its page (`tagDoors_`, held behind
     `paperId` or `fiveDay` by `FACET_NEEDS_FIRST`), so a [Q7] on a card is a [Q7] somebody can press.
     `qPart` is AQA's `.1` as the card has always printed `Q1.1`, so a digit part never reads as a
     question number. PAGE AND PAGES COUNT THE PART'S OWN READING PAGES -- its pre pages and its card,
     read live off `partPlan_` -- and only where there is more than one: [1] [of 1] says nothing. */
```

### ---------- "FREE" AND "NOT PRICED" ARE DIFFERENT ANSWERS, AND THIS SAID FREE TO BOTH

in `FACETS`

```
/* ---------- "FREE" AND "NOT PRICED" ARE DIFFERENT ANSWERS, AND THIS SAID FREE TO BOTH -------
     MEASURED: 3,262 OF 3,265 ITEMS ANSWERED `Free`. Every mapper in `stuffItems` used to write
     `cost: 0` whether or not the thing had a price at all — a subject, a level, a link, a friend,
     a timer, a question — because it was part of a block of blanks everybody copied. This facet
     tests `x.cost === 0`, strictly, so all of them came back Free and the `Free` bucket meant
     "everything in the app".

     THE BLANKS WERE CEREMONY AND THIS ONE WAS NOT, which is the trap: fifteen fields in that block
     behave identically whether you write them or not — `asList_` cannot tell `''` from `undefined`
     — and the sixteenth silently decided a filter. One load-bearing line hidden among fifteen
     decorative ones is exactly the kind of thing that makes a funnel feel arbitrary.

     SO: NO `cost` MEANS NO ANSWER, and the thing drops out of this question rather than claiming to
     be free. `cost: 0` still means free, because a shop item priced at nought IS free. `priced_`
     below is what tells an unset rate from a rate of zero. */
```

### ---------- HOW READY A PAPER IS, AS AN ANSWER YOU CAN PICK

in `FACETS`

```
/* ---------- HOW READY A PAPER IS, AS AN ANSWER YOU CAN PICK --------------------------------------
     *"Can you add a health check to worksheets or past papers so we can know when we are doing
     something whether it's low accuracy or buggy or missing shit or anything."* — the owner, 18 Oct.
     The score is `paperHealth_` in library.js, the one function `check-health.js` prints too; this is
     its band, so a card wearing `[Ready]` wears an answer this question offers (the owner's rule:
     every tag on a card is something you can pick); the percentage is the Health tile's (355).

     `tagOnly`, SO THE FUNNEL NEVER ASKS IT ON THE WAY TO A PAPER. Every list of questions would split
     on it, and asking it would put a fourth tap in front of every folder for a fact most people do not
     filter by. It is offered instead as its own row under whatever question is being asked
     (`tagDoors_`), which a tap can ignore. FOR EVERYBODY: *"No, everyone can see the scores"* — the
     owner, overruling a tutors-only first draft the same day. */
```

### ---------- THE FENCE: A CLOSED KIND'S QUESTIONS, AND ONLY ITS QUESTIONS

top level, before `FACET_ONLY`

```
/* ---------- THE FENCE: A CLOSED KIND'S QUESTIONS, AND ONLY ITS QUESTIONS --------------------------------
   `only:` ON A FACET (see the Bible's six above) NAMES THE KIND IT BELONGS TO. `listKind_` says
   whether a list is made entirely of one such kind, and `facetFenced_` is the rule both ways: a fenced
   question is asked only of its own kind's list, and that list is asked only fenced questions.
   O(1) FOR EVERY LIST THAT DOES NOT START WITH A CLOSED KIND — which is every list a non-admin ever
   holds, and every list an admin holds outside the Bible: one property read and a `Set` lookup, before
   any tally. A list that does start with one is walked once and remembered on the array, the
   `FACET_TALLY` way: a new list is a new array, so there is no key to get wrong. */
```

### THE FUNNEL'S QUESTIONS, AS THE SHEET WANTS THEM.

top level, before `FACET_LIVE`

```
/* ==================================================================================================
   THE FUNNEL'S QUESTIONS, AS THE SHEET WANTS THEM.

   `FACETS` above is the half that has to be code: how to READ a value off a thing. "The band, but
   only when it is a grade rather than a stage" is logic, and logic in a spreadsheet cell is a
   formula language nobody asked for.

   Everything else about a question — what it is called, when it is asked, whether it is asked at
   all — is editorial, and it was in code for no better reason than that it was written there. So
   the `facets` tab overlays this list: same fields, new labels, new order, and an off switch.

   A FIELD WITH NO ROW IS UNCHANGED, so the tab can be empty and the funnel behaves exactly as it
   does today. A ROW FOR A FIELD THAT DOES NOT EXIST IS IGNORED — the sheet cannot invent a
   question, because there would be nothing to read for it.
================================================================================================== */
```

### ---------- KEYED ON THE PAYLOAD, THE WAY `allTopics` DOES IT

top level, before `FACET_LIVE`

```
/* ---------- KEYED ON THE PAYLOAD, THE WAY `allTopics` DOES IT --------------------------------------
   THIS WAS `if (FACET_LIVE) return FACET_LIVE` AND NOTHING EVER CLEARED IT. Whichever call came
   first won for the rest of the session — and the first one is very often before the payload has
   landed. The app draws the screen you were last on before `load()` finishes, so reopening it on
   Find builds this list against `DATA.facets` being undefined, caches the code defaults, and then
   ignores the `facets` tab entirely no matter what arrives afterwards. Every label, every order and
   every off switch on that tab silently does nothing, for that whole session, at random. Retry has
   the same effect: `load()` replaces `DATA` wholesale and this went on answering from the payload
   before it.

   `allTopics` two hundred lines down already solves this properly — it keys its memo on the object
   IDENTITY of the payload branch it reads, so a new payload is a new list by construction. Same
   trick here. One comparison, no coupling to `load()`, and it cannot be forgotten from the other
   end because there is no other end. */
```

### ---------- A QUESTION THE SHEET INVENTED

top level, before `SHEET_BUCKETS`

```
/* ---------- A QUESTION THE SHEET INVENTED -------------------------------------------------------
   THE FUNNEL COULD BE EDITED FROM A SPREADSHEET AND NOT EXTENDED, and that is the whole reason
   adding a domain felt like ducktape. Boxing needed a mapper, a `boxKind` field, a `division` facet,
   `divisionOf_`, a card and a `KINDS` entry — six code changes to ask one new question.

   A FACET IS TWO THINGS AND ONLY ONE OF THEM IS LOGIC. "What is this called, when is it asked, is
   it asked at all" is editorial and has been in the sheet for a while. "How to READ the value off a
   thing" is `of:`, a function — and for TEN of the twenty-one facets that function is literally
   `x => x.subject`. Reading a named field is not logic. It is a field name.

   SO A ROW NAMING A FIELD THE CODE DOES NOT KNOW BECOMES A QUESTION, with the reader derived:

     LOOK ON THE ITEM FIRST, then on `row` — the original spreadsheet row every item carries. That
     second half is what makes this worth doing: a column somebody adds to `venues` is filterable
     the same afternoon, with no mapper edit, because the row is already on the item.

     A COMMA IS A LIST. A spreadsheet cell holding several values holds them comma-separated — that
     is what `keystage` already does in code, and doing it here means the next such column needs no
     code at all. The cost is a value that legitimately contains a comma, which for the categories a
     facet asks about is rarer than the list.

   THE BACKEND ALREADY PASSES THESE ROWS THROUGH. `doget.gs` says so where it builds `payload.facets`
   — "a row for a field the code does not know is passed through rather than dropped" — so this is
   a phone change only, no deploy.

   A TYPO IS NOT SILENT, and that is the part that took thinking about. `field: subjekt` matches
   nothing, so coverage is 0 and the question is never offered — invisible, which is this app's
   signature fault. `whyThisQuestion()` is the answer: it lists every facet including this one, with
   `nobody can answer it` beside it and 0%. The instrument existed before the hazard did. */
```

### ---------- A GROUPING FOR A QUESTION THE SHEET INVENTED

top level, before `SHEET_BUCKETS`

```
/* ---------- A GROUPING FOR A QUESTION THE SHEET INVENTED ------------------------------------------
   `qPart` HAS NO ROW IN `FACETS` — it is read straight off the column by the rule below, which is
   the whole point of that rule — and it holds twenty answers: `1`…`9`, `A`…`F`, the romans, and
   `Ai`/`Aii`. The alphabet would bucket those as `1` and `9–A`, which is legal and says nothing.

   SO THE TABLE IS KEYED ON THE FIELD NAME, beside the facet it belongs to rather than inside the
   builder, and a column the sheet invents tomorrow still gets the alphabet with nothing to add
   here. One entry today; the shape is what matters.

   NONE TODAY. `qPart` was the one entry and it is retired with `qNumber` — *"no more asking for
   questions 1-10 or question part 1 or b."* The table stays EMPTY rather than going, because the
   shape is still what a sheet-invented column with its own vocabulary would need, and
   `facetFromSheet_` reads it either way. */
```

### FIELDS WHOSE CODE FACET WAS DELETED ON PURPOSE, AND WHICH THE SHEET MAY NOT RESURRECT.

top level, before `RETIRED_FACETS`

```
/**
 * FIELDS WHOSE CODE FACET WAS DELETED ON PURPOSE, AND WHICH THE SHEET MAY NOT RESURRECT.
 *
 * REPORTED FROM A SCREENSHOT OF THE LIVE FUNNEL: a chip reading **`PRINTED OR DIGITAL  1`**.
 *
 * WHAT HAPPENED IS THE SHARPEST EDGE ON `facetFromSheet_` AND IT HAD NEVER FIRED BEFORE.
 * `facetList` sorts a `facets` row into one of two piles: a field the code declares is a RELABEL
 * of that facet, and a field the code has never heard of is a NEW question read straight off the
 * column. Deleting the `paper` facet from `FACETS` moved the sheet's row from the first pile to
 * the second — silently, in a commit that was about something else entirely.
 *
 * AND `paper` IS A COLUMN THAT MEANS SOMETHING ELSE. CLAUDE.md records the collision under its own
 * heading: `kind: 'paper'` was the document and `paper: '1'` is WHICH PAPER OF THE SET. The deleted
 * facet read `x.paper`, a literal `true` on every question; the column holds `1`, `2` and `3` on
 * 1,158 rows. So the funnel offered a question labelled "Printed or digital" whose answers were the
 * numbers 1, 2 and 3 — and a person who pressed one had quietly filtered the whole library to
 * Paper 1s while believing they had asked about printing.
 *
 * NEITHER RULE COULD SEE IT. It is not lopsided (three answers, a real split), it is not a literal
 * (the answers move), and no check compares a LABEL against what a column holds — nothing can.
 *
 * SO A DELETION IS REMEMBERED. The list is the `ACCEPTED` / `VOCAB` / `ACCEPTED_TAP` pattern for a
 * fourth time: one entry, one written reason, and the sheet cannot undo a decision the code made on
 * purpose. The label still has to be fixed in the `facets` tab — this only stops it drawing.
 *
 * IT DOES NOT BAR THE COLUMN FOR EVER. If "which paper of the set" is wanted as a question, it is
 * one entry in `FACETS` with a label somebody has read — which is the point: a label is exactly the
 * thing a spreadsheet cell cannot get reviewed.
 */
```

### ---------- THE ROW'S SPELLINGS OF THE QUESTION NUMBER AND THE PART

in `RETIRED_FACETS`

```
/* ---------- THE ROW'S SPELLINGS OF THE QUESTION NUMBER AND THE PART ------------------------------
     `qNumber` and `qPart` are code facets again, `tagOnly` (docs/history/355): never asked on the way
     to a paper, pickable once one is chosen. These two stay retired, because a sheet row naming the
     raw column would read the cell itself and offer `3i` beside the split [.3] [i] -- one fact in two
     shapes on one screen. */
```

### ---------- AND THE ONES THE CODE HAS NEVER HEARD OF

in `FACET_LIVE`

```
/* ---------- AND THE ONES THE CODE HAS NEVER HEARD OF -----------------------------------------
       AFTER the code's own, and LAST by default. A question somebody added in a spreadsheet has not
       been placed in the funnel's order by anybody — the code facets run 10 to 210 — so 1000 puts
       it behind all of them until a `sort_order` says otherwise. Sorting it in front of `What for`
       by accident would rearrange the first question every search passes through. */
```

### ---------- A DOOR IS ASKED BEFORE A FILTER, AND THE SHEET CANNOT REORDER THAT

in `FACET_LIVE`

```
/* ---------- A DOOR IS ASKED BEFORE A FILTER, AND THE SHEET CANNOT REORDER THAT ---------------
       THE SHEET PUT `subject` AT ORDER 1 AND TUTORS BECAME UNREACHABLE. That is not a hypothetical:
       measured on the real `facets` rows, the first question the funnel asked was Subject, and
       there is no answer to Subject that keeps a tutor — a tutor has none, `filterHit` finds no
       value, and every tutor, venue and friend is dropped by the first tap. The Message control on
       a tutor's pass was reported missing; it was on the card, and the card could not be got to.

       WHY THE COVERAGE RULE DID NOT CATCH IT. `FACET_COVERAGE` refuses a question fewer than half
       the list can answer — and `subject` has 100% coverage, because 4,005 of the 4,007 items are
       questions. The library is now so much larger than everything else that ANY library facet
       looks universal. The rule is still right; it is measuring a list in which the minority is
       three items.

       SO `always` MEANS WHAT ITS NOTE SAYS IT MEANS. `What for` and `What kind` are DOORS — they
       take somebody from the whole app to a department — and a door that is asked third is a door
       behind two filters. The sheet still owns the order of the doors among themselves, and the
       order of everything else, and whether any of them is asked at all. What it cannot do is put a
       filter in front of a door, because that is not an ordering preference: it is a dead end for
       everything the filter cannot describe.

       NOT A THIRD SETTING. It is the flag that already exists, doing the other half of the job it
       was declared for. */
```

### ---------- WHAT A SPREADSHEET CELL IS ALLOWED TO DO TO THE FUNNEL

top level, before `facetNum_`

```
/* ---------- WHAT A SPREADSHEET CELL IS ALLOWED TO DO TO THE FUNNEL --------------------------------
   A NUMBER FROM A SHEET IS WHATEVER SOMEBODY TYPED, and `Number('first')` is `NaN`, which is the
   most dangerous value either of these columns can hold — because `NaN` passes every check that
   was guarding them.

   `typeof NaN === 'number'` IS TRUE, so a mistyped `min_coverage` sailed through `nextFacet`'s
   `typeof facet.min === 'number'` test, and then `coverage < NaN` is FALSE, so the question was
   offered at ANY coverage. That is not a broken threshold, it is the coverage rule switched off —
   the trapdoor the long comment below `FACET_COVERAGE` exists to describe, reopened by a typo, on
   whichever question was mistyped, with nothing anywhere saying so.

   `a.at - b.at` WITH `NaN` RETURNS `NaN`, which a sort comparator reads as "equal", so a mistyped
   `sort_order` does not put the question last — it makes the order of the whole funnel depend on
   the engine's sort implementation.

   AND A HUMAN WILL TYPE 50 FOR A HALF. The column is a share from 0 to 1 and nothing said so at
   the point of typing; `50` means the question can never be asked, since no coverage exceeds 50.
   Read as a percentage instead, because that is unambiguously what was meant — nobody wants a
   question asked only when five thousand per cent of the rows can answer it. */
```

### A MAP OVER THE LIVE LIST, rebuilt only when `facetList` hands back a different array.

top level, before `FACET_BY_FROM`

```
/* A MAP OVER THE LIVE LIST, rebuilt only when `facetList` hands back a different array. This is
   called once per item per chip inside the filter — about seventy thousand times across a walk down
   the funnel — and a `find` along twenty-odd facets each time is work a phone does not need. Same answer
   as the two `find`s it replaces: the live list first, then the code's own. */
```

### ANY OF THEM COUNTS. A tutor is in Booking and in People, and choosing either has to keep them — an `===` against a joined string would have matched neither.

in `filterHit`

```
/* ANY OF THEM COUNTS. A tutor is in Booking and in People, and choosing either has to keep them —
     an `===` against a joined string would have matched neither.
     ON THE IDENTITY, NOT THE TEXT. The chip holds the spelling that was DRAWN and the item holds
     whatever the sheet says, and after the folding above those are often not the same characters:
     a chip reading `1st Class Maths` has to find a row that says `1stclassmaths`. `norm` only
     lowercases and trims, so it would have found neither — see `spellKey_`. */
```

### ---------- A BAND MATCHES BY MEMBERSHIP, NOT BY LETTERS

in `filterHit`

```
/* ---------- A BAND MATCHES BY MEMBERSHIP, NOT BY LETTERS -------------------------------------
     A TENS BAND REPLACES `1`…`13` WITH `1–10` AND `11–20`, so the chip holds a range and the row
     holds a number and no amount of spelling reduction will ever make those equal. Tested through
     `bandOf_`, the same function that drew the label, so the drawer and the filter cannot disagree
     about where a band's edges are — which is the `documents_()` argument: a second reader of one
     thing is a second chance to disagree about it. THAT ARGUMENT IS GENERAL NOW: see
     `bucketValues_`, where a band is one of three kinds of bucket and all three are matched by the
     one function that drew them. */
```

### `facetOwn_` HERE TOO, OR THE FILTER DISAGREES WITH THE BUTTON.

in `filterHit`

```
/* `facetOwn_` HERE TOO, OR THE FILTER DISAGREES WITH THE BUTTON. A facet that defers to another
     stops OFFERING the deferred value; if this went on matching it, a chip carried over from a
     wider list would keep rows the question no longer claims. One reader, both jobs — the
     `documents_()` argument. */
```

### ---------- A BUCKET MATCHES BY MEMBERSHIP, AND IT SAYS SO RATHER THAN LOOKING LIKE IT

in `filterHit`

```
/* ---------- A BUCKET MATCHES BY MEMBERSHIP, AND IT SAYS SO RATHER THAN LOOKING LIKE IT --------
     THIS SNIFFED THE SHAPE — `/^\d+–\d+$/` on the chip's text — which was right while a band
     was the only bucket there was, and is a trap the moment any facet holds a value that happens to
     read like one. `11–20` is a plausible thing for a spreadsheet cell to say.
     The chip carries `bucket` now, set where the bucket was drawn, so the two cannot disagree. */
```

### THE SHORTEST FORM OF A NAME THAT IS STILL UNIQUE AMONG THE NAMES BESIDE IT.

top level, before `sittingParts_`

```
/**
 * THE SHORTEST FORM OF A NAME THAT IS STILL UNIQUE AMONG THE NAMES BESIDE IT.
 *
 * REPORTED AS "it should say paper 1 paper 2 paper 3". What it said, six chips deep on Maths ·
 * GCSE · Higher · Summer 2017, was:
 *
 *     Paper 1 (Non-Calculator) — May 2017
 *     Paper 2 (Calculator) — June 2017
 *     Paper 3 (Calculator) — June 2017
 *
 * EVERY WORD AFTER THE NUMBER IS SOMETHING THE PERSON HAS ALREADY ANSWERED. They chose the sitting
 * one question ago, so "— May 2017" is the funnel reading their own chip back to them, three times,
 * in three different spellings — and it is the spelling that caused the complaint before this one,
 * because the sitting chip says `Summer 2017` and the answers underneath it say May and June.
 *
 * THE NAME IS A COMPOSITE AND ITS SEPARATORS SAY WHERE TO CUT. `Paper 1 (Non-Calculator) — May
 * 2017` is a number, a qualifier and a date, in that order, and the same shape holds for
 * `Paper 2A: Study of religion (Christianity) — June 2017` and for a venue called
 * `St Mary's Hall (Room 2)`. So the forms are the whole name cut at each separator, and the ladder
 * is tried shortest-first.
 *
 * UNIQUENESS IS THE ONLY THING THAT STOPS IT, and it is measured over the answers on screen rather
 * than declared. Narrowed to maths the three answers are `Paper 1`, `Paper 2`, `Paper 3`. Widen to
 * the whole of Summer 2017 and the RS papers join them, so `Paper 1` would be two different papers
 * on one button — the "one answer wearing two coats" fault `check-funnel.js` fails the build on —
 * and the rule falls back a rung to `Paper 1 (Non-Calculator)` / `Paper 1: Philosophy of religion
 * and ethics`. Measured both ways.
 *
 * IT NEVER INVENTS A WORD. Every form is a prefix of a name somebody typed -- or, for one form, the
 * number and the date with the qualifier between them dropped (see the end of the function) -- which
 * is the same argument as the spelling vote above: `Hcf And Lcm` is what happens when code writes
 * the label.
 *
 * `value` IS UNTOUCHED, and that is the half that makes it safe. `filterHit` matches the chip
 * against `facet.of(x)` through `spellKey_`, so a chip holding a SHORTENED name would find nothing
 * — narrowing by paper would silently return an empty list. The row carries the full name in
 * `data-value` and the short one in its text, which is exactly how `spellShow_` already separates
 * the two.
 *
 * ON EVERY FACET, NOT ON THE ONE THAT PROMPTED IT — the `cost: 0` / `paper: true` lesson, twice
 * recorded. A name with no separator in it has one form and comes back unchanged, so every
 * one-word answer in the app (`Maths`, `Higher`, `Summer 2017`) is untouched by construction.
 */
```

### A SITTING IS A YEAR AND A MONTH, AND THE FUNNEL ASKS THEM APART.

top level, before `sittingParts_`

```
/* ==================================================================================================
   A SITTING IS A YEAR AND A MONTH, AND THE FUNNEL ASKS THEM APART.

   REPORTED AS *"Fix this why it say June and year in same chip"*. The funnel asks Year and then Month
   as two folders, and three places went on saying both in one pill: the card's sitting tag (`June
   2024`), and the Paper answers once one of the two had been said by a chip — Year skipped, `June`
   pressed, and the answers read `Paper 1 — June 2023 | Paper 1 — June 2024`: the June the person had
   just chosen, read back to them twice, fused to the one thing they had not.

   THREE SMALL READERS, ONE PER JOB:
     `sittingParts_`   `June 2024` -> the year and the month, or null for anything else (`Specimen`,
                       `Sample`, a 5-a-day's `1 June`). Read off the date a paper's name prints after
                       its spaced dash, which is the only place it is written.
     `sittingSaid_`    which of the two the chips in front of a list have already said. A `Doesn't
                       matter` says nothing, and neither does a bucket — `2023 & 2024` is two years.
     `sittingUnsaid_`  a Paper answer with the said half dropped: `Paper 1 — June 2023` under a `June`
                       chip is `Paper 1 · 2023`, under a `2023` chip `Paper 1 · June`, and under both
                       `Paper 1`. A middle dot, because what is left is one fact beside the number
                       rather than a date; `SITTING_CUT_` below is what lets `nameForms_` still cut
                       there, so `shortLabels_` drops it too wherever the answers on screen let it.

   A BUNDLE'S TITLE KEEPS `June 2017`. It is a sentence about a set of papers, not an answer anybody
   presses, and it reads as one. */
```

### WHERE A NAME'S DATE STARTS:

top level, before `SITTING_CUT_`

```
/* WHERE A NAME'S DATE STARTS: the spaced long dash it is printed after, or -- once `sittingUnsaid_`
   has dropped half of it -- the middle dot before the lone year or month that is left. Only before
   a WHOLE year or month at the very end, so `Paper 1 · Foundation — June 2024`'s first dot, which is
   a rung `paperLabels_` put there, is never mistaken for a date. */
```

### AN EM DASH WITH SPACES ROUND IT, and an en dash for the same reason.

in `nameForms_`

```
/* AN EM DASH WITH SPACES ROUND IT, and an en dash for the same reason. NOT a plain hyphen: this
     library writes `A-Level` and `Capture-recapture`, and cutting at those would offer `A` as an
     answer. A dash that is a separator is spaced and long; a dash inside a word is neither.
     AND THE DOT BEFORE HALF A DATE, which is the same cut once a chip has said the other half --
     see `SITTING_CUT_`. */
```

### ---------- AND THE NUMBER WITH ITS DATE, WHEN THE YEAR WAS SKIPPED

in `nameForms_`

```
/* ---------- AND THE NUMBER WITH ITS DATE, WHEN THE YEAR WAS SKIPPED -----------------------------
     `Doesn't matter` ON THE YEAR LEFT SIX KS2 PAPERS READING THEIR WHOLE NAMES -- `Paper 1:
     Arithmetic — May 2019` and five like it, thirty characters each -- because every prefix this
     cuts collides across the two years: `Paper 1` twice, `Paper 1: Arithmetic` twice. What tells
     them apart is the date, and the date is at the END. So one more form keeps the number and the
     date and drops the qualifier between them, `Paper 1 — May 2019`, and goes in at RUNG 1 rather
     than into the length sort: `shortLabels_` reads every value at the same rung, and sorted by
     length `Paper 2: Reasoning` ties with `Paper 2 — May 2019` while `Paper 1: Arithmetic` does
     not, so the date form would never line up across the list. Measured over every maths past-paper
     route: forty Paper questions drawing whole names became six. Not a prefix, and still no word
     the paper did not print. */
```

### WHAT A PAPER IS CALLED ON A BUTTON, AND WHY IT IS NOT JUST ITS NAME.

top level, before `libDocRows_`

```
/* ==================================================================================================
   WHAT A PAPER IS CALLED ON A BUTTON, AND WHY IT IS NOT JUST ITS NAME.

   SIX NAMES ARE CARRIED BY MORE THAN ONE PAPER — twenty papers in all. `Paper 1 (Non-Calculator) —
   May 2017` is Edexcel Higher and `Paper 1 (Non-calculator) — May 2017` is the Foundation paper of
   the same sitting; `Paper 1 — June 2024` is SIX AQA science papers across three subjects and two
   tiers. A name is not an identity here and never was.

   SO THE NAME IS DISAMBIGUATED ONLY WHERE IT HAS TO BE, and by the thing that actually differs:
   the subject first, then the tier. A paper whose name nobody else carries is drawn exactly as it
   is written, which is every paper but twenty — and `shortLabels_` still trims those to `Paper 1`
   wherever the list on screen makes that unambiguous.

   BUILT FROM `LIBRARY_ROWS`, THE FILE ITSELF, NOT FROM THE MAPPED LIST. `DATA.questions` carries
   only 170 of the 262 papers' document rows and renames `paper_id` to `paper` on the way through --
   so a map built from it was missing a third of the library and looking up a key that is not there,
   which is why the first version of this drew every button as a raw id. The file is the faithful
   export, one row per line, `paper_id` and `name` spelled as the sheet spells them. A `WeakMap` on
   the array itself, so a new fetch is a new map with nothing to invalidate. */
```

### ---------- AND THE RUNGS STAYED ON AFTER THE QUESTION THEY NAME HAD BEEN ANSWERED

top level, before `libDocRows_`

```
/* ---------- AND THE RUNGS STAYED ON AFTER THE QUESTION THEY NAME HAD BEEN ANSWERED ---------------
   REPORTED FROM THE LIVE FUNNEL: "i saw somehthing like biology paper 1 as one category when it
   should be like biology then paper 1."

   MEASURED, NARROWED TO `Subject · Biology`: four answers, and every one of them read
   `Paper 1 — June 2024 · Biology · Foundation`. Every word after `Paper 1` is something already on
   the screen — the subject is the chip above, and the sitting is the only sitting those four papers
   have. The one thing that actually separates them is the tier, four words in.

   THE CAUSE IS TWO MECHANISMS FOR ONE JOB, AND ONLY ONE OF THEM LOOKS AT THE SCREEN. `shortLabels_`
   states the rule in its own note — *"uniqueness is measured over the answers on screen rather than
   declared"* — and this function measured it over the WHOLE LIBRARY, once, into a memo. So the
   rungs were computed against 266 papers and then drawn beside four, and `shortLabels_` could not
   take them off again: `nameForms_` cuts a name at its separators and a rung this function APPENDED
   is not a prefix of anything, so the ladder had nothing between `Paper 1` and the whole string.

   SO IT DISAMBIGUATES AGAINST THE IDS IT IS GIVEN. `facetTally_` hands `showOf` the answers it is
   about to draw, so at `Subject · Biology` the field is those four papers: the subject is the same
   on all of them and is not pushed, the tier differs and is, and the label comes out
   `Paper 1 · Foundation — June 2024` (the rung goes before the date: see the end of this function),
   which `shortLabels_` then trims to `Paper 1 · Foundation`. At `Chemistry · Higher` two papers share no name at all, so
   nothing is appended and `shortLabels_` trims both to `Paper 1` and `Paper 2`.

   WITH NO IDS IT IS THE LIBRARY, MEMOISED — the label for anything shown on its own, with nothing
   beside it to be unique against: `bucketKeyOf_` (which must stay a pure function of the value),
   the bundle's sort key and name, the basket line, and `chipShow_`'s fallback. It said a CHIP needed
   this form too, or it would read `Paper 1` and name one of twenty; that was before the owner found
   `PAPER Paper 1: Arithmetic — May 2019` on a chip over a menu saying `Paper 1`. A chip is labelled
   now against the chips in front of it -- the list its button was drawn over -- so it reads
   `Paper 1` exactly where the button did. See `chipShow_`. */
```

### ---------- THE FILE, NOT THE MAPPED LIST — AND THIS IS THE THIRD FUNCTION THAT NEEDED IT

top level, before `libDocRows_`

```
/* ---------- THE FILE, NOT THE MAPPED LIST — AND THIS IS THE THIRD FUNCTION THAT NEEDED IT --------
   `libraryInto_` DROPS EVERY ROW WHOSE `active` CELL IS NOT ON, so `DATA.questions` holds 174 of
   the file's 691 document rows. Anything that reads a PAPER-LEVEL fact — the code on its cover, the
   name for its button, whether a calculator is allowed — has to read the file or it silently knows
   a quarter of the library.

   IT WAS WRITTEN OUT TWICE AND `needsIndex_` WAS THE ONE THAT MISSED IT. Measured: 77 of the 128
   document rows carrying a `needs` cell are marked inactive, and seven of those have questions under
   them — the whole June 2024 Edexcel series, both tiers, Papers 1, 2 and 3, plus June 2023 Higher
   Paper 1. So **247 questions never said whether a calculator was allowed**, which on a maths paper
   is the first thing a student needs and the one fact `needs` exists to carry. Worse than a silence:
   15 of the 41 cards on Foundation Paper 1 drew "Printed sheet" and nothing else, so the strip was
   there and read as complete.

   A THIRD COPY OF THE THREE LINES WOULD HAVE BEEN THE THIRD, which is this repository's own sentence
   about `documents_()`, `factsNow_` and `childrenOf`. One reader, so the next function that needs a
   paper-level fact cannot get it wrong by being written somewhere else.

   `active` IS THE RIGHT CELL TO IGNORE HERE and `specIndex_`'s note says why: it decides whether a
   student may OPEN the document, and has nothing to say about what is printed on its cover. */
```

### A DOCUMENT ROW IN EITHER SPELLING.

top level, before `libIsDoc_`

```
/* A DOCUMENT ROW IN EITHER SPELLING. The file says `kind: 'document'`; the mapped list says
   `isDoc`, because `libraryInto_` renames it. A reader that knows only one of the two is a reader
   that finds nothing whichever list it is handed. */
```

### ---------- AND ONE MAP PER ANSWER LIST, NOT ONE PER ANSWER

top level, before `PAPER_LABEL_FOR`

```
/* ---------- AND ONE MAP PER ANSWER LIST, NOT ONE PER ANSWER ----------------------------------------
   `showOf` IS CALLED ONCE PER ID WITH THE SAME `ids` ARRAY -- by `facetTally_` and by `chipShow_` --
   and every call walked all 7,925 rows of the file to label one paper. Measured in Chromium at the
   8x CPU the repo uses for a phone: a Paper chip with only `What for` and `What kind` in front of it
   is 496 ids, so 496 walks, 2.3 to 2.8 seconds to draw one chip; and the Paper question over the
   same list cost 2.6 seconds to tally. The map for a list does not change between its own ids, so
   it is built once and kept on the ARRAY: both callers build `ids` once and hand that same array
   to every value, and a new list is a new array with nothing to invalidate. `rows` rides along so
   a new fetch of the file is a miss rather than a stale label. */
```

### ONLY WHAT DIFFERS, AND ONLY WHERE IT SEPARATES.

in `paperLabels_`

```
/* ONLY WHAT DIFFERS, AND ONLY WHERE IT SEPARATES. Adding the subject to six AQA papers that
       are already three subjects is the whole of the fix; the tier, and then the board, are what
       is left when the subject does not settle it. Appending both always would put
       "· Maths · Higher" on two hundred unique names.

       THE BOARD RUNG ARRIVED WITH AQA COMBINED SCIENCE, beside the Edexcel papers that were
       already there. `Biology Paper 1 — June 2024` is a true name of an 8464/B/1H and of a
       1SC0/1BH, and the two agree on subject and on tier as well — so the old rule appended
       `· Higher` to both and drew ONE label over two different papers, which is the
       `Alevel` / `A-Level` fault with the spelling hidden instead of shown. A rung that is the
       same on every candidate is noise that still names two things, so each is pushed only where
       it cuts the field, and each narrows the field for the one below it. */
```

### ---------- THE RUNGS GO BEFORE THE DATE, NOT AFTER IT

in `paperLabels_`

```
/* ---------- THE RUNGS GO BEFORE THE DATE, NOT AFTER IT ----------------------------------------
       APPENDED, THEY HELD THE DATE ON THE BUTTON FOR EVER. `Paper 1 \u2014 June 2024 \u00b7 Foundation` has
       nowhere for `nameForms_` to cut between `Paper 1` and the whole string, so once the sitting
       became two questions of its own \u2014 `Summer`, then `2024`, both chips above the answers \u2014 the
       Paper answers still read `\u2014 June 2024` under them: the year said twice and the season said
       a second way, which is the "summer 2018" report wearing a paper's name. Put before the spaced
       dash the date is the last cut, `Paper 1 \u00b7 Foundation` is a form of its own, and
       `shortLabels_` drops the date wherever the answers on screen let it. A name with no dash is
       unchanged. `check-funnel.js`'s paper-label rule asserts the year is not repeated. */
```

### AN ID WITH NO DOCUMENT ROW IS DRAWN AS ITSELF rather than as nothing — an unreadable button beats a blank one, and `check-library.js` already fails on a

top level, before `paperLabel_`

```
/* AN ID WITH NO DOCUMENT ROW IS DRAWN AS ITSELF rather than as nothing — an unreadable button beats
   a blank one, and `check-library.js` already fails on a question whose `paper_id` names no
   document, so this is the shape that cannot happen rather than one to hide. */
```

### `text` IS THE DISPLAY STRING WHERE THE VALUE IS AN IDENTITY.

in `shortLabels_`

```
/* `text` IS THE DISPLAY STRING WHERE THE VALUE IS AN IDENTITY. A facet whose `of` returns an id
     supplies `showOf`, and everything from here down shortens THAT rather than the id — `value`
     goes on being the only thing matched. Undefined on every other facet, so they are unchanged. */
```

### ---------- UNIQUE TO A READER, NOT TO `===`

in `shortLabels_`

```
/* ---------- UNIQUE TO A READER, NOT TO `===` ------------------------------------------------------
     `Paper 1 (Non-Calculator)` AND `Paper 1 (Non-calculator)` ARE DIFFERENT STRINGS AND ONE LABEL.
     The first is the Edexcel Higher paper of Summer 2017 and the second the Foundation one, and
     `paperLabels_` had already told them apart by tier — this rung then threw the tier away again,
     because the two shorter forms differ by one letter's case and a `Set` of strings calls that
     unique. Found by the bundle, which listed the two side by side over one sitting.
     `spellKey_` IS THE FUNNEL'S OWN ANSWER to "are these the same word", so a rung is taken only
     where no two labels on it reduce to one identity. Stricter than before and never looser, so no
     answer that was distinct becomes a collision — which is what `check-funnel.js` test 4b guards. */
```

### A LONG LIST OF PLAIN NUMBERS IS ASKED IN TENS.

top level, before `alphaKey_`

```
/**
 * A LONG LIST OF PLAIN NUMBERS IS ASKED IN TENS.
 *
 * REPORTED WITH A SCREENSHOT: "look what happens when the options are too long. there should be a
 * filter to fix this. e.g. q1-10, q11-20." — thirteen rows reading `1`, `2`, `3` … down past the
 * bottom of the phone, each one a tap target the height of a button and none of them any easier to
 * choose between than the number beside it.
 *
 * THE CAP DID NOT CATCH IT AND SHOULD NOT HAVE. `FACET_MAX_ANSWERS = 40` is about a list nobody can
 * READ — 212 paper names — and thirteen numbers are perfectly readable. They are just not worth
 * thirteen rows, because **a run of consecutive integers is the one answer set where the reader
 * already knows what is in the gaps.** Nobody scans 1…13 to find out whether 7 is there.
 *
 * SO IT IS NOT A NEW CAP, IT IS A DIFFERENT SHAPE FOR ONE KIND OF ANSWER. Every value has to be a
 * plain non-negative integer — `1`, not `1a`, not `Grade 4`, not `Paper 1` — and there have to be
 * more than `FACET_MAX_SHOWN` of them, which is `bucketValues_`'s own threshold rather than a
 * second one beside it. Anything else falls straight through, so subjects, topics, papers and
 * sittings never reach this rule. Measured before writing it: of the twenty-odd facets, only the
 * sheet-invented `question` column is all-integer.
 *
 * TENS, AND NOT A COMPUTED BUCKET SIZE. An exam paper is numbered 1 to about 25 and a person asks
 * for "the first ten" or "the twenties" — those are the words, and a band of 7 chosen to make the
 * columns even would be arithmetic nobody asked for. Bands are aligned to the ten, so the first is
 * `1–10` rather than `1–10` sliding with wherever the data starts, and an empty band is never
 * drawn because it is built from the values that exist.
 *
 * AND THE BAND IS A REAL ANSWER, NOT A VIEW. It becomes a chip with the same ✕, and `filterHit`
 * tests membership rather than equality — see the note there. Answering `11–20` and then being
 * asked again, now with ten ordinary numbers, is the funnel doing what it always does: ask the
 * question the list in front of it deserves.
 *
 * THIS IS RULE 2 OF THREE NOW rather than a rule of its own, and every word above still holds —
 * see `bucketValues_` below, which is this mechanism with a declared grouping in front of it and
 * the alphabet behind it. `bandOf_` is untouched and is still the one place a band's edges are
 * decided.
 */
```

### AND THE SAME MOVE FOR EVERY OTHER KIND OF ANSWER — NEVER MORE THAN SEVEN, EVER.

top level, before `alphaKey_`

```
/* ==================================================================================================
   AND THE SAME MOVE FOR EVERY OTHER KIND OF ANSWER — NEVER MORE THAN SEVEN, EVER.

   REPORTED, VERBATIM: "i noticed there are some menus in finder where there are more than 7 options.
   And so it can't display them and asks user to search. I DO NOT LIKE THIS. Have the categories work
   in a way that there are never more than 7. If it means grouping many suptopics into first larger
   topics then do so. For all things by the way."

   WHAT WAS THERE. `FACET_MAX_SHOWN` trimmed the drawn answers to seven and printed a line under
   them — "and 368 more topic answers, type one into the search box above". That line is the thing
   being rejected, and it deserves to be: it is the funnel giving up on its own job in front of you.
   Three hundred and sixty-eight answers you cannot see, and an instruction to go and type instead.

   MEASURED BEFORE ANY OF THIS WAS WRITTEN, over the real 5,587 items, at every state a person can
   reach by answering the funnel's own questions. Fourteen facets break seven:

     Topic 375 · Paper 266 · Category 25 · Question part 20 · Division 16 · Sitting 16 · Decade 14
     Topic area 13 · Question number 11 · Level 9 · What you need 9 · What kind 8 · Subject 8
     Grade 8

   and narrowing does not save them: six answers deep on Maths worksheets at KS4 the Paper question
   still holds 87 and Topic still holds 75.

   SO THE CAP BECOMES A GROUPING RATHER THAN A TRIM, which is not a new idea here — it is exactly
   what `bandNumbers_` already did for a run of integers, and every word of the note above it holds
   for the general case. A band is a bucket; this is that mechanism with two more kinds of bucket
   behind it.

   THREE RULES, TRIED IN ORDER, AND THE FIRST THAT ANSWERS WINS:

     1. THE FACET'S OWN.  `bucketOf: v => 'Number & Algebra'` on a facet in `FACETS`. A meaningful
        larger category, written by somebody who knows what these answers ARE — "group many
        subtopics into first larger topics", which is what was asked for.
     2. TENS.             A run of plain integers bands as it always did: `1-10`, `11-20`.
     3. THE ALPHABET.     Anything else falls into at most seven contiguous letter ranges, balanced
        by how many things are behind each. Predictable, needs nobody to write a table, and is what
        every long list anybody has ever scrolled does.

   RULE 3 IS THE ONE THAT MAKES THIS A GUARANTEE RATHER THAN A HABIT. A facet the spreadsheet
   invents tomorrow — `facetFromSheet_` can do that with no deploy — gets seven buckets without a
   line here, and so does a facet whose values grow past seven next year. That is the difference
   between a rule and a list of repairs, which is the sentence this file writes about `cost: 0` and
   `paper: true`.

   ELEVEN OF THE FOURTEEN GOT A TABLE AND THREE DID NOT, and which three is a fact about the data
   rather than a corner that was cut. `check-funnel.js` prints every grouping on every run, in full,
   so what follows is readable rather than taken on trust here:

     `topic`     417 distinct values and **70 of them are in no branch of `data/topics.json`** —
                 `quadratic equations`, `volume`, `sets`, `plans and elevations`, `hcf`. The tree's
                 SECOND level is exactly the larger topic that was asked for (`Fractions`,
                 `Angles`, `Mensuration`), and rule 1 is all-or-nothing on purpose: a grouping that
                 places 347 and drops 70 makes those 70 unreachable with nothing on screen saying
                 so, which is the silent absence this repository keeps producing. So it stands down
                 at almost every state, and the honest answer is the alphabet until the 70 are
                 aliased into the tree — data work, and a task. What carries the user's own sentence
                 in the meantime is `Topic area`, which IS the larger topic and is asked immediately
                 before Topic: the ranges index inside one area rather than across the library.
     `paperId`   266 documents. A paper's larger category is its sitting, its board, its tier and
                 its type — every one of which is already a question of its own, asked before this
                 one. What is left to tell two papers apart by the time Paper is reached is the name
                 on the cover, so an index of those names is what this is. See `bucketKeyOf_`.
     `category`  the link categories, and they come out of `data/settings/links.json`, which the
                 owner edits with no deploy. A table in code over a list the sheet owns is two
                 things to keep in step and the code's copy is the one that goes stale — the fault
                 this file records under `MESSAGING`, under `kinds` and under `childrenOf`.
                 (Gone with the links since; the reasoning stands for the next sheet-owned list.)

   A BUCKET IS A REAL ANSWER, NOT A VIEW. It becomes a chip with the same X, `filterHit` tests
   membership rather than equality, and `nextFacet` asks the question AGAIN over what is left — so
   Topic goes 375 -> seven areas -> the topics in the one you picked. Two taps to reach a place that
   previously could not be reached at all.

   AND A BUCKET DOES NOT SETTLE THE FACET, which is the line in `nextFacet` that makes the whole
   thing terminate. `Grade` at 8 answers groups into three; pressing `Grades 4–6` leaves 671 items
   whose Grade values are three, so Grade is asked AGAIN and now draws `Grade 4`, `Grade 5`,
   `Grade 6`. Measured down the greedy path: every question is either at most seven real answers or
   at most seven buckets, and every bucket is one tap from the answers inside it.

   AND MEMBERSHIP IS A PURE FUNCTION OF THE CHIP, which is the constraint that shaped all of this.
   `filterHit` is handed one item and one filter and never the list, so a bucket whose edges depend
   on what else happened to be on screen could not be matched afterwards. Every bucket label carries
   its own edges — `Number & Algebra` is looked up, `11-20` and `A-C` are parsed — so the drawer and
   the filter cannot disagree about what is inside it. That is `bandOf_`'s own argument, generalised.
================================================================================================== */
```

### ---------- THE SEVEN LETTER RANGES ARE BUILT, NOT DECLARED

top level, before `alphaKey_`

```
/* ---------- THE SEVEN LETTER RANGES ARE BUILT, NOT DECLARED ---------------------------------------
   A FIXED A-C / D-F / G-I TABLE WAS WRITTEN FIRST AND MEASURED BADLY: the library's topics put 96
   of 375 under A-C and 4 under T-Z, so one bucket was a quarter of the list and another was a
   rounding error. Contiguous runs balanced on the counts give seven buckets of comparable size,
   which is what `FACET_MIN_MINORITY` asks of every other question here.

   THE LABEL IS A PREFIX RANGE and the prefix is as short as it can be while still splitting the
   list — one letter where one letter is enough, two inside a bucket that needed splitting again. */
```

### ---------- AND A RANGE IS MEASURED ON WHAT IS READ, NOT ON WHAT IS MATCHED

top level, before `bucketKeyOf_`

```
/* ---------- AND A RANGE IS MEASURED ON WHAT IS READ, NOT ON WHAT IS MATCHED ----------------------
   THE PAPER QUESTION IS WHY THIS EXISTS AND IT WAS THE WHOLE OF WHAT WAS WRONG WITH IT. Its `of`
   returns a `paper_id` — `P-1MA1-1705-1H`, `RS1786302107764-481`, `W-1CM-reflections` — and its
   `showOf` turns that into the name on the paper's cover. The alphabet keyed on the value, so 266
   papers came back as three buckets labelled `P`, `R` and `W`: legal, balanced, under the cap, and
   an index of a spelling nobody has ever seen. Keyed on the name they are letter ranges over
   `Adding Decimals` and `Circle Theorems Edexcel`, which is what an index of 266 documents is.

   ONE READER, so the drawer and `bucketHas_` cannot disagree about which string a range is about —
   the argument `bandOf_` makes about the edges of a band, one step along.

   AND IT DELIBERATELY DOES NOT ASK `bucketOf`, WHICH IT DID FOR ONE COMMIT AND WHICH OPENED A HOLE
   IN THE WHOLE GUARANTEE. The idea was that a facet declaring its own grouping is saying what its
   values are about, so a grouping with too many groups to draw would at least give ranges over the
   GROUP names. What it actually gives, when every value on the list maps to ONE group, is a key
   that is the same string for all of them: `alphaBuckets_` grows its prefix to twelve characters,
   never finds a second run, returns null — and `bucketValues_` hands the list back UNGROUPED.
   Measured on a ten-value facet whose table answers one label: ten answers drawn, cap gone.

   THE KEY HAS TO BE A PURE FUNCTION OF THE VALUE AND IT HAS TO TELL VALUES APART. Those two are
   the whole constraint: `bucketHas_` is handed one item and never the list, so it cannot know
   which key the drawer chose, and a key that collapses is a question that cannot be split. What a
   value is READ as always tells values apart, because that is what makes them different answers.

   SO THE TABLE OWNS ITS OWN LABELS INSTEAD — see `bucketDeclares_` in `bucketHas_`, which is where
   the `KS2`-against-`KS2–GCSE` leak this key was introduced to close is now closed, and closed by
   the table rather than by a spelling.

   `showOf` IS CALLED WITH NO ANSWER LIST, deliberately. `facetTally_` passes one so a label can be
   disambiguated against the answers beside it, and `bucketHas_` is handed one item and never the
   list — so a key built from the shortened form could not be recomputed at match time. The long
   form is the one both ends can always reach. */
```

### ---------- IS THIS LABEL ONE THE FACET'S OWN GROUPING MADE?

top level, before `bucketDeclares_`

```
/* ---------- IS THIS LABEL ONE THE FACET'S OWN GROUPING MADE? -------------------------------------
   A TABLE ENUMERATES ITS LABELS in `bucketOrder` and a computed grouping cannot, so the second test
   is that it is IDEMPOTENT: `decadeBucket_('1930s & 1940s')` reads the year out of its own label
   and answers `1930s & 1940s`. Both hold by
   construction for a grouping that reads a number out of a string, which is what a computed one is.

   IT MATTERS BECAUSE A DECLARED LABEL MUST NOT BE READ AS A LETTER RANGE. `LEVEL_BUCKET` files a
   span under the level it goes up to, so `KS2–GCSE` belongs to `GCSE` — and the prefix test below,
   handed the label `KS2`, answered yes to it, because `ks2` is `ks2`. Measured: 31 rows were in two
   buckets at once and the table's own sentence was contradicted by the mechanism meant to carry it.
   The table decides both ways now, which is what `bandOf_`'s note means by one function owning the
   edges. */
```

### ---------- IS THIS VALUE INSIDE THAT BUCKET

top level, before `bucketHas_`

```
/* ---------- IS THIS VALUE INSIDE THAT BUCKET -----------------------------------------------------
   THE ONE TEST BOTH THE DRAWER AND `filterHit` USE. Three shapes, told apart by the chip itself
   rather than by anything remembered:

     a facet's own    the facet's `bucketOf` returns this label for the value
     `11-20`          both ends are integers, and the value is an integer between them
     `A-C` or `Al`    a letter range, compared on a prefix as long as the range's own ends

   COMPARED ON A PREFIX, WHICH IS THE HALF THAT IS EASY TO GET WRONG. `'circles' <= 'c'` is false,
   so a whole-string compare drops every value longer than its own upper bound — which is most of
   them. Truncating to the bound's length is what makes `C` mean "everything starting with C". */
```

### ---------- A DECLARED LABEL IS THE TABLE'S, BOTH WAYS

in `bucketHas_`

```
/* ---------- A DECLARED LABEL IS THE TABLE'S, BOTH WAYS --------------------------------------
     NOT "matches if the table says so, and then try the ranges anyway", which is what this was and
     what let `KS2` collect `KS2–GCSE`. If the grouping made this label, the grouping is the whole
     answer about it. See `bucketDeclares_`. */
```

### A TENS BAND. Both ends have to be digits, so `9–A` is not one and falls through to the prefix test below — which is the branch that was refusing it.

in `bucketHas_`

```
/* A TENS BAND. Both ends have to be digits, so `9–A` is not one and falls through to the prefix
     test below — which is the branch that was refusing it.

     `2025–2026` IS A SITTING'S LABEL AND MATCHES THIS SHAPE EXACTLY, which is a trap worth naming
     even though it cannot fire: rule 1 above answers first for every value `decadeBucket_` places,
     and the rule that drew those labels only draws them when it places all of them. Were it ever
     reached, `intAnswer_` refuses `Summer 2024` and the answer is a correct false. A declared label
     that is two integers around a dash AND sits on a facet whose values are bare integers is the
     one combination that would be wrong here, and nothing in `FACETS` is both. */
```

### ONLY FOR A VALUE THAT IS ITSELF AN INTEGER.

in `bucketHas_`

```
/* ONLY FOR A VALUE THAT IS ITSELF AN INTEGER. A letter range over names that start with digits
     spells exactly the same way — the paper index drew `2–5` over papers named `2019 …` to
     `5-a-day …` — and read as a tens band it held nothing: the row promised 1,564 papers and
     pressing it returned none. A tens band is only ever drawn when every value is an integer, so
     a value that is not one can only be asking about a prefix range. */
```

### ---------- A PREFIX RANGE, AND IT MUST NOT INSIST ON A LETTER

in `bucketHas_`

```
/* ---------- A PREFIX RANGE, AND IT MUST NOT INSIST ON A LETTER --------------------------------
     THIS OPENED WITH `if (!/^[a-z]/i.test(b)) return false;` AND IT WAS WRONG about two real
     answers: the question-part facet holds `1`…`9` beside `A`…`F`, so its buckets are `1` and
     `9–A`, and both start with a digit. Pressing either returned nothing at all while the row
     beside it promised 253 and 306 — the silent empty this whole mechanism exists to avoid, caused
     by the mechanism itself. Any bucket that is not a tens band is a prefix range, whatever
     character it starts with.

     COMPARED ON A PREFIX AS LONG AS THE RANGE'S OWN ENDS, which is the other half that is easy to
     get wrong: `'circles' <= 'c'` is false, so a whole-string compare drops every value longer than
     its own upper bound, which is most of them. Truncating to the bound's length is what makes `C`
     mean "everything starting with C". */
```

### THE SAME STRING THE RANGE WAS BUILT FROM — see `bucketKeyOf_`.

in `bucketHas_`

```
/* THE SAME STRING THE RANGE WAS BUILT FROM — see `bucketKeyOf_`. A paper's range is over its
     name and this is handed its id, so keying on the value here would test `p-1ma1-1705-1h`
     against `adding decimals` and answer nothing at all. */
```

### ---------- AND THE ANSWERS, REPLACED BY THE BUCKETS THEY FALL IN

top level, before `bucketValues_`

```
/* ---------- AND THE ANSWERS, REPLACED BY THE BUCKETS THEY FALL IN ---------------------------------
   Returns the list unchanged when it already fits, so every facet with seven answers or fewer is
   untouched by construction — subjects, tiers, key stages and everything else that was already
   readable goes on being drawn exactly as it was.

   THE COUNT BESIDE A BUCKET IS COUNTED OVER ITEMS, NOT SUMMED OVER ANSWERS, and the first version
   summed. `facetTally_` counts an item once per ANSWER it gives — which is right, and is what makes
   a worksheet tagged `KS3, KS4` appear under both — so a question tagged `Loci` and `Nets`, both
   inside `L–O`, was counted twice in that bucket. Measured: the row promised 723 and pressing it
   returned 646. A number beside an answer that is not the number you get is the fault the `promises`
   test in `check-funnel.js` exists for, and it caught this one the moment it was written.

   SO THE RECOUNT GOES THROUGH `bucketHas_` — the same function `filterHit` uses — over the same
   items. The drawer and the filter cannot disagree because they are asking one function. That is
   `bandOf_`'s own argument and `documents_()`'s before it. */
```

### ---------- AND NOW NOTHING IS GROUPED AT ALL

top level, before `bucketValues_`

```
/* ---------- AND NOW NOTHING IS GROUPED AT ALL ---------------------------------------------------
   THE OWNER, 6 Oct, on a screenshot of `Grades 1–3 | Grades 4–6 | Grades 7–9`: *"No more of these
   artificial categories like grade 1-3."* The same day the letter and number ranges went (*"Just
   display"*); this takes the facets' own tables with them -- grade bands, subject areas, levels,
   divisions. A question draws the answers the items actually give, every one, and a list too long
   to draw whole is not asked (`FACET_MAX_ANSWERS` in `nextFacet`) until the other questions have
   narrowed it. `bucketHas_` and the tables stay: a chip saved on a phone before this still finds its
   items, and `check-flow` reads the kind table to route its journeys. */
```

### A plain non-negative integer and nothing else.

top level, before `intAnswer_`

```
/* A plain non-negative integer and nothing else. `+v` alone would accept ` 4 `, `4.0` and `1e3`,
   and `parseInt` would accept `4a` — which is a real value in this library, because an exam
   question is numbered `4a`. The test has to be on the characters. */
```

### ---------- `FACET_BAND_AT` AND `bandNumbers_` WERE HERE

top level, before `spellGaps_`

```
/* ---------- `FACET_BAND_AT` AND `bandNumbers_` WERE HERE ------------------------------------------
   THEY BANDED A RUN OF PLAIN INTEGERS INTO TENS and did nothing to anything else, which is the
   whole of what `bucketValues_` above now does as its second rule — same `bandOf_`, same chip, same
   membership test. Two functions doing one job is the second reader this file keeps recording, so
   the one that only knew about numbers has gone.

   ITS THRESHOLD WENT WITH IT AND THAT IS A REAL CHANGE. `FACET_BAND_AT` was 12, so a facet holding
   eleven numbers drew eleven rows; the cap is `FACET_MAX_SHOWN` now, so eleven numbers band into
   two. That is the point: there is one number deciding how many answers fit on a card, and it is
   the one the card is measured against.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE FIRST QUESTION IS NOT ALPHABETICAL

top level, before `spellGaps_`

```
/* ---------- THE FIRST QUESTION IS NOT ALPHABETICAL ------------------------------------------------
   EVERY FACET SORTS ITS ANSWERS BY NAME, which is right for subjects, venues, exam boards and
   everything else: there is no reason to prefer one of forty tutors, and alphabetical is the order
   somebody can predict.

   "WHAT FOR" IS THE EXCEPTION. Its answers are the app's departments, and they have an order that
   is about what people come here to do rather than about their initials — Booking first because it
   is the errand that costs money, Links high because it is a shortcut somebody wants in one tap.
   Alphabetically it ran Booking, Friends, Games, Learning, Links, People, Shop, Tools, which put
   two of the least-used first.

   ANYTHING NOT LISTED FALLS TO THE END, alphabetically among itself, so a group added tomorrow
   appears without needing a line here. */
```

### ONE ANSWER, ONE BUTTON, WHATEVER IT IS SPELLED LIKE.

top level, before `spellGaps_`

```
/* ==================================================================================================
   ONE ANSWER, ONE BUTTON, WHATEVER IT IS SPELLED LIKE.

   THIS FAULT HAS NOW ARRIVED IN FOUR COLUMNS AND BEEN REPAIRED BY HAND IN THREE:

     `level`     `Alevel`, `A-level`, `A-Level` — three answers on one screen, fixed in `levelOf_`
     `exam_wave` `June 2018` against `First wave` — fixed in `waveOf`
     `topics`    46 of 389 values differ from another only by case — fixed by a vote in `topicOf_`
     `company`   `1stclassmaths` on 1,372 rows and `1st class maths` on 109 — invisible only
                 because the funnel lists questions and every question row used the first

   EACH FIX WAS TO THE INSTANCE AND NONE WAS TO THE RULE, which is the exact sentence this file
   already carries about `cost: 0` and `paper: true`. The fourth one was waiting in a column nobody
   had looked at, and the fifth will be in a column added next month.

   SO IT IS A RULE NOW, AND IT IS TWO LINES. An answer's IDENTITY is its letters and digits; its
   SPELLING is whichever of the variants is most worth showing. `facetTally_` folds the variants
   together when it counts, and `filterHit` matches on the identity rather than the text — so a chip
   saved as `A-Level` still finds an item that says `Alevel`, and there is no migration, no
   vocabulary list and nothing to keep in step with the next bulk import.

   WHICH SPELLING WINS, in order, and every rule in it is about not inventing a word:

     THE ONE A PERSON WOULD WRITE.  `1st Class Maths` over `1stclassmaths`, `A-Level` over `Alevel`.
     Counted as separators — spaces and hyphens — because a squashed spelling is a machine's (a
     slug, an id, a filename) and a spaced one was typed by somebody. This is the half a plain vote
     gets wrong: `1stclassmaths` outnumbers `1st class maths` by twelve to one and is still not the
     publisher's name.

     THEN THE COMMONEST, then the alphabet — so the answer never depends on the order the file
     happens to be in, which is the sort of dependency that changes a button's label on an unrelated
     commit.

     AND THE FIRST LETTER IS RAISED, which is the one thing neither test should decide. `estimation`
     outnumbers `Estimation` in the library, and a lower-case button in a column of capitalised ones
     reads as a fault in the data. Only the first letter, never the interior words: `HCF and LCM`
     stays as somebody typed it, which is the whole reason Title Case was rejected for this job —
     `Hcf And Lcm` is a spelling nobody has ever written.

   IT FOLDS WITHIN THE LIST ON SCREEN, not against the whole library, and that is deliberate rather
   than a shortcut: `facetTally_` is already walking exactly the items whose answers are about to be
   drawn, so the spelling shown is one that is actually in front of you. Narrowing cannot change
   which ITEMS an answer holds — the identity does that — only which of its spellings is on the
   button, and after the first-letter rule the variants differ by so little that it is not visible.

   `check-funnel.js` TEST 2 CANNOT FIRE AGAIN, and that is the point rather than a loss. It looks
   for two values in one facet that reduce to the same key; `spellKey_` is that same reduction, so
   the fault is now impossible instead of detected. A check that cannot fail is not a check — this
   one is kept because it also guards the facets a spreadsheet invents at runtime, where the wrapper
   below is the only thing standing between the sheet and the screen.
================================================================================================== */
```

### `SPELL_KEYS` AND `spellKey_` WERE HERE, and they are above `bucketTable_` now because that function keys its second index on them and is CALLED AT LOAD.

top level, before `spellGaps_`

```
/* `SPELL_KEYS` AND `spellKey_` WERE HERE, and they are above `bucketTable_` now because that
   function keys its second index on them and is CALLED AT LOAD. `js/check.js` refused the lazy
   version outright — eight findings, one per table — and it was right to: it cannot see that the
   reference sits behind a branch that only runs on the first lookup, and the thing it is guarding
   is a throw at load that takes every name below it in the file with it. A dependency that is real
   belongs above its dependent, which is the one rule `index.html`'s file list is built on. */
```

### `facetTally_` — ONE WALK OF THE LIST PER QUESTION, NOT THREE.

top level, before `FACET_TALLY`

```
/* ==================================================================================================
   `facetTally_` — ONE WALK OF THE LIST PER QUESTION, NOT THREE.

   THE FUNNEL ASKS THREE THINGS OF EVERY FACET and each used to walk the whole list on its own:
   `facetValues` (what are the answers), `facetCoverage` (how many can answer at all) and
   `facetSplit_` (how lopsided is it — which then called `facetValues` a fourth time). `nextFacet`
   runs all three per candidate, so drawing one screen walked 4,045 items twenty-one times over,
   three times each. MEASURED: 93 ms to draw the question, and the whole of it was this.

   ALL THREE COME OUT OF ONE TALLY, because they are three readings of the same count: the keys are
   the answers, the number of items that contributed at least one key is the coverage, and the share
   outside the biggest key is the split. Nothing is approximated — the three functions below return
   exactly what they returned before and every caller is untouched, including `check-funnel.js`.

   HELD BY THE ARRAY'S OWN IDENTITY. `stuffFiltered` hands the same array to everything that draws
   one screen, so a `WeakMap` on it is a cache with no key to get wrong and no lifetime to manage: a
   new list is a new array and the old tallies are collected with it. That is the same test
   `stuffFiltered` already makes against `DATA`, one level down.
================================================================================================== */
```

### ---------- THE BUCKET THIS QUESTION IS ALREADY INSIDE, IF ANY

top level, before `facetWithin_`

```
/* ---------- THE BUCKET THIS QUESTION IS ALREADY INSIDE, IF ANY ----------------------------------
   THE LAST ONE, because a bucket does not settle its facet and the question is asked again: press
   `D–F` and then `D–E` and there are two chips on this field, of which the narrowest is the one
   that was pressed last. */
```

### ---------- KEYED ON THE BUCKET TOO, OR THE SECOND ASK READS A TALLY FROM THE FIRST

in `facetTally_`

```
/* ---------- KEYED ON THE BUCKET TOO, OR THE SECOND ASK READS A TALLY FROM THE FIRST -----------
     A BUCKET CHIP RESTRICTS THE ANSWERS AS WELL AS THE ITEMS (see below), so this is no longer a
     function of the list and the facet alone. The items array is freshly built on every filter
     change, so the WeakMap key already differs in practice — this is the half that makes that an
     argument rather than a coincidence. */
```

### AND ON WHAT THE YEAR AND MONTH CHIPS HAVE SAID, which a Paper answer's LABEL now depends on (`sittingUnsaid_`).

in `facetTally_`

```
/* AND ON WHAT THE YEAR AND MONTH CHIPS HAVE SAID, which a Paper answer's LABEL now depends on
     (`sittingUnsaid_`). Same argument as the bucket: the list differs in practice, and this makes it
     one. Only a facet that labels its answers reads it, so every other key is unchanged. */
```

### KEYED ON THE FACET OBJECT AS WELL AS ITS NAME.

in `facetTally_`

```
/* KEYED ON THE FACET OBJECT AS WELL AS ITS NAME. `facetList()` rebuilds when the `facets` tab
     changes, and a relabelled facet with a new `of` under an old name would otherwise read a stale
     tally — the same identity test, one level further in. */
```

### COUNTED ONCE PER VALUE, NOT ONCE PER ITEM.

in `facetTally_`

```
/* COUNTED ONCE PER VALUE, NOT ONCE PER ITEM. A tutor answers `What for` with both Booking and
       People, so it is a tally mark against each — which is what makes the count behind an answer
       true: choosing People really would leave that tutor in it. `Set` because a row that somehow
       lists the same group twice must not count twice. */
```

### ONE VALUE IS THE OVERWHELMING CASE and a `Set` of one is an allocation to prove it.

in `facetTally_`

```
/* ONE VALUE IS THE OVERWHELMING CASE and a `Set` of one is an allocation to prove it. The `Set`
       is still what de-duplicates a row that lists the same group twice; it is just not built for
       the four thousand rows that have nothing to de-duplicate. */
```

### ---------- AND AN ANSWER THAT IS A DATE SORTS AS A DATE

in `facetTally_`

```
/* ---------- AND AN ANSWER THAT IS A DATE SORTS AS A DATE ---------------------------------------
     THE SITTINGS CAME OUT ALPHABETICALLY AND IT READ AS BROKEN. June 2017, June 2018, June 2019,
     June 2020, June 2023, June 2024, November 2017, November 2018, November 2019 — every June
     stacked before any November, 2024 sitting above 2017, and each academic year split in half
     down a list nobody could scan.

     `cmpText` IS RIGHT ABOUT EVERYTHING ELSE and the note above says why: there is no reason to
     prefer one of forty tutors, and alphabetical is the order somebody can predict. A date is the
     exception because it HAS an order, and it is not the one its letters give.

     THE TEST IS ON THE ANSWERS, NOT ON THE FACET. Nothing here knows that `examWave` is a sitting —
     it asks whether every answer in front of it parses as `<Month> <year>`, and sorts by the date
     if they all do. So a `facets` row inventing a question over any dated column gets the same
     treatment with nothing added, and a facet with one date and nine words falls straight through
     to the alphabet rather than sorting nine things by a rule that fits one.

     NEWEST FIRST, and that is the half that is a judgement rather than arithmetic. Chronological
     either way fixes the June/November split; which end leads is a choice, and the newest paper is
     the one closest to the specification somebody is actually sitting — which is why every
     past-paper site on earth lists them that way. One `-` on the line below flips it. */
```

### A SEASON IS A POSITION IN THE YEAR TOO.

in `dateKey_`

```
/* A SEASON IS A POSITION IN THE YEAR TOO. `seriesOf_` names most sittings "Summer 2017" and
       "Autumn 2017" rather than by a month, and a rule that only knows the twelve months would
       have read those as words, found `allDates` false, and put the whole list back in the
       alphabet — undoing this sort silently the moment the series were renamed. */
```

### `cmp` IS A FACET SAYING ITS OWN ORDER, for an answer that HAS one and is not a date the test above can read:

in `facetTally_`

```
/* `cmp` IS A FACET SAYING ITS OWN ORDER, for an answer that HAS one and is not a date the test
     above can read: a bare year (`2018`), and a season (`Summer` before `Autumn`). Both came out of
     splitting the sitting in two, and both would otherwise go to the alphabet, which puts 2017 on
     top and the autumn first. */
```

### ---------- THE VARIANTS ARE FOLDED HERE, BEFORE ANYTHING COUNTS THEM

in `facetTally_`

```
/* ---------- THE VARIANTS ARE FOLDED HERE, BEFORE ANYTHING COUNTS THEM ---------------------------
     BEFORE, NOT AFTER, because every number below is read off this list: the answers the funnel
     draws, the coverage, and the split that decides whether the question is asked at all. Two
     spellings of one answer counted apart make a question look more balanced than it is — which is
     the same arithmetic fault as `paper: true`, reached from the other direction. See the block
     above for which spelling wins. */
```

### ---------- AND A QUESTION ASKED INSIDE A BUCKET OFFERS ONLY WHAT IS IN IT

in `facetTally_`

```
/* ---------- AND A QUESTION ASKED INSIDE A BUCKET OFFERS ONLY WHAT IS IN IT --------------------
     FOUND BY WALKING THE FUNNEL RATHER THAN BY READING IT. Six chips deep, pressing `Topic · D–F`
     drew `D–E`, `F`, `I–M`, `N–P` and `S–T` — three answers plainly outside the chip sitting
     above them.

     NOTHING WAS BROKEN AND THAT IS WHY IT NEEDED MEASURING. `topic` is multi-valued, the chip means
     "has a topic in D–F", and a question tagged `Decimals, Ratio` is legitimately kept by it and
     legitimately still carries `Ratio`. Pressing `S–T` would have narrowed to questions that are
     about both — correct, and unreadable: the funnel appears to step back out of the bucket it
     just went into, on the one screen whose whole job is to say where you are.

     SO THE ITEMS KEEP EVERY TOPIC THEY HAVE AND THE QUESTION OFFERS ONLY THE ONES INSIDE. `filterHit`
     is untouched, so nothing is lost from the list; what changes is which answers this question
     draws next, which is what the chip above it says. A single-valued facet is unaffected by
     construction — pressing `Grades 4–6` leaves items whose only Grade is in it — which is why
     the band this generalises never had to think about it.

     THROUGH `bucketHas_`, the one function that decides what is inside a bucket, so the restriction
     and the filter cannot disagree. */
```

### ---------- AN IDENTITY IS NOT A SPELLING, AND ONE FACET HAD BEEN USING A NAME AS BOTH

in `facetTally_`

```
/* ---------- AN IDENTITY IS NOT A SPELLING, AND ONE FACET HAD BEEN USING A NAME AS BOTH --------
     `showOf` TURNS A VALUE INTO WHAT IS DRAWN and changes nothing about what is matched. It exists
     for `paperId`, whose own note already said the rule -- "the id decides WHO answers and the name
     is what is shown" -- while its `of` returned the NAME. Measured: six names are carried by more
     than one paper, twenty papers in all, and the spelling fold above merged each set into ONE
     button. `Paper 1 (Non-Calculator) — May 2017` (Edexcel Higher) and `Paper 1 (Non-calculator) —
     May 2017` (Foundation) differ by one letter's case, which is exactly what `spellKey_` is built
     to ignore -- so the funnel offered one answer holding two different papers, and the six AQA
     science `Paper 1 — June 2024` rows put three subjects and two tiers on a single button.

     `check-funnel.js` COULD NOT SEE IT and its own note says why: test 2 looks for two values that
     normalise to one key, and after the fold there is only one value left to look at. The fold is
     right; feeding it an identity was not. */
```

### ---------- AND NO QUESTION EVER DRAWS MORE THAN SEVEN ANSWERS

in `facetTally_`

```
/* ---------- AND NO QUESTION EVER DRAWS MORE THAN SEVEN ANSWERS --------------------------------
     See `bucketValues_`. This replaced `bandNumbers_`, which did the same thing for a run of
     integers and nothing else; the position in this function is unchanged and the reasons for it
     are the ones already written above — after the labels, because a bucket REPLACES the answers
     rather than relabelling them, and before the counts, because the split and the coverage that
     decide whether the question is asked at all are read off this list. */
```

### ---------- HOW MUCH OF THE LIST THE COMMONEST ANSWER DOES *NOT* KEEP

in `out`

```
/* ---------- HOW MUCH OF THE LIST THE COMMONEST ANSWER DOES *NOT* KEEP ------------------------
       THIS WAS `(total - top) / total` — the share of the TALLY outside the biggest answer — and
       that denominator is wrong the moment a facet can return more than one value.

       MEASURED, ON A REAL STATE OF THE REAL FUNNEL. Learning · Questions · Maths · GCSE · Worksheet
       leaves 1,331 items, and `Key stage` there scored 35.4% — five times the floor, comfortably
       "worth asking". Then picking its commonest answer left 1,314 of the 1,331. A tap that removes
       seventeen things out of thirteen hundred, offered as the next question, looking healthy to
       the one rule written to stop exactly that.

       THE CAUSE IS THE TALLY COUNTING AN ITEM ONCE PER ANSWER, which is right and is what makes the
       counts beside the answers true — a worksheet tagged `KS3, KS4` really is in both. But it
       means `total` is bigger than the list, so a facet where nearly everything answers the
       commonest AND something else scores well on a share of a number that is not the list.

       SO THE QUESTION IS ASKED OF THE LIST, WHICH IS WHAT IT WAS ALWAYS ABOUT: press the biggest
       answer — what is left? For a single-valued facet with full coverage this is arithmetically
       the same number as before, which is why nothing that was working changes. It differs exactly
       where the old one was lying.

       THIS IS THE THIRD TIME THIS SHAPE HAS BEEN WRITTEN DOWN — `cost: 0`, then `paper: true`, and
       both were fixed in the data while the rule stayed as it was. The rule is the fix. */
```

### ---------- A QUESTION WITH FORTY ANSWERS IS NOT A QUESTION, IT IS THE LIST

top level, before `FACET_MAX_ANSWERS`

```
/* ---------- A QUESTION WITH FORTY ANSWERS IS NOT A QUESTION, IT IS THE LIST -----------------------
   THERE HAS NEVER BEEN AN UPPER BOUND on how many answers a facet may offer, and until now there
   did not need to be: every facet was written in code by somebody looking at the data. The sheet
   can invent one now — see `facetFromSheet_` — and `field: name` reads the name off every item,
   which is 3,265 distinct answers presented as a multiple-choice question.

   THE RULE IS THE SAME FOR THE CODE'S OWN FACETS, deliberately. A question that has grown past
   forty answers has stopped narrowing anything, whoever wrote it; `Subject` is about twenty and
   `Division` seventeen, so nothing real is near this. A list of forty is what the search box is for.

   NOT CONFIGURABLE. A second number in the sheet is a second thing to get wrong, and the honest
   answer to "my question is not showing" is `whyThisQuestion()`, which names this by name. */
```

### ---------- HOW MANY ANSWERS ARE DRAWN, WHICH IS NOT HOW MANY MAKE A QUESTION ASKABLE

top level, before `FACET_MAX_SHOWN`

```
/* ---------- HOW MANY ANSWERS ARE DRAWN, WHICH IS NOT HOW MANY MAKE A QUESTION ASKABLE ------------
   REPORTED AS "when there are more than 7ish it gets clipped by the widget container". Measured
   against the real library: `Sitting` offers 16 answers, `Year` 9 and `Grade` 8 at the top, and
   `Topic` (343) and `Paper` (242) both fall under FACET_MAX_ANSWERS as the list narrows and are
   then drawn whole. Every one of those runs past the bottom of the card.

   TWO DIFFERENT NUMBERS FOR TWO DIFFERENT JOBS, and conflating them is what made this a bug.
   FACET_MAX_ANSWERS asks "is this a question at all" -- 212 paper names is not multiple choice --
   and it belongs where it is. This asks "how many fit on the card", which is a fact about the
   card, and it is the same trim `overFacet_` was already doing for the oversized ones. Applying it
   to every facet is the `cost: 0` lesson one more time: a rule written for the case that annoyed
   somebody comes back wearing the next facet's name.

   NOTHING IS TRIMMED ANY MORE AND THIS IS NOW A CAP ON WHEN TO GROUP. The line under the rows
   naming how many were left and pointing at the search box is what the owner reported — see the
   block above `bucketValues_` — so the rows are not cut to this number, they are REPLACED by at
   most this many buckets. The constant does the same job for the same reason and nothing is held
   back behind it.

   AND THE TWO NUMBERS HAVE NOT BEEN CONFLATED, which the paragraph above is right to insist on.
   `FACET_MAX_ANSWERS` is still the "is this a question at all" test in `nextFacet` — the one thing
   that stops 212 paper names being offered as multiple choice on the rare list the grouping cannot
   split — and it is still 40 because it is about a list nobody can read rather than about a card.
   This one is about the card. */
```

### ---------- AND A QUESTION EVERYBODY ANSWERS THE SAME WAY IS NOT A QUESTION EITHER

top level, before `FACET_MIN_MINORITY`

```
/* ---------- AND A QUESTION EVERYBODY ANSWERS THE SAME WAY IS NOT A QUESTION EITHER ----------------
   THE COUNT RULE ABOVE CATCHES A QUESTION WITH TOO MANY ANSWERS. Nothing caught the opposite: a
   question with two answers where one of them holds the entire list. `nextFacet` asked whether two
   different answers EXIST and whether half the items can answer — never whether answering it
   actually splits anything.

   THIS HAS NOW HAPPENED TWICE, WITH THE SAME SHAPE BOTH TIMES.

     `cost: 0`      3,262 of 3,265 items answered `Free`, so the Free bucket meant "everything".
                    CLAUDE.md records it. Fixed in the DATA, via `priced_`.
     `paper`        3,753 of 3,770 items answered `Printed`, because `questionItems` wrote
                    `paper: true` on every one of them. Fixed by deleting the facet.

   BOTH FIXES WERE TO THE INSTANCE AND NEITHER WAS TO THE RULE, which is why the second one was
   able to sit in the funnel being asked of everybody, on every search, narrowing nothing, while
   twenty-two checks stayed green. A rule that is only ever applied by hand is not a rule.

   MEASURED AGAINST THE REAL LIBRARY, so the number is not a guess. The share of the biggest answer
   among the items that can answer at all:

     paper      99.5%   <- a literal, not a fact about anything
     level      93.9%   GCSE dwarfs A-Level, and the question is still worth asking
     subject    91.3%   Maths dwarfs the rest, and the question is still worth asking

   SO THE CAP IS NOT ABOUT THE BIGGEST ANSWER, IT IS ABOUT THE REST. `Subject` earns its place
   because the 8.7% who want Physics get a real narrowing from it; `Printed?` does not, because
   everything outside its biggest answer is 0.45% of the list and those 17 are widgets. The test is
   therefore on the MINORITY: unless at least one in fifty of the items that can answer land
   somewhere other than the biggest bucket, the question cannot narrow and is skipped.

   A SHARE, NOT A COUNT, BECAUSE THE LIST SHRINKS. Once the funnel has narrowed to twenty items a
   two-way split of nineteen-to-one is still a real distinction between real things; the same split
   across four thousand is a rounding error with a button on it.

   SELF-CORRECTING, LIKE THE COVERAGE RULE ABOVE IT. A question that cannot narrow the whole library
   starts being offered the moment the list is small enough for its answers to matter — so this
   never permanently hides anything, it only declines to ask it too early. */
```

### Does answering this actually split the list?

top level, before `facetSplit_`

```
/* Does answering this actually split the list? The share of answerable items that do NOT give the
   commonest answer. Counted over values, not items, so a thing answering `Booking` and `People`
   is a mark against each — the same tally `facetValues` builds the counts beside the buttons from,
   so the number a person sees and the number this decides on are the same number. */
```

### THE NEXT QUESTION WORTH ASKING, or nothing.

top level, before `fiveADayOf_`

```
/**
 * THE NEXT QUESTION WORTH ASKING, or nothing.
 *
 * Three reasons to skip one, and the third is the one that matters:
 *
 * ALREADY ANSWERED. Obvious.
 *
 * EVERYTHING AGREES. A list with one entry is a tap that changes nothing, and three of those in a
 * row is what makes a filter feel like paperwork.
 *
 * MOST OF THEM CANNOT ANSWER IT. This is not about usefulness — it is about damage. Choosing a
 * value excludes every item with NO value for that field, and it does so silently: they do not
 * fail to match, they were never asked. On this library `exam_board` is filled on 26% of rows and
 * on 3% of past papers, so offering it and having somebody tap "Edexcel" takes them from four
 * hundred resources to a hundred and seven, with three hundred and eight vanishing for a reason no
 * screen mentions. That is not a filter, it is a trapdoor.
 *
 * Half is the line. Below it, a question is doing more harm by being asked than good by being
 * answered — and the rule is SELF-CORRECTING, which is what makes it better than reordering: once
 * you have narrowed to the rows that do carry a board, its coverage rises and it starts being
 * offered. The sparse questions arrive exactly when they stop being sparse.
 */
```

### A QUESTION WHOSE ANSWERS ARE ONLY UNIQUE INSIDE ANOTHER QUESTION'S ANSWER.

top level, before `fiveADayOf_`

```
/**
 * A QUESTION WHOSE ANSWERS ARE ONLY UNIQUE INSIDE ANOTHER QUESTION'S ANSWER.
 *
 * REPORTED AS "it seems there are two question 1s for summer? maybe it hasn't distinguished the 3
 * papers?" — and the library had distinguished them perfectly. Measured at that exact state
 * (Learning · Questions · Maths · KS4 · Higher · Summer 2017, 88 questions), `Question number = 1`
 * matches **seven rows across three different papers**: Paper 1's Q1a–d, Paper 2's Q1, and Paper
 * 3's Q1a–b. Nothing is duplicated. "Question 1" is simply not a thing until you have said which
 * paper, and the funnel was offering it as though it were.
 *
 * THIS IS NOT AN ORDERING PREFERENCE, WHICH IS WHY IT IS IN CODE. The `facets` sheet owns `at` and
 * should: which question somebody wants asked first is a judgement. **Whether an answer means one
 * thing is not** — it is the same distinction `always` draws for doors, one level down. A sheet
 * can put `question` at order 1 and the funnel will still not ask it until `paperId` is answered,
 * because before that the answer `1` names seven questions and the person pressing it cannot know.
 *
 * AND THE FACET IS THE SHEET'S, NOT THE CODE'S — measured, `facetList()` has no `qNumber`, so the
 * chip in the screenshot is `facetFromSheet_` reading the `question` column. Both spellings are
 * named here because the sheet may use either, and a rule that only covers the code's own facets
 * would not have covered the one that actually caused this.
 *
 * `part` NEEDS BOTH. Part `a` means nothing without a question number, which means nothing without
 * a paper — so it names the rung below it and the chain resolves itself.
 */
```

### ---------- A 5-A-DAY'S DATE, READ OFF ITS PAPER ID

top level, before `fiveADayOf_`

```
/* ---------- A 5-A-DAY'S DATE, READ OFF ITS PAPER ID ----------------------------------------------
   `P-CBM-5AD-F-0601` is the Foundation book's 1 June — the id scheme `tools/cbm5ad/common.py`
   writes, month then day. Read off the id rather than out of the name, because the name is prose
   and the id is a key somebody chose to be read. Null for anything else. */
```

### ---------- THE QUESTION'S OWN DOORS WAIT FOR A PAPER

top level, before `PAPER_FIRST`

```
/* ---------- THE QUESTION'S OWN DOORS WAIT FOR A PAPER ------------------------------------------------
   A question number means nothing outside its paper, so Question, Part, Sub-part, Page, Pages, Marks
   and What you need are offered only once a paper is chosen -- by `Paper`, or by a 5-a-day's `Day`,
   which is its paper under another name. A LIST MEANS ANY ONE OF THEM: the 5-a-day route never asks
   `paperId` (its `Day` already opened that folder, `folderOpened_`), and a single rung would leave its
   papers without the doors. All seven are `tagOnly`, so this only decides when `tagDoors_` offers them. */
```

### ---------- THE BIBLE'S RUNGS, EACH BEHIND THE ONE ABOVE IT

in `FACET_NEEDS_FIRST`

```
/* ---------- THE BIBLE'S RUNGS, EACH BEHIND THE ONE ABOVE IT ---------------------------------------
     THE CHAIN IS WHAT HOLDS THE OWNER'S ORDER, not the sheet's `sort_order`: translation, testament,
     group, book, chapter, verse. A skip counts as asked, so "Doesn't matter" on one releases the next.
     AND IT IS NOT DECORATION. `grid` exempts Chapter and Verse from the answer cap and nothing exempts
     Book, so with Testament and Group skipped the funnel would ask Chapter — 1 to 150, over every book
     at once — before Book, whose 66 answers are over the cap. Held here, Book is asked first (drawn
     whole by `overFacet_`), and Chapter after it. */
```

### ---------- A PAPER IS THE LAST FOLDER, AND WHAT IS INSIDE IT IS THE LIST

top level, before `FACET_ENDS`

```
/* ---------- A PAPER IS THE LAST FOLDER, AND WHAT IS INSIDE IT IS THE LIST ------------------------------
   THE OWNER'S WORDS: *"no more asking for questions 1-10 or question part 1 or b."* Retiring those two
   questions was most of it, and measuring what was left found the rest. Over all 496 papers, reached
   the way a thumb reaches them (Year, then Month, then Paper), 495 asked nothing more — and one, AQA
   Physics Paper 2 Higher, June 2023, asked `What you need: Printed sheet 25 | Protractor 1`: a
   question splitting one paper's 26 questions by what to bring, which is the same tap inside a paper
   in a different coat.

   SO A LEAF ANSWER HERE ENDS THE FUNNEL, by rule rather than by whichever facets happen to be thin
   inside a paper today. A paper is at most 63 questions (median 7), they are already in the paper's
   own order (`stuffSorted_`), and they are what the person came for. A 5-a-day's `Day` is its paper
   under another name (see `folderOpened_`), so it ends the funnel the same way. A BUCKET does not —
   `O–P` is seven papers, and the question is asked again inside it — and neither does `Doesn't
   matter`, which is a skip rather than a paper. `whyThisQuestion` reads the same function. */
```

### ---------- A FOLDER WITH ONE ANSWER THAT A CHIP ALREADY OPENED IS NOT ASKED AGAIN

top level, before `folderOpened_`

```
/* ---------- A FOLDER WITH ONE ANSWER THAT A CHIP ALREADY OPENED IS NOT ASKED AGAIN ----------------
   A 5-a-day `Day` is its paper's id -- the same folder under another name -- so asking `Paper` over
   it with one answer would be the same tap twice. Asked of the value rather than of the two field
   names, so the next facet that is an identity in disguise is caught by the same line. One function
   because `whyThisQuestion` has to give the same answer `nextFacet` acts on. */
```

### ---------- A BUCKET IS HALF AN ANSWER, SO THE QUESTION IS ASKED AGAIN

in `nextFacet`

```
/* ---------- A BUCKET IS HALF AN ANSWER, SO THE QUESTION IS ASKED AGAIN -----------------------
     `11–20` narrows to ten questions and does not say which, and `Grades 4–6` narrows to three
     grades. Treating either as answered would make the bucket a dead end — the list is small enough
     to name the thing and the funnel would refuse to, which is the "Nothing left to narrow"
     complaint `overFacet_` was written for. So a facet is "asked" only once a LEAF has answered it;
     a bucket leaves it open and the next draw offers what is inside.

     ON THE FLAG THE CHIP CARRIES, NOT ON THE SHAPE OF ITS TEXT. This was `/^\d+–\d+$/` against the
     value, which was right while a band was the only kind of bucket there was and silently wrong
     the moment a declared one arrived: `Grades 4–6` and `Heavyweight` match no such regex, so both
     would have settled their facet and the answers inside them would have been unreachable.
     Sniffing the text to tell two kinds of answer apart is the trap `bucketHas_` records one rule
     up, and it would have shipped in the same commit that created the second kind. */
```

### ---------- A CLOSED KIND'S QUESTIONS, AND ONLY TO ITS OWN LIST

in `nextFacet`

```
/* ---------- A CLOSED KIND'S QUESTIONS, AND ONLY TO ITS OWN LIST -------------------------------
       See `facetFenced_`. Before the tally, so a question that cannot apply costs nothing — the
       Bible's six on every other list, and every other question on the Bible's. */
```

### ---------- NOT UNTIL THE QUESTION IT HANGS OFF HAS BEEN ANSWERED

in `nextFacet`

```
/* ---------- NOT UNTIL THE QUESTION IT HANGS OFF HAS BEEN ANSWERED ---------------------------
       See `FACET_NEEDS_FIRST`. Skipped rather than reordered: reordering would ask it later and
       still ask it of a list holding three papers, which is the same wrong answer further down. */
```

### AND IT HAS TO SPLIT SOMETHING.

in `nextFacet`

```
/* AND IT HAS TO SPLIT SOMETHING. See `FACET_MIN_MINORITY` — two answers where one of them is
       the whole list is a tap that changes nothing, which is the same complaint the "everything
       agrees" rule above makes about one answer, one step less obvious. */
```

### AND WHEN NOTHING QUALIFIES, THE CLOSEST THING TO A QUESTION RATHER THAN A DEAD END.

top level, before `overFacet_`

```
/* ==================================================================================================
   AND WHEN NOTHING QUALIFIES, THE CLOSEST THING TO A QUESTION RATHER THAN A DEAD END.

   MEASURED, AND IT IS THE STATE THE WHOLE OF THIS STARTED FROM. Learning · Questions · Maths ·
   Worksheet · KS2, with School year skipped: 1,070 questions left, `Topic` holding 48 answers, and
   the screen saying "Nothing left to narrow." Every other facet is exhausted and the one that is
   not is barred by `FACET_MAX_ANSWERS` — a question about the only thing left, refused for being
   eight answers too long.

   THE CAP IS RIGHT AND IT IS ABOUT READING, NOT ABOUT NARROWING. `field: name` is 212 paper names
   and nobody can choose from 212 buttons; that is why the cap exists and it has not changed. What
   was wrong was treating "too long to read all at once" as "not a question", when the two are
   different problems with different answers — the first is solved by showing fewer, and the funnel
   was solving it by showing none.

   THIS USED TO HAVE A DOOR AND IT WAS THE WRONG SHAPE. A line above the funnel offered "or the 48
   topics these are in", which is the same information as a sentence you had to decode, sitting
   above the question rather than being one. It is gone — see the note where `collectionAxes_` was —
   and this is what replaces it: the funnel simply asks, and draws as many answers as anybody can
   read.

   FEWEST ANSWERS WINS, because it is the one closest to being an ordinary question. Everything else
   a facet has to pass is unchanged: not asked, enough coverage, and it must still narrow.
================================================================================================== */
```

### THE FENCE HERE TOO. This runs when `nextFacet` found nothing, and a Bible list nextFacet has finished with would otherwise tally every one of the other

in `overFacet_`

```
/* THE FENCE HERE TOO. This runs when `nextFacet` found nothing, and a Bible list nextFacet has
       finished with would otherwise tally every one of the other twenty-five questions to find that
       none applies — measured at 330–410 ms on 31,102 verses. With Testament and Group both skipped
       this is what asks Book, its 66 answers drawn whole. */
```

### `whyThisQuestion()` — THE FUNNEL, SHOWING ITS WORKING.

top level, before `whyThisQuestion`

```
/* ==================================================================================================
   `whyThisQuestion()` — THE FUNNEL, SHOWING ITS WORKING.

   WHY THIS EXISTS. The funnel picks the next question with `nextFacet` above, and the rule is not
   a rule about MEANING — it is arithmetic over whatever happens to be in the list right now:

     ask it only if two or more different answers exist, and
     ask it only if at least half the current results can answer it at all.

   THAT IS A GOOD RULE AND IT FEELS RANDOM FROM OUTSIDE, because the same data reached two ways asks
   two different questions. Narrow to Maths and `Exam board` appears; narrow to Maths and Boxing
   together and it does not, because half the list has no board. Nothing on screen says so, so it
   reads as the app changing its mind.

   EVERY LAYOUT FAULT IN THIS APP WAS FIXED BY ASKING THE BROWSER RATHER THAN READING THE CODE —
   `layout()` exists for exactly that, and CLAUDE.md says so at length. This is the same instrument
   pointed at the funnel: it prints, for the list you are looking at, every question in order and
   the number that decided it. No guessing about why `Tier` did not come up.

     whyThisQuestion()          the list you are actually looking at
     whyThisQuestion(true)      the whole pile, ignoring what you have already answered

   READ THE `why` COLUMN. `asked` means you already answered it. `1 answer` means everything left
   agrees, so the question has nothing to decide. `thin` means it is below its coverage bar — the
   number beside it is how many of the current results could answer, and the bar it missed.
================================================================================================== */
```

### BUILT AS STRINGS, NOT WITH `%s`.

in `whyThisQuestion`

```
/* BUILT AS STRINGS, NOT WITH `%s`. `console.log`'s format substitution is the browser's, and
     anything else reading this output — a test harness capturing console, a copy-paste into a
     message — gets the literal `%-14s` instead. This is meant to be pasted. */
```

### THE RESOURCES, flattened out of where the payload actually puts them.

top level, before `TOPICS_MEMO`

```
/* THE RESOURCES, flattened out of where the payload actually puts them.

   `DATA.resources` does not exist — I had been reading a key nothing sends, which is why the
   section was empty. They live nested in `dropdowns.checklists`, keyed by subject and then by
   band, because that is the shape the checklist needs them in.

   Flattened here rather than changed at the source: the checklist wants them nested and this wants
   them flat, and a payload that carries the same four hundred rows twice to satisfy both would be
   a waste of every phone's morning. */
```

### WALKED ONCE PER PAYLOAD, not once per caller.

top level, before `TOPICS_MEMO`

```
/* WALKED ONCE PER PAYLOAD, not once per caller.
   Four hundred resources live three levels deep in `dropdowns.checklists`, and eight different
   things ask for them flat — the shop list, the wardrobe, the checklist, `topicBy` twice in one
   lookup. Each call rebuilt all four hundred objects. Cached against the payload itself, so it is
   rebuilt exactly when the data changes and never otherwise. */
```

### ---------- QUESTIONS AS SEARCHABLE PARTS

top level, before `QUESTION_CLASSES`

```
/* ---------- QUESTIONS AS SEARCHABLE PARTS --------------------------------------------------------
   ONE ITEM PER PART, never per stem. A stem is the context a part needs, not a thing anybody looks
   for — searching "1825 employees" should land on question 5's parts, not on a stem card that asks
   nothing.

   THE PAPER'S FIELDS ARE COPIED ONTO EVERY PART, so a question answers the same facets its paper
   does. Filtering to A-Level, Edexcel, 2022 narrows questions exactly as it narrows papers, and
   nothing downstream has to know which it is holding — which is the same reason `allTopics` copies
   them onto a resource.

   THE STEM IS FOUND ONCE PER PART and carried along. Looking it up when the card is drawn would be
   a scan of every question row per card, which on a list of ninety is ninety scans. */
```

### ---------- THE CLASSES THAT LIVE IN THE SHEET

top level, before `QUESTION_CLASSES`

```
/* ---------- THE CLASSES THAT LIVE IN THE SHEET ---------------------------------------------------
   `check-css` REPORTS A RULE IT CANNOT FIND A USE FOR, and question HTML is stored in the sheet
   where it cannot look. `ol.roman` and the SVG label classes appear only there, so the check saw
   rules styling nothing and said so — correctly, given what it can see.
   Naming them here is not a trick to quiet it: it is the only place in the source that records
   which classes a question's HTML is allowed to use, which is what makes them safe to style and
   unsafe to rename. Any question using a class not on this list will be unstyled.

   used by stored question HTML: roman  lbl  num  ax  axis  grid  pt  stat  marks  parts */
```

### ---------- ONE BOUT

top level, before `fightCard_`

```
/* ---------- ONE BOUT ------------------------------------------------------------------------------
   THE RESULT SENTENCE IS NOT USED, and that is deliberate. `result` reads "Jack Johnson def. James
   J. Jeffries" — the two names again, which the card has already printed larger, plus a word. The
   facts worth the space are the ones the names do not carry: how it ended, in which round, and
   whether anybody has checked.

   THE WINNER IS MARKED RATHER THAN STATED. A name in bold and the other not is read instantly and
   costs no line; "Winner: Jack Johnson" is a whole row saying what a weight already said. A draw
   or a no-contest marks neither, which is exactly right — nothing to emphasise, and the method
   underneath says what happened.

   `verified` IS SHOWN WHEN IT IS FALSE, not when it is true. Almost every row will be checked
   eventually, so a tick on all of them is decoration; a mark on the few that are not is a to-do
   list somebody can actually work through. */
```

### ---------- WHO WON, BY ID WHERE THERE IS ONE

in `fightCard_`

```
/* ---------- WHO WON, BY ID WHERE THERE IS ONE ---------------------------------------------------
     THIS COMPARED `f.winner` AGAINST `f.a` BY NAME ALONE, and the sheet sends `winner_id`,
     `boxer_a_id` and `boxer_b_id` beside them — three columns shipped to every phone and read by
     nothing. CLAUDE.md's rule is the one this repository has already paid for twice: an id beats a
     name, because a name is a cell somebody can edit. `changePin` checking a PIN against the wrong
     person is the sharp version; this is the quiet one — `winner` typed as "Ali" against
     `boxer_a` "Muhammad Ali" highlights neither corner and looks exactly like a draw.

     THE NAME IS STILL THE FALLBACK, and that is not a hedge: it is what reads a row typed into the
     sheet before anybody has assigned ids, which is how this tab is filled in. Same order
     `findPerson` uses on the backend, for the same reason. */
```

### ---------- THE SAME HEAD, LINE AND META AS EVERY OTHER KIND

in `fightCard_`

```
/* ---------- THE SAME HEAD, LINE AND META AS EVERY OTHER KIND ------------------------------------
     THIS WAS A CARD OF ITS OWN SHAPES: the two names in a bare `<p>` at body size where every other
     card has a title, the date jammed against them with the sub-line's negative margin and nothing to
     pull it up under, the method in upper case where every other meta line is in sentence case, and
     the title and the venue as two `.note` paragraphs a browser's whole default margin apart. Read
     beside a practical it looked like a different app.

     SO IT IS THE SHARED HEAD (`.fc-head`: the names are the title, `Fight` is the flag), the shared
     meta line for how it ended, the story as the card's lede, and the title, the venue and the gate
     as ONE quiet line — three facts about where, read together. Nothing was dropped. */
```

### ---------- THE TWO FACES, SQUARED UP

in `fightCard_`

```
/* ---------- THE TWO FACES, SQUARED UP -----------------------------------------------------------
     ASKED FOR WITH THE BOXER'S PHOTO ("maybe add image of each boxer"), and a bout is two boxers, so
     it gets both — small, side by side, the winner's frame in gold. Each is `boxerPic_`'s corner:
     the photo where the boxer's row has one WITH its credit, and the ring placeholder otherwise —
     his eight-bit likeness in the trunks he wore THAT NIGHT where a source names them, and the
     corner's colour, muted, where none does; the blue corner faces left. An opponent with no row at
     all (53 corners) is a silhouette with his initials — no skin and no hair colour claimed — still
     in that night's trunks when they are known, which is what he is: somebody this library has no
     picture of.

     LIFTED OVER THE TITLE BY `order`, like the boxer's photo, and hidden from a screen reader: the
     names are the title already, and two pictures announced as the same two names is the title
     read twice.

     ONE CREDIT LINE FOR BOTH, each part carrying the address it credits, so a face that fails to
     load takes its own credit with it and leaves the other's — see `boxerPicFail_`. */
```

### A CORNER WITH NO ROW IS A WOMAN WHEN THE OTHER CORNER IS ONE.

in `fightCard_`

```
/* A CORNER WITH NO ROW IS A WOMAN WHEN THE OTHER CORNER IS ONE. Five of the women's opponents have
     no row (Gogarty, Frazier-Lyde, Persoon, McCaskill, Marshall), and drawn without a `sex` they were
     the men's figure, bare-chested, beside a woman in her top. A bout is between two women or two
     men, so the other corner's row says it; nothing else about her is claimed. */
```

### THE DATE AS THE FIGHTER'S PAGE WRITES IT.

in `fightCard_`

```
/* THE DATE AS THE FIGHTER'S PAGE WRITES IT. This printed the cell — `1971-03-08` — one flick
          away from his page printing the same bout as `8 Mar 1971`: one fight, two dates, and the
          ISO one is a database's, not a poster's. `boxerDate_` leaves a cell that is not a date as
          typed, so "c. 1900" still reads. */
```

### ---------- ONE DIVISION, HOWEVER IT WAS TYPED

top level, before `divisionOf_`

```
/* ---------- ONE DIVISION, HOWEVER IT WAS TYPED ----------------------------------------------------
   THE FUNNEL LISTED "Light heavyweight" (6) AND "Light Heavyweight" (5) as two different divisions,
   and did the same to Super bantamweight, Super middleweight, Light welterweight and Light
   middleweight. They are one division each, typed by hand on different days.

   A FILTER GROUPS BY THE EXACT STRING, so two spellings are two buttons — and worse than untidy,
   each one hides half the fighters from somebody who picked the other. Folded to one shape here:
   first letter up, the rest down, so whatever is in the cell arrives as one answer. */
```

### ---------- EVERY DECADE A CAREER TOUCHED

top level, before `DECADE_MAX`

```
/* ---------- EVERY DECADE A CAREER TOUCHED ---------------------------------------------------------
   A BOUT HAS A DATE AND A FIGHTER HAS A SPAN, and the two want the same answer in the end: which
   ten-year block. So one reader, off the row, rather than a field written by each mapper — the
   boxer mapper already wrote `year: b.activeTo`, which is his LAST year and nothing else, and a
   facet built on it would file Ali under the 1980s alone.

   READ OFF THE ROW, NOT OFF THE ITEM, so a column added to the boxers tab is filterable without a
   mapper edit — the same reason `facetFromSheet_` falls back to `x.row`. `activeFrom` / `activeTo`
   for a fighter, `date` for a bout.

   A FIGHTER STILL FIGHTING has no `activeTo`. That is not a career of length nought: it is a career
   with no end yet, and the honest ceiling is the newest decade anything in the library reaches —
   but nothing here knows the library, so it stops at the decade the sheet's own `record_as_of`
   names, and failing that at `activeFrom`'s own decade. A single decade for somebody mid-career is
   incomplete; inventing "to the present day" from a clock this function cannot see would be wrong
   in a way nobody could spot, which is the rule this file keeps under `figure` and under
   `exam_date`.

   A SPAN THAT RUNS BACKWARDS, or one longer than a human career, gives just its own two ends
   rather than a hundred buttons. A typo in a cell must not be able to fill the funnel. */
```

### ---------- A PRACTICAL

top level, before `PRAC_TYPE`

```
/* ---------- A PRACTICAL --------------------------------------------------------------------------
   WHAT A PERSON NEEDS BEFORE THEY RUN ONE, in the order they need it. The aim says what it is for,
   the strip says whether it can happen at all — how long, how many, where, and whether this room
   can host it — and only then the kit and the steps.

   THE SAFETY LINE IS NOT A TILE AND NOT A `note`. The house rule says a tile has room for about
   three words; "Heater and block stay hot after switch-off. Do not touch. Mop spills at once —
   mains electricity near water." is not three words, and a warning trimmed to fit is a warning
   that stops being one. One paragraph under the row, which is what `jobAdminTiles_` already does.

   THE STEPS ARE AN `<ol>` AND THE KIT IS A `<ul>`, because the first is an order and the second is
   a set. That is the whole reason the export's `step_1 … step_10` columns had to become a list
   that keeps its order rather than a bag. */
```

### ---------- THE TWO SHAPES A PRACTICAL COMES IN

top level, before `PRAC_TYPE`

```
/* ---------- THE TWO SHAPES A PRACTICAL COMES IN --------------------------------------------------
   A CLOSED LIST RATHER THAN A BOOLEAN, because a third is plainly possible — a DEMONSTRATION you
   watch rather than measure or make is a real category and five of these rows are arguably it. A
   boolean would have to be replaced to admit one; a word beside two other words does not. That is
   the `hazard` / `wow` / `compliance` argument three columns along, and the vocabulary is refused
   or accepted in `check-practicals.js` by somebody who has just read what is already in use.

   THE FILE HOLDS THE WORD AND THIS HOLDS THE LABEL, so the sentence a card prints can change
   without rewriting 82 rows — the `blockPhrase_` / `head` split the booking week already makes. */
```

### THE STRIP SAID "lab · needs a lab" AND A SCREENSHOT IS WHAT CAUGHT IT.

in `practicalCard_`

```
/* THE STRIP SAID "lab · needs a lab" AND A SCREENSHOT IS WHAT CAUGHT IT. `venue` and `feasible`
     are two columns that overlap on 14 of the 41 rows: every lab practical is `lab` + `needs a
     lab`, which is one fact printed twice. Measured across all five combinations that exist, the
     only thing `feasible` adds that the venue does not already say is the kit — `yes` adds
     nothing at all, and `needs a lab` is what `lab` means. So the venue is shown and `feasible`
     contributes one phrase, when it has one. */
```

### ---------- AGE, HAZARD AND COST JOIN THE STRIP, AND ONLY WHERE THEY WERE ANSWERED

in `practicalCard_`

```
/* ---------- AGE, HAZARD AND COST JOIN THE STRIP, AND ONLY WHERE THEY WERE ANSWERED -------------
     THE 41 LAB PRACTICALS CARRY NONE OF THE THREE and that is not a gap: a school owns the kit and
     a lab has a technician in it. `libNum` answers `null` rather than 0 for an uncosted row — see
     the note over it — so `costPerRun == null` and `costPerRun === 0` are different sentences here,
     which is the `cost: 0` fault this file records four times and the one place it would land
     again. "free to run" is a claim; saying nothing is the honest alternative to it. */
```

### ---------- A REFUSED EXPERIMENT SAYS SO BEFORE IT SAYS ANYTHING ELSE

in `practicalCard_`

```
/* ---------- A REFUSED EXPERIMENT SAYS SO BEFORE IT SAYS ANYTHING ELSE --------------------------
     FIVE OF THESE WERE CONSIDERED AND TURNED DOWN, and they are rows rather than a deletion so that
     the reasoning is findable — a tutor asking why they are not burning magnesium ribbon gets the
     answer instead of an absence. That only works if the card cannot be mistaken for something to
     run, so the flag, the reason and the ink all change, and the kit and the method are not drawn
     at all: an excluded row carries no steps, by rule, and `check-practicals.js` refuses one that
     does.

     `RECONSIDER AT` IS PART OF THE REFUSAL rather than a separate line, because "no" and "no until
     fourteen, in a lab" are different answers and only one of them is permanent. */
```

### WHAT KIND OF AFTERNOON THIS IS AND WHETHER A BOARD DEMANDS IT -- `Build · Extra` -- were two pills of the head's own

in `practicalCard_`

```
/* WHAT KIND OF AFTERNOON THIS IS AND WHETHER A BOARD DEMANDS IT -- `Build · Extra` -- were two
          pills of the head's own (*"differentiate between a science experiment and a contraption/art
          and craft thing"*). They are the Experiment-or-build and Required answers now, in the one row
          every card wears, so a tag can be picked as the chip it is (docs/history/355). */
```

### ---------- `wow` STAYS ON THE CARD, WHERE EVERYTHING ELSE MOVED INTO THE GUIDE

in `practicalCard_`

```
/* ---------- `wow` STAYS ON THE CARD, WHERE EVERYTHING ELSE MOVED INTO THE GUIDE -----------
          IT ANSWERS EXACTLY ONE QUESTION and its own note says which: which of these do you open a
          session with. That is a fact about CHOOSING between practicals, so it belongs on the thing
          you choose from, not inside the document you open once you have chosen. The kit and the
          method are the opposite — you read them after deciding. (The safety line moved with them
          and the guide no longer draws it; see `practicalPart_` for what the cut took and what it
          cost.)

          A closed vocabulary, so the test is an equality rather than a substring — see the note in
          `check-practicals.js` and the five cards a substring wrongly called required. */
```

### ---------- FOUR CARDS NOW, AND THIS IS THE FIRST OF THEM

in `practicalCard_`

```
/* ---------- FOUR CARDS NOW, AND THIS IS THE FIRST OF THEM -------------------------------
          ASKED FOR AS "the practicals widget need to be split into widgets. diagram, equipment,
          steps, worksheet bit." The round before this put the whole guide back on this one card
          after "I HATE POP UP" — and a median card of 1,581px in an 807px pane is a card you
          scroll inside, which is the half that was not wanted. Swiping between pages is how every
          other result in this funnel is read, and it is not a pop-up.

          SO THIS CARD IS THE PRACTICAL, and its picture, the kit, the method and the worksheet
          are the pages straight after it — see `pageParts_` and `practicalPart_`. They are
          PAGES rather than items: `stuffPages_` expands the filtered list only where pages are
          built, so a practical is still one item to every count the funnel makes. The drawing was on
          this card and is its own page now, like every question's figure. */
```

### THE GUIDE — WHAT A PRACTICAL NEEDS AROUND IT BEFORE ANYBODY RUNS ONE.

top level, before `guideBox_`

```
/* ==================================================================================================
   THE GUIDE — WHAT A PRACTICAL NEEDS AROUND IT BEFORE ANYBODY RUNS ONE.

   ASKED FOR AS "each practicle needs to have a guide with it. like a risk assessment, something
   which asks for iv dv and control variable." — AND THEN NARROWED, in the owner's own words: "Should
   be name diagram, ingredients with their quantity, steps. And then worksheet bit which records iv
   DV cv. Just that for now for each." The risk assessment is the half that went; `practicalPart_`
   below lists what else did, and says what it costs.

   IT ASKS RATHER THAN STATES, AND THAT IS THE WHOLE DESIGN. Naming the independent variable FOR a
   student removes the one thing the practical is teaching: every exam board marks identifying the
   variables, not reciting them. So the guide gives three boxes with the question written above
   each, and the row's own `variables` and `log` lists sit beside them as the things it could be —
   scaffolding to choose from, which is what a worksheet does and what a filled-in answer cannot.

   NOTHING NEW SAVES IT. `data-do="qp-ans"` is a delegated `input` listener in this file that writes
   `data-k` to localStorage on every keystroke, and `ansRead_` reads it back — the machinery the
   four thousand question boxes already use, keyed per person by `ansKey_`. A second writer would be
   a second thing to keep in step, which is the sentence this repository writes about `documents_()`,
   `factsNow_` and `childrenOf`. The only new thing is a SLOT on the end of the key, so one practical
   can hold an answer per question instead of one. It held eight and holds three; every key ever
   written is still there, so a question that comes back comes back filled.

   IT IS ON THE CARD, AND IT OPENED IN A SHEET UNTIL THE OWNER SAW ONE. "I HATE POP UP. Even if it
   doesn't fit on screen we'll cross that bridge when we get there." So `practicalCard_` calls this
   builder directly and there is no sheet, no tile and no handler. The arithmetic that sent it to a
   sheet is unchanged and is now a cost rather than a reason — `.pane` is `overflow: hidden` and
   caps at about 805px on an 844px phone, so the foot of a long practical is cut off. `check/ui.js`
   measures exactly that and `ACCEPTED_TALL` there carries the decision, so the number is printed
   every run instead of the build going red or the loss going quiet. See `practicalCard_`.
================================================================================================== */
```

### ---------- ONE BOX, ONE SLOT

top level, before `guideBox_`

```
/* ---------- ONE BOX, ONE SLOT --------------------------------------------------------------------
   `ansKey_(x)` IS ONE KEY PER ITEM and a guide needs one per question. The slot goes on the end
   rather than into
   a second key-builder, so `whoIs_` still decides whose answers these are and the "working as"
   switch still moves all of them together — which it would not if this invented its own key.

   THE SLOTS ARE NOT REUSED WHEN A QUESTION GOES. `risk`, `pred`, `res`, `conc` and `eval` are no
   longer drawn and their keys are still in people's browsers; giving one of those words to a new
   question would hand somebody last month's answer to a different question. */
```

### ---------- THE BOX IS `ansBox_`'S BOX, DOWN TO THE CLASS NAMES

in `guideBox_`

```
/* ---------- THE BOX IS `ansBox_`'S BOX, DOWN TO THE CLASS NAMES ------------------------------
     `.qp-ans` AND `.qp-ans-in` ARE ALREADY THE RULED-PAPER FIELD a student writes an answer into,
     already keyed off `data-do="qp-ans"`, already saved by the same delegated listener. A second
     set of rules describing the same object is the `.reel .over` fault — see the note on the
     guide below. What is new is only what goes ABOVE it: `.qp-ans-k` is an uppercase part label
     (`(a)`, `ANSWER`), and a sentence like "the one thing you will change" set in it at .62rem
     with .08em of letter-spacing is a smear rather than a question.

     AND IT IS THE PAD'S BOX, opening on the letters (`kpField_`, keypad.js). It was a plain textarea
     with spellcheck on -- "these hold prose somebody writes about what they think will happen" --
     and so it was one of the ways the phone's keyboard came up on a question's pages, which the owner
     ruled out on 8 Oct (*"I just want self contained system really"*). Spelling help went with the
     phone's keyboard; that is the trade, said here where it was the reason. Named by its question,
     so a screen reader says what it is asking rather than "Your answer" three times. */
```

### ---------- AND A SEND UNDER EACH, SIGNED IN

in `guideBox_`

```
/* ---------- AND A SEND UNDER EACH, SIGNED IN -------------------------------------------------------
     A WORKSHEET'S BOXES REACHED THE ACCOUNT AS THEY WERE TYPED, and since 9 Oct a written answer reaches
     it when it is SENT (*"I just want system to record each submition"*, js/submit.js) -- so a box with
     no Send would be a box whose work never left the iPad. Nothing marks a variable, so it is the plain
     Send (`qp-send`), verdict `sent`: the three boxes are three answers, each sent on its own.

     BESIDE THE BOX, NOT ON A LINE UNDER IT. It was a row of its own first -- the verdict, then the gold
     disc -- and three 48px rows took the worksheet at 320 from 75% of its size to the 70% floor and past
     it into a scroll (`check/ui.js`), on the card the owner asked to fit (*"I don't like scrolling"*).
     So the gold disc stands at the box's lower right as Send does at the chat bar's, and the verdict and
     the line saying where it went take a line each under it. `.gd-mark` lays the label's own parts
     out on its grid (`display: contents` on the label), so the question still spans the width. */
```

### ---------- THE KIT, AS A LIST AGAIN

top level, before `kitList_`

```
/* ---------- THE KIT, AS A LIST AGAIN ------------------------------------------------------------
   IT WAS CHIPS — "like how Google has chips in documents" — and went back on "the google chip idea
   didnt work how i wanted to so revert back". So it is the bulleted list it was before them: one
   item a line, in the guide's own dim ink, read down a column. The chips' own classes (`.kit-chip`,
   `.kit-n`, `.kit-q`) and their rules went with them rather than being left for nothing to draw.

   THE DATA DID NOT GO BACK, and that half was worth keeping. An item is still `Name × qty` in the
   cell, split by `kitParse_` into `{ name, qty }` — the quantity inside the item rather than in a
   parallel column, for the reason the note over `risks` gives about three lists lining up by index.
   So the quantity is printed on the line, after the name.

   A COLON, AND THAT IS MEASURED RATHER THAN PREFERRED. The em dash reads nicely on `Lemons — 4` and
   TEN of the 640 names already carry one of their own — `A stopwatch — a phone will do`,
   `Surfaces to try — carpet, hard floor, pavement, short grass` — so a dash for the amount made a
   name's own aside and its quantity the same mark, and the second of those read `… short grass — 4`.
   The colon appears in NONE of them, counted, which is the same test `×` passed in the cell. And it
   reads right for both kinds of amount, where `×` is right for a count and wrong for a measure:
   `Lemons: 4`, `Water: 100 ml`, `Lolly sticks: about 10`, `Red cabbage: half`. */
```

### ---------- FIVE THINGS, IN THIS ORDER, AND NOTHING ELSE FOR NOW

in `practicalPart_`

```
/* ---------- FIVE THINGS, IN THIS ORDER, AND NOTHING ELSE FOR NOW -----------------------------
     ASKED FOR AS "Should be name diagram, ingredients with their quantity, steps. And then
     worksheet bit which records iv DV cv. Just that for now for each."

     THE NAME IS THE SHEET'S OWN TITLE. `openSheet(x.name, …)` draws it above this markup with the
     close control beside it, so a heading here would be the practical's name twice on one screen —
     which is the fault this repository records where the roster's `name` printed an `<h3>` over
     every widget's own heading, and where the maze printed its one instruction twice.

     WHAT WENT, SAID RATHER THAN BURIED, because a reduction that reads as a tidy-up is the thing
     this file warns about: "What is going on", the whole RISK ASSESSMENT section (its written
     hazards, the safety line, the public-liability line for a home venue and the box asking what
     else is in the room), the prediction, the results, the conclusion, the evaluation, the maths
     link and the tutor notes. COUNTED RATHER THAN DESCRIBED: it drew eight answer boxes and draws
     three — `risk`, `pred`, `res`, `conc` and `eval` went, `iv`, `dv` and `cv` stayed — and its
     eleven headings are five. A number in a sentence nobody re-reads is the fault this repository
     records as "all 18 checks pass", and the first draft of this paragraph had it wrong.

     NOTHING IS DELETED FROM THE DATA AND NOTHING TYPED IS THROWN AWAY. `risks`, `safety`,
     `science`, `maths_link` and `notes` are still columns, `check-practicals.js` still FAILS a
     live row with no risk assessment, and the card still prints the hazard level. Every answer
     already typed is still under its own key in `localStorage` — `guideBox_` reads `ansKey_(x) +
     '#' + slot`, so a box that comes back comes back filled.

     THE ONE THING WORTH WEIGHING BEFORE IT COMES BACK is that `risks` is now a column nothing
     draws. That is this repository's oldest shape — `figure`, `orderPrints`, `exam_date`, `wow` —
     and it is deliberate here rather than accidental, which is the whole difference. */
```

### ---------- ONE PAGE EACH, HEADED WITH WHOSE PAGE IT IS

in `practicalPart_`

```
/* ---------- ONE PAGE EACH, HEADED WITH WHOSE PAGE IT IS ------------------------------------
     "Split into widgets. diagram, equipment, steps, worksheet bit." The picture is on the
     practical's own card (`practicalCard_`), so this builds the other three. Each is a whole card
     rather than a fragment, because a page in this strip is somewhere you can land from a flick
     four results away — and a page reading only "How it runs" is a page you would have to swipe
     back to understand. So the practical's name sits small above the section's own heading.

     `.gd` STAYS ROUND THE CONTENT, which is what leaves every rule the guide already had —
     `.prac-kit ul`, `.gd .prac-steps`, `.fc-sec`, `.prac-tab` — applying unchanged. The markup
     inside each section is the markup it had on the single card, moved, not rewritten; and the
     answer boxes are `guideBox_`'s with the same slots, so every answer already typed comes back. */
```

### ---------- THE WORKSHEET, AND THE CANDIDATE LISTS ARE PART OF IT

in `practicalPart_`

```
/* ---------- THE WORKSHEET, AND THE CANDIDATE LISTS ARE PART OF IT ------------------------
       `prac-tab` IS THIS SECTION'S OWN SCAFFOLDING RATHER THAN A FIFTH THING: a box asking a
       student to name an independent variable with nothing on the page suggesting one is a
       worksheet with the scaffolding removed. They are CANDIDATES and not answers, which is why the
       boxes still ask. */
```

### A PROJECT — THREE OR FOUR SESSIONS THAT END IN SOMETHING A CHILD MADE.

top level, before `PROJ_TYPE`

```
/* ==================================================================================================
   A PROJECT — THREE OR FOUR SESSIONS THAT END IN SOMETHING A CHILD MADE.

   ASKED FOR AS "the projects are like practicles, but not practicles", and the card says which half
   is which. LIKE a practical: one card you choose from, then the kit and the steps as pages after
   it, in `.prac`'s own rules — so a project and a practical side by side in a list read as one
   family, and nothing in style.css had to be written twice. NOT a practical: no exam board, no
   required/extra flag, no worksheet asking for an independent variable. Its strip says how many
   SESSIONS, not minutes, because a project is planned across weeks.

   THE LAST PAGE IS "SHARE IT", AND SAVING THE WORK IS NOT IN SCOPE. The owner's older notes asked
   for "places for them to save videos and stuff"; that is file storage for children's films, with
   the consent and moderation questions that carries, and it is not built. What is built is the
   sentence each row's `share` holds — what to send and what to bring — and one tile to Messages,
   where a tutor already reads what a student writes. `check-projects.js` refuses a step that tells
   a child to put the work online.
================================================================================================== */
```

### ---------- A PROJECT OR A COURSEWORK

top level, before `PROJ_TYPE`

```
/* ---------- A PROJECT OR A COURSEWORK -------------------------------------------------------------
   THE OWNER, 9 Oct: "i would like to add course works. make it bare bones. its within projects in
   finder. like i remember i did dt graphics coursewoork in gcse which was to make products for a
   movie coming out." So a coursework is a project with a board, and this is `PRAC_TYPE` one kind
   along: the file holds the word (`project_type`, blank reading as `project` -- see library.js),
   this holds the label, and the card, the funnel's answer and its chip all say the label. A value
   the map has never heard of is drawn raw, `PRAC_TYPE`'s rule: visibly wrong beats invisible.

   BARE BONES IS THE SPEC, "i am just trying to set up infrastructure". A coursework is the project's
   card, its materials, its STAGES and the share page, and nothing else. The obvious next things are
   all NOT built: marking against a board's criteria, deadlines per stage, a record of which stage a
   pupil has reached. And uploading a pupil's work is not built ON PURPOSE rather than for later --
   note 253's reason: storing children's work is consent and moderation, so the share page sends
   them to Messages and to the next session, and `check-projects.js` fails a stage that says
   upload or publish. */
```

### THE BOARD AND THE SPEC ON THE SUBJECT'S LINE -- `AQA 8552` is which qualification the work counts towards, and a project has neither, so its line is unchanged.

in `projectCard_`

```
/* THE BOARD AND THE SPEC ON THE SUBJECT'S LINE -- `AQA 8552` is which qualification the work
     counts towards, and a project has neither, so its line is unchanged.
     ONE UNBREAKABLE PAIR, NOT TWO ITEMS OF THE LIST. Joined by ` · ` like the rest, the line broke
     at 320px after `AQA ·` and left `8552` alone on a line of its own: a spec code means nothing
     without its board, so the two are joined by a no-break space and wrap as one. */
```

### A COURSEWORK'S STEPS ARE ITS STAGES -- brief, research, specification, ideas, development, models, making, evaluation -- and that is the word a GCSE pupil and

in `projectPart_`

```
/* A COURSEWORK'S STEPS ARE ITS STAGES -- brief, research, specification, ideas, development,
       models, making, evaluation -- and that is the word a GCSE pupil and their teacher use for
       them. One word chosen by the type, on the same page, rather than a second page to keep in
       step with this one. */
```

### "SEND IT IN MESSAGES", NOT "TO YOUR TUTOR".

in `projectPart_`

```
/* "SEND IT IN MESSAGES", NOT "TO YOUR TUTOR". The page was written to a student, and a tutor
       opening the same project read an instruction to message themselves. *"No distinction between
       tutor and student on the finder. All the same."* -- so it says what to do with the thing, and
       who it goes to is the Messages screen's question, as the note under this function says. */
```

### ---------- AND ON A COURSEWORK, WHOSE WORK IT IS

in `projectPart_`

```
/* ---------- AND ON A COURSEWORK, WHOSE WORK IT IS ------------------------------------------
       A COURSEWORK IS MARKED AS THE PUPIL'S OWN WORK, and a tutoring business pointing a pupil's
       real coursework at a tutor, with nothing said about where help stops, reads as an offer to
       go over work that will be handed in. JCQ's instructions for conducting non-exam assessment,
       which every board follows, say the work submitted must be the candidate's own and that the
       school must be able to confirm it; nothing found there names private tutors, so this says
       the cautious thing.

       IN CODE, NOT IN THE ROW, so every coursework carries it and the next one's writer cannot
       forget it -- the argument `projectText_` makes about a coursework's names. ONE PARAGRAPH
       UNDER THE TILE ROW, `jobAdminTiles_`'s rule for a warning, and on THIS page because this is
       the page that sends work to a tutor. It also carries the sentence the brief's first stage
       used to: a real coursework starts from the board's context, not from this practice brief. */
```

### THE @family. TEXTBOOK — A CONTENTS CARD, THEN ONE PAGE PER CHAPTER.

top level, before `tbMath_`

```
/* ==================================================================================================
   THE @family. TEXTBOOK — A CONTENTS CARD, THEN ONE PAGE PER CHAPTER.

   ASKED FOR AS "the @family textbook should be bare bones for now and the textbooks will be in the
   resources tag in the finder. first one can be gcse statistics." BARE BONES IS THE SPEC, not a
   first draft of something longer: each chapter is its key words with one line each, its formulas,
   and a handful of worked lines — a revision sheet you can flick through, not prose pages. So
   there is nothing on these pages a student has to scroll past to reach the formula.

   DRAWN AS THE APP DRAWS A LONG THING, which is the project's way one kind along: the card you
   choose from, then the parts as pages after it (`pageParts_`), in `.prac`'s own rules and the
   guide's `.fc-sec` sections — so a book and a project side by side read as one family and
   style.css gained only what a book has and they do not: the Higher mark and the formula line.

   THE FORMULAS ARE TYPESET BY `typeset_`, the library's own fraction and power drawing, so `Σfx / Σf`
   is drawn stacked exactly as a past paper's fraction is — "it shouldnt be 4/5 it should be 4 over
   the five". The file stores a plain `/` and `^`, which a person can type into a cell; `tbMath_`
   turns the slash into the `&frasl;` `typeset_` reads AFTER escaping, so nothing in a cell can be
   markup. `check-textbooks.js` runs the real `typeset_` over every line and fails a slash or a caret
   that came out unset.

   HIGHER TIER ONLY IS MARKED, NEVER HIDDEN. A Foundation student revising should see that standard
   deviation exists and that it is not theirs to learn; an `H` beside it says both. A chapter that
   is Higher all through carries one `H` on its heading rather than one on every line.
================================================================================================== */
```

### A SUBSCRIPT IS DRAWN AS ONE, NOT AS THE FONT'S OWN GLYPH.

top level, before `TB_SUB`

```
/* A SUBSCRIPT IS DRAWN AS ONE, NOT AS THE FONT'S OWN GLYPH. The cell holds `Q₁` and `rₛ`, which a
   person can type and read in a spreadsheet — and the screen's mono face draws `₉₀` as two specks,
   measured at 320px, where `P₉₀` read as `P∘∘`. So a run of Unicode subscript characters becomes a
   `<sub>` of the ordinary digits at the page's own size. AFTER `typeset_`, because `typeset_` reads
   a `<sub>` beside a slash as half of a stored fraction, and these characters never appear inside a
   tag, so the markup it wrote cannot be touched. */
```

### ---------- A CONTENT CARD: ONE CHAPTER, WHOLE, WITH THE QUESTIONS' TAGS ON IT

top level, before `contentCard_`

```
/* ---------- A CONTENT CARD: ONE CHAPTER, WHOLE, WITH THE QUESTIONS' TAGS ON IT -------------------
   IT WAS A CONTENTS CARD AND A PAGE PER CHAPTER (`textbookCard_`, `textbookPart_`). The owner, 12 Oct:
   *"Forget the whole concept of it being a text book. It's just a "content card"."* So the chapter IS
   the card: its title, the one tag row every Find card wears (`tagRow_` -- [Content] first, then the
   question library's Level, Subject, Board, Tier and Topic answers, so *"It can share same tags as
   questions e.g. gcse, ks2, maths"* is the same renderer rather than a copy of it), then its key words,
   formulas and worked lines (`tbSections_`, unchanged). The title's own `H` went with its `Content`
   pill: [Higher] says it, and two marks for one fact is the thing 355 took out. Nothing on it says book
   or chapter. Its animations stay pages of their own after it (`pageParts_`). */
```

### ---------- A CHAPTER'S KEY WORDS, FORMULAS AND WORKED LINES — ALL OF THEM, OR THE ONES ASKED FOR

top level, before `tbSections_`

```
/* ---------- A CHAPTER'S KEY WORDS, FORMULAS AND WORKED LINES — ALL OF THEM, OR THE ONES ASKED FOR ---------
   ONE RENDERER FOR BOTH PAGES. The chapter draws every line; the page of an animation draws the lines it
   is ABOUT (`keep`, the row's `about`): a key word or a formula by its name, a worked line by how it
   opens. Two copies of this markup would be two places for a Higher mark or a fraction to be drawn
   differently, which is the shape `typeset_` exists to end. With no `keep` this is, byte for byte, what
   `textbookPart_` drew before it moved here — proved over every chapter of every book when it moved.
   The content card draws it whole now (`contentCard_`), where the chapter's own page used to. */
```

### A CHAPTER'S ANIMATION, ON A PAGE OF ITS OWN STRAIGHT AFTER IT.

top level, before `TB_AN_SEQ`

```
/* ==================================================================================================
   A CHAPTER'S ANIMATION, ON A PAGE OF ITS OWN STRAIGHT AFTER IT.

   "Add the animations from loading to respective subject text books. Matter of fact the source for the
   animations should be in text books." — the owner, 8 Oct. Each teaching animation (Pythagoras counted,
   the sieve, Bayes with a hundred people) is a row of data/textbooks.json under the chapter it teaches,
   and this is where the book plays it: the drawing, a Play again tile, and under it the chapter's own
   words about it — its `about`, drawn by the chapter's renderer, so the page says what the picture shows
   in the words the chapter uses. The loading screen draws the same rows from a copy the device keeps;
   see `splashSync_` in shell.js.

   NO "@family." LINE. The splash signs every drawing because it is the first thing anybody sees and has
   to say whose app it is; here the kicker already names the book. The row's markup carries no
   signature at all — the picker in index.html adds one when it draws on the splash.

   A THING HAS TILES (CLAUDE.md), and an animation is a thing: Play again is a tile, not a button. */
```

### THE PART IS STILL `an17-pyth` — the chapter's number in the file, then the drawing's id — because the number is what tells two cards' drawings apart in a class

top level, before `textbookAnimPart_`

```
/* THE PART IS STILL `an17-pyth` — the chapter's number in the file, then the drawing's id — because
   the number is what tells two cards' drawings apart in a class name and a kept page. It is never
   SAID: the kicker names the subject and the card, which is what a student reaching this page from
   the card above it already knows it by. */
```

### ---------- AN ANIMATION'S STYLESHEET, ONCE, SHARED WITH THE SPLASH

top level, before `animStyle_`

```
/* ---------- AN ANIMATION'S STYLESHEET, ONCE, SHARED WITH THE SPLASH ---------------------------------
   ONE `<style data-anim="id">` PER ANIMATION in `<head>`, holding the row's CSS and its hash. The splash
   makes the same element when it draws one from the device's copy, so a book opened while that splash
   is still fading finds it there: left alone if the hash is the book's, its text replaced if the book
   has a newer drawing. Every rule in it is anchored on the animation's own root or its own prefix
   (`check-anims.js`), so nothing in it can reach anything else on the page. */
```

### ---------- AN id IS ONE ELEMENT, AND A DRAWING CAN BE ON THE PAGE TWICE

top level, before `animIds_`

```
/* ---------- AN id IS ONE ELEMENT, AND A DRAWING CAN BE ON THE PAGE TWICE ------------------------------
   THE SINE WAVE'S FADE, THE VENN'S CLIPS AND y = mx + c's CLIP ARE `id`s, reached by `url(#…)` and
   `href="#…"` from inside the drawing. Find keeps the pages either side filled, so two copies of one
   chapter's drawing — or the splash's and a chapter's — would be two elements with one id, and
   `url(#sn-fade)` resolves to whichever came first: the fault check-css's id sweep was written for.
   So each drawing put on a page is given its own: every `id` in it gains `-t` and a number that only
   goes up, and every reference inside it follows. The CSS never names an id (check-anims), so nothing
   outside the drawing needs telling. */
```

### ---------- ONLY THE ONE ON THE PAGE IN FRONT PLAYS, AND IT PLAYS FROM THE START

top level, before `tbAnimWatch_`

```
/* ---------- ONLY THE ONE ON THE PAGE IN FRONT PLAYS, AND IT PLAYS FROM THE START ----------------------
   FIND KEEPS ITS WHOLE WINDOW FILLED (`STUFF_WIN`, forty-one pages since docs/history/341), so a book with
   four drawings near the page you are on
   would run four animations nobody can see — and the one you swipe to would already be half way through
   its story. So the stage on the page in front is `.is-on`, and arriving there puts its markup back
   (`innerHTML = innerHTML`), which starts every animation in it again; every other stage stands paused
   by `.tb-an-stage:not(.is-on)` in style.css. Off the Find screen, nothing plays.
   BOOKED BY NAME through `afterSlide_` from `goPage`, so a run of quick flicks is one decision at the
   end, and called when a screen arrives and at the end of a fill.
   EVERY FINDER'S COLUMN, not a parameter: both finders carry the textbooks (docs/history/347), so a
   chapter's drawing can be open in either column — the one a student keeps the reading up in — and
   asking each column costs two `querySelectorAll`s, far less than remembering to pass the right one
   from four callers, one of which (`startScreen_`) knows no finder at all. */
```

### ---------- ONE CHAPTER, AS AN ITEM THE FUNNEL ASKS THE QUESTIONS' QUESTIONS OF

top level, before `contentItem_`

```
/* ---------- ONE CHAPTER, AS AN ITEM THE FUNNEL ASKS THE QUESTIONS' QUESTIONS OF ----------------------
   THE QUESTION LIBRARY'S FIELDS, IN ITS SPELLINGS, so one chip holds both: `subject` and `level` as
   the cover or the chapter says them (`libraryExtras_` fills a chapter's blank cell from the cover),
   `keystage` as a comma list like a worksheet's, `tier` only where the chapter is Higher all through,
   and `examBoard` ONLY where the chapter's own content is one board's — a set text, an anthology, a
   language's themes, an exam's question numbers. Blank everywhere else, because the words of a GCSE
   Maths chapter are every board's, and a `Edexcel` chip that hid them from an AQA student would be
   the judgement-drawn-as-a-fact the owner refused for question topics (`topicShown_`). TOPICS ARE THE
   LIBRARY'S LABELS, SPELLED EXACTLY — `check-textbooks.js` refuses one that is not — so the search
   reaches the card and the questions with one word, and Topic folds them into one answer.
   THE KEY IS THE BOOK'S ID AND THE CHAPTER'S NUMBER (`ct:TB-GCSE-MATHS-2`). A star on a book (`tb:`)
   names nothing now, and `collItems_` skips a key that names nothing, so Saved drops it quietly. */
```

### `contentText_` — `projectText_`'s move for one content card:

top level, before `contentText_`

```
/* `contentText_` — `projectText_`'s move for one content card: `frequency density` and `stratified` are
   what somebody types, and they are only ever inside the card's words. The formulas go in as typed, so
   `IQR` finds the card that defines it. It was `textbookText_`, the same lines over a whole book. */
```

### THE BIBLE (KING JAMES VERSION) — ASKED LIKE EVERYTHING ELSE ON FIND, AND SHOWN ONLY TO AN ADMIN.

top level, before `BIBLE_NAME`

```
/* ==================================================================================================
   THE BIBLE (KING JAMES VERSION) — ASKED LIKE EVERYTHING ELSE ON FIND, AND SHOWN ONLY TO AN ADMIN.

   ASKED FOR AS "i want to add the bible to resources as a book. but only admin can see the bible."
   and then "i already have a bible text in repo" — `data/archive/bible.json`, the old `Library`
   sheet's `bible` tab, 31,102 verses. `tools/bible-split.py` cuts it into `data/bible/`: one file a
   book and a 15 KB `index.json`. Nothing about it is in the `doGet` payload, and nothing in it is
   fetched until an admin is the one looking.

   ---------- AND THEN REDONE, BECAUSE THE FIRST ONE WAS A SECOND APP --------------------------------
   THE OWNER, 6 Oct: *"the bible needs to be redone. youve gone awol there. it should be like the other
   stuff. tags in finder. should go translation e.g. kjv, then old testament or new, then group the
   books, e.g. torah, pauline epistles ect. then the book titles e.g. genises, eodus. then the
   chapters, e.g. 1,2,3 then the verses e.g 1 2 3. each verse is a widget."*

   WHAT WAS AWOL. The first build was a reader of its own standing on one Find result: a cover, three
   pages of hand-made book buttons, pages of chapter-number buttons, and every chapter cut into
   measured screenfuls (`bibleMeasure_`, `bibleCut_`), with `bible-to` tiles to climb back up. None of
   those buttons was a funnel answer, so none made a chip, none had the ✕ every other choice on Find
   has, and the way back out was a tile that only that reader knew about. Everything else on Find is
   one question at a time and one thing to a page; this was a book inside a page.

   SO IT IS SIX QUESTIONS AND 31,102 CARDS. Books → `Translation` (KJV) → `Testament` → `Group`
   (Torah, Pauline Epistles…) → `Book` → `Chapter` → `Verse`, each an ordinary facet in `FACETS`
   answered by an ordinary chip, and each verse a card of its own with its tags, as a question is.
   The reader's 260 lines of measuring and cutting are gone: one verse is never taller than a page
   except Esther 8:9 on the narrowest phone, which `paneReach_` draws a step smaller like any card.

   ---------- TWO LISTS, AND WHY THE VERSES ARE NOT ON FIND'S ----------------------------------------
   `stuffItems()` HOLDS THE COVER ALONE, as it always did: one item, `bible:kjv`, on the Books shelf.
   The verses are a second list (`bibleVerses_`) that `stuffFiltered` reads INSTEAD of Find's only
   while a Bible chip is on (`bibleInside_`). Measured before building it, with the verses put on
   Find's own list:
     · 31,102 verses would be 81% of an admin's Find, and the coverage rule reads shares — Learning,
       skip, skip asked Subject without them and NOTHING with them, because no school question was
       answered by half the list any more.
     · every tally over a mixed list walked them: 330–410 ms to find that no question applied.
     · a search typed at the top would have answered with Bible verses before past papers.
   With two lists, every list that is not the Bible's is today's list, item for item — `check-flow`
   asks that every question an admin is asked is the one a parent is asked, Books apart.

   ---------- THE FENCE, THE CHAIN AND THE GRID ------------------------------------------------------
   `only: 'bible'` ON THE SIX (`facetFenced_`): a Bible question is asked only of a list that is all
   Bible, and such a list is asked only Bible questions. Nobody else pays a tally for them; inside,
   each tap tallies one question rather than walking twenty-five that cannot apply.
   `FACET_NEEDS_FIRST` CHAINS THEM, so the order is the owner's whatever the sheet's `sort_order`
   says, and "Doesn't matter" on one releases the next.
   `grid: true` ON CHAPTER AND VERSE: a numbered run is exempt from `FACET_MAX_ANSWERS` and drawn as a
   grid of numbers. Psalms has 150 chapters and Psalm 119 has 176 verses; the cap is about a list of
   names nobody can read, and a run of numbers is read by its position, not word by word.

   ---------- GATED ON THE PHONE, NOT ON THE SERVER, AND THAT IS NOT THE FILMS' MISTAKE REPEATED -----
   (The films are in Games → Videos and not in Find since 10 Oct; the argument about where a gate
   belongs is unchanged, and it is still why `doGet` alone decides who is sent them.)
   THE ONE EXCEPTION THE PHONE MAKES TO "Find shows the same thing to everyone" (*"No distinction
   between tutor and student on the finder. All the same."*), made in ONE place (`bibleFor_`). The
   films are a list the owner wants nobody to see, so `doGet` never sends them to anybody else — a
   filter on the phone is something the network tab reads past (note 068). The King James text is
   public domain and has sat in this public repository since the archive was made; there is nothing
   in it to keep from anybody. What the owner asked for is what the app SHOWS, so the gate is the
   item list, the verse list and every fetch: no book and no index is asked for unless `bibleFor_`
   says yes, and `check-flow` records every fetch to prove it.
================================================================================================== */
```

### `Books`, A SHELF OF ITS OWN, BESIDE `@family. textbooks` AND `Boxing`.

top level, before `BIBLE_SHELF`

```
/* `Books`, A SHELF OF ITS OWN, BESIDE `@family. textbooks` AND `Boxing`. Not the textbooks' shelf:
   that one is books this business wrote, and the King James is not one of them. "As a book" is the
   owner's word for it, and the next book that is not ours belongs here too. */
```

### EVERYTHING IT KNOWS, IN ONE PLACE.

top level, before `BIBLE`

```
/* EVERYTHING IT KNOWS, IN ONE PLACE. `books` IS THE VISIT'S CACHE — a book asked for once is held
   until the page is closed, so a second verse of Genesis is not a second download; `loading` is the
   fetch in flight, so twenty cards of one book drawn at once ask for it once; `missed` is a book that
   did not come. `verses` is the verse list, built once per index (`bibleVerses_`); `rank` is the
   canonical order of the testaments, groups and books, which the funnel sorts the answers by; `hays`
   is what every verse of each book is searched by, which the cover answers a search with
   (`bibleHolds_`). */
```

### ---------- WHO IS SHOWN IT

top level, before `bibleFor_`

```
/* ---------- WHO IS SHOWN IT -----------------------------------------------------------------------
   THE WHOLE EXCEPTION IS THIS LINE. The item list asks it, the verse list asks it, the fetches ask it
   again (a book must not be downloaded for somebody who could not have been shown it), and so does
   every handler — a forged button is still a tap. */
```

### ONE FETCH FOR EVERY FILE OF IT, stamped with the deploy so the service worker's exact-URL cache hands back a fresh copy after one — `videosAsk_`'s reasoning

top level, before `bibleGet_`

```
/* ONE FETCH FOR EVERY FILE OF IT, stamped with the deploy so the service worker's exact-URL cache
   hands back a fresh copy after one — `videosAsk_`'s reasoning, word for word. A failure is `null`,
   never a throw: the page that asked says so in words. */
```

### THE LIST OF BOOKS — asked for once, the first time an admin's Find is built, which is long before a finger reaches the shelf.

top level, before `bibleIndex_`

```
/* THE LIST OF BOOKS — asked for once, the first time an admin's Find is built, which is long before a
   finger reaches the shelf. Held to its shape on arrival: a file name has to look like the files the
   splitter writes, so nothing in a doctored index can point a fetch anywhere else; and the verse
   counts have to add up, because every one of the 31,102 cards is named from them before its book is
   on the phone — a count one short would be a verse nobody could reach, one over a card with nothing
   on it. */
```

### THE SEARCH LEARNS THE BOOKS, so typing `psalms` finds the Bible — through `bibleHolds_`, which reads `BIBLE.hays` and so changes its answer the moment they are

in `BIBLE.asking`

```
/* THE SEARCH LEARNS THE BOOKS, so typing `psalms` finds the Bible — through `bibleHolds_`, which
         reads `BIBLE.hays` and so changes its answer the moment they are here, on the item already
         built. The cached search and the pages are told to forget (`me.js`'s move for the friends
         list): a `psalms` typed while the index was on its way would otherwise go on answering from
         the list that did not have it, and the Books shelf would go on showing its loader over a
         question it can now ask.
         IN EVERY FINDER, because both hold the Bible for an admin (docs/history/347) — a `psalms`
         typed into either while the index was on its way would otherwise go on answering from the
         stale memo — and bound again by hand, because a promise lands outside whatever binding asked
         for it. The cards are redrawn once, first: `bibleRedraw_` is the whole document's. */
```

### THE WORDS EVERY VERSE OF ONE BOOK CARRIES — its Bible, its testament, its group and its book — so a search that names any of them finds it.

top level, before `bibleBookWords_`

```
/* THE WORDS EVERY VERSE OF ONE BOOK CARRIES — its Bible, its testament, its group and its book — so a
   search that names any of them finds it. One function for the verses (`bibleVerseList_`) and for the
   cover's search (`bibleHay_`), because those two are the same question and must not be two recipes. */
```

### WHAT EVERY VERSE OF ONE BOOK IS FOUND BY, BAR ITS OWN NUMBERS:

top level, before `bibleHay_`

```
/* WHAT EVERY VERSE OF ONE BOOK IS FOUND BY, BAR ITS OWN NUMBERS: a verse's haystack with the `1:3`
   taken off its name. Built by `stuffHay_` itself from a stand-in verse, so it is the search's own
   recipe — name, `sub`, words — and not a copy of it that could drift. */
```

### ---------- A SEARCH KEEPS THE COVER EXACTLY WHEN IT WOULD KEEP A VERSE

top level, before `bibleHolds_`

```
/* ---------- A SEARCH KEEPS THE COVER EXACTLY WHEN IT WOULD KEEP A VERSE -------------------------------
   FOUND BY THE REVIEW. The cover's haystack was every testament, group and book in one string, plus a
   `sub` of "Old and New Testaments" that no verse had. So it held words no verse holds — `testaments`,
   `and` — and PAIRS no verse holds, `torah gospels`, `old new`. Typed on the Books shelf, the cover
   stayed, Translation was asked, and KJV answered "Nothing matches": a door that opened onto a wall.
   A union of sixty-six books' words is a haystack for a thing that is none of them.
   SO THE COVER IS ASKED WHAT A VERSE WOULD BE ASKED, of the verses it stands for — and without
   building them, from the index. A verse's haystack is its book's (`BIBLE.hays`) and its own `c:v`,
   and nothing else, so: every word in ONE book's, and whatever that book's leaves over inside one
   `c:v` of it. The same words find the cover before the Bible is open and the verses after, so a
   search that keeps the cover keeps a verse once KJV is pressed, and one that would keep no verse
   never offers the shelf. AND `psalm 23` AND `john 3:16` FIND IT NOW, where a number found it only
   when it happened to be in a book's name (`1 Samuel`). The walk over a book's verses runs only for a
   word that is digits and colons, stops at the first verse that has it, and is 31,102 short strings
   at the very worst — one item, an admin's, not a list.
   BEFORE THE INDEX there are no books to ask, and the cover's own words decide: its name and
   `BIBLE_WORDS`, which every verse carries too, so it can never promise what the verses lack. */
```

### ---------- THE ORDER THE ANSWERS ARE DRAWN IN, WHICH IS THE BIBLE'S

top level, before `bibleRankOf_`

```
/* ---------- THE ORDER THE ANSWERS ARE DRAWN IN, WHICH IS THE BIBLE'S ------------------------------
   THE ALPHABET IS WRONG THREE TIMES HERE. `cmpText` puts the New Testament before the Old, `General
   Epistles` before `Torah`, and `1 Chronicles` before `Genesis` — every answer present and the order
   meaningless, on a book whose order is the first thing anybody knows about it. So the testament,
   group and book questions each carry `orderOf`, and this is what it reads: the place of each
   answer in the index, which is canonical order by construction (`tools/bible-split.py` refuses an
   archive out of order). Keyed by `spellKey_`, the fold `facetTally_` hands its answers through, so
   the drawn spelling and the ranked one cannot drift apart. -1 is "not one of ours", which the tally
   sorts last. Chapter and verse need none of it: `cmpText` is numeric, so 2 comes before 10. */
```

### ---------- THE CHOSEN BOOK, ASKED FOR BEFORE ITS VERSES ARE DRAWN (docs/history/341)

top level, before `bibleChosen_`

```
/* ---------- THE CHOSEN BOOK, ASKED FOR BEFORE ITS VERSES ARE DRAWN (docs/history/341) ---------------------
   The verse card's own fetch (`bibleCard_`) stays as the floor, and the builder asks (the `bible` job) if the
   book is chosen and still not here — Resources drawn in the quiet for nobody, its question in front, where no
   verse card would be drawn until the fill reached it. The chip asked too, until the review of 12 Oct found
   nothing could tell: the page in front is filled in the chip's own task and its first verse asks first (the
   note in `on('facet-pick')`). The cards waiting for it are drawn again when it comes, whichever asked first
   (`bibleRedraw_`). Admin only, as every Bible fetch is (`bibleFor_`). */
```

### ---------- A VERSE, DRAWN

top level, before `bibleVerse_`

```
/* ---------- A VERSE, DRAWN ------------------------------------------------------------------------
   THE TWO MARKS THE 1611 PRINTERS LEFT IN THE TEXT, and both are kept in the file for this function
   to draw (see `tools/bible-split.py`):
     `[was]` — a word the translators SUPPLIED, which the King James prints in italic. Drawn in
       italics without the brackets: "darkness <i>was</i> upon the face of the deep".
     a leading `# ` — the pilcrow, where a paragraph starts. Taken off here; `bibleV_` draws the
       pilcrow itself in front of the verse instead, quietly.
   ESCAPED FIRST, THEN MARKED, the order `lawsColour` keeps for the same reason: the brackets are
   the only thing turned into markup, and nothing inside a verse can be. A STANDALONE DECLARATION
   THAT USES `esc` AND NOTHING ELSE — `check-bible.js` cuts it out by name and runs every verse of the
   Bible through it. */
```

### ---------- THE VERSE AS THE CARD READS IT

top level, before `bibleV_`

```
/* ---------- THE VERSE AS THE CARD READS IT --------------------------------------------------------
   THE PARAGRAPH MARK IS DRAWN, NOT SPACED. On a page of verses a paragraph was a little room above;
   one verse to a card has nothing above it to make room from, so the 1611 pilcrow is printed in front
   of the verse in the faint ink, as the 1611 printers printed it. `aria-hidden`: a reader hears the
   verse, not the mark. Genesis 1:6 is the first. */
```

### ---------- EVERY VERSE, AS AN ITEM

top level, before `bibleVerseList_`

```
/* ---------- EVERY VERSE, AS AN ITEM -----------------------------------------------------------------
   NAMED FROM THE INDEX, NOT FROM THE BOOKS — a card has to exist, be counted and be answered for
   before its book is on the phone, or Genesis 1:3 could not be a chip's result until the 204 KB of
   Genesis had landed. So the verse's words are not on the item; the card fetches its book when it
   is drawn (`bibleVerseCard_`).
   ONE SHARED RECORD A BOOK (`bb`) AND ONE STRING A NUMBER (`num`), so 31,102 items cost 31,102 small
   objects and not 31,102 copies of the same five strings: the funnel reads `x.bb.group` and `x.ch`
   and allocates nothing.
   THE KEY IS THE VERSE'S ADDRESS, `bible:kjv:1:1:3` — book number, chapter, verse — and it is
   stored in favourites, so its shape must never change. A second translation is a second prefix.
   IN CANONICAL ORDER, and that order is the list's own: `bibleFind_` only ever filters it, so Genesis
   1:1 comes first and Revelation 22:21 last without a sort key. `starts` is where each chapter's
   first verse sits, so `bibleByKey_` finds any verse without a search.
   PURE — it reads its argument and the six names it uses, nothing else, so `check-bible.js` cuts it
   out and builds the list from the real index. */
```

### THE VERSE LIST, BUILT ONCE A VISIT — the first time the Bible is opened, never for anybody else.

top level, before `bibleVerses_`

```
/* THE VERSE LIST, BUILT ONCE A VISIT — the first time the Bible is opened, never for anybody else.
   ALSO IN `SORTED_ITEMS` AS ITS OWN SORTED COPY, so anything that hands it to `stuffSorted_` gets it
   back in canonical order rather than sorted by name, which would be every `1 Chronicles` in front
   of Genesis. */
```

### ONE VERSE BY ITS KEY, by arithmetic:

top level, before `bibleByKey_`

```
/* ONE VERSE BY ITS KEY, by arithmetic: its chapter's first verse, then the verse's place in it. Null
   for anything that is not exactly a verse of this translation — a key from a phone that kept a
   different index, or one somebody typed. */
```

### ---------- IS THE BIBLE OPEN?

top level, before `bibleInside_`

```
/* ---------- IS THE BIBLE OPEN? ----------------------------------------------------------------------
   WHEN ANY CHIP IS ON ONE OF ITS SIX QUESTIONS — an answer or a "Doesn't matter". The first is the
   Translation answer, reached from the Books shelf. ANY of them, not the Translation one: drop `KJV`
   with Testament and Book still on and the Bible stays open and simply asks Translation again, as
   dropping any chip re-asks its question — no special case in `filter-drop`. */
```

### ---------- THE BIBLE'S RESULTS

top level, before `bibleFind_`

```
/* ---------- THE BIBLE'S RESULTS ---------------------------------------------------------------------
   THE COVER STANDS IN FOR EVERY VERSE ON THE CHIPS THAT ARE NOT THE BIBLE'S OWN. `What for: Learning`,
   `What kind: Resources` and `Shelf: Books` are true of the cover, so they are asked of the cover —
   once — rather than of 31,102 verses that would each answer them the same way. A chip the cover does
   not pass (a forged `Subject: Maths`) empties the Bible, which is what that chip would do to any
   item on the shelf. And a cover not on Find's list — the library still coming, or a sheet `kinds`
   row switching `bible` off — is a Bible not on Find.
   FIND'S LIST IS READ FIRST, because building it is what sets `BIBLE.item`: after a new payload the
   item is a new object, and asking about the old one would empty the Bible for one tap.
   THE BIBLE'S OWN CHIPS NARROWEST FIRST — the last pressed is the deepest — so Verse 3 cuts 31,102 to
   1,189 before Chapter cuts those to 66; the other order walks the whole Bible three times. Safe to
   reverse because no Bible chip is ever a bucket, which is the only chip whose order matters.
   THE TRANSLATION'S OWN ANSWER IS NOT WALKED: the verse list is one translation, so `KJV` keeps every
   verse, and filtering 31,102 items to find that out was most of the cost of the tap that opens the
   Bible. Any other translation named on a chip — a forged one — is still a filter, and keeps nothing.
   SO WITH NO OTHER BIBLE ANSWER AND NO WORDS THIS HANDS BACK THE VERSE LIST ITSELF, the memoised array
   — which is also what lets the Testament question's tally be reused the next time KJV is pressed (it
   is held on the array) — so nothing may sort or splice a results array in place; every reader here
   only reads. */
```

### ---------- THE LAST LINE UNDER THE QUESTION, ONCE NOTHING IS LEFT TO ASK

top level, before `bibleEnd_`

```
/* ---------- THE LAST LINE UNDER THE QUESTION, ONCE NOTHING IS LEFT TO ASK ---------------------------
   `paperEnd_`'s job for the Bible: say what the strip below holds. Over the cover, the only reason
   there is no question is the index — on its way, or not come.
   ON ITS WAY IS THE ONE LOADER, where the question will be asked. It was "The list of the Bible's
   books is on its way." — a wait in words of its own; the owner, 9 Oct, *"They should all have a
   simplistic simple loading thing while it's info or whatever is loading."* Not come is a fact with a
   way back, and keeps its words. */
```

### THE COVER. One item, for an admin; none for anybody else — which is the whole of what a non-admin's Find knows about it:

top level, before `bibleItems_`

```
/* THE COVER. One item, for an admin; none for anybody else — which is the whole of what a non-admin's
   Find knows about it: no item, no shelf answer, no card, no fetch. Its key is the one the first
   build starred, so a star from then still finds it. */
```

### ---------- NOT BEFORE THE LIBRARY

in `bibleItems_`

```
/* ---------- NOT BEFORE THE LIBRARY ----------------------------------------------------------------
     IT STANDS ON THE RESOURCES SHELVES, AND THE SHELVES ARRIVE WITH THE LIBRARY — the textbooks, the
     boxers and the bouts are all `libraryExtras_`'s, landing with `data/questions.json`. Offered before
     then, it was the only thing on an admin's Find for the seconds the library takes, so the screen
     drew a funnel of one book where it should say "The questions are still coming" (`nothingHere`).
     Measured, not reasoned: `check/states.js`'s `the library still coming` stopped being reachable for
     the admin visitor the day this item arrived. The index is still asked for above, so the books
     are ready by the time the shelf is. */
```

### NO `sub`, AND ONLY THE WORDS EVERY VERSE CARRIES.

in `bibleItems_`

```
/* NO `sub`, AND ONLY THE WORDS EVERY VERSE CARRIES. It had `sub: 'Old and New Testaments'`, which
     its card never drew and which put `testaments` and `and` in its haystack and in no verse's. What a
     search finds it by is `holds` — the verses' words, asked by `bibleHolds_` — which `stuffNarrow_`
     reads in place of the haystack for an item that stands for others. */
```

### ---------- THE COVER, OR A VERSE

top level, before `bibleCard_`

```
/* ---------- THE COVER, OR A VERSE -------------------------------------------------------------------
   ONE KIND, TWO CARDS: `KINDS.bible.card` is this, and a verse is told apart by its `bb`. The cover is
   one ordinary page now — what the book is, how big, and how to get in — where it was a contents page
   with three more behind it. */
```

### THE HOW-TO NEEDS THE INDEX — the translation's name and the counts come from it — so until it is here the cover says what the book is and the one loader holds

in `bibleCard_`

```
/* THE HOW-TO NEEDS THE INDEX — the translation's name and the counts come from it — so until it is
     here the cover says what the book is and the one loader holds the room for the rest. It said
     "Opening the list of books…" on the end of the lede, a wait in words of its own. */
```

### ---------- ONE VERSE, A CARD OF ITS OWN

top level, before `bibleVerseCard_`

```
/* ---------- ONE VERSE, A CARD OF ITS OWN -------------------------------------------------------------
   "each verse is a widget". THE TAGS ARE EVERY CARD'S ROW (`tagRow_`): the translation, the testament,
   the group, and the book, chapter and verse as three answers -- [Genesis] [1] [3] -- each the chip that
   picks it. It was `Verse` in a filled pill and `Genesis 1:3` in one coral tag; neither was an answer.
   Then the verse, in the reading size.
   THE BOOK IS FETCHED WHEN A CARD OF IT IS DRAWN, not when it is chosen: the funnel can arrive at a
   verse by any path, a search or a star, and the card is the one place every path passes. Once a
   visit (`BIBLE.books`), and only the first card to ask sets up the redraw, so twenty cards waiting
   on one book are one fetch, one redraw and — if it fails — one toast. */
```

### ---------- THE TILES UNDER IT

top level, before `bibleTiles_`

```
/* ---------- THE TILES UNDER IT ----------------------------------------------------------------------
   THE COVER'S ONE ACTION IS THE WAY IN — `Open`, which answers the Translation question for you —
   because on Saved, or with a second book on the shelf, the question is not on the screen to answer.
   A VERSE'S IS ITS CHAPTER: from a star, a search or a Verse answer, one tap puts Find in that chapter
   on that verse, the rest of it a swipe either way. Not drawn where it would do nothing — already in
   that chapter with nothing narrowing it further (`bibleHere_`). A book that did not come has
   `Try again`, which is the retry the first build's buttons gave by being pressed again. */
```

### ---------- KEPT ON SAVED

top level, before `bibleKept_`

```
/* ---------- KEPT ON SAVED -----------------------------------------------------------------------------
   A STARRED VERSE IS NOT ON FIND'S LIST, so `collItems_` cannot find it there; its key is its address,
   so it is looked up by arithmetic instead. Only when some kept key IS a verse — Saved must not build
   31,102 items to find that none of them was starred. In the Bible's order, whatever order they were
   starred in. */
```

### ---------- DRAWING IT AGAIN WHERE IT ALREADY IS

top level, before `bibleRedraw_`

```
/* ---------- DRAWING IT AGAIN WHERE IT ALREADY IS -----------------------------------------------------
   THE ANSWER LANDED AFTER THE CARD WAS DRAWN — the index, under the cover, or a book, under its verses.
   Redrawn in place wherever they are (Find and Saved alike, which is why it is the whole document),
   `ansShow_`'s move, the tile row under each with it — the cover's `Open` and a verse's `Try again`
   depend on what just landed — and their panes measured again. */
```

### ---------- INTO THE BIBLE, FROM WHEREVER THE TAP WAS

top level, before `k`

```
/* ---------- INTO THE BIBLE, FROM WHEREVER THE TAP WAS --------------------------------------------------
   THE CHIPS A FINGER WOULD HAVE PRESSED, SET IN ONE GO: the three doors, the translation, and — from a
   verse — its testament, group, book and chapter. Then Find, on the verse the tile was under (the
   chapter is the strip, so the verses either side are a swipe away), or on the question for the cover.
   From Saved this is how a kept verse is read in its chapter; from Find it is how a verse found by a
   search or a Verse answer is. The search box is cleared, because words would narrow the chapter. */
```

### INTO THE FINDER THE TAP WAS IN — a verse's Chapter or the cover's Open pressed in Find 2 stays in Find 2, where the student is reading — and into Find from

top level, before `k`

```
/* INTO THE FINDER THE TAP WAS IN — a verse's Chapter or the cover's Open pressed in Find 2 stays in
   Find 2, where the student is reading — and into Find from Saved or the Spotlight, which are no
   finder (`finderAt_`). Both finders hold the Bible (docs/history/347), so either can open it; the
   one being read in is the one not to take somebody out of. It was "the finder that holds the Bible"
   while the second one held the resources alone (329).
   `What for` and `What kind` are not chips it sets: under `Shelf · Books` the list is the Bible, each
   of the two has one answer over it, so the funnel skips both and a chip for them would be a chip
   nobody could have pressed. */
```

### ---------- A KEPT CARD SAVED CANNOT DRAW WHOLE OPENS IN FIND

top level, before `finderWalk_`

```
/* ---------- A KEPT CARD SAVED CANNOT DRAW WHOLE OPENS IN FIND ---------------------------------------
   SAVED AND THE SPOTLIGHT DRAW A KEPT THING AS ITS CARD (`cardPages_`): a question whole — its opening,
   figure, words and answer — but a practical without its kit, method and worksheet, a project without
   its steps and Share, a textbook without its chapters, a boxer without his fights. So under a kept
   card that is not whole there, `Open` takes it to Find, on its own card, with the rest of it a swipe
   up. It was "Open in Resources" under a resource only (329), because the resources lived in one
   column; with both finders holding everything (347) the line is drawn where it always belonged —
   between a card that is all of itself on the column and one that is not — which also gives the kept
   practicals and projects a way to their method pages that they never had.
   INTO FIND, NOT FIND 2. Saved and the Spotlight are no finder, so neither is "the one the tap was in",
   and Find is the front door of the two. The cost is said in docs/history/347: opening replaces Find's
   chips and words with the walk below — the one place this file puts a finder's place over without a
   press inside that finder.
   THE CHIPS A FINGER WOULD HAVE PRESSED, found by walking the funnel for it: the engine's own next
   question each time (`nextFacet`), answered with this item's own answer, or "Doesn't matter" where
   it has none — until the list is down to it or there is nothing left to ask. Never a chip that would
   lose it: that answer is taken back and the walk stops where the thing is still on the list. `bible-go`
   does the same for a verse by hand, because a verse is not an item on any list. */
```

### WHICH OF A THING'S PAGES A KEPT LIST DRAWS:

top level, before `keptPart_`

```
/* WHICH OF A THING'S PAGES A KEPT LIST DRAWS: the card, a question's own pages — its opening, its first
   pages, its answer — and a practical's drawing (`fig`; a question has no figure page since 356). One predicate, read by `cardPages_` to draw them and
   by `finderOpenTile_` to ask whether the card is whole without them, so "what Saved draws" and "is
   there more than Saved draws" cannot disagree. */
```

### SET WHILE A KEPT LIST IS BEING DRAWN (`keptPages_`, for Saved and the Spotlight), in the way `SPOT_TILES` is:

top level, before `KEPT_DRAW`

```
/* SET WHILE A KEPT LIST IS BEING DRAWN (`keptPages_`, for Saved and the Spotlight), in the way
   `SPOT_TILES` is: a card is drawn by the same `stuffCard` → `cardTiles_` in Find's fill and on Saved,
   both outside any binding, so nothing else tells the two apart. */
```

### THE TILE: under a kept card that is not whole on the column, `Open · in Find` — the column's name from `TABS`, so a renamed column says so.

top level, before `finderOpenTile_`

```
/* THE TILE: under a kept card that is not whole on the column, `Open · in Find` — the column's name
   from `TABS`, so a renamed column says so. Never in a finder (the card is already open there, its
   pages a swipe up), never under a question (whole), and never under the Bible's cover, which has
   its own Open (`bibleTiles_`). */
```

### `finderElsewhere_`, `finderWordsCount_` AND THE `finder-words` TILE WERE HERE:

top level, before `stuffNoneHtml_`

```
/* `finderElsewhere_`, `finderWordsCount_` AND THE `finder-words` TILE WERE HERE: an empty search asked
   the other finder the same words and offered "N in Resources" with an Open tile that carried them
   across (329's review, finding 1), because a boxer's name typed into Find found nothing while he was
   one column along. GONE WITH THE SPLIT (347). Both finders hold the same list, so with no chips the
   other one finds exactly what this one did not — nothing — and under chips the tile would carry the
   words into the column a student keeps a chapter up in AND CLEAR ITS CHIPS: the very place the second
   finder exists to hold. The right advice when chips hide every hit is the sentence below, "take a
   filter off". */
```

### ---------- WHICH PAGES A PRACTICAL TAKES, OFF WHAT THE ROW ACTUALLY HAS

top level, before `pageParts_`

```
/* ---------- WHICH PAGES A PRACTICAL TAKES, OFF WHAT THE ROW ACTUALLY HAS ------------------------
   The card, then a page per section that has something in it. A REFUSED experiment is its card
   alone: it carries no kit and no method by rule (`check-practicals.js` refuses one that does), and
   a worksheet asking somebody to plan an afternoon that has been turned down is inviting exactly
   what the refusal is for. A section with nothing in it is not drawn as an empty page — a page you
   can swipe to that says nothing reads as a fault. Anything that is not a practical is one page. */
```

### ---------- A QUESTION IS ITS WORDS, ITS FIGURE AND ITS ANSWER, in the order they are used

in `pageParts_`

```
/* ---------- A QUESTION IS ITS WORDS, ITS FIGURE AND ITS ANSWER, in the order they are used -------
     ASKED FOR AS *"what I want was answers to be short and to be their own widget"* — the half of 259
     that was left undone on purpose and has now been asked for twice. The figure page (204) is the
     precedent and this is the same move one part along: the answer is the page after the question,
     and after its figure where it has one, because you read the question, look at the picture, and
     only then want the answer. A row with no answer has no answer page — a page that can only ever
     say "nothing here" is the empty page the note below refuses. THIS IS EVERY PAGE A QUESTION HAS;
     which of them the strip draws is the kind chosen -- `Questions` leaves `ans` out and `Answers`
     keeps it alone (`stuffPages_`), so a page that is drawn is always the page it would have been. */
```

### ---------- AND IN THE PAPER'S ORDER, WHICH PUTS THE SHARED OPENING AND ITS FIGURE FIRST

in `pageParts_`

```
/* ---------- AND IN THE PAPER'S ORDER, WHICH PUTS THE SHARED OPENING AND ITS FIGURE FIRST ----------
     ASKED FOR AS *"preserve order of question from exam while at the same time giving diagrams and
     figures their own widget"*. The figure page gathered EVERY picture a part hangs from -- the
     stem's and its own -- and put the lot after the part's words, so Q5(a) of the Statistics paper
     read "is skilled," and then, a page later, the Venn diagram the stem had introduced before it.
     And it did that for every part: six parts, six copies of the stem and six of its figure.

     SO A STEM IS PAGES OF ITS OWN, ITS WORDS WITH ITS FIGURE AMONG THEM (`stemN`), IN FRONT OF THE
     FIRST PART THAT HANGS FROM IT, and the part keeps only what is its own: its words, its own figure,
     its answer. `prev` is the result in front of this one in the strip -- a part whose stem
     the previous part already showed does not show it again, which is how the paper prints it: Q5,
     the diagram, (a), (b), (c). With no `prev` (Saved, a check, a result on its own) every stem is
     drawn, because a part landed on alone still needs the paragraph and the picture it is about. N
     is the stem's place in `x.stems`, so two parts of one question name the same stem the same way. */
```

### ---------- AND NO FIGURE IS A PAGE OF ITS OWN (356)

in `pageParts_`

```
/* ---------- AND NO FIGURE IS A PAGE OF ITS OWN (356) ------------------------------------------------
     IT WAS, from 204 (*"diagrams should be its own widgets"*) and 268/270 (*"text, then diagram, then
     text ... diagram has its own widget"*): a part's figure (`fig`), a stem's (`sfigN`), an earlier part's
     marked picture (`use`) and a gap (`nofig`) were each a page with the part's tags, and a pointer on the
     page before said "Figure on the next page". The owner, 18 Oct, over Q7 of June 2024 1F with its grid a
     page under its words: *"there's also like a graph widget below ... Can you see how sloppy it is?"* So a
     figure is in the card of the question that uses it, among its words where the paper prints it
     (`stemPlan_`, `partPlan_`), and the pages are only words: a stem's (`stemN`, `stemN-J`), a long part's
     first pages (`preJ`), its card (`null`), its answer. 1,598 figure pages went, and 1,064 pointers. */
```

### A CONTENT CARD IS ITSELF AND A PAGE PER ANIMATION, in the file's order:

in `pageParts_`

```
/* A CONTENT CARD IS ITSELF AND A PAGE PER ANIMATION, in the file's order: `an17-pyth` after the
     Pythagoras card. Its words are on the card, so there is no chapter page any more. Saved and
     Spotlight keep the card only (`cardPages_` takes none of these), and give it Open. */
```

### THE PICTURE IS ITS OWN PAGE, straight after the card — "across the board of all resources the diagrams should be its own widgets" (204), and the owner asked

in `pageParts_`

```
/* THE PICTURE IS ITS OWN PAGE, straight after the card — "across the board of all resources the
     diagrams should be its own widgets" (204), and the owner asked for this split himself ("diagram,
     equipment, steps, worksheet bit"). A question's figure went back into its card on 18 Oct (356); that
     word was about questions, so a practical keeps its Diagram page. */
```

### ---------- AND THE CARD WITH ITS FIGURE, FOR A COLUMN THAT LISTS THINGS ONE PAGE EACH

top level, before `cardPages_`

```
/* ---------- AND THE CARD WITH ITS FIGURE, FOR A COLUMN THAT LISTS THINGS ONE PAGE EACH -----------
   Saved and Spotlight draw a kept thing as one page; its picture is its own card now, so it is the
   page after — the same rule as the Find screen. Only the figure: a practical kept on Saved is its
   card and its drawing, as it was, not the kit, the method and the worksheet too.
   AND A KEPT QUESTION'S ANSWER, which is the same kind of page as its figure: part of the question
   rather than a section of a guide. IN `pageParts_`'s ORDER, filtered rather than listed again,
   because "Show the answer" turns forward by the answer's place in that list — on Saved as on Find
   — and two lists of one question's pages would be two chances to disagree about where it is. */
```

### ---------- SAVED AND SPOTLIGHT DRAW A QUESTION'S OPENING ONCE, AS FIND DOES

top level, before `keptPages_`

```
/* ---------- SAVED AND SPOTLIGHT DRAW A QUESTION'S OPENING ONCE, AS FIND DOES -----------------------
   THE MULTI-PART AUDIT, FINDING 8: keep both parts of 1F Q8 and Saved read opening, figure, (i), its
   answer, then opening, figure, (ii), its answer -- every kept part was drawn as though it had been
   landed on alone. 270 questions, 741 extra pages; AQA A-level Physics 3A Q2 was 20 pages on Find and
   35 on Saved.

   SO THE KEPT PARTS OF ONE QUESTION ARE DRAWN TOGETHER, in the paper's order (`sortKey_`), each told
   the part in front of it -- `pageParts_`'s own rule for a stem the previous part already showed. In
   the place the first of them holds in the list, so nothing else on the column moves. A part kept on
   its own still has its opening in front of it, because nothing in front of it showed it. Its answer
   stands where `pageParts_` puts it either way -- after the card and any figure page after it, a swipe on,
   as on Find with no kind chosen. */
```

### `on('prac-guide')` WAS HERE and is gone with the tile that opened it.

top level, before `BOXER_FLAG`

```
/* `on('prac-guide')` WAS HERE and is gone with the tile that opened it. It looked the practical up
   by `x.key` through `stuffItemsAll_()` rather than by id into `DATA.practicals`, and that half is
   worth carrying forward: the card came from that list, so a second lookup would have been a second
   reader of one thing — see `reelPages_` and `factsNow_`. Nothing looks anything up now; the card
   already holds the row it is drawing. */
```

### `filmCard_` WAS HERE — a film's card in Find, a title, its flags and a link out to Drive.

top level, before `BOXER_FLAG`

```
/* `filmCard_` WAS HERE — a film's card in Find, a title, its flags and a link out to Drive. It went
   with the films (the owner, 10 Oct: *"films should not appear in the finder it cannot be found
   there"* — see where `film` was in `KINDS`). What it argued is the videos card's to carry now, and
   it does: a film opens Drive and is never played in the app, and a series opens its folder. */
```

### THE FIGHTER'S PROFILE — A TALE OF THE TAPE, AND HIS FIGHTS ON THE PAGE AFTER IT.

top level, before `BOXER_FLAG`

```
/* ==================================================================================================
   THE FIGHTER'S PROFILE — A TALE OF THE TAPE, AND HIS FIGHTS ON THE PAGE AFTER IT.

   ASKED FOR AS *"can you refine the boxers widget. maybe add image of each boxer. and make it look
   nicer. the wins losses etc. my mate's a boxer and i want to impress him."* The card it replaces
   was a name, a line and `56-5-0 · 37 KO` in small gold mono — every fact a boxer is judged by, in
   the size this app keeps for a footnote. So the record is the centrepiece now, and the rest is
   arranged the way a fight broadcast arranges it: the face and the name, the record, the tape.

   THE CARD, IN THIS ORDER:

     the photo        BESIDE the name, a 4:5 portrait in the left two-fifths, the way a fight poster
                      or a trading card sets a fighter. It comes after the head in the markup and is
                      placed by the grid in style.css, so a screen reader hears the name before the
                      picture and every Find card still opens on its `.fc-head`, which is what
                      `check-flow`'s shared-parts journey asks of all of them. NOT FULL WIDTH,
                      measured: a 4:3 photo across the card put the profile at 1,480px on a 390px
                      phone, and 102 of the 103 rows have no photo — so it would have been the
                      placeholder, 225px tall, on nearly every page.
     the head         the shared one: `Boxer` above the name, the nickname under it in quotes.
     country, weight  the sub-line, with a flag where the country is one this file can name.
     status           Active, Retired or Deceased, each with the years that status is about.
     THE RECORD       won, lost, drawn (and no contests when there were any) as the biggest numbers
                      on the page, the stoppages under the two columns they belong to, one bar for
                      the split and the KO rate under it.
     the tape         age or born and died, height, reach, stance, the weights, the career — only
                      the rows a cell answered, so a sparse row is a short tape, not a form of blanks.
     titles           the belts in the sheet's own words, the Hall of Fame and lineal as badges.

   AND ONE PAGE AFTER IT, `fights` (see `boxerPart_`): who he beat and who beat him, then every bout
   in `data/fights.json` he is in, newest first. A PAGE, NOT MORE CARD, because the owner's rule for
   every widget is that it fits its screen — *"I don't like scrolling ... This goes for all widgets so
   they all fit on screen"* — and Ali's fourteen bouts are a screen on their own. It is the
   practicals' answer to the same problem ("Split into widgets"): the next page in the strip, one
   flick away, headed with whose page it is.

   EVERY CELL CAN BE BLANK. Eight rows have no record (fourteen did at first), sixty-nine no stance,
   a hundred and two no photo; each part below says what it does with nothing, and the answer is
   always to leave the part out rather than print a dash or a nought — see the `libNum` note in
   library.js for the record a blank once turned into `0-0-0`.
================================================================================================== */
```

### ---------- A FLAG FOR THE COUNTRY, WHERE THE COUNTRY IS ONE OF THESE

top level, before `BOXER_FLAG`

```
/* ---------- A FLAG FOR THE COUNTRY, WHERE THE COUNTRY IS ONE OF THESE -----------------------------
   THE SHEET HOLDS A NAME (`USA`, `UK`, `Puerto Rico`) AND A FLAG IS A PAIR OF LETTERS, so something
   has to join them, and a table is the honest version: every country the file uses today and the
   ones a new row is likely to add. A country not here gets its name and no flag, which is a complete
   answer rather than a broken one — there is no guessing a code from a name.
   `UK` IS GB, because that is the flag; England, Scotland and Wales have flags of their own that are
   tag sequences most phones draw as a plain black flag, so they are not offered. */
```

### TWO REGIONAL-INDICATOR LETTERS ARE A FLAG, which is the whole of the encoding.

top level, before `boxerFlag_`

```
/* TWO REGIONAL-INDICATOR LETTERS ARE A FLAG, which is the whole of the encoding. A computer with no
   flag glyphs (Windows is one) draws the two letters instead — `US` beside `USA` — which still says
   it, so there is nothing to detect and nothing to fall back from. */
```

### ---------- A DATE AS A FIGHT POSTER WRITES ONE

top level, before `BOXER_ISO`

```
/* ---------- A DATE AS A FIGHT POSTER WRITES ONE ---------------------------------------------------
   `1 Oct 1975`, through `parseWhen` — which reads an ISO date field by field, the fix recorded over
   it for a date that came out eleven years wrong. A cell that is not an ISO date is printed as it
   was typed rather than dropped: "c. 1900" is still worth showing. */
```

### TWO LETTERS FOR THE PLACEHOLDER:

top level, before `BOXER_PARTICLE`

```
/* TWO LETTERS FOR THE PLACEHOLDER: first and last name, `Muhammad Ali` → `MA`; one word gives one
   letter. Letters only, so nothing in a name can reach the drawing as anything but text. A `Jr.` or
   a `III` is not a surname — Floyd Mayweather Jr. is `FM`, not `FJ`.

   AND A SURNAME CAN START WITH A PARTICLE. "Oscar De La Hoya" came out `OH`, because the last word
   was taken as the surname — and his surname is De La Hoya, which a corner banner writes as `DLH`
   and an initial writes as `D`. So the surname starts at the first De / La / Del / Van / Von /
   Da / Di / Du / Le / Der / Den after the first name, and its first letter is the second initial:
   `OD`. A particle as the FIRST word is a first name and is left alone. */
```

### ---------- THE BOXER IN A BOUT'S CORNER

top level, before `boxerOf_`

```
/* ---------- THE BOXER IN A BOUT'S CORNER ----------------------------------------------------------
   BY ID, THEN BY NAME, which is `fightCard_`'s order and for its reason: an id beats a name because
   a name is a cell somebody can edit, and the name is still the fallback because 53 corners have no
   id yet — the opponents nobody has written a row for. */
```

### ---------- HIS BOUTS, NEWEST FIRST, EACH ONE READ FROM HIS SIDE

top level, before `boxerBouts_`

```
/* ---------- HIS BOUTS, NEWEST FIRST, EACH ONE READ FROM HIS SIDE ----------------------------------
   A CORNER IS HIS BY ID, OR BY NAME ONLY WHERE THAT CORNER HAS NO ID. Name alone would hand his
   fights to any second row somebody typed with the same name and another id; an id that is present
   always decides, so the two can never disagree.

   W, L, D OR NC FROM THE WINNER — by id where the row has one and by name where it does not,
   `fightCard_`'s rule again. A bout with no winner is a draw unless its result says no contest.

   NEWEST FIRST, the opposite of how `libraryExtras_` sorts `DATA.fights` (oldest first, so a
   rivalry reads in order). A fighter's page is read from where his career ended, the way every
   record is printed; a rivalry from where it began. Both are right, so the copy is sorted here and
   the shared list is left alone. */
```

### HOW IT ENDED, as a record writes it:

top level, before `boxerHow_`

```
/* HOW IT ENDED, as a record writes it: `TKO 14`, `UD 15`, `KO`. The round a stoppage came in; for a
   decision the distance, which is the scheduled rounds when nobody wrote an end round. A stoppage
   with no round is the method alone — a scheduled distance beside a KO would read as the round it
   happened in, and that is a fact nobody wrote down. */
```

### ---------- THE RECORD BAR'S WIDTHS, WHICH ADD UP TO A HUNDRED EXACTLY

top level, before `boxerSplit_`

```
/* ---------- THE RECORD BAR'S WIDTHS, WHICH ADD UP TO A HUNDRED EXACTLY ----------------------------
   EACH SEGMENT ROUNDED ON ITS OWN DRIFTS: three thirds at two places are 99.99. The last segment
   takes whatever the others left, so the bar always ends at the right-hand edge and `check-flow`
   can ask for 100 rather than for "about 100". */
```

### ---------- THE PHOTO, OR A RING WITH THE BOXER IN IT, AT EIGHT BITS

top level, before `BOXER_LOOK`

```
/* ---------- THE PHOTO, OR A RING WITH THE BOXER IN IT, AT EIGHT BITS ------------------------------
   A FREE PHOTOGRAPH IS FREE ON A CONDITION: its author and licence are named wherever it is shown.
   So a photo is drawn only WITH its credit, and a row with an address and no credit gets the
   placeholder — the card cannot be made to show a Commons picture unattributed, whatever the sheet
   says. `check-library.js` refuses such a row as well, so it is caught before it ships rather than
   quietly hidden after.

   THE PLACEHOLDER IS ALWAYS IN THE BOX, under the photo. Before the photo arrives it is what the
   box shows, so nothing jumps and nothing sits grey; if the photo never arrives, `boxerPicFail_`
   takes the `<img>` out and it is all that is left. Never a broken-picture icon.

   THE BOXER IN IT LOOKS LIKE HIM NOW, AS FAR AS ANYBODY CAN SAY. Until 10 Oct he was nobody: the
   loading screen's gold fighter, the same paths for all 103, and this comment argued that a stand-in
   that looked like a person would be a picture of the wrong man. The owner, 10 Oct: *"make the
   boxers retro avatar actually look more like the boxers and their shorts in the fight."* The answer
   to the old worry is that a likeness here is only what sources show — his skin, from six tones; his
   hair, as one of thirteen small pixel shapes in one of eight colours; a moustache, goatee or beard
   over the face; and his TRUNKS, the colours he usually wore on his profile and the colours of THAT
   NIGHT on a fight card, the trim as the waistband and a side stripe — drawn at eight bits, which is
   enough to tell Ali's white-and-black from Frazier's green-and-gold and not enough to pretend to be
   a portrait. Every filled cell has its source beside it in the file (`look_source`,
   `trunks_source`). A fight's trunks are written only where the source names THAT bout. The looks are
   labelled UNVERIFIED in `look_source`: they were judged from memory of published photographs, and no
   photograph was opened — the first thing to check, row by row, against a picture.

   A BLANK CLAIMS NOTHING, and blanks are where nobody can say: a fight on black-and-white film, a
   fighter who changed trunks every night, a hairline no source describes. That rule was paid for in
   the review of 10 Oct, which found the old stand-in's parts making claims once they stood beside a
   described man: its PAPER SKIN AND GOLD HAIR made Cleveland Williams, Trevor Berbick and Andy Ruiz a
   pale blond man in their own trunks next to Ali, Tyson and Joshua, and its GOLD TRUNKS WITH AN INK
   WAISTBAND read as a researched gold-and-white pair on 80 profiles. So:

     no row at all        a SILHOUETTE — skin and hair in one shadow tone (`--bf-ghost`), neither a
                          skin colour nor a hair colour; still in that night's trunks where a source
                          names them, because that much IS known.
     no trunks on file    the corner's colour MUTED (`--bf-unsaid-l` / `-r`), a dusky ochre or slate
                          that no trunks word uses, with a waistband one shade darker in the same
                          colour and no side stripe — trunks, plainly unrecorded, not a pair of gold
                          ones with a white trim.
     no hair colour       on a described fighter, his own skin a shade darker (`boxerFigure_` says why).

   A WOMAN IS DRAWN AS A WOMAN. Nine rows are `sex` F, and the guard pose is a bare torso; until the
   review she was that torso in her own skin — Taylor's ponytail, Martin's pink trunks, topless. She
   wears a top now (`BOXER_BODY.top`, in her trunks' colour), and a woman with no hair on file is not
   given the men's short cap but hair drawn back from the face (`BOXER_HAIR_UNSAID`). A corner with no
   row is a woman when the other corner is one: a bout is fought between two women or two men.

   IT NO LONGER MIRRORS THE SPLASH. The figure began as `tools/boxing.py`'s guard pose, painted by
   the loading screen's `.bx-*` rules; that splash taught nothing and went on 10 Oct (docs/history/322),
   and the card did not lose its fighter with it — the last `.bx-*` rules went with the merge. So the ring, the figure and every colour they use are the
   card's own — `bf-*` here, and under `.boxer-ring` in style.css — and nothing the loading screen
   does can change them. His initials over the ropes still say whose page it is. */
```

### ---------- THE WORDS A LOOK MAY USE, AND THE ONLY ONES

top level, before `BOXER_LOOK`

```
/* ---------- THE WORDS A LOOK MAY USE, AND THE ONLY ONES -------------------------------------------
   ONE LIST, READ TWICE. The figure draws exactly these, and `check-library.js` cuts this constant out
   of this file to refuse any cell in data/boxers.json or data/fights.json that is not one of them —
   because a misspelt colour would otherwise draw the corner's colour, silently, which looks exactly
   like a fight nobody researched. A trunks cell is `<main>` or `<main>/<trim>`: "white/black" is
   white trunks with a black waistband and stripe, "gold" is gold all over. */
```

### ---------- THE GUARD POSE, AS ROWS OF GAME PIXELS

top level, before `BOXER_BODY`

```
/* ---------- THE GUARD POSE, AS ROWS OF GAME PIXELS ------------------------------------------------
   `y:x0-x1,x2` — row y, pixels x0 to x1 and x2 — on the grid the old guard paths were drawn on, so
   the fighter stands exactly where and how he did: facing right, the head at x 5–11 over rows 1–6
   (the face is x 7–11, the eye at 10,4, the chin's front at 9,6), the waistband row 13, the trunks
   14–16. THE SIDE STRIPE RUNS DOWN THE NEAR LEG, x 5: drawn down the middle, as it was first, it met
   the gap between the legs and read as the gap reaching up, not as a stripe. Written as runs rather than as path strings because a hair style is a SET of pixels laid
   over the head, and a set of runs is something a person can read and edit; `boxerRuns_` turns them
   into the same `M x y h w v1 h-w z` the old paths were. Painted in order, each over the last — the
   whole head in skin first, then the hair over it — so a style that leaves a pixel out (a faded
   side, a cornrow's parting) shows the scalp there without any subtraction. */
```

### EACH HAIR STYLE IS ITS OWN SHAPE, and has to read as that style at this size or it is not worth a word of its own:

top level, before `BOXER_HAIR`

```
/* EACH HAIR STYLE IS ITS OWN SHAPE, and has to read as that style at this size or it is not worth a
   word of its own: BALD AND SHAVED ARE THE HEAD ALONE (no hair drawn at all); SHORT is the old
   stand-in's cap; CROP-TOP is a cap on top with the back faded to skin; FLAT-TOP is squared off two
   rows above the head; the AFRO is taller and wider all round; CURLY bumps along its top; WAVY has
   a forelock over the brow and falls to the collar; SLICKED lies flat and sweeps back past the
   crown; LONG falls to the shoulders; a PONYTAIL hangs off the back; CORNROWS show the scalp
   between two rows; DREADS hang as separate locks with the background between them. Rows above 1
   are above the old head — `-2` is two pixels higher — which the ring has room for under the
   initials. */
```

### HAIR NOBODY DESCRIBED, AND NOT A WORD OF THE VOCABULARY:

top level, before `BOXER_HAIR_UNSAID`

```
/* HAIR NOBODY DESCRIBED, AND NOT A WORD OF THE VOCABULARY: what the figure draws when `look_hair` is
   blank. A man keeps the old stand-in's short cap. A WOMAN DOES NOT — the cap read as a man's haircut
   on Laila Ali, Shields, Holm and the others with no hair on file — so hers is drawn back from the
   face to a knot at the nape, which is how hair is worn in a ring and claims no style beyond that. */
```

### FACIAL HAIR, OVER THE FACE, in his hair colour.

top level, before `BOXER_FACE`

```
/* FACIAL HAIR, OVER THE FACE, in his hair colour. The moustache is the upper lip; a goatee is that
   and the chin; a beard is the jaw from the ear to the chin with the mouth left clear; stubble is the
   beard's pixels at a shadow's strength (`.bf-stubble`); sideburns run down in front of the ear. */
```

### ---------- A TRUNKS CELL, READ: `{ main, trim }`, OR NOTHING

top level, before `boxerTrunks_`

```
/* ---------- A TRUNKS CELL, READ: `{ main, trim }`, OR NOTHING --------------------------------------
   A WORD OUTSIDE THE LIST IS NOTHING, NOT HALF A PAIR. "whte/black" does not draw black-trimmed gold
   trunks; it draws the corner's colour, the same as a blank, and `check-library.js` is what says the
   cell is wrong. A trim the same as the main colour is not a trim. Folded to lower case, as a cell
   typed by hand may not be. */
```

### ---------- THE FIGHTER: ONE RENDERER, FROM A LOOK AND A PAIR OF TRUNKS

top level, before `boxerFigure_`

```
/* ---------- THE FIGHTER: ONE RENDERER, FROM A LOOK AND A PAIR OF TRUNKS ----------------------------
   `look` is the mapper's `{ skin, hair, hairColour, facial }` (js/library.js) and `trunks` a cell as
   above; either may be blank or missing, part by part. The blue corner is the same drawing mirrored
   about the middle of the ring, so he faces his opponent.

   THE COLOURS ARE NOT HERE. Each part is a class — `bf-skin`, `bf-hair`, `bf-trunks` — and the
   group says which of the figure's own colours it takes through a custom property, `--bf-skin:
   var(--bf-s4)`; style.css names those colours on `.boxer-ring` and says, for any property not set,
   what a part nobody recorded is — a colour that claims nothing (the silhouette, the muted corner).
   The group also carries the words as classes — `bf-sk-s4`, `bf-hs-short`, `bf-tk-white`,
   `bf-tt-black` — which style nothing and say, to `check-flow` and
   to anybody reading the markup, what was drawn. A beard is drawn in the hair colour — black a
   deeper black on the face than on the head (style.css says why). `bf-f` is a woman: `sex` F.

   A HAIR COLOUR NOBODY STATED, ON A MAN WE CAN OTHERWISE DESCRIBE, IS HIS OWN SKIN A SHADE DARKER
   (`.bf-seen` in style.css) — a shape without a colour. The old stand-in's grey on Deontay Wilder's
   skin read as a grey-haired man, and its gold in the blue corner as a blond one: both claims, made
   by a fallback. The shadow claims only that there is hair there, and it is the same for a beard
   under a shaved head (Hagler, Hopkins), whose colour no cell holds either. A fighter with no look at
   all is not `.bf-seen`: he is the silhouette. */
```

### THE RING, SIDE ON: two posts, three ropes, the pads in each corner's colour, the mat and the apron, and his initials over the top rope like the name on a

top level, before `boxerRing_`

```
/* THE RING, SIDE ON: two posts, three ropes, the pads in each corner's colour, the mat and the apron,
   and his initials over the top rope like the name on a corner banner. 40 by 50 game pixels, which
   is the portrait frame's own 4:5, so the drawing fills it without letterboxing; the fight card's
   square corner crops five pixels off the top and the bottom, which is sky and apron. `crispEdges`
   keeps every pixel square at any size. The fighter stands on whole pixels — a half-pixel offset is
   a blurred boxer. THE MIDDLE ROPE IS RED AND HAS ITS OWN CLASS, not `bf-rope` with a variant laid
   over it: two rules of one weight on one element, separated only by which comes later in the file,
   is the contest check/cascade.js exists to refuse.

   THE FIGHTER STANDS IN THE DARK, NOT IN THE STAGE LIGHT. `bf-stage` is the arena behind the ring
   from just above his head to the mat, in `--bf-stage`: the colour every one of his own colours is
   chosen to show against, by at least 2:1 (check/states.js measures it). The gold light behind the
   initials now stops above the top rope; until 10 Oct's review it reached his head, and there it sank
   the deepest skin (Joshua, Foreman, Liston) and black hair into a warm brown murk. Raising the backdrop
   instead was the other way out, and it does not work here: the middle skin tones and the grey and
   silver trunks are the backdrop's own brightness then, and would vanish the way black did. */
```

### AN ADDRESS THAT ALREADY FAILED ON THIS PHONE IS NOT ASKED FOR AGAIN.

top level, before `BOXER_PIC_DEAD`

```
/* AN ADDRESS THAT ALREADY FAILED ON THIS PHONE IS NOT ASKED FOR AGAIN. A repaint redraws the card,
   and without this every repaint would put the `<img>` back, watch it fail and take it out — the
   placeholder flickering behind a picture that is never coming. */
```

### THE ADDRESS A CARD MAY SHOW, or nothing.

top level, before `boxerPicSrc_`

```
/* THE ADDRESS A CARD MAY SHOW, or nothing. `https` only — the site is served over it and a plain
   `http` picture is blocked as mixed content, which is a broken box by another route. A Drive link
   goes through `pic` like every other picture in the app. */
```

### `corner` IS THE FIGHT CARD'S:

top level, before `boxerPic_`

```
/* `corner` IS THE FIGHT CARD'S: 'a' or 'b', the same frame and the same placeholder, square and
   small, with no caption of its own — the fight card gathers its credits into one line under both
   faces. The blue corner's fighter faces left, toward his opponent, and the winner's frame is gold.

   WHICH TRUNKS: on his profile, the pair he usually wore (`trunks_usual`); in a fight's corner, the
   pair from THAT fight (`trunks_a` / `trunks_b`), passed in as `trunks` — and a fight with no word on
   them is the corner's colour, muted, NOT his usual pair, because "he usually wore white" is not a
   source for what he wore that night. The look and the sex are his row's either way; an opponent with
   no row has no look, and the sex `fightCard_` gives him. */
```

### THE CREDIT IS A LINE OF ITS OWN UNDER THE PHOTO AND THE NAME, NOT A CAPTION IN THE PHOTO'S COLUMN.

in `boxerPic_`

```
/* THE CREDIT IS A LINE OF ITS OWN UNDER THE PHOTO AND THE NAME, NOT A CAPTION IN THE PHOTO'S
     COLUMN. As a `<figcaption>` it was four lines in a 134px column on a 320px phone — the photo's
     column ran 80px past the name's, the record started that much lower, and Ali's profile was drawn
     at 82% to fit, which put the credit itself at about seven pixels. Across the card it is two
     lines, the column ends with the photo, and the credit sits directly under the picture it names.
     The grid puts it there: it is the next element after the photo, so it takes the row below. */
```

### ---------- THE CREDIT LINKS TO THE PHOTO'S FILE PAGE

top level, before `BOXER_COMMONS`

```
/* ---------- THE CREDIT LINKS TO THE PHOTO'S FILE PAGE --------------------------------------------
   THE CREDIT WAS PLAIN TEXT — "Photo: <author>, <licence>, via Wikimedia Commons" — which is enough
   for a public-domain picture (Ali's is one) and NOT enough for the CC BY and CC BY-SA ones waiting
   to be added: those licences ask for the author, the licence AND a link to where the work and its
   licence can be read, "in any reasonable manner based on the medium". On a web page the reasonable
   manner is the credit being that link. So it is one, to the Commons file page — which names the
   author, the licence and the licence's own text in one place, and is the page the owner opens to
   check a photo before trusting it.

   BUILT FROM THE PICTURE'S OWN ADDRESS, NOT STORED. An `upload.wikimedia.org/wikipedia/commons/`
   address carries the file's name — `…/8/89/Muhammad_Ali_NYWTS.jpg/480px-…` for a thumbnail, the
   name before the size — so the page is `commons.wikimedia.org/wiki/File:<that name>`. A second
   column would be a second thing to keep in step with the first; this cannot drift. An address
   that is not Commons (a Drive photo somebody took) has no such page and its credit stays text —
   `check-library.js` refuses a CC licence on any picture that is not a Commons file, so a licence
   that needs the link always has one.

   A 44px BLOCK, NOT A LINK THE SIZE OF ITS SMALL PRINT. It is a tap target like any other, and
   `check/ui.js` measures it as one — see `.boxer-credit a` in style.css. */
```

### A PICTURE THAT DID NOT COME LEAVES THE RING.

top level, before `boxerPicFail_`

```
/* A PICTURE THAT DID NOT COME LEAVES THE RING. `error` does not bubble, so this listens in the
   capture phase, once, for the whole document — `postVidFail_`'s shape in posts.js. The credit goes
   with the picture: a credit under a placeholder names a photograph nobody can see. */
```

### THE CREDIT FOR THIS PICTURE GOES, BY ITS ADDRESS — on the profile it is the line under the photo, on a fight card one of two, so it is found by `data-src`

in `boxerPicFail_`

```
/* THE CREDIT FOR THIS PICTURE GOES, BY ITS ADDRESS — on the profile it is the line under the photo,
     on a fight card one of two, so it is found by `data-src` rather than by where it sits, and a
     line left with no credit in it goes too. */
```

### ---------- WHAT HE IS NOW, AND THE YEARS THAT GO WITH IT

top level, before `boxerStatus_`

```
/* ---------- WHAT HE IS NOW, AND THE YEARS THAT GO WITH IT -----------------------------------------
   EACH STATUS CARRIES THE YEARS IT IS ABOUT: an active fighter the year he started, a retired one
   the year he stopped, a dead one the years he lived. The career's whole span is the tape's
   `Career` row, so this line never repeats it. A status the sheet does not use is printed as typed,
   with no years rather than wrong ones. */
```

### ---------- THE RECORD

top level, before `BOXER_EDITOR_NOTE`

```
/* ---------- THE RECORD ---------------------------------------------------------------------------
   THE NUMBERS ARE THE CENTREPIECE AND THE ONLY BIG TYPE ON THE PAGE. Won in gold, lost in the
   ring's red, drawn in the quiet ink — the way a record is always coloured, from this app's own
   tokens, named on the card itself (`--boxer-w` and friends in style.css). No contests get a column
   only when there were any: a fourth `0` is noise beside three numbers that matter.

   KOs UNDER THE COLUMN THEY BELONG TO, and only when the cell says: `37 KO` under the wins, `1 KO`
   under the losses. A blank `losses_ko` prints nothing, never `0 KO`.

   THE BAR IS AN SVG, and that is not decoration: its segments' widths are attributes, so they add
   up to a hundred where a check can read them, and the card carries no `style` — which the
   shared-parts journey refuses on every Find card. `preserveAspectRatio="none"` stretches it to the
   card's width.

   NO RECORD ON FILE SAYS SO. Eight fighters have none today — six old-timers whose records are
   disputed by design, and two current ones nobody has entered — and a line saying that is the
   truth; three noughts would be a claim. */
```

### ---------- A NOTE TO THE EDITOR IS NOT A NOTE TO THE READER

top level, before `BOXER_EDITOR_NOTE`

```
/* ---------- A NOTE TO THE EDITOR IS NOT A NOTE TO THE READER --------------------------------------
   THE `notes` CELL HOLDS TWO KINDS OF THING and the card printed both. Most qualify the record —
   "Exhibition bouts excluded", "Record disputed — newspaper-decision era" — and belong under it. The
   rest are the researchers' to-do list: "ACTIVE — record needs checking" under Usyk's 24-0, "Date
   of death needs checking" under Ricky Hatton's, "Retirement announced more than once — check"
   under Fury's. Five of them were on public cards, in the place a fighter's own record is
   qualified, and to a boxer they read as the site doubting its own numbers.

   THE WORD IS THE SIGN. Every to-do in the file says `check` or `checking` and no qualifying note
   does, so a note that says either is the editor's and is not drawn. Not cleared from the sheet:
   it is still the to-do somebody has to do, and `check-library.js` lists every row carrying one
   so it is a list rather than a silence. */
```

### THE DATE THE COUNT WAS TAKEN, FOR A FIGHTER STILL FIGHTING.

in `boxerRecord_`

```
/* THE DATE THE COUNT WAS TAKEN, FOR A FIGHTER STILL FIGHTING. His is the one record that goes out
     of date; a retired man's `record_as_of` is the day he stopped, which the status already says. A
     line of its own under the numbers' line rather than a third clause on it: on a 320px phone the
     three together broke in the middle of the date. */
```

### ---------- THE WEIGHTS HE BOXED AT, SAID IN ONE LINE WHEN THERE ARE MANY

top level, before `BOXER_LADDER`

```
/* ---------- THE WEIGHTS HE BOXED AT, SAID IN ONE LINE WHEN THERE ARE MANY ----------------------------
   EIGHT WEIGHTS WERE SIX LINES. Pacquiao's row listed every division from Flyweight to Light
   Middleweight, wrapped down the right-hand half of the tape on a 320px phone, and was the single
   biggest reason his profile was drawn at 72% to fit its pane — measured over all 103 fighters, it
   was the tallest row on every card that shrank most. A fan says "an eight-division champion,
   flyweight to light middleweight", so the card does: the count, the lightest and the heaviest.

   THREE OR FEWER ARE LISTED, because "Featherweight, Super Featherweight, Lightweight" is two lines
   and every name in it is the answer; four is where the list starts costing more than it says.

   LIGHTEST AND HEAVIEST BY THE SCALE, NOT BY THE CELL'S ORDER. Every row today is typed light to
   heavy, but a cell is a thing somebody types, and "Heavyweight, Cruiserweight" read first-to-last
   would say Heavyweight → Cruiserweight. The ladder below puts them in order; a weight it does not
   know leaves the cell's own order alone rather than guessing where it goes. */
```

### ---------- THE TALE OF THE TAPE

top level, before `boxerTape_`

```
/* ---------- THE TALE OF THE TAPE -----------------------------------------------------------------
   THE ROWS A BROADCAST SHOWS BEFORE THE FIRST BELL, in its order, and only the ones a cell
   answered — a `dl`, because each is a label and its value, which is exactly what a description
   list is. Age for the living and the years for the dead, never both: "aged 74" beside a death date
   is the age he reached, and an age counted to today for a man who died in 2016 would be a number
   about nobody. */
```

### ---------- THE BELTS AND THE HONOURS

top level, before `boxerTitles_`

```
/* ---------- THE BELTS AND THE HONOURS ------------------------------------------------------------
   THE TITLES ARE THE SHEET'S OWN SENTENCE — "WBA, WBC, The Ring heavyweight (three reigns)" —
   because splitting it into belts would lose the reigns and the years written inside it. The Hall
   of Fame and the lineal title are yes-or-no facts, so they are badges, and gold, because on this
   card gold is what a fighter won.

   "TITLES" OVER A HALL OF FAME BADGE AND NOTHING ELSE SAID "NO BELTS". `world_titles` was blank on
   77 of the 103 rows — Tyson, Mayweather, Holyfield, Leonard, Hearns, Durán among them — and on 56
   of those the section still drew, because the Hall of Fame badge is in it. Read by a boxer, a
   heading called Titles with no title under it is the claim that the man never won one. The
   heading is what is under it: Titles when the sheet names a belt, Honours when all it holds is an
   honour. The blank cells are being filled, and this is what keeps the next blank one honest. */
```

### THE BADGES RIDE ON THE HEADING'S LINE, at its right, the way a broadcast pins "HALL OF FAME" to the corner of a fighter's caption.

in `boxerTitles_`

```
/* THE BADGES RIDE ON THE HEADING'S LINE, at its right, the way a broadcast pins "HALL OF FAME" to
     the corner of a fighter's caption. They had a row of their own under the belts, and on a
     320x568 phone that row was one of the reasons fifty profiles were drawn smaller to fit. */
```

### ---------- THE BOUTS ON FILE

top level, before `BOXER_BOUTS_PAGE`

```
/* ---------- THE BOUTS ON FILE --------------------------------------------------------------------
   ONE LINE A BOUT, the way a record is printed: the result in a square, the opponent, then how and
   when under the name. It is the library's bouts and not his whole career — the famous fights, 157
   across everybody — so the heading counts the ones HERE rather than posing as the record, which is
   the box above it. A title fight says so, because that is the first thing a fan asks of a bout.

   THE RESULT IS SAID IN WORDS AND SHOWN AS A LETTER. It was `aria-label` on the square — and an
   `aria-label` on a plain `<span>`, which has no role, is ignored by most screen readers, so they
   read "W" or nothing. The square is hidden from them now and a word they DO read stands in its
   place, off the screen (`.boxer-say`): "Won, Larry Holmes". */
```

### COUNTRY, THEN THE WEIGHT HE IS KNOWN AT, ONE LINE EACH.

in `boxerCard_`

```
/* COUNTRY, THEN THE WEIGHT HE IS KNOWN AT, ONE LINE EACH. They were one line joined by a dot, and
     beside the photo the column is 134px on a 320px phone: "Ukraine ·" ended one line and
     "Heavyweight" began the next, the dot hanging off the country it does not belong to. */
```

### `.boxer-rec` IS STILL THE RECORD'S NAME, on the whole record box now rather than on one gold line.

in `boxerCard_`

```
/* `.boxer-rec` IS STILL THE RECORD'S NAME, on the whole record box now rather than on one gold
     line. `check/states.js` looks for it under What kind · Content to prove no boxer leaked in, so the
     name has to go on meaning "a boxer's record is drawn here". */
```

### ---------- HIS FIGHTS, THE PAGE AFTER HIS CARD

top level, before `boxerHasFights_`

```
/* ---------- HIS FIGHTS, THE PAGE AFTER HIS CARD ---------------------------------------------------
   ONLY WHEN THERE IS SOMETHING ON IT. A page that can only say "nothing here" is the empty page
   `pageParts_` refuses for a question with no answer, so a fighter with no notable names and no
   bouts on file is his card and nothing else — which is twenty of them today. */
```

### ---------- AND AS MANY PAGES OF THEM AS IT TAKES, SEVEN BOUTS A PAGE

top level, before `boxerFightPages_`

```
/* ---------- AND AS MANY PAGES OF THEM AS IT TAKES, SEVEN BOUTS A PAGE -----------------------------
   ONE PAGE HELD EVERY BOUT, AND ON A REAL SMALL PHONE THAT DID NOT FIT. Measured at 320x568 — an
   iPhone SE, not the 320x844 the first screenshots were taken at — Ali's fourteen bouts and his six
   names were drawn at exactly `PANE_ZOOM_MIN`, 70%, with the method and the date at about six
   pixels; Pacquiao's twelve at 73%. A fighter with fifteen on file would have run past the floor
   and scrolled, which is the one thing the owner's rule for every widget forbids — *"I don't like
   scrolling ... This goes for all widgets so they all fit on screen"*.

   SO THE BOUTS ARE PAGED, newest first across the pages: `fights`, then `fights2`, `fights3`, as
   `pageParts_` lists them. SEVEN, MEASURED: the first page also carries who he beat and who beat
   him, and seven bouts under six names is what fits a 320x568 pane at full size. It is also the most
   any fighter but Ali and Pacquiao has, so for everybody else nothing changes — one page, as before. */
```

### HEADED WITH WHOSE PAGE IT IS, as every part page is — `.fc-kick` and then the page's own `h3` — because it is somewhere you can land from a flick four results

top level, before `boxerPart_`

```
/* HEADED WITH WHOSE PAGE IT IS, as every part page is — `.fc-kick` and then the page's own `h3` —
   because it is somewhere you can land from a flick four results away. A page after the first
   says it continues, so a flick that lands on it is not mistaken for the start of his record. */
```

### `typeset_` — A FRACTION IS DRAWN OVER ITS LINE, AND A POWER IS RAISED.

top level, before `typeset_`

```
/* ==================================================================================================
   `typeset_` — A FRACTION IS DRAWN OVER ITS LINE, AND A POWER IS RAISED.

   ASKED FOR AS "refine questions in the finder to make sure they are looking right e.g. no x2 or
   x^2, it should look how its supposed to look ... same with fractions. it shouldnt be 4/5 it
   should be 4 over the five like how it is supposed to be."

   THE LIBRARY STORES A FRACTION AS `<sup>4</sup>&frasl;<sub>5</sub>` -- 442 rows in 100 papers --
   and the card drew it exactly as stored: a small raised 4, a slanted bar, a small lowered 5. A
   comment in style.css called that form "right for a bare fraction inside a sentence". That was a
   builder's choice and never the owner's, and the owner has now said which one is right: on this
   site a fraction looks the way the paper prints it, numerator over a bar over denominator.

   AT DRAW TIME, NOT IN THE STORE, and that is deliberate rather than lazy. The stored shape is
   load-bearing somewhere other than the screen: `tools/set-accept.py` reads `2<sup>2</sup>&frasl;`
   as "a digit, then a numerator, so the digit is a whole number" when it writes `accept`, and that
   one rule is two wrong-mark faults long (docs/history 026 -- `22/15` for 2 2/15). Rewriting 442
   rows into spans would hand that tool a shape it has never seen. The marker reads `accept` and
   nothing else, and this function is never shown `accept`, so no mark can move because of it.

   WHAT IT DOES, IN THE ORDER IT DOES IT:

     x^2, x^(n+1), 10^-3   a caret IN TEXT becomes a raised power. Never inside a tag, so an
                           attribute holding a `^` is not rewritten into markup; never inside an
                           <svg>, whose text is not prose. `e^(4x^2)` is a power with a power in
                           it, so the string is read again from the caret it just replaced.
     <sup>a</sup>&frasl;<sub>b</sub>
                           stacked: a over a rule over b. The same for U+2044 and `&#8260;`,
                           which are the same character written two other ways.
     3<sup>4</sup>&frasl;<sub>5</sub>
                           a MIXED NUMBER, the whole part kept on the fraction's line by
                           `.frac-mixed`. A whole number before the numerator is the library's
                           own convention, the one set-accept.py relies on -- not a guess made here.
     3x<sup>2</sup>&frasl;<sub>(x + 2)</sub>
                           NOT a mixed number: the superscript after a letter is a POWER, so the
                           numerator is the whole term 3x² and not the 2. Q12(a) of the June 2020
                           Paper 3 answer is written exactly so, and the first draft of this
                           stacked "2 over (x + 2)" with a 3x standing outside it -- a different
                           expression, and a wrong one, that looked perfectly typeset.
     (x + 1) &frasl; 3     the operands either side of a bare slash are the TERMS touching it --
                           a bracket, an element, a run of letters and digits -- because an
                           expression has no markup saying where its numerator starts.
                           `sin B &frasl; 6.5` takes the `sin` with it; a numerator of `B` alone
                           would draw sin(B/6.5).

   ONE PAIR OF BRACKETS ROUND A WHOLE NUMERATOR OR DENOMINATOR GOES, because a stacked fraction's
   rule is the bracket: `(n − 1) over (n + 1)` is how a calculator writes it, not how a paper
   prints it. Only when the pair encloses the WHOLE operand -- `(x + 2)(x − 4)` keeps both.

   WHAT IT LEAVES ALONE: a slash INSIDE a superscript (`A<sup>1/3</sup>`, `1.3<sup>1&frasl;6</sup>`)
   is a fractional index, and a stacked fraction at superscript size is unreadable on a phone --
   the paper sets those inline too. And anything it cannot read both sides of is left exactly as
   it came, slanted, which is what it was yesterday: a fallback, not a fault.

   A HIDDEN SLASH BETWEEN THE TWO HALVES (`.frac-s`), so a screen reader says "4 slash 5" rather
   than "4 5", and copying the question pastes 4/5 rather than 45.

   ONE FUNCTION, EVERY PLACE QUESTION MARKUP IS DRAWN: the stems, the lead, the part, the answer
   and each tapped choice. `node js/check-typeset.js` cuts it out of this file and runs it over
   every row of the library, and `check-flow` asks a real card whether all five came out stacked.
================================================================================================== */
```

### A CHARACTER A TERM MAY BE MADE OF:

in `typeset_`

```
/* A CHARACTER A TERM MAY BE MADE OF: digits, letters, Greek, the root and infinity, primes, the
     degree sign, the superscript digits a pasted ² arrives as, and the vulgar fractions. NOT the
     full stop -- that is taken only between two digits, so `10.7.` ends a sentence after the 7. */
```

### ---------- THE ANSWER: SHOWN, THEN SPLIT BY WHO WAS READING, AND NOW ONE PAGE FOR EVERYBODY

top level, before `answerParts_`

```
/* ---------- THE ANSWER: SHOWN, THEN SPLIT BY WHO WAS READING, AND NOW ONE PAGE FOR EVERYBODY ----------
   THIS WAS ARGUED BOTH WAYS HERE, AND BOTH ARGUMENTS WERE ABOUT A TUTOR AND A STUDENT BEING DIFFERENT
   READERS. First the answer was open under every question, because a tutor reads the mark scheme FROM
   this surface and a fold is a tap in the middle of a sentence being spoken. Then a second reader was
   recognised -- a student on the tutor's phone, for whom an open mark scheme is the answer printed
   under the question -- and the card turned on who was signed in: open for staff, shut behind a tap
   for a student, opening itself on a right answer.

   THE OWNER SETTLED IT FROM THE OTHER SIDE OF A LESSON: *"you should have to click to reveal the
   answer. Should behave the same whether it's a tutor or child. No difference between the two."* In the
   lesson both readers were looking at one phone, so "who is signed in" was never the question -- the
   reveal belongs to whoever is holding it, and it is one tap for everybody (`ansOpen_`). And *"remove
   all 'why's. I just want it to have answer"*: the page is the result alone (`answerBlock_`).

   THE ANSWER GOES IN RAW, THROUGH `typeset_`, which is not an oversight. A question is typeset --
   fractions, indices, tables -- and an answer is the same material: `S(r.answer)` on the backend keeps
   whatever was written, and it comes from the owner's own spreadsheet, the same trust as the question.

   NOTHING AT ALL WHEN THERE IS NO ANSWER. A page that says "Answer" and opens on emptiness is worse
   than no page: it says one exists. */
```

### ---------- THE RESULT, AND THE REASON FOR IT, AS TWO THINGS

top level, before `answerParts_`

```
/* ---------- THE RESULT, AND THE REASON FOR IT, AS TWO THINGS ---------------------------------------
   ASKED FOR AS "make answers breaifer", and when asked to choose between shorter written answers
   and hiding the working behind a tap: "i want shorter answers." Measured before this was written:
   4,309 answers, median 88 characters, 1,019 over 200 and the longest 1,677. A card whose answer is
   a page of prose has not told you the answer; it has given you something to read to find it.

   THE LIBRARY ALREADY SAID WHERE THE ANSWER STOPS. 3,107 answers are written as a short result, a
   SPACED em dash, then the explanation -- the result's median length is six characters. So the
   split is the library's own convention read back, not a summary made up here: everything before
   the first spaced dash is the answer, and everything after it is why. The answers that had no dash
   and ran long were rewritten into that shape (tools/answer-brief.py), so ONE rule covers them all.

   ONLY A SPACED DASH. An unspaced one is a range (`8–9`) or part of a word, and an en dash between
   spaces is the same punctuation typed on a different keyboard, so both count.

   NOT INSIDE A TABLE OR A LIST. A dash in a cell is that cell's business; splitting there would
   hand the result half a table. Inside inline tags (or a <p>) it is still the answer's own dash,
   and the tags open at that point are closed on the head and reopened on the why, so neither half
   is broken markup -- `<b>18 — B1</b>` would otherwise leave a bold open across the fold.

   THE MARK-SCHEME CODES COME OFF WHAT IS SHOWN. B1, M1, A1, P1, C1, cao, oe, ft, isw, awrt are how
   an examiner apportions marks, and "18 000 B1 cao" reads to a child as part of the answer. They go
   from the head entirely. In the why they go only where they stand alone ("B1 cao.", "M1 A1,");
   "M1 for 360 − 220 − 90" keeps its code, because without it the sentence is "for 360 − 220 − 90"
   and says nothing. Every one of the 122 rows that carry codes was read with this applied.

   ONE FUNCTION, CUT OUT BY NAME by `check-answers.js`, so the limit that check holds is measured
   on exactly what this draws -- not on a second opinion of where an answer ends. Which is also why
   everything it needs is declared inside it. */
```

### THE HEAD: every code, wherever it stands, and the commas it leaves behind.

in `answerParts_`

```
/* THE HEAD: every code, wherever it stands, and the commas it leaves behind. The A-level
     schemes count marks in brackets instead -- "(1)", "(1 mark)", "[1]", a tick -- and those go
     too, but only after a space: `1.1(1) × 10³` is a significant figure in brackets, not a mark. */
```

### THE WHY: only the codes that stand alone.

in `answerParts_`

```
/* THE WHY: only the codes that stand alone. A code is KEPT where the sentence needs it: "M1 for
     …", "C1, following through …", "earns the B1 on its own", "and “oe”" -- strip any of those and
     what is left is a sentence about nothing. A removed run leaves a mark (\u0002) so the clean-up
     below touches only the places something was taken from, and never a `.31` that happens to
     start a line. */
```

### ---------- THE ANSWER, AND NOTHING ELSE

in `answerBlock_`

```
/* ---------- THE ANSWER, AND NOTHING ELSE ------------------------------------------------------
     ASKED FOR AS *"Also remove all 'why's. I just want it to have answer."* -- the owner, after an
     hour tutoring a student through June 2024 Paper 1 Foundation from this page. The working sat
     under a "Why" fold (259) with the examiner's note beside it; both are gone from the page.

     THE HEAD ONLY, AND `answerParts_` STILL SAYS WHERE IT STOPS. That function is the one definition
     of the result -- `check-answers.js` cuts it out by name and measures every library answer through
     it -- so this draws `p.head` and never `p.why`. Not a second rule here about where an answer ends.

     THE EXPLANATION STAYS IN THE DATA, deliberately. `answer` whole and `examiner_note` beside it are
     what "Mark with AI" sends as the scheme (`aiScheme_` in keypad.js reads the row, not this markup),
     and the working is exactly what a marker needs. Neither is drawn. A head that does not answer on
     its own ("Yes", "Shown") is a data fault, and the data workflow is rewriting those rows rather
     than this code guessing at them -- `check-answers.js` prints how many are left. */
```

### OPENING ONE SHOWS THE STEM, THE LEAD AND THE PART — in that order, because that is the order it is printed and because a part without them cannot be answered.

top level, before `ROMAN_ONLY`

```
/* OPENING ONE SHOWS THE STEM, THE LEAD AND THE PART — in that order, because that is the order it
   is printed and because a part without them cannot be answered. This is the whole reason the stem
   is a row of its own rather than a copy on each part. */
```

### ---------- `on('question')` WAS HERE

top level, before `ROMAN_ONLY`

```
/* ---------- `on('question')` WAS HERE ------------------------------------------------------------
   It opened the stem, the lead and the part over the top of a card showing the first 96
   characters of the part. All three are on the card now. See `questionCard_` above.
--------------------------------------------------------------------------------------------- */
```

### ---------- WHAT A PART IS CALLED

top level, before `ROMAN_ONLY`

```
/* ---------- WHAT A PART IS CALLED ------------------------------------------------------------
   THREE HABITS, ONE COLUMN. Edexcel letters its parts (5b) and nests roman numerals inside them
   (5a i); AQA numbers them (01.1). All of it arrives in `part` as the bare token — b, ai, 1 —
   because the sheet stores what the paper says and not how to print it.

   SO THE JOINING IS DONE HERE, and it cannot be a concatenation: "Q5" + "ai" is Q5ai, which reads
   as one word and is what no paper calls it, and "Q1" + "1" is Q11, which is a different question
   altogether.

   A LONE i, v OR x IS A NUMERAL, NOT A LETTER. Both are possible and only one has ever happened —
   lettering reaches i at the ninth part and no paper here has more than six. */
```

### The name on a card: Q1.1 · Q5b · Q5a(i) · Q1.3(i)

top level, before `NUM_ROMAN`

```
/* The name on a card: Q1.1 · Q5b · Q5a(i) · Q1.3(i)

   A NUMBERED PART WITH NUMERALS UNDER IT — AQA's 01.3(i), which the library spells `3i` once a card
   asking two things became two cards (8 Oct, "one card, one answer"). Without this line it fell
   through to the bare spelling and the card read "Q13i": question thirteen, part i. */
```

### `qPartShow_` WAS HERE — the marker down the left of an open question, "1) · b) · a(i)".

top level, before `paperIdOf_`

```
/* `qPartShow_` WAS HERE — the marker down the left of an open question, "1) · b) · a(i)". It was
   declared, never called, and differed from `qPartName_` twelve lines above only in a trailing
   bracket. Two functions one letter apart doing almost the same thing is the `childrenOf` /
   `childNamesOf` trap CLAUDE.md records, and this one had no callers to be wrong about yet. */
```

### ---------- ONE READER FOR THE PAPER'S ID

top level, before `paperIdOf_`

```
/* ---------- ONE READER FOR THE PAPER'S ID ---------------------------------------------------------
   THREE NAMES WERE IN USE for one column — `paper`, `paperId`, `paper_id` — and the backend sends
   the third spelling of the three: `paper: S(r.paper_id)`. `questionItems` read all three and was
   fine. `allTopics` read only two, so `id` came out empty on every row, every row was skipped, and
   THE PAPER LIST WAS ALWAYS EMPTY.

   WHAT THAT COST is not a missing paper list — it is that every question then looked up its paper
   in an empty object and got `{}` back, so all 181 of them carried no subject, no name, no board,
   no tier and no year. The funnel could not ask "which subject" of a question because no question
   had one, and with boxers the only things left under Learning that could answer it, the one-answer
   rule skipped the question entirely and dropped you straight on Boxers or Fights.

   So it is one function now, read in all three places. This is the same fault `pid` was written to
   fix, left half-fixed: a second reader of the same column is a second chance to spell it wrong. */
```

### ---------- THE ORDER OF A QUESTION'S PARTS, DECIDED FOR THE WHOLE QUESTION AT ONCE

top level, before `romanVal_`

```
/* ---------- THE ORDER OF A QUESTION'S PARTS, DECIDED FOR THE WHOLE QUESTION AT ONCE -----------------
   THE PART WAS SORTED AS LETTERS, and three traps sat in that (the multi-part audit, finding 13 --
   none live in the bank today, all one transcription away): "ix" sorts before "v", part 10 before
   part 2, and "bi" beside "b(ii)" reads b(ii), b(iii), bi.

   AND A NUMERAL IS NOT ALWAYS A NUMERAL. "i" is part (i) of Q8 and the ninth letter of a question
   that runs a to j; "xi" is eleven, or (x)(i). Sorting numerals by value everywhere fixes "ix" and
   breaks h, i, j. So the reading is decided ONCE PER QUESTION, from every part it has: a question
   whose every part is a numeral on its own (i, ii ... ix, x, xi) is numbered in numerals and sorts
   by value; any other is lettered, and each part is its letter then its numeral's value --
   brackets and spaces dropped first, so "b(ii)" and "bii" are the same part, which also makes a
   mixed spelling sort right (`check-library.js` still refuses one: the data should not say it two
   ways). Digits are padded the way `padNums_` pads them, so part 10 follows part 9.

   Keyed by the row, so `questionItems` reads one map; a question's rows are grouped by paper and
   number, which is exactly what makes them one question. */
```

### THE DECISION ITSELF, ONE PER QUESTION AND KEYED BY THE ROW:

top level, before `partNumerals_`

```
/* THE DECISION ITSELF, ONE PER QUESTION AND KEYED BY THE ROW: does this question number its parts in
   numerals? Its own function because two readers need the same answer -- the sort key below and the
   tag split (`partSplit_`) -- and a second copy of the rule would let W-CBM-time Q4's `i` be the ninth
   letter in the order and a numeral on the card. */
```

### ---------- A PART, TAKEN APART FOR ITS TAGS: `ai` IS [a] [ii]

top level, before `qSplitOf_`

```
/* ---------- A PART, TAKEN APART FOR ITS TAGS: `ai` IS [a] [ii] ----------------------------------------
   THE OWNER, 12 Oct: Q1a(ii) is three tags, [Q1] [a] [ii]. `part` is the Part answer (a letter, or
   AQA's `.1`, the way the card has always printed it -- `Q1.1`) and `sub` the Sub-part (a numeral).
   THE SAME READING `partKeyOf_` MAKES, branch for branch, with the question's own numeral decision
   (`partNumerals_`), so a lone `i` in a question running a to j is a letter here as it is in the sort.
   Measured over the library: letter 2,717, AQA digit 1,195, letter + numeral 209, digit + numeral 119,
   numeral alone 37 -- and nothing that does not split, which `check-library.js` holds. `null` for a
   part that will not split, so the check can count them rather than the card guessing. */
```

### AN ITEM'S SPLIT: the one `questionItems` worked out with its question's numeral decision, or -- for an item built anywhere else, a harness's or a kept copy's

top level, before `qSplitOf_`

```
/* AN ITEM'S SPLIT: the one `questionItems` worked out with its question's numeral decision, or -- for an
   item built anywhere else, a harness's or a kept copy's -- the part read alone, where a lone `i` is a
   numeral (`qPartBits_`'s reading: lettering reaches i only at a ninth part). */
```

### ---------- WHAT A QUESTION IS ABOUT, AS WORDS

top level, before `companyAtoms_`

```
/* ---------- WHAT A QUESTION IS ABOUT, AS WORDS -----------------------------------------------------
   THE SEARCH BOX COULD NOT SEE INSIDE A QUESTION. `hay` was name, sub, subject, slot and grade —
   and a question's name is `Q5b`. So of three thousand rows, not one was findable by what it is
   actually about: `momentum`, `surds`, `refraction`, `half-life` all returned nothing while the
   questions sat there. Somebody revising thinks in topics, not in paper numbers, and the funnel is
   a taxonomy — you have to already know where a thing lives to reach it.

   BUILT ONCE, NOT PER KEYSTROKE. The obvious version strips the HTML inside the filter, which runs
   for every item on every letter typed — three thousand regexes a keystroke. This runs when items
   are built and hangs the result on the item, so typing only compares strings.

   TAGS OUT, ENTITIES BACK. `&amp;` in a haystack means searching for `&` finds nothing and
   searching for `amp` finds everything. */
```

### THE PUBLISHER'S NAME IN BOTH SPELLINGS, because the file holds one and people type the other.

top level, before `companyAtoms_`

```
/* THE PUBLISHER'S NAME IN BOTH SPELLINGS, because the file holds one and people type the other.
   `company` was normalised to `1st Class Maths` on all 1,481 rows — see the spelling-vote note —
   and the squashed form `1stclassmaths` is what that publisher writes on its own sheets and what
   somebody copying a filename types. A substring search cannot see through a space, so one of the
   two would find 1,370 and the other 325 coincidental hits, which reads as the search half-working.

   `spellKey_` IS ALREADY THE REDUCTION, so this is that function and not a second opinion about
   what a spelling is. Two tokens per item, built once when the item is. */
```

### ---------- THE CODE PRINTED ON THE COVER, WHICH THE SEARCH BOX COULD NOT SEE

top level, before `specIndex_`

```
/* ---------- THE CODE PRINTED ON THE COVER, WHICH THE SEARCH BOX COULD NOT SEE -------------------
   MEASURED ON THE REAL LIBRARY, at the Find screen, through the box itself:

     | typed          | hits |
     |----------------|------|
     | `1MA1`         | **0** |
     | `8464`         | **0** |
     | `8464/B/1H`    | **0** |

   `1MA1` IS EDEXCEL'S CODE FOR GCSE MATHS AND IT IS ON THE FRONT OF EVERY ONE OF THOSE PAPERS —
   *Pearson Edexcel Level 1/Level 2 GCSE (9-1) ... Paper reference 1MA1/1H*. A tutor holding the
   paper types what is printed on it, and the library holds 26 papers under ids that literally spell
   it (`P-1MA1-2306-1H`). Same for `8464/B/1H`, which is in a `spec_code` cell on all 126 rows of
   the four AQA Combined Science papers.

   FOURTH OCCURRENCE OF THIS FILE'S OWN SENTENCE, after `topics`, after `company` and after the
   practical guides: the words are in the row, the search box cannot see them, and a screen whose
   whole job is finding things returns nothing for the thing it holds.

   TWO SOURCES, BECAUSE NEITHER COVERS THE OTHER. `spec_code` is a real cell on 92 document rows
   (every AQA science and English paper) and empty on every Edexcel maths one; the qualification
   code for those is in the `paper_id` and nowhere else. Measured across the 266 papers that have
   questions, the id rule yields 29 distinct codes — `1MA1` on 26 papers, `9MA0` on 2, `8464B`,
   `8464C`, `1CMP` — and the spec cell covers the rest.

   THE SEGMENT RULE IS 4 TO 8 CHARACTERS WITH BOTH A LETTER AND A DIGIT, which is what a
   qualification code looks like and what an internal id does not. `P-1MA1-2306-1H` gives `1MA1`
   and nothing else: `2306` is digits only, `1H` is two characters, `P` is one. And the cap at
   eight is what keeps `RS1786302107764-481` out — a fifteen-character serial nobody types, which
   as one token shared by two hundred papers would have made `rs17` return a third of the library.

   BOTH SPELLINGS, exactly as `companyAtoms_` does and for its reason: `8464/B/1H` is what is
   printed and `8464b1h` is what a thumb types when the slashes are in the way.

   WHAT IS STILL DARK IS DATA RATHER THAN THIS RULE. 187 papers carry no code either way. Most are
   Corbettmaths and 1st Class Maths worksheets, which have no exam code to carry; the real backlog
   is the ~94 Edexcel maths papers filed under `RS...` serials and the 20 AQA Religious Studies
   ones, which are 1MA1 and 8062 papers with nothing on the row saying so. One `spec_code` cell
   each, and they join this the moment it is typed. */
```

### THE CODE IS A FACT ABOUT THE PAPER, so it is read off the paper's own row rather than copied onto every question under it.

top level, before `specIndex_`

```
/* THE CODE IS A FACT ABOUT THE PAPER, so it is read off the paper's own row rather than copied
   onto every question under it. CLAUDE.md settles this under `needs`: "Calculator is a fact about
   the PAPER ... writing it onto every question row would be a thousand chances for row 4 to
   disagree with row 3." This is `needsIndex_` one column along, built once per draw.

   FROM `LIBRARY_ROWS`, THE FILE ITSELF, RATHER THAN FROM `DATA.questions`. `libraryInto_` drops
   every row whose `active` cell is not true, and 53 of the 128 document rows that carry a code are
   marked inactive — so the mapped list holds 174 document rows against the file's 691, and reading
   the index off it found the code for 75 papers and missed the rest in silence. `paperLabels_` is
   built the same way and for the same reason, which CLAUDE.md records outright: "The first version
   read `DATA.questions`, which carries only 170 of the 262 papers' document rows."

   AND `active` IS THE RIGHT CELL TO IGNORE HERE. It says whether a student may open the document;
   it has nothing to say about what is printed on its cover, and letting it decide would make the
   search box go quiet on a paper somebody is holding. */
```

### ---------- MARKUP INTO WORDS, IN ONE PLACE

top level, before `plainText_`

```
/* ---------- MARKUP INTO WORDS, IN ONE PLACE ------------------------------------------------------
   LIFTED OUT WHEN THE PRACTICALS NEEDED IT. A question's haystack is built from `html` and `lead`;
   a practical's is built from a dozen plain columns — but a `&frasl;` or a `<b>` in either is the
   same thing to a person typing into the search box, and two copies of that list of entities is
   two chances for one of them to be handled in one haystack and not the other. Same sentence this
   file writes about `documents_()`, `factsNow_` and `childrenOf`. */
```

### `practicalText_` — THE GUIDE IS WHAT SOMEBODY IS LOOKING FOR, AND THE SEARCH COULD NOT SEE IT.

top level, before `practicalText_`

```
/* ==================================================================================================
   `practicalText_` — THE GUIDE IS WHAT SOMEBODY IS LOOKING FOR, AND THE SEARCH COULD NOT SEE IT.

   MEASURED BEFORE IT WAS WRITTEN: **0 of the 57 practicals carried a `text` at all.** The haystack
   in `stuffFind` is `name + sub + subject + slot + grade + text`, so a practical was findable by
   its title and by nothing else. `goggles`, `thermistor`, `nichrome`, `foil`, `tray` and `limiting
   reactant` each returned NOTHING, and every one of those words is in the row somebody was looking
   for. The handful of words that did hit — `bicarbonate`, `trundle`, `chromatography` — hit the
   NAME, which is a coincidence rather than a search: the volcano happens to be called "Volcano —
   bicarbonate and vinegar".

   THIS IS THE `topics` FIX AND THE `company` FIX ONE DATA FILE ALONG, and the sentence is the same
   both times: the words are in the row and the search box cannot see them, so a screen whose whole
   job is finding things returns nothing for the thing it holds. There it was one column; here it is
   the whole ROW — the kit, the method, the hazards, the variables and the science. It is the row
   rather than the guide, and that gap is deliberate: the guide draws five things now and the
   haystack still holds all of it, so a word can be findable and drawn nowhere. See CLAUDE.md.

   BUILT ONTO THE ITEM, NOT MATCHED PER KEYSTROKE, which is what those two notes also say:
   `stuffItems` is memoised on the payload and runs once, and `stuffFind` runs on every letter.

   A REFUSED EXPERIMENT IS SEARCHABLE TOO, deliberately. Those five rows exist so that a tutor
   asking why they are not burning magnesium ribbon finds the answer instead of an absence — and a
   reason nothing can search for is an absence with a row behind it. */
```

### THE KIT IS `{name, qty}` NOW AND BOTH HALVES GO IN.

in `practicalText_`

```
/* THE KIT IS `{name, qty}` NOW AND BOTH HALVES GO IN. `equipment` was a list
                        of strings and is a list of objects, so a bare `.join` here would have put
                        `[object Object]` into the haystack of all 82 practicals — every kit word
                        this file's own note says it exists to make findable (`goggles` 13,
                        `nichrome` 2, `stopwatch` 18) gone in one line, silently, because a haystack
                        cannot report what is missing from it. The quantity goes in beside the name
                        because `250 ml` is a thing somebody types. */
```

### `projectText_` — `practicalText_`'s move for the projects:

top level, before `PROJ_SUBJECT_SAID`

```
/* `projectText_` — `practicalText_`'s move for the projects: `podcast`, `stop-motion`, `bearing`
   and `alt text` are words somebody types, and they are only ever in the summary, the steps and
   the kit. Both halves of a kit line, for the `[object Object]` reason written above. */
```

### A COURSEWORK IS LOOKED FOR BY ITS NAMES, whether or not its row happens to say them:

top level, before `PROJ_SUBJECT_SAID`

```
/* A COURSEWORK IS LOOKED FOR BY ITS NAMES, whether or not its row happens to say them: `coursework`,
   `NEA` (what a school calls it now) and `non-exam assessment` are what somebody types, and the board
   and the spec are how a parent holding the letter from school looks. Written here rather than into
   each row, so the next coursework is found by them without its writer having to remember.

   `NEA` ON ITS OWN FINDS IT AND DOES NOT FIND IT FIRST. The search is a substring test shared by
   every kind (`stuffNarrow_`), so `nea` is also inside `near`, `nearest` and `linear`: measured, 335
   results with the coursework 82nd of them. `nea coursework` puts it first, and `non-exam` finds it
   among six. Ranking whole words above parts of words is a change to every kind's search, not to
   this one's, and is not made here. */
```

### ---------- THE NAMES A SUBJECT GOES BY IN A TIMETABLE

top level, before `PROJ_SUBJECT_SAID`

```
/* ---------- THE NAMES A SUBJECT GOES BY IN A TIMETABLE -----------------------------------------------
   THE OWNER'S OWN WORD FOUND NOTHING: "i did dt graphics coursewoork", and `dt` gave 43 results
   without the coursework among them (`dt` is inside `width`, which is how a website project got
   in), while `d&t` gave none at all. The row
   says `Design and Technology`, which is the subject's name and not what anybody calls it.

   KEYED ON THE SUBJECT, NOT WRITTEN INTO A ROW, so every Design and Technology project is found by
   them. One entry today, `SHEET_BUCKETS`'s shape: the next subject with a short name (`PE`, `food
   tech`) is one line here. Only a project's haystack reads it -- the D&T textbook is not found by
   `d&t` either, and that is the textbooks' search to change, not this. */
```

### AND EVERY HYPHENATED WORD AGAIN WITHOUT ITS HYPHEN.

in `projectText_`

```
/* AND EVERY HYPHENATED WORD AGAIN WITHOUT ITS HYPHEN. The owner wrote `cutout`, the row says
     `cut-out`, and the search found nothing -- the same with `stopmotion` and `freestanding`. (Not
     `3d`: `3-D Shapes` is a topic, and the topics join the haystack beside this, not through it.)
     Both spellings are in use and a row can only print one; `cut out`, two words, already matched,
     since every word is looked for separately. Appended, so the row's own spelling still matches. */
```

### `paperText_` AND ITS MEMO WERE HERE.

top level, before `stemLetter_`

```
/* `paperText_` AND ITS MEMO WERE HERE. It folded every question's words into its PAPER's search
   haystack, so typing `surds` found the paper rather than nothing — which was necessary exactly
   because the thing in the list was a document with none of its own words on it. The list is the
   questions now and `searchText_` matches each one's own text, plus its stem's. See
   `questionItems`. */
```

### ---------- EVERY PAPER, DERIVED FROM ITS OWN QUESTIONS

top level, before `stemLetter_`

```
/* ---------- EVERY PAPER, DERIVED FROM ITS OWN QUESTIONS -------------------------------------------
   THERE IS NO `resources` TAB ANY MORE. It has moved to another spreadsheet and the backend does not
   read it, so the checklists branch that used to build this list has nothing behind it.

   A PAPER IS NOW A GROUP OF QUESTIONS THAT SHARE A `paperId`, and its paper-level facts — the name,
   the subject, the board, the wave — ride on every part. That is a denormalisation and it is worth
   naming as one: the same ten fields are repeated on all eight or nine rows of a paper, and nothing
   stops row four disagreeing with row three.

   SO THE FIRST PART WINS, and disagreement is reported rather than resolved. `paperMismatches()`
   typed into the console names any paper whose parts do not agree, which is the only defence a
   repeated fact has. Picking silently would make a typo on one row invisible for ever.

   IT COSTS ONE PASS over the questions rather than a lookup per card — four hundred cards each
   scanning two hundred rows is eighty thousand comparisons to draw one screen. */
```

### `allTopics()`, `topicBy`, `paperText_`, `paperPages_` AND `paperMismatches()` WERE ALL HERE.

top level, before `stemLetter_`

```
/* ==================================================================================================
   `allTopics()`, `topicBy`, `paperText_`, `paperPages_` AND `paperMismatches()` WERE ALL HERE.

   THEY WERE THE COLLECTION. `allTopics` built one object per DOCUMENT — 642 of them — out of
   `dropdowns.checklists` unioned with a derivation off the question rows, and everything else here
   hung off that: `topicBy` looked one up by id, `paperText_` folded every question's words into its
   paper's haystack so searching `surds` found the paper, `paperPages_` guessed a page count from a
   mark total, `paperMismatches` reported parts of one paper disagreeing about a paper-level fact.

   THE COLLECTION IS GONE AND THIS IS THE THIRD ATTEMPT AT IT, WHICH IS THE POINT. A document and
   the questions inside it answer the SAME facets — the paper's board, tier, year and wave are
   copied onto every question row, deliberately, and CLAUDE.md explains why. So choosing
   Edexcel · 2022 · Higher returned the paper AND its parts, two kinds of thing in one list, and
   each fix made it worse in a new way:

     the paper drawn once as a cover and again once per question;
     then the cover with the WHOLE paper printed under it, on every card in the results list;
     then a cover you had to open, which is a search result you cannot read without a tap.

   None of those was the drawing. A screen for finding a question should list questions.

   NOTHING IS LOST THAT WAS BEING USED. The facets that narrow to a paper — subject, key stage,
   tier, exam board, year, exam wave — are on the question rows themselves, so the funnel reaches
   the same place and then keeps going. `searchText_` still matches the question's own words, which
   is what `paperText_` was faking at the document level.
================================================================================================== */
```

### ---------- ONE ITEM PER PART

top level, before `stemLetter_`

```
/* ---------- ONE ITEM PER PART ---------------------------------------------------------------------
   A STEM IS NOT AN ITEM. It is the shared wording above several parts — "George throws a ball at a
   target 15 times" — and nobody searches for one; it is looked up when a part is drawn and never
   listed in its own right. That is the whole reason it is a row of its own rather than a copy on
   each part.

   AND NEITHER IS A `kind: 'paper'` ROW. Those are the 642 document rows, which is what this screen
   has just stopped listing. `libraryInto_` already drops them from `DATA.questions`; the test is
   here too because a row arriving with the wrong `kind` should fall out rather than draw as a
   question with no text, no marks and no answer.

   EVERY PAPER-LEVEL FIELD IS ALREADY ON THE ROW. Board, tier, key stage, year, wave, company,
   subject — copied down onto every question when the two tables were folded together, which is the
   fact that makes this function short and makes the document unnecessary. */
```

### A PREAMBLE IS ONE IDEA AT THREE SCOPES, NOT THREE FEATURES.

top level, before `stemLetter_`

```
/* ==================================================================================================
   A PREAMBLE IS ONE IDEA AT THREE SCOPES, NOT THREE FEATURES.

   A QUESTION IS RARELY JUST ITS INSTRUCTION. "Work out the size of angle x" is unanswerable on its
   own; what makes it a question is the paragraph above it, and that paragraph belongs at whichever
   level it was printed at:

     THE PAPER      "Answer all questions in the spaces provided." Rare, and real.
     THE SECTION    AQA's English Language papers put an unseen EXTRACT in front of Section A and
                    every question in that section refers to it. It is not question 3's text, it is
                    the section's, and questions 1 to 4 all need it.
     THE QUESTION   "ABCDE is a pentagon." Shared by parts (a), (b) and (c) — one paragraph the
                    three of them hang from, which is why it cannot live on any one of them.
     THE PART       `lead` — "George now throws the ball 250 times." This part's own, never shared.

   THE MODEL WAS HALF BUILT AND HALF NAMED. A question-scope preamble was a `kind: 'stem'` ROW; a
   part-scope one was a `lead` COLUMN; and there was no way at all to say "this belongs to the
   section", which is precisely what the next set of papers going in needs. Two mechanisms for one
   idea is the fault this repository has recorded three times under other names — `kinds` and
   `widgets` in two files, `link` against `source_url`, `childrenOf` declared twice.

   SO THE SCOPE IS READ OFF THE ROW rather than declared in a column, which means no migration and
   no default to get wrong: a stem row that names a question belongs to that question, one that
   names only a section belongs to the section, and one that names neither belongs to the paper.
   Every one of those columns is already on every row.

   `lead` STAYS A COLUMN, and that is not an inconsistency. Everything above is SHARED, so it has to
   live in one place that several parts point at or the copies can disagree. A lead is one part's
   own, always, so a row of its own would be a join with exactly one member on each side.

   MEASURED BEFORE BUILDING: 9 stem rows, 29 parts reached by one, 341 parts with a lead, and 368
   question numbers carrying more than one part. So the shape is real and thinly populated — filling
   it in is transcription work on rows that exist, not a change here.
================================================================================================== */
```

### ---------- A SCOPE HOLDS SEVERAL PREAMBLES, AND IT USED TO HOLD EXACTLY ONE

top level, before `stemLetter_`

```
/* ---------- A SCOPE HOLDS SEVERAL PREAMBLES, AND IT USED TO HOLD EXACTLY ONE ----------------------
   EVERY LINE HERE WAS `at.section[key] = r` AND THE SECOND ROW WON. Measured before changing it,
   by putting three insert rows into one section scope and asking the real app what reached the
   cards: three went in, ONE came out, and it was the last one. Parts 1 and 2 were discarded with
   nothing logged, nothing thrown and nothing on screen -- so an insert split in the spreadsheet
   lost two thirds of itself and looked like it had worked. That is this repository's oldest shape
   one more time, and the reason it had never been noticed is that nobody had yet had a reason to
   write a second row in one scope.

   AN AQA ENGLISH INSERT IS THE REASON TO. The paper prints one line-numbered source and its four
   reading questions each name a different span of it, so the insert is a LIST of parts and always
   was -- it was being flattened into one cell because one cell was all there was room for.

   THE ORDER IS DECLARED, NOT INFERRED. `sort_order` on the row, and a stable sort so rows that do
   not carry one keep the order the file has them in. Inferring it from `lines` would read the
   first number of a span, which is right for "1-6" before "10-19" and silently wrong for a Source
   A / Source B insert where neither part is numbered at all. */
```

### ---------- AND A FOURTH SCOPE, A LETTER: THE "(d)" OPENING

top level, before `stemLetter_`

```
/* ---------- AND A FOURTH SCOPE, A LETTER: THE "(d)" OPENING ----------------------------------------
   THE OWNER'S OWN WORRY, the multi-part audit's finding 6: *"1b 1c 1di 1dii"*. A sentence (d)(i) and
   (d)(ii) both hang from -- "A car moves from rest…" in June 2019 2H Q14 -- had nowhere to go. On
   (d)(i) it was headed `Q1d(i) · 1 of 2` and lost when (d)(ii) was opened alone; on both, printed
   twice; as a row for part "d" itself, a card with an answer box under a sentence that asks nothing;
   and a preamble marked "d" had its letter ignored and stood in front of Q1(a).

   SO A PREAMBLE WHOSE `part` IS A LETTER IS THAT LETTER'S OPENING. It is a stem like any other, one
   scope further in, so `pageParts_`'s rule does the rest without a line changed: drawn once, in
   front of the first part whose letter it is (d(i)), not again in front of d(ii) when d(i) went
   first, and again in front of any of them opened on its own -- with its figure after it, as every
   stem's is. Headed `Q1(d)`, see `questionStemCard_`. `stemLetter_` is the one reading of the letter,
   for the index, for the card and for `check-library.js`'s shape rule. */
```

### OUTERMOST FIRST, because that is the order the paper prints them in and the order they have to be read in:

top level, before `preamble_`

```
/* OUTERMOST FIRST, because that is the order the paper prints them in and the order they have to be
   read in: the extract, then the scene, then the instruction. A part with none of them gets an empty
   list, which every caller already handles — `stems: []` draws nothing and adds nothing to the
   search haystack. */
```

### WHAT YOU HAVE TO HAVE IN FRONT OF YOU, FROM THE PAPER AND FROM THE QUESTION.

top level, before `needsIndex_`

```
/**
 * WHAT YOU HAVE TO HAVE IN FRONT OF YOU, FROM THE PAPER AND FROM THE QUESTION.
 *
 * ASKED FOR AS THREE THINGS — calculator or not, a print, a compass — AND IT IS ONE COLUMN. The
 * `images` note in CLAUDE.md is the argument and it was paid for once already: three booleans is
 * three schema changes, three mappings, three renderers and three checks, and the day somebody
 * needs a fourth (a protractor, tracing paper, squared paper) it is all four again. `needs` is a
 * comma-list, read by `asList_`, exactly as `topics` and `keystage` already are.
 *
 * THE TWO SCOPES ARE NOT THE SAME AND THAT IS THE WHOLE OF THIS FUNCTION. "You must not use a
 * calculator" is printed on the front cover and is true of all 31 questions inside, so it lives
 * ONCE on the `kind: 'document'` row — 103 cells covering 1,013 questions. Writing it onto every
 * question row instead would be a thousand chances for row 4 to disagree with row 3, which is the
 * denormalisation hazard `paperMismatches` exists for. A COMPASS is the other way round: one
 * question asks you to construct a bisector and the other thirty do not.
 *
 * SO IT IS A UNION, OUTERMOST FIRST, which is the same shape and the same order as `preamble_`
 * directly above — the paper's fact, then the question's own. Deduplicated on the way, because a
 * question that names a ruler inside a paper that already asks for one should not say it twice.
 */
```

### ---------- OFF THE FILE, FOR THE REASON `libDocRows_` IS WRITTEN DOWN ONCE

top level, before `needsIndex_`

```
/* ---------- OFF THE FILE, FOR THE REASON `libDocRows_` IS WRITTEN DOWN ONCE --------------------
   IT TOOK `DATA.questions` AND THAT IS A QUARTER OF THE DOCUMENT ROWS. See `libDocRows_` above for
   the measurement: 247 questions across seven papers -- the whole June 2024 Edexcel series, both
   tiers -- never said whether a calculator was allowed, because their document row is marked
   inactive and `libraryInto_` drops it before this function is handed the list.

   `all` IS STILL TAKEN AND STILL IGNORED IN FAVOUR OF THE FILE, exactly as `specIndex_` does: the
   argument is the fallback that keeps this working in a harness with no `LIBRARY_ROWS`. */
```

### ---------- AND THE PRINTED SHEET, WHICH IS READ RATHER THAN RE-TYPED

in `needsOf_`

```
/* ---------- AND THE PRINTED SHEET, WHICH IS READ RATHER THAN RE-TYPED ------------------------
     "WHETHER A PRINT IS REQUIRED" WAS ASKED FOR AND THE LIBRARY ALREADY HELD IT TWICE. Measured:
     `needs_print` True on 252 rows, `print_required` True on 104, and **zero rows True in both** —
     two imports over two disjoint subsets. `libraryInto_` unions them onto `needsPrint`; this puts
     the answer in the same list as everything else so the card and the facet have one reader.

     A THIRD COLUMN WOULD HAVE BEEN THE FOURTH SPELLING OF ONE ANSWER, which is the fault this file
     fixed as a RULE in `spellKey_` rather than by hand a fourth time. The first version of
     tools/set-needs.py derived it from `figure` and would have written exactly that. */
```

### `paper: true` WAS HERE and it was write-only — see the deleted `Printed?` facet above, which was its one reader.

in `questionItems`

```
/* `paper: true` WAS HERE and it was write-only — see the deleted `Printed?` facet above,
         which was its one reader. It also clobbered something: `library.js` puts the paper's ID
         in `paper` (`paper: libS(r.paper_id)`), which is the third of the three spellings
         `paperIdOf_` exists to read. Nothing called `paperIdOf_` on an item, so it never fired —
         but a field that holds an id everywhere except here is the exact trap that note describes. */
```

### ---------- WHERE THIS QUESTION SITS IN ITS PAPER

in `questionItems`

```
/* ---------- WHERE THIS QUESTION SITS IN ITS PAPER ---------------------------------------------
         THE SORT KEY IS BUILT FROM THESE, so they are stated rather than left to be inferred from
         the number inside the name. Nothing has written them since the paper card was deleted and
         nothing was visibly wrong — see the note above the sort, which is about why that is not the
         same as nothing being wrong. */
```

### THE TOPICS, RESOLVED ONCE.

in `questionItems`

```
/* THE TOPICS, RESOLVED ONCE. `topicOf_` splits the cell and puts every spelling of a topic on
         one button, and doing that inside the facet meant doing it per item per question asked:
         MEASURED at 38 ms to interrogate this one facet across the library. It is a fact about the
         row, so it is computed where the row is read. */
```

### THE MARK SCHEME, WHICH THE BACKEND SENT TO NOBODY FOR MONTHS.

in `questionItems`

```
/* THE MARK SCHEME, WHICH THE BACKEND SENT TO NOBODY FOR MONTHS. `answer`, `answerType` and
         `examinerNote` have been in the payload since the tab was cut, and the first version of
         this function dropped all three — the other direction of the fault `check-payload.js`
         exists for: sent, and never read. Only 91 of 3,271 rows carry one today. */
```

### EVERY PREAMBLE THIS PART SITS UNDER, OUTERMOST FIRST — see `preamble_`.

in `questionItems`

```
/* EVERY PREAMBLE THIS PART SITS UNDER, OUTERMOST FIRST — see `preamble_`. It was one stem or
         none; a list is what makes an AQA source text and a question's own scene-setting the same
         thing at two scopes rather than two features. */
```

### THE STEM'S WORDS TOO.

in `questionItems`

```
/* THE STEM'S WORDS TOO. A part reading "work out the value of x" says nothing on its own and
         everything alongside the paragraph it hangs from — see `searchText_`.

         THE ANSWER IS DELIBERATELY NOT IN HERE. This is what the search box matches, and including
         it means typing a value finds the question it answers, which is the one search a revision
         screen must not do. */
```

### AND THE TOPICS, WHICH THE SEARCH BOX COULD NOT SEE EITHER.

in `questionItems`

```
/* AND THE TOPICS, WHICH THE SEARCH BOX COULD NOT SEE EITHER. `searchText_` reads the
         question's own words, so `fractions` found a question only if the word `fractions` was
         printed in it — and on a worksheet whose every question is a fraction, the one place that
         says so is the `topics` cell. Typed here rather than matched in the filter for the reason
         `searchText_` gives: this runs once per item, and the filter runs per keystroke. */
```

### ---------- AND WHO PUBLISHED IT, WHICH WAS NEITHER ASKABLE NOR SEARCHABLE

in `questionItems`

```
/* ---------- AND WHO PUBLISHED IT, WHICH WAS NEITHER ASKABLE NOR SEARCHABLE ---------------
         REPORTED AS "how would I get to 1st Class Maths worksheets?" and the honest answer was
         that you could not. Measured both ways:

           the FUNNEL never asks. `Company` qualifies everywhere — 5 answers, 99% coverage, a
           65.8% split on the whole library, comfortably the best narrowing available — and it
           sits near the END of `FACETS`, so Subject, Level, Type, Grade, Topic and Paper are all
           asked first. By the time its turn comes the list is Maths · KS4 · Worksheet and every
           one of those 1,370 rows IS 1st Class Maths, so the facet has one answer and is
           correctly skipped. A question that can only be asked once its answer is already
           decided is a question that is never asked.

           the SEARCH BOX did not find it either. Typing `corbettmaths` returned 0 of 1,020.
           `1st class maths` returned 325, which reads like it works and does not — those are
           coincidental hits on other fields, against 1,370 rows that carry the name in a cell.

         THIS IS THE `topics` FIX, ONE COLUMN ALONG, and the sentence above it is the same one: a
         publisher's name is printed nowhere in the question, so the one place that says
         Corbettmaths is the `company` cell. Typed onto the item here rather than matched in the
         filter, for the reason that note gives — this runs once per item, the filter runs per
         keystroke.

         THE FUNNEL'S ORDER IS NOT CHANGED HERE, deliberately. `at` is editorial and the `facets`
         sheet owns it: putting `company` at a low `order` asks it early, with no deploy. That is
         a judgement about what somebody wants asked first, and it is not mine to make. */
```

### ---------- BUILT THE FIRST TIME SOMETHING READS IT, NOT FOR EVERY ROW AT BOOT

in `questionItems`

```
/* ---------- BUILT THE FIRST TIME SOMETHING READS IT, NOT FOR EVERY ROW AT BOOT ------------
         This was a plain property, so all five thousand questions had their markup stripped and
         joined before the Find screen could draw — measured at 8x CPU, `plainText_` and
         `searchText_` were **220 ms of the boot**, spent on a haystack nothing reads until
         somebody types into the search box. A student tapping through the funnel never does.
         A GETTER THAT REPLACES ITSELF WITH ITS VALUE, so the first reader pays once and every
         reader after that gets an ordinary property: `stuffHay_`'s own `_hay` memo and
         `check-funnel.js`'s count see exactly the string they always did. */
```

### THE RAW FILE ROW WHERE THERE IS ONE, not the payload object built from it — see the note on `row:` in js/library.js.

in `questionItems`

```
/* THE RAW FILE ROW WHERE THERE IS ONE, not the payload object built from it — see the note on
         `row:` in js/library.js. It is what a sheet-invented facet reads through, so every column of
         `data/questions.json` is filterable and not just the 29 that got enumerated. */
```

### ---------- THE WHOLE QUESTION, NOT A PEEK

top level, before `whoIs_`

```
/* ---------- THE WHOLE QUESTION, NOT A PEEK --------------------------------------------------------
   THE FIRST VERSION SHOWED 96 CHARACTERS and a panel showed the rest. That split only made sense
   while the rest lived somewhere else, and it never did — the stem, the lead and the part are three
   fields on the row this card is already drawn from.

   A QUESTION IS SHORT. That is what a question IS; if it were a page it would be a paper. So the
   truncation bought nothing and cost a tap on every single one.

   THE STEM, THEN THE LEAD, THEN THE PART, in printed order, because a part without them cannot be
   answered. The mark scheme goes last, shut, under `answerBlock_` — an answer you can see before
   you have written one is not a question. */
```

### ---------- SOMEWHERE TO WRITE THE ANSWER

top level, before `whoIs_`

```
/* ---------- SOMEWHERE TO WRITE THE ANSWER --------------------------------------------------------
   A BOX PER QUESTION, because that is what the paper has. One box at the bottom of a list is a page
   of prose nobody can mark against a mark scheme written per part.

   IT IS KEPT IN `localStorage`, AND THAT IS NOT A SHORTCUT. These cards are rebuilt on every
   repaint — a filter changing, the payload landing, signing in — and a `<textarea>` rebuilt is a
   `<textarea>` emptied. Somebody four questions in losing the lot because a chip moved is the kind
   of fault that stops people trusting an app at all. The browser remembers instead, so a redraw, a
   swipe away or a reload all come back to what was typed.

   THE KEY IS THE ROW ID. It was paper + question + part, which was right when the box lived on a
   paper page; `row_id` is unique across the whole library and does not move when a paper is
   relabelled. Anything typed under the old key is orphaned — the paper page existed for about a
   day, so that is nobody.

   AND THE KEY IS WHY 3,271 BOXES COST NOTHING. `fillStuffPages` fills the pages you are near and
   empties the ones you are not, so about five of these exist at any moment. I removed this function
   on the assumption that a textarea per question meant 3,271 textareas — measured, the whole strip
   holds 134 nodes. Wrong for the reason this file keeps repeating: I reasoned about the DOM instead
   of asking it.

   AND NOW IT IS SENT, TO THE ACCOUNT. This paragraph said "NOT SENT ANYWHERE … there is no endpoint
   that takes one and no tab to hold it, so this is a workbook and not a submission" — and the owner,
   on a pupil's iPad: *"i am very dissapointed it didnt have his answers already written in when he went
   to see them on the computer"*. Signed in, every answer is kept on the person's row of the `answers`
   tab as well (`ansStore_`, js/answers.js) and filled in on whichever device they open next. The
   browser's copy is still what a box is drawn from — it is right on the first frame, offline, and
   through every repaint — and the account is what follows the child. Still a workbook and not a
   submission: nothing is marked by being saved.

   EVERY READ AND WRITE IS WRAPPED. Private mode THROWS on `localStorage` rather than returning
   null, and a thrown getter here would take the whole results list down with it. */
```

### ---------- WHOSE ANSWER IT IS, AND IT IS WHOEVER IS SIGNED IN

top level, before `whoIs_`

```
/* ---------- WHOSE ANSWER IT IS, AND IT IS WHOEVER IS SIGNED IN --------------------------------
   TWO BOYS ON ONE PHONE IS STILL THE CASE THIS ANSWERS. The key was `ans:<row_id>` and nothing
   else, so a second person working through the same paper on the same device typed over the
   first one's answers with no warning and no way back. On a tutor's phone, passed between two
   students in one session, that is not an edge case -- it is the ordinary way it gets used.

   THERE WAS A TYPED NAME HERE AND IT IS GONE. A `workingAs` control sat beside every answer box
   reading "who is this?", and it was a second identity the app did not otherwise have: not a
   login, nothing protected by it, a label on a drawer. Reported as *"remove this feature of whos
   writing. its confusing. just have it be that they sign in"*, and that is the right call --
   two ways of saying who you are is two things to keep in step, which is the sentence this
   repository writes about `handle`/`username`, about `MESSAGING` and about `childrenOf`.

   SO SIGNING IN IS THE ONLY ANSWER TO "WHO", and it is one the app already had. What it costs is
   that a boy who turned up today with no row in the Ledger works under the signed-out key, the
   same as the tutor -- which is the ordinary behaviour of every other surface here and is what
   `changePin` and the roster are for.

   THE OLD UNPREFIXED KEY IS STILL READ, once, and it can only ever fill a box that is empty — and it
   is MOVED to whoever is signed in when it is read, never copied. See `ansRead_`. */
```

### `signedName_` WAS HERE -- the first name over the answer box ("Ada's answer").

top level, before `ansRead_`

```
/* `signedName_` WAS HERE -- the first name over the answer box ("Ada's answer"). Removed with the
   caption, on *"remove 'names answer'. that is redundant."* The answer is still filed under who is
   signed in (`ansKey_`); only the words saying so on the box are gone. */
```

### THE VISIT'S COPY OF A WRITE THE STORE REFUSED (`keepHeld_`, data.js), never the older stored one or the empty box a browser keeping nothing answers with:

in `ansRead_`

```
/* THE VISIT'S COPY OF A WRITE THE STORE REFUSED (`keepHeld_`, data.js), never the older stored one or
     the empty box a browser keeping nothing answers with: a redraw drew that, and the next key saved it
     over the essay (docs/history/317). */
```

### ---------- AN ANSWER TYPED BEFORE ANYBODY SIGNED IN, FOUND AND MOVED

in `ansRead_`

```
/* ---------- AN ANSWER TYPED BEFORE ANYBODY SIGNED IN, FOUND AND MOVED -----------------------------
       THIS LOOKED IN THE WRONG PLACE FOR AS LONG AS THE KEY HAS HELD A PERSON ID. It was
       `/^ans:[^:]*:/`, written when the key held one typed name (`ans:Ada:q:X`); the key is
       `ans:u:P7:q:X` now — two segments — so it took off `ans:u:` and looked for `ans:P7:q:X`, which
       no answer has ever been stored under. A child who answered before signing in signed in and found
       the box empty: one half of *"i just relogged in as [the child] … and i dont see his answers"*.

       MOVED, NOT COPIED — `padAdopt_`'s rule for the pen. The answer becomes this person's (and goes up
       to their account with the rest, through `ansStore_`), and the signed-out copy goes: a copy left
       behind would be read by the next child to sign in on the same iPad, which is the fault itself
       carried forward. Only into an empty box — a box this person has written in keeps theirs.
       SIGNING IN FROM SIGNED OUT DECIDES THEM ALL FIRST NOW (`answersClaim_`, js/answers.js): here, only
       into an empty box, a signed-out answer lost to an older one on the account and was left for the next
       child. And signing in over somebody else claims the person's own (317, "Six edges closed"). This is
       what is left for a device that was already signed in with one still on it. */
```

### NOT INTO SOMEBODY ELSE'S BOX:

in `ansRead_`

```
/* NOT INTO SOMEBODY ELSE'S BOX: written signed out just after the server ended ANOTHER person's
       session, so it is theirs — the review of 317 found a child's words moved into the next child's
       account this way. `ansMayMove_` (js/answers.js) is the one question every move asks; here the
       box is empty, so any answer but "no" moves it. */
```

### ---------- `Done 4 Oct` WAS HERE, AND THE `attempts` TAB UNDER IT

top level, before `subSlot_`

```
/* ---------- `Done 4 Oct` WAS HERE, AND THE `attempts` TAB UNDER IT ---------------------------------------
   268 dated a question the first time it was touched each day (*"when a student does do a question, it
   should record the date they did it"*), 269 put the date on the sheet, and `Done 4 Oct` sat beside the
   star. THE OWNER, 9 OCT: *"The kids don't need to see the day they did something. Just whether it's
   right or not. Also I just want system to record each submition ... Instead of each question just
   saving number of attempts."* So the date went, and with it `doneMark_` (the first keystroke of the
   day), `attemptsSync_` (the backlog of dates sent on load), the phone's `done:<who>:<key>` dates,
   `DONE_HELD`, and the `markDone` they all fed. Every press that asks for a verdict is an event now
   (js/submit.js), and the card says how the LATEST one went.

   ---------- THE SLOT, BESIDE THE STAR ---------------------------------------------------------------
   "Correct", "Not yet", "Sent" (nothing could mark it) or the AI's "3/4" — the latest press, on any
   device (`subLatest_`). The verdict line's own words, and its own marks drawn by the stylesheet: a
   tick, and for "not yet" the turning arrow that says "go round again" (`.qp-verdict`), in green and
   amber (`--good`, `--warn`). Nothing at all for a question never sent.

   ALWAYS DRAWN, EMPTY OR NOT, for somebody signed in, and a press writes into it rather than redrawing
   anything (`subPaint_`): 261 made marking move nothing, and a slot that arrived as a new element on the
   first Send would be the card jumping at exactly the moment it marks you. In the question's tile row
   (`questionTiles_`): a verdict is yours, like the star, not a fact about the question like a tag. */
```

### ---------- A DONE QUESTION'S NAME, AS A PARENT READS IT

top level, before `doneTier_`

```
/* ---------- A DONE QUESTION'S NAME, AS A PARENT READS IT ----------------------------------------------
   FOR THE WEEKLY PARENT EMAIL (backend/digest.gs): the sheet holds a key no parent can read
   and the backend cannot look up. `Maths · Paper 1 — June 2024 · Q3`, the subject left out when the
   paper's name already says it. Only where the card is in hand, and '' when there is no card. Sent with
   every press (`subRecord_`, js/submit.js), as it was with every first mark of the day before that.

   A PRACTICAL'S WORKSHEET BOX IS THE CARD'S KEY WITH A SLOT ON THE END (`#iv`, `#dv`, `#cv` — see
   `guideBox_`), and `ansKey_` of no card ends in one, so those boxes found no card and went up
   nameless: one worksheet was three raw keys in a parent's email. The slot comes off for the lookup,
   and the name says which part of the practical it was. The backend joins the three rows on the same
   cut (`digestPlan_`), so the worksheet is one question there too.

   NOT THE CARD'S DURATION. A practical's line is `Biology · Required practical · 60 min`, and an email
   heading "Biology · Required practical · 60 min · Osmosis" reads to a parent as how long their child
   spent. A `N min` segment is a card's estimate, never a name; `digestPlan_` drops it from the rows
   already on the sheet too.

   AND THE TIER, WHEN THE PAPER'S NAME DOES NOT SAY IT. Foundation and Higher sit the same paper on the
   same day under the same name — "Paper 1 (Non-calculator) — June 2024" is two papers, and AQA's GCSE
   and A-level Physics share "Paper 1 — June 2024" — so a session that worked crossover questions sent
   a parent `Q1, Q1, Q2` under one heading. Measured on the library: 14 headings held more than one
   paper. The tier (or the A-level the band names when the tier cell is empty) goes on the paper's
   name. Two imports of one paper at one tier stay one heading — nothing in a name can part those. */
```

### ---------- THE QUESTION ITSELF, AS A PARENT WILL READ IT

top level, before `DONE_WORDS_STEM`

```
/* ---------- THE QUESTION ITSELF, AS A PARENT WILL READ IT --------------------------------------------
   *"emails all parents on work their child has done with the exact questions for each"*. The backend
   cannot look a key up (SCHEMA.submissions), so the words go with the press, the way the name does: the
   question's own stem (question and letter scope — a paper's whole source text is not "the question"),
   a line holding only `---`, then the part's lead and ask. The email prints the stem once above the
   parts that share it and cuts each to what reads on a phone.

   AS TEXT, WITH THE MATHS KEPT. A fraction is `3/4` and a power `x²` or `x^5`, never the `34` and `x2`
   that stripping the tags leaves; a drawing's labels are not words of the question and go with it; a
   picture is said in a bracket, because the email cannot draw it and the site can. Empty for a
   practical's box — its name already says which worksheet.

   A HALF OR AN INDEX MAY HOLD MARKUP, AND THE LIBRARY HAS A SECOND FRACTION. The first version read
   only a half with no tag in it; measured over data/questions.json, that sent a parent another sum:
     the stacked `.frac` span, as stored (147)        one third times five eighths was "13 × 58"
     an italic letter in a denominator (28)           72 over n was "^72⁄n", a power
     an italic index (102, in 80 questions)           2 to the x was "2x"
   So both shapes are read with markup inside, a half or an index of more than one term is bracketed —
   (7.902 − 8)/x and x^(n + 1), not 7.902 − 8/x and x^n + 1 — and a slash left standing is a plain one.
   The fraction rule runs again after ² and ³, for the d²y over dx² whose halves hold an index. */
```

### AN ORDINAL IS NOT A POWER — "the 3rd term", not "the 3^rd term" — and a root's index sits on the root, ⁴√, not ^4√.

in `s`

```
/* AN ORDINAL IS NOT A POWER — "the 3rd term", not "the 3^rd term" — and a root's index sits on the
       root, ⁴√, not ^4√. Then a subscript is a subscript: x₁, and x_(n + 1) for a term index — run
       together, `xn+1` read as x·n plus 1. */
```

### THE CARD FOR AN ANSWER KEY.

top level, before `doneItem_`

```
/* THE CARD FOR AN ANSWER KEY. `index` is a Map a caller doing many may build once, rather than a scan of
   the library per key (measured at 7.5 ms each) — the load's backlog of dates did, and went with them;
   a press looks up one card. */
```

### THE SITE'S OWN TEST FOR A PICTURE (`questionHasFig_`, `stemHasFig_`), never the `figure` cell:

in `doneWords_`

```
/* THE SITE'S OWN TEST FOR A PICTURE (`questionHasFig_`, `stemHasFig_`), never the `figure` cell: that
       is a transcriber's one-word tag — "table", "boxes" — and 622 questions with it draw no picture,
       so a parent would be sent to look for one that is not there. A MADE-UP SURFACE IS NOT ONE SINCE 327:
       a blank grid to draw on is not the paper's picture, and "(picture on the site)" over it sent a parent
       to look for the triangle the question names, which the grid does not have. */
```

### ---------- MARKING IT

top level, before `markNorm_`

```
/* ---------- MARKING IT -----------------------------------------------------------------------
   THE ONE FAILURE THAT MATTERS IS MARKING A RIGHT ANSWER WRONG. A student has nobody to appeal
   to: told they are wrong when they are right, they either lose the thread or stop believing the
   tick, and the second is worse because it takes the correct marks with it. So every rule here
   is deliberately generous, and where it cannot be generous enough to be safe it declines to
   mark at all -- `accept` is simply absent on 427 questions and those offer the answer instead
   of a verdict. See tools/set-accept.py.

   WHAT IS FORGIVEN, each because a child writing it has not made a mistake:
     case, spaces, a trailing full stop        "Banana And Pear."
     the thousands comma                        1000 for 1,000
     a unit or a currency sign the answer names £4,655 for 4,655, "1000 envelopes" for 1000
     a minus sign in any of its three spellings -5, &minus;5, en dash
     a trailing zero on a decimal               8.50 for 8.5
     a list in a different order                10, 5, 2, 1 for 1, 2, 5, 10
     a space between a number and its letters   185 p for 185p, 3 a for 3a
     "and" or "&" between parts of an answer    "4000 and 820000"

   WHAT IS NOT FORGIVEN is a different number. Everything above is notation; the value is the
   answer. */
```

### ONLY A REAL TAG IS A TAG.

in `markNorm_`

```
/* ONLY A REAL TAG IS A TAG. This was `<[^>]*>`, which read the inequality a child types --
       `4 < 7 > 2` -- as a tag and threw away its middle, so every Corbettmaths inequality-signs
       question was unmarkable; the accept cells had to be emptied. A tag starts with a letter or
       a slash; a comparison sign is followed by a space or a number. */
```

### AND THE ENTITIES A CELL IS WRITTEN IN ARE THE CHARACTERS A CHILD TYPES.

in `markNorm_`

```
/* AND THE ENTITIES A CELL IS WRITTEN IN ARE THE CHARACTERS A CHILD TYPES. `&pound;5` stayed
       `&pound;5`, lost its ampersand to nothing and was compared as ",pound;5" -- so the one
       accept spelled the way the rest of the library spells money could never match. */
```

### A THOUSANDS SEPARATOR IS A COMMA, A SPACE, OR A THIN SPACE, and which one you get depends on who printed the paper.

in `markNorm_`

```
/* A THOUSANDS SEPARATOR IS A COMMA, A SPACE, OR A THIN SPACE, and which one you get depends
       on who printed the paper. Edexcel writes 18 000; the KS2 papers write 1,000; a child types
       18000. All three are the same number and only the last one is what anybody actually types
       into a box. Caught by a real row: the very first question of the June 2024 Foundation
       paper, whose scheme answer is "18 000", marked "18000" wrong. */
```

### A FRACTION HAS FOUR SPELLINGS AND A CHILD TYPES ONE OF THEM.

in `markNorm_`

```
/* A FRACTION HAS FOUR SPELLINGS AND A CHILD TYPES ONE OF THEM. The library writes the answer
       to Q23(b) of the June 2024 Foundation paper as `5&frasl;9`, which strips to `5⁄9` with the
       FRACTION SLASH; a phone keyboard has no such key and what gets typed is `5/9`. Before this
       line those were different strings, so the one answer a student is most likely to write was
       marked wrong -- on a live paper, to a child sitting beside you, with no appeal. The vulgar
       characters are the same fault a third way (`3⅓` is the sign on the Corbettmaths signpost),
       and they need the space `3 1/3` or the mixed number folds into the improper 31/3.

       THE SPACE IS REMOVED ONLY WHERE IT TOUCHES THE SLASH. Stripping every space instead would
       fold `1 1/6` onto `11/6` -- 1.17 and 1.83, two different numbers -- so a wrong answer would
       be marked right, which is the one thing worse than the fault being fixed. */
```

### ---------- WHAT THE MATHS KEYPAD WRITES, WHICH IS A BRACKET ROUND EVERY SLOT

in `markNorm_`

```
/* ---------- WHAT THE MATHS KEYPAD WRITES, WHICH IS A BRACKET ROUND EVERY SLOT ------------------
       ASKED FOR AS "make the input better … like hegarty maths … desmos". The keypad in keypad.js
       builds a fraction as `()/()`, a power as `^()` and a root as `√()`, so each has a slot to
       type into — and the stacked preview needs the slot. What it stores is therefore `(3)/(4)`,
       `x^(2)` and `2√(11)`, and the library's `accept` is written `3/4`, `x^2` and `2√11`. Before
       these lines the keypad's own fraction was marked wrong against the scheme it was built to
       answer, which is the one failure this file calls the worse of the two.

       ONLY A BRACKET ROUND ONE TERM, AND ONLY AGAINST A SLASH, A CARET OR A ROOT. `2(3)` is two
       threes and must never become `23`; nothing here can reach it, because the bracket touches a
       digit and no operator. `(x + 1)/3` keeps its brackets, because there they mean something.
       Proved over the real library's 3,207 distinct `accept` ways: 17 change, and the only ones
       that become equal to another are the 14 pairs a single cell already lists side by side as
       alternatives — `12π|12pi`, `w^-2|w^(-2)`. Nothing that was a different answer becomes the
       same one.

       AND `sqrt` AND `pi` ARE THE KEYBOARD'S SPELLINGS of the two signs it has no key for — the
       library already lists `12π|12pi` as two answers, and `sqrt(7)/7` beside `√` elsewhere. `pi`
       only where it is not inside a word, so Jupiter stays Jupiter.

       `root` IS THE THIRD SPELLING, and it was being written into the DATA instead: the exact-trig
       sheet listed `root3/2` beside `sqrt3/2` as one more way, so `root3/2` marked right and
       `root 3/2` — the same answer with the space a person puts in — marked wrong, and the extra way
       (`ro`, two letters in a row) sent four surd questions to the phone keyboard, which has no √
       key, while the three beside them got the keypad. Folded here once instead. Only BEFORE A
       DIGIT OR A BRACKET and never inside a word, so a plant's roots and "square root of" are left
       as words. The `root` ways are out of the exact-trig cells now, and over the 5,220 distinct
       `accept` ways left two change: `20root5` onto the `20√5` beside it, and `10 root 2 cm`, which
       was a wrong answer marked right — `root 2 cm` read as a unit after the 10, so a bare `10`
       passed for 10√2.

       AND THE SPACE BETWEEN A NUMBER AND ITS ROOT OR π SAYS NOTHING. That same `10 root 2 cm` became
       `10 √2 cm`, the space stayed, and the keypad's `10√(2)` — June 2023 Higher Q16, the answer
       itself — matched nothing: the fix for the wrong answer left the right one refused. There is no
       "mixed root" for the space to mean, the way `1 1/6` is a mixed number (see the fraction rule
       above, which is why this is narrower than "take spaces out"): `3 √6` and `3√6` sit side by
       side in one cell, `48 pi` beside `48π`. Over the library 7 ways change: six onto the closed-up
       spelling their own cell lists beside them, and `10 root 2 cm`, which nothing matched before.

       THE ROOT'S OWN SLOT FOLDS FIRST, AND THE FRACTION'S SLOT MAY THEN HOLD A ROOT. The keypad
       writes 1/√2 as `1/(√(2))` — the fraction key after a number opens `/()`, the root key opens
       `√()` — and when this was one pass the outer bracket was tried before the inner one had come
       off, found `√(2)` in it rather than a single term, and stayed. So `1/(√2)` never equalled the
       `1/√2` the exact-trig cells list, and a child who wrote sin 45° the way the model answer
       prints it was told "Not yet". `√2` is still ONE term — the root binds tighter than anything
       round it — so letting the slot hold it is the same rule, not a wider one. Three library ways
       change (`(√3)/2` and its kind), each onto the `√3/2` its own cell lists beside it.

       AND THE POWER'S SLOT FOLDS FIRST TOO, FOR THE SAME REASON ONE LEVEL UP. June 2020 Higher
       Q12(a) is 3x²/((x + 2)(x − 4)), and begun with the fraction key the keypad writes
       `(3x^(2))/(…)`: the numerator held `3x^(2)` while its power was still bracketed, so it was not
       one term and kept its bracket — a third spelling of an answer the cell lists. A power binds
       tighter than the division round it, so `3x^2` is one term and the slot may hold it. Nothing in
       the library changes: no `accept` way is written with a bracket round a power over a line.
       `check-marking.js` holds what this writes directly (NORMS), because `markParts_` runs it twice
       and a second pass hides the order of the folds from any case marked through `markAnswer_`. */
```

### AND THE SPACES ROUND A COLON, FOR THE SAME REASON ONE LINE UP.

in `markNorm_`

```
/* AND THE SPACES ROUND A COLON, FOR THE SAME REASON ONE LINE UP. A ratio is printed `2 : 3` on
       a mark scheme and typed `2:3` into a box, and those were two different strings -- so an
       `accept` written the way the scheme prints it marked the way a child writes it WRONG, which
       is the failure this file calls the worse of the two.

       IT CANNOT CHANGE ANY ROW THAT ALREADY EXISTS, and that is measured rather than argued: not
       one of the library's 1,435 `accept` cells contains a colon, so before this line NO ratio
       answer anywhere could mark itself. 62 ratio questions still have no `accept` at all -- a
       backlog rather than a silence, and this is what makes writing one possible.

       A COLON IN AN ANSWER IS A RATIO SEPARATOR AND NOTHING ELSE. The only other thing it could be
       is a time, and folding `3 : 30` onto `3:30` is right about that too. */
```

### ---------- AND ROUND AN OPERATOR, WHICH IS THE COLON RULE FOR A THIRD CLASS OF CHARACTER

in `markNorm_`

```
/* ---------- AND ROUND AN OPERATOR, WHICH IS THE COLON RULE FOR A THIRD CLASS OF CHARACTER ----
       A MARK SCHEME PRINTS `4n − 3` AND A CHILD TYPES `4n-3`. Those were two different strings, so
       the nth-term question on the June 2024 Foundation paper marked the answer every student
       actually writes as wrong. Measured across the library: **178 of the 1,436 `accept` cells
       carry a space round an operator** — `3(2x − 5)`, `5x + 2y`, `2 × 3 × 3 × 5`, `x = 3, y = -4`
       — and they are precisely the algebra ones, where nobody types the spaces.

       THE MINUS IS ALREADY FOLDED TWENTY LINES UP and that was not enough on its own: `norm` gave
       `4n - 3` against a typed `4n-3`, so the sign matched and the spacing did not.

       IT CANNOT FOLD A MIXED NUMBER, which is the danger the fraction rule above names: `1 1/6`
       and `11/6` are 1.17 and 1.83, and the space between a whole number and its fraction does
       not touch an operator, so nothing here can reach it. Every other space-significant thing in
       this notation is the same shape. Proved over the real library: no two `accept` cells that
       were different before become equal after.

       AND A SIGN NO PHONE KEYBOARD HAS IS FOLDED TO THE ONE IT DOES. `≤` is on eleven cells and
       there is no way to type it — the inequality on this paper is `x ≤ −4`, and a student who
       has solved it correctly cannot enter the answer at all. `<=` is what a keyboard gives and is
       not a legitimate spelling of anything else.

       AND `*` AND A LETTER `x` BETWEEN TWO NUMBERS ARE THE KEYBOARD'S `×`. A product of primes was
       marked right as `2^3*11` and WRONG as `2^3 * 11`, because the space rule above never knew `*`
       was an operator — and the prime-factorisation sheet's cells, which list `2^3*11` and
       `2^3 x 11`, refused all of `2 * 2 * 2 * 11`, `2^3 x11` and `2³ x 11` on every one of its
       eleven rows. Listing each spacing in the data is how the older rows coped (`2^3 * 7 | 2 * 2 *
       2 * 7`), and that is a list that is never finished. `*` has no other meaning anywhere. The
       letter does, so it folds only with a NUMBER ON BOTH SIDES — a digit or a superscript power
       before it, a digit after — which no algebra writes: `2x`, `3x^2` and `x = 3` are untouched.
       Proved over the library's 5,220 distinct `accept` ways: 212 change, they fall into 105 sets
       that become one spelling, and every set is ways a single cell already lists side by side.

       AND IT CLOSED A HOLE THE OTHER WAY, which the same sweep found. Left as a letter, the `x` of
       `2 x 3 x 3 x 5` or `6.3 x 10^7` read as a UNIT after the first number, so `markBare_` cut the
       answer down to it: a bare `2` was marked RIGHT against `2 × 3 × 3 × 5` and every other
       product-of-primes cell, and `6.3` against `6.3 × 10^7`. Typing every library way into every
       cell, 343 verdicts go from right to wrong with this line, and not one of them is a way the
       cell itself lists. */
```

### A LIST IS A SET. "1, 2, 5, 10" and "10, 5, 2, 1" are the same answer to "list the factors", and a child who works outwards from the middle writes the second.

top level, before `markParts_`

```
/* A LIST IS A SET. "1, 2, 5, 10" and "10, 5, 2, 1" are the same answer to "list the factors",
   and a child who works outwards from the middle writes the second. Compared as sorted parts,
   so order is free and a missing or extra factor is still wrong. */
```

### THE UNIT IS PART OF THE ANSWER'S SENTENCE AND NOT PART OF THE ANSWER.

top level, before `MARK_NUM`

```
/* THE UNIT IS PART OF THE ANSWER'S SENTENCE AND NOT PART OF THE ANSWER. The library writes
   "1,000 envelopes" and "70.5 kg" because that is what a person says; a student writing 1000 is
   right. So a trailing word is dropped from the EXPECTED side only -- never from what was typed,
   or "1000 cats" would pass. */
```

### ---------- A UNIT, AND NOT EVERYTHING AFTER THE FIRST NUMBER

top level, before `MARK_NUM`

```
/* ---------- A UNIT, AND NOT EVERYTHING AFTER THE FIRST NUMBER ---------------------------------------
   THIS WAS `^([-\d.,\/\s]+)\s*[a-z°%]+.*$` — the first number, then the first letter, then ANYTHING —
   and it cut `6w² − 10w` to `6`. So a bare 6 was marked RIGHT for "expand 2w(3w − 5)", and typing the
   library into itself found the same in 110 questions — 241 expressions whose leading number passed:
   the 4 of every nth term `4n − 1`, the 2 of `2y = 3x + 6`, the 93.5 of an error interval
   `93.5 m ≤ length < 94.5 m` — and, past the expressions, the 3 of `3a`, the 2 of `2 hours 45
   minutes`, the 180 of a list of three masses. A wrong answer marked right, on the algebra sheets,
   where the coefficient is exactly the half-answer a child stops at.

   SO A UNIT IS NAMED, AND THEN THE ANSWER ENDS. After the number: a word of three letters or more
   (`envelopes`, `mph`, `minutes`), or a symbol from `MARK_SYM`; a power (`cm²`, `m^3`, `cm3`); any
   number of `/` and another (`km/h`, `g/cm^3`, `N/m²`); a `per hour`; a bracket of working after a
   space, which is how the past papers write a worked answer (`8.5 cm (PQ = 45 ÷ 10 …)`). Then the
   end. An operator, a second number or a second word means it was never a unit.

   A SINGLE LETTER IS A UNIT ONLY AFTER A SPACE, AND ONLY ONE OF THESE: g m l p s h k j v n w.
   Glued to a number, nothing tells a unit from algebra — `7m` is "simplify 9m − 2m" on one
   5-a-day sheet and `6.27m` a length on the next, `4s/h` is s over h — and a lone `x`, `y` or `a`
   after a space is algebra too (`80 y`, `6 x` are listed ways). Refusing them costs nothing that was
   right: every glued metre, gram and second in the library has the bare number or the spaced unit
   in the same cell, and the cells that list only `250p` are answers in POUNDS, where 250 alone is
   £250. Two letters glued to a number are a product unless they are on the list: `6cd`, `10xy`.

   THE NUMBER MAY END IN A ROOT OR IN π (`MARK_NUM`), because `√3 cm`, `10√2 cm` and `48π cm²` are a
   value and a unit as much as `70.5 kg` is — and the typed side (`MARK_UNIT`) shares it. Round 1
   took `√3cm` out of exact-trig Q17 so the row would get the keypad, and `√3cm` typed went from
   Correct to "Not yet": a unit came off a bare number only, never off a surd. One rule for both
   sides is the fix; the spelling stays out of the cell.

   Strings, not literals, so the three patterns that read a number share one, and no `{n,}` — the
   cutter in check-marks-load.js counts braces to find where a declaration ends. */
```

### A FRACTION IS A NUMBER, AND "OR EQUIVALENT" IS WHAT THE MARK SCHEME ACTUALLY SAYS.

top level, before `markFrac_`

```
/* A FRACTION IS A NUMBER, AND "OR EQUIVALENT" IS WHAT THE MARK SCHEME ACTUALLY SAYS.
   Q23(b) of the June 2024 Foundation paper is marked `5/9` and its scheme adds, in the same line,
   "oe ... any equivalent fraction, or the decimal 0.55(5...) or 0.56, or the percentage". A child
   who writes 10/18 on a primary sheet has not made a mistake either: Corbettmaths Q3 of the
   different-denominators sheet comes out as 15/20 before anybody cancels it, and telling that child
   they are wrong is the one failure this marking cannot afford.

   COMPARED AS TWO WHOLE NUMBERS, never as a decimal. 1/3 and 0.3333 are different numbers and a
   float would eventually call them equal; `a*d === c*b` cannot. A denominator of 0 is refused
   rather than rounded to infinity.

   WHERE THIS WOULD BE WRONG IS A QUESTION THAT ASKS FOR THE SIMPLEST FORM, because there the
   unsimplified fraction is the question rather than the answer. There is no such row in the
   library -- measured: 83 answers are a bare fraction and none of them asks for simplest form --
   and `check-library.js` fails the build on the first one, so this cannot quietly become wrong. */
```

### A MARK SCHEME THAT TAKES A BAND TAKES EVERY NUMBER IN IT, AND THIS ONE WAS TAKING TWO OF THEM.

top level, before `markRange_`

```
/* A MARK SCHEME THAT TAKES A BAND TAKES EVERY NUMBER IN IT, AND THIS ONE WAS TAKING TWO OF THEM.
   "Write down an estimate for the real height of the man" is marked `1.5 to 2 metres` -- the
   scheme's own words -- and there is no single right answer to it. Measured before it was fixed:
   a student typing `1.5` was marked RIGHT and one typing `2` was marked WRONG, from the same
   accept cell, because `markBare_` strips a trailing word and "to 2 metres" IS a trailing word, so
   the band quietly became its own first number. Arbitrary in the one place in this app that tells
   a child they are wrong, and the bottom of the band passing is what made it invisible.

   ONLY `to` AND THE TWO LONG DASHES. A plain hyphen between two numbers is also how a person
   writes a subtraction and how this library writes `7-11`, and a rule that cannot tell them apart
   would mark a wrong answer right -- which is the one failure worse than the one being fixed.

   COMPARED AS WHOLE NUMBERS, for the reason `markFrac_` above gives: the ends of a band are
   decimals (1.5, 7.5) and a float comparison at a boundary is the one place this must not be
   approximately right. Both ends are INCLUSIVE, because a scheme printing "1.5 to 2" accepts 1.5
   and accepts 2. THREE ROWS IN THE LIBRARY carry one and all three are real bands; anything that
   is not two numbers with `to` between them comes back null and is marked exactly as before. */
```

### ---------- THE SEPARATOR IS READ BEFORE `markNorm_` FLATTENS IT

in `markRange_`

```
/* ---------- THE SEPARATOR IS READ BEFORE `markNorm_` FLATTENS IT ------------------------------
     THE DASH HALF OF THIS RULE WAS DEAD FROM THE DAY IT WAS WRITTEN, and two lines of `markNorm_`
     are why: its SECOND line is `.replace(/[\u2212\u2013\u2014]/g, '-')`, which is right -- a
     minus typed as U+2212 has to compare equal to one typed as `-` -- and it runs BEFORE this
     regex. So by the time `(?:to|\u2013|\u2014)` was tested, every en and em dash had already
     become a hyphen and only the word `to` could ever match.

     NOTHING COULD SEE IT. Every one of this repository's band cases was written with the word, so
     `check-marking.js` was green over a branch that could not fire -- a green light with nothing
     behind it, which is what CLAUDE.md says a check that cannot fail is. It is four cases now, and
     they failed before this line existed.

     THE DASH BECOMES THE WORD, AND A HYPHEN STILL DOES NOT. That is the whole care: CLAUDE.md
     refuses a plain hyphen outright, because `1.5-2` is also how somebody writes a subtraction and
     how this library writes an age range, and a rule that cannot tell them apart marks a WRONG
     answer right. Only the two LONG dashes are turned into `to`; U+2212 and `-` are untouched and
     still fail this regex.

     AND IT CANNOT CHANGE A ROW THAT ALREADY EXISTS: measured, not one of the library's 1,436
     `accept` cells contains an en or em dash at all. */
```

### ---------- A UNIT THE CHILD TYPED, AND THE BRACKETS ROUND A COORDINATE

top level, before `MARK_WORD`

```
/* ---------- A UNIT THE CHILD TYPED, AND THE BRACKETS ROUND A COORDINATE ----------------------------
   MEASURED ON THE SATS PAPERS: "3.75 litres", "65p", "144 cm²" and "25%" were all marked wrong
   against an `accept` of the bare number, and "(55, 30)" against "55, 30". `markBare_` already took
   a unit off the EXPECTED side; nothing took it off what was typed, so the more carefully a child
   wrote their answer the more likely it was to be refused. That is the worse of the two failures.

   NARROW ON PURPOSE: a number followed by unit-like letters and NOTHING ELSE, per comma-separated
   part, so "5 and 24" is never reduced to "5". Brackets come off only when they enclose the whole
   answer. If nothing changes there is no second attempt, so this can only turn a refusal into a
   tick where the bare number was already right.

   A CARET IS PART OF A UNIT, because a keyboard has no ³ key. `300cm³` was a unit and `300cm^3`
   was not, so the pyramid sheet marked `300cm^3` wrong against a cell that lists `300 cm^3`, and
   the keypad's own power key writes `cm^(3)` — a right answer the pad itself could not get marked
   right. It is only safe together with `unitOf` in `markAnswer_` reading the POWER as part of the
   unit (see there): stripping `cm^2` while still calling it `cm` would mark an area right against
   a volume.

   ONLY AFTER A LENGTH, squared or cubed: `mm`, `cm`, `dm`, `m`, `km`, `units` — every unit the
   library writes with a caret. The first draft let a caret into ANY unit, and the sweep over the
   whole library said what that costs: `3x^2` marked right against `3`, `6w^2` against `6`,
   `2x^4y^2` against `2` — an algebra answer read as a coefficient with a unit after it, which is a
   wrong answer marked right. A letter and a power is also how algebra is written, and only the
   unit's own name tells the two apart.

   ANY LETTERS STILL COUNT AS A UNIT HERE, where `markBare_` now names its units. The two sides fail
   differently: a unit a child typed that this does not take off is a RIGHT answer refused ("5 N",
   "60 W", "50 Hz" on the physics papers, a unit nobody listed), and a unit the cell lists that
   `markBare_` wrongly takes off is a WRONG one passed. So the typed side stays generous, and a
   cell's own unit still has to match (`unitOf`). What that leaves is the one known gap, written down
   rather than closed: `3a` TYPED against a cell of a bare `3` passes, as `3.75 litres` against
   `3.75` does, because a bare-number cell lets any unit through and here a letter is a unit. That
   generosity is for a plain NUMBER and a plain unit, and only there — see `markAnswer_` for why a
   root, π or a compound unit does not get it.

   BUT A POWER IS NEVER A UNIT, AND ONLY A LENGTH TAKES ONE. The word began `[a-z°%²³]` and went on
   `[a-z0-9°%²³]*`, so `²` alone was a unit and so was `x²`: `3²` (which is 9) and `3x²` passed
   against a cell of `3`, and once a root could carry a unit, `√3²` (which is 3) against `√3`.
   Measured over the library: 378 ways put a power on a length — `cm²`, `m^2`, `mm3`, `units²`,
   `g/cm^3` — and 157 put one on another letter, every one of them algebra (`x^2`, `w²`, `n^3`). So
   the power is read the way the caret already was: on `mm`, `cm`, `dm`, `km`, `m` and `units`, and
   nowhere else.

   A NUMBER MAY END IN A ROOT OR π (`MARK_NUM`, shared with `markBare_`): `√3cm`, `√(3)cm` and
   `sqrt3cm` were "Not yet" on exact-trig Q17 once round 1 took the `√3cm` way out of its cell.

   A UNIT MAY BE A COMPOUND, `km/h`, `g/cm^3`: the slash was not a unit letter, so `12km/h` stayed
   whole against `12 km/h` and every speed and density typed closed up was refused — 23 ways the
   library sweep in check-marking.js found the first time it ran.

   AND A WORD IS READ ONE WAY. The unit was `[a-z][a-z0-9]*` repeated with nothing required between
   repeats, so `because` was one unit, or `b` + `ecause`, or any of the 64 splits — exponential, and
   2.8 s to mark "5 because the triangle is much bigger?" on a laptop, longer on a phone, on Check.
   The lookahead says a unit ends where its letters do; that matches the same strings with one way
   to read each, and the sentence takes 2 ms. */
```

### The unit a way carries, for `unitOf` in `markAnswer_` — built once, not once a way.

top level, before `MARK_UNIT_OF`

```
/* The unit a way carries, for `unitOf` in `markAnswer_` — built once, not once a way. ALL OF IT,
   every word up to the first thing that is not one: it read the first word only, so `12 km/h m`
   carried `km/h`, matched the cell's `12 km/h` and passed, and so did `15π cm^2 m`. A word that
   runs on into a power it may not take (`x²`) is no unit at all. */
```

### A NAME IN FRONT IS THE SENTENCE TOO.

in `markAnswer_`

```
/* A NAME IN FRONT IS THE SENTENCE TOO. The pyramid sheet prints `h = ....... cm` as its answer
       line and a child copies it: `h = 12.5 cm` was refused against a cell listing both `h=12.5`
       and `12.5 cm`, because a unit came off only after a bare number and a name came off nowhere,
       and `AB = 8.7 cm` the same against `8.7`. Taken off WHAT WAS TYPED, here, and only in front
       of a number — never in `markNorm_`, where it would fold the `y =` off `y = 2x + 3` on BOTH
       sides and make the equation of a line the same answer as the expression. So `h = 12.5`
       marks exactly as `12.5` would: right where the bare number is right, and a wrong letter
       still wrong against a cell that names its own (`y = 3` against `x = 3`). */
```

### ONLY AGAINST A WAY THAT HAS NO UNIT, OR THE SAME ONE:

in `markAnswer_`

```
/* ONLY AGAINST A WAY THAT HAS NO UNIT, OR THE SAME ONE: "1000 cats" is not "1,000 envelopes".

       AND THE POWER IS PART OF THE UNIT. This read `cm^2` and `cm^3` both as `cm`, so once a bare
       `60` was out of Area of Shapes Q1 — whose question asks for the units, and where `60 m²` and
       `60 mm²` were being marked Correct — `60 cm`, a LENGTH, still passed against the `60 cm^2` way.
       The caret is read, and on a LENGTH `^3`, `³` and `3` are one power: `cm^3`, `cm³` and `cm3`
       are the same unit and `cm^2` is a different one. Only on a length, for the reason MARK_UNIT
       gives: folding `w²` onto `w2` marked `6w2` right against `6w² − 10w`.

       A COMPOUND IS READ WHOLE, every part's power folded the same way: once `12km/h` could come
       off, reading only its `km` would have let `12km/minute` through against `12 km/h`. And the
       number in front may be a surd or a multiple of π, as `MARK_UNIT`'s is, or `√3 m` would carry
       no unit to compare and pass against `√3 cm`. */
```

### ---------- A BARE WAY LETS A UNIT THROUGH AFTER A NUMBER, AND ONLY THERE

in `markAnswer_`

```
/* ---------- A BARE WAY LETS A UNIT THROUGH AFTER A NUMBER, AND ONLY THERE ----------------------
       THE GENEROSITY ABOVE WAS MEASURED ON A PLAIN NUMBER AND A PLAIN UNIT: the SATs cells leave the
       unit out of a question that has one, so `3.75 litres` against `3.75` is a careful child, not a
       wrong one. Round 2 let a unit come off two more things — a root or π (`√3cm`, exact-trig Q17)
       and a compound (`12km/h`) — and the generosity came with them, where nobody had measured it.
       The sweep over the library said what it cost: `√3 m` passed on Q17, whose own cell says
       `√3 cm`, because the bare `√3` beside it let any unit through; `15πcm³`, a volume, passed on an
       area that lists `15π cm²`; `48π cm`, a length, on a sector's area; `2 kg/m^3` on a density
       listed `2 g/cm^3`; and `√3x`, `2√3²` (which is 12) and `3√5 kg` on every surd row. Wrong
       answers marked right, on 64 surd and π rows, every one of which orig and round 1 refused.

       SO WHAT ROUND 2 ADDED COMES OFF ONLY TO MATCH THE CELL. After a root or π, or as a compound,
       the unit typed — all of it, so `12 km/h m` is not `km/h` — has to be one the cell names, on
       any of its ways, and then every way is tried: `37.7 cm | 12π` is one circumference written
       twice, so `12π cm` is right there, and `57.08 km/h` is inside the band `57.07 to 57.1` that
       sits beside `57.1 km/h`. A cell that names no unit at all still takes a compound after a plain
       number, as it takes a plain unit (`15 km/h` against a speed listed `15`); a root or π it does
       not, which is what every version before round 2 did — `2√3 kg` is not an answer to "simplify
       √12", and `√3x` and `2πr` are algebra.

       A PLAIN NUMBER WITH A PLAIN UNIT KEEPS EXACTLY WHAT IT HAD, its first word compared, so
       `2.5 cm long` is still `2.5 cm`. Holding it to the cell's units too was measured and refused:
       the cell writes `°C` and the child writes `degrees`, the cell writes `£7.25 | 725p` and the
       pence would bind the pounds — right answers refused, which is the worse failure. */
```

### ---------- AND THE SPACE BETWEEN A NUMBER AND ITS LETTERS SAYS NOTHING

in `markAnswer_`

```
/* ---------- AND THE SPACE BETWEEN A NUMBER AND ITS LETTERS SAYS NOTHING ----------------------------
     `185 p` is `185p` and `7 m` is `7m`, whichever of the two the cell wrote. Typed the other way
     round from the cell, they used to meet in the middle — `markBare_` cut every answer at its first
     letter, so both became `185` — and when `markBare_` stopped cutting a single letter glued to a
     number (that is `7m` in "simplify 9m − 2m"), nothing compared the two any more: 43 spellings on
     36 rows went from right to wrong, eight of them pence (`725 p` against `£7.25 | 7.25 | 725p`)
     and the rest algebra (`3 a`, `6 cd`, `10 xy`, `6 w²`). So the space is taken out, on both
     sides, wherever a digit or π meets a letter — for this comparison only and never in
     `markNorm_`, because `markBare_` reads the cell's own space to tell the unit in `6.27 m` from the
     algebra in `7m`. The space that IS an answer, a mixed number's, sits between a digit and a
     digit (`1 1/6`) and is left alone. Measured over the library's 7,041 ways: 1,006 change, they
     fall into 314 sets that become one spelling, and every set is ways one cell lists side by side
     — bar two, each the same value and unit on two different questions (`300 cm³`, `16 kmh`). */
```

### ---------- A MULTIPLE-CHOICE QUESTION IS TAPPED, NOT TYPED

top level, before `choiceBox_`

```
/* ---------- A MULTIPLE-CHOICE QUESTION IS TAPPED, NOT TYPED ---------------------------------------
   ASKED FOR AS "if a question is multiple choice then they should just click on the choice, not have
   to type the answer in." Typing `P = I²R` on a phone is a test of the keyboard rather than of the
   physics, and a typed option has to be matched against the option's text, which is the one thing
   a closed list never needs: the position IS the answer.

   THE PICK IS STORED UNDER THE SAME KEY A TYPED ANSWER IS (`ansKey_`), as the positions — `3`, or
   `2,4` for "tick two" — so whose answer it is, signing out and coming back all behave as the box
   did. MARKED THE MOMENT ENOUGH ARE CHOSEN, against `choiceRight`, positions against positions.
   Where the mark scheme did not settle the right one (`choiceRight` empty) the pick is recorded
   and nothing is marked — a verdict nobody can stand behind is worse than none.

   DRAWN FROM THE STORED PICK, never left on the element by the handler: a repaint rebuilds the
   card, and a mark the handler added would go while the answer stayed — the `REEL_HELD` fault. */
```

### `is-done` SAYS THE QUESTION IS SETTLED, which `qp-choose` below already enforces by ignoring any further tap.

in `choiceBox_`

```
/* `is-done` SAYS THE QUESTION IS SETTLED, which `qp-choose` below already enforces by ignoring any
     further tap. Said on the box so the stylesheet can stop the options LOOKING pressable once they
     are not -- a button that presses in and does nothing is the "door with no handle" this
     repository keeps writing about. */
```

### THE TICK GOES ON YOUR PICK WHEN IT IS RIGHT, AND NOWHERE WHEN IT IS NOT.

in `choiceBox_`

```
/* THE TICK GOES ON YOUR PICK WHEN IT IS RIGHT, AND NOWHERE WHEN IT IS NOT. A wrong tap used to
         tick the right option on the spot, and that is the answer shown on the question card with
         nobody pressing anything -- the owner: *"answers should just stay hidden unless user unhides
         them"*, and before that *"you should have to click to reveal the answer"*. The verdict is
         about the pick ("Correct" / "Not yet"); which option the scheme credits is the answer, and it
         is on the answer page behind Show like every other answer. Still settled after one pick
         (`qp-choose`): with three wrong options and a free retry, "Correct" is reached by elimination. */
```

### THE OPTION'S OWN MARKUP, as the question's html is drawn:

in `choiceBox_`

```
/* THE OPTION'S OWN MARKUP, as the question's html is drawn: it is committed library content
         and carries the italics and superscripts an equation needs.

         NOT A TILE, AND THE ONE EXCEPTION ON THIS PAGE BESIDE THE KEYPAD'S KEYS. The owner made every
         control on a question's pages a tile (*"it should all be tiles"*) -- Check, Mark with AI, the
         pen's bar, Show and Hide. An option is not a control done TO the question; it is the answer
         being given, with its own words and its own maths in it, and a 44px square holding a mark
         cannot hold "P = I²R". So it stays a full-width button, the way a printed paper prints a box
         beside each answer. */
```

### WHERE THE ANSWER IS, NOT WHAT IT IS -- and short enough for one line at 320px:

in `choiceBox_`

```
/* WHERE THE ANSWER IS, NOT WHAT IT IS -- and short enough for one line at 320px: "Not yet --
         the answer has its own page" wrapped to two there, and the slot is one line tall. "See the
         answer page" pointed at the page after, and with Questions chosen there is no page after
         (`questionsView_`): the answers are the Answers chip, so that is what it names. */
```

### A tap picks; on "choose two" a second tap adds and a tap on a chosen one takes it back off.

top level, before `choiceRedraw_`

```
/* A tap picks; on "choose two" a second tap adds and a tap on a chosen one takes it back off. Once
   a marked question is answered it is settled: a second go after "Not yet" -- or after Show on the
   answer page -- would make "Correct" a thing anybody can reach by elimination. "Start again" is
   clearing the box. */
```

### THE OPTIONS DRAWN AGAIN FROM THE STORED PICK, where they stand — the verdict row and the saved line under them replaced with them, or the old ones would stay

top level, before `choiceRedraw_`

```
/* THE OPTIONS DRAWN AGAIN FROM THE STORED PICK, where they stand — the verdict row and the saved line
   under them replaced with them, or the old ones would stay beside the new. A tap does this, and so does
   a pick arriving from the account on another device (`ansRefresh_`, js/answers.js). */
```

### AN ORDERING IS TAPPED IN ORDER, NOT TYPED.

top level, before `ORDER_HOLE`

```
/* ==================================================================================================
   AN ORDERING IS TAPPED IN ORDER, NOT TYPED.

   THE OWNER, 8 Oct, of June 2024 Foundation Paper 1 Q4 -- "Write these numbers in order of size. Start
   with the smallest number. 0.21 0.2 0.03 0.1 0.16" -- after a pupil met it: *"as you can see there are
   multiple answers. I would prefer it be like an ordering system?? Idk. But simpler to mark for a
   machine."*

   WHY A BOX COULD NOT DO IT. `markParts_` reads a typed list as a SET: right for "list the factors of
   12", exactly wrong where the order IS the answer -- the question's own list, copied out unsorted, was
   marked right. So 299 cleared the `accept` of every ordering (045's rule, "an ordering has no
   accept"), and the card became words nobody could mark. And a list typed into a box has a dozen
   spellings -- commas, spaces, "and", 0.10 for 0.1 -- each one a way for a marker to be wrong.

   SO THE ITEMS ARE BUTTONS AND THE ANSWER IS THE ORDER THEY GO IN. A strip of numbered slots, the
   question's own two ends written over it, one at each edge with an arrow between ("Smallest ->
   Largest"), and the items under it in the order the paper prints them. A tap puts an item in the
   first empty slot; a tap on a placed one IN ITS SLOT takes it back and leaves its slot empty, so
   nothing else slides under the finger. Clear puts them all back.

   THE GHOST AN ITEM LEAVES IN THE ROW DOES NOTHING. It took the item back too, and it is the same size
   in the same place as the item, so a quick second tap -- which children make all the time -- undid
   the first: two real touch taps 70ms apart on 0.2 in Q4 put it in slot 2 and took it straight out
   again, nothing placed (`#screen` is `touch-action: none`, so neither tap is eaten as a zoom). And it
   is drawn dashed and faint, which reads as switched off, so what pressing it did was hidden. It is
   `disabled` now, and the handler refuses one as well; the slot is where an item is taken back.

   BUTTONS, NOT TILES, for the reason `choiceBox_`'s options are: an item is the answer being given, not
   an action done to it (CLAUDE.md). Clear and Send ARE actions on it, so they are tiles.

   MARKED ON SEND, POSITIONS AGAINST POSITIONS (`markOrder_`): right only when the row is one of the
   orders `choice_right` lists, so nothing is folded and nothing is guessed. A row with a slot still
   empty is not an answer, and Send says so rather than awarding a "not yet" -- the rule "Write
   something first" makes for an empty box. A miss can be rearranged and sent again, as a typed answer
   can: unlike three options, a hundred and twenty orders are not a thing anybody finds by elimination.

   STORED AS ITS POSITIONS under the card's `ansKey_` -- `3,4,5,2,1`, or `3,,5` with a hole -- through
   `ansStore_`, on this device as it is tapped. SEND IS THE SUBMISSION: the order and its verdict, one
   event on the account (`subRecord_`, js/submit.js) — *"if they submit a correct answer then change it
   and submit an incorrect answer, that's 2 events"* — and the row another device opens on is the latest
   one SENT. Placing an item is not one; it was the day you did it (`doneMark_`) until 9 Oct.

   DRAWN FROM THE STORE, every time, never patched by the handler -- the `REEL_HELD` rule `choiceBox_`
   keeps. The verdict is the latest submission's (`subLatest_`), drawn only while the row is still the
   row that was sent: move one item and it goes, the way typing takes a verdict off the box, and put it
   back and it returns, because it is about that row. It was held for the visit (`ORDER_SENT`) and gone
   on the next device. A row with a hole is not an answer, and Send's "Put all 5 in the row first" is
   the one thing held for the visit (`ORDER_HOLE`), drawn while the strip is still that row. */
```

### THE STORED ROW READ BACK AS n PLACES, 0 FOR AN EMPTY ONE -- AND ONLY IF IT IS A ROW AT ALL.

top level, before `orderSeq_`

```
/* THE STORED ROW READ BACK AS n PLACES, 0 FOR AN EMPTY ONE -- AND ONLY IF IT IS A ROW AT ALL.

   A TYPED LIST IS UNDER THE SAME KEY. Before these were orderings, 52 of them drew the keypad and 16 a
   text box, and what pupils typed is kept under this `ansKey_`, on the device and in the account's
   answers tab, which `myAnswers` brings back. Read piece by piece with `parseInt`, a typed list became
   a strip the pupil never made: 2406-2F-1's "-3, -1, 2, 4, 7" drew `_ _ −3 2 _`, 0617-5's "3/5, 65%,
   2/3, 0.68, 7/10" drew `0.68 _ 7/10 _ _`, and the next tap wrote that half-row to the account. No
   wrong verdict followed (a holed row is never marked), but a strip that opens already wrong is a
   wrong strip.

   SO THE WHOLE VALUE IS READ OR NONE OF IT: digits and commas only, at most n pieces, every piece that
   is not empty a whole number from 1 to n, none twice -- the only shape `orderSay_` ever writes.
   Anything else (a decimal, a fraction, a minus sign, %, a letter, a number past n) is an empty row,
   and the first tap replaces it. */
```

### ---------- MARKING AN ORDER

top level, before `markOrder_`

```
/* ---------- MARKING AN ORDER --------------------------------------------------------------------------
   `seq` is the row as stored (`3,4,5,2,1`) and `ways` every order that is right -- a `choice_right`
   cell (`2,1,3 | 1,2,3`) or the loader's arrays. TRUE when the row IS one of them; FALSE when every
   place is filled and it is none of them; NULL when there is nothing to mark against or a place is
   still empty, which is not an answer yet. Self-contained, so `check-marking.js` can cut it out and run
   it, as it runs `markAnswer_`. */
```

### EVERY SLOT AS WIDE AS THE WIDEST ITEM, EMPTY OR FULL, so the strip is the same shape from the first tap to the last.

in `orderBox_`

```
/* EVERY SLOT AS WIDE AS THE WIDEST ITEM, EMPTY OR FULL, so the strip is the same shape from the first
     tap to the last. Sized to what it held, an empty slot was 44px and a full one as wide as its
     number, so every tap pushed the slots after it along -- including the one the finger was going to
     next -- and at 320 the strip wrapped one way empty and another way full, dropping the row of items
     16px under the finger (measured, `check/states.js`). Counted in characters, because the face is
     monospaced (`--font`); an entity counts as one, so a stacked fraction is over-counted, which only
     errs wide. The stylesheet caps it at the strip's width. */
```

### THE FACE IS ONE ELEMENT, `.qp-face`, IN THE SLOT AND IN THE ROW.

in `orderBox_`

```
/* THE FACE IS ONE ELEMENT, `.qp-face`, IN THE SLOT AND IN THE ROW. A slot and an item are
     `inline-flex`, and every child of a flex box is a flex item of its own: a bare `<sup>` stopped being
     raised (`vertical-align` does not apply to a flex item) and was centred beside its digit, so 2² read
     as "22", 1³ as "13" and 6 × 10⁴ as "6 × 104" -- measured at 390, the exponent level with the digit
     where the question prints it 6px up. An ordering read that way is ordered wrong. Wrapped, the face
     is one flex item with an ordinary line inside it, and a power is a power again. Fractions never
     showed it: `typeset_` already draws one as a single element. */
```

### A PLACED ITEM IS A BUTTON IN ITS SLOT, to take it back; an empty slot is a numbered space and not a button, because pressing it does nothing.

in `orderBox_`

```
/* A PLACED ITEM IS A BUTTON IN ITS SLOT, to take it back; an empty slot is a numbered space and not a
     button, because pressing it does nothing. Its number stays on it once it is filled, small, so a row
     that has wrapped at 320 still reads 1 to n. */
```

### THE ITEMS STAY WHERE THE PAPER PRINTS THEM.

in `orderBox_`

```
/* THE ITEMS STAY WHERE THE PAPER PRINTS THEM. A placed one is a ghost of itself, the same size in the
     same place, so the row under the finger never closes up -- and the ghost is `disabled`, because a
     ghost that took the item back made a quick second tap undo the first (see the note over
     `ORDER_HOLE`). An item is taken back from its slot. */
```

### THE VERDICT'S LINE IS RESERVED AND THE TILES SIT IN IT, so "Correct" lands in a space that was already there and marking moves nothing (261).

in `orderBox_`

```
/* THE VERDICT'S LINE IS RESERVED AND THE TILES SIT IN IT, so "Correct" lands in a space that was already
     there and marking moves nothing (261). No Send where no order is right: a Send that marks nothing is
     the control that sometimes does nothing. */
```

### THE TWO ENDS ARE THE ONLY WORDS SAYING WHICH WAY THE ROW RUNS, so they are a line of their own over the slots, one at each edge with an arrow between, at the

in `orderBox_`

```
/* THE TWO ENDS ARE THE ONLY WORDS SAYING WHICH WAY THE ROW RUNS, so they are a line of their own over
     the slots, one at each edge with an arrow between, at the verdict's size in the paper's own ink.
     They were .62rem capitals in `--paper-dim` at the two ends of the slots' own row -- 9.2px at 390,
     about 8.4px at 320, the smallest words on the card, for a KS1 child to read -- and as flex items in
     that row they forced a wrap at every width: at 768 "LARGEST" sat alone on a line under slot 5.
     Sentence case, because they are words to read and not a label. Hidden from a screen reader only
     because the group's label already says them, in order. */
```

### DRAWN AGAIN FROM THE STORE, where it stands -- a tap, Clear and Send do this, and so does a row arriving from the account on another device

top level, before `orderRedraw_`

```
/* DRAWN AGAIN FROM THE STORE, where it stands -- a tap, Clear and Send do this, and so does a row arriving
   from the account on another device (`ansRefresh_`, js/answers.js). `focus` is the control to hand the
   focus back to, so a keyboard is not dropped onto the page by the redraw. */
```

### A SLOT TAKES BACK AND AN ITEM PLACES, AND NOTHING ELSE.

top level, before `fromSlot`

```
/* A SLOT TAKES BACK AND AN ITEM PLACES, AND NOTHING ELSE. An item already in the row -- its ghost,
     pressed after all, or a strip on screen older than the store -- changes nothing: the stored row is
     drawn again and the press is done. That refusal is what stops a double-tap undoing itself (the
     ghost is `disabled` as well; this is the half that does not depend on the browser). */
```

### ENOUGH CHOSEN IS A SUBMISSION, marked at once:

top level, before `said`

```
/* ENOUGH CHOSEN IS A SUBMISSION, marked at once: right or wrong against `data-right`, and `sent` where
     the scheme never settled one -- those picks stay open, so every pick that completes one again is
     another event (js/submit.js). */
```

### RIGHT DOES NOT OPEN THE ANSWER PAGE ANY MORE.

top level, before `ansBox_`

```
/* RIGHT DOES NOT OPEN THE ANSWER PAGE ANY MORE. It did, from 263 on; the verdict on this card --
     "Correct" with your pick ticked, or "Not yet" with nothing ticked -- is the answer to "was I
     right", and the page after opens when somebody taps "Show the answer" and not before. See
     `ansOpen_`, and `choiceBox_` for why a wrong pick no longer ticks the right one. */
```

### MARKABLE ONLY WHERE `accept` SAYS SO.

in `ansBox_`

```
/* MARKABLE ONLY WHERE `accept` SAYS SO. A question with no machine-checkable answer gets the
     box it always had and no button, rather than a Check that shrugs -- a control that sometimes
     does nothing is worse than one that is not there. */
```

### EVERY ANSWER IS TYPED ON THE SITE'S OWN PAD, a maths one opening on the maths keys and a worded one on the letters.

in `ansBox_`

```
/* EVERY ANSWER IS TYPED ON THE SITE'S OWN PAD, a maths one opening on the maths keys and a worded
     one on the letters. It was "worded answer normal device keyboard" until the owner, 8 Oct: *"Make
     the keypad never need to use their own keyboard … I just want self contained system really"* --
     keypad.js says why and how. Which is which, the pad, the box (`kpField_`, the one place it is
     drawn and locked) and "Mark with AI" are all keypad.js; this only chooses. Both boxes are
     `.qp-ans-in` with the same `data-k`, so Send, the save on `input` and every check that types into
     one are unchanged. */
```

### THE SIGNS ROW GOES BY THE SCHEME, WHATEVER KIND OF BOX IT IS.

in `ansBox_`

```
/* THE SIGNS ROW GOES BY THE SCHEME, WHATEVER KIND OF BOX IT IS. This passed `maths && kpSigns_(x)`,
     and the review of 8 Oct found the eleven it shut out: `x < 4 or x > 5`, `93.5 ≤ length < 94.5`,
     `6:18 pm` -- schemes with a word in them, so `ansMaths_` gives them a WORDS box, and every way
     `markAnswer_` accepts needs a sign the letters do not have. Before 8 Oct the phone's keyboard typed
     them; after it nothing did. On a worded box the row is on the `123` face (`kpLayout_`). */
```

### NO CAPTION OVER THE BOX.

in `ansBox_`

```
/* NO CAPTION OVER THE BOX. It said "<name>'s answer", and the owner: *"remove 'names answer'.
     that is redundant."* The name is still what the answer is filed under (`ansKey_`), and a screen
     reader still hears "Your answer" from `aria-label`. */
```

### ---------- THE FIGURE TILE STANDS BESIDE THE BOX, NOT IN THE ROW UNDER IT

in `ansBox_`

```
/* ---------- THE FIGURE TILE STANDS BESIDE THE BOX, NOT IN THE ROW UNDER IT --------------------------
     THE REVIEW OF THE MULTI-PART MERGE, at 320x568: 1F Q23b's box raised the keypad (its top at 315) and
     the row under the card -- Check, Figure and the old way to the answer -- stood at 322-437, all under
     it. The tile is there to show the Venn WHILE the child answers, and that is exactly when it was
     hidden; a tap where it had been typed a 4. The column cannot scroll it into view: the pages are a
     strip on transforms and a card is sized to its screen (`partChunks_`), so there is nothing below to
     scroll to. SO IT STANDS IN THE BOX'S OWN LINE: whenever the box is on the screen the figure is one
     tap away. Options to tap are not a box and keep the tile in the row (`questionTiles_`). */
```

### ---------- THE ANSWER BOX IS A CHAT BAR, WITH A SEND TILE

in `ansBox_`

```
/* ---------- THE ANSWER BOX IS A CHAT BAR, WITH A SEND TILE ------------------------------------------
     THE OWNER, 8 Oct, after a lesson on a pupil's iPad in the sun: *"the answer box should look like a
     chatbox. with send tile. we found it hard to find answer box in the ipad in the sun."* Measured on
     that screen: the box was `--sunk` on a `--raised` card, 1.04:1, with a 1.25:1 rule under it -- an
     empty black rectangle on a black card, with no words in it -- and Check was a dark plate at 1.05:1.
     In glare only the glyphs were left.

     SO THE FIELD IS PAPER, the second palette (`--paper`, `--paper-ink`): 17:1 against the card, and
     it always stood in for the sheet the answer is written on. It says "Type your answer" while it is
     empty -- the drawing's own line (`.kp-show:empty`), because the box under it is invisible. A
     field rounded like every phone's message bar, which is a shape everybody already reads as "type
     here".

     SEND IS A TILE, GOLD AND ROUND, BESIDE THE FIELD AND NOT IN IT. A tile because a question's pages
     are all tiles (*"it should all be tiles"*), the paper aeroplane because that is the mark for send
     (`TILE_ICONS.send`), and gold on the dark card (11:1) rather than inside the cream, where gold
     measured 1.56:1. It is Check -- `.qp-check`, the same handler, the name the keypad's ✓ and the checks
     find it by -- so only its face changed. MARK WITH AI IS THE SAME TILE for a worded answer with no
     scheme to match (`aiTile_`).

     AND A BOX WITH NEITHER HAS A PLAIN SEND, signed in (`qp-send`). It had no tile at all -- "a Send that
     sends nowhere is the control that sometimes does nothing" -- and typing was saving. THE OWNER, 9 Oct:
     *"I just want system to record each submition."* An answer reaches the account when it is SENT
     (js/submit.js), so every box a child can write in has to be able to send it: about 399 maths
     answers with no scheme, every worded one while AI marking is off, a practical's worksheet boxes.
     Its verdict is `sent` -- nothing marks it -- and it says "Sent". NOT `.qp-check`, because Check
     marks against a scheme and this has none -- its own name, `qp-send`, which the keypad's gold key and
     a laptop's Enter run too (`kpDone_` runs the box's own control: Check, else Send, else Mark with
     AI; the review of 9 Oct found it running Check alone, so on every box like this the key sent
     nothing). Signed out there is no account to send it to, so no tile, as before.

     THE VERDICT IS A LINE OF ITS OWN UNDER THE BAR, its height reserved, so "Correct" lands in a space
     that was already there and marking moves nothing (261). `.qp-mark` wraps the bar and the line, so
     `qp-check` and `qp-ai` still find their verdict by `closest('.qp-mark')`, and the input listener
     still finds `.qp-mark[data-accept]` on the card. */
```

### ---------- AN ESSAY IS WRITTEN ON A SHEET, NOT IN A CHAT BAR

in `ansBox_`

```
/* ---------- AN ESSAY IS WRITTEN ON A SHEET, NOT IN A CHAT BAR -----------------------------------------
     THE OWNER, 9 Oct, about a pupil on a forty-mark creative writing question: *"firstly it doesnt let him
     do paragraphs and also i want it to mark with ai."* The chat bar above is a pill that grows to five
     lines and scrolls inside -- four paragraphs seen through a letterbox. So an answer that is extended
     writing (`ansEssay_`, keypad.js, which says which 281 rows and why six marks) is drawn as a SHEET:
     the card's full width, the paper palette, ruled, eight lines tall on a phone and twelve on a tablet
     before a word is written, growing with the essay up to the room above the pad (and the room its card
     has, `kpSheetFit_`), then scrolling inside with the line being typed kept in view (`kpBox_`,
     `kpCaretSeen_`). Its newlines are drawn, so a paragraph is a paragraph.

     THE ROW UNDER IT IS TILES, because it is the action row under a thing (CLAUDE.md): Mark with AI, or
     Send where a scheme can be checked, the Figure tile, and the word count -- a count rather than a
     silence, and the number a pupil looks at while writing. With no tile to draw, one faint line says
     why (`aiWhyNot_`). The verdict, the saved line and the AI's points keep their classes and their
     reserved lines, so `qp-ai`, `qp-check`, the `input` listener below and every check find them where
     they always were. `.qp-compose` for the verdict's reserved line; `.qp-mark` only when there is a
     verdict to hold, as on the bar. */
```

### THE REVIEW OF 9 OCT ADDED TWO THINGS TO THIS ROW.

in `ansBox_`

```
/* THE REVIEW OF 9 OCT ADDED TWO THINGS TO THIS ROW. THE TILE'S NAME, SAID BESIDE IT (`.qp-ai-say`): a
     tile is a mark with its name in `aria-label`, and on an iPad Mark with AI was a gold sparkle beside
     "177 words" with nothing saying what it would do -- for the one action this whole sheet exists to
     end in. Hidden from a screen reader, which already hears the tile's own name. AND A KEPT MARK
     (`aiKeptView_`, keypad.js): an essay marked earlier is drawn with its verdict and its points, fresh
     or "before your changes", so a reload or a swipe away and back does not throw the feedback out. */
```

### AND SINCE 9 OCT (note 308) THE SHEET IS SENT LIKE EVERY OTHER BOX:

in `ansBox_`

```
/* AND SINCE 9 OCT (note 308) THE SHEET IS SENT LIKE EVERY OTHER BOX: with AI marking off it has the
     plain Send (`subSendTile_`, verdict `sent`), and the faint line still says why nothing marks it --
     the Send is how the essay reaches the account now, not a mark. ITS VERDICT LINE is the latest
     submission's while the sheet holds what was sent, as on the bar; a mark kept on this device
     (`aiKeptView_`) is drawn instead when it is about these very words, or when no submission is --
     "before your changes" and the points the pupil is revising from. A submission about these words
     that is not the kept mark's (sent from another device, or a plain Send since) is the newer
     reading, and the kept mark's points, about other words, are not shown under it. */
```

### THE VERDICT IS THE LATEST SUBMISSION'S, WHILE THE BOX HOLDS WHAT WAS SENT -- on this device or on the account, next sign-in

in `ansBox_`

```
/* THE VERDICT IS THE LATEST SUBMISSION'S, WHILE THE BOX HOLDS WHAT WAS SENT -- on this device or on
     the account, next sign-in (*"they would see incorrect answer there next time they login"*). Typed
     over since, it is a draft of this device's, and there is no verdict on it. */
```

### ---------- THE VERDICT

top level, before `box`

```
/* ---------- THE VERDICT ------------------------------------------------------------------------
   IT SAYS "NOT YET" AND NOT "WRONG", and that is not softness. These are practice sheets a child
   works through alone while a tutor is with somebody else; the whole value of marking your own
   work is that you get another go at it, and a verdict that reads as final is one that ends the
   attempt. The mark scheme is one tap below either way.

   NOTHING TYPED IS NOT A WRONG ANSWER. Pressing Check on an empty box asks for the answer, it
   does not award a cross. */
```

### A RIGHT ANSWER DOES NOT OPEN THE ANSWER PAGE.

top level, before `box`

```
/* A RIGHT ANSWER DOES NOT OPEN THE ANSWER PAGE. It did -- "the answer opens itself once it has
     been earned" -- and that was a reveal nobody pressed, on the page after the one being read. The
     owner's rule is one tap, the same for everybody: *"you should have to click to reveal the
     answer."* "Correct" here is the verdict, and the working it used to open is not drawn at all. */
```

### ---------- SEND, WHERE NOTHING CAN MARK IT

top level, before `box`

```
/* ---------- SEND, WHERE NOTHING CAN MARK IT -----------------------------------------------------------
   *"I just want system to record each submition."* A box with no scheme and no AI marking -- a maths
   answer with no `accept`, a worded one while AI marking is off, a practical's worksheet -- is sent as it
   is, verdict `sent` (js/submit.js), and says "Sent": the answer is on the account, and the tutor or the
   answer page is what marks it. Found by its own `.qp-mark`, not the card's first box: a practical's
   worksheet has three in one sheet. Nothing typed is not an answer, and is not sent. */
```

### ---------- WHO IS WORKING

top level, before `el`

```
/* ---------- WHO IS WORKING ---------------------------------------------------------------------
   NOT A LOGIN AND IT DOES NOT PRETEND TO BE ONE. Signing in needs a row in the Ledger and a PIN,
   which is a spreadsheet edit -- not something a tutor can do at a kitchen table for a boy who
   turned up today. This is a name in `localStorage`, it protects nothing and is sent nowhere, and
   it does exactly two jobs: it keeps two students' answers in separate drawers on one phone, and
   it tells the card that somebody is being ASKED the question rather than reading from it.

   CLEARING IT IS THE TUTOR'S OWN VIEW, which is why the empty answer is not a refusal. Leaving
   the box blank puts the screen back the way it is for whoever is reading from it: every mark
   scheme open, no Check button in the way.

   `prompt` RATHER THAN A SHEET, deliberately. openSheet is the app's own dialog and is the right
   thing for a form; this is one word, typed once a lesson, and a sheet that has to be built,
   opened, read and closed for one word is slower to use and far more to go wrong in the middle
   of a lesson. */
```

### ---------- `on('qp-who')` WAS HERE

top level, before `el`

```
/* ---------- `on('qp-who')` WAS HERE ------------------------------------------------------------
   IT OPENED A `window.prompt` ASKING WHO WAS WORKING and wrote the answer to `workingAs`. Removed
   with the name box above it: the app already knows who is signed in, and a second place to say
   who you are is a second place for the two to disagree. See `whoIs_`. */
```

### SAVED AS IT IS TYPED, through a delegated listener rather than a handler per box — there are thousands of these and only one of them is ever being typed into.

top level, before `el`

```
/* SAVED AS IT IS TYPED, through a delegated listener rather than a handler per box — there are
   thousands of these and only one of them is ever being typed into. STILL NO SAVE BUTTON, though there
   is something to save it to now: the account, signed in (`ansStore_`). Typing IS saving — on the device
   at once, on the account a moment later and at once on Check or leaving the box — and the line under
   the box says which has happened (`ansSavedSay_`). A button would be a second way to do what already
   happens, and the one people would forget to press. */
```

### THROUGH `ansStore_`, which keeps it on this device.

top level, before `el.style.height`

```
/* THROUGH `ansStore_`, which keeps it on this device. It reaches the account when it is SENT
     (js/submit.js) -- typing is not a submission, and since 9 Oct it is not a day "done" either. AND
     WHETHER IT IS WORDS: an answer typed signed out after a session ended is joined to that person's own
     as words are (`ansJoin_`, note 317). */
```

### A WORDED ANSWER GROWS AS IT IS TYPED, the way a message bar does:

top level, before `el.style.height`

```
/* A WORDED ANSWER GROWS AS IT IS TYPED, the way a message bar does: one line while it is one line
     (`rows="1"`, the chat bar in `ansBox_`), then downward a line at a time to the stylesheet's cap,
     then it scrolls inside. `field-sizing: content` does this where the browser has it; Safari -- the
     owner's iPad -- does not, so the height is set here as well. Downward, because the card is held
     where it is while its box has the focus (`HOLD_AT`).
     NOT THE PAD'S BOX (`.kp-in`), which is every answer box now: it is invisible and laid over its
     drawing, and the drawing is what grows (`.kp-words > .kp-show`). Measured with the prototype on 8
     Oct, a height written here on that box made it about 600px tall, and the keypad's lift, measuring
     it, threw the card 654px off the top of the screen. */
```

### A VERDICT IS ABOUT THE ANSWER IT MARKED, and the moment a letter changes it is about an answer that is no longer there.

top level, before `mark`

```
/* A VERDICT IS ABOUT THE ANSWER IT MARKED, and the moment a letter changes it is about an answer
     that is no longer there. "Correct" beside "16", left from when the box said "15", is the app
     vouching for something it never read. So typing takes the verdict off -- its words, its colour,
     the tick -- and leaves the SLOT, which is the row's own height whatever it holds, so nothing
     under it moves. Sending marks the new answer when it is pressed again. AND TYPED BACK TO THE
     ANSWER LAST SENT, the verdict is that answer's again: it is drawn from the latest submission
     (`subVerdictPaint_`, js/submit.js), not left on the element. Every kind of box -- Check, Mark with
     AI, the plain Send -- by its own `.qp-mark`, so a worksheet's three boxes are three. */
```

### SOME ANSWERS ARE A MARK ON THE PICTURE, AND A TEXTAREA CANNOT HOLD ONE.

top level, before `padItemKey_`

```
/* ==================================================================================================
   SOME ANSWERS ARE A MARK ON THE PICTURE, AND A TEXTAREA CANNOT HOLD ONE.

   REPORTED AS "what about questions which have diagrams and you are meant to draw on them? the
   answer box bit will need a rework right." Right. "Draw a box plot for this information",
   "enlarge shape P by scale factor -1/2", "mark with a cross the probability that…", "draw a line
   of best fit" — the paper's answer space IS the diagram, and `ansBox_` above offers a box for
   words. Somebody working through November 2017 Paper 1 could write "the median is at 165" and
   could not do what the question asked, which is worth three marks.

   SO THE DIAGRAM ITSELF TAKES THE PEN. `padWrap_` lays a transparent SVG over the question's own
   picture, at the picture's own coordinates, and a finger draws on it. That is what a printed paper
   is: the figure and the answer space are one object.

   A REAL PICTURE WHERE THERE IS ONE, AND A SURFACE WHERE THERE IS NOT. This paragraph used to say
   "only where there is a real picture", and argued that a blank grid under "enlarge triangle T" was
   a question you cannot answer wearing the clothes of one you can. The owner, tutoring from it,
   decided the other way -- *"some questions require answers on diagram. So should have a diagram for
   them to draw on"* -- and the reasoning is written where the surfaces are (`padSurface_`): a surface
   that says it is not the paper's figure, under a pen, beats a word box that cannot hold a line.
   `check-library.js` prints how many are on their own picture and how many on a surface.

   THE PEN IS OFF UNTIL YOU ASK FOR IT. A surface that takes the finger has `touch-action: none`,
   and a `touch-action: none` region taller than the phone is a region you cannot scroll past —
   the page would trap you on a diagram. Off, the pad is an ordinary picture and the screen behaves
   exactly as it did. One tap on a 44px control turns it on, and the pad says so with a gold frame,
   because a mode you cannot see is a mode that surprises you.

   MARKS ARE STORED IN THE PICTURE'S OWN COORDINATES, not in pixels. Every diagram here lays out
   inside `viewBox="0 0 340 H"` (see the note about `W` in CLAUDE.md), so a stroke recorded there is
   the same stroke on a 320px phone and a 1280px laptop. Pixels would put yesterday's answer half an
   inch off the axis the moment you turned the phone.

   SAME STORAGE AND SAME REASON AS `ansBox_`: these cards are rebuilt on every repaint, and a
   rebuilt SVG is an emptied one. `pad:<row_id>` sits beside `ans:<row_id>`, every read and write
   wrapped, because private mode THROWS on `localStorage` rather than answering null.

   GOLD, BECAUSE THE PAPER'S INK IS `currentColor`. Your marks have to be visibly yours — that is
   what a pen on a printed paper does, and it is what lets you tell your line of best fit from the
   axis it was drawn against.
--------------------------------------------------------------------------------------------- */
```

### ---------- AND THEY ARE WHOEVER IS SIGNED IN'S, AS THE TYPED ANSWER IS

top level, before `padItemKey_`

```
/* ---------- AND THEY ARE WHOEVER IS SIGNED IN'S, AS THE TYPED ANSWER IS ------------------------------
   THE KEY WAS `pad:<question>` AND NOTHING ELSE, so the pen kept one set of marks per PHONE while the
   box beside it kept one set of answers per PERSON (`ansKey_`). Found by the multi-part audit: Ali
   draws on 2F Q8c, Ben signs in on the same phone, and Ben's grid already has Ali's lines on it --
   the two-boys-on-one-phone case `whoIs_` was written for, answered for the words and not the ink.
   287 parts take the pen and 14 ring words, and every one of them was shared.

   SO THE KEY CARRIES `whoIs_` EXACTLY AS `ansKey_` DOES -- `pad:u:P7:<question>` signed in, the old
   `pad:<question>` signed out -- and nothing else changes: `circKey_` is this plus `:words`, the
   handlers write to the pad's own `data-k`, and `PAD_ON` / `PAD_TOOL` key by it, so a new person is a
   new key everywhere at once.

   THE MARKS ALREADY ON THE PHONE MOVE ONCE, TO THE FIRST PERSON SIGNED IN WHO OPENS THEM
   (`padAdopt_`). Everything drawn before today is under the bare key and belonged to whoever held
   the phone; the person who opens the page first is the likeliest to be them, and MOVING rather than
   copying is what makes it theirs -- a copy left under the bare key would be read by the next
   person too, which is the fault itself carried forward. Never over marks the person already has:
   those are newer than anything the phone kept. */
```

### ---------- `pad:` IS A QUESTION'S, AND A PEN THAT IS NOT ON A QUESTION SAYS SO IN ITS KEY

top level, before `padPrefix_`

```
/* ---------- `pad:` IS A QUESTION'S, AND A PEN THAT IS NOT ON A QUESTION SAYS SO IN ITS KEY ----------
   EVERY `pad:` KEY IS AN ANSWER as far as the rest of the app is concerned: answers.js sends it to the
   account's `answers` tab (`ansStore_`, and the backlog sweep in `answersAdopt_` that walks every
   `pad:<who>:` on the device), and that tab is the record of what a child answered. So the one pen
   that is not on a question -- the whiteboard, `WB_ITEM` below -- names its own prefix (`prefix:
   'board'`), and its marks are `board:u:P7:whiteboard`: the same per-person key, the same handlers,
   and a shape answers.js does not recognise, so it is kept on the device and never read as a
   question somebody answered. The argument is written over `WB_ITEM`. A question names nothing and is
   `pad:` exactly as it always was. */
```

### "EMPTY" IS ASKED OF THE WRITER'S OWN READER (`ansValue_`, answers.js), the visit's copy first.

in `padAdopt_`

```
/* "EMPTY" IS ASKED OF THE WRITER'S OWN READER (`ansValue_`, answers.js), the visit's copy first. This
       asked `localStorage`, and a pad the store had REFUSED — held by the visit and drawn, "Not saved" under
       it (317) — was empty to it: a drawing made signed out (another tab, signed out there) was moved over
       the person's strokes when their card was drawn again, and the page going wrote that over theirs
       (317, "Six edges closed", P4). The signed-out one is read the same way, and goes the same way. */
```

### WHICH QUESTIONS GET ONE.

top level, before `PAD_TYPES`

```
/* WHICH QUESTIONS GET ONE. The sheet says what kind of answer it wants, and two of its words mean
   "make a mark": `drawing` (produce a figure) and `annotate` (add to one). Both need a surface and
   neither has anywhere else to go. Everything else — a calculation, an explanation, a proof — is
   words, and words already have a box. */
```

### THE PICTURE IT DRAWS ON, WHICH IS NOT ALWAYS THE QUESTION'S OWN.

top level, before `padSource_`

```
/* THE PICTURE IT DRAWS ON, WHICH IS NOT ALWAYS THE QUESTION'S OWN. November 2017 Q12(a) is "draw a
   box plot for this information" and the empty grid is on the question's PREAMBLE, because parts
   (a) and (b) share it — exactly what a preamble is for. So this reads the same list `preamble_`
   built, innermost last, and takes the last picture on the card: the one nearest the part being
   asked is the one the part is about.

   IT RETURNS THE MARKUP, NOT A FLAG, so the card can draw the picture under the pen -- in its place among
   the words (`figHtml_`), or where the box would be for a made-up surface (`ansArea_`). One picture, one
   place: never a pen on the card and the same figure on a page beside it (356).

   AND WHERE THERE IS NO PICTURE, A SURFACE (`from: 'surface'`) -- squared paper, axes or a blank
   space, by `padSurface_`. Not for "text": that question's surface is its own passage, on the card.
   A row naming a surface explicitly is given one whatever its `answer_type`; a "text" one draws no
   picture unless the question is also answered by drawing. */
```

### A ROW WITH OPTIONS IS ANSWERED BY CHOOSING ONE, and is given nothing to draw on (18 Oct, 356):

in `padSource_`

```
/* A ROW WITH OPTIONS IS ANSWERED BY CHOOSING ONE, and is given nothing to draw on (18 Oct, 356): three
     KS2 rows (GPS1-2, GPS1-9, 2024 P2 Q26) say `drawing` and carry choices, and a made-up blank square
     beside the options asked for a second answer the marking never reads. */
```

### ---------- WHAT A QUESTION IS ANSWERED WITH: A DRAWING, A VALUE, OR BOTH

top level, before `answerKinds_`

```
/* ---------- WHAT A QUESTION IS ANSWERED WITH: A DRAWING, A VALUE, OR BOTH ---------------------------
   THE ONE TEST, read by the card (`ansArea_`, `cardFig_`), the checks and check-library alike, so no two of
   them can disagree about which questions are drawn. The owner, 18 Oct, over June 2024 1F Q7 with a box,
   a Draw switch and the grid a page away: *"why would there be an option for text answer in the first
   place?"* So a question answered by drawing is drawn, on its card, with no box -- and a box only where the
   row has an `accept` to mark a typed value against (the hexagon's "how many sides", the bearings
   questions' "write down the bearing"): then both, the drawing where the paper puts it and the box at the
   foot, the card's own order. A value that cannot be marked is written on the figure, as on the paper. */
```

### ---------- WHICH TOOLS A QUESTION'S PEN COMES WITH

top level, before `padTools_`

```
/* ---------- WHICH TOOLS A QUESTION'S PEN COMES WITH ------------------------------------------------
   ASKED FOR AS *"some questions require a compass or ruler. so should have a tile for these things. if
   you cant find those questions dont worry just have the infrastructure set up for it."* The pen is
   always there; a Ruler and a Compass are added where the QUESTION says so, in either of two places:

     `needs`            what the card already tells you to bring -- the paper's cover and the row's own
                        cell, unioned (`needsOf_`). "Ruler", "Compass" and "Protractor" are the closed
                        spellings `check-library.js` holds; "compasses", "pair of compasses", "straight
                        edge", "angle measurer" and a "geometry set" are read too, in case a cell is
                        typed the way a paper prints it.
     the words          the question's own, its lead's and its stems': "Use a ruler", "ruler and
                        compasses", "construct", "bisector", "locus", "loci". A construction is ruler and
                        compasses together. NOT "plotting compasses" (a physics field diagram, which has
                        nothing to do with drawing circles), NOT "construct a table / tree / graph", and
                        NOT "ruler" as a thing in a word problem ("12 rulers cost...") -- only "use /
                        with / using a ruler" says it is in your hand.

   `protractor` IS ANSWERED and drawn as nothing: there is no protractor tool, because one that is any
   use is a scale you lay over a figure and read, not a mark you make, and that is not this bar's kind
   of tool. Answering it anyway keeps the decision in one place for the day one exists, and lets
   `check-library.js` count how many questions would have it.

   ONE FUNCTION, NOTHING FROM OUTSIDE IT, so `check-library.js` can cut it out by name and count what
   the library gets -- the `padSurface_` arrangement. No `{` in a pattern, for the same reason: the
   cutter counts braces. */
```

### THROUGH `ansValue_`, THE WRITER'S OWN READER (js/answers.js), and not `localStorage` beside it.

top level, before `padRead_`

```
/* THROUGH `ansValue_`, THE WRITER'S OWN READER (js/answers.js), and not `localStorage` beside it.
   Every stroke is read, appended to and written back whole, so a read that disagrees with the last
   write builds the next one on a stale list. Read straight from `localStorage`, a store that THROWS
   (private mode) answered an empty list every time, so each stroke replaced the last in `ANS_MEM`
   and Undo found nothing; `ansValue_` falls back to the visit's copy exactly then. A store that is
   merely FULL still answers the old list -- so `ansValue_` asks `keepHeld_` (data.js) before it asks
   the store, and a stroke the store refused is read back from the visit, the list on the screen (317;
   `padSave_`, below). */
```

### A STROKE IS A POLYLINE AND THAT IS THE WHOLE FORMAT.

top level, before `PAD_CORNER_DEG`

```
/* A STROKE IS A POLYLINE AND THAT IS THE WHOLE FORMAT. `[[x,y,x,y,…], …]` — one flat list of
   rounded coordinates per stroke, because a list of {x,y} objects is three times the characters for
   the same marks and `localStorage` is a few megabytes shared with everything else this app keeps.
   Rounded to whole units of a 340-wide picture, which is finer than a finger. */
```

### ---------- A FAST LINE IS DRAWN ROUND: CORNER-KEEPING CENTRIPETAL CATMULL-ROM (338)

top level, before `PAD_CORNER_DEG`

```
/* ---------- A FAST LINE IS DRAWN ROUND: CORNER-KEEPING CENTRIPETAL CATMULL-ROM (338) ---------------------
   MEASURED BEFORE: one turn of a circle in 200ms, at 4x CPU on a phone, stored 10 points -- a lopsided 9-gon
   with a 114px chord -- and on an iPad without coalesced samples that is all a fast line will ever have. The
   STORE is right (every point the finger gave, rounded to a unit); the DRAWING was a polyline through it. So a
   long, gently turning segment is drawn as a curve THROUGH the two stored points at its ends, and nothing
   stored changes: every drawing on every device and account loads as it was and is drawn round where it was
   a polygon of a curve, and an older copy of the app draws a new stroke as the polyline it always drew.

   THE MATHS, in Q = (x, k·y) -- proportional to screen pixels, because 340 units span the box's width AND its
   height (`preserveAspectRatio="none"`), so `k` = H/W of the box (`padAspect_`). A segment Qi -> Qi+1 is a
   cubic with centripetal handles (alpha = 1/2; Yuksel, Schaefer and Keyser 2011: the one member of the family
   with no cusps and no self-intersection within a segment), d0 = |Qi - Qi-1|^1/2, d1 = |Qi+1 - Qi|^1/2,
   d2 = |Qi+2 - Qi+1|^1/2:
     B1 = (d0^2 Qi+1 - d1^2 Qi-1 + (2d0^2 + 3d0d1 + d1^2) Qi) / (3d0(d0 + d1))
     B2 = (d2^2 Qi - d1^2 Qi+2 + (2d2^2 + 3d2d1 + d1^2) Qi+1) / (3d2(d2 + d1))
   and at a CORNER the handle runs along the chord (a third of it), which is the same formula with a
   reflected phantom point. A vertex turning 50 degrees or more is a corner, and so are the two ends.
   WHY 50: a circle of 8 or 9 points a turn (45 and 40 degrees -- the measured fast circles) comes out round,
   0.82 and 0.52px off the true circle against 7.4 and 5.9px of polygon; a heptagon (51.4), a hexagon, a
   square, a triangle -- a reflection on squared paper, where the corner IS the answer -- keep their corners.
   WHY 8 UNITS: a chord's sagitta is about L.theta/8, so under 8 units and 50 degrees a straight segment is
   within 0.87 units of the curve it stands for -- 0.96px at most, on the iPad board. A slowly drawn stroke
   (samples 1-3 units apart) is therefore drawn BYTE FOR BYTE as before, and `d` grows only where a curve
   shows. Both are free to re-tune: no stored point depends on either.
   NOTHING FILTERS OR PREDICTS THE INPUT (338, section 6): a filter quiet enough for a still finger lags 8px at
   the corner a child slows down for, and is irreversible; this is drawing, and can be changed tomorrow. */
```

### SEGMENTS a..b-1 OF A STROKE `st` (a flat list with no point repeated), with neighbours from the whole of it -- the one writer the stored path and the live

top level, before `padSegs_`

```
/* SEGMENTS a..b-1 OF A STROKE `st` (a flat list with no point repeated), with neighbours from the whole of it
   -- the one writer the stored path and the live chunks share (`padChunks_`), so the two can never draw a
   stroke two ways. The last point of the list is an end (a corner), so a live chunk drawn now is exactly
   what a lift now would store. */
```

### A STROKE AS A PATH. `k` is the pad's aspect (`data-aspect`, `padAspect_`); a wrong or missing one only changes how a curve bends, never where a point is.

top level, before `PAD_PATHS`

```
/* A STROKE AS A PATH. `k` is the pad's aspect (`data-aspect`, `padAspect_`); a wrong or missing one only
   changes how a curve bends, never where a point is. TODAY'S STRING, BYTE FOR BYTE, for a dot, two points, a
   list that is malformed (an odd length, a value that is not a finite number) and a stroke with no segment
   long and gentle enough to curve -- so every journey's `M50 100L200 180` still reads as it did.
   KEPT, BY THE STROKE AND THE ASPECT (`PAD_PATHS`), AFTER REVIEW: Undo, Clear and every copy repaint a pad from the
   store, and on a full board (314 strokes, 98,942 characters) that recomputed every curve -- 9.2ms at full speed in
   Node against 0.7 for the polylines, and Undo's whole task 74ms of main thread at 4x against 31. A stroke stored is
   never changed, so the path of one already drawn is looked up, not worked out again. `live` is the preview of a
   stroke still growing, which is never asked for twice: not kept.
   HELD TO A SIZE IN CHARACTERS, NOT A COUNT OF STROKES: a question keeps every sample, so one stroke can be 1,200
   points -- a 10K key and a 30K path -- and a count of 4,000 such would be hundreds of megabytes. A full board is
   about 350K (its 100K stored and its curves); `PAD_PATHS_MAX` holds about eleven, and past it the memo starts
   again empty, which costs one repaint's worth of curves and nothing else. */
```

### A SINGLE TAP IS A DOT, and a dot is a real answer — "mark with a cross" starts as one, and a `<path>` with one point paints nothing at all.

in `plain`

```
/* A SINGLE TAP IS A DOT, and a dot is a real answer — "mark with a cross" starts as one, and a
       `<path>` with one point paints nothing at all. Repeating the point gives it length, and
       `stroke-linecap: round` makes that length a disc. */
```

### THE PAD'S SHAPE, H/W OF ITS BOX:

top level, before `padAspect_`

```
/* THE PAD'S SHAPE, H/W OF ITS BOX: the board is 3:4 whatever its surface's viewBox says (note 310 -- the
   surface is 340x340 stretched); a figure's is its own first `viewBox` (the picture is drawn at its own
   shape: width set, height auto); a made-up surface is square. Four decimals, so the attribute it is written
   to reads back as the same number the markup was drawn with. */
```

### ---------- WHAT THE CONTROL SAYS, IN ONE PLACE

top level, before `PAD_TAP`

```
/* ---------- WHAT THE CONTROL SAYS, IN ONE PLACE --------------------------------------------------
   THE HANDLER REWRITES THIS TILE IN PLACE rather than repainting the card, so its face exists in
   two places by construction — the markup below and the press in `padArm_`. Written twice they
   drift, and the drift here is invisible: a pad that says `Draw on it` while the pen is on is a mode
   you cannot see, which is the fault the gold frame was added for. So the face is one object, handed
   to `tile_` to draw and to `tileSet_` to rewrite.

   `Draw on it` SAID NOTHING ABOUT THE CARD BEING HELD, and that is what the report was about. The
   owner's own sentence is the label: a padlock, and `Lock it to draw`. */
```

### ---------- THE PEN'S BAR IS A ROW OF TILES

top level, before `PAD_TOOL_FACE`

```
/* ---------- THE PEN'S BAR IS A ROW OF TILES ---------------------------------------------------------
   THESE WERE THREE `<button>`s — a full-width gold `Lock it to draw` on a line of its own and grey
   `Undo` and `Clear` under it — argued as a FORM's controls, which the house rule gives buttons. The
   owner, looking at it: *"lock should be a tile too. same as undo and clear. it should all be tiles."*
   So every control on a question's pages is a tile now, and the rule that sent these to buttons is
   overruled here for this surface by the person it was written for. One renderer means one tap target,
   one press animation and one place `check-doors` pairs each `act` with its handler.

   THE LOCK KEEPS ITS LEAD, in the tile's own vocabulary: `tone: 'lead'` is a gold mark while the pen
   is off (the one thing to press first, as the gold outline said) and a gold FILL while it is on
   (`.on`), which is the difference between an invitation and a state the frame already argued for.
   It is a switch, so it says `aria-pressed` as well as lighting up. `.qpad-lock` stays the name the
   handler and the checks find it by, because the picture carries the same action while the pen is off. */
```

### ---------- AND WHAT THE PEN DRAWS WITH, WHERE THE QUESTION ASKS FOR MORE THAN A PEN

top level, before `PAD_TOOL_FACE`

```
/* ---------- AND WHAT THE PEN DRAWS WITH, WHERE THE QUESTION ASKS FOR MORE THAN A PEN -------------------
   `padTools_` decides which; these are their faces. Each is a switch -- the one in hand is lit (`on`)
   and pressed -- and only WHILE THE PEN IS ON: with the card free to move nothing is in hand, and a
   lit Ruler over a picture a finger cannot draw on would say the opposite. Pressing one is also the
   lock (see `pad-tool`), so lit always means "a drag here makes this".

   DRAWN ONLY WHERE THERE IS A CHOICE. A question that wants nothing but the pen gets the bar it always
   had -- lock, Undo, Clear -- because a lone Pen tile would be a switch with one position. `protractor`
   has no face, so a question that asks for one is offered what does exist. */
```

### AND A RULER ON EVERY GRID (357):

top level, before `padToolsOf_`

```
/* AND A RULER ON EVERY GRID (357): a bar's side, a line between two plotted points, an axis -- on a grid the
   ruler is how a finger draws them straight, and its ends snap to the intersections. Measured, 5 of 224 grid
   pads offered one, because the question's words never say "ruler" for a chart; Q7, the owner's screenshot,
   had the pen alone. Decided here from the picture and not in `padTools_`, which check-library cuts out of
   this file by name and runs on the rows alone. */
```

### TWO GROUPS IN THE ROW, so it breaks BETWEEN them and never inside one.

top level, before `padBar_`

```
/* TWO GROUPS IN THE ROW, so it breaks BETWEEN them and never inside one. Six tiles is 286px and a 390px
   phone's card has about 288 -- measured, it wrapped Clear alone onto a line of its own, a bin
   orphaned under a row it belongs to. Held as "the pen and what it draws with" and "taking marks
   back", the row is four and two at 320 and at 390 alike, and one row wherever there is room. */
```

### THE MODE IS READ OFF `PAD_ON`, NOT LEFT ON THE ELEMENT BY THE PRESS THAT SET IT.

in `padWrap_`

```
/* THE MODE IS READ OFF `PAD_ON`, NOT LEFT ON THE ELEMENT BY THE PRESS THAT SET IT. A card is
     rebuilt on every repaint, so a class added by the handler alone is a class a repaint throws
     away while the state keeps it — and the state is what `pointerdown` below tests. That leaves
     the pen taking the finger with no gold frame, no `touch-action: none` and no `data-noswipe`:
     the invisible mode this repository already records for the reel that was paused with nothing
     on it saying so. */
```

### THE OVERLAY TAKES ITS BOX FROM THE PICTURE UNDER IT, by stretching to the same box, rather than by parsing a viewBox out of the drawing's markup.

in `padWrap_`

```
/* THE OVERLAY TAKES ITS BOX FROM THE PICTURE UNDER IT, by stretching to the same box, rather
     than by parsing a viewBox out of the drawing's markup. `preserveAspectRatio="none"` is what
     makes that exact: 340 units of user space map to the box's width and 340 to its HEIGHT
     whatever shape the box is, which is the same arithmetic `padMap_` does on a pointer. Reading
     the drawing's own viewBox instead would mean trusting a string, and a diagram that ever
     omitted one would silently put every mark in the wrong place.

     WHAT `none` COSTS IS STROKE WIDTH — a vertical line and a horizontal one would come out
     different thicknesses on any box that is not square. `vector-effect="non-scaling-stroke"` is
     the answer to exactly that: the width is measured on the screen rather than in the stretched
     user space, so the pen is one pen. */
```

### WHERE THE MARKS GO, AND ONLY A `pad:` KEY GOES ANYWHERE:

in `padWrap_`

```
/* WHERE THE MARKS GO, AND ONLY A `pad:` KEY GOES ANYWHERE: `padNoteSay_` says "Saved to Ada's
          account" signed in, "Not saved" when the store refused it and who was signed out when a session ended
          (317). The whiteboard's (`padPrefix_`) stays on this device, so of those only "Not saved" is ever
          true of it: `padNoteSay_` gives a `board:` key that line or `PAD_HERE_ONLY`, never an account's
          sentence. It carries `data-kept-k` like a question's, so `ansSavedPaint_` -- run by every write --
          says "Not saved" the moment a stroke is refused and takes it back when one lands (310, after the
          merge with 317). */
```

### ---------- ARMING ONE PAD, EVERY PART OF IT TOGETHER

top level, before `padArm_`

```
/* ---------- ARMING ONE PAD, EVERY PART OF IT TOGETHER --------------------------------------------
   FOUR THINGS MOVE AND THE HANDLER USED TO MOVE THEM IN FOUR PLACES: the class the frame is drawn
   from, the `data-noswipe` the grid reads, the `data-do` that makes the picture itself a door, and
   the lock tile's own face. Four sites is four chances to leave a pad half-armed — a gold frame over
   a picture that still hands the finger to the grid, or the other way round — and a half-armed pad
   is exactly the invisible mode the frame exists to prevent.

   TURNING ONE ON TURNS EVERY OTHER OFF, which is why this takes a flag rather than toggling: two
   live `touch-action: none` regions on one scroller is the trap twice. */
```

### THE PICTURE IS A DOOR ONLY WHILE THE PEN IS OFF.

in `padArm_`

```
/* THE PICTURE IS A DOOR ONLY WHILE THE PEN IS OFF. Armed, the ink layer is over it taking every
     pointer — and a `data-do` still on the art would make the dispatcher walk up from that ink and
     turn the pen off again on the first dot anybody drew. */
```

### `.qpad-lock` RATHER THAN THE ACTION, because the art carries the same action when the pen is off and `querySelector` would hand back whichever comes first in

in `padArm_`

```
/* `.qpad-lock` RATHER THAN THE ACTION, because the art carries the same action when the pen is
     off and `querySelector` would hand back whichever comes first in the markup. Rewritten through
     `tileSet_`, which changes the mark, both names and the plate together -- the tile's face is
     `padLockFace_`'s and nobody else's. */
```

### ---------- THE PEN

top level, before `PAD_ON`

```
/* ---------- THE PEN ------------------------------------------------------------------------------
   ONE SET OF LISTENERS FOR THE WHOLE APP, delegated, for the reason the answer box gives: about
   five question cards exist at any moment and only one of them is ever being drawn on.

   POINTER EVENTS, NOT TOUCH EVENTS, so a mouse, a finger and a stylus are one code path. The
   capture is what makes a stroke survive the finger leaving the picture — without it, drawing off
   the edge of a diagram ends the line there and the next move starts a new one somewhere else.

   THE STROKE IS BUILT IN THE PICTURE'S COORDINATES AS IT IS DRAWN, and written to storage once, at
   the end. Writing per move would be a `localStorage` write every few milliseconds, which is
   synchronous and on the main thread.

   AND THE PEN HAS TWO MORE TOOLS, WHICH ARE STILL THE PEN. A ruler's line and a compass's circle
   are built as the same flat polyline a freehand stroke is (`padPath_`'s format), so Undo, Clear,
   storage, a repaint and a reload are the code they always were and cannot tell the three apart.
   What differs is only what a drag MAKES: every point it passes (pen), the two ends (ruler), or a
   ring round where it began (compass). `PAD_DRAW` holds those three answers and nothing else. */
```

### WHAT CLEAR LAST TOOK OFF EACH PAD, by key, for the visit -- so Undo straight after it puts the marks back.

top level, before `PAD_CLEARED`

```
/* WHAT CLEAR LAST TOOK OFF EACH PAD, by key, for the visit -- so Undo straight after it puts the marks
   back. See `on('pad-clear')`. AND WHOSE THEY WERE (`PAD_CLEARED_MARK`): a pad drawn signed out after the
   server ended a session is that person's (answers.js, `ansGoneMark_`), Clear makes it nobody's, and Undo
   put it back nobody's -- so the next child to sign in was handed it (317, "Undo, the booking form, a
   switch"). Undo writes the strokes back with the mark they had (`ansPutBack_`). */
```

### THE TOOL A DRAG ON THIS PAD USES:

top level, before `padToolNow_`

```
/* THE TOOL A DRAG ON THIS PAD USES: what was chosen for it, and only if the bar offers that tool.
   Asked of the bar rather than of `padTools_` again, so a tool the decider did not give this question
   cannot be drawn with, whatever a stale `PAD_TOOL` entry says -- the tile IS the permission. */
```

### ---------- SCREEN PIXELS, NOT PICTURE UNITS, FOR ANYTHING ROUND

top level, before `PAD_MIN_PX`

```
/* ---------- SCREEN PIXELS, NOT PICTURE UNITS, FOR ANYTHING ROUND ----------------------------------
   THE INK IS STRETCHED (`preserveAspectRatio="none"`, see `padWrap_`): 340 units are the picture's
   width AND its height, so on a picture twice as wide as it is tall one unit across is twice one
   unit down. A circle drawn as "every point 50 units from the centre" would be an ellipse on that
   picture -- a compass that cannot draw a circle. So the radius and every angle are measured in the
   box's own pixels (`sx`, `sy`: pixels per unit, read when the drag starts) and only the points are
   turned back into units. The picture's shape is the drawing's, the same at 320px and on a laptop,
   so a ring stored that way is round wherever it is drawn again. */
```

### AND LONGER FOR ONE STROKE:

top level, before `padMinOf_`

```
/* AND LONGER FOR ONE STROKE: a ruler's or a compass's owner that stayed still while another contact moved, and was made
   the stroke again (`padAlone_`), marks nothing until it has really moved: `g.min`. AND NOTHING AT ALL once the pin rule
   has refused a contact ON THE PICTURE, unless the still one has since shown it is the one drawing (`g.refused` without
   `g.mine`, `padRace_`): a pin or a palm is put down and then only drifts, and the second review's 10px was inside the
   drift a real palm makes. */
```

### A RING OR AN ARC AS THE POLYLINE THE PEN STORES:

top level, before `padArc_`

```
/* A RING OR AN ARC AS THE POLYLINE THE PEN STORES: about one point every 4px of screen, at least 8 and
   at most 120 -- at 120 the chord sits 0.05px inside a 150px radius, which nothing can see. A full turn
   ends EXACTLY on its first point, so it is closed in storage and not merely by rounding. */
```

### ---------- THE COMPASS: THE POINT WHERE YOU PRESS, THE WIDTH WHERE YOU DRAG TO, THE ARC YOU SWING

top level, before `padSwing_`

```
/* ---------- THE COMPASS: THE POINT WHERE YOU PRESS, THE WIDTH WHERE YOU DRAG TO, THE ARC YOU SWING ----
   A REAL PAIR OF COMPASSES IS SET AND THEN TURNED, and a finger does both in one drag: down on the
   centre, out to the radius -- a full circle, previewed as it grows -- and then, if the finger swings
   round the point, the width HOLDS where it was when the swing began (the hinge, not the finger,
   decides it) and what is drawn is the arc swept. A swing of a full turn or more is a circle again.
   A construction is mostly arcs -- two from A, two from B, a ruler through where they cross -- and
   a circle for each would bury the page in rings.

   THE SWING IS COUNTED ONLY WHERE AN ANGLE MEANS SOMETHING: further out than `PAD_SWING_PX` and not
   back near the point (60% of the furthest yet), because a finger wobbling a millimetre from the
   centre turns through ninety degrees without meaning to. Unwrapped across the -180/180 seam, so a
   swing through "west" is one swing. */
```

### ---------- WHAT IS SHOWN WHILE IT IS DRAWN, AND GONE WHEN IT IS NOT

top level, before `padAid_`

```
/* ---------- WHAT IS SHOWN WHILE IT IS DRAWN, AND GONE WHEN IT IS NOT ------------------------------
   THE POINT AND THE WIDTH: a dot where the compass point went down (or where the ruler's line starts)
   and, for the compass, a dashed line from it to the pencil -- the radius, live, which is what you
   watch while you open a pair of compasses. In `.qpad-aid`, beside the marks and never among them, so
   nothing here is ever stored, undone or redrawn: the group is emptied when the finger lifts. */
```

### A FINGER IS THE PEN, AND TWO FINGERS, A PALM OR A THUMB ARE NOT (docs/history/338).

top level, before `PAD_STILL_PX`

```
/* ==================================================================================================
   A FINGER IS THE PEN, AND TWO FINGERS, A PALM OR A THUMB ARE NOT (docs/history/338).

   THE OWNER, 11 OCT: *"drawing or editing with a finger (especially on tablets like an iPad or
   touchscreens) feels finicky, imprecise, and frustrating"* -- naming *"accidental stray ink blobs while
   trying to pan"* -- and, asked what the children draw with, *"they are just using their fingers"*.

   MEASURED BEFORE A LINE OF THIS WAS WRITTEN, with real touch through CDP on the board and on June 2024
   1F Q7 at 390x844 and 820x1180: finger 1 always owned the stroke (note 310's rule, below), so a
   two-finger tap stored a DOT, a two-finger pan or a pinch stored a LINE, and a palm that landed first
   took the stroke -- its blob was stored (`[238,299,240,299,238,299]`) and the fingertip's whole line was
   lost. And a palm or a thumb resting on the card beside the pad is the PRIMARY pointer, the one the
   swipe engine follows, so it could slide the column out from under a finger that was drawing.

   ---------- WHAT NOTE 310 SAID, AND HOW THIS AMENDS IT -- READ THIS BEFORE "SIMPLIFYING" IT BACK ----------
   310: *"a stroke belongs to the pointer that started it; a second pointer neither takes it over nor
   ends it."* That stands for a stroke that is ESTABLISHED -- the finger has gone 10px and 200ms -- and a
   palm landing mid-line is a rest exactly as before. It is amended ONLY for a stroke that is still
   TENTATIVE (a dot, or under 200ms old) or HELD: there a second contact is evidence of a gesture, so the
   preview is hidden (every sample kept) until movement says which it was -- two fingers moving is a pan
   or a pinch and stores nothing; the first finger moving alone carries on with nothing lost; the SECOND
   one moving alone, on the ink, was the real finger after a palm, and takes the stroke from its own
   first point. Restore first-finger-wins and the palm blob comes back, and a two-finger pan draws.

   CONTACTS, NOT TIMERS. Nothing here waits: a one-finger stroke is drawn the moment the finger lands,
   exactly as before, and a stroke is held back only when a second contact gives evidence. Contacts are
   told apart by HOW THEY MOVE. Contact size is recorded (`?pen=sizes`) and decides nothing yet: no
   finger or palm on an iPad here has ever been measured, and a size threshold that is wrong low silently
   stops a child drawing (338, increment 2).

   THE THRESHOLDS ARE CSS PIXELS AND MILLISECONDS, never rem -- a fingertip is the same size on every
   screen (CLAUDE.md). Every age is a difference of two events' `timeStamp`s. */
```

### AFTER REVIEW (11 Oct, docs/history/338):

top level, before `PAD_KEEPUP_PX`

```
/* AFTER REVIEW (11 Oct, docs/history/338): a hand that rolls or settles as the line starts moves 6-12px and STOPS; the
   second finger of a pan or a pinch keeps going. At the moment the first of them has gone 10px the two look the same, so
   when the other has moved too the question is asked again once the one that went furthest has gone `PAD_KEEPUP_PX`:
   the other is moving WITH it if it has gone `PAD_WITH` of that, and settled if not. And each finger is judged at its
   own samples' time -- the other's report for the same moment can come `PAD_LAG_MS` behind. */
```

### THE CONTACTS, by `pointerId` (jsdom's `undefined` is a key like any other).

top level, before `PAD_TOUCH`

```
/* THE CONTACTS, by `pointerId` (jsdom's `undefined` is a key like any other). Every pointer that goes
   down on the armed ink, of any kind, and every TOUCH that goes down anywhere while a pad is armed -- a
   palm on the card, a gripping thumb, the second finger of a pinch on a 180px figure. Each is
   `{id, type, t0, p0, p, pm, tm, ts, hist, far, onInk, ink, k, size, big, role, pts, m0, h0, late, busy}`:
   points in client px, `far` the furthest it has been from where it went down, `tm` the last time it
   moved `PAD_ALSO_PX`, `ts` the time of its last SAMPLE and `hist` its recent samples `[t, x, y]` (so two
   fingers are compared at one moment, not at whenever each one's event happened to be dispatched),
   `role` one of owner / cand / watch / rest / two. */
```

### HELD: the stroke is kept (`PAD_ST`, `PAD_GO`, so `padHold_` and `findKeep_` still hold its column) and its samples go on accumulating, but nothing of it is on

top level, before `PAD_HUSH`

```
/* HELD: the stroke is kept (`PAD_ST`, `PAD_GO`, so `padHold_` and `findKeep_` still hold its column) and
   its samples go on accumulating, but nothing of it is on the screen. `{cand, kind, from}`: the contact
   that caused it (null once it has gone), `b` if the owner was still a dot when it came and `a` if the
   owner had moved but was young, and where the owner was when it began. */
```

### A DECISION NOT YET MADE:

top level, before `PAD_DUE`

```
/* A DECISION NOT YET MADE: one of the fingers being told apart has gone 10px, and the others have yet to
   report that moment, or have moved too and it is not yet clear whether WITH it -- see `padJudge_`. Asked at
   the next frame after one of them moves; a lift, a cancel or the page going away makes it then and there. */
```

### WHETHER A FINGER IS ON THE ARMED DRAWING -- the swipe engine asks this before it takes a gesture (overworld.js, the axis decision), so a palm or a thumb that

top level, before `padBusy_`

```
/* WHETHER A FINGER IS ON THE ARMED DRAWING -- the swipe engine asks this before it takes a gesture
   (overworld.js, the axis decision), so a palm or a thumb that went down first beside the pad, which is
   the pointer the grid follows, cannot slide the column out from under a stroke. Keyed by the pad's KEY,
   not its element, so a repaint in the middle of a gesture does not let go of it; T0 and `padDrop_` are
   what clear it, and a stuck one would mean the column never moves again -- which is why both exist. */
```

### ---------- UNDO AND CLEAR UNDER A RESTING HAND

top level, before `padRested_`

```
/* ---------- UNDO AND CLEAR UNDER A RESTING HAND -----------------------------------------------------
   THE BAR SITS RIGHT UNDER THE PICTURE, WHERE A DRAWING HAND RESTS. A palm lifting off Undo is a click,
   and that undid the stroke before this one -- and `padRepaint_` wiped the preview of the one being
   drawn. So Undo and Clear do nothing while a finger is on that drawing, or within `PAD_BAR_MS` of the
   lift of a touch that went down off the ink while one was: a click follows its `pointerup` in the same
   task, and 400ms is the longest a resting hand's release takes to become one. Silently -- a child
   resting a palm should not be told anything. The lock and the tools are NOT guarded: "Done drawing"
   pressed by the other hand still ends the stroke as it always did. */
```

### WRITTEN ONCE A FRAME, NOT IN THE HANDLER (after review):

top level, before `PAD_SIZES_FRAME`

```
/* WRITTEN ONCE A FRAME, NOT IN THE HANDLER (after review): the line written inside every `pointermove` dirtied the
   layout the next event's box read then forced -- 78 forced layouts in 78 moves, 2.3ms each at 4x, the very cost 1b took
   out of the pen -- in the one mode the iPad reading is to be taken in. Nothing changes in the frame but the words. */
```

### AND WHEN, BY THE SAMPLE'S OWN CLOCK.

in `padTrack_`

```
/* AND WHEN, BY THE SAMPLE'S OWN CLOCK. The review found a pan's second finger whose event was stamped after the
     first had gone 10px while it carried only a sample from 16ms before -- judged by the event, it read as still and
     the pan drew a line. 256 samples is a second at 240Hz; a decision looks back `PAD_LAG_MS`. */
```

### A POINT PUT DOWN EXACTLY WITH A FINGER (docs/history/357).

top level, before `PAD_DOT_PX`

```
/* ==================================================================================================
   A POINT PUT DOWN EXACTLY WITH A FINGER (docs/history/357). AMENDS 338's "THE PEN NEVER SNAPS".

   THE OWNER, 18 OCT, over Q7's grid: *"how are the students supposed to answer it by using there fingers
   to draw such a fine line at time? Shouldn't we implement best touch strategies to make it work? Like
   magnify or manipulate acceleration when drawing?"* MEASURED FIRST, with real touch at 390x844: six taps
   aimed at Q7's intersections with a fingertip's +-4px wobble stored six five-point squiggles and 0 of 6
   on the intersection; on a cumulative frequency grid of 3.3px squares, 0 of 6, one or two squares off.

   ONLY PLACEMENTS ARE TRANSFORMED: a dot, the ruler's two ends, the compass's pin and radius. A freehand
   line stays under the finger with every sample kept -- nothing snaps it, nothing filters it -- because a
   curve through plotted points is the child's own and 338's smoothing already draws it round. The board
   never snaps (it has no grid to snap to and is nobody's answer). `padTrack_` still sees the raw finger,
   so the palm, two-finger, hand-over and race rules are exactly 338's. And every transformed point is
   SHOWN before the lift -- the dot sits on the intersection, the loupe's crosshair on the point -- which
   is 338's "a preview is a promise of what the lift keeps", the reason 338 refused snapping unseen.

   CHOSEN BY THE RESEARCH AND THEN BY MEASUREMENT (357 has both): snapping (Baudisch's Snap-and-go, 138%
   and 231% faster alignment; Fernquist's Oh Snap, ~40% better on touch), a loupe over the finger that
   commits on lift (Vogel & Baudisch's Shift), and a FIXED slow gain for fine grids (Benko's slow 4x, the
   1/4 of US8896561; 1/5 measured better here). DECLINED: two-finger techniques (338: two fingers do nothing), an offset cursor that
   is always on (338 section 9), and a speed-dependent gain -- a fingertip's wobble is fast from one sample
   to the next, so the gain would follow the wobble, and Benko warns a varying speed spoils steering. */
```

### THE GRID IN A PICTURE'S MARKUP, in its own viewBox units:

top level, before `PAD_GRIDS`

```
/* THE GRID IN A PICTURE'S MARKUP, in its own viewBox units: `{vb, xs, ys}` or null. The library draws a
   grid three ways -- `<line class="grid">` (102 pads), `<path class="grid" d="M..L..">` with the major lines
   thicker (19), and lines with no class at all (75, Q7 among them) -- so the class is not asked: a line
   counts when it is level or upright and spans a quarter of the picture, and an AXIS has a grid when at
   least 5 of them are evenly spaced (the run's spacings vary by under 15%). That keeps a bar chart's bars,
   a table's rules and an axis's ticks out. Read from the STRING, so `padToolsOf_` can ask it while the card
   is being written, memoised by the markup itself. */
```

### AND THAT GRID ON THE SCREEN, for one pad at one box size:

top level, before `padLattice_`

```
/* AND THAT GRID ON THE SCREEN, for one pad at one box size: its lines in the ink's 340 units and in px from
   the box's corner, and its smallest square in px. Null for the board, for a picture with no grid, and for
   jsdom's empty box -- so nothing snaps where nothing can be seen. Cached on the picture per box size. */
```

### WHAT A PLACEMENT CAN SNAP TO, IN 338 SECTION 8's ORDER, read once when the finger lands:

top level, before `padTargets_`

```
/* WHAT A PLACEMENT CAN SNAP TO, IN 338 SECTION 8's ORDER, read once when the finger lands: your own marks
   first (a dot, a line's two ends -- and an earlier part's, `.qpad-was`), then the grid's intersections, then
   the figure's points (`.pt`). Each target's radius is 0.45 of the way to its nearest neighbour, the grid's
   square included, so two targets never both claim a point and a fine grid's own marks do not swallow its
   intersections; capped at 24px and 20px. Targets within 2px are one. */
```

### THE TARGET A POINT (px from the box's corner) SNAPS TO, or null:

top level, before `padSnap_`

```
/* THE TARGET A POINT (px from the box's corner) SNAPS TO, or null: the held one while the point is within
   1.25 of its radius, else the first group in the order that has one within its radius. `axis` 'x' or 'y'
   is a ruler locked level or upright: only that coordinate may move, and only onto a grid line. */
```

### THE SLOW MODE ON A FINE GRID:

top level, before `padGain_`

```
/* THE SLOW MODE ON A FINE GRID: the point moves a fifth as far as the finger, from where it was when the
   mode began, so a fingertip's 4px wobble is under 1px of point and a 3.3px square can be aimed at through
   the loupe. A fifth and not Benko's quarter because it measured better: 18 of 18 against 9 of 18 at 320,
   where the square is 2.1px (357's table). Relative and starting UNDER the finger -- not an offset (338 section 9): nothing is out of reach,
   and the point is never more than 48px from the finger. On for a dot and for a pin from the landing; for a
   ruler's or compass's moving end once the finger is still; off once the finger goes 40px from where it
   began, so a real drag is a real drag. */
```

### ONE PLACEMENT: the finger's point (units) through the slow mode and the snap, back to WHOLE units -- what is stored is always whole numbers

top level, before `padPlace_`

```
/* ONE PLACEMENT: the finger's point (units) through the slow mode and the snap, back to WHOLE units -- what
   is stored is always whole numbers (check-flow's "unrounded points"), so a snapped point is round() of the
   intersection, at most 0.6px off it on the tallest figure. `start` is the landing. Sets `g.hold` (the halo)
   and `g.at` (the point the loupe's crosshair shows). */
```

### ---------- EVERY SAMPLE THE FINGER GAVE

top level, before `padSamples_`

```
/* ---------- EVERY SAMPLE THE FINGER GAVE ----------------------------------------------------------------
   MEASURED BEFORE: under load the pen kept about one sample in three -- a 1,200-sample zigzag at 4x CPU
   reached it as 395 `pointermove`s, and every one of the 1,200 was there in `getCoalescedEvents`. A fast
   circle came out a 9-gon. So every sample an event carries is the stroke's, read the way overworld.js
   reads them for the swipe: where the call exists AND answers something (Firefox on Android answers `[]`,
   Safari before 18.2 and jsdom have none), else the event itself. From each entry only the point and its
   time: iOS 18.2 shipped them with no `pointerId` and no `target`, so those come from the event. Predicted
   events are never read -- ink where the finger has not been is the surprise the brief forbids (338). */
```

### ---------- A STROKE STARTS: today's start, for one contact

top level, before `padStart_`

```
/* ---------- A STROKE STARTS: today's start, for one contact ----------------------------------------
   THE PEN AND THE RULER START AS A DOT WHERE THE FINGER WENT DOWN; the compass starts as nothing,
   because a ring of no width is not a mark -- its point is the aid's. */
```

### ONE SAMPLE OF THE OWNER, THROUGH ITS TOOL.

top level, before `padStep_`

```
/* ONE SAMPLE OF THE OWNER, THROUGH ITS TOOL. A pen still a dot moves its one point (placed) and keeps the
   raw samples beside it; once the point has gone `PAD_DOT_PX` it is a freehand line drawn from the finger's
   own first sample, exactly as before 357 -- nothing of a line is snapped. The ruler's end and the compass's
   radius (until the swing holds it) are placements. */
```

### ---------- THE PEN'S LIVE PATH, ONCE A FRAME, IN CHUNKS

top level, before `PAD_CHUNK`

```
/* ---------- THE PEN'S LIVE PATH, ONCE A FRAME, IN CHUNKS ---------------------------------------------------
   IT WAS REWRITTEN WHOLE ON EVERY `pointermove`: the whole `d` rebuilt and re-parsed per event, and the next
   event's box read then forced the layout that write had dirtied -- `padAt_` measured 1.0ms at p95 at 4x, a
   forced layout every move. With every coalesced sample kept a stroke is three times longer, so rebuilding
   it whole would cost three times as much per move. So the samples are fed as they come, and the PATH is
   written once a frame: a frame asked for from an input handler runs before the next paint, so nothing is
   drawn later than it was -- only less often than the events come (iOS sends touches unaligned to frames,
   two writes a frame became one). And nothing is written between two pen events, so each event's box read
   finds clean layout.
   IN CHUNKS OF `PAD_CHUNK` SEGMENTS, so a frame's cost does not grow with the stroke: only the OPEN chunk's
   `d` is rewritten; at 128 segments, once the stroke has 2 points beyond it (what its last segment's
   corner test and far handle need), it is written one last time and left, and the next starts at its last
   point. At every frame the chunks draw exactly `padPath_` of the points so far; the pen is opaque with
   round caps, so the joins do not show. On a lift they collapse into one path (`padCommit_`), so a stroke
   is one `<path>` as it always was.
   THE RULER AND THE COMPASS STAY SYNCHRONOUS: a two-point line or one ring of at most 120 points, and the
   journeys read their live radius straight after `pointermove`. */
```

### THE OTHER WAS THE FINGER (a palm landed first):

top level, before `padSwap_`

```
/* THE OTHER WAS THE FINGER (a palm landed first): it takes the stroke from its own first point, with
   every sample it gave while held, and the palm is a rest. `held` keeps it hidden -- the owner lifted
   still, and the one left has yet to move. */
```

### ---------- WHO MOVED, AND WHETHER WITH THE OTHER: JUDGED AT ONE MOMENT

top level, before `padParties_`

```
/* ---------- WHO MOVED, AND WHETHER WITH THE OTHER: JUDGED AT ONE MOMENT --------------------------------
   THE RULE IS "the first of them to go 10px decides, by how far the others have gone": a second finger that has not
   moved half of that is not part of it. Two things the review of 11 Oct found with real touch, each costing a child's
   line, are why it is asked the way it is:
   - EACH FINGER IS JUDGED AT ITS OWN SAMPLES' TIME. The platform sends each finger's moves as their own `pointermove`,
     one after the other, and under load one event carries several folded samples -- finger 1's arrives 14px on while
     finger 2's report for that moment has not come, or comes in an event stamped later than the samples it carries.
     Judged by what had arrived (the first build decided at the other finger's next event stamped after the
     crossing; the review still drew 8 pans in 28 with finger 2 out of phase), finger 2 reads as still and the pan
     draws finger 1's line. So it is decided AT A FRAME -- input that has arrived is dispatched before a frame's
     callbacks, so every finger's queued report is in; judged inside an event, the other finger's events of the same
     batch can still be queued behind it, and a stall of the main thread makes it look silent (measured: 3 pans in 8
     drew that way at 4x) -- and the moment judged is the latest every finger still reporting has reported
     (`PAD_LAG_MS`: one silent longer than that is still, not late), every finger taken where it was THEN (`padPos_`).
   - A HAND THAT ROLLS OR SETTLES IS NOT A SECOND FINGER. A thumb gripping the edge rolls 6-12px in the first 50-80ms
     of a line and stops; a palm put down flattens and its centre slides as far. At the 10px moment that is "moving
     too", and the first build called it a pan: six resting-hand gestures drew nothing on every pad and size, where the
     pen before 338 drew them. A second finger keeps going. So when another has moved 5px as well, nothing is decided
     until the one that went furthest has gone `PAD_KEEPUP_PX`, and then the others that have kept `PAD_WITH` of it
     are fingers WITH it -- two fingers, nothing drawn -- and one that fell behind settled.
   Nothing is lost by waiting: a held stroke keeps every sample (`PAD_HUSH`), and a watched contact's stroke is drawn
   all along. A lift, a cancel or the page going away decides at once, from where each one got to. */
```

### THE ONES BEING TOLD APART, each with the point it is measured from:

top level, before `padParties_`

```
/* THE ONES BEING TOLD APART, each with the point it is measured from: the owner (from where it was when the hold began,
   or from its down while it is watched against), the candidate (from where it was then) and every watched contact (from
   where it was when the owner went down). */
```

### A LATER CONTACT IS HANDED THE STROKE ONLY ONCE IT HAS GONE `PAD_KEEPUP_PX` (fourth review, 12 Oct).

in `padJudge_`

```
/* A LATER CONTACT IS HANDED THE STROKE ONLY ONCE IT HAS GONE `PAD_KEEPUP_PX` (fourth review, 12 Oct). 10px alone was
     enough, and a palm that lands beside a finger held still to aim -- at any age with the pen, within `PAD_TOGETHER_MS`
     with the ruler or the compass -- settles 6-12px as it flattens (round 1), and 16 is not rare: it was handed the
     stroke, its settle was shown and stored, and the finger, a rest from then on, drew a 120px line that was lost.
     Measured with real touch on the board and on June 2024 1F Q7: 16 of 16 at a 12 or 16px settle, where 4955c7c, the
     first finger always the stroke, kept the line every time. A finger drawing after a palm goes 30px in 100ms; a settle
     stops short of it. Until then the hold goes on, every sample kept -- and if the still one moves, the half rule above
     tells a settle from a second finger and the still one's line comes back.
     AND A LIFT HANDS NOTHING OVER. The review's rule let a lift decide from 10px, and the same palm then still marked
     whenever something lifted first: a palm that settled 12px and lifted (a hand brushing the picture) was handed the
     stroke at its lift -- its settle stored, and the aiming finger's line after it lost; a finger that tapped still
     beside a settling palm handed it the stroke at the finger's lift. So the 30px holds at a lift too, and for the one
     left holding the stroke when the first lifts (`padSwap_`, held): it is that contact's only once it has gone 30px.
     The simpler rule, chosen over keeping the exception for a lift (338, round 4). The cost, section 4: a palm-first
     finger's line shows from 30px, not 10, and the first strokes after a palm lands, if shorter than 30px, are lost for
     as long as it stays down and still.
     AND THE FIRST, LEFT ALONE, THE SAME. With a lift handing nothing over, a palm-first tick left the PALM holding the
     stroke with nobody beside it, and at its 10px it was handed it back: the hand moving on, the palm sliding 15px, drew
     its slide -- and every finger after it was a rest beside an established stroke, its line lost until the palm lifted
     (jsdom, this round; after a finger's TAP 2a89387 did the same). Once the other has lifted there is nothing left to
     compare it with, and a finger after a brush and a palm after a tick move alike: whichever is left alone in a held
     stroke is handed it only at 30px, as a later contact is. The cost, section 4: a short stroke by the aiming finger
     after a palm has brushed the picture is lost too. */
```

### THE ONE TO BE HANDED THE STROKE, NOT YET HAVING SHOWN IT IS DRAWING -- it waits for `PAD_KEEPUP_PX`:

top level, before `padOwed_`

```
/* THE ONE TO BE HANDED THE STROKE, NOT YET HAVING SHOWN IT IS DRAWING -- it waits for `PAD_KEEPUP_PX`: the held candidate the
   stroke may go to (`padTakes_`); the one it went to when the first lifted, still held (`padSwap_` -- `late`); and the
   owner left alone when its candidate lifted. NOT an owner with its candidate still down: moving alone beside a contact
   that stays still is the evidence (round 1's P7 -- its line back within a frame at 10px). Kind `b` only: a later
   contact that has gone 30px is never held as `b` again (that needs a still owner). */
```

### ONE OF THEM MOVED, ALONE.

top level, before `padAlone_`

```
/* ONE OF THEM MOVED, ALONE. The owner: it was the finger -- anything watched is a rest and a held stroke comes back. A
   watched contact: a rest; it was down first, so it can never take the stroke. The candidate: kind a (the owner had
   already moved when it came) is two fingers, as 338's T4 says; otherwise it takes the stroke if it may (`padTakes_`)
   -- the palm landed first -- and if not the owner was the finger after all. */
```

### REFUSED, SO THE STILL ONE IS THE STROKE AGAIN -- and a ruler's or a compass's still owner is a PIN or a PALM until it shows otherwise.

in `padAlone_`

```
/* REFUSED, SO THE STILL ONE IS THE STROKE AGAIN -- and a ruler's or a compass's still owner is a PIN or a PALM until it
     shows otherwise. Its end needed only `PAD_MIN_PX` (4px), so a pin that rolled 6px while the other finger swung stored
     its own 7-unit ruler line, or a ring of radius 8 round itself, and a palm resting on the picture that drifted 6px while
     the finger drew stored a line or a ring at the PALM (second review, 12 Oct). Not the pen: its still owner resumed is the
     finger after a tap or a brush -- the pen hands a palm's stroke over.
     THE SECOND REVIEW'S ANSWER WAS A THRESHOLD, and the third review found it only moved the stray mark: its line or radius
     counted from `PAD_STILL_PX`, 10px, and a resting palm that drifted 12px while the finger drew stored its own ruler line
     or a ring round itself -- so did one that slid 12px after the finger lifted, one that crept 22px through three tries,
     and a pin that rolled 12px. 6-12px is what round 1 measured a thumb roll and a palm settle at; 10px is inside it, and
     so is any number a drift can reach. So when the pin rule refused a contact ON THE PICTURE, which of the two is drawing
     is decided by what they do next (`padRace_`), and until then the still one can mark nothing and shows nothing.
     `PAD_STILL_PX` stays the least it can mark once it is the one: kept for a refusal off the picture as well. */
```

### THE RACE STARTS WHERE THE STILL ONE WAS WHEN THE FIRST REFUSED ONE LANDED (fourth review), by the samples' clock:

in `padAlone_`

```
/* THE RACE STARTS WHERE THE STILL ONE WAS WHEN THE FIRST REFUSED ONE LANDED (fourth review), by the samples' clock: what
       it moved before that is not a race with anything. Counted from its own down, a palm that settled 9px as it was put
       down -- still a dot, so it never marked -- had only 2-4px more to drift while a slow-starting finger was at 10-12px,
       and its own ruler line or ring was shown and stored (2a89387, real touch: 3-4 of 8 such ruler runs and 1-3 of 6 compass
       runs here, more in the review's). */
```

### WHICH OF THE TWO IS DRAWING, after the pin rule refused the later one:

top level, before `padRace_`

```
/* WHICH OF THE TWO IS DRAWING, after the pin rule refused the later one: THE FIRST TO GO `PAD_KEEPUP_PX` -- past any roll
   or settle (round 1: 6-12px in 50-80ms, and then still). The refused one first: it is the finger drawing, the still one
   is a pin or a palm, and it NEVER marks in this stroke, however far it then drifts, slides or creeps (a palm slid along
   the card after the finger lifts is a hand moving, not a line). The still one first: it is a finger that was aiming
   when a palm landed and settled, and its line counts from then on, and is shown -- even if that palm then slides along
   with the hand, which is why it is a race and not a threshold on the refused one alone (the review's prototype, "30px
   and the still one never marks", lost that line). Neither by the owner's lift: nothing.
   THE STILL ONE WON AT 10px, AND "FURTHER THAN THE OTHER", UNTIL THE FOURTH REVIEW -- and every repair to that left a
   stray mark. Counted from its own down, a palm that settled 9px as it was put down (a dot, so it never marked) needed
   2-4px more to beat a finger that started slowly. Counted from where it was when the other landed (`raceAt`, `raceFrom`,
   kept by `padAlone_`), and "further" asked at each sample's own time rather than at the frame that asks (a frame 100-230ms
   late found a settled palm already past the finger's sample that had beaten it), a ruler's PIN that rolled 12px in
   200ms beat a finger starting slowly beside it every time, real touch, at 390 and 820: the pin's line stored -- where
   2a89387 had only missed it by luck of when its frames ran. 10px is inside what a pin rolls and a palm settles; 30px is
   not. So both sides need 30, the rule `padJudge_` and a hand-over already use, and nothing is compared but two moments.
   The cost, 338 section 4: an aiming finger's line shorter than 30px, beside a palm that landed on the picture over
   `PAD_TOGETHER_MS` later and settled 10px, is lost.
   BY THE SAMPLES' OWN CLOCK, and decided at a frame, for the reason `padJudge_` is: under load one event carries a
   finger's last 100ms, and the other's event for the same moments can be dispatched before or after it. So each side's
   moment is the sample it crossed at (`tk`, kept by `padTrack_`; the still one's from its history, from `raceAt`), and a
   side is beaten only once the other has reported that far in time -- or has been silent `PAD_LAG_MS`, or lifted: it did
   not move. Kept on the stroke, not the contact: a refused one that lifts still counts by how far it went.
   `force` is the owner's lift or the page going: decided from what has come. */
```

### WHETHER THE OTHER MAY TAKE THE STROKE:

top level, before `padTakes_`

```
/* WHETHER THE OTHER MAY TAKE THE STROKE: it came later, onto this pad's ink, and its samples were kept -- the finger
   after a palm. NOT a second finger beside a PIN: with the ruler or the compass, an owner that had been held still on its
   point for longer than `PAD_TOGETHER_MS` before the other came was put there on purpose -- the centre, an end. The
   review drove a real compass's way with two fingers (one on the centre, the other swinging round it) and the pen
   handed the stroke to the swinging finger: an arc centred where IT landed, 52 units off the centre, and a ruler line
   from its start to its end. Neither finger meant either. It is kept as the pen before 338 kept it: the pin's, which
   stores nothing -- and, since the third review, a pin's that marks nothing however it rolls, once the other has gone on
   to draw (`padRace_`). (A two-finger compass -- pin and pencil -- is a revisit, 338.) The pen keeps the swap: a finger
   held still and another drawing is a hand resting and a finger drawing.
   THE COST, CHOSEN (second review, 12 Oct; 338 section 4): by movement a PALM resting on the picture is a pin, so a palm
   down more than `PAD_TOGETHER_MS` before the finger takes the finger's ruler line or compass arc with it -- and every
   one after, while that palm stays down, since each new finger is held against it and refused the same way. A palm down
   within `PAD_TOGETHER_MS` of the finger still hands it over; the pen always does. Only a contact's SIZE tells a palm
   from a pin (increment 2). "Nothing is left at the palm" was written here in the second review and was not yet true: a
   palm that drifted 10px or more marked; the third review made it true once the finger had drawn `PAD_KEEPUP_PX`, and
   the fourth found a palm or pin that beat a slow-starting finger to 10px still marked. Since then the still one marks
   only by going 30px before the finger does (`padRace_`): a palm or a pin drifting less than that never marks. */
```

### THE PIN RULE ITSELF, apart from the other reasons a contact may not take the stroke:

top level, before `padPinned_`

```
/* THE PIN RULE ITSELF, apart from the other reasons a contact may not take the stroke: it came later, onto this pad's
   picture, with the ruler or the compass, more than `PAD_TOGETHER_MS` after a still owner. Only these go into the race
   (`padRace_`) -- a contact refused because it was down FIRST, or is off the picture, says nothing about the owner: the
   owner is the later finger, or the other is a thumb on the card, and either way the owner is the one drawing. */
```

### ---------- THE LOUPE: WHAT IS UNDER THE FINGER, ABOVE IT (357; 338 section 7's increment 2)

top level, before `PAD_LOUPE_PX`

```
/* ---------- THE LOUPE: WHAT IS UNDER THE FINGER, ABOVE IT (357; 338 section 7's increment 2) ----------------
   A FINGERTIP HIDES THE VERY POINT IT IS PUTTING DOWN. Vogel & Baudisch's Shift: a callout above the finger
   showing the picture under it, magnified, with a crosshair on the point the lift will keep -- snapped or
   slowed, it is that point, so what the loupe shows is the promise. 128px across, its zoom enough to make a
   grid square 12px (2x to 4x), centred 112px above the finger, beside it near the top of the screen and never
   below it, where the hand is. ON `<body>`: the panes are moved by transforms (`placeCells`), and a fixed box
   inside one is placed against the pane and clipped by it. A copy of the picture taken once a stroke, the live
   line copied into it at each frame WITHOUT `data-live` -- nothing here is a mark -- and written ONLY in the pen's
   frame (`padFrame_`), so a pen event still reads one box and writes nothing (check/pen.js 'samples').
   WHEN: at once where the target is finer than a fingertip -- a placement on a grid under 13px, a ruler or a
   compass on any grid (Shift's rule: no delay where the target is smaller than the finger hides). Elsewhere
   only on a pause, 338's dwell: 300ms within 10px as a stroke starts, 400ms within 8px in the middle of one.
   NEVER while a stroke is held, while two fingers are down, or while it is not known to be the one drawing --
   what cannot be kept is not shown. */
```

### ---------- A CONTACT LANDS

top level, before `padLand_`

```
/* ---------- A CONTACT LANDS --------------------------------------------------------------------------
   T1, ON THE ARMED INK WITH NOTHING DRAWN: the stroke starts as it always did -- the owner, a dot drawn at
   once -- and every contact already down is looked at. One that landed in the last `PAD_TOGETHER_MS`, or
   is moving now, is a second finger: the stroke is held. An old, still one (a thumb gripping the card, a
   palm put down a while ago) is WATCHED: it can make the stroke two-finger by moving with it, and never
   take it over. A mouse or a stylus owns the pad outright, as before.
   T2, WHILE A STROKE IS DRAWN: an established stroke makes the newcomer a rest (310's rule); a dot of a
   stroke is held, at any age and distance; a young one is held if the newcomer is within
   `PAD_TOGETHER_PX` (two fingers of one hand, not the heel of the palm); anything else is a rest.
   T5, AMENDED AFTER REVIEW: while two fingers are a gesture, a contact landing on the ink joins it -- but only while
   the gesture is IN PROGRESS, one of them having moved in the last `PAD_TOGETHER_MS`. 338 first said "until every
   member has lifted", and the review found what that costs: a thumb gripping the edge, or a palm resting on the
   card, that was half of a two-finger decision and then stayed down kept the pen dead -- line after line drawn and
   nothing under the finger, nothing stored, until that hand lifted, which a gripping thumb never does. A hand gone
   still is not half of a pan in progress: the gesture is over, and what is still down is an ordinary contact already
   down -- T1 watches it, so it can still make the new stroke two-finger by moving WITH it. */
```

### ---------- A CONTACT GOES

top level, before `padGone_`

```
/* ---------- A CONTACT GOES -----------------------------------------------------------------------------
   `how` is up, cancel, or lost (a lift that never came). THE OWNER LIFTING ends the stroke as it always
   did (T6), unless it was held -- then whatever it drew goes, and the other, if it came later and is on
   the ink, is held alone: it becomes the stroke if it goes on to move 30px from where it was held (`padOwed_`;
   10px until the fourth review, when a palm that settled 12px beside a finger's tap was handed the stroke this
   way), and nothing if it lifts short of that. THE OTHER LIFTING leaves the owner held alone, on the same terms
   (fourth review: a palm left holding a stroke after a finger's short tick drew its slide at 10px). So a two-finger
   tap stores nothing whichever finger lifts first, and a finger that slides on 30px after the other lifts is a
   deliberate stroke.
   A CANCEL (T7) WITHDRAWS A TENTATIVE STROKE AND KEEPS AN ESTABLISHED ONE. The cancels that are not ink
   arrive early -- the platform's own palm rejection, a system edge gesture -- and one after 200ms and
   10px of a real line is an interruption; dropping it would lose a mark the child saw. It was always
   kept, which stored the stray mark of every early one. */
```

### ---------- T8: LEAVING, AND T0: A LIFT THAT NEVER CAME

top level, before `padDrop_`

```
/* ---------- T8: LEAVING, AND T0: A LIFT THAT NEVER CAME ------------------------------------------------
   EVERYTHING THE PEN HOLDS FOR A GESTURE, PUT DOWN, AND NOTHING STORED: a change of person
   (`padWhoChanged_`), the drawing turned to its box (`q-draw`), and a primary pointer going down while every
   contact still here is of its kind -- the platform saying no other of that kind is down, so they all lost
   their lifts (`padPrimary_`; one of another kind is left be). */
```

### ---------- THE LISTENERS

top level, before `padPrimary_`

```
/* ---------- THE LISTENERS -----------------------------------------------------------------------------
   ON `document`, so they run before the swipe engine's on `window` (overworld.js): T0's forgetting
   happens before the grid's own `pointerdown`, and a finger is on the drawing before the grid asks.
   EVERY CONTACT ON THE ARMED INK is the pen's -- `preventDefault` and the capture, rest or owner, so a
   palm on the picture is never a press of anything. A touch OFF the ink gets neither: a tap on a tile
   still works. */
```

### T0: A PRIMARY POINTER IS THE PLATFORM SAYING NO OTHER OF ITS KIND IS DOWN -- so every contact of that kind still here lost its lift.

top level, before `padPrimary_`

```
/* T0: A PRIMARY POINTER IS THE PLATFORM SAYING NO OTHER OF ITS KIND IS DOWN -- so every contact of that kind still
   here lost its lift. OF ITS KIND: the Pointer Events spec makes `isPrimary` per pointer type, so a touch is primary
   while a stylus or a mouse is down, and a mouse click is primary while a finger draws. The first build read it as "no
   other pointer of any kind" and the review found it in Chromium with real input: a palm landing as a stylus drew threw
   the stylus's 250px line away and stored the palm's dot, and a mouse clicked beside the picture on a touchscreen laptop
   threw away the finger's line -- where the pen before 338 kept both. So only that kind is forgotten, each one as a lift
   that never came (`padGone_`, 'lost'); a stroke by another kind carries on, and the newcomer is classed by T1/T2 as
   any other (a touch under a stylus is the hand holding it). Every kind gone at once is the old reset. jsdom's
   `undefined` never resets anything. */
```

### ---------- A STROKE THE DEVICE REFUSED STAYS ON THE SCREEN, AND THE NOTE SAYS IT IS NOT SAVED

top level, before `padSave_`

```
/* ---------- A STROKE THE DEVICE REFUSED STAYS ON THE SCREEN, AND THE NOTE SAYS IT IS NOT SAVED -------
   `ansStore_` IS THE ONE WRITER (here, and on the account -- js/answers.js), AND IT USED TO SWALLOW A
   FULL STORE: measured by the review of the whiteboard, store filled to the quota, two more strokes,
   and the device held 2 of the 4 drawn, `ANS_MEM` held 3 (the second write was built on the stale list
   `localStorage` still answered), and Undo then took off a stroke the child could still see. Nothing on
   the screen said any of it. 310's answer was to read the write back and take a refused stroke off the
   screen, with a toast that the device was full.
   AFTER THE MERGE WITH 317 THAT READ-BACK COULD NEVER FAIL, and the rule is 317's, for the board as for
   every answer: a write the store refuses is HELD FOR THE VISIT (`keepPut_`, data.js) and every reader
   asks for the held copy first (`padRead_` through `ansValue_` → `keepHeld_`), so the list the next
   stroke is added to is the list on the screen, and Undo takes off the stroke you can see. The stroke
   stays drawn; the note under the pad says "Not saved — this browser is not keeping it." (`padNoteSay_`,
   repainted by every `ansStore_`), once a visit a toast says it too, and leaving the page asks first.
   Chosen over taking it off because a line that vanishes under the finger is worse than one that is
   said to be unsaved — and a stroke taken off is lost, where a held one lands when the room comes back.
   THE BOARD'S CEILING IS NOT A REFUSED WRITE and is unchanged: `PAD_BOARD_MAX` is the board's size, so
   a stroke past it is never written, is taken back off, and the toast says the board is full. Asked of
   `padRead_`, which is the held list while there is one -- so a board the device has stopped storing is
   still held to its ceiling, and a board that is full says so whether or not the device kept it. */
```

### ---------- AND EVERY OTHER COPY OF THE SAME PAD, FROM THE STORE

top level, before `padCopies_`

```
/* ---------- AND EVERY OTHER COPY OF THE SAME PAD, FROM THE STORE ------------------------------------------
   ONE KEY CAN BE ON THE SCREEN TWICE: Find's card and Saved's (or Spotlight's) are the same question, and
   both are the same pad. A stroke, an Undo or a Clear repainted only the pad it was
   made on, so the other copy went on showing what was there when it was drawn -- found by the review of
   11 Oct with a stroke on Saved's copy of June 2024 1F Q7 and Find's copy at 0 strokes over a store holding
   1, where `Clear` on Find's copy would have wiped a drawing the child could not see. True of 327's
   surfaces and the old figure page's pen as well; it reaches the 470 through their cards now (337). So
   every other `.qpad` on the key is repainted from what was just stored -- `padRepaint_`'s rule, that the
   screen is what a reload would bring back. Not the pad drawn on, whose stroke is already where the finger
   left it. */
```

### THE BAR'S TILES. `Lock it to draw` is a MODE and not an action, so it says which it is with `aria-pressed` and a class — see the note at the top of this block

top level, before `pad`

```
/* THE BAR'S TILES. `Lock it to draw` is a MODE and not an action, so it says which it is with
   `aria-pressed` and a class — see the note at the top of this block about why the pen cannot
   simply always be on. Only one pad takes the pen at a time: turning one on turns the last one
   off, because two live `touch-action: none` regions on one scroller is the trap twice. */
```

### TWO DOORS, ONE HANDLER.

top level, before `pad`

```
/* TWO DOORS, ONE HANDLER. `el` is the lock tile in the bar, or — while the pen is off — the
     PICTURE itself, which carries the same action for the reason written over `padArm_`. Both are
     inside the pad, so neither needs to be told apart here.

     `touch-action: none` STOPS THE BROWSER AND NOT THIS APP, and that is the whole of the fault
     this was first reported as: "when i try draw a line of best fit it slides the whole widget to
     the left". The grid's swipe is a `pointermove` listener on the window — it never asks the
     browser for a scroll, so no `touch-action` anywhere can refuse it, and a line of best fit is
     exactly the stroke that travels furthest sideways. `axisFree` names `[data-noswipe]`, so the
     attribute is the app's own half of the same sentence the stylesheet makes to the browser.

     ONLY WHILE THE PEN IS ON, for the reason written over `.qpad-ink` in the stylesheet: a picture
     you cannot swipe past is a picture that traps you on it, and every question card with a diagram
     would become a page with no way off. */
```

### AND EVERY CONTACT BUT THE ONE DRAWING IS FORGOTTEN, either way:

top level, before `padForgetOthers_`

```
/* AND EVERY CONTACT BUT THE ONE DRAWING IS FORGOTTEN, either way: a palm on the old pad is not a palm
     on this one, and pressed off mid-stroke the stroke ends at its lift as it always did -- kept if it
     was established, withdrawn if it was not (338, T8). */
```

### ---------- PEN, RULER, COMPASS: CHOOSING ONE IS ALSO LOCKING THE CARD

top level, before `pad`

```
/* ---------- PEN, RULER, COMPASS: CHOOSING ONE IS ALSO LOCKING THE CARD ------------------------------
   *"some questions require a compass or ruler. so should have a tile for these things."* Pressing one
   chooses it for this pad AND arms the pen if it was off -- nobody presses Ruler meaning "but do not
   let me draw yet", and making them press the padlock as well would be two taps for one intention. It
   never turns the pen OFF: pressing the tool already in hand leaves it in hand. The padlock is still
   the one way off, and still the one mode this bar has; the tools are which mark that mode makes. */
```

### ---------- CLEAR CAN BE UNDONE

top level, before `pad`

```
/* ---------- CLEAR CAN BE UNDONE ------------------------------------------------------------------
   IT COULD NOT, AND ON THE WHITEBOARD THAT WAS THE WHOLE PAGE. Found by both reviews of the board: draw
   a page, one tap on the bin -- which sits 4px from Undo in a row of 44px tiles -- and the key was
   removed, and Undo answered "Nothing to undo". On a question a slip costs one diagram's marks; on a
   board it costs everything on it. So what Clear takes off is held for the visit (`PAD_CLEARED`), and
   Undo on the emptied pad puts it back -- also after strokes drawn since have been undone one by one,
   which is the order an undo history runs in. One level: a second Clear holds what IT took. Not kept
   past the visit, and dropped at a change of person (`padWhoChanged_`). No dialog: a question that
   interrupts every deliberate Clear to guard against the odd slip is the wrong way round when the
   slip can simply be undone. */
```

### REPAINTED FROM THE STORED MARKS RATHER THAN BY REMOVING A NODE, so that what is on the screen is always exactly what would come back on a reload.

top level, before `padRepaint_`

```
/* REPAINTED FROM THE STORED MARKS RATHER THAN BY REMOVING A NODE, so that what is on the screen is
   always exactly what would come back on a reload. An undo that deleted the last `<path>` and an
   undo that rewrote the list from storage look identical until the two disagree, and then the one
   that disagrees is the one you find out about a week later.
   AND A PATH ALREADY DRAWN EXACTLY AS ITS STORED STROKE DRAWS IS LEFT WHERE IT IS (after review, 338): every `d` is
   still worked out from the store (`padPath_`, kept per stroke), and the screen is still made to say exactly that --
   but from the first path that differs, not from the first path. Rewriting every `<path>` cost a full board's Undo
   2.5 times the characters re-parsed once curves came in (243K against 98K), for one stroke taken off. Only a plain
   path with its two attributes is kept, so a live chunk or anything else in the group is taken off as before. */
```

### THE WHITEBOARD IS THIS PEN, ON NOTHING.

top level, before `WB_ITEM`

```
/* ==================================================================================================
   THE WHITEBOARD IS THIS PEN, ON NOTHING.

   ASKED FOR AS *"Can you also add a whiteboard widget in tools. Make it bare bones for now."* The
   widget is `whiteboard` in WIDGETS (map.js); this is all of its code, and most of that is comment.

   NOT A SECOND DRAWING SURFACE. Everything hard about a pen in this app is already paid for above, in
   bug reports: the lock that holds the column still while a finger draws (`data-noswipe` for the grid,
   `touch-action: none` for the browser -- two halves of one sentence, see `on('pad-draw')`), the
   picture that is a door while the pen is off and a drag that is still a swipe (`PRESS_MOVED`), the
   pen that survives a repaint because it is read off `PAD_ON` rather than left on an element, strokes
   as flat polylines in the device's storage written once per stroke, Undo and Clear redrawn from
   storage, a key per person signed in, and the phone's old marks moving once to whoever opens them. A
   board of its own would have to be paid for again, one report at a time. So `padWrap_` is handed a
   pseudo-item and a blank surface and does what it does for a question.

   WHAT `padWrap_` ASKS OF A QUESTION, AND WHY NONE OF IT BITES HERE -- read rather than assumed:
     `usesUnder_`   an earlier part's marks: `usesOf_` answers null for anything not `kind: 'question'`
     `padTools_`    no `needs`, no words, so the pen alone -- and a lone Pen is drawn as no tool tile
     `padKeptSay_`  "Saved to Ada's account" -- not true of this one, so the note says it is kept here
                    (`padPrefix_` decides; one line in `padWrap_`)
   and the key's prefix, two lines over `padKey_`. That is the whole generalisation.

   BARE BONES, AND THAT IS THE BRIEF RATHER THAN AN UNFINISHED JOB: draw (with the lock), Undo, Clear.
   No colours, no eraser, no shapes, no ruler or compass, no export, no sharing, no pages. What it
   would grow into next, in the order somebody would miss them:
     a second colour   the stroke is a flat list of numbers and nothing else (`padPath_`), so a colour
                       is a change to the FORMAT -- say `{c, p}` beside the bare list, read by `padPath_`
                       -- not a class on the path
     an eraser         Undo is the eraser today; a real one is a tool in `PAD_DRAW` that removes the
                       strokes a drag crosses, which is where the ruler and the compass already live
     the ruler/compass `padTools_` could offer them here with one line (`WB_ITEM.needs`); left off
                       because "bare bones" was the word
     the account       see the next paragraph -- it needs a key the answers tab can tell from a question
     pages, export     a list of boards under one key; a PNG from the two SVGs. Nobody has asked.

   ITS OWN PREFIX, `board:`, SO IT IS NEVER A QUESTION SOMEBODY ANSWERED. Under `pad:` the board would
   be `pad:u:P7:whiteboard`, and every reader of `pad:` keys takes it for an answer: `ansStore_` sends it
   to the `answers` tab as `pad:whiteboard`, and so does the backlog sweep in `answersAdopt_`, which
   walks every `pad:<who>:` key on the device whether or not a question drew it. That tab is the record
   of what a child answered, and anything that ever lists or counts answers from it -- a progress page,
   a parent's summary, a log of what was handed in -- would count a question called `whiteboard` that
   nobody can find. Teaching every reader of that tab, now and later, to skip one name is a rule in N
   places that the next reader will not know about; a key that does not look like an answer is a rule
   in none. answers.js matches `^(ans|pad):` throughout, so a `board:` key goes through the same
   `ansStore_` the pen always calls, is written to the device, has no person in it as far as the
   account is concerned, and is sent nowhere.
   WHAT IT DOES NOT TOUCH, checked: the weekly parent email reads `submissions`, which only a press
   writes (`subRecord_`, js/submit.js -- it was `attempts` and `doneMark_` until 9 Oct), and the pen has
   no press (a stroke is not a submission); Saved keeps the widget's star as
   `w:whiteboard` in `FAVS`, a widget like the calculator, not a question; and nothing else walks the
   store but that sweep, the once-per-person migration of answers done before submissions
   (`subMigrate_`, which reads `ans:u:` keys only) and the splash (`splashAnim:`) -- and, since the
   signed-out answers began moving to whoever signs in, `answersClaim_`, which takes a board only when it
   is marked as the person's own -- drawn after the server ended their session (docs/history/317, "Six
   edges closed") -- and never makes it due. Any other board drawn signed out stays the device's, and is
   moved only into an EMPTY board, by whoever opens the board first (`padAdopt_`).
   WHAT IT COSTS: the board stays on the device it was drawn on, per person signed in there. For a board
   that is the ordinary thing -- you wipe it -- and the note under it says so. And its size is bounded
   here rather than by the device's store running out: `PAD_BOARD_MAX`, below.

   WHAT THE BOARD FOUND IN THE PEN. "The pen has already paid for it" held for the lock, the swipe and
   the per-person key, and the two reviews of the board still found four faults a question's small
   picture had never shown, each fixed in the pen for both rather than here for one: a second finger
   or a palm taking over the stroke (the note over `pointerdown`), a repaint cutting a stroke on any
   column but Find (`padHold_`), Clear with no way back (`on('pad-clear')`), and a full device keeping
   strokes on the screen it had refused to store with nothing said (`padSave_` -- since the merge with
   317 the stroke is held for the visit and the note says it is not saved). And two that are the
   board's own: a sign-out leaving the last person's board armed on a stale column (`padWhoChanged_`),
   and its size.

   THE SURFACE IS PAPER, because it stands in for a physical board: `--paper` with the ink in
   `--paper-ink`, never gold. The pen is gold on a question because the question's own figure is
   printed in `currentColor` and your line has to be told from its axis; here there is nothing on the
   board but your marks, and gold on cream is a line you can barely see. Sized in `style.css` (`.wb`),
   where the reason for its shape is written: the ink is stretched to its box, so the box keeps ONE
   shape everywhere or yesterday's circle comes back an ellipse. */
```

### EMPTY, BECAUSE THE BOX IS THE BOARD.

top level, before `WB_SURF`

```
/* EMPTY, BECAUSE THE BOX IS THE BOARD. On a question `.qpad-art` takes its size from the figure in it;
   here `.wb .qpad-art` is given its paper and its 3:4 itself (style.css) and this only fills it, so
   the ink is laid over it exactly as over any figure. */
```

### ---------- HOW BIG A BOARD MAY GET, AND WHAT A STROKE ON IT COSTS

top level, before `PAD_BOARD_MAX`

```
/* ---------- HOW BIG A BOARD MAY GET, AND WHAT A STROKE ON IT COSTS ---------------------------------
   UNBOUNDED, AND REWRITTEN WHOLE ON EVERY LIFT. Measured by the review in Chromium on the board's own
   key: a stroke as `PAD_DRAW.pen` builds it is one point per unit moved, about 2,500 characters across
   the board, so 100 strokes were 254K characters and 3-5ms a lift on a desktop, 1,000 were 2.5M and
   66-83ms -- all of it synchronous, on a phone slower -- in a store of about five million characters
   that every typed answer is written to as well. A question's pad is bounded by its one question and,
   signed in, by `ANS_PAD_MAX`; the board is one open-ended key per person and was bounded by nothing.
   SO EACH STROKE IS STORED THINNED, and the board has a ceiling. Thinned by `ansSimplify_` at one unit
   (js/answers.js) -- what a question's drawing gets on its way to the account, the same line to within
   a unit, which is finer than the finger, at a fraction of the characters. Only what is STORED is
   thinned: the line under the finger keeps every point while it is drawn. The ceiling is 100,000
   characters -- two and a half times a question's, a few hundred strokes as stored, and four people's
   boards on one iPad well under a tenth of the store; reached, the stroke is taken back off and the
   toast says to Clear (`padSave_`). Measured after, in note 310. */
```

### ---------- AND NO COLUMN IS REDRAWN UNDER A STROKE

top level, before `padHold_`

```
/* ---------- AND NO COLUMN IS REDRAWN UNDER A STROKE --------------------------------------------------
   FOUND BY THE REVIEW OF THE WHITEBOARD: lock it, start a stroke, and call `repaint()` half way -- which
   is what a payload landing does, and the inbox reply after every load -- and the stroke was cut where
   the repaint came. `paint` held a column back for Find only (`findKeep_`, js/answers.js, whose own
   note records this exact fault on Find), so Tools and Saved were rebuilt under the finger: the ink was
   replaced, `pointermove` ignored the new one, and the lift stored the half already drawn -- 34 to 142
   units of a stroke that went to 306 -- through a detached copy, so the board on the screen drew none
   of it and Undo then took off a stroke nobody could see.
   SO THE RULE IS WHICHEVER COLUMN HOLDS THE STROKE. `paint` (shell.js) asks this beside `findKeep_`,
   and a column with `PAD_GO`'s ink in it is marked STALE instead of drawn, and drawn the next time it is
   arrived at, as `settingsKeep_` does for a half-typed card. A repaint ALSO restarts the column's
   widgets, so `startScreen_` asks this too and leaves the held column running, as it does for
   `reconnectKeep_`; and `wbPaint_`, which a change of person still runs, skips the copy being drawn
   on, for the same reason. */
```

### ---------- A CHANGE OF PERSON PUTS THE PEN DOWN AND DRAWS EVERY BOARD AGAIN

top level, before `padWhoChanged_`

```
/* ---------- A CHANGE OF PERSON PUTS THE PEN DOWN AND DRAWS EVERY BOARD AGAIN ------------------------
   FOUND BY THE REVIEW OF THE WHITEBOARD, with real touches at 390x844: lock the board signed in, draw,
   swipe to Account and Sign out -- and Tools, which a sign-out marks STALE rather than redraws, still
   held the last person's board: their three strokes, the frame lit, `data-k` and `PAD_ON` both still
   theirs, all the way to the next arrival, and on the screen mid-swipe on the way there. A line drawn on
   it would have gone into their key. The family's shared iPad, which is what `signedOut_` is for.
   SO `signedOut_` AND `signedIn_` (me.js) CALL THIS: every pad on the page disarmed, the stroke and the
   held Clears forgotten, and every copy of the board drawn again under whoever is signed in now. The
   board is the one widget whose markup is a person's and whose column a repaint may leave stale; any
   question's pad left on a stale column is disarmed here too, so none can take a stroke meanwhile. */
```

### EVERY COPY, BY CLASS -- `tmtPaint_`'s reason:

top level, before `wbPaint_`

```
/* EVERY COPY, BY CLASS -- `tmtPaint_`'s reason: the Saved column draws this same markup, and two
   elements under one id is the `$('msg-text')` fault. The same key in both, so a stroke on one is on
   the other the next time it is drawn. EXCEPT THE COPY A FINGER IS DRAWING ON, `padHold_`'s reason. */
```

### AND EACH SLOT IT DRAWS INTO IS SAID TO BE DRAWN FOR WHOEVER IS SIGNED IN NOW (`slot.WHO`).

top level, before `wbPaint_`

```
/* AND EACH SLOT IT DRAWS INTO IS SAID TO BE DRAWN FOR WHOEVER IS SIGNED IN NOW (`slot.WHO`). A change of
   person puts every drawing that was somebody else's back under its loader, at once (`widgetsReveil_`,
   arcade.js; docs/history/341) — and this is called by `signedOut_` and `signedIn_` exactly to draw the
   board for the person arriving, before their repaint. Unstamped, the repaint took the board it had just
   drawn for them for the last person's and veiled it, and a stale Tools column showed the loader where the
   arriving child's own strokes belong. */
```

### "USE YOUR GRAPH" SHOWS YOUR GRAPH.

top level, before `usesPart_`

```
/* ==================================================================================================
   "USE YOUR GRAPH" SHOWS YOUR GRAPH.

   FOUND BY THE MULTI-PART AUDIT, finding 5. June 2024 2F Q24(b): "On the grid, draw the graph of
   y = x^2 - x". Q24(c): "Use your graph to find estimates for the solutions of x^2 - x = 4" -- and (c)
   had no picture at all. The graph it asks about was the child's own, on (b)'s grid, two swipes back
   past (b)'s answer page; on Saved, or reached by a search, it was nowhere. And the related case the
   audit named: May 2017 1F Q6(ii) puts a cross on "the probability scale" -- a fresh copy without the
   cross (i) made, where the paper prints ONE scale with both on it.

   THE ROW SAYS WHICH PART, AND THE APP DOES NOT GUESS. `uses` is the earlier part's own `part` cell
   (`b`, `i`, `3`) inside the same paper and question; tools/set-uses.py is the deciding, row by row,
   and says why it is a cell and not a match on the words: half of these say nothing in their words
   ("Draw y = 2x" on the grid "Draw y = 4" already used), and "the graph" is as often the paper's own
   as the child's. A part naming no such part, or one that does not exist, draws exactly what it did.

   ONE RULE, TWO PLACES, BOTH IN THE PART'S OWN CARD, READ ONLY IN BOTH (356):
     this part's own figure IS that picture   that figure, in its place among the words, with the marks
                                              on it (`usesFig_`) -- whether this part only looks (AQA's
                                              "How does Figure 2 show" after (3) plotted Figure 2) or
                                              draws too; and where it draws, the same marks UNDER its own,
                                              dimmer, out of reach of its Undo and Clear (`padWrap_`)
     it has no such picture                   the earlier part's picture with the marks on it, IN FRONT
                                              OF ITS WORDS (`usesBlock_`), with nothing said under it. It
                                              was a page of its own (`use`) until figures moved into their
                                              cards; the line naming whose marks they were went with every
                                              credit (355).
   READ ONLY BECAUSE THE MARKS ARE THE EARLIER PART'S ANSWER. A pen here that wrote to (b)'s key would
   be (b)'s answer changed from (c)'s page; a pen that wrote to (c)'s would be a second graph that (b)
   never sees. Changing a graph is done where it was drawn -- on (b)'s card.

   WHOEVER IS SIGNED IN, as the marks are (`padKey_`): Ben's (c) shows Ben's graph, not Ali's. A CHAIN
   IS ONE PICTURE: FSL2 Q3(c) uses (b), (b) uses (a), all on one scatter diagram, so (c)'s page carries
   (a)'s points and (b)'s line -- followed while the picture is the same one, never round a loop. */
```

### THE PARTS `x` USES WHOSE MARKS ARE ON THE PICTURE `svg`, earliest first, stopping where the picture changes.

top level, before `usesChain_`

```
/* THE PARTS `x` USES WHOSE MARKS ARE ON THE PICTURE `svg`, earliest first, stopping where the picture
   changes. The same picture is the same markup: equal strings, so a mark lands on the same point of it
   -- a different drawing of "the same" figure would put it somewhere else. */
```

### A PICTURE WITH MARKS ON IT AND NO PEN:

top level, before `usesSeen_`

```
/* A PICTURE WITH MARKS ON IT AND NO PEN: the pad's box and ink layer (`.qpad-art`, `.qpad-ink`) so a
   mark lands exactly where `padWrap_` drew it, inside `.qseen` rather than `.qpad` -- the class every
   pen handler and `padArm_` look for, so none of them can arm a picture that is not for drawing on. */
```

### DOES THIS PART'S CARD DRAW THE EARLIER PICTURE IN FRONT OF ITS WORDS -- see the note above.

top level, before `usesPage_`

```
/* DOES THIS PART'S CARD DRAW THE EARLIER PICTURE IN FRONT OF ITS WORDS -- see the note above. A PART WHOSE
   OWN FIGURE IS THAT VERY PICTURE does not: its own figure is that picture, with the marks on it
   (`usesFig_`). Every other part whose earlier part drew does, its pen on a stem or a surface included --
   "draw the line y = 3 on the grid" after (a) drew a curve on the same stem's grid shows (a)'s marks in
   front of the words and again, fainter, under its own pen. `prev` is asked of nothing; it is the
   signature every page rule has. */
```

### THE PAGE: the earlier part's picture with the marks on it, and nothing said under it -- the lines naming whose marks they were went with every credit on 18 Oct

top level, before `padSurface_`

```
/* THE PAGE: the earlier part's picture with the marks on it, and nothing said under it -- the lines
   naming whose marks they were went with every credit on 18 Oct (355). `data-of` is THIS
   part's row, because the page is this part's -- it stands in front of it and only it; `data-uses`
   names the row the marks came from. */
```

### A SURFACE TO ANSWER ON, FOR EVERY QUESTION ANSWERED ON ONE.

top level, before `padSurface_`

```
/* ==================================================================================================
   A SURFACE TO ANSWER ON, FOR EVERY QUESTION ANSWERED ON ONE.

   ASKED FOR AS *"Also some questions require answers on diagram. So should have a diagram for them to
   draw on to do it or whatever."* -- the owner, after a lesson on June 2024 Paper 1 Foundation. Of 301
   questions the sheet says are answered by drawing or annotating, 67 had a picture under the pen; the
   other 234 drew a box for words and nowhere to put the mark the question asks for.

   THE NOTE ABOVE `padKey_` ARGUED THE OTHER WAY, AND IT WAS RIGHT ABOUT ONE THING. "On the grid,
   enlarge triangle T" over squared paper with no triangle T is a question you cannot fully answer.
   What changed is who decides: the owner, teaching from it, wants somewhere to work -- a square grid
   to sketch the enlargement on, axes to plot the graph on -- over a word box that cannot hold a line
   at all. So the surface is honest about what it is (never "Figure"), and where the data workflow redraws
   the paper's own figure, that figure takes the pen and the surface is never drawn. IT STANDS WHERE THE BOX
   WOULD, on the card (`ansArea_`): a page of its own until 327, the box's other face behind `Draw` until
   18 Oct, and the answer itself since (356).

   WHICH SURFACE, in this order:
     `surface`   the row says: "grid", "coord", "blank" or "text" (`check-library.js` holds the
                 vocabulary). Said explicitly, it is a surface whatever the `answer_type`, because it
                 is somebody's decision about this question.
     `figure`    the transcriber's label, for a pen question only (`padWanted_`): anything naming a
                 coordinate grid is axes on a grid; anything else naming a grid (`grid-blank`,
                 `histogram-grid`, `grid-triangle`, `square-grid`...) is squared paper -- read as a
                 rule rather than a list of the five spellings there are today; everything else is a
                 blank space to draw in. An isometric label is blank, not squared: the wrong grid is
                 worse than none.
   "text" IS NOT A PICTURE AT ALL -- see `circWords_`: the passage on the card is the surface.

   ONE FUNCTION AND EVERYTHING IT NEEDS INSIDE IT, so `check-library.js` can cut it out by name with
   `padWanted_` and count what the library gets, rather than keeping a second opinion of the rule. */
```

### WHAT EACH IS CALLED, where a paper figure is called "Figure":

top level, before `SURFACE_NAME`

```
/* WHAT EACH IS CALLED, where a paper figure is called "Figure": a name that says what is drawn and does
   not claim to be the paper's. It headed the surface's own page until that page went (327); it still
   names the surface to a screen reader (`surfaceSvg_`). */
```

### ---------- THE SURFACE ITSELF

top level, before `surfaceSvg_`

```
/* ---------- THE SURFACE ITSELF -------------------------------------------------------------------
   INSIDE `W = 340`, the box every diagram here lays out in (CLAUDE.md), so the pen's overlay maps onto
   it exactly as it maps onto a transcribed figure. Inked with the classes a transcribed grid already
   uses -- `.grid` for the squares, `.axis` for the axes, `.ax` for the numbers -- so a surface reads as
   one more figure in the paper's own ink, on both palettes, with no colour written here.

   THE SQUARES ARE 20 UNITS AND THE GRID STARTS AT 10, so the centre (170) is a line: the axes go
   through it with -8 to 8 either way, which is the range a Foundation paper's coordinate grids use. */
```

### A QUESTION ANSWERED BY DRAWING IS DRAWN, ON ITS CARD, AND THERE IS NOTHING TO SWITCH.

top level, before `surfaceOf_`

```
/* ==================================================================================================
   A QUESTION ANSWERED BY DRAWING IS DRAWN, ON ITS CARD, AND THERE IS NOTHING TO SWITCH.

   THE OWNER, 18 Oct, over June 2024 1F Q7 ("On the grid, draw a suitable diagram or chart") with a
   "Type your answer" box, a `Draw` tile, "Figure on the next page" and the empty grid a page away:
   *"there's a way to switch from text to graph. But then there's also like a graph widget below. Also
   why would there be an option for text answer in the first place? Can you see how sloppy it is?"*
   327 (10 Oct) and 337 (11 Oct) had made the drawing the box's other face behind `Draw`, on his word then
   (*"just leave it as an answer box like before but theres an option to switch to drawing box"*). This is
   his later word, and it wins: the switch, the face this device remembered (`surfaceFace`) and the tile
   are deleted whole. See docs/history/356.

   SO THE CARD DRAWS WHAT THE QUESTION IS ANSWERED WITH (`answerKinds_`), ONCE:
     a value                       the box, as every other question.
     a drawing on the paper's      that figure under the pen, WHERE THE PAPER PRINTS IT among the words
       figure (its own, a stem's)  (`cardFig_`, placed by `partPlan_`), and nothing at the foot.
     a drawing on a made-up        the surface under the pen where the box would be: squared paper, axes
       surface                     or a blank space has no place among the paper's words.
     both                          the drawing in its place and the box at the foot, the card's order.
   The drawing is kept under `pad:` (`padKey_`) as it always was, so every drawing already made -- on the
   old figure page, the old surface page or behind `Draw` -- opens on its card.

   `surfaceOf_` IS ONLY "IS IT MADE UP" -- the states in check/states.js find a made-up surface by it. */
```

### ---------- THE ANSWER AREA AT THE CARD'S FOOT

top level, before `ansArea_`

```
/* ---------- THE ANSWER AREA AT THE CARD'S FOOT ----------------------------------------------------------
   `.qp-area` ROUND A MADE-UP SURFACE ONLY, so the figure-ink rules that name it (`.qp-area .grid`, style.css)
   and the surface's `44svh` cap reach it; a paper figure under a pen stands inside `.qsheet`, which inks it
   already. `data-q` names the question for a check to find the card's surface by. */
```

### ---------- A CARD WITH A FIGURE IN IT GIVES WAY BEFORE IT IS DRAWN SMALLER, AND NEVER WHOLE

top level, before `FIG_FLOOR`

```
/* ---------- A CARD WITH A FIGURE IN IT GIVES WAY BEFORE IT IS DRAWN SMALLER, AND NEVER WHOLE -----------
   ONE RULE FOR EVERY CARD HOLDING A PICTURE, with a pen on it or not (18 Oct, 356). It was `padFaceFit_`,
   keyed on the drawing face of 327 and 337, and it had two orders -- a picture with something to read in
   it kept its size longer than an empty grid. With the figure on the card for everybody, two orders was
   two ways for the same card to look, which is what the owner asked to be rid of; so there is one, the
   one that keeps every picture legible longest:

     1. THE WORDS GIVE WAY FIRST, to `PANE_ZOOM_MIN` like any card's -- the tags and the sheet's words,
        never the picture, the pen's bar, the box or a tile row (a fingertip is the same size on every
        screen, CLAUDE.md).
     2. THEN THE PICTURE NARROWS, keeping its shape, to `FIG_FLOOR` and never under it.
     3. WHAT IS STILL OVER SCROLLS from its first pixel (`paneReach_`'s `drawn`). The card is never drawn
        smaller whole: on a drawing card the targets are the point, and a figure at 0.7 is labels at 6px.

   `FIG_FLOOR` IS 337's `PAD_FACE_FLOOR`, unchanged: a picture 180px wide draws a 13-unit label at 6.9px, and
   the finest grids were still read and drawn on at that width at 320x568. A picture the stylesheet already
   drew under it (a made-up grid at its `44svh` cap on a phone on its side) is left at that size.

   Measured at zoom 1 every time -- `paneReach_` resets before it calls this -- and `data-face-zoom` /
   `data-fig-fit` mark what this wrote, so only that is undone. */
```

### THE WORDS: every element of the card that holds no picture and is none of what keeps its size, found by walking down only through what holds a picture -- so a

in `cardFigFit_`

```
/* THE WORDS: every element of the card that holds no picture and is none of what keeps its size,
       found by walking down only through what holds a picture -- so a paragraph beside the figure in the
       same `.qsheet-pb` gives way while the figure beside it does not. */
```

### ---------- AND A PASSAGE YOU MARK BY TAPPING ITS WORDS

top level, before `circKey_`

```
/* ---------- AND A PASSAGE YOU MARK BY TAPPING ITS WORDS ----------------------------------------------
   "Circle the three adjectives in the passage below" -- KS2 SATs grammar asks it of a sentence, and the
   answer is a ring round three words. `surface: "text"` makes the PART'S OWN WORDS the surface: every
   word a tap target, a tap rings it, another tap takes the ring off.

   A TAP, NOT A PEN, AND THAT WAS DECIDED RATHER THAN DEFAULTED TO:
     the pager swipes -- a stroke round a word is a drag, and a drag on this screen turns the page
       unless the pen is locked first (`padArm_`), which is two controls between a child and a
       circle. A tap is a click, and `PRESS_MOVED` already tells a click from a swipe.
     a ring drawn in pixels is a ring round whatever was under it at that width -- turn the phone
       and the passage reflows and yesterday's ring circles the wrong word. A ring stored as the word
       (its block and its place in it, `3.7`) is the same word at 320px and on a laptop.
     what the question asks for IS a set of words, so storing one is storing the answer.

   STORED LIKE THE PEN'S MARKS, beside them: `pad:<who>:<question>:words`, every read and write
   wrapped, because private mode throws on `localStorage`; `CIRC_HELD` keeps the visit's rings when it
   does. Per person through `padKey_`, and the phone's old rings move once to whoever opens them first
   (`circOf_`, by `padAdopt_`), for the reason written there. */
```

### EVERY WORD OF A BLOCK OF MARKUP, WRAPPED, AND NOTHING ELSE TOUCHED.

top level, before `circWords_`

```
/* EVERY WORD OF A BLOCK OF MARKUP, WRAPPED, AND NOTHING ELSE TOUCHED. Text between tags only -- never
   an attribute, never inside a drawing -- and an entity is never cut in half: `&rsquo;` inside
   "don&rsquo;t" joins the word, any other entity stands alone and is not a word. Punctuation is not
   part of a word, so ringing "hill" does not ring the full stop after it. */
```

### EVERY COPY OF THE WORD, on every page built, by key -- the card and a page of the same question peeking under it are two copies of one passage, and a ring on

top level, before `lit`

```
/* EVERY COPY OF THE WORD, on every page built, by key -- the card and a page of the same question
     peeking under it are two copies of one passage, and a ring on one only would be the two pages
     disagreeing. In place, so the passage does not move under the finger. */
```

### ---------- `FIG_BY` AND `figCredit_` WERE HERE: a line under every picture this site redrew ("drawn for

top level, before `pics_`

```
/* ---------- `FIG_BY` AND `figCredit_` WERE HERE: a line under every picture this site redrew ("drawn for
   @family. from the paper's own figures -- the original is the board's and is not reproduced here").
   The owner, 18 Oct: *"I don't like that extra text which disclaims it's drawn from blah blah. Get rid of
   that. Everywhere. It's just makes less appealing."* The paper is already named by the card's tags.
   `diagram_by` stays in the data as provenance, held to its closed vocabulary by `check-library.js`,
   and nothing on screen reads it (docs/history/355). */
```

### ---------- A PICTURE THE QUESTION CAME WITH

top level, before `pics_`

```
/* ---------- A PICTURE THE QUESTION CAME WITH -----------------------------------------------------
   `loading="lazy"` BECAUSE A RESULT PAGE HOLDS SEVERAL AND YOU ARE LOOKING AT ONE. `fillStuffPages`
   already only builds the pages you are near, and this is the same argument one level down.

   NO ALT TEXT INVENTED. A photograph used as a writing prompt is the subject of the question — a
   description of it written here would be a different prompt, and a wrong one. The figure is
   labelled as the question's picture and the question's own words say what to do with it, which is
   what a printed paper does too. */
```

### THE DAY A PAPER WAS SAT, WHEN THE ROW SAYS — "Thursday 25 May 2017".

top level, before `satOn_`

```
/**
 * THE DAY A PAPER WAS SAT, WHEN THE ROW SAYS — "Thursday 25 May 2017".
 *
 * WRITTEN BECAUSE A SERIES IS NOT A DATE AND SOMEBODY ASKED FOR THE DATE. `seriesOf_` names the
 * button "Summer 2017", which is true of every paper in the series and is what a filter needs; the
 * note above it records the day that stopped being enough. What a tutor sitting down with a student
 * says is "the Thursday 25 May 2017 paper", and until now that sentence existed nowhere in the app:
 * `exam_date` went into the file, passed `check-library.js`, and NOTHING READ IT. A column written
 * and never read is this repository's oldest fault, and it is on the second page of CLAUDE.md under
 * `figure`, under `ticks_*` and under `orderPrints`.
 *
 * READ BY PATTERN AND BUILT IN UTC, never `new Date('2017-05-25')` against the machine's clock — a
 * paper that is Thursday in London and Wednesday in New York is the `waveOf` timezone fault in a
 * second column, and that one cost seven buttons.
 *
 * ABSENT ON ALMOST EVERY ROW, AND THAT IS THE DESIGN. One paper carries a date so far, because a
 * date is a fact somebody has to know rather than derive: Edexcel took the exam date off the front
 * page in 2021 and the © line narrows it to a year. So this draws nothing rather than guessing, and
 * the paper's own name — which always carries its month — goes on being the subtitle either way.
 */
```

### EVERY TAG ON A CARD IS AN ANSWER YOU CAN PICK IN THE FINDER:

top level, before `TAG_NAME`

```
/* ==================================================================================================
   EVERY TAG ON A CARD IS AN ANSWER YOU CAN PICK IN THE FINDER: ONE RENDERER, ONE RULE.

   THE OWNER, 12 Oct: every tag is a finder answer -- same word, same colour, in the order the finder
   asks -- and Q1a(ii) is [Q1] [a] [ii], `1 of 5` is [1] [of 5]. And on 18 Oct, over a Q7 card whose
   `Question` tag was a filled white pill: *"I'm sensing some tags are treated differently from others
   such as diagram, figure, question. Please eliminate all unique conditional rules which treat them
   differently."* There were four renderers (`qTags_` with `qPage_` and `qNumSay_`, the content card's
   `contentTags_`, the Bible verse's own row, and a pill in each card head) and about twenty rules
   inside them: SATs hid the board, a tier the paper's name said was hidden, the name was cut at its
   dash and its colon, a grey qualifier tag nothing could pick, `sat Friday 10 May`, a figure page with
   no number, a 5-a-day branch, a Specimen split. Each was a fix for one card. docs/history/355.

   SO THIS WALKS `facetList()` IN ITS ORDER and draws every live facet marked `tag: true`: its answers
   for this item through `facetOwn_` (the funnel's own reader, `not:` included), spelled by the chip's
   speller (`showOf`) and coloured by the chip's kind (`tagAttr_`). A facet the sheet switches off takes
   its tag with it; a facet the sheet adds and marks is drawn with no code. Two hooks, each declared on
   its facet rather than tested here: `tagOf` where the answer depends on the page (`What kind` says
   `Answers` on the answer page; `Page` is this page's number) and `tagSay` where the tag is shorter
   than the library-unique chip (`Paper`, as its folder draws it).

   ONE DEDUPE: A NAME IS SAID ONCE, the first facet in the order wins -- board and Publisher, Level and
   a 5-a-day's Level, `A-Level` as a level and a tier -- and the same id is said once (a 5-a-day's Day
   IS its paper's id, `folderOpened_`'s rule). A bare number is a position in its own facet, never a
   name, so Genesis 1:1 keeps both its ones and Q2's page [2] is not swallowed by anything.

   NO TAG IS A CONTROL. Labels, smaller than a chip; picking is the funnel's job, and every one of these
   words is an answer it can offer (the question's own are doors on a chosen paper, `tagDoors_`). */
```

### ---------- THE PAPER TAG, AS ITS OWN FOLDER NAMES IT

top level, before `PAPER_TAG`

```
/* ---------- THE PAPER TAG, AS ITS OWN FOLDER NAMES IT ---------------------------------------------
   The chip's `showOf` with no answer list is the LIBRARY-unique name -- `Paper 1 (Non-Calculator) ·
   Foundation — June 2024` -- right for a paper standing alone, and a card is not alone: its tags in
   front already say the level, board, tier, year and month. So the tag is what the Paper question
   draws inside that folder -- `shortLabels_` over the papers sharing those answers, with the sitting
   already said -- which is `Paper 1`, and the calculator is its own tag (285). Memoised per paper. */
```

### ---------- A PART'S READING PAGES, FOR THE PAGE TAGS

top level, before `qPagesOf_`

```
/* ---------- A PART'S READING PAGES, FOR THE PAGE TAGS ---------------------------------------------
   Its pre pages and its card -- `partPlan_`'s chunks, read live, so a change to how a part is cut
   flows into [1] [of 2] with no edit here. `qPageAt_` is which of them a page is: the card is the
   last, `preJ` the J+1th, and a stem or answer page is none of them. */
```

### ---------- WHAT TO BRING, IN ONE SPELLING

top level, before `NEEDS_SAY`

```
/* ---------- WHAT TO BRING, IN ONE SPELLING ----------------------------------------------------------
   THE CARD SAID IT TWICE AND SPELLED IT TWO WAYS: `Non-Calculator` off the paper's name and `No
   calculator` off the `needs` cell. One tag now, in the words below, and the funnel's `What you need`
   answers and chips say the same words through the facet's `showOf` -- so the card, the answer and the
   chip cannot disagree about which spelling a fact has.

   `Non-calculator` BECAUSE IT IS THE BOARD'S WORD AND THE OWNER'S -- *"why do the questions say non
   calculator"* -- and the word on the cover of every Edexcel Paper 1, in sentence case like every other
   answer. `Calculator allowed` RATHER THAN `Calculator`, because a calculator paper permits one rather
   than needing one (*"You may use a calculator"*), and a bare `Calculator` beside a paper's name reads
   as what the question is about. The cell keeps the vocabulary `check-library.js` closes; this is
   how it is SAID, and `showOf` is the funnel's own door for exactly that. */
```

### NO STEM HERE. The paragraph a part hangs from is its own page in front of the first part that shares it -- `questionStemCard_`, in `pageParts_`'s order -- so

in `questionCard_`

```
/* NO STEM HERE. The paragraph a part hangs from is its own page in front of the first part
            that shares it -- `questionStemCard_`, in `pageParts_`'s order -- so six parts of one
            question no longer print the same paragraph six times. The lead is the part's own. */
```

### THE LAST OF THE WORDS, which is all of them unless the part is too long for one page -- then the pages in front (`questionPreCard_`) hold the rest and this

in `questionCard_`

```
/* THE LAST OF THE WORDS, which is all of them unless the part is too long for one page --
            then the pages in front (`questionPreCard_`) hold the rest and this keeps the ask. AND ITS
            FIGURE AMONG THEM, WHERE THE PAPER PRINTS IT (`partPlan_`, `figHtml_`) -- under the pen when
            the question is answered on it, which is then the whole answer (356). No page of its own and
            no "Figure on the next page": the owner, 18 Oct, *"there's also like a graph widget below"*. */
```

### YOUR BOX, AND THE MARK SCHEME IS NOT UNDER IT ANY MORE.

in `questionCard_`

```
/* YOUR BOX, AND THE MARK SCHEME IS NOT UNDER IT ANY MORE. It is the page after -- see
          `questionAnsCard_` -- and the order is still the whole point: an answer you can see before
          you have written one is not a question. What stays here is ANSWERING: the box, Send, the
          options to tap, or a made-up surface to draw on -- whatever `answerKinds_` says the question
          is answered with, and nothing it is not (`ansArea_`). */
```

### ---------- THE STEM, ITS OWN PAGE IN FRONT OF ITS PARTS

top level, before `stemId_`

```
/* ---------- THE STEM, ITS OWN PAGE IN FRONT OF ITS PARTS -------------------------------------------
   `Q5` AND NOT `Q5(a)`: the paragraph belongs to the whole question, so its header is the question's
   number with no part and no marks -- the marks are each part's. The tags, so a stem landed on cold
   still says which paper. Its figure is among its words, where the paper prints it (`stemPlan_`).

   `is-standin` MARKS A PREAMBLE THAT IS A DESCRIPTION OF THE REAL THING RATHER THAN IT. An AQA
   English insert is a separate booklet of third-party copyright, so the source is not in the paper
   and cannot be here either -- what is in the row is enough to teach around. A student reading an
   exam question has to be able to tell at a glance which of the two they are looking at.

   WHICH PART OF THE SOURCE THIS IS, when the insert has been split into several (`lines`). Every
   AQA reading question names a span -- "lines 1 to 6", "from line 20 to the end" -- so a part with
   no label leaves the student holding four blocks of prose. Drawn only when the row says one. */
```

### ---------- A LONG PART'S FIRST PAGES

top level, before `questionPreCard_`

```
/* ---------- A LONG PART'S FIRST PAGES ---------------------------------------------------------------
   `Q2.4 · 1 of 2`, the tags, and the words up to the place the card takes over -- the method, the
   table, the scene -- with "Continued on the next page". No box, no marks and no tiles: the card is
   still the question, and this is the reading in front of it. */
```

### A PAGE IS SMALLER THAN A PHONE, SO LONG WORDS ARE CUT BETWEEN PARAGRAPHS.

top level, before `CHUNK_PAGE`

```
/* ==================================================================================================
   A PAGE IS SMALLER THAN A PHONE, SO LONG WORDS ARE CUT BETWEEN PARAGRAPHS.

   ASKED FOR AS *"each widget is smaller than a phone screen"*. Measured by `check/cards.js` through
   these builders over every page of the library: with the stems on their own pages, 1,188 of 6,730
   question cards and 29 of 304 stems were still taller than a 320 x 568 pane -- an AQA English
   insert of 3,900px, an A-level method of eight steps and a table with the ask under it.

   CUT AT THE TOP-LEVEL BLOCKS, NEVER INSIDE ONE. A paragraph, a table, a list, a heading is the
   smallest thing that can stand on a page by itself; a table cut between its rows is two tables
   neither of which has its header row, and a sentence cut in half is not reading. So the cutter
   counts tag depth and only cuts where it returns to the top after a block, and a single block
   longer than a page stays whole -- the pane scrolls it (`paneReach_`), which is the old behaviour
   for the one thing that cannot be helped.

   BY A WEIGHT, NOT BY A LAYOUT. Nothing here knows the screen: pages are counted before anything is
   drawn, by `stuffPages_`, and a cut that moved with the window would renumber every page under the
   pager when a phone turned. So a block weighs its characters plus a line's worth for each paragraph,
   row, item or break it holds, and the budgets are set from what fits a 320 x 568 pane at the root's
   14.8px -- the narrowest phone, so a page that fits there fits everywhere.

   A PART KEEPS ITS LAST WORDS WITH ITS BOX. The cut runs from the end: the card takes the ask and as
   much in front of it as fits beside the box and the tile row (`PART_LAST`), and the pages before it
   take the rest. A question and the box you answer it in are on one screen, which is the point. */
```

### ---------- A FIGURE IS NEVER A PAGE BY ITSELF, AND A PEN'S FIGURE IS ALWAYS ON THE CARD (356)

in `packBlocks_`

```
/* ---------- A FIGURE IS NEVER A PAGE BY ITSELF, AND A PEN'S FIGURE IS ALWAYS ON THE CARD (356) ----------
     A FIGURE GOES WITH THE BLOCK AFTER IT -- the words it stands in front of, the ask it is the picture
     for -- or, last in the row, with the block before it. Weighed alone it is heavier than the card's
     whole budget (`figWeight_`: 182px median at the pane's width), and a cut on either side of it put it
     on a page holding nothing else: a figure page with tags, which is exactly what the owner's 18 Oct word
     ended (*"there's also like a graph widget below"*). Glued, a page that holds a picture holds words it
     belongs to, and a card too tall for the phone gives way and scrolls (`cardFigFit_`, `paneReach_`).
     AND A BLOCK MARKED `pin` (the figure a part is answered on, under its pen) AND EVERY BLOCK AFTER IT
     STAY ON THE LAST PAGE, the card, whatever they weigh: the drawing is the answer, and the answer is on the
     card -- a pen a page before its ask would be 327's two places again. */
```

### NO PAGE FOR ONE SENTENCE.

in `packBlocks_`

```
/* NO PAGE FOR ONE SENTENCE. The owner, 6 Oct, on Corbettmaths Money Q3: *"it seems like its split
     into 2 of 2 parts. why? there doesnt seem to be a diagram there"*. Four short lines weighed 363
     against the card's 300, so "Lauren puts nine 20p pieces into her piggy bank." was given a page
     of its own -- a swipe to read one sentence, and a "1 of 2" that looks like a missing part. The
     budgets are guesses on the safe side; what is left over when the cut is this small costs a few
     lines of scroll on the card at worst, and a page that is nearly empty is never better than that. */
```

### ---------- WHAT A FIGURE WEIGHS: ITS HEIGHT AT THE NARROWEST PANE'S WIDTH

top level, before `FIG_PANE_W`

```
/* ---------- WHAT A FIGURE WEIGHS: ITS HEIGHT AT THE NARROWEST PANE'S WIDTH --------------------------------
   The budgets above are characters set for a 320 x 568 pane (`CHUNK_PAGE`), and a line of 288px holds
   about 40 of them at 22px a line -- so 1.8 a pixel. A picture is drawn `min(100%, 20rem)` wide, 288px
   there, and as tall as its viewBox says at that width: median 182px, p90 274px over the library (356). A
   drawing with no readable viewBox weighs as a square; a photograph weighs what `chunkWeight_` always gave
   one. Capped at a pane's height: past it the card scrolls whatever the weight says. */
```

### ---------- WHERE THE PAPER PRINTS THE FIGURE: `<!--fig-->`

top level, before `FIG_MARK`

```
/* ---------- WHERE THE PAPER PRINTS THE FIGURE: `<!--fig-->` ----------------------------------------
   ASKED FOR AS *"Let's say there's a question which begins with text, then diagram, then text then
   diagram then text. This should break into 5 widgets. This is to ensure it's same order but diagram
   has its own widget."* -- after a lesson on June 2024 Paper 1 Foundation, where a figure printed
   between two sentences arrived a page AFTER both of them, and the second sentence ("Work out the size
   of angle x") was read before the angle it is about.

   A ROW HAS ONE FIGURE AND ITS WORDS, AND NOTHING SAID WHERE IN THE WORDS IT GOES. So the data says:
   the literal HTML comment `<!--fig-->` between two top-level blocks of a row's `html` is where that
   row's `diagram` / `images` stands. A comment because it is the one mark HTML already promises never
   to draw -- a row read by anything that does not know the convention (the search haystack's
   `plainText_`, `typeset_`, a browser) shows nothing for it. `check-library.js` holds the convention
   at the file: one per row, top level, only on a row with a figure.

   AND IT IS TAKEN OUT HERE, BEFORE ANYTHING IS COUNTED OR DRAWN. `figBlocks_` returns the row's blocks
   with the marker gone and the number of blocks in front of it; the cutter weighs and the cards draw
   only those blocks, so the marker is never a character of a page. A marker INSIDE a block (data typed
   wrongly) stands after that block rather than splitting it -- a paragraph cut in half to make room for
   a picture is two broken paragraphs. */
```

### ---------- A STEM'S PAGES, WITH ITS FIGURE AMONG ITS WORDS

top level, before `stemPlan_`

```
/* ---------- A STEM'S PAGES, WITH ITS FIGURE AMONG ITS WORDS ---------------------------------------------
   `chunks` is the stem's blocks cut into pages, its figure a block among them (`k: 'fig'`) that goes with
   the words beside it (`packBlocks_`) -- never a page of its own (356). */
```

### THE FIGURE STANDS AT ITS MARKER, ELSE AFTER THE WORDS -- digest.gs's rule for a stem, so the Sunday email and the page agree -- AND NOT AT ALL WHEN A PART

in `stemPlan_`

```
/* THE FIGURE STANDS AT ITS MARKER, ELSE AFTER THE WORDS -- digest.gs's rule for a stem, so the Sunday email
     and the page agree -- AND NOT AT ALL WHEN A PART DRAWS ON IT: that part's card draws it, under its pen,
     and one picture twice a swipe apart is what 337 ended (`stemPenned_`). */
```

### ---------- A STEM WHOSE FIGURE A PART DRAWS ON

top level, before `STEM_PEN`

```
/* ---------- A STEM WHOSE FIGURE A PART DRAWS ON ---------------------------------------------------------
   BY THE PICTURE'S MARKUP, as `usesChain_` matches a picture: a part's pen is on a stem when `padSource_`
   names that stem's diagram. Built once per list of items (`stuffItemsAll_`'s own memo), as `USES_MEMO` is. */
```

### ---------- A PART'S PAGES, WITH ITS FIGURE AMONG ITS WORDS

top level, before `partPlan_`

```
/* ---------- A PART'S PAGES, WITH ITS FIGURE AMONG ITS WORDS ----------------------------------------------
   `chunks` is the part's words cut into pages, the LAST of them the question card, and the figure is a
   block among them where the paper prints it -- ON THE CARD OR A PAGE IN FRONT, never a page of its own
   (the owner, 18 Oct: *"there's also like a graph widget below"*; 356). Where, by digest.gs's rule, so the
   Sunday email and the page agree with no backend edit:

     A MARKER        the lead and the words before it, the FIGURE, the words after it.
     NO MARKER,      the lead, the FIGURE, the words: the lead is the part's own sentence of setting ("Here
     A LEAD          is a grid."), and the ask is what follows the picture.
     NO MARKER,      the FIGURE in front of the words, as the paper prints a part's figure far more often
     NO LEAD         than after it.

   WHICH FIGURE is `cardFigBlock_`'s: the part's own, or the stem's it draws on, or the line saying the paper
   prints one nobody has drawn yet. And IN FRONT OF EVERYTHING, the picture an earlier part drew on where
   this part reads it and has no copy of its own (`usesBlock_`; it was the `use` page). The cut still runs
   from the end (`packBlocks_`): the card keeps the ask and what fits beside it, a figure goes with the words
   it stands next to, and a figure under a pen is held on the card with everything after it. */
```

### ---------- THE FIGURE A PART'S CARD DRAWS, AS A BLOCK TO PLACE

top level, before `cardFigBlock_`

```
/* ---------- THE FIGURE A PART'S CARD DRAWS, AS A BLOCK TO PLACE ------------------------------------------
     its own diagram or photographs     `fig`, held on the card (`pin`) when its pen is on it
     the stem's diagram its pen is on   `fig`, held on the card: the stem's page leaves it out (`stemPlan_`)
     a figure its words name and        `nofig`, one line where the figure would stand -- once for a run of
       nobody has drawn yet               parts that all name it, the first (`figGap_`)
   A made-up surface is not a figure: it is where the box would be (`ansArea_`). */
```

### THE FIRST OF A RUN OF PARTS THAT NAME A FIGURE NOBODY HAS DRAWN, in the paper's order -- the run is one gap, and saying it under every part of it was a line

top level, before `figGap_`

```
/* THE FIRST OF A RUN OF PARTS THAT NAME A FIGURE NOBODY HAS DRAWN, in the paper's order -- the run is one gap,
   and saying it under every part of it was a line repeated down a page of parts (the 73 runs of 410 parts,
   check-library's ledger). */
```

### A CHUNK IN THE WRAPPERS THE CARD ALWAYS USED -- the lead in `.qsheet-lead`, the part's words in `.qsheet-part > .qsheet-pb` -- so the typesetting rules and

top level, before `chunkHtml_`

```
/* A CHUNK IN THE WRAPPERS THE CARD ALWAYS USED -- the lead in `.qsheet-lead`, the part's words in
   `.qsheet-part > .qsheet-pb` -- so the typesetting rules and every check reading them still apply. A
   chunk with none of the part's words in it still draws the empty `.qsheet-pb`, as a row with no
   `html` always did. */
```

### `circ` IS A PASSAGE THAT IS ITS OWN ANSWER SURFACE ("Circle the three adjectives in the passage below") -- `circOf_` -- and then every word of the part is a

top level, before `chunkHtml_`

```
/* `circ` IS A PASSAGE THAT IS ITS OWN ANSWER SURFACE ("Circle the three adjectives in the passage
   below") -- `circOf_` -- and then every word of the part is a tap target, block by block so each
   word keeps its name (`circWords_`), and the page says how it works once, under the words. */
```

### ---------- A FIGURE BLOCK, DRAWN

top level, before `figHtml_`

```
/* ---------- A FIGURE BLOCK, DRAWN ---------------------------------------------------------------------
   `fig` with a pen on it: the pad (`padWrap_`) -- the picture under the pen, its bar, its note -- and that is
   the answer. `fig` with none: the picture, with the marks an earlier part made on it (`usesFig_`). `use`:
   that earlier part's picture with its marks, read only. `nofig`: the one line of a known gap. No caption on
   any of them: the paper is named by the tags, and the line saying who drew a picture went on 18 Oct (355). */
```

### `figWhat_` WAS HERE:

top level, before `figLabel_`

```
/* `figWhat_` WAS HERE: what the next page is called, "Figure" or a surface's name ("Squared grid on the
   next page"), so a pointer and the page it named could not disagree. A surface is never a page now --
   it is the answer's other face, on the card (327) -- so the page a pointer names is always a figure,
   and the pointer says "Figure". */
```

### ---------- A FIGURE'S PAGE IS NAMED FOR THE FIGURE, NOT FOR A QUESTION NUMBER

top level, before `figLabel_`

```
/* ---------- A FIGURE'S PAGE IS NAMED FOR THE FIGURE, NOT FOR A QUESTION NUMBER ---------------------
   ASKED FOR AS *"diagram widgets shouldn't have a question number on them"*. A figure in a paper is
   captioned by its own name -- "Figure 3" -- and two parts can both be about it; `Q7 · figure` said
   it was Q7's and made a reader looking for Figure 3 read every header twice. So the name the paper
   prints, read out of the words that introduce it ("Figure 3 shows the inheritance...") and plain
   "Figure" where they name none: an Edexcel maths paper numbers no figures at all, and inventing
   "Figure 1" for it would be a caption the paper does not have. No marks either -- they are the
   question's, and the figure is not the question.

   `not` is the names already taken by the stems above a part, so a part reading "use Figure 3 to
   complete Figure 4" names its own drawing Figure 4 rather than the stem's Figure 3.

   IT IS NOT A TAG ANY MORE (355), AND THERE IS NO FIGURE PAGE (356): the name heads the Figure sheet over the
   card (`figsBefore_`). */
```

### ---------- `qHead_` AND `figHead_` WERE HERE: ONE GOLD HEADER LINE FOR EVERY PAGE OF A QUESTION

top level, before `figImgs_`

```
/* ---------- `qHead_` AND `figHead_` WERE HERE: ONE GOLD HEADER LINE FOR EVERY PAGE OF A QUESTION ------
   *"sleekerise the whole widget system"* gave every page `Q3`, `Q3 · figure`, `Q3 · answer` in gold
   with the marks hard right, so the pages of one question read as one question. Everything that line
   said is a tag now -- the What kind answer, the number, the marks -- in the one row (`tagRow_`),
   because *"the marks should also be a tag. also the question numbers should also be a tag."* A row
   with no marks still says nothing rather than "0 marks" (the Marks facet answers only above 0). The
   date it held is the tile row's (`questionTiles_`). */
```

### THE FIGURE IS IN ITS QUESTION'S CARD, WHERE THE PAPER PRINTS IT.

top level, before `figImgs_`

```
/* ==================================================================================================
   THE FIGURE IS IN ITS QUESTION'S CARD, WHERE THE PAPER PRINTS IT.

   IT WAS A CARD OF ITS OWN from 204 to 18 Oct -- "across the board of all resources the diagrams should be
   its own widgets", then *"text, then diagram, then text ... same order but diagram has its own widget"*
   (268, 270) -- with the part's tags on it and "Figure on the next page" on the page before. The owner,
   18 Oct, over June 2024 1F Q7 -- its words, a box, and the grid it asks you to draw on a page later:
   *"there's also like a graph widget below ... Can you see how sloppy it is?"* So every diagram and
   photograph a part has is drawn in the part's card, among its words where the paper prints them
   (`partPlan_` places it, `figHtml_` draws it), and a stem's in the stem's (`stemPlan_`). A card too tall
   for the phone gives way (`cardFigFit_`) and scrolls, or continues on a page in front, as words always
   did -- the figure going with the words beside it, never alone. See docs/history/356.

   A PICTURE A PART DRAWS ON IS THAT PART'S ANSWER, under its pen, on its card -- its own figure, or the
   stem's (which the stem's page then leaves out, so it is never shown twice). A made-up surface (squared
   paper, axes, a blank space; `from: 'surface'`) is not a figure the paper prints: it stands where the box
   would (`ansArea_`). */
```

### `questionFigCard_` WAS HERE, the part's figure as a page of its own where the paper prints it (204, 268, 270, 337).

top level, before `FIG_NAMED`

```
/* `questionFigCard_` WAS HERE, the part's figure as a page of its own where the paper prints it (204, 268,
   270, 337). On the owner's 18 Oct word -- *"there's also like a graph widget below"* -- a figure is in the
   card of the question that uses it, among its words (`partPlan_`, `figHtml_`; 356). */
```

### ---------- A FIGURE THE PAPER PRINTS AND THIS SITE HAS NOT DRAWN YET

top level, before `FIG_NAMED`

```
/* ---------- A FIGURE THE PAPER PRINTS AND THIS SITE HAS NOT DRAWN YET -------------------------------
   THE MULTI-PART AUDIT, FINDING 4: the question refers to a picture that is not there, and nothing on
   the screen says so -- 1H Q12(i)-(iii) "Write down the letter of the graph…" with none of the nine
   graphs; about 29 parts in the June 2024 Higher papers. Worse where the nearest figure a swipe back
   is a different question's. A part that reads as complete and cannot be answered is the one
   failure a student cannot see.

   SO THE GAP IS A PAGE, where the figure would stand: "The paper prints a figure here -- not drawn
   yet". Drawing them is data (`diagram` on the row); this is what keeps the gap visible until then,
   and `check-library.js` counts them with the same two functions, so the backlog cannot quietly
   grow. A PART QUALIFIES when its own words name a figure (`FIG_NAMED`: "Figure 3", "the graph", "the
   diagram", "the grid", "the table below"…) and NOTHING in its question is one -- not its own, not
   an opening's, not another part's -- and it is not answered on a surface (a grid or a passage to
   ring is somewhere to answer, on the card). Words that carry their own `<svg>`, `<img>` or
   `<table>` already hold what they name. */
```

### NOT A PART THAT USES AN EARLIER PART'S DRAWING:

in `figMissing_`

```
/* NOT A PART THAT USES AN EARLIER PART'S DRAWING: the figure it names is the child's own, and it has
     its page already (`use`, `usesOf_`). Nov 2018 3H Q3c read "Nothing drawn on Q3b yet -- this part
     uses what you draw there" and then "The paper prints a figure here -- not drawn yet": two pages in
     a row, one of them wrong, because the graph is drawn by the child and never by this site. */
```

### THE ANSWER IS ITS OWN CARD, THE PAGE AFTER ITS QUESTION (AND AFTER ITS FIGURE).

top level, before `questionHasAns_`

```
/* ==================================================================================================
   THE ANSWER IS ITS OWN CARD, THE PAGE AFTER ITS QUESTION (AND AFTER ITS FIGURE).

   ASKED FOR AS *"what I want was answers to be short and to be their own widget"*, after 259 made
   them short and left this half undone with a note saying why. The owner read the note and asked
   again, so its reasoning -- "a page for a one-line result is a swipe to read a word" -- is answered
   by what the page is FOR rather than by its length: it keeps the answer apart from the question,
   so that writing your own is the only thing on the page you write it on.

   THE RESULT LARGE, AND NOTHING UNDER IT -- `answerBlock_`. The "Why" fold went on the owner's word:
   *"Also remove all 'why's. I just want it to have answer."*

   ONE PAGE FOR EVERYBODY, SHUT UNTIL IT IS ASKED FOR. *"you should have to click to reveal the answer.
   Should behave the same whether it's a tutor or child. No difference between the two."* The page
   says "Answer hidden" and holds the one control that shows it, and the answer is not in the markup at
   all until then: the old `is-shut` hid with `display: none` an answer anybody could read in the
   document. `ansOpen_` decides, and it asks one thing -- has this person, on this visit, asked.

   AND IT GOES BACK. *"answers should just stay hidden unless user unhides them. and can hide them
   again. simple is best."* Shown, the same tile is `Hide the answer`, and hidden is exactly hidden
   again: the answer leaves the markup, not just the screen.

   AND NOT IN THE QUESTIONS LIST AT ALL. *"answers shouldnt even be showing up when all ive done is
   clicked questions. the answers still show up."* (8 Oct, on an iPad in the sun.) Shut was not enough:
   a card tagged "Answer" under every question reads as the answers showing to somebody squinting at
   it. So this page is drawn where no kind is chosen and where Answers is, and never with Questions
   (`stuffPages_`) -- for a tutor exactly as for a pupil.

   `data-of` NAMES THE ROW, as the figure card does, and `data-k` is the answer box's key, which is
   what `ansSet_` finds these by to redraw them, open or shut, where they already stand. */
```

### ---------- WHO SEES IT OPEN: WHOEVER ASKED, AND NOBODY ELSE

top level, before `ANS_SHOWN`

```
/* ---------- WHO SEES IT OPEN: WHOEVER ASKED, AND NOBODY ELSE ---------------------------------------
   THIS USED TO HAVE THREE MORE WAYS IN AND ALL THREE ARE GONE, on the owner's word -- *"you should have
   to click to reveal the answer. Should behave the same whether it's a tutor or child. No difference
   between the two."*

     STAFF SAW IT OPEN (`isTutorRole()`), on the argument that a tutor reads the mark scheme FROM this
       page. In the lesson that prompted this, the tutor and the child were reading the SAME phone, and
       an answer that was already open for one of them was open for both -- the reveal was the tutor's
       to make, and the app had made it for them. There is one page now, the same for a tutor, an admin,
       a student, a parent and somebody signed out.
     A TYPED ANSWER MARKED RIGHT opened it (`qp-check`), and a TAPPED ONE SETTLED RIGHT did, from what
       was stored. The question card already says "Correct" -- that is the verdict -- and an answer
       page that opens itself is a reveal nobody pressed.

   WHAT IS LEFT is the tap -- Show, and Hide to take it back -- held in `ANS_SHOWN` by the answer
   box's own key -- which carries who is
   signed in, so the phone passed to the next student starts shut again. A SET RATHER THAN A CLASS ON
   AN ELEMENT, because the answer is drawn on a different page from the control that shows it, and
   pages are built and thrown away as you swipe (`fillStuffPages` keeps eleven): a fact left on an
   element is gone the moment its page is rebuilt, which is the `REEL_HELD` fault. Kept for the visit
   and not in `localStorage`: having asked for an answer last week is not having asked for it today. */
```

### ---------- ONE TILE, IN ONE PLACE, AND IT SAYS WHICH WAY IT GOES

in `questionAnsCard_`

```
/* ---------- ONE TILE, IN ONE PLACE, AND IT SAYS WHICH WAY IT GOES ---------------------------------
     ASKED FOR AS *"answers should just stay hidden unless user unhides them. and can hide them again.
     simple is best."* So the page has one control and two faces: `Show the answer` (the eye) while it is
     hidden, `Hide the answer` (the eye struck through) once it is shown. Nothing else on the page
     offers either, and nothing anywhere else opens it -- the question card has no way to it but a
     swipe (its `To the answer` tile went on 8 Oct).

     ABOVE THE ANSWER, NOT UNDER IT, because "the same place" is a promise about where the thumb goes
     back to. Under it, the tile would sit wherever the answer happened to end -- a word, or a table
     four rows deep -- and the Hide you reach for would not be where the Show you pressed was. Here the
     header, the tags and the tile row are the same height either way, so pressing it moves nothing
     above the answer, and the answer arrives below where the "Answer hidden" line stood.

     A TILE, as the owner asked of the reveal before this (*"show the answer button should be a
     tile"*): one renderer for every action on a question's pages, `check-doors` pairing each `act`
     with its handler. */
```

### "ANSWER HIDDEN", AND NOT "HAVE A GO FIRST".

in `questionAnsCard_`

```
/* "ANSWER HIDDEN", AND NOT "HAVE A GO FIRST". That was advice to a student, on a page a tutor
         reads too -- and the owner's word is that the two read the same thing. The page says what it
         is; whether to try first is the tutor's to say out loud, not the app's to say to one of them.
         Beside the tile rather than over it, so the row is the row's height whichever face it wears. */
```

### ---------- SHOWING IT AND HIDING IT: REMEMBERED, AND DRAWN WHEREVER IT ALREADY STANDS

top level, before `ansSet_`

```
/* ---------- SHOWING IT AND HIDING IT: REMEMBERED, AND DRAWN WHEREVER IT ALREADY STANDS ----------------
   The page is usually built already -- `fillStuffPages` fills two either side -- so it is redrawn in
   place, by its key, on every column it is on. Only the answer card changes; the question card is not
   touched, which is what keeps "nothing moved" true of the page you are on.

   EVERY COPY, SHOWN OR HIDDEN, rather than only the ones in the other state: Saved and Find can both
   hold the page, and a Hide that redrew only the open copies is the same rule written twice. Redrawing
   one already in the state asked for draws the same markup again, which costs nothing anybody sees.

   AND THE FOCUS COMES WITH IT. Replacing the card throws away the tile that was just pressed, and a
   keyboard's focus on a removed element falls back to `<body>` -- so Enter on Show left the next Tab
   starting from the top of the document, every time, on a toggle whose whole promise is "press it
   again in the same place". Only the copy that HELD the focus hands it on: a redraw must not pull
   focus off whatever else somebody is in. `preventScroll`, because the pages are parked side by side
   with transforms (CLAUDE.md) and a focus that scrolled would slide the strip. In a try, because an
   old browser that refuses the options object still leaves the answer drawn. */
```

### ---------- `To the answer` AND `ansWhere_` WERE HERE

top level, before `questionTiles_`

```
/* ---------- `To the answer` AND `ansWhere_` WERE HERE -----------------------------------------------
   THE QUESTION CARD'S ↓ TILE, which turned the strip forward to the answer page without revealing it,
   with a note worked out from `pageParts_` saying how far ("next page", "after the squared grid" --
   finding 9 of the multi-part audit, which caught it saying "next page" over a figure). REMOVED ON THE
   OWNER'S WORD, 8 Oct: *"there doesnt need to be a scroll down tile on questions."* A tile that does what
   a swipe does is a second way to turn a page on the one surface where every page turns the same way,
   and once `Questions` stopped drawing answer pages (`stuffPages_`) it would have counted pages that are
   not in the strip and landed on the next question. The answer is the page after its question -- after
   a figure the paper prints after the words, where there is one -- reached by a swipe, and only where no
   kind is chosen. */
```

### ---------- AND HOW YOUR LAST ANSWER WENT, BESIDE THE STAR

top level, before `questionTiles_`

```
/* ---------- AND HOW YOUR LAST ANSWER WENT, BESIDE THE STAR --------------------------------------------
   IT WAS THE DAY YOU LAST DID IT, `Done 4 Oct`, until the owner, 9 Oct: *"The kids don't need to see
   the day they did something. Just whether it's right or not."* So the slot says how the LATEST
   submission went -- "Correct", "Not yet", "Sent", the AI's "3/4" -- and nothing for a question never
   sent (`subSlot_`). It is NOT a tag, and that is the argument for where it is. A tag is a fact about
   the question -- the same words for a tutor, a student and somebody signed out -- and a verdict is a
   fact about YOU and the question, like the star you put on it.

   AND THIS ROW DOES NOT GROW. A press writes into a slot that is already there (`subPaint_`), which is
   what 261 made true -- marking moves nothing. As the last tag of a wrapping row the first verdict could
   push the row onto a new line and the question down under the finger that pressed Send; here it
   lands beside 44px tiles in a row 44px tall. DRAWN ONLY FOR SOMEBODY SIGNED IN, the same visitor the
   star is drawn for. Signed out there is no slot: a verdict on the device everybody shares is nobody's. */
```

### AND THE SOUND SWITCH, JUST BEFORE THE SLOT, on a card that can be marked -- signed in or out, since a signed-out child is marked and hears it too

in `questionTiles_`

```
/* AND THE SOUND SWITCH, JUST BEFORE THE SLOT, on a card that can be marked -- signed in or out, since a
     signed-out child is marked and hears it too (`markSoundTile_`, js/submit.js, note 340). Before the
     slot so the first verdict, landing in it, pushes no tile along under the finger. */
```

### THE FIGURE, OVER THE CARD, ONE TAP AWAY.

top level, before `figsBefore_`

```
/* ==================================================================================================
   THE FIGURE, OVER THE CARD, ONE TAP AWAY.

   THE MULTI-PART AUDIT, FINDING 2: the question's diagram comes once, in front of part (a), and every
   later part is further from it -- 1F Q23b is three swipes from its Venn, past (a) and (a)'s answer,
   and twelve questions have a part nine or more pages after its picture. Swiping back loses the box
   you were writing in. Copying the figure onto every part was tried before and refused (it is the
   duplication `pageParts_`'s stems exist to end).

   SO THE CARD OFFERS IT: a `Figure` tile, a tile like every action on a question's pages (CLAUDE.md),
   that opens the figure in the app's own sheet over the card -- the box, the keypad and whatever is
   typed stay exactly where they are underneath, and closing the sheet is closing the sheet. ON ANY
   PART WHOSE QUESTION HAS A FIGURE IN FRONT OF IT: the opening's (`stems`), an earlier part's own
   (2H Q14b's graph lives on Q14a) -- not its own, which is on the card (356). All of them, in
   the paper's order, because which one a part means is in its words and not in the data -- and a
   question almost always has one. A drawing surface is not a figure (it is somewhere to answer, the
   card's answer -- `ansArea_`).

   A PICTURE AN EARLIER PART DREW ON CARRIES THOSE MARKS, read only (`usesSeen_`), as the paper in front
   of the child would. Found in review: 2F Q24c "Use your graph..." -- the page before it showed the
   child's graph (`use`), and its Figure tile opened (b)'s grid EMPTY, the one place in the app that
   said the graph was not there. Whoever is signed in, as everywhere (`usesMine_`); every earlier part
   whose pen is on that very picture (same markup), so (ii) sees (i)'s cross and (d) the whole chain.
   Not this part's own marks: they are where its pen is, on its card.

   The earlier parts are the funnel's own items (`questionParts_`), so Saved, a search and a paper all
   see the same figures. */
```

### ---------- AND THE PICTURE A `uses` PART READS, ONLY WITH SOMETHING ON IT

in `figsBefore_`

```
/* ---------- AND THE PICTURE A `uses` PART READS, ONLY WITH SOMETHING ON IT -----------------------
     2F Q24c "use your graph": the figure it reads is the child's drawing. Drawn, the sheet shows it
     with their marks ("Your drawing", above); not drawn yet, the paper's empty grid is a figure of
     nothing -- the page in front already says "Nothing drawn on Q24b yet" -- so no Figure for it.
     Followed down the chain (FSL2 Q3c uses b, b uses a, one scatter diagram), never round a loop. */
```

### ---------- WHAT A PRINTED COPY COSTS, WHICH HAS A CALLER AGAIN

top level, before `printOffered_`

```
/* ---------- WHAT A PRINTED COPY COSTS, WHICH HAS A CALLER AGAIN --------------------------------------
   `printPrice` WAS DELETED AS AN ORPHAN — `check-dead.js` named it once the paper card and its
   `Paper` tile had gone, and the note that stood here said a print would cost nothing "until
   something lists whole papers again". The bundle below is that something: asked for as *"what if
   someone wants a bundle of 2017 past papers for maths edexcell to add to cart and have me send it
   to them?"*

   PAGES x RATE, FLOORED AT A MINIMUM, and NULL rather than £0.00 when nobody has counted the pages.
   Zero pages means UNCOUNTED — 113 of the 266 papers with questions carry a page count and the rest
   do not — and a free price would be the site answering a question it has not asked anybody. That
   is the `cost: 0` fault this repository records four times, and the basket draws such a line as
   "tbc" rather than as "free".

   NO RATE MEANS PRINTING IS OFF. The config row says so in its own words — *"Set to 0 and no paper
   copies are offered at all"* — so `printOffered_` is what decides whether a bundle is offered at
   all, and this only ever prices a copy that could exist. */
```

### ---------- AND WHAT LAMINATING ONE COSTS

top level, before `laminatePrice`

```
/* ---------- AND WHAT LAMINATING ONE COSTS ---------------------------------------------------------
   THE SAME SHAPE AS `printPrice` AND FOR THE SAME REASONS, which is the point of writing it here
   rather than three lines of arithmetic wherever the basket happens to need it.

   NO RATE IN THE SHEET MEANS LAMINATING IS OFF, NOT FREE. `printPrice` already makes that argument
   and it is sharper here: a laminating pouch and the machine's time are a real cost, so a site that
   offered it at £0.00 because nobody had filled in a cell would be selling something at a loss, on
   every order, silently. `null` is the answer to "we do not do this", and the basket draws nothing
   rather than drawing a free upgrade.

   PER PAGE, because that is what it is — every sheet goes through the machine separately — with a
   minimum for the same reason printing has one: the first sheet costs more than the second in
   everything except paper. */
```

### WHAT A BASKET LINE ACTUALLY COSTS, in one place.

top level, before `cartPrint_`

```
/* WHAT A BASKET LINE ACTUALLY COSTS, in one place. `cart-add` writes `money` for a paper and the
   laminate upgrade is a flag on the line rather than a second number — so the price is DERIVED
   every time it is asked for, and a line laminated last week is repriced if the sheet's rate
   changes before anybody pays. Storing the sum instead would have frozen a price nobody agreed to,
   and would need the subtraction to be got right in the one place that takes the upgrade off. */
```

### ---------- AND A PRINTED LINE IS PRICED THE SAME WAY, WITH ONE EXCEPTION

top level, before `cartPrint_`

```
/* ---------- AND A PRINTED LINE IS PRICED THE SAME WAY, WITH ONE EXCEPTION ------------------------
   A LINE FROM A BUNDLE STORES NO `money`, so its print is derived from its pages every time it is
   asked for — the argument above about the laminate, pointed at the paper under it.

   A LINE THAT ALREADY CARRIES `money` KEEPS IT. Those are print lines saved in somebody's
   `localStorage` before the paper card was deleted, priced at the rate of the day they were
   added; re-pricing them silently would be a basket whose total moves while nobody touched it. */
```

### WHETHER LAMINATING IS OFFERED AT ALL, which is a different question from what one costs.

top level, before `laminateOffered_`

```
/* WHETHER LAMINATING IS OFFERED AT ALL, which is a different question from what one costs. A paper
   with no page count cannot be priced for either, and the toggle on its line still means something
   — "laminate it" is a decision about the copy, and the price follows the count — so the basket
   asks this rather than whether `laminatePrice` answered. No rate is still OFF, for the reason
   written over `laminatePrice`: the config row's own sentence is *"0 = laminating is not offered"*. */
```

### ---------- `canPrint` CAME BACK WITH THE BUNDLE, AND ITS RULE CAME BACK UNCHANGED

top level, before `canPrint_`

```
/* ---------- `canPrint` CAME BACK WITH THE BUNDLE, AND ITS RULE CAME BACK UNCHANGED --------------
   An explicit FALSE in the document row's `printable` cell beats any page count: somebody wrote it
   on purpose, and a print order for a paper the library says cannot be printed is an order the
   owner then has to refuse by hand. Blank is not false — 519 of the 691 document rows have no cell
   at all, and reading an empty cell as a refusal would take most of the library out of every
   bundle for a fact nobody stated.

   MEASURED: 42 rows say FALSE, and 36 of those have questions under them — every AQA Religious
   Studies paper (which carry no `source_url` either, so there is genuinely no copy here to print)
   and the June 2024 AQA sciences. The bundle card names them rather than dropping them silently, so
   the owner can see the cell is what is stopping them and change it. */
```

### ---------- THE THREE PASSES WERE HERE, AND THEY ARE NOT COMING BACK IN THIS SHAPE

top level, before `printRatePence`

```
/* ---------- THE THREE PASSES WERE HERE, AND THEY ARE NOT COMING BACK IN THIS SHAPE ---------------
   `myTicks`, `tickRow`, `on('ticks')` AND `on('tick')` drew three checkboxes under every trackable
   document and posted `toggleTopicTick`. A tick was stored as a NAME in a list, three lists per
   document — which is what made "who has done this" answerable as well as "have I" — and the lists
   lived in `ticks_1..3` on the document's row.

   THEY HELD THE HANDLES OF REAL CHILDREN. 529 cells of them. When the questions tab moved into this
   repository those three columns were stripped at source, because this repository is public and a
   child's handle beside a date is not library data. The tab itself is `data/questions.json` now, the
   backend handler is gone with it, and there is nothing left for a box to write to.

   THE RIGHT HOME FOR THEM IS `Ledger`, one row per person per document, which is what a tick always
   was: a fact about a PERSON and a document, filed under neither. Written that way it would not
   have moved with the library at all. Three boxes that accept a tap and lose it are worse than no
   boxes, so there are none.
--------------------------------------------------------------------------------------------- */
```

### One list, so the four controls act on everything rather than on one half — a filter that silently ignores the shop is a filter nobody trusts twice.

top level, before `ITEM_MEMO`

```
/* One list, so the four controls act on everything rather than on one half — a filter that
   silently ignores the shop is a filter nobody trusts twice.

   The RAW fields are kept on each item rather than a pre-computed group label. Grouping is a
   question asked at draw time; baking the answer in meant changing the dropdown could not change
   the shop items, because their label had already been decided. */
```

### ---------- THE SAME LIST, NOT THE SAME LIST REBUILT

top level, before `ITEM_MEMO`

```
/* ---------- THE SAME LIST, NOT THE SAME LIST REBUILT --------------------------------------------
   EVERY MAPPER BELOW RUNS ON EVERY CALL, and `questionItems` alone is 4,000 rows of HTML stripped
   for the search haystack: MEASURED at 31 ms, inside 33 for the whole build. `stuffFiltered` asks
   for this whenever its own memo misses — which is every filter change and every keystroke — and
   the answer is identical every time, because NOTHING here reads a filter. It reads `DATA`, whether
   you are an admin, and which person you are.

   SO IT IS KEYED ON EXACTLY THOSE THREE. `DATA` by identity, the way `stuffFiltered` already tests
   it one level up — a new payload is a new object and a reload rebuilds. The other two because two
   mappers are gated on them: widgets marked `admin`, and the live sessions `liveWidgets_` builds
   from the jobs you are in.

   AND HOLDING THE ITEMS IS WHAT MAKES THE SORT KEYS FREE. `sortKey_` caches on the item; rebuilding
   the items every call threw that cache away at the same rate it was filled. */
```

### ---------- AND THE SAME MEMO AGAIN FOR THE UNFILTERED LIST

top level, before `ALL_MEMO`

```
/* ---------- AND THE SAME MEMO AGAIN FOR THE UNFILTERED LIST ---------------------------------------
   TWO LISTS, TWO MEMOS, ONE BUILD. `stuffItemsAll_` is what `stuffItemsBuild_` filters and what the
   saved things are looked up in, and both are asked for on every repaint — so caching only the
   filtered one would rebuild four thousand items every time anything wanted the other.

   A SEPARATE ARRAY EACH, deliberately, not one array read two ways. `facetTally_` holds its counts
   in a `WeakMap` keyed on the items array itself and `FIND_MEMO` tests `DATA` by identity; handing
   the same array to both lists would make a tally of the funnel answer for the saved list too.
   Same key on both, so they are filled and dropped together. */
```

### WHO IS SIGNED IN, AND NOT WHETHER THEY ARE AN ADMIN.

top level, before `itemMemoKey_`

```
/* WHO IS SIGNED IN, AND NOT WHETHER THEY ARE AN ADMIN. `isAdmin()` was half of this key, and nothing
   the items are built from asks it: what an admin is sent that others are not (an unlisted tutor; the
   films too, though Find no longer reads them) arrives in the payload, and a new payload is a new
   `DATA`, which both memos already test by identity. A key naming the role read as though Find drew
   a different library for one -- *"No distinction between tutor and student on the finder. All the
   same."* -- and it does not. The person stays: a starred thing and the `me` card are theirs.
   ---------- AND THE BIBLE PUTS ONE ROLE BACK, AND ONLY IT ---------------------------------------
   `bibleItems_` IS THE ONE BUILDER THAT ASKS `isAdmin()`, by the owner's request — see `bibleFor_`.
   A role normally changes with a new payload or a new person, both of which this key or `DATA`
   already notices; but `roles-save` writes `USER.role` and repaints BEFORE the payload comes back,
   and for that moment the list would still be the old role's. So the key says whether the Bible is
   on it — named for what it is, not as a role, because it is not a second library for admins. */
```

### ---------- EVERY ITEM THE APP HAS, INCLUDING THE ONES THE FUNNEL DOES NOT OFFER

top level, before `stuffItemsAll_`

```
/* ---------- EVERY ITEM THE APP HAS, INCLUDING THE ONES THE FUNNEL DOES NOT OFFER ------------------
   THE FUNNEL'S EDITORIAL DECISIONS ARE ABOUT WHAT TO OFFER, NOT ABOUT WHAT EXISTS. Booking is not a
   question this screen asks any more, and tools and games have not been for longer — but a thing
   somebody STARRED is theirs, and a list they kept should not empty itself because a question
   stopped being asked.

   FOUND BY AUDITING FAVOURITES, and it was a fault I had just made: `collItems_` filters
   `stuffItems()`, so the moment Booking left the funnel every starred tutor, venue and session
   vanished from Saved — silently, on a list whose whole job is to not lose things. `savedPages_`
   reads this instead. The star still works, the row is still in the sheet, and the card comes back.

   TOOLS AND GAMES ARE NOT IN EITHER LIST, and that is untouched: they were removed from the build
   itself rather than filtered out of it, so nothing here can bring them back. Worth knowing the
   two decisions are made in different places, because only one of them is reversible from here. */
```

### ---------- FORGET EVERY LIST BUILT FROM `DATA`, FOR A WRITE THAT CHANGED `DATA` IN PLACE

top level, before `stuffForget_`

```
/* ---------- FORGET EVERY LIST BUILT FROM `DATA`, FOR A WRITE THAT CHANGED `DATA` IN PLACE ----------------
   The three memos test `DATA` by identity, which a new payload changes and an edit in place does not.
   WRITTEN FOR THE FILMS SYNC (`filmsAdopt_` in games.js), which writes a reply's films over `DATA.films`
   in place — and Find drew the films, so without this it went on drawing the list from before the sync.
   FIND HAS NO FILMS NOW (10 Oct, see where `film` was in `KINDS`), so that call rebuilds lists that
   could not have changed: harmless, and left in games.js rather than edited from here. Sign-out
   (`signedOut_` in me.js) still needs it — it empties the stars and the per-person keys in place. */
```

### ---------- WHERE YOU WERE IN FIND, KEPT FOR A RELOAD

top level, before `findPlaceKeep_`

```
/* ---------- WHERE YOU WERE IN FIND, KEPT FOR A RELOAD --------------------------------------------------
   THE ESSAY WAS STILL THERE AND THE PAGE WAS NOT (docs/history/317). The chips, the search and the page
   in front lived in memory only, and the column itself came back after a reload only if it had been
   CHOSEN in the last six minutes — so a child who had been writing for twenty minutes, refreshed, and
   landed on the Feed (or on Find's first question) had to walk the funnel back to Q5 to find out
   whether anything had survived, and an empty-looking screen is what "lost all his progress" looks
   like. `familyTabAt` is now written as the page is LEFT as well (shell.js), and this keeps the place
   beside it: the chips, the search, and the item and part on the page in front — by key, not by page
   number, because a page number means a different question once the library changes.

   THE SEARCH BOX COMES BACK WITH IT, AND ONLY WITH IT: it is half of where you were, and a search
   restored on its own would be a list narrowed by words nobody can see being typed. The videos card's
   search (`VID.q`) is not kept — retyped in a second, and it may be a title (me.js clears it on sign-out).

   THE SAME CLOCK AS THE COLUMN: a reload within `AWAY_AGAIN` of leaving, on Find, for the same person
   (a draft is the signed-in person's, so an admin's shelf is never somebody else's place), and only if
   nothing has been asked of Find since the page opened. Tomorrow's visit opens where it always did. */
```

### EACH FINDER UNDER ITS OWN NAME — Find's `find:place` as it always was, the second finder's `res:place` — and only the one in front, which is the only one a

top level, before `FIND_PLACE_TRIED`

```
/* EACH FINDER UNDER ITS OWN NAME — Find's `find:place` as it always was, the second finder's
   `res:place` — and only the one in front, which is the only one a reload comes back to (`familyTab`).
   Wrapped, because a listener hands its event to the function and an event is not a finder. */
```

### ---------- A KEPT CHIP NOTHING WILL EVER ANSWER

top level, before `RETIRED_SHELVES`

```
/* ---------- A KEPT CHIP NOTHING WILL EVER ANSWER --------------------------------------------------------
   `finderForeign_` WAS HERE (329): a chip was dropped from a kept place when something outside the bound
   finder answered it and nothing inside did — a Find place from before the resources moved came back
   without `Shelf · Boxing`. Both finders hold everything now (347), so nothing is outside either, and
   that test could never fire. What is left of its job is a chip NOTHING answers any more, which would
   put the column back on "Nothing matches" under a chip nobody can see the point of — and a chip that
   nothing answers YET is not that: the library lands after the first payload, which is when this runs
   (`findPlaceBack_` from shell.js), so at that moment no paper's chip is answered by anything, and
   dropping it would lose the place it exists to keep (329's "early" half, kept). So it is decided by
   what the chip IS, never by what answers it at this moment:
     · A BIBLE CHIP (Book, Chapter, Verse and the doors above them, and `Shelf · Books`, which holds
       the Bible and nothing else) is dead for anybody the Bible is not for (`bibleFor_`). The kept
       place is the signed-in person's own, so an admin's place inside the Bible comes back inside the
       Bible, on either finder; the same place kept by somebody who is no longer an admin comes back
       without it.
     · A chip on a question the funnel has RETIRED (`RETIRED_FACETS`) is dead: the sheet cannot bring
       that question back, so nothing will answer it.
     · A chip on a field no facet asks is dead once the facets have arrived (`DATA.facets` has rows —
       before then a sheet-only question like `projectType` is merely not here yet). `filterHit` reads a
       facetless chip as matching everything, so it would have hung on as a chip that does nothing. */
```

### A SHELF THAT WENT. `@family. textbooks` held the books, and each chapter is a content card now with no shelf at all — so a kept place standing on it would come

in `placeChipDead_`

```
/* A SHELF THAT WENT. `@family. textbooks` held the books, and each chapter is a content card now
     with no shelf at all — so a kept place standing on it would come back to an empty list, on a chip
     that is a perfectly good question (`shelf` still sorts boxing from the Bible). By what the chip
     IS, like the two rules above: the shelf is gone for everybody, early or late. */
```

### ---------- ONE LIST FOR BOTH FINDERS, COUNTED ONCE

top level, before `FUNNEL_MEMO`

```
/* ---------- ONE LIST FOR BOTH FINDERS, COUNTED ONCE --------------------------------------------------
   BOTH FINDERS CARRY THE SAME LIST (347), and each memoised its own copy of it — the same 8,381 items in
   two arrays. That cost more than the build: every count the funnel makes (`facetTally_`, the sort in
   `stuffSorted_`) is held in a WeakMap KEYED ON THE ARRAY, so Find 2's first question tallied the whole
   library again, item by item, to arrive at the answers Find had just drawn — measured at 299 ms in
   jsdom on the first load, where every column is painted (`paintNeighbours`). So the list is built
   once (`FUNNEL_MEMO`) and each finder's memo holds that same array. The first question then costs Find
   2 nothing (measured 0 ms): with no chips and no words `stuffFind` hands back `stuffSorted_`'s copy of
   that one array, the same array in both finders, so its tallies are counted once. NOTHING SORTS OR
   SPLICES EITHER IN PLACE: every reader that orders the list orders a copy (`stuffSorted_`), and a
   narrowing is a `filter`.
   AND NOTHING IN `stuffItemsBuild_` MAY ASK WHICH FINDER IS BOUND: what it returns is both finders'
   list, built by whichever asked first, so a rule written there for one finder would reach both or
   neither, at random — the split's `FINDER.has`, put back there, was measured doing nothing at all.
   A finder that ever needs a list of its own needs its own memo here, not a test in the build. */
```

### ---------- BOOKING IS NOT IN THE FUNNEL, AND THIS IS THE TOOLS AND GAMES DECISION AGAIN

top level, before `FUNNEL_NOT_FOR`

```
/* ---------- BOOKING IS NOT IN THE FUNNEL, AND THIS IS THE TOOLS AND GAMES DECISION AGAIN -------
   REPORTED AS "remove booking from the finder", and the argument is the one already written a few
   hundred lines below about the widgets: a booking is not a thing you FIND, it is a thing you DO,
   and it has a column of its own where the form, the basket and your sessions all are. Answering
   `What for · Booking` on the Find screen put that same twelve-question form in front of somebody
   who had come to look for a past paper, and then offered Tutors, Venues, Subjects, Levels and
   Receipts underneath it — five answers that are one swipe away on a screen built for them.

   IT IS THE GROUP, NOT A LIST OF KINDS. `kindOf_(x).group` is what the `forLabel` facet reads, so
   a kind added to Booking tomorrow leaves the funnel with nothing added here — and a rule naming
   `tutor, venue, subject, level, receipt` is a rule that goes stale on the sixth. `kindMap_`
   overlays the `kinds` tab, so moving a kind out of Booking in the spreadsheet puts it back in the
   funnel: that is the escape hatch and it is deliberate.

   NOTHING WENT DARK, AND THAT IS THE WHOLE CARE IN THIS CHANGE. Each of the five had to have
   somewhere else to be BEFORE the answer was removed, because a thing that is only reachable
   through a door you have just bricked up is a deletion wearing a tidy-up's clothes:
     · TUTORS      — the account column, one page each, with the Message tile. See `accountPages_`.
     · RECEIPTS    — the Booking column. `bookBlocks` draws one page per session again; the note
                     there says they were taken out precisely BECAUSE they were results here, so
                     this change had to undo that half in the same commit.
     · VENUES      — the booking form's venue dropdown, which is the only thing anybody did with
                     one. The slip card is not drawn anywhere now, and that is the real cost.
                     (They came back as `Booking, Places` on "add venues to finder" and left again
                     on "get rid of booking places" — see the note on `venue` in `KINDS`.)
     · SUBJECTS
       AND LEVELS  — the same: dropdowns on the form. `subjectRows` and `levelRows` still build,
                     because the booking form and the pricing read them.

   WHAT IT COSTS, WRITTEN WHERE THE CODE WAS so it is not rediscovered as a bug: typing `richmond`
   into Find returns nothing, deliberately, and so does a tutor's name. The fix is this filter, not
   another mapper. */
```

### ---------- AND THE SHOP LEFT WITH IT, ONCE IT HAD A COLUMN TO GO TO

top level, before `FUNNEL_NOT_FOR`

```
/* ---------- AND THE SHOP LEFT WITH IT, ONCE IT HAD A COLUMN TO GO TO ----------------------------
   ASKED FOR AS *"Get rid of shop tag. I will make a new coloumn for shop stuff. So finder now will
   become just learning stuff."* The same move as Booking above and the same care: the forty shop
   Things had ONE way onto a screen, this door, so it came out in the commit that built the Shop
   column (`shopCards_` in collections.js) and not before. The wearables, which are `Shop` too, have
   the wardrobe in your own card's Edit (docs/history/339). A STARRED shop thing stays on Saved — `collItems_` reads
   `stuffItemsAll_`, which this does not touch.

   A LIST NOW, AND THE TEST IS "EVERY GROUP IT IS IN IS ONE OF THESE". A kind in `Shop` and in
   `Learning` would still answer `Learning`, which is the array rule the note below defends.

   ONE THING THIS CHANGES THAT IS NOT THE SHOP. `kindOf_` files a kind it does not know under
   `Shop · Things`, so an unrouted kind used to turn up there looking deliberate — and now leaves
   Find altogether. Measured on the fixture and the real files: no item today has a kind outside
   `KINDS` and the `kinds` tab. A new one needs a `kinds` row, which `kindMap_` puts in Learning
   when it names no group. */
```

### READ EXACTLY AS THE `forLabel` FACET READS IT — `x.groups || kindOf_(x).group`, through `asList_` — so what leaves the funnel is what would have answered

in `stuffItemsBuild_`

```
/* READ EXACTLY AS THE `forLabel` FACET READS IT — `x.groups || kindOf_(x).group`, through
       `asList_` — so what leaves the funnel is what would have answered `Booking` and nothing
       else. A thing in Booking AND another group still answers the other door, so it stays: the
       array form has been supported since a tutor was two things, and a filter that ignored it
       would silently drop a kind from a group it belongs in. */
```

### AND NOTHING ELSE: BOTH FINDERS CARRY EVERYTHING (347).

in `stuffItemsBuild_`

```
/* AND NOTHING ELSE: BOTH FINDERS CARRY EVERYTHING (347). For two days this went on to keep only
       what the bound finder carried — Find everything but the resources, the second finder the
       resources (329, `FINDER.has`) — and that was the split the owner took back. */
```

### ---------- PEOPLE, PLACES AND SUBJECTS

in `stuffItemsRaw_`

```
/* ---------- PEOPLE, PLACES AND SUBJECTS -----------------------------------------------------
       Find and Stuff were two tabs asking the same question — where is the thing I want — split by
       a distinction nobody makes while looking: people and places on one, objects on the other.
       Somebody who wants Maths does not know whether they need a tutor, a venue, a subject page or
       a past paper, and being made to guess which tab holds it is the whole problem.

       They can be one list now because the funnel skips a question most of the set cannot answer.
       That was the objection to merging and it is answered: choose Tutors and you will never be
       asked about exam boards, because a tutor has none and the coverage rule sees it. */
```

### The widgets, findable like everything else.

in `stuffItemsRaw_`

```
/* The widgets, findable like everything else. Searching "timer" now finds the timer, which on
       a tab it never could.

       ---------- AND SOME ARE NOT FOR EVERYBODY ---------------------------------------------------
       THE WIDGETS TAB HAS A `roles` COLUMN and nothing has ever read it — every widget has been
       shown to every person since the tab was made. That did not matter while they were all games
       and a calculator; it matters the moment one of them prints your flyers.
       `admin` on a widget means admins only. Anything without it is for everybody, which is what
       the other nine are. */
```

### ---------- THE WIDGETS ARE NOT IN THE FUNNEL, AND THIS IS THE SECOND DECISION ON IT

in `stuffItemsRaw_`

```
/* ---------- THE WIDGETS ARE NOT IN THE FUNNEL, AND THIS IS THE SECOND DECISION ON IT ---------
       THEY WERE PUT BACK HERE ON A MEASUREMENT AND TAKEN OUT AGAIN ON A JUDGEMENT, so both halves
       are worth keeping. The measurement was real: `.filter(wgt => … && wgt.groups)` had a second
       test that was ALWAYS FALSE — 16 widgets declared, 0 carrying `groups` — so `stuffItems()`
       returned zero items of kind `tool` or `game` and typing `calculator` into the search box
       found nothing. That was a filter emptying a list while looking like a design.

       THE JUDGEMENT IS THE OWNER'S AND IT OVERRULES IT. A tool is not a thing you FIND, it is a
       thing you OPEN, and it has a column of its own where all sixteen are laid out as tiles — two
       swipes, no question to answer first. Putting them in the funnel made the app's search return
       a calculator beside a past paper, and `What kind` grew two answers that are two other
       screens. The Find screen is for the library and the people; Tools and Games are where tools
       and games are.

       WHAT THAT COSTS, SO IT IS NOT REDISCOVERED AS A BUG: typing `calculator` here finds nothing
       again, deliberately. If it should, this is the four lines that were here — the fix is these,
       not another `wgt.groups`. */
```

### FRIENDS. People are found on the Find tab like everything else — they were a card on You, which made them a setting about yourself rather than a set of people

in `stuffItemsRaw_`

```
/* FRIENDS. People are found on the Find tab like everything else — they were a card on You,
       which made them a setting about yourself rather than a set of people you can look through.
       Only somebody who has a checklist and a score has any: a parent has no scoreboard to compare
       and no reason to collect handles. */
```

### ---------- THE POSTS

in `stuffItemsRaw_`

```
/* ---------- THE POSTS -------------------------------------------------------------------
       READ OFF `DATA.posts` AND FILTERED THE SAME WAY THE FEED FILTERS. `feedPosts` cannot be
       reused here — it returns finished cards, not rows — so the one rule that matters is repeated
       rather than the whole function: a deleted post is gone for everybody, including the admin who
       deleted it. Anything else the feed does to the list is ordering, and ordering is the funnel's
       job here, not the feed's.

       WHAT IS SEARCHED IS THE CAPTION. `name` is what the text box matches against, and the caption
       is what somebody remembers about a post — "the one about the trip" — while the author is
       almost always the same handful of names. So the caption leads and the author is the subtitle,
       which is also the order they read in on the card itself. */
```

### THE POSTS WERE BUILT HERE and are not any more:

in `stuffItemsRaw_`

```
/* THE POSTS WERE BUILT HERE and are not any more: the feed is a column. A post reachable two
       ways is two places for it to look different, and the funnel's copy was the real card — same
       reactions, same share, same admin controls — so the two could drift without either looking
       wrong on its own. `DATA.posts` is still read by the feed, which is the one place that draws
       them now. */
```

### ---------- THE LINKS WERE BUILT HERE, AND THEY ARE GONE FROM THE APP

in `stuffItemsRaw_`

```
/* ---------- THE LINKS WERE BUILT HERE, AND THEY ARE GONE FROM THE APP --------------------------
       ASKED FOR AS *"Get rid of links that's almost redundant now."* This was the only reader of
       `DATA.links`, with a long note on making a link's description searchable — 115 of 127 carried
       one and none could be found by it. See the note where `link` was in `KINDS`.

       NOT `stuffItemsBuild_`, BECAUSE A LINK IS NOT KEPT ON SAVED EITHER. Venues went the other way
       — filtered off Find and still built here, so a starred one stays on Saved. A link is not
       filtered, it is gone: the list is not fetched any more, so there is nothing to build, and a
       link somebody starred leaves Saved with the rest. That is the owner's call taken whole rather
       than half, and it is said here so it is not rediscovered as the favourites fault this file
       records above `stuffItemsAll_`. */
```

### ---------- LEVELS

in `stuffItemsRaw_`

```
/* ---------- LEVELS -------------------------------------------------------------------------
       `subject` IS BLANK, and it is the one field somebody would be tempted to fill. A level runs
       across several subjects — that is the whole point of the card — so putting one of them in
       would make GCSE turn up when you filter to Maths and vanish when you filter to English,
       which is worse than it not answering the question at all. Blank is what keeps it out, the
       same way blank keeps a shop item out of the exam-board question.

       `keystage` IS ALSO BLANK. A key stage and a level are two different ladders — KS4 and GCSE
       describe the same year and are not the same fact — and folding one into the other would put
       two vocabularies in one dropdown, which is the mistake the boxer comment above already had
       to be talked out of once. */
```

### ---------- WHAT YOU ARE IN, WHAT YOU ARE WAITING FOR, AND WHAT IS DONE

in `stuffItemsRaw_`

```
/* ---------- WHAT YOU ARE IN, WHAT YOU ARE WAITING FOR, AND WHAT IS DONE -------------------
       OFF `myJobs_`, WHICH IS THE ONE PLACE THAT KNOWS WHOSE SESSIONS ARE WHOSE — and off
       `jobIsPast_` and `isWaitJob_`, which are the two tests `pastCard_` and the sessions widget
       already use. Three lists from one source, so a session cannot be in two of them or none.

       SEARCHED BY SUBJECT AND LEVEL, which is what somebody types when looking for one — "maths
       gcse" rather than a job id. The tutor and the venue go in the subtitle, so the text box
       matches those too. */
```

### YOU WERE AN ITEM HERE, under `People`, when you had no tutor row of your own.

in `stuffItemsRaw_`

```
/* YOU WERE AN ITEM HERE, under `People`, when you had no tutor row of your own. Removed with
       that group — the account column is your card, in full, one swipe right. The merge it guarded
       against is still guarded: a tutor row that is you draws `meCard`, which is where that note
       now lives, on the `tutor` entry in KINDS. */
```

### ---------- AND A BLANK PRICE CELL IS NOT A PRICE OF NOUGHT, ON THIS MAPPER TOO

in `stuffItemsRaw_`

```
/* ---------- AND A BLANK PRICE CELL IS NOT A PRICE OF NOUGHT, ON THIS MAPPER TOO ------------
         `Number(x.price) || 0` WAS HERE, under a comment defending the zero: "a shop row is the one
         place `0` genuinely means free — it is priced, and the price is nought." That is true of a
         cell holding `0` and false of a cell holding nothing, and `Number('') || 0` cannot tell
         them apart. This is the `cost: 0` fault on the one mapper that was exempted from the fix,
         because the exemption was written about the value and the bug is about the blank.

         AND THE BLANK IS NOT HYPOTHETICAL. `seedAvatarItems` wrote `price` and `currency` into a
         tab whose columns are `price_pence`, `price_ticks`, `price_coins` and `acquire`, so every
         wearable it seeded has an empty price and an empty `acquire` — and `doGet` reads `acquire`
         to decide which column to look in. Seven paid wearables, priced at nothing, drawn as FREE.
         `repairShopPrices` in setup.gs fixes the sheet; this stops the app claiming a price nobody
         has typed, which is a different job and the one that survives the next blank cell. */
```

### THE EXAM FIELDS ARE NOT WRITTEN BLANK ANY MORE.

in `stuffItemsRaw_`

```
/* THE EXAM FIELDS ARE NOT WRITTEN BLANK ANY MORE. `asList_` cannot tell `''` from `undefined`
         — both come out as no answer — so the ten blanks per row were ceremony. Leaving them off
         is the same behaviour and says the true thing: a beanie has no exam board. */
```

### WHETHER IT IS A WEARABLE, AND WHAT IT COSTS TO REACH.

in `stuffItemsRaw_`

```
/* WHETHER IT IS A WEARABLE, AND WHAT IT COSTS TO REACH.
         A wearable is priced in one of two currencies and the card only ever read one of them: a
         level-gated item has a price of zero, which was being drawn as "free" — an item saying
         free that cannot be taken is worse than one saying nothing, because somebody presses it. */
```

### ---------- QUESTIONS, AS PARTS

in `stuffItemsRaw_`

```
/* ---------- QUESTIONS, AS PARTS ----------------------------------------------------------
       ONE ITEM PER PART. The stem rows are not items — a stem is not something anybody searches
       for, it is the context a part needs — so they are looked up when a part is drawn and never
       listed in their own right.

       EVERY PAPER FIELD IS COPIED ONTO THE PART from its resource row, so a question answers the
       same facets its paper does: filtering to A-Level, Edexcel, 2022 narrows questions exactly
       as it narrows papers, and the funnel does not have to know it is looking at either. */
```

### A FIGHTER ANSWERS THE FUNNEL'S QUESTIONS IN HIS OWN WORDS.

in `stuffItemsRaw_`

```
/* A FIGHTER ANSWERS THE FUNNEL'S QUESTIONS IN HIS OWN WORDS. Division goes in `subject`, the
       one column every facet already knows how to group by, so Boxers narrows by division without
       a facet of its own. The exam fields stay blank, and blank is what keeps a boxer out of a
       list of past papers. */
```

### ---------- A DIVISION IS NOT A SUBJECT

in `stuffItemsRaw_`

```
/* ---------- A DIVISION IS NOT A SUBJECT -----------------------------------------------
         `subject` HELD THE DIVISION, written that way for a good-sounding reason: it is the column
         every facet already knows how to group by, so Boxers narrowed by division for free. What
         it cost was the Subject question, which then offered Maths, English, Heavyweight and
         Welterweight in one list — two vocabularies pretending to be one, with "Boxing" itself
         nowhere in it, which is the thing anybody would look for first.
         SO THE SUBJECT IS BOXING and the division is its own field. */
```

### WHICH OF THE TWO, asked before the weight.

in `stuffItemsRaw_`

```
/* WHICH OF THE TWO, asked before the weight. Boxers and fights are both resources about
         boxing — that is why they share a label — but they are not interchangeable, and a funnel
         that goes from Boxing straight to twenty weight classes has skipped the question anybody
         actually has first. */
```

### ---------- `year: b.activeTo` WAS HERE, AND IT WAS HIS LAST YEAR DRAWN AS "Year"

in `stuffItemsRaw_`

```
/* ---------- `year: b.activeTo` WAS HERE, AND IT WAS HIS LAST YEAR DRAWN AS "Year" ----------
         FOUND BY THE AUDIT THAT ADDED `Decade` and only visible once that question existed: the
         funnel went Boxers → Decade → **Year** → Division, and the answers to Year were `1981` and
         `2005`. Those are the years Ali and Tyson STOPPED, which is not a fact anybody narrows a
         list of fighters by, and it sat between the decade and the weight saying it.

         A CAREER IS NOT A YEAR, and writing one into a field called `year` is the shape this file
         records under `cost: 0` and under `paper: true` — a column filled in with something nearly
         right, then read by a question that means something else. `Decade` asks the real version
         off `activeFrom` and `activeTo` together.

         A BOUT KEEPS ITS `year`, on the mapper below, because a fight really did happen in one. */
```

### ---------- THE QUESTIONS, AND NOT THE DOCUMENTS THEY CAME OUT OF

in `stuffItemsRaw_`

```
/* ---------- THE QUESTIONS, AND NOT THE DOCUMENTS THEY CAME OUT OF ---------------------------
       `...allTopics()` WAS HERE — 642 documents, one item each, drawn as covers. It is questions
       now, one item per part, and the documents are not in this list at all. The long note above
       `questionItems` says why; the short version is that a document and its questions answer the
       same facets, so listing both meant every search returned two kinds of thing. */
```

### ---------- THE PRACTICALS

in `stuffItemsRaw_`

```
/* ---------- THE PRACTICALS --------------------------------------------------------------
       THE JOIN IS `topics`, AND IT IS THE SAME COLUMN THE QUESTIONS USE. That is the whole design:
       a practical carrying `Perimeter, Area of 2-D Shapes` is found by the Topic question that a
       past paper about perimeter is found by, and by the Topic area above it, with nothing added
       to the engine. The alternative was an id column joining to `data/topics.json`, which would
       have been a second vocabulary to keep in step with the one 4,000 rows already use.

       `subject` IS THE SCIENCE, NOT "Practicals". A physics required practical IS physics, and
       filing all 41 under a subject of their own would have put Biology, Chemistry and Physics
       behind a door marked something else — the mistake `boxKind` records one rung up, where the
       division was written into `subject` and the Subject question then offered Heavyweight
       beside Maths. What KIND of thing it is, is what `kind` is for. */
```

### EVERY WORD OF THE GUIDE, so the thing you are looking for is what you can search by.

in `stuffItemsRaw_`

```
/* EVERY WORD OF THE GUIDE, so the thing you are looking for is what you can search by. The
         topics go in alongside it for `topicAtoms_`'s reason — a practical's `topics` cell is the
         only place that says a trundle wheel is about perimeter, and the words are printed nowhere
         else on the card. See `practicalText_`. */
```

### ---------- THE PROJECTS

in `stuffItemsRaw_`

```
/* ---------- THE PROJECTS ---------------------------------------------------------------
       THE PRACTICALS' JOIN, UNCHANGED: `topics` in the library's own spellings, so a recipe book
       that scales a recipe from four to six is found by the Topic question that finds a past
       paper on direct proportion. `check-projects.js` refuses a topic the tree has never heard of.

       `subject` AND `level` ARE THE LIBRARY'S WORDS, not new ones: inventing `KS3 Science` as one
       string would be a third spelling of a fact two columns already carry -- the `needs_print` /
       `print_required` lesson, which cost 356 rows of disagreement. `check-projects.js` holds both to the two tables that group them — one value outside
       `SUBJECT_BUCKET` or `LEVEL_BUCKET` stands that whole question down to the alphabet. */
```

### ---------- PROJECT OR COURSEWORK, ASKED ONCE `Projects` IS CHOSEN

in `stuffItemsRaw_`

```
/* ---------- PROJECT OR COURSEWORK, ASKED ONCE `Projects` IS CHOSEN ----------------------
         `practicalType`'s arrangement exactly: no facet in code, one row in
         `data/settings/facets.json` naming the field, and `facetFromSheet_` reads it off the item.
         The LABEL goes on the item rather than the file's word, so the answer and its chip say
         `Coursework` and not `coursework`. Every project answers it -- blank is `Project` -- and
         its row's `min_coverage` of 1 asks it only of a list that is ALL projects: at the default
         half, a search for `blade` holding two projects, a textbook and a practical was asked it,
         and Coursework dropped the other two without a word. Its row's `sort_order` puts it ahead
         of Subject, and that is load-bearing too: see the row's own note, and docs/history/314. */
```

### A BOARD WHERE THE ROW NAMES ONE, in the column a practical's board already fills -- so a second coursework under another board is told apart by the Exam board

in `stuffItemsRaw_`

```
/* A BOARD WHERE THE ROW NAMES ONE, in the column a practical's board already fills -- so a
         second coursework under another board is told apart by the Exam board question with
         nothing added here. Blank on every project, which the coverage rule keeps quiet. */
```

### ---------- THE CONTENT CARDS: ONE ITEM PER CHAPTER OF data/textbooks.json

in `stuffItemsRaw_`

```
/* ---------- THE CONTENT CARDS: ONE ITEM PER CHAPTER OF data/textbooks.json -----------------------
       IT WAS ONE ITEM PER BOOK on the `@family. textbooks` shelf, and the chapters were its pages —
       see `content` in KINDS for the owner's words that ended it. Now a chapter is found on its own,
       by the tags a question is found by. */
```

### ---------- THE BIBLE, FOR AN ADMIN AND NOBODY ELSE

in `stuffItemsRaw_`

```
/* ---------- THE BIBLE, FOR AN ADMIN AND NOBODY ELSE ---------------------------------------
       ONE ITEM ON THE `Books` SHELF, or none. The single place on this list where code on the phone
       asks who you are — asked for by name, see the note above `bibleFor_`. (The films differed by role
       too, because the payload does, until they left Find — see below.) THE COVER ONLY:
       its 31,102 verses are a list of their own (`bibleVerses_`), read instead of this one while a
       Bible chip is on, and fetched a book at a time; nothing about it is in the payload. */
```

### ---------- `DATA.films` WAS MAPPED HERE, ONE ITEM PER FILM OR SERIES, AND IS NOT ANY MORE

in `stuffItemsRaw_`

```
/* ---------- `DATA.films` WAS MAPPED HERE, ONE ITEM PER FILM OR SERIES, AND IS NOT ANY MORE --------
       THE OWNER, 10 Oct: *"films should not appear in the finder it cannot be found there"*. So
       nothing on this list reads `DATA.films`: no item, so no card, no `Films` under What kind and no
       title, director or lead in Find's search. The rows still arrive in an admin's payload, and
       Games → Videos is where they are found. One lesson of the mapper is worth keeping for whatever
       comes next: it put `audience` on a field of its own rather than in `subject`, because a Subject
       question offering `adults` beside `Maths` is the `boxKind` mistake this file records. See where
       `film` was in `KINDS`. */
```

### THE YEAR OF A THING, from the column or from the wave.

top level, before `topicAtoms_`

```
/**
 * THE YEAR OF A THING, from the column or from the wave.
 *
 * `year` is its own column because a filter wants the year on its own — "June 2024" and
 * "November 2024" are two waves and one year, and bucketing by wave gives a facet with an entry
 * per sitting. But a wave already contains the year, and asking somebody to type 2024 into a
 * second cell to make the filter work is asking them to keep two facts in step by hand.
 *
 * So: the column when it is filled, and the four digits out of the wave when it is not.
 */
```

### `topicOf_` — WHAT THE QUESTION IS ABOUT, WHICH THE FUNNEL HAD NEVER ASKED.

top level, before `topicAtoms_`

```
/* ==================================================================================================
   `topicOf_` — WHAT THE QUESTION IS ABOUT, WHICH THE FUNNEL HAD NEVER ASKED.

   SIX CHIPS DEEP IT SAID "NOTHING LEFT TO NARROW" OVER 193 QUESTIONS. Learning, Questions, Maths,
   Worksheet, KS2, Year 4 — six taps — and the 193 left were about eleven different things:
   fractions, area, roman numerals, telling the time. Every question the funnel asked on the way
   down was about where the question CAME FROM — subject, level, type, key stage, school year,
   board, tier, publisher — and not one about what it is OF.

   THAT IS THE WHOLE OF "I CLICK THE FILTERS AND IT JUST FEELS LIKE IT SHOWS ALL OF THEM". The
   filters were narrowing provenance while the person was looking for a topic, so every tap took a
   real bite out of the list and none of them took the bite that was wanted.

   THE COLUMN WAS ALREADY THERE, AND NOTHING READ IT. `topics` is on 91.5% of the question rows and
   has reached the browser on `row` since `libraryInto_` stopped enumerating columns — see the note
   on `row:` in js/library.js, which was written about exactly this: an enumeration goes stale and a
   reference does not. So this is a reader over data that already exists, which is the only kind of
   facet that scales — a worksheet transcribed tomorrow is filterable the moment its `topics` cell
   is filled in, with nothing here to edit and no deploy.

   A CELL HOLDS A LIST. `Fractions, Ordering` is two topics the same way `KS1, KS2` is two key
   stages; see `keystage` in FACETS for the same split and the same reason.

   ---------- AND THE SPELLING IS SETTLED BY A VOTE, NOT BY A LIST KEPT HERE ------------------------

   46 OF THE 389 DISTINCT TOPIC VALUES DIFFER FROM ANOTHER ONLY BY CASE. `Linear Equations` (81
   rows) beside `linear equations` (4); `Histograms` (20) beside `histograms` (13); `Expanding
   Brackets` (37) beside `expanding brackets` (9). Two buttons for one topic is the `Alevel` /
   `A-Level` fault in a new column, and `check-funnel.js` fails the build on it by design.

   TITLE CASE WOULD HAVE BEEN THE OBVIOUS FIX AND IT WOULD HAVE BEEN WRONG. `HCF and LCM`
   title-cased is `Hcf And Lcm` — a spelling nobody ever typed, invented by code, printed on a
   button. So instead THE LIBRARY VOTES: every spelling of a topic is counted and the commonest one
   is used for all of them. That can only ever pick a word somebody actually wrote, it needs no
   vocabulary list to keep in step with the transcriptions, and a new spelling arriving in a bulk
   import is absorbed rather than split off into a chip of its own.

   NORMALISED HERE RATHER THAN IN THE DATA, for the reason `levelOf_` gives one screen down: the
   rows are bulk-imported and will keep arriving in both cases, so a migration is something the next
   import undoes. 4,000 committed content rows edited to make a filter work is also a diff nobody
   can review.
================================================================================================== */
```

### ---------- THE VOTE MOVED, AND IT NOW APPLIES TO EVERY QUESTION

top level, before `topicShown_`

```
/* ---------- THE VOTE MOVED, AND IT NOW APPLIES TO EVERY QUESTION ---------------------------------
   `TOPIC_SAID`, `topicSaid_` AND `topicKey_` WERE HERE — a tally of every spelling of every topic,
   picking the commonest for all of them, so `Linear Equations` and `linear equations` were one
   button. It was right and it was written one column too low: the same fault is in `company`
   (`1stclassmaths` against `1st class maths`, 1,372 rows against 109) and was in `level`
   (`Alevel` / `A-Level`), and each was being repaired by hand, in its own reader, after somebody
   noticed. A rule applied by hand is not a rule — this file says so twice already.

   SO IT IS `spellOne_` AND `spellKey_` IN THE FUNNEL ENGINE, applied to the answers of every facet
   including the ones a spreadsheet invents. See them above `facetTally_`. */
```

### AND NO QUESTION AT ALL NOW, the 1st Class Maths sheets included.

top level, before `topicShown_`

```
/* AND NO QUESTION AT ALL NOW, the 1st Class Maths sheets included. Their topic is their PDF's name,
   and `Paper` already asks it by that name: with `Topic` asked first the same words were offered
   twice — "Equation of a Line", then the paper "Equation of a Line" — measured 6 Oct when `Topic
   area` went. A practical or a project still answers it. */
```

### ---------- THE TOPIC TREE WAS READ HERE

top level, before `levelOf_`

```
/* ---------- THE TOPIC TREE WAS READ HERE ----------------------------------------------------------
   `topicIndex_`, `topicPick_` AND `topicAreaOf_` WERE HERE — 158 lines that resolved a question's
   `topics` cell onto a root of `data/topics.json` (96.6% of 4,257 cells, into ten branches), with a
   level that rules a branch out, a subject that only breaks a tie, and a memo per item. Their one
   reader in the app was the `Topic area` question, and the owner retired it on 6 Oct (see `topicArea
   WAS HERE` among the facets). The retirement's note said the search still read the tree; it never
   had — the haystack is the question's own words, `topicAtoms_` of its `topics` cell included, and
   no branch name was ever in it. So for a round the app fetched a 269-row file on every boot to
   build an index nothing asked, and the only thing exercising the resolver was a check (rule 8 of
   `check-funnel.js`) guarding a menu nobody could open.

   WHAT IT KNEW IS NOT LOST WITH IT. The level and subject limits are still columns on the tree's
   roots (`only_level`, `only_subject`), and the two faults rule 8 was written for — 18 GCSE Higher
   questions in the A-level branch, and `brackets` filing two KS2 grammar questions under Number —
   are written up in `docs/history/180-…`. A topic menu that comes back should start from that note
   and from this file's history at `topicPick_`, not from a blank page. */
```

### WHAT LEVEL A THING IS TAUGHT AT, FROM WHICHEVER OF THE TWO COLUMNS HAS IT.

top level, before `levelOf_`

```
/**
 * WHAT LEVEL A THING IS TAUGHT AT, FROM WHICHEVER OF THE TWO COLUMNS HAS IT.
 *
 * Two columns hold this fact and neither holds all of it: `band_value` with `band_type: stage` is
 * the deliberate per-row statement, and `level` is what the bulk imports wrote. 128 A-level items
 * carry only the second, 135 carry both. Reading one column meant a question that was right about
 * a third of the library and silently wrong about the rest.
 *
 * THE SPELLINGS ARE NORMALISED, not the data. `Alevel`, `A-level` and `A-Level` were three answers
 * on one screen; the data is bulk-imported and will keep arriving in all three, so the repair
 * belongs here where every reader gets it, rather than in a migration that the next import undoes.
 */
```

### ---------- ONLY THE ONE THE GENERAL RULE CANNOT DO

in `levelOf_`

```
/* ---------- ONLY THE ONE THE GENERAL RULE CANNOT DO -------------------------------------------
     `A LEVEL`, `A-LEVEL`, `ALEVEL` AND `gcse` ARE HANDLED UPSTREAM NOW. `spellKey_` reduces an
     answer to its letters, so all three spellings of A-level are one identity and the folding in
     `facetTally_` picks the one a person would write — which is the same repair this function was
     doing by hand for one column. The three branches that did it are gone.

     `AS level` IS NOT THAT. It reduces to `aslevel` and `AS` reduces to `as`: two different
     identities, so no general rule can join them, and joining them is a fact about English exams
     rather than about spelling. That is exactly the line — the engine folds SPELLINGS and a reader
     like this one resolves MEANINGS. `waveOf` sits on the same side of it. */
```

### ---------- `KS2 SATs` IS TWO FACTS, AND THE LEVEL IS ONE OF THEM

in `levelOf_`

```
/* ---------- `KS2 SATs` IS TWO FACTS, AND THE LEVEL IS ONE OF THEM ---------------------------------
     *"sats is one tag not ks2 sats."* The STA papers carry `band_value: KS2 SATs` and the data is
     not this file's to rewrite -- the next import would write it back -- so it is read here, where
     `AS level` is: a MEANING, not a spelling. The qualification is SATs; which key stage is the
     `Key stage` question's, read by `satsStagesOf_` off the same cell. A bare `KS1` / `KS2` typed
     into the level column means the same and goes the same way. */
```

### ---------- WHICH KEY STAGE A SATs ROW IS, AND ONLY A SATs ROW

top level, before `satsStagesOf_`

```
/* ---------- WHICH KEY STAGE A SATs ROW IS, AND ONLY A SATs ROW -----------------------------------
   THE KEY STAGE IS ITS OWN QUESTION AGAIN, ASKED INSIDE SATs AND NOWHERE ELSE. Inside GCSE it was the
   grey area `KS3 | KS4` the owner asked not to see, and it stays silent there; inside SATs it is the
   one thing that tells a KS1 paper from a KS2 one, now that the level no longer says it.

   THE SCHOOL YEAR DECIDES FIRST, for the reason `ksFallback_` gives: it is a fact about the sheet,
   where a `KS1, KS2` cell is a range -- a Year 2 sheet is KS1's. Then the band or level that NAMES a
   key stage (`KS2 SATs`, the STA papers). Then the cell, every KS1 / KS2 in it: a range with no year
   is reachable from both, which is the multi-valued facet this question was built as. */
```

### THE LEVEL AND, INSIDE SATs, THE KEY STAGE BESIDE IT -- `['SATs', 'KS2']`, `['GCSE']` -- for the places that SAY a level rather than filter by it:

top level, before `levelSaid_`

```
/* THE LEVEL AND, INSIDE SATs, THE KEY STAGE BESIDE IT -- `['SATs', 'KS2']`, `['GCSE']` -- for the
   places that SAY a level rather than filter by it: the card's tags and a result's crumb. Asked of
   `LEVEL_BUCKET`, the one table that decides what is SATs, so a level the table files there under
   another spelling still gets its key stage said. */
```

### ---------- A KEY STAGE, SAID AS THE QUALIFICATION AT THE END OF IT

top level, before `ksLevel_`

```
/* ---------- A KEY STAGE, SAID AS THE QUALIFICATION AT THE END OF IT -------------------------------
   *"I prefer GCSE or SATs over grey areas."* KS4 ends in a GCSE, KS2 and KS1 in SATs, KS5 in an
   A-level; KS3 ends in nothing, so it stays KS3 — inventing an exam for it would be a wrong fact,
   and a wrong chip is worse than a grey one. The four qualifications are spelled as `LEVEL_BUCKET`
   spells them, so every answer this makes is already placed in that table.
   KS1 AND KS2 ARE BOTH `SATs` -- *"sats is one tag not ks2 sats"*. Which of the two is the `Key
   stage` question's to say, inside SATs; see `satsStagesOf_`. */
```

### ---------- WHERE A ROW HAS NO LEVEL, ITS KEY STAGE SAYS ONE

top level, before `ksFallback_`

```
/* ---------- WHERE A ROW HAS NO LEVEL, ITS KEY STAGE SAYS ONE ---------------------------------------
   1,160 PRIMARY WORKSHEETS carry `KS2` or `KS1, KS2` and no level at all, which kept the Level
   question under its coverage bar on every primary list and put Key stage in front of it.

   THE SCHOOL YEAR DECIDES FIRST, because it is a fact about the sheet and a `KS1, KS2` cell is a
   range: a Year 2 sheet is KS1's, a Year 5 sheet KS2's. Without a year, A RANGE IS FILED UNDER WHAT
   IT GOES UP TO — `LEVEL_BUCKET`'s own rule — so `KS3, KS4` is GCSE and `KS1, KS2` is SATs. Years
   1 to 6 are all SATs; which key stage is `satsStagesOf_`'s, off the same year. */
```

### ---------- THE COLUMN HOLDS DATES, NOT YEARS

in `yearOf`

```
/* ---------- THE COLUMN HOLDS DATES, NOT YEARS ------------------------------------------------
     THE YEAR FILTER READ AS SEVEN LINES OF NONSENSE and this is why. A cell typed as 01/06/2018 is
     a DATE to the sheet, so what arrives here is not "2018" but the whole of

         Fri Jun 01 2018 08:00:00 GMT+0100 (British Summer Time)

     — and this returned it untouched. Every symptom followed from that one line. The funnel groups
     by whatever comes back, so seven sittings became seven separate chips instead of seven years;
     each chip was sixty characters of clock and timezone; and picking one filtered to that exact
     instant rather than to a year. The filter was not broken so much as filtering by the wrong
     thing entirely, and doing it in a way nobody could read.

     THE FOUR DIGITS ARE TAKEN OUT OF WHATEVER IT IS, which is the same thing already done to the
     wave on the line below — the rule was right, it was only being applied to one of the two
     places a year can hide. It costs nothing when the cell holds a plain 2018, since a plain 2018
     matches itself.

     WORTH FIXING IN THE SHEET AS WELL. This makes the app read the column correctly; it does not
     make the column right. A year stored as a date is a year that will keep arriving as a
     timestamp, and any other thing that ever reads it will need this same repair. Formatting that
     column as plain text is the actual cure. */
```

### THE NAME OF AN EXAM SERIES, FROM THE MONTH IT SAT IN.

top level, before `seriesOf_`

```
/**
 * THE NAME OF AN EXAM SERIES, FROM THE MONTH IT SAT IN.
 *
 * A BOARD RUNS TWO SERIES A YEAR AND SPREADS EACH OVER SEVERAL WEEKS. Edexcel's 2018 summer papers
 * sat on 24 May, 7 June and 12 June; its autumn papers on 6, 8 and 12 November. Naming a sitting by
 * its own month splits one series into `May 2018` and `June 2018` — two buttons for three papers
 * every student thinks of as one thing, and the question "which paper" cannot be asked underneath
 * a split like that. So the summer months are one answer and the autumn months another.
 *
 * THE SEASON IS THE NAME, AND IT USED TO BE THE MONTH. It was "June 2018" and "November 2018",
 * because that is what the boards and every past-paper site print — and it was reported as a bug
 * the day the first May paper went in: **the card said "Paper 1 (Non-Calculator) — May 2017" and
 * the filter offering it said "June 2017"**, so the paper looked absent from the one list somebody
 * was scanning for it. Every Paper 1 of every summer series sits in May and Papers 2 and 3 sit in
 * June, so that is not one odd row — it is a third of the library disagreeing with its own filter.
 *
 * "SUMMER 2017" IS TRUE OF A PAPER SAT IN MAY AND OF ONE SAT IN JUNE, which "June 2017" is not,
 * and it is the word the boards themselves use for the series when they are not naming a month
 * (JCQ publishes the summer and autumn series). Nothing is invented and nothing goes stale: a
 * paper arriving in a month nobody expected still lands on the season its month belongs to.
 *
 * SEARCH IS THE OTHER HALF AND IT WAS ALREADY RIGHT. A paper's own name carries its own month, so
 * typing "may 2017" or "june 2017" finds the questions either way — the season is the name of the
 * BUTTON, not a replacement for the date on the paper.
 *
 * ANYTHING ELSE KEEPS ITS OWN MONTH. January sittings were a real thing until 2013 and a March or
 * an August is somebody being deliberate; collapsing those into a season invents a fact. The rule
 * only merges where two months are certainly one series.
 */
```

### THE TWO SEASON WORDS ARE CONSTANTS BECAUSE TWO OTHER PLACES HAVE TO AGREE WITH THEM, and a word spelled out in three files is the fault this whole file is

top level, before `SERIES_SUMMER`

```
/* THE TWO SEASON WORDS ARE CONSTANTS BECAUSE TWO OTHER PLACES HAVE TO AGREE WITH THEM, and a word
   spelled out in three files is the fault this whole file is about. `waveOf` falls back to them
   when a phase word arrives with no month on the row, and `dateKey_` has to know where in the year
   each one sits or the sittings sort alphabetically again — which is the exact complaint ("Here
   look! Jarring") that put the date sort in. `SERIES_AT` is the month each season is centred on. */
```

### THE WAVE OF A THING, AS A HUMAN WOULD SAY IT.

top level, before `waveOf`

```
/**
 * THE WAVE OF A THING, AS A HUMAN WOULD SAY IT.
 *
 * `exam_wave` is meant to hold "June 2024" — a sitting, which is a month and a year. What is
 * actually in the sheet on most rows is a DATE: 2024-06-01, typed into a cell Google then treats
 * as a date, so what reaches this file is the whole of
 *
 *     Fri Jun 01 2024 08:00:00 GMT+0100 (British Summer Time)
 *
 * and the funnel drew that, verbatim, as a button. Seven of them, one per sitting, each sixty
 * characters of clock and timezone — which is the fault you can see, but not the worst of it: two
 * ways of writing the same sitting are two DIFFERENT buttons, so "June 2018" typed by hand and
 * 2018-06-01 read from a date cell split one wave into two.
 *
 * A DATE IS NOT WRONG IN THE SHEET, it is just not what a person calls a sitting. So it is read
 * rather than rejected: month and year out of whatever shape arrived, in the words somebody would
 * use. The row that already says "June 2018" is returned untouched and lands on the same button as
 * the date that means the same thing — which is the part that actually fixes the filter.
 */
```

### ---------- A PHASE WORD IS A THIRD SPELLING OF THE SAME THING

in `waveOf`

```
/* ---------- A PHASE WORD IS A THIRD SPELLING OF THE SAME THING -------------------------------
     THE COMMENT ABOVE ALREADY NAMES THIS FAULT — "two ways of writing the same sitting are two
     DIFFERENT buttons" — and then a third way arrived: `First wave` and `Second wave`, written
     onto 850 rows by the transcriptions. They carry no month and no year, so they fell through
     every branch below and came back verbatim, as their own buttons, beside the dates.

     MEASURED, AND IT BROKE THE FILTER IN BOTH DIRECTIONS. For 2018 the funnel offered `June 2018`
     (16 questions, from the old import) AND `First wave`/`Second wave` (151 questions, from the
     transcriptions) as separate answers to one question. Picking either hid the other, and nothing
     on screen said a second 2018 existed.

     A WAVE IS A SEASON, so it is resolved through the row's own month and year rather than by
     trusting the phrase. `First wave` means the summer series and `Second wave` the autumn one —
     which is what a month of 5, 6 or 7 and a month of 10, 11 or 12 already say on the same row. */
```

### A DATE THAT CAME THROUGH AS TEXT.

in `waveOf`

```
/* A DATE THAT CAME THROUGH AS TEXT. Read by pattern rather than by `new Date`, which reads the
     same characters differently depending on the machine's timezone — and a wave that is June on
     one phone and May on another is a filter that splits in half for no reason anybody can see. */
```

### ---------- A PAST PAPER WITH NO SITTING OF ITS OWN TAKES ITS PAPER'S

top level, before `waveFromDoc_`

```
/* ---------- A PAST PAPER WITH NO SITTING OF ITS OWN TAKES ITS PAPER'S -----------------------------
   REPORTED AS *"when I do maths sats with [a student], the tags come out with full paper name and
   which paper is on the menu."* MEASURED: Maths · Past paper · KS2 SATs offered
   `Paper 1: Arithmetic — May 2019` beside `Paper 1: Arithmetic — May 2024`, because nothing above the Paper question had separated
   the two years. The SATs question rows carry a `year` and no `exam_wave`, so `waveOf` answered
   nothing, `Year` had no answer to offer, and the only thing left to tell two papers apart was the
   date inside their names -- which `shortLabels_` then had to keep.

   TWELVE PAPERS WERE IN THAT STATE: the nine STA SATs papers and the three AQA June 2023 science
   papers. So the rule reads the paper rather than the twelve being patched: a month on the row,
   else on its document (`docById_`, off the file), else in the paper's own name, with the row's own
   year. A month that is a season is a sitting.

   ONLY A PAST PAPER. A worksheet or a specimen is not a sitting -- a Corbettmaths sheet with a
   copyright year would otherwise grow a `Year` answer that means "when it was printed", which is
   a different fact under the same word. */
```

### AND THE NAME, WHICH IS WHAT THE COVER PRINTS.

in `waveFromDoc_`

```
/* AND THE NAME, WHICH IS WHAT THE COVER PRINTS. Seven of the twelve have no month cell on the
     document row either -- `Paper 1: Arithmetic — May 2024`, `Paper 1 — June 2023` -- and the month
     is in the name after its spaced dash, which is the one place every paper in this library states
     its sitting. Read by the month's name and the four-digit year together, so a worksheet title
     or a qualifier in brackets cannot be mistaken for one. */
```

### A YEAR WITH NO MONTH IS NOT A SITTING, and it is refused rather than returned bare:

in `waveFromDoc_`

```
/* A YEAR WITH NO MONTH IS NOT A SITTING, and it is refused rather than returned bare: `2024` beside
     `Summer 2024` is a second spelling of one sitting, which `check-funnel.js` rule 4 fails on --
     it did, on the first version of this function, for exactly the papers the name now settles. */
```

### ---------- THE MONTH OF A SITTING, FOR THE `Month` QUESTION

top level, before `SITTING_MONTH`

```
/* ---------- THE MONTH OF A SITTING, FOR THE `Month` QUESTION ------------------------------------------
   Only for something that HAS a sitting (`sittingOf_` found a year), so a worksheet or a 5-a-day day
   -- which has a month of its own, asked by `fiveMonth` -- never answers it.
   THE MONTH THE PAPER PRINTS COMES FIRST, after its spaced dash (`Paper 1 (Non-Calculator) — May
   2017`), and only then the row's `month`, its `exam_date` and the document row. AQA names a summer
   series `June 2024` and sits Paper 1 of it on 22 May, so ten papers here say June on the cover and
   May in the date column -- and reading the date first filed them under May while the card's own
   tag, cut from the same name, said June 2024. The folder is named the way the paper is: that is
   what is on the cover and in the file name the owner keeps it under, and the day it was sat is
   still on the card, in its own words. A phase word (`First wave`) names a SERIES and not a month,
   so it is never turned into one: a summer paper with no month anywhere answers nothing rather than
   a guessed May. Memoised on the item, as `sittingOf_` is. */
```

### ---------- THE SITTING IN ITS TWO HALVES, FOR THE TWO QUESTIONS THAT ASK THEM

top level, before `SITTING_MEMO`

```
/* ---------- THE SITTING IN ITS TWO HALVES, FOR THE TWO QUESTIONS THAT ASK THEM ----------------------
   `Summer 2018` → `{ series: 'Summer', year: '2018' }`. Split off `waveOf`'s answer rather than
   worked out again from the row, so `examSeries` and `examYear` cannot disagree with each other or
   with the bundle about what a row's sitting is. A bare year has no series; anything that is not a
   year at all (`Spec`, a word somebody typed) is a series with no year, which is the honest reading:
   it names a sitting, not a date. Memoised on the item, because both facets read it for every item
   on every tally and `waveOf` runs four regexes. */
```

### THE SERIES IN THE ORDER THEY COME IN A YEAR, not the alphabet:

top level, before `seriesCmp_`

```
/* THE SERIES IN THE ORDER THEY COME IN A YEAR, not the alphabet: `Autumn` sorted before `Summer`
   and read as the year starting in September. `SERIES_AT` places a season, `MONTH_NAMES` a month
   that kept its own name; anything else goes after them, alphabetically. */
```

### NO HEADINGS AT ALL, and no grouping behind them.

top level, before `stuffHay_`

```
/* NO HEADINGS AT ALL, and no grouping behind them.

   It went in stages, and each stage removed a reason for the next. The dropdown went because the
   funnel asked the same question better. Then the headings followed the funnel automatically —
   which was neat, and still bought nothing: by the time you have answered two questions there are
   a handful of cards on a page, and a heading over four things names what all four already say on
   their own second line.

   What is left is a list. The funnel says what you asked for, the count says how many, and the
   cards say what they are. Three things, none of them repeating another.
--------------------------------------------------------------------------------------------- */
```

### Every word must appear SOMEWHERE — so "maths 7" finds a Grade 7 Maths topic without the two words having to sit next to each other.

top level, before `stuffHay_`

```
/* Every word must appear SOMEWHERE — so "maths 7" finds a Grade 7 Maths topic without the two
   words having to sit next to each other. Searching only the name and the group label missed a
   shop item by its description, which is the thing that actually says what it is. */
```

### ---------- THE HAYSTACK IS BUILT ONCE PER ITEM, NOT ONCE PER KEYSTROKE

top level, before `stuffHay_`

```
/* ---------- THE HAYSTACK IS BUILT ONCE PER ITEM, NOT ONCE PER KEYSTROKE --------------------------
   `x.text` IS THE QUESTION ITSELF, built when the item was made -- `searchText_` says so and it was
   true. What was still being done per keystroke is the JOIN and the `norm`: six fields concatenated
   and normalised for all 5,354 items, on every letter. Measured at 8x CPU, one keystroke spent
   **126 ms** in that filter, which was the single biggest thing left on this screen once the DOM
   stopped being the problem -- about 2.7 MB of string work to answer "does this contain `work`".

   SO IT IS CACHED ON THE ITEM, which is the rule this file already states twice: built onto the
   item, not matched per keystroke. `stuffItems()` is memoised, so an item outlives every keystroke
   typed against it and is rebuilt the moment the payload, the person or the admin flag changes --
   which is exactly when the haystack could be different.

   THE ORDER IS UNCHANGED and so is the content: name, sub, subject, slot, grade, then the question
   itself last, so that a match on a name still costs what it always did. */
```

### ---------- A SKIPPED QUESTION IS ASKED AND ANSWERED "ANY"

in `stuffFind`

```
/* ---------- A SKIPPED QUESTION IS ASKED AND ANSWERED "ANY" -------------------------------------
     `{ any: true }` IS A FILTER THAT FILTERS NOTHING, and that is the entire mechanism. It sits in
     `STUFF.filters` so `nextFacet` — which reads that list to know what has been asked — moves on
     to the next question, and it is skipped here so it removes nothing from the list. One entry,
     two behaviours, and no second piece of state to keep in step with the first.

     WHY IT EXISTS: "sometimes i just know its roughly ks2". `School year` is a real question and it
     was the ONLY thing on the screen after Key stage — so somebody who does not care which year
     had a choice between answering it wrongly and going no further. Picking Year 4 took 1,093
     questions to 193 and silently threw away nine hundred KS2 questions that were just as
     relevant. */
```

### ONE KEY, then the name to settle ties.

in `stuffFind`

```
/* ONE KEY, then the name to settle ties. There was an outer sort by group — and with the
     groups gone there is nothing above the sort, which is most of why this is now four lines.
     The name is always the tiebreak, so two papers priced the same come out in the order anybody
     would look for them rather than in the order the sheet happens to hold them. */
```

### BY NAME, AND ONLY BY NAME.

in `stuffFind`

```
/* BY NAME, AND ONLY BY NAME. There were three orders here and a dropdown to choose between them;
     the dropdown is gone, so `STUFF.sort` could only ever hold its starting value and the other two
     branches were unreachable. A setting nothing can set is a setting that reads as a choice
     somebody made.
     A–Z is what a list of names should be anyway. If prices ever matter enough to sort by, that
     belongs beside the prices rather than above the search. */
```

### ---------- QUESTIONS SORT WITH THEIR PAPER, AND NUMERICALLY

in `stuffFind`

```
/* ---------- QUESTIONS SORT WITH THEIR PAPER, AND NUMERICALLY --------------------------------------
     BY NAME ALONE, A QUESTION'S NAME IS `Q5b`. Two things followed, both visible in the list:

     EVERY PAPER'S Q1 CLUMPED TOGETHER. `cmpText` on the name put Corbett's Q1 beside A-level
     Statistics Q1 beside Physics Q1 — three unrelated problems adjacent because they share a
     position in different documents. The card said which paper underneath, so the information was
     there; the ORDER was meaningless, which is worse than unsorted because it looks deliberate.

     AND Q1, Q10, Q11, Q12 CAME BEFORE Q2. Text order on a number is alphabetical, so a paper read
     down the screen in the wrong sequence — the one list in the app where the sequence is the whole
     point, because it is the order the exam asks them in.

     SO: THE PAPER FIRST, THEN THE NUMBER AS A NUMBER, then the part. Everything that is not a
     question is unaffected — `sub` is empty and `qNumber` is zero, so it falls straight through to
     the name comparison it always used. */
```

### ---------- ONE STRING PER ITEM, BUILT ONCE, COMPARED WITH `<`

in `stuffFind`

```
/* ---------- ONE STRING PER ITEM, BUILT ONCE, COMPARED WITH `<` ---------------------------------
     THE COMPARATOR WAS FOUR `cmpText` CALLS AND `cmpText` IS `localeCompare` WITH OPTIONS, which is
     the most expensive string comparison the language offers. Sorting 4,045 items is about 48,000
     comparisons, so it ran up to two hundred thousand times to draw one screen: MEASURED at 88 ms
     of the 110 it took to produce the list, on every filter change and every search.

     SO THE ORDER IS BAKED INTO A KEY and the sort is a plain string compare. `sortKey_` reproduces
     what the comparator said — case-insensitive, and numbers compared as numbers — by lowercasing
     and zero-padding every run of digits, which is what `numeric: true` does. Held on the item, so
     the second sort of the same items costs nothing at all.

     THE SECOND AND THIRD TERMS WERE DEAD AND NOTHING WAS WRONG, which is worth writing down because
     the obvious conclusion is the opposite one. `qNumber` and `qPart` have not been set by anything
     since `questionItems` was rewritten — the facet list even records them as "written by
     `questionItems`, which drew the duplicate cards these existed to narrow" — so two of the four
     terms compared `0` with `0` and `''` with `''` on every question in the library.

     I READ THAT AS Q1, Q10, Q11, Q12, Q2 DOWN EVERY PAPER AND WENT TO MEASURE IT. It is not:
     `cmpText` carries `numeric: true`, so the LAST term, on the name, already put Q2 before Q10.
     A dead reader standing over a live one — the same shape as `d = libraryInto_(…)`, where the
     broken line came after the useful work and the correct fallback hid it. Checked on the current
     file and on the one before this change: identical order, 32 parts, both ways.

     THEY ARE WRITTEN AGAIN ANYWAY, because the key below needs them stated rather than implied: it
     is built from the fields, and a key that leans on a number happening to be inside a name is a
     key that breaks the day a name changes. This is an intent made explicit, not a bug fixed. */
```

### THE NARROWING ITSELF, split out of `stuffFind` so `stuffFiltered` can run it over the list it already has rather than over the whole library — see the note

top level, before `stuffWords_`

```
/* THE NARROWING ITSELF, split out of `stuffFind` so `stuffFiltered` can run it over the list it
   already has rather than over the whole library — see the note there. One body, two callers, so
   the two cannot disagree about what a filter or a word means. */
```

### ---------- AN ANSWER GIVEN INSIDE A BUCKET REFINES IT, IT DOES NOT SIT BESIDE IT

in `stuffNarrow_`

```
/* ---------- AN ANSWER GIVEN INSIDE A BUCKET REFINES IT, IT DOES NOT SIT BESIDE IT --------------
     FOUND WHILE MEASURING THE BUNDLE, and it is the owner's own example: Maths · Past paper · GCSE ·
     Higher · `2017 & 2018` is 362 questions, the Sitting question is asked again inside the bucket,
     and pressing `Summer 2017` left **362**. Two chips on one field are ORed by the line below —
     "either / both" — so the bucket went on keeping everything the answer inside it was meant to
     remove. The chip said Summer 2017 and the list said four sittings.

     NOTHING COULD SEE IT. `check-funnel.js`'s promise test presses each answer through `filterHit`
     on its own, which is exactly right about the answer and blind to the OR it is then put into.

     A BUCKET FOLLOWED BY ANOTHER CHIP ON THE SAME FIELD STANDS DOWN. That is the only way a second
     chip on one field arrives — `nextFacet` settles a field the moment a non-bucket chip answers it,
     so the re-ask inside a bucket is the one route — and `facetWithin_` already reads the LAST
     bucket on a field as the one the question is being asked inside. Taking the chip off again puts
     the bucket back in force, because the rule is read off the list rather than stored. */
```

### ---------- "q8", "8ii", "1dii", "1d(ii)", "Q 8" IS A QUESTION, NOT FOUR LETTERS

in `stuffNarrow_`

```
/* ---------- "q8", "8ii", "1dii", "1d(ii)", "Q 8" IS A QUESTION, NOT FOUR LETTERS -----------------
     THE MULTI-PART AUDIT, FINDING 10, in 1F: "q2" gave fifteen results (Q2 and Q20 to Q27, every
     haystack holding the letters), "q8ii", "8ii" and "1dii" gave nothing, and "Q 8" gave eighteen
     that had nothing to do with Q8 -- the words "q" and "8" are somewhere in nearly every paper. A
     tutor typing a question's number is asking for that question, so a box that reads as one is
     matched exactly, by number and part, inside whatever the funnel has already narrowed to (a paper,
     if one is chosen). Anything that does not read as one is words, as before. */
```

### AN ITEM THAT STANDS FOR OTHERS IS ASKED ABOUT THEM.

in `stuffNarrow_`

```
/* AN ITEM THAT STANDS FOR OTHERS IS ASKED ABOUT THEM. `holds(words)` is the Bible's cover, whose
     31,102 verses are on no list here: its own haystack was every book's words in one string, so it
     answered `torah gospels` that no verse does (see `bibleHolds_`). Every other item has no `holds`
     and is asked its haystack, as before. */
```

### WHAT A REFERENCE LOOKS LIKE:

top level, before `QREF_PART`

```
/* WHAT A REFERENCE LOOKS LIKE: an optional "q", the number, and a part -- a letter, a numeral, or a
   letter and a numeral, bracketed or not (`partBare_` takes the brackets off). WITHOUT THE "q" IT HAS
   TO CARRY A NUMERAL WITH AN "i" IN IT ("8ii", "1dii", "3iv"): a bare "8" is a number somebody may be
   searching the words for, and "2x" is algebra before it is Q2(x). */
```

### ---------- SORTED ONCE, NOT ONCE PER FILTER

top level, before `SORTED_ITEMS`

```
/* ---------- SORTED ONCE, NOT ONCE PER FILTER -----------------------------------------------------
   THE SORT WAS THE LAST LINE OF `stuffFind`, so it ran over the FILTERED list on every tap and
   every keystroke -- 5,226 items after one answer, which is about sixty thousand comparisons to
   draw one screen. Measured at 12x CPU it was most of what was left once the DOM stopped being the
   problem.

   AND NONE OF IT DEPENDED ON THE FILTER. The order is `_sk`, a string built from the item and held
   on it; two items compare the same way whoever else is in the list. `Array.prototype.filter`
   keeps the order of what it is given -- so sorting the SOURCE once and filtering that is the same
   list in the same order, and a filter change stops paying for a sort at all.

   ON A COPY, because `stuffItems()` hands back a memoised array that other readers hold -- the
   saved list keys its own tally on that array's identity, and sorting it underneath them would be
   the fault `stuffItemsAll_` was split out to avoid. Cached in a `WeakMap` on the source array for
   the same reason `facetTally_` is: a new list is a new array, so there is no key to get wrong and
   nothing to invalidate. */
```

### PADDED SO THE ALPHABET AGREES WITH ARITHMETIC.

top level, before `sortKey_`

```
/* PADDED SO THE ALPHABET AGREES WITH ARITHMETIC. "Paper 10" sorts before "Paper 2" on letters and
   after it on numbers, and the second is what a person means; `localeCompare`'s `numeric: true`
   knows that and a plain `<` does not, so every run of digits is widened to a fixed width and the
   two orders become the same order. Eight digits is wider than any number this app holds.
   `\u0000` BETWEEN THE PARTS, because it sorts below every printable character — so a short field
   always loses to a longer one that starts the same way, which is what a tie-break means. */
```

### ---------- AND THE PAPER ITSELF STRAIGHT AFTER ITS NAME, THEN THE PART BY `qPartKey`

top level, before `sortKey_`

```
/* ---------- AND THE PAPER ITSELF STRAIGHT AFTER ITS NAME, THEN THE PART BY `qPartKey` --------------
   TWO PAPERS CAN SHARE A NAME. June 2024 1F and 1H are both "Paper 1 (Non-calculator) — June 2024",
   so with the name first and the number second their parts interleaved: H13a, F13a (the wallet),
   H13b "these 150 people" -- which reads as if it follows the wallet. Measured by the multi-part
   audit: 168 questions split that way across the library, only when Tier and Paper were both skipped
   or in a mixed search. The id is unique, so the second term settles every tie the name leaves.

   THE PART BY ITS VALUE, NOT ITS LETTERS: `qPartKey` is worked out per question by `partKeys_` (see
   there), because "ix" sorted before "v" and part 10 before part 2 on letters, and the obvious fix --
   numerals by value everywhere -- puts h, i, j out of order. Anything that is not a question has no
   key and falls through to the letters, as it always did. */
```

### ---------- CONTENT CARDS AFTER THE REST, IN THE ORDER THEY TEACH — AND FIRST ONLY WHEN THEY ARE ASKED FOR

top level, before `sortKey_`

```
/* ---------- CONTENT CARDS AFTER THE REST, IN THE ORDER THEY TEACH — AND FIRST ONLY WHEN THEY ARE ASKED FOR
   *"begin adding topic tags so students can immediately find what they need"* — the owner, 12 Oct. The
   order here is the alphabet of a paper's name, and a card's `Maths · GCSE` filed it among the papers:
   typing `histograms` put the Histograms card at hit 32 of 47, under thirty past-paper parts.
   THE FIRST ANSWER WAS "A CONTENT CARD LEADS ANY LIST IT IS IN", and Find is where the questions are
   done: Maths · GCSE then opened on thirty-six cards of reading before its first question, and a search
   for `work out` — words in every worked example — put a page of cards over every question it found
   (check/press.js's results state, 13 Oct). So in a list a card comes AFTER everything else, in the
   file's own order among themselves (the book's id, then the number — the order they teach in; their
   names' alphabet would put Averages before The statistical enquiry cycle), and `stuffFind` lifts to the
   front only the cards a typed search NAMES: every word in the card's title or its topics, so
   `histograms` and `surds` lead with their card and `work out` leads with the questions. Every other
   item's key gains the same leading `1`, so their order among themselves is exactly what it was. */
```

### How many cards to a page.

top level, before `FIND_MEMO`

```
/* How many cards to a page. Eight fills a phone without quite filling it — a page that ends
   exactly at the fold gives no sign there is anything below, and one that overflows makes you
   scroll before you can swipe. If a chunk does overflow, the page scrolls and the pager waits,
   which is the same rule every other widget follows. */
```

### THE FILTERED LIST, held between calls.

top level, before `FIND_MEMO`

```
/* THE FILTERED LIST, held between calls.
   Searching, grouping, sorting and paging all want the same array, and each was recomputing it —
   `stuffItems` flattens four hundred topics and twenty shop rows, `stuffFind` filters and sorts
   them, and that ran four times to draw one screen and again on every page turn.
   Keyed on everything that can change the answer. */
```

### KEYED ON THE PAYLOAD ITSELF, by object identity, not on `DATA.version`.

in `stuffFiltered`

```
/* KEYED ON THE PAYLOAD ITSELF, by object identity, not on `DATA.version`.
     `version` is the BACKEND's version string — it changes when you deploy, and not when anybody
     edits a row. So a reload that brought back four hundred changed resources produced the same
     key as the reload before it, and this handed back the list it built last time. Editing a
     resource and refreshing showed the old one, for as long as the tab stayed open, and nothing
     anywhere said so.
     A new payload is a new object. That is the whole test, it costs one comparison, and it is the
     same one `allTopics` already uses one level down — which is why THAT was correct and this was
     not. */
```

### ---------- AND WHICH LIST, BECAUSE THERE ARE TWO

in `stuffFiltered`

```
/* ---------- AND WHICH LIST, BECAUSE THERE ARE TWO --------------------------------------------------
     Find's own, or — while a Bible chip is on — the Bible's verses instead (`bibleInside_`, and the
     head of the Bible section for why they are not one list). THE MEMO IS HELD TO THE LIST TOO: the
     same chips over a different list are a different answer, and this is what says so when an admin
     is made a tutor by `roles-save` without signing out — the chips are unchanged, the verses are no
     longer theirs, and without this line they went on being handed the verses they had. */
```

### ---------- A TAP ONLY EVER NARROWS, SO IT NARROWS WHAT IS ALREADY HERE

in `stuffFiltered`

```
/* ---------- A TAP ONLY EVER NARROWS, SO IT NARROWS WHAT IS ALREADY HERE --------------------------
     EVERY ANSWER IN THE FUNNEL RE-FILTERED THE WHOLE LIBRARY FROM NOTHING — five thousand items
     through every chip, again, to add one chip. MEASURED at 8x CPU: `stuffFind` was about 70 ms of
     every tap, the largest single piece of the handler behind "when students click questions it
     takes ages to load on phone".
     A chip on a field nothing has answered yet, or a word that contains every word before it, can
     only take things AWAY — filters on different fields are ANDed, and a haystack holding `fract`
     holds `fra` — so the answer is the last list with the new test applied, in the same order,
     because `filter` keeps order. Anything else — a chip dropped, a second answer to a field already
     answered (which ORs), a word deleted — goes the long way, exactly as before.
     `FIND_MEMO.key` IS CLEARED BY `me.js` when the list has to be rebuilt, so a null key is a memo
     that may not be narrowed from; and `all` has to be the same array, or the library underneath
     it has changed. */
```

### ---------- THE PAGES, WHICH ARE NOT THE SAME LIST AS THE RESULTS

top level, before `STUFF_PAGES`

```
/* ---------- THE PAGES, WHICH ARE NOT THE SAME LIST AS THE RESULTS -----------------------------
   A PRACTICAL IS ONE RESULT AND FOUR PAGES — its card and picture, the kit, the method and the
   worksheet (see `pageParts_`) — and a question with a picture is two, its words and its figure.
   Expanding it HERE, where pages are built, and nowhere upstream is
   the whole care: `stuffFiltered()` is what every count reads — `facetTally_`, `nextFacet`, the
   "N of M" above the question, `check-funnel.js` — and a practical expanded there would be counted
   four times in every one of them and answer every facet four times over.

   So the results stay the results, and this is the one list the pager, the page count and the
   fill all read — three readers of one array, so the dial and the strip cannot disagree about how
   many pages there are. Memoised on the results array itself: a new filter is a new array. */
```

### AND A PART FOUND ON ITS OWN BRINGS ITS WHOLE QUESTION -- see `wholeQuestions_`.

in `stuffPages_`

```
/* AND A PART FOUND ON ITS OWN BRINGS ITS WHOLE QUESTION -- see `wholeQuestions_`. Here, where pages
     are built, and not in `stuffFiltered`: every count the funnel makes is of what MATCHED, and the
     parts brought along are reading, not results. */
```

### AND NO ANSWER AT ALL when `Questions` is -- *"answers shouldnt even be showing up when all ive done is clicked questions"* (8 Oct; see `kindLabel`).

in `stuffPages_`

```
/* AND NO ANSWER AT ALL when `Questions` is -- *"answers shouldnt even be showing up when all ive done
     is clicked questions"* (8 Oct; see `kindLabel`). The same cut the other way: the question's opening,
     its figures and its card, each the page it would have been, and its answer page left out. Answers
     wins if somebody has chosen both, because that chip is the one that asks for something. */
```

### ---------- THE LAST LINE UNDER A CHOSEN PAPER COUNTS WHAT THE STRIP HOLDS

top level, before `HEALTH_MEMO`

```
/* ---------- THE LAST LINE UNDER A CHOSEN PAPER COUNTS WHAT THE STRIP HOLDS -------------------------
   IT COUNTED WHAT MATCHED, and the strip stopped being that when a part found alone began bringing its
   whole question (`wholeQuestions_`): "q23b" said "its one question" over Q23a and Q23b -- right, one
   question, by luck -- and "q8" said "its 2 questions" over the two parts of ONE. Answers only said
   "its 41 questions" over forty-one answers. So it counts QUESTIONS, a question being one number on one
   paper (`qId_`), over the strip as it is built; answers when the view is answers.

   AND A SEARCH IS NOT "THE PAPER, IN ORDER". Inside a paper, "q23" is one question of it: the line names
   it -- "Swipe up for Q23" -- rather than claiming the whole paper is below. */
```

### A PAPER'S HEALTH, READ BY THE FINDER — the tag, the optional row of answers, and the list.

top level, before `HEALTH_MEMO`

```
/* ==================================================================================================
   A PAPER'S HEALTH, READ BY THE FINDER — the tag, the optional row of answers, and the list.
   The score is `paperHealth_` in library.js; everything here only reads it (docs/history/354).

   MEMOISED ON `LIBRARY_ROWS` ITSELF: the rows are held for the life of the page and replaced whole
   when the library is fetched again, so the identity test is the whole cache rule — the `TOPICS_MEMO`
   shape. Walked once, ~10,000 rows, on the first card that asks.

   ON `paper_id` AND NOT `paperIdOf_`, which falls back to the `paper` column — `1`, which paper of the
   set — and would hand every Paper 1 the health of whichever paper is filed under the id `1`. */
```

### ---------- THE OPTIONAL ROWS: EVERY TAG THE FUNNEL DOES NOT ASK, AS A DOOR

top level, before `tagDoors_`

```
/* ---------- THE OPTIONAL ROWS: EVERY TAG THE FUNNEL DOES NOT ASK, AS A DOOR ---------------------------
   A `tagOnly` facet is never asked (`nextFacet` skips it) -- Health on every list, and once a paper is
   chosen its Question, Part, Sub-part, Page, Pages, Marks and What you need. This is how each is
   PICKED, so every tag a card wears is an answer the finder offers (the owner, 12 Oct): one small
   labelled row per facet, under the question being asked or the paper's own end, each answer the same
   `facet-pick` press as any other, so its chip, its ✕ and `filterHit` are the ones every answer uses.
   ASKED OF EACH FACET ALIKE: not answered yet (a band like `1–10` is half an answer and opens again),
   what it waits for already asked (`FACET_NEEDS_FIRST`), and two answers or more -- a row whose every
   tap leaves the list as it was is the "Doesn't matter" with a count `stuffQuestion` refuses. Was
   `healthDoor_`, the same rules for one facet (docs/history/354, 355). */
```

### `.tag-answers`, NOT `.answers`:

in `tagDoors_`

```
/* `.tag-answers`, NOT `.answers`: that class is read across the checks as THE question on the
       page, and check/states.js's year folder found `Health` among its Year answers and stopped
       measuring. Styled as one rule with it in style.css. */
```

### ---------- WHAT IS WRONG, ONE TAP AWAY

top level, before `healthTiles_`

```
/* ---------- WHAT IS WRONG, ONE TAP AWAY ------------------------------------------------------------
   A TILE UNDER A CHOSEN PAPER (a THING has tiles), opening the list `paperHealth_` wrote: one line per
   fault, by question, in the words the owner fixes from — "Q4b — no answer", "Q7 — needs a picture,
   none drawn", "Paper — marks add to 76 of 80". The number is in the tile's name, so a screen reader
   hears the score before it opens anything. */
```

### IN THE CARD'S OWN WORDS FOR THE QUESTION.

in `healthListHtml_`

```
/* IN THE CARD'S OWN WORDS FOR THE QUESTION. `paperHealth_` can only join the row's two cells, which
     for AQA is `Q21i` where the card says `Q2.1i`; the item's `name` is the card's own reference
     (`Q2.1(i)`, the tags [Q2] [.1] [i] read together), so a line here names the card to go and find. */
```

### ---------- THE PAPER'S OWN PAGE: ITS COVER, WHERE TO GO, AND ITS DOORS

top level, before `paperCover_`

```
/* ---------- THE PAPER'S OWN PAGE: ITS COVER, WHERE TO GO, AND ITS DOORS -------------------------------
   THE COVER LINE IS WHAT LEFT THE TAG ROW AND IS STILL TRUE: the paper's whole name with its qualifier
   (`Paper 1: Arithmetic — May 2019`) and the day it was sat where the row knows it (`satOn_`, the only
   reader `exam_date` has). Both were tags the finder could not pick -- a grey `Arithmetic`, a purple
   `sat Friday 10 May` -- so they are said once here, about the paper, in words (docs/history/355).
   THEN THE DOORS (`tagDoors_`): the question, part, page, marks and kit of THIS paper, offered and never
   asked, so picking [Q7] narrows the paper and the funnel stays ended (the 2 Oct rule). */
```

### ---------- A SEARCH HIT ON ONE PART BRINGS THE REST OF ITS QUESTION, IN ORDER

top level, before `qId_`

```
/* ---------- A SEARCH HIT ON ONE PART BRINGS THE REST OF ITS QUESTION, IN ORDER ---------------------
   THE MULTI-PART AUDIT, FINDING 1, and the worst of them on a phone: a search or a topic chip found
   Q8(ii) "Give a reason for your answer" with no Q8(i), and 2H Q14b "Work out an estimate for the
   distance…" with no graph, because the graph lives on Q14a. In 506 of the 776 multi-part questions
   the opening and the picture are stored on part (a) -- so a later part reached alone arrived with
   nothing to work from, and looked complete.

   SO A QUESTION IS DRAWN WHOLE WHEREVER ANY PART OF IT MATCHED: its opening and figures, every part
   in the paper's order, each part's answer straight after it. In the place its first matching part
   holds in the results, once however many of its parts matched. The part that matched is reached
   exactly where it always was -- `stuffPageOf_(x)` lands on it, the earlier parts one swipe behind.
   THE SIBLINGS ARE THE FUNNEL'S OWN ITEMS (`stuffItems`, in `stuffSorted_`'s order), so a part
   brought along is the same object a paper filter would have found, and its answer box and its pen
   are the same ones. Inside a chosen paper nothing changes: every part is already there. */
```

### THE PAGE AN ITEM STARTS ON, counted from the first result.

top level, before `stuffPageOf_`

```
/* THE PAGE AN ITEM STARTS ON, counted from the first result. For anything that turns to a result by
   its position in `stuffFiltered()` — without this it would land a page early for every practical
   in front of it, and on a worksheet rather than the thing it asked for. */
```

### ---------- AND BACK ONTO THE CARD YOU WERE ON WHEN THE LIST UNDER IT CHANGES

top level, before `stuffPageId_`

```
/* ---------- AND BACK ONTO THE CARD YOU WERE ON WHEN THE LIST UNDER IT CHANGES -------------------------
   `PAGE.stuff` IS A NUMBER, and a redraw that keeps your place keeps the number. That is right while the
   list is the same list, and it is how a child signing in landed on the card they left (docs/history/318)
   — but the payload that lands after signing in is that person's, and a signed-in child can be shown
   more (their friends answer a search; the Bible's index lands for an admin and joins the list mid-read).
   Measured in check-flow: one more row in front of June 2023 1H Q13 and the redraw put the child on Q12,
   the same page number on a different card, with nothing anywhere saying why.

   SO A FILLED PAGE SAYS WHICH CARD IT IS (`FIND_AT`, written by `stuffFillOne_`, read only while the page
   is still marked filled), and the two redraws that keep your place — `screen('stuff')` and
   `paintStuff(true)` — look that card up in the new list and stand on it. ASKED OF THE PAGE ON THE SCREEN
   RATHER THAN REMEMBERED, because the page is what the child is actually looking at; a number noted when
   the page was turned is a guess the moment anything in front of it moves. AND ONLY FOR THE SAME QUESTION:
   a page drawn for other chips is not the place the new chips were asked for, and the redraws that change
   the chips go to the question as they always did. A card that is no longer there leaves the number as
   it was, which is the behaviour before this. */
```

### ---------- THE COLLECTION WENT, AND WHAT IT KNEW IS IN THE FACET LIST

top level, before `showingWidgets`

```
/* ---------- THE COLLECTION WENT, AND WHAT IT KNEW IS IN THE FACET LIST ---------------------------
   `collectionAxes_`, `groupItems_`, `one_` and `plural_` WERE HERE, with `collect: true` on the
   facet they served. Together they drew a line above the funnel — "or the 227 papers these are in"
   — that turned the results into one card per paper until you pressed it again.

   THE ARITHMETIC IN IT WAS RIGHT AND IS WORTH KEEPING IN PROSE: a field with one distinct value
   per row identifies a row, a field with ~16 rows each is a collection, a field with 654 rows each
   is a category, and the boundary between the last two is `FACET_MAX_ANSWERS`. That is still true
   and it is still what decides whether `Paper` is asked.

   WHAT WAS WRONG WAS THE SCREEN. Two ways of narrowing one list, stacked, one of them a sentence
   in the corner — you had to know what "or the 227 papers these are in" meant before you could use
   it, and it named a thing the funnel could simply ASK about once the list was small enough. It
   does: see `paperId` in FACETS. One question, one chip, one ✕, and nothing to explain.

   `kind: 'group'` WENT WITH IT, and the `group-open` tile in tiles.js. */
```

### ARE WE LOOKING AT WIDGETS AND NOTHING ELSE?

top level, before `showingWidgets`

```
/**
 * ARE WE LOOKING AT WIDGETS AND NOTHING ELSE?
 *
 * If so they stop being cards and become the pages themselves — one to a screen, swipe between
 * them, already running. A game you have to open is not a game, and a calculator behind a tap is a
 * calculator you use the phone's own one instead.
 *
 * ALL of them, not some. A search matching a tool and three resources cannot give one thing a
 * whole screen and eight things another, so a mixed result stays a list of cards and the widget
 * card opens in the sheet as before. The whole-screen version is for when you have said Tools or
 * Games and there is nothing else in the way.
 */
```

### ONE THING TO A PAGE, ALWAYS.

top level, before `stuffPerPage`

```
/**
 * ONE THING TO A PAGE, ALWAYS.
 *
 * IT WAS EIGHT, and a widget was the exception at one. So a swipe down on this screen jumped past
 * eight results at a time while the same swipe on the Book screen moved to the next receipt — two
 * screens made of the same grid, answering the same gesture with different amounts of movement, and
 * nothing about either of them says which you are on.
 *
 * A PAGE IS ONE THING. That is what the pager is for and it is what makes the whole app read as a
 * deck rather than a list: you swipe to the next thing, not to the next screenful of things. Eight
 * to a page made this screen a scrolling list wearing a pager, which is the one thing the layout
 * was rebuilt to stop being.
 *
 * IT COSTS NOTHING TO BUILD. Pages are filled two either side of where you are and emptied behind
 * you — so five exist at any moment whether the library is forty items or four hundred. The count
 * changes; the work does not.
 */
```

### HOW MANY PAGES, WITHOUT BUILDING ANY OF THEM.

top level, before `stuffAsked`

```
/**
 * HOW MANY PAGES, WITHOUT BUILDING ANY OF THEM.
 *
 * This used to render every page's markup and return the length of the array — half a megabyte of
 * HTML to produce the number 59, and it ran on every single page turn because the pager asks for
 * the page names each time it moves. Drawing the screen took a fifth of a second with a library
 * this size and would take longer with every resource added.
 *
 * A page holds a fixed number of cards, so the count is a division.
 */
```

### ---------- WHERE THE RESULTS START

top level, before `jobPage_`

```
/* ---------- WHERE THE RESULTS START ----------------------------------------------------------------
   THE QUESTION USED TO BE PAGE ZERO and three separate pieces of code knew it: the fill loop began
   at 1, every result read `items[i - 1]`, and `paintStuff` kept "the first page" and rebuilt the
   rest. With the saved pages in front of it none of those is true any more, and the failure would
   not have been an error — it would have been results drawn one page out, silently, only for people
   who had starred something.

   SO IT IS ASKED RATHER THAN ASSUMED, once, off the id on the question page itself. Nothing counts
   saved things to work it out, which matters because the count can change between a render and a
   fill and the two would disagree exactly when somebody had just pressed a star.

   ONE BEFORE ANYTHING IS DRAWN. `paintStuff` inserts the pages around a question page that already
   exists, so there is always one to find by the time this is asked in anger. */
```

### ---------- IS THE FUNNEL ASKING ABOUT BOOKING?

top level, before `jobPage_`

```
/* ---------- IS THE FUNNEL ASKING ABOUT BOOKING? ----------------------------------------------------
   `forLabel` IS THE FIRST QUESTION — the one whose answer is Booking, Learning, Shop, Games or
   Friends. A filter on it is what says which errand somebody is on, and it is the only signal here:
   nothing counts kinds or reads the results, so this stays true however the funnel is answered
   afterwards.

   NOT SIGNED IN, NOTHING TO DRAW. The booker needs somebody to book for, and the sessions are
   somebody's own — `bookBlocks` already returns the offers alone in that case, which is right. */
```

### ONE SESSION, OPENED OUT — and it is the receipt and nothing else now, with every action on its foot.

top level, before `jobPage_`

```
/* ONE SESSION, OPENED OUT — and it is the receipt and nothing else now, with every action on its
   foot. The way in for somebody not on it yet was a third piece stacked under the paper
   (`joinBlock`); it is a tile in the same row as Pay and Share, and its seats are a row of the
   document. See the last note above `jobPage_`. */
```

### ---------- "THE PAPER, AND NOTHING ELSE" WAS TRUE WHILE SOMETHING ELSE ADDED THE TILES

top level, before `jobPage_`

```
/* ---------- "THE PAPER, AND NOTHING ELSE" WAS TRUE WHILE SOMETHING ELSE ADDED THE TILES ----------
   THE NOTE THAT STOOD HERE said paying and withdrawing are marks in the tile row *under the card*,
   `jobTiles_` in tiles.js, "which is where every other kind keeps its actions". That was exactly
   right and it depended on a caller that no longer exists: `stuffCard` appends `cardTiles_` to
   every card it draws, and a receipt was a card it drew. Booking left the funnel, `bookBlocks`
   draws these pages instead, and **the tile row did not come with them** — so on the Booking column
   a client had no way to pay for an accepted session and an admin had no Accept or Decline.

   THAT IS A REGRESSION THIS SESSION MADE, and it is the `meCard` fault twice in one week: a builder
   that was only ever complete because of what wrapped it, moved somewhere nothing wraps it. Both
   were found by asking what a function is FOR rather than by anything running, which is the honest
   answer about what the checks can and cannot see.

   SO THE PAGE IS THE WHOLE DOCUMENT NOW, and there is one of it. `on('job')` used to stack the same
   pieces by hand into a sheet — receipt, join block, then an admin's tiles and the paragraph under
   them — which is two renderers for one session, in two files, differing by a `moneyBlock`. This is
   that stack, once, and the sheet is gone. (`moneyBlock` has gone too — see book.js.)

   AND THE ADMIN PARAGRAPH WENT, BECAUSE EVERY WARNING IN IT IS DELIVERED AT THE MOMENT OF THE
   PRESS. It was four sentences of consequences under the row, read once and then scrolled past on
   every session an admin ever opened. Measured before removing it: `job-answer` goes through
   `sure_(el, 'Turn it down?')`, `job-delete` through `sure_(el, 'End it?')`, and `job-paid` opens
   the `askHow_` sheet, which says in its own words that it is the whole audit trail and is recorded
   as marked by you. Each tile already carries its own `note` — 'settles the terms', 'turns it
   down', 'cash or transfer', 'ends it for everybody'. So nothing is lost, and what is gained is
   that the sentence arrives when somebody is about to act on it rather than a screen earlier.

   `jobAdminTiles_`'s own note still argues for a paragraph under the row rather than longer tiles,
   and it is still right about the shape — CLAUDE.md's "A THING has tiles; a FORM has buttons" says
   one paragraph, not one per button. What changed is that there is nothing left for it to say. */
```

### ---------- AND THE TILES ARE ON THE PAPER NOW, NOT UNDER IT

top level, before `jobPage_`

```
/* ---------- AND THE TILES ARE ON THE PAPER NOW, NOT UNDER IT ---------------------------------------
   ASKED FOR AS *"no floating tiles for already booked sessions"*. The row this built sat after the
   receipt, on a pane that is transparent because the receipt IS the box — so Withdraw and an
   admin's Delete hung on black under a card they plainly belong to, which is the exact fault the
   booking form's own two tiles were moved off for (see the note at `r.foot` in `receiptHtml`).

   SO THEY ARE THE RECEIPT'S FOOT: `.tile-row rc-tiles`, the class the form's row carries, handed to
   `jobReceipt`. And `jobAdminTiles_` returns tiles rather than a row of its own — it used to, and
   this wrapped it in a second one, so an admin's four sat in a row inside a row. One row, the
   client's actions first and the admin's after, which is the order `jobAdminTiles_`'s note gives.

   A PAID SESSION OFFERS NO PAY TILE, and that is `jobTiles_`'s own test: Pay is offered while the
   booking is accepted and your seat is not yet Paying or Booked. An empty row is no row at all —
   a foot with nothing on it is a rule under the total pointing at nothing. */
```

### ---------- AND THE WAY IN, FOR SOMEBODY NOT ON IT, IS IN THE SAME ROW

top level, before `jobPage_`

```
/* ---------- AND THE WAY IN, FOR SOMEBODY NOT ON IT, IS IN THE SAME ROW -----------------------------
   ASKED FOR AS *"the session booking thing at the bottom of receipt should be a line in the
   booking."* After the receipt this used to append `joinBlock(j)` — "2 seats left on this class.
   £19.00 a seat.", the list's tally, a full-width `Take a seat` and a faint paragraph — on the
   argument written beside it that the offer was "facts rather than buttons, so it is not a tile".
   Half right: the facts were facts, and they were ALREADY rows of this paper — `Sharing` and the
   total — one of them contradicting the block. The button was a button, on a thing.

   SO THE PAGE IS THE RECEIPT, FULL STOP. `jobTiles_` answers "what can you do with this session"
   for a stranger as well now — `Take a seat` or `Ask to join`, through `joinTile_` — so it lands
   first in this row exactly where Pay lands for somebody on it, with Share after and an admin's
   decisions last. Nothing is drawn under the paper for anybody. */
```

### ---------- AND SHARE, WHICH THE FORM HAD AND THE BOOKING ITSELF DID NOT

in `tiles`

```
/* ---------- AND SHARE, WHICH THE FORM HAD AND THE BOOKING ITSELF DID NOT -------------------
       *"make sure sharing booking is an identical … png … of the booking reciept"* — and the one
       receipt a family actually sends somebody is the session that exists, not the form before it
       was asked for. The same tile and the same handler as the form's: `book-share` walks up to the
       `.rc` it is on, so it needs no id. After the client's own two and before an admin's, because
       it is an ordinary action and those are decisions. */
```

### ---------- `goFor_` WAS HERE, AND IT WAS NAVIGATING TO ANSWERS THAT NO LONGER EXIST

top level, before `bookingPages_`

```
/* ---------- `goFor_` WAS HERE, AND IT WAS NAVIGATING TO ANSWERS THAT NO LONGER EXIST --------------
   IT REPLACED `go('me')` AND `go('posts')` when the columns became answers, and its note gave the
   right reason: `go` falls back to `TABS[0]` for an id it does not know, so a person told to sign in
   was silently dropped on the search box with no sign-in card in sight — *"a fallback that lands
   somewhere plausible is worse than one that lands nowhere, because nobody reports it."*

   THEN THE ANSWERS WERE DELETED AND THE CALLS WERE NOT. `You` and `People` went with the `me` kind
   and the `People` group; `Posts` went when the feed stopped being built here. Nothing declares any
   of the three, so `goFor_('You')` set a filter that matches nothing at all — and that is worse than
   the fallback it was written to avoid, because it does not merely fail to navigate:

     · it CLEARS `STUFF.q`, so whatever was typed in the search box is thrown away
     · it REPLACES `STUFF.filters`, so every chip somebody had narrowed with is gone
     · it leaves ONE dead chip reading `You`, which no item can answer, over zero results
     · and `paintStuff` deliberately never rewrites `#stuff-q`, so the box still shows the old text
       while the results ignore it

   MEASURED: signed out, pressing a reaction on the feed toasted "Sign in to react", offered no way
   to sign in, and left the Find screen holding 0 of 4,110 behind a chip nobody set. Three callers
   did it — the reaction, and both `resource.js` sign-in guards — and two more called
   `goFor_('Posts')` with `PAGE.feed` set on the line beside them, which says plainly that the
   intent was the feed COLUMN.

   SO THE COLUMNS ARE THE NAVIGATION AGAIN, and the note's original objection no longer applies:
   `account` and `feed` are real ids in `TABS`, so `go` does not fall back, and `accountPages_`
   returns `signInCard_()` for a visitor who is not signed in — which is the thing all three sites
   were trying to reach. One call each, and nothing to keep in step with a list of group names.

   `forIs_` STAYS. `bookingPages_` and `feedPages_` still read it, and a `kinds` row can still put a
   kind into either group and make the answer real — see `FUNNEL_NOT_FOR`. What has gone is the app
   setting that filter on somebody's behalf. */
```

### ---------- THE COLUMN ASKS FOR IT DIRECTLY

in `bookingPages_`

```
/* ---------- THE COLUMN ASKS FOR IT DIRECTLY ------------------------------------------------------
     `forIs_` READS THE FUNNEL'S STATE, and the booking column has none — nobody answered `What for`
     to get there, they swiped. Without this the column would build nothing and show a blank screen,
     which is the same shape of fault as a tab with no section.

     THE REST OF THE FUNCTION IS UNTOUCHED, deliberately: the form the column shows and the form the
     funnel shows are the same one, and a second copy for the column is a second thing to keep in
     step. */
```

### ---------- THE FORM IS THE ANSWER TO `Booking`, NOT TO EVERYTHING UNDER IT

in `bookingPages_`

```
/* ---------- THE FORM IS THE ANSWER TO `Booking`, NOT TO EVERYTHING UNDER IT --------------------
     IT FOLLOWED YOU DOWN. `forLabel · Booking` stays set for the whole branch, so narrowing to
     Classes, or Tutors, or Venues left the form sitting in front of the thing you had just asked
     for — a twelve-question document to swipe past on the way to a list of three tutors.

     ONE MORE ANSWER MEANS YOU ARE BROWSING. Booking on its own is somebody arranging a session and
     the form is what they came for. `Booking · Tutors` is somebody looking through tutors, and
     `Booking · Classes` is somebody checking what they are already in — neither is a person filling
     a form in, and the form has a page of its own to go back to the moment they clear that answer.

     THE SECOND QUESTION, NOT A LIST OF ITS ANSWERS. Written as "has `kindLabel` been answered at
     all", so a kind added later — a coupon, a pass, whatever comes next — needs nothing added
     here. A rule naming the answers it applies to is a rule that goes stale on the next one. */
```

### ---------- AND THE COLUMN IS EXEMPT FROM THIS TOO, WHICH IT WAS NOT

in `bookingPages_`

```
/* ---------- AND THE COLUMN IS EXEMPT FROM THIS TOO, WHICH IT WAS NOT -------------------------
     THE LINE FIVE ABOVE ALREADY SAYS WHY: the booking column has no funnel state, because nobody
     answered `What for` to get there — they swiped. That exemption was written for `forIs_` and
     not repeated here, so an answer given on a DIFFERENT SCREEN emptied this one.

     MEASURED: narrow the funnel to `What kind · Questions`, then repaint the booking column —
     which `load()` does after every save, and every `Try again` — and `bookingPages_` returns an
     empty list. The form, the receipt for the session you just booked and the basket all go, on
     the app's main column, with nothing on screen saying why. `go('booking')` alone does not do
     it, which is exactly why it survived: you have to narrow, swipe over, and then save something.

     FOUND BY A CHECK THAT COULD NOT REACH ITS SUBJECT, which is this repository's oldest shape:
     `check/ui.js` gained a state for the session receipt, the state repainted the column, and the
     column came back with zero pages — after the `stuff` states had left a `kindLabel` filter set. */
```

### ---------- NOT BEFORE THE PAYLOAD

in `bookingPages_`

```
/* ---------- NOT BEFORE THE PAYLOAD -----------------------------------------------------------------
     The tutors, the rooms, the prices and your own sessions all come with it, so before it lands the
     form was every row reading "—", an empty week, a Cost of "–" and no tutor to choose — measured on
     9 Oct with the payload held, and nothing on it said it was early. It is the one loader on a page of
     its own until then, as every column waits (`loading_`, shell.js); the form is drawn whole the
     moment the payload's repaint comes.
     ONLY FOR SOMEBODY SIGNED IN. Signed out, `bookBlocks` is one fixed sentence — "Sign in to book" —
     that needs nothing from the payload, and found by review this drew the loader in its place for the
     whole wait (fifteen seconds to the splash, up to the minute's deadline) on the second column a
     first-time visitor reaches: the loader shown for something that was not a wait. Account, Saved
     and Messages draw their sign-in cards at once; so does this. `awaiting_`, not `!LOADED`, so the
     quiet retry after a failed first payload is a wait here too (shell.js). */
```

### ---------- THE BASKET IS NOT HERE ANY MORE, AND IT WAS HERE FOR ONE GOOD REASON

in `bookingPages_`

```
/* ---------- THE BASKET IS NOT HERE ANY MORE, AND IT WAS HERE FOR ONE GOOD REASON --------------
     IT WAS A PAGE OF THIS COLUMN, appended in column mode only: a basket is the end of arranging a
     session rather than a thing you search for, so it belonged with the booking and not with the
     funnel. That argument was right about which of those two it is closer to and wrong about it
     being either — a basket is empty most of the time, so as a page it appeared and disappeared
     under somebody's thumb, which is the whole reason it has now lived in four places.

     IT IS A TOOL. `cartCard_` says why at length, and what is left here is one `return` — no page
     to count, so `stuffFirstResult_`, `paintStuff` and `screen('stuff')` have nothing to add up.
     Asked for as *"i want the cart to be a tool in the tool column."* */
```

### ---------- THE FEED, BEHIND ITS OWN ANSWER

top level, before `feedPages_`

```
/* ---------- THE FEED, BEHIND ITS OWN ANSWER -------------------------------------------------------
   POSTS WAS THE LEFT-HAND COLUMN AND IS AN ANSWER TO `What for` NOW. Every other column had already
   gone this way — Spotlight, Book, Basket — and the argument for keeping this one was that it is
   the screen somebody opens with no errand. That is a real argument and it loses to a simpler one:
   the app is a funnel, and a second way in is a second thing to maintain and a second place for a
   card to be forgotten.

   THE WHOLE FEED, NOT THE SEARCH RESULTS. The `post` kind above makes a post findable BY CAPTION,
   which is a different job — and results come back sorted by name, which for a feed would mean
   photographs in alphabetical order by caption. So this returns what the Posts screen returned:
   spotlight, the festive cards, the ＋, and the posts in the order the feed sorts them. Pinned
   first, then newest, exactly as before.

   AND SIGNING IN COMES WITH IT. It sat at the top of this feed because the feed was the screen
   nobody arrived at with an errand; the feed is still the least errand-like thing in the app, and
   the card travels with the thing it was placed above rather than being moved a third time. */
```

### ---------- `youPages_` WAS HERE AND LASTED ONE VERSION

top level, before `mineIs_`

```
/* ---------- `youPages_` WAS HERE AND LASTED ONE VERSION -------------------------------------------
   IT PUT THE OLD `You` COLUMN BEHIND AN ANSWER — the install prompt, the claims, the tiles, the
   version footer, then the card. What that showed on a real account was a page of build numbers
   between the question and the one card anybody wanted, which is the column's own emptiness made
   visible: there was never enough left on it to be worth a question.

   `meCard` IS THE WHOLE OF IT NOW and it is a result, not a page. The claims and the messages are
   still built by `meBlocks` and still reachable from the tiles on that card. */
```

### ---------- SIGNING IN AND OUT, ON A PAGE OF ITS OWN

top level, before `mineIs_`

```
/* ---------- SIGNING IN AND OUT, ON A PAGE OF ITS OWN ----------------------------------------------
   IT HAS MOVED FIVE TIMES: the far end of You, the top of the feed, both at once, the last row of
   your own pass, and the question card. Every one of those was an answer to "which card does it go
   on" — and the reason it kept moving is that it is not a card's business. It is the state the whole
   app is in.

   SO IT IS A PAGE, ON THE SAME SIDE AS THE OTHER THINGS THAT ARE YOURS. Saved and basket sit after
   the question because they are answers rather than questions; this is the same kind of thing and
   the same swipe. Nothing filters it, nothing scrolls past it, and it does not have to be squeezed
   onto a card that was drawn for another reason.

   A COLUMN, NOT A PAGE. It was briefly a page after the question, which put it at a position in a
   list — and that position moves with whatever you have narrowed, so the one control that must
   always be in the same place was the one thing that kept shifting. One swipe right, from anywhere,
   whatever is on screen. */
```

### ---------- WHICH ROW IS YOU, ASKED IN ONE PLACE

top level, before `mineIs_`

```
/* ---------- WHICH ROW IS YOU, ASKED IN ONE PLACE --------------------------------------------------
   IT WAS LOCAL TO `accountPages_` AND THERE WERE THREE OTHER COPIES OF IT. `gameOver` in receipt.js
   matched a student on handle alone and a tutor on `title` alone — two half-tests, either of which
   answers "not you" for somebody the other would have found, and both of them written out beside
   each other rather than asked. That is the fault this function exists to prevent, so it is a
   function rather than a local.

   THE ORDER IS `findPerson`'S ORDER and for its reason: an id beats a handle beats a name.
   `changePin` is the entry where matching a person by their display name was a real denial — the
   PIN you typed checked against somebody else's row, and you told you did not know your own.

   `t.name` IS THE FOURTH RUNG AND IT IS FOR THE STUDENT ROWS. A tutor row carries `title` and no
   `name`; a student row carries `name` and no `title`, so before this a student could only ever be
   matched by handle. Additive by construction: a tutor has no `name` key for the new rung to read,
   so nothing `accountPages_` already answered can change. */
```

### ---------- AND A STRANGER HAS NO ROW, WHICH THIS DID NOT HAVE TO KNOW BEFORE

in `mineIs_`

```
/* ---------- AND A STRANGER HAS NO ROW, WHICH THIS DID NOT HAVE TO KNOW BEFORE ------------------
     IT WAS LOCAL TO `accountPages_`, WHICH IS ONLY EVER DRAWN FOR SOMEBODY SIGNED IN, so `USER` was
     an object by the time any of these rungs read it. At file scope it is reachable from the high
     score board, which a stranger sees — and `USER.personId` on `null` throws.

     IT THREW INTO A `catch` THAT SWALLOWED IT. `toolsStart_` wraps each widget's `start` in its own
     try, so the game came up perfectly and the board beside it stayed an empty div, signed out, at
     every width. Found by the lab and not by looking: `check/ui.js` reported the state as not
     reached, which is precisely what that assertion is for. */
```

### ---------- AN ID ON BOTH SIDES DECIDES, AND THE NAME IS ONLY FOR A ROW WITHOUT ONE

in `mineIs_`

```
/* ---------- AN ID ON BOTH SIDES DECIDES, AND THE NAME IS ONLY FOR A ROW WITHOUT ONE ----------------------
     THE NAME RUNGS ANSWERED YES FOR A STRANGER. A parent called Ada Tutor, signed in, was handed the listed
     tutor Ada Tutor's row as her own card — by `title`, though both rows carried a `personId` and the two
     were different people (the review of docs/history/339). Before that note it drew the wrong face; after
     it, the row's id was not hers, so she was offered no Edit on her own card, while Settings — asking the
     same rungs whether she had a public card — took her name and picture off its pages too: nowhere left to
     edit either. So when the row and the session BOTH carry an id, the ids are the whole answer; the handle
     and the name rungs are for a row that came without one (an older payload, a score board's row). */
```

### ---------- YOUR OWN ROW, WHEREVER IT COMES FROM

top level, before `myCardRow_`

```
/* ---------- YOUR OWN ROW, WHEREVER IT COMES FROM ------------------------------------------------------
   Your row in `DATA.tutors` when you are listed staff — `mineIs_` — and otherwise one built from what
   signing in returned. LIFTED OUT OF `accountPages_` (docs/history/339) because a second thing asks for it:
   Edit on your own card is everybody's now, and `card-edit` (me.js) must open the very row the card it was
   pressed under was drawn from — a parent's, a student's and an unlisted admin's have no tutor row. One
   builder, so the card and its editor can never be two different people. */
```

### ---------- THE HANDLE IS PRINTED UNDER THE NAME, SO IT IS NOT SAID IN IT TOO

in `myCardRow_`

```
/* ---------- THE HANDLE IS PRINTED UNDER THE NAME, SO IT IS NOT SAID IN IT TOO --------------------
       A child is called by her first name (the owner, 10 Oct: *"dont show children's last name"*), and
       when another child shares it the server says `Wren (@wren_kind43)` (`nameFor_`) — which is right
       for a roster and wrong here, where `@wren_kind43` is the next line. Measured: the card read
       "Wren (@wren_kind43) / @wren_kind43". `nameBesideHandle_` (data.js) takes only that suffix, and only
       when it is this card's own handle; `USER.name` itself is untouched — it is what "is this mine?"
       compares. */
```

### YOUR PICTURE AS THE PICKER LAST KEPT IT (`USER.profile.photo`, written by `pfpTake_`), else the sign-in reply's.

in `myCardRow_`

```
/* YOUR PICTURE AS THE PICKER LAST KEPT IT (`USER.profile.photo`, written by `pfpTake_`), else the
       sign-in reply's. With your figure beside it, so `personFace_` can draw `pfp:avatar` — though on
       your own row it draws `USER.avatar` live anyway. */
```

### ---------- `dbs` IS DELIBERATELY ABSENT HERE, AND ABSENT IS NOT `false`

in `myCardRow_`

```
/* ---------- `dbs` IS DELIBERATELY ABSENT HERE, AND ABSENT IS NOT `false` --------------------
       THE STAMP IS A REAL CLAIM. A tutor row's `dbs` comes from `TRUE_(r.dbs_checked)`, so it is
       always answered — true or false — and the note on the pass defends the negative outright:
       "a pass without one is visibly a pass without one, which is exactly the right amount of
       alarming". That is right for somebody a parent is checking.

       IT IS NOT A CLAIM ANYBODY HAS MADE ABOUT A ROW BUILT HERE. A parent looking at their own
       account has no `dbs_checked` cell anywhere, and printing NO DBS ON FILE across it would be
       the `cost: 0` shape one more time: a missing fact rendered as a negative one. Omitting the
       key is what tells the two apart — see `findCard`. */
```

### ---------- YOU FIRST, THEN EVERYBODY ELSE

in `accountPages_`

```
/* ---------- YOU FIRST, THEN EVERYBODY ELSE -----------------------------------------------------
     `People` LEFT THE FUNNEL AND TOOK THE ONLY WAY TO LOOK SOMEBODY UP WITH IT. Tutors used to
     answer under People there; with that group gone the app had no roster at all, and this column
     already had exactly one person on it — you.

     SO THE PEOPLE GO UNDERNEATH, one to a page, in the order the sheet gives them. Your own card
     stays first because this is your column and because a list you are not at the top of is a
     directory rather than an account.

     `findCard` DRAWS THEM, WHICH IS THE POINT. It is the same function the funnel used for a tutor,
     so a person looks identical wherever they are seen — two renderers for one person is two things
     to keep in step, and the last time this app had that it had two of the same post.

     ONLY WHAT THE BACKEND ALREADY SENDS. `DATA.tutors` is the public list and always has been;
     `doget.gs` deliberately never sends the `people` tab, which holds PINs, bank details, addresses
     and dates of birth. Reading from anything else here would put all of that on every phone, and
     the leak would be invisible because the data would already have arrived. */
```

### ---------- AND YOU WERE THE ONE PERSON `findCard` DID NOT DRAW

in `accountPages_`

```
/* ---------- AND YOU WERE THE ONE PERSON `findCard` DID NOT DRAW ------------------------------
     REPORTED AS "why can't I see my own info like theirs?" — and the paragraph directly above this
     one is the answer, stating the rule that the code underneath it then broke: *"a person looks
     identical wherever they are seen — two renderers for one person is two things to keep in
     step."* Everybody else got a staff pass with a photograph, what they teach, a rate and a DBS
     stamp. You got a hand-rolled `<div class="card">` holding a name, a role and a button.

     SO YOUR ROW GOES THROUGH THE SAME FUNCTION. Found by `personId` first — CLAUDE.md is emphatic
     that an id beats a name, and `changePin` is the entry where matching a person by their display
     name was a real denial — then by handle, then by name, which is the same order `findPerson`
     uses on the backend and for the same reason.

     AND IF YOU ARE NOT STAFF THERE IS NO ROW, so one is built from what signing in already
     returned. That is not a second renderer: it is a second SOURCE for the same renderer, which is
     the distinction the note above is about. */
```

### ---------- AN ITEM, NOT A ROW, AND THAT IS WHY THE MESSAGE TILE WAS MISSING

in `accountPages_`

```
/* ---------- AN ITEM, NOT A ROW, AND THAT IS WHY THE MESSAGE TILE WAS MISSING -------------------
     REPORTED FOR THE SECOND TIME: "I don't see a message tile on tutors." The first time the tile
     was real and the CARD could not be reached — the `facets` sheet had put a filter in front of
     the doors. This time the card is right here on the account column and the tile is genuinely
     not drawn, for a different reason.

     `cardTiles_` IS APPENDED BY `stuffCard`, NOT BY `findCard`. Its own note says why — "one place
     instead of nine... a kind added tomorrow gets its actions without anybody doing anything" —
     and that is right, except this column calls `findCard` directly and so gets the card without
     the row of actions under it. A person seen on the Find screen has a Message tile; the same
     person seen here had none.

     AND A ROW IS NOT AN ITEM. `cardTiles_` reads `x.name`, `x.key` and `x.row.personId`; passing
     `{ kind, row }` gives it a card and an empty tile row, which is worse than no tiles because it
     draws a Message button addressed to nobody. So the shape is built the way `stuffItems` builds
     it, in one helper used for you and for everybody else — the same argument as `mineIs_` above:
     two places constructing one thing is two chances to construct it differently. */
```

### ---------- AND YOUR OWN CARD IS `me`, WHICH IS THE KIND NOTHING HAD EVER BUILT

in `accountPages_`

```
/* ---------- AND YOUR OWN CARD IS `me`, WHICH IS THE KIND NOTHING HAD EVER BUILT ----------------
     `cardTiles_` ROUTES `meTiles_` ON `x.kind === 'me'` AND NO ITEM IN THIS APP CARRIED THAT KIND.
     Measured across `js/`: `kind: 'me'` occurs nowhere. So `Your settings`, `Add your child`,
     `Your figure` and `Build` — four tiles, written, styled, each with a live handler behind it —
     were drawn on no screen at all, and the only way to any of them was a swipe to a column at the
     far right of nine others.

     A RENDERER LEFT STANDING OVER A PERMANENTLY FALSE CONDITION, which is the shape this repository
     already records under `resource_type` in `VOCAB`, under the dead `kind === 'paper'` guard, and
     under the unlisted tutor this same function used to filter away. `check-doors.js` could not see
     it and says why itself: it pairs a `data-do` STRING against an `on()` handler, and both halves
     were there — what was missing is anything that draws the string.

     `tutor` WAS ALSO WRONG ON YOUR OWN ROW FOR A SECOND REASON. `tutorTiles_` is Message, so your
     own card carried a Message tile addressed to yourself. One kind, two repairs.

     OTHERS ARE UNCHANGED: `withTiles_` asks for no kind and gets `tutor`, which is what they are. */
```

### `account: true` IS WHERE A CARD CAN BE EDITED — this column, and nowhere else the same tutor is drawn (a star puts them on Saved too).

in `accountPages_`

```
/* `account: true` IS WHERE A CARD CAN BE EDITED — this column, and nowhere else the same tutor is drawn
     (a star puts them on Saved too). `cardEditTile_` (me.js) draws Edit only for an item carrying it —
     on your own card whoever you are, and on a tutor's for an admin (docs/history/339). */
```

### ---------- A CARD OPEN FOR EDITING IS ITS OWN FORM, IN ITS OWN PLACE

in `accountPages_`

```
/* ---------- A CARD OPEN FOR EDITING IS ITS OWN FORM, IN ITS OWN PLACE ------------------------------
     The owner, 10 Oct: *"all of this stuff should be editable directly on the tutors card for that
     respective tutor."* `cardEditHtml_` (me.js) is drawn where the card and its tiles were — the form
     and its Save and Cancel — for the one card being edited; every other card is drawn as before. */
```

### ---------- AND THE PRIVATE HALF WENT DARK WHEN BOOKING LEFT THE FUNNEL

in `accountPages_`

```
/* ---------- AND THE PRIVATE HALF WENT DARK WHEN BOOKING LEFT THE FUNNEL -----------------------
     `meCard` HOLDS THE FACTS ONLY YOU SEE — your credits, your e-mail, where you are — and the one
     thing that reached it was `KINDS.tutor.card`, which is the funnel's renderer for a tutor. The
     funnel does not list tutors any more (see `FUNNEL_NOT_FOR`), so the whole of your private half
     became unreachable in the same commit that removed the answer, silently, on a column whose
     entire job is to show you your own account.

     CAUGHT BY ASKING WHAT `meCard` IS FOR rather than by anything running. That is the shape this
     file records under `d = libraryInto_(…)` and under `resource_type` in `VOCAB`: a correct
     function left standing with nothing calling it, doing nothing, looking fine.

     SO THIS COLUMN CALLS IT, which is where it always belonged — `meCard`'s own note says the
     private rows hang off the public card, and this is the one screen that is yours. It is given
     the row `mineIs_` found rather than looking a second time: two lookups for one person is two
     answers to "which row are you", which is the fault `mineIs_` exists to prevent.

     THE PRIVATE HALF HAS SINCE MOVED ON AGAIN, to the Settings column one swipe right — see the
     note at the top of `meCard`. What this column shows of you is your public card, and the row of
     tiles under it lost its four doors to that same column (see where `meTiles_` was in tiles.js). */
```

### SIGN OUT IS IN THIS ROW, beside the star — see `cardActions_`'s `me` branch in tiles.js.

in `me`

```
/* SIGN OUT IS IN THIS ROW, beside the star — see `cardActions_`'s `me` branch in tiles.js.
       AND UNDER THE FORM TOO, WHICH IS WHAT THE BRACKETS ABOVE ARE FOR. Without them `a ? b : c + d` is
       `a ? b : (c + d)`, so while you edited your own card this row was not drawn at all: no Sign out, no
       "Send the link again", and Settings has no Sign out of its own — the only ways off the form were Save
       and Cancel, and Cancel throws the typing away (the review of docs/history/330). Settings never hid
       Sign out; a sign-out keeps the card's draft under your own key, as it keeps a Settings card's.
       `cardEditTile_` draws no Edit on the card being edited, so the row is Sign out and the resend. */
```

### "WE WILL EMAIL YOU ONCE YOU OPEN THE LINK" — one line under the row while your own address is unproved, because `notify` sends it nothing until then and a

in `me`

```
/* "WE WILL EMAIL YOU ONCE YOU OPEN THE LINK" — one line under the row while your own address is
       unproved, because `notify` sends it nothing until then and a booking with no email after it is
       otherwise silence nobody can explain (the PR #130 review). On this page, not a page of its own,
       so nothing after it on the column moves. See `mailHeldNote_` in me.js. */
```

### ---------- AND AN UNLISTED TUTOR WAS DELETED FROM THE ONE SCREEN THAT CAN SWITCH HIM BACK ON --

in `accountPages_`

```
/* ---------- AND AN UNLISTED TUTOR WAS DELETED FROM THE ONE SCREEN THAT CAN SWITCH HIM BACK ON --
     REPORTED AS "where did george dissapear off to?" — and nothing had gone wrong with his row.
     This list read `.filter(t => t.listed !== false)`, so a tutor whose `listed` cell is off was
     dropped here, on the phone, AFTER the server had deliberately sent him.

     `doget.gs` ALREADY DECIDES THIS AND SAYS SO OUT LOUD: *"An admin sees the unlisted ones too,
     marked. Without that a tutor switched off vanishes from the site and can only be switched back
     on in the spreadsheet — which would make the control worse than not having one."* So the rule
     was written twice and the two disagreed — the `MESSAGING` fault, where a role policy copied
     onto the phone is two rules to keep in step, and here the copy silently won.

     AND IT MADE TWO THINGS UNREACHABLE THAT WERE ALREADY BUILT. `findCard` draws such a row dimmed
     with `· not listed` beside the name, `.card.is-widget.is-off` and `.prof-off` are in the
     stylesheet, and `asItem_` three lines below sets `off: t.listed === false` — none of which
     could ever run, because the row never arrived. A renderer left standing over a permanently
     false condition is the shape this repo records under `resource_type` in `VOCAB` and the dead
     `kind === 'paper'` guard.

     THE SERVER IS THE GATE AND STAYS THE GATE. A non-admin is never sent an unlisted tutor, so
     there is nothing here to filter — which is what makes deleting the clause safe rather than a
     disclosure: the list this walks is whatever `doGet` judged this viewer may see. */
```

### ---------- YOUR FAMILY, BETWEEN YOU AND EVERYBODY ELSE

in `accountPages_`

```
/* ---------- YOUR FAMILY, BETWEEN YOU AND EVERYBODY ELSE ---------------------------------------
     ASKED FOR AS *"students should be able to see their parents and likewise"*. A student sees a
     card for each parent linked to them and a parent a card for each child, straight after their
     own — the people this column is most about after you.

     THE SERVER SAYS WHO. `DATA.family` is built in `doGet` from this person's ACCEPTED links and
     nothing else, by the token rather than by anything typed into the address — so there is no
     rule here to keep in step with it, which is the `MESSAGING` argument: a policy copied onto
     the phone is two policies. An older backend sends no key, and `Array.isArray` draws nothing
     rather than a family of none.

     `findCard`, LIKE EVERY OTHER PERSON ON THIS COLUMN. The role label says which side of the link
     they are on. A parent who is also a tutor is drawn ONCE, here, from their tutor row with the
     tiles a tutor gets — and is taken out of the list below, or they would be on two pages.

     AND ONLY IF IT IS YOURS. `DATA` survives a sign-out, and signing in paints at once and fetches
     the payload after — so on a phone handed from a parent to somebody else's child, the parent's
     children were drawn as "Your child" on the child's column until the new payload landed, and
     for good if it never did. `familyFor` is the id the server built the list for; a list built
     for anybody else, or stamped by nobody, draws nothing. */
```

### `sibling` ON *"students should be able to see their parents and siblings likewise"*.

in `accountPages_`

```
/* `sibling` ON *"students should be able to see their parents and siblings likewise"*. Another
     child of a parent you have ACCEPTED, decided in `doGet` like the other two. "Brother or sister"
     rather than "sibling" because the people reading it are mostly children, and the app knows no
     one's gender to pick one of the two. A relation not in this table draws nothing, which is
     what kept a new backend's `sibling` rows off an older phone instead of drawing them unlabelled. */
```

### AND THE REQUESTS THAT BECOME ONE.

in `accountPages_`

```
/* AND THE REQUESTS THAT BECOME ONE. A parent's "this is my child" waits on the child, so the
     child is asked here, on their own column, straight after their own card — see `claimCard_` in
     me.js for why this is the only door it has. `DATA.claims` is built for the signed-in person
     alone and is stamped by the same `familyFor`, so it is held to the same test. */
```

### AND THE FIGURE THAT CAME WITH THE FACE — `doGet` sends `avatar` on a family card only when the face is `pfp:avatar` (`faceFig_`), and this row was rebuilt

in `row`

```
/* AND THE FIGURE THAT CAME WITH THE FACE — `doGet` sends `avatar` on a family card only when the
         face is `pfp:avatar` (`faceFig_`), and this row was rebuilt without it, so a child who chose
         their figure was an initial on their parent's column. Whichever row the face came from. */
```

### ---------- "NEW PIN" WAS HERE, ON YOUR CHILD'S CARD

in `famPages`

```
/* ---------- "NEW PIN" WAS HERE, ON YOUR CHILD'S CARD ----------------------------------------------
       A CHILD WITH NO EMAIL WHO FORGETS THEIR PIN HAS ONE PERSON TO ASK, and the tile for it was on their
       card on the parent's column. It is on "Manage your child" on Settings now, beside the child's name
       (`kidListSec_` in me.js), and only there — the review of docs/history/339: the owner asked for *"one
       widget which is manage you child"*, and with the tile in both places a parent at 1280 saw two widgets
       doing one job side by side; and the two disagreed, because Manage hides it from a parent whose own
       address is unproved (`resetPin` refuses them, `confirmFirst_`) and this one did not. The child's card
       here is the child — their face, their name, their tutors' tiles if they teach. */
```

### NOT YOU, TWICE. With a tutor row of your own you would otherwise appear at the top as your account and again below as a tutor — the same duplication the `me`

in `others`

```
/* NOT YOU, TWICE. With a tutor row of your own you would otherwise appear at the top as your
       account and again below as a tutor — the same duplication the `me` kind was merged away to
       avoid. Matched by `mineIs_`, the same test that FOUND the row above, so the two can never
       disagree about which person you are. */
```

### ---------- AND FOR AN ADMIN, EVERYBODY ELSE AS WELL

in `accountPages_`

```
/* ---------- AND FOR AN ADMIN, EVERYBODY ELSE AS WELL -------------------------------------------
     ASKED FOR AS *"Admin should be able to see every one in the people column."* `others` is the
     tutors and admins — the only people `doGet` sends to everybody — so the students and clients
     who make up most of the tab were on no screen at all, and looking one up meant the spreadsheet.

     THE SERVER IS THE GATE, AS FOR AN UNLISTED TUTOR ABOVE. `DATA.everyone` is built only for an
     admin's token and carries only what a card draws; `isAdmin()` here is not the protection, it is
     what stops a list left over from an admin's session being drawn for whoever signs in next on
     the same phone before the new payload lands (the `familyFor` problem, one key along). A
     non-admin's column is exactly what it was.

     AFTER THE TUTORS, in the sheet's order: the column was a staff list first and an admin still
     reads it that way. Family and you are taken out, as they are from `others`, so nobody is drawn
     twice. `findCard` draws them — one renderer for a person — and the row under each is Message
     alone: `tutorTiles_` would add the Listed switch, which is a TUTOR's public profile and means
     nothing on a child. A THING HAS TILES, so it is a tile row and not a button. */
```

### A BLANK HANDLE IS SAID, NOT FILLED WITH THE FIRST NAME.

in `everyone`

```
/* A BLANK HANDLE IS SAID, NOT FILLED WITH THE FIRST NAME. `doGet` printed `@Kit` where Kit had
       no handle, and `Kit` at the sign-in box was refused — so the one person who could put it right
       was shown that nothing was wrong. "New PIN" gives them a handle as well as a PIN. */
```

### AND "NEW PIN" BESIDE "MESSAGE" — the admin is who a child with no email and no linked parent goes to, and the only remedy was four digits typed into the sheet

in `everyone`

```
/* AND "NEW PIN" BESIDE "MESSAGE" — the admin is who a child with no email and no linked parent
       goes to, and the only remedy was four digits typed into the sheet, which left the lock on. A
       row with no id cannot be named to the server, so it gets no tile (it gets one at its first
       sign-in, or at `?setup=1`). */
```

### ---------- THE WRAPPER WENT WHEN THE PASS DID, AND LEAVING IT WOULD HAVE NESTED TWO CARDS

in `accountPages_`

```
/* ---------- THE WRAPPER WENT WHEN THE PASS DID, AND LEAVING IT WOULD HAVE NESTED TWO CARDS -----
     THIS RETURNED `<div class="card is-widget">${html}</div>` AROUND EVERY PAGE. It was the answer
     to "I want them standardised like the other widgets" when a person was a `.pass` — a bare
     object with none of a card's rules, drawn straight onto the pane while page one was an ordinary
     card. Putting the pass in a box made the column consistent without changing the pass.

     ASKED AGAIN, AND THE SECOND ANSWER IS THE REAL ONE: the pass is gone and `findCard` returns
     `.card.is-widget` itself. Keeping this line would put a widget card inside a widget card —
     two borders, two backgrounds, two lots of padding — which is visibly worse than what was
     reported in the first place and is exactly what "just a normal widget" rules out. */
```

### ---------- AND WHILE THE PAYLOAD IS ON ITS WAY, THE COLUMN SAYS MORE IS COMING

in `accountPages_`

```
/* ---------- AND WHILE THE PAYLOAD IS ON ITS WAY, THE COLUMN SAYS MORE IS COMING -----------------
     Your own card is drawn from the sign-in kept on this device; everybody else — your family, your
     tutors, the people you teach — comes with the payload. Measured on 9 Oct with it held: the column
     was your card and nothing after it, and grew under you fifteen seconds later with nothing having
     said it would. So until it lands, the page after yours is the one loader, as every column waits
     (`loading_`, shell.js). The owner, 9 Oct: *"They should all have a simplistic simple loading
     thing while it's info or whatever is loading."* */
```

### ---------- HOW A LEARNER IS GETTING ON, IN ONE LINE UNDER THEIR NAME

top level, before `subsLine_`

```
/* ---------- HOW A LEARNER IS GETTING ON, IN ONE LINE UNDER THEIR NAME ------------------------------
   `12 questions · last 4 Oct`, off `DATA.submissions.people` — the per-learner summary `doGet` builds
   for an admin's token and nobody else's: how many questions they have sent an answer to, and the day
   of the last. Asked for in 269 *"so a tutor can see it"*, and kept when the date left the child's
   card (9 Oct): the owner's words were about what the KIDS see. It read `DATA.attempts` until then.
   Under the handle, where it does not add a row to a card that is otherwise a name and a picture. Somebody who has done nothing gets nothing, rather than
   "0 questions", which on a parent's card would read as a complaint about a person who is not a
   learner at all. `for` is checked as everywhere: a summary left by an admin's session on a shared
   phone is not drawn for whoever signs in next. */
```

### THE COLUMN ITSELF. One page when signed out — the sign-in card — and one when signed in.

top level, before `frontPages_`

```
/* THE COLUMN ITSELF. One page when signed out — the sign-in card — and one when signed in. Kept
   here beside `accountPages_` rather than in me.js, because the thing it draws is built here and a
   screen registered away from what it draws is a screen somebody has to go looking for. */
```

### THE BUNDLE IS THE LAST OF THEM — see `bundlePages_`.

top level, before `frontPages_`

```
/* THE BUNDLE IS THE LAST OF THEM — see `bundlePages_`. It is asked here and nowhere else, so
   `PAGER.stuff`, `stuffFirstResult_`, `paintStuff` and `screen('stuff')` all count it by asking the
   one function that draws it, which is the rule every one of those already follows. */
```

### THE BOUND FINDER'S, since there are two (`FINDERS`):

top level, before `frontPages_`

```
/* THE BOUND FINDER'S, since there are two (`FINDERS`): Find's are the three above, and Find 2 has
   none. Not because it carries less — both carry every item (347) — but because these are not search
   results: the booking form is one draft of one booking (`BOOKING` is one global state), and a second
   copy of it one swipe along would be two forms writing the same booking; the posts and the bundles
   are the front door's, and twice them is the same pages to swipe past twice. */
```

### A BUNDLE — THE PAPERS ON THE SCREEN, AS ONE THING YOU CAN ORDER.

top level, before `BUNDLE_MIN`

```
/* ==================================================================================================
   A BUNDLE — THE PAPERS ON THE SCREEN, AS ONE THING YOU CAN ORDER.

   ASKED FOR AS *"what happened to collection/bundle in the finder. like what if someone wants a
   bundle of 2017 past papers for maths edexcell to add to cart and have me send it to them?"*

   WHAT HAPPENED IS WRITTEN DOWN, TWICE, AND BOTH HALVES ARE STILL TRUE. The collection line —
   *"or the 227 papers these are in"* — went because it was a second way of narrowing one list,
   stacked on the first and named in a sentence you had to understand before you could use it. And
   the print line went with the paper card: *"You cannot print one question — a print is a whole
   paper, priced per page, and this screen no longer lists a whole paper."* What was lost is exactly
   what is being asked for. This is not the collection line coming back: it does not narrow
   anything and it does not change what the results are. It is ONE page, in front of them, that
   says what they add up to — and lets somebody order that.

   ---- WHEN THE RESULTS *ARE* THOSE PAPERS, AND ONLY THEN ----------------------------------------
   THE TEST IS WHOLENESS, NOT HOW MANY PAPERS ARE REPRESENTED. Every question of every paper on the
   list has to be on the list. Measured over every state the real funnel reaches by paper-level
   answers — subject, type, level, tier, board, sitting — and it holds exactly there: Maths · Past
   paper · GCSE · Higher · 2017 & 2018 is 362 questions and TWELVE WHOLE PAPERS. Narrow by `Topic`
   instead and it fails everywhere, correctly: GCSE · Algebra is 248 questions from 32 papers and
   not one of them whole. A "bundle of the 32 papers that contain some algebra" would be 640 printed
   pages for 248 questions, and a card offering it would be describing a different thing from the
   list under it. The count can be right and the claim wrong; wholeness is what makes the claim
   true.

   ---- BUT A STRAY IS NAMED RATHER THAN FATAL, AND THE OWNER'S OWN EXAMPLE IS WHY ----------------
   THE FIRST VERSION REFUSED ANY LIST THAT WAS NOT ENTIRELY WHOLE PAPERS, and typing `2017` into the
   search on Maths — which is the sentence the owner used — returned 223 questions: every question of
   seven 2017 papers, AND ONE question from a June 2019 paper whose own text mentions the year. One
   question in 223 took the bundle away from the one search it was asked for by. The same is true of
   a search that also finds a boxer or a link.

   SO THE WHOLE PAPERS ARE THE BUNDLE, and everything else on the list is a STRAY: a question from a
   paper only part of which is here, or anything that is not a question at all. A bundle is offered
   while the strays are at most a tenth of the list (`BUNDLE_STRAY`) — which keeps `GCSE · Algebra`
   out exactly as before, because not one of its 32 papers is whole and every one of its 248
   questions is a stray — and the card SAYS what it left out, by paper, so it is never a
   description of a different list from the one under it. A tenth because the measured cases sit at
   either end of it: the year search is 1 stray in 223, a topic-narrowed list is all strays, and
   nothing reached in between.

   ---- THE BOUNDS, AND WHERE EACH ONE CAME FROM ---------------------------------------------------
   AT LEAST TWO. One paper is where somebody working through it swipes from the question to Q1, and
   a shop card between them and the paper they are sitting tonight is friction on the commonest
   journey this screen has. It is also not what was asked for — a bundle is several. One paper can
   still be ordered: its sitting's bundle goes into the basket as one line per paper, and a line is
   taken out with its own ✕.

   AT MOST TWENTY-FOUR. Measured, the sizes a whole-paper state reaches cluster up to 24 — English
   Language is 24, a Year 6 worksheet shelf is 20, the owner's own example is 12 — and then jump
   to 29, 33 and 35: every Higher GCSE maths paper in the library, every GCSE one, every Foundation
   worksheet. Those are SHELVES, not bundles, and nobody orders one in a single go. Twenty-four is
   also what the card can list without the pane scrolling on a 320px phone, and what one message
   to the owner can carry under the backend's 2,000-character cap — see `orderText_`.

   NEVER ON THE FIRST UNANSWERED STATE. `stuffAsked()` is false there, so nothing is offered before
   anybody has asked for anything — the whole library is 266 papers and is not a bundle either.

   ---- WHERE IT SITS ------------------------------------------------------------------------------
   A LEADING PAGE, BETWEEN THE QUESTION AND THE FIRST RESULT — the place the booking and feed pages
   already occupy. So it is kept rather than recycled (`PAGE_KEEP`), counted by `PAGER.stuff`, and
   rebuilt by `paintStuff` with the others; nothing about the result window moves. On the question
   page itself it would have cost the funnel's answers their room on a 568px phone, and after the
   last result it would be 362 swipes away. One swipe from the question is where "these, all of
   them" belongs.
================================================================================================== */
```

### HOW MANY QUESTIONS EACH PAPER HAS, OVER THE SAME LIST THE FUNNEL FILTERS.

top level, before `PAPER_QUESTIONS`

```
/* HOW MANY QUESTIONS EACH PAPER HAS, OVER THE SAME LIST THE FUNNEL FILTERS. Against `stuffItems()`
   rather than the file, because wholeness is a question about the list on screen: a row the file
   holds and the funnel does not offer (an inactive one) is not a question anybody could have been
   shown, so it cannot make a paper partial. Memoised on the array, which is rebuilt only when the
   payload or the visitor changes. */
```

### A DOCUMENT ROW BY ITS ID, off the file rather than the mapped list — `libDocRows_`'s own note says why:

top level, before `DOC_BY_ID`

```
/* A DOCUMENT ROW BY ITS ID, off the file rather than the mapped list — `libDocRows_`'s own note
   says why: `DATA.questions` carries 174 of the 691 document rows and the page count, the name and
   `printable` are all paper-level facts. */
```

### ---------- WHAT THE BUNDLE IS CALLED, BUILT FROM THE CHIPS AND THE DATA

top level, before `BUNDLE_TITLE_FIELDS`

```
/* ---------- WHAT THE BUNDLE IS CALLED, BUILT FROM THE CHIPS AND THE DATA ----------------------------
   EVERY COLUMN ALL OF ITS QUESTIONS AGREE ON, IN THE ORDER A PERSON SAYS THEM: the board, the
   subject, the level, the year or grade, the tier, the type, the sitting. Read through the funnel's
   own tally, so every word is spelled the way the answer button spelled it — `1st Class Maths`,
   not `1stclassmaths` — and a column the papers DISAGREE on falls back to the chip that was pressed
   on it, which is how `2017 & 2018` gets into the name of twelve papers from four sittings.

   THE DATA BEFORE THE CHIPS, because a question the funnel never had to ask is still true of the
   bundle: every Higher GCSE maths paper here is Edexcel, so `Exam board` is skipped as a question
   that cannot narrow — and "Edexcel" is the first word anybody ordering one would say. */
```

### `sitting` IS NOT A FUNNEL QUESTION ANY MORE — the funnel asks the year and then the month — and it is still the right TITLE word:

top level, before `SITTING_READER_`

```
/* `sitting` IS NOT A FUNNEL QUESTION ANY MORE — the funnel asks the year and then the month — and
   it is still the right TITLE word: papers from one sitting are `June 2017`, and `2017 · June` reads
   as two facts. So the title has its own reader that joins the two answers the funnel asked, month
   first, the way the cover prints it. IT SAID `Summer 2017` UNTIL THE OWNER ASKED FOR MONTHS --
   "I don't want it to ask summer or autumn I'd rather it just do the months" -- and a title saying
   the season the funnel no longer offers is the second vocabulary that request took away. `waveOf`
   stands in only for a paper with a year and no month, which `check-funnel` counts and expects none
   of. Where the papers do not share one sitting the halves speak for themselves: the `2017` chip,
   or the `2017 & 2018` bucket. A constant rather than an object built per call, because
   `facetTally_` memoises on the facet. */
```

### `if (field === 'keystage' && said.level) return;` WAS HERE.

in `bundleTitle_`

```
/* `if (field === 'keystage' && said.level) return;` WAS HERE. `GCSE · KS4` and `KS2 SATs · KS2`
       said one thing twice, so the key stage was dropped wherever a level spoke. Neither can happen
       now: the `Key stage` question answers nothing outside SATs, so a GCSE bundle has no key stage
       to say, and inside SATs the level no longer carries it -- *"sats is one tag not ks2 sats"* --
       so `SATs · KS2` is two facts, the second the only word for which SATs. */
```

### THE YEAR ONLY WHERE THE SITTING DID NOT SAY IT.

in `bundleTitle_`

```
/* THE YEAR ONLY WHERE THE SITTING DID NOT SAY IT. Seven 2017 papers are three sittings, May,
       June and November, so the sitting has nothing single to say — and "2017" is the word the owner
       asked with, which `examYear` says first and `year` says only for a row with no sitting. Where
       the sitting did speak it already carries the month and the year, and `June 2017 · 2017 · June`
       is one fact three times. `year` is switched off as a funnel QUESTION and `facetBy` still finds it,
       which is the only thing this needs. */
```

### ---------- ONE FLOOR, READ BY BOTH GATES

top level, before `bundleBuild_`

```
/* ---------- ONE FLOOR, READ BY BOTH GATES -------------------------------------------------------
   IT WAS WRITTEN TWICE AND ONLY ONE COPY LEARNED ABOUT `min`. The wholeness gate said
   `min || BUNDLE_MIN`; the printable gate further down still said `BUNDLE_MIN`, and since the
   printable papers are a subset of the whole ones, `min` 1 let one paper through the first gate for
   the second to refuse every time. So no one-paper sitting ever had a card under `Bundles`:
   Maths · GCSE · 2019 drew June and November and left May out, `May` under Month led to "No whole
   sitting left on this list to bundle" over the one whole paper it is, and so did every journey
   that answered `Paper` — which the funnel always asks. Nine whole printable sittings could not be
   ordered at all (the review of PR #130, finding 5). Named once here so the two cannot drift. */
```

### ---------- WHICH PAPERS ARE WHOLE ON THIS LIST, AND WHAT IS LEFT OVER

in `bundleBuild_`

```
/* ---------- WHICH PAPERS ARE WHOLE ON THIS LIST, AND WHAT IS LEFT OVER ------------------------
     Counted per paper over the list's QUESTIONS; anything that is not a question, or has no paper,
     goes straight to the strays — see the note above `BUNDLE_MIN` for why a stray is named rather
     than fatal. `first` keeps one question per paper, because the sitting is read off a question
     through the funnel's own facet rather than worked out a second time from the row. */
```

### ---------- IN THE ORDER THEY WERE SAT

in `bundleBuild_`

```
/* ---------- IN THE ORDER THEY WERE SAT -----------------------------------------------------------
     THE LIST ARRIVES IN THE FUNNEL'S OWN ORDER, which sorts on the paper's NAME — so twelve papers
     came out as four Paper 1s, then four Paper 2s, then four Paper 3s, across two years and four
     sittings. A bundle is read as "which exams", and an exam is a sitting before it is a number, so
     it is year, then month, then the paper's own number, then the name as the last word. Read off
     the document row — `year`, `month` and `paper` are all paper-level facts. */
```

### ---------- AND GROUPED BY SITTING WHEN THERE IS MORE THAN ONE

in `bundleBuild_`

```
/* ---------- AND GROUPED BY SITTING WHEN THERE IS MORE THAN ONE ----------------------------------
     TWELVE PAPERS WERE TWELVE LINES OF `Paper 1 (Non-Calculator) — November 2017`, because across
     four sittings `Paper 1` is not unique and the shortest name that is carries the whole date.
     Grouped, each sitting is ONE line and inside it `Paper 1` IS unique — so the twelve read as
     `Summer 2017   Paper 1 · Paper 2 · Paper 3`, four lines, which is how anybody says them.

     THE SITTING IS THE TITLE'S OWN READER, `SITTING_READER_` — the month and the year the funnel's
     Month and Year questions ask — so the group reads `June 2017` and the two chips above it read
     `2017` and `June`, one fact said the same way. It read `Summer 2017` off `waveOf` until the owner
     asked for months, and a bundle of one year then listed `Summer 2017` over a Month question
     offering May and June. Only where EVERY paper has one and there are at least two: a worksheet
     shelf has no sittings, and one sitting is already in the title.

     ---------- AND BY TIER, WHERE THE BUNDLE HOLDS BOTH ---------------------------------------------
     THE OWNER'S OWN EXAMPLE IS WHERE IT SHOWED. Maths · Past paper · May 2017 is the Higher Paper 1
     AND the Foundation Paper 1, and inside one sitting the two Paper 1s are `Paper 1
     (Non-Calculator)` and `Paper 1 (Non-calculator)` — one letter's case apart, with the tier that
     actually separates them nowhere on the card. The title cannot say `Higher` either, because the
     papers disagree. So a mixed bundle groups on the tier too — `Higher` over one paper and
     `Foundation` over the other — and inside each, `Paper 1` is unique
     again. The same rule as the sitting: only where every paper has one and they differ, so a
     bundle that is all Higher says so once, in its title, and nowhere else. Read off the document
     row, because a tier is a paper-level fact. */
```

### THE SHORTEST NAME THAT IS STILL UNIQUE — among the whole bundle when it is one list, among its own group when it is grouped.

in `bundleBuild_`

```
/* THE SHORTEST NAME THAT IS STILL UNIQUE — among the whole bundle when it is one list, among its
     own group when it is grouped. `paperLabels_` against the ids it is given, then `shortLabels_`,
     which is exactly what the funnel's own Paper question does. */
```

### `group` IS WHAT THE CARD PRINTS OVER A PAPER, and `short` is the two together — the name that is unique inside the bundle and nowhere else, which is what the

in `bundleBuild_`

```
/* `group` IS WHAT THE CARD PRINTS OVER A PAPER, and `short` is the two together — the name that is
     unique inside the bundle and nowhere else, which is what the basket and the order message put
     under the bundle's title. Built here, once, so the card, the basket and the message cannot
     spell one paper three ways. */
```

### WHAT IS ON THE LIST AND NOT IN THE BUNDLE, in one sentence — see the note above `BUNDLE_MIN`.

top level, before `bundleStrayLine_`

```
/* WHAT IS ON THE LIST AND NOT IN THE BUNDLE, in one sentence — see the note above `BUNDLE_MIN`. The
   partial papers by name, up to three, because "1 question from Paper 3 — June 2019" is what
   somebody needs in order to see why it is there; past three it is a count. */
```

### WHAT A BUNDLE CARD'S TAG ROW IS ASKED OF:

top level, before `BUNDLE_ITEM`

```
/* WHAT A BUNDLE CARD'S TAG ROW IS ASKED OF: a bundle is a set of papers, not an item of the list, so
   its one answer is the What kind it is found under. Through `tagRow_` all the same, so its tag is
   that chip's word and look rather than a head of its own. */
```

### ---------- THE QUESTION CARD'S HEADER, BECAUSE IT IS THE SAME FAMILY

in `bundleCard_`

```
/* ---------- THE QUESTION CARD'S HEADER, BECAUSE IT IS THE SAME FAMILY ---------------------------
     ASKED FOR AS *"sleekerise the whole widget system in the finder for questions"*. This card sat in
     front of the questions it bundles and spoke a different language: a breadcrumb, a large title
     with "— 12 papers" trailing it in faint (which wrapped at 320 and left "papers" alone on a
     line), loose on the glass where every question after it is a bounded card. So it is a `.qcard`
     too, with the tag row every card wears -- [Bundles], the What kind answer that opened it, where a
     gold `Bundle` head of its own used to be (docs/history/355) -- then its title, then how many and
     what it costs, then the list. Its own name still says "printed and sent", once, in the line about
     money, which is where that fact is used. */
```

### NAMED, NOT DROPPED. A paper the library marks `printable: FALSE` is on the list above the card and missing from the bundle, and a card that said "these papers"

in `bundleCard_`

```
/* NAMED, NOT DROPPED. A paper the library marks `printable: FALSE` is on the list above the
            card and missing from the bundle, and a card that said "these papers" without saying so
            would be the misdescription the wholeness test exists to prevent. */
```

### ---------- WHICH OF THE ANSWERS ABOVE TOOK PART OF A PAPER AWAY

top level, before `BUNDLE_CUT_MEMO`

```
/* ---------- WHICH OF THE ANSWERS ABOVE TOOK PART OF A PAPER AWAY -----------------------------------
   THE DEAD END BLAMED "a search or a topic", AND UNDER `Bundles` THE FUNNEL ASKS NO TOPIC. The review
   of PR #130 walked every journey under `Bundles` with `Doesn't matter` at each level — 4,975 ends —
   and the 368 that land on the dead end all pass through `What you need`: Maths · GCSE · Higher ·
   November 2019 · Paper `Doesn't matter` · `Compass` leaves one question, so no paper is whole, and
   the card told somebody who had typed nothing and been offered no topic to take back a search or a
   topic. That is finding 6's complaint again — a card blaming a choice nobody made — one card down.

   SO IT IS WORKED OUT, NOT WORDED. A paper is whole when every one of its questions is on the list
   (`bundleBuild_`), so the answers that broke one are exactly the answers some question on a listed
   paper fails. Each answered field is put to the listed papers' whole question sets through
   `stuffNarrow_` — the one body that decides what a chip or a word means — and the search the same
   way. A paper-level answer (subject, year, month, Paper itself) keeps every question of a paper it
   keeps any of, so it is never named; `What you need` today, and anything that asks about questions
   rather than papers tomorrow, is. Asked only when the dead end is drawn, and held per list. */
```

### THE DEAD END'S SENTENCE, from `bundleCutBy_` — each answer by the name its question has above it.

top level, before `bundleDeadEnd_`

```
/* THE DEAD END'S SENTENCE, from `bundleCutBy_` — each answer by the name its question has above it.
   When nothing above can be blamed (the list held too many papers, or too much that is not one) it
   says what is true without naming anybody. */
```

### "A SINGLE PAPER" WAS IN THIS SENTENCE, and it was true only because of the fault over `bundleBuild_`'s floor:

in `bundlePages_`

```
/* "A SINGLE PAPER" WAS IN THIS SENTENCE, and it was true only because of the fault over
       `bundleBuild_`'s floor: one whole paper is a sitting now and gets its card. "A search or a
       topic" replaced it and was wrong the other way — see `bundleCutBy_`. */
```

### ---------- THE FUNNEL'S LAST LINE, WHEN THE RESULTS ARE BUNDLES

top level, before `bundlesEnd_`

```
/* ---------- THE FUNNEL'S LAST LINE, WHEN THE RESULTS ARE BUNDLES ---------------------------------
   IT POINTED AT QUESTION PAGES THAT ARE NEVER DRAWN. `stuffPages_` draws none under `Bundles`, and
   the end of the funnel still went through `paperEnd_` — "That is the paper, in order. Swipe up for
   its 20 questions." over a dead end — or said "Nothing left to narrow. Swipe up for the 60." over
   one bundle card (the review of PR #130, finding 7). `paperEnd_` already had to learn the same
   thing about `Answers`; this is that lesson for the third kind, said in what is actually below. */
```

### ---------- `Bundles` IS A KIND, BESIDE `Questions` AND `Answers`

top level, before `bundleable_`

```
/* ---------- `Bundles` IS A KIND, BESIDE `Questions` AND `Answers` ----------------------------------
   THE OWNER, 6 Oct: *"bundle is a tag option too. pick where is appropriate for it to put it."* A
   bundle had only one way in: narrow the funnel until the list happened to be two to twenty-four
   whole papers, and a card appeared one swipe from the question. Somebody who came to ORDER papers
   had to know that.

   SO IT IS AN ANSWER TO THE FIRST QUESTION, `What kind`, where somebody says what they came for — the
   same place `Answers` went for the same reason. Every question on a printable past paper answers it
   (`bundleable_`), so the funnel's later questions — subject, level, board, year — narrow it exactly
   as they narrow the questions. And the results are bundles, not questions: one card per sitting on
   the list, newest first, each the same card and the same basket line as the one the funnel always
   offered. Nothing is printed for a paper that is not printable, and nothing is offered at all where
   printing has no price (`printOffered_`). */
```

### ---------- PRINTABLE IS A FACT ABOUT THE PAPER, SO IT IS READ OFF THE PAPER

top level, before `bundleable_`

```
/* ---------- PRINTABLE IS A FACT ABOUT THE PAPER, SO IT IS READ OFF THE PAPER ---------------------
   THIS READ `printable` OFF THE QUESTION ROW, and `bundleBuild_` reads it off the paper's document
   row through `canPrint_` — two rules for one fact, and they disagreed on 257 questions. 229 past-
   paper and 28 specimen question rows carry no `printable` cell while their paper's row says FALSE:
   every AQA Religious Studies paper, both Greek ones and the June 2024 Combined Science. So `Bundles`
   offered `Religious Studies 152` and `Greek 78` under Subject, and either answer led only to the
   "No whole sitting" card, blaming a topic or a paper nobody had chosen (the review of PR #130,
   finding 6). Now it asks the bundle's own question of the bundle's own row, so a question answers
   `Bundles` exactly when its paper could go in one. `canPrint_` says no to a paper with no document
   row, and none of the 3,068 questions on a past or specimen paper is on one. */
```

### PAST THE BOOKING PAGES TOO.

in `stuffFirstResult_`

```
/* PAST THE BOOKING PAGES TOO. They sit between the question and the results, so a result's index
     is its position minus the question, minus however many of those there are. Counted from the
     same function that draws them, so the two cannot disagree about how many there were. */
```

### ---------- NOTHING IS LISTED UNTIL SOMEBODY NARROWS

in `stuffPageCount`

```
/* ---------- NOTHING IS LISTED UNTIL SOMEBODY NARROWS -------------------------------------
     This screen used to open with all five hundred and sixty-six resources paged out behind the
     question — seventy-one pages of things nobody had asked to see, built as you approached them,
     for a library nobody browses from the top.

     The funnel is the whole point of the screen: it asks what you are after and the answer is the
     list. Offering the entire library first is answering before the question, and it is what makes
     the first swipe on this column land in a wall of resources.

     One page — the question — until a filter is pressed or something is typed. */
```

### ZERO, NOT ONE. This is how many pages of RESULTS there are, and it is added to the question page rather than including it — `stuffPages` is

in `stuffPageCount`

```
/* ZERO, NOT ONE. This is how many pages of RESULTS there are, and it is added to the question
     page rather than including it — `stuffPages` is `[the question].concat(this many blanks)`. So
     returning 1 for "nobody has asked yet" made one page of results anyway, and `fillStuffPages`
     filled it with the first page of the whole unfiltered library. The gate was right and it was
     counting the wrong thing.

     Nought results is a real answer and the ordinary one on arrival: the screen is a question until
     somebody answers it. */
```

### AND ZERO AGAIN WHEN A SEARCH FINDS NOTHING.

in `stuffPageCount`

```
/* AND ZERO AGAIN WHEN A SEARCH FINDS NOTHING. This returned 1, which is a blank page you can
     swipe to — the funnel already says "0 of 565" above, and a page of nothing underneath it is
     the same news told twice, the second time as an empty screen. */
```

### ONE PAGE'S MARKUP, built when it is needed and not before.

top level, before `stuffPageHtml`

```
/**
 * ONE PAGE'S MARKUP, built when it is needed and not before.
 *
 * A GROUP HEADING IS REPEATED at the top of a page that continues one. Four hundred resources
 * eight to a screen means most groups span several, and a page opening with eight subject names
 * and no subject is a page you would have to swipe back to understand.
 */
```

### Cards, in order, and nothing between them.

in `stuffPageHtml`

```
/* Cards, in order, and nothing between them. The continuation-heading logic went with the
     headings — repeating a group name at the top of a page that carries on from the last one was
     the fiddliest part of this function and existed only to make grouping survive being paged. */
```

### ONE PAGE IS ONE ENTRY OF `stuffPages_`, which is the results with each practical expanded into its four parts.

in `stuffPageHtml`

```
/* ONE PAGE IS ONE ENTRY OF `stuffPages_`, which is the results with each practical expanded into
     its four parts. The first part is the ordinary card — star, tiles and all — and the other three
     are pages of that same practical, drawn without a second star: keeping a practical is one
     decision, not four. `stuffPerPage` is 1 and has been since the list became a strip. */
```

### THE CARD FOR A THING, whatever kind it is.

top level, before `FAVS`

```
/**
 * THE CARD FOR A THING, whatever kind it is.
 *
 * This was a hundred and thirty lines of `if (x.kind === …)` — the same table the funnel already
 * needed for its groups and labels, written a second time, in a second shape, in a second place.
 * Adding a kind meant finding both and getting both right; getting one right produced something
 * that could be narrowed down and drew as a blank card, or the reverse.
 *
 * One line now. Everything a kind IS lives in `KINDS`.
 */
```

### FAVOURITES. ONE STAR FOR EVERY KIND, and that is only possible because every item in this list already carries a `key` — a tutor is `t.title`, a widget is

top level, before `FAVS`

```
/* ==================================================================================================
   FAVOURITES.

   ONE STAR FOR EVERY KIND, and that is only possible because every item in this list already
   carries a `key` — a tutor is `t.title`, a widget is `w:timer`, a link is `link:…`. Nothing had to
   be added to eight card builders; the star wraps the card they all come out of.

   KEPT ON THE PERSON, NOT IN THE BROWSER. A favourite is a small statement about what somebody is
   looking for, and it should survive a new phone — `saveProfile` already carries arbitrary profile
   fields, so this rides on the one that exists rather than inventing a tab for a comma-separated
   list. `localStorage` holds the last known set so the star is right on the first frame, before any
   payload has arrived, the same trick the splash picker uses.
================================================================================================== */
```

### AND WHAT THE SHEET SAYS, once a payload has arrived.

top level, before `adoptFavourites_`

```
/* AND WHAT THE SHEET SAYS, once a payload has arrived. `localStorage` is right for the first frame
   and wrong on a new phone — it is a cache of this device, not a record of the person. The sheet
   wins when it answers, which is what makes a star survive changing phone: the thing that was
   broken here for as long as favourites have existed. */
```

### ---------- `saveProfile` DOES NOT EXIST, AND NEVER HAS

in `toggleFav`

```
/* ---------- `saveProfile` DOES NOT EXIST, AND NEVER HAS ---------------------------------------
       EVERY STAR ON THIS SITE HAS BEEN DEVICE-ONLY. The action is `updateProfile`; this called
       `saveProfile`, the backend refused it, and `.catch(() => {})` threw the complaint away — so
       favourites worked perfectly until somebody changed phone, and then quietly did not. Nothing
       could have reported it: the star was already right on screen, and the only evidence was an
       error nobody was catching.

       AND IT SENDS ONE FAVOURITE, NOT THE WHOLE LIST. Writing "a,b,c" back to a profile field is
       the read-modify-write that loses one of two taps made at once, and this was doing it across
       two tabs of the same account. `favourite` appends or deletes a single row instead — nothing
       is read first, so nothing can be overwritten. */
```

### THE KEY IS NOT SPLITTABLE, so it is not split.

in `toggleFav`

```
/* THE KEY IS NOT SPLITTABLE, so it is not split. Some are a bare title — `key: t.title` for a
       tutor — and some are prefixed, `w:123` for a widget. Splitting on the colon would turn
       "Colliers Wood Library" into kind "Colliers Wood Library" and lose the rest, and would give
       a tutor called "Smith: Maths" a kind of "Smith". The kind is passed separately by the caller,
       which knows it for certain, and the key goes across whole. */
```

### ---------- AND IT WAS STILL CALLING `send` WITH TWO ARGUMENTS

in `toggleFav`

```
/* ---------- AND IT WAS STILL CALLING `send` WITH TWO ARGUMENTS ----------------------------
       `function send(body)` TAKES ONE. Written as `send('favourite', { … })` the body is the STRING
       `'favourite'`, which `api` then runs through `Object.assign({}, body)` — so what left the
       phone was `{"0":"f","1":"a","2":"v","3":"o","4":"u","5":"r","6":"i","7":"t","8":"e"}` and a
       token. Measured on the wire, not read: no `action`, no `itemId`, no `personId`. `doPost`
       reads `S(body.action)` as `''`, `accessDenied` refuses it before the handler is reached, and
       `.catch(() => {})` threw the refusal away.

       SO NO FAVOURITE HAS EVER BEEN WRITTEN, and the note above this one — which says every star
       "has been device-only" because it called a `saveProfile` that does not exist — describes the
       line under it accurately except for the action's name. The action was corrected and the
       shape of the call was not.

       IT IS WORSE THAN DEVICE-ONLY, and this is the half that makes it a live bug rather than a
       missing feature. `DATA.favourites` therefore always comes back empty, and `adoptFavourites_`
       replaces `FAVS` with it AND overwrites `localStorage` — so a star survives until the next
       payload lands and is then wiped from the device too. One page view.

       `collections.js` HAS THE WHOLE ARGUMENT WRITTEN OUT, twenty lines of it, because `toggleSpot`
       was this exact bug and was fixed. The star it was copied from was not. **This is why a fix
       to an instance is not a fix**, which is the sentence this repository keeps writing about
       `cost: 0` — and the reason `check-replies.js` now refuses a two-argument `send` outright. */
```

### PUT THE STAR BACK. `.catch(() => {})` was the other half of the disguise:

in `toggleFav`

```
/* PUT THE STAR BACK. `.catch(() => {})` was the other half of the disguise: the set is
         changed three lines up, so the star fills the moment it is pressed and the failure is
         discarded without a word. Somebody stars six things, sees six stars, reloads and has none.
         `toggleSpot` already does exactly this and its note says why. */
```

### THE WRAPPER, WHICH IS WHAT THE STYLE READS.

top level, before `on`

```
/* THE WRAPPER, WHICH IS WHAT THE STYLE READS. This toggled `is-fav` on the CARD — `.thing`,
     `.card`, `.paper` — while the rule that colours a starred star is `.favwrap.is-fav .star`. So
     the class landed on an element no rule was watching and the star never lit. The wrapper is also
     the only element guaranteed to exist here; the card is whichever of four builders drew it. */
```

### ---------- AND THE PAGES IN FRONT OF THE QUESTION

top level, before `F`

```
/* ---------- AND THE PAGES IN FRONT OF THE QUESTION ---------------------------------------------
     A saved thing is a PAGE now, so starring one does not change what is on a page — it changes how
     many pages there are. Nothing can be repainted in place for that; the strip has to be rebuilt.

     `paintStuff` IS EXACTLY THAT REBUILD and already keeps what must not be rebuilt: the question
     page is updated in place, so the search box does not lose the word you are typing. It lands you
     on the question afterwards, which is the right place to be left after adding something to the
     pages in front of it. */
```

### ---------- AND EVERY OTHER COLUMN THAT LISTS WHAT IS KEPT

top level, before `F`

```
/* ---------- AND EVERY OTHER COLUMN THAT LISTS WHAT IS KEPT --------------------------------------
     REPORTED AS "if i favourite something it does appear in right place, but then if i unfavourite
     it from the favourites tab its buggy and not responsive. should just dissapear."

     IT NEVER DISAPPEARED. This rebuilt `s-stuff` and nothing else, so unstarring from the Saved
     column took the row out of `FAVS`, relabelled the tile, repainted a screen you were not on, and
     left the card sitting exactly where it was. The only thing that moved was the word on the
     button — which reads as a tap that half-worked, because it is one.

     THREE CASES AND THEY ARE NOT THE SAME. On Saved, the card is a PAGE and removing it removes a
     page, so the column has to be rebuilt and the position clamped. On Find, a star adds or removes
     a page in front of the question, which is what `paintStuff(true)` already handles. Anywhere
     else — Tools, Games, a person's card — the card stays and is correct; what is now wrong is the
     Saved column you are not looking at.

     SO THE OTHERS ARE MARKED RATHER THAN REDRAWN, which is what `STALE` is for and what
     `receipt.js` already does for the booking column. Redrawing Tools from here would be worse than
     the bug: `paint` replaces the markup, `startScreen_` restarts what was in it, and unstarring a
     timer would put it back to 25:00. */
```

### `credits` is passed IN rather than read from `USER` here, because the page works it out once and hands it to every card — reading it per card would be the same

in `stuffCard`

```
/* `credits` is passed IN rather than read from `USER` here, because the page works it out once
     and hands it to every card — reading it per card would be the same lookup eight times a page.
     Dropping it while moving these was the one thing the branches needed from their old home, and
     nothing said so until a shop card asked what it could afford. */
```

### THE STAR IS NOT HERE ANY MORE — it is the first tile in the action row, drawn by `favTile_` inside `cardTiles_`, which every card builder already calls.

in `stuffCard`

```
/* THE STAR IS NOT HERE ANY MORE — it is the first tile in the action row, drawn by `favTile_`
     inside `cardTiles_`, which every card builder already calls. A floating button in the corner
     was the one control that was not where the others were, and it was the one people went looking
     for among them.

     THE WRAPPER STAYS. `.favwrap.is-fav` is what marks a kept card as kept at a glance on a list,
     and that is a fact about the CARD rather than about the button that set it.

     ---------------------------------------------------------------------------------------------
     AND THE ACTIONS ARE OUTSIDE THE CARD NOW, added here rather than by each builder.

     EVERY BUILDER USED TO END WITH `${cardTiles_(x)}` INSIDE ITS OWN MARKUP, which put the controls
     on the thing rather than under it — and on a past paper that is literal: `.paper` is a sheet of
     off-white exam paper, and the buttons were printed on it, below "ANSWER ALL QUESTIONS". A
     control belongs to the app, not to the document it acts on.

     ONE PLACE INSTEAD OF NINE. Nine builders each remembering to call it was nine chances to
     forget, and a card with no star was indistinguishable from a card nobody could keep. Now a
     kind added tomorrow gets its actions without anybody doing anything — the same reasoning that
     made the star a wrapper in the first place. */
```

### ---------- AND THE SAME WORDS, WHICH MEANS THE SAME SHORTENING

top level, before `CHIP_SHOW`

```
/* ---------- AND THE SAME WORDS, WHICH MEANS THE SAME SHORTENING ------------------------------------
   REPORTED AS *"the tags come out with full paper name"*: the chip read `PAPER Paper 1: Arithmetic
   — May 2019` while the button pressed to make it read `Paper 1`. `showOf` with no answer list is
   the LIBRARY-unique form -- right for something standing on its own, and a chip is not on its
   own: the chips in front of it are what narrowed the list the button was drawn over.

   SO IT IS LABELLED AGAINST THE CHIPS BEFORE IT AND THE WORDS IN THE SEARCH BOX, which is exactly
   the list the answer row saw: the facet's values over the items those leave, through `showOf` and
   `shortLabels_`, the same two steps `facetTally_` takes. The search words were left out at first,
   and with `2019` typed the menu read `Paper 1 | Paper 2 | Paper 3` and the chip pressed from it
   read `Paper 2: Reasoning — May 2019` -- the reported symptom, back behind a search. Not against
   every OTHER chip -- a question-number chip pressed after this one narrows the list to one paper,
   and the shortest form of one paper on its own is `Paper 1` whatever the year, which would hide the
   year again when nothing above says it. Memoised on the chip list, the search and the payload,
   because the chips are redrawn on every tap. */
```

### ---------- WHAT KIND OF TAG THIS IS, WHICH IS ITS COLOUR

top level, before `TAG_OF`

```
/* ---------- WHAT KIND OF TAG THIS IS, WHICH IS ITS COLOUR ------------------------------------------
   ASKED FOR AS *"add a colour for each tag. Like paper 1 2 3 etc should be red tags."* One word per
   KIND of answer rather than per facet, so the four questions that each narrow to one paper are one
   colour and the three that say who it is for are another. The answer row, the chip it becomes and
   the tag on the card all read this, so a red `Paper 1` is red wherever it is drawn. A field not
   named here has no tag and keeps the plain outline -- the two doors above all of them included,
   because they are where you go rather than what something is. The colours are tokens at `:root`
   (`--tag-paper` and the rest), because three components draw them. */
```

### WHICH ONE: the paper, and inside it the question, part, sub-part and page -- all red, because each names one thing of several as `Paper 1` does.

in `TAG_OF`

```
/* WHICH ONE: the paper, and inside it the question, part, sub-part and page -- all red, because each
     names one thing of several as `Paper 1` does. `marks` has no entry: its tag is the plain outline its
     chip wears, like every facet's that is not a kind. */
```

### ---------- `needs` IS A KIND AGAIN, AND STILL NOT GOLD

in `TAG_OF`

```
/* ---------- `needs` IS A KIND AGAIN, AND STILL NOT GOLD -------------------------------------------
     IT WAS LEFT OUT ON PURPOSE: it had been gold, the press colour of every answer, so a resting `What
     you need` answer read as one already pressed -- and it took the plain outline. Then the card's
     calculator became a tag (*"why do the questions say non calculator but its not a tag?"*), and a
     plain-outline tag is exactly the grey `Non-Calculator` pill that question was asked over. So it
     has a colour of its own, `--tag-needs`, which is not gold and is not any other kind's; the answer,
     its chip and the card's tag all wear it. */
```

### ---------- THE BIBLE'S SIX, IN KINDS THAT ALREADY HAVE COLOURS

in `TAG_OF`

```
/* ---------- THE BIBLE'S SIX, IN KINDS THAT ALREADY HAVE COLOURS --------------------------------------
     THE TRANSLATION IS WHO PUBLISHED THE WORDS, which is what a board is to a paper — teal. THE
     TESTAMENT IS THE LEVEL ABOVE THE GROUP — blue. THE GROUP IS WHAT THE BOOKS ARE ABOUT, a topic —
     orange. AND BOOK, CHAPTER AND VERSE SAY WHICH ONE, as `Paper 1` and `Q7` do -- red, three tags,
     [Genesis] [1] [3]. They were one coral `Genesis 1:3` in a `number` kind of their own; one tag per
     answer is the rule now, and a kind with no facet of its own went with it. */
```

### `chipKeyIn_` WAS HERE, and the small grey field name in front of every chosen answer with it (`.chip-k`).

top level, before `chipText_`

```
/* `chipKeyIn_` WAS HERE, and the small grey field name in front of every chosen answer with it
   (`.chip-k`). It printed `SUBJECT Maths`, `TYPE Worksheet`, `LEVEL SATs`, and left the name off
   only when the value already began with it, so `PAPER Paper 1` was not said twice.

   THE OWNER, on a pupil's iPad, 8 Oct: *"i dont need the category of the tag to appear with the
   choisen option in the finder."* Measured at 390x844 six answers in, the chips read `What for
   Learning✕ | What kind Questions✕ | Subject Maths✕ | Type Worksheet✕ | Level SATs✕ | Key stage
   KS2✕ | School year any✕ | clear✕`. Without the names the block is 79px tall as drawn instead of
   105 at 390x844, and 64 instead of 93 at 820x1180: one whole line of the question page at both
   widths, spent on words the colour already says. Every facet's values were read through `showOf`
   before it went, and none a person reaches needs its name to mean something — Grade is already
   `Grade 5`, School year `Year 4`, Paper `Paper 1`, a sitting `2024`. The two that did are said
   below, by rule, in the value. */
```

### ---------- WHAT A CHOSEN CHIP SAYS: THE VALUE, AND ONLY WHERE THE VALUE IS NOT ENOUGH, MORE

top level, before `chipText_`

```
/* ---------- WHAT A CHOSEN CHIP SAYS: THE VALUE, AND ONLY WHERE THE VALUE IS NOT ENOUGH, MORE -----
   · A SKIP says what it skipped: `Any school year`. It read `any`, which meant something only while
     the field's name stood in front of it.
   · A BARE NUMBER OF ONE TO THREE DIGITS keeps its field: `Chapter 119`, `Verse 16`. The Bible's
     two (an admin's), and the only values the walk through `showOf` found that are nothing alone —
     a lone `119` among the chips could be either. A year is four digits and says itself.
   · Everything else is `chipShow_`, exactly what its button said. */
```

### A SKIP IS A CHIP LIKE ANY OTHER, with the same ✕, because it is a decision somebody made and has to be able to unmake.

in `filterChips`

```
/* A SKIP IS A CHIP LIKE ANY OTHER, with the same ✕, because it is a decision somebody
             made and has to be able to unmake. A question silently dropped with nothing on screen
             saying so is the funnel "changing its mind" again — the complaint `whyThisQuestion()`
             was written for. */
```

### ---------- THE CHIP SHOWS WHAT THE BUTTON SHOWED, NOT WHAT IT MATCHES ON

in `filterChips`

```
/* ---------- THE CHIP SHOWS WHAT THE BUTTON SHOWED, NOT WHAT IT MATCHES ON -----------
             `f.value` WAS BOTH UNTIL `paperId` STOPPED BEING A NAME. A facet whose value is an
             identity supplies `showOf`, and without this the chip read `PAPER P-1MA1-1705-1H` —
             an account number where a paper's name had been. Caught on a screenshot of the tap
             that sets it, one commit after the value changed: the rule moved and its reader did
             not, which is the shape this file records under `resource_type` in `VOCAB`. */
```

### ---------- CLEAR IS A TILE BESIDE THE SEARCH BOX, NOT A CHIP AT THE END OF THE ROW

top level, before `filterClear_`

```
/* ---------- CLEAR IS A TILE BESIDE THE SEARCH BOX, NOT A CHIP AT THE END OF THE ROW -----------------
   IT HAS BEEN BOTH THE WRONG THINGS. It was grey text on nothing at the end of the chips, which read
   as a caption; it was then made "a chip like the others", with the pill, the outline, the fill and
   the ✕ — and the owner, 8 Oct, on a pupil's iPad: *"clear button looks like a tag which it isnt."*
   A chip in that row IS a tag: it is something you chose, and its ✕ takes that one thing back.
   Clear is not something you chose. It is an action on all of them.

   SO IT IS A TILE — CLAUDE.md's rule, tiles win any tie — with the pen's own bin and word (`pad-clear`,
   `Clear · every mark`), so "Clear" is one object wherever the app draws it. And it sits BESIDE THE
   SEARCH BOX, out of the row of tags altogether: the box and the bin are the two controls on the
   question page that act on the whole search rather than on one answer.

   FROM THE FIRST ANSWER ON, where the chip waited for the second. The box narrows to make room
   once, at the first press, and then stays where it is for the rest of the walk; at `> 1` it would
   narrow under your thumb at the second answer instead. Written into its own slot by `paintStuff`,
   so the search box beside it is never redrawn and keeps its focus and its caret. */
```

### THE PICKER SHEET IS GONE.

top level, before `f`

```
/* THE PICKER SHEET IS GONE. It asked which FIELD, then which VALUE — two taps and a panel over
   the screen before anything narrowed, and a list of every field whether or not it would change
   what you could see. The funnel asks the same questions in place, one at a time, already knowing
   which are worth asking.

   `filter-add` went with it. There is nothing to add: the next question is already on the page. */
```

### `on('group-by')` AND `on('group-open')` WERE HERE — press to see the papers, press one to open it.

top level, before `f`

```
/* `on('group-by')` AND `on('group-open')` WERE HERE — press to see the papers, press one to open
   it. Both set exactly the filter `facet-pick` sets, which is the whole argument for deleting
   them: the funnel now ASKS which paper once there are few enough to list, so opening one is
   answering a question, through the one handler that has always done that. */
```

### A BOOK OF THE BIBLE CHOSEN WAS FETCHED HERE TOO (docs/history/341), and the review of 12 Oct found nothing could tell:

top level, before `field`

```
/* A BOOK OF THE BIBLE CHOSEN WAS FETCHED HERE TOO (docs/history/341), and the review of 12 Oct found nothing
     could tell: the finder is in front when its chip is pressed, `paintStuff` fills the page in front and the
     band round it in this same task, and the first verse card drawn asks for its book (`bibleLoad_`) before
     this line was reached. A second door to the same fetch that no check can see is the shape this repository
     keeps deleting. The builder's `bible` job stays — Resources drawn for nobody, its question in front, is
     the one case where no card would ask first — and a journey asks it. */
```

### REDRAW THE RESULTS AND NOTHING ELSE.

top level, before `STUFF_WIN`

```
/**
 * REDRAW THE RESULTS AND NOTHING ELSE.
 *
 * The controls are page one and are never rebuilt — that is the whole reason they are a page of
 * their own. A search box redrawn on the keystroke loses its focus and its caret, and every
 * version of this screen so far has had a workaround for that somewhere.
 *
 * So the first `.page` is left exactly as it is and the rest are replaced. The chips live on that
 * first page too and DO get rewritten, because adding a filter is a press rather than a keystroke
 * and there is nothing to lose focus from.
 */
```

### `keepPage` — STAY WHERE YOU ARE --------------------------------------------------------------- THIS ALWAYS JUMPED YOU BACK TO THE QUESTION, and for a filter

top level, before `STUFF_WIN`

```
/* `keepPage` — STAY WHERE YOU ARE ---------------------------------------------------------------
   THIS ALWAYS JUMPED YOU BACK TO THE QUESTION, and for a filter change that is right: a filter is a
   new question and the answer to it starts at the beginning.

   IT IS WRONG FOR EVERY OTHER CALLER. Choosing a subject from a dropdown on the booking form calls
   this — the form is a page on this screen — and being thrown from the form back to the search box
   after every single answer is the "it scrolls up" nobody could work around. Same for starring a
   thing on a result page, and for the ✕ on a basket line.

   THE PAGE COUNT CAN STILL CHANGE UNDER IT — starring adds a saved page in front — so the index is
   nudged by however much the front of the list grew or shrank, rather than trusted blindly. Without
   that, a star on page twelve leaves you on page eleven's card. */
```

### THE RESULT PAGES ARE A WINDOW, AND THERE ARE FIFTEEN OF THEM WHATEVER THE LIBRARY HOLDS.

top level, before `STUFF_WIN`

```
/* ==================================================================================================
   THE RESULT PAGES ARE A WINDOW, AND THERE ARE FIFTEEN OF THEM WHATEVER THE LIBRARY HOLDS.

   REPORTED AS "when im clicking on questions and using the finder its so fycking slow man", then
   "its only slow on mobile" -- which is the tell. Every number in the funnel's arithmetic is
   memoised and measures 0 ms; what was left was DOM, and DOM is what a phone is slow at.

   MEASURED AT 8x CPU, one tap: **5,227 page elements**, 292 KB of markup, built from nothing. One
   page per RESULT, so the cost was the size of the LIBRARY rather than the size of the screen, and
   it grew with every paper transcribed. At 12x -- an ordinary mid-range phone -- a tap was 340 ms
   and a keystroke 233 ms.

   NOTHING EVER NEEDED MORE THAN ELEVEN. `fillStuffPages` puts markup into the pages within five
   either side of you and takes it out again when you leave; everything else in that strip was an
   empty box waiting to be scrolled past. So the strip holds fifteen -- eleven that can be drawn and
   two of slack at each end -- and slides.

   A PAGE NUMBER AND A DOM POSITION ARE NO LONGER THE SAME NUMBER. `PAGE_KEEP` and `PAGE_LO` in
   shell.js hold the two figures that map one to the other, and every reader of a page's position
   goes through `domIndex_` / `logIndex_`. Both are nought on every other screen, so this changes
   nothing for any column that builds all of its pages.

   THE ELEMENTS ARE RECYCLED RATHER THAN REBUILT. Sliding down by one moves the top page to the
   bottom, which leaves every other page holding the card it was already showing -- so turning a
   page still draws exactly one card, as it did before. Clearing the whole window on each slide
   would have been simpler and would have redrawn eleven cards every few turns.

   RE-CENTRED ONLY AT THE EDGES. Moving the window on every turn would mean recycling on every turn;
   waiting until you are within `STUFF_EDGE` of an end means most turns move nothing at all. */
```

### ---------- FORTY-ONE, ALL OF THEM FILLED, AND MOVED IN THE QUIET (docs/history/341)

top level, before `STUFF_WIN`

```
/* ---------- FORTY-ONE, ALL OF THEM FILLED, AND MOVED IN THE QUIET (docs/history/341) -----------------------
   THE OWNER, 11 Oct: *"If I scrol fast left right up or down it's still clunky … Increase loading scope.
   Make it more massive so it's never really an issue."* Measured that day at 4x CPU: fifteen elements with
   eleven filled was outrun by a run of flicks — the column's drawn position lags its target by up to eight
   pages in a run (each release re-aims a slide that has not finished), and the late pass that filled the
   far eight was one task of up to 551ms booked behind `afterSlide_`, which quick flicks starve by design.
   SO THE WINDOW IS FORTY-ONE, AND EVERY PAGE IN IT IS FILLED — by the builder, one card per idle slice,
   nearest first and on the side last travelled (`ahead_`, shell.js; the fill job below). Forty-one is the
   lag (8), a fifteen-flick run (15), three glass rows (3) and slack, and it is what the what-if measured:
   DOM up 250–1,150 elements, heap unchanged, no black glass. A filled card is bounded by the window, so
   the most this holds is forty-one cards per finder, and NOTHING INSIDE THE WINDOW IS EVER EMPTIED: a
   flick back up never rebuilds what it passed. Only a recycle releases a card.
   WHERE THE WINDOW SITS. In the quiet it is re-centred so the page in front is `stuffBehind_()` from the
   end it is leaving — thirteen behind and twenty-seven ahead going down (lag 8 + three glass rows + 2),
   mirrored going up — so a fifteen-flick run from rest never reaches an unfilled page. Inside a release it
   only slides, by `STUFF_STEP` (6) and only when fewer than `glassRows_() + 3` pages are left ahead: six
   at a time rather than one per turn, because each move is a shift the column has to be corrected for
   (`stuffKeepPlace_`, below), and the six it recycles are all thirty or more behind. */
```

### A PAGE THAT NOW STANDS FOR A DIFFERENT RESULT MUST NOT KEEP THE OLD ONE'S MARKUP.

top level, before `stuffBlank_`

```
/* A PAGE THAT NOW STANDS FOR A DIFFERENT RESULT MUST NOT KEEP THE OLD ONE'S MARKUP. The `filled`
   mark is what `fillStuffPages` reads, so taking it off is what asks for the redraw.
   AND IT KEEPS ITS HEIGHT, as a page emptied in `fillStuffPages` does — see `stuffPin_`. */
```

### AND ITS SCROLL PUT BACK, which the emptying beyond `STUFF_NEAR` used to do:

top level, before `stuffBlank_`

```
/* AND ITS SCROLL PUT BACK, which the emptying beyond `STUFF_NEAR` used to do: since docs/history/341 nothing
   inside the window is emptied, so a recycle is the one moment a page stops standing for its card — and a
   pane a reader had scrolled down would hand the next card to somebody half way through it. Only a pane
   `paneReach_` made scrollable can have been scrolled, and asking any other for its `scrollTop` would be a
   forced layout per page recycled (the note that was over the old emptying). */
```

### WHERE THE WINDOW STARTS, given how many results there are, how many pages come before them and where it started last time.

top level, before `stuffLo_`

```
/* WHERE THE WINDOW STARTS, given how many results there are, how many pages come before them and
   where it started last time. One function because TWO things build the window — `stuffWindow_`,
   recycling the elements already there, and `screen('stuff')`, drawing it from nothing — and two
   copies of this arithmetic would be two answers to which result is on which element. */
```

### `centre`: THE BUILDER'S RE-CENTRING, in the quiet — the page in front put `stuffBehind_()` from the end it is leaving.

top level, before `stuffLo_`

```
/* `centre`: THE BUILDER'S RE-CENTRING, in the quiet — the page in front put `stuffBehind_()` from the end it
   is leaving. Otherwise a turn: the window stays where it is unless fewer than `glassRows_() + 3` pages are
   left ahead, and then slides `STUFF_STEP` that way; a page outside the window altogether (a jump, a
   first draw) is centred as the quiet would centre it. */
```

### ---------- THE COUNT FIRST, AT THE TAIL

in `stuffWindow_`

```
/* ---------- THE COUNT FIRST, AT THE TAIL --------------------------------------------------------
     Growing appends and shrinking removes from the END, which is the high-numbered end of the
     window either way -- so the pages already in it keep both their contents and their page number,
     and the recycling below can be reasoned about on its own. */
```

### ---------- THE WINDOW MOVES, AND THE CARDS ON THE GLASS DO NOT

top level, before `stuffTop_`

```
/* ---------- THE WINDOW MOVES, AND THE CARDS ON THE GLASS DO NOT ---------------------------------------
   FOUND WHILE MEASURING *"if i scroll down quickly it does glitch out or clip fast or idk"* (8 Oct,
   the owner on a pupil's iPad), on the Corbettmaths subtraction sheet past its twelfth page. Every
   fourth turn the window re-centres, and the pages it moves from the top of the strip to the bottom
   take their height with them — so everything left in the column, the card in front included, is
   suddenly that much higher in the layout. The column is MID-SLIDE when that happens (the turn that
   asked for it has just been released), and a running slide is a `translate` going from one number
   to another: the layout jumped and the numbers did not. Measured at 820x1180: the card in front
   jumped 250–550px up in one frame and then slid back down to where it belonged, at every re-centring
   — 62 card-frames moving the wrong way in a run of twelve flicks, 40 at 390x844.

   `goPage`'s own placement was never wrong about where the column should END: it measures after the
   window moves. What was wrong was where the slide STARTED. So the column is moved by exactly what
   the layout moved, from where it is drawn this moment, before the turn's own slide is written over
   it a frame later — `colShiftNow_` in shell.js, which `holdColumn_` uses for a card above that
   changes height mid-slide. Nothing is drawn in between: this runs in the handler that turned the
   page, and the frame after it is the slide. */
```

### WHERE A PAGE SITS, TO THE FRACTION OF A PIXEL.

top level, before `stuffTop_`

```
/* WHERE A PAGE SITS, TO THE FRACTION OF A PIXEL. `offsetTop` is rounded, and a card's height is not: with the
   builder filling the window round the card you are reading (docs/history/341), each card drawn above it
   moved it by up to half a pixel the correction never saw, and a drawing meant to be still with less
   movement asked for shimmered on its own edges (check/anims.js). The box is read twice in one task, so the
   column's own transform — even mid-slide — is the same in both and cancels. */
```

### ---------- A NEW QUESTION IS READ FROM THE TOP OF ITS PANE

in `paintStuff`

```
/* ---------- A NEW QUESTION IS READ FROM THE TOP OF ITS PANE ------------------------------------------
     FOUND BY THE REVIEW, ON THE BIBLE'S GRIDS. Psalms's 150 chapters are taller than the question's pane
     on a 320x568 phone even drawn at `PANE_ZOOM_MIN`, so the pane scrolls (`paneReach_`), and you scroll
     it to reach 119. The tap rewrote `#stuff-groups` INSIDE that same pane and left its `scrollTop`
     where it was — so Psalm 119's 176 verses opened scrolled down by the same amount: the search box,
     the chips with the new CHAPTER 119 on them and the first rows of verses all above the glass, and
     below it a grid of the same coral numbers in the same columns with `119` in the same place.
     Nothing on the screen had changed, so the natural thing was to tap again — Verse 119, Psalm
     119:119, a verse nobody chose. Any long grid reached by scrolling did it (Psalms from about 66 at
     320 and 78 at 360), and a "Doesn't matter" pressed at a grid's foot.
     SO A REPAINT THAT ANSWERED SOMETHING PUTS ITS PANE BACK AT THE TOP, where the chip that says what
     just happened is — every one that sends you to the question (`facet-pick`, `facet-skip`,
     `filter-drop`, `filter-clear`, `bible-go`), in this one place rather than in each. `keepPage` is
     the repaint that keeps your place (a star, a card redrawn, the index landing), and that is left
     exactly where it was. The search box's own repaint comes through here too and is harmless: the box
     is at the top of this pane, so you are already there. `paneReach_` measures the new grid on its
     deferred pass, from the top, like any other. */
```

### ---------- WHAT MOVED IS THE FIRST RESULT, NOT THE QUESTION

in `paintStuff`

```
/* ---------- WHAT MOVED IS THE FIRST RESULT, NOT THE QUESTION ---------------------------------
     THIS READ `stuffQuestionPage_()` AND THAT NUMBER IS ALWAYS NOUGHT. `screen('stuff')` builds
     `[the question], frontPages_(), savedPages_(), …` — the question is FIRST and everything that
     can appear or disappear sits AFTER it. So the shift was measured off the one page in the strip
     that cannot move, and the comment over the star's handler claimed it moved you "by exactly
     that much" while it moved you by nought.

     REPORTED AS "when navigating up and down on the practicles, they just start bugging out. i
     dont know if its because i was favouriting things too." It was. Measured: six pages into the
     practicals reading `Microbiology`, press the star, and the same page number is now
     `Food tests` — because starring inserted a page in FRONT of the results and the page you were
     on kept its number while every result under it slid down by one. The card changes under your
     thumb and nothing anywhere says why.

     SO IT IS MEASURED OFF THE FIRST RESULT, which is exactly the count of pages before the results
     and the one number a star changes.

     AND THE OLD VALUE IS A FACT ABOUT THE DOM RATHER THAN ABOUT THE DATA. `stuffFirstResult_()`
     is derived from `savedPages_()`, which reads `FAVS` — and `toggleFav` has already written to
     it by the time this runs, so asking it here answers with the NEW number and the difference is
     always nought. My first fix did exactly that and moved nothing; the probe caught it because it
     reports the card it can see rather than the number it expected. The strip still standing is
     the only thing that remembers where the results used to start. */
```

### ---------- THE QUESTION PAGE IS NOT REDRAWN, AND THAT IS THE WHOLE POINT

in `paintStuff`

```
/* ---------- THE QUESTION PAGE IS NOT REDRAWN, AND THAT IS THE WHOLE POINT ---------------------
     This was `host.innerHTML = first.outerHTML + …`, which rebuilds the first page from its own
     serialised markup. `outerHTML` writes an input's ATTRIBUTE, and the text somebody has typed
     lives in the PROPERTY — so a hundred and eighty milliseconds after every keystroke the search
     box was replaced by a copy of itself holding the value it had when the screen was last built.
     Focus gone, caret gone, and the letters you had just typed gone with them.

     The comment above the search handler says the box is no longer part of what gets redrawn. It
     was written when that was true and this line made it false again.

     So only the RESULT pages are replaced. The question page — the search box, the chips, the
     counts, the facet list — is updated in place by the three lines at the top of this function,
     which is what they were for. */
```

### ---------- THE RESULT PAGES ARE REUSED, AND THIS LINE USED TO DESTROY ALL OF THEM

in `paintStuff`

```
/* ---------- THE RESULT PAGES ARE REUSED, AND THIS LINE USED TO DESTROY ALL OF THEM ------------
     REPORTED AS "when im clicking on questions and using the finder its so fycking slow man", and
     then "its only slow on mobile" -- which is the tell: the arithmetic is memoised and measures
     0 ms, so what is left is DOM, and DOM is what a phone is slow at.

     MEASURED AT 8x CPU, one tap on the funnel's first answer: **5,227 page elements destroyed and
     built again**, 292 KB of markup parsed, 50 ms to insert and 45 ms to walk. Every tap. Every
     keystroke. There is one page per RESULT, so the cost is the size of the library rather than
     the size of the screen -- and it grows with every paper transcribed.

     NONE OF IT IS NEEDED. The result pages are empty: `fillStuffPages` puts markup into the eleven
     you are near and takes it out again when you leave. An empty page is an empty page whichever
     item it is standing in for, so the only thing a repaint can change about them is HOW MANY there
     are. So the front and saved pages are rebuilt, which is a handful, and the blanks are counted:
     add the difference, remove the difference, and a repaint that does not change the count touches
     nothing at all.

     WHAT MAKES REUSE SAFE IS THE `filled` MARK. A page that is standing in for a different item now
     must not keep the markup it was given for the old one -- so every page that HAS been filled is
     emptied and unmarked here, and `fillStuffPages` draws the eleven it needs a moment later. There
     are never more than eleven of those, so it is a walk over eleven elements rather than 5,227. */
```

### ---------- ONE INSERT, IN THE ORDER `screen('stuff')` BUILDS

in `paintStuff`

```
/* ---------- ONE INSERT, IN THE ORDER `screen('stuff')` BUILDS -----------------------------------
     THIS PUT THE SAVED AND BASKET PAGES BEFORE THE QUESTION. `screen('stuff')` puts them after it —
     `[controls], frontPages_(), savedPages_(), blanks` (the basket was here too, and is a tool on
     the Tools column now) — and the note that used to
     be here claimed the two agreed. They did not, and the note four lines above it had already
     named the risk: "Two ways of ordering the same page list, twenty lines apart, is a good way to
     get one of them the wrong way round."

     WHAT THAT DID. `stuffFirstResult_` counts the first result as
     `question + 1 + front + saved + basket`, which is right for the order the screen is BUILT in.
     Move saved and basket in front of the question and `stuffQuestionPage_()` already includes
     them — so they were counted twice, the first result was placed one page too far down for every
     saved thing, and the gap was a page with a pane and nothing in it. Star one thing and a blank
     card appears under the question; star two and there are two.

     It only happened after a repaint, which is why the screen looked right until you pressed a star.

     ONE INSERT AND ONE ORDER. The string's own order is the order, so there is nothing to reason
     about — `afterend` with four separate calls is what made the old code need a paragraph
     explaining that the last one lands nearest. */
```

### ---------- SAVED IS A COLUMN AGAIN, SO IT IS NOT A PAGE HERE

in `paintStuff`

```
/* ---------- SAVED IS A COLUMN AGAIN, SO IT IS NOT A PAGE HERE --------------------------------
     `savedPages_()` WAS IN THIS LIST and the things you had starred sat between the question and
     the results. It has its own column now, right of Games — see `savedCards_` in arcade.js for
     why that stopped being a duplicate — and two homes for one list is the fault this repository
     records under `documents_()`, `factsNow_` and `childrenOf`.

     AND IT COST MORE THAN TIDINESS, which is the half worth keeping. A star ADDED A PAGE IN FRONT
     OF THE RESULTS, so every result below it slid down by one while the page you were standing on
     kept its number — reported as "when navigating up and down on the practicles, they just start
     bugging out. i dont know if its because i was favouriting things too." It was. The shift in
     `paintStuff` is repaired either way, because `frontPages_()` can still change; with the saved
     things gone from here, pressing a star changes nothing about this strip at all. */
```

### ---------- AND THE BLANKS, BY DIFFERENCE

in `paintStuff`

```
/* ---------- AND THE BLANKS, BY DIFFERENCE ------------------------------------------------------
     WITH A PANE IN IT. These were bare `<section class="page">`, and a page with no pane is a page
     with no glass -- so every result was drawn straight onto the black while the question above it
     sat on a card. `pages()` builds every other page in the app this way.

     APPENDED AT THE END OF THE HOST, which is where the results belong: the question page is first,
     the front and saved pages have just been put after it, and everything beyond them is a result.
     Removing from the end for the same reason -- which page element stands for which item is
     decided by position and nothing else, so the ones to drop are the last ones. */
```

### ---------- AND THE RESULTS, WHICH ARE A WINDOW

in `paintStuff`

```
/* ---------- AND THE RESULTS, WHICH ARE A WINDOW ------------------------------------------------
     THROWN AWAY AND REMADE, which is the cheap option now rather than the expensive one: there are
     never more than `STUFF_WIN` of them, and starting from nothing means the window's offset cannot
     be left describing a strip that no longer exists. A new filter is a new list of results, so
     every page in the window is standing for something different anyway. */
```

### AND BACK TO THE TOP OF THE RESULTS.

in `paintStuff`

```
/* AND BACK TO THE TOP OF THE RESULTS. A filter is a new question, and the answer to it starts at
     the beginning — `paintPager` only CLAMPS, so changing a filter while on page twenty of the old
     results landed you on the last page of the new ones, which reads as the app having lost its
     place. */
```

### ON THE QUESTION, NOT ONE BEFORE THE RESULTS.

in `paintStuff`

```
/* ON THE QUESTION, NOT ONE BEFORE THE RESULTS. Those were the same page until the booking pages
     went between them; `stuffFirstResult_() - 1` is now the last of those, so answering "what for"
     would have dropped you at the foot of the booking form rather than on the question you just
     answered. Zero is no good either — that is a saved thing. */
```

### ONLY WHAT IS PAST THE LEADING PAGES MOVES.

in `paintStuff`

```
/* ONLY WHAT IS PAST THE LEADING PAGES MOVES. The question is page nought under every ordering,
     and a saved page you were looking at is still the page it was — it is the RESULTS that slide.
     So a position before the first result is left exactly where it is, and one at or past it is
     carried by the same amount the results moved. */
```

### CLAMPED TO THE COLUMN'S PAGE COUNT, NOT TO `host.children.length`.

in `paintStuff`

```
/* CLAMPED TO THE COLUMN'S PAGE COUNT, NOT TO `host.children.length`. That was the page count
     before the strip was windowed and is about sixteen now — so a star, a repaint of a card or a
     booking dropdown on result forty put you on page fifteen: a different card, under your thumb.
     Measured, not reasoned: the same probe that found the repaint fault above. */
```

### AND THE WINDOW IS BUILT AROUND THE PAGE WE ARE GOING TO BE ON, so it is decided first.

in `paintStuff`

```
/* AND THE WINDOW IS BUILT AROUND THE PAGE WE ARE GOING TO BE ON, so it is decided first. Built
     around the old one, a shift of a page or two in front could put the new page just past the
     window's edge, where there is no element to fill. */
```

### THE PAGES YOU CAN SEE, AND ONE EITHER SIDE.

top level, before `layout`

```
/**
 * THE PAGES YOU CAN SEE, AND ONE EITHER SIDE.
 *
 * A page two turns away is off-screen and behind two others; its markup is a cost with no reader.
 * So a page is filled when it comes within reach and emptied when it leaves, which keeps the
 * document the size of five screens however long the library grows.
 *
 * Filled INDIVIDUALLY rather than by rewriting the strip, because rewriting it mid-turn destroys
 * the elements the transition is animating and the dial jumps instead of turning.
 */
```

### ---------- THE ONE RULE THIS SCREEN KEPT BREAKING

top level, before `layout`

```
/* ---------- THE ONE RULE THIS SCREEN KEPT BREAKING -----------------------------------------------
   WHERE A CARD SITS DEPENDS ON HOW TALL THE CARDS ABOVE IT ARE. So anything that changes what is on
   a card has changed the layout, and has to say so.

   This function is the only place in the app that writes into a pane after the grid has been
   placed — it fills the pages you are near and empties the ones you are not — and it never said a
   word. Worse since the fill was moved to AFTER the slide: every position was then worked out
   against panes that were still empty, so a 400px docket was placed as though it were nothing and
   landed on top of the game below it.

   No observer, and deliberately not. Watching every pane for a size change was what used to make
   this screen stutter, and it answered a question nobody needed asked continuously. Content changes
   here, in one function, on purpose — so the telling belongs here too, once, at the end. */
```

### THE LAYOUT DOCTOR — `layout()` in the console, or tap the version line on the You screen.

top level, before `layout`

```
/* ==================================================================================================
   THE LAYOUT DOCTOR — `layout()` in the console, or tap the version line on the You screen.

   WHY THIS EXISTS. Every layout fault on this app has been fixed by somebody reading code and
   reasoning about what the boxes must be doing, and the boxes have disagreed roughly half the time.
   Reading cannot tell you that a pane measured 0 because it had not been filled, or that a rule
   thirty lines further down clipped the column. Only the browser knows, and it will say if asked.

   So this asks. It prints, for the screen you are on, every page's REAL top, height and gap, and
   the two facts that have actually gone wrong over and over:

     OVERLAP    two cards occupying the same pixels — the fault you can see
     UNFILLED   a page with nothing in it, which is what makes a card land on another

   Paste what it prints. It is the difference between a fix and a guess.
================================================================================================== */
```

### ---------- ACROSS, BEFORE ANYTHING ELSE

in `layout`

```
/* ---------- ACROSS, BEFORE ANYTHING ELSE -----------------------------------------------------
     The vertical report below has been useful and it says nothing about the thing most often
     wrong: how far apart the COLUMNS are and how much of the next one you can see. Three rounds
     have gone on that with me reasoning from code and you telling me it is still wrong, which is
     exactly the loop this function exists to end.

     It prints what the browser actually did — the real width of a card, the real distance to the
     next column, the real number of pixels of it inside the screen, and whether it is being drawn
     faintly enough to be invisible on a black background. */
```

### `STUFF_NEAR` WAS HERE — five pages either side filled, and everything past them emptied again.

top level, before `STUFF_LATE`

```
/* `STUFF_NEAR` WAS HERE — five pages either side filled, and everything past them emptied again. It is gone
   as a rule (docs/history/341): the whole window is filled, by the builder in the quiet, and nothing in it
   is emptied; only a recycle releases a card (`STUFF_WIN`'s note). Its own advice — "raise it if a fast
   flick still lands on a blank page" — was taken as far as it goes. */
```

### ---------- THE THREE UNDER YOUR THUMB NOW, THE OTHER EIGHT A FRAME LATER

top level, before `STUFF_LATE`

```
/* ---------- THE THREE UNDER YOUR THUMB NOW, THE OTHER EIGHT A FRAME LATER -------------------------
   REPORTED AS "it takes long to load when i click questions on phone", and measured at 20x CPU --
   an ordinary phone with something else running:

     | answering a funnel question | 735 ms |
     | a search                    | 997 ms |
     | laying out ELEVEN cards     | 935 ms |
     | laying out ONE card         |  69 ms |

   So the tap IS the eleven cards, and ten of them are pages nobody is looking at. `STUFF_NEAR`'s
   own note is right about why it is five and must stay five -- "a flick that carries three or four
   pages outruns it and lands on an empty page while the fill catches up" -- and that argument is
   about the pages being THERE, not about their being there in the same frame as the tap.

   A FINGER CANNOT TRAVEL THREE PAGES IN ONE FRAME. The near three are built before the paint, so
   what you asked for is on the screen; the rest arrive on the next turn of the event loop, which
   is the same move this file already makes for the page top-up. Booked once, and a second fill
   cancels the first, so a run of quick taps does the far work once at the end rather than per tap.

   KEYED ON NOTHING AND CANCELLED BY IDENTITY, because the only job is "finish the fill" and the
   only thing that can invalidate it is another fill.
   ---------- AND THE REST ARE NOW THE BUILDER'S, ONE CARD PER IDLE SLICE (docs/history/341) -----------
   "The next turn of the event loop" was one task of eight cards, measured at up to 551ms at 4x — and
   booked behind `afterSlide_`, which a run of quick flicks starves, so it ran exactly when the run
   stopped and the next flick began. The near three are still built in the tap, for the reason above;
   everything else in the window is filled by `ahead_` (shell.js) in the quiet, one card at a time,
   nearest first. `STUFF_LATE` is left only for measuring the cards a pass has just drawn. */
```

### ---------- A CARD TALLER THAN THE PANE, WHICH USED TO BE RARE

top level, before `PANE_REACH`

```
/* ---------- A CARD TALLER THAN THE PANE, WHICH USED TO BE RARE -----------------------------------
   `.pane`'s own note chose `overflow: hidden` deliberately and priced the cost honestly: "a card
   taller than the screen has its bottom cut off ... the right trade -- a screen where swiping does
   not reliably swipe is worse than one where a RARE card needs shortening."

   IT IS NOT RARE ANY MORE. `check/cards.js` measures it now, through the app's own `questionCard_`,
   one card per pane: **431 of 5,032 question cards run past the 534px pane on a 320x568 phone**,
   the worst by 2,816px, and 53% of the AQA Combined Science ones. A science question is a
   paragraph, an eight-step method, a table, a figure and then the ask -- and the ask, the answer
   box and the mark scheme are the part below the fold. Screenshotted: Q02.4 of Biology Paper 1
   shows its method and cuts off before the question it is asking.

   AND THE FAULT THAT NOTE WARNS OF IS THE ONE THE APP HAS SINCE LEARNED TO MEASURE. Its words are
   "which one you got depended on whether the pane happened to be a pixel taller than its box" --
   which is exactly the ambiguity `axisFree` now resolves with a floor, and which the textarea entry
   in overworld.js records being fixed the same way. A pane within `PANE_REACH` of fitting is left
   `hidden` and the grid keeps the gesture, so the pixel-taller case cannot arise; a pane a third of
   a screen too long is not ambiguous and is handed to the reader.

   THE FLOOR IS 24 RATHER THAN THE WALK'S 6, deliberately. Six is right for "is there text below the
   fold in a box you are typing in"; here the competing gesture is the app's whole navigation, so
   the answer has to be obvious rather than merely true.

   IT WAS ON THE FUNNEL'S PANES AND NOWHERE ELSE, on the strength of a sentence that said
   `check/ui.js`'s OUT OF REACH rule reported nothing on the other nine columns. IT DID, and the
   reason it did not say so is that it gave every width an 844px-tall viewport: its "320px phone"
   was a 320x844 device that has never been made, with a pane 807px tall against a real iPhone SE's
   534. Paired with real device heights the same rule names twenty-one panes across nine columns at
   320x568. So the narrowness this comment claimed was an artefact of the instrument, and it is
   called for the screen you are on from `placeNow_` in shell.js as well -- where every card in the
   app that grows after its paint already arrives. */
```

### ---------- AND AN ESSAY'S CARD, NO SMALLER THAN KEEPS ITS TILES AT 44px

top level, before `PANE_ZOOM_ESSAY`

```
/* ---------- AND AN ESSAY'S CARD, NO SMALLER THAN KEEPS ITS TILES AT 44px ------------------------------
   A CARD WITH AN ESSAY SHEET ON IT (`ansEssay_`, docs/history/312) is drawn smaller only while that
   alone makes it fit with its 48px tiles still 44px or more (44 / 48 is 0.917); past that it is drawn
   at full size and its pane scrolls, as every card past `PANE_ZOOM_MIN` does. The review of 9 Oct found
   it at 320x568: the sheet had already given way to its five-line floor (`kpSheetFit_`, keypad.js) and
   the question over it still did not leave room, so the card went to 0.843 -- Mark with AI 40px, the
   sheet 188px wide, writing at 13.5px -- the one size where the essay was worse than the chat bar it
   replaced, which fitted there at full size. Zoom is the owner's answer for a card a little too tall;
   a card a page of writing tall is the case it was never for, because the thing being shrunk is the
   page the pupil writes on and the tile they mark it with. With the pad up, `kpRoom_` finds the pane
   as its scroller and scrolls the sheet and its row above the pad, as for any scrolling card. */
```

### EVERY READ, THEN EVERY WRITE, AND IT IS THE WHOLE COST OF THIS FUNCTION.

top level, before `paneReach_`

```
/* EVERY READ, THEN EVERY WRITE, AND IT IS THE WHOLE COST OF THIS FUNCTION. The first version took
   one pane at a time -- read `scrollHeight`, write `overflowY` -- and a CPU profile of the tap put
   it at **407 ms of 920, the single biggest thing on the screen**, because a style write
   invalidates the layout the next read has to force again. Eleven panes is eleven layouts. Read
   them all first and it is one.

   AND IT IS BOOKED AFTER THE PAINT RATHER THAN DURING IT. Whether a card scrolls only matters when
   a thumb tries to scroll it, which is at least a frame away; doing it on the tap path spends that
   layout in front of the thing somebody is waiting for. See the `setTimeout` in `fillStuffPages`. */
```

### ---------- SHRINK TO FIT FIRST, AND SCROLL ONLY PAST THE FLOOR

in `paneReach_`

```
/* ---------- SHRINK TO FIT FIRST, AND SCROLL ONLY PAST THE FLOOR ---------------------------------
       REPORTED WITH A SCREENSHOT OF A TUTOR'S CARD ON A PHONE: "this stretches beyond it and causes
       scrolling. I don't like scrolling. If you need to leave things more compact or smaller font.
       This goes for all widgets so they all fit on screen."

       SO A CARD TALLER THAN ITS PANE IS DRAWN SMALLER, by CSS `zoom` on the pane's children — which,
       unlike a `transform: scale()`, is a LAYOUT property: the card re-flows at the smaller size, the
       pane measures what is really there, and nothing is painted outside a box that does not know
       about it. That last half is the fault `.mat-out` cost this project twice.

       MEASURED AT ZOOM 1 EVERY TIME, not nudged from the zoom it already has. Zooming out widens the
       card in its own pixels, so text wraps less and the card gets shorter than the ratio predicts —
       which means a zoom computed as "pane over natural height" is guaranteed to fit, and one nudged
       from the last value oscillates: shrink, find slack, grow, overflow, shrink. Resetting and
       re-setting in one task is deterministic, and the `ResizeObserver` below sees the same final
       size it saw before, so it does not feed itself.

       THE FLOOR IS WHERE THE WORDS STOP BEING WORDS. `PANE_ZOOM_MIN` of the ordinary size is about
       10px text on a phone; below that a card is not "more compact", it is unreadable, and a
       question card 2,800px tall would come out as a column of grey. Past the floor the pane scrolls,
       which is the old behaviour and is now the last resort rather than the first.

       WHAT IT COSTS, SAID RATHER THAN BURIED: a zoomed card's 44px tap targets are 44px times the
       zoom. That is the trade the report asked for, and `check/ui.js` measures a control at its own
       size and counts the zoomed panes separately, so the cost is a number rather than a silence. */
```

### AN ESSAY'S SHEET GIVES WAY BEFORE ITS CARD IS DRAWN SMALLER -- `kpSheetFit_` in keypad.js.

in `paneReach_`

```
/* AN ESSAY'S SHEET GIVES WAY BEFORE ITS CARD IS DRAWN SMALLER -- `kpSheetFit_` in keypad.js. Measured
       on 9 Oct: a three-paragraph essay grew its sheet, its card passed the pane at 390x844, and this
       zoomed the whole card to 0.87 -- the writing smaller, the Mark tile 38px, the sheet 242px wide.
       The sheet scrolls inside anyway; so it is the sheet that gets shorter, and the card stays at
       full size. Only panes that hold one, so every other pane is measured exactly as before. */
```

### AND A LIBRARY CARD GIVES UP ITS BLANK BAND FIRST — `libFit_` in me.js, the sheet's rule for the one card whose height follows its width:

in `paneReach_`

```
/* AND A LIBRARY CARD GIVES UP ITS BLANK BAND FIRST — `libFit_` in me.js, the sheet's rule for the
       one card whose height follows its width: the faces narrow, keeping their shape, until the page
       fits or the band runs out, and only what is left is drawn smaller (docs/history/332). */
```

### AND A CARD WITH A FIGURE IN IT GIVES WAY THE SAME WAY -- `cardFigFit_`, the sheet's answer for a picture (356):

in `paneReach_`

```
/* AND A CARD WITH A FIGURE IN IT GIVES WAY THE SAME WAY -- `cardFigFit_`, the sheet's answer for a
       picture (356): the words to the zoom floor, then the picture to its floor, and the pen's 44px tiles,
       the box and the row under the card never at all. Every pane holding a card with a picture, pen or
       not, so a card that no longer needs it has its words put back to full size. */
```

### ---------- AND A CARD WITH A FIGURE IN IT IS NEVER DRAWN SMALLER WHOLE

in `paneReach_`

```
/* ---------- AND A CARD WITH A FIGURE IN IT IS NEVER DRAWN SMALLER WHOLE ------------------------------
       The open list's answer below, for the same reason: a figure is there to be read and, under a pen,
       drawn on, and a picture at 0.7 is its labels at 6px and its pen's tiles under 44. `cardFigFit_` has
       already taken what can give; what is still over scrolls from its first pixel, so nothing on the card
       is ever cut off by the pane with no scroll to reach it. Found in 327's review on the 5-a-day dice
       tables at 320x568, drawn whole at 0.7 and still 9px over, the row under the card cut in half. */
```

### ---------- AND A LIST OF TICKS THAT IS OPEN IS NEVER DRAWN SMALLER

in `paneReach_`

```
/* ---------- AND A LIST OF TICKS THAT IS OPEN IS NEVER DRAWN SMALLER --------------------------------
       THE BOOKING FORM'S SEVERAL-ANSWERS ROWS AND THE SETTINGS COLUMN'S VENUES open a list of checkboxes
       in the card (note 315), and the review of 9 Oct measured what this did to them: twelve subjects
       open at 390x844 took the card to 0.70 — tick rows 31px, the receipt's words 5.8px — and the
       Child list at 320x568 to 32px rows. A tick row is 44px IN px because a fingertip is the same size
       on every screen (CLAUDE.md), and the list is open precisely to be pressed. So a pane holding one
       is drawn at full size and scrolls, which is the essay's answer above for the same reason, and it
       goes back to fitting the moment the list is shut. `tickListShow_` (book.js) brings the opened
       list into the pane, for the booking form and the settings column alike. */
```

### ---------- AND NEITHER IS A CARD BEING EDITED (`cardEditHtml_`, me.js; docs/history/330)

in `paneReach_`

```
/* ---------- AND NEITHER IS A CARD BEING EDITED (`cardEditHtml_`, me.js; docs/history/330) ---------------
       It is every section of a tutor's card as one form, and measured with the widest profile the lab
       holds it is 2051px tall at 320x568 and 2143px at 390x844, in panes of 532 and 805. At the 0.70
       floor it is still 1502 and 1570 — it scrolls either way — so drawing it smaller buys no fit and
       costs every box, tick and tile on it 30% of its size, under a thumb that is there to press them.
       The tick list's answer above, for the tick list's reason: full size, and the pane scrolls. */
```

### ---------- NOR "MANAGE YOUR CHILD" (`childManageCard_`, me.js; the review of docs/history/339)

in `paneReach_`

```
/* ---------- NOR "MANAGE YOUR CHILD" (`childManageCard_`, me.js; the review of docs/history/339) ----------------
       It is the two child forms that were two Settings pages at full size, now one card under the list of your
       children, and at 320x568 this drew it at 70-97% — every box, button and New PIN tile under 44px (31px with
       three children and the slip), where the two cards it replaced had none. Two forms are not a card a little
       too tall, which is what the zoom is for; they are boxes there to be typed into and buttons to be pressed,
       the card editor's case above. Full size, and the pane scrolls from its first pixel over. */
```

### AND THE CARD KEEPS ITS OWN WIDTH, so it is the same card drawn smaller rather than a wider card re-flowed.

in `paneReach_`

```
/* AND THE CARD KEEPS ITS OWN WIDTH, so it is the same card drawn smaller rather than a wider
       card re-flowed. Zoom alone does not shrink anything whose height follows its width — a game
       board, a 4:5 photograph, a square week grid — because at zoom 0.8 the card is a quarter wider
       in its own pixels and the board grows to fill it. Measured on the Games column the first time:
       zoomed to 0.91 and still 24px past the pane. Pinned to the width it had at zoom 1, everything
       scales by exactly the same factor and the zoom that was asked for is the zoom that fits. */
```

### ---------- AND IT STAYS CENTRED WHERE IT WAS, WHICH `margin-inline: auto` DID NOT DO

in `paneReach_`

```
/* ---------- AND IT STAYS CENTRED WHERE IT WAS, WHICH `margin-inline: auto` DID NOT DO -----------
       THIS WAS `margin-inline: auto`, which centres a child only when the zoomed width fits inside
       the pane's content box. A post does not: `.pane > .post` bleeds into the pane's padding with a
       negative margin so its photograph reaches the glass, so it is wider than that box — and a zoom
       of about 0.92 or more left it wider still, the auto margins resolved to nought, and the card
       started at the padding's edge and hung off the right. Measured at 390x844 on a 9:16 portrait
       zoomed to fit: the photograph at 45→356 inside a card at 32→358, thirteen pixels of card on
       the left and two on the right. It surfaced when a post photograph stopped being a fixed 4:5
       box, because that is when a post first grew past its pane at 390.

       SO THE CENTRE IS KEPT, which is `auto` for every ordinary card and the right answer for one that
       bleeds. `zoom` scales an element's margins with everything else, so the margin is written
       divided by the zoom and lands where it was worked out. Measured after: 7.5px either side. */
```

### ---------- A ZOOM THAT CHANGED MOVES THE PAGES UNDER IT, SO THE COLUMN IS PLACED AGAIN

in `paneReach_`

```
/* ---------- A ZOOM THAT CHANGED MOVES THE PAGES UNDER IT, SO THE COLUMN IS PLACED AGAIN ---------
       A SHRUNK CARD IS A FEW PIXELS SHORTER THAN THE CAPPED PANE IT REPLACED — the zoom is rounded
       down so it fits — and on the Find screen fifteen pages sit above the one you are on. The
       column was placed before this ran, so the page in front drifted: `check/ui.js` caught it 46px
       off the bottom of a 320x568 phone, only on runs where the machine was busy enough for the
       deferred measuring to land after the placement. `placeCells` coalesces to one frame, and the
       placement it books calls back into here, finds nothing changed, and stops. */
```

### `overflow-y` AND NOT `touch-action`, WHICH IS THE OPPOSITE OF WHAT `padReach_` DOES AND IS DELIBERATE.

in `paneReach_`

```
/* `overflow-y` AND NOT `touch-action`, WHICH IS THE OPPOSITE OF WHAT `padReach_` DOES AND IS
       DELIBERATE. `pan-y` hands the whole vertical axis to the browser for the whole gesture, and
       `touch-action` cannot say "at the bottom, going up" -- measured, a card set to pan could be
       scrolled to its end and then could not be left by swiping at all, three swipes and the page
       never turned. The pane stays `touch-action: none` and `scrollHost_` in overworld.js scrolls
       it from the app's own drag, which hands over to the grid the moment there is nothing left. */
```

### AN OPEN LIST SCROLLS FROM ITS FIRST PIXEL OVER, not from `PANE_REACH`'s 24:

in `paneReach_`

```
/* AN OPEN LIST SCROLLS FROM ITS FIRST PIXEL OVER, not from `PANE_REACH`'s 24: drawn at full size
       instead of fitted, the little it is over is the card's own foot — the Send tile — and 24px of that
       clipped with no scroll is a tile half there. */
```

### WRITTEN ONLY WHERE IT CHANGES, which is what stops `paneWatch_` below feeding itself:

in `paneReach_`

```
/* WRITTEN ONLY WHERE IT CHANGES, which is what stops `paneWatch_` below feeding itself: on a
       desktop a classic scrollbar takes width off the card, the card rewraps, the observer fires,
       and a write that sets the value it already had would go round again for ever. */
```

### A CARD WITH A PEN THAT HAS TO SCROLL OPENS SCROLLED TOWARDS ITS FOOT -- the picture to draw on and its bar on the glass -- AND NO FURTHER THAN PUTS THE

in `paneReach_`

```
/* A CARD WITH A PEN THAT HAS TO SCROLL OPENS SCROLLED TOWARDS ITS FOOT -- the picture to draw on and
           its bar on the glass -- AND NO FURTHER THAN PUTS THE PICTURE'S TOP AT THE TOP OF THE PANE (337,
           after review): on a phone on its side the transformations stem is taller than the pane alone, and
           opened at its foot it would be the bottom half of four graphs under a pen. Once, as the pane starts
           to scroll; never again while it does, so a child who scrolled up to read is left where they are.
           Eight pixels above it, for the gold frame an armed pen draws round it. A card with a picture and no
           pen opens at its top, where its words start, as every card does. */
```

### ---------- AND A CARD THAT GROWS AFTER ITS SCREEN WAS PLACED

top level, before `PANE_WATCH`

```
/* ---------- AND A CARD THAT GROWS AFTER ITS SCREEN WAS PLACED ------------------------------------
   MEASURING ONCE PER PLACEMENT IS NOT ENOUGH, and four of the columns proved it the first time
   `check/ui.js` was pointed at a real 320x568 phone: the Scrabble board and the high-score board
   draw into a card AFTER `startScreen_` has started the widget, the camera adds 167px of controls
   when a photograph is taken, and `drawBooker()` REPLACES the booking card outright — which throws
   away the inline `overflow-y` with the element that carried it. Every one of those is a pane that
   was measured while it fitted and overflowed a moment later.

   THE APP'S ANSWER SO FAR HAS BEEN ONE HOOK PER GROWER — the camera calls `placeCells` at each of
   the four places its card changes height — and the trouble with that is that it has to be
   remembered by whoever writes the next card that grows. This is the same fact declared once
   instead: a card whose height changes re-asks the question about the pane it is in.

   ON THE CARD, NOT THE PANE. A pane is `max-height`-capped, so it stops growing at the cap and the
   growth that matters is exactly the growth it can no longer show — an observer on the pane would
   go quiet at the moment it became worth hearing from.

   RE-OBSERVED PER SCREEN AND UNOBSERVED PER SCREEN, which is the one thing here that had to be got
   right. A `paint` replaces a screen's cards, so the elements being watched are detached and a
   `ResizeObserver` holds them alive until it is told otherwise — and the obvious `disconnect()` is
   wrong, because `paintNeighbours` paints every other column and would drop the watch on the one
   you are looking at. So each host remembers what was observed on its behalf and only that is let
   go. One observer, because the cost of a ResizeObserver is per observed element rather than per
   observer.

   THE ONE CASE IT CANNOT SEE IS A ROTATION: the pane's own cap moves and the card does not, so
   nothing resizes. That is why `placeNow_` calls this as well — a resize arrives there. */
```

### ---------- AND IT MEASURES A FRAME LATER, NOT INSIDE THE OBSERVER'S OWN CALLBACK

top level, before `PANE_WATCH`

```
/* ---------- AND IT MEASURES A FRAME LATER, NOT INSIDE THE OBSERVER'S OWN CALLBACK ----------------
   A ZOOM THAT CHANGES INSIDE THE CALLBACK CHANGES THE SIZE THE CALLBACK WAS TOLD ABOUT, and the
   browser reports that as "ResizeObserver loop completed with undelivered notifications" — an error
   event on `window`, which `overworld.js` turns into a gold banner reading "Something went wrong".
   It was always possible and nothing had produced it: every card that grew after its placement grew
   to a size that still fitted. A post photograph in its own proportions is the first that does not —
   a portrait lands, the card passes its pane, the callback zooms it, and the banner went up over the
   feed on the first open. Measured at 390x844. Nothing was broken; the notification the browser
   calls undelivered is simply delivered next frame. So the callback only collects which panes moved
   and one `requestAnimationFrame` measures them, which is outside the observer's delivery and so
   cannot loop. The one frame of an un-zoomed card is the frame the picture arrived in. */
```

### ---------- ONLY THE PANES IT HAS NOT ALREADY MEASURED

in `paneWatch_`

```
/* ---------- ONLY THE PANES IT HAS NOT ALREADY MEASURED -------------------------------------------
     THIS RAN `paneReach_` OVER EVERY PANE ON THE SCREEN ON EVERY PLACEMENT — including the one in the
     frame a finger lifts — and `paneReach_` takes each card's zoom off, measures it at full size and
     puts it back. Measured at 4x CPU on a Settings release: 34 computed-style reads, 22 rectangles,
     8-19ms, all to arrive at the zoom every card already had. That frame is the one the settle
     starts in, so it was spent on nothing while the card waited.

     A PANE IS MEASURED WHEN IT IS NEW, OR WHEN THE SCREEN CHANGED SIZE. New is a card this host has
     not seen — a paint replaces the elements, so a repainted card is new by construction; a card
     that grows in place is the `ResizeObserver`'s below, which was already the thing that caught
     it. What the observer cannot see is the pane's own cap moving on a rotation, so a change of
     viewport measures everything again, as every placement used to. */
```

### ---------- AND HOW TALL EACH PANE WAS, FOR THE DAY IT IS EMPTIED

in `PANE_WATCH`

```
/* ---------- AND HOW TALL EACH PANE WAS, FOR THE DAY IT IS EMPTIED ------------------------------
         `stuffPin_` holds an emptied page at the height it had, so the cards under it do not move —
         and it must know that height without asking for it, because asking (`offsetHeight` after
         the `innerHTML` writes of a fill) is a forced layout of the column inside the loop, the cost
         the `scrollTop` note in `fillStuffPages` records at 1.3s a task. HERE IT IS FREE: an observer
         is delivered after layout and before paint, so reading a box is reading a number the frame
         has already worked out. ALL OF THEM BEFORE `holdColumn_` below writes anything, so not one
         read follows a write. A card taken out of its pane is reported too, with no pane to name —
         and the height it had is exactly the one to keep. THE RECTANGLE, NOT `offsetHeight`, which
         rounds: a 288.6px card held at 289 moved the cards under it by a pixel, and the column was
         put back by a pixel on every emptying. A page's box is never scaled, so the two agree but
         for the rounding. */
```

### NOW, INSIDE THE DELIVERY, and not with the measuring a frame later — see `holdColumn_` in shell.js:

in `PANE_WATCH`

```
/* NOW, INSIDE THE DELIVERY, and not with the measuring a frame later — see `holdColumn_`
             in shell.js: a card above the page in front moved that page, and this is the last
             moment before the frame is painted with it moved. */
```

### ONLY WHAT CHANGED IS UNOBSERVED OR OBSERVED.

in `paneWatch_`

```
/* ONLY WHAT CHANGED IS UNOBSERVED OR OBSERVED. This ran on every placement — every tap and
       every page turn — and let go of every card on the screen and took hold of it again. A
       `ResizeObserver` reports every element it is newly given, so each placement bought a second
       round of `paneReach_` over the whole screen for cards that had not changed at all —
       re-measuring, a frame later, panes this function had measured one line above. A card that is still there keeps its watch. */
```

### ---------- ONE PAGE, FILLED: THE LOOP'S BODY, AND THE FAR EDGE OF THE GLASS

top level, before `stuffFillOne_`

```
/* ---------- ONE PAGE, FILLED: THE LOOP'S BODY, AND THE FAR EDGE OF THE GLASS ------------------------
   `fillStuffPages` below does this for each page near you, and `goPage` in shell.js does it for one
   page per turn — the one arriving at the far edge of what the glass shows — so it is said once. A
   page that is already filled, or is not a result, or has no element in the window is left alone and
   answered `false`, so a caller may ask for a page without knowing whether it needs anything.
   `ctx` is the loop's own `pages`, `first` and `items`, handed in so a walk over eleven does not ask
   for them eleven times; a single caller leaves it out. */
```

### AND DRAWN WHILE IT IS BUILT, if it is one of the ten that do not loop.

in `stuffFillOne_`

```
/* AND DRAWN WHILE IT IS BUILT, if it is one of the ten that do not loop. This is the whole of the
     fix for widgets popping open: the markup and its contents now arrive together, five pages before
     anybody sees either. It happens before `settle_`, so the grid measures panes that are already
     their final height rather than measuring them and being wrong. */
```

### ---------- THE RELEASE'S FLOOR: EVERY PAGE THE BAND WILL SHOW, FILLED BEFORE THE COLUMN MOVES

top level, before `stuffEdgeFill_`

```
/* ---------- THE RELEASE'S FLOOR: EVERY PAGE THE BAND WILL SHOW, FILLED BEFORE THE COLUMN MOVES -------------
   The band (`placeGrid`, shell.js; docs/history/341) draws every page whose box meets the glass a turn is
   aimed at, widened by a glass height either way, measured in pixels. So the fill a turn makes before its
   slide is asked in the same units, or the band would uncover a page this left empty: from the page being
   turned to, in the direction of the turn, every unfilled page until the far edge of that page's glass plus
   one glass height — and never fewer than `glassRows_() + 3` pages: check/swipe.js's BUILT AHEAD asks that
   many filled past the card in front at every landing of a run, when the builder has had no quiet moment,
   and on the 76-question paper at 820 a glass height and a half reached only five of the six (the cards are
   tall; the final run, 12 Oct). POSITIONS ARE
   READ BEFORE THE FIRST FILL, while the layout is the one the last frame drew, so a turn that finds
   everything filled (which, after any rest, the builder has made every turn) forces no layout at all.
   BOUNDED AT `glassRows_() + 3` FILLS IN ONE RELEASE: the band past the glass is the builder's to have
   filled, and a release that fills a dozen cards because the builder has not had a quiet moment is the
   stall this whole change exists to remove. The glass itself is always covered: a phone shows at most
   five cards on it, an iPad six. */
```

### ---------- A WINDOW DRAWN AFRESH ON THE GLASS IS FILLED AS FAR AS THE GLASS SHOWS, BOTH WAYS

top level, before `stuffBandFill_`

```
/* ---------- A WINDOW DRAWN AFRESH ON THE GLASS IS FILLED AS FAR AS THE GLASS SHOWS, BOTH WAYS ------------------
   FOUND BY REVIEW, 12 Oct, on an iPad and a desktop: a star, a save, a sign-in or the inbox landing two seconds
   after every signed-in open repaints Find in front from nothing (`paint(AT, true)`), and the draw filled the
   card in front and one either side (`STUFF_SOON`). The rest of the window was the builder's — behind thirteen
   other columns' paints — and the release's fill (`stuffEdgeFill_`) fills only the way a turn goes. On a phone
   one card is taller than the glass and nothing showed; at 820 and 1024 the unfilled pages above the card in
   front, 29–46px stubs, sat on the glass as three empty card shells for 1–2.5s (137–186 frames of a real drag).
   Base filled five either side at every paint, and showed none. So when a window is drawn afresh where it can
   be seen — the column in front, or one beside it on a wide window — every page the band can show (`placeGrid`,
   shell.js: the glass and a glass height either side, in pixels) is filled in the same task, both ways, before
   the column is placed: `stuffEdgeFill_` with no floor, from the page in front. Up to six cards each way on an
   iPad, against base's ten; on a phone usually none past the three. A window drawn for nobody (the builder,
   off the glass) is filled by the builder one card per slice, as before. */
```

### ---------- THE BUILDER'S FINDER JOBS: THE WHOLE WINDOW FILLED, AND RE-CENTRED, IN THE QUIET

top level, before `stuffAheadJobs_`

```
/* ---------- THE BUILDER'S FINDER JOBS: THE WHOLE WINDOW FILLED, AND RE-CENTRED, IN THE QUIET --------------
   `ahead_` in shell.js asks every kind for its jobs as they stand, on every slice, and takes the nearest.
   For each finder there are two: FILL the nearest page in its window that has no card (or a card drawn
   for another question), and CENTRE the window where the quiet wants it (`stuffLo_`'s `centre`). The
   centre is offered at the column's own distance, so it goes before any fill — recycling first and then
   filling, rather than filling pages the centring is about to throw away.
   BOUND, BOTH OF THEM (docs/history/329). The jobs are worked out inside each finder's own binding, and
   each runs inside it again, so a fill of the Resources window cannot touch Find's `STUFF`, memos or
   window. The question asked is captured when the job is made and asked again when it runs: a different
   question means the job is dropped, and the next slice makes the jobs of the new one.
   NOT A COLUMN STILL STALE (its paint goes first, and draws a new window), nor one being typed in or drawn
   on (the builder's own gate waits for those), nor the admin's column or any other a person cannot reach
   (`TABS` is read again every slice). */
```

### ONE CARD, AND ITS PANE MEASURED NOW — `paneWatch_` measures the panes it has not seen, which is this one — so nothing later measures the window; and a card

top level, before `stuffAheadFill_`

```
/* ONE CARD, AND ITS PANE MEASURED NOW — `paneWatch_` measures the panes it has not seen, which is this one —
   so nothing later measures the window; and a card drawn ABOVE the one in front moves the column back by
   exactly what it grew, as the release's fill does (`stuffKeepPlace_`). */
```

### ---------- A FINDER DRAWN FROM NOTHING IS WARMED IN FOUR SLICES BEFORE ITS PAINT (`warm`)

top level, before `STUFF_WARM`

```
/* ---------- A FINDER DRAWN FROM NOTHING IS WARMED IN FOUR SLICES BEFORE ITS PAINT (`warm`) -----------------------
   FOUND IN THE SECOND LOOK AT THE FIRST THIRTY SECONDS (review round 1, 12 Oct). The builder draws Find and
   Resources in the quiet after the first screen, and Find's first draw from a payload was ONE slice of
   285–470ms at 4x on a quiet machine — the longest the builder runs for a student, and the one a touch
   landed in: a flick on the Feed every 0.9–1.7s waited 433ms behind `paint:stuff 453`. Profiled, almost
   none of it is the draw: `stuffQuestion` was 368ms of 374, and inside it the library listed for this
   finder (`stuffItems`, 48ms), each item's sort key (`sortKey_`, 100), the sort and the filter (60) and
   the first question's tally (`facetTally_`, 157). EVERY ONE OF THOSE IS A MEMO that checks itself — on
   the payload's identity, the list's identity (`SORTED_ITEMS`, `FACET_TALLY`), the person — so asking it
   early is never wrong: if anything moves before the paint, the memo misses and the paint does the work it
   always did. The second draw of the same payload was 23ms.
   So before a stale finder is painted, the builder asks those four things one slice each, nearest the
   paint and before it (`d` a hair under the paint's), inside the finder's own binding (329), with the
   question captured and asked again. The longest is the tally, about a third of the slice it was cut from;
   the paint left is the markup, its placing and its panes. A step is not repeated for the same payload,
   person and question (`STUFF_WARM`); a new one of any of them starts again from the first, which is a
   memo hit wherever nothing changed. NOT the finder in front, which `go` and `repaint` draw at once. */
```

### ---------- AN EMPTIED PAGE KEEPS ITS HEIGHT

top level, before `stuffPin_`

```
/* ---------- AN EMPTIED PAGE KEEPS ITS HEIGHT -------------------------------------------------------
   PART OF THE OWNER'S *"if i scroll down quickly it does glitch out or clip fast or idk"* (8 Oct, a
   pupil's iPad). A page is emptied when you are more than `STUFF_NEAR` past it, and an empty pane is
   31px of glass — so a 289px question card emptied above the one you are reading took 258px out of
   the column over your card, and every card under it moved up by that much in one frame. The column
   was then put back, and on the iPad that putting-back was a slide: measured at 820x1180 on the
   Corbettmaths subtraction sheet, the column re-aimed 137–731px AGAINST the direction of a run of
   flicks, 2–3 times in every ten.

   SO THE PAGE IS HELD AT THE HEIGHT IT HAD, and nothing below it can tell it was emptied. The page is
   the cell and is invisible (`.page`'s own note); five pages away it is `.far` as well, so the space
   it keeps is space nobody sees. The height comes from `pane.LAST_H`, which the `ResizeObserver` in
   `paneWatch_` writes after a layout the frame had already done — never from `offsetHeight` here,
   which after the fill's writes would be a forced layout per page emptied. A pane the observer has
   not measured yet is left to shrink, as every pane did before. `stuffFillOne_` lets go of it. */
```

### `all` WAS THE LATE PASS SAYING "DO THE REST", and the late pass is gone (`STUFF_LATE`'s note).

top level, before `fillStuffPages`

```
/* `all` WAS THE LATE PASS SAYING "DO THE REST", and the late pass is gone (`STUFF_LATE`'s note). It is now
   the whole window, filled in this task — for a caller that must see it filled before it reads anything
   (the checks' states); the app never asks it, because the builder fills the window one card per idle
   slice and a forty-one-card task is the stall this was rewritten to remove. */
```

### ---------- THE THREE YOU ARE ON, NOT THE FIVE THOUSAND YOU ARE NOT

in `fillStuffPages`

```
/* ---------- THE THREE YOU ARE ON, NOT THE FIVE THOUSAND YOU ARE NOT --------------------------------
     THIS WALKED EVERY PAGE IN THE STRIP, calling `paneOf_` on each -- a DOM query per page, 5,227
     of them, on every repaint and every page turn. Measured at 8x CPU: 45 ms, for a function whose
     own note says it only ever touches eleven.
     NOW IT TOUCHES THREE: the page in front and one either side (`STUFF_SOON`), built in this task
     because a tap must land on its card. Everything else in the window is the builder's, one card per
     idle slice (`ahead_` in shell.js, the fill job below), and NOTHING IS EMPTIED HERE ANY MORE: a page
     the window still holds keeps its card, so turning back never rebuilds what it passed, and the
     window itself bounds what is held (`STUFF_WIN`). A page filled for a different question than the one
     asked now (`FIND_AT`) counts as empty, and is drawn again. */
```

### AND THE CARDS THIS PASS DREW ARE MEASURED ON THE NEXT TURN OF THE EVENT LOOP — only those, never the whole window:

in `fillStuffPages`

```
/* AND THE CARDS THIS PASS DREW ARE MEASURED ON THE NEXT TURN OF THE EVENT LOOP — only those, never the
     whole window: forty-one panes measured per tap would be the cost the window was bought to avoid.
     Cancelled by the next pass, so a run of quick taps measures once. */
```

### AND START THE ONE YOU ARE LOOKING AT — if it is one that runs.

in `fillStuffPages`

```
/* AND START THE ONE YOU ARE LOOKING AT — if it is one that runs.
     THE CANVAS IS WHY THIS STAYS LATE FOR THOSE TWO. A canvas measures itself from its box, and the
     bird drawn while its page is off to the side takes whatever size it happens to have there. The
     ten that draw with markup have no such problem, which is the other half of why they are safe to
     build ahead.
     Started again on every fill rather than once. They are idempotent — a board redraws from the
     position it already holds, a clock from the time it already has — and remembering which have
     been started is a second thing to keep true.
     FIND'S ALONE (`widgets`): Find 2's fill leaves `WIDGET_ON` to Find, whose own fills start and stop
     it as they always did — one widget started and stopped from two columns' fills would be one clock
     reset by whichever filled last. */
```

### The grid measures the panes again and puts everything where it now belongs.

top level, before `settle_`

```
/** The grid measures the panes again and puts everything where it now belongs. Instant: the cards
    have not moved as far as anybody is concerned, and animating them to where they already look
    like they are is a second movement nobody asked for. */
```

### ---------- HELD, NOT PLACED

top level, before `settle_`

```
/* ---------- HELD, NOT PLACED -------------------------------------------------------------------------
   THIS WAS `placeCells('y', true, 0, 'stuff')`, and "instant" was a wish rather than a fact: a
   placement is booked for the next frame, and `placeCells`' own rule is that ANIMATION WINS — so when a
   page turn had already booked its slide, this one's instant was merged into that slide, and a card
   emptied above you came back as the column sliding the wrong way. Measured at 820x1180 on the iPad
   complaint, *"if i scroll down quickly it does glitch out or clip fast or idk"*: re-aimed 137–731px
   against a run of flicks on a 263–270ms slide, 2–3 times in every ten.

   SO IT IS `holdColumn_`, the correction the `ResizeObserver` already makes when a card above grows:
   the column put back under the page you are reading, now, in this task, before anything is painted
   — no frame booked, nothing for an animation to win. The new panes are watched first (`paneWatch_`,
   what the placement used to do for them a frame later), so the observer can report their heights to
   `stuffPin_` and any zoom `paneReach_` gives them is in what the hold measures. When the hold cannot
   answer — the column was never placed, or a page turn has moved `PAGE` and its own placement is
   still to come — it says so, and the placement is asked for as before. */
```

### BRING ONE WIDGET TO LIFE, and say so in its own space if it does not.

top level, before `WIDGET_ON`

```
/**
 * BRING ONE WIDGET TO LIFE, and say so in its own space if it does not.
 *
 * The same three steps `on('widget')` does — start it, look where it should have drawn, write the
 * reason there if nothing did. Shared rather than repeated, because a widget opened from a card
 * and a widget filling a page are the same widget and must fail the same way.
 */
```

### ---------- A WIDGET THAT IS NOT BEING LOOKED AT MUST NOT BE RUNNING

top level, before `WIDGET_ON`

```
/* ---------- A WIDGET THAT IS NOT BEING LOOKED AT MUST NOT BE RUNNING ------------------------------
   Nothing has ever stopped one. `startWidget_` starts whatever page you land on and there is no
   other half to it — so play Flabby Pird once and its animation loop goes on drawing sixty frames
   a second, into a canvas that is off the side of the screen, until the tab is closed. Start the
   sprint or the timer and their clocks go on ticking the same way.

   Every one of those competes for the same frames a swipe needs, which is why the column with the
   games on it was the one that never felt right, and why it got worse the more of them you had
   opened. Nothing about that is visible: an invisible canvas being drawn looks exactly like
   nothing at all.

   So exactly one widget runs at a time. Landing on a new one stops the last, and leaving the
   screen stops it too. A widget with no `stop` needs none — a calculator sitting still costs
   nothing — so this is only ever asked of the ones that loop. */
```

### ---------- DRAWING ONE IS NOT THE SAME AS RUNNING ONE

top level, before `drawWidget_`

```
/* ---------- DRAWING ONE IS NOT THE SAME AS RUNNING ONE -------------------------------------------
   THIS USED TO BE ONE FUNCTION AND THAT IS WHY WIDGETS POPPED OPEN. Because only one widget may be
   RUNNING at a time, only one was ever DRAWN — so a page you had already swiped past built its own
   contents at the moment you arrived, and you watched the calendar appear in a card that was
   already on the screen.

   ONLY TWO OF THE TWELVE ACTUALLY RUN. `tables` holds an interval and `flabby` holds an animation
   frame, and those two declare a `stop`. The other ten — the calendar, the calculator, the docket,
   the notepad, the chess board, the cheat sheet maker — draw once and then sit there. Nothing was
   ever bought by drawing those late.

   SO A `stop` IS THE TEST. A widget that declares one is held to the old rule: started on arrival,
   stopped on leaving, one at a time. A widget without one is drawn as its page is built, five
   pages ahead of being looked at, and is simply there when you get to it. No new flag, no list to
   keep in step — the thing that says a widget loops is the thing that stops it looping. */
```

### ---------- EVERY WIDGET, FIXED AND MADE

top level, before `allWidgets`

```
/* ---------- EVERY WIDGET, FIXED AND MADE -----------------------------------------------------------
   `WIDGETS` IS A CONST ARRAY of the things this app can open — chess, the calendar, the notepad. It
   was the whole list, and the whole list was known before the payload arrived.

   MESSAGE THREADS ARE NOT KNOWN IN ADVANCE. There is one per person who has written to you, so they
   are built from `MESSAGES` — see `msgWidgets_` in me.js. Anything that looks a widget up has to
   look here rather than at the const, or a thread would appear in the list and refuse to open. */
```

### THE STATIC ONES, THEN THE TWO SETS THAT ARE MADE FROM DATA — a widget per conversation and a widget per session you are in.

in `allWidgets`

```
/* THE STATIC ONES, THEN THE TWO SETS THAT ARE MADE FROM DATA — a widget per conversation and a
     widget per session you are in. Both are the same idea: a thing you can name is worth being its
     own entry rather than a row inside a container somebody has to open first. */
```

### ---------- AND CONVERSATIONS ARE NOT AMONG THEM ANY MORE

in `allWidgets`

```
/* ---------- AND CONVERSATIONS ARE NOT AMONG THEM ANY MORE --------------------------------
     `msgWidgets_()` WAS CONCATENATED HERE AND DECLARED `kind: 'tool'`, so every conversation was a
     page of the Tools column — reported as "i dont want chat in tools. what the fuck", with a
     screenshot of two message threads sitting under the calendar.

     THE ARGUMENT AGAINST IT WAS ALREADY WRITTEN, twenty lines up in `map.js`, where the messages
     widget was deleted from `WIDGETS`: *"a calculator, a board and a timer are instruments: you go
     looking for one because you want to do something with it. A message is somebody trying to
     reach YOU."* That removal took the STATIC entry out and left the generated ones, so the thing
     the note forbids came back through the other door.

     AND THERE IS A COLUMN FOR THEM NOW. `dm` is one conversation per page with the composer at the
     foot of each — built after that note was written, which makes Tools the THIRD home for a
     conversation and the only one nobody asked for. Same shape as the reel scroller that was a
     second description of the pager: a surface that predates a better one and was never removed
     with it.

     Nothing looks a `msg:` widget up by id — measured, the string appears nowhere else — so the
     roster is the only thing that was reading it. */
```

### THE QUESTION, ON THE PAGE.

top level, before `stuffQuestion`

```
/**
 * THE QUESTION, ON THE PAGE.
 *
 * What was here showed the groups the results would be put in — useful, and only ever one facet:
 * whatever `group` happened to be set to. This asks the next question that would actually narrow
 * things, whichever facet that turns out to be, and stops asking when there is nothing left worth
 * asking.
 *
 * WHAT IT LOOKS LIKE, in order down the page:
 *   the chips     what you have already said, each one removable
 *   the count     how many that leaves, and how many pages
 *   the question  one heading and a short list with counts
 *
 * And when the questions run out it says so, rather than showing an empty heading — which is the
 * moment somebody needs telling that swiping up is the next move.
 */
```

### NAMED FOR WHAT IT WAS, not what it is.

top level, before `stuffQuestion`

```
/* NAMED FOR WHAT IT WAS, not what it is. This drew the group list once; it draws the funnel's
   next question now, and the grouping it was named after no longer exists. Renamed so the one
   thing left on the browse page is called what it does. */
```

### ---------- CARRY ON WAS HERE, AND IT WAS AN ANSWER TO A QUESTION NOBODY ASKED

top level, before `stuffQuestion`

```
/* ---------- CARRY ON WAS HERE, AND IT WAS AN ANSWER TO A QUESTION NOBODY ASKED ------------------
   IT DREW A "<name>, carry on" BLOCK over the funnel's first question, listing the papers this
   person had answers saved against with a count beside each, and a tap set the `paperId` chip.

   REMOVED AT THE OWNER'S WORD: "no i dont want [their name] carry on bullshit. im just saying if
   they answer something, it will be answered next time they come on." That is a statement about
   PERSISTENCE, and persistence is what `ansKey_` and `ansRead_` already do -- an answer typed
   into a question is in `localStorage` under the signed-in person and comes back in that box on
   the next visit, on every paper, with nothing on any screen to press.

   SO THE FEATURE WAS A SECOND ROUTE TO A PLACE THE FUNNEL ALREADY REACHES -- measured at 8 taps
   for May 2017 Higher Paper 1 and 9 for the Foundation one, both landing on exactly that paper in
   its own order. A front door nobody asked for, on the one screen whose own note warns about
   offering to throw away what somebody is part-way through.

   WHAT IT IS WORTH KEEPING IS THE MEASUREMENT IT WAS BUILT ON: the answer keys ARE the record of
   which paper somebody worked through, because a row id resolves to a paper. Nothing reads them
   that way today; if a surface ever needs to, that is where it comes from rather than a new
   column. `showOf` on the `paperId` facet came out of the same afternoon and stays -- it is what
   stops twenty papers sharing six buttons, and it has nothing to do with this. */
```

### NOBODY YET, and a way to fix that.

in `stuffQuestion`

```
/* NOBODY YET, and a way to fix that. An empty Friends list is the one empty result on this
     screen that is not a dead end — every other kind is empty because the sheet is, and this one
     is empty because you have not added anybody. */
```

### ---------- AN EMPTY FUNNEL SAID NOTHING AT ALL, WHICH IS THE WORST OF THE THREE ANSWERS

in `stuffQuestion`

```
/* ---------- AN EMPTY FUNNEL SAID NOTHING AT ALL, WHICH IS THE WORST OF THE THREE ANSWERS -------
     `return ''` WAS HERE, AND IT DREW A SEARCH BOX OVER A BLANK SCREEN. No question, no sentence,
     no reason — because `stuffPageCount` returns 0 until somebody has answered something, so the
     `nothingHere` branch in `stuffPageHtml` is not reached on arrival and this was the only thing
     with a chance to speak.

     FOUND BY THE `every tab draws something` JOURNEY the moment Booking left the funnel: with the
     check's payload holding two tutors, two venues and no library, `stuff` drew 0 characters of
     text. The journey was right, the fixture was not the fault, and the app has been one empty
     payload away from a blank front door for as long as this line has been here.

     FIFTH OCCURRENCE OF THIS REPOSITORY'S OLDEST SHAPE, and CLAUDE.md lists the other four —
     `loadMessages` showing an empty inbox for an unreachable backend, `check-booking.js` printing
     "nothing to check" and exiting 0, Reels drawing "Nothing here yet" for a column that worked,
     and `libraryRows_` reporting a dropped 3.4 MB file as an empty library. Every one is the same
     sentence: I did not manage to look, reported as I looked and there was nothing there. This one
     does not even get that far — it reports nothing whatsoever.

     `nothingHere` IS THE SENTENCE, because it is the one place that can tell an empty database from
     a request that failed: a dropped payload and a dropped library both land here, and both deserve
     a reason and a `Try again` rather than an invitation to go and fill in a spreadsheet.

     AND THE TWO EMPTIES ARE NOT THE SAME EMPTY. Nothing anywhere is the app having no content;
     nothing LEFT is a filter that has excluded everything, and the way out of the second is to take
     a chip off — which is on this page, one row up. `stuffPageHtml` already draws exactly that
     distinction for the results; this is the same two sentences at the point they are first true. */
```

### ---------- THE ORDINARY QUESTION FIRST, AND THE LAST RESORT BEHIND IT

in `stuffQuestion`

```
/* ---------- THE ORDINARY QUESTION FIRST, AND THE LAST RESORT BEHIND IT -------------------------
     `const over = … > FACET_MAX_ANSWERS` WAS HERE and it was the flag the row list trimmed itself
     by. There is no trim, so there is nothing for it to say: `facetTally_` groups a long answer
     list into at most seven buckets before it ever reaches this function. A variable set on every
     draw and read by nothing is the reader standing over a dead condition that this file records
     under `resource_type` in `VOCAB`, so it is gone rather than left looking load-bearing.

     `overFacet_` IS NOT DEAD, AND IT IS NOW ALMOST UNREACHABLE, which is a different thing worth
     saying out loud. Every rule in `bucketValues_` can decline — the alphabet stands down if every
     value reduces to one prefix even at twelve characters — and a facet that comes back ungrouped
     with more than forty answers is refused by `nextFacet` and picked up here, exactly as before.
     What has changed is what happens then: the rows are drawn WHOLE, because the trim that used to
     cut them to seven and point at the search box is the thing that was reported. A long readable
     list beats a short list with answers hidden behind an apology, and `check-funnel.js` fails the
     build the moment any question draws more than seven — so that state is a red run rather than
     something a person has to notice on a phone. */
```

### ---------- "NOTHING LEFT TO NARROW" WAS NOT TRUE, AND IT WAS THE LAST THING ON THE SCREEN

in `stuffQuestion`

```
/* ---------- "NOTHING LEFT TO NARROW" WAS NOT TRUE, AND IT WAS THE LAST THING ON THE SCREEN ----
       IT SAID IT OVER 1,093 QUESTIONS WITH 48 TOPICS IN THEM, one line under a control offering
       exactly those 48 topics. The funnel had run out of QUESTIONS — no facet left with between
       two and forty answers — and the sentence reported that as having run out of ways to narrow,
       which is a different claim and a false one. Somebody reading it stops, which is what the
       screenshot was of.
       SO IT SAYS WHICH OF THE TWO IT MEANS. With a collection on offer the way on is the line
       above, and the sentence points at it instead of contradicting it. */
```

### AND WHEN A PAPER ENDED IT, IT SAYS SO.

in `stuffQuestion`

```
/* AND WHEN A PAPER ENDED IT, IT SAYS SO. `FACET_ENDS` stops the funnel the moment a paper is
       chosen — *"no more asking for questions 1-10 or question part 1 or b."* — so what is left is not
       "nothing to narrow" but the paper itself, in its own order, which is the thing the person came
       for and the sentence should say. */
```

### ---------- ONE CLASS FOR THE LAST LINE, NOT AN INLINE MARGIN ON EACH

in `stuffQuestion`

```
/* ---------- ONE CLASS FOR THE LAST LINE, NOT AN INLINE MARGIN ON EACH ------------------------
       BOTH WERE `<p class="faint" style="margin:.6rem 0 0">`: a margin nobody could find from the
       stylesheet, in the faintest ink on the screen, for the one sentence that tells you where the
       results went. `.find-end` sits under the chips on the same rule the chips sit on, and the
       half that is an instruction — swipe up — is in ink, because that is the half you act on. */
```

### THE FRONT DOOR TO THE BOOKING FORM WAS HERE — a line above the funnel's answers, on the first question only, that filtered to Booking and turned to the form.

in `stuffQuestion`

```
/* THE FRONT DOOR TO THE BOOKING FORM WAS HERE — a line above the funnel's answers, on the first
     question only, that filtered to Booking and turned to the form. It was clutter above the one
     question this screen exists to ask, and the form is not hard to reach: "What for · Booking" is
     the first answer in the list, and the Book buttons on tutor and venue cards go straight to it. */
```

### ---------- EVERY ANSWER, IN THE ORDER EVERY OTHER QUESTION USES

in `stuffQuestion`

```
/* ---------- EVERY ANSWER, IN THE ORDER EVERY OTHER QUESTION USES ------------------------------
     THIS USED TO SAY "as many answers as anybody reads, biggest first, then back into order", and
     the sort it describes was there to choose WHICH seven of three hundred to draw. There is no
     choosing left to do. */
```

### ---------- NOTHING IS TRIMMED HERE ANY MORE, BECAUSE NOTHING ARRIVES OVERSIZED

in `stuffQuestion`

```
/* ---------- NOTHING IS TRIMMED HERE ANY MORE, BECAUSE NOTHING ARRIVES OVERSIZED ----------------
     THIS USED TO TAKE THE BIGGEST SEVEN and print "and 368 more topic answers — type one into the
     search box above" underneath. That line was the funnel giving up on its own job in front of
     you, and it is what the owner reported: "I DO NOT LIKE THIS."

     `facetTally_` GROUPS INSTEAD — see `bucketValues_` — so what comes back here is at most seven
     answers or at most seven buckets, and the question is asked again over whichever bucket is
     pressed. There is no longer any such thing as an answer this screen cannot show you. */
```

### THE HEADING IS GONE — it read `> WHAT FOR 5` above five rows that were about to say the same thing.

in `stuffQuestion`

```
/* THE HEADING IS GONE — it read `> WHAT FOR   5` above five rows that were about to say the same
     thing. The label named a question whose answers were already on the screen, and the number
     counted rows you could see: a caption on a photograph of itself.
     THE COUNT BESIDE EACH VALUE STAYS, and is the one that was doing work. It is not how many
     choices there are, it is how many THINGS are behind each one — a value leaving three and a
     value leaving three hundred look identical without it, and the difference is whether the next
     tap is worth making. */
```

### `counted` TAKES THE CHEVRON OFF.

in `stuffQuestion`

```
/* `counted` TAKES THE CHEVRON OFF. See the stylesheet: a chevron is pinned to the right edge, and
     so is the count — so on a one-digit number it appeared beside the digit and on a four-digit one
     it disappeared behind them. Five rows, chevrons on two of them, and the two were whichever
     happened to have small numbers. It marked nothing and read as litter. */
```

### ---------- "DOESN'T MATTER", UNDER EVERY QUESTION

in `stuffQuestion`

```
/* ---------- "DOESN'T MATTER", UNDER EVERY QUESTION -----------------------------------------------
     ON EVERY FACET, NOT ON THE ONE THAT PROMPTED IT. `School year` is where this was noticed —
     somebody who knows a sheet is "roughly KS2" was being asked to name a year and had no way past
     it — but the fault is the funnel's shape rather than that question's: EVERY question here is
     compulsory, and a person narrowing a list knows some things and not others. Writing a rule for
     the facet that annoyed somebody is how the `cost: 0` fault came back as `paper: true`.

     NO COUNT ON IT, deliberately. The number beside an answer says how many things are behind it,
     and the number behind "doesn't matter" is the count already printed above this list — a second
     copy of it here reads as a sixth answer that happens to be the biggest, which is exactly the
     shape of a button that does nothing.

     IT IS LAST because it is the way out of the question, not one of its answers. */
```

### `counted` WITHOUT A COUNT, which is not a contradiction:

in `stuffQuestion`

```
/* `counted` WITHOUT A COUNT, which is not a contradiction: that class is what makes an answer a
     44px surface with a press animation instead of a 33px fact row with a hairline under it — see
     the block it names in style.css. A bare `.row.tap` here would have been the third conviction of
     the tap-target rule this repo already records twice. `is-skip` takes the fill back off, so it
     reads as the quiet way out of the question rather than a sixth answer. */
```

### ---------- THE COUNT BESIDE EACH ANSWER IS GONE

in `stuffQuestion`

```
/* ---------- THE COUNT BESIDE EACH ANSWER IS GONE -------------------------------------------------
     IT WAS DEFENDED HERE AS THE THING DOING THE WORK — "a value leaving three and a value leaving
     three hundred look identical without it". That is true of a list you are deciding between and
     false of the one this is: the numbers are four digits wide on the first question, they change
     on every tap, and none of them is the answer to "which of these do I want". You choose a topic
     because it is the topic, not because it has 34 questions in it.

     IT IS STILL COMPUTED, and has to be — `facetSplit_` is a share of those counts and it is what
     keeps a question that cannot narrow off the screen. What changed is that it is arithmetic now
     rather than furniture. */
```

### THE "and N more" LINE WENT WITH THE TRIM.

in `stuffQuestion`

```
/* THE "and N more" LINE WENT WITH THE TRIM. Nothing is held back, so there is nothing to
     apologise for and nowhere else to send anybody — and it is gone rather than left as an empty
     string concatenated onto the end, which is a reader standing over a permanently false
     condition. */
```

### `data-bucket` SAYS WHICH KIND OF ANSWER THIS IS, and it is carried rather than worked out later:

in `stuffQuestion`

```
/* `data-bucket` SAYS WHICH KIND OF ANSWER THIS IS, and it is carried rather than worked out
     later: `filterHit` has to test membership for a bucket and equality for a leaf, and sniffing
     the text to tell them apart is the trap the band regex used to be. */
```

### `.answers` IS WHAT MAKES THEM CHIPS ON A LINE rather than rows down the card — see the block of that name in style.css.

in `stuffQuestion`

```
/* `.answers` IS WHAT MAKES THEM CHIPS ON A LINE rather than rows down the card — see the block of
     that name in style.css. One wrapper round the answers AND the way out, so "Doesn't matter" wraps
     onto the end of the last line like any other chip instead of sitting alone underneath. */
```

### ---------- A NUMBERED RUN IS A GRID

in `stuffQuestion`

```
/* ---------- A NUMBERED RUN IS A GRID ------------------------------------------------------------
     `grid` (the Bible's Chapter and Verse): 150 numbers as chips are a paragraph of pills of four
     different widths, read word by word; as a grid they line up in columns a thumb runs down, the way
     a printed Bible's chapter index is set. Each cell is still the same chip, the same 32px drawn and
     44px reached — `.answers.is-grid` in style.css — and named in full for a screen reader, because
     "3" alone is not a choice anybody can hear the meaning of. `counted` stays first in the class
     list: `check/ui.js`'s accepted tap targets read the first two classes. */
```

### ---------- AND WHILE THE PAYLOAD IS ON ITS WAY, MORE ANSWERS ARE COMING

in `stuffQuestion`

```
/* ---------- AND WHILE THE PAYLOAD IS ON ITS WAY, MORE ANSWERS ARE COMING --------------------------
     The library is a file of its own, and the splash lifts at fifteen seconds once it is in whether
     the payload is or not — so on a slow line the first question is asked without the answers only
     the payload brings (the bundles). Measured on 9 Oct with the payload held: a question
     that looked finished and was not, and grew when the payload came. So under the answers, until then, the one loader
     (`loading_`, shell.js) — the answers already here stay pressable, and the room under them says
     more are on their way. */
```

### `stuff-jump` went with the group list.

top level, before `finderScreen_`

```
/* `stuff-jump` went with the group list. It added a filter and turned to the results in one tap,
   which is exactly what `facet-pick` does — except that it only ever knew about the one grouping,
   so it could jump you to a subject and never to a key stage. */
```

### ---------- `paperCard`, `openPaper_` AND `on('paper-read')` WERE ALL HERE

top level, before `finderScreen_`

```
/* ---------- `paperCard`, `openPaper_` AND `on('paper-read')` WERE ALL HERE ------------------------
   `paperCard` DREW A PAST PAPER AS THE COVER OF ONE — the board across the top, the tier in its
   box, the subject, the paper number, a ruled line for a candidate's name, and the year with the
   page count and "Answer all questions" along the foot. Nothing on it was invented; every line was
   a column, arranged the way an exam paper arranges them, and it was the best-looking card here.

   IT IS GONE BECAUSE THE THING IT DREW IS NOT A RESULT. See the long note above `questionItems`:
   this screen finds questions, and a document is the box they came in. Three drawings of that card
   were tried and the third was still wrong, which is what finally said the card was not the fault.

   `openPaper_` LASTED ONE COMMIT. It opened the whole paper in a sheet off a `Read` tile, which was
   the right fix for the version before it — but a sheet full of questions is the collection again
   with a lid on.

   WHAT COULD STILL OPEN A REAL PAPER: `source_url` on the question rows, which is the PDF on the
   exam board's own site. 2,073 rows carry one. If a way back to the original is ever wanted, that
   link is what it should open — a real paper rather than a rebuilt one.
--------------------------------------------------------------------------------------------- */
```

### ---------- ONE DRAW FOR BOTH FINDERS

top level, before `finderScreen_`

```
/* ---------- ONE DRAW FOR BOTH FINDERS -----------------------------------------------------------------
   `screen('stuff')` WAS THIS FUNCTION, and it is now the draw of whichever finder is bound — Find's
   and Find 2's are registered under it, below, each in its own binding. The ids are the finder's
   (`stuff-q`, `res-q` …) so a press finds its own column; everything else on this page is the same
   page in both, which is the point (docs/history/329, 347). */
```

### The control must SAY what it is doing.

in `finderScreen_`

```
/* The control must SAY what it is doing. Without this the box snapped back to its first option
     every time the screen was redrawn, so the list and the dropdown above it disagreed — and the
     one you believe is the one you can see. */
```

### `#stuff-controls` MARKS THIS PAGE so the rest of the screen can find it.

in `finderScreen_`

```
/* `#stuff-controls` MARKS THIS PAGE so the rest of the screen can find it. It used to be page
     zero and everything else indexed off "the first page" — with saved pages in front of it that
     is no longer true, and a hard-coded 1 would have `paintStuff` keeping a saved page and
     deleting the question. One id, and nothing has to count. */
```

### ---------- YOUR CREDITS WERE HERE, AND A BALANCE IS NOT A SEARCH CONTROL

in `finderScreen_`

```
/* ---------- YOUR CREDITS WERE HERE, AND A BALANCE IS NOT A SEARCH CONTROL -----------------------
     THE NOTE ABOVE ARGUED "a number is a fact about you and belongs beside the thing it is spent
     on". Nothing on this screen is spent: the library is free, the basket has no checkout, and the
     one surface that takes credits is the booking form. So it was a card of your own above the
     question, on the app's front door, every single load — the same fault as the count line and
     the sort dropdown that were removed from this exact page for the same reason. It is on the You
     screen, which is where a balance goes. */
```

### THE SORT WAS HERE — a dropdown offering A–Z and, when anything had a price, cheapest first.

in `controls`

```
/* THE SORT WAS HERE — a dropdown offering A–Z and, when anything had a price, cheapest first.

          Gone with the grouping dropdown that went before it, and for the same reason: this screen
          is a QUESTION, and every control above the question is something to get past before you
          can ask it. A–Z is what a list of names should be anyway, and it stays — as the order the
          list is in, not as a thing to choose.

          The one real use was price, on a library where four hundred of four hundred are free. If
          things are ever priced enough for the order to matter, sorting belongs beside the prices
          rather than above the search. */
```

### THE COUNT LINE WAS HERE — "565 of 565 · 27 pages".

in `controls`

```
/* THE COUNT LINE WAS HERE — "565 of 565 · 27 pages". It said nothing anybody needed: before
          you narrow anything it is the size of the library, which is not a fact about your search,
          and after you narrow it the results are right there to be looked at. */
```

### THE CONTROLS ARE A PAGE, and the results are the pages after it.

in `finderScreen_`

```
/* THE CONTROLS ARE A PAGE, and the results are the pages after it. Four hundred cards under a
     search box is a column nobody reaches the end of; eight to a screen is a thing you turn.

     It also solves what every version of this screen has worked around: the controls are drawn
     once and never rebuilt, so typing in the search box cannot lose its own focus. */
```

### ---------- BOOKING IS A THING YOU FIND

in `finderScreen_`

```
/* ---------- BOOKING IS A THING YOU FIND ----------------------------------------------------------
     THE BOOK COLUMN IS GONE and its contents are here, behind the question the funnel already asks.
     "What for · Booking" then offered Levels, Subjects, Tutors and Venues — the four things a
     booking is assembled FROM — and had nothing to say about assembling one. The form that does
     that was a column away.

     ONLY WHEN THE FUNNEL IS ON BOOKING, which is what makes this an answer rather than a seventh
     tab wearing a different hat. Ask a different question and none of it is drawn.

     AFTER THE QUESTION, NOT BEFORE IT. They went in front of the controls page first, beside the
     saved things — which put the form BEHIND you: you answer "what for · booking", the funnel keeps
     you on the question page, and the thing you asked for is a page back the way you came with
     nothing saying so. Saved things belong in front because they are what you already had; a form
     you just asked for belongs in the direction you are travelling.

     WHAT YOU KEPT, THEN THE QUESTION, THEN THE BOOKING, THEN THE ANSWER. */
```

### ---------- WHAT IS PUT IN FRONT OF YOU, THE QUESTION, THEN WHAT YOU KEPT

in `finderScreen_`

```
/* ---------- WHAT IS PUT IN FRONT OF YOU, THE QUESTION, THEN WHAT YOU KEPT -----------------------
     SPOTLIGHT FIRST. It was the top of the Posts feed, which meant it only existed once you had
     answered a question to get there — and the whole point of it is that it is what the business
     wants seen by somebody who has not asked for anything. In front of the question is the only
     place that is true of. It is also the only thing here that is not yours, which is the right
     order: theirs, then the question, then yours.

     SAVED AND BASKET AFTER. They were in front, on the argument that they are what you already had
     — and that put two pages of your own things between opening the app and being able to ask it
     anything, every time, whether or not there was anything in them. They are the answer to "what
     did I keep", and an answer goes where answers go.

     WHICH IS ALSO WHY THE BOOKING AND FEED PAGES SIT WITH THEM. Everything after the question is
     something you asked for; everything before it is the one thing you did not. */
```

### ---------- SPOTLIGHT WAS THE FIRST GROUP HERE AND IT IS A COLUMN NOW

in `finderScreen_`

```
/* ---------- SPOTLIGHT WAS THE FIRST GROUP HERE AND IT IS A COLUMN NOW ------------------------
     `spotPages()` SAT IN FRONT OF THE QUESTION, so the business's own promotion was the first thing
     on the screen somebody opened to search. Asked for as a column of its own, and `collections.js`
     carries the argument; what matters here is that it is gone rather than copied, because two
     homes for one list is the `documents_()` fault and `PAGER.stuff` had never counted these pages
     while this line drew them. */
```

### ---------- THE DRAW BUILDS THE WINDOW, NOT ONE EMPTY PAGE PER RESULT

in `finderScreen_`

```
/* ---------- THE DRAW BUILDS THE WINDOW, NOT ONE EMPTY PAGE PER RESULT -----------------------
     THIS RETURNED `stuffPageCount()` BLANK PAGES — 5,690 of them with the library unfiltered — and
     every other writer of this strip keeps a WINDOW of fifteen, marked `is-res`, with `PAGE_LO`
     saying which result the first of them stands for. So `paint('stuff')` — which is what
     `repaint()` does on every load, every sign-in and every save — replaced a windowed strip with
     an unwindowed one and LEFT `PAGE_LO` where it was. `domIndex_` then pointed at the wrong
     element: measured, six pages into a list a repaint left the page you were on blank, and after
     a few more flicks `goPage(0)` showed a practical where the question should be, with the search
     box on no screen at all. Nothing threw; every later fill wrote the right card into the wrong
     element.

     So it draws what `stuffWindow_` would have left: the question, the pages in front, and the
     window, with `PAGE_KEEP` and `PAGE_LO` set to describe exactly that. The count in front is
     `1 + frontPages_().length` because the question is page nought here, which is what
     `stuffFirstResult_` reads back off the DOM once it exists. */
```

### ---------- AND THE CARD YOU WERE ON, BY NAME, NOT BY NUMBER

in `finderScreen_`

```
/* ---------- AND THE CARD YOU WERE ON, BY NAME, NOT BY NUMBER ----------------------------------------
     A REPAINT KEEPS `PAGE.stuff`, and a repaint is what a payload landing is — the one after signing in
     is that person's, and its list can be longer than the one the card was found in. So the page on the
     screen is asked which card it is BEFORE this draw replaces it (`paint` writes the markup after this
     returns, so the old strip is still the one in the document), and the new list is asked where that
     card is now (`stuffBackTo_`). The window below is then built around the page that is right. */
```

### AND THE WINDOW IS FILLED A MOMENT LATER, because a page cannot be filled until it is in the document and `paint` writes the markup after this returns.

in `finderScreen_`

```
/* AND THE WINDOW IS FILLED A MOMENT LATER, because a page cannot be filled until it is in the
     document and `paint` writes the markup after this returns. A microtask rather than a timer:
     it runs before the browser draws, so the page you are on is never seen empty — and
     `fillStuffPages` settles the column itself once the cards have their heights. */
```

### NOT WHEN THE BUILDER DRAWS IT (`AHEAD.running`, shell.js; docs/history/341).

in `finderScreen_`

```
/* NOT WHEN THE BUILDER DRAWS IT (`AHEAD.running`, shell.js; docs/history/341). This fill ran after the
     builder's slice had ended and outside the time it measured — one idle callback took 2.7s by the browser's
     own frame timing against 1.6s logged for the slice (review, 12 Oct) — so the one slow rule never saw it, and
     a flick that began then waited for both. Drawn ahead, the window is filled by the builder: in the same slice
     if the column is on the glass (`aheadPaint_`), one card per slice if it is not. AND AS FAR AS THE GLASS
     SHOWS, both ways, when it is on the glass (`stuffBandFill_`, above). */
```

### Typed into rather than pressed, so it cannot go through the click handler.

top level, before `stuffTimer`

```
/* Typed into rather than pressed, so it cannot go through the click handler. Debounced, because
   redrawing four hundred cards on every keystroke is how a search box feels broken. Nothing needs
   putting back afterwards now — the box itself is no longer part of what gets redrawn. */
```

### `on('stuff-set')` WAS HERE, and the dropdown that sent it went when the funnel replaced the filter row.

top level, before `DOCK_DONE`

```
/* `on('stuff-set')` WAS HERE, and the dropdown that sent it went when the funnel replaced the
   filter row. A handler with no door reads as a working feature to anybody looking at the source —
   which is the whole reason `check-doors` exists. */
```

### ---------- THE DOCKET

top level, before `DOCK_DONE`

```
/* ---------- THE DOCKET --------------------------------------------------------------------------
   A list of things to do, ticked off. It lives in ONE CELL on the person's row — `todo`, which has
   been in the schema since the beginning, has a live `saveTodo` handler behind it, and has never
   once been written to by anything.

   ONE CELL, NOT A TAB. A docket line has no life of its own: nothing links to it, nothing counts
   it, nobody else reads it, and it exists for about a day. A tab would mean a row id, a person id,
   an order column and a deletion policy for something that is a scrap of paper.

   PLAIN TEXT, so it stays editable in the spreadsheet. `x ` in front of a line means done, which
   is the notation anybody would use if handed the cell and no instructions — the format has to
   survive being typed at by a person, because sooner or later it will be.
--------------------------------------------------------------------------------------------- */
```

### ---------- `x ` AS THE DONE MARKER CORRUPTED ANY LINE STARTING WITH AN X

top level, before `DOCK_DONE`

```
/* ---------- `x ` AS THE DONE MARKER CORRUPTED ANY LINE STARTING WITH AN X -----------------------
   TYPE "x ray results" AND THE DOCKET STORED A COMPLETED TASK CALLED "ray results". The marker for
   done was a bare `x ` or a tick at the front of the line, and nothing separated "this line is
   ticked" from "this line begins with the letter x". So the state was wrong AND the text was eaten
   — the two halves of the one thing a to-do list must not get wrong. "X marks the spot" went the
   same way. Demonstrated before changing anything, not reasoned about.

   THE MARKER IS NOW A MARKDOWN CHECKBOX, `- [x] ` and `- [ ] `. It cannot collide with ordinary
   prose the way a bare letter can; it is a convention anybody reading the sheet recognises on
   sight — and the sheet IS the database, so a person reads this column; and every line this app
   writes carries a box, so a line without one is legacy by definition.

   LEGACY LINES STILL READ CORRECTLY. Anything already in somebody's `todo` uses the old bare form,
   so it is still accepted on the way IN and never written on the way OUT — a docket converts itself
   the first time anything on it is touched. */
```

### ---------- A ROW IS IDENTIFIED BY ITS TEXT, NOT BY WHERE IT SITS

in `paintDocket`

```
/* ---------- A ROW IS IDENTIFIED BY ITS TEXT, NOT BY WHERE IT SITS -----------------------------
     `data-i` ALONE WAS THE WHOLE IDENTITY, and the handlers re-read the list from `USER.todo` at
     the moment of the tap. Those are two different snapshots: a save landing, a payload arriving or
     a repaint between the draw and the tap renumbers everything, and index 3 is then somebody
     else's line. The resources schema states the rule this breaks — "reading the wrong one is
     invisible; deleting the wrong one is not."

     SO THE TEXT TRAVELS WITH THE TAP and the index comes along as a hint. If the row at that index
     still has that text, nothing moved. If it does not, the text is looked up instead. Only if both
     fail does the tap do nothing, which is the right answer for a row that is no longer there. */
```

### A BUTTON, NOT A SPAN.

in `host.innerHTML`

```
/* A BUTTON, NOT A SPAN. A span with a `data-do` cannot be reached from a keyboard, has no
            role, and is invisible to the tap-target pass in check/ui.js — so the one control on
            this row that destroys something was the one nothing measured. */
```

### It sits inside the label, so without this a tap would toggle the tick on its way past.

top level, before `list`

```
/* It sits inside the label, so without this a tap would toggle the tick on its way past.
     Optional, because an action can be called without an event — `dock-add` is, from the Enter
     key — and a handler that assumes one is a handler that throws the first time it is reused. */
```

### ---------- THE NOTEPAD

top level, before `padReach_`

```
/* ---------- THE NOTEPAD -------------------------------------------------------------------------
   It says "Saves as you type" under it and never has. `saveNotepad` has been live on the backend
   the whole time and nothing on this side has ever called it — so the caption was a promise the
   app could not keep, which is worse than no caption.
--------------------------------------------------------------------------------------------- */
```

### WHETHER THIS BOX MAY KEEP A SWIPE IS A FACT ABOUT WHAT IS IN IT, AND ONLY THE APP CAN ASK.

top level, before `padReach_`

```
/* WHETHER THIS BOX MAY KEEP A SWIPE IS A FACT ABOUT WHAT IS IN IT, AND ONLY THE APP CAN ASK.

   A `pan-y` textarea swallows a vertical drag whether or not it has anything to scroll -- measured
   with real touch events, an empty notepad ate the swipe and the page did not turn, while
   `#docket-body`, a DIV with the same rule and the same nothing to scroll, handed it straight back.
   So the stylesheet cannot own this one: `pan-y` is right for a notepad somebody has written a page
   into and wrong for the empty one they have just swiped onto.

   SIX PIXELS, THE SAME FLOOR `axisFree` USES, and for the reason written there: `scrollHeight` and
   `clientHeight` are whole pixels off a layout in fractions, so a box that fits exactly reports one
   or two pixels of overflow routinely. Two places asking one question have to ask it the same way.

   CALLED WHERE THE ANSWER CAN CHANGE -- when the widget is drawn, and on every keystroke, which is
   already where the save is booked. */
```

### Longer than the docket's, because this is typed continuously rather than tapped.

top level, before `padTimer`

```
/* Longer than the docket's, because this is typed continuously rather than tapped. Nine hundred
     milliseconds into a sentence is a write per word. AND BOOKED TO GO AS THE PAGE GOES (`keepDue_`,
     data.js; 317), so a reload inside the 1.4 s does not leave the account a sentence behind. */
```

