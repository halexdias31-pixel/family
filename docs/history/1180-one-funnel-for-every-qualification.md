# 1180 — one funnel for every qualification (10 Nov 2026)

Owner, 10 Nov 00:31: "i think you are probably using a conditional one off rule since this is still happening",
path Find › Practice › Questions › Maths › Past paper › 2025 › SATs. Driven at 390px in chromium; three rules were
behaving differently for KS2 SATs papers, none of them a SATs rule by name, each a rule that only SATs data tripped.

## What was wrong

1. **The Paper buttons said the library, not the list.** A button's words were `answerSay_`, which tells one paper
   apart from every paper in the library: `Paper 1 · Maths · SATs · KS2 · 2025`, and `Paper 3 · Maths · SATs · 2025`
   (no KS2) beside it. The chip it made said `Paper 1` (`chipShow_` reads the list). GCSE paths never showed this
   because their Paper question came after Tier and Month; SATs reach Paper two taps after the year. Now the button
   says the answer's `show`, the shortest form unique among the answers beside it, as its chip does (find-pages.js).
2. **Month answered "which qualification".** The subtype hop in `nextFacet` moved to the best-splitting question that
   held the best one in *this list*. In 2023 each board sat in one month, so Month "held" Board, and May was the SATs:
   Level and Board were never asked, and after May came What you need, not Paper. The hop now goes only to an earlier
   question in the tab (as `facetLocal_` already did), the earliest that holds it: Level, Board, Year, Month, Paper.
3. **Paper waited on a question never asked.** `facetLocal_` held Paper "counts within each Function" where Function
   was too lopsided to ask, so some A-Level paths ended with three papers and no Paper question. A G that is not
   asked in the list (`facetWhy_`) no longer holds F.

## The check

`check-funnel`'s `oneFunnel_` walks every subject's Past paper funnel to its Paper question (every answer of a
sitting question, the commonest of a tag question) and fails when Level, Board or Year is still split where Paper is
asked, when a path ends with papers and no Paper question, or when a sitting question (Month, Tier) settles Level or
Board. With the old hop it fails on Maths › 2023 › May.

## Left as found

Religious Studies › AQA asks Marks before Level (Marks splits at the 2-bit cap, Level does not, and nothing holds
Marks). Greek tiers each sat one year, so Year is answered by Tier there; that is the data, not a skipped question.
