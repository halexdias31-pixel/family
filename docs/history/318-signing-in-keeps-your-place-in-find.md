## Signing in keeps your place in Find: the same chips, the same card, the same page, and the answer moves to you

**The owner, 9 Oct:** *"when the child writes something in an answer box then goes to sign in, it wipes
their finder so they have to click all the way to get back there."*

### Why it was wiped

**ONE CONDITION DID TWO JOBS.** `signedIn_` (js/me.js) starts with
`if (!USER || String(USER.personId) !== pid || !pid) signedOut_({ quiet: true })` — the person arriving
is not the one whose things are held, so clear them first. True when one child signs in over another,
which is what it was written for (note 296: the last child's private message on the next child's
Messages column). **And true when NOBODY was signed in**, which it was never thought about for.

**AND `signedOut_` EMPTIES FIND.** `STUFF.q = ''; STUFF.filters = []` — added after the review of the
Bible found an admin signed out on the Books shelf leaving *"WHAT KIND Resources ✕ SHELF Books ✕"* on a
signed-out Find (note 292): the name of a shelf only an admin is shown, on the screen of somebody who is
not one. Right for a sign-out. So a child who walked the funnel signed out — Questions → Maths → Past
paper → GCSE → Higher → 2023 → June → Paper 1 — went to the card, typed an answer, swiped across and
signed in, and `signedIn_` sent them back to Find (it already does, `PREV_AT`), **onto a Find that
started again from its first question**. The answer was not lost — `ansRead_` moves a signed-out answer
to whoever signs in (note 296) — but it only does that when the card is drawn, and the card was eight
taps away.

Measured in Chromium at 820x1180 (the iPad), the real library, the owner's errand to June 2023 1H Q13:
signed out on page 28 with "80" in the box; signed in, page 0, chips `[]`, the answer still under the
signed-out key and nothing under the child's.

### What changed

| | |
|---|---|
| **`signedIn_` decides, in one place** | `if (!USER) signedOut_({ quiet: true, keepFind: true }); else if (… !== pid \|\| !pid) signedOut_({ quiet: true });`. Nobody → somebody is the same seat: the same child, now with a name. |
| **`signedOut_` takes `keepFind`** | and leaves `STUFF.q` and `STUFF.filters` alone when told. Everything else it clears still goes, because it is the device's last person's or nobody's: the stars, the inbox and its poll, the done dates held, the keypad and any sheet, the payload's per-person keys, the films, the answers' read. Nothing in it touches `PAGE`, so the card and the page come back with the chips. |
| **Sign out and A → B** | unchanged: Find starts again. The dead session was in this row too, and should not have been — see the review below. |
| **Find stands on the card by name when the list under it changes** | `PAGE.stuff` is a number and a redraw kept the number — right while the list is the same list. The payload that lands after signing in is that person's, and a signed-in child can be shown more (their friends answer a search; for an admin, the Bible's index joins the list mid-read). Measured: one more row in front of Q13 and the redraw put the child on Q12. So a filled page now says which card it is (`FIND_AT` on the page element, written by `stuffFillOne_`, read only while the page is still marked filled), and the two redraws that keep your place — `screen('stuff')` and `paintStuff(true)` — look that card up in the new list (`stuffHeld_`, `stuffBackTo_`). Asked of the page on the screen rather than remembered, because that is what the child is looking at. Only for the same search and chips; a card that is gone leaves the number as it was. |

**Why not split Find's reset into its own function.** It is two lines and one caller decides; an option
passed from the one branch that wants it reads as what it is, and `signedOut_` stays the single list of
what is one person's.

### The review: the same complaint by another door, an answer left for the next child, and a payload for somebody who had gone

Two reviewers, three faults the first version left standing. All three were on the commit before it as
well; the first version made two of them easier to meet, because it put the child straight back on the card.

**A SESSION THAT DIES UNDER THE CHILD WIPED FIND, AND THAT IS THE OWNER'S SENTENCE WORD FOR WORD.** The
table above listed "the dead session" as unchanged on purpose, for the admin-shelf reason. Measured in
Chromium at 820x1180, and again in jsdom: a student signed in on the iPad walks the funnel to June 2023
1H Q13 (page 28), types "80" and leaves the box; the answer goes up on a token the server has ended
(thirty days, or the PIN changed on another phone), comes back `why: 'signed-out'`, and `api()` calls
`signedOut_()`, which emptied Find under the card. *Signed out — please sign in again*, page 0, no chips.
Signed in again as the same child: page 0, no chips. *"Writes something in an answer box then goes to sign
in, it wipes their finder"*, by another door. Nobody had left. So:

| | |
|---|---|
| **`api()` passes `ended`** | `signedOut_({ ended: true })`. Everything of the person's still goes, as for Sign out. |
| **`signedOut_` keeps Find on `ended`, and says whose it is** | `STUFF.whose = <their personId>`. **Not for an admin**: an admin's Find is the one that can name a shelf only an admin is shown (note 292), so theirs is cleared as Sign out clears it. |
| **`signedIn_` hands it back to that person only** | from nobody, `keepFind: !whose \|\| whose === pid`. The same child signing in again: the chips, the card, the page, and the "80" (it never left their key). Anybody else signing in next is the next child on the iPad, and Find starts again. Signed in, `whose` is emptied: the question is `USER`'s. |

After, in Chromium: session ended, still on Q13, page 28, the eight chips, the toast; signed in again, the
same, with "80" and *Saved to Sol's account* under it.

**AN ANSWER TYPED SIGNED OUT LOST TO AN OLDER ONE ON THE ACCOUNT, THEN WENT INTO THE NEXT CHILD'S.** The
first version said "the typed answer moves to the child" — true only when their box was empty. `ansRead_`
moves a signed-out answer *only into an empty box*, and the sign-in reply fills the box from the account
first. Measured: Sol's account held Q13 = "75" from three days before; signed out, Sol typed "80" and
signed in. The box said "75" and *Saved to Sol's account*; "80" stayed under `ans:q:…`, not shown, not
sent. Sol signed out, Kit signed in and opened Q13: Kit's box was empty, so "80" moved into it and went up
to **Kit's** account. So:

| | |
|---|---|
| **`ansStore_` stamps a signed-out edit too** | `ansAt:` was written only signed in, so nothing could say whether the answer on the device was newer than the account's. |
| **`answersClaim_` (js/answers.js), from `signedIn_`, from nobody only** | after the reply's answers are in the boxes, every signed-out answer on the device is decided at once: nothing in the person's box — it moves; the signed-out one is the later edit — it replaces theirs; theirs is later — theirs stays. Moved with its own time, and due, so the account decides against its own copy by the rule `answersUpsert_` already has (the later edit wins, the reply carries the winner). **None is left under the signed-out key**, so the next child is handed nothing. One typed before signed-out answers were stamped has no time: it fills an empty box, as `ansRead_` always let it, and never replaces one. |
| **`ansRead_` and `padAdopt_` stay** | for a device that was already signed in with a signed-out answer still on it. |

After, in Chromium: Sol signed in onto Q13 with "80", sent to Sol's account; Kit on Q13 with an empty box
and nothing sent.

**A PAYLOAD ASKED FOR BY SOMEBODY WHO HAD GONE WAS ADOPTED ANYWAY.** The first version's safety argument
was "signed out is the least anybody can be shown". `load()` made that false: it adopted whatever landed,
whoever was signed in by then. Signing in starts a payload that takes fifteen to thirty-five seconds; an
admin who signed out inside that window had theirs land on the signed-out phone, and `signedOut_` had
just emptied `DATA.films` — so the whole film list with its Drive links was back in Find and on the videos
card (note 068: the list is secret), and the signed-out funnel offered *Films*. Pressed, that chip was
then kept into the next child's account by the first version (*"Films ✕"* over "Nothing matches"). The
films on a signed-out phone were the older and worse half. So **a payload whose person has gone is dropped** — signed out, a session ended, or somebody else signed in — before anything of it is written. This branch first did it with a guard of its own (`loadFor_` and `LOAD_N` in `load()`); merged after note 313's quiet retry, which had reached the same fault from the other side, the two were one rule written twice, so 313's is the one kept: `loadStale_` checks every reply against the query it was asked with (`loadWho_`), and when the person here now has no payload of their own, `load()`'s `finally` asks for them. The difference is one case: a payload asked for nobody that lands after a child has signed in is dropped too, rather than drawn — the child's own, which their sign-in already asked for, fills the screen when it lands.

**Not done, the nit that the line under the box (*On this device only — sign in to keep it*) is not a way
to sign in.** True, and the Mark-with-AI line is the same. But a pressable control on the question card is
a layout decision, not a fix: the line is one dim row reserved at a fixed height, a link in it is not a
44px target, and a tile there is one more tile on every question's page. Left for the owner.

### Checked

- **check-flow, "signing in from signed out keeps Find's chips, the card and its page — and the typed
  answer moves to the child"**: real rows of data/questions.json (the three June 2023 Higher papers and a
  Corbettmaths sheet, so the funnel has questions to ask); the funnel walked by **clicking its own chips**,
  each the first answer that keeps Q13's card on the strip; Q13's page (page 28 of the column, its 28th
  result); "80" pressed on the keypad; `go('account')`; the handle and PIN 0000 typed; Sign in pressed,
  as a student, with the payload after it held. Asserted before the payload: on Find, the same chips and
  search, the same page, Q13's card on it, the box under the student's key drawn holding "80", the answer
  stored under `ans:u:P12:` and the signed-out copy gone. Then the payload is released carrying one more
  row in front of Q13 (Q7 gains a part (b) — one page, as the walk chose Questions and answer pages are
  not drawn), and all of it is asked again: the page number has moved and the card has not. And the
  moved answer goes up to the student's account.
- **check-flow, "Find is still started again when an admin signs out from an admin-only shelf, and when
  another child signs in over the last"**: an admin on Resources → Books with `genesis` typed presses the
  real Sign out — chips, search and the word Books gone; a child signing in after that is handed none of
  it; Ada signed in with chips and a search, then `signedIn_` for another child — Find cleared; the same
  child signing in again keeps theirs.
- **Proved by mutation**, each red, then green on the real files: `signedIn_` as it was (the journey
  fails on every assertion); the find.js half reverted (fails only after the payload, "Find is on
  Q-1MA1-2306-1H-12"); `keepFind` passed on a switch (the counter-case fails, "handed Ada's Find");
  `signedOut_` never clearing Find (the counter-case fails on all four).
- **In Chromium** (a scratch Playwright walk over the real library and `check/fixture.json`, not
  committed): before the fix, signed in onto the funnel's first question; after it, on Q13 with "80" and
  *Saved to Sol's account* under it, the card centred (589px against 590), and still there after a
  second repaint.
- **check-flow, "a session that ends while a child types keeps Find for them to sign in again to, and
  not for the next child or an admin"** (the review): a student signed in at boot, the funnel walked by
  its own chips to Q13's page, "80" on the keypad, the box left; `saveAnswers` on that token answered
  `why: 'signed-out'`. Asserted: signed out, with the toast; the same chips, page and card;
  `STUFF.whose` the child's; "80" still under their key. Then the handle and PIN on the account column
  and Sign in pressed: back on Find, the same chips, page and card, "80" in the box, `whose` emptied, and
  "80" sent up on the new token. Counter-cases: another child signing in over the dead session gets an
  empty Find; an admin's session ending on the Books shelf (the real `api()`) clears Find.
- **check-flow, "an answer typed signed out beats an older one on the account at sign-in, and none is
  left for the next child"** (the review): signed out, a worded answer and a keypad answer typed, an
  undated drawing on the device; `signedIn_` with a reply carrying the account's answers (the worded one
  three days old, the keypad one a minute later than the typing). The worded box holds what was typed,
  sent with the time it was typed; the keypad box holds the account's later one; the drawing filled the
  empty pad; nothing left under a signed-out key. Ada signs out, Ben signs in: empty boxes, nothing sent
  to his account.
- **check-flow, "an admin's payload that lands after Sign out is not adopted, and the signed-out phone
  asks for its own"** (the review): an admin with the films; a `load()` held; Sign out; released. No film
  in `DATA` or Find, no *Films* in the signed-out funnel, and a payload asked again with no token.
- **The review's three, proved by mutation**, each red and the real files green again: `api()` calling
  `signedOut_()` without `ended` (Find on page 0, "the funnel was thrown away"); `whose` ignored (the
  next child "is handed the last child's Find"); `ended` keeping an admin's Find (the Books shelf left);
  the `answersClaim_` call removed (Ben's boxes hold Ada's answers, and they go to his account — the
  review's finding exactly); signed-out edits unstamped (the account's three-day-old answer wins);
  `load()` adopting whatever lands (7 films on the signed-out phone).
- **In Chromium**, the reviewers' own walks (scratch, not committed), at 820x1180 touch and 1280x800,
  before and after: listed in the review section above.
- `check.js`, `check-const.js`, `check-signin.js`, `check-answers.js`, `check-saved-answers.js`,
  `check-payload.js`, `check-post.js`, `check-films.js` green. **check-flow: all 202 journeys work**
  (199 and the review's three). The first version of this note said 199 with one failing — "the videos
  widget is last on Games…" — and that it failed the same on the base commit; it passes here, on the
  same files, so it was the load on that machine (forty-odd) and not a standing red. The imposter and
  timetable journeys that time themselves were the same.
- `npm run check`: everything green but four harnesses that bind fixed ports — `check/press.js`,
  `check/cascade.js` and `check/ui.js --part=1/3` stopped on EADDRINUSE (another worktree's run on the
  same port), and `--part=2/3` failed under the same load. Each run again alone: `press.js` on its own
  port, nothing threw and nothing was inert; `cascade.js`, nothing decided by order; `ui.js` parts 1 and
  2, nothing new (585 and 330 combinations).
- `check/states.js` is the list of states, not a runner (it loads); its runner, `check/ui.js`, on the
  account column: 100 combinations, nothing new, and the same states unreachable as on the commit
  before. On Find: 584 combinations, nothing new; one state ("a worded answer, the pad up on its
  letters" at 1280) was not entered on a machine with a load of thirty-odd, and 1280 alone, run again,
  measured all 117.

### Not changed, and worth knowing

- **A switch from one child to another still starts Find again**, as it must (their chips may name what
  the next child is not shown). On the family iPad that means the second child walks the funnel again;
  the chips chosen are not remembered per person.
- **The answer moves at sign-in now, all of it** (`answersClaim_`), from nobody only — all but what a
  session the server ended left for somebody else, since the merge with 317 (below). `ansRead_`'s rule —
  moved when the card is drawn, only into an empty box — is what is left for a device that was already
  signed in with a signed-out answer on it.
- **Answers typed signed out after a session ended went to whoever signed in next**, while Find went only
  to the person whose session it was. True when this was written; no longer. 317's review marked such an
  answer as that person's (`familyGoneKeys`), and since the merge every door that moves one asks — see
  below.
- **Signed out after a session ended, the box on the card is empty**: "80" is under the child's key and a
  signed-out box reads the signed-out key. It comes back the moment they sign in again; the toast says
  why it went.

### After the merge with 317

**THE CLAIM MET 317'S GONE MARK, AND 317'S RULE WON.** The two were built on separate branches. 317's review
found a child's words, typed signed out after the server ended *their* session, moved into the next
child's box when the card was drawn, and marked such an answer as that person's (`familyGoneKeys`) for
`ansRead_` and `padAdopt_` to refuse to move. `answersClaim_` was written without knowing the mark existed,
and it runs at sign-in, before any card is drawn: merged, Ada's "More words" went into Ben's box and up to
Ben's account the moment he signed in from nobody — 317's journey, red on its three privacy lines. Now
`answersClaim_` asks **`ansMayMove_`** (answers.js) before it takes anything from under the signed-out key,
the one question `ansRead_`, `padAdopt_` and `circOf_`'s held rings ask too. So "every signed-out answer is
decided at once, and none is left" has one exception: an answer typed after the server ended a session is
that person's — never claimed by anybody else, and stays under the signed-out key for them. And claimed by
them **only into an empty box**: this note's "the later edit wins" would have put "More words", typed into
the hole the ended session left, in place of their 3,000-character essay and sent it to the account. For
every other signed-out answer the rule here stands as written: the later edit wins, moved with its own
time, and nothing is left for the next child. Proved by mutation in note 317's journey, which now signs
both children in from nobody.

**After the review of the merge: the person's own, all of it, and the record kept in the visit.** "Only
into an empty box" left Ada's "More words", typed beside her essay, under the signed-out key for good.
She never saw them again, and every signed-out visitor after her did. Signing in from nobody now takes
everything of hers off the signed-out key. It goes into an empty box, or it is **joined** to her answer
(`ansJoin_`): words after her words, strokes after her strokes, rings with her rings. A number, a pick or
an order is decided by this note's rule, the later edit wins. And this claim's own fallback, walking
`ANS_MEM` when storage throws, is why the record of whose an answer is (`familyGone`, `familyGoneKeys`)
is now held in the visit too: without that, a browser that keeps nothing let the claim hand Ada's answer
to Ben. Note 317 has the detail and the mutations.
