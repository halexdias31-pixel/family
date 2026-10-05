## Handles sign everybody in, an admin sees everyone, and Level comes before Key stage

The owner: *"have the students be able to login with their handles too."* *"Admin should be able
to see every one in the people column."* *"Some worksheets are key stage 4 and 3 … key stage 3 and
4 shouldnt come before like the level … I prefer GCSE or SATs over grey areas."*

**Handles (backend/dopost.gs `verifyLogin`, `forgotPin`; js/me.js).** The handle door existed
only for rows with a blank address, on the argument that "an account that has an address can only
be reached by it". That argument was about collision, and collision is answered without it: the
handle branch only runs when what was typed has no `@`, and a handle can never hold one. So the
handle is now looked up across every row — case-folded and trimmed by `key()`, a leading `@`
dropped because every card prints a handle as `@ada_kind7`. The wrong-PIN sentence names the door
that was used. Disclosure is unchanged: an unknown handle answers `not-an-email` exactly as an
unknown address answers `no-such-email`, and the per-person throttle meets both doors the same way.
`forgotPin` by handle sends to the row's own address when it has one (the inbox the address door
would reach — nobody new) and to accepted parents otherwise. Fixed on the way: that mail's body
named an undeclared `pin`, so the ReferenceError was swallowed by the quota `try`, the PIN WAS
changed and nobody was sent it. Checked: check-handles (handle and address land on the same row;
case, `@`, spaces; wrong PIN wording; PENDING), check-profile §11 through the real doPost.

**Everyone (backend/doget.gs, js/find.js `accountPages_`, js/cards.js).** `doGet` sends an
admin-only `everyone` list — id, name, handle, role, photo, nothing private — of every row that is
not a tutor or admin (those are already on `tutors`, unlisted ones included for an admin). The
column draws them after the tutors through `findCard`, with a Message tile and no Listed switch.
`isAdmin()` on the phone is not the gate; it stops a list left over from an admin's session being
drawn for the next person on the same phone. The first screenshot showed each student told it
"hasn't set their hours yet, so can't be booked by name": `profAvail_` now draws nothing for a row
with no `avail` key, which only tutors are sent. Checked: check-profile §10 (admin token gets it,
student/parent/stranger do not, no field beyond the five), check-flow journey.

**Level before Key stage (js/find.js).** The sheet already orders Level (50) before Key stage (60),
but Level was skipped on every primary list: 1,160 primary worksheets carry a key stage and no
level, under the 50% coverage bar, so the funnel fell through to `KS1 | KS2`; and inside GCSE it
asked `KS3 | KS4` of the 737 sheets tagged `KS3, KS4`. Now `levelOf_` takes a level from the school
year (Y1–2 KS1 SATs, Y3–6 KS2 SATs, Y7–9 KS3, Y10–11 GCSE) or, failing that, from the top of the
key-stage range (KS4 GCSE, KS1/KS2 SATs, KS5 A-Level, KS3 stays KS3 — it ends in no exam, and
inventing one would be a wrong fact). Key stage moved after Level in code too, and is silent on any
row whose level is a qualification; dropping only the key stage the level names was tried first
and left `KS2 | KS3` inside GCSE (17 GCSE-levelled sheets carry KS2). The Level buckets read `KS1
SATs` / `KS2 SATs`, and a card's crumb shows the level rather than `KS3, KS4`. Closed vocabulary in
check-library unchanged — the key-stage cell is untouched; only how it is presented moved.
Checked: check-funnel (order in code and live, no key stage without a level, no bare KS level,
Key stage asked inside 0 levels).
