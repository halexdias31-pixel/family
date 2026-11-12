# 1213 — one path to the science papers: Physics, Biology, Chemistry (12 Nov 2026)

Owner: "there's two ways to get to the right path… people need it clear, maybe just have Physics, Biology and Chemistry."

**The two paths.**
1. *Practice:* AQA Combined Science Trilogy (8464) and Edexcel 1SC0 questions had subject `Combined Science`
   (2,956 rows), so a combined Biology paper sat under Combined Science while the separate Biology paper sat
   under Biology: two Subject answers for one subject's questions.
2. *Library:* the KS2 Science, KS3 Science and GCSE required-practicals books (62 chapters) had subject `Science`,
   so Forces or Cell Biology could be reached via Subject Science › Topic Forces and via Subject Physics. Science's topic
   menu even offered Biology, Chemistry and Physics as topics.

**The fix, in data.** Each combined-science question takes the science its paper names (`Biology Paper 1` → Biology).
Each science chapter takes the root of its topic in `data/topics.json` (Forces → Physics), Rocks → Chemistry, and the two
"Thinking like a scientist" chapters (and the covers) list all three: a chapter's subject cell may be a comma list
(`contentItem_`), one answer each. `topics.json` and `inserts.json` no longer name Combined Science.
Combined vs separate still splits a subject's papers; the Paper answer (8464/B/1H vs 8461/1H) is where that shows.

**The rule.** `tools/logic-health.js` has `twinpaths`: one list reached by two paths neither holds, one answer word asked by
two questions over the same cards, or an answer named like a sister answer above it (Science › Topic "Biology" while
Subject offers Biology). Every finding is in `twinPaths` and on the Optimiser's worklist (`twin-path`). Before: 9
(Science among them); after: 8, none science (Maths › Topic Statistics vs Subject Statistics, and name clashes such as
Language Latin vs Subject Latin, for a person to judge).
