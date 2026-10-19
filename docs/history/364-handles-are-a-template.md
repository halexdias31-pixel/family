# 364 — Every handle is a template a person can work out alone (19 Oct 2026)

## What the owner said

"I want to change kids names into some template they can know without needing me to tell them. So no
more randomisation feature. It can be like combination of their first initial day of month born and
something else none privacy invasive. This will be how everyone has there handle."

## The rule (`handleCandidates_` / `handleMake_`, backend/people.gs)

- **First initial + day of the month born (two digits) + first letter of the surname**, lower case:
  a person "T… D…" born on the 4th is `t04d`.
- **No date of birth:** first initial + surname initial + the last two digits of the person id
  (`P-1042` → `..42`, one digit padded with 0). The date of birth is preferred whenever the row has one.
- **A clash** (another person's handle, or an old handle still on somebody's `handle_was`, or anything
  `handleTrouble_` refuses): the first name's next letters go in after the initial — `th04d`, `tha04d` —
  and if the name runs out, a counter at the end. Nothing is random; the same sheet gives the same handle.
- Letters are folded to a–z (accents off, `HANDLE_KID_FOLD` for ł, ø, æ …); a missing letter is `x`.
- It is everyone's: children, parents, tutors, admins. One letter of a surname is not a surname, so
  "no surname beside a child" (342) holds.

## What moved with it

- **Randomise is gone** — the tile, `handle-shuffle`, `randomiseHandle` (action, access entry and handler),
  `kidHandles` and every generator piece (`handleDraw_`, `handleShuffle_`, `handleKid_`, the tail digits).
  The card's handle section now says how the handle is made.
- **The move:** the `handles-to-template` migration (MIGRATIONS, `retry: true`) runs `renameHandles_` on
  the next admin page load after deploy. Rows go in person-id order, so a clash always goes the same way.
  Each old handle goes to the front of `handle_was` and **still signs in** (342's aliases, unchanged);
  friends lists naming an old handle are moved (`handleFriendsMove_`); a blank look gets the face the old
  handle drew written down (`handleFaceKept_`). Safe to repeat: `?run=renameHandles` moves nobody already
  on the template, and is the way to re-template after dates of birth are typed into the sheet.
- **A birthday typed later:** a Save on the card that sets a date of birth moves a handle made without one
  (`handleBirthdayMove_`), keeping the old one as an alias.
- Register, invite and "make your child's account" pass a draft row with the id it will have.
- The old shapes (first name + virtue + number) are still *read* by `handleParts_`, so an old handle with
  a long first name spelled out still answers (`handleAnswers_`).
- The check harness (`check-gas-load.js`) marks the migration done, so fixtures keep their handles;
  check-signin deletes the mark to see it run on an admin load.

## Checks

check-handles (the template, clashes, no randomness, the move), check-signin (doors, the migration on an
admin load, old handles signing in, a second run, a birthday typed later), check-surnames, check-profile
(randomiseHandle refused, nothing written), check-flow (the handle section has nothing to press and says the rule).
