# 442 — Find your child by handle

The owner (25 Oct 2026): "There shouldn't be an option in widget to add child. They should just be able
to search their child by handle. Then see their profile card and there's a tile to add child. If it's a
child account. I guess you need to add a search bar at top of the people's column."

## What changed

- **"Manage your child" (Settings) lost its "Add your child" form** (first + last name → `claimChild`).
  The section stays as one sentence pointing to People. **"Make your child's account" stays** — it is a
  different need (a child with no account yet), not a route to link an existing one.
- **The People column (`account`) now opens with "Find someone by handle"** (`peopleSearchPage_`, me.js),
  "+ Add a person" (admin) just under it, then your own card. Signed in only.
  - Typing filters, by handle prefix (`@` optional), the cards this person can already see: tutors,
    their family, and for an admin everyone. Nothing new is revealed by a prefix.
  - **A child is never listed.** Find (Client and up only) posts `findChild` with the whole handle; the
    server answers one student whose handle matches exactly, with first name, handle and the figure
    (`faceFig_`) — no surname, no photograph. Twenty lookups per account per ten minutes (CacheService),
    so the handle space cannot be walked. A Student sees no Find and the server refuses them anyway.
  - The found child's card carries one tile, **"Add as my child"**, which posts the existing
    `claimChild` with `handle` instead of names. Every rule there stays: Client/Admin only, no ask from
    an unconfirmed address (`heldBy_` still turns that refusal into the held card), held/refused/asked
    links not re-asked, and the child says yes before anything is linked.
- `claimChild` still takes first + last name, so a phone running the old page keeps working.
- Version stamps bumped together to `2026-10-25-find-child`; `findChild` is in `ACTION_ACCESS` (`self`,
  the handler gates the rank) and `features`.

## Checks

check-flow journeys (442): the column order; exact handle finds the child with the tile and no surname;
a prefix shows public cards only and a part handle draws no child; the tile posts `claimChild` by handle;
a Student gets no Find, no tile, no post. The "Manage your child" journey and check/states.js now want
the add section without inputs. check-drafts exempts the search box.
