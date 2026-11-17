# The queue

Claude owns the site (rules.json rule 0.1) and prompts itself from this list: when one item ships, the next starts at once; the hourly run is only the safety net. Claude adds, orders and removes items itself. The owner's Suggest register (Ledger tab `claude_notes`) is an inbox only: anything there is read, turned into an item here (or done at once), and closed.

Order: what a child or parent would notice first, then what stops things drifting, then new content. An item ships only when every check passes and a count goes up. Asks for the owner are batched into one weekly list (bottom).

## Now

1. Marking keys for the ~9,200 questions that have a written answer but no mechanical key (mostly short science "explain" parts): derive `rule: points` / `accept` from each row's own mark-scheme text; each must pass `tools/validate-questions.js`.
2. Typed-in text for the ~2,000 science questions with none: AQA papers from the cards' source_url, mark schemes from AQA's filestore (method: 8461-2306-1F and the seven papers done 17 Nov).
2b. Papers from the manifest data-private/paper-sources.json (4,284 PDF links: question papers, mark schemes, inserts — Edexcel and AQA, GCSE and A-Level, from the pages the owner gave 17 Nov): fill any paper the library lacks or has without text/keys, subjects the owner's students take first (GCSE Maths, Biology, Chemistry, Physics, English, History). Check each entry's URL matches its labelled subject (some Edexcel pages link the combined-science files).
3. The 232 questions that refer to a Figure with no diagram, and the 52 whose figure was not transcribed: draw them with tools/figkit.py.
4. The 35 keys the check says accept a wrong answer or fail their own drawing.

## Next (the 12 parts of best practice)

- ONE CARD, LITERALLY (owner, 17 Nov — most important to them): every card on the site, Settings included, is the same card: same slots in the same order (picture, tags, body, buttons), same look, same behaviour; Settings' forms, week grid and shelves become body blocks of that one card, never their own layouts. Measure it as a count (cards drawn by the one maker with no card-specific layout ÷ all cards), list every card that differs by name, drive it to 100%, then keep the count in the nightly checks.

- FEWER FEATURES (owner, 17 Nov): every button and feature is a cost. Audit them all; cut any a child or tutor can do without; the fewer there are, the more stable and easy the site. Show the before/after button count.
- ONE LEVEL LADDER (owner, 17 Nov: KS3 and GCSE showed side by side on one menu, which felt wrong; Claude decides): a menu should offer one ladder of levels without overlaps (KS3 is the years before GCSE; GCSE and KS4 overlap) (the same students, the same papers) — evaluate and merge where they are one thing, so a question lives under one level, not two; same check for KS3/KS4 and the other paired levels.
- PAPER TYPES (owner, 17 Nov): past papers and specimen papers are one kind of thing — one "Exam paper" choice with Past and Specimen inside it (or one step), not two separate tags.
- 5-A-DAY IS A WORKSHEET (owner, 17 Nov): file 5-a-days as worksheets, not their own document type.
- STANDING (owner, 17 Nov): Claude optimises objectively — disagrees openly when the owner's idea is worse, never just affirms; the owner's statements are principles (uniform, minimal sources, lean, memorable, fewest features), not orders to apply blindly.
- LIBRARY TREE: each idea one entry with one "part of" link (subject › topic › subtopic › idea), at most ~3 levels; the same tree drives menus, topic pages, spec links and "revise this".
- FOR THE OWNER: tick-box parts typed as text cause marking misses (spelling, abbreviations); proposal — the one answer face shows the paper's own options as tap tags when the paper offers options. Owner's rule says text boxes; asked 17 Nov.
- STANDING (owner, 17 Nov): taxonomy, naming, grouping and cutting features like the four above are Claude's to find and decide over time, without being told.

5. Short rulebook: rules only, history moved to docs/history; first rule 0.1 (literal, universal; Claude owns the site).
6. One count per rule, measured across the whole site; a nightly counts page.
7. Checks run on every change; a red check stops the merge (CI gate).
8. Preview copy before live.
9. Marking signals: near-miss wrong marks, all-zero questions, repeated retries, logged automatically.
10. A one-tap "this mark is wrong" on every marked answer; each report becomes a permanent example in an answer bank the marker must keep passing.
11. One answer face: one text box for everything, one pad for drawing and photos; remove any other button a question can do without.
12. One form engine (the profile editor's own boxes join the form maker).

## Then (content)

- ONE CARD PER IDEA (owner, 17 Nov; Claude's design): the library holds one card per concept, never per board/book; spec points (every board, level, combined/separate) point at concept cards; level depth is marked inside the one card ([H], [A-Level]); questions link to the same cards. Count: near-duplicate cards left → 0. Then every concept card gets one animation showing the real mechanism (memorable, lean); weak existing animations redone.

13. Topic cards: rest of QAA MSOR, then BNCC/ENEM/Australian Curriculum topics; Victoria VCE; BNCC Ensino Médio; NSW HSC once the syllabus version is chosen.
14. History: more topics built like the Tudors.
15. Photo marking beyond pie charts (bar charts, graphs) once pies prove themselves in lessons.

## For the owner (weekly, batched)

- NSW HSC: the 2017 syllabus or the 2024 one?
- English: the copyright-withheld extracts for Nov 2023 P1 (Byatt, Possession) and Nov 2022 P1 (Hemingway) need a full printed copy; papers for June 2021 P2 and Nov 2024 P1/P2 can be added if wanted.
- Drive: the two denied moves; "family console saves"; the old personal folder's trash; keep bible&theology shared?
- Statistics library: build Edexcel GCSE Statistics pages?
- Venues: clients see only an area?
