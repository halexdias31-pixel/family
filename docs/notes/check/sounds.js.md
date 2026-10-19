# check/sounds.js

The full text of comments in `check/sounds.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/sounds.js THE CHIME AND THE BUZZER, IN A REAL BROWSER:

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/sounds.js

   THE CHIME AND THE BUZZER, IN A REAL BROWSER: WHAT THEY SOUND LIKE, AND THAT A REAL TAP STARTS THEM.

   *"Make it make a nice noise when they get a question right and a buzzer when wrong."* — the owner,
   11 Oct (note 340). `check-flow.js` proves WHEN a sound is asked for, with a recording AudioContext that
   keeps an iPad's rules: one per press of the right kind, none for anything that only draws a verdict,
   none with the switch off, and Mark with AI's woken at its press. jsdom has no Web Audio, so two things
   live only here:

     THE SOUNDS   both built by the app's own `markTone_` into an OfflineAudioContext and rendered: the
                  chime about 0.3s and RISING (its second note higher than its first, counted in zero
                  crossings), the buzzer about 0.4s; each one's loudest sample under the Timer's flat
                  0.08, the one sound here meant to cross a room; and each SILENT BEFORE IT STARTS AND
                  AFTER IT ENDS, with no step between two samples in its first or last 2ms bigger than a
                  twentieth of its peak — a step is a click, which the Timer's beep has at both ends.
     HOW LOUD     TO AN EAR, NOT TO A METER: the loudest 85ms of each, A-weighted (how the ear hears), and
                  again through a phone's speaker (a 700 Hz high-pass, then A-weighted) — beside the
                  Timer's beep built as games.js builds it. Each at least 6 dB under the Timer to the ear,
                  and the buzzer no more than 3 dB under the chime either way. A RULE ON LOUDEST SAMPLES
                  ALONE PASSED A BUZZER HALF AS LOUD AS THE CHIME: 110 Hz through 800 Hz has its weight
                  where an ear hears least and a phone plays nothing (review of 11 Oct, note 340).
     THE TAP      Q0664 (5/8 of 24) on Find, its Send pressed by a REAL click (Playwright's, which the
                  browser trusts as a user's): nothing made at load; the AudioContext made, and every
                  `resume()` called, INSIDE THE TAP; ONE sound per press — a buzzer for 16, a chime for
                  15; the card's sound switch pressed off by a real click, then a press, and nothing; on
                  again, the chime once; a repaint, nothing; and the context AT REST (suspended) a
                  second after a sound ends and straight after the switch goes off.
                  "INSIDE THE TAP" IS A FLAG SET BY A CAPTURE-PHASE LISTENER on the press's own events and
                  cleared by a `setTimeout(0)` — the synchronous handler and nothing after it. It was
                  `navigator.userActivation.isActive`, which Chromium keeps true for seconds after a click,
                  so a sound deferred 300ms by `setTimeout` — outside the tap on an iPad — passed here
                  (review of 11 Oct). The oscillators' starts are still asked of that window, and only of
                  that: once a context is running, a sound may start whenever the app likes.
                  HEADLESS CHROMIUM LETS A CONTEXT RUN WITHOUT A TAP (measured: one made at load by a
                  mutation came up `running`, with no warning), so the proof is the flag written down at
                  the moment, not the browser refusing. Its warning, where a build does print one, is
                  listened for as well.

   The recording is a subclass of the browser's own AudioContext installed before the app runs, so every
   sound still plays — it only writes down what was made, when, and from where.

   A RULE THAT COULD NOT REACH ITS SUBJECT FAILS, SAYING SO — no `markTone_`, no Q0664, no sound switch.

     node check/sounds.js
   SOUNDS_PORT pins the port; unset, the OS picks a free one, so parallel runs cannot collide.
================================================================================================== */
```

### ---------- THE RECORDING, BEFORE THE APP RUNS

top level, before `RECORD`

```
/* ---------- THE RECORDING, BEFORE THE APP RUNS ----------------------------------------------------------
   Every construction and every `resume()` with whether a tap was in progress, every oscillator started
   (its type, the frequency it was set to, inside a tap or not), and every node connected to the
   destination, which is one per sound. */
```

### ---------- THE TWO SOUNDS, RENDERED

top level, before `RENDER`

```
/* ---------- THE TWO SOUNDS, RENDERED --------------------------------------------------------------------
   48kHz, started 50ms in, so "silent before it starts" has samples to be silent in. The samples come back
   too, with the Timer's beep built as games.js builds it (880 Hz, a flat 0.08, 0.35s), for the ear. */
```

### ---------- HOW LOUD, TO AN EAR

top level, before `LOUD`

```
/* ---------- HOW LOUD, TO AN EAR ---------------------------------------------------------------------------
   THE LOUDEST 85ms (4096 samples at 48kHz, Hann-windowed, every 512), weighted by `wf` per frequency, in dB.
   A-weighting is the ear's: down 19 dB at 100 Hz, level at 1 kHz. A PHONE is the same through a 700 Hz
   second-order high-pass, which is about where a phone's speaker gives out; it is a model, and it is the
   difference between "quiet" and "not there" for a buzzer whose weight is low. */
```

