# 432 — A question card is never blank

## What the owner saw

24 Oct, Find, Maths GCSE Edexcel Higher, November 2022 Paper 2, Q1. Each part's card showed its tags
("… Accuracy unverified", "Function verified"), the answer box (Type your answer, the image and send
tiles), the star and the flag. It had no words, no figure, no loading dots, no "Sign in to see this" and
no "Couldn't load this". The owner's words: "what is this fucking bullshit".

## Why

The backend was fine. `libItems` answered and `libMerge_` put the words onto the item in place:
`x.html` was there. What drew nothing was the page plan.

`partPlan_` (find.js) cuts a part's words into pages and keeps the plan in `CHUNK_MEMO`, a WeakMap keyed
on the item. Its comment said "the html of a row does not change under it", and that stopped being true
in 397. The facet tags "Page N" and "N pages" call `qPagesOf_` → `partChunks_`. They run while the card
is still waiting: for the facet index of every item at load, and for the waiting card's own `tagRow_`.
So an EMPTY plan was memoised on every library question. When the words landed on that same object,
the column was drawn again from the memo: tags, box, and an empty sheet.

Stem pages were whole because `questionContent_` builds new stem objects, so nothing stale was keyed on
them. That is also why the 397 journey passed: it looked at Q1(a)'s first page, the stem, and never at
the part's own card. Every library question's card was blank, not only this paper's.

## The fix

- **The rule:** a plan holds for one library generation. `chunkHad_` returns a memoised plan only when
  its `gen` matches `LIB.gen`, which `libMerge_` bumps on every landing. Both `stemPlan_` and
  `partPlan_` stamp their plans.
- **The safety net:** `qWordsOr_` (questionCard_). A question whose body has no text, figure, picture or
  input says why: the library's reason (`libSay_`, which is the dots, sign in, or Couldn't load this with
  Try again) while it waits, or "This question's words are missing — flag it" when there is nothing at all.
- **An old backend said plainly:** `libWhyNot_` (library.js). When the live backend does not know
  `libItems`, an admin reads "The library needs the latest backend — deploy it." and anyone else reads
  "The library is being updated — try again later."; Try again stays.

## The check

check-flow journey "a part with an answer box … never a blank body (432)" uses that paper. It answers
`libItems` from the whole rows and requires each of Q1(a)–(c)'s own cards to show its words above the
box, and no drawn question page to have a blank sheet. It then has an admin's phone meet
`Unknown action: libItems` and requires the deploy sentence with Try again. On the old find.js and
library.js it fails: three cards without words, six blank pages, and the old message.

## Deploying

There is nothing to deploy on the backend for this fix. The live backend (2026-10-23-a-kid-prices)
already answers `libItems`, so `git push` of the front end is enough.
