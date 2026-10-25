# 453 — A gentler reading voice

The owner, 25 October 2026: "can you make the voice reader nicer? the robotic voice is a bit hard on the ears".

## What was wrong

`say_` (shell.js) took the first device voice whose language began `en-GB`. On many machines that is the
oldest, most robotic voice installed (eSpeak on Linux, a compact voice on iOS), while a natural one sat further
down the list. Read aloud spoke at 0.85, which with a robotic voice sounds slurred rather than calm.

## What changed

- **Ranking.** `voiceScore_` scores each voice: same language and region 100, en-US for English 70, the language
  elsewhere 40; "Natural"/"Neural" +60, "Premium"/"Enhanced" +50, Siri +45, "Google …" +35, a few known good
  Apple/Microsoft names +15; eSpeak, Fred, compact and Apple's novelty voices −200. `voicesRanked_` sorts by it,
  `voicePick_` takes the kept choice (English only) when the device still has it, else the best.
- **Late voices.** Chrome fills `getVoices()` after `voiceschanged`; until then `u.lang` alone chooses, and the
  menu on You is drawn again when the voices arrive.
- **Delivery.** Rate 0.95, pitch 1. `sayChunks_` splits a text over 180 characters into sentences (and a sentence
  still too long at a comma), one utterance each — each full stop a pause, and Chrome's ~15 s cut-off never
  comes. A short text stays one utterance: Read aloud already hands over a line at a time, and its journey
  asserts each line is said whole.
- **Maths.** `sayMaths_` turns ², ³, other superscripts, ÷ × − ± ≤ ≥ ≠ ≈ √ π ∞ ° and ½ ¼ ¾ into words, and a small
  fraction `3/4` into "three quarters" (`7/12` → "7 over 12"; a date is left alone). It runs on English after the
  question reader's own `sayLine_`, so it only catches what that missed (games, samples).
- **Choice.** A "Reading aloud" card on You, under the notification choices: one row, a native `<select>` of the
  device's voices best first, and a Hear a sample tile. Kept in `localStorage['voice:name']` (try/catch), on the
  device only, because the voices are the device's.
- On-device only: no paid or server text-to-speech.

`node js/check-voice.js` proves the ranking, the kept choice and its fallback, the maths words and the queue.
