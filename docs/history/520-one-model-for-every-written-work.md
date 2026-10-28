# 520 — One model for every written work

The owner: "texts and writings?? what's the difference?" — and answering Doesn't matter seemed to add writings. The audit of
2026-10-28 found one kind of thing — a unit of a written work — built by nine loaders with nine kinds and nine private
facet sets, on three shelves, gated four ways, with the same books in two or three places. The owner wants universal
rules, not exceptions. What changed, rule by rule:

**R1, one shape.** `js/writings.js` (loaded before the loaders) holds `writingUnit_(src, reg, o)`. Every loader — the
Bible (find.js), talmud.js, quran.js, hadith.js, works.js, texts.js, pdtexts.js, orthodox.js, hymns.js — maps its index
onto it, so every card has the same keys: `kind key name sub text image row w wSrc shelf subject topic min_age` and one
pointer to its words (`tx wt ot hy qr hd tal`). `w` is the one facet set: Work, Text, Tradition, Collection, Section,
Book, Chapter, Unit, Author, Kind of writing (`wWork` … `wForm`). The Bible's 150,000 verses read the same keys off `bb`
(`bibleW_`) rather than each carrying an object. The loaders stay separate: their files and words differ, their cards do not.

How each source maps (the Section is a group of books above Book; the Unit is the card):

| source | Work | Collection | Section | Book | Chapter | Unit |
|---|---|---|---|---|---|---|
| Bible | Bible | testament, or Deuterocanon / Apocrypha / Anagignoskomena; Psalter, Kathisma n | group (Torah, Gospels) | book | chapter | verse |
| Quran | Quran | | juz | | surah | ayah |
| Hadith | Hadith | which of the six | | book | | number |
| Talmud | Talmud | Mishnah and Talmud | order | tractate | perek | daf side |
| Mishnah (texts) | Mishnah | Mishnah and Talmud | | tractate | chapter | mishnah |
| KJV Apocrypha (texts) | Bible | Deuterocanon / … | | book | chapter | verse |
| other texts, works, orthodox | the work | its collection | | | chapter | verse or section |
| pdtexts | the work | anthology | | book | act, poem | scene, stanza |
| hymns | the hymnal | Hymns | hymnal section | | | the hymn |

Dropped as private facets: the Bible's Testament and Group (now Collection and Section), Quran's Revealed and
Prostration, the hymns' Feast or season and Tune (still in the card and its search words), Orthodox Church era, Talmud
Daf and Side (one Unit, `2a`). The old fields are in `RETIRED_FACETS`: a kept chip on one is dropped, and a sheet row cannot bring one back.

**R2, one shelf.** Everything written is on `Writings` (no Texts, no Hymns shelf; `QURAN_SHELF`/`TALMUD_SHELF` brand keys
went). Literature and history keep their subject (English Literature, History) on that shelf. `histKind` is only on the
history database's rows, and its word for a writing is now `Works`, so no value is both a shelf and a histKind.

**R3, tradition is the topic.** `WRITING_WORKS` (the registry) gives each source or index id its religion: the Bible, the
Apocrypha, the Fathers, the church texts and the hymns are Christianity; the Talmud, the Mishnah, the Zohar, 1 Enoch,
Jubilees, Josephus and Aristeas Judaism; the Quran and the Hadith Islam; Gilgamesh Mesopotamian religion. They are rows of
`data/topics.json` for Religious Studies. The church within it (Orthodox, Catholic, Methodist…) is the Tradition facet,
one for the Orthodox texts and the hymns, which had one each with the same label.

**R4, the funnel's set is fixed when it starts.** Every index's arrival goes through `writingCame_(src)`. A finder takes
the set that has come at its first press (`writingFreeze_` in `facet-pick` and `facet-skip`) and `stuffItems` keeps to it
(`writingAdmit_`); at a fresh start (no chip, no words) it takes everything again. A kept place restored at boot is not a
press, so it still fills in. Before this, an index landing after the first paint joined at whatever repaint came next —
usually the next Doesn't matter, which looked like the answer adding writings.

**R5, one age.** `writingAge_(entry)`: a religious work is `scriptureMinAge_()` (so the `scripture-age` rule turns all of
them off at once), anything else none. works.js no longer reads the raw 18; Josephus is no longer 0 beside 1 Enoch's 18.

**R6, one registry, nothing twice.** The KJV Apocrypha are books of the Bible in the one collection named
"Deuterocanon / Apocrypha / Anagignoskomena", the name the Septuagint's and Brenton's books carry too. The Mishnah's
tractates are the Talmud's Books. A writing is databased only as its content units — the owner: "I would rather only database the actual content within
it like I do Talmud or Bible or Quran otherwise it gets all finicky." So the two `data/writings.json` rows (First Clement,
the Letter of Aristeas), profile cards of works that have pages, went: their author, kind, date (so Era), manuscripts and
events moved onto `data/works/index.json` and so onto every page as tags, and a figure's, manuscript's or event's link to
`WR-0001` lands on the work's first page (`worksRowOf_`). check-history-db resolves WR- ids against the works index and
allows the writings table to be empty; a row may stand only for a work with no pages (a named-only copyrighted work, or
an artefact such as a Qumran fragment, which is a manuscript). And
a content card about a work ("Macbeth: characters") answers that Work beside the play's own cards (`writingLinkOf_`).

**R7 and R8.** facets.json lists every FACETS field and nothing else; no writing facet shares a label with another (Month, Year and Level, shared by boxing, fives and exams, are reported, not failed — merging those is a question for another day); Text is built from
fields (`writingText_`: "English, King James Version (1611)") from `WRITING_TEXTS` or a label parsed by
`writingTextOf_`, never written per source.

**Checks.** `js/check-writings.js` builds every loader's cards from the real indexes and holds them to all of the above.
Each failure was proven by a mutation and the real files went green again. The flow journey "writings (520): answering
Doesn't matter at every step…" holds every index back until after the first answer and walks the funnel.
