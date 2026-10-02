## An answer that is a date sorts as a date

**The sittings came out alphabetically and it read as broken.** (Under the month names they carried
at the time.) June 2017, June 2018, June 2019,
June 2020, June 2023, June 2024, November 2017, November 2018, November 2019 — every June stacked
before any November, 2024 sitting above 2017, and each academic year split in half down a list
nobody could scan.

**`cmpText` is right about everything else** and the note above it says why: there is no reason to
prefer one of forty tutors, and alphabetical is the order somebody can predict. **A date is the
exception because it HAS an order, and it is not the one its letters give.**

**The test is on the answers, not on the facet.** Nothing in `facetTally_` knows that `examWave` is
a sitting — it asks whether every answer in front of it parses as `<series word> <year>` and sorts by
the date if they all do. So a `facets` row inventing a question over any dated column gets the same
treatment with nothing added, and a facet with one date and nine words falls straight through to the
alphabet rather than sorting nine things by a rule that fits one. Measured: `Sitting` comes back
newest-first; `Subject` is still alphabetical.

**A season is a position in the year too**, and that half was added a commit later with the rename
below. The first version knew the twelve months only, so `Summer 2017` parsed as a word and the
whole list would have gone back into the alphabet the moment `seriesOf_` stopped naming months —
this sort undone silently by an unrelated change. `SERIES_AT` in `find.js` is the one place that
says where in the year each season sits, and `seriesOf_`, `waveOf` and `dateKey_` all read it.

**Newest first, and that half is a judgement rather than arithmetic.** Chronological either way
fixes the June/November split; which end leads is a choice, and the newest paper is the one closest
to the specification somebody is actually sitting — which is why every past-paper site lists them
that way. One `-` flips it.

**And the twelve month names were written out three times.** `MONTH_NAMES` is in `data.js`; `find.js`
had two private copies inside `seriesOf_` and `waveOf`, and `games.js` had a third until somebody
deleted it with a note saying why. One list, one place.
