# The queue

Claude owns the site (rules.json rule 0.1) and prompts itself from this list: when one item ships, the next starts at once; the hourly run is only the safety net. Claude adds, orders and removes items itself. The owner's Suggest register (Ledger tab `claude_notes`) is an inbox only: anything there is read, turned into an item here (or done at once), and closed.

An item ships only when every check passes and a count goes up. Questions for the owner are asked in conversation, a few at a time (the list at the bottom is Claude's own memory of them).

## NEXT, IN ORDER (24 Nov, 23:00; owner agreed)
1. Pen button (drawing only while a pen tile is on); no Flag anywhere. [done, PR 726]
2. Find: GENERAL BEFORE SPECIFIC — tag A before tag B when every B answer sits inside one A answer, worked out once from all data; forward taps only; a check walks every item.
3. Plain look: a blank table cell looks like an empty paper cell (no "Type your answer" box); nothing special-looking.
4. Science library → questions: walk physics, chemistry, biology as a child; fix at the root.
5. Outside worksheets kept and faithful: corner letters on shapes (Corbettmaths, First Class Maths).
6. @family library: DfE spec SSOT → cards tagged by board → generated questions (id = card + template version + numbers; the question as seen is saved with each answer, so a spec fix never loses or re-marks work) → written bank for explain-style and English. [maths tree done PR 733; science tree done PR 735 (9,099/18,520 tagged); generator next]
7. BUTTONS, 21 → 7 (owner, 24 Nov night): keep Check, Read aloud, Share, ONE PEN, ONE MEASURE (ruler + protractor), Undo, Calculator. Remove Insert (inserts are found by tag), Magnifier, Help, Speed read, Point, Line, Shade, Compass, Clear, Lock (pen on = page still), Show the answer (answers are their own static cards), Make available offline, Revise this. THE ONE PEN: a tap is a dot; a near-straight stroke snaps straight; a curve is smoothed; a near-circle/arc snaps to a true circle/arc.
8. One card type, the question card the model; Find's menu included.
9. (End) Reading books, KS1–2: procedurally generated from the gov spec (phonics phases / NC reading), our own Biff-Chip-Kipper-style stages.
The hourly run follows this list; anything a child or the owner sees is asked first.

## OWNER'S ANSWERS (24 Nov, night)
- Pen button: drawing only while a pen tile is on (in progress). Answering = type or pen, the one sheet; no further reshaping.
- No flags anywhere, messages included.
- Students must never lose progress: check saved work survives every change.
- Find: wants a PRINCIPLE, not a hand-fixed order. Proposed: general before specific — tag A goes before tag B when every B answer sits inside one A answer, worked out once from all the data (never from what is on screen), so the order is the same everywhere and only forward taps are needed. Awaiting yes.
- Library: SSOT = government specs (DfE). @family cards teach every spec point; each card tagged with the boards that include it (AQA, Edexcel…). Procedurally generated questions per card, Corbettmaths/First Class Maths quality as the bar. Keep outside worksheets meanwhile.
- Bug: Corbettmaths/First Class Maths diagrams lose the corner letters of shapes.
- Docket: Siri/Gemini via the private address; set up the iPhone Shortcut.

## OWNER'S LIST (24 Nov, evening; in this order, under THE OWNER'S LAW)
1. One answer sheet (in progress).
2. ONE FIXED PATH in Find: the "narrows most" rule makes the order change with the source (Corbettmaths, First Class Maths…), and some things are reachable only by going one way then deleting a tag. Replace with one fixed order of questions for every door; every item reachable by tapping forward only. A check walks every item. Today a maths past paper could not be reached.
3. English extracts load (the server import; in progress).
4. Nothing special-looking: one look for every box, card, chip and button. Audit what looks "fancy" (the answer sheet included) and make it the plain shared look; a check counts distinct looks.
5. Remove the Flag and Save (star) buttons from questions; the Paper/grid tile goes with the answer sheet.
6. Science (physics, chemistry, biology) library → questions "not working": walk it as a child, fix at the root.
7. Everything in-house: @family makes its own worksheets and library (outside sites only as reference), drawings nicer; one source, topics from the government's lists.

## THE OWNER'S LAW (24 Nov, above everything)
"I want to just live my life through the day without any worries or stress." The owner must never have to check up after Claude.
- No new features, screens, buttons, menus or rearranging. Only fixes, and unifying what exists so more is the same.
- The week to protect: Ernie (Monday, practice questions); Finley (online: maths, English, sciences, past papers, library content).
  Before anything else each day, walk exactly those paths as those children (questions load, extracts load, keypad, marking, history). Fix what breaks at the root.
- A change that alters what the owner or a child sees is asked first, in one line. Never surprise.

## THE GOAL (owner, 24 Nov — confirmed "Yes")
Work with every current child, one structure, running smoothly. In order:
1. Lessons smooth for every child (booking, answering, marking, history the same for all).
2. A source chooser in the library and worksheets: First Class Maths, Corbettmaths, Physics & Maths Tutor, the other named sites, and @family. Outside sites stay meanwhile.
3. @family grows into the main source: own questions, worksheets and library, topics and levels from the government (DfE national curriculum KS1–3; DfE GCSE subject content), never arbitrary.
4. A redesign: pretty, memorable, not dull (animations included).

## ORDER (owner, 22 Nov: maximally efficient)

1. Running now: the share picture blank fix; one answer box for cell questions; missing maths papers (1MA1 Foundation gaps, KS2 SATs 2016–18). Already in flight.
2. A faster build: the validator re-checks only changed questions (builds ~40 → ~10 min). Speeds up everything after.
3. Card shapes, 49 → 10. First make the Practice, Library and Shop doors count in `one-card.js`. Owner's favourite; audit done.
4. Answer input types → type, pick, draw. Continues the one-box work.
5. Question buttons, 13 → about 6 + "more" (with the FEWER FEATURES audit). Fewer things a child must learn.
6. Backend actions, about 80 → read, save, delete, list per kind. One request path.
7. Ledger kinds, about 40 → about 10 (with OLD LEDGER TABS, TASKS, and docket/task/assignment/food/favourite as one item kind). One store.
8. Emails → one email card. One look for every message.
9. Find facets and tags (with ONE LEVEL LADDER and PAPER TYPES). One ladder per menu.
10. One card per idea and taxonomy (all library-shape entries). One library shape for every subject.
11. Marking coverage: keys for AQA, then Edexcel, then OCR, then NSW 2024; ESSAYS DISTILLED; MARKING AS ONE SYSTEM. More answers marked right.
12. Docket: signals, Siri phrases, e-ink sensors; FOODS linked to it. Owner's own day.
13. Admin automation; VENUES; DRIVE TIDY; RACER ROADS. Lower child impact.
14. Parked: PRIVATE REPO (owner: not for now).

## Standing rules and owner laws

STANDING (owner, 21 Nov): THE UNIFY ADVENTURE. Keep reducing the number of sources of truth, without end: each round, audit for anything decided, defined or drawn in two places; merge the top items into one source with a build check that stops them drifting; repeat. When nothing else is urgent, this is the default work. HOW (owner OK, 21 Nov): run 5–6 merges at once in separate worktrees (only ones that touch different files), then merge them together and run ONE full build for the batch, then release. (The 21 Nov audit judged unify work past UNIFY POLISH as diminishing returns.)

STANDING (owner, 20 Nov): a new request from the owner goes into this queue at the place it deserves; Claude need not drop current work for it. Only urgent child-facing breakage jumps the queue.

STANDING (owner, 17 Nov): Claude optimises objectively — disagrees openly when the owner's idea is worse, never just affirms; the owner's statements are principles (uniform, minimal sources, lean, memorable, fewest features), not orders to apply blindly.

STANDING (owner, 17 Nov): taxonomy, naming, grouping and cutting features are Claude's to find and decide over time, without being told.

ORDER OF BOARDS (owner, 20 Nov): OCR is the least used board, so it comes last. Work AQA first, then Edexcel, then OCR, in every content and marking item. Australia (NSW) sits after them.

Default order when nothing above says otherwise: what a child or parent would notice first, then what stops things drifting, then new content.

## Detail by step

### 1. Running now
- Share picture blank fix; one answer box for cell questions (tables: one box, any separator).
- Missing maths papers: 1MA1 Foundation gaps, KS2 SATs 2016–18.
- PAPERS FROM THE MANIFEST data-private/paper-sources.json (4,284 PDF links: question papers, mark schemes, inserts — Edexcel and AQA, GCSE and A-Level, from the pages the owner gave 17 Nov): fill any paper the library lacks or has without text/keys, subjects the owner's students take first (GCSE Maths, Biology, Chemistry, Physics, English, History). Check each entry's URL matches its labelled subject (some Edexcel pages link the combined-science files). Coverage 18 Nov (2,084 question papers): 647 in with text, 124 in without text, 1,313 missing; GCSE Maths 62/62/89 (no AQA 8300 at all), History 79/0/112. Typed by hand a paper a pass (no auto-importer): 8300/1F June 2024 drafted, 25 of 41 parts (figures left).
- Typed-in text for the ~2,000 science questions with none: AQA papers from the cards' source_url, mark schemes from AQA's filestore (method: 8461-2306-1F and the seven papers done 17 Nov).
- Examiner reports: find them per board/year (the boards' own sites, Save My Exams, Physics & Maths Tutor), add them to the paper manifest, and use them to sharpen marking (English first).

### 2. A faster build
- The validator (`tools/validate-questions.js`) re-checks only questions changed since the last build; builds drop from about 40 to about 10 minutes.

### 3. Card shapes, 49 → 10
- CARD SHAPES (owner, 22 Nov: "my favourite stuff", do it; audit done): 49 card types and about 40 looks → 10 shapes on renderCard {title, tags, body, actions, picture, state}: Text, Choice, On/off, List (settings), Person, Item, Learning: Question, Learning: Reference, Activity: Record, Activity: Thread. Order: settings Text/Choice → On/off → List → Person → Item → Learning: Reference → Question → Activity → delete bookform and old looks. About 900–1,300 lines. First make the Practice, Library and Shop doors draw in tools/one-card.js (they count 0 today). Then, in order: BACKEND ACTIONS, LEDGER KINDS, QUESTION BUTTONS, EMAILS, FIND FACETS (steps 5–9 above). Each starts with an audit shown to the owner.
- ONE CARD left from 18 Nov (one-card 53/53, kept as a count, not a gate, rule 1.75): Profiles/Booking › the tutor card (`.tcard`, 24 rules keyed on the card) and Messages › Daive (`.daive`, drawn outside the maker).
- THE MASTER DECIDES WHAT A CARD SHOWS (owner, 18 Nov): each kind's card in kinds.json declares its fields, order, limits (e.g. current job only, role words hidden, bio length and quotes); the card code only reads it and draws — no show/hide decisions in code. Move today's code-side choices (profRoleWords_, profJobs_, tutorCardOf_ quotes) into kinds.json.
- ONE HISTORY CARD (owner, 20 Nov): on a student's profile, merge every history-like card (History, Recent activity, Questions stats, Work on next, the per-source worksheet/past-paper progress cards, Grade estimate) into ONE card: progress by source, with the day view inside it. One maker, one place.
- STUDENT PROFILE SHOWS STAFF FORMS (seen 20 Nov on a student's profile): Apply to teach, availability grid, rate and group size, qualifications, jobs, photos, intro video, staff hub, and date of birth 01/01/2000. A child sees only child cards; the master (kinds.json) decides by role.
- HELP BUTTON (owner, 20 Nov): the "I need help" hand does nothing but stay toggled on and play a sound when it is raised. No red anywhere (not the widget, not the button). One look, one sound.
- One form engine (the profile editor's own boxes join the form maker).

### 4. Answer input types → type, pick, draw
- ANSWER FACES (owner, 17 Nov, revised): REMOVE photo marking. KEEP the drawing pad (coordinate grids, transformations, graphs work well and children need it). One systematic rule for where the answer goes: if the paper draws the answer space inside the figure (grid, axes, shape to reflect, number line), the answer IS drawn on that figure in the pad; otherwise it is the one text box. Printed options: the text box, marked forgivingly against the paper's own options. Tables: one box, any separator. Essays are MARKED MECHANICALLY (PEEL / distilled rules) — never "marked by your tutor"; that label is wrong for essays and must go. Loci/constructions/sketches: keyed geometrically where possible on the pad.
- Drawing tools for children: the line tool and the magnifier are sometimes hard to use; watch it at phone size, find the real friction (hit area, loupe size, snapping), fix at the one pad engine.
- HISTORY SHOWS EMPTY BOXES (owner, 20 Nov): an old multi-box answer shows as ", , , , , , T". History (and any answer echo) shows only what was typed, or "(no answer)".
- PHOTO MARKING: removed for good (owner, 22 Nov: "no more photo marking"). Children draw on screen instead; one fewer answer input.

### 5. Question buttons, 13 → about 6 + "more"
- FEWER FEATURES (owner, 17 Nov): every button and feature is a cost. Audit them all; cut any a child or tutor can do without; the fewer there are, the more stable and easy the site. Show the before/after button count. Starts with the question buttons.
- A one-tap "this mark is wrong" on every marked answer (one of the kept buttons); each report becomes a permanent example in an answer bank the marker must keep passing.

### 6. Backend actions, about 80 → read, save, delete, list per kind
- One request path (the Docket's Now/Next waits on it). Starts with an audit shown to the owner.

### 7. Ledger kinds, about 40 → about 10
- One item kind for docket, task, assignment, food and favourite.
- TASKS: a "task" kind in kinds.json (title, notes, due, repeat, list, done, links), owner-only; one form, Find, the items store, reminders via deliver_; one-time import from Google Tasks. Becomes the one item kind.
- OLD LEDGER TABS (owner OK'd): 20 Nov check errors, grep for direct reads, fresh backup, then delete the 47 locked tabs.

### 8. Emails → one email card
- Every email the site sends drawn as one card. Starts with an audit shown to the owner.

### 9. Find facets and tags
- ONE LEVEL LADDER (owner, 17 Nov: KS3 and GCSE showed side by side on one menu, which felt wrong; Claude decides): a menu should offer one ladder of levels without overlaps (KS3 is the years before GCSE; GCSE and KS4 overlap) (the same students, the same papers) — evaluate and merge where they are one thing, so a question lives under one level, not two; same check for KS3/KS4 and the other paired levels.
- PAPER TYPES (owner, 17 Nov): past papers and specimen papers are one kind of thing — one "Exam paper" choice with Past and Specimen inside it (or one step), not two separate tags.
- 5-A-DAY IS A WORKSHEET (owner, 17 Nov): file 5-a-days as worksheets, not their own document type.
- WRONG TOPIC: W-1CM-parallel-lines is tagged "Angles in Parallel Lines" but is gradients / y = mx + c. Retag at the source; check other 1CM sheets for the same.
- Find and people (owner, 17 Nov):
  - The name at the top of Find is always the person's login handle (never first + last name), one form everywhere; the PIN ● tags stay visible the whole time, including after a refresh.
  - Booking asks no questions ("Who is this for?"): Find never asks questions elsewhere; booking's steps are Find steps like every other menu.
  - Subject step bug: two rules at once — the multiple-choice tick rule and the "and / ." rule. Remove the multiple-choice rule; "and" / "." replaces it everywhere.
  - Staff, not Tutor: everywhere the people category says Tutor it is Staff, with Tutor / Coach / Head of Boxing inside it (a coach is found under Staff › Coach).
  - "Add a person" sits at the very top of Profiles: place it where it belongs; decide whether Profile and Settings merge (they overlap) — Claude's call.
  - "Answers" in Find shows only answers (from the 19 Nov deadline list).

### 10. One card per idea and taxonomy
- ONE LIBRARY SHAPE BY TAXONOMY (owner idea, 21 Nov; design agreed): every subject has a taxonomy, declared as data (one settings file, data/settings/taxonomy.json: levels, e.g. maths strand>topic>idea, history period>event (+person, place), mechanics make>model>part, chemistry group>element (+property)). Every library entry is one shape: id, part-of, subject, labels. One engine draws menus, topic pages, part-of links, revise-this and hues from the taxonomies; the history/mech/chem special kinds and the three history sources go. Check: every entry reachable in a few taps; no hand-built subject cases. Do it one subject at a time (history first), keeping every child's place.
  - From ONE LIBRARY SHAPE (owner, 18 Nov): History and Religious Studies (and any other subject) have their own irregular branch structures in Library/Find. Examine every subject's branches, pick ONE shape every subject follows (or bring the others to theirs if theirs is better), and move them all to it. Tell the owner what was chosen and why in the weekly list.
  - From LIBRARY TREE: each idea one entry with one "part of" link (subject › topic › subtopic › idea), at most ~3 levels; the same tree drives menus, topic pages, spec links and "revise this".
  - From TAXONOMY NEXT (21 Nov, unify batch 3 did history's papers and topic parts in taxonomy.json): 1 history database columns (histEra, histMaterial…) as taxonomy levels; 2 menus and topic pages drawn from TAXONOMY; 3 a general topic-part check (library.dir); 4 then each subject: its paper boards (AQA, Edexcel, OCR) and its hand facet readers (e.g. mechanics mScope/mMake/mModel) into taxonomy.json.
  - From the 19 Nov deadline list: library and questions joined by one key, the AQA spec point (a sub-subtopic, each with its own visual), keeping both the AQA spec order and Access Tuition's worksheets as they are — plan in docs/library-structure.md; a Maths library from the AQA 8300 spec.
- ONE CARD PER IDEA (owner, 17 Nov; Claude's design): the library holds one card per concept, never per board/book; spec points (every board, level, combined/separate) point at concept cards; level depth is marked inside the one card ([H], [A-Level]); questions link to the same cards. Count: near-duplicate cards left → 0. Then every concept card gets one animation showing the real mechanism (memorable, lean); weak existing animations redone.
- ONE TOPIC-CARD TEMPLATE (owner law, 17 Nov; LEAN): 3 slots in fixed order, empty hidden: the idea in one line; animation/figure; the content the spec point needs, nothing else (no worked examples, common mistakes, quick questions, exam tips). Pipeline enforces; every card conformed at source.
- @FAMILY SCIENCE QUESTIONS FROM THE LIBRARY (owner, 20 Nov): the library is the single source, and there is ONE question kind (owner: no two types). Each library card holds its facts with permanent ids. A question is one record: its wording may point at facts (`{fact id}`) instead of copying them, and its answer comes from the facts it names (`tests: [fact ids]`). How "written" or "generated" a question is depends only on how many facts it points at. Ids for life; each saved answer keeps the question version, wording and answer the student saw, so a library edit never loses or re-marks an answer; a change in meaning makes a new version. Checks: every fact has at least one question; every answer is backed by its facts. Order: (1) split the library into one idea per card, (2) fact ids, (3) the question kind and versioned answers, (4) Biology, Chemistry, Physics questions (AQA 8461/2/3/8464 first). Access Tuition stays as it is.
- Topic cards: QAA MSOR done 19 Nov: 44 new point-by-point cards (TB-QAA-MSOR 2–45, one per benchmark point, 3.8.3 stays the Bayes card), each with a six-step animation; their words wait in import file lib-import-2026-11-19-qaa-msor.json for the Drive upload. Next: BNCC/ENEM/Australian Curriculum topics; Victoria VCE; BNCC Ensino Médio; NSW HSC (2024 syllabus, see the owner list).
- History: more topics built like the Tudors.
- The 85 questions that refer to a Figure with no diagram (232 → 85, 18 Nov: 147 OCR rows drawn from their papers by tools/draw-figures-q3.py), and the 52 whose figure was not transcribed: draw them with tools/figkit.py. Left: AQA 2022–24 GCSE biology/chemistry (raster figures, to hand-draw), OCR geography (resource booklet), a few micrographs. All 147 are imported (18 Nov, in 5 parts; 7 shrunk to fit). Every W-AT science part shows, is drawn right and is marked by the site (no tutor marking).

### 11. Marking coverage
- MARKING AS ONE SYSTEM (owner): exact keys first, spreading to cover everything; where keys haven't reached, rules distilled once offline (mechanical, instant at run time); never live AI; re-distil and tighten over time. The items below are its steps. Board order: AQA, Edexcel, OCR, then NSW 2024.
- Marking keys for the ~9,200 questions that have a written answer but no mechanical key (mostly short science "explain" parts): derive `rule: points` / `accept` from each row's own mark-scheme text; each must pass `tools/validate-questions.js`.
- The 35 keys the check says accept a wrong answer or fail their own drawing. 32 done (18 Nov): 13 drawings were the check not loading the pad's grid (fixed in `tools/validate-questions.js`); 17 one-mark "Is X correct? Give a reason" keys now need the No *and* the reason — their import file waits for the Drive upload. Left: 3 keys that are right (any odd non-multiple of 7, any multiple of 5 not 10, a cross at ½) where the check's made-up wrong answer happens to be a right one.
- MISALIGNED MARK SCHEMES (20 Nov, plus 21 Nov keys finding): ~150 A-level/OCR rows hold the next or previous part's scheme, or only boilerplate ("Marking of lists…"); many stored schemes are also cut off or start with the previous question's scheme (e.g. 8462 1906-1H-034/042/062). Re-align/clean each row's answer from its paper's mark scheme, then key it (including the ~80 AQA chemistry rows skipped 21 Nov). Lists: scratchpad k/skip-log.txt and the batch reports.
- MARKER FIXES at the one marker, each becoming a marker-cases case:
  - Order (20 Nov): a plain accept list ignores order, so "x = 9, y = 5" passes for "x = 5, y = 9" and "Y to X" for "X to Y"; worded points ignore order, so a reversed comparison can pass (1906-1H-076, 2206-1H-071, 2011-2F-067); "high to low" points ignore order; ordered lists with no "to/then" are marked in any order. Make named values and ordered phrases order-aware.
  - "No, because X" (20 Nov): the marker reads "No" as negating the next points, so a right answer starting "No, because…" loses marks. Limit the negation to the clause.
  - Traps found 21 Nov (scratchpad k/traps-21.txt): (1) a point mixing up/down words is cancelled by either direction; (2) one answer word scores only one point; (3) comma lists of key words earn little in points rules; (6) the typo rule passes different words (phototrophism/phototropism, flatter/fatter); (7) [2] only works at the head of a point; a space inside a ~ synonym list splits it.
  - Standard form: the marker can't require it (8464B-2111-2F-043 accepts 89 x 10^7).
- Marking signals: near-miss wrong marks, all-zero questions, repeated retries, logged automatically.
- ESSAYS, DISTILLED (owner approved): build-time only, a big AI reads hundreds of examiner-marked essays (AQA exemplars first) and derives rules/word lists/weights per band; ship only the rules; cap content below the top band. Start with AQA 8700 Paper 1 Q5. Status 20 Nov: all 52 AQA 8700 Q2-Q5 rows keyed `rule: levels <type>`, rubrics in marking.json (kind levels) distilled from 135 AQA exemplars (MS indicative standards + 2026 answers and commentaries); tools/essay-cases.js reports agreement each build. Next: more Q5 exemplars (only 6 so far), real student scripts with examiner marks.

### 12. Docket
- NOW, NEXT (owner's vision, 20 Nov): one source, the Docket, holds each item with what the order needs: list or phase (e.g. eyes open, feet on floor), time window or deadline, how long it takes, importance, energy or fun, and place. A rule-based planner, no AI, works out at any moment: which phase you are in, the first unticked item, and the best order for the rest. Rules: hard time windows first, then deadline, then importance per minute, then batching by place, then energy. The same plan is shown everywhere: the site, the e-ink screen, a phone widget, and one plain-text address that any assistant (Claude, a free Gemini) can read and repeat. Ticks come from anywhere: the site, the e-ink, or a phone shortcut. The phase follows the clock and the ticks. ORDER (owner agreed 21 Nov): 1 whole-day plan, 3 private plain-text address, 2 e-ink page (these are live, see Done), then 4 the rule-based command parser ("add milk to shop", "done shower"), then 5 signals. Done before: lists, ticks, midnight reset, the planner order (rule 1.82), Docket in Find. Builds on one form engine and one request path (step 6).
- HOW IT KNOWS THE LIST (21 Nov): the clock picks the list and ticking off a list's last item moves to the next; signals only push the screen forward, never back, so a missed one never leaves it stuck. Signals are iPhone Shortcuts automations calling the private address: alarm stopped = eyes open, charger unplugged = feet on floor, NFC sticker = shower or leaving, car Bluetooth or CarPlay = car, location or Focus = desk or bedtime. Siri reads the list and 'done X' ticks via the rule-based parser. First: the alarm and car automations, then stickers.
- SENSORS AT THE E-INK (21 Nov, owner's idea; board seen): Waveshare ESP32-S3-ePaper-1.54 V2, 200x200 e-paper, with a mic, a speaker (ES8311 codec), an SHTC3 temperature and humidity sensor, an RTC, a battery, and a header (GP1, GP2, GP9, GP20, 3V3, GND). The mic can hear offline commands (Espressif ESP-SR: wake word and a few fixed phrases, 'done shower'); the speaker can beep or say the next item; a motion sensor by the bed (about £3) or a pressure mat (about £10–15) on the header = feet on floor. All call the same private address as signals. After the Siri step.
- LOW-MAINTENANCE FOODS (owner, 20 Nov; database first, Docket link later): build on the existing food kind (data/settings/foods.json). Each food records: food group (carbs, protein, fruit, dairy, snack…), meals it suits, prep (none, microwave, cook) and minutes, eat on the go (yes/no), where to buy (shop), price, keeps how long, versatility, and the owner's taste rating. A rule-based "low maintenance" score ranks it: no cooking, on the go, quick, easy to buy, tasty. Later a Docket item like "eat carbs" links to its food group and shows the options, lowest-maintenance first; a "rush day" view gives a whole day of no-cook meals (e.g. cereal and milk; ready-cooked sushi rice and smoked salmon). Cost and health views come after. OWNER'S FOODS (21 Nov, from Lidl): protein: salmon, smoked salmon, beef; carbs: ready-made sushi rice. The Docket's 'Meat!' and 'Rice' items are these: Meat! offers salmon, smoked salmon or beef; Rice offers the sushi rice (no cooking, so 'runs by itself' is 0).
- Personal (raise when there's a gap): organise tasks/folders/bedroom; a DIY room scan (photos/LiDAR → 3D) to plan the room; a private "food" list of easy meals (first: microwave sushi rice + salmon + soy, see FOODS); turn what the owner enjoys (family trips to Australia/Brazil) into business angles (those countries' curricula).

### 13. Admin automation, venues, Drive, racer
- AUTOMATE THE UN-AUTOMATABLE (code, no AI): first, a tutor emails qualifications → Apps Script reads it, OCRs attachments via Drive convert, matches names/grades/DBS numbers against fixed lists, fills the profile; owner approves. Then find other manual jobs.
- VENUES (owner, 18 Nov): staff no longer pick venues; the system only needs each person's location (town). Booking matches by location instead of per-tutor venue lists; then remove the venue-picking settings and the tutors_happy_here data. (Card already shows the town only.) Open question: clients see only an area?
- DRIVE TIDY (owner): top split Family / Personal; business side one home per kind of file matching kinds.json. Propose the structure first, move in batches, never delete.
- RACER ROADS: always pull the latest, most complete map data; a much better road massager; any location (the learner's own or chosen); one map source + one massager, no per-place code.

### 14. Parked
- PRIVATE REPO (20 Nov; PARKED 22 Nov, owner: not for now): make the repository private so the source, notes, tools and backend are no longer public; host via GitHub Pro (~$4/month) or Cloudflare Pages (free, needs the owner to make an account once). Then minify/obfuscate the bundle and move more content behind sign-in. Waiting on the owner's choice.

### Best-practice foundations (ongoing, not a step)
- Short rulebook: rules only, history moved to docs/history; first rule 0.1 (literal, universal; Claude owns the site).
- One count per rule, measured across the whole site; a nightly counts page.
- Checks run on every change; a red check stops the merge (CI gate).
- Preview copy before live.

## For the owner (ask in conversation)
- NSW HSC (Australia, New South Wales' school-leaving exam; decided 22 Nov by Claude, owner had no view): the 2024 syllabus, the current one; Australia sits after AQA, Edexcel and OCR.
- English: the copyright-withheld extracts for Nov 2023 P1 (Byatt, Possession) and Nov 2022 P1 (Hemingway) need a full printed copy; papers for June 2021 P2 and Nov 2024 P1/P2 can be added if wanted.
- Drive: the two denied moves; "family console saves"; the old personal folder's trash; keep bible&theology shared?
- Statistics library: build Edexcel GCSE Statistics pages?
- Venues: clients see only an area?

## Done (21–22 Nov)
- BACKEND DEPLOY ROUTE: fixed, the clasp workflow restored (was: pullFromGitHub failed on a default Cloud project; option (a) clasp with a CLASPRC secret chosen).
- UNIFY BATCH 6 (backend refusals, js literals via text_(), tools/lib/gen.js, last hand facet readers and door lists, shop labels and dead code): done.
- UNIFY POLISH (JS near-twins, tile-row helpers, CSS tokens, shared tool helpers): done.
- FORM LEFTOVERS (forms.json leftover budgets back down): done.
- KEYS 21 NOV: 313 keys imported to data-private and packed; the hourly import applies them. (Findings moved to step 11.)
- Docket steps live: the whole-day plan, Now/Next, the e-ink page, the private plain-text address.

## Done earlier (18–19 Nov)
- ONE CARD, LITERALLY (owner, 17–18 Nov): every card from the one maker (`findCard`/`renderCard`); 27/53 → 53/53 on 18 Nov. Settings forms moved to the body block (`.kc-embed`); Tools and Games widgets lost the `.card.is-widget` shell. Leftovers in step 3.
- HISTORY CARD (owner, 18 Nov): a Settings card "History" per student (pick a date, see that day's questions with marks), one backend door running `digestFold_` + `digestSummary_` (backend/digest.gs) over a one-day span, declared in kinds.json (kind `setting`). Now folds into ONE HISTORY CARD (step 3).
- 19 Nov deadline list (Maths, English and the three sciences end to end): share a staff card as a picture, never a link (blank-picture fix running, step 1); the other parts are filed under steps 9–10.
- ROOM LAYOUT TOOL (owner, 22 Nov; VERY LOW PRIORITY, way down the line): an admin-only tool (hidden from everyone else) that lays out a room's shelves by formula, so anyone could use it. Every spot is labelled by shelf letter + row number (A1–A5 top to bottom, B1–B5…). Passes: 1) anchors (fixed spots, e.g. the monitor opposite your head in bed, the icon at eye level on the east side); 2) followers next to their anchor (PC, PS5, cables by the monitor); 3) everything else by score = how often it's used (daily 3, weekly 2, monthly 1) × how easy the spot is to reach (rows 2–3 = 3, row 4 = 2, rows 1/5 = 1, +1 near the desk). Musts: heavy things low; power items near sockets. Fit: each row has its own height (owner, 22 Nov video: rows near the top are shorter, lower rows taller), so an item only goes where it fits; tall or bulky things low. Zones: grab-and-go kit (board games, client stationery) on the shelf by the door. One home per category, labelled; unused for 3 months → box it. Data: room, shelves (letter, wall, nearest bed/door/desk, sockets), items (how often, heavy, power, used with, anchor/zone). Until then, the owner's own room lives in a private Google Sheet. 3D VIEW (owner, 22 Nov; at the end): the tool also draws the room in 3D, made by code from the same data (room size, shelves A–D with rows 1–5, bed, window, door, sockets, each item as a labelled box in its spot), turnable on a phone; no hand drawing.
- EVERY OLD TOOL BACK, ADMIN-ONLY (owner, 22 Nov; way down the queue, near the end): find every tool the site has ever had (git history, docs/history, attic/) and add each back under Tools as a bare-minimum card visible only to admin, so the owner remembers what existed. It can be minimal or even broken; the point is the record, not the function. One card shape (Item), each with its name, what it did, when it was added and removed, and a link to its last working version in git.
- LEDGER KINDS RESULT (22 Nov): the 6 dead kinds were removed with a backup (PR 680). The log and media merges were held back: their kinds carry 9–40 columns each, including job applications' ID data and per-person facts, so a shared 6–7-field shape would lose data or need a mapping layer that saves little. Claude's call: stop merging stored kinds there; the owner's own lists (item family) are the only merge still worth doing, after the Docket work.
- MARKING PRIORITY (owner, 22 Nov): do marking coverage now. Boards that matter: Edexcel for maths, AQA for English, AQA for science. Essay marking is learned from the public examiner reports (the owner has no marked essays): fetch AQA's examiner reports, extract per-question what earns each level, and turn that into level-marking rules.
- UNIFY NEXT (owner, 22 Nov, all approved): 1) CHECKS: about 80 build checks share 3–4 harnesses (load the backend in a vm; open the site in a browser; read data) so they are faster and less flaky. 2) SETTINGS FILES: one source per list (levels, subjects, boards…) across the ~15 settings files. 3) SCREENS AND STEPS: one way to open anything (see below). 4) WORDS: one phrasebook for words.json, labels and error messages. 5) IMPORT TOOLS: one importer with a step per source (papers, keys, mark schemes, inserts, packs). DONE 22 Nov: data/settings/content.json `sources` (paper, markscheme, keypack, insert), shared steps in tools/lib/import.js, run by `node tools/content.js <source>`; tools/one-helper.js fails a tool that writes the library past it (ten older one-off Python row editors still owed). 6) OWNER'S LISTS: Docket, tasks, food, assignments as one list kind. DONE 22 Nov: each declares a kinds.json `list` (name, storage, fields, rules; an assignment marked noAI is track only, no generative AI); one tidy, backend/post-account.gs listTidy_ (assignmentsTidy_, docketPlanTidy_, docketPlanOf_ gone; todoTidy_ and docketTidy_ now only unwrap the `todo` cell; a task or food `item` write goes through it too); one Item draw, js/map.js listItem_; tools/one-list-kind.js checks it. ONE WAY TO OPEN: today a tap can open a bottom sheet, expand a section in place, turn a card into its edit form, or step through a menu ("Doesn't matter" steps); each has its own code, animation and back behaviour. One rule instead: every tap that opens something pushes one "step" the same way, with the same back gesture, the same look and the same code.
- UNIFY AFTER (owner, 23 Nov, all approved, in this order): 7) ONE ANSWER FORMAT: a pick question stores the right choice as its letter, working as a separate note; site, email and marking read the same. 6) ONE TAG SET: a small fixed set of tags, drawn the same everywhere (the email showed 12). 5) EVERY EMAIL CARD IS THE SITE CARD: bookings, messages, reports drawn from the site description (the question card is in hand). 1) labels.json/kinds.json/facets.json labels into the phrasebook. 2) DONE 23 Nov: the ten old Python row editors onto the importer (set-spec-codes.py is the `speccode` source of tools/content.js; the other nine deleted as dead, their rows in the library; tools/one-helper.js owes 0 and fails if one comes back). 3) DONE 23 Nov: the What sort facets and Brand (seven What sort facets are one, documentType read by sortOf_; mMake and shopBrand are one Brand; histKind stays the History taxonomy's level; tools/facet-readers.js fails a second of either). 4) Functional Skills on the key-stage ladder. 8) one date and time format. 9) one loading / nothing here / something broke. 10) one notification kind (email, phone, on-site) sent where the person chose. DONE 23 Nov: 7 (PR 696), 6 (PR 697), 5 (PR 698), 1 and 4 (PR 699).
- UNIFY THE LIBRARY AND PRACTICE (owner, 23 Nov: "unify to reduce the number of errors"; in this order, after ONE QUESTION SHAPE and ANSWERS LIKE QUESTIONS): 3) ONE QUESTION SET: papers, worksheets, First Class Maths exercises, Corbettmaths 5-a-day, Access Tuition sets = one kind (title + ordered questions), the source a tag. 4) ONE STATUS SET for a question (not tried / right / part right / wrong), worded the same everywhere. 5) ONE MARK RESULT (marks of total, verdict, one-line why) from rule and AI marking alike. 6) DONE 24 Nov — ONE ATTACHMENT KIND: source texts, formulae/equation sheets and periodic tables are one kind (data/inserts.json rows, `of` source | sheet only a tag, written once by tools/lib/import.js attachmentRow); every question part shows one Insert tile (greyed where it has none, rule 1.83) that opens its set's attachments as their Find cards, one step by attachOpen_/openStep_; a question's own figures stay printed in its words; check tools/one-attachment.js (+ paper-cards opens the English source). 7) DONE 24 Nov (maths) — ONE TOPIC TREE: questions point at the idea they test, not a source's topic name: every maths question carries `idea_id` (an idea of the maths cards) from one table, data/settings/question-ideas.json (a single-topic set's idea, else its first topic's), written by `node tools/content.js qideas --apply` (tools/lib/qideas.js); Find's topic question for a maths question answers its idea's name (taxonomy.json Maths.ideaNames), so 238 source topic names are 126 ideas; 15198 of 17196 mapped, 1998 unmapped (mostly Corbettmaths 5-a-day, whole strands, Factorising and Algebraic Fractions with no card yet) held at a budget that may only fall; check tools/one-topic.js (--prove). Science and the other subjects wait on item 8. 8) ONE IDEA PER CARD for science and the other subjects (as maths). SCIENCE GCSE DONE 24 Nov: an idea is one AQA spec point (8461/8462/8463, 8464 Combined points carried in specs); the 36 broad TB-GCSE-BIO/CHEM/PHYS chapters split item by item into the point cards (every word kept) and their 3 empty books gone, 8463 "development of the model of the atom" one card with 8462's; 348 cards -> 311 ideas (tools/lib/sci-ideas.js, `node tools/content.js sciideas`, taxonomy.json Science.ideas); science questions point at their spec point's idea (3612 of 14540, budget 10928 may only fall); checks one-idea (--prove) and one-topic (--prove). Owner to review the 346 item placements made by score (review list beside the drive-pack). Left: KS2, KS3, A-Level, practicals (words in the Ledger only), and the other subjects. 9) DONE 24 Nov — FIND: What kind / What for / Which as one question (What kind only; Practice's kinds Questions, Answers, Inserts are front answers beside Library, Tools…); a chip always has a name (no "*" but the PIN dots); check tools/one-opening.js. 10) one drawing canvas (queued above). 11) @family questions from library facts in the one question kind.
- ONE KEYBOARD DONE 23 Nov (7 rows of 10, greyed not hidden, redundant keys gone, every box incl. welcome; keypad-taps) (owner, 23 Nov, approved; after tables, before the drawing canvas): one fixed layout everywhere: letters, numbers and maths keys always in the same places; keys a box cannot use greyed in place, never hidden, no layers. NO REDUNDANT KEYS: a key that another key already does is left out (x² and x³ go, xⁿ stays; the same test for every key). EVERY TEXT BOX ON THE SITE USES IT, the welcome/sign-in screen included (the owner saw the welcome screen without it). Phone: 6 rows so keys stay big enough; iPad: today's key size. Check: one layout, no key duplicating another, every input on every screen opens it.
- ONE DRAWING CANVAS (owner, 23 Nov, approved: "most stable and simple for kids, practical, uniform"; after tables): the 8 draw setups (points, graph, line, numline, shape, shade, construct, hand) become one canvas: the figure with its frame (grid x,y / number line / angle), every tap snapping to it; the same tools always shown (Point, Line, Curve, Shade, Compass, Undo); the answer stored as points, lines, curves and regions in the frame; one marker, one tolerance rule (e.g. half a square), part marks per piece; AI only for shape-only sketches (~5%). Check: a tap-script drawing each sampled question's key is marked Right.
- CORBETTMATHS 5-A-DAY, FINISH (owner, 22 Nov; at the end): the library holds 214 days, Foundation only, June–December (P-CBM-5AD-F-0601…1231). Add the rest from Corbettmaths' own site: Foundation January–May, and the other sets (Foundation Plus, Higher, Higher Plus, Primary, Numeracy, Further Maths where published), each day as a worksheet (the 17 Nov rule), with answers keyed so the site marks them. Check the site's terms on reuse first, as for every source.
- IDEA GROUPS ACROSS LEVELS (22 Nov, Claude's call under the standing taxonomy rule): one idea is one card across levels (KS2 ratio and GCSE ratio are the same idea), with its levels as tags and [H]/[A-Level] marked inline, as ONE TOPIC-CARD TEMPLATE says. Broad chapters that cover several points are split into one card per point when the maths merge (step 3) happens.

## IDEA (owner, 25 Nov; end of queue): things that cycle with the meals
The three meals already share one slot list (Protein, Carbs, Dairy, Veg, Fruit). Candidates to ride the same 3-a-day cycle as Docket items: prayer (morning, midday, evening), a glass of water, washing up straight after, a 10-minute tidy of one room zone, a short walk after eating, tablets if any. Teeth are twice a day (NHS), not three.

## THE IDEAL DAY (owner, 25 Nov night) — the Docket's target
Wake → e-ink screen shows what's due now (the 8-hourly cycle first) → do them → tell Siri/Gemini "I've done X, Y" → ticked, gone from the screen → hand the iPad to the kids (it just works) → at mealtimes phone or screen shows what's left. Build order: one-list names-only Docket (in progress) → voice ticking through the private address (`do=done`, many at once) → e-ink screen reads the address over Wi-Fi and shows "Now" (build on attic/epaper-verse) → country plug-in.

## IDEA (owner, 25 Nov; end of queue, to discuss before building): lecture transcript summariser
A place where a student drops lecture transcripts (Teams .vtt/.docx) and gets a short summary of each: what's new, and anything said about assessments. Open questions for the owner before any build: who uses it (owner only, or students), where transcripts are stored (private), and how summaries are made (AI, given the site's no-arbitrary rule; and never for modules that ban generative AI).

## STANDING GOAL (owner, 26 Nov): any country's spec in → everything out, mechanically
Upload (or name) a country's curriculum document → the site lays out the library and generates questions for every subject, year and level, by formula, no AI, no hand-building. Whatever the code can't handle yet is listed, and the code is refined (formulaically, never per-case) until it can. Order: UK reader (replace the hand-built tree, prove identical) → statement→template rule table + "no generator" report → Australia (ACARA codes) → Brazil (BNCC codes) → more subjects' templates.

## THE ROOT (owner, 26 Nov) — the whole library's shape, top down
Students are paused from the site's questions until it is stable; the cause was working bottom-up (chasing Corbettmaths / First Class Maths questions one by one). From now on everything proceeds TOP DOWN, mechanically, least arbitrary:
1. World level (the fewest SSOTs): UNESCO ISCED = the levels; OECD PISA frameworks = shared maths/science/reading content. Vague, but the top.
2. Countries' government specs under it (UK DfE, Australia ACARA, Brazil BNCC…), each read from its document by code.
3. Exam boards under each country (AQA, Edexcel, OCR…) as tags — more specific.
4. Worksheets (Corbettmaths, First Class Maths…) only as tags / an after-check, never a source.
Questions are generated from the tree by formula. Ship first, then compare to outside worksheets (variety, difficulty) and refine the formulas — a fix at the top fixes everything below. Repeatable for the next country with no hand work.
