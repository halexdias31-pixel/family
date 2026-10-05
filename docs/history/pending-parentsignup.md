## A parent who signs up on the phone is a parent — "Make an account" asks who it is for

The owner, 5 October: *"audit the registration process and so on so all kids can login easily with
their handle and pin."* The work is 273. Its independent walk found one gap it did not close: **a
parent who made an account on the phone was written `student`.** Settings never drew "Make your
child's account", and ticking Client under Your roles was refused — *"A student account cannot make
itself a client … Ask @family. to change it"* — by the rule that stops a child promoting themself.
And when the owner then set the role to client in the sheet, the parent's reload still showed no
card; it took a sign-out and a sign-in. The owner's direction for the week: *"do what is best,
simplest, elegant"*.

### What a person sees now

The **Make an account** sheet opens on one question — *who is the account for?* — with two
answers: **I'm a parent or guardian** / **I'm a student**. Nothing is chosen for you, and the boxes
appear under it once it is answered, so it cannot be skipped. The chosen answer is gold
(`.btn-row .btn.on`, the app's two-answer pattern). A parent's form has no "It's a grown-up's
email" tick — that is a child's door — and its note says *"Once you are in, make your child's
account in Settings — they need no email."* Their confirmation email says the same. The two names
share a row, which is what keeps the button and the note above the fold on a 320×568 phone now the
question sits on top (measured: before, a student's button was cut off).

After the link and the first sign-in, **Settings shows "Make your child's account" on the first
paint** — no reload, no sign-out, no owner.

### What changed

| Where | What |
|---|---|
| `register` (dopost.gs) | Takes `who`. `'parent'` writes `role: client`; anything else — including nothing, which is what an old phone sends, and `admin` or `tutor` — writes `student`, as before. `who: 'parent'` with only a grown-up's address is refused before anything is written. The reply carries `role`; a parent's email names the Settings card |
| `myProfile` (dopost.gs) | Also carries `role`, `roles`, `tutorPending` — the sign-in reply's three words, read the same way |
| `registerSheet_` (me.js) | The question, the two answers, the form shaped by the answer, `who` on the post; refuses to post unanswered |
| `profileRefresh_` (me.js) | Takes the role from `myProfile` (asked once per app open) and keeps it; a changed role repaints the app, not just Settings. An old server sends none and the phone keeps what it had |
| `setMyRoles` | **Unchanged.** A student still cannot tick Client. That rule was right; the fault was that a parent was a student in the first place |

### Why a child who picks "parent" gains nothing over any other child

No form can check an age, so the question is what `client` reaches. Every power it has over
**another person** goes through that person or through a row nobody else owns:

- `makeChild` writes a **new** row linked to the maker, and refuses a name that is already an
  account — it cannot reach a child who exists.
- `claimChild` only **asks**; nothing is linked until the named child says yes (`answerClaim`, the
  child and nobody else). Anybody's request is one the child may refuse.
- `resetPin`, the family cards and the sibling list follow **accepted** links only.
- `doGet` sends a client the same public half of the students list a student already gets, plus
  their own family — nothing of anybody else's.

What a self-made parent account does add is **booking** (which needs a card) and **messaging a
tutor** (`MESSAGING`): listed adults the business put on Find for exactly that, every message kept
in the messages tab and reportable. And it is a **new** account: a child's existing student account
is untouched and still cannot make itself a client. `check-signin.js` §8 asks all of this of the
real backend — a parent's `makeChild` in an existing child's name refused, a claim left `asked`, no
New PIN and no family card until the child answers.

### Why the role went stale, and why fixing it is safe

`USER.role`/`USER.roles` came from the sign-in reply and were kept for the thirty days a session
lasts — exactly `USER.profile`'s old fault, which `myProfile` already fixed for the profile. So
`myProfile` carries the role too, and the phone takes it. The phone only **draws** from these: every
action asks the row its token resolves to, so a stale role was a missing card, never a power, and a
fresh one cannot be a power either.

### Rejected, and why

- **Let a student tick Client after all.** The rule exists so a child — often on an account a parent
  made — cannot make themself a parent. Asking at sign-up removes the reason to loosen it.
- **Default to parent, or to student.** Whichever way round, a default is the answer the walk found
  wrong for half the people pressing it.
- **Hold a self-made parent for the owner's approval, as a ticked Tutor is held.** Every genuine
  parent would wait on the owner to make their child's account — the thing they came for — and the
  powers that touch other children already wait on that child's own yes.
- **Refresh the role from the payload.** The payload is cached and shared; `myProfile` is per token,
  already asked once per open, and already the place this exact staleness was fixed for the profile.

### For the owner

- **Deploy the backend** (`backend/dopost.gs` → Apps Script). The four version stamps are not bumped
  here; the merger does that. Until it is deployed, a phone with this site sends `who` and the old
  backend ignores it — sign-ups stay students, exactly as today; nothing breaks.
- **No sheet change.** `role` already exists; `client` is the word the sheet already uses.
- **Confirm:** (1) the wording *"I'm a parent or guardian" / "I'm a student"*; (2) a self-made
  parent may message the listed tutors straight away, like any client — if you would rather they
  waited for you first, it is a small rule (held until you say yes, the way a ticked Tutor is), not
  built here because every genuine parent would wait too; (3) a person who registers as a
  parent and also wants to be taught can tick Student in Your roles afterwards (adding Student is
  allowed; it is only a student adding Client that is refused).

### Checked

`js/check-signin.js` §8, through the real `doPost`/`doGet`: 24 rules, counted, and the run fails if
fewer are reached. `js/check-flow.js`: the two sign-up journeys answer the question; a new journey
asks that it is asked first and cannot be skipped, shapes the form, posts `who`, and that a parent
sees the make-child card on the first paint after signing in; another opens the app holding a stale
`kid` and asks that `myProfile`'s `parent` reaches Settings and storage, that an old server's reply
changes nothing, and that a role change redraws the column on screen. `check/states.js`: the sheet
as it opens, answered as a parent, answered as a student with the tick. **Mutation-proved 10 backend
ways, 11 front-end ways and 2 lab ways**, each red for its own reason and green on restore — the one
that first stayed green (dropping the repaint) is why the third journey exists. A walk in Chromium
against the real backend at 320×568 and 390×844 (register as a parent → link → first sign-in →
card; as a student → no card; the owner changes the role in the sheet → reload → card) — every step
worked, and the screenshots were looked at.

**`npm run check` did not end green, and not because of this.** On a machine at load average ~35
on four cores, six checks went red. Re-run alone: `check-funnel` and `check-flow` (112 journeys)
pass; `check/cards.js` is red with 2374 "draws a picture on the question card" — **identically on
the base commit**, a library-content fault; `check/ui.js` and `check/press.js` stay red only on
screens this does not touch (stuff, games, tools, feed, a settings pane mid-slide), and every
register state arrived in both. The state expectations here measure `offsetHeight`, because the
first full run caught the sheet mid-grow at 340ms.
