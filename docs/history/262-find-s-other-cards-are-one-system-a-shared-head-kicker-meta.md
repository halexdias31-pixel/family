## Find's other cards are one system: a shared head, kicker, meta line, section and list

**Asked for as "didn't I ask you to sleekerise the whole widget system in the finder for questions
and so on?" — "nice more sleek, fresh stable".** The question family (question, answer, figure,
paper and bundle cards) was polished in parallel and is not touched here; this is everything else
Find draws, and the same cards kept on Saved.

**Looked at first**, at 320, 390 and 768, signed out and as an admin: the funnel's first question,
six answers in, the year folder, a paper chosen, a search that matches nothing, nothing left to
narrow, the library still coming; a practical and its four pages, a project and its three, a quiz,
the textbook's contents and two chapters, boxers, fights, the three films, and a practical, boxer,
project and shop thing starred onto Saved. Element sizes were measured in the browser, not read.

| Read as unfinished | Now |
|---|---|
| Four title sizes for cards that each own a page: 17.3px (the browser's own h3) on practicals, projects, textbooks, quizzes and films; 14.8px on a fight's names and a shop thing; 13.6px on a boxer; 1rem on a part page | one: `1.1rem`, on every card and every part page |
| Flags beside the title on a short title, dropped LEFT-aligned onto a line of their own under a long one — measured with that head over all 435 cards of these kinds: 227 wrapped at 390, all 435 at 320 | the flags are the kicker row above the title on every card (`column-reverse`, so a screen reader still hears the title first). Every page reads kicker, title, line, numbers |
| The subject line jammed against wrapped flags (`.card .sub`'s negative margin) | a fixed `--fc-in` step under the head |
| Nine different margins between lines (.15rem–.65rem) | three steps on `.fc`: `--fc-in` .25, `--fc-line` .45, `--fc-group` .8rem |
| The boxer drawn as a SHOP row (`.thing`), its record pinned top right | the shared head with a `Boxer` flag; the record is the gold meta line |
| The fight's names a bare `<p>`, the method in gold capitals, title and venue two `.note` paragraphs a browser margin apart | names are the `h3`, `Fight` flag, method in sentence case on the meta line, the story as the lede, title · venue · gate as one quiet line |
| The quiz's level a round pill (`.quiz-lvl`) in the slot where every other kind says what it is | a `Quiz` flag; the level joins the subject line; the count is the meta line |
| A film had two tile rows: Watch inside the card, the star under it | Watch is `filmTiles_` in `cardActions_`, one row, as the fight's already was |
| The textbook's contents put `10.`–`16.` outside the card's padding at 320 | `ol.fc-list` gets 1.5rem, and 2rem once it reaches ten items |
| Saved drew each kept card inside `.card.is-widget`, a frame inside the pane's frame | the card and its tile row, as Find and Spotlight draw it |
| Six answers in, the chosen chips and the next answers were one cloud of pills | a rule in `--chip-line` under the chosen chips (only when there are some): 7px, not a row |
| "Nothing left to narrow" / "That is the paper" were `style="margin:.6rem 0 0"` in `--faint` | `.find-end`: dim, the "Swipe up" half in ink |

**The shared parts** (style.css, "THE FIND CARD"): `.fc` (the scale), `.fc-head` with `.fc-flags` >
`.fc-flag`, `.fc-kick`, `.fc-meta`, `.fc-sec` and its `h4`, `.fc-list`, and the prose trio
`.fc-lede` / `.fc-say` / `.fc-note`. They are the practical's old `prac-head`, `prac-flag(s)`,
`prac-of`, `prac-strip`, `gd-sec`, `prac-aim`, `prac-out` and `prac-note`, renamed because five
kinds already used them under a name that said "practical". What is left kind-specific is what no
other kind has: `prac-haz`, `prac-no`, `tb-*`, `fight-who`, `quiz-*`.

**Stable, measured.** A card's title and foot relative to its pane were identical before and after
its pages filled and its own page was emptied and redrawn; pressing an answer moved neither the
search box nor the chips already chosen. The quiz is still drawn at about 60% by `paneReach_` —
the recorded shrink-to-fit trade — and is the one card here that reads small.

**Checked.** `check-flow`: *every Find kind that is not a question is made of the shared parts* —
over the real files, every card is `.card.fc` opening on one `.fc-head`, every page opens on its
kicker then its title, no `.thing`, `.quiz-lvl`, inline style, `p.note` or tile row inside a card,
every `ol` an `.fc-list`, and a film's Watch tile in the row under it. `check/states.js`: *the
boxers* and *the fights, on the shared head* (title at 1.1rem, flag above it, meta line), *the
textbook's contents* (indent at least as wide as `16. `), *a search that matches nothing*, *nothing
left to narrow* (its class, no inline style, the rule under the chips), *an answer pressed, the
search box and the chips still*, *a practical's pages filled, its card still*, and on Saved *things
kept, drawn as Find draws them*; *the films* asks for one tile row. Proved by mutation, each restored
to green: the flags back beside the title (boxers, fights red); the two-digit rule removed
(textbook red); the chips rule removed and the inline margin back (nothing left red); a search box
that moves when a second chip arrives (answer pressed red); a card drawn 8px lower when its page is
redrawn (pages filled red, 47.9 → 55.9); Saved's widget frame back (things kept red); the film's
tile taken out of the row (films and the journey red); a boxer without `.fc`, and the contents list
without `.fc-list` (journey red).

**For the owner to confirm:** the flags now sit above every title rather than beside it (note 228's
`.prac-head` wrap is superseded); the quiz shows `Quiz` as its flag and the level on the line
under the title; boxers and fights gained a `Boxer` / `Fight` flag. The quiz card is still shrunk to
fit its pane — splitting it into a page per question, as the practicals were split, would make it
readable at full size and is the obvious next step if wanted.
