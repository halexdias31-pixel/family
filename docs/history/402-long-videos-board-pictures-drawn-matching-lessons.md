# 402 — Long videos in the videos card, pictures on the whiteboard, matching drawn on the figure, and the kinds of lesson

24 Oct 2026. Four owner notes in one pass; the owner added mid-way: *"the video searcher is already made; many
tasks may be outdated — err on the side of caution."*

## 1. "A database for cool videos which aren't 1 minute long"

It already exists: the Games → Videos card (311, 321) searches `data/videos.json` (the owner's list) and plays a
YouTube link in place. Nothing new was built. Three owner links were added as rows (`kind: clip`, tags `lesson long
video`): `UIYzc1ALhVY`, `N5i3UsiSoYY`, `ckcdqlo3pYc`. YouTube (oEmbed and the page) cannot be reached from the
session's network, so their titles are "Lesson video 1–3" with a note to fill them in. The Eratosthenes / radius
of the Earth video and James May's Burj Khalifa video were not added: no id could be confirmed offline.

## 2. "Add screenshot to my whiteboard"

The board (377, js/board.js) gains a **Picture** tile: the device's picker (`accept="image/*"`, which on a phone
offers Take photo / Photo library) and, on a computer, **paste** of a screenshot onto the board in view. The image
is shrunk to at most 900 px and re-encoded as JPEG until under 60 000 characters, so a board still fits
`PAD_BOARD_MAX`. It is stored in the board's own array as `{ im: 1, i, x, y, w, h, s }` (quarter units, a data
URL) — older code keeps unknown elements untouched (`other`), so an old page never loses it. It is drawn under the
ink (write on it), picked up by a long press or the lasso and dragged to move, and a lone selected picture's
bottom-right corner drags to resize, keeping its shape. Undo, redo and Clear treat it as any item.

## 3. "Matching questions show an answer box; the answer space should be in the question"

Counted: 66 rows say match/join/draw lines; of the genuine matching parts, 8 answered in typed cells against
their own figure (Corbettmaths 2-D shapes 3, nets 2, parts of the circle 5, Roman numerals 10; GCSE 1806 2H 12 and
1706 2H 14; KS2 2024 P2 Q12 and P3 Q1); 18 stems split into multiple-choice parts (a tap each, no box — left).

**Converted, 5** — the four Corbettmaths and KS2 2024 P3 Q1: `answer_type: drawing`, `cells` removed, and a new
`draw_answer` kind **`join`** (find.js `drawMarker_`): `{ k: 'join', a: [x, y, w, h], b: [...] }`, met by one
stroke starting inside one box and ending inside its partner (either way, 10 units of padding). Each row was
checked: its own example scores full, the same lines shifted one partner along score 0. The `match` protocol now
needs `cells|draw_answer` and its type is still `match` (`QT_DRAW_KINDS` → `join`).

**Left as cells, 3**: the two GCSE ones ask for a letter in a table (the paper's own protocol), and KS2 2024 P2 Q12's
fractions are in the words, not the figure, so there is nothing in the figure to join to.

The private fields (`cells`, `draw_answer`) are in `data-private/questions.json` only and **must be pushed to the
Ledger** (`node tools/lib-private.js push`, an admin's token) before the site shows them; the public card has only
`answer_type` changed.

## 4. "Figure out all the different kinds of lessons"

`docs/lessons.md`: fourteen kinds with length, ratio, materials, what the site does today and the gaps, a
suggestion for further Formats, and how past sessions and homework could appear. Nothing built.
