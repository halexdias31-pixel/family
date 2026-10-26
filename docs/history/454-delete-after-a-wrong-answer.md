# 454 — Delete after a wrong answer, and the three-coin outcomes

Two reports from a live lesson, 25 Oct 2026.

## 1. "Got a question incorrect, then tried deleting. It didn't work. Had to clear the app."

KS2 maths Paper 1 (arithmetic), question 1, typed on the keypad. Wrong answer, Check, then ⌫ did nothing.

**Cause.** The keypad's box is `readonly`, so the caret is the pad's own. A tap on the box's drawing put the
caret where the finger landed (`kpHit_`) — including on the tap that *brings the pad back* after Check closed
it. A child taps the left of the box, the caret lands before the answer (position 0), and ⌫ at 0 deletes
nothing, press after press. Digits typed then went in *front* of the wrong answer, so it stayed wrong. Only a
reload (caret to the end on arrival) freed it. Reproduced in a real touch browser (Playwright, 390×844): a tap
3px into the drawing, then ⌫ ×2 and Backspace: `717` unchanged, caret 0.

Nothing was locked or unbound: marking, the verdict and the pad all worked. It looked like a freeze because
the only key a child tries does nothing.

**Fix (the rule, not the instance).**
- Arriving in a box always lands the caret at the end, as `kpOpen_` already promised. Only a tap in the box
  the pad is *already on* places the caret (keypad.js click handler).
- ⌫ with nothing before the caret in a maths box is never a dead key: it takes the last character. A worded
  box (an essay) keeps ordinary editing — its last character can be out of sight.

Journey: "after a wrong Check every answer can be deleted and checked again — typed on the keypad, picked,
ordered — and after a reload". With keypad.js put back, it fails exactly as the lesson did. Picks and
orderings were already free after a miss (385); the journey holds them to it. The pen's Clear and Undo are
covered by the edges journey (Clear then Undo on a pad).

## 2. "A problem with a question for combinations of tails and heads on coins, 2024 June"

GCSE Maths Foundation, Edexcel June 2024 Paper 2F Q10 (`Q-1MA1-2406-2F-10`): list all outcomes of three
throws of a coin. Scheme: HHH, HHT, HTH, HTT, THH, THT, TTH, TTT in any order (M1 A1).

**Cause.** `rule: set hhh/…` splits items only at commas and sorts the words *inside* an item. `H H T` became
`h h t` (not `hht`), `H,H,T` became three items, `heads heads tails` was never `hht`, and a list with no commas
was one item. Every one of those is right by the scheme and was marked wrong.

**Fix.** A `spell` clause on a set: `rule: set hhh/hht/…, spell h~heads~head t~tails~tail`. Each item is then an
ORDERED run of letters (HHT is not THH): the answer is read as one stream of letters, with words spelled to
their letter and separators ignored, cut into runs the length of the items, and compared as a set
(`markRuleSeq_`, find.js). Missing, repeated, extra or foreign letters are wrong. Twelve sample answers in
check-marking. The words live in the Ledger: an import file of the one row was made with
`node tools/lib-private.js drive-pack … --ids Q-1MA1-2406-2F-10`.
