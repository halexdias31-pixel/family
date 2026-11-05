# 970 — seamless update

Owner: when a new build goes live, everyone's site should refresh to it without disrupting them — they
carry on exactly where they were (mid answer, half-filled settings, their Find chips/page/scroll).

What was already there (kept): `watchBuild_`/`checkBuild_` in js/shell.js compare the index's ETag by a
`no-store` HEAD; `BUILD_WAITING` + `buildQuietly_` (610) load a waiting build on a screen change or a
hidden page; `familyBuiltFor` stops a second reload; answers (`ans:`), drafts (`data-draft`, settings and
forms), the tab (`familyTab`) and Find's place (`find:place`: chips, query, open card) already persist.
sw.js serves index.html network-first, so a reload always gets the new build.

Added (js/resume.js, eager, just before boot.js; shell.js only changes `buildQuietly_`'s gate):
- Detection: a HEAD on window `focus` and every 4 minutes while visible; a hidden page takes it at once.
- Applying: also after 45 s untouched (tests shorten it with `window.BUILD_IDLE_MS`). The gate in
  `buildQuietly_`: nothing focused, no keypad up (`kp-up`), no touch in the last 1.5 s (not mid pen
  stroke), nothing `keepAtRisk_`, and every box changed by hand (value != defaultValue) is one the note
  carries (answer boxes, `data-draft` boxes, the notepad). Before, any typed answer blocked the update for
  good, and so did a box drawn holding a saved value (Site's digest words).
- The note: on `pagehide`, only if this page set a new `familyBuiltFor` mark (so only the update's own
  reload), `familyResume` goes to sessionStorage: tab, page, window and screen scroll, answer-box values
  incl. multi-box parts, `data-draft` values; never password/PIN boxes. `findPlaceKeep_` is flushed too.
  `resumeBack_` reads and deletes it, waits for `LOADED`, puts tab, page, empty boxes and scroll back,
  retrying ~10 s while the card draws. Any failure is a normal load.

Check: `node tools/update-health.js` (browser walk, run occasionally) serves the site with a moving
ETag, signs in on the fixture, types on the keypad in a Find question, deploys while focused, asserts no
reload while focused, then lets go and asserts the new build arrives within 20 s with tab, page, chips,
card and answer intact and the note cleared; the same for a settings `data-draft` box. Writes
data/update-health.json; tools/health.js scores each failed case as `update-continuity` (5 each, ideal pass).

Budget: js/shell.js coupling 186 -> 187, because resume.js (a new file) now reads shell's build names
(`checkBuild_`, `buildQuietly_`, `BUILD_WAITING`, `BUILD_TOUCH`); keeping it in shell.js would have
cost ~90 lines over shell's line budget instead.
