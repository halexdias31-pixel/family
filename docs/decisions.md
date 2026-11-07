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
