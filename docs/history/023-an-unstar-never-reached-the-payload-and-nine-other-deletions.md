## An unstar never reached the payload, and nine other deletions did not either

**`POST_WROTE`'s own note says it plainly**: *"`setCell` and `addRow` are the two functions that put
anything into a spreadsheet, and the payload is stale if and only if one of them succeeded."* They
are the two that ADD. **Nine places called `t.sheet.deleteRow(row._row)` straight through to the
sheet** and not one set the flag, so a deletion never retired the six-hour payload.

**On a favourite that means the star comes back.** The row leaves the sheet and stays in the copy
every phone is served; `adoptFavourites_` replaces the local set with the payload's, so the next load
puts back what you just took off. Nothing fails, nothing is logged, and it reads as the app ignoring
a tap. Deleting a link, taking a reaction off a post, changing a poll vote and withdrawing from a
class were all the same.

**The fix is the rule and not the instance**, which is the argument this file makes about `cost: 0`
and `paper: true` — both repaired in the data, neither in the rule, so the shape came back.
`delRow(t, row)` sits beside `setCell` and `addRow`, sets the same flag, and keeps `t.rows` in step:
a handler that removes a row and then counts what is left was counting the row it had just removed,
and every later `_row` shifts up by one when a sheet row goes. The nine callers got away with it only
because each deletes one row and returns.

**`check-backend.js` fails on a tenth.** A grep rather than a parse, because the question — does this
string appear outside the one function allowed to use it — has exactly one right answer and no scope
to get wrong. `setValue` and `appendRow` are deliberately not asked about: both are ordinary Apps
Script and a future helper may legitimately want one, and a rule that fires on the honest case is a
rule somebody switches off. **Proved by mutation**, and its first version fired on the block comment
explaining the rule — so the comment block is tracked opener-to-closer rather than guessed at from
how a line happens to start. Its summary names which of its two questions failed, instead of always
saying the first; same fault as "all 18 checks pass".

### And underneath that, no favourite had ever been written at all

**I got this audit wrong, and the correction is the entry.** I traced the round-trip by reading —
star, POST, `favourites` tab, `doGet`, `adoptFavourites_` — found the `delRow` fault above, and
wrote "does it work? yes, end to end". **It has never written a single row.** What is on the wire,
measured rather than read, is:

```
{"0":"f","1":"a","2":"v","3":"o","4":"u","5":"r","6":"i","7":"t","8":"e","token":"TK"}
```

**`function send(body)` takes ONE argument and `toggleFav` passed two.** The object is dropped, the
string becomes the body, and `api`'s `Object.assign({}, body)` spreads it into indexed keys. `doPost`
reads `S(body.action)` as `''`, `accessDenied` refuses it before the handler, and `.catch(() => {})`
threw the refusal away. The `delRow` fix above is still right and still needed; it was repairing the
second-order problem while the first-order one was that nothing was ever written.

**It is worse than device-only.** `DATA.favourites` therefore always comes back empty, and
`adoptFavourites_` replaces `FAVS` with it AND overwrites `localStorage` — so a star survives until
the next payload lands and is then wiped from the device too. One page view.

**`collections.js` HAS THE WHOLE ARGUMENT WRITTEN OUT**, twenty lines of it, because `toggleSpot` was
this exact bug and was fixed: *"the body was the STRING 'spotlight' and the whole object… was dropped
on the floor"*, and *"`.catch(() => {})` MADE IT LOOK LIKE IT WORKED"*. The star it was copied from
kept the fault. So did `claimChild` and `answerClaim` in `me.js` — and those two are **louder**,
because they have no `.catch` at all: `send` throws on the refusal, the `.then` never runs, and a
parent pressing "Add your child" gets no toast, no closed sheet and no error. Nothing happens.

**So the rule is in `check-replies.js`**, which is the file named for exactly this — a refusal not
reported as a refusal, one step earlier. It asks arity and nothing else: does a call to `send` pass
more than one argument. One question, one right answer, no scope to get wrong — the `check-rows.js`
lesson again. **Proved by mutation**: putting the old form back names `find.js:3969` and exits 1.

**Three instances, two files, one fix each time, and the rule arrived on the fourth.** That is the
sentence this file writes about `cost: 0`, about `paper: true`, about the spelling fold and about
`delRow` above it. **The workflow that found it was right and I was wrong**, which is worth recording
as plainly as the bug: I reasoned about the round-trip instead of measuring the request, which is the
same mistake as `ansBox_` ("I reasoned about the DOM instead of asking it") and as `.mat-out` being
fixed twice on a measurement nobody took.
