# dictionary

| tab | column | type | level | required | allowed | example | notes |
|---|---|---|---|---|---|---|---|
| questions | row_id | text | question | yes | unique | Q-1CM-3d-trig-and-pythagoras-1 | The key. Built from the paper and the question number so it is stable across a re-import. |
| questions | paper_id | text | resource | yes |  | P-1CM-AVGRANGE | Groups rows into a paper or worksheet. Every resource-level field must match across a group. |
| questions | question | text | question | yes |  | 1, 12, 22a | The number as PRINTED. Sorted as a number, not as text — see finder rule RS-08. |
| questions | part | text | question | no |  | a, b, ii | Blank on a question with no parts. 17% filled. |
| questions | kind | enum | question | yes | part \| stem | part | A stem is the shared preamble above the parts under it. It is never a card of its own. |
| questions | section | text | question | no |  | A, B, Mechanics | Only where the paper has sections. 8% filled. |
| questions | marks | number | question | no |  | 1, 6, 12 | Blank where the source prints none — Corbettmaths does not. 67% filled. |
| questions | figure | enum | question | no | see figure list | venn, histogram-grid | Names the diagram this question needs. 30 values so far, and 6% filled — the largest known gap. |
| questions | lead | html | question | no |  | <blockquote>… | Context above the question: a table, a source, a quotation. |
| questions | html | html | question | yes |  | <p>Find the highest common factor… | The question itself. Searched — see finder rule SR-12. |
| questions | answer | text | question | no |  | 1 1/6 | 2% filled, and deliberately: answers were not extracted. |
| questions | answer_type | enum | question | no | calculation \| explain \| annotate | calculation | What a right answer looks like. Drives nothing yet. |
| questions | needs_print | bool | question | no | TRUE \| FALSE | TRUE | TRUE when the question cannot be answered from the text alone. |
| questions | examiner_note | text | question | no |  |  | Empty everywhere. A place for a mark-scheme note. |
| questions | examiner_report | text | question | no |  |  | Empty everywhere. |
| questions | active | bool | both | yes | TRUE \| FALSE | TRUE | FALSE hides it. Nothing is ever deleted. |
| questions | name | text | resource | yes |  | Paper 1 (Non-calculator) — June 2024 | The resource's name. Three GCSE papers share a name across tiers — tier tells them apart. |
| questions | subject | enum | resource | yes | Maths \| Physics \| Combined Science \| English Language \| Religious Studies | Maths |  |
| questions | resource_type | enum | resource | yes | Past paper \| Specimen paper \| Worksheet | Worksheet | Worksheets collapse to one card; past-paper questions do not. Finder rules RS-02 and RS-03. |
| questions | key_stage | list | resource | yes | KS1 \| KS2 \| KS3 \| KS4 \| KS5 | KS1, KS2 | COMMA-SEPARATED and may hold more than one. A primary worksheet serves KS1 and KS2. |
| questions | band_type | enum | resource | no | grade \| year \| stage | grade | Says what band_value means. Without it, a 5 could be a GCSE grade or a Year 5 child. |
| questions | band_value | text | resource | no |  | 5 | Read with band_type. grade 1-9, year 1-6, stage GCSE / A-Level / KS2 SATs. |
| questions | tier | enum | resource | no | Foundation \| Higher | Higher | Past papers only. Worksheets carry NO tier — grade does that work. 10% filled, correctly. |
| questions | source_url | url | resource | no |  | https://drive.google.com/file/d/…/view | The PDF. Essential where figures are missing, which is most worksheets. 52% filled. |
| questions | pages | number | resource | no |  | 12 |  |
| questions | price | number | resource | no |  |  | Empty. Came from the deleted resources tab. |
| questions | currency | text | resource | no | GBP |  | Empty. |
| questions | level_required | text | resource | no |  |  | Empty. |
| questions | trackable | bool | resource | no | TRUE \| FALSE |  | Empty. |
| questions | printable | bool | resource | no | TRUE \| FALSE |  | Empty. |
| questions | pages_checked | bool | resource | no | TRUE \| FALSE |  | Empty. |
| questions | company | text | resource | no |  | 1stclassmaths | Who published it. Shown on the card — often the only thing telling two cards apart. |
| questions | exam_board | enum | resource | no | AQA \| Edexcel \| STA | Edexcel | Blank on anything not from a board. |
| questions | exam_wave | text | resource | no | First wave \| … | 2017-06-01 00:00:00 | BROKEN: holds datetimes on 14% of rows where it should hold a label. Needs fixing. |
| questions | year | number | resource | no |  | 2024 | The year sat. Blank on worksheets, correctly — 26% filled. |
| questions | topics | list | question | no | labels from topicstuff | Circle Theorems, Similar Triangles | COMMA-SEPARATED leaf labels. No facet reads it yet — finder rule FN-110 says why. |
| topicstuff | topic_id | text | row | yes | unique | geom-circthm |  |
| topicstuff | label | text | row | yes | unique | Circle Theorems | MUST NOT CONTAIN A COMMA. questions.topics is comma-separated, so a comma here creates phantom topics. |
| topicstuff | parent_id | text | row | no | a topic_id | geom | Blank means it is an area — the top of the tree. |
| topicstuff | aliases | list | row | no |  | SOHCAHTOA, sig figs | Other names that should find this topic. |
| topicstuff | active | bool | row | yes | TRUE \| FALSE | TRUE |  |
| facets | field | text | row | yes | must match a field in FACETS | keystage | Names a facet declared in find.js. This tab overrides it; it does not create new ones. |
| facets | label | text | row | yes |  | Key stage | The question as asked. |
| facets | sort_order | number | row | yes |  | 30 | Lower is asked earlier. This is the funnel's order — see finder rule SR-03. |
| facets | min_coverage | number | row | no | 0 to 1 | 0.3 | Blank uses 0.5. Lower it for a question worth asking even when thin. |
| facets | note | text | row | no |  |  |  |
| facets | active | bool | row | yes | TRUE \| FALSE | TRUE |  |
| terms | docid | text | doc | yes |  | tutor-terms | Groups sections into one document. |
| terms | audience | enum | doc | yes | tutor \| client \| all | tutor | Who is asked to sign it. |
| terms | version | text | doc | yes |  | 2026-09-b | NEVER edit a published version in place. Bump this and add new rows; the old ones are the record of what somebody agreed to. |
| terms | live | date | doc | yes | dd/mm/yyyy | 05/09/2026 | In force from. A date in the future is published but not yet live. |
| terms | seq | number | section | yes |  | 3 | Order within the document. |
| terms | title | text | doc | yes |  | Tutor agreement |  |
| terms | heading | text | section | yes |  | Your rate |  |
| terms | body | text | section | yes |  | You set your own rate… | Blank line is a paragraph, a line starting '- ' is a bullet, **x** is bold. Nothing else. |
| terms | mustsign | bool | doc | yes | TRUE \| FALSE | TRUE | FALSE is reference only and is never prompted for. |
| landmarks | id | text | row | yes | unique | lm-02 / P005 |  |
| landmarks | parent | text | row | no | a landmark id | lm-02 | Blank means it is a place. Filled means it is a part of one. Same pattern as topicstuff. |
| landmarks | name | text | row | yes |  | Merton Bus Garage |  |
| landmarks | kind | text | row | yes |  | indust / building / tarmac |  |
| landmarks | role | text | row | yes |  | venue / part |  |
| landmarks | lat | number | place | no |  | 51.41734 | Places only. |
| landmarks | lng | number | place | no |  | -0.18152 | Places only. |
| landmarks | points | text | part | no |  | 51.418 -0.181, … | The outline. PARTS ONLY — it used to be duplicated onto the place and kept in step by hand. |
| landmarks | height | number | part | no |  | 9 | Parts only. |
| landmarks | wall_colour | text | part | no | hex | #c2bcae | Parts only. |
| landmarks | active | bool | row | yes | TRUE \| FALSE | TRUE |  |
