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
| `order_ends` | the row's two ends in the question's own words, first end first (drawn in sentence case) | `smallest \| largest` |
| `accept` | empty, always | |

`answer` stays the human-readable answer, and its first `<b>` is the list in a right order —
`check-library.js` holds the two together (below). `marks` is unchanged. The question's html keeps the
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

**And 3 more after review**: `Q-CBM-ordering-numbers-4`, `-6` and `-7`, on the same worksheet as 9b,
11 and 12b, were still `calculation` rows with no `accept` — a keypad and no Check, the state the owner
complained about. Their items are in the drawn figure, not the html, which is why the search that picked
the 67 missed them. Solved from each figure's `aria-label`: -4 highest first, A £250, B £249, C £235,
D £199 (`1,2,3,4` — printed in order already); -6 lowest first, B £2,199, D £2,800, A £3,000, C £3,250
(`2,4,1,3`); -7 smallest first, £0.85, 91p, £1.77, £6.20, £10 (`1,4,5,3,2`). The lettered cards carry
their price (`A &pound;250`) because the figure is not on the card's page, and -4 and -6's answers were
rewritten to name the items the same way. 71 orderings in all.

**What the strip costs at 320x568, measured** (signed out, each card brought on screen as
`check/states.js` does): before, none of the 67 was shrunk; after, 22 are drawn below full size by
`paneReach_`, and four scroll. Two are at the 0.7 floor: `Q-CBM-ordering-numbers-14`, where the items
are words ("six thousand and ninety-nine") so every slot is the whole strip wide and the strip is five
lines tall, and `Q-CBM-2d-shapes-8`, which has six items. `Q-1CM-standard-form-8` and `-9` overflow
17px at zoom 0.884, so `paneReach_` misses the fit on them. At 375x667 two cards shrink and only
numbers-14 scrolls (35px); at 390x844 only numbers-14 shrinks (0.967), and nothing scrolls. If the
words case matters, it needs a slot rule for long items. The sizing rule itself is right: equal slots
are what keep the strip still under the finger. **After review** the ends moved to a line of their own
over the slots (below), which costs that line and gives the slots the whole width back. Over all 71 at
320x568 it comes out about even, measured the same way: signed out 24 shrunk and 2 scrolling (2d-shapes-8
and numbers-14, both at the floor) where it was 22 and 5 of 68; signed in 48 and 8 where it was 52 and 8;
at 390x844 still only numbers-14 shrinks, and nothing scrolls. Q4 is a line taller at 320 (four slots,
then one) and signed in its card is drawn at 92% where it was 95%.

**The scheme accepts the reverse on paper; the box does not.** Q4's mark scheme gives B1 for the
largest-first list too. On a paper a reversed list is ambiguous; here the strip says "smallest" at its
left and "largest" at its right, so 0.21 placed under "smallest" says 0.21 is the smallest. The reverse
is not listed in `choice_right` and is marked "Not yet". **Its `answer` said the opposite** — "the
scheme <b>also accepts the reverse order</b>" — so a pupil marked "Not yet" for the reverse tapped Show
the answer and was told the reverse is accepted; that contradiction may well be the "multiple answers"
the owner saw. The marking stayed strict and the answer now agrees with it: the paper's scheme also gave
the mark largest-first, and here the strip's ends say which way it runs. Its closing advice, "writing the
list out fresh is safer than numbering the printed ones", was about paper and went.

### The box (`orderBox_`, beside `choiceBox_` in js/find.js)

- **A strip of numbered slots on paper** (`--paper`, the chat bar's argument: it is the answer space,
  17:1 on the card in the sun), **the two ends a line of their own over the slots** — "Smallest" at the
  left edge, "Largest" at the right, an arrow between, at the verdict's .78rem in `--paper-ink`. They
  were .62rem capitals in `--paper-dim` at the two ends of the slots' row: 9.2px at 390 and about 8.4px
  at 320, the smallest words on the card, for KS1 children; and as flex items in that row they forced a
  wrap at every width (at 768 "LARGEST" sat alone under slot 5). The words themselves were right: the
  review checked all 68 ends rows against their questions (the largest-first, highest-first and
  furthest-ahead cards all start at the right end), and the 3 added after match theirs.
- **The items under it as buttons**, in the paper's order, typeset as choices are, **each face one
  `.qp-face` element**. A slot and an item are `inline-flex`, so a bare `<sup>` inside one was a flex
  item of its own: `vertical-align` stopped applying, it was centred beside its digit, and 2² read as
  "22", 1³ as "13", 6 × 10⁴ as "6 × 104" — measured at 390, the exponent level with its digit where the
  question prints it 6px up. Seven cards (standard-form-8 to -12, 2005-1H-9, 5AD-F-0603-1). Fractions
  never showed it because `typeset_` already draws one as one element, and fractions were what the first
  320 shots looked at. Buttons, not tiles:
  an item is the answer being given, as a multiple-choice option is (CLAUDE.md). Clear (the bin) and
  Send (the gold disc) are actions on it, so they are tiles, on the verdict's line.
- **Tap an item: it fills the first empty slot.** Tap a placed one **in its slot** and it goes back,
  **leaving its slot empty**; nothing slides under the finger, and the next tap fills the hole. The
  dashed ghost it leaves in the row keeps that row the same shape, and **does nothing**: it took the
  item back too, at the same size in the same place, so a quick second tap undid the first — two real
  touch taps 70ms apart on 0.2 put it in slot 2 and straight back out (`#screen` is
  `touch-action: none`, so neither tap is eaten as a zoom). It is `disabled`, and `qp-place` refuses a
  press from a placed item as well, the half that does not depend on the browser. From the keyboard the
  focus goes on to the next item still to place, then to Send. Clear puts them all back.
- **Every slot is as wide as the widest item**, empty or full, so the strip is one shape from the first
  tap to the last. Sized to what they held, every tap pushed the slots after it along — the next one
  the finger was going to included — and at 320 the strip wrapped one way empty and another full,
  dropping the items being tapped 16px under the finger.
- **Send marks**, positions against positions (`markOrder_`): right only when the row is one of the
  orders `choice_right` lists. "Correct" or "Not yet — have another go" on the reserved verdict line;
  the strip's ring turns green or amber; nothing moves — **and that now includes Send and Clear**: the
  long "Not yet" verdict is `flex: 1 1 auto` and the tiles could shrink, so at 320 Send went from 48x48
  to 39x48 (the disc an oval) and Clear from 44 to 36 wide, under the tap target, and they moved 9 and
  17px. `.qp-order > .qp-mark > .tile { flex: none; }`, as the typed bar's tiles already were. A row with a slot still empty is not an answer:
  Send says "Put all 5 in the row first", which is not a verdict. A miss can be rearranged and sent
  again — a hundred and twenty orders are not found by elimination as three options are.
- **The row is the stored answer**: `3,4,5,2,1`, `3,,5` with a hole, under the card's `ansKey_`,
  through `ansStore_`, so it goes to the account (at once on Send, as on Check) and comes back on
  another device; `ansRefresh_` redraws it where it stands. **A typed list from before is not a row.**
  52 of these cards drew the keypad and 16 a text box, and what pupils typed is under the same key on
  the device and in the answers tab. `orderSeq_` read it a piece at a time with `parseInt`, so
  2406-2F-1's "-3, -1, 2, 4, 7" drew `_ _ −3 2 _` and 0617-5's "3/5, 65%, 2/3, 0.68, 7/10" drew
  `0.68 _ 7/10 _ _`, and the next tap wrote that to the account. Now the whole value is read or none of
  it: digits and commas only, at most n pieces, every piece 1 to n and none twice — the only shape
  `orderSay_` writes — and anything else is an empty strip that the first tap replaces. The first item placed is the day it was
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
  **And whether the order is the right one**, which nothing asked: a review changed decimals-3's
  `4,5,3,2,1` to `5,4,3,2,1` (5.1 before 5.08, against its own answer) and check-library, -marking,
  -answers, -typeset and -funnel all exited 0. Now (1) the first `<b>` of `answer` must name the items,
  one for one, in an order `choice_right` lists — 71 of 71 — and (2) where every item reads as a number
  (decimals, minus signs, fractions, %, pounds and pence, powers, roots, standard form, recurring
  decimals, Roman numerals, one unit of length, mass, volume or temperature: 63 of 71) each listed order
  must run the way `order_ends` says, and two equal items must have both their orders listed. Words,
  names and mixed time units (8 rows) are held by the answer rule alone.
- `check-marking.js` cuts `orderSeq_` out too: 12 stored values read back (a whole row, a hole, the
  four typed lists above, an item twice, a 0, too many places, letters), and every ordering's own answer
  typed out as a list must draw an empty strip — 71 of 71.
- `check-marking.js` cuts `markOrder_` out of find.js: 16 cases (right; reversed, one swap at each
  end and in the middle, the paper's own order — wrong; partial, holed, empty — no verdict; both
  orders of a two-way cell right and a third wrong; the loader's arrays), and every ordering in the
  library swept: each listed order right, its reverse and every neighbour swap wrong unless listed.
- `check-flow.js`: the real Q4 through the real loader, by clicks — tap, take back from a slot (a
  hole), refill, take back from a ghost, Clear, Send empty, reversed, one swap, right; the question
  never redrawn; stored positions; on the account at once; markDone; drawn again with its verdict; a
  row from another device redrawn and its stale verdict gone; the ends a line of "Smallest" and
  "Largest" over the slots; every face one `.qp-face`; the ghost `disabled`, pressed directly and
  changing nothing; the keyboard's focus handed to the next item; a typed list under the key drawing an
  empty strip. **And a made-up row with two right orders** (`2,1,3 | 1,2,3`) served beside Q4: the
  loader keeps both, and the second, tapped and sent, is "Correct".
- `check/states.js`: "an ordering, half placed" and "an ordering, sent wrong then right, nothing moved",
  at every width — the question, the strip, the verdict's line and the card's height before and after
  each Send, **Send's and Clear's place and size before and after the wrong one** (measured there by the
  verdict's row, not its sentence: "Not yet — have another go" wraps to two lines inside its slot at
  320 and 390, as the typed bar's does), and every slot and the items' row before the first tap and
  after the last. And "an ordering of powers, raised as printed":
  5-a-day 3 June Q1 with 2² placed, every `<sup>` in the strip and the row at least 2px above its digit. The strip is two lines
  at 320 (the slots' padding was cut to 6px so three fit beside "smallest"); signed in at 320 the card
  is still shrunk to 95% to fit its pane (92% with the strip on three lines; `paneReach_`, reported by
  `check/ui.js` as known, not a failure).
- Proved red by mutation, then green on the real files: the set-marker in `markOrder_`, alternatives
  dropped, a hole marked wrong; a take-back that closes up; `ansRefresh_` without the order box; Send
  not flushing; a verdict outliving its row; a placed item leaving the row; no markDone; slots sized to
  what they hold (the slots after a tap shift at 320 and 390, and with the first padding the items
  dropped 16px at 320); the verdict line unreserved (7.5px at 390 — the first real run of the state
  found this one).
- **"The loader dropping alternatives" was on that list and was not true** — no library row has two
  orders, the journey used Q4 (one), and check-marking feeds `markOrder_` hand-written arrays. Changed
  to keep only the first order, check-flow, check-library and check-marking all stayed green. It is
  proved now, by the made-up two-order row: the same mutation fails check-flow ("the loader kept the
  orders [[2,1,3]]", and the second order marked "Not yet").
- **And after review, each proved the same way**: `orderSeq_` reading piece by piece (check-marking's
  cases and sweep, and check-flow); the ghost live — `disabled` taken off (check-flow), and the handler's
  refusal taken out (check-flow, pressing it directly); the `.qp-face` wrapper taken out (check-flow's
  markup, and the powers state at 320); the tiles' `flex: none` taken out (the wrong-then-right state at
  320); decimals-3's order reversed, Q4's ends swapped, numbers-6's items reordered, numbers-3's order
  changed, 0701-5's old answer put back, and two equal items with one order listed (check-library).
