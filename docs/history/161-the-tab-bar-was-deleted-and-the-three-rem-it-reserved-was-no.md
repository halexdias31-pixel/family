## The tab bar was deleted and the three rem it reserved was not

**Reported as "sometimes when trying to swipe up on phone it scrolls on the whole page like do you
know what I mean? It feels clunky. Also won't let me swipe up on posts on my iPhone."** Measured at
six phone sizes before anything was touched, and the two sentences have one cause.

| | document height | viewport | can the whole page scroll |
|---|---|---|---|
| **320x568** | **609px** | 568 | **by 41px** |
| **360x640** | **681px** | 640 | **by 41px** |
| 375x667 | 667 | 667 | no |
| 390x844, 414x736, 430x932 | = viewport | | no |

**`#screen` IS `100dvh` MINUS FOUR VARIABLES AND `body` PADS BY EXACTLY THE SAME FOUR**, so the
document is the viewport and there is nothing under it. What put 3rem beneath it is one line in a
media query:

```css
@media (max-width: 23rem) { body { padding-bottom: calc(3rem + var(--safe-bottom)); } }
```

**IT IS A SECOND, HARDCODED COPY OF `--bar`.** `index.html` deleted `<nav id="tabs">` and its own
note there says why — *"an empty fixed element reserving three rem at the foot of every screen for a
control that did not exist"* — and `--top` and `--bar` went to `0rem` in the same spirit, both
documented at the top of `style.css` as kept-but-zero because five rules measure from them. **This
copy does not reference `--bar`, so setting it to zero never reached it.** The rest of that block —
`.tab .lb`, `.tab .ic`, `#tabs { height }` — named elements no JavaScript file has produced since,
and `#tabs` was still sitting in two live selector groups.

**AND `23rem` IS 368px, NOT 320.** A media query resolves `rem` against the INITIAL font size, 16px,
never the root's own `clamp(13.5px, 3.8vw, 16px)` — so the comment's "a 320px iPhone SE" was every
phone up to an iPhone 12 mini.

### Why 41px is worse than 41px on iOS

**A scrollable document is what lets Safari start collapsing its toolbar** — and `100dvh` is the
DYNAMIC viewport, so it grows as the toolbar goes, `#screen` and `body` grow with it, and the
overflow changes underneath the gesture. That is a loop, and "clunky" is what a loop feels like. On
the columns it never showed, because `#screen` is `touch-action: none` and the grid takes every
gesture there; measured in Chromium the page turns at all six sizes with the 41px present. **The
platform this was reported from is the one platform this environment cannot open**, so the mechanism
is stated from the code rather than from a measurement of iOS.

### `overscroll-behavior-y` was on `body`, and the viewport reads it off the root

**`overflow` is the property that is taken from `body` when the root has none. `overscroll-behavior`
is not** — it propagates from `html` and from nowhere else. So this spent its life on `body`, where
Chrome happened to honour it and Safari, correctly, did not: **on iOS the viewport has been `auto`
throughout.**

**That is the half that survives even with nothing to scroll**: a rubber-band on a document that
cannot move is the app coming away from the top of the screen and springing back, which is the other
half of "it feels clunky". One declaration, on `html`, not two.

### `node check/ui.js` — THE DOCUMENT SCROLLS

**Three geometry rules were green over this and each is right about what it asks.** SIDEWAYS SCROLL
is the other axis. OUT OF REACH asks whether a PANE hides content below its own fold — this pane did
not, the padding was outside it. PANE OFF THE SCREEN asks whether a pane is placed outside the
viewport — it was not. **The loss is one box further out again: the DOCUMENT, which no rule had ever
measured.**

**ZERO TOLERANCE, not a floor, and that is the difference from every other rule in this file.** The
six-pixel floors elsewhere exist because `scrollHeight` is rounded from a layout in fractions and a
pane that fits exactly reports a pixel or two; here the two numbers are the same `100dvh` twice, so
they agree exactly — measured at six phone sizes the overflow is 0px and not 1px. A floor would let
the next 3rem in as long as somebody wrote it as 3px.

**Per width and visitor, not per screen**, because the document is the document whichever column is
in front of it. **Proved by mutation** — the rule put back at a verified top-level spot names it at
320px, signed out and signed in: *"the page is 885px tall inside a 844px viewport, so the whole app
can be scrolled by 41px — body padding 0px / 40.5px, children main#screen 844px"* — and exits 1.

**THE FIRST MUTATION SILENTLY DID NOT APPLY AND THE CHECK CORRECTLY SAID NOTHING.** The anchor it
replaced against no longer existed, so `grep -c` matched the sentence in the new comment rather than
a rule, and I read a green run as a rule that could not fire. A mutation that changes no behaviour is
not a test — this file's own words about the `waveOf` mutant — and the only thing that catches it is
checking that the mutant is really in the file and really computes.

### The posts half is the same 41px, and what it is not

**Measured in Chromium at 320, 360, 375, 390 and 430, signed in, with a real photograph on each
post: the swipe up turns the page every time**, with the finger on the picture, on the caption and on
the pane. `scrollHost_` answers `null` and `axisFree` answers true, which is right — nothing under
the finger can scroll, so the gesture is the grid's.

**So the posts sentence is the first sentence on the column somebody uses most**, and the fix above
is the fix for it. Two other possibilities are worth knowing before anybody debugs it again: a feed
holding ONE post has nowhere to swipe to, and the last page of any column correctly refuses to move.

### `check/ui.js` has a 320px phone that is 844px tall

**Found while measuring the photograph, and it is why two real faults have sat here.**
`newPage({ viewport: { width, height: 844 } })` — one height for every width — so the lab's "320px"
is a 320x844 phone that does not exist and whose pane is 807px against a real iPhone SE's 534px.

**What it hides, measured:** a post with a 4:5 portrait photograph — the shape the markup itself
reserves, because it is the shape a phone camera gives — is 582px inside a 534px pane at 320x568, so
`post-said`, `cmt-form`, the textarea and its Send button are **below the fold with no scroll and no
page to turn to**. 46px at 375x667, nothing at 390 and up. **The session receipt's own 216px at
320x568 is invisible for the same reason**, and this file already records that one as pre-existing.

**And the fixture's posts carry `image: ""`**, so no run has ever drawn a photograph on that card at
all — the fourth time the fixture has been found stating a shape `doGet` does not send, after `focus`
as a string, the receipt's `sessionDates` against `dates`, and the job's `students` and `venue`.

**NOT FIXED HERE, and both halves are tasks rather than a silence.** Pairing each width with a real
phone height surfaces several pre-existing OUT OF REACH findings at once, each of which then needs a
decision rather than a blanket accepted list; and a fixture photograph proves nothing until the
viewport is real, because at 320x844 it still fits.

### And `.post-pic`'s own comment said the opposite, which is why nobody looked

It said a tall photograph *"runs past the bottom of the screen and the page scrolls, which the pager
already allows for — a page that can scroll keeps the gesture until it reaches its end, so reading a
long picture and then swiping to the next post is one continuous movement rather than two rules."*

**That was true of `.pane.scrolls`, and that class was deleted.** The note by `.pane`'s own
`touch-action` records the removal; a pane is `overflow: hidden` and clips, so there is no scroll for
a gesture to reach the end of. A confident sentence describing a mechanism that no longer exists —
the `.favwrap.is-fav` shape for the fourth time, after `resource_type` in `VOCAB` and the dead
`kind === 'paper'` guard.

**What a fix would cost is written down rather than taken.** `object-fit: cover` and a bare
`max-height` are both refused above that rule and both reasons stand — one crops the top and bottom
of a portrait, which is where the person is, and the other crops it a second way. What would work is
a height cap with `object-fit: contain`, which crops nothing and squashes nothing and makes a tall
photograph **narrower than the card** on a short phone: about 74% of the width at 320, 83% at 375,
unchanged at 390. That is a visible change to how every photograph is shown, so it is the owner's
call rather than a repair.

### A NUL byte in `check/ui.js`, and ripgrep refusing the file is what found it

**The escape sweep this file records — 23 comments holding the literal text `–` — broke two
files by replacing an escape that was there on purpose, in prose ABOUT the character.** `data.js` was
reverted and `find.js` repaired. **There was a third, and it was not a comment:** `check/ui.js` held
`kind + '\x00' + key`, a separator that sorts below every printable character, as a real NUL byte in
a string literal.

**At runtime it is identical** — a JS string holding U+0000 either way — which is why nothing failed.
What it cost is the tooling: the byte sits at offset 71586, past git's 8000-byte binary sniff, so git
still called the file text while **ripgrep refused to search it**. Found by a `grep` for `createServer`
coming back `binary file matches` on the one file this session needed to read.

**Written back as `'\u0000'`.** And the scan that found it was wrong first: `grep -qU $'\x00'` is an
EMPTY argument in bash, because a NUL cannot be passed in one, so it matched all 257 tracked files
including every `.mp4`. A scan that reports everything is a scan that reports nothing — the same
shape as the throwaway probe that reported clean on the `and`/`&` spellings. Python reads the bytes.
