# js/check-css.js

The full text of comments in `js/check-css.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-css.js WHAT A COMPILER WOULD HAVE DONE FOR THE STYLESHEET.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-css.js

   WHAT A COMPILER WOULD HAVE DONE FOR THE STYLESHEET. `check.js` reads the JavaScript and has
   caught real faults; nothing has ever read style.css, and that is where most of the damage has
   come from — because a wrong CSS rule does not throw, does not log, and does not fail. It simply
   loses to another rule, or does something different from what its comment says, and the app looks
   subtly broken in a way nobody can connect to an edit.

   Every check here is a fault that has actually happened in this file:

     DECLARED TWICE      `border` and `box-shadow` were each written twice in `.pane`, four lines
                         apart. The second won. The first pair was dead text that read as though it
                         were doing something, and it took a screenshot to notice.

     SAME SELECTOR TWICE two `.page > .pane:has(.widget-full)` blocks setting `min-height` to 12rem
                         and 13rem. Whichever came last won, silently.

     ORDER FAULT         `#top { display: none }` was written ABOVE `#top { display: flex }`, so the
                         header stayed on screen. Same specificity, later rule wins — which is
                         obvious once you know and invisible when you are reading a 2,000 line file.

     CONTRADICTION       `contain: paint` on an element asking for `overflow: visible`. Paint
                         containment clips regardless, so the column was cut off at the fold. Both
                         declarations looked right on their own.

     DEAD SELECTOR       a class no JavaScript or HTML ever produces. `arrive()` cost four rounds
                         because `from-left` and `from-right` had no rules at all — the reverse of
                         this, and the same lesson: code and stylesheet drifting apart in silence.

     node check-css.js
================================================================================================== */
```

### ---------- THE COMMENTS ARE NOT THE APP, AND THIS FILE IS 64% COMMENTS

top level, before `decomment_`

```
/* ---------- THE COMMENTS ARE NOT THE APP, AND THIS FILE IS 64% COMMENTS --------------------------
   THE TEST IS "does this name appear anywhere in the code at all", because class names are built
   inside template strings and no parse of the markup would be honest. That is right, and it was
   searching the PROSE as well as the code.

   IN THIS CODEBASE THAT IS NOT A SMALL LEAK. CLAUDE.md's own figure is 64% comments, and the house
   style is that a comment says what went wrong before — so every class this project has ever
   deleted is named in the paragraph explaining why it was deleted. `.post-act` was removed from the
   markup and named four times in the notes about removing it, and stayed off the dead list on the
   strength of its own obituary. The rules it left behind would have sat in the stylesheet for ever,
   invisible to the one check that exists to find them.

   SO THE COMMENTS COME OUT FIRST. Block and line comments both, replaced by their own newlines so
   nothing that reports a line number moves. A name that survives is a name the browser could
   actually see. */
```

### ---------- IS IT EVEN A STYLESHEET

top level, before `bracesBalance`

```
/* ---------- IS IT EVEN A STYLESHEET ---------------------------------------------------------------
   EVERY OTHER CHECK IN THIS FILE READS DECLARATIONS. That is the right shape for asking whether a
   rule does what it says — and it means the file can be structurally broken and every check still
   passes, because a stray `}` is not a declaration.

   IT HAPPENED TWICE. A regex deleting `@keyframes X { … }` used `[^}]*`, which stops at the first
   closing brace — the end of the first STOP, not of the block — so the header and one stop went and
   four stops and a `}` stayed. A browser discards from an error to the next brace it can resync on,
   which can silently take the rules AFTER the orphan with it. So the damage is never confined to
   the thing that was broken, and nothing on screen points at it.

   COUNTING BRACES IS THE WHOLE CHECK. Comments are blanked first, keeping newlines, because a `}`
   inside a comment is not a brace — I wrote this counter without that and it reported a fault in a
   paragraph of prose. */
```

### COMMENTS BLANKED, NOT DELETED — each one replaced by the same number of newlines it occupied.

top level, before `bare`

```
/* COMMENTS BLANKED, NOT DELETED — each one replaced by the same number of newlines it occupied.

   Removing them outright shifts every line after the first comment, and this file is more comment
   than rule — so a fault reported at "line 1929" was somewhere around line 3400 in the actual
   stylesheet. A line number that does not point at the thing is worse than none: it sends somebody
   to a rule that is fine and teaches them the report cannot be trusted. */
```

### A hand-rolled reader rather than a parser from npm:

in `readRules_`

```
/* A hand-rolled reader rather than a parser from npm: it has to run with nothing installed, and
     the shapes it must understand are the ones this file actually uses. Nested at-rules are read as
     a block whose inner rules are read too. */
```

### AT THE SELECTOR'S FIRST CHARACTER, not at `m.index`:

in `readRules_`

```
/* AT THE SELECTOR'S FIRST CHARACTER, not at `m.index`: `[^{}]+` starts straight after the last
       `}`, so it carries every blanked comment line between the two rules, and a rule under a twenty-
       line comment was reported twenty lines above itself -- at the rule before it. Found by the tile
       check below sending the reader to `.qpad-aid` for a fault in `.tile.is-lead`. */
```

### IS THIS RULE CONDITIONAL?

in `readRules_`

```
/* IS THIS RULE CONDITIONAL? A rule inside `@media` or `@supports` does not simply override the
       one above it — it applies on some screens or in some browsers and not others, so calling it
       an override would be wrong and would train somebody to ignore this report.
       Found by counting braces backwards to see whether an at-block is still open. */
```

### A COMMA IS LEFT ALONE, and that is a decision rather than an oversight.

in `readRules_`

```
/* A COMMA IS LEFT ALONE, and that is a decision rather than an oversight.

       Splitting `#a, #b { display: none }` into two rules seemed obviously right — it is how the
       browser reads it, and not splitting is how two loading splashes came to be drawn at once: a
       group hid all five and one of them was given a display of its own further down.

       But splitting it reported eight faults and six were the same ordinary idiom: a group sets a
       default and one rule refines it. `.a, .b { opacity: 0 } .b { opacity: 1 }` is how anybody
       writes "these start hidden, this one does not", and calling it an override is calling normal
       CSS a bug. A report that is mostly wrong is a report nobody reads, and the two real faults in
       it would have been lost among the six.

       So this check compares rules with the SAME selector, where a disagreement is unambiguous —
       and the group-versus-member case, which is not mechanically distinguishable from correct
       code, is caught by naming the actual invariant instead. See the splash check at the foot of
       this file. */
```

### ---------- A LIST TO LOOK AT IS NOT A BROKEN BUILD

top level, before `noted`

```
/* ---------- A LIST TO LOOK AT IS NOT A BROKEN BUILD ----------------------------------------------
   EVERY SECTION USED TO FAIL, AND ONE OF THEM CANNOT KNOW IT IS RIGHT. "Classes styled but never
   produced" says so in its own title — a name may be built in pieces, `'rc-' + kind`, so the check
   cannot tell a dead rule from one whose writer it cannot see. It had 28 entries, so check-css was
   permanently red, and that is not a check with a finding in it: it is a check people stop opening.

   What it took down with it matters more than the 28. The sections that ARE conclusive — a dead
   declaration, a silent override, a contradiction, a splash that never names the app — were all at
   zero, and nobody could see that past the red. check-all.js already draws this line for check-dead
   and check-doors; drawing it inside this file rather than on the whole check keeps the conclusive
   half hard. */
```

### ---------- PLAIN CONTAINMENT HID EVERY CLASS WHOSE NAME IS A PREFIX OF A LIVE ONE

top level, before `builtPrefix`

```
/* ---------- PLAIN CONTAINMENT HID EVERY CLASS WHOSE NAME IS A PREFIX OF A LIVE ONE ----------------
   IT WAS `code.includes(c)`, and the note defending it was right about what it was defending
   against: a class name is very often built with a placeholder stuck to it —
   `class="widget-full${wgt.solid ? ' solid' : ''}"` — and a rule about what may follow the name
   calls a live class dead. Eleven were reported that way once, and a report that is mostly wrong is
   a report nobody reads.

   WHAT IT ALSO DID was answer yes for `post-act` because the file contains `post-acts`. Any name
   that is a prefix of another name in this stylesheet is unreportable: `.post-act`, `.tile` against
   `.tile-row`, `.bk` against `.bk-row`. The check could not have found them in any state of the
   codebase, which is worse than a false negative — it is a blind spot with no edge.

   SO: THE NAME, NOT FOLLOWED BY MORE NAME. `(?![\w-])` rejects `post-acts` and accepts every case
   the old note defends, because what follows a built name is `$`, a quote or a space — none of
   which is a name character. The one it still cannot see is a name assembled from pieces,
   `'is-' + kind`, which is why the heading says to check before deleting. A list to look at. */
```

### ---------- AND THE ONE CASE THE HEADING HAS ALWAYS WARNED ABOUT, NOW ACTUALLY FOUND

top level, before `builtPrefix`

```
/* ---------- AND THE ONE CASE THE HEADING HAS ALWAYS WARNED ABOUT, NOW ACTUALLY FOUND -------------
   "A name may be built in pieces" is in the title of this section, and until now that was all it
   was: a caveat asking the reader to be careful, with no way to tell WHICH of the entries it
   applied to. `is-buy` sat in the list looking exactly as dead as `post-ok`, and it is written by
   `tile_` as `'is-' + o.tone` with `tone: 'buy'` in half a dozen callers. Deleting it would have
   taken the gold off every affirmative tile in the app, and the list would have been right about
   the twenty entries either side of it.

   THE ASSEMBLY IS VISIBLE IN THE SOURCE. A name built in pieces is a string literal followed by a
   `+`, so every such literal that is a PREFIX of a class name makes that class unprovable — `'is-'`
   covers `is-buy`, `is-admin`, `is-tutor`; `'rc-'` covered `rc-receipt` before that stopped being
   built at all. Found rather than assumed, and named in the report so the reader knows which of the
   two lists they are looking at.

   IT STAYS A LIST TO LOOK AT. A name assembled the other way round — `kind + '-row'` — is still
   invisible, and so is one built from a variable with no literal at all. What changed is that the
   entries this check CAN be sure about are no longer mixed in with the ones it cannot. */
```

### THE LEADING SPACE IS PART OF THE LITERAL.

top level, before `m`

```
/* THE LEADING SPACE IS PART OF THE LITERAL. `tile_` writes ` ' is-' + o.tone` — a space, because
     the name is being appended to a class list — so a pattern anchored to a letter right after the
     quote missed every one of them, which is how `is-buy` reached the provably-dead list. */
```

### ---------- 6. THE LOADING SCREEN DRAWS ONLY WHAT THE BOOKS TEACH

top level, before `splashBad`

```
/* ---------- 6. THE LOADING SCREEN DRAWS ONLY WHAT THE BOOKS TEACH ----------------------------------
   "delete all animations for loading which dont come from text books or arnt educational." — the
   owner, 10 Oct. Thirteen inline splashes went that day — the tag, the readout, the torch, the tube,
   the columns, the blocks, the ring and six calm ones (docs/history/322) — and the splash draws one of
   the textbooks' animations from the copy the device kept, or, with nothing kept, the still name and
   the app's one loader. Every way an inline splash could come back is silent, so each is named:
     · IN THE MARKUP. `#splash` holds the picker and a closed list of its own parts — the still name
       and its loader, the line said out loud, the slow line. Any other `splash-` id in index.html is
       a splash drawn by the page, which is what went.
     · IN THE PICKER. Its pool is the books' kept copy and nothing else. A `kinds` list again, or a
       class it sets other than `is-an` (a book's drawing) and `is-still` (nothing kept), or one built
       from what it picked (`'is-' + pick`, which is how an inline splash used to be chosen), is the
       inline pool back.
     · IN THE STYLESHEET. Every `#splash-` id a rule names is one of the parts and every `#splash.is-`
       state is one of the two: a rule for `is-tide` is a rule for a splash that is gone, and the day
       somebody puts it back it is a splash the sheet cannot retire.
     · IN THE SHEET. data/settings/splashes.json is the owner's switch for each animation. A row of any
       kind but proof or tool names a splash that does not exist — a switch wired to nothing.
   AND THE STILL ONE HAS NO OPINION OF ITS OWN ABOUT WHETHER IT IS SHOWN. This section began as that
   rule: `#splash-torch` set `display: grid` in its own rule, below the one that hid every splash, won
   by being later, and two loading screens were drawn at once. So the only rules that say how
   `#splash-still` is displayed are `#splash-still { display: none }` and `#splash.is-still
   #splash-still` — else the still name is drawn over a book's animation. And the markup's own class is
   `is-still`, so a browser that runs no script is shown the name and the loader too. */
```

### ---------- AND THE PICKER IS THE FIRST THING INSIDE IT

top level, before `at`

```
/* ---------- AND THE PICKER IS THE FIRST THING INSIDE IT ---------------------------------------
     IT RAN AFTER EVERY SPLASH'S MARKUP, in the script below the splash, so a thousand lines of markup
     were parsed under the no-script default before the class was chosen — and a browser may paint in
     between. First in `#splash`, the element exists and nothing paintable has been parsed. Read off
     the file, comments out: the first element after `<div id="splash"` must be the picker. */
```

### ---------- AND NOTHING ELSE IN IT: WHAT `#splash` HOLDS IS A CLOSED LIST, NOT JUST ITS IDS

top level, before `VOID`

```
/* ---------- AND NOTHING ELSE IN IT: WHAT `#splash` HOLDS IS A CLOSED LIST, NOT JUST ITS IDS ---------
     THE RULE ABOVE CLOSED THE `splash-` IDS, and an inline splash does not need one. A decoration put
     in `#splash` with a class and no id — `<svg class="tg-art">`, animated by `#splash.is-still
     .tg-art` and hidden by `#splash.is-an .tg-art` — passed every check in the suite while it moved on
     every first visit beside the loader: the very thing the owner asked to go, back under a name
     nothing was looking for. So the splash's own children are held to the list of its parts, by
     element and id, with no bare text between them; the still one's to the name and the loader, and
     the name to its words. Read off the file with comments out and the picker's body blanked (it
     writes markup in strings), counting depth, so a child's own insides are its business.
     AND THE STYLESHEET MAY NOT DRAW ONE WITHOUT MARKUP. `#splash.is-still::before { content: '';
     animation: … }` is an inline splash in two lines of CSS and no element at all, so a rule that
     reaches into the loading screen — `#splash`, its parts, the name — gives nothing `content` and
     runs no `animation`. The loader moves by its own block, which names none of them; a book's
     drawing moves by its row's CSS, which is not in style.css. */
```

### ---------- 7. EVERYTHING TAPPABLE MUST LOOK TAPPABLE

top level, before `tapBad`

```
/* ---------- 7. EVERYTHING TAPPABLE MUST LOOK TAPPABLE --------------------------------------------
   `[data-do]` is what makes a thing respond to a press in this app — one delegated listener reads
   that attribute and nothing else. So the rule that gives every one of them a visible signal is
   load-bearing: without it a card, a row and a paragraph look identical and only one of them does
   anything.

   It is one rule and it is easy to lose — to a refactor, to a tidy-up, to somebody deciding a bare
   attribute selector looks untidy. This says so if it goes. */
```

### THIS USED TO REQUIRE `[data-do]:active` — a press state on everything — and that was the wrong thing to check for.

top level, before `hollow`

```
/* THIS USED TO REQUIRE `[data-do]:active` — a press state on everything — and that was the wrong
     thing to check for. An affordance you only see once you have pressed is not an affordance: it
     answers the question after it has been asked. What tells somebody a thing can be pressed is
     what it looks like SITTING STILL.
     So the check is for the standing signals instead: the chevron on the block-shaped ones and the
     dotted underline on the ones inside a line of text. Losing either is losing the answer. */
```

### ---------- 7. A RULE THAT SAYS NOTHING

top level, before `hollow`

```
/* ---------- 7. A RULE THAT SAYS NOTHING --------------------------------------------------------
   An empty ruleset does nothing at all, which is exactly why it should not be left in: it reads as
   a rule somebody started and meant to come back to, and the next person either fills it in or
   spends a minute working out whether it matters. Every editor flags them, so leaving one is also
   leaving a warning that trains you to ignore warnings.
   This one turned up where a duplicate rule had been emptied instead of deleted. */
```

### ---------- 7b. A TILE'S COLOUR WRITTEN OUT BY HAND

top level, before `handTone`

```
/* ---------- 7b. A TILE'S COLOUR WRITTEN OUT BY HAND -------------------------------------------------
   `.tile.is-lead` -- the pen's lock, gold because arming is the first step -- was copied from
   `.tile.is-admin` and only its `color` changed. Its border kept `rgb(242 210 75 / .35)`, which is
   `--admin` (#f2d24b, "only you can see this") thinned, so a gold padlock sat in an admin-yellow frame
   on a tile every student sees. Nothing read it, because a literal cannot say which token it meant:
   two yellows a few steps apart look like one decision in the source and two on the screen.

   SO A `.tile` RULE MAY NOT SPELL OUT A `:root` TOKEN'S COLOUR, as a hex or as `rgb()` at any alpha;
   `color-mix(in srgb, var(--admin) 22%, transparent)` paints the same thing and names it. SCOPED TO
   TILES, and that is the reach of the fault rather than a reluctance: one renderer draws every action
   in the app, so a tile's tone is the one look that is copied most and checked least. The rest of the
   stylesheet holds ~100 such literals (the paper's cream thinned over the black, mostly), each in its
   own component, listed by nobody -- a wider version of this is worth having and is not this fix.
   White and black washes are not tokens and pass: `rgb(255 255 255 / .08)` is a press, not a colour.
   The tokens are read off `:root` itself, so a token added tomorrow is covered tomorrow. */
```

### ---------- AND A WASH WITH A NAME IS A TOKEN TOO

top level, before `rgbKey`

```
/* ---------- AND A WASH WITH A NAME IS A TOKEN TOO --------------------------------------------------
     THE RULE ABOVE READ HEX TOKENS ONLY, and lets every black and white wash through on the argument
     that `rgb(255 255 255 / .08)` is a press, not a colour. True of an anonymous wash; not of one
     `:root` NAMES. `--over-wash` and `--over-edge` are the charcoal and the hairline a control wears
     over a moving picture — one colour in three components, named because the third hand-written copy
     is what review caught (note 319) — and the reels' Sound tile became the fourth wearer on 10 Oct
     (`.tile.is-over`, note 323). Written out in a `.tile` rule it paints the same today and drifts the
     day the wash is retuned, which is the `.tile.is-lead` fault in a different spelling.
     SO A `.tile` DECLARATION MAY NOT SPELL OUT AN rgb()-VALUED `:root` TOKEN — the SAME channels and
     the SAME alpha, which is what makes it that token rather than a wash of its own. An opaque pure
     black or white is still not a token, by the argument above. Read off `:root`, so a wash named
     tomorrow is covered tomorrow. */
```

### ---------- 7c. THE PICTURES' COLOURS ARE THE PICTURES' OWN

top level, before `pfpTone`

```
/* ---------- 7c. THE PICTURES' COLOURS ARE THE PICTURES' OWN ------------------------------------------
   THE OWNER, 10 Oct: *"everybody profile picture selector should have 10 basic profile pics like xbox
   dp selector, which allow you to use your avatar as a dp."* The ten drawings (`PFP_ART` in
   js/links.js) and the figure's round ground (`AV_BUST_GROUND`) carry colours that belong to those
   drawings and to nothing else — CLAUDE.md: a colour that belongs to ONE component is defined on that
   component, never offered to the whole stylesheet. So two ways to break it, both read here:
     · A `--pfp-…` TOKEN ON `:root` — the fox's orange offered to every rule in the app.
     · A `:root` TOKEN'S HEX SPELLED OUT IN A DRAWING — a paper cream, the gold, the ink. A picture
       painted in the app's own colours stops being its own the day the palette moves (the `#f4f1e8`
       find-and-replace across seventy declarations is what the paper tokens cost), and a picture in
       PAPER cream would be the second paper CLAUDE.md forbids.
   READ FROM THE FILE, and a file with no drawings in it is a failure rather than a pass: a check that
   cannot find its subject must not be green. */
```

### FIRST, because everything below it reads a file it assumes is well formed.

top level, before `bal`

```
/* FIRST, because everything below it reads a file it assumes is well formed. A stylesheet with a
   stray brace is not a stylesheet with a fault in it; it is a stylesheet whose later rules the
   browser may have thrown away, and no amount of checking declarations will say so. */
```

### ---------- ONE ID, ONE ELEMENT

top level, before `html`

```
/* ---------- ONE ID, ONE ELEMENT ---------------------------------------------------------------
   `splash-line` WAS TWO THINGS: the outline text that gets written on inside the tag splash, and
   the whole number-line splash. Every rule for either landed on both — so the tag's stroked, dashed
   `tag-write` animation was painting the number line, and the hide-by-default rule could take the
   outline out of the wordmark. On a phone it showed as text from one splash appearing over another.

   NOTHING CAUGHT IT. `check-doors` matches handlers to `data-do`, `check-css` reads declarations,
   and a duplicate id is legal HTML that no browser complains about — `getElementById` simply
   returns the first and everything downstream is quietly wrong.

   The whole page is swept, not just the splashes: an id is a promise of uniqueness and this is the
   only place that checks it. */
```

### ---------- 8. A LOADING SCREEN THAT DOES NOT SAY WHOSE APP IT IS

top level, before `html`

```
/* ---------- 8. A LOADING SCREEN THAT DOES NOT SAY WHOSE APP IT IS --------------------------------
   The Pythagoras one shipped without the name on it — a lovely thing to look at that did not tell
   anybody whose app they had opened. It was noticed because somebody watched it, which is the wrong
   way to find out.
   TWO KINDS OF LOADING SCREEN ARE LEFT, AND BOTH MUST SAY IT. The still one, which a first visit gets,
   says it in its own markup; a book's drawing carries no name — a chapter page has its book's — so the
   picker signs it as it draws it. Read off the file with comments out, and as the words read on the
   screen, tags out: "@family." split across elements is still the name on the glass. */
```

### ---------- 9. A SPLASH BUILT AS ONE SEAMLESS LOOP STAYS ONE

top level, before `animRow`

```
/* ---------- 9. A SPLASH BUILT AS ONE SEAMLESS LOOP STAYS ONE ---------------------------------------
   THREE SPLASHES WERE REBUILT TOGETHER — the coin, the sieve and the blocks — and each had failed in
   one of the same three ways:
     A ONE-SHOT WITH A GLOW AFTER IT. The sieve struck its numbers once in 1.2s and then pulsed; the
     blocks bumped once and then hovered. Because the glow was `infinite`, index.html's replay loop
     ("IF ANYTHING HERE LOOPS, NOTHING IS TOUCHED") never ran the story again, so a slow load showed
     the ending and a shimmer for the rest of its life.
     A PROPERTY THE COMPOSITOR CANNOT RUN. The sieve's strike grew `width` and faded `color`; the
     blocks' hover animated `box-shadow` and the coin spun by animating `width`. docs/history 055
     measured that this did not stutter, and that is not a licence: transform and opacity are the
     only two that cannot.
     A STILL THAT WAS NOT THE ANSWER. Each has a reduced-motion rule, and it must stay.
   So a splash named here must: animate only `transform` and `opacity`; give every animation
   `infinite` (one cycle that ends where it began, rather than a story and an encore); and have a
   reduced-motion rule that switches its animations off. Then each states the one thing about it
   that was wrong and is easy to undo — those are below, with what they guard against.

   A REGISTRY RATHER THAN EVERY SPLASH, because 23 of the 39 still animate something else and most
   of them are fine (055 again). A splash joins this list when it is rebuilt as a loop. */
```

### ALL FOUR ARE IN THE TEXTBOOKS — the coin, the sieve, Bayes and How many fit?

top level, before `animRow`

```
/* ALL FOUR ARE IN THE TEXTBOOKS — the coin, the sieve, Bayes and How many fit? are rows of data/textbooks.json,
     read through check-anims.js's one reader, and a row's own CSS is its rules. The blocks were the
     fourth and the last one in index.html; they taught nothing and went on 10 Oct with the other
     inline splashes (docs/history/322), so there is no markup left here to cut a splash out of. */
```

### KEYFRAMES BY NAME, read off the comment-blanked text so a keyframe described in prose is not a keyframe.

top level, before `frames`

```
/* KEYFRAMES BY NAME, read off the comment-blanked text so a keyframe described in prose is not a
     keyframe. Brace-matched, because a regex to the first `}` stops at the end of the first stop —
     the fault the brace check at the top of this file was written for. */
```

### THE COIN'S FACES ARE ONE METAL, AND IT HAS AN EDGE.

in `LOOPED`

```
/* THE COIN'S FACES ARE ONE METAL, AND IT HAS AN EDGE. It was gold one side and mint the other
       — a counter, not a coin — and paper-thin edge-on. The look lives in `.cn-coin b`, so a face
       rule that sets its own background or colour is the mint side coming back; and the thickness
       is the stack of discs inside the coin, so fewer than four is a coin that vanishes when it
       turns. */
```

### THE SIEVE IS A SIEVE.

in `LOOPED`

```
/* THE SIEVE IS A SIEVE. tools/sieve.py writes it, and the markup is the only place the maths
       lives: every composite struck in the colour of its SMALLEST prime factor (that is the prime
       that removes it), every prime ringed and never struck, nothing struck by a prime above 3
       (5 × 5 = 25 is past 17, which is why it stops), and the second, lower line only on a number
       a later prime also divides. A hand edit that moved one strike would still animate perfectly
       and teach the wrong thing. And the row stays ONE line: `nowrap` on the run. */
```

### BAYES IS RIGHT, RECOMPUTED FROM THE DOTS.

in `LOOPED`

```
/* BAYES IS RIGHT, RECOMPUTED FROM THE DOTS. tools/bayes.py writes a hundred people, each in one
       of the four cells of the table — by-tp, by-fn, by-fp, by-tn — with a gold circle if they have
       it and a ring if the test says so. A hand edit that moved one ring would still animate
       perfectly and teach the wrong posterior, which is the one thing this splash exists to get
       right. So the counts are taken from the circles, not the classes, and every number written on
       the screen — the five captions and the sum — must be the number the dots make. And the
       regrouping must BE the answer: every positive carried to its own place, the true ones on one
       row and the false on another, so the two rows' lengths are TP and FP. */
```

### HOW MANY FIT IS RIGHT, READ BACK FROM ITS OWN WORDS — and the owner's example is the still.

in `LOOPED`

```
/* HOW MANY FIT IS RIGHT, READ BACK FROM ITS OWN WORDS — and the owner's example is the still. BUILT
       TO THIS STANDARD AND HELD TO IT HERE (docs/history/349): transform and opacity, one clock, every
       animation infinite, as the three above. tools/fit.py writes four examples, each a question ("How
       many 3s fit into 4?"), a gold count over every whole copy, the end of the bar, a sentence and a
       sum. A number changed in one place and not the others would still animate perfectly and teach a
       ten-year-old a wrong sum, so each example is read back and must be ONE division, done right: the
       question, the bar's last number, the sentence and the sum name the same two numbers; the sum is
       right; the sentence says its answer in words; and the count runs 1, 2, 3 ... to the sum's whole
       part. And the FIRST example is 4 ÷ 3 — "how many 3s fit into 4" is the sentence it was asked for
       with, and the first example is the one reduced motion shows. */
```

### AN INLINE `animation-name` BEATS THE REDUCED-MOTION RULE.

top level, before `s`

```
/* AN INLINE `animation-name` BEATS THE REDUCED-MOTION RULE. tools/coin.py wrote one on each of
       twenty elements, and `animation: none` in the stylesheet lost to every one of them — so with
       less movement asked for, the coin stood still and the tally and the count went on animating.
       The generators now write `--kf: name` and a rule reads `animation-name: var(--kf)`. */
```

### ---------- A FIGURE'S INK THAT A MADE-UP SURFACE ON THE CARD DOES NOT GET

top level, before `INK`

```
/* ---------- A FIGURE'S INK THAT A MADE-UP SURFACE ON THE CARD DOES NOT GET ------------------------------
   A QUESTION ANSWERED BY DRAWING IS DRAWN ON ITS CARD (docs/history/356): the paper's own figure under the
   pen INSIDE `.qsheet`, among the words, and a made-up surface (squared paper, axes, a blank space) where
   the box would be, in `.qp-area`, OUTSIDE the sheet (`ansArea_`). A figure is inked by classes (`.lbl`,
   `.num`, `.grid`...) whose rules were written as `.qsheet .lbl`, and 327's first screenshot of a made-up
   grid on the card was an empty card: three of those rules had no way to reach it. So a rule that names
   the sheet and not the answer area is a surface drawn with its numbers in the pen note's coding font and
   its grid unstroked -- which nothing else here can see, because the markup is right and the rule is
   right, only not for that container. Every rule that inks a figure inside `.qsheet` must name `.qp-area`
   too. Read off the selectors, comments out. */
```

### ---------- NO TAG IS STYLED AS A KIND OF ITS OWN (docs/history/355)

top level, before `tagBad`

```
/* ---------- NO TAG IS STYLED AS A KIND OF ITS OWN (docs/history/355) -------------------------------------
   The owner, 18 Oct, over a Q7 card whose `Question` was a filled white pill: *"I'm sensing some tags are
   treated differently from others ... Please eliminate all unique conditional rules which treat them
   differently."* Every tag is now a facet answer drawn by one renderer (`tagRow_`), in its facet's colour
   and the one outline. So no rule may give the page's kind, its number or its marks a look of their own
   (`[data-tag=kind|number|marks]`, `--tag-kind` and its two siblings), and the pills that sat in the card
   heads beside the tags (`.fc-flag`, `.fc-flags`) and the bundle's gold head (`.qcard-top`) are gone. */
```

