## A post could be reacted to and not talked about

**Asked for on the whiteboard as "should be able to comment on posts".** A reaction says how a
photograph landed and cannot say anything else; a post of a child's first A in a mock is a thing
people want to write a sentence about.

**`post_comments` is the reaction's tab one column wider** — a post_id, a person_id, what they said
and when — and `addComment` is `reactPost` with the one-per-person lookup taken out. That removal is
the only real difference and it is worth stating: a reaction and a vote are a CHOICE, so pressing
again changes or withdraws it; **a remark is not a choice**, and somebody who says two things has
said two things. Three tabs with one shape is three things that behave the same way.

**Two absences are decisions.** There is no `parent_id`: a reply to a comment is a tree, and a tree
is a second reading order on a surface whose whole job is one photograph. And there is no EDIT — a
comment is a thing somebody said in public. It can be taken down, by its author or by an admin, and
`active` is a cell rather than a deleted row for the reason `approved` already gives on a post: the
comment you took down is the one you may need to show somebody afterwards.

**`canRemove` is computed on the server and drawn on the phone.** An admin may take down anybody's
and an author only their own — repeating that on the phone would be two copies of one policy, which
is the fault recorded here under `MESSAGING`, under `kinds` and under `childrenOf`. The handler
checks again anyway, because a button is not a permission.

**Names, not ids, and `mine` rather than the id** — the same decision `reactions.by` records one
block up: a comment is public and an id is not, and `P17390421 said …` tells nobody anything.

### It draws nothing at all until the backend is deployed, and that is the `|| []` rule

**`doGet` sends `comments` on every post from this version. An older deployment sends no such key**
— and `|| []` would turn that into "no comments yet" under a composer posting into `accessDenied`,
which is this repository's worst shape: *I did not manage to look, reported as I looked and there
was nothing there.* `Array.isArray(p.comments.list)` is the test, and an absent key draws **nothing**:
not an empty thread, not a box. A feature that has not arrived looks like a feature that is not
there.

**That gap is real and may be days.** `pullFromGitHub` is blocked on the Cloud-project switch and
clasp is unconfigured — see "Deploying" — so the front end reaches Pages in a minute and the backend
reaches Apps Script when somebody runs it. **`?setup=1` has to run as well**, or `ensureSchema` has
never created the `post_comments` tab.

### Not bubbles, and that is the decision worth writing down

Messages got bubbles in the commit before this one because a conversation between TWO people is read
by side. **A comment thread is many people talking about one photograph, and there is no side for a
fourth person to be on** — so it is the name, then what they said, on a line that wraps, which is
exactly what `.post-cap` already is, because the caption IS the first comment. Yours is marked by
the rule down the left that messages gave up when they became bubbles: the shape that rule was
always right for.

**`Remove` was 31x13 and `check/ui.js` named it at three widths.** It looks like text and it is 44px
now — underlined because `check-css.js` fails a tappable thing that reads as plain text, and 44px
because a control you cannot hit is not one that is rarely used, it is one that is not there. The
height goes on the time LINE and only where there is a button on it (`:has`), because an admin sees
a Remove under every comment and 44px of nothing under the rest is worse than the fault.

### `2026-09-15` was read as 26 September 2015

**Found by a comment timestamp, and it is not the comment's bug.** `parseWhen` in data.js is the one
place this app turns a written date into a Date — every `ago()` on every surface goes through it —
and its day-month-year match **was not anchored**. On a four-digit year the regex engine simply
started later in the string: `\d{1,2}` cannot take `2026`, so it slid along to `26-09-15` and read
day 26, month 9, year 15. `2017-05-25` came out as **17 May 2025**.

**A plausible date, a confident sentence, wrong by eleven years, and nothing could have noticed.**
`new Date(t)` four lines down was already right about ISO and never got the chance, because an
unanchored regex earlier in the function had always matched first. The fix is an anchored ISO branch
above it, built field by field rather than handed to `new Date(string)` — `new Date('2026-09-15')`
is UTC midnight and `new Date('2026-09-15 18:20')` is local, and the same function putting a date
either side of midnight depending on whether somebody typed a time is the timezone fault `waveOf`
already cost this app seven buttons over.

**`node js/check-dates.js`, on the roster**, because this is the `cost: 0` sentence for the seventh
time: a fault repaired in the instance and not in the rule comes back. Eight forms, both families —
the ISO one a sheet cell and a data file hold, and the `15/09/26 18:20` one `fmtDateTime` sends.
**Proved in both directions**: the old parser fails four of the eight and exits 1; the new one
passes all eight.

**And the comment's own timestamp goes through `fmtDateTime`**, which is what a message already
sends. `S(c.said_on)` on a sheet Date is whatever `String()` makes of it, and a second spelling of a
timestamp is a second thing for `parseWhen` to get right.

### `check-rows.js` caught the one thing that would have mattered

**The first version asked `post.person_id` and the posts tab has no such column.** Whose post it is
lives in `author`, resolved through `findPerson` — and that test is what decides whether somebody
may write under a photograph that is waiting for approval. `check-columns.js` could not see it
(`person_id` is a column of four other tabs); **the check that asks whether a name is a column of
THIS tab is the one that names it**, which is the fault it was written for.
