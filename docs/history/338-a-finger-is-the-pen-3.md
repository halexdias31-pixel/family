# 338-a-finger-is-the-pen (part 3 of 4)

Continues [part 2](338-a-finger-is-the-pen-2.md).

**The container restarted** part-way through this work, after the fixes were written and before they were committed.
Nothing it had run was taken on trust: every check below was run again on the files as committed, every mutation was
made again from them (one change each, in a copy — the worktree never written), and every red on 2a7a7f3 was asked
again of a copy of 2a7a7f3 with today's checks laid over it. Two things were added in the rerun: the memo's
character budget (7, above) and a check for the "came later" mark (Found while fixing, above), each with its
mutation. The load average through it was 9–53 on four cores, from other builds; every timing below says so.
Ports 19883–19888 only.

- `check.js`, `check-const`, `check-css`, `check-doors` (233 handlers, 232 doors), `check-loading`, `check-scope`,
  `check-strings`, `check-drafts`, `check-widgets`: green. `check-dead` (soft) prints the report 2a7a7f3 prints.
- **check-flow in four parts: 82 + 83 + 83 + 83 = 331 journeys** (330 at 2a7a7f3, and the one added here). Part 4,
  at a load average of 26–33, failed one journey that does not touch the pen — "the payload landing does not rebuild
  Find under a keypad box…", whose wait is half a second — and it passed run again alone (load 34): load. **The 21 pen
  journeys together, alone** (the 15 of 4955c7c, the five of increment 1, the one added here): all green.
- **`check/pen.js` in full: OK in 269s** (load 32–35). Its 'samples': 1,201 of 1,201 distinct samples kept at 390
  and 820; at most 2 live `d`s written in any frame (of 798 and 591 frames); **0 forced layouts** in 125 and 213
  traced pen events; the path painted in the first frame after its event for **100%** of them; the handler's p95
  3.6 and 2.9ms by the wall clock and 3.25 and 2.88ms of thread time (printed, against the 3.0 reference) — the
  frames over 33ms (63 of 797 at 390) say how busy the machine was. With `PEN_QUERY=pen=sizes`: OK, 0 forced in 229
  and 169 events. 'phase': 0 of 8 at both sizes. Its pictures read: the gripped board with both lines, the
  two-finger compass on November 2019 1H Q4 with nothing on it and the Compass tile chosen, the round circle.
- **On 2a7a7f3, the same sections red:** 'grip' (both sizes, `[]`), 'settle' (thumb-roll-9, palm-card-settle-12,
  palm-lands-settles, all `[]`, both sizes), 'types' (the palm's dot `[[238,289]]` for the stylus's line, and `[]`
  for the finger's, both sizes), 'pin' (the swung arc and `[[205,170,254,170]]`), and 'samples' with `?pen=sizes`
  (138 of 138 and 155 of 155 events forced a layout). 'phase' drew 0 of 8 there too; its red is the mutation's.
  check-flow's review journey on 2a7a7f3: every case named in 1–4 and 7, 9 and 11 above red.
- **Mutations, each in its own copy, each red, the real files green after** (and compared: a copy differs from the
  worktree by its one change and nothing else). check-flow: TWO kept while still (both held-hand cases); TWO
  dissolved at every landing (the tap's guard, `[[113,85]]`); no keep-up wait (the thumb roll keeps one line of
  two, the palm first keeps none); no half (all four settle cases); the pin rule removed (the compass arc and the
  ruler line); no `PAD_LAG_MS` (the late report's pan drew); every chunk rewritten every frame (3 writes in a
  frame); the group rewritten on Undo; no memo; the memo held to 4,000 strokes (5,772K characters); the sizes line
  written in the event; T0 for every kind (the stylus's line and the finger's); the "came later" mark kept (the
  palm's slide stored). `check/pen.js`: TWO kept while still → 'grip' `[]` at both sizes; no keep-up and no half
  → 'settle' (no keep-up: thumb-roll-9 one line of two at 390, the palm settle and the landed palm nothing at both;
  no half: all three at both); the pin rule removed → 'pin'; decided inside the event → 'phase' 8 of 8 and 3 of 8;
  T0 for every kind → 'types' at both sizes; the bar's lifts swapped back → 'bar' (the pen itself says which lifted
  first); every chunk rewritten → 10 live writes in a frame; a frame added → painted in the first frame for 33%
  and 36%; a style write and a box read per event → 44 of 114 and 92 of 186 forced; the sizes line in the event →
  202 of 202 and 168 of 168 forced. Decided inside the event stays green in jsdom (its frames are timers): the
  browser holds it.
- **`check/swipe.js` in full: OK** (410s, load 28–30). **`check/cascade.js`: OK. `check/cards.js`: OK.**
- **`check/ui.js`** `--screen=tools`, `--screen=saved` and `--screen=stuff`: exit 0, nothing new; their "not reachable"
  lists are word for word the ones printed before the restart, which increment 1 recorded as 4955c7c's.
- **`check/press.js`** `--screen=tools`: 6 swipes went elsewhere at a load average of 30–48, and 4 run again at
  11–20 — every one a timed tap or flick: "tap Draw" on Q-1CM-transformations-of-graphs-8 not turning the card in
  300ms, a flick chain on Games, a press mark on Feed. **4955c7c, before any of 338, under the same load (40),
  missed 6 — the same "tap Draw" at both sizes, and the padlock and "touch across" ones** — and 2a7a7f3 missed 4.
  None arms a pad, so none reaches the pen (`PAD_ON` is empty and the listeners do nothing). `--screen=stuff`: 4,
  then 3 — the same kinds; 4955c7c at a load of 37–39 missed 3, the same "tap Draw" at 844x390 among them. Nothing threw and nothing was silently inert in any run. Load, and the same on the base.

**Not run as one: `npm run check`.** Its browser members take fixed or OS-chosen ports outside this build's range;
every member that touches the pen, the swipe engine or the stylesheet was run above, alone.

### After review, round 2 (12 Oct)

A verification of round 1, with real touch through CDP (Chromium 1194, 4x CPU, November 2019 1H Q4 armed with a
real tap and each tool chosen with a real tap on its tile, at 390x844 and 820x1180), found one should-fix — in round
1's fix 3 — and nothing else. It was reproduced first on a4d0ccf with the verifier's own script, at a load average of
18–27, and then held by checks that are red there.

**The finding: a refused swap made the still owner the stroke again, with 4px to go.** When the later contact moves
alone and the pin rule refuses it the stroke (ruler or compass, the owner down more than 200ms before it), `padAlone_`
resumed the owner — and `PAD_DRAW.ruler.end` and `compass.end` asked only `PAD_MIN_PX`, 4px. Two things followed, and
§4 listed neither:

1. **A pin that rolled stored its own mark.** Finger 1 trembling ±0.4px on the centre for 300ms, then drifting 6px
   over 300ms while finger 2 swings 270° round it at 0.28 x the picture (or slides 40px, the ruler): a4d0ccf stored
   `[[153,170,160,170]]` for the ruler and a 10–11-point ring of radius about 8 units round the pin for the compass,
   at 390 and at 820. With no drift, `[]`. The brief's stray blob, where §4 said nothing is stored.
2. **A palm resting on the picture first took the finger's tool line, and left its own.** A palm (radius 25) at
   (0.85, 0.85) of the picture, still for 400ms; then the finger lands at (0.25, 0.4) and draws a 120px ruler line,
   or opens 60px and swings the compass, while the palm drifts 6px in the first 120ms: a4d0ccf stored the palm's
   `[[289,289,296,289]]`, or a 10-point ring at the palm, and the finger's line was lost (with no drift, `[]`).
   2a7a7f3 drew the finger's line every time; 4955c7c stored the palm's marks. The pen drew the finger's line in every
   case, and so did every tool when the palm came only 120ms before the finger.

**Fixed: a ruler's or compass's still owner made the stroke again after a refused swap marks nothing until it has moved
10px.** *(Not enough: the third review drifted the palm and rolled the pin 12px and both marked again — 10px is inside
what a palm drifts. Replaced by a race in round 3, below.)* In `padAlone_`, when the other moved alone and may not take the stroke, a tool stroke gets `g.min =
PAD_STILL_PX`, and the tool's end (and the compass's radius line in the aid, so it does not show a radius that will not
count) asks `padMinOf_(g)` in place of `PAD_MIN_PX`. 10px is the app's own "has moved" (§3). A 4–9px roll of a pin or
drift of a palm marks nothing; a finger that was aiming when a palm landed and settled is made the stroke again, and its
line is far past 10px. The pen is untouched: a pen's resumed owner is the finger (the pen hands a palm's stroke over at
any age). Nothing stored changes shape.

**Decided: the tools keep the pin rule, so a palm resting more than 200ms before the finger takes the finger's ruler
line or compass arc with it — and each one after, while it stays down** (§4 and §9 say so now). The review left the
choice to whoever decides; it is decided here on this note's own rule, with every alternative written down and
measured, so that it can be changed knowingly. By movement a resting palm and a pin are the same thing — an old, still
owner and a later contact moving alone — and with no size to go on, every answer loses something:

| after a refused swap | a pin, and a second finger swinging round it | a palm resting 400ms, then the finger | a finger aiming 300ms, then a palm lands and settles 12px |
|---|---|---|---|
| **made the stroke again, 10px to mark (chosen)** | nothing | nothing: the finger's line lost, and the next while the palm stays | the finger's line |
| the swap handed back to tools (2a7a7f3; the spec's T4) | an arc round where the swinging finger landed; a ruler line along its slide | both of the finger's lines | the palm's settle stored, `[[320,320,308,320]]`, and the finger's line lost |
| the stroke withdrawn, the owner a rest | nothing (a second swing with the pin left down: an arc round the wrong centre) | the first line lost, the second drawn | nothing: the finger's line lost |
| the swap only when the two landed more than `PAD_TOGETHER_PX` apart (a palm heel is 60mm+ from the fingertip) | nothing within 200px; a wider span, or two hands, the wrong arc | the finger's line beyond 200px, lost within it | beyond 200px, the palm's settle stored |

The first three rows are measured in jsdom (the journey's own cases, each alternative as a one-line mutation); the last
is reasoned from the first two and was not built — and would not have saved the review's own case: its palm and finger
are about 190px apart on Q4's picture at 390 and about 200px at 820 (measured from the pictures), because a card's
picture is at most 320px wide and a palm resting ON it is never far from the finger. **Only the chosen row never leaves a mark that was not meant** *(as built in round 2 it did leave one: a palm or a pin
that went 10px or more marked — round 3)* —
§4's first line, "a mark lost rather than a stray one left", and the brief's *"accidental stray ink blobs"*. Its cost
is a palm resting on a construction card; lifting it, or putting it down with the finger, draws. Increment 2's size
rule is the real answer: a palm is a rest by its size, and then the pin rule need only ever be asked of fingertips.

**Checked.** check-flow's review journey, on the 340x170 question pad with a construction question's tiles:

| case | a4d0ccf | now |
|---|---|---|
| a pin on the compass's centre rolling 6px while a second finger swings | an 11-point ring round the pin | `[]` |
| a pin on the ruler's end rolling 6px while a second finger slides | `[[170,170,176,170]]` | `[]` |
| a palm 400ms before the ruler finger, drifting 6px, then a second line with the palm still down | `[[320,320,314,320]]` | `[]` |
| the same with the compass | an 11-point ring at the palm | `[]` |
| *guard:* a ruler finger aiming 300ms, a palm landing and settling 12px before it moves | the finger's line | the finger's line |
| *guard:* a palm 120ms before the ruler finger, drifting 6px | the finger's line | the finger's line |
| *guard:* a palm 400ms before the pen finger, drifting 6px | the finger's line | the finger's line |

`check/pen.js` 'pin' now runs at 390 and 820, each tool with and without a 6px roll, and the new 'palmtool' (the review's
palm, 400 and 120ms before the pen, the ruler and the compass, drifting 6px): never a mark at the palm, never a mark that
is not the finger's, the finger's line wherever the palm came within 200ms or the tool is the pen, and the pen let go
after. On a4d0ccf, with this check laid over it: 12 findings — the rolled pin's ruler line and ring at both sizes, the
palm's line and ring at both sizes (each "at the palm" and "not the finger's"). Now: OK, at both sizes; the ruler and
compass with the palm 400ms before store `[]`, printed as the cost.

**Mutations, each one line in its own copy, each red, the real files green after** (each copy differs from the worktree
in `js/find.js` by its one line and nothing else):

- the 10px rule removed → check-flow: the two rolled pins and the two resting palms; `check/pen.js`: the same 12 as
  a4d0ccf.
- the pin rule asked of the pen too → check-flow: the pen 400ms guard (the palm's drift stored as a pen stroke, the
  finger's line lost); `check/pen.js` 'palmtool': the pen at 400ms, both sizes.
- the pin rule at any gap (`> 0`) → check-flow: the ruler 120ms guard, and round 1's palm-first compass at 40ms;
  `check/pen.js`: the ruler and the compass at 120ms, both sizes.
- withdrawn outright in place of made the stroke again → check-flow: the aiming finger's line lost (and the resting
  palms' second lines drawn — the table's third row).
- the pin rule removed (round 1's own mutation, run again for the table) → check-flow: both held pins, both rolled pins,
  both resting palms (the finger's lines) and the aiming finger (`[[320,320,308,320]]`).

#### The suite, round 2

Run on the files as committed, ports 19883–19888, at a load average of 11–44 from other builds on four cores.

- `check.js`, `check-const`, `check-css`, `check-doors` (233 handlers, 232 doors), `check-loading`, `check-scope`,
  `check-strings`, `check-drafts`, `check-widgets`, `check-library`, `check-funnel`: green. `check-dead` (soft)
  prints, byte for byte, what a4d0ccf prints.
- **check-flow in four parts: 82 + 83 + 83 + 83 = 331 journeys, all green** (455, 206, 254 and 547s, load 13–27); the
  journeys that draw, run together alone: 19 of 19.
- **`check/pen.js` in full: OK in 301s** (load 17–27): 'samples' kept 1,201 of 1,201 at 390 and 820, at most 2 live
  writes in a frame, 0 forced layouts in 240 and 246 traced events, the path painted in the first frame for 100%;
  'phase' 0 of 8 at both sizes. With `PEN_QUERY=pen=sizes`, 'samples': OK, 0 forced in 245 and 239. 'pin' and
  'palmtool' alone: OK at both sizes, three times. The pictures read: November 2019 1H Q4 at 390 and 820, armed, the
  Compass chosen, nothing on the picture after a two-finger compass.
- **`check/swipe.js` in full: OK** (112 gestures, 321s). **`check/cascade.js`: OK** in 2,428s — its first run was
  stopped by this build's own 1,500s limit (exit 124, "target closed"), not by a finding; round 1 measured it at
  990s at a lower load. **`check/cards.js`:** the first run, at a load of 25–37, said "the app has no practical items,
  so this check saw nothing" (the payload had not arrived), exit 1; run again alone at 19–23: OK.
- **`check/ui.js`** `--screen=tools`, `--screen=saved`, `--screen=stuff`: exit 0, nothing new; the "not reachable"
  lists word for word round 1's.
- **`check/press.js`** `--screen=tools`: 4 swipes elsewhere at a load of 29–38 (a Feed press mark, two Games flick
  chains, "tap Draw" on Q-1CM-transformations-of-graphs-8 at 844x390); run again, at 19–27: OK, exit 0; a4d0ccf under
  the same load missed 1 (a Games flick chain). `--screen=stuff`: 1 ("tap Draw" at 568x320), then 2 (Games flick
  chains), and a4d0ccf, run between them, 2 (press marks on Reels and Tools). Every one is a timed tap or flick that
  arms no pad, so none reaches the pen; nothing threw and nothing was silently inert in any of the six runs. Load, and
  the same on a4d0ccf.

**Not run as one: `npm run check`**, for the same reason as round 1: its browser members take ports outside this
build's range. Every member that touches the pen, the swipe engine or the stylesheet was run above, alone.

### After review, round 3 (12 Oct)

A verification of round 2, with real touch through CDP (Chromium 1194, 4x CPU, November 2019 1H Q4 armed with a real tap
and each tool chosen with a real tap on its tile, at 390x844 and 820x1180), found one should-fix — in round 2's own fix —
and nothing else.

**The finding: round 2's 10px only moved the stray mark.** After a refused swap `padAlone_` still made the still owner — a
pin, or a palm resting on the picture — the stroke again, and its ruler line or compass radius counted once it had moved
10px. Round 1 measured a thumb's roll and a palm's settle at 6–12px; 10px is inside that, and a palm that drifts with the
hand goes further still. So a palm on a construction card that drifted 12px or more while the finger drew stored its own
ruler line or a ring round itself, and the finger's line was lost — the brief's *"accidental stray ink blobs"*. So did a
palm that slid 12px after the finger had lifted, one that crept 22px through three tries, and a pin that rolled 12px while
the other finger swung. And the palm's line or ring was **shown** as it drifted, while nothing of the finger's showed, and
vanished at the lift. d66be43's subject ("a pin that rolls or a palm that drifts marks nothing"), the comments over
`padAlone_` and `padTakes_`, §4 ("Nothing is left at the palm") and round 2's table ("Only the chosen row never leaves a mark
that was not meant") all said otherwise; each now says what is true (a commit message cannot be changed, so this note is
where d66be43's subject is corrected).

**Reproduced first, on d66be43,** with the verifier's own script (`probe2.js`, the four sections `palmdrift`, `pinroll`,
`palmafter`, `palmlong`), real touch at 390 and 820, at a load average of 38.8–45.3: **14 stray marks at each size, 28 in
all.** At 390: a pin rolling 12 and 16px stored `[[153,170,168,170]]` and `[[153,170,173,170]]` with the ruler, and a ring
round the pin with the compass (at 9px, nothing); a palm drifting 12, 16 and 24px over the finger's line stored
`[[289,289,304,289]]`, `[[289,289,309,289]]` and `[[289,289,318,289]]`, or a ring at the palm (at 0 and 9px, nothing); the
palm sliding 12px after the finger lifted stored `[[289,289,304,289]]` or a ring; the palm down through three tries,
creeping 22px, stored `[[289,289,315,289]]` or a ring, and none of the three lines. At 820 the same, a unit or two shorter.
The same in jsdom: the new cases below, laid over d66be43, fail 87 ways — 25 of them a mark stored at the pin or the palm,
the rest a preview or the aid shown for a mark that cannot be kept.

**Fixed: after the pin rule refuses a contact on the picture, which of the two is drawing is a race, and until it is won
the still one marks nothing and shows nothing.** (`padRace_`, `padPinned_`, `padShown_` in js/find.js.)

- **The refused one going 30px first** (`PAD_KEEPUP_PX`, round 1's "past any roll or settle") was the finger drawing: the
  still one is a pin or a palm and **never** marks in that stroke, however far it then drifts, slides or creeps.
- **The still one going further than the refused one has, and at least 10px, first** was a finger that was aiming when a
  palm landed and settled: its line counts, and is shown from that moment — even if the palm then slides along with the
  hand.
- **Until one of them wins, nothing of the still one is on the picture**: no ruler line, no ring, no aid
  (`padShown_` in `padLiveShow_` and `padLive_`). A preview is a promise of what the lift keeps.
- **First by the samples' own clock, decided at a frame** — `padJudge_`'s reason: under load one event carries a finger's
  last 100ms, and the other's event for the same moments can come before or after it. Each side's moment is the sample it
  crossed at; a side is beaten only once the other has reported that far, or has been silent `PAD_LAG_MS`, or lifted. The
  owner's lift (and the page going) decides from what has come.
- **Only the pin rule's refusals race** (`padPinned_`): a contact refused because it was down first, or is off the picture
  (a thumb on the card), says nothing about the owner — the owner is the later finger, and draws as before. Off the
  picture the owner still needs 10px (round 2's `g.min`, now raised with `Math.max` so a second refusal cannot lower it).
- The pen is untouched: it never refuses a later contact on the picture.

**The review's prototype, and the other answers, measured** (each a mutation of the chosen code, in jsdom, the journey's
own cases):

| after a refused swap | a pin rolling, or a palm drifting, 12–24px; a palm sliding 12 or 60px after; creeping 22px | a finger aiming, a palm settling 12px, then sliding 40px along with the line | a finger's 20px ruler tick refused, then the palm drifting 15px | a thumb on the card sliding 40px while the finger aims |
|---|---|---|---|---|
| round 2: the still one marks at 10px | the pin's or palm's own line or ring | the finger's line | the palm's `[[320,320,305,320]]` | the finger's line |
| the review's prototype: the refused one at 30px, at any time, and the still one never marks | nothing | **lost** | the palm's line | the finger's line |
| the race, but the still one wins at 10px (no "further than the other") | the pin's ruler line at a 24px roll; the palm's line or ring at a quick 24px drift | the finger's line | the palm's line | the finger's line |
| the race, counting a refusal off the picture | nothing | the finger's line | nothing | **lost** |
| **the race (chosen)** | **nothing** | **the finger's line** | **nothing** | **the finger's line** |

The prototype measured green on the review's own 40 real-touch cases; what it costs is the second column — a hand that
settles beside an aiming finger and then moves with it, which is the case the pin rule's refusal exists to keep. "Further
than the other" is what the first and third columns need: at 10px alone a quick 24px palm drift and a 24px roll of the ruler's pin win
before the finger has gone 30px, and a palm drifting 15px beats a 20px tick.

**What is left, written into §4:** a palm that drifts further than a refused finger's line, when that line is under 30px,
still marks (below 30px a tick and a settle move alike, and "whichever went further" is the rule); and a finger aiming while
a palm lands and slides 30px before the finger has gone further loses its line.

**Checked.** check-flow's review journey ("the finger pen after review"), on the 340x170 question pad with a construction
question's tiles — every case asserting the store, and the ones that must show nothing asserting that no preview and no
aid is on the picture mid-gesture:

- a pin rolling 6, 12, 16 and 24px, compass and ruler: `[]`, nothing shown;
- a palm 400ms before the finger drifting 6, 12, 16 and 24px, in its first 120ms and over the whole line, each tool, with a
  second line while it stays: `[]`, nothing shown;
- a palm sliding 12 and 60px after the finger lifted, each tool: `[]`, nothing shown;
- a palm down through three tries creeping 22px, each tool: `[]`, nothing shown;
- a finger's 20px ruler tick refused, then the palm drifting 15px: `[]`;
- *guards:* a ruler finger aiming, a palm settling 12px — and the same with the palm then sliding 40px along — the finger's
  line, shown as it is drawn; the same with the palm's moves folded 50ms at a time ahead of the finger's (the race by the
  samples' clock): the finger's line; a thumb on the card sliding 40px while the finger aims: the finger's line; a palm
  left down from one ruler line sliding 30px as the next finger lands: both lines; and round 2's guards (a palm 120ms
  before the ruler, 400ms before the pen) unchanged.

`check/pen.js` 'pin' now rolls the pin 0, 6, 12, 16 and 24px, and 'palmtool' adds the palm drifting 12, 16 and 24px over the
line, sliding 12px after the finger lifts, and the aiming finger with the palm settling and sliding 40px along; every case
where nothing can be kept also counts, on every animation frame from the second contact's landing, the frames with a
preview or the aid on them (`shownWatch`): none. Laid over d66be43: **80 findings** — every stored mark above at both sizes,
and a preview or the aid on the picture in 1–103 frames of every pin and palm case. On the fix: OK.

**Real touch, after.** The verifier's own script on the fix, the same 40 cases at 390 and 820 (load 38.8–56.4): **0 marks
and nothing left behind** (`PAD_TOUCH` empty, `padBusy_` false, no live path) — against 28 marks on d66be43, run again
beside it at the same load. Screenshots taken mid-gesture, the palm down through three tries (read): on d66be43 a gold
ring round the palm beside D, or its ruler line above CD, while the third finger draws nothing; on the fix, the picture
as it was — C, D and P and nothing else.

One thing learned on the way, kept in the check: the first 'aim' gave the finger 200ms between the palm's settle and its
first move, and under this load the frame that tells a settle apart came 100–230ms late — a frame trace showed it — so the
settle was still undecided when the finger moved, and read (round 1's rule) as a hand moving with it: nothing drawn.
Given 600ms, it was decided first in 10 runs of 10, the finger's line shown in 9–30 frames.

**Mutations, each its own copy of the fix differing in js/find.js by the change named** (the copies were made before a
comment-only edit to `padMinOf_`'s comment): every one red, the real files green after.

| mutation | red in check-flow | red in check/pen.js |
|---|---|---|
| no race — round 2's rule back | 87: every pin and palm case, stored and shown | 79 findings: the pin's and the palm's marks at both sizes (42), and a preview or the aid on the picture (37) |
| nothing hidden (`padShown_` always true) | 62: a preview and the aid on every pin and palm case | 40: a preview or the aid on every pin and palm case that keeps nothing, at both sizes; nothing stored |
| the review's prototype | the aiming finger with the palm sliding along; the folded-samples race; the 20px tick | the aiming finger, at both sizes: its line lost (at 390 never shown either) |
| a refusal off the picture counted | the thumb on the card | — |
| a refusal for being first counted | the palm left down from one ruler line: the second line lost | — |
| the still one wins at 10px | the ruler's pin rolling 24px; the palm's quick 24px drift, each tool; the 20px tick | — |
| the still one's line not shown when it wins | both aiming fingers: "not shown as it was drawn" | — |
| decided by event order, not the samples' clock | the folded-samples race | — |

The labels "a pin held on the ruler's centre" now say the ruler's **end** (a nit, in check-flow and check/pen.js).

#### The suite, round 3

Run on the files as committed, ports 19883–19888. The load average was 23–56 from other builds on four cores for most
of it, and fell to 2 near the end; every failure below was run again, alone or beside d66be43, and is said so.

- `check.js`, `check-const`, `check-css`, `check-doors` (233 handlers, 232 doors), `check-loading`, `check-scope`,
  `check-strings`, `check-drafts`, `check-widgets`, `check-library`, `check-funnel`: green (check.js, const, scope, strings
  and doors run again after the last, comment-only, edit). `check-dead` (soft) prints, byte for byte, what d66be43 prints.
- **check-flow in four parts, 82 + 83 + 83 + 83 = 331 journeys.** At a load of 30–49, four journeys outside the pen
  failed: "just a minute keeps its round…" (part 1), "a payload that timed out is asked for again at once…" (part 2),
  "the payload landing does not rebuild Find under a keypad box…" and "the timetable holds your booked sessions
  locked…" (part 4). The first three passed run alone; the timetable one failed alone at a load of 30 on the fix **and on
  d66be43** alike (its 1,100ms debounce wait). At a load of 2, parts 1, 2 and 4 ran again whole: **all green**, the
  timetable included; part 3 was green first time. The journeys that draw, run together alone: 19 of 19.
- **`check/pen.js` in full: OK in 605s** (load 23–50): 'samples' kept 1,201 of 1,201 at 390 and 820, at most 2 live
  writes a frame, 0 forced layouts. With `PEN_QUERY=pen=sizes`, 'samples': OK. 'pin' and 'palmtool' alone: OK (and 80
  findings on d66be43 with this check laid over it).
- **`check/swipe.js`:** at a load of 42–46, three runs on the fix each failed only REACH — the check not reaching its
  subject: 5, 4 and 3 of them ("wide 1280 mouse: no button… to press", "only 5 drag frames were placed", "the queue had
  emptied before the finger landed") — and d66be43, run between them, failed 2 of the same kind. Side by side at 18–26:
  **the fix OK (112 gestures)**, d66be43 1 REACH ("only 4 drag frames"). Load. overworld.js is unchanged since round 1.
- **`check/cascade.js`: OK** in 3,425s. **`check/cards.js`: OK.**
- **`check/ui.js`** `--screen=tools`, `--screen=saved`, `--screen=stuff`: exit 0, nothing new; the "not reachable" lists
  word for word round 2's.
- **`check/press.js`** `--screen=tools`: 4 misses at 37 and 6 at 33–43 (press marks, Games flick chains, "tap Draw" on
  Q-1CM-transformations-of-graphs-8 and 1F-11c, a tap on the board's padlock — a tap no armed pad sees); side by side at
  26–33 the fix and d66be43 missed 3 each, the same kinds; at a load of 2–8 the fix missed one Games flick chain, then
  d66be43 and the fix, one after the other: **both OK**. `--screen=stuff`: 8 misses at 33–46 (the same kinds); side by
  side at 8–30: **the fix and d66be43 both OK**. Nothing threw and nothing was silently inert in any run.

**Not run as one: `npm run check`**, as in rounds 1 and 2: its browser members take ports outside this build's range.
Every member that touches the pen, the swipe engine or the stylesheet was run above, alone.

---

Continued in [part 4 of 4](338-a-finger-is-the-pen-4.md).
