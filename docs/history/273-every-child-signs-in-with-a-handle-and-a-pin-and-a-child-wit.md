## Every child signs in with a handle and a PIN — and a child with no email can get an account at all

The owner, 5 October: *"audit the registration process and so on so all kids can login easily with
their handle and pin."*

Three auditors read sign-up and sign-in and walked them through the real `doPost`. Between them:
**a child with no email had no in-app way to get an account**; a PIN starting with 0 was refused
for ever; "Forgotten your PIN?" overwrote the PIN of whoever's handle was typed into it; the admin
reset inside `changePin` could never run; a row typed into the sheet signed in and was then signed
straight back out. Every one passed every check, because no check asked from the child's side.
`js/check-signin.js` does now, through the real backend.

### What a parent does now

1. Sign in. Settings → **Make your child's account**: first name, last name (filled with yours),
   a PIN for them, **Make their account**.
2. A paper slip appears on the card: *Ivy signs in with @ivy_kind42 and the PIN 0000* (whatever was
   chosen). Write it down or photograph it — it is shown once. The handle is emailed to you, without
   the PIN.
3. Ivy is already on your account (the link is written `accepted` — nobody existing is being
   claimed, so there is nobody to ask). Her card on your You column shows her handle.
4. Ivy forgets her PIN → her card on your column → **New PIN** (the key tile) → the sheet asks first
   ("their old PIN stops working, and they are signed out everywhere") → **Make a new PIN** → the
   slip shows her handle and a new six-digit PIN, once.
5. A child who already has an account of their own: **Add your child** (the card after it), as
   before — they are asked to say yes.

### What a child does now

**If a parent made the account:** the sign-in card → type the handle (with or without the `@`, any
case; a long first name can be spelled out in full) and the PIN → Sign in.

**Making it themselves, with no email:** the sign-in card → **Make an account** (the person-plus
tile) → first name, last name, a grown-up's email, tick **It's a grown-up's email**, a PIN → **Make
my account**. The sign-in box is filled with their new handle and a toast says it. The grown-up gets
an email with a link and the handle; until they open it, signing in says *"the grown-up whose email
you gave needs to open the link we sent them"*. Once they do, the child signs in by handle and PIN —
and if that address is a parent account here, the child is put on it.

**Forgot the PIN:** type the handle in the sign-in box → **Forgotten your PIN?** (the key tile). A
new PIN goes to the account's own email, or to the parents and the grown-up's address. **The old PIN
keeps working**; the new one works beside it for a day and becomes the PIN when first used. If there
is nobody to write to, it says so — *ask your parent or your tutor* — instead of claiming a PIN is
on its way.

### What changed, finding by finding

| Found | Done |
|---|---|
| No-email child / a second child on one family address could not get an account | `makeChild` (parent, from Settings) and `register` with `parent_email` (the child, with a grown-up's address). `parent_email` is a new `people` column, **never a sign-in address** |
| A PIN starting with 0 lost its 0 in the sheet (and 0000 typed by hand became 0) | `cellSafe_` writes a digit string with a leading 0 as text; `authPinLost_` lets a number cell answer to the digits it was made from and writes it back as text; `authFreshPin_` never draws a leading 0. The harness's sheet now drops the 0 the way a real one does — every seeded `0000` is the number 0, so every check that signs in proves it |
| Forgotten PIN overwrote the PIN for anybody who typed the handle; mail failures changed it and sent nothing | The emailed PIN waits beside the old one (`AUTH_RESET_<id>` in Script Properties, `authResetUse_`); one email a quarter hour, the same PIN re-sent inside the day; no quota or a failed send changes nothing and says so |
| …and it was the way out of a lockout | Still is: while locked, only the emailed PIN is compared, and five misses at it throw it away |
| Forgotten PIN for a child nobody can be written to said "on its way" | `why: 'no-inbox'`, in words. Unknown handle/address now says so too (sign-in has disclosed this since 184) |
| Admin cannot reset a child's PIN; the `changePin` admin branch could never run | `resetPin {targetId}` — an admin (not for another admin) or a parent the child accepted. Draws a PIN, clears the throttle, drops an emailed PIN, ends the child's sessions, fills a blank handle, confirms a PENDING row. The dead branch and its comments are gone |
| A blank handle was printed as the first name (`@Kit`), which sign-in refused | `doGet` sends `''`; the admin's card says "no handle yet"; `ensureSchema` fills blank handles (via `fillHandles`); `acceptInvite` rows get a handle |
| A row with no `person_id` said "Signed in" and then "Signed out" | `signInRow_` gives it an id before the session |
| A classmate's guesses left a child one typo from an hour's wait for ever | The count starts again after a day with no wrong answer (`AUTH.QUIET_HOURS`); a reset clears it; a child with no email has their grown-ups warned |
| `?run=` checked an admin PIN with no throttle | Same ladder as sign-in |
| Every student was sent every child's siblings by full name and friends list | `siblings` and `friends` dropped from `payload.students` (the phone read neither) |
| `register` accepted 0000 / 1234 | One rule, `pinWeak_`, for `register`, `makeChild`, `changePin`, `makeBrandAccount` |
| A long first name is cut to nine letters, so the natural spelling failed | `handleRows_` — one reader for sign-in and forgotten PIN — also accepts the handle with the whole first name spelled out, for generated-shape handles only |
| Nobody was told the handle | In `register`'s reply (into the sign-in box), the confirmation email, the reset emails, the make-child email and the slips |

### Rejected, and why

- **Move the forgot-PIN tile away from Sign in / add a confirm.** The harm was that a mis-press wiped
  the PIN. It no longer does — a mis-press is one email, at most one a quarter hour.
- **A global hourly limit on wrong PINs.** It would hand any one guesser the power to lock every
  child out at once.
- **Fewer free tries.** 128 and 181 measured the ladder and the owner chose it; the quiet-day reset
  changes nothing for a guesser (they must stop for a day to earn it).
- **Six-digit PINs for admins.** It would lock out an admin whose PIN is four digits today — the
  owner's call, not a code change.
- **Move `autoMigrate` after the `?run=` PIN check.** `?setup=1` runs the same migration with no
  PIN, deliberately (`doGet`'s own note): nothing new is reachable.
- **Fill blank handles/ids on the admin's page load.** A write inside `doGet` for a cached payload is
  a larger change than the fault; `ensureSchema`, the first sign-in and New PIN cover it.
- **Formatting the `pin` column as plain text in `ensureSchema`.** Not verifiable from here whether
  a leading apostrophe is kept literally in a text-formatted cell; `cellSafe_` + `authPinLost_` do the
  job without that risk.

### For the owner

- **Deploy the backend** (`backend/*.gs` → Apps Script) — and the merger bumps the four stamps.
- **Run `?setup=1` once**: it adds the `parent_email` column to `people` and fills any blank handle.
  Until the column exists, a child registering with a grown-up's address is told so and nothing is
  written; everything else works without it.
- **The sibling-on-mum's-address case in the sheet:** where a child's row holds a parent's email,
  that parent cannot make an account of their own on it. Move the address to the child's
  `parent_email` cell and blank their `email` — they sign in by handle.
- **Confirm:** (1) the make-child email carries the handle but not the PIN; (2) an admin can reset
  any non-admin's PIN, a parent only their accepted child's; (3) the emailed PIN lasts a day; (4)
  the second Make-an-account path (a grown-up's address) is open to anyone, like `register` always
  was — the grown-up's click is what lets the account sign in.

### Checked

`js/check-signin.js` (new, in `check-all`), `check-handles.js` (five long-name and hand-typed cases),
`check-profile.js` §11 (forgot-PIN now leaves the old PIN working and says `no-inbox`). Five
`check-flow.js` journeys; four `check/states.js` states. **Mutation-proved 31 backend ways, 13
front-end ways and 3 state ways**, each red for its own reason and green on restore. Screenshots at
320 and 390 of the sign-in card, the register sheet (ticked and not), the make-child slip, the admin
card with no handle yet and the New PIN slip — looked at; the first register note ran under the fold
at 320 and was cut to three lines.
