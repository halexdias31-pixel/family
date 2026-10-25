## 437 — each console looks like itself (2026-10-24)

**Asked for as**, in the owner's words: "for the console game, make it look like a ds for ds games. that way the
controller buttons make more sense. and any other appropriate consol for the older version of super mario bros you
had".

Until now every system was the same black box: a picture, and under it a pad of gold-on-black keys. The key list
said "X  A", "C  Y", "Q  L", but nothing on the screen looked like the console those names belong to. Now the
Console widget (games.js, style.css) draws each system's own body, in CSS alone — no pictures, no names or logos on
any casing.

### What each one is

| System | Body | Buttons |
|---|---|---|
| NES (the original Super Mario Bros) | a grey box round the picture; under it the oblong grey-and-black controller | black D-pad left, Select and Start as black pills on grey stripes, B then A red on a pale plate |
| SNES | grey box round the picture; the rounded grey controller with shoulders on its top edge | dark D-pad, Select/Start slanted, A red (right), B yellow (bottom), X blue (top), Y green (left) |
| N64 | dark box round the picture; the grey pad with three prongs, simplified | stick on the left prong, Start red in the middle, A blue, B green, yellow C buttons on the right; L, Z, R along the top |
| Game Boy | off-white portrait handheld, the glass grey-blue with the one round corner bottom right | black D-pad, B and A deep pink on a slant, Select/Start slanted grey |
| Game Boy Color | the same shape in grape, black glass, dark buttons | as the Game Boy |
| Game Boy Advance | indigo, wide round ends, L and R on its top corners | D-pad left, pale A/B right (A higher), Select/Start |
| DS | a white clamshell: two screens in black glass, the hinge right across the body between them, L and R on its top corners | pale D-pad, A (right), B (bottom), X (top), Y (left) in a diamond, Select/Start small |

The colours are each console's own tokens on `.nes-wrap[data-sys=…]` (`--nes-body`, `--nes-bezel`, `--nes-a`…), a
thing's colours defined on the thing, as the house style says; no paper colour, and the screen's gold is still what
a held button lights up in.

### The DS's hinge does not cover the game

The DS picture is one canvas, the two screens stacked with no gap, so a hinge drawn over the middle would hide the
bottom rows of the top screen and the top rows of the bottom one. melonDS has a core option for exactly this,
`melonds_screen_gap` (0–126 rows; the running core lists it, asked of it in the test). The Console starts the DS
with a gap of `NES_GAP` = 32 rows, the stage's shape is 256 by 384 + 32 (`NES_DIMS.nds`), and `#nes-hinge` is laid
over exactly those rows as fractions of the stage (top 192/416, height 32/416), so it follows the stage at any size
and in full screen. Measured: at 390x844 the black rows run from 156 to 182 of 340 and the hinge from 156.9 to 183.1;
at 1280x800 174 to 202 of 376 against 173.6 to 202.5. The pen still lands: a finger (390x844) and the mouse
(1280x800) on the bottom screen, and on its top edge just under the hinge, put the synthetic cartridge's pen down.
Where on the touch screen the pen lands is melonDS's own layout code, which knows its own gap; the synthetic
cartridge reads only "pen down", so the exact spot could not be measured here. Also seen, and as it was before
this change: in melonDS's mouse mode a press anywhere on the picture, top screen included, is the pen.

### Keys: the buttons are drawn, and light up

On a laptop the touch pad stays hidden (419), and that was where the console's buttons were. So while keys or a
controller play, the same buttons are drawn small as part of the body — `#nes-deco`, the pad's own markup from
`nesPadHtml_(sys, true)` as `<span>`s, nothing to press, `aria-hidden`. A held key lights the button it presses in
gold (`nesLight_`, from `nesSync_`, touched only when what is held changes), so "X  A" in the list is seen pressing
the drawn A. On the NES, SNES, N64 and the Game Boys they are a small controller or button row under the screen
(`--nes-deco-h`, inside the stage's bottom margin, so nothing reflows); on the DS and GBA they sit either side of
the screen, as on the real ones, the screen giving up `--nes-flank` of width for them.
On a card under 18rem (a 320px phone on keys) there is no room beside the screen: a container query
(`nes-body`) drops the picture of them there and the screen keeps its width. The strip under the screen is sized
from the stage's width (`cqw`), so it shrinks with it.

### What stayed from 419

- No reflow when a game starts: the body, pad and drawn buttons are the same before and after; a DS start moved
  nothing (stage, pad and tiles to the tenth of a pixel, both sizes).
- Touch keys at least 44px: the D-pad 112px on every system (it was 120), A/B 52–56px, the face diamond and C
  buttons 44px cells; held is a colour, never a size. Each finger is still the pad's, including
  the DS and GBA's L and R, which moved to the body's top corners but are still the pad's own buttons.
- The key list sits on a dark plate so it reads on a white DS or a grey Game Boy; its names are the drawn buttons'
  names, and the N64 pad lost the Select it never had (its key list never listed one).
- Full screen is the picture on black as before, the casing gone; in portrait the controller is still drawn under
  the picture, in landscape its outline goes and its dark parts lighten to show over black.
- `.nes-stage` gets `min-height: 0`: the 256x240 canvas inside it had held every system to the NES's shape, so a
  SNES, Game Boy or N64 picture was letterboxed inside a stage of the wrong shape.

### Checks

- `node js/check.js` green; `node js/check-all.js --fast`: all green but `check-submissions`, which fails the same
  way on the branch this started from (a date it expects on the 25th; nothing here touches it).
- The "console keys" check-flow journey now also asks, for every system: the body says which system it is; the
  drawn buttons and the touch pad are named exactly as the key list names them; no drawn button is a real button;
  the DS picture is 384 + `NES_GAP` rows and the hinge sits over the gap, the NES has none; on keys the buttons are
  drawn, a finger's touch pad replaces them; X lights the drawn A and letting go puts it out; ← lights the D-pad.
  Proved by mutation (no lighting, a gap of 0, "C↑" spelt "C^" on the N64 → five failures; restored → green).
- The whole check-flow suite, `FLOW_PART=1/8` to `8/8` one after another: all 442 journeys work.
- Playwright (Chromium at /opt/pw-browsers/chromium-1194), every system at 390x844 touch and 1280x800 keys, a
  blank canvas; full screen at 390x844, 844x390 and 1280x800; the synthetic DS cartridge from 399 run on the
  pinned melonDS from the npm tarballs for the hinge and pen. Looked at, and fixed what looked wrong: pads wrapping
  to a fourth row (the NES and Game Boy rows a few pixels too wide for a 272px card), a NES D-pad black on black
  before the controller had its own outline, L/R tabs cut off by the GBA's round corners.
- `node check/ui.js --screen=games`: the same findings as on the starting branch (a Console tile row wrapping
  4+1 at 320px, known tap targets elsewhere); a first run found the stage "overflowing" 15px at 320px — the
  hinge's wide box on every system — now only the DS's hinge reaches past its screen.
- At 320px the touch pad still wraps to a fourth row (a 112px D-pad and three 44px cells need 244px of a 218px
  card), as it did before; 390px is the narrowest phone it is drawn for.
- At 390x844 every console fits the phone's 272px card with no sideways scroll; at 1280x800 the whole console,
  tiles included, is on the screen. The DS's screens at 1280x800 are 231px wide each (they were 265 with no body
  round them): the price of the casing and the buttons beside them.
