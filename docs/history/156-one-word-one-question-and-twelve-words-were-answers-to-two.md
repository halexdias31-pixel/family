## One word, one question — and twelve words were answers to two

**`check-funnel.js` has printed this as a note for months.** A note nobody acts on is the thing this
file warns about in six other places, and the owner has now reported the symptom. Measured once the
check could see the real funnel:

| | | |
|---|---|---|
| `Biology` | subject 243 | topicArea **305** |
| `Chemistry` | subject 276 | topicArea **341** |
| `Physics` | subject 348 | topicArea **263** |
| `Algebra` | topicArea 815 | topic 11 |
| `Number` | topicArea 1367 | topic 9 |
| `Probability` | topicArea 119 | topic 56 |
| `Statistics` | topicArea 289 | topic 9 |
| `KS3` | keystage 736 | level 27 |
| `A-Level` | level 263 | **tier 135** |
| `Edexcel` | examBoard 2576 | **company 1148** |

**EVERY ONE IS THE `level` / `stage` FAULT**, which this file records at length: the same word, twice,
meaning different things, and which result set you get depends on which of the two questions the
funnel happened to offer first. There it was repaired by MERGING two facets. These cannot be merged —
a subject and a branch of the topic tree are different facts that share a name, and so are a board and
a publisher.

**SO THE NARROWER QUESTION KEEPS THE WORD.** `not: 'subject'` on `topicArea` means: drop any of my
values that the Subject question already gives THIS item. Five facets carry one word each —
`topicArea` defers to `subject`, `topic` to `topicArea`, `level` to `keystage`, `tier` to `level`,
`company` to `examBoard` — and `facetOwn_` is the one reader, used by `facetTally_` **and** by
`filterHit`, because a question that stops OFFERING a value must stop MATCHING it or a chip carried
over from a wider list keeps rows the question no longer claims.

**PER ITEM, NOT PER FACET, and that is why it is safe.** `Probability` stays a Topic wherever the
row's topic AREA is something else and stops being one only on the rows where the two agree — a
blanket "Topic may not say Probability" would have taken a real answer away from 47 rows to fix 9.
Measured after: the overlap list goes from twelve words to six, and every one left is either two real
facts sharing a name (`Maths` is a link category and a subject) or a data backlog.

**`A-Level` WAS THE SHARPEST OF THEM.** A tier is Foundation or Higher; an A-level paper has neither,
and pressing `Tier · A-Level` quietly gave you 135 of the 263 the Level chip gives. The `tier` CELL is
untouched, deliberately — `paperLabels_` tells the A-level and the AS paper of one sitting apart by
exactly that column.

**AND `Standards & Testing Agency` IS THE ONE PAIR NO SPELLING RULE CAN JOIN.** `spellKey_` reduces an
answer to its letters, so `STA` and the spelled-out name are two identities. It is not a spelling: it
is an organisation's short name, which is the line `levelOf_` draws for `AS level` — the engine folds
spellings and a reader resolves meanings. `FACET_SAME_AS` is that one fact with its reason beside it.
