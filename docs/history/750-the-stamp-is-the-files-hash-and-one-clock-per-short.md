# 750 — The deploy stamp is the files' hash; one give-up clock per Short

## 1. A return visit downloaded the app again (found in 700)

**Cause.** `LOAD` in index.html — the `?t=` on every script, the stylesheet and every `deployStamp_()` fetch —
was `floor(document.lastModified / 5 min)`. The rounding was the safety net written for a server that sends no
`Last-Modified`: then `lastModified` is *now*, and the stamp moves every five minutes. That is exactly what
check/arrival.js's server (and any header-less host) does, so a visit more than five minutes after the last one
was a cold one: every JS file and the library again. Even with the header, any deploy (a docs-only push) moved
every URL.

**Fix.** `var BUILD_STAMP` in index.html is the first 12 hex of a SHA-256 over every served file `?t=` is put on
(git-listed `js/` minus the checks, `style.css`, `fonts/`, `data/`, `tools/epaper-verse/`), written by
`node tools/build-stamp.js`. `LOAD = BUILD_STAMP`, so it moves when a served file changes and at no other time.

**The freshness guarantee kept** (the reason LOAD left a hand-bumped version, notes on index.html: "a step that
must be remembered is a step that will be forgotten", 20 August, eleven hours): the step is not remembered, it is
enforced — `tools/build-stamp.js --check` is in check-all (and so in `--fast` and the session-start run) and is
red whenever a served file differs from the stamp. `?dev` still dates everything by the clock. If the line is
ever emptied, the old rounded build time comes back as the fallback.

**610 still works.** The quiet self-update reads index.html's `ETag`/`Last-Modified` by HEAD (`buildTag_`,
`bootStale_`, shell.js); a deploy that changes a file changes the stamp inside index.html, so index.html changes
and its headers move. `LOAD_AT` (the footer, `bootStale_`) is untouched.

**Measured** (check/arrival.js, phone, its server's bytes per visit; the "before" run puts the clock in the stamp,
which is what a visit more than five minutes later met): see the figures below. arrival.js now fails if a warm
visit asks for any code file at all.

| phone visit | before (clock in the stamp) | after (BUILD_STAMP) |
|---|---|---|
| cold | 17916 KB, 63 code files | 17916 KB, 63 code files |
| warm | 17800 KB, 63 code files (FAIL) | 15659 KB, 0 code files |

## 2. "a YouTube Short that never answers…" failed about one run in three

**Cause, in the app.** A Short's give-up clock lives in `YT_BOX`, a WeakMap keyed on the slide. When the Reels
column is redrawn (the payload landing, `load`), the old slide is thrown away without `reelYtDrop_`, so its clock
was never cleared; the new slide on the same page winds its own. Two clocks for one Short — the journey's
"2 give-up clocks, not one" — whenever the redraw fell after the first `reelsWatch_` (timing-dependent, hence one
in three). The orphan fired harmlessly on a detached frame, but it was a real leaked timer. The jsdom canvas
`getContext` message is jsdom's noise, unrelated.

**Fix.** `YT_WOUND` (posts.js) holds every slide with a clock running; `ytSweep_` stops the clocks of any slide no
longer in the document, before a clock is wound and on every `reelTurn_`. The journey is unchanged.

**Proved** by FLOW_RE on that journey ten times: 10 of 10 green (`FLOW_RE='YouTube Short that never answers' node js/check-flow.js`), and FLOW_PART 1..8/8 all green.
