# 920 — Find-logic worklist in the health score

The owner (4 Nov) asked for four more Find-logic signals in `tools/health.js`, each a located worklist kind
(`node tools/health.js --list [n] [--kind k]`), folded into the Find logic part (walk score less a capped penalty each):

- `tag-colour` (0.1 each, cap 10): `TAG_OF` colours a FIELD, so every answer of one menu wears one colour. One item per menu.
- `menu-rule` (0.05 each, cap 15): the rule should be "ask the question that splits the remaining cards best". `nextFacet`
  asks the first in the tab's sort_order that `facetWhy_` passes, so the order itself is listed, plus every walked node
  (tools/logic-health.js now records each askable facet's entropy in bits) where another askable facet splits better by > 0.1 bit.
- `tag-asked` (1 each, cap 10): a facet carried as a tag by a front-page card that no walked node ever asks.
- `find-one-off` (0.02 each, cap 10): a literal card-kind, field, facet/key or named-finder test in js/find.js or js/shell.js.
  Keyboard keys and mark-protocol/row-part kinds are left out to keep false positives low.

The walk still runs only in tools/logic-health.js (slow); health.js reads its `menuRule` and `tagAsked` lists.

`node tools/health.js --changed` is the ratchet: over files changed against origin/main plus uncommitted, it re-runs the
worklist (when find.js, shell.js or the walk changed) against the committed data/health.json `work` (matched by kind, file
and text, so moved lines are not new) and counts empty catches per changed .js/.gs file against the last commit. Green: one line; red: each new finding.

`--where WORD` prints every definition (function/const, `field:`/`id:`/`kind:` literal, `screen('…'`, key, CSS token or class)
and then every use of WORD across js/, backend/, data/settings/, style.css and index.html, in about 0.1 s.
`--fix` makes behaviour-identical edits only, then runs js/check.js: a hex literal outside a var() in a rule that equals a
:root token defined once (never re-themed) becomes var(--token), and check-catches' ceiling drops to the real count. Empty
catches are listed, not rewritten, because oops_ reports to the backend. Its first version also swapped in component-scoped
tokens and wrote var(--x, var(--x)); that was caught in the diff before commit and the rule narrowed. Today it finds nothing to do.

## UX, questions and uniform controls (UI part)

- `tools/ux-health.js` runs one headless Chromium walk and writes data/ux-health.json, which health.js only reads (like
  logic-health). The walk is 390x844 touch, CPU 4x slower, with the public fixture and verifyLogin stubbed for PIN 0000. It
  records first contentful paint, when Find's first menu can be pressed, and sign-in from the press to USER being set. It
  also records 15 clicks (front menu answers, back, open a question, Check, Lock, fold, top, tabs), each with its Event
  Timing duration, layout shift and long tasks, and the JS heap after Practice. Then, with the throttle off, it opens 30
  questions spread over every qtype and flags any that throw, have an empty body, have no answer box or Check, are missing
  a figure, or whose Check changes nothing.
  - `ux` (1 each, cap 10): a click over 100 ms or with shift over 0.05, a control that was not there to press, or a sign-in that did not finish.
  - `question` (0.5 each, cap 10): a broken question.
- `uniform` is static, in health.js, and covers app js/ except the makers (tiles.js, shell.js):
  - `raw-button`: a `<button>` that is not a key, option, chip or form control.
  - `hand-tile`: `class="tile"` written by hand.
  - `inline-style`: a static `style="…"`. A computed `${}` width is allowed.
  - `once-class`: a style.css class with one rule and one use.
  - `control-look`: a second border-radius, font-size or font-family for .tile, .chip or button.
  - `own-wait`: Loading… text, a spinner, or aria-busy set by hand.

## Round three: real phones, answers, backend, trend, sizes, menu sense, card tags

- **Real-phone telemetry**: shell.js measures one visit in ten. It records the load time, the time to Find's first
  menu answer, long tasks, the JS heap where available, OOPS.n errors, the rank and a device class (`phone-4gb-8c`).
  It never records a name or id. Visits are queued in localStorage and sent three to five at a time to the new
  `healthLog` doPost action, with `keepalive` and with every step in try/catch, so it never blocks or slows the page.
  - The rows go to the `health_log` Ledger tab, which is named in TAB, SCHEMA and WHERE, with permission `anyone`
    and the per-device-day throttle the error log uses. All four stamps went to `2026-11-04-health-920`.
  - `tools/field-health.js --sheets s.json` writes the p75 of each figure by device class into
    data/field-health.json. Without `--sheets` it writes a skip with its count.
  - **The owner must** merge, sync Apps Script, Deploy → New version, and open the site once as an admin, so that
    setup makes the tab. Until then the posts are refused with `no-tab` and nothing breaks.
- **Answer correctness**: `tools/answer-health.js` runs find.js's own `markAnswer_` in a node vm box. The box first
  proves the marker works: 5 vs 5 must be right and 7 vs 5 wrong. Then, for every verified question, the first way in
  `accept` must mark right and a nonsense answer must mark wrong. It takes about 2 s. With LIB_PRIVATE absent it
  writes a skip.
- **Backend**: `tools/backend-health.js` (about 40 s, most of it the jsdom boot):
  - times doGet cold and warm over js/check-gas-load.js's in-memory ledger;
  - posts one healthLog batch;
  - counts check-payload's keys read, keys sent and keys sent but never read;
  - checks the four stamps agree;
  - boots the app in jsdom on an empty `{}` payload, which must load and draw without throwing.
- **Trend**: each full `node tools/health.js` appends date, commit, score, parts and top kind to data/health-trend.json.
  The card draws the last thirty scores as one line and names the commit of the worst drop.
- **Size budgets**: `node tools/health.js --budgets` writes data/settings/size-budgets.json at current + 5% for each
  first-download file (index.html, style.css, the font, EAGER js) and for their total. A file over its budget is a
  `size` finding.
- **Menu sense** comes from the logic walk:
  - a menu asked with one answer;
  - two answers one letter or an `s` apart (not two that differ only in a digit, like Part 1 and Part 2);
  - an answer that keeps no card.
- **Do this next**: the dearest offender, said as one sentence at the top of the output and in the card.
- **Dead code**: stability's check-dead names, listed one per function and priced only once.
- **UX walk extras**:
  - a11y: a tap target under 44 px, an input with no label, and text under 4.5:1 contrast on Find and Feed;
  - console errors;
  - `card-tags`: per kind, up to 20 cards drawn by `stuffCard`, each checked for a tag line and for every facet value
    it has as a `data-f` tag, at the drawing function's file:line. A drawer that called `tagRow_` at 389d843 and no
    longer does is flagged.
