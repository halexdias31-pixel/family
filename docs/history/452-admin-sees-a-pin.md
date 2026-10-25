# 452 — An admin sees a person's PIN

The owner: *"admin should be able to see each person's pin."*

PINs are kept plain in the people tab's `pin` column (`authSetPin_`, booking.gs), so the answer is a read,
not a reset. The admin already had New PIN on everybody's card; what was missing was telling a family the
PIN they already have.

## What was built

- **`pinShow`**, a doPost action, `ACTION_ACCESS` `admin`. The gate resolves the token and refuses anybody
  not an admin; the handler asks again of the token's row with `rankAtLeast_(me, 'admin')` — no new role
  check. It answers `{ pin }` for the named `targetId`, `{ pin: '', said: 'No PIN' }` for an empty cell, and
  an error for an id nobody has. A cell the sheet made a number (`authPinLost_`) is said as four digits.
- **"Show PIN"** tile in `peopleTiles_` (me.js), so it is on every other person's card in the Business
  column, admin only. A tap posts `pinShow` and puts one line, `PIN ####`, under that card's tile row
  (`.person-pin`); a second tap removes it without asking the server. `go()` calls `pinHideAll_` whenever the
  column changes, and any redraw drops it, because it lives only in that line of the DOM.

## What it never does

The PIN is not in the doGet payload, the payload cache, `DATA`, `localStorage`, a draft or a log. Asking for
it is one POST per tap.

## Checks

- `js/check-pin-show.js` (in check-all): a parent, a tutor, no token and a parent claiming the admin's id
  are refused; the admin gets Pat's `0000`, a numeric `0` cell as `0000`, an empty cell as "No PIN"; an
  unknown or empty id is refused; `ACTION_ACCESS.pinShow` is `admin`. Mutating the access to `self` turns it
  red (the handler's own rank check still refused the parent).
- check-flow journey "an admin's Show PIN …": no tile for a tutor or on your own card; the tap posts
  `pinShow` with the target id, shows one line under that card's row, keeps it out of `DATA` and storage;
  a second tap hides without posting; "No PIN" is said; leaving the column removes the line (proved by
  disabling the `go()` hook).

Version stamps `2026-10-25-m-admin-pin`.
