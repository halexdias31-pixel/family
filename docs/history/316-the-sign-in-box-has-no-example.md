## The sign-in box has no example; where this device knows the admin, it shows the admin's own name

**The owner, 9 Oct:** *"remove the example login. i dont want it to have an example, or matter of fact
let it be the admin login name."*

### What it was

The `email or handle` box carried `ada@x.com or ada_kind7` in grey — one of each kind of thing you can
sign in with, chosen when the box started taking handles as well as addresses (see the note over the
box in `signInCard_`, js/me.js). The label above it already says the same thing in three words.

### What it is

- **On a device nobody has run the business from, the box is blank.** No `placeholder` at all.
- **On a device an admin has signed in on, the grey text is what that admin typed to sign in** —
  their address or their handle, whichever they used, because that is their "login name" in the
  owner's sentence. Kept in `localStorage` as `familyAdminHint` (`{ s, h }`: what was typed, and the
  account's handle) by `signInHintKeep_`, called from `signedIn_` beside `handleRemember_`.
- **Only an admin's.** A child's handle is already a chip one tap away (`handleChips_`), and a
  placeholder naming whichever child signed in last would be the wrong child for the next one. A
  child signing in after the admin does not replace it.
- **Kept across sign-out**, like the chips: it is a hint and no secret. **✕ on the admin's own chip
  forgets it with the chip.**

### Why not from the sheet or the code

The repository is public and a handle is `first_adj_NN` — it carries a first name. Written into the
code it would be published; sent in the payload it would tell every stranger's phone the admin's
login name, half of what signing in as them takes. From the device's own memory it is only ever
shown on a device the admin has already used.

### Checks

`js/check-flow.js` — *the sign-in box has no example; on a device an admin signed in on, it shows
what the admin signs in with*: a fresh box has no placeholder and the old example is nowhere on the
card; an admin signing in by address puts that address in the box; a child signing in afterwards
does not replace it; no PIN is written anywhere on the device; ✕ on the admin's chip clears it.
Proved by putting the old placeholder back and dropping the keep: the journey fails, and passes
again on the real files.
