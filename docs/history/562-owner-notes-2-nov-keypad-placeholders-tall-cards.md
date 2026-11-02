# 562 — Owner notes of 2 Nov: an iPhone-shaped keypad with a mic, three placeholders, no card taller than a phone

Notes from the Ledger's `claude_notes` tab (rows 58 to 133), each done as a rule where there was one.

## 108 — What's missing shows less
*"Drop OCR, Edexcel only for Maths."* `MISSING_SHOWN` (missing.js) is one rule over the list: no OCR line, and an
Edexcel line only for Maths. `expected-papers.json` is not edited, so a line comes back by changing the rule. A
hidden line does not count as "not understood".

## 114b, 128a — The keypad, as an iPhone's, with a mic
*"make the keyboard layout more similar to iOS keyboard… especially the spacebar"*, *"Should have a mic button in
keyboard."* On the letters, ⇧ z–m ⌫ is the third row and the last row is `123 αβ mic [space] ' . ✓`, the space
bar 24 of 60 columns (18 on an essay, which ends in return and done). The second space key, ← →, `,` `?` and `-`
left the letters: the space bar held and slid still moves the caret (`KP_SPACE`), and the punctuation is a new row
of ten on αβ. The mic (`kpMic_`) uses the browser's SpeechRecognition, en-GB, and types what was said through
`kpType_`, so the site's boxes and the answer boxes take it alike; with no recognition, a toast says so.

## 116, 118, 114a — Placeholders
Brownie points, Roadmap and Code of conduct are one card each in Student settings (`SOON_CARDS`, me.js), title
and one line, each in `CARD_REG` so the admin can move, delete or note it.

## 119 — Notes virtually unlimited
`CLAUDE_NOTE_MAX` and `SUGGEST_NOTE_MAX` are 40,000 characters (a sheet cell holds 50,000). All four stamps bumped.

## 122 — No card taller than a phone
Papyrus 52's back was 1,200px. A history card keeps at most `HIST_CARD_ROWS` (6) lines, none under a drawing;
the rest are pages of `HIST_PAGE_ROWS` (8) after it (`facts0`, `facts1`, `pageParts_`). The drawing is capped at
40vh. Papyrus 52's back is now 574px at 390x844, then two pages of facts.

## 120/121/133 — Calculator too big
Its key rows are capped at 44px (`CALC_ROW_MAX`), down from 56. The first paint itself was not changed: a local
cold load showed every widget drawn or showing `loading_()`, and the owner's 11 seconds were not reproduced.

## 126 — Bigger profile photos
`.prof-pic` is 4.2rem, up from 3.2rem.

## Checked and already done
- 58: Q23 of June 2024 2F draws one padlock (rendered in jsdom). Since round 4 (553) a question's padlock belongs to
  its tool row alone (`cardTiles_`), and check-flow counts them.
- 123: the "+£x a seat" note is removed on branch `fix-share-profile` (ebf8901), which is not merged into main yet.
- 127: every question, answer and practical carries Practice (546; check-funnel: 23,842 questions). Taking
  Question/Answer/Practical out of the first menu so they appear only after Practice would mean the funnel asking
  a facet twice. Left for the owner to decide.

## Not done
- 112 (move the signed-in card further left): card columns and widget columns are separate kinds, so a card cannot
  stand on a widget column. Allowing that is a layout-engine change.
- 128b/c (finder centring with the keypad open, inputs offset): not reproduced in Playwright; needs a real phone.
