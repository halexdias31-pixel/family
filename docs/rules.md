# The rulebook — the one foundation

<!-- generated — edit data/settings/rules.json, then run: node tools/rules.js --write -->

**One source for every truth, one template for every thing, one rule for every case. Measure everything against these rules, keep only what is needed, and where they don't decide, ask the owner.**

Everything below derives from that core: 12 principles, each with its specific rules. Each rule is stated once, in its current form, with the checks that enforce it after `Checks:`; a check id is a `tools/health.js` rule, `js/check-<id>.js` or `check/<id>.js`, and `flow/*` is every journey in `check/flow/`. A higher principle wins a clash. The rulebook is code: `data/settings/rules.json` is the one source, `node tools/rules.js --write` writes this page from it, and `node tools/rules.js` fails when a rule names no check, a check serves no rule, a named check does not exist, or this page is stale. Superseded decisions and their dates: `docs/history/1213-one-rulebook.md`.

## 1. The law, then the owner
- **1.1** The law always wins, silently; a deletion request for personal data beats keeping things. Checks: `biz`, `one-place`, `biz-checker`
- **1.2** The owner decides; sweeps decide by these rules when they point one way, log it here, and ask only on a clash, an irreversible step or a costly wrong guess (money, law, deletion, students). Checks: `owner-questions`
- **1.3** Two owner answers that clash become one question showing both; never pick. Questions carry a slug id, words, ≥2 options and open/answered. Checks: `owner-questions`
- **1.4** Money disputes follow the written terms, leaning to the business; policies (terms, privacy, safeguarding, refunds) are drafted by the site, approved by the owner, reviewed yearly. Checks: `policy-fill`, `biz`, `money-terms`
- **1.5** Only irreversible actions need a human tap (deleting data, approving tutors, publishing policies); every delete, decline, remove or reset arms on the first press (`sure_()`), never `confirm()`. Checks: `look`, `press-twice`
- **1.6** Report only results and "safe to merge"; never idle on CI; bugs before anything new; quality first, done once. Checks: `stability`, `spread`, `how-we-work`

## 2. One source for every truth
- **2.1** Anything that might change (wording, prices, lists, menus, switches) is data, not code; every fact has one home and everything reads from it; a copy a tool writes from the source counts once. Checks: `truth-facts`, `truth-lists`, `truth-labels`, `settings`, `tabs`, `columns`, `rows`, `schema`, `library-schema`
- **2.2** Every key the site reads, `doGet` sends; one payload, one data source, in sync. Checks: `payload`, `in-sync`, `gas-load`, `later`
- **2.3** Switches are data: `tiers.json` marks core/secondary, `columns.json` the screens; a secondary part cannot break Find. Checks: `tiers`, `isolation`, `widgets`
- **2.4** Private things (learners, money, staff records, library private fields) live only in the owner's Sheets; the public repo holds no real names, emails, PINs, learner data, secrets or model ids. Checks: `secrets`, `surnames`, `library`, `library-ledger`, `claude-lines`
- **2.5** A new sheet tab is named in `TAB`, `SCHEMA` and `WHERE`; backend files are listed once (`files.json`); the backend is one scope; version stamps bump together. Checks: `manifest`, `backend`, `const`, `scope`, `strings`, `mail-load`, `marks-load`, `lib-full`, `jsdom-app`, `flow-shared`
- **2.6** Old rows are migrated to the new rule, never left behind; names are read from the people row by id. Checks: `migrate`, `people`, `post`, `handles`
- **2.7** One permissions table (`permissions.json`) for every action × role; every handler is classified and has a caller. Checks: `permissions`, `access`, `actions`, `replies`
- **2.8** Generated content (teaching animations, finder tags, bundles) is written by its script and re-run, never hand-edited; the build stamp is last after any served change. Checks: `bundle`, `cache`, `stability`, `deploy`
- **2.9** A handle is the first two and last two letters of the first name (overlapping on a short one) and the year joined, a counter on a clash (earliest joiner keeps the plain form), made by one maker (`handleStems_`) for sign-up, rename and backfill; the old one goes to `handle_was` and still signs in. Checks: `handle-follows`

## 3. One template for every thing
- **3.1** Every card, every kind, is one static centred column drawn by `findCard`: real picture if any → tags (the name is a tag) → content → one round button row; no title line, no open/closed, no 8-bit or kind icon. Checks: `one-template`, `card-shape`, `card-render`, `find-card`, `shape`, `email-card`, `share-profile`, `share`, `tutor-card`, `template-measure`, `tpl-built`, `tpl-centre`, `tpl-colour`, `tpl-font`, `tpl-inline`, `tpl-order`, `tpl-picture`, `tpl-radius`, `tpl-same`, `tpl-spacing`, `tpl-stray`, `tpl-tag-look`, `tpl-tags`, `tpl-tile-size`, `tpl-tiles`, `tpl-title`, `tpl-variety`, `tpl-variety-kind`, `tpl-width`
- **3.2** People always have a picture (their own or the steady default); a question or paper its figure; a part that names a picture has it drawn. Checks: `figures`, `diagram-png`, `diagrams`, `picture-first`
- **3.3** A thing has tiles, a form has buttons: every action is `tile_` in one `.tile-row`, round icons only, its word on hover or long press; one icon style. Checks: `makers`, `tiles`, `doors`, `variety-maker`, `variety-cardrow`, `press-hold`
- **3.4** One text box (the cream answer pill), one form maker from a field list, one wait (`loading_()`'s spinning ring), one empty state, one viewer (`fileView_`) that opens in place. Checks: `variety-textbox`, `forms`, `loading`, `variety-wait`, `bootslow`, `answer-width`, `keyboard`, `dropdowns`, `surfaces`, `surface-nesting`
- **3.5** A small fixed set of sizes and colours: three text sizes, the space and radius scales, screen and paper palettes as tokens, black and white with colour only on tags and chips, no grey sentences, normal case. Checks: `scale`, `font-scale`, `space-scale`, `radius-scale`, `colourlit`, `style-sources`, `control-look`, `chip-size`, `motion`
- **3.6** One formatter each: `money_` £12.00, `date_` DD/MM/YY, `time_` 16:00, `hours_` spans, `perHour_` /h, `dash_` for blanks, digits not words, `displayName_` first name + initial. Checks: `format`, `dates`, `strings`
- **3.7** One layout: one fluid column at every screen shape, full width, no width breakpoints, no sideways scroll, nothing opens over the app. Checks: `fluid`, `centred`, `kp-centred`, `layout`, `glass`, `element-box`
- **3.8** One reading layout for every library text (`readingCard_`), one model for every written work. Checks: `reading`, `writings`, `texts`, `pdtexts`, `bible`, `hymns`, `talmud`, `talpage`, `textbooks`
- **3.9** CSS stays one cascade: no `!important`, no property re-set by the same selector, no inline styles, classes used more than once. Checks: `important`, `order`, `inline-style`, `once-class`, `css`, `cascade`
- **3.10** The variety families each hold the ideal one (question page, card drawer, list row, settings row). Checks: `variety-qpage`, `variety-drawer`, `variety-listrow`, `variety-setrow`, `widgets`
- **3.11** One master template, as law (owner, 12 Nov: "go all the way"): a card is DATA — `{ kind, picture?, tags, body: [blocks], tiles }` — and `renderCard(spec)` in `js/cards-render.js` is the only code that writes card, tag, tile-row, picture or row markup (tiles themselves `tile_`, js/tiles.js). Body blocks are a fixed set, each with one renderer: `text` (runs: b, i, sup, sub, math, marked), `figure`, `table`, `list` (items or label–value facts), `answer` (text, choices, pad, essay; several gaps are one text box, read in order whatever separates them), `formRow` (label + one control, drafts via `draft`), `embed` (a tool's or game's own controls — the one exception). Every string in a spec is text and is escaped; a kind registers its builder with `cardKind_(kind, x => spec)` and findCard draws it. Any markup string in served js outside the renderer files fails `one-way`; what is not yet migrated is counted in `check/one-way-ratchet.json`, which only goes down and is deleted at zero. Checks: `one-way`, `card-spec`, `card-shape`, `tpl-*`

## 4. One rule for every case
- **4.1** No one-offs: no function tests a single kind, facet or id by name; front end and backend alike. Checks: `one-off`, `find-one-off`, `rules`
- **4.2** Questions show the paper's own words, one card per question number, every part its own card with one tool row (`QT_ROW`). Checks: `question`, `qcard`, `answerable`, `boxes`, `cards`, `typeset`, `tables`
- **4.3** Marking is mechanical and fair: one typed box, one marker per checker, every accept marked right against itself and typeable on the pad. Checks: `answer`, `answers`, `marking`, `marking-norm`, `qmerge`, `qtypes`, `typeable`, `types`, `qengine`, `qengine-mapped`, `saved-answers`, `submissions`
- **4.4** AI only where a rule can't mark: open writing and photographed working, clearly labelled; nowhere else. Checks: `aimark`, `aiimage`, `working`, `assistant`
- **4.5** Prices and tutor pay come from one formula each, never by hand; the @family share is one setting; a discount comes off teaching only and is shared by tutor and margin alike. Checks: `booking`, `spine`, `kid-prices`
- **4.6** The booking form is one card in a fixed dependency order of fixed rows ("—" where a row doesn't apply), fresh each time; the saved booking is the same document. Checks: `spine`, `booking-journey`, `lifecycle`, `rooms`
- **4.7** Card payments through Stripe are the only way a booking becomes Paid. Checks: `pay-return`, `booking-journey`
- **4.8** Menus follow one rule: the next menu is the best split, a menu needs ≥2 answers, each category one colour, the same words in menu, chip and tag. Checks: `funnel`, `finder`, `menu-rule`, `menu-thin`, `menu-sense`, `menu-order`, `tag-asked`, `tag-colour`, `answer-words`, `words-all`, `mangled-text`, `walk-*`
- **4.9** One value per meaning: no merged or near-duplicate facet values, one tag per attribute, no tag made of other tags or holding another facet's value (`Paper 1 · 2017`): two answers drawn the same are one answer, and what tells them apart is its own question, Doesn't matter included, none every card in the list shares. Checks: `tags`, `merged-value`, `merged-all`, `near-dup`, `odd-tags`, `card-tags`, `attr-outside-tags`, `car-tags-split`
- **4.10** Booking terms: blocks of sessions (a term) paid up front; single lessons free to cancel until 24h before; no refund for a lesson inside a paid block or for leaving midway, within consumer law (14-day cooling-off online); a tutor's cancellation refunds and tells the family automatically; seats = the smaller of tutor and place capacity (online and at home hold 4; at home takes every seat the tutor holds). Checks: `booking`, `booking-journey`, `lifecycle`
- **4.11** The school year is worked out, never typed: `schoolYear` (booking.gs) for any year, its browser copy agreeing, contiguous, Mon–Thu starts, 38–40 weeks, fitted to published London dates (history 1215); the terms tab may override. Checks: `terms`
- **4.12** One item per printed part, its id from the printed label, ids for life: a part's id is its paper's prefix plus the printed question and part (`Q-1MA1-2406-1F-7aii`), so a re-import makes the same id; an importer never merges parts the mark scheme marks separately nor splits one; an id that leaves the library is aliased in `data/settings/question-aliases.json`, and saved answers land on its part (merged boxes joined ` ; `). Checks: `question-ids`

## 5. Find is the one front door
- **5.1** One Find, chips only; everything browsable is a card in it (Settings, Booking, Messages, Tools, Games); signed out sees only Settings. Checks: `front-door`, `find-first`, `people-one-kind`, `manuscripts-reach`
- **5.2** Find shows cards only when the funnel is done (or asked); taps are looked up, not counted. Checks: `find-settle`, `chip-feel`, `firstpaint`
- **5.3** All learning content is free behind a free sign-in, with no age gates; the content is the source and tools follow from it. Checks: `no-age-gates`, `media-age`, `chemistry`, `mechanics`, `history-db`, `practicals`, `projects`, `timeline-anim`, `timelines`, `missing`, `spec-lesson`, `spec-practice`, `spec-figure`
- **5.4** Content in is our own, public domain or licensed; copyrighted papers stay private. Checks: `library`, `talmud`, `hymns`
- **5.5** No umbrella answers: a menu never offers an answer that is the union of other answers beside it (no Science or Combined Science beside Biology, Physics and Chemistry), a parent next to its own child, or one label twice. Overlap across subjects is fine: a card may sit under several subjects (History and Religious Studies share cards). Checks: `twin-path`

## 6. Fewest words, picture first
- **6.1** Icons and one-word labels, no grey clutter, information as a tag; a failure is said in words through `why_()`. Checks: `clutter`, `said`, `answers`
- **6.2** No leaderboards, points or streaks; no public stars (feedback is private to the owner). Checks: `no-games`

## 7. Controls stay put
- **7.1** Same controls in the same places for every account; ones you can't use are greyed, never hidden, moved or appearing on tap. Checks: `dup-controls`, `settings-work`, `setting-forms`, `chips-settings`, `steady`, `reach`
- **7.2** Every box a person types into survives a reload or says why; settings save as typed. Checks: `drafts`, `profile`, `prefs`
- **7.3** One press, one action; a pressed control holds itself, not its twins, and not for ever. Checks: `press`, `press-deadline`, `api-deadline`, `touch`, `touch-walk`, `swipe`, `slide`, `pen`, `ruler`

## 8. Fast and light
- **8.1** Instant on a phone: any tap answers within 1 s, the first paint is the last, no long task while someone waits, files within their size budget. Checks: `ux`, `wait`, `size`, `jank`, `load`, `arrival`, `update-continuity`
- **8.2** Always load fresh: the build stamp is the only cache-buster, no service worker fetch handler, a new build never reloads a page on screen. Checks: `cache`, `deploy`, `offline`
- **8.3** Cheap to read: small notes, few bytes per search, comments say why in ≤240 chars, no tombstones. Checks: `read-bytes`, `search-bytes`, `comment-ratio`, `big-notes`, `tombstones`, `comments`, `test-biggest`
- **8.4** The backend stays awake: one five-minute `keepWarm` trigger, booked by the admin-load setup and never twice, pings `?ping=1`, which answers before any sheet work; the page never depends on it. Checks: `keepwarm`

## 9. Safe and private
- **9.1** Private by default: a student sees only themselves and their tutors, a parent their own children, a tutor their own students and their parents, admin everyone. Checks: `visibility`, `film-shares`, `work-file`, `inbox`
- **9.2** Check, then trust: actions gated until approval, ID and DBS; staff only by application; one rank per account; three roles (admin, tutor, family). Checks: `accounts`, `staff`, `signin`, `pin-show`
- **9.3** Parents receive nothing from the site until they tick it; push is device opt-in. Checks: `prefs`, `push`, `digest`, `digest-dry`
- **9.4** No price reaches a child; no child's surname leaves the server. Checks: `kid-prices`, `surnames`
- **9.5** Posts and photos wait for approval and are kept as files. Checks: `posts`, `uploads`, `choice`, `hands`, `media`, `films`, `suggest`
- **9.6** Names on screen are first name + initial for everyone; parents' essential emails go to the admin for now, saying who they were for. Checks: `format`, `prefs`, `handles`

## 10. The site is the business
- **10.1** Everything the business does runs from here, autonomously (booking, matching, payment, reminders, receipts, tax pot, renewals), built in the site; outside services only where needed (Stripe). Checks: `one-place`, `biz`, `biz-checker`, `flow/*`
- **10.2** Free: no subscriptions or fixed costs; only pay-when-paid fees and near-free AI marking. Checks: `free`
- **10.3** Built for the 100-tutor future; roles and ranks are rows, not code. Checks: `permissions`, `accounts`
- **10.4** The core journeys finish for every role with the fewest taps and no dead ends. Checks: `friction`, `flow/*`, `a11y`, `console`, `ui`, `look`, `states`, `live`, `live-smoke`, `quiet`, `sounds`, `voice`, `calc`, `lego`, `flyer`
- **10.5** When something fails, one short plain message says what; the rest keeps working; an empty sheet still renders. Checks: `errors`, `errlog`, `resilience`, `malformed`, `catch`, `field`
- **10.6** Business admin runs itself on the site, never by email: renewals (insurance, ICO fee, DBS 12-monthly, safeguarding, tax dates) glow on the Business card; the tax pot puts aside 25% of Stripe income; each tutor gets a yearly statement. Checks: `biz`, `biz-checker`, `flow/34`

## 11. Keep only what is needed
- **11.1** When nothing decides it, choose the simplest: fewest parts, options and code; new features are asked for and built from existing parts (a card, a tool or a setting), never a new kind of screen. Checks: `dup`, `long-fn`, `big-file`, `nest`, `no-new-screen`
- **11.2** Unused code is removed: switched-off features wait in `attic/` and return as cards; dead functions go; git history is the archive. Checks: `dead`, `returned-features`, `returned`, `markers`
- **11.3** Checks are honest: no written exception lists, ratchet ceilings at zero, budgets only go down. Checks: `exceptions`, `ceilings`, `catches`, `stability`

## 12. Measure everything
- **12.1** The Optimiser (`tools/health.js`) measures every rule as followed ÷ applies to, in the unit a person would fix, and the score is their plain average, no weights; when nothing else is asked, raise it. Checks: `ux`, `effort-report`
- **12.2** Every change runs the checks it affects (`node js/check.js`, `check-all`, the journeys) and CI stays green; a merge to main happens only when `node tools/gate.js` and the required `gate` status on the pull request are green (the merge-always rule means merge when green, never red), and a changed screenshot is signed in `gallery-approved.json` after someone looked. Checks: `check`, `all`, `changed`, `conflicts`, `flow`, `flow/*`
- **12.3** This rulebook is the one foundation and it is code: `data/settings/rules.json` holds every rule, every rule names a check, every check serves a rule, each rule is stated once, and `docs/rules.md` is written from it. Checks: `rule-checked`, `check-tied`, `rule-once`

## How a sweep works
1. Read this file; read `docs/history` only for the area in hand (`grep -ril <keyword> docs/history`).
2. Read the `owner_answers` tab (the ledger spreadsheet). A specific answer becomes its change, an edit of the rule it touches here and a history note; its question in `data/settings/owner-questions.json` gets `status: "answered"`. A general answer ("always do X") becomes a rule here with the checks that enforce it. A clash becomes a question (1.3).
3. Work the one worklist, dearest first, budgets only going down: `node tools/health.js --list`, `--changed`.
4. Anything the rules don't decide becomes an open question (id, words, options a/b/c), never a guess. Write the guess first; where guesses match the owner's answers ~9 in 10, stop asking there.
5. Stable = the core (Find, Library, Questions, Settings, Bookings) works on a phone with no errors and CI is green 3 runs running; frozen features return one at a time after that, most-used first. The Apps Script deploy stays the owner's.
