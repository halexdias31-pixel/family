## Signing in is an e-mail address and a PIN, and twelve of thirteen rows had no address

**Asked for as *"i want people to be able to sign in only with their email and their pin now. no
case sensitive stuff."*** `verifyLogin` went through `findPerson`, which answers to six things — an
id, a full name, first + last, a handle, a username and an address — so the box took all of them.
It reads the `email` column and nothing else now, `norm` on both sides, which is the whole of "no
case sensitive stuff": `Halex.Dias.31@Gmail.com ` is the address in the sheet. `forgotPin` reads it
the same way; it used to compare through `key`, which strips the dots and the `@`.

**Not `findPerson`, deliberately.** It returns the first row that answers to ANY rung, so an address
could still be claimed by a name rung on somebody else's row. **Two rows on one address is refused
rather than guessed** — with the address as the only key, the first match would be somebody signing
in as whoever sits higher on the tab. `emailRefusal_` stops a duplicate being saved from the app;
this answers one typed into the sheet.

**THE LIVE TAB WHEN THIS WAS WRITTEN: 1 OF 13 ROWS HAD AN E-MAIL.** So pulling this backend before
every row has an address locks the other twelve out, and the refusal they get says to use an email.
`register` already demands a unique one, so it is only the rows typed in by hand. Said here because
it is the one consequence of the change nobody will see until a child cannot get in.

**The phone sends the address as `email` AND as `name`**, so the front end and the backend can land
a day apart in either order: an older backend resolves it through `findPerson`'s address rung.

### The owner deleted six columns to get in, and a write to a missing column is silently dropped

`pin_hash`, `pin_salt`, `session_hash`, `session_until`, `tries` and `locked_until` were deleted from
`people` as the fix for a refused PIN. **Every one is written by the sign-in path**, and `setCell` on
a header that is not there calls `missedWrite_` and returns false. So a sign-in would have succeeded
once, `authSetPin_` would have failed to write the hash and then SUCCEEDED in blanking `pin` — the
PIN stored nowhere — and the session would never have persisted, so every action afterwards read as
signed out. Five rows whose only credential was the hash lost their PINs outright. Restored from
version history. **The remedy for a refused PIN is emptying four CELLS on one row, never columns.**

### Four other doors wrote or read an address, and each would have broken the one that signs you in

**Found by three reviewers told to refute the change, and every one is the same sentence**: an
address that can sign you in is a credential, so anything that puts a second copy of one on another
row locks BOTH out, because `verifyLogin` refuses two rows on one address rather than guessing.

| | |
|---|---|
| `makeBrandAccount` | copied the current admin's address onto the brand row it creates — the owner and the brand account on one address. It writes none now |
| `acceptInvite` | added a row with the invited address even when that address already had an account. Skipped now |
| `googleLogin` | took the first row on an address; the PIN door refused the same duplicate. Both refuse now, off one reading (`norm`, whole) |
| `updateProfile` | let the Contact page save an EMPTY address — a sign-out nobody can undo, since both `verifyLogin` and `forgotPin` look the person up by it. Refused now; changing it is still allowed |

**And the register e-mail still said "log in with your full name"**, which `verifyLogin` now refuses.

**`check-handles.js` gains `SIGNIN`**: the `verifyLogin` block cut out of `dopost.gs` and run against
four rows — case and spaces fold, an older phone's `name` field still works, a username is refused,
a row with no address cannot be named instead, two rows on one address are refused. **Proved by
mutation**: `findPerson(body.name)` put back names five of the seven. The test PINs are `0000`,
because `check-secrets.js` refuses any other four digits beside the word, fake or not.
