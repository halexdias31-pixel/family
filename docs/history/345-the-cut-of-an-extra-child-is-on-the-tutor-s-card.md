## The cut of an extra child is on the tutor's card: per tutor, in pounds beside the rate, an admin's to set, and blank is the config default

**The owner, 12 Oct:**
*"Your cut off extra child for tutors should be editable on thir card. Like they can edit that small number
to the right of their normal rate"*

### What was there

- **One number for every tutor.** The business's share of each extra child was `B` on the config tab
  (`B`, `boss rate` or `boss_rate`), set from an admin-only Settings card, "Your cut of an extra child"
  (`cutCard_`, posting `updateConfig`). Every tutor's seat carried the same cut.
- **The small number to the right of the rate** is the tutor card's `+£X/h a seat` (`profSeat_`,
  cards.js). It is the rate times two shares: the tutor's own (`extra_seat_rate`, on their row, 0–2) and
  the business's (`B`). `seatShare_` in core.js is the one reader, and `priceFrom` uses it for the quote,
  the seat multiplier and the split of the seat money (`tutorPay`, `profitTotal`).
- **The tutor's own share was edited as a fraction.** On the card editor it was a box captioned
  "extra seat: share of your rate, 0–2", which is a number nobody thinks in. The old cut card made the
  same point about 0.1.

### What it is now

**A column per tutor: `extra_seat_cut`** on the people tab, beside `extra_seat_rate`, in `SCHEMA.people`.
`ensureSchema` adds it at the end of a live sheet — but **`doGet` does not run `ensureSchema`** (only
`?setup=1` or `?run=ensureSchema` does, doget.gs), so **the owner must run it once** after the sync. This
said the version bump made `doGet` run it; it does not, and until it is run every Save of the cut is refused
with "no column for: extra_seat_cut" (below).
`doGet` sends it on each tutor row as `extraSeatCut`.

| cell | means | sent as |
|---|---|---|
| blank | the config tab's `B`: the usual cut, which is how every tutor was priced before | `''` |
| `0` | no cut: the tutor keeps the whole of the seat | `0` |
| above 0 up to 2 | this tutor's own cut, a share of their rate | the number |
| anything else typed by hand | treated as blank (`seatCutOut_`): a typo must not take the margin to nothing | `''` |

**Why `extra_seat_cut` and not `seat_cut`.** It is the sibling of `extra_seat_rate`: same noun, same unit
(a fraction of the rate), side by side in the header and on the rate page. `grep extra_seat_` finds both
halves of one price. A bare `cut` already means other things in the code (a clipboard event, `acc.cut`,
`room.cut`).

**`seatShare_` reads it first and falls back to `B`.** `num('')` and a missing key are NaN, so they mean
the default. `num(0)` is 0, so it means no cut. It returns `bRaw` and `cutOwn` as well, so the admin's
breakdown line says where the cut came from (`tutor 0.5 + their cut 0.2`, or `+ B 0.1`). Every caller
follows it without a change of its own:
- the card's `+£X/h a seat`;
- the quote and its seat multiplier (`priceFrom`);
- the split, which becomes the job row's `tutor_pay` and `admin_profit` through `createJob`;
- the receipt and the print sheet, which draw the stored lines.

The server prices nothing from the seat share: `createJob` records what the phone sends. "No preference"
bookings have no tutor row and stay on `B`.

**It is edited on the tutor's card**, in the rate section (`cardRateHtml_` in me.js):
1. the rate;
2. the two parts of a seat side by side, **in pounds an hour**;
3. the seat as the card will print it, recomputed as anything is typed. This is `profSeat_` itself over
   the typed row, so the form cannot print a seat the card would not.

**Pounds on the card, fractions on the sheet.** A rate that moves still takes the seat with it, and
nothing else that reads `extra_seat_rate` changes meaning.
- The boxes typed into carry `data-pound`, not `data-me`.
- The shares are hidden `data-me` boxes that hold the stored cell exactly, so an untouched seat is never
  sent and cannot start the tutor's month clock.
- Pounds typed become `pounds ÷ rate` rounded to six places. The error is under half a millionth of the
  rate, so the same penny comes back for any rate under £10,000 an hour.
- Pounds that come to the stored share at the current rate put back the stored cell itself, so a retyped
  seat is not a change.
- A rate typed keeps the shares and moves the pounds.
- With no rate the pound boxes are disabled, and the line says to set the rate first.
- A part past twice the rate is said in the preview before the server refuses it.

**Only an admin sets it.**
- **On the card:** an admin editing any tutor's card, their own included, gets a box. A tutor on their
  own card gets a line: *"£3.00/h of a seat is @family.'s — only @family. sets that."* Its hidden box is
  disabled, which `cardFormVals_` never reads.
- **On Settings,** where the rate page is still drawn for somebody with no public card, the field is
  shown as a fraction and is read-only for anybody but an admin.
- **On the server:** `seatCutRefusal_` in people.gs runs beside `pricingRefusal_`, before anything is
  written, and only when the value moved. A tutor moving it is refused (*"Only @family. sets its share of
  an extra seat. Nothing was saved."*). A value outside 0–2 is refused for an admin too. It asks
  `iAmAdmin` (the token's row), not `adminEditing`, so an admin who tutors can set their own.

**Not one of the four `PRICING_FIELDS`, and on purpose.** It is in `PROFILE_GROUPS`' rate page through
`SEAT_CUT_FIELD`, so the page and the card draw it and the allow-list lets it through. Adding it to the
four would have been wrong three ways:
- `pricingMoved_` compares with `N()`, which reads blank and 0 as the same number;
- an admin's edit would stamp `pricing_changed_at` and lock the tutor out of their own rate for a month;
- `check-handles` pins the four.

### What went

- **The admin's Settings card "Your cut of an extra child"**: `cutCard_`, `cutNow_`, `cutSay_`,
  `CUT_KEYS`, the `cut-save` handler, the `.cut-say b` rule, its exempt line in check-drafts and its UI
  state. Pages after it on an admin's Settings move up by one, once, on the visit the new build arrives
  in. `paintPager` clamps a remembered index, and nothing finds a Settings page by its number.
- **The default stays on the spreadsheet.** `B` on the config tab is still the cut for every tutor whose
  own cell is blank. Edit it there. `updateConfig` keeps its `boss_rate` support: a phone still on the old
  build posts it during the deploy gap, and the figure still means something. `CONFIG_DEFAULTS`' note for
  `B` now says it is the default, but `ensureSchema` never rewrites a note already on the sheet, so the
  live config tab keeps the old wording until somebody edits it.

### The deploy gap

- **Pages lands in a minute; `backend/` waits for a manual sync.**
- **New phone, old backend:** no `extraSeatCut` and no cut on the rate page, so prices are exactly as
  before, the cut box is not drawn, and the cut is settable only on the config tab until the sync.
- **Old phone, new backend:** the old card still posts `updateConfig`, which still works. A tutor's old
  Settings could draw the new field as an editable box, and `seatCutRefusal_` is what refuses it.
- **A Save carrying the field before `ensureSchema` has added the column** is refused with "no column
  for: extra_seat_cut", and nothing is written.

### Checks

- **check-flow, three new journeys:**
  - the cut on the card, in the quote and in the split, with blank (and an older backend sending no key)
    priced exactly as before from `B`, a tutor's own priced from it, and 0 as no cut;
  - an admin setting a tutor's cut in pounds through the real backend, with the preview, the share sent,
    the sheet, `doGet`, the card, and the pounds back to the penny;
  - a tutor seeing the cut and unable to send it, with a forced cut refused and nothing written.
- **check-profile:** the server's rules through the real `doPost`.
- **check-handles:** `seatCutRefusal_` and `seatCutOut_` as cut out of people.gs, and the cut kept out of
  `PRICING_FIELDS`.
- **check/states.js:** the rate page on Settings has 7 boxes now (the cut is one), and the admin's edit
  of a tutor's card is measured with the two pound boxes filled.

### The review, and what it changed

- **One parser for the cut, the pattern.** `seatCutRefusal_` decided "moved" with `Number()` and `seatCutOut_`
  sent with `N()`'s `parseFloat`; they disagree on `"0x1"` (1 and 0), `"0b10"` and `"0o2"`. A tutor's crafted
  post of `"0x1"` over an admin's cut of 1 looked unchanged, was written, and went to every phone as nought —
  no cut, for that tutor, by that tutor. Now only a plain decimal from 0 to 2 (`/^\d*\.?\d+$/`) is a cut, in
  `seatCutOut_` and in its phone copy `seatCutOf_` (core.js); anything else is the default, and "moved" is
  either the very cell or the same cut by that one reading. The health card (`dataProblems`) asks it too, so
  `"£0.10"`, `"10"` meaning ten per cent and `"-0.1"` are flagged and priced at `B`, never as no cut.
- **The editor draws what `seatShare_` uses.** The tutor's part was drawn `share × rate`, so a stored nought
  read "0.00" while the price used the config `c`: on Ada at £20, boxes of £0 and £2 under a seat of +£8.00.
  `cardSeatShown_` now asks `seatShare_` (`seatOwn`, `cutOwn`) and draws a part only where the price uses it as
  the tutor's own; otherwise the box is blank, "usual", and the line under the boxes names both usual amounts
  in pounds: *"Theirs: blank or £0 is the usual £6.00. @family.'s: blank is the usual £2.00, £0 is no cut."*
  £0 typed into the tutor's part is the usual share (what the price always did with it), put back to empty
  when the box is left; £0 to the business is no cut.
- **The pounds typed are kept when the rate moves after them** (they had saved a different seat by the order
  things were typed in), and a part past twice the rate is refused by the card in pounds before anything is
  sent, rather than by the server in the Settings box's fractions.
- The read-only cut on Settings says who sets it; stale `updateConfig` comments about the deleted card fixed.
- Checks: check-handles' cut cases grew `"0x1"`, `"0b10"`, `"1e0"`, `"£0.10"` and the `seatCutOut_` table; two
  check-flow journeys — a stored nought in a tutor's own part, and an admin's edit where the parts add up.
