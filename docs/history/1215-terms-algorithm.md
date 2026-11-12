# 1215 — the school year worked out for any year (owner, 12 Nov 2026)

The owner asked for term dates that are right for any year with no manual edits. `schoolYear(y)` in
`backend/booking.gs` already computed a contiguous year but drifted from London: Christmas could end 24 Dec,
summer ended on the 3rd Friday of July, autumn started on the first full week.

Reference: Wandsworth Council's published community-school dates (wandsworth.gov.uk/termdates, read 12 Nov 2026),
the only official London page found listing both 2026-27 and 2027-28; Merton and Lambeth pages had no 2027-28
figures online. Third-party tables (savemyexams) agreed for Wandsworth/Merton 2026-27.

| Interval | Rule | 2026-27 | 2027-28 |
|---|---|---|---|
| Autumn start | first Wed on/after 1 Sep; if past the 5th, first Mon-Thu from 1 Sep | Wed 2 Sep | Wed 1 Sep |
| October half | last full Mon-Fri week of Oct (unchanged) | 26-30 Oct | 25-29 Oct |
| Christmas | last Fri on/before 21 Dec; if that is the 15th, Wed 20 Dec | Fri 18 Dec | Fri 17 Dec |
| Spring start | Mon on/after 2 Jan; Tue if that Mon is the New Year bank holiday | Mon 4 Jan | Tue 4 Jan |
| February half | week whose Monday is 12-18 Feb | 15-19 Feb | 14-18 Feb |
| Easter | two weeks from the week before Good Friday's week, never before 29 Mar; Good Friday and Easter Monday always off | 26 Mar-11 Apr (back Mon 12) | 1-17 Apr (back Tue 18) |
| May half | week of the last Monday in May (unchanged) | 31 May-4 Jun | 29 May-2 Jun |
| Summer end | 22 Jul, or the Friday before when a weekend | Thu 22 Jul | Fri 21 Jul |

All twelve published term boundaries match exactly for both years. Known misses outside the reference years:
summer 2026 ended Mon 20 Jul in Wandsworth (rule gives Wed 22); individual schools move INSET days, which the
terms tab (`termsFor`) still overrides and the Term dates card's "my school" shift still covers.

`js/arcade.js` `tdYear_` (Term dates card) is the same rules in local time; `js/check-terms.js` runs both for
2020-2040: contiguous, Mon-Thu starts, weekday ends, 190-200 term weekdays, Christmas <= 21 Dec, summer 18-24 Jul,
the published dates exactly, browser equals backend. Booking's front end (`restInterval_`, `runningTerm_`,
`waitTerm_`) reads the payload's intervals, so it follows. Version stamps bumped: the owner redeploys the backend.
