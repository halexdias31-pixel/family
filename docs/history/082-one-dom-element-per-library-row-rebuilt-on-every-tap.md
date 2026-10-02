## One DOM element per library row, rebuilt on every tap

**Reported as "when im clicking on questions and using the finder its so fycking slow man", then
"its only slow on mobile".** That second message is the diagnosis: every number in the funnel's
arithmetic is memoised and measures **0 ms** — `stuffFiltered`, `nextFacet`, `stuffQuestion`,
`stuffPageCount`, all of it. What is left is DOM, and DOM is what a phone is slow at.

**Measured at 8x CPU, one tap on the funnel's first answer**: `insert 50 ms`, `fill 45 ms`,
`question 19 ms`, `pager 8 ms` — and the insert is **5,227 page elements, 292 KB of markup**, built
from nothing every single time. At 12x, which is an ordinary mid-range phone, the whole repaint was
**340 ms a tap and 233 ms a keystroke**.

**There is one page per RESULT**, so the cost is the size of the LIBRARY rather than the size of the
screen — and it grows with every paper transcribed. The desktop hid it completely.

### Three things, and none of them changes what is on the screen

| | |
|---|---|
| **the blanks are reused** | an empty page is an empty page whichever item it stands in for, so a repaint that does not change the count now touches nothing. Add the difference, remove the difference |
| **only a dozen are built while your finger is down** | you land on the question you just answered and the results are below it. The pages within reach are built now and the rest arrive on the next turn of the event loop, before any finger can travel far enough to need them |
| **`fillStuffPages` walks the window, not the library** | it walked all 5,227 pages calling `paneOf_` on each — a DOM query per page — for a function whose own note says it only ever touches eleven. What to fill is the window; what to empty is whatever is still MARKED filled, which is a selector the browser answers without walking anything |

| at 12x CPU | before | after |
|---|---|---|
| answering the first question | 340 ms | **160 ms** |
| answering the next | 264 ms | **22 ms** |
| a keystroke in the search box | 233 ms | **102 ms** |

**What makes reuse safe is the `filled` mark.** A page standing in for a different item must not
keep the markup it was given for the old one — so `paintStuff` empties every page that HAS been
filled, and there are never more than eleven of those.

**The dial counts what is there**, so it names the real total a frame later, and `goPage` clamps —
which is what makes the deferred half safe rather than something to get right. **Proved by walking
the states**: top of funnel, one answer (5,226 items / 5,227 sections), narrowed to one paper
(41 / 42, Q1 Q2 Q3a Q3b in order), paged to Q13a, then a search (1,109 / 1,110). Sections match the
wanted count in every state and no JS errors.

**What is NOT fixed, and it is the real one.** 160 ms is better than 340 and it is still one element
per row: the top-up builds all 5,226 a tick later, and `placeCells` then positions them. The honest
fix is a strip that holds a window of page ELEMENTS rather than one per result — a change to the
pager every screen shares, which is not a thing to do while somebody is teaching. Written down here
so it is a decision rather than a silence.
