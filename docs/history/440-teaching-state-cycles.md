# 440 — The teaching state cycles on a tap; Add a person first; pending twins kept

## The teaching control (js/me.js `qualSlot_`, `qual-teach`)

The owner, of the three-button Teach / Can teach / Not teaching control in the own-card editor:
"Instead of this 3 options thing, can't it be something you tap and it changes. Like cycles. Like each
time you tap it it upgrades from does not teach, to can teach, to teaches."

Now one row, `.q-cyc`: "Teaching" on the left, the state on the right (gold Teaches, plain Can teach,
faint Not teaching), 44 px tall. Each tap: Not teaching → Can teach → Teaches → Not teaching
(`QUAL_CYCLE_`). The saved fields are unchanged: `qual_N_spec`/`qual_N_teach` = TRUE/TRUE, FALSE/TRUE,
FALSE/FALSE. The line's own mark is a separate button, `.q-mark-b` (data-face), laid over the line's
right end, so the summary line cycles without opening the editor (a nested button inside `.q-line`
would be invalid). A certificate shows neither. Journeys: "a qualification opens in place…" taps the
row three times round and the face once; states.js expects one control reading Can teach.

## Add a person, first (js/find.js `accountPages`)

The owner: "Add a person should appear above even my card." The `+` is now the first page of the people
column, above the admin's own card. The journey checks it at page 0.

## PNG twins of pending rows (js/check-diagram-png.js, tools/diagram_png.js)

A fresh clone was red: the 40 twins of the Foundation papers' figures (415) belong to `lib_pending` rows
whose words, drawings included, are only in the private Ledger. Rule: when any pending row has no words
here (`pendingTwins` in check/lib-full.js), a twin listed in the committed `data/diagrams-pending.json`
is not an orphan; an unlisted one still is. With the library whole, the list must equal the pending rows'
drawings. `tools/diagram_png.js` now reads the whole library, deletes nothing while any pending row is
wordless (it once deleted all 1410 — 439), and rewrites the list when it can see everything. Proved by
mutation: dropping one hash from the list, or adding an unlisted PNG, fails; green with and without
data-private.
