# Decisions — the owner's specific answers

Each line follows from a rule in `docs/philosophy.md` (shown as `Pn`; `L` = the law wins, `Q` = ask on a clash)
and carries its date. The loop reads only the section for the area it is working on. Two lines that clash
become an owner question showing both; never pick one.

## The site and its scope
- One place beats light: a heavy business function stays fast by isolated, protected blocks loaded only when opened. P1, P10 · 6 Nov
- All learning content (questions, library, animations) is free behind a free sign-in; signed out sees only Settings. P1 · 6 Nov
- The business earns from tutoring, bookings and the shop. P1 · 6 Nov
- Students first when a choice helps one group and slightly hurts another; then parents, tutors, admin. P1 · 6 Nov
- The mission is all knowledge: anything learnable belongs in Find. P1, P4 · 6 Nov
- Staff use the same Find, with extra cards (their bookings, students, pay). P4, P5 · 6 Nov
- Fully autonomous: booking, matching, payment, reminders and receipts happen without anyone pressing anything; a human can always step in. P1 · 6 Nov
- Private things (learners, money, staff records) live only in the owner's Google Sheets, never in the public code. P1, L · 6 Nov
- Scale target: ~100 staff and £100k a year. P1 · 6 Nov

## Keeping things
- Never removed for good, however big the site grows; every feature stays on even half-working. P2 · 6 Nov
- Nothing lost wins over minimal/stability when they clash. P2 · 6 Nov
- No age gates on learning content. P2 · 6 Nov
- Sacrificing complexity for stability or simplicity is a valid trade; Apple-like minimal, few features done well. P3 · 6 Nov
- Sweeps may take big leaps that briefly break something; the checker catches it, the next sweep fixes it. P3 · 6 Nov
- Backups: Google Sheets' own version history is enough. P2, P3 · 6 Nov

## Data and privacy
- Data is kept forever, with a stated reason and retention policy for personal data. P2, L · 6 Nov
- A deletion request for personal data always wins over "nothing lost"; the Business checker tracks it. L · 6 Nov

## One rule
- Absolute, no exceptions, front end and backend alike; the Apps Script backend is split and tidied the same way, even with more redeploys. P5 · 6 Nov
- Even where one place is slightly worse: the essay box is the cream pill, keypad keys are tiles, one read-aloud per card. P5 · 6 Nov
- One card, one tile row, one button maker, one text box (the cream answer pill), one chip size, one question engine. P5 · 6 Nov

## Look, cards and tags
- No sentences unless essential; icons and one-word labels. P6 · 6 Nov
- Pixel portraits need no "impression" label. P6 · 6 Nov
- Picture-first when the thing has a picture (people, parts, fights, timelines, icons); text things stay text with tags. P6 · 6 Nov
- Tags at the top as outlined pills, showing only what is not already picked as a chip. P6 · 6 Nov
- One tag per attribute, never composites, repeats or always-on tags; the "Learning" tag is dropped. P6 · 6 Nov
- No grey clutter (information becomes a tag); every element kind has its tags. P6 · 6 Nov
- The look stays black and white, colour only on tags and chips. P5, P6 · 6 Nov
- "Fewest words" applies only to the site's own words; questions appear exactly as in their original paper. P6, P9 · 6 Nov
- Words are written so they could be translated later (English only for now). P1, P6 · 6 Nov
- No separate accessibility work beyond what exists (read aloud, magnifier stay). P2, P3 · 6 Nov

## Find, search and menus
- One search bar; signed out sees the same Find, with only Settings. P4 · 6 Nov
- Each category one fixed colour, neighbours differ; every tag askable; a menu needs at least two answers. P7 · 6 Nov
- Best split, always — including the front menu; no hand-ordered or fixed front list. P7 · 6 Nov
- Typing in search filters the one list and the menus keep narrowing what's left (one funnel). P4, P7 · 6 Nov
- All exam boards are treated equally in Find. P5, P7 · 6 Nov
- A returning student lands where they left off. P11 · 6 Nov

## Controls and speed
- Controls you can't use are greyed, never hidden; never move, appear or disappear on tap; grouped in one row; respond instantly. P8 · 6 Nov
- Any tap responds within 1 second (the checker flags over 1s). P10 · 6 Nov
- Opening the site on a phone must feel instant — the owner's most repeated complaint. P10 · 6 Nov
- Widget-only secondary files load on their card's first start, in one second batch after LATER (tiers.json `lazy`, history 1080). P10 · 7 Nov
- Phone first, but it must work on a computer or any device. P10 · 6 Nov
- Recently opened things keep working offline; answers sync when back online. P10, P11 · 6 Nov
- Data from one source (in sync); seamless updates that never interrupt. P10 · 6 Nov

## Questions and AI
- Marked mechanically wherever possible; parts inside one card, no box; every question works if one works. P9 · 6 Nov
- AI is used nowhere except marking open writing (essays, long answers), clearly labelled. P9 · 6 Nov
- Grade prediction/progress targets on hold (no good metric yet); existing work emails and progress widget stay. P2, P9 · 6 Nov

## Content
- Content allowed in: our own, public-domain, or licensed for this use; copyrighted papers stay private. L, P1 · 6 Nov
- Students' work can become public posts after approval. P1 · 6 Nov
- No leaderboards, points or streaks. P6, P9 · 6 Nov
- Homework (when built): the tutor picks questions or papers from Find and assigns them. P4, P11 · 6 Nov

## Bookings
- Prices come from one formula for every session, never set by hand: level, group size, length, online vs in person; the existing pricing is the starting point. P5 · 6 Nov
- Bookings are blocks of sessions (a term at once), paid all up front. P1, P11 · 6 Nov
- Cancellations free up to 24h before; after that the session is charged and the tutor paid. P1 · 6 Nov
- Leaving midway gets no refund, within consumer law: online bookings keep the 14-day cooling-off right and no unfair terms; the terms say so and the Business checker tracks it. L, P1 · 6 Nov
- If a tutor cancels, the session is refunded automatically and the family told. P1, P11 · 6 Nov
- "No preference" bookings: every fitting tutor is told and may apply; the client picks one and it goes through. P1, P11 · 6 Nov
- A venue (later) is just another "where" in the one booking form, using the existing pricing and booking system. P5 · 6 Nov
- A family sees their bookings as cards at the top of Find › Booking. P4, P6 · 6 Nov
- Tutors set a weekly availability pattern plus days off. P11 · 6 Nov
- Online sessions happen in a video call built into the site (a big later job), never recorded. P1, L · 6 Nov
- When the site gets something wrong for a family (double booking, wrong charge) it detects it, fixes it, refunds automatically and tells everyone. P1, P3 · 6 Nov

## Money and tax
- The client pays the business; each tutor's share is paid out automatically, with receipts and tax records written as it happens. P1 · 6 Nov
- Tutor pay comes from its own formula, like prices. P5 · 6 Nov
- The site produces the owner's Self Assessment figures (income from bookings, expenses from photographed receipts filed in the site, profit, in HMRC's boxes). P1, L · 6 Nov
- Each tutor gets a yearly earnings statement. P1, L · 6 Nov

## People and messages
- Names on screen are first names only (full names to admin). P6, L · 6 Nov
- Parents see everything their child does on the site. P1 · 6 Nov
- Anyone may sign up alone; a parent links later. P11 · 6 Nov
- Tutors may message students 1-to-1; every message is kept and visible to admin. P1, L · 6 Nov
- People hear by phone push for urgent events and email for the rest. P11 · 6 Nov
- Every session gathers feedback, visible to the owner whenever, with a hidden rating; no public stars. P1 · 6 Nov

## Compliance and status
- Policies (terms, privacy, safeguarding, refunds) are drafted by the site from the philosophy and official templates, approved by the owner, reviewed yearly. L, P12 · 6 Nov
- The owner is the designated safeguarding lead for now. L · 6 Nov
- Status: registered self-employed with HMRC (has a UTR). L · 6 Nov
- Status: owner's enhanced DBS current. L · 6 Nov
- Status: separate business bank account in place. L · 6 Nov
- Status: card payments through Stripe. P1 · 6 Nov
- Status: insurance NOT yet in place — the Business checker prompts it. L · 6 Nov
- Status: ICO data-protection fee NOT yet paid — the Business checker prompts it. L · 6 Nov

## The owner and the loop
- The owner's own day: answer the inbox, teach sessions, give the final yes to new tutors (all checks automatic first), read feedback. P12 · 6 Nov
- Sweeps decide visible design — and money, law and safeguarding changes too — when the philosophy points one way; ask only when it doesn't. P12 · 6 Nov
- Any decision can be undone from the inbox; quick checks only, no long waits. P12 · 6 Nov
- When the owner is away, the sweeps keep going by the philosophy; questions just wait. P12 · 6 Nov

## Growth
- Product first for now. P1 · 6 Nov
- Later, applications, marketing and family credit are built from existing parts (applications as Profiles cards, marketing as posts/flyers, credit as a basket discount), never a separate system. P5 · 6 Nov

- 6 Nov · Q (open): the one person the site is ultimately for — owner said 'I suppose me, the owner… ask again later'. Students still win trade-offs between groups (P1). Re-ask.
- 6 Nov · P1/P5 (future): department leads. A lead (e.g. a boxing coach friend) is a tutor with a lead role row; no management duties (the site runs admin). Incentive = a small "lead share" of sessions taught by coaches he recruits, taken from the business's share; paid automatically. Avoid a formal partnership (joint liability) — self-employed with revenue share; check with an accountant. Same pattern for every department. Lead-share % to be set by the owner (suggested 5–10%).
- 7 Nov · P7 (applied, Sweep 04:36): the next menu is the best split (`facetBits_`, the menu-rule check's score), up to 2 bits (a split that good is good enough and sort_order decides, so Part never jumps ahead of Subject); a coarser question still comes before its finer one; a kind question and the front's What kind still come first (660, 4 Nov). Menu-rule findings 97 → 22.
- 7 Nov · L (how we work): core freeze — for now only Find, Library, Questions, Settings and Bookings matter; everything else may be switched off (data only, nothing deleted) so work is faster and cheaper (history 1090).
- 7 Nov · L (how we work): quality first when speed and quality pull apart — a change is done properly once.
- 7 Nov · L (how we work): report only results and "safe to merge" (or when the owner is needed); silence otherwise.
- 7 Nov · L (how we work): a question that comes up mid-work is decided by the philosophy and logged here; the owner can overrule later. Ask only on contradictions or irreversible steps.
- 7 Nov · L (how we work): usage — heavy by default for now (parallel workflows); the owner will say if it runs out too fast.
- 7 Nov · P8/P3 (booking form): the form IS the booking record — the same lines always; statuses are its 6 tick lines (Requested … Completed), greyed until ticked; a line that doesn't apply shows a greyed "—". Keep the 3 price columns (×, +/h, running total), each filled where it applies, no lines that cancel out, one period multiplier. Keep the weekday grid. No tutor rate beside the tutor's name. Guess tally: 3 of 4 right.
- 7 Nov · P3 (booking rules): max seats = the smaller of the tutor's capacity and the place's capacity; online and the client's house count as places holding 4; other venues hold their own number. Mixed levels allowed in one booking: the client picks the highest qualification and the price follows it. A lesson can be booked any time; the tutor accepts or declines. Extra subjects stay. Guess tally: 0 of 4 right — booking rules are owner-only ground.
- 7 Nov · P3 (booking rules): no refunds for cancelling a lesson inside a paid block, whatever the notice (the 24h free cancellation is for single lessons). Only admin sets a discount. A tutor with no capacity set holds 1 seat. Setting the room sends no message; it just shows on the card. Guess tally (booking): 1 of 4 right.
- 7 Nov · C+ (owner settled a clash): signed out, Find offers only Settings (Sign in / Join) — Venues appear after sign in, overriding today's earlier "Venues for everyone".
- 7 Nov · P4/P3 (settings, profiles): a setting that belongs to several account types (e.g. first name, last name) is listed once, tagged with every category it belongs to, so the menus find it under each. Settings come before tutor profiles. Tutor profiles already exist: optimise their layout, don't rebuild. Every Find section shares as a PNG exactly as seen (as before). Guess tally: 1 of 4.
- 7 Nov · P3/P8 (questions, overrides 1040 r12 and read-aloud-parts b): every part of a question has the full button row (Read aloud, magnifier, Check …), the same row everywhere. The pen is off until chosen, so scrolling never draws. A part's tags follow the first part's rule (only what has not been chosen yet).
- 7 Nov · P7 (library): Works is renamed Writings everywhere; every writing carries a Primary or Secondary source tag. Projects move from Practice into Library. Mechanics asks Car or Car part first. Statistics means the GCSE Statistics subject (Edexcel), not the statistics topic in GCSE Maths. Physical Education has no History tag: Boxing only for now. Manuscript cards go minimal, pixel pictures allowed, no grey text.
- 7 Nov · P7/P8 (front menu): the front pills are exactly Practice, Library, Videos, Coming soon, Posts, Messages, Profiles, Booking, Shop, Settings, Tools, Games. Venues sit inside Booking. Frozen pills (Videos, Games…) stay on the front greyed and open Coming soon. Reels, Flyers, Posters and the e-ink Verse live in Tools. Guess tally: 3 of 3.
- 7 Nov · P8/P3 (no sheets): nothing opens a separate sheet or menu with a Back button. A form is simply there in its card from the start (Apply to teach, Set the room, Mark paid, receipts …), not opened on tap: the simplest, never dynamic. Applies everywhere; frozen areas when they return.
- 8 Nov · P3/P8 (tutor side, focus now): tutors upload their intro video (no links); it is saved to the owner's Google Drive (a private tutor-videos folder, via Apps Script) and played on the card, about a minute / 100 MB at most. Tutors add current and past jobs like qualifications ("Add a job": role, where, from–to or now), shown as pills on the public card. Every settings card has one shape: title, one line per field (cream pill), one Save at the bottom; lists (qualifications, jobs, photos) use the same "Add a …" tile and one line each. Sharing a tutor card makes a PNG exactly as the card looks on the site. Guess tally: 4 of 4.
- 8 Nov · P4/P1 (one tutor card): the tutor card in Find › Booking is the only tutor card. Profiles does not draw its own copy: the Booking card also carries the Profiles tag, so the same item appears under both; the shared PNG is that card. Students and parents keep their own profile cards (they are not in Booking). Tiles: the same row everywhere, only rule-based omissions (no Book on your own card).
- 8 Nov · P8 (tutor card design): top of the card = photo, then name and rate on one line, then subject pills. Everything on the one card and the whole card fits one phone screen without scrolling (compact: smaller photo, pills wrap tightly, long lists shortened to "+N"). Free hours in whichever form takes least space (compact day pills, e.g. "Mon 5–6"). Trust: no change (no public reviews or counts).
- 8 Nov · P8/P3 (settings titles, @family share): every Settings card has a plain title naming it (an untitled card fails a check). On the tutor's Rate card (tutor and admin only, never families) a horizontal bar updates as they type: [tutor's rate for the first seat] + [tutor's extra-seat rate for another seat] + [@family block = the @family share × the extra-seat rate, e.g. 0.5 = half that block], £ on each block. The @family share is one setting for everyone, in Business, editable by admin only.
- 8 Nov · P3 (money, owner): the @family block in every price = the @family share (one setting, config B) × the tutor's extra-seat rate. Per-tutor cuts are removed (no tutor overrides the share). Tutor card fits one screen for every kind of tutor (lists shortened to "+N").
- 8 Nov · P5/P8 (question parts, overrides 960's one element with indented blocks): every question part is its own card, the same shape as any card — its own tags at the top, its words and box, its whole tile row — all at one left edge, none indented. A shared stem is drawn once, at the top of the first drawn part that needs it (the simplest: no stem-only card without buttons). A part not in the search is not drawn (history 1160).
- 8 Nov · P9/P2 (question words): a question shows the paper's own words, never an importer's note or summary ("[… NOT EXTRACTED]", "involving terms in …"); check-answerable fails one (`standin`). Fixed on Edexcel A-level June 2024 Papers 1, 2 and 31 from the papers' pages (history 1160).
- 8 Nov · Weekly email in Business (owner): the weekly email's look and its words (`site:digest`, `site:digest-words`) are tagged Business in setting-for.json, so Find › Settings › Business shows them to an admin only; Find is drawn again when the lazy records batch lands.
- 8 Nov · Where you teach by area (owner): "it's dumb to have them all listed because the operation will grow". The tutor's Where you teach card ticks areas (a venue's borough, else its city) instead of every library; an area's tick adds or drops all its venues in `venues_ok`, so the venues tab and the backend stay as they were.
- 8 Nov · Find › Booking's tags (owner): "the booking form should be a section which can be found in the menu tags… old booking forms… under maybe 'previous'". Booking now offers a Booking form tag (the form itself; under plain Booking a card with Book) and a Previous tag holding the client's finished bookings (`jobIsPast_`); current ones stay Receipts. No booking money or rule changed.
- 8 Nov: never wait idle on CI; build the next work while checks run, push after (owner).
- 8 Nov · Tutor photos uploaded (owner: "tutors upload, never paste links"): an extra photo is chosen from the phone, redrawn at 1200px JPEG on the phone, kept by the new `photoFile` action in a "Tutor photos" Drive folder (Script Property `TUTOR_PHOTOS_FOLDER`, made on the first upload, view-by-link), and its link goes into the slot so Save keeps it; links already saved still show.
- 8 Nov · New tutor's Staff column: Jobs and When I can teach now show before the tutor has a card row. The week was hidden for the hub's Available card, which only draws once a tutor row exists; Jobs was missing only from check/fixture.json, which now has it.
- 8 Nov · Rate share bar: confirmed it draws for a tutor and an admin as a rate is typed on Settings › Staff (journey in check/flow/33); no change needed.
- 8 Nov · Slow taps (owner: "why is clicking different buttons so slow still"): measured under CPU ×4 at 390px; tap→first paint was already <50ms, the wait was the redraw after it. Going back to a list just seen now reuses its pages (`stuffPages_` keeps six, as `stuffFiltered` keeps lists) and the front menu greys its answers in one walk (`frontSoonOnly_`), so Back/✕ to the front fell from ~1.3–1.7s to ~20ms. A first visit still re-tallies every facet over the new list (menus, not cards, dominate Practice/Questions; cards dominate Settings). Memoising every facet read per item was tried and doubled first visits, so not kept.
- 8 Nov · booking/receipt tiles (owner could not tell Accept from Decline): a booking's tile row prints each tile's one word under its round mark (`data-w`, the label's first word or `word`); Accept's mark is the tick. Other tile rows stay marks only.
- 8 Nov: tag pills universally bigger for easier tapping (--tp-fs .78rem, --tp-h 1.55rem) (owner).
- 8 Nov: a new build never reloads a page on screen; it waits until the page is put away (owner: site 'unloads' mid-lesson). No merges to main during lessons.
- 8 Nov: a question part's tiles are ONE wrapping .tile-row under its answer box — tools, Check, Mark my working (once a photo is in), Show the answer, then share/star/message/top/help; "Marked by…", the working's wait and the verdict sit below it. check-answerable 'own-card' fails a part with more than one row or a tile outside it (owner).
- 8 Nov: an admin always gets the Mark paid form on an accepted booking (cash), even on a booking where they are also the client and see the Stripe cart tile (owner could not mark paid).
- 8 Nov · saved booking = booking form (owner, angry: the receipt had drifted): a saved booking now draws the form's lines in the form's order (For, Kind, Class … Shared by, the ticks, Discount, then an admin's Client pays / Tutor earns / Admin earns), '—' where a line does not apply, the same header row, five columns with fixed floors, the same row height and the same weekday grid; `Sharing` is the form's `Split`, no tag line above the rows, no compact saved grid. Journey 32 compares the two so they cannot drift.
- 8 Nov · status lines (owner): `Started` and `Completed` are gone from the form and every saved booking; the ticks are Requested, Applied for, Accepted, Paid.
- 8 Nov: a facet held as "a count within G" (facetLocal_) only waits on a G the tab puts before it and that is not yet asked — after Any function, Board/Subject were held forever (Find said Nothing left to narrow with 4872). An echo of a skipped question is judged over the whole library, not the narrowed list. The Paper facet says the paper's number (Paper 1), tellApart_ adds tier/subject on a clash. check-funnel signs in as admin and walks the owner's two paths (pathsAsked_).
- 8 Nov · at-home seats and money that adds up (owner): a booking At home takes every seat the tutor holds (Extra seats = capacity − 1, greyed, priced for all; private, so no Split — `Just you`); the server refuses a home request with fewer (`postCreateJob_`) and writes max_students = those seats. Every rate line is rounded to the penny as shown (Day & time now has its own line), so rows × hours × weeks = total exactly; tutor earns = (own rate + extra-seat rate × other seats) × hours; a discount comes out of @family.'s share and is capped where admin would go below 0 (the line says "max N%"); client pays = total − discount = tutor + admin + room and fees. The week's × hours sits on the last ticked day.
- 8 Nov · any screen shape (owner: "should work on any screen orientation… scalable rules"): one fluid column for phone, tablet and desktop alike — the page colour runs edge to edge (no darker side field), the column is `min(100%, 48rem)` centred with gutters `max(16px, safe-area)`, and the last three `orientation: landscape` queries became shape rules (`min-aspect-ratio: 1/1`, with `max-height: 500px` for the whiteboard and notebook). check/fluid.js (secondary) fails on sideways scroll, an off-centre column or a side panel at 390×844, 844×390, 820×1180, 1180×820, 1020×700, 1440×900, 1920×1080.
- 8 Nov · paper code (owner: "the name of the paper is that code near barcode"): every board past/specimen cover carries `paper_code` (1MA1/3F, 9MA0/02, 8461/1H, J560/01), filled by `tools/set-paper-codes.js` from spec_code, question ids, file name or title; Find's Paper facet and the card's paper pill say it (value stays the paper id), check-library holds every shown cover to its board's pattern. STA tests have no board code and keep "Paper N".
- 8 Nov · Desert Fathers in Writings (owner): `texts/desert-en` (collection Desert Fathers, Christianity, Primary) — Athanasius's Life of Antony (Ellershaw 1892), Cassian's Institutes and Conferences (Gibson 1894), Sulpitius's Dialogue I (Roberts 1894), from CCEL's NPNF, `tools/writings-more.py --add desert`. Not added: Budge's Paradise (1907, PD, but only a rough OCR exists — needs a clean transcription), Lowther Clarke's Lausiac History (1918, translator died 1968, in UK copyright), John of Damascus On Heresies 100 (only English is Chase 1958, in copyright; no PD English found).
- 8 Nov · card pills (owner, "This no need pill" on 2024 Paper 3 Q10a): a question card's tag line drops a value every card in the current Find list shares (`tagShared_`, judged per list, parts by their question) as well as a value already chosen as a chip; one card alone keeps all its tags. On that paper Learning, KS4, Edexcel, June, Accuracy verified, Calculator allowed and Unattempted went; Q10 · a · 1 mark stay.
- 8 Nov · pen on touch (owner, "draw tool always on"): checked with a real touch swipe at 390 and 1024px — with no tool picked the swipe scrolls the column and leaves no ink; with the pen tile on it draws. No change needed; parts carry the same tag line as their first part.
- 8 Nov · P7 (library, re-check of the 7 Nov notes): Projects in Library, Car or car part first, PE Boxing only and Works → Writings with a Primary/Secondary tag were already live (1120). Manuscript cards are now picture + tags only: the side caption and the tracing credit moved to the card's first facts page ("Shown", "Drawn from"); undrawn manuscripts keep the pixel picture. Statistics in the Library is only the Edexcel 1ST0 book; Practice › Statistics holds AQA 8382 GCSE Statistics papers, no Maths questions; no 1ST0 papers exist yet — they need a library import.
- 8 Nov · round tiles (owner, 1): every action is a `tile_` in a `.tile-row`; a form keeps its one Save (`tile_({ form: true })`). Answer choices and week-grid cells stay inputs. `check-look` §1 fails on a raw `<button>`; files not yet converted are a per-file ratchet.
- 8 Nov · no grey sentences (owner, 2): text is `--ink` or a tag; `--dim`/`--faint` colour only disabled controls, placeholders and off/locked states (P8). How a part is marked is a tag; a level's tutors are tags. `check-look` §2.
- 8 Nov · same look (owner, 3): the calendar, sprint, docket, notepad and timer schemes are dropped; every colour outside `:root` is a token (`--white`/`--black` added). Exception: the pH scale's colours (mat.js) are content. `check-look` §3.
- 8 Nov · empty states (owner, 4): one `empty_(text)` (tiles.js), short and specific ("No messages yet."), ordinary text. `check-look` §4.
- 8 Nov · inline spacing (owner, 5): a class in style.css, never `style="margin…"`; index.html's boot-trouble sheet keeps its inline styles because it draws when style.css may not have loaded. `check-look` §5.
- 8 Nov · icon-only tiles (owner, 4c): no words under any tile (reverses the booking words of 9741dd9); a ~500ms hold on any tile shows its word in a small label (one handler, `tileWordShow_`, tiles.js); aria-label/title stay. `check-look` §4c.
- 8 Nov · tap twice (owner, 5a): every delete, decline, remove and reset arms with `sure_()` on the first press; no `confirm()` anywhere. Exempt: closing an unsaved editor (Cancel), a filter chip, an unsent photo. `check-look` §5a.
- 8 Nov · admin in black and white (owner, 11a): admin tiles and rows carry no yellow; `tile_` draws an admin tile only for an admin. `check-look` §11a.
- 8 Nov · frozen front pills (owner, 12a): stay greyed as "coming soon" — no change.
- 8 Nov · one loading look (owner, 30a): a pressed button or tile waits with the same three dots as `loading_()` (the busy ring is gone, and `btn-spin` with it); `check-loading` accepts no spinner keyframe and `check-look` §30a fails on a rotate-360 animation.
