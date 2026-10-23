# search

*The funnel. Asks one question at a time until nothing is left to narrow.*

| id | area | step | step_label | kind | rule | because | source | active |
|---|---|---|---|---|---|---|---|---|
| SR-01 | Shape |  |  | rule | One question at a time, each narrowing what is left. Not a search box with filters beside it. | Four thousand items cannot be scrolled and cannot be guessed at. A question you can answer beats a filter you have to know about. | find.js | TRUE |
| SR-02 | Shape |  |  | rule | Answering adds a chip. Chips come off one at a time or all at once. | The chips are the only record of where you are — there is no breadcrumb and no back button. | find.js | TRUE |
| SR-03 | Order |  |  | rule | Questions are asked in the facets tab's sort_order; FACETS' order is only the fallback for a facet the tab does not place. | The order encodes which questions a person can ANSWER at what point. | find.js facetList | TRUE |
| SR-04 | Order |  |  | rule | The order is NOT computed from how much each question narrows the set. | Built and measured. Scoring by expected remaining size picked Question (50 answers) before Subject, three times under three different constraints. Information gain always prefers many small piles. | measured, reverted | TRUE |
| SR-05 | Order |  |  | rule | What for and What kind are ordinary questions: first because the tab says 10 and 20, not because code holds them there (396). | One rule for every facet. | data/settings/facets.json | TRUE |
| SR-06 | Skip |  |  | rule | One test asks every facet: two answers or more, half the list able to answer, a split worth making, 40 answers or fewer; past the cap, the last resort asks the fewest. No facet has a rule of its own. | A question with one answer is not a question, for Year, Month and Paper too (396). | find.js facetWhy_ | TRUE |
| SR-07 | Skip |  |  | limit | A question fewer than half the remaining items can answer is not asked. One bar for every facet: the tab has no coverage column. | Asking about exam board on a screen of primary worksheets offers an answer that hides almost everything. | FACET_COVERAGE 0.5 | TRUE |
| SR-08 | Answers |  |  | display | Each answer shows how many items are behind it. | It is the only way to tell a useful question from a pointless one before answering it. | find.js facetValues | TRUE |
| SR-09 | Answers |  |  | rule | A comma-separated cell counts as several answers. Key stage does this. | A primary worksheet serves KS1 and KS2. One answer means choosing which half of the audience to hide it from. | find.js keystage | TRUE |
| SR-10 | Answers |  |  | display | An answer is a pressable row: surface, border, pressed state. | They were text on a line with a number at the end — the same shape a receipt row uses. One is a fact, the other is the only control on the screen. | style.css .row.tap.counted | TRUE |
| SR-11 | Answers |  |  | rule | An option that does not fit is marked with the reason, never removed. | A list that quietly drops things seems to have decided for you. | find.js | TRUE |
| SR-11a | Answers |  |  | order | One answer order by value type: years and dates newest first, numbers by size, months by the calendar, roman numerals by value, kinds by the kinds tab, the rest A–Z with numbers as numbers. | Not a table per facet (396). | find.js answerCmp_ | TRUE |
| SR-11b | Answers |  |  | display | One way to say a value (first letter capitalised unless a single lower-case letter or roman numeral) and one shortening (the shortest name no other answer shares, with what tells two apart when they would read the same) — on the button, the chip and the card. | One spelling everywhere (396). | find.js facetSay_, shortLabels_, tellApart_ | TRUE |
| SR-11c | Answers |  |  | display | Every facet is a card tag and has a colour (TAG_OF, a default for any facet the tab invents). | (396) | find.js tagRow_, TAG_OF | TRUE |
| SR-12 | Search |  |  | rule | The box matches name, subject and the text of the question itself. | A question's name is Q5b. Without the text, none of 3,240 rows was findable by what it is about: momentum, refraction, half-life all returned nothing. | find.js hay | TRUE |
| SR-13 | Search |  |  | rule | Search text is built once when items are built, never inside the filter. | Stripping HTML inside the filter runs for every item on every letter typed — three thousand regexes a keystroke. | find.js searchText_ | TRUE |
| SR-14 | End |  |  | rule | When no question is left it says so, then shows what remains. | A funnel that simply stops looks broken. | find.js | TRUE |
