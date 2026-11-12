# The philosophy — the owner's principles

One system, three parts: this file (what we want), `tools/health.js` (the Optimiser, the one checker that measures it), and
Find › Settings › Business › **Checks** (the score and the owner's questions). Ranked: a higher rule wins a clash.
Each rule names the health checks that enforce it (`node tools/health.js --list --kind <id>`); `tools/health.js`
reads the `Checks:` text, a rule naming no existing check is a finding (`philosophy`). Specific decisions, each
traced to a rule here, live in `docs/decisions.md`. Edit a rule here, never in code.

## Meta-rules (above everything)

0. **The law always wins.** Where a rule or decision clashes with the law, the law is followed, silently. Checks: `business`, `biz-checker`
0. **Contradictory owner answers → ask.** When two owner answers clash, show both to the owner as a question; never pick. Checks: `owner-questions`
0. **The Optimiser kills arbitrariness.** `tools/health.js` is the Optimiser: it goes through everything — code, layout, menus and content (library cards, topic cards, lessons) — finds whatever is arbitrary and replaces it with the objectively optimal way, one rule for all. When nothing else is asked, the aim is 90% or a better Optimiser. Checks: `variety`, `one-template`, `tpl-built`, `tpl-order`, `tpl-picture`, `tpl-tags`, `tpl-tag-look`, `tpl-title`, `tpl-tiles`, `tpl-tile-size`, `tpl-stray`, `tpl-width`, `tpl-centre`, `tpl-font`, `tpl-colour`, `tpl-radius`, `tpl-inline`, `tpl-spacing`, `tpl-same`, `tpl-variety-kind`, `tpl-variety`, `answer-width`, `font-scale`, `space-scale`, `radius-scale`, `colourlit`
   (12 Nov 2026) The score has no hand-picked weights: each measure is a rule, followed ÷ applies to, and the total is the plain average of the rules, each counted equally (docs/history/1210).
   (12 Nov 2026) Each rule counts the thing a person would fix (a function, a file, a CSS rule-block, a journey), not lines or declarations, and a walk that inspects a population is a ratio over it, not pass/fail (docs/history/1210).
0. **When nothing decides it, choose the simplest.** Fewest parts, fewest options, least code. Checks: `variety`, `ai-cost`
0. **Money disputes follow the written terms, leaning to the business.** Within the law; the owner may make goodwill exceptions by hand. Checks: `business`
0. **Build it in the site.** Every job is built and run inside the site; an outside service is used only where the law or the job truly needs one (e.g. card processing via Stripe), driven from inside the site. Checks: `one-place`
0. **Our own way.** Designed from this philosophy, not copied from famous apps. Checks: `philosophy`
0. **New features: asked for, and built from existing parts.** The owner asks for it, and it's made as a kind of card, a tool or a setting — never a new kind of screen. Checks: `variety`
0. **Ship 80%, then improve.** Ship what works now; the checker lists the rest (fits 'bold'). Checks: `structure`
0. **Check, then trust.** Actions are gated until the person is verified (approval, ID, DBS) — then they act freely. Checks: `business`
0. **Private by default.** Anything that could be seen by others is private (person, parents, admin) until shared. Checks: `in-sync`
0. **Settings for everyone, greyed where not yours.** Every account sees the same settings sections; those for other account types are greyed. Checks: `same-controls`
0. **A better rule updates everything.** Old cards, data and layouts are migrated to the new rule, never left behind. Checks: `structure`
0. **Fewer, broader rules.** Merge rules where possible; nuance lives in decisions.md. The sweeps may tidy and merge wording without changing meaning, and tell the owner. Checks: `philosophy`
0. **The health score is the north star.** Each sweep takes one coherent theme (one area done fully) and moves the score. Checks: `health`
0. **Data first, one home.** Anything that might change (wording, prices, lists, menus) is data, not code; every fact has exactly one home and everything reads from it — the checker flags copies. One truth, one place (owner, 12 Nov): never two places holding the same list, setting, file list or name; a copy a tool writes from the one source counts once. Checks: `in-sync`, `payload`, `truth-facts`, `truth-lists`, `truth-labels`
0. **Breaks are told clearly.** When something fails, the user gets one short plain message saying what failed; the rest keeps working. Undo is by asking (git), no undo button. Checks: `errors`, `resilience`
0. **Free.** No subscriptions or fixed costs; only pay-when-paid fees (Stripe's small percentage) and near-free usage (AI essay marking) are fine. Checks: `business`
0. **Built for the 100-tutor future.** Designed to hold at hundreds or thousands of users, even if overkill today; open to schools later. Practice, not full mock exams. Checks: `structure`, `speed`
0. **Never done; always optimising.** New features go in straight away, even half-working, and the sweeps improve them over time. The site is an everything-in-one-place home: learning, business and community together. Checks: `health`
0. **Built to be handed over.** Everything is documented so a new owner could run it from this philosophy alone. Roles are data: as the business grows, ranks like department heads or managers are added as rows, not code. Checks: `ai-cost`, `philosophy`
0. **Automatic, except what can't be undone.** Only irreversible actions need a human tap: deleting data, approving tutors, publishing policies. Checks: `friction`

## The principles, ranked

1. **The site is the business.** Everything the business does runs from here, in one place, fully autonomous, legal and safe. Checks: `business`, `biz-checker`, `friction`, `one-place`, `secrets`
2. **Nothing is lost.** Switched off, never deleted; every feature stays on and the sweeps stabilise it. Checks: `returned-features`, `no-age-gates`, `dead`
3. **Stability first, but bold.** Big leaps are fine; the checker catches breakage and the next sweep fixes it. Checks: `exceptions`, `resilience`, `catches`, `one-off`, `long-fn`, `big-file`, `nest`, `dead`
4. **Find is the core.** One search bar, one front door, everything browsable lives in Find. Checks: `front-door`, `returned-features`, `people-one-kind`, `manuscripts-reach`
5. **One rule, never one-offs.** One way to draw each thing, front end and backend alike, no exceptions. Checks: `find-one-off`, `raw-button`, `hand-tile`, `text-boxes`, `chip-size`, `qengine`, `variety-qpage`, `variety-maker`, `variety-drawer`, `variety-wait`, `variety-listrow`, `variety-textbox`, `once-class`, `inline-style`, `own-wait`, `dup`
6. **Fewest words, picture first.** Cards read at a glance: icons, one-word labels, tags not clutter. Checks: `card-tags`, `picture-first`, `attr-outside-tags`, `odd-tags`, `clutter`, `element-box`, `car-tags-split`, `timeline-anim`
7. **Menus follow one rule.** The next menu is always the best split; same words in menu, chip and tag. Checks: `tag-colour`, `tag-asked`, `menu-rule`, `menu-thin`, `menu-order`, `menu-sense`, `answer-words`, `words-all`, `near-dup`, `merged-value`, `merged-all`
8. **Controls stay put.** Same buttons, same places, every rank; greyed, never hidden or moved. Checks: `dup-controls`, `control-look`, `ux`, `settings-work`, `update-continuity`
9. **Fair, mechanical marking.** One card per question number, marked the same every time. Checks: `question`, `answer`, `qengine`
10. **Fast and light.** Instant on a phone, one data source, seamless updates, cheap to edit. Checks: `size`, `wait`, `in-sync`, `read-bytes`, `search-bytes`, `big-notes`, `spread`, `comment-ratio`, `update-continuity`
11. **Frictionless.** Booking, messaging, paying and homework in the fewest taps, no dead ends. Checks: `friction`, `a11y`, `console`
12. **The owner decides, the system does the rest.** Sweeps decide when the rules point one way, ask only when they don't. Checks: `philosophy`, `owner-questions`

## How we work (owner, 7 Nov)

Fast and efficient, measured in weeks, not months. Quality first: each change done properly once. Freeze whatever slows the
core (now: Find, Library, Questions, Settings, Bookings). Decide by these rules and log it; ask only on contradictions or
Never idle on CI: while GitHub runs checks, keep building the next work locally and push it when the run ends (owner, 8 Nov).
irreversible steps. Report only results and "safe to merge". Usage heavy (parallel jobs) until the owner says otherwise.
Stable = the core works on a phone with no errors and CI is green 3 runs in a row. Claude merges its own work into main once
CI is green (the Apps Script deploy stays the owner's). Frozen features return one at a time after stable, most-used first.
Unused code is deleted, not kept switched off: git history is the attic.
Priority: Questions first among the core; bugs always before anything new; perfect the papers we have before adding more.
Asking: Claude writes its guess before each question; when guesses match the owner's answers ~9/10 in an area, it stops
asking there and decides. Ask only when unsure AND a wrong guess is costly (money, law, deletion, students).
Guess tally (7 Nov): 3 right of 3 answered.

## How the loop works

Each sweep (the scheduled prompt) does, in order:

1. Reads this file always, and `docs/decisions.md` only for the area it is working on.
2. Reads the `owner_answers` tab (Google Sheets MCP; the ledger spreadsheet) — one row per answer given in Checks.
3. Applies each answer: a specific answer (a/b/c or a note) becomes the change it asks for and a dated line in
   `docs/decisions.md` naming its rule; its question in `data/settings/owner-questions.json` gets
   `status: "answered"` and the answer copied in. An answer contradicting an earlier one becomes a question showing both.
4. Turns a general answer (a philosophy question, or "always do X") into an edit of a rule above, with the checks that enforce it.
5. Works the one worklist: `node tools/health.js --list`, dearest first, budgets only going down (`--changed`).
6. Anything it cannot decide without the owner becomes a new question in
   `data/settings/owner-questions.json` (id, question, options a/b/c, status "open") — never a guess.
