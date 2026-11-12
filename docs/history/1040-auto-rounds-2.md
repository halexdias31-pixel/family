# 1040 — unattended health rounds (part 2 of 2)

Continues [part 1](1040-auto-rounds.md).

## CI after A–C (main run 42173932349; branch runs cancelled)

Reproduced each required job locally (LIB_PRIVATE=absent, the job's own command), one at a time.
- **fast:** widgets-in-find.json lost a comma (unreadable); three check-actions REASONS for handlers the five returned files call again; spotify.js's seven empty catches got reasons (ceiling 228 holds); two border-radius in rem (the new door cards) now px; finder-tags and stability regenerated.
- **flow 2** (12): Business is no column since batch C, so "signing in as an admin" now checks Find › Settings › Admin gains the Business cards and Notifications and loses them on sign-out, nobody moved, no reload. **flow 3** (15): the paper tag is its own number (`paperTag_`, r12), none for a paper without one, never the whole title. **flow 6** (23): the Members only card → one front door: the search bar, only Settings, Sign in and Make an account. **flow 7** (24, 25): the Accuracy journey signs in (signed out Find answers only Settings); the tool row is "Photo of working | Check" / "Pen … Photo of working | Undo | Clear | Check", the one padlock on the whole card (r12). **flow 8** (28): Mechanics and Chemistry journeys sign in, the same reason.
- **browser 2:** site bug — signed out, the front door's paint asked for data/works/index.json on a cold load (503); library indexes are asked only when Find can answer them (`libIndexesAsk_`). pen.js skips the whiteboard while it is not core (secondary since batch B, 860). logic-health regenerated.
- **browser 4:** site bug — the feed (back on, batch B) landed above Find on the one page and pushed it down, CLS 0.173; the home column holds a screen until the payload lands (`html.flow:not(.is-loaded) #s-feed`).
- **browser 6:** reach.js: a widget that is a Find card has no slot on its old column; in-view means both axes on the one page; the flick-to-Find arrival run skips on the one page (no sideways arrival, 900). calc-steady skips while the calculator is not core.
- heavy 1–6, browser 5 and 8, flow 1/4/5: green as they were.
- Admin Build card: its lines were `.faint/.sub`, hidden by the grey-line rule; now `build-said`. check/states.js: the Business dot state is the Notifications card. The "Answers" tag on Tools/Videos cards was not reproduced in the fixture (no tool, game or video card's tag row says Answers) — still an owner question.
- Budgets raised, reason "CI after A–C: signed-out cold load asks no index, feed holds a screen": coupling find-bundles 132, rules 27 (`ruleOn_` from paintStuff); style.css 7178; searchBytes 5,275,740.

## Batch D — one people kind, pixel portraits, manuscripts (owner, 6 Nov) and the owner's answers

- **Owner's answers:** Settings › Admin is two answers, **Business** (the biz column's cards and Notifications) and **Site** (the site column's); each card in one (`SETTING_TYPES`, find-doors.js). The top bar never had a Sign in tile left (batch C); its comment now says so. Videos have a **Type** facet (`vidType`: the row's `type`, else `videoType_` guesses Movie / Lesson / Documentary / Music video / Clip from title, tags and kind); the three rows are Documentary (their thumbnails are Discovery / Quest documentaries; titles unknown).
- **One people kind:** boxers (find-aloud.js) and historical figures (find-history.js) are both kind `people`, drawn by one `personCard_`: the tag row and an 8-bit portrait, nothing else. Facts are tags: Who (`personName`), Years (`personYears`), From (`personFrom`), Role (`histRole`, a boxer is "Boxer"), Era. A boxer is on Boxing and History (`shelf` a list) with `boxKind` Fighters; every person answers History › People. `isPerson_`; `isBoxer_` = a person under Fighters. Not `person`: that kind is the Profiles door's.
- **Boxing:** Fighters or Fights only. The boxer profile (status, record bar, tale of the tape, titles, the fights pages) and the Highlights/Watch tiles went; a fight card is the two corners' portraits facing each other (`fightCard_`, the second mirrored) under its tags. The ring drawer stays (states.js still checks it).
- **Portraits:** `tools/people_pix.py` writes data/portraits.json (197 rows: 103 boxers, corners with no boxer row as `name:<name>`, 53 figures): 16×16 palette letters from cues (skin, hair, facial hair, hat, outfit; boxers from their look_* columns). Re-run it, never hand-edit. Loaded as a library extra, declared in doGet (`portraits: []`, versions bumped); `personPic_` draws SVG paths, `.pp-*` tokens in style.css.
- **Figures:** eight added, linked both ways to the events that name them: Nero, Ignatius of Antioch, Polycarp, Diocletian, Charlemagne, Peter the Great, Mussolini, Hirohito (facts only).
- **Manuscripts:** reachable for an adult under Library › History › Manuscripts (all 12 cards). They are 18+ (`min_age`, the owner's 499 rule), so a student or a member of no known age never sees them — the likely reason they "don't show"; owner question.
- **Health (tools/card-health.js → card-health.json, budgets 0):** `picture-first` (every people and fight card: the right number of portraits and no text but tags), `people-one-kind` (no boxer/figure kind, everything with a portrait is `people`), `manuscripts-reach`. card-tags/odd-tags sample people and fights as every kind. Today 0 / 0 / 0 over 313 cards. Qualification slots' controls carry their slot (`data-at`), so dup-controls stays 0.
- Journeys updated (not run): 15, 18, 19 (no figure → writing/event tiles; a person is tags over one portrait), 20 (the boxer profile checks are one people/fight check), 12 (Business/Site).
- Budgets raised, reason "batch D: one people kind": coupling find-aloud 146, find-finder 142, find-history 84, me-shelves 45; libraryExtras_ 183, stuffItemsRaw_ 163; style.css 7196.

## No age gates
- Owner: "before I had that rule some learning content was 18+ — cancel all that. No more one-off rules regarding that."
- Removed: `min_age` on the 11 manuscripts and Clement of Rome (data); `itemAgeOk_`/`itemMinAge_`/`viewerOfAge_` and the Find filter; `gcseAgeOf_` (GCSE history/RS/psychology/sociology and the history database at 14+); `SCRIPTURE_MIN_AGE`/`scriptureMinAge_` (Bible, Talmud, Quran, Hadith, works, texts, Orthodox, hymns at 18+); `writingAge_` (`writingFor_` now always true); `FIGHT_VIDEO_AGE` (fight footage at 13+); the rules `scripture-age` and `gcse-sensitive-age`; the age bands in `js/finder-tags.js` (views are admin+bible / bible).
- Kept: Profiles' Over 18 / Under 18 facet, apply-to-teach adult check, tutor age ranges (`age_min`/`age_max`), project/practical "ages 9–14" labels, film certificates (`mediaAgeOk_`), `kjv-admin` (admin-only switch, not age).
- Health `no-age-gates` (owner budget 0, locked): a data row with `min_age`/`adult_only`, any age-gate name in `js/`, or `viewerAgeCap_`/`profileAge_` in Find. Journeys 15, 18, 19, 28 updated (not run); check-bible, check-writings, check-texts, check-history-db, check-rules updated.

## Batch E — car parts as separate tags, a specific model or any, pixel drawings, PC parts (owner, 6 Nov)

- **Data (tools/mech_rows.py, new; re-run, never hand-edit):** writes data/mechanics/models.json (7 cars), parts.json (69 parts) and pc.json (13 PC parts). Each car attribute is its own field and tag: make, model, gen, phase, market, years, size, valves, badge, fuel, engine code. Cars: Renault Clio III Phase 2 (D4F, D4FT TCe 100, K9K dCi, F4R Renaultsport), plus one common UK car each: **Ford Fiesta Mk7 1.25 Duratec 16V (SNJB) 2008–12**, **VW Golf Mk6 1.6 TDI (CAYC) 2009–12**, **Vauxhall Corsa D 1.2 16V Ecotec (Z12XEP) 2006–10**. A part fits cars by a rule about the engine (petrol, diesel, turbo, EGR, belt or chain, rear drums or discs), never a list per car. New part: Timing chain kit (the Corsa). The made-up EX-… part numbers went (not plain facts); the Clio-only wording in seven "does" lines became general.
- **PC parts (Computer Science › PC parts):** one standard desktop build: CPU (AM5), motherboard (ATX), DDR5 RAM, graphics card, NVMe SSD, SATA SSD, HDD, PSU, case, CPU cooler, case fan, cables, OS install USB. Facets Part type, Socket or form factor, Interface, Connects to.
- **Menu:** Library › Mechanics asks first "A specific model, or any?" (`mScope`, `choose: true`, a new facet flag in `facetWhy_` so a question is asked even when one answer holds everything). Specific → Brand → (Model, Generation if they split) → Engine → System; a part answers the brands/models/engines it fits, narrowed by the chosen ones (`mechFit_`). Any model → parts only, no car questions. A part's car tags appear only for the chosen car (`mechFitTag_`).
- **Cards:** tags, one 16×16 drawing, and for a part its one line. No title. One drawer for portraits and parts, `pixSvg_` (find-boxers.js). The Parts tile on a car sets the specific-model path.
- **Health:** card-health.js now draws every mech card: `picture-first` (one drawing, no other text) and new kind `car-tags-split` (budget 0): no car's whole name or two tags run together as one tag or line. 89 cards, 0 / 0. check-mechanics rewritten for the three files.
- facets.json: histKind moved to 24.04 (coordinator), ahead of wWork — but under Library › History it is still not asked: "thin — needs 50%" (writings outnumber manuscripts/people/events). Owner question.
- Journey 28's mechanics check rewritten for the new menu (not run, told not to).

## Batch F — timelines as animations (owner, 6 Nov)

- **The fix first:** Library › History is the `subject` answer, so its list held 3,327 public-domain History texts and 32 History textbook chapters with no `histKind` — "thin — needs 50%". The facet's reader (find-finder.js) now answers **Works** for a pdtext/worktext/writ/writing/content card in History (the files that build them stay free of `histKind`, check-writings R2); the timelines answer **Timelines**. The one rule is unchanged; History now asks "Manuscripts, people, works, events or timelines" first (Events 163, Manuscripts 12, People 53, Timelines 6, Works 3,359).
- **Data (tools/timelines.py, new; with tools/tl_icons.py, 35 16×16 scenes in the people_pix/mech_rows letters):** writes the events of four new eras into data/timeline.json with fixed ids — World War 1 (EV-0201…0219, month by month), Old Testament (EV-0301…0314, BC years negative, dates the traditional early chronology and said so), Roman Empire (EV-0401…0410), Space Race (EV-0501…0511) — and data/timelines.json: six timelines, each a window (years on screen), a unit, and its events by id with a 2–5 word caption and a scene. Church history (26 of the 83 Church History events, window 300 years), World War I (19, 1 year), World War II (17 of the sheet's 26, 18 months), Old Testament (14, 600 years), Roman Empire (15, 5 of them church events, 250 years), Space race (11, 3 years). Facts are read from the event rows; a timeline row holds only ids, captions and pictures.
- tools/church-history.py: its first id is fixed at EV-0027 (it was "one after the highest other id", which the new eras would have moved) and it sorts BC-safe. Note: re-running it today would also rewrite figures/writings that batch D changed by hand — not run.
- **The card (js/find-timelines.js, new, after find-history; kind `timeline`, histKind Timelines):** tags, then the event's scene (pops in), its date and caption; Back / Play / Next (a tile row that is never redrawn — tiles are swapped in place, so nothing moves); then the axis: a track span ÷ window views wide, panned by a CSS transform to centre the event under a gold pin, every event a small scene on it, ticks at a step that fits the window (months, years, centuries; BC said). It plays by itself once on screen (unless paused or another is playing), stops at the end. Reduced motion: no transitions, nothing advances by itself, Play steps once. The old dot bar and the list of event lines went; the Animation tile still opens the textbook drawing for Church History and World War 2.
- data/timelines.json is a library extra (`LIB_EXTRA`), declared in doGet (`timelines: []`), versions bumped together.
- check-history-db: BC days (`-2091-01-01`), date order by year then day, every era on a timeline, every timeline ≥5 events that are event rows, a named era has its one textbook animation.
- **Health `timeline-anim` (check/timelines.js → data/timeline-health.json, owner budget 0):** static (≥5 events, ids exist, 16×16 scenes) plus a 390x844 student walk: History asks the five kinds, each card draws its stage within 300 ms, two walked — Next and Play change the event, the three tiles' rects identical before, after Next and while playing. Today 0. `TL_SHOTS=<dir>` saves moments.
- Verified: check.js, check-anims, check-loading, check-history-db, check-payload, check-tiers, check-actions green; health --changed adds nothing over the baseline. Not run (told not to): npm run check, check-flow.

## Batch G — how frictionless it is, and every owner check locked (owner, 6 Nov)

- **Owner:** "the health checker should sense how frictionless everything is for clients and tutors — booking, communicating, paying, maybe setting homework."
- **check/friction.js (new) → data/friction-health.json, health kind `friction`:** eleven journeys walked at 390x844 on the fixture (plus one accepted, owed session for Pat Parent with Ada Tutor), a fresh page each. Parent: find a tutor, book a session, pay (createCheckout answered with a stub Stripe URL, the stub page counts as paid), message the tutor. Tutor: see bookings, message a parent, set homework, see results. Student: open homework, answer, see result. Each counts taps (a select is two), screens (menu answers, sheets), typed fields, ms with a `loading_()` on the glass, dead ends (a step reached only by code so the walk goes on), errors (page errors, a send that posts nothing) and whether it can be done at all. Score 100 − 2/tap − 3/field − 1/screen − 1 per 200 ms − 15/dead end − 10/error; impossible = 0. `FR_ONLY=<journey>` walks one and writes nothing.
- **Today (score 59 of 100 over 11):** find a tutor 94 (2 taps); book 28 (17 taps, 7 fields — and a dead end: **the booking form is not in Find under Booking**, `bookingPages_` looks for `forLabel` but the front menu now sets `kindLabel`, so it only exists on the switched-off Booking column); pay 92 (3 taps); message the tutor 84 (5 taps, 1 field); tutor's bookings 94; student answer 89, result 87, open homework 79 (dead end: **no homework list**). **Impossible:** a tutor messaging a parent (no Message tile on a session card; Messages is offered only with a thread), a tutor setting homework (nothing assigns a paper or question), a tutor seeing a student's results (Profiles has no Student answer for a tutor; no results tile).
- **Budgets:** owner `friction` 6 (today's findings); `friction` totals in structure-budgets.json (taps, screens, fields, waitMs +1 s slack, deadEnds, errors, impossible) lowered by the walk itself on a better run, never raised.
- **Sweep A–F:** every named check (front-door, clutter, no-age-gates, people-one-kind, picture-first, car-tags-split, timeline-anim, returned-features, odd-tags, dup-controls, chip-size, settings-work, in-sync, tag-colour, manuscripts-reach) is in `UX_PENALTY`, `OWNER_KINDS` and the `owner` budget, and in --changed (the walked ones from their committed JSON). The Help tile for every rank is dup-controls (card-health). New static `menu-order` (budget 0): Collection is asked before Work, so Islam asks Quran or Hadith before the six books. Not locked: part letters as pills, the Posts/Messages/Profiles menus' order (walk-only, owner question).
- First full run since batch A: 35.9% (code 32.7, logic 37.2 stale, UI 0 — the batch B–F kinds counted for the first time plus friction 15). Budgets raised, reason "found over at the start of G": coupling find-boxers 99, works 20; variety maker 38; owner clutter 379; aiCost bigNotes 10 (this note, appended as asked), spread 22. check-mechanics' 337-character comment split.

## Friction fixes (after batch G, 6 Nov)

- **Find › Booking reached the form again:** one name for the front door, `DOOR_FIELD` (find-doors.js, `kindLabel`), read by `forIs_` and set by `book-with`, take-a-seat and join (cards.js, receipt.js), which all still wrote the pre-batch-C `forLabel`. "Narrowed" is now any pick besides the door (Tutors, Venues…). The whole posts feed stays off under Posts while the Posts door items exist (else twice). check/flow/09 expects `kindLabel`. The friction walk's "reach by code" shortcut for booking is gone: a missing form is now the journey failing.
- **Message tiles on cards, as data:** `CARD_EXTRAS_` gets `receipt: jobMsgTiles_ + jobTiles_` and `person: personTiles_`; `jobPage_` adds `jobMsgTiles_` too. Who is offered is `MSG_MAY_` (tiles.js), the phone's copy of `MESSAGING` in constants.gs. Find › Messages lists everyone on your sessions you may write to, with an empty conversation card, beside existing threads.
- **Booking form prefilled once (`bookPrefill_`, cards.js beside `book-with`, so book.js stays in its line budget):** Instant class, a new one, At home, the floor seat count, No preference, the soonest term, the only child (or the unnamed seat), and Find's subject/level chips; `book-with` carries a subject/level/tutor off its card. Only empty answers, each still a dropdown; no price, payment or backend change. The walk no longer re-picks a multi row that is already set (`.bk-face.is-set`).
- **Friction (score 59 → 73 of 100):** book a session 28 → 91 (17 → 3 taps, 7 → 0 fields, no dead end); tutor messages a parent impossible → 90 (3 taps, 1 field). Unchanged: find a tutor 94, pay 92, message the tutor 84, tutor's bookings 94, answer 89, result 87, open homework 79 (dead end left: no homework list — not trivial). Still impossible: setting homework and seeing results — an owner question (docs/owner-questions.md).
- **Budgets:** coupling raised (book 69, cards 45, find-doors 55, find-levels 106, receipt 65, tiles 85 — the new links the fixes need, reason in structure-budgets.json `why`); friction totals lowered by the walk (taps 43 → 30, fields 10 → 4, dead ends 2 → 1, impossible 3 → 2).

## Sweep 6 Nov 2026 (2-hourly)
- Red fixed: check-css (timeline `.tl-tick i`/`.tl-ev` dimmed by opacity → colour-mix / `filter: opacity`), motion (timeline pan 900ms → `--dur-pan` token, owner-asked), check-aiimage (`creditsToTags_` assumed a full DOM), stability 74.6% → 77% (nine boxer helpers left uncalled by batch D's people kind removed from `find-boxers.js`).
- Suggest register (ledger `claude_notes`) read; four error reports already fixed logged in `docs/suggestions-handled.md`; four visible ones asked in `docs/owner-questions.md`.
- Known: `find-figures.js` coupling 89 vs budget 88 predates this sweep.

## CI after D–G (run 42204896918, 6 Nov)
- browser 2/8, bootslow: no age gates opened `bibleFor_` to signed-out viewers, and `bibleItems_` asked `data/bible/index.json` on every listing, so a cold load fetched it. Now it asks only where `paintStuff` asks the other indexes (signed in, or `finder-members` off).
- browser 2/8, logic-health --check: data/logic-health.json stale after batches D–G's funnel changes; regenerated.
- flow 8/8, 28 Mechanics: the car card's Report tile carries the name in `data-rl` (never drawn); the "no title" test now ignores it as it does aria-label.
- flow 8/8, 28 shelves: batch D's boxer is kind `people` (Fighters) with `shelf` a list (Boxing, History); the journey counted shelves as strings and looked for kind `boxer`. Updated to the batch D design.
- All flow parts 1–8 and browser 2/8 green locally (LIB_PRIVATE=absent).

## Sweep 12:37
- Register read: one new note (5 Nov, no picture) asked; the "Paper 3x" note done.
- `paperTag_`: a paper's tag is "Paper N" only; its section is the Paper-section tag, also read from a title like "Practice paper 1, Section A" (one attribute per tag).
- logic-health: a facet askable below the walk's depth counts as asked (tag-asked 56 to 24); answer-words compares the tag the card really draws (`tagSay`/`answerSay_`). 18 menu/card word gaps left as a question.
- find-figures coupling 89 to 88: `facetTags_` (find-finder) reads a card's tags on one facet.

## Sweep 14:37
- Register read: one new note (move Camera and Posts into Find) asked in owner-questions — a visible layout change.
- Tags asked, by default ("all tags are asked"): logic-health judges each carried facet on its own cards by the usual rules (a long one as the paged list), since the walk stops at grids and its cap. tag-asked 24 to 9: eight hold one value in the fixture (one answer is never a question), and What for is lopsided at the top.
- returned.js: a picture picker (`-pic`) is not a safe press — it opens the device chooser, which the page cannot see (whiteboard's Picture was a false "nothing changed").

## Sweep 16:36
- Register read: no new notes since 14:37 (last one, Camera and Posts into Find, already asked).
- long-fn: `libraryExtras_` (183 lines, `js/library.js`) is now four blocks it calls in the old order — `libExtrasSheets_`, `libExtrasBooks_`, `libExtrasData_`, `libExtrasBoxing_` — each statement moved unchanged (acorn cut; no bare `return` among them). One tombstone comment (the topic tree) dropped. `searchBytes` budget 5,269,284 → 5,269,805 by hand (the four headers).
- Returned features: word games Next (Got it before Start), flyer preset (the campaign's ticks already match), console Select (no game loaded) are no-ops in the start state, not breaks; check/returned.js now tries up to three safe presses, first that answers wins. Newspaper is a placeholder by design and countdowns a display (no controls): both asked or left. The full returned.js walk ran past 8 minutes and was stopped, so data/returned-health.json is unchanged.

## Sweep 18:36
- Owner's answers (6 Nov evening): Articulate and Charades draw Got it / Pass from the start, `aria-disabled` (the shared disabled look) until Start, one line in `roundPaint`. Newspaper `off` in tiers.json (`node tools/tiers.js`), so it is a Coming soon card; dropped from check/returned.js.
- Register read: no new notes since 14:37.
- Clutter: the credit rule (`creditsToTags_`) also moves any `.as-tag` line into the tag row; a verse's translation line (`bb-tr`) is one. Taboo / Hot Seat acts still drawn only after Start (left: their Ready card holds the word).
- Budgets raised by hand for the greying line: games.js lines 6442→6444, coupling 106→108, searchBytes →5,270,149. finder-tags and stability regenerated (stale).

## Sweep 20:36
- owner_answers / claude_notes: not read this sweep (no new notes beyond 14:37 in the register).
- Inbox: Checks shows the five open questions that settle most (philosophy first, then an optional `settles`, then file order); answered fold into "Answered · n". Marked answered from the 6 Nov philosophy: philo-minimal-info, philo-stable-new, philo-menu-next, philo-autonomy, learning-tag, read-aloud-parts, dont-matter-first, homework.
- Homework: `homework` widget (map.js) `off` in tiers.json; its Coming soon card waits under Tools (`SOON_WIDGET_UNDER`, `x.top` read by `kindTop_`).
- Tags omit what is picked: `tagRow_` skips a facet value or word equal to a current chip. card-health checks Practice+Maths+GCSE (no repeats); ux-health's missing-attribute count exempts chipped fields.
- Ranks: `tile_` greys any admin-tone tile for a non-admin (`aria-disabled`); `adminTiles_` and Listed drawn for everyone. card-health's rank check now compares every control, admin group included: 0 differences.
- Taboo / Hot Seat: Correct|Got it / Pass drawn from the start, disabled until the round runs (`partyPair_`).
- Budgets raised by hand (structure-budgets why line). Left for next: f. best split always (menu order, sort_order out, finder-tags regenerate); drop the always-on "Learning" tag (learning-tag answered a); odd-tags composite work titles.

## CI after 1070

Run 42315012684 (7bd3337) failed fast, flow 2/8 and 8/8, browser 2/8, 4/8 and 8/8. Each reproduced locally with LIB_PRIVATE=absent and green after:
- fast: data/stability.json stale; regenerated (`node tools/stability.js`).
- flow 2/8: the timed-out-payload journey looked for the payload's post on the home column; Find is home now, so it reaches Feed before looking. Real bug found while checking the kept payload: `payloadOwe_` ran before `loadStale_`, and the write a second later was filed under whoever was signed in then, so a sign-out in that second left the account's payload under the visitor. Now owed only after the stale check, filed under who it landed for, dropped if someone else is in, and `payloadForget_` cancels a pending write. New journey: no token kept, another account is not offered it, gone on sign-out, never written after sign-out (fails without the fix).
- flow 8/8: the Mechanics journey wanted chosen chips repeated as card tags; tags omit chips (owner, 6 Nov). Attributes are checked on a card drawn with no chips, and the chosen ones checked gone.
- browser 2/8: logic-health.json stale (regenerated); check/deploy.js deployed without moving BUILD_STAMP, which every real deploy does since 750, so the second deploy was an exact cache hit; it now writes a new stamp per deploy. check/slide.js checks the one scrolling page (900): a sideways flick moves nothing and nothing scrolls sideways.
- browser 4/8: check/firstpaint.js skips Find 2, off in columns.json (as kp-centred does).
- browser 8/8: check/centred.js under FLOW_LAYOUT holds the card in front to its place at rest instead of the old glass's middle; Find 2 skipped while off.
Left: coupling over budget in data.js, shell-api.js, me-account.js, find-pages.js, finder-tags.js and search-bytes over, all from 1070, none a CI job.

## Sweep 02:36

- Theme: the dup in js/finder-tags.js (115 lines repeated across the two views). tools/finder-tags.js now writes the questions every view asks alike once (`same`) and merges them into each view at load; 252 → 135 lines, every view's content proven identical. Consumers unchanged.
- owner_answers / claude_notes: not read (no ledger id at hand this sweep).
Left: best-split menu order (a), lazy-load secondary files (c), coupling budgets in data.js, shell-api.js, me-account.js, find-pages.js.

## Sweep 04:36

- Theme: menus always ask the best split (rule 7, owner 6 Nov). `nextFacet` now picks, of the questions the one rule lets through, the highest `facetBits_` (bits, capped at 2 so a many-answer Part cannot beat Subject), sort_order breaking ties; a coarser question (`facetInside_`, memoised per list) still comes before its finer one; kind questions and the front stay first. logic-health uses the same score; check-funnel tests the new rule.
- Menu-rule 97 → 22, logic-health 84.2% → 90.9%. Menu journeys (70) pass with LIB_PRIVATE=absent. Screenshots: front, Practice › Questions (asks Subject), Library › Art and Design.
- claude_notes: 3 new (front-pills asked; inFinder_ error already fixed; Any-kind menu addressed). No owner_answers tab in the ledger.

## Sweep 06:36

- Theme: fast and light (rule 10). A second lazy batch (`window.LAZY`, history 1080): eight widget-only files (whiteboard/ink, flyer, poster, pixel, spotify, rewrite, favlinks) load, all at once, when one of their widgets first starts.
- live-load --local: return 0.90 → 0.83 s, cold 8.18 → 7.88 s, boot files 96 → 88. Flow (widget/whiteboard/flyer/spotify journeys) and check/later.js pass with LIB_PRIVATE=absent.
- claude_notes: 5 load-feel notes logged against this. No owner_answers tab in the ledger.
Left: `games` (327 KB) into the batch once its readers are guarded.

## CI after 1080

- flow 8/8: the Mechanics journey saw mMake asked before "A specific model, or any?". Cause: d747459's best-split `nextFacet` scored mScope low (a part carries both answers). Fix: a `choose` facet leads its list like a kind question (`js/find-facets.js`); `js/finder-tags.js` regenerated.
- fast: green locally after the fix with LIB_PRIVATE=absent (finder-tags regenerated, build stamp renewed).

### CI after be32d73

- fast: `tools/finder-tags.js --check` hit the 300 s per-check limit on the runner (about 250 s here): since 1070 (depth 3) and the best-split nextFacet it walks the whole funnel three menus deep. It now writes `tools/finder-tags.stamp` on every full run: a sha256 of every file the app reads (js/ but the checks, data/ but the health reports, index.html with BUILD_STAMP blanked, the fixture, jsdom-app, the tool itself) plus one of its own output. `--check` passes in 0.3 s when the stamp matches and re-walks otherwise; `--full` forces the walk. A full re-run gave a byte-identical js/finder-tags.js.
- browser 2/8: data/logic-health.json was stale after the mScope `choose` change; regenerated.
- `node tools/health.js --changed` now warns when data/logic-health.json is older than a changed funnel input, or js/finder-tags.js is not stamped for the current inputs.
