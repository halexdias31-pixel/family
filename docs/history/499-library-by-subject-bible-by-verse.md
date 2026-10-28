# 499 — The Library by subject, the Bible by verse, a writing's own words, the shop's tags, the e-ink date

Owner's notes (Ledger `claude_notes`), 28 Oct 2026.

## 1. Library → any subject showed Books, Boxing and History
> "when I click library then any subject, I see books, boxing and history. that makes no sense, why? make it more stable,
> logical and coherent."

**Why.** Every facet's answers are already counted from the items matching the path so far (`facetTally_` over
`stuffFiltered()`), and Library → *a* subject offers only that subject's shelves. The owner pressed **Any subject**.
Then Shelf was the next question, and its three answers were the subjects again under other names: Books is Religious
Studies, Boxing was the Boxing subject, History is History. Asking it undoes the Any.

**The rule** (`facetEcho_`, find.js, inside `facetWhy_` so it holds for every facet): a question is not asked when every
item it can answer sits inside one answer of a question answered Any, a different one per answer — it is that
question again. Which book (Bible, Quran, Talmud — all Religious Studies) is a real split and is still asked.

**Check:** flow journey "Library → a subject offers only shelves that subject has…" (499): for every subject under
Library, every item is of that subject and every shelf offered has an item of it; Boxing is not a subject; Physical
Education holds the boxers; Library → Any subject does not ask Shelf. With `facetEcho_` switched off it fails with
"Library → Any subject asks Shelf (Books, Boxing, History)".

## 2. Boxing is PE
> "boxing I think should be under PE"

Boxers and bouts answer Subject **Physical Education** (`shelf` stays Boxing, so PE → Boxers or fights).

## 3. The Bible a verse a card, two translations, and no titles over tags
> "bible seems to be one widget. each verse should be a widget like quran. wasn't it like this before? also can we add
> another translation which is open source? also the tiles all appearing on same line. also the widget doesn't really
> need a title as the tags are titles. honestly this is true for virtually everything in finder"

- **The cover went.** `bibleItems_` returns the 31,102 verse items once the index arrives, every one `min_age` 18, on the
  everyday list as the Quran's are; `bibleInside_`/`bibleFind_`/`bibleHolds_` and the cover card are gone. Who sees it
  is unchanged: `bibleFor_` is `isAdmin()` (check-bible), so a non-admin's list costs nothing. The six Bible questions
  are ordinary facets after Which book. A verse's Chapter tile, stars and Saved keys (`bible:kjv:…`) are as before.
- **The World English Bible** beside the KJV on every card: `data/bible/web/NN-book.json`, `tools/bible-web.py` from
  `https://ebible.org/Scriptures/engwebp_vpl.zip` (the Protestant-canon WEB, verse per line). **Public domain** —
  ebible.org: "The World English Bible is in the Public Domain"; the name is eBible.org's trademark, used for the text
  verbatim as they ask. Held to the KJV's verse numbers: 3 WEB verses past a KJV chapter's end are joined onto its last
  verse, 7 KJV verses have no WEB text (the card shows the KJV alone). Fetched with the book, only when a card is drawn.
  `index.json` names it under `also`; check-bible holds every file to the KJV's counts.
- **The tags are the title** (`tagsAreTitle_`, in `stuffCard`, every kind): a card's name heading is dropped when every
  word of it is already a tag on its row (Genesis 1:1, First Clement Chapter 2); the name stays as the card's
  `aria-label` (role group), as is a card that never had a heading (a verse, a daf, a bout). A name the tags do not say
  (a shop item, a boxer) keeps its heading. The checks that held every card to a `.fc-head` (421, 471) take either.
- The tile row under a verse is the tiles helper's (`tiles.js`), not changed here.

## 4. First Clement, the work itself
> "this should be the work itself, in my database, each page can be a widget, treat it how you treat the Talmud"

`js/works.js`, `data/works/`: one card a chapter a language (Prologue and 1–65, Greek and English: 132 cards), kind
`worktext`, on the History shelf under Manuscripts, figures, writings, events **or texts** → Texts, tags Work, Chapter,
Language (`wtWork`, `wtChapter`, `wtLanguage`, facets 37.96–37.98). The index arrives when a finder paints; the work's
file (200 KB) only when one of its cards is drawn. The writing's own card has a **Read it** tile to the first page.
18+ as scripture (the index may say otherwise per work).

Sources (`data/works/LICENSE`, `tools/works-text.py`):
- **Greek:** Kirsopp Lake's text, *The Apostolic Fathers* I (1912) — public domain; the transcription is First1KGreek
  (Open Greek and Latin, tlg1271.tlg001.1st1K-grc1), **CC BY-SA 4.0**, credited on every Greek card; apparatus notes
  left out.
- **English:** J. B. Lightfoot's translation (1891) — **public domain** (he died 1889), as CCEL prints it.

Other writings that could be done the same way: the table holds only First Clement. Rows worth adding with public-domain
texts: Caesar's *Gallic War* (Latin; McDevitte and Bohn's 1869 English), the Didache, the letters of Ignatius and
Polycarp (Lightfoot again), and the wartime speeches of Roosevelt, Truman and Eisenhower (US government works). Not
Churchill (in copyright in the UK until 2036).

## 5. The shop's tags
> "these need to have all the tags instead. that tag information is way more helpful. it's also more automatable"

A shop item's card is its tag row in place of the prose description: Category (from its kind), How you get it (Buy,
Earn with ticks, Unlock by level, Borrow, Given out), Price (Free, Credits, Under £5, £5 to £20, Over £20, Not priced
yet, Level N), Brand, For (when not everybody) — `shopTags_`, five facets (38.1–38.5), each read off a field the row
already has. The exact price and whether you can afford it stay as the one line under the name; "not priced yet" is
the tag alone.

## 6. The icons' masters
> "is this the best quality which can still be achieved? in the database it's the highest quality image data it can
> hold and just formatted to fit here?"

It was not: 483 kept only the 120x160 1-bit bitmaps. Each icon now has a master, `data/icons/master/<id>.jpg` —
the same public-domain Commons file through `commons.wikimedia.org/w/thumb.php` at 600px, greyscale, ≤ 80 KB
(72 files, 5.2 MB) — and `make-icons.js` makes the bitmap from it, stretched to its own 2nd–98th percentile first
(a dim scan dithered to grey mush without it). check-eink: every row has its master, every master its row.

## 7. Today's date on the e-ink screen
> "add another category, something secular, like today's date. then a list of what they can pick: bible verses,
> today's date, or icons. except make the icons and bible verses only available to admin, because it's religious."

- **Widget:** a native select, *Today's date* for everybody, *Bible verses* and *Icons* added for an admin
  (`EINK_MODES`, `einkMode_` falls back to the date for anybody else whatever was kept). The date page is the
  weekday, the day's number at four times the size, the month, the rule and the year in italic — drawn by `einkPage_`
  pixel for pixel as the firmware draws it (`setTextSize(4)` is a z-by-z square per glyph dot).
- **Firmware** (verse.cpp, "READY epaper-verse 499"): mode 3 `SHOW DATE` draws the same page from the board's PCF85063
  (I2C 0x51, SDA 47, SCL 48, from Waveshare's 02_I2C_PCF85063 demo, registers 0x04–0x0A in BCD); `TIME y mo d h mi s
  weekday` sets it, and Sync sends it before every SHOW. In date mode the board wakes 30 s after midnight by the clock;
  a clock that lost power (the OS flag) says "Plug in and Sync to set the date". Built with build.sh (PlatformIO,
  PIO_JOBS=2): sha256 `0365c74cb9b0876a9bc642ca3e7e136b5d7acb10219b23f1b0b6a181d4e67b4f`, MD5
  `718fd5b149e78cc97d9d67a198a9f8f4`. Not yet tried on a board.

## 8. What a child can see
> "check elsewhere on the site if there is anywhere else which I have a blind spot and would be a controversy that a
> child can see it"

Gated here: the e-ink verses and icons (admin); the history database's religious rows — Papyrus 52, Codex
Alexandrinus, Clement of Rome, First Clement and its text — 18+ (`min_age`, a new optional column, check-history-db);
a bout's **Watch** link (fight footage) is left off for under-13s and anybody of no known age (`FIGHT_VIDEO_AGE`).
Left for the owner: the Second World War timeline and figures (Hitler, Stalin; Wannsee, Hiroshima), the History and
Psychology teaching animations (Weimar to Hitler, Milgram's dial), GCSE content on abortion, euthanasia, drugs and
crime (Religion and life, Health), the festive cards for religious holidays, and the reels and posts (already behind
`media` ages and the staff who post them). All are curriculum or the owner's own; none was hidden.

css 2026-10-28-n4b-library-by-subject.
