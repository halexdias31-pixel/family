# The queue

Claude owns the site (rules.json rule 0.1) and prompts itself from this list: when one item ships, the next starts at once; the hourly run is only the safety net. Claude adds, orders and removes items itself. The owner's Suggest register (Ledger tab `claude_notes`) is an inbox only: anything there is read, turned into an item here (or done at once), and closed.

Order: what a child or parent would notice first, then what stops things drifting, then new content. An item ships only when every check passes and a count goes up. Questions for the owner are asked in conversation, a few at a time (the list at the bottom is Claude's own memory of them).

## Now

STANDING (owner, 20 Nov): a new request from the owner goes into this queue at the place it deserves; Claude need not drop current work for it. Only urgent child-facing breakage jumps the queue.

ORDER OF BOARDS (owner, 20 Nov): OCR is the least used board, so it comes last. Work AQA first, then Edexcel, then OCR, in every content and marking item.

0d. HELP BUTTON (owner, 20 Nov): the "I need help" hand does nothing but stay toggled on and play a sound when it is raised. No red anywhere (not the widget, not the button). One look, one sound.
0c. FINLEY BY 19 NOV (owner, 18 Nov evening): Maths, English and the three sciences work end to end — questions, marking, diagrams, library. (a) Share a staff card as a picture, never a link. (b) "Answers" in Find shows only answers. (c) Library and questions joined by one key, the AQA spec point (a sub-subtopic, each with its own visual), keeping both the AQA spec order and Access Tuition's worksheets as they are — plan in docs/library-structure.md. (d) A Maths library from the AQA 8300 spec. (e) Every W-AT science part shows, is drawn right and is marked by the site (no tutor marking).
0. DONE 18 Nov (one-card 53/53). ONE CARD, LITERALLY (owner, 17–18 Nov: top priority): every card is the one card from the one maker (`findCard`/`renderCard`): picture, tags, body, buttons; forms, week grid and shelves are body blocks. Count = cards drawn by the one maker with no CSS keyed on the card's own class ÷ all cards, every Find door (Practice, Library, Posts, Messages, Profiles, Booking, Shop, Settings, Tools, Games; iPhone 13, fixture payload). 18 Nov: 27/53 → 50/53. DONE: Settings (About you, Add a person, Contact & address, Handle, Jobs, Name, Notifications, Photos, Picture, Qualifications, Signing in, When I can teach, Where you teach, Your rate and group size, Your roles) — the form layout now belongs to the body block (`.kc-embed`), not to `.card-ed`/`.set-shape`/`.notify-card`/`.roles-card`/`.own-sec`/`.is-prof`; Tools and Games widgets (Pixel editor, Term dates, Library cards, Board games, Console, Word games) — the boxed `.card.is-widget` shell and its rules gone. LEFT: Profiles/Booking › the tutor card (`.tcard`, 24 rules keyed on the card) and Messages › Daive (`.daive`, drawn outside the maker). Kept as a count, not a gate (rule 1.75).
0b. DONE 18 Nov. HISTORY CARD (owner, 18 Nov): a Settings card "History" for each student — pick a date, see that day's questions with marks (or count, marks, topics, time). Plan: one backend door that runs the Sunday email's own `digestFold_` + `digestSummary_` (backend/digest.gs) over a one-day span {start: d, end: d} — the same function the email calls for a week — visible to the child, their parents, tutors and admins by the existing access rules; the card declared in kinds.json (kind `setting`), drawn by the one maker. Not started: needs a backend deploy to test.
1. Marking keys for the ~9,200 questions that have a written answer but no mechanical key (mostly short science "explain" parts): derive `rule: points` / `accept` from each row's own mark-scheme text; each must pass `tools/validate-questions.js`.
2. Typed-in text for the ~2,000 science questions with none: AQA papers from the cards' source_url, mark schemes from AQA's filestore (method: 8461-2306-1F and the seven papers done 17 Nov).
2b. Papers from the manifest data-private/paper-sources.json (4,284 PDF links: question papers, mark schemes, inserts — Edexcel and AQA, GCSE and A-Level, from the pages the owner gave 17 Nov): fill any paper the library lacks or has without text/keys, subjects the owner's students take first (GCSE Maths, Biology, Chemistry, Physics, English, History). Check each entry's URL matches its labelled subject (some Edexcel pages link the combined-science files). Coverage 18 Nov (2,084 question papers): 647 in with text, 124 in without text, 1,313 missing; GCSE Maths 62/62/89 (no AQA 8300 at all), History 79/0/112. Typed by hand a paper a pass (no auto-importer): 8300/1F June 2024 drafted, 25 of 41 parts (figures left).
3. The 85 questions that refer to a Figure with no diagram (232 → 85, 18 Nov: 147 OCR rows drawn from their papers by tools/draw-figures-q3.py), and the 52 whose figure was not transcribed: draw them with tools/figkit.py. Left: AQA 2022–24 GCSE biology/chemistry (raster figures, to hand-draw), OCR geography (resource booklet), a few micrographs. All 147 are imported (18 Nov, in 5 parts; 7 shrunk to fit).
4. The 35 keys the check says accept a wrong answer or fail their own drawing. **32 done (18 Nov):** 13 drawings were the check not loading the pad's grid (fixed in `tools/validate-questions.js`); 17 one-mark "Is X correct? Give a reason" keys now need the No *and* the reason — their import file waits for the Drive upload. Left: 3 keys that are right (any odd non-multiple of 7, any multiple of 5 not 10, a cross at ½) where the check's made-up wrong answer happens to be a right one.

4b. MISALIGNED MARK SCHEMES (20 Nov): ~150 A-level/OCR rows hold the next or previous part's scheme, or only boilerplate ("Marking of lists…"). Re-align each row's answer from its paper's mark scheme, then key it. Lists: scratchpad k/skip-log.txt and the batch reports.
4c. MARKER ORDER (20 Nov): a plain accept list ignores order, so "x = 9, y = 5" passes for "x = 5, y = 9" and "Y to X" for "X to Y". Make named values and ordered phrases order-aware at the one marker; add the cases to the marker self-test.

4d. MARKER: "No, because X" (20 Nov): the marker reads "No" as negating the next points, so a right answer starting "No, because…" loses marks. Limit the negation to the clause, add marker-cases. Also: ordered lists with no "to/then" are marked in any order.

4e. HISTORY SHOWS EMPTY BOXES (owner, 20 Nov): an old multi-box answer shows as ", , , , , , T". History (and any answer echo) shows only what was typed, or "(no answer)".
4f. WRONG TOPIC: W-1CM-parallel-lines is tagged "Angles in Parallel Lines" but is gradients / y = mx + c. Retag at the source; check other 1CM sheets for the same.

4g. ONE HISTORY CARD (owner, 20 Nov): on a student's profile, merge every history-like card (History, Recent activity, Questions stats, Work on next, the per-source worksheet/past-paper progress cards, Grade estimate) into ONE card: progress by source, with the day view inside it. One maker, one place.
4h. STUDENT PROFILE SHOWS STAFF FORMS (seen 20 Nov on Finley's): Apply to teach, availability grid, rate and group size, qualifications, jobs, photos, intro video, staff hub, and date of birth 01/01/2000. A child sees only child cards; the master (kinds.json) decides by role.

## Next (the 12 parts of best practice)

- THE MASTER DECIDES WHAT A CARD SHOWS (owner, 18 Nov): each kind's card in kinds.json declares its fields, order, limits (e.g. current job only, role words hidden, bio length and quotes); the card code only reads it and draws — no show/hide decisions in code. Move today's code-side choices (profRoleWords_, profJobs_, tutorCardOf_ quotes) into kinds.json.

- FEWER FEATURES (owner, 17 Nov): every button and feature is a cost. Audit them all; cut any a child or tutor can do without; the fewer there are, the more stable and easy the site. Show the before/after button count.
- ONE LEVEL LADDER (owner, 17 Nov: KS3 and GCSE showed side by side on one menu, which felt wrong; Claude decides): a menu should offer one ladder of levels without overlaps (KS3 is the years before GCSE; GCSE and KS4 overlap) (the same students, the same papers) — evaluate and merge where they are one thing, so a question lives under one level, not two; same check for KS3/KS4 and the other paired levels.
- PAPER TYPES (owner, 17 Nov): past papers and specimen papers are one kind of thing — one "Exam paper" choice with Past and Specimen inside it (or one step), not two separate tags.
- 5-A-DAY IS A WORKSHEET (owner, 17 Nov): file 5-a-days as worksheets, not their own document type.
- STANDING (owner, 17 Nov): Claude optimises objectively — disagrees openly when the owner's idea is worse, never just affirms; the owner's statements are principles (uniform, minimal sources, lean, memorable, fewest features), not orders to apply blindly.
- LIBRARY TREE: each idea one entry with one "part of" link (subject › topic › subtopic › idea), at most ~3 levels; the same tree drives menus, topic pages, spec links and "revise this".
- STANDING (owner, 17 Nov): taxonomy, naming, grouping and cutting features like the four above are Claude's to find and decide over time, without being told.

5. Short rulebook: rules only, history moved to docs/history; first rule 0.1 (literal, universal; Claude owns the site).
6. One count per rule, measured across the whole site; a nightly counts page.
7. Checks run on every change; a red check stops the merge (CI gate).
8. Preview copy before live.
9. Marking signals: near-miss wrong marks, all-zero questions, repeated retries, logged automatically.
10. A one-tap "this mark is wrong" on every marked answer; each report becomes a permanent example in an answer bank the marker must keep passing.
11. ANSWER FACES (owner, 17 Nov, revised): REMOVE photo marking. KEEP the drawing pad (coordinate grids, transformations, graphs work well and children need it). One systematic rule for where the answer goes: if the paper draws the answer space inside the figure (grid, axes, shape to reflect, number line), the answer IS drawn on that figure in the pad; otherwise it is the one text box. Printed options: the text box, marked forgivingly against the paper's own options. Tables: one box, any separator. Essays are MARKED MECHANICALLY (PEEL / distilled rules) — never "marked by your tutor"; that label is wrong for essays and must go. Loci/constructions/sketches: keyed geometrically where possible on the pad.
11b. Drawing tools for children: the line tool and the magnifier are sometimes hard to use; watch it at phone size, find the real friction (hit area, loupe size, snapping), fix at the one pad engine.
12. One form engine (the profile editor's own boxes join the form maker).

## Find and people (owner, 17 Nov)

- The name at the top of Find is always the person's login handle (never first + last name), one form everywhere; the PIN ● tags stay visible the whole time, including after a refresh.
- Booking asks no questions ("Who is this for?"): Find never asks questions elsewhere; booking's steps are Find steps like every other menu.
- Subject step bug: two rules at once — the multiple-choice tick rule and the "and / ." rule. Remove the multiple-choice rule; "and" / "." replaces it everywhere.
- Staff, not Tutor: everywhere the people category says Tutor it is Staff, with Tutor / Coach / Head of Boxing inside it (George is found under Staff › Coach).
- "Add a person" sits at the very top of Profiles: place it where it belongs; decide whether Profile and Settings merge (they overlap) — Claude's call.
- VENUES (owner, 18 Nov): staff no longer pick venues; the system only needs each person's location (town). Booking matches by location instead of per-tutor venue lists; then remove the venue-picking settings and the tutors_happy_here data. (Card already shows the town only.)
- Examiner reports: find them per board/year (the boards' own sites, Save My Exams, Physics & Maths Tutor), add them to the paper manifest, and use them to sharpen marking (English first).

## Then (content)
- @FAMILY SCIENCE QUESTIONS FROM THE LIBRARY (owner, 20 Nov): the library is the single source, and there is ONE question kind (owner: no two types). Each library card holds its facts with permanent ids. A question is one record: its wording may point at facts (`{fact id}`) instead of copying them, and its answer comes from the facts it names (`tests: [fact ids]`). How "written" or "generated" a question is depends only on how many facts it points at. Ids for life; each saved answer keeps the question version, wording and answer the student saw, so a library edit never loses or re-marks an answer; a change in meaning makes a new version. Checks: every fact has at least one question; every answer is backed by its facts. Order: (1) split the library into one idea per card, (2) fact ids, (3) the question kind and versioned answers, (4) Biology, Chemistry, Physics questions (AQA 8461/2/3/8464 first). Access Tuition stays as it is.

- ONE LIBRARY SHAPE (owner, 18 Nov): History and Religious Studies (and any other subject) have their own irregular branch structures in Library/Find. Examine every subject's branches, pick ONE shape every subject follows (or bring the others to theirs if theirs is better), and move them all to it. Tell the owner what was chosen and why in the weekly list.

- ONE CARD PER IDEA (owner, 17 Nov; Claude's design): the library holds one card per concept, never per board/book; spec points (every board, level, combined/separate) point at concept cards; level depth is marked inside the one card ([H], [A-Level]); questions link to the same cards. Count: near-duplicate cards left → 0. Then every concept card gets one animation showing the real mechanism (memorable, lean); weak existing animations redone.

13. Topic cards: ~~rest of QAA MSOR~~ **QAA MSOR done 19 Nov:** 44 new point-by-point cards (TB-QAA-MSOR 2–45, one per benchmark point, 3.8.3 stays the Bayes card), each with a six-step animation; their words wait in import file lib-import-2026-11-19-qaa-msor.json for the Drive upload. Next: BNCC/ENEM/Australian Curriculum topics; Victoria VCE; BNCC Ensino Médio; NSW HSC once the syllabus version is chosen.
14. History: more topics built like the Tudors.
15. Photo marking beyond pie charts (bar charts, graphs) once pies prove themselves in lessons.

## Suggestions (from the Ledger Suggest register, 18 Nov)
- NOW, NEXT (owner's vision, 20 Nov): one source, the Docket, holds each item with what the order needs: list or phase (e.g. eyes open, feet on floor), time window or deadline, how long it takes, importance, energy or fun, and place. A rule-based planner, no AI, works out at any moment: which phase you are in, the first unticked item, and the best order for the rest. Rules: hard time windows first, then deadline, then importance per minute, then batching by place, then energy. The same plan is shown everywhere: the site, the e-ink screen, a phone widget, and one plain-text address that any assistant (Claude, a free Gemini) can read and repeat. Ticks come from anywhere: the site, the e-ink, or a phone shortcut. The phase follows the clock and the ticks; phone signals such as unlocking or arriving home come later and are optional.

- MARKING AS ONE SYSTEM (owner): exact keys first, spreading to cover everything; where keys haven't reached, rules distilled once offline (mechanical, instant at run time); never live AI; re-distil and tighten over time. Items 1, 4, 9, 10 are its steps.
- ESSAYS, DISTILLED (owner approved): build-time only, a big AI reads hundreds of examiner-marked essays (AQA exemplars first) and derives rules/word lists/weights per band; ship only the rules; cap content below the top band. Start with AQA 8700 Paper 1 Q5. Status 20 Nov: all 52 AQA 8700 Q2-Q5 rows keyed `rule: levels <type>`, rubrics in marking.json (kind levels) distilled from 135 AQA exemplars (MS indicative standards + 2026 answers and commentaries); tools/essay-cases.js reports agreement each build. Next: more Q5 exemplars (only 6 so far), real student scripts with examiner marks.
- ONE TOPIC-CARD TEMPLATE (owner law, 17 Nov; LEAN): 3 slots in fixed order, empty hidden: the idea in one line; animation/figure; the content the spec point needs, nothing else (no worked examples, common mistakes, quick questions, exam tips). Pipeline enforces; every card conformed at source.
- RACER ROADS: always pull the latest, most complete map data; a much better road massager; any location (the learner's own or chosen); one map source + one massager, no per-place code.
- AUTOMATE THE UN-AUTOMATABLE (code, no AI): first, a tutor emails qualifications → Apps Script reads it, OCRs attachments via Drive convert, matches names/grades/DBS numbers against fixed lists, fills the profile; owner approves. Then find other manual jobs.
- TASKS: a "task" kind in kinds.json (title, notes, due, repeat, list, done, links), owner-only; one form, Find, the items store, reminders via deliver_; one-time import from Google Tasks.
- OLD LEDGER TABS (owner OK'd): 20 Nov check errors, grep for direct reads, fresh backup, then delete the 47 locked tabs.
- DRIVE TIDY (owner): top split Family / Personal; business side one home per kind of file matching kinds.json. Propose the structure first, move in batches, never delete.
- Personal (raise when there's a gap): organise tasks/folders/bedroom; a DIY room scan (photos/LiDAR → 3D) to plan the room; a private "food" list of easy meals (first: microwave sushi rice + salmon + soy); turn what the owner enjoys (family trips to Australia/Brazil) into business angles (those countries' curricula).

## For the owner (ask in conversation)
- PRIVATE REPO (20 Nov): make the repository private so the source, notes, tools and backend are no longer public; host via GitHub Pro (~$4/month) or Cloudflare Pages (free, needs the owner to make an account once). Then minify/obfuscate the bundle and move more content behind sign-in. Waiting on the owner's choice.

- NSW HSC: the 2017 syllabus or the 2024 one?
- English: the copyright-withheld extracts for Nov 2023 P1 (Byatt, Possession) and Nov 2022 P1 (Hemingway) need a full printed copy; papers for June 2021 P2 and Nov 2024 P1/P2 can be added if wanted.
- Drive: the two denied moves; "family console saves"; the old personal folder's trash; keep bible&theology shared?
- Statistics library: build Edexcel GCSE Statistics pages?
- Venues: clients see only an area?
