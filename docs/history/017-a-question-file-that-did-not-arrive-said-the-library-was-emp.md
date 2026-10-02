## A question file that did not arrive said the library was empty

**`libraryRows_` caught every failure and said nothing.** A 404, a refused request and a body that
stops halfway all came out as `[]` — which is also what a legitimately empty file gives. Downstream,
`stuffPageHtml` drew *"Nothing in the shop or the library yet."*: a confident sentence about an empty
library, printed for a library of 4,682 rows that simply had not come.

**Fourth occurrence of this repository's recurring fault.** `loadMessages` showed an empty inbox for
an unreachable backend and its own comment named it — *"a network blip reads as everything having
been deleted"*. `check-booking.js` printed "nothing to check" and exited 0. Reels drew "Nothing here
yet" for a column that worked. Every one is the same sentence: **I did not manage to look, reported
as I looked and there was nothing there.**

**And it matters most on the phone that cannot do it.** `data/questions.json` is 346 KB compressed
and 3.4 MB parsed — the largest single request the app makes, and the only one big enough to be
dropped by a weak signal or an old handset that everything else survives. The person who sees that
message is precisely the person whose library did not load.

**`LIBRARY_FAILED` is separate from `LOAD_FAILED`** because they are separate requests with separate
failures: the backend can be down while the library sits in the browser's cache, and the library can
drop while the payload sails through. `nothingHere` reports whichever happened — it has drawn a
reason and a `Try again` for the backend since it was written, and the library was simply never
wired into it. **`Try again` had to clear the memo**: `libraryRows_` returns `LIBRARY_ROWS` untouched
once set, so the button would have repainted the same failure for ever.

**And `nothingHere` alone was not enough — the harness is what showed it.** On this site the list is
NEVER empty, because the payload carries tutors and venues. Measured: 2 items, `LIBRARY_FAILED` set,
and the empty-state branch never reached once. **A dropped library leaves a Find screen holding three
venues and no questions**, with nothing anywhere saying why. So there is a banner too, which does not
depend on the list being empty, written last of the three banner checks so it wins — a missing column
is an admin's problem with saving, and this is every visitor's problem with the thing the app is for.

**Proved in five directions**: a body that stops halfway, a 404, a request that never returns, a
genuinely empty file, and everything working. The flag is set in the first three and empty in the
last two, and the banner appears and clears to match.
