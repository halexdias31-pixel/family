# search

*The funnel. Asks one question at a time until nothing is left to narrow.*

| id | area | step | step_label | kind | rule | because | source | active |
|---|---|---|---|---|---|---|---|---|
| SR-01 | Shape |  |  | rule | One question at a time, each narrowing what is left. Not a search box with filters beside it. | Four thousand items cannot be scrolled and cannot be guessed at. A question you can answer beats a filter you have to know about. | find.js | TRUE |
| SR-02 | Shape |  |  | rule | Answering adds a chip. Chips come off one at a time or all at once. | The chips are the only record of where you are — there is no breadcrumb and no back button. | find.js | TRUE |
| SR-03 | Order |  |  | rule | Questions are asked in the order written in FACETS, overridden by sort_order in the facets tab. | The written order encodes which questions a person can ANSWER at what point: subject before board, board before paper, paper before question number. | find.js facetList | TRUE |
| SR-04 | Order |  |  | rule | The order is NOT computed from how much each question narrows the set. | Built and measured. Scoring by expected remaining size picked Question (50 answers) before Subject, three times under three different constraints. Information gain always prefers many small piles. | measured, reverted | TRUE |
| SR-05 | Order |  |  | rule | The first two questions are What for, then What kind, and they are never reordered. | They are the only two whose answers a person always has. Everything after is a property of the thing they are looking at. | find.js | TRUE |
| SR-06 | Skip |  |  | rule | A question with fewer than two available answers is filled in and never asked. | A question with one answer is not a question. | find.js nextFacet | TRUE |
| SR-07 | Skip |  |  | limit | A question fewer than half the remaining items can answer is not asked. min_coverage per facet can lower that. | Asking about exam board on a screen of primary worksheets offers an answer that hides almost everything. | FACET_COVERAGE 0.5 | TRUE |
| SR-08 | Answers |  |  | display | Each answer shows how many items are behind it. | It is the only way to tell a useful question from a pointless one before answering it. | find.js facetValues | TRUE |
| SR-09 | Answers |  |  | rule | A comma-separated cell counts as several answers. Key stage does this. | A primary worksheet serves KS1 and KS2. One answer means choosing which half of the audience to hide it from. | find.js keystage | TRUE |
| SR-10 | Answers |  |  | display | An answer is a pressable row: surface, border, pressed state. | They were text on a line with a number at the end — the same shape a receipt row uses. One is a fact, the other is the only control on the screen. | style.css .row.tap.counted | TRUE |
| SR-11 | Answers |  |  | rule | An option that does not fit is marked with the reason, never removed. | A list that quietly drops things seems to have decided for you. | find.js | TRUE |
| SR-12 | Search |  |  | rule | The box matches name, subject and the text of the question itself. | A question's name is Q5b. Without the text, none of 3,240 rows was findable by what it is about: momentum, refraction, half-life all returned nothing. | find.js hay | TRUE |
| SR-13 | Search |  |  | rule | Search text is built once when items are built, never inside the filter. | Stripping HTML inside the filter runs for every item on every letter typed — three thousand regexes a keystroke. | find.js searchText_ | TRUE |
| SR-14 | End |  |  | rule | When no question is left it says so, then shows what remains. | A funnel that simply stops looks broken. | find.js | TRUE |
