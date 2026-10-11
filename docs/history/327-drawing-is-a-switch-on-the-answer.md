## Drawing is a switch on the answer: a made-up surface is the box's other face, on the card, behind one tile

**See 337:** the owner answered the question at the foot of this note on 11 Oct (*"simplest and most
uniform"*), and the paper's own figures are the box's other face too now; the figure page is a picture to
look at, with no pen.

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
| **the card** | `questionCard_` draws `ansArea_(x)`. For a surface question that is `.qp-area` holding ONE face: the answer box exactly as any question's (`ansBox_` — typed, keypad, options, Check, Mark with AI, Send, untouched), or the surface under the pen (`padWrap_` — lock, Undo, Clear, Ruler and Compass where `padTools_` gives them, untouched) with *"Not the paper's own figure."* under it, run on one line with where the marks are kept ("Saved to Ada's account"). Every other question's box is the markup it always was. |
| **the switch** | `Draw` (the pen) in the row under the card, first after the star (`questionTiles_` → `drawTile_`). Pressed (`q-draw`), the face is rewritten in place on every copy (Find and Saved), the pane measured again, and the tile reads `Type` (a new `type` mark: a keyboard). No repaint, no page change — both faces are one page, so `PAGE.stuff` stays where it was, which 318's place-keeping depends on. It turns from the face on the screen, not from the rule below: a drawing that reaches the device from the account after the card was drawn makes "a drawing and nothing typed" true under a card still on its box, and a Draw that read the rule turned to the box it was already on. Leaving the box puts the keypad away if it was typing there; leaving the drawing turns the pen off if it was on that pad (`PAD_ON` naming a pad not on the screen is the invisible armed mode `padArm_` exists to prevent). |
| **the note** | The tile says what the face you cannot see holds, three words at most: `Draw · has a drawing` / `Draw · on squared paper` · `on axes` · `a blank space`; `Type · has an answer` / `Type · the answer box`. |
| **which face first** | The box, unless this device last left this question on the drawing (the drawing), or on the box over the drawing that is there now (the box), or otherwise there is a drawing and no typed answer (the drawing — nobody opens a card whose only work is a picture onto an empty box: a drawing made on the old surface page, on another device, or after `Type` was last pressed here). |
| **remembered** | `surfaceFace` in `localStorage`, `{ padKey: 'draw' | 'type' | 'type:<sig>' }` — a `type` carries the fingerprint of the drawing it was chosen over (`padSig_`: strokes and stored length) — the latest 200, every touch in a try; `PAD_FACE` holds it for the visit when storage throws. Keyed by `padKey_`, so per person; dropped by `signedOut_` (`padFaceForget_`) like the stars. Not a `pad:`/`ans:` key — never an answer, never sent. |
| **both answers kept** | The typed answer under `ans:` (`ansKey_`), the drawing under `pad:` (`padKey_`) — the same keys, so every drawing already made is still there and still syncs through the answers tab (308). Opening the card opens both — `padFace_` calls `padAdopt_` and `ansRead_` whichever face shows — so the phone's old marks and a signed-out answer move to whoever is signed in exactly as when the surface page was drawn (317, 318). Check marks the typed answer; a drawing is not marked; showing a face sends nothing. |
| **use your graph** | A later part that uses an earlier part's surface still gets its page in front (`use`), read from the same `pad:` key. `usesPage_` used to skip that page when the later part's own pen was on the same picture; a made-up surface is behind `Draw` now, so a part on the same kind of surface gets the page too, and its Draw shows the earlier marks fainter under its pen. |
| **fit** | On the card the surface shares the screen with the ask, the bar and the row with `Type`: capped at `min(100%, 20rem, 44svh)`. `padFaceFit_` (called by `paneReach_`, `kpSheetFit_`'s pattern) shrinks the grid to a 180px floor, then draws the card's words (tags and sheet) smaller down to `PANE_ZOOM_MIN`, and never the tiles: a card on its drawing is never drawn smaller whole, and one still over scrolls from its first pixel, opened at its foot. See *After review* below. |
| **ink** | The first screenshot of the surface on the card was an empty card: `.grid`, `.axis` and `.ax` were inked only inside `.qsheet`, and the answer area is outside it. `.qsurf` is in those three rules now. |

**Decided, worth a look:** the tile is in the row under the card, not beside the box: it acts on the
card, and a switch inside the face it swaps away would move as it went. While the keypad is up the row is
under it — the switch is not needed while typing, and closing the pad shows it. (What this paragraph
said about fit — a KS2 card at about 0.8 at 320, everything full size at 390 — was measured on one card
and was wrong for 27; see *After review*.)

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
paper's own figure keeps its page and has no Draw (reversed by 337); a surface question's photograph stands in front; (b)
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
later part losing its page; Sign out keeping the faces; every pen made a face (the rule since 337; the paper's figure got
Draw); the note not saying the box holds an answer; a surface question's photograph put after the card;
the surface drawn on a figure page again (surface journey); the box drawn under the surface
(no-keyboard journey). The states' own `expect`, run in the real app, went false for "a surface counted
as a figure" (the box state) and "Draw rewriting nothing" (all three switched states).

### After review

Four findings, each reproduced on the commit above before anything was changed.

**The pen's toast swallowed the tap on `Type`.** On the drawing the row under the card sits at the foot of
the column, which is where `toast()` speaks: "Cleared. Undo puts it back.", "Nothing to undo". For the
2.6 seconds it was up, a tap on `Type` landed on the toast and nothing switched (390×844, 0.4s after
Clear); at 320×568 the hit test at the tile's centre returned the toast. A toast is words with nothing to
press in it, so `#toast` takes no presses now (`pointer-events: none`), the rule `#reconnect` already had
for the same reason. Everywhere in the app, not only here: no toast anywhere was a thing to press.

**On a small phone the drawing was drawn much smaller than this note said.** Swept through every one of
the 62 surface cards, pressing its own Draw tile: at 320×568, **27** were drawn smaller whole by
`paneReach_` once the grid was at its floor — the lock, Undo, Clear and `Type` at 31 to 42px, the grid 126
to 170px — and the two 5-a-day dice tables (24 and 30 October) went to the 0.7 floor and were still 9px
over, which is inside `PANE_REACH`, so the pane neither fitted nor scrolled and `Type`, the one way back to
the box, was cut in half by its edge. At 390×844 one card (30 Oct) was at 43px. Now, in this order:

| | |
|---|---|
| the grid | to its 180px floor, as before |
| the small print | "Not the paper's own figure." (the claim alone; "somewhere to work" is what the surface says by being there) run on one line with "Saved to …", in the notes' own line height — two stacked footnotes were two lines a 568px phone needed |
| the words | the card's tags and sheet drawn smaller (`data-face-zoom`), down to `PANE_ZOOM_MIN` — they were read on the box a moment ago, at full size |
| never | the tiles. A card on its drawing is never drawn smaller whole (`drawn` in `paneReach_`, the open tick list's rule); a tap target is the one size that must not scale |
| then | what is still over scrolls from its first pixel, and the pane opens scrolled to its foot: the grid, the pen's bar and `Type` on the glass, the words the part a finger scrolls back to. Once, as it starts to scroll, so a child who scrolled up to read is left there |

Measured after, every surface card, Draw pressed: at 320×568 no tile under 44px, no card drawn smaller
whole, `Type` inside its pane on all 62; 27 with their words smaller (most at 0.7); **6 scroll** (4 to 87px:
the two dice tables, 5-a-day 28 August, an A-level Physics card, two KS2 SATs cards). At 390×844 one card's
words at 0.94, nothing scrolls. Switching back to `Type` puts the words back to full size (`padFaceFit_`
runs for either face). **Worth a look:** a lower grid floor would take the six scrolls to two at 140px (8px
squares), and the dice tables would scroll even at 120px. Left at 180.

**A remembered "type" beat the owner's rule.** Type pressed once on this device over nothing, and a drawing
made afterwards on the tutor's iPad (`answersPull_` writes it to the same `pad:` key): the card opened on an
empty box, and the drawing's only sign was a pen whose "has a drawing" is in its `aria-label`, which nobody
sees on a touch screen. Putting "a drawing and nothing typed" first would make Type over an untyped drawing
do nothing a reload could see, which the device was asked to remember. So a `type` holds only over the
drawing it was chosen over: `padFaceSet_` stores `type:<sig>` (`padSig_`, the strokes and their stored
length), and `padFace_` lets the drawing win the moment the one on the device is not that one.

**A question for the owner, answered 11 Oct (337): the paper's own figures.** The review: a drawing question whose pen
is on the PAPER'S figure — 470 of them, against 62 made-up surfaces — still has an answer box on its card,
"Figure on the next page", and the pen on that page. Q-1MA1-2406-1F-7, *"On the grid, draw a suitable
diagram or chart for this information"*, whose paper prints a blank grid, reads side by side with the
owner's screenshot exactly as the hexagon did. The owner's words — *"in questions which require a drawing,
just leave it as an answer box like before but theres an option to switch to drawing box"* — can be read
to cover them; *"like before"* reads the other way, since before 270 a made-up surface did not exist and
the paper's figure under the pen already had its page. The task decided they stay (a picture the paper
prints, standing where the paper prints it, and a figure page is what every question with a figure has),
and they did. If the answer is yes, the shape the review suggested is the figure page
kept as the picture to look at without the pen, and the same Draw tile on the card swapping the box for that
figure under the pen, on the same `pad:` key. **The owner, 11 Oct: *"You decide best for paper figure thing.
I just want simplest and most uniform"* — and that shape is what was built (337):** every question answered
by drawing has `Draw` on its card, on the `pad:` key it always had; every figure page is the picture with no
pen; the 84 stem-pen parts lost the copy of the stem's figure that was there only for the pen; a pen
question's figure stands where any part's does. Two things this note says no longer hold: "the paper's own
figure keeps its page and has no Draw" (Checked, and the mutation "every pen made a face") is the opposite
of the rule now, and those lines in check-flow state the new one; and `padFaceFit_` keeps the drawing's own
shape rather than a square's, and lets the card's words give way before a picture with something to read in
it -- a blank one, made up or the paper's, still gives way first, as here (337, after review). Its 180px
floor holds for every picture, as this note says it does: 337's first build crossed it on a phone turned on
its side, and the review put it back.

**Checked after review.** `check/states.js`: *a tall question switched to the drawing, its tiles a
fingertip and `Type` on the glass* — the dice table of 24 October, its `expect` asking the glass, because
`check/ui.js` judges a control at its own size and a pane 9px over is inside its tolerance: every pen tile
and `Type` at 44px on the screen, nothing drawn smaller whole, `Type` inside its pane and hit at 90% of its
height, no scroll before the words have given way. Red at 320 on the commit above. *A question switched to
the drawing and Cleared, the toast over its row taking no press* — Clear pressed through its own handler,
the toast held up, a press at its centre and at `Type` reaching what is under them. Red at 320 and 390.
`check-flow`, the surface journey: Type over nothing then a drawing from the account opens on the drawing;
Type over that drawing holds; the drawing grown on another device wins again. **Mutations, each red, the
real files green after:** a drawn card zoomed whole again; no scroll to the foot; the words never giving
way; a drawn pane scrolling only past `PANE_REACH`; the toast taking presses; a stored `type` winning
whatever the drawing; the drawing rule put first; the signature never stored.
