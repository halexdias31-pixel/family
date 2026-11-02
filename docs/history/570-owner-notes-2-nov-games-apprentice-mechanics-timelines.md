# 570 — owner notes of 2 Nov: two console games, Apprentice, Mechanics as a database, one timeline step-through

From the Ledger's `claude_notes` tab (read only).

## 109 — timelines step through their events
One generic step-through on every Timeline card (`tlStep_`, find.js), driven by that card's own events (`histTimelines_`):
a bar spanning the era with a dot per event and a marker on the one shown, the event's date, name and summary sliding in,
and Back / Play / Next tiles. Play runs on a timer that keeps its own timeline's key and stops at the last event or when
the card has gone. Not one animation per card, and not a `textbooks.json` animation row: it is a card section.

## 110, 111 — two console games
`CONSOLE_GAMES` (games.js) gains **Linked pictures** (a 6×6 board of pairs; two the same vanish when a line with at most
two turns joins them through empty squares or round the edge, `lkJoins_`) and **I can guess** (the site asks yes/no
questions, always the one splitting what is left most evenly, over 20 people from history, `GS_PEOPLE`). Original;
no outside brand. Both draw their tiles at paint time, since games.js loads before tiles.js.

## 115 — Apprentice column
A placeholder column for work experience, right of Tutor settings: `TABS`, `TAB_ORDER` (shell.js), the screen in me.js
(one card, words from `brand('apprentice_blurb', …)`), and a row in `data/settings/columns.json` (sort orders renumbered).

## 117 — themes: skipped
Shop items have no theme field (the shop tab's columns: kind, audience, acquire, …). A Theme facet would need a new sheet
column and data the owner has not decided on; an empty facet is the per-instance flag the facet rule forbids. Not done.

## 124, 125 — Mechanics as a plain database
Jobs and symptoms (the "what to do with problems" cards) are gone, with the Clio and E30 "common known issues" model
cards and the parts' signs / interval / difficulty / tools. A part is now: what it is, an **example** part number in the
site's own format (`EX-<system>-<nnn>`, never a maker's number) and a **typical, approximate** UK parts-only price range;
the card says "Part number (example)" and "Typical price (approximate)", and the source line says both again.
check-mechanics enforces the format and labels; the Difficulty facet went with the field. The 64×64 pictures stay.

## 59 — GCSE Maths June 2024 Foundation Paper 2 Q24a
The cause is not code. 523 folded the table's three blanks into 24a with cells `(i) = 2 ; (ii) = 0 ; (iii) = 6`, and
marked the row `lib_pending`; the new words are in `data-private/imports/lib-import-p4-fill-in-cells.json`, which the
Ledger has not imported, so the site still serves the old words (a table with "(i)" in it and one answer box). The owner
imports that file in Business. No figure is needed.
