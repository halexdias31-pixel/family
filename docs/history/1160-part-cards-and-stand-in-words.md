# 1160 — every part its own card; a stand-in note never reaches a student (8 Nov 2026)

Two owner notes, each with a phone screenshot.

## 1. "[FUNCTION NOT EXTRACTED …]" on a question (Find › Practice › Questions › Maths › Past paper › 2024 › Edexcel › A-Level)

Edexcel A-level June 2024 Paper 1 Q1 showed the importer's note `[FUNCTION NOT EXTRACTED — g(x) is a cubic in x involving a
constant k]` where the paper prints `g(x) = 3x³ − 20x² + (k + 17)x + k`. The question could not be answered and every check
passed: check-answerable asked that a part has words, a box and a marker, never that the words are the paper's.

Read off the papers' own pages (rendered, not the text layer), the same paper set had more:
- **Paper 1:** Q1 (the note above); Q8(d)'s lead was a summary ("h(x) is a quadratic in x involving a constant k").
- **Paper 2:** Q1's stem a summary ("y is a cubic in x involving terms in x³, x² and x"); Q4's stem a summary, and Q4(a)
  printed `6k² + 5k − 4` for the paper's `6k² − 5k − 4`, so Q4(b)(i)'s stored answer was `k = ½` for the paper's `k = 4/3`;
  Q8(a) and (b) "the given identity / the corresponding equation" with `[IDENTITY NOT EXTRACTED]`; Q14's stem had `− 33`
  for `+ 33` and "(coefficients partially garbled in extraction)"; Q15 was one 12-mark row reading "[QUESTION NOT EXTRACTED —
  the source PDF text was truncated …]" — now its stem and its three printed parts (a) 5, (b) 2, (c) 5.
- **Paper 31 (Statistics):** Q5(d)'s lead "[second probability appears garbled]" (`P(D > 29.0)`, not `<`); and the swallowed
  primes the text layer is worst at: Q6(c) `P(A | B′)`, Q6(d) `P(B | A′) = 0.5`, Q6(e) `P([A ∪ B]′ ∩ C)` (stored as
  `P(A | B)`, `P(B | A)`, `P((A ∪ B)′ ∩ C′)` — different questions with different answers).

The words are private (data-private/, the Ledger); the changed rows carry `lib_pending`. **The check:** check-answerable's
`standin` invariant fails a card whose drawn text holds an importer's note or summary (`STAND_IN`: "NOT EXTRACTED",
"garbled in extraction", "the source PDF", "involving terms in", "the given identity" …). A swallowed prime still reads
sensibly, so no pattern finds it: the papers' pages are the only proof.

## 2. Every part is its own card (Q-9MA0-2406-P2-1ai)

"Each card should have all buttons and be treated as its own thing — look how (a) is offset and all the other cards are
offset." Since 960 a question number was one element: tags once, each letter's block indented under the one above, one
foot of tiles. Now `questionWhole_` draws each part the search kept as a card of the same shape as any card (`qOneCard_`):
its own tag line at the top (the part's letters are tags, so a bare "(a)" heading is gone), its words, box and tool row,
then its own whole tile row (Share, star, Suggest, Top, Help). All at one left edge; a hairline between parts as between cards.

**The stem, decided by "the simplest" (fewest kinds of card):** a shared stem is drawn once, at the top of the first drawn
part that carries it, not as a card of its own — a stem card would be a card with no box and no buttons. A part not in the
search is not drawn (its own card is one search away), so nothing says "not in this search".

check-answerable's `own-card` invariant, check/qcard.js (dup-tagline, tile-groups, card-order, indent) and ux-health's
question probe now hold the new shape: every `.qb` has one tag line at its top and its own row with Share, none inside another.
