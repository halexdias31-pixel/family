## Your roles: three ticks in Settings, and a Tutor tick is a question to the admin

**Asked for as *"each account should have a widget in account settings which say what the roles
are. they can be either a tutor or client or student. they can be tutor and client and student like
multiselect."*** A `Your roles` card on the Settings column, straight after the wardrobe: three
`.check` ticks (Tutor, Client, Student) each with a line saying what it means here, a Save tile,
and a line under it. Admin is never a tick; an admin is told it is given and kept.

**Its own action, `setMyRoles` (`self`), not a field of `updateProfile`.** `role` stays in
`PROFILE_READONLY` — that list means "an admin may write the whole cell", and what a person may do
to their own is three words of it under rules an allow-list cannot hold. No new column: it writes
`role` and, for a new tutor, `listed`.

**What a tick changes, and what stays gated** (measured, then decided):

| change | what happens |
|---|---|
| tick anything but the three (`admin`) | refused by name, nothing written. An admin's own `admin` and any `ROLE_TITLES` title are carried through every save. |
| nothing ticked | refused — an empty cell reads as `client` (`rolesOf`), so "none" would save as something not ticked |
| tick Tutor (not an admin) | `role` gets `tutor` and `listed` gets **`PENDING`**. Every reader that asks `ON_(listed)` already treats that as unlisted, so `doGet` sends them to the admin only, marked "asked to tutor", and the admin's existing Listed switch (`setListed` → TRUE) is the approval. Until then: not on Find, not bookable by name (`createJob` refuses), cannot take an open session (`move` as tutor refuses), their rate does not set the price floor (`priceLooksWrong`), messaging treats them as whatever else they are (`actingRole_`), and the phone's staff test `isTutorRole` is false (no open mark schemes, no tutor widgets). They DO get the tutor pages of Settings and the tutor agreement, to fill in while waiting. |
| an admin ticks Tutor | no wait — the admin is the person who says yes |
| untick Tutor or Client while sitting in a live session as one | refused with the count (`liveSeatsAs_`: a seat not Withdrawn, in a job not cancelled/ended and not wholly in the past). Who is in a session is folded from the events, not the role cell, so dropping the role would leave a tutor teaching on Tuesday whose own app no longer calls them one. |
| a row that is only a student ticks Client | refused. Client pays, books, claims children and may message tutors; a child's account making itself one is a child messaging adults the business has not introduced. A student ticking Tutor is allowed because it waits. |

**Why `PENDING` and not `FALSE`.** `FALSE` already means "the admin hid this tutor", and a hidden
tutor is still staff. The two had to be told apart; a third word in the same column did that with
no second switch.

**A hole found on the way and closed.** `move` with `role: 'tutor'` asked nothing about who was
posting — any signed-in parent could claim a session open to other tutors. It now needs a tutor
who is not pending, or an admin. The three `move` calls in receipt.js send `personId` as well.

Checks: `check-profile` §13 (27 rules through the real `doPost`/`doGet`), a `check-flow` journey
(the card, the post, a pending tutor is not staff), and a `check/states.js` state at four widths.
