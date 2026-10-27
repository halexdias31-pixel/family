# 490 — The owner's notes, round two: the Library

Owner's notes (Ledger `claude_notes` N-1793132369174-82, N-…698, N-…819), 27 Oct 2026.

## 1. Content is the Library
> "change the word content to library because it's the library for all the resources"

Every kind that answered *What kind · Content* (content cards, inserts, the history database, boxers, bouts, the Bible, the Talmud, now the Quran)
answers **Library**. Internal names (`content`, `contentCard_`, `tb*`) stay. A sheet `kinds` row still saying `Content` is read as `Library`
(`kindMap_`), and a kept chip on `Content` is retired (`RETIRED_ANSWERS`). Checks that walked `kindLabel: 'Content'` walk `Library`.

## 2. The Talmud: a page is the card
> "you have to open it up and then it looks nice, but it's unintuitive. I was expecting a content card but it would be one page of the Talmud
> and you can resize the text so it's to scale… something which replicates the page of a Talmud but fits onto the widget"

One item per **side** (`tal:<slug>:<daf><a|b>`, a new `talSide` facet, "Side a"/"Side b"). The card is tags, then the Vilna page itself
(`talPage_`/`talLayout_` unchanged from 473, so Gemara centre, Rashi inner, Tosafot outer). The page is fitted to the card: `--tal-fs` is the
card width / 40 times the viewer's scale. Two tiles, **Text −** and **Text +**, step the scale through 0.6–2×, kept in `localStorage`
(`tal:scale`, try/catch). The file of ten dafim is fetched only when the card's pane is reached (`paneReach_` → `talCardsFit_`), never in boot.
The sheet viewer (`tal-open`, `tal-step`, `tal-side`) is gone: there is nothing to open.

## 3. The Quran
> "I would like to add the Quran… each verse can be a widget, each verse can have tags… all tags like everything else"

`js/quran.js`, `data/quran/` (index + 114 surah files, 2.4 MB, written by `tools/quran-split.py`). One item a verse (6,236), tags as ordinary
facets: Surah (`2 · Al-Baqara`, in mushaf order via `ANSWER_ORDERS`), Ayah, Juz, Revealed (Meccan/Medinan), Prostration (the 15 sajdah verses).
The index arrives when a finder paints (as the Talmud's); a surah's text only when one of its cards is drawn.

It follows the Talmud's way rather than the Bible's cover-then-inside engine: the Bible's 31k verses needed a cover so they never sat on
the everyday list; the Quran's 6k sit there as the Talmud's dafim do, so one ordinary funnel asks them.

Sources and licences:
- **Arabic:** Tanzil Quran Text (Simple, Version 1.1), © Tanzil Project, CC BY 3.0 with the condition that copies are verbatim, credited and
  linked to tanzil.net. Copied verbatim, one verse per array entry; the notice is in `data/quran/LICENSE`, a short notice in every surah file,
  and a credit line on every card. Fetched from tanzil.net (reachable).
- **English:** Marmaduke Pickthall, *The Meaning of the Glorious Koran* (1930). Pickthall died in 1936, so it has been public domain in the UK
  since 1 Jan 2007 (life + 70). Text via api.alquran.cloud (edition `en.pickthall`), which also gave the juz and sajdah tables.

## 4. An age limit
> "a document or text… should only be for those who are of age, like 18 … anything religious like the Bible or the Quran … needs to have an age limit"

`min_age` is a general item field (on the item, or on its row from any sheet tab): `stuffItemsAll_` drops an item whose `min_age` is above
`viewerAgeCap_()` (games.js, 406/450: an admin everything; a known date of birth its age; signed out or no date of birth, 0). Everything
listed or opened goes through that list, so hidden means not listed and not openable. The memo key carries the cap. The Talmud and the Quran
carry `min_age: 18` (`SCRIPTURE_MIN_AGE`) and are not even fetched for a viewer under it (`talmudFor_`, `quranFor_`); the Bible's cover carries
it too and stays admin-only as before (check-bible holds `bibleFor_` to `isAdmin()`). Journey: "an age limit (490)".

## 5. Manuscripts as they look
> "all the tags at the top and then the fragment how it looks in real life but recreated as SVG… plus info such as when it was discovered and
> when it's believed to be from"

A manuscript card is tags, then `msFragSvg_` — an original drawing, not a photograph: the real text (John 18:31–33 for P52; John 1:1–5 in two
columns for Alexandrinus) in Greek uncials, scriptio continua, on a papyrus/parchment leaf, clipped to a torn outline drawn from which letters of
each line survive (`MS_LOOK[id].keep`). Then one facts line: *Found · Dated · Held*. A Commons photo was not used: UK status of photographs of
2D works is unsettled and the Rylands' own images are not openly licensed, so a drawing is the safe choice. A manuscript without a `MS_LOOK`
entry draws as before.

## 6 and 7. One unit, tags first; boxing in the Library
> "with the boxes you have 'Who versus Who'. It's redundant: just have the tags of both boxes' names"; "boxing stuff should be in the library"

The fight card lost its `A v B` title; it starts with its tags (Fighter ×2, Month, Year, Decade, Division, Round, Result, and new **Event** and
**Winner** facets; the winner's face is still framed). Boxers and bouts were already Library-kind (Content before 445), on the Boxing shelf.

Audit, one unit per item: a question part, a content card (one chapter), an insert, a practical, a project, a boxer, a bout, a manuscript,
figure, writing, event, a timeline (one era), a Bible verse, a Talmud side, a Quran verse — each is one card with its tags. The two that are
still "one opens many" are the Bible's cover (admin only, the way into 31k verses) and a timeline (a list of its events, each a tile to its own card).
