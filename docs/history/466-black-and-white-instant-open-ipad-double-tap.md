# 466 — black and white, open straight away, and the iPad double tap

The owner, 26 Oct:

1. "Change the theme of the website from black and orange to black and white."
2. "With iPad when I double tap on the screen, it breaks — the widget list shifts up, very weird."
3. "I don't want any animations loading. I want to click on the app and it opens straight away so it feels lightweight. Let everything else load while the user is already navigating."

## Theme
`--gold` is now `#ffffff` (the name stays: 236 uses). Every literal gold/orange that stood for the accent
(`#screen` glow, `.check:active`, the poll bar, `.fest`, the stub, posts.js fallbacks, the map glow,
theme-color) goes through the token or turned neutral. `--warn` stays amber (a meaning, not the accent);
component skins (timer LED, racer route, chess, consoles) keep their own colours. Paper tokens untouched.

## No splash
`#splash`, its picker, the replay script, `splashSync_`/`SPLASH_CACHE_*`, the `settings/splashes` fetch
and the `.arrive` fade-in are gone. The first screen draws at boot under nothing; a column still waiting
shows `loading_()` in place. `html.is-loaded` replaces `#splash.done` as the signal checks wait on.
`splashForget_` clears the old 1.5 MB device copy (at idle, and when a child\'s answer needs the room).
`aheadPreOpen_` runs on `requestIdleCallback`. The 30 s slow-load line is `#boot-slow`, on its own.

Measured with a phone profile (1.6 Mbps, 80 ms, CPU 4x, nothing cached, backend 3 s), median of 3: see the
commit message. The feed's posts still need the payload (there is no device copy of it — a cached
payload would hold private data and go stale; not done here).

## iPad double tap
iPad Safari ignores `user-scalable=no`, so a double tap ran Safari's zoom gesture over a page whose
column is placed by transforms; the visual viewport moved and the widget list jumped up. Chromium (no
WebKit available here) honours the viewport, so it could not show the jump. Fix: `touch-action:
manipulation` on `html` and `body` (pinch kept), and a `dblclick` refused document-wide (nothing listens
for one). Journey: "a double tap neither zooms nor moves the column".
