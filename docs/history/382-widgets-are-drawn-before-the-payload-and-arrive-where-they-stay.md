# 382 — Widgets are drawn before the payload, and a card arrives where it will stay

20 Oct 2026. Amends 331 (a widget on the glass is drawn) and 341 (the builder, `AHEAD`).

## What the owner said

On a phone: *"the widgets seem a bit unstable. like when i just open my web some widgets are like offset down or
something. also if i load into my web and wait 30 seconds then scroll to, lets say, chess, it still hasn't loaded.
it waited for me to arrive near chess to start loading it. i don't like that."*

## The offset: a card slid in at the height it used to be

Measured in Chromium at 390x844, 320x568 and 412x915, 4x CPU, the phone network of `check/load.js`, cold and warm,
reading each frame after it was painted. **The column in front never moved** once the splash was off: the boot's
own placement (the first page landing at top 0 then centred) all happens under the splash. What moved was the
card a slide brought in:

- **A card that changed height while its column was off the glass.** A column's vertical shift centres its page
  (`columnShift_`), and it is written only when the column is placed. Saved holds the boot's one-loader page until
  it is drawn; star a tool and Saved grows. On arrival `go` draws it, and the placement that follows slid **both**
  axes from where it was — so the card came in 48–110px low and drifted up into place during the slide (Saved after
  a star: 107px at 390, 48 at 320, 110 at 412).
- **A widget still under its loader on arrival.** The Shop's basket was drawn as its card and the loader, 171px
  tall, centred for that; `startScreen_` started it after the slide, the card became 326px and was centred again —
  a jump of 71–82px at the end of every arrival the builder had not got to first.

Not the cause, though each was looked at: fonts (loaded under the splash, ~1s at 4x), `dvh` and the safe-area
insets (already `100dvh`), scroll restoration (nothing scrolls), the banner and toast (fixed, over the grid).

**The fix.** `placeGrid` (shell.js): a column that was not in front before this placement and is placed for the
same page it was placed for last takes its new vertical shift at once (`colShiftNow_`, no transition) — the slide
carries it across, never down. A page turn still slides; the column in front is untouched. And `go` draws the
widget of the arriving card if it is still under its loader (`widgetsBeforeSlide_`, arcade.js) before the slide is
placed, so the card comes in at the height it keeps; the start after the slide then adopts it.

**The rule** is in `check/load.js` (`--shifts` runs only it; LOAD_PORT): at the three widths, cold then warm, signed
in as an admin, the builder held so every arrival beats it — no card on the column opened on moves more than 2px
once the splash is off, and arriving at Shop, Tools, Games and Saved (each from the column opened on), and at
Saved after a star on Tools, the card does not travel more than 2px up or down. Before the fix: 12 failures
(Shop 71–82px, Saved after a star 48–110px). After: none. Each half of the fix was taken out in turn and the rule
went red.

## Chess 30 seconds in: the builder waited for the payload

The builder (341) draws everything in the quiet, nearest first, with no limit on distance — measured over the
fixture, every column and widget was drawn within 4–12s of the payload at 4–6x CPU. But it opened only when the
first payload landed (`aheadOpen_`), and the real backend takes **15–45s** (317, 296). Until then every widget
beside the column in front stayed under its loader, and the arrival was what started it — exactly "it waited for
me to arrive near chess".

**The fix.** `aheadPreOpen_` (shell.js, called by boot.js after `load()`): two frames after the boot's first draw
the builder opens for jobs marked `pre` only — a `pure` widget's drawing, which reads no facts (chess, SuperTux,
Connect 4, Othello, the word games, Scrabble, the maze, the word search, Scramble, the calculator, the timer,
typing). Its slot is carried across the payload's paint by `widgetsHeld_`, as 331 already allowed, so it is never
drawn twice. Everything that reads facts still waits for `aheadOpen_` and is then drawn in the same idle pass,
nearest first, including the videos card's own fetch. Under data saver (`navigator.connection.saveData`) there is
no early pass: the old behaviour.

**Measured** (390x844, 4x CPU, the backend answering at 12s, signed in as a student, three runs each):

| | before | after |
|---|---|---|
| first contentful paint | 390–510ms | 370–430ms |
| first widget drawn beside the column in front | 14.7–15.1s (after the payload) | 1.5–1.7s (under the splash) |
| the 12 pure widgets drawn | ~3s after the payload | by 2.3s, before it |
| everything drawn after the payload | ~3.6s | ~3.6s |
| total builder time / jobs | 2.2–2.5s / 72 | 2.3–2.8s / 72 |
| longest slice | 410–700ms (Find's warm page 3) | 460–790ms (the same job) |
| input delay, a tap every 2s, p50 / max | 8–10 / 67–193ms | 8–10 / 59–142ms |

The early pass costs about 280ms of main thread at 4x, spread over 12 slices under the splash.

**The rule** is a new run in `check/reach.js` (`--only=idle`; REACH_PORT): a fresh load whose backend answers at
12s. At 8s, the payload not in, every pure widget on every column but the one in front must be drawn (before: all
12 under the loader). At 30s the furthest column and Games, Tools, Saved and the Shop are each jumped to with no
slide: no loader on the glass in 1.2s of painted frames, and nothing on the column still waiting.

## Not changed

A landing (the inbox's, two seconds or more after the payload) still puts a widget that reads facts back under
its loader until the builder draws it again from the new facts, about 1.5s at 4x — the 331 rule that no drawing
made from old facts stays on the glass, which check-flow holds.
