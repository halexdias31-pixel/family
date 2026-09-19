# glossary

| id | area | kind | rule | because | source | active |
|---|---|---|---|---|---|---|
| GL-01 | Booking | term | JOB — one booked session or one waiting list. The row in the jobs tab. | Everything else in booking is a property of a job. | jobs tab | TRUE |
| GL-02 | Booking | term | CLASS — a job that has a day and a time and will run. |  | book.js | TRUE |
| GL-03 | Booking | term | WAITING LIST — a job with no day and no time, waiting for enough people. | isWaitJob_ reads job.kind, not the seat count: a class with two seats left is not a list. | book.js | TRUE |
| GL-04 | Booking | term | SEAT — one place in a job. n stores the TOTAL, though the label reads as extras. | Pricing, capacity and the roster all read n. Changing what it means puts all three out by one. | book.js BK-024 | TRUE |
| GL-05 | Booking | term | VENUE / SPACE — a bookable place. HOME means no room cost, whatever it is called. |  | core.js isHome | TRUE |
| GL-06 | Learning | term | RESOURCE — anything a student works from. A paper or a worksheet. | Derived by grouping question rows on paper_id. Never stored separately. | find.js | TRUE |
| GL-07 | Learning | term | PAPER — a real exam paper. Gets a card laid out like an exam cover. |  | find.js paperish_ | TRUE |
| GL-08 | Learning | term | WORKSHEET — a topic sheet. ONE card; its questions are not cards. | Nobody wants the seventeenth question of a times-tables sheet. They want the sheet. | find.js RS-02 | TRUE |
| GL-09 | Learning | term | STEM — the shared preamble above several parts. Never a card of its own. | It has no marks and no answer. Alone it reads as a question with the question missing. | questions.kind | TRUE |
| GL-10 | Learning | term | PART — one lettered piece of a question. a, b, ii. |  | questions.part | TRUE |
| GL-11 | Learning | term | TOPIC — a leaf in the topicstuff tree. AREA is the top of that tree. |  | topicstuff | TRUE |
| GL-12 | App | term | WIDGET — a thing you use rather than find. A TOOL or a GAME. | Declared in WIDGETS in map.js, which is the last list still living in code. | map.js | TRUE |
| GL-13 | App | term | CARD — one item in a list. TILE — one mark on a card. PANE — the surface a screen's cards sit on. |  | style.css | TRUE |
| GL-14 | App | term | COLUMN — one place you swipe to. WIDGET here means one screenful within a column. | The layout sheet uses both senses. A column holds widgets stacked vertically. | layout tab | TRUE |
| GL-15 | App | term | FUNNEL — the finder's chain of questions. FACET — one question. CHIP — one answer given. |  | find.js | TRUE |
| GL-16 | People | term | CLIENT — a paying family. STUDENT — the child. They are different rows. | A client can have several students, and a student has no PIN. | people tab | TRUE |
| GL-17 | People | term | TUTOR — self-employed, sets their own rate, may send a substitute. | The agreement is built on that and the whole status argument depends on it. | terms tab | TRUE |
| GL-18 | Money | term | CREDITS are spent and never earned by playing. XP is earned and never spent. | Two currencies that do the same job is one currency with a confusing name. | me.js | TRUE |
