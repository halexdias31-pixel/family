## Signing in as three tiles, making an account for real, and siblings on the account column

### What the owner asked

- *"turn the sign in and forgot pin buttons into tiles. same with create account button."* (people-1)
- *"students should be able to see their parents and siblings likewise"* (people-8)

### The sign-in card (people-1)

Measured before: the signed-out account column at 390px had two `<button>`s and no `.tile` — `Sign in`
(gold), `Forgotten your PIN?` (quiet) — and below the card a second `.card.tap` reading *No account
yet?*. Tapping that card toasted "Registration is the next thing to wire" and posted nothing, so the
third way in was a sign saying it was not a way in. The backend has had `register` (dopost.gs) all
along: first name, last name, email, a 4-8 digit PIN, a student row marked `PENDING`, and an email
carrying `SITE_URL?verify=<token>`. Nothing on the site read `?verify=` either, so even a working
form would have made accounts that `verifyLogin` refuses for ever.

What changed:

- `TILE_ICONS` gains three marks at the set's 1.4 stroke: `in` (the mirror of `out` — same door,
  arrow going in), `key` (a PIN is the key; the tile gets you a new one), `join` (a person with a
  plus, the contacts-app mark for "add somebody").
- `signInCard_` draws the three actions as one `.tile-row` under the PIN box, `Sign in` in the `buy`
  tone because it is still the one gold thing on the card. The *No account yet?* card is deleted.
  Tiles show no word, so one faint line under the row says what the three marks are, in order.
  `do-signin` keeps its name: the Enter listener clicks `[data-do="do-signin"]` and `send_` already
  treats a busy tile (spinner, no relabel).
- `register` opens `registerSheet_()`: four boxes and the form's own button (a FORM has buttons).
  `reg-send` posts `{action:'register', first_name, last_name, email, pin}` through `send_`, so the
  boxes lock while it is on the wire and the server's refusal ("That email is already registered")
  is toasted in its own words. The PIN rule `/^\d{4,8}$/` is checked on the phone too — a deliberate
  exception to "do not repeat the server's rules", because a wrong PIN is the likeliest mistake and
  finding out costs fifteen seconds with the form locked. Same pattern as the server, so they cannot
  disagree. On success the sheet closes, the address goes into the sign-in box, and a toast says to
  open the emailed link.
- No `ref` is sent. Nothing hands out a referral code any more, and `?ref=` on this site's address
  is Stripe's return leg (receipt.js) — reading it would credit a payment reference as an
  introduction.
- `verifyFromLink_()` (me.js), called from boot.js after `load()`: reads `?verify=`, removes it from
  the address with `history.replaceState` (keeping any other parameter), posts `verifyEmail`, toasts
  "Email confirmed … now sign in" and goes to the account column. The token is single-use on the
  server, so leaving it in the bar would make a refresh show "already been used" to somebody whose
  account is fine.

The backend was read and not changed for this item: `register` and `verifyEmail` already require
exactly what the sheet sends.

### Siblings (people-8)

Parents and children were already drawn (5b56e15). Siblings were not: `famLabel_` had only `parent`
and `child`, and `doGet` never added `siblingsOf(meId)` to `payload.family`, although `siblingsOf`
existed and `payload.students[].siblings` (names only) was sent to every student and read by nothing.

- `backend/doget.gs`: `add(siblingsOf(meId), 'sibling')` in the family block. `siblingsOf` walks
  `acceptedLinks()` for both steps, so a parent's unanswered or refused claim about another child
  makes nobody a sibling. Same `famCard_` (name, handle, photo — no private field) and the same
  `familyFor` stamp.
- `js/find.js`: `famLabel_.sibling = 'Your brother or sister'`. "Sibling" is the word adults use;
  the readers are mostly children and the app knows nobody's gender to pick one of the two.
- **backend changed — needs syncing to Apps Script.** No version stamp was bumped here; the merger
  bumps all four once.

### What was measured

- `js/check-flow.js`, new journey *the sign-in card is one tile row, and Make an account posts
  register*: the tile row is exactly `do-signin, forgot-pin, register`, each with a mark; no
  sign-in control is a non-tile; Enter in the PIN box posts `verifyLogin`; the register tile opens
  the sheet; PINs `123`, `12a4`, `123456789` post nothing; `4821` posts `register` with the four
  fields by the names dopost.gs reads; the sheet closes and the toast mentions the link.
- New journey *arriving on ?verify= confirms the address once and takes it out of the bar*: boots on
  `?verify=Vabc123&post=P9`; one `verifyEmail` with that token; `verify=` gone from the address and
  `post=P9` kept; toast says confirmed; an ordinary boot posts no `verifyEmail`.
- The family journey now also sends a `sibling` and an unknown `cousin`: one "Your brother or sister"
  card, the parent card still once, the cousin drawn as nothing.
- `js/check-profile.js` case 10, through the real `doGet`: Cal (P-SC) added as Anna's second child.
  Abe and Cal see each other; Anna sees both; Ben (Bea's, linked to Anna's family only by an `asked`
  and a `refused` row) sees no sibling; after Abe accepts Bea, Abe sees Ben and Cal and Ben sees Abe.
- `check/states.js`: a signed-out account state *making an account* (the sheet open, four boxes and
  its button), and the family state carries a sibling and expects its card.
- Mutations, each red for its own reason and green again once restored: PIN check disabled; the
  boot.js call removed; `replaceState` disabled; forgot-pin put back as a button; the doGet sibling
  line removed; `siblingsOf` made to count `asked` links; the `sibling` label removed.
- Screenshots at 320 and 390 of the signed-out card, the register sheet and the sibling card,
  looked at.
