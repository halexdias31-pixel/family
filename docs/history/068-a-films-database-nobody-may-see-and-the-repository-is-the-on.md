## A films database nobody may see, and the repository is the one place it cannot go

**Asked for as "i want to add a database for films but i dont want people to be able to see them.
i want to add everything from drive… films, tv shows and so on. adult and kids and docs ect."**

**THE FIRST QUESTION IN THIS FILE'S OWN THREE-QUESTION TEST ANSWERS IT BEFORE THE OTHERS GET A
TURN.** *"Is it secret? → a sheet, never here. This repository is PUBLIC; anything committed is
published, and git history is permanent."* A list the owner has said they do not want people to see
is secret by that description, so `data/films.json` was never available — not as a preference, as
the rule this file opens with.

**And the Drive folder is already `anyone: reader`.** Measured before anything was written:
`{"role":"reader","type":"anyone"}` on `1SIFvXCYBghJMiGc…`, inherited by every film, every series
and every episode under it. **So the file ids ARE the protection** — publishing them in a public
repository turns "anyone with the link" into "anyone", permanently, for about twenty-five films and
several hundred episodes of commercial television. Reported to the owner, who chose to leave the
sharing as it is; nothing here depends on it either way.

### A private sheet is still not hidden, and that is the part that is easy to get wrong

**`doGet` SERVES `ANYONE_ANONYMOUS`.** A tab the backend forwards lands in the JSON of every
visitor who opens the site, whether or not a single screen draws it — so hiding films on the phone
is a filter anybody reads past with the network tab open. This is the shape the app already pays
for elsewhere in reverse: `MESSAGING` is not repeated on the phone because a rule written twice is
two rules to keep in step.

**So the gate is the READ, not a filter after it.** `filmsOut` is built inside
`if (viewerIsAdmin)` and is `[]` for everybody else, so there is one place that decides and it is
the place that opens the tab — a later line that forgets to check has nothing to forward, and a
non-admin never pays for the scan. **Measured in a browser on the two payloads `doGet` actually
sends**: an admin gets 3 films and `Films` as an answer under `What for · Learning`; everybody else
gets **no films, no funnel answer and no card** — absent by construction rather than filtered, which
is the move this file already records for the reel booking.

**`drive_id` is deliberately not sent.** `drive_url` is built from it in the sheet and is the only
form anything opens, so shipping both would be one fact twice — the `handle`/`username` shape this
file has paid for three times.

### One row per film or series, and 62 episodes is not 62 rows

**An episode is not a thing anybody searches for.** You choose the show and then the episode, and
Drive's own folder view already does the second half — so a five-season show is one row with a
folder link, and `file_kind` is the column that says which of the two addresses to build. Same
judgement the funnel already makes about tools: the thing you choose is the thing that gets a row.

**22 rows: 17 films, 4 series, 1 documentary; 20 adults, 2 kids.** `audience` is **which folder a
thing came out of and not a rating** — nothing in this app decides who may watch what from it,
because the whole tab is admin-only before it leaves the server. And it is its own field rather than
`subject`, which is the `boxKind` mistake this file records: a weight division written into
`subject` put Heavyweight on the Subject question beside Maths.

**What is filled in and what is blank is the rule this file states three times.** A year only where
the filename says it; a director or a lead only where the title is unambiguous. `Michael` and
`Obsession` each name more than one film and the file does not settle which, so both carry a note
saying so and nothing else — **16 of 22 have a year, 12 a director, 12 a lead**. A wrong director on
a card is a fact nobody re-checks.

**`There Will Be Blood` was asked for by name and is NOT in the Drive.** The folder holds an entry
with that title and it is a **1 KB Google Doc**, not the film. So the row is there, marked
`placeholder`, drawing *"Not in the drive yet"* where the link would be — the library's own column
one table along, and the same argument: a card that states the gap beats a link that opens nothing.
`The Case for Christ`, also asked for, was **already there** as a real 1 GB file.

**The catalogue itself is a private Google Sheet in the owner's Drive**, owner-only, for importing
into `Ledger` — which is the path every bulk import in this project has taken. Nothing real is in
the repository: `check/fixture.json`'s three film rows are invented, hold `example.org` addresses,
and exist for the three SHAPES the card can take (a very long title against the flag, a series with
no year, a placeholder with no link).

**It opens Drive and does not embed.** `clipSrcs_` spends forty lines on a ladder of three
addresses and an iframe fallback, and that was worth building for a two-clip column this app owns —
a three-gigabyte `.mkv` is not: no browser plays Matroska, and Drive's own player already does it.
The tile is a door. `tile_` answers an absolute `http(s)` address with an `<a target="_blank">`,
which is the one exception the house style leaves open and the reason that test sits where
`check-surfaces` can see it.

### `check-rows.js` depended on which quote somebody typed

**The first run of the new tab reported fourteen findings saying `the films tab has no title
column`** — about a tab whose `SCHEMA` entry names it. `SCHEMA` is sliced out of the source by
regex and the column matcher was `/"([^"]+)"/g`: **double quotes only.** Every existing entry
happened to be written that way, so the rule held by luck, and the first tab added with single
quotes came back with **zero columns**.

**The failure is loud and in the wrong direction**, which is what makes it worth the entry: not a
silence but fourteen confident wrong answers, in the one report whose own note says 95 findings
with 2 real ones in them is worse than no check at all. A check with a trapdoor under it that
nothing anywhere mentioned. Both quote styles now, and the entry matches the file's own style
anyway. **Proved by mutation**: the old regex against a single-quoted entry exits 1.

### And the lab is looking at it

**`only:` for the second time in `check/ui.js`, and for a stronger reason than the flyer widget's.**
That one is a roster gate on the phone; this is the payload — a signed-out visitor has no rows, no
answer and nothing to measure, so asking them to reach it would report a fault about the check.
20 states, **132 combinations**, nothing new. Cards measure 159–195px against an 807px pane, no
sideways scroll, and the links come out `target="_blank"` on the real address.
