# 531 — A type that is a kind of another answers both; a timeline is a Timeline

**Reported** through Suggest a change on Find › Questions › Maths and the History shelf, 31 Oct.

1. *"specimen paper should be in past paper"* and 2. *"5 a day should be in worksheet"* — one rule, `DOC_TYPE_UNDER`
   (find.js): the `documentType` facet answers `[parent, own]` (`docTypeAnswers_`), so Past paper finds specimens and
   Worksheet finds 5-a-days, while `Specimen paper` and `5-a-day` stay answers and tags of their own. The row's
   `document_type` is untouched, so `fiveADay_`, arcade and print read what they always read.
3. *"timelines should have a tag called timeline, so they belong to that category of item"* — the `timeline` kind's
   What kind label is `Timeline` (was `Library`). Its `histKind` stays `Events`; the events themselves are unchanged.

`check-funnel.js` reads every specimen and 5-a-day question for both answers and every timeline for `Timeline`, and
fails when none of either was read.
