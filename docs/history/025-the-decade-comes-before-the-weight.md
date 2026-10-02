## The decade comes before the weight

**"Boxers and fights shouldn't be organised by weight category before the decade/s involved."**
`nextFacet` walks `FACETS` in order, so a `Decade` question sits above `Division`.

**The arithmetic would never have chosen it, and that is the point.** A division narrows harder —
twenty answers against seven — so every rule in `find.js` would pick it, and every rule in `find.js`
is about how much a question narrows rather than about what somebody came for. Somebody who wants
boxing wants an ERA: the heavyweights of the seventies are a subject, and "heavyweight" across a
century is a list of strangers. The weight is the second question and a good one once the era is
chosen. Same judgement `boxKind` already records one rung up.

**A decade, not a year**, because `year` gives forty answers — past `FACET_MAX_ANSWERS`, so the
question would be refused outright and the funnel would go straight to the weight, which is the
complaint. Ten years is the unit boxing is discussed in.

**Decades, plural**, off `activeFrom` and `activeTo` together: a career from 1975 to 1992 answers the
seventies, eighties and nineties, because a fighter filed under his last year alone disappears from
the decade he was famous in. Same shape as `keystage`, same machinery — `asList_` already filters and
counts against several answers. A span that runs backwards gives its two ends rather than a hundred
buttons; a fighter with no end date stops at `record_as_of` rather than inventing "the present day"
from a clock the function cannot see. Measured: **Boxers or fights → Decade → Division**, with
`welterweight` and `Welterweight` folded to one by `divisionOf_`.

**`year: b.activeTo` came off the boxer mapper.** It was the year he STOPPED, drawn as "Year", and
once `Decade` existed it sat between the decade and the weight offering `1981` and `2005`. A column
filled in with something nearly right and then read by a question that means something else — the
`cost: 0` shape again. A bout keeps its `year`, because a fight really did happen in one.

**`fightCard_` picks the winner by id where there is one.** `winner_id`, `boxer_a_id` and `boxer_b_id`
are shipped to every phone and were read by nothing, while the name comparison highlighted neither
corner if `winner` was typed "Ali" against `boxer_a` "Muhammad Ali" — which looks exactly like a
draw. The name stays as the fallback, because that is what reads a row typed in before anybody
assigned ids; same order `findPerson` uses.

**The boxing DATA could not be audited and that is not a finding, it is a blocker.**
`data/boxers.json` and `data/fights.json` are both `[]` — step 2 of the Library migration needs an
export from a Google sheet, and every Google host is blocked from this environment by network policy.
Everything above is the code path, which is where a data fault would show; the rows themselves are
still unread by anything.
