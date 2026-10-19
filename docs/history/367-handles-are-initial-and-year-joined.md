# 367 — a handle is the first initial and the year they joined

The owner, 19 Oct: "i want to change it so its a combination of peoples frist initial and the year they joined."

## The rule (replaces 364's day-born template)

- **Handle = first initial + four-digit year joined**, lowercase: `t2025`. No surname, no birthday, nothing random.
- **Year joined** (`handleJoined_`, backend/people.gs): the row's `joined_on`; if blank, the year of the
  person's earliest recorded activity (`handleFirstSeen_`: their own `handle_changed_at` and
  `agreement_signed_at`, then `HANDLE_ACTIVITY` — submissions, answers, messages sent, receipts, orders,
  reactions, favourites, family links); else the year now.
- **Clashes** (common: many people share an initial and a year): more letters of the first name after the
  initial (`th2025`, `tha2025`), then a counter after the whole first name (`tam20252`). Another person's
  handle or old handle is never handed out (`handleTrouble_`).
- **Order**: `renameHandles_` goes earliest joiner first, then person id, so a clash always goes the same way.
- **Once made, never moved by this**: a handle already in the shape for its first name (`handleInShape_`,
  any year) is left alone, so a fallback year that would later differ changes nobody. The birthday move
  (`handleBirthdayMove_`) is gone — a date of birth typed later changes nothing.
- **Kept**: old handles stay sign-in aliases in `handle_was` (newest first), friends lists move, a blank
  look keeps the face the old handle drew.

## Deploying

A new migration id, `handles-initial-year`, so the move runs once more after deploy, on the first admin
page load. `?run=renameHandles` runs it by hand and is safe to repeat. All four stamps: `2026-10-19-d-year`.

## Checks

check-handles (the template, clashes, counter, join order, activity fallback, second run moves nobody),
check-signin (the migration through the real doGet on an admin load; old handles sign in; a birthday typed
later moves nothing), check-surnames (a made child's handle), check-profile (a birthday saved never moves a
handle), check-flow (the card's line says how the handle is made).
