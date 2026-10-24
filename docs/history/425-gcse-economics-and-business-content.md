## 425 — GCSE Economics, nine more GCSE Business chapters, nine teaching animations (2026-10-24)

**Asked for as** GCSE Economics and GCSE Business: inventory what is there, add or upgrade chapters, and animate the
diagrams the subjects are taught with — supply and demand shifting, the PPF, elastic against inelastic revenue, MSC
against MPC, a break-even chart building, a cash-flow forecast's running balance, the circular flow, how a rate rise
works through, and the exchange rate's effect on exports and imports.

### What was there

- **Economics: nothing.** No book, no chapter, no question, no topic in `data/topics.json`. `Economics` appeared only in
  the subject list of a tutor's profile (`js/me.js`).
- **Business: `TB-GCSE-BUS`**, ten chapters in the order of Edexcel 1BS0 (enterprise, spotting an opportunity, putting the
  idea into practice, making it effective, external influences, growing, marketing, operations, finance, HR), each with
  seven key words and five worked lines — thin on ownership, aims and stakeholders, the 4Ps, research methods,
  break-even, cash flow, motivation and growth. No animation, no question, no topic.

### What was added

**`TB-GCSE-ECON`, "GCSE Economics"**, KS4, in the order of AQA 8136 (board and spec left blank on the cover, as Business
does: the chapters are not one board's alone). Ten chapters, each 7–8 key words, five worked lines and 1–3 formulas:

| | chapter | animation |
|---|---|---|
| 1 | Scarcity, choice and opportunity cost | `ecppf` The production possibility frontier |
| 2 | Demand, supply and price | `ecsupply` Demand and supply shifting |
| 3 | Price elasticity of demand | `ecped` Elastic and inelastic revenue |
| 4 | Market failure and externalities | `ecextern` A negative externality |
| 5 | Competition and monopoly | |
| 6 | The labour market | |
| 7 | Money, banking and interest | |
| 8 | Growth, inflation and unemployment | `ecflow` The circular flow of income |
| 9 | Fiscal and monetary policy | `ecrates` How a rate rise works through |
| 10 | International trade and exchange rates | `ecfx` The pound, exports and imports |

**`TB-GCSE-BUS` chapters 11–19**, the ones that go deeper, after the existing ten: Forms of business ownership; Aims,
objectives and stakeholders; The marketing mix: the 4Ps; Market research methods; Revenue, costs, profit and
break-even (`ecbreakeven` Building a break-even chart); Cash flow and sources of finance (`eccashflow` A cash-flow
forecast, month by month); Operations: production, stock and quality; Motivation, recruitment and training; Business
growth and economies of scale. **Chapter 1 (Enterprise) upgraded** with three more key words (characteristics of an
entrepreneur, calculated risk, opportunity cost), and the cover's summary now says ten chapters then nine deeper ones.

No topics: the tree has none for either subject, and a content card's topic must be one the library or the tree spells.

### Public cards, private words: `lib_pending`

The cards are in `data/textbooks.json` with `lib_pending: "True"` (chapters 11–19 and the whole Economics book; the
covers have no words to wait for). The words were written into `data-private/textbooks.json` and checked whole; they go
to the Ledger by an import file made with `node tools/lib-private.js drive-pack … --ids …` outside the repository (20
items: the 19 new chapters and Business chapter 1, the new ids vouched for under `cards`), which the owner imports in
Business (407). Until then a signed-in reader sees the card's title and tags and "Coming soon."

`lib_pending` was not on this branch, so it was brought in exactly as the A-level branch wrote it (docs/library.md's
section, `check/lib-full.js` `pending`, `check-textbooks`'s `wordless` skip and note, `libSay_` and the chapter's
`pending` in `library.js`): identical hunks, so the two branches merge clean there. On a fresh clone check-textbooks
says "19 pending card(s) and 9 animation(s) on them were NOT checked for words".

### The animations

Each is `tools/ec_<topic>.py`, writing its whole row through `anim_row.write_anim(…, whole=)` (the A-level branch's
`_put_whole` and its keyframe helpers `kf`, `fade`, `captions`, `still_block`, brought in the same way), so the script is
the source and check-anims re-runs each one on a copy of the books. Each is an SVG with its own prefix, a caption that
changes with the step, and a reduced-motion block that leaves the finished picture.

- `ecsupply` — D shifts right (P and Q up), then S shifts left (P up, Q down); the old lines and equilibrium stay as
  faint ghosts; the dashed P and Q guides follow the new equilibrium (`scaleX`/`scaleY` with `non-scaling-stroke`).
- `ecppf` — a point slides from A to B, the wheat lost and the barley gained are marked; a point inside and one outside;
  the frontier scales out from the corner, the old one left dashed.
- `ecped` — two panels, the revenue box P × Q under each point: price +50% on steep demand, TR £400 → £540; +25% on flat
  demand, TR £400 → £300.
- `ecextern` — MSC rises off MPC by the external cost; Qm, then Q* to its left, then the welfare-loss triangle.
- `ecflow` — spending and incomes running round (moving dashes); withdrawals S T M, then injections I G X.
- `ecrates` — six linked boxes lighting in turn, base rate 5.00% → 5.50% down to inflation falling towards 2%.
- `ecfx` — a £20 shirt in dollars and a $30 game in pounds at £1 = $1.25, $1.50, $1.00, with dearer/cheaper.
- `ecbreakeven` — FC, TC and TR drawn in by `stroke-dashoffset`; break-even at 2000 ÷ (10 − 6) = 500; loss and profit
  shaded; margin of safety 300 at sales of 800 (the chapter's worked lines, the same numbers).
- `eccashflow` — the forecast table month by month (Jan: £1,000 + £5,000 − £6,500 = −£500, the chapter's first worked
  line) and each closing balance dropping into a bar chart, red below the line.

Each has a row in `data/settings/splashes.json` (kind `tool`, note the subject). The books' drawings now come to
252,494 characters, past the old `SPLASH_CACHE_MAX` of 200,000, so it is 500,000 — the A-level branch's figure. Shot at
390 px wide, frame by frame; labels that collided (PPF's "unreachable" against A, the externality's "external cost"
against MPC, the circular flow's small labels, the break-even's "loss" on FC) were moved.

### Checks

`node js/check.js`; `node js/check-all.js --fast`; the four `FLOW_PART=k/4 node js/check-flow.js`. check-textbooks,
check-anims and check-loading also run with `data-private/` absent (a fresh clone): green, with the pending note.

### Deploying

`git push` for the cards, the scripts' rows and `js/` (`library.js`, `find.js`, `shell.js`). The words: upload the import
file to the Drive folder `family-library-imports` as `lib-import-<time>.json`; the owner taps *Import library updates*
on Business. No backend change; stamps untouched.
