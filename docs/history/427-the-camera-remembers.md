# 427 — the camera remembers

The owner: "it keeps asking me for permission each time i scroll to camera. it should remember user decision".

## Why it asked every time

The camera is a page of the feed column. `feedCamWatch_` started it when that page came to the front and
`camStop_(true)` stopped every track the moment it left; leaving the feed (`go`, shell.js) did the same. Each swipe
back was therefore a fresh `getUserMedia`. On iPhone Safari, and in a home-screen web app, every new
`getUserMedia` after the stream was stopped shows the prompt again unless the site is permanently allowed in
Settings — so every scroll to the camera was a question. Nothing on the device recorded a "no" either: `CAM_FAILED`
was forgotten on purpose the moment you swiped off the page, so a refusal was re-asked on the next swipe.

## What it does now

- **The answer is kept on the device** — `localStorage['family:cam']` is `granted` after a grant and `refused`
  after a `NotAllowedError`/`SecurityError` (`camMind_`/`camMinded_`, posts.js, each wrapped in try/catch).
- **A grant keeps the stream.** Off its page, and when the feed column leaves, the stream is *parked*
  (`camPark_`, `camStop_(keepShown, true)`): any recording is stopped first, the track's `enabled` goes false, the
  video pauses and the shutters grey (`camLive_(false)`). A disabled track switches the camera indicator off in
  Safari and Chrome. Coming back, `camStart_` wakes it (`camWake_`) with no new ask — unless a picture is being
  held, when it stays off until `Again`. Picking a picture from Photos parks rather than stops, so `Again` asks
  nothing either. A track the system ended while parked is let go and asked for afresh.
- **It is let go for real** on `pagehide`, after a minute with the page hidden (it is parked at once when hidden),
  at sign-out (`signedOut_`, me.js), and on Switch (a new facing needs a new stream).
- **A refusal is never asked again by arriving.** `camStart_` checks the kept answer and, where it exists,
  `navigator.permissions.query({ name: 'camera' })` (a second at most): `denied` is kept as a refusal; `granted`
  overrules a kept refusal and starts with no extra step. Refused, the viewfinder shows its existing "The camera did
  not start" and the existing `Try the camera again` — the only control that asks again (`camStart_(true)`, which
  clears the kept refusal first).
- `go` (shell.js) runs `camStop_` on a column change away from the feed only when leaving the feed or with a camera
  actually looking (`camOn_`), so a parked stream costs nothing on Tools to Games (check/swipe.js's RELEASE COST).

## Checks

check-flow "the camera asks for nothing until somebody swipes up to it": the stub tracks carry `enabled`, and the
journey now proves swiping down and back up, and leaving the feed and coming back, ask `getUserMedia` once in all
with the stream parked dark in between and the shutter live again on return; `pagehide` closes it; a refusal is
kept, not re-asked on a swipe, and survives a reload (a seeded `family:cam`), where only the retry asks;
permissions `denied` asks nothing until the retry; permissions `granted` overrules a kept refusal. Against the old
code the journey fails on 14 lines.
