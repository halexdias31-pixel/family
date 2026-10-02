## The library is a file and the app still would not start without the backend

**Reported from the live site with a screenshot of the splash**: *"the loading is taking forever.
surely, it shouldnt take long anymore as its pulling info from live file not from appscript
anymore."* That reading is exactly right and it was not what happened.

**Measured with the backend hanging and a student signed in from a previous visit:**

| | before | after |
|---|---|---|
| splash | **60.8 s** | **15.4 s** |
| questions in the library | **0** | **5,127** |
| their paper | **0 questions** | 41, 36 of them with a Check |
| signed in as themselves | yes | yes |
| marking | works | works |

**Two separate faults, and the first one is one `if`.** `libraryInto_`, `libraryExtras_` and
`settingsInto_` all sat inside `if (d && !d.error)` — so the questions, the practicals, the brand,
the facets and the columns, every one of them a FILE in this repository fetched in parallel with the
payload and usually landed long before it, were merged onto the payload **or not at all**. A backend
that answered slowly did not delay the library; **it deleted it.**

**So the files stand on their own.** `filesOnly_` builds `DATA` from them on both failure paths.
It is the same rule the files already carry one level down — `libraryExtras_` and `settingsInto_`
leave a key alone when their file has no rows — pointed at the other failure: **a file with rows
should win over a payload that never came.** It declines if a good payload is already standing, so a
failed retry cannot empty a screen that is working, which is the `nothingHere` argument wearing the
other coat.

**What is still lost without the backend, said rather than implied**: people, jobs, prices, the
shop, posts and messages. A student's paper, their answers, the marking and the mark schemes are all
here, because each is a file or the device's own storage.

### The deadline was right and it was answering a different question

**Sixty seconds is not the fault and its own note says why**: this backend answers in about fifteen,
and a deadline under the thing it is timing reports a healthy backend as a dead one — *"that
happened, at twelve seconds, and cost an afternoon."* That argument is about **when to stop
waiting**. The splash is a different question — **when there is enough to show** — and the answer is
as soon as the files have landed, which is usually long before the payload.

**So it comes up at `SPLASH_SAY_AFTER`, the same fifteen seconds the slow-load line already uses**,
and deliberately the same constant rather than a second number: that line is the app saying *this is
taking longer than it should*, and the moment it becomes true is exactly the moment to stop waiting
to draw. **Nothing is cancelled** — the payload lands behind the app and repaints, which is the
ordinary late-payload path.

**Why it survived this long.** Every measurement of this failure had already been taken and recorded
two sections up — *"the backend never answers → 8/9 screens, splash lifted at 60s"* — and read as
the deadline working. It was. What nobody asked is what was ON those screens, and the answer was a
Find screen with no questions in it.
