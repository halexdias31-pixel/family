## Every picture is its own card, the page after the thing it belongs to

**Asked for as "across the board of all resources the diagrams should be its own widgets."** The
practicals were already split into pages; this is the same move for every question. `pageParts_` in
find.js (was `pracParts_`) gives a question with a picture a second page, `'fig'`, and a practical a
`'fig'` page between its card and its kit. `stuffPages_` expands them where pages are built, so the
funnel's counts still see one item; only the pager's page count grows.

| | |
|---|---|
| **the question card** | the words, the tables, the answer box and the mark scheme. No `<svg>`, no pen, no photograph |
| **`questionFigCard_`** | `Figure · Q12(b)` and the paper name, then every preamble picture (so each part of a shared figure gets it, as `preamble_` always did), the part's `diagram` with its `figCredit_`, its `images`, and the pen. `data-of` names the row |
| **the pen** | moves with its picture. `padKey_` is unchanged, so marks already made come back |
| **practicals** | card, **diagram**, kit, steps, worksheet |
| **Saved and Spotlight** | `cardPages_` draws a kept thing's figure as the page after it, and only the figure |

`stuffPageOf_(x, part)` takes the part, so a state or a check can land on a figure page.

**Checked:** `check/cards.js` fails a question card that still draws a picture and a figure page
that draws none (asked of the app's own two builders), and a practical whose drawing is not on its
own page straight after its card. `check/press.js` walks the 41-question paper over `stuffPages_`,
forwards and backwards: each question page carries its own answer key and no figure card, each
figure page names its row, has no answer box, and follows its own question. The pen test lands on
the figure page. `check/states.js`'s pen and practical states assert the new places.

**And a table was eating the swipe up.** With the figure gone, Q24 of 8464/B/1H is shorter and its
table landed under the thumb at the foot of the scrolled pane, and the page would not turn.
`overflow-x: auto` makes `.qsheet table` a scroller, a scroller starts its own `touch-action`, so
the pane's `none` stopped at it and the browser took the vertical gesture. `touch-action: pan-x` on
the table: sideways is the table's, up and down are the app's. Pre-existing, found by the press walk.
