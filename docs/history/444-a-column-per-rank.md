# 444 — A column per account: Student, Tutor, Parent, Business

## What the owner asked (25 Oct)

> The account and settings widgets are dynamic — one column whose contents change with rank, so a tutor
> sees the child things plus extra settings mixed in. "It becomes really messy and hard for me to know
> what's going on."

Then: the columns are **Student, Tutor, Parent, Business**, and "things centralized in one place … I don't
want two places for the same thing." And: "I want the tools column to be near the finder column, so if
they need a whiteboard, they can quickly go to and use the whiteboard, and then come back to their
question quickly."

## What changed

- `TAB_ORDER` ends `account (Student) · staff (Tutor) · family (Parent) · biz (Business)`. The Settings
  column (`settings`) is gone: its cards are on Student, under your card. `columns.json` lists the same.
- **Tools is beside Find, on its left**: `tools, stuff, res, saved, progress`. One swipe from a question
  to the whiteboard and back; Find 2 keeps the place immediately right of Find (the owner, 12 Oct; 347).
- Every signed-in account sees Student, Tutor and Parent. A column above your rank draws one card
  (`rankOffCard_`, me.js): its title, "This column is for a … account, not yours", and the next step —
  on Tutor, Apply to teach (`applyCard_`; a child gets the sentence alone); on Parent, "A parent links you
  from theirs." Signed out, each says to sign in on Student.
- **Business stays admin-only and hidden for everybody else** (`columnsFor_`, unchanged). Decided over a
  title-only column: it carries the admin's private loaders (records, applications, staff, reports,
  imports) and a column that only ever says "not for you" is clutter for every family on the site.
  Business now also holds + Add a person, everybody's cards (Edit, Delete, New PIN, Send last week) and
  the build stamps (`adminPages_`).
- **Parent is its own column**, between Tutor and Business in the order the owner gave (rank order would
  put it before Tutor; the owner's listing wins). Staff rank is above Client, so a tutor sees Parent
  drawn — title-only when they hold no client role.

## Inventory — every widget and setting, one column each (by the lowest rank that has it)

| Widget / setting | Was | Now |
|---|---|---|
| Find someone by handle (the box; Find + "Add as my child" inside it for Client+) | You | Student |
| Your own card (picture, figure, name, handle), Edit, Sign out, Send the link again | You | Student |
| "We will email you once you open the link" line | You | Student |
| A parent's claim ("X says they are your parent") | You | Student (it is the child who answers) |
| Your parent / brother or sister cards | You | Student |
| Your details: About you (non-tutor fields), Contact & address, exam dates, date of birth | Settings | Student |
| Signing in (PIN) | Settings | Student |
| Your roles | Settings | Student |
| Notifications | Settings | Student |
| The tutors' cards (the directory everyone can read) | You | Student |
| Your tutor card and its Edit (headline, photos, words, at a glance, qualifications, venues, travel, class size) | your card's Edit on You | Tutor |
| Staff hub (terms, hours, pricing, statement) | a tile on your card | Tutor |
| Share my profile | a tile on your card | Tutor |
| "Not agreed to the tutor terms" line | under your card | Tutor |
| Tutor-only settings for a staff with no public card (rate group, qualifications, where you teach, …) | Settings | Tutor |
| Apply to teach / where your application stands | You | Tutor (its below-rank card) |
| Your children's cards | You | Parent |
| Manage your child (make, list with New PIN, held for the link) | Settings | Parent |
| Profit, Setup, Posts waiting, Applications, Staff, Reports, Library import, the records, Verse | Business | Business |
| + Add a person, everybody's cards with Edit / Delete / New PIN / Send last week | You (admin) | Business |
| Build stamps | Settings' Signing in (admin) | Business |

A tutor's fields are split from a group by the backend's own lists: a field is a tutor's when neither
`clientFields` nor `studentFields` has it (`staffField_`). A split "Contact & address" is "Where you teach"
on Tutor.

## One place each — the duplicates removed

`check-flow` "A column per account (444)" collects every editor (`data-me` boxes, the hub's pricing sliders,
the PIN) on every column, on your card's Edit on Student, your tutor card's Edit on Tutor and the hub's
Hours and Pricing, for a student, a client, a tutor and an admin, and fails if a field is edited in two
places. Run against the code before this change it named 72 fields for a tutor:

- **Rate (`rate_per_hour`) and extra seat (`extra_seat_rate`)** — on the card's Edit *and* the hub's
  Pricing. Now the hub alone (`hubOwns_`); the card's rate section keeps class size and the shown cut.
- **Availability (all 70 hour codes)** — on the card's Edit *and* the hub's Hours. Now the hub alone. (The
  Settings week was already dropped for staff in 432.)
- **Name, picture, figure, handle vs. what you teach** — one card editor held both; now Student edits the
  first four (`OWN_CARD_SECTIONS_`) and Tutor the rest (`ownCardSections_(col)`, `CARD_EDIT.col`).
- An admin with no Staff hub keeps rate and week on their tutor card — still one place.

Kept as distinct controls, not duplicates: an admin's New PIN on anybody (Business) and a parent's New PIN
on their own child (Parent) — different powers over different people; reading a value elsewhere (a card
showing the rate) is not editing it.

## Checks

- New journey: "A column per account (444)" — the right columns per rank, the right empty state above it,
  Business only for an admin, and the one-place rule.
- Journeys moved to where things now are; the tutor-card ones edit on Tutor (`cardOpen_(…, { col })`),
  the seat-cut journey became "a tutor's seat is set in the Staff hub alone".
- `check/states.js`: the old Settings states run on Student, Tutor or Parent by a `col` tag; hub states on
  Tutor; Manage your child on Parent; the admin's people on Business.
