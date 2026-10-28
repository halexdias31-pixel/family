# 495 — Manuscripts as they are: drawings traced from the photograph, one tile row on Find cards

css 2026-10-28-zj-ms-traced. No backend change.

## The owner

With a screenshot of the Papyrus 52 card: "is this accurate. this is what it actually looks like?" Then, when
told it was not: "you will correct the svg? I like it. it's just not accurate."

## What was wrong

`MS_LOOK` (490) drew P52 as a wide rough shape carrying six lines of 14-16 whole letters each, cut from the middle
of each line, in a modern serif. The real leaf (P. Ryl. Gr. 457, 8.9 × 6 cm) is taller than it is wide, has a deep
notch at the top, keeps the START of each recto line (the left margin survives, the right side is gone) and the
END of each verso line, and about 60 letters in all over seven lines, the last only traces. Codex Alexandrinus was
an invented two-column John 1 page.

## What it is now

Each drawing is traced over a public-domain photograph on Wikimedia Commons, in that photograph's pixel space:
the outline point by point, each line's surviving letters spread over the room they take in the photo, nothing
else drawn. The photographs are the reference only; none is stored or shown.

| Item | Reference | Licence | Drawn |
|---|---|---|---|
| Papyrus 52 | https://commons.wikimedia.org/wiki/File:P52_recto.jpg | PD-Art / PD-old-100-1923 | recto, 7 lines (John 18:31–33) |
| Papyrus 52 | https://commons.wikimedia.org/wiki/File:P52_verso.jpg | PD-scan / PD-old-70 | verso, the recto's outline mirrored, 7 lines (John 18:37–38) |
| Codex Alexandrinus | https://commons.wikimedia.org/wiki/File:Codex_Alexandrinus_f41v_-_Luke.jpg | PD-old-100-1923 | fol. 41v (Royal MS 1 D VIII): Luke 24:32–53, 51 + 20 lines, hanging paragraph initials, the red tailpiece and the title |

Readings were taken from the photographs (at 349 px, so a letter at a tear can be wrong); lost letters are left
blank. The letter forms are the uncial ones (round epsilon, lunate sigma, rounded alpha and omega) via `msHand_`.
Alexandrinus's text is the Byzantine Luke 24:32–53 with its nomina sacra, wrapped to the page's real line count;
its line breaks are not the scribe's.

Facts checked against the Commons descriptions: no corrections.

## One tile row on a Find card

The card's own tiles, the star/suggest row (`cardTiles_`) and Back to top (`findTopRow_`) were three rows. Every
other paged screen runs `rowsOne_` (489) over its markup; Find's pager (`stuffPageHtml`, filled straight into the
pane by `stuffFillOne_`) never did. `stuffPageHtml` now returns its page through `rowsOne_`. check/tiles.js opens
Papyrus 52 in Find at each width and fails if its page has more than one tile row (mutation: without the fix, red
at every width).
