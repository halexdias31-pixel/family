# 505 — GCSE topics for GCSE ages

The owner, on the judgement calls 499's child-safety audit left open (the WW2 timeline and its figures, "Weimar to Hitler",
"Germany grows", Milgram's dial, Religion and life, Health and disease, Crime and deviance): "anything history or religious
studies or anything like that which is GCSE level, leave it restricted to GCSE level."

## The rule

One derived age, not a column per row: `gcseAgeOf_(x)` (js/find.js), folded into `itemMinAge_` beside the 490 `min_age`
(the higher wins, so scripture stays 18).

- An item whose level (`levelOf_`) is GCSE, IGCSE, AS, A-Level or KS4/KS5 **and** whose subject is history, religious
  studies, philosophy/ethics, psychology or sociology is 14+ (`GCSE_AGE`, the start of Year 10).
- At the same levels, any subject whose name or topics say drugs, alcohol (not "alcohols"), abortion, euthanasia, crime,
  deviance, Religion and life or Health and disease is 14+.
- The history database (figures, writings, events, the timelines — `hdb` items, which have no level of their own) is 14+.
- KS3 and below stay open: KS3 Science's "Health, drugs and disease" chapter is KS3 content and is not limited.

Under 14, with no date of birth, or signed out: not listed, so not opened (`itemAgeOk_`, 490). An admin sees all. The
animations live on chapters, so a limited chapter's drawings go with it; the WW2 timeline's Animation tile leads to a
chapter that is itself limited.

On the Rules card as `gcse-sensitive-age` (js/rules.js, `RULE_IDS` in backend/constants.gs); Universal opens them to all.

## What it limits (the real files, 2026-10-28)

Content cards: History 32, Psychology 27, Sociology 24, Religious Studies 20. History database: 26 events, 9 figures,
1 writing (already 18), 1 timeline (World War 2). Questions: Religious Studies 172 (A-Level/AS by their stage band).

The journey: `GCSE topics for GCSE ages (505)` in js/check-flow.js — a 12-year-old, no date of birth and signed out see no
GCSE History card or WW2 timeline; a 15-year-old and the admin do; a KS3 History item stays open.
