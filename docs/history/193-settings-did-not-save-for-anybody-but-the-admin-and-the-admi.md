## Settings did not save for anybody but the admin, and the admin's Saves wrote blanks

**Reported as "some things arent updating when i click save. also the whole saving process feels very
unresponsive".** An audit (five investigations, each finding re-run by a skeptic) found the faults
under it. Every one reproduced against the real `.gs` files, and none was visible to the suite,
because nothing on the roster had ever run `updateProfile`:

| | |
|---|---|
| **the sign-in reply threw `profileOf_` away** | `loginReplyFor_` set `profile: profileOf_(r)`, then an older block ten lines down replaced it with raw cells. So the qualification shelf past row three, every tick and year, all nine library boxes, the phone's two boxes, the birthday's three and the exam pickers opened EMPTY — and a Save wrote the blanks back (library cards → '', quals → '', the specialism wiped, the phone doubled to `+44 44 …`) |
| **nobody but an admin could save** | `updateProfile` compared the phone's `targetId` — a person_id — with `body.name`, which the gate had just set to the DISPLAY name. `p002` against `adatutor`: never equal. Every tutor, parent and student was refused "Not authorised to edit that profile." |
| **a refused Save had already written** | the phone and the birthday were written before the e-mail clash was asked about, and every write retired the payload cache under a reply that said failure |
| **a new PIN signed the phone out on the server** | `authEndSession_` ends every session, the caller's included, and nothing told the phone — every later Save answered "Please sign in again." |
| **the payload cache was keyed on `?person=` and `?name=`** | so a stranger typing the admin's id and name into the address was served the admin's cached payload, every child in `students` included |

**Fixed as rules rather than instances.** `updateProfile` asks every refusal before a single cell is
touched, decides whose row it is by comparing two ids, asks admin of the token's own row, and writes
the row through `setCells` — one `setValues` per run of adjacent columns, and a cell already holding
the value is skipped, so an untouched Save writes nothing and does not retire the payload (an
untouched Qualifications Save was 55 service calls and 21 writes; it is 9 and 0). It answers with
`profileOf_` of the row as saved and how many cells `changed`. `payloadKey_` keys on the person the
TOKEN resolves to. `changePin` hands the phone that asked a fresh token. A dead session is answered
`why: 'signed-out'` and `api()` signs the phone out once, saying why.

**`myProfile`**, a `self` POST, is the phone's way to learn what the sheet holds — once per app open,
and whenever a Save finds a copy of your settings in the old broken shape (no `phone_cc` key), which
it refuses to post from. A POST and never a key on the payload, because the payload is cached and
this carries a birthday, a phone number and library-card PINs.

**The phone**: `me-save`, `handle-save`, `pin-save` and the cut card all go through `send_`, so the
button spins and the card is locked while the request is on the wire (a headline typed mid-save used
to be silently lost). A settings card with anything typed into it is not repainted by a `load()` or
the inbox landing — `paint` marks the column stale instead — so a Save on About you no longer throws
away a postcode typed on Where. The wardrobe rebuilds its whole card on a pick, so the ring, a bought
item and the credits follow; a slower reply to an older tap is ignored.

**`cellSafe_`**: a string starting `=`, `+` or `@` (or `-` when it is not a number) is written with a
leading apostrophe, which the sheet keeps as "this is text" and does not return as part of the value.
`phoneIn` produces `+44 7700 …`, which a sheet otherwise reads as a sum; and a caption or message
starting `=` would have been a live formula in the owner's spreadsheet.

### `node js/check-profile.js` — the round trip, through the real `doPost`

Every `.gs` in one vm over an in-memory Ledger whose tabs carry `SCHEMA`'s headers, a UK-locale
`setValue` (dates, booleans and numbers come back typed, as a sheet hands them back), and a cache that
keeps what it is given. It signs in four people, checks the reply's profile IS `profileOf_`, saves
every page for every role with nothing changed (must succeed, must write nothing), changes one field
per page and signs in again, refuses a Contact Save on another account's address (must have written
nothing), and asks the payload-key, `changePin` and `myProfile` questions. **Proved on the old code**:
30 findings, one per fault above; the fixed code is clean.

**What the owner must do**: pull and deploy the backend, run `?setup=1` (the live sheet has no `quals`,
`teaches_also`, `agreement_signed_at` or `agreement_version` columns), and sign out and back in once
on each phone. Rows the admin's old Saves wrote blanks over (qualifications, library cards, a doubled
phone) cannot be rebuilt from the app: restore those cells from the sheet's version history, or type
them again.
