# 405 — the Staff hub: tutor terms, pricing with where the money goes, monthly statements

Asked for, 24 Oct, after 400 left "Hooks for the Staff hub" in `docs/accounts.md`: Tutor Terms & Conditions instead of a
contract, a pricing setup with a live breakdown of each booking's money, monthly pay statements, and a one-tap Message on
tutor cards. For rank Staff and an admin who teaches.

## Where it is

A **Staff hub** tile on your own card on You, beside **Share my profile** (`hubTile_`, staff.js, from `cardActions_`'s `me`
branch). It opens one sheet with three parts, switched by a row of tiles: **Terms**, **Pricing**, **Statement**
(`hubOpen_`, `hubHtml_`). A sheet, not three more pages of You: the column is a list of people, and a page count that
grows by three for a tutor would move every journey and layout state that counts it. The gate is `hubFor_()`:
`rank_() === 'staff'`, or an admin who holds Tutor. The server gates each part again.

## 1. Tutor Terms & Conditions

The old tutor agreement (ten points, a "Draft" tick in Settings that could never be ticked again, `AGREEMENT_POINTS`) is
gone. In its place, `agreementCard_` in staff.js draws readable terms: about these terms; self-employed (independent
contractor, own tax and NI, Self Assessment, no holiday or sick pay); bookings; cancellations (24 hours); pay and the
business's share (the first seat's rate plus the tutor's part of each extra seat, @family.'s share of each extra seat,
room hire passed on, card fees out of @family.'s share, a rate change once a month for new bookings, a statement not a
payslip, no private payment, 6 months' non-solicitation); safeguarding and DBS; conduct; data protection; ending the
arrangement (2 weeks, or at once for a serious breach); changes to these terms.

**Where the words live.** `brand('tutor_terms', TERMS_DRAFT)` and `brand('tutor_terms_version', TERMS_VERSION)` — two
keys the owner can add to `data/settings/brand.json` (a "## " line starts a section; "- " lines are a list; `**bold**`),
with the draft in code behind them (the house rule: every `brand` call has a fallback). The default version is
`v1-2026-10-24`.

**A version is not a bare date.** The first version tried was `2026-10-24`; the fake sheet — like Google Sheets — stored
it as a date, so `agreement_version` came back as `2026-10-24T00:00:00.000Z` and never matched again: the tutor would be
asked forever. `termsVersion_()` prefixes a bare date the owner types (`2026-11-01` → `v2026-11-01`).

**I agree** (`agree-sign`) posts `signAgreement` with the version; the server records `agreement_signed_at` and
`agreement_version` on the people row (columns that already existed). `signAgreement` used to answer "already" to any
second tick; now "already" is only for the same version — a new version is a new tick and replaces the record. When the
version changes, the phone compares `USER.agreementVersion` with `termsVersion_()` and asks again.

**Until agreed — the less disruptive choice:** the tutor stays listed. One line under their card's row on You
(`hubWarn_`, red) says the terms are not agreed (or have changed), and the Staff hub tile says "terms to agree". The admin
sees it in **Business → Staff** (`staffCard_`): every tutor, "Not agreed" / "Old terms" beside them, and the card glows
"N not agreed to the terms" through `bizNeed_('terms', …)`. Its data is a new admin-only doPost, `listStaff`
(every Staff member and admin holding Tutor — not a waiting applicant — with name, handle, rank, agreed version and time); the phone does the comparison, so the register never needs to know
which version is current.

**The owner should have the draft checked once** by somebody qualified in UK employment status and contracts before
relying on it — the "Draft" badge shows while the words are the code's own, and goes when `tutor_terms` is set.

## 2. Pricing, with where each booking's money goes

Two controls, each a slider and a number box (the Profit card's `pf-var` look): **your rate, £ an hour** and **each extra
seat adds, £ an hour** (stored as the share of the rate the sheet holds, `extra_seat_rate`; 0 is the usual `c`). A room
picker (venues with a rate, the tutor's own first; or none). Under them three stacked bars — an hour's booking for 1, 2
and 3 students — split into **You**, **Room**, **Card fees** and **@family.**, with the figures under each.

**One formula.** `priceSplit_` calls `priceFrom` with `spec.tutorRow` — a new, optional field: the row being typed,
used in place of the saved one — for one session of one hour, and reads its `earn` (`bookMoney_`): `tutorPayout`,
`venue`, `cardFees`, `net`. Nothing in staff.js adds up money. With one student @family. keeps no share and still pays
the card fee, so its figure is negative and a line says so.

**Animated, in place.** `priceRedraw_` changes only widths and words (`.pb-seg { transition: width .35s }`, off under
reduced motion), so the slider stays under the thumb. Validation as typed (`priceWrong_`): more than £0, at most
`STAFF_RATE_MAX` (£200), a seat £0 to twice the rate. **Save** goes through `updateProfile`, the card's own door, so the
server's rules apply: once a month (`pricingRefusal_`), a seat at most twice the rate, @family.'s share admin-only. New on
the server: `pricingRefusal_` refuses a rate that is not a number, is negative, or is over `RATE_MAX` (200) — before, a
typed "2500" for "25.00" would have been published.

## 3. Monthly statements

doPost `payStatement` (`self`): `{ month: 'YYYY-MM', tutorId? }`. The handler resolves the asker from the token; a
non-admin naming anybody else is refused (`why: 'own'`), a client or student is refused (`why: 'staff'`); an admin may
name any tutor. `payStatement_` (booking.gs) takes every paid booking (`jobStatusOf === 'active'`, not a waiting list)
on which that tutor is the confirmed tutor, and each of its dates in the month: date, session (level and subject),
hours, students (the children ticked, else the families), and the booking's family price, business share and tutor pay
shared evenly over its dates — the same sharing as `profitActual_` on Business. `price_total`/`tutor_pay`/`admin_profit`
first, the frozen `gross`/`tutor_payout`/`net_profit` (353) where those are blank. Totals are the sum of the rounded
rows. No family names are in it.

On the phone (`stmtHtml_`): a month picker (this month and the eleven before), the statement on paper (the paper palette,
`.stmt`), and **Download PDF** — `window.print()` over a copy at the end of the body with everything else hidden
(`body.printing-stmt`, the way the mat prints), A4. No library. It is called a statement throughout and says it is not a
payslip. The admin opens any tutor's from the Staff card's **Statement** tile.

## 4. Message a tutor

The Message tile was already on every tutor card for anybody signed in, and opens the conversation sheet. A child's phone
drew it too, and the server refuses a student writing to a tutor (`MESSAGING.student` is the admin alone), so the tile
now follows the rule: not for a child (`childView_()`) unless the card is the admin's. Nobody gains a door.

## Checks

- `js/check-staff.js` (new, in check-all), the real doPost: terms-1 recorded with its time; terms-1 again "already";
  terms-2 replaces it; myProfile carries it; no version refused; a client refused; `listStaff` admin-only, staff only
  (no client, no waiting applicant).
  Pricing: "abc", "-5", "500" and a seat past twice the rate refused; a tutor setting the cut refused; 24 with a 0.25
  seat saved and in the payload; a second change inside the month refused. Statements: Ada's October is her three paid
  sessions (not the unpaid booking, not Ben's), each a quarter of the booking, the totals their sum; November holds the
  fourth date; Ada asking for Ben's refused; Ben sees his own; a client and nobody refused; the admin reads Ada's; a
  non-tutor and a bad month refused; `STAFF_RATE_MAX` equals `RATE_MAX`. Mutation: the own-only line removed → red
  (Ada was sent Ben's); restored → green.
- check-flow, four journeys: the tile beside Share my profile, the not-agreed line, the terms' sections, I agree posting
  the version and the server recording it, a new brand version (a bare date) asking again and replacing the record, a
  client with no hub; pricing's bars equal to `priceFrom` (2 students: £50, you £30, room £15, fees £1.20, @family.
  £3.80; one student −£0.90), the slider kept while the bars move, £500 refused unsent, Save posting rate 24 and the £10
  seat as 10/24 and the row written; the statement's two rows and totals from the real doPost, another month asked, the
  print copy made and removed, the admin's Staff card glowing "2 not agreed" and opening Ada's by id; a client's
  Message tile opening the conversation, a child without one for a tutor but with one for the admin. The business
  journey now wants twelve pages (Staff after Applications).
- check/states.js: the agreement's Settings state is replaced by three account states — the hub's terms agreed, its
  pricing, a statement — as the fixture's admin given Tutor for the visit.
- check-drafts lists the hub's sliders and boxes as exempt (moved and saved in one sitting); check-handles grabs `RATE_MAX`.

Stamps `2026-10-24-d-staff-hub`, all four; css `2026-10-24-d-staff-hub`.

## Deploying

Push for the site. Merge, then Apps Script ↓, Deploy → New version (`payStatement`, `listStaff`, the version-aware
`signAgreement`, the rate refusal). No new tab or column. Every tutor, the admin who teaches included, is asked to agree
once (the old "draft-2026-09" is a different version). To change the terms later: edit `tutor_terms` and bump
`tutor_terms_version` in `data/settings/brand.json`.
