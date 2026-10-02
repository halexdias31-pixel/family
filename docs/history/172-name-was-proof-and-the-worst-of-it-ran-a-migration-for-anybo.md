## `?name=` was proof, and the worst of it ran a migration for anybody

**Found by reading `doget.gs` to answer a different question, which is this file's own definition of
luck.** `p` is `e.parameter` — the URL query string — the web app is deployed `ANYONE_ANONYMOUS`,
and **every tutor's display name is printed on the screen.** So `?name=<an admin's display name>`
was the whole of what it took to be served the admin payload. Measured, by grepping every use:

| | |
|---|---|
| `viewerIsAdmin` | the films list, every unlisted tutor, withheld posts, refused and waiting bookings, `canRemove` on every comment |
| **`maySeeChildren`** | **`payload.students` — every child's name, handle, avatar, friends, xp and credits** |
| `address` | a child's home address, under a comment saying *"sending it anywhere it is not needed is the sort of thing that is fine until it is not"* |
| `iAmIn` / `splitEmails` | every family on a booking by name, and the addresses its booker typed in |
| **`?person=<any id>`** | four more — another family's birthday diary, another person's print orders, somebody else's withheld posts, somebody else's comment controls |
| `?receipts=` | a household's whole year. **Nothing in `js/` calls that route** — measured, the string occurs nowhere in the front end — so it was a door with no handle, open |

**`doPost` HAS BEEN RIGHT ABOUT THIS SINCE SESSIONS WERE BUILT, and its own note says the sentence**:
*"BEING SIGNED IN IS A TOKEN, NOT A NAME — any name, the field simply had to be non-empty."*
`accessDenied` resolves `authWhoIs_(body.token)` and overwrites `body.name` with whoever the token
really is. The same machinery, the same function, in the same project. **`doGet` was simply never
moved onto it, and nothing anywhere compared the two halves of one app.**

### The one that is not a disclosure: `?run=` ran every maintenance job with no PIN at all

**`if (!who || S(who.pin) !== S(p.pin) || !hasRole(who, 'admin'))` read the PLAINTEXT `pin` cell —
and `authSetPin_` CLEARS that cell the moment a PIN is hashed**, which is every row that has ever
changed its PIN through the app and every row a reset has touched. So `S(who.pin)` is `''`; a URL
carrying no `pin` parameter at all makes `S(p.pin)` `''` too; `'' !== ''` is false; the gate passes.

**`?run=ensureSchema&name=<an admin's display name>` ran that job for anybody**, and every job in
`RUNNABLE` was reachable the same way — `rename`, `seedOptions`, `seedFamilies`, `installTriggers`,
`clearPayloadCache`, `warmPayload`. Not a leak of data: **remote invocation of the maintenance
surface.** `authCheckPin_` is the one function that knows the answer — it refuses an empty PIN on its
first line, reads the hash where there is one, and keeps the plaintext branch as the migration path
for a row typed into the sheet before hashing existed, re-hashing it on the way through. Exactly what
`verifyLogin` asks, which is the point: one test, one place.

**NO THROTTLE ON THAT GATE, deliberately.** `authWrong_`'s ladder guards the sign-in door; this is a
URL typed by hand by somebody who already holds the spreadsheet, and a lock-out written from a
mistyped `?run=` would shut the owner out of the app itself.

### One resolver, memoised, and `?person=` is read for identity nowhere in `doGet` now

`askedBy_()` is `authWhoIs_(p.token)` held in a local — **memoised because `authWhoIs_` runs
`authHash_`, which is four thousand rounds of SHA-256 by design, about fifty milliseconds.** Seven
places here ask who is looking; one answer. `viewerIsAdmin` is `hasRole` on the row the token
resolved to rather than `isAdminPerson` on a string somebody typed, and `meAskedName` / `meAskedId`
are what the name and id comparisons read.

**ONE NAME IS STILL READ AND IT IS THE ONE WITH A PIN BESIDE IT.** `?run=` is a URL an admin types
by hand, so there is no token to hand.

### Both GET callers send all three, which is what makes it safe to push before the backend deploys

**The backend deploy is blocked** — `pullFromGitHub` on the Cloud-project switch, clasp
unconfigured — so the two land days apart whichever order they are written in. `index.html`'s boot
fetch and `load()`'s own builder both send `person`, `name` **and** `token`:

| | |
|---|---|
| old backend, new phone | `name` still decides. Nothing changes |
| **new backend, old phone** | no token, so an admin is served the ordinary payload — **degraded, and safe** |
| both new | the token decides |

There is no ordering in which somebody is served more than they should be.

**THE TOKEN TRAVELS IN A QUERY STRING AND THAT COSTS SOMETHING, said plainly rather than waved
past**: a GET URL is written to Apps Script's own execution log where a POST body is not. What reads
that log is the script's owner, who can already read the whole spreadsheet — so the exposure is a
surface the owner already has, against a hole any visitor had. The alternative is to make the payload
a POST, which takes the boot fetch out of `index.html`'s head and gives up the head start that whole
block exists for. A trade rather than an oversight.

### `check-backend.js` — a name in the URL is a claim, and the rule has one exemption

**Same shape as the `delRow` rule above it in that file, and for the reason its own note gives**: the
question is whether the string appears outside the one block allowed to use it, which has exactly one
right answer and no scope to get wrong. That block is `if (p.run)`, tracked opener to closer, with
the block-comment tracker that rule already needed — *a check whose first finding is its own
documentation is a check that gets switched off within a day.*

**`p.pin`, `p.health`, `p.receipts` and `p.arg` are deliberately not asked about.** They are switches
and secrets rather than identities: a switch anybody may flip costs nothing, and the PIN is the thing
being *checked* rather than a thing being *believed*. A rule that fired on every query parameter
would fire on the honest ones, which is a rule somebody switches off — the `check-rows.js` lesson.

**Proved by mutation five ways**: the old `isAdminPerson(S(p.name))` back (names `doget.gs:368`);
the two `meId` reads back on `?person=` (names both); one `iAmIn` comparison back on `p.name`; the
`if (p.run)` block renamed so the exemption stops applying (names the run gate's own `p.name`); and
`doget.gs` made unreadable, which reports *"could not be read, so NOTHING was checked — not a
pass"*. The real file exits 0.

#### `'\b'` IN A PYTHON STRING IS A BACKSPACE, AND THE MUTATION IS WHAT CAUGHT IT

**The first version of that rule reported nothing on every mutant.** The file-unreadable guard fired,
so the file was being read — the regex was the fault: written through a Python heredoc as `'\\bp\\.'`
in a non-raw string, `\b` is **U+0008 BACKSPACE**, so the rule compiled to
`/<BS>p\.(name|person)<BS>/` and matched nothing anywhere.

**It is a rule that could not fail, standing under a confident comment about what it protects**,
which is this file's own definition of a green light with nothing behind it — and the only thing that
found it is that the mutant survived. Same class as the twenty-three `–` comments and the NUL
byte in `check/ui.js`: an escape consumed by the layer it was written through. **A mutation is not
finished when it fires; it is finished when the check is green again and the mutant is not.**
