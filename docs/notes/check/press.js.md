# check/press.js

The full text of comments in `check/press.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/press.js PRESS IT.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/press.js

   PRESS IT. DID ANYTHING HAPPEN?

   THIS IS THE QUESTION NOTHING HERE ASKED, and the entry at the foot of CLAUDE.md says so in the
   owner's own words. The hour grid did nothing when it was pressed for as long as the booking form
   has lived on two screens: `paintBook_` repainted `s-stuff`, which on the Booking column is not
   merely the wrong element but a DEAD one, so the state changed correctly and the screen was never
   rebuilt. Twenty-odd `<select>`s on the same card looked fine throughout, because a dropdown shows
   its own new value natively with no help from anybody — so the half of the form that needed no
   repaint is the half that appeared to work.

   NEITHER INSTRUMENT COULD SEE IT, and both were right about what they ask:

     `check/ui.js`      measures whether a control can be READ and HIT. A dead control measures
                        perfectly — the cells are the size they are whether or not pressing one does
                        anything.
     `check-doors.js`   asks whether every `data-do` in the markup has a handler and every handler
                        has a door. Both halves of that were true here. The wiring was perfect and
                        the wire went nowhere.
     `check-flow.js`    drives bookings through `BOOKING` and the send paths rather than through the
                        markup, so it proves the state machine and never presses a cell.

   AND THE DISPATCHER IS WHY A THROWN HANDLER IS INVISIBLE. `shell.js` wraps every action in a
   try/catch on purpose — an error escaping it reaches the window, and a browser serving from
   `file://` reports that as "Script error." with no message, no file and no line. Caught, it keeps
   its message. The cost is that `pageerror` never fires, so a handler that throws on every press
   looks from outside exactly like one that works: the app stays up, nothing is logged where a
   harness is looking, and the only evidence is a toast nobody screenshotted.

   SO THIS LISTENS WHERE THE APP ACTUALLY SPEAKS: `console.error('[' + action + ']', err)`, which is
   the line in that catch, plus `pageerror` for anything outside it.

   ------------------------------------------------------------------------------------------------
   WHAT IT PRESSES, AND WHY IT IS BY ACTION RATHER THAN BY ELEMENT.

   Pressing every ELEMENT would press `qp-ans` four thousand times and `fav` once per card. What is
   worth asking once is each distinct ACTION — `book-slot`, `fav`, `msg-send` — because the handler
   is the thing that can be broken. So: every distinct `data-do` reachable on a screen, pressed once,
   on a freshly-found element each time, because the press before it may have rebuilt the markup.

   A SHEET IS A SCREEN'S OTHER HALF. `#sheet` is a sibling of the screens, so everything this app
   opens in one — the details form, the pay sheet, the composer, a tutor's profile, the practical
   guide — carries actions that are on no screen. Whenever a press opens a sheet, the sheet's own
   actions join the queue for that screen, which is how `msg-send` and `me-save` get pressed at all.

   A SELECT AND A CHECKBOX SPEAK THROUGH `change`. The dispatcher refuses them on `click` outright
   and says why — a click on a select is the dropdown OPENING, with the old value still in it. So
   those are pressed the way a person presses them: the value is moved on by one and `change` is
   dispatched.

   ------------------------------------------------------------------------------------------------
   WHAT FAILS AND WHAT IS ONLY PRINTED, which is the line this repository keeps.

   FAILS   a press that throws — in the handler's catch or out at the window. That is certainly
           wrong, whatever the action is.
   FAILS   a press that leaves the app unusable: `go` gone, the nine screens not all present, or
           the screen it was on no longer drawable.
   PRINTS  a press after which NOTHING measurably changed. That is the grid's signature and it is
           not by itself a fault: `reel-sound` on a clip with no audio, an action whose whole job is
           to post and toast, a toggle pressed into the state it was already in. A rule that failed
           on it would be red on the first honest one and red forever after — the argument this
           repository makes for `ACCEPTED_TAP` and `ACCEPTED`. A NUMBER somebody reads is the point;
           see `ACCEPTED_QUIET` below for the ones that are known.

   WHAT COUNTS AS SOMETHING HAPPENING is deliberately wide, because the alternative is a check that
   cries wolf: the screen's markup, the sheet, which screen you are on, which page of it, a toast, a
   request leaving the phone, or anything written to `localStorage`. One of those moving is enough.

     node check/press.js               every screen
     node check/press.js --screen=dm   one
================================================================================================== */
```

### ---------- THE PAYLOAD AND THE LIBRARY IN, NOT A GUESS AT WHEN THEY WILL BE

top level, before `appIn_`

```
/* ---------- THE PAYLOAD AND THE LIBRARY IN, NOT A GUESS AT WHEN THEY WILL BE ---------------------
   Until `load()` has finished, every column is the one loader (`loading_`, shell.js — the owner, 9 Oct)
   and there is nothing on it to press. The fixed sleeps after `goto` were always enough on a quiet
   machine; at a load average of sixty on 9 Oct they were not, and a column of loaders pressed as if it
   were the column reports controls missing that are only late. Asked for, bounded, and then on — a
   page that never loads is still measured as it stands and fails on what it lacks. */
```

### AND A STRANGER IS SENT WHAT `doGet` SENDS A STRANGER — `check/ui.js`'s rule, which this file did not have.

top level, before `FIXTURE_ANON`

```
/* AND A STRANGER IS SENT WHAT `doGet` SENDS A STRANGER — `check/ui.js`'s rule, which this file did
   not have. The fixture is the admin's payload, films and all, and the signed-out pass was served it
   too: the state "the videos card, nobody's films" read a stranger's card listing three films that
   `filmsFor_` never builds for anybody but an admin, and could not be reached (9 Oct). For the visitor
   who is not signed in, `films` is `[]` and `filmsSync` is absent, as the backend sends them. */
```

### ---------- BOTH VISITORS, AND THE SECOND ONE IS THE FRONT DOOR

top level, before `VISITORS`

```
/* ---------- BOTH VISITORS, AND THE SECOND ONE IS THE FRONT DOOR ----------------------------------
   THE ADMIN SEES NEARLY EVERY CONTROL, which is why the sweep is worth running as one. What that
   pass cannot reach is the two controls that matter most to somebody who has never been here:
   `do-signin` and `register`. The admin pass named both and could not press either — they are on the
   screen only while nobody is signed in, and this harness seeds a user before the page exists.

   That is the fault this repository keeps finding in its own checks, exactly as `check/ui.js`
   records it: "It reported nothing because it had never signed in." The answer there was two
   visitors and it is the answer here. The signed-out pass is short — this app shows a stranger very
   little — so it costs a few seconds and closes the one hole the long pass has. */
```

### ---------- KNOWN QUIET, WITH A WRITTEN REASON EACH, AND STILL PRINTED

top level, before `ACCEPTED_QUIET`

```
/* ---------- KNOWN QUIET, WITH A WRITTEN REASON EACH, AND STILL PRINTED ----------------------------
   `ACCEPTED` in check-payload.js and `ACCEPTED_TAP` in check/ui.js carry the same argument: a
   finding that is real, understood and correct does not stop being real, and left in the count it
   turns the run into a wall nobody reads. Each entry is one action and one sentence saying why
   pressing it changes nothing THAT THIS CAN SEE — which is a different claim from "it does
   nothing". */
```

### ---------- A FILE PICKER

in `ACCEPTED_QUIET`

```
/* ---------- A FILE PICKER --------------------------------------------------------------------
     Both press a hidden `<input type="file">`, which opens the device's own chooser — a window this
     harness cannot see and nothing on the page changes until a file is chosen. */
```

### ---------- A BOX WITH NOTHING IN IT

in `ACCEPTED_QUIET`

```
/* ---------- A BOX WITH NOTHING IN IT ------------------------------------------------------------
     All four refuse in the same way and it is the right refusal: the box is focused and the handler
     returns. Sending an empty message is not an action, and a toast saying so would be the app
     telling somebody what they can already see. */
```

### ---------- A QUESTION ABOUT A PAPER NOBODY HAS CHOSEN

in `ACCEPTED_QUIET`

```
/* ---------- A QUESTION ABOUT A PAPER NOBODY HAS CHOSEN -------------------------------------------
     The practice paper's selects (writing size, line spacing, square size) live in `#mat-blank`,
     which is hidden while the cheat sheet is the kind chosen — and the cheat sheet is what the tool
     opens on. Pressed hidden, the setting is taken and kept for when the paper is chosen, and the
     screen rightly does not change. check-flow's practice-paper journey presses each of them with
     the paper showing and reads the ruling they draw. */
```

### IT CAME OFF THIS LIST ONCE, WITH THE STATE THAT REACHED IT.

in `ACCEPTED_QUIET`

```
/* IT CAME OFF THIS LIST ONCE, WITH THE STATE THAT REACHED IT. The "carry on" block was deleted
     and nothing pressed `pad-clear` again, so the entry would have been a written reason with
     nothing behind it. `stuff · a diagram you can draw on` reached it again; that state went when the pen
     moved from the figure page to the card (docs/history/337), and the Find states still reach it -- the
     run names the one it pressed it on. */
```

### ---------- A CARET IS NOT A PRESS

in `ACCEPTED_QUIET`

```
/* ---------- A CARET IS NOT A PRESS --------------------------------------------------------------
     These are `<input>`s and a `<textarea>`. They answer what is TYPED — `input` and `change` — and
     clicking one puts a caret in it, which is meant to change nothing at all. */
```

### THE TYPING LINE IS A CARET TOO, with a button round it.

in `ACCEPTED_QUIET`

```
/* THE TYPING LINE IS A CARET TOO, with a button round it. Its whole effect is the focus moving to
     the hidden box, and the rung above it — pressed first, because it is first on the card — hands
     the focus there as well, so by the time the line is pressed the card is already listening. On
     its own, on a card that is not, it does change the markup (`.kt-box.typing`); measured. */
```

### ---------- NO CAMERA IN A CONTAINER

in `ACCEPTED_QUIET`

```
/* ---------- NO CAMERA IN A CONTAINER ------------------------------------------------------------
     `cam-shoot` and `cam-video` are reported as DISABLED rather than quiet, which is the shutters
     doing exactly what `camLive_` was written to do. These two are enabled and correctly do nothing
     without a stream. */
```

### ---------- A CONTROL WHOSE WHOLE JOB IS A SOUND

in `ACCEPTED_QUIET`

```
/* ---------- A CONTROL WHOSE WHOLE JOB IS A SOUND -------------------------------------------------
     IMPOSTER'S LISTEN SAYS THE CARD THROUGH THE PHONE'S OWN VOICE and changes nothing on the page, on
     purpose: a card that changed when the word was spoken would be a tell from across the table. This
     harness cannot hear, so it is quiet here by construction. check-flow stubs `speechSynthesis` and
     asks what was said, to whom, and when it was cut off — that is where this press is proved. */
```

### A TEXTBOOK ANIMATION'S PLAY AGAIN PUTS THE SAME MARKUP BACK, which is how a CSS animation starts over:

in `ACCEPTED_QUIET`

```
/* A TEXTBOOK ANIMATION'S PLAY AGAIN PUTS THE SAME MARKUP BACK, which is how a CSS animation starts
     over: new elements, the same drawing. Everything this harness compares is the same afterwards by
     construction — the motion restarting is the whole effect. check-flow proves it ("Play again left
     the drawing's elements in place" if the nodes are not new; "changed the drawing" if they are not
     the same). */
```

### AND SHOW, PRESSED STRAIGHT AFTER DEAL, IS A DOUBLE TAP — which is what it is ignored as, on purpose.

in `ACCEPTED_QUIET`

```
/* AND SHOW, PRESSED STRAIGHT AFTER DEAL, IS A DOUBLE TAP — which is what it is ignored as, on purpose.
     On the setup state this presses Deal and then Show, which Deal has just drawn on the same pixels,
     well inside `IMP_GAP`: two taps that close are the double tap the guard exists for (games.js, "a
     second tap is not a second press"). Scoped to that state, so a Show that went dead anywhere else
     still shows here; check-flow proves Show alone opens the card and a second tap does not. */
```

### AND SO ARE THE REVEAL'S DEAL AND PLAYERS, PRESSED STRAIGHT AFTER REVEAL, since the review of 11 October:

in `ACCEPTED_QUIET`

```
/* AND SO ARE THE REVEAL'S DEAL AND PLAYERS, PRESSED STRAIGHT AFTER REVEAL, since the review of 11
     October: a double tap on Reveal put its second tap on Players and threw the reveal away before
     the table had seen it, so those two take the same guard now (games.js, `imp-again`). On the play
     state this presses Reveal and then the two buttons it has just drawn, inside `IMP_GAP`. Scoped to
     that state; check-flow proves each pressed on its own deals or goes back to setup, and that a
     second tap straight after Reveal does neither. */
```

### ---------- THE THINGS A PRESS MUST NOT BE ALLOWED TO DO TO THE HARNESS

top level, before `GUARDS`

```
/* ---------- THE THINGS A PRESS MUST NOT BE ALLOWED TO DO TO THE HARNESS ---------------------------
   None of these is a fault in the app and every one would end the run: a reload throws away the
   sweep, a new window is a second page nothing is watching, a `confirm` that nobody answers blocks
   the thread for ever. `confirm` answers YES rather than no, deliberately — answering no would walk
   the path where nothing happens and report it as a press that did nothing, which is the exact
   finding this file exists to make honest. */
```

### AND IT ANSWERS LIKE A REAL BROWSER RATHER THAN DOING NOTHING.

in `GUARDS`

```
/* AND IT ANSWERS LIKE A REAL BROWSER RATHER THAN DOING NOTHING. Headless has no dialogue, so a
     bare stub never fires `afterprint` — and all three of this app's print paths take their paper
     away in that listener, with a four-second backstop behind it. Left to the backstop, an A4 sheet
     sits at the foot of `body` across the next several presses and the class stays on. Dispatching
     the event is the dialogue being opened and dismissed, which is what a press is. */
```

### ---------- WHAT THE PAGE IS, IN ONE STRING

top level, before `stateOf`

```
/* ---------- WHAT THE PAGE IS, IN ONE STRING ------------------------------------------------------
   Read before and after every press. Wide on purpose — see the header. The markup is LENGTH rather
   than content because a repaint that rebuilds identical markup is not a change anybody can see,
   and hashing four thousand result cards per press would cost more than the press. */
```

### HASHED, NOT MEASURED.

in `stateOf`

```
/* HASHED, NOT MEASURED. The first version compared `innerHTML.length`, and a repaint that swaps
     one class for another of the same length reads as nothing having happened — which is precisely
     the fault this file is for, reported as a clean press. Caught on `book-edit`: 18,804 characters
     before and 18,804 after, with the grid's open state genuinely different underneath. A 32-bit
     rolling hash over the markup costs a millisecond and cannot be fooled that way. */
```

### A TICK IS A PROPERTY, NOT MARKUP.

in `stateOf`

```
/* A TICK IS A PROPERTY, NOT MARKUP. `checked` moves without touching `innerHTML`, so a checkbox
       whose whole effect is the box it ticks — `qual-tick` unticking another level's Teach, say —
       read as a press that did nothing. Counted per screen; there are a few dozen. */
```

### `#drop` WAS READ HERE, the booking form's list of answers while it was a panel outside the screens.

in `stateOf`

```
/* `#drop` WAS READ HERE, the booking form's list of answers while it was a panel outside the
       screens. It went on 9 October (note 315): the list is checkboxes in the card now, so opening it
       and ticking in it change `#s-booking` itself and the two reads above see both. */
```

### AND PRINTS, COUNTED THE WAY FETCHES ARE.

in `stateOf`

```
/* AND PRINTS, COUNTED THE WAY FETCHES ARE. A print is the one action whose whole effect is
       OUTSIDE the page: `mat-print` builds an A4 sheet, appends it to the end of `document.body`,
       calls `window.print()` and takes it away again — so a state read that stops at `#s-<id>` and
       the sheet sees it as a press that did nothing, and one that watched `body` instead would see
       only the few hundred milliseconds the paper is there. What actually happened is that the
       browser was asked to print, so that is what is measured. */
```

### AND FULL SCREEN, FOR PRINT'S REASON:

in `stateOf`

```
/* AND FULL SCREEN, FOR PRINT'S REASON: its whole effect is outside the markup. The videos card's
       Full screen tile hands the PLAYER to the browser (`requestFullscreen`), and the card underneath
       is, correctly, exactly as it was — so a state read that stops at the page called it a press
       that did nothing. IT HAD NEVER BEEN PRESSED HERE BEFORE note 311: the tile was drawn DISABLED
       while nothing played, which is the state the Games column opens in, and `done` is per screen —
       so it was filed "present and disabled" there and skipped in the state where it plays. Drawn
       only while something plays now, it was pressed for the first time and read as quiet. What
       happened is that the browser was asked for full screen, so that is what is measured. */
```

### ---------- IS THE APP STILL THERE

top level, before `aliveIn`

```
/* ---------- IS THE APP STILL THERE ---------------------------------------------------------------
   Three facts, each of which has been false in this repository's history: `go` gone is the boot
   failure the splash used to cause by wiping the body; a missing section is the tab-with-no-screen
   fault `check-doors.js` rule 1 exists for; and "this screen did not draw" is `paint`'s own catch,
   which `check/ui.js` learned to look for after 88 combinations reported nothing while a person's
   profile was an error card. */
```

### BOTH OF THOSE RUN IN THE PAGE, NOT HERE.

top level, before `PAGE_HELPERS`

```
/* BOTH OF THOSE RUN IN THE PAGE, NOT HERE. They are written as ordinary functions so they can carry
   their reasons, and injected by their own source — which is the only way `page.evaluate` can call
   them by name without every caller passing them across the boundary. */
```

### THE DISPATCHER'S OWN LINE.

top level, before `status`

```
/* THE DISPATCHER'S OWN LINE. Anything else on the error channel is a 404 for a photograph or a
       codec the container does not have, and reporting those as broken handlers would be the
       95-findings-with-2-real-ones fault `check-rows.js` records. */
```

### THE SEED MUST ACTUALLY HAVE WORKED, and so must its absence.

top level, before `signedIn`

```
/* THE SEED MUST ACTUALLY HAVE WORKED, and so must its absence. A seeded key the app ignores
     would press the stranger's controls twice and report it as coverage — "I did not press it"
     printed as "I pressed it and it was fine", which is this project's recurring failure. */
```

### `--screen=stuff,res` PRESSES SEVERAL IN ONE PAGE, IN THAT ORDER — which is what a press that leaks from one column into the next needs to be seen:

top level, before `screens`

```
/* `--screen=stuff,res` PRESSES SEVERAL IN ONE PAGE, IN THAT ORDER — which is what a press that
     leaks from one column into the next needs to be seen: the second finder's review (329) found Find's
     Open tile carrying words into the second column and every `res` state after it failing, and neither
     screen pressed alone could show it. That tile is gone (347); the two finders sharing nothing is
     still the thing a list of screens is for. */
```

### ---------- ONE PRESS

top level, before `pressOne`

```
/* ---------- ONE PRESS ---------------------------------------------------------------------------
     Pulled out of the loop because it is called twice: once where the action was last seen, and
     again after a reload when it was not there any more. */
```

### THE ONE THAT IS NOT ALREADY CHOSEN, WHERE THERE IS A CHOICE.

in `pressOne`

```
/* THE ONE THAT IS NOT ALREADY CHOSEN, WHERE THERE IS A CHOICE. The first honest run reported
       `mat-level`, `mat-exam` and `timer-set` as presses that changed nothing, and all three were
       this harness pressing the option that was already selected — the answer a person gets for
       tapping the button that is already lit, which is correctly nothing. That is a fault in the
       instrument reported as a fault in the app, and it is the shape every entry in CLAUDE.md about
       a check warns of. */
```

### PRESENT AND DISABLED IS NOT ABSENT, and it is not a fault either.

in `pressOne`

```
/* PRESENT AND DISABLED IS NOT ABSENT, and it is not a fault either. `mat-print` is greyed until
       the sheet has something on it to print, and a disabled control doing nothing when it is
       pressed is the browser working correctly. Reported apart from "could not find it at all",
       because those two want opposite responses. */
```

### ---------- QUIET MEANS EVERY CONTROL THAT CARRIES IT IS QUIET

in `pressOne`

```
/* ---------- QUIET MEANS EVERY CONTROL THAT CARRIES IT IS QUIET ---------------------------------
       THE FIRST VERSION PRESSED ONE ELEMENT AND BELIEVED IT. `fm-preset` is three buttons — flyer,
       sticker, poster — and the flyer maker opens ON the flyer preset, so pressing the first of them
       asks it to become what it already is. Measured: that press changes nothing and pressing
       `sticker` changes the zoom, two checkboxes and 3,543 characters of drawing. A harness fault
       reported as an app fault, which is what every entry in CLAUDE.md about a check warns of.

       SO IT PRESSES THE NEXT ONE WHEN THE LAST CHANGED NOTHING, up to four, and the claim it ends up
       making is the honest one: no control carrying this action did anything. Four rather than all,
       because `fav` is on every card in the library and a control that is quiet on four separate
       cards is quiet. */
```

### THE WAY THE APP ITSELF IS PRESSED.

in `pressOne`

```
/* THE WAY THE APP ITSELF IS PRESSED. `dispatchEvent` rather than `.click()` because this is
         about the DISPATCH — whether the handler runs and what it does — and not about whether the
         box can be hit, which `check/ui.js` owns and measures properly.

         A SELECT AND A CHECKBOX SPEAK THROUGH `change` and the dispatcher refuses them on `click`
         outright. Moving the value on by one is what a person does; leaving it where it is and
         firing `change` would run the handler with the answer it already had and report a press
         that did nothing, which is the finding this file exists to make honest. */
```

### AN ANSWER, NOT THE BLANK.

in `pressOne`

```
/* AN ANSWER, NOT THE BLANK. The booking form's selects open on an empty "Choose…" row, and
           moving the client from Test Admin to that row is choosing nobody — which the form rightly
           ignores. It passed until 5 October only because the repaint it caused left the page
           unplaced (no `on`, no styles) for longer than the 130ms below, and that difference in the
           markup was read as the press having done something; once `paint` re-placed what it drew,
           `book-set` read as quiet. The blank is pressed only when there is nothing else. */
```

### WHAT THE PRESS PUT IN FRONT OF SOMEBODY.

in `pressOne`

```
/* WHAT THE PRESS PUT IN FRONT OF SOMEBODY. A sheet's actions are on no screen at all — the
       details form, the composer, the pay sheet, the practical guide — so the only way any of them
       is ever pressed is by being collected here, while the sheet that holds them is still open. */
```

### ---------- A CLEAN PAGE, WHICH IS THE ONLY HONEST WAY TO SAY "NOT THERE"

top level, before `freshen`

```
/* ---------- A CLEAN PAGE, WHICH IS THE ONLY HONEST WAY TO SAY "NOT THERE" ------------------------
     Ten actions went unpressed on the first honest run of this file and every one was the harness
     rather than the app: answering the funnel's first question takes every card off the Find screen,
     so `fav` and `spot` were gone by the time their turn came. An action missing after other presses
     is not an action that is missing. It gets a page nobody has touched, and only then is it
     reported. */
```

### BACK INTO THE STATE, not into the screen's front door.

in `freshen`

```
/* BACK INTO THE STATE, not into the screen's front door. The Find screen opens on the funnel's
       question and holds ONE page — measured: four `facet-pick`s and a `facet-skip`, and nothing
       else. So a reload that stopped at `go('stuff')` put every card action out of reach exactly
       when it was being looked for. */
```

### ---------- A COLUMN THIS VISITOR IS NOT GIVEN HAS NOTHING OF THEIRS TO PRESS

top level, before `given`

```
/* ---------- A COLUMN THIS VISITOR IS NOT GIVEN HAS NOTHING OF THEIRS TO PRESS ----------------------
     `biz` is an admin's (`columnsFor_`, shell.js; docs/history/334): for the signed-out visitor
     `go('biz')` lands on the front door, and `--screen=biz` pressed the feed's controls under
     Business's name. Asked of the app's own row; said, and not counted as pressed. The row is asked
     for AGAIN first (`columnsFor_`): a Settings state plays a parent on this admin's phone, a press in
     it can repaint while it does, and the row it left would skip an admin's column for the admin. */
```

### ---------- ONE PASS PER DECLARED STATE

top level, before `done`

```
/* ---------- ONE PASS PER DECLARED STATE ----------------------------------------------------------
     `check/states.js` IS SHARED WITH `check/ui.js` and the note at its head says why it is one list.
     It earns its keep loudly here: pressing only the state a screen opens in left `fav`, `spot`,
     `qp-ans` and `filter-clear` unpressed, because answering the funnel's first question takes every
     card off the Find screen — and it left the practical guide, the films, the message thread, the
     session receipt and the basket unpressed entirely, since none of them is on a screen `go()`
     lands on. */
```

### WHOSE STATE IS THIS.

top level, before `mine`

```
/* WHOSE STATE IS THIS. `only` is the same flag `check/ui.js` reads — a widget an admin cannot
       see, a payload key a stranger has no rows for. Asking for a state this visitor cannot be in
       would report a fault about the check rather than about the app. */
```

### ASKED AGAIN FOR UP TO 2.5s, NOT ONCE.

top level, before `got`

```
/*
       ASKED AGAIN FOR UP TO 2.5s, NOT ONCE. Several states finish their `enter` on a timer of their
       own — `setTimeout(…, 150)` before the real press, so the card is placed first — and on a loaded
       machine that timer, the press and the paint behind it outlast the fixed wait above. Measured on
       6 October with `check/press.js --screen=stuff`: "a typed answer, marked not yet" did not arrive
       on 1 run in 2 on the base commit and on this branch alike, with nothing wrong in the app. A
       state that never arrives still fails, after the 2.5s; one that arrives late is measured. */
```

### THE QUEUE, BY NAME rather than by element.

top level, before `t0`

```
/* THE QUEUE, BY NAME rather than by element. Pressing every ELEMENT would press `qp-ans` four
       thousand times; what is worth asking once is each distinct ACTION, because the handler is the
       thing that can be broken. Re-found before every press, because the press before it may have
       rebuilt the screen. */
```

### ---------- AND FROM THE SHEET, IF THIS STATE OPENED ONE

top level, before `t0`

```
/* ---------- AND FROM THE SHEET, IF THIS STATE OPENED ONE -----------------------------------
       A SHEET IS A SIBLING OF THE SCREENS, so `#s-<id>` cannot see inside one — and a state whose
       `enter` opens a sheet therefore queued NOTHING, because the only other route to a sheet's
       actions is `out.inSheet`, which is collected after a press.

       MEASURED: a sheet's three actions (a feature since deleted) were never pressed, and
       `check/press.js` reported a clean run over 93 actions with the three of them untouched.
       Proved by breaking one of them outright — the mutant survived, which is the definition of a
       check that cannot fail. The practical guide's state was in the same hole and got away with it
       only because the boxes it holds are `qp-ans`, which is pressed on a question card elsewhere.

       THE STATE IS THE THING THAT PUT IT THERE, so it is seeded here rather than reached by a
       press. That is the same argument `check/ui.js` makes for adding `#sheet` to its measured
       roots: the declared state IS the app's own door, and a sheet that a state opened is a surface
       somebody is on. */
```

### ---------- AND EVERY WIDGET ON IT STARTED BEFORE THE QUEUE IS READ

top level, before `t0`

```
/* ---------- AND EVERY WIDGET ON IT STARTED BEFORE THE QUEUE IS READ ----------------------------
       ARRIVING AT A COLUMN STARTS ITS WIDGETS A FEW AT A TIME NOW (`widgetsLater_`, arcade.js), and a
       widget draws most of its controls in `start` — Connect 4's columns, Othello's squares, the
       round games' Start. Read 300ms after arriving, the queue held the column's `New game` buttons
       and not the boards they reset, so `c4-again` was pressed on a board nobody had played and read
       as doing nothing; the base commit started everything at once, the cells were found first in
       document order, a counter was dropped, and `New game` had something to undo. Measured on
       6 October: base green, branch 8 quiet (`c4-again`, `oth-again`, `rg-next`, `rg-again`, both
       visitors), the same screen in the same harness. So the queue waits for the widget queue and
       the after-slide jobs to run dry — the app's own idea of "arrived" — bounded at 6s. */
```

### A RELOAD ONLY FOR SOMETHING THIS STATE ACTUALLY HAD.

top level, before `out`

```
/* A RELOAD ONLY FOR SOMETHING THIS STATE ACTUALLY HAD. An action that arrived in the queue
         because an earlier press put it on the screen belongs to a later state, and reloading for it
         here costs two and a half seconds to look in the one place it was never going to be. */
```

### NOT MARKED DONE WHEN IT WAS NOT THERE.

top level, before `screen`

```
/* NOT MARKED DONE WHEN IT WAS NOT THERE. An action queued in one state because a press put it
         on the screen belongs to a LATER state — `fav` and `spot` are on result cards and the Find
         screen's question state holds no cards at all. Marking it done here is how four card
         actions went unpressed while the state that has them ran next. */
```

### THE SHEET IS PRESSED NOW, WHILE IT IS OPEN.

top level, before `inner`

```
/* THE SHEET IS PRESSED NOW, WHILE IT IS OPEN. Queueing its actions to the end is what the
         first version did, and the loop closes the sheet after every press — so `post-save` and
         `post-delete` came up for their turn against a screen that had not held them for twenty
         presses. Depth one: a sheet opened from inside a sheet is a state this app does not have. */
```

### BACK TO THE SCREEN, because a press is allowed to navigate and the next one has to be asked of the screen it belongs to.

top level, before `screen`

```
/* BACK TO THE SCREEN, because a press is allowed to navigate and the next one has to be asked
         of the screen it belongs to. The sheet is closed for the same reason — an open one would
         hide the screen's own actions behind whatever it holds. */
```

### AND THE OTHER THING A FINGER DOES.

top level, before `swipes`

```
/* ==================================================================================================
     AND THE OTHER THING A FINGER DOES.

     EVERY SCREEN IN THIS APP IS REACHED BY A SWIPE and nothing anywhere measured one. The tabs are a
     second way in, so a broken gesture would leave the app looking usable on a desktop and be the
     whole navigation gone on a phone — which is the shape `overworld.js` already records twice: the
     grid listened for `touchstart` alone and did nothing at all with a mouse, and a `setPointerCapture`
     on every press meant the release went to the root and no card, chip or tick ever answered.
     "Nothing threw. The app rendered perfectly and simply stopped answering."

     A REAL DRAG, NOT A CALL TO `go`. `page.mouse` produces the pointer events the window listens for,
     in the order and at the pace a hand makes them, so this exercises the thresholds, the axis lock
     and the velocity — none of which a direct call touches.

     BOTH DIRECTIONS AND BOTH AXES, and the ends are part of the test: a swipe left from the last
     column must stay on the last column rather than sliding into nothing. */
```

### ---------- AND THE ROW IS READ ONCE THE PAYLOAD HAS LANDED, NOT AFTER A FIXED WAIT

top level, before `timeout`

```
/* ---------- AND THE ROW IS READ ONCE THE PAYLOAD HAS LANDED, NOT AFTER A FIXED WAIT ----------
       `TABS` IS IN TWO ORDERS DURING A BOOT. Until the payload and its settings files arrive it is
       `TAB_ORDER` (Settings last); when they land, `applyColumns_` puts it in `columns.json`'s order
       (Settings right of You). On a machine running other checks the 2.2s above ended before that, so
       the neighbours below were taken from one order and the swipes landed in the other — measured on
       9 October, adding Progress: six swipes "went somewhere else", every one of them a pair the
       reorder had moved (`left from account landed on settings, wanted tools`), the app right each
       time. `LOADED` is set after `applyColumns_`, success or failure, so it is the moment the row
       stops moving. Thirty seconds and then a throw, which exits non-zero: a row read mid-boot is not
       a row measured. */
```

### ---------- BARE CARD MEANS NOT A SELECT

top level, before `bare`

```
/* ---------- BARE CARD MEANS NOT A SELECT ----------------------------------------------------------
       THESE SWIPES START ON BARE CARD, and a fixed point was bare card everywhere while every select was
       `pointer-events: none` (note 226). Since the dropdowns are the platform's own again (note 315), a
       MOUSE pressed on a select opens its list on the press — which is what a laptop's dropdown does,
       and is the dropdown working — and the list takes the drag with it. Measured on the first run: the
       left swipe from Settings began on the country code at (320, 420), the list opened, and the next
       five swipes landed in the wrong column. So the point is walked off a select, a few rows at a
       time; a touch swipe that starts on one still moves the column, and the real-touch block below
       asks exactly that. */
```

### ---------- THE NEIGHBOURS ARE ASKED AT THE SWIPE, NOT AT THE START

top level, before `i`

```
/* ---------- THE NEIGHBOURS ARE ASKED AT THE SWIPE, NOT AT THE START -----------------------------
       `TABS` WAS READ ONCE, 2.2s after load, and the column order is not settled by then on a busy
       machine: `data/settings/columns.json` puts Settings beside You (`sort_order` 9) when it lands, and
       when it landed after the read, every swipe round Settings was held to `TAB_ORDER`'s neighbours —
       five "went somewhere else" on 9 October that were the app obeying its own columns sheet. */
```

### AND A SWIPE THAT STARTS ON A CONTROL MUST NOT PRESS IT.

top level, before `id`

```
/* ==================================================================================================
       AND A SWIPE THAT STARTS ON A CONTROL MUST NOT PRESS IT.

       EVERY SWIPE ABOVE STARTS ON BARE CARD, which is why they were all green while the worst
       navigation fault this app has had was live. The browser fires a `click` after a drag, on the
       nearest common ancestor of where the finger went down and where it came up — so a downward
       swipe beginning on an answer row was delivered as a press of that row.

       WHAT IT LOOKED LIKE, reported: "if i scroll down far enough then scroll back up eventually the
       widgets above disappear". Measured on the Find screen: twenty-five drags, the page never
       moved once, and the funnel answered three more questions on its own — 5,333 results down to
       four and then to the first question with nothing behind it.

       SO THE TEST STARTS THE DRAG ON THE CONTROL, which is the only way to ask this question, and
       wants two things of it: the page turns, and nothing is answered. `PRESS_MOVED` in shell.js is
       what makes both true. Proved by mutation — take it out and the Find screen reports
       `turned 0 pages` with its chips changed underneath. */
```

### THE NEAREST CONTROL TO THE MIDDLE OF THE SCREEN, because that is where a thumb lands.

top level, before `findSpot`

```
/* THE NEAREST CONTROL TO THE MIDDLE OF THE SCREEN, because that is where a thumb lands. A
         column whose first page carries none is skipped rather than reported.

         ASKED AGAIN AFTER THE DRAG, which is why it is a function rather than a value. The drag
         below turns the page — that is the whole thing it asserts — so a coordinate taken before it
         names a control that has since slid off the screen. The press-mark rule was written against
         the stale one and reported five columns lit nothing; every one of them was the harness
         pressing empty card, which is the shape every entry under `check/load.js` already records
         about this kind of probe lying in whichever direction is easiest to believe. */
```

### ---------- AND SOMETHING HAS TO BE THERE WHEN A REAL FINGER ARRIVES

in `findSpot`

```
/* ---------- AND SOMETHING HAS TO BE THERE WHEN A REAL FINGER ARRIVES ------------------
             A RECT IS A LAYOUT POSITION AND A PANE CLIPS. The star tile at the foot of a widget
             card on Tools and on Games reports a box in the middle of the screen and
             `elementsFromPoint` at its own centre gives the bare `.screen` — it is below its pane's
             fold, so it is drawn nowhere and a mouse lands on nothing. Every press this file made
             before the press-mark rule went in was `dispatchEvent`, which needs no hit test and
             says so in the header; the moment one of them became a real pointer the finder had to
             answer the other question too.
             IT MAKES THE DRAG ABOVE HONEST AS WELL. A drag from a point where the control is not
             begins on bare card, which is the exact case that test exists to stop being the only
             one measured — and it would have gone on passing while proving nothing. */
```

### AND THE THING YOU PRESSED HAS TO LIGHT UP WHILE THE SCREEN IS THINKING.

top level, before `stray`

```
/* ==================================================================================================
         AND THE THING YOU PRESSED HAS TO LIGHT UP WHILE THE SCREEN IS THINKING.

         `:active` ENDS AT THE LIFT and the funnel's answer takes 130 ms to arrive at 8x CPU, so a
         tap was a flash, an eighth of a second of an unchanged screen, and then the answer —
         reported as *"make the button pressing feel more responsive on the finder"*. `pressMark_`
         in shell.js puts `.is-pressed` on at `pointerdown` and takes it off two frames after the
         handler ran.

         NOTHING ELSE HERE CAN SEE EITHER HALF OF THAT. The press pass reaches a control with
         `dispatchEvent`, which fires no `pointerdown` at all; `check/ui.js` measures whether a
         control can be read and hit, and a control with no press state measures perfectly.

         TWO QUESTIONS, BECAUSE THE TWO FAILURES ARE OPPOSITE. A mark that never goes ON is the app
         silently back to feeling dead; a mark that never comes OFF is a control that looks
         permanently pressed. And the drag above is the third: a swipe that began on this control
         must not leave it lit for the length of the gesture, which is why this runs AFTER it —
         anything still marked here is a mark the drag failed to clear.

         REAL POINTER EVENTS, for the reason the swipes are real: a class added on `pointerdown` is
         invisible to a dispatched click, which is exactly the hole this rule is closing. */
```

### AND A MOUSE IGNORES `touch-action`, WHICH IS WHY EVERY SWIPE ABOVE WAS GREEN OVER A REAL FAULT.

top level, before `held`

```
/* ==================================================================================================
       AND A MOUSE IGNORES `touch-action`, WHICH IS WHY EVERY SWIPE ABOVE WAS GREEN OVER A REAL FAULT.

       `page.mouse` is the right instrument for the thresholds, the axis lock and the velocity — and
       it is blind to the one property that decides whether the app is handed the gesture at all.
       `touch-action` applies to touch and to nothing else, so a box that swallows every drag on a
       phone measures perfectly with a cursor. That is this project's own recurring shape one layer
       down: an instrument that cannot reach its subject reporting that the subject is fine.

       WHAT IT COST: a blanket `touch-action: pan-y` on every `textarea` in the app. Measured with
       real touch events, a `pan-y` DIV with nothing to scroll hands the gesture back (`#docket-body`
       at 28/28 turns the page) and a `pan-y` TEXTAREA never does — a drag inside a text control is a
       SELECTION, so the browser sends one `pointermove` and then `pointercancel`. You could land on
       the notepad, the comment box, the message composer or a question card's answer box and not be
       able to swipe off it in either direction.

       SO THE RULE IS THE NARROW ONE THE FAULT SHARES: a box with nothing to scroll must not keep the
       gesture. Asked of every surface in the app that carries its own touch behaviour, in the axis
       it cannot use — and a box that CAN scroll is not asked, because keeping the drag is then what
       somebody reached for, which is the argument the stylesheet makes beside those rules. */
```

### `.ws` AND `.ss-chips` ARE NOT KEEPERS — THEY ARE HERE TO PROVE THEY ARE NOT.

top level, before `KEEPERS`

```
/* `.ws` AND `.ss-chips` ARE NOT KEEPERS — THEY ARE HERE TO PROVE THEY ARE NOT. The word search
       and the sentence scramble are grids of small buttons a finger lands on to swipe as often as to
       tap, and both chose taps over a drag precisely so that a swipe starting on them would still be
       the grid's (see `WS_THEMES` in games.js). A mouse cannot say whether that holds on a phone;
       real touch events can. */
```

### `go` AS WELL AS `goPage`, EVERY PAGE.

top level, before `id`

```
/* `go` AS WELL AS `goPage`, EVERY PAGE. The sideways swipe below leaves the app on the NEXT column,
           and `goPage` alone turned this column's page while it sat off-screen to the left — so after the
           first sideways swipe on a column every later page's spots were measured at x < 0, filtered out as
           off the screen, and never swiped from. Found because the sentence scramble's chips, eleven pages
           into Games, were never measured. */
```

### NOT ON A DROPDOWN. A `<select>` (and anything marked `data-noswipe`) keeps the gesture on purpose — `axisFree` says so — so a swipe that happens to START on

in `spots`

```
/* NOT ON A DROPDOWN. A `<select>` (and anything marked `data-noswipe`) keeps the gesture
               on purpose — `axisFree` says so — so a swipe that happens to START on one measures that
               rule rather than this one. The flyer maker lost its preview and the middle of its box
               became a select; the spot is walked down the box to the first point that is not one. */
```

### AND PREFERABLY ON THE BOX ITSELF rather than on a control inside it:

in `spots`

```
/* AND PREFERABLY ON THE BOX ITSELF rather than on a control inside it: a touch is SNAPPED
               to a nearby control by the browser's touch adjustment, so a point on a label an inch from
               a select still arrives as a press on the select. A gap in the box has nothing to snap to. */
```

### A SECOND FLICK WHILE THE FIRST IS STILL SETTLING GOES THE WAY THE FINGER WENT

top level, before `flick`

```
/* ==================================================================================================
       A SECOND FLICK WHILE THE FIRST IS STILL SETTLING GOES THE WAY THE FINGER WENT

       THE SETTLE LEAVES AT THE FINGER'S SPEED NOW (`settleCurve_` in shell.js), which makes it longer,
       and a card still moving can be caught by the next touch (`SWIPE.catch` in overworld.js). The
       first version of that catch put the card's leftover distance into the DECISION as well as the
       placement — so a second flick up 30ms after the first carried hundreds of pixels the other way
       and turned the page back: 1, 2, 1. Every rule above swipes from rest, so none could see it; the
       review told to refute the change found it with a probe, and this is that probe. Up then up must
       advance two pages, up then down must come back, at gaps inside the settle and one after it. */
```

### A REAL FLICK, sent the way a phone sends one:

top level, before `flick`

```
/* A REAL FLICK, sent the way a phone sends one: a move every 8ms of wall time, NOT awaited one by
       one. Awaiting each round trip spaced the moves 33ms apart, so eight of them took a quarter of a
       second and the "flick" was a slow drag at 0.2px/ms that no version of the code would ever turn a
       page on — measured, and it cost a wrong fix before it was understood. */
```

### A SHORT SECOND FLICK, because that is where the fault bites:

top level, before `spot`

```
/* A SHORT SECOND FLICK, because that is where the fault bites: the card's leftover distance
         has to outweigh the finger's travel for a decision that counts it to go the wrong way.
         Measured here, a flick 20-40ms after the first catches the card 30-50px short of its page, so
         a 40px flick — a flick by speed, and turned on its own — is the one a wrong rule turns back or
         drops. */
```

### A TALL QUESTION CARD IS READ BY SWIPING AND LEFT BY SWIPING, WHICH IS TWO CLAIMS

top level, before `width`

```
/* ==================================================================================================
       A TALL QUESTION CARD IS READ BY SWIPING AND LEFT BY SWIPING, WHICH IS TWO CLAIMS

       431 OF 5,032 QUESTION CARDS ARE TALLER THAN THE PANE -- `check/cards.js` counts them -- and the
       answer is that such a pane gets `overflow-y: auto` from `paneReach_` while `scrollHost_` in
       overworld.js scrolls it from the app's own drag. Both halves matter and only one of them is
       obvious:

         THE FIRST ATTEMPT GAVE THE PANE `touch-action: pan-y`, which is what `padReach_` does for
         the notepad and is wrong here. `touch-action` is read once at the start of a gesture and
         cannot say "at the bottom, going up", so the browser kept every vertical gesture for ever:
         measured, the card scrolled to its end and then three more swipes left the page where it
         was. A question card you cannot leave is worse than one you cannot finish reading.

       SO THE CHECK IS THE CONTRACT RATHER THAN THE MECHANISM: a swipe up on a tall card scrolls it
       and does not turn the page; at the bottom the next swipe DOES turn the page. Neither half is
       visible to anything else here -- `check/cards.js` measures the height and `check/ui.js`
       measures the screen, and a card that scrolls perfectly and can never be left measures clean
       in both. */
```

### ON THE NARROW PHONE.

top level, before `width`

```
/* ON THE NARROW PHONE. With stems on their own pages and long parts cut, no question page is
       tall enough at 390 x 844 to need the scroll: `paneReach_` draws a card down to 70% before it
       scrolls, and the tallest left at 390 comes within a pixel of fitting. At 320 x 568 the card found
       below is hundreds of pixels past the pane, so the scroll is there to test. Put back straight after. */
```

### A CARD THAT IS STILL TALL, FOUND RATHER THAN NAMED.

in `tall`

```
/* A CARD THAT IS STILL TALL, FOUND RATHER THAN NAMED. Four named rows have stopped being tall
         under this check: 8464/B/1H Q02.4 when its stem became a page of its own and a long part was
         cut between paragraphs (`partChunks_`); a probability-tree worksheet question when the 1st
         Class Maths sheets were transcribed properly (6 Oct); and the 1st Class Maths cuboids Q9,
         `check/cards.js`'s tallest card, when "one card, one answer" made it three parts (8 Oct).
         A name is a bet on the library standing still. So: the longest questions in the library,
         longest first, until one has a page with room to scroll.

         BY PAGE, NOT BY RESULT — a practical is four pages, so a result's index is not its page
         once one sorts ahead of it. `stuffPageOf_` is the app's own mapping. AND ITS TALLEST PAGE,
         not its first: a question is a stem page, a card and its answers, and which of them
         overflows is the transcription's business. Measured, then gone back to. */
```

### WHAT MAKES A PAGE TALL HERE IS OPTIONS, NOT WORDS.

in `tall`

```
/* WHAT MAKES A PAGE TALL HERE IS OPTIONS, NOT WORDS. A long stem is cut between paragraphs
         (`partChunks_`) and a long card is drawn smaller (`paneReach_`, down to `PANE_ZOOM_MIN`), so the
         six longest questions all fitted (0px, measured 8 Oct). What cannot be cut or shrunk past the floor is
         a row of full-width option buttons: `check/cards.js`'s tallest cards at 320 are all "choose the
         true statements" with eight long options. So: most options first, then most words, and measured. */
```

### A GRID TAPPED AFTER SCROLLING IT OPENS THE NEXT QUESTION AT THE TOP, NOT WHERE THE FINGER WAS

top level, before `where`

```
/* ==================================================================================================
       A GRID TAPPED AFTER SCROLLING IT OPENS THE NEXT QUESTION AT THE TOP, NOT WHERE THE FINGER WAS

       FOUND BY THE REVIEW, ON THE BIBLE. Psalms's 150 chapters are taller than the question's pane on
       this phone even at `PANE_ZOOM_MIN`, so you scroll the pane to reach 119 — and the tap rewrote the
       question inside the same pane and kept its `scrollTop`. Psalm 119's 176 verses opened scrolled down
       by as much: the search box, the chips with CHAPTER 119 on them and the first rows of verses above
       the glass, and below it a grid of the same numbers in the same columns with `119` where it was.
       Nothing visibly happened, the natural thing was to tap again, and that was Psalm 119:119.

       NOTHING ELSE HERE COULD SEE IT. `check-flow.js` presses answers in jsdom, where nothing scrolls;
       the states in `check/states.js` arrive at each grid by setting the chips, which never scrolls a
       pane first; `check/ui.js` measures a screen at rest. It is a SEQUENCE — scroll, then tap — on a
       phone short enough to need the scroll, so it is pressed here, with a real touch, at 320 x 568.

       AN ADMIN'S, because only an admin is shown the Bible — `VISITORS[0]`, the visitor this page was
       seeded as. And A CHECK THAT CANNOT REACH ITS SUBJECT SAYS SO: a grid that fits without scrolling
       here has nothing to test, and that is "not measured", never a pass. Proved by mutation: without
       the reset in `paintStuff`, Psalm 119's grid opened 496px down with the chips out of sight. */
```

### AND A LINE OF BEST FIT IS A SIDEWAYS DRAG ON A PAGE THAT SLIDES SIDEWAYS.

top level, before `PEN_PAPER`

```
/* ==================================================================================================
       AND A LINE OF BEST FIT IS A SIDEWAYS DRAG ON A PAGE THAT SLIDES SIDEWAYS.

       REPORTED AS "when i try draw a line of best fit it slides the whole widget to the left and
       becomes hard to do". `.qpad.is-drawing .qpad-ink` has carried `touch-action: none` since the
       pen was written, and that stops the BROWSER: the grid's swipe is a `pointermove` listener on
       the window, which never asks the browser for anything, so no `touch-action` anywhere can
       refuse it. Two halves of one sentence and only one of them was ever said.

       THE SAME SHAPE AS THE BLANKET `pan-y` ON EVERY TEXTAREA, one rule along, and found the same
       way: `page.mouse` cannot see it either, because what the pen and the grid are arguing over is
       the gesture rather than the scroll. The pad names itself `[data-noswipe]` while the pen is on,
       which is the list `axisFree` already reads.

       BOTH STATES, BECAUSE ONLY ONE OF THEM IS THE FAULT. Pen on: the stroke is kept and the column
       does not move. Pen OFF: the picture is an ordinary picture and a swipe past it still changes
       column -- a diagram you cannot swipe past is a page with no way off, which is the argument
       written over `.qpad-ink` in the stylesheet and the reason the mark is not permanent.

       Proved by mutation: take the attribute off and the stroke above carries the column from
       `stuff` to `dm`, which is the screenshot the owner sent. */
```

### ---------- ITS CARD, AND THE SCALE THROUGH THE CARD'S OWN `Draw`, TOUCHED

top level, before `draw`

```
/* ---------- ITS CARD, AND THE SCALE THROUGH THE CARD'S OWN `Draw`, TOUCHED -------------------------
         THE PEN IS IN THE CARD, over the figure among its words (docs/history/356): no face to turn to, so the
         card is opened and the five gestures are asked of the pad on it. */
```

### ---------- `.qpad-lock`, BECAUSE THE PICTURE CARRIES THE SAME ACTION NOW

in `box`

```
/* ---------- `.qpad-lock`, BECAUSE THE PICTURE CARRIES THE SAME ACTION NOW ------------
           THIS WAS `[data-do="pad-draw"]` AND IT STOPPED BEING UNAMBIGUOUS. `padWrap_` puts the
           action on `.qpad-art` while the pen is off — the second door, and the one a finger
           finds — and the art comes FIRST in the markup, so `querySelector` handed this the
           PICTURE. Steps 1 and 2 below still passed, because tapping the picture really does arm
           the pen; step 3, which taps the same point to turn it back OFF, landed on the ink
           instead and drew a dot. The pen stayed on, the swipe after it was correctly refused,
           and this reported the app broken. `padArm_` in find.js names the same class for the
           same reason. */
```

### A TAP IS `touch(x, y, 0, 0)` AND NOT `el.click()`.

top level, before `armedByDrag`

```
/* A TAP IS `touch(x, y, 0, 0)` AND NOT `el.click()`. The stroke below sets `PRESS_MOVED`,
           and a synthetic click cannot clear it because nothing sent a `pointerdown` first -- so
           the second press would be swallowed and the pen would read as stuck on. On a phone a tap
           always sends one. Measured: with `el.click()` this reported the pen still on. */
```

### ---------- A DRAG ON THE PICTURE IS A SWIPE, AND IT MUST NOT ARM THE PEN

top level, before `armedByDrag`

```
/* ---------- A DRAG ON THE PICTURE IS A SWIPE, AND IT MUST NOT ARM THE PEN -------------
           THE PICTURE IS A DOOR NOW, so the one thing that could go wrong with it is that every
           swipe beginning on a diagram arms a pen nobody asked for — 26 rows in the library carry
           one, and on those cards the picture is the biggest thing to put a thumb on. What stops
           it is `PRESS_MOVED` in shell.js, which swallows the click a drag produces; this is the
           only instrument that can ask, because a mouse cannot produce the gesture and a
           dispatched click never travels. */
```

### AND MEASURED AGAIN, because coming back places the column afresh.

in `armedByDrag`

```
/* AND MEASURED AGAIN, because coming back places the column afresh. The card grew when Draw
             turned it to its drawing and the column is not re-placed for that (the card keeps its top,
             so nothing under the finger jumps); arriving back at Find centres it for the height it has
             now -- measured, the scale 31px higher than before the swipe at 390x844 -- and a stroke
             aimed at the old box started below the ink, on the card, where a drag turns the column. */
```

### SCALED TO THE PAD, NOT IN FIXED PIXELS.

top level, before `drew`

```
/* SCALED TO THE PAD, NOT IN FIXED PIXELS. It was `y + 30` up by 50, written against a
             pad that held the spinner and the scale in one picture; a paper audit moved the spinner
             onto a shared preamble, this part's own pad became the 66-unit probability scale, and
             the stroke started below its bottom edge -- on the card, where a drag correctly turns
             the page. What is asked is a diagonal stroke that begins and ends on the ink. */
```

### AND THE WHITEBOARD IS THE SAME PEN ON A BOARD THE SIZE OF A PAGE.

top level, before `ctx`

```
/* ==================================================================================================
       AND THE WHITEBOARD IS THE SAME PEN ON A BOARD THE SIZE OF A PAGE.

       ASKED FOR AS *"Can you also add a whiteboard widget in tools. Make it bare bones for now."* It is
       the question pages' pen (`WB_ITEM` in find.js), so the two sentences above are its sentences too
       -- but a board is the biggest thing on its page, where a question's picture is one part of a card,
       and the notepad records what that costs: an EMPTY widget the size of the page that eats every
       swipe is a page with no way off (docs/history/080). So both halves again, on the Tools column:
         unlocked   a sideways swipe across the board moves the column, a downward one turns back a page
                    of Tools, and neither draws anything
         locked     a tap on the padlock (a real tap, not `el.click()`, for `PRESS_MOVED`'s reason above)
                    and then a sideways drag and a downward drag: each is a stroke kept, and neither the
                    column nor the page moves
       ON A PHONE, NOT A WINDOW: its own context with `hasTouch` and `isMobile` at 390x844, because a
       board is where a finger is the only way anybody will use it. Real touches through CDP, as above.
       Proved by mutation: with `axisFree` no longer reading `[data-noswipe]`, both locked drags carry
       the column to Games while the pen keeps the stroke -- the pen and the grid both took the finger,
       which is the line of best fit's report again -- and the real files are green. */
```

### EVERYTHING READ AT ONCE, from the app's own state:

top level, before `wbAt`

```
/* EVERYTHING READ AT ONCE, from the app's own state: where the column and the page are, whether
         the pad is armed both ways, how many strokes its key holds, and where to put a finger.
         AND ONLY ONCE THE COLUMN HAS STOPPED WAKING. Arriving at Tools starts its fourteen widgets one
         per task behind the page in front (`widgetsWake_`), each a layout of the whole document, and a
         fixed 700ms here was a guess at when that ended: on a machine at a load average of 12-17 the
         gesture after it landed among those starts, was delivered at 0.3px/ms, and settled back -- the
         board's first swipe "stayed on Tools" in two runs of three while every other row passed.
         Reproduced at 6x CPU, with eleven widgets still queued as the finger went down. So this waits
         for what `check-flow`'s `quiet()` waits for -- the queue empty and nothing settling -- and
         goes to the column only when it is not already on it, which is what re-queued them. */
```

### ---------- AND ON ITS SIDE, WHERE IT WAS A POSTAGE STAMP

top level, before `ctx`

```
/* ---------- AND ON ITS SIDE, WHERE IT WAS A POSTAGE STAMP ------------------------------------------
       FOUND BY BOTH REVIEWS OF THE BOARD: turned sideways the board was 16x21px at 568x320 and 68x91 at
       844x390 -- nothing cut off, nothing anybody could draw on. `.wb` in style.css now lays the card out
       sideways there, the board the card's height and everything else beside it. So at both sizes, in a
       phone-shaped context: the board at least 120x160px, every tile of the card a 44px square inside
       its pane, and a real tap on the padlock and a real drag across the board is one stroke kept with
       the column and the page where they were -- the side layout is the same pen, measured where the
       finger lands. Proved by mutation: without the `@media` block the 568x320 board is 16x21 and both
       rows say so. */
```

### ---------- AND A FIGURE UNDER THE PEN ON A PHONE ON ITS SIDE, WHERE IT WAS A FEW PIXELS WIDE

top level, before `ctx`

```
/* ---------- AND A FIGURE UNDER THE PEN ON A PHONE ON ITS SIDE, WHERE IT WAS A FEW PIXELS WIDE --------------
       FOUND BY THE REVIEW OF 337. Every pen is on its card since 11 Oct (docs/history/337), and `padFaceFit_`
       had a rule to keep the picture, its bar and `Type` on the glass together, even past the picture's
       180px floor. On a phone held upright it moved three cards a pixel; turned on its side the pane is
       about 350px tall and the rule took the pictures down to nothing: the transformations stem 88px wide
       at 844x390 (axis numbers 3.4px), June 2024 1F Q7's grid 82px at 568x320 and 4px at 568x240, and
       327's made-up grid on 1F Q11c from 141px to 111 -- while every check passed, because every check here
       measured a phone held upright. The rule is gone: a picture is never drawn under the floor (or under
       the size the stylesheet gave it, a made-up grid's `44svh` cap), the card scrolls, and it opens with
       the picture's top at the top of the pane rather than its foot, where four graphs under a pen would
       be their bottom halves.
       So, in a phone-shaped context at both sizes the board above is measured at: the tallest paper figure
       (it has numbers in it), the paper's own blank grid and a made-up blank space, each opened on its box,
       its `Draw` touched as a finger touches it, and then
         the picture at least `PAD_FACE_FLOOR` wide, or the width the stylesheet gave it where that is less
         the ink layer exactly over the picture, to the pixel -- found by the same review's sweep: at the made-up
           grid's `44svh` cap its box stayed 300px wide round a 141px grid, so a mark made on its side was
           stored against the wrong box (`.qpad-art:has(> svg.qsurf)` in style.css)
         every tile of the pen's bar and the row under the card a 44px square -- nothing drawn smaller whole
         the picture's top inside the pane as it opens
         and the pane scrolled to its foot (the card scrolls when it does not fit): `Type` inside the pane,
           a press at its centre landing on it, and a real tap on it bringing the box back
       Proved by mutation: with the "glass" rule back, five of the six are under their floor; with the card
       opened at its foot again, four have the picture's top above the pane; without the box held to the
       capped grid, Q11c's ink is 152px off it at 568x320 and 128 at 844x390. */
```

### AND A TAP ON THE GAME FLAPS ON THE FINGER GOING DOWN, NOT ON IT COMING UP.

top level, before `at`

```
/* ==================================================================================================
       AND A TAP ON THE GAME FLAPS ON THE FINGER GOING DOWN, NOT ON IT COMING UP.

       REPORTED AS "when you tap theres like a slight delay" ON AN IPAD, and the delay was the
       binding: the flap hung off `click`, which fires on the RELEASE, so every flap this game has
       taken waited out the whole of a tap — the eighty to a hundred and fifty milliseconds between
       a finger landing and it lifting — before the bird moved.

       NOTHING ELSE IN THIS SUITE CAN SEE THAT, which is why the rule is here. `check/ui.js` asks
       whether a control can be read and hit, and a late control measures perfectly. The press pass
       above DISPATCHES at elements rather than touching them, so it never produces the gap. And the
       canvas carries no `data-do`, so it is not in that queue at all.

       THE QUESTION IS ASKED BETWEEN `touchStart` AND `touchEnd`, which is the one moment the two
       bindings differ — with `click` nothing has happened yet and with `pointerdown` the bird is
       already on its way up. Anything measured after the lift passes either way, which is exactly
       how a check that cannot fail gets written.

       AND THE LOOP IS STOPPED AFTERWARDS, by hand rather than by leaving the column: a
       `requestAnimationFrame` running behind the pages walked below would be sharing their frame
       budget, and that is what the widget's own `stop` exists for. */
```

### AND THAT PAGE n SHOWS QUESTION n, WHICH STOPPED BEING FREE.

top level, before `walk`

```
/* ==================================================================================================
       AND THAT PAGE n SHOWS QUESTION n, WHICH STOPPED BEING FREE.

       THE FIND SCREEN HOLDS FIFTEEN RESULT PAGES AND HAS THOUSANDS -- see `stuffWindow_` in find.js.
       So a page number and a DOM position are no longer the same number, and every reader of one
       goes through `domIndex_` / `logIndex_`. Nothing else in this suite can see that mapping: a
       card rendered in the wrong position measures perfectly, lays out perfectly, presses perfectly
       and is the wrong question.

       WALKED FORWARDS AND BACKWARDS, because the window slides both ways and recycles its elements
       by moving them from one end to the other -- an off-by-one in either direction shows up only
       when you arrive from the other side.

       ASSERTED ON THE ANSWER BOX'S KEY, `ans:...:q:<row_id>`, which is the one thing on a question
       card that names the row it was built from and cannot be confused with a heading: `Q6(i)` and
       `Q6(ii)` both start `Q6`. */
```

### ---------- A QUESTION WITH A PICTURE IS TWO PAGES NOW, its words and then its figure —

in `bad`

```
/* ---------- A QUESTION WITH A PICTURE IS TWO PAGES NOW, its words and then its figure —
             "across the board of all resources the diagrams should be its own widgets". So the walk
             is over `stuffPages_`, the app's own list, and each page is asked the right question: a
             question page carries its own answer key; a figure page names its row in `data-of`,
             carries NO answer box (the box stays with the words), and comes straight after its
             question.
             AND ITS ANSWER IS A PAGE TOO, after the figure where there is one -- *"answers ... to be
             their own widget"*. An answer page names its row, carries no answer box, and follows its
             own question or that question's figure; a question page carries no answer page inside
             it. Asked FIRST of an answer page, because it carries the answer box's key in `data-k`
             and would otherwise pass as its question. */
```

### ---------- AND A STEM AND ITS FIGURE IN FRONT OF THE PARTS, IN THE PAPER'S ORDER

in `look`

```
/* ---------- AND A STEM AND ITS FIGURE IN FRONT OF THE PARTS, IN THE PAPER'S ORDER --------
               *"preserve order of question from exam"*: a shared stem is its own page (`stemN`) and its
               figure the page after it (`sfigN`), both naming the STEM's row in `data-of`, both
               standing in front of the part they belong to -- a stem's figure straight after its
               words where it has words. And *"diagram widgets shouldn't have a question number on
               them"*: every figure page's header is asked for `Q<digit>` and must not have one. */
```

### `stemN-J` is a long stem's later page, and `preJ` a long part's first pages -- see `stemChunks_` and `partChunks_`.

in `look`

```
/* `stemN-J` is a long stem's later page, and `preJ` a long part's first pages -- see
               `stemChunks_` and `partChunks_`. A `pre` page names its own row and carries no box: the
               box is on the card, which the pre pages lead straight into. */
```

### WHICH QUESTION THE PAGE SAYS IT BELONGS TO:

in `look`

```
/* WHICH QUESTION THE PAGE SAYS IT BELONGS TO: its [Q<n>] tag, the item's own Question answer,
               which every page of one item wears alike since 18 Oct (`tagRow_`, docs/history/355) -- a
               figure page and an opening included, where they used to hold no number at all. */
```

### ---------- AND A FIGURE WHERE THE PAPER PRINTS IT

in `look`

```
/* ---------- AND A FIGURE WHERE THE PAPER PRINTS IT -------------------------------------------
               *"text, then diagram, then text then diagram then text ... same order but diagram has its
               own widget"*: a part's figure (`fig`) can stand in front of its card, between its pre
               pages, or after the card (`partPlan_`), and a stem's (`sfigN`) between its words. So a
               pre page leads into its own next page -- another pre, the figure, or the card -- and a
               figure page belongs to the question on one side of it or the other, never to nobody. */
```

### AN EARLIER PART'S DRAWING IN FRONT OF A PART THAT USES IT (`usesOf_`):

in `look`

```
/* AN EARLIER PART'S DRAWING IN FRONT OF A PART THAT USES IT (`usesOf_`): this part's page,
                 named by its row, a figure page with no box, wearing this part's number, and straight in front
                 of this part's own pages. */
```

### A DROPDOWN UNDER A FINGER IS THE PLATFORM'S OWN, AND A SWIPE THAT STARTS ON ONE MOVES THE COLUMN

top level, before `ctx`

```
/* ==================================================================================================
       A DROPDOWN UNDER A FINGER IS THE PLATFORM'S OWN, AND A SWIPE THAT STARTS ON ONE MOVES THE COLUMN

       FOR A WEEK THIS ASKED THE OPPOSITE. Every ordinary `<select>` was `pointer-events: none` and a tap
       near one opened the app's own panel (note 226), so this proved that no finger ever landed on a
       select and that nothing ever focused one. On 9 October the owner asked for *"a more stable
       standard simple conventional drop down list"* (note 315), and the questions a finger asks now are
       the platform's:

         · a tap on the box lands ON the select and gives it the focus — which is what an iPhone draws
           its wheel from and Android its sheet — and nothing of the app's own appears in the document;
         · a swipe that STARTS on a select moves the column, as it did while the panel stood — `axisFree`
           no longer names `select` — and the select it started on is neither focused nor clicked;
         · a 12px drag on a select's box is a swipe to the app, and the browser may still call it a tap:
           the `mousedown` that would open the list is cancelled (`FIELD_ACTS_` in shell.js), so the
           select is not focused and its press is not let through;
         · focus arriving by the keyboard's next arrow STAYS on the select — the panel blurred it;
         · with a sheet open over a select, one tap on the backdrop closes the sheet and reaches
           nothing behind it;
         · a tap on a booking row's WORD reaches its select — `Kind` is a `<label for>` it — the focus
           and the platform's list asked for (`showPicker`, recorded rather than drawn here). This is
           what "a tap 3px under the box" asked while the panel stood; deleted with the panel, and
           found missing by review: for a commit the word reached nothing;
         · a 12px drag that starts on the settings column's several-of-a-list field opens nothing, and
           a tap on it does — its `<summary>` acts on the click's default as a select's label does;
         · and EVERY select on every page of every column, on the page in front, is what a finger at
           its centre lands on, with `pointer-events` not `none`. The stylesheet and the scripts are
           read for this by `js/check-dropdowns.js`; this is the cascade itself, wrappers, inheritance
           and inline styles included, which nothing reading files can be sure of.

       NOTHING ELSE HERE CAN SEE ANY OF IT. `check-flow.js` runs in jsdom, which has no layout and no
       touch adjustment, and `js/check-dropdowns.js` reads the stylesheet rather than a finger. These are
       real touches through CDP on a phone-shaped page. What no headless browser can show is the
       platform's list itself — it is drawn outside the page — so "it opened" is asked as the two things
       that open it: a press that reached the select uncancelled, and the focus. */
```

### EVERY PRESS A SELECT RECEIVES, WHETHER IT WAS CANCELLED, AND EVERY TIME ONE TAKES FOCUS — even for a moment, because the end state cannot say whether a select

top level, before `window.__selHit`

```
/* EVERY PRESS A SELECT RECEIVES, WHETHER IT WAS CANCELLED, AND EVERY TIME ONE TAKES FOCUS — even
         for a moment, because the end state cannot say whether a select was focused on the way and
         let go again. Read in the bubble phase on `window`, after every listener of the app's own. */
```

### ---------- EVERY SELECT, ON EVERY PAGE THAT DRAWS ONE, IS WHAT A FINGER LANDS ON

top level, before `cols`

```
/* ---------- EVERY SELECT, ON EVERY PAGE THAT DRAWS ONE, IS WHAT A FINGER LANDS ON -------------------
         WALKED, NOT SAMPLED: each column the app has, each page of it that holds a select, put in front,
         and every select on that page asked two things of the real cascade — `pointer-events` (inherited,
         so a wrapper's rule or a column's inline style counts) and what `elementFromPoint` finds at its
         centre. A select scrolled out of its pane or under the screen's edge is counted as not measured,
         and a page with selects none of which could be measured is a failure to reach, not a pass. */
```

### EVERY PAGE, NOT ONLY THE ONES HOLDING A SELECT WHEN THE COLUMN IS DRAWN:

top level, before `pages`

```
/* EVERY PAGE, NOT ONLY THE ONES HOLDING A SELECT WHEN THE COLUMN IS DRAWN: a widget draws its
             controls when its page is started (the flyer maker, the cheat sheet), so a page with no select
             yet is not a page with none. */
```

### WHAT IS ON THE GLASS:

in `got`

```
/* WHAT IS ON THE GLASS: the window, cut by every box between the select and its screen
                   that clips — the pane, and a scroller inside the card (the flyer maker's controls
                   scroll in `.widget-squeeze`, and its last select sits under that box's foot until it
                   is scrolled to). A centre outside that is scrolled out of reach, not walled off. */
```

### ---------- THE BACKDROP HAS TO BE WHAT IS OVER THE SELECT

top level, before `under`

```
/* ---------- THE BACKDROP HAS TO BE WHAT IS OVER THE SELECT ---------------------------------
           THE CARD IN FRONT IS CENTRED (`columnShift_` in shell.js), so the favourite colour can sit
           under the sheet's BODY rather than its backdrop. So the select is the favourite colour when
           the backdrop is over it, and otherwise the first select on the page in front that the
           backdrop does cover — and none at all is a failure to reach, not a pass. */
```

### ---------- AND IF THIS PAGE'S SELECTS ARE ALL UNDER THE SHEET'S BODY, THE NEXT PAGE THAT HAS ONE

top level, before `others`

```
/* ---------- AND IF THIS PAGE'S SELECTS ARE ALL UNDER THE SHEET'S BODY, THE NEXT PAGE THAT HAS ONE ----------
           THE SHEET IS A CENTRED DIALOG, so which selects it leaves to the backdrop depends on how tall the card
           in front is. On 11 Oct the name went from About you to your own card's Edit (docs/history/339), the
           card came up two rows shorter, and all three of its selects sat under the sheet's body at 390x844 — the
           question was not reached, though nothing about a backdrop had changed. So the other Settings pages that
           hold a select are asked in turn, the sheet opened again on each, until one leaves a select to the
           backdrop; none on any page is still a failure to reach. */
```

### PRESSED BY SOMEBODY IS PRESSED.

top level, before `everPressed`

```
/* PRESSED BY SOMEBODY IS PRESSED. `do-signin` and `register` are on no screen an admin can be on
     and were the whole reason for the second visitor — reporting them as unreachable because the
     first pass could not find them would be reporting the answer as the question. */
```

### A QUIET PRESS FAILS, and that is the whole point of the list above.

top level

```
/* A QUIET PRESS FAILS, and that is the whole point of the list above. `ACCEPTED_TAP` in
     check/ui.js prints and does not fail, because a 20px hour cell is a real finding that cannot be
     repaired by changing a number; a control that does nothing CAN be repaired, and one that
     silently stopped working is the fault this file was written for. So every quiet press either
     carries a written reason or turns the run red. Proved by mutation: putting the old `paintBook_`
     back — the one that repainted a screen the booking column is not on — names `book-slot` and
     `book-set` here and exits 1. */
```

