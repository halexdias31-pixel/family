# 463 — A natural reading voice

The owner, 26 October 2026: "make the reading aloud voice like David Attenborough, non-optional, remove all the
other voices… a calm, soothing voice… like AI voices on TikTok that sound like real voices. All these other voices
don't sound real."

## What we chose not to do

We did not imitate or clone a real person's voice. The voice is a stock Google neural voice chosen for being calm,
British and natural; it is nobody's likeness.

## What changed

- **Server voice.** A new doPost action `speak` (`ACTION_ACCESS` `self`: signed in only, counted against the token's
  person) sends one line to Google Cloud Text-to-Speech (`v1 text:synthesize`) as `en-GB-Neural2-B`, a British male
  neural voice, at speaking rate 0.92 and pitch −2, and returns base64 MP3. The key is the Script Property
  `TTS_API_KEY`, sent in the `x-goog-api-key` header, never in a URL or a file.
- **Limits.** 600 characters a call (`TTS_TEXT_MAX`); a person's characters a day from config `tts_chars_per_day`
  (blank = 20 000, 0 = the device voice only), tallied under the script lock as `TTS_CHARS`; a failed call gives its
  characters back.
- **Cache.** By SHA-256 of voice, rate, pitch and text: the script cache for six hours (in ≤ 90 000-character parts,
  under the 100 KB limit) and a Drive folder (`TTS_FOLDER_ID`, made on first use) for longer. A cached line is free.
- **Phone.** `say_` (shell.js) sends English through `speak` when signed in: one shared Audio element unlocked with a
  silent clip inside the tap (iPhone Safari), a line at a time, the next line fetched while this one plays. Replies of
  `tts-off` or `tts-cap` switch the server voice off for the visit; any failure speaks the rest in the device's best
  voice (the 453 ranking). Signed out, and other languages (Hear it), use the device voice.
- **No choice.** The voice menu and the kept `voice:name` are gone (the old key is removed on load). The Reading aloud
  card on Student settings keeps one tile, Hear a sample.

## Owner setup

1. In the Google Cloud project behind the Apps Script project, enable **Cloud Text-to-Speech API**.
2. APIs & Services → Credentials → Create credentials → API key; restrict it to the Cloud Text-to-Speech API.
3. Apps Script → Project Settings → Script Properties: add `TTS_API_KEY` with that key.
4. Deploy the backend as usual. Neural voices have a monthly free allowance (around a million characters at the time
   of writing — check current pricing); `tts_chars_per_day` bounds what one person can spend.

Until the key is set, everyone hears the device voice as before.

`node js/check-speak.js` (backend: no key, sign-in, cap, cache hit, give-back), `node js/check-voice.js` (the phone's
queue and fallback), and the journey "natural voice (463)".
