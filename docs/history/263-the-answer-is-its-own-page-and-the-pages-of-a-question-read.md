## The answer is its own page, and the pages of a question read as one question

**Asked for as "what I want was answers to be short and to be their own widget. Also didn't I ask
you to sleekerise the whole widget system in the finder for questions and so on?"**, after "make
answers breaifer and their own widget too possibly?" and "refine the question widget stuff. like
just make it nice more sleek, fresh stable ect." 259 made answers short and left the page undone with
a note saying why; the owner read it and asked again. 261 polished the question card itself.

**The answer is the page after its question**, and after its figure where there is one —
`pageParts_` gives a question `[null, 'fig'?, 'ans'?]`, the figure precedent (204) one part along.
`questionAnsCard_` draws it: `Q3 · answer`, the tags, then `answerBlock_` — the result large (1.3rem,
ink), the "Why" fold with the working and the examiner's note under it, unchanged. A row with no
answer has no answer page. `cardPages_` builds Saved's pages from `pageParts_` too, so a kept
question is its card, its figure and its answer in that order.

| | |
|---|---|
| **the question card** | the words, the box, Check, the options to tap — answering, a form. No answer, no "Show the answer" button, no `.qans` |
| **its tile row** | the star and an eye: `Show the answer` (staff: `The answer`), act `qa-go`. A tile because the question is a thing and this is done to it. It turns forward by the answer's place in `pageParts_`, from the page the tile is on (`logIndex_`), on Find and Saved alike |
| **the answer page, for a student** | "Answer hidden — have a go first" and one `Show the answer` button (`qa-show`). **The answer is not in the markup** — the old `.qans.is-shut` hid with `display: none` an answer anybody could read in the document |
| **who sees it open** | `ansOpen_`: staff (`isTutorRole`), or a student who asked (`qa-go` / `qa-show`), got a typed answer right (Check), or has a tapped question settled right in storage. Held in `ANS_SHOWN` by the answer box's key — which carries who is signed in — for the visit, not in `localStorage` |
| **a right answer** | opens the answer page where it stands (`ansShow_` redraws it by `data-k`) and does **not** turn to it: "Correct" is what you are reading, and a slide away from it is the card jumping at the moment it marks you, which 261 took out |

**One family.** The question, figure and answer pages share `qHead_`: the number gold and first, the
part after it in the marks' quieter voice (`Q3 · figure`, `Q3 · answer`), the marks hard right on all
three. The answer's label is the answer box's small capitals — "ANSWER · EXPLAIN" over the result,
"YOUR ANSWER" over the box — where it was a gold "Answer" beside a faint "explain" that read as one
phrase. The figure card's credit under a pen is set as the footnote beside it rather than centred over
it in a different size and grey. The **bundle** card (the only paper-level card Find has — the whole-
paper card went in 008/240) is a `.qcard` now, with the same header row (`Bundle` · `12 papers`),
where it was a breadcrumb and a title whose "— 12 papers" wrapped to leave "papers" alone at 320.

**Looked at first and after**, signed out, as a student and as a tutor, at 320, 390 and 768: the
bundle, the figure card, a tapped question, a typed one marked right, the answer with Why shut and
open. Measured: `check/cards.js` counts **1,304** question cards taller than a 320×568 pane, down
from **1,668** — the answer block, its rule and its reveal button came off every card.

**Checked.** `check-flow`: *an answer is its own page after its question, hidden from a student
until shown, and kept on Saved* — the page exists exactly when there is an answer, the question card
draws none, a hidden page holds no answer in its markup, the tile opens the page already standing,
the open survives a redraw, a right tap earns it and a wrong one does not, a tutor's is open, and
Saved keeps it after the figure; the 259 and 261 journeys moved to the answer page and the tile.
`check/states.js`: *an answer, hidden until you have a go*; *the answer, turned to from its
question* (the tile pressed, `PAGE.stuff` lands on `stuffPageOf_(it, 'ans')`, the page open);
*its working folded* and *opened* on the answer page; *a typed answer, marked right* asks `ansOpen_`.
`check/press.js`'s 41-question walk asks each answer page to name its row, carry no box and follow
its question or figure. `check/cards.js` fails a question card that draws its answer.

**Decided, and worth a look:** the hidden page's control is a button, not a tile (it is the one
control in the card's body, and part pages carry no tile row). Tags are repeated on the figure and
answer pages, so a page landed on cold says which paper it is from. `ANS_SHOWN` forgets on reload.
