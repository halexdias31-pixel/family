# 1211 — the served JS in bundles (12 Nov 2026)

**Owner decision, 12 Nov** (docs/decisions.md): combine the served JS so a return visit costs one or two round trips
instead of a `no-cache` re-check per file.

**How.** `tools/bundle.js` reads index.html's `FILES`, `LATER`, `LAZY` and `OFF` and joins `js/` in FILES order into
`bundle/first.js` (EAGER), `bundle/later.js` (LATER less LAZY) and `bundle/lazy.js` (LAZY); OFF is left out. Plain
concatenation with `\n;\n` between files, so the one global scope is what the separate tags made. `tools/build-stamp.js`
runs it first (never forgotten) and hashes `bundle/` with the rest; `build-stamp --check` and `tools/bundle.js --check`
(check-all) fail on a stale bundle. index.html loads `bundle/first.js?t=STAMP` (`window.FIRST`); `batchFiles_` (data.js)
fetches `bundle/later.js` / `lazy.js` as one script and falls back to the files one by one if a bundle fails.
`?dev` or `?nobundle` sets `BUNDLE = false` and loads `js/` file by file, for debugging. offline.js also stores the
three bundles. js/ stays the source: edit it, then build-stamp.

**Difference from separate tags:** a top-level throw in one file now stops the rest of its bundle (one script), and a
function declared in a later file is hoisted to the start of the bundle. check.js still reads js/ in order.

**Measured** (`tools/live-load.js --local`, signed-in student, 150 ms / 1.6 Mbit/s, CPU x4, doGet held 10 s; `LIVE_QS=?nobundle`
for the file-by-file run on the same build): return visit 104 JS requests → 3; Find usable on return 7.4 s before,
7.2–7.5 s bundled vs 7.7–9.3 s `?nobundle`; slowest early menu tap on return 0.86 s → 0.05–0.09 s. ux-health (fixture,
no throttled network): Find usable 3.8 s → 3.3 s. The return visit is still ~7 s because the service worker no longer
answers from its store (98): what is left is parsing ~2.9 MB of JS at CPU x4 and the first paint after it, not round trips.
