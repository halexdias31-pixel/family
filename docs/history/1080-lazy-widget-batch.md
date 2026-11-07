# 1080 — the second lazy batch: widget-only files load when their card starts

1070 left one job: secondary files evaluated at boot that nothing at boot needs. Eight LATER files are used
only by their own widget — `ink`, `board` (Whiteboard), `flyer`, `poster`, `pixel`, `spotify`, `rewrite`,
`favlinks` (~170 KB raw). They are `data/settings/tiers.json` `lazy`; `tools/tiers.js` writes them into
index.html's `window.LAZY` and their widgets into `TIER_LAZY_WIDGETS` (shell-boot.js).

**How (720's rule kept):** they stay in `FILES` and `LATER` (load order, check.js, check-tiers unchanged), but
`laterFiles_` skips them. `lazyFiles_` (data.js) waits for LATER, then fetches all eight side by side and runs
them in one task (`batchFiles_`, the same loop as LATER), then sets `lazyFiles_.in`. So a LAZY name is all-in or none,
and LATER is always complete before any LAZY file runs. `tierLazy_` wraps each of their widgets: the first
`start` shows `loading_()` in its slot, asks `lazyFiles_`, then starts it if the slot is still connected;
`draw`/`stop` are no-ops until `lazyFiles_.in`. Nothing boot or Find reads is in the batch (every outside reader
is a `typeof` guard: `boardHold_`, `boardWhoChanged_`, `spCard_`), so a failed batch cannot break Find.

check.js orders LAZY after the rest of LATER; check/later.js holds and releases only the non-LAZY LATER files.

**Measured** (`LIB_PRIVATE=absent node tools/live-load.js --local`): return visit 0.90 s → 0.83 s; cold
8.18 s → 7.88 s; files at boot 96 → 88, 1127 → 1063 KB gzip; early taps ≤ 0.06 s. Probe: each of favlinks,
whiteboard, spotify, pixel started from cold showed the wait, loaded the batch once and drew, no errors.

**Next:** `games` (327 KB) is the big one, but Find, posts and overworld read its names directly; it needs its
readers guarded or split before it can join the batch.
