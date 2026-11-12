# 342-a-child-s-handle-carries-no-name (part 2 of 2)

Continues [part 1](342-a-child-s-handle-carries-no-name.md).

### After review (round 2)

A verifier read `3b8c032` and `954177c` and found three should-fixes, each reproduced on that head first with
its own probe (invented people only) before anything changed. Each fix has rules that were red on the head's
own backend and are green now; the mutation table below is the rest of the proof.

**R1 — a child deciding whether a grown-up is her parent saw only their first name** (introduced by this
branch). The claim card ("<from> says they are your parent", Yes / No) is the one place a child vets a
grown-up, and a yes gives that account her bookings, her progress and `resetPin` over her — they choose her
next PIN and can sign in as her. §5 cut every private grown-up's surname to "first name, to anybody but
themselves and an admin", so a stranger who registered as "Pip <anything>" (the first name every roster
shows other families) sent a card reading `Pip (@pip_brave77)` beside her own parent's `Pip (@pip_kind42)`
— at cafb838 it said `Pip Strangeways`, and `register` refuses a whole name that is already an account, so
the real parent's could not be borrowed. With her parent not on the sheet it read just `Pip`.
- **Decided: a child sees the WHOLE name of every grown-up on a family row that names her as the child,
  while it is `asked` or `accepted`** (`netKin_`, beside `netSeesWhole_` in people.gs). Asked, because that
  is the card she is deciding on; accepted, because her own parent is not the awkwardness the owner
  described (that is a child called by her first name beside a parent called by his whole one, in front of
  OTHER people) and is the name she tells the next claim apart by. Not `refused` (a no is the end of it) or
  `held` (an admin is still settling it). Not the other way round — a child's surname is nobody's, her own
  parent's included (333). Not a sibling or a co-parent, whom the family tab joins only through her. A
  family row is only ever written by the grown-up's own action (`claimChild`, `makeChild`, their inbox
  opening the link) or an admin (`linkChild`), so no child can put a stranger's name in front of herself.
- **One rule, every exit:** it is in `netSeesWhole_`, which `nameFor_` and the net (`kidNamesSpans_`)
  both ask, so the card, the payload, the kept payload, the sign-in reply, `myProfile`, the "Someone has
  added you" email (judged by its recipient, `mailViewer_`) and every other place the child is sent that
  grown-up agree. One pass over the family tab per viewer, dropped by a write to it (`kidMemoDrop_`).
- So §5's "who still sees a private grown-up's whole name" is now **themselves, any admin, and a child on
  their own family row**, and §5 and note 333 say so.
- **Ledger snapshot** (counts only): 10 family rows, all accepted, each with a private grown-up on it; 7
  children now see a parent's whole name on their own screens; 0 claims waiting.

**R2 — `?run=kidHandles` gave every child who never chose a look a different figure** (introduced by this
branch, and Randomise's since Randomise existed). A blank `avatar` is drawn by `avatarConfig` (js/links.js)
with its skin and hair colour picked by `hashOf(handle)` — on the child's own card and wardrobe always, and
to everybody else once their picture is the figure. A new handle was a new skin tone, and the preview said
nothing. The Ledger snapshot: 8 children, all 8 with a blank look and no photo.
- **Decided: every handle the server moves writes the look the old one drew into a blank cell, in the write
  before the handle** — `kidHandles`, `randomiseHandle` and `renameHandles` all through one helper,
  `handleFaceKept_` (people.gs), in `saveAvatar`'s packed shape: every slot at its free default, the two
  colours the old handle hashed to, shirt 0. The face changes when somebody changes it in the wardrobe, never
  because a handle moved. A look somebody chose is left alone; a row with no handle was drawn from its NAME,
  which is a different string to every viewer, so there is no one face to keep and nothing is written.
- **The server carries a copy of the phone's hash and palette lengths** (`FACE_SKINS = 6`, `FACE_HAIRS = 7`,
  FNV-1a as `hashOf`), because it cannot read js/. Two copies of a rule is what this repository usually
  refuses; `check-signin.js` holds them together by drawing every face with the phone's OWN `avatarConfig`
  and `hashOf` cut out of js/ — twenty handles, each the same face before and after.
- **The preview says it**: `figuresKept`, and a sentence in `means`. Apply reports it too.
- **Randomise sends the kept look back** as `avatar`, and the phone takes it into a blank look; a phone
  signed in before the move takes `profile.avatar` from `myProfile` along with the moved handle (only into a
  blank look, so a wardrobe save in flight is not undone). A sign-in by the old handle already carries the
  row's `avatar`.
- **And `fix-card-settings`' `avatarKeep_`** (note 339 §2), which keeps the face on the phone for Randomise:
  after the merge it finds the look already set from the answer and does nothing; against a backend not yet
  pulled it still does its job. See "Merging" below.
- **Ledger snapshot** (counts only): the preview says `figuresKept` 8; an in-memory apply wrote 8 kept looks
  and moved 8 handles; 0 children had chosen a look.

**R3 — the name-clash pause was an off switch any signed-out caller could flip** (introduced in round 1).
Five clashes a day with a private whole name refused EVERY new account and every `makeChild` for 24 hours,
and the verifier supplied all five from one row of their own: register a child through the `parent_email`
door, then send the same name five more times — that door has no address of its own for the address check
to ask. Nothing showed an admin the counter or cleared it. And round 1's note overstated the fix: "a fresh
address per guess" is wrong on the child's door, where one grown-up's address serves every guess; and 333's
"no longer do" — the doors still confirm a name, by refusing.
- **Decided: (a), the pause is gone** — `nameClashNoted_`, `nameClashPaused_`, `NAME_CLASH_MAX` and the
  `NAME_CLASHES` property. Why not (b), a pause one caller cannot trip: any counter every caller shares can
  be filled by one caller. Counting each row once, only confirmed rows, only rows older than the window,
  still leaves it trippable by somebody who made five accounts the day before — five clicks on their own
  inbox — and the price is a counter, a window rule and an admin job to clear it. And it never bounded the
  guessing: `claimChild` answers "No student called …" to any confirmed parent and writes nothing on a miss.
  An off switch for every family's sign-up is worse than the oracle it slowed.
- **Why not the rest of (a), "answer a clash the way a miss answers"**: a miss writes a PENDING row, and a
  PENDING row signs in (6 Oct) — so the caller tells a made-up success from a real one by signing in with
  what they typed, one request later. And a real family whose name clashes would be handed a handle that does
  not exist. So a clash keeps its refusal, in the one sentence any clash gets, naming nothing.
- **What is left, said honestly** (P3 and 333 now say it): a refusal means "one of these is taken" — at
  `register` for anybody, at `makeChild` and `claimChild` for a confirmed parent. On the child's door a hit
  writes and mails nothing, a miss writes a PENDING row and mails the grown-up's address (which an admin
  sees). Closing it would need two accounts to share a whole name, not done: `findPerson` and `notify`
  resolve people by name.

**Checks added, each red on `954177c`'s backend and green now:**
- `check-surnames.js` section 9 (the claim card): a second Pip says a word under Wren's post and claims her — her sign-in reply, payload,
  kept payload and `myProfile` name him `Pip Ollerton`, and her own parent `Pip Ashdown`; the email that
  tells her names him whole; a stranger, another student, the other Wren, her own parent, another parent
  and the tutor are sent no `Ollerton`, and no email but hers, his and an admin's carries it; after she says
  no, nothing she is sent names him whole — his comment is `Pip (@pip_bold55)` to her again. (The comment is
  what makes that last rule ask something: without it a refused claimant had nowhere left to be named, and
  counting `refused` as family stayed green — measured, then fixed.) Section 7 now exempts the viewer's own family row from the hunt (Pip
  for Wren; the one claim email for Ola, whom she refused) and asks that Wren's card for Pip and Pip's
  comment, to Wren, are whole — and that to another family's child the comment is "Pip".
- `check-surnames.js` section 8: the child's door with a grown-up's address already on the sheet and a
  guessed real name gets the sentence any clash gets, writes nothing, mails nothing; one caller repeating
  their own name six times and guessing real ones six times pauses nobody — an innocent family registers
  and a parent makes her child's account after it; nothing counts clashes in the script properties.
- `check-profile.js`: the claim a child is sent names the parent whole (it was `Bea`, now `Bea Parent`).
- `check-signin.js` section 12 (the face): twenty children and a chosen look, a child with no handle and a
  grown-up — the preview counts 20 and writes nothing; apply keeps 20 faces (drawn by the phone's own code),
  leaves the chosen look and writes nothing for the child with no handle; a sign-in by the old handle and
  `myProfile` carry the kept look; Randomise on a blank look keeps the face and sends it back, and a second
  press keeps it; `renameHandles` keeps a grown-up's.
- `check-flow.js`: "a figure nobody dressed keeps its face when her handle moves" — Randomise, and a phone
  that learns the move from `myProfile`, each drawn with the face the old handle drew; the surname journey
  now asks that Wren is shown "Pip Ashdown" and hunts only Ola's surname for her.

**Mutations, each alone in a scratch copy, the copy's file put back byte for byte and compared with the
real one after each** (18; the real files green after):

| mutation | red in |
|---|---|
| no child sees a grown-up on her family row whole (R1) | `check-surnames` (Wren's card for Pip, Pip's comment to Wren, the claim card, its email), `check-profile` (`Bea`), `check-flow` (the surname journey: "her own parent is not Pip Ashdown") |
| a `refused` row counts as family (R1) | `check-surnames` — green at first: a refused claimant had nowhere left to be named, so his comment was added and it is red now (re-run by hand, the real files green after) |
| every child sees every family row's grown-up (R1) | `check-surnames` ("Pip Ashdown" in who reacted, for another student, fresh and kept) |
| only `asked` counts, not `accepted` (R1) | `check-surnames`, `check-flow` |
| the kin memo not dropped by a family write (R1) | nothing — **equivalent**: no request builds names for a viewer after writing that viewer's family rows (`answerClaim` answers `{ success }`; `claimChild`'s and `verifyEmail`'s viewers are the grown-ups). Kept, as round 1 kept the viewer resets, for the route written next |
| `handleFaceKept_` keeps nothing (R2) | `check-signin` (the preview's count, apply's, the sign-in reply's face, Randomise's), `check-flow` (the face journey) |
| `FACE_SKINS` 5, the palette drifted (R2) | `check-signin` (the faces the phone draws differ) |
| the move does not write the kept look (R2) | `check-signin` |
| Randomise does not (R2) | `check-signin`, `check-flow` |
| `renameHandles` does not (R2) | `check-signin` (Gus's face) |
| a chosen look overwritten (R2) | `check-signin` |
| the preview does not count `figuresKept` (R2) | `check-signin` |
| Randomise does not send `avatar` back (R2) | `check-signin`, `check-flow` |
| the phone ignores Randomise's `avatar` (R2) | `check-flow` |
| the phone ignores `profile.avatar` with a moved handle (R2) | `check-flow` |
| a clash counted in the script properties (R3) | `check-surnames` |
| a shared counter that pauses sign-up after five clashes (R3) | `check-surnames` (the innocent family refused) |
| the child's door names the clash (R3) | `check-surnames` |

`check-handles.js` went red on the real files once, which is worth saying: it cuts `renameHandles` out of
setup.gs and runs it on its own, and the call to `handleFaceKept_` reached a name its cut did not have. The
helper and its two constants are in its list now.

The layout fixture "your family, a card each" (check/states.js) draws a claim from a whole name; since R1 that
is what `doGet` sends a child, so it is left as it is.

**Merging with `fix-card-settings`, round 2** (a trial `git merge-tree` of `4f0daff` against that branch at
`f101887`): the same four files conflict as before round 2 — `js/me.js`, `js/check-flow.js`,
`docs/history/README.md` and `style.css` (the last not this branch's) — and nothing new conflicts. What round 2
adds inside them:
- `js/me.js`, the Randomise handler: round 2's line `if (d.avatar && !String(USER.avatar || '').trim())
  USER.avatar = String(d.avatar);` merges by itself but lands AFTER their `avatarKeep_(seed)` line. When
  resolving the handler's conflict, put it with round 1's two lines, right after `HANDLE_ASKING = false;` and
  BEFORE `avatarKeep_(seed)` (and drop the later copy): then `avatarKeep_` finds the look already set and
  does nothing against this backend, and still keeps the face against one not yet pulled. Left where it
  lands, both run and write the same look twice — harmless, and `check-flow`'s face journey compares faces,
  not strings, so it passes either way.
- `profileRefresh_`: one line more in the moved-handle block (`profile.avatar` into a blank look); merges by
  itself beside their hunk.
- `js/check-flow.js`: the surname journey's title conflicts as before; this branch's side now ends "…to
  everybody but herself, an admin and her own child…" — join it with theirs ("…her own boxes on Settings and
  her own card's Edit"), and keep this side's `GROWN_`/`KIN_` block. The face journey is new and merges by
  itself; it draws its own tile, like the round 1 journeys, so where Randomise lives does not matter to it.
- Their `HANDLE_NAME_FIRST_` guard still compares only `first_name`; a child's handle is the last name's
  initial too (round 1's note stands).
- Notes 222 and 237 merge by themselves.

**Round 2's run, on the final files** (`4f0daff`, and the face journey's comparison made face-for-face after
it; a machine load of 13 to 40 throughout, shared with other builders):
- `check-flow.js`, all 333 journeys in four parts (round 1's 332 and the face journey): 330 at the first pass.
  The three that failed were Games clocks in part 1 ("just a minute keeps its round…", "taboo shows a word…",
  "a round left for the Saved column…"), timed against a wall clock at a load of 33; all three pass alone, and
  nothing in this branch touches Games.
- The fast suite, every `js/check-*.js` but `check-flow` and the harness files (55): all green but
  `check-dead`, whose list is `cafb838`'s less `handleIsShaped_`, as in round 1. `check-funnel` was stopped at
  the 590-second limit in the suite's pass and was green alone, in 236 seconds.
- `check/ui.js`: account (110 combinations), settings (185) and dm (40), nothing new; account's "not
  reachable" list is round 1's. Feed (81): the first run reported one new thing, on "the camera still
  starting" at 320 signed in — the camera's answer held and let go, and the first frame measured against a
  three-second clock (it moved the card 64.9px; the rerun: it never landed in 3s). A third run was clean, and
  round 1's head (`954177c`) was clean twice beside it; nothing in this round touches the camera.
- `check/press.js --no-swipe` for the same four: every press answered (30, 21, 23 and 6 actions).
- `check-handles`, `check-signin`, `check-surnames`, `check-profile`, `check`, `check-const`, `check-backend`,
  `check-post`, `check-payload`, `check-rows`, `check-tabs`, `check-columns`, `check-replies`, `check-doors`,
  `check-manifest`, `check-secrets`: green. No added line carries any value from the private Ledger (scanned in
  place, positions only: none).
