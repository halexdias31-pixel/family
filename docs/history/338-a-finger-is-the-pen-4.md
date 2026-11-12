# 338-a-finger-is-the-pen (part 4 of 4)

Continues [part 3](338-a-finger-is-the-pen-3.md).

### After review, round 4 (12 Oct)

A verification of round 3, with real touch through CDP (Chromium 1194, 4x CPU) on the board, on June 2024 1F Q7 and on
November 2019 1H Q4, at 390x844 and 820x1180, found one must-fix, one should-fix and one nit. The main session decided
the first three answers; the fourth was left to this round — *if a further fault of the same family appears (a contact
that is not the drawing finger marking, or the drawing finger's line lost), prefer the simpler rule over another
special case* — and it was needed three times.

**The must-fix: a palm landing after an aiming finger took its stroke.** A finger held still on the armed picture
(aiming a line, or a point) is the owner and a dot. A palm landing on the picture after it, at any age, was held as the
candidate (T2, kind b), and once its centre had moved 10px alone — a palm settles 6–12px as it flattens, round 1
measured, and 16 is not rare — T4 handed it the stroke, as the pen hands a palm-first stroke to the finger. Its settle
was shown and stored, and the finger, a rest from then on, drew a line that was lost. The ruler and the compass did the
same when the palm landed within 200ms of the finger. 4955c7c, where the first finger always owned the stroke, kept the
line in every case: a regression, and the spec's own §2 row *"finger held still, a palm lands, finger draws"*.

**The should-fix: the race counted the still one from its own down.** After the pin rule refuses a contact the two race
(round 3), and the still one — a palm or a pin — was measured from where it went down, so what it moved before the other
landed counted. A palm that settled 9px as it was put down (under 10: a dot, so it never marked) needed only 2–4px more
while a slow-starting finger was at 10–12px: its own ruler line or a ring round itself, shown and stored, and the
finger's 120px line after it lost. 2a89387's subject — *"after a refused swap the pin or palm never marks once the finger
has drawn 30px"* — was not true: here the finger drew 120px. A commit message cannot be changed; this note is where it is
corrected.

**The nit: the race was asked at the frame's time.** Each of the still one's samples was compared with how far the
refused one had gone by the frame that asked, not by that sample — so a late frame could find a palm that had settled
and then slid along already past the finger's sample that beat it, and lose the line.

**Reproduced first, on 2a89387,** with the verifier's probes (`probe3.js`, `probe4.js`, copied into this round's own
scratch), real touch at a load of 1–8. The container restarted part-way through this round and its suite went with it;
the numbers below are from the pass after, run again on 2a89387, 4955c7c and the fix, and where the first pass said
something else it is said so:

- *Must-fix, the pen* (`probe4.js`, the board and Q7 at 390 and 820; a finger trembling ±0.3px on (0.2, 0.35) of the
  ink, a palm of radius 25 landing on (0.8, 0.85) 300ms or 1.5s later and settling S px in 80ms, the finger drawing half
  the ink's width 150 or 400ms after the palm landed): **16 of 16 at S = 12 and 16 stored the palm's settle** —
  `[[272,289,257,289]]` on the board, a squiggle from (272, 289) on Q7 — shown in 26–50 frames, and none of the finger's
  line. At S = 9, and with the palm on the card off the ink, the finger's line (8 of 8). 4955c7c: the finger's line,
  24 of 24.
- *Must-fix, every tool* (`probe3.js --only=aim`, Q4): the pen at 12, 16 and 12-with-150ms, 6 of 6 the palm's mark; the
  ruler and the compass with the palm 120ms after the finger, 4 of 4 — `[[289,289,274,289]]` or a ring at the palm.
- *Must-fix, with a lift* (`probe6.js`, written for this round; Q4 at 390 and 820): the same palm settling 12 or 16px and
  LIFTING before the finger moves (a hand brushing the picture), or the finger LIFTING still while the palm stays (a
  tap): **the palm's settle stored, 8 of 8 and 8 of 8**, every tool — and the brushed finger's line after it lost.
  4955c7c: the finger's line; for the tap, the tap's dot with the pen and nothing with the tools.
- *Should-fix* (`--only=headstart`, the palm 400ms first settling 8–9px, then drifting 2–4 under a minimum-jerk finger):
  the ruler 3 of 8 and the compass 1 of 6 stored the palm's line or ring (`[[289,289,303,289]]`…) — 4 of 8 and 3 of 6
  in the first pass; the controls (no drift, 6+6, 0+12) nothing. Timing-dependent, as the review said. The pin
  (`--only=pinslow`), settled 9px and rolling 3: its ruler line, `[[153,170,167,170]]` at 390 and `[[153,170,166,170]]`
  at 820. 4955c7c, where the first finger owned the stroke: every headstart run (26 of 26, the controls too) and every
  pin run (12 of 12) marked.
- *jsdom:* this round's cases laid over 2a89387's check-flow fail as above — the pen at 12 and 16 at 300ms and 1.5s, the
  ruler and the compass at 12 and 16, every lift case, the 9+3, 9+4 and 8+4 ruler drifts, the 'pause' case below, the
  compass pin settled 9 or 8 and rolling 3 or 5, and the nit's one-frame case (the finger's line lost) — preview, aid
  and store.

**Fixed, as decided.**

1. *A later contact is handed the stroke only once it has gone `PAD_KEEPUP_PX`* (`padJudge_`): when the one that moved
   alone is the held candidate and `padTakes_` would hand it the stroke — the pen at any age, the tools within 200ms —
   the hold goes on until it has gone 30px. A settle stops short; a finger drawing after a palm goes 30px in 100ms. If
   the still one moves meanwhile, round 1's keep-up-and-half rule tells a settle from a second finger, and the still
   one's line comes back.
2. *The race starts where the still one was when the first refused contact landed* (`raceAt`, `raceFrom`, kept by
   `padAlone_` by the samples' clock); its samples before that are not a race with anything.
3. *The race is judged by the samples' clock on both sides*, not against how far the other had gone by the frame.

**And then, three times, the simpler rule (decision 4).**

*A lift hands nothing over.* The verifier's rule for 1 kept an exception — *unless a lift forces the decision* — and the
same palm marked whenever something lifted first. Measured with real touch (`probe6.js`, Q4, 390 and 820) on 1–3 as
decided: **a palm that settled 12 or 16px beside an aiming finger and lifted before the finger moved was handed the
stroke at its lift — its settle stored and the finger's line after it lost, 8 of 8 across the pen, the ruler and the
compass; a finger that tapped still beside a settling palm handed it the stroke at its own lift, the palm's settle
stored, 8 of 8** — in both passes, exactly as 2a89387 did. The special case was the fault, so it went: the 30px holds
at a lift too (`padOwed_` with no `force` way round it), and for the one left holding a stroke when the first lifts
(`padSwap_`, held — it moved on from 10px, which is how the tap handed the palm its settle). The cost is in §4: the first
strokes after a palm lands, if shorter than 30px, are lost while it stays down and still (`probe6.js` "tick": a 20px pen
tick and a 20px ruler tick, palm first — 2a89387 and 1–3 as decided stored both, 4955c7c the palm's dot for the pen;
now nothing, 4 of 4).

*The race is to 30px on both sides.* With 2 and 3 in, the still one still won at 10px when it had gone "further than the
refused one had" by then — and asked by the samples' clock, a ruler's **pin that rolled 12px in 200ms beside a second
finger starting slowly won in every run of both passes: its own line, `[[153,170,167,170]]` at 390 and
`[[153,170,166,170]]` at 820** (`probe3.js --only=pinslow`). 2a89387 stored nothing there, by luck of when its frames
ran: asked at a late frame, the accelerating finger was ahead. In jsdom the 'pause' case won too — the palm settled 9px,
the finger refused at 12 and pausing, the palm drifting 22 more: "further" than 12, so its ruler line or ring. 10px is
inside what a pin rolls and a palm settles — round 3 said so of round 2's threshold, and the race kept 10px for the
still one. So the still one wins only by going `PAD_KEEPUP_PX` before the refused one does, from `raceFrom`, by the
samples' clock: one number for every hand-over and every race, and nothing compared but the two moments each side
crossed it. The nit's comparison is gone with it — there is no "how far had the other gone" left to ask at the wrong
time. The cost, in §4: an aiming finger's ruler line or compass radius shorter than 30px, beside a palm that landed
over 200ms later and settled 10px, is lost; round 3's residual stray mark ("a palm that drifts further than a refused
finger's line under 30px") now needs a 30px slide.

*Whichever is left alone in a held stroke is handed it at 30px.* A lift handing nothing over has a second side, found
while checking the cost above: after a palm-first tick shorter than 30px it is the PALM that is left holding the stroke,
with nobody beside it, and an owner moving alone was handed it back at 10px — so the hand moving on to the next stroke,
the palm sliding 15px, drew its slide, and every finger after it was a rest beside an established stroke, its line lost
until the palm lifted (jsdom, the fix as it stood: the palm's slide stored and a 60px line after it lost; the ruler the
same, `[[320,320,305,320]]`). 2a89387 did the same after a finger's *tap*; the 30px hand-over had widened it to every
tick under 30. Once the other has lifted there is nothing left to compare the one left with, and a finger after a palm's
brush and a palm after a finger's tick move alike — so whichever is left alone is handed the stroke only at 30px, as a
later contact is: one rule for both sides of a lift (`padOwed_`: the candidate it may go to, the one it went to at a
lift, and the owner whose candidate lifted). Not an owner with its candidate still down — moving alone beside a contact
that stays still is the evidence, and round 1's P7 holds its line back within a frame at 10px. And the one it went to at
a lift stays owed when a new finger lands beside it: a palm handed a finger's tap that drifted 12px more as the next
finger landed was otherwise handed it back at 10px (jsdom). The cost, in §4: the aiming finger's short stroke after a
palm has brushed the picture is lost (jsdom: a 20px line, nothing; 40px, the line). In real touch (`probe7.js`,
written for this, Q4 at 390 and 820): a palm 400ms first, a 20px pen tick, the palm sliding 15px, with a 120px line
after it or without, and the ruler with the palm 100ms first — **the fix as it stood stored the palm's slide 6 of 6,
the line after it lost; now the line, and without it nothing, nothing shown** (2a89387: the tick, nothing at the palm;
4955c7c: the palm's slide, 6 of 6). The tap, then a finger landing as the palm drifts 12px more: the finger's line at
390 and 820 (2a89387: the palm's settle).

| | a palm settling 12/16px beside an aiming finger, then the finger draws | the palm settles and lifts first (brush) | the finger taps still beside it | a palm 400ms first, settled 8–9px, drifting 2–4 under a slow finger | a pin rolling 12px in 200ms beside a slow finger | a palm-first 20px tick | a palm-first 20px tick, the palm sliding 15px, then a finger's line |
|---|---|---|---|---|---|---|---|
| 4955c7c | the finger's line | the finger's line | the tap's dot (pen), nothing (tools) | the palm's line or ring (it owned the stroke), 14 of 14 | the pin's line or ring, 4 of 4 | the palm's dot (pen), nothing (ruler) | **the palm's slide, the line lost**, 6 of 6 |
| 2a89387 | **the palm's settle**, 16 of 16 | **the palm's settle**, 8 of 8 | **the palm's settle**, 8 of 8 | **the palm's line or ring**, 4 of 14 (7 of 14 in the first pass) | nothing (frame luck) | the tick | the tick and the line |
| 1–3 as decided | the finger's line | **the palm's settle**, 8 of 8 | **the palm's settle**, 8 of 8 | nothing | **the pin's line** (ruler, 2 of 2) | the tick | the tick and the line |
| + a lift hands nothing over | the finger's line | the finger's line | nothing | nothing | **the pin's line** (ruler, 2 of 2) | nothing | **the palm's slide, the line lost** |
| + the race to 30px | the finger's line | the finger's line | nothing | nothing | nothing | nothing | **the palm's slide, the line lost**, 6 of 6 |
| **+ whichever is left alone, at 30px (committed)** | **the finger's line**, 23 of 24 on the board and Q7 (a 16px settle, nothing — §4) | **the finger's line**, 8 of 8 | **nothing**, 8 of 8 | **nothing**, 0 of 14 | **nothing**, 0 of 4 | **nothing (the cost)** | **the line, nothing at the palm**, 6 of 6 |

The rows between are the same probes on those states of `find.js`: 1–3 as decided, `probe4`, `probe6`, `pinslow` and
`headstart` in this pass (`probe4`: the finger's line 23 of 24 — a 16px settle on the board at 390 stored nothing, §4's
cost); with the lift rule as well, the first pass's runs and `pinslow` in this one; the race to 30px, this pass's first
run of the fix, before the last rule. In the last column the rows for 1–3 as decided and for the lift rule are
check-flow's case on those files, and the rest `probe7.js`.

**What is left, written into §4:** a palm-first finger's preview shows from 30px; the first strokes after a palm lands, if
under 30px, are lost while it stays down and still (a finger's tap beside a settling palm stores nothing — §4's first
line), and so is an aiming finger's short stroke after a palm has brushed the picture; a settle over 15px beside an
aiming finger reads as moving with it on a small, slow line; an aiming tool line under 30px beside a late, settled palm
is lost; a palm that slides 30px after a refused finger's line under 30px marks. And one found and not changed: **a palm
resting first that slides 10px while a just-landed finger beside it has moved under 5px is resumed as the one drawing**
(T4's "the owner first"): a palm that settled 9px and slid 22px in 200ms under a slow-starting finger stored its ruler
line or a ring round itself at 390 and 820, 7 of 8 over two passes (`probe3.js` headstart 9+22) — as 4955c7c, 2a89387
and 1–3 as decided all did. By movement it is the aiming finger's case. The simpler rule that would catch it — nothing
held is decided under 30px, the owner too — was laid over this round's check-flow and lost the aiming ruler finger's
line beside a settled palm sliding along with it (round 3's two cases, and this round's one-frame case) and P7's
preview within a frame. Named for the next review; the size rules (increment 2) are what tell a palm.

**Checked.** check-flow's review journey ("the finger pen after review"), on the 340x170 question pad with a construction
question's tiles:

- *the must-fix*: a finger aiming, a palm landing on the picture and settling 9, 12 or 16px — the pen at 300ms and 1.5s,
  the ruler and the compass at 120ms — then the finger draws: the finger's line (the compass: its arc, every point 60px
  from where the finger went down), shown as it is drawn, nothing near the palm, and nothing on the picture while the
  palm settles;
- *a lift hands nothing over*: the same palm settling 12 or 16px and lifting before the finger moves — the finger's line;
  the finger tapping still while the palm stays — nothing, and nothing shown; every tool;
- *the cost, so it cannot grow unseen*: a palm resting first, then two 20px pen ticks — nothing — a 60px line — kept —
  and a 20px tick — kept, the palm a watched rest by then; a 20px ruler tick, the palm 100ms first — nothing;
- *the should-fix*: a palm 400ms first, settled 8–9px, drifting 2–4 more under a slow-starting ruler or compass finger —
  nothing, nothing shown; and the case that tells `raceFrom` from the palm's own down: the palm settled 9px, the finger
  refused at 12px and pausing while the palm drifts 22 more (31 from its down) — nothing; a pin that settled 8–9px as it
  was put down and rolls 3–5, or rolls 12px in 200ms beside a slow finger — nothing;
- *the race to 30px*: a finger's 20px ruler tick refused, then the palm drifting 15 or 28px — nothing (round 3 stored the
  28px line); the aiming ruler finger and settled palm, the finger at 32px by its samples before the palm slides past 30,
  all of it before one frame — the finger's line (2a89387 lost it); the same with the finger drawing 20px — nothing (the
  cost) — and 40px — its line;
- *whichever is left alone*: a palm resting first, a 20px pen tick, the palm sliding 15px, then a finger drawing 60px —
  the line, nothing at the palm, nothing shown while it slides; the same without the line, and the ruler with the palm
  100ms first — nothing; a palm brushing the picture after an aiming finger, then a 20px line — nothing (the cost) — and
  40px — its line; a palm handed a finger's tap, a new finger landing as it drifts 12px more, then drawing 60px — the
  finger's line;
- round 3's cases and guards unchanged (the 'aim' guard's comments now say "30px first", not "further").

`check/pen.js`: **'palmafter'** (new) — the pen on the board and on Q7 at 390 and 820: the aiming finger with a palm
landing 300ms or 1.5s after it and settling 9, 12 or 16px (the finger drawing 150 or 400ms after), the palm on the card,
the palm settling and lifting first, and the finger tapping beside it; never a mark at the palm, the finger's line (at
16 the line or nothing, printed), nothing at all for the tap and nothing shown, and 'retap' — the tap, then a finger
landing as the palm drifts 12px more: the finger's line. **'palmtool'** adds the ruler and the compass with the palm
120ms after the aiming finger — settling 12px; settling and lifting; the finger tapping — the palm 400ms first settled
9px and drifting 2–4 under a slow-starting finger, the 'pause' case, and 'alone' — a palm first, a 20px tick, the palm
sliding 15px: with the pen and a 120px line after it, the line; else nothing, nothing shown. **'pin'** adds the pin
settled 9 and rolling 3, settled 8 and rolling 5, and rolling 12px in 200ms, beside a slow-starting second finger.

#### Mutations, round 4

Each is the committed `find.js` with one change (the last, that state's whole `find.js`); the real files are green after
(below). check-flow with `FLOW_ONLY='the finger pen'`: the review journey red in every one; `check/pen.js` on the
sections that reach it, at 4x CPU and a load of 15–20 from other builds:

| mutant | what it puts back | check-flow (lines) | `check/pen.js` (lines) |
|---|---|---|---|
| nohold | no hold: a later contact handed the stroke at 10px, as 2a89387 | red (105) | 'palmafter', 'palmtool': red (111) |
| lifthands | the verifier's rule as written: the candidate only, and a lift decides from 10px | red (52) | red (76) |
| liftonly | only a lift's way round the 30px | red (52) | — |
| heldten | only the candidate owed: whoever is left at a lift, at 10px | red (36) | red (59) |
| aloneten | the owner whose candidate lifted, at 10px — the fix before the third rule | red (11) | 'palmtool' ('alone'): red (22) |
| latecand | the one handed a stroke at a lift owed only while alone | red (3) | 'palmafter' ('retap'): red (9) |
| owndown | the race from the still one's own down | red (6) | 'palmtool' ('pause'): red (5) |
| atframe | the still one at 10px and "further than the refused one's furthest", asked at the frame | red (11) | 'pin', 'palmtool': red (10) |
| tenrace | the still one wins at 10px from `raceFrom` | red (28) | 'pin', 'palmtool': red (20) |
| dec3race | 1–3 as decided with the lift rule | red (24) | 'pin': red (4) |

Two of those runs also failed a 'shown' check their change does not reach — heldten the board at 820 with a 16px
settle, latecand Q7 at 820 with a 9px one: the line stored, and in none of 34 and 55 frames — at a load of 17–20.
Run alone on the real files at that load, 'palmafter' passed twice (26–28) and failed the same check three times at
21–32 — 5, 1 and 3 cases, every line stored right — and so, once, did 4955c7c with this check laid over it (Q7 at 820, at
30–32), where a line is on the picture from the finger's first sample. A frame trace in the page says why: under that
load a finger's 400ms line reached the page in as little as 60–190ms with two frames in it, and in the failing cases in
one frame or none; a held stroke is decided at a frame (round 1), so a line delivered that bunched can be decided after
its last frame. At the full check's load (4–17), and in this round's probes at 1–8, every line was shown, in 1–44 frames.

#### The suite, round 4

Run on the files as committed, ports 20301–20308; the load was 4–22 for the suite and 16–32 for the runs again, other
builds on four cores most of the time.

- `check.js`, `check-const`, `check-css`, `check-doors` (233 handlers, 232 doors), `check-loading`, `check-drafts`,
  `check-scope`, `check-strings`: green.
- **check-flow in four parts, 82 + 83 + 83 + 83 = 331 journeys: all green**, at a load of 4–20.
- **`check/pen.js` in full, `--verbose`: OK in 619s** (load 4–17): every 'palmafter', 'palmtool' and 'pin' case as above,
  printed; 'samples' and 'round' as before.
- **`check/ui.js`** `--screen=tools`, `--screen=stuff`, `--screen=saved`: exit 0, nothing new.
- **`check/swipe.js`: OK**, 112 gestures. **`check/cascade.js`: OK.** **`check/cards.js`: OK.**
- **`check/press.js`** `--screen=tools`: 2 misses at 18–20 (the board's padlock; Draw on Q-1CM-transformations-of-graphs-8);
  run again alone, 2 at 16 (a Games flick chain; Draw on 1F-11c) and 3 at 21–24 (Draw on Q-1CM…, the pen on a diagram's
  Draw, Flabby Pird's touch-down) — and 4955c7c between them, OK at 16–19 and then 8 misses at 24–25 (Games, a shop mark,
  a tall card's pages). `--screen=stuff`: 3 misses at 18–20 (two Games flick chains; the same Draw); alone, 1 at 19–26 (a
  Games press mark), and 4955c7c 2 at 26 (Draw on Q-1CM… and on 1F-11c). Nothing threw and nothing was silently inert in
  any run; the kinds are round 3's load misses, on both.

**Not run as one: `npm run check`**, as in rounds 1–3: its browser members take ports outside this build's range. Every
member that touches the pen, the swipe engine or the stylesheet was run above.
