## The payload came back as an error, and the list that did it was a fourth place naming tabs

**Reported with a screenshot of the live site**: an orange banner reading *"The server said: No terms
(expected in ledger), links (expected in NO FILE — not routed in WHERE)."* Not a thin section of the
site — `doGet` returns that object **instead of a payload**, so there were no people, no jobs, no
prices and no shop on any phone.

**`REQUIRED_TABS` in `doget.gs` is a FOURTH hardcoded list of tab names**, beside `TAB`, `WHERE` and
`SCHEMA`, and it was the only one nothing was reading. `links` left `WHERE` in the commit that moved
the links into the repository — correct, and it made `read('links')` permanently unable to find a
sheet, so a list nobody had thought about since took the site down. `TAB`, `WHERE` and `SCHEMA` all
agreed with each other perfectly the whole time; `check-tabs.js` said so and was right.

**`terms` was the same fault a step further back and had never been required at all.** `termsFor()`
COMPUTES the year's terms and reads the tab only to OVERRIDE them — this file already records that
under "`terms` is two different tabs sharing a name" — so the app has run without that tab for its
whole life. It was in the list because somebody typed ten names once.

**So the list is an object with one written reason each**, which is the `ACCEPTED` / `VOCAB` /
`RETIRED_FACTS` / `HANDLE_ALLOWED` pattern for the fifth time, and the bar is written down with it:
not *the app uses this*, but *without this tab the payload is WRONG rather than merely thin* — a
price of nought, a sign-in that finds nobody, a family's sessions reported as none. Anything softer
ships as an empty list, which is what every other tab already does. Eight names, and neither of the
two that took the site down could have survived writing its sentence.

**`check-tabs.js` rule 6 is the half a checker can see**: a required tab that `WHERE` does not route
can never be found, and one that `SCHEMA` does not describe can never be created, so either way it
is an outage waiting for the next deploy. **What it cannot see is a routed tab nobody has run
`?setup=1` to create yet**, so a name added there still takes the site down until somebody does —
said rather than implied. Proved in four directions: `links` back in the list fires it, a required
tab with its `SCHEMA` entry removed fires it, and the list renamed fires the cannot-find-my-subject
guard.

**That last one failed the first time and the reason is worth keeping.** `objectAfter_` located the
block with `indexOf('const ' + name)`, and `const REQUIRED_TABS` is a PREFIX of
`const REQUIRED_TABS_RENAMED` — so a rename that should have failed the check silently handed it the
renamed object instead. A word boundary now, on all five lookups.
