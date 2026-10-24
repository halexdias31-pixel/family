# 432 — one rank, cleaned up: the role card, role checks by rank, Hours in the Staff hub, bare empty states

From a structural review after 400 (ranks) and 405 (the Staff hub), 24 Oct.

## 1. "Your roles": one choice, and only for a Client

The card in Settings still said "Tick every one that is you. You can be more than one." and offered three tick boxes — the
pre-400 model. Under one rank it promised things the server refuses: a Student ticking Client is refused by `setMyRoles`
("A student account cannot make itself a client"), and adding Tutor is refused for anybody but an admin (Staff only by
Apply to teach).

Now (`rolesCard_`, me.js), by rank:

- **Client:** one choice of two, radios — Client or Student — and Save. The Student option says only @family. can change a
  student account back, because the server will not let it return.
- **Student:** no picker; one line, "A parent links you to their account from theirs."
- **Staff:** no picker; a line saying the hours, pricing and terms are in the Staff hub.
- **Admin:** no picker; "You are Admin. That is given by … and is not changed here." (`brand('name')`).
- **A waiting Tutor from an old row** (rank Client): the Client choice, the waiting line, and the post carries `tutor`
  alongside the choice so the waiting row is kept, not dropped (`rolesPicked_`). Adding Tutor stays refused server side.

`ROLE_PICKS` stays for its labels (`peopleRolePicks_`, the admin's people editor; check-signin reads them). The card's
title stays "Your roles": `makeChild`'s refusal (dopost.gs) names it. That refusal tells a tutor to "Tick Client under
Your roles", which Staff can no longer do from the card — left for a backend change, not made here.

## 2. Role checks that bypassed the rank

Switched to `rank_()` / `rankAtLeast_`, behaviour kept:

- `mayJourney_` (arcade.js): `hasRole('student') || hasRole('admin')` → `rank_() === 'student' || rankAtLeast_('admin')`.
- The receipt's "no children on your account" note (receipt.js): `norm(USER.role) !== 'tutor' && !== 'kid'` →
  `rank_() !== 'staff' && rank_() !== 'student'` (an admin still sees it, as before; a waiting tutor now does too, being
  a client).
- `isAdmin` (data.js): `roleOf(USER.role) === 'admin'` → `rankAtLeast_('admin')`.

## 3. Teaching hours: one place, the Staff hub

The week a tutor teaches was set in two places — the `avail` Tools widget (map.js, `initAvail`) and the Settings week grid
(`fieldsHtml`'s timetable group) — and in neither of them was it next to the rest of a tutor's working setup. Hours is now
the Staff hub's fourth part (`HUB_PARTS`: Terms, Hours, Pricing, Statement; `hoursHtml_`, staff.js), drawn by the same
`availGrid_` over your own row and saved by `me-save` → `updateProfile` → `availGridIn` into `people.availability`, as
before. Data and backend are unchanged.

Removed: the `avail` widget and `initAvail`; the Settings week group for anybody `hubFor_()` (a row with hours and no hub,
such as an admin who does not teach, still sees it). The card editor's **Available** section (your own card's Edit, and an
admin editing a tutor's card) is left as it was — it edits the card a family sees.

While the payload is on its way Hours is `loading_()`; a payload with no hour codes (an older server) says "This server
sends no hours to set." — the `initAvail` sentence and its check-loading exception went with it.

## 4. Empty states: the title and one line

Saved ("Nothing kept yet.") and Spotlight ("Nothing is being featured just now.") lost the faint sentence under them; the
Spotlight one also hard-coded "@family.". The admin's how-to-fill line on an empty Spotlight went too.

## Checks

check-flow: the roles card journey and the refused-save journey rewritten for the one choice; the journey card journey's
step 3 makes the student a client as an admin would (no picker to do it with); the payload-retry journey asks
`hoursHtml_` for the loader; a new "Staff hub hours (432)" journey ticks an hour and reads `availability` on the server row,
and asks that Tools has no `avail` and Settings no week for a tutor. check/states.js: the roles state is one choice; the
hours state moved from Tools to `account` as "the Staff hub, hours". css 2026-10-24-h-one-rank-hours.
