## A student sees their parents and a parent their children, and a pending claim had been killing the child's payload

**Asked for as "students should be able to see their parents and likewise".** The sign-in reply
already carried `parents` and `children` as NAMES (for the booking form). A card needs a
photograph and a handle as well, so `doGet` now sends **`payload.family`**:
`{ personId, title, relation: 'parent' | 'child', handle, image }` for the signed-in person's
**accepted** links in both directions, through `acceptedParents` / `acceptedChildren` — the same
two readers the sign-in reply and the exam diary use. It is built from `meAsked` (the TOKEN),
never `?person=` / `?name=`; a stranger gets `[]`; an admin gets their own family and nobody
else's. No e-mail, phone, address or birthday goes on it.

**A key of its own rather than rows on `payload.students`**, because that list goes to every
student for the friend search: a parent's row put there would be a parent sent to every child.
The cache is keyed on the token's person (`payloadKey_`), so one family's list cannot be handed
to another.

**`accountPages_` draws one `findCard` per entry, between your own card and everybody else**,
headed `Your parent` / `Your child`. A parent who is also a tutor is drawn ONCE, from their
tutor row with its tiles and the label in front of the role, and removed from the tutor list
below. An older backend sends no key, and `Array.isArray` draws nothing.

### `familyFor` — the list says whose it is, because `DATA` outlives a sign-out

**Found by the review, and it is a cross-family disclosure on a shared phone.** Sign-out sets
`USER = null` and keeps `DATA`; sign-in paints at once and fetches the payload after. So a phone
handed from a parent to another family's child drew the parent's children as "Your child" on the
child's column until the new payload landed — about fifteen seconds — and for good if it never
did. `doGet` stamps `payload.familyFor` with the id it built the list for (set whenever there is a
token's person, `''` otherwise), and the column draws the family and the claims only when that is
`USER.personId`. A list stamped for somebody else, or by nobody, draws nothing.

### `payload.claims` was never in the literal, so a pending claim broke the whole payload

`doGet` pushes a child's unanswered "this is my child" rows onto `payload.claims` — and the key
was never declared. So a student with one `asked` row on the family tab (the ordinary first half
of linking a family) was answered `{ error: "Cannot read properties of undefined (reading 'push')" }`
instead of a payload. `claims: []` is in the literal now.

### And nothing drew a claim, so no family could ever form from the app

**The other half of the end-to-end path, and it was missing.** A parent presses `Ask them` on the
Settings column and is told the child "will see it when they next sign in". The only thing that
drew a claim was `meRest_` in me.js, and nothing calls `meRest_` — the old You column it fed is
gone. So every request sat at `asked` for ever, no link was accepted, and the family cards above
could only come from a row typed into the sheet. `check-doors.js` could not say so: `claim-yes`
is a string in the markup, so it reads as a door whether or not anything draws it.

**`claimCard_` in me.js is the one renderer**, and `accountPages_` puts one card per claim straight
after your own (`Bea Parent says they are your parent`, `Yes` / `No`), held to the same
`familyFor` stamp. `answerClaim_` goes through `send_` now, so both buttons lock while the answer is
on the wire, and the answered card leaves the column at once with `repaint(true)` — a page has
gone, so the column is placed again — rather than when the payload lands. The server already
refused anybody but the named child; the check now proves it.

### Checked through the real `doGet`

`check-profile.js` case 10: two families on one tab, plus an `asked` and a `refused` link naming
the other family. A student sees their parent and not the other parent; a parent sees their child
and not the other child; a stranger whose URL names the student sees nobody; no private field on
any card; every list is stamped with the token's id (`''` for the stranger). The asked claim goes
to the child it names and to nobody else; the parent who asked cannot answer it; the child's Yes
puts that parent on their list and empties their claims. **Proved by mutation**: asked/refused
links counted, built from `?person=` (also named by `check-backend.js`), `familyFor` not set,
`claims` uninitialised.

`check-flow.js` ("a student sees their parents, a parent their children") asks the drawing: one
labelled card per entry, nothing without the key, nothing for a list stamped for somebody else or
for nobody, no card for yourself, a tutor-parent on one page, a claim drawn on the child's column
and not on a list stamped for somebody else, and Yes posting `answerClaim` with that row and
taking the card off. Proved by mutation (the stamp test removed; the claim pages dropped; the
answered claim left in the list). `check/states.js`'s `account · your family, a card each` seeds
a parent, a child and one claim, lands on the claim, and its `leave` repaints with `repaint(true)`:
a bare `paint` left the card in front where the old page 2 was, and COLUMNS OUT OF LINE said so.

**What is left.** The backend must be pulled and deployed before any of this reaches a phone;
until then no `family` key arrives and nothing extra is drawn. `BACKEND_VERSION` was not bumped,
so a payload already cached under the old code (up to six hours) is served without the key until
the next write retires it. `payload.students` still goes to every student and parent for the
friend search, with `siblings` on each row — wider than one family, pre-existing, and the friend
search depends on it.
