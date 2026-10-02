## Your settings are a column, and the tile that opened them was drawn on no screen

**Asked for as "account setting should appear in a new column by itself. For now make that new
column at the end."** What was there was one sheet — `openSheet('Your details', …)` — holding the
profile form, a week of seventy-seven tickboxes, the username and the PIN.

**MOVED, NOT COPIED, AND THE IDS ARE THE REASON.** `handle-new`, `handle-said`, `pin-now`,
`pin-new`, `pin-again`, `pin-said` and `me-said` are all looked up with `$()`. Drawing them on a
column AND leaving them in a sheet puts two elements under one id on the page at once, and `$()`
hands every Save button the first of them — **the `$('msg-text')` bug this file already records**,
where a reply typed into the second thread posted to the first. So the sheet is gone.

**ONE THING PER PAGE, BECAUSE `.pane` IS `overflow: hidden`.** `#sheet-body` scrolls and a pane does
not. Measured at the four widths: **five pages, 237–400px each, `over = 0` everywhere** against a
pane capping at 534px on a 320×568 phone. Each group the backend sends is a page, then the username,
then the PIN.

**AND EACH PAGE SAVES ITSELF, WHICH THE BACKEND ALREADY ALLOWS.** `updateProfile` does
`wanted.forEach(f => setCell(…))`, so a partial post cannot blank what it did not name. **The one
exception is the timetable**: `availGridIn(fields)` rebuilds the whole `availability` cell from
whatever hour codes arrive, so a half-sent week would erase the other half. That is why `me-save`'s
container is `.me-form` — the card's own form — before `#sheet-body` and `.widget-slot`: with
`document.body` as the container a Save on *About you* would have gathered the seventy-seven hour
codes on the page below it as well. **Measured on the wire**: page 0's Save posts
`{first_name, last_name, photo}` and nothing else.

**`settings` IS A SCREEN ID AND `js/settings.js` IS ABOUT THE SHEET EXPORTS.** Two different things
wearing one word, which is what `kind` colliding with two columns already cost. Named in the code
rather than discovered: nothing in `js/settings.js` reads a screen and nothing in the column reads
`data/settings/*.json`.

**Sign out stays on your account card.** It is not a setting, it is the one action that must be
reachable without knowing where anything is. Drawing it here as well would be two doors to one
action.

### `kind: 'me'` is a kind nothing had ever built, so four tiles were on no screen at all

**`cardTiles_` routes `meTiles_` on `x.kind === 'me'` and, measured across `js/`, `kind: 'me'`
occurs nowhere.** So `Edit your details`, `Add your child`, `Your figure` and `Build` — four tiles,
written, styled, each with a live handler behind it — **were drawn nowhere**, and the sheet they
opened had no door. `accountPages_`'s `asItem_` builds `kind: 'tutor'` for everybody including you.

**A renderer left standing over a permanently false condition**, which is the shape recorded here
under `resource_type` in `VOCAB`, under the dead `kind === 'paper'` guard, and under the unlisted
tutor this same function used to filter away.

**`check-doors.js` could not see it and says why itself**: it pairs a `data-do` STRING against an
`on()` handler, and both halves were there — what was missing is anything that DRAWS the string.
That is a fourth kind of gap beside the three that file already names, and it is the one a checker
reading source cannot close: `meTiles_` is a live function returning a live string, and only asking
a rendered page whether the string is on it settles whether anybody can reach it.

**And `tutor` was wrong on your own row for a second reason**: `tutorTiles_` is Message, so your own
card carried a Message tile addressed to yourself. One kind, two repairs. Others are untouched —
`withTiles_` asks for no kind and still gets `tutor`.

**Proved in the browser**: the tile on your own card lands on `settings`; the column is `paged`,
five pages, `pageCount('settings')` five, and `handle-new`, `pin-now` are one element each.

### And `<h2>` inside a card is a section rule, which `check-dead.js` caught on the first run

**`fieldsHtml` has always emitted `<h2><span>…</span></h2>` for a group heading, and that was right
while its only caller was a sheet.** `#sheet-body h2` has no rules above or below it, *"because the
sheet is one thing rather than a list of things"*. The settings column is a list of things — one
group per card — and on a screen `.screen h2` is something else entirely: a full-width rule above
and below with a `> ` prompt in front, which inside a card is a divider where a title belongs.

**It is also what `split_` cuts on**, and `check-dead.js` states the rule outright — *"a heading
inside a card is an h3, a heading between cards is an h2"* — naming the screenshot it took the last
time an `<h2>` sat in the You card and quietly cut it in two. Measured: **0 findings before, 2
after**, both of them my new cards.

**One option, defaulting to what it always did.** `fieldsHtml` takes `head` and the caller says
which surface it is on — the same move `me-save` makes with its container, and cheaper than a second
renderer differing by one tag. Screenshotted at 390px across all five pages: the card title reads as
a title, and the week grid keeps its own header row.
