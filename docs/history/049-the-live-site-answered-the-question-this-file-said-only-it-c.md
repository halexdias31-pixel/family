## The live site answered the question this file said only it could

**A screenshot of the real phone showed the reel playing inside GOOGLE'S OWN PLAYER** — its
scrubber, its ten-second skips, CC, 1x, an expand button and a black letterbox round the lot. That
is the `error` fallback doing exactly what it was written to do, and what it proves is the thing
this file admitted it could not test: **on a real phone the `uc?export=download` address fails.**
Every Google host is blocked from this environment by network policy, so the first address was
always a guess, and the note over `clipSrc_` said so.

**Everything the owner complained about follows from that one fact.** "Can't you make it play
automatically" — an iframe from another origin will not autoplay and cannot be muted from here, and
a muted autoplay is the only kind any browser allows. "It's so fugly" — that chrome is Google's, on
a cross-origin document, and no rule in this stylesheet can reach inside it. The card was never
drawing a video; it was drawing a rectangle with somebody else's player in it.

**`uc?export=download` is the old spelling.** Google moved direct downloads to
`drive.usercontent.google.com/download`, and the old address answers a redirect — or an HTML
interstitial, which a `<video>` reports as an error because it is not a video.

**So it is a ladder rather than a choice**, and the shape is the point: **no version of this can be
tested from here**, which is how the wrong address shipped. Each rung is a real attempt, `error`
moves to the next, and Google's player is the last rung rather than the second. One open of the live
site settles which one wins and nothing here has to be right.

**The `{ once: true }` on that listener was the bug that made a ladder impossible.** One failure
took the slide straight to the iframe, so a second address could never have had a turn however many
were listed. It counts down the list now — and calls `load()` before the next `src`, because a
`<video>` keeps its error state until it is told to start again, so the second address would have
been reported broken without being asked for. **Measured with both Drive addresses refusing**:
`usercontent` → `uc` → the player, in that order, with the sound button removed as the swap happens.

**And a full URL is used as given, which is the real answer.** `clip` takes an address, so a file
served from anywhere — including beside this site, where GitHub Pages would serve it with no
interstitial, no redirect and no player — is one rung, with no fallback and no chrome: a `<video>`
this app can mute, loop, autoplay and pause, which is what every other line of this feature was
written against.

**One thing no code here can fix, worth knowing before anybody debugs autoplay again**: iOS blocks
autoplay outright in **Low Power Mode**, whatever a page does. The phone in the screenshot was on
14%.
