## Flabby Pird does not light up under a thumb

**The owner, 8 Oct: *"Flappy bird sometimes highlights when tapping. Like they tap then it
highlights. Happens on phone."*** The phone was selecting text. Nothing the app draws lit up.

### What it was not, measured before anything was changed

Three probes with real CDP touch at 390x844 (Chromium, phone emulation) each took one cause:

- **The grey tap flash.** Already gone: `*` sets `-webkit-tap-highlight-color: transparent`.
- **A style that lights the card.** No `:hover`, `:active`, `:focus`, `:focus-within` or
  `.is-pressed` rule reaches the canvas or anything above it, up to `#screen`. Forcing all of those
  states on all eight elements of the chain at once changed nothing on the screen.
  `pressMark_` finds no `[data-do]` above the canvas, nothing in the chain can take focus, and a
  MutationObserver on the whole document saw no class or style change during rapid taps, a double
  tap or a held press. CSS matching is the same in WebKit, so iOS's sticky `:hover` has nothing to
  match either.
- **The game repainting.** 178 frames of screencast: the canvas is never replaced or resized, and
  outside it the only pixels that change are the message line ("Tap to play", then blank, then
  "Game over").

### What it was

**Nothing on the card said it was not text.** `user-select` computed `auto` on the canvas, on its card
and all the way up to `html`. `.flappy`'s `touch-action: none` turns off panning and zooming and
nothing else. On iOS, a press held about half a second or two quick taps is the gesture that selects
the nearest word and paints it blue, with the magnifier and the Copy bubble. Somebody playing taps
fast, and now and then rests a thumb while the bird falls. **"Sometimes" is the half-second
hold and the double tap**, which a player does now and then rather than on every flap.

**The text is right under the finger.** The "Tap to play" line is 5.9px below the canvas, and the
Score and Best rows sit under it. In Chromium a press anywhere on the canvas resolves to the text
position just after it, which is exactly the spot a word would be selected from. A tap on the
message line or the Score row started a selection (`selectstart`) and left a caret every time.

**The keypad had been told this when it was built.** `#kp` says *"no selection and no callout, so a
held key is a held key and not a magnifier"*. The game, the other surface built to be hammered,
never got the same line.

### The fix: one rule, the game's card only

```css
.card:has(> .flappy) { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
```

- **The whole card, not the canvas.** Scoped to the canvas alone, a probe still selected the
  message line and the Score row, and those are where a thumb going fast lands as often as on the
  bird. `.card:has(> .flappy)` matches the same markup in all three places the widget is drawn:
  the Games column, `.widget-full` and the sheet.
- **The prefixes stay.** iOS Safari reads `-webkit-user-select`, and only WebKit has a callout.
- **Not `preventDefault` in the flap.** On `pointerdown` it cancels the mouse events that follow and
  not WebKit's selection. The flap stays on the finger going down (145).
- **Not `touch-action: manipulation` as on `#kp`.** The pad is fixed outside the swipe grid and had to
  refuse the double-tap zoom itself. The card sits inside `#screen`, whose `none` already refuses it,
  and a child's `touch-action` can only narrow what is allowed above it.
- **Not the whole app.** A question, an answer or a message is text somebody may want to copy.

### `node check/swipe.js --only=flappy`, rule 8e

**Chromium cannot show the blue**, because a long press on a canvas here selects nothing with the fix
or without it. So the rule asks, at 390x844 and 320x568 with real touch, the things this browser can
see:

- **two quick taps and a held press on "Tap to play" and on the Score row** start no selection and
  leave no range. This half is shared with WebKit;
- **the canvas, the card and the message line compute `user-select: none`**, which is what WebKit
  asks of the element under the finger;
- **`-webkit-touch-callout: none` is read from style.css itself.** Chromium drops a property it does
  not know from the CSSOM, so the one line only an iPhone reads is the one line no browser here could
  see go missing;
- **eight rapid taps and a held press on the canvas** reach the game (each one a `pointerdown`), focus
  nothing, and change no outline, background, border or shadow on the card or anything above it;
- **the page and the text of another Games card still select**: the fix stays on the game;
- **a flick that starts on the canvas still turns the page.**

**Proved by mutation, each red and green again with the file put back:**

| Mutant | Result |
|---|---|
| the rule removed | 11 findings: `user-select: auto` on all three, a selection on the message and the Score row, the file has no rule |
| `-webkit-touch-callout` dropped | 1 finding, from the file |
| scoped to `.flappy` only | 8 findings: the message line and the Score row still select |
| `body` added to the selector | 4 findings, GAME ONLY |
| a `:hover` shadow on the card | 4 findings: every series redrew the card |

### Left for a phone

This is reasoned from WebKit's rules, not seen: no iOS engine is available here. On an iPhone, hold
a finger on the bird for about a second, double-tap the "Tap to play" line, and tap fast through a
whole game. Nothing should go blue and no magnifier or Copy bubble should appear. On Android, in
Chrome, the probes' Chromium already selected nothing from a long press on the canvas, so there the
fix covers the text under the canvas. Hold a finger on "Tap to play" and on the Score row to see it.
