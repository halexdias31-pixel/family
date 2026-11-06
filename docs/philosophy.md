# The philosophy — the owner's principles

One system, three parts: this file (what we want), `tools/health.js` (the one checker that measures it), and
Find › Settings › Business › **Checks** (the score and the owner's questions). Ranked: a higher rule wins a clash.
Each rule names the health checks that enforce it (`node tools/health.js --list --kind <id>`); `tools/health.js`
reads the `Checks:` text, a rule naming no existing check is a finding (`philosophy`). Specific decisions, each
traced to a rule here, live in `docs/decisions.md`. Edit a rule here, never in code.

## Meta-rules (above everything)

0. **The law always wins.** Where a rule or decision clashes with the law, the law is followed, silently. Checks: `business`, `biz-checker`
0. **Contradictory owner answers → ask.** When two owner answers clash, show both to the owner as a question; never pick. Checks: `owner-questions`
0. **When nothing decides it, choose the simplest.** Fewest parts, fewest options, least code. Checks: `variety`, `ai-cost`
0. **Money disputes follow the written terms, leaning to the business.** Within the law; the owner may make goodwill exceptions by hand. Checks: `business`
0. **Build it in the site.** Every job is built and run inside the site; an outside service is used only where the law or the job truly needs one (e.g. card processing via Stripe), driven from inside the site. Checks: `one-place`
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
10. **Fast and light.** Instant on a phone, one data source, seamless updates, cheap to edit. Checks: `size`, `in-sync`, `read-bytes`, `search-bytes`, `big-notes`, `spread`, `comment-ratio`, `update-continuity`
11. **Frictionless.** Booking, messaging, paying and homework in the fewest taps, no dead ends. Checks: `friction`, `a11y`, `console`
12. **The owner decides, the system does the rest.** Sweeps decide when the rules point one way, ask only when they don't. Checks: `philosophy`, `owner-questions`

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
