# result

*One card in the finder's list. A paper, a worksheet, a question, a tutor, a venue.*

| id | area | step | step_label | kind | rule | because | source | active |
|---|---|---|---|---|---|---|---|---|
| RS-01 | Items |  |  | rule | Papers and worksheets are derived by grouping question rows on paper_id, never stored separately. | Seventeen of thirty-six fields never vary within a paper. Storing them twice means keeping them in step by hand. | find.js allTopics | TRUE |
| RS-02 | Items |  |  | rule | A worksheet is ONE card. Its questions are not separate cards. | 2,463 rows across 161 worksheets. Grade 3 showed 186 cards for 11 worksheets, and the screen builds one DOM section per result. | find.js collapse | TRUE |
| RS-03 | Items |  |  | rule | A past paper's questions ARE separate cards, beside the paper. | Question 5 of a past paper is a thing somebody revises and asks for by number. Q17 of a times-tables sheet is not. | find.js qNumber | TRUE |
| RS-04 | Items |  |  | rule | A row whose kind is stem is never a card. | It has no marks and no answer. On its own it reads as a question with the question missing. | find.js | TRUE |
| RS-05 | Card |  |  | rule | A real paper gets a paper card laid out like an exam cover. Everything else gets an ordinary card. | A past paper has a board, a tier and a session printed on the front of the real thing. | find.js paperish_ | TRUE |
| RS-06 | Card |  |  | display | Second line reads company, then subject, then year. | It read Maths · 2025 on four hundred cards. On a screen already filtered to maths, subject is the one word every card shares. | find.js thingCard_ | TRUE |
| RS-07 | Card |  |  | display | Company is suppressed on a paper card. | The paper card already prints the board across the top. Printing AQA twice reads as a mistake. | find.js | TRUE |
| RS-08 | Sort |  |  | order | Questions sort by paper, then question number as a NUMBER, then part. | By name a question sorts as Q5b, so every paper's Q1 clumped together and Q1, Q10, Q11 came before Q2. | find.js | TRUE |
| RS-09 | Marks |  |  | rule | Every mark on a card is a plate. Only the colour varies. | Ordinary marks were bare glyphs and admin ones were on tinted plates, for the same act: press a mark, something happens to this card. | style.css .tile | TRUE |
| RS-10 | Marks |  |  | rule | Admin marks are yellow and sit at the far end of the row. | A bin beneath a trolley is a thumb away; a bin at the other end of the row is the card's width away, and sideways is more deliberate than down. | style.css .tile.is-admin | TRUE |
| RS-11 | Marks |  |  | rule | Admin yellow is not the gold used for buying. | The trolley is on the same row. One colour for buy and bin is the confusion the separated rows existed to prevent. | --admin #f2d24b | TRUE |
