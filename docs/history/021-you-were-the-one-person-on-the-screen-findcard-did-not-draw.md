## You were the one person on the screen `findCard` did not draw

**Reported as "why can't I see my own info like theirs?", with a screenshot**: two tutors with a
photograph, what they teach, a rate and a DBS stamp — and above them your own account as a name, a
role and a button.

**The paragraph directly above the code is the answer, and the code underneath it broke the rule it
states**: *"`findCard` draws them, which is the point. It is the same function the funnel used for a
tutor, so a person looks identical wherever they are seen — two renderers for one person is two
things to keep in step."* The next line was a hand-rolled `<div class="card">` — a second renderer
for one person, three lines under the sentence forbidding it.

**Your row goes through the same function now.** Found by `personId` first, then `handle`, then name
— the order `findPerson` uses on the backend, and for the reason `changePin` records: matching a
person by their display name was a real denial. `mineIs_` is one test used twice, so "which row is
yours" and "which row to leave out of the list below" can never disagree.

**And if you are not staff there is no row**, so one is built from what signing in already returned.
That is not a second renderer; it is a second SOURCE for the same renderer, which is the whole
distinction.

### Absent is not `false`, and the DBS stamp is where that matters

**The stamp is a real claim.** A tutor row's `dbs` comes from `TRUE_(r.dbs_checked)`, so it is always
answered, and the pass defends the negative outright: *"a pass without one is visibly a pass without
one, which is exactly the right amount of alarming."* Right for somebody a parent is checking.

**Nobody has made that claim about a row built in the app.** A parent looking at their own account
has no `dbs_checked` cell anywhere, and printing NO DBS ON FILE across it is the `cost: 0` shape one
more time — a missing fact rendered as a negative one. The key is simply absent on a row built here,
`t.dbs === undefined` tells the two apart, and every person a parent can actually look up still gets
a stamp either way.

**And an empty foot is not drawn.** The dashed rule is the pass's perforation and reads as one only
when something is torn off below it; on a row with no stamp, no place and no NOT LISTED flag it was
a dashed line over twenty pixels of nothing. Caught on a screenshot, which is where the first such
row appeared.

### Every page in the account column is a card

**Reported as "I want them standardised like the other widgets".** Measured: page 1 `.card`, page 2
`.pass` — your account in an ordinary card and every person under it a bare pass returned straight
out of `findCard`, so the column drew two different kinds of object down one scroll.

**This is the Reels fault one screen along.** That one *"returned its own markup instead of going
through `pages()` or `stack()`, so it drew straight onto the black with no pane"*, and the fix was to
make it an ordinary card with its own markup inside. Same here: the pass keeps every one of its own
rules — the hole, the stamp, the lanyard shadow — and sits in the pane everything else sits in.
Measured after: three pages, all `.pane > .card.is-widget > .pass`.

### And then the pass went, because it was asked for twice

**"Get rid of that lanyard looking thing mate. just a normal widget."** The section above is the
first answer to that complaint and it put the pass INSIDE a widget, which made the column consistent
without changing the thing anybody was looking at. This is the second answer and it is the real one.

**What the pass was for, so the argument is not lost with the markup.** A rectangle with a hole
punched in the top reads as something worn round a neck, and once it reads as that the DBS stamp
reads as clearance without anybody explaining it. That is true, and it is not the point: a pass is
an object you are handed at a reception desk, and one object among nine widgets reads as something
unfinished rather than as something with a shape of its own.

**And it could not hold what is in the sheet, which matters more than the taste.** `doget.gs` has
sent thirteen public facts about a tutor since it was written and the pass drew four — a photograph,
a name, three subjects and a rate. The headline they wrote about themselves, the three adjectives,
the years they have been doing it, their qualifications and grades, the group sizes and session
lengths they accept, what they focus on, and when they last confirmed any of it were on every phone,
on every load, drawn nowhere. **Thirteen columns written and never read** is this repository's oldest
shape — `figure`, `orderPrints`, the four message actions, `exam_date` — and a card 3.4rem wide had
nowhere to put them even once somebody noticed.

**`check-payload.js` cannot see this class of fault** and that is worth knowing: it compares
top-level `DATA.*` keys, so a field inside a row that nothing reads is invisible to it. `DATA.tutors`
is read, so `DATA.tutors[n].yrsExp` never being read is not a question it asks.

**`detailsConfirmed` is the one that had a rule waiting for it.** `doget.gs` sends it with the
sentence *"a profile nobody has looked at for a year is worse than one that's obviously incomplete,
because it reads as true"* and then *"the site decides what counts as recent, so the rule lives in
one place"*. That one place was nowhere. It is a row now, marked when it is over a year old — hidden
would leave a stale profile looking exactly like a fresh one, which is the fault the sentence
describes.

### The first version threw, and 88 combinations reported nothing to report

**`(t.focus || []).join(' · ')` against a fixture holding the string `"Maths"`.** A string has no
`.join`, so it threw — and `paint` in shell.js wraps every `screen.draw()` in a try/catch and
replaces the screen with a card reading *"This screen did not draw"*. That card is short, has no
overflow, no small tap target and no low-contrast text, so **it measures perfectly**: `check/ui.js`
printed `nothing to report.` across 88 combinations while the app rendered an error message where a
person's profile should have been. `pageerror` never fired, because nothing was uncaught.

**Fifth costume of the `check-booking.js` fault** — a check that cannot reach its subject reporting
that the subject is fine. `paint`'s catch is right and stays: the rest of the app genuinely is fine
and taking the page down would be worse for whoever is using it. What was missing is that the LAB
has to be able to tell the difference. `check/ui.js` asks the rendered page whether that card is on
it, groups it like every other finding so one broken card across eight combinations is one line, and
exits 1. **Proved by mutation**: the rule names the thrown message at four widths.

**Three separate faults from one bug, and the shape is worth the entry.** The card assumed a shape;
the fixture stated a shape `doGet` does not send (`focus` as a string, `extraQuals` as an array,
`detailsConfirmed` as a boolean); and the check could not see either. The card reads all three forms
through `profList_` now — array, comma-separated cell, or single value, exactly as `asList_` does for
the funnel — declared in `cards.js` rather than borrowed, because `cards.js` loads before `find.js`
and a card that works only once the funnel has loaded is a card that breaks on the first screen
somebody opens.
