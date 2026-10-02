## Stabilising it: the lab measured one axis, and the app is navigated on the other

**Asked for as "ok stabelise website. make it more scalable and make it more stable and so on. like
make navigation and all more stable. generally everything."** Too broad to guess at, so the first
move was to measure the navigation rather than read it: every screen's `paged` class against its
`PAGER` entry, its page count against the sections actually in the document, and every pane against
its own contents.

### Messages was the sixth column to lose its vertical axis, and this one was still live

**`screen('dm')` used `stack()` — one page holding every conversation — and `PAGER` had never heard
of the screen.** That is the same pair of facts the note over `PAGER.tools` records for the two
columns it already cost: no `paged` class, no vertical axis, and a `.pane` that is `overflow: hidden`
holding the lot.

**Measured at 390×844 with six conversations: 1,298px of content inside an 805px pane — 493px of
somebody's messages on the page, with no scroll and no page to turn to.** Two conversations short,
silently, on a phone. Screenshotted before and after.

| | lost it to | |
|---|---|---|
| `me`, `posts` | a rename the table did not follow | already recorded |
| `booking`, `reel` | no key at all | already recorded |
| `tools`, `games` | `stack()` | already recorded |
| **`dm`** | **`stack()` and no key** | **this one** |

**One conversation per page now**, which is what every other column is — and a conversation is
already a card with its own scroller and its own composer, which is exactly what a page holds.
`PAGE_HOME.dm` opens past the head card onto the newest thread, the same skip `account` makes past
its name card.

**`dmPages_` returns `{ name, html }` and both readers map the same array.** Deriving the header's
names from a second walk of `messageThreads_` would be the fault every entry in that table states —
*"a pager that counts for itself is a pager that can disagree with the screen it is a pager for"* —
which this column has now been on the wrong side of once.

**And the ask moved out of the builder, which is what makes the pager safe to call.** `dmCards_`
started a network request as a side effect of being called, so a pager calling it would have
triggered the fetch from a header and flashed "Nothing yet." before the reply landed. `dmAsk_` holds
that; `dmPages_` only reports. `DM_DONE` is the flag the skeleton actually depends on, because
`MESSAGES` staying null means both *waiting* and *asked and refused* and the second is a column that
never finishes loading.

**`PAGE` was missing `booking` and `dm`**, against its own sentence — *every screen that pages needs
an entry here or its position is not remembered between visits*. Both page. Both have one now.

### The lab had never asked about the axis the app is navigated on

**`check/ui.js` has measured sideways scroll since it was written and nothing else about geometry.**
That is the right first question — a box that scrolls sideways when it was not told it could is
always a fault — and it is the axis nobody travels. Every screen here is a vertical strip of pages.
**Six columns have now lost that axis one way or another, and the reason it kept recurring is that
nothing could see it.**

`OUT OF REACH` asks one question of every `.pane` on the screen: is there content below its own fold
that can neither be scrolled to nor paged to. **Every pane, not just the one in front** — a
sixteen-page column has sixteen panes in the document and each is a page somebody can turn to, which
is `check/cards.js`'s own lesson about a sample and a sweep on a second surface. A pane told it may
scroll is exempt, and so is a widget's own scroller inside one, because `.msg-body` and the notepad
have their own `clientHeight` and never push the pane's.

**And the same second question in pixels a viewer can see.** A transform is invisible to
`scrollHeight` exactly as it is to `scrollWidth`, so the lowest RENDERED child edge settles it —
without that the cheat sheet and the flyer would report hundreds of pixels that are on no screen,
which is the reading that cost this project two wrong fixes.

### The rule reported nothing, and putting the fault back did not fire it either

**Which is the whole reason there is a new state.** `dm · a conversation` seeds ONE thread —
deliberately, for what it measures — and one thread fits on a pane, so for as long as it was the
only seeded state this column could not have shown the fault it had. I wrote the rule, it found
nothing, I put the `stack()` back, and it still found nothing.

**A check that cannot fail is not a check**, and this file has deleted one for exactly that. What
was missing was never the rule; it was the state. `dm · an inbox` is six conversations — **six
because five fits**, measured at the tallest of the four widths, so it is the smallest inbox that
answers the question at every width rather than at 320 alone.

**Proved in both directions**: with the `stack()` back it names the column and the pixels — *".pane
holding card hides 941px below its own fold, at dm · an inbox@320 signed in"* — and exits 1; the
real file is green across 120 combinations.

### "A pane cannot overflow now" was an assertion, and it is what let this survive

**Two notes in `style.css` described a mechanism that had been deleted.** `.pane`'s own
`touch-action` comment said `pan-y` is *"given back only to a pane that has genuinely overflowed —
see `.pane.scrolls`, which script.js adds after measuring"*, and three thousand lines down the note
recording that class's removal says **"a pane cannot overflow now, so there is nothing to give
back."**

**That second sentence is measurably false** — it is the 493px above — and it is the reason nothing
was watching: a pane that cannot overflow needs nothing measuring it. An assertion about every
screen in the app, made from one screen. Both notes now say what is true and point at the check that
enforces it, which is the difference between a rule and a sentence.

**Measured after**: `dm` 7 pages and 7 sections with 0px hidden, 32 checks pass, and `check/ui.js`
reports nothing new across 120 combinations.

### Adding a column means editing five places, and nothing compared them

**`check-doors.js` asks whether a table key names a real screen. It could not ask the reverse** —
and the reverse is where every one of these faults has actually come from: `booking` and `reel` used
`pages()` with no `PAGER` entry, `tools` and `games` used `stack()`, `dm` did both.

**Five things have to agree about what a screen is** — `TABS`, `TAB_ORDER`, `PAGER`, `screen()`, and
a `<section id="s-…">` in index.html — and **every disagreement fails silently.** `paint` does
`$('s-' + id)?.classList`; `AXES.x.cells` does `.filter(Boolean)`, so a tab with no section drops
out of the sideways axis and the column is skipped; `PAGER[id]` undefined is just false; and
`TABS.sort` on `TAB_ORDER.indexOf` puts an unknown id at **−1, which is the front**. `TABS`'s own
note records the one that shipped: *"a column that swipes to a blank is worse than a column that is
not there."*

**Four questions now, and one realistic mutant fires three of them**: renaming `games` to `arcade`
in `TABS` alone is reported as a tab with no section, a tab nothing draws, and `TABS`/`TAB_ORDER`
naming different screens. The real file is clean.

**The fourth found something on its first run.** `screen('make')` builds with `pages()` and had no
`PAGER` entry. Nothing is wrong on screen — the camera column holds one card either way — **and that
is the reason to fix it rather than exempt it**: it is correct by accident of its contents, and the
day it holds a second card that card is unreachable, which is precisely how the other three lost
theirs. `makeCards_` is that one list; `PAGE` gained `make` by the same table's own rule.

**`stack()` needs no entry and is deliberately not asked about**, because it is one page by
construction. Whether a stack holds more than fits is a question about pixels, and `check/ui.js`
asks it as OUT OF REACH.

### The file list had drifted again, to three files this time

**`check-doors.js` kept its own `ORDER` array of the files to read, and the note above it records
the first drift**: *"`select`, `collections` AND `tiles` WERE MISSING … `tiles.js` is where every
card action in the app is built, which made all of them invisible to this audit."*

**It had happened again.** index.html loads **26** files; `ORDER` listed **23**. `library.js`,
`settings.js` and `terms.js` were outside the audit — every `on()`, every `data-do` and every `go()`
in them — and `terms.js` alone has two handlers and both their doors. So the summary line has been
understating what it looked at, and any door added in those files was unwatched.

**The fix is the one `check.js` already makes**: read the list off `window.FILES` in index.html,
which is the list the browser itself uses, in load order. A list kept by hand beside another list
kept by hand is this repository's oldest shape, and the answer every time has been to delete one of
them. **Measured after: 119 handlers and 117 doors, against 23 files' worth before.**

### What the navigation stress found, which is the other half of trusting it

Measured before changing anything and again after: every tab switched to twenty times with no
settling, every screen paged past both ends, the viewport resized across all four widths on every
screen, and thirty `go`/`repaint`/`paint` storms.

| | |
|---|---|
| JS errors | **none** |
| page position clamped at both ends, all nine screens | **correct everywhere** |
| screens reporting "this screen did not draw" | **0** |
| nodes in the document | 1,507 → 1,684 → **1,526** — no accumulation |
| all nine screens still placed and the app usable | **yes** |

**The core is sound and that is worth writing down rather than quietly not mentioning.** What was
broken was never the movement; it was which screens had been told they could move.

### What happens when things fail, measured across seven ways of failing

**Every claim this file makes about resilience was checked rather than trusted**, by breaking each
request in turn and asking the rendered page four questions: did the screens draw, did the splash
lift, is there a banner saying why, and can you still navigate.

| what was broken | screens drawn | splash | says why | navigates |
|---|---|---|---|---|
| nothing | 9/9 | lifted | — | yes |
| the backend answers 500 | 9/9 | lifted | yes, + Try again | yes |
| the backend answers a web page | 9/9 | lifted | yes, + Try again | yes |
| `data/questions.json` 404s | 9/9 | lifted | *"the question file answered 404"* | yes |
| every `data/settings/*.json` 404s | 9/9 | lifted | — (correctly: the payload still has them) | yes |
| the backend AND the library fail | 9/9 | lifted | yes, + Try again | yes |
| **the backend never answers** | 8/9 | **lifted at 60s** | yes, + Try again | yes |

**No JS errors in any of the seven, no screen failed to draw, and the app was navigable in every
one.** That last row is the deadline in `load()` doing exactly what its note says, confirmed rather
than assumed — and it is the one that needed the stopwatch, because a first pass that waited four
seconds reported it as a permanent hang and would have been a fix aimed at nothing.

### A minute of splash with nothing said, which was the one honest gap

**The deadline is sixty seconds and it should be.** Its note explains why it is not less: this
backend answers in about fifteen, and a deadline shorter than the thing it times reports a healthy
backend as a dead one — *"that happened, at twelve seconds, and cost an afternoon."*

**So the floor on "how long can this legitimately take" is a minute, and for all of it the animation
played over an app that was getting no answer.** Nothing on screen could tell *still trying* from
*stuck*. Every other failure here ends with a sentence and a Try again; this one was silence.

**Fifteen seconds, from the same measured number the deadline is built on** — past the backend's own
normal time, so an ordinary load never sees it and a slow one says so. One figure, derived from the
one already written down rather than guessed at separately, which is the fault this file records
every time a number is stated twice.

**It is in the markup rather than built**, for the reason the two splashes are: the boot path is
where this app once took itself down, and anything there that has to be constructed is one more
thing that can be missing. **It is cleared wherever the splash is**, because the two are one state —
a line about loading over a loaded app is worse than the silence it replaces — and it only starts
its clock when the splash is actually up, because `load()` runs again on every retry and every
sign-in.

**Proved in both directions**: a normal load never shows it (the splash is gone by 3s), a stalled
one shows it at 17s and not at 14s. Screenshotted.
