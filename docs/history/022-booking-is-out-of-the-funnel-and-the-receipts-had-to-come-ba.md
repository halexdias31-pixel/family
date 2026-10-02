## Booking is out of the funnel, and the receipts had to come back in the same commit

**Reported as "remove booking from the finder"**, and it is the tools-and-games decision again: a
booking is not a thing you FIND, it is a thing you DO, and it has a column of its own where the form,
the basket and your sessions all are. Answering `What for · Booking` put a twelve-question form in
front of somebody who came to look for a past paper, then offered Tutors, Venues, Subjects, Levels
and Receipts underneath it — five answers that are one swipe away on a screen built for them.

**It is the GROUP, not a list of kinds.** `stuffItemsBuild_` filters on `asList_(x.groups ||
kindOf_(x).group)` — exactly what the `forLabel` facet reads — so a kind added to Booking tomorrow
leaves the funnel with nothing added, and a rule naming `tutor, venue, subject, level, receipt` would
go stale on the sixth. `kindMap_` overlays the `kinds` tab, so moving a kind out of Booking in the
spreadsheet puts it back: that is the escape hatch and it is deliberate. Measured against the real
library with the real (empty) `kinds` tab: 2 items leave and `What for` stops offering Booking. In
`check/fixture.json` they stay, because that fixture's `kinds` rows regroup tutor→people and
venue→places — which is the escape hatch proving itself.

**Nothing may go dark, and that is the whole care.** Each of the five had to have somewhere else to
be BEFORE the answer was removed, because a thing only reachable through a door you have just bricked
up is a deletion wearing a tidy-up's clothes:

| | |
|---|---|
| **tutors** | the account column, one page each, with the Message tile |
| **receipts** | `bookBlocks` draws one page per session again — see below |
| **venues, subjects, levels** | the booking form's dropdowns, which is the only thing anybody did with one. **The slip and level cards are drawn nowhere now, and that is the real cost** |

**The receipts are the half that had to be undone.** `bookBlocks`'s own note says `pastCard_` was
taken off that column *because* the receipts had become results in the funnel — *"a page holding a
list of them AND a searchable list of the same rows is the duplication this evening has already
produced twice"*. True while both existed. Removing the answer makes the half that was kept the half
that was deleted, so every session a person has ever had would have been on no screen in the app.
**Removing an answer and restoring what it was the only route to belong in one commit**, or the gap
between them is a live site where nobody can find what they paid for in March.

### The empty funnel said nothing at all, which is worse than saying the wrong thing

**`stuffQuestion` returned `''` when there were no items**, and `stuffPageCount` returns 0 until
something has been answered — so `stuffPageHtml`'s `nothingHere` branch is unreachable on arrival and
this was the only thing with a chance to speak. A search box over a blank screen: no question, no
sentence, no reason.

**Found by `check-flow`'s "every tab draws something" the moment Booking left**, with the check's
payload holding two tutors, two venues and no library: `stuff` drew 0 characters of text. The journey
was right and the fixture was not the fault — the app has been one empty payload away from a blank
front door for as long as that line has been there.

**Fifth occurrence of this repository's oldest shape**, and the only one that does not manage even to
report an empty list. `nothingHere` is the sentence because it is the one place that can tell an
empty database from a request that failed — a dropped payload and a dropped library both land there,
and both deserve a reason and a `Try again`. And the two empties are not the same empty: nothing
anywhere is the app having no content; nothing LEFT is a filter that has excluded everything, and the
way out of the second is one row up.

### A decision about what to ASK is not a decision about what somebody KEPT

**Starred tutors and venues vanished from Saved the moment Booking left the funnel.** `collItems_`
filtered `stuffItems()` — the offered list — so the row was still in the `favourites` tab, the star
still posted, and the card was simply not found. Silently, on the one list in the app whose entire
job is to not lose things.

**Found by auditing favourites on the same afternoon**, which is the only reason it is not a fault
somebody reports in a month as "my saved things vanished". `stuffItemsAll_` is every item the app
has, memoised the same way and in its own array — `facetTally_` keys its counts on the items array
itself, so handing one array to both lists would make a tally of the funnel answer for the saved
list too. Measured: 1 of 3 starred things found before, 3 of 3 after.

**Tools and games are in neither list and that is untouched**: they were removed from the build
rather than filtered out of it. Worth knowing the two decisions live in different places, because
only one of them is reversible from here.
