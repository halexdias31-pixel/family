# 373 — an admin adds, edits and deletes people from the people column

The owner, 19 Oct: "I need to start having the website be able to create new people. Like I myself need
to be able to add new people. I think best layout for this is to add a plus widget above all the people in
the people column for admin. Honestly this principle needs to be incorporated in a lot of places on site but
for now just do there... And I can add or delete or edit people from admin account."

**Where.** The people column is the You screen (`account`, `accountPages_` in js/find.js). For an admin, a
"+ Add a person" card sits after your own card (and the Setup card) and above everybody else — your own
card keeps the top because it carries Sign out. Nobody else is drawn it.

**The "+" is a helper.** `addCard_({ act, label, data })` in js/tiles.js: one card, the whole of it the
target, a gold-ringed plus and the words. Only the people column uses it now; another list adopts it by
putting `addCard_(…)` first. CSS `.add-card`.

**The form** (`personFormHtml_`, js/me.js) opens in place — the "+" card's place for a new person, the
person's card's place for an edit, the way `cardEditHtml_` already edits a card in place. Boxes: first
name, last name, four role ticks (Student, Client, Tutor, Admin — the roles card's own words, `ROLE_PICKS`;
a person may hold several), email (optional), date of birth (optional, a date picker), and for a student
their parents: the linked ones ticked (untick to unlink) and a list to add one. Buttons Save / Cancel
(a form has buttons). An edit says "Their handle stays @…": a first name corrected does not move the
handle. The form's boxes are exempt from drafts (check-drafts) for `rolesCard_`'s reason.

**Tiles.** Under every other person's card, for an admin only: Edit (the person mark, "name, role,
email" — the pencil is already a tutor card's own Edit) and Delete (bin, danger). Not on your own card.
Delete asks once in a sheet — "Delete Nia?" / "This can't be undone." — Delete or Cancel.

**Server** (backend/dopost.gs, helpers at the foot of people.gs), all three `admin` in `ACTION_ACCESS`,
so the gate refuses anybody whose token is not an admin's before the handler runs:
- `personGet {targetId}` — the person as the form reads them (`lastName` is a box the child-name net
  leaves whole, `kidWholeOk_`) and the parents a child can be put on.
- `personSave {targetId?, firstName, lastName, roles, email, dob, parentIds}` — no `targetId` makes a
  person: `handleMake_` (372's template, `joined_on` today), a fresh PIN from `authFreshPin_` shown once on
  a slip (0000 is refused by `pinWeak_`, so "the rule the app already uses" is New PIN's), `came_from:
  admin`, `verified: TRUE` — an address an admin typed is vouched for. An edit writes the cells by
  `setCells`, keeps the handle, puts the old whole name on `name_was` as `updateProfile` does, and a
  changed email is vouched for too (any move waiting on a link is dropped). Refused: no name, no role, a
  bad or already-used email, a whole name already on the tab, a bad birthday (`dobRefusal_`), your own row
  (your card's own Edit does that), taking admin off the last admin, and a parent whose address is
  unproved (`linkChild`'s rule). `parentIds` makes the accepted links exactly that list.
- `personDelete {targetId}` — never yourself, never the last admin; every family row naming them goes
  (through `delRow`), their sessions end, then the row. Bookings, messages and submissions keep the name
  they had. The last-admin refusal cannot be reached by an admin today (they are an admin too, and may not
  delete themselves); it stays as the rule, should the self rule ever move.

The reply carries the person in `everyone`'s shape, so the column shows them at once (`peoplePut_`) and
`load()` then brings the payload.

**Checked.** check-profile §19 (through the real doPost: each action refused for a parent and a tutor
with nothing written; made with a template handle and a PIN that signs in, linked to the ticked parent;
edited without moving the handle; unlinking; one email for two refused; deleted with the family rows;
never yourself, never your own admin, never a name twice). check-flow: an admin adds (slip, in the list
before the payload comes back), edits (filled in, handle note, new name drawn) and deletes (asks first,
then gone); a student and a tutor see no +, Edit or Delete and their presses post nothing. Mutations: the
`personSave` gate opened to `self`, and `peopleTiles_` without its admin test, each turned a check red.

Deploy: backend changed — all four stamps `2026-10-19-j-people-admin`.
