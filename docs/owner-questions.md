# Questions for the owner

Things the health checker flags that would change what you see, so they wait for your say.

- **Settings, Cancel on your card's editor:** pressing Cancel closes the editor, and the report form's Send and Picture tiles go with it, so everything below moves up. Options: (a) keep as is (closing a form is what Cancel means); (b) keep the editor's space and show "Closed" in it; (c) open the editor as a sheet over the page so nothing under it moves.
- **Settings, Save on your details (me-save):** the "saved" message is sometimes two lines on a phone; one line of room is now kept from the start, but a two-line message still nudges the controls below by a few pixels. Options: (a) keep two lines of room (a bigger gap always); (b) shorten the message to fit one line; (c) leave it.
- **Settings, Split on a layout card (lay-split, admin):** splitting a card into pieces adds/removes pieces, which moves Change PIN and Try voice below. Options: (a) accept (splitting is a layout change by nature); (b) only apply the split after a separate "Apply" press.
- **Requests, Decline (job-request-answer, admin):** Decline opens a "Why not?" line under the tiles, pushing the rest down. Options: (a) keep; (b) ask "why not?" in a small sheet over the page; (c) always show an empty "why not" line under requests.
- **Who sees it (seen-open, admin):** the "Who sees this" box opens under the tiles and pushes the rest down. Options: (a) keep; (b) open it as a sheet over the page.
- **Find, Fighter menu (11 fights):** pick a fighter such as "Micky Ward" and the fight's card tag names the other boxer ("Arturo Gatti"), because a fight's top tag is its first-named fighter. Options: (a) keep (the tag names the fight's lead); (b) the tag names the fighter you picked; (c) the tag names both.
- **Find, an answer's words: short in the menu, full on the card (28 `answer-words`, round 10):** the menu says the short name ("1 · Purification", "Sonnet 29", "1.5 dCi") and the card's tag the whole one ("1 · Purification (Kitab Al-Taharah)", "Sonnet 29 – ‘I think of thee!’", "1.5 dCi (K9K)"). Options: (a) the short name everywhere; (b) the whole name everywhere; (c) keep (short where space is tight). The chip now always says what the menu said.
- **Stored copies of a person (round 10, `in-sync`, 4):** `receipts.person_name`, `reports.handle`, `applications.handle` and `lib_log.handle` keep the name as it was when the row was written; a renamed person shows the old name there. Options: (a) keep (a receipt or a log is a record of that moment); (b) show the people row's name now, by `person_id`.
- **"Learning" on every card (round 12, `odd-tags`, 1):** "What for · Learning" is on 32,938 of the 32,984 library cards read; every card's first tag. It is the front menu's answer (Learning / Settings / People…), and the rule since 396 is "every facet is a tag", so it was left on. Options: (a) drop a tag whose value is on (almost) every card; (b) drop only "What for" from cards; (c) keep.
- **Titles drawn as tags on writings (round 12, `odd-tags`, 329):** a source or translation's name holds the card's other tags — "Greek New Testament" (beside Greek, New Testament), "World English Bible (2000)" (English, Bible), "AQA GCSE English Literature anthology" filed as the *author*. These are names, not repeats a code change should cut. Options: (a) keep the names; (b) cut the repeated words (just "Masoretic", "(2000)"); (c) fix the data (an anthology is not an author).
- **Read aloud on a question with parts (round 12, `dup-controls`):** the magnifier and padlock are now in the card's foot only. Read aloud is in the foot on a one-part question; on a question with parts each part keeps its own (it reads that part) and the foot has none. Options: (a) keep; (b) one Read aloud in the foot reading every part in turn.
- **"Doesn't matter" on the first menu (batch A, 6 Nov):** there is no special case for the front menu — after Doesn't matter the next menu is picked the same way as everywhere (the first in the facets tab's order that passes the one rule: two answers, half the list can answer, not lopsided). That is Subject, and since about 250,000 of the 279,000 things are library and practice items, Subject (and the results) are mostly library. The kinds' own question ("Which": Questions, Posts, Tutors…) is held back because it re-asks What kind (rule 499). The menu-rule check (920) already says the order rule is "first in order", not "best split"; best split by the check's own measure would ask Collection (Bible, Hadith…) first on the front page. Options: (a) after Doesn't matter, ask "Which" (every kind, over all items); (b) switch every menu to best split (changes every menu everywhere); (c) keep.
- **Accuracy and Function menus (batch A, 6 Nov):** they are never asked anywhere (logic-health: carried as tags on 28,445 cards, asked 0 times). In the facets tab they sit at 136/137, after Year (130) and the sitting, just before Paper (140). By the time a list gets there it is one sitting, and a whole sitting is either all verified or all not, so there is one answer and the rule (two answers at least) skips it. At Year (1,456 cards on GCSE Foundation) both would be askable. Options: (a) move them before Year in the facets tab (a data change); (b) keep (they stay tags only).
- **The people, DMs, Booking and Shop columns (batch C):** Posts, Messages, Profiles, Booking and Shop now answer in Find with their own menus; the settings columns (Student, Parent, Tutor, Apprentice, Biz, Web settings) and the Reels column are switched off in columns.json, since each settings card has one home now (Find › Settings › its type). The Feed, DMs, Booking, Shop and the five profile columns are still on, so those things show in two places. Options: (a) switch those columns off too (Find is the one place); (b) keep the columns as a second way in.
- **Settings › Admin is one long list (batch C):** 22 cards answer Admin and none of them carries a tag that would make a further menu. Options: (a) split Admin into Business and Site (the two old columns); (b) keep one list.
- **Grey lines removed (A+):** one CSS rule hides a card's `.sub`, `.faint` and `.muted` lines (not a live message such as "Saved" or an error); credit and licence lines (Tanzil CC BY, Pickthall…) became tags in the tag row. Some cards lost their only words — the admin's Build card, the Brownie points / Code of conduct placeholders still say theirs in `.note`. Options: (a) each card's lost line becomes a tag (the sweep rounds); (b) bring a named line back.
- **Signed out (C+):** Find shows the search bar and one answer, Settings, which holds the sign-in card (Sign in, a new PIN, Make an account). The top bar shows only @family. (no Sign in tile). Options: (a) keep; (b) a Sign in tile in the top bar as well.
- **Videos (batch B/C):** each video is a Find card (thumbnail, tags, Watch); the data has 3 rows with one tag string ("lesson long video") and no channel, subject or level, so no menu is asked under Videos yet. Options: (a) fill subject/channel/level in data/videos.json or the media tab; (b) split the tags cell on spaces.

## Owner's answers, 6 Nov
- Old Feed/Messages/Booking/Shop/profile screens: **keep them on**; the 2-hourly sweeps stabilise them over time.
- Admin settings: **split into Business and Site**.
- Top-bar Sign in: **no** — sign in only via Find › Settings.
- Videos: there are different types (movies and so on) — add a video-type facet (e.g. Movie, Lesson, Documentary, Music video, Clip) and fill what we can; best effort.
- Grey lines: owner asked "like what?" — answered: the admin Build card's only line was hidden; plan (a), each lost useful line becomes a tag.

## Batch D, 6 Nov
- ~~Manuscript fragments 18+?~~ **Answered:** no age gates on learning content — the manuscripts, scripture, religious works, GCSE history and fight videos are open to every viewer.
- A person card no longer has link tiles (a figure's Writing / Event tiles); events still link to their figures. Want the links back as tags?
- The three lesson videos are marked Documentary (thumbnails look like Discovery/Quest). Right type? Their real titles are still unknown.
- History › People asks Decade first (the one rule picks it). Fine, or Era / Role first?

## Batch E (6 Nov) — mechanics and PC parts
- Cars chosen: Fiesta Mk7 1.25 Duratec 16V (engine code SNJB), Golf Mk6 1.6 TDI (CAYC), Corsa D 1.2 16V (Z12XEP). Right generations and engines? The SNJB code in particular is worth checking.
- Price bands are the Clio's for every car (rough, parts only). Should the Golf have its own?
- The made-up example part numbers were removed. Do you want real part numbers anywhere?
- History › Manuscripts/People/Works/Events is now ordered before Work, but it is still not asked because too few History cards answer it (writings are most of History). Should that question be asked anyway?

## Batch F (6 Nov) — timelines
- History's textbook chapters (32) now answer **Works** under "Manuscripts, people, works, events or timelines" so every History card answers it. Would you rather they had their own answer (e.g. "Textbook chapters")?
- Old Testament dates follow the traditional early chronology (Exodus c. 1446 BC; many scholars say c. 1250 BC — the date line says so). Keep, or another chronology?
- The starter timelines are Church history, WWI, WWII, Old Testament, Roman Empire and Space race. Which next (British monarchy, Reformation, Cold War…)? And should a timeline loop at the end rather than stop?

## Friction fixes (6 Nov) — homework
- **Homework: let a tutor assign a paper/question set to a student; student sees 'Homework' in Find; tutor sees results — build it? (y/n)** Today the friction walk counts three journeys as impossible or a dead end for want of it: a tutor setting homework, a tutor seeing a student's results, a student opening what was set. It would need a new sheet tab (who set what for whom, due when) and a results view; nothing was built until you say.

## Sweep 6 Nov — open suggestions that are visible design (not done without a yes)
- Students search card: drop the column-name widget and the Find button, and copy the search widget to the column on its right? (y/n)
- Favourite links as an icon grid (site icons) instead of a list? (y/n)
- Speed reader: make "Read it" a button? (y/n)
- A past-paper question's tag reads "Paper 3x…" instead of "Paper 3" — relabel as "Paper 3" with "Section A/B" as tags? (y/n)
