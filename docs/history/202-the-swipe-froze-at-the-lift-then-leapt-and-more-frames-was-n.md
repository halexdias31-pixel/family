## The swipe froze at the lift, then leapt, and "more frames" was not it

**Asked for as *"refine the swiping to feel more stable. idk what it is... maybe more frames?"*.**
Three investigators measured it frame by frame under real touch, a fourth was told to refute them,
and they agreed: **the drag already tracks the finger to the pixel once per drawn frame.** What was
wrong is the moment the finger lifts. A settle is a CSS transition the compositor runs, which is
also the only way to get more than 60Hz on an iPhone — a JavaScript loop would get fewer frames.

| at 4x CPU, 30 gestures | before | after |
|---|---|---|
| release stall p50 / max, 390x844 | 226 / 383 ms | **47 / 110 ms** |
| release stall p50 / max, 320x568 | 191 / 462 ms | **40 / 145 ms** |
| first frame after a flick | 96–320 px against a finger at 22 | **19–21 px** |
| slides teleported the rest of the way | 2 / 30 and 6 / 30 | **0 / 30** |

**WHAT CAUSED IT, IN ORDER OF SIZE:**

| | |
|---|---|
| `--slide` written on `<html>` at every release | an inherited custom property, so ~3,000 elements re-styled before the card could move. The duration and curve are written on the eleven columns now |
| the curve `cubic-bezier(.16, 1, .3, 1)` | leaves at 6.25x its average speed. `settleCurve_` builds one per release whose starting slope IS the finger's speed (`s = v·T/D`), 260–420ms |
| an instant placement mid-slide | `transition: none` cut the glide and the card teleported. Instant becomes animated while a settle runs |
| `paneWatch_` in the release frame | re-zoomed every pane on the column for nothing. It measures only new panes, or all of them when the viewport changes |
| the release speed | two `Date.now()` samples, never expired. A least-squares line over the last 80ms of `e.timeStamp` samples, coalesced ones included, and nought if the finger had stopped — a flick held a second before lifting turned the page |
| the ten pixels of axis lock | added in one frame, so every pick-up twitched. Taken off what is placed, not what is decided |
| a card caught still settling | snapped to its target. Its leftover distance is carried by the drag |

**AND THE CATCH SHIPPED WITH A BUG THAT THE REFUTER FOUND AND I DID NOT.** The leftover distance
went into the DECISION as well as the placement, so a second flick up 30ms after the first carried
hundreds of pixels the other way and turned the page back — 1, 2, 1. Worse than the jerk it fixed.
It is in what is placed only; `PAGE` already names the page being settled to.

**`check/press.js` HAS THE CHAINED FLICK NOW, and writing it cost a wrong fix.** Its first version
awaited each touch move, which spaced them 33ms apart, so its "flick" was a slow drag no code would
turn a page on — I read that as the new speed fit being too slow and narrowed the fit window before
measuring the harness. Reverted. Moves are sent every 8ms without waiting now, the way a phone sends
them, and the rule fails the mutant with the catch in the decision and passes the real code.
`check-flow.js` asserts the curve's slope equals the release speed and that nothing is written on
the root; both proved by mutation.

**Smaller, from the same plan**: after-slide jobs wait for the settle and a lifted finger and run one
per task; a tap-driven slide eases out of rest (`.3s cubic-bezier(.3, 0, .2, 1)`); the settle starts
16ms in so there is no dead first frame; the press highlight goes when the axis is claimed; the
hidden splash stops animating; Flabby's message keeps its line so the card does not shrink on touch.
**Not done, and named**: pre-painting stale neighbours at rest, and catching a sideways settle with a
vertical drag — medium risk, and the second is inferred rather than measured.
