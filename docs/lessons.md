# The kinds of lesson

The owner, Oct 2026: *"Figure out all the different kinds of lessons there are."* This is the list a tutoring
business like this one can offer, what each needs, how the site carries it today, and what is missing. It is a
planning note, not a spec: nothing here is built unless marked **today**.

What the site has today, for reference: booking asks **Format** (`BOOK_FORMATS` in core.js: `Tutoring`,
`Practical`, `Trip`; history 353), then who it is for, subject, level, tutor, extra seats (a group), venue and
whether the family hosts, the hours, the term (`interval`) and a cost split. A session is a job with seats
(`seatsOf_`), so joining something already going is a group lesson. Holiday clubs are the festive cards
(`festiveCard`, book.js). Children see no prices and a parent books (398).

## The list

| Kind | Typical length | Ratio | Materials | Today | Gaps |
|---|---|---|---|---|---|
| **1:1 tutoring** | 60 min (45 for KS1, 90 for GCSE/A level) | 1:1 | Find's questions, the whiteboard, the learner's own books | **Format: Tutoring**, seats 1, venue/hosting, weekly over a term | Nothing to say it is 1:1 rather than a group of one; no per-session plan |
| **Small group** | 60–90 min | 1:2 to 1:6 | One set of questions for the group, printed sheets | **Tutoring + extra seats / "something already going"**; seats left shown | No group roster view for the tutor on the day; one price shape per head only via split |
| **Exam prep / revision course** | 2–3 h blocks over a holiday or the weeks before an exam | 1:4 to 1:10 | Past papers (the library's `Past paper` cards), mark schemes, mocks | Booked as Tutoring; papers found in Find | No "course" that is several dated sessions bought together; no exam date on the booking |
| **Homework help / drop-in** | 30–60 min, after school | 1:3 to 1:8 | The school's own homework | Tutoring, as a short slot | No drop-in (turn up without booking a seat); no place to attach the homework (see below) |
| **Practical / lab** | 90–120 min | 1:4 to 1:8, with a second adult for heat or chemicals | The practical's kit list and method (`data/practicals.json`), a risk note | **Format: Practical** — asks which practical; venue/hosting | Kit list is not turned into what the family must bring; no risk-assessment tick for the tutor |
| **Trip** | Half or whole day | 1:6 to 1:10 by age, more adults under 8 | Tickets, a consent form, a meeting point | **Format: Trip** — asks which trip; place and cost are the trip's | No consent/medical form; no adult-helper sign-up |
| **Holiday club** | Mornings or full days across a holiday week | 1:8 | A theme, games, snacks | **Festive cards** (`joinFestive`); a parent joins | Not a Format; days chosen as one block only |
| **Online lesson** | 45–60 min | 1:1 or small group | A video call link, the shared whiteboard, screen-shared questions | Not distinct: a Tutoring booking with no venue | No call link on the session; whiteboard is per person, not shared live |
| **Assessment / mock exam** | 1–2.5 h, timed | 1:many, invigilated | A full paper, a timer, marking afterwards | Papers in Find; marking per question | No timed-paper mode with a single score; no "assessment" booking |
| **Parent consultation** | 15–30 min | tutor : parent(s) | The learner's progress (the Progress screen) | Messages (`dm`) only | No bookable consultation slot; no shared progress summary to talk over |
| **Coursework / NEA support** | 60 min, a few over a term | 1:1 | The candidate's own draft, the board's rules on help allowed | Tutoring | Nothing to note what help was given (boards require it); projects list (`data/projects.json`) is separate |
| **Taster / first lesson** | 30 min | 1:1 | A short diagnostic set | Tutoring | No free or reduced first session; no diagnostic set picked by level |
| **Intensive / catch-up block** | Daily for a week | 1:1 or small group | A plan per day | Tutoring over an `interval` | No block discount or day-by-day plan |
| **Enrichment (chess, coding, games)** | 60 min | 1:4 to 1:8 | The Games screen (chess, console) | Games screen exists; booked as Tutoring | No format; nothing links a club session to its game |

**Suggested Formats** if the booking list grows: keep `Tutoring` (with group-ness from seats), `Practical`,
`Trip`, and add `Online`, `Assessment`, `Consultation` and `Club` — each a word in `BOOK_FORMATS` with the steps
it skips in `only:` as `Practical` and `Trip` do now. Exam prep and holiday weeks are better as a *course* (several
sessions sold together) than as more Formats.

## History and homework

**History** (past sessions). The jobs and receipts already hold every session a learner had. A *Sessions* list on
the Progress screen, newest first, each row the date, tutor, Format and subject, would need no new data: it is the
learner's jobs whose time has passed. Each row could open to what was done — the questions answered that day
(already stored per answer with a time) and anything drawn on the whiteboard — so a parent sees the lesson, not
just that it happened.

**Homework.** Smallest useful version: the tutor picks questions in Find and sends them as a set ("Set as
homework", a tile under a question or a paper) with a due date; the learner sees them under Saved with the date,
answers them on the same question pages, and the tutor sees which were done and the marks the machine gave. This
reuses Saved, the answer store and marking; the new pieces are the set itself (a sheet tab: learner, question ids,
due, set by) and one tile. The school's own homework (homework help) could be a photo — the whiteboard now takes
a picture (402), so a learner can put a worksheet on the board and work over it.

Not built: neither needs to be until the owner picks one.
