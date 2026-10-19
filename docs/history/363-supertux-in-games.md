# 363 — SuperTux in the Games column (19 Oct 2026)

## What the owner said

"ok do super tux instead. no need to make a new game. and its open source." SuperTux beside Flabby
Pird, little setup for users, no legal worry.

## What upstream offers (checked 19 Oct 2026)

- SuperTux 0.6.3 (Dec 2021) added a WebAssembly build; the release notes pointed at a play page on a
  developer's own domain (`supertux.semphris.com/play/`). That name no longer resolves (ENOTFOUND), and
  supertux.org did not resolve from here either, so no response headers could be read.
- `.github/workflows/wasm.yml` still builds the web version on every `master` push, but uploads it to a
  URL held in a repository secret, and otherwise only as a CI artifact (expires, needs a GitHub login).
- The v0.7.0 release (latest) has no web asset: Windows, macOS, FreeBSD, Android APKs (~280 MB each)
  and source. The game data is ~280 MB, so a self-hosted web build means a data pack well over GitHub's
  100 MB per-file limit unless split, and compiling it here was not "clearly small".
- Licences: code GPL-3.0-or-later; data mostly CC-BY-SA and GPL, per file in the repo's licence notes.
  Framing or linking an unmodified build and pointing at the exact source tag meets the source offer.
- Phones: the web build had no on-screen touch controls when last seen (keyboard/gamepad); the Android
  APK has them.

## What was built

A `supertux` widget (map.js) with `tuxPaint_`/`tuxPlay_` (games.js). Nothing is fetched until Play.
- `brand('supertux_url')` empty (the default): one tile, Get SuperTux, to the v0.7.0 release page.
- Set to a web build the owner trusts or hosts: Play frames it in the card under `loading_()`, and
  Full screen opens it in a new tab.
A licence line names GPL-3.0 / CC-BY-SA and links the source at the exact tag. Journey in check-flow:
"supertux is on the Games column, loads nothing until Play…".

## Left to the owner

Whether to host a web build (an Actions run of upstream's wasm workflow, data split under 100 MB per
file) and put its address in the `brand` tab as `supertux_url`.
