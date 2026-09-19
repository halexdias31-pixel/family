# rogue

| id | list | file | belongs_in | what | verdict | why |
|---|---|---|---|---|---|---|
| RG-01 | WIDGETS | map.js | widgets tab (empty) | 13 tools and games | MOVE | The tab exists and nothing reads DATA.widgets. Zero risk — it is a declaration list with no behaviour in it. |
| RG-02 | JOB_STATUSES | core.js | options.job_status | 4 statuses | DELETE | Already in options. The two already disagree: options is lowercase, the code is capitalised. |
| RG-03 | WEEKDAYS | book.js | options.weekday | 7 days | DELETE | Already in options. Read DATA.dropdowns instead. |
| RG-04 | FEED_FACTS | chess.js | facts tab (new) | 58 reels facts | MOVE | Built. The reels column needs it anyway, and they are content, not code. |
| RG-05 | AV_SHIRT / AV_SKIN / AV_SLOTS | links.js | avatar tab (new) | 27 colours and slots | MOVE | Built. items&shop holds the avatar ITEMS; this is the palette they are drawn in. |
| RG-06 | BOOK_STEPS / SPINE_EXTRA | book.js | spine tab (new) | 14 questions, 10 extra rows | MOVE | Built. booking-rules holds the RULES; this holds the ORDER, which is the other half and drives the receipt too. |
| RG-07 | FLY_ROWS | flyer.js | campaigns + copy | 11 flyers | LEAVE | Already sheet-driven — flyer.js reads DATA.campaigns. FLY_ROWS is the fallback for an empty tab, which is worth keeping. |
| RG-08 | FLY_STYLES | flyer.js | campaigns.style | 4 styles | LEAVE | Four values the code must be able to draw. A style nobody has drawn is a blank flyer. |
| RG-09 | CALC_KEYS | arcade.js | — | calculator keys | LEAVE | Code that looks like data. Moving it buys nothing and the calculator cannot render a key it has no handler for. |
| RG-10 | PAWN_MAP / KNIGHT_MAP | chess.js | — | piece tables | LEAVE | Same. These are the rules of chess, not settings. |
| RG-11 | MONTH_NAMES | data.js | — | 12 months | LEAVE | Same. |
| RG-12 | QUESTION_CLASSES | find.js | — | allowed html classes | LEAVE | A safety allow-list. Putting it in a sheet means anybody editing the sheet can widen what markup is accepted. |
| RG-13 | WANDLE / BEVERLEY / CRANE | map.js | landmarks tab | river outlines | MOVE later | landmarks already holds outlines as `points`. These three rivers should be rows there. Low priority — they never change. |
