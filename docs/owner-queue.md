# Owner queue: everything asked for and not yet live

One list, so nothing asked for gets lost. Claude ticks items off here when they go live. Last update: 13 Nov 2026.

## Built, waiting for the full gate, then live

- [ ] Manager split: 50% of extra-seat money, halved up the chain; tutors pick their own manager (1217)
- [ ] ESL in the library: CEFR A1–C2, 84 lessons, 233 questions (Drive file to import)
- [ ] Body text the same size as tag text; bigger diagrams; buttons never appear or disappear
- [ ] Flaky widget check fixed; handle columns listed once
- [ ] Fix the gate failure: "payload kept on the device is this account's alone" (flow 2)

## In progress

- [ ] Name at the top right as a tag; removing it signs out (replaces the sign-out button)

## Queued (owner asked, not started)
- AFTER the template conversion (owner, 14 Nov; owner wants an objective measure, not an arbitrary one): score layouts by predicted time to do the real tasks (answer a question, book, sign in, find a topic, send a message), using the published Keystroke-Level Model and Fitts's law (bigger, nearer buttons are faster to hit), with WCAG 2.2 AA as a pass/fail floor (contrast, target size, nothing cut, no sideways scroll). Lowest total task time wins. Build it as a check so every later change is scored the same way; show the owner the numbers and screenshots.

- [ ] NEXT after template: sign-in becomes the Finder's first tag (Guest tag, or an underlined blank for name/username, then the PIN as 4 Finder menus of tags 0–9, one per digit, each chosen digit shown as a ● tag, never the digit, and never in the URL or history; the server's attempt limit stays; the name tag's × signs out; no separate sign-in screen)
- [ ] NEXT after sign-in: booking becomes a Finder branch (owner, 13 Nov). Signed in or Guest → Booking → Subject → Level → Tutor (who teaches it at that level) → Where (borough or venue) → Term → Days → Times → Seats → a summary card with the price and Send. Each step is a menu of tags, in dependency order (an earlier owner rule). Reuse the existing booking maths and save paths unchanged. The old booking form card goes.
- [ ] APPROVED (owner): ONE template for everything. A Finder menu becomes a card from renderCard: the chosen tags are the card tags (with ×), the choices are a new "choices" body block, and the tiles sit as usual. Sign-in, the PIN and the booking steps are then all cards. Find menus are the last part not yet converted.
- [ ] Inserts: drop the whole-sheet cards; keep parts with the sheet name as a tag (given to the tools template job)

- [ ] Admin views Settings "through a person's lens" (picker and banner; one code path)
- [ ] Term-date formula fitted to the typical England pattern, not one borough; one copy (arcade.js and booking.gs)
- [ ] Calculator: tidy the small key labels cut off at phone width
- [ ] Question cards: tile row out of the answer box (template law)
- [ ] One-template migration, remaining kinds: tutor and person cards, booking and receipts, messages, settings, tools and games, Find menus, library kinds (content, insert, spec, timeline, fight, reading, hymn)
- [ ] Drive imports approved 12 Nov (lost in a restart): A-Level Physics topic packs and AQA June 2017, KS1 and KS2 Maths, KS1 English Reading, AQA GCSE Business and Media Studies, Edexcel GCSE Statistics specimens, 11+ GL and Google Forms 11+ maths, AQA GCSE PE, Edexcel GCSE Portuguese
- [ ] Split back the 11 merged parts the mark scheme marks separately (needs an owner import)
- [ ] Laws queue: Find as law, the 10 laws, the 6 laws, Structure 81–88 leftovers
- [ ] University level (owner, 13 Nov): the spec = the QAA Subject Benchmark Statement for the subject, plus the FHEQ level descriptors (levels 4–7). Formal logic falls under the QAA Philosophy benchmark, so do the WHOLE Philosophy benchmark at university level, not just logic. Add the spec cards first, then the topic pages in the standard template. No religious examples. After the topic-pages project. A-Level CS and Further Maths logic is covered by their own specs.
- [ ] check-answerable needs a run with more memory (ESL questions)

## Owner to do

- [ ] Redeploy the Apps Script after the next merge, then open the site once as admin
- [ ] Tell families their usernames changed (old ones still work)
- [ ] Enter business numbers on the Settings cards (UTR, DBS, ICO, insurance)
- [ ] Add an email address to one parent's account so they get the Sunday email
- [ ] Pick managers on Staff cards once the split is live; pay managers by hand for now
- [ ] Set the gate as a required check in GitHub branch protection

## Open questions for the owner

- Remove streak, high scores and Brownie points?
- Table gap questions: one box too, or keep a box per table cell?
- The 11 A/B contradictions and 6 earlier questions; twin-path defaults
- Delete the superseded import files in Drive?
- Business checklist card; keep-awake timer (done); joining for a client under the admin's name

## Big library project (owner, 13 Nov; do when quiet)
- [ ] Topic pages for EVERY topic of EVERY subject and level, in the style of CGP revision guides: each page a self-contained topic, with pictures and diagrams, plus animations wherever they help. Err on the side of more animations rather than fewer.
- [ ] Not arbitrary: the page shape is defined by the specification. Each page covers exactly its spec points (with a spec reference on the page) and nothing else. One template, the "mathematically best" topic page, measured by spec coverage. Rework the old topic pages to the same shape.
- [ ] CGP example from the owner: Drive file (link in the owner's Drive). Read it (when the Drive connection is back) to set the topic-page template.
- [ ] Take ONLY CGP's structure (one self-contained topic per page, visual-first). Not its funky styling: no decorative underlines, highlights, jokes or one-off layouts. Every topic page uses the same standard blocks in the same order (one template, generated from data), for every subject and level.
- [ ] One text size site-wide (the tag size) on topic pages too: no small print, no big headings. If a topic does not fit, the page simply scrolls. It still has its animations, diagrams and every spec fact.
- [ ] A topic page is NOT a new template. It is a normal card from the one card maker (renderCard): picture, tags, body blocks, tiles. Its body is simply longer (more text, figure and animation blocks, in a fixed order by spec point). Add a block type to the one renderer only if a topic genuinely needs one.
- [ ] Log this in the claude_notes register in the Ledger once the Sheets connection is back.
- Standing rule (owner, 13 Nov): log every request in the Suggest register; when unsure whether something is logged, log it again.
- [ ] Tidy the science Find menus (Chemistry, Biology, Physics). Spec topics (AQA, Edexcel and so on) must not be mixed with reference databases such as the element-per-element data (keep it). Put the databases in their own clearly separate branch, e.g. Chemistry › Reference › Elements, apart from Chemistry › <board> › <spec topic>. Re-parent branches logically: parent above child, no parent beside its own child, no umbrella duplicates. Make it a rule plus a check (spec topics vs reference data never share a menu), applied to every subject, not just science.

## New subjects (owner, 13 Nov): for each, the spec card, then topic cards in the one template, plus some past papers where available
- University Mathematics, Statistics and Operational Research (owner, 14 Nov): the QAA Subject Benchmark Statement for MSOR (one benchmark covers maths and statistics) plus FHEQ levels 4–7. Start with probability: Bayes' theorem (conditional probability, total probability, Bayes, priors and posteriors, worked examples), then the rest of the benchmark. Spec cards first, then topic pages in the one template.
- [ ] Biblical Hebrew: the QAA Theology and Religious Studies benchmark (Hebrew Bible strand)
- [ ] Koine (New Testament) Greek: OCR GCSE and A-Level Classical Greek (AQA has no Greek GCSE)
- [ ] Philosophy: AQA A-Level, plus the QAA Philosophy benchmark (university level, includes logic)
- [ ] Further Maths: Edexcel A-Level
- [ ] Computer Science: AQA A-Level
- [ ] Portuguese: Edexcel GCSE and A-Level
- [ ] Biology, Chemistry, Physics: A-Level (board to match students; default AQA)

## Reference databases (owner, 13 Nov), each in its own Reference branch, never mixed with spec topics
- [ ] Hebrew and Greek Bible words (Strong's numbers, public domain): meaning, root, grammar
- [ ] Logical fallacies: definition plus a neutral example each
- [ ] Physical constants and units: value, unit, which specs use it
- [ ] Mathematicians as people (no theorems database)
- [ ] Countries, with capitals, major cities and flags (cities and capitals are their own items, linked)
- [ ] Solar system: planets and moons, with sizes and distances

## Texts and history to database (owner, 13 Nov)
- [ ] Church Fathers: as historical people, plus their writings (public domain) down to chapter and section
- [ ] Apocrypha and Pseudepigrapha down to the verse (check what is already in; fill the rest)
- [ ] Creeds (Nicene, Apostles', Athanasian) line by line; Westminster Shorter Catechism Q&A
- [ ] Catechism of the Catholic Church: copyrighted, so record its structure (parts, sections, chapters, paragraph numbers and titles) plus our own short summaries; never its text
- [ ] Plato and Aristotle as people, plus their works by Stephanus and Bekker numbers
- [ ] Check Magna Carta and the Bill of Rights are in; add any missing clauses
- [ ] Rulers as people: kings of Israel and Judah, English monarchs, Roman emperors, popes
- [ ] Dead Sea Scrolls: each scroll, its contents and its find-place
- [ ] Ancient inscriptions: Rosetta Stone, Mesha Stele, Tel Dan and so on
- [ ] Heresies and schools of thought: founder, dates, teaching, which council dealt with it; linked to councils and Church Fathers
- [ ] RULE to codify (owner, 13 Nov), with a check, in data/settings/rules.json:
  - Two kinds of tag. **Category tags** (subject, level, board, kind, year…) never have a card. **Entity tags** (a named thing: Septuagint, Augustine, Council of Nicaea, Rome…) have exactly ONE card each: the tag IS that card.
  - In Find, picking an entity tag shows its own card first, then every card tagged with it.
  - Never a second card for the same entity, and never an entity card without its tag.
  - The check fails on duplicates or orphans.
- [ ] Apply this rule before adding the new history databases: audit the existing entities (Septuagint, versions, manuscripts and so on) and merge any duplicates.

## BRING BACK LATER (switched off 14 Nov, code kept in attic/, data kept)

Bring one back the way attic/README.md says: `git mv` it back, re-add it to `window.FILES` in index.html and to `files`/`later` in data/settings/tiers.json, then `node tools/tiers.js`, `node tools/bundle.js`, `node js/check.js`. The checks go back into js/check-all.js's SUITE and rules.json.
- [ ] Email widget: attic/js/inbox.js, attic/js/check-inbox.js (backend/inbox.gs stayed live; `inboxList` kept in check-actions REASONS)
- [ ] Hymns: attic/js/hymns.js, attic/js/check-hymns.js (data/hymns/ kept)
- [ ] The Quran: attic/js/quran.js (data/quran/ kept); journey block in attic/check/flow/19-find-under.js
- [ ] Timelines: attic/js/find-timelines.js, attic/check/timelines.js (data/timelines.json kept); journey in attic/check/flow/19-find-under.js
- [ ] Phone notifications: attic/js/push.js, attic/js/check-push.js; the worker is attic/sw.js (sw.js is now a self-unregistering stub — put attic/sw.js back over it)
- [ ] Offline mode: attic/js/offline.js, attic/check/offline.js (same worker as above)
- [ ] Google Tasks link: attic/js/gtasks.js
- [ ] Avatar maker (a person choosing one of the ten pictures): the grid line in js/me-fields.js `photoPicker_` (`<div class="pfp-grid" …>${Object.keys(PFP_ART).map(opt).join('')}</div>`, see git history 14 Nov); PFP_ART stays in js/links.js as the default pictures; journeys in attic/check/flow/17-mark-tutor.js and 03-tutor-admin.js
