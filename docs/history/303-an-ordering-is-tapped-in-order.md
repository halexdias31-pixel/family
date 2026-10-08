## An ordering is tapped in order: the items are buttons, the answer is the order, and a machine marks it

**The owner, 8 Oct**, after a pupil met Edexcel GCSE Maths June 2024 Foundation Paper 1 Q4 — *"Write
these numbers in order of size. Start with the smallest number. 0.21 0.2 0.03 0.1 0.16"* — on the
site: *"as you can see there are multiple answers. I would prefer it be like an ordering system?? Idk.
But simpler to mark for a machine."*

### Why it was broken

`markParts_` (js/find.js) reads a typed list as a SET: it splits on commas and "and", sorts the
pieces, and compares. That is right for "list the factors of 12" and exactly wrong where the order is
the answer — the question's own list, copied out unsorted, was marked right. So 299 cleared the
`accept` of every ordering (045's rule, "an ordering has no accept"), and Q4 became a box of words
nobody could mark. And a list typed into a box has a dozen spellings (commas, spaces, "and", 0.10
for 0.1), each one a way for a marker to be wrong. "Multiple answers" was both: many spellings of one
answer, and an `accept` that had to be taken away.

### The format (data/questions.json, one row per ordering)

| column | what it holds | Q4 |
|---|---|---|
| `answer_type` | `order` — a new value in `check-library.js`'s vocabulary | `order` |
| `choices` | the items, ` \| `-separated, **in the order the paper prints them**, the library's own HTML allowed (`1 &frasl; 2`) | `0.21 \| 0.2 \| 0.03 \| 0.1 \| 0.16` |
| `choice_right` | the right order as 1-based positions into `choices`, first place first; where equal values make more than one order right, the others after ` \| ` (`2,1,3 \| 1,2,3`) | `3,4,5,2,1` |
| `order_ends` | the row's two ends in the question's own words, first end first | `smallest \| largest` |
| `accept` | empty, always | |

`answer` stays the human-readable answer and `marks` is unchanged. The question's html keeps the
items too: they are part of the question, and the weekly email prints the question's words.
`tools/set-order.py` writes the four columns from a proposal file and asserts every one first; Q4 was
converted with it first, on its own.

**Then 67 more, the same day**: Edexcel 1F/2F/3F/1H orderings (negatives, fractions, standard form,
recurring decimals), the 1st Class Maths fraction and standard-form sets, the Corbett ordering
decimals / numbers / fractions / Roman numerals sheets, the 5-a-day mixed fraction–decimal–percent
orderings, a race ("furthest ahead"), shapes by sides, and one AQA food chain (`first | last`). Each
order was solved, solved again independently, and solved a third time against the question's own
list (and the preamble's table where the items live there) before it was written. 14 answers were
rewritten too. Most were a bare list with no reason; three were wrong: 0701-5 and 0706-4 gave their
decimals in the paper's order, not the answer's, and ordering-decimals-7 said "third decimal place"
when the second decides it. `check-marking.js`'s sweep now covers 68 orderings. The "THE ORDER IS THE
ANSWER" examiner notes on the Corbett rows were left as written: they say why there is no `accept`,
which is still true.

**What the strip costs at 320x568, measured** (signed out, each card brought on screen as
`check/states.js` does): before, none of the 67 was shrunk; after, 22 are drawn below full size by
`paneReach_`, and four scroll. Two are at the 0.7 floor: `Q-CBM-ordering-numbers-14`, where the items
are words ("six thousand and ninety-nine") so every slot is the whole strip wide and the strip is five
lines tall, and `Q-CBM-2d-shapes-8`, which has six items. `Q-1CM-standard-form-8` and `-9` overflow
17px at zoom 0.884, so `paneReach_` misses the fit on them. At 375x667 two cards shrink and only
numbers-14 scrolls (35px); at 390x844 only numbers-14 shrinks (0.967), and nothing scrolls. If the
words case matters, it needs a slot rule for long items. The sizing rule itself is right: equal slots
are what keep the strip still under the finger.

**The scheme accepts the reverse on paper; the box does not.** Q4's mark scheme gives B1 for the
largest-first list too. On a paper a reversed list is ambiguous; here the strip says "smallest" at its
left and "largest" at its right, so 0.21 placed under "smallest" says 0.21 is the smallest. The reverse
is not listed in `choice_right` and is marked "Not yet".

### The box (`orderBox_`, beside `choiceBox_` in js/find.js)

- **A strip of numbered slots on paper** (`--paper`, the chat bar's argument: it is the answer space,
  17:1 on the card in the sun), the two ends written at its two ends — "smallest" before slot 1,
  "largest" after the last, pushed to the strip's right edge on whatever line it wraps to.
- **The items under it as buttons**, in the paper's order, typeset as choices are. Buttons, not tiles:
  an item is the answer being given, as a multiple-choice option is (CLAUDE.md). Clear (the bin) and
  Send (the gold disc) are actions on it, so they are tiles, on the verdict's line.
- **Tap an item: it fills the first empty slot.** Tap a placed one — in its slot, or the dashed ghost
  it leaves in the row underneath — and it goes back, **leaving its slot empty**; nothing slides
  under the finger, and the next tap fills the hole. The ghost keeps the row under the strip the
  same shape. Clear puts them all back.
- **Every slot is as wide as the widest item**, empty or full, so the strip is one shape from the first
  tap to the last. Sized to what they held, every tap pushed the slots after it along — the next one
  the finger was going to included — and at 320 the strip wrapped one way empty and another full,
  dropping the items being tapped 16px under the finger.
- **Send marks**, positions against positions (`markOrder_`): right only when the row is one of the
  orders `choice_right` lists. "Correct" or "Not yet — have another go" on the reserved verdict line;
  the strip's ring turns green or amber; nothing moves. A row with a slot still empty is not an answer:
  Send says "Put all 5 in the row first", which is not a verdict. A miss can be rearranged and sent
  again — a hundred and twenty orders are not found by elimination as three options are.
- **The row is the stored answer**: `3,4,5,2,1`, `3,,5` with a hole, under the card's `ansKey_`,
  through `ansStore_`, so it goes to the account (at once on Send, as on Check) and comes back on
  another device; `ansRefresh_` redraws it where it stands. The first item placed is the day it was
  done (`doneMark_`), as the first letter typed is, so the weekly email sees it like any other answer.
- **Drawn from the store, never patched by a handler.** What was sent is held for the visit
  (`ORDER_SENT`) and the verdict is drawn only while the row is still the row that was sent: move
  one item, or have another device change it, and the verdict goes.
- **The loader** (library.js) keeps `choiceRight` as the first order — a multiple-choice row, which
  has no pipe, reads exactly as before — and adds `choiceWays` (every order) and `orderEnds`.

### Checks

- `check-library.js`: `order` in the vocabulary; every ordering has 2+ items, every order in
  `choice_right` is each item exactly once, two `order_ends`, and no `accept`; `order_ends` on a row
  that is not an ordering fails. The choices rule splits `choice_right` on pipes as well as commas.
- `check-marking.js` cuts `markOrder_` out of find.js: 16 cases (right; reversed, one swap at each
  end and in the middle, the paper's own order — wrong; partial, holed, empty — no verdict; both
  orders of a two-way cell right and a third wrong; the loader's arrays), and every ordering in the
  library swept: each listed order right, its reverse and every neighbour swap wrong unless listed.
- `check-flow.js`: the real Q4 through the real loader, by clicks — tap, take back from a slot (a
  hole), refill, take back from a ghost, Clear, Send empty, reversed, one swap, right; the question
  never redrawn; stored positions; on the account at once; markDone; drawn again with its verdict; a
  row from another device redrawn and its stale verdict gone.
- `check/states.js`: "an ordering, half placed" and "an ordering, sent right, nothing moved", at every
  width — the question, the strip, the verdict's line and the card's height before and after Send,
  and every slot and the items' row before the first tap and after the last. The strip is two lines
  at 320 (the slots' padding was cut to 6px so three fit beside "smallest"); signed in at 320 the card
  is still shrunk to 95% to fit its pane (92% with the strip on three lines; `paneReach_`, reported by
  `check/ui.js` as known, not a failure).
- Proved red by mutation, then green on the real files: the set-marker in `markOrder_`, alternatives
  dropped, a hole marked wrong; a take-back that closes up; `ansRefresh_` without the order box; Send
  not flushing; a verdict outliving its row; the loader dropping alternatives; a placed item leaving
  the row; no markDone; slots sized to what they hold (the slots after a tap shift at 320 and 390, and
  with the first padding the items dropped 16px at 320); the verdict line unreserved (7.5px at 390 —
  the first real run of the state found this one).
