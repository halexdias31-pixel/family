## Drawing is a switch on the answer: a made-up surface is the box's other face, on the card, behind one tile

**The owner, 10 October**, with a screenshot of KS1 "How many sides has a hexagon?": the card with a
"Type your answer" box and the line *Space to draw on the next page*, then a page headed **Space to
draw** — a dashed square, the lock, Undo and Clear, and "Not the paper's own figure — somewhere to work
your answer. Saved to …'s account":

> *"this is confusing. theres an answer box and draw box? in questions which require a drawing, just
> leave it as an answer box like before but theres an option to switch to drawing box. this makes more
> sense and is more uniform."*

### What was wrong

270 gave every question answered by drawing a surface (*"some questions require answers on diagram. So
should have a diagram for them to draw on"*) and stood it where a figure stands: the page **after** the
card, because you read what to draw before the thing you draw on. So a question on a made-up surface
had two places to answer it, a swipe apart, and nothing saying which one counted — and every card
carried a box whether the surface was the real answer space or not. The KS1 hexagon is a one-word
answer whose row gives it a blank space to count the sides on; it was the case that showed it.

Counted through the app's own rule (`padSource_`, `from: 'surface'`): **62** of 8,006 questions — a blank
space 43, a squared grid 19, axes 0 (every coordinate grid the papers print has been drawn). The
**470** questions whose pen is on the paper's own figure (or a stem's) are untouched.

### What changed

| | |
|---|---|
| **pages** | A made-up surface is never a page. `questionHasFig_` no longer counts it, so `partPlan_` gives such a question no figure and `pageParts_` no `fig`: the hexagon is `[card, ans]`, one page fewer, the same count as the same question with no surface. The strip, Saved, Spotlight and the pager all read `pageParts_`, so they agree by construction. The line "*Squared grid / Space to draw* on the next page" went with the page (`figWhat_` is gone — the only page a pointer can name now is a figure). A surface question that also has photographs lays them out as any part's figure: in front of the card. |
| **the card** | `questionCard_` draws `ansArea_(x)`. For a surface question that is `.qp-area` holding ONE face: the answer box exactly as any question's (`ansBox_` — typed, keypad, options, Check, Mark with AI, Send, untouched), or the surface under the pen (`padWrap_` — lock, Undo, Clear, Ruler and Compass where `padTools_` gives them, untouched) with *"Not the paper's own figure — somewhere to work."* under it. Every other question's box is the markup it always was. |
| **the switch** | `Draw` (the pen) in the row under the card, first after the star (`questionTiles_` → `drawTile_`). Pressed (`q-draw`), the face is rewritten in place on every copy (Find and Saved), the pane measured again, and the tile reads `Type` (a new `type` mark: a keyboard). No repaint, no page change — both faces are one page, so `PAGE.stuff` stays where it was, which 318's place-keeping depends on. It turns from the face on the screen, not from the rule below: a drawing that reaches the device from the account after the card was drawn makes "a drawing and nothing typed" true under a card still on its box, and a Draw that read the rule turned to the box it was already on. Leaving the box puts the keypad away if it was typing there; leaving the drawing turns the pen off if it was on that pad (`PAD_ON` naming a pad not on the screen is the invisible armed mode `padArm_` exists to prevent). |
| **the note** | The tile says what the face you cannot see holds, three words at most: `Draw · has a drawing` / `Draw · on squared paper` · `on axes` · `a blank space`; `Type · has an answer` / `Type · the answer box`. |
| **which face first** | The box, unless this device last left this question on one face or the other (that face), or nothing was chosen and there is a drawing and no typed answer (the drawing — nobody opens a card whose only work is a picture onto an empty box). |
| **remembered** | `surfaceFace` in `localStorage`, `{ padKey: 'draw' | 'type' }`, the latest 200, every touch in a try; `PAD_FACE` holds it for the visit when storage throws. Keyed by `padKey_`, so per person; dropped by `signedOut_` (`padFaceForget_`) like the stars. Not a `pad:`/`ans:` key — never an answer, never sent. |
| **both answers kept** | The typed answer under `ans:` (`ansKey_`), the drawing under `pad:` (`padKey_`) — the same keys, so every drawing already made is still there and still syncs through the answers tab (308). Opening the card opens both — `padFace_` calls `padAdopt_` and `ansRead_` whichever face shows — so the phone's old marks and a signed-out answer move to whoever is signed in exactly as when the surface page was drawn (317, 318). Check marks the typed answer; a drawing is not marked; showing a face sends nothing. |
| **use your graph** | A later part that uses an earlier part's surface still gets its page in front (`use`), read from the same `pad:` key. `usesPage_` used to skip that page when the later part's own pen was on the same picture; a made-up surface is behind `Draw` now, so a part on the same kind of surface gets the page too, and its Draw shows the earlier marks fainter under its pen. |
| **fit** | On the card the surface shares the screen with the ask, the bar and the row with `Type`: capped at `min(100%, 20rem, 44svh)`, and `padFaceFit_` (called by `paneReach_`, `kpSheetFit_`'s pattern) shrinks the grid to a 180px floor before the card itself is drawn smaller. |
| **ink** | The first screenshot of the surface on the card was an empty card: `.grid`, `.axis` and `.ax` were inked only inside `.qsheet`, and the answer area is outside it. `.qsurf` is in those three rules now. |

**Decided, worth a look:** the tile is in the row under the card, not beside the box: it acts on the
card, and a switch inside the face it swaps away would move as it went. While the keypad is up the row is
under it — the switch is not needed while typing, and closing the pad shows it. At 320×568 a question
with three rows of tags and two sentences (KS2 "Draw the reflection… Use a ruler") still overflows with
the grid at its floor, and that card is drawn at about 0.8 — the house rule for a tall card. At 390 and
up every surface card is at full size.

**Changed with it, on purpose:** the weekly email's "(picture on the site)" reads `questionHasFig_`, so
a surface question no longer carries it. A blank grid is not the paper's picture, and the note sent a
parent looking for the triangle "Draw the reflection of the triangle" names, which the grid does not
have. Said where it is decided (`doneWords_`).

### Checked

`check-flow` — one new journey, *a question answered on a made-up surface is one card*, through the real
builders and handlers: one card and a page fewer (strip, Saved), the box and Check and no pen, no
pointer line, `Draw · a blank space` in the row; with the keypad up, Draw shows the blank space under the
pen with its tiles and its line, the keypad goes, `Type · has an answer`, the face kept; a real stroke
stored under `pad:<question>`; Type brings back "6", the pen off, `Draw · has a drawing`; back to the
drawing with the stroke, not armed; a second window seeded with the device's storage opens on the
drawing; a drawing that lands under a card on its box, then Draw, shows it; a device that never chose opens on a drawing with nothing typed and on the box with something
typed; the phone's old drawing moves to Ada when her card is opened and the card opens on it; the
paper's own figure keeps its page and has no Draw; a surface question's photograph stands in front; (b)
and (c) using (a)'s axes get the page with its mark, (c)'s Draw shows it fainter; Sign out empties
`surfaceFace`. Rewritten for the card: the surface journey, whose-drawing (Ali, Ben, Cy on one phone),
no-keyboard (the drawing face draws no field — and must draw the pen), every-control-is-a-tile (`q-draw`
must be drawn), the multipart swipe (`[card, ans]`).

`check/states.js`: *the hexagon on its answer box with a Draw tile* (and no surface page in the strip),
*switched to the drawing* (same page, Type), *a squared grid switched to* (its question's tools), *axes
switched to* (a real grid row given `surface: "coord"` for the state, as the passage state does for
`text`). *A diagram you can draw on* now picks a paper-figure pen.

**Mutations, each red on its own, the real files green after:** a surface counted as a figure again;
no Draw tile; Draw rewriting nothing; Draw turning from the rule instead of the card on the screen; the keypad left up; the pen left on; the face not written to the
device; never opening on the drawing by itself; `padFace_` not opening the pad first; a same-surface
later part losing its page; Sign out keeping the faces; every pen made a face (the paper's figure got
Draw); the note not saying the box holds an answer; a surface question's photograph put after the card;
the surface drawn on a figure page again (surface journey); the box drawn under the surface
(no-keyboard journey). The states' own `expect`, run in the real app, went false for "a surface counted
as a figure" (the box state) and "Draw rewriting nothing" (all three switched states).
